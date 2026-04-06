# Bug Fixes + Modern Theme Redesign

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical/high/medium bugs in src/ and redesign dark/light themes with modern electronic aesthetics

**Architecture:** Fix bugs across notes.js, firebase.js, cloudinary.js, env.js, script.js, and utils.js. Add DOMPurify for XSS-safe HTML rendering. Redesign CSS with modern color palettes (electric blue/neon accents for dark, clean whites/subtle gradients for light) with glass-morphism effects.

**Tech Stack:** Vanilla JS, Firebase v11, CSS custom properties, Bootstrap 5, TinyMCE, DOMPurify

---

## File Structure

### Files to Create:
- N/A (DOMPurify loaded via CDN)

### Files to Modify:
- `package.json` - Add DOMPurify dependency
- `public/index.html` - Add DOMPurify CDN script, fix category input `name` attr, remove duplicate Bootstrap
- `src/managers/notes.js` - Fix: DOMPurify sanitize, null checks, timestamp handling, backup serialization, category state preservation
- `src/managers/firebase.js` - Fix: deleteApp safety, catch re-throw
- `src/managers/cloudinary.js` - Fix: alert spam consolidation
- `src/managers/env.js` - Fix: null DOM element checks
- `src/script.js` - Fix: tinymce null check, readMore null check, onClickCopy null check
- `src/utils.js` - Fix: escaped quote handling
- `src/ui/theme.js` - Fix: tinymce race condition on theme toggle, TinyMCE dark theme bg
- `css/styles.css` - Redesign: modern dark/light themes with glass-morphism, electric blue/neon accents

---

## Chunk 1: Critical Bug Fixes (Security + Data Integrity)

### Task 1: Add DOMPurify and fix XSS vulnerabilities

**Files:**
- Modify: `public/index.html:8` (add DOMPurify CDN)
- Modify: `src/managers/notes.js:1-5,83,115,124`
- Modify: `src/managers/env.js:131-142`

- [ ] **Step 1: Add DOMPurify CDN to index.html**

In `public/index.html`, add after the bootstrap script line (around line 10):
```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

- [ ] **Step 2: Import and use DOMPurify in notes.js**

In `src/managers/notes.js`, add at the top after imports:
```javascript
// DOMPurify is loaded via CDN, available as global `DOMPurify`
const sanitizeHTML = (html) => DOMPurify ? DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'img', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre', 'hr', 'sub', 'sup', 'del', 'ins', 'mark', 'small', 'strike', 'figure', 'figcaption'] }) : html;
```

- [ ] **Step 3: Sanitize note title in renderItems**

In `src/managers/notes.js` around line 88, change:
```javascript
<h5 class="mb-0 me-2">${item.Note}</h5>
```
to:
```javascript
<h5 class="mb-0 me-2">${sanitizeHTML(item.Note)}</h5>
```

- [ ] **Step 4: Sanitize env API key display**

In `src/managers/env.js` lines 131-142, wrap `envObj.APIKEY` with DOMPurify:
```javascript
divCardTitle.innerHTML = `
  <div class="d-flex align-items-center">
    <h5 class="mb-0 me-2">${DOMPurify ? DOMPurify.sanitize(envObj.APIKEY) : envObj.APIKEY}</h5>
  </div>
  ...
```

- [ ] **Step 5: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

### Task 2: Fix null safety across the codebase

**Files:**
- Modify: `src/script.js:106,125-134,182-186`
- Modify: `src/managers/notes.js:174`
- Modify: `src/managers/env.js:6-18`

- [ ] **Step 1: Add tinymce null check in handleContainerEventClick**

In `src/script.js` line 106, change:
```javascript
tinymce.get('editor').setContent(note.example);
```
to:
```javascript
const editor = tinymce.get('editor');
if (editor) editor.setContent(note.example);
```

- [ ] **Step 2: Add null check in onClickCopy**

In `src/script.js` lines 182-186, change to:
```javascript
function onClickCopy(id) {
  const item = getNoteById(id);
  if (!item) {
    handleAlert(Alert.DANGER, "Note not found", DurationLength.SHORT);
    return;
  }
  handleAlert(Alert.INFO, "Text copied to clipboard", DurationLength.SHORT);
  navigator.clipboard.writeText(stripHtmlAdvancedToCopy(item.example || ''));
}
```

- [ ] **Step 3: Add null check for readMore elements**

