(function() {
    'use strict';

    const DEBUG = true;

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[AutoReload]', ...args);
        }
    }

    function handleNightModeToggleClick(event) {
        // Check if the clicked element or its parent has the class 'nightmode-toggle'
        const target = event.target;
        if (target.classList.contains('nightmode-toggle') || target.closest('.nightmode-toggle')) {
            debugLog('Night mode toggle clicked, reloading page...');
            // Reload the page
            window.location.reload();
        }
    }

    function initializeAutoReload() {
        // Add event listener for clicks on the document
        document.addEventListener('click', handleNightModeToggleClick, true);
        debugLog('Auto reload module initialized. Listening for nightmode-toggle clicks.');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAutoReload);
    } else {
        initializeAutoReload();
    }

    // Expose to window for potential external access (optional)
    window.HMTAutoReload = {
        initialize: initializeAutoReload
    };

    debugLog('AutoReload module loaded.');

})();