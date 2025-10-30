(function() {
    'use strict';
    
    const DEBUG = true;
    const CHECK_UPDATE_INTERVAL = 30 * 60 * 1000; // 30 phút
    const VERSION = '3.5.0';
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/HakoMonetTheme.user.js';
    
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
    
    function checkForUpdates() {
        // Kiểm tra xem người dùng có bật thông báo cập nhật không
        const updateNotificationsEnabled = GM_getValue('update_notifications_enabled', true);
        if (!updateNotificationsEnabled) {
            debugLog('Thông báo cập nhật đã bị tắt bởi người dùng');
            // Vẫn lưu thời gian kiểm tra để tránh spam requests
            GM_setValue('lastUpdateCheck', Date.now());
            return;
        }

        debugLog('Đang kiểm tra cập nhật...');

        GM_xmlhttpRequest({
            method: 'GET',
            url: GITHUB_RAW_URL + '?t=' + new Date().getTime(),
            timeout: 10000,
            onload: function(response) {
                if (response.status === 200) {
                    const scriptContent = response.responseText;
                    const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);

                    if (versionMatch && versionMatch[1]) {
                        const latestVersion = versionMatch[1];
                        debugLog(`Phiên bản hiện tại: ${VERSION}, Phiên bản mới nhất: ${latestVersion}`);

                        if (isNewerVersion(latestVersion, VERSION)) {
                            debugLog('Đã tìm thấy phiên bản mới!');
                            showUpdateNotification(latestVersion);
                        } else {
                            debugLog('Đang sử dụng phiên bản mới nhất.');
                        }

                        // Lưu thời gian kiểm tra cuối cùng
                        GM_setValue('lastUpdateCheck', Date.now());
                    }
                }
            },
            onerror: function(error) {
                debugLog('Lỗi khi kiểm tra cập nhật:', error);
                // Vẫn lưu thời gian kiểm tra để tránh spam requests
                GM_setValue('lastUpdateCheck', Date.now());
            },
            ontimeout: function() {
                debugLog('Hết thời gian kiểm tra cập nhật');
                // Vẫn lưu thời gian kiểm tra để tránh spam requests
                GM_setValue('lastUpdateCheck', Date.now());
            }
        });
    }
    
    function isNewerVersion(newVersion, currentVersion) {
        const newParts = newVersion.split('.').map(Number);
        const currentParts = currentVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
            const newPart = newParts[i] || 0;
            const currentPart = currentParts[i] || 0;
            
            if (newPart > currentPart) return true;
            if (newPart < currentPart) return false;
        }
        
        return false;
    }
    
    function showUpdateNotification(latestVersion) {
        if (typeof GM_notification !== 'undefined') {
            GM_notification({
                title: 'HakoMonetTheme - Có bản cập nhật mới',
                text: `Phiên bản ${latestVersion} đã có sẵn. Nhấn để cập nhật.`,
                timeout: 10000,
                onclick: function() {
                    window.open('https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js', '_blank');
                }
            });
        } else {
            // Fallback cho các userscript manager không hỗ trợ GM_notification
            if (confirm(`HakoMonetTheme phiên bản ${latestVersion} đã có sẵn. Bạn có muốn cập nhật ngay bây giờ không?`)) {
                window.open('https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js', '_blank');
            }
        }
    }
    
    function setupAutoUpdate() {
        // Kiểm tra xem người dùng có bật tự động kiểm tra cập nhật không
        const autoUpdateEnabled = GM_getValue('auto_update_enabled', true);
        if (!autoUpdateEnabled) {
            debugLog('Tự động kiểm tra cập nhật đã bị tắt bởi người dùng');
            return;
        }

        // Kiểm tra lần cuối cập nhật
        const lastUpdateCheck = GM_getValue('lastUpdateCheck', 0);
        const now = Date.now();

        // Nếu chưa từng kiểm tra hoặc đã qua khoảng thời gian kiểm tra kể từ lần kiểm tra cuối
        if (now - lastUpdateCheck > CHECK_UPDATE_INTERVAL) {
            checkForUpdates();
        }

        // Thiết lập interval để kiểm tra định kỳ
        setInterval(checkForUpdates, CHECK_UPDATE_INTERVAL);

        debugLog('Đã thiết lập tự động kiểm tra cập nhật mỗi 30 phút');
    }
    
    function init() {
        debugLog('Đang khởi tạo HakoMonetTheme...');
        debugLog(`Phiên bản: ${VERSION}`);
        
        // Thiết lập auto update
        setupAutoUpdate();
        
        // Load các module
        try {
            const monetJS = GM_getResourceText('monetJS');
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
            
            // Load các module theo thứ tự
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
