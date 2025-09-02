// ==UserScript==
// @name         Hako: Monet Theme [Nightly]
// @namespace    https://github.com/sang765
// @version      2.9.7
// @description  Material You theme for Hako/DocLN.
// @description:vi Material You theme dành cho Hako/DocLN.
// @icon         https://docln.sbs/img/logo-9.png
// @author       SangsDayy
// @match        https://docln.sbs/*
// @match        https://docln.net/*
// @match        https://ln.hako.vn/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_openInTab
// @connect      *
// @run-at       document-end
// @require      https://greasyfork.org/scripts/447115-gm-config/code/GM_config.js?version=1060849
// @resource     mainJS ./main.js
// @resource     monetJS ./module/monet.js
// @resource     crosUnblockJS ./module/cros-unblock.js
// @resource     infoTruyenJS ./class/info-truyen.js
// @resource     animationJS ./class/animation.js
// @resource     monetClassJS ./class/monet.js
// @resource     tagColorJS ./class/tag-color.js
// @resource     configJS ./config.js
// @resource     utilsJS ./utils.js
// @resource     colorUtilsJS ./module/color-utils.js
// @resource     domUtilsJS ./module/dom-utils.js
// @resource     storageJS ./module/storage.js
// @resource     settingsJS ./module/settings.js
// @supportURL   https://github.com/sang765/HakoMonetTheme/issues
// @updateURL    https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @downloadURL  https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @homepageURL  https://github.com/sang765/HakoMonetTheme
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    const DEBUG = true;
    const SCRIPT_NAME = 'Hako: Monet Theme';
    const GITHUB_REPO = 'https://github.com/sang765/HakoMonetTheme';
    const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/';
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log(`[${SCRIPT_NAME}]`, ...args);
        }
    }
    
    function showNotification(title, message, timeout = 5000) {
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
                z-index: 10000;
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
    
    function registerMenuCommands() {
        // Command để kiểm tra cập nhật
        if (typeof GM_registerMenuCommand === 'function') {
            GM_registerMenuCommand('🔄 Kiểm tra cập nhật', checkForUpdatesManual, 'u');
            GM_registerMenuCommand('⚙️ Cài đặt', openSettings, 's');
            GM_registerMenuCommand('📊 Thông tin script', showScriptInfo, 'i');
            GM_registerMenuCommand('🐛 Báo cáo lỗi', reportBug, 'b');
            GM_registerMenuCommand('💡 Đề xuất tính năng', suggestFeature, 'f');
            GM_registerMenuCommand('🔧 Debug Mode', toggleDebugMode, 'd');
            
            debugLog('Đã đăng ký menu commands');
        }
    }
    
    function checkForUpdatesManual() {
        showNotification('Kiểm tra cập nhật', 'Đang kiểm tra phiên bản mới...', 3000);
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: RAW_GITHUB_URL + 'HakoMonetTheme.user.js?t=' + new Date().getTime(),
            timeout: 10000,
            onload: function(response) {
                if (response.status === 200) {
                    const scriptContent = response.responseText;
                    const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
                    
                    if (versionMatch && versionMatch[1]) {
                        const latestVersion = versionMatch[1];
                        const currentVersion = GM_info.script.version;
                        
                        if (isNewerVersion(latestVersion, currentVersion)) {
                            showNotification(
                                'Có bản cập nhật mới!', 
                                `Phiên bản ${latestVersion} đã có sẵn. Nhấp để cập nhật.`,
                                8000
                            );
                            
                            if (confirm(`Phiên bản mới ${latestVersion} đã có sẵn! Bạn có muốn cập nhật ngay bây giờ không?`)) {
                                GM_openInTab(RAW_GITHUB_URL + 'HakoMonetTheme.user.js');
                            }
                        } else {
                            showNotification('Thông tin', 'Bạn đang sử dụng phiên bản mới nhất!', 3000);
                        }
                    }
                }
            },
            onerror: function(error) {
                showNotification('Lỗi', 'Không thể kiểm tra cập nhật. Vui lòng thử lại sau.', 5000);
                debugLog('Lỗi khi kiểm tra cập nhật:', error);
            },
            ontimeout: function() {
                showNotification('Lỗi', 'Hết thời gian kiểm tra cập nhật.', 5000);
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
    
    function openSettings() {
        // Mở trang cài đặt hoặc tạo dialog settings
        showNotification('Cài đặt', 'Tính năng cài đặt đang được phát triển.', 3000);
        debugLog('Mở cài đặt');
        
        // Có thể tích hợp với GM_config sau này
        try {
            if (typeof GM_config !== 'undefined') {
                GM_config.open();
            }
        } catch (e) {
            debugLog('GM_config không khả dụng:', e);
        }
    }
    
    function showScriptInfo() {
        const info = `
Tên: ${GM_info.script.name}
Phiên bản: ${GM_info.script.version}
Tác giả: ${GM_info.script.author}
Mô tả: ${GM_info.script.description}

Handler: ${GM_info.scriptHandler || 'Unknown'}
Engine: ${GM_info.scriptEngine || 'Unknown'}

GitHub: ${GITHUB_REPO}
Báo cáo lỗi: ${GITHUB_REPO}/issues
        `.trim();
        
        alert(info);
        debugLog('Hiển thị thông tin script');
    }
    
    function reportBug() {
        GM_openInTab(GITHUB_REPO + '/issues/new?template=bug_report.md');
        showNotification('Báo cáo lỗi', 'Mở trang báo cáo lỗi trên GitHub...', 3000);
    }
    
    function suggestFeature() {
        GM_openInTab(GITHUB_REPO + '/issues/new?template=feature_request.md');
        showNotification('Đề xuất tính năng', 'Mở trang đề xuất tính năng trên GitHub...', 3000);
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
    
    function loadAllResources() {
        const resources = [
            'mainJS', 'monetJS', 'crosUnblockJS', 'infoTruyenJS', 
            'animationJS', 'monetClassJS', 'tagColorJS', 'configJS',
            'utilsJS', 'colorUtilsJS', 'domUtilsJS', 'storageJS', 'settingsJS'
        ];
        
        let loadedCount = 0;
        let failedCount = 0;
        
        resources.forEach(resourceName => {
            try {
                const resourceContent = GM_getResourceText(resourceName);
                if (resourceContent) {
                    eval(resourceContent);
                    loadedCount++;
                    debugLog(`Đã tải ${resourceName}`);
                } else {
                    debugLog(`Không tìm thấy resource: ${resourceName}`);
                    failedCount++;
                }
            } catch (error) {
                debugLog(`Lỗi khi tải ${resourceName}:`, error);
                failedCount++;
            }
        });
        
        if (failedCount > 0) {
            debugLog(`Tải resources: ${loadedCount} thành công, ${failedCount} thất bại`);
            
            if (failedCount === resources.length) {
                showNotification(
                    'Lỗi nghiêm trọng', 
                    'Không thể tải bất kỳ resource nào. Vui lòng cài đặt lại script.',
                    10000
                );
            }
        } else {
            debugLog('Đã tải tất cả resources thành công');
        }
        
        return loadedCount;
    }
    
    function initializeScript() {
        debugLog(`Bắt đầu khởi tạo ${SCRIPT_NAME} v${GM_info.script.version}`);
        
        // Đăng ký menu commands
        registerMenuCommands();
        
        // Tải tất cả resources
        const loadedCount = loadAllResources();
        
        if (loadedCount > 0) {
            showNotification(
                `${SCRIPT_NAME}`, 
                `Đã tải ${loadedCount} modules thành công!`,
                3000
            );
        }
        
        // Kiểm tra cập nhật tự động (sau 5 giây)
        setTimeout(() => {
            if (GM_getValue('auto_update_check', true)) {
                checkForUpdatesManual();
            }
        }, 5000);
        
        debugLog('Khởi tạo script hoàn tất');
    }
    
    // Khởi chạy script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }
    
})();
