/* ==========================================================================
   Summan Data Clicker - Prestige / Innovation System
   ========================================================================== */

const Prestige = (() => {
    /**
     * Prestige upgrade definitions.
     */
    const PRESTIGE_UPGRADES = [
        {
            id: 'p_start_bonus', cost: 1, icon: '🎁',
            nameEs: 'Kit de Bienvenida', nameEn: 'Welcome Kit',
            descEs: 'Empieza con 100 Data Points después de innovar.',
            descEn: 'Start with 100 Data Points after innovating.',
            effect: { type: 'start_bonus', value: 100 },
        },
        {
            id: 'p_click_boost', cost: 2, icon: '👆',
            nameEs: 'Memoria Muscular', nameEn: 'Muscle Memory',
            descEs: 'Click power permanente x2.',
            descEn: 'Permanent click power x2.',
            effect: { type: 'click_mult', value: 2 },
        },
        {
            id: 'p_production_1', cost: 3, icon: '⚡',
            nameEs: 'Experticia Acumulada', nameEn: 'Accumulated Expertise',
            descEs: 'Producción permanente +25%.',
            descEn: 'Permanent production +25%.',
            effect: { type: 'production_mult', value: 1.25 },
        },
        {
            id: 'p_golden_freq', cost: 5, icon: '✨',
            nameEs: 'Ojo para el Oro', nameEn: 'Eye for Gold',
            descEs: 'Data Doradas aparecen 50% más seguido.',
            descEn: 'Golden Data appears 50% more often.',
            effect: { type: 'golden_frequency', value: 0.5 },
        },
        {
            id: 'p_golden_value', cost: 5, icon: '💰',
            nameEs: 'Toque de Midas', nameEn: 'Midas Touch',
            descEs: 'Data Doradas dan x2 recompensa.',
            descEn: 'Golden Data gives x2 reward.',
            effect: { type: 'golden_value', value: 2 },
        },
        {
            id: 'p_building_discount', cost: 7, icon: '🏷️',
            nameEs: 'Negociación Experta', nameEn: 'Expert Negotiation',
            descEs: 'Todos los edificios cuestan 10% menos.',
            descEn: 'All buildings cost 10% less.',
            effect: { type: 'building_discount', value: 0.90 },
        },
        {
            id: 'p_production_2', cost: 10, icon: '🚀',
            nameEs: 'Velocidad Summan', nameEn: 'Summan Speed',
            descEs: 'Producción permanente x2.',
            descEn: 'Permanent production x2.',
            effect: { type: 'production_mult', value: 2 },
        },
        {
            id: 'p_offline', cost: 10, icon: '😴',
            nameEs: 'Trabajador Nocturno', nameEn: 'Night Worker',
            descEs: 'Progreso offline al 75% (en vez de 50%).',
            descEn: 'Offline progress at 75% (instead of 50%).',
            effect: { type: 'offline_rate', value: 0.75 },
        },
        {
            id: 'p_coffee_boost', cost: 15, icon: '☕',
            nameEs: 'Espresso Doble', nameEn: 'Double Espresso',
            descEs: 'Coffee Break da x10 en vez de x7.',
            descEn: 'Coffee Break gives x10 instead of x7.',
            effect: { type: 'coffee_mult', value: 10 },
        },
        {
            id: 'p_production_3', cost: 25, icon: '🌟',
            nameEs: 'Excelencia Operacional', nameEn: 'Operational Excellence',
            descEs: 'Producción permanente x3.',
            descEn: 'Permanent production x3.',
            effect: { type: 'production_mult', value: 3 },
        },
        {
            id: 'p_start_big', cost: 50, icon: '🏦',
            nameEs: 'Inversión Semilla', nameEn: 'Seed Investment',
            descEs: 'Empieza con 1M Data Points después de innovar.',
            descEn: 'Start with 1M Data Points after innovating.',
            effect: { type: 'start_bonus', value: 1000000 },
        },
    ];

    /**
     * Calculate innovation points earned from total lifetime data.
     * Formula: floor(sqrt(totalLifetimeData / 1e9))
     */
    function calculateInnovationPoints(totalLifetimeData) {
        if (totalLifetimeData < 1e9) return 0;
        return Math.floor(Math.pow(totalLifetimeData / 1e9, 0.5));
    }

    /**
     * Calculate the base multiplier from innovation points.
     * Each point gives +5% production.
     */
    function getBaseMultiplier(innovationPoints) {
        return 1 + (innovationPoints * 0.05);
    }

    /**
     * Calculate total data needed for the next innovation point.
     */
    function dataForNextPoint(currentPoints) {
        const next = currentPoints + 1;
        return next * next * 1e9;
    }

    function getUpgrades() {
        return PRESTIGE_UPGRADES;
    }

    function getUpgradeById(id) {
        return PRESTIGE_UPGRADES.find(u => u.id === id);
    }

    function getName(upgrade) {
        return Lang.getLanguage() === 'en' ? upgrade.nameEn : upgrade.nameEs;
    }

    function getDesc(upgrade) {
        return Lang.getLanguage() === 'en' ? upgrade.descEn : upgrade.descEs;
    }

    /**
     * Get available prestige upgrades (not yet purchased).
     */
    function getAvailable(purchasedIds) {
        return PRESTIGE_UPGRADES.filter(u => !purchasedIds.includes(u.id));
    }

    /**
     * Aggregate all prestige effects from purchased upgrades.
     */
    function getAggregatedEffects(purchasedIds) {
        const effects = {
            startBonus: 0,
            clickMult: 1,
            productionMult: 1,
            goldenFrequency: 1,
            goldenValue: 1,
            buildingDiscount: 1,
            offlineRate: 0.50,
            coffeeMult: 7,
        };

        for (const id of purchasedIds) {
            const upgrade = getUpgradeById(id);
            if (!upgrade) continue;

            const eff = upgrade.effect;
            switch (eff.type) {
                case 'start_bonus':
                    effects.startBonus = Math.max(effects.startBonus, eff.value);
                    break;
                case 'click_mult':
                    effects.clickMult *= eff.value;
                    break;
                case 'production_mult':
                    effects.productionMult *= eff.value;
                    break;
                case 'golden_frequency':
                    effects.goldenFrequency *= (1 - eff.value); // reduces interval
                    break;
                case 'golden_value':
                    effects.goldenValue *= eff.value;
                    break;
                case 'building_discount':
                    effects.buildingDiscount *= eff.value;
                    break;
                case 'offline_rate':
                    effects.offlineRate = Math.max(effects.offlineRate, eff.value);
                    break;
                case 'coffee_mult':
                    effects.coffeeMult = Math.max(effects.coffeeMult, eff.value);
                    break;
            }
        }

        return effects;
    }

    return {
        calculateInnovationPoints,
        getBaseMultiplier,
        dataForNextPoint,
        getUpgrades,
        getUpgradeById,
        getName,
        getDesc,
        getAvailable,
        getAggregatedEffects,
    };
})();
