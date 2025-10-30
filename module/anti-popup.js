(function() {
    'use strict';

    const DEBUG = true;
    const SELECTORS = [
        // Advertisement popup triggers
        '[onclick*="window.open"]',
        '[onclick*="popup"]',
        '[onclick*="window"]',
        '.popup-trigger',
        '.open-popup',
        '.popup-link',
        'a[href*="popup"]',
        'a[href*="javascript:window"]',
        'button[onclick*="window"]',
        // Ad specific selectors
        '.ad-popup',
        '.promo-popup',
        '.newsletter-popup',
        '.cookie-notice',
        '.age-verification',
        '.survey-popup',
        '.advertisement-popup',
        '.sponsored-popup',
        '.marketing-popup'
    ];

    const STORAGE_KEY = 'anti_popup_enabled';
    const BLOCKED_POPUPS_KEY = 'blocked_popups_count';
    const WHITELIST_KEY = 'popup_whitelist';

    // Advertisement popup patterns to block (excluding authentication)
    const AD_PATTERNS = [
        'advertisement',
        'promo',
        'sponsored',
        'marketing',
        'survey',
        'newsletter'
    ];
    
    const SAFE_PATTERNS = [
        'login',
        'auth',
        'signin',
        'google',
        'facebook',
        'twitter'
    ];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[AntiPopup]', ...args);
        }
    }

    function isAntiPopupEnabled() {
        return GM_getValue(STORAGE_KEY, true);
    }

    function setAntiPopupEnabled(enabled) {
        GM_setValue(STORAGE_KEY, enabled);
        debugLog('Anti-popup ' + (enabled ? 'enabled' : 'disabled'));

        if (enabled) {
            enableAntiPopup();
        } else {
            disableAntiPopup();
        }
    }

    function getBlockedCount() {
        return GM_getValue(BLOCKED_POPUPS_KEY, 0);
    }

    function incrementBlockedCount() {
        const count = getBlockedCount() + 1;
        GM_setValue(BLOCKED_POPUPS_KEY, count);
        return count;
    }

    function getWhitelist() {
        return GM_getValue(WHITELIST_KEY, []);
    }

    function addToWhitelist(url) {
        const whitelist = getWhitelist();
        if (!whitelist.includes(url)) {
            whitelist.push(url);
            GM_setValue(WHITELIST_KEY, whitelist);
            debugLog('Added to whitelist:', url);
        }
    }

    function removeFromWhitelist(url) {
        const whitelist = getWhitelist().filter(item => item !== url);
        GM_setValue(WHITELIST_KEY, whitelist);
        debugLog('Removed from whitelist:', url);
    }

    // Check if URL is safe (authentication/login related)
    function isSafePopup(url, name) {
        if (!url && !name) return false;
        
        const urlString = (url || '').toLowerCase();
        const nameString = (name || '').toLowerCase();
        
        return SAFE_PATTERNS.some(pattern =>
            urlString.includes(pattern) || nameString.includes(pattern)
        );
    }

    // Check if URL is an advertisement popup
    function isAdPopup(url, name) {
        if (!url && !name) return false;
        
        const urlString = (url || '').toLowerCase();
        const nameString = (name || '').toLowerCase();
        
        return AD_PATTERNS.some(pattern =>
            urlString.includes(pattern) || nameString.includes(pattern)
        );
    }

    // Override window.open to block only advertisement popups
    function overrideWindowOpen() {
        if (window._originalWindowOpen) return; // Already overridden

        window._originalWindowOpen = window.open;
        
        window.open = function(url, name, features) {
            debugLog('Window.open called:', url, name, features);
            
            // Check whitelist first
            const whitelist = getWhitelist();
            if (url && whitelist.includes(url)) {
                debugLog('Popup allowed (whitelisted):', url);
                return window._originalWindowOpen(url, name, features);
            }

            // Allow safe popups (login/auth related)
            if (isSafePopup(url, name)) {
                debugLog('Popup allowed (safe):', url, name);
                return window._originalWindowOpen(url, name, features);
            }

            // Block advertisement popups
            if (isAdPopup(url, name)) {
                debugLog('Ad popup blocked:', url, name, features);
                incrementBlockedCount();
                showNotification(`Đã chặn quảng cáo popup: ${url || 'Unknown'}`, 3000);
                return null;
            }

            // Allow other popups by default (could be functional popups)
            debugLog('Popup allowed (functional):', url, name);
            return window._originalWindowOpen(url, name, features);
        };

        debugLog('Window.open đã bị override (ad popup only)');
    }

    // Restore original window.open
    function restoreWindowOpen() {
        if (window._originalWindowOpen) {
            window.open = window._originalWindowOpen;
            delete window._originalWindowOpen;
            debugLog('Window.open đã được restore');
        }
    }

    // Check if element is safe (authentication/login related)
    function isSafeElement(element) {
        const text = (element.textContent || '').toLowerCase();
        const href = (element.href || '').toLowerCase();
        const className = (element.className || '').toLowerCase();
        const id = (element.id || '').toLowerCase();
        
        const safeKeywords = [
            'login', 'signin', 'auth', 'sign in', 'log in',
            'google', 'facebook', 'twitter', 'oauth',
            'đăng nhập', 'đăng ký', 'sign up'
        ];
        
        return safeKeywords.some(keyword =>
            text.includes(keyword) ||
            href.includes(keyword) ||
            className.includes(keyword) ||
            id.includes(keyword)
        );
    }

    // Block advertisement popups based on selectors
    function blockPopupTriggers() {
        try {
            let blockedCount = 0;

            SELECTORS.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.style.display !== 'none') {
                        // Skip if element is related to authentication/login
                        if (isSafeElement(element)) {
                            debugLog('Safe popup element skipped:', selector, element);
                            return;
                        }

                        // Store original attributes
                        const originalOnclick = element.getclick || element.onclick;
                        const originalHref = element.href;

                        // Remove onclick handlers
                        element.onclick = null;
                        element.removeAttribute('onclick');

                        // Add our own handler to block popup
                        element.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            debugLog('Ad popup trigger blocked:', selector, element);
                            incrementBlockedCount();
                            
                            const href = this.href || 'unknown';
                            showNotification(`Đã chặn quảng cáo popup: ${href}`, 3000);
                        });

                        // Mark as processed
                        element.setAttribute('data-anti-popup-processed', 'true');
                        blockedCount++;
                    }
                });
            });

            if (blockedCount > 0) {
                debugLog(`Blocked ${blockedCount} advertisement popup triggers`);
            }

            return blockedCount;
        } catch (error) {
            debugLog('Error blocking popup triggers:', error);
            return 0;
        }
    }

    // Enable anti-popup functionality
    function enableAntiPopup() {
        try {
            overrideWindowOpen();
            blockPopupTriggers();
            observeDynamicElements();
            showNotification('Anti-Popup đã được bật', 3000);
        } catch (error) {
            debugLog('Error enabling anti-popup:', error);
        }
    }

    // Disable anti-popup functionality
    function disableAntiPopup() {
        try {
            restoreWindowOpen();
            // Remove our event listeners (this is tricky without keeping references)
            // For now, we'll just restore window.open
            showNotification('Anti-Popup đã được tắt', 3000);
        } catch (error) {
            debugLog('Error disabling anti-popup:', error);
        }
    }

    // Observe for dynamically added elements
    function observeDynamicElements() {
        if (typeof MutationObserver === 'undefined') {
            return;
        }

        const observer = new MutationObserver(function(mutations) {
            if (isAntiPopupEnabled()) {
                let shouldCheckPopups = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        shouldCheckPopups = true;
                    }
                });

                if (shouldCheckPopups) {
                    setTimeout(blockPopupTriggers, 100); // Small delay to ensure elements are added
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        debugLog('Dynamic element observer started');
    }

    // Create anti-popup dialog
    function createAntiPopupDialog() {
        // Check if dialog already exists
        if (document.querySelector('.hmt-antipopup-dialog')) {
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'hmt-antipopup-dialog';
        const blockedCount = getBlockedCount();
        const whitelist = getWhitelist();
        const isEnabled = isAntiPopupEnabled();

        dialog.innerHTML = `
            <div class="hmt-antipopup-overlay">
                <div class="hmt-antipopup-content">
                    <div class="hmt-antipopup-header">
                        <div class="hmt-header-content">
                            <div class="hmt-logo-section">
                                <div class="hmt-logo">🚫</div>
                                <div class="hmt-title-section">
                                    <h3>Ad Popup Blocker</h3>
                                    <span class="hmt-subtitle">Chặn quảng cáo popup và cửa sổ bật lên</span>
                                </div>
                            </div>
                        </div>
                        <button class="hmt-antipopup-close">&times;</button>
                    </div>
                    <div class="hmt-antipopup-body">
                        <div class="hmt-antipopup-section">
                            <h4>Cài đặt Ad Popup Blocker</h4>
                            <p>Chặn các popup quảng cáo không mong muốn. Tính năng này sẽ tự động ngăn chặn các trigger popup quảng cáo và override window.open() cho quảng cáo, nhưng cho phép popup đăng nhập như Google Login hoạt động bình thường.</p>

                            <div class="hmt-antipopup-status">
                                <div class="hmt-status-item">
                                    <span class="hmt-status-label">Trạng thái:</span>
                                    <span class="hmt-status-value ${isEnabled ? 'enabled' : 'disabled'}">
                                        ${isEnabled ? 'Đã bật' : 'Đã tắt'}
                                    </span>
                                </div>
                                <div class="hmt-status-item">
                                    <span class="hmt-status-label">Đã chặn:</span>
                                    <span class="hmt-status-value">${blockedCount} popup</span>
                                </div>
                                <div class="hmt-status-item">
                                    <span class="hmt-status-label">Whitelist:</span>
                                    <span class="hmt-status-value">${whitelist.length} URL</span>
                                </div>
                            </div>

                            <div class="hmt-antipopup-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${isEnabled ? 'checked' : ''} class="hmt-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Bật Ad Popup Blocker
                                </label>
                            </div>

                            <div class="hmt-antipopup-stats">
                                <button class="hmt-stats-btn" onclick="window.HMTAntiPopup.showStats()">
                                    📊 Xem thống kê chi tiết
                                </button>
                                <button class="hmt-stats-btn" onclick="window.HMTAntiPopup.clearStats()">
                                    🗑️ Xóa thống kê
                                </button>
                            </div>
                        </div>

                        <div class="hmt-antipopup-whitelist">
                            <h4>Whitelist URLs</h4>
                            <p>Các URL trong danh sách này sẽ không bị chặn:</p>
                            
                            <div class="hmt-whitelist-input">
                                <input type="text" placeholder="Nhập URL để thêm vào whitelist" class="hmt-whitelist-text">
                                <button class="hmt-whitelist-add">Thêm</button>
                            </div>
                            
                            <div class="hmt-whitelist-list">
                                ${whitelist.length > 0 ? whitelist.map(url => `
                                    <div class="hmt-whitelist-item">
                                        <span class="hmt-whitelist-url">${url}</span>
                                        <button class="hmt-whitelist-remove" data-url="${url}">×</button>
                                    </div>
                                `).join('') : '<p class="hmt-empty-list">Chưa có URL nào trong whitelist</p>'}
                            </div>
                        </div>

                        <div class="hmt-antipopup-info">
                            <h4>Thông tin</h4>
                            <div class="hmt-info-content">
                                <p><strong>Hoạt động:</strong> Chặn các popup quảng cáo bằng cách override window.open() và loại bỏ onclick handlers.</p>
                                <p><strong>Đối tượng:</strong> Chỉ chặn quảng cáo popup, không ảnh hưởng đến popup đăng nhập như Google Login, Facebook Login.</p>
                                <p><strong>An toàn:</strong> Tự động nhận diện và cho phép popup đăng nhập, xác thực hoạt động bình thường.</p>
                                <p><strong>Whitelist:</strong> Các URL trong whitelist sẽ không bị chặn để đảm bảo chức năng bình thường.</p>
                                <p><strong>Lưu ý:</strong> Thay đổi cài đặt sẽ được áp dụng ngay lập tức và được lưu lại cho các lần truy cập sau.</p>
                            </div>
                        </div>
                    </div>
                    <div class="hmt-antipopup-footer">
                        <button class="hmt-antipopup-close-btn">Đóng</button>
                    </div>
                </div>
            </div>
        `;

        // Add CSS
        GM_addStyle(`
            .hmt-antipopup-overlay {
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

            .hmt-antipopup-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                animation: hmtAntiPopupSlideIn 0.3s ease-out;
            }

            .hmt-antipopup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                color: white;
            }

            .hmt-header-content {
                display: flex;
                align-items: center;
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

            .hmt-antipopup-close {
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

            .hmt-antipopup-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .hmt-antipopup-body {
                padding: 24px;
                max-height: 60vh;
                overflow-y: auto;
            }

            .hmt-antipopup-section {
                margin-bottom: 24px;
            }

            .hmt-antipopup-section h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-antipopup-section p {
                margin: 0 0 16px 0;
                color: #666;
                font-size: 14px;
                line-height: 1.5;
            }

            .hmt-antipopup-status {
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

            .hmt-antipopup-toggle {
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
                background: #17a2b8;
            }

            .hmt-toggle-input:checked + .hmt-toggle-switch::before {
                transform: translateX(20px);
            }

            .hmt-antipopup-stats {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
            }

            .hmt-stats-btn {
                padding: 8px 16px;
                background: #e9ecef;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .hmt-stats-btn:hover {
                background: #dee2e6;
            }

            .hmt-antipopup-whitelist {
                margin-bottom: 24px;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .hmt-antipopup-whitelist h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-antipopup-whitelist p {
                margin: 0 0 12px 0;
                color: #666;
                font-size: 13px;
            }

            .hmt-whitelist-input {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            .hmt-whitelist-text {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ced4da;
                border-radius: 6px;
                font-size: 14px;
            }

            .hmt-whitelist-add {
                padding: 8px 16px;
                background: #17a2b8;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .hmt-whitelist-add:hover {
                background: #138496;
            }

            .hmt-whitelist-list {
                max-height: 150px;
                overflow-y: auto;
            }

            .hmt-whitelist-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                margin-bottom: 4px;
            }

            .hmt-whitelist-url {
                flex: 1;
                font-family: monospace;
                font-size: 12px;
                color: #495057;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .hmt-whitelist-remove {
                background: #dc3545;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .hmt-whitelist-remove:hover {
                background: #c82333;
            }

            .hmt-empty-list {
                text-align: center;
                color: #6c757d;
                font-style: italic;
                margin: 20px 0;
            }

            .hmt-antipopup-info {
                padding: 16px;
                background: #e9ecef;
                border-radius: 8px;
            }

            .hmt-antipopup-info h4 {
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

            .hmt-antipopup-footer {
                padding: 20px 24px;
                background: #f8f9fa;
                display: flex;
                justify-content: flex-end;
            }

            .hmt-antipopup-close-btn {
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

            .hmt-antipopup-close-btn:hover {
                background: #5a6268;
                transform: translateY(-1px);
            }

            @keyframes hmtAntiPopupSlideIn {
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
            body.dark .hmt-antipopup-content {
                background: #2d3748;
                color: #e2e8f0;
            }

            body.dark .hmt-antipopup-section h4 {
                color: #e2e8f0;
            }

            body.dark .hmt-antipopup-section p {
                color: #a0aec0;
            }

            body.dark .hmt-antipopup-status {
                background: #1a202c;
            }

            body.dark .hmt-status-label {
                color: #a0aec0;
            }

            body.dark .hmt-info-content p {
                color: #a0aec0;
            }

            body.dark .hmt-antipopup-info {
                background: #1a202c;
            }

            body.dark .hmt-antipopup-footer {
                background: #1a202c;
            }

            body.dark .hmt-antipopup-whitelist {
                background: #1a202c;
            }

            body.dark .hmt-whitelist-item {
                background: #2d3748;
                border-color: #4a5568;
            }

            body.dark .hmt-whitelist-url {
                color: #e2e8f0;
            }

            body.dark .hmt-whitelist-text {
                background: #2d3748;
                border-color: #4a5568;
                color: #e2e8f0;
            }
        `);

        document.body.appendChild(dialog);

        // Setup event listeners
        setupAntiPopupEventListeners(dialog);

        debugLog('Đã tạo anti-popup dialog');
    }

    function setupAntiPopupEventListeners(dialog) {
        const closeBtn = dialog.querySelector('.hmt-antipopup-close');
        const closeBtnFooter = dialog.querySelector('.hmt-antipopup-close-btn');
        const overlay = dialog.querySelector('.hmt-antipopup-overlay');
        const toggleInput = dialog.querySelector('.hmt-toggle-input');
        const whitelistInput = dialog.querySelector('.hmt-whitelist-text');
        const whitelistAdd = dialog.querySelector('.hmt-whitelist-add');
        const whitelistRemoveButtons = dialog.querySelectorAll('.hmt-whitelist-remove');

        // Close dialog
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

        // Toggle anti-popup
        toggleInput.addEventListener('change', function() {
            setAntiPopupEnabled(this.checked);

            // Update status display
            const statusValue = dialog.querySelector('.hmt-status-value');
            statusValue.textContent = this.checked ? 'Đã bật' : 'Đã tắt';
            statusValue.className = `hmt-status-value ${this.checked ? 'enabled' : 'disabled'}`;
        });

        // Add to whitelist
        whitelistAdd.addEventListener('click', function() {
            const url = whitelistInput.value.trim();
            if (url) {
                addToWhitelist(url);
                whitelistInput.value = '';
                // Refresh the dialog
                const newDialog = dialog.cloneNode(true);
                dialog.parentNode.replaceChild(newDialog, dialog);
                setupAntiPopupEventListeners(newDialog);
            }
        });

        // Remove from whitelist
        whitelistRemoveButtons.forEach(button => {
            button.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                removeFromWhitelist(url);
                // Refresh the dialog
                const newDialog = dialog.cloneNode(true);
                dialog.parentNode.replaceChild(newDialog, dialog);
                setupAntiPopupEventListeners(newDialog);
            });
        });

        // Enter key for whitelist input
        whitelistInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                whitelistAdd.click();
            }
        });

        // Close on ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDialog();
            }
        });
    }

    function showNotification(message, timeout = 3000) {
        if (typeof GM_notification === 'function') {
            GM_notification({
                title: 'Anti-Popup',
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
                background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
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
                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Anti-Popup</h4>
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

    function openAntiPopupDialog() {
        createAntiPopupDialog();
    }

    function showStats() {
        const blockedCount = getBlockedCount();
        const whitelist = getWhitelist();
        
        const stats = `
Anti-Popup Statistics:
─────────────────────
Tổng số popup đã chặn: ${blockedCount}
Số URL trong whitelist: ${whitelist.length}

Whitelist URLs:
${whitelist.map(url => `• ${url}`).join('\n') || '• (trống)'}

Kiểm tra lại: Các popup bị chặn sẽ không hiển thị.
        `.trim();

        alert(stats);
    }

    function clearStats() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả thống kê?')) {
            GM_setValue(BLOCKED_POPUPS_KEY, 0);
            showNotification('Đã xóa thống kê', 3000);
        }
    }

    // Initialize anti-popup
    function initializeAntiPopup() {
        if (isAntiPopupEnabled()) {
            enableAntiPopup();
        }

        debugLog('Anti-Popup initialized');
    }

    // Export functions
    window.HMTAntiPopup = {
        isEnabled: isAntiPopupEnabled,
        setEnabled: setAntiPopupEnabled,
        openDialog: openAntiPopupDialog,
        showStats: showStats,
        clearStats: clearStats,
        addToWhitelist: addToWhitelist,
        removeFromWhitelist: removeFromWhitelist,
        getBlockedCount: getBlockedCount,
        initialize: initializeAntiPopup
    };

    // Initialize when module loads
    initializeAntiPopup();

    debugLog('Anti-Popup module đã được tải');

})();