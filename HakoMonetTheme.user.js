// ==UserScript==
// @name         Hako: Monet Theme - Local Version
// @icon         https://github.com/sang765/HakoMonetTheme/raw/main/.github/assets/logo.png
// @version      LocalDev
// @description  Material You theme for Hako/DocLN.
// @description:vi Material You theme dành cho Hako/DocLN.
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
// @run-at       document-start
// @license      MIT
// @discord      https://discord.gg/uvQ6A3CDPq
// ==/UserScript==

// Local resource paths for development (hot-reload enabled)
// Note: For local development, run 'run_local_host.bat' to start a server,
// then change paths below to use localhost URLs (e.g., 'http://localhost:8080/main.js')
// For production, keep relative paths './main.js'
const resourcePaths = {
    mainJS: 'http://localhost:8080/main.js',
    monetAPIJS: 'http://localhost:8080/api/monet.js',
    updateCheckerJS: 'http://localhost:8080/api/update-checker.js',
    CORSJS: 'http://localhost:8080/module/cors.js',
    infoTruyenJS: 'http://localhost:8080/class/info-truyen.js',
    readingPageJS: 'http://localhost:8080/class/reading-page.js',
    animationJS: 'http://localhost:8080/class/animation.js',
    tagColorJS: 'http://localhost:8080/class/tag-color.js',
    fontImportJS: 'http://localhost:8080/class/font-import.js',
    colorinfotruyen: 'http://localhost:8080/colors/page-info-truyen-dark.js',
    pagegeneralJS: 'http://localhost:8080/colors/page-general-dark.js',
    pagegenerallightJS: 'http://localhost:8080/colors/page-general-light.js',
    colorinfotruyenlight: 'http://localhost:8080/colors/page-info-truyen-light.js',
    themeDetectorJS: 'http://localhost:8080/module/theme-detector.js',
    deviceDetectorJS: 'http://localhost:8080/module/device-detector.js',
    configJS: 'http://localhost:8080/module/config.js',
    adBlockerJS: 'http://localhost:8080/module/ad-blocker.js',
    antiPopupJS: 'http://localhost:8080/module/anti-popup.js',
    mainMenuJS: 'http://localhost:8080/module/main-menu.js',
    navbarLogoJS: 'http://localhost:8080/module/navbar-logo.js',
    updateManagerJS: 'http://localhost:8080/module/update-manager.js',
    darkModePrompterJS: 'http://localhost:8080/module/dark-mode-prompter.js',
    fullscreenJS: 'http://localhost:8080/module/fullscreen.js',
    deviceCSSLoaderJS: 'http://localhost:8080/module/device-css-loader.js',
    profileBannerCropperJS: 'http://localhost:8080/module/profile-banner-cropper.js',
    html2canvasJS: 'http://localhost:8080/api/html2canvas.min.js',
    monetTestJS: 'http://localhost:8080/api/monet-test.js',
    colorisJS: 'http://localhost:8080/api/coloris.min.js',
    colorisCSS: 'http://localhost:8080/api/coloris.min.css',
    colorisColors: 'http://localhost:8080/api/coloris-colors.json',
    autoReloadJS: 'http://localhost:8080/module/auto-reload.js'
};

