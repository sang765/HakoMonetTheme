/**
 * Advanced Color Analyzer - Hệ thống phân tích màu nâng cao cho HakoMonetTheme
 * Tối ưu hóa với CORS, CSP và performance
 *
 * @author HakoMonetTheme Team
 * @version 2.1.0
 */

(function() {
    'use strict';

    const DEBUG = true;
    const PERFORMANCE_TARGET = 100; // ms

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[AdvancedColorAnalyzer]', ...args);
        }
    }

    function performanceLog(operation, duration) {
        if (DEBUG) {
            console.log(`[Performance] ${operation}: ${duration}ms`);
        }
    }

    // ==================== LỚP 1: CORS PROXY HANDLER ====================

    class CORSImageHandler {
        constructor() {
            this.cache = new Map();
            this.serviceWorker = null;
            this.requestQueue = [];
            this.isProcessing = false;
        }

        /**
         * Khởi tạo Service Worker proxy
         */
        async initializeServiceWorker() {
            if ('serviceWorker' in navigator && !this.serviceWorker) {
                try {
                    this.serviceWorker = await navigator.serviceWorker.register('/sw-cors-proxy.js');
                    debugLog('Service Worker proxy registered successfully');
                } catch (error) {
                    debugLog('Service Worker registration failed:', error);
                }
            }
        }

        /**
         * Xử lý CORS với multiple strategies
         */
        async handleImage(imageUrl, options = {}) {
            const startTime = performance.now();

            // Kiểm tra cache trước
            if (this.cache.has(imageUrl)) {
                const cached = this.cache.get(imageUrl);
                performanceLog('Cache hit', performance.now() - startTime);
                return cached;
            }

            try {
                // Strategy 1: Service Worker proxy
                if (this.serviceWorker && this.isTargetDomain(imageUrl)) {
                    const result = await this.loadWithServiceWorker(imageUrl);
                    this.cache.set(imageUrl, result);
                    performanceLog('Service Worker proxy', performance.now() - startTime);
                    return result;
                }

                // Strategy 2: XMLHttpRequest với headers phù hợp
                if (this.isTargetDomain(imageUrl)) {
                    const result = await this.loadWithXHR(imageUrl);
                    this.cache.set(imageUrl, result);
                    performanceLog('XHR with CORS headers', performance.now() - startTime);
                    return result;
                }

                // Strategy 3: Image API thông thường
                const result = await this.loadWithImageAPI(imageUrl);
                this.cache.set(imageUrl, result);
                performanceLog('Standard Image API', performance.now() - startTime);
                return result;

            } catch (error) {
                debugLog('CORS handling failed:', error);
                throw new Error(`CORS_ERROR: ${error.message}`);
            }
        }

        /**
         * Kiểm tra domain target
         */
        isTargetDomain(url) {
            const targetDomains = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];
            return targetDomains.some(domain => url.includes(domain));
        }

        /**
         * Load image với Service Worker
         */
        async loadWithServiceWorker(imageUrl) {
            return new Promise((resolve, reject) => {
                const channel = new MessageChannel();

                channel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = () => reject(new Error('Failed to create image from blob'));
                        img.src = event.data.blobUrl;
                    } else {
                        reject(new Error(event.data.error));
                    }
                };

                this.serviceWorker.active.postMessage({
                    type: 'FETCH_IMAGE',
                    url: imageUrl
                }, [channel.port2]);
            });
        }

        /**
         * Load image với XMLHttpRequest
         */
        async loadWithXHR(imageUrl) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', imageUrl, true);
                xhr.responseType = 'blob';

                // Thêm CORS headers
                xhr.setRequestHeader('Origin', window.location.origin);
                xhr.setRequestHeader('Referer', window.location.href);

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const blob = xhr.response;
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = () => reject(new Error('Failed to create image from blob'));
                        img.src = URL.createObjectURL(blob);
                    } else {
                        reject(new Error(`XHR failed: ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send();
            });
        }

        /**
         * Load image với Image API thông thường
         */
        async loadWithImageAPI(imageUrl) {
            return new Promise((resolve, reject) => {
                const img = new Image();

                // Set crossOrigin cho target domains
                if (this.isTargetDomain(imageUrl)) {
                    img.crossOrigin = 'anonymous';
                }

                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = imageUrl;
            });
        }

        /**
         * Cleanup cache
         */
        cleanup() {
            this.cache.clear();
            debugLog('CORS cache cleared');
        }
    }

    // ==================== LỚP 2: IMAGE PROCESSING PIPELINE ====================

    class ImageProcessingPipeline {
        constructor() {
            this.workers = [];
            this.maxWorkers = 2; // Giới hạn số Web Workers
        }

        /**
         * Xử lý ảnh với Web Workers
         */
        async processImage(img, options = {}) {
            const startTime = performance.now();

            return new Promise((resolve, reject) => {
                const worker = this.createWorker();
                const canvas = this.createOptimizedCanvas(img, options);

                const imageData = this.getImageData(canvas, options);

                worker.postMessage({
                    type: 'PROCESS_IMAGE',
                    imageData: imageData,
                    options: options,
                    timestamp: startTime
                });

                const cleanup = () => {
                    worker.terminate();
                    this.releaseWorker(worker);
                    canvas.width = 0;
                    canvas.height = 0;
                };

                worker.onmessage = (event) => {
                    cleanup();

                    if (event.data.success) {
                        performanceLog('Web Worker processing', performance.now() - startTime);
                        resolve(event.data.result);
                    } else {
                        reject(new Error(event.data.error));
                    }
                };

                worker.onerror = (error) => {
                    cleanup();
                    reject(error);
                };
            });
        }

        /**
         * Tạo Web Worker
         */
        createWorker() {
            const workerCode = this.generateWorkerCode();
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));

            this.workers.push(worker);
            return worker;
        }

        /**
         * Tạo mã cho Web Worker với Color Space Intelligence và Context-Aware Filtering
         */
        generateWorkerCode() {
            return `
                self.onmessage = function(event) {
                    const { type, imageData, options, timestamp } = event.data;

                    if (type === 'PROCESS_IMAGE') {
                        try {
                            const result = processImageData(imageData, options);
                            self.postMessage({
                                success: true,
                                result: result,
                                processingTime: Date.now() - timestamp
                            });
                        } catch (error) {
                            self.postMessage({
                                success: false,
                                error: error.message
                            });
                        }
                    }
                };

                function processImageData(imageData, options) {
                    const data = imageData.data;
                    const width = imageData.width;
                    const height = imageData.height;

                    // Áp dụng smart sampling với edge detection
                    const samples = applySmartSampling(data, width, height, options);

                    // Áp dụng Context-Aware Filtering với Color Space Intelligence
                    const filteredSamples = applyContextAwareFiltering(samples, options);

                    return {
                        samples: filteredSamples,
                        dimensions: { width, height },
                        sampleCount: filteredSamples.length,
                        originalCount: samples.length
                    };
                }

                function applySmartSampling(data, width, height, options) {
                    const samples = [];
                    const sampleSize = options.sampleSize || 10000;
                    const focusArea = options.focusArea || { x: 0.3, y: 0.3, width: 0.4, height: 0.4 };

                    // Tính toán vùng focus
                    const focusX = Math.floor(width * focusArea.x);
                    const focusY = Math.floor(height * focusArea.y);
                    const focusWidth = Math.floor(width * focusArea.width);
                    const focusHeight = Math.floor(height * focusArea.height);

                    // Ưu tiên sampling vùng focus (70% samples)
                    const focusSamples = Math.floor(sampleSize * 0.7);
                    const generalSamples = sampleSize - focusSamples;

                    // Sampling vùng focus với edge detection
                    for (let i = 0; i < focusSamples; i++) {
                        const x = focusX + Math.floor(Math.random() * focusWidth);
                        const y = focusY + Math.floor(Math.random() * focusHeight);
                        const pixelIndex = (y * width + x) * 4;

                        if (pixelIndex + 3 < data.length) {
                            const pixel = {
                                r: data[pixelIndex],
                                g: data[pixelIndex + 1],
                                b: data[pixelIndex + 2],
                                a: data[pixelIndex + 3],
                                x: x,
                                y: y,
                                weight: 1.5
                            };

                            // Áp dụng edge detection để tránh background
                            pixel.edgeWeight = calculateEdgeWeight(data, width, height, x, y);
                            pixel.weight *= (1 + pixel.edgeWeight * 0.3);

                            samples.push(pixel);
                        }
                    }

                    // Sampling vùng còn lại
                    for (let i = 0; i < generalSamples; i++) {
                        const x = Math.floor(Math.random() * width);
                        const y = Math.floor(Math.random() * height);
                        const pixelIndex = (y * width + x) * 4;

                        if (pixelIndex + 3 < data.length) {
                            const pixel = {
                                r: data[pixelIndex],
                                g: data[pixelIndex + 1],
                                b: data[pixelIndex + 2],
                                a: data[pixelIndex + 3],
                                x: x,
                                y: y,
                                weight: 1.0
                            };

                            pixel.edgeWeight = calculateEdgeWeight(data, width, height, x, y);
                            samples.push(pixel);
                        }
                    }

                    return samples;
                }

                function calculateEdgeWeight(data, width, height, x, y) {
                    // Sobel operator đơn giản để detect edges
                    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
                    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

                    let gradientX = 0;
                    let gradientY = 0;

                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const nx = x + kx;
                            const ny = y + ky;

                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const pixelIndex = (ny * width + nx) * 4;
                                const gray = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;

                                const weight = sobelX[(ky + 1) * 3 + (kx + 1)];
                                gradientX += gray * weight;

                                const weightY = sobelY[(ky + 1) * 3 + (kx + 1)];
                                gradientY += gray * weightY;
                            }
                        }
                    }

                    const magnitude = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
                    return Math.min(magnitude / 255, 1); // Normalize về 0-1
                }

                function applyContextAwareFiltering(samples, options) {
                    return samples.filter(sample => {
                        // Loại bỏ skin tones
                        if (isSkinTone(sample.r, sample.g, sample.b)) {
                            return false;
                        }

                        // Loại bỏ màu quá sáng/quá tối
                        const brightness = (sample.r + sample.g + sample.b) / 3;
                        if (brightness > 240 || brightness < 15) {
                            return false;
                        }

                        // Loại bỏ màu xám
                        const maxChannel = Math.max(sample.r, sample.g, sample.b);
                        const minChannel = Math.min(sample.r, sample.g, sample.b);
                        if (maxChannel - minChannel < 30) {
                            return false;
                        }

                        // Áp dụng Color Space Intelligence - chuyển RGB sang LAB
                        const labColor = rgbToLab(sample.r, sample.g, sample.b);

                        // Lọc theo khoảng LAB phù hợp cho accent colors
                        if (labColor.l < 20 || labColor.l > 90) {
                            return false; // Quá tối hoặc quá sáng trong LAB space
                        }

                        if (Math.abs(labColor.a) < 10 && Math.abs(labColor.b) < 10) {
                            return false; // Quá trung tính trong LAB space
                        }

                        return true;
                    });
                }

                function isSkinTone(r, g, b) {
                    // Kiểm tra skin tone ranges
                    const skinToneRanges = [
                        { min: [200, 140, 120], max: [255, 200, 180] }, // Light skin
                        { min: [140, 80, 60], max: [200, 140, 120] },   // Medium skin
                        { min: [80, 40, 30], max: [140, 80, 60] }       // Dark skin
                    ];

                    return skinToneRanges.some(range =>
                        r >= range.min[0] && r <= range.max[0] &&
                        g >= range.min[1] && g <= range.max[1] &&
                        b >= range.min[2] && b <= range.max[2]
                    );
                }

                function rgbToLab(r, g, b) {
                    // Chuẩn hóa RGB về 0-1
                    r = r / 255;
                    g = g / 255;
                    b = b / 255;

                    // Áp dụng gamma correction
                    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
                    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
                    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

                    // Chuyển sang XYZ
                    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
                    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
                    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

                    // Chuẩn hóa XYZ với D65 white point
                    const xn = 0.95047;
                    const yn = 1.0;
                    const zn = 1.08883;

                    const xr = x / xn;
                    const yr = y / yn;
                    const zr = z / zn;

                    // Áp dụng cube root với epsilon
                    const epsilon = 0.008856;
                    const kappa = 903.3;

                    const fx = xr > epsilon ? Math.pow(xr, 1/3) : (kappa * xr + 16) / 116;
                    const fy = yr > epsilon ? Math.pow(yr, 1/3) : (kappa * yr + 16) / 116;
                    const fz = zr > epsilon ? Math.pow(zr, 1/3) : (kappa * zr + 16) / 116;

                    // Tính LAB values
                    const l = Math.max(0, 116 * fy - 16);
                    const a = 500 * (fx - fy);
                    const b_lab = 200 * (fy - fz);

                    return { l, a, b: b_lab };
                }
            `;
        }

        /**
         * Tạo canvas tối ưu
         */
        createOptimizedCanvas(img, options) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Tính toán kích thước tối ưu dựa trên performance
            const maxDimension = options.maxDimension || 400;
            const aspectRatio = img.width / img.height;

            let { width, height } = this.calculateOptimalDimensions(
                img.width,
                img.height,
                maxDimension,
                aspectRatio
            );

            canvas.width = width;
            canvas.height = height;

            // Sử dụng imageSmoothing để tối ưu chất lượng
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(img, 0, 0, width, height);

            return canvas;
        }

        /**
         * Tính toán kích thước tối ưu
         */
        calculateOptimalDimensions(originalWidth, originalHeight, maxDimension, aspectRatio) {
            if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
                return { width: originalWidth, height: originalHeight };
            }

            if (originalWidth > originalHeight) {
                return {
                    width: maxDimension,
                    height: Math.floor(maxDimension / aspectRatio)
                };
            } else {
                return {
                    width: Math.floor(maxDimension * aspectRatio),
                    height: maxDimension
                };
            }
        }

        /**
         * Lấy image data với options
         */
        getImageData(canvas, options) {
            const ctx = canvas.getContext('2d');
            const sampleArea = options.sampleArea || { x: 0, y: 0, width: canvas.width, height: canvas.height };

            return ctx.getImageData(
                sampleArea.x,
                sampleArea.y,
                sampleArea.width,
                sampleArea.height
            );
        }

        /**
         * Release worker
         */
        releaseWorker(worker) {
            const index = this.workers.indexOf(worker);
            if (index > -1) {
                this.workers.splice(index, 1);
            }
        }

        /**
         * Cleanup
         */
        cleanup() {
            this.workers.forEach(worker => worker.terminate());
            this.workers = [];
            debugLog('Image processing pipeline cleaned up');
        }
    }

    // ==================== LỚP 3: COLOR ANALYSIS ENGINE ====================

    class ColorAnalysisEngine {
        constructor() {
            this.algorithms = {
                traditionalAccent: this.analyzeTraditionalAccent.bind(this),
                vibrantDominant: this.findVibrantDominant.bind(this),
                materialYou: this.extractMaterialYouPalette.bind(this),
                colorThief: this.implementColorThief.bind(this)
            };
        }

        /**
         * Phân tích màu với multiple algorithms
         */
        async analyzeColors(samples, options = {}) {
            const startTime = performance.now();
            const results = {};

            // Chạy các algorithms song song nếu có Web Workers hỗ trợ
            if (window.Worker) {
                results.traditionalAccent = await this.algorithms.traditionalAccent(samples, options);
                results.vibrantDominant = await this.algorithms.vibrantDominant(samples, options);
                results.materialYou = await this.algorithms.materialYou(samples, options);
                results.colorThief = await this.algorithms.colorThief(samples, options);
            } else {
                // Fallback: chạy tuần tự
                results.traditionalAccent = this.algorithms.traditionalAccent(samples, options);
                results.vibrantDominant = this.algorithms.vibrantDominant(samples, options);
                results.materialYou = this.algorithms.materialYou(samples, options);
                results.colorThief = this.algorithms.colorThief(samples, options);
            }

            // Smart selection: chọn kết quả tốt nhất
            const finalResult = this.selectBestResult(results, options);

            performanceLog('Color analysis', performance.now() - startTime);

            return {
                ...finalResult,
                allResults: results,
                algorithmUsed: finalResult.algorithm,
                processingTime: performance.now() - startTime
            };
        }

        /**
         * Algorithm 1: Traditional Accent Color
         */
        analyzeTraditionalAccent(samples, options) {
            const colorCount = {};
            let maxCount = 0;
            let dominantColor = '#6c5ce7';

            // Định nghĩa các khoảng màu accent truyền thống
            const accentRanges = [
                { min: [120, 0, 0], max: [255, 100, 100], weight: 1.8, name: 'red' },
                { min: [200, 80, 0], max: [255, 165, 50], weight: 1.7, name: 'orange' },
                { min: [180, 150, 0], max: [240, 220, 100], weight: 1.5, name: 'yellow' },
                { min: [0, 100, 0], max: [100, 255, 100], weight: 1.6, name: 'green' },
                { min: [0, 0, 120], max: [100, 100, 255], weight: 1.8, name: 'blue' },
                { min: [100, 0, 100], max: [200, 100, 200], weight: 1.7, name: 'purple' },
                { min: [200, 100, 150], max: [255, 180, 200], weight: 1.6, name: 'pink' }
            ];

            for (const sample of samples) {
                if (sample.a < 128) continue; // Bỏ qua pixel trong suốt

                const { r, g, b } = sample;
                const brightness = (r + g + b) / 3;

                // Loại bỏ màu quá sáng/quá tối
                if (brightness > 240 || brightness < 15) continue;

                // Tính độ bão hòa
                const maxChannel = Math.max(r, g, b);
                const minChannel = Math.min(r, g, b);
                const saturation = maxChannel - minChannel;

                if (saturation < 30) continue; // Bỏ qua màu xám

                // Nhóm màu và tính trọng số
                const roundedR = Math.round(r / 8) * 8;
                const roundedG = Math.round(g / 8) * 8;
                const roundedB = Math.round(b / 8) * 8;

                const colorGroup = `${roundedR},${roundedG},${roundedB}`;
                let weight = sample.weight || 1.0;

                // Áp dụng trọng số accent range
                for (const range of accentRanges) {
                    if (this.isInRange([roundedR, roundedG, roundedB], range.min, range.max)) {
                        weight *= range.weight;
                        break;
                    }
                }

                // Điều chỉnh trọng số theo độ bão hòa
                const normalizedSaturation = saturation / 255;
                weight *= (0.5 + normalizedSaturation * 0.5);

                const weightedCount = Math.round(weight);

                colorCount[colorGroup] = (colorCount[colorGroup] || 0) + weightedCount;

                if (colorCount[colorGroup] > maxCount) {
                    maxCount = colorCount[colorGroup];
                    dominantColor = MonetAPI.rgbToHex(roundedR, roundedG, roundedB);
                }
            }

            return {
                color: dominantColor,
                algorithm: 'traditionalAccent',
                confidence: maxCount / samples.length,
                sampleCount: samples.length
            };
        }

        /**
         * Algorithm 2: Vibrant Dominant Color
         */
        findVibrantDominant(samples, options) {
            let maxVibrancy = 0;
            let mostVibrantColor = '#6c5ce7';

            for (const sample of samples) {
                if (sample.a < 128) continue;

                const { r, g, b } = sample;
                const brightness = (r + g + b) / 3;

                if (brightness > 240 || brightness < 15) continue;

                // Tính độ sống động (vibrancy) = độ bão hòa * độ sáng
                const maxChannel = Math.max(r, g, b);
                const minChannel = Math.min(r, g, b);
                const saturation = maxChannel - minChannel;
                const normalizedBrightness = brightness / 255;

                const vibrancy = saturation * normalizedBrightness;

                if (vibrancy > maxVibrancy) {
                    maxVibrancy = vibrancy;
                    mostVibrantColor = MonetAPI.rgbToHex(r, g, b);
                }
            }

            return {
                color: mostVibrantColor,
                algorithm: 'vibrantDominant',
                confidence: maxVibrancy / (255 * 255),
                vibrancy: maxVibrancy
            };
        }

        /**
         * Algorithm 3: Material You Palette
         */
        extractMaterialYouPalette(samples, options) {
            // Tìm màu chủ đạo trước
            const dominantResult = this.findVibrantDominant(samples, options);

            if (!MonetAPI.isValidColor(dominantResult.color)) {
                return {
                    color: '#6c5ce7',
                    algorithm: 'materialYou',
                    confidence: 0,
                    error: 'Invalid dominant color'
                };
            }

            // Tạo palette từ màu chủ đạo
            const palette = MonetAPI.generateMonetPalette(dominantResult.color);

            return {
                color: dominantResult.color,
                palette: palette,
                algorithm: 'materialYou',
                confidence: dominantResult.confidence,
                isLight: MonetAPI.isColorLight(dominantResult.color)
            };
        }

        /**
         * Algorithm 4: Color Thief Implementation
         */
        implementColorThief(samples, options) {
            // Giản lược samples để tối ưu performance
            const reducedSamples = samples.filter((_, index) => index % 3 === 0);

            // Tạo color map
            const colorMap = {};
            const totalWeight = reducedSamples.reduce((sum, sample) => sum + (sample.weight || 1), 0);

            for (const sample of reducedSamples) {
                if (sample.a < 128) continue;

                const { r, g, b } = sample;
                const brightness = (r + g + b) / 3;

                if (brightness > 240 || brightness < 15) continue;

                const colorKey = MonetAPI.rgbToHex(r, g, b);
                const weight = sample.weight || 1;

                colorMap[colorKey] = (colorMap[colorKey] || 0) + weight;
            }

            // Tìm màu có tần suất cao nhất
            let maxWeight = 0;
            let dominantColor = '#6c5ce7';

            for (const [color, weight] of Object.entries(colorMap)) {
                if (weight > maxWeight) {
                    maxWeight = weight;
                    dominantColor = color;
                }
            }

            return {
                color: dominantColor,
                algorithm: 'colorThief',
                confidence: maxWeight / totalWeight,
                colorMap: colorMap
            };
        }

        /**
         * Kiểm tra màu có trong khoảng
         */
        isInRange(color, min, max) {
            return color[0] >= min[0] && color[0] <= max[0] &&
                   color[1] >= min[1] && color[1] <= max[1] &&
                   color[2] >= min[2] && color[2] <= max[2];
        }

        /**
         * Chọn kết quả tốt nhất từ các algorithms
         */
        selectBestResult(results, options) {
            const preferences = options.algorithmPreference || [
                'traditionalAccent',
                'vibrantDominant',
                'materialYou',
                'colorThief'
            ];

            // Lọc các kết quả hợp lệ
            const validResults = Object.entries(results)
                .filter(([_, result]) => result && MonetAPI.isValidColor(result.color))
                .map(([algorithm, result]) => ({ algorithm, ...result }));

            if (validResults.length === 0) {
                return {
                    color: '#6c5ce7',
                    algorithm: 'fallback',
                    confidence: 0,
                    error: 'No valid colors found'
                };
            }

            // Sắp xếp theo preferences và confidence
            validResults.sort((a, b) => {
                const aIndex = preferences.indexOf(a.algorithm);
                const bIndex = preferences.indexOf(b.algorithm);

                if (aIndex !== bIndex) {
                    return aIndex - bIndex;
                }

                return b.confidence - a.confidence;
            });

            return validResults[0];
        }
    }

    // ==================== MAIN ANALYZER CLASS ====================

    class AdvancedColorAnalyzer {
        constructor() {
            this.corsHandler = new CORSImageHandler();
            this.processingPipeline = new ImageProcessingPipeline();
            this.analysisEngine = new ColorAnalysisEngine();
            this.isInitialized = false;
        }

        /**
         * Khởi tạo analyzer
         */
        async initialize() {
            if (this.isInitialized) return;

            try {
                await this.corsHandler.initializeServiceWorker();
                this.isInitialized = true;
                debugLog('Advanced Color Analyzer initialized successfully');
            } catch (error) {
                debugLog('Initialization failed:', error);
                throw error;
            }
        }

        /**
         * Phân tích màu từ URL ảnh
         */
        async analyzeImage(imageUrl, options = {}) {
            const startTime = performance.now();

            if (!this.isInitialized) {
                await this.initialize();
            }

            try {
                // Bước 1: Xử lý CORS và tải ảnh
                const img = await this.corsHandler.handleImage(imageUrl, options);

                // Bước 2: Xử lý ảnh với pipeline
                const processedData = await this.processingPipeline.processImage(img, options);

                // Bước 3: Phân tích màu với multiple algorithms
                const analysisResult = await this.analysisEngine.analyzeColors(
                    processedData.samples,
                    options
                );

                // Đảm bảo tổng thời gian < 100ms
                const totalTime = performance.now() - startTime;
                if (totalTime > PERFORMANCE_TARGET) {
                    debugLog(`Warning: Performance target exceeded (${totalTime}ms > ${PERFORMANCE_TARGET}ms)`);
                }

                return {
                    dominantColor: analysisResult.color,
                    palette: analysisResult.palette || MonetAPI.generateMonetPalette(analysisResult.color),
                    isLight: MonetAPI.isColorLight(analysisResult.color),
                    algorithmUsed: analysisResult.algorithm,
                    confidence: analysisResult.confidence,
                    processingTime: totalTime,
                    metadata: {
                        originalDimensions: { width: img.width, height: img.height },
                        processedDimensions: processedData.dimensions,
                        sampleCount: processedData.sampleCount
                    }
                };

            } catch (error) {
                debugLog('Analysis failed:', error);
                throw error;
            }
        }

        /**
         * Phân tích với fallback strategies
         */
        async analyzeImageWithFallback(imageUrl, fallbackStrategies = []) {
            const defaultStrategies = [
                { algorithmPreference: ['traditionalAccent', 'vibrantDominant'] },
                { algorithmPreference: ['materialYou', 'colorThief'] },
                { algorithmPreference: ['vibrantDominant', 'traditionalAccent'] },
                {} // Sử dụng default options
            ];

            const strategies = [...fallbackStrategies, ...defaultStrategies];

            for (let i = 0; i < strategies.length; i++) {
                try {
                    const options = strategies[i];
                    const result = await this.analyzeImage(imageUrl, options);

                    if (result && MonetAPI.isValidColor(result.dominantColor)) {
                        debugLog(`Success with strategy ${i + 1}`);
                        return result;
                    }
                } catch (error) {
                    debugLog(`Strategy ${i + 1} failed:`, error);
                    continue;
                }
            }

            // Nếu tất cả strategies đều thất bại
            throw new Error('All fallback strategies failed');
        }

        /**
         * Utility methods
         */
        isValidColor(color) {
            return MonetAPI.isValidColor(color);
        }

        generateMonetPalette(baseColor) {
            return MonetAPI.generateMonetPalette(baseColor);
        }

        isColorLight(color) {
            return MonetAPI.isColorLight(color);
        }

        /**
         * Cleanup resources
         */
        cleanup() {
            this.corsHandler.cleanup();
            this.processingPipeline.cleanup();
            debugLog('Advanced Color Analyzer cleaned up');
        }
    }

    // ==================== EXPORT ====================

    window.AdvancedColorAnalyzer = AdvancedColorAnalyzer;

    debugLog('Advanced Color Analyzer module loaded');

})();