import 'dotenv/config';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import pino from 'pino';
import QRCode from 'qrcode';

// ── Supabase Client (Service Role for full access) ──
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Helpers ──
async function updateStatus(status, qrCode = null) {
  // Try to use the API first if available, otherwise fallback to Supabase
  try {
    const response = await fetch('/api/whatsapp/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, qrCode })
    });
    if (response.ok) return;
  } catch (e) {
    // Fallback to Supabase
  }

  const { error } = await supabase
    .from('whatsapp_status')
    .update({ status, qr_code: qrCode, updated_at: new Date().toISOString() })
    .eq('id', 1);
  
  if (error) console.error('Erro ao atualizar status:', error.message);
}


async function getSettings() {
  const { data, error } = await supabase
    .from('bot_settings')
    .select('*')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Erro ao buscar configurações:', error.message);
    return null;
  }
  return data;
}

async function addLog(phoneNumber, message, response) {
  const { error } = await supabase
    .from('chat_logs')
    .insert({ phone_number: phoneNumber, message, response });
  
  if (error) console.error('Erro ao salvar log:', error.message);
}

// ── WhatsApp Connection ──
let sock = null;

async function connectToWhatsApp() {
  console.log('🔄 Iniciando conexão com WhatsApp...');
  await updateStatus('connecting');

  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 QR Code gerado! Salvando no Supabase...');
      // Convert QR to data URL for display in the dashboard
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, { width: 300 });
        await updateStatus('qr', qr); // Save raw QR string (QRCodeSVG in frontend renders it)
        console.log('✅ QR Code salvo no Supabase. Escaneie pelo painel.');
      } catch (err) {
        await updateStatus('qr', qr);
      }
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`❌ Conexão fechada. Código: ${statusCode}. Reconectar: ${shouldReconnect}`);
      await updateStatus('disconnected');

      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 3000);
      } else {
        console.log('🚪 Logout detectado. Aguardando reconexão manual.');
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp conectado com sucesso!');
      await updateStatus('connected');
    }
  });

  // ── Message Handler ──
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    if (!sender || sender.includes('@g.us')) return; // Ignore groups

    const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!textMessage) return;

    console.log(`📩 Mensagem de ${sender}: ${textMessage}`);

    const settings = await getSettings();
    if (!settings || !settings.is_active || !settings.groq_api_key) {
      console.log('⚠️ Bot desativado ou sem API key. Ignorando mensagem.');
      return;
    }

    const fullSystemPrompt = `
${settings.system_prompt}

Informações da Empresa:
Nome: ${settings.company_name || 'Não informado'}
Dono: ${settings.owner_name || 'Não informado'}
Produtos/Serviços: ${settings.products || 'Não informado'}
Chave PIX para pagamento: ${settings.pix_key || 'Não informado'}

Instruções Adicionais e Comandos:
${settings.custom_commands || 'Não informado'}

Regras:
- Use as informações acima para responder ao cliente.
- Se o cliente quiser pagar, forneça a chave PIX.
- Seja sempre profissional e foque na venda.
    `.trim();

    try {
      const groq = new Groq({ apiKey: settings.groq_api_key });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: fullSystemPrompt },
          { role: 'user', content: textMessage },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const replyText = chatCompletion.choices[0]?.message?.content;
      if (replyText) {
        await sock.sendMessage(sender, { text: replyText });
        await addLog(sender.split('@')[0], textMessage, replyText);
        console.log(`📤 Resposta enviada para ${sender}`);
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem com Groq:', error.message);
    }
  });
}

// ── Scheduled Messages Processor ──
async function processScheduledMessages() {
  if (!sock || currentStatus !== 'connected') return;

  try {
    const now = new Date().toISOString();
    const { data: pending, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(10);

    if (error || !pending || pending.length === 0) return;

    for (const msg of pending) {
      try {
        // Format phone number for WhatsApp (ensure @s.whatsapp.net suffix)
        let jid = msg.phone_number;
        // Remove non-numeric chars
        jid = jid.replace(/[^0-9]/g, '');
        if (!jid.includes('@')) {
          jid = jid + '@s.whatsapp.net';
        }

        await sock.sendMessage(jid, { text: msg.message });
        
        await supabase
          .from('scheduled_messages')
          .update({ status: 'sent' })
          .eq('id', msg.id);
        
        console.log(`📤 Mensagem agendada enviada para ${msg.phone_number}`);
        
        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (sendError) {
        console.error(`❌ Falha ao enviar para ${msg.phone_number}:`, sendError.message);
        await supabase
          .from('scheduled_messages')
          .update({ status: 'failed' })
          .eq('id', msg.id);
      }
    }
  } catch (e) {
    console.error('Erro no processador de mensagens agendadas:', e.message);
  }
}

// Track connection status for the processor
let currentStatus = 'disconnected';
const originalUpdateStatus = updateStatus;

// ── Monitor for reconnect requests from dashboard ──
let isConnecting = false;

async function monitorDashboardCommands() {
  setInterval(async () => {
    try {
      const { data } = await supabase
        .from('whatsapp_status')
        .select('status')
        .eq('id', 1)
        .single();

      currentStatus = data?.status || 'disconnected';

      if (data?.status === 'connecting' && !isConnecting) {
        console.log('📡 Reconexão solicitada pelo painel. Iniciando...');
        isConnecting = true;
        if (sock) {
          try { sock.end(undefined); } catch (_) {}
          sock = null;
        }
        await connectToWhatsApp();
        isConnecting = false;
      }
    } catch (e) {
      console.error('Erro no monitor:', e.message);
    }
  }, 3000);
}

// ── Start ──
console.log('🚀 WhatsApp Bot Server iniciando...');
console.log(`📡 Supabase: ${supabaseUrl}`);
connectToWhatsApp();
monitorDashboardCommands();

// Process scheduled messages every 5 seconds
setInterval(processScheduledMessages, 5000);
console.log('📅 Processador de mensagens agendadas ativado (a cada 5s).');
