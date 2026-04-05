import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { getDb, getConfigCloudinary, getCurrentUser } from './firebase.js';
import { handleAlert, Alert, DurationLength } from '../ui/alert.js';
import { changeIconCustomTheme, isDarkTheme } from '../ui/theme.js';
import { DOM } from '../config/dom.js';

function formatTimestamp(ts) {
  if (!ts) return '';
  let date;
  if (typeof ts.toDate === 'function') {
    date = ts.toDate();
  } else if (ts instanceof Date) {
    date = ts;
  } else if (typeof ts === 'string' || typeof ts === 'number') {
    date = new Date(ts);
  } else {
    return '';
  }
  return date.toLocaleString();
}

let listItem = [];
let listCategories = [];

export function getListItem() { return [...listItem]; }
export function getListCategories() { return [...listCategories]; }

export async function renderNotes(categoryPageSize, currentCategorySelected) {
  DOM.containerWords.innerHTML = '';
  listItem = [];

  try {
    DOM.loadingOverlay.style.display = '';
    const db = getDb();
    const user = getCurrentUser();
    let querySnapshot;
    if (user) {
      const q = query(collection(db, "Notes"), where("userId", "==", user.uid));
      querySnapshot = await getDocs(q);
    } else {
      querySnapshot = await getDocs(collection(db, "Notes"));
    }
    querySnapshot.forEach((d) => {
      const data = d.data();
      let timestamp = data.timestamp;
      if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      } else if (timestamp && typeof timestamp === 'string') {
        timestamp = new Date(timestamp);
      }
      listItem.push({
        id: d.id,
        Note: data.Note,
        example: data.example,
        isPinned: data?.isPinned,
        category: data?.category,
        otherExample: stripHtmlAdvanced(data.example),
        timestamp: timestamp
      });
    });

    listCategories = Array.from(new Set(listItem.filter(item => item?.category).map(item => item.category)));
    if (listCategories.includes(currentCategorySelected)) {
      listCategories = [currentCategorySelected, ...listCategories.filter(cat => cat !== currentCategorySelected)];
    }

    loadData(categoryPageSize, currentCategorySelected);
    backupData();
  } catch (e) {
    handleAlert(Alert.DANGER, "Error getting documents: " + e.message, DurationLength.LONG);
    listItem = localStorage.getItem('NotesBackups') ? JSON.parse(localStorage.getItem('NotesBackups')) : [];
  } finally {
    DOM.loadingOverlay.style.display = 'none';
  }
}

function backupData() {
  localStorage.setItem('NotesBackups', JSON.stringify(listItem));
}

function getFilteredItems(searchTerm, category) {
  let items = [...listItem];

  if (category) {
    items = items.filter(item => item.category === category);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    items = items.filter(item =>
      item.Note.toLowerCase().includes(term) ||
      item.otherExample.toLowerCase().includes(term)
    );
  }

  return items;
}

