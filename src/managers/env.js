import { handleTextEnv } from '../utils.js';
import { resetFirebaseApp } from './firebase.js';
import { handleAlert, Alert, DurationLength } from '../ui/alert.js';
import { DOM } from '../config/dom.js';

export function initializeEnvDisplay(dataEnv, localVarCloudinaryConfig) {
  let configText = Object.entries(localVarCloudinaryConfig)
    .map(([key, value]) => `${key}: "${value}"`)
    .join(',\n');
  DOM.envVariables.value = (dataEnv[0] ? dataEnv[0] + ',\n' : '') + configText;
}

export async function handleLoadEnv(dataEnv, localVarCloudinaryConfig, setDataEnv, setLocalVarCloudinaryConfig, onNotesRendered) {
  DOM.loadingOverlay.style.display = 'block';
  const envText = DOM.envVariables.value.trim();
  if (!envText) {
    handleAlert(Alert.WARNING, "Please enter environment variables", DurationLength.SHORT);
    DOM.loadingOverlay.style.display = 'none';
    return;
  }

  try {
    const env = handleTextEnv(envText, true);
    const configEnv = {
      APIKEY: env.APIKEY,
      AUTHDOMAIN: env.AUTHDOMAIN,
      PROJECTID: env.PROJECTID,
      STORAGEBUCKET: env.STORAGEBUCKET,
      MESSAGINGSENDERID: env.MESSAGINGSENDERID,
      APPID: env.APPID
    };

    const newCloudinaryConfig = {
      CLOUDINARY_CLOUDNAME: env.CLOUDINARY_CLOUDNAME,
      CLOUDINARY_UPLOADPRESET: env.CLOUDINARY_UPLOADPRESET,
      CLOUDINARY_APIKEY: env.CLOUDINARY_APIKEY,
      CLOUDINARY_APISECRET: env.CLOUDINARY_APISECRET,
    };

    const missingCloudinaryKeys = [];
    if (!newCloudinaryConfig.CLOUDINARY_CLOUDNAME?.trim()) {
      missingCloudinaryKeys.push('CLOUDINARY_CLOUDNAME');
    }
    if (!newCloudinaryConfig.CLOUDINARY_UPLOADPRESET?.trim()) {
      missingCloudinaryKeys.push('CLOUDINARY_UPLOADPRESET');
    }
    if (!newCloudinaryConfig.CLOUDINARY_APIKEY?.trim()) {
      missingCloudinaryKeys.push('CLOUDINARY_APIKEY');
    }
    if (!newCloudinaryConfig.CLOUDINARY_APISECRET?.trim()) {
      missingCloudinaryKeys.push('CLOUDINARY_APISECRET');
    }

    if (missingCloudinaryKeys.length > 0) {
      handleAlert(Alert.WARNING, `Missing Cloudinary config: ${missingCloudinaryKeys.join(', ')}`, DurationLength.LONG);
    } else {
      localStorage.setItem('envCloudinary', JSON.stringify(newCloudinaryConfig));
    }

    setLocalVarCloudinaryConfig(newCloudinaryConfig);
    const success = await resetFirebaseApp(configEnv, false, newCloudinaryConfig, dataEnv, onNotesRendered);
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
    let configText = Object.entries(localVarCloudinaryConfig)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(',\n');
    DOM.envVariables.value = ',\n' + configText;
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
    let cloudinaryText = Object.entries(localVarCloudinaryConfig)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(',\n');
    DOM.envVariables.value = selectedEnv + ',\n' + cloudinaryText;
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
