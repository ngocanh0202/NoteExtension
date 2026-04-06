## ADDED Requirements

### Requirement: Login button in header
The extension popup SHALL display a login button in the header toolbar when the user is not authenticated.

#### Scenario: Unauthenticated user sees login button
- **WHEN** the popup opens and no user is authenticated
- **THEN** a login button is visible in the header toolbar

#### Scenario: Authenticated user sees logout button
- **WHEN** the popup opens and a user is authenticated
- **THEN** the login button is replaced with a logout button showing the user's email

### Requirement: Authentication warning overlay
The system SHALL display a warning overlay when the user is not authenticated, indicating that login is required to use notes functionality.

#### Scenario: Unauthenticated state warning
- **WHEN** the user is not authenticated
- **THEN** a warning overlay is displayed blocking note interactions with a message to sign in

#### Scenario: Authenticated state removes warning
- **WHEN** the user successfully authenticates
- **THEN** the warning overlay is removed and the full note UI becomes interactive

### Requirement: User identity display
The system SHALL display the authenticated user's Google email address and profile photo in the header when logged in.

#### Scenario: Displaying user identity
- **WHEN** a user is authenticated via Google Sign-In
- **THEN** the user's email address is shown in the header next to the logout button

#### Scenario: User identity on hover
- **WHEN** the user hovers over their profile area
- **THEN** the full email address and sign-out option are visible

### Requirement: Auth state transitions
The UI SHALL smoothly transition between authenticated and unauthenticated states without requiring a popup reload.

#### Scenario: Login transition
- **WHEN** a user completes sign-in
- **THEN** the UI transitions from login state to showing notes without closing the popup

#### Scenario: Logout transition
- **WHEN** a user signs out
- **THEN** the UI transitions to the login state, clearing all displayed notes and editor content
