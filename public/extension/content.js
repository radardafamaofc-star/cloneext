// GroqBot Extension - Content Script for WhatsApp Web
// Clean, professional dashboard injected into WhatsApp Web DOM

const SUPABASE_URL = "https://jlyqbwfuvdewvhaednvd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseXFid2Z1dmRld3ZoYWVkbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzY5MTAsImV4cCI6MjA4Nzc1MjkxMH0.GzLjvCxz-TPYCnzddtypNNsXOV8Jv-F3lHtEN5-zKIg";
const SIDEBAR_WIDTH = 380;
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

async function supabasePost(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function supabaseDelete(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.ok;
}

// ===== State =====
let currentStatus = "disconnected";
let currentQr = null;
let botActive = null;
let botSettings = {};
let recentLogs = [];
let shortcuts = [];
let contacts = [];
let scheduledMessages = [];
let pollTimer = null;
let currentPage = "painel";

// ===== Menu Items =====
const menuItems = [
  { id: "painel", label: "Painel", icon: "📊" },
  { id: "atalhos", label: "Atalhos", icon: "⚡" },
  { id: "contatos", label: "Contatos", icon: "👥" },
  { id: "agendamentos", label: "Agendamentos", icon: "📅" },
  { id: "envio-massa", label: "Envio em Massa", icon: "📨" },
  { id: "configuracoes", label: "Configurações", icon: "⚙️" },
];

// ===== UI Creation =====
function createSidebar() {
  if (document.getElementById("groqbot-sidebar")) return;

  const style = document.createElement("style");
  style.textContent = `
    #groqbot-sidebar {
      position: fixed; right: 0; top: 0; width: ${SIDEBAR_WIDTH}px; height: 100vh;
      z-index: 9999; background: #0b141a; display: flex; flex-direction: column;
      box-shadow: -2px 0 16px rgba(0,0,0,0.4); border-left: 1px solid #2a3942;
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #e9edef; font-size: 14px; overflow: hidden;
    }
    #groqbot-sidebar * { box-sizing: border-box; margin: 0; padding: 0; }

    /* Header */
    .gb-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; background: linear-gradient(135deg, #00a884, #25d366); flex-shrink: 0;
    }
    .gb-header-left { display: flex; align-items: center; gap: 10px; }
    .gb-header-icon {
      width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 20px;
    }
    .gb-header-title { color: white; font-weight: 700; font-size: 16px; }
    .gb-header-sub { color: rgba(255,255,255,0.85); font-size: 11px; }
    .gb-close {
      background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px;
      border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center;
      justify-content: center; transition: background 0.2s;
    }
    .gb-close:hover { background: rgba(255,255,255,0.35); }

    /* Navigation Menu - Clean Vertical List */
    .gb-nav {
      display: flex; flex-direction: column; gap: 2px; padding: 12px 14px;
      background: #0b141a; border-bottom: 1px solid #1a2730; flex-shrink: 0;
    }
    .gb-nav-item {
      width: 100%; padding: 11px 14px; border: none; border-radius: 10px; cursor: pointer;
      font-size: 15px; font-weight: 500; color: #8696a0; background: transparent;
      display: flex; flex-direction: row; align-items: center; gap: 14px;
      transition: all 0.2s; text-align: left; letter-spacing: 0.01em;
      border-left: 3px solid transparent;
    }
    .gb-nav-item:hover { background: #1a2a33; color: #e9edef; }
    .gb-nav-item.active {
      background: rgba(0,168,132,0.12); color: #00a884; font-weight: 600;
      border-left-color: #00a884;
    }
    .gb-nav-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }

    /* Body */
    .gb-body {
      flex: 1; overflow-y: auto; padding: 18px;
    }
    .gb-body::-webkit-scrollbar { width: 4px; }
    .gb-body::-webkit-scrollbar-thumb { background: #2a3942; border-radius: 4px; }
    .gb-body::-webkit-scrollbar-track { background: transparent; }

    /* Cards */
    .gb-card {
      background: #1a2730; border-radius: 12px; padding: 16px; margin-bottom: 12px;
      border: 1px solid #243640;
    }
    .gb-card-title {
      font-size: 13px; font-weight: 600; color: #e9edef; margin-bottom: 12px;
      display: flex; align-items: center; gap: 8px;
    }

    /* Status */
    .gb-status-row { display: flex; align-items: center; gap: 12px; }
    .gb-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .gb-dot-connected { background: #00a884; box-shadow: 0 0 8px #00a884; }
    .gb-dot-disconnected { background: #ea4335; box-shadow: 0 0 8px #ea4335; }
    .gb-dot-connecting { background: #f9a825; animation: gb-pulse 1.2s infinite; }
    .gb-dot-qr { background: #f9a825; box-shadow: 0 0 8px #f9a825; animation: gb-pulse 1.5s infinite; }
    @keyframes gb-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    .gb-status-text { font-size: 14px; font-weight: 600; }
    .gb-status-sub { font-size: 11px; color: #8696a0; margin-top: 2px; }
    .gb-qr-container { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 12px 0; }
    .gb-qr-container img { width: 200px; height: 200px; border-radius: 10px; background: white; padding: 10px; }
    .gb-qr-text { font-size: 12px; color: #8696a0; text-align: center; }
    .gb-connected-box { text-align: center; padding: 16px 0; }
    .gb-connected-icon { font-size: 42px; margin-bottom: 8px; }
    .gb-connected-title { font-size: 16px; font-weight: 600; color: #00a884; }
    .gb-connected-sub { font-size: 12px; color: #8696a0; margin-top: 4px; }

    /* Buttons */
    .gb-btn {
      width: 100%; padding: 10px 16px; border: none; border-radius: 10px; cursor: pointer;
      font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center;
      gap: 6px; transition: all 0.2s; margin-top: 8px;
    }
    .gb-btn-primary { background: #00a884; color: white; }
    .gb-btn-primary:hover { background: #008f72; }
    .gb-btn-secondary { background: #2a3942; color: #e9edef; border: 1px solid #3b4a54; }
    .gb-btn-secondary:hover { background: #3b4a54; }
    .gb-btn-danger { background: #ea4335; color: white; }
    .gb-btn-danger:hover { background: #d33426; }
    .gb-btn-sm { padding: 7px 12px; font-size: 12px; width: auto; margin-top: 0; }
    .gb-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .gb-empty { text-align: center; padding: 30px 20px; color: #8696a0; font-size: 13px; }

    /* Footer with bot toggle */
    .gb-footer {
      padding: 14px 18px; border-top: 1px solid #1a2730; flex-shrink: 0;
      background: #111b21;
    }
    .gb-footer-bot {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .gb-footer-bot-info { display: flex; align-items: center; gap: 10px; }
    .gb-footer-bot-dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .gb-footer-bot-dot.on { background: #00a884; box-shadow: 0 0 6px #00a884; }
    .gb-footer-bot-dot.off { background: #ea4335; }
    .gb-footer-bot-label { font-size: 13px; font-weight: 600; color: #e9edef; }
    .gb-footer-bot-status { font-size: 10px; color: #8696a0; }
    .gb-footer-link { text-align: center; padding-top: 8px; border-top: 1px solid #1a2730; }
    .gb-footer-link a { color: #00a884; font-size: 11px; text-decoration: none; }
    .gb-footer-link a:hover { text-decoration: underline; }

    /* Switch */
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

    /* Spinner */
    .gb-spinner {
      width: 24px; height: 24px; border: 3px solid #2a3942; border-top-color: #00a884;
      border-radius: 50%; animation: gb-spin 0.8s linear infinite; display: inline-block;
    }
    @keyframes gb-spin { to { transform: rotate(360deg); } }

    /* Toggle button */
    .gb-toggle {
      position: fixed; right: ${SIDEBAR_WIDTH}px; top: 50%; transform: translateY(-50%);
      z-index: 10000; width: 40px; height: 52px; border-radius: 12px 0 0 12px;
      border: 1px solid #2a3942; border-right: none; background: #00a884; color: white;
      cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;
      box-shadow: -2px 0 8px rgba(0,0,0,0.2); transition: right 0.3s cubic-bezier(0.4,0,0.2,1), background 0.2s;
    }
    .gb-toggle:hover { background: #008f72; }

    /* Form inputs */
    .gb-input {
      width: 100%; padding: 10px 12px; border: 1px solid #3b4a54; border-radius: 8px;
      background: #111b21; color: #e9edef; font-size: 13px; outline: none;
      transition: border-color 0.2s;
    }
    .gb-input:focus { border-color: #00a884; }
    .gb-textarea {
      width: 100%; padding: 10px 12px; border: 1px solid #3b4a54; border-radius: 8px;
      background: #111b21; color: #e9edef; font-size: 13px; outline: none;
      resize: vertical; min-height: 70px; font-family: inherit;
    }
    .gb-textarea:focus { border-color: #00a884; }
    .gb-label { display: block; font-size: 12px; font-weight: 600; color: #8696a0; margin-bottom: 6px; margin-top: 12px; }
    .gb-label:first-child { margin-top: 0; }

    /* List items */
    .gb-list-item {
      display: flex; align-items: center; justify-content: space-between; padding: 12px;
      background: #111b21; border-radius: 10px; margin-bottom: 8px; gap: 10px;
    }
    .gb-list-item-info { flex: 1; min-width: 0; }
    .gb-list-item-title { font-size: 13px; font-weight: 600; color: #e9edef; word-break: break-word; }
    .gb-list-item-sub { font-size: 11px; color: #8696a0; margin-top: 3px; word-break: break-word; }
    .gb-list-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .gb-badge {
      display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600;
    }
    .gb-badge-green { background: rgba(0,168,132,0.2); color: #00a884; }
    .gb-badge-red { background: rgba(234,67,53,0.2); color: #ea4335; }
    .gb-badge-yellow { background: rgba(249,168,37,0.2); color: #f9a825; }
    .gb-badge-blue { background: rgba(66,133,244,0.2); color: #4285f4; }
    .gb-icon-btn {
      background: none; border: 1px solid #3b4a54; color: #8696a0; width: 30px; height: 30px;
      border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 13px; transition: all 0.2s;
    }
    .gb-icon-btn:hover { background: #2a3942; color: #e9edef; }
    .gb-icon-btn.danger:hover { background: #ea4335; color: white; border-color: #ea4335; }
    .gb-section-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
    }
    .gb-page-title { font-size: 16px; font-weight: 700; color: #e9edef; }
  `;
  document.head.appendChild(style);

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
    <div class="gb-nav" id="gb-nav"></div>
    <div class="gb-body" id="gb-body">
      <div style="display:flex;align-items:center;justify-content:center;padding:40px;">
        <div class="gb-spinner"></div>
      </div>
    </div>
    <div class="gb-footer" id="gb-footer"></div>
  `;
  document.body.appendChild(sidebar);

  renderNav();
  renderFooter();

  // Toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "gb-toggle";
  toggleBtn.id = "gb-toggle";
  toggleBtn.innerHTML = "🤖";
  toggleBtn.title = "GroqBot - Painel de Controle";
  document.body.appendChild(toggleBtn);

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

  fetchAllData();
  pollTimer = setInterval(fetchAllData, 4000);
}

function renderNav() {
  const nav = document.getElementById("gb-nav");
  if (!nav) return;
  nav.innerHTML = menuItems.map(item =>
    `<button class="gb-nav-item ${currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
      <span class="gb-nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>`
  ).join("");
  nav.querySelectorAll(".gb-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = btn.dataset.page;
      renderNav();
      renderBody();
    });
  });
}

