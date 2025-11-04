(function() {
    'use strict';

    // 🎨 ENHANCED NOTIFICATION SYSTEM CONFIG
    const NOTIFICATION_STYLES = {
        TOAST: 'toast',      // Non-intrusive corner notifications
        MODAL: 'modal',      // Full-screen update dialogs
        BADGE: 'badge',      // Subtle UI indicators
        BANNER: 'banner'     // Top banner notifications
    };

    const DEBUG = GM_getValue('debug_mode', false);
    const GITHUB_REPO = 'https://github.com/sang765/HakoMonetTheme';
    const RAW_GITHUB_URL = 'https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/';

    let isCheckingForUpdate = false;
    let notificationQueue = [];
    let activeNotifications = new Set();

    // 📝 ENHANCED LOGGING VỚI PERFORMANCE TRACKING
    function debugLog(...args) {
        if (DEBUG) {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [UpdateManager]`, ...args);
        }
    }

    // 🎯 SMART NOTIFICATION SYSTEM
    function showSmartNotification(title, message, options = {}) {
        const {
            style = determineOptimalNotificationStyle(),
            timeout = 5000,
            priority = 'normal',
            actions = [],
            sound = false,
            persistent = false
        } = options;

        // Queue management for non-intrusive notifications
        if (style === NOTIFICATION_STYLES.TOAST && activeNotifications.size >= 3) {
            notificationQueue.push({ title, message, options });
            debugLog('Notification queued - too many active notifications');
            return;
        }

        const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        activeNotifications.add(notificationId);

        switch (style) {
            case NOTIFICATION_STYLES.TOAST:
                showToastNotification(title, message, { ...options, notificationId });
                break;
            case NOTIFICATION_STYLES.MODAL:
                showModalNotification(title, message, { ...options, notificationId });
                break;
            case NOTIFICATION_STYLES.BADGE:
                showBadgeNotification(title, message, { ...options, notificationId });
                break;
            case NOTIFICATION_STYLES.BANNER:
                showBannerNotification(title, message, { ...options, notificationId });
                break;
            default:
                showToastNotification(title, message, { ...options, notificationId });
        }

        // Process queue after notification expires
        if (!persistent) {
            setTimeout(() => {
                activeNotifications.delete(notificationId);
                processNotificationQueue();
            }, timeout);
        }
    }

    function determineOptimalNotificationStyle() {
        // Adaptive notification style based on user context
        const userPreferences = GM_getValue('notification_preferences', {});
        const pageContext = detectPageContext();
        const userActivity = detectUserActivity();

        // Use modal for important updates when user is active
        if (userActivity === 'active' && pageContext === 'main') {
            return NOTIFICATION_STYLES.MODAL;
        }

        // Use toast for non-intrusive notifications
        if (userPreferences.prefer_non_intrusive) {
            return NOTIFICATION_STYLES.TOAST;
        }

        // Use badge for subtle updates
        return NOTIFICATION_STYLES.BADGE;
    }

    function detectPageContext() {
        // Detect if user is on main content or navigation
        const url = window.location.href;
        if (url.includes('/truyen/') || url.includes('/manga/')) {
            return 'reading';
        }
        if (url.includes('/danh-sach') || url.includes('/tim-kiem')) {
            return 'browsing';
        }
        return 'main';
    }

    function detectUserActivity() {
        // Simple activity detection based on recent interactions
        const lastActivity = GM_getValue('last_user_activity', 0);
        const now = Date.now();
        const timeSinceActivity = now - lastActivity;

        if (timeSinceActivity < 30000) return 'active'; // 30 seconds
        if (timeSinceActivity < 300000) return 'semi_active'; // 5 minutes
        return 'inactive';
    }

    function processNotificationQueue() {
        if (notificationQueue.length > 0 && activeNotifications.size < 3) {
            const nextNotification = notificationQueue.shift();
            showSmartNotification(nextNotification.title, nextNotification.message, nextNotification.options);
        }
    }

    // Record user activity for adaptive notifications
    function recordUserActivity() {
        GM_setValue('last_user_activity', Date.now());
    }

    // Add activity listeners
    ['click', 'scroll', 'keydown'].forEach(event => {
        document.addEventListener(event, recordUserActivity, { passive: true });
    });

    // 🍞 TOAST NOTIFICATIONS (Non-intrusive)
    function showToastNotification(title, message, options = {}) {
        const { timeout = 5000, priority = 'normal', actions = [], notificationId } = options;

        const toast = document.createElement('div');
        toast.className = `hmt-toast hmt-toast-${priority}`;
        toast.setAttribute('data-notification-id', notificationId);

        const position = getToastPosition();
        toast.style.cssText = `
            position: fixed;
            ${position};
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 350px;
            min-width: 280px;
            animation: toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;

        const actionButtons = actions.map(action =>
            `<button class="toast-action" data-action="${action.id}" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                margin-left: 8px;
                transition: all 0.2s ease;
            ">${action.label}</button>`
        ).join('');

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-header" style="display: flex; align-items: center; margin-bottom: 8px;">
                    <h4 style="margin: 0; font-size: 16px; font-weight: 600; flex: 1;">${title}</h4>
                    <button class="toast-close" style="
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.7);
                        cursor: pointer;
                        font-size: 18px;
                        padding: 0;
                        margin-left: 8px;
                    ">×</button>
                </div>
                <p style="margin: 0; font-size: 14px; opacity: 0.95; line-height: 1.4;">${message}</p>
                ${actionButtons ? `<div class="toast-actions" style="margin-top: 12px;">${actionButtons}</div>` : ''}
            </div>
            <div class="toast-progress" style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 0 0 12px 12px;
                animation: toastProgress ${timeout}ms linear;
            "></div>
        `;

        document.body.appendChild(toast);

        // Event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toast, notificationId));

        // Action button listeners
        actions.forEach(action => {
            const actionBtn = toast.querySelector(`[data-action="${action.id}"]`);
            if (actionBtn) {
                actionBtn.addEventListener('click', () => {
                    action.callback();
                    removeToast(toast, notificationId);
                });
            }
        });

        // Auto remove
        setTimeout(() => removeToast(toast, notificationId), timeout);

        // Add CSS animations
        addToastAnimations();
    }

    function getToastPosition() {
        const existingToasts = document.querySelectorAll('.hmt-toast');
        const baseTop = 20;
        const toastHeight = 100; // Approximate height
        const offset = existingToasts.length * (toastHeight + 10);

        return `top: ${baseTop + offset}px; right: 20px;`;
    }

    function removeToast(toast, notificationId) {
        toast.style.animation = 'toastSlideOut 0.3s ease-in';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
                activeNotifications.delete(notificationId);
                processNotificationQueue();
            }
        }, 300);
    }

    function addToastAnimations() {
        if (document.getElementById('hmt-toast-styles')) return;

        const style = document.createElement('style');
        style.id = 'hmt-toast-styles';
        style.textContent = `
            @keyframes toastSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes toastSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            @keyframes toastProgress {
                from { width: 100%; }
                to { width: 0%; }
            }
            .hmt-toast-high {
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
                border-left: 4px solid #dc3545;
            }
            .hmt-toast-normal {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
            }
            .hmt-toast-low {
                background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%) !important;
            }
            .toast-action:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }

    // 🏷️ BADGE NOTIFICATIONS (Subtle UI indicators)
    function showBadgeNotification(title, message, options = {}) {
        const { timeout = 8000, notificationId } = options;

        // Create or update existing badge
        let badge = document.getElementById('hmt-update-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'hmt-update-badge';
            badge.style.cssText = `
                position: fixed;
                top: 50%;
                right: -60px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                color: white;
                padding: 12px 16px;
                border-radius: 25px 0 0 25px;
                box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                cursor: pointer;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                transform: translateX(0);
                animation: badgeSlideIn 0.5s ease-out;
            `;

            badge.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">🔔</span>
                    <span>${title}</span>
                </div>
            `;

            badge.addEventListener('click', () => {
                // Expand to show full message
                if (badge.classList.contains('expanded')) {
                    badge.classList.remove('expanded');
                    badge.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">🔔</span>
                            <span>${title}</span>
                        </div>
                    `;
                } else {
                    badge.classList.add('expanded');
                    badge.innerHTML = `
                        <div style="max-width: 250px;">
                            <div style="font-weight: 700; margin-bottom: 4px;">${title}</div>
                            <div style="font-size: 12px; opacity: 0.9; line-height: 1.3;">${message}</div>
                            <div style="margin-top: 8px; display: flex; gap: 6px;">
                                <button class="badge-btn" data-action="view" style="
                                    background: rgba(255, 255, 255, 0.2);
                                    border: none;
                                    color: white;
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 11px;
                                ">Xem</button>
                                <button class="badge-btn" data-action="dismiss" style="
                                    background: rgba(255, 255, 255, 0.1);
                                    border: none;
                                    color: white;
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 11px;
                                ">Bỏ qua</button>
                            </div>
                        </div>
                    `;

                    // Add button listeners
                    const viewBtn = badge.querySelector('[data-action="view"]');
                    const dismissBtn = badge.querySelector('[data-action="dismiss"]');

                    viewBtn.addEventListener('click', () => {
                        // Trigger update dialog
                        if (typeof window.HMTUpdateChecker !== 'undefined') {
                            window.HMTUpdateChecker.checkForUpdatesManual();
                        }
                        removeBadge(badge, notificationId);
                    });

                    dismissBtn.addEventListener('click', () => {
                        removeBadge(badge, notificationId);
                    });
                }
            });

            document.body.appendChild(badge);
        }

        // Auto remove
        setTimeout(() => removeBadge(badge, notificationId), timeout);
    }

    function removeBadge(badge, notificationId) {
        if (badge) {
            badge.style.animation = 'badgeSlideOut 0.3s ease-in';
            setTimeout(() => {
                if (badge.parentElement) {
                    badge.remove();
                    activeNotifications.delete(notificationId);
                    processNotificationQueue();
                }
            }, 300);
        }
    }

    // 🏴 BANNER NOTIFICATIONS (Top banner)
    function showBannerNotification(title, message, options = {}) {
        const { timeout = 10000, notificationId } = options;

        let banner = document.getElementById('hmt-banner-notification');
        if (banner) {
            banner.remove(); // Remove existing banner
        }

        banner = document.createElement('div');
        banner.id = 'hmt-banner-notification';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            animation: bannerSlideDown 0.4s ease-out;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;

        banner.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px;">📢</span>
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${title}</div>
                        <div style="font-size: 13px; opacity: 0.9;">${message}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="banner-btn" data-action="view" style="
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        padding: 6px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                    ">Xem chi tiết</button>
                    <button class="banner-close" style="
                        background: none;
                        border: none;
                        color: rgba(255, 255, 255, 0.7);
                        cursor: pointer;
                        font-size: 20px;
                        padding: 0;
                        margin-left: 8px;
                    ">×</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Adjust body padding to account for banner
        document.body.style.paddingTop = '60px';

        // Event listeners
        const closeBtn = banner.querySelector('.banner-close');
        const viewBtn = banner.querySelector('[data-action="view"]');

        closeBtn.addEventListener('click', () => removeBanner(banner, notificationId));
        viewBtn.addEventListener('click', () => {
            if (typeof window.HMTUpdateChecker !== 'undefined') {
                window.HMTUpdateChecker.checkForUpdatesManual();
            }
            removeBanner(banner, notificationId);
        });

        // Auto remove
        setTimeout(() => removeBanner(banner, notificationId), timeout);
    }

    function removeBanner(banner, notificationId) {
        banner.style.animation = 'bannerSlideUp 0.3s ease-in';
        document.body.style.paddingTop = '0px';
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
                activeNotifications.delete(notificationId);
                processNotificationQueue();
            }
        }, 300);
    }

    // Add banner animations
    function addBannerAnimations() {
        if (document.getElementById('hmt-banner-styles')) return;

        const style = document.createElement('style');
        style.id = 'hmt-banner-styles';
        style.textContent = `
            @keyframes bannerSlideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            @keyframes bannerSlideUp {
                from { transform: translateY(0); }
                to { transform: translateY(-100%); }
            }
            @keyframes badgeSlideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            @keyframes badgeSlideOut {
                from { transform: translateX(0); }
                to { transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize notification animations
    addBannerAnimations();
    addToastAnimations();

    // Legacy notification function (backwards compatibility)
    function showNotification(title, message, timeout = 5000) {
        showSmartNotification(title, message, { timeout, style: NOTIFICATION_STYLES.TOAST });
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
            const sha = commit.sha;
            const shortSha = sha.substring(0, 7);
            const commitUrl = `https://github.com/sang765/HakoMonetTheme/commit/${sha}`;

            // Check for version bump commits
            if (message.includes(`bump version to ${newVersion}`) ||
                message.includes(`version ${newVersion}`) ||
                message.match(new RegExp(`v?${newVersion.replace(/\./g, '\\.')}`, 'i'))) {
                foundNew = true;
                changelog.push(`\`${message}\` - [\`${shortSha}\`](${commitUrl})`);
            } else if (message.includes(`bump version to ${currentVersion}`) ||
                       message.includes(`version ${currentVersion}`) ||
                       message.match(new RegExp(`v?${currentVersion.replace(/\./g, '\\.')}`, 'i'))) {
                foundCurrent = true;
                changelog.push(`\`${message}\` - [\`${shortSha}\`](${commitUrl})`);
                break; // Stop when we reach current version
            } else if (foundNew && !foundCurrent) {
                // Include commits between versions
                if (message.startsWith('feat:') || message.startsWith('fix:') || message.startsWith('refactor:') ||
                    message.startsWith('docs:') || message.startsWith('style:') || message.startsWith('perf:') ||
                    message.startsWith('test:') || message.startsWith('chore:') || message.startsWith('build:') ||
                    message.startsWith('ci:') || message.startsWith('revert:') ||
                    message.includes('update') || message.includes('add') || message.includes('remove') ||
                    message.includes('change') || message.includes('improve') || message.includes('fix')) {
                    changelog.push(`\`${message}\` - [\`${shortSha}\`](${commitUrl})`);
                }
            }
        }

        // If no specific version commits found, include recent commits
        if (changelog.length === 0 && commits.length > 0) {
            debugLog('No version-specific commits found, including recent commits');
            const recentCommits = commits.slice(0, Math.min(10, commits.length));
            for (const commit of recentCommits) {
                const message = commit.commit.message;
                const sha = commit.sha;
                const shortSha = sha.substring(0, 7);
                const commitUrl = `https://github.com/sang765/HakoMonetTheme/commit/${sha}`;
                changelog.push(`\`${message}\` - [\`${shortSha}\`](${commitUrl})`);
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
                background: rgba(0, 0, 0, 0.02);
                border-radius: 8px;
                padding: 16px;
                border: 1px solid rgba(0, 0, 0, 0.05);
            }
            .changelog ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
                max-height: 250px;
                overflow-y: auto;
            }
            .changelog li {
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 1.4;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            .changelog li code {
                background: rgba(0,0,0,0.1);
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                font-size: 13px;
            }
            .changelog li a {
                color: #007bff;
                text-decoration: none;
            }
            .changelog li a:hover {
                text-decoration: underline;
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
            performSmartUpdate(newVersion, overlay, currentVersion);
        });

        // Load changelog với enhanced parsing
        const changelogList = overlay.querySelector('#changelog-list');
        fetchChangelog(currentVersion, newVersion).then(changelog => {
            // Enhanced markdown parser với syntax highlighting
            const parseMarkdown = (text) => {
                return text
                    // Support line breaks in changelog messages
                    .replace(/\n/g, '<br>')
                    .replace(/<br>- /g, '<br>• ')

                    // Headers với enhanced styling
                    .replace(/^### (.*$)/gm, '<h3 style="font-size: 14px; font-weight: bold; margin: 12px 0 6px 0; color: #007bff; border-bottom: 1px solid rgba(0,123,255,0.2); padding-bottom: 4px;">$1</h3>')
                    .replace(/^## (.*$)/gm, '<h2 style="font-size: 16px; font-weight: bold; margin: 16px 0 8px 0; color: #007bff; background: rgba(0,123,255,0.05); padding: 4px 8px; border-radius: 4px;">$1</h2>')
                    .replace(/^# (.*$)/gm, '<h1 style="font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: #007bff; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 8px;">$1</h1>')

                    // Subtext với icon
                    .replace(/^-# (.*$)/gm, '<div style="color: #6c757d; font-size: 12px; display: flex; align-items: center; margin: 6px 0;"><span style="margin-right: 6px;">ℹ️</span>$1</div>')

                    // Strikethrough với style
                    .replace(/~~(.*?)~~/g, '<del style="text-decoration: line-through; background: rgba(220, 53, 69, 0.1); padding: 2px 4px; border-radius: 3px;">$1</del>')

                    // Enhanced underline combinations
                    .replace(/___(.*?)___/g, '<u style="text-decoration: underline wavy;"><strong><em>$1</em></strong></u>')
                    .replace(/__\*\*\*(.*?)\*\*\*__/g, '<u style="text-decoration: underline wavy;"><strong><em>$1</em></strong></u>')
                    .replace(/__\*\*(.*?)\*\*__/g, '<u style="text-decoration: underline double;"><strong>$1</strong></u>')
                    .replace(/__\*(.*?)\*__/g, '<u style="text-decoration: underline;"><em>$1</em></u>')
                    .replace(/__(.*?)__/g, '<u style="text-decoration: underline;">$1</u>')

                    // Enhanced bold/italic với colors
                    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong style="color: #dc3545;"><em>$1</em></strong>')
                    .replace(/\*\*_([^_]+)_\*\*/g, '<strong style="color: #dc3545;"><em>$1</em></strong>')
                    .replace(/\*_([^_]+)_\*/g, '<strong style="color: #dc3545;"><em>$1</em></strong>')
                    .replace(/\*_(.*?)_\*/g, '<strong style="color: #dc3545;"><em>$1</em></strong>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #28a745;">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em style="color: #007bff;">$1</em>')

                    // Enhanced italic
                    .replace(/_([^_]+)_/g, '<em style="font-style: italic; color: #6f42c1;">$1</em>')

                    // Enhanced links với hover effects
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #007bff; text-decoration: none; border-bottom: 1px solid rgba(0,123,255,0.3);" onmouseover="this.style.background=\'rgba(0,123,255,0.1)\'" onmouseout="this.style.background=\'transparent\'">$1</a>')

                    // Enhanced inline code
                    .replace(/`(.*?)`/g, '<code style="background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%); padding: 3px 6px; border-radius: 4px; font-family: \'SFMono-Regular\', \'Monaco\', \'Inconsolata\', \'Fira Code\', \'Droid Sans Mono\', \'Source Code Pro\', monospace; font-size: 13px; border: 1px solid rgba(0,0,0,0.1);">$1</code>')

                    // Enhanced block quotes
                    .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #007bff; padding: 8px 12px; margin: 10px 0; background: rgba(0,123,255,0.03); border-radius: 0 4px 4px 0; color: #495057; font-style: italic; position: relative;"><span style="position: absolute; left: -12px; top: 8px; color: #007bff; font-size: 20px;">"</span>$1</blockquote>')
                    .replace(/^>>> (.*$)/gm, '<blockquote style="border-left: 4px solid #28a745; padding: 12px 16px; margin: 12px 0; background: rgba(40, 167, 69, 0.05); border-radius: 6px; color: #155724; font-style: italic; position: relative;"><span style="position: absolute; left: -14px; top: 12px; color: #28a745; font-size: 24px; font-weight: bold;">»</span>$1</blockquote>')

                    // Enhanced code blocks với syntax highlighting placeholder
                    .replace(/```([\s\S]*?)```/g, '<pre style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 12px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.1); overflow-x: auto; font-family: \'SFMono-Regular\', \'Monaco\', \'Inconsolata\', \'Fira Code\', \'Droid Sans Mono\', \'Source Code Pro\', monospace; font-size: 12px; margin: 10px 0; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);"><code>$1</code></pre>')

                    // Task lists (- [x] task, - [ ] task)
                    .replace(/- \[x\] (.*$)/gm, '<div style="display: flex; align-items: center; margin: 4px 0;"><span style="color: #28a745; margin-right: 8px; font-size: 16px;">✅</span><span style="text-decoration: line-through; color: #6c757d;">$1</span></div>')
                    .replace(/- \[ \] (.*$)/gm, '<div style="display: flex; align-items: center; margin: 4px 0;"><span style="color: #6c757d; margin-right: 8px; font-size: 16px;">⬜</span><span>$1</span></div>')

                    // Emoji support và special formatting
                    .replace(/:bug:/g, '🐛')
                    .replace(/:sparkles:/g, '✨')
                    .replace(/:fire:/g, '🔥')
                    .replace(/:rocket:/g, '🚀')
                    .replace(/:warning:/g, '⚠️')
                    .replace(/:memo:/g, '📝')
                    .replace(/:white_check_mark:/g, '✅')
                    .replace(/:x:/g, '❌');
            };

            // Add loading animation
            changelogList.innerHTML = '<li style="text-align: center; color: #6c757d;"><div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #007bff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite; margin-right: 8px;"></div>Đang tải nhật ký thay đổi...</li>';

            // Simulate async loading for better UX
            setTimeout(() => {
                const parsedChangelog = changelog.map((item, index) => {
                    const parsed = parseMarkdown(item);
                    // Add fade-in animation
                    return `<li style="animation: fadeInUp 0.5s ease-out ${index * 0.1}s both;">${parsed}</li>`;
                }).join('');

                changelogList.innerHTML = parsedChangelog;

                // Add fade-in animation CSS if not exists
                if (!document.getElementById('changelog-animations')) {
                    const style = document.createElement('style');
                    style.id = 'changelog-animations';
                    style.textContent = `
                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translateY(20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                updatePerfInfo();
            }, 500); // Small delay for better UX
        });

        // Auto-close after 5 minutes
        setTimeout(() => {
            if (overlay.parentElement) {
                overlay.remove();
                debugLog('Update dialog auto-closed after 5 minutes');
            }
        }, 5 * 60 * 1000);
    }

    // 🚀 ENHANCED MULTI-CDN UPDATE SYSTEM
    function performSmartUpdate(newVersion, overlay, currentVersion) {
        debugLog(`🚀 Starting smart update from ${currentVersion} to ${newVersion}`);

        // Enhanced CDN sources with performance metrics
        const updateSources = [
            {
                name: 'GitHub Raw',
                url: RAW_GITHUB_URL + 'HakoMonetTheme.user.js',
                region: 'global',
                reliability: 0.95,
                speed: 'medium'
            },
            {
                name: 'jsDelivr CDN',
                url: 'https://cdn.jsdelivr.net/gh/sang765/HakoMonetTheme@main/HakoMonetTheme.user.js',
                region: 'global',
                reliability: 0.98,
                speed: 'fast'
            },
            {
                name: 'GitHub Pages',
                url: 'https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js',
                region: 'global',
                reliability: 0.90,
                speed: 'medium'
            },
            {
                name: 'GitHub Pages',
                url: 'https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js',
                region: 'global',
                reliability: 0.92,
                speed: 'fast'
            },
            {
                name: 'RawGit CDN',
                url: 'https://rawgit.com/sang765/HakoMonetTheme/main/HakoMonetTheme.user.js',
                region: 'global',
                reliability: 0.85,
                speed: 'slow'
            }
        ];

        // Sort sources by performance and reliability
        const sortedSources = sortSourcesByPerformance(updateSources);
        let currentSourceIndex = 0;
        let updateAttempts = 0;
        const maxAttempts = Math.min(3, sortedSources.length);
        let bestSource = null;
        let sourceLatencies = {};

        debugLog(`📊 Testing ${maxAttempts} sources:`, sortedSources.slice(0, maxAttempts).map(s => s.name));

        function tryUpdateSource() {
            if (updateAttempts >= maxAttempts) {
                if (bestSource) {
                    proceedWithUpdate(bestSource);
                } else {
                    showSmartNotification('Lỗi cập nhật',
                        'Không thể tải update từ bất kỳ nguồn nào. Vui lòng thử lại sau.',
                        {
                            style: NOTIFICATION_STYLES.MODAL,
                            priority: 'high',
                            timeout: 8000
                        }
                    );
                    overlay.remove();
                }
                return;
            }

            const source = sortedSources[currentSourceIndex];
            const startTime = performance.now();

            debugLog(`🔍 Testing source: ${source.name} (${source.url})`);

            GM_xmlhttpRequest({
                method: 'HEAD',
                url: source.url,
                timeout: 8000, // Increased timeout for better reliability testing
                onload: function(response) {
                    const latency = performance.now() - startTime;
                    sourceLatencies[source.name] = latency;

                    debugLog(`📡 ${source.name}: ${response.status} (${latency.toFixed(1)}ms)`);

                    if (response.status === 200) {
                        // Source is available - check if it's the best so far
                        if (!bestSource || latency < sourceLatencies[bestSource.name]) {
                            bestSource = source;
                            debugLog(`🏆 New best source: ${source.name} (${latency.toFixed(1)}ms)`);
                        }

                        // Continue testing other sources for comparison
                        currentSourceIndex++;
                        updateAttempts++;
                        tryUpdateSource();
                    } else {
                        // Source failed - try next
                        debugLog(`❌ ${source.name} failed with status ${response.status}`);
                        currentSourceIndex++;
                        updateAttempts++;
                        tryUpdateSource();
                    }
                },
                onerror: function(error) {
                    const latency = performance.now() - startTime;
                    debugLog(`❌ ${source.name} network error (${latency.toFixed(1)}ms):`, error);

                    currentSourceIndex++;
                    updateAttempts++;
                    tryUpdateSource();
                },
                ontimeout: function() {
                    const latency = performance.now() - startTime;
                    debugLog(`⏰ ${source.name} timeout (${latency.toFixed(1)}ms)`);

                    currentSourceIndex++;
                    updateAttempts++;
                    tryUpdateSource();
                }
            });
        }

        function proceedWithUpdate(source) {
            debugLog(`✅ Proceeding with update from ${source.name} (${sourceLatencies[source.name]?.toFixed(1) || 'unknown'}ms)`);

            // Update performance metrics for this source
            updateSourceMetrics(source, sourceLatencies[source.name] || 0);

            // Open update in new tab
            GM_openInTab(source.url);
            overlay.remove();

            // Clear version state before update
            clearVersionState();

            // Set update flags
            GM_setValue('pending_update_reload', true);
            GM_setValue('pending_update_time', Date.now());
            GM_setValue('updated_from_version', currentVersion);
            GM_setValue('updated_to_version', newVersion);
            GM_setValue('update_source_used', source.name);

            // Enhanced auto-reload with progress feedback
            startAutoReloadSequence(source.name);
        }

        function startAutoReloadSequence(sourceName) {
            let countdown = 12; // Extended countdown for better UX
            const totalTime = countdown;

            const countdownInterval = setInterval(() => {
                countdown--;

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    if (GM_getValue('pending_update_reload', false)) {
                        debugLog('🔄 Auto-reloading page after update');
                        window.location.reload();
                    }
                } else if (countdown <= 3) {
                    // Show final countdown
                    showSmartNotification('Cập nhật gần hoàn thành',
                        `Tự động làm mới trong ${countdown} giây...`,
                        {
                            style: NOTIFICATION_STYLES.BADGE,
                            timeout: 1500,
                            priority: 'high'
                        }
                    );
                }
            }, 1000);

            // Initial notification
            showSmartNotification('Đang cập nhật',
                `Đã tải từ ${sourceName}. Tự động làm mới sau ${totalTime}s...`,
                {
                    style: NOTIFICATION_STYLES.TOAST,
                    timeout: 12000,
                    priority: 'normal',
                    actions: [
                        {
                            id: 'reload_now',
                            label: 'Làm mới ngay',
                            callback: () => {
                                clearInterval(countdownInterval);
                                window.location.reload();
                            }
                        }
                    ]
                }
            );
        }

        // Start the source testing process
        tryUpdateSource();
    }

    function sortSourcesByPerformance(sources) {
        // Get historical performance data
        const sourceMetrics = GM_getValue('cdn_source_metrics', {});

        return sources.sort((a, b) => {
            const aMetrics = sourceMetrics[a.name] || { avgLatency: 1000, successRate: a.reliability };
            const bMetrics = sourceMetrics[b.name] || { avgLatency: 1000, successRate: b.reliability };

            // Score based on latency (lower better) and success rate (higher better)
            const aScore = (aMetrics.avgLatency * 0.6) + ((1 - aMetrics.successRate) * 1000 * 0.4);
            const bScore = (bMetrics.avgLatency * 0.6) + ((1 - bMetrics.successRate) * 1000 * 0.4);

            return aScore - bScore;
        });
    }

    function updateSourceMetrics(source, latency) {
        const metrics = GM_getValue('cdn_source_metrics', {});
        const sourceName = source.name;

        if (!metrics[sourceName]) {
            metrics[sourceName] = {
                totalRequests: 0,
                successfulRequests: 0,
                totalLatency: 0,
                avgLatency: 0,
                successRate: 1.0,
                lastUsed: 0
            };
        }

        metrics[sourceName].totalRequests++;
        metrics[sourceName].successfulRequests++;
        metrics[sourceName].totalLatency += latency;
        metrics[sourceName].avgLatency = metrics[sourceName].totalLatency / metrics[sourceName].totalRequests;
        metrics[sourceName].successRate = metrics[sourceName].successfulRequests / metrics[sourceName].totalRequests;
        metrics[sourceName].lastUsed = Date.now();

        GM_setValue('cdn_source_metrics', metrics);
        debugLog(`📊 Updated metrics for ${sourceName}: ${latency.toFixed(1)}ms avg latency`);
    }

    function clearVersionState() {
        const keysToClear = [
            'version_outdated',
            'latest_version',
            'last_menu_update_check',
            'lastUpdateCheck',
            'lastCheckedCommitSha'
        ];

        keysToClear.forEach(key => GM_deleteValue(key));
        debugLog('🧹 Cleared version state for fresh update');
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

    function showUpToDateDialog(currentVersion) {
        const css = `
            .up-to-date-dialog-overlay {
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
            .up-to-date-dialog-content {
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                color: black;
                padding: 24px;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                max-width: 480px;
                width: 90%;
                animation: slideUp 0.4s ease-out;
                border: 1px solid rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .up-to-date-icon {
                width: 72px;
                height: 72px;
                margin: 0 auto 16px;
                display: block;
                filter: drop-shadow(0 4px 8px rgba(40, 167, 69, 0.3));
            }
            .version-info {
                margin-bottom: 24px;
            }
            .version-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-top: 8px;
                box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
            }
            .message {
                font-size: 16px;
                color: #495057;
                margin-bottom: 24px;
                line-height: 1.5;
            }
            .buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            .buttons button {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s ease;
                min-width: 120px;
            }
            #close-btn {
                background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            }
            #close-btn:hover {
                background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
            }
            #settings-btn {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                color: white;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            #settings-btn:hover {
                background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
        overlay.className = 'up-to-date-dialog-overlay';
        overlay.innerHTML = `
            <div class="up-to-date-dialog-content">
                <svg class="up-to-date-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="version-info">
                    <p><strong>✅ Phiên bản hiện tại đã là mới nhất</strong></p>
                    <div class="version-badge">
                        <span>${currentVersion}</span>
                    </div>
                </div>
                <div class="message">
                    Bạn đang sử dụng phiên bản mới nhất của HakoMonetTheme.
                    Script sẽ tiếp tục tự động kiểm tra cập nhật định kỳ.
                </div>
                <div class="buttons">
                    <button id="settings-btn">⚙️ Thiết lập</button>
                    <button id="close-btn">✅ Đã hiểu</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const closeBtn = overlay.querySelector('#close-btn');
        const settingsBtn = overlay.querySelector('#settings-btn');

        closeBtn.addEventListener('click', () => {
            overlay.remove();
            debugLog('User closed up-to-date dialog');
        });

        settingsBtn.addEventListener('click', () => {
            overlay.remove();
            openUpdateSettings();
            debugLog('User opened update settings from up-to-date dialog');
        });

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (overlay.parentElement) {
                overlay.remove();
                debugLog('Up-to-date dialog auto-closed after 10 seconds');
            }
        }, 10 * 1000);
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
                let latestVersion = null;

                if (response.status === 200) {
                    const scriptContent = response.responseText;
                    const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
                    console.log('[UpdateManager] Manual check version match:', versionMatch);

                    if (versionMatch && versionMatch[1]) {
                        latestVersion = versionMatch[1];
                        const currentVersion = GM_info.script.version;
                        console.log('[UpdateManager] Current version:', currentVersion, 'Latest version:', latestVersion);

                        if (isNewerVersion(latestVersion, currentVersion)) {
                            console.log('[UpdateManager] New version available, showing dialog');
                            showUpdateDialog(currentVersion, latestVersion);
                        } else {
                            console.log('[UpdateManager] Already up to date, showing up-to-date dialog');
                            showUpToDateDialog(currentVersion);
                        }
                    }
                }
                isCheckingForUpdate = false;

                // Update main menu version display after manual check
                if (typeof window.HMTMainMenu !== 'undefined' &&
                    typeof window.HMTMainMenu.updateVersionDisplay === 'function') {
                    setTimeout(() => window.HMTMainMenu.updateVersionDisplay(), 100);
                }

                // Clear version cache to ensure fresh version detection on next check
                if (latestVersion) {
                    GM_deleteValue('version_cache_' + latestVersion);
                    GM_deleteValue('version_cache_' + latestVersion + '_time');
                }
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

    // 🎯 A/B TESTING FRAMEWORK
    function setupABTesting() {
        const userId = GM_getValue('ab_test_user_id', null);
        if (!userId) {
            // Generate anonymous user ID for A/B testing
            const newUserId = 'ab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            GM_setValue('ab_test_user_id', newUserId);
        }

        // Define test groups
        const testGroups = {
            notification_style: assignToTestGroup(['toast', 'modal', 'badge', 'banner'], userId),
            update_strategy: assignToTestGroup(['aggressive', 'conservative', 'balanced'], userId),
            changelog_display: assignToTestGroup(['full', 'summary', 'minimal'], userId),
            cdn_selection: assignToTestGroup(['performance', 'reliability', 'geographic'], userId)
        };

        GM_setValue('ab_test_groups', testGroups);
        debugLog('🧪 A/B test groups assigned:', testGroups);

        // Apply test group settings
        applyTestGroupSettings(testGroups);
    }

    function assignToTestGroup(options, userId) {
        const hash = simpleHash(userId);
        return options[hash % options.length];
    }

    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    function applyTestGroupSettings(testGroups) {
        // Apply notification style preference
        GM_setValue('preferred_notification_style', testGroups.notification_style);

        // Apply update strategy
        GM_setValue('update_strategy_preference', testGroups.update_strategy);

        // Apply changelog display preference
        GM_setValue('changelog_display_mode', testGroups.changelog_display);

        // Apply CDN selection strategy
        GM_setValue('cdn_selection_strategy', testGroups.cdn_selection);

        debugLog('⚙️ Applied A/B test settings');
    }

    // 🐦 CANARY RELEASE SYSTEM
    function setupCanaryReleases() {
        const canaryEnabled = GM_getValue('canary_releases_enabled', false);
        const canaryChannel = GM_getValue('canary_channel', 'stable');

        if (canaryEnabled) {
            debugLog(`🐦 Canary releases enabled - channel: ${canaryChannel}`);

            // Modify update URLs to point to canary branch/channel
            switch (canaryChannel) {
                case 'beta':
                    // Use beta branch
                    break;
                case 'alpha':
                    // Use alpha branch
                    break;
                case 'nightly':
                    // Use nightly builds
                    break;
                default:
                    // Stable channel
                    break;
            }
        }
    }

    // 📊 ANALYTICS & TELEMETRY (Opt-in)
    function setupAnalytics() {
        const analyticsEnabled = GM_getValue('analytics_enabled', false);

        if (analyticsEnabled) {
            debugLog('📊 Analytics enabled - collecting usage data');

            // Track update interactions
            trackEvent('update_manager_loaded', {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            });

            // Track notification interactions
            const originalShowNotification = showSmartNotification;
            showSmartNotification = function(title, message, options = {}) {
                trackEvent('notification_shown', {
                    title: title,
                    style: options.style || 'default',
                    priority: options.priority || 'normal'
                });
                return originalShowNotification.call(this, title, message, options);
            };
        }
    }

    function trackEvent(eventName, data) {
        const analyticsData = GM_getValue('analytics_data', []);
        analyticsData.push({
            event: eventName,
            data: data,
            timestamp: Date.now()
        });

        // Keep only last 100 events
        if (analyticsData.length > 100) {
            analyticsData.shift();
        }

        GM_setValue('analytics_data', analyticsData);
    }

    // 🎮 INTERACTIVE SETTINGS PANEL
    function openEnhancedUpdateSettings() {
        const settings = {
            autoUpdate: GM_getValue('auto_update_enabled', true),
            notifications: GM_getValue('update_notifications_enabled', true),
            notificationStyle: GM_getValue('preferred_notification_style', 'toast'),
            analytics: GM_getValue('analytics_enabled', false),
            canaryReleases: GM_getValue('canary_releases_enabled', false),
            canaryChannel: GM_getValue('canary_channel', 'stable'),
            debugMode: GM_getValue('debug_mode', false)
        };

        // Create enhanced settings dialog
        const css = `
            .settings-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
                animation: fadeIn 0.3s ease-out;
            }
            .settings-dialog-content {
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                color: #212529;
                padding: 32px;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideUp 0.4s ease-out;
            }
            .settings-header {
                text-align: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid #007bff;
            }
            .settings-icon {
                width: 64px;
                height: 64px;
                margin: 0 auto 12px;
                display: block;
                filter: drop-shadow(0 4px 8px rgba(0, 123, 255, 0.3));
            }
            .setting-group {
                margin-bottom: 24px;
                padding: 16px;
                background: rgba(0, 123, 255, 0.02);
                border-radius: 12px;
                border: 1px solid rgba(0, 123, 255, 0.1);
            }
            .setting-group h3 {
                margin: 0 0 12px 0;
                color: #007bff;
                font-size: 16px;
                font-weight: 600;
            }
            .setting-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                padding: 8px 12px;
                border-radius: 8px;
                transition: background-color 0.2s ease;
            }
            .setting-item:hover {
                background: rgba(0, 123, 255, 0.05);
            }
            .setting-label {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
            }
            .setting-control {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .toggle-switch {
                position: relative;
                width: 44px;
                height: 24px;
                background: #ccc;
                border-radius: 24px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .toggle-switch.active {
                background: #007bff;
            }
            .toggle-switch::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s ease;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            .toggle-switch.active::after {
                transform: translateX(20px);
            }
            .select-control {
                padding: 6px 12px;
                border: 1px solid #ced4da;
                border-radius: 6px;
                background: white;
                font-size: 14px;
                cursor: pointer;
            }
            .settings-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                margin-top: 24px;
            }
            .settings-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.2s ease;
                min-width: 100px;
            }
            .btn-primary {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }
            .btn-primary:hover {
                background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
            }
            .btn-secondary {
                background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
                color: white;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            .btn-secondary:hover {
                background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
                transform: translateY(-1px);
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
        overlay.className = 'settings-dialog-overlay';
        overlay.innerHTML = `
            <div class="settings-dialog-content">
                <div class="settings-header">
                    <svg class="settings-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#007bff"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="#007bff"/>
                    </svg>
                    <h2 style="margin: 0; color: #007bff; font-size: 20px; font-weight: 700;">Cài đặt cập nhật nâng cao</h2>
                </div>

                <div class="setting-group">
                    <h3>🔄 Tự động cập nhật</h3>
                    <div class="setting-item">
                        <span class="setting-label">Bật tự động kiểm tra cập nhật</span>
                        <div class="setting-control">
                            <div class="toggle-switch ${settings.autoUpdate ? 'active' : ''}" data-setting="auto_update_enabled"></div>
                        </div>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Hiển thị thông báo cập nhật</span>
                        <div class="setting-control">
                            <div class="toggle-switch ${settings.notifications ? 'active' : ''}" data-setting="update_notifications_enabled"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>🔔 Giao diện thông báo</h3>
                    <div class="setting-item">
                        <span class="setting-label">Kiểu thông báo</span>
                        <div class="setting-control">
                            <select class="select-control" data-setting="preferred_notification_style">
                                <option value="toast" ${settings.notificationStyle === 'toast' ? 'selected' : ''}>Toast (không gây phiền)</option>
                                <option value="modal" ${settings.notificationStyle === 'modal' ? 'selected' : ''}>Modal (hộp thoại)</option>
                                <option value="badge" ${settings.notificationStyle === 'badge' ? 'selected' : ''}>Badge (huy hiệu)</option>
                                <option value="banner" ${settings.notificationStyle === 'banner' ? 'selected' : ''}>Banner (đầu trang)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>🧪 Tính năng nâng cao</h3>
                    <div class="setting-item">
                        <span class="setting-label">Chế độ debug</span>
                        <div class="setting-control">
                            <div class="toggle-switch ${settings.debugMode ? 'active' : ''}" data-setting="debug_mode"></div>
                        </div>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Bản phát hành canary</span>
                        <div class="setting-control">
                            <div class="toggle-switch ${settings.canaryReleases ? 'active' : ''}" data-setting="canary_releases_enabled"></div>
                        </div>
                    </div>
                    <div class="setting-item" style="${settings.canaryReleases ? '' : 'display: none;'}" id="canary-channel-item">
                        <span class="setting-label">Kênh canary</span>
                        <div class="setting-control">
                            <select class="select-control" data-setting="canary_channel">
                                <option value="stable" ${settings.canaryChannel === 'stable' ? 'selected' : ''}>Stable</option>
                                <option value="beta" ${settings.canaryChannel === 'beta' ? 'selected' : ''}>Beta</option>
                                <option value="alpha" ${settings.canaryChannel === 'alpha' ? 'selected' : ''}>Alpha</option>
                                <option value="nightly" ${settings.canaryChannel === 'nightly' ? 'selected' : ''}>Nightly</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>📊 Phân tích & Telemetry</h3>
                    <div class="setting-item">
                        <span class="setting-label">Cho phép thu thập dữ liệu sử dụng ẩn danh</span>
                        <div class="setting-control">
                            <div class="toggle-switch ${settings.analytics ? 'active' : ''}" data-setting="analytics_enabled"></div>
                        </div>
                    </div>
                    <small style="color: #6c757d; font-size: 12px; display: block; margin-top: 8px;">
                        Dữ liệu được sử dụng để cải thiện trải nghiệm người dùng và không chứa thông tin cá nhân.
                    </small>
                </div>

                <div class="settings-actions">
                    <button class="settings-btn btn-secondary" id="reset-btn">🔄 Đặt lại</button>
                    <button class="settings-btn btn-primary" id="save-btn">💾 Lưu thay đổi</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event listeners
        const canaryToggle = overlay.querySelector('[data-setting="canary_releases_enabled"]');
        const canaryChannelItem = overlay.querySelector('#canary-channel-item');

        canaryToggle.addEventListener('click', () => {
            canaryToggle.classList.toggle('active');
            canaryChannelItem.style.display = canaryToggle.classList.contains('active') ? 'block' : 'none';
        });

        // Toggle switches
        overlay.querySelectorAll('.toggle-switch').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
            });
        });

        // Save button
        overlay.querySelector('#save-btn').addEventListener('click', () => {
            const newSettings = {};

            // Get toggle values
            overlay.querySelectorAll('.toggle-switch').forEach(toggle => {
                const setting = toggle.dataset.setting;
                newSettings[setting] = toggle.classList.contains('active');
            });

            // Get select values
            overlay.querySelectorAll('.select-control').forEach(select => {
                const setting = select.dataset.setting;
                newSettings[setting] = select.value;
            });

            // Save settings
            Object.keys(newSettings).forEach(key => {
                GM_setValue(key, newSettings[key]);
            });

            // Apply canary settings
            if (newSettings.canary_releases_enabled) {
                setupCanaryReleases();
            }

            // Apply analytics settings
            if (newSettings.analytics_enabled) {
                setupAnalytics();
            }

            overlay.remove();
            showSmartNotification('Cài đặt đã lưu', 'Các thay đổi sẽ có hiệu lực ngay lập tức.', {
                style: NOTIFICATION_STYLES.TOAST,
                timeout: 3000
            });
        });

        // Reset button
        overlay.querySelector('#reset-btn').addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn đặt lại tất cả cài đặt về mặc định?')) {
                const resetKeys = [
                    'auto_update_enabled', 'update_notifications_enabled',
                    'preferred_notification_style', 'debug_mode',
                    'canary_releases_enabled', 'canary_channel', 'analytics_enabled'
                ];
                resetKeys.forEach(key => GM_deleteValue(key));
                overlay.remove();
                showSmartNotification('Đã đặt lại', 'Tất cả cài đặt đã được đặt lại về mặc định.', {
                    style: NOTIFICATION_STYLES.TOAST,
                    timeout: 3000
                });
            }
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // Export enhanced API
    window.HMTUpdateManager = {
        // Core functions
        checkForUpdatesManual: checkForUpdatesManual,
        showUpdateDialog: showUpdateDialog,
        openUpdateSettings: openEnhancedUpdateSettings,
        fetchChangelog: fetchChangelog,
        generateChangelog: generateChangelog,
        isNewerVersion: isNewerVersion,

        // Enhanced features
        showSmartNotification: showSmartNotification,
        getAnalyticsData: () => GM_getValue('analytics_data', []),
        getABTestGroup: () => GM_getValue('ab_test_groups', {}),
        clearAnalyticsData: () => GM_setValue('analytics_data', []),

        // System info
        getSystemInfo: () => ({
            version: '2.0.0',
            notificationStyles: NOTIFICATION_STYLES,
            activeNotifications: activeNotifications.size,
            queuedNotifications: notificationQueue.length,
            abTestGroups: GM_getValue('ab_test_groups', {}),
            analyticsEnabled: GM_getValue('analytics_enabled', false)
        }),

        // Manual controls
        clearAllSettings: () => {
            const settingsKeys = [
                'auto_update_enabled', 'update_notifications_enabled',
                'preferred_notification_style', 'debug_mode',
                'canary_releases_enabled', 'canary_channel',
                'analytics_enabled', 'ab_test_groups', 'analytics_data'
            ];
            settingsKeys.forEach(key => GM_deleteValue(key));
            debugLog('🗑️ All settings cleared');
        },

        initialize: function() {
            debugLog('🚀 Enhanced Update Manager v2.0 initialized');
            setupABTesting();
            setupCanaryReleases();
            setupAnalytics();
        }
    };

    // Initialize enhanced features
    debugLog('🎯 Enhanced Update Manager module loaded with advanced features');
    window.HMTUpdateManager.initialize();
})();
