// GroqBot Extension - Content Script for WhatsApp Web
// Builds dashboard UI directly (no iframe) and communicates via Supabase REST API

const SUPABASE_URL = "https://jlyqbwfuvdewvhaednvd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseXFid2Z1dmRld3ZoYWVkbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzY5MTAsImV4cCI6MjA4Nzc1MjkxMH0.GzLjvCxz-TPYCnzddtypNNsXOV8Jv-F3lHtEN5-zKIg";
const SIDEBAR_WIDTH = 360;
const DASHBOARD_URL = "https://groqbot.lovable.app";

// ===== Supabase REST helpers =====
async function supabaseGet(table, query = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function supabasePatch(table, id, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  return res.ok;
}

// ===== State =====
let currentStatus = "disconnected";
let currentQr = null;
let botActive = null;
let recentLogs = [];
let pollTimer = null;

// ===== UI Creation =====
function createSidebar() {
  if (document.getElementById("groqbot-sidebar")) return;

  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #groqbot-sidebar {
      position: fixed; right: 0; top: 0; width: ${SIDEBAR_WIDTH}px; height: 100vh;
      z-index: 9999; background: #0b141a; display: flex; flex-direction: column;
      box-shadow: -2px 0 16px rgba(0,0,0,0.4); border-left: 1px solid #2a3942;
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #e9edef; font-size: 13px; overflow: hidden;
    }
    #groqbot-sidebar * { box-sizing: border-box; margin: 0; padding: 0; }
    .gb-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: linear-gradient(135deg, #00a884, #25d366); flex-shrink: 0;
    }
    .gb-header-left { display: flex; align-items: center; gap: 10px; }
    .gb-header-icon {
      width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .gb-header-title { color: white; font-weight: 700; font-size: 15px; }
    .gb-header-sub { color: rgba(255,255,255,0.8); font-size: 11px; }
    .gb-close {
      background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px;
      border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center;
      justify-content: center; transition: background 0.2s;
    }
    .gb-close:hover { background: rgba(255,255,255,0.3); }
    .gb-body { flex: 1; overflow-y: auto; padding: 16px; }
    .gb-card {
      background: #1f2c33; border-radius: 12px; padding: 16px; margin-bottom: 12px;
      border: 1px solid #2a3942;
    }
    .gb-card-title {
      font-size: 13px; font-weight: 600; color: #e9edef; margin-bottom: 12px;
      display: flex; align-items: center; gap: 8px;
    }
    .gb-status-row { display: flex; align-items: center; gap: 12px; }
    .gb-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .gb-dot-connected { background: #00a884; box-shadow: 0 0 8px #00a884; }
    .gb-dot-disconnected { background: #ea4335; box-shadow: 0 0 8px #ea4335; }
    .gb-dot-connecting { background: #f9a825; animation: gb-pulse 1.2s infinite; }
    .gb-dot-qr { background: #f9a825; box-shadow: 0 0 8px #f9a825; animation: gb-pulse 1.5s infinite; }
    @keyframes gb-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .gb-status-text { font-size: 14px; font-weight: 600; }
    .gb-status-sub { font-size: 11px; color: #8696a0; margin-top: 2px; }
    .gb-qr-container {
      display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 8px 0;
    }
    .gb-qr-container img {
      width: 200px; height: 200px; border-radius: 10px; background: white; padding: 8px;
    }
    .gb-qr-text { font-size: 12px; color: #8696a0; text-align: center; }
    .gb-connected-box { text-align: center; padding: 16px 0; }
    .gb-connected-icon { font-size: 40px; margin-bottom: 8px; }
    .gb-connected-title { font-size: 16px; font-weight: 600; color: #00a884; }
    .gb-connected-sub { font-size: 12px; color: #8696a0; margin-top: 4px; }
    .gb-btn {
      width: 100%; padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer;
      font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center;
      gap: 8px; transition: all 0.2s; margin-top: 12px;
    }
    .gb-btn-primary { background: #00a884; color: white; }
    .gb-btn-primary:hover { background: #008f72; }
    .gb-btn-secondary { background: #2a3942; color: #e9edef; border: 1px solid #3b4a54; }
    .gb-btn-secondary:hover { background: #3b4a54; }
    .gb-btn-danger { background: #ea4335; color: white; }
    .gb-btn-danger:hover { background: #d33426; }
    .gb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .gb-log-item {
      padding: 10px 0; border-bottom: 1px solid #2a3942;
    }
    .gb-log-item:last-child { border-bottom: none; }
    .gb-log-phone { font-size: 12px; font-weight: 600; color: #00a884; }
    .gb-log-time { font-size: 10px; color: #8696a0; margin-left: 8px; }
    .gb-log-msg { font-size: 12px; color: #e9edef; margin-top: 4px; 
      background: #111b21; padding: 6px 10px; border-radius: 8px; }
    .gb-log-resp { font-size: 12px; color: #8696a0; margin-top: 4px;
      padding: 6px 10px; border-radius: 8px; border-left: 2px solid #00a884; }
    .gb-empty { text-align: center; padding: 24px; color: #8696a0; font-size: 12px; }
    .gb-footer {
      padding: 10px 16px; border-top: 1px solid #2a3942; flex-shrink: 0; text-align: center;
    }
    .gb-footer a { color: #00a884; font-size: 11px; text-decoration: none; }
    .gb-footer a:hover { text-decoration: underline; }
    .gb-spinner {
      width: 20px; height: 20px; border: 3px solid #2a3942; border-top-color: #00a884;
      border-radius: 50%; animation: gb-spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes gb-spin { to { transform: rotate(360deg); } }
    .gb-toggle {
      position: fixed; right: ${SIDEBAR_WIDTH}px; top: 50%; transform: translateY(-50%);
      z-index: 10000; width: 36px; height: 48px; border-radius: 10px 0 0 10px;
      border: 1px solid #2a3942; border-right: none; background: #00a884; color: white;
      cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;
      box-shadow: -2px 0 8px rgba(0,0,0,0.2); transition: right 0.3s cubic-bezier(0.4,0,0.2,1), background 0.2s;
    }
    .gb-toggle:hover { background: #008f72; }
    .gb-bot-switch { display: flex; align-items: center; justify-content: space-between; }
    .gb-switch-track {
      width: 44px; height: 24px; border-radius: 12px; cursor: pointer; position: relative;
      transition: background 0.2s; flex-shrink: 0;
    }
    .gb-switch-track.on { background: #00a884; }
    .gb-switch-track.off { background: #3b4a54; }
    .gb-switch-thumb {
      width: 20px; height: 20px; border-radius: 50%; background: white; position: absolute;
      top: 2px; transition: left 0.2s;
    }
    .gb-switch-track.on .gb-switch-thumb { left: 22px; }
    .gb-switch-track.off .gb-switch-thumb { left: 2px; }
  `;
  document.head.appendChild(style);

  // Sidebar
  const sidebar = document.createElement("div");
  sidebar.id = "groqbot-sidebar";
  sidebar.innerHTML = `
    <div class="gb-header">
      <div class="gb-header-left">
        <div class="gb-header-icon">🤖</div>
        <div>
          <div class="gb-header-title">GroqBot</div>
          <div class="gb-header-sub">Assistente de Vendas IA</div>
        </div>
      </div>
      <button class="gb-close" id="gb-close">✕</button>
    </div>
    <div class="gb-body" id="gb-body">
      <div style="display:flex;align-items:center;justify-content:center;padding:40px;">
        <div class="gb-spinner"></div>
      </div>
    </div>
    <div class="gb-footer">
      <a href="${DASHBOARD_URL}" target="_blank">Abrir Dashboard Completo →</a>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "gb-toggle";
  toggleBtn.id = "gb-toggle";
  toggleBtn.innerHTML = "🤖";
  toggleBtn.title = "GroqBot - Painel de Controle";
  document.body.appendChild(toggleBtn);

  // Adjust WhatsApp layout
  const adjustLayout = (open) => {
    const appEl = document.getElementById("app") || document.querySelector("[data-app-target]");
    if (appEl) {
      appEl.style.transition = "margin-right 0.3s cubic-bezier(0.4,0,0.2,1)";
      appEl.style.marginRight = open ? `${SIDEBAR_WIDTH}px` : "0";
    }
  };

  let isOpen = true;
  adjustLayout(true);

  const toggle = () => {
    isOpen = !isOpen;
    sidebar.style.transform = isOpen ? "translateX(0)" : `translateX(${SIDEBAR_WIDTH}px)`;
    toggleBtn.style.right = isOpen ? `${SIDEBAR_WIDTH}px` : "0";
    adjustLayout(isOpen);
  };

  document.getElementById("gb-close").onclick = toggle;
  toggleBtn.onclick = toggle;

  // Start polling
  fetchAndRender();
  pollTimer = setInterval(fetchAndRender, 3000);
}

// ===== Fetch data & render =====
async function fetchAndRender() {
  try {
    const [statusData, settingsData, logsData] = await Promise.all([
      supabaseGet("whatsapp_status", "id=eq.1&select=*"),
      supabaseGet("bot_settings", "id=eq.1&select=is_active"),
      supabaseGet("chat_logs", "select=*&order=created_at.desc&limit=10"),
    ]);

    if (statusData && statusData[0]) {
      currentStatus = statusData[0].status || "disconnected";
      currentQr = statusData[0].qr_code;
    }
    if (settingsData && settingsData[0]) {
      botActive = settingsData[0].is_active;
    }
    recentLogs = logsData || [];
  } catch (e) {
    console.error("GroqBot: erro ao buscar dados", e);
  }
  renderBody();
}

function renderBody() {
  const body = document.getElementById("gb-body");
  if (!body) return;

  const dotClass = currentStatus === "connected" ? "gb-dot-connected"
    : currentStatus === "qr" ? "gb-dot-qr"
    : currentStatus === "connecting" ? "gb-dot-connecting"
    : "gb-dot-disconnected";

  const statusLabel = currentStatus === "connected" ? "Conectado"
    : currentStatus === "qr" ? "QR Code Disponível"
    : currentStatus === "connecting" ? "Conectando..."
    : "Desconectado";

  const statusSub = currentStatus === "connected" ? "Bot respondendo mensagens automaticamente"
    : currentStatus === "qr" ? "Escaneie o QR Code com seu WhatsApp"
    : currentStatus === "connecting" ? "Aguardando servidor gerar QR Code..."
    : "Clique em Iniciar Conexão para conectar";

  let statusContent = "";
  if (currentStatus === "qr" && currentQr) {
    statusContent = `
      <div class="gb-qr-container">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentQr)}" alt="QR Code" />
        <div class="gb-qr-text">Abra WhatsApp → Aparelhos conectados → Escanear</div>
      </div>`;
  } else if (currentStatus === "connected") {
    statusContent = `
      <div class="gb-connected-box">
        <div class="gb-connected-icon">✅</div>
        <div class="gb-connected-title">Bot Ativo</div>
        <div class="gb-connected-sub">Respondendo mensagens automaticamente</div>
      </div>`;
  } else if (currentStatus === "connecting") {
    statusContent = `
      <div style="text-align:center;padding:16px;">
        <div class="gb-spinner"></div>
        <div style="margin-top:12px;color:#8696a0;font-size:12px;">Gerando QR Code...</div>
      </div>`;
  }

  const connectBtnLabel = currentStatus === "connected" ? "Reconectar" : "Iniciar Conexão";

  const logsHtml = recentLogs.length > 0
    ? recentLogs.slice(0, 5).map(log => {
        const time = log.created_at ? new Date(log.created_at).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }) : "";
        return `
          <div class="gb-log-item">
            <span class="gb-log-phone">${log.phone_number}</span>
            <span class="gb-log-time">${time}</span>
            <div class="gb-log-msg">${escapeHtml(log.message)}</div>
            <div class="gb-log-resp">${escapeHtml(truncate(log.response, 120))}</div>
          </div>`;
      }).join("")
    : `<div class="gb-empty">Nenhuma conversa registrada ainda.</div>`;

  body.innerHTML = `
    <!-- Status Card -->
    <div class="gb-card">
      <div class="gb-card-title">📱 Conexão WhatsApp</div>
      <div class="gb-status-row">
        <div class="gb-dot ${dotClass}"></div>
        <div>
          <div class="gb-status-text">${statusLabel}</div>
          <div class="gb-status-sub">${statusSub}</div>
        </div>
      </div>
      ${statusContent}
      <button class="gb-btn gb-btn-primary" id="gb-connect">🔄 ${connectBtnLabel}</button>
      ${currentStatus === "connected" ? `<button class="gb-btn gb-btn-danger" id="gb-disconnect" style="margin-top:8px;">⛔ Desconectar</button>` : ""}
    </div>

    <!-- Bot Toggle Card -->
    <div class="gb-card">
      <div class="gb-bot-switch">
        <div>
          <div class="gb-card-title" style="margin-bottom:0;">🤖 Bot Automático</div>
          <div style="font-size:11px;color:#8696a0;margin-top:2px;">${botActive ? "Respondendo mensagens" : "Bot pausado"}</div>
        </div>
        <div class="gb-switch-track ${botActive ? 'on' : 'off'}" id="gb-bot-toggle">
          <div class="gb-switch-thumb"></div>
        </div>
      </div>
    </div>

    <!-- Recent Logs -->
    <div class="gb-card">
      <div class="gb-card-title">💬 Atividade Recente</div>
      ${logsHtml}
    </div>
  `;

  // Event listeners
  document.getElementById("gb-connect")?.addEventListener("click", async () => {
    const btn = document.getElementById("gb-connect");
    btn.disabled = true;
    btn.textContent = "⏳ Conectando...";
    await supabasePatch("whatsapp_status", 1, { status: "connecting", qr_code: null, updated_at: new Date().toISOString() });
    setTimeout(fetchAndRender, 1000);
  });

  document.getElementById("gb-disconnect")?.addEventListener("click", async () => {
    const btn = document.getElementById("gb-disconnect");
    btn.disabled = true;
    btn.textContent = "⏳ Desconectando...";
    await supabasePatch("whatsapp_status", 1, { status: "disconnected", qr_code: null, updated_at: new Date().toISOString() });
    setTimeout(fetchAndRender, 1000);
  });

  document.getElementById("gb-bot-toggle")?.addEventListener("click", async () => {
    botActive = !botActive;
    await supabasePatch("bot_settings", 1, { is_active: botActive });
    renderBody();
  });
}

// ===== Helpers =====
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

// ===== Init =====
function waitForWhatsApp() {
  const observer = new MutationObserver((mutations, obs) => {
    const app = document.getElementById("app");
    if (app && app.children.length > 0) {
      setTimeout(() => { createSidebar(); obs.disconnect(); }, 1500);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => { observer.disconnect(); createSidebar(); }, 5000);
}

waitForWhatsApp();
console.log("✅ GroqBot Extension carregada!");
