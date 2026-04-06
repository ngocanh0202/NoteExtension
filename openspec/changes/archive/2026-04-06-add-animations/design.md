## Context

The NoteExtension popup currently has basic animations (card entrance, button hover) but lacks polish in several key interaction areas. The extension uses Bootstrap 5 CSS and vanilla JavaScript. All animations will be implemented in CSS for performance.

### Current State
- Basic card entrance animations with stagger delays
- Button hover effects with scale and box-shadow
- Modal uses Bootstrap's default animation
- Theme switcher and settings icon have rotation effects

### Constraints
- Must work in Chrome/Firefox extension environment
- All animations must respect `prefers-reduced-motion` for accessibility
- Use CSS transforms/opacity for GPU acceleration
- No external animation libraries (keep bundle size small)

## Goals / Non-Goals

**Goals:**
- Add 9 new animation types for improved UX
- Ensure all animations are smooth (60fps) using CSS transforms/opacity
- Implement proper reduced-motion support
- Maintain backward compatibility

**Non-Goals:**
- Add JavaScript-driven animations (GSAP, anime.js)
- Add 3D or complex animations
- Change existing animation timing (only add new)

## Decisions

### 1. CSS-Only Animations
**Decision**: Implement all animations purely in CSS
**Rationale**: GPU-accelerated, no JavaScript overhead, better performance
**Alternative**: JS libraries (too heavy for extension)

### 2. Animation Naming Convention
**Decision**: Use BEM-like naming (`.animate-{name}`)
**Rationale**: Consistent with existing code style, clear purpose

### 3. Timing Functions
**Decision**: Use `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for interactions
**Rationale**: Matches Bootstrap's animation philosophy, feels natural

### 4. Reduced Motion Strategy
**Decision**: Use `@media (prefers-reduced-motion: reduce)` to disable all animations
**Rationale**: WCAG accessibility requirement, respects user preferences

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Animation conflicts with Bootstrap | Use custom classes, avoid overriding Bootstrap defaults |
| Performance on low-end devices | Use only opacity/transform, avoid layout-triggering properties |
| Extension popup size increase | Keep animations in existing CSS file, no new files |

## Open Questions

- Should animation durations be configurable via localStorage? → **Decision**: No, use sensible defaults
- Should dark theme have different animation colors? → **Decision**: Use CSS variables for all animation colors
