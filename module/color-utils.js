/**
 * Color utility functions for HakoMonetTheme
 * @version 2.9.9
 */
(function() {
    'use strict';

    const ColorUtils = {
        /**
         * Convert RGB values to HEX string
         * @param {number} r - Red component (0-255)
         * @param {number} g - Green component (0-255)
         * @param {number} b - Blue component (0-255)
         * @returns {string} HEX color string
         */
        rgbToHex: function(r, g, b) {
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));

            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        },

        /**
         * Convert HEX string to RGB object
         * @param {string} hex - HEX color string
         * @returns {Object|null} RGB object with r, g, b properties or null if invalid
         */
        hexToRgb: function(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        /**
         * Validate HEX color string
         * @param {string} color - Color string to validate
         * @returns {boolean} True if valid HEX color
         */
        isValidHex: function(color) {
            return /^#([0-9A-F]{3}){1,2}$/i.test(color);
        },

        /**
         * Calculate color brightness/luminance
         * @param {string} color - HEX color string
         * @returns {number} Brightness value (0-255)
         */
        getBrightness: function(color) {
            if (!this.isValidHex(color)) {
                return 0;
            }

            const rgb = this.hexToRgb(color);
            if (!rgb) return 0;

            // Using luminance formula: (0.299*R + 0.587*G + 0.114*B)
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },

        /**
         * Check if color is light
         * @param {string} color - HEX color string
         * @returns {boolean} True if color is light
         */
        isLight: function(color) {
            return this.getBrightness(color) > 128;
        },

        /**
         * Check if color is dark
         * @param {string} color - HEX color string
         * @returns {boolean} True if color is dark
         */
        isDark: function(color) {
            return !this.isLight(color);
        },

        /**
         * Lighten a color by a percentage
         * @param {string} color - HEX color string
         * @param {number} percent - Percentage to lighten (0-100)
         * @returns {string} Lightened HEX color
         */
        lighten: function(color, percent) {
            if (!this.isValidHex(color)) return color;

            const rgb = this.hexToRgb(color);
            if (!rgb) return color;

            const factor = percent / 100;
            const r = Math.round(rgb.r + (255 - rgb.r) * factor);
            const g = Math.round(rgb.g + (255 - rgb.g) * factor);
            const b = Math.round(rgb.b + (255 - rgb.b) * factor);

            return this.rgbToHex(r, g, b);
        },

        /**
         * Darken a color by a percentage
         * @param {string} color - HEX color string
         * @param {number} percent - Percentage to darken (0-100)
         * @returns {string} Darkened HEX color
         */
        darken: function(color, percent) {
            if (!this.isValidHex(color)) return color;

            const rgb = this.hexToRgb(color);
            if (!rgb) return color;

            const factor = percent / 100;
            const r = Math.round(rgb.r * (1 - factor));
            const g = Math.round(rgb.g * (1 - factor));
            const b = Math.round(rgb.b * (1 - factor));

            return this.rgbToHex(r, g, b);
        },

        /**
         * Calculate contrast ratio between two colors
         * @param {string} color1 - First HEX color
         * @param {string} color2 - Second HEX color
         * @returns {number} Contrast ratio
         */
        getContrastRatio: function(color1, color2) {
            const lum1 = this.getLuminance(color1);
            const lum2 = this.getLuminance(color2);

            const brightest = Math.max(lum1, lum2);
            const darkest = Math.min(lum1, lum2);

            return (brightest + 0.05) / (darkest + 0.05);
        },

        /**
         * Calculate relative luminance of a color
         * @param {string} color - HEX color string
         * @returns {number} Relative luminance (0-1)
         */
        getLuminance: function(color) {
            if (!this.isValidHex(color)) return 0;

            const rgb = this.hexToRgb(color);
            if (!rgb) return 0;

            // Convert to linear RGB
            const toLinear = (c) => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            };

            const r = toLinear(rgb.r);
            const g = toLinear(rgb.g);
            const b = toLinear(rgb.b);

            // Calculate luminance
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        },

        /**
         * Check if contrast ratio meets WCAG standards
         * @param {string} color1 - First HEX color
         * @param {string} color2 - Second HEX color
         * @param {string} level - 'AA' or 'AAA'
         * @returns {boolean} True if contrast is sufficient
         */
        hasGoodContrast: function(color1, color2, level = 'AA') {
            const ratio = this.getContrastRatio(color1, color2);
            const threshold = level === 'AAA' ? 7 : 4.5;
            return ratio >= threshold;
        },

        /**
         * Generate a complementary color
         * @param {string} color - HEX color string
         * @returns {string} Complementary HEX color
         */
        getComplementary: function(color) {
            if (!this.isValidHex(color)) return color;

            const rgb = this.hexToRgb(color);
            if (!rgb) return color;

            const r = 255 - rgb.r;
            const g = 255 - rgb.g;
            const b = 255 - rgb.b;

            return this.rgbToHex(r, g, b);
        },

        /**
         * Mix two colors
         * @param {string} color1 - First HEX color
         * @param {string} color2 - Second HEX color
         * @param {number} weight - Weight of first color (0-1)
         * @returns {string} Mixed HEX color
         */
        mix: function(color1, color2, weight = 0.5) {
            if (!this.isValidHex(color1) || !this.isValidHex(color2)) {
                return this.isValidHex(color1) ? color1 : color2;
            }

            const rgb1 = this.hexToRgb(color1);
            const rgb2 = this.hexToRgb(color2);

            if (!rgb1 || !rgb2) return color1;

            const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight));
            const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight));
            const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight));

            return this.rgbToHex(r, g, b);
        }
    };

    // Export color utilities
    window.HakoMonetColorUtils = ColorUtils;

})();