export const GAME_VERSION = "v0.2.1";

export function getVersion() {
    return GAME_VERSION;
}

export function displayVersion() {
    const versionEl = document.createElement('div');
    versionEl.id = 'game-version';
    versionEl.style.position = 'fixed';
    versionEl.style.bottom = '5px';
    versionEl.style.right = '10px';
    versionEl.style.color = '#555';
    versionEl.style.fontFamily = 'monospace';
    versionEl.style.fontSize = '12px';
    versionEl.style.zIndex = '1000';
    versionEl.style.pointerEvents = 'none';
    versionEl.innerText = GAME_VERSION;
    document.body.appendChild(versionEl);
}
