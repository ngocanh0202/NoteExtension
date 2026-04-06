## 1. Firebase Auth Setup

- [x] 1.1 Add Firebase Auth imports to `src/managers/firebase.js` (getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged)
- [x] 1.2 Create `auth` module export functions: `signIn()`, `signOut()`, `getCurrentUser()`, `onAuthChange(callback)`
- [x] 1.3 Initialize Firebase Auth in `setupFirebase()` with `getAuth(app)`
- [x] 1.4 Export `getAuth()` instance from firebase manager module

## 2. Auth UI Components

- [x] 2.1 Add login/logout button HTML to `public/index.html` header toolbar
- [x] 2.2 Add user identity display element (email + profile photo) to header
- [x] 2.3 Add authentication warning overlay HTML to `public/index.html`
- [x] 2.4 Add CSS styles for auth warning overlay and login button states
- [x] 2.5 Add DOM references for new auth UI elements in `src/config/dom.js`

## 3. Auth State Management in Script

- [x] 3.1 Add auth state listener in `src/script.js` using `onAuthStateChanged`
- [x] 3.2 Implement `onAuthStateChanged` callback: show/hide warning overlay, update login/logout button, load/clear notes
- [x] 3.3 Wire up login button click handler to call `signIn()` with Google provider
- [x] 3.4 Wire up logout button click handler to call `signOut()`
- [x] 3.5 Handle sign-in errors (popup blocked, network errors) with user-friendly alerts
- [x] 3.6 Handle sign-out cleanup: clear notes from UI, reset editor state

## 4. Notes Module Updates

- [x] 4.1 Update `renderNotes()` to filter by `userId` using `query(collection(db, "Notes"), where("userId", "==", uid))`
- [x] 4.2 Update `handleUpsertNote()` to include `userId: auth.currentUser.uid` in note data on create
- [x] 4.3 Add auth guard to `handleUpsertNote()`: reject if user not authenticated
- [x] 4.4 Add auth guard to `deleteNote()`: reject if user not authenticated
- [x] 4.5 Add auth guard to `togglePin()`: reject if user not authenticated
- [x] 4.6 Update `note-images` tracking to include `userId` field in `src/managers/cloudinary.js`

## 5. Context Menu Integration

- [x] 5.1 Update `contextMenusNote.js` to check auth state before auto-saving notes
- [x] 5.2 Show notification if context menu action triggers but user is not authenticated

## 6. Build and Test

- [x] 6.1 Run `npx webpack` to build the bundle
- [ ] 6.2 Load updated extension in Chrome/Firefox and verify login flow works
- [ ] 6.3 Verify notes are scoped correctly (create note, sign out, sign in with different account)
- [ ] 6.4 Verify logout clears UI state properly
- [ ] 6.5 Verify context menu behavior when unauthenticated

## 7. Firestore Rules Update (Manual)

- [ ] 7.1 Update Firestore security rules in Firebase Console to enforce `userId` ownership
- [ ] 7.2 Enable Google Sign-In in Firebase Console → Authentication → Sign-in method
- [ ] 7.3 Document migration steps for existing notes in README or migration guide
