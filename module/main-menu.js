(function() {
    'use strict';

    // Constants for better maintainability and readability
    const DEBUG = GM_getValue('debug_mode', false);
    const IS_LOCAL = GM_info.script.version === 'LocalDev';
    const FOLDER_URL = IS_LOCAL ? 'http://localhost:8080/styles/' : 'https://sang765.github.io/HakoMonetTheme/styles/';
    const CSS_FILE = 'userscript/mainmenu/hmt-main-menu.css';
    const CSS_MAP_FILE = 'userscript/mainmenu/hmt-main-menu.css.map';
    const DIALOG_CLASS = 'hmt-main-menu-dialog';
    const OVERLAY_CLASS = 'hmt-main-menu-overlay';
    const MENU_GRID_CLASS = 'hmt-menu-grid';
    const MENU_ITEM_CLASS = 'hmt-menu-item';
    const CLOSE_BTN_CLASS = 'hmt-main-menu-close';
    const CLOSE_BTN_FOOTER_CLASS = 'hmt-main-menu-close-btn';
    const CHECK_UPDATES_LINK_CLASS = 'hmt-check-updates-link';
    const LOGO_CLASS = 'hmt-logo';
    const VERSION_DISPLAY_ID = 'hmt-version-display';
    const DISCORD_URL = 'https://discord.gg/uvQ6A3CDPq';
    const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const NOTIFICATION_TIMEOUT = 3000;

    // Cached CSS blob URL to avoid repeated fetches
    let cachedCssBlobUrl = null;

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[MainMenu]', ...args);
        }
    }

    /**
     * Opens the main menu dialog with optimized performance and error handling
      */
     function openMainMenu() {
         try {
             // Find the first html element within the first 5 lines of the document
             const htmlContent = document.documentElement.outerHTML;
             const lines = htmlContent.split('\n').slice(0, 5).join('\n');
             const tempDiv = document.createElement('div');
             tempDiv.innerHTML = lines;
             const firstHtml = tempDiv.querySelector('html');

             let targetElement = document.documentElement; // Default to root html

             if (firstHtml) {
                 // Use the html element found in first 5 lines
                 targetElement = firstHtml;
             }

             // Remove any existing dialogs from the target element to prevent accumulation
             const existingDialog = targetElement.querySelector(`.${DIALOG_CLASS}`);
             if (existingDialog) {
                 existingDialog.remove();
                 debugLog('Removed existing dialog');
             }

             // Remove any existing styles to prevent accumulation
             const existingLinks = document.head.querySelectorAll(`link[href*="${CSS_FILE}"]`);
             existingLinks.forEach(link => link.remove());

            // Check for updates on menu open
            checkForUpdatesOnMenuOpen();

            // Create dialog element with sanitized HTML
            const dialog = createDialogElement();
            if (!dialog) {
                throw new Error('Failed to create dialog element');
            }

            // Load and apply CSS styles
            loadAndApplyStyles();

            // Append dialog to the target html element (right after opening tag)
            targetElement.insertBefore(dialog, targetElement.firstChild);

            // Setup event listeners
            setupEventListeners(dialog);

            // Handle logo loading error
            handleLogoError(dialog);

            // Update version display
            updateVersionDisplay();

            debugLog('Main menu dialog created successfully');
        } catch (error) {
            debugLog('Error opening main menu:', error);
            showNotification('Lỗi', 'Không thể mở menu chính. Vui lòng thử lại.', NOTIFICATION_TIMEOUT);
        }
    }

    /**
     * Creates the dialog element with menu structure
     * @returns {HTMLElement} The dialog element
     */
    function createDialogElement() {
        const dialog = document.createElement('div');
        dialog.className = DIALOG_CLASS;

        const debugStatus = GM_getValue('debug_mode', false) ? 'Bật' : 'Tắt';

        dialog.innerHTML = `
            <div class="${OVERLAY_CLASS}">
                <div class="hmt-main-menu-content">
                    <div class="hmt-main-menu-header">
                        <div class="hmt-header-content">
                            <div class="hmt-logo-section">
                                <img src="https://github.com/sang765/HakoMonetTheme/blob/main/.github/assets/logo.png?raw=true"
                                     alt="HakoMonetTheme Logo"
                                     class="${LOGO_CLASS}">
                                <div class="hmt-title-section">
                                    <h3>HakoMonetTheme</h3>
                                    <span class="hmt-subtitle">Menu chính</span>
                                </div>
                            </div>
                        </div>
                        <button class="${CLOSE_BTN_CLASS}">&times;</button>
                    </div>
                    <div class="hmt-main-menu-body">
                        <div class="${MENU_GRID_CLASS}">
                            <div class="${MENU_ITEM_CLASS}" data-action="settings">
                                <div class="hmt-menu-icon">🎨</div>
                                <div class="hmt-menu-text">
                                    <h4>Cài đặt</h4>
                                    <p>Cài đặt màu sắc và tùy chỉnh theme</p>
                                </div>
                            </div>
                            <div class="${MENU_ITEM_CLASS}" data-action="adblocker">
                                <div class="hmt-menu-icon">🚫</div>
                                <div class="hmt-menu-text">
                                    <h4>Ad Blocker</h4>
                                    <p>Chặn banner quảng cáo</p>
                                </div>
                            </div>
                            <div class="${MENU_ITEM_CLASS}" data-action="antipopup">
                                <div class="hmt-menu-icon">🚫</div>
                                <div class="hmt-menu-text">
                                    <h4>Ad Popup Blocker</h4>
                                    <p>Chặn popup quảng cáo</p>
                                </div>
                            </div>
                            <div class="${MENU_ITEM_CLASS}" data-action="debug-toggle">
                                <div class="hmt-menu-icon">🔧</div>
                                <div class="hmt-menu-text">
                                    <h4>Debug Mode</h4>
                                    <p>Đang: ${debugStatus}</p>
                                </div>
                            </div>
                            <div class="${MENU_ITEM_CLASS}" data-action="discord">
                                <div class="hmt-menu-icon">💬</div>
                                <div class="hmt-menu-text">
                                    <h4>Tham gia Discord</h4>
                                    <p>The Mavericks</p>
                                </div>
                            </div>
                            ${IS_LOCAL ? `
                            <div class="${MENU_ITEM_CLASS}" data-action="reload-resources">
                                <div class="hmt-menu-icon" id="local-icon-only">🔄</div>
                                <div class="hmt-menu-text" id="local-text-only">
                                    <h4>Reload Resources</h4>
                                    <p>Cập nhật code local mà không reload trang</p>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="hmt-main-menu-footer">
                        <div class="hmt-footer-version-info">
                            <div class="hmt-version-info">
                                <div class="hmt-script-version" id="${VERSION_DISPLAY_ID}">Phiên bản: <strong>Loading...</strong></div>
                                ${IS_LOCAL ? '' : `<a href="#" class="${CHECK_UPDATES_LINK_CLASS}">Kiểm tra cập nhật</a>`}
                            </div>
                        </div>
                        <button class="${CLOSE_BTN_FOOTER_CLASS}">Đóng</button>
                    </div>
                </div>
            </div>
        `;

        return dialog;
    }

    /**
     * Loads and applies CSS styles with caching for performance
     */
    function loadAndApplyStyles() {
        if (cachedCssBlobUrl) {
            // Check if styles are already applied to avoid duplicates
            if (!document.head.querySelector(`link[href="${cachedCssBlobUrl}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cachedCssBlobUrl;
                document.head.appendChild(link);
            }
            debugLog('Using cached CSS styles');
            return;
        }

        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + CSS_FILE).then(r => r.text()),
            fetch(FOLDER_URL + CSS_MAP_FILE).then(r => r.text())
        ])
        .then(([css, mapContent]) => {
            // Convert source map to data URL
            const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

            // Add source mapping as data URL
            css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

            // Create Blob URL for efficient resource management
            const blob = new Blob([css], { type: 'text/css' });
            cachedCssBlobUrl = URL.createObjectURL(blob);

            // Create link element and apply CSS, check for duplicates
            if (!document.head.querySelector(`link[href="${cachedCssBlobUrl}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cachedCssBlobUrl;
                document.head.appendChild(link);
            }

            debugLog('CSS styles loaded and cached successfully');
        })
        .catch(error => {
            debugLog('Error loading CSS or source map:', error);
            showNotification('Lỗi', 'Không thể tải giao diện menu. Một số style có thể không hoạt động.', NOTIFICATION_TIMEOUT);
        });
    }

    /**
     * Sets up all event listeners for the dialog
     * @param {HTMLElement} dialog - The dialog element
     */
    function setupEventListeners(dialog) {
        try {
            const closeBtn = dialog.querySelector(`.${CLOSE_BTN_CLASS}`);
            const closeBtnFooter = dialog.querySelector(`.${CLOSE_BTN_FOOTER_CLASS}`);
            const overlay = dialog.querySelector(`.${OVERLAY_CLASS}`);
            const menuItems = dialog.querySelectorAll(`.${MENU_ITEM_CLASS}`);
            const checkUpdatesLink = dialog.querySelector(`.${CHECK_UPDATES_LINK_CLASS}`);

            // Close dialog function
            const closeDialog = () => {
                dialog.remove();
                // Clean up styles when dialog closes to prevent accumulation
                const existingLinks = document.head.querySelectorAll(`link[href*="${CSS_FILE}"]`);
                existingLinks.forEach(link => link.remove());
                debugLog('Dialog closed and styles cleaned up');
            };

            // Close button events
            if (closeBtn) closeBtn.addEventListener('click', closeDialog);
            if (closeBtnFooter) closeBtnFooter.addEventListener('click', closeDialog);

            // Overlay click to close
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        closeDialog();
                    }
                });
            }

            // Check updates link - delegate to UpdateManager
            if (checkUpdatesLink) {
                checkUpdatesLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeDialog();
                    if (typeof window.HMTUpdateManager !== 'undefined' &&
                        typeof window.HMTUpdateManager.checkForUpdatesManual === 'function') {
                        window.HMTUpdateManager.checkForUpdatesManual();
                    } else {
                        showNotification('Lỗi', 'Module cập nhật chưa được tải. Vui lòng làm mới trang.', NOTIFICATION_TIMEOUT);
                    }
                });
            }

            // Menu item actions with validation
            menuItems.forEach(item => {
                item.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    if (!action) {
                        debugLog('Menu item missing data-action attribute');
                        return;
                    }

                    closeDialog(); // Close menu first

                    handleMenuAction(action);
                });
            });

            // Close on ESC key
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeDialog();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);

            debugLog('Event listeners setup completed');
        } catch (error) {
            debugLog('Error setting up event listeners:', error);
        }
    }

    /**
     * Handles menu item actions with validation
     * @param {string} action - The action to perform
     */
    function handleMenuAction(action) {
        const actions = {
            'settings': () => {
                if (typeof window.HMTConfig !== 'undefined' &&
                    typeof window.HMTConfig.openConfigDialog === 'function') {
                    window.HMTConfig.openConfigDialog();
                } else {
                    showNotification('Lỗi', 'Module cài đặt màu sắc chưa được tải. Vui lòng làm mới trang.', NOTIFICATION_TIMEOUT);
                }
            },
            'adblocker': () => {
                if (typeof window.HMTAdBlocker !== 'undefined' &&
                    typeof window.HMTAdBlocker.openDialog === 'function') {
                    window.HMTAdBlocker.openDialog();
                } else {
                    showNotification('Lỗi', 'Module Ad Blocker chưa được tải. Vui lòng làm mới trang.', NOTIFICATION_TIMEOUT);
                }
            },
            'antipopup': () => {
                if (typeof window.HMTAntiPopup !== 'undefined' &&
                    typeof window.HMTAntiPopup.openDialog === 'function') {
                    window.HMTAntiPopup.openDialog();
                } else {
                    showNotification('Lỗi', 'Module Anti-Popup chưa được tải. Vui lòng làm mới trang.', NOTIFICATION_TIMEOUT);
                }
            },
            'discord': joinDiscord,
            'debug-toggle': toggleDebugMode,
            'reload-resources': () => {
                if (typeof window.updateAllResources === 'function') {
                    window.updateAllResources();
                } else {
                    showNotification('Lỗi', 'Hàm reload resources chưa khả dụng. Vui lòng làm mới trang.', NOTIFICATION_TIMEOUT);
                }
            }
        };

        const handler = actions[action];
        if (handler) {
            try {
                handler();
            } catch (error) {
                debugLog(`Error executing action '${action}':`, error);
                showNotification('Lỗi', `Không thể thực hiện hành động: ${action}`, NOTIFICATION_TIMEOUT);
            }
        } else {
            debugLog(`Unknown action: ${action}`);
        }
    }

    /**
     * Handles logo loading errors
     * @param {HTMLElement} dialog - The dialog element
     */
    function handleLogoError(dialog) {
        const logo = dialog.querySelector(`.${LOGO_CLASS}`);
        if (logo) {
            logo.onerror = function() {
                this.src = '';
                this.onerror = null;
                debugLog('Logo failed to load, removed src');
            };
        }
    }

    /**
     * Checks for updates on menu open with rate limiting
     * Delegates to UpdateChecker for actual checking logic
     */
    function checkForUpdatesOnMenuOpen() {
        try {
            if (IS_LOCAL) {
                debugLog('Skipping update check on menu open (local version)');
                return;
            }

            const lastCheck = GM_getValue('last_menu_update_check', 0);
            const now = Date.now();

            if (now - lastCheck < UPDATE_CHECK_INTERVAL) {
                debugLog('Skipping update check on menu open (checked recently)');
                return;
            }

            GM_setValue('last_menu_update_check', now);

            if (typeof window.HMTUpdateChecker !== 'undefined' &&
                typeof window.HMTUpdateChecker.checkForUpdates === 'function') {
                debugLog('Checking for updates on menu open...');
                window.HMTUpdateChecker.checkForUpdates((latestVersion) => {
                    // Update version display after update check completes
                    updateVersionDisplay();
                });
            } else {
                debugLog('UpdateChecker module not loaded');
            }
        } catch (error) {
            debugLog('Error checking for updates:', error);
        }
    }

    /**
     * Extracts current version from GM_info script metadata
     * @returns {string} The current version string
     */
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

    /**
     * Updates the version display with error handling
     * Reads version state from GM storage set by UpdateChecker/UpdateManager
     */
    function updateVersionDisplay() {
        try {
            const versionDisplay = document.querySelector(`#${VERSION_DISPLAY_ID}`);
            if (!versionDisplay) {
                debugLog('Version display element not found');
                return;
            }

            const currentVersion = getCurrentVersion();
            const latestVersion = GM_getValue('latest_version', null);
            const isOutdated = GM_getValue('version_outdated', false);

            // Validate versions
            if (typeof currentVersion !== 'string' || currentVersion.trim() === '') {
                debugLog('Invalid current version');
                return;
            }

            // Display latest version if outdated, otherwise current version
            const displayVersion = isOutdated && latestVersion ? latestVersion : currentVersion;
            const versionText = `Phiên bản: <strong>${displayVersion}</strong>`;
            versionDisplay.innerHTML = versionText;

            // Clear outdated flag if current version is up to date or newer
            if (latestVersion && typeof latestVersion === 'string' &&
                !isNewerVersion(latestVersion, currentVersion)) {
                GM_setValue('version_outdated', false);
                GM_deleteValue('latest_version');
                debugLog('Cleared outdated flag - user has updated to latest version');
            }

            const shouldShowOutdated = GM_getValue('version_outdated', false);
            if (shouldShowOutdated) {
                versionDisplay.classList.add('outdated');
            } else {
                versionDisplay.classList.remove('outdated');
            }

            debugLog('Version display updated to version:', displayVersion);
        } catch (error) {
            debugLog('Error updating version display:', error);
        }
    }

    /**
     * Compares version strings safely
     * @param {string} newVersion - New version string
     * @param {string} currentVersion - Current version string
     * @returns {boolean} True if new version is newer
     */
    function isNewerVersion(newVersion, currentVersion) {
        // Delegate to UpdateManager's version comparison if available
        if (typeof window.HMTUpdateManager !== 'undefined' &&
            typeof window.HMTUpdateManager.isNewerVersion === 'function') {
            return window.HMTUpdateManager.isNewerVersion(newVersion, currentVersion);
        }

        // Fallback implementation
        try {
            if (typeof newVersion !== 'string' || typeof currentVersion !== 'string') {
                return false;
            }

            const newParts = newVersion.split('.').map(part => {
                const num = parseInt(part, 10);
                return isNaN(num) ? 0 : num;
            });
            const currentParts = currentVersion.split('.').map(part => {
                const num = parseInt(part, 10);
                return isNaN(num) ? 0 : num;
            });

            for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
                const newPart = newParts[i] || 0;
                const currentPart = currentParts[i] || 0;

                if (newPart > currentPart) return true;
                if (newPart < currentPart) return false;
            }

            return false;
        } catch (error) {
            debugLog('Error comparing versions:', error);
            return false;
        }
    }

    /**
     * Opens Discord link with fallback handling
     */
    function joinDiscord() {
        try {
            // Validate URL before opening
            const url = new URL(DISCORD_URL);
            if (url.protocol !== 'https:') {
                throw new Error('Invalid Discord URL protocol');
            }

            if (typeof GM_openInTab === 'function') {
                GM_openInTab(DISCORD_URL);
                showNotification('Discord', 'Mở liên kết Discord...', NOTIFICATION_TIMEOUT);
            } else {
                window.open(DISCORD_URL, '_blank', 'noopener,noreferrer');
                showNotification('Discord', 'Mở Discord trong tab mới (fallback)...', NOTIFICATION_TIMEOUT);
            }
        } catch (error) {
            debugLog('Error opening Discord link:', error);
            showNotification('Lỗi', 'Không thể mở liên kết Discord.', NOTIFICATION_TIMEOUT);
        }
    }

    /**
     * Toggles debug mode with user confirmation
     */
    function toggleDebugMode() {
        try {
            const currentDebug = GM_getValue('debug_mode', false);
            const newDebug = !currentDebug;

            GM_setValue('debug_mode', newDebug);

            showNotification(
                'Chế độ Debug',
                newDebug ? 'Đã bật chế độ debug' : 'Đã tắt chế độ debug',
                NOTIFICATION_TIMEOUT
            );

            debugLog(`Debug mode ${newDebug ? 'enabled' : 'disabled'}`);

            // Reload to apply changes with user confirmation
            if (confirm('Cần tải lại trang để áp dụng thay đổi. Bạn có muốn tải lại ngay bây giờ không?')) {
                window.location.reload();
            }
        } catch (error) {
            debugLog('Error toggling debug mode:', error);
            showNotification('Lỗi', 'Không thể thay đổi chế độ debug.', NOTIFICATION_TIMEOUT);
        }
    }

    /**
     * Shows notifications with fallback and security
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} timeout - Timeout in milliseconds
     */
    function showNotification(title, message, timeout = NOTIFICATION_TIMEOUT) {
        // Notification functionality removed from modules
        // Permission still granted in main userscript
        return;
    }

    // Export functions - simplified API focused on UI display
    window.HMTMainMenu = {
        openMainMenu: openMainMenu,
        updateVersionDisplay: updateVersionDisplay, // Allow external updates
        initialize: function() {
            debugLog('Main Menu module đã được khởi tạo');
        }
    };

    // Initialize when module loads
    debugLog('Main Menu module đã được tải');

})();

