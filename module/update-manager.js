(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const GITHUB_REPO = 'https://github.com/sang765/HakoMonetTheme';
    const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/';

    let isCheckingForUpdate = false;

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[UpdateManager]', ...args);
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

    function showUpdateDialog(currentVersion, newVersion) {
        // Performance monitoring
        const startTime = performance.now();

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
                backdrop-filter: blur(2px);
                animation: fadeIn 0.3s ease-out;
            }
            .update-dialog-content {
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                color: black;
                padding: 24px;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                max-width: 520px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideUp 0.4s ease-out;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            .update-icon {
                width: 72px;
                height: 72px;
                margin: 0 auto 16px;
                display: block;
                filter: drop-shadow(0 4px 8px rgba(0, 123, 255, 0.3));
            }
            .version-info {
                text-align: center;
                margin-bottom: 24px;
            }
            .version-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-top: 8px;
                box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
            }
            .changelog {
                text-align: left;
                margin-bottom: 24px;
                max-height: 250px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 8px;
                padding: 16px;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            .changelog ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            .changelog li {
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 1.4;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            .changelog li:hover {
                background: rgba(0, 123, 255, 0.05);
            }
            .changelog li:before {
                content: "•";
                color: #007bff;
                font-weight: bold;
                margin-right: 8px;
            }
            .buttons {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            .buttons button {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s ease;
                min-width: 100px;
            }
            #cancel-btn {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                color: white;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            #cancel-btn:hover {
                background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            #update-btn {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }
            #update-btn:hover {
                background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
            }
            #skip-btn {
                background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
                color: #212529;
            }
            #skip-btn:hover {
                background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
            }
            .changelog h2 {
                color: #000;
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
            }
            .performance-info {
                font-size: 12px;
                color: #6c757d;
                text-align: center;
                margin-top: 8px;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
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
                    <p><strong>🚀 Phát hiện phiên bản mới của HakoMonetTheme</strong></p>
                    <div class="version-badge">
                        <span>${currentVersion}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>${newVersion}</span>
                    </div>
                </div>
                <div class="changelog">
                    <h2><strong>📋 Nhật ký thay đổi:</strong></h2>
                    <ul id="changelog-list">
                        <li>Đang tải nhật ký thay đổi...</li>
                    </ul>
                </div>
                <div class="buttons">
                    <button id="skip-btn">⏭️ Bỏ qua</button>
                    <button id="cancel-btn">❌ Hủy</button>
                    <button id="update-btn">⬇️ Cập nhật</button>
                </div>
                <div class="performance-info" id="perf-info"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cancelBtn = overlay.querySelector('#cancel-btn');
        const updateBtn = overlay.querySelector('#update-btn');
        const skipBtn = overlay.querySelector('#skip-btn');
        const perfInfo = overlay.querySelector('#perf-info');

        // Update performance info
        const updatePerfInfo = () => {
            const currentTime = performance.now();
            const loadTime = (currentTime - startTime).toFixed(1);
            perfInfo.textContent = `⚡ Dialog loaded in ${loadTime}ms`;
        };
        updatePerfInfo();

        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            // Log user interaction
            debugLog('User cancelled update dialog');
        });

        skipBtn.addEventListener('click', () => {
            // Skip this version
            GM_setValue('skipped_version', newVersion);
            GM_setValue('skip_timestamp', Date.now());
            overlay.remove();
            showNotification('Bỏ qua cập nhật', `Đã bỏ qua phiên bản ${newVersion}`, 3000);
            debugLog(`User skipped version ${newVersion}`);
        });

        updateBtn.addEventListener('click', () => {
            // Check for multiple CDN fallbacks
            performSmartUpdate(newVersion, overlay);
        });

        // Load changelog
        const changelogList = overlay.querySelector('#changelog-list');
        fetchChangelog(currentVersion, newVersion).then(changelog => {
            changelogList.innerHTML = changelog.map(item => `<li>${item}</li>`).join('');
            updatePerfInfo();
        });

        // Auto-close after 5 minutes
        setTimeout(() => {
            if (overlay.parentElement) {
                overlay.remove();
                debugLog('Update dialog auto-closed after 5 minutes');
            }
        }, 5 * 60 * 1000);
    }

    function performSmartUpdate(newVersion, overlay) {
        const updateSources = [
            { name: 'GitHub Raw', url: RAW_GITHUB_URL + 'HakoMonetTheme.user.js' },
            { name: 'jsDelivr CDN', url: 'https://cdn.jsdelivr.net/gh/sang765/HakoMonetTheme@main/HakoMonetTheme.user.js' },
            { name: 'GitHub Pages', url: 'https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js' }
        ];

        let currentSourceIndex = 0;
        let updateAttempts = 0;
        const maxAttempts = 3;

        function tryUpdateSource() {
            if (updateAttempts >= maxAttempts) {
                showNotification('Lỗi cập nhật', 'Không thể tải update từ bất kỳ nguồn nào', 5000);
                overlay.remove();
                return;
            }

            const source = updateSources[currentSourceIndex % updateSources.length];
            debugLog(`Trying update source: ${source.name} (${source.url})`);

            GM_xmlhttpRequest({
                method: 'HEAD',
                url: source.url,
                timeout: 5000,
                onload: function(response) {
                    if (response.status === 200) {
                        // Source is available, proceed with update
                        GM_openInTab(source.url);
                        overlay.remove();

                        // Set a flag to auto-reload after 10 seconds
                        GM_setValue('pending_update_reload', true);
                        GM_setValue('pending_update_time', Date.now());

                        // Auto-reload after 10 seconds with progress feedback
                        let countdown = 10;
                        const countdownInterval = setInterval(() => {
                            countdown--;
                            if (countdown <= 0) {
                                clearInterval(countdownInterval);
                                if (GM_getValue('pending_update_reload', false)) {
                                    window.location.reload();
                                }
                            }
                        }, 1000);

                        showNotification('Cập nhật', `Đang tải từ ${source.name}... Tự động làm mới sau 10s`, 10000);
                    } else {
                        // Try next source
                        currentSourceIndex++;
                        updateAttempts++;
                        tryUpdateSource();
                    }
                },
                onerror: function() {
                    // Try next source
                    currentSourceIndex++;
                    updateAttempts++;
                    tryUpdateSource();
                },
                ontimeout: function() {
                    // Try next source
                    currentSourceIndex++;
                    updateAttempts++;
                    tryUpdateSource();
                }
            });
        }

        tryUpdateSource();
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

    function checkForUpdatesManual() {
        console.log('[UpdateManager] checkForUpdatesManual called');
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
                console.log('[UpdateManager] Manual check response status:', response.status);
                if (response.status === 200) {
                    const scriptContent = response.responseText;
                    const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
                    console.log('[UpdateManager] Manual check version match:', versionMatch);

                    if (versionMatch && versionMatch[1]) {
                        const latestVersion = versionMatch[1];
                        const currentVersion = GM_info.script.version;
                        console.log('[UpdateManager] Current version:', currentVersion, 'Latest version:', latestVersion);

                        if (isNewerVersion(latestVersion, currentVersion)) {
                            console.log('[UpdateManager] New version available, showing dialog');
                            showUpdateDialog(currentVersion, latestVersion);
                        } else {
                            console.log('[UpdateManager] Already up to date');
                            showNotification('Thông tin', 'Bạn đang sử dụng phiên bản mới nhất!', 3000);
                        }
                    }
                }
                isCheckingForUpdate = false;
            },
            onerror: function(error) {
                console.log('[UpdateManager] Manual check error:', error);
                showNotification('Lỗi', 'Không thể kiểm tra cập nhật. Vui lòng thử lại sau.', 5000);
                debugLog('Lỗi khi kiểm tra cập nhật:', error);
                isCheckingForUpdate = false;
            },
            ontimeout: function() {
                console.log('[UpdateManager] Manual check timeout');
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

    // Export functions
    window.HMTUpdateManager = {
        checkForUpdatesManual: checkForUpdatesManual,
        showUpdateDialog: showUpdateDialog,
        openUpdateSettings: openUpdateSettings,
        fetchChangelog: fetchChangelog,
        generateChangelog: generateChangelog,
        isNewerVersion: isNewerVersion,
        initialize: function() {
            debugLog('Update Manager module đã được khởi tạo');
        }
    };

    // Initialize when module loads
    debugLog('Update Manager module đã được tải');

})();