In `src/script.js` lines 125-134, add guard:
```javascript
else if (action === 'readMore') {
  const exampleWrapper = document.querySelector(`#example-${noteId}`);
  const readMoreButton = document.querySelector(`#readMore-${noteId}`);
  if (!exampleWrapper || !readMoreButton) return;
  exampleWrapper.classList.toggle("expanded");
  ...
}
```

- [ ] **Step 4: Add tinymce null check in handleUpsertNote**

In `src/managers/notes.js` line 174, change to:
```javascript
const editor = tinymce.get('editor');
if (!editor) {
  handleAlert(Alert.DANGER, "Editor not ready. Please try again.", DurationLength.SHORT);
  DOM.loadingOverlay.style.display = 'none';
  return;
}
const example = editor.getContent();
```

- [ ] **Step 5: Add null checks in populateSettings**

In `src/managers/env.js` lines 6-18, add null guards:
```javascript
export function populateSettings(configEnv, cloudinaryConfig) {
  if (DOM.envFirebaseApikey) DOM.envFirebaseApikey.value = configEnv?.APIKEY || '';
  if (DOM.envFirebaseAuthdomain) DOM.envFirebaseAuthdomain.value = configEnv?.AUTHDOMAIN || '';
  if (DOM.envFirebaseProjectid) DOM.envFirebaseProjectid.value = configEnv?.PROJECTID || '';
  if (DOM.envFirebaseStoragebucket) DOM.envFirebaseStoragebucket.value = configEnv?.STORAGEBUCKET || '';
  if (DOM.envFirebaseSenderid) DOM.envFirebaseSenderid.value = configEnv?.MESSAGINGSENDERID || '';
  if (DOM.envFirebaseAppid) DOM.envFirebaseAppid.value = configEnv?.APPID || '';

  if (DOM.envCloudinaryCloudname) DOM.envCloudinaryCloudname.value = cloudinaryConfig?.CLOUDINARY_CLOUDNAME || '';
  if (DOM.envCloudinaryUploadpreset) DOM.envCloudinaryUploadpreset.value = cloudinaryConfig?.CLOUDINARY_UPLOADPRESET || '';
  if (DOM.envCloudinaryApikey) DOM.envCloudinaryApikey.value = cloudinaryConfig?.CLOUDINARY_APIKEY || '';
  if (DOM.envCloudinaryApisecret) DOM.envCloudinaryApisecret.value = cloudinaryConfig?.CLOUDINARY_APISECRET || '';
}
```

- [ ] **Step 6: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

### Task 3: Fix timestamp handling and backup serialization

**Files:**
- Modify: `src/managers/notes.js:23-31,41-46,49-51,106,197-206`

- [ ] **Step 1: Convert Firestore Timestamps to serializable format in renderNotes**

In `src/managers/notes.js` lines 23-31, change timestamp to:
```javascript
timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
```

- [ ] **Step 2: Fix backupData to serialize timestamps**

In `src/managers/notes.js` lines 49-51, change to:
```javascript
function backupData() {
  const serializable = listItem.map(item => ({
    ...item,
    timestamp: item.timestamp instanceof Date ? item.timestamp.toISOString() : item.timestamp
  }));
  localStorage.setItem('NotesBackups', JSON.stringify(serializable));
}
```

- [ ] **Step 3: Fix timestamp rendering to handle both Date and ISO string**

In `src/managers/notes.js` line 106, change:
```javascript
${(item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp)).toLocaleString()}
```

- [ ] **Step 4: Fix backup in catch block to use ISO string timestamp**

In `src/managers/notes.js` lines 197-206, change backup push to:
```javascript
timestamp: new Date().toISOString(),
```

- [ ] **Step 5: Fix renderNotes catch block to re-render from backup**

In `src/managers/notes.js` lines 41-46, change to:
```javascript
} catch (e) {
  handleAlert(Alert.DANGER, "Error getting documents: " + e.message, DurationLength.LONG);
  listItem = localStorage.getItem('NotesBackups') ? JSON.parse(localStorage.getItem('NotesBackups')) : [];
  listItem = listItem.map(item => ({
    ...item,
    timestamp: item.timestamp ? new Date(item.timestamp) : new Date()
  }));
  loadData(categoryPageSize, currentCategorySelected);
} finally {
```

- [ ] **Step 6: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

---

## Chunk 2: High Priority Bug Fixes

### Task 4: Fix Firebase deleteApp safety, fetch error handling, and error handling

**Files:**
- Modify: `src/managers/firebase.js:37-64,67-108`

- [ ] **Step 1: Add response.ok check to fetch in loadEnv**

In `src/managers/firebase.js` lines 39-40, change:
```javascript
const response = await fetch('/env');
if (!response.ok) {
  throw new Error(`Failed to load env file: HTTP ${response.status}`);
}
const text = await response.text();
```

- [ ] **Step 2: Add safety check around deleteApp**

In `src/managers/firebase.js` lines 69-73, change to:
```javascript
if (app) {
  try {
    await deleteApp(app);
  } catch (e) {
    console.warn('Error deleting Firebase app:', e.message);
  }
  app = null;
  db = null;
}
```

- [ ] **Step 3: Replace no-op catch block with proper error handling**

In `src/managers/firebase.js` lines 104-107, change to:
```javascript
  } catch (error) {
    handleAlert(Alert.DANGER, `Firebase setup failed: ${error.message}`, DurationLength.LONG);
    return false;
  }
