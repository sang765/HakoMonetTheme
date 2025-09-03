/**
 * DOM manipulation utilities for HakoMonetTheme
 * @version 2.9.9
 */
(function() {
    'use strict';

    const DOMUtils = {
        /**
         * Safely add event listener with automatic cleanup tracking
         * @param {Element} element - Target element
         * @param {string} event - Event type
         * @param {Function} handler - Event handler
         * @param {Object} options - Event listener options
         * @returns {Function} Cleanup function
         */
        addEventListener: function(element, event, handler, options = {}) {
            if (!element || !event || !handler) {
                HakoMonetUtils.Logger.warn('Invalid parameters for addEventListener');
                return () => {};
            }

            try {
                element.addEventListener(event, handler, options);

                // Return cleanup function
                return () => {
                    try {
                        element.removeEventListener(event, handler, options);
                    } catch (error) {
                        HakoMonetUtils.Logger.error('Failed to remove event listener:', error);
                    }
                };
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to add event listener:', error);
                return () => {};
            }
        },

        /**
         * Add multiple event listeners at once
         * @param {Element} element - Target element
         * @param {Object} events - Event handlers object {eventType: handler}
         * @param {Object} options - Event listener options
         * @returns {Function} Cleanup function
         */
        addEventListeners: function(element, events, options = {}) {
            if (!element || !events) {
                HakoMonetUtils.Logger.warn('Invalid parameters for addEventListeners');
                return () => {};
            }

            const cleanups = [];

            Object.keys(events).forEach(event => {
                const cleanup = this.addEventListener(element, event, events[event], options);
                cleanups.push(cleanup);
            });

            return () => {
                cleanups.forEach(cleanup => cleanup());
            };
        },

        /**
         * Create element with attributes and content
         * @param {string} tagName - Element tag name
         * @param {Object} attributes - Element attributes
         * @param {string|Element} content - Element content
         * @returns {Element} Created element
         */
        createElement: function(tagName, attributes = {}, content = null) {
            try {
                const element = document.createElement(tagName);

                // Set attributes
                Object.keys(attributes).forEach(attr => {
                    if (attr === 'className') {
                        element.className = attributes[attr];
                    } else if (attr === 'style' && typeof attributes[attr] === 'object') {
                        Object.assign(element.style, attributes[attr]);
                    } else if (attr.startsWith('data-')) {
                        element.setAttribute(attr, attributes[attr]);
                    } else {
                        element[attr] = attributes[attr];
                    }
                });

                // Set content
                if (content) {
                    if (typeof content === 'string') {
                        element.textContent = content;
                    } else if (content instanceof Element) {
                        element.appendChild(content);
                    }
                }

                return element;
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to create element:', tagName, error);
                return null;
            }
        },

        /**
         * Add CSS class to element
         * @param {Element} element - Target element
         * @param {string} className - Class name to add
         */
        addClass: function(element, className) {
            if (!element || !className) return;

            try {
                element.classList.add(className);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to add class:', className, error);
            }
        },

        /**
         * Remove CSS class from element
         * @param {Element} element - Target element
         * @param {string} className - Class name to remove
         */
        removeClass: function(element, className) {
            if (!element || !className) return;

            try {
                element.classList.remove(className);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to remove class:', className, error);
            }
        },

        /**
         * Toggle CSS class on element
         * @param {Element} element - Target element
         * @param {string} className - Class name to toggle
         */
        toggleClass: function(element, className) {
            if (!element || !className) return;

            try {
                element.classList.toggle(className);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to toggle class:', className, error);
            }
        },

        /**
         * Check if element has CSS class
         * @param {Element} element - Target element
         * @param {string} className - Class name to check
         * @returns {boolean} True if element has the class
         */
        hasClass: function(element, className) {
            if (!element || !className) return false;

            try {
                return element.classList.contains(className);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to check class:', className, error);
                return false;
            }
        },

        /**
         * Get element's computed style
         * @param {Element} element - Target element
         * @param {string} property - CSS property name
         * @returns {string} Computed style value
         */
        getComputedStyle: function(element, property) {
            if (!element || !property) return '';

            try {
                const computed = window.getComputedStyle(element);
                return computed.getPropertyValue(property);
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to get computed style:', property, error);
                return '';
            }
        },

        /**
         * Set CSS style on element
         * @param {Element} element - Target element
         * @param {string|Object} property - CSS property or object of properties
         * @param {string} value - CSS value (if property is string)
         */
        setStyle: function(element, property, value) {
            if (!element) return;

            try {
                if (typeof property === 'object') {
                    Object.assign(element.style, property);
                } else if (typeof property === 'string' && value !== undefined) {
                    element.style[property] = value;
                }
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to set style:', property, error);
            }
        },

        /**
         * Get element's bounding rectangle
         * @param {Element} element - Target element
         * @returns {DOMRect|null} Bounding rectangle or null if error
         */
        getBoundingRect: function(element) {
            if (!element) return null;

            try {
                return element.getBoundingClientRect();
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to get bounding rect:', error);
                return null;
            }
        },

        /**
         * Check if element is visible in viewport
         * @param {Element} element - Target element
         * @param {number} threshold - Visibility threshold (0-1)
         * @returns {boolean} True if element is visible
         */
        isVisible: function(element, threshold = 0) {
            if (!element) return false;

            try {
                const rect = this.getBoundingRect(element);
                if (!rect) return false;

                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                const windowWidth = window.innerWidth || document.documentElement.clientWidth;

                const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);

                const visibleArea = Math.max(0, visibleHeight) * Math.max(0, visibleWidth);
                const totalArea = rect.width * rect.height;

                return totalArea > 0 && (visibleArea / totalArea) >= threshold;
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to check visibility:', error);
                return false;
            }
        },

        /**
         * Smooth scroll to element
         * @param {Element} element - Target element
         * @param {Object} options - Scroll options
         */
        scrollTo: function(element, options = {}) {
            if (!element) return;

            try {
                const defaultOptions = {
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                };

                element.scrollIntoView(Object.assign(defaultOptions, options));
            } catch (error) {
                HakoMonetUtils.Logger.error('Failed to scroll to element:', error);
                // Fallback to instant scroll
                try {
                    element.scrollIntoView();
                } catch (fallbackError) {
                    HakoMonetUtils.Logger.error('Fallback scroll also failed:', fallbackError);
                }
            }
        },

        /**
         * Get element by selector with error handling
         * @param {string} selector - CSS selector
         * @param {Element} context - Context element
         * @returns {Element|null} Found element or null
         */
        querySelector: function(selector, context = document) {
            if (!selector) return null;

            try {
                return context.querySelector(selector);
            } catch (error) {
                HakoMonetUtils.Logger.error('Invalid selector:', selector, error);
                return null;
            }
        },

        /**
         * Get elements by selector with error handling
         * @param {string} selector - CSS selector
         * @param {Element} context - Context element
         * @returns {NodeList} Found elements
         */
        querySelectorAll: function(selector, context = document) {
            if (!selector) return [];

            try {
                return context.querySelectorAll(selector);
            } catch (error) {
                HakoMonetUtils.Logger.error('Invalid selector:', selector, error);
                return [];
            }
        }
    };

    // Export DOM utilities
    window.HakoMonetDOMUtils = DOMUtils;

})();