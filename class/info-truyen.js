(function() {
    'use strict';
    
    const DEBUG = GM_getValue('debug_mode', false);
    let thumbnailEffectApplied = false;
    let retryCount = 0;
    let domObserver = null;
    let portraitCSSApplied = false;
    let orientationListenerAdded = false;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[InfoTruyen]', ...args);
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
            fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/series-enhancement.css').then(r => r.text()),
            fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/series-enhancement.css.map').then(r => r.text())
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
            debugLog('Lỗi khi tải series-enhancement.css hoặc source map:', error);
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
        cssPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-base.css').then(r => r.text()));
        mapPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-base.css.map').then(r => r.text()));

        if (isMobile) {
            cssPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-mobile.css').then(r => r.text()));
            mapPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-mobile.css.map').then(r => r.text()));
        } else if (isTablet) {
            cssPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-tablet.css').then(r => r.text()));
            mapPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-tablet.css.map').then(r => r.text()));
        } else if (isDesktop) {
            cssPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-desktop.css').then(r => r.text()));
            mapPromises.push(fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/device-desktop.css.map').then(r => r.text()));
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
                fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/portrait.css').then(r => r.text()),
                fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/portrait.css.map').then(r => r.text())
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
            applyThumbnailEffects(coverUrl);
            cleanupObserver();
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
    
    function applyThumbnailEffects(coverUrl) {
        // Double check để tránh race condition
        if (thumbnailEffectApplied || document.querySelector('.betterhako-bg-overlay')) {
            debugLog('Thumbnail effect đã được áp dụng, bỏ qua');
            return;
        }
        
        thumbnailEffectApplied = true;
        
        debugLog('Áp dụng thumbnail effects cho URL:', coverUrl);
        
        // Thêm hiệu ứng thumbnail mờ dần
        addThumbnailFadeEffect(coverUrl);

        // Thêm CSS cho phần trên của feature-section trong suốt
        addTransparentTopCSS();
        
        debugLog('Đã áp dụng thành công thumbnail effects');
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
            fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/thumbnail-overlay.css').then(r => r.text()),
            fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/thumbnail-overlay.css.map').then(r => r.text())
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
                    filter: blur(12px) brightness(${brightness});
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
            debugLog('Lỗi khi tải thumbnail-overlay.css hoặc source map:', error);
        });
        
        // Thêm phần tử vào DOM với double check
        const mainPart = document.getElementById('mainpart');
        if (mainPart) {
            // Kiểm tra lại xem overlay đã tồn tại chưa
            if (!document.querySelector('.betterhako-bg-overlay')) {
                mainPart.prepend(bgOverlay);
                debugLog(`Đã thêm hiệu ứng thumbnail mờ dần với brightness: ${brightness}`);
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
            fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/transparent-top.css').then(r => r.text()),
            fetch('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/transparent-top.css.map').then(r => r.text())
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
            debugLog('Lỗi khi tải transparent-top.css hoặc source map:', error);
        });
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInfoTruyen);
    } else {
        initInfoTruyen();
    }
})();
