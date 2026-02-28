// GroqBot Extension - Background Script (Service Worker)
// Minimal - just handles extension lifecycle

chrome.runtime.onInstalled.addListener(() => {
  console.log("GroqBot Extension installed!");
});
