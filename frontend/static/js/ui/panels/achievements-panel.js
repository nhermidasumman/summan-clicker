import * as Achievements from '../../content/achievements.js';

export function renderAchievementsPanel(state, elements) {
  if (!elements?.achievementsList) return;

  const all = Achievements.getAll().slice().sort((a, b) => {
    const aUnlocked = state.achievements.includes(a.id);
    const bUnlocked = state.achievements.includes(b.id);

    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.threshold - b.threshold;
  });

  const html = all.map((achievement) => {
    const unlocked = state.achievements.includes(achievement.id);
    const classes = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;

    return `
      <div class="${classes}">
        <div class="ach-icon">${achievement.icon}</div>
        <div class="ach-info">
          <div class="ach-name">${Achievements.getName(achievement)}</div>
          <div class="ach-desc">${Achievements.getDesc(achievement)}</div>
        </div>
        ${unlocked ? '<div class="ach-check">&#x2713;</div>' : ''}
      </div>
    `;
  }).join('');

  elements.achievementsList.innerHTML = html;
}
