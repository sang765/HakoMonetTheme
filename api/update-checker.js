(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const CHECK_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 phút
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/HakoMonetTheme.user.js';

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[UpdateChecker]', ...args);
        }
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


    function checkForUpdates(callback) {
        console.log('[UpdateChecker] checkForUpdates called');
        // Kiểm tra xem người dùng có bật thông báo cập nhật không
        const updateNotificationsEnabled = GM_getValue('update_notifications_enabled', true);
        console.log('[UpdateChecker] updateNotificationsEnabled:', updateNotificationsEnabled);
        if (!updateNotificationsEnabled) {
            debugLog('Thông báo cập nhật đã bị tắt bởi người dùng');
            // Vẫn lưu thời gian kiểm tra để tránh spam requests
            GM_setValue('lastUpdateCheck', Date.now());
            if (callback) callback(null);
            return;
        }

        debugLog('Đang kiểm tra cập nhật...');

        // Sử dụng GitHub API để lấy thông tin commit mới nhất (nhanh hơn)
        const apiUrl = 'https://api.github.com/repos/sang765/HakoMonetTheme/commits/main';

        console.log('[UpdateChecker] Making request to GitHub API:', apiUrl);
        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            timeout: 5000,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'HakoMonetTheme-UpdateChecker'
            },
            onload: function(response) {
                console.log('[UpdateChecker] GitHub API response status:', response.status);
                if (response.status === 200) {
                    try {
                        const commitData = JSON.parse(response.responseText);
                        console.log('[UpdateChecker] Commit data:', commitData);
                        const latestCommitSha = commitData.sha;
                        const latestCommitDate = new Date(commitData.commit.committer.date);

                        // Lấy SHA của commit cuối cùng đã kiểm tra
                        const lastCheckedSha = GM_getValue('lastCheckedCommitSha', '');

                        debugLog(`Latest commit: ${latestCommitSha.substring(0, 7)} (${latestCommitDate.toISOString()})`);

                        if (latestCommitSha !== lastCheckedSha) {
                            debugLog('Đã tìm thấy commit mới!');

                            // Lấy thông tin version từ commit message hoặc file
                            getLatestVersionFromCommit(latestCommitSha, function(latestVersion) {
                                const currentVersion = GM_info.script.version;
                                debugLog(`Phiên bản hiện tại: ${currentVersion}, Phiên bản mới nhất: ${latestVersion}`);

                                if (isNewerVersion(latestVersion, currentVersion)) {
                                    debugLog('Đã tìm thấy phiên bản mới!');
                                    if (callback) callback(latestVersion);
                                } else {
                                    debugLog('Đang sử dụng phiên bản mới nhất.');
                                    if (callback) callback(null);
                                }
                            });

                            // Lưu SHA của commit vừa kiểm tra
                            GM_setValue('lastCheckedCommitSha', latestCommitSha);
                        } else {
                            debugLog('Không có commit mới.');
                            if (callback) callback(null);
                        }

                        // Lưu thời gian kiểm tra cuối cùng
                        GM_setValue('lastUpdateCheck', Date.now());
                    } catch (e) {
                        debugLog('Lỗi parse JSON từ GitHub API:', e);
                        // Fallback to old method
                        fallbackUpdateCheck(callback);
                    }
                } else {
                    debugLog('GitHub API trả về status:', response.status);
                    // Fallback to old method
                    fallbackUpdateCheck(callback);
                }
            },
            onerror: function(error) {
                console.log('[UpdateChecker] GitHub API error:', error);
                debugLog('Lỗi khi gọi GitHub API:', error);
                // Fallback to old method
                fallbackUpdateCheck(callback);
            },
            ontimeout: function() {
                console.log('[UpdateChecker] GitHub API timeout');
                debugLog('GitHub API timeout');
                // Fallback to old method
                fallbackUpdateCheck(callback);
            }
        });
    }

    // Function to trigger update notification manually for testing
    function triggerUpdateNotification() {
        console.log('[UpdateChecker] triggerUpdateNotification called');
        checkForUpdates(function(latestVersion) {
            if (latestVersion) {
                console.log('[UpdateChecker] Update available:', latestVersion);
                // The notification will be handled by update-manager
            } else {
                console.log('[UpdateChecker] No update available');
            }
        });
    }

    function getLatestVersionFromCommit(commitSha, callback) {
        console.log('[UpdateChecker] getLatestVersionFromCommit called with SHA:', commitSha);
        // Lấy nội dung file từ commit cụ thể
        const fileUrl = `https://api.github.com/repos/sang765/HakoMonetTheme/contents/HakoMonetTheme.user.js?ref=${commitSha}`;
        console.log('[UpdateChecker] File URL:', fileUrl);

        GM_xmlhttpRequest({
            method: 'GET',
            url: fileUrl,
            timeout: 5000,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'HakoMonetTheme-UpdateChecker'
            },
            onload: function(response) {
                console.log('[UpdateChecker] File content response status:', response.status);
                if (response.status === 200) {
                    try {
                        const fileData = JSON.parse(response.responseText);
                        console.log('[UpdateChecker] File data received');
                        const scriptContent = atob(fileData.content);
                        const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
                        console.log('[UpdateChecker] Version match:', versionMatch);

                        if (versionMatch && versionMatch[1]) {
                            callback(versionMatch[1]);
                        } else {
                            debugLog('Không tìm thấy version trong file');
                            callback('0.0.0');
                        }
                    } catch (e) {
                        debugLog('Lỗi khi parse file content:', e);
                        callback('0.0.0');
                    }
                } else {
                    debugLog('Không thể lấy file content, status:', response.status);
                    callback('0.0.0');
                }
            },
            onerror: function(error) {
                console.log('[UpdateChecker] Error fetching file content:', error);
                debugLog('Lỗi khi lấy file content:', error);
                callback('0.0.0');
            },
            ontimeout: function() {
                console.log('[UpdateChecker] Timeout fetching file content');
                debugLog('Timeout khi lấy file content');
                callback('0.0.0');
            }
        });
    }

    function fallbackUpdateCheck(callback) {
        console.log('[UpdateChecker] fallbackUpdateCheck called');
        debugLog('Sử dụng phương pháp kiểm tra cập nhật cũ...');

        GM_xmlhttpRequest({
            method: 'GET',
            url: GITHUB_RAW_URL + '?t=' + new Date().getTime(),
            timeout: 10000,
            onload: function(response) {
                console.log('[UpdateChecker] Fallback response status:', response.status);
                if (response.status === 200) {
                    const scriptContent = response.responseText;
                    const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
                    console.log('[UpdateChecker] Fallback version match:', versionMatch);

                    if (versionMatch && versionMatch[1]) {
                        const latestVersion = versionMatch[1];
                        const currentVersion = GM_info.script.version;
                        debugLog(`Phiên bản hiện tại: ${currentVersion}, Phiên bản mới nhất: ${latestVersion}`);

                        if (isNewerVersion(latestVersion, currentVersion)) {
                            debugLog('Đã tìm thấy phiên bản mới!');
                            if (callback) callback(latestVersion);
                        } else {
                            debugLog('Đang sử dụng phiên bản mới nhất.');
                            if (callback) callback(null);
                        }

                        // Lưu thời gian kiểm tra cuối cùng
                        GM_setValue('lastUpdateCheck', Date.now());
                    }
                }
            },
            onerror: function(error) {
                console.log('[UpdateChecker] Fallback error:', error);
                debugLog('Lỗi khi kiểm tra cập nhật (fallback):', error);
                GM_setValue('lastUpdateCheck', Date.now());
                if (callback) callback(null);
            },
            ontimeout: function() {
                console.log('[UpdateChecker] Fallback timeout');
                debugLog('Hết thời gian kiểm tra cập nhật (fallback)');
                GM_setValue('lastUpdateCheck', Date.now());
                if (callback) callback(null);
            }
        });
    }

    function setupAutoUpdate() {
        console.log('[UpdateChecker] setupAutoUpdate called');
        // Kiểm tra xem người dùng có bật tự động kiểm tra cập nhật không
        const autoUpdateEnabled = GM_getValue('auto_update_enabled', true);
        console.log('[UpdateChecker] autoUpdateEnabled:', autoUpdateEnabled);
        if (!autoUpdateEnabled) {
            debugLog('Tự động kiểm tra cập nhật đã bị tắt bởi người dùng');
            return;
        }

        // Kiểm tra lần cuối cập nhật
        const lastUpdateCheck = GM_getValue('lastUpdateCheck', 0);
        const now = Date.now();
        console.log('[UpdateChecker] lastUpdateCheck:', lastUpdateCheck, 'now:', now, 'interval:', CHECK_UPDATE_INTERVAL);

        // Nếu chưa từng kiểm tra hoặc đã qua khoảng thời gian kiểm tra kể từ lần kiểm tra cuối
        if (now - lastUpdateCheck > CHECK_UPDATE_INTERVAL) {
            console.log('[UpdateChecker] Calling checkForUpdates');
            checkForUpdates();
        }

        // Thiết lập interval để kiểm tra định kỳ
        setInterval(checkForUpdates, CHECK_UPDATE_INTERVAL);

        debugLog('Đã thiết lập tự động kiểm tra cập nhật mỗi 5 phút');
    }

    function checkForUpdatesManual() {
        console.log('[UpdateChecker] checkForUpdatesManual called');
        debugLog('Kiểm tra cập nhật thủ công...');
        checkForUpdates(function(latestVersion) {
            console.log('[UpdateChecker] Manual check callback with version:', latestVersion);
            if (latestVersion) {
                // Thông báo sẽ được xử lý bởi update-manager
                debugLog('Đã tìm thấy phiên bản mới:', latestVersion);
            } else {
                debugLog('Đang sử dụng phiên bản mới nhất.');
            }
        });
    }

    function openUpdateSettings() {
        // Mở dialog cài đặt cập nhật
        showNotification('Cài đặt cập nhật', 'Tính năng đang được phát triển.', 3000);
        debugLog('Mở cài đặt cập nhật');
    }


    // Export API
    window.HMTUpdateChecker = {
        checkForUpdates: checkForUpdates,
        checkForUpdatesManual: checkForUpdatesManual,
        setupAutoUpdate: setupAutoUpdate,
        openUpdateSettings: openUpdateSettings,
        triggerUpdateNotification: triggerUpdateNotification
    };

    debugLog('Update Checker API đã được tải');
})();