(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const SCRIPT_NAME = 'Hako: Monet Theme - Local Version';

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
            darkModePrompter: '[DarkModePrompter]',
            readingPage: '[ReadingPage]',
            infoTruyen: '[InfoTruyen]',
            tagColor: '[TagColor]',
            animation: '[Animation]',
            fontImport: '[FontImport]',
            pageGeneral: '[PageGeneral]',
            pageGeneralLight: '[PageGeneralLight]',
            pageInfoTruyen: '[PageInfoTruyen]',
            pageInfoTruyenLight: '[PageInfoTruyenLight]',
            corsMaster: '[CORSMaster]',
            autoReload: '[AutoReload]'
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

    // Centralized notification function
    function showNotification(title, body, timeout = 5000) {
        try {
            GM_notification({
                title: title,
                text: body,
                timeout: timeout,
                ondone: function() { /* Do nothing */ }
            });
        } catch (e) {
            Logger.error('main', 'Failed to show notification:', e);
            // Fallback for environments where GM_notification is not available
            alert(`${title}\n\n${body}`);
        }
    }

    // Expose Logger globally for modules
    window.Logger = Logger;

    // Auto-reload functionality for local development
    function setupAutoReload() {
        try {
            const ws = new WebSocket('ws://localhost:8080');
            ws.onopen = () => {
                Logger.log('main', 'Connected to auto-reload server');
            };
            ws.onmessage = (event) => {
                if (event.data === 'reload') {
                    Logger.log('main', 'Received reload signal, refreshing page...');
                    window.location.reload();
                }
            };
            ws.onclose = () => {
                Logger.log('main', 'Disconnected from auto-reload server');
            };
            ws.onerror = (error) => {
                Logger.debug('main', 'WebSocket error (server may not be running):', error);
            };
        } catch (error) {
            Logger.debug('main', 'Failed to setup auto-reload:', error);
        }
    }

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
        `.trim();

        alert(info);
        debugLog('Hiển thị thông tin script');
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
    
    function loadResource(resourceName) {
        return new Promise((resolve, reject) => {
            const path = resourcePaths[resourceName];
            if (!path) {
                reject(new Error(`No path defined for resource: ${resourceName}`));
                return;
            }

            Logger.log('main', `Loading resource: ${resourceName} from ${path}`);

            GM_xmlhttpRequest({
                method: 'GET',
                url: path,
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            eval(response.responseText);
                            Logger.success('main', `Loaded ${resourceName}`);
                            resolve(resourceName);
                        } catch (error) {
                            Logger.error('main', `Eval error for ${resourceName}:`, error);
                            reject(error);
                        }
                    } else {
                        reject(new Error(`HTTP ${response.status} for ${resourceName}`));
                    }
                },
                onerror: function(error) {
                    const errorMessage = `Network error loading ${resourceName}. Is the local server running?`;
                    Logger.error('main', errorMessage, error);
                    showNotification('Network Error', `${resourceName}: ${errorMessage}`, 5000);
                    reject(new Error(errorMessage));
                },
                ontimeout: function() {
                    Logger.error('main', `Timeout loading ${resourceName}`);
                    reject(new Error('Timeout'));
                }
            });
        });
    }

    async function loadAllResources() {
        const resources = [
            // main
            'mainJS',
            // api
            'monetAPIJS', 'monetTestJS', 'updateCheckerJS', 'CORSJS', 'html2canvasJS', 'colorisJS', 'colorisCSS', 'colorisColors',
            // config
            'configJS',
            // menu
            'mainMenuJS',
            // core (adblock, antipopup)
            'adBlockerJS', 'antiPopupJS',
            // css (other modules)
            'infoTruyenJS', 'animationJS', 'tagColorJS', 'fontImportJS', 'themeDetectorJS', 'deviceDetectorJS', 'autoReloadJS',
            'pagegeneralJS', 'pagegenerallightJS', 'colorinfotruyen', 'colorinfotruyenlight',
            'navbarLogoJS', 'updateManagerJS', 'darkModePrompterJS', 'fullscreenJS', 'readingPageJS',
            // dynamic css
            'deviceCSSLoaderJS', 'profileBannerCropperJS'
        ];

        const promises = resources.map(resourceName => loadResource(resourceName));
        const results = await Promise.allSettled(promises);

        let loadedCount = 0;
        let failedCount = 0;
        const loadedResources = [];
        const failedResources = [];

        results.forEach((result, index) => {
            const resourceName = resources[index];
            if (result.status === 'fulfilled') {
                loadedCount++;
                loadedResources.push(resourceName);
            } else {
                failedCount++;
                failedResources.push(resourceName);
                Logger.warn('main', `Failed to load ${resourceName}:`, result.reason.message);
            }
        });

        Logger.log('main', `Resource loading complete: ${loadedCount} loaded, ${failedCount} failed`);

        if (failedCount > 0) {
            Logger.log('main', `Loaded: ${loadedResources.join(', ')}`);
            Logger.log('main', `Failed: ${failedResources.join(', ')}`);

            if (failedCount === resources.length) {
                showNotification(
                    'Lỗi nghiêm trọng',
                    'Không thể tải bất kỳ resource nào. Vui lòng kiểm tra đường dẫn local.',
                    10000
                );
            } else {
                showNotification(
                    'Cảnh báo',
                    `Không thể tải ${failedCount} resources: ${failedResources.join(', ')}. Một số tính năng có thể không hoạt động.`,
                    5000
                );
            }
        } else {
            Logger.success('main', 'Tất cả resources đã được tải thành công');
        }

        // UI debug notifications
        if (DEBUG) {
            if (failedCount > 0) {
                showNotification(
                    'Import thất bại',
                    `Các modules thất bại: ${failedResources.join(', ')}`,
                    5000
                );
            } else {
                showNotification(
                    'Import hoàn tất',
                    `Tất cả ${loadedCount} modules đã được tải thành công.`,
                    3000
                );
            }
        }

        return { loadedCount, loadedResources, failedCount, failedResources };
    }

    async function updateAllResources() {
        Logger.log('main', 'Bắt đầu cập nhật tất cả resources...');
        const { loadedCount, loadedResources, failedCount, failedResources } = await loadAllResources();
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
        Logger.log('main', 'Cập nhật resources hoàn tất');
    }

    // Expose updateAllResources globally for live reload functionality
    window.updateAllResources = updateAllResources;

    async function initializeScript() {
        Logger.log('main', `Bắt đầu khởi tạo ${SCRIPT_NAME} v${GM_info.script.version}`);

        // Check if we need to auto-reload after update
        const pendingReload = GM_getValue('pending_update_reload', false);
        const pendingTime = GM_getValue('pending_update_time', 0);
        const updatedFromVersion = GM_getValue('updated_from_version', null);
        const updatedToVersion = GM_getValue('updated_to_version', null);
        const now = Date.now();

        if (pendingReload && (now - pendingTime) < 30000) { // Within 30 seconds
            Logger.log('main', 'Auto-reload sau khi cập nhật');
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

        // Setup auto-reload for local development
        setupAutoReload();

        // Tải tất cả resources
        const { loadedCount } = await loadAllResources();

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

        Logger.log('main', 'Khởi tạo script hoàn tất');
    }
    
    // Khởi chạy script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }
    
})();