function renderFooter() {
  const footer = document.getElementById("gb-footer");
  if (!footer) return;
  footer.innerHTML = `
    <div class="gb-footer-bot">
      <div class="gb-footer-bot-info">
        <div class="gb-footer-bot-dot ${botActive ? 'on' : 'off'}"></div>
        <div>
          <div class="gb-footer-bot-label">Bot Automático</div>
          <div class="gb-footer-bot-status">${botActive ? 'Respondendo mensagens' : 'Bot pausado'}</div>
        </div>
      </div>
      <div class="gb-switch-track ${botActive ? 'on' : 'off'}" id="gb-bot-toggle-footer">
        <div class="gb-switch-thumb"></div>
      </div>
    </div>
    <div class="gb-footer-link">
      <a href="${DASHBOARD_URL}" target="_blank">Abrir Dashboard Completo →</a>
    </div>
  `;
  document.getElementById("gb-bot-toggle-footer")?.addEventListener("click", async () => {
    botActive = !botActive;
    await supabasePatch("bot_settings", 1, { is_active: botActive });
    renderFooter();
  });
}

// ===== Fetch all data =====
async function fetchAllData() {
  try {
    const [statusData, settingsData, logsData, shortcutsData, contactsData, scheduledData] = await Promise.all([
      supabaseGet("whatsapp_status", "id=eq.1&select=*"),
      supabaseGet("bot_settings", "id=eq.1&select=*"),
      supabaseGet("chat_logs", "select=*&order=created_at.desc&limit=20"),
      supabaseGet("bot_shortcuts", "select=*&order=created_at.desc"),
      supabaseGet("contacts", "select=*&order=created_at.desc"),
      supabaseGet("scheduled_messages", "select=*&order=scheduled_at.desc"),
    ]);

    if (statusData?.[0]) {
      currentStatus = statusData[0].status || "disconnected";
      currentQr = statusData[0].qr_code;
    }
    if (settingsData?.[0]) {
      botActive = settingsData[0].is_active;
      botSettings = settingsData[0];
    }
    recentLogs = logsData || [];
    shortcuts = shortcutsData || [];
    contacts = contactsData || [];
    scheduledMessages = scheduledData || [];
  } catch (e) {
    console.error("GroqBot: erro ao buscar dados", e);
  }
  renderBody();
  renderFooter();
}

