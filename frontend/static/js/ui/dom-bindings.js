import { init } from './renderer.js';

export function bindDomEvents(state) {
  if (state) {
    init(state);
    return true;
  }
  return false;
}
