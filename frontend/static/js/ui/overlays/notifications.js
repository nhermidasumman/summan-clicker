import { showToast } from '../../infra/number-formatters.js';

export function notify(message, type = 'info', duration = 3000) {
  showToast(message, type, duration);
}
