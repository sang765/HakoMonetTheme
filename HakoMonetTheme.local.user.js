// ==UserScript==
// @name         Hako: Monet Theme (Local)
// @namespace    https://github.com/sang765
// @version      3.3.0
// @description  Material You theme for Hako/DocLN (Local Development Version).
// @description:vi Material You theme dành cho Hako/DocLN (Phiên bản phát triển cục bộ).
// @icon         https://github.com/sang765/HakoMonetTheme/raw/main/.github/assets/logo.png
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
// @run-at       document-end
// @require      https://greasyfork.org/scripts/447115-gm-config/code/GM_config.js?version=1060849
// @require      file://./main.js
// @require      file://./api/monet.js
// @require      file://./module/simple-cors.js
// @require      file://./class/info-truyen.js
// @require      file://./class/animation.js
// @require      file://./class/tag-color.js
// @require      file://./colors/page-info-truyen.js
// @require      file://./colors/page-general.js
// @require      file://./colors/page-general-light.js
// @require      file://./colors/page-info-truyen-light.js
// @require      file://./module/theme-detector.js
// @require      file://./module/config.js
// @require      file://./module/ad-blocker.js
// @require      file://./module/auto-reload.js
// @supportURL   https://github.com/sang765/HakoMonetTheme/issues
// @homepageURL  https://github.com/sang765/HakoMonetTheme
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // NOTE: This is a local test version for development only.
    // Do not use in production. For the official version, visit: https://github.com/sang765/HakoMonetTheme
    
    const DEBUG = true;
    const SCRIPT_NAME = 'Hako: Monet Theme (Local)';
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
            GM_registerMenuCommand('🎨 Cài đặt', openColorConfig, 'c');
            GM_registerMenuCommand('🚫 Ad Blocker', openAdBlockerConfig, 'a');
            GM_registerMenuCommand('📊 Thông tin script', showScriptInfo, 'i');
            GM_registerMenuCommand('🐛 Báo cáo lỗi', reportBug, 'b');
            GM_registerMenuCommand('💡 Đề xuất tính năng', suggestFeature, 'f');
            GM_registerMenuCommand('🔧 Debug Mode', toggleDebugMode, 'd');

            debugLog('Đã đăng ký menu commands');
        }
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

    function openColorConfig() {
        // Đảm bảo config module đã được tải
        if (typeof window.HMTConfig !== 'undefined' && typeof window.HMTConfig.openConfigDialog === 'function') {
            window.HMTConfig.openConfigDialog();
            showNotification('Cài đặt màu sắc', 'Mở bảng cài đặt màu sắc...', 3000);
        } else {
            showNotification('Lỗi', 'Module cài đặt màu sắc chưa được tải. Vui lòng làm mới trang.', 5000);
            debugLog('Config module chưa được tải');
        }
    }

    function openAdBlockerConfig() {
        // Đảm bảo ad blocker module đã được tải
        if (typeof window.HMTAdBlocker !== 'undefined' && typeof window.HMTAdBlocker.openDialog === 'function') {
            window.HMTAdBlocker.openDialog();
            showNotification('Ad Blocker', 'Mở bảng cài đặt Ad Blocker...', 3000);
        } else {
            showNotification('Lỗi', 'Module Ad Blocker chưa được tải. Vui lòng làm mới trang.', 5000);
            debugLog('Ad Blocker module chưa được tải');
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
    
    function initializeScript() {
        debugLog(`Bắt đầu khởi tạo ${SCRIPT_NAME} v${GM_info.script.version}`);
        
        // Đăng ký menu commands
        registerMenuCommands();
        
        // Modules are loaded via @require, no need to load manually
        
        // Only show initialization notification if user has enabled it or if there are errors
        const showInitNotification = GM_getValue('show_init_notification', false);
        if (showInitNotification) {
            showNotification(
                `${SCRIPT_NAME}`,
                `Đã khởi tạo thành công!`,
                3000
            );
        }
        
        debugLog('Khởi tạo script hoàn tất');
    }
    
    // Khởi chạy script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }
    
})();