```

- [ ] **Step 4: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

### Task 5: Fix Cloudinary alert spam and category state preservation

**Files:**
- Modify: `src/managers/cloudinary.js:55-99`
- Modify: `src/managers/notes.js:1-9,228-249,213-226,255-265,267-275`

- [ ] **Step 1: Add currentCategoryFilter state variable**

In `src/managers/notes.js`, add after `let listCategories = [];`:
```javascript
let currentCategoryFilter = null;
export function getCurrentCategory() { return currentCategoryFilter; }
```

- [ ] **Step 2: Update handleCategoryClick to set the filter**

In `src/managers/notes.js` `handleCategoryClick`, add before return:
```javascript
currentCategoryFilter = newCategory;
```

- [ ] **Step 3: Consolidate Cloudinary cleanup alerts**

In `src/managers/cloudinary.js` lines 55-99, replace the for loop with accumulated results:
```javascript
setLoading(true);
let deletedCount = 0;
let failedCount = 0;
try {
  for (const img of unusedImages) {
    try {
      const urlParts = img.url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) continue;

      const pathAfterUpload = urlParts.slice(uploadIndex + 1);
      const lastPart = pathAfterUpload[pathAfterUpload.length - 1];
      const publicId = lastPart.split('.')[0];
      const timestamp = Math.floor(Date.now() / 1000);

      const params = {
        public_id: publicId,
        timestamp: timestamp,
        invalidate: true
      };

      const signature = await generateCloudinarySignature(params, configCloudinary.CLOUDINARY_APISECRET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${configCloudinary.CLOUDINARY_CLOUDNAME}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          api_key: configCloudinary.CLOUDINARY_APIKEY,
          signature: signature
        })
      });

      const data = await response.json();
      if (data.result === 'ok') {
        await deleteDoc(doc(db, `note-images/${img.id}`));
        deletedCount++;
      } else {
        failedCount++;
      }
    } catch (error) {
      failedCount++;
    }
  }

  if (deletedCount > 0 || failedCount > 0) {
    const message = `Cleanup complete: ${deletedCount} deleted, ${failedCount} failed.`;
    handleAlert(failedCount > 0 ? Alert.WARNING : Alert.INFO, message, DurationLength.MEDIUM);
  }
} finally {
  setLoading(false);
}
```

- [ ] **Step 4: Fix togglePin to preserve current category**

In `src/managers/notes.js` line 241, change:
```javascript
filterAndRender(null, getCurrentCategory(), 5);
```

- [ ] **Step 5: Fix deleteNote to preserve current category**

In `src/managers/notes.js` line 218, change:
```javascript
await renderNotes(5, getCurrentCategory());
```

- [ ] **Step 6: Fix expandCategoryPageSize to preserve category**

In `src/managers/notes.js` line 269, change:
```javascript
loadCategory(categoryPageSize, getCurrentCategory());
```

- [ ] **Step 7: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

### Task 6: Fix loose equality, category name attr, escaped quotes, TinyMCE race condition

**Files:**
- Modify: `src/managers/notes.js:187`
- Modify: `public/index.html:160`
- Modify: `src/utils.js:9`
- Modify: `src/ui/theme.js:3,59-89,18`
- Modify: `public/index.html:10-12`

- [ ] **Step 1: Fix loose equality in handleUpsertNote**

In `src/managers/notes.js` line 187, change:
```javascript
if ((!id || id === '') && isClickNewButton) {
```

- [ ] **Step 2: Add name="category" to category input**

In `public/index.html` line 160, change:
```html
<input type="text" autocomplete="off" class="form-control form-control-sm" list="categoriesList" id="category" name="category" placeholder="category">
```

- [ ] **Step 3: Fix escaped quote handling in handleTextEnv**

In `src/utils.js` line 9, change:
```javascript
const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
```

- [ ] **Step 4: Add debounce guard to theme toggle**

In `src/ui/theme.js`, add at top after `let darkTheme = ...`:
```javascript
let isThemeToggling = false;
```

Wrap `toggleTheme` with guard and reset on editor init:
```javascript
export function toggleTheme(onEditorReady) {
  if (isThemeToggling) return;
  isThemeToggling = true;
  // ... existing toggle logic ...
  applyTinyMCETheme(darkTheme, () => {
    isThemeToggling = false;
    if (onEditorReady) onEditorReady();
  });
}
```

- [ ] **Step 5: Update TinyMCE dark theme background**

In `src/ui/theme.js` line 18, change:
```javascript
editor.getBody().style.backgroundColor = isDark ? '#0f172a' : '#f0f2f5';
```

- [ ] **Step 6: Remove duplicate Bootstrap scripts**

In `public/index.html` lines 10-12, keep only:
```html
<script src="../Js/bootstrap.bundle.min.js"></script>
```

- [ ] **Step 7: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

---

## Chunk 3: Modern Theme Redesign

### Task 7: Redesign light theme - clean, modern, electric

**Files:**
- Modify: `css/styles.css:99-124`

- [ ] **Step 1: Replace light theme with modern palette**

Replace the entire `body.light-theme` block (lines 99-124) with:

```css
/* ============ THEME: LIGHT (Modern Electronic) ============ */
body.light-theme {
  --background-color: #f0f2f5;
  --text-color: #1a1a2e;
  --input-background-color: #ffffff;
  --input-text-color: #1a1a2e;
  --input-border-color: #d1d5db;
  --card-background-color: #ffffff;
  --card-text-color: #1a1a2e;
  --modal-background-color: #ffffff;
  --modal-text-color: #1a1a2e;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --primary-glow: rgba(59, 130, 246, 0.15);
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --info-color: #06b6d4;
  --light-color: #f8fafc;
  --dark-color: #1e293b;
  --accordion-bg: #ffffff;
  --accordion-text: #1a1a2e;
  --accordion-border: #e5e7eb;
  --accordion-hover: #f1f5f9;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --card-hover-shadow: 0 10px 25px rgba(59, 130, 246, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --neon-glow: 0 0 8px rgba(59, 130, 246, 0.3);
  --gradient-primary: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  --gradient-card: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
}
```

- [ ] **Step 2: Add glass-morphism effects for light theme**

Add after the light theme block:

```css
/* ============ GLASS-MORPHISM: LIGHT ============ */
body.light-theme .card {
  background: var(--gradient-card);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

body.light-theme .modal-content {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}

body.light-theme .accordion-item {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
}

body.light-theme .btn-primary {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--neon-glow);
}

body.light-theme .btn-primary:hover {
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.5);
}

