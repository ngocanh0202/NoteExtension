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
    DOM.alertWarning.classList.remove('in');
    DOM.alertInfo.classList.remove('in');
    DOM.alertDanger.classList.remove('in');
  }

  switch (type) {
    case Alert.WARNING:
      DOM.alertWarning.textContent = message;
      DOM.alertWarning.classList.add('in');
      break;
    case Alert.INFO:
      DOM.alertInfo.textContent = message;
      DOM.alertInfo.classList.add('in');
      break;
    case Alert.DANGER:
      DOM.alertDanger.textContent = message;
      DOM.alertDanger.classList.add('in');
      break;
  }

  currentAlert = setTimeout(() => {
    DOM.alertWarning.classList.remove('in');
    DOM.alertInfo.classList.remove('in');
    DOM.alertDanger.classList.remove('in');
    currentAlert = null;
  }, duration);
}
