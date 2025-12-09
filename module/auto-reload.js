(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const IS_LOCAL = GM_info.script.version === 'LocalDev';
    const CHECK_INTERVAL = 3000; // Check every 3 seconds
    let autoReloadInterval = null;
    let lastModifiedTimes = {};

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

    function checkAutoReloadEnabled() {
        return GM_getValue('auto_reload_enabled', false);
    }

    function startAutoReload() {
        if (!IS_LOCAL) {
            debugLog('Auto reload chỉ hoạt động trong chế độ local development');
            return;
        }

        if (autoReloadInterval) {
            clearInterval(autoReloadInterval);
        }

        debugLog('Bắt đầu auto reload resources với interval', CHECK_INTERVAL, 'ms');

        autoReloadInterval = setInterval(async () => {
            if (!checkAutoReloadEnabled()) {
                debugLog('Auto reload đã bị tắt, dừng interval');
                stopAutoReload();
                return;
            }

            try {
                // Check multiple key files for changes
                const filesToCheck = ['/main.js', '/module/config.js', '/module/auto-reload.js', '/styles/device/genaral.css', '/styles/device/desktop.css'];
                let hasChanges = false;

                for (const file of filesToCheck) {
                    const response = await fetch(window.location.origin + file + '?' + Date.now(), {
                        method: 'HEAD',
                        cache: 'no-cache'
                    });

                    if (response.ok) {
                        const lastModified = response.headers.get('Last-Modified');
                        const fileKey = file;

                        if (lastModified && lastModifiedTimes[fileKey] !== lastModified) {
                            if (lastModifiedTimes[fileKey]) {
                                debugLog(`File ${file} changed (Last-Modified: ${lastModifiedTimes[fileKey]} -> ${lastModified})`);
                                hasChanges = true;
                            }
                            lastModifiedTimes[fileKey] = lastModified;
                        }
                    }
                }

                if (hasChanges) {
                    debugLog('Resources changed, triggering reload...');
                    if (typeof window.updateAllResources === 'function') {
                        await window.updateAllResources();
                        debugLog('Auto reload resources completed');
                    } else {
                        debugLog('updateAllResources function not available');
                    }
                }
            } catch (error) {
                debugLog('Error checking resources:', error);
            }
        }, CHECK_INTERVAL);
    }

    function stopAutoReload() {
        if (autoReloadInterval) {
            clearInterval(autoReloadInterval);
            autoReloadInterval = null;
            debugLog('Đã dừng auto reload interval');
        }
    }

    function handleAutoReloadSettingChange(event) {
        const enabled = event.detail.enabled;
        debugLog('Auto reload setting changed:', enabled);

        if (enabled) {
            startAutoReload();
        } else {
            stopAutoReload();
        }
    }

    function initializeAutoReload() {
        // Add event listener for clicks on the document
        document.addEventListener('click', handleNightModeToggleClick, true);

        // Listen for auto reload setting changes
        document.addEventListener('hmtAutoReloadChanged', handleAutoReloadSettingChange);

        // Start auto reload if enabled
        if (checkAutoReloadEnabled()) {
            startAutoReload();
        }

        debugLog('Auto reload module initialized. Listening for nightmode-toggle clicks and auto reload settings.');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAutoReload);
    } else {
        initializeAutoReload();
    }

    // Expose to window for potential external access (optional)
    window.HMTAutoReload = {
        initialize: initializeAutoReload,
        startAutoReload: startAutoReload,
        stopAutoReload: stopAutoReload
    };

    debugLog('AutoReload module loaded.');

})();
