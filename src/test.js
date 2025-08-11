import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize aler
const alertWarning = document.querySelector('#alert-warning');
const alertInfo = document.querySelector('#alert-info');
const alertDanger = document.querySelector('#alert-danger');

const Alert = {
  WARNING: "alertWarning",
  INFO: "alertInfo",
  DANGER: "alertDanger"
};

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
initTheme()

// Initialize Cloud Firestore through Firebase
let configEnv = {};

const loadEnv = async () => {
  try {
    const response = await fetch('/env');
    const text = await response.text();
    const env = {};
    text.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          env[key.trim()] = value;
        }
      }
    });
    configEnv = env;
  } catch (error) {
    handleAlert(Alert.DANGER, 'Error loading .env file', DurationLength.LONG);
  }
};

await loadEnv();

// Validate that all required environment variables are loaded
const requiredEnvVars = ['APIKEY', 'AUTHDOMAIN', 'PROJECTID', 'STORAGEBUCKET', 'MESSAGINGSENDERID', 'APPID'];
const missingVars = requiredEnvVars.filter(varName => !configEnv[varName]);

if (missingVars.length > 0) {
  handleAlert(Alert.DANGER, `Missing required environment variables: ${missingVars.join(', ')}`, DurationLength.LONG);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
  apiKey: configEnv.APIKEY,
  authDomain: configEnv.AUTHDOMAIN,
  projectId: configEnv.PROJECTID,
  storageBucket: configEnv.STORAGEBUCKET,
  messagingSenderId: configEnv.MESSAGINGSENDERID,
  appId: configEnv.APPID
};

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  // CRUD
  var listItem = [];
  var listItemTemp = [];
  var isClickNewButton = true;
  let currentNoteId = null;
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

  createOrUpdateNoteForm.addEventListener('submit', handleSubmit);
  btnCloseModal.addEventListener('click', handleReset);
  searchInput.addEventListener('input', handleInputSearch);
  containerWords.addEventListener('click', handleContainerEventClick);
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

  const loadData = async () => {
    containerWords.innerHTML = '';
    listItem.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp - a.timestamp;
    });

    listItem.forEach(item => {
      containerWords.innerHTML += `
     <div class="card">
      <div class="card-body">
        <div class="card-title d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <h5 class="mb-0 me-2">${item.Note}</h5>
            <button type="button" id="pin-${item.id}" class="btn">
              <img id="pinIcon-${item.id}" src="${item.isPinned ? '/icons/pined.svg' : '/icons/pin.svg'}" alt="">
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
          <p class="card-text font-monospace fst-italic small mb-0">
            ${item.timestamp.toDate().toLocaleString()}
          </p>
          <button type="button" id="copy-${item.id}" class="btn btn-copy">
            <img id="copyIcon-${item.id}" src="/icons/copy.svg" alt="">
          </button>
        </div>
        <p class="card-text mt-2">${item.example}</p>
      </div>
    </div>

      `;
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
          otherExample: stripHtmlAdvanced(data.example),
          timestamp: data.timestamp
        });
      });
      loadData();
      listItemTemp = [...listItem];
      backUpdata();
    } catch (e) {
      handleAlert(Alert.DANGER, "Error getting documents", DurationLength.LONG);
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
    loadingOverlay.style.display = '';
    const data = {
      Note: Note,
      example: example,
      timestamp: new Date()
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
      handleAlert(Alert.DANGER, "Error adding document", DurationLength.LONG);
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
  

  async function handleContainerEventClick(e) {
    const id = e.target.id;
    if (id.includes('edit')) {
      const NoteId = id.split('-')[1];
      const Note = listItem.find(item => item.id === NoteId);
      document.querySelector('#Note').value = Note.Note;
      tinymce.get('editor').setContent(Note.example);
      isClickNewButton = false;
      currentNoteId = NoteId;
      btnOpenModal.click();
    }
    if (id.includes('delete')) {
      currentNoteId = id.split('-')[1];
      isClickNewButton = true;
      btnModalConfirm.click();
      btnDelete.addEventListener('click', handleDeleteNote);
    }
    if (id.includes('copy')) {
      const NoteId = id.split('-')[1];
      onClickCopy(NoteId);
    }
    if (id.includes('pin')) {
      const NoteId = id.split('-')[1];
      const Note = listItem.find(item => item.id === NoteId);
      const pinIcon = document.querySelector(`#pinIcon-${NoteId}`);
      const isPinned = pinIcon.src.includes('pin.svg');
      pinIcon.src = isPinned ? '/icons/pined.svg' : '/icons/pin.svg';
      Note.isPinned = isPinned;
      try{
        loadingOverlay.style.display = '';
        await updateDoc(doc(db, `Notes/${NoteId}`), { isPinned: Note.isPinned });
        handleAlert(Alert.INFO, "Note pinned successfully", DurationLength.SHORT);
        loadData();
      }catch(e){
        handleAlert(Alert.DANGER, "Error pinning note", DurationLength.LONG);
      }
      finally {
        backUpdata();
        loadingOverlay.style.display = 'none';
      }
    }
  }

  function onClickCopy(id){
    const item = listItem.find(item => item.id === id);
    handleAlert(Alert.INFO, "Text copied to clipboard", DurationLength.SHORT);
    console.log(item.otherExample);
    console.log(item.example);
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
      loadingOverlay.style.display = '';
      await deleteDoc(doc(db, `Notes/${NoteId}`));
      await renderNotes();
      handleAlert(Alert.WARNING, "Note removed successfully", DurationLength.MEDIUM);
    } catch (e) {
      handleAlert(Alert.DANGER, "Error removing document", DurationLength.LONG);
    } finally {
      loadingOverlay.style.display = 'none';
      btnModalConfirmClose.click();
    }
  };