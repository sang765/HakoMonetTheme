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
        const sideFeaturesElement = document.querySelector('div.col-4.col-md.feature-item.width-auto-xl');
        if (!sideFeaturesElement) {
            debugLog('Không tìm thấy element, bỏ qua tính năng đổi màu.');
            return;
        }
        
        // Thêm CSS editor nếu cần
        addCSSEditor();
        
        // Thêm các tính năng khác cho trang truyện
        enhanceSeriesPage();
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
            
            .basic-section, .board-list, .board_categ-list, .detail-list, .feature-section, .index-top_notification, .mail-page .mail-detail-list, .modal-content, .page-breadcrumb, .private-tabs, .profile-feature, .series-users, .showcase-item, .sub-index-style {
                border-radius: 15px;
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
