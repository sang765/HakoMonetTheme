(function() {
    'use strict';
    
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[CrosUnblock]', ...args);
        }
    }
    
    function initCrosUnblock() {
        debugLog('CROS Unblock module đã được tải');
        
        // Thêm các headers CORS cần thiết
        if (typeof GM_xmlhttpRequest !== 'undefined') {
            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;
            const originalFetch = window.fetch;
            
            // Override XMLHttpRequest
            XMLHttpRequest.prototype.open = function() {
                this._url = arguments[1];
                return originalXHROpen.apply(this, arguments);
            };
            
            XMLHttpRequest.prototype.send = function() {
                if (this._url && this._url.includes('docln') || this._url.includes('hako')) {
                    this.setRequestHeader('Origin', window.location.origin);
                    this.setRequestHeader('Referer', window.location.href);
                }
                return originalXHRSend.apply(this, arguments);
            };
            
            // Override fetch
            window.fetch = function() {
                const url = arguments[0] instanceof Request ? arguments[0].url : arguments[0];
                
                if (typeof url === 'string' && (url.includes('docln') || url.includes('hako'))) {
                    if (arguments[1] === undefined) {
                        arguments[1] = {};
                    }
                    
                    if (arguments[1].headers === undefined) {
                        arguments[1].headers = {};
                    }
                    
                    arguments[1].headers['Origin'] = window.location.origin;
                    arguments[1].headers['Referer'] = window.location.href;
                    arguments[1].mode = 'cors';
                }
                
                return originalFetch.apply(this, arguments);
            };
            
            debugLog('CROS Unblock đã được áp dụng');
        }
    }
    
    initCrosUnblock();
})();
