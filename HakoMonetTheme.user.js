// ==UserScript==
// @name         Hako: Monet Theme
// @namespace    https://github.com/sang765
// @version      5.7.3
// @description  Material You theme for Hako/DocLN.
// @description:vi Material You theme dành cho Hako/DocLN.
// @icon         https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/.github/assets/logo.png
// @author       sang765
// @match        *://docln.sbs/*
// @match        *://docln.net/*
// @match        *://ln.hako.vn/*
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
// @grant        unsafeWindow
// @connect      *
// @run-at       document-start
// @supportURL   https://github.com/sang765/HakoMonetTheme/issues
// @updateURL    https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/HakoMonetTheme.user.js
// @downloadURL  https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/HakoMonetTheme.user.js
// @homepageURL  https://github.com/sang765/HakoMonetTheme
// @license      MIT
// @discord      https://discord.gg/uvQ6A3CDPq
// @resource     mainJS ./main.js
// @resource     monetAPIJS ./api/monet.js
// @resource     updateCheckerJS ./api/update-checker.js
// @resource     CORSJS ./module/cors.js
// @resource     infoTruyenJS ./class/info-truyen.js
// @resource     readingPageJS ./class/reading-page.js
// @resource     animationJS ./class/animation.js
// @resource     tagColorJS ./class/tag-color.js
// @resource     fontImportJS ./class/font-import.js
// @resource     colorinfotruyen ./colors/page-info-truyen-dark.js
// @resource     pagegeneralJS ./colors/page-general-dark.js
// @resource     pagegenerallightJS ./colors/page-general-light.js
// @resource     colorinfotruyenlight ./colors/page-info-truyen-light.js
// @resource     pageprofileJS ./colors/page-profile-dark.js
// @resource     pageprofilelightJS ./colors/page-profile-light.js
// @resource     colorsLoaderJS ./module/colors-loader.js
// @resource     themeDetectorJS ./module/theme-detector.js
// @resource     deviceDetectorJS ./module/device-detector.js
// @resource     configJS ./module/config.js
// @resource     adBlockerJS ./module/ad-blocker.js
// @resource     autoReloadJS ./module/auto-reload.js
// @resource     antiPopupJS ./module/anti-popup.js
// @resource     creatorJS ./module/creator.js
// @resource     mainMenuJS ./module/main-menu.js
// @resource     navbarLogoJS ./module/navbar-logo.js
// @resource     updateManagerJS ./module/update-manager.js
// @resource     fullscreenJS ./module/fullscreen.js
// @resource     deviceCSSLoaderJS ./module/device-css-loader.js
// @resource     profileCropperJS ./module/profile-cropper.js
// @resource     html2canvasJS ./lib/html2canvas.min.js
// @resource     monetTestJS ./api/monet-test.js
// @resource     colorisJS ./lib/coloris.min.js
// @resource     colorisCSS ./lib/coloris.min.css
// @resource     colorisColors ./lib/coloris-colors.json
// @resource     keyboardShortcutsJS ./module/keyboard-shortcuts.js
// @connect      html2canvas.hertzen.com
// @connect      hertzen.com
// ==/UserScript==

