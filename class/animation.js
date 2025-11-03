(function() {
    'use strict';
    
    const DEBUG = GM_getValue('debug_mode', false);
    const FOLDER_URL = 'https://sang765.github.io/HakoMonetTheme/styles/';
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Animation]', ...args);
        }
    }
    
    function initAnimation() {
        debugLog('Animation class đã được tải');
        
        // Thêm các animation CSS
        addAnimations();
    }
    
    function addAnimations() {
        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + 'animation.css').then(r => r.text()),
            fetch(FOLDER_URL + 'animation.css.map').then(r => r.text())
        ])
        .then(([css, mapContent]) => {
            // Convert source map to data URL
            const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

            // Add source mapping as data URL
            css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

            // Tạo Blob URL cho quản lý tài nguyên hiệu quả
            const blob = new Blob([css], { type: 'text/css' });
            const blobUrl = URL.createObjectURL(blob);

            // Tạo link element và áp dụng CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = blobUrl;
            document.head.appendChild(link);

            debugLog('Đã thêm animations với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải animation.css hoặc source map:', error);
        });
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimation);
    } else {
        initAnimation();
    }
})();
