## Why

The NoteExtension popup currently has basic animations but lacks polish in several key interaction areas. Missing animations for search focus, loading states, scroll button, and notifications reduce the perceived quality and user experience. Adding smooth, purposeful animations will improve usability and make the extension feel more professional.

## What Changes

- Add search input focus animation with border glow effect
- Add category badge pulse animation when selected
- Add modal backdrop fade animation
- Add delete confirmation modal scale/fade animation
- Add skeleton shimmer loading states for notes
- Add scroll to top button fade in/out animation
- Add image upload progress bar animation
- Add stagger fade-in animation when rendering notes
- Add slide + fade animation for alert notifications
- Ensure all animations respect `prefers-reduced-motion`

## Capabilities

### New Capabilities

- **ui-animations**: Comprehensive set of UI animations for enhanced user experience including search, categories, modals, loading, scroll, and notifications

### Modified Capabilities

- **css-accessibility**: Extend existing accessibility spec to include animation guidelines for reduced-motion support

## Impact

- **Files Modified**: `css/styles.css`, `public/index.html`
- **No breaking changes**: All animations are additive and enhance existing UI
- **Performance**: Animations use CSS transforms/opacity for GPU acceleration
