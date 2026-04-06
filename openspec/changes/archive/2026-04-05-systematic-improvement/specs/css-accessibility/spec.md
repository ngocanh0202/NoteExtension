## ADDED Requirements

### Requirement: Reduced motion support
The system SHALL respect the user's `prefers-reduced-motion` preference by disabling non-essential CSS animations when the user has requested reduced motion.

#### Scenario: User prefers reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set in OS/browser settings
- **THEN** all card fade-in animations are disabled
- **AND** all button scale animations are disabled
- **AND** all icon rotation animations are disabled
- **AND** loading shimmer animations are disabled

#### Scenario: User does not prefer reduced motion
- **WHEN** no reduced motion preference is set
- **THEN** all animations function normally

### Requirement: Visible focus indicators
All interactive elements (buttons, inputs, links, badges) SHALL have visible focus indicators that meet WCAG 2.1 AA contrast requirements.

#### Scenario: Button receives keyboard focus
- **WHEN** a button receives `:focus-visible`
- **THEN** a 2px solid outline in `--primary-color` is shown
- **AND** the outline has 2px offset from the element

#### Scenario: Input receives keyboard focus
- **WHEN** an input receives `:focus-visible`
- **THEN** border color changes to `--primary-color`
- **AND** a 2px box-shadow ring is shown

#### Scenario: Category badge receives keyboard focus
- **WHEN** a category badge receives `:focus-visible`
- **THEN** a visible outline is shown

### Requirement: Accessible scrollbar
The notes container SHALL display a visible scrollbar. Hiding scrollbars via `::-webkit-scrollbar { display: none }` SHALL NOT be used.

#### Scenario: Scrollable notes container
- **WHEN** the notes container has overflow content
- **THEN** a visible scrollbar is displayed
- **AND** users can scroll with mouse wheel, trackpad, or keyboard

### Requirement: Consistent theme variables
All theme-dependent colors SHALL use CSS custom properties. Both light and dark themes SHALL define the same set of variables.

#### Scenario: Light theme defines all variables
- **WHEN** the light theme is active
- **THEN** all CSS variables referenced in components are defined on `body.light-theme`

#### Scenario: Dark theme defines all variables
- **WHEN** the dark theme is active
- **THEN** all CSS variables referenced in components are defined on `body.dark-theme`

#### Scenario: Theme transition is smooth
- **WHEN** the theme is toggled
- **THEN** background and text colors transition over 0.4s
- **AND** if reduced motion is preferred, the transition is instant
