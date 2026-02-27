# Lovable Infinite — Chrome Extension

## Projects

### 1. Lovable Infinite (Legacy)
Original extension files.

### 2. Lovable Infinite V2 (New)
Clone of the original extension with a new **Blue Theme** layout.
- Directory: `extension_v2/`
- Preview Workflow: Port 5000

### 3. Admin Panel
Management interface for the extension.
- Directory: `admin_panel/`
- Workflow: Port 8000 (Python API + Static UI)
- URL: [Your Repl URL]:8000
- Credentials: `admin` / `admin`
- Features: License management (View/Add)

## Project Type

**Chrome Browser Extension** — pure static files, no build system, no backend, no package manager.

## Key Files

- `manifest.json` — Chrome extension manifest (v3), defines permissions, content scripts, background service worker
- `popup.html` / `popup.js` — Main extension side panel UI
- `background.js` — Extension service worker
- `content.js` — Content script injected into lovable.dev pages
- `auth.html` / `auth.js` — Authentication UI
- `permission.html` / `permission.js` — Permissions UI
- `config.js` — Extension configuration
- `history_logic.js` — History management logic
- `styles.css` / `styles_append.css` — Stylesheets
- `jszip.min.js` — JSZip library for file handling
- `mock-extension.js` — Extension API mock for browser testing

## Running in Replit

Since Chrome extensions cannot run natively in a browser, the project is served as static files using Python's built-in HTTP server on port 5000. This lets you view the extension's HTML pages in the Replit preview.

**Workflow:** `python3 -m http.server 5000 --bind 0.0.0.0`

## Deployment

Configured as a **static site** deployment (publicDir: `.`).

## Installing as a Chrome Extension

To actually use the extension:
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the project folder
