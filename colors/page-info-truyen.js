(function() {
    'use strict';

    function debugLog(...args) {
        if (window.HakoMonetConfig && window.HakoMonetConfig.isDebugEnabled()) {
            console.log('[PageInfoTruyen]', ...args);
        }
    }
    
    function initPageInfoTruyen() {
        // Kiểm tra xem có phải trang chi tiết truyện không
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        if (pathParts.length < 2 || !['truyen', 'sang-tac', 'ai-dich'].includes(pathParts[0])) {
            debugLog('Đây không phải trang chi tiết truyện, bỏ qua tính năng đổi màu.');
            return;
        }
        
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
        
        // Thêm hiệu ứng thumbnail mờ dần
        addThumbnailFadeEffect(coverUrl);
        
        // Thêm CSS cho phần trên của feature-section trong suốt
        addTransparentTopCSS();
        
        // Phân tích màu từ ảnh bìa
        analyzeImageColorWithHairFocus(coverUrl)
            .then(dominantColor => {
                debugLog('Màu chủ đạo (ưu tiên tóc):', dominantColor);
                
                if (!isValidColor(dominantColor)) {
                    debugLog('Màu không hợp lệ, sử dụng màu mặc định');
                    applyDefaultColorScheme();
                    return;
                }
                
                // Gọi API Monet để tạo palette
                const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                debugLog('Monet Palette:', monetPalette);
                
                const isLightColor = MonetAPI.isColorLight(dominantColor);
                debugLog('Màu sáng?', isLightColor);
                
                applyMonetColorScheme(monetPalette, isLightColor);
            })
            .catch(error => {
                debugLog('Lỗi khi phân tích ảnh:', error);
                applyDefaultColorScheme();
            });
    }
    
    function isValidColor(color) {
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
    
    // Hàm phân tích ảnh với focus vào màu tóc
    function analyzeImageColorWithHairFocus(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = function() {
                debugLog('Ảnh đã tải xong, kích thước:', img.width, 'x', img.height);
                try {
                    const dominantColor = getHairColorFromImage(img);
                    resolve(dominantColor);
                } catch (error) {
                    reject('Lỗi khi phân tích ảnh: ' + error);
                }
            };
            
            img.onerror = function() {
                reject('Không thể tải ảnh');
            };
            
            img.src = imageUrl;
        });
    }
    
    // Hàm lấy màu tóc từ ảnh (tối ưu hóa performance)
    function getHairColorFromImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Giảm kích thước canvas để tăng performance
        const maxSize = 150; // Giảm từ 200 xuống 150
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const width = Math.floor(img.width * scale);
        const height = Math.floor(img.height * scale);

        canvas.width = width;
        canvas.height = height;

        // Vẽ ảnh với kích thước đã scale
        ctx.drawImage(img, 0, 0, width, height);

        // Xác định vùng quan tâm (ROI) - tập trung vào phần trên của ảnh (nơi có tóc)
        const roi = {
            x: Math.floor(width * 0.25),      // Bắt đầu từ 25% chiều rộng
            y: Math.floor(height * 0.1),      // Bắt đầu từ 10% chiều cao (phía trên)
            width: Math.floor(width * 0.5),   // Lấy 50% chiều rộng ở giữa
            height: Math.floor(height * 0.4)  // Lấy 40% chiều cao (tập trung vào đầu/tóc)
        };

        // Lấy dữ liệu pixel từ vùng quan tâm
        const imageData = ctx.getImageData(roi.x, roi.y, roi.width, roi.height);
        const data = imageData.data;

        debugLog('Phân tích vùng quan tâm (ROI) cho màu tóc:');
        debugLog(`  - Vùng: x=${roi.x}, y=${roi.y}, width=${roi.width}, height=${roi.height}`);
        debugLog('  - Tổng pixel trong ROI:', data.length / 4);

        // Sử dụng Map để tăng performance thay vì object
        const colorCount = new Map();
        let maxCount = 0;
        let dominantColor = '#6c5ce7';

        // Danh sách màu tóc phổ biến (RGB ranges) - tối ưu hóa
        const commonHairColors = [
            {minR: 0, maxR: 50, minG: 0, maxG: 50, minB: 0, maxB: 50, weight: 1.5},     // Đen
            {minR: 80, maxR: 150, minG: 40, maxG: 100, minB: 0, maxB: 60, weight: 1.8}, // Nâu
            {minR: 150, maxR: 200, minG: 100, maxG: 150, minB: 50, maxB: 100, weight: 1.7}, // Nâu sáng
            {minR: 200, maxR: 255, minG: 150, maxG: 220, minB: 80, maxB: 180, weight: 1.6}, // Vàng
            {minR: 200, maxR: 255, minG: 80, maxG: 150, minB: 80, maxB: 150, weight: 1.9}, // Đỏ/hồng
            {minR: 100, maxR: 180, minG: 100, maxG: 180, minB: 150, maxB: 220, weight: 1.8}, // Xanh
            {minR: 150, maxR: 220, minG: 100, maxG: 180, minB: 150, maxB: 220, weight: 1.8}, // Tím
            {minR: 180, maxR: 255, minG: 180, maxG: 255, minB: 180, maxB: 255, weight: 1.4}  // Bạch kim
        ];

        // Sampling: chỉ xử lý 1/4 pixel để tăng performance
        const step = 8; // Mỗi bước 8 pixel (4 RGBA values)
        const totalPixels = data.length / 4;
        const sampleSize = Math.floor(totalPixels / 4); // 25% sampling

        for (let i = 0; i < data.length; i += step) {
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

            // Nhóm màu với quantization tốt hơn
            const roundedR = (r >> 3) << 3; // Bit shifting nhanh hơn Math.round
            const roundedG = (g >> 3) << 3;
            const roundedB = (b >> 3) << 3;

            // Tạo key hiệu quả hơn
            const colorKey = (roundedR << 16) | (roundedG << 8) | roundedB;

            // Tính trọng số dựa trên màu tóc phổ biến (tối ưu hóa)
            let weight = 1.0;
            for (const hairColor of commonHairColors) {
                if (roundedR >= hairColor.minR && roundedR <= hairColor.maxR &&
                    roundedG >= hairColor.minG && roundedG <= hairColor.maxG &&
                    roundedB >= hairColor.minB && roundedB <= hairColor.maxB) {
                    weight = hairColor.weight;
                    break;
                }
            }

            const weightedCount = Math.round(weight);
            const currentCount = colorCount.get(colorKey) || 0;
            const newCount = currentCount + weightedCount;

            colorCount.set(colorKey, newCount);

            if (newCount > maxCount) {
                maxCount = newCount;
                dominantColor = MonetAPI.rgbToHex(roundedR, roundedG, roundedB);
            }
        }

        debugLog('Màu tóc ưu tiên được chọn:', dominantColor);
        return dominantColor;
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
    
    function applyDefaultColorScheme() {
        const defaultColor = '#ff0000';
        const defaultPalette = MonetAPI.generateMonetPalette(defaultColor);
        
        if (!defaultPalette) {
            debugLog('Không thể tạo palette mặc định');
            return;
        }
        
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
                color: #fff !important;
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
        document.addEventListener('DOMContentLoaded', initPageInfoTruyen);
    } else {
        initPageInfoTruyen();
    }
})();
