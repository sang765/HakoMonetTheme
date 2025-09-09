(function() {
    'use strict';

    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[PageInfoTruyen]', ...args);
        }
    }

    // Chờ theme detector có sẵn
    function waitForThemeDetector() {
        return new Promise((resolve) => {
            if (window.ThemeDetector) {
                resolve();
                return;
            }

            const checkInterval = setInterval(() => {
                if (window.ThemeDetector) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout sau 5 giây
            setTimeout(() => {
                clearInterval(checkInterval);
                debugLog('Theme detector không khả dụng, tiếp tục mà không có nó');
                resolve();
            }, 5000);
        });
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    // Xử lý CORS tích hợp cho hình ảnh
    function setupImageCorsHandling() {
        if (window.__imageCorsSetup) return;

        debugLog('Thiết lập xử lý CORS tích hợp cho hình ảnh');

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
                            debugLog('Đã set crossOrigin cho hình ảnh:', value);
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
                        debugLog('Đã set crossOrigin cho hình ảnh hiện có:', value);
                    }
                    return originalSet.call(this, value);
                },
                get: protoDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }

        window.__imageCorsSetup = true;
        debugLog('Xử lý CORS tích hợp cho hình ảnh đã sẵn sàng');
    }
    
    async function initPageInfoTruyen() {
        // Kiểm tra xem có phải trang chi tiết truyện không
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        if (pathParts.length < 2 || !['truyen', 'sang-tac', 'ai-dich'].includes(pathParts[0])) {
            debugLog('Đây không phải trang chi tiết truyện, bỏ qua tính năng đổi màu.');
            return;
        }

        // Chờ theme detector có sẵn
        await waitForThemeDetector();

        // Phát hiện theme hiện tại
        const currentTheme = window.ThemeDetector ? window.ThemeDetector.getCurrentTheme() : 'light';
        const isDarkMode = currentTheme === 'dark';
        debugLog('Đã phát hiện theme website:', currentTheme);

        const coverElement = document.querySelector('.series-cover .img-in-ratio');
        if (!coverElement) {
            debugLog('Không tìm thấy ảnh bìa.');
            return;
        }

        const coverStyle = coverElement.style.backgroundImage;
        const coverUrl = coverStyle.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');

        if (!coverUrl) {
            debugLog('Không thể lấy URL ảnh bìa.');
            return;
        }

        debugLog('Đang phân tích màu từ ảnh bìa:', coverUrl);

        // Thêm hiệu ứng thumbnail mờ dần với khả năng nhận biết theme
        addThumbnailFadeEffect(coverUrl, isDarkMode);

        // Thêm CSS cho phần trên của feature-section trong suốt với khả năng nhận biết theme
        addTransparentTopCSS(isDarkMode);

        // Lưu trữ phân tích màu hiện tại để chuyển đổi theme
        let currentDominantColor = null;
        let currentPalette = null;
        let currentIsLightColor = null;

        // Phân tích màu từ ảnh bìa
        analyzeImageColorWithHairFocus(coverUrl)
            .then(dominantColor => {
                debugLog('Màu chủ đạo (ưu tiên tóc):', dominantColor);
                currentDominantColor = dominantColor;

                if (!isValidColor(dominantColor)) {
                    debugLog('Màu không hợp lệ, sử dụng màu mặc định');
                    applyDefaultColorScheme(isDarkMode);
                    return;
                }

                // Gọi API Monet để tạo palette
                const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                debugLog('Monet Palette:', monetPalette);
                currentPalette = monetPalette;

                const isLightColor = MonetAPI.isColorLight(dominantColor);
                debugLog('Màu sáng?', isLightColor);
                currentIsLightColor = isLightColor;

                applyMonetColorScheme(monetPalette, isLightColor, isDarkMode);
            })
            .catch(error => {
                debugLog('Lỗi khi phân tích ảnh:', error);
                applyDefaultColorScheme(isDarkMode);
            });

        // Lắng nghe thay đổi theme nếu theme detector có sẵn
        if (window.ThemeDetector) {
            window.ThemeDetector.onThemeChange((newTheme) => {
                debugLog('Theme đã thay đổi thành:', newTheme);
                const newIsDarkMode = newTheme === 'dark';

                // Áp dụng lại hiệu ứng với theme mới
                addThumbnailFadeEffect(coverUrl, newIsDarkMode);
                addTransparentTopCSS(newIsDarkMode);

                // Áp dụng lại color scheme nếu có dữ liệu
                if (currentPalette && currentIsLightColor !== null) {
                    applyMonetColorScheme(currentPalette, currentIsLightColor, newIsDarkMode);
                } else {
                    applyDefaultColorScheme(newIsDarkMode);
                }
            });
        }
    }
    
    function isValidColor(color) {
        return MonetAPI.isValidColor(color);
    }
    
    // Hàm thêm CSS cho phần trên của feature-section trong suốt
    function addTransparentTopCSS(isDarkMode) {
        const gradientColors = isDarkMode
            ? 'rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%'
            : 'rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.9) 100%';

        GM_addStyle(`
            .feature-section.at-series {
                background: transparent !important;
                border: none !important;
            }

            /* Xóa gradient mặc định */
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
                background: linear-gradient(to bottom, ${gradientColors});
                pointer-events: none;
                z-index: 1;
            }
        `);

        debugLog('Đã thêm CSS phần trên trong suốt cho theme:', isDarkMode ? 'dark' : 'light');
    }
    
    // Hàm thêm hiệu ứng thumbnail mờ dần
    function addThumbnailFadeEffect(coverUrl, isDarkMode) {
        // Tạo phần tử cho hiệu ứng nền
        const bgOverlay = document.createElement('div');
        bgOverlay.className = 'betterhako-bg-overlay';

        // Điều chỉnh độ sáng dựa trên theme
        const brightness = isDarkMode ? 0.5 : 0.7;

        // Thêm styles
        GM_addStyle(`
            .betterhako-bg-overlay {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 350px !important;
                z-index: -1 !important;
                background-image: url('${coverUrl}') !important;
                background-size: cover !important;
                background-position: center !important;
                filter: blur(12px) brightness(${brightness}) !important;
                mask-image: linear-gradient(to bottom, black 0%, transparent 100%) !important;
                -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%) !important;
                pointer-events: none !important;
            }

            #mainpart {
                position: relative !important;
                isolation: isolate !important;
            }

            #mainpart > .container {
                position: relative !important;
                z-index: 1 !important;
            }
        `);

        // Thêm phần tử vào DOM
        const mainPart = document.getElementById('mainpart');
        if (mainPart) {
            // Kiểm tra xem overlay đã tồn tại chưa để tránh thêm nhiều lần
            if (!document.querySelector('.betterhako-bg-overlay')) {
                mainPart.prepend(bgOverlay);
                debugLog('Đã thêm hiệu ứng thumbnail mờ dần cho theme:', isDarkMode ? 'dark' : 'light');
            }
        } else {
            debugLog('Không tìm thấy #mainpart');
        }
    }
    
    // Hàm phân tích ảnh với focus vào màu tóc
    function analyzeImageColorWithHairFocus(imageUrl) {
        return new Promise((resolve, reject) => {
            // Thiết lập xử lý CORS cho hình ảnh nếu cần
            if (isTargetDomain(imageUrl)) {
                debugLog('Ảnh từ domain target, thiết lập CORS handling');
                setupImageCorsHandling();
            }

            const img = new Image();

            // Luôn set crossOrigin để đảm bảo an toàn
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

                // Fallback: thử sử dụng XMLHttpRequest với CORS headers
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

    // Hàm dự phòng để tải hình ảnh bằng XMLHttpRequest với CORS headers
    function loadImageWithXHR(imageUrl) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', imageUrl, true);
            xhr.responseType = 'blob';

            // Thêm CORS headers cho target domains
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

            // Bỏ qua pixel quá sáng hoặc quá tối (có thể là nền)
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
    
    // Hàm áp dụng Monet color scheme
    function applyMonetColorScheme(palette, isLight, isDarkMode) {
        if (!palette) {
            applyDefaultColorScheme(isDarkMode);
            return;
        }

        const textColor = isLight ? '#000' : '#fff';
        const hoverTextColor = isDarkMode ? '#fff' : '#000';
        
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
                color: ${hoverTextColor} !important;
            }
            
            .series-type,
            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${palette[500]} !important;
            }
            
            .series-type,
            .ln-comment-form input.button {
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

            .summary-more.more-state:hover {
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
        `;
        
        GM_addStyle(css);
        debugLog('Đã áp dụng Monet theme với màu chủ đạo:', palette[500]);
    }
    
    function applyDefaultColorScheme(isDarkMode) {
        const defaultColor = '#ff0000';
        const defaultPalette = MonetAPI.generateMonetPalette(defaultColor);

        if (!defaultPalette) {
            debugLog('Không thể tạo palette mặc định');
            return;
        }

        const hoverTextColor = isDarkMode ? '#fff' : '#000';
        
        const css = `
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
                color: ${hoverTextColor} !important;
            }
            
            .series-type,
            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${defaultColor} !important;
            }
            
            .series-type,
            .ln-comment-form input.button {
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

            .summary-more.more-state:hover {
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
        `;
        
        GM_addStyle(css);
        debugLog('Đã áp dụng màu mặc định:', defaultColor);
    }
    
    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initPageInfoTruyen());
    } else {
        initPageInfoTruyen();
    }
})();
