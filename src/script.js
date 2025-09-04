import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { handleTextEnv, validateEnvVars } from "./utils.js";

// Cloudinary signature generation
async function generateCloudinarySignature(params, apiSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const message = sortedParams + apiSecret;
  
  // Use Web Crypto API to generate SHA-1 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Initialize aler
const alertWarning = document.querySelector('#alert-warning');
const alertInfo = document.querySelector('#alert-info');
const alertDanger = document.querySelector('#alert-danger');
const Alert = {
  WARNING: "alertWarning",
  INFO: "alertInfo",
  DANGER: "alertDanger"
};
const COLOR = [
  'primary',
  'secondary',
  'success',
  'danger',
  'dark'
]
const DurationLength = {
  SHORT: 1000,
  MEDIUM: 2000,
  LONG: 3000
}
let currentAlert = null;
function handleAlert(type, message, duration) {
  if (currentAlert) {
    clearTimeout(currentAlert);
    alertWarning.classList.remove('in');
    alertInfo.classList.remove('in');
    alertDanger.classList.remove('in');
  }

  switch (type) {
    case Alert.WARNING:
      alertWarning.textContent = message;
      alertWarning.classList.add('in');
      break;
    case Alert.INFO:
      alertInfo.textContent = message;
      alertInfo.classList.add('in');
      break;
    case Alert.DANGER:
      alertDanger.textContent = message;
      alertDanger.classList.add('in');
      break;
  }

  currentAlert = setTimeout(() => {
    alertWarning.classList.remove('in');
    alertInfo.classList.remove('in');
    alertDanger.classList.remove('in');
    currentAlert = null;
  }, duration);
}
// Initialize TinyMCE
const applyTinyMCETheme = (isDarkTheme) => {
  tinymce.init({
    selector: '#editor',
    menubar: false,
    plugins: [
      'lists', 'table'
    ],
    toolbar: 'bold italic underline | forecolor backcolor | table | align lineheight | checklist numlist bullist',
    skin: isDarkTheme ? 'oxide-dark' : 'oxide',
    setup: (editor) => {
      editor.on('init', () => {
        editor.getBody().style.backgroundColor = isDarkTheme ? '#343a40' : '#ffffff';
        editor.getBody().style.color = isDarkTheme ? '#ffffff' : '#000000';
        editor.getBody().style.fontSize = '18px';
      });
      editor.on('paste', async function(e) {
        const items = e.clipboardData && e.clipboardData.items;
        if (!items) return;
        let handled = false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith("image/")) {
            handled = true;
            e.preventDefault();
            const file = item.getAsFile();
            const progressText = '***Image Uploading DONT TOUCH THIS TEXT....***';
            editor.insertContent(progressText);
            const formData = new FormData();
            formData.append('file', file);
                         const cloudName = (configCloudinary?.CLOUD_NAME || '').trim();
             const uploadPreset = (configCloudinary?.UPLOAD_PRESET || '').trim();
             const api_key = (configCloudinary?.API_KEY || '').trim();

            if (!cloudName || !uploadPreset) {
              const content = editor.getContent();
              const updatedContent = content.replace(progressText, 
                '***Please configure Cloudinary settings to have best performance***'
              );
              editor.setContent(updatedContent);
              return;
            }
            
            formData.append("api_key", api_key);
            formData.append("upload_preset", uploadPreset);

            fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
              })
              .then(async (response) => {
                let data;
                try { data = await response.json(); } catch (_) { data = null; }
                if (!response.ok) {
                  console.error('Cloudinary upload failed', { status: response.status, data });
                  throw new Error(data?.error?.message || `Upload failed with status ${response.status}`);
                }
                return data;
              })
              .then(async data => {
                const content = editor.getContent();
                if (data && data.secure_url) {
                  const widthAttr = data.width ? ` width=\"${data.width}\"` : '';
                  const heightAttr = data.height ? ` height=\"${data.height}\"` : '';
                  const imgTxt = `<img src=\"${data.secure_url}\" alt=\"image\"${widthAttr}${heightAttr} />`;
                  const updatedContent = content.replace(progressText, imgTxt);
                  editor.setContent(updatedContent);
                  let dataImage = {
                    url: data.secure_url,
                    signature: data.signature
                  }
                  await handleUploadImageUrl(dataImage);
                } else {
                  const updatedContent = content.replace(progressText, '***Image upload failed***');
                  editor.setContent(updatedContent);
                }
              })
              .catch((err) => {
                console.error('Cloudinary upload error', err);
                const content = editor.getContent();
                const updatedContent = content.replace(progressText, '***Image upload failed***');
                editor.setContent(updatedContent);
              });
          }
        }
        if (handled) {
          e.preventDefault();
        }
      });
    }
  });
};
const handleUploadImageUrl = async (data) => {
  await addDoc(collection(db, "note-images"), data);
};
// change theme
const themeSwitcher = document.getElementById('theme-switcher');
let darkTheme = localStorage.getItem('dark-theme') === 'true';
themeSwitcher.addEventListener('click', () => {
    const img = themeSwitcher.querySelector('img');
    darkTheme = !darkTheme;
    if(!darkTheme)
    {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        document.querySelectorAll('.card-title').forEach((el) => {
          el.classList.remove('dark-theme');
          el.classList.add('light-theme');
        });
        img.src = '/icons/brightness-high-fill.svg';
        themeSwitcher.classList.add('border-dark');
        themeSwitcher.classList.add('btn-light');
        themeSwitcher.classList.remove('border-light');
        themeSwitcher.classList.remove('btn-dark');
    }
    else
    {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        document.querySelectorAll('.card-title').forEach((el) => {
          el.classList.remove('light-theme');
          el.classList.add('dark-theme');
        });
        img.src = '/icons/moon-fill.svg';
        themeSwitcher.classList.add('border-light');
        themeSwitcher.classList.remove('border-dark');
        themeSwitcher.classList.add('btn-dark');
        themeSwitcher.classList.remove('btn-light');
    }
    changeIconCustomTheme(darkTheme);
    tinymce.remove(); 
    localStorage.setItem('dark-theme', darkTheme);
    applyTinyMCETheme(darkTheme);
});
function initTheme() {
    const img = themeSwitcher.querySelector('img');
    if (darkTheme) {
        document.body.classList.add('dark-theme');
        img.src = '/icons/moon-fill.svg';
        themeSwitcher.classList.add('border-light');
        themeSwitcher.classList.remove('border-dark');
        themeSwitcher.classList.add('btn-dark');
        themeSwitcher.classList.remove('btn-light');
    } else {
        document.body.classList.add('light-theme');
        img.src = '/icons/brightness-high-fill.svg';
        themeSwitcher.classList.add('border-dark');
        themeSwitcher.classList.add('btn-light');
        themeSwitcher.classList.remove('border-light');
        themeSwitcher.classList.remove('btn-dark');
    }
    applyTinyMCETheme(darkTheme);
}
function changeIconCustomTheme(darkTheme) {
    if (darkTheme) {
        document.querySelectorAll('[id^="copyIcon-"]').forEach((el) => {
          el.src = '/icons/copy-icon-light.svg';
        });
        document.querySelectorAll('[id^="pinIcon-"]').forEach((el) => {
          const isPinned = el.src.includes('pinned');
          el.src = isPinned ? '/icons/pinned-icon-yellow.svg' : '/icons/pin-white.svg';
        });
        document.querySelectorAll('[id^="deleteIcon-"]').forEach((el) => {
          el.src = '/icons/trash.svg';
        });
        document.querySelectorAll('[id^="editIcon-"]').forEach((el) => {
          el.src = '/icons/pencil-square.svg';
        });
    } else {
        document.querySelectorAll('[id^="copyIcon-"]').forEach((el) => {
          el.src = '/icons/copy.svg';
        });
        document.querySelectorAll('[id^="pinIcon-"]').forEach((el) => {
          const isPinned = el.src.includes('pinned');
          el.src = isPinned ? '/icons/pinned.svg' : '/icons/pin.svg';
        });
        document.querySelectorAll('[id^="deleteIcon-"]').forEach((el) => {
          el.src = '/icons/trash-black.svg';
        });
        document.querySelectorAll('[id^="editIcon-"]').forEach((el) => {
          el.src = '/icons/pencil-square-black.svg';
        });
    }
}
initTheme()

