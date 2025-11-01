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
                // Thêm source mapping cho debug
                css += '\n/*# sourceMappingURL=https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/font-import.css.map */';

                // Tạo Blob URL cho quản lý tài nguyên hiệu quả
                const blob = new Blob([css], { type: 'text/css' });
                const blobUrl = URL.createObjectURL(blob);

                // Tạo link element và áp dụng CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = blobUrl;
                document.head.appendChild(link);

                debugLog('Đã thêm font import CSS với Blob URL và source mapping');
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