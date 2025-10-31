(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Animation]', ...args);
        }
    }
    
    function initAnimation() {
        debugLog('Animation class đã được tải');
        
        // Thêm các animation CSS
        addAnimations();
    }
    
    function addAnimations() {
        GM_addStyle(`
            @import url('https://raw.githubusercontent.com/sang765/HakoMonetTheme/main/styles/animation.css');
        `);
        
        debugLog('Đã thêm animations');
    }
    
    // Khởi chạy class
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimation);
    } else {
        initAnimation();
    }
})();
