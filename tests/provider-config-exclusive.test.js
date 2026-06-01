const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const naserverSource = fs
  .readFileSync(path.join(__dirname, '..', 'src', 'managers', 'naserver.js'), 'utf8')
  .replace(/export /g, '');
const scriptSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'script.js'), 'utf8');

const storage = new Map([
  ['firebaseConfigEnv', JSON.stringify({ APIKEY: 'firebase-key' })]
]);

const context = {
  console,
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
    removeItem(key) {
      storage.delete(key);
    }
  }
};

vm.createContext(context);
vm.runInContext(naserverSource, context);

vm.runInContext(
  "saveNAServerNotesConfig({ enabled: true, baseUrl: 'http://api.test/', token: 'abc' })",
  context
);
assert.strictEqual(storage.has('firebaseConfigEnv'), false);
assert.strictEqual(vm.runInContext('isNAServerNotesEnabled()', context), true);

const modeCheckIndex = scriptSource.indexOf('const naserverModeEnabled = isNAServerNotesEnabled();');
const firebaseInitIndex = scriptSource.indexOf('await initFirebase');
assert(modeCheckIndex >= 0, 'script.js must check NAServer mode before startup provider init');
assert(firebaseInitIndex > modeCheckIndex, 'Firebase init must happen only after NAServer mode is known');
assert(scriptSource.includes("localStorage.removeItem('firebaseConfigEnv')"));
assert(
  scriptSource.includes('if (naserverModeEnabled)') &&
    (scriptSource.includes('} else {\r\n  await initFirebase') || scriptSource.includes('} else {\n  await initFirebase')),
  'Firebase init must be inside the non-NAServer branch'
);

console.log('provider config exclusivity tests passed');
