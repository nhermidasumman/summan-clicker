/* ==========================================================================
   Summan Data Clicker - Achievement System
   ========================================================================== */

import * as Lang from './i18n/index.js';

const Achievements = (() => {
    const DEFINITIONS = [
        // === PRODUCTION ACHIEVEMENTS ===
        {
            id: 'prod_1', category: 'production', icon: '📊', threshold: 100,
            nameEs: 'Primer Reporte', nameEn: 'First Report',
            descEs: 'Genera 100 Data Points.', descEn: 'Generate 100 Data Points.', bonus: 0.01
        },
        {
            id: 'prod_2', category: 'production', icon: '📈', threshold: 1000,
            nameEs: 'Data Analyst Jr', nameEn: 'Jr Data Analyst',
            descEs: 'Genera 1,000 Data Points.', descEn: 'Generate 1,000 Data Points.', bonus: 0.01
        },
        {
            id: 'prod_3', category: 'production', icon: '💹', threshold: 10000,
            nameEs: 'Big Data Beginner', nameEn: 'Big Data Beginner',
            descEs: 'Genera 10K Data Points.', descEn: 'Generate 10K Data Points.', bonus: 0.02
        },
        {
            id: 'prod_4', category: 'production', icon: '🏅', threshold: 100000,
            nameEs: 'Data Engineer', nameEn: 'Data Engineer',
            descEs: 'Genera 100K Data Points.', descEn: 'Generate 100K Data Points.', bonus: 0.02
        },
        {
            id: 'prod_5', category: 'production', icon: '🥇', threshold: 1000000,
            nameEs: 'Data Lake', nameEn: 'Data Lake',
            descEs: 'Genera 1M Data Points.', descEn: 'Generate 1M Data Points.', bonus: 0.03
        },
        {
            id: 'prod_6', category: 'production', icon: '🌊', threshold: 10000000,
            nameEs: 'Data Ocean', nameEn: 'Data Ocean',
            descEs: 'Genera 10M Data Points.', descEn: 'Generate 10M Data Points.', bonus: 0.03
        },
        {
            id: 'prod_7', category: 'production', icon: '🌌', threshold: 100000000,
            nameEs: 'Data Universe', nameEn: 'Data Universe',
            descEs: 'Genera 100M Data Points.', descEn: 'Generate 100M Data Points.', bonus: 0.05
        },
        {
            id: 'prod_8', category: 'production', icon: '♾️', threshold: 1000000000,
            nameEs: 'Data Singularity', nameEn: 'Data Singularity',
            descEs: 'Genera 1B Data Points.', descEn: 'Generate 1B Data Points.', bonus: 0.05
        },
        {
            id: 'prod_9', category: 'production', icon: '🔮', threshold: 100000000000,
            nameEs: 'Omnisciencia Digital', nameEn: 'Digital Omniscience',
            descEs: 'Genera 100B Data Points.', descEn: 'Generate 100B Data Points.', bonus: 0.10
        },

        // === CLICK ACHIEVEMENTS ===
        {
            id: 'click_1', category: 'clicks', icon: '👆', threshold: 100,
            nameEs: 'Click Click', nameEn: 'Click Click',
            descEs: 'Haz 100 clicks.', descEn: 'Make 100 clicks.', bonus: 0.01
        },
        {
            id: 'click_2', category: 'clicks', icon: '🖱️', threshold: 1000,
            nameEs: 'Carpal Tunnel Incoming', nameEn: 'Carpal Tunnel Incoming',
            descEs: 'Haz 1,000 clicks.', descEn: 'Make 1,000 clicks.', bonus: 0.01
        },
        {
            id: 'click_3', category: 'clicks', icon: '⚡', threshold: 5000,
            nameEs: 'Velocidad Extrema', nameEn: 'Extreme Speed',
            descEs: 'Haz 5,000 clicks.', descEn: 'Make 5,000 clicks.', bonus: 0.02
        },
        {
            id: 'click_4', category: 'clicks', icon: '🔥', threshold: 10000,
            nameEs: 'El Dedo Infatigable', nameEn: 'The Tireless Finger',
            descEs: 'Haz 10,000 clicks.', descEn: 'Make 10,000 clicks.', bonus: 0.03
        },
        {
            id: 'click_5', category: 'clicks', icon: '💀', threshold: 50000,
            nameEs: 'RIP Mouse', nameEn: 'RIP Mouse',
            descEs: 'Haz 50,000 clicks.', descEn: 'Make 50,000 clicks.', bonus: 0.05
        },

        // === BUILDING ACHIEVEMENTS ===
        {
            id: 'build_1', category: 'buildings', icon: '🏗️', threshold: 1,
            nameEs: 'Primera Contratación', nameEn: 'First Hire',
            descEs: 'Compra tu primer edificio.', descEn: 'Buy your first building.', bonus: 0.01,
            checkType: 'any_building'
        },
        {
            id: 'build_2', category: 'buildings', icon: '🏢', threshold: 10,
            nameEs: 'Startup', nameEn: 'Startup',
            descEs: 'Posee 10 edificios en total.', descEn: 'Own 10 total buildings.', bonus: 0.01,
            checkType: 'total_buildings'
        },
        {
            id: 'build_3', category: 'buildings', icon: '🏙️', threshold: 50,
            nameEs: 'Scale-up', nameEn: 'Scale-up',
            descEs: 'Posee 50 edificios en total.', descEn: 'Own 50 total buildings.', bonus: 0.02,
            checkType: 'total_buildings'
        },
        {
            id: 'build_4', category: 'buildings', icon: '🌆', threshold: 100,
            nameEs: 'Corporación', nameEn: 'Corporation',
            descEs: 'Posee 100 edificios en total.', descEn: 'Own 100 total buildings.', bonus: 0.03,
            checkType: 'total_buildings'
        },
        {
            id: 'build_5', category: 'buildings', icon: '🌍', threshold: 200,
            nameEs: 'Empresa Global', nameEn: 'Global Enterprise',
            descEs: 'Posee 200 edificios en total.', descEn: 'Own 200 total buildings.', bonus: 0.05,
            checkType: 'total_buildings'
        },
        {
            id: 'build_6', category: 'buildings', icon: '👶', threshold: 50,
            nameEs: 'Ejército de Pasantes', nameEn: 'Intern Army',
            descEs: 'Posee 50 pasantes.', descEn: 'Own 50 interns.', bonus: 0.02,
            checkType: 'specific_building', building: 'intern'
        },
        {
            id: 'build_7', category: 'buildings', icon: '⚛️', threshold: 1,
            nameEs: 'El Futuro es Ahora', nameEn: 'The Future is Now',
            descEs: 'Compra tu primer Quantum Computer.', descEn: 'Buy your first Quantum Computer.', bonus: 0.05,
            checkType: 'specific_building', building: 'quantum'
        },

        // === SPEED ACHIEVEMENTS ===
        {
            id: 'speed_1', category: 'special', icon: '⏱️', threshold: 100,
            nameEs: 'Primer Hito', nameEn: 'First Milestone',
            descEs: 'Alcanza 100 DPS.', descEn: 'Reach 100 DPS.', bonus: 0.02,
            checkType: 'dps'
        },
        {
            id: 'speed_2', category: 'special', icon: '🚀', threshold: 10000,
            nameEs: 'Velocidad Warp', nameEn: 'Warp Speed',
            descEs: 'Alcanza 10K DPS.', descEn: 'Reach 10K DPS.', bonus: 0.03,
            checkType: 'dps'
        },
        {
            id: 'speed_3', category: 'special', icon: '💫', threshold: 1000000,
            nameEs: 'Velocidad Luz', nameEn: 'Light Speed',
            descEs: 'Alcanza 1M DPS.', descEn: 'Reach 1M DPS.', bonus: 0.05,
            checkType: 'dps'
        },

        // === SPECIAL / SECRET ACHIEVEMENTS ===
        {
            id: 'special_1', category: 'special', icon: '🎯', threshold: 1,
            nameEs: 'Primera Innovación', nameEn: 'First Innovation',
            descEs: 'Realiza tu primer prestige.', descEn: 'Perform your first prestige.', bonus: 0.05,
            checkType: 'prestige_count'
        },
        {
            id: 'special_2', category: 'special', icon: '☕', threshold: 1,
            nameEs: 'Cafeinado', nameEn: 'Caffeinated',
            descEs: 'Disfruta un Coffee Break.', descEn: 'Enjoy a Coffee Break.', bonus: 0.02,
            checkType: 'event', event: 'coffee_break'
        },
        {
            id: 'special_3', category: 'special', icon: '🐛', threshold: 1,
            nameEs: 'Bug Hunter', nameEn: 'Bug Hunter',
            descEs: 'Arregla tu primer bug.', descEn: 'Fix your first bug.', bonus: 0.02,
            checkType: 'event', event: 'bug_fixed'
        },
        {
            id: 'special_4', category: 'special', icon: '✨', threshold: 5,
            nameEs: 'Buscador de Oro', nameEn: 'Gold Seeker',
            descEs: 'Clickea 5 Data Doradas.', descEn: 'Click 5 Golden Data.', bonus: 0.03,
            checkType: 'event', event: 'golden_clicked'
        },
    ];

    function getAll() {
        return DEFINITIONS;
    }

    function getById(id) {
        return DEFINITIONS.find(a => a.id === id);
    }

    function getName(ach) {
        return Lang.getLanguage() === 'en' ? ach.nameEn : ach.nameEs;
    }

    function getDesc(ach) {
        return Lang.getLanguage() === 'en' ? ach.descEn : ach.descEs;
    }

    /**
     * Check all achievements against current game state.
     * Returns array of newly unlocked achievement ids.
     */
    function checkAll(gameState) {
        const newlyUnlocked = [];

        for (const ach of DEFINITIONS) {
            if (gameState.achievements.includes(ach.id)) continue;

            let unlocked = false;
            const checkType = ach.checkType || 'production';

            switch (checkType) {
                case 'production':
                    unlocked = gameState.stats.totalDataEarned >= ach.threshold;
                    break;
                case 'any_building':
                    unlocked = Object.values(gameState.buildings).some(c => c >= ach.threshold);
                    break;
                case 'total_buildings':
                    const total = Object.values(gameState.buildings).reduce((s, c) => s + c, 0);
                    unlocked = total >= ach.threshold;
                    break;
                case 'specific_building':
                    unlocked = (gameState.buildings[ach.building] || 0) >= ach.threshold;
                    break;
                case 'dps':
                    unlocked = gameState.dps >= ach.threshold;
                    break;
                case 'prestige_count':
                    unlocked = gameState.stats.timesPrestiged >= ach.threshold;
                    break;
                case 'event':
                    unlocked = (gameState.stats.events?.[ach.event] || 0) >= ach.threshold;
                    break;
                default:
                    if (ach.category === 'clicks') {
                        unlocked = gameState.stats.totalClicks >= ach.threshold;
                    }
                    break;
            }

            if (unlocked) {
                newlyUnlocked.push(ach.id);
            }
        }

        return newlyUnlocked;
    }

    /**
     * Calculate total achievement bonus multiplier.
     */
    function getTotalBonus(unlockedIds) {
        let bonus = 0;
        for (const id of unlockedIds) {
            const ach = getById(id);
            if (ach) bonus += ach.bonus;
        }
        return 1 + bonus; // e.g., 1.15 for 15% total bonus
    }

    return { getAll, getById, getName, getDesc, checkAll, getTotalBonus };
})();

window.Achievements = Achievements;

export const getAll = Achievements.getAll;
export const getById = Achievements.getById;
export const getName = Achievements.getName;
export const getDesc = Achievements.getDesc;
export const checkAll = Achievements.checkAll;
export const getTotalBonus = Achievements.getTotalBonus;
export default Achievements;

