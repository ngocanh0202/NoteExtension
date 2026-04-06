## Why

Currently, the extension cannot be distributed as a single folder. Users must load the entire project root to install the extension. This makes distribution difficult and requires maintaining two separate directory structures (root for development, public/ for build output). By restructuring to put everything in public/, users can simply load the public/ folder to install the extension after building.

## What Changes

- Copy all required resources (css/, Js/, icons/, images/, tinymce/) into public/ folder
- Move contextMenusNote.js (service worker) into public/
- Move manifest.json into public/
- Update manifest.json: change default_popup from "./public/index.html" to "index.html"
- Update index.html: remove "../" prefix from all relative paths (since all resources are now in the same folder)
- Delete public/bundle.js.map (source map not needed for distribution)

## Capabilities

### New Capabilities
- **standalone-public-folder**: Makes the public/ folder a fully self-contained extension package that can be loaded directly into Chrome/Firefox

### Modified Capabilities
- None

## Impact

- Build process: No changes needed, webpack already outputs to public/
- Distribution: Users can now just load the public/ folder after building
- No breaking changes to extension functionality
