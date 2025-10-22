(function() {
    'use strict';

    const DEBUG = true;
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
        // Check prefers-color-scheme media query
        checkPrefersColorScheme: function() {
            if (window.matchMedia) {
                const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');

                if (darkModeQuery.matches) return 'dark';
                if (lightModeQuery.matches) return 'light';
            }
            return null;
        },

        // Check for common dark mode classes on body and html
        checkBodyClasses: function() {
            const body = document.body;
            const html = document.documentElement;

            const darkClasses = ['dark', 'dark-mode', 'theme-dark', 'dark-theme', 'night-mode'];
            const lightClasses = ['light', 'light-mode', 'theme-light', 'light-theme', 'day-mode'];

            // Check body classes
            for (const cls of darkClasses) {
                if (body.classList.contains(cls) || html.classList.contains(cls)) {
                    return 'dark';
                }
            }

            for (const cls of lightClasses) {
                if (body.classList.contains(cls) || html.classList.contains(cls)) {
                    return 'light';
                }
            }

            return null;
        },

        // Check CSS custom properties that might indicate theme
        checkCSSVariables: function() {
            const computedStyle = getComputedStyle(document.documentElement);
            const bodyStyle = getComputedStyle(document.body);

            // Common theme-related CSS variables
            const themeVars = [
                '--theme-mode',
                '--color-scheme',
                '--theme',
                '--mode'
            ];

            for (const varName of themeVars) {
                const value = computedStyle.getPropertyValue(varName).trim() ||
                             bodyStyle.getPropertyValue(varName).trim();

                if (value) {
                    if (value.includes('dark')) return 'dark';
                    if (value.includes('light')) return 'light';
                }
            }

            return null;
        },

        // Check for theme-related data attributes
        checkDataAttributes: function() {
            const body = document.body;
            const html = document.documentElement;

            const themeAttrs = ['data-theme', 'data-mode', 'data-color-scheme'];

            for (const attr of themeAttrs) {
                const value = body.getAttribute(attr) || html.getAttribute(attr);
                if (value) {
                    if (value.toLowerCase().includes('dark')) return 'dark';
                    if (value.toLowerCase().includes('light')) return 'light';
                }
            }

            return null;
        },

        // Check for specific meta tags
        checkMetaTags: function() {
            const metaTags = document.querySelectorAll('meta[name="theme-color"], meta[name="color-scheme"]');

            for (const meta of metaTags) {
                const content = meta.getAttribute('content');
                if (content) {
                    // Dark theme colors are usually darker
                    const color = content.toLowerCase();
                    if (color.includes('#000') || color.includes('#111') ||
                        color.includes('#222') || color.includes('black') ||
                        color.includes('dark')) {
                        return 'dark';
                    }
                    if (color.includes('#fff') || color.includes('#eee') ||
                        color.includes('white') || color.includes('light')) {
                        return 'light';
                    }
                }
            }

            return null;
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
                themeDetectors.checkBodyClasses,
                themeDetectors.checkDataAttributes,
                themeDetectors.checkCSSVariables,
                themeDetectors.checkMetaTags,
                themeDetectors.checkPrefersColorScheme
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
            // Listen for class changes on body and html
            const observer = new MutationObserver((mutations) => {
                let shouldCheck = false;

                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' &&
                        (mutation.attributeName === 'class' || mutation.attributeName.startsWith('data-'))) {
                        shouldCheck = true;
                    }
                });

                if (shouldCheck) {
                    this.checkForThemeChange();
                }
            });

            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class', 'data-theme', 'data-mode', 'data-color-scheme']
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class', 'data-theme', 'data-mode', 'data-color-scheme']
            });

            // Listen for prefers-color-scheme changes
            if (window.matchMedia) {
                const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');

                const handleChange = () => {
                    this.checkForThemeChange();
                };

                darkModeQuery.addEventListener('change', handleChange);
                lightModeQuery.addEventListener('change', handleChange);
            }

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