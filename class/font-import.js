(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const IS_LOCAL = GM_info.script.version === 'LocalDev';
    const FOLDER_URL = IS_LOCAL ? `${window.HMTBaseUrl}/styles/` : 'https://sang765.github.io/HakoMonetTheme/styles/';

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[FontImport]', ...args);
        }
    }

    function initFontImport() {
        debugLog('FontImport class đã được tải');

        // Thêm font import CSS
        addFontImport();
    }

    function addFontImport() {
        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + 'font/font-import.css').then(r => r.text()),
            fetch(FOLDER_URL + 'font/font-import.css.map').then(r => r.text())
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

            debugLog('Đã thêm font import CSS với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải font/font-import.css hoặc source map:', error);
        });
    }

    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFontImport);
    } else {
        initFontImport();
    }
})();
