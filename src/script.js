import { DOM, initDOM } from './config/dom.js';
import { initTheme, toggleTheme } from './ui/theme.js';
import { initFirebase, resetFirebaseApp, getConfigCloudinary, getConfigEnv, isFirebaseConfigured, isCloudinaryConfigured, signIn, signOutUser, onAuthChange, getCurrentUser } from './managers/firebase.js';
import { renderNotes, handleUpsertNote, deleteNote, handleInputSearch, handleCategoryClick, expandCategoryPageSize, getNoteById, stripHtmlAdvancedToCopy, togglePin, getListItem, filterAndRender } from './managers/notes.js';
import { handleCleanImagesCloudinary, handleUploadImageUrl } from './managers/cloudinary.js';
import { handleLoadEnv, populateSettings, switchEnvAction, removeEnvAction, handleLoadLogEnvs, expandCloudinarySection } from './managers/env.js';
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

await initFirebase(localVarCloudinaryConfig, dataEnv, null);

populateSettings(getConfigEnv(), localVarCloudinaryConfig);

if (!isFirebaseConfigured()) {
  DOM.firebaseConfigWarning.style.display = 'flex';
}

const btnConfigureFirebase = document.getElementById('btn-configure-firebase');
if (btnConfigureFirebase) {
  btnConfigureFirebase.addEventListener('click', () => {
    DOM.firebaseConfigWarning.style.display = 'none';
    const settingsModal = new bootstrap.Modal(document.getElementById('settingEnv'));
    settingsModal.show();
  });
}

function updateAuthUI(user) {
  console.log('Auth state changed:', user ? 'logged in' : 'logged out', user?.email);
  if (user) {
    DOM.authWarningOverlay.style.display = 'none';
    const email = user.email || '';
    const displayName = email.split('@')[0];
    DOM.authUserDisplay.textContent = displayName;
    DOM.authActionText.textContent = 'Logout';
    onNotesRendered().catch(err => console.error('Error loading notes:', err));
  } else {
    DOM.authWarningOverlay.style.display = 'flex';
    DOM.authUserDisplay.textContent = '';
    DOM.authActionText.textContent = 'Login';
    DOM.containerWords.innerHTML = '';
  }
}

onAuthChange(updateAuthUI);

DOM.btnAuth.addEventListener('click', async () => {
  const user = getCurrentUser();
  if (user) {
    try {
      await signOutUser();
    } catch (error) {
      handleAlert(Alert.DANGER, 'Sign out failed: ' + error.message, DurationLength.SHORT);
    }
  } else {
    try {
      await signIn();
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        handleAlert(Alert.INFO, 'Sign in cancelled', DurationLength.SHORT);
      } else if (error.code === 'auth/popup-blocked') {
        handleAlert(Alert.DANGER, 'Popup was blocked. Please allow popups for this extension and try again.', DurationLength.LONG);
      } else {
        handleAlert(Alert.DANGER, 'Sign in failed: ' + error.message, DurationLength.LONG);
      }
    }
  }
});

DOM.btnAuthSignInOverlay.addEventListener('click', async () => {
  try {
    await signIn();
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      handleAlert(Alert.INFO, 'Sign in cancelled', DurationLength.SHORT);
    } else if (error.code === 'auth/popup-blocked') {
      handleAlert(Alert.DANGER, 'Popup was blocked. Please allow popups for this extension and try again.', DurationLength.LONG);
    } else {
      handleAlert(Alert.DANGER, 'Sign in failed: ' + error.message, DurationLength.LONG);
    }
  }
});

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
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  const noteId = actionEl.dataset.id;

  if (action === 'edit') {
    const note = getNoteById(noteId);
    if (!note) return;
    document.querySelector('#Note').value = note.Note;
    tinymce.get('editor').setContent(note.example);
    document.querySelector('#category').value = note.category || '';
    isClickNewButton = false;
    currentNoteId = noteId;
    DOM.btnOpenModal.click();
  }
  else if (action === 'delete') {
    currentNoteId = noteId;
    isClickNewButton = true;
    DOM.btnModalConfirm.click();
    DOM.btnDelete.addEventListener('click', handleDeleteNote, { once: true });
  }
  else if (action === 'copy') {
    onClickCopy(noteId);
  }
  else if (action === 'pin') {
    await togglePin(noteId);
  }
  else if (action === 'readMore') {
    const exampleWrapper = document.querySelector(`#example-${noteId}`);
    const readMoreButton = document.querySelector(`#readMore-${noteId}`);
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
    await deleteNote(currentNoteId);
    currentNoteId = null;
  }
}

function handleClickInContainer(e) {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;

  if (action === 'category') {
    const clickedCategory = actionEl.dataset.category;
    currentCategorySelected = handleCategoryClick(clickedCategory, currentCategorySelected);
  }
  else if (action === 'categoryMore') {
    categoryPageSize = expandCategoryPageSize(categoryPageSize);
  }
  else if (action === 'switchEnv') {
    const envKey = actionEl.dataset.envKey;
    switchEnvAction(envKey, dataEnv, localVarCloudinaryConfig, () => {
      handleLoadEnvWrapper();
    });
  }
  else if (action === 'deleteEnv') {
    const envKey = actionEl.dataset.envKey;
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
    DOM.scrollToTopBtn.classList.add('visible');
  } else {
    DOM.scrollToTopBtn.classList.remove('visible');
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

function AutoUpdateEditorContent() {
  chrome.storage.local.get(['selectedText', 'addToNote', 'category', 'title'], function(result) {
    if (result.addToNote && result.selectedText) {
      const user = getCurrentUser();
      if (!user) {
        handleAlert(Alert.WARNING, 'Please sign in to save notes from context menu', DurationLength.MEDIUM);
        chrome.storage.local.remove(['selectedText', 'addToNote']);
        return;
      }
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

if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'autoUpdateEditor') {
      AutoUpdateEditorContent();
      sendResponse({ success: true });
      return true;
    }
    if (request.action === 'checkAuthStatus') {
      const user = getCurrentUser();
      sendResponse({ authenticated: !!user });
      return true;
    }
  });
}

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
            '***Cloudinary not configured. Please configure in Settings.***'
          );
          editor.setContent(updatedContent);
          handleAlert(Alert.WARNING, 'Cloudinary not configured. Opening settings...', DurationLength.LONG);
          expandCloudinarySection();
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
