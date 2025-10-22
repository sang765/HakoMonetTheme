(function() {
    'use strict';

    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[PageGeneral]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    function initPageGeneral() {
        // Kiểm tra xem có phải trang đọc truyện không và có tắt màu không
        if (document.querySelector('.rd-basic_icon.row') && window.HMTConfig && window.HMTConfig.getDisableColorsOnReadingPage && window.HMTConfig.getDisableColorsOnReadingPage()) {
            // Xóa overlay nếu có
            const targetElement = document.querySelector('.set-input.clear.justify-center');
            if (targetElement) {
                const overlay = targetElement.querySelector('.hmt-block-overlay');
                if (overlay) {
                    overlay.remove();
                    debugLog('Đã xóa overlay trên trang đọc truyện vì tính năng tắt màu được bật');
                }
            }
            debugLog('Phát hiện trang đọc truyện và tính năng tắt màu được bật, bỏ qua áp dụng màu.');
            return;
        }

        // Kiểm tra chế độ màu
        const colorMode = window.HMTConfig && window.HMTConfig.getColorMode ? window.HMTConfig.getColorMode() : 'default';

        // Nếu là trang đọc truyện và chế độ thumbnail, áp dụng màu từ thumbnail
        if (document.querySelector('.rd-basic_icon.row') && colorMode === 'thumbnail') {
            debugLog('Trang đọc truyện với chế độ thumbnail, áp dụng màu từ thumbnail.');

            // Lấy story ID từ URL
            const pathParts = window.location.pathname.split('/');
            const storyId = pathParts[2];
            if (storyId) {
                getCoverUrlFromInfoPage(storyId)
                    .then(coverUrl => {
                        debugLog('Đã lấy URL ảnh bìa:', coverUrl);
                        return analyzeImageColorTraditionalAccent(coverUrl);
                    })
                    .then(dominantColor => {
                        debugLog('Màu chủ đạo từ thumbnail:', dominantColor);
                        const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                        const isLightColor = MonetAPI.isColorLight(dominantColor);
                        applyMonetColorScheme(monetPalette, isLightColor);
                        // Thêm overlay sau khi áp dụng màu
                        addOverlay();
                    })
                    .catch(error => {
                        debugLog('Lỗi khi lấy màu từ thumbnail:', error);
                        applyCurrentColorScheme(); // Fallback to config color
                    });
                return;
            }
        }

        // Kiểm tra xem có phải trang truyện không bằng cách tìm element đặc trưng
        const sideFeaturesElement = document.querySelector('div.col-4.col-md.feature-item.width-auto-xl');
        if (sideFeaturesElement) {
            debugLog('Phát hiện trang truyện, bỏ qua tính năng này.');
            return;
        }

        debugLog('Khởi tạo PageGeneral cho trang không phải truyện');

        // Hàm áp dụng màu sắc hiện tại
        function applyCurrentColorScheme() {
            const defaultColor = window.HMTConfig && window.HMTConfig.getDefaultColor ?
                window.HMTConfig.getDefaultColor() : '#6c5ce7';

            debugLog('Áp dụng màu từ config:', defaultColor);

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

        // Áp dụng màu sắc lần đầu
        applyCurrentColorScheme();

        // Lắng nghe sự kiện màu sắc thay đổi để cập nhật real-time
        document.addEventListener('hmtColorChanged', function(event) {
            debugLog('Nhận sự kiện màu sắc thay đổi:', event.detail);

            // Kiểm tra chế độ màu
            const colorMode = window.HMTConfig && window.HMTConfig.getColorMode ? window.HMTConfig.getColorMode() : 'default';

            // Chỉ áp dụng màu thực sự nếu không phải preview mode và chế độ là default
            if (!event.detail.isPreview && colorMode === 'default') {
                // Đợi một chút để đảm bảo màu đã được lưu vào storage
                setTimeout(() => {
                    applyCurrentColorScheme();
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

        debugLog('Đã thiết lập lắng nghe sự kiện màu sắc thay đổi');

        // Lắng nghe sự kiện tắt màu thay đổi
        document.addEventListener('hmtDisableColorsChanged', function(event) {
            const isDisabled = event.detail.disabled;
            debugLog('Nhận sự kiện tắt màu thay đổi:', isDisabled);

            if (document.querySelector('.rd-basic_icon.row')) {
                if (isDisabled) {
                    // Xóa overlay
                    const targetElement = document.querySelector('.set-input.clear.justify-center');
                    if (targetElement) {
                        const overlay = targetElement.querySelector('.hmt-block-overlay');
                        if (overlay) {
                            overlay.remove();
                            debugLog('Đã xóa overlay do tắt màu');
                        }
                    }
                } else {
                    // Áp dụng lại màu và thêm overlay
                    const colorMode = window.HMTConfig.getColorMode();
                    if (colorMode === 'thumbnail') {
                        debugLog('Áp dụng lại màu thumbnail');
                        const pathParts = window.location.pathname.split('/');
                        const storyId = pathParts[2];
                        if (storyId) {
                            getCoverUrlFromInfoPage(storyId)
                                .then(coverUrl => analyzeImageColorTraditionalAccent(coverUrl))
                                .then(dominantColor => {
                                    const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                                    const isLightColor = MonetAPI.isColorLight(dominantColor);
                                    applyMonetColorScheme(monetPalette, isLightColor);
                                    addOverlay();
                                })
                                .catch(error => {
                                    debugLog('Lỗi khi áp dụng màu thumbnail:', error);
                                    applyCurrentColorScheme();
                                    addOverlay();
                                });
                        }
                    } else {
                        debugLog('Áp dụng lại màu config');
                        applyCurrentColorScheme();
                        addOverlay();
                    }
                }
            }
        });

        // Lắng nghe sự kiện chế độ màu thay đổi
        document.addEventListener('hmtModeChanged', function(event) {
            const newMode = event.detail.mode;
            debugLog('Nhận sự kiện chế độ màu thay đổi:', newMode);

            if (document.querySelector('.rd-basic_icon.row')) {
                const isDisabled = window.HMTConfig.getDisableColorsOnReadingPage();

                if (isDisabled) {
                    // Xóa overlay
                    const targetElement = document.querySelector('.set-input.clear.justify-center');
                    if (targetElement) {
                        const overlay = targetElement.querySelector('.hmt-block-overlay');
                        if (overlay) {
                            overlay.remove();
                            debugLog('Đã xóa overlay do chế độ màu thay đổi và tắt màu');
                        }
                    }
                } else {
                    // Áp dụng lại màu dựa trên chế độ mới
                    if (newMode === 'thumbnail') {
                        debugLog('Chế độ thumbnail, áp dụng lại màu từ thumbnail');
                        const pathParts = window.location.pathname.split('/');
                        const storyId = pathParts[2];
                        if (storyId) {
                            getCoverUrlFromInfoPage(storyId)
                                .then(coverUrl => {
                                    debugLog('Đã lấy URL ảnh bìa:', coverUrl);
                                    return analyzeImageColorTraditionalAccent(coverUrl);
                                })
                                .then(dominantColor => {
                                    debugLog('Màu chủ đạo từ thumbnail:', dominantColor);
                                    const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                                    const isLightColor = MonetAPI.isColorLight(dominantColor);
                                    applyMonetColorScheme(monetPalette, isLightColor);
                                    addOverlay();
                                })
                                .catch(error => {
                                    debugLog('Lỗi khi áp dụng lại màu thumbnail:', error);
                                    applyCurrentColorScheme();
                                    addOverlay();
                                });
                        }
                    } else {
                        debugLog('Chế độ default, áp dụng lại màu từ config');
                        applyCurrentColorScheme();
                        addOverlay();
                    }
                }
            }
        });
    }

    function isValidColor(color) {
        return MonetAPI.isValidColor(color);
    }

    // Hàm thêm overlay block trên element
    function addOverlay() {
        const targetElement = document.querySelector('.set-input.clear.justify-center');
        if (targetElement) {
            // Xóa overlay cũ nếu có
            const existingOverlay = targetElement.querySelector('.hmt-block-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            // Tạo overlay mới
            const overlay = document.createElement('div');
            overlay.className = 'hmt-block-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                pointer-events: none;
                z-index: 1000;
            `;

            // Đảm bảo element có position relative
            if (getComputedStyle(targetElement).position === 'static') {
                targetElement.style.position = 'relative';
            }

            targetElement.appendChild(overlay);
            debugLog('Đã thêm overlay block trên trang đọc truyện');
        } else {
            debugLog('Không tìm thấy element .set-input.clear.justify-center để thêm overlay');
        }
    }

    // Hàm lấy URL ảnh bìa từ trang thông tin truyện
    function getCoverUrlFromInfoPage(storyId) {
        const infoUrl = window.location.origin + '/truyen/' + storyId;
        debugLog('Đang lấy ảnh bìa từ:', infoUrl);

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: infoUrl,
                onload: function(response) {
                    if (response.status === 200) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        const coverElement = doc.querySelector('.series-cover .img-in-ratio');
                        if (coverElement) {
                            const coverStyle = coverElement.style.backgroundImage;
                            const coverUrl = coverStyle.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
                            if (coverUrl) {
                                resolve(coverUrl);
                            } else {
                                reject('No cover URL found');
                            }
                        } else {
                            reject('No cover element found');
                        }
                    } else {
                        reject('Failed to fetch info page');
                    }
                },
                onerror: function(error) {
                    reject('Network error: ' + error);
                }
            });
        });
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

            .hover\:bg-green-700:hover {
                background-color: ${palette[600]} !important;
            }

            .pagination_wrap .current {
                background-color: ${palette[600]} !important;
                color: ${textColor} !important;
            }

            .paging_item {
                color: ${palette[400]} !important;
            }

            :is(.dark .dark\:ring-cyan-900) {
                --tw-ring-color: ${palette[800]} !important;
            }

            #mainpart.custome-page, #mainpart.page-board {
                background-color: ${palette[900]} !important;
            }

            .button-green {
                background-color: ${palette[400]} !important;
                border-color: ${palette[600]} !important;
                color: ${textColor} !important;
            }

            .profile-nav {
                background-color: ${palette[800]} !important;
            }

            .bg-blue-600 {
                background-color: ${palette[500]} !important;
            }

            :is(.dark .dark\:bg-gray-700) {
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
        `;

        GM_addStyle(css);
        debugLog('Đã áp dụng Monet theme với màu từ config:', palette[500]);

        // Thêm overlay nếu đang ở trang đọc truyện
        if (document.querySelector('.rd-basic_icon.row')) {
            addOverlay();
        }
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
                color: #fff !important;
            }

            .sub-index-style .section-title {
                background-color: ${defaultPalette[700]} !important;
                border: none !important;
                color: #fff !important;
            }

            .browse-alphabet .current {
                background-color: ${defaultPalette[400]} !important;
                color: #fff !important;
            }

            .hover\:bg-green-700:hover {
                background-color: ${defaultPalette[600]} !important;
            }

            .pagination_wrap .current {
                background-color: ${defaultPalette[600]} !important;
                color: #fff !important;
            }

            .paging_item {
                color: ${defaultPalette[400]} !important;
            }

            :is(.dark .dark\:ring-cyan-900) {
                --tw-ring-color: ${defaultPalette[800]} !important;
            }

            .button-green {
                background-color: ${defaultPalette[400]} !important;
                border-color: ${defaultPalette[600]} !important;
                color: #fff !important;
            }

            .profile-nav {
                background-color: ${defaultPalette[800]} !important;
            }

            .bg-blue-600 {
                background-color: ${defaultColor} !important;
            }

            :is(.dark .dark\:bg-gray-700) {
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
        `;

        GM_addStyle(css);
        debugLog('Đã áp dụng màu mặc định từ config:', defaultColor);

        // Thêm overlay nếu đang ở trang đọc truyện
        if (document.querySelector('.rd-basic_icon.row')) {
            addOverlay();
        }
    }

    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageGeneral);
    } else {
        initPageGeneral();
    }
})();