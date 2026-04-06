## ADDED Requirements

### Requirement: Single source of truth for notes
The system SHALL maintain a single `listItem` array as the authoritative source of all notes data. No secondary copy (`listItemTemp`) SHALL exist.

#### Scenario: Initial render populates single list
- **WHEN** `renderNotes()` fetches notes from Firestore
- **THEN** all notes are stored in `listItem` only
- **AND** no secondary array is created

#### Scenario: Local backup updates from single source
- **WHEN** notes are successfully fetched from Firestore
- **THEN** `localStorage.setItem('NotesBackups', ...)` is called with the `listItem` array

#### Scenario: Firestore failure falls back to backup
- **WHEN** Firestore fetch fails
- **THEN** `listItem` is populated from `localStorage.getItem('NotesBackups')`
- **AND** the UI renders from the backup data

### Requirement: Non-mutating search filter
Search SHALL filter notes for display without modifying the source `listItem` array. Clearing search SHALL restore the full list without re-fetching.

#### Scenario: Search filters display
- **WHEN** user types in the search input
- **THEN** a filtered copy of `listItem` is rendered
- **AND** the original `listItem` array remains unchanged

#### Scenario: Clear search restores full list
- **WHEN** user clears the search input
- **THEN** the full `listItem` array is rendered
- **AND** no data is lost or missing

#### Scenario: Search across title and content
- **WHEN** user searches for a term
- **THEN** notes matching the term in `Note` (title) or `otherExample` (stripped content) are shown

### Requirement: Non-mutating category filter
Category selection SHALL filter notes for display without modifying the source `listItem` array. Deselecting a category SHALL restore the full list.

#### Scenario: Category filters display
- **WHEN** user clicks a category badge
- **THEN** only notes with that category are rendered
- **AND** the original `listItem` array remains unchanged

#### Scenario: Deselect category restores full list
- **WHEN** user clicks the same category badge again (toggle off)
- **THEN** the full `listItem` array is rendered

### Requirement: Combined search and category filter
When both search and category filter are active, notes SHALL match both criteria simultaneously.

#### Scenario: Both filters active
- **WHEN** a search term is entered AND a category is selected
- **THEN** only notes matching the search term AND the selected category are rendered

### Requirement: State persistence on CRUD operations
After any create, update, or delete operation, the system SHALL re-fetch from Firestore and rebuild `listItem` as the single source of truth.

#### Scenario: Note creation updates state
- **WHEN** a new note is added via `handleUpsertNote`
- **THEN** `renderNotes` is called to re-fetch and rebuild `listItem`

#### Scenario: Note deletion updates state
- **WHEN** a note is deleted via `deleteNote`
- **THEN** `renderNotes` is called to re-fetch and rebuild `listItem`

### Requirement: Pin state updates without full re-fetch
Toggling pin SHALL update the local `listItem` immediately, persist to Firestore, and re-sort the display without a full re-fetch.

#### Scenario: Toggle pin updates local and remote
- **WHEN** user clicks the pin button on a note
- **THEN** `isPinned` is toggled in `listItem` immediately
- **AND** Firestore is updated with the new `isPinned` value
- **AND** the display is re-sorted to reflect the new pin state
