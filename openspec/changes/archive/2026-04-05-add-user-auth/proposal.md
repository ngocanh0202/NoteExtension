## Why

The current Firebase Firestore rules allow unrestricted read/write access (`allow read, write: if true`), meaning anyone with the project ID can access, modify, or delete all user notes. This is a critical security vulnerability that exposes user data to unauthorized access.

## What Changes

- Add Firebase Google Sign-In authentication to the extension popup
- Update Firestore security rules to restrict read/write access per authenticated user
- Add `userId` field to all notes to associate them with their owner
- Add login/logout UI with user identity display
- Block all CRUD operations until user is authenticated
- **BREAKING**: Existing notes without `userId` will become inaccessible until migrated or reassigned
- Add automatic `userId` injection on note creation
- Filter note queries to only return notes belonging to the current user

## Capabilities

### New Capabilities
- `user-auth`: Google Sign-In flow, login state management, user session persistence
- `user-scoped-notes`: Notes are scoped to authenticated users with `userId` field, queries filtered by current user
- `auth-ui`: Login/logout button, user identity display, authentication state warnings

### Modified Capabilities
<!-- No existing specs to modify - this is a new change -->

## Impact

- `src/managers/firebase.js`: Add Firebase Auth initialization and auth functions
- `src/managers/notes.js`: Update all CRUD operations to include `userId` and filter by current user
- `src/script.js`: Add auth state handling, login flow integration
- `public/index.html`: Add login/logout UI elements and auth warning overlay
- `manifest.json`: May need additional permissions for Google Sign-In
- Firestore security rules must be updated in Firebase Console (manual step)
- Migration required for existing notes without `userId` field
