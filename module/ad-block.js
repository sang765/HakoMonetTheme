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
        
        // Block các element theo filter uBlock
        blockElementsBySelector('.page-top-group > [href="/"]');
        blockElementsBySelector('a[href*="/truyen/"] img[src*="chapter-banners"]');
        blockElementsBySelector('.d-lg-none.index-background');
        
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
        } else {
            debugLog(`Không tìm thấy phần tử với selector: ${selector}`);
        }
    }
    
    function hideElement(element) {
        if (element && element.parentNode) {
            // Ghi log trước khi ẩn
            debugLog('Ẩn phần tử:', element);
            
            // Ẩn element bằng cách xóa hoàn toàn khỏi DOM
            try {
                element.remove();
                debugLog('Đã xóa phần tử khỏi DOM');
            } catch (error) {
                // Nếu không xóa được, ẩn bằng CSS
                debugLog('Không thể xóa, ẩn bằng CSS:', error);
                element.style.display = 'none !important';
                element.style.visibility = 'hidden !important';
                element.style.opacity = '0 !important';
                element.style.position = 'absolute !important';
                element.style.left = '-9999px !important';
                element.style.height = '0 !important';
                element.style.width = '0 !important';
                element.style.padding = '0 !important';
                element.style.margin = '0 !important';
                element.style.overflow = 'hidden !important';
            }
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
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'href', 'class']
        };
        
        // Bắt đầu quan sát
        observer.observe(document.body, config);
        
        debugLog('Đã thiết lập MutationObserver để theo dõi các phần tử mới');
        
        // Kiểm tra lại sau một khoảng thời gian để chắc chắn
        setTimeout(() => {
            debugLog('Kiểm tra lại các elements sau 3 giây');
            blockElementsBySelector('.page-top-group > [href="/"]');
            blockElementsBySelector('a[href*="/truyen/"] img[src*="chapter-banners"]');
            blockElementsBySelector('.d-lg-none.index-background');
        }, 3000);
    }
    
    function checkAndHideElements(rootElement) {
        // Kiểm tra và ẩn các element trong rootElement
        const selectors = [
            '.page-top-group > [href="/"]',
            'a[href*="/truyen/"] img[src*="chapter-banners"]',
            '.d-lg-none.index-background'
        ];
        
        selectors.forEach(selector => {
            const elements = rootElement.querySelectorAll ? rootElement.querySelectorAll(selector) : [];
            
            if (rootElement.matches && rootElement.matches(selector)) {
                hideElement(rootElement);
            }
            
            elements.forEach(element => hideElement(element));
        });
    }
    
    // Hàm kiểm tra và ẩn elements định kỳ
    function startPeriodicCheck() {
        setInterval(() => {
            debugLog('Kiểm tra định kỳ các elements');
            blockElementsBySelector('.page-top-group > [href="/"]');
            blockElementsBySelector('a[href*="/truyen/"] img[src*="chapter-banners"]');
            blockElementsBySelector('.d-lg-none.index-background');
        }, 5000); // Kiểm tra mỗi 5 giây
    }
    
    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initAdBlock();
            startPeriodicCheck();
        });
    } else {
        initAdBlock();
        startPeriodicCheck();
    }
    
})();