body.light-theme input[type="text"],
body.light-theme textarea {
  border-radius: 8px;
}

body.light-theme input[type="text"]:focus,
body.light-theme textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-glow), var(--neon-glow);
}

body.light-theme .loading-overlay {
  background: rgba(240, 242, 245, 0.9);
  backdrop-filter: blur(8px);
}

body.light-theme .config-warning-overlay {
  background: rgba(240, 242, 245, 0.85);
  backdrop-filter: blur(12px);
}

body.light-theme .config-warning-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}
```

- [ ] **Step 3: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

### Task 8: Redesign dark theme - deep navy, neon accents

**Files:**
- Modify: `css/styles.css:127-151`

- [ ] **Step 1: Replace dark theme with modern palette**

Replace the entire `body.dark-theme` block (lines 127-151) with:

```css
/* ============ THEME: DARK (Modern Electronic) ============ */
body.dark-theme {
  --background-color: #0f172a;
  --text-color: #e2e8f0;
  --input-background-color: #1e293b;
  --input-text-color: #e2e8f0;
  --input-border-color: #334155;
  --card-background-color: #1e293b;
  --card-text-color: #e2e8f0;
  --modal-background-color: #1e293b;
  --modal-text-color: #e2e8f0;
  --primary-color: #60a5fa;
  --primary-hover: #93c5fd;
  --primary-glow: rgba(96, 165, 250, 0.2);
  --secondary-color: #94a3b8;
  --success-color: #34d399;
  --danger-color: #f87171;
  --warning-color: #fbbf24;
  --info-color: #22d3ee;
  --light-color: #334155;
  --dark-color: #0f172a;
  --accordion-bg: #1e293b;
  --accordion-text: #e2e8f0;
  --accordion-border: #334155;
  --accordion-hover: #2d3a4f;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --card-hover-shadow: 0 10px 25px rgba(96, 165, 250, 0.15), 0 4px 10px rgba(0, 0, 0, 0.3);
  --glass-bg: rgba(30, 41, 59, 0.85);
  --glass-border: rgba(51, 65, 85, 0.5);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --neon-glow: 0 0 12px rgba(96, 165, 250, 0.4), 0 0 24px rgba(96, 165, 250, 0.2);
  --gradient-primary: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  --gradient-card: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
}
```

- [ ] **Step 2: Add dark theme glass-morphism and neon effects**

Add after the dark theme block:

```css
/* ============ GLASS-MORPHISM: DARK ============ */
body.dark-theme .card {
  background: var(--gradient-card);
  border: 1px solid rgba(51, 65, 85, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

body.dark-theme .card:hover {
  border-color: rgba(96, 165, 250, 0.3);
  box-shadow: var(--card-hover-shadow);
}

body.dark-theme .modal-content {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}

body.dark-theme .accordion-item {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
}

body.dark-theme .accordion-button:not(.collapsed) {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(167, 139, 250, 0.05) 100%);
  color: var(--primary-color);
}

body.dark-theme .accordion-button:focus {
  box-shadow: 0 0 0 2px var(--primary-glow);
}

body.dark-theme .btn-primary {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--neon-glow);
}

