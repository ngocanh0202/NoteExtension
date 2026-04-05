# Bug Fixes Specification

## Overview
Fix 8 identified bugs in the NoteExtension codebase to establish a stable baseline before refactoring.

## Bug Fixes

### Bug #1: Critical - Data Corruption in Error Handler
**Location**: `src/script.js:697`
**Problem**: `listItemTemp = listItemTemp.push({...})` assigns the return value of `push()` (a number) to `listItemTemp`, corrupting the array.
**Fix**: Remove the assignment. `push()` mutates the array in-place.
**Impact**: After any failed save, all subsequent note operations break because `listItemTemp` becomes a number.

### Bug #2: High - Stacked Event Listeners on Delete
**Location**: `src/script.js:778`
**Problem**: `btnDelete.addEventListener('click', handleDeleteNote)` adds a new listener every time delete is clicked.
**Fix**: Use `{ once: true }` option to auto-remove after first trigger.
**Impact**: Multiple delete operations triggered per click, causing unpredictable behavior.

### Bug #3: High - DOM Re-render in Loop
**Location**: `src/script.js:509-550`
**Problem**: `containerWords.innerHTML +=` in forEach loop causes full DOM re-render each iteration.
**Fix**: Build HTML string first, then assign once with `innerHTML = html`.
**Impact**: Performance degradation and loss of event listeners on previously rendered items.

### Bug #4: Medium - Loading Overlay Flickering
**Location**: `src/script.js:660-662`
**Problem**: `finally` block inside `for` loop hides loading overlay after each image deletion.
**Fix**: Move `finally` block outside the `for` loop.
**Impact**: UI flickers during orphaned image cleanup, confusing users.

### Bug #5: Low - Unnecessary DOMContentLoaded Wrapper
**Location**: `src/scriptEnv.js:3`
**Problem**: `DOMContentLoaded` event listener with `type="module"` script (modules defer by default).
**Fix**: Remove the `DOMContentLoaded` wrapper, execute code directly.
**Impact**: Event may have already fired, causing initialization to be skipped.

### Bug #6: Low - Temporal Dead Zone Risk
**Location**: `src/script.js:352-353`
**Problem**: `categoryPageSize` and `currentCategorySelected` used in `resetFirebaseApp()` before declaration (lines 417-418).
**Fix**: Move variable declarations to top of script scope.
**Impact**: Potential runtime errors in edge cases.

### Bug #7: Medium - Search Loses Original Data
**Location**: `src/script.js:714-718`
**Problem**: Search function mutates `listItem`, losing original data after first search.
**Fix**: Ensure search always filters from `listItemTemp` (the original data source).
**Impact**: Can't search again or filter by category after initial search.

### Bug #8: Medium - Duplicate DOM Queries
**Location**: `src/script.js` + `src/scriptEnv.js`
**Problem**: Both files independently query same DOM elements, creating duplicate state.
**Fix**: Centralize DOM references (to be addressed in refactoring change).
**Impact**: Potential race conditions and inconsistent state.

## Testing Requirements

After fixes:
1. Notes CRUD operations work correctly
2. Failed saves don't break subsequent operations
3. Delete button triggers single delete operation
4. Note list renders efficiently without flickering
5. Loading overlay stays visible during batch operations
6. Search works multiple times without data loss
7. Category filtering works after search
8. Environment switching works correctly
9. Theme switching works correctly
10. Image upload and cleanup work correctly
