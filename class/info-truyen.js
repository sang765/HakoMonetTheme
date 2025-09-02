(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[InfoTruyen]', ...args);
        }
    }
    
    function initInfoTruyen() {
        debugLog('InfoTruyen class đã được tải');
        
        // Kiểm tra xem có phải là trang truyện không
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        
        // Không hoạt động với trang đánh giá (match/*/*/danh-gia)
        if (window.location.pathname.includes('/danh-gia')) {
            debugLog('Đây là trang đánh giá, bỏ qua tính năng InfoTruyen.');
            return;
        }
        
        if (pathParts.length < 2 || !['truyen', 'sang-tac', 'ai-dich'].includes(pathParts[0])) {
            debugLog('Đây không phải trang chi tiết truyện, bỏ qua tính năng InfoTruyen.');
            return;
        }
        
        // Thêm CSS editor nếu cần
        addCSSEditor();
        
        // Thêm các tính năng khác cho trang truyện
        enhanceSeriesPage();
        
        // Khởi tạo colors/page-info-truyen.js
        initPageInfoTruyen();
    }
    
    function initPageInfoTruyen() {
        // Kiểm tra xem colors/page-info-truyen.js đã được tải chưa
        if (typeof window.initPageInfoTruyen === 'function') {
            window.initPageInfoTruyen();
            debugLog('Đã khởi tạo colors/page-info-truyen.js');
        } else {
            debugLog('colors/page-info-truyen.js chưa được tải');
            
            // Thử tải động nếu chưa có
            loadPageInfoTruyen();
        }
    }
    
    function loadPageInfoTruyen() {
        // Tạo script element để tải colors/page-info-truyen.js
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/path/to/colors/page-info-truyen.js'; // Thay đổi đường dẫn phù hợp
        script.onload = function() {
            debugLog('Đã tải colors/page-info-truyen.js thành công');
            if (typeof window.initPageInfoTruyen === 'function') {
                window.initPageInfoTruyen();
            }
        };
        script.onerror = function() {
            debugLog('Lỗi khi tải colors/page-info-truyen.js');
        };
        
        document.head.appendChild(script);
    }
    
    function addCSSEditor() {
        // Tạo CSS editor nếu cần
        debugLog('CSS Editor đã sẵn sàng');
    }
    
    function enhanceSeriesPage() {
        // Cải thiện giao diện trang truyện
        GM_addStyle(`
            /* CSS cải thiện giao diện trang truyện */
            .series-cover {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                border-radius: 12px;
                overflow: hidden;
            }
            
            .feature-section {
                border-radius: 12px;
                overflow: hidden;
            }
            
            .series-title {
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .series-authors, .series-artists {
                margin-bottom: 12px;
            }
            
            .series-tags {
                margin-top: 16px;
            }
            
            .tag-item {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                margin: 0 8px 8px 0;
                font-size: 0.875rem;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            
            .tag-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .list-chapters {
                border-radius: 12px;
                overflow: hidden;
            }
            
            .list-chapters li {
                transition: background-color 0.2s ease;
            }
            
            .list-chapters li:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            /* Light mode support */
            body:not(.dark) .list-chapters li:hover {
                background-color: rgba(0, 0, 0, 0.03);
            }
        `);
        
        debugLog('Đã cải thiện giao diện trang truyện');
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInfoTruyen);
    } else {
        initInfoTruyen();
    }
})();
