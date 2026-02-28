// GroqBot Extension - Popup Script
// Reads status directly from Supabase (anon key, public read)

const SUPABASE_URL = "https://jlyqbwfuvdewvhaednvd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseXFid2Z1dmRld3ZoYWVkbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzY5MTAsImV4cCI6MjA4Nzc1MjkxMH0.GzLjvCxz-TPYCnzddtypNNsXOV8Jv-F3lHtEN5-zKIg";
const DASHBOARD_URL = "https://id-preview--9fd614a6-760a-4974-a758-b5f4903eb16e.lovable.app";

async function fetchStatus() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/whatsapp_status?id=eq.1&select=*`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const rows = await res.json();
    return rows[0] || null;
  } catch (e) {
    console.error("GroqBot: fetch error", e);
    return null;
  }
}

function updateUI(data) {
  const loading = document.getElementById("loading");
  const mainContent = document.getElementById("main-content");
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");
  const statusSub = document.getElementById("status-sub");
  const qrSection = document.getElementById("qr-section");
  const qrImg = document.getElementById("qr-img");
  const connectedInfo = document.getElementById("connected-info");

  loading.style.display = "none";
  mainContent.style.display = "block";

  if (!data) {
    statusDot.className = "status-dot dot-disconnected";
    statusText.textContent = "Erro";
    statusSub.textContent = "Não foi possível conectar ao servidor.";
    qrSection.classList.remove("visible");
    connectedInfo.classList.remove("visible");
    return;
  }

  const status = data.status || "disconnected";

  // Reset
  qrSection.classList.remove("visible");
  connectedInfo.classList.remove("visible");

  switch (status) {
    case "connected":
      statusDot.className = "status-dot dot-connected";
      statusText.textContent = "Conectado";
      statusSub.textContent = "Bot ativo e respondendo mensagens.";
      connectedInfo.classList.add("visible");
      break;

    case "qr":
      statusDot.className = "status-dot dot-qr";
      statusText.textContent = "Aguardando Scan";
      statusSub.textContent = "Escaneie o QR Code abaixo.";
      if (data.qr_code) {
        qrSection.classList.add("visible");
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qr_code)}`;
      }
      break;

    case "connecting":
      statusDot.className = "status-dot dot-connecting";
      statusText.textContent = "Conectando...";
      statusSub.textContent = "Gerando QR Code, aguarde...";
      break;

    default:
      statusDot.className = "status-dot dot-disconnected";
      statusText.textContent = "Desconectado";
      statusSub.textContent = "Inicie o servidor para conectar.";
      break;
  }
}

// Button handlers
document.getElementById("btn-open-wa").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://web.whatsapp.com" });
});

document.getElementById("btn-dashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: DASHBOARD_URL });
});

document.getElementById("link-dashboard").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: DASHBOARD_URL });
});

// Initial load + polling
(async () => {
  const data = await fetchStatus();
  updateUI(data);
})();

setInterval(async () => {
  const data = await fetchStatus();
  updateUI(data);
}, 4000);
