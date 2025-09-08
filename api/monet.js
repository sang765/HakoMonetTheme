(function() {
    'use strict';
    
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
    
    // Hàm HSL to RGB
    function hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }
    
    // Hàm RGB to HSL
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        
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
        
        return [h, s, l];
    }
    
    // Hàm tạo Monet palette từ màu chủ đạo với hỗ trợ theme
    function generateMonetPalette(baseColor, theme = 'dark') {
        if (!isValidColor(baseColor)) {
            throw new Error('Màu cơ sở không hợp lệ');
        }
        
        const baseRgb = hexToRgb(baseColor);
        if (!baseRgb) return null;
        
        const isDarkTheme = theme === 'dark';
        const tones = [0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
        const palette = {};
        
        // Chuyển base color sang HSL để dễ điều chỉnh
        const [h, s, l] = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
        
        tones.forEach(tone => {
            let newL, newS;

            if (isDarkTheme) {
                // Dark mode palette - less aggressively dark, better balance
                switch(tone) {
                    case 0:   newL = 0.96; newS = s * 0.15; break;  // Lighter surface
                    case 10:  newL = 0.92; newS = s * 0.25; break;
                    case 50:  newL = 0.85; newS = s * 0.35; break;
                    case 100: newL = 0.78; newS = s * 0.45; break;
                    case 200: newL = 0.68; newS = s * 0.55; break;
                    case 300: newL = 0.58; newS = s * 0.65; break;
                    case 400: newL = 0.48; newS = s * 0.75; break;
                    case 500: newL = 0.40; newS = s * 0.85; break; // Base color - slightly lighter
                    case 600: newL = 0.32; newS = s * 0.90; break;
                    case 700: newL = 0.24; newS = s * 0.80; break;
                    case 800: newL = 0.18; newS = s * 0.70; break;
                    case 900: newL = 0.12; newS = s * 0.60; break;
                    case 1000: newL = 0.08; newS = s * 0.50; break; // Less dark background
                    default:  newL = l; newS = s;
                }
            } else {
                // Light mode palette - white base with subtle color tint
                switch(tone) {
                    case 0:   newL = 0.99; newS = s * 0.05; break;  // Near white with minimal tint
                    case 10:  newL = 0.97; newS = s * 0.08; break;
                    case 50:  newL = 0.95; newS = s * 0.12; break;  // Subtle tint for surface
                    case 100: newL = 0.92; newS = s * 0.18; break;
                    case 200: newL = 0.88; newS = s * 0.25; break;
                    case 300: newL = 0.82; newS = s * 0.35; break;
                    case 400: newL = 0.75; newS = s * 0.45; break;
                    case 500: newL = 0.65; newS = s * 0.55; break; // Base color - balanced
                    case 600: newL = 0.55; newS = s * 0.65; break;
                    case 700: newL = 0.45; newS = s * 0.70; break;
                    case 800: newL = 0.35; newS = s * 0.75; break;
                    case 900: newL = 0.25; newS = s * 0.70; break;
                    case 1000: newL = 0.18; newS = s * 0.60; break;
                    default:  newL = l; newS = s;
                }
            }
            
            const [r, g, b] = hslToRgb(h, newS, newL);
            palette[tone] = rgbToHex(r, g, b);
        });
        
        return palette;
    }
    
    // Kiểm tra độ sáng của màu
    function isColorLight(color) {
        if (!isValidColor(color)) {
            return false;
        }
        
        const rgb = hexToRgb(color);
        if (!rgb) return false;
        
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128;
    }
    
    // Tạo palette phù hợp với theme hiện tại
    function generateThemeAwarePalette(baseColor) {
        const currentTheme = window.ThemeDetector ? window.ThemeDetector.detectTheme() : 'dark';
        return generateMonetPalette(baseColor, currentTheme);
    }
    
    // Lấy màu phù hợp với theme cho text
    function getThemeAwareTextColor(backgroundColor) {
        // Always prioritize theme detection over background color calculation
        const isDark = window.ThemeDetector ? window.ThemeDetector.isDarkMode() : true;

        // In dark mode, always use white/light text for better readability
        if (isDark) {
            return '#ffffff';
        }

        // In light mode, check background brightness but with more conservative threshold
        const bgRgb = hexToRgb(backgroundColor);
        if (!bgRgb) return '#000000'; // Default to black if can't parse

        const brightness = (bgRgb.r * 299 + bgRgb.g * 587 + bgRgb.b * 114) / 1000;

        // Use a more conservative threshold to avoid dark text on light backgrounds
        return brightness > 180 ? '#000000' : '#ffffff';
    }
    
    // Xuất API công khai
    window.MonetAPI = {
        generateMonetPalette,
        generateThemeAwarePalette,
        getThemeAwareTextColor,
        isValidColor,
        isColorLight,
        rgbToHex,
        hexToRgb,
        rgbToHsl,
        hslToRgb
    };
})();
