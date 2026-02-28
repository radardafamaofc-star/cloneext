// GroqBot Extension - Content Script for WhatsApp Web
// Opens dashboard in a new tab (iframe embedding is blocked by security headers)

const DASHBOARD_URL = "https://groqbot.lovable.app";

function createToggleButton() {
  if (document.getElementById("groqbot-toggle")) return;

  const toggleBtn = document.createElement("button");
  toggleBtn.id = "groqbot-toggle";
  toggleBtn.innerHTML = "🤖";
  toggleBtn.title = "GroqBot - Abrir Painel de Controle";
  toggleBtn.style.cssText = `
    position: fixed;
    right: 16px;
    bottom: 24px;
    z-index: 10000;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #00a884, #25d366);
    color: white;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  toggleBtn.onmouseover = () => {
    toggleBtn.style.transform = "scale(1.1)";
    toggleBtn.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
  };
  toggleBtn.onmouseout = () => {
    toggleBtn.style.transform = "scale(1)";
    toggleBtn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  };
  toggleBtn.onclick = () => {
    window.open(DASHBOARD_URL, "_blank");
  };

  document.body.appendChild(toggleBtn);
}

// Wait for WhatsApp Web to fully load
function waitForWhatsApp() {
  const observer = new MutationObserver((mutations, obs) => {
    const app = document.getElementById("app");
    if (app && app.children.length > 0) {
      setTimeout(() => {
        createToggleButton();
        obs.disconnect();
      }, 1500);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Fallback: inject after 5 seconds regardless
  setTimeout(() => {
    observer.disconnect();
    createToggleButton();
  }, 5000);
}

waitForWhatsApp();
console.log("✅ GroqBot Extension carregada!");
