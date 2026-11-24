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
    function parseThemeValue(value) {
        if (value === null || value === undefined) return null;
        const normalized = String(value).trim().toLowerCase();
        if (['true', '1', 'dark', 'on'].includes(normalized)) return 'dark';
        if (['false', '0', 'light', 'off'].includes(normalized)) return 'light';
        return null;
    }

    const themeDetectors = {
        // What the site actually rendered is the source of truth. Hako sets
        // `dark` / `light` on the root element (Tailwind dark mode).
        checkDom: function() {
            const elements = [document.documentElement, document.body].filter(Boolean);
            for (const el of elements) {
                const attrTheme = el.getAttribute('data-theme') || el.getAttribute('data-mode');
                const parsedAttr = parseThemeValue(attrTheme);
                if (parsedAttr) return parsedAttr;
                if (el.classList.contains('dark') || el.classList.contains('dark-mode') ||
                    el.classList.contains('night-mode')) return 'dark';
                if (el.classList.contains('light') || el.classList.contains('light-mode')) return 'light';
            }
            return null;
        },

        // localStorage is what the site's UI writes; the cookie can be stale.
        // An explicit "light" must never be overridden by an old "dark" cookie.
        checkStorageAndCookies: function() {
            let fromStorage = null;
            if (typeof localStorage !== 'undefined') {
                try {
                    fromStorage = parseThemeValue(localStorage.getItem('night_mode'));
                } catch (e) {
                    fromStorage = null;
                }
            }

            let fromCookie = null;
            const cookies = document.cookie ? document.cookie.split(';') : [];
            for (const cookie of cookies) {
                const separator = cookie.indexOf('=');
                if (separator === -1) continue;
                if (cookie.slice(0, separator).trim() !== 'night_mode') continue;
                fromCookie = parseThemeValue(cookie.slice(separator + 1).trim());
            }

            return fromStorage || fromCookie || null;
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
                themeDetectors.checkDom,
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
                (window.top || window).document.dispatchEvent(new CustomEvent('hmtThemeChanged', {
                    detail: { theme: newTheme, previousTheme: previousTheme }
                }));
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
