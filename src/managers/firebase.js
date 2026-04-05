import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { handleTextEnv, validateEnvVars } from '../utils.js';
import { handleAlert, Alert, DurationLength } from '../ui/alert.js';
import { DOM } from '../config/dom.js';

let app = null;
let db = null;
let auth = null;
let configEnv = {};
let configCloudinary = {};

export function getDb() { return db; }
export function getApp() { return app; }
export function getAuthInstance() { return auth; }
export function getConfigEnv() { return { ...configEnv }; }
export function getConfigCloudinary() { return { ...configCloudinary }; }
export function setConfigCloudinary(cfg) { configCloudinary = cfg; }

function setupFirebase() {
  const firebaseConfig = {
    apiKey: configEnv.APIKEY,
    authDomain: configEnv.AUTHDOMAIN,
    projectId: configEnv.PROJECTID,
    storageBucket: configEnv.STORAGEBUCKET,
    messagingSenderId: configEnv.MESSAGINGSENDERID,
    appId: configEnv.APPID
  };
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

function validateFirebaseSetup() {
  if (!app || !db) {
    throw new Error('Firebase is not properly initialized');
  }
}

async function loadEnv(localVarCloudinaryConfig) {
  let savedConfigEnv = localStorage.getItem('firebaseConfigEnv');
  console.log('Loading firebase config from localStorage:', savedConfigEnv ? 'found' : 'not found');
  
  if (savedConfigEnv) {
    try {
      configEnv = JSON.parse(savedConfigEnv);
      console.log('Loaded config from localStorage:', configEnv.APIKEY);
    } catch (e) {
      console.log('Failed to parse saved config');
    }
  }
  
  if (!configEnv.APIKEY) {
    console.log('No local config, trying /env file');
    try {
      const response = await fetch('/env');
      const text = await response.text();
      let tempConfigEnv = handleTextEnv(text, false);
      configEnv = {
        APIKEY: tempConfigEnv.APIKEY,
        AUTHDOMAIN: tempConfigEnv.AUTHDOMAIN,
        PROJECTID: tempConfigEnv.PROJECTID,
        STORAGEBUCKET: tempConfigEnv.STORAGEBUCKET,
        MESSAGINGSENDERID: tempConfigEnv.MESSAGINGSENDERID,
        APPID: tempConfigEnv.APPID
      };
    } catch (error) {
      console.log('No env file found');
    }
  }

  console.log('Final configEnv.APIKEY:', configEnv.APIKEY);

  if (localVarCloudinaryConfig && Object.keys(localVarCloudinaryConfig).length > 0) {
    configCloudinary = { ...localVarCloudinaryConfig };
  } else {
    let savedCloudinary = localStorage.getItem('envCloudinary');
    if (savedCloudinary) {
      configCloudinary = JSON.parse(savedCloudinary);
    } else if (configEnv.CLOUDINARY_CLOUDNAME) {
      configCloudinary = {
        CLOUDINARY_CLOUDNAME: configEnv.CLOUDINARY_CLOUDNAME,
        CLOUDINARY_UPLOADPRESET: configEnv.CLOUDINARY_UPLOADPRESET,
        CLOUDINARY_APIKEY: configEnv.CLOUDINARY_APIKEY,
        CLOUDINARY_APISECRET: configEnv.CLOUDINARY_APISECRET,
      };
    }
    localStorage.setItem('envCloudinary', JSON.stringify(configCloudinary));
  }
}

export async function resetFirebaseApp(newConfig, isLoadInitWeb, localVarCloudinaryConfig, dataEnv, onNotesRendered) {
  try {
    if (app) {
      await deleteApp(app);
      app = null;
      db = null;
    }

    if (newConfig) {
      configEnv = newConfig;
      configCloudinary = { ...localVarCloudinaryConfig };
    } else {
      await loadEnv(localVarCloudinaryConfig);
    }

    validateEnvVars(configEnv);
    setupFirebase();
    validateFirebaseSetup();
    
    localStorage.setItem('firebaseConfigEnv', JSON.stringify(configEnv));
    console.log('Saved config to localStorage:', configEnv.APIKEY);

    let existingEnvData = dataEnv.find(item => handleTextEnv(item, true)?.APIKEY === configEnv.APIKEY);
    let isExisted = !!existingEnvData;
    if (!isExisted) {
      let result = Object.entries(configEnv)
        .map(([key, value]) => `  ${key}: "${value}",`)
        .join("\n");
      dataEnv.unshift(result);
    } else {
      dataEnv = dataEnv.filter(item => handleTextEnv(item, true)?.APIKEY !== configEnv.APIKEY);
      dataEnv.unshift(existingEnvData);
    }
    localStorage.setItem('envVariables', JSON.stringify(dataEnv));
    handleAlert(Alert.INFO, "Firebase configuration updated successfully!", DurationLength.SHORT);

    if (!isLoadInitWeb && onNotesRendered) {
      await onNotesRendered();
    }

    return true;
  } catch (error) {
    throw error;
  }
}

export async function initFirebase(localVarCloudinaryConfig, dataEnv, onNotesRendered) {
  try {
    await resetFirebaseApp(null, true, localVarCloudinaryConfig, dataEnv, onNotesRendered);
  } catch (error) {
    handleAlert(Alert.DANGER, error.message, DurationLength.LONG);
  }
}

export function isFirebaseConfigured() {
  return !!(configEnv.APIKEY && configEnv.AUTHDOMAIN && configEnv.PROJECTID);
}

export function isCloudinaryConfigured() {
  return !!(configCloudinary.CLOUDINARY_CLOUDNAME && configCloudinary.CLOUDINARY_UPLOADPRESET && configCloudinary.CLOUDINARY_APIKEY);
}

export async function signIn() {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function signOutUser() {
  return await signOut(auth);
}

export function getCurrentUser() {
  return auth?.currentUser || null;
}

export function onAuthChange(callback) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}