body.dark-theme .btn-primary:hover {
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.6), 0 0 40px rgba(96, 165, 250, 0.3);
}

body.dark-theme input[type="text"],
body.dark-theme textarea {
  border-radius: 8px;
}

body.dark-theme input[type="text"]:focus,
body.dark-theme textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-glow), var(--neon-glow);
}

body.dark-theme .loading-overlay {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
}

body.dark-theme .config-warning-overlay {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
}

body.dark-theme .config-warning-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 0 30px rgba(96, 165, 250, 0.1);
}

body.dark-theme .button-click-category:hover,
body.dark-theme .button-click-category-more:hover {
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.5);
}

body.dark-theme #scrollToTopBtn {
  box-shadow: var(--neon-glow);
}

body.dark-theme #btn-clean-images:hover {
  box-shadow: 0 0 12px rgba(52, 211, 153, 0.5);
}

body.dark-theme #theme-switcher:hover {
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
}

body.dark-theme #setting-env:hover {
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.5);
}
```

- [ ] **Step 3: Update card-title hardcoded colors**

In `css/styles.css` lines 230-238, change to:
```css
.card-title.dark-theme {
  color: #e2e8f0;
  background-color: transparent;
}

.card-title.light-theme {
  color: #1a1a2e;
  background-color: transparent;
}
```

- [ ] **Step 4: Remove duplicate loading overlay from index.html**

In `public/index.html`, remove lines 16-28 (the inline `<style>` block with `.loading-overlay`).

- [ ] **Step 5: Build and verify**

Run: `npx webpack`
Expected: Build succeeds with no errors

---

## Summary of Changes

### Bugs Fixed:
1. ✅ XSS via innerHTML - DOMPurify sanitization (keeps img/br/p tags)
2. ✅ tinymce.get('editor') null checks - 3 locations
3. ✅ onClickCopy null check for missing notes
4. ✅ readMore null check for missing elements
5. ✅ Firestore Timestamp serialization - backup/restore
6. ✅ Timestamp rendering - handle Date and ISO string
7. ✅ renderNotes catch block - re-render from backup
8. ✅ Loose equality `id == ''` → `!id || id === ''`
9. ✅ Category input missing `name` attribute
10. ✅ deleteApp safety with try/catch
11. ✅ No-op catch block replaced with proper error handling
12. ✅ Cloudinary alert spam consolidated
13. ✅ togglePin preserves current category
14. ✅ deleteNote preserves current category
15. ✅ expandCategoryPageSize preserves category
16. ✅ populateSettings null DOM checks
17. ✅ Escaped quote handling in handleTextEnv
18. ✅ TinyMCE race condition on theme toggle
19. ✅ Duplicate Bootstrap scripts removed

### Theme Updates:
- Light: Clean whites (#f0f2f5), electric blue (#3b82f6), purple accents, glass-morphism
- Dark: Deep navy (#0f172a), neon blue (#60a5fa), purple gradients, glow effects
- Both: Modern rounded corners, backdrop-filter blur, gradient buttons, neon hover effects
