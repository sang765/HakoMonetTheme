(function() {
    'use strict';
    
    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[PageInfoTruyen]', ...args);
        }
    }

    // Performance Monitoring Class
    class ExtractionMetrics {
        constructor() {
            this.strategyPerformance = new Map();
            this.loadHistoricalData();
        }

        async loadHistoricalData() {
            try {
                const data = localStorage.getItem('hakoColorExtractionMetrics');
                if (data) {
                    this.strategyPerformance = new Map(JSON.parse(data));
                }
            } catch (error) {
                debugLog('Error loading historical data:', error);
            }
        }

        async saveHistoricalData() {
            try {
                localStorage.setItem('hakoColorExtractionMetrics', JSON.stringify([...this.strategyPerformance]));
            } catch (error) {
                debugLog('Error saving historical data:', error);
            }
        }

        async trackStrategySuccess(strategyName) {
            const stats = this.strategyPerformance.get(strategyName) || { success: 0, total: 0 };
            stats.success++;
            stats.total++;
            this.strategyPerformance.set(strategyName, stats);
            await this.saveHistoricalData();
        }

        async trackStrategyFailure(strategyName, error) {
            const stats = this.strategyPerformance.get(strategyName) || { success: 0, total: 0 };
            stats.total++;
            this.strategyPerformance.set(strategyName, stats);
            await this.saveHistoricalData();
        }

        getStrategySuccessRate(strategyName) {
            const stats = this.strategyPerformance.get(strategyName);
            return stats ? stats.success / stats.total : 0.5; // Default 50%
        }

        async sortStrategiesByPerformance(strategies) {
            return strategies.sort((a, b) => {
                const rateA = this.getStrategySuccessRate(a.name);
                const rateB = this.getStrategySuccessRate(b.name);
                return rateB - rateA;
            });
        }
    }

    const extractionMetrics = new ExtractionMetrics();

    // Utility functions
    function executeWithTimeout(fn, ...args) {
        return new Promise((resolve, reject) => {
            const timeout = args.pop(); // Last arg is timeout
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout'));
            }, timeout);

            fn(...args)
                .then(result => {
                    clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    function isValidColor(color) {
        return MonetAPI.isValidColor(color);
    }

    function blobToImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                debugLog('Blob image loaded successfully:', img.width, 'x', img.height);
                resolve(img);
            };
            img.onerror = (error) => {
                debugLog('Failed to create image from blob:', error);
                reject(new Error('Failed to create image from blob'));
            };
            img.src = URL.createObjectURL(blob);
        });
    }

    function fetchWithCorsFallback(url) {
        debugLog('Attempting to fetch image with CORS:', url);
        return fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/*'
            }
        })
        .then(response => {
            debugLog('Fetch response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            debugLog('Blob received, size:', blob.size);
            if (blob.size === 0) {
                throw new Error('Empty blob received');
            }
            return blob;
        })
        .catch(error => {
            debugLog('Fetch failed:', error);
            throw error;
        });
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    // Integrated CORS handling for images
    function setupImageCorsHandling() {
        if (window.__imageCorsSetup) return;

        debugLog('Setting up integrated CORS handling for images');

        // Patch Image constructor
        const originalImage = window.Image;
        window.Image = function(width, height) {
            const img = new originalImage(width, height);
            // Patch the src setter
            const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
            if (originalSrcDescriptor && originalSrcDescriptor.set) {
                Object.defineProperty(img, 'src', {
                    set: function(value) {
                        if (isTargetDomain(value)) {
                            this.crossOrigin = 'anonymous';
                            debugLog('Set crossOrigin for image:', value);
                        }
                        return originalSrcDescriptor.set.call(this, value);
                    },
                    get: originalSrcDescriptor.get,
                    configurable: true,
                    enumerable: true
                });
            }
            return img;
        };

        // Copy static properties
        Object.keys(originalImage).forEach(key => {
            window.Image[key] = originalImage[key];
        });

        // Also patch existing Image prototype for direct property access
        const protoDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        if (protoDescriptor && protoDescriptor.set) {
            const originalSet = protoDescriptor.set;
            Object.defineProperty(HTMLImageElement.prototype, 'src', {
                set: function(value) {
                    if (isTargetDomain(value)) {
                        this.crossOrigin = 'anonymous';
                        debugLog('Set crossOrigin for existing image:', value);
                    }
                    return originalSet.call(this, value);
                },
                get: protoDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }

        window.__imageCorsSetup = true;
        debugLog('Integrated CORS handling for images is ready');
    }
    
    function initPageInfoTruyen() {
        debugLog('Initializing PageInfoTruyen color extraction...');

        // Kiểm tra xem có phải trang chi tiết truyện không bằng cách tìm element đặc trưng
        const sideFeaturesElement = document.querySelector('div.col-4.col-md.feature-item.width-auto-xl');
        if (!sideFeaturesElement) {
            debugLog('Không tìm thấy element đặc trưng, bỏ qua tính năng đổi màu.');
            return;
        }

        const coverElement = document.querySelector('.series-cover .img-in-ratio');
        if (!coverElement) {
            debugLog('Không tìm thấy ảnh bìa.');
            return;
        }

        const coverStyle = window.getComputedStyle(coverElement).backgroundImage || coverElement.style.backgroundImage;
        const coverUrl = coverStyle.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');

        if (!coverUrl || coverUrl === 'none') {
            debugLog('Không thể lấy URL ảnh bìa từ backgroundImage.');
            return;
        }

        debugLog('Đang phân tích màu từ ảnh bìa:', coverUrl);
        debugLog('Cover URL type:', typeof coverUrl);
        debugLog('Cover URL length:', coverUrl ? coverUrl.length : 'null');

        // Validate cover URL
        if (!coverUrl || coverUrl === 'none' || coverUrl.trim() === '') {
            debugLog('Cover URL is invalid or empty');
            return;
        }

        // Hàm áp dụng màu sắc hiện tại
        function applyCurrentColorScheme() {
            const defaultColor = window.HMTConfig && window.HMTConfig.getDefaultColor ?
                window.HMTConfig.getDefaultColor() : '#6c5ce7';

            debugLog('Áp dụng màu mặc định từ config:', defaultColor);

            if (!isValidColor(defaultColor)) {
                debugLog('Màu không hợp lệ, sử dụng màu mặc định');
                applyDefaultColorScheme();
                return;
            }

            // Thêm class để kích hoạt animation
            document.body.classList.add('hmt-color-changing');

            // Tạo Monet palette từ màu config
            const monetPalette = MonetAPI.generateMonetPalette(defaultColor);
            debugLog('Monet Palette từ config:', monetPalette);

            const isLightColor = MonetAPI.isColorLight(defaultColor);
            debugLog('Màu sáng?', isLightColor);

            applyMonetColorScheme(monetPalette, isLightColor);

            // Loại bỏ class sau khi animation hoàn thành
            setTimeout(() => {
                document.body.classList.remove('hmt-color-changing');
            }, 600);
        }

        // Hàm phân tích màu từ ảnh bìa và áp dụng
        function analyzeAndApplyImageColor() {
            // Thêm hiệu ứng thumbnail mờ dần
            addThumbnailFadeEffect(coverUrl);

            // Thêm CSS cho phần trên của feature-section trong suốt
            addTransparentTopCSS();

            // Check if MonetAPI is available
            if (!window.MonetAPI || !window.MonetAPI.generateMonetPalette) {
                debugLog('MonetAPI not available, using default color scheme');
                applyCurrentColorScheme();
                return;
            }

            // Sử dụng hệ thống robust với fallback chain
            analyzeImageColorRobust(coverUrl)
                .then(dominantColor => {
                    debugLog('Màu chủ đạo (robust extraction):', dominantColor);

                    if (!isValidColor(dominantColor)) {
                        debugLog('Màu không hợp lệ, sử dụng màu mặc định');
                        applyCurrentColorScheme();
                        return;
                    }

                    // Kiểm tra thêm để tránh màu quá tối (như #121212)
                    if (dominantColor.startsWith('#1') || dominantColor.startsWith('#0')) {
                        const testRgb = MonetAPI.hexToRgb(dominantColor);
                        if (testRgb && (testRgb.r + testRgb.g + testRgb.b) / 3 < 40) {
                            debugLog('Màu quá tối, sử dụng màu mặc định');
                            applyCurrentColorScheme();
                            return;
                        }
                    }

                    // Gọi API Monet để tạo palette
                    const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                    debugLog('Monet Palette:', monetPalette);

                    const isLightColor = MonetAPI.isColorLight(dominantColor);
                    debugLog('Màu sáng?', isLightColor);

                    applyMonetColorScheme(monetPalette, isLightColor);
                })
                .catch(error => {
                    debugLog('Lỗi khi phân tích ảnh với tất cả fallbacks:', error);
                    applyCurrentColorScheme();
                });
        }

        // Áp dụng màu sắc lần đầu
        analyzeAndApplyImageColor();

        // Lắng nghe sự kiện màu sắc thay đổi để cập nhật real-time
        document.addEventListener('hmtColorChanged', function(event) {
            debugLog('Nhận sự kiện màu sắc thay đổi:', event.detail);

            // Chỉ áp dụng màu thực sự nếu không phải preview mode
            if (!event.detail.isPreview) {
                // Đợi một chút để đảm bảo màu đã được lưu vào storage
                setTimeout(() => {
                    applyCurrentColorScheme();
                }, 100);
            } else {
                // Nếu là preview mode, áp dụng màu ngay lập tức
                const previewColor = event.detail.color;
                if (previewColor && isValidColor(previewColor)) {
                    const monetPalette = MonetAPI.generateMonetPalette(previewColor);
                    const isLightColor = MonetAPI.isColorLight(previewColor);
                    applyMonetColorScheme(monetPalette, isLightColor);
                }
            }
        });

        debugLog('Đã thiết lập lắng nghe sự kiện màu sắc thay đổi');
    }
    
    function isValidColor(color) {
        // Check if MonetAPI is available
        if (!window.MonetAPI || !window.MonetAPI.isValidColor) {
            // Basic validation if MonetAPI is not available
            return color && typeof color === 'string' && color.match(/^#[0-9A-Fa-f]{6}$/);
        }
        return MonetAPI.isValidColor(color);
    }
    
    // Hàm thêm CSS cho phần trên của feature-section trong suốt
    function addTransparentTopCSS() {
        GM_addStyle(`
            .feature-section.at-series {
                background: transparent !important;
                border: none !important;
            }
            
            /* Xóa gradient mặc định của dark mode */
            .feature-section.at-series.clear {
                background: transparent !important;
                background-image: none !important;
            }
            
            /* Đảm bảo nội dung vẫn hiển thị bình thường */
            .feature-section > * {
                position: relative;
                z-index: 2;
            }
            
            /* Tạo lớp phủ gradient để phần trên trong suốt */
            .feature-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 200px;
                background: linear-gradient(to bottom, 
                    rgba(0, 0, 0, 0.3) 0%, 
                    rgba(0, 0, 0, 0.7) 50%,
                    rgba(0, 0, 0, 0.9) 100%);
                pointer-events: none;
                z-index: 1;
            }
            
            /* Light mode support */
            body:not(.dark) .feature-section::before {
                background: linear-gradient(to bottom, 
                    rgba(255, 255, 255, 0.3) 0%, 
                    rgba(255, 255, 255, 0.7) 50%,
                    rgba(255, 255, 255, 0.9) 100%);
            }
        `);
        
        debugLog('Đã thêm CSS phần trên trong suốt');
    }
    
    // Hàm thêm hiệu ứng thumbnail mờ dần
    function addThumbnailFadeEffect(coverUrl) {
        // Tạo phần tử cho hiệu ứng nền
        const bgOverlay = document.createElement('div');
        bgOverlay.className = 'betterhako-bg-overlay';
        
        // Thêm styles
        GM_addStyle(`
            .betterhako-bg-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 350px;
                z-index: -1;
                background-image: url('${coverUrl}');
                background-size: cover;
                background-position: center;
                filter: blur(12px) brightness(0.5);
                mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
                -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
                pointer-events: none;
            }
            
            #mainpart {
                position: relative;
                isolation: isolate;
            }
            
            #mainpart > .container {
                position: relative;
                z-index: 1;
            }
            
            /* Điều chỉnh cho light mode */
            body:not(.dark) .betterhako-bg-overlay {
                filter: blur(12px) brightness(0.7);
            }
        `);
        
        // Thêm phần tử vào DOM
        const mainPart = document.getElementById('mainpart');
        if (mainPart) {
            // Kiểm tra xem overlay đã tồn tại chưa để tránh thêm nhiều lần
            if (!document.querySelector('.betterhako-bg-overlay')) {
                mainPart.prepend(bgOverlay);
                debugLog('Đã thêm hiệu ứng thumbnail mờ dần');
            }
        } else {
            debugLog('Không tìm thấy #mainpart');
        }
    }
    
    // Layer 3: Service Worker Integration
    class HakoColorExtractionSW {
        constructor() {
            this.swRegistered = false;
        }

        async register() {
            if ('serviceWorker' in navigator && !this.swRegistered) {
                try {
                    // Try to register service worker, but don't fail if it doesn't exist
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    this.swRegistered = true;
                    debugLog('Service Worker registered for color extraction');
                    return registration;
                } catch (error) {
                    debugLog('Service Worker registration failed (this is normal if no SW file exists):', error);
                    // Don't throw error, just mark as not available
                    this.swRegistered = false;
                }
            }
        }

        async extractColor(imageUrl) {
            if (!this.swRegistered) {
                await this.register();
            }

            return new Promise((resolve, reject) => {
                navigator.serviceWorker.controller?.postMessage({
                    type: 'EXTRACT_COLOR',
                    url: imageUrl
                });

                navigator.serviceWorker.addEventListener('message', function handler(event) {
                    if (event.data.type === 'COLOR_EXTRACTED') {
                        navigator.serviceWorker.removeEventListener('message', handler);
                        resolve(event.data.color);
                    } else if (event.data.type === 'EXTRACTION_FAILED') {
                        navigator.serviceWorker.removeEventListener('message', handler);
                        reject(new Error(event.data.error));
                    }
                });
            });
        }
    }

    const hakoSW = new HakoColorExtractionSW();

    // Layer 4: Heuristic Analysis with Hako Context
    // Layer 5: Browser-Specific Solutions
    function getBrowserType() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'chrome';
        if (ua.includes('Firefox')) return 'firefox';
        if (ua.includes('Safari')) return 'safari';
        return 'other';
    }

    async function browserSpecificExtraction(imageUrl) {
        const browser = getBrowserType();
        debugLog('Browser-specific extraction for browser:', browser);

        switch (browser) {
            case 'chrome':
                // Use chrome-specific features if available
                if (chrome && chrome.identity) {
                    return await chromeIdentityExtraction(imageUrl);
                }
                break;
            case 'firefox':
                // Firefox relaxed CORS
                return await firefoxExtraction(imageUrl);
            case 'safari':
                // Safari ITP bypass
                return await safariExtraction(imageUrl);
            default:
                break;
        }

        debugLog('Browser-specific extraction not supported, falling back to canvas');
        // Fallback to canvas extraction instead of throwing error
        return await enhancedCanvasExtraction(imageUrl);
    }

    async function chromeIdentityExtraction(imageUrl) {
        // Placeholder for chrome.identity usage
        try {
            if (chrome && chrome.identity) {
                // Could use chrome.identity here for better CORS handling
                debugLog('Chrome identity available, but using canvas fallback for now');
            }
        } catch (error) {
            debugLog('Chrome identity not available:', error);
        }
        return enhancedCanvasExtraction(imageUrl); // Fallback to canvas
    }

    async function firefoxExtraction(imageUrl) {
        // Firefox might allow more relaxed CORS
        debugLog('Using Firefox-specific extraction');
        return enhancedCanvasExtraction(imageUrl);
    }

    // Main Robust Function
    async function analyzeImageColorRobust(imageUrl) {
        const strategies = [
            {
                name: 'enhanced-canvas',
                fn: enhancedCanvasExtraction,
                weight: 10,
                timeout: 5000
            },
            {
                name: 'hako-proxy-rotation',
                fn: hakoProxyExtraction,
                weight: 9,
                timeout: 3000
            },
            {
                name: 'browser-specific',
                fn: browserSpecificExtraction,
                weight: 8,
                timeout: 2000
            },
            {
                name: 'service-worker-bypass',
                fn: serviceWorkerExtraction,
                weight: 7,
                timeout: 4000
            },
            {
                name: 'hako-ultimate-fallback',
                fn: hakoUltimateFallback,
                weight: 6,
                timeout: 500
            },
            {
                name: 'hako-heuristic',
                fn: hakoHeuristicExtraction,
                weight: 2,
                timeout: 1000
            }
        ];

        // Adaptive strategy selection based on historical performance
        const sortedStrategies = await extractionMetrics.sortStrategiesByPerformance(strategies);
        debugLog('Strategy order:', sortedStrategies.map(s => `${s.name} (${s.weight})`));

        for (const strategy of sortedStrategies) {
            debugLog(`Trying strategy: ${strategy.name}`);
            try {
                const result = await executeWithTimeout(strategy.fn, imageUrl, strategy.timeout);
                debugLog(`Strategy ${strategy.name} result:`, result);
                if (result && isValidColor(result)) {
                    // Kiểm tra thêm để tránh màu quá tối
                    const rgb = MonetAPI.hexToRgb(result);
                    if (rgb && (rgb.r + rgb.g + rgb.b) / 3 < 40) {
                        debugLog(`Strategy ${strategy.name} returned too dark color:`, result, 'skipping');
                        await extractionMetrics.trackStrategyFailure(strategy.name, new Error('Color too dark'));
                        continue;
                    }

                    debugLog(`Strategy ${strategy.name} succeeded with color:`, result);
                    await extractionMetrics.trackStrategySuccess(strategy.name);
                    return result;
                } else {
                    debugLog(`Strategy ${strategy.name} returned invalid color:`, result);
                }
            } catch (error) {
                debugLog(`Strategy ${strategy.name} failed:`, error.message);
                await extractionMetrics.trackStrategyFailure(strategy.name, error);
                continue;
            }
        }

        throw new Error('All color extraction strategies failed');
    }

    // Layer 6: Hako-Specific Ultimate Fallbacks
    async function hakoUltimateFallback(imageUrl) {
        debugLog('Starting ultimate fallback for:', imageUrl);

        // Default color palettes based on novel genres
        const genreElement = document.querySelector('.series-type');
        debugLog('Ultimate fallback - genre element found:', !!genreElement);
        if (genreElement) {
            const genreText = genreElement.textContent.toLowerCase();
            debugLog('Ultimate fallback - genre text:', genreText);
            const genreColors = {
                'romance': '#ff69b4',
                'fantasy': '#8a2be2',
                'action': '#ff4500',
                'comedy': '#ffd700',
                'drama': '#4169e1',
                'horror': '#8b0000',
                'mystery': '#2f4f4f',
                'sci-fi': '#00ced1'
            };

            for (const [key, color] of Object.entries(genreColors)) {
                if (genreText.includes(key)) {
                    debugLog('Ultimate fallback - found matching genre:', key, '->', color);
                    return Promise.resolve(color);
                }
            }
        }

        // Domain-based color mapping
        if (imageUrl.includes('docln')) {
            debugLog('Ultimate fallback - using docln color');
            return Promise.resolve('#6c5ce7');
        }
        if (imageUrl.includes('hako')) {
            debugLog('Ultimate fallback - using hako color');
            return Promise.resolve('#00b894');
        }
        if (imageUrl.includes('ln.hako')) {
            debugLog('Ultimate fallback - using ln.hako color');
            return Promise.resolve('#00b894');
        }

        // Seasonal/trending color suggestions
        const month = new Date().getMonth();
        const seasonalColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        const color = seasonalColors[month % seasonalColors.length];
        debugLog('Ultimate fallback - using seasonal color:', color);
        return Promise.resolve(color);
    }

    async function safariExtraction(imageUrl) {
        // Safari specific handling
        return enhancedCanvasExtraction(imageUrl);
    }

    async function hakoHeuristicExtraction(imageUrl) {
        debugLog('Starting heuristic extraction for:', imageUrl);

        // Ưu tiên 1: Genre-based color mapping (tốt nhất)
        const genreElement = document.querySelector('.series-type');
        debugLog('Genre element found:', !!genreElement);
        if (genreElement) {
            const genreText = genreElement.textContent.toLowerCase();
            debugLog('Genre text:', genreText);
            const genreColors = {
                'romance': '#ff69b4',
                'fantasy': '#8a2be2',
                'action': '#ff4500',
                'comedy': '#ffd700',
                'drama': '#4169e1',
                'horror': '#8b0000',
                'mystery': '#2f4f4f',
                'sci-fi': '#00ced1',
                'adventure': '#ff8c00',
                'school': '#32cd32',
                'slice of life': '#dda0dd'
            };

            for (const [key, color] of Object.entries(genreColors)) {
                if (genreText.includes(key)) {
                    debugLog('Found matching genre:', key, '->', color);
                    return Promise.resolve(color);
                }
            }
        }

        // Ưu tiên 2: Analyze parent elements for color hints (chỉ khi không quá tối)
        const coverElement = document.querySelector('.series-cover .img-in-ratio');
        debugLog('Cover element found:', !!coverElement);
        if (coverElement) {
            const parentColor = window.getComputedStyle(coverElement.parentElement).backgroundColor;
            debugLog('Parent color:', parentColor);
            if (parentColor && parentColor !== 'rgba(0, 0, 0, 0)' && parentColor !== 'transparent') {
                const rgb = parentColor.match(/\d+/g);
                debugLog('RGB values:', rgb);
                if (rgb && rgb.length >= 3) {
                    const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / 3;
                    debugLog('Parent color brightness:', brightness);

                    // Tránh màu quá tối (như #121212)
                    if (brightness > 50) {
                        try {
                            const color = MonetAPI.rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
                            debugLog('Converted parent color to:', color);
                            return Promise.resolve(color);
                        } catch (error) {
                            debugLog('Error converting parent color to hex:', error);
                        }
                    } else {
                        debugLog('Parent color too dark, skipping');
                    }
                }
            }
        }

        // Domain-based fallback
        if (imageUrl.includes('docln')) return Promise.resolve('#6c5ce7');
        if (imageUrl.includes('hako')) return Promise.resolve('#00b894');
        if (imageUrl.includes('ln.hako')) return Promise.resolve('#00b894');

        // Always return a valid color as final fallback
        debugLog('Using domain-based fallback color for:', imageUrl);
        return Promise.resolve('#6c5ce7'); // Default
    }

    async function serviceWorkerExtraction(imageUrl) {
        try {
            // Only attempt if service worker is actually available and registered
            if (hakoSW.swRegistered) {
                return await hakoSW.extractColor(imageUrl);
            } else {
                throw new Error('Service Worker not available');
            }
        } catch (error) {
            debugLog('Service Worker extraction failed:', error);
            throw new Error('Service Worker extraction failed: ' + error.message);
        }
    }

    // Layer 2: CORS Proxy Rotation
    const HAKO_PROXY_ENDPOINTS = [
        'https://corsproxy.io/?{url}',
        'https://api.codetabs.com/v1/proxy?quest={url}',
        'https://cors-anywhere.herokuapp.com/{url}',
        'https://proxy.cors.sh/{url}' // Premium proxy
    ];

    async function hakoProxyExtraction(imageUrl) {
        const proxies = HAKO_PROXY_ENDPOINTS.map(proxy =>
            proxy.replace('{url}', encodeURIComponent(imageUrl))
        );

        for (let i = 0; i < proxies.length; i++) {
            try {
                const proxyUrl = proxies[i];
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.ok) {
                    const blob = await response.blob();
                    debugLog(`Proxy ${i} returned blob size:`, blob.size);
                    if (blob.size > 0) {
                        const img = await blobToImage(blob);
                        const color = getTraditionalAccentColorFromImage(img);
                        URL.revokeObjectURL(img.src);
                        return color;
                    } else {
                        debugLog(`Proxy ${i} returned empty blob`);
                        continue;
                    }
                }
            } catch (error) {
                debugLog(`Proxy ${i} failed:`, error);
                continue;
            }
        }

        throw new Error('All proxies failed');
    }

    // Layer 1: Enhanced Direct Canvas Approach
    async function enhancedCanvasExtraction(imageUrl) {
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                clearTimeout(timeoutId);
                if (objectUrl) URL.revokeObjectURL(objectUrl);
            };

            let objectUrl = null;
            const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error('Canvas extraction timeout'));
            }, 5000);

            const img = new Image();

            // Enhanced CORS handling
            if (isTargetDomain(imageUrl)) {
                img.crossOrigin = 'anonymous';
                // Add cache busting
                imageUrl += (imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
            }

            img.onload = function() {
                debugLog('Image loaded successfully:', img.width, 'x', img.height);
                try {
                    // Use OffscreenCanvas if supported
                    let canvas;
                    if (typeof OffscreenCanvas !== 'undefined') {
                        canvas = new OffscreenCanvas(img.width, img.height);
                        debugLog('Using OffscreenCanvas');
                    } else {
                        canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        debugLog('Using regular Canvas');
                    }

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Could not get canvas context');
                    }

                    ctx.drawImage(img, 0, 0);
                    debugLog('Image drawn to canvas successfully');

                    // Progressive loading with sampling
                    const dominantColor = getTraditionalAccentColorFromImage(img);
                    debugLog('Color extraction completed:', dominantColor);
                    cleanup();
                    resolve(dominantColor);
                } catch (error) {
                    debugLog('Error in canvas processing:', error);
                    cleanup();
                    reject(error);
                }
            };

            img.onerror = function() {
                debugLog('Image failed to load:', imageUrl);
                debugLog('Image error details:', {
                    src: this.src,
                    width: this.width,
                    height: this.height,
                    naturalWidth: this.naturalWidth,
                    naturalHeight: this.naturalHeight,
                    complete: this.complete,
                    crossOrigin: this.crossOrigin
                });
                cleanup();
                reject(new Error('Image loading failed'));
            };

            // Handle different URL types
            if (imageUrl.startsWith('blob:')) {
                img.src = imageUrl;
            } else if (imageUrl.startsWith('data:')) {
                img.src = imageUrl;
            } else {
                // Try to load with fetch first for CORS
                fetchWithCorsFallback(imageUrl)
                    .then(blob => {
                        if (blob && blob.size > 0) {
                            objectUrl = URL.createObjectURL(blob);
                            img.src = objectUrl;
                        } else {
                            throw new Error('Empty blob received');
                        }
                    })
                    .catch((error) => {
                        debugLog('Fetch failed, trying direct load:', error);
                        // Fallback to direct loading
                        img.src = imageUrl;
                    });
            }
        });
    }

    // Hàm phân tích ảnh với focus vào accent color truyền thống
    function analyzeImageColorTraditionalAccent(imageUrl) {
        return new Promise((resolve, reject) => {
            // Setup CORS handling for images if needed
            if (isTargetDomain(imageUrl)) {
                debugLog('Ảnh từ domain target, thiết lập CORS handling');
                setupImageCorsHandling();
            }

            const img = new Image();

            // Always set crossOrigin for safety
            if (isTargetDomain(imageUrl)) {
                img.crossOrigin = 'anonymous';
                debugLog('Đã set crossOrigin cho ảnh từ domain target');
            }

            img.onload = function() {
                debugLog('Ảnh đã tải xong, kích thước:', img.width, 'x', img.height);
                try {
                    const dominantColor = getTraditionalAccentColorFromImage(img);
                    resolve(dominantColor);
                } catch (error) {
                    reject('Lỗi khi phân tích ảnh: ' + error);
                }
            };

            img.onerror = function(error) {
                debugLog('Lỗi tải ảnh với Image API:', imageUrl, error);

                // Fallback: try using XMLHttpRequest with CORS headers
                if (isTargetDomain(imageUrl)) {
                    debugLog('Thử tải ảnh bằng XMLHttpRequest với CORS headers');
                    loadImageWithXHR(imageUrl)
                        .then(img => {
                            try {
                                const dominantColor = getTraditionalAccentColorFromImage(img);
                                resolve(dominantColor);
                            } catch (error) {
                                reject('Lỗi khi phân tích ảnh từ XHR: ' + error);
                            }
                        })
                        .catch(xhrError => {
                            debugLog('XMLHttpRequest cũng thất bại:', xhrError);
                            reject('Không thể tải ảnh bằng cả Image API và XMLHttpRequest');
                        });
                } else {
                    reject('Không thể tải ảnh');
                }
            };

            img.src = imageUrl;
        });
    }

    // Fallback function to load image using XMLHttpRequest with CORS headers
    function loadImageWithXHR(imageUrl) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', imageUrl, true);
            xhr.responseType = 'blob';

            // Add CORS headers for target domains
            if (isTargetDomain(imageUrl)) {
                xhr.setRequestHeader('Origin', window.location.origin);
                xhr.setRequestHeader('Referer', window.location.href);
                xhr.setRequestHeader('Access-Control-Request-Method', 'GET');
            }

            xhr.onload = function() {
                if (xhr.status === 200) {
                    const blob = xhr.response;
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => reject('Không thể tạo ảnh từ blob');
                    img.src = URL.createObjectURL(blob);
                } else {
                    reject('XHR failed with status: ' + xhr.status);
                }
            };

            xhr.onerror = function() {
                reject('XHR network error');
            };

            xhr.send();
        });
    }
    
    // Hàm lấy màu accent truyền thống từ ảnh
    function getTraditionalAccentColorFromImage(img) {
        // Check if required APIs are available
        if (!window.MonetAPI || !window.MonetAPI.rgbToHex) {
            debugLog('MonetAPI not available, using fallback color');
            return '#6c5ce7';
        }

        // Check if canvas is supported
        const testCanvas = document.createElement('canvas');
        if (!testCanvas || !testCanvas.getContext) {
            debugLog('Canvas not supported, using fallback color');
            return '#6c5ce7';
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Thiết lập kích thước canvas
        const width = 200;
        const height = 200;
        canvas.width = width;
        canvas.height = height;
        
        // Vẽ ảnh với kích thước nhỏ
        ctx.drawImage(img, 0, 0, width, height);
        
        // Lấy dữ liệu pixel từ toàn bộ ảnh
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        debugLog('Phân tích toàn bộ ảnh để tìm accent color truyền thống');
        debugLog('Tổng pixel trong ảnh:', data.length / 4);
        
        // Đếm màu với trọng số ưu tiên màu accent truyền thống
        const colorCount = {};
        let maxCount = 0;
        let dominantColor = '#6c5ce7'; // Màu mặc định

        // Cải thiện phạm vi màu accent truyền thống với trọng số cao hơn cho màu rực rỡ
        const traditionalAccentRanges = [
            // Màu đỏ rực rỡ
            {min: [140, 20, 20], max: [255, 120, 120], weight: 2.2},
            // Màu cam sáng
            {min: [220, 100, 20], max: [255, 180, 80], weight: 2.1},
            // Màu vàng rực rỡ
            {min: [200, 180, 40], max: [255, 240, 120], weight: 2.0},
            // Màu xanh lá cây
            {min: [40, 120, 40], max: [120, 255, 120], weight: 2.0},
            // Màu xanh dương
            {min: [40, 80, 140], max: [120, 140, 255], weight: 2.1},
            // Màu tím
            {min: [120, 40, 140], max: [220, 120, 220], weight: 2.0},
            // Màu hồng
            {min: [220, 120, 160], max: [255, 200, 220], weight: 2.0},
            // Màu xanh ngọc
            {min: [40, 180, 140], max: [120, 220, 180], weight: 1.9}
        ];
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Bỏ qua pixel trong suốt
            if (a < 128) continue;

            // LOẠI BỎ màu quá sáng (gần trắng) và quá tối (gần đen)
            const brightness = (r + g + b) / 3;
            if (brightness > 245 || brightness < 25) {
                continue;
            }

            // LOẠI BỎ màu xám (khi các kênh màu gần bằng nhau)
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;

            // Tăng ngưỡng độ bão hòa để loại bỏ màu xám và ưu tiên màu rực rỡ
            if (saturation < 40) {
                continue;
            }

            // LOẠI BỎ màu quá tối hoặc quá xám (như #121212)
            if (brightness < 40 || (maxChannel - minChannel) < 35) {
                continue;
            }
            
            // Nhóm màu
            const roundedR = Math.round(r / 8) * 8;
            const roundedG = Math.round(g / 8) * 8;
            const roundedB = Math.round(b / 8) * 8;
            
            const colorGroup = `${roundedR},${roundedG},${roundedB}`;
            
            // Tính trọng số dựa trên màu accent truyền thống
            let weight = 1.0;
            for (const accentRange of traditionalAccentRanges) {
                if (roundedR >= accentRange.min[0] && roundedR <= accentRange.max[0] &&
                    roundedG >= accentRange.min[1] && roundedG <= accentRange.max[1] &&
                    roundedB >= accentRange.min[2] && roundedB <= accentRange.max[2]) {
                    weight = accentRange.weight;
                    break;
                }
            }

            // Tăng trọng số cho màu có độ bão hòa và độ sáng cao
            const normalizedSaturation = saturation / 255;
            const normalizedBrightness = brightness / 255;
            weight *= (0.3 + normalizedSaturation * 0.7) * (0.4 + normalizedBrightness * 0.6);

            // Thưởng thêm cho màu có độ sáng trung bình (không quá tối, không quá sáng)
            if (brightness > 60 && brightness < 200) {
                weight *= 1.3;
            }
            
            const weightedCount = Math.round(weight);
            
            if (colorCount[colorGroup]) {
                colorCount[colorGroup] += weightedCount;
            } else {
                colorCount[colorGroup] = weightedCount;
            }
            
            if (colorCount[colorGroup] > maxCount) {
                maxCount = colorCount[colorGroup];
                dominantColor = MonetAPI.rgbToHex(roundedR, roundedG, roundedB);
            }
        }
        
        // Nếu không tìm thấy màu accent phù hợp, sử dụng màu có độ bão hòa cao nhất
        if (maxCount === 0) {
            debugLog('Không tìm thấy màu accent truyền thống, sử dụng màu bão hòa cao nhất');
            dominantColor = getMostSaturatedColor(img);

            // Nếu vẫn là màu tối, thử tìm màu sáng hơn
            if (dominantColor === '#6c5ce7' || dominantColor.startsWith('#1') || dominantColor.startsWith('#0')) {
                debugLog('Màu tìm được quá tối, thử tìm màu sáng hơn');
                dominantColor = getBrightAccentColor(img);
            }
        }
        
        debugLog('Màu accent được chọn:', dominantColor);
        return dominantColor;
    }
    
    // Hàm lấy màu có độ bão hòa cao nhất (fallback)
    function getMostSaturatedColor(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 100;
        const height = 100;
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        let maxSaturation = 0;
        let mostSaturatedColor = '#6c5ce7';
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 128) continue;
            
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;
            
            // Bỏ qua màu quá sáng/quá tối và ưu tiên màu có độ sáng trung bình
            const brightness = (r + g + b) / 3;
            if (brightness > 240 || brightness < 40) continue;
    
            // Ưu tiên màu có độ sáng trung bình và độ bão hòa cao
            if (saturation > maxSaturation && brightness > 60 && brightness < 200) {
                maxSaturation = saturation;
                mostSaturatedColor = MonetAPI.rgbToHex(r, g, b);
            }
        }
        
        return mostSaturatedColor;
    }

    // Hàm lấy màu accent sáng và rực rỡ (fallback khi màu chính quá tối)
    function getBrightAccentColor(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 150;
        const height = 150;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        let bestColor = '#6c5ce7';
        let bestScore = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;

            const brightness = (r + g + b) / 3;
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;

            // Ưu tiên màu sáng, rực rỡ và có độ bão hòa cao
            if (brightness > 100 && brightness < 200 && saturation > 60) {
                const score = saturation * (brightness / 255) * 2.0;
                if (score > bestScore) {
                    bestScore = score;
                    bestColor = MonetAPI.rgbToHex(r, g, b);
                }
            }
        }

        debugLog('Bright accent color found:', bestColor, 'with score:', bestScore);
        return bestColor;
    }
    
    // Hàm áp dụng Monet color scheme
    function applyMonetColorScheme(palette, isLight) {
        if (!palette) {
            applyDefaultColorScheme();
            return;
        }
        
        const textColor = isLight ? '#000' : '#fff';
        
        const css = `
            :root {
                --monet-primary: ${palette[500]};
                --monet-primary-light: ${palette[300]};
                --monet-primary-dark: ${palette[700]};
                --monet-surface: ${palette[100]};
                --monet-surface-dark: ${palette[200]};
                --monet-background: ${palette[50]};
                --monet-background-dark: ${palette[100]};
                --monet-elevated: ${palette[0]};
                --monet-elevated-dark: ${palette[100]};
            }

            /* Faster transitions for interactive elements */
            a, button, .navbar-menu, .nav-submenu, .noti-sidebar, .account-sidebar {
                transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease !important;
            }

            /* Special animation for color changes */
            @keyframes hmtColorChangePulse {
                0% {
                    filter: brightness(1) saturate(1);
                }
                50% {
                    filter: brightness(1.05) saturate(1.1);
                }
                100% {
                    filter: brightness(1) saturate(1);
                }
            }

            /* Apply subtle pulse animation when colors change */
            body.hmt-color-changing * {
                animation: hmtColorChangePulse 0.6s ease-in-out;
            }
            
            a:hover,
            .long-text a:hover {
                color: ${palette[500]} !important;
            }
            
            .text-slate-500,
            .long-text a {
            	color: ${palette[300]} !important;
            }
            
            .paging_item.paging_prevnext.next,
            .paging_item.paging_prevnext.prev {
                color: ${palette[500]} !important;
                border-color: ${palette[500]} !important;
            }
            
            .paging_item.paging_prevnext.next:hover,
            .paging_item.paging_prevnext.prev:hover {
                background-color: ${palette[500]} !important;
                color: ${isLight ? '#000' : '#fff'} !important;
            }
            
            .series-type,
            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${palette[500]} !important;
            }
            
            .series-type,
            .ln-comment-form input.button,
            .series-users .series-owner_name a {
                color: ${textColor} !important;
            }
            
            .feature-section .series-type:before {
                border-top-color: ${palette[500]} !important;
            }
            
            .navbar-logo-wrapper .navbar-logo {
                background-color: ${palette[500]} !important;
            }
            
            #navbar,
            .noti-sidebar .noti-more {
                background-color: ${palette[800]} !important;
            }
            
            .navbar-menu.at-mobile,
            #navbar-user#guest-menu ul.nav-submenu,
            .account-sidebar,
            .list-volume-wrapper,
            .ln-comment-toolkit,
            .ln-list-option,
            .navbar-menu.at-navbar .nav-submenu,
            .noti-sidebar,
            #sidenav-icon.active,
            .navbar-menu {
                background-color: ${palette[700]} !important;
            }
            
            #navbar-user#guest-menu ul.nav-submenu,
            .account-sidebar,
            .list-volume-wrapper,
            .ln-comment-toolkit,
            .ln-list-option,
            .navbar-menu.at-mobile,
            .navbar-menu.at-navbar .nav-submenu,
            .noti-sidebar {
                box-shadow: 0 0 14px ${palette[900]} !important;
            }
            
            .navbar-menu {
                border-bottom-color: ${palette[900]} !important;
            }
            
            #mainpart,
            #mainpart.at-index {
                background-color: ${palette[1000]} !important;
            }
            
            .basic-section,
            .board-list,
            .board_categ-list,
            .detail-list,
            .feature-section,
            .index-top_notification,
            .mail-page .mail-detail-list,
            .modal-content,
            .page-breadcrumb,
            .private-tabs,
            .profile-feature,
            .series-users,
            .showcase-item,
            .sub-index-style {
                background-color: ${palette[900]} !important;
                border-color: ${palette[900]} ${palette[1000]} ${palette[1000]} !important;
            }
            
            #licensed-list header.section-title,
            #tba-list header.section-title,
            .basic-section .sect-header,
            .detail-list header.section-title,
            .modal-header,
            .private-tabs header {
                background-color: ${palette[800]} !important;
            }
            
            .bg-gray-100 {
                background-color: ${palette[100]} !important;
            }
            
            #footer {
                background-color: ${palette[800]} !important;
            }

            :is(.dark .dark\\:\\!bg-zinc-800) {
                background-color: ${palette[800]} !important;
            }
            
            .noti-item.untouch {
                background-color: ${palette[700]} !important;
            }
            
            .noti-item {
                border-color: ${palette[700]} !important;
            }
            
            .noti-item:hover {
                background-color: ${palette[800]} !important;
            }
            
            #noti-icon.active .icon-wrapper {
                background-color: ${palette[900]} !important;
            }
            
            :is(.dark .dark\\:hover\\:\\!bg-zinc-700:hover) {
                background-color: ${palette[700]} !important;
            }
            
            ul.list-chapters li:hover {
                background-color: ${palette[700]} !important;
            }
            
            ul.list-chapters li:nth-child(2n) {
                background-color: ${palette[800]} !important;
            }

            .navbar-menu.at-mobile li {
                border-bottom-color: ${palette[700]} !important;
            }
            
            .nav-submenu {
                background-color: ${palette[800]} !important;
                border-bottom-color: ${palette[700]} !important;
            }
            
            #noti-icon.active,
            .nav-user_icon.active {
                background-color: ${palette[800]} !important;
            }

            .summary-more.more-state:hover,
            .mobile-more:hover {
                color: ${palette[500]} !important;
            }
            
            .summary-more.less-state .see_more:hover {
                color: ${palette[500]} !important;
            }
            
            .expand, .mobile-more, .summary-more.more-state {
                background: linear-gradient(180deg, rgba(31,31,31,0) 1%, ${palette[900]} 75%, ${palette[900]}) !important;
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#001f1f1f",endColorstr="${palette[900]}",GradientType=0) !important;
            }
            
            .ln-comment-group:nth-child(odd) .expand {
                background: linear-gradient(180deg, rgba(42,42,42,0) 1%, ${palette[800]} 75%, ${palette[800]}) !important;
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#002a2a2a",endColorstr="${palette[800]}",GradientType=0) !important;
            }
            
            .visible-toolkit .visible-toolkit-item.do-like.liked {
                border-bottom-color: ${palette[500]} !important;
                color: ${palette[500]} !important;
                font-weight: 700 !important;
            }

            /* Additional styles for TinyMCE editor and search */
            .navbar-search .search-input {
                background-color: ${palette[900]} !important;
            }

            .button-green {
                background-color: ${palette[400]} !important;
                border-color: ${palette[600]} !important;
                color: ${textColor} !important;
            }

            :is(.dark .dark\:ring-cyan-900) {
                --tw-ring-color: ${palette[800]} !important;
            }
        `;
        
        GM_addStyle(css);
        debugLog('Đã áp dụng Monet theme với màu chủ đạo:', palette[500]);
    }
    
    function applyDefaultColorScheme() {
        // Lấy màu mặc định từ config, fallback về màu cũ nếu không có
        const defaultColor = (window.HMTConfig && window.HMTConfig.getDefaultColor) ?
            window.HMTConfig.getDefaultColor() : '#6c5ce7';
        const defaultPalette = MonetAPI.generateMonetPalette(defaultColor);
        
        if (!defaultPalette) {
            debugLog('Không thể tạo palette mặc định');
            return;
        }
        
        const css = `
            /* Faster transitions for interactive elements */
            a, button, .navbar-menu, .nav-submenu, .noti-sidebar, .account-sidebar {
                transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease !important;
            }

            a:hover,
            .text-slate-500,
            .long-text a:hover,
            .long-text a {
                color: ${defaultColor} !important;
            }
            
            .paging_item.paging_prevnext.next,
            .paging_item.paging_prevnext.prev {
                color: ${defaultColor} !important;
                border-color: ${defaultColor} !important;
            }
            
            .paging_item.paging_prevnext.next:hover,
            .paging_item.paging_prevnext.prev:hover {
                background-color: ${defaultColor} !important;
                color: #fff !important;
            }
            
            .series-type,
            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${defaultColor} !important;
            }
            
            .series-type,
            .ln-comment-form input.button,
            .series-users .series-owner_name a {
                color: #fff !important;
            }
            
            .feature-section .series-type:before {
                border-top-color: ${defaultColor} !important;
            }
            
            .navbar-logo-wrapper .navbar-logo {
                background-color: ${defaultColor} !important;
            }
            
            #navbar,
            .noti-sidebar .noti-more {
                background-color: ${defaultPalette[800]} !important;
            }
            
            .navbar-menu.at-mobile,
            #navbar-user#guest-menu ul.nav-submenu,
            .account-sidebar,
            .list-volume-wrapper,
            .ln-comment-toolkit,
            .ln-list-option,
            .navbar-menu.at-navbar .nav-submenu,
            .noti-sidebar,
            #sidenav-icon.active,
            .navbar-menu {
                background-color: ${defaultPalette[700]} !important;
            }
            
            #navbar-user#guest-menu ul.nav-submenu,
            .account-sidebar,
            .list-volume-wrapper,
            .ln-comment-toolkit,
            .ln-list-option,
            .navbar-menu.at-mobile,
            .navbar-menu.at-navbar .nav-submenu,
            .noti-sidebar {
                box-shadow: 0 0 14px ${defaultPalette[900]} !important;
            }
            
            .navbar-menu {
                border-bottom-color: ${defaultPalette[900]} !important;
            }
            
            #mainpart,
            #mainpart.at-index {
                background-color: ${defaultPalette[1000]} !important;
            }
            
            .basic-section,
            .board-list,
            .board_categ-list,
            .detail-list,
            .feature-section,
            .index-top_notification,
            .mail-page .mail-detail-list,
            .modal-content,
            .page-breadcrumb,
            .private-tabs,
            .profile-feature,
            .series-users,
            .showcase-item,
            .sub-index-style {
                background-color: ${defaultPalette[900]} !important;
                border-color: ${defaultPalette[900]} ${defaultPalette[1000]} ${defaultPalette[1000]} !important;
            }
            
            #licensed-list header.section-title,
            #tba-list header.section-title,
            .basic-section .sect-header,
            .detail-list header.section-title,
            .modal-header,
            .private-tabs header {
                background-color: ${defaultPalette[800]} !important;
            }
            
            .bg-gray-100 {
                background-color: ${defaultPalette[100]} !important;
            }
            
            #footer {
                background-color: ${defaultPalette[800]} !important;
            }

            :is(.dark .dark\\:\\!bg-zinc-800) {
                background-color: ${defaultPalette[800]} !important;
            }
            
            .noti-item.untouch {
                background-color: ${defaultPalette[700]} !important;
            }
            
            .noti-item {
                border-color: ${defaultPalette[700]} !important;
            }
            
            .noti-item:hover {
                background-color: ${defaultPalette[800]} !important;
            }
            
            #noti-icon.active .icon-wrapper {
                background-color: ${defaultPalette[900]} !important;
            }
            
            :is(.dark .dark\\:hover\\:\\!bg-zinc-700:hover) {
                background-color: ${defaultPalette[700]} !important;
            }
            
            ul.list-chapters li:hover {
                background-color: ${defaultPalette[700]} !important;
            }
            
            ul.list-chapters li:nth-child(2n) {
                background-color: ${defaultPalette[800]} !important;
            }

            .navbar-menu.at-mobile li {
                border-bottom-color: ${defaultPalette[700]} !important;
            }
            
            .nav-submenu {
                background-color: ${defaultPalette[800]} !important;
                border-bottom-color: ${defaultPalette[700]} !important;
            }
            
            #noti-icon.active,
            .nav-user_icon.active {
                background-color: ${defaultPalette[800]} !important;
            }

            .summary-more.more-state:hover,
            .mobile-more:hover {
                color: ${defaultColor} !important;
            }
            
            .summary-more.less-state .see_more:hover {
                color: ${defaultColor} !important;
            }
            
            .expand, .mobile-more, .summary-more.more-state {
                background: linear-gradient(180deg, rgba(31,31,31,0) 1%, ${defaultPalette[900]} 75%, ${defaultPalette[900]}) !important;
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#001f1f1f",endColorstr="${defaultPalette[900]}",GradientType=0) !important;
            }
            
            .ln-comment-group:nth-child(odd) .expand {
                background: linear-gradient(180deg, rgba(42,42,42,0) 1%, ${defaultPalette[800]} 75%, ${defaultPalette[800]}) !important;
                filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#002a2a2a",endColorstr="${defaultPalette[800]}",GradientType=0) !important;
            }
            
            .visible-toolkit .visible-toolkit-item.do-like.liked {
                border-bottom-color: ${defaultColor} !important;
                color: ${defaultColor} !important;
                font-weight: 700 !important;
            }

            /* Additional styles for TinyMCE editor and search */
            .navbar-search .search-input {
                background-color: ${defaultPalette[900]} !important;
            }

            .button-green {
                background-color: ${defaultPalette[400]} !important;
                border-color: ${defaultPalette[600]} !important;
                color: #fff !important;
            }

            :is(.dark .dark\:ring-cyan-900) {
                --tw-ring-color: ${defaultPalette[800]} !important;
            }
        `;
        
        GM_addStyle(css);
        debugLog('Đã áp dụng màu mặc định từ config:', defaultColor);
    }
    
    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageInfoTruyen);
    } else {
        initPageInfoTruyen();
    }
})();
