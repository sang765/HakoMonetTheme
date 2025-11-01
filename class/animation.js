(function() {
    'use strict';
    
    const DEBUG = GM_getValue('debug_mode', false);
    
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
        fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/animation.css')
            .then(response => response.text())
            .then(css => {
                // Thêm source mapping cho debug
                css += '\n/*# sourceMappingURL=https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/animation.css.map */';

                // Tạo Blob URL cho quản lý tài nguyên hiệu quả
                const blob = new Blob([css], { type: 'text/css' });
                const blobUrl = URL.createObjectURL(blob);

                // Tạo link element và áp dụng CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = blobUrl;
                document.head.appendChild(link);

                debugLog('Đã thêm animations với Blob URL và source mapping');
            })
            .catch(error => {
                debugLog('Lỗi khi tải animation.css:', error);
            });
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimation);
    } else {
        initAnimation();
    }
})();