// Initialize Cloud Firestore through Firebase
const envVariables = document.querySelector('#env-variables');
const btnSaveEnv = document.querySelector('#btn-save-env');
const btnCloseModalEnv = document.querySelector('#btn-close-modal-setting');
const btnBackEnv = document.querySelector('#btn-back-confirm');
const btnCloseBackModalEnv = document.querySelector('#btn-close-back-modal-confirm');
let dataEnv = JSON.parse(localStorage.getItem('envVariables')) || [];
envVariables.value = dataEnv[0] || '';
btnBackEnv.addEventListener('click', async () => {
  try{
    switchCheckChecked.checked = false;
    labelSwitch.textContent = "Notes";
    await resetFirebaseApp();
    envVariables.value = '';
    btnCloseModalEnv.click();
    handleAlert(Alert.WARNING, "Reset App successfully", DurationLength.SHORT);
    btnCloseBackModalEnv.click();
  }catch(e){
    handleAlert(Alert.DANGER, `Failed to reset Firebase: ${e.message}`, DurationLength.LONG);
  }
});
let configEnv = {};
let configCloudinary = {};
let firebaseConfig = {};
var app = null;
var db = null;

const loadEnv = async () => {
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
    }
       configCloudinary = {
       CLOUD_NAME: tempConfigEnv.CLOUDINARY_CLOUDNAME,
       UPLOAD_PRESET: tempConfigEnv.CLOUDINARY_UPLOADPRESET,
       API_KEY: tempConfigEnv.CLOUDINARY_APIKEY,
       API_SECRET: tempConfigEnv.CLOUDINARY_APISECRET,
     }
  } catch (error) {
    throw new Error('Error loading .env file: ' + error.message);
  }
};
loadEnv();
function setupFirebase(){
  firebaseConfig = {
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

// Validate that all required environment variables are loaded
function validateFirebaseSetup() {
  if (!app || !db) {
    throw new Error('Firebase is not properly initialized');
  }
}
async function resetFirebaseApp(newConfig = null, isLoadInitWeb = false) {
  try {
    categoryPageSize = 5;
    currentCategorySelected = null;
    if (app) {
      await deleteApp(app);
      app = null;
      db = null;
    }
    
    if (newConfig) {
      configEnv = newConfig;
    } else {
      await loadEnv();
    }

    validateEnvVars(configEnv);
    setupFirebase();
    validateFirebaseSetup();
    
    if (!isLoadInitWeb) {
      await renderNotes();
    }
    
    dataEnv = JSON.parse(localStorage.getItem('envVariables')) || [];

    let existingEnvData = dataEnv.find(item => handleTextEnv(item, true)?.APIKEY === configEnv.APIKEY);
    let isExisted = !!existingEnvData;
    if (!isExisted) {
        let result = Object.entries(configEnv)
          .map(([key, value]) => `  ${key}: "${value}",`)
          .join("\n");
        dataEnv.unshift(result);
        localStorage.setItem('envVariables', JSON.stringify(dataEnv));
    } else {
        dataEnv = dataEnv.filter(item => handleTextEnv(item, true)?.APIKEY !== configEnv.APIKEY);
        dataEnv.unshift(existingEnvData);
        localStorage.setItem('envVariables', JSON.stringify(dataEnv));
    }
    handleAlert(Alert.INFO, "Firebase configuration updated successfully!", DurationLength.SHORT);

    return true;
  } catch (error) {
    throw error;
  }
}
async function initFirebase(){
  try {
    if (envVariables.value && envVariables.value.trim()) {
      await resetFirebaseApp(handleTextEnv(envVariables.value, true), true);
    } else {
      await resetFirebaseApp(null, true);
    }
  } catch (error) {
    handleAlert(Alert.DANGER, error.message, DurationLength.LONG);
  }
}
await initFirebase();

  // CRUD
  var listItem = [];
  var listItemTemp = [];
  var listCategories = [];
  var isClickNewButton = true;
  let currentNoteId = null;
  let currentCategorySelected = null;
  let categoryPageSize = 5;

  const createOrUpdateNoteForm = document.querySelector('#upserd-Note-form');
  const searchInput = document.querySelector('#search');
  const containerWords = document.querySelector('.container-word');
  const loadingOverlay = document.querySelector('#loadingOverlay');
  const createNote = document.querySelector('#createNote');

  const btnCloseModal = document.querySelector('#btn-close-modal');
  const btnOpenModal = document.querySelector('#btn-open-modal');
  const btnDelete = document.querySelector('#btn-delete-confirm');
  const btnModalConfirm = document.querySelector('#btn-open-modal-confirm');
  const btnModalConfirmClose = document.querySelector('#btn-close-modal-confirm');
  const scrollToTopBtn = document.querySelector('#scrollToTopBtn');
  const btnRefresh = document.getElementById("btn-refresh");
  const switchCheckChecked = document.getElementById("switchCheckChecked");
  const labelSwitch = document.querySelector("label[for='switchCheckChecked']");
  const categoriesListItemDom = document.getElementById("categoriesList");
  const containerCategory = document.querySelector('.container-category');
  const btnCleanImagesCloudinary = document.getElementById('btn-clean-images');

  btnRefresh.addEventListener("click", async()=>{await renderNotes()});
  createOrUpdateNoteForm.addEventListener('submit', handleSubmit);
  btnCloseModal.addEventListener('click', handleReset);
  searchInput.addEventListener('input', handleInputSearch);
  containerWords.addEventListener('click', handleContainerEventClick);
  containerWords.addEventListener('scroll', handleContainerScroll);
  scrollToTopBtn.addEventListener('click', scrollToTop);
  btnSaveEnv.addEventListener('click', handleLoadEnv)
  containerCategory.addEventListener('click', handleClickInContainer);
  btnCleanImagesCloudinary.addEventListener('click', async () => {
    btnCleanImagesCloudinary.disabled = true;
    await handleCleanImagesCloudinary();
    btnCleanImagesCloudinary.disabled = false;
  });

  createNote.addEventListener('click', (e)=>{
    if (e.target !== e.currentTarget) {
      e.stopPropagation();
      return;
    }
    handleReset();
  });

  function handleReset(){
    isClickNewButton = true;
    currentNoteId = null;
    createOrUpdateNoteForm.reset();
  }

  function LoadCategory(){
    categoriesListItemDom.innerHTML = '';
    containerCategory.innerHTML = '';
    if(listCategories.length > 0) {
      let badges = '';
      for (let i = 0; i < categoryPageSize && i < listCategories.length; i++) {
        const category = listCategories[i];
        categoriesListItemDom.innerHTML += `<option value="${category}">${category}</option>`;
        const colorClass = COLOR[i % COLOR.length];
        const isSelected = currentCategorySelected === category ? 'selected' : '';
        badges += `
          <span class="badge rounded-pill bg-${colorClass} me-1 mb-2 button-click-category user-select-none ${isSelected}">${category}</span>
        `;
      }
      if(categoryPageSize < listCategories.length){
         badges += `
          <span class="badge rounded-pill bg-light me-1 mb-2 button-click-category-more user-select-none text-dark">...+${Math.min(listCategories.length - categoryPageSize, 5)}</span>
        `;
      }
      containerCategory.innerHTML = badges;
    }
  }

  const loadData = async () => {
    containerWords.innerHTML = '';
    listItem.sort((a, b) => {
      if (currentCategorySelected) {
        const aMatchesCategory = a.category === currentCategorySelected;
        const bMatchesCategory = b.category === currentCategorySelected;
        if (aMatchesCategory && !bMatchesCategory) return -1;
        if (!aMatchesCategory && bMatchesCategory) return 1;
      }
      
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      return b.timestamp - a.timestamp;
    });

    LoadCategory();

    listItem.forEach(item => {
      containerWords.innerHTML += `
      <div class="card mb-2">
        <div class="card-body">
          <div class="card-title d-flex align-items-center justify-content-between sticky-top" style="z-index:1;">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2">${item.Note}</h5>
              <button type="button" id="pin-${item.id}" class="btn">
                <img id="pinIcon-${item.id}" src="${item.isPinned ? '/icons/pinned.svg' : '/icons/pin.svg'}" alt="">
              </button>
            </div>
            <div class="btn-group">
              <button type="button" id="edit-${item.id}" class="btn btn-edit">
                <img id="editIcon-${item.id}" src="/icons/pencil-square.svg" alt="">
              </button>
              <button type="button" id="delete-${item.id}" class="btn btn-delete">
                <img id="deleteIcon-${item.id}" src="/icons/trash.svg" alt="">
              </button>
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-between mt-2">
            <div class="d-flex gap-2">
              <p class="card-text font-monospace fst-italic small mb-0">
                ${item.timestamp.toDate().toLocaleString()}
              </p>
              ${item.category ? `<span class="badge rounded-pill bg-light font-monospace fst-italic small mb-0 text-dark border border-secondary">${item.category}</span>` : ''}
            </div>
            <button type="button" id="copy-${item.id}" class="btn btn-copy">
              <img id="copyIcon-${item.id}" src="" alt="">
            </button>
          </div>
        <div class="example-wrapper" id="example-${item.id}">
          ${item.example}
        </div>
        <button type="button" id="readMore-${item.id}" class="btn btn-link fw-bold btn-sm" style="display: none;">
          more...
        </button>
        </div>
      </div>
      `;
    });
    changeIconCustomTheme(darkTheme);
    let exampleWrappers = document.querySelectorAll('.example-wrapper');
    exampleWrappers.forEach(exampleDiv => {
      let readMoreBtn = exampleDiv.nextElementSibling;
      if (exampleDiv.scrollHeight > 350) {
        readMoreBtn.style.display = "inline-block";
      }
    });
  };
  
  const backUpdata = () => {
    localStorage.setItem('NotesBackups', JSON.stringify(listItem));
  };

  const renderNotes = async () => {
    containerWords.innerHTML = '';
    listItem = [];
    listItemTemp = [];
    try {
      loadingOverlay.style.display = '';
      const querySnapshot = await getDocs(collection(db, "Notes"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listItem.push({
          id: doc.id,
          Note: data.Note,
          example: data.example,
          isPinned: data?.isPinned,
          category: data?.category,
          otherExample: stripHtmlAdvanced(data.example),
          timestamp: data.timestamp
        });
      });

      listCategories = Array.from(new Set(listItem.filter(item => item?.category).map(item => item.category)));
      if (listCategories.includes(currentCategorySelected)) {
        listCategories = [currentCategorySelected, ...listCategories.filter(cat => cat !== currentCategorySelected)];
      }
      loadData();
      listItemTemp = [...listItem];
      backUpdata();
    } catch (e) {
      handleAlert(Alert.DANGER, "Error getting documents: "+ e.message, DurationLength.LONG);
      listItemTemp = localStorage.getItem('NotesBackups') ? JSON.parse(localStorage.getItem('NotesBackups')) : [];
      listItem = [...listItemTemp];
    } finally {
      loadingOverlay.style.display = 'none';
    }
  };
  await renderNotes();

  async function handleCleanImagesCloudinary() {
      let listImage = [];
      const querySnapshotImages = await getDocs(collection(db, "note-images"));
      querySnapshotImages.forEach((doc) => {
        const data = doc.data();
        listImage.push({
          id: doc.id,
          url: data.url,
          signature: data.signature
        });
      });
      if (listImage.length === 0) {
        return;
      }
      const unusedImages = listImage.filter(
        img => !listItem.some(item => item.example.includes(img.url))
      );
      if (unusedImages.length && configCloudinary.API_SECRET) {
        loadingOverlay.style.display = '';
        for (const img of unusedImages) {
          try {
            const urlParts = img.url.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            if (uploadIndex === -1) continue;
            
            const pathAfterUpload = urlParts.slice(uploadIndex + 1);
            const lastPart = pathAfterUpload[pathAfterUpload.length - 1];
            const publicId = lastPart.split('.')[0];
            const timestamp = Math.floor(Date.now() / 1000);
            
            const params = {
              public_id: publicId,
              timestamp: timestamp,
              invalidate: true
            };
            
            const signature = await generateCloudinarySignature(params, configCloudinary.API_SECRET);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${configCloudinary.CLOUD_NAME}/image/destroy`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...params,
                api_key: configCloudinary.API_KEY,
                signature: signature
              })
            });
            
            const data = await response.json();
            if (data.result !== 'ok') {
              handleAlert(Alert.DANGER, 'Failed to delete image from Cloudinary', DurationLength.LONG);
            } else {
              await deleteDoc(doc(db, `note-images/${img.id}`));
              handleAlert(Alert.INFO, 'Image deleted from Cloudinary successfully', DurationLength.MEDIUM);
            }
          } catch (error) {
            handleAlert(Alert.DANGER, 'Error: ' + error.message, DurationLength.LONG);
          }
          finally {
            loadingOverlay.style.display = 'none';
          }
        }
      }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    await handleUpsertNote(e, currentNoteId);
  };

  async function handleUpsertNote(e,idNote) {
    const id = idNote;
    const Note = e.target.Note.value;
    const example = tinymce.get('editor').getContent();
    const category = e.target.category.value.trim();
    loadingOverlay.style.display = '';
    const data = {
      Note: Note,
      example: example,
      timestamp: new Date(),
      category: category
    }
    try {
      if ((id == '' || id == null || id == undefined) && isClickNewButton) {
        await addDoc(collection(db, "Notes"), data);
      } else {
        await updateDoc(doc(db, `Notes/${id}`), data);
      }
      currentCategorySelected = category;
      await renderNotes();
      handleAlert(Alert.INFO, "Note added successfully", DurationLength.MEDIUM);
    } catch (e) {
      handleAlert(Alert.DANGER, "Error adding document: "+ e.message, DurationLength.LONG);
      listItemTemp = listItemTemp.push({
        Note: Note,
        example: example,
        timestamp: new Date()
      });
      listItem = [...listItemTemp];
      backUpdata();
    } finally {
      loadingOverlay.style.display = 'none';
      btnCloseModal.click();
    }
  }

  function handleInputSearch(e) {
    const value = e.target.value.toLowerCase();
    labelSwitch.textContent = "Notes";
    switchCheckChecked.checked = false;
    listItem = listItemTemp.filter(item =>
      item.Note.toLowerCase().includes(value) ||
      item.otherExample.toLowerCase().includes(value)
    );
    loadData();
  }
  
  function stripHtmlAdvanced(html) {
    html = html.replace(/<\s*br\s*\/?>/gi, '\n')
               .replace(/<\/p\s*>/gi, '\n');

    const temp = document.createElement("div");
    temp.innerHTML = html;
    let text = temp.textContent || temp.innerText || "";

    let lines = text.split(/\n+/).map(line => {
        line = line.trim();
        if (line && !/[.!?…]$/.test(line)) {
            line += '.';
        }
        return line;
    });

    return lines.filter(l => l).join('\n');
  }
  
  function handleClickInContainer(e){
    const target = e.target;
    if(target.matches('.button-click-category')){
      const clickedCategory = target.textContent.trim();
      if (currentCategorySelected === clickedCategory) {
        currentCategorySelected = null;
      } else {
        currentCategorySelected = clickedCategory;
      }
      loadData();
      scrollToTopBtn.click();
    }
    else if (target.matches('.button-click-category-more')) {
      categoryPageSize += 5;
      LoadCategory();
      containerCategory.scrollTo({
        top: containerCategory.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  async function handleContainerEventClick(e) {
    const id = e.target.id;
    if (id.includes('edit')) {
      const NoteId = id.split('-')[1];
      const Note = listItem.find(item => item.id === NoteId);
      document.querySelector('#Note').value = Note.Note;
      tinymce.get('editor').setContent(Note.example);
      document.querySelector('#category').value = Note.category || '';
      isClickNewButton = false;
      currentNoteId = NoteId;
      btnOpenModal.click();
    }
    else if (id.includes('delete')) {
      currentNoteId = id.split('-')[1];
      isClickNewButton = true;
      btnModalConfirm.click();
      btnDelete.addEventListener('click', handleDeleteNote);
    }
    else if (id.includes('copy')) {
      const NoteId = id.split('-')[1];
      onClickCopy(NoteId);
    }
    else if (id.includes('pin')) {
      const NoteId = id.split('-')[1];
      const Note = listItem.find(item => item.id === NoteId);
      Note.isPinned = !Note.isPinned;
      const isPinned = Note.isPinned;
      try{
        loadingOverlay.style.display = '';
        await updateDoc(doc(db, `Notes/${NoteId}`), { isPinned: Note.isPinned });
        handleAlert(Alert.INFO, `Note ${isPinned ? 'pinned' : 'unpinned'} successfully`, DurationLength.SHORT);
        loadData();
      }catch(e){
        handleAlert(Alert.DANGER, "Error pinning note: " + e.message, DurationLength.LONG);
      }
      finally {
        backUpdata();
        loadingOverlay.style.display = 'none';
      }
    }
    else if (id.includes('readMore')) {
      const NoteId = id.split('-')[1];
      const exampleWrapper = document.querySelector(`#example-${NoteId}`);
      const readMoreButton = document.querySelector(`#readMore-${NoteId}`);
      exampleWrapper.classList.toggle("expanded");
      if (exampleWrapper.classList.contains("expanded")) {
        readMoreButton.textContent = 'less';
      } else {
        readMoreButton.textContent = 'more...';
        readMoreButton.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function stripHtmlAdvancedToCopy(html) {
    html = html.replace(/<\s*br\s*\/?>/gi, '\n')
              .replace(/<\/p\s*>/gi, '\n');

    const temp = document.createElement("div");
    temp.innerHTML = html;

    function processNode(node, prefix = '') {
      let text = '';
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'UL') {
          let items = [];
          node.querySelectorAll(':scope > li').forEach(li => {
            items.push('• ' + processNode(li).trim());
          });
          return items.join('\n');
        }
        if (node.tagName === 'OL') {
          let items = [];
          let index = 1;
          node.querySelectorAll(':scope > li').forEach(li => {
            items.push(index + '. ' + processNode(li).trim());
            index++;
          });
          return items.join('\n');
        }
        if (node.tagName === 'LI') {
          return Array.from(node.childNodes).map(child => processNode(child)).join('');
        }
        return Array.from(node.childNodes).map(child => processNode(child)).join('');
      }
      return text;
    }

    let text = processNode(temp);

    let lines = text.split(/\n+/).map(line => {
      line = line.trim();
      if (line) {
        const endsWithPunct = /[.!?:;…]$/.test(line);
        const isListItem = /^(\u2022|•|\d+\.|\[\s?[\sxX]?\])/.test(line);
        if (!endsWithPunct && !isListItem) {
          line += '.';
        }
      }
      return line;
    });

    return lines.filter(l => l).join('\n');
  }

  function onClickCopy(id){
    const item = listItem.find(item => item.id === id);
    handleAlert(Alert.INFO, "Text copied to clipboard", DurationLength.SHORT);
    console.log(stripHtmlAdvancedToCopy(item.example));
    navigator.clipboard.writeText(stripHtmlAdvancedToCopy(item.example));
  }

  const handleDeleteNote = async () => {
    if (currentNoteId) {
      await deleteNote(currentNoteId);
      currentNoteId = null;
      btnDelete.removeEventListener('click', handleDeleteNote);
    }
  };

  const deleteNote = async (NoteId) => {
    try {
      if(switchCheckChecked.checked)
        return;
      loadingOverlay.style.display = '';
      await deleteDoc(doc(db, `Notes/${NoteId}`));
      await renderNotes();
      handleAlert(Alert.WARNING, "Note removed successfully", DurationLength.MEDIUM);
    } catch (e) {
      handleAlert(Alert.DANGER, "Error removing document: " + e.message, DurationLength.LONG);
    } finally {
      loadingOverlay.style.display = 'none';
      btnModalConfirmClose.click();
    }
  };

  function handleContainerScroll(){
    if(containerWords.scrollTop > 100) {
      scrollToTopBtn.style.display = 'block';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  }

  function scrollToTop() {
    containerWords.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function handleLoadEnv(){
    loadingOverlay.style.display = 'block';
    const envText = envVariables.value.trim();
    if (!envText) {
      handleAlert(Alert.WARNING, "Please enter environment variables", DurationLength.SHORT);
      loadingOverlay.style.display = 'none';
      return;
    }

    try {
      const env = handleTextEnv(envText, true);
      const success = await resetFirebaseApp(env);
      
      if (success) {
        btnCloseModalEnv.click();
      }
    } catch (error) {
      handleAlert(Alert.DANGER, `Failed to update configuration: ${error.message}`, DurationLength.LONG);
    } finally {
      loadingOverlay.style.display = 'none';
      switchCheckChecked.checked = false;
    }
  }

  function AutoUpdateEditorContent() {
     chrome.storage.local.get(['selectedText', 'addToNote','category','title'], function(result) {
      if (result.addToNote && result.selectedText) {
        try {
          if (tinymce.get('editor')) {
              const newContent = result.selectedText;
              tinymce.get('editor').setContent(newContent);
              document.getElementById('category').value = result.category || '';
              document.getElementById('Note').value = result.title || '';

              const submitButton = document.getElementById('submit-note');
              if (submitButton) {
                submitButton.click();
                currentCategorySelected = result.category || null;
              }
              handleAlert(Alert.INFO, 'Selected text added to editor, now saving to Notes...', DurationLength.MEDIUM);
          }
          
          chrome.storage.local.remove(['selectedText', 'addToNote']);
          
        } catch (error) {
          handleAlert(Alert.DANGER, 'Failed to add text to note', DurationLength.SHORT);
        }
      }
    });
  }

  if (typeof chrome !== 'undefined' && chrome.storage) {
    AutoUpdateEditorContent();    
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'autoUpdateEditor') {
      AutoUpdateEditorContent();
      sendResponse({success: true});
      return true;
    }
  });