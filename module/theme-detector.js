(function() {
    'use strict';
    
    const DEBUG = true;

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[ThemeDetector]', ...args);
        }
    }

    // Phát hiện theme hiện tại của trang web
    function detectTheme() {
        // Kiểm tra class trên body
        if (document.body.classList.contains('dark')) {
            debugLog('Phát hiện dark mode qua class body');
            return 'dark';
        }
        
        if (document.body.classList.contains('light')) {
            debugLog('Phát hiện light mode qua class body');
            return 'light';
        }
        
        // Kiểm tra thuộc tính data-theme
        const dataTheme = document.body.getAttribute('data-theme') || 
                         document.documentElement.getAttribute('data-theme');
        if (dataTheme) {
            debugLog(`Phát hiện theme qua data-theme: ${dataTheme}`);
            return dataTheme.toLowerCase();
        }
        
        // Kiểm tra CSS custom property
        const computedStyle = getComputedStyle(document.documentElement);
        const colorScheme = computedStyle.getPropertyValue('--color-scheme') || 
                           computedStyle.getPropertyValue('color-scheme');
        if (colorScheme && colorScheme.trim()) {
            debugLog(`Phát hiện theme qua CSS property: ${colorScheme}`);
            return colorScheme.trim().toLowerCase();
        }
        
        // Kiểm tra meta tag
        const themeMeta = document.querySelector('meta[name="theme-color"]') || 
                         document.querySelector('meta[name="color-scheme"]');
        if (themeMeta && themeMeta.content) {
            const content = themeMeta.content.toLowerCase();
            if (content.includes('dark') || content.includes('#000') || content.includes('#111')) {
                debugLog('Phát hiện dark mode qua meta tag');
                return 'dark';
            }
            if (content.includes('light') || content.includes('#fff') || content.includes('#eee')) {
                debugLog('Phát hiện light mode qua meta tag');
                return 'light';
            }
        }
        
        // Kiểm tra màu nền để xác định theme
        const bgColor = computedStyle.backgroundColor;
        if (bgColor) {
            const isDarkBg = isColorDark(bgColor);
            debugLog(`Phát hiện theme qua màu nền: ${isDarkBg ? 'dark' : 'light'}`);
            return isDarkBg ? 'dark' : 'light';
        }
        
        // Mặc định là dark mode cho Hako/DocLN
        debugLog('Không phát hiện theme, sử dụng mặc định: dark');
        return 'dark';
    }

    // Kiểm tra xem một màu có phải là màu tối không
    function isColorDark(color) {
        // Chuyển đổi màu sang RGB
        let r, g, b;
        
        if (color.startsWith('#')) {
            // HEX color
            const hex = color.replace('#', '');
            if (hex.length === 3) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
            } else {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
        } else if (color.startsWith('rgb')) {
            // RGB color
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                r = parseInt(match[1]);
                g = parseInt(match[2]);
                b = parseInt(match[3]);
            }
        }
        
        if (r === undefined || g === undefined || b === undefined) {
            return true; // Mặc định là dark nếu không xác định được
        }
        
        // Tính độ sáng (luma)
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 128;
    }

    // Lắng nghe thay đổi theme
    function watchThemeChange(callback) {
        // Theo dõi thay đổi class trên body
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class' || 
                    mutation.attributeName === 'data-theme') {
                    const currentTheme = detectTheme();
                    callback(currentTheme);
                    break;
                }
            }
        });
        
        observer.observe(document.body, { 
            attributes: true,
            attributeFilter: ['class', 'data-theme']
        });
        
        // Theo dõi thay đổi trên html element
        observer.observe(document.documentElement, { 
            attributes: true,
            attributeFilter: ['class', 'data-theme']
        });
        
        debugLog('Đã thiết lập theo dõi thay đổi theme');
        return observer;
    }

    // API công khai
    window.ThemeDetector = {
        detectTheme,
        isColorDark,
        watchThemeChange,
        isDarkMode: () => detectTheme() === 'dark',
        isLightMode: () => detectTheme() === 'light'
    };

    debugLog('ThemeDetector module đã được tải');

})();
