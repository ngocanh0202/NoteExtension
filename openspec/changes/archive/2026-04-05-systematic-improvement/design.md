## Context

NoteExtension is a Manifest V3 browser extension for note-taking with Firebase Firestore sync and Cloudinary image uploads. The current codebase has a modular structure (`config/`, `managers/`, `ui/`) but suffers from:

1. **Fragile event delegation**: Uses `id.includes('edit')` which can match unintended elements (e.g., `id.includes('id')` matches everything)
2. **State duplication**: `listItem` and `listItemTemp` create two sources of truth; search permanently mutates `listItem`
3. **Dead code**: `handleBackEnvWrapper` references undefined `handleBackEnv`
4. **Hidden dependencies**: `script.js` calls non-exported functions `loadData` and `LoadCategory` from `notes.js` (works because webpack bundles everything, but breaks module boundaries)
5. **CSS gaps**: No `prefers-reduced-motion`, inconsistent focus states, scrollbar hiding removes accessibility

**Constraints**: Must maintain backward compatibility with existing `env` file format, localStorage keys, and Firebase/Cloudinary APIs. No test infrastructure exists — changes must be verifiable via manual testing in the extension popup.

## Goals / Non-Goals

**Goals:**
- Fix all identified logic bugs (ID collision, search data loss, undefined functions)
- Establish single source of truth for notes state
- Use `data-*` attributes for robust event delegation
- Add CSS accessibility (focus states, reduced-motion, visible scrollbars)
- Improve error handling with proper boundaries
- Maintain full backward compatibility

**Non-Goals:**
- No rewrite of architecture (keep config/managers/ui structure)
- No new dependencies
- No test infrastructure setup (out of scope)
- No changes to Firebase/Cloudinary API contracts
- No changes to `env` file format or localStorage key names

## Decisions

### 1. Event delegation: `data-*` attributes over `id.includes()`
**Decision**: Replace `id.includes('edit')` with `data-action="edit"` and `data-id="..."`
**Rationale**: `includes()` is fragile — `id.includes('id')` matches every element. `data-*` attributes are explicit, semantic, and don't collide.
**Alternatives considered**: 
- `id.startsWith('edit-')` — better but still fragile if naming conventions drift
- `class` matching — works but `data-action` is more semantic and standard

### 2. State: Single `listItem` with computed filtered view
**Decision**: Keep `listItem` as the single source of truth. Search/category filtering creates a temporary filtered array for rendering, never mutates `listItem`. Remove `listItemTemp` entirely.
**Rationale**: The dual-array pattern causes data loss. `listItemTemp` was a workaround for search that mutates the source — better to make search non-mutating.
**Alternatives considered**:
- Keep both arrays but fix the mutation — still confusing, violates single source of truth
- Use a proper state manager (Zustand, etc.) — overkill for extension, adds dependency

### 3. Function visibility: Export only what's needed
**Decision**: Keep `loadData` and `LoadCategory` as internal to `notes.js`. Instead, expose a `filterAndRender` function that handles search/category filtering + rendering in one call.
**Rationale**: `script.js` shouldn't call internal rendering functions. A single `filterAndRender` API is cleaner and encapsulates the filter+render logic.

### 4. CSS: Progressive enhancement over rewrite
**Decision**: Add missing accessibility features to existing CSS without restructuring. Add `@media (prefers-reduced-motion)`, fix focus states, ensure scrollbars are visible.
**Rationale**: The existing CSS is well-organized with clear sections. A rewrite would risk breaking the theme system.

### 5. Error handling: Wrap Firebase calls with try/catch + localStorage fallback
**Decision**: Each Firebase operation (CRUD) catches errors and falls back to localStorage backup. No global error handler.
**Rationale**: Firebase operations are independent — a failure in one shouldn't crash others. localStorage backup already exists, just needs consistent usage.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `data-*` attribute changes require HTML updates in `index.html` and generated card templates | Update both static HTML and dynamic template strings in `loadData` |
| Removing `listItemTemp` may break search/category toggle flow | Thoroughly test: search → clear → category → clear → refresh cycle |
| CSS changes to focus states may alter visual appearance | Keep changes subtle — use existing `--primary-color` for focus rings |
| `LoadCategory` rename to `loadCategory` (camelCase) may break if called externally | Only called within `notes.js` and from `script.js` via `expandCategoryPageSize` — safe to rename |
| Removing dead code (`handleBackEnvWrapper`) may remove intended feature | The function is never wired to any UI element — safe to remove |
