const AUTH_URL = chrome.runtime.getManifest().name === 'Note' 
  ? 'auth.html' 
  : 'auth.html';

async function createOffscreen() {
  const exists = await chrome.offscreen.hasDocument?.();
  if (!exists) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUTHENTICATION'],
      frameConstraints: { frameTypes: ['top-level'] }
    });
  }
}

async function signInWithOffscreen() {
  return new Promise(async (resolve, reject) => {
    try {
      await createOffscreen();
      
      const iframe = document.createElement('iframe');
      iframe.src = AUTH_URL;
      iframe.style.display = 'none';
      document.documentElement.appendChild(iframe);
      
      function handleMessage({ data }) {
        try {
          if (data.startsWith('!_')) return;
          const result = JSON.parse(data);
          
          globalThis.removeEventListener('message', handleMessage);
          if (iframe.parentElement) {
            iframe.parentElement.removeChild(iframe);
          }
          
          if (result.success) {
            resolve(result.user);
          } else {
            reject(new Error(result.error?.message || 'Auth failed'));
          }
        } catch (e) {}
      }
      
      globalThis.addEventListener('message', handleMessage);
      
      setTimeout(() => {
        globalThis.removeEventListener('message', handleMessage);
        if (iframe.parentElement) {
          iframe.parentElement.removeChild(iframe);
        }
        reject(new Error('Auth timeout'));
      }, 120000);
      
      iframe.contentWindow.postMessage({ initAuth: true }, '*');
    } catch (error) {
      reject(error);
    }
  });
}

if (typeof window !== 'undefined') {
  window.signInWithOffscreen = signInWithOffscreen;
}
