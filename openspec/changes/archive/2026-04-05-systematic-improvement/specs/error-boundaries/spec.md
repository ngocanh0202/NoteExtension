## ADDED Requirements

### Requirement: Firebase operation error boundaries
Each Firebase operation (read, create, update, delete) SHALL be wrapped in its own try/catch block. On failure, the system SHALL display an alert and attempt localStorage fallback where applicable.

#### Scenario: Firestore read fails
- **WHEN** `getDocs(collection(db, "Notes"))` throws an error
- **THEN** an error alert is displayed with the error message
- **AND** `listItem` is populated from `localStorage.getItem('NotesBackups')`
- **AND** the loading overlay is hidden

#### Scenario: Firestore write fails
- **WHEN** `addDoc` or `updateDoc` throws an error
- **THEN** an error alert is displayed with the error message
- **AND** the note data is saved to localStorage backup
- **AND** the loading overlay is hidden

#### Scenario: Firestore delete fails
- **WHEN** `deleteDoc` throws an error
- **THEN** an error alert is displayed with the error message
- **AND** the loading overlay is hidden
- **AND** the delete confirmation modal is closed

### Requirement: Cloudinary operation error handling
Cloudinary image upload and cleanup operations SHALL handle failures gracefully without crashing the application.

#### Scenario: Image upload fails
- **WHEN** the Cloudinary upload API returns a non-200 response
- **THEN** the progress text is replaced with an error message in the editor
- **AND** the error is logged to console

#### Scenario: Image cleanup fails
- **WHEN** deleting an orphaned image from Cloudinary fails
- **THEN** an error alert is displayed
- **AND** the cleanup continues with remaining images
- **AND** the failure does not stop processing other images

#### Scenario: Cloudinary not configured
- **WHEN** a paste image event occurs without Cloudinary configuration
- **THEN** a warning alert is displayed
- **AND** the settings modal opens with the Cloudinary section expanded
- **AND** the editor shows a "not configured" message

### Requirement: Firebase initialization error recovery
Firebase initialization failures SHALL be caught and displayed to the user without crashing the extension popup.

#### Scenario: Missing Firebase config
- **WHEN** required Firebase environment variables are missing
- **THEN** a configuration warning overlay is displayed
- **AND** the user is prompted to configure Firebase via settings

#### Scenario: Invalid Firebase config
- **WHEN** Firebase initialization fails with invalid credentials
- **THEN** an error alert is displayed with the error message
- **AND** the configuration warning overlay is shown

### Requirement: Settings validation before save
The settings form SHALL validate all required fields before attempting to save and reinitialize Firebase.

#### Scenario: Missing Firebase fields
- **WHEN** user clicks save with missing required Firebase fields
- **THEN** a warning alert lists the missing fields
- **AND** Firebase is NOT reinitialized
- **AND** the settings modal remains open

#### Scenario: Missing Cloudinary fields
- **WHEN** user clicks save with missing Cloudinary fields
- **THEN** a warning alert lists the missing Cloudinary fields
- **AND** Firebase IS reinitialized (Cloudinary is optional)
- **AND** the missing Cloudinary fields are not saved to localStorage

#### Scenario: All fields valid
- **WHEN** user clicks save with all required Firebase fields filled
- **THEN** Firebase is reinitialized with the new config
- **AND** Cloudinary config is saved to localStorage if complete
- **AND** the settings modal closes on success
