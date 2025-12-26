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

(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const SCRIPT_NAME = 'Hako: Monet Theme - Local Version';

    // Get configurable base URL
    const baseUrl = GM_getValue('custom_host_url', 'http://localhost:5500');

    // Expose base URL globally for external files
    window.HMTBaseUrl = baseUrl;

    // Resource paths using configurable base URL
    const resourcePaths = {
        mainJS: `${baseUrl}/main.js`,
        monetAPIJS: `${baseUrl}/api/monet.js`,
        updateCheckerJS: `${baseUrl}/api/update-checker.js`,
        CORSJS: `${baseUrl}/module/cors.js`,
        infoTruyenJS: `${baseUrl}/class/info-truyen.js`,
        readingPageJS: `${baseUrl}/class/reading-page.js`,
        animationJS: `${baseUrl}/class/animation.js`,
        tagColorJS: `${baseUrl}/class/tag-color.js`,
        fontImportJS: `${baseUrl}/class/font-import.js`,
        colorinfotruyen: `${baseUrl}/colors/page-info-truyen-dark.js`,
        pagegeneralJS: `${baseUrl}/colors/page-general-dark.js`,
        pagegenerallightJS: `${baseUrl}/colors/page-general-light.js`,
        colorinfotruyenlight: `${baseUrl}/colors/page-info-truyen-light.js`,
        pageprofileJS: `${baseUrl}/colors/page-profile-dark.js`,
        pageprofilelightJS: `${baseUrl}/colors/page-profile-light.js`,
        themeDetectorJS: `${baseUrl}/module/theme-detector.js`,
        deviceDetectorJS: `${baseUrl}/module/device-detector.js`,
        configJS: `${baseUrl}/module/config.js`,
        adBlockerJS: `${baseUrl}/module/ad-blocker.js`,
        antiPopupJS: `${baseUrl}/module/anti-popup.js`,
        mainMenuJS: `${baseUrl}/module/main-menu.js`,
        navbarLogoJS: `${baseUrl}/module/navbar-logo.js`,
        updateManagerJS: `${baseUrl}/module/update-manager.js`,
        fullscreenJS: `${baseUrl}/module/fullscreen.js`,
        keyboardShortcutsJS: `${baseUrl}/module/keyboard-shortcuts.js`,
        deviceCSSLoaderJS: `${baseUrl}/module/device-css-loader.js`,
        profileCropperJS: `${baseUrl}/module/profile-cropper.js`,
        creatorJS: `${baseUrl}/module/creator.js`,
        html2canvasJS: `${baseUrl}/lib/html2canvas.min.js`,
        monetTestJS: `${baseUrl}/lib/monet-test.js`,
        colorisJS: `${baseUrl}/lib/coloris.min.js`,
        colorisCSS: `${baseUrl}/lib/coloris.min.css`,
        colorisColors: `${baseUrl}/lib/coloris-colors.json`,
        autoReloadJS: `${baseUrl}/module/auto-reload.js`
    };

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
            creatorJS: '[Creator]',
            readingPage: '[ReadingPage]',
            infoTruyen: '[InfoTruyen]',
            tagColor: '[TagColor]',
            animation: '[Animation]',
            fontImport: '[FontImport]',
            pageGeneral: '[PageGeneral]',
            pageGeneralLight: '[PageGeneralLight]',
            pageInfoTruyen: '[PageInfoTruyen]',
            pageInfoTruyenLight: '[PageInfoTruyenLight]',
            pageProfile: '[PageProfile]',
            pageProfileLight: '[PageProfileLight]',
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
        const message = `${title}: ${body}`;
    
        // Try to use website's native toast notification first
        if (typeof Alpine !== 'undefined' && Alpine.store && Alpine.store('toast')) {
            try {
                Alpine.store('toast').show(message);
                return;
            } catch (e) {
                Logger.error('main', 'Failed to show native notification:', e);
            }
        }
    
        // Fallback to GM_notification
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
            GM_registerMenuCommand('🔧 Set Custom Host URL', setCustomHostUrl, 'h');
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

    function setCustomHostUrl() {
        const currentUrl = GM_getValue('custom_host_url', 'http://localhost:5500');
        const newUrl = prompt('Nhập custom host URL (ví dụ: http://localhost:5500 hoặc https://your-server.com):', currentUrl);

        if (newUrl && newUrl.trim() !== '' && newUrl !== currentUrl) {
            // Basic URL validation
            try {
                new URL(newUrl);
                GM_setValue('custom_host_url', newUrl.trim());
                showNotification('Host URL Updated', `Đã thiết lập thành: ${newUrl}`, 3000);
                Logger.log('main', `Custom host URL set to: ${newUrl}`);

                // Prompt to reload to apply changes
                if (confirm('Cần tải lại trang để áp dụng thay đổi URL host. Bạn có muốn tải lại ngay bây giờ không?')) {
                    window.location.reload();
                }
            } catch (e) {
                showNotification('Lỗi', 'URL không hợp lệ. Vui lòng nhập URL đầy đủ (bao gồm http:// hoặc https://).', 5000);
            }
        } else if (newUrl === currentUrl) {
            showNotification('Không thay đổi', 'URL mới giống với URL hiện tại.', 3000);
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
                            // Handle CSS files differently - inject as style instead of eval
                            if (path.endsWith('.css') || resourceName.includes('CSS')) {
                                const style = document.createElement('style');
                                style.textContent = response.responseText;
                                style.setAttribute('data-resource', resourceName);
                                document.head.appendChild(style);
                                Logger.success('main', `Injected CSS for ${resourceName}`);
                            } else {
                                eval(response.responseText);
                                Logger.success('main', `Loaded ${resourceName}`);
                            }
                            resolve(resourceName);
                        } catch (error) {
                            Logger.error('main', `Error processing ${resourceName}:`, error);
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

    // NOTE: Biết cách sắp xếp = hoạt động trơn chu
    async function loadAllResources() {
        const resources = [
            // main
            'mainJS',
            // api and libs
            'monetAPIJS', 'monetTestJS', 'updateCheckerJS', 'CORSJS', 'html2canvasJS', 'colorisJS', 'colorisCSS', 'colorisColors',
            // config
            'configJS',
            // menu
            'mainMenuJS',
            // core modules
            'profileCropperJS', 'creatorJS', 'deviceDetectorJS', 'adBlockerJS', 'antiPopupJS',
            'keyboardShortcutsJS', 'updateManagerJS',
            'fullscreenJS', 'autoReloadJS', 'themeDetectorJS',
            // css modules
            'deviceCSSLoaderJS', 'infoTruyenJS', 'tagColorJS', 'fontImportJS', 'animationJS',
            'pagegeneralJS', 'pagegenerallightJS', 'colorinfotruyen', 'colorinfotruyenlight',
            'pageprofileJS', 'pageprofilelightJS',
            'navbarLogoJS', 'readingPageJS',
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
                const failedList = failedResources.join(', ');
                showNotification(
                    'Cảnh báo',
                    `Không thể tải ${failedCount} resources sau: ${failedList}. Một số tính năng có thể không hoạt động.`,
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