// ===== Render current page =====
function renderBody() {
  const body = document.getElementById("gb-body");
  if (!body) return;

  switch (currentPage) {
    case "painel": renderPainel(body); break;
    case "atalhos": renderAtalhos(body); break;
    case "contatos": renderContatos(body); break;
    case "agendamentos": renderAgendamentos(body); break;
    case "envio-massa": renderEnvioMassa(body); break;
    case "configuracoes": renderConfiguracoes(body); break;
    default: renderPainel(body);
  }
}

// ===== PAGE: Painel (clean - no activity logs) =====
function renderPainel(body) {
  const dotClass = currentStatus === "connected" ? "gb-dot-connected"
    : currentStatus === "qr" ? "gb-dot-qr"
    : currentStatus === "connecting" ? "gb-dot-connecting"
    : "gb-dot-disconnected";

  const statusLabel = currentStatus === "connected" ? "Conectado"
    : currentStatus === "qr" ? "QR Code Disponível"
    : currentStatus === "connecting" ? "Conectando..."
    : "Desconectado";

  const statusSub = currentStatus === "connected" ? "Bot respondendo mensagens"
    : currentStatus === "qr" ? "Escaneie o QR Code"
    : currentStatus === "connecting" ? "Aguardando QR Code..."
    : "Clique em Conectar";

  let statusContent = "";
  if (currentStatus === "qr" && currentQr) {
    statusContent = `<div class="gb-qr-container">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentQr)}" alt="QR" />
      <div class="gb-qr-text">WhatsApp → Aparelhos conectados → Escanear</div>
    </div>`;
  } else if (currentStatus === "connected") {
    statusContent = `<div class="gb-connected-box">
      <div class="gb-connected-icon">✅</div>
      <div class="gb-connected-title">Bot Ativo</div>
      <div class="gb-connected-sub">Respondendo automaticamente</div>
    </div>`;
  } else if (currentStatus === "connecting") {
    statusContent = `<div style="text-align:center;padding:16px;">
      <div class="gb-spinner"></div>
      <div style="margin-top:10px;color:#8696a0;font-size:12px;">Gerando QR Code...</div>
    </div>`;
  }

  body.innerHTML = `
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
      <button class="gb-btn gb-btn-primary" id="gb-connect">🔄 ${currentStatus === "connected" ? "Reconectar" : "Conectar"}</button>
      ${currentStatus === "connected" ? `<button class="gb-btn gb-btn-danger" id="gb-disconnect">⛔ Desconectar</button>` : ""}
    </div>
  `;
  bindPainelEvents();
}

