(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const SELECTORS = [
        'div.page-top-group > a',
        'div#chapter-content.long-text.no-select.text-justify > a'
    ];
    const STORAGE_KEY = 'ad_blocker_enabled';

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[AdBlocker]', ...args);
        }
    }

    function isAdBlockerEnabled() {
        return GM_getValue(STORAGE_KEY, true);
    }

    function setAdBlockerEnabled(enabled) {
        GM_setValue(STORAGE_KEY, enabled);
        debugLog('Ad blocker ' + (enabled ? 'enabled' : 'disabled'));

        if (enabled) {
            blockAds();
        } else {
            unblockAds();
        }
    }

    function blockAds() {
        try {
            let blockedCount = 0;

            SELECTORS.forEach(selector => {
                const ads = document.querySelectorAll(selector);
                ads.forEach(ad => {
                    if (ad.style.display !== 'none') {
                        ad.style.display = 'none';
                        blockedCount++;
                        debugLog('Blocked ad element:', selector, ad);
                    }
                });
            });

            if (blockedCount > 0) {
                debugLog(`Blocked ${blockedCount} banner ads`);
                showNotification(`Đã chặn ${blockedCount} banner quảng cáo`, 3000);
            }

            return blockedCount;
        } catch (error) {
            debugLog('Error blocking ads:', error);
            return 0;
        }
    }

    function unblockAds() {
        try {
            let unblockedCount = 0;

            SELECTORS.forEach(selector => {
                const ads = document.querySelectorAll(selector);
                ads.forEach(ad => {
                    if (ad.style.display === 'none') {
                        ad.style.display = '';
                        unblockedCount++;
                        debugLog('Unblocked ad element:', selector, ad);
                    }
                });
            });

            if (unblockedCount > 0) {
                debugLog(`Unblocked ${unblockedCount} banner ads`);
                showNotification(`Đã bỏ chặn ${unblockedCount} banner quảng cáo`, 3000);
            }

            return unblockedCount;
        } catch (error) {
            debugLog('Error unblocking ads:', error);
            return 0;
        }
    }

    function toggleAdBlocker() {
        const currentlyEnabled = isAdBlockerEnabled();
        setAdBlockerEnabled(!currentlyEnabled);

        if (!currentlyEnabled) {
            showNotification('Ad Blocker đã được bật', 3000);
        } else {
            showNotification('Ad Blocker đã được tắt', 3000);
        }
    }

    function createAdBlockerDialog() {
        // Kiểm tra xem dialog đã tồn tại chưa
        if (document.querySelector('.hmt-adblocker-dialog')) {
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'hmt-adblocker-dialog';
        dialog.innerHTML = `
            <div class="hmt-adblocker-overlay">
                <div class="hmt-adblocker-content">
                    <div class="hmt-adblocker-header">
                        <div class="hmt-header-content">
                            <button class="hmt-adblocker-back">← Quay lại</button>
                            <div class="hmt-logo-section">
                                <div class="hmt-logo">🚫</div>
                                <div class="hmt-title-section">
                                    <h3>Ad Blocker</h3>
                                    <span class="hmt-subtitle">Chặn banner quảng cáo</span>
                                </div>
                            </div>
                        </div>
                        <button class="hmt-adblocker-close">&times;</button>
                    </div>
                    <div class="hmt-adblocker-body">
                        <div class="hmt-adblocker-section">
                            <h4>Cài đặt Ad Blocker</h4>
                            <p>Chặn các banner quảng cáo không mong muốn trên trang web. Tính năng này sẽ tự động ẩn các phần tử phù hợp với selector được chỉ định.</p>

                            <div class="hmt-adblocker-status">
                                <div class="hmt-status-item">
                                    <span class="hmt-status-label">Trạng thái:</span>
                                    <span class="hmt-status-value ${isAdBlockerEnabled() ? 'enabled' : 'disabled'}">
                                        ${isAdBlockerEnabled() ? 'Đã bật' : 'Đã tắt'}
                                    </span>
                                </div>
                                <div class="hmt-status-item">
                                    <span class="hmt-status-label">Selectors:</span>
                                    <span class="hmt-status-value" style="font-family: monospace; font-size: 11px; line-height: 1.3;">
                                        ${SELECTORS.join('<br>')}
                                    </span>
                                </div>
                            </div>

                            <div class="hmt-adblocker-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${isAdBlockerEnabled() ? 'checked' : ''} class="hmt-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Bật Ad Blocker
                                </label>
                            </div>

                        </div>

                        <div class="hmt-adblocker-info">
                            <h4>Thông tin</h4>
                            <div class="hmt-info-content">
                                <p><strong>Hoạt động:</strong> Tính năng này sẽ tự động ẩn các phần tử DOM phù hợp với các selector CSS được chỉ định.</p>
                                <p><strong>Đối tượng:</strong> Chặn banner quảng cáo và các liên kết không mong muốn trong nội dung chương truyện.</p>
                                <p><strong>Lưu ý:</strong> Thay đổi cài đặt sẽ được áp dụng ngay lập tức và được lưu lại cho các lần truy cập sau.</p>
                            </div>
                        </div>
                    </div>
                    <div class="hmt-adblocker-footer">
                        <button class="hmt-adblocker-close-btn">Đóng</button>
                    </div>
                </div>
            </div>
        `;

        // Thêm CSS
        GM_addStyle(`
            .hmt-adblocker-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .hmt-adblocker-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow: hidden;
                animation: hmtAdBlockerSlideIn 0.3s ease-out;
            }

            .hmt-adblocker-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
            }

            .hmt-header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
            }

            .hmt-adblocker-back {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.2s;
                margin-right: 16px;
            }

            .hmt-adblocker-back:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .hmt-logo-section {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .hmt-logo {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
                color: white;
            }

            .hmt-title-section h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }

            .hmt-subtitle {
                font-size: 14px;
                opacity: 0.9;
                font-weight: 400;
                margin-top: 2px;
                display: block;
            }

            .hmt-adblocker-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }

            .hmt-adblocker-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .hmt-adblocker-body {
                padding: 24px;
                max-height: 60vh;
                overflow-y: auto;
            }

            .hmt-adblocker-section {
                margin-bottom: 24px;
            }

            .hmt-adblocker-section h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-adblocker-section p {
                margin: 0 0 16px 0;
                color: #666;
                font-size: 14px;
                line-height: 1.5;
            }

            .hmt-adblocker-status {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }

            .hmt-status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .hmt-status-item:last-child {
                margin-bottom: 0;
            }

            .hmt-status-label {
                font-weight: 500;
                color: #495057;
            }

            .hmt-status-value {
                font-weight: 600;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
            }

            .hmt-status-value.enabled {
                background: #d4edda;
                color: #155724;
            }

            .hmt-status-value.disabled {
                background: #f8d7da;
                color: #721c24;
            }

            .hmt-adblocker-toggle {
                margin-bottom: 20px;
            }

            .hmt-toggle-label {
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #333;
            }

            .hmt-toggle-input {
                display: none;
            }

            .hmt-toggle-switch {
                position: relative;
                width: 44px;
                height: 24px;
                background: #ccc;
                border-radius: 12px;
                transition: background-color 0.3s;
            }

            .hmt-toggle-switch::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .hmt-toggle-input:checked + .hmt-toggle-switch {
                background: #28a745;
            }

            .hmt-toggle-input:checked + .hmt-toggle-switch::before {
                transform: translateX(20px);
            }

            .hmt-adblocker-info {
                padding: 16px;
                background: #e9ecef;
                border-radius: 8px;
            }

            .hmt-adblocker-info h4 {
                margin: 0 0 12px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-info-content p {
                margin: 0 0 8px 0;
                font-size: 13px;
                color: #495057;
                line-height: 1.4;
            }

            .hmt-info-content p:last-child {
                margin-bottom: 0;
            }

            .hmt-adblocker-footer {
                padding: 20px 24px;
                background: #f8f9fa;
                display: flex;
                justify-content: flex-end;
            }

            .hmt-adblocker-close-btn {
                padding: 10px 20px;
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .hmt-adblocker-close-btn:hover {
                background: #5a6268;
                transform: translateY(-1px);
            }

            @keyframes hmtAdBlockerSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* Dark mode support */
            body.dark .hmt-adblocker-content {
                background: #2d3748;
                color: #e2e8f0;
            }

            body.dark .hmt-adblocker-section h4 {
                color: #e2e8f0;
            }

            body.dark .hmt-adblocker-section p {
                color: #a0aec0;
            }

            body.dark .hmt-adblocker-status {
                background: #1a202c;
            }

            body.dark .hmt-status-label {
                color: #a0aec0;
            }

            body.dark .hmt-info-content p {
                color: #a0aec0;
            }

            body.dark .hmt-adblocker-info {
                background: #1a202c;
            }

            body.dark .hmt-adblocker-footer {
                background: #1a202c;
            }

            .hmt-adblocker-status .hmt-status-value {
                color: #4a4a4a;
            }
        `);

        document.body.appendChild(dialog);

        // Event listeners
        setupAdBlockerEventListeners(dialog);

        debugLog('Đã tạo ad blocker dialog');
    }

    function setupAdBlockerEventListeners(dialog) {
        const closeBtn = dialog.querySelector('.hmt-adblocker-close');
        const backBtn = dialog.querySelector('.hmt-adblocker-back');
        const closeBtnFooter = dialog.querySelector('.hmt-adblocker-close-btn');
        const overlay = dialog.querySelector('.hmt-adblocker-overlay');
        const toggleInput = dialog.querySelector('.hmt-toggle-input');

        // Đóng dialog
        function closeDialog() {
            dialog.remove();
        }

        closeBtn.addEventListener('click', closeDialog);
        backBtn.addEventListener('click', function() {
            closeDialog();
            // Open main menu after closing ad blocker dialog
            if (typeof window.HMTMainMenu !== 'undefined' && typeof window.HMTMainMenu.openMainMenu === 'function') {
                window.HMTMainMenu.openMainMenu();
            }
        });
        closeBtnFooter.addEventListener('click', closeDialog);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeDialog();
            }
        });

        // Toggle ad blocker
        toggleInput.addEventListener('change', function() {
            setAdBlockerEnabled(this.checked);

            // Cập nhật trạng thái hiển thị
            const statusValue = dialog.querySelector('.hmt-status-value');
            statusValue.textContent = this.checked ? 'Đã bật' : 'Đã tắt';
            statusValue.className = `hmt-status-value ${this.checked ? 'enabled' : 'disabled'}`;
        });


        // Đóng khi nhấn ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDialog();
            }
        });
    }

    function showNotification(message, timeout = 3000) {
        if (typeof GM_notification === 'function') {
            GM_notification({
                title: 'Ad Blocker',
                text: message,
                timeout: timeout,
                silent: false
            });
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                z-index: 10002;
                max-width: 300px;
                animation: slideIn 0.5s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

            notification.innerHTML = `
                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Ad Blocker</h4>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">${message}</p>
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, timeout);
        }
    }

    function openAdBlockerDialog() {
        createAdBlockerDialog();
    }

    // Auto-block ads when page loads if enabled
    function initializeAdBlocker() {
        if (isAdBlockerEnabled()) {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', blockAds);
            } else {
                blockAds();
            }

            // Also observe for dynamically added ads
            observeDynamicAds();
        }

        debugLog('Ad Blocker initialized');
    }

    // Observe for dynamically added ads
    function observeDynamicAds() {
        if (typeof MutationObserver === 'undefined') {
            return;
        }

        const observer = new MutationObserver(function(mutations) {
            if (isAdBlockerEnabled()) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        // Check if any added nodes match our selectors
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                SELECTORS.forEach(selector => {
                                    if (node.matches && node.matches(selector)) {
                                        node.style.display = 'none';
                                        debugLog('Blocked dynamically added ad:', selector, node);
                                    } else if (node.querySelectorAll) {
                                        const ads = node.querySelectorAll(selector);
                                        ads.forEach(ad => {
                                            ad.style.display = 'none';
                                            debugLog('Blocked dynamically added ad:', selector, ad);
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        debugLog('Dynamic ad observer started');
    }

    // Xuất các hàm cần thiết
    window.HMTAdBlocker = {
        isEnabled: isAdBlockerEnabled,
        setEnabled: setAdBlockerEnabled,
        toggle: toggleAdBlocker,
        openDialog: openAdBlockerDialog,
        initialize: initializeAdBlocker
    };

    // Initialize when module loads
    initializeAdBlocker();

    debugLog('Ad Blocker module đã được tải');

})();
