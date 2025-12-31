(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('colorsLoader', ...args);
        } else if (DEBUG) {
            console.log('[ColorsLoader]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    // Page type detection
    function detectPageType() {
        // Check for info page (story details)
        if (document.querySelector('div.col-4.col-md.feature-item.width-auto-xl')) {
            return 'info-truyen';
        }

        // Check for profile page
        if (document.querySelector('main.profile-page')) {
            return 'profile';
        }

        // Default to general pages
        return 'general';
    }

    // Theme detection
    function detectTheme() {
        return document.cookie.includes('night_mode=true') ? 'dark' : 'light';
    }

    // Check if reading page and disable colors setting
    function shouldDisableColorsOnReadingPage() {
        return document.querySelector('.rd-basic_icon.row') &&
               window.HMTConfig &&
               window.HMTConfig.getDisableColorsOnReadingPage &&
               window.HMTConfig.getDisableColorsOnReadingPage();
    }

    // Main initialization function
    function initColorsLoader() {
        debugLog('Initializing Colors Loader...');

        // Check if colors should be disabled on reading page
        if (shouldDisableColorsOnReadingPage()) {
            debugLog('Colors disabled on reading page, skipping color application');
            return;
        }

        const pageType = detectPageType();
        const theme = detectTheme();

        debugLog(`Detected page type: ${pageType}, theme: ${theme}`);

        // Setup CORS handling for images
        setupImageCorsHandling();

        // Apply colors based on page type and theme
        applyColorsForPage(pageType, theme);

        // Setup event listeners for real-time updates
        setupEventListeners(pageType);
    }

    // Apply colors based on page type and theme
    function applyColorsForPage(pageType, theme) {
        debugLog(`Applying colors for ${pageType} page in ${theme} theme`);

        switch (pageType) {
            case 'general':
                applyGeneralPageColors(theme);
                break;
            case 'info-truyen':
                applyInfoTruyenPageColors(theme);
                break;
            case 'profile':
                applyProfilePageColors(theme);
                break;
            default:
                debugLog('Unknown page type, applying general colors');
                applyGeneralPageColors(theme);
        }
    }

    // Apply colors for general pages
    function applyGeneralPageColors(theme) {
        debugLog(`Applying general page colors for ${theme} theme`);

        // Check if we're on a story info page (should not apply general colors)
        if (document.querySelector('div.col-4.col-md.feature-item.width-auto-xl')) {
            debugLog('On info page, skipping general colors');
            return;
        }

        // Determine color source based on settings
        const extractFromAvatar = window.HMTConfig && window.HMTConfig.getExtractColorFromAvatar ?
            window.HMTConfig.getExtractColorFromAvatar() : false;

        if (extractFromAvatar) {
            debugLog('Avatar extraction enabled, applying avatar colors');
            applyAvatarColorScheme(theme, 'general');
        } else {
            debugLog('Using config colors');
            applyConfigColorScheme(theme, 'general');
        }

        // Setup avatar change detection for general pages
        setupAvatarChangeDetection('general');
    }

    // Apply colors for info truyen pages
    function applyInfoTruyenPageColors(theme) {
        debugLog(`Applying info truyen page colors for ${theme} theme`);

        const infoPageColorMode = window.HMTConfig && window.HMTConfig.getInfoPageColorMode ?
            window.HMTConfig.getInfoPageColorMode() : 'thumbnail';

        debugLog('Info page color mode:', infoPageColorMode);

        if (infoPageColorMode === 'default') {
            applyConfigColorScheme(theme, 'info-truyen');
        } else if (infoPageColorMode === 'thumbnail') {
            applyThumbnailColorScheme(theme, 'info-truyen');
        } else if (infoPageColorMode === 'avatar') {
            applyAvatarColorScheme(theme, 'info-truyen');
        }
    }

    // Apply colors for profile pages
    function applyProfilePageColors(theme) {
        debugLog(`Applying profile page colors for ${theme} theme`);

        const profileColorMode = window.HMTConfig && window.HMTConfig.getProfileColorMode ?
            window.HMTConfig.getProfileColorMode() : 'default';

        debugLog('Profile color mode:', profileColorMode);

        if (profileColorMode === 'default') {
            applyConfigColorScheme(theme, 'profile');
        } else if (profileColorMode === 'avatar') {
            applyAvatarColorScheme(theme, 'profile');
        } else if (profileColorMode === 'banner') {
            applyBannerColorScheme(theme, 'profile');
        }
    }

    // Apply config-based colors
    function applyConfigColorScheme(theme, pageType) {
        const defaultColor = window.HMTConfig && window.HMTConfig.getDefaultColor ?
            window.HMTConfig.getDefaultColor() : (theme === 'dark' ? '#063c30' : '#FCE4EC');

        debugLog(`Applying config color: ${defaultColor} for ${pageType} page`);

        if (!isValidColor(defaultColor)) {
            debugLog('Invalid color, using default scheme');
            applyDefaultColorScheme(theme, pageType);
            return;
        }

        const monetPalette = MonetAPI.generateMonetPalette(defaultColor);
        const isLightColor = MonetAPI.isColorLight(defaultColor);

        applyMonetColorScheme(monetPalette, isLightColor, theme, pageType);
    }

    // Apply thumbnail-based colors (for info pages)
    function applyThumbnailColorScheme(theme, pageType) {
        const coverElement = document.querySelector('.series-cover .img-in-ratio');
        if (!coverElement) {
            debugLog('No cover element found, falling back to config colors');
            applyConfigColorScheme(theme, pageType);
            return;
        }

        let coverUrl;
        if (coverElement.tagName.toLowerCase() === 'img') {
            coverUrl = coverElement.src;
        } else {
            const coverStyle = coverElement.style.backgroundImage;
            coverUrl = coverStyle.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
        }

        if (!coverUrl) {
            debugLog('No cover URL found, falling back to config colors');
            applyConfigColorScheme(theme, pageType);
            return;
        }

        debugLog('Analyzing thumbnail color from:', coverUrl);

        analyzeImageColorTraditionalAccent(coverUrl)
            .then(dominantColor => {
                debugLog('Thumbnail dominant color:', dominantColor);

                if (!isValidColor(dominantColor)) {
                    debugLog('Invalid thumbnail color, falling back to config');
                    applyConfigColorScheme(theme, pageType);
                    return;
                }

                const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                const isLightColor = MonetAPI.isColorLight(dominantColor);

                applyMonetColorScheme(monetPalette, isLightColor, theme, pageType);

                // Add overlay for reading pages
                if (document.querySelector('.rd-basic_icon.row')) {
                    addOverlay();
                }
            })
            .catch(error => {
                debugLog('Error analyzing thumbnail:', error);
                applyConfigColorScheme(theme, pageType);
            });
    }

    // Apply avatar-based colors
    function applyAvatarColorScheme(theme, pageType) {
        debugLog(`Applying avatar colors for ${pageType} page`);

        let avatarSelector;
        if (pageType === 'profile') {
            avatarSelector = '.profile-ava img';
        } else {
            avatarSelector = '.nav-user_avatar img';
        }

        const avatarElement = document.querySelector(avatarSelector);
        if (!avatarElement) {
            debugLog('No avatar element found, falling back to config colors');
            applyConfigColorScheme(theme, pageType);
            return;
        }

        const avatarSrc = avatarElement.src || avatarElement.getAttribute('data-src');
        if (!avatarSrc) {
            debugLog('No avatar src, setting up load listener');
            // Set up listener for when avatar loads
            avatarElement.addEventListener('load', () => {
                const retrySrc = avatarElement.src || avatarElement.getAttribute('data-src');
                if (retrySrc) {
                    analyzeAndApplyAvatarColor(retrySrc, theme, pageType);
                } else {
                    applyConfigColorScheme(theme, pageType);
                }
            });
            // Timeout fallback
            setTimeout(() => {
                if (!avatarSrc) {
                    applyConfigColorScheme(theme, pageType);
                }
            }, 5000);
            return;
        }

        analyzeAndApplyAvatarColor(avatarSrc, theme, pageType);
    }

    // Helper function to analyze and apply avatar color
    function analyzeAndApplyAvatarColor(avatarSrc, theme, pageType) {
        analyzeImageColorTraditionalAccent(avatarSrc)
            .then(dominantColor => {
                debugLog('Avatar dominant color:', dominantColor);

                if (!isValidColor(dominantColor)) {
                    debugLog('Invalid avatar color, falling back to config');
                    applyConfigColorScheme(theme, pageType);
                    return;
                }

                const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                const isLightColor = MonetAPI.isColorLight(dominantColor);

                applyMonetColorScheme(monetPalette, isLightColor, theme, pageType);
            })
            .catch(error => {
                debugLog('Error analyzing avatar:', error);
                applyConfigColorScheme(theme, pageType);
            });
    }

    // Apply banner-based colors (for profile pages)
    function applyBannerColorScheme(theme, pageType) {
        debugLog('Applying banner colors for profile page');

        const bannerElement = document.querySelector('.profile-cover .content');
        if (!bannerElement) {
            debugLog('No banner element found, falling back to config colors');
            applyConfigColorScheme(theme, pageType);
            return;
        }

        const backgroundImage = bannerElement.style.backgroundImage;
        if (!backgroundImage || !backgroundImage.includes('url(')) {
            debugLog('No banner background image, falling back to config colors');
            applyConfigColorScheme(theme, pageType);
            return;
        }

        const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i);
        if (!urlMatch) {
            debugLog('Cannot extract banner URL, falling back to config colors');
            applyConfigColorScheme(theme, pageType);
            return;
        }

        const bannerSrc = urlMatch[1];
        debugLog('Analyzing banner color from:', bannerSrc);

        analyzeImageColorTraditionalAccent(bannerSrc)
            .then(dominantColor => {
                debugLog('Banner dominant color:', dominantColor);

                if (!isValidColor(dominantColor)) {
                    debugLog('Invalid banner color, falling back to config');
                    applyConfigColorScheme(theme, pageType);
                    return;
                }

                const monetPalette = MonetAPI.generateMonetPalette(dominantColor);
                const isLightColor = MonetAPI.isColorLight(dominantColor);

                applyMonetColorScheme(monetPalette, isLightColor, theme, pageType);
            })
            .catch(error => {
                debugLog('Error analyzing banner:', error);
                applyConfigColorScheme(theme, pageType);
            });
    }

    // Apply default color scheme when no other colors are available
    function applyDefaultColorScheme(theme, pageType) {
        const defaultColor = theme === 'dark' ? '#063c30' : '#FCE4EC';
        const defaultPalette = MonetAPI.generateMonetPalette(defaultColor);
        const isLightColor = MonetAPI.isColorLight(defaultColor);

        debugLog(`Applying default color scheme: ${defaultColor} for ${pageType} page`);
        applyMonetColorScheme(defaultPalette, isLightColor, theme, pageType);
    }

    // Main function to apply Monet color scheme
    function applyMonetColorScheme(palette, isLight, theme, pageType) {
        if (!palette) {
            debugLog('No palette provided, skipping color application');
            return;
        }

        const textColor = isLight ? '#000' : '#fff';

        // Generate CSS based on theme and page type
        const css = generateColorCSS(palette, textColor, isLight, theme, pageType);

        GM_addStyle(css);
        debugLog(`Applied Monet theme with color: ${palette[500]} for ${pageType} page (${theme})`);

        // Add overlay for reading pages
        if (document.querySelector('.rd-basic_icon.row')) {
            addOverlay();
        }
    }

    // Generate CSS based on parameters
    function generateColorCSS(palette, textColor, isLight, theme, pageType) {
        const baseCSS = `
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
        `;

        // Add page-specific CSS
        let pageSpecificCSS = '';

        if (pageType === 'info-truyen') {
            pageSpecificCSS = `
                .feature-section .series-type:before {
                    border-top-color: ${palette[500]} !important;
                }

                .series-type,
                .series-owner.group-mem,
                .series-users .series-owner.group-admin,
                .series-users .series-owner.group-mod {
                    background-color: ${palette[500]} !important;
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

                [href*="/the-loai/"]:hover {
                    background-color: ${palette[300]} !important;
                    border: 1px solid ${palette[600]} !important;
                    color: ${palette[800]} !important;
                }

                .section-content [class="filter-type_item"] a:hover {
                    background-color: ${palette[300]} !important;
                    border: 1px solid ${palette[600]} !important;
                    color: ${palette[800]} !important;
                }
            `;
        } else if (pageType === 'profile') {
            pageSpecificCSS = `
                .profile-nav {
                    background-color: ${palette[800]} !important;
                }

                .profile-showcase header span.number {
                    background-color: ${palette[800]} !important;
                    color: ${textColor} !important;
                }

                .profile-showcase header, ol.list-volume li {
                    border-bottom-color: ${palette[800]} !important;
                }
            `;
        } else {
            // General pages CSS
            pageSpecificCSS = `
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
            `;
        }

        return baseCSS + pageSpecificCSS;
    }

    // Setup event listeners for real-time color changes
    function setupEventListeners(pageType) {
        debugLog('Setting up event listeners for color changes');

        // Color change events
        (window.top || window).document.addEventListener('hmtColorChanged', function(event) {
            debugLog('Received color change event:', event.detail);

            const currentTheme = detectTheme();
            const currentPageType = detectPageType();

            // Check if colors should be disabled
            if (shouldDisableColorsOnReadingPage()) {
                debugLog('Colors disabled on reading page');
                return;
            }

            // Only apply if not a preview and appropriate for current page
            if (!event.detail.isPreview && currentPageType === pageType) {
                setTimeout(() => {
                    applyColorsForPage(currentPageType, currentTheme);
                }, 100);
            } else if (event.detail.isPreview) {
                const previewColor = event.detail.color;
                if (previewColor && isValidColor(previewColor)) {
                    const monetPalette = MonetAPI.generateMonetPalette(previewColor);
                    const isLightColor = MonetAPI.isColorLight(previewColor);
                    applyMonetColorScheme(monetPalette, isLightColor, currentTheme, currentPageType);
                }
            }
        });

        // Info page specific events
        if (pageType === 'info-truyen') {
            (window.top || window).document.addEventListener('hmtInfoPageDefaultColorChanged', function(event) {
                debugLog('Received info page default color change event');
                const currentTheme = detectTheme();
                if (shouldDisableColorsOnReadingPage()) return;

                const infoPageColorMode = window.HMTConfig && window.HMTConfig.getInfoPageColorMode ?
                    window.HMTConfig.getInfoPageColorMode() : 'thumbnail';

                if (infoPageColorMode === 'default') {
                    setTimeout(() => applyInfoTruyenPageColors(currentTheme), 100);
                }
            });

            (window.top || window).document.addEventListener('hmtInfoPageColorModeChanged', function(event) {
                debugLog('Received info page color mode change event:', event.detail);
                const currentTheme = detectTheme();
                if (shouldDisableColorsOnReadingPage()) return;

                setTimeout(() => applyInfoTruyenPageColors(currentTheme), 100);
            });
        }

        // Profile page specific events
        if (pageType === 'profile') {
            (window.top || window).document.addEventListener('hmtProfileColorModeChanged', function(event) {
                debugLog('Received profile color mode change event:', event.detail);
                const currentTheme = detectTheme();

                setTimeout(() => applyProfilePageColors(currentTheme), 100);
            });
        }

        // Avatar extraction change
        (window.top || window).document.addEventListener('hmtExtractAvatarColorChanged', function(event) {
            debugLog('Received avatar extraction change event:', event.detail);
            const currentTheme = detectTheme();
            const currentPageType = detectPageType();

            if (shouldDisableColorsOnReadingPage()) return;

            if (currentPageType === 'general') {
                setTimeout(() => applyGeneralPageColors(currentTheme), 100);
            }
        });

        // Disable colors change
        (window.top || window).document.addEventListener('hmtDisableColorsChanged', function(event) {
            debugLog('Received disable colors change event:', event.detail);
            const isDisabled = event.detail.disabled;

            if (document.querySelector('.rd-basic_icon.row')) {
                if (isDisabled) {
                    // Remove overlay
                    const targetElement = document.querySelector('.set-input.clear.justify-center');
                    if (targetElement) {
                        const overlay = targetElement.querySelector('.hmt-block-overlay');
                        if (overlay) {
                            overlay.remove();
                            targetElement.style.pointerEvents = 'auto';
                            debugLog('Removed overlay due to disable colors');
                        }
                    }
                } else {
                    // Re-apply colors and add overlay
                    const currentTheme = detectTheme();
                    const currentPageType = detectPageType();
                    applyColorsForPage(currentPageType, currentTheme);
                }
            }
        });

        // Mode change (thumbnail vs default)
        (window.top || window).document.addEventListener('hmtModeChanged', function(event) {
            debugLog('Received mode change event:', event.detail);
            const currentTheme = detectTheme();

            if (document.querySelector('.rd-basic_icon.row') && shouldDisableColorsOnReadingPage()) {
                return;
            }

            const newMode = event.detail.mode;
            if (newMode === 'thumbnail') {
                applyThumbnailColorScheme(currentTheme, 'general');
            } else {
                applyConfigColorScheme(currentTheme, 'general');
            }
        });
    }

    // Setup avatar change detection
    function setupAvatarChangeDetection(pageType) {
        let avatarSelector;
        if (pageType === 'profile') {
            avatarSelector = '.profile-ava img';
        } else {
            avatarSelector = '.nav-user_avatar img';
        }

        const avatarImg = document.querySelector(avatarSelector);
        if (!avatarImg) {
            debugLog('No avatar element found for change detection');
            return;
        }

        debugLog('Setting up avatar change detection for', pageType);

        // Clear existing observer
        if (window.__avatarObserver) {
            window.__avatarObserver.disconnect();
        }

        let currentAvatarUrl = avatarImg.src || avatarImg.getAttribute('data-src');

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    const newUrl = avatarImg.src || avatarImg.getAttribute('data-src');

                    if (newUrl && newUrl !== currentAvatarUrl) {
                        debugLog('Avatar changed:', newUrl);

                        const extractFromAvatar = window.HMTConfig && window.HMTConfig.getExtractColorFromAvatar ?
                            window.HMTConfig.getExtractColorFromAvatar() : false;

                        if (extractFromAvatar) {
                            debugLog('Auto-updating colors from new avatar');
                            setTimeout(() => {
                                const currentTheme = detectTheme();
                                applyAvatarColorScheme(currentTheme, pageType);
                            }, 1500);
                        }

                        currentAvatarUrl = newUrl;
                    }
                }
            });
        });

        observer.observe(avatarImg, {
            attributes: true,
            attributeFilter: ['src', 'data-src']
        });

        window.__avatarObserver = observer;
        debugLog('Avatar change detection setup complete');
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

    // Add overlay for reading pages
    function addOverlay() {
        const targetElement = document.querySelector('.set-input.clear.justify-center');
        if (targetElement) {
            // Remove existing overlay
            const existingOverlay = targetElement.querySelector('.hmt-block-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            // Create new overlay
            const overlay = document.createElement('div');
            overlay.className = 'hmt-block-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                pointer-events: auto;
                z-index: 1000;
            `;

            overlay.innerHTML = '<div style="color: white; font-size: 14px; text-align: center; padding: 20px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Tắt màu trên trang đọc truyện</div>';

            overlay.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, true);

            targetElement.style.pointerEvents = 'none';

            if (getComputedStyle(targetElement).position === 'static') {
                targetElement.style.position = 'relative';
            }

            targetElement.appendChild(overlay);
            debugLog('Added overlay for reading page');
        }
    }

    // Image color analysis functions
    function analyzeImageColorTraditionalAccent(imageUrl) {
        return new Promise((resolve, reject) => {
            if (isTargetDomain(imageUrl)) {
                setupImageCorsHandling();
            }

            const img = new Image();

            if (isTargetDomain(imageUrl)) {
                img.crossOrigin = 'anonymous';
                debugLog('Set crossOrigin for analysis image');
            }

            img.onload = function() {
                debugLog('Analysis image loaded, dimensions:', img.width, 'x', img.height);
                try {
                    const dominantColor = getTraditionalAccentColorFromImage(img);
                    resolve(dominantColor);
                } catch (error) {
                    reject('Error analyzing image: ' + error);
                }
            };

            img.onerror = function(error) {
                debugLog('Image load error for analysis:', imageUrl, error);

                if (isTargetDomain(imageUrl)) {
                    debugLog('Trying GM_xmlhttpRequest fallback');
                    loadImageWithXHR(imageUrl)
                        .then(img => {
                            try {
                                const dominantColor = getTraditionalAccentColorFromImage(img);
                                resolve(dominantColor);
                            } catch (error) {
                                reject('Error analyzing image from GM_xmlhttpRequest: ' + error);
                            }
                        })
                        .catch(xhrError => {
                            debugLog('GM_xmlhttpRequest also failed:', xhrError);
                            reject('Cannot load image for analysis');
                        });
                } else {
                    reject('Cannot load image');
                }
            };

            img.src = imageUrl;
        });
    }

    function loadImageWithXHR(imageUrl) {
        return new Promise((resolve, reject) => {
            debugLog('Loading image with GM_xmlhttpRequest:', imageUrl);
            GM_xmlhttpRequest({
                method: 'GET',
                url: imageUrl,
                responseType: 'blob',
                onload: function(response) {
                    if (response.status === 200) {
                        const blob = response.response;
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = () => reject('Cannot create image from blob');
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

    function getTraditionalAccentColorFromImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const width = 200;
        const height = 200;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        debugLog('Analyzing image for accent color, pixel count:', data.length / 4);

        const colorCount = {};
        let maxCount = 0;
        let dominantColor = '#063c30';

        const traditionalAccentRanges = [
            {min: [120, 0, 0], max: [255, 100, 100], weight: 1.8}, // Red
            {min: [200, 80, 0], max: [255, 165, 50], weight: 1.7}, // Orange
            {min: [180, 150, 0], max: [240, 220, 100], weight: 1.5}, // Yellow
            {min: [0, 100, 0], max: [100, 255, 100], weight: 1.6}, // Green
            {min: [0, 0, 120], max: [100, 100, 255], weight: 1.8}, // Blue
            {min: [100, 0, 100], max: [200, 100, 200], weight: 1.7}, // Purple
            {min: [200, 100, 150], max: [255, 180, 200], weight: 1.6} // Pink
        ];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;

            const brightness = (r + g + b) / 3;
            if (brightness > 240 || brightness < 15) continue;

            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;

            if (saturation < 30) continue;

            const roundedR = Math.round(r / 8) * 8;
            const roundedG = Math.round(g / 8) * 8;
            const roundedB = Math.round(b / 8) * 8;

            const colorGroup = `${roundedR},${roundedG},${roundedB}`;

            let weight = 1.0;
            for (const accentRange of traditionalAccentRanges) {
                if (roundedR >= accentRange.min[0] && roundedR <= accentRange.max[0] &&
                    roundedG >= accentRange.min[1] && roundedG <= accentRange.max[1] &&
                    roundedB >= accentRange.min[2] && roundedB <= accentRange.max[2]) {
                    weight = accentRange.weight;
                    break;
                }
            }

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

        if (maxCount === 0) {
            debugLog('No accent color found, using fallback');
            dominantColor = getMostSaturatedColor(img);
        }

        debugLog('Selected accent color:', dominantColor);
        return dominantColor;
    }

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
            const a = data[i + 3];

            if (a < 128) continue;

            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const saturation = maxChannel - minChannel;

            const brightness = (r + g + b) / 3;
            if (brightness > 240 || brightness < 15) continue;

            if (saturation > maxSaturation) {
                maxSaturation = saturation;
                mostSaturatedColor = MonetAPI.rgbToHex(r, g, b);
            }
        }

        return mostSaturatedColor;
    }

    function isValidColor(color) {
        return MonetAPI.isValidColor(color);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initColorsLoader);
    } else {
        initColorsLoader();
    }

    // Export module functions
    window.HMTColorsLoader = {
        init: initColorsLoader,
        detectPageType: detectPageType,
        detectTheme: detectTheme,
        applyColorsForPage: applyColorsForPage,
        analyzeImageColorTraditionalAccent: analyzeImageColorTraditionalAccent
    };

    debugLog('Colors Loader module loaded and ready');

})();