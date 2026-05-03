# NoteExtension API Documentation

## Table of Contents
1. [Database Schema](#database-schema)
2. [Configuration API](#configuration-api)
3. [Authentication API](#authentication-api)
4. [Notes API](#notes-api)
5. [Images API](#images-api)
6. [Local Storage Keys](#local-storage-keys)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)

---

## Database Schema

### Firestore Collections

#### Collection: `Notes`
| Field | Type | Description |
|-------|------|-------------|
| `Note` | string | Title of the note |
| `example` | string | HTML content from TinyMCE editor |
| `timestamp` | Date | Creation/update timestamp |
| `category` | string? | Category tag (optional) |
| `isPinned` | boolean | Pin status (default: false) |
| `userId` | string | User ID from Firebase Auth |

#### Collection: `note-images`
| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Cloudinary image URL |
| `signature` | string | Image signature for deletion |
| `userId` | string | User ID from Firebase Auth |

---

## Configuration API

### Environment Configuration

#### `handleTextEnv(envText, isComma)`
Parse environment configuration text.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `envText` | string | Raw environment text to parse |
| `isComma` | boolean | Use comma as delimiter (true) or newline (false) |

**Returns:** `Object` - Parsed key-value pairs

**Example:**
```javascript
// env file format (isComma = false)
const envText = `
  APIKEY: "abc123"
  PROJECTID: "my-project"
  # This is a comment
`;

const config = handleTextEnv(envText, false);
// Result: { APIKEY: "abc123", PROJECTID: "my-project" }

// JSON format (isComma = true)
const jsonText = '  APIKEY: "abc123",  PROJECTID: "my-project"';
const config2 = handleTextEnv(jsonText, true);
```

---

#### `validateEnvVars(configEnv)`
Validate required Firebase environment variables.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `configEnv` | Object | Configuration object |

**Throws:** `Error` if missing required variables

**Required keys:** `APIKEY`, `AUTHDOMAIN`, `PROJECTID`, `STORAGEBUCKET`, `MESSAGINGSENDERID`, `APPID`

---

#### `populateSettings(configEnv, cloudinaryConfig)`
Populate settings form fields with configuration values.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `configEnv` | Object | Firebase configuration object |
| `cloudinaryConfig` | Object | Cloudinary configuration object |

**Example:**
```javascript
populateSettings(
  { APIKEY: 'abc', PROJECTID: 'project1' },
  { CLOUDINARY_CLOUDNAME: 'mycloud' }
);
```

---

#### `readSettings()`
Read configuration from settings form inputs.

**Returns:** `{ configEnv: Object, cloudinaryConfig: Object }`

---

#### `validateSettings(configEnv, cloudinaryConfig)`
Validate configuration before saving.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `configEnv` | Object | Firebase configuration |
| `cloudinaryConfig` | Object | Cloudinary configuration |

**Returns:** `{ missingFirebase: string[], missingCloudinary: string[] }`

---

#### `handleLoadEnv(dataEnv, setDataEnv, setLocalVarCloudinaryConfig, onNotesRendered)`
Load and save environment configuration.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `dataEnv` | Array | Array of saved environment configurations |
| `setDataEnv` | Function | Callback to update dataEnv state |
| `setLocalVarCloudinaryConfig` | Function | Callback to update Cloudinary config |
| `onNotesRendered` | Function? | Callback after notes are loaded |

**Example:**
```javascript
await handleLoadEnv(dataEnv, setDataEnv, setLocalVarCloudinaryConfig, onNotesRendered);
```

---

## Authentication API

### Firebase Authentication

#### `initFirebase(localVarCloudinaryConfig, dataEnv, onNotesRendered)`
Initialize Firebase with configuration.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `localVarCloudinaryConfig` | Object | Cloudinary config from localStorage |
| `dataEnv` | Array | Saved environment configurations |
| `onNotesRendered` | Function? | Callback after initialization |

**Example:**
```javascript
const cloudinaryConfig = JSON.parse(localStorage.getItem('envCloudinary'));
const dataEnv = JSON.parse(localStorage.getItem('envVariables')) || [];
await initFirebase(cloudinaryConfig, dataEnv, null);
```

---

#### `resetFirebaseApp(newConfig, isLoadInitWeb, localVarCloudinaryConfig, dataEnv, onNotesRendered)`
Reset and reinitialize Firebase with new configuration.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `newConfig` | Object? | New Firebase config (null to load from env file) |
| `isLoadInitWeb` | boolean | True for initial web load |
| `localVarCloudinaryConfig` | Object | Cloudinary configuration |
| `dataEnv` | Array | Environment configurations array |
| `onNotesRendered` | Function? | Callback after notes rendered |

**Returns:** `Promise<boolean>` - Success status

---

#### `signIn(email, password)`
Sign in with email and password.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `email` | string | User email |
| `password` | string | User password |

**Returns:** `Promise<UserCredential>`

**Example:**
```javascript
try {
  const result = await signIn('user@example.com', 'password123');
  console.log('Signed in:', result.user.email);
} catch (error) {
  console.error('Sign in failed:', error.message);
}
```

---

#### `register(email, password)`
Register new user with email and password.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `email` | string | User email |
| `password` | string | Password (min 6 characters) |

**Returns:** `Promise<UserCredential>`

**Example:**
```javascript
try {
  const result = await register('newuser@example.com', 'password123');
  handleAlert(Alert.SUCCESS, 'Account created!', DurationLength.LONG);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

---

#### `signOutUser()`
Sign out current user.

**Returns:** `Promise<void>`

**Example:**
```javascript
await signOutUser();
console.log('User signed out');
```

---

#### `getCurrentUser()`
Get currently authenticated user.

**Returns:** `User | null`

**Example:**
```javascript
const user = getCurrentUser();
if (user) {
  console.log('Current user:', user.uid, user.email);
}
```

---

#### `onAuthChange(callback)`
Subscribe to authentication state changes.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `callback` | Function | Function called on auth state change |

**Returns:** `Function` - Unsubscribe function

**Example:**
```javascript
const unsubscribe = onAuthChange((user) => {
  if (user) {
    console.log('User logged in:', user.email);
    renderNotes();
  } else {
    console.log('User logged out');
  }
});

// To unsubscribe
unsubscribe();
```

---

#### `isFirebaseConfigured()`
Check if Firebase is properly configured.

**Returns:** `boolean`

---

#### `isCloudinaryConfigured()`
Check if Cloudinary is properly configured.

**Returns:** `boolean`

---

## Notes API

### Notes Management

#### `renderNotes(categoryPageSize, currentCategorySelected)`
Load and render notes from Firestore.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `categoryPageSize` | number | Number of categories to display |
| `currentCategorySelected` | string? | Currently selected category |

**Returns:** `Promise<void>`

**Example:**
```javascript
await renderNotes(5, null);  // Load all notes
await renderNotes(5, 'work'); // Load notes in 'work' category
```

---

#### `handleUpsertNote(e, idNote, isClickNewButton, onCleanImages)`
Create or update a note.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `e` | Event | Form submit event |
| `idNote` | string? | Note ID (null for new note) |
| `isClickNewButton` | boolean | True if creating new note |
| `onCleanImages` | Function? | Callback to clean unused images |

**Returns:** `Promise<void>`

**Data structure:**
```javascript
{
  Note: "Note Title",
  example: "<p>HTML content from TinyMCE</p>",
  timestamp: new Date(),
  category: "work",
  userId: "user-uid-123"
}
```

**Example:**
```javascript
// Create new note
const formData = { Note: { value: 'My Note' } };
await handleUpsertNote(event, null, true, cleanupImages);

// Update existing note
await handleUpsertNote(event, 'note-id-123', false, cleanupImages);
```

---

#### `deleteNote(NoteId)`
Delete a note from Firestore.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `NoteId` | string | ID of the note to delete |

**Returns:** `Promise<void>`

**Example:**
```javascript
await deleteNote('note-id-123');
console.log('Note deleted');
```

---

#### `togglePin(NoteId)`
Toggle pin status of a note.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `NoteId` | string | ID of the note to pin/unpin |

**Returns:** `Promise<void>`

**Example:**
```javascript
await togglePin('note-id-123');
// Note is now pinned
```

---

#### `filterAndRender(searchTerm, category, categoryPageSize)`
Filter and render notes based on search and category.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `searchTerm` | string? | Search term to filter notes |
| `category` | string? | Category to filter by |
| `categoryPageSize` | number | Number of categories to show |

**Returns:** `void`

**Example:**
```javascript
// Search notes
filterAndRender('meeting', null, 5);

// Filter by category
filterAndRender(null, 'work', 5);

// Search and filter
filterAndRender('task', 'personal', 10);
```

---

#### `handleInputSearch(value)`
Handle search input and filter notes.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `value` | string | Search query |

**Example:**
```javascript
searchInput.addEventListener('input', (e) => {
  handleInputSearch(e.target.value.toLowerCase());
});
```

---

#### `handleCategoryClick(clickedCategory, currentCategorySelected)`
Handle category selection click.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `clickedCategory` | string | Category that was clicked |
| `currentCategorySelected` | string? | Currently selected category |

**Returns:** `string | null` - New selected category

---

#### `expandCategoryPageSize(categoryPageSize)`
Expand the number of visible categories.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `categoryPageSize` | number | Current page size |

**Returns:** `number` - New page size

---

#### `getNoteById(id)`
Get note by ID from local cache.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `id` | string | Note ID |

**Returns:** `Object | undefined` - Note object

**Example:**
```javascript
const note = getNoteById('note-id-123');
if (note) {
  console.log('Found note:', note.Note, note.example);
}
```

---

#### `getListItem()`
Get all notes from local cache.

**Returns:** `Array` - Copy of notes array

---

#### `getListCategories()`
Get all unique categories from notes.

**Returns:** `Array` - Array of category strings

---

#### `stripHtmlAdvanced(html)`
Convert HTML to plain text with formatting.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `html` | string | HTML string to convert |

**Returns:** `string` - Formatted plain text

---

#### `stripHtmlAdvancedToCopy(html)`
Convert HTML to plain text optimized for clipboard.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `html` | string | HTML string to convert |

**Returns:** `string` - Plain text with list formatting

---

## Images API

### Cloudinary Image Management

#### `handleUploadImageUrl(data)`
Save uploaded image URL to Firestore.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `data` | Object | Image data |
| `data.url` | string | Cloudinary image URL |
| `data.signature` | string | Image signature |

**Returns:** `Promise<void>`

**Example:**
```javascript
await handleUploadImageUrl({
  url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  signature: 'abc123signature'
});
```

---

#### `handleCleanImagesCloudinary(listItem, setLoading)`
Delete unused images from Cloudinary.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `listItem` | Array | Array of note objects to check |
| `setLoading` | Function | Callback to set loading state |

**Returns:** `Promise<void>`

**Algorithm:**
1. Fetch all images from `note-images` collection
2. Filter images not referenced in any note's `example` field
3. Generate deletion signature using SHA-1
4. Call Cloudinary API to delete each unused image
5. Remove image record from Firestore

**Example:**
```javascript
const notes = getListItem();
await handleCleanImagesCloudinary(notes, (loading) => {
  loadingOverlay.style.display = loading ? 'block' : 'none';
});
```

---

#### `generateCloudinarySignature(params, apiSecret)`
Generate SHA-1 signature for Cloudinary API requests.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `params` | Object | API parameters object |
| `apiSecret` | string | Cloudinary API secret |

**Returns:** `Promise<string>` - Hex signature string

**Example:**
```javascript
const params = {
  public_id: 'sample_image',
  timestamp: Math.floor(Date.now() / 1000),
  invalidate: true
};

const signature = await generateCloudinarySignature(params, 'my-api-secret');
// Result: "a1b2c3d4e5f6..."
```

---

## Local Storage Keys

| Key | Type | Description |
|-----|------|-------------|
| `NotesBackups` | string | JSON array of note backups |
| `envCloudinary` | string | JSON object of Cloudinary config |
| `firebaseConfigEnv` | JSON string | Current Firebase config |
| `envVariables` | JSON string | Array of saved environment configs |
| `theme` | string | Current theme ('dark' or 'light') |

---

## Error Handling

### Alert System

#### `handleAlert(type, message, duration)`
Display alert notification to user.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `type` | string | Alert type from `Alert` enum |
| `message` | string | Alert message |
| `duration` | number | Display duration in milliseconds |

**Alert Types:**
```javascript
import { Alert, DurationLength } from './ui/alert.js';

handleAlert(Alert.WARNING, 'Please sign in', DurationLength.MEDIUM);
handleAlert(Alert.INFO, 'Note saved', DurationLength.SHORT);
handleAlert(Alert.DANGER, 'Error occurred', DurationLength.LONG);
handleAlert(Alert.SUCCESS, 'Operation complete', DurationLength.MEDIUM);
```

---

## Code Examples

### Complete Workflow: Create and Save Note

```javascript
import { handleUpsertNote, getListItem } from './managers/notes.js';
import { handleCleanImagesCloudinary } from './managers/cloudinary.js';
import { getCurrentUser } from './managers/firebase.js';

// 1. Check authentication
const user = getCurrentUser();
if (!user) {
  handleAlert(Alert.WARNING, 'Please sign in first', DurationLength.MEDIUM);
  return;
}

// 2. Prepare note data
const noteData = {
  Note: 'My Note Title',
  example: '<p>This is the note content with <strong>bold</strong> text.</p>',
  category: 'work',
  userId: user.uid
};

// 3. Create note (pass null as idNote)
const event = { target: { Note: { value: 'My Note Title' } } };
await handleUpsertNote(event, null, true, () => {
  handleCleanImagesCloudinary(getListItem(), setLoading);
});

console.log('Note created successfully');
```

---

### Complete Workflow: Update Note

```javascript
import { getNoteById, handleUpsertNote, togglePin } from './managers/notes.js';

// 1. Get existing note
const note = getNoteById('note-id-123');
if (!note) {
  console.error('Note not found');
  return;
}

console.log('Current title:', note.Note);

// 2. Update note (pass note ID)
const event = {
  target: {
    Note: { value: 'Updated Title' },
    category: { value: note.category }
  }
};
await handleUpsertNote(event, 'note-id-123', false);

// 3. Pin the note
await togglePin('note-id-123');
```

---

### Complete Workflow: Search and Filter Notes

```javascript
import { filterAndRender, handleCategoryClick, getListCategories } from './managers/notes.js';

// 1. Get all categories
const categories = getListCategories();
console.log('Available categories:', categories);

// 2. Filter by search term
filterAndRender('meeting', null, 5);

// 3. Filter by category
const newCategory = handleCategoryClick('work', null);

// 4. Combined search and category
filterAndRender('task', 'personal', 10);
```

---

### Complete Workflow: Upload Image

```javascript
import { getConfigCloudinary, handleUploadImageUrl } from './managers/cloudinary.js';
import { getCurrentUser } from './managers/firebase.js';

// 1. Check Cloudinary configuration
const config = getConfigCloudinary();
if (!config.CLOUDINARY_CLOUDNAME || !config.CLOUDINARY_UPLOADPRESET) {
  handleAlert(Alert.WARNING, 'Cloudinary not configured', DurationLength.LONG);
  return;
}

// 2. Upload image via Cloudinary API
const formData = new FormData();
formData.append('file', imageFile);
formData.append('api_key', config.CLOUDINARY_APIKEY);
formData.append('upload_preset', config.CLOUDINARY_UPLOADPRESET);

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUDNAME}/image/upload`,
  { method: 'POST', body: formData }
);

const data = await response.json();

// 3. Save image URL to Firestore
if (data.secure_url) {
  await handleUploadImageUrl({
    url: data.secure_url,
    signature: data.signature
  });
  handleAlert(Alert.SUCCESS, 'Image uploaded', DurationLength.SHORT);
}
```

---

### Complete Workflow: Delete Note with Image Cleanup

```javascript
import { deleteNote, getListItem } from './managers/notes.js';
import { handleCleanImagesCloudinary } from './managers/cloudinary.js';

// 1. Delete the note
await deleteNote('note-id-123');

// 2. Clean up unused images
const notes = getListItem();
await handleCleanImagesCloudinary(notes, (loading) => {
  loadingOverlay.style.display = loading ? 'block' : 'none';
});

handleAlert(Alert.INFO, 'Note and unused images deleted', DurationLength.MEDIUM);
```

---

### Complete Workflow: Authentication

```javascript
import { signIn, register, signOutUser, getCurrentUser, onAuthChange } from './managers/firebase.js';

// 1. Listen for auth changes
onAuthChange((user) => {
  if (user) {
    console.log('User session active:', user.email);
    renderNotes();
  } else {
    console.log('No user session');
  }
});

// 2. Sign in
try {
  await signIn('user@example.com', 'password123');
  handleAlert(Alert.SUCCESS, 'Signed in!', DurationLength.SHORT);
} catch (error) {
  handleAlert(Alert.DANGER, error.message, DurationLength.LONG);
}

// 3. Register new user
try {
  await register('newuser@example.com', 'password123');
  handleAlert(Alert.INFO, 'Account created!', DurationLength.LONG);
} catch (error) {
  handleAlert(Alert.DANGER, error.message, DurationLength.LONG);
}

// 4. Sign out
await signOutUser();
```

---

## Notes

- All timestamps are stored as JavaScript `Date` objects in Firestore
- Note content (`example`) is stored as HTML from TinyMCE editor
- User ID is required for all CRUD operations (enforced at application level)
- Images are automatically cleaned up when notes are saved
- Configuration can be stored in `env` file or localStorage