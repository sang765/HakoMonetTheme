(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Blacklist]', ...args);
        }
    }

    // Danh sách các trang bị blacklist
    const BLACKLISTED_PAGES = [
        // Bảng điều khiển
        '/action'
        // Các trang khác có thể thêm vào sau
    ];

    function isBlacklistedPage() {
        const currentPath = window.location.pathname.toLowerCase();

        // Kiểm tra xem URL hiện tại có trong danh sách blacklist không
        for (const blacklistedPath of BLACKLISTED_PAGES) {
            if (currentPath.includes(blacklistedPath)) {
                debugLog('Trang bị blacklist:', currentPath);
                return true;
            }
        }

        return false;
    }

    function initBlacklist() {
        debugLog('Khởi tạo module blacklist');

        // Kiểm tra ngay lập tức
        if (isBlacklistedPage()) {
            debugLog('Userscript sẽ không hoạt động trên trang này');
            // Có thể thêm thông báo cho user nếu cần
            return false; // Trả về false để các module khác biết không nên chạy
        }

        debugLog('Trang được phép chạy userscript');
        return true; // Trả về true để các module khác có thể chạy
    }

    // Xuất function để các module khác có thể sử dụng
    window.HMTBlacklist = {
        isBlacklisted: isBlacklistedPage,
        init: initBlacklist
    };

    // Khởi chạy module blacklist ngay lập tức
    initBlacklist();

})();