function renderItems(items, categoryPageSize, currentCategorySelected) {
  DOM.containerWords.innerHTML = '';
  loadCategory(categoryPageSize, currentCategorySelected);

  items.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  let html = '';
  items.forEach(item => {
    html += `
    <div class="card mb-2">
      <div class="card-body">
        <div class="card-title d-flex align-items-center justify-content-between sticky-top" style="z-index:1;">
          <div class="d-flex align-items-center">
            <h5 class="mb-0 me-2">${item.Note}</h5>
            <button type="button" data-action="pin" data-id="${item.id}" class="btn">
              <img id="pinIcon-${item.id}" src="${item.isPinned ? '/icons/pinned.svg' : '/icons/pin.svg'}" alt="">
            </button>
          </div>
          <div class="btn-group">
            <button type="button" data-action="edit" data-id="${item.id}" class="btn btn-edit">
              <img id="editIcon-${item.id}" src="/icons/pencil-square.svg" alt="">
            </button>
            <button type="button" data-action="delete" data-id="${item.id}" class="btn btn-delete">
              <img id="deleteIcon-${item.id}" src="/icons/trash.svg" alt="">
            </button>
          </div>
        </div>

        <div class="d-flex align-items-center justify-content-between mt-2">
          <div class="d-flex gap-2">
            <p class="card-text font-monospace fst-italic small mb-0">
              ${formatTimestamp(item.timestamp)}
            </p>
            ${item.category ? `<span class="badge rounded-pill bg-light font-monospace fst-italic small mb-0 text-dark border border-secondary">${item.category}</span>` : ''}
          </div>
          <button type="button" data-action="copy" data-id="${item.id}" class="btn btn-copy">
            <img id="copyIcon-${item.id}" src="" alt="">
          </button>
        </div>
      <div class="example-wrapper" id="example-${item.id}">
        ${item.example}
      </div>
      <button type="button" data-action="readMore" data-id="${item.id}" class="btn btn-link fw-bold btn-sm" style="display: none;">
        more...
      </button>
      </div>
    </div>
    `;
  });
  DOM.containerWords.innerHTML = html;

  changeIconCustomTheme(isDarkTheme());

  let exampleWrappers = document.querySelectorAll('.example-wrapper');
  exampleWrappers.forEach(exampleDiv => {
    let readMoreBtn = exampleDiv.nextElementSibling;
    if (exampleDiv.scrollHeight > 350) {
      readMoreBtn.style.display = "inline-block";
    }
  });
}

function loadData(categoryPageSize, currentCategorySelected, searchTerm) {
  const items = getFilteredItems(searchTerm, currentCategorySelected);
  renderItems(items, categoryPageSize, currentCategorySelected);
}

function loadCategory(categoryPageSize, currentCategorySelected) {
  DOM.categoriesList.innerHTML = '';
  DOM.containerCategory.innerHTML = '';
  const COLOR = ['primary', 'secondary', 'success', 'danger', 'dark'];

  if (listCategories.length > 0) {
    let sortedCategories = [...listCategories];
    if (currentCategorySelected && sortedCategories.includes(currentCategorySelected)) {
      sortedCategories = [currentCategorySelected, ...sortedCategories.filter(c => c !== currentCategorySelected)];
    }
    
    let badges = '';
    for (let i = 0; i < categoryPageSize && i < sortedCategories.length; i++) {
      const category = sortedCategories[i];
      DOM.categoriesList.innerHTML += `<option value="${category}">${category}</option>`;
      const colorClass = COLOR[i % COLOR.length];
      const isSelected = currentCategorySelected === category ? 'selected' : '';
      badges += `
        <span class="badge rounded-pill bg-${colorClass} me-1 mb-2 button-click-category user-select-none ${isSelected}" data-action="category" data-category="${category}" tabindex="0">${category}</span>
      `;
    }
    if (categoryPageSize < listCategories.length) {
      badges += `
        <span class="badge rounded-pill bg-light me-1 mb-2 button-click-category-more user-select-none text-dark" data-action="categoryMore" tabindex="0">...+${Math.min(listCategories.length - categoryPageSize, 5)}</span>
      `;
    }
    DOM.containerCategory.innerHTML = badges;
  }
}

export function filterAndRender(searchTerm, category, categoryPageSize) {
  loadData(categoryPageSize || 5, category, searchTerm);
}

export async function handleUpsertNote(e, idNote, isClickNewButton, onCleanImages) {
  const user = getCurrentUser();
  if (!user) {
    handleAlert(Alert.WARNING, "Please sign in to save notes", DurationLength.MEDIUM);
    return;
  }

  const id = idNote;
  const Note = e.target.Note.value;
  const example = tinymce.get('editor').getContent();
  const category = e.target.category.value.trim();

  DOM.loadingOverlay.style.display = '';
  const data = {
    Note: Note,
    example: example,
    timestamp: new Date(),
    category: category,
    userId: user.uid
  };

  try {
    const db = getDb();
    if ((id == '' || id == null || id == undefined) && isClickNewButton) {
      await addDoc(collection(db, "Notes"), data);
    } else {
      await updateDoc(doc(db, `Notes/${id}`), data);
    }
    await renderNotes(5, category);
    handleAlert(Alert.INFO, "Note added successfully", DurationLength.MEDIUM);
    if (onCleanImages) onCleanImages();
  } catch (e) {
    handleAlert(Alert.DANGER, "Error adding document: " + e.message, DurationLength.LONG);
    const backup = JSON.parse(localStorage.getItem('NotesBackups') || '[]');
    backup.push({
      id: 'local-' + Date.now(),
      Note: Note,
      example: example,
      timestamp: new Date(),
      category: category,
      isPinned: false
    });
    localStorage.setItem('NotesBackups', JSON.stringify(backup));
  } finally {
    DOM.loadingOverlay.style.display = 'none';
    DOM.btnCloseModal.click();
  }
}

