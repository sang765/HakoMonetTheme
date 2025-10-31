// ==UserScript==
// @name         Hako: Monet Theme
// @namespace    https://github.com/sang765
// @version      3.8.2
// @description  Material You theme for Hako/DocLN.
// @description:vi Material You theme dành cho Hako/DocLN.
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
// @connect      *
// @run-at       document-end
// @require      https://greasyfork.org/scripts/447115-gm-config/code/GM_config.js?version=1060849
// @resource     mainJS ./main.js
// @resource     monetAPIJS ./api/monet.js
// @resource     simpleCORSJS ./module/simple-cors.js
// @resource     infoTruyenJS ./class/info-truyen.js
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
// @supportURL   https://github.com/sang765/HakoMonetTheme/issues
// @updateURL    https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @downloadURL  https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js
// @homepageURL  https://github.com/sang765/HakoMonetTheme
// @license      MIT
// @discord      https://discord.gg/uvQ6A3CDPq
// ==/UserScript==

(function() {
    'use strict';
    
    const DEBUG = true;
    const SCRIPT_NAME = 'Hako: Monet Theme';
    const GITHUB_REPO = 'https://github.com/sang765/HakoMonetTheme';
    const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/';
    
    let isCheckingForUpdate = false;
    
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
    function fetchChangelog(currentVersion, newVersion) {
        return new Promise((resolve) => {
            // Check if we have cached changelog for this version pair
            const cacheKey = `changelog_${currentVersion}_${newVersion}`;
            const cachedChangelog = GM_getValue(cacheKey, null);
            const cacheTime = GM_getValue(`${cacheKey}_time`, 0);
            const now = Date.now();

            // Use cache if it's less than 1 hour old
            if (cachedChangelog && (now - cacheTime) < 3600000) {
                debugLog('Sử dụng changelog từ cache');
                resolve(cachedChangelog);
                return;
            }

            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://api.github.com/repos/sang765/HakoMonetTheme/commits?per_page=20',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                },
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const commits = JSON.parse(response.responseText);
                            const changelog = generateChangelog(commits, currentVersion, newVersion);

                            // Cache the result
                            GM_setValue(cacheKey, changelog);
                            GM_setValue(`${cacheKey}_time`, now);

                            resolve(changelog);
                        } catch (e) {
                            debugLog('Lỗi parse JSON commits:', e);
                            resolve(['Không thể tải nhật ký thay đổi.']);
                        }
                    } else if (response.status === 403) {
                        // Rate limit exceeded
                        debugLog('GitHub API rate limit exceeded');
                        const rateLimitReset = response.responseHeaders?.['X-RateLimit-Reset'];
                        if (rateLimitReset) {
                            const resetTime = new Date(parseInt(rateLimitReset) * 1000);
                            const waitMinutes = Math.ceil((resetTime - new Date()) / 60000);
                            resolve([`API GitHub bị giới hạn tốc độ. Thử lại sau ${waitMinutes} phút.`]);
                        } else {
                            resolve(['API GitHub bị giới hạn tốc độ. Thử lại sau.']);
                        }
                    } else if (response.status === 404) {
                        debugLog('Repository not found');
                        resolve(['Không tìm thấy repository.']);
                    } else {
                        debugLog('Lỗi tải commits:', response.status);
                        resolve(['Không thể tải nhật ký thay đổi.']);
                    }
                },
                onerror: function(error) {
                    debugLog('Network error khi tải commits:', error);
                    resolve(['Lỗi mạng khi tải nhật ký thay đổi.']);
                },
                ontimeout: function() {
                    debugLog('Timeout khi tải commits');
                    resolve(['Hết thời gian tải nhật ký thay đổi.']);
                }
            });
        });
    }

    function generateChangelog(commits, currentVersion, newVersion) {
        const changelog = [];
        let foundCurrent = false;
        let foundNew = false;

        for (const commit of commits) {
            const message = commit.commit.message;
            const sha = commit.sha.substring(0, 7);

            // Check for version bump commits
            if (message.includes(`bump version to ${newVersion}`)) {
                foundNew = true;
                changelog.push(`${message} - ${sha}`);
            } else if (message.includes(`bump version to ${currentVersion}`)) {
                foundCurrent = true;
                changelog.push(`${message} - ${sha}`);
                break; // Stop when we reach current version
            } else if (foundNew && !foundCurrent) {
                // Include commits between versions
                if (message.startsWith('feat:') || message.startsWith('fix:') || message.startsWith('refactor:') ||
                    message.startsWith('docs:') || message.startsWith('style:') || message.startsWith('perf:') ||
                    message.startsWith('test:')) {
                    changelog.push(`${message} - ${sha}`);
                }
            }
        }

        if (changelog.length === 0) {
            changelog.push('Không có thay đổi đáng kể.');
        }

        return changelog;
    }
    }
    function showUpdateDialog(currentVersion, newVersion) {
        const css = `
            .update-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .update-dialog-content {
                background-color: white;
                color: black;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 500px;
                width: 90%;
            }
            .update-icon {
                width: 64px;
                height: 64px;
                margin: 0 auto 10px;
                display: block;
            }
            .version-info {
                text-align: center;
                margin-bottom: 20px;
            }
            .changelog {
                text-align: left;
                margin-bottom: 20px;
                max-height: 200px;
                overflow-y: auto;
            }
            .changelog ul {
                list-style-type: none;
                padding: 0;
            }
            .changelog li {
                margin-bottom: 5px;
                font-size: 14px;
            }
            .buttons {
                display: flex;
                justify-content: space-between;
            }
            .buttons button {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            #cancel-btn {
                background-color: #ccc;
            }
            #update-btn {
                background-color: #007bff;
                color: white;
            }
            .changelog h2 {
                color: #000;
            }
        `;

        GM_addStyle(css);

        const overlay = document.createElement('div');
        overlay.className = 'update-dialog-overlay';
        overlay.innerHTML = `
            <div class="update-dialog-content">
                <div class="version-info">
                    <svg class="update-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#007bff"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="#007bff"/>
                    </svg>
                    <p><strong>Phát hiện phiên bản mới của HakoMonetTheme</strong></p>
                    <p style="font-size: 14px;"><span id="current-version">${currentVersion}</span> => <span id="new-version">${newVersion}</span></p>
                </div>
                <hr>
                <div class="changelog">
                    <h2><strong>Nhật ký thay đổi:</strong></h2>
                    <ul id="changelog-list">
                        <li>Đang tải nhật ký thay đổi...</li>
                    </ul>
                </div>
                <hr>
                <div class="buttons">
                    <button id="cancel-btn">Hủy</button>
                    <button id="update-btn">Cập nhật</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cancelBtn = overlay.querySelector('#cancel-btn');
        const updateBtn = overlay.querySelector('#update-btn');

        cancelBtn.addEventListener('click', () => {
            overlay.remove();
        });

        updateBtn.addEventListener('click', () => {
            GM_openInTab(RAW_GITHUB_URL + 'HakoMonetTheme.user.js');
            overlay.remove();
        });

        // Load changelog
        const changelogList = overlay.querySelector('#changelog-list');
        fetchChangelog(currentVersion, newVersion).then(changelog => {
            changelogList.innerHTML = changelog.map(item => `<li>${item}</li>`).join('');
        });
    }
    
    function openUpdateSettings() {
        const autoUpdateEnabled = GM_getValue('auto_update_enabled', true);
        const updateNotificationsEnabled = GM_getValue('update_notifications_enabled', true);
        const showInitNotification = GM_getValue('show_init_notification', false);

        const settings = `
Tự động kiểm tra cập nhật: ${autoUpdateEnabled ? 'Bật' : 'Tắt'}
Thông báo cập nhật: ${updateNotificationsEnabled ? 'Bật' : 'Tắt'}
Thông báo khởi tạo: ${showInitNotification ? 'Bật' : 'Tắt'}

Chọn thiết lập cần thay đổi:
1. ${autoUpdateEnabled ? 'Tắt' : 'Bật'} tự động kiểm tra cập nhật
2. ${updateNotificationsEnabled ? 'Tắt' : 'Bật'} thông báo cập nhật
3. ${showInitNotification ? 'Tắt' : 'Bật'} thông báo khởi tạo
4. Đặt lại tất cả về mặc định
        `.trim();

        const choice = prompt(settings + '\n\nNhập số (1-4) hoặc để trống để hủy:');

        switch(choice) {
            case '1':
                GM_setValue('auto_update_enabled', !autoUpdateEnabled);
                showNotification('Thiết lập cập nhật', `Đã ${!autoUpdateEnabled ? 'bật' : 'tắt'} tự động kiểm tra cập nhật`, 3000);
                break;
            case '2':
                GM_setValue('update_notifications_enabled', !updateNotificationsEnabled);
                showNotification('Thiết lập cập nhật', `Đã ${!updateNotificationsEnabled ? 'bật' : 'tắt'} thông báo cập nhật`, 3000);
                break;
            case '3':
                GM_setValue('show_init_notification', !showInitNotification);
                showNotification('Thiết lập cập nhật', `Đã ${!showInitNotification ? 'bật' : 'tắt'} thông báo khởi tạo`, 3000);
                break;
            case '4':
                GM_deleteValue('auto_update_enabled');
                GM_deleteValue('update_notifications_enabled');
                GM_deleteValue('show_init_notification');
                showNotification('Thiết lập cập nhật', 'Đã đặt lại tất cả thiết lập về mặc định', 3000);
                break;
            default:
                return;
        }

        debugLog('Đã cập nhật thiết lập cập nhật');
    }

    function registerMenuCommands() {
        // Command để kiểm tra cập nhật
        if (typeof GM_registerMenuCommand === 'function') {
            GM_registerMenuCommand('🔄 Kiểm tra cập nhật', checkForUpdatesManual, 'u');
            GM_registerMenuCommand('🎨 Cài đặt', openColorConfig, 'c');
            GM_registerMenuCommand('🚫 Ad Blocker', openAdBlockerConfig, 'a');
            GM_registerMenuCommand('🚫 Ad Popup Blocker', openAntiPopupConfig, 'p');
            GM_registerMenuCommand('📊 Thông tin script', showScriptInfo, 'i');
            GM_registerMenuCommand('⚙️ Thiết lập cập nhật', openUpdateSettings, 's');
            GM_registerMenuCommand('🐛 Báo cáo lỗi', reportBug, 'b');
            GM_registerMenuCommand('💡 Đề xuất tính năng', suggestFeature, 'f');
            GM_registerMenuCommand('💬 Tham gia Discord', joinDiscord, 'j');
            GM_registerMenuCommand('🔧 Debug Mode', toggleDebugMode, 'd');

            debugLog('Đã đăng ký menu commands');
        }
    }
    
    function checkForUpdatesManual() {
        if (isCheckingForUpdate) {
            showNotification('Thông tin', 'Đang kiểm tra cập nhật...', 3000);
            return;
        }
        isCheckingForUpdate = true;
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
                            showUpdateDialog(currentVersion, latestVersion);
                        } else {
                            showNotification('Thông tin', 'Bạn đang sử dụng phiên bản mới nhất!', 3000);
                        }
                    }
                }
                isCheckingForUpdate = false;
            },
            onerror: function(error) {
                showNotification('Lỗi', 'Không thể kiểm tra cập nhật. Vui lòng thử lại sau.', 5000);
                debugLog('Lỗi khi kiểm tra cập nhật:', error);
                isCheckingForUpdate = false;
            },
            ontimeout: function() {
                showNotification('Lỗi', 'Hết thời gian kiểm tra cập nhật.', 5000);
                isCheckingForUpdate = false;
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
            'mainJS', 'monetAPIJS', 'simpleCORSJS', 'infoTruyenJS',
            'animationJS', 'tagColorJS', 'fontImportJS', 'colorinfotruyen', 'pagegeneralJS', 'pagegenerallightJS', 'colorinfotruyenlight', 'themeDetectorJS', 'deviceDetectorJS', 'configJS', 'adBlockerJS', 'autoReloadJS', 'antiPopupJS'
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
