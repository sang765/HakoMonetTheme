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
        
        tones.forEach(tone => {
            let r, g, b;
            
            if (isDarkTheme) {
                // Dark mode: tone thấp = sáng hơn, tone cao = tối hơn
                if (tone <= 500) {
                    const factor = tone / 500;
                    r = Math.round(baseRgb.r + (255 - baseRgb.r) * factor);
                    g = Math.round(baseRgb.g + (255 - baseRgb.g) * factor);
                    b = Math.round(baseRgb.b + (255 - baseRgb.b) * factor);
                } else {
                    const darkenFactor = (tone - 500) / 500;
                    r = Math.round(baseRgb.r * (1 - darkenFactor * 0.6));
                    g = Math.round(baseRgb.g * (1 - darkenFactor * 0.6));
                    b = Math.round(baseRgb.b * (1 - darkenFactor * 0.6));
                }
            } else {
                // Light mode: tone thấp = nhạt hơn, tone cao = đậm hơn
                if (tone <= 500) {
                    const lightenFactor = (500 - tone) / 500;
                    r = Math.round(baseRgb.r + (255 - baseRgb.r) * lightenFactor * 0.8);
                    g = Math.round(baseRgb.g + (255 - baseRgb.g) * lightenFactor * 0.8);
                    b = Math.round(baseRgb.b + (255 - baseRgb.b) * lightenFactor * 0.8);
                } else {
                    const factor = (tone - 500) / 500;
                    r = Math.round(baseRgb.r * (0.8 + factor * 0.2));
                    g = Math.round(baseRgb.g * (0.8 + factor * 0.2));
                    b = Math.round(baseRgb.b * (0.8 + factor * 0.2));
                }
            }
            
            // Đảm bảo giá trị trong khoảng 0-255
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));
            
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
    
    // Xuất API công khai
    window.MonetAPI = {
        generateMonetPalette,
        generateThemeAwarePalette,
        isValidColor,
        isColorLight,
        rgbToHex,
        hexToRgb
    };
})();
