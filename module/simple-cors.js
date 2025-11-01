(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[CORSSimple]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    class SimpleCORSSolution {
        constructor() {
            this.isInitialized = false;
        }

        init() {
            debugLog('Khởi tạo Simple CORS bypass...');

            // Patch XMLHttpRequest nếu có thể
            this.patchXMLHttpRequest();

            // Patch Fetch API
            this.patchFetch();

            // Patch Image constructor
            this.patchImage();

            // Patch createElement for specific tags
            this.patchCreateElement();

            this.isInitialized = true;
            debugLog('Simple CORS bypass đã được khởi tạo thành công');
            window.__corsSimpleModuleLoaded = true;

            return true;
        }

        patchXMLHttpRequest() {
            if (typeof XMLHttpRequest === 'undefined') return;

            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;

            XMLHttpRequest.prototype.open = function(method, url, async = true, user = null, password = null) {
                this._corsUrl = url;
                this._corsMethod = method;
                this._corsAsync = async;

                // Nếu là target domain, thử các kỹ thuật bypass
                if (isTargetDomain(url)) {
                    debugLog('XMLHttpRequest to target domain:', url);
                    // Để nguyên để trình duyệt xử lý tự nhiên
                }

                return originalXHROpen.call(this, method, url, async, user, password);
            };

            XMLHttpRequest.prototype.send = function(data) {
                if (this._corsUrl && isTargetDomain(this._corsUrl)) {
                    debugLog('Sending XMLHttpRequest to:', this._corsUrl);

                    // Thử các phương thức bypass khác nhau
                    this.tryBypassRequest(data);
                    return;
                }

                return originalXHRSend.call(this, data);
            };

            debugLog('XMLHttpRequest đã được patch');
        }

        patchFetch() {
            if (typeof fetch === 'undefined') return;

            const originalFetch = window.fetch;

            window.fetch = function(input, init = {}) {
                let url = input instanceof Request ? input.url : input;

                if (typeof url === 'string' && isTargetDomain(url)) {
                    debugLog('Fetch to target domain:', url);

                    return new Promise((resolve, reject) => {
                        // Phương thức 1: Thử với credentials và mode khác nhau
                        const tryFetchWithOptions = async (options) => {
                            try {
                                const response = await originalFetch(input, options);
                                if (response.ok || response.type === 'opaque') {
                                    return response;
                                }
                                throw new Error('Response not ok');
                            } catch (error) {
                                debugLog('Fetch attempt failed:', error.message);
                                throw error;
                            }
                        };

                        // Thử các options khác nhau
                        const optionsList = [
                            { ...init, mode: 'cors', credentials: 'include' },
                            { ...init, mode: 'cors', credentials: 'same-origin' },
                            { ...init, mode: 'no-cors' },
                            { ...init, mode: 'cors', credentials: 'omit' }
                        ];

                        const tryNextOption = async (index = 0) => {
                            if (index >= optionsList.length) {
                                reject(new Error('All CORS bypass methods failed'));
                                return;
                            }

                            try {
                                const response = await tryFetchWithOptions(optionsList[index]);
                                resolve(response);
                            } catch (error) {
                                debugLog(`Attempt ${index + 1} failed, trying next...`);
                                tryNextOption(index + 1);
                            }
                        };

                        tryNextOption();
                    });
                }

                return originalFetch.call(this, input, init);
            };

            debugLog('Fetch API đã được patch');
        }

        patchImage() {
            const originalImage = window.Image;

            window.Image = function(width, height) {
                const img = new originalImage(width, height);

                // Patch src property để thử bypass CORS cho images
                const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
                if (originalSrcDescriptor && originalSrcDescriptor.set) {
                    Object.defineProperty(img, 'src', {
                        set: function(value) {
                            if (isTargetDomain(value)) {
                                debugLog('Loading image from target domain:', value);
                                // Để trình duyệt xử lý tự nhiên với crossOrigin
                                img.crossOrigin = 'anonymous';
                            }
                            originalSrcDescriptor.set.call(this, value);
                        },
                        get: originalSrcDescriptor.get,
                        configurable: true,
                        enumerable: true
                    });
                }

                return img;
            };

            // Copy static properties
            Object.keys(originalImage).forEach(key => {
                window.Image[key] = originalImage[key];
            });

            debugLog('Image constructor đã được patch');
        }

        patchCreateElement() {
            const originalCreateElement = document.createElement;

            document.createElement = function() {
                const element = originalCreateElement.apply(this, arguments);
                const tagName = arguments[0].toLowerCase();

                if (tagName === 'img') {
                    // Đã patch ở trên
                } else if (tagName === 'script' || tagName === 'iframe' || tagName === 'link') {
                    // Để trình duyệt xử lý tự nhiên
                    debugLog(`Created element ${tagName} - để trình duyệt xử lý CORS tự nhiên`);
                }

                return element;
            };

            debugLog('document.createElement đã được patch');
        }

        tryBypassRequest(data) {
            // Thử các kỹ thuật bypass khác nhau cho XMLHttpRequest
            const url = this._corsUrl;

            // Phương thức 1: Thử với credentials khác nhau
            const methods = [
                () => {
                    const xhr = new XMLHttpRequest();
                    xhr.open(this._corsMethod, url, this._corsAsync);
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 400) {
                            debugLog('Bypass method 1 successful');
                            // Copy response to original request
                            Object.defineProperty(this, 'responseText', { value: xhr.responseText });
                            Object.defineProperty(this, 'response', { value: xhr.response });
                            Object.defineProperty(this, 'status', { value: xhr.status });
                            Object.defineProperty(this, 'readyState', { value: 4 });
                            if (this.onreadystatechange) this.onreadystatechange();
                            if (this.onload) this.onload();
                        }
                    };
                    xhr.send(data);
                }
            ];

            // Thử từng phương thức
            methods[0]();
        }
    }

    // Khởi tạo CORS bypass đơn giản
    function initCORSSimple() {
        debugLog('Khởi tạo Simple CORS bypass...');

        const corsSolution = new SimpleCORSSolution();
        const success = corsSolution.init();

        if (success) {
            debugLog('Simple CORS bypass đã sẵn sàng hoạt động');
        } else {
            debugLog('Không thể khởi tạo Simple CORS bypass');
        }
    }

    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCORSSimple);
    } else {
        initCORSSimple();
    }

})();
