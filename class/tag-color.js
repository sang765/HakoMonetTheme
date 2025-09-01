(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[TagColor]', ...args);
        }
    }
    
    function initTagColor() {
        debugLog('TagColor class đã được tải');
        
        // Thêm CSS editor liên quan đến tag
        addTagCSS();
    }
    
    function addTagCSS() {
        // CSS cho các tag với màu sắc khác nhau
        GM_addStyle(`
            /* Màu sắc cho các tag phổ biến */
            .tag-item[href*="action"] {
                background-color: #ef4444;
                color: white;
            }
            
            .tag-item[href*="adventure"] {
                background-color: #f97316;
                color: white;
            }
            
            .tag-item[href*="comedy"] {
                background-color: #eab308;
                color: black;
            }
            
            .tag-item[href*="drama"] {
                background-color: #a855f7;
                color: white;
            }
            
            .tag-item[href*="fantasy"] {
                background-color: #8b5cf6;
                color: white;
            }
            
            .tag-item[href*="harem"] {
                background-color: #ec4899;
                color: white;
            }
            
            .tag-item[href*="romance"] {
                background-color: #f43f5e;
                color: white;
            }
            
            .tag-item[href*="school-life"] {
                background-color: #06b6d4;
                color: white;
            }
            
            .tag-item[href*="sci-fi"] {
                background-color: #3b82f6;
                color: white;
            }
            
            .tag-item[href*="slice-of-life"] {
                background-color: #10b981;
                color: white;
            }
            
            .tag-item[href*="supernatural"] {
                background-color: #6366f1;
                color: white;
            }
            
            /* Màu mặc định cho các tag khác */
            .tag-item:not([href*="action"]):not([href*="adventure"]):not([href*="comedy"]):not([href*="drama"]):not([href*="fantasy"]):not([href*="harem"]):not([href*="romance"]):not([href*="school-life"]):not([href*="sci-fi"]):not([href*="slice-of-life"]):not([href*="supernatural"]) {
                background-color: #6b7280;
                color: white;
            }
        `);
        
        debugLog('Đã thêm CSS cho tag colors');
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTagColor);
    } else {
        initTagColor();
    }
})();
