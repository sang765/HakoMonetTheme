(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('pageProfile', ...args);
        } else if (DEBUG) {
            console.log('[PageProfile]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    function initPageProfile() {
        debugLog('initPageProfile called for DARK mode');

        // Check if in dark mode
        const isDarkMode = document.cookie.includes('night_mode=true');
        if (!isDarkMode) {
            debugLog('In light mode, skipping dark theme application');
            return;
        }

        // Check if this is a profile page
        const isProfilePage = document.querySelector('main.profile-page') !== null;
        if (!isProfilePage) {
            debugLog('Not a profile page, skipping profile color application');
            return;
        }

        debugLog('Applying profile color theme for DARK mode');

        // Setup CORS handling for images
        setupImageCorsHandling();

        // Kiểm tra chế độ màu profile
        const profileColorMode = window.HMTConfig && window.HMTConfig.getProfileColorMode ?
            window.HMTConfig.getProfileColorMode() : 'default';

        debugLog('Profile color mode:', profileColorMode);

        // Nếu chế độ là default, áp dụng màu từ config
        if (profileColorMode === 'default') {
            debugLog('Profile color mode is default, applying config color');
            applyConfigColor();
            return;
        }

        // Áp dụng màu từ avatar hoặc banner dựa trên chế độ
        if (profileColorMode === 'avatar') {
            debugLog('Profile color mode is avatar, applying avatar color');
            applyAvatarColorScheme();
        } else if (profileColorMode === 'banner') {
            debugLog('Profile color mode is banner, applying banner color');
            applyBannerColorScheme();
        } else {
            debugLog('Unknown profile color mode, falling back to config color');
            applyConfigColor();
        }

        // Lắng nghe sự kiện màu sắc thay đổi để cập nhật real-time
        (window.top || window).document.addEventListener('hmtColorChanged', function(event) {
            debugLog('Nhận sự kiện màu sắc thay đổi:', event.detail);

            // Check if in dark mode
            const isDarkMode = document.cookie.includes('night_mode=true');
            if (!isDarkMode) {
                debugLog('In light mode, skipping color application');
                return;
            }

            // Check if still on profile page
            const isProfilePage = document.querySelector('main.profile-page') !== null;
            if (!isProfilePage) {
                debugLog('No longer on profile page, skipping');
                return;
            }

            // Kiểm tra chế độ màu profile
            const profileColorMode = window.HMTConfig && window.HMTConfig.getProfileColorMode ?
                window.HMTConfig.getProfileColorMode() : 'default';

            // Chỉ áp dụng màu thực sự nếu không phải preview mode
            if (!event.detail.isPreview && profileColorMode === 'default') {
                // Đợi một chút để đảm bảo màu đã được lưu vào storage
                setTimeout(() => {
                    applyConfigColor();
                }, 100);
            } else if (event.detail.isPreview) {
                // Nếu là preview mode, áp dụng màu ngay lập tức
                const previewColor = event.detail.color;
                if (previewColor && isValidColor(previewColor)) {
                    const monetPalette = MonetAPI.generateMonetPalette(previewColor);
                    const isLightColor = MonetAPI.isColorLight(previewColor);
                    applyMonetColorScheme(monetPalette, isLightColor);
                }
            }
        });

        // Lắng nghe sự kiện profile color mode thay đổi
        (window.top || window).document.addEventListener('hmtProfileColorModeChanged', function(event) {
            const newMode = event.detail.mode;
            debugLog('Nhận sự kiện profile color mode thay đổi:', newMode);

            // Check if in dark mode
            const isDarkMode = document.cookie.includes('night_mode=true');
            if (!isDarkMode) {
                debugLog('In light mode, skipping color application');
                return;
            }

            // Check if still on profile page
            const isProfilePage = document.querySelector('main.profile-page') !== null;
            if (!isProfilePage) {
                debugLog('No longer on profile page, skipping');
                return;
            }

            // Áp dụng lại màu dựa trên chế độ mới
            if (newMode === 'avatar') {
                applyAvatarColorScheme();
            } else if (newMode === 'banner') {
                applyBannerColorScheme();
            } else {
                applyConfigColor();
            }
        });
    }

    function applyConfigColor() {
        const defaultColor = window.HMTConfig && window.HMTConfig.getDefaultColor ?
            window.HMTConfig.getDefaultColor() : '#063c30';

        debugLog('Áp dụng màu từ config:', defaultColor);

        if (!isValidColor(defaultColor)) {
            debugLog('Màu không hợp lệ, sử dụng màu mặc định');
            applyDefaultColorScheme();
            return;
        }

        // Tạo Monet palette từ màu config
        const monetPalette = MonetAPI.generateMonetPalette(defaultColor);
        debugLog('Monet Palette từ config:', monetPalette);

        const isLightColor = MonetAPI.isColorLight(defaultColor);
        debugLog('Màu sáng?', isLightColor);

        applyMonetColorScheme(monetPalette, isLightColor);
    }

    // Hàm áp dụng màu từ avatar
    function applyAvatarColorScheme() {
        debugLog('Bắt đầu trích xuất màu từ avatar profile');

        // Áp dụng màu mặc định trước để tránh tải chậm
        applyConfigColor();

        // Tìm avatar element trên profile page
        const avatarElement = document.querySelector('.profile-ava img');
        debugLog('Profile avatar element found:', !!avatarElement);
        if (avatarElement) {
            debugLog('Profile avatar element src:', avatarElement.src);
        }

        if (!avatarElement) {
            debugLog('Không tìm thấy avatar element trên profile page, fallback về màu config');
            applyConfigColor();
            return;
        }

        const avatarSrc = avatarElement.src;
        if (!avatarSrc) {
            debugLog('Avatar không có src, fallback về màu config');
            applyConfigColor();
            return;
        }

        debugLog('Tìm thấy avatar src:', avatarSrc);

        // Phân tích màu từ avatar
        analyzeImageColorTraditionalAccent(avatarSrc)
            .then(dominantColor => {
                debugLog('Màu chủ đạo từ avatar profile:', dominantColor);

                if (!isValidColor(dominantColor)) {
                    debugLog('Màu từ avatar không hợp lệ, fallback về màu config');
                    applyConfigColor();
                    return;
                }

                const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                const isLightColor = MonetAPI.isColorLight(dominantColor);
                applyMonetColorScheme(monetPalette, isLightColor);
            })
            .catch(error => {
                debugLog('Lỗi khi phân tích màu từ avatar profile:', error);
                applyConfigColor(); // Fallback to config color
            });
    }

    // Hàm áp dụng màu từ banner
    function applyBannerColorScheme() {
        debugLog('Bắt đầu trích xuất màu từ banner profile');

        // Áp dụng màu mặc định trước để tránh tải chậm
        applyConfigColor();

        // Tìm banner element trên profile page
        const bannerElement = document.querySelector('.profile-cover .content');
        debugLog('Profile banner element found:', !!bannerElement);
        if (bannerElement) {
            debugLog('Profile banner element style:', bannerElement.style.backgroundImage);
        }

        if (!bannerElement) {
            debugLog('Không tìm thấy banner element trên profile page, fallback về màu config');
            applyConfigColor();
            return;
        }

        const backgroundImage = bannerElement.style.backgroundImage;
        if (!backgroundImage || !backgroundImage.includes('url(')) {
            debugLog('Banner không có background image, fallback về màu config');
            applyConfigColor();
            return;
        }

        // Extract URL from background-image
        const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i);
        if (!urlMatch) {
            debugLog('Không thể extract URL từ background-image, fallback về màu config');
            applyConfigColor();
            return;
        }

        const bannerSrc = urlMatch[1];
        debugLog('Tìm thấy banner src:', bannerSrc);

        // Phân tích màu từ banner
        analyzeImageColorTraditionalAccent(bannerSrc)
            .then(dominantColor => {
                debugLog('Màu chủ đạo từ banner profile:', dominantColor);

                if (!isValidColor(dominantColor)) {
                    debugLog('Màu từ banner không hợp lệ, fallback về màu config');
                    applyConfigColor();
                    return;
                }

                const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                const isLightColor = MonetAPI.isColorLight(dominantColor);
                applyMonetColorScheme(monetPalette, isLightColor);
            })
            .catch(error => {
                debugLog('Lỗi khi phân tích màu từ banner profile:', error);
                applyConfigColor(); // Fallback to config color
            });
    }

    function isValidColor(color) {
        return MonetAPI.isValidColor(color);
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
                    return originalSrcDescriptor.set.call(this, value);
                },
                get: protoDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }

        window.__imageCorsSetup = true;
        debugLog('Integrated CORS handling for images is ready');
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

                // Fallback: try using GM_xmlhttpRequest (CORS bypass)
                if (isTargetDomain(imageUrl)) {
                    debugLog('Thử tải ảnh bằng GM_xmlhttpRequest (CORS bypass)');
                    loadImageWithXHR(imageUrl)
                        .then(img => {
                            try {
                                const dominantColor = getTraditionalAccentColorFromImage(img);
                                resolve(dominantColor);
                            } catch (error) {
                                reject('Lỗi khi phân tích ảnh từ GM_xmlhttpRequest: ' + error);
                            }
                        })
                        .catch(xhrError => {
                            debugLog('GM_xmlhttpRequest cũng thất bại:', xhrError);
                            reject('Không thể tải ảnh bằng cả Image API và GM_xmlhttpRequest');
                        });
                } else {
                    reject('Không thể tải ảnh');
                }
            };

            img.src = imageUrl;
        });
    }

    // Fallback function to load image using GM_xmlhttpRequest (bypasses CORS)
    function loadImageWithXHR(imageUrl) {
        return new Promise((resolve, reject) => {
            debugLog('Sending GM_xmlhttpRequest to:', imageUrl);
            GM_xmlhttpRequest({
                method: 'GET',
                url: imageUrl,
                responseType: 'blob',
                onload: function(response) {
                    if (response.status === 200) {
                        const blob = response.response;
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = () => reject('Không thể tạo ảnh từ blob');
                        img.src = URL.createObjectURL(blob);
                    } else {
                        reject('GM_xmlhttpRequest failed with status: ' + response.status);
                    }
                },
                onerror: function(error) {
                    reject('GM_xmlhttpRequest network error: ' + error);
                }
            });
        });
    }

    // Hàm lấy màu accent truyền thống từ ảnh
    function getTraditionalAccentColorFromImage(img) {
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
        let dominantColor = '#063c30'; // Màu mặc định

        // Phạm vi màu accent truyền thống (loại bỏ màu quá sáng và quá tối)
        const traditionalAccentRanges = [
            // Màu đỏ
            {min: [120, 0, 0], max: [255, 100, 100], weight: 1.8},
            // Màu cam
            {min: [200, 80, 0], max: [255, 165, 50], weight: 1.7},
            // Màu vàng (không quá sáng)
            {min: [180, 150, 0], max: [240, 220, 100], weight: 1.5},
            // Màu xanh lá
            {min: [0, 100, 0], max: [100, 255, 100], weight: 1.6},
            // Màu xanh dương
            {min: [0, 0, 120], max: [100, 100, 255], weight: 1.8},
            // Màu tím
            {min: [100, 0, 100], max: [200, 100, 200], weight: 1.7},
            // Màu hồng
            {min: [200, 100, 150], max: [255, 180, 200], weight: 1.6}
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
            if (brightness > 240 || brightness < 15) {
                continue;
            }

            // LOẠI BỎ màu xám (khi các kênh màu gần bằng nhau)
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;

            // Bỏ qua màu có độ bão hòa thấp (màu xám)
            if (saturation < 30) {
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

            // Giảm trọng số cho màu có độ bão hòa thấp
            const normalizedSaturation = saturation / 255;
            weight *= (0.5 + normalizedSaturation * 0.5);

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
        let mostSaturatedColor = '#063c30';

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 2];

            if (a < 128) continue;

            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;

            // Bỏ qua màu quá sáng/quá tối
            const brightness = (r + g + b) / 3;
            if (brightness > 240 || brightness < 15) continue;

            if (saturation > maxSaturation) {
                maxSaturation = saturation;
                mostSaturatedColor = MonetAPI.rgbToHex(r, g, b);
            }
        }

        return mostSaturatedColor;
    }

    // Hàm áp dụng Monet color scheme (giống như trong page-general-dark.js)
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
                --monet-text-primary: ${textColor};
            }

            /* Faster transitions for interactive elements */
            a, button, .navbar-menu, .nav-submenu, .noti-sidebar, .account-sidebar {
                transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease !important;
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

            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${palette[500]} !important;
            }

            .ln-comment-form input.button,
            .series-users .series-owner_name a,
            .series-users .user-role {
                color: ${textColor} !important;
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
                background-color: ${palette[800]} !important;
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
            #mainpart.at-index,
            .a6-ratio {
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
            .private-tabs header,
            .comment_toolkit {
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
            .mobile-more:hover,
            .summary-more.less-state .see_more:hover,
            [class="sub-index-style js-tongtien"] [class="select-wrapper"] {
                color: ${palette[500]} !important;
            }

            .licensed-list-page #search-by-month {
                border-left: 4px solid ${palette[500]} !important;
                border-left-color: ${palette[500]};
            }

            [type="checkbox"], [type="radio"] {
                color: ${palette[500]} !important;
            }

            .expand, .mobile-more, .summary-more.more-state {
                background: linear-gradient(180deg, rgba(31,31,31,0) 1%, ${palette[800]} 75%, ${palette[800]}) !important;
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

            /* Additional styles for general pages */
            .bottom-part.at-index {
                background-color: ${palette[1000]} !important;
                border-bottom: 1px solid ${palette[800]} !important;
                border-top: 1px solid ${palette[800]} !important;
            }

            .navbar-search .search-input {
                background-color: ${palette[900]} !important;
            }

            table.listext-table tr:nth-child(2n+1) {
                background-color: ${palette[700]} !important;
            }

            table.listext-table {
                background-color: ${palette[800]} !important;
            }

            table.broad-table tr th, table.broad-table tr:nth-child(2n+1) {
                background-color: ${palette[700]} !important;
            }

            table.broad-table tr:hover {
                background-color: ${palette[600]} !important;
            }

            .ln-list-option li {
                background-color: ${palette[700]} !important;
            }

            .ln-list-option li:hover {
                background-color: ${palette[600]} !important;
            }

            .action-link:hover {
                color: ${palette[500]} !important;
                text-decoration: underline !important;
            }

            .user-private-tabs li.current {
                border-left-color: ${palette[500]} !important;
                color: ${palette[500]} !important;
            }

            table.listext-table .update-status.no-chapters {
                background-color: ${palette[500]} !important;
                border-color: ${palette[700]} !important;
                font-weight: 400 !important;
            }

            .daily-recent_views .top-tab_title.title-active {
                background-color: ${palette[600]} !important;
            }

            .sts-bold {
                background-color: ${palette[600]} !important;
            }

            .filters-wrapper {
                background-color: ${palette[900]} !important;
            }

            [type="date"], [type="email"], [type="number"], [type="password"], [type="tel"], [type="text"], select, select.form-control {
                background-color: ${palette[700]} !important;
                border-color: ${palette[600]} !important;
                color: ${textColor} !important;
            }

            .sub-index-style .section-title {
                background-color: ${palette[700]} !important;
                border: none !important;
                color: ${textColor} !important;
            }

            .browse-alphabet .current {
                background-color: ${palette[400]} !important;
                color: ${textColor} !important;
            }

            .hover\\:bg-green-700:hover {
                background-color: ${palette[600]} !important;
            }

            .pagination_wrap .current {
                background-color: ${palette[600]} !important;
                color: ${textColor} !important;
            }

            .paging_item {
                color: ${palette[400]} !important;
            }

            .button-green {
                background-color: ${palette[400]} !important;
                border-color: ${palette[600]} !important;
                color: ${textColor} !important;
            }
            .button-green:hover {
                background-color: ${textColor} !important;
                border-color: ${palette[600]} !important;
                color: ${palette[400]} !important;
            }

            .button.to-contact.button-green:hover {
                background-color: ${textColor} !important;
                color: ${palette[400]} !important;
                border-color: ${palette[400]} !important;
            }

            .profile-nav {
                background-color: ${palette[800]} !important;
            }

            .bg-blue-600 {
                background-color: ${palette[500]} !important;
            }

            :is(.dark .dark\\:bg-gray-700) {
                background-color: ${palette[700]} !important;
            }

            ul.bookmarks_list li:nth-of-type(2n+1) {
                background-color: ${palette[700]} !important;
            }

            .page-title .page-name_wrapper .page-name i {
                color: ${palette[400]} !important;
            }

            .browse-section .pagination-footer, .has-pagination .pagination-footer {
                background-color: ${palette[1000]} !important;
            }

            body:not(.mce-content-body) {
                background-color: ${palette[900]} !important;
                color: ${palette[100]} !important;
            }

            table.listext-table tr th {
                background-color: ${palette[700]} !important;
                color: ${palette[300]} !important;
            }

            .user-private-tabs li:hover {
                background-color: ${palette[700]} !important;
            }

            table.listext-table tr:hover {
                background-color: ${palette[600]} !important;
            }

            .action-link {
                color: ${palette[500]} !important;
            }

            [data-theme="dark"] .navbar {
                background-color: ${palette[800]} !important;
            }

            .navbar-default .navbar-nav > .open > a, .navbar-default .navbar-nav > .open > a:hover, .navbar-default .navbar-nav > .open > a:focus {
                background-color: ${palette[100]} !important;
                color: ${palette[900]} !important;
            }

            [data-theme="dark"] .panel-default {
                border-color: ${palette[700]} !important;
            }

            [data-theme="dark"] .panel {
                background-color: ${palette[800]} !important;
            }

            .panel-default {
                border-color: ${palette[200]} !important;
            }

            [data-theme="dark"] .panel-default > .panel-heading {
                color: ${palette[100]} !important;
                background-color: ${palette[800]} !important;
                border-color: ${palette[700]} !important;
            }

            [data-theme="dark"] .panel-body {
                background-color: ${palette[800]} !important;
            }

            #drop a {
                background-color: ${palette[600]} !important;
                color: ${palette[100]} !important;
            }

            [data-theme="dark"] .btn-warning {
                color: ${palette[100]} !important;
                background-color: ${palette[600]} !important;
                border-color: ${palette[600]} !important;
            }

            .btn-warning {
                color: ${palette[100]} !important;
                background-color: ${palette[500]} !important;
                border-color: ${palette[400]} !important;
            }

            [data-theme="dark"] .btn-warning:hover {
                color: ${palette[100]} !important;
                background-color: ${palette[700]} !important;
                border-color: ${palette[700]} !important;
            }

            .btn-warning:hover, .btn-warning:focus, .btn-warning.focus, .btn-warning:active, .btn-warning.active, .open > .dropdown-toggle.btn-warning {
                color: ${palette[100]} !important;
                background-color: ${palette[600]} !important;
                border-color: ${palette[500]} !important;
            }

            [data-theme="dark"] .btn-primary {
                color: ${palette[100]} !important;
                background-color: ${palette[700]} !important;
                border-color: ${palette[700]} !important;
            }

            .btn-primary {
                color: ${palette[100]} !important;
                background-color: ${palette[500]} !important;
                border-color: ${palette[400]} !important;
            }

            [data-theme="dark"] .btn-primary:hover {
                color: ${palette[100]} !important;
                background-color: ${palette[800]} !important;
                border-color: ${palette[800]} !important;
            }

            .btn-primary:hover, .btn-primary:focus, .btn-primary.focus, .btn-primary:active, .btn-primary.active, .open > .dropdown-toggle.btn-primary {
                color: ${palette[100]} !important;
                background-color: ${palette[600]} !important;
                border-color: ${palette[500]} !important;
            }

            #drop a:hover {
                background-color: ${palette[700]} !important;
            }

            [data-theme="dark"] .alert-info {
                color: ${palette[100]} !important;
                background-color: ${palette[500]} !important;
                border-color: ${palette[500]} !important;
            }

            .alert-info {
                background-color: ${palette[100]} !important;
                border-color: ${palette[200]} !important;
                color: ${palette[800]} !important;
            }

            #mainpart.reading-page.style-6 #rd-side_icon {
                background-color: ${palette[800]} !important;
            }

            #rd-side_icon {
                border: 1px solid ${palette[500]} !important;
            }

            .rd_sd-button_item {
                border-bottom: 1px solid ${palette[500]} !important;
            }

            .rd_sidebar-header,
            .rd_sidebar-name small,
            .rd_sidebar-name h5 {
                background-color: ${palette[900]} !important;
            }

            .rd_sidebar main {
                background-color: ${palette[800]} !important;
            }

            .black-click {
                background-color: ${palette[900]} !important;
            }

            .rd_sidebar #chap_list li.current,
            .rd_sidebar #chap_list li a:hover {
                background-color: ${palette[600]} !important;
            }

            .section-content [class="filter-type_item"] a:hover {
                background-color: ${palette[300]} !important;
                border: 1px solid ${palette[600]} !important;
                color: ${palette[800]} !important;
            }

            .tippy-tooltip {
                background-color: ${palette[900]} !important;
                color: ${textColor} !important;
            }

            .tippy-tooltip[data-placement^="right"] > .tippy-arrow {
                border-right-color: ${palette[900]} !important;
            }

            :is(.dark .dark\\:ring-cyan-900) {
                --tw-ring-color: ${palette[800]} !important;
            }

            :is(.dark .dark\\:bg-zinc-900) {
                background-color: ${palette[900]};
            }

            :is(.dark .dark\\:bg-zinc-800) {
                background-color: ${palette[800]};
            }

            .button-blue {
              background-color: ${palette[500]};
              border-color: ${palette[700]};
              color: ${textColor};
            }

            .button-blue:hover {
                background-color: ${textColor};
                color: ${palette[500]};
            }

            .noti-unread {
              background-color: ${palette[500]};
              border-bottom: 1px solid ${palette[700]};
              color: ${textColor};
            }

            :is(.dark .dark\\:bg-gray-700) {
                background-color: ${palette[1000]} !important;
                border: 1px solid ${palette[800]} !important;
            }

            .profile-showcase header span.number {
                background-color: ${palette[800]} !important;
                color: ${textColor} !important;
            }

            .profile-showcase header, ol.list-volume li {
                border-bottom-color: ${palette[800]} !important;}

            .exp-bar-wrapper {
                background-color: var(--monet-surface-dark) !important;
            }
            .exp-bar {
                background-color: var(--monet-primary) !important;
            }
            .button.to-contact {
                background-color: var(--monet-primary) !important;
                color: var(--monet-text-primary) !important;
            }
            .pagination_wrap a.current, .pagination_wrap a:hover {
                background-color: var(--monet-primary) !important;
                color: var(--monet-text-primary) !important;
            }

            .button:hover {
                background-color: ${palette[200]} !important;
            }

            .bg-gray-200 {
                --tw-bg-opacity: 1;
                background-color: ${palette[200]} !important;
            }

            .text-blue-100 {
                --tw-text-opacity: 1;
                color: ${palette[100]} !important;
            }
        `;

        GM_addStyle(css);
        debugLog('Đã áp dụng Monet theme với màu từ profile:', palette[500]);
    }

    function applyDefaultColorScheme() {
        // Lấy màu mặc định từ config, fallback về màu cũ nếu không có
        const defaultColor = (window.HMTConfig && window.HMTConfig.getDefaultColor) ?
            window.HMTConfig.getDefaultColor() : '#063c30';
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
                color: ${textColor} !important;
            }

            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${defaultColor} !important;
            }

            .ln-comment-form input.button,
            .series-users .series-owner_name a,
            .series-users .user-role {
                color: ${textColor} !important;
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
                background-color: ${defaultPalette[800]} !important;
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
            #mainpart.at-index,
            .a6-ratio {
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
            .private-tabs header,
            .comment_toolkit {
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
            .mobile-more:hover,
            .summary-more.less-state .see_more:hover,
            [class="sub-index-style js-tongtien"] [class="select-wrapper"] {
                color: ${defaultColor} !important;
            }

            .licensed-list-page #search-by-month {
                border-left: 4px solid ${defaultColor} !important;
                border-left-color: ${defaultColor};
            }

            [type="checkbox"], [type="radio"] {
                color: ${defaultColor} !important;
            }

            .expand, .mobile-more, .summary-more.more-state {
                background: linear-gradient(180deg, rgba(31,31,31,0) 1%, ${defaultPalette[800]} 75%, ${defaultPalette[800]}) !important;
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

            /* Additional styles for general pages */
            .bottom-part.at-index {
                background-color: ${defaultPalette[1000]} !important;
                border-bottom: 1px solid ${defaultPalette[800]} !important;
                border-top: 1px solid ${defaultPalette[800]} !important;
            }

            .navbar-search .search-input {
                background-color: ${defaultPalette[900]} !important;
            }

            table.listext-table tr:nth-child(2n+1) {
                background-color: ${defaultPalette[700]} !important;
            }

            table.listext-table {
                background-color: ${defaultPalette[800]} !important;
            }

            table.broad-table tr th, table.broad-table tr:nth-child(2n+1) {
                background-color: ${defaultPalette[700]} !important;
            }

            table.broad-table tr:hover {
                background-color: ${defaultPalette[600]} !important;
            }

            .ln-list-option li {
                background-color: ${defaultPalette[700]} !important;
            }

            .ln-list-option li:hover {
                background-color: ${defaultPalette[600]} !important;
            }

            .action-link:hover {
                color: ${defaultColor} !important;
                text-decoration: underline !important;
            }

            .user-private-tabs li.current {
                border-left-color: ${defaultColor} !important;
                color: ${defaultColor} !important;
            }

            table.listext-table .update-status.no-chapters {
                background-color: ${defaultColor} !important;
                border-color: ${defaultPalette[700]} !important;
                font-weight: 400 !important;
            }

            .daily-recent_views .top-tab_title.title-active {
                background-color: ${defaultPalette[600]} !important;
            }

            .sts-bold {
                background-color: ${defaultPalette[600]} !important;
            }

            .filters-wrapper {
                background-color: ${defaultPalette[900]} !important;
            }

            [type="date"], [type="email"], [type="number"], [type="password"], [type="tel"], [type="text"], select, select.form-control {
                background-color: ${defaultPalette[700]} !important;
                border-color: ${defaultPalette[600]} !important;
                color: ${textColor} !important;
            }

            .sub-index-style .section-title {
                background-color: ${defaultPalette[700]} !important;
                border: none !important;
                color: ${textColor} !important;
            }

            .browse-alphabet .current {
                background-color: ${defaultPalette[400]} !important;
                color: ${textColor} !important;
            }

            .hover\\:bg-green-700:hover {
                background-color: ${defaultPalette[600]} !important;
            }

            .pagination_wrap .current {
                background-color: ${defaultPalette[600]} !important;
                color: ${textColor} !important;
            }

            .paging_item {
                color: ${defaultPalette[400]} !important;
            }

            .button-green {
                background-color: ${defaultPalette[400]} !important;
                border-color: ${defaultPalette[600]} !important;
                color: ${textColor} !important;
            }
            .button-green:hover {
                background-color: ${textColor} !important;
                border-color: ${defaultPalette[600]} !important;
                color: ${defaultPalette[400]} !important;
            }

            .button.to-contact.button-green:hover {
                background-color: ${textColor} !important;
                color: ${defaultPalette[400]} !important;
                border-color: ${defaultPalette[400]} !important;
            }

            .profile-nav {
                background-color: ${defaultPalette[800]} !important;
            }

            .bg-blue-600 {
                background-color: ${defaultColor} !important;
            }

            :is(.dark .dark\\:bg-gray-700) {
                background-color: ${defaultPalette[700]} !important;
            }

            ul.bookmarks_list li:nth-of-type(2n+1) {
                background-color: ${defaultPalette[700]} !important;
            }

            .page-title .page-name_wrapper .page-name i {
                color: ${defaultPalette[400]} !important;
            }

            .browse-section .pagination-footer, .has-pagination .pagination-footer {
                background-color: ${defaultPalette[1000]} !important;
            }

            body:not(.mce-content-body) {
                background-color: ${defaultPalette[900]} !important;
                color: ${defaultPalette[100]} !important;
            }

            table.listext-table tr th {
                background-color: ${defaultPalette[700]} !important;
                color: ${defaultPalette[300]} !important;
            }

            .user-private-tabs li:hover {
                background-color: ${defaultPalette[700]} !important;
            }

            table.listext-table tr:hover {
                background-color: ${defaultPalette[600]} !important;
            }

            .action-link {
                color: ${defaultColor} !important;
            }

            [data-theme="dark"] .navbar {
                background-color: ${defaultPalette[800]} !important;
            }

            .navbar-default .navbar-nav > .open > a, .navbar-default .navbar-nav > .open > a:hover, .navbar-default .navbar-nav > .open > a:focus {
                background-color: ${defaultPalette[100]} !important;
                color: ${defaultPalette[900]} !important;
            }

            [data-theme="dark"] .panel-default {
                border-color: ${defaultPalette[700]} !important;
            }

            [data-theme="dark"] .panel {
                background-color: ${defaultPalette[800]} !important;
            }

            .panel-default {
                border-color: ${defaultPalette[200]} !important;
            }

            [data-theme="dark"] .panel-default > .panel-heading {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[800]} !important;
                border-color: ${defaultPalette[700]} !important;
            }

            [data-theme="dark"] .panel-body {
                background-color: ${defaultPalette[800]} !important;
            }

            #drop a {
                background-color: ${defaultPalette[600]} !important;
                color: ${defaultPalette[100]} !important;
            }

            [data-theme="dark"] .btn-warning {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[600]} !important;
                border-color: ${defaultPalette[600]} !important;
            }

            .btn-warning {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[500]} !important;
                border-color: ${defaultPalette[400]} !important;
            }

            [data-theme="dark"] .btn-warning:hover {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[700]} !important;
                border-color: ${defaultPalette[700]} !important;
            }

            .btn-warning:hover, .btn-warning:focus, .btn-warning.focus, .btn-warning:active, .btn-warning.active, .open > .dropdown-toggle.btn-warning {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[600]} !important;
                border-color: ${defaultPalette[500]} !important;
            }

            [data-theme="dark"] .btn-primary {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[700]} !important;
                border-color: ${defaultPalette[700]} !important;
            }

            .btn-primary {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[500]} !important;
                border-color: ${defaultPalette[400]} !important;
            }

            [data-theme="dark"] .btn-primary:hover {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[800]} !important;
                border-color: ${defaultPalette[800]} !important;
            }

            .btn-primary:hover, .btn-primary:focus, .btn-primary.focus, .btn-primary:active, .btn-primary.active, .open > .dropdown-toggle.btn-primary {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[600]} !important;
                border-color: ${defaultPalette[500]} !important;
            }

            #drop a:hover {
                background-color: ${defaultPalette[700]} !important;
            }

            [data-theme="dark"] .alert-info {
                color: ${defaultPalette[100]} !important;
                background-color: ${defaultPalette[500]} !important;
                border-color: ${defaultPalette[500]} !important;
            }

            .alert-info {
                background-color: ${defaultPalette[100]} !important;
                border-color: ${defaultPalette[200]} !important;
                color: ${defaultPalette[800]} !important;
            }

            #mainpart.reading-page.style-6 #rd-side_icon {
                background-color: ${defaultPalette[800]} !important;
            }

            #rd-side_icon {
                border: 1px solid ${defaultPalette[500]} !important;
            }

            .rd_sd-button_item {
                border-bottom: 1px solid ${defaultPalette[500]} !important;
            }

            .rd_sidebar-header,
            .rd_sidebar-name small,
            .rd_sidebar-name h5 {
                background-color: ${defaultPalette[900]} !important;
            }

            .rd_sidebar main {
                background-color: ${defaultPalette[800]} !important;
            }

            .black-click {
                background-color: ${defaultPalette[900]} !important;
            }

            .rd_sidebar #chap_list li.current,
            .rd_sidebar #chap_list li a:hover {
                background-color: ${defaultPalette[600]} !important;
            }

            .section-content [class="filter-type_item"] a:hover {
                background-color: ${defaultPalette[300]} !important;
                border: 1px solid ${defaultPalette[600]} !important;
                color: ${defaultPalette[800]} !important;
            }

            .tippy-tooltip {
                background-color: ${defaultPalette[900]} !important;
                color: ${textColor} !important;
            }

            .tippy-tooltip[data-placement^="right"] > .tippy-arrow {
                border-right-color: ${defaultPalette[900]} !important;
            }

            :is(.dark .dark\\:ring-cyan-900) {
                --tw-ring-color: ${defaultPalette[800]} !important;
            }

            :is(.dark .dark\\:bg-zinc-900) {
                background-color: ${defaultPalette[900]};
            }

            :is(.dark .dark\\:bg-zinc-800) {
                background-color: ${defaultPalette[800]};
            }

            .button-blue {
              background-color: ${defaultPalette[500]};
              border-color: ${defaultPalette[700]};
              color: ${textColor};
            }

            .button-blue:hover {
                background-color: ${textColor};
                color: ${defaultPalette[500]};
            }

            .noti-unread {
              background-color: ${defaultPalette[500]};
              border-bottom: 1px solid ${defaultPalette[700]};
              color: ${textColor};
            }

            :is(.dark .dark\\:bg-gray-700) {
                background-color: ${defaultPalette[1000]} !important;
                border: 1px solid ${defaultPalette[800]} !important;
            }

            .profile-showcase header span.number {
                background-color: ${defaultPalette[800]} !important;
                color: ${textColor} !important;
            }

            .profile-showcase header, ol.list-volume li {
                border-bottom-color: ${defaultPalette[800]} !important;}
        `;

        GM_addStyle(css);
        debugLog('Đã áp dụng màu mặc định từ config:', defaultColor);
    }

    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageProfile);
    } else {
        initPageProfile();
    }
})();