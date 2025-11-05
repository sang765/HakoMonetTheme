(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[PageGeneralLight]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    function initPageGeneralLight() {
        // Check if in dark mode, if yes, skip
        if (window.__themeDetectorLoaded && window.ThemeDetector && window.ThemeDetector.isDark()) {
            debugLog('In dark mode, skipping light theme application');
            return;
        }

        // Setup CORS handling for images
        setupImageCorsHandling();

        // Kiểm tra xem có phải trang đọc truyện không và có tắt màu không
        if (document.querySelector('.rd-basic_icon.row') && window.HMTConfig && window.HMTConfig.getDisableColorsOnReadingPage && window.HMTConfig.getDisableColorsOnReadingPage()) {
            debugLog('Reading page with colors disabled, skipping');
            return;
        }

        // Kiểm tra chế độ màu
        const colorMode = window.HMTConfig && window.HMTConfig.getColorMode ? window.HMTConfig.getColorMode() : 'default';

        // Nếu là trang đọc truyện và chế độ thumbnail, áp dụng màu từ thumbnail
        if (document.querySelector('.rd-basic_icon.row') && colorMode === 'thumbnail') {
            debugLog('Reading page with thumbnail mode, applying from thumbnail');

            const pathParts = window.location.pathname.split('/');
            const storyId = pathParts[2];
            if (storyId) {
                getCoverUrlFromInfoPage(storyId)
                    .then(coverUrl => {
                        debugLog('Got cover URL:', coverUrl);
                        return analyzeImageColorTraditionalAccent(coverUrl);
                    })
                    .then(dominantColor => {
                        debugLog('Dominant color from thumbnail:', dominantColor);
                        const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                        const isLightColor = MonetAPI.isColorLight(dominantColor);
                        applyMonetColorScheme(monetPalette, isLightColor);
                    })
                    .catch(error => {
                        debugLog('Error getting color from thumbnail:', error);
                        applyCurrentColorScheme();
                    });
                return;
            }
        }

        // Kiểm tra xem có phải trang truyện không
        const sideFeaturesElement = document.querySelector('div.col-4.col-md.feature-item.width-auto-xl');
        if (sideFeaturesElement) {
            debugLog('Story page detected, skipping');
            return;
        }

        debugLog('Initializing light theme for general page');

        applyCurrentColorScheme();

        // Listen for color change events
        (window.top || window).document.addEventListener('hmtColorChanged', function(event) {
            debugLog('Color change event received:', event.detail);

            // Check if in dark mode
            if (window.__themeDetectorLoaded && window.ThemeDetector && window.ThemeDetector.isDark()) {
                debugLog('In dark mode, skipping');
                return;
            }

            const colorMode = window.HMTConfig && window.HMTConfig.getColorMode ? window.HMTConfig.getColorMode() : 'default';

            if (!event.detail.isPreview && colorMode === 'default') {
                setTimeout(() => {
                    applyCurrentColorScheme();
                }, 100);
            } else if (event.detail.isPreview) {
                const previewColor = event.detail.color;
                if (previewColor && isValidColor(previewColor)) {
                    const monetPalette = MonetAPI.generateMonetPalette(previewColor);
                    const isLightColor = MonetAPI.isColorLight(previewColor);
                    applyMonetColorScheme(monetPalette, isLightColor);
                }
            }
        });

        debugLog('Set up color change listener');
    }

    function isValidColor(color) {
        return MonetAPI.isValidColor(color);
    }

    // Function to create tinted white using config color for light mode
    function createTintedWhite(tintColor) {
        const BASE_WHITE = '#ffffff';    // Base white color
        const TINT_STRENGTH = 0.1;       // 10% tint strength for subtle effect

        // Convert hex to RGB
        const white = hexToRgb(BASE_WHITE);
        const tint = hexToRgb(tintColor);

        // Mix: 90% white + 10% tint color
        const result = {
            r: Math.round(white.r * (1 - TINT_STRENGTH) + tint.r * TINT_STRENGTH),
            g: Math.round(white.g * (1 - TINT_STRENGTH) + tint.g * TINT_STRENGTH),
            b: Math.round(white.b * (1 - TINT_STRENGTH) + tint.b * TINT_STRENGTH)
        };

        return rgbToHex(result.r, result.g, result.b);
    }

    // Helper functions for color conversion
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x =>
            x.toString(16).padStart(2, '0')
        ).join('');
    }

    // Integrated CORS handling for images
    function setupImageCorsHandling() {
        if (window.__imageCorsSetup) return;

        debugLog('Setting up CORS handling for images');

        const originalImage = window.Image;
        window.Image = function(width, height) {
            const img = new originalImage(width, height);
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

        Object.keys(originalImage).forEach(key => {
            window.Image[key] = originalImage[key];
        });

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
        debugLog('CORS handling ready');
    }

    function applyCurrentColorScheme() {
        const defaultColor = window.HMTConfig ? window.HMTConfig.getDefaultColor() : '#FCE4EC'; // Get color from config or fallback

        debugLog('Applying light color scheme with config color:', defaultColor);

        if (!isValidColor(defaultColor)) {
            debugLog('Invalid color, using default');
            applyDefaultColorScheme();
            return;
        }

        // Create tinted white using config color for light mode
        const tintedWhite = createTintedWhite(defaultColor);
        debugLog('Tinted white for light mode:', tintedWhite);

        const monetPalette = MonetAPI.generateMonetPalette(tintedWhite);
        debugLog('Monet Palette:', monetPalette);

        const isLightColor = MonetAPI.isColorLight(tintedWhite);
        debugLog('Is light color?', isLightColor);

        applyMonetColorScheme(monetPalette, isLightColor);
    }

    function applyMonetColorScheme(palette, isLight) {
        if (!palette) {
            applyDefaultColorScheme();
            return;
        }

        const textColor = isLight ? '#000000' : '#ffffff';

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
                color: ${textColor} !important;
            }

            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${palette[500]} !important;
            }

            .ln-comment-form input.button,
            .series-users .series-owner_name a {
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
            .private-tabs header {
                background-color: ${palette[800]} !important;
            }

            .bg-gray-100 {
                background-color: ${palette[100]} !important;
            }

            #footer {
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
                background: linear-gradient(180deg, rgba(255,255,255,0) 1%, ${palette[100]} 75%, ${palette[100]}) !important;
            }

            .ln-comment-group:nth-child(odd) .expand {
                background: linear-gradient(180deg, rgba(248,249,250,0) 1%, ${palette[50]} 75%, ${palette[50]}) !important;
            }

            .visible-toolkit .visible-toolkit-item.do-like.liked {
                border-bottom-color: ${palette[500]} !important;
                color: ${palette[500]} !important;
                font-weight: 700 !important;
            }

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

            .pagination_wrap .current {
                background-color: ${palette[600]} !important;
                color: ${textColor} !important;
            }

            .paging_item {
                color: ${palette[400]} !important;
            }

            #mainpart.custome-page, #mainpart.page-board {
                background-color: ${palette[900]} !important;
            }

            .button-green {
                background-color: ${palette[400]} !important;
                border-color: ${palette[600]} !important;
                color: ${textColor} !important;
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
                background-color: ${palette[50]} !important;
                color: ${textColor} !important;
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

            #mainpart.reading-page.style-6 #rd-side_icon {
                background-color: ${palette[800]} !important;
            }

            #rd-side_icon {
                border: 1px solid ${palette[700]} !important;
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
                background-color: ${palette[850]} !important;
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

            #rd-side_icon {
                border: 1px solid ${palette[700]} !important;
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
                background-color: ${palette[850]} !important;
            }

            .section-content a:hover {
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

            .ring-cyan-500 {
                --tw-ring-color: ${palette[500]} !important;
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

            .bg-gray-200 {
                background-color: ${palette[200]} !important;
            }

            .profile-showcase header span.number, {
                background-color: ${palette[800]} !important;
                color: ${textColor} !important;
            }

            .profile-showcase header, ol.list-volume li {
                border-bottom-color: ${palette[800]} !important;
            }

            .statistic-top {
                border-bottom-color: ${palette[800]} !important;
            }
        `;

        GM_addStyle(css);
        debugLog('Applied light Monet theme with color:', palette[500]);
    }

    function applyDefaultColorScheme() {
        const defaultColor = '#E3F2FD';
        const defaultPalette = MonetAPI.generateMonetPalette(defaultColor);

        if (!defaultPalette) {
            debugLog('Cannot generate default palette');
            return;
        }

        const css = `
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
                color: #000 !important;
            }

            .series-owner.group-mem,
            .ln-comment-form input.button {
                background-color: ${defaultColor} !important;
            }

            .ln-comment-form input.button,
            .series-users .series-owner_name a {
                color: #000 !important;
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
            .private-tabs header {
                background-color: ${defaultPalette[800]} !important;
            }

            .bg-gray-100 {
                background-color: ${defaultPalette[100]} !important;
            }

            #footer {
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
                background: linear-gradient(180deg, rgba(255,255,255,0) 1%, ${defaultPalette[100]} 75%, ${defaultPalette[100]}) !important;
            }

            .ln-comment-group:nth-child(odd) .expand {
                background: linear-gradient(180deg, rgba(248,249,250,0) 1%, ${defaultPalette[50]} 75%, ${defaultPalette[50]}) !important;
            }

            .visible-toolkit .visible-toolkit-item.do-like.liked {
                border-bottom-color: ${defaultColor} !important;
                color: ${defaultColor} !important;
                font-weight: 700 !important;
            }

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
                color: #000 !important;
            }

            .sub-index-style .section-title {
                background-color: ${defaultPalette[700]} !important;
                border: none !important;
                color: #000 !important;
            }

            .browse-alphabet .current {
                background-color: ${defaultPalette[400]} !important;
                color: #000 !important;
            }

            .pagination_wrap .current {
                background-color: ${defaultPalette[600]} !important;
                color: #000 !important;
            }

            .paging_item {
                color: ${defaultPalette[400]} !important;
            }

            .button-green {
                background-color: ${defaultPalette[400]} !important;
                border-color: ${defaultPalette[600]} !important;
                color: ${textColor} !important;
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
                background-color: ${defaultPalette[50]} !important;
                color: #000 !important;
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
                border: 1px solid ${defaultPalette[700]} !important;
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
                background-color: ${defaultPalette[850]} !important;
            }

            .section-content a:hover {
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

            .ring-cyan-500 {
                --tw-ring-color: ${defaultColor} !important;
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

            .bg-gray-200 {
                background-color: ${defaultPalette[200]} !important;
            }

            .profile-showcase header span.number, {
                background-color: ${defaultPalette[800]} !important;
                color: ${textColor} !important;
            }

            .profile-showcase header, ol.list-volume li {
                border-bottom-color: ${defaultPalette[800]} !important;
            }

            .statistic-top {
                border-bottom-color: ${defaultPalette[800]} !important;
            }
        `;

        GM_addStyle(css);
        debugLog('Applied default light color scheme:', defaultColor);
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageGeneralLight);
    } else {
        initPageGeneralLight();
    }
})();
