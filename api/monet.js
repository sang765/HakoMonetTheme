(function() {
    'use strict';
    
    // ===== V1 LEGACY FUNCTIONS (PRESERVED FOR BACKWARD COMPATIBILITY) =====
    
    // Chuyển đổi RGB sang HEX
    function rgbToHex(r, g, b) {
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Chuyển đổi HEX sang RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Kiểm tra màu hợp lệ
    function isValidColor(color) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(color);
    }
    
    // Hàm tạo Monet palette từ màu chủ đạo
    function generateMonetPalette(baseColor) {
        if (!isValidColor(baseColor)) {
            throw new Error('Màu cơ sở không hợp lệ');
        }
        
        const baseRgb = hexToRgb(baseColor);
        if (!baseRgb) return null;
        
        // Tạo các tone màu theo Material You guidelines
        const tones = [0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
        const palette = {};
        
        tones.forEach(tone => {
            // Tính toán màu dựa trên tone
            const factor = tone / 1000;
            
            if (tone <= 500) {
                // Màu sáng hơn (tone thấp)
                const r = Math.round(baseRgb.r + (255 - baseRgb.r) * (1 - factor));
                const g = Math.round(baseRgb.g + (255 - baseRgb.g) * (1 - factor));
                const b = Math.round(baseRgb.b + (255 - baseRgb.b) * (1 - factor));
                palette[tone] = rgbToHex(r, g, b);
            } else {
                // Màu tối hơn (tone cao)
                const darkenFactor = (tone - 500) / 500;
                const r = Math.round(baseRgb.r * (1 - darkenFactor * 0.7));
                const g = Math.round(baseRgb.g * (1 - darkenFactor * 0.7));
                const b = Math.round(baseRgb.b * (1 - darkenFactor * 0.7));
                palette[tone] = rgbToHex(r, g, b);
            }
        });
        
        return palette;
    }
    
    // Kiểm tra độ sáng của màu
    function isColorLight(color) {
        if (!isValidColor(color)) {
            return false;
        }
        
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    }
    
    // Extended Monet API với hỗ trợ RGBA
    function generateMonetPaletteWithRGBA(baseColor) {
        const palette = generateMonetPalette(baseColor);
        const rgbaPalette = {};
        
        for (const [tone, hexColor] of Object.entries(palette)) {
            const rgb = hexToRgb(hexColor);
            rgbaPalette[tone] = {
                hex: hexColor,
                rgb: rgb,
                rgba: (alpha = 1) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
                // Cho phép truy cập như function: rgbaPalette[500](0.8)
                __call__: function(alpha = 1) {
                    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
                }
            };
        }
        
        // Thêm Proxy để hỗ trợ cú pháp rgbaPalette[500](0.8)
        return new Proxy(rgbaPalette, {
            get(target, prop) {
                if (prop in target) {
                    const value = target[prop];
                    // Nếu prop là một số (tone) và có method __call__
                    if (typeof prop === 'string' && value && typeof value.__call__ === 'function') {
                        return value.__call;
                    }
                    return value;
                }
                return target[prop];
            }
        });
    }

    // Utility method để chuyển đổi palette color thành rgba
    function paletteToRgba(palette, tone, alpha = 1) {
        const color = palette[tone];
        if (!color) return null;
        
        // Nếu đây là enhanced palette với rgba support
        if (typeof color === 'object' && color.rgb) {
            return `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${alpha})`;
        }
        
        // Nếu là hex string (format cũ)
        const rgb = hexToRgb(color);
        if (rgb) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }
        
        return color;
    }
    
    // ===== V2 CORE UTILITIES =====
    class ColorUtils {
        static hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
        
        static rgbToHex(r, g, b) {
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }
        
        static rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        }
        
        static hslToRgb(h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;
            
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }
        
        static calculateLuminance(r, g, b) {
            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }
        
        static getContrastRatio(color1, color2) {
            const rgb1 = this.hexToRgb(color1) || {r: 0, g: 0, b: 0};
            const rgb2 = this.hexToRgb(color2) || {r: 255, g: 255, b: 255};
            
            const lum1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
            const lum2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
            
            const brightest = Math.max(lum1, lum2);
            const darkest = Math.min(lum1, lum2);
            
            return (brightest + 0.05) / (darkest + 0.05);
        }
        
        static blendColors(color1, color2, ratio = 0.5) {
            const rgb1 = this.hexToRgb(color1);
            const rgb2 = this.hexToRgb(color2);
            if (!rgb1 || !rgb2) return color1;
            
            const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
            const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
            const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
            
            return this.rgbToHex(r, g, b);
        }
    }
    
    // ===== V2 CACHING SYSTEM =====
    class MonetCache {
        constructor() {
            this.cache = new Map();
            this.maxSize = 100;
            this.defaultTTL = 300000; // 5 minutes
        }
        
        set(key, value, ttl = this.defaultTTL) {
            if (this.cache.size >= this.maxSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            this.cache.set(key, {
                value,
                timestamp: Date.now(),
                ttl
            });
        }
        
        get(key) {
            const item = this.cache.get(key);
            if (!item) return null;
            
            if (Date.now() - item.timestamp > item.ttl) {
                this.cache.delete(key);
                return null;
            }
            
            return item.value;
        }
        
        clear() {
            this.cache.clear();
        }
        
        cleanup() {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now - item.timestamp > item.ttl) {
                    this.cache.delete(key);
                }
            }
        }
    }
    
    // ===== V2 COLOR HARMONY ANALYZER =====
    class ColorHarmonyAnalyzer {
        static getComplementaryColor(hex) {
            const rgb = ColorUtils.hexToRgb(hex);
            if (!rgb) return hex;
            
            const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const complementaryHue = (hsl.h + 180) % 360;
            
            const complementaryRgb = ColorUtils.hslToRgb(complementaryHue, hsl.s, hsl.l);
            return ColorUtils.rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
        }
        
        static getAnalogousColors(hex, count = 3) {
            const rgb = ColorUtils.hexToRgb(hex);
            if (!rgb) return [hex];
            
            const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const colors = [hex];
            
            for (let i = 1; i <= count; i++) {
                // Positive analogous
                const huePos = (hsl.h + (30 * i)) % 360;
                const rgbPos = ColorUtils.hslToRgb(huePos, hsl.s, hsl.l);
                colors.push(ColorUtils.rgbToHex(rgbPos.r, rgbPos.g, rgbPos.b));
                
                // Negative analogous
                const hueNeg = (hsl.h - (30 * i) + 360) % 360;
                const rgbNeg = ColorUtils.hslToRgb(hueNeg, hsl.s, hsl.l);
                colors.push(ColorUtils.rgbToHex(rgbNeg.r, rgbNeg.g, rgbNeg.b));
            }
            
            return colors.slice(0, 2 * count + 1);
        }
        
        static getTriadicColors(hex) {
            const rgb = ColorUtils.hexToRgb(hex);
            if (!rgb) return [hex];
            
            const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const colors = [hex];
            
            for (let i = 1; i <= 2; i++) {
                const hue = (hsl.h + (120 * i)) % 360;
                const rgb_new = ColorUtils.hslToRgb(hue, hsl.s, hsl.l);
                colors.push(ColorUtils.rgbToHex(rgb_new.r, rgb_new.g, rgb_new.b));
            }
            
            return colors;
        }
        
        static getSplitComplementaryColors(hex) {
            const rgb = ColorUtils.hexToRgb(hex);
            if (!rgb) return [hex];
            
            const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
            const colors = [hex];
            
            for (let i = 1; i <= 2; i++) {
                const hue = (hsl.h + 180 + (30 * (i === 1 ? -1 : 1))) % 360;
                const rgb_new = ColorUtils.hslToRgb(hue, hsl.s, hsl.l);
                colors.push(ColorUtils.rgbToHex(rgb_new.r, rgb_new.g, rgb_new.b));
            }
            
            return colors;
        }
    }
    
    // ===== V2 ACCESSIBILITY ANALYZER =====
    class AccessibilityAnalyzer {
        static isColorLight(hex) {
            const rgb = ColorUtils.hexToRgb(hex);
            if (!rgb) return false;
            
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            return brightness > 128;
        }
        
        static checkWCAGCompliance(foreground, background, level = 'AA') {
            const ratio = ColorUtils.getContrastRatio(foreground, background);
            
            const standards = {
                'AA': { normal: 4.5, large: 3 },
                'AAA': { normal: 7, large: 4.5 },
                'A': { normal: 3, large: 3 }
            };
            
            const standard = standards[level] || standards.AA;
            
            return {
                ratio: Math.round(ratio * 100) / 100,
                passes: {
                    normal: ratio >= standard.normal,
                    large: ratio >= standard.large
                },
                level: level,
                recommendation: ratio < standard.normal ? 'Increase contrast ratio' : 'Meets standards'
            };
        }
        
        static getOptimalTextColor(background) {
            const black = '#000000';
            const white = '#FFFFFF';
            
            const blackContrast = ColorUtils.getContrastRatio(black, background);
            const whiteContrast = ColorUtils.getContrastRatio(white, background);
            
            return blackContrast > whiteContrast ? black : white;
        }
        
        static simulateColorBlindness(hex, type = 'deuteranopia') {
            const rgb = ColorUtils.hexToRgb(hex);
            if (!rgb) return hex;
            
            // Simplified color blindness simulation matrices
            const matrices = {
                'deuteranopia': [
                    [0.625, 0.375, 0],
                    [0.7, 0.3, 0],
                    [0, 0.3, 0.7]
                ],
                'protanopia': [
                    [0.567, 0.433, 0],
                    [0.558, 0.442, 0],
                    [0, 0.242, 0.758]
                ],
                'tritanopia': [
                    [0.95, 0.05, 0],
                    [0, 0.433, 0.567],
                    [0, 0.475, 0.525]
                ]
            };
            
            const matrix = matrices[type] || matrices.deuteranopia;
            const r = Math.round((rgb.r * matrix[0][0] + rgb.g * matrix[0][1] + rgb.b * matrix[0][2]));
            const g = Math.round((rgb.r * matrix[1][0] + rgb.g * matrix[1][1] + rgb.b * matrix[1][2]));
            const b = Math.round((rgb.r * matrix[2][0] + rgb.g * matrix[2][1] + rgb.b * matrix[2][2]));
            
            return ColorUtils.rgbToHex(Math.max(0, r), Math.max(0, g), Math.max(0, b));
        }
    }
    
    // ===== V2 MAIN MONETAPI 2.0 CLASS =====
    class MonetAPIv2 {
        constructor() {
            this.cache = new MonetCache();
            this.preferences = new Map();
            this.currentTheme = 'auto';
            this.systemTheme = 'light';
            
            // Setup theme detection
            this.setupThemeDetection();
            
            // Cleanup cache periodically
            setInterval(() => this.cache.cleanup(), 60000);
        }
        
        // ===== V2 CORE PALETTE GENERATION =====
        generateMaterialPalette(baseColor, options = {}) {
            const cacheKey = `material_${baseColor}_${JSON.stringify(options)}`;
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;
            
            const rgb = ColorUtils.hexToRgb(baseColor);
            if (!rgb) throw new Error('Invalid base color');
            
            const {
                algorithm = 'material3', // material3, material2, custom
                tones = [0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
                chromaFactor = 1.0,
                temperature = 0
            } = options;
            
            const palette = {};
            
            tones.forEach(tone => {
                let r, g, b;
                
                if (algorithm === 'material3') {
                    const factor = tone / 1000;
                    
                    if (tone <= 500) {
                        // Light tones
                        const lightening = (1 - factor) * (1 - chromaFactor);
                        r = Math.round(rgb.r + (255 - rgb.r) * lightening);
                        g = Math.round(rgb.g + (255 - rgb.g) * lightening);
                        b = Math.round(rgb.b + (255 - rgb.b) * lightening);
                    } else {
                        // Dark tones
                        const darkening = (tone - 500) / 500;
                        const temperatureAdjust = temperature / 100;
                        
                        r = Math.round(rgb.r * (1 - darkening * 0.8) * (1 + temperatureAdjust));
                        g = Math.round(rgb.g * (1 - darkening * 0.8));
                        b = Math.round(rgb.b * (1 - darkening * 0.8) * (1 - temperatureAdjust));
                    }
                }
                
                palette[tone] = ColorUtils.rgbToHex(
                    Math.max(0, Math.min(255, r)),
                    Math.max(0, Math.min(255, g)),
                    Math.max(0, Math.min(255, b))
                );
            });
            
            const enhancedPalette = this.createEnhancedPalette(palette);
            this.cache.set(cacheKey, enhancedPalette);
            return enhancedPalette;
        }
        
        // ===== V2 ENHANCED PALETTE WITH RGBA =====
        createEnhancedPalette(palette) {
            const enhanced = {};
            
            for (const [tone, hexColor] of Object.entries(palette)) {
                const rgb = ColorUtils.hexToRgb(hexColor);
                if (!rgb) continue;
                
                enhanced[tone] = {
                    hex: hexColor,
                    rgb: rgb,
                    hsl: ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b),
                    rgba: (alpha = 1) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
                    hsla: (alpha = 1) => {
                        const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
                        return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`;
                    },
                    luminance: ColorUtils.calculateLuminance(rgb.r, rgb.g, rgb.b),
                    contrast: (otherColor) => ColorUtils.getContrastRatio(hexColor, otherColor),
                    blend: (otherColor, ratio = 0.5) => ColorUtils.blendColors(hexColor, otherColor, ratio),
                    isLight: () => AccessibilityAnalyzer.isColorLight(hexColor),
                    getOptimalTextColor: () => AccessibilityAnalyzer.getOptimalTextColor(hexColor)
                };
            }
            
            // Add palette-level methods
            enhanced.getRGBA = (tone, alpha) => {
                const color = enhanced[tone];
                return color ? color.rgba(alpha) : null;
            };
            
            enhanced.getHSLA = (tone, alpha) => {
                const color = enhanced[tone];
                return color ? color.hsla(alpha) : null;
            };
            
            enhanced.getContrast = (tone1, tone2) => {
                const color1 = enhanced[tone1];
                const color2 = enhanced[tone2];
                return (color1 && color2) ? ColorUtils.getContrastRatio(color1.hex, color2.hex) : 0;
            };
            
            return enhanced;
        }
        
        // ===== V2 COLOR HARMONY METHODS =====
        getColorHarmonies(baseColor) {
            return {
                complementary: ColorHarmonyAnalyzer.getComplementaryColor(baseColor),
                analogous: ColorHarmonyAnalyzer.getAnalogousColors(baseColor),
                triadic: ColorHarmonyAnalyzer.getTriadicColors(baseColor),
                splitComplementary: ColorHarmonyAnalyzer.getSplitComplementaryColors(baseColor)
            };
        }
        
        generateHarmonyPalette(baseColor, scheme = 'complementary') {
            const harmonies = this.getColorHarmonies(baseColor);
            const schemeColors = harmonies[scheme] || [baseColor];
            
            const palettes = schemeColors.map(color => ({
                color,
                palette: this.generateMaterialPalette(color)
            }));
            
            return {
                scheme,
                baseColor,
                palettes,
                combined: this.combinePalettes(palettes.map(p => p.palette))
            };
        }
        
        combinePalettes(palettes) {
            const combined = {};
            
            palettes.forEach(palette => {
                for (const [tone, color] of Object.entries(palette)) {
                    if (!combined[tone]) combined[tone] = [];
                    combined[tone].push(color.hex);
                }
            });
            
            return combined;
        }
        
        // ===== V2 ACCESSIBILITY METHODS =====
        checkAccessibility(baseColor, options = {}) {
            const palette = this.generateMaterialPalette(baseColor);
            const analysis = {
                palette,
                recommendations: [],
                violations: [],
                wcagCompliance: []
            };
            
            // Check contrast ratios for common use cases
            const commonPairs = [
                { bg: 50, fg: 900, context: 'Light background, dark text' },
                { bg: 900, fg: 50, context: 'Dark background, light text' },
                { bg: 500, fg: 50, context: 'Primary color background, light text' },
                { bg: 500, fg: 900, context: 'Primary color background, dark text' }
            ];
            
            commonPairs.forEach(pair => {
                const bg = palette[pair.bg];
                const fg = palette[pair.fg];
                if (bg && fg) {
                    const compliance = AccessibilityAnalyzer.checkWCAGCompliance(fg.hex, bg.hex);
                    analysis.wcagCompliance.push({
                        ...compliance,
                        context: pair.context,
                        background: bg.hex,
                        foreground: fg.hex
                    });
                    
                    if (!compliance.passes.normal) {
                        analysis.violations.push({
                            type: 'contrast',
                            context: pair.context,
                            ratio: compliance.ratio,
                            required: 4.5
                        });
                    }
                }
            });
            
            // Generate accessibility-optimized palette
            analysis.optimizedPalette = this.generateAccessiblePalette(baseColor);
            
            return analysis;
        }
        
        generateAccessiblePalette(baseColor) {
            const palette = this.generateMaterialPalette(baseColor);
            const optimized = {};
            
            for (const [tone, color] of Object.entries(palette)) {
                if (tone >= 400 && tone <= 600) {
                    // Ensure primary colors meet contrast requirements
                    const testBg = color.hex;
                    const lightText = AccessibilityAnalyzer.getOptimalTextColor(testBg);
                    const contrast = ColorUtils.getContrastRatio(lightText, testBg);
                    
                    if (contrast < 4.5) {
                        // Adjust color to meet contrast requirements
                        let adjustedColor = color.hex;
                        let attempts = 0;
                        
                        while (contrast < 4.5 && attempts < 10) {
                            adjustedColor = ColorUtils.blendColors(adjustedColor, 
                                lightText === '#000000' ? '#000000' : '#FFFFFF', 0.1);
                            optimized[tone] = adjustedColor;
                            attempts++;
                        }
                    }
                }
                optimized[tone] = color.hex;
            }
            
            return this.createEnhancedPalette(optimized);
        }
        
        // ===== V2 SMART THEME METHODS =====
        setupThemeDetection() {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const updateSystemTheme = () => {
                this.systemTheme = mediaQuery.matches ? 'dark' : 'light';
                this.dispatchThemeChange();
            };
            
            mediaQuery.addListener(updateSystemTheme);
            updateSystemTheme();
        }
        
        getCurrentTheme() {
            return this.currentTheme;
        }
        
        setThemePreference(preference) {
            this.currentTheme = preference;
            this.preferences.set('theme', preference);
            this.dispatchThemeChange();
        }
        
        adaptToTime(baseColor) {
            const hour = new Date().getHours();
            let adjustedColor = baseColor;
            
            // Warmer colors during evening/night
            if (hour >= 18 || hour <= 6) {
                const warmPalette = this.generateMaterialPalette(baseColor, {
                    temperature: 20 // Warmer
                });
                adjustedColor = warmPalette[500].hex;
            }
            
            // Cooler colors during day
            if (hour >= 7 && hour <= 17) {
                const coolPalette = this.generateMaterialPalette(baseColor, {
                    temperature: -10 // Cooler
                });
                adjustedColor = coolPalette[500].hex;
            }
            
            return adjustedColor;
        }
        
        // ===== V2 PERFORMANCE METHODS =====
        preloadColors(colorArray) {
            colorArray.forEach(color => {
                this.generateMaterialPalette(color);
            });
        }
        
        getCacheStats() {
            return {
                size: this.cache.cache.size,
                maxSize: this.cache.maxSize,
                entries: Array.from(this.cache.cache.entries()).map(([key, value]) => ({
                    key,
                    age: Date.now() - value.timestamp,
                    ttl: value.ttl
                }))
            };
        }
        
        clearCache() {
            this.cache.clear();
        }
        
        // ===== V2 DEVELOPER TOOLS =====
        createColorDebugger() {
            const debugPanel = document.createElement('div');
            debugPanel.id = 'monet-debug-panel';
            debugPanel.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                width: 300px;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                max-height: 400px;
                overflow-y: auto;
            `;
            
            debugPanel.innerHTML = `
                <h3 style="margin: 0 0 10px 0; color: #fff;">Monet Debug Panel</h3>
                <div id="debug-content"></div>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
            `;
            
            document.body.appendChild(debugPanel);
            return debugPanel;
        }
        
        logColorAnalysis(color, context = '') {
            const DEBUG = GM_getValue('debug_mode', false);
            if (!DEBUG) return;
            
            console.group(`🎨 Monet Color Analysis ${context ? '- ' + context : ''}`);
            console.log('Base Color:', color);
            
            const palette = this.generateMaterialPalette(color);
            console.log('Material Palette:', palette);
            
            const harmonies = this.getColorHarmonies(color);
            console.log('Color Harmonies:', harmonies);
            
            const accessibility = this.checkAccessibility(color);
            console.log('Accessibility Analysis:', accessibility);
            
            const systemTheme = this.systemTheme;
            const currentTheme = this.currentTheme;
            console.log('Theme Status:', { systemTheme, currentTheme });
            
            console.groupEnd();
        }
        
        // ===== V2 UTILITY METHODS =====
        formatColor(color, format = 'hex') {
            const rgb = ColorUtils.hexToRgb(color);
            if (!rgb) return color;
            
            switch (format) {
                case 'rgb':
                    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                case 'rgba':
                    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
                case 'hsl':
                    const hsl = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
                    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
                case 'hsla':
                    const hslObj = ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
                    return `hsla(${hslObj.h}, ${hslObj.s}%, ${hslObj.l}%, 1)`;
                default:
                    return color;
            }
        }
        
        // ===== V2 PRIVATE METHODS =====
        dispatchThemeChange() {
            const event = new CustomEvent('monetThemeChanged', {
                detail: {
                    systemTheme: this.systemTheme,
                    currentTheme: this.currentTheme,
                    effectiveTheme: this.currentTheme === 'auto' ? this.systemTheme : this.currentTheme
                }
            });
            document.dispatchEvent(event);
        }
    }
    
    // ===== INITIALIZATION =====
    const monetAPIv2 = new MonetAPIv2();
    
    // Export to global scope with both V1 and V2 interfaces
    window.MonetAPI = {
        // ===== V1 LEGACY METHODS (MAINTAINED FOR BACKWARD COMPATIBILITY) =====
        generateMonetPalette,
        isValidColor,
        isColorLight,
        rgbToHex,
        hexToRgb,
        generateMonetPaletteWithRGBA,
        paletteToRgba,
        
        // ===== V2 ENHANCED CORE =====
        v2: monetAPIv2,
        
        // ===== V2 CONVENIENCE METHODS (V2 PREFIXED) =====
        v2CreateEnhancedPalette: (color, options) => monetAPIv2.generateMaterialPalette(color, options),
        v2PaletteToRgba: (palette, tone, alpha) => {
            const color = palette[tone];
            return color ? color.rgba(alpha) : null;
        },
        v2GetColorHarmonies: (color) => monetAPIv2.getColorHarmonies(color),
        v2CheckAccessibility: (color) => monetAPIv2.checkAccessibility(color),
        v2GenerateHarmonyPalette: (color, scheme) => monetAPIv2.generateHarmonyPalette(color, scheme),
        v2GetCurrentTheme: () => monetAPIv2.getCurrentTheme(),
        v2SetThemePreference: (preference) => monetAPIv2.setThemePreference(preference),
        v2CreateColorDebugger: () => monetAPIv2.createColorDebugger(),
        v2LogColorAnalysis: (color, context) => monetAPIv2.logColorAnalysis(color, context),
        v2GetCacheStats: () => monetAPIv2.getCacheStats(),
        v2ClearCache: () => monetAPIv2.clearCache(),
        v2FormatColor: (color, format) => monetAPIv2.formatColor(color, format),
        v2AdaptToTime: (color) => monetAPIv2.adaptToTime(color),
        v2PreloadColors: (colorArray) => monetAPIv2.preloadColors(colorArray),
        
        // ===== V2 UTILITY CLASSES (FOR DEVELOPERS) =====
        v2ColorUtils: ColorUtils,
        v2AccessibilityAnalyzer: AccessibilityAnalyzer,
        v2ColorHarmonyAnalyzer: ColorHarmonyAnalyzer,
        v2Cache: MonetCache,
        
        // ===== UNIFIED UTILITY METHODS =====
        formatColor: (color, format) => monetAPIv2.formatColor(color, format),
        
        // ===== API VERSION INFO =====
        version: '2.0-integrated',
        v1Methods: ['generateMonetPalette', 'isValidColor', 'isColorLight', 'rgbToHex', 'hexToRgb', 'generateMonetPaletteWithRGBA', 'paletteToRgba'],
        v2Methods: [
            'v2CreateEnhancedPalette', 'v2PaletteToRgba', 'v2GetColorHarmonies', 'v2CheckAccessibility',
            'v2GenerateHarmonyPalette', 'v2GetCurrentTheme', 'v2SetThemePreference', 'v2CreateColorDebugger',
            'v2LogColorAnalysis', 'v2GetCacheStats', 'v2ClearCache', 'v2FormatColor', 'v2AdaptToTime', 'v2PreloadColors'
        ]
    };
    
    // Auto-debug if enabled (only log once for combined version)
    if (GM_getValue('debug_mode', false)) {
        console.log('🎨 MonetAPI v2.0-integrated initialized');
        console.log('V1 Methods:', window.MonetAPI.v1Methods.length);
        console.log('V2 Methods:', window.MonetAPI.v2Methods.length);
        console.log('Total API Methods:', Object.keys(window.MonetAPI).length);
    }
})();
