export const DOM = {
  alertWarning: null,
  alertInfo: null,
  alertDanger: null,
  themeSwitcher: null,
  envVariables: null,
  btnSaveEnv: null,
  btnCloseModalEnv: null,
  btnBackEnv: null,
  btnCloseBackModalEnv: null,
  switchCheckChecked: null,
  labelSwitch: null,
  searchInput: null,
  containerWords: null,
  containerCategory: null,
  categoriesList: null,
  loadingOverlay: null,
  createNote: null,
  scrollToTopBtn: null,
  btnRefresh: null,
  btnCleanImagesCloudinary: null,
  btnCloseModal: null,
  btnOpenModal: null,
  btnDelete: null,
  btnModalConfirm: null,
  btnModalConfirmClose: null,
  createOrUpdateNoteForm: null,
};

export function initDOM() {
  DOM.alertWarning = document.querySelector('#alert-warning');
  DOM.alertInfo = document.querySelector('#alert-info');
  DOM.alertDanger = document.querySelector('#alert-danger');
  DOM.themeSwitcher = document.getElementById('theme-switcher');
  DOM.envVariables = document.querySelector('#env-variables');
  DOM.btnSaveEnv = document.querySelector('#btn-save-env');
  DOM.btnCloseModalEnv = document.querySelector('#btn-close-modal-setting');
  DOM.btnBackEnv = document.querySelector('#btn-back-confirm');
  DOM.btnCloseBackModalEnv = document.querySelector('#btn-close-back-modal-confirm');
  DOM.switchCheckChecked = document.getElementById("switchCheckChecked");
  DOM.labelSwitch = document.querySelector("label[for='switchCheckChecked']");
  DOM.searchInput = document.querySelector('#search');
  DOM.containerWords = document.querySelector('.container-word');
  DOM.containerCategory = document.querySelector('.container-category');
  DOM.categoriesList = document.getElementById("categoriesList");
  DOM.loadingOverlay = document.querySelector('#loadingOverlay');
  DOM.createNote = document.querySelector('#createNote');
  DOM.scrollToTopBtn = document.querySelector('#scrollToTopBtn');
  DOM.btnRefresh = document.getElementById("btn-refresh");
  DOM.btnCleanImagesCloudinary = document.getElementById('btn-clean-images');
  DOM.btnCloseModal = document.querySelector('#btn-close-modal');
  DOM.btnOpenModal = document.querySelector('#btn-open-modal');
  DOM.btnDelete = document.querySelector('#btn-delete-confirm');
  DOM.btnModalConfirm = document.querySelector('#btn-open-modal-confirm');
  DOM.btnModalConfirmClose = document.querySelector('#btn-close-modal-confirm');
  DOM.createOrUpdateNoteForm = document.querySelector('#upserd-Note-form');
}
