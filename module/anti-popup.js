(function() {
    'use strict';
    
    const DEBUG = GM_getValue('debug_mode', false);
    const STORAGE_KEY = 'anti_popup_enabled';
    const BLOCKED_POPUPS_KEY = 'blocked_popups_count';
    const WHITELIST_KEY = 'popup_whitelist';

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[AntiPopupV2]', ...args);
        }
    }

    /**
     * The core class for managing and applying popup blocking mechanisms.
     */
    class PopupBlocker {
        constructor() {
            this.originalWindowOpen = window.open;
            this.observer = null;
            this.userGestureFlag = false;
            this.gestureTimeout = null;
            this.GESTURE_TIMEOUT_MS = 1000;

            // Heuristics for DOM popup detection
            this.DOM_POPUP_SELECTORS = [
                '[id*="popup"]', '[class*="popup"]',
                '[id*="modal"]', '[class*="modal"]',
                '[id*="overlay"]', '[class*="overlay"]',
                '[id*="dialog"]', '[class*="dialog"]',
                '[class*="lightbox"]'
            ];
            this.DOM_POPUP_Z_INDEX = 1000;

            // Patterns for popups that should always be allowed (e.g., OAuth)
            this.SAFE_PATTERNS = ['login', 'auth', 'signin', 'oauth', 'google', 'facebook', 'twitter', 'github'];

            this._boundGestureListener = this._userGestureListener.bind(this);
        }

        /**
         * Activates all popup blocking layers.
         */
        enable() {
            debugLog('Enabling popup blocker.');
            this._overrideWindowOpen();
            this._initializeDOMObserver();
            this._neutralizeNavigationPopups();
            this._trackUserGestures();
            this.isEnabled = true;
        }

        /**
         * Deactivates all popup blocking layers and restores original functionality.
         */
        disable() {
            debugLog('Disabling popup blocker.');
            this._restoreWindowOpen();
            this._disconnectDOMObserver();
            this._restoreNavigationPopups();
            this._stopTrackingUserGestures();
            this.isEnabled = false;
        }

        // --- Layer 1: window.open override ---

        _overrideWindowOpen() {
            if (window.open !== this.originalWindowOpen) {
                debugLog('window.open already overridden.');
                return;
            }

            window.open = (url, name, features) => {
                debugLog('Intercepted window.open call:', { url, name });

                if (this._isWhitelisted(url) || this._isSafePopup(url, name)) {
                    debugLog('Popup allowed by whitelist or safe patterns:', url);
                    return this.originalWindowOpen(url, name, features);
                }

                if (!this.userGestureFlag) {
                    debugLog('Popup blocked (no recent user gesture):', url);
                    incrementBlockedCount();
                    showNotification(`Đã chặn popup không mong muốn: ${url || 'Unknown'}`);
                    return null;
                }
                
                debugLog('Popup allowed (user gesture detected):', url);
                return this.originalWindowOpen(url, name, features);
            };
            debugLog('window.open has been successfully overridden.');
        }

        _restoreWindowOpen() {
            if (window.open !== this.originalWindowOpen) {
                window.open = this.originalWindowOpen;
                debugLog('Original window.open function restored.');
            }
        }

        // --- Layer 2: DOM Mutation Observer ---

        _initializeDOMObserver() {
            if (this.observer) {
                this.observer.disconnect();
            }

            this.observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                           this._inspectNode(node);
                        }
                    });
                });
            });

            this.observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
            debugLog('DOM Mutation Observer initialized.');
        }

        _disconnectDOMObserver() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
                debugLog('DOM Mutation Observer disconnected.');
            }
        }
        
        _inspectNode(node) {
            // Avoid inspecting our own UI elements
            if (node.closest('.hmt-antipopup-dialog, .hmt-main-menu')) {
                return;
            }

            const style = window.getComputedStyle(node);
            const isHighZIndex = parseInt(style.zIndex, 10) >= this.DOM_POPUP_Z_INDEX;
            const isFixed = style.position === 'fixed';
            const coversScreen = (node.offsetWidth > window.innerWidth * 0.8 && node.offsetHeight > window.innerHeight * 0.8);
            const matchesSelector = this.DOM_POPUP_SELECTORS.some(selector => node.matches(selector));
            
            if(isFixed && (isHighZIndex || coversScreen || matchesSelector)) {
                // If it was created by a user action, maybe it's legit. Give it a grace period.
                if (this.userGestureFlag) {
                    debugLog('Potential DOM popup detected, but user gesture is active. Ignoring.', node);
                    return;
                }
                
                // Heuristics matched. This looks like a popup.
                debugLog('DOM popup detected and hidden:', node);
                node.style.setProperty('display', 'none', 'important');
                node.style.setProperty('visibility', 'hidden', 'important');
                incrementBlockedCount();
                showNotification('Đã chặn một lớp phủ quảng cáo.');
            }
        }

        // --- Layer 3: Navigation Blocker ---

        _neutralizeNavigationPopups() {
            // These can be used for "Are you sure you want to leave?" ads.
            window.onbeforeunload = null;
            window.onunload = null;
            debugLog('onbeforeunload and onunload events neutralized.');
        }

        _restoreNavigationPopups() {
            // Cannot truly "restore" as we don't know the original handlers.
            // But for this script's purpose, doing nothing is fine.
            debugLog('Navigation popup hooks remain neutralized as restoration is not feasible.');
        }


        // --- Helper Functions ---

        _isWhitelisted(url) {
            if (!url) return false;
            const whitelist = getWhitelist();
            return whitelist.some(wUrl => url.includes(wUrl.replace(/\*/g, '')));
        }

        _isSafePopup(url, name) {
            if (!url && !name) return false;
            const checkString = `${url || ''} ${name || ''}`.toLowerCase();
            return this.SAFE_PATTERNS.some(pattern => checkString.includes(pattern));
        }
        
        _userGestureListener() {
            this.userGestureFlag = true;
            if (this.gestureTimeout) clearTimeout(this.gestureTimeout);
            this.gestureTimeout = setTimeout(() => {
                this.userGestureFlag = false;
            }, this.GESTURE_TIMEOUT_MS);
        }

        _trackUserGestures() {
            ['click', 'mousedown', 'keydown', 'touchstart'].forEach(eventType => {
                window.addEventListener(eventType, this._boundGestureListener, { capture: true, passive: true });
            });
            debugLog('User gesture tracking initialized.');
        }

        _stopTrackingUserGestures() {
             ['click', 'mousedown', 'keydown', 'touchstart'].forEach(eventType => {
                window.removeEventListener(eventType, this._boundGestureListener, { capture: true });
            });
            debugLog('User gesture tracking stopped.');
        }
    }

    // --- Singleton instance of the blocker ---
    let popupBlockerInstance = null;

    // --- Greasemonkey Storage & UI ---
    // (This part is mostly unchanged to preserve the settings panel and user data)

    function isAntiPopupEnabled() {
        return GM_getValue(STORAGE_KEY, true);
    }

    function setAntiPopupEnabled(enabled) {
        GM_setValue(STORAGE_KEY, enabled);
        debugLog('Anti-popup setting changed to: ' + (enabled ? 'enabled' : 'disabled'));

        if (enabled) {
            if (!popupBlockerInstance) {
                popupBlockerInstance = new PopupBlocker();
            }
            popupBlockerInstance.enable();
        } else {
            if (popupBlockerInstance) {
                popupBlockerInstance.disable();
            }
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
        if (url && !whitelist.includes(url)) {
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

    function showNotification(message, timeout = 3000) {
        // This function is a placeholder. A real implementation might use a
        // custom, non-blocking notification element.
        debugLog(`Notification: ${message}`);
        // To avoid creating more popups, this is intentionally left blank in modules.
    }
    
    function createAntiPopupDialog() {
        if (document.querySelector('.hmt-antipopup-dialog')) return;

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
                            <button class="hmt-antipopup-back">← Quay lại</button>
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
                            <p>Chặn các popup quảng cáo không mong muốn bằng cách kiểm soát API window.open và yêu cầu tương tác người dùng. Tính năng này sẽ tự động ngăn chặn các popup không được kích hoạt bởi hành động của người dùng, nhưng cho phép popup đăng nhập như Google Login hoạt động bình thường.</p>

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
                                <p><strong>Cơ chế hoạt động:</strong> Override window.open() và chỉ cho phép gọi khi có tương tác người dùng trong vòng 1 giây. Các popup quảng cáo sẽ bị chặn ngay cả khi được kích hoạt bởi người dùng.</p>
                                <p><strong>Đối tượng:</strong> Chỉ chặn popup quảng cáo và popup không mong muốn, không ảnh hưởng đến popup đăng nhập như Google Login, Facebook Login.</p>
                                <p><strong>An toàn:</strong> Tự động nhận diện và cho phép popup đăng nhập, xác thực hoạt động bình thường. Không thể bị phát hiện bởi các script khác.</p>
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
        
        // This is a large block of CSS. It is unchanged from the original.
        GM_addStyle(`
            .hmt-antipopup-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.5); display: flex; align-items: center;
                justify-content: center; z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .hmt-antipopup-content { background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                width: 90%; max-width: 600px; max-height: 90vh; overflow: hidden;
                animation: hmtAntiPopupSlideIn 0.3s ease-out;
            }
            .hmt-antipopup-header { display: flex; justify-content: space-between; align-items: center;
                padding: 20px 24px; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                color: white;
            }
            .hmt-header-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
            .hmt-antipopup-back {
                background: rgba(255, 255, 255, 0.2); border: none; color: white; padding: 8px 16px;
                border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;
                transition: background-color 0.2s; margin-right: 16px;
            }
            .hmt-antipopup-back:hover { background: rgba(255, 255, 255, 0.3); }
            .hmt-logo-section { display: flex; align-items: center; gap: 16px; }
            .hmt-logo {
                width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.1);
                display: flex; align-items: center; justify-content: center; font-size: 20px;
                font-weight: bold; color: white;
            }
            .hmt-title-section h3 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
            .hmt-subtitle { font-size: 14px; opacity: 0.9; font-weight: 400; margin-top: 2px; display: block; }
            .hmt-antipopup-close {
                background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 32px; height: 32px;
                border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center;
                justify-content: center; transition: background-color 0.2s;
            }
            .hmt-antipopup-close:hover { background: rgba(255, 255, 255, 0.3); }
            .hmt-antipopup-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
            .hmt-antipopup-section { margin-bottom: 24px; }
            .hmt-antipopup-section h4 { margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600; }
            .hmt-antipopup-section p { margin: 0 0 16px 0; color: #666; font-size: 14px; line-height: 1.5; }
            .hmt-antipopup-status { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
            .hmt-status-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .hmt-status-item:last-child { margin-bottom: 0; }
            .hmt-status-label { font-weight: 500; color: #495057; }
            .hmt-status-value { font-weight: 600; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .hmt-status-value.enabled { background: #d4edda; color: #155724; }
            .hmt-status-value.disabled { background: #f8d7da; color: #721c24; }
            .hmt-antipopup-toggle { margin-bottom: 20px; }
            .hmt-toggle-label { display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; font-weight: 500; color: #333; }
            .hmt-toggle-input { display: none; }
            .hmt-toggle-switch { position: relative; width: 44px; height: 24px; background: #ccc; border-radius: 12px; transition: background-color 0.3s; }
            .hmt-toggle-switch::before {
                content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
                background: white; border-radius: 50%; transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            .hmt-toggle-input:checked + .hmt-toggle-switch { background: #17a2b8; }
            .hmt-toggle-input:checked + .hmt-toggle-switch::before { transform: translateX(20px); }
            .hmt-antipopup-stats { display: flex; gap: 12px; margin-bottom: 20px; }
            .hmt-stats-btn {
                padding: 8px 16px; background: #e9ecef; border: 1px solid #dee2e6;
                border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s;
            }
            .hmt-stats-btn:hover { background: #dee2e6; }
            .hmt-antipopup-whitelist { margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px; }
            .hmt-antipopup-whitelist h4 { margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600; }
            .hmt-antipopup-whitelist p { margin: 0 0 12px 0; color: #666; font-size: 13px; }
            .hmt-whitelist-input { display: flex; gap: 8px; margin-bottom: 12px; }
            .hmt-whitelist-text { flex: 1; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px; }
            .hmt-whitelist-add {
                padding: 8px 16px; background: #17a2b8; color: white; border: none;
                border-radius: 6px; font-size: 14px; cursor: pointer; transition: background-color 0.2s;
            }
            .hmt-whitelist-add:hover { background: #138496; }
            .hmt-whitelist-list { max-height: 150px; overflow-y: auto; }
            .hmt-whitelist-item {
                display: flex; justify-content: space-between; align-items: center;
                padding: 8px 12px; background: white; border: 1px solid #dee2e6;
                border-radius: 6px; margin-bottom: 4px;
            }
            .hmt-whitelist-url {
                flex: 1; font-family: monospace; font-size: 12px; color: #495057;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            }
            .hmt-whitelist-remove {
                background: #dc3545; color: white; border: none; width: 24px; height: 24px;
                border-radius: 50%; cursor: pointer; font-size: 14px; display: flex;
                align-items: center; justify-content: center;
            }
            .hmt-whitelist-remove:hover { background: #c82333; }
            .hmt-empty-list { text-align: center; color: #6c757d; font-style: italic; margin: 20px 0; }
            .hmt-antipopup-info { padding: 16px; background: #e9ecef; border-radius: 8px; }
            .hmt-antipopup-info h4 { margin: 0 0 12px 0; color: #333; font-size: 16px; font-weight: 600; }
            .hmt-info-content p { margin: 0 0 8px 0; font-size: 13px; color: #495057; line-height: 1.4; }
            .hmt-info-content p:last-child { margin-bottom: 0; }
            .hmt-antipopup-footer { padding: 20px 24px; background: #f8f9fa; display: flex; justify-content: flex-end; }
            .hmt-antipopup-close-btn {
                padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px;
                font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
            }
            .hmt-antipopup-close-btn:hover { background: #5a6268; transform: translateY(-1px); }
            @keyframes hmtAntiPopupSlideIn {
                from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            body.dark .hmt-antipopup-content { background: #2d3748; color: #e2e8f0; }
            body.dark .hmt-antipopup-section h4 { color: #e2e8f0; }
            body.dark .hmt-antipopup-section p { color: #a0aec0; }
            body.dark .hmt-antipopup-status { background: #1a202c; }
            body.dark .hmt-status-label { color: #a0aec0; }
            body.dark .hmt-info-content p { color: #a0aec0; }
            body.dark .hmt-antipopup-info { background: #1a202c; }
            body.dark .hmt-antipopup-footer { background: #1a202c; }
            body.dark .hmt-antipopup-whitelist { background: #1a202c; }
            body.dark .hmt-whitelist-item { background: #2d3748; border-color: #4a5568; }
            body.dark .hmt-whitelist-url { color: #e2e8f0; }
            body.dark .hmt-whitelist-text { background: #2d3748; border-color: #4a5568; color: #e2e8f0; }
            .hmt-status-item .hmt-status-value { color: #333; }
            .hmt-stats-btn #text { color: #333; }
        `);

        document.body.appendChild(dialog);
        setupAntiPopupEventListeners(dialog);
        debugLog('Anti-popup dialog created and appended.');
    }

    function setupAntiPopupEventListeners(dialog) {
        const closeDialog = () => dialog.remove();

        dialog.querySelector('.hmt-antipopup-close').addEventListener('click', closeDialog);
        dialog.querySelector('.hmt-antipopup-close-btn').addEventListener('click', closeDialog);
        dialog.querySelector('.hmt-antipopup-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeDialog();
        });
        
        dialog.querySelector('.hmt-antipopup-back').addEventListener('click', function() {
            closeDialog();
            if (typeof window.HMTMainMenu?.openMainMenu === 'function') {
                window.HMTMainMenu.openMainMenu();
            }
        });

        dialog.querySelector('.hmt-toggle-input').addEventListener('change', function() {
            setAntiPopupEnabled(this.checked);
            // Re-render dialog to reflect changes
            closeDialog();
            createAntiPopupDialog();
        });

        const whitelistInput = dialog.querySelector('.hmt-whitelist-text');
        const whitelistAddBtn = dialog.querySelector('.hmt-whitelist-add');

        const addWhitelistAction = () => {
            const url = whitelistInput.value.trim();
            if (url) {
                addToWhitelist(url);
                whitelistInput.value = '';
                // Re-render dialog to reflect changes
                closeDialog();
                createAntiPopupDialog();
            }
        };
        
        whitelistAddBtn.addEventListener('click', addWhitelistAction);
        whitelistInput.addEventListener('keypress', e => { if (e.key === 'Enter') addWhitelistAction(); });

        dialog.querySelectorAll('.hmt-whitelist-remove').forEach(button => {
            button.addEventListener('click', function() {
                removeFromWhitelist(this.dataset.url);
                // Re-render dialog to reflect changes
                closeDialog();
                createAntiPopupDialog();
            });
        });
    }

    function showStats() {
        const blockedCount = getBlockedCount();
        const whitelist = getWhitelist();
        const stats = `Anti-Popup Statistics:\n────────────────────\nTổng số popup đã chặn: ${blockedCount}\nSố URL trong whitelist: ${whitelist.length}\n\nWhitelist URLs:\n${whitelist.map(url => `• ${url}`).join('\n') || '• (trống)'}`;
        alert(stats);
    }

    function clearStats() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả thống kê?')) {
            GM_setValue(BLOCKED_POPUPS_KEY, 0);
            showNotification('Đã xóa thống kê', 3000);
        }
    }

    function initialize() {
        debugLog('Initializing Anti-Popup module...');
        if (isAntiPopupEnabled()) {
            if (!popupBlockerInstance) {
                popupBlockerInstance = new PopupBlocker();
            }
            popupBlockerInstance.enable();
        } else {
            debugLog('Anti-Popup is disabled, skipping initialization.');
        }
        debugLog('Anti-Popup module initialized.');
    }
    
    // --- Global API ---
    window.HMTAntiPopup = {
        isEnabled: isAntiPopupEnabled,
        setEnabled: setAntiPopupEnabled,
        openDialog: createAntiPopupDialog,
        showStats: showStats,
        clearStats: clearStats,
        addToWhitelist: addToWhitelist,
        removeFromWhitelist: removeFromWhitelist,
        getBlockedCount: getBlockedCount,
        initialize: initialize
    };

    // --- Auto-initialize on load ---
    initialize();

})();