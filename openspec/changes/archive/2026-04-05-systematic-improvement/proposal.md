## Why

The NoteExtension codebase has accumulated multiple logic bugs, fragile patterns, and CSS inconsistencies that cause unreliable behavior in production. Key issues include:

- **ID collision bugs**: `id.includes()` matches wrong elements (e.g., `copy-1` matches `id.includes('pin')` because "copy" contains no "pin", but `id.includes('edit')` on `delete-12` won't match — however `delete-1` would match `id.includes('delete')` AND `id.includes('id')` patterns)
- **Data loss on search**: `handleInputSearch` mutates `listItem` permanently, losing non-matching items until next full render
- **Undefined function**: `handleBackEnv` called but never exported/defined
- **Hidden functions**: `loadData` and `LoadCategory` are module-private but called from `script.js`
- **State duplication**: `listItem` and `listItemTemp` create confusion about source of truth
- **CSS inconsistencies**: Missing accessibility features (focus states, reduced-motion), duplicate rules, theme variable gaps

These bugs compound — a search followed by category filter can permanently lose notes from the UI until page refresh.

## What Changes

- **Fix ID collision**: Replace `id.includes()` with `id.startsWith()` + known prefixes in event delegation
- **Fix search data loss**: `handleInputSearch` filters from `listItemTemp`, never mutates `listItem` directly
- **Fix undefined function**: Remove dead `handleBackEnvWrapper` or implement it properly
- **Fix function visibility**: Export `loadData` and `LoadCategory` or restructure to not need cross-module calls
- **Consolidate state**: Single source of truth for notes list, remove `listItemTemp` duplication
- **Fix typos**: `backUpdata` → `backupData`, `upserd-Note-form` → `upsert-Note-form`
- **CSS improvements**: Add `prefers-reduced-motion` support, consistent focus states, DRY variable definitions, fix scrollbar hiding accessibility issue
- **Error handling**: Add proper error boundaries for Firebase operations, prevent silent failures
- **Event listener cleanup**: Fix potential memory leaks from repeated `addEventListener` calls

## Capabilities

### New Capabilities
- `note-state-management`: Consolidated single-source-of-truth state for notes with proper backup/restore
- `event-delegation`: Robust event delegation using data-* attributes instead of fragile string matching
- `css-accessibility`: Accessibility-compliant CSS with focus states, reduced-motion, and consistent theming
- `error-boundaries`: Proper error handling and recovery for Firebase and Cloudinary operations

### Modified Capabilities
<!-- No existing spec files to modify -->

## Impact

- **src/script.js**: Event delegation rewrite, remove dead code, fix handler logic
- **src/managers/notes.js**: State consolidation, fix search/filter logic, export needed functions
- **src/managers/firebase.js**: Add error boundary patterns, fix config validation flow
- **src/managers/cloudinary.js**: Improve error handling for image cleanup
- **src/managers/env.js**: Fix undefined function reference, improve settings flow
- **src/config/dom.js**: Add missing DOM references if needed
- **src/ui/theme.js**: Fix icon switching consistency
- **src/ui/alert.js**: Add null-safety guards
- **css/styles.css**: Accessibility improvements, DRY variables, consistent theming
- **public/index.html**: Fix form ID typo, add data-* attributes for event delegation
