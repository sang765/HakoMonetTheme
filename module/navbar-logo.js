(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[NavbarLogo]', ...args);
        }
    }

    /**
     * Module for updating navbar logo with SVG and color customization
     */
    class NavbarLogoManager {
        constructor() {
            this.originalStyles = new Map();
            this.preloadedImages = new Map();
        }

        /**
         * Preload an SVG image and return a Promise
         * @param {string} svgPath - Path to the SVG file
         * @returns {Promise<Image>} Promise that resolves with loaded Image object
         */
        preloadSVG(svgPath) {
            return new Promise((resolve, reject) => {
                if (this.preloadedImages.has(svgPath)) {
                    resolve(this.preloadedImages.get(svgPath));
                    return;
                }

                const img = new Image();
                img.onload = () => {
                    this.preloadedImages.set(svgPath, img);
                    debugLog(`Preloaded SVG: ${svgPath}`);
                    resolve(img);
                };
                img.onerror = (error) => {
                    debugLog(`Failed to preload SVG: ${svgPath}`, error);
                    reject(new Error(`Failed to load SVG: ${svgPath}`));
                };
                img.src = svgPath;
            });
        }

        /**
         * Fetch SVG content and modify colors
         * @param {string} svgPath - Path to the SVG file
         * @param {string} color - Color to apply (hex, rgb, or CSS variable)
         * @returns {Promise<string>} Promise that resolves with modified SVG data URL
         */
        async fetchAndModifySVG(svgPath, color) {
            try {
                // For userscript, we can use GM_xmlhttpRequest to fetch the SVG
                const response = await this.fetchSVGContent(svgPath);
                let svgContent = response;

                // Modify fill colors in SVG
                if (color) {
                    svgContent = this.modifySVGColors(svgContent, color);
                }

                // Convert to data URL
                const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
                return dataUrl;
            } catch (error) {
                debugLog(`Error fetching/modifying SVG: ${svgPath}`, error);
                throw error;
            }
        }

        /**
         * Fetch SVG content using GM_xmlhttpRequest
         * @param {string} svgPath - Path to the SVG file
         * @returns {Promise<string>} Promise that resolves with SVG content
         */
        fetchSVGContent(svgPath) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: svgPath,
                    onload: (response) => {
                        if (response.status === 200) {
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
                        }
                    },
                    onerror: (error) => {
                        reject(new Error(`Network error: ${error}`));
                    }
                });
            });
        }

        /**
         * Modify fill colors in SVG content
         * @param {string} svgContent - Original SVG content
         * @param {string} color - New color to apply (can be CSS variable or hex)
         * @returns {string} Modified SVG content
         */
        modifySVGColors(svgContent, color) {
            // Replace fill attributes with the new color
            // This is a simple replacement - for more complex SVGs, you might need more sophisticated parsing
            const colorRegex = /fill="[^"]*"/g;
            return svgContent.replace(colorRegex, `fill="${color}"`);
        }

        /**
         * Get current theme color from CSS variables or config
         * @returns {string} Current theme color
         */
        getCurrentThemeColor() {
            // Try to get from CSS variables first
            const computedStyle = getComputedStyle(document.documentElement);
            const monetPrimary = computedStyle.getPropertyValue('--monet-primary').trim();

            if (monetPrimary && monetPrimary !== '') {
                debugLog('Using color from CSS variable --monet-primary:', monetPrimary);
                return monetPrimary;
            }

            // Fallback to config color
            if (window.HMTConfig && window.HMTConfig.getDefaultColor) {
                const configColor = window.HMTConfig.getDefaultColor();
                debugLog('Using color from config:', configColor);
                return configColor;
            }

            // Final fallback
            const fallbackColor = '#00B490';
            debugLog('Using fallback color:', fallbackColor);
            return fallbackColor;
        }

        /**
         * Get color mode (default or thumbnail)
         * @returns {string} Color mode
         */
        getColorMode() {
            if (window.HMTConfig && window.HMTConfig.getColorMode) {
                return window.HMTConfig.getColorMode();
            }
            return 'default';
        }

        /**
         * Check if we're on a story info page
         * @returns {boolean} True if on story info page
         */
        isOnStoryInfoPage() {
            return document.querySelector('div.col-4.col-md.feature-item.width-auto-xl') !== null;
        }

        /**
         * Get dominant color from current page's thumbnail (if available)
         * @returns {Promise<string|null>} Promise that resolves with dominant color or null
         */
        async getThumbnailColor() {
            if (!this.isOnStoryInfoPage()) {
                return null;
            }

            const coverElement = document.querySelector('.series-cover .img-in-ratio');
            if (!coverElement) {
                return null;
            }

            const coverStyle = coverElement.style.backgroundImage;
            const coverUrl = coverStyle.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');

            if (!coverUrl) {
                return null;
            }

            try {
                // Use the same color analysis as the colors modules
                const dominantColor = await this.analyzeImageColorTraditionalAccent(coverUrl);
                debugLog('Got thumbnail color:', dominantColor);
                return dominantColor;
            } catch (error) {
                debugLog('Error getting thumbnail color:', error);
                return null;
            }
        }

        /**
         * Analyze image color using traditional accent method (copied from colors modules)
         * @param {string} imageUrl - URL of the image to analyze
         * @returns {Promise<string>} Promise that resolves with dominant color
         */
        analyzeImageColorTraditionalAccent(imageUrl) {
            return new Promise((resolve, reject) => {
                const img = new Image();

                // Set crossOrigin if needed
                const targetDomains = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];
                if (targetDomains.some(domain => imageUrl.includes(domain))) {
                    img.crossOrigin = 'anonymous';
                }

                img.onload = function() {
                    try {
                        const dominantColor = getTraditionalAccentColorFromImage(img);
                        resolve(dominantColor);
                    } catch (error) {
                        reject('Error analyzing image: ' + error);
                    }
                };

                img.onerror = function(error) {
                    reject('Cannot load image');
                };

                img.src = imageUrl;
            });

            // Helper function for color analysis
            function getTraditionalAccentColorFromImage(img) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const width = 200;
                const height = 200;
                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;

                const colorCount = {};
                let maxCount = 0;
                let dominantColor = '#00B490';

                // Traditional accent ranges
                const traditionalAccentRanges = [
                    {min: [120, 0, 0], max: [255, 100, 100], weight: 1.8}, // Red
                    {min: [200, 80, 0], max: [255, 165, 50], weight: 1.7}, // Orange
                    {min: [180, 150, 0], max: [240, 220, 100], weight: 1.5}, // Yellow
                    {min: [0, 100, 0], max: [100, 255, 100], weight: 1.6}, // Green
                    {min: [0, 0, 120], max: [100, 100, 255], weight: 1.8}, // Blue
                    {min: [100, 0, 100], max: [200, 100, 200], weight: 1.7}, // Purple
                    {min: [200, 100, 150], max: [255, 180, 200], weight: 1.6} // Pink
                ];

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    if (a < 128) continue;

                    const brightness = (r + g + b) / 3;
                    if (brightness > 240 || brightness < 15) continue;

                    const maxChannel = Math.max(r, g, b);
                    const minChannel = Math.min(r, g, b);
                    const saturation = maxChannel - minChannel;

                    if (saturation < 30) continue;

                    const roundedR = Math.round(r / 8) * 8;
                    const roundedG = Math.round(g / 8) * 8;
                    const roundedB = Math.round(b / 8) * 8;

                    const colorGroup = `${roundedR},${roundedG},${roundedB}`;

                    let weight = 1.0;
                    for (const accentRange of traditionalAccentRanges) {
                        if (roundedR >= accentRange.min[0] && roundedR <= accentRange.max[0] &&
                            roundedG >= accentRange.min[1] && roundedG <= accentRange.max[1] &&
                            roundedB >= accentRange.min[2] && roundedB <= accentRange.max[2]) {
                            weight = accentRange.weight;
                            break;
                        }
                    }

                    const normalizedSaturation = saturation / 255;
                    weight *= (0.5 + normalizedSaturation * 0.5);

                    const weightedCount = Math.round(weight);

                    if (colorCount[colorGroup]) {
                        colorCount[colorGroup] += weightedCount;
                    } else {
                        colorCount[colorGroup] = weightedCount;
                    }

                    if (colorCount[colorGroup] > maxCount) {
                        maxCount = colorCount[colorGroup];
                        dominantColor = `rgb(${roundedR}, ${roundedG}, ${roundedB})`;
                    }
                }

                return dominantColor;
            }
        }

        /**
         * Store original styles for revert functionality
         * @param {Element} element - DOM element
         */
        storeOriginalStyle(element) {
            const key = element;
            if (!this.originalStyles.has(key)) {
                this.originalStyles.set(key, {
                    backgroundImage: element.style.backgroundImage,
                    backgroundSize: element.style.backgroundSize,
                    backgroundRepeat: element.style.backgroundRepeat,
                    backgroundPosition: element.style.backgroundPosition
                });
                debugLog('Stored original style for element:', element);
            }
        }

        /**
         * Revert element to original style
         * @param {Element} element - DOM element
         */
        revertToOriginal(element) {
            const key = element;
            const originalStyle = this.originalStyles.get(key);
            if (originalStyle) {
                element.style.backgroundImage = originalStyle.backgroundImage;
                element.style.backgroundSize = originalStyle.backgroundSize;
                element.style.backgroundRepeat = originalStyle.backgroundRepeat;
                element.style.backgroundPosition = originalStyle.backgroundPosition;
                debugLog('Reverted element to original style:', element);
            } else {
                debugLog('No original style found for element:', element);
            }
        }

        /**
         * Update navbar logo for a single element
         * @param {Element} element - The navbar logo element
         * @param {Object} options - Options object
         * @param {string} options.svgPath - Path to SVG file
         * @param {string} options.color - Color to apply
         * @returns {Promise<boolean>} Promise that resolves to true if successful
         */
        async updateSingleElement(element, options = {}) {
            const { svgPath = '@/github/assets/logo-9.svg', color } = options;

            try {
                // Store original style for revert
                this.storeOriginalStyle(element);

                // Preload the SVG
                await this.preloadSVG(svgPath);

                // Fetch and modify SVG
                const modifiedSVGDataUrl = await this.fetchAndModifySVG(svgPath, color);

                // Apply the new background image
                element.style.backgroundImage = `url("${modifiedSVGDataUrl}")`;
                element.style.backgroundSize = 'contain';
                element.style.backgroundRepeat = 'no-repeat';
                element.style.backgroundPosition = 'center';

                debugLog(`Updated navbar logo for element:`, element);
                return true;
            } catch (error) {
                debugLog(`Failed to update navbar logo for element:`, element, error);
                throw error;
            }
        }

        /**
         * Update navbar logos with SVG and optional color customization
         * @param {Object} options - Options object
         * @param {string} options.svgPath - Path to SVG file (default: '@/github/assets/logo-9.svg')
         * @param {string} options.color - Color to apply (hex, rgb, CSS variable, etc.)
         * @param {boolean} options.useThemeColor - If true, use current theme color
         * @param {boolean} options.useThumbnailColor - If true, use thumbnail color (on story pages)
         * @param {Function} options.callback - Callback function called after update
         * @param {boolean} options.revert - If true, revert to original styles
         * @returns {Promise<boolean>} Promise that resolves to true if all updates successful
         */
        async updateNavbarLogo(options = {}) {
            const {
                svgPath = '@/github/assets/logo-9.svg',
                color,
                useThemeColor = false,
                useThumbnailColor = false,
                callback,
                revert = false
            } = options;

            try {
                // Find all navbar logo elements
                const elements = document.querySelectorAll('.navbar-logo');
                if (elements.length === 0) {
                    const error = new Error('No elements with class "navbar-logo" found');
                    debugLog(error.message);
                    if (callback) callback(false, error);
                    throw error;
                }

                if (revert) {
                    // Revert all elements
                    elements.forEach(element => this.revertToOriginal(element));
                    debugLog(`Reverted ${elements.length} navbar logo elements`);
                    if (callback) callback(true);
                    return true;
                }

                // Determine the color to use
                let finalColor = color;

                if (useThumbnailColor) {
                    debugLog('Using thumbnail color mode');
                    const thumbnailColor = await this.getThumbnailColor();
                    if (thumbnailColor) {
                        finalColor = thumbnailColor;
                        debugLog('Using thumbnail color:', finalColor);
                    } else {
                        debugLog('No thumbnail color available, falling back to theme color');
                        finalColor = this.getCurrentThemeColor();
                    }
                } else if (useThemeColor || !finalColor) {
                    debugLog('Using theme color mode');
                    finalColor = this.getCurrentThemeColor();
                }

                debugLog('Final color to apply:', finalColor);

                // Update all elements
                const updatePromises = Array.from(elements).map(element =>
                    this.updateSingleElement(element, { svgPath, color: finalColor })
                );

                await Promise.all(updatePromises);

                debugLog(`Successfully updated ${elements.length} navbar logo elements with color: ${finalColor}`);
                if (callback) callback(true);
                return true;
            } catch (error) {
                debugLog('Error updating navbar logos:', error);
                if (callback) callback(false, error);
                throw error;
            }
        }
    }

    // Create singleton instance
    const navbarLogoManager = new NavbarLogoManager();

    // Export the main function
    window.HMTNavbarLogo = {
        updateNavbarLogo: navbarLogoManager.updateNavbarLogo.bind(navbarLogoManager),
        updateWithThemeColor: function(options = {}) {
            return navbarLogoManager.updateNavbarLogo({ ...options, useThemeColor: true });
        },
        updateWithThumbnailColor: function(options = {}) {
            return navbarLogoManager.updateNavbarLogo({ ...options, useThumbnailColor: true });
        },
        revert: function(options = {}) {
            return navbarLogoManager.updateNavbarLogo({ ...options, revert: true });
        },
        initialize: function() {
            debugLog('Navbar Logo module initialized');
        }
    };

    // Initialize when module loads
    debugLog('Navbar Logo module loaded');

})();