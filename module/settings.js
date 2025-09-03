/**
 * Settings management for HakoMonetTheme
 * @version 2.9.9
 */
(function() {
    'use strict';

    const SettingsManager = {
        /**
         * Settings categories
         */
        CATEGORIES: {
            GENERAL: 'general',
            THEME: 'theme',
            PERFORMANCE: 'performance',
            ADVANCED: 'advanced'
        },

        /**
         * Default settings
         */
        DEFAULTS: {
            [this.CATEGORIES.GENERAL]: {
                debugMode: false,
                autoUpdateCheck: true,
                notifications: true,
                language: 'auto'
            },
            [this.CATEGORIES.THEME]: {
                enableMonetTheme: true,
                enableAnimations: true,
                enableTagColors: true,
                primaryColor: null,
                themeMode: 'auto', // 'light', 'dark', 'auto'
                customPalette: null
            },
            [this.CATEGORIES.PERFORMANCE]: {
                enableImageAnalysis: true,
                analysisQuality: 'balanced', // 'fast', 'balanced', 'high'
                cacheImages: true,
                lazyLoadModules: false,
                enableMetrics: false
            },
            [this.CATEGORIES.ADVANCED]: {
                corsUnblock: true,
                customCSS: '',
                experimentalFeatures: false,
                developerMode: false
            }
        },

        /**
         * Initialize settings
         */
        init: function() {
            HakoMonetUtils.Logger.info('Initializing settings manager');

            // Load settings from storage
            this.loadSettings();

            // Apply current settings
            this.applySettings();

            HakoMonetUtils.Logger.info('Settings manager initialized');
        },

        /**
         * Load settings from storage
         */
        loadSettings: function() {
            try {
                const stored = HakoMonetStorage.getUserPreferences();

                // Merge stored settings with defaults
                this.settings = this.mergeSettings(this.DEFAULTS, stored);

                HakoMonetUtils.Logger.debug('Settings loaded from storage');
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to load settings:', error);
                this.settings = JSON.parse(JSON.stringify(this.DEFAULTS)); // Deep copy defaults
            }
        },

        /**
         * Save settings to storage
         */
        saveSettings: function() {
            try {
                HakoMonetStorage.setUserPreferences(this.settings);
                HakoMonetUtils.Logger.debug('Settings saved to storage');
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to save settings:', error);
            }
        },

        /**
         * Get setting value
         * @param {string} category - Settings category
         * @param {string} key - Setting key
         * @param {*} defaultValue - Default value if not found
         * @returns {*} Setting value
         */
        get: function(category, key, defaultValue = null) {
            try {
                if (!this.settings[category]) {
                    HakoMonetUtils.Logger.warn(`Unknown settings category: ${category}`);
                    return defaultValue;
                }

                return this.settings[category][key] !== undefined ?
                    this.settings[category][key] : defaultValue;
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to get setting ${category}.${key}:`, error);
                return defaultValue;
            }
        },

        /**
         * Set setting value
         * @param {string} category - Settings category
         * @param {string} key - Setting key
         * @param {*} value - Setting value
         * @param {boolean} save - Whether to save immediately
         */
        set: function(category, key, value, save = true) {
            try {
                if (!this.settings[category]) {
                    HakoMonetUtils.Logger.warn(`Unknown settings category: ${category}`);
                    return;
                }

                this.settings[category][key] = value;
                HakoMonetUtils.Logger.debug(`Setting updated: ${category}.${key} = ${value}`);

                if (save) {
                    this.saveSettings();
                }

                // Apply setting change
                this.applySettingChange(category, key, value);
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to set setting ${category}.${key}:`, error);
            }
        },

        /**
         * Get all settings for a category
         * @param {string} category - Settings category
         * @returns {Object} Category settings
         */
        getCategory: function(category) {
            return this.settings[category] || {};
        },

        /**
         * Set multiple settings for a category
         * @param {string} category - Settings category
         * @param {Object} settings - Settings object
         * @param {boolean} save - Whether to save immediately
         */
        setCategory: function(category, settings, save = true) {
            try {
                if (!this.settings[category]) {
                    HakoMonetUtils.Logger.warn(`Unknown settings category: ${category}`);
                    return;
                }

                Object.assign(this.settings[category], settings);
                HakoMonetUtils.Logger.debug(`Category settings updated: ${category}`);

                if (save) {
                    this.saveSettings();
                }

                // Apply all setting changes
                Object.keys(settings).forEach(key => {
                    this.applySettingChange(category, key, settings[key]);
                });
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to set category settings ${category}:`, error);
            }
        },

        /**
         * Reset settings to defaults
         * @param {string} category - Specific category to reset (optional)
         */
        reset: function(category = null) {
            try {
                if (category) {
                    if (!this.DEFAULTS[category]) {
                        HakoMonetUtils.Logger.warn(`Unknown settings category: ${category}`);
                        return;
                    }

                    this.settings[category] = JSON.parse(JSON.stringify(this.DEFAULTS[category]));
                    HakoMonetUtils.Logger.info(`Reset settings for category: ${category}`);
                } else {
                    this.settings = JSON.parse(JSON.stringify(this.DEFAULTS));
                    HakoMonetUtils.Logger.info('Reset all settings to defaults');
                }

                this.saveSettings();
                this.applySettings();
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to reset settings:', error);
            }
        },

        /**
         * Export settings as JSON string
         * @returns {string} JSON string of settings
         */
        export: function() {
            try {
                return JSON.stringify(this.settings, null, 2);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to export settings:', error);
                return '{}';
            }
        },

        /**
         * Import settings from JSON string
         * @param {string} jsonString - JSON string of settings
         * @returns {boolean} Success status
         */
        import: function(jsonString) {
            try {
                const imported = JSON.parse(jsonString);

                // Validate imported settings
                if (!this.validateSettings(imported)) {
                    HakoMonetUtils.Logger.error('Invalid settings format');
                    return false;
                }

                this.settings = this.mergeSettings(this.DEFAULTS, imported);
                this.saveSettings();
                this.applySettings();

                HakoMonetUtils.Logger.info('Settings imported successfully');
                return true;
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to import settings:', error);
                return false;
            }
        },

        /**
         * Apply all current settings
         */
        applySettings: function() {
            try {
                // Apply debug mode
                if (window.HakoMonetConfig) {
                    window.HakoMonetConfig.DEBUG.enabled = this.get(this.CATEGORIES.GENERAL, 'debugMode', false);
                }

                // Apply theme settings
                this.applyThemeSettings();

                // Apply performance settings
                this.applyPerformanceSettings();

                HakoMonetUtils.Logger.debug('All settings applied');
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to apply settings:', error);
            }
        },

        /**
         * Apply theme-related settings
         */
        applyThemeSettings: function() {
            const themeSettings = this.getCategory(this.CATEGORIES.THEME);

            // Update feature flags
            if (window.HakoMonetConfig) {
                window.HakoMonetConfig.FEATURES.monetTheme = themeSettings.enableMonetTheme;
                window.HakoMonetConfig.FEATURES.animations = themeSettings.enableAnimations;
                window.HakoMonetConfig.FEATURES.tagColors = themeSettings.enableTagColors;
            }
        },

        /**
         * Apply performance-related settings
         */
        applyPerformanceSettings: function() {
            const perfSettings = this.getCategory(this.CATEGORIES.PERFORMANCE);

            // Apply performance settings to relevant modules
            if (window.HakoMonetStorage) {
                window.HakoMonetStorage.set('performance_settings', perfSettings);
            }
        },

        /**
         * Apply individual setting change
         * @param {string} category - Settings category
         * @param {string} key - Setting key
         * @param {*} value - Setting value
         */
        applySettingChange: function(category, key, value) {
            // Handle specific setting changes
            switch (`${category}.${key}`) {
                case 'general.debugMode':
                    if (window.HakoMonetConfig) {
                        window.HakoMonetConfig.DEBUG.enabled = value;
                    }
                    break;

                case 'theme.enableMonetTheme':
                    // Trigger theme refresh if needed
                    if (window.HakoMonetTheme && typeof window.HakoMonetTheme.refresh === 'function') {
                        window.HakoMonetTheme.refresh();
                    }
                    break;

                case 'performance.enableMetrics':
                    // Enable/disable performance monitoring
                    if (value && window.HakoMonetStorage) {
                        window.HakoMonetStorage.recordMetric('settings_changed', Date.now());
                    }
                    break;
            }
        },

        /**
         * Merge settings objects
         * @param {Object} defaults - Default settings
         * @param {Object} overrides - Override settings
         * @returns {Object} Merged settings
         */
        mergeSettings: function(defaults, overrides) {
            const result = JSON.parse(JSON.stringify(defaults)); // Deep copy

            Object.keys(overrides).forEach(category => {
                if (result[category] && typeof overrides[category] === 'object') {
                    Object.assign(result[category], overrides[category]);
                }
            });

            return result;
        },

        /**
         * Validate settings object
         * @param {Object} settings - Settings to validate
         * @returns {boolean} True if valid
         */
        validateSettings: function(settings) {
            if (!settings || typeof settings !== 'object') return false;

            // Check required categories
            const requiredCategories = Object.values(this.CATEGORIES);
            for (const category of requiredCategories) {
                if (!settings[category] || typeof settings[category] !== 'object') {
                    return false;
                }
            }

            return true;
        },

        /**
         * Get settings summary for debugging
         * @returns {Object} Settings summary
         */
        getSummary: function() {
            const summary = {};

            Object.keys(this.CATEGORIES).forEach(catKey => {
                const category = this.CATEGORIES[catKey];
                summary[category] = Object.keys(this.settings[category] || {});
            });

            return summary;
        }
    };

    // Initialize settings when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SettingsManager.init());
    } else {
        SettingsManager.init();
    }

    // Export settings manager
    window.HakoMonetSettings = SettingsManager;

})();