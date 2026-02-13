/* ==========================================================================
   Summan Data Clicker - Upgrade Definitions
   ========================================================================== */

import * as Lang from './i18n/index.js';

const Upgrades = (() => {
    /**
     * Upgrade definitions.
     * - id: unique identifier
     * - nameKey / descKey: i18n keys
     * - cost: data points to purchase
     * - category: 'click' | 'building' | 'synergy' | 'global'
     * - effect: { type, target, value }
     *   - type: 'click_mult', 'click_add', 'building_mult', 'global_mult', 'synergy'
     *   - target: building id or null for global
     *   - value: multiplier or flat amount
     * - requirement: { type, target, value } — condition to unlock
     *   - type: 'building_count', 'total_data', 'upgrade', 'click_count'
     * - icon: emoji
     */
    const DEFINITIONS = [
        // === CLICK UPGRADES ===
        {
            id: 'click_1', category: 'click', cost: 250, icon: '👆',
            nameKey: 'Puntero Reforzado', nameKeyEn: 'Reinforced Pointer',
            descKey: 'Los clicks generan el doble de datos.', descKeyEn: 'Clicks generate double data.',
            effect: { type: 'click_mult', value: 2 },
            requirement: { type: 'click_count', value: 100 },
        },
        {
            id: 'click_2', category: 'click', cost: 1000, icon: '🖱️',
            nameKey: 'Mouse Gamer', nameKeyEn: 'Gaming Mouse',
            descKey: 'Los clicks generan x2 datos.', descKeyEn: 'Clicks generate x2 data.',
            effect: { type: 'click_mult', value: 2 },
            requirement: { type: 'click_count', value: 500 },
        },
        {
            id: 'click_3', category: 'click', cost: 5000, icon: '⌨️',
            nameKey: 'Teclado Mecánico', nameKeyEn: 'Mechanical Keyboard',
            descKey: '+5 data por click.', descKeyEn: '+5 data per click.',
            effect: { type: 'click_add', value: 5 },
            requirement: { type: 'total_data', value: 3000 },
        },
        {
            id: 'click_4', category: 'click', cost: 50000, icon: '🎯',
            nameKey: 'Precisión de Datos', nameKeyEn: 'Data Precision',
            descKey: 'Los clicks generan x3 datos.', descKeyEn: 'Clicks generate x3 data.',
            effect: { type: 'click_mult', value: 3 },
            requirement: { type: 'total_data', value: 25000 },
        },
        {
            id: 'click_5', category: 'click', cost: 500000, icon: '💎',
            nameKey: 'Click Cuántico', nameKeyEn: 'Quantum Click',
            descKey: 'Cada click genera +1% de tu DPS.', descKeyEn: 'Each click generates +1% of your DPS.',
            effect: { type: 'click_dps_percent', value: 0.01 },
            requirement: { type: 'total_data', value: 250000 },
        },
        {
            id: 'click_6', category: 'click', cost: 5000000, icon: '🌟',
            nameKey: 'Super Click', nameKeyEn: 'Super Click',
            descKey: 'Cada click genera +5% de tu DPS.', descKeyEn: 'Each click generates +5% of your DPS.',
            effect: { type: 'click_dps_percent', value: 0.05 },
            requirement: { type: 'total_data', value: 2500000 },
        },

        // === BUILDING UPGRADES - INTERN ===
        {
            id: 'intern_1', category: 'building', cost: 250, icon: '📋',
            nameKey: 'Manual de Onboarding', nameKeyEn: 'Onboarding Manual',
            descKey: 'Pasantes producen x2.', descKeyEn: 'Interns produce x2.',
            effect: { type: 'building_mult', target: 'intern', value: 2 },
            requirement: { type: 'building_count', target: 'intern', value: 1 },
        },
        {
            id: 'intern_2', category: 'building', cost: 2500, icon: '🎓',
            nameKey: 'Curso de Excel', nameKeyEn: 'Excel Course',
            descKey: 'Pasantes producen x2.', descKeyEn: 'Interns produce x2.',
            effect: { type: 'building_mult', target: 'intern', value: 2 },
            requirement: { type: 'building_count', target: 'intern', value: 10 },
        },
        {
            id: 'intern_3', category: 'building', cost: 50000, icon: '🏆',
            nameKey: 'Programa de Mentoring', nameKeyEn: 'Mentoring Program',
            descKey: 'Pasantes producen x3.', descKeyEn: 'Interns produce x3.',
            effect: { type: 'building_mult', target: 'intern', value: 3 },
            requirement: { type: 'building_count', target: 'intern', value: 25 },
        },

        // === BUILDING UPGRADES - LAPTOP ===
        {
            id: 'laptop_1', category: 'building', cost: 2500, icon: '🔋',
            nameKey: 'Batería Extendida', nameKeyEn: 'Extended Battery',
            descKey: 'Laptops producen x2.', descKeyEn: 'Laptops produce x2.',
            effect: { type: 'building_mult', target: 'laptop', value: 2 },
            requirement: { type: 'building_count', target: 'laptop', value: 1 },
        },
        {
            id: 'laptop_2', category: 'building', cost: 25000, icon: '💾',
            nameKey: 'SSD Upgrade', nameKeyEn: 'SSD Upgrade',
            descKey: 'Laptops producen x2.', descKeyEn: 'Laptops produce x2.',
            effect: { type: 'building_mult', target: 'laptop', value: 2 },
            requirement: { type: 'building_count', target: 'laptop', value: 10 },
        },
        {
            id: 'laptop_3', category: 'building', cost: 500000, icon: '🖥️',
            nameKey: 'Monitor Ultra-Wide', nameKeyEn: 'Ultra-Wide Monitor',
            descKey: 'Laptops producen x3.', descKeyEn: 'Laptops produce x3.',
            effect: { type: 'building_mult', target: 'laptop', value: 3 },
            requirement: { type: 'building_count', target: 'laptop', value: 25 },
        },

        // === BUILDING UPGRADES - JUNIOR ===
        {
            id: 'junior_1', category: 'building', cost: 11000, icon: '📚',
            nameKey: 'Stack Overflow Premium', nameKeyEn: 'Stack Overflow Premium',
            descKey: 'Junior Devs producen x2.', descKeyEn: 'Junior Devs produce x2.',
            effect: { type: 'building_mult', target: 'junior', value: 2 },
            requirement: { type: 'building_count', target: 'junior', value: 1 },
        },
        {
            id: 'junior_2', category: 'building', cost: 110000, icon: '🎮',
            nameKey: 'Hackathon Mensual', nameKeyEn: 'Monthly Hackathon',
            descKey: 'Junior Devs producen x2.', descKeyEn: 'Junior Devs produce x2.',
            effect: { type: 'building_mult', target: 'junior', value: 2 },
            requirement: { type: 'building_count', target: 'junior', value: 10 },
        },
        {
            id: 'junior_3', category: 'building', cost: 5500000, icon: '🧠',
            nameKey: 'Bootcamp Intensivo', nameKeyEn: 'Intensive Bootcamp',
            descKey: 'Junior Devs producen x3.', descKeyEn: 'Junior Devs produce x3.',
            effect: { type: 'building_mult', target: 'junior', value: 3 },
            requirement: { type: 'building_count', target: 'junior', value: 25 },
        },

        // === BUILDING UPGRADES - SENIOR ===
        {
            id: 'senior_1', category: 'building', cost: 120000, icon: '☕',
            nameKey: 'Café Ilimitado', nameKeyEn: 'Unlimited Coffee',
            descKey: 'Senior Devs producen x2.', descKeyEn: 'Senior Devs produce x2.',
            effect: { type: 'building_mult', target: 'senior', value: 2 },
            requirement: { type: 'building_count', target: 'senior', value: 1 },
        },
        {
            id: 'senior_2', category: 'building', cost: 1200000, icon: '🏠',
            nameKey: 'Trabajo Remoto', nameKeyEn: 'Remote Work',
            descKey: 'Senior Devs producen x2.', descKeyEn: 'Senior Devs produce x2.',
            effect: { type: 'building_mult', target: 'senior', value: 2 },
            requirement: { type: 'building_count', target: 'senior', value: 10 },
        },
        {
            id: 'senior_3', category: 'building', cost: 60000000, icon: '🎤',
            nameKey: 'Tech Talks Semanales', nameKeyEn: 'Weekly Tech Talks',
            descKey: 'Senior Devs producen x3.', descKeyEn: 'Senior Devs produce x3.',
            effect: { type: 'building_mult', target: 'senior', value: 3 },
            requirement: { type: 'building_count', target: 'senior', value: 25 },
        },

        // === BUILDING UPGRADES - SERVER ===
        {
            id: 'server_1', category: 'building', cost: 1300000, icon: '🌡️',
            nameKey: 'Refrigeración Líquida', nameKeyEn: 'Liquid Cooling',
            descKey: 'Servidores producen x2.', descKeyEn: 'Servers produce x2.',
            effect: { type: 'building_mult', target: 'server', value: 2 },
            requirement: { type: 'building_count', target: 'server', value: 1 },
        },
        {
            id: 'server_2', category: 'building', cost: 13000000, icon: '🔒',
            nameKey: 'Certificación ISO 27001', nameKeyEn: 'ISO 27001 Certification',
            descKey: 'Servidores producen x2.', descKeyEn: 'Servers produce x2.',
            effect: { type: 'building_mult', target: 'server', value: 2 },
            requirement: { type: 'building_count', target: 'server', value: 10 },
        },

        // === BUILDING UPGRADES - ARCHITECT ===
        {
            id: 'architect_1', category: 'building', cost: 14000000, icon: '📐',
            nameKey: 'AWS Certified', nameKeyEn: 'AWS Certified',
            descKey: 'Arquitectos Cloud producen x2.', descKeyEn: 'Cloud Architects produce x2.',
            effect: { type: 'building_mult', target: 'architect', value: 2 },
            requirement: { type: 'building_count', target: 'architect', value: 1 },
        },
        {
            id: 'architect_2', category: 'building', cost: 140000000, icon: '🌐',
            nameKey: 'Multi-Cloud Strategy', nameKeyEn: 'Multi-Cloud Strategy',
            descKey: 'Arquitectos Cloud producen x2.', descKeyEn: 'Cloud Architects produce x2.',
            effect: { type: 'building_mult', target: 'architect', value: 2 },
            requirement: { type: 'building_count', target: 'architect', value: 10 },
        },

        // === BUILDING UPGRADES - DATA CENTER ===
        {
            id: 'datacenter_1', category: 'building', cost: 200000000, icon: '⚡',
            nameKey: 'Energía Renovable', nameKeyEn: 'Renewable Energy',
            descKey: 'Data Centers producen x2.', descKeyEn: 'Data Centers produce x2.',
            effect: { type: 'building_mult', target: 'datacenter', value: 2 },
            requirement: { type: 'building_count', target: 'datacenter', value: 1 },
        },
        {
            id: 'datacenter_2', category: 'building', cost: 2000000000, icon: '🏗️',
            nameKey: 'Expansión Modular', nameKeyEn: 'Modular Expansion',
            descKey: 'Data Centers producen x2.', descKeyEn: 'Data Centers produce x2.',
            effect: { type: 'building_mult', target: 'datacenter', value: 2 },
            requirement: { type: 'building_count', target: 'datacenter', value: 10 },
        },

        // === BUILDING UPGRADES - DEVOPS ===
        {
            id: 'devops_1', category: 'building', cost: 3300000000, icon: '🚀',
            nameKey: 'Kubernetes Mastery', nameKeyEn: 'Kubernetes Mastery',
            descKey: 'Pipelines DevOps producen x2.', descKeyEn: 'DevOps Pipelines produce x2.',
            effect: { type: 'building_mult', target: 'devops', value: 2 },
            requirement: { type: 'building_count', target: 'devops', value: 1 },
        },
        {
            id: 'devops_2', category: 'building', cost: 33000000000, icon: '🔧',
            nameKey: 'GitOps Avanzado', nameKeyEn: 'Advanced GitOps',
            descKey: 'Pipelines DevOps producen x2.', descKeyEn: 'DevOps Pipelines produce x2.',
            effect: { type: 'building_mult', target: 'devops', value: 2 },
            requirement: { type: 'building_count', target: 'devops', value: 10 },
        },

        // === BUILDING UPGRADES - AI LAB ===
        {
            id: 'ailab_1', category: 'building', cost: 51000000000, icon: '🧬',
            nameKey: 'GPUs de Última Gen', nameKeyEn: 'Next-Gen GPUs',
            descKey: 'AI Labs producen x2.', descKeyEn: 'AI Labs produce x2.',
            effect: { type: 'building_mult', target: 'ailab', value: 2 },
            requirement: { type: 'building_count', target: 'ailab', value: 1 },
        },

        // === BUILDING UPGRADES - QUANTUM ===
        {
            id: 'quantum_1', category: 'building', cost: 750000000000, icon: '🌌',
            nameKey: 'Qubits Estables', nameKeyEn: 'Stable Qubits',
            descKey: 'Quantum Computers producen x2.', descKeyEn: 'Quantum Computers produce x2.',
            effect: { type: 'building_mult', target: 'quantum', value: 2 },
            requirement: { type: 'building_count', target: 'quantum', value: 1 },
        },

        // === SYNERGY UPGRADES ===
        {
            id: 'syn_1', category: 'synergy', cost: 50000, icon: '🤝',
            nameKey: 'Pair Programming', nameKeyEn: 'Pair Programming',
            descKey: 'Juniors y Seniors se potencian: ambos producen x1.5.',
            descKeyEn: 'Juniors and Seniors boost each other: both produce x1.5.',
            effect: { type: 'synergy', targets: ['junior', 'senior'], value: 1.5 },
            requirement: { type: 'building_count', target: 'junior', value: 5, target2: 'senior', value2: 5 },
        },
        {
            id: 'syn_2', category: 'synergy', cost: 5000000, icon: '🔗',
            nameKey: 'DevOps Culture', nameKeyEn: 'DevOps Culture',
            descKey: 'Los servidores producen x2 si tienes pipelines DevOps.',
            descKeyEn: 'Servers produce x2 if you have DevOps Pipelines.',
            effect: { type: 'building_mult', target: 'server', value: 2 },
            requirement: { type: 'building_count', target: 'devops', value: 1 },
        },
        {
            id: 'syn_3', category: 'synergy', cost: 50000000, icon: '📊',
            nameKey: 'Data-Driven Decisions', nameKeyEn: 'Data-Driven Decisions',
            descKey: 'AI Labs producen x1.5 por cada Data Center.',
            descKeyEn: 'AI Labs produce x1.5 per Data Center.',
            effect: { type: 'synergy_per', target: 'ailab', per: 'datacenter', value: 0.5 },
            requirement: { type: 'building_count', target: 'ailab', value: 1 },
        },

        // === GLOBAL UPGRADES (Transformación Digital) ===
        {
            id: 'global_1', category: 'global', cost: 10000, icon: '📈',
            nameKey: 'KPIs Claros', nameKeyEn: 'Clear KPIs',
            descKey: 'Toda la producción +10%.', descKeyEn: 'All production +10%.',
            effect: { type: 'global_mult', value: 1.10 },
            requirement: { type: 'total_data', value: 5000 },
        },
        {
            id: 'global_2', category: 'global', cost: 100000, icon: '🔄',
            nameKey: 'Metodología Agile', nameKeyEn: 'Agile Methodology',
            descKey: 'Toda la producción +25%.', descKeyEn: 'All production +25%.',
            effect: { type: 'global_mult', value: 1.25 },
            requirement: { type: 'total_data', value: 50000 },
        },
        {
            id: 'global_3', category: 'global', cost: 1000000, icon: '☁️',
            nameKey: 'Migración a la Nube', nameKeyEn: 'Cloud Migration',
            descKey: 'Toda la producción +50%.', descKeyEn: 'All production +50%.',
            effect: { type: 'global_mult', value: 1.50 },
            requirement: { type: 'total_data', value: 500000 },
        },
        {
            id: 'global_4', category: 'global', cost: 10000000, icon: '🛡️',
            nameKey: 'Zero Trust Architecture', nameKeyEn: 'Zero Trust Architecture',
            descKey: 'Toda la producción +50%.', descKeyEn: 'All production +50%.',
            effect: { type: 'global_mult', value: 1.50 },
            requirement: { type: 'total_data', value: 5000000 },
        },
        {
            id: 'global_5', category: 'global', cost: 100000000, icon: '🤖',
            nameKey: 'Automatización Total', nameKeyEn: 'Total Automation',
            descKey: 'Toda la producción x2.', descKeyEn: 'All production x2.',
            effect: { type: 'global_mult', value: 2.0 },
            requirement: { type: 'total_data', value: 50000000 },
        },
        {
            id: 'global_6', category: 'global', cost: 1000000000, icon: '🌟',
            nameKey: 'Transformación Digital Completa', nameKeyEn: 'Complete Digital Transformation',
            descKey: 'Toda la producción x3.', descKeyEn: 'All production x3.',
            effect: { type: 'global_mult', value: 3.0 },
            requirement: { type: 'total_data', value: 500000000 },
        },
    ];

    function getAll() {
        return DEFINITIONS;
    }

    function getById(id) {
        return DEFINITIONS.find(u => u.id === id);
    }

    /**
     * Get the display name based on current language.
     */
    function getName(upgrade) {
        return Lang.getLanguage() === 'en' ? (upgrade.nameKeyEn || upgrade.nameKey) : upgrade.nameKey;
    }

    /**
     * Get the display description based on current language.
     */
    function getDesc(upgrade) {
        return Lang.getLanguage() === 'en' ? (upgrade.descKeyEn || upgrade.descKey) : upgrade.descKey;
    }

    /**
     * Check if an upgrade's requirement is met.
     */
    function isUnlocked(upgrade, gameState) {
        const req = upgrade.requirement;
        if (!req) return true;

        switch (req.type) {
            case 'building_count':
                const count = gameState.buildings[req.target] || 0;
                if (req.target2) {
                    const count2 = gameState.buildings[req.target2] || 0;
                    return count >= req.value && count2 >= req.value2;
                }
                return count >= req.value;
            case 'total_data':
                return gameState.stats.totalDataEarned >= req.value;
            case 'click_count':
                return gameState.stats.totalClicks >= req.value;
            case 'upgrade':
                return gameState.upgrades.includes(req.target);
            default:
                return false;
        }
    }

    /**
     * Get visible and affordable upgrades.
     */
    function getAvailable(gameState) {
        return DEFINITIONS.filter(u =>
            !gameState.upgrades.includes(u.id) && isUnlocked(u, gameState)
        );
    }

    return { getAll, getById, getName, getDesc, isUnlocked, getAvailable };
})();

window.Upgrades = Upgrades;

export const getAll = Upgrades.getAll;
export const getById = Upgrades.getById;
export const getName = Upgrades.getName;
export const getDesc = Upgrades.getDesc;
export const isUnlocked = Upgrades.isUnlocked;
export const getAvailable = Upgrades.getAvailable;
export default Upgrades;

