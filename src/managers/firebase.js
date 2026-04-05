import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { handleTextEnv, validateEnvVars } from '../utils.js';
import { handleAlert, Alert, DurationLength } from '../ui/alert.js';
import { DOM } from '../config/dom.js';

let app = null;
let db = null;
let configEnv = {};
let configCloudinary = {};

export function getDb() { return db; }
export function getApp() { return app; }
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
}

function validateFirebaseSetup() {
  if (!app || !db) {
    throw new Error('Firebase is not properly initialized');
  }
}

async function loadEnv(localVarCloudinaryConfig) {
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

    if (localVarCloudinaryConfig && Object.keys(localVarCloudinaryConfig).length > 0) {
      configCloudinary = { ...localVarCloudinaryConfig };
    } else {
      configCloudinary = {
        CLOUDINARY_CLOUDNAME: tempConfigEnv.CLOUDINARY_CLOUDNAME,
        CLOUDINARY_UPLOADPRESET: tempConfigEnv.CLOUDINARY_UPLOADPRESET,
        CLOUDINARY_APIKEY: tempConfigEnv.CLOUDINARY_APIKEY,
        CLOUDINARY_APISECRET: tempConfigEnv.CLOUDINARY_APISECRET,
      };
      localStorage.setItem('envCloudinary', JSON.stringify(configCloudinary));
    }
  } catch (error) {
    throw new Error('Error loading .env file: ' + error.message);
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