export async function deleteNote(NoteId) {
  const user = getCurrentUser();
  if (!user) {
    handleAlert(Alert.WARNING, "Please sign in to delete notes", DurationLength.MEDIUM);
    return;
  }
  try {
    DOM.loadingOverlay.style.display = '';
    const db = getDb();
    await deleteDoc(doc(db, `Notes/${NoteId}`));
    await renderNotes(5, null);
    handleAlert(Alert.WARNING, "Note removed successfully", DurationLength.MEDIUM);
  } catch (e) {
    handleAlert(Alert.DANGER, "Error removing document: " + e.message, DurationLength.LONG);
  } finally {
    DOM.loadingOverlay.style.display = 'none';
    DOM.btnModalConfirmClose.click();
  }
}

export async function togglePin(NoteId) {
  const user = getCurrentUser();
  if (!user) {
    handleAlert(Alert.WARNING, "Please sign in to pin notes", DurationLength.MEDIUM);
    return;
  }
  const note = listItem.find(item => item.id === NoteId);
  if (!note) return;

  const previousState = note.isPinned;
  note.isPinned = !note.isPinned;
  const isPinned = note.isPinned;

  try {
    DOM.loadingOverlay.style.display = '';
    const db = getDb();
    await updateDoc(doc(db, `Notes/${NoteId}`), { isPinned: note.isPinned });
    handleAlert(Alert.INFO, `Note ${isPinned ? 'pinned' : 'unpinned'} successfully`, DurationLength.SHORT);
    filterAndRender(null, null, 5);
    backupData();
  } catch (e) {
    note.isPinned = previousState;
    handleAlert(Alert.DANGER, "Error pinning note: " + e.message, DurationLength.LONG);
  } finally {
    DOM.loadingOverlay.style.display = 'none';
  }
}

export function handleInputSearch(value) {
  filterAndRender(value, null, 5);
}

export function handleCategoryClick(clickedCategory, currentCategorySelected) {
  let newCategory = currentCategorySelected;
  
  document.querySelectorAll('.button-click-category').forEach(el => {
    el.classList.remove('selected');
  });
  
  if (newCategory === clickedCategory) {
    newCategory = null;
  } else {
    newCategory = clickedCategory;
    const selectedEl = document.querySelector(`.button-click-category[data-category="${clickedCategory}"]`);
    if (selectedEl) {
      selectedEl.classList.add('selected');
    }
  }
  filterAndRender(null, newCategory, 5);
  DOM.scrollToTopBtn.click();
  return newCategory;
}

export function expandCategoryPageSize(categoryPageSize) {
  categoryPageSize += 5;
  loadCategory(categoryPageSize, null);
  DOM.containerCategory.scrollTo({
    top: DOM.containerCategory.scrollHeight,
    behavior: 'smooth'
  });
  return categoryPageSize;
}

export function getNoteById(id) {
  return listItem.find(item => item.id === id);
}

export function stripHtmlAdvanced(html) {
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

export function stripHtmlAdvancedToCopy(html) {
  html = html.replace(/<\s*br\s*\/?>/gi, '\n')
             .replace(/<\/p\s*>/gi, '\n');

  const temp = document.createElement("div");
  temp.innerHTML = html;

  function processNode(node) {
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
    return '';
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
