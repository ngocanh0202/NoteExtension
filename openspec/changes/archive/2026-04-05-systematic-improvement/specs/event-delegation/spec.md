## ADDED Requirements

### Requirement: Data attributes for action identification
All interactive note action buttons SHALL use `data-action` and `data-id` attributes instead of encoding action and ID in the element's `id` string.

#### Scenario: Edit button uses data attributes
- **WHEN** an edit button is rendered for a note
- **THEN** it has `data-action="edit"` and `data-id="<note-id>"`

#### Scenario: Delete button uses data attributes
- **WHEN** a delete button is rendered for a note
- **THEN** it has `data-action="delete"` and `data-id="<note-id>"`

#### Scenario: Copy button uses data attributes
- **WHEN** a copy button is rendered for a note
- **THEN** it has `data-action="copy"` and `data-id="<note-id>"`

#### Scenario: Pin button uses data attributes
- **WHEN** a pin button is rendered for a note
- **THEN** it has `data-action="pin"` and `data-id="<note-id>"`

#### Scenario: Read more button uses data attributes
- **WHEN** a read more button is rendered for a note
- **THEN** it has `data-action="readMore"` and `data-id="<note-id>"`

### Requirement: Event delegation reads action from data attribute
The container event handler SHALL read `data-action` from the clicked element (or its closest ancestor with the attribute) to determine the action to perform.

#### Scenario: Click on button triggers correct action
- **WHEN** user clicks a button with `data-action="edit"`
- **THEN** the edit handler is invoked with the note ID from `data-id`

#### Scenario: Click on child element delegates correctly
- **WHEN** user clicks an `<img>` inside a button with `data-action="delete"`
- **THEN** the delete handler is invoked by finding the closest element with `data-action`

#### Scenario: Click outside action buttons is ignored
- **WHEN** user clicks an element with no `data-action` attribute in its ancestry
- **THEN** no action handler is invoked

### Requirement: Environment action buttons use data attributes
Environment management buttons (switch env, delete env) SHALL use `data-action` attributes instead of class-based matching.

#### Scenario: Switch env button uses data attribute
- **WHEN** a switch env button is rendered
- **THEN** it has `data-action="switchEnv"` and `data-env-key="<api-key>"`

#### Scenario: Delete env button uses data attribute
- **WHEN** a delete env button is rendered
- **THEN** it has `data-action="deleteEnv"` and `data-env-key="<api-key>"`

### Requirement: Category interaction uses data attributes
Category badge clicks SHALL be identified via `data-action` attributes instead of class name matching.

#### Scenario: Category badge click
- **WHEN** user clicks a category badge
- **THEN** it has `data-action="category"` and `data-category="<category-name>"`

#### Scenario: Show more categories button
- **WHEN** user clicks the "show more" badge
- **THEN** it has `data-action="categoryMore"`
