(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[AdBlock]', ...args);
        }
    }
    
    function initAdBlock() {
        debugLog('Đang khởi tạo AdBlock module...');
        
        // Block các element theo selector
        blockElementsBySelector('img[src^="https://i2.hako.vip/ln/series/chapter-banners/"]');
        blockElementsBySelector('.index-background');
        
        // Thiết lập MutationObserver để theo dõi các element mới được thêm vào DOM
        setupMutationObserver();
        
        debugLog('AdBlock module đã được khởi tạo');
    }
    
    function blockElementsBySelector(selector) {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length > 0) {
            debugLog(`Tìm thấy ${elements.length} phần tử với selector: ${selector}`);
            
            elements.forEach(element => {
                hideElement(element);
            });
        }
    }
    
    function hideElement(element) {
        if (element && element.parentNode) {
            // Ẩn element bằng CSS
            element.style.display = 'none !important';
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            
            debugLog('Đã ẩn phần tử:', element);
        }
    }
    
    function setupMutationObserver() {
        // Tạo một observer instance
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Kiểm tra các node mới được thêm vào
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        
                        // Nếu node là element, kiểm tra các selector
                        if (node.nodeType === 1) {
                            checkAndHideElements(node);
                        }
                    }
                }
            });
        });
        
        // Cấu hình observer
        const config = { 
            childList: true, 
            subtree: true 
        };
        
        // Bắt đầu quan sát
        observer.observe(document.body, config);
        
        debugLog('Đã thiết lập MutationObserver để theo dõi các phần tử mới');
    }
    
    function checkAndHideElements(rootElement) {
        // Kiểm tra và ẩn các element trong rootElement
        const selector1 = 'img[src^="https://i2.hako.vip/ln/series/chapter-banners/"]';
        const selector2 = '.d-lg-none.index-background';
        
        const elements1 = rootElement.querySelectorAll ? rootElement.querySelectorAll(selector1) : [];
        const elements2 = rootElement.querySelectorAll ? rootElement.querySelectorAll(selector2) : [];
        
        if (rootElement.matches && rootElement.matches(selector1)) {
            hideElement(rootElement);
        }
        
        if (rootElement.matches && rootElement.matches(selector2)) {
            hideElement(rootElement);
        }
        
        elements1.forEach(element => hideElement(element));
        elements2.forEach(element => hideElement(element));
    }
    
    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdBlock);
    } else {
        initAdBlock();
    }
    
})();
