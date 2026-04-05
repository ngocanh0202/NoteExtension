import { DOM } from '../config/dom.js';

export const Alert = {
  WARNING: "alertWarning",
  INFO: "alertInfo",
  DANGER: "alertDanger"
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
    if (DOM.alertWarning) DOM.alertWarning.classList.remove('in');
    if (DOM.alertInfo) DOM.alertInfo.classList.remove('in');
    if (DOM.alertDanger) DOM.alertDanger.classList.remove('in');
  }

  switch (type) {
    case Alert.WARNING:
      if (DOM.alertWarning) {
        DOM.alertWarning.textContent = message;
        DOM.alertWarning.classList.add('in');
      }
      break;
    case Alert.INFO:
      if (DOM.alertInfo) {
        DOM.alertInfo.textContent = message;
        DOM.alertInfo.classList.add('in');
      }
      break;
    case Alert.DANGER:
      if (DOM.alertDanger) {
        DOM.alertDanger.textContent = message;
        DOM.alertDanger.classList.add('in');
      }
      break;
  }

  currentAlert = setTimeout(() => {
    if (DOM.alertWarning) DOM.alertWarning.classList.remove('in');
    if (DOM.alertInfo) DOM.alertInfo.classList.remove('in');
    if (DOM.alertDanger) DOM.alertDanger.classList.remove('in');
    currentAlert = null;
  }, duration);
}
