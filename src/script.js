import { DOM, initDOM } from './config/dom.js';
import { initTheme, toggleTheme } from './ui/theme.js';
import { initFirebase, resetFirebaseApp, getConfigCloudinary, getConfigEnv } from './managers/firebase.js';
import { renderNotes, handleUpsertNote, deleteNote, handleInputSearch, handleCategoryClick, expandCategoryPageSize, getNoteById, stripHtmlAdvancedToCopy, togglePin, getListItem } from './managers/notes.js';
import { handleCleanImagesCloudinary, handleUploadImageUrl } from './managers/cloudinary.js';
import { handleLoadEnv, handleBackEnv, populateSettings, switchEnvAction, removeEnvAction, handleLoadLogEnvs } from './managers/env.js';
import { handleAlert, Alert, DurationLength } from './ui/alert.js';

initDOM();

let isClickNewButton = true;
let currentNoteId = null;
let currentCategorySelected = null;
let categoryPageSize = 5;
let dataEnv = JSON.parse(localStorage.getItem('envVariables')) || [];
let localVarCloudinaryConfig = JSON.parse(localStorage.getItem('envCloudinary')) || {};

function setDataEnv(newData) { dataEnv = newData; }
function setLocalVarCloudinaryConfig(cfg) {
  localVarCloudinaryConfig = cfg;
  localStorage.setItem('envCloudinary', JSON.stringify(cfg));
}

async function onNotesRendered() {
  await renderNotes(categoryPageSize, currentCategorySelected);
}

initTheme((editor) => {
  setupTinyMCEPasteHandler(editor);
});

await initFirebase(localVarCloudinaryConfig, dataEnv, onNotesRendered);

populateSettings(getConfigEnv(), localVarCloudinaryConfig);

DOM.themeSwitcher.addEventListener('click', () => toggleTheme((editor) => {
  setupTinyMCEPasteHandler(editor);
}));

DOM.btnRefresh.addEventListener("click", async () => {
  await renderNotes(categoryPageSize, currentCategorySelected);
});

DOM.createOrUpdateNoteForm.addEventListener('submit', handleSubmit);
DOM.btnCloseModal.addEventListener('click', handleReset);
DOM.searchInput.addEventListener('input', handleInputSearchWrapper);
DOM.containerWords.addEventListener('click', handleContainerEventClick);
DOM.containerWords.addEventListener('scroll', handleContainerScroll);
DOM.scrollToTopBtn.addEventListener('click', scrollToTop);
DOM.btnSaveEnv.addEventListener('click', handleLoadEnvWrapper);
DOM.containerCategory.addEventListener('click', handleClickInContainer);
DOM.btnCleanImagesCloudinary.addEventListener('click', async () => {
  DOM.btnCleanImagesCloudinary.disabled = true;
  await handleCleanImagesCloudinary(getListItem(), (loading) => {
    DOM.loadingOverlay.style.display = loading ? '' : 'none';
  });
  DOM.btnCleanImagesCloudinary.disabled = false;
});
DOM.btnBackEnv.addEventListener('click', handleBackEnvWrapper);

DOM.createNote.addEventListener('click', (e) => {
  if (e.target !== e.currentTarget) {
    e.stopPropagation();
    return;
  }
  handleReset();
});

function handleReset() {
  isClickNewButton = true;
  currentNoteId = null;
  DOM.createOrUpdateNoteForm.reset();
}

async function handleSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  await handleUpsertNote(e, currentNoteId, isClickNewButton, () => {
    DOM.btnCleanImagesCloudinary.click();
  });
}

