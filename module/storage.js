/**
 * Storage management utilities for HakoMonetTheme
 * @version 2.9.9
 */
(function() {
    'use strict';

    const StorageManager = {
        /**
         * Storage keys constants
         */
        KEYS: {
            DEBUG_MODE: 'debug_mode',
            AUTO_UPDATE_CHECK: 'auto_update_check',
            LAST_UPDATE_CHECK: 'last_update_check',
            USER_PREFERENCES: 'user_preferences',
            THEME_SETTINGS: 'theme_settings',
            PERFORMANCE_METRICS: 'performance_metrics'
        },

        /**
         * Get value from storage with type validation
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default value
         * @param {string} type - Expected type ('string', 'number', 'boolean', 'object')
         * @returns {*} Retrieved value or default
         */
        get: function(key, defaultValue = null, type = null) {
            try {
                let value;

                if (typeof GM_getValue !== 'undefined') {
                    value = GM_getValue(key, defaultValue);
                } else {
                    // Fallback to localStorage
                    const stored = localStorage.getItem(`hmt_${key}`);
                    value = stored !== null ? JSON.parse(stored) : defaultValue;
                }

                // Type validation
                if (type && value !== null && typeof value !== type) {
                    HakoMonetUtils.Logger.warn(`Type mismatch for key ${key}: expected ${type}, got ${typeof value}`);
                    return defaultValue;
                }

                HakoMonetUtils.Logger.debug(`Retrieved storage value: ${key}`);
                return value;
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to get storage value for key ${key}:`, error);
                return defaultValue;
            }
        },

        /**
         * Set value in storage with validation
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         * @param {boolean} compress - Whether to compress large objects
         * @returns {boolean} Success status
         */
        set: function(key, value, compress = false) {
            try {
                // Validate value
                if (value === undefined) {
                    HakoMonetUtils.Logger.warn(`Attempted to store undefined value for key ${key}`);
                    return false;
                }

                // Compress large objects if requested
                let storedValue = value;
                if (compress && typeof value === 'object' && value !== null) {
                    storedValue = this.compressObject(value);
                }

                if (typeof GM_setValue !== 'undefined') {
                    GM_setValue(key, storedValue);
                } else {
                    // Fallback to localStorage
                    localStorage.setItem(`hmt_${key}`, JSON.stringify(storedValue));
                }

                HakoMonetUtils.Logger.debug(`Stored value for key: ${key}`);
                return true;
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to set storage value for key ${key}:`, error);
                return false;
            }
        },

        /**
         * Delete value from storage
         * @param {string} key - Storage key
         * @returns {boolean} Success status
         */
        delete: function(key) {
            try {
                if (typeof GM_deleteValue !== 'undefined') {
                    GM_deleteValue(key);
                } else {
                    localStorage.removeItem(`hmt_${key}`);
                }

                HakoMonetUtils.Logger.debug(`Deleted storage value for key: ${key}`);
                return true;
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to delete storage value for key ${key}:`, error);
                return false;
            }
        },

        /**
         * Check if key exists in storage
         * @param {string} key - Storage key
         * @returns {boolean} True if key exists
         */
        exists: function(key) {
            try {
                if (typeof GM_getValue !== 'undefined') {
                    // GM_getValue returns the default value if key doesn't exist
                    const testValue = {};
                    const result = GM_getValue(key, testValue);
                    return result !== testValue;
                } else {
                    return localStorage.getItem(`hmt_${key}`) !== null;
                }
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to check existence of key ${key}:`, error);
                return false;
            }
        },

        /**
         * Get all storage keys
         * @returns {Array} Array of storage keys
         */
        getAllKeys: function() {
            try {
                if (typeof GM_listValues !== 'undefined') {
                    return GM_listValues();
                } else {
                    // Fallback: get all localStorage keys with hmt_ prefix
                    const keys = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('hmt_')) {
                            keys.push(key.substring(4)); // Remove hmt_ prefix
                        }
                    }
                    return keys;
                }
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to get all storage keys:', error);
                return [];
            }
        },

        /**
         * Clear all storage values
         * @returns {boolean} Success status
         */
        clear: function() {
            try {
                if (typeof GM_listValues !== 'undefined' && typeof GM_deleteValue !== 'undefined') {
                    const keys = GM_listValues();
                    keys.forEach(key => GM_deleteValue(key));
                } else {
                    // Fallback: clear localStorage keys with hmt_ prefix
                    const keys = this.getAllKeys();
                    keys.forEach(key => localStorage.removeItem(`hmt_${key}`));
                }

                HakoMonetUtils.Logger.info('Cleared all storage values');
                return true;
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to clear storage:', error);
                return false;
            }
        },

        /**
         * Compress object for storage (simple implementation)
         * @param {Object} obj - Object to compress
         * @returns {string} Compressed string
         */
        compressObject: function(obj) {
            try {
                // Simple compression by removing unnecessary whitespace
                return JSON.stringify(obj);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to compress object:', error);
                return obj;
            }
        },

        /**
         * Decompress object from storage
         * @param {string} compressed - Compressed string
         * @returns {Object} Decompressed object
         */
        decompressObject: function(compressed) {
            try {
                return JSON.parse(compressed);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to decompress object:', error);
                return null;
            }
        },

        /**
         * Get user preferences
         * @returns {Object} User preferences object
         */
        getUserPreferences: function() {
            return this.get(this.KEYS.USER_PREFERENCES, {
                theme: 'auto',
                animations: true,
                notifications: true,
                performance: 'balanced'
            }, 'object');
        },

        /**
         * Set user preferences
         * @param {Object} preferences - User preferences object
         * @returns {boolean} Success status
         */
        setUserPreferences: function(preferences) {
            return this.set(this.KEYS.USER_PREFERENCES, preferences);
        },

        /**
         * Get theme settings
         * @returns {Object} Theme settings object
         */
        getThemeSettings: function() {
            return this.get(this.KEYS.THEME_SETTINGS, {
                primaryColor: null,
                enableMonet: true,
                customPalette: null
            }, 'object');
        },

        /**
         * Set theme settings
         * @param {Object} settings - Theme settings object
         * @returns {boolean} Success status
         */
        setThemeSettings: function(settings) {
            return this.set(this.KEYS.THEME_SETTINGS, settings);
        },

        /**
         * Record performance metric
         * @param {string} metric - Metric name
         * @param {number} value - Metric value
         * @param {string} unit - Metric unit
         */
        recordMetric: function(metric, value, unit = 'ms') {
            try {
                const metrics = this.get(this.KEYS.PERFORMANCE_METRICS, {}, 'object');
                const timestamp = Date.now();

                if (!metrics[metric]) {
                    metrics[metric] = [];
                }

                metrics[metric].push({
                    value: value,
                    unit: unit,
                    timestamp: timestamp
                });

                // Keep only last 100 entries per metric
                if (metrics[metric].length > 100) {
                    metrics[metric] = metrics[metric].slice(-100);
                }

                this.set(this.KEYS.PERFORMANCE_METRICS, metrics);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to record performance metric:', error);
            }
        },

        /**
         * Get performance metrics
         * @param {string} metric - Specific metric name (optional)
         * @returns {Object|Array} Performance metrics
         */
        getMetrics: function(metric = null) {
            const metrics = this.get(this.KEYS.PERFORMANCE_METRICS, {}, 'object');

            if (metric) {
                return metrics[metric] || [];
            }

            return metrics;
        }
    };

    // Export storage manager
    window.HakoMonetStorage = StorageManager;

})();