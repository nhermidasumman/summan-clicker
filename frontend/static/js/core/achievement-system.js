import * as Achievements from '../content/achievements.js';

export function unlockNewAchievements(state, onUnlocked = () => {}) {
  if (!state) return [];

  const newlyUnlockedIds = Achievements.checkAll(state);
  for (const id of newlyUnlockedIds) {
    state.achievements.push(id);
    const achievement = Achievements.getById(id);
    onUnlocked(achievement, id);
  }

  return newlyUnlockedIds;
}
