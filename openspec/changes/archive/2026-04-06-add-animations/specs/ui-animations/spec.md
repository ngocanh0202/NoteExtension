## ADDED Requirements

### Requirement: Search input focus animation
The search input SHALL display a glowing border animation when focused.

#### Scenario: Search input receives focus
- **WHEN** the search input receives `:focus`
- **THEN** the border color transitions to `--primary-color`
- **AND** a subtle box-shadow glow appears
- **AND** the input scales slightly (1.02x)

#### Scenario: Search input loses focus
- **WHEN** the search input loses focus
- **THEN** the border and shadow animate back to default state

### Requirement: Category badge pulse animation
Selected category badges SHALL display a pulsing animation to indicate active state.

#### Scenario: Category badge is selected
- **WHEN** a category badge has the `.selected` class
- **THEN** a pulse animation plays (scale 1.0 → 1.1 → 1.0)
- **AND** the animation loops indefinitely until deselected

#### Scenario: Category badge is deselected
- **WHEN** the `.selected` class is removed
- **THEN** the pulse animation stops immediately

### Requirement: Modal backdrop fade animation
Modals SHALL have a smooth backdrop fade-in effect when opened.

#### Scenario: Modal opens
- **WHEN** a modal is triggered to open
- **THEN** the backdrop fades in from transparent to semi-transparent (0.5s)
- **AND** the modal dialog slides up with scale animation

#### Scenario: Modal closes
- **WHEN** a modal is dismissed
- **THEN** the backdrop fades out (0.3s)
- **AND** the modal dialog fades out

### Requirement: Delete confirmation modal animation
The delete confirmation modal SHALL display a scale + fade entrance animation.

#### Scenario: Delete confirmation modal appears
- **WHEN** the delete confirmation modal is triggered
- **THEN** it scales from 0.8 to 1.0 with fade-in (0.25s ease-out)

#### Scenario: Delete confirmation modal is dismissed
- **WHEN** the user clicks outside or clicks Close
- **THEN** the modal fades out and scales down (0.2s)

### Requirement: Skeleton shimmer loading states
Notes container SHALL display skeleton loading placeholders while data loads.

#### Scenario: Notes are loading
- **WHEN** notes are being fetched from Firestore
- **THEN** skeleton cards with shimmer animation are displayed
- **AND** the shimmer moves left to right continuously (1.5s loop)

#### Scenario: Notes finish loading
- **WHEN** note data is received
- **THEN** skeleton placeholders are replaced with actual note cards
- **AND** notes animate in with stagger fade-in

### Requirement: Scroll to top button fade animation
The scroll-to-top button SHALL fade in when scrolled down and fade out when at top.

#### Scenario: User scrolls down
- **WHEN** the user scrolls down more than 100px
- **THEN** the scroll-to-top button fades in (opacity 0 → 1, 0.3s)

#### Scenario: User scrolls to top
- **WHEN** the user scrolls to the top (< 50px from top)
- **THEN** the scroll-to-top button fades out (opacity 1 → 0, 0.3s)

#### Scenario: User clicks scroll to top
- **WHEN** the scroll-to-top button is clicked
- **THEN** the button plays a bounce-in animation

### Requirement: Image upload progress animation
Image upload SHALL show a progress bar with animated fill.

#### Scenario: Image upload starts
- **WHEN** an image upload is initiated
- **THEN** a progress bar appears with animated fill from 0% to 100%
- **AND** the fill uses an ease-out timing function

#### Scenario: Image upload completes
- **WHEN** the upload succeeds or fails
- **THEN** the progress bar animates to final state (green for success, red for error)

### Requirement: Notes stagger fade-in animation
Notes SHALL animate in with staggered timing for visual hierarchy.

#### Scenario: Notes are rendered
- **WHEN** note cards are rendered to the DOM
- **THEN** each card animates in with fade-in-up effect
- **AND** each subsequent card has a 50ms delay (card 1: 0ms, card 2: 50ms, card 3: 100ms, etc.)

#### Scenario: Notes are refreshed
- **WHEN** notes are re-rendered (e.g., after new note added)
- **THEN** the stagger animation plays again for new/updated notes

### Requirement: Alert notification slide-fade animation
Alert notifications SHALL slide down and fade in, then slide up and fade out.

#### Scenario: Alert is shown
- **WHEN** an alert (warning/info/danger) is triggered to show
- **THEN** it slides down from top and fades in (0.3s)

#### Scenario: Alert is dismissed
- **WHEN** the alert auto-dismisses or is manually dismissed
- **THEN** it slides up and fades out (0.3s)

### Requirement: All animations respect reduced motion
All UI animations SHALL be disabled when user prefers reduced motion.

#### Scenario: User has reduced motion preference
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** search focus animation transitions instantly
- **THEN** category badge pulse animation is disabled
- **THEN** modal backdrop animation is disabled
- **THEN** skeleton shimmer is disabled (show static placeholder)
- **THEN** scroll button fade animation is disabled (always visible)
- **THEN** note stagger animation is disabled
- **THEN** alert slide-fade is disabled

#### Scenario: User does not prefer reduced motion
- **WHEN** no reduced motion preference is set
- **THEN** all animations function as specified in their respective requirements
