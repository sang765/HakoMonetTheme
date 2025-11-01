// Service Worker for HakoMonetTheme Update Caching
// This provides persistent caching and background sync capabilities

(function() {
    'use strict';

    const DEBUG = true;
    const CACHE_NAME = 'hmt-update-cache-v1';
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[HMT ServiceWorker]', ...args);
        }
    }

    // Install event - cache essential resources
    self.addEventListener('install', event => {
        debugLog('Service Worker installing');
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll([
                    '/api/github-commits-cache',
                    '/api/version-info-cache'
                ]).catch(err => {
                    debugLog('Failed to cache resources:', err);
                });
            })
        );
        self.skipWaiting();
    });

    // Activate event - clean up old caches
    self.addEventListener('activate', event => {
        debugLog('Service Worker activating');
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            debugLog('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }).then(() => {
                self.clients.claim();
            })
        );
    });

    // Fetch event - handle caching for update-related requests
    self.addEventListener('fetch', event => {
        const url = new URL(event.request.url);

        // Only handle GitHub API requests
        if (url.hostname === 'api.github.com' && url.pathname.includes('/repos/sang765/HakoMonetTheme')) {
            event.respondWith(handleGitHubRequest(event.request));
        }
    });

    // Background sync for offline updates
    self.addEventListener('sync', event => {
        if (event.tag === 'hmt-update-sync') {
            event.waitUntil(processOfflineUpdates());
        }
    });

    // Push notifications for real-time updates (if supported)
    self.addEventListener('push', event => {
        if (event.data) {
            const data = event.data.json();
            const options = {
                body: data.body || 'HakoMonetTheme has an update available',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'hmt-update',
                requireInteraction: true,
                actions: [
                    { action: 'update', title: 'Update Now' },
                    { action: 'dismiss', title: 'Later' }
                ]
            };

            event.waitUntil(
                self.registration.showNotification(data.title || 'HakoMonetTheme Update', options)
            );
        }
    });

    // Handle notification clicks
    self.addEventListener('notificationclick', event => {
        event.notification.close();

        if (event.action === 'update') {
            event.waitUntil(
                clients.openWindow('https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js')
            );
        }
    });

    async function handleGitHubRequest(request) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        // Return cached response if available and not expired
        if (cachedResponse) {
            const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
            const now = new Date();

            if (now - cacheDate < CACHE_EXPIRY) {
                debugLog('Serving from ServiceWorker cache');
                return cachedResponse;
            } else {
                // Cache expired, clean it up
                await cache.delete(request);
            }
        }

        try {
            // Fetch fresh data
            const response = await fetch(request);
            if (response.ok) {
                // Clone the response for caching
                const responseClone = response.clone();
                const responseWithDate = new Response(responseClone.body, {
                    status: responseClone.status,
                    statusText: responseClone.statusText,
                    headers: {
                        ...Object.fromEntries(responseClone.headers.entries()),
                        'sw-cache-date': new Date().toISOString()
                    }
                });

                // Cache the response
                await cache.put(request, responseWithDate);
                debugLog('Cached GitHub response in ServiceWorker');
            }

            return response;
        } catch (error) {
            debugLog('Fetch failed, trying cache fallback:', error);

            // If network fails, try to return stale cache
            if (cachedResponse) {
                debugLog('Serving stale cache due to network failure');
                return cachedResponse;
            }

            throw error;
        }
    }

    async function processOfflineUpdates() {
        debugLog('Processing offline updates');

        try {
            // Get pending updates from IndexedDB or similar
            const updates = await getPendingUpdates();

            for (const update of updates) {
                try {
                    await processUpdate(update);
                    await markUpdateProcessed(update.id);
                } catch (error) {
                    debugLog('Failed to process update:', update.id, error);
                }
            }
        } catch (error) {
            debugLog('Error processing offline updates:', error);
        }
    }

    // Helper functions for offline queue management
    async function getPendingUpdates() {
        // This would integrate with the main script's offline queue
        // For now, return empty array as integration happens in main script
        return [];
    }

    async function processUpdate(update) {
        // Process individual update
        debugLog('Processing update:', update);
    }

    async function markUpdateProcessed(updateId) {
        // Mark update as processed
        debugLog('Marked update as processed:', updateId);
    }

    debugLog('HakoMonetTheme Service Worker loaded');

})();