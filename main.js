(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[HakoMonetTheme]', ...args);
        }
    }
    
    function loadScript(scriptContent, scriptName) {
        try {
            eval(scriptContent);
            debugLog(`Đã tải ${scriptName}`);
        } catch (error) {
            debugLog(`Lỗi khi tải ${scriptName}:`, error);
        }
    }
    
    function init() {
        debugLog('Đang khởi tạo HakoMonetTheme...');
        
        // Load các module
        try {
            const monetJS = GM_getResourceText('monetJS');
            const crosUnblockJS = GM_getResourceText('crosUnblockJS');
            const infoTruyenJS = GM_getResourceText('infoTruyenJS');
            const animationJS = GM_getResourceText('animationJS');
            const monetClassJS = GM_getResourceText('monetClassJS');
            const tagColorJS = GM_getResourceText('tagColorJS');
            
            // Load các module theo thứ tự
            loadScript(crosUnblockJS, 'cros-unblock.js');
            loadScript(infoTruyenJS, 'info-truyen.js');
            loadScript(tagColorJS, 'tag-color.js');
            loadScript(monetClassJS, 'monet.js');
            loadScript(animationJS, 'animation.js');
            loadScript(monetJS, 'monet.js');
            
            debugLog('Tất cả module đã được tải');
        } catch (error) {
            debugLog('Lỗi khi tải module:', error);
        }
    }
    
    // Khởi chạy
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
