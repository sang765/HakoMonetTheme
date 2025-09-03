/**
 * General utility functions for HakoMonetTheme
 * @version 2.9.9
 */
(function() {
    'use strict';

    // Logger utility
    const Logger = {
        levels: {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        },

        log: function(level, ...args) {
            if (!window.HakoMonetConfig || !window.HakoMonetConfig.isDebugEnabled()) {
                return;
            }

            const currentLevel = this.levels[window.HakoMonetConfig.getLogLevel()] || this.levels.info;
            const messageLevel = this.levels[level] || this.levels.info;

            if (messageLevel >= currentLevel) {
                const prefix = `[${window.HakoMonetConfig.SCRIPT.name}]`;
                switch (level) {
                    case 'debug':
                        console.debug(prefix, ...args);
                        break;
                    case 'info':
                        console.info(prefix, ...args);
                        break;
                    case 'warn':
                        console.warn(prefix, ...args);
                        break;
                    case 'error':
                        console.error(prefix, ...args);
                        break;
                    default:
                        console.log(prefix, ...args);
                }
            }
        },

        debug: function(...args) { this.log('debug', ...args); },
        info: function(...args) { this.log('info', ...args); },
        warn: function(...args) { this.log('warn', ...args); },
        error: function(...args) { this.log('error', ...args); }
    };

    // DOM utilities
    const DOMUtils = {
        /**
         * Safely query a single element
         * @param {string} selector - CSS selector
         * @param {Element} context - Context element (default: document)
         * @returns {Element|null}
         */
        query: function(selector, context = document) {
            try {
                return context.querySelector(selector);
            } catch (error) {
                Logger.error('Invalid selector:', selector, error);
                return null;
            }
        },

        /**
         * Safely query multiple elements
         * @param {string} selector - CSS selector
         * @param {Element} context - Context element (default: document)
         * @returns {NodeList}
         */
        queryAll: function(selector, context = document) {
            try {
                return context.querySelectorAll(selector);
            } catch (error) {
                Logger.error('Invalid selector:', selector, error);
                return [];
            }
        },

        /**
         * Add CSS styles to document head
         * @param {string} css - CSS content
         * @param {string} id - Optional ID for the style element
         */
        addStyle: function(css, id = null) {
            try {
                const style = document.createElement('style');
                style.textContent = css;
                if (id) {
                    style.id = id;
                }
                document.head.appendChild(style);
                Logger.debug('Added CSS styles', id ? `with ID: ${id}` : '');
            } catch (error) {
                Logger.error('Failed to add CSS styles:', error);
            }
        },

        /**
         * Remove CSS styles by ID
         * @param {string} id - Style element ID
         */
        removeStyle: function(id) {
            try {
                const style = document.getElementById(id);
                if (style) {
                    style.remove();
                    Logger.debug('Removed CSS styles with ID:', id);
                }
            } catch (error) {
                Logger.error('Failed to remove CSS styles:', error);
            }
        },

        /**
         * Wait for element to appear in DOM
         * @param {string} selector - CSS selector
         * @param {number} timeout - Timeout in milliseconds
         * @returns {Promise<Element>}
         */
        waitForElement: function(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const element = this.query(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver(() => {
                    const element = this.query(selector);
                    if (element) {
                        observer.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        }
    };

    // Storage utilities
    const StorageUtils = {
        /**
         * Safely get value from storage
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default value if key doesn't exist
         * @returns {*}
         */
        get: function(key, defaultValue = null) {
            try {
                if (typeof GM_getValue !== 'undefined') {
                    return GM_getValue(key, defaultValue);
                }
                // Fallback to localStorage
                const value = localStorage.getItem(key);
                return value !== null ? JSON.parse(value) : defaultValue;
            } catch (error) {
                Logger.error('Failed to get storage value:', key, error);
                return defaultValue;
            }
        },

        /**
         * Safely set value in storage
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         */
        set: function(key, value) {
            try {
                if (typeof GM_setValue !== 'undefined') {
                    GM_setValue(key, value);
                } else {
                    // Fallback to localStorage
                    localStorage.setItem(key, JSON.stringify(value));
                }
                Logger.debug('Stored value:', key);
            } catch (error) {
                Logger.error('Failed to set storage value:', key, error);
            }
        },

        /**
         * Delete value from storage
         * @param {string} key - Storage key
         */
        delete: function(key) {
            try {
                if (typeof GM_deleteValue !== 'undefined') {
                    GM_deleteValue(key);
                } else {
                    localStorage.removeItem(key);
                }
                Logger.debug('Deleted storage value:', key);
            } catch (error) {
                Logger.error('Failed to delete storage value:', key, error);
            }
        }
    };

    // Network utilities
    const NetworkUtils = {
        /**
         * Make a safe XMLHttpRequest
         * @param {Object} options - Request options
         * @returns {Promise}
         */
        request: function(options) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.onload = function() {
                    if (this.status >= 200 && this.status < 300) {
                        resolve({
                            status: this.status,
                            responseText: this.responseText,
                            response: this.response
                        });
                    } else {
                        reject(new Error(`HTTP ${this.status}: ${this.statusText}`));
                    }
                };

                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };

                xhr.ontimeout = function() {
                    reject(new Error('Request timeout'));
                };

                xhr.open(options.method || 'GET', options.url);
                xhr.timeout = options.timeout || 10000;

                if (options.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }

                xhr.send(options.data || null);
            });
        }
    };

    // Export utilities
    window.HakoMonetUtils = {
        Logger: Logger,
        DOM: DOMUtils,
        Storage: StorageUtils,
        Network: NetworkUtils,

        // Convenience methods
        debug: Logger.debug.bind(Logger),
        info: Logger.info.bind(Logger),
        warn: Logger.warn.bind(Logger),
        error: Logger.error.bind(Logger)
    };

})();