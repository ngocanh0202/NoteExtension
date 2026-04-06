## ADDED Requirements

### Requirement: Google Sign-In authentication
The system SHALL provide Google Sign-In authentication using Firebase Auth with `signInWithPopup()` and `GoogleAuthProvider`.

#### Scenario: Successful sign-in
- **WHEN** user clicks the login button and selects a Google account
- **THEN** the user is authenticated and their notes are loaded

#### Scenario: Sign-in cancelled
- **WHEN** user closes the Google sign-in popup without selecting an account
- **THEN** the system remains in unauthenticated state and shows a warning

#### Scenario: Sign-in failure
- **WHEN** Google sign-in fails due to network error or popup blocked
- **THEN** an error alert is displayed with instructions to allow popups

### Requirement: Auth state persistence
The system SHALL persist the authentication state across popup open/close cycles using Firebase Auth's default localStorage persistence.

#### Scenario: Returning user opens popup
- **WHEN** a previously authenticated user opens the extension popup
- **THEN** the user is automatically recognized as authenticated and notes are loaded without re-login

#### Scenario: Auth state change
- **WHEN** the authentication state changes (login, logout, token refresh)
- **THEN** the UI updates to reflect the current auth state

### Requirement: Sign-out
The system SHALL allow users to sign out, clearing the authentication state and removing all loaded note data from the UI.

#### Scenario: User signs out
- **WHEN** user clicks the logout button
- **THEN** the auth state is cleared, notes are removed from display, and the login prompt is shown

#### Scenario: Sign-out with pending changes
- **WHEN** user signs out while a note editor is open
- **THEN** the editor is closed and any unsaved changes are discarded with a warning

### Requirement: Auth state guard
The system SHALL block all Firestore CRUD operations until the user is authenticated.

#### Scenario: Attempting CRUD without auth
- **WHEN** an unauthenticated user attempts to create, update, or delete a note
- **THEN** the operation is rejected and a login prompt is displayed

#### Scenario: Auth token expires during session
- **WHEN** the Firebase auth token expires while the popup is open
- **THEN** the user is prompted to re-authenticate and all pending operations are paused
