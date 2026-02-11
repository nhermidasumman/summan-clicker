(function () {
    // Create debug overlay
    const overlay = document.createElement('div');
    overlay.id = 'debug-error-overlay';
    overlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        background: rgba(220, 38, 38, 0.95);
        color: white;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        white-space: pre-wrap;
        border-bottom: 2px solid white;
    `;
    document.body.appendChild(overlay);

    function showError(msg) {
        overlay.style.display = 'block';
        overlay.textContent += '🚨 ERROR: ' + msg + '\n';
        console.error(msg);
    }

    window.onerror = function (message, source, lineno, colno, error) {
        showError(`${message}\nAt: ${source}:${lineno}:${colno}`);
        return false;
    };

    window.addEventListener('unhandledrejection', function (event) {
        showError(`Unhandled Promise Rejection: ${event.reason}`);
    });

    // Test if ES6 features are supported
    try {
        new Function('const x = (a) => a + 1');
    } catch (e) {
        showError('ES6 Syntax not supported! Update your browser.');
    }
})();
