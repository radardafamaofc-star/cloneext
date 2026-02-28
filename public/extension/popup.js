async function updateStatus() {
  try {
    // Dynamically detect the host from the current tab or background script
    const host = window.location.origin.includes('replit.app') ? window.location.origin : "https://groqbot.replit.app";
    
    const response = await fetch(`${host}/api/whatsapp/status`);
    const data = await response.json();
    
    const badge = document.getElementById('status-badge');
    const qrContainer = document.getElementById('qr-container');
    const qrDiv = document.getElementById('qrcode');
    
    badge.className = 'status status-' + data.status;
    badge.textContent = data.status === 'connected' ? 'Conectado' : 
                       data.status === 'qr' ? 'Aguardando Scan' : 'Desconectado';
    
    if (data.status === 'qr' && data.qrCode) {
      qrContainer.style.display = 'block';
      // Basic QR display using a public API or similar since we can't bundle qrcode.js easily here
      qrDiv.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrCode)}" />`;
    } else {
      qrContainer.style.display = 'none';
    }
  } catch (e) {
    console.error(e);
    document.getElementById('status-badge').textContent = 'Erro de Conexão';
  }
}

document.getElementById('open-wa').onclick = () => {
  window.open('https://web.whatsapp.com');
};

updateStatus();
setInterval(updateStatus, 5000);
