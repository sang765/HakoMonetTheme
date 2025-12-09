(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const IS_LOCAL = GM_info.script.version === 'LocalDev';
    const FOLDER_URL = IS_LOCAL ? 'http://localhost:5500/styles/' : 'https://sang765.github.io/HakoMonetTheme/styles/';
    let thumbnailEffectApplied = false;
    let retryCount = 0;
    let domObserver = null;
    let portraitCSSApplied = false;
    let orientationListenerAdded = false;

    // CORS Proxy System Constants
    const PROXY_SERVERS = [
        'https://images.weserv.nl/?url=',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://corsproxy.io/?key=990f3464&url='
    ];

    // Proxy mapping for config compatibility
    const PROXY_MAPPING = {
        'images.weserv.nl': 'https://images.weserv.nl/?url=',
        'allOrigins.nl': 'https://api.allorigins.win/raw?url=',
        'cors-anywhere.herokuapp.com': 'https://cors-anywhere.herokuapp.com/',
        'corsproxy.io': 'https://corsproxy.io/?key=990f3464&url='
    };

    const FALLBACK_CACHE_KEY = 'hmt-fallback-images';
    const DEBUG_LEVELS = {
        CORS_CHECK: 'cors_check',
        PROXY_ATTEMPT: 'proxy_attempt',
        FALLBACK_USED: 'fallback_used'
    };
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[InfoTruyen]', ...args);
        }
    }

    function debugLogWithLevel(level, ...args) {
        if (DEBUG) {
            console.log(`[InfoTruyen:${level}]`, ...args);
        }
    }

    // Smart Time-Based Detection
    function isCorsBlockedTime() {
        const hour = new Date().getHours();
        // Only use time-based blocking if proxy is enabled
        const useProxy = window.HMTConfig ? window.HMTConfig.getUseProxy() : true;
        return useProxy && (hour >= 22 || hour < 5);
    }

    // Check if it's time to use proxy for background loading
    function isProxyBackgroundTime() {
        const hour = new Date().getHours();
        // Use proxy for background loading from 10 PM to 5 AM
        return hour >= 22 || hour < 5;
    }

    // Image Access Testing Function
    async function testImageAccess(url, timeout = 5000) {
        return new Promise((resolve) => {
            const img = new Image();
            const timer = setTimeout(() => {
                img.src = '';
                resolve(false);
            }, timeout);

            img.onload = () => {
                clearTimeout(timer);
                resolve(true);
            };

            img.onerror = () => {
                clearTimeout(timer);
                resolve(false);
            };

            img.src = url;
        });
    }

    // Local Storage Cache for Fallback Images
    function getCachedFallback(key) {
        try {
            const cached = GM_getValue(FALLBACK_CACHE_KEY, {});
            const item = cached[key];
            if (item && item.expires > Date.now()) {
                return item.data;
            }
            // Clean expired items
            if (item) {
                delete cached[key];
                GM_setValue(FALLBACK_CACHE_KEY, cached);
            }
        } catch (error) {
            debugLogWithLevel(DEBUG_LEVELS.FALLBACK_USED, 'Error accessing fallback cache:', error);
        }
        return null;
    }

    function setCachedFallback(key, data, ttlHours = 24) {
        try {
            const cached = GM_getValue(FALLBACK_CACHE_KEY, {});
            cached[key] = {
                data: data,
                expires: Date.now() + (ttlHours * 60 * 60 * 1000)
            };
            GM_setValue(FALLBACK_CACHE_KEY, cached);
        } catch (error) {
            debugLogWithLevel(DEBUG_LEVELS.FALLBACK_USED, 'Error setting fallback cache:', error);
        }
    }

    // Retry Mechanism with Exponential Backoff
    async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    debugLogWithLevel(DEBUG_LEVELS.PROXY_ATTEMPT, `Retry attempt ${attempt + 1} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    // Main CORS-Safe Thumbnail Function
    async function getCorsSafeThumbnail(originalUrl, options = {}) {
        const {
            width = 400,
            height = 600,
            timeout = 5000,
            useCache = true
        } = options;

        debugLogWithLevel(DEBUG_LEVELS.CORS_CHECK, 'Getting CORS-safe thumbnail for:', originalUrl);

        // Check if proxy is enabled in config
        const useProxy = window.HMTConfig ? window.HMTConfig.getUseProxy() : true;
        const preferredProxy = window.HMTConfig ? window.HMTConfig.getPreferredProxy() : 'images.weserv.nl';

        if (!useProxy) {
            debugLogWithLevel(DEBUG_LEVELS.CORS_CHECK, 'Proxy disabled in config, using original URL');
            return originalUrl;
        }

        // Step 1: Check if it's time to use proxy for background loading
        if (isProxyBackgroundTime()) {
            debugLogWithLevel(DEBUG_LEVELS.CORS_CHECK, 'Proxy background time detected, forcing proxy usage');
            // Skip direct access test and go straight to proxy
        } else {
            // Step 2: Test original URL access (only outside proxy time)
            debugLogWithLevel(DEBUG_LEVELS.CORS_CHECK, 'Testing original URL access');
            const originalAccessible = await testImageAccess(originalUrl, timeout);

            if (originalAccessible) {
                debugLogWithLevel(DEBUG_LEVELS.CORS_CHECK, 'Original URL accessible, using directly');
                return originalUrl;
            }
        }

        // Step 3: Try preferred proxy first, then others (always during proxy time, fallback during normal time)
        const preferredProxyUrl = PROXY_MAPPING[preferredProxy];
        const proxyOrder = [preferredProxyUrl, ...PROXY_SERVERS.filter(url => url !== preferredProxyUrl)];

        for (const proxyUrl of proxyOrder) {
            try {
                const proxiedUrl = proxyUrl + encodeURIComponent(originalUrl);
                debugLogWithLevel(DEBUG_LEVELS.PROXY_ATTEMPT, 'Trying proxy:', proxyUrl);

                const accessible = await retryWithBackoff(
                    () => testImageAccess(proxiedUrl, timeout),
                    2, // maxRetries
                    500 // baseDelay
                );

                if (accessible) {
                    debugLogWithLevel(DEBUG_LEVELS.PROXY_ATTEMPT, 'Proxy successful:', proxyUrl);

                    // Cache successful proxy URL for 24 hours
                    if (useCache) {
                        const cacheKey = `proxy_${btoa(originalUrl).substring(0, 16)}`;
                        setCachedFallback(cacheKey, proxiedUrl, 24);
                    }

                    return proxiedUrl;
                }
            } catch (error) {
                debugLogWithLevel(DEBUG_LEVELS.PROXY_ATTEMPT, 'Proxy failed:', proxyUrl, error.message);
                continue;
            }
        }

        // Step 4: Final fallback - gradient image (only if not proxy time)
        if (!isProxyBackgroundTime()) {
            debugLogWithLevel(DEBUG_LEVELS.FALLBACK_USED, 'All proxies failed, using gradient fallback');
            const cacheKey = `fallback_${width}x${height}_${new Date().getHours()}`;
            let fallbackUrl = useCache ? getCachedFallback(cacheKey) : null;

            if (!fallbackUrl) {
                fallbackUrl = createGradientFallback(width, height);
                if (useCache) {
                    setCachedFallback(cacheKey, fallbackUrl, 1);
                }
            }

            return fallbackUrl;
        } else {
            // During proxy time, if all proxies fail, still try to use original URL as last resort
            debugLogWithLevel(DEBUG_LEVELS.FALLBACK_USED, 'All proxies failed during proxy time, using original URL as fallback');
            return originalUrl;
        }
    }
    
    function initInfoTruyen() {
        debugLog('InfoTruyen class đã được tải');
        
        // Kiểm tra xem có phải là trang truyện không
        const sideFeaturesElement = document.querySelector('div.col-4.col-md.feature-item.width-auto-xl');
        if (!sideFeaturesElement) {
            debugLog('Không tìm thấy element, bỏ qua tính năng đổi màu.');
            return;
        }
        
        // Thêm CSS editor nếu cần
        addCSSEditor();
        
        // Thêm các tính năng khác cho trang truyện
        enhanceSeriesPage();
        
        // Thêm thiết bị cụ thể responsive styles (không đợi device detector)
        addDeviceSpecificStyles();

        // Thêm thumbnail fade effect với retry mechanism
        setupThumbnailEffects();

        // Cache story data for offline access
        setTimeout(cacheCurrentStoryData, 2000); // Delay to ensure page is fully loaded

        // Thiết lập portrait CSS redesign với orientation detection
        setupPortraitCSSRedesign();
        
        // Lắng nghe thay đổi thiết bị (nếu có device detector)
        if (window.__deviceDetectorLoaded) {
            setupDeviceChangeListener();
        } else {
            debugLog('Device detector chưa sẵn sàng, sẽ thử lại sau...');
            setTimeout(() => {
                if (window.__deviceDetectorLoaded) {
                    setupDeviceChangeListener();
                } else {
                    debugLog('Device detector vẫn chưa sẵn sàng, bỏ qua device change listener');
                }
            }, 500);
        }
    }
    
    function addCSSEditor() {
        // Tạo CSS editor nếu cần
        debugLog('CSS Editor đã sẵn sàng');
    }
    
    function enhanceSeriesPage() {
        // Cải thiện giao diện trang truyện
        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + 'info-truyen/series-enhancement.css').then(r => r.text()),
            fetch(FOLDER_URL + 'info-truyen/series-enhancement.css.map').then(r => r.text())
        ])
        .then(([css, mapContent]) => {
            // Convert source map to data URL
            const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

            // Add source mapping as data URL
            css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

            // Tạo Blob URL cho quản lý tài nguyên hiệu quả
            const blob = new Blob([css], { type: 'text/css' });
            const blobUrl = URL.createObjectURL(blob);

            // Tạo link element và áp dụng CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = blobUrl;
            document.head.appendChild(link);

            debugLog('Đã cải thiện giao diện trang truyện với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải info-truyen/series-enhancement.css hoặc source map:', error);
        });
    }
    
    function addDeviceSpecificStyles() {
        let currentDevice = 'desktop'; // Default fallback
        
        if (window.DeviceDetector && window.__deviceDetectorLoaded) {
            try {
                currentDevice = window.DeviceDetector.getCurrentDevice();
                debugLog('Áp dụng styles cho thiết bị:', currentDevice);
            } catch (error) {
                debugLog('Lỗi khi lấy device info, sử dụng desktop:', error);
            }
        } else {
            // Fallback: detect by screen width
            const screenWidth = window.screen.width || window.innerWidth || 1024;
            if (screenWidth <= 768) {
                currentDevice = 'mobile';
            } else if (screenWidth <= 1024) {
                currentDevice = 'tablet';
            } else {
                currentDevice = 'desktop';
            }
            debugLog('DeviceDetector không khả dụng, sử dụng fallback detection:', currentDevice);
        }
        
        generateDeviceSpecificCSS(currentDevice)
            .then(css => {
                GM_addStyle(css);
                debugLog(`Đã áp dụng ${currentDevice} specific styles`);
            })
            .catch(error => {
                debugLog('Lỗi khi tải device specific CSS:', error);
            });
    }
    
    function generateDeviceSpecificCSS(device) {
        const isMobile = device === 'mobile';
        const isTablet = device === 'tablet';
        const isDesktop = device === 'desktop';

        const cssPromises = [];
        const mapPromises = [];

        // Load base CSS and source map
        cssPromises.push(fetch(FOLDER_URL + 'info-truyen/device-base.css').then(r => r.text()));
        mapPromises.push(fetch(FOLDER_URL + 'info-truyen/device-base.css.map').then(r => r.text()));

        if (isMobile) {
            cssPromises.push(fetch(FOLDER_URL + 'info-truyen/device-mobile.css').then(r => r.text()));
            mapPromises.push(fetch(FOLDER_URL + 'info-truyen/device-mobile.css.map').then(r => r.text()));
        } else if (isTablet) {
            cssPromises.push(fetch(FOLDER_URL + 'info-truyen/device-tablet.css').then(r => r.text()));
            mapPromises.push(fetch(FOLDER_URL + 'info-truyen/device-tablet.css.map').then(r => r.text()));
        } else if (isDesktop) {
            cssPromises.push(fetch(FOLDER_URL + 'info-truyen/device-desktop.css').then(r => r.text()));
            mapPromises.push(fetch(FOLDER_URL + 'info-truyen/device-desktop.css.map').then(r => r.text()));
        }

        return Promise.all([...cssPromises, ...mapPromises]).then(results => {
            const cssArray = results.slice(0, cssPromises.length);
            const mapArray = results.slice(cssPromises.length);

            let combinedCss = cssArray.join('\n');

            // Add source maps as data URLs
            mapArray.forEach((mapContent, index) => {
                const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));
                combinedCss += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';
            });

            return combinedCss;
        });
    }
    
    function setupDeviceChangeListener() {
        if (!window.DeviceDetector) {
            debugLog('DeviceDetector chưa sẵn sàng để lắng nghe thay đổi');
            return;
        }
        
        window.DeviceDetector.onDeviceChange((newDevice, oldDevice, deviceInfo) => {
            debugLog(`Device changed từ ${oldDevice} sang ${newDevice}`);
            debugLog('Device info:', deviceInfo);
            
            // Cập nhật styles khi thiết bị thay đổi
            setTimeout(() => {
                addDeviceSpecificStyles();
            }, 100);
            
            // Cập nhật thumbnail effect nếu cần
            if (thumbnailEffectApplied) {
                debugLog('Cập nhật thumbnail effect cho thiết bị mới');
                // Xóa effect cũ và áp dụng lại
                const existingOverlay = document.querySelector('.betterhako-bg-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                    thumbnailEffectApplied = false;
                }
                // Thử áp dụng lại
                setupThumbnailEffects();
            }
        });
        
        debugLog('Device change listener đã được thiết lập');
    }
    
    function setupPortraitCSSRedesign() {
        debugLog('Thiết lập Portrait CSS Redesign với orientation detection');
        
        // Kiểm tra orientation hiện tại
        function isPortrait() {
            return window.innerHeight > window.innerWidth;
        }
        
        // Áp dụng CSS cho portrait mode
        function applyPortraitCSS() {
            if (portraitCSSApplied) {
                debugLog('Portrait CSS đã được áp dụng');
                return;
            }
            
            debugLog('Áp dụng CSS cho màn hình dọc (portrait)');

            // Fetch CSS and source map simultaneously
            Promise.all([
                fetch(FOLDER_URL + 'info-truyen/portrait.css').then(r => r.text()),
                fetch(FOLDER_URL + 'info-truyen/portrait.css.map').then(r => r.text())
            ])
            .then(([css, mapContent]) => {
                // Convert source map to data URL
                const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

                // Add source mapping as data URL
                css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

                // Tạo Blob URL cho quản lý tài nguyên hiệu quả
                const blob = new Blob([css], { type: 'text/css' });
                const blobUrl = URL.createObjectURL(blob);

                // Tạo link element và áp dụng CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = blobUrl;
                document.head.appendChild(link);

                portraitCSSApplied = true;
                debugLog('Đã áp dụng CSS cho màn hình dọc với Blob URL và inline source mapping');
            })
            .catch(error => {
                debugLog('Lỗi khi tải portrait.css hoặc source map:', error);
            });
        }
        
        // Xóa CSS cho landscape mode
        function removePortraitCSS() {
            if (!portraitCSSApplied) {
                debugLog('Portrait CSS chưa được áp dụng');
                return;
            }
            
            debugLog('Xóa CSS cho màn hình ngang (landscape)');
            
            // Xóa style tag chứa portrait CSS
            const styleElements = document.querySelectorAll('style');
            styleElements.forEach(style => {
                if (style.textContent && style.textContent.includes('.side-features.flex-none > div:nth-child(1)')) {
                    style.remove();
                    debugLog('Đã xóa portrait CSS style');
                }
            });
            
            portraitCSSApplied = false;
            debugLog('Đã xóa CSS cho màn hình ngang');
        }
        
        // Kiểm tra orientation ban đầu
        if (isPortrait()) {
            applyPortraitCSS();
        } else {
            debugLog('Màn hình hiện tại là ngang, không áp dụng CSS');
        }
        
        // Thêm event listener cho orientation change
        if (!orientationListenerAdded) {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (isPortrait()) {
                        debugLog('Phát hiện thay đổi sang màn hình dọc');
                        applyPortraitCSS();
                    } else {
                        debugLog('Phát hiện thay đổi sang màn hình ngang');
                        removePortraitCSS();
                    }
                }, 100); // Đợi một chút để orientation change hoàn tất
            });
            
            // Thêm listener cho window resize (backup cho orientation change)
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    if (isPortrait()) {
                        if (!portraitCSSApplied) {
                            debugLog('Resize: Áp dụng CSS cho màn hình dọc');
                            applyPortraitCSS();
                        }
                    } else {
                        if (portraitCSSApplied) {
                            debugLog('Resize: Xóa CSS cho màn hình ngang');
                            removePortraitCSS();
                        }
                    }
                }, 150);
            });
            
            orientationListenerAdded = true;
            debugLog('Orientation và resize listeners đã được thiết lập');
        }
    }
    
    function setupThumbnailEffects() {
        debugLog('Thiết lập thumbnail effects với retry mechanism và MutationObserver');

        retryCount = 0;
        const maxRetries = 15; // Tăng số lần thử
        const retryDelay = 300; // Giảm thời gian chờ
        const maxTotalTime = 10000; // 10 seconds timeout

        const startTime = Date.now();

        function attemptSetup() {
            retryCount++;
            debugLog(`Lần thử ${retryCount}/${maxRetries}: Thiết lập thumbnail effects`);

            // Kiểm tra timeout tổng thể
            if (Date.now() - startTime > maxTotalTime) {
                debugLog('Đã vượt quá thời gian timeout, bỏ qua thumbnail effect');
                cleanupObserver();
                return;
            }

            // Kiểm tra xem đã áp dụng chưa
            if (thumbnailEffectApplied || document.querySelector('.betterhako-bg-overlay')) {
                debugLog('Thumbnail effect đã được áp dụng trước đó');
                cleanupObserver();
                return;
            }

            // Kiểm tra các điều kiện cần thiết
            const coverElement = document.querySelector('.series-cover .img-in-ratio');
            const mainPart = document.getElementById('mainpart');

            if (!coverElement || !mainPart) {
                debugLog(`Chưa tìm thấy đủ elements: cover=${!!coverElement}, mainpart=${!!mainPart}`);

                if (retryCount < maxRetries) {
                    setTimeout(attemptSetup, retryDelay);
                } else {
                    debugLog('Đã thử tối đa lần, thiết lập MutationObserver để theo dõi DOM changes');
                    setupDOMObserver();
                }
                return;
            }

            // Lấy cover URL
            const coverStyle = coverElement.style.backgroundImage;
            let coverUrl = coverStyle.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');

            if (!coverUrl) {
                debugLog('Chưa có URL ảnh bìa, thử lại...');

                if (retryCount < maxRetries) {
                    setTimeout(attemptSetup, retryDelay);
                } else {
                    debugLog('Đã thử tối đa lần để lấy URL, thiết lập MutationObserver');
                    setupDOMObserver();
                }
                return;
            }

            debugLog('Tìm thấy ảnh bìa URL:', coverUrl);

            // Đợi theme detector nếu chưa sẵn sàng
            if (!window.__themeDetectorLoaded || !window.ThemeDetector) {
                debugLog('Theme detector chưa sẵn sàng, đợi...');
                if (retryCount < maxRetries) {
                    setTimeout(attemptSetup, retryDelay);
                } else {
                    debugLog('Theme detector vẫn chưa sẵn sàng, áp dụng với brightness mặc định');
                    applyThumbnailEffects(coverUrl);
                    cleanupObserver();
                }
                return;
            }

            // Tất cả điều kiện đã sẵn sàng
            applyThumbnailEffects(coverUrl).then(() => {
                cleanupObserver();
            }).catch(error => {
                debugLogWithLevel(DEBUG_LEVELS.FALLBACK_USED, 'Error applying thumbnail effects:', error);
                cleanupObserver();
            });

            // Service Worker integration: Preload related thumbnails with CORS safety
            preloadRelatedThumbnails(coverUrl);
        }

        // Bắt đầu thử
        attemptSetup();
    }
    
    function setupDOMObserver() {
        if (domObserver) {
            debugLog('DOM Observer đã được thiết lập');
            return;
        }
        
        debugLog('Thiết lập DOM Observer để theo dõi thay đổi');
        
        domObserver = new MutationObserver(function(mutations) {
            let shouldCheck = false;
            
            mutations.forEach(function(mutation) {
                // Kiểm tra nếu có thay đổi về childList hoặc attributes
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    shouldCheck = true;
                }
            });
            
            if (shouldCheck) {
                debugLog('Phát hiện thay đổi DOM, kiểm tra lại thumbnail effect');
                
                // Clear existing observer và thử lại
                cleanupObserver();
                
                retryCount = 0;
                setTimeout(setupThumbnailEffects, 100);
            }
        });
        
        // Theo dõi toàn bộ document
        domObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    function cleanupObserver() {
        if (domObserver) {
            debugLog('Dọn dẹp DOM Observer');
            domObserver.disconnect();
            domObserver = null;
        }
    }
    
    async function applyThumbnailEffects(coverUrl) {
        // Double check để tránh race condition
        if (thumbnailEffectApplied || document.querySelector('.betterhako-bg-overlay')) {
            debugLog('Thumbnail effect đã được áp dụng, bỏ qua');
            return;
        }

        thumbnailEffectApplied = true;

        debugLog('Áp dụng thumbnail effects với CORS safety cho URL:', coverUrl);

        try {
            // Get CORS-safe thumbnail URL
            const safeUrl = await getCorsSafeThumbnail(coverUrl, {
                width: 400,
                height: 600,
                timeout: 5000,
                useCache: true
            });

            debugLog('Using CORS-safe URL:', safeUrl);

            // Thêm hiệu ứng thumbnail mờ dần với URL an toàn
            addThumbnailFadeEffect(safeUrl);

            // Thêm CSS cho phần trên của feature-section trong suốt
            addTransparentTopCSS();

            debugLog('Đã áp dụng thành công thumbnail effects với CORS safety');
        } catch (error) {
            debugLogWithLevel(DEBUG_LEVELS.FALLBACK_USED, 'Failed to get CORS-safe thumbnail, using fallback:', error);

            // Fallback to gradient if everything fails
            const fallbackUrl = createGradientFallback(400, 600);
            addThumbnailFadeEffect(fallbackUrl);
            addTransparentTopCSS();

            debugLog('Applied fallback thumbnail effects');
        }
    }
    
    // Hàm thêm hiệu ứng thumbnail mờ dần
    function addThumbnailFadeEffect(coverUrl) {
        // Kiểm tra lại để tránh race condition
        if (document.querySelector('.betterhako-bg-overlay')) {
            debugLog('Overlay đã tồn tại, bỏ qua thêm mới');
            return;
        }

        // Tạo phần tử cho hiệu ứng nền
        const bgOverlay = document.createElement('div');
        bgOverlay.className = 'betterhako-bg-overlay';

        // Kiểm tra xem có phải dark mode không với fallback
        let brightness = '0.6'; // Default brightness
        let blurLevel = '12px'; // Default blur level

        // Tăng độ mờ trong khung giờ proxy (10h đêm đến 5h sáng)
        if (isProxyBackgroundTime()) {
            blurLevel = '20px'; // Tăng blur level để làm mờ hơn
            debugLog('Proxy background time detected, increasing blur level to 20px');
        }

        try {
            if (window.__themeDetectorLoaded && window.ThemeDetector && window.ThemeDetector.isDark()) {
                brightness = '0.5';
                debugLog('Dark mode detected');
            } else {
                brightness = '0.7';
                debugLog('Light mode detected');
            }
        } catch (error) {
            debugLog('Lỗi khi kiểm tra theme, sử dụng brightness mặc định:', error);
        }
        
        // Thêm styles
        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + 'info-truyen/hmt-thumbnail-overlay.css').then(r => r.text()),
            fetch(FOLDER_URL + 'info-truyen/hmt-thumbnail-overlay.css.map').then(r => r.text())
        ])
        .then(([css, mapContent]) => {
            // Convert source map to data URL
            const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

            // Add source mapping as data URL
            css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

            // Tạo Blob URL cho quản lý tài nguyên hiệu quả
            const blob = new Blob([css + `
                .betterhako-bg-overlay {
                    background-image: url('${coverUrl}');
                    filter: blur(${blurLevel}) brightness(${brightness});
                }
            `], { type: 'text/css' });
            const blobUrl = URL.createObjectURL(blob);

            // Tạo link element và áp dụng CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = blobUrl;
            document.head.appendChild(link);

            debugLog('Đã thêm hiệu ứng thumbnail mờ dần với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải info-truyen/hmt-thumbnail-overlay.css hoặc source map:', error);
        });
        
        // Thêm phần tử vào DOM với double check
        const mainPart = document.getElementById('mainpart');
        if (mainPart) {
            // Kiểm tra lại xem overlay đã tồn tại chưa
            if (!document.querySelector('.betterhako-bg-overlay')) {
                mainPart.prepend(bgOverlay);
                debugLog(`Đã thêm hiệu ứng thumbnail mờ dần với brightness: ${brightness} và blur: ${blurLevel}`);
            } else {
                debugLog('Overlay đã tồn tại khi thêm vào DOM');
            }
        } else {
            debugLog('Không tìm thấy #mainpart để thêm overlay');
        }
    }
    
    // Hàm thêm CSS cho phần trên của feature-section trong suốt
    function addTransparentTopCSS() {
        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + 'info-truyen/transparent-top.css').then(r => r.text()),
            fetch(FOLDER_URL + 'info-truyen/transparent-top.css.map').then(r => r.text())
        ])
        .then(([css, mapContent]) => {
            // Convert source map to data URL
            const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

            // Add source mapping as data URL
            css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

            // Tạo Blob URL cho quản lý tài nguyên hiệu quả
            const blob = new Blob([css], { type: 'text/css' });
            const blobUrl = URL.createObjectURL(blob);

            // Tạo link element và áp dụng CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = blobUrl;
            document.head.appendChild(link);

            debugLog('Đã thêm CSS phần trên trong suốt với Blob URL và inline source mapping');
        })
        .catch(error => {
            debugLog('Lỗi khi tải info-truyen/transparent-top.css hoặc source map:', error);
        });
    }

    // Service Worker integration: Preload related thumbnails with CORS safety
    function preloadRelatedThumbnails(coverUrl) {
        debugLog('Service Worker: Preloading related thumbnails with CORS safety');

        // Find other thumbnail images on the page
        const thumbnailElements = document.querySelectorAll('.series-cover .img-in-ratio, .story-item img, .thumbnail img');
        const thumbnailUrls = [];

        thumbnailElements.forEach(element => {
            let url = null;

            if (element.style.backgroundImage) {
                url = element.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            } else if (element.src) {
                url = element.src;
            }

            if (url && url !== coverUrl && !thumbnailUrls.includes(url)) {
                thumbnailUrls.push(url);
            }
        });

        // Limit to 10 thumbnails to avoid overloading
        const urlsToPreload = thumbnailUrls.slice(0, 10);

        if (urlsToPreload.length > 0 && window.HMTServiceWorker) {
            debugLog(`Service Worker: Preloading ${urlsToPreload.length} thumbnails`);

            // Process each URL through CORS safety check
            const corsSafeUrls = urlsToPreload.map(async (url) => {
                try {
                    return await getCorsSafeThumbnail(url, { timeout: 3000, useCache: true });
                } catch (error) {
                    debugLogWithLevel(DEBUG_LEVELS.PROXY_ATTEMPT, 'Failed to get CORS-safe URL for preload:', url, error);
                    return null;
                }
            });

            Promise.all(corsSafeUrls).then(safeUrls => {
                const validUrls = safeUrls.filter(url => url !== null);
                if (validUrls.length > 0) {
                    window.HMTServiceWorker.preloadThumbnails(validUrls, 'high');
                }
            });

            // Also register background sync for additional thumbnails
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register('hmt-thumbnail-preload').catch(err => {
                        debugLog('Background sync registration failed:', err);
                    });
                });
            }
        }
    }

    // Cache story data for offline access
    function cacheCurrentStoryData() {
        debugLog('Service Worker: Caching current story data');

        // Extract story information from the page
        const storyTitle = document.querySelector('h1, .series-title')?.textContent?.trim();
        const storyAuthor = document.querySelector('.author, .series-author')?.textContent?.trim();
        const storyDescription = document.querySelector('.description, .series-description')?.textContent?.trim();
        const storyGenres = Array.from(document.querySelectorAll('.genre, .tag')).map(el => el.textContent?.trim()).filter(Boolean);
        const storyStatus = document.querySelector('.status, .series-status')?.textContent?.trim();

        if (storyTitle && window.HMTServiceWorker) {
            const storyData = {
                title: storyTitle,
                author: storyAuthor,
                description: storyDescription,
                genres: storyGenres,
                status: storyStatus,
                url: window.location.href,
                cachedAt: new Date().toISOString(),
                coverUrl: document.querySelector('.series-cover .img-in-ratio')?.style?.backgroundImage?.replace(/url\(['"]?(.*?)['"]?\)/i, '$1')
            };

            // Generate a simple story ID from URL
            const storyId = btoa(window.location.href).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

            window.HMTServiceWorker.cacheStoryData(storyId, storyData);
            debugLog('Service Worker: Story data cached for offline access');
        }
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInfoTruyen);
    } else {
        initInfoTruyen();
    }
})();
