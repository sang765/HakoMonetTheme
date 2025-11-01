(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[ThemeDetector]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    // Theme detection methods
    const themeDetectors = {
        // Check storage and cookies for night_mode
        checkStorageAndCookies: function() {
            // Check localStorage
            if (typeof localStorage !== 'undefined') {
                const nightMode = localStorage.getItem('night_mode');
                if (nightMode === 'true') return 'dark';
            }

            // Check cookies
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'night_mode' && value === 'true') return 'dark';
            }

            return 'light';
        }
    };

    class ThemeDetector {
        constructor() {
            this.currentTheme = null;
            this.listeners = [];
            this.init();
        }

        init() {
            debugLog('Theme Detector module initialized');

            // Initial detection
            this.detectTheme();

            // Listen for changes
            this.setupChangeListeners();

            // Mark as loaded
            window.__themeDetectorLoaded = true;
            debugLog('Theme detection complete. Current theme:', this.currentTheme);
        }

        detectTheme() {
            // Try different detection methods in order of reliability
            const detectionMethods = [
                themeDetectors.checkStorageAndCookies
            ];

            for (const method of detectionMethods) {
                const result = method.call(this);
                if (result) {
                    this.currentTheme = result;
                    debugLog('Theme detected via', method.name, ':', result);
                    break;
                }
            }

            // Default to light if nothing detected
            if (!this.currentTheme) {
                this.currentTheme = 'light';
                debugLog('No theme detected, defaulting to light');
            }

            return this.currentTheme;
        }

        setupChangeListeners() {
            // Listen for localStorage changes
            const handleStorageChange = (e) => {
                if (e.key === 'night_mode') {
                    this.checkForThemeChange();
                }
            };

            window.addEventListener('storage', handleStorageChange);

            debugLog('Theme change listeners set up');
        }

        checkForThemeChange() {
            const previousTheme = this.currentTheme;
            const newTheme = this.detectTheme();

            if (previousTheme !== newTheme) {
                debugLog('Theme changed from', previousTheme, 'to', newTheme);
                this.notifyListeners(newTheme, previousTheme);
            }
        }

        notifyListeners(newTheme, oldTheme) {
            this.listeners.forEach(callback => {
                try {
                    callback(newTheme, oldTheme);
                } catch (error) {
                    debugLog('Error in theme change listener:', error);
                }
            });
        }

        getCurrentTheme() {
            return this.currentTheme;
        }

        isDark() {
            return this.currentTheme === 'dark';
        }

        isLight() {
            return this.currentTheme === 'light';
        }

        onThemeChange(callback) {
            if (typeof callback === 'function') {
                this.listeners.push(callback);
                debugLog('Theme change listener added');
            }
        }

        offThemeChange(callback) {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
                debugLog('Theme change listener removed');
            }
        }

        // Force re-detection
        refresh() {
            debugLog('Forcing theme re-detection');
            this.detectTheme();
        }
    }

    // Create global instance
    const themeDetector = new ThemeDetector();

    // Expose to window for external access
    window.ThemeDetector = {
        getCurrentTheme: () => themeDetector.getCurrentTheme(),
        isDark: () => themeDetector.isDark(),
        isLight: () => themeDetector.isLight(),
        onThemeChange: (callback) => themeDetector.onThemeChange(callback),
        offThemeChange: (callback) => themeDetector.offThemeChange(callback),
        refresh: () => themeDetector.refresh(),
        instance: themeDetector
    };

    debugLog('ThemeDetector module loaded and available as window.ThemeDetector');

})();
