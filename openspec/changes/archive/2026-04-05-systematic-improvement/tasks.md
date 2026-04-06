## 1. CSS Accessibility Improvements

- [x] 1.1 Add `@media (prefers-reduced-motion: reduce)` block to disable non-essential animations (fadeInUp, scaleIn, bounceIn, shimmer, spin, pulse)
- [x] 1.2 Add `:focus-visible` styles for all interactive elements (buttons, inputs, category badges) with 2px outline in `--primary-color`
- [x] 1.3 Remove `::-webkit-scrollbar { display: none }` and replace with styled scrollbar that respects theme variables
- [x] 1.4 Verify all CSS variables used in components are defined in both `body.light-theme` and `body.dark-theme`
- [x] 1.5 Build with `npx webpack` and verify no CSS build errors

## 2. State Management Refactoring (notes.js)

- [x] 2.1 Remove `listItemTemp` variable and all references to it
- [x] 2.2 Rename `backUpdata()` to `backupData()` and update all call sites
- [x] 2.3 Create internal `getFilteredItems(searchTerm, category)` function that returns a filtered copy without mutating `listItem`
- [x] 2.4 Refactor `handleInputSearch()` to use `getFilteredItems()` — no longer mutates `listItem`
- [x] 2.5 Refactor `handleCategoryClick()` to use `getFilteredItems()` — no longer swaps arrays
- [x] 2.6 Refactor `loadData()` to accept optional filter params and use `getFilteredItems()` internally
- [x] 2.7 Export `filterAndRender(searchTerm, category)` function from notes.js for use by script.js
- [x] 2.8 Update `togglePin()` to update local state then re-sort display without full re-fetch
- [x] 2.9 Build with `npx webpack` and verify no build errors

## 3. Event Delegation with Data Attributes

- [x] 3.1 Update note card template in `loadData()`: add `data-action` and `data-id` to all action buttons (edit, delete, copy, pin, readMore)
- [x] 3.2 Update `handleContainerEventClick()` in script.js to read `data-action` from `e.target.closest('[data-action]')` instead of `id.includes()`
- [x] 3.3 Update environment card template in `handleLoadLogEnvs()`: add `data-action` and `data-env-key` to switch/delete buttons
- [x] 3.4 Update `handleClickInContainer()` in script.js to read `data-action` for env management
- [x] 3.5 Update category badge template in `LoadCategory()`: add `data-action="category"` and `data-category` attributes
- [x] 3.6 Update category event handling in `handleClickInContainer()` to use `data-action` matching
- [x] 3.7 Build with `npx webpack` and verify no build errors

## 4. Dead Code Removal and Bug Fixes

- [x] 4.1 Remove `handleBackEnvWrapper()` function from script.js (references undefined `handleBackEnv`)
- [x] 4.2 Remove `handleBackEnv` import reference if present in env.js
- [x] 4.3 Fix form ID typo: `upserd-Note-form` → `upsert-Note-form` in DOM config and HTML
- [x] 4.4 Remove unused `isClickNewButton` flag if no longer needed after event delegation changes (or keep if still used)
- [x] 4.5 Fix `expandCategoryPageSize()` to use renamed `loadCategory` (camelCase) internally

## 5. Error Boundaries

- [x] 5.1 Add null-safety guards in `alert.js`: check DOM elements exist before calling methods on them
- [x] 5.2 Wrap each Firebase CRUD operation in notes.js with try/catch + localStorage fallback (already partially done, verify completeness)
- [x] 5.3 Add error handling in `togglePin()`: revert local `isPinned` state on Firestore failure
- [x] 5.4 Add null check for `getDb()` before use in cloudinary.js operations
- [x] 5.5 Verify Cloudinary image cleanup continues on individual image failure (already done, confirm)
- [x] 5.6 Build with `npx webpack` and verify no build errors

## 6. Integration Testing and Verification

> **Note**: These tasks require manual testing in the browser with the extension loaded.
> Reload the extension after building with `npx webpack`.

- [ ] 6.1 Test: Open extension → verify notes render correctly
- [ ] 6.2 Test: Search for a term → verify filtered results → clear search → verify full list restored
- [ ] 6.3 Test: Click category → verify filtered results → click same category → verify full list restored
- [ ] 6.4 Test: Create new note → verify appears in list
- [ ] 6.5 Test: Edit note → verify changes saved
- [ ] 6.6 Test: Delete note → verify removed from list
- [ ] 6.7 Test: Toggle pin → verify reordering
- [ ] 6.8 Test: Copy note text → verify clipboard content
- [ ] 6.9 Test: Switch environment → verify Firebase reinitializes
- [ ] 6.10 Test: Toggle theme → verify icons and colors update correctly
- [ ] 6.11 Test: Paste image into editor → verify upload flow (if Cloudinary configured)
- [ ] 6.12 Test: Clean orphaned images → verify cleanup flow (if Cloudinary configured)
