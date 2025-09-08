(function() {
    'use strict';
    
    const DEBUG = true;

    function debugLog(...args) {
        if (DEBUG) {
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
        
        // Thiết lập lắng nghe thay đổi theme
        setupThemeChangeListener();
        
        // Phân tích màu từ ảnh bìa bằng module ImageAnalyzer
        ImageAnalyzer.analyzeImageColorWithHairFocus(coverUrl)
            .then(dominantColor => {
                debugLog('Màu chủ đạo (ưu tiên tóc):', dominantColor);
                
                if (!isValidColor(dominantColor)) {
                    debugLog('Màu không hợp lệ, sử dụng màu mặc định');
                    applyDefaultColorScheme();
                    return;
                }
                
                // Gọi API Monet để tạo palette với theme awareness
                const monetPalette = MonetAPI.generateThemeAwarePalette(dominantColor);
                debugLog('Monet Palette:', monetPalette);
                
                // Thêm CSS override cho theme
                addThemeOverrideCSS(monetPalette);
                
                applyMonetColorScheme(monetPalette);
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
    
    // Thiết lập lắng nghe thay đổi theme
    function setupThemeChangeListener() {
        if (window.ThemeDetector && typeof ThemeDetector.watchThemeChange === 'function') {
            ThemeDetector.watchThemeChange((newTheme) => {
                debugLog(`Theme changed to: ${newTheme}`);
                // Reload để áp dụng palette mới
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            });
            debugLog('Đã thiết lập lắng nghe thay đổi theme');
        }
    }
    
    // Thêm CSS override cho theme
    function addThemeOverrideCSS(palette) {
        if (!palette) return;
        
        GM_addStyle(`
            /* Light mode overrides - white base with subtle tint */
            body:not(.dark) {
                --monet-bg-primary: ${palette[50]} !important;    /* Subtle tinted surface */
                --monet-bg-secondary: ${palette[100]} !important;  /* Slightly more tinted */
                --monet-text-primary: #000000 !important;
                --monet-text-secondary: #333333 !important;
            }

            body:not(.dark) .basic-section,
            body:not(.dark) .board-list,
            body:not(.dark) .feature-section,
            body:not(.dark) .detail-list {
                background-color: var(--monet-bg-primary) !important;  /* Use more subtle tint */
                color: var(--monet-text-primary) !important;
                border-color: ${palette[200]} !important;  /* Lighter border */
            }

            body:not(.dark) .series-title,
            body:not(.dark) .series-authors,
            body:not(.dark) .series-artists,
            body:not(.dark) .series-description {
                color: var(--monet-text-primary) !important;
            }

            body:not(.dark) .tag-item {
                background-color: ${palette[200]} !important;
                color: var(--monet-text-primary) !important;
                border-color: ${palette[300]} !important;
            }

            body:not(.dark) .text-slate-500 {
                color: ${palette[700]} !important;  /* Use darker tone for better contrast */
            }

            /* Dark mode overrides - ensure text stays light */
            body.dark {
                --monet-text-primary: #ffffff !important;
                --monet-text-secondary: #cccccc !important;
                color: #ffffff !important;
            }

            /* Force light text on dark backgrounds in dark mode */
            body.dark * {
                color: inherit;
            }

            body.dark .series-title,
            body.dark .series-authors,
            body.dark .series-artists,
            body.dark .series-description,
            body.dark .tag-item,
            body.dark .text-slate-500,
            body.dark .long-text a,
            body.dark .paging_item,
            body.dark .ln-comment-form input.button,
            body.dark .feature-section .series-type,
            body.dark .navbar-logo-wrapper .navbar-logo {
                color: #ffffff !important;
            }

            /* Ensure links stay visible in dark mode */
            body.dark a:hover,
            body.dark .long-text a:hover {
                color: ${palette[300]} !important;
            }
        `);
        
        debugLog('Đã thêm CSS override cho theme');
    }
    
    // Hàm áp dụng Monet color scheme
    function applyMonetColorScheme(palette) {
        if (!palette) {
            applyDefaultColorScheme();
            return;
        }
        
        // Xác định màu text dựa trên theme
        const textColor = MonetAPI.getThemeAwareTextColor(palette[500]);
        const isDarkMode = window.ThemeDetector ? window.ThemeDetector.isDarkMode() : true;
        
        const css = `
            :root {
                --monet-primary: ${palette[500]};
                --monet-primary-light: ${palette[400]};
                --monet-primary-dark: ${palette[600]};
                --monet-surface: ${palette[50]};
                --monet-surface-dark: ${palette[100]};
                --monet-background: ${palette[10]};
                --monet-background-dark: ${palette[50]};
                --monet-elevated: ${palette[0]};
                --monet-elevated-dark: ${palette[50]};
                --monet-text-primary: ${textColor};
            }
            
            body {
                color: var(--monet-text-primary) !important;
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
                color: var(--monet-text-primary) !important;
            }
            
            .series-type,
            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${palette[500]} !important;
            }
            
            .series-type,
            .ln-comment-form input.button {
                color: var(--monet-text-primary) !important;
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
                background-color: ${palette[900]} !important;  /* Less dark background */
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
                background-color: ${palette[800]} !important;  /* Lighter surface */
                border-color: ${palette[800]} ${palette[900]} ${palette[900]} !important;
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

            /* Additional dark mode text color fixes */
            body.dark .series-title,
            body.dark .series-authors,
            body.dark .series-artists,
            body.dark .series-description,
            body.dark .tag-item,
            body.dark .text-slate-500,
            body.dark .long-text a,
            body.dark .paging_item,
            body.dark .ln-comment-form input.button,
            body.dark .feature-section .series-type,
            body.dark .navbar-logo-wrapper .navbar-logo {
                color: #ffffff !important;
            }

            /* Ensure all text elements are visible in dark mode */
            body.dark h1, body.dark h2, body.dark h3, body.dark h4, body.dark h5, body.dark h6,
            body.dark p, body.dark span, body.dark div, body.dark li, body.dark td, body.dark th {
                color: inherit !important;
            }
        `;
        
        GM_addStyle(css);
        debugLog('Đã áp dụng Monet theme với màu chủ đạo:', palette[500]);
    }
    
    function applyDefaultColorScheme() {
        const defaultColor = '#6c5ce7';
        const defaultPalette = MonetAPI.generateThemeAwarePalette(defaultColor);
        
        if (!defaultPalette) {
            debugLog('Không thể tạo palette mặc định');
            return;
        }
        
        const textColor = MonetAPI.getThemeAwareTextColor(defaultColor);
        
        const css = `
            :root {
                --monet-primary: ${defaultColor};
                --monet-text-primary: ${textColor};
            }
            
            body {
                color: var(--monet-text-primary) !important;
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
                color: var(--monet-text-primary) !important;
            }
            
            .series-type,
            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${defaultColor} !important;
            }
            
            .series-type,
            .ln-comment-form input.button {
                color: var(--monet-text-primary) !important;
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
                background-color: ${defaultPalette[900]} !important;  /* Less dark background */
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
                background-color: ${defaultPalette[800]} !important;  /* Lighter surface */
                border-color: ${defaultPalette[800]} ${defaultPalette[900]} ${defaultPalette[900]} !important;
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

            /* Additional dark mode text color fixes for default scheme */
            body.dark .series-title,
            body.dark .series-authors,
            body.dark .series-artists,
            body.dark .series-description,
            body.dark .tag-item,
            body.dark .text-slate-500,
            body.dark .long-text a,
            body.dark .paging_item,
            body.dark .ln-comment-form input.button,
            body.dark .feature-section .series-type,
            body.dark .navbar-logo-wrapper .navbar-logo {
                color: #ffffff !important;
            }

            /* Ensure all text elements are visible in dark mode for default scheme */
            body.dark h1, body.dark h2, body.dark h3, body.dark h4, body.dark h5, body.dark h6,
            body.dark p, body.dark span, body.dark div, body.dark li, body.dark td, body.dark th {
                color: inherit !important;
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
