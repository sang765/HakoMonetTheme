(function() {
    'use strict';
    
    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[CrosUnblock]', ...args);
        }
    }
    
    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }
    
    function initCrosUnblock() {
        debugLog('CROS Unblock module đã được tải');
        debugLog('Target domains:', TARGET_DOMAINS);
        
        // Patch XMLHttpRequest
        patchXMLHttpRequest();
        
        // Patch Fetch API
        patchFetch();
        
        // Patch Image constructor (for CORS images)
        patchImage();
        
        // Patch createElement for specific tags
        patchCreateElement();
        
        // Patch document.createElement for iframe, img, script, link
        patchDocumentCreateElement();
        
        // Add CORS headers to GM_xmlhttpRequest if available
        patchGMXmlHttpRequest();
        
        // Monitor dynamic content loading
        setupDynamicContentMonitor();
        
        debugLog('CROS Unblock đã được áp dụng đầy đủ');
    }
    
    function patchXMLHttpRequest() {
        if (typeof XMLHttpRequest === 'undefined') return;
        
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        
        // Track custom headers
        XMLHttpRequest.prototype._corsHeaders = {};
        
        XMLHttpRequest.prototype.open = function() {
            this._url = arguments[1];
            this._method = arguments[0];
            return originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function() {
            if (this._url && isTargetDomain(this._url)) {
                // Add CORS headers
                this.setRequestHeader('Origin', window.location.origin);
                this.setRequestHeader('Referer', window.location.href);
                this.setRequestHeader('Access-Control-Request-Method', this._method || 'GET');
                
                // Add cached headers
                Object.keys(this._corsHeaders).forEach(key => {
                    this.setRequestHeader(key, this._corsHeaders[key]);
                });
            }
            return originalXHRSend.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
            // Store custom headers for CORS requests
            if (this._url && isTargetDomain(this._url)) {
                this._corsHeaders[header] = value;
            }
            return originalXHRSetRequestHeader.apply(this, arguments);
        };
        
        debugLog('XMLHttpRequest đã được patch');
    }
    
    function patchFetch() {
        if (typeof fetch === 'undefined') return;
        
        const originalFetch = window.fetch;
        
        window.fetch = function() {
            let input = arguments[0];
            let init = arguments[1] || {};
            let url = input instanceof Request ? input.url : input;
            
            if (typeof url === 'string' && isTargetDomain(url)) {
                // Clone the init object to avoid modifying the original
                const newInit = {...init};
                
                // Ensure headers object exists
                if (!newInit.headers) {
                    newInit.headers = {};
                }
                
                // Convert headers to Headers object if needed
                if (!(newInit.headers instanceof Headers)) {
                    newInit.headers = new Headers(newInit.headers);
                }
                
                // Add CORS headers
                newInit.headers.set('Origin', window.location.origin);
                newInit.headers.set('Referer', window.location.href);
                
                // Set CORS mode
                newInit.mode = 'cors';
                newInit.credentials = 'include';
                
                // Update arguments
                if (input instanceof Request) {
                    arguments[0] = new Request(input, newInit);
                } else {
                    arguments[1] = newInit;
                }
            }
            
            return originalFetch.apply(this, arguments);
        };
        
        debugLog('Fetch API đã được patch');
    }
    
    function patchImage() {
        const originalImage = window.Image;
        
        window.Image = function(width, height) {
            const img = new originalImage(width, height);
            patchImageElement(img);
            return img;
        };
        
        // Copy static properties
        Object.keys(originalImage).forEach(key => {
            window.Image[key] = originalImage[key];
        });
        
        debugLog('Image constructor đã được patch');
    }
    
    function patchImageElement(img) {
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        
        if (originalSrcDescriptor && originalSrcDescriptor.set) {
            Object.defineProperty(img, 'src', {
                set: function(value) {
                    if (isTargetDomain(value)) {
                        // Add crossOrigin attribute for CORS images
                        this.crossOrigin = 'anonymous';
                        debugLog('Đã set crossOrigin cho image:', value);
                    }
                    return originalSrcDescriptor.set.call(this, value);
                },
                get: originalSrcDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }
    }
    
    function patchCreateElement() {
        const originalCreateElement = document.createElement;
        
        document.createElement = function() {
            const element = originalCreateElement.apply(this, arguments);
            
            if (arguments[0].toLowerCase() === 'img' && isTargetDomain(element.src)) {
                patchImageElement(element);
            }
            
            if (arguments[0].toLowerCase() === 'iframe' && isTargetDomain(element.src)) {
                element.setAttribute('allow', 'cross-origin-isolated');
                element.setAttribute('credentialless', 'true');
            }
            
            if (arguments[0].toLowerCase() === 'script' && isTargetDomain(element.src)) {
                element.crossOrigin = 'anonymous';
            }
            
            if (arguments[0].toLowerCase() === 'link' && isTargetDomain(element.href)) {
                element.crossOrigin = 'anonymous';
            }
            
            return element;
        };
        
        debugLog('document.createElement đã được patch');
    }
    
    function patchDocumentCreateElement() {
        const originalCreateElementNS = document.createElementNS;
        
        if (originalCreateElementNS) {
            document.createElementNS = function() {
                const element = originalCreateElementNS.apply(this, arguments);
                
                if (arguments[1].toLowerCase() === 'img' && isTargetDomain(element.src)) {
                    element.crossOrigin = 'anonymous';
                }
                
                return element;
            };
            
            debugLog('document.createElementNS đã được patch');
        }
    }
    
    function patchGMXmlHttpRequest() {
        if (typeof GM_xmlhttpRequest !== 'undefined') {
            const originalGMXmlHttpRequest = GM_xmlhttpRequest;
            
            GM_xmlhttpRequest = function(details) {
                const newDetails = {...details};
                
                if (newDetails.url && isTargetDomain(newDetails.url)) {
                    if (!newDetails.headers) {
                        newDetails.headers = {};
                    }
                    
                    // Add CORS headers
                    newDetails.headers['Origin'] = window.location.origin;
                    newDetails.headers['Referer'] = window.location.href;
                    newDetails.headers['Access-Control-Request-Method'] = newDetails.method || 'GET';
                }
                
                return originalGMXmlHttpRequest(newDetails);
            };
            
            debugLog('GM_xmlhttpRequest đã được patch');
        }
    }
    
    function setupDynamicContentMonitor() {
        // Monitor for dynamically added elements
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1) { // Element node
                            processNewElement(node);
                        }
                    }
                }
            });
        });
        
        observer.observe(document, {
            childList: true,
            subtree: true
        });
        
        debugLog('MutationObserver đã được thiết lập');
    }
    
    function processNewElement(element) {
        // Process images
        if (element.tagName === 'IMG' && isTargetDomain(element.src)) {
            element.crossOrigin = 'anonymous';
            debugLog('Đã xử lý image element:', element.src);
        }
        
        // Process iframes
        if (element.tagName === 'IFRAME' && isTargetDomain(element.src)) {
            element.setAttribute('allow', 'cross-origin-isolated');
            element.setAttribute('credentialless', 'true');
        }
        
        // Process scripts
        if (element.tagName === 'SCRIPT' && isTargetDomain(element.src)) {
            element.crossOrigin = 'anonymous';
        }
        
        // Process links
        if (element.tagName === 'LINK' && isTargetDomain(element.href)) {
            element.crossOrigin = 'anonymous';
        }
        
        // Process nested elements
        const images = element.querySelectorAll('img');
        images.forEach(img => {
            if (isTargetDomain(img.src)) {
                img.crossOrigin = 'anonymous';
            }
        });
        
        const iframes = element.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (isTargetDomain(iframe.src)) {
                iframe.setAttribute('allow', 'cross-origin-isolated');
                iframe.setAttribute('credentialless', 'true');
            }
        });
    }
    
    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCrosUnblock);
    } else {
        initCrosUnblock();
    }
    
})();
