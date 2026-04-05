## Context

The NoteExtension's main codebase (`src/script.js`) is 1009 lines with mixed responsibilities. Eight bugs have been identified through code analysis:
- 1 critical bug causing data corruption
- 2 high-severity bugs causing performance issues and unexpected behavior
- 5 medium/low bugs creating UI inconsistencies and potential race conditions

The codebase uses Firebase v11 (Firestore), Cloudinary for images, TinyMCE for rich editing, and Bootstrap 5 for UI. Built with Webpack 5 + Babel.

## Goals / Non-Goals

**Goals:**
- Fix all 8 identified bugs to establish a stable baseline
- Preserve all existing functionality and user experience
- No breaking changes to APIs, data models, or UI
- Minimal code changes - surgical fixes only

**Non-Goals:**
- No refactoring or restructuring (that comes in a separate change)
- No new features or capabilities
- No changes to build configuration or dependencies
- No changes to `manifest.json` or extension permissions

## Decisions

### Decision 1: Fix bugs in-place vs. rewrite
**Decision**: Fix bugs in the existing `src/script.js` file without restructuring.
**Rationale**: Establish a stable baseline before refactoring. Rewriting while fixing bugs introduces too many variables and makes debugging difficult.
**Alternatives Considered**:
- Rewrite with fixes: Rejected - too risky, hard to verify
- Fix then refactor in same change: Rejected - violates separation of concerns

### Decision 2: Event listener fix approach
**Decision**: Use `{ once: true }` option for delete button listener.
**Rationale**: Simplest fix that prevents listener stacking without changing the event delegation pattern.
**Alternatives Considered**:
- Remove listener before adding: More verbose, same result
- Use `onclick` property: Loses ability to have multiple handlers

### Decision 3: DOM rendering fix approach
**Decision**: Build HTML string first, then single `innerHTML` assignment.
**Rationale**: Fixes both performance and event listener loss issues. Minimal code change.
**Alternatives Considered**:
- `DocumentFragment`: More complex, overkill for this use case
- Individual `appendChild`: Still causes multiple reflows

### Decision 4: Loading overlay fix
**Decision**: Move `finally` block outside the `for` loop.
**Rationale**: Corrects the UI flickering issue. Loading state should cover all operations.
**Alternatives Considered**:
- Remove loading overlay entirely: Loses user feedback
- Add separate loading state per image: Overly complex

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Bug fixes may reveal other hidden issues | Test all CRUD operations after fixes |
| `innerHTML` rebuild still loses dynamic state | Acceptable - state is in `listItem` array, not DOM |
| `{ once: true }` requires re-adding listener per delete | Intentional - matches current behavior pattern |
| Fixes are in monolithic file | Temporary - refactoring change will address this |
