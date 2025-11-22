(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const IS_LOCAL = GM_info.script.version === 'LocalDev';

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[DeviceCSSLoader]', ...args);
        }
    }

    // Base URL for device CSS files
    const FOLDER_URL = IS_LOCAL ? 'http://localhost:8080/styles/device/' : 'https://sang765.github.io/HakoMonetTheme/styles/device/';

    // CSS files mapping for each device type
    const CSS_FILES = {
        general: 'genaral.css',  // General styles applied to all devices
        desktop: 'desktop.css',  // Desktop-specific styles
        mobile: 'mobile.css',    // Mobile-specific styles
        tablet: 'table.css'      // Tablet-specific styles
    };

    /**
     * Loads CSS content from a URL and applies it using GM_addStyle
     * @param {string} url - The URL of the CSS file to load
     * @returns {Promise} Promise that resolves when CSS is loaded and applied
     */
    function loadCSS(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                headers: {
                    'Accept': 'text/css, */*',
                    'Cache-Control': 'no-cache'
                },
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            GM_addStyle(response.responseText);
                            debugLog('Successfully loaded and applied CSS:', url);
                            resolve();
                        } catch (error) {
                            debugLog('Error applying CSS:', error);
                            reject(error);
                        }
                    } else {
                        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                        debugLog('Failed to load CSS:', url, error.message);
                        reject(error);
                    }
                },
                onerror: function(error) {
                    debugLog('Network error loading CSS:', url, error);
                    reject(new Error(`Network error: ${error}`));
                },
                ontimeout: function() {
                    debugLog('Timeout loading CSS:', url);
                    reject(new Error('Request timeout'));
                },
                timeout: 10000 // 10 second timeout
            });
        });
    }

    /**
     * Initializes the device CSS loader
     * Detects device type and loads appropriate CSS files
     */
    function initializeDeviceCSSLoader() {
        debugLog('Initializing Device CSS Loader...');

        // Wait for DeviceDetector module to be available
        if (typeof window.DeviceDetector === 'undefined') {
            debugLog('DeviceDetector module not ready, retrying in 100ms...');
            setTimeout(initializeDeviceCSSLoader, 100);
            return;
        }

        // Get current device type from DeviceDetector
        const deviceType = window.DeviceDetector.getCurrentDevice();
        debugLog('Detected device type:', deviceType);

        // Load general CSS first (applied to all devices)
        loadCSS(FOLDER_URL + CSS_FILES.general)
            .then(() => {
                debugLog('General CSS loaded successfully');

                // Then load device-specific CSS
                const deviceFile = CSS_FILES[deviceType];
                if (deviceFile) {
                    debugLog('Loading device-specific CSS for:', deviceType);
                    return loadCSS(FOLDER_URL + deviceFile);
                } else {
                    debugLog('No specific CSS file found for device type:', deviceType, '- using desktop as fallback');
                    return loadCSS(FOLDER_URL + CSS_FILES.desktop);
                }
            })
            .then(() => {
                debugLog('Device CSS loading completed successfully for device:', deviceType);
            })
            .catch((error) => {
                debugLog('Error during device CSS loading:', error);
                // Continue execution even if CSS loading fails
            });
    }

    /**
     * Manually reload device CSS (useful for testing or dynamic changes)
     */
    function reloadDeviceCSS() {
        debugLog('Manually reloading device CSS...');
        initializeDeviceCSSLoader();
    }

    /**
     * Get information about loaded CSS files
     * @returns {Object} Information about CSS loading status
     */
    function getCSSLoadInfo() {
        const deviceType = window.DeviceDetector ? window.DeviceDetector.getCurrentDevice() : 'unknown';
        return {
            deviceType: deviceType,
            generalCSS: FOLDER_URL + CSS_FILES.general,
            deviceCSS: FOLDER_URL + (CSS_FILES[deviceType] || CSS_FILES.desktop),
            folderURL: FOLDER_URL,
            availableDevices: Object.keys(CSS_FILES).filter(key => key !== 'general')
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDeviceCSSLoader);
    } else {
        initializeDeviceCSSLoader();
    }

    // Export module functions for external access
    window.HMTDeviceCSSLoader = {
        initialize: initializeDeviceCSSLoader,
        reload: reloadDeviceCSS,
        loadCSS: loadCSS,
        getInfo: getCSSLoadInfo
    };

    debugLog('Device CSS Loader module loaded and ready');

})();