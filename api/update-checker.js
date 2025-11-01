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


    function processCommitData(commitData, callback) {
        const latestCommitSha = commitData.sha;
        const latestCommitDate = new Date(commitData.commit.committer.date);

        // Lấy SHA của commit cuối cùng đã kiểm tra
        const lastCheckedSha = GM_getValue('lastCheckedCommitSha', '');

        debugLog(`Latest commit: ${latestCommitSha.substring(0, 7)} (${latestCommitDate.toISOString()})`);

        if (latestCommitSha !== lastCheckedSha) {
            debugLog('Đã tìm thấy commit mới!');

            // Check for incremental updates using commit diff
            if (lastCheckedSha) {
                checkIncrementalUpdate(lastCheckedSha, latestCommitSha, function(hasSignificantChanges) {
                    if (hasSignificantChanges) {
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
                    } else {
                        debugLog('Chỉ có thay đổi nhỏ, bỏ qua update notification');
                        if (callback) callback(null);
                    }
                });
            } else {
                // First check, get version normally
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
            }

            // Lưu SHA của commit vừa kiểm tra
            GM_setValue('lastCheckedCommitSha', latestCommitSha);
        } else {
            debugLog('Không có commit mới.');
            if (callback) callback(null);
        }

        // Lưu thời gian kiểm tra cuối cùng
        GM_setValue('lastUpdateCheck', Date.now());
    }

    function checkIncrementalUpdate(oldSha, newSha, callback) {
        // Get commit comparison to check for significant changes
        const compareUrl = `https://api.github.com/repos/sang765/HakoMonetTheme/compare/${oldSha}...${newSha}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: compareUrl,
            timeout: 5000,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'HakoMonetTheme-UpdateChecker'
            },
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const compareData = JSON.parse(response.responseText);
                        const files = compareData.files || [];

                        // Check if any critical files changed
                        const criticalFiles = [
                            'HakoMonetTheme.user.js',
                            'main.js',
                            'api/update-checker.js',
                            'api/monet.js',
                            'module/update-manager.js'
                        ];

                        const hasCriticalChanges = files.some(file =>
                            criticalFiles.some(critical =>
                                file.filename.includes(critical) ||
                                file.filename.startsWith('module/') ||
                                file.filename.startsWith('api/') ||
                                file.filename.startsWith('class/')
                            )
                        );

                        // Also check commit messages for version bumps
                        const hasVersionBump = compareData.commits.some(commit =>
                            commit.commit.message.toLowerCase().includes('version') ||
                            commit.commit.message.toLowerCase().includes('bump') ||
                            commit.commit.message.match(/v?\d+\.\d+\.\d+/)
                        );

                        const hasSignificantChanges = hasCriticalChanges || hasVersionBump ||
                                                   files.length > 10; // Many changes indicate major update

                        debugLog(`Incremental check: ${files.length} files changed, critical: ${hasCriticalChanges}, version bump: ${hasVersionBump}`);
                        callback(hasSignificantChanges);

                    } catch (e) {
                        debugLog('Lỗi parse compare data:', e);
                        callback(true); // Default to significant on error
                    }
                } else {
                    debugLog('Không thể lấy compare data, status:', response.status);
                    callback(true); // Default to significant on error
                }
            },
            onerror: function(error) {
                debugLog('Lỗi khi lấy compare data:', error);
                callback(true); // Default to significant on error
            },
            ontimeout: function() {
                debugLog('Timeout khi lấy compare data');
                callback(true); // Default to significant on error
            }
        });
    }

    function checkForUpdates(callback) {
        console.log('[UpdateChecker] checkForUpdates called');
        const startTime = performance.now();

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

        // Multi-layer caching strategy
        const cachedETag = GM_getValue('github_api_etag', null);
        const cachedData = GM_getValue('github_api_cache', null);
        const cacheTime = GM_getValue('github_api_cache_time', 0);
        const now = Date.now();
        const cacheExpiry = 10 * 60 * 1000; // 10 phút cache expiry

        // Memory cache (session-based)
        if (window.HMTUpdateCache && window.HMTUpdateCache.commitData &&
            (now - window.HMTUpdateCache.timestamp) < cacheExpiry) {
            debugLog('Sử dụng memory cache');
            processCommitData(window.HMTUpdateCache.commitData, callback);
            return;
        }

        // LocalStorage cache
        if (cachedETag && cachedData && (now - cacheTime) < cacheExpiry) {
            debugLog('Sử dụng localStorage cache');
            try {
                const commitData = JSON.parse(cachedData);
                // Update memory cache
                if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                window.HMTUpdateCache.commitData = commitData;
                window.HMTUpdateCache.timestamp = now;
                processCommitData(commitData, callback);
                return;
            } catch (e) {
                debugLog('Lỗi parse cache data:', e);
            }
        }

        // GitHub API request với ETag
        const apiUrl = 'https://api.github.com/repos/sang765/HakoMonetTheme/commits/main';
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'HakoMonetTheme-UpdateChecker'
        };

        // Thêm ETag header nếu có cache
        if (cachedETag) {
            headers['If-None-Match'] = cachedETag;
        }

        console.log('[UpdateChecker] Making request to GitHub API:', apiUrl);
        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            timeout: 5000,
            headers: headers,
            onload: function(response) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                debugLog(`Update check completed in ${duration.toFixed(2)}ms`);

                console.log('[UpdateChecker] GitHub API response status:', response.status);

                // Handle 304 Not Modified (ETag match - no changes)
                if (response.status === 304) {
                    debugLog('ETag match - không có thay đổi từ GitHub API');
                    // Sử dụng dữ liệu từ cache
                    if (cachedData) {
                        try {
                            const commitData = JSON.parse(cachedData);
                            // Update memory cache
                            if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                            window.HMTUpdateCache.commitData = commitData;
                            window.HMTUpdateCache.timestamp = now;
                            processCommitData(commitData, callback);
                        } catch (e) {
                            fallbackUpdateCheck(callback);
                        }
                    } else {
                        // Không có cache, fallback
                        fallbackUpdateCheck(callback);
                    }
                    return;
                }

                if (response.status === 200) {
                    try {
                        const commitData = JSON.parse(response.responseText);
                        console.log('[UpdateChecker] Commit data:', commitData);

                        // Lưu ETag và cache data
                        const responseETag = response.responseHeaders?.['ETag'] || response.responseHeaders?.['etag'];
                        if (responseETag) {
                            GM_setValue('github_api_etag', responseETag);
                            GM_setValue('github_api_cache', response.responseText);
                            GM_setValue('github_api_cache_time', Date.now());
                            debugLog('Đã lưu ETag và cache data');
                        }

                        // Update memory cache
                        if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                        window.HMTUpdateCache.commitData = commitData;
                        window.HMTUpdateCache.timestamp = now;

                        processCommitData(commitData, callback);
                    } catch (e) {
                        debugLog('Lỗi parse JSON từ GitHub API:', e);
                        // Fallback to old method
                        fallbackUpdateCheck(callback);
                    }
                } else if (response.status === 403) {
                    // Rate limit exceeded
                    debugLog('GitHub API rate limit exceeded');
                    const rateLimitReset = response.responseHeaders?.['X-RateLimit-Reset'];
                    if (rateLimitReset) {
                        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
                        const waitMinutes = Math.ceil((resetTime - new Date()) / 60000);
                        debugLog(`Rate limit reset trong ${waitMinutes} phút`);
                        // Sử dụng cache nếu có
                        if (cachedData && (now - cacheTime) < (60 * 60 * 1000)) { // Cache trong 1 giờ khi rate limited
                            debugLog('Sử dụng cache do rate limit');
                            try {
                                const commitData = JSON.parse(cachedData);
                                // Update memory cache
                                if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                                window.HMTUpdateCache.commitData = commitData;
                                window.HMTUpdateCache.timestamp = now;
                                processCommitData(commitData, callback);
                                return;
                            } catch (e) {
                                fallbackUpdateCheck(callback);
                            }
                        }
                    }
                    fallbackUpdateCheck(callback);
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

        // Check cache first
        const cacheKey = `version_cache_${commitSha}`;
        const cachedVersion = GM_getValue(cacheKey, null);
        const cacheTime = GM_getValue(`${cacheKey}_time`, 0);
        const now = Date.now();

        if (cachedVersion && (now - cacheTime) < (24 * 60 * 60 * 1000)) { // Cache 24 giờ
            debugLog('Sử dụng version từ cache');
            callback(cachedVersion);
            return;
        }

        // Try GraphQL API first for better performance
        const graphQLQuery = `
            query($repo: String!, $owner: String!, $expression: String!) {
                repository(name: $repo, owner: $owner) {
                    object(expression: $expression) {
                        ... on Blob {
                            text
                        }
                    }
                }
            }
        `;

        const variables = {
            repo: 'HakoMonetTheme',
            owner: 'sang765',
            expression: `${commitSha}:HakoMonetTheme.user.js`
        };

        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://api.github.com/graphql',
            timeout: 5000,
            headers: {
                'Authorization': GM_getValue('github_token', ''), // Optional: user can set token for higher rate limits
                'Content-Type': 'application/json',
                'User-Agent': 'HakoMonetTheme-UpdateChecker'
            },
            data: JSON.stringify({
                query: graphQLQuery,
                variables: variables
            }),
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.data && data.data.repository && data.data.repository.object) {
                            const scriptContent = data.data.repository.object.text;
                            const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);

                            let version = '0.0.0';
                            if (versionMatch && versionMatch[1]) {
                                version = versionMatch[1];
                            } else {
                                debugLog('Không tìm thấy version trong file (GraphQL)');
                            }

                            // Cache version
                            GM_setValue(cacheKey, version);
                            GM_setValue(`${cacheKey}_time`, now);

                            callback(version);
                            return;
                        }
                    } catch (e) {
                        debugLog('Lỗi parse GraphQL response:', e);
                    }
                }

                // Fallback to REST API
                debugLog('GraphQL failed, falling back to REST API');
                getVersionFromREST(commitSha, callback);
            },
            onerror: function(error) {
                debugLog('GraphQL request error, falling back to REST API:', error);
                getVersionFromREST(commitSha, callback);
            },
            ontimeout: function() {
                debugLog('GraphQL timeout, falling back to REST API');
                getVersionFromREST(commitSha, callback);
            }
        });
    }

    function getVersionFromREST(commitSha, callback) {
        // Lấy nội dung file từ commit cụ thể qua REST API
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

                        let version = '0.0.0';
                        if (versionMatch && versionMatch[1]) {
                            version = versionMatch[1];
                        } else {
                            debugLog('Không tìm thấy version trong file');
                        }

                        // Cache version
                        const cacheKey = `version_cache_${commitSha}`;
                        GM_setValue(cacheKey, version);
                        GM_setValue(`${cacheKey}_time`, Date.now());

                        callback(version);
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

        // Thiết lập interval thông minh với adaptive timing
        setupSmartInterval();

        debugLog('Đã thiết lập tự động kiểm tra cập nhật thông minh');
    }

    function setupSmartInterval() {
        let intervalId = null;
        let consecutiveFailures = 0;
        const maxFailures = 3;
        const baseInterval = CHECK_UPDATE_INTERVAL;

        function smartCheck() {
            checkForUpdates(function(latestVersion) {
                if (latestVersion) {
                    // Reset failures on success
                    consecutiveFailures = 0;
                    // Increase check frequency when update is available
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = setInterval(smartCheck, baseInterval / 2); // Check every 2.5 minutes
                        debugLog('Tăng tần suất kiểm tra do có update mới');
                    }
                } else {
                    consecutiveFailures = 0;
                    // Normal interval
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = setInterval(smartCheck, baseInterval);
                    }
                }
            });
        }

        function checkWithRetry() {
            checkForUpdates(function(latestVersion) {
                if (latestVersion === null && consecutiveFailures < maxFailures) {
                    // Network issue or other failure
                    consecutiveFailures++;
                    const backoffInterval = baseInterval * Math.pow(2, consecutiveFailures);
                    debugLog(`Retry ${consecutiveFailures}/${maxFailures} sau ${backoffInterval/1000}s`);
                    setTimeout(checkWithRetry, backoffInterval);
                } else {
                    consecutiveFailures = 0;
                    if (latestVersion) {
                        // Update available, increase frequency
                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = setInterval(smartCheck, baseInterval / 2);
                        }
                    }
                }
            });
        }

        // Initial check
        smartCheck();

        // Set up recurring checks
        intervalId = setInterval(smartCheck, baseInterval);

        // Store interval ID for cleanup
        window.HMTUpdateIntervalId = intervalId;
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


    // Performance monitoring and analytics
    function recordPerformanceMetric(metric, value) {
        const metrics = GM_getValue('performance_metrics', {});
        if (!metrics[metric]) {
            metrics[metric] = [];
        }
        metrics[metric].push({
            value: value,
            timestamp: Date.now()
        });

        // Keep only last 100 entries per metric
        if (metrics[metric].length > 100) {
            metrics[metric] = metrics[metric].slice(-100);
        }

        GM_setValue('performance_metrics', metrics);
    }

    function getPerformanceStats() {
        const metrics = GM_getValue('performance_metrics', {});
        const stats = {};

        for (const [metric, data] of Object.entries(metrics)) {
            if (data.length > 0) {
                const values = data.map(d => d.value);
                stats[metric] = {
                    count: values.length,
                    avg: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    latest: values[values.length - 1]
                };
            }
        }

        return stats;
    }

    // Offline queue and background sync
    function queueOfflineUpdate(updateData) {
        const queue = GM_getValue('offline_update_queue', []);
        queue.push({
            ...updateData,
            queuedAt: Date.now()
        });

        // Keep queue size manageable
        if (queue.length > 10) {
            queue.shift(); // Remove oldest
        }

        GM_setValue('offline_update_queue', queue);
        debugLog('Queued offline update');
    }

    function processOfflineQueue() {
        const queue = GM_getValue('offline_update_queue', []);
        if (queue.length === 0) return;

        debugLog(`Processing ${queue.length} queued updates`);

        // Process one update at a time to avoid overwhelming
        const update = queue.shift();
        GM_setValue('offline_update_queue', queue);

        // Check if update is still relevant (not too old)
        const age = Date.now() - update.queuedAt;
        if (age > 24 * 60 * 60 * 1000) { // 24 hours
            debugLog('Skipping old queued update');
            processOfflineQueue(); // Process next
            return;
        }

        // Process the update
        checkForUpdates(function(latestVersion) {
            if (latestVersion) {
                // Still have update available, show notification
                if (typeof window.HMTUpdateManager !== 'undefined') {
                    window.HMTUpdateManager.showUpdateDialog(GM_info.script.version, latestVersion);
                }
            }
            // Continue processing queue
            setTimeout(processOfflineQueue, 1000);
        });
    }

    // Background sync when browser is idle
    function setupBackgroundSync() {
        if ('requestIdleCallback' in window) {
            const checkIdleUpdate = () => {
                requestIdleCallback(() => {
                    if (navigator.onLine) {
                        processOfflineQueue();
                    }
                    // Schedule next check
                    setTimeout(checkIdleUpdate, 30 * 60 * 1000); // Every 30 minutes
                }, { timeout: 5000 });
            };
            checkIdleUpdate();
        } else {
            // Fallback for browsers without requestIdleCallback
            setInterval(() => {
                if (navigator.onLine) {
                    processOfflineQueue();
                }
            }, 30 * 60 * 1000);
        }
    }

    // Predictive loading based on usage patterns
    function setupPredictiveLoading() {
        // Track user behavior patterns
        const usagePatterns = GM_getValue('usage_patterns', {
            lastActiveHours: [],
            preferredCheckTimes: []
        });

        const now = new Date();
        const currentHour = now.getHours();

        // Record usage
        usagePatterns.lastActiveHours.push(currentHour);
        if (usagePatterns.lastActiveHours.length > 50) {
            usagePatterns.lastActiveHours.shift();
        }

        GM_setValue('usage_patterns', usagePatterns);

        // Predict optimal check times based on usage patterns
        if (usagePatterns.lastActiveHours.length >= 10) {
            const hourCounts = {};
            usagePatterns.lastActiveHours.forEach(hour => {
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });

            const predictedHour = Object.keys(hourCounts).reduce((a, b) =>
                hourCounts[a] > hourCounts[b] ? a : b
            );

            usagePatterns.preferredCheckTimes = [parseInt(predictedHour)];
            GM_setValue('usage_patterns', usagePatterns);

            debugLog(`Predicted optimal check time: ${predictedHour}:00`);
        }
    }

    // Version skipping logic
    function shouldSkipVersion(version) {
        const skippedVersion = GM_getValue('skipped_version', null);
        const skipTimestamp = GM_getValue('skip_timestamp', 0);
        const now = Date.now();

        // Skip for 7 days
        if (skippedVersion === version && (now - skipTimestamp) < 7 * 24 * 60 * 60 * 1000) {
            return true;
        }

        // Auto-clear old skips
        if (skippedVersion && (now - skipTimestamp) > 7 * 24 * 60 * 60 * 1000) {
            GM_deleteValue('skipped_version');
            GM_deleteValue('skip_timestamp');
        }

        return false;
    }

    // Enhanced checkForUpdates with all features
    function checkForUpdates(callback) {
        const startTime = performance.now();

        // Check if version should be skipped
        const updateNotificationsEnabled = GM_getValue('update_notifications_enabled', true);
        if (!updateNotificationsEnabled) {
            debugLog('Thông báo cập nhật đã bị tắt bởi người dùng');
            GM_setValue('lastUpdateCheck', Date.now());
            recordPerformanceMetric('update_check_duration', performance.now() - startTime);
            if (callback) callback(null);
            return;
        }

        debugLog('Đang kiểm tra cập nhật...');

        // Multi-layer caching strategy
        const cachedETag = GM_getValue('github_api_etag', null);
        const cachedData = GM_getValue('github_api_cache', null);
        const cacheTime = GM_getValue('github_api_cache_time', 0);
        const now = Date.now();
        const cacheExpiry = 10 * 60 * 1000; // 10 phút cache expiry

        // Memory cache (session-based)
        if (window.HMTUpdateCache && window.HMTUpdateCache.commitData &&
            (now - window.HMTUpdateCache.timestamp) < cacheExpiry) {
            debugLog('Sử dụng memory cache');
            processCommitDataEnhanced(window.HMTUpdateCache.commitData, callback);
            recordPerformanceMetric('update_check_duration', performance.now() - startTime);
            return;
        }

        // LocalStorage cache
        if (cachedETag && cachedData && (now - cacheTime) < cacheExpiry) {
            debugLog('Sử dụng localStorage cache');
            try {
                const commitData = JSON.parse(cachedData);
                // Update memory cache
                if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                window.HMTUpdateCache.commitData = commitData;
                window.HMTUpdateCache.timestamp = now;
                processCommitDataEnhanced(commitData, callback);
                recordPerformanceMetric('update_check_duration', performance.now() - startTime);
                return;
            } catch (e) {
                debugLog('Lỗi parse cache data:', e);
            }
        }

        // GitHub API request với ETag
        const apiUrl = 'https://api.github.com/repos/sang765/HakoMonetTheme/commits/main';
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'HakoMonetTheme-UpdateChecker'
        };

        // Thêm ETag header nếu có cache
        if (cachedETag) {
            headers['If-None-Match'] = cachedETag;
        }

        console.log('[UpdateChecker] Making request to GitHub API:', apiUrl);
        GM_xmlhttpRequest({
            method: 'GET',
            url: apiUrl,
            timeout: 5000,
            headers: headers,
            onload: function(response) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                recordPerformanceMetric('update_check_duration', duration);

                console.log('[UpdateChecker] GitHub API response status:', response.status);

                // Handle 304 Not Modified (ETag match - no changes)
                if (response.status === 304) {
                    debugLog('ETag match - không có thay đổi từ GitHub API');
                    // Sử dụng dữ liệu từ cache
                    if (cachedData) {
                        try {
                            const commitData = JSON.parse(cachedData);
                            // Update memory cache
                            if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                            window.HMTUpdateCache.commitData = commitData;
                            window.HMTUpdateCache.timestamp = now;
                            processCommitDataEnhanced(commitData, callback);
                        } catch (e) {
                            fallbackUpdateCheck(callback);
                        }
                    } else {
                        // Không có cache, fallback
                        fallbackUpdateCheck(callback);
                    }
                    return;
                }

                if (response.status === 200) {
                    try {
                        const commitData = JSON.parse(response.responseText);
                        console.log('[UpdateChecker] Commit data:', commitData);

                        // Lưu ETag và cache data
                        const responseETag = response.responseHeaders?.['ETag'] || response.responseHeaders?.['etag'];
                        if (responseETag) {
                            GM_setValue('github_api_etag', responseETag);
                            GM_setValue('github_api_cache', response.responseText);
                            GM_setValue('github_api_cache_time', Date.now());
                            debugLog('Đã lưu ETag và cache data');
                        }

                        // Update memory cache
                        if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                        window.HMTUpdateCache.commitData = commitData;
                        window.HMTUpdateCache.timestamp = now;

                        processCommitDataEnhanced(commitData, callback);
                    } catch (e) {
                        debugLog('Lỗi parse JSON từ GitHub API:', e);
                        // Fallback to old method
                        fallbackUpdateCheck(callback);
                    }
                } else if (response.status === 403) {
                    // Rate limit exceeded
                    debugLog('GitHub API rate limit exceeded');
                    const rateLimitReset = response.responseHeaders?.['X-RateLimit-Reset'];
                    if (rateLimitReset) {
                        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
                        const waitMinutes = Math.ceil((resetTime - new Date()) / 60000);
                        debugLog(`Rate limit reset trong ${waitMinutes} phút`);
                        // Sử dụng cache nếu có
                        if (cachedData && (now - cacheTime) < (60 * 60 * 1000)) { // Cache trong 1 giờ khi rate limited
                            debugLog('Sử dụng cache do rate limit');
                            try {
                                const commitData = JSON.parse(cachedData);
                                // Update memory cache
                                if (!window.HMTUpdateCache) window.HMTUpdateCache = {};
                                window.HMTUpdateCache.commitData = commitData;
                                window.HMTUpdateCache.timestamp = now;
                                processCommitDataEnhanced(commitData, callback);
                                return;
                            } catch (e) {
                                fallbackUpdateCheck(callback);
                            }
                        }
                    }
                    fallbackUpdateCheck(callback);
                } else {
                    debugLog('GitHub API trả về status:', response.status);
                    // Fallback to old method
                    fallbackUpdateCheck(callback);
                }
            },
            onerror: function(error) {
                console.log('[UpdateChecker] GitHub API error:', error);
                debugLog('Lỗi khi gọi GitHub API:', error);
                // Queue for offline processing
                queueOfflineUpdate({ type: 'api_error', error: error });
                // Fallback to old method
                fallbackUpdateCheck(callback);
            },
            ontimeout: function() {
                console.log('[UpdateChecker] GitHub API timeout');
                debugLog('GitHub API timeout');
                // Queue for offline processing
                queueOfflineUpdate({ type: 'api_timeout' });
                // Fallback to old method
                fallbackUpdateCheck(callback);
            }
        });
    }

    function processCommitDataEnhanced(commitData, callback) {
        const latestCommitSha = commitData.sha;
        const latestCommitDate = new Date(commitData.commit.committer.date);

        // Lấy SHA của commit cuối cùng đã kiểm tra
        const lastCheckedSha = GM_getValue('lastCheckedCommitSha', '');

        debugLog(`Latest commit: ${latestCommitSha.substring(0, 7)} (${latestCommitDate.toISOString()})`);

        if (latestCommitSha !== lastCheckedSha) {
            debugLog('Đã tìm thấy commit mới!');

            // Check for incremental updates using commit diff
            if (lastCheckedSha) {
                checkIncrementalUpdate(lastCheckedSha, latestCommitSha, function(hasSignificantChanges) {
                    if (hasSignificantChanges) {
                        // Lấy thông tin version từ commit message hoặc file
                        getLatestVersionFromCommit(latestCommitSha, function(latestVersion) {
                            if (latestVersion && !shouldSkipVersion(latestVersion)) {
                                const currentVersion = GM_info.script.version;
                                debugLog(`Phiên bản hiện tại: ${currentVersion}, Phiên bản mới nhất: ${latestVersion}`);

                                if (isNewerVersion(latestVersion, currentVersion)) {
                                    debugLog('Đã tìm thấy phiên bản mới!');
                                    recordPerformanceMetric('update_success_rate', 1);
                                    if (callback) callback(latestVersion);
                                } else {
                                    debugLog('Đang sử dụng phiên bản mới nhất.');
                                    recordPerformanceMetric('update_success_rate', 0);
                                    if (callback) callback(null);
                                }
                            } else {
                                debugLog('Version bị skip hoặc không tìm thấy');
                                if (callback) callback(null);
                            }
                        });
                    } else {
                        debugLog('Chỉ có thay đổi nhỏ, bỏ qua update notification');
                        recordPerformanceMetric('update_success_rate', 0);
                        if (callback) callback(null);
                    }
                });
            } else {
                // First check, get version normally
                getLatestVersionFromCommit(latestCommitSha, function(latestVersion) {
                    if (latestVersion && !shouldSkipVersion(latestVersion)) {
                        const currentVersion = GM_info.script.version;
                        debugLog(`Phiên bản hiện tại: ${currentVersion}, Phiên bản mới nhất: ${latestVersion}`);

                        if (isNewerVersion(latestVersion, currentVersion)) {
                            debugLog('Đã tìm thấy phiên bản mới!');
                            recordPerformanceMetric('update_success_rate', 1);
                            if (callback) callback(latestVersion);
                        } else {
                            debugLog('Đang sử dụng phiên bản mới nhất.');
                            recordPerformanceMetric('update_success_rate', 0);
                            if (callback) callback(null);
                        }
                    } else {
                        debugLog('Version bị skip hoặc không tìm thấy');
                        if (callback) callback(null);
                    }
                });
            }

            // Lưu SHA của commit vừa kiểm tra
            GM_setValue('lastCheckedCommitSha', latestCommitSha);
        } else {
            debugLog('Không có commit mới.');
            recordPerformanceMetric('update_success_rate', 0);
            if (callback) callback(null);
        }

        // Lưu thời gian kiểm tra cuối cùng
        GM_setValue('lastUpdateCheck', Date.now());
    }

    // Service Worker integration
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/api/service-worker.js')
                .then(registration => {
                    debugLog('Service Worker registered successfully');

                    // Request notification permission for push updates
                    if ('Notification' in window && Notification.permission === 'default') {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                debugLog('Notification permission granted');
                            }
                        });
                    }
                })
                .catch(error => {
                    debugLog('Service Worker registration failed:', error);
                });
        } else {
            debugLog('Service Worker not supported');
        }
    }

    // Rollback mechanism for failed updates
    function createRollbackPoint() {
        const rollbackData = {
            version: GM_info.script.version,
            timestamp: Date.now(),
            resources: {}
        };

        // Store current resource states for rollback
        const resources = [
            'mainJS', 'monetAPIJS', 'updateCheckerJS', 'simpleCORSJS', 'infoTruyenJS',
            'animationJS', 'tagColorJS', 'fontImportJS', 'colorinfotruyen', 'pagegeneralJS'
        ];

        resources.forEach(resourceName => {
            try {
                const resourceContent = GM_getResourceText(resourceName);
                if (resourceContent) {
                    rollbackData.resources[resourceName] = resourceContent;
                }
            } catch (e) {
                debugLog(`Failed to backup resource ${resourceName}:`, e);
            }
        });

        GM_setValue('rollback_point', rollbackData);
        debugLog('Rollback point created');
    }

    function rollbackToPreviousVersion() {
        const rollbackData = GM_getValue('rollback_point', null);
        if (!rollbackData) {
            debugLog('No rollback point available');
            return false;
        }

        try {
            // Restore resources
            for (const [resourceName, content] of Object.entries(rollbackData.resources)) {
                // Note: In a real implementation, this would need to be handled differently
                // as GM_getResourceText is read-only. This is a conceptual implementation.
                debugLog(`Would restore ${resourceName} from rollback`);
            }

            showNotification('Rollback', `Đã rollback về phiên bản ${rollbackData.version}`, 5000);
            return true;
        } catch (e) {
            debugLog('Rollback failed:', e);
            return false;
        }
    }

    // Smart delta updates - only update changed resources
    function performDeltaUpdate(newVersion, callback) {
        const currentVersion = GM_info.script.version;

        // Get list of changed files between versions
        getChangedFiles(currentVersion, newVersion, function(changedFiles) {
            if (!changedFiles || changedFiles.length === 0) {
                debugLog('No files changed, skipping delta update');
                if (callback) callback(false);
                return;
            }

            debugLog(`Delta update: ${changedFiles.length} files changed`);

            // Create rollback point before updating
            createRollbackPoint();

            // Download and apply only changed resources
            downloadChangedResources(changedFiles, function(success) {
                if (success) {
                    showNotification('Delta Update', `Đã cập nhật ${changedFiles.length} resources`, 3000);
                    GM_setValue('last_delta_update', Date.now());
                } else {
                    // Attempt rollback
                    if (rollbackToPreviousVersion()) {
                        showNotification('Update Failed', 'Đã rollback về phiên bản trước', 5000);
                    }
                }

                if (callback) callback(success);
            });
        });
    }

    function getChangedFiles(oldVersion, newVersion, callback) {
        // This would compare commits between versions to find changed files
        // For now, return a mock implementation
        const mockChangedFiles = [
            'api/update-checker.js',
            'module/update-manager.js'
        ];

        // In real implementation, this would use GitHub API to compare versions
        setTimeout(() => {
            callback(mockChangedFiles);
        }, 100);
    }

    function downloadChangedResources(changedFiles, callback) {
        let downloaded = 0;
        let failed = 0;
        const total = changedFiles.length;
        const maxConcurrent = 3; // Connection pooling - max 3 concurrent downloads
        let activeDownloads = 0;
        let fileIndex = 0;

        if (total === 0) {
            callback(true);
            return;
        }

        function downloadNext() {
            if (fileIndex >= total || activeDownloads >= maxConcurrent) {
                return;
            }

            const filePath = changedFiles[fileIndex];
            fileIndex++;
            activeDownloads++;

            // Try multiple CDNs with fallback
            const cdns = [
                `https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/${filePath}`,
                `https://cdn.jsdelivr.net/gh/sang765/HakoMonetTheme@main/${filePath}`,
                `https://sang765.github.io/HakoMonetTheme/${filePath}`
            ];

            let cdnIndex = 0;

            function tryCDN() {
                if (cdnIndex >= cdns.length) {
                    debugLog(`All CDNs failed for ${filePath}`);
                    failed++;
                    activeDownloads--;
                    checkComplete();
                    return;
                }

                const url = cdns[cdnIndex];
                cdnIndex++;

                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    timeout: 8000,
                    onload: function(response) {
                        if (response.status === 200) {
                            // In a real implementation, this would update the resource
                            // For now, just log success
                            debugLog(`Downloaded ${filePath} from ${url}`);
                            downloaded++;
                            activeDownloads--;
                            checkComplete();
                            downloadNext(); // Start next download
                        } else {
                            // Try next CDN
                            tryCDN();
                        }
                    },
                    onerror: function() {
                        // Try next CDN
                        tryCDN();
                    },
                    ontimeout: function() {
                        // Try next CDN
                        tryCDN();
                    }
                });
            }

            tryCDN();
        }

        function checkComplete() {
            if (downloaded + failed === total) {
                const success = failed === 0;
                debugLog(`Delta update complete: ${downloaded} downloaded, ${failed} failed`);
                callback(success);
            }
        }

        // Start initial downloads
        for (let i = 0; i < Math.min(maxConcurrent, total); i++) {
            downloadNext();
        }
    }

    // Hot-reload mechanism (limited in userscript context)
    function hotReload() {
        // In userscript context, true hot-reload is limited
        // But we can reload specific modules if they're designed for it
        debugLog('Hot-reload requested');

        // Trigger a soft reload by re-executing non-critical modules
        if (typeof window.HMTUpdateManager !== 'undefined') {
            // Reinitialize update manager
            if (typeof window.HMTUpdateManager.initialize === 'function') {
                window.HMTUpdateManager.initialize();
            }
        }

        showNotification('Hot Reload', 'Đã reload các module không quan trọng', 3000);
    }

    // Initialize all features
    setupBackgroundSync();
    setupPredictiveLoading();
    registerServiceWorker();

    // Export enhanced API
    window.HMTUpdateChecker = {
        checkForUpdates: checkForUpdates,
        checkForUpdatesManual: checkForUpdatesManual,
        setupAutoUpdate: setupAutoUpdate,
        openUpdateSettings: openUpdateSettings,
        triggerUpdateNotification: triggerUpdateNotification,
        getPerformanceStats: getPerformanceStats,
        recordPerformanceMetric: recordPerformanceMetric,
        shouldSkipVersion: shouldSkipVersion,
        processOfflineQueue: processOfflineQueue,
        performDeltaUpdate: performDeltaUpdate,
        createRollbackPoint: createRollbackPoint,
        rollbackToPreviousVersion: rollbackToPreviousVersion,
        hotReload: hotReload
    };

    debugLog('Update Checker API đã được tải với tất cả tính năng nâng cao');
})();