(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const SCRIPT_NAME = 'Hako: Monet Theme';
    const GITHUB_REPO = 'https://github.com/sang765/HakoMonetTheme';
    const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main';

    let isCheckingForUpdate = false;

    // Simple console logging without colors
    const Logger = {
        // Module-specific prefixes
        prefixes: {
            main: '[HakoMonetTheme]',
            config: '[Config]',
            colorPicker: '[ColorPicker]',
            updateChecker: '[UpdateChecker]',
            themeDetector: '[ThemeDetector]',
            deviceDetector: '[DeviceDetector]',
            adBlocker: '[AdBlocker]',
            antiPopup: '[AntiPopup]',
            fullscreen: '[Fullscreen]',
            mainMenu: '[MainMenu]',
            navbarLogo: '[NavbarLogo]',
            updateManager: '[UpdateManager]',
            readingPage: '[ReadingPage]',
            infoTruyen: '[InfoTruyen]',
            tagColor: '[TagColor]',
            animation: '[Animation]',
            fontImport: '[FontImport]',
            pageGeneral: '[PageGeneral]',
            pageGeneralLight: '[PageGeneralLight]',
            pageInfoTruyen: '[PageInfoTruyen]',
            pageInfoTruyenLight: '[PageInfoTruyenLight]',
            corsMaster: '[CORSMaster]'
        },

        // Simple logging functions
        log: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `[${module.toUpperCase()}]`;
            console.log(`${prefix} ${args.shift() || ''}`, ...args);
        },

        info: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `[${module.toUpperCase()}]`;
            console.info(`${prefix} ${args.shift() || ''}`, ...args);
        },

        warn: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `[${module.toUpperCase()}]`;
            console.warn(`${prefix} ${args.shift() || ''}`, ...args);
        },

        error: function(module, ...args) {
            const prefix = this.prefixes[module] || `[${module.toUpperCase()}]`;
            console.error(`${prefix} ${args.shift() || ''}`, ...args);
        },

        success: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `[${module.toUpperCase()}]`;
            console.log(`${prefix} ${args.shift() || ''}`, ...args);
        },

        debug: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `[${module.toUpperCase()}]`;
            console.debug(`${prefix} ${args.shift() || ''}`, ...args);
        },

        // Performance logging
        performance: function(module, operation, startTime, endTime) {
            if (!DEBUG) return;
            const duration = endTime - startTime;
            console.log(`${this.prefixes[module]} ${operation} completed in ${duration.toFixed(2)}ms`);
        },

        // Color picker specific logging
        colorPicker: function(level, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes.colorPicker;
            const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : level === 'info' ? 'info' : 'log';
            console[method](`${prefix} ${args.shift() || ''}`, ...args);
        }
    };

    // Legacy debugLog function for backward compatibility
    function debugLog(...args) {
        Logger.log('main', ...args);
    }

    // Expose Logger globally for modules
    window.Logger = Logger;
    
    function registerMenuCommands() {
        if (typeof GM_registerMenuCommand === 'function') {
            GM_registerMenuCommand('📋 Menu chính', function() {
                if (typeof window.HMTMainMenu !== 'undefined' && typeof window.HMTMainMenu.openMainMenu === 'function') {
                    window.HMTMainMenu.openMainMenu();
                } else {
                    showNotification('Lỗi', 'Module Main Menu chưa được tải. Vui lòng làm mới trang.', 5000);
                    debugLog('Main Menu module chưa được tải');
                }
            }, 'm');
            GM_registerMenuCommand('📊 Thông tin script', showScriptInfo, 'i');
            GM_registerMenuCommand('🐛 Báo cáo lỗi', reportBug, 'b');
            GM_registerMenuCommand('💡 Đề xuất tính năng', suggestFeature, 'f');

            debugLog('Đã đăng ký menu commands');
        }
    }
    
    function getCurrentVersion() {
        try {
            // Extract version from script header comment
            const scriptContent = GM_info.scriptMetaStr || '';
            const versionMatch = scriptContent.match(/\/\/\s*@version\s+([^\s]+)/);
            if (versionMatch && versionMatch[1]) {
                return versionMatch[1];
            }
            // Fallback to GM_info.script.version
            return GM_info.script.version;
        } catch (error) {
            debugLog('Error extracting version:', error);
            return GM_info.script.version;
        }
    }

    function showScriptInfo() {
        const currentVersion = getCurrentVersion();
        const info = `
Tên: ${GM_info.script.name}
Phiên bản: ${currentVersion}
Tác giả: ${GM_info.script.author}
Mô tả: ${GM_info.script.description}

Handler: ${GM_info.scriptHandler || 'Không rõ'}
Engine: ${GM_info.scriptEngine || 'Không rõ'}

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
    
    function loadAllResources() {
        const resources = [
            // main
            'mainJS',
            // api và lib
            'monetAPIJS', 'monetTestJS', 'updateCheckerJS', 'CORSJS', 'html2canvasJS', 'colorisJS', 'colorisCSS', 'colorisColors',
            // config
            'configJS',
            // menu
            'mainMenuJS',
            // core modules
            'profileCropperJS', 'creatorJS', 'deviceDetectorJS', 'adBlockerJS', 'antiPopupJS',
            'keyboardShortcutsJS', 'updateManagerJS', 'fullscreenJS', 'autoReloadJS', 'themeDetectorJS',
            // css modules
            'deviceCSSLoaderJS', 'infoTruyenJS', 'tagColorJS', 'fontImportJS', 'animationJS',
            'colorsLoaderJS',
            'navbarLogoJS', 'readingPageJS',
        ];

        let loadedCount = 0;
        let failedCount = 0;
        const loadedResources = [];
        const failedResources = [];

        resources.forEach(resourceName => {
            try {
                debugLog(`Attempting to load resource: ${resourceName}`);
                const resourceContent = GM_getResourceText(resourceName);
                debugLog(`GM_getResourceText for ${resourceName} returned: ${resourceContent ? 'content (length: ' + resourceContent.length + ')' : 'null/undefined'}`);
                if (resourceContent) {
                    eval(resourceContent);
                    loadedCount++;
                    loadedResources.push(resourceName);
                    debugLog(`Đã tải ${resourceName}`);
                } else {
                    debugLog(`Không tìm thấy resource: ${resourceName}`);
                    failedCount++;
                    failedResources.push(resourceName);
                }
            } catch (error) {
                debugLog(`Lỗi khi tải ${resourceName}:`, error);
                debugLog(`Full error details for ${resourceName}:`, error.stack || error.message);
                failedCount++;
                failedResources.push(resourceName);
            }
        });

        if (failedCount > 0) {
            debugLog(`Tải resources: ${loadedCount} thành công, ${failedCount} thất bại`);
            debugLog(`Loaded: ${loadedResources.join(', ')}`);
            debugLog(`Failed: ${failedResources.join(', ')}`);

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

        return { loadedCount, loadedResources, failedCount, failedResources };
    }

    function updateAllResources() {
        debugLog('Bắt đầu cập nhật tất cả resources...');
        const { loadedCount, loadedResources, failedCount, failedResources } = loadAllResources();
        if (loadedCount > 0) {
            const resourceList = loadedResources.join(', ');
            showNotification(
                'Cập nhật Resources',
                `Đã cập nhật ${loadedCount} resources: ${resourceList}`,
                5000
            );
        }
        if (failedCount > 0) {
            const failedList = failedResources.join(', ');
            showNotification(
                'Cảnh báo',
                `Không thể cập nhật ${failedCount} resources: ${failedList}`,
                5000
            );
        }
        if (loadedCount === 0) {
            showNotification(
                'Lỗi',
                'Không thể cập nhật resources. Vui lòng thử lại.',
                5000
            );
        }
        debugLog('Cập nhật resources hoàn tất');
    }

    function initializeScript() {
        debugLog(`Bắt đầu khởi tạo ${SCRIPT_NAME} v${GM_info.script.version}`);

        // Check if we need to auto-reload after update
        const pendingReload = GM_getValue('pending_update_reload', false);
        const pendingTime = GM_getValue('pending_update_time', 0);
        const updatedFromVersion = GM_getValue('updated_from_version', null);
        const updatedToVersion = GM_getValue('updated_to_version', null);
        const now = Date.now();

        if (pendingReload && (now - pendingTime) < 30000) { // Within 30 seconds
            debugLog('Auto-reload sau khi cập nhật');
            GM_deleteValue('pending_update_reload');
            GM_deleteValue('pending_update_time');

            let updateMessage = 'Script đã được cập nhật thành công!';
            if (updatedFromVersion && updatedToVersion) {
                updateMessage = `Script đã được cập nhật từ ${updatedFromVersion} lên ${updatedToVersion}!`;
                GM_deleteValue('updated_from_version');
                GM_deleteValue('updated_to_version');
            }

            showNotification('Cập nhật hoàn tất', updateMessage, 5000);

            // Force update version display after successful update
            if (typeof window.HMTMainMenu !== 'undefined' &&
                typeof window.HMTMainMenu.updateVersionDisplay === 'function') {
                setTimeout(() => window.HMTMainMenu.updateVersionDisplay(), 500);
            }
        }

        // Đăng ký menu commands
        registerMenuCommands();

        // Tải tất cả resources
        const { loadedCount } = loadAllResources();

        // Only show initialization notification if user has enabled it or if there are errors
        const showInitNotification = GM_getValue('show_init_notification', false);
        if (showInitNotification && loadedCount > 0) {
            showNotification(
                `${SCRIPT_NAME}`,
                `Đã tải ${loadedCount} modules thành công!`,
                3000
            );
        }

        // Kiểm tra cập nhật tự động được xử lý bởi main.js
        // để tránh duplicate notifications

        debugLog('Khởi tạo script hoàn tất');
    }
    
    // Khởi chạy script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }
    
})();
