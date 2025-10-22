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

    // Color scheme management based on theme
    class ThemeColorManager {
        constructor(themeDetector) {
            this.themeDetector = themeDetector;
            this.currentColorScheme = null;
            this.colorChangeCallbacks = [];
        }

        // Generate appropriate color scheme based on theme and base color
        generateColorScheme(baseColor, theme) {
            const isLightTheme = theme === 'light';
            const monetPalette = MonetAPI.generateMonetPalette(baseColor);

            if (!monetPalette) return null;

            // Adjust palette based on theme
            const adjustedPalette = this.adjustPaletteForTheme(monetPalette, isLightTheme);

            return {
                palette: adjustedPalette,
                isLight: isLightTheme,
                baseColor: baseColor,
                theme: theme
            };
        }

        // Adjust Monet palette for light/dark theme
        adjustPaletteForTheme(palette, isLight) {
            if (isLight) {
                // For light theme, use lighter tones and ensure good contrast
                // Material You light theme should have:
                // - Very light backgrounds (close to white)
                // - Subtle accent colors
                // - Good contrast for readability
                return {
                    50: this.lightenColor(palette[50], 0.4),   // Very light background
                    100: this.lightenColor(palette[100], 0.3),  // Light surfaces
                    200: this.lightenColor(palette[200], 0.2),  // Slightly darker surfaces
                    300: palette[300],                         // Light accent variant
                    400: palette[400],                         // Medium accent variant
                    500: palette[500],                         // Main accent color
                    600: this.darkenColor(palette[600], 0.1),  // Darker accent for contrast
                    700: this.darkenColor(palette[700], 0.15), // Darker for borders
                    800: this.darkenColor(palette[800], 0.2),  // Dark elements
                    900: this.darkenColor(palette[900], 0.25), // Very dark for text
                    1000: this.darkenColor(palette[1000], 0.3) // Darkest for high contrast
                };
            } else {
                // For dark theme, use darker tones
                // Material You dark theme should have:
                // - Very dark backgrounds (close to black)
                // - Vibrant accent colors
                // - Good contrast for readability
                return {
                    50: this.darkenColor(palette[50], 0.5),    // Very dark background
                    100: this.darkenColor(palette[100], 0.4),   // Dark surfaces
                    200: this.darkenColor(palette[200], 0.3),   // Slightly lighter surfaces
                    300: this.darkenColor(palette[300], 0.2),   // Dark accent variant
                    400: this.darkenColor(palette[400], 0.1),   // Medium dark accent
                    500: palette[500],                         // Main accent color (keep vibrant)
                    600: palette[600],                         // Light accent variant
                    700: palette[700],                         // Lighter for contrast
                    800: palette[800],                         // Light elements
                    900: this.lightenColor(palette[900], 0.1), // Very light for text
                    1000: this.lightenColor(palette[1000], 0.2) // Lightest for high contrast
                };
            }
        }

        // Utility functions for color adjustment
        lightenColor(color, percent) {
            // Convert hex color to RGB, lighten, and convert back
            if (!color || typeof color !== 'string' || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
                return color;
            }

            // Remove # and convert to RGB
            const hex = color.slice(1);
            let r = parseInt(hex.slice(0, 2), 16);
            let g = parseInt(hex.slice(2, 4), 16);
            let b = parseInt(hex.slice(4, 6), 16);

            // Lighten each channel
            r = Math.min(255, Math.round(r + (255 - r) * percent));
            g = Math.min(255, Math.round(g + (255 - g) * percent));
            b = Math.min(255, Math.round(b + (255 - b) * percent));

            // Convert back to hex
            return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
        }

        darkenColor(color, percent) {
            // Convert hex color to RGB, darken, and convert back
            if (!color || typeof color !== 'string' || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
                return color;
            }

            // Remove # and convert to RGB
            const hex = color.slice(1);
            let r = parseInt(hex.slice(0, 2), 16);
            let g = parseInt(hex.slice(2, 4), 16);
            let b = parseInt(hex.slice(4, 6), 16);

            // Darken each channel
            r = Math.max(0, Math.round(r * (1 - percent)));
            g = Math.max(0, Math.round(g * (1 - percent)));
            b = Math.max(0, Math.round(b * (1 - percent)));

            // Convert back to hex
            return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
        }

        // Apply color scheme to the page
        applyColorScheme(colorScheme) {
            if (!colorScheme || !colorScheme.palette) return;

            this.currentColorScheme = colorScheme;

            // Add smooth transition class to body for smooth color changes
            document.body.classList.add('hmt-theme-transitioning');

            // Dispatch custom event for other modules to listen
            const event = new CustomEvent('hmtThemeColorChanged', {
                detail: colorScheme
            });
            (window.top || window).document.dispatchEvent(event);

            // Notify callbacks
            this.colorChangeCallbacks.forEach(callback => {
                try {
                    callback(colorScheme);
                } catch (error) {
                    debugLog('Error in color scheme change callback:', error);
                }
            });

            // Remove transition class after animation completes
            setTimeout(() => {
                document.body.classList.remove('hmt-theme-transitioning');
            }, 800);
        }

        // Get current color scheme
        getCurrentColorScheme() {
            return this.currentColorScheme;
        }

        // Listen for color scheme changes
        onColorSchemeChange(callback) {
            if (typeof callback === 'function') {
                this.colorChangeCallbacks.push(callback);
            }
        }

        // Update color scheme when theme changes (with caching for performance)
        updateColorScheme(baseColor = null) {
            const currentTheme = this.themeDetector.getCurrentTheme();
            const colorToUse = baseColor || (window.HMTConfig && window.HMTConfig.getDefaultColor ?
                window.HMTConfig.getDefaultColor() : '#6c5ce7');

            // Create cache key for this color+theme combination
            const cacheKey = `${colorToUse}_${currentTheme}`;

            // Check if we already have this color scheme cached
            if (this.colorSchemeCache && this.colorSchemeCache[cacheKey]) {
                debugLog('Using cached color scheme for:', cacheKey);
                this.applyColorScheme(this.colorSchemeCache[cacheKey]);
                return;
            }

            const colorScheme = this.generateColorScheme(colorToUse, currentTheme);
            if (colorScheme) {
                // Cache the color scheme for future use
                if (!this.colorSchemeCache) {
                    this.colorSchemeCache = {};
                }
                this.colorSchemeCache[cacheKey] = colorScheme;

                // Limit cache size to prevent memory leaks
                const cacheKeys = Object.keys(this.colorSchemeCache);
                if (cacheKeys.length > 10) {
                    delete this.colorSchemeCache[cacheKeys[0]];
                }

                this.applyColorScheme(colorScheme);
            }
        }
    }

    // Create color manager instance
    const colorManager = new ThemeColorManager(themeDetector);

    // Listen for theme changes and update colors accordingly
    themeDetector.onThemeChange((newTheme, oldTheme) => {
        debugLog('Theme changed from', oldTheme, 'to', newTheme, '- updating color scheme');
        colorManager.updateColorScheme();
    });

    // Expose to window for external access
    window.ThemeDetector = {
        getCurrentTheme: () => themeDetector.getCurrentTheme(),
        isDark: () => themeDetector.isDark(),
        isLight: () => themeDetector.isLight(),
        onThemeChange: (callback) => themeDetector.onThemeChange(callback),
        offThemeChange: (callback) => themeDetector.offThemeChange(callback),
        refresh: () => themeDetector.refresh(),
        instance: themeDetector,

        // Color management functions
        generateColorScheme: (baseColor, theme) => colorManager.generateColorScheme(baseColor, theme),
        applyColorScheme: (colorScheme) => colorManager.applyColorScheme(colorScheme),
        getCurrentColorScheme: () => colorManager.getCurrentColorScheme(),
        onColorSchemeChange: (callback) => colorManager.onColorSchemeChange(callback),
        updateColorScheme: (baseColor) => colorManager.updateColorScheme(baseColor)
    };

    debugLog('ThemeDetector module loaded and available as window.ThemeDetector');

})();