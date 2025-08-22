import { initializeApp, deleteApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { handleTextEnv, validateEnvVars } from "./utils.js";

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
  'warning',
  'info',
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
    plugins: [
      'codesample', 'emoticons', 'link', 'lists', 'searchreplace', 'table'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    tinycomments_mode: 'embedded',
    skin: isDarkTheme ? 'oxide-dark' : 'oxide',
    setup: (editor) => {
      editor.on('init', () => {
        editor.getBody().style.backgroundColor = isDarkTheme ? '#343a40' : '#ffffff';
        editor.getBody().style.color = isDarkTheme ? '#ffffff' : '#000000';
      });
    }
  });
};

// change theme
const themeSwitcher = document.getElementById('theme-switcher');
let darkTheme = localStorage.getItem('dark-theme') === 'true';
themeSwitcher.addEventListener('click', () => {
    const img = themeSwitcher.querySelector('img');
    if(darkTheme)
    {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        img.src = '/icons/brightness-high-fill.svg';
    }
    else
    {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        img.src = '/icons/moon-fill.svg';
    }
    changeIconCustomTheme(!darkTheme);
    tinymce.remove(); 
    darkTheme = !darkTheme;
    localStorage.setItem('dark-theme', darkTheme);
    applyTinyMCETheme(darkTheme);
});

function initTheme() {
    const img = themeSwitcher.querySelector('img');
    if (darkTheme) {
        document.body.classList.add('dark-theme');
        img.src = '/icons/moon-fill.svg';
    } else {
        document.body.classList.add('light-theme');
        img.src = '/icons/brightness-high-fill.svg';
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
        document.querySelectorAll('[id^="readMore-"]').forEach((el) => {
          el.classList.add('text-white');
          el.classList.remove('text-dark');
        });
    } else {
        document.querySelectorAll('[id^="copyIcon-"]').forEach((el) => {
          el.src = '/icons/copy.svg';
        });
        document.querySelectorAll('[id^="pinIcon-"]').forEach((el) => {
          const isPinned = el.src.includes('pinned');
          el.src = isPinned ? '/icons/pinned.svg' : '/icons/pin.svg';
        });
        document.querySelectorAll('[id^="readMore-"]').forEach((el) => {
          el.classList.add('text-dark');
          el.classList.remove('text-white');
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
let firebaseConfig = {};
var app = null;
var db = null;

const loadEnv = async () => {
  try {
    const response = await fetch('/env');
    const text = await response.text();
    configEnv = handleTextEnv(text, false);
  } catch (error) {
    throw new Error('Error loading .env file: ' + error.message);
  }
};

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

  btnRefresh.addEventListener("click", async()=>{await renderNotes()});
  createOrUpdateNoteForm.addEventListener('submit', handleSubmit);
  btnCloseModal.addEventListener('click', handleReset);
  searchInput.addEventListener('input', handleInputSearch);
  containerWords.addEventListener('click', handleContainerEventClick);
  containerWords.addEventListener('scroll', handleContainerScroll);
  scrollToTopBtn.addEventListener('click', scrollToTop);
  btnSaveEnv.addEventListener('click', handleLoadEnv)
  containerCategory.addEventListener('click', handleClickInContainer);


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
          <span class="badge rounded-pill bg-light me-1 mb-2 button-click-category-more user-select-none text-dark">...</span>
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
          <div class="card-title d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 me-2">${item.Note}</h5>
              <button type="button" id="pin-${item.id}" class="btn">
                <img id="pinIcon-${item.id}" src="${item.isPinned ? '/icons/pinned.svg' : '/icons/pin.svg'}" alt="">
              </button>
            </div>
            <div class="btn-group">
              <button type="button" id="edit-${item.id}" class="btn btn-primary btn-edit">
                <img id="editIcon-${item.id}" src="/icons/pencil-square.svg" alt="">
              </button>
              <button type="button" id="delete-${item.id}" class="btn btn-danger btn-delete">
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
      if (listCategories.includes("unknown")) {
        listCategories = ["unknown", ...listCategories.filter(cat => cat !== "unknown")];
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
        // scroll to readMoreButton
        readMoreButton.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function onClickCopy(id){
    const item = listItem.find(item => item.id === id);
    handleAlert(Alert.INFO, "Text copied to clipboard", DurationLength.SHORT);
    navigator.clipboard.writeText(item.otherExample);
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