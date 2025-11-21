(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('main', ...args);
        } else if (DEBUG) {
            console.log('[HakoMonetTheme]', ...args);
        }
    }

    function loadScript(scriptContent, scriptName) {
        try {
            eval(scriptContent);
            debugLog(`Đã tải ${scriptName}`);
            return true;
        } catch (error) {
            debugLog(`Lỗi khi tải ${scriptName}:`, error);
            return false;
        }
    }
    
    function init() {
        debugLog('Đang khởi tạo HakoMonetTheme...');
        debugLog(`Phiên bản: ${GM_info.script.version}`);

        // Service Worker không khả dụng trong userscript context
        // registerServiceWorker(); // Disabled - SW requires same-origin

        // Thiết lập auto update
        console.log('[Main] Checking for HMTUpdateChecker');
        if (typeof window.HMTUpdateChecker !== 'undefined' && typeof window.HMTUpdateChecker.setupAutoUpdate === 'function') {
            console.log('[Main] Calling setupAutoUpdate');
            window.HMTUpdateChecker.setupAutoUpdate();
        } else {
            console.error('[Main] Update Checker API not loaded');
            debugLog('Update Checker API chưa được tải');
        }

        // Kiểm tra cập nhật tự động được xử lý bởi update-checker API
        // để tránh duplicate notifications

        // Thêm CSS cho update notification
        GM_addStyle(`
            .hmt-update-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                max-width: 300px;
                animation: hmtSlideIn 0.5s ease-out;
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .hmt-update-notification h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-update-notification p {
                margin: 0;
                font-size: 14px;
                opacity: 0.9;
            }

            .hmt-update-notification .close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            @keyframes hmtSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `);

        debugLog('Khởi tạo HakoMonetTheme hoàn tất');
    }
    
    function showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'hmt-update-notification';
        notification.style.background = 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)';
        notification.innerHTML = `
            <h4>Lỗi HakoMonetTheme</h4>
            <p>${message}</p>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Tự động ẩn sau 10 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    function showManualUpdateNotification(latestVersion) {
        const notification = document.createElement('div');
        notification.className = 'hmt-update-notification';
        notification.onclick = function() {
            window.open('https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js', '_blank');
            this.remove();
        };

        notification.innerHTML = `
            <h4>Có bản cập nhật mới!</h4>
            <p>Phiên bản ${latestVersion} đã có sẵn. Nhấn để cập nhật.</p>
            <button class="close-btn" onclick="event.stopPropagation(); this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(notification);

        // Tự động ẩn sau 15 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 15000);
    }

    // Khởi chạy
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