function bindPainelEvents() {
  document.getElementById("gb-connect")?.addEventListener("click", async () => {
    const btn = document.getElementById("gb-connect");
    btn.disabled = true; btn.textContent = "⏳ Conectando...";
    await supabasePatch("whatsapp_status", 1, { status: "connecting", qr_code: null, updated_at: new Date().toISOString() });
    setTimeout(fetchAllData, 1000);
  });
  document.getElementById("gb-disconnect")?.addEventListener("click", async () => {
    const btn = document.getElementById("gb-disconnect");
    btn.disabled = true; btn.textContent = "⏳...";
    await supabasePatch("whatsapp_status", 1, { status: "disconnected", qr_code: null, updated_at: new Date().toISOString() });
    setTimeout(fetchAllData, 1000);
  });
}

// ===== PAGE: Atalhos =====
function renderAtalhos(body) {
  const listHtml = shortcuts.length > 0
    ? shortcuts.map(s => `
      <div class="gb-list-item">
        <div class="gb-list-item-info">
          <div class="gb-list-item-title">${escapeHtml(s.question)}</div>
          <div class="gb-list-item-sub">${escapeHtml(truncate(s.answer, 80))}</div>
        </div>
        <div class="gb-list-actions">
          <span class="gb-badge ${s.is_active ? 'gb-badge-green' : 'gb-badge-red'}">${s.is_active ? 'On' : 'Off'}</span>
          <button class="gb-icon-btn danger" data-del-shortcut="${s.id}" title="Excluir">🗑</button>
        </div>
      </div>`).join("")
    : `<div class="gb-empty">Nenhum atalho cadastrado.</div>`;

  body.innerHTML = `
    <div class="gb-section-header">
      <span class="gb-page-title">⚡ Atalhos</span>
      <button class="gb-btn gb-btn-primary gb-btn-sm" id="gb-add-shortcut">+ Novo</button>
    </div>
    <div id="gb-shortcut-form" style="display:none;">
      <div class="gb-card">
        <label class="gb-label">Pergunta / Gatilho</label>
        <input class="gb-input" id="gb-sc-question" placeholder="Ex: qual o preço?" />
        <label class="gb-label">Resposta</label>
        <textarea class="gb-textarea" id="gb-sc-answer" placeholder="Resposta automática..."></textarea>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="gb-btn gb-btn-primary gb-btn-sm" id="gb-sc-save">Salvar</button>
          <button class="gb-btn gb-btn-secondary gb-btn-sm" id="gb-sc-cancel">Cancelar</button>
        </div>
      </div>
    </div>
    ${listHtml}
  `;

  document.getElementById("gb-add-shortcut")?.addEventListener("click", () => {
    document.getElementById("gb-shortcut-form").style.display = "block";
  });
  document.getElementById("gb-sc-cancel")?.addEventListener("click", () => {
    document.getElementById("gb-shortcut-form").style.display = "none";
  });
  document.getElementById("gb-sc-save")?.addEventListener("click", async () => {
    const q = document.getElementById("gb-sc-question").value.trim();
    const a = document.getElementById("gb-sc-answer").value.trim();
    if (!q || !a) return;
    await supabasePost("bot_shortcuts", { question: q, answer: a, is_active: true });
    await fetchAllData();
  });
  body.querySelectorAll("[data-del-shortcut]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await supabaseDelete("bot_shortcuts", `id=eq.${btn.dataset.delShortcut}`);
      await fetchAllData();
    });
  });
}

