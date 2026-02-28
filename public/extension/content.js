// Content script to inject the dashboard into WhatsApp Web
console.log('GroqBot Extension loaded');

const DASHBOARD_URL = 'https://' + window.location.hostname.replace('web.whatsapp.com', 'replit.app'); // Simplistic guess

function injectSidebar() {
  if (document.getElementById('groqbot-sidebar')) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'groqbot-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 350px;
    height: 100%;
    background: white;
    z-index: 9999;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
  `;

  const iframe = document.createElement('iframe');
  // Detect current replit host
  const REPLIT_HOST = "https://groqbot.replit.app";
  iframe.src = REPLIT_HOST; 
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  
  const toggleBtn = document.createElement('button');
  toggleBtn.innerHTML = '🤖';
  toggleBtn.style.cssText = `
    position: fixed;
    right: 350px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10000;
    padding: 10px;
    border-radius: 10px 0 0 10px;
    border: 1px solid #ccc;
    background: #25D366;
    color: white;
    cursor: pointer;
    font-size: 20px;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  `;

  let isOpen = true;
  toggleBtn.onclick = () => {
    isOpen = !isOpen;
    sidebar.style.transform = isOpen ? 'translateX(0)' : 'translateX(350px)';
    toggleBtn.style.right = isOpen ? '350px' : '0';
    const app = document.getElementById('app');
    if (app) app.style.marginRight = isOpen ? '350px' : '0';
  };

  document.body.appendChild(sidebar);
  sidebar.appendChild(iframe);
  document.body.appendChild(toggleBtn);
  
  // Adjust layout
  const app = document.getElementById('app');
  if (app) app.style.marginRight = '350px';
}

// Wait for WhatsApp load
const observer = new MutationObserver((mutations, obs) => {
  const main = document.getElementById('main') || document.querySelector('[data-testid="intro-text"]');
  if (main) {
    injectSidebar();
    obs.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
