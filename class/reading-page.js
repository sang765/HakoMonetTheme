(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const IS_LOCAL = GM_info.script.version === 'LocalDev';
    const FOLDER_URL = IS_LOCAL ? 'http://localhost:5500/styles/' : 'https://sang765.github.io/HakoMonetTheme/styles/';

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
            fetch(FOLDER_URL + 'reading-page/reading-page.css').then(r => r.text()),
            fetch(FOLDER_URL + 'reading-page/reading-page.css.map').then(r => r.text())
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

            debugLog('Đã thêm reading page CSS với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải reading-page/reading-page.css hoặc source map:', error);
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReadingPage);
    } else {
        initReadingPage();
    }
})();