// ===== PAGE: Contatos =====
function renderContatos(body) {
  const listHtml = contacts.length > 0
    ? contacts.map(c => `
      <div class="gb-list-item">
        <div class="gb-list-item-info">
          <div class="gb-list-item-title">${escapeHtml(c.name || "Sem nome")}</div>
          <div class="gb-list-item-sub">${escapeHtml(c.phone_number)}</div>
        </div>
        <div class="gb-list-actions">
          <button class="gb-icon-btn danger" data-del-contact="${c.id}" title="Excluir">🗑</button>
        </div>
      </div>`).join("")
    : `<div class="gb-empty">Nenhum contato cadastrado.</div>`;

  body.innerHTML = `
    <div class="gb-section-header">
      <span class="gb-page-title">👥 Contatos</span>
      <button class="gb-btn gb-btn-primary gb-btn-sm" id="gb-add-contact">+ Novo</button>
    </div>
    <div id="gb-contact-form" style="display:none;">
      <div class="gb-card">
        <label class="gb-label">Nome</label>
        <input class="gb-input" id="gb-ct-name" placeholder="Nome do contato" />
        <label class="gb-label">Telefone</label>
        <input class="gb-input" id="gb-ct-phone" placeholder="5511999999999" />
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="gb-btn gb-btn-primary gb-btn-sm" id="gb-ct-save">Salvar</button>
          <button class="gb-btn gb-btn-secondary gb-btn-sm" id="gb-ct-cancel">Cancelar</button>
        </div>
      </div>
    </div>
    ${listHtml}
  `;

  document.getElementById("gb-add-contact")?.addEventListener("click", () => {
    document.getElementById("gb-contact-form").style.display = "block";
  });
  document.getElementById("gb-ct-cancel")?.addEventListener("click", () => {
    document.getElementById("gb-contact-form").style.display = "none";
  });
  document.getElementById("gb-ct-save")?.addEventListener("click", async () => {
    const name = document.getElementById("gb-ct-name").value.trim();
    const phone = document.getElementById("gb-ct-phone").value.trim();
    if (!phone) return;
    await supabasePost("contacts", { name: name || null, phone_number: phone });
    await fetchAllData();
  });
  body.querySelectorAll("[data-del-contact]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await supabaseDelete("contacts", `id=eq.${btn.dataset.delContact}`);
      await fetchAllData();
    });
  });
}

