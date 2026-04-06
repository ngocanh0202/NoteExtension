## Context

The NoteExtension project currently requires loading the entire project root directory to install the extension in Chrome/Firefox. The build output goes to public/, but this folder only contains index.html, bundle.js, and .env file. Other required resources (css/, Js/, icons/, images/, tinymce/) remain in the root directory.

The manifest.json references "./public/index.html" for popup and "contextMenusNote.js" for service worker. The index.html uses "../" relative paths to access resources in root folders.

## Goals / Non-Goals

**Goals:**
- Make public/ folder a fully self-contained extension package
- No changes to extension functionality
- Simple one-time migration

**Non-Goals:**
- No changes to build process (webpack configuration stays the same)
- No new features or bug fixes
- No changes to source code (src/)

## Decisions

1. **Copy vs Move**: Use copy approach to keep original files for development
   - Rationale: Developers need the full project structure to continue developing and building

2. **manifest.json location**: Move to public/
   - Rationale: Required by Chrome/Firefox to be in the loaded folder
   - Update default_popup from "./public/index.html" to "index.html"

3. **index.html path updates**: Remove "../" prefix
   - Rationale: All resources now in same folder, paths should be relative to index.html

4. **Delete source map**: Remove public/bundle.js.map
   - Rationale: Not needed for distribution, reduces file size

## Risks / Trade-offs

- [Risk] Forgetting to copy new files after build
  - → Mitigation: Document the process, users need to re-run copy after each build
  
- [Risk] Path errors in index.html
  - → Mitigation: Test locally by loading public/ folder in browser before distributing
