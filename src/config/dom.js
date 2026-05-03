export const DOM = {
  alertWarning: null,
  alertInfo: null,
  alertDanger: null,
  alertSuccess: null,
  themeSwitcher: null,
  btnSaveEnv: null,
  btnCloseModalEnv: null,
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
  firebaseConfigWarning: null,
  envFirebaseApikey: null,
  envFirebaseAuthdomain: null,
  envFirebaseProjectid: null,
  envFirebaseStoragebucket: null,
  envFirebaseSenderid: null,
  envFirebaseAppid: null,
  envCloudinaryCloudname: null,
  envCloudinaryUploadpreset: null,
  envCloudinaryApikey: null,
  envCloudinaryApisecret: null,
  btnAuth: null,
  authUserDisplay: null,
  authActionText: null,
  authWarningOverlay: null,
  btnAuthSignInOverlay: null,
};

export function initDOM() {
  DOM.alertWarning = document.querySelector('#alert-warning');
  DOM.alertInfo = document.querySelector('#alert-info');
  DOM.alertDanger = document.querySelector('#alert-danger');
  DOM.alertSuccess = document.querySelector('#alert-success');
  DOM.themeSwitcher = document.getElementById('theme-switcher');
  DOM.btnSaveEnv = document.querySelector('#btn-save-env');
  DOM.btnCloseModalEnv = document.querySelector('#btn-close-modal-setting');
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
  DOM.createOrUpdateNoteForm = document.querySelector('#upsert-Note-form');
  DOM.firebaseConfigWarning = document.getElementById('firebaseConfigWarning');
  DOM.envFirebaseApikey = document.getElementById('env-firebase-apikey');
  DOM.envFirebaseAuthdomain = document.getElementById('env-firebase-authdomain');
  DOM.envFirebaseProjectid = document.getElementById('env-firebase-projectid');
  DOM.envFirebaseStoragebucket = document.getElementById('env-firebase-storagebucket');
  DOM.envFirebaseSenderid = document.getElementById('env-firebase-senderid');
  DOM.envFirebaseAppid = document.getElementById('env-firebase-appid');
  DOM.envCloudinaryCloudname = document.getElementById('env-cloudinary-cloudname');
  DOM.envCloudinaryUploadpreset = document.getElementById('env-cloudinary-uploadpreset');
  DOM.envCloudinaryApikey = document.getElementById('env-cloudinary-apikey');
  DOM.envCloudinaryApisecret = document.getElementById('env-cloudinary-apisecret');
  DOM.btnAuth = document.getElementById('btn-auth');
  DOM.authUserDisplay = document.getElementById('auth-user-display');
  DOM.authActionText = document.getElementById('auth-action-text');
  DOM.authWarningOverlay = document.getElementById('authWarningOverlay');
  DOM.btnAuthSignInOverlay = document.getElementById('btn-auth-sign-in-overlay');
}