// ===== PAGE: Agendamentos =====
function renderAgendamentos(body) {
  const listHtml = scheduledMessages.length > 0
    ? scheduledMessages.map(m => {
        const dt = new Date(m.scheduled_at).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
        const badgeClass = m.status === "sent" ? "gb-badge-green" : m.status === "failed" ? "gb-badge-red" : "gb-badge-yellow";
        return `<div class="gb-list-item">
          <div class="gb-list-item-info">
            <div class="gb-list-item-title">${escapeHtml(m.phone_number)}</div>
            <div class="gb-list-item-sub">${escapeHtml(truncate(m.message, 60))} • ${dt}</div>
          </div>
          <div class="gb-list-actions">
            <span class="gb-badge ${badgeClass}">${m.status}</span>
            <button class="gb-icon-btn danger" data-del-sched="${m.id}" title="Excluir">🗑</button>
          </div>
        </div>`;
      }).join("")
    : `<div class="gb-empty">Nenhum agendamento.</div>`;

  body.innerHTML = `
    <div class="gb-section-header">
      <span class="gb-page-title">📅 Agendamentos</span>
      <button class="gb-btn gb-btn-primary gb-btn-sm" id="gb-add-sched">+ Novo</button>
    </div>
    <div id="gb-sched-form" style="display:none;">
      <div class="gb-card">
        <label class="gb-label">Telefone</label>
        <input class="gb-input" id="gb-sch-phone" placeholder="5511999999999" />
        <label class="gb-label">Mensagem</label>
        <textarea class="gb-textarea" id="gb-sch-msg" placeholder="Mensagem a enviar..."></textarea>
        <label class="gb-label">Data/Hora</label>
        <input class="gb-input" id="gb-sch-date" type="datetime-local" />
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="gb-btn gb-btn-primary gb-btn-sm" id="gb-sch-save">Agendar</button>
          <button class="gb-btn gb-btn-secondary gb-btn-sm" id="gb-sch-cancel">Cancelar</button>
        </div>
      </div>
    </div>
    ${listHtml}
  `;

  document.getElementById("gb-add-sched")?.addEventListener("click", () => {
    document.getElementById("gb-sched-form").style.display = "block";
  });
  document.getElementById("gb-sch-cancel")?.addEventListener("click", () => {
    document.getElementById("gb-sched-form").style.display = "none";
  });
  document.getElementById("gb-sch-save")?.addEventListener("click", async () => {
    const phone = document.getElementById("gb-sch-phone").value.trim();
    const msg = document.getElementById("gb-sch-msg").value.trim();
    const date = document.getElementById("gb-sch-date").value;
    if (!phone || !msg || !date) return;
    await supabasePost("scheduled_messages", { phone_number: phone, message: msg, scheduled_at: new Date(date).toISOString(), status: "pending" });
    await fetchAllData();
  });
  body.querySelectorAll("[data-del-sched]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await supabaseDelete("scheduled_messages", `id=eq.${btn.dataset.delSched}`);
      await fetchAllData();
    });
  });
}

