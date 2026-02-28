const REPLIT_URL = window.location.origin; // This will be the replit URL when viewed in preview

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHost") {
    sendResponse({ host: REPLIT_URL });
  }
});
