(function() {
    'use strict';
    
    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[ImageAnalyzer]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    // Setup CORS handling for images
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

    // Hàm phân tích ảnh với focus vào màu tóc
    function analyzeImageColorWithHairFocus(imageUrl) {
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
                    const dominantColor = getHairColorFromImage(img);
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
                                const dominantColor = getHairColorFromImage(img);
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

    // Hàm lấy màu tóc từ ảnh
    function getHairColorFromImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Thiết lập kích thước canvas
        const width = 200;
        const height = 200;
        canvas.width = width;
        canvas.height = height;
        
        // Vẽ ảnh với kích thước nhỏ
        ctx.drawImage(img, 0, 0, width, height);
        
        // Xác định vùng quan tâm (ROI) - tập trung vào phần trên của ảnh (nơi có tóc)
        const roi = {
            x: width * 0.25,      // Bắt đầu từ 25% chiều rộng
            y: height * 0.1,      // Bắt đầu từ 10% chiều cao (phía trên)
            width: width * 0.5,   // Lấy 50% chiều rộng ở giữa
            height: height * 0.4  // Lấy 40% chiều cao (tập trung vào đầu/tóc)
        };
        
        // Lấy dữ liệu pixel từ vùng quan tâm
        const imageData = ctx.getImageData(roi.x, roi.y, roi.width, roi.height);
        const data = imageData.data;
        
        debugLog('Phân tích vùng quan tâm (ROI) cho màu tóc:');
        debugLog(`  - Vùng: x=${roi.x}, y=${roi.y}, width=${roi.width}, height=${roi.height}`);
        debugLog('  - Tổng pixel trong ROI:', data.length / 4);
        
        // Đếm màu với trọng số ưu tiên màu tóc
        const colorCount = {};
        let maxCount = 0;
        let dominantColor = '#6c5ce7';
        
        // Danh sách màu tóc phổ biến (RGB ranges)
        const commonHairColors = [
            {min: [0, 0, 0], max: [50, 50, 50], weight: 1.5},     // Đen
            {min: [80, 40, 0], max: [150, 100, 60], weight: 1.8}, // Nâu
            {min: [150, 100, 50], max: [200, 150, 100], weight: 1.7}, // Nâu sáng
            {min: [200, 150, 80], max: [255, 220, 180], weight: 1.6}, // Vàng
            {min: [200, 80, 80], max: [255, 150, 150], weight: 1.9}, // Đỏ/hồng
            {min: [100, 100, 150], max: [180, 180, 220], weight: 1.8}, // Xanh
            {min: [150, 100, 150], max: [220, 180, 220], weight: 1.8}, // Tím
            {min: [180, 180, 180], max: [255, 255, 255], weight: 1.4}  // Bạch kim
        ];
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Bỏ qua pixel trong suốt
            if (a < 128) continue;
            
            // Bỏ qua pixel quá sáng hoặc quá tối (cá thể là nền)
            if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
                continue;
            }
            
            // Nhóm màu
            const roundedR = Math.round(r / 8) * 8;
            const roundedG = Math.round(g / 8) * 8;
            const roundedB = Math.round(b / 8) * 8;
            
            const colorGroup = `${roundedR},${roundedG},${roundedB}`;
            
            // Tính trọng số dựa trên màu tóc phổ biến
            let weight = 1.0;
            for (const hairColor of commonHairColors) {
                if (roundedR >= hairColor.min[0] && roundedR <= hairColor.max[0] &&
                    roundedG >= hairColor.min[1] && roundedG <= hairColor.max[1] &&
                    roundedB >= hairColor.min[2] && roundedB <= hairColor.max[2]) {
                    weight = hairColor.weight;
                    break;
                }
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
        
        debugLog('Màu tóc ưu tiên được chọn:', dominantColor);
        return dominantColor;
    }

    // Public API
    window.ImageAnalyzer = {
        analyzeImageColorWithHairFocus,
        setupImageCorsHandling,
        isTargetDomain
    };

    debugLog('ImageAnalyzer module đã được tải');

})();
