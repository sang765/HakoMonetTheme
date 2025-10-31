(function() {
    'use strict';

    const DEBUG = true;

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
        fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/font-import.css')
            .then(response => response.text())
            .then(css => {
                GM_addStyle(css);
                debugLog('Đã thêm font import CSS');
            })
            .catch(error => {
                debugLog('Lỗi khi tải font-import.css:', error);
            });
    }

    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFontImport);
    } else {
        initFontImport();
    }
})();