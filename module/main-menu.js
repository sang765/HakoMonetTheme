(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[MainMenu]', ...args);
        }
    }

    function openMainMenu() {
        // Kiểm tra xem dialog đã tồn tại chưa
        if (document.querySelector('.hmt-main-menu-dialog')) {
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'hmt-main-menu-dialog';
        dialog.innerHTML = `
            <div class="hmt-main-menu-overlay">
                <div class="hmt-main-menu-content">
                    <div class="hmt-main-menu-header">
                        <div class="hmt-header-content">
                            <div class="hmt-logo-section">
                                <img src="https://github.com/sang765/HakoMonetTheme/blob/main/.github/assets/logo.png?raw=true"
                                     alt="HakoMonetTheme Logo"
                                     class="hmt-logo">
                                <div class="hmt-title-section">
                                    <h3>HakoMonetTheme</h3>
                                    <span class="hmt-subtitle">Menu chính</span>
                                </div>
                            </div>
                        </div>
                        <button class="hmt-main-menu-close">&times;</button>
                    </div>
                    <div class="hmt-main-menu-body">
                        <div class="hmt-menu-grid">
                            <div class="hmt-menu-item" data-action="settings">
                                <div class="hmt-menu-icon">🎨</div>
                                <div class="hmt-menu-text">
                                    <h4>Cài đặt</h4>
                                    <p>Cài đặt màu sắc và tùy chỉnh theme</p>
                                </div>
                            </div>
                            <div class="hmt-menu-item" data-action="adblocker">
                                <div class="hmt-menu-icon">🚫</div>
                                <div class="hmt-menu-text">
                                    <h4>Ad Blocker</h4>
                                    <p>Chặn banner quảng cáo</p>
                                </div>
                            </div>
                            <div class="hmt-menu-item" data-action="antipopup">
                                <div class="hmt-menu-icon">🚫</div>
                                <div class="hmt-menu-text">
                                    <h4>Ad Popup Blocker</h4>
                                    <p>Chặn popup quảng cáo</p>
                                </div>
                            </div>
                            <div class="hmt-menu-item" data-action="discord">
                                <div class="hmt-menu-icon">💬</div>
                                <div class="hmt-menu-text">
                                    <h4>Tham gia Discord</h4>
                                    <p>The Mavericks</p>
                                </div>
                            </div>
                            <div class="hmt-menu-item" data-action="debug-toggle">
                                <div class="hmt-menu-icon">🔧</div>
                                <div class="hmt-menu-text">
                                    <h4>Debug Mode</h4>
                                    <p>Đang: ${GM_getValue('debug_mode', false) ? 'Bật' : 'Tắt'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="hmt-main-menu-footer">
                        <button class="hmt-main-menu-close-btn">Đóng</button>
                    </div>
                </div>
            </div>
        `;

        // Thêm CSS
        GM_addStyle(`
            .hmt-main-menu-overlay {
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

            .hmt-main-menu-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                animation: hmtMainMenuSlideIn 0.3s ease-out;
            }

            .hmt-main-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                object-fit: cover;
                border: 2px solid rgba(255, 255, 255, 0.2);
                transition: transform 0.3s ease;
                background: rgba(255, 255, 255, 0.1);
            }

            .hmt-logo:hover {
                transform: scale(1.05);
            }

            .hmt-logo:not([src]),
            .hmt-logo[src=""] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                color: white;
            }

            .hmt-logo:not([src])::after,
            .hmt-logo[src=""]::after {
                content: "🎨";
                font-size: 20px;
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

            .hmt-main-menu-close {
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

            .hmt-main-menu-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .hmt-main-menu-body {
                padding: 24px;
            }

            .hmt-menu-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
            }

            .hmt-menu-item {
                display: flex;
                align-items: center;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
            }

            .hmt-menu-item:hover {
                background: #e9ecef;
                border-color: #667eea;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            }

            .hmt-menu-icon {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: white;
                margin-right: 16px;
                flex-shrink: 0;
            }

            .hmt-menu-text h4 {
                margin: 0 0 4px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-menu-text p {
                margin: 0;
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }

            .hmt-main-menu-footer {
                padding: 20px 24px;
                background: #f8f9fa;
                display: flex;
                justify-content: flex-end;
            }

            .hmt-main-menu-close-btn {
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

            .hmt-main-menu-close-btn:hover {
                background: #5a6268;
                transform: translateY(-1px);
            }

            @keyframes hmtMainMenuSlideIn {
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
            body.dark .hmt-main-menu-content {
                background: #2d3748;
                color: #e2e8f0;
            }

            body.dark .hmt-menu-item {
                background: #1a202c;
            }

            body.dark .hmt-menu-item:hover {
                background: #2d3748;
            }

            body.dark .hmt-menu-text h4 {
                color: #e2e8f0;
            }

            body.dark .hmt-menu-text p {
                color: #a0aec0;
            }

            body.dark .hmt-main-menu-footer {
                background: #1a202c;
            }
        `);

        document.body.appendChild(dialog);

        // Event listeners
        function closeDialog() {
            dialog.remove();
        }

        const closeBtn = dialog.querySelector('.hmt-main-menu-close');
        const closeBtnFooter = dialog.querySelector('.hmt-main-menu-close-btn');
        const overlay = dialog.querySelector('.hmt-main-menu-overlay');
        const menuItems = dialog.querySelectorAll('.hmt-menu-item');

        closeBtn.addEventListener('click', closeDialog);
        closeBtnFooter.addEventListener('click', closeDialog);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeDialog();
            }
        });

        // Menu item actions
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                closeDialog(); // Close menu first

                switch(action) {
                    case 'settings':
                        if (typeof window.HMTConfig !== 'undefined' && typeof window.HMTConfig.openConfigDialog === 'function') {
                            window.HMTConfig.openConfigDialog();
                        } else {
                            showNotification('Lỗi', 'Module cài đặt màu sắc chưa được tải. Vui lòng làm mới trang.', 5000);
                        }
                        break;
                    case 'adblocker':
                        if (typeof window.HMTAdBlocker !== 'undefined' && typeof window.HMTAdBlocker.openDialog === 'function') {
                            window.HMTAdBlocker.openDialog();
                        } else {
                            showNotification('Lỗi', 'Module Ad Blocker chưa được tải. Vui lòng làm mới trang.', 5000);
                        }
                        break;
                    case 'antipopup':
                        if (typeof window.HMTAntiPopup !== 'undefined' && typeof window.HMTAntiPopup.openDialog === 'function') {
                            window.HMTAntiPopup.openDialog();
                        } else {
                            showNotification('Lỗi', 'Module Anti-Popup chưa được tải. Vui lòng làm mới trang.', 5000);
                        }
                        break;
                    case 'discord':
                        joinDiscord();
                        break;
                    case 'debug-toggle':
                        toggleDebugMode();
                        break;
                }
            });
        });

        // Close on ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDialog();
            }
        });

        // Xử lý lỗi load logo
        const logo = dialog.querySelector('.hmt-logo');
        if (logo) {
            logo.onerror = function() {
                this.src = '';
                this.onerror = null;
            };
        }

        debugLog('Đã tạo main menu dialog');
    }

    function joinDiscord() {
        const discordURL = 'https://discord.gg/uvQ6A3CDPq';
        try {
            GM_openInTab(discordURL);
            showNotification('Discord', 'Mở liên kết Discord...', 3000);
        } catch (e) {
            window.open(discordURL, '_blank');
            showNotification('Discord', 'Mở Discord trong tab mới (fallback)...', 3000);
            debugLog('GM_openInTab không khả dụng, dùng fallback window.open', e);
        }
    }

    function toggleDebugMode() {
        const currentDebug = GM_getValue('debug_mode', false);
        const newDebug = !currentDebug;

        GM_setValue('debug_mode', newDebug);

        showNotification(
            'Chế độ Debug',
            newDebug ? 'Đã bật chế độ debug' : 'Đã tắt chế độ debug',
            3000
        );

        debugLog(`Chế độ debug ${newDebug ? 'bật' : 'tắt'}`);

        // Reload để áp dụng thay đổi
        if (confirm('Cần tải lại trang để áp dụng thay đổi. Bạn có muốn tải lại ngay bây giờ không?')) {
            window.location.reload();
        }
    }

    function showNotification(title, message, timeout = 3000) {
        if (typeof GM_notification === 'function') {
            GM_notification({
                title: title,
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${title}</h4>
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

    // Export functions
    window.HMTMainMenu = {
        openMainMenu: openMainMenu,
        initialize: function() {
            debugLog('Main Menu module đã được khởi tạo');
        }
    };

    // Initialize when module loads
    debugLog('Main Menu module đã được tải');

})();
