## ADDED Requirements

### Requirement: Notes scoped by userId
Every note document in the Notes collection SHALL include a `userId` field containing the Firebase Auth UID of the note's owner.

#### Scenario: Creating a new note
- **WHEN** an authenticated user creates a note
- **THEN** the note document includes `userId` set to the current user's Firebase Auth UID

#### Scenario: Updating an existing note
- **WHEN** an authenticated user updates their own note
- **THEN** the `userId` field is preserved and not modified

### Requirement: Query filtering by current user
All note read operations SHALL filter results to only include documents where `userId` matches the current authenticated user's UID.

#### Scenario: Loading notes for authenticated user
- **WHEN** an authenticated user opens the popup
- **THEN** only notes with `userId` matching the user's UID are fetched and displayed

#### Scenario: Multiple users' notes in same project
- **WHEN** two different authenticated users open the extension
- **THEN** each user sees only their own notes, not notes from other users

#### Scenario: User with no notes
- **WHEN** an authenticated user has no notes in the collection
- **THEN** an empty state is displayed with an option to create a new note

### Requirement: Ownership validation on write
The system SHALL validate that the current user owns a note before allowing update or delete operations.

#### Scenario: Updating own note
- **WHEN** a user updates a note where `userId` matches their UID
- **THEN** the update succeeds

#### Scenario: Deleting own note
- **WHEN** a user deletes a note where `userId` matches their UID
- **THEN** the deletion succeeds and the note is removed from the UI

#### Scenario: Attempting to modify another user's note
- **WHEN** a user attempts to update or delete a note where `userId` does not match their UID
- **THEN** the operation fails (enforced by Firestore security rules) and an error is displayed

### Requirement: Note-images scoped by user
Image uploads in the `note-images` collection SHALL be associated with the uploading user's UID.

#### Scenario: Uploading an image
- **WHEN** an authenticated user uploads an image via Cloudinary
- **THEN** the image tracking document includes the user's UID

#### Scenario: Cleaning orphaned images
- **WHEN** the image cleanup process runs
- **THEN** only images belonging to the current user are considered for deletion
