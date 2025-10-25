(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[TagColor]', ...args);
        }
    }
    
    function initTagColor() {
        debugLog('TagColor class đã được tải');

        // Thêm CSS editor liên quan đến tag
        addTagCSS();

        // Ẩn element toggle genre
        hideGenreToggle();
    }
    
    // Constants for selectors to improve maintainability
    const SELECTORS = {
        GENRE_ITEM: '.series-gerne-item',
        ELLIPSIS_ICON: '.fas.fa-ellipsis-h'
    };

    function hideGenreToggle() {
        // Remove genre toggle elements that contain the ellipsis icon
        // Note: :has() pseudo-class is used for modern browsers; fallback provided for compatibility
        let toggleElements;

        // Check for :has() support (modern browsers)
        if (CSS.supports('selector(:has(*))')) {
            toggleElements = document.querySelectorAll(`${SELECTORS.GENRE_ITEM}:has(${SELECTORS.ELLIPSIS_ICON})`);
        } else {
            // Fallback for older browsers: manually filter elements
            const genreItems = document.querySelectorAll(SELECTORS.GENRE_ITEM);
            toggleElements = Array.from(genreItems).filter(item =>
                item.querySelector(SELECTORS.ELLIPSIS_ICON) !== null
            );
        }

        // Error handling: only proceed if elements are found
        if (toggleElements.length === 0) {
            debugLog('No genre toggle elements found to remove');
            return;
        }

        toggleElements.forEach(element => {
            // Use remove() for complete removal instead of hiding
            element.remove();
            debugLog('Removed genre toggle element');
        });

        debugLog(`Removed ${toggleElements.length} genre toggle elements`);
    }

    function addTagCSS() {
        // CSS cho các tag với màu sắc khác nhau
        GM_addStyle(`
            [href*="/the-loai/action"],
            [href*="/the-loai/comedy"],
            [href*="/the-loai/romance"],
            [href*="/the-loai/school-life"],
            [href*="/the-loai/slice-of-life"],
            [href*="/the-loai/suspense"],
            [href*="/the-loai/ecchi"],
            [href*="/the-loai/adapted-to-anime"],
            [href*="/the-loai/adapted-to-drama-cd"],
            [href*="/the-loai/adapted-to-manga"],
            [href*="/the-loai/adapted-to-manhua"],
            [href*="/the-loai/adapted-to-manhwa"],
            [href*="/the-loai/adventure"],
            [href*="/the-loai/character-growth"],
            [href*="/the-loai/chinese-novel"],
            [href*="/the-loai/cooking"],
            [href*="/the-loai/different-social-status"],
            [href*="/the-loai/drama"],
            [href*="/the-loai/english-novel"],
            [href*="/the-loai/fanfiction"],
            [href*="/the-loai/fantasy"],
            [href*="/the-loai/female-protagonist"],
            [href*="/the-loai/game"],
            [href*="/the-loai/harem"],
            [href*="/the-loai/historical"],
            [href*="/the-loai/isekai"],
            [href*="/the-loai/josei"],
            [href*="/the-loai/korean-novel"],
            [href*="/the-loai/magic"],
            [href*="/the-loai/martial-arts"],
            [href*="/the-loai/mecha"],
            [href*="/the-loai/military"],
            [href*="/the-loai/misunderstanding"],
            [href*="/the-loai/mystery"],
            [href*="/the-loai/one-shot"],
            [href*="/the-loai/otome-game"],
            [href*="/the-loai/parody"],
            [href*="/the-loai/psychological"],
            [href*="/the-loai/reverse-harem"],
            [href*="/the-loai/science-fiction"],
            [href*="/the-loai/seinen"],
            [href*="/the-loai/shoujo"],
            [href*="/the-loai/shounen"],
            [href*="/the-loai/slow-life"],
            [href*="/the-loai/sports"],
            [href*="/the-loai/super-power"],
            [href*="/the-loai/supernatural"],
            [href*="/the-loai/tragedy"],
            [href*="/the-loai/wars"],
            [href*="/the-loai/web-novel"],
            [href*="/the-loai/workplace"] {
                background-color: #d4edda !important;
                border: 1px solid #c3e6cb !important;
                color: #155724 !important;
            }
            
            [href*="/the-loai/age-gap"],
            [href*="/the-loai/boys-love"],
            [href*="/the-loai/ecchi"],
            [href*="/the-loai/gender-bender"],
            [href*="/the-loai/horror"],
            [href*="/the-loai/incest"],
            [href*="/the-loai/netorare"],
            [href*="/the-loai/shoujo-ai"],
            [href*="/the-loai/shonen-ai"],
            [href*="/the-loai/yuri"],
            [href*="/the-loai/yandere"] {
                background-color: #fff3cd !important;
                border: 1px solid #ffeaa7 !important;
                color: #856404 !important;
            }
            
            [href*="/the-loai/adult"],
            [href*="/the-loai/mature"] {
                background-color: #f8d7da !important;
                border: 1px solid #f5c6cb !important;
                color: #721c24 !important;
                font-weight: bold !important;
            }
            
            .feature-section .series-gerne-item {
                border-radius: 20px !important;
                display: inline-block !important;
                margin-bottom: 10px !important;
                margin-right: 10px !important;
                padding: 5px 12px !important;
                text-decoration: none !important;
                transition: all 0.2s ease !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
            }
        `);
        
        debugLog('Đã thêm CSS cho tag colors');
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTagColor);
    } else {
        initTagColor();
    }
})();
