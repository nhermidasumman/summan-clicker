import * as UI from '../ui/renderer.js';

export function triggerRandomEvent() {
  if (UI.showBugReport) {
    UI.showBugReport(() => {});
    return true;
  }
  return false;
}
