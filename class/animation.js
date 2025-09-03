(function() {
    'use strict';

    function debugLog(...args) {
        if (window.HakoMonetConfig && window.HakoMonetConfig.isDebugEnabled()) {
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
            /* Fade in animation */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            /* Slide in from top animation */
            @keyframes slideInFromTop {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            /* Slide in from bottom animation */
            @keyframes slideInFromBottom {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            /* Pulse animation */
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            /* Hover animations */
            .series-cover {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .series-cover:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
            }
            
            .tag-item {
                transition: all 0.2s ease;
            }
            
            .tag-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            /* Page load animations */
            .series-cover {
                animation: fadeIn 0.6s ease-out;
            }
            
            .feature-section {
                animation: slideInFromTop 0.5s ease-out;
            }
            
            .basic-section {
                animation: slideInFromBottom 0.5s ease-out 0.2s both;
            }
            
            .list-chapters {
                animation: slideInFromBottom 0.5s ease-out 0.4s both;
            }
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
