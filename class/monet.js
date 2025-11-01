(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[MonetClass]', ...args);
        }
    }
    
    function initMonetClass() {
        debugLog('Monet class đã được tải');
        
        // Thêm các element editor liên quan đến Monet Theme
        addMonetElements();
    }
    
    function addMonetElements() {
        // Tạo các element editor cho Monet Theme
        debugLog('Monet elements đã sẵn sàng');

        // Thêm CSS cho các element editor với Blob URL và source mapping
        const css = `
            /* CSS cho các element editor Monet */
            .monet-editor {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .monet-editor h3 {
                margin: 0 0 12px 0;
                font-size: 1rem;
                color: #fff;
            }

            .monet-editor .color-picker {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            .monet-editor .color-option {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
                transition: transform 0.2s ease;
            }

            .monet-editor .color-option:hover {
                transform: scale(1.1);
            }

            .monet-editor .color-option.active {
                border-color: #fff;
                transform: scale(1.1);
            }

            .monet-editor .reset-btn {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: #fff;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.875rem;
                transition: background 0.2s ease;
            }

            .monet-editor .reset-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* Light mode support */
            body:not(.dark) .monet-editor {
                background: rgba(255, 255, 255, 0.9);
                border: 1px solid rgba(0, 0, 0, 0.1);
            }

            body:not(.dark) .monet-editor h3 {
                color: #000;
            }

            body:not(.dark) .monet-editor .reset-btn {
                background: rgba(0, 0, 0, 0.1);
                color: #000;
            }

            body:not(.dark) .monet-editor .reset-btn:hover {
                background: rgba(0, 0, 0, 0.2);
            }
            /*# sourceMappingURL=https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/monet-editor.css.map */
        `;

        // Tạo Blob URL cho quản lý tài nguyên hiệu quả
        const blob = new Blob([css], { type: 'text/css' });
        const blobUrl = URL.createObjectURL(blob);

        // Tạo link element và áp dụng CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = blobUrl;
        document.head.appendChild(link);

        debugLog('Đã thêm CSS cho Monet elements với Blob URL và source mapping');
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMonetClass);
    } else {
        initMonetClass();
    }
})();
