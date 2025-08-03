import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";


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
    console.log("Environment loaded:", env);
  } catch (error) {
    console.error('Error loading .env file:', error);
  }
};

await loadEnv();

// Validate that all required environment variables are loaded
const requiredEnvVars = ['APIKEY', 'AUTHDOMAIN', 'PROJECTID', 'STORAGEBUCKET', 'MESSAGINGSENDERID', 'APPID'];
const missingVars = requiredEnvVars.filter(varName => !configEnv[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
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
  const btnCloseModal = document.querySelector('#btn-close-modal');
  const btnOpenModal = document.querySelector('#btn-open-modal');
  const loadingOverlay = document.querySelector('#loadingOverlay');
  const btnDelete = document.querySelector('#btn-delete-confirm');
  const btnModalConfirm = document.querySelector('#btn-open-modal-confirm');
  const btnModalConfirmClose = document.querySelector('#btn-close-modal-confirm');
  const createNote = document.querySelector('#createNote');

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
    listItem.sort((a, b) => b.timestamp - a.timestamp);
    listItem.forEach(item => {
      containerWords.innerHTML += `
        <div class="card">
          <div class="card-body">
            <div class="card-title d-flex align-items-center justify-content-between">
              <h5 >${item.Note}</h5>
              <div class="btn-group">
                  <button type="button" id="edit-${item.id}" class="btn btn-primary btn-edit">
                    <img id="editIcon-${item.id}" src="/icons/pencil-square.svg" alt="">
                  </button>
                  <button type="button" id="delete-${item.id}" class="btn btn-danger btn-delete">
                      <img id="deleteIcon-${item.id}" src="/icons/trash.svg" alt="">
                  </button>
                </div>
            </div>
            <p class="card-text">${item.example}</p>
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
          timestamp: data.timestamp
        });
      });
      loadData();
      listItemTemp = [...listItem];
      backUpdata();
    } catch (e) {
      console.error("Error getting documents", e);
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
    } catch (e) {
      console.error("Error adding document: ", e);
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
    listItem = listItemTemp.filter(item => item.Note.toLowerCase().includes(value));
    loadData();
  };

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
    } catch (e) {
      console.error("Error removing document: ", e);
    } finally {
      loadingOverlay.style.display = 'none';
      btnModalConfirmClose.click();
    }
  };
