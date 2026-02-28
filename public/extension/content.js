// Content script to inject the dashboard into WhatsApp Web
console.log('GroqBot Extension loaded');

function injectSidebar() {
  if (document.getElementById('groqbot-sidebar')) return;

  const sidebar = document.createElement('div');
  sidebar.id = 'groqbot-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 400px;
    height: 100%;
    background: white;
    z-index: 9999;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = window.location.origin.replace('web.whatsapp.com', window.location.hostname.split('.')[0] + '.replit.app'); 
  iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
  
  const toggleBtn = document.createElement('button');
  toggleBtn.innerText = '🤖';
  toggleBtn.style.cssText = `
    position: fixed;
    right: 400px;
    top: 20px;
    z-index: 10000;
    padding: 10px;
    border-radius: 50% 0 0 50%;
    border: 1px solid #ccc;
    background: #25D366;
    color: white;
    cursor: pointer;
  `;

  let isOpen = true;
  toggleBtn.onclick = () => {
    isOpen = !isOpen;
    sidebar.style.transform = isOpen ? 'translateX(0)' : 'translateX(400px)';
    toggleBtn.style.right = isOpen ? '400px' : '0';
  };

  document.body.appendChild(sidebar);
  sidebar.appendChild(iframe);
  document.body.appendChild(toggleBtn);
}

// Wait for WhatsApp to load
const observer = new MutationObserver((mutations, obs) => {
  const main = document.getElementById('main');
  if (main) {
    injectSidebar();
    obs.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});