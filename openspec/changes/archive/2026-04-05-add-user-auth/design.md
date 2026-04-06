## Context

The NoteExtension is a Manifest V3 browser extension using Firebase Firestore (v11 SDK, modular API) for cloud-synced notes and Cloudinary for image uploads. Currently, Firestore security rules are wide open (`allow read, write: if true`), meaning any user with the project ID can access all data. The extension has no authentication layer — it uses only the Firebase anonymous config keys.

**Constraints:**
- MV3 extension architecture (service worker + popup page)
- Firebase v11 modular SDK already installed
- Webpack build pipeline (src/ → public/bundle.js)
- No test infrastructure currently
- Chrome extension environment (chrome.storage API available)
- Existing notes in Firestore lack `userId` field

## Goals / Non-Goals

**Goals:**
- Add Google Sign-In authentication for extension users
- Scope all note CRUD operations to the authenticated user
- Persist auth state across popup open/close cycles
- Block all data operations until user is authenticated
- Maintain backward compatibility with existing settings UI and Cloudinary integration

**Non-Goals:**
- No email/password or other auth providers (Google only for simplicity)
- No multi-user note sharing/collaboration
- No admin panel or user management
- No automatic migration of existing notes (manual migration via Firebase Console or script)
- No Firebase App Check (can be added later)

## Decisions

### 1. Google Sign-In via Popup (not redirect)
**Decision:** Use `signInWithPopup()` with `GoogleAuthProvider` instead of `signInWithRedirect()`.
**Rationale:** Extension popup context works better with popup auth flow. Redirect can cause issues with extension page lifecycle.
**Alternatives considered:** 
- `signInWithRedirect()` — more reliable for web apps but problematic in extension popups
- Chrome Identity API — more complex setup, ties to Chrome only (we want Firefox compatibility too)

### 2. Auth State Persistence via Firebase Built-in
**Decision:** Rely on Firebase Auth's default persistence (`localStorage` for browser extensions).
**Rationale:** Firebase Auth automatically persists sessions in localStorage. No need for custom chrome.storage integration.
**Alternatives considered:**
- Sync auth state to `chrome.storage.local` — unnecessary complexity, Firebase handles this
- Session-only persistence — poor UX, user would need to re-login every popup open

### 3. `userId` Field on Notes (not subcollections)
**Decision:** Add a `userId` field to each note document in the `Notes` collection rather than using per-user subcollections.
**Rationale:** Simpler Firestore rules, easier to query, maintains existing collection structure.
**Alternatives considered:**
- `users/{userId}/Notes` subcollection — cleaner isolation but requires restructuring all queries and rules
- `userNotes` collection with composite key — over-engineering for single-user-per-note model

### 4. Query Filtering with `where("userId", "==", uid)`
**Decision:** Use Firestore `where()` clause to filter notes by `userId` on all read operations.
**Rationale:** Enforces data isolation at the query level in addition to security rules.
**Alternatives considered:**
- Client-side filtering after fetch — wasteful, insecure, expensive
- Rely solely on Firestore rules — defense in depth is better

### 5. Auth UI: Minimal Inline Button
**Decision:** Add a small login button in the header toolbar. Show a warning overlay when unauthenticated.
**Rationale:** Keeps UI clean, doesn't disrupt existing layout. Warning overlay clearly communicates the requirement.
**Alternatives considered:**
- Full-screen auth modal — too intrusive
- Auto-login on first open — no way to do this without user interaction for Google Sign-In

### 6. Existing Notes Without `userId`
**Decision:** Notes without `userId` will be inaccessible after rules are tightened. Users must manually migrate or recreate.
**Rationale:** Automatic migration requires admin SDK access or Cloud Functions, which is out of scope. Manual migration via Firebase Console is simplest.
**Alternatives considered:**
- Cloud Function migration — requires deploying infrastructure
- Admin SDK script — requires Node.js setup and service account
- Graceful fallback with anonymous auth — defeats the security purpose

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Existing notes become inaccessible** | Provide clear migration instructions in proposal and README |
| **Google Sign-In popup blocked by browser** | Show clear error message with instructions to allow popups for the extension |
| **Auth token expiration while popup is open** | Firebase auto-refreshes tokens; add `onAuthStateChanged` listener to handle edge cases |
| **Single Google account limitation** | Firebase Auth ties to one Google account per browser profile. Users with multiple accounts need separate browser profiles |
| **Offline access lost** | Firebase Auth requires network for initial sign-in. localStorage persistence handles subsequent opens |
| **Firefox compatibility** | Google Sign-In works in Firefox but may require additional popup permissions |
| **Increased complexity in notes.js** | Every query now needs auth check. Wrap in helper function to minimize duplication |

## Migration Plan

1. **Deploy code changes** — build and load updated extension
2. **Enable Google Auth** in Firebase Console → Authentication → Sign-in method → Google → Enable
3. **Update Firestore Rules** — copy the new rules from the security rules file to Firebase Console
4. **Migrate existing notes** (optional, manual):
   ```javascript
   // Run in Firebase Console or via admin SDK
   // For each note in Notes collection:
   //   Set userId = "<your-uid>"
   ```
5. **Test** — sign in, create note, verify it appears, sign out, verify no data loads
6. **Rollback** — revert Firestore rules to `allow read, write: if true` and deploy previous extension version

## Open Questions

- Should we support multiple Google accounts via account switching? (Defer to future iteration)
- Should we add a grace period where old notes are still readable? (Could use a transitional rule)
- Do we need to handle the case where a user's Google account is deleted? (Firebase handles this automatically — auth state becomes invalid)
