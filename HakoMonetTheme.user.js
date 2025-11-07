// ==UserScript==
// @name         Hako: Monet Theme
// @namespace    https://github.com/sang765
// @version      5.1.2
// @description  Material You theme for Hako/DocLN.
// @description:vi Material You theme dành cho Hako/DocLN.
// @icon         https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/.github/assets/logo.png
// @author       sang765
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
// @grant        unsafeWindow
// @connect      *
// @run-at       document-start
// @supportURL   https://github.com/sang765/HakoMonetTheme/issues
// @updateURL    https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js
// @downloadURL  https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js
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
// @resource     colorinfotruyen ./colors/page-info-truyen.js
// @resource     pagegeneralJS ./colors/page-general.js
// @resource     pagegenerallightJS ./colors/page-general-light.js
// @resource     colorinfotruyenlight ./colors/page-info-truyen-light.js
// @resource     themeDetectorJS ./module/theme-detector.js
// @resource     deviceDetectorJS ./module/device-detector.js
// @resource     configJS ./module/config.js
// @resource     adBlockerJS ./module/ad-blocker.js
// @resource     autoReloadJS ./module/auto-reload.js
// @resource     antiPopupJS ./module/anti-popup.js
// @resource     mainMenuJS ./module/main-menu.js
// @resource     navbarLogoJS ./module/navbar-logo.js
// @resource     updateManagerJS ./module/update-manager.js
// @resource     darkModePrompterJS ./module/dark-mode-prompter.js
// @resource     fullscreenJS ./module/fullscreen.js
// @resource     deviceCSSLoaderJS ./module/device-css-loader.js
// @resource     html2canvasJS ./api/html2canvas.min.js
// @resource     monetTestJS ./api/monet-test.js
// @resource     colorisJS ./api/coloris.min.js
// @resource     colorisCSS ./api/coloris.min.css
// @resource     colorisColors ./api/coloris-colors.json
// @connect      html2canvas.hertzen.com
// @connect      hertzen.com
// ==/UserScript==

(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const SCRIPT_NAME = 'Hako: Monet Theme';
    const GITHUB_REPO = 'https://github.com/sang765/HakoMonetTheme';
    const RAW_GITHUB_URL = 'https://sang765.github.io/HakoMonetTheme';

    let isCheckingForUpdate = false;

    // Enhanced console logging with colors
    const Logger = {
        // Color schemes for different log levels
        styles: {
            log: 'color: #6c757d; background: #f8f9fa; padding: 2px 4px; border-radius: 3px;',
            info: 'color: #0d6efd; background: #e7f3ff; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
            warn: 'color: #fd7e14; background: #fff3cd; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
            error: 'color: #dc3545; background: #f8d7da; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
            success: 'color: #198754; background: #d1edff; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
            debug: 'color: #6f42c1; background: #f3f0ff; padding: 2px 4px; border-radius: 3px; font-style: italic;'
        },

        // Module-specific prefixes with colors
        prefixes: {
            main: '%c[HakoMonetTheme]',
            config: '%c[Config]',
            colorPicker: '%c[ColorPicker]',
            updateChecker: '%c[UpdateChecker]',
            themeDetector: '%c[ThemeDetector]',
            deviceDetector: '%c[DeviceDetector]',
            adBlocker: '%c[AdBlocker]',
            antiPopup: '%c[AntiPopup]',
            fullscreen: '%c[Fullscreen]',
            mainMenu: '%c[MainMenu]',
            navbarLogo: '%c[NavbarLogo]',
            updateManager: '%c[UpdateManager]',
            darkModePrompter: '%c[DarkModePrompter]',
            readingPage: '%c[ReadingPage]',
            infoTruyen: '%c[InfoTruyen]',
            tagColor: '%c[TagColor]',
            animation: '%c[Animation]',
            fontImport: '%c[FontImport]',
            pageGeneral: '%c[PageGeneral]',
            pageGeneralLight: '%c[PageGeneralLight]',
            pageInfoTruyen: '%c[PageInfoTruyen]',
            pageInfoTruyenLight: '%c[PageInfoTruyenLight]',
            corsMaster: '%c[CORSMaster]'
        },

        // Enhanced logging functions
        log: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `%c[${module.toUpperCase()}]`;
            const style = this.styles.log;
            console.log(`${prefix} %c${args.shift() || ''}`, style, this.styles.log, ...args);
        },

        info: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `%c[${module.toUpperCase()}]`;
            const style = this.styles.info;
            console.info(`${prefix} %c${args.shift() || ''}`, style, this.styles.info, ...args);
        },

        warn: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `%c[${module.toUpperCase()}]`;
            const style = this.styles.warn;
            console.warn(`${prefix} %c${args.shift() || ''}`, style, this.styles.warn, ...args);
        },

        error: function(module, ...args) {
            const prefix = this.prefixes[module] || `%c[${module.toUpperCase()}]`;
            const style = this.styles.error;
            console.error(`${prefix} %c${args.shift() || ''}`, style, this.styles.error, ...args);
        },

        success: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `%c[${module.toUpperCase()}]`;
            const style = this.styles.success;
            console.log(`${prefix} %c${args.shift() || ''}`, style, this.styles.success, ...args);
        },

        debug: function(module, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes[module] || `%c[${module.toUpperCase()}]`;
            const style = this.styles.debug;
            console.debug(`${prefix} %c${args.shift() || ''}`, style, this.styles.debug, ...args);
        },

        // Performance logging
        performance: function(module, operation, startTime, endTime) {
            if (!DEBUG) return;
            const duration = endTime - startTime;
            const durationStyle = duration > 100 ? this.styles.warn : duration > 50 ? this.styles.info : this.styles.success;
            console.log(`${this.prefixes[module]} %c${operation} completed in ${duration.toFixed(2)}ms`, this.styles.log, durationStyle);
        },

        // Color picker specific logging
        colorPicker: function(level, ...args) {
            if (!DEBUG) return;
            const prefix = this.prefixes.colorPicker;
            const style = this.styles[level] || this.styles.log;
            const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : level === 'info' ? 'info' : 'log';
            console[method](`${prefix} %c${args.shift() || ''}`, style, this.styles[level] || this.styles.log, ...args);
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

    function openAntiPopupConfig() {
        // Đảm bảo anti-popup module đã được tải
        if (typeof window.HMTAntiPopup !== 'undefined' && typeof window.HMTAntiPopup.openDialog === 'function') {
            window.HMTAntiPopup.openDialog();
            showNotification('Anti-Popup', 'Mở bảng cài đặt Anti-Popup...', 3000);
        } else {
            showNotification('Lỗi', 'Module Anti-Popup chưa được tải. Vui lòng làm mới trang.', 5000);
            debugLog('Anti-Popup module chưa được tải');
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
            'mainJS', 'monetAPIJS', 'monetTestJS', 'updateCheckerJS', 'CORSJS', 'infoTruyenJS',
            'animationJS', 'tagColorJS', 'fontImportJS', 'colorinfotruyen',
            'pagegeneralJS', 'pagegenerallightJS', 'colorinfotruyenlight', 'themeDetectorJS',
            'deviceDetectorJS', 'configJS', 'adBlockerJS', 'autoReloadJS', 'antiPopupJS',
            'mainMenuJS', 'navbarLogoJS', 'updateManagerJS', 'darkModePrompterJS', 'fullscreenJS',
            'readingPageJS', 'deviceCSSLoaderJS'
        ];

        let loadedCount = 0;
        let failedCount = 0;
        const loadedResources = [];
        const failedResources = [];

        resources.forEach(resourceName => {
            try {
                const resourceContent = GM_getResourceText(resourceName);
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
