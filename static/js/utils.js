/* ==========================================================================
   Summan Data Clicker - Utility Functions
   ========================================================================== */

const Utils = (() => {
    /**
     * Format large numbers into human-readable strings.
     * e.g., 1500 -> "1.5K", 2300000 -> "2.3M"
     */
    const SUFFIXES = [
        '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc',
        'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc'
    ];

    function formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num < 0) return '-' + formatNumber(-num);
        // User requested full number until 100k
        if (num < 100000) {
            return Math.floor(num).toLocaleString();
        }

        const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
        if (tier === 0) return Math.floor(num).toString();
        if (tier >= SUFFIXES.length) return Math.floor(num).toExponential(0);

        const suffix = SUFFIXES[tier];
        const scale = Math.pow(10, tier * 3);
        const scaled = num / scale;

        return parseFloat(scaled.toFixed(1)).toString() + suffix;
    }

    /**
     * Format a DPS (data per second) value, allowing decimals for precision.
     * - Values < 1: show 1 decimal (e.g. 0.4)
     * - Values 1-999: integer if whole, 1 decimal otherwise (e.g. 5, 3.5)
     * - Values >= 1000: use suffix with 1 decimal (e.g. 1.2K)
     */
    function formatDps(num) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num < 0) return '-' + formatDps(-num);
        if (num < 1000) {
            if (num === 0) return '0';
            if (num < 1) return num.toFixed(1);
            if (Number.isInteger(num)) return num.toString();
            return parseFloat(num.toFixed(1)).toString();
        }

        const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
        if (tier === 0) return parseFloat(num.toFixed(1)).toString();
        if (tier >= SUFFIXES.length) return num.toExponential(1);

        const suffix = SUFFIXES[tier];
        const scale = Math.pow(10, tier * 3);
        const scaled = num / scale;

        return parseFloat(scaled.toFixed(1)).toString() + suffix;
    }

    /**
     * Format time duration in seconds to human-readable string.
     */
    function formatTime(seconds) {
        if (seconds < 60) return Math.floor(seconds) + 's';
        if (seconds < 3600) {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return m + 'm ' + s + 's';
        }
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h + 'h ' + m + 'm';
    }

    /**
     * Format a Date to locale string.
     */
    function formatDate(date) {
        return new Date(date).toLocaleString();
    }

    /**
     * Calculate the cost of a building given base cost and count owned.
     * Uses exponential scaling: cost = baseCost * growthRate^owned
     */
    function calculateBuildingCost(baseCost, owned, growthRate = 1.15) {
        return Math.ceil(baseCost * Math.pow(growthRate, owned));
    }

    /**
     * Calculate cost for buying N buildings at once.
     */
    function calculateBulkCost(baseCost, owned, count, growthRate = 1.15) {
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += calculateBuildingCost(baseCost, owned + i, growthRate);
        }
        return total;
    }

    /**
     * Calculate max affordable count of a building.
     */
    function maxAffordable(baseCost, owned, budget, growthRate = 1.15) {
        let count = 0;
        let totalCost = 0;
        while (true) {
            const nextCost = calculateBuildingCost(baseCost, owned + count, growthRate);
            if (totalCost + nextCost > budget) break;
            totalCost += nextCost;
            count++;
            if (count > 10000) break; // Safety cap
        }
        return { count, totalCost };
    }

    /**
     * Generate a random float between min and max.
     */
    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generate a random integer between min and max (inclusive).
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Debounce a function.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Create a particle effect at a position.
     */
    function createParticle(x, y, text, color = '#9ac31c') {
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.textContent = text;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.color = color;
        document.getElementById('particle-container').appendChild(particle);

        particle.addEventListener('animationend', () => particle.remove());
    }

    /**
     * Play a subtle CSS animation on an element.
     */
    function pulse(element) {
        element.classList.remove('pulse');
        void element.offsetWidth; // Force reflow
        element.classList.add('pulse');
    }

    /**
     * Show a toast notification.
     */
    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        // Prevent duplicate messages
        const existingToasts = container.querySelectorAll('.toast');
        for (const existing of existingToasts) {
            if (existing.innerHTML === message) {
                // Already showing this message, unwanted spam
                // Optional: Restart animation/timer? 
                // For now, just return to prevent stacking.
                return;
            }
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = message;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        setTimeout(() => {
            toast.classList.remove('toast-visible');
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    }

    return {
        formatNumber,
        formatDps,
        formatTime,
        formatDate,
        calculateBuildingCost,
        calculateBulkCost,
        maxAffordable,
        randomRange,
        randomInt,
        debounce,
        createParticle,
        pulse,
        showToast,
    };
})();
