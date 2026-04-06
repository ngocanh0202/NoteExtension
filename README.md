# 📝 Notes Extension

> A simple and elegant browser extension for creating and managing notes, powered by Firebase Firestore.

## ✨ Features

- 🚀 **Quick Note Creation** - Instantly create notes from any webpage
- ☁️ **Cloud Sync** - All notes are automatically synced with Firebase Firestore
- 🔍 **Easy Management** - Search, edit, and organize your notes effortlessly
- 💾 **Auto-Save** - Never lose your thoughts with automatic saving

## 🛠️ Setup Instructions

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)
- A Google account for Firebase

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Follow the setup wizard to create your new project
4. Once created, navigate to **Firestore Database** and click **"Create database"**
5. Choose **"Start in test mode"** for development (remember to configure security rules later)

### 2. Get Your Firebase Configuration

1. In your Firebase project, click the **gear icon** ⚙️ and select **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click **"Web"** icon `</>`
4. Register your app with a name (e.g., "Notes Extension")
5. Copy the configuration object that appears

### 3. Download and Configure

```bash
# Clone the repository
git clone https://github.com/ngocanh0202/NoteExtension.git
cd NoteExtension

# Copy the environment template
cp .env.example for env
```

Edit the `env` file with your Firebase configuration:

```env
apiKey: "your_api_key_here"
authDomain: "your_project.firebaseapp.com"
projectId: "your_project_id"
storageBucket: "our_project.appspot.com"
messagingSenderId: "123456789"
appId: "1:123456789:web:abcdef123456"
```

### 4. Build and Install the Extension

```bash
# Install dependencies
npm install

# Build the extension (production)
npx webpack --config webpack.prod.js
```

#### For Chrome/Chromium-based browsers:
1. Open `chrome://extensions/` in your browser
2. Enable **"Developer mode"** (toggle in the top right)
3. Click **"Load unpacked"**
4. Select the `public/` folder
5. The extension should appear in your extensions list

#### For Firefox:
1. Open `about:debugging` in Firefox
2. Click **"This Firefox"**
3. Click **"Load Temporary Add-on"**
4. Select the `public/manifest.json` file

## 🚀 Usage

1. **Open the Extension**: Click the Notes Extension icon in your browser toolbar
2. **Create a Note**: Click the "+" button to start writing
3. **Save Automatically**: Your notes are saved automatically as you type
4. **Manage Notes**: View, edit, or delete notes from the main interface
5. **Sync Across Devices**: Sign in to access your notes from any device
6. **Switch Theme**: Click the sun/moon icon to toggle light/dark mode

## 📦 Distribution

After building, the `public/` folder contains a **complete self-contained extension** that can be distributed:

```
public/
├── manifest.json
├── index.html
├── bundle.js
├── contextMenusNote.js
├── css/, Js/, icons/, images/, tinymce/
```

Simply share this folder - users load it directly as an unpacked extension.

## 🔧 Configuration

### Firebase Security Rules

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Extension not loading:**
- Make sure Developer mode is enabled
- Check that all files are present in the `public/` folder
- Verify the `public/manifest.json` file is valid

**Firebase connection issues:**
- Double-check your Firebase configuration in the extension settings
- Ensure your Firebase project has Firestore enabled
- Verify your Firebase security rules allow read/write access

**Notes not syncing:**
- Check your internet connection
- Verify you're signed in to the extension
- Check the browser console for any error messages

## 📞 Support

If you encounter any issues or have questions:

- 🐛 [Report bugs]((https://github.com/ngocanh0202/NoteExtension/issues))
- 📧 Contact: buihuynhngocanh2020@gmail.com

---

Made with ❤️ by [NgocAnh0202](https://github.com/ngocanh0202)
