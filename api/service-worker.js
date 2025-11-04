// Service Worker for HakoMonetTheme - Enhanced Offline Support
// Comprehensive caching, background sync, and thumbnail optimization

(function() {
    'use strict';

    // Configuration
    const DEBUG = true;
    const CACHE_VERSION = 'v2.0.0';
    const CACHE_EXPIRY = {
        THUMBNAILS: 7 * 24 * 60 * 60 * 1000, // 7 days for thumbnails
        STORY_DATA: 24 * 60 * 60 * 1000,     // 24 hours for story data
        STYLES: 48 * 60 * 60 * 1000,         // 48 hours for styles
        SCRIPTS: 12 * 60 * 60 * 1000         // 12 hours for scripts
    };

    // Cache names for different content types
    const CACHE_NAMES = {
        THUMBNAILS: `hmt-thumbnails-${CACHE_VERSION}`,
        STORY_DATA: `hmt-story-data-${CACHE_VERSION}`,
        STYLES: `hmt-styles-${CACHE_VERSION}`,
        SCRIPTS: `hmt-scripts-${CACHE_VERSION}`,
        FONTS: `hmt-fonts-${CACHE_VERSION}`,
        UPDATES: `hmt-updates-${CACHE_VERSION}`
    };

    // URLs and patterns to cache
    const CACHE_PATTERNS = {
        THUMBNAILS: [
            /\/series-cover\//,
            /\/img-in-ratio.*background-image/,
            /\.jpg$/, /\.jpeg$/, /\.png$/, /\.webp$/, /\.gif$/
        ],
        STORY_DATA: [
            /\/api\/story\//,
            /\/api\/chapter\//,
            /\/api\/series\//
        ],
        STYLES: [
            /styles\//,
            /\.css$/
        ],
        SCRIPTS: [
            /api\//,
            /class\//,
            /module\//,
            /\.js$/
        ],
        FONTS: [
            /fonts\//,
            /\.woff2?$/, /\.ttf$/, /\.otf$/
        ]
    };

    // Background sync tags
    const SYNC_TAGS = {
        STORY_UPDATES: 'hmt-story-sync',
        THUMBNAIL_PRELOAD: 'hmt-thumbnail-preload',
        OFFLINE_QUEUE: 'hmt-offline-queue'
    };

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[HMT ServiceWorker]', ...args);
        }
    }

    // Utility functions
    function isCacheExpired(cacheDate, cacheType) {
        const now = new Date();
        const expiry = CACHE_EXPIRY[cacheType] || CACHE_EXPIRY.STORY_DATA;
        return (now - new Date(cacheDate)) > expiry;
    }

    function getCacheNameForRequest(request) {
        const url = new URL(request.url);

        // Check patterns for each cache type
        for (const [cacheType, patterns] of Object.entries(CACHE_PATTERNS)) {
            if (patterns.some(pattern => pattern.test(url.href) || pattern.test(url.pathname))) {
                return CACHE_NAMES[cacheType];
            }
        }

        return null; // Not cacheable
    }

    function shouldCacheRequest(request) {
        const url = new URL(request.url);

        // Only cache GET requests
        if (request.method !== 'GET') return false;

        // Don't cache non-HTTPS in production
        if (location.protocol === 'https:' && url.protocol !== 'https:') return false;

        // Don't cache API requests with sensitive data
        if (url.searchParams.has('token') || url.searchParams.has('key')) return false;

        return getCacheNameForRequest(request) !== null;
    }

    // Install event - cache essential resources
    self.addEventListener('install', event => {
        debugLog('Service Worker installing');

        const essentialResources = [
            // Core styles and scripts
            'https://sang765.github.io/HakoMonetTheme/styles/series-enhancement.css',
            'https://sang765.github.io/HakoMonetTheme/styles/thumbnail-overlay.css',
            'https://sang765.github.io/HakoMonetTheme/styles/transparent-top.css',
            // Update checker API
            '/api/github-commits-cache',
            '/api/version-info-cache'
        ];

        event.waitUntil(
            Promise.all([
                // Cache essential resources
                caches.open(CACHE_NAMES.STYLES).then(cache => {
                    return cache.addAll(essentialResources.filter(url => url.includes('.css'))).catch(err => {
                        debugLog('Failed to cache essential styles:', err);
                    });
                }),
                caches.open(CACHE_NAMES.SCRIPTS).then(cache => {
                    return cache.addAll(essentialResources.filter(url => url.includes('.js') || url.startsWith('/api/'))).catch(err => {
                        debugLog('Failed to cache essential scripts:', err);
                    });
                })
            ]).then(() => {
                debugLog('Essential resources cached');
                self.skipWaiting();
            })
        );
    });

    // Activate event - clean up old caches and claim clients
    self.addEventListener('activate', event => {
        debugLog('Service Worker activating');

        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old caches that don't match current version
                        if (!Object.values(CACHE_NAMES).includes(cacheName)) {
                            debugLog('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }).then(() => {
                self.clients.claim();
                debugLog('Service Worker activated and claimed clients');
            })
        );
    });

    // Fetch event - comprehensive caching strategy
    self.addEventListener('fetch', event => {
        const url = new URL(event.request.url);

        // Handle different request types
        if (shouldCacheRequest(event.request)) {
            event.respondWith(handleCacheableRequest(event.request));
        } else if (url.hostname === 'api.github.com' && url.pathname.includes('/repos/sang765/HakoMonetTheme')) {
            // GitHub API requests for updates
            event.respondWith(handleGitHubRequest(event.request));
        } else if (url.pathname.startsWith('/api/thumbnail-preload')) {
            // Thumbnail preload requests
            event.respondWith(handleThumbnailPreload(event.request));
        }
    });

    // Background sync for offline operations
    self.addEventListener('sync', event => {
        debugLog('Background sync triggered:', event.tag);

        switch (event.tag) {
            case SYNC_TAGS.STORY_UPDATES:
                event.waitUntil(processStoryUpdates());
                break;
            case SYNC_TAGS.THUMBNAIL_PRELOAD:
                event.waitUntil(processThumbnailPreload());
                break;
            case SYNC_TAGS.OFFLINE_QUEUE:
                event.waitUntil(processOfflineQueue());
                break;
        }
    });

    // Push notifications for story updates
    self.addEventListener('push', event => {
        if (event.data) {
            const data = event.data.json();

            const options = {
                body: data.body || 'Có cập nhật truyện mới!',
                icon: data.icon || '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'hmt-story-update',
                requireInteraction: true,
                data: data.data || {},
                actions: [
                    { action: 'view', title: 'Xem ngay' },
                    { action: 'dismiss', title: 'Để sau' }
                ]
            };

            event.waitUntil(
                self.registration.showNotification(data.title || 'HakoMonetTheme - Truyện mới', options)
            );
        }
    });

    // Handle notification clicks
    self.addEventListener('notificationclick', event => {
        event.notification.close();

        if (event.action === 'view' && event.notification.data.url) {
            event.waitUntil(
                clients.openWindow(event.notification.data.url)
            );
        } else {
            // Default action - open main page
            event.waitUntil(
                clients.openWindow('/')
            );
        }
    });

    // Message handling for communication with main thread
    self.addEventListener('message', event => {
        const { type, data } = event.data;

        switch (type) {
            case 'PRELOAD_THUMBNAILS':
                handleThumbnailPreloadMessage(data);
                break;
            case 'CACHE_STORY_DATA':
                handleStoryDataCacheMessage(data);
                break;
            case 'CLEAR_CACHE':
                handleClearCacheMessage(data);
                break;
        }
    });

    // Main caching handler with cache-first strategy for static assets
    async function handleCacheableRequest(request) {
        const cacheName = getCacheNameForRequest(request);
        if (!cacheName) {
            return fetch(request);
        }

        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);

        // Check if cached response exists and is not expired
        if (cachedResponse) {
            const cacheDate = cachedResponse.headers.get('sw-cache-date');
            const cacheType = Object.keys(CACHE_NAMES).find(key => CACHE_NAMES[key] === cacheName);

            if (cacheDate && !isCacheExpired(cacheDate, cacheType)) {
                debugLog('Serving from cache:', request.url);
                return cachedResponse;
            } else {
                // Clean up expired cache
                await cache.delete(request);
            }
        }

        try {
            // Fetch fresh content
            const response = await fetch(request);

            if (response.ok) {
                // Clone and cache the response
                const responseClone = response.clone();
                const responseWithMetadata = new Response(responseClone.body, {
                    status: responseClone.status,
                    statusText: responseClone.statusText,
                    headers: {
                        ...Object.fromEntries(responseClone.headers.entries()),
                        'sw-cache-date': new Date().toISOString(),
                        'sw-cache-type': cacheName
                    }
                });

                await cache.put(request, responseWithMetadata);
                debugLog('Cached response:', request.url);
            }

            return response;
        } catch (error) {
            debugLog('Fetch failed, trying cache fallback:', error);

            // Return stale cache if available
            if (cachedResponse) {
                debugLog('Serving stale cache due to network failure');
                return cachedResponse;
            }

            throw error;
        }
    }

    // GitHub API handler for updates
    async function handleGitHubRequest(request) {
        const cache = await caches.open(CACHE_NAMES.UPDATES);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
            if (!isCacheExpired(cacheDate, 'UPDATES')) {
                return cachedResponse;
            } else {
                await cache.delete(request);
            }
        }

        try {
            const response = await fetch(request);
            if (response.ok) {
                const responseClone = response.clone();
                const responseWithDate = new Response(responseClone.body, {
                    status: responseClone.status,
                    statusText: responseClone.statusText,
                    headers: {
                        ...Object.fromEntries(responseClone.headers.entries()),
                        'sw-cache-date': new Date().toISOString()
                    }
                });
                await cache.put(request, responseWithDate);
            }
            return response;
        } catch (error) {
            if (cachedResponse) {
                return cachedResponse;
            }
            throw error;
        }
    }

    // Thumbnail preload handler
    async function handleThumbnailPreload(request) {
        const url = new URL(request.url);
        const imageUrls = url.searchParams.get('urls')?.split(',') || [];

        if (imageUrls.length === 0) {
            return new Response('No URLs provided', { status: 400 });
        }

        const cache = await caches.open(CACHE_NAMES.THUMBNAILS);
        const preloadPromises = imageUrls.map(async (imageUrl) => {
            try {
                const response = await fetch(imageUrl);
                if (response.ok) {
                    await cache.put(imageUrl, response);
                    debugLog('Preloaded thumbnail:', imageUrl);
                }
            } catch (error) {
                debugLog('Failed to preload thumbnail:', imageUrl, error);
            }
        });

        await Promise.allSettled(preloadPromises);
        return new Response('Preload complete', { status: 200 });
    }

    // Background sync handlers
    async function processStoryUpdates() {
        debugLog('Processing story updates');

        try {
            // Get pending story updates from IndexedDB/storage
            const updates = await getPendingStoryUpdates();

            for (const update of updates) {
                try {
                    await processStoryUpdate(update);
                    await markStoryUpdateProcessed(update.id);
                } catch (error) {
                    debugLog('Failed to process story update:', update.id, error);
                }
            }
        } catch (error) {
            debugLog('Error processing story updates:', error);
        }
    }

    async function processThumbnailPreload() {
        debugLog('Processing thumbnail preload queue');

        try {
            const preloadQueue = await getThumbnailPreloadQueue();

            for (const item of preloadQueue) {
                await preloadThumbnail(item.url);
                await removeFromPreloadQueue(item.id);
            }
        } catch (error) {
            debugLog('Error processing thumbnail preload:', error);
        }
    }

    async function processOfflineQueue() {
        debugLog('Processing offline queue');

        try {
            const queue = await getOfflineQueue();

            for (const item of queue) {
                try {
                    await processQueuedItem(item);
                    await removeFromOfflineQueue(item.id);
                } catch (error) {
                    debugLog('Failed to process offline item:', item.id, error);
                }
            }
        } catch (error) {
            debugLog('Error processing offline queue:', error);
        }
    }

    // Message handlers
    function handleThumbnailPreloadMessage(data) {
        const { urls, priority = 'normal' } = data;

        if (urls && Array.isArray(urls)) {
            // Add to preload queue with priority
            addToThumbnailPreloadQueue(urls, priority);

            // Register background sync if supported
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                self.registration.sync.register(SYNC_TAGS.THUMBNAIL_PRELOAD);
            }
        }
    }

    function handleStoryDataCacheMessage(data) {
        const { storyId, data: storyData } = data;

        if (storyId && storyData) {
            cacheStoryData(storyId, storyData);
        }
    }

    function handleClearCacheMessage(data) {
        const { cacheType } = data;

        if (cacheType && CACHE_NAMES[cacheType]) {
            caches.delete(CACHE_NAMES[cacheType]).then(() => {
                debugLog('Cleared cache:', cacheType);
            });
        } else {
            // Clear all caches
            Promise.all(Object.values(CACHE_NAMES).map(name => caches.delete(name))).then(() => {
                debugLog('Cleared all caches');
            });
        }
    }

    // Storage helpers (simplified - would use IndexedDB in production)
    async function getPendingStoryUpdates() {
        // In production, this would query IndexedDB
        return [];
    }

    async function getThumbnailPreloadQueue() {
        return [];
    }

    async function getOfflineQueue() {
        return [];
    }

    async function addToThumbnailPreloadQueue(urls, priority) {
        // Store in IndexedDB or similar
        debugLog('Added to thumbnail preload queue:', urls.length, 'items');
    }

    async function cacheStoryData(storyId, data) {
        const cache = await caches.open(CACHE_NAMES.STORY_DATA);
        const response = new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'sw-cache-date': new Date().toISOString()
            }
        });
        await cache.put(`/api/story/${storyId}`, response);
        debugLog('Cached story data:', storyId);
    }

    async function preloadThumbnail(url) {
        const cache = await caches.open(CACHE_NAMES.THUMBNAILS);
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
                debugLog('Preloaded thumbnail:', url);
            }
        } catch (error) {
            debugLog('Failed to preload thumbnail:', url, error);
        }
    }

    // Placeholder functions for production implementation
    async function processStoryUpdate(update) { /* Implementation */ }
    async function markStoryUpdateProcessed(id) { /* Implementation */ }
    async function removeFromPreloadQueue(id) { /* Implementation */ }
    async function processQueuedItem(item) { /* Implementation */ }
    async function removeFromOfflineQueue(id) { /* Implementation */ }

    debugLog('HakoMonetTheme Enhanced Service Worker loaded');

})();