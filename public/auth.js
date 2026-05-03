import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';

const PARENT_FRAME = document.location.ancestorOrigins?.[0] || '*';

let configEnv = {};

async function loadConfig() {
  try {
    const response = await fetch('/env');
    const text = await response.text();
    const lines = text.split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*(\w+):\s*"?([^"]*)"?/);
      if (match) {
        const key = match[1].toUpperCase();
        const value = match[2].trim();
        if (key === 'APIKEY') configEnv.APIKEY = value;
        if (key === 'AUTHDOMAIN') configEnv.AUTHDOMAIN = value;
        if (key === 'PROJECTID') configEnv.PROJECTID = value;
        if (key === 'STORAGEBUCKET') configEnv.STORAGEBUCKET = value;
        if (key === 'MESSAGINGSENDERID') configEnv.MESSAGINGSENDERID = value;
        if (key === 'APPID') configEnv.APPID = value;
      }
    });
  } catch (e) {
    console.log('No env file');
  }

  const saved = localStorage.getItem('firebaseConfigEnv');
  if (saved) {
    try {
      configEnv = JSON.parse(saved);
    } catch (e) {}
  }
}

function sendResponse(result) {
  globalThis.parent.self.postMessage(JSON.stringify(result), PARENT_FRAME);
}

globalThis.addEventListener('message', async ({ data }) => {
  if (data.initAuth) {
    await loadConfig();
    
    const firebaseConfig = {
      apiKey: configEnv.APIKEY,
      authDomain: configEnv.AUTHDOMAIN,
      projectId: configEnv.PROJECTID,
      storageBucket: configEnv.STORAGEBUCKET,
      messagingSenderId: configEnv.MESSAGINGSENDERID,
      appId: configEnv.APPID
    };
    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      sendResponse({ success: true, user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      }});
    } catch (error) {
      sendResponse({ success: false, error: { code: error.code, message: error.message } });
    }
  }
});
