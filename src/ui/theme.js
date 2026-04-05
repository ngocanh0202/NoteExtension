import { DOM } from '../config/dom.js';

let darkTheme = localStorage.getItem('dark-theme') === 'true';

export function isDarkTheme() {
  return darkTheme;
}

export function applyTinyMCETheme(isDark, onEditorInit) {
  tinymce.init({
    selector: '#editor',
    menubar: false,
    plugins: ['lists', 'table', 'fullscreen'],
    toolbar: 'bold italic underline | forecolor backcolor | fullscreen | align lineheight | checklist numlist bullist | table',
    skin: isDark ? 'oxide-dark' : 'oxide',
    setup: (editor) => {
      editor.on('init', () => {
        editor.getBody().style.backgroundColor = isDark ? '#343a40' : '#ffffff';
        editor.getBody().style.color = isDark ? '#ffffff' : '#000000';
        editor.getBody().style.fontSize = '18px';
        if (onEditorInit) onEditorInit(editor);
      });
    }
  });
}

export function changeIconCustomTheme(isDark) {
  if (isDark) {
    document.querySelectorAll('[id^="copyIcon-"]').forEach(el => {
      el.src = '/icons/copy-icon-light.svg';
    });
    document.querySelectorAll('[id^="pinIcon-"]').forEach(el => {
      const isPinned = el.src.includes('pinned');
      el.src = isPinned ? '/icons/pinned-icon-yellow.svg' : '/icons/pin-white.svg';
    });
    document.querySelectorAll('[id^="deleteIcon-"]').forEach(el => {
      el.src = '/icons/trash.svg';
    });
    document.querySelectorAll('[id^="editIcon-"]').forEach(el => {
      el.src = '/icons/pencil-square.svg';
    });
  } else {
    document.querySelectorAll('[id^="copyIcon-"]').forEach(el => {
      el.src = '/icons/copy.svg';
    });
    document.querySelectorAll('[id^="pinIcon-"]').forEach(el => {
      const isPinned = el.src.includes('pinned');
      el.src = isPinned ? '/icons/pinned.svg' : '/icons/pin.svg';
    });
    document.querySelectorAll('[id^="deleteIcon-"]').forEach(el => {
      el.src = '/icons/trash-black.svg';
    });
    document.querySelectorAll('[id^="editIcon-"]').forEach(el => {
      el.src = '/icons/pencil-square-black.svg';
    });
  }
}

export function toggleTheme(onEditorReady) {
  const img = DOM.themeSwitcher.querySelector('img');
  darkTheme = !darkTheme;

  if (!darkTheme) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    document.querySelectorAll('.card-title').forEach(el => {
      el.classList.remove('dark-theme');
      el.classList.add('light-theme');
    });
    img.src = '/icons/brightness-high-fill.svg';
    DOM.themeSwitcher.classList.add('border-dark', 'btn-light');
    DOM.themeSwitcher.classList.remove('border-light', 'btn-dark');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    document.querySelectorAll('.card-title').forEach(el => {
      el.classList.remove('light-theme');
      el.classList.add('dark-theme');
    });
    img.src = '/icons/moon-fill.svg';
    DOM.themeSwitcher.classList.add('border-light', 'btn-dark');
    DOM.themeSwitcher.classList.remove('border-dark', 'btn-light');
  }

  changeIconCustomTheme(darkTheme);
  tinymce.remove();
  localStorage.setItem('dark-theme', darkTheme);
  applyTinyMCETheme(darkTheme, onEditorReady);
}

export function initTheme(onEditorReady) {
  const img = DOM.themeSwitcher.querySelector('img');
  if (darkTheme) {
    document.body.classList.add('dark-theme');
    img.src = '/icons/moon-fill.svg';
    DOM.themeSwitcher.classList.add('border-light', 'btn-dark');
    DOM.themeSwitcher.classList.remove('border-dark', 'btn-light');
  } else {
    document.body.classList.add('light-theme');
    img.src = '/icons/brightness-high-fill.svg';
    DOM.themeSwitcher.classList.add('border-dark', 'btn-light');
    DOM.themeSwitcher.classList.remove('border-light', 'btn-dark');
  }
  applyTinyMCETheme(darkTheme, onEditorReady);
}
