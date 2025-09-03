/**
 * Core functionality for HakoMonetTheme
 * Consolidates common features from main.js and HakoMonetTheme.user.js
 * @version 2.9.9
 */
(function() {
    'use strict';

    const Core = {
        /**
         * Initialize the core system
         */
        init: function() {
            HakoMonetUtils.Logger.info('Initializing HakoMonetTheme Core v' + window.HakoMonetConfig.SCRIPT.version);

            // Setup error handling
            this.setupErrorHandling();

            // Setup menu commands
            this.setupMenuCommands();

            // Setup update checking
            this.setupUpdateChecking();

            // Load and initialize modules
            this.loadModules();

            HakoMonetUtils.Logger.info('Core initialization complete');
        },

        /**
         * Setup global error handling
         */
        setupErrorHandling: function() {
            window.addEventListener('error', (event) => {
                HakoMonetUtils.Logger.error('Global error:', event.error);
                // Don't prevent default to allow normal error handling
            });

            window.addEventListener('unhandledrejection', (event) => {
                HakoMonetUtils.Logger.error('Unhandled promise rejection:', event.reason);
                // Don't prevent default to allow normal error handling
            });
        },

        /**
         * Setup userscript menu commands
         */
        setupMenuCommands: function() {
            if (typeof GM_registerMenuCommand !== 'function') {
                HakoMonetUtils.Logger.warn('GM_registerMenuCommand not available');
                return;
            }

            const commands = [
                {
                    name: '🔄 Check for Updates',
                    action: () => this.checkForUpdates(true),
                    shortcut: 'u'
                },
                {
                    name: '⚙️ Settings',
                    action: () => this.openSettings(),
                    shortcut: 's'
                },
                {
                    name: '📊 Script Info',
                    action: () => this.showScriptInfo(),
                    shortcut: 'i'
                },
                {
                    name: '🐛 Report Bug',
                    action: () => this.reportBug(),
                    shortcut: 'b'
                },
                {
                    name: '💡 Suggest Feature',
                    action: () => this.suggestFeature(),
                    shortcut: 'f'
                },
                {
                    name: '🔧 Toggle Debug Mode',
                    action: () => this.toggleDebugMode(),
                    shortcut: 'd'
                }
            ];

            commands.forEach(cmd => {
                try {
                    GM_registerMenuCommand(cmd.name, cmd.action, cmd.shortcut);
                } catch (error) {
                    HakoMonetUtils.Logger.error(`Failed to register menu command "${cmd.name}":`, error);
                }
            });

            HakoMonetUtils.Logger.debug('Menu commands registered');
        },

        /**
         * Setup automatic update checking
         */
        setupUpdateChecking: function() {
            if (!window.HakoMonetConfig.UPDATE.autoCheck) {
                HakoMonetUtils.Logger.debug('Auto update check disabled');
                return;
            }

            // Check for updates after a delay
            setTimeout(() => {
                this.checkForUpdates(false);
            }, 5000);

            // Setup periodic checking
            setInterval(() => {
                this.checkForUpdates(false);
            }, window.HakoMonetConfig.UPDATE.checkInterval);

            HakoMonetUtils.Logger.debug('Auto update checking enabled');
        },

        /**
         * Check for script updates
         * @param {boolean} manual - Whether this is a manual check
         */
        checkForUpdates: function(manual = false) {
            const lastCheck = HakoMonetStorage.get(HakoMonetStorage.KEYS.LAST_UPDATE_CHECK, 0);
            const now = Date.now();

            // Skip if checked recently (unless manual)
            if (!manual && (now - lastCheck) < window.HakoMonetConfig.UPDATE.checkInterval) {
                return;
            }

            HakoMonetUtils.Logger.info('Checking for updates...');

            this.showNotification(
                'Checking for Updates',
                'Checking for new version...',
                3000
            );

            GM_xmlhttpRequest({
                method: 'GET',
                url: window.HakoMonetConfig.UPDATE.rawUrl + '?t=' + now,
                timeout: 10000,
                onload: (response) => {
                    if (response.status === 200) {
                        this.handleUpdateResponse(response.responseText, manual);
                    } else {
                        HakoMonetUtils.Logger.error('Update check failed with status:', response.status);
                        if (manual) {
                            this.showNotification('Error', 'Failed to check for updates', 5000);
                        }
                    }
                },
                onerror: (error) => {
                    HakoMonetUtils.Logger.error('Update check error:', error);
                    if (manual) {
                        this.showNotification('Error', 'Failed to check for updates', 5000);
                    }
                },
                ontimeout: () => {
                    HakoMonetUtils.Logger.warn('Update check timeout');
                    if (manual) {
                        this.showNotification('Error', 'Update check timed out', 5000);
                    }
                }
            });

            // Update last check time
            HakoMonetStorage.set(HakoMonetStorage.KEYS.LAST_UPDATE_CHECK, now);
        },

        /**
         * Handle update check response
         * @param {string} scriptContent - Raw script content
         * @param {boolean} manual - Whether this was a manual check
         */
        handleUpdateResponse: function(scriptContent, manual) {
            try {
                const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
                if (!versionMatch) {
                    HakoMonetUtils.Logger.error('Could not find version in update response');
                    return;
                }

                const latestVersion = versionMatch[1];
                const currentVersion = window.HakoMonetConfig.SCRIPT.version;

                HakoMonetUtils.Logger.info(`Current version: ${currentVersion}, Latest version: ${latestVersion}`);

                if (this.isNewerVersion(latestVersion, currentVersion)) {
                    this.showUpdateNotification(latestVersion);
                } else if (manual) {
                    this.showNotification('Up to Date', 'You have the latest version!', 3000);
                }
            } catch (error) {
                HakoMonetUtils.Logger.error('Error handling update response:', error);
            }
        },

        /**
         * Compare version strings
         * @param {string} newVersion - New version string
         * @param {string} currentVersion - Current version string
         * @returns {boolean} True if new version is newer
         */
        isNewerVersion: function(newVersion, currentVersion) {
            const newParts = newVersion.split('.').map(Number);
            const currentParts = currentVersion.split('.').map(Number);

            for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
                const newPart = newParts[i] || 0;
                const currentPart = currentParts[i] || 0;

                if (newPart > currentPart) return true;
                if (newPart < currentPart) return false;
            }

            return false;
        },

        /**
         * Show update notification
         * @param {string} latestVersion - Latest available version
         */
        showUpdateNotification: function(latestVersion) {
            const message = `Version ${latestVersion} is available. Click to update.`;

            if (typeof GM_notification === 'function') {
                GM_notification({
                    title: 'HakoMonetTheme Update Available',
                    text: message,
                    timeout: 10000,
                    onclick: () => {
                        window.open(window.HakoMonetConfig.UPDATE.rawUrl, '_blank');
                    }
                });
            } else {
                // Fallback notification
                if (confirm(`HakoMonetTheme ${message}`)) {
                    window.open(window.HakoMonetConfig.UPDATE.rawUrl, '_blank');
                }
            }
        },

        /**
         * Load and initialize modules
         */
        loadModules: function() {
            const modules = [
                { name: 'CORS Unblock', resource: 'crosUnblockJS', required: true },
                { name: 'Info Truyen', resource: 'infoTruyenJS', required: false },
                { name: 'Tag Color', resource: 'tagColorJS', required: false },
                { name: 'Animation', resource: 'animationJS', required: false },
                { name: 'Monet Class', resource: 'monetClassJS', required: false },
                { name: 'Monet API', resource: 'monetAPIJS', required: true },
                { name: 'Page Info Truyen', resource: 'colorinfotruyen', required: false }
            ];

            let loadedCount = 0;
            let failedCount = 0;

            modules.forEach(module => {
                try {
                    const content = GM_getResourceText(module.resource);
                    if (content) {
                        this.loadScript(content, module.name);
                        loadedCount++;
                        HakoMonetUtils.Logger.debug(`Loaded module: ${module.name}`);
                    } else {
                        HakoMonetUtils.Logger.warn(`Resource not found: ${module.resource}`);
                        if (module.required) {
                            failedCount++;
                        }
                    }
                } catch (error) {
                    HakoMonetUtils.Logger.error(`Failed to load module ${module.name}:`, error);
                    if (module.required) {
                        failedCount++;
                    }
                }
            });

            if (failedCount > 0) {
                this.showNotification(
                    'Module Loading Error',
                    `Failed to load ${failedCount} required modules. Some features may not work.`,
                    8000
                );
            } else {
                this.showNotification(
                    'HakoMonetTheme Ready',
                    `Successfully loaded ${loadedCount} modules`,
                    3000
                );
            }
        },

        /**
         * Safely load script content
         * @param {string} scriptContent - Script content to load
         * @param {string} scriptName - Name for logging
         * @returns {boolean} Success status
         */
        loadScript: function(scriptContent, scriptName) {
            try {
                // Use Function constructor instead of eval for better security
                // This creates a safer execution context
                const func = new Function(scriptContent);
                func();
                return true;
            } catch (error) {
                HakoMonetUtils.Logger.error(`Failed to load script ${scriptName}:`, error);
                return false;
            }
        },

        /**
         * Show notification to user
         * @param {string} title - Notification title
         * @param {string} message - Notification message
         * @param {number} timeout - Timeout in milliseconds
         */
        showNotification: function(title, message, timeout = 5000) {
            if (typeof GM_notification === 'function') {
                GM_notification({
                    title: title,
                    text: message,
                    timeout: timeout,
                    silent: false
                });
            } else {
                // Fallback notification
                this.showFallbackNotification(title, message, timeout);
            }
        },

        /**
         * Show fallback notification
         * @param {string} title - Notification title
         * @param {string} message - Notification message
         * @param {number} timeout - Timeout in milliseconds
         */
        showFallbackNotification: function(title, message, timeout) {
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
        },

        /**
         * Open settings (placeholder for future implementation)
         */
        openSettings: function() {
            this.showNotification('Settings', 'Settings panel coming soon!', 3000);
        },

        /**
         * Show script information
         */
        showScriptInfo: function() {
            const info = `
Name: ${window.HakoMonetConfig.SCRIPT.name}
Version: ${window.HakoMonetConfig.SCRIPT.version}
Author: ${window.HakoMonetConfig.SCRIPT.author}
Description: ${window.HakoMonetConfig.SCRIPT.description}

Homepage: ${window.HakoMonetConfig.SCRIPT.homepage}
Support: ${window.HakoMonetConfig.SCRIPT.supportURL}
            `.trim();

            alert(info);
        },

        /**
         * Report a bug
         */
        reportBug: function() {
            const url = `${window.HakoMonetConfig.SCRIPT.homepage}/issues/new?template=bug_report.md`;
            GM_openInTab(url);
            this.showNotification('Bug Report', 'Opening bug report page...', 3000);
        },

        /**
         * Suggest a feature
         */
        suggestFeature: function() {
            const url = `${window.HakoMonetConfig.SCRIPT.homepage}/issues/new?template=feature_request.md`;
            GM_openInTab(url);
            this.showNotification('Feature Request', 'Opening feature request page...', 3000);
        },

        /**
         * Toggle debug mode
         */
        toggleDebugMode: function() {
            const currentDebug = window.HakoMonetConfig.DEBUG.enabled;
            const newDebug = !currentDebug;

            window.HakoMonetConfig.DEBUG.enabled = newDebug;
            HakoMonetStorage.set(HakoMonetStorage.KEYS.DEBUG_MODE, newDebug);

            this.showNotification(
                'Debug Mode',
                newDebug ? 'Debug mode enabled' : 'Debug mode disabled',
                3000
            );

            // Reload to apply changes
            if (confirm('Page reload required to apply debug mode changes. Reload now?')) {
                window.location.reload();
            }
        }
    };

    // Export core functionality
    window.HakoMonetCore = Core;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Core.init());
    } else {
        Core.init();
    }

})();