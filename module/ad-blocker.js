(function() {
    'use strict';

    const DEBUG = true;
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
                            <p>Chặn các banner quảng cáo không mong muốn trên trang web. Tính năng này sẽ ẩn các phần tử phù hợp với selector được chỉ định.</p>

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

                            <div class="hmt-adblocker-actions">
                                <button class="hmt-adblocker-manual-block">Chặn ngay</button>
                                <button class="hmt-adblocker-manual-unblock">Bỏ chặn</button>
                            </div>
                        </div>

                        <div class="hmt-adblocker-info">
                            <h4>Thông tin</h4>
                            <div class="hmt-info-content">
                                <p><strong>Hoạt động:</strong> Tính năng này sẽ ẩn các phần tử DOM phù hợp với các selector CSS được chỉ định.</p>
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

        // Thêm CSS với Material You design
        GM_addStyle(`
            .hmt-adblocker-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.32);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                backdrop-filter: blur(8px);
            }

            .hmt-adblocker-content {
                background: #fef7ff;
                border-radius: 28px;
                box-shadow:
                    0 8px 32px rgba(0, 0, 0, 0.12),
                    0 2px 8px rgba(0, 0, 0, 0.08);
                width: 90%;
                max-width: 520px;
                max-height: 90vh;
                overflow: hidden;
                animation: hmtAdBlockerSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                border: 1px solid rgba(255, 255, 255, 0.8);
            }

            .hmt-adblocker-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 32px;
                background: linear-gradient(135deg, #ba1a1a 0%, #d32f2f 100%);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .hmt-adblocker-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.02)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.02)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
            }

            .hmt-header-content {
                display: flex;
                align-items: center;
                position: relative;
                z-index: 1;
            }

            .hmt-logo-section {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .hmt-logo {
                width: 56px;
                height: 56px;
                border-radius: 16px;
                background: rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 600;
                color: white;
                border: 3px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .hmt-logo:hover {
                transform: scale(1.05) rotate(2deg);
                border-color: rgba(255, 255, 255, 0.25);
            }

            .hmt-title-section h3 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                letter-spacing: -0.25px;
            }

            .hmt-subtitle {
                font-size: 15px;
                opacity: 0.85;
                font-weight: 400;
                margin-top: 4px;
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
                padding: 32px;
                max-height: 60vh;
                overflow-y: auto;
            }

            .hmt-adblocker-section {
                margin-bottom: 32px;
                padding: 24px;
                background: rgba(186, 26, 26, 0.02);
                border-radius: 20px;
                border: 1px solid rgba(186, 26, 26, 0.08);
                position: relative;
            }

            .hmt-adblocker-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(135deg, #ba1a1a 0%, #d32f2f 100%);
                border-radius: 2px;
            }

            .hmt-adblocker-section h4 {
                margin: 0 0 12px 0;
                color: #1c1b1f;
                font-size: 18px;
                font-weight: 600;
                letter-spacing: -0.25px;
            }

            .hmt-adblocker-section p {
                margin: 0 0 20px 0;
                color: #49454f;
                font-size: 15px;
                line-height: 1.6;
            }

            .hmt-adblocker-status {
                background: linear-gradient(135deg, #fef7ff 0%, #fef7ff 100%);
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 24px;
                border: 1px solid rgba(186, 26, 26, 0.08);
            }

            .hmt-status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding: 8px 0;
            }

            .hmt-status-item:last-child {
                margin-bottom: 0;
            }

            .hmt-status-label {
                font-weight: 500;
                color: #1c1b1f;
                font-size: 15px;
            }

            .hmt-status-value {
                font-weight: 600;
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 13px;
                min-width: 60px;
                text-align: center;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .hmt-status-value.enabled {
                background: linear-gradient(135deg, #146c2e 0%, #1d7e3f 100%);
                color: #ffffff;
                box-shadow: 0 2px 8px rgba(20, 108, 46, 0.25);
            }

            .hmt-status-value.disabled {
                background: linear-gradient(135deg, #ba1a1a 0%, #d32f2f 100%);
                color: #ffffff;
                box-shadow: 0 2px 8px rgba(186, 26, 26, 0.25);
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
                width: 52px;
                height: 28px;
                background: #79747e;
                border-radius: 16px;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                cursor: pointer;
            }

            .hmt-toggle-switch::before {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 22px;
                height: 22px;
                background: #ffffff;
                border-radius: 50%;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .hmt-toggle-input:checked + .hmt-toggle-switch {
                background: linear-gradient(135deg, #146c2e 0%, #1d7e3f 100%);
            }

            .hmt-toggle-input:checked + .hmt-toggle-switch::before {
                transform: translateX(24px);
                box-shadow: 0 4px 12px rgba(20, 108, 46, 0.25);
            }

            .hmt-adblocker-actions {
                display: flex;
                gap: 12px;
            }

            .hmt-adblocker-manual-block,
            .hmt-adblocker-manual-unblock {
                padding: 12px 24px;
                border: none;
                border-radius: 20px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                overflow: hidden;
                min-width: 100px;
            }

            .hmt-adblocker-manual-block {
                background: linear-gradient(135deg, #ba1a1a 0%, #d32f2f 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(186, 26, 26, 0.25);
            }

            .hmt-adblocker-manual-block:hover {
                background: linear-gradient(135deg, #d32f2f 0%, #ba1a1a 100%);
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 8px 24px rgba(186, 26, 26, 0.35);
            }

            .hmt-adblocker-manual-unblock {
                background: linear-gradient(135deg, #79747e 0%, #625b71 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(121, 116, 126, 0.25);
            }

            .hmt-adblocker-manual-unblock:hover {
                background: linear-gradient(135deg, #625b71 0%, #79747e 100%);
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 8px 24px rgba(121, 116, 126, 0.35);
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
                padding: 28px 32px;
                background: linear-gradient(135deg, #f7f2fa 0%, #fef7ff 100%);
                display: flex;
                justify-content: flex-end;
                border-top: 1px solid rgba(186, 26, 26, 0.08);
            }

            .hmt-adblocker-close-btn {
                padding: 14px 28px;
                background: linear-gradient(135deg, #79747e 0%, #625b71 100%);
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                box-shadow: 0 4px 12px rgba(121, 116, 126, 0.25);
                position: relative;
                overflow: hidden;
            }

            .hmt-adblocker-close-btn:hover {
                background: linear-gradient(135deg, #625b71 0%, #79747e 100%);
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 8px 24px rgba(121, 116, 126, 0.35);
            }

            @keyframes hmtAdBlockerSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.85) translateY(40px) rotate(-2deg);
                    filter: blur(8px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0) rotate(0deg);
                    filter: blur(0px);
                }
            }

            /* Enhanced animations for Material You */
            @keyframes hmtFadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes hmtScaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .hmt-adblocker-section {
                animation: hmtFadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both;
            }

            .hmt-adblocker-info {
                animation: hmtFadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
            }

            /* Dark mode support với Material You */
            body.dark .hmt-adblocker-overlay {
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(12px);
            }

            body.dark .hmt-adblocker-content {
                background: #1c1b1f;
                color: #e6e1e5;
                border-color: rgba(255, 255, 255, 0.1);
            }

            body.dark .hmt-adblocker-header {
                background: linear-gradient(135deg, #ba1a1a 0%, #d32f2f 100%);
            }

            body.dark .hmt-adblocker-section {
                background: rgba(186, 26, 26, 0.08);
                border-color: rgba(208, 188, 255, 0.12);
            }

            body.dark .hmt-adblocker-section h4 {
                color: #e6e1e5;
            }

            body.dark .hmt-adblocker-section p {
                color: #cac4d0;
            }

            body.dark .hmt-adblocker-status {
                background: #1a202c;
            }

            body.dark .hmt-status-label {
                color: #e6e1e5;
            }

            body.dark .hmt-info-content p {
                color: #cac4d0;
            }

            body.dark .hmt-adblocker-info {
                background: rgba(74, 68, 88, 0.3);
                border: 1px solid rgba(186, 180, 199, 0.12);
            }

            body.dark .hmt-adblocker-footer {
                background: linear-gradient(135deg, #2b2930 0%, #1c1b1f 100%);
                border-color: rgba(186, 180, 199, 0.08);
            }

            body.dark .hmt-adblocker-status {
                background: linear-gradient(135deg, #2b2930 0%, #1c1b1f 100%);
                border-color: rgba(208, 188, 255, 0.12);
            }
        `);

        document.body.appendChild(dialog);

        // Event listeners
        setupAdBlockerEventListeners(dialog);

        debugLog('Đã tạo ad blocker dialog');
    }

    function setupAdBlockerEventListeners(dialog) {
        const closeBtn = dialog.querySelector('.hmt-adblocker-close');
        const closeBtnFooter = dialog.querySelector('.hmt-adblocker-close-btn');
        const overlay = dialog.querySelector('.hmt-adblocker-overlay');
        const toggleInput = dialog.querySelector('.hmt-toggle-input');
        const manualBlockBtn = dialog.querySelector('.hmt-adblocker-manual-block');
        const manualUnblockBtn = dialog.querySelector('.hmt-adblocker-manual-unblock');

        // Đóng dialog
        function closeDialog() {
            dialog.remove();
        }

        closeBtn.addEventListener('click', closeDialog);
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

        // Manual block
        manualBlockBtn.addEventListener('click', function() {
            const blockedCount = blockAds();
            if (blockedCount > 0) {
                showNotification(`Đã chặn ${blockedCount} banner quảng cáo`, 3000);
            } else {
                showNotification('Không tìm thấy banner quảng cáo nào để chặn', 3000);
            }
        });

        // Manual unblock
        manualUnblockBtn.addEventListener('click', function() {
            const unblockedCount = unblockAds();
            if (unblockedCount > 0) {
                showNotification(`Đã bỏ chặn ${unblockedCount} banner quảng cáo`, 3000);
            } else {
                showNotification('Không tìm thấy banner quảng cáo nào để bỏ chặn', 3000);
            }
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
        blockAds: blockAds,
        unblockAds: unblockAds,
        openDialog: openAdBlockerDialog,
        initialize: initializeAdBlocker
    };

    // Initialize when module loads
    initializeAdBlocker();

    debugLog('Ad Blocker module đã được tải');

})();