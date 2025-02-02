import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";

// Initialize Cloud Firestore through Firebase
let configEnv = {};

const loadEnv = async () => {
  try {
    const response = await fetch('../env');
    const text = await response.text();
    const env = {};
    text.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, '');
      }
    });
    configEnv = env;
  } catch (error) {
    console.error('Error loading .env file:', error);
  }
};

await loadEnv();
console.log(configEnv.APIKEY);
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

// Initialize TinyMCE
tinymce.init({
  selector: '#editor',
  plugins: [
      'codesample', 'emoticons', 'link', 'lists', 'searchreplace', 'table'
  ],
  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
  tinycomments_mode: 'embedded',
  ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
});

// CRUD
var listItem = [];
var listItemTemp = [];
var isClickNewButton = true ;
const createOrUpdateNoteForm = document.querySelector('#upserd-Note-form');
const searchInput = document.querySelector('#search');
const containerWords = document.querySelector('.container-word');
const btnCloseModal = document.querySelector('#btn-close-modal');
const btnOpenModal = document.querySelector('#btn-open-modal');
const loadingOverlay = document.querySelector('#loadingOverlay');

const backUpdata = () => {
    localStorage.setItem('NotesBackups', JSON.stringify(listItem));
}

createOrUpdateNoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = isClickNewButton ? '' : e.target.id.value;
    const Note = e.target.Note.value;
    const example = tinymce.get('editor').getContent();
    loadingOverlay.style.display = '';
    try {
    if(id == '' || id == null || id == undefined) {
        console.log("Create");
        const docRef = await addDoc(collection(db, "Notes"), {
        Note: Note,
        example: example,
        timestamp: new Date()
        });
        renderNotes();
        createOrUpdateNoteForm.reset();
        console.log("Document written with ID: ", docRef.id);
    }
    else {
        console.log("update");
        await updateDoc(doc(db, `Notes/${id}`), {
        Note: Note,
        example: example,
        timestamp: new Date()
        });
        renderNotes();
        createOrUpdateNoteForm.reset();
    }
    btnCloseModal.click();
    isClickNewButton = true;
    } catch (e) {
    console.error("Error adding document: ", e);
    listItemTemp = listItemTemp.push({
        Note: Note,
        example: example,
        timestamp: new Date()
    });
    listItem = [...listItemTemp];
    backUpdata();
    }
    finally {
        loadingOverlay.style.display = 'none';
    }
});

btnCloseModal.addEventListener('click', () => {
  createOrUpdateNoteForm.reset();
});

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
          }
      );
      loadData();
      listItemTemp = [...listItem];
      backUpdata();
    } catch (e) {
      console.error("Error getting documents", e);
      listItemTemp = localStorage.getItem('NotesBackups') ? JSON.parse(localStorage.getItem('NotesBackups')) : [];
      listItem = [...listItemTemp];
    }
    finally {
        loadingOverlay.style.display = 'none';
    }

}
renderNotes();

const loadData = () => {
  containerWords.innerHTML = '';
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
}

searchInput.addEventListener('input', (e) => {
  const value = e.target.value.toLowerCase();
  listItem = listItemTemp.filter(item => item.Note.toLowerCase().includes(value));
  loadData();
});

containerWords.addEventListener('click', async (e) => {
  const id = e.target.id;
  if (id.includes('edit')) {
    const NoteId = id.split('-')[1];
    const Note = listItem.find(item => item.id === NoteId);
    document.querySelector('#doc-id').value = NoteId;
    document.querySelector('#Note').value = Note.Note;
    tinymce.get('editor').setContent(Note.example);
    isClickNewButton = false;
    btnOpenModal.click();
  }
  if (id.includes('delete')) {
    const NoteId = id.split('-')[1];
    console.log(NoteId);
    await deleteNote(NoteId);
  }
});

const deleteNote = async (NoteId) => {
    try {
        loadingOverlay.style.display = '';
        await deleteDoc(doc(db, `Notes/${NoteId}`));
        document.querySelector('#doc-id').value = "";
        renderNotes();
    } catch (e) {
        console.error("Error removing document: ", e);
    }
    finally {
        loadingOverlay.style.display = 'none';
    }
}