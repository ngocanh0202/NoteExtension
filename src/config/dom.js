export const DOM = {
  alertWarning: null,
  alertInfo: null,
  alertDanger: null,
  themeSwitcher: null,
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
  // Firebase inputs
  envFirebaseApikey: null,
  envFirebaseAuthdomain: null,
  envFirebaseProjectid: null,
  envFirebaseStoragebucket: null,
  envFirebaseSenderid: null,
  envFirebaseAppid: null,
  // Cloudinary inputs
  envCloudinaryCloudname: null,
  envCloudinaryUploadpreset: null,
  envCloudinaryApikey: null,
  envCloudinaryApisecret: null,
};

export function initDOM() {
  DOM.alertWarning = document.querySelector('#alert-warning');
  DOM.alertInfo = document.querySelector('#alert-info');
  DOM.alertDanger = document.querySelector('#alert-danger');
  DOM.themeSwitcher = document.getElementById('theme-switcher');
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
  // Firebase inputs
  DOM.envFirebaseApikey = document.getElementById('env-firebase-apikey');
  DOM.envFirebaseAuthdomain = document.getElementById('env-firebase-authdomain');
  DOM.envFirebaseProjectid = document.getElementById('env-firebase-projectid');
  DOM.envFirebaseStoragebucket = document.getElementById('env-firebase-storagebucket');
  DOM.envFirebaseSenderid = document.getElementById('env-firebase-senderid');
  DOM.envFirebaseAppid = document.getElementById('env-firebase-appid');
  // Cloudinary inputs
  DOM.envCloudinaryCloudname = document.getElementById('env-cloudinary-cloudname');
  DOM.envCloudinaryUploadpreset = document.getElementById('env-cloudinary-uploadpreset');
  DOM.envCloudinaryApikey = document.getElementById('env-cloudinary-apikey');
  DOM.envCloudinaryApisecret = document.getElementById('env-cloudinary-apisecret');
}
