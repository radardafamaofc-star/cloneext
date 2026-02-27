const CONFIG = {
    'FUNCTION_URL': 'http://localhost:8000/api/validate',
    'VALID_SESSION_URL': 'http://localhost:8000/api/validate',
    'PROMPT_ENHANCE_URL': 'http://localhost:8000/api/enhance',
    'NOTIFICATIONS_URL': 'http://localhost:8000/api/notifications',
    'CHECK_VERSION_URL': 'http://localhost:8000/api/version',
    'REVALIDATION_INTERVAL': 10 * 1000,
    'REQUEST_TIMEOUT': 10000
};

// If running in Replit, we need to adjust the URLs to use the actual Replit Webview URLs
// This is a helper to get the current base URL if we're in a browser environment
if (typeof window !== 'undefined') {
    const host = window.location.host;
    if (host.includes('.replit.app')) {
        const adminHost = host.replace('5000', '8000'); // Assuming extension is on 5000 and admin on 8000
        const baseUrl = `https://${adminHost}`;
        CONFIG.FUNCTION_URL = `${baseUrl}/api/validate`;
        CONFIG.VALID_SESSION_URL = `${baseUrl}/api/validate`;
    }
}
