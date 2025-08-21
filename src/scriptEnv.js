import {handleTextEnv} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
    const btnRefresh = document.getElementById("btn-refresh");
    const switchCheckChecked = document.getElementById("switchCheckChecked");
    const btnConfirmDelete = document.querySelector('#btn-delete-confirm');
    const labelSwitch = document.querySelector("label[for='switchCheckChecked']");
    const containerWords = document.querySelector('.container-word');
    const containerCategory = document.querySelector('.container-category');
    containerWords.addEventListener('click', handleClickInContainer)
    let dataEnv = [];
    switchCheckChecked.addEventListener("change", () => {
        if (switchCheckChecked.checked) {
            labelSwitch.textContent = "Environment";
            containerCategory.innerHTML = '';
            handleLoadLogEnvs();
        } else {
            labelSwitch.textContent = "Notes";
            btnRefresh.click();
        }
    });

    function handleLoadLogEnvs(){
        dataEnv = JSON.parse(localStorage.getItem('envVariables')) || [];
        containerWords.innerHTML = '';
        if (dataEnv.length > 0) {
            dataEnv.forEach((env, index) => {
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
                divContent.innerHTML = 
                `
                  AUTHDOMAIN: ${envObj.AUTHDOMAIN} <br>
                  PROJECTID: ${envObj.PROJECTID} <br>
                  STORAGEBUCKET: ${envObj.STORAGEBUCKET} <br>
                  MESSAGINGSENDERID: ${envObj.MESSAGINGSENDERID} <br>
                  APPID: ${envObj.APPID}
                `;
                divCardBody.appendChild(divContent);
                containerWords.appendChild(divCard);

            });
        } else {
            containerWords.textContent = 'No environment variables found.';
        }
        const buttonSetDefault = document.createElement('button');
        buttonSetDefault.className = 'btn btn-secondary mt-2 position-fixed bottom-0 start-0 mb-2 ms-2';
        buttonSetDefault.textContent = 'Set as Default';
        buttonSetDefault.addEventListener('click', handleClickSetDefault);
        containerWords.appendChild(buttonSetDefault);
    }

    function handleClickSetDefault(){
      document.getElementById('btn-open-modal-confirm-env').click();
    }

    function handleClickInContainer(event){
      const target = event.target;
      if (target.matches('.btn-move-env') || target.closest('.btn-move-env')) {
        const envKey = target.closest('.card').querySelector('.card-title h5').textContent;
        switchEnv(envKey);
      } else if (target.matches('.btn-delete-env') || target.closest('.btn-delete-env')) {
        const envKey = target.closest('.card').querySelector('.card-title h5').textContent;
        btnConfirmDelete.removeEventListener('click', handleDeleteConfirm);
        btnConfirmDelete.envKeyToDelete = envKey;
        btnConfirmDelete.addEventListener('click', handleDeleteConfirm);
      }
    }

    function handleDeleteConfirm() {
      if (btnConfirmDelete.envKeyToDelete) {
        removeEnv(btnConfirmDelete.envKeyToDelete);
        btnConfirmDelete.envKeyToDelete = null;
        btnConfirmDelete.removeEventListener('click', handleDeleteConfirm);
      }
    }

    const textAreaEnvVariables = document.getElementById('env-variables');
    const btnSaveEnv = document.getElementById('btn-save-env');

    function switchEnv(envKey){
      const selectedEnv = dataEnv.find(env => {
        const envObj = handleTextEnv(env, true);
        return envObj?.APIKEY === envKey;
      });
      
      if (selectedEnv) {
        textAreaEnvVariables.value = selectedEnv;
        btnSaveEnv.click();
        switchCheckChecked.checked = false;
      }
    }

    function removeEnv(envKey){
        const initialLength = dataEnv.length;
        dataEnv = dataEnv.filter(env => {
          const envObj = handleTextEnv(env, true);
          return envObj?.APIKEY !== envKey;
        });
        
        if (dataEnv.length < initialLength) {
          localStorage.setItem('envVariables', JSON.stringify(dataEnv));
          handleLoadLogEnvs();
          console.log('Environment removed:', envKey);
        } else {
          console.warn('Environment not found:', envKey);
        }
    }
  }
);