async function handleContainerEventClick(e) {
  const id = e.target.id;
  if (id.includes('edit')) {
    const NoteId = id.split('-')[1];
    const note = getNoteById(NoteId);
    document.querySelector('#Note').value = note.Note;
    tinymce.get('editor').setContent(note.example);
    document.querySelector('#category').value = note.category || '';
    isClickNewButton = false;
    currentNoteId = NoteId;
    DOM.btnOpenModal.click();
  }
  else if (id.includes('delete')) {
    currentNoteId = id.split('-')[1];
    isClickNewButton = true;
    DOM.btnModalConfirm.click();
    DOM.btnDelete.addEventListener('click', handleDeleteNote, { once: true });
  }
  else if (id.includes('copy')) {
    const NoteId = id.split('-')[1];
    onClickCopy(NoteId);
  }
  else if (id.includes('pin')) {
    const NoteId = id.split('-')[1];
    await togglePin(NoteId);
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

async function handleDeleteNote() {
  if (currentNoteId) {
    await deleteNote(currentNoteId, DOM.switchCheckChecked);
    currentNoteId = null;
  }
}

function handleClickInContainer(e) {
  const target = e.target;
  if (target.matches('.button-click-category')) {
    const clickedCategory = target.textContent.trim();
    currentCategorySelected = handleCategoryClick(clickedCategory, currentCategorySelected);
  }
  else if (target.matches('.button-click-category-more')) {
    categoryPageSize = expandCategoryPageSize(categoryPageSize);
  }
  else if (target.matches('.btn-move-env') || target.closest('.btn-move-env')) {
    const envKey = target.closest('.card').querySelector('.card-title h5').textContent;
    switchEnvAction(envKey, dataEnv, localVarCloudinaryConfig, () => {
      handleLoadEnvWrapper();
    });
  }
  else if (target.matches('.btn-delete-env') || target.closest('.btn-delete-env')) {
    const envKey = target.closest('.card').querySelector('.card-title h5').textContent;
    DOM.btnDelete.envKeyToDelete = envKey;
    DOM.btnDelete.addEventListener('click', handleDeleteEnvConfirm, { once: true });
  }
}

function handleDeleteEnvConfirm() {
  if (DOM.btnDelete.envKeyToDelete) {
    removeEnvAction(DOM.btnDelete.envKeyToDelete, dataEnv, setDataEnv);
    DOM.btnDelete.envKeyToDelete = null;
  }
}

function handleInputSearchWrapper(e) {
  const value = e.target.value.toLowerCase();
  handleInputSearch(value);
}

function onClickCopy(id) {
  const item = getNoteById(id);
  handleAlert(Alert.INFO, "Text copied to clipboard", DurationLength.SHORT);
  navigator.clipboard.writeText(stripHtmlAdvancedToCopy(item.example));
}

function handleContainerScroll() {
  if (DOM.containerWords.scrollTop > 100) {
    DOM.scrollToTopBtn.style.display = 'block';
  } else {
    DOM.scrollToTopBtn.style.display = 'none';
  }
}

function scrollToTop() {
  DOM.containerWords.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

async function handleLoadEnvWrapper() {
  await handleLoadEnv(dataEnv, setDataEnv, setLocalVarCloudinaryConfig, onNotesRendered);
}

async function handleBackEnvWrapper() {
  await handleBackEnv(localVarCloudinaryConfig, onNotesRendered);
}

function AutoUpdateEditorContent() {
  chrome.storage.local.get(['selectedText', 'addToNote', 'category', 'title'], function(result) {
    if (result.addToNote && result.selectedText) {
      try {
        if (tinymce.get('editor')) {
          tinymce.get('editor').setContent(result.selectedText);
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
    sendResponse({ success: true });
    return true;
  }
});

function setupTinyMCEPasteHandler(editor) {
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
        const progressText = '***Image Uploading....***';
        editor.insertContent(progressText);
        const formData = new FormData();
        formData.append('file', file);
        const configCloudinary = getConfigCloudinary();
        const cloudName = (configCloudinary?.CLOUDINARY_CLOUDNAME || '').trim();
        const uploadPreset = (configCloudinary?.CLOUDINARY_UPLOADPRESET || '').trim();
        const api_key = (configCloudinary?.CLOUDINARY_APIKEY || '').trim();

        if (!cloudName || !uploadPreset || !api_key) {
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
              const widthAttr = data.width ? ` width="${data.width}"` : '';
              const heightAttr = data.height ? ` height="${data.height}"` : '';
              const imgTxt = `<img src="${data.secure_url}" alt="image"${widthAttr}${heightAttr} />`;
              const updatedContent = content.replace(progressText, imgTxt);
              editor.setContent(updatedContent);
              await handleUploadImageUrl({
                url: data.secure_url,
                signature: data.signature
              });
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
