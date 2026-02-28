// GroqBot Extension - Content Script for WhatsApp Web
// Injects a sidebar panel with the GroqBot dashboard

const DASHBOARD_URL = "https://groqbot.lovable.app";
const SIDEBAR_WIDTH = 380;

function createSidebar() {
  if (document.getElementById("groqbot-sidebar")) return;

  // Sidebar container
  const sidebar = document.createElement("div");
  sidebar.id = "groqbot-sidebar";
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: ${SIDEBAR_WIDTH}px;
    height: 100vh;
    z-index: 9999;
    background: #0b141a;
    box-shadow: -2px 0 12px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    border-left: 1px solid #2a3942;
  `;

  // Header bar
  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: linear-gradient(135deg, #00a884, #25d366);
    flex-shrink: 0;
  `;
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">🤖</span>
      <span style="color:white;font-weight:700;font-size:14px;">GroqBot</span>
    </div>
  `;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.cssText = `
    background: rgba(255,255,255,0.2);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  `;
  closeBtn.onmouseover = () => closeBtn.style.background = "rgba(255,255,255,0.3)";
  closeBtn.onmouseout = () => closeBtn.style.background = "rgba(255,255,255,0.2)";
  header.appendChild(closeBtn);

  // Iframe with dashboard
  const iframe = document.createElement("iframe");
  iframe.src = DASHBOARD_URL;
  iframe.style.cssText = "width:100%;flex:1;border:none;background:#0b141a;";
  iframe.allow = "clipboard-write";

  sidebar.appendChild(header);
  sidebar.appendChild(iframe);
  document.body.appendChild(sidebar);

  // Toggle button (always visible)
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "groqbot-toggle";
  toggleBtn.innerHTML = "🤖";
  toggleBtn.title = "GroqBot - Painel de Controle";
  toggleBtn.style.cssText = `
    position: fixed;
    right: ${SIDEBAR_WIDTH}px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10000;
    width: 36px;
    height: 48px;
    border-radius: 10px 0 0 10px;
    border: 1px solid #2a3942;
    border-right: none;
    background: #00a884;
    color: white;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: -2px 0 8px rgba(0,0,0,0.2);
    transition: right 0.3s cubic-bezier(0.4,0,0.2,1), background 0.2s;
  `;
  toggleBtn.onmouseover = () => toggleBtn.style.background = "#008f72";
  toggleBtn.onmouseout = () => toggleBtn.style.background = "#00a884";
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

  closeBtn.onclick = toggle;
  toggleBtn.onclick = toggle;
}

// Wait for WhatsApp Web to fully load
function waitForWhatsApp() {
  const observer = new MutationObserver((mutations, obs) => {
    const app = document.getElementById("app");
    if (app && app.children.length > 0) {
      // Small delay to let WhatsApp finish rendering
      setTimeout(() => {
        createSidebar();
        obs.disconnect();
      }, 1500);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Fallback: inject after 5 seconds regardless
  setTimeout(() => {
    observer.disconnect();
    createSidebar();
  }, 5000);
}

waitForWhatsApp();
console.log("✅ GroqBot Extension carregada!");
