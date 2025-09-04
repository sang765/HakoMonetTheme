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

        // Check if GM_xmlhttpRequest is available
        if (typeof GM_xmlhttpRequest === 'undefined') {
            debugLog('GM_xmlhttpRequest not available - module cannot function without it');
            return;
        }

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

        // Monitor dynamic content loading
        setupDynamicContentMonitor();

        // Đánh dấu module đã được tải xong
        window.__corsModuleLoaded = true;
        debugLog('CROS Unblock đã được áp dụng đầy đủ');
    }

    function patchXMLHttpRequest() {
        if (typeof XMLHttpRequest === 'undefined') return;

        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

        XMLHttpRequest.prototype._corsHeaders = {};
        XMLHttpRequest.prototype._corsUrl = null;
        XMLHttpRequest.prototype._corsMethod = null;
        XMLHttpRequest.prototype._corsData = null;
        XMLHttpRequest.prototype._corsAsync = true;

        XMLHttpRequest.prototype.open = function(method, url, async = true, user = null, password = null) {
            this._corsUrl = url;
            this._corsMethod = method;
            this._corsAsync = async;
            return originalXHROpen.call(this, method, url, async, user, password);
        };

        XMLHttpRequest.prototype.send = function(data) {
            this._corsData = data;

            if (this._corsUrl && isTargetDomain(this._corsUrl)) {
                debugLog('Intercepting XMLHttpRequest to:', this._corsUrl);

                // Prepare GM_xmlhttpRequest details
                const details = {
                    method: this._corsMethod || 'GET',
                    url: this._corsUrl,
                    headers: {...this._corsHeaders},
                    data: this._corsData,
                    onload: (response) => {
                        // Simulate XMLHttpRequest response
                        Object.defineProperty(this, 'responseText', { value: response.responseText });
                        Object.defineProperty(this, 'response', { value: response.response });
                        Object.defineProperty(this, 'status', { value: response.status });
                        Object.defineProperty(this, 'statusText', { value: response.statusText });
                        Object.defineProperty(this, 'readyState', { value: 4 });

                        if (this.onreadystatechange) {
                            this.onreadystatechange();
                        }
                        if (this.onload) {
                            this.onload(response);
                        }
                    },
                    onerror: (error) => {
                        Object.defineProperty(this, 'readyState', { value: 4 });
                        if (this.onerror) {
                            this.onerror(error);
                        }
                    }
                };

                // Add Origin and Referer headers
                details.headers['Origin'] = window.location.origin;
                details.headers['Referer'] = window.location.href;

                GM_xmlhttpRequest(details);
                return;
            }

            return originalXHRSend.call(this, data);
        };

        XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
            if (this._corsUrl && isTargetDomain(this._corsUrl)) {
                this._corsHeaders[header] = value;
            }
            return originalXHRSetRequestHeader.call(this, header, value);
        };

        debugLog('XMLHttpRequest đã được patch');
    }

    function patchFetch() {
        if (typeof fetch === 'undefined') return;

        const originalFetch = window.fetch;

        window.fetch = function(input, init = {}) {
            let url = input instanceof Request ? input.url : input;

            if (typeof url === 'string' && isTargetDomain(url)) {
                debugLog('Intercepting fetch to:', url);

                return new Promise((resolve, reject) => {
                    const details = {
                        method: init.method || 'GET',
                        url: url,
                        headers: init.headers || {},
                        data: init.body,
                        onload: (response) => {
                            // Create a Response-like object
                            const fetchResponse = {
                                ok: response.status >= 200 && response.status < 300,
                                status: response.status,
                                statusText: response.statusText,
                                url: response.finalUrl || url,
                                headers: new Headers(response.responseHeaders),
                                text: () => Promise.resolve(response.responseText),
                                json: () => Promise.resolve(JSON.parse(response.responseText)),
                                blob: () => Promise.resolve(new Blob([response.response])),
                                arrayBuffer: () => Promise.resolve(response.response),
                                clone: () => fetchResponse
                            };
                            resolve(fetchResponse);
                        },
                        onerror: (error) => {
                            reject(error);
                        }
                    };

                    // Add CORS headers
                    details.headers['Origin'] = window.location.origin;
                    details.headers['Referer'] = window.location.href;

                    GM_xmlhttpRequest(details);
                });
            }

            return originalFetch.call(this, input, init);
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
                        debugLog('Loading image via GM_xmlhttpRequest:', value);
                        loadImageViaGM(this, value);
                    } else {
                        originalSrcDescriptor.set.call(this, value);
                    }
                },
                get: originalSrcDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }
    }

    function loadImageViaGM(imgElement, url) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'blob',
            headers: {
                'Origin': window.location.origin,
                'Referer': window.location.href
            },
            onload: (response) => {
                if (response.status === 200) {
                    const blob = response.response;
                    const objectURL = URL.createObjectURL(blob);
                    imgElement.src = objectURL;

                    // Clean up the object URL after the image loads
                    imgElement.onload = () => {
                        URL.revokeObjectURL(objectURL);
                    };
                } else {
                    debugLog('Failed to load image:', url, response.status);
                }
            },
            onerror: (error) => {
                debugLog('Error loading image:', url, error);
            }
        });
    }

    function patchCreateElement() {
        const originalCreateElement = document.createElement;

        document.createElement = function() {
            const element = originalCreateElement.apply(this, arguments);
            const tagName = arguments[0].toLowerCase();

            if (tagName === 'img') {
                patchImageElement(element);
            } else if (tagName === 'script') {
                patchScriptElement(element);
            } else if (tagName === 'iframe') {
                patchIframeElement(element);
            } else if (tagName === 'link') {
                patchLinkElement(element);
            }

            return element;
        };

        debugLog('document.createElement đã được patch');
    }

    function patchScriptElement(script) {
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');

        if (originalSrcDescriptor && originalSrcDescriptor.set) {
            Object.defineProperty(script, 'src', {
                set: function(value) {
                    if (isTargetDomain(value)) {
                        debugLog('Loading script via GM_xmlhttpRequest:', value);
                        loadScriptViaGM(this, value);
                    } else {
                        originalSrcDescriptor.set.call(this, value);
                    }
                },
                get: originalSrcDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }
    }

    function loadScriptViaGM(scriptElement, url) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'Origin': window.location.origin,
                'Referer': window.location.href
            },
            onload: (response) => {
                if (response.status === 200) {
                    // Create a new script element with the fetched content
                    const newScript = document.createElement('script');
                    newScript.textContent = response.responseText;
                    scriptElement.parentNode.replaceChild(newScript, scriptElement);
                } else {
                    debugLog('Failed to load script:', url, response.status);
                }
            },
            onerror: (error) => {
                debugLog('Error loading script:', url, error);
            }
        });
    }

    function patchIframeElement(iframe) {
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');

        if (originalSrcDescriptor && originalSrcDescriptor.set) {
            Object.defineProperty(iframe, 'src', {
                set: function(value) {
                    if (isTargetDomain(value)) {
                        debugLog('Loading iframe via GM_xmlhttpRequest:', value);
                        loadIframeViaGM(this, value);
                    } else {
                        originalSrcDescriptor.set.call(this, value);
                    }
                },
                get: originalSrcDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }
    }

    function loadIframeViaGM(iframeElement, url) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'Origin': window.location.origin,
                'Referer': window.location.href
            },
            onload: (response) => {
                if (response.status === 200) {
                    // Set the content as srcdoc
                    iframeElement.srcdoc = response.responseText;
                } else {
                    debugLog('Failed to load iframe content:', url, response.status);
                }
            },
            onerror: (error) => {
                debugLog('Error loading iframe content:', url, error);
            }
        });
    }

    function patchLinkElement(link) {
        const originalHrefDescriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, 'href');

        if (originalHrefDescriptor && originalHrefDescriptor.set) {
            Object.defineProperty(link, 'href', {
                set: function(value) {
                    if (isTargetDomain(value)) {
                        debugLog('Loading link via GM_xmlhttpRequest:', value);
                        loadLinkViaGM(this, value);
                    } else {
                        originalHrefDescriptor.set.call(this, value);
                    }
                },
                get: originalHrefDescriptor.get,
                configurable: true,
                enumerable: true
            });
        }
    }

    function loadLinkViaGM(linkElement, url) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'Origin': window.location.origin,
                'Referer': window.location.href
            },
            onload: (response) => {
                if (response.status === 200) {
                    // For CSS links, inject the content as a style element
                    if (linkElement.rel === 'stylesheet') {
                        const style = document.createElement('style');
                        style.textContent = response.responseText;
                        linkElement.parentNode.replaceChild(style, linkElement);
                    }
                } else {
                    debugLog('Failed to load link:', url, response.status);
                }
            },
            onerror: (error) => {
                debugLog('Error loading link:', url, error);
            }
        });
    }

    function patchDocumentCreateElement() {
        const originalCreateElementNS = document.createElementNS;

        if (originalCreateElementNS) {
            document.createElementNS = function() {
                const element = originalCreateElementNS.apply(this, arguments);

                if (arguments[1].toLowerCase() === 'img') {
                    patchImageElement(element);
                }

                return element;
            };

            debugLog('document.createElementNS đã được patch');
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
            loadImageViaGM(element, element.src);
        }

        // Process scripts
        if (element.tagName === 'SCRIPT' && isTargetDomain(element.src)) {
            loadScriptViaGM(element, element.src);
        }

        // Process iframes
        if (element.tagName === 'IFRAME' && isTargetDomain(element.src)) {
            loadIframeViaGM(element, element.src);
        }

        // Process links
        if (element.tagName === 'LINK' && isTargetDomain(element.href)) {
            loadLinkViaGM(element, element.href);
        }

        // Process nested elements
        const images = element.querySelectorAll('img');
        images.forEach(img => {
            if (isTargetDomain(img.src)) {
                loadImageViaGM(img, img.src);
            }
        });

        const scripts = element.querySelectorAll('script');
        scripts.forEach(script => {
            if (isTargetDomain(script.src)) {
                loadScriptViaGM(script, script.src);
            }
        });

        const iframes = element.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (isTargetDomain(iframe.src)) {
                loadIframeViaGM(iframe, iframe.src);
            }
        });

        const links = element.querySelectorAll('link');
        links.forEach(link => {
            if (isTargetDomain(link.href)) {
                loadLinkViaGM(link, link.href);
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
