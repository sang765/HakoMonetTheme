(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
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
        
        // Thiết lập auto update
        console.log('[Main] Checking for HMTUpdateChecker');
        if (typeof window.HMTUpdateChecker !== 'undefined' && typeof window.HMTUpdateChecker.setupAutoUpdate === 'function') {
            console.log('[Main] Calling setupAutoUpdate');
            window.HMTUpdateChecker.setupAutoUpdate();
        } else {
            console.log('[Main] Update Checker API not loaded');
            debugLog('Update Checker API chưa được tải');
        }
        
        // Load các module
        try {
            const monetJS = GM_getResourceText('monetJS');
            const updateCheckerJS = GM_getResourceText('updateCheckerJS');
            const simpleCORSJS = GM_getResourceText('simpleCORSJS');
            const themeDetectorJS = GM_getResourceText('themeDetectorJS');
            const infoTruyenJS = GM_getResourceText('infoTruyenJS');
            const animationJS = GM_getResourceText('animationJS');
            const monetAPIJS = GM_getResourceText('monetAPIJS');
            const tagColorJS = GM_getResourceText('tagColorJS');
            const colorinfotruyen = GM_getResourceText('colorinfotruyen');
            const imageAnalyzerJS = GM_getResourceText('imageAnalyzerJS');
            const configJS = GM_getResourceText('configJS');
            const adBlockerJS = GM_getResourceText('adBlockerJS');
            const antiPopupJS = GM_getResourceText('antiPopupJS');
            const blacklistJS = GM_getResourceText('blacklistJS');

            // Load module blacklist trước tiên (ưu tiên cao nhất)
            loadScript(blacklistJS, 'blacklist.js');

            // Kiểm tra xem có bị blacklist không
            if (typeof window.HMTBlacklist !== 'undefined' && !window.HMTBlacklist.init()) {
                debugLog('Trang bị blacklist, dừng tải các module khác');
                return; // Dừng việc tải các module khác
            }

            // Load các module theo thứ tự
            console.log('[Main] Loading update-checker.js');
            loadScript(updateCheckerJS, 'update-checker.js');
            loadScript(simpleCORSJS, 'simple-cors.js');
            loadScript(themeDetectorJS, 'theme-detector.js');
            loadScript(imageAnalyzerJS, 'image-analyzer.js');
            loadScript(infoTruyenJS, 'info-truyen.js');
            loadScript(tagColorJS, 'tag-color.js');
            loadScript(monetAPIJS, 'monet.js');
            loadScript(animationJS, 'animation.js');
            loadScript(monetJS, 'monet.js');
            loadScript(configJS, 'config.js');
            loadScript(adBlockerJS, 'ad-blocker.js');
            loadScript(antiPopupJS, 'anti-popup.js');
            loadScript(colorinfotruyen, 'page-info-truyen.js');
            
            debugLog('Tất cả module đã được tải');

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
            
        } catch (error) {
            debugLog('Lỗi khi tải module:', error);
            
            // Hiển thị thông báo lỗi
            showErrorNotification('Lỗi khi tải HakoMonetTheme. Vui lòng làm mới trang.');
        }
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
            window.open('https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js', '_blank');
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
