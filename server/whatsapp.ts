import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { storage } from './storage';
import Groq from 'groq-sdk';
import pino from 'pino';

export let currentQr: string | undefined = undefined;
export let connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'qr' = 'disconnected';

let sock: ReturnType<typeof makeWASocket> | null = null;

export async function connectToWhatsApp() {
    connectionStatus = 'connecting';
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
    const { version } = await fetchLatestBaileysVersion();
    
    sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }) as any,
        printQRInTerminal: false,
        auth: state,
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('New QR Code generated');
            currentQr = qr;
            connectionStatus = 'qr';
        }
        
        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Status:', statusCode, 'Last error:', lastDisconnect?.error);
            
            currentQr = undefined;
            connectionStatus = 'disconnected';

            if (statusCode === 401) {
                console.log('Authentication failed (401). Clearing session data...');
                // Internal cleanup of auth state is handled by Baileys if we don't provide valid creds
                // but clearing the directory is the most reliable way to reset.
                try {
                    const fs = await import('fs');
                    const path = await import('path');
                    const authDir = 'baileys_auth_info';
                    if (fs.existsSync(authDir)) {
                        const files = fs.readdirSync(authDir);
                        for (const file of files) {
                            fs.unlinkSync(path.join(authDir, file));
                        }
                    }
                } catch (e) {
                    console.error('Error clearing auth dir:', e);
                }
            }

            if (shouldReconnect) {
                console.log('Attempting to reconnect...');
                setTimeout(() => connectToWhatsApp(), 3000);
            }
        } else if (connection === 'open') {
            console.log('opened connection');
            connectionStatus = 'connected';
            currentQr = undefined;
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const sender = msg.key.remoteJid;
        if (!sender || sender.includes('@g.us')) return; // Ignore groups
        
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!textMessage) return;

        const settings = await storage.getSettings();
        if (!settings.isActive || !settings.groqApiKey) return;

        const fullSystemPrompt = `
${settings.systemPrompt}

Informações da Empresa:
Nome: ${settings.companyName || 'Não informado'}
Dono: ${settings.ownerName || 'Não informado'}
Produtos/Serviços: ${settings.products || 'Não informado'}
Chave PIX para pagamento: ${settings.pixKey || 'Não informado'}

Instruções Adicionais e Comandos:
${settings.customCommands || 'Não informado'}

Regras:
- Use as informações acima para responder ao cliente.
- Se o cliente quiser pagar, forneça a chave PIX.
- Seja sempre profissional e foque na venda.
        `.trim();

        try {
            const groq = new Groq({ apiKey: settings.groqApiKey });
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: fullSystemPrompt },
                    { role: "user", content: textMessage }
                ],
                model: "llama-3.3-70b-versatile", 
                temperature: 0.7,
                max_tokens: 1024,
            });

            const replyText = chatCompletion.choices[0]?.message?.content;
            if (replyText) {
                await sock?.sendMessage(sender, { text: replyText });
                await storage.addLog({
                    phoneNumber: sender.split('@')[0],
                    message: textMessage,
                    response: replyText
                });
            }
        } catch (error) {
            console.error("Error processing message with Groq:", error);
        }
    });
}