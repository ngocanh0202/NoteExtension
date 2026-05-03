import { DOM } from '../config/dom.js';

export const Alert = {
  WARNING: "alertWarning",
  INFO: "alertInfo",
  DANGER: "alertDanger",
  SUCCESS: "alertSuccess"
};

export const DurationLength = {
  SHORT: 1000,
  MEDIUM: 2000,
  LONG: 3000
};

let currentAlert = null;

export function handleAlert(type, message, duration) {
  if (currentAlert) {
    clearTimeout(currentAlert);
    if (DOM.alertWarning) {
      DOM.alertWarning.classList.remove('in');
      DOM.alertWarning.classList.add('out');
    }
    if (DOM.alertInfo) {
      DOM.alertInfo.classList.remove('in');
      DOM.alertInfo.classList.add('out');
    }
    if (DOM.alertDanger) {
      DOM.alertDanger.classList.remove('in');
      DOM.alertDanger.classList.add('out');
    }
    if (DOM.alertSuccess) {
      DOM.alertSuccess.classList.remove('in');
      DOM.alertSuccess.classList.add('out');
    }
    setTimeout(() => {
      if (DOM.alertWarning) DOM.alertWarning.classList.remove('out');
      if (DOM.alertInfo) DOM.alertInfo.classList.remove('out');
      if (DOM.alertDanger) DOM.alertDanger.classList.remove('out');
      if (DOM.alertSuccess) DOM.alertSuccess.classList.remove('out');
    }, 300);
  }

  setTimeout(() => {
    switch (type) {
      case Alert.WARNING:
        if (DOM.alertWarning) {
          DOM.alertWarning.innerHTML = `<strong>Warning!</strong> ${message}`;
          DOM.alertWarning.classList.remove('out');
          DOM.alertWarning.classList.add('in');
        }
        break;
      case Alert.INFO:
        if (DOM.alertInfo) {
          DOM.alertInfo.innerHTML = `<strong>Info!</strong> ${message}`;
          DOM.alertInfo.classList.remove('out');
          DOM.alertInfo.classList.add('in');
        }
        break;
      case Alert.DANGER:
        if (DOM.alertDanger) {
          DOM.alertDanger.innerHTML = `<strong>Error!</strong> ${message}`;
          DOM.alertDanger.classList.remove('out');
          DOM.alertDanger.classList.add('in');
        }
        break;
      case Alert.SUCCESS:
        if (DOM.alertSuccess) {
          DOM.alertSuccess.innerHTML = `<strong>Success!</strong> ${message}`;
          DOM.alertSuccess.classList.remove('out');
          DOM.alertSuccess.classList.add('in');
        }
        break;
    }
  }, currentAlert ? 300 : 0);

  currentAlert = setTimeout(() => {
    if (DOM.alertWarning) {
      DOM.alertWarning.classList.remove('in');
      DOM.alertWarning.classList.add('out');
    }
    if (DOM.alertInfo) {
      DOM.alertInfo.classList.remove('in');
      DOM.alertInfo.classList.add('out');
    }
    if (DOM.alertDanger) {
      DOM.alertDanger.classList.remove('in');
      DOM.alertDanger.classList.add('out');
    }
    if (DOM.alertSuccess) {
      DOM.alertSuccess.classList.remove('in');
      DOM.alertSuccess.classList.add('out');
    }
    setTimeout(() => {
      if (DOM.alertWarning) DOM.alertWarning.classList.remove('out');
      if (DOM.alertInfo) DOM.alertInfo.classList.remove('out');
      if (DOM.alertDanger) DOM.alertDanger.classList.remove('out');
      if (DOM.alertSuccess) DOM.alertSuccess.classList.remove('out');
    }, 300);
    currentAlert = null;
  }, duration);
}