// ===== PAGE: Envio em Massa =====
function renderEnvioMassa(body) {
  const contactOptions = contacts.map(c =>
    `<label style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;cursor:pointer;color:#e9edef;">
      <input type="checkbox" class="gb-bulk-check" value="${c.phone_number}" />
      ${escapeHtml(c.name || c.phone_number)}
    </label>`
  ).join("");

  body.innerHTML = `
    <div class="gb-section-header">
      <span class="gb-page-title">📨 Envio em Massa</span>
    </div>
    <div class="gb-card">
      <label class="gb-label">Mensagem</label>
      <textarea class="gb-textarea" id="gb-bulk-msg" placeholder="Digite a mensagem para enviar a todos..." style="min-height:90px;"></textarea>
      <label class="gb-label">Selecionar Contatos (${contacts.length})</label>
      <div style="max-height:180px;overflow-y:auto;padding:4px 0;">
        ${contactOptions || `<div class="gb-empty">Nenhum contato disponível.</div>`}
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="gb-btn gb-btn-secondary gb-btn-sm" id="gb-bulk-all">Selecionar Todos</button>
        <button class="gb-btn gb-btn-secondary gb-btn-sm" id="gb-bulk-none">Limpar</button>
      </div>
      <button class="gb-btn gb-btn-primary" id="gb-bulk-send" style="margin-top:14px;">📨 Enviar para Selecionados</button>
      <div id="gb-bulk-result" style="margin-top:10px;font-size:12px;color:#8696a0;text-align:center;"></div>
    </div>
  `;

  document.getElementById("gb-bulk-all")?.addEventListener("click", () => {
    body.querySelectorAll(".gb-bulk-check").forEach(cb => cb.checked = true);
  });
  document.getElementById("gb-bulk-none")?.addEventListener("click", () => {
    body.querySelectorAll(".gb-bulk-check").forEach(cb => cb.checked = false);
  });
  document.getElementById("gb-bulk-send")?.addEventListener("click", async () => {
    const msg = document.getElementById("gb-bulk-msg").value.trim();
    const phones = [...body.querySelectorAll(".gb-bulk-check:checked")].map(cb => cb.value);
    if (!msg || phones.length === 0) {
      document.getElementById("gb-bulk-result").textContent = "⚠️ Selecione contatos e escreva uma mensagem.";
      return;
    }
    const btn = document.getElementById("gb-bulk-send");
    btn.disabled = true; btn.textContent = "⏳ Agendando...";
    const now = new Date().toISOString();
    const promises = phones.map(phone =>
      supabasePost("scheduled_messages", { phone_number: phone, message: msg, scheduled_at: now, status: "pending" })
    );
    await Promise.all(promises);
    document.getElementById("gb-bulk-result").innerHTML = `✅ ${phones.length} mensagen(s) agendada(s) com sucesso!`;
    btn.disabled = false; btn.textContent = "📨 Enviar para Selecionados";
    await fetchAllData();
  });
}

