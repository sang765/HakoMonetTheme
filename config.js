/**
 * Centralized configuration for HakoMonetTheme
 * @version 2.9.9
 */
(function() {
    'use strict';

    // Script metadata
    const SCRIPT_CONFIG = {
        name: 'Hako: Monet Theme',
        version: '2.9.9',
        author: 'SangsDayy',
        description: 'Material You theme for Hako/DocLN',
        namespace: 'https://github.com/sang765',
        homepage: 'https://github.com/sang765/HakoMonetTheme',
        supportURL: 'https://github.com/sang765/HakoMonetTheme/issues'
    };

    // Debug configuration
    const DEBUG_CONFIG = {
        enabled: false, // Set to false for production
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        performance: false // Enable performance monitoring
    };

    // Update configuration
    const UPDATE_CONFIG = {
        checkInterval: 30 * 60 * 1000, // 30 minutes
        autoCheck: true,
        githubRepo: 'https://github.com/sang765/HakoMonetTheme',
        rawUrl: 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/'
    };

    // Feature flags
    const FEATURES = {
        monetTheme: true,
        animations: true,
        tagColors: true,
        corsUnblock: true,
        imageAnalysis: true,
        notifications: true
    };

    // Target domains
    const TARGET_DOMAINS = [
        'docln.sbs',
        'docln.net',
        'ln.hako.vn',
        'i2.hako.vip',
        'hako.vn'
    ];

    // Export configuration
    window.HakoMonetConfig = {
        SCRIPT: SCRIPT_CONFIG,
        DEBUG: DEBUG_CONFIG,
        UPDATE: UPDATE_CONFIG,
        FEATURES: FEATURES,
        DOMAINS: TARGET_DOMAINS,

        // Utility methods
        isDebugEnabled: function() {
            return this.DEBUG.enabled;
        },

        isFeatureEnabled: function(feature) {
            return this.FEATURES[feature] === true;
        },

        isTargetDomain: function(url) {
            if (!url) return false;
            return this.DOMAINS.some(domain => url.includes(domain));
        },

        getLogLevel: function() {
            return this.DEBUG.logLevel;
        }
    };

    // Initialize configuration
    if (typeof GM_getValue !== 'undefined') {
        // Load user preferences from storage
        window.HakoMonetConfig.DEBUG.enabled = GM_getValue('debug_mode', window.HakoMonetConfig.DEBUG.enabled);
        window.HakoMonetConfig.UPDATE.autoCheck = GM_getValue('auto_update_check', window.HakoMonetConfig.UPDATE.autoCheck);
    }

})();