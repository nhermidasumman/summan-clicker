/* ==========================================================================
   Summan Data Clicker - Building Definitions
   ========================================================================== */

const Buildings = (() => {
    /**
     * Building definitions. Each building has:
     * - id: unique identifier
     * - nameKey: i18n key for the name
     * - descKey: i18n key for the description
     * - baseCost: starting price in data points
     * - baseDps: base data points per second per unit
     * - growthRate: cost multiplier per unit owned
     * - icon: emoji fallback icon
     * - color: theme color for the building
     * - unlockAt: total data points needed to see this building
     */
    const DEFINITIONS = [
        {
            id: 'intern',
            nameKey: 'building_intern',
            descKey: 'building_intern_desc',
            baseCost: 20,
            baseDps: 0.4,
            growthRate: 1.18,
            icon: '👶',
            color: '#9ac31c',
            unlockAt: 0,
        },
        {
            id: 'laptop',
            nameKey: 'building_laptop',
            descKey: 'building_laptop_desc',
            baseCost: 150,
            baseDps: 4,
            growthRate: 1.18,
            icon: '💻',
            color: '#55B8B2',
            unlockAt: 100,
        },
        {
            id: 'junior',
            nameKey: 'building_junior',
            descKey: 'building_junior_desc',
            baseCost: 1500,
            baseDps: 35,
            growthRate: 1.18,
            icon: '🧑‍💻',
            color: '#517BBD',
            unlockAt: 1000,
        },
        {
            id: 'senior',
            nameKey: 'building_senior',
            descKey: 'building_senior_desc',
            baseCost: 15000,
            baseDps: 200,
            growthRate: 1.18,
            icon: '👨‍💼',
            color: '#919dcf',
            unlockAt: 10000,
        },
        {
            id: 'server',
            nameKey: 'building_server',
            descKey: 'building_server_desc',
            baseCost: 130000,
            baseDps: 1200,
            growthRate: 1.18,
            icon: '🖥️',
            color: '#45B495',
            unlockAt: 100000,
        },
        {
            id: 'architect',
            nameKey: 'building_architect',
            descKey: 'building_architect_desc',
            baseCost: 1400000,
            baseDps: 6000,
            growthRate: 1.18,
            icon: '☁️',
            color: '#31ADBD',
            unlockAt: 1000000,
        },
        {
            id: 'datacenter',
            nameKey: 'building_datacenter',
            descKey: 'building_datacenter_desc',
            baseCost: 20000000,
            baseDps: 35000,
            growthRate: 1.18,
            icon: '🏢',
            color: '#483F91',
            unlockAt: 5000000,
        },
        {
            id: 'devops',
            nameKey: 'building_devops',
            descKey: 'building_devops_desc',
            baseCost: 330000000,
            baseDps: 200000,
            growthRate: 1.18,
            icon: '🔄',
            color: '#E7481D',
            unlockAt: 50000000,
        },
        {
            id: 'ailab',
            nameKey: 'building_ailab',
            descKey: 'building_ailab_desc',
            baseCost: 5100000000,
            baseDps: 1500000,
            growthRate: 1.18,
            icon: '🤖',
            color: '#517BBD',
            unlockAt: 500000000,
        },
        {
            id: 'quantum',
            nameKey: 'building_quantum',
            descKey: 'building_quantum_desc',
            baseCost: 75000000000,
            baseDps: 10000000,
            growthRate: 1.18,
            icon: '⚛️',
            color: '#483F91',
            unlockAt: 5000000000,
        },
    ];

    /**
     * Get all building definitions.
     */
    function getAll() {
        return DEFINITIONS;
    }

    /**
     * Get a building definition by id.
     */
    function getById(id) {
        return DEFINITIONS.find(b => b.id === id);
    }

    /**
     * Calculate the current cost of the next unit of a building.
     */
    function getCost(buildingId, owned) {
        const def = getById(buildingId);
        if (!def) return Infinity;
        return Utils.calculateBuildingCost(def.baseCost, owned, def.growthRate);
    }

    /**
     * Calculate the DPS contribution of a building given count and multiplier.
     */
    function getDps(buildingId, owned, multiplier = 1) {
        const def = getById(buildingId);
        if (!def) return 0;
        return def.baseDps * owned * multiplier;
    }

    /**
     * Get visible buildings based on total data points earned.
     */
    function getVisible(totalDataEarned) {
        return DEFINITIONS.filter(b => totalDataEarned >= b.unlockAt);
    }

    return { getAll, getById, getCost, getDps, getVisible };
})();
