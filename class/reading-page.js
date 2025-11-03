(function() {
    'use strict';
    
    const DEBUG = GM_getValue('debug_mode', false);
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[ReadingPage]', ...args);
        }
    }
    
    function initReadingPage() {
        // Check condition: page must have class ".rd-basic_icon.row"
        if (!document.querySelector('.rd-basic_icon.row')) {
            debugLog('Condition not met, skipping reading page CSS load');
            return;
        }
        
        debugLog('Reading page class loaded');
        
        // Load CSS and source map
        addReadingPageCSS();
    }
    
    function addReadingPageCSS() {
        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch('https://sang765.github.io/HakoMonetTheme/styles/reading-page-mobile.css').then(r => r.text()),
            fetch('https://sang765.github.io/HakoMonetTheme/styles/reading-page-mobile.css.map').then(r => r.text())
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

            debugLog('Đã thêm reading page mobile CSS với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải reading-page-mobile.css hoặc source map:', error);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReadingPage);
    } else {
        initReadingPage();
    }
})();