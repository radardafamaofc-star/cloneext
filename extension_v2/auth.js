async function login(licenseKey) {
    const errorMessage = document.getElementById('error-message');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    if (!licenseKey) {
        errorMessage.textContent = 'Por favor, insira uma chave de licença';
        errorMessage.classList.add('show');
        return;
    }

    errorMessage.classList.remove('show');
    loadingSpinner.classList.add('show');

    try {
        const response = await fetch(`${CONFIG.FUNCTION_URL}/${licenseKey}`);
        const data = await response.json();

        if (data.valid) {
            chrome.storage.local.set({
                'sessionToken': data.sessionToken,
                'userData': { license: licenseKey, active: true }
            }, () => {
                window.location.href = 'popup.html';
            });
        } else {
            errorMessage.textContent = 'Chave de licença inválida ou expirada';
            errorMessage.classList.add('show');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Erro ao conectar com o servidor';
        errorMessage.classList.add('show');
    } finally {
        loadingSpinner.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const licenseInput = document.getElementById('license-key');
    const eyeIcon = document.getElementById('eye-icon');

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login(licenseInput.value.trim());
        });
    }

    if (eyeIcon) {
        eyeIcon.addEventListener('click', () => {
            const type = licenseInput.getAttribute('type') === 'password' ? 'text' : 'password';
            licenseInput.setAttribute('type', type);
            // Toggle eye icon SVG here if needed
        });
    }
});
