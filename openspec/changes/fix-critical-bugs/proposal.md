## Why

The NoteExtension contains 8 identified bugs that impact reliability and user experience. One critical bug causes data corruption after failed saves, two high-severity bugs cause performance degradation and unexpected behavior, and five medium/low bugs create UI inconsistencies and potential race conditions. These must be fixed before any refactoring to ensure a stable baseline.

## What Changes

- **Fix Critical Bug #1**: `listItemTemp = listItemTemp.push()` assigns number instead of array, breaking all subsequent operations after failed save
- **Fix High Bug #2**: Stacked delete event listeners cause multiple delete operations per click
- **Fix High Bug #3**: `innerHTML +=` in loop causes full DOM re-render each iteration, losing event listeners
- **Fix Medium Bug #4**: Loading overlay hidden inside loop instead of after all operations complete
- **Fix Low Bug #5**: `DOMContentLoaded` wrapper unnecessary with `type="module"` scripts
- **Fix Low Bug #6**: Temporal dead zone risk with variables used before declaration
- **Fix Code Quality**: Improve search function to always filter from original data source

## Capabilities

### New Capabilities
- `bug-fixes`: Core stability fixes for note management, event handling, and DOM rendering

### Modified Capabilities
- None (bug fixes preserve existing behavior, just correct broken functionality)

## Impact

- **Affected Files**: `src/script.js` (6 bug fixes), `src/scriptEnv.js` (1 fix)
- **No New Files**: All fixes applied to existing code
- **No Breaking Changes**: All functionality preserved, bugs corrected
- **Build**: Unchanged (`npx webpack` still works)
- **User Impact**: Transparent fixes - no UI or API changes
