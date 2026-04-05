import { handleTextEnv } from '../utils.js';
import { resetFirebaseApp } from './firebase.js';
import { handleAlert, Alert, DurationLength } from '../ui/alert.js';
import { DOM } from '../config/dom.js';

export function populateSettings(configEnv, cloudinaryConfig) {
  DOM.envFirebaseApikey.value = configEnv?.APIKEY || '';
  DOM.envFirebaseAuthdomain.value = configEnv?.AUTHDOMAIN || '';
  DOM.envFirebaseProjectid.value = configEnv?.PROJECTID || '';
  DOM.envFirebaseStoragebucket.value = configEnv?.STORAGEBUCKET || '';
  DOM.envFirebaseSenderid.value = configEnv?.MESSAGINGSENDERID || '';
  DOM.envFirebaseAppid.value = configEnv?.APPID || '';

  DOM.envCloudinaryCloudname.value = cloudinaryConfig?.CLOUDINARY_CLOUDNAME || '';
  DOM.envCloudinaryUploadpreset.value = cloudinaryConfig?.CLOUDINARY_UPLOADPRESET || '';
  DOM.envCloudinaryApikey.value = cloudinaryConfig?.CLOUDINARY_APIKEY || '';
  DOM.envCloudinaryApisecret.value = cloudinaryConfig?.CLOUDINARY_APISECRET || '';
}

export function readSettings() {
  return {
    configEnv: {
      APIKEY: DOM.envFirebaseApikey.value.trim(),
      AUTHDOMAIN: DOM.envFirebaseAuthdomain.value.trim(),
      PROJECTID: DOM.envFirebaseProjectid.value.trim(),
      STORAGEBUCKET: DOM.envFirebaseStoragebucket.value.trim(),
      MESSAGINGSENDERID: DOM.envFirebaseSenderid.value.trim(),
      APPID: DOM.envFirebaseAppid.value.trim(),
    },
    cloudinaryConfig: {
      CLOUDINARY_CLOUDNAME: DOM.envCloudinaryCloudname.value.trim(),
      CLOUDINARY_UPLOADPRESET: DOM.envCloudinaryUploadpreset.value.trim(),
      CLOUDINARY_APIKEY: DOM.envCloudinaryApikey.value.trim(),
      CLOUDINARY_APISECRET: DOM.envCloudinaryApisecret.value.trim(),
    }
  };
}

export function validateSettings(configEnv, cloudinaryConfig) {
  const missingFirebase = [];
  if (!configEnv.APIKEY) missingFirebase.push('API Key');
  if (!configEnv.AUTHDOMAIN) missingFirebase.push('Auth Domain');
  if (!configEnv.PROJECTID) missingFirebase.push('Project ID');
  if (!configEnv.STORAGEBUCKET) missingFirebase.push('Storage Bucket');
  if (!configEnv.MESSAGINGSENDERID) missingFirebase.push('Messaging Sender ID');
  if (!configEnv.APPID) missingFirebase.push('App ID');

  const missingCloudinary = [];
  if (!cloudinaryConfig.CLOUDINARY_CLOUDNAME) missingCloudinary.push('Cloud Name');
  if (!cloudinaryConfig.CLOUDINARY_UPLOADPRESET) missingCloudinary.push('Upload Preset');
  if (!cloudinaryConfig.CLOUDINARY_APIKEY) missingCloudinary.push('API Key');
  if (!cloudinaryConfig.CLOUDINARY_APISECRET) missingCloudinary.push('API Secret');

  return { missingFirebase, missingCloudinary };
}

export async function handleLoadEnv(dataEnv, setDataEnv, setLocalVarCloudinaryConfig, onNotesRendered) {
  DOM.loadingOverlay.style.display = 'block';

  const { configEnv, cloudinaryConfig } = readSettings();
  const validation = validateSettings(configEnv, cloudinaryConfig);

  if (validation.missingFirebase.length > 0) {
    handleAlert(Alert.WARNING, `Missing Firebase config: ${validation.missingFirebase.join(', ')}`, DurationLength.LONG);
    DOM.loadingOverlay.style.display = 'none';
    return;
  }

  if (validation.missingCloudinary.length > 0) {
    handleAlert(Alert.WARNING, `Missing Cloudinary config: ${validation.missingCloudinary.join(', ')}`, DurationLength.LONG);
  } else {
    localStorage.setItem('envCloudinary', JSON.stringify(cloudinaryConfig));
  }

  try {
    setLocalVarCloudinaryConfig(cloudinaryConfig);
    const success = await resetFirebaseApp(configEnv, false, cloudinaryConfig, dataEnv, onNotesRendered);
    if (success) {
      setDataEnv(dataEnv);
      DOM.btnCloseModalEnv.click();
    }
  } catch (error) {
    handleAlert(Alert.DANGER, `Failed to update configuration: ${error.message}`, DurationLength.LONG);
  } finally {
    DOM.loadingOverlay.style.display = 'none';
    DOM.switchCheckChecked.checked = false;
  }
}

