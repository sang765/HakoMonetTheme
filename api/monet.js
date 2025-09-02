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
    
    // Xuất API công khai
    window.MonetAPI = {
        generateMonetPalette,
        isValidColor,
        isColorLight,
        rgbToHex,
        hexToRgb
    };
})();
