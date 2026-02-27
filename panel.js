/* ===== Panel JS — Key Management ===== */
const STORAGE_KEY = 'lovable_license_keys';
let selectedType = 'pro';

// ===== Storage =====
function loadKeys() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
}
function saveKeys(keys) { localStorage.setItem(STORAGE_KEY, JSON.stringify(keys)); }

// ===== ID Generator =====
function genId(len) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let r = ''; for (let i = 0; i < len; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return r;
}

// ===== Toast =====
function showToast(msg, type) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 2500);
}

// ===== Dialog =====
function openDialog() {
    document.getElementById('dialog-overlay').style.display = 'flex';
    document.getElementById('key-label').value = '';
    selectType('pro');
    setTimeout(() => document.getElementById('key-label').focus(), 100);
}
function closeDialog() { document.getElementById('dialog-overlay').style.display = 'none'; }

function selectType(type) {
    selectedType = type;
    document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.type === type);
    });
}

// ===== Generate Key =====
const TYPE_DAYS = { trial: 7, pro: 30, lifetime: null };

function generateNewKey() {
    const label = document.getElementById('key-label').value.trim();
    if (!label) { showToast('Informe um label para a key', 'error'); return; }

    const btn = document.getElementById('btn-generate');
    btn.classList.add('loading');
    btn.disabled = true;
    btn.textContent = '⏳ Gerando...';

    setTimeout(() => {
        const now = new Date();
        const days = TYPE_DAYS[selectedType];
        const key = {
            id: genId(12),
            key: 'LI-' + selectedType.toUpperCase() + '-' + genId(24),
            label: label,
            type: selectedType,
            status: 'active',
            createdAt: now.toISOString(),
            expiresAt: days ? new Date(now.getTime() + days * 86400000).toISOString() : null
        };
        const keys = loadKeys();
        keys.unshift(key);
        saveKeys(keys);
        renderAll();
        closeDialog();
        showToast('Key gerada com sucesso!', 'success');
        btn.classList.remove('loading');
        btn.disabled = false;
        btn.textContent = '⚡ Gerar Key';
    }, 500);
}

// ===== Actions =====
function copyKey(id) {
    const keys = loadKeys();
    const k = keys.find(x => x.id === id);
    if (!k) return;
    navigator.clipboard.writeText(k.key).then(() => {
        showToast('Key copiada!', 'success');
        const btn = document.querySelector('[data-copy="' + id + '"]');
        if (btn) { btn.classList.add('copied'); setTimeout(() => btn.classList.remove('copied'), 2000); }
    });
}

function revokeKeyAction(id) {
    const keys = loadKeys();
    const k = keys.find(x => x.id === id);
    if (!k) return;
    k.status = 'revoked';
    saveKeys(keys);
    renderAll();
    showToast('Key revogada', 'warning');
}

function deleteKeyAction(id) {
    const keys = loadKeys().filter(x => x.id !== id);
    saveKeys(keys);
    renderAll();
    showToast('Key deletada', 'error');
}

// ===== Render =====
function renderStats(keys) {
    document.getElementById('stat-total').textContent = keys.length;
    document.getElementById('stat-active').textContent = keys.filter(k => k.status === 'active').length;
    document.getElementById('stat-revoked').textContent = keys.filter(k => k.status === 'revoked').length;
    document.getElementById('stat-lifetime').textContent = keys.filter(k => k.type === 'lifetime').length;
    document.getElementById('table-count').textContent = keys.length + ' registros';
}

function renderTable(keys) {
    const body = document.getElementById('table-body');
    if (keys.length === 0) {
        body.innerHTML = '<div class="empty-state"><div class="empty-icon">🔑</div><p>Nenhuma key gerada ainda</p></div>';
        return;
    }

    let html = '<div class="table-responsive"><table class="keys-table"><thead><tr>';
    html += '<th>Status</th><th>Label</th><th>Key</th><th>Tipo</th><th>Expira</th><th style="text-align:right">Ações</th>';
    html += '</tr></thead><tbody>';

    keys.forEach(k => {
        const expDate = k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('pt-BR') : '∞';
        const keyShort = k.key.length > 20 ? k.key.slice(0, 20) + '…' : k.key;
        html += '<tr>';
        html += '<td><span class="status-dot ' + k.status + '"></span><span style="font-size:12px;color:var(--fg-muted);text-transform:capitalize">' + k.status + '</span></td>';
        html += '<td style="font-weight:500">' + escHtml(k.label) + '</td>';
        html += '<td><code class="key-code">' + escHtml(keyShort) + '</code></td>';
        html += '<td><span class="type-badge ' + k.type + '">' + k.type + '</span></td>';
        html += '<td style="font-size:12px;color:var(--fg-muted)">' + expDate + '</td>';
        html += '<td style="text-align:right">';
        html += '<button class="action-btn copy" data-copy="' + k.id + '" onclick="copyKey(\'' + k.id + '\')" title="Copiar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>';
        if (k.status === 'active') {
            html += '<button class="action-btn revoke" onclick="revokeKeyAction(\'' + k.id + '\')" title="Revogar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>';
        }
        html += '<button class="action-btn delete" onclick="deleteKeyAction(\'' + k.id + '\')" title="Deletar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>';
        html += '</td></tr>';
    });

    html += '</tbody></table></div>';
    body.innerHTML = html;
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function renderAll() {
    const keys = loadKeys();
    renderStats(keys);
    renderTable(keys);
}

function refreshKeys() { renderAll(); showToast('Atualizado!', 'success'); }

// ===== Init =====
document.addEventListener('DOMContentLoaded', renderAll);

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDialog();
});