export async function handleBackEnv(localVarCloudinaryConfig, onNotesRendered) {
  try {
    DOM.switchCheckChecked.checked = false;
    DOM.labelSwitch.textContent = "Notes";
    await resetFirebaseApp(null, false, localVarCloudinaryConfig, [], onNotesRendered);
    populateSettings({}, localVarCloudinaryConfig);
    DOM.btnCloseModalEnv.click();
    handleAlert(Alert.WARNING, "Reset App successfully", DurationLength.SHORT);
    DOM.btnCloseBackModalEnv.click();
  } catch (e) {
    handleAlert(Alert.DANGER, `Failed to reset Firebase: ${e.message}`, DurationLength.LONG);
  }
}

export function switchEnvAction(envKey, dataEnv, localVarCloudinaryConfig, onSaveEnvClick) {
  const selectedEnv = dataEnv.find(env => {
    const envObj = handleTextEnv(env, true);
    return envObj?.APIKEY === envKey;
  });

  if (selectedEnv) {
    const envObj = handleTextEnv(selectedEnv, true);
    populateSettings(envObj, localVarCloudinaryConfig);
    onSaveEnvClick();
    DOM.switchCheckChecked.checked = false;
    DOM.labelSwitch.textContent = "Notes";
  }
}

export function removeEnvAction(envKey, dataEnv, setDataEnv) {
  const initialLength = dataEnv.length;
  const filtered = dataEnv.filter(env => {
    const envObj = handleTextEnv(env, true);
    return envObj?.APIKEY !== envKey;
  });

  if (filtered.length < initialLength) {
    setDataEnv(filtered);
    localStorage.setItem('envVariables', JSON.stringify(filtered));
    handleLoadLogEnvs(filtered);
  } else {
    console.warn('Environment not found:', envKey);
  }
}

export function handleLoadLogEnvs(dataEnv) {
  DOM.containerWords.innerHTML = '';
  if (dataEnv.length > 0) {
    dataEnv.forEach((env) => {
      let envObj = handleTextEnv(env, true);
      const divCard = document.createElement('div');
      divCard.className = 'card mb-2';
      const divCardBody = document.createElement('div');
      divCardBody.className = 'card-body';
      divCard.appendChild(divCardBody);
      const divCardTitle = document.createElement('div');
      divCardBody.appendChild(divCardTitle);
      divCardTitle.className = 'card-title d-flex align-items-center justify-content-between';
      divCardTitle.innerHTML = `
        <div class="d-flex align-items-center">
          <h5 class="mb-0 me-2">${envObj.APIKEY}</h5>
        </div>
        <div class="btn-group">
          <button type="button" id="switchEnv-${envObj.APIKEY}" class="btn btn-primary btn-move-env">
            <img id="switchEnvIcon-${envObj.APIKEY}" class="btn-move-env" src="/icons/move-right.svg" alt="">
          </button>
          <button type="button" id="deleteEnv-${envObj.APIKEY}" class="btn btn-danger btn-delete-env">
            <img id="deleteEnvIcon-${envObj.APIKEY}" class="btn-delete-env" src="/icons/trash.svg" alt="">
          </button>
        </div>`;
      const divContent = document.createElement('div');
      divContent.innerHTML = `
        AUTHDOMAIN: ${envObj.AUTHDOMAIN} <br>
        PROJECTID: ${envObj.PROJECTID} <br>
        STORAGEBUCKET: ${envObj.STORAGEBUCKET} <br>
        MESSAGINGSENDERID: ${envObj.MESSAGINGSENDERID} <br>
        APPID: ${envObj.APPID}
      `;
      divCardBody.appendChild(divContent);
      DOM.containerWords.appendChild(divCard);
    });
  } else {
    DOM.containerWords.textContent = 'No environment variables found.';
  }
  const buttonSetDefault = document.createElement('button');
  buttonSetDefault.className = 'btn btn-secondary mt-2 position-fixed bottom-0 start-0 mb-2 ms-2';
  buttonSetDefault.textContent = 'Set as Default';
  buttonSetDefault.addEventListener('click', () => {
    document.getElementById('btn-open-modal-confirm-env').click();
  });
  DOM.containerWords.appendChild(buttonSetDefault);
}