// ===== PAGE: Configurações =====
function renderConfiguracoes(body) {
  body.innerHTML = `
    <div class="gb-section-header">
      <span class="gb-page-title">⚙️ Configurações</span>
    </div>
    <div class="gb-card">
      <div class="gb-card-title">🏢 Dados da Empresa</div>
      <label class="gb-label">Nome da Empresa</label>
      <input class="gb-input" id="gb-cfg-company" value="${escapeHtml(botSettings.company_name || '')}" />
      <label class="gb-label">Nome do Proprietário</label>
      <input class="gb-input" id="gb-cfg-owner" value="${escapeHtml(botSettings.owner_name || '')}" />
      <label class="gb-label">Chave PIX</label>
      <input class="gb-input" id="gb-cfg-pix" value="${escapeHtml(botSettings.pix_key || '')}" />
    </div>
    <div class="gb-card">
      <div class="gb-card-title">🤖 Configuração do Bot</div>
      <label class="gb-label">Chave API Groq</label>
      <input class="gb-input" id="gb-cfg-groq" type="password" value="${escapeHtml(botSettings.groq_api_key || '')}" />
      <label class="gb-label">Prompt do Sistema</label>
      <textarea class="gb-textarea" id="gb-cfg-prompt" style="min-height:100px;">${escapeHtml(botSettings.system_prompt || '')}</textarea>
      <label class="gb-label">Produtos</label>
      <textarea class="gb-textarea" id="gb-cfg-products" style="min-height:70px;">${escapeHtml(botSettings.products || '')}</textarea>
      <label class="gb-label">Comandos Personalizados</label>
      <textarea class="gb-textarea" id="gb-cfg-commands" style="min-height:70px;">${escapeHtml(botSettings.custom_commands || '')}</textarea>
    </div>
    <button class="gb-btn gb-btn-primary" id="gb-cfg-save">💾 Salvar Configurações</button>
    <div id="gb-cfg-result" style="margin-top:10px;font-size:12px;color:#8696a0;text-align:center;"></div>
  `;

  document.getElementById("gb-cfg-save")?.addEventListener("click", async () => {
    const btn = document.getElementById("gb-cfg-save");
    btn.disabled = true; btn.textContent = "⏳ Salvando...";
    await supabasePatch("bot_settings", 1, {
      company_name: document.getElementById("gb-cfg-company").value.trim() || null,
      owner_name: document.getElementById("gb-cfg-owner").value.trim() || null,
      pix_key: document.getElementById("gb-cfg-pix").value.trim() || null,
      groq_api_key: document.getElementById("gb-cfg-groq").value.trim() || null,
      system_prompt: document.getElementById("gb-cfg-prompt").value.trim(),
      products: document.getElementById("gb-cfg-products").value.trim() || null,
      custom_commands: document.getElementById("gb-cfg-commands").value.trim() || null,
    });
    document.getElementById("gb-cfg-result").innerHTML = "✅ Configurações salvas!";
    btn.disabled = false; btn.textContent = "💾 Salvar Configurações";
    await fetchAllData();
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
