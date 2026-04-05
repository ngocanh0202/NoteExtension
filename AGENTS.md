# NoteExtension — Agent Guide

## What this is

A **Manifest V3 browser extension** (Chrome/Firefox) for creating and managing notes with Firebase Firestore cloud sync and Cloudinary image uploads.

## Key commands

```
npm install              # Install deps (firebase + webpack/babel toolchain)
npx webpack              # Build: src/script.js → public/bundle.js
```

There are **no test, lint, or typecheck scripts** in package.json. No CI configured.

## Architecture

```
src/script.js            # Main entry (webpack entry) → public/bundle.js
src/utils.js             # Env parsing helpers
src/scriptEnv.js         # Env-related utilities
contextMenusNote.js      # Service worker: "Add to Note" right-click context menu
public/index.html        # Extension popup UI
public/bundle.js         # Webpack output (DO NOT EDIT)
manifest.json            # MV3 config, popup = public/index.html, service_worker = contextMenusNote.js
env                      # Firebase + Cloudinary config file (gitignored, NOT .env)
```

**Build flow**: `npx webpack` reads `src/script.js` → outputs `public/bundle.js`. The extension loads the bundle via `public/index.html`.

## Env configuration quirks

- Config file is named **`env`** (not `.env`) — matches `.gitignore` entry
- Template at `.env.example` contains Firebase + Cloudinary keys
- Format is **not** standard `KEY=VALUE` — uses `key: "value"` syntax (parsed by `handleTextEnv()` in `src/utils.js`)
- Config can also be entered via the extension's settings UI at runtime (stored in `localStorage`)
- Cloudinary config cached in `localStorage` key `envCloudinary`
- Firebase config history cached in `localStorage` key `envVariables`

## Firebase details

- Firestore collection: **`Notes`** (fields: `Note`, `example`, `timestamp`, `category`, `isPinned`)
- Firestore collection: **`note-images`** (fields: `url`, `signature`) — tracks uploaded images for cleanup
- Firebase app instance is dynamically created/destroyed via `deleteApp()` when config changes
- Local backup of notes stored in `localStorage` key `NotesBackups` (fallback on Firestore failure)

## Cloudinary details

- Uses **unsigned upload** via `upload_preset` for image uploads
- Image delete requires signed API calls (SHA-1 signature generated in-browser via Web Crypto API)
- Orphaned image cleanup triggered after each note save via `handleCleanImagesCloudinary()`

## Data flow

1. **Popup opens** → `public/index.html` loads `public/bundle.js`
2. **Firebase init** → reads `env` file or localStorage config → `resetFirebaseApp()` → `renderNotes()`
3. **Context menu** → `contextMenusNote.js` stores selected text to `chrome.storage.local` → sends `autoUpdateEditor` message → popup opens and auto-saves note
4. **Note CRUD** → direct Firestore operations via Firebase v11 SDK (modular API)

## Gotchas

- `public/bundle.js` and `public/bundle.js.map` are **build artifacts** — never edit directly
- Webpack is in `development` mode with source maps — no production build config exists
- No `scripts` section in `package.json` — all commands must be run via `npx`
- Firebase config is validated at runtime, not build time — missing keys cause runtime alerts in the popup
- The `env` file is fetched via `fetch('/env')` at runtime — this only works because extension pages can load local files
