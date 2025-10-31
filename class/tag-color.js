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
            @import url('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/tag-color.css');
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
