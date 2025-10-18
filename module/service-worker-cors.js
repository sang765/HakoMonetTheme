(function() {
    'use strict';

    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];
    const SW_VERSION = '1.0.0';

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[ServiceWorkerCORS]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    class CORSBypassService {
        constructor() {
            this.isRegistered = false;
            this.serviceWorkerUrl = this.createServiceWorkerBlob();
        }

        async init() {
            if (!('serviceWorker' in navigator)) {
                debugLog('Service Worker không được hỗ trợ trong trình duyệt này');
                return false;
            }

            try {
                debugLog('Đang khởi tạo Service Worker CORS bypass...');

                // Đăng ký Service Worker
                const registration = await navigator.serviceWorker.register(this.serviceWorkerUrl, {
                    scope: '/'
                });

                debugLog('Service Worker đã được đăng ký thành công');

                // Đợi Service Worker sẵn sàng
                await navigator.serviceWorker.ready;
                debugLog('Service Worker đã sẵn sàng');

                this.isRegistered = true;

                // Lắng nghe messages từ Service Worker
                navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

                return true;
            } catch (error) {
                debugLog('Lỗi khi đăng ký Service Worker:', error);
                return false;
            }
        }

        createServiceWorkerBlob() {
            const swCode = `
                self.addEventListener('install', function(event) {
                    console.log('[SW] CORS Bypass Service Worker installing...');
                    self.skipWaiting();
                });

                self.addEventListener('activate', function(event) {
                    console.log('[SW] CORS Bypass Service Worker activated');
                    event.waitUntil(clients.claim());
                });

                self.addEventListener('fetch', function(event) {
                    const url = event.request.url;

                    // Chỉ xử lý các domain mục tiêu
                    const targetDomains = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];
                    const isTarget = targetDomains.some(domain => url.includes(domain));

                    if (!isTarget) {
                        return; // Không xử lý request này
                    }

                    console.log('[SW] Intercepting request to:', url);

                    event.respondWith(
                        (async function() {
                            try {
                                // Tạo headers mới để bypass CORS
                                const newHeaders = new Headers(event.request.headers);

                                // Thêm các headers cần thiết
                                newHeaders.set('Accept', '*/*');
                                newHeaders.set('Accept-Language', 'vi,en-US;q=0.9,en;q=0.8');
                                newHeaders.set('Cache-Control', 'no-cache');
                                newHeaders.set('Pragma', 'no-cache');

                                // Tạo request mới với mode 'cors'
                                const newRequest = new Request(event.request.url, {
                                    method: event.request.method,
                                    headers: newHeaders,
                                    mode: 'cors',
                                    credentials: 'include',
                                    redirect: 'follow'
                                });

                                // Thử fetch với mode cors trước
                                try {
                                    const response = await fetch(newRequest);

                                    // Nếu thành công, trả về response
                                    if (response.ok || response.type === 'opaque') {
                                        return response;
                                    }
                                } catch (corsError) {
                                    console.log('[SW] CORS error, thử phương thức khác:', corsError);
                                }

                                // Phương thức 2: Sử dụng no-cors mode
                                try {
                                    const noCorsRequest = new Request(event.request.url, {
                                        method: event.request.method,
                                        headers: newHeaders,
                                        mode: 'no-cors',
                                        credentials: 'same-origin'
                                    });

                                    const response = await fetch(noCorsRequest);

                                    // Với no-cors, chúng ta không thể đọc response text
                                    // Nhưng có thể trả về response để trình duyệt xử lý
                                    return new Response('', {
                                        status: 200,
                                        statusText: 'OK',
                                        headers: {
                                            'Content-Type': 'text/plain',
                                            'Access-Control-Allow-Origin': '*'
                                        }
                                    });
                                } catch (noCorsError) {
                                    console.log('[SW] No-CORS error:', noCorsError);
                                }

                                // Phương thức 3: Sử dụng proxy đơn giản
                                try {
                                    // Thử với một user-agent khác
                                    newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

                                    const proxyRequest = new Request(event.request.url, {
                                        method: event.request.method,
                                        headers: newHeaders,
                                        mode: 'cors',
                                        credentials: 'omit'
                                    });

                                    const response = await fetch(proxyRequest);
                                    return response;
                                } catch (proxyError) {
                                    console.log('[SW] Proxy error:', proxyError);
                                }

                                // Nếu tất cả đều thất bại, trả về lỗi
                                return new Response('CORS Bypass failed', {
                                    status: 403,
                                    statusText: 'Forbidden'
                                });

                            } catch (error) {
                                console.error('[SW] Error in fetch event:', error);
                                return new Response('Internal Server Error', {
                                    status: 500,
                                    statusText: 'Internal Server Error'
                                });
                            }
                        })()
                    );
                });

                self.addEventListener('message', function(event) {
                    console.log('[SW] Received message:', event.data);

                    if (event.data && event.data.type === 'GET_VERSION') {
                        event.ports[0].postMessage({
                            type: 'VERSION',
                            version: '${SW_VERSION}'
                        });
                    }
                });
            `;

            const blob = new Blob([swCode], { type: 'application/javascript' });
            return URL.createObjectURL(blob);
        }

        handleMessage(event) {
            debugLog('Received message from Service Worker:', event.data);
        }

        async testConnection() {
            if (!this.isRegistered) {
                return false;
            }

            try {
                const messageChannel = new MessageChannel();

                return new Promise((resolve) => {
                    messageChannel.port1.onmessage = (event) => {
                        if (event.data.type === 'VERSION') {
                            debugLog('Service Worker version:', event.data.version);
                            resolve(true);
                        }
                    };

                    navigator.serviceWorker.controller.postMessage(
                        { type: 'GET_VERSION' },
                        [messageChannel.port2]
                    );

                    // Timeout sau 5 giây
                    setTimeout(() => resolve(false), 5000);
                });
            } catch (error) {
                debugLog('Error testing Service Worker connection:', error);
                return false;
            }
        }
    }

    // Khởi tạo CORS bypass service
    async function initCORSSW() {
        debugLog('Khởi tạo Service Worker CORS bypass...');

        const corsService = new CORSBypassService();

        const success = await corsService.init();

        if (success) {
            debugLog('Service Worker CORS bypass đã được khởi tạo thành công');

            // Test kết nối
            const testResult = await corsService.testConnection();
            debugLog('Kết quả test Service Worker:', testResult);

            // Đánh dấu module đã được tải
            window.__corsSWModuleLoaded = true;
        } else {
            debugLog('Không thể khởi tạo Service Worker CORS bypass');
        }
    }

    // Khởi chạy module
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCORSSW);
    } else {
        initCORSSW();
    }

})();