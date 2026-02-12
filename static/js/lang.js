/* ==========================================================================
   Summan Data Clicker - Internationalization (i18n)
   ========================================================================== */

const Lang = (() => {
    let currentLang = 'es';

    const translations = {
        es: {
            // UI Labels
            game_title: 'Summan Data Clicker',
            game_subtitle: 'Transformación Digital, un dato a la vez',
            data_points: 'Data Points',
            per_second: 'por segundo',
            click_power: 'por click',
            buildings: 'Infraestructura',
            upgrades: 'Mejoras',
            achievements: 'Logros',
            stats: 'Estadísticas',
            statistics: 'Estadísticas',
            settings: 'Configuración',
            actions: 'Acciones',
            prestige: 'Innovar',
            innovation: 'Innovación',
            innovation_points: 'Puntos de Innovación',
            innovation_lab: 'Lab de Innovación',
            buy: 'Comprar',
            buy_1: 'x1',
            buy_10: 'x10',
            buy_100: 'x100',
            buy_max: 'Max',
            cost: 'Costo',
            production: 'Producción',
            owned: 'Adquiridos',
            total: 'Total',
            save: 'Guardar',
            load: 'Cargar',
            export_save: 'Exportar',
            import_save: 'Importar',
            reset_game: 'Reiniciar',
            reset_tutorial: 'Reiniciar Tutorial',
            confirm_reset: '¿Estás seguro? Se perderá todo el progreso.',
            confirm_prestige: '¿Innovar? Perderás tus Data Points y edificios, pero ganarás Puntos de Innovación permanentes.',
            language: 'Idioma',
            close: 'Cerrar',
            locked: 'Bloqueado',
            unlocked: 'Desbloqueado',
            secret: '???',
            offline_progress: '¡Bienvenido de vuelta!',
            offline_earned: 'Mientras no estabas, generaste',
            total_data: 'Data Points totales',
            total_clicks: 'Clicks totales',
            total_buildings: 'Edificios totales',
            play_time: 'Tiempo de juego',
            data_per_click: 'Data por click',
            data_per_second: 'Data por segundo',
            highest_dps: 'Mayor DPS alcanzado',
            times_prestiged: 'Veces prestigiado',
            innovation_earned: 'Innovación total ganada',
            achievements_unlocked: 'Logros desbloqueados',

            // Events
            event_golden_data: '¡Data Dorada!',
            event_golden_data_desc: '¡Click rápido! +{0} Data Points',
            event_deploy_friday: '¡Deploy Friday!',
            event_deploy_friday_good: 'Deploy exitoso: ¡producción x2 por 30s!',
            event_deploy_friday_bad: 'Deploy fallido: producción reducida 10s...',
            event_coffee_break: '☕ Coffee Break',
            event_coffee_break_desc: '¡Click power x7 por 13s!',
            event_bug_report: '🐛 Bug Report',
            event_bug_report_desc: '¡Bug detectado! Clickea para arreglarlo',

            // Buildings
            building_intern: 'Pasante',
            building_intern_desc: 'Trabaja gratis, pero al menos aprende a usar Excel.',
            building_laptop: 'Laptop',
            building_laptop_desc: 'Un MacBook Pro para sentirse productivo en el café.',
            building_junior: 'Junior Dev',
            building_junior_desc: 'Escribe código que funciona... a veces.',
            building_senior: 'Senior Dev',
            building_senior_desc: 'Dice "eso depende" a cada pregunta.',
            building_server: 'Servidor',
            building_server_desc: 'Casualmente se cae los viernes a las 5pm.',
            building_architect: 'Arquitecto Cloud',
            building_architect_desc: 'Dibuja diagramas que nadie más entiende.',
            building_datacenter: 'Data Center',
            building_datacenter_desc: 'Consume más energía que una ciudad pequeña.',
            building_devops: 'Pipeline DevOps',
            building_devops_desc: 'CI/CD: Continuamente Inseguro / Constantemente Desplegando.',
            building_ailab: 'AI Lab',
            building_ailab_desc: 'El modelo dice que tiene 99% de confianza. En qué, no se sabe.',
            building_quantum: 'Quantum Computer',
            building_quantum_desc: 'Resuelve problemas que aún no existen.',

            // Upgrade categories
            upgrade_cat_click: 'Mejoras de Click',
            upgrade_cat_building: 'Mejoras de Edificios',
            upgrade_cat_synergy: 'Sinergias',
            upgrade_cat_global: 'Transformación Digital',
            upgrade_cat_prestige: 'Innovación',

            // Achievement categories
            ach_cat_production: 'Producción',
            ach_cat_clicks: 'Clicks',
            ach_cat_buildings: 'Infraestructura',
            ach_cat_special: 'Especiales',

            // Prestige
            prestige_desc: 'Reinicia tu progreso a cambio de Puntos de Innovación permanentes.',
            prestige_gain: 'Ganarás {0} Puntos de Innovación',

            // Tutorial
            tutorial_click_start: '¡Haz clic!',
            tutorial_click_keep: '¡Dale caña!',
            tutorial_click_more: '¡Más data!',
            tutorial_click_almost: '¡Casi tienes data!',
            tutorial_exploit: '¡Explota al proletariado!',
            prestige_multiplier: 'Multiplicador de Innovación: x{0}',
            prestige_next: 'Siguiente punto de innovación en: {0} Data Points',

            // Tooltips
            tooltip_dps_breakdown: 'Desglose de DPS',
            tooltip_click_breakdown: 'Desglose de Click',
        },
        en: {
            // UI Labels
            game_title: 'Summan Data Clicker',
            game_subtitle: 'Digital Transformation, one data point at a time',
            data_points: 'Data Points',
            per_second: 'per second',
            click_power: 'per click',
            buildings: 'Infrastructure',
            upgrades: 'Upgrades',
            achievements: 'Achievements',
            stats: 'Statistics',
            statistics: 'Statistics',
            settings: 'Settings',
            actions: 'Actions',
            prestige: 'Innovate',
            innovation: 'Innovation',
            innovation_points: 'Innovation Points',
            innovation_lab: 'Innovation Lab',
            buy: 'Buy',
            buy_1: 'x1',
            buy_10: 'x10',
            buy_100: 'x100',
            buy_max: 'Max',
            cost: 'Cost',
            production: 'Production',
            owned: 'Owned',
            total: 'Total',
            save: 'Save',
            load: 'Load',
            export_save: 'Export',
            import_save: 'Import',
            reset_game: 'Reset',
            reset_tutorial: 'Restart Tutorial',
            confirm_reset: 'Are you sure? All progress will be lost.',
            confirm_prestige: 'Innovate? You will lose your Data Points and buildings, but gain permanent Innovation Points.',
            language: 'Language',
            close: 'Close',
            locked: 'Locked',
            unlocked: 'Unlocked',
            secret: '???',
            offline_progress: 'Welcome back!',
            offline_earned: 'While you were away, you generated',
            total_data: 'Total Data Points',
            total_clicks: 'Total Clicks',
            total_buildings: 'Total Buildings',
            play_time: 'Play Time',
            data_per_click: 'Data per Click',
            data_per_second: 'Data per Second',
            highest_dps: 'Highest DPS reached',
            times_prestiged: 'Times Prestiged',
            innovation_earned: 'Total Innovation Earned',
            achievements_unlocked: 'Achievements Unlocked',

            // Events
            event_golden_data: 'Golden Data!',
            event_golden_data_desc: 'Click fast! +{0} Data Points',
            event_deploy_friday: 'Deploy Friday!',
            event_deploy_friday_good: 'Deploy success: production x2 for 30s!',
            event_deploy_friday_bad: 'Deploy failed: reduced production for 10s...',
            event_coffee_break: '☕ Coffee Break',
            event_coffee_break_desc: 'Click power x7 for 13s!',
            event_bug_report: '🐛 Bug Report',
            event_bug_report_desc: 'Bug detected! Click to fix it',

            // Buildings
            building_intern: 'Intern',
            building_intern_desc: 'Works for free, but at least learns how to use Excel.',
            building_laptop: 'Laptop',
            building_laptop_desc: 'A MacBook Pro to feel productive at the café.',
            building_junior: 'Junior Dev',
            building_junior_desc: 'Writes code that works... sometimes.',
            building_senior: 'Senior Dev',
            building_senior_desc: 'Says "it depends" to every question.',
            building_server: 'Server',
            building_server_desc: 'Conveniently crashes on Fridays at 5pm.',
            building_architect: 'Cloud Architect',
            building_architect_desc: 'Draws diagrams nobody else understands.',
            building_datacenter: 'Data Center',
            building_datacenter_desc: 'Consumes more energy than a small city.',
            building_devops: 'DevOps Pipeline',
            building_devops_desc: 'CI/CD: Continuously Insecure / Constantly Deploying.',
            building_ailab: 'AI Lab',
            building_ailab_desc: 'The model says it\'s 99% confident. In what, nobody knows.',
            building_quantum: 'Quantum Computer',
            building_quantum_desc: 'Solves problems that don\'t exist yet.',

            // Upgrade categories
            upgrade_cat_click: 'Click Upgrades',
            upgrade_cat_building: 'Building Upgrades',
            upgrade_cat_synergy: 'Synergies',
            upgrade_cat_global: 'Digital Transformation',
            upgrade_cat_prestige: 'Innovation',

            // Achievement categories
            ach_cat_production: 'Production',
            ach_cat_clicks: 'Clicks',
            ach_cat_buildings: 'Infrastructure',
            ach_cat_special: 'Special',

            // Prestige
            prestige_desc: 'Reset your progress in exchange for permanent Innovation Points.',
            prestige_gain: 'You will gain {0} Innovation Points',

            // Tutorial
            tutorial_click_start: 'Click it!',
            tutorial_click_keep: 'Keep going!',
            tutorial_click_more: 'More data!',
            tutorial_click_almost: 'Almost there!',
            tutorial_exploit: 'Exploit the proletariat!',
            prestige_multiplier: 'Innovation Multiplier: x{0}',
            prestige_next: 'Next innovation point at: {0} Data Points',

            // Tooltips
            tooltip_dps_breakdown: 'DPS Breakdown',
            tooltip_click_breakdown: 'Click Breakdown',
        }
    };

    function t(key, ...args) {
        let text = translations[currentLang]?.[key] || translations['es']?.[key] || key;
        args.forEach((arg, i) => {
            text = text.replace(`{${i}}`, arg);
        });
        return text;
    }

    function setLanguage(lang) {
        if (translations[lang]) {
            currentLang = lang;
            return true;
        }
        return false;
    }

    function getLanguage() {
        return currentLang;
    }

    function getAvailableLanguages() {
        return Object.keys(translations);
    }

    return { t, setLanguage, getLanguage, getAvailableLanguages };
})();
