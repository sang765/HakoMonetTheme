(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('main', ...args);
        } else if (DEBUG) {
            console.log('[HakoMonetTheme]', ...args);
        }
    }

    function loadScript(scriptContent, scriptName) {
        try {
            eval(scriptContent);
            debugLog(`Đã tải ${scriptName}`);
            return true;
        } catch (error) {
            debugLog(`Lỗi khi tải ${scriptName}:`, error);
            return false;
        }
    }
    
    function init() {
        debugLog('Đang khởi tạo HakoMonetTheme...');
        debugLog(`Phiên bản: ${GM_info.script.version}`);

        // Đăng ký Service Worker trước khi tải các module khác
        registerServiceWorker();

        // Thiết lập auto update
        console.log('[Main] Checking for HMTUpdateChecker');
        if (typeof window.HMTUpdateChecker !== 'undefined' && typeof window.HMTUpdateChecker.setupAutoUpdate === 'function') {
            console.log('[Main] Calling setupAutoUpdate');
            window.HMTUpdateChecker.setupAutoUpdate();
        } else {
            console.error('[Main] Update Checker API not loaded');
            debugLog('Update Checker API chưa được tải');
        }
        
        // Load các module
        try {
            const monetJS = GM_getResourceText('monetJS');
            const updateCheckerJS = GM_getResourceText('updateCheckerJS');
            const simpleCORSJS = GM_getResourceText('simpleCORSJS');
            const themeDetectorJS = GM_getResourceText('themeDetectorJS');
            const infoTruyenJS = GM_getResourceText('infoTruyenJS');
            const animationJS = GM_getResourceText('animationJS');
            const monetAPIJS = GM_getResourceText('monetAPIJS');
            const monetTestJS = GM_getResourceText('monetTestJS');
            const tagColorJS = GM_getResourceText('tagColorJS');
            const colorinfotruyen = GM_getResourceText('colorinfotruyen');
            const colorinfotruyenlight = GM_getResourceText('colorinfotruyenlight');
            const pagegenerallightJS = GM_getResourceText('pagegenerallightJS');
            const pagegeneralJS = GM_getResourceText('pagegeneralJS');
            const imageAnalyzerJS = GM_getResourceText('imageAnalyzerJS');
            const html2canvasJS = GM_getResourceText('html2canvasJS');
            const colorisJS = GM_getResourceText('colorisJS');
            const colorisCSS = GM_getResourceText('colorisCSS');
            const colorisColors = GM_getResourceText('colorisColors');
            const configJS = GM_getResourceText('configJS');
            const adBlockerJS = GM_getResourceText('adBlockerJS');
            const antiPopupJS = GM_getResourceText('antiPopupJS');
            const blacklistJS = GM_getResourceText('blacklistJS');
            const fullscreenJS = GM_getResourceText('fullscreenJS');
            const textColorAdapterJS = GM_getResourceText('textColorAdapterJS');
            const deviceCSSLoaderJS = GM_getResourceText('deviceCSSLoaderJS');

            // Load module blacklist trước tiên (ưu tiên cao nhất)
            loadScript(blacklistJS, 'blacklist.js');

            // Kiểm tra xem có bị blacklist không
            if (typeof window.HMTBlacklist !== 'undefined' && !window.HMTBlacklist.init()) {
                debugLog('Trang bị blacklist, dừng tải các module khác');
                return; // Dừng việc tải các module khác
            }

            // Load config with high priority
            loadScript(configJS, 'config.js');

            // Load các module theo thứ tự
            console.log('[Main] Loading update-checker.js');
            loadScript(updateCheckerJS, 'update-checker.js');
            loadScript(simpleCORSJS, 'simple-cors.js');
            loadScript(themeDetectorJS, 'theme-detector.js');
            loadScript(imageAnalyzerJS, 'image-analyzer.js');
            loadScript(html2canvasJS, 'html2canvas.min.js');
            loadScript(colorisJS, 'coloris.min.js');

            // Load Coloris CSS
            if (colorisCSS) {
                GM_addStyle(colorisCSS);
                debugLog('Đã tải Coloris CSS');
            }

            loadScript(infoTruyenJS, 'info-truyen.js');
            loadScript(tagColorJS, 'tag-color.js');
            loadScript(monetAPIJS, 'monet.js');
            loadScript(monetTestJS, 'monet-test.js');
            loadScript(animationJS, 'animation.js');
            loadScript(monetJS, 'monet.js');
            loadScript(adBlockerJS, 'ad-blocker.js');
            loadScript(antiPopupJS, 'anti-popup.js');
            loadScript(fullscreenJS, 'fullscreen.js');
            loadScript(textColorAdapterJS, 'text-color-adapter.js');

            // Load color scripts - let them determine theme internally
            debugLog('Loading color scripts (they will check theme internally)');
            debugLog('colorinfotruyenlight defined:', typeof colorinfotruyenlight, colorinfotruyenlight ? 'content length: ' + colorinfotruyenlight.length : 'null/undefined');
            debugLog('pagegenerallightJS defined:', typeof pagegenerallightJS, pagegenerallightJS ? 'content length: ' + pagegenerallightJS.length : 'null/undefined');
            debugLog('pagegeneralJS defined:', typeof pagegeneralJS, pagegeneralJS ? 'content length: ' + pagegeneralJS.length : 'null/undefined');
            loadScript(colorinfotruyenlight, 'page-info-truyen-light.js');
            loadScript(pagegenerallightJS, 'page-general-light.js');
            loadScript(colorinfotruyen, 'page-info-truyen-dark.js');
            loadScript(pagegeneralJS, 'page-general-dark.js');

            loadScript(deviceCSSLoaderJS, 'device-css-loader.js');

            // Khởi tạo text color adapter
            if (typeof window.HMTTextColorAdapter !== 'undefined' && typeof window.HMTTextColorAdapter.init === 'function') {
                window.HMTTextColorAdapter.init();
                debugLog('Text Color Adapter đã được khởi tạo');
            } else {
                debugLog('Text Color Adapter module chưa được tải');
            }

            debugLog('Tất cả module đã được tải');

            // Kiểm tra cập nhật tự động được xử lý bởi update-checker API
            // để tránh duplicate notifications

            // Thêm CSS cho update notification
            GM_addStyle(`
                .hmt-update-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    max-width: 300px;
                    animation: hmtSlideIn 0.5s ease-out;
                    cursor: pointer;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .hmt-update-notification h4 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .hmt-update-notification p {
                    margin: 0;
                    font-size: 14px;
                    opacity: 0.9;
                }
                
                .hmt-update-notification .close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                @keyframes hmtSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `);
            
        } catch (error) {
            debugLog('Lỗi khi tải module:', error);
            
            // Hiển thị thông báo lỗi
            showErrorNotification('Lỗi khi tải HakoMonetTheme. Vui lòng làm mới trang.');
        }
    }
    
    function showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'hmt-update-notification';
        notification.style.background = 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)';
        notification.innerHTML = `
            <h4>Lỗi HakoMonetTheme</h4>
            <p>${message}</p>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Tự động ẩn sau 10 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    function showManualUpdateNotification(latestVersion) {
        const notification = document.createElement('div');
        notification.className = 'hmt-update-notification';
        notification.onclick = function() {
            window.open('https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js', '_blank');
            this.remove();
        };

        notification.innerHTML = `
            <h4>Có bản cập nhật mới!</h4>
            <p>Phiên bản ${latestVersion} đã có sẵn. Nhấn để cập nhật.</p>
            <button class="close-btn" onclick="event.stopPropagation(); this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(notification);

        // Tự động ẩn sau 15 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 15000);
    }

    // Service Worker registration and management
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            const swPath = '/api/service-worker.js';

            navigator.serviceWorker.register(swPath)
                .then(registration => {
                    debugLog('Service Worker registered successfully');

                    // Setup push notifications for story updates
                    setupPushNotifications(registration);

                    // Monitor service worker updates
                    registration.addEventListener('updatefound', () => {
                        debugLog('Service Worker update found');
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    debugLog('Service Worker updated, will activate on next page load');
                                    showServiceWorkerUpdateNotification();
                                }
                            });
                        }
                    });

                    // Listen for messages from service worker
                    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
                })
                .catch(error => {
                    debugLog('Service Worker registration failed:', error);
                });
        } else {
            debugLog('Service Worker not supported');
        }
    }

    function setupPushNotifications(registration) {
        // Request notification permission for story updates
        if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        debugLog('Push notifications enabled for story updates');
                        GM_setValue('push_notifications_enabled', true);
                    }
                });
            }, 5000); // Delay to avoid being intrusive
        }
    }

    function showServiceWorkerUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'hmt-update-notification';
        notification.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';

        notification.innerHTML = `
            <h4>Service Worker đã cập nhật</h4>
            <p>Cải thiện hiệu suất offline và caching. Thay đổi sẽ có hiệu lực khi làm mới trang.</p>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(notification);

        // Tự động ẩn sau 10 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    function handleServiceWorkerMessage(event) {
        const { type, data } = event.data;

        switch (type) {
            case 'CACHE_STATUS':
                debugLog('Cache status update:', data);
                break;
            case 'OFFLINE_READY':
                showOfflineReadyNotification();
                break;
            case 'SYNC_COMPLETE':
                debugLog('Background sync completed:', data);
                break;
        }
    }

    function showOfflineReadyNotification() {
        const notification = document.createElement('div');
        notification.className = 'hmt-update-notification';
        notification.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';

        notification.innerHTML = `
            <h4>Sẵn sàng hoạt động offline</h4>
            <p>HakoMonetTheme đã cache nội dung cần thiết để hoạt động offline.</p>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(notification);

        // Tự động ẩn sau 8 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
    }

    // Service Worker communication helpers
    window.HMTServiceWorker = {
        preloadThumbnails: function(urls, priority = 'normal') {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'PRELOAD_THUMBNAILS',
                    data: { urls, priority }
                });
            }
        },

        cacheStoryData: function(storyId, data) {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'CACHE_STORY_DATA',
                    data: { storyId, data }
                });
            }
        },

        clearCache: function(cacheType = null) {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'CLEAR_CACHE',
                    data: { cacheType }
                });
            }
        },

        getCacheStatus: function() {
            return new Promise((resolve) => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    const channel = new MessageChannel();
                    channel.port1.onmessage = (event) => resolve(event.data);
                    navigator.serviceWorker.controller.postMessage({
                        type: 'GET_CACHE_STATUS'
                    }, [channel.port2]);
                } else {
                    resolve(null);
                }
            });
        }
    };
    
    // Khởi chạy
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
