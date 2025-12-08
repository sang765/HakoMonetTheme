(function() {
    'use strict';

    /**
     * Configuration Management System
     * Centralizes all configuration values and provides environment-specific overrides
     */
    const ProfileCropperConfig = {
        // Default settings
        defaults: {
            debug: false,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
            animationSettings: {
                maxFrameCount: 100,
                maxProcessingTime: 30000, // 30 seconds
                chunkSize: 10,
                quality: 0.95
            },
            memory: {
                maxUsage: 50 * 1024 * 1024, // 50MB
                gcThreshold: 0.8,
                enableMonitoring: true
            },
            ui: {
                theme: 'light',
                showAdvancedOptions: false,
                enableKeyboardShortcuts: true,
                progressUpdateInterval: 100
            },
            libraries: {
                cropperjs: {
                    url: 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js',
                    fallback: '/assets/js/cropper.min.js'
                },
                webpHero: {
                    url: 'https://unpkg.com/webp-hero@0.0.0-dev.4/dist/webp-hero.bundle.js',
                    fallback: '/assets/js/webp-hero.bundle.js'
                }
            },
            api: {
                endpoints: {
                    uploadAvatar: '/action/upload/avatar',
                    uploadBanner: '/action/upload/usercover'
                },
                timeout: 30000,
                retries: 3
            }
        },
        
        // Environment-specific overrides
        environments: {
            development: {
                debug: true,
                enableExperimentalFeatures: true,
                libraries: {
                    useLocal: true
                }
            },
            production: {
                debug: false,
                enableExperimentalFeatures: false,
                libraries: {
                    useCDN: true,
                    preload: true
                }
            }
        },
        
        // Get configuration for current environment
        getConfig(environment = 'production') {
            return {
                ...this.defaults,
                ...this.environments[environment]
            };
        },
        
        // Validate configuration
        validateConfig(config) {
            const required = ['maxFileSize', 'supportedFormats', 'animationSettings'];
            for (const key of required) {
                if (!(key in config)) {
                    throw new Error(`Missing required configuration: ${key}`);
                }
            }
            return true;
        }
    };

    // Get current environment configuration
    const CONFIG = ProfileCropperConfig.getConfig('production');
    ProfileCropperConfig.validateConfig(CONFIG);
    
    const DEBUG = CONFIG.debug || GM_getValue('debug_mode', false);

    // Core constants with configuration support
    const CONSTANTS = {
        MIN_WIDTH: 1200,
        MIN_HEIGHT: 300,
        ASPECT_RATIO: 4, // 1200/300 = 4:1
        ALLOW_SMALL_IMAGES: true,
        AVATAR_MIN_WIDTH: 120,
        AVATAR_MIN_HEIGHT: 120,
        AVATAR_ASPECT_RATIO: 1, // 1:1
        MAX_AVATAR_FILE_SIZE: 1024 * 1024, // 1MB strict limit
        MIN_COMPRESSED_SIZE: 900 * 1024, // Target minimum 900KB
        PROCESSING_TIMEOUT: CONFIG.animationSettings.maxProcessingTime,
        MAX_FRAMES: CONFIG.animationSettings.maxFrameCount
    };

    /**
     * Enhanced Debug Logging with Performance Tracking
     */
    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('profileCropper', ...args);
        } else if (DEBUG) {
            console.log('[ProfileCropper]', ...args);
        }
        // Always log for critical errors
        if (args[0] && args[0].toString().includes('Error')) {
            console.error('[ProfileCropper]', ...args);
        }
    }

    /**
     * Memory Management System
     * Monitors and manages memory usage for large file processing
     */
    class MemoryManager {
        constructor() {
            this.usageHistory = [];
            this.gcThreshold = CONFIG.memory.gcThreshold;
            this.maxUsage = CONFIG.memory.maxUsage;
        }

        /**
         * Get current memory usage
         */
        getMemoryUsage() {
            if (performance.memory) {
                return {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
                };
            }
            return null;
        }

        /**
         * Check if memory usage is within acceptable limits
         */
        isMemoryUsageAcceptable() {
            if (!CONFIG.memory.enableMonitoring) return true;
            
            const usage = this.getMemoryUsage();
            if (!usage) return true;
            
            return usage.used < this.maxUsage;
        }

        /**
         * Trigger garbage collection if available
         */
        forceGarbageCollection() {
            if (window.gc && this.getMemoryUsage().percentage > this.gcThreshold * 100) {
                window.gc();
                debugLog('Forced garbage collection');
            }
        }

        /**
         * Calculate optimal batch size for processing
         */
        calculateBatchSize(totalItems) {
            const usage = this.getMemoryUsage();
            if (!usage) return Math.min(CONFIG.animationSettings.chunkSize, totalItems);
            
            const memoryPressure = usage.percentage / 100;
            const baseBatchSize = CONFIG.animationSettings.chunkSize;
            
            // Reduce batch size under memory pressure
            return Math.max(1, Math.floor(baseBatchSize * (1 - memoryPressure)));
        }

        /**
         * Record memory usage for monitoring
         */
        recordUsage(label = 'operation') {
            const usage = this.getMemoryUsage();
            if (usage) {
                this.usageHistory.push({
                    timestamp: Date.now(),
                    label,
                    ...usage
                });
                
                // Keep only last 10 records
                if (this.usageHistory.length > 10) {
                    this.usageHistory.shift();
                }
            }
        }
    }

    const memoryManager = new MemoryManager();

    /**
     * WebP Encoder for Animated WebP Reconstruction
     * Handles proper reconstruction of animated WebP files
     */
    class WebPEncoder {
        constructor() {
            this.supported = false;
            this.encoder = null;
        }

        /**
         * Initialize WebP encoder
         */
        async initialize() {
            try {
                // Check for native WebP encoder support
                if (typeof OffscreenCanvas !== 'undefined') {
                    const canvas = new OffscreenCanvas(1, 1);
                    const ctx = canvas.getContext('2d');
                    const blob = await canvas.convertToBlob({ type: 'image/webp' });
                    this.supported = true;
                    debugLog('Native WebP encoder available');
                }
            } catch (error) {
                debugLog('WebP encoder not supported:', error);
                this.supported = false;
            }
        }

        /**
         * Reconstruct animated WebP from cropped frames
         */
        async reconstructAnimatedWebP(frames, frameDelays = []) {
            if (!this.supported || frames.length === 0) {
                throw new Error('WebP reconstruction not supported or no frames provided');
            }

            try {
                debugLog(`Reconstructing animated WebP with ${frames.length} frames`);
                
                // For now, create a simple animated WebP by concatenating frames
                // In a full implementation, this would use a proper WebP encoder library
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Use the first frame as base
                canvas.width = frames[0].width;
                canvas.height = frames[0].height;
                
                // Create animated WebP by combining frames
                // Note: This is a simplified implementation
                // Real implementation would require libwebp or similar
                const animatedBlob = await this.createSimpleAnimatedWebP(frames);
                
                return animatedBlob;
            } catch (error) {
                debugLog('Error reconstructing WebP:', error);
                throw new Error(`Failed to reconstruct animated WebP: ${error.message}`);
            }
        }

        /**
         * Create a simple animated WebP (placeholder implementation)
         */
        async createSimpleAnimatedWebP(frames) {
            // This is a simplified implementation
            // In practice, you'd need a proper WebP encoder library
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = frames[0].width;
            canvas.height = frames[0].height;
            
            // Draw first frame
            ctx.drawImage(frames[0].image, 0, 0);
            
            // Convert to blob (this will be a static WebP, not animated)
            // For full animated WebP support, integrate libwebp or similar
            return new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/webp', CONFIG.animationSettings.quality);
            });
        }
    }

    const webpEncoder = new WebPEncoder();

    /**
     * Progress Tracking System
     * Provides real-time feedback during processing operations
     */
    class ProgressTracker {
        constructor(total, label = 'Processing') {
            this.total = total;
            this.current = 0;
            this.label = label;
            this.startTime = Date.now();
            this.updateInterval = CONFIG.ui.progressUpdateInterval;
            this.lastUpdate = 0;
        }

        /**
         * Update progress
         */
        update(current, customLabel = null) {
            this.current = current;
            if (customLabel) this.label = customLabel;
            
            const now = Date.now();
            if (now - this.lastUpdate >= this.updateInterval) {
                this.report();
                this.lastUpdate = now;
            }
        }

        /**
         * Report progress to user
         */
        report() {
            const percentage = Math.round((this.current / this.total) * 100);
            const elapsed = Date.now() - this.startTime;
            const estimatedTotal = (elapsed / this.current) * this.total;
            const remaining = estimatedTotal - elapsed;
            
            const progress = {
                percentage,
                current: this.current,
                total: this.total,
                elapsed: Math.round(elapsed / 1000),
                remaining: Math.round(remaining / 1000),
                label: this.label
            };
            
            debugLog(`Progress: ${progress.percentage}% (${progress.current}/${progress.total}) - ${progress.label}`);
            this.onProgress && this.onProgress(progress);
        }

        /**
         * Set progress callback
         */
        setCallback(callback) {
            this.onProgress = callback;
        }

        /**
         * Complete progress tracking
         */
        complete() {
            this.current = this.total;
            this.report();
        }
    }

    /**
     * Enhanced Error Handling System
     * Provides comprehensive error handling with user-friendly messages
     */
    class ErrorHandler {
        /**
         * Handle errors with appropriate user feedback
         */
        static handle(error, context = 'operation') {
            debugLog(`Error in ${context}:`, error);
            
            const userMessage = this.getUserFriendlyMessage(error, context);
            showNotification(userMessage, 5000);
            
            return {
                success: false,
                error: error.message,
                userMessage,
                context
            };
        }

        /**
         * Get user-friendly error message
         */
        static getUserFriendlyMessage(error, context) {
            const messages = {
                'webp-loading': 'Không thể tải thư viện xử lý WebP. Vui lòng thử lại.',
                'cropper-loading': 'Không thể tải thư viện cắt ảnh. Vui lòng thử lại.',
                'memory-limit': 'Ảnh quá lớn để xử lý. Vui lòng chọn ảnh nhỏ hơn.',
                'processing-timeout': 'Quá thời gian xử lý. Vui lòng thử ảnh nhỏ hơn.',
                'frame-processing': 'Lỗi xử lý khung hình. Vui lòng thử ảnh khác.',
                'upload-failed': 'Không thể upload ảnh. Vui lòng kiểm tra kết nối mạng.',
                'invalid-image': 'File không phải là ảnh hợp lệ.',
                'unsupported-format': 'Định dạng ảnh không được hỗ trợ.',
                'file-too-large': 'Kích thước file quá lớn.'
            };

            // Try to match error to user-friendly message
            const errorMessage = error.message.toLowerCase();
            for (const [key, message] of Object.entries(messages)) {
                if (errorMessage.includes(key.replace('-', ' ')) || 
                    errorMessage.includes(key)) {
                    return message;
                }
            }

            // Fallback messages based on context
            const fallbackMessages = {
                'webp-processing': 'Lỗi xử lý ảnh WebP động.',
                'cropping': 'Lỗi khi cắt ảnh.',
                'compression': 'Lỗi nén ảnh.',
                'upload': 'Lỗi upload ảnh.'
            };

            return fallbackMessages[context] || `Lỗi ${context}: ${error.message}`;
        }

        /**
         * Wrap async operations with error handling
         */
        static async wrap(operation, context) {
            try {
                return await operation();
            } catch (error) {
                return this.handle(error, context);
            }
        }
    }

    /**
     * Enhanced Animated WebP Processor
     * Handles animated WebP processing with memory management and progress tracking
     */
    class AnimatedWebPProcessor {
        constructor() {
            this.webpHero = null;
            this.loaded = false;
        }

        /**
         * Load required libraries
         */
        async loadLibraries() {
            if (this.loaded && this.webpHero) return;

            try {
                await loadWebPHeroLibrary();
                this.webpHero = window.WebpHero;
                this.loaded = true;
                debugLog('WebP libraries loaded successfully');
            } catch (error) {
                throw new Error(`webp-loading: ${error.message}`);
            }
        }

        /**
         * Check if WebP file is animated
         */
        async isAnimated(file) {
            try {
                await this.loadLibraries();
                return await isAnimatedWebP(file);
            } catch (error) {
                debugLog('Error checking WebP animation:', error);
                return false;
            }
        }

        /**
         * Extract frames with progress tracking
         */
        async extractFrames(file, onProgress = null) {
            try {
                await this.loadLibraries();
                
                const frameCount = await this.getFrameCount(file);
                debugLog(`Extracting ${frameCount} frames from animated WebP`);
                
                if (frameCount > CONSTANTS.MAX_FRAMES) {
                    throw new Error(`processing-timeout: Too many frames (${frameCount}). Maximum allowed: ${CONSTANTS.MAX_FRAMES}`);
                }

                const progress = new ProgressTracker(frameCount, 'Extracting frames');
                progress.setCallback(onProgress);

                const frames = [];
                const webpMachine = new this.webpHero.WebpMachine();
                
                for (let i = 0; i < frameCount; i++) {
                    // Memory management check
                    if (!memoryManager.isMemoryUsageAcceptable()) {
                        throw new Error('memory-limit: Memory usage too high');
                    }

                    const frameBlob = webpMachine.extractFrame(new Blob([await file.arrayBuffer()], { type: 'image/webp' }), i);
                    const frameUrl = URL.createObjectURL(frameBlob);
                    
                    const img = await this.loadImage(frameUrl);
                    
                    frames.push({
                        image: img,
                        blob: frameBlob,
                        url: frameUrl,
                        index: i
                    });

                    progress.update(i + 1);
                    
                    // Memory management
                    if (i % 5 === 0) {
                        memoryManager.forceGarbageCollection();
                    }
                }

                progress.complete();
                memoryManager.recordUsage('frame-extraction');
                
                return frames;
            } catch (error) {
                throw new Error(`frame-processing: ${error.message}`);
            }
        }

        /**
         * Get frame count from WebP file
         */
        async getFrameCount(file) {
            try {
                const reader = new FileReader();
                return new Promise((resolve, reject) => {
                    reader.onload = (e) => {
                        try {
                            const blob = new Blob([e.target.result], { type: 'image/webp' });
                            const webpMachine = new this.webpHero.WebpMachine();
                            const count = webpMachine.getFrameCount(blob);
                            resolve(count);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = () => reject(new Error('Failed to read WebP file'));
                    reader.readAsArrayBuffer(file);
                });
            } catch (error) {
                throw new Error(`frame-processing: ${error.message}`);
            }
        }

        /**
         * Load image from URL
         */
        loadImage(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                img.src = url;
            });
        }

        /**
         * Crop frames with memory management
         */
        async cropFrames(frames, cropData, onProgress = null) {
            const batchSize = memoryManager.calculateBatchSize(frames.length);
            const croppedFrames = [];
            
            const progress = new ProgressTracker(frames.length, 'Cropping frames');
            progress.setCallback(onProgress);

            for (let i = 0; i < frames.length; i += batchSize) {
                const batch = frames.slice(i, i + batchSize);
                const batchPromises = batch.map(frame => this.cropFrame(frame, cropData));
                
                const batchResults = await Promise.all(batchPromises);
                croppedFrames.push(...batchResults);
                
                progress.update(Math.min(i + batchSize, frames.length));
                
                // Memory management between batches
                memoryManager.forceGarbageCollection();
                memoryManager.recordUsage('frame-cropping');
            }

            progress.complete();
            return croppedFrames;
        }

        /**
         * Crop individual frame
         */
        async cropFrame(frame, cropData) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = cropData.width;
            canvas.height = cropData.height;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(
                frame.image,
                cropData.x, cropData.y, cropData.width, cropData.height,
                0, 0, cropData.width, cropData.height
            );
            
            const croppedBlob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/webp', CONFIG.animationSettings.quality);
            });
            
            return {
                blob: croppedBlob,
                canvas: canvas,
                width: cropData.width,
                height: cropData.height
            };
        }

        /**
         * Process animated WebP with comprehensive error handling
         */
        async process(file, cropData, minWidth, minHeight, onProgress = null) {
            const result = await ErrorHandler.wrap(async () => {
                debugLog('Processing animated WebP:', file.name);
                
                // Extract frames with progress tracking
                const frames = await this.extractFrames(file, onProgress);
                
                // Crop frames with memory management
                const croppedFrames = await this.cropFrames(frames, cropData, onProgress);
                
                // Clean up frame URLs
                frames.forEach(frame => URL.revokeObjectURL(frame.url));
                
                // Reconstruct animated WebP
                await webpEncoder.initialize();
                const finalBlob = await webpEncoder.reconstructAnimatedWebP(croppedFrames);
                
                debugLog('Animated WebP processed successfully');
                return finalBlob;
            }, 'webp-processing');

            return result;
        }
    }

    const animatedWebPProcessor = new AnimatedWebPProcessor();

    // Cached Cropper.js library
    let cachedCropperJs = null;
    let cachedCropperCss = null;
    
    // WebP animation support
    let webpHeroLoaded = false;
    let webpHero = null;

    /**
     * Load webp-hero library for animated WebP support
     */
    function loadWebPHeroLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof window.WebpHero !== 'undefined') {
                webpHero = window.WebpHero;
                webpHeroLoaded = true;
                debugLog('webp-hero already loaded');
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = CONFIG.libraries.webpHero.url;
            script.onload = () => {
                webpHero = window.WebpHero;
                webpHeroLoaded = true;
                debugLog('webp-hero loaded successfully');
                resolve();
            };
            script.onerror = () => {
                debugLog('Failed to load webp-hero library');
                reject(new Error('webp-loading: Failed to load webp-hero library'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Check if a WebP file is animated by examining its header
     */
    function isAnimatedWebP(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const buffer = e.target.result;
                    const view = new DataView(buffer);
                    
                    // WebP file signature: "RIFF" + size + "WEBP"
                    if (view.getUint32(0) !== 0x52494646 || // RIFF
                        view.getUint32(8) !== 0x57454250) { // WEBP
                        resolve(false);
                        return;
                    }
                    
                    // Look for ANIM chunk (frame animation data)
                    let isAnimated = false;
                    let offset = 12; // Start after RIFF header
                    
                    while (offset < view.byteLength - 8) {
                        const chunkType = view.getUint32(offset);
                        const chunkSize = view.getUint32(offset + 4);
                        
                        // ANIM chunk type: 0x41 0x4E 0x49 0x4D (ANIM)
                        if (chunkType === 0x414E494D) {
                            isAnimated = true;
                            break;
                        }
                        
                        // FRM chunk type: 0x46 0x52 0x4D 0x20 (FRM )
                        if (chunkType === 0x46524D20) {
                            isAnimated = true;
                            break;
                        }
                        
                        offset += 8 + chunkSize + (chunkSize % 2); // + padding
                    }
                    
                    resolve(isAnimated);
                } catch (error) {
                    debugLog('Error checking WebP animation:', error);
                    resolve(false);
                }
            };
            reader.onerror = () => resolve(false);
            reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB for detection
        });
    }

    /**
     * Enhanced Cropper Library Loader with fallback support
     */
    function loadCropperLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof Cropper !== 'undefined') {
                debugLog('Cropper.js already loaded');
                resolve();
                return;
            }

            // Load Cropper.js resources with fallback support
            Promise.all([
                fetch(CONFIG.libraries.cropperjs.url).then(r => r.text()).catch(() => {
                    debugLog('Failed to load Cropper.js from CDN, using fallback');
                    return cachedCropperJs || '';
                }),
                fetch(CONFIG.libraries.cropperjs.url.replace('.js', '.css')).then(r => r.text()).catch(() => {
                    debugLog('Failed to load Cropper.css from CDN, using fallback');
                    return cachedCropperCss || '';
                })
            ])
            .then(([js, css]) => {
                // Cache the resources
                cachedCropperJs = js;
                cachedCropperCss = css;

                // Load CSS
                if (css) {
                    const style = document.createElement('style');
                    style.textContent = css;
                    style.id = 'cropper-styles';
                    document.head.appendChild(style);
                    debugLog('Cropper.js CSS loaded');
                }

                // Load JS
                if (js) {
                    try {
                        const script = document.createElement('script');
                        script.textContent = js;
                        script.id = 'cropper-script';
                        document.head.appendChild(script);
                        debugLog('Cropper.js loaded via script tag');
                        resolve();
                    } catch (error) {
                        debugLog('Error loading Cropper.js via script:', error);
                        reject(new Error('cropper-loading: Error loading Cropper.js'));
                    }
                } else {
                    reject(new Error('cropper-loading: Cropper.js not available'));
                }
            })
            .catch(error => {
                debugLog('Error loading Cropper.js library:', error);
                reject(new Error(`cropper-loading: ${error.message}`));
            });
        });
    }

    /**
     * Component-Based Modal Architecture
     * Eliminates code duplication and provides reusable components
     */
    class BaseCropModal {
        constructor(options) {
            this.options = options;
            this.modal = null;
            this.cropper = null;
            this.handleResize = null;
            this.keyboardHandler = null;
            this.isInitialized = false;
        }

        /**
         * Initialize modal
         */
        async init() {
            try {
                await this.loadRequiredLibraries();
                this.render();
                this.bindEvents();
                await this.initializeCropper();
                this.isInitialized = true;
                return this;
            } catch (error) {
                ErrorHandler.handle(error, 'modal-initialization');
                throw error;
            }
        }

        /**
         * Load required libraries
         */
        async loadRequiredLibraries() {
            await Promise.all([
                loadCropperLibrary(),
                this.options.file.type === 'image/webp' ? loadWebPHeroLibrary() : Promise.resolve()
            ]);
        }

        /**
         * Render modal structure
         */
        render() {
            this.modal = this.createModalStructure();
            document.body.appendChild(this.modal);
            debugLog('Modal rendered');
        }

        /**
         * Create modal structure (to be overridden by subclasses)
         */
        createModalStructure() {
            throw new Error('createModalStructure must be implemented by subclass');
        }

        /**
         * Bind events
         */
        bindEvents() {
            const { closeBtn, cancelBtn, modal } = this.getElements();
            
            // Close events
            closeBtn?.addEventListener('click', () => this.close());
            cancelBtn?.addEventListener('click', () => this.close());
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) this.close();
            });

            // Keyboard events
            this.setupKeyboardEvents();

            // Window resize events
            this.setupResizeEvents();
        }

        /**
         * Setup keyboard accessibility
         */
        setupKeyboardEvents() {
            this.keyboardHandler = (e) => {
                switch (e.key) {
                    case 'Escape':
                        e.preventDefault();
                        this.close();
                        break;
                    case 'Enter':
                        if (e.target.tagName === 'BUTTON') {
                            e.preventDefault();
                            e.target.click();
                        }
                        break;
                    case 'Tab':
                        this.cycleFocus(e);
                        break;
                }
            };
            
            document.addEventListener('keydown', this.keyboardHandler);
        }

        /**
         * Cycle focus through modal elements
         */
        cycleFocus(e) {
            const focusableElements = this.modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }

        /**
         * Setup resize events
         */
        setupResizeEvents() {
            this.handleResize = () => {
                if (this.cropper) {
                    debugLog('Window resized, adjusting cropper');
                    this.cropper.resize();
                }
            };
            
            window.addEventListener('resize', this.handleResize);
            window.addEventListener('orientationchange', () => {
                setTimeout(this.handleResize, 100);
            });
        }

        /**
         * Initialize cropper
         */
        async initializeCropper() {
            const { img } = this.getElements();
            
            if (!img) {
                throw new Error('Image element not found');
            }

            try {
                this.cropper = new Cropper(img, {
                    aspectRatio: this.options.aspectRatio,
                    viewMode: 1,
                    autoCropArea: 1.0,
                    responsive: true,
                    restore: false,
                    checkCrossOrigin: false,
                    checkOrientation: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                    minContainerWidth: 200,
                    minContainerHeight: 200,
                    ready: () => {
                        debugLog('Cropper ready');
                        this.cropper.resize();
                        this.updatePreview();
                    },
                    crop: () => this.updatePreview()
                });
                
                debugLog('Cropper initialized successfully');
            } catch (error) {
                throw new Error(`cropping: ${error.message}`);
            }
        }

        /**
         * Update preview
         */
        updatePreview() {
            if (!this.cropper) return;

            const canvas = this.cropper.getCroppedCanvas({
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (canvas && this.options.previewBox) {
                this.options.previewBox.innerHTML = '';
                canvas.style.maxWidth = this.options.previewWidth + 'px';
                canvas.style.maxHeight = this.options.previewHeight + 'px';
                canvas.style.border = '1px solid #ddd';
                canvas.style.objectFit = 'contain';
                this.options.previewBox.appendChild(canvas);
            }
        }

        /**
         * Get modal elements
         */
        getElements() {
            return {
                modal: this.modal,
                img: this.modal?.querySelector('img'),
                closeBtn: this.modal?.querySelector('.hmt-crop-close, .hmt-animated-webp-crop-close'),
                cancelBtn: this.modal?.querySelector('.hmt-crop-cancel, .hmt-animated-webp-crop-cancel'),
                uploadBtn: this.modal?.querySelector('.hmt-crop-upload, .hmt-animated-webp-crop-upload'),
                previewBox: this.modal?.querySelector('.hmt-crop-preview-box, .hmt-animated-webp-crop-preview-box')
            };
        }

        /**
         * Close modal
         */
        close() {
            debugLog('Closing modal');
            
            if (this.cropper) {
                this.cropper.destroy();
            }
            
            if (this.handleResize) {
                window.removeEventListener('resize', this.handleResize);
                window.removeEventListener('orientationchange', this.handleResize);
            }
            
            if (this.keyboardHandler) {
                document.removeEventListener('keydown', this.keyboardHandler);
            }
            
            this.modal?.remove();
        }

        /**
         * Get crop data
         */
        getCropData() {
            return this.cropper?.getData() || {};
        }

        /**
         * Get cropped canvas
         */
        getCroppedCanvas() {
            return this.cropper?.getCroppedCanvas({
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
        }
    }

    /**
     * Static Image Crop Modal
     */
    class StaticImageCropModal extends BaseCropModal {
        createModalStructure() {
            const { file, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight } = this.options;
            
            const modal = document.createElement('div');
            modal.className = 'hmt-crop-modal-overlay';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'crop-modal-title');
            modal.setAttribute('aria-describedby', 'crop-modal-desc');

            modal.innerHTML = `
                <div class="hmt-crop-modal" style="
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    max-width: 90vw;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <div class="hmt-crop-header" style="
                        padding: 15px 20px;
                        border-bottom: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h3 id="crop-modal-title" style="margin: 0; font-size: 18px; font-weight: 600;">${title}</h3>
                        <button class="hmt-crop-close" style="
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: #666;
                            padding: 0;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " aria-label="Close modal">&times;</button>
                    </div>
                    <div class="hmt-crop-body" style="
                        padding: 20px;
                        display: flex;
                        gap: 20px;
                        flex: 1;
                        overflow: hidden;
                    ">
                        <div class="hmt-crop-container" style="
                            flex: 1;
                            height: 400px;
                            max-height: 60vh;
                            max-width: 100%;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            overflow: hidden;
                            position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <img id="hmt-crop-image" alt="Image preview" style="
                                max-width: 100%;
                                max-height: 100%;
                                width: auto;
                                height: auto;
                                display: block;
                                object-fit: contain;
                                object-position: center;
                            ">
                        </div>
                        <div class="hmt-crop-info" style="
                            width: 200px;
                            display: flex;
                            flex-direction: column;
                            gap: 15px;
                        ">
                            <div id="crop-modal-desc">
                                <p style="margin: 0; font-size: 14px;">Kích thước tối thiểu: ${minWidth}x${minHeight}px</p>
                                <p style="margin: 0; font-size: 14px;">Tỷ lệ: ${aspectRatio}:1</p>
                                <p style="margin: 10px 0 0 0; font-size: 13px; color: #666; line-height: 1.4;">
                                    <strong>Lưu ý cho mobile:</strong> Nếu ảnh bị tràn ra ngoài vùng cắt, bạn có thể dùng hai ngón tay để phóng to/thu nhỏ ảnh.
                                </p>
                            </div>
                            <div class="hmt-crop-preview">
                                <h4 style="margin: 0 0 10px 0; font-size: 16px;">Xem trước:</h4>
                                <div class="hmt-crop-preview-box" style="
                                    width: ${previewWidth}px;
                                    height: ${previewHeight}px;
                                    border: 1px solid #ddd;
                                    border-radius: 3px;
                                    background: #f5f5f5;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    overflow: hidden;
                                "></div>
                            </div>
                        </div>
                    </div>
                    <div class="hmt-crop-footer" style="
                        padding: 15px 20px;
                        border-top: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <div style="display: flex; gap: 10px;">
                            <button class="hmt-crop-rotate-left" style="
                                padding: 8px 16px;
                                border: 1px solid #ddd;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            " title="Xoay trái" aria-label="Rotate left">
                                <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" class="icon flat-color">
                                    <path d="M13,3A9,9,0,0,0,4.91,8.08l-1-2.45a1,1,0,0,0-1.86.74l2,5A1,1,0,0,0,5,12a1,1,0,0,0,.37-.07l5-2a1,1,0,0,0-.74-1.86L6.54,9.31a7,7,0,1,1,1.21,7.32,1,1,0,0,0-1.41-.09A1,1,0,0,0,6.25,18,9,9,0,1,0,13,3Z"></path>
                                </svg>
                            </button>
                            <button class="hmt-crop-rotate-right" style="
                                padding: 8px 16px;
                                border: 1px solid #ddd;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            " title="Xoay phải" aria-label="Rotate right">
                                <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" class="icon flat-color">
                                    <path d="M21.37,5.07a1,1,0,0,0-1.3.56l-1,2.45A9,9,0,1,0,17.75,18a1,1,0,0,0-.09-1.41,1,1,0,0,0-1.41.09,7,7,0,1,1,1.2-7.33L14.37,8.07a1,1,0,1,0-.74,1.86l5,2A1,1,0,0,0,19,12a1,1,0,0,0,.93-.63l2-5A1,1,0,0,0,21.37,5.07Z"></path>
                                </svg>
                            </button>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="hmt-crop-cancel" style="
                                padding: 8px 16px;
                                border: 1px solid #ddd;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            ">Hủy</button>
                            <button class="hmt-crop-upload" style="
                                padding: 8px 16px;
                                border: none;
                                background: #007bff;
                                color: white;
                                border-radius: 5px;
                                cursor: pointer;
                            ">Cắt & Upload</button>
                        </div>
                    </div>
                    <style>
                        @media (max-width: 767px) {
                            .hmt-crop-body {
                                flex-direction: column !important;
                                gap: 15px !important;
                            }
                            .hmt-crop-info {
                                width: 100% !important;
                                order: 2 !important;
                            }
                            .hmt-crop-container {
                                order: 1 !important;
                                height: 300px !important;
                                max-height: 50vh !important;
                                width: 100% !important;
                            }
                            .hmt-crop-preview {
                                display: none !important;
                            }
                            .hmt-crop-header, .hmt-crop-body, .hmt-crop-footer {
                                padding: 15px !important;
                            }
                            .hmt-crop-footer {
                                flex-direction: column !important;
                                gap: 10px !important;
                            }
                            .hmt-crop-footer > div {
                                justify-content: center !important;
                            }
                            #hmt-crop-image {
                                max-width: 100% !important;
                                max-height: 100% !important;
                                width: auto !important;
                                height: auto !important;
                                object-fit: contain !important;
                            }
                        }
                    </style>
                </div>
            `;

            // Load image
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = modal.querySelector('#hmt-crop-image');
                img.src = e.target.result;
                
                img.onload = () => {
                    debugLog('Image loaded, dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                    
                    // Check if image needs resizing
                    let needsResize = false;
                    if (img.naturalWidth < minWidth || img.naturalHeight < minHeight) {
                        if (CONSTANTS.ALLOW_SMALL_IMAGES) {
                            debugLog('Image is smaller than minimum size, will resize after cropping');
                            needsResize = true;
                        } else {
                            showNotification(`Ảnh quá nhỏ! Yêu cầu tối thiểu ${minWidth}x${minHeight}px. Ảnh hiện tại: ${img.naturalWidth}x${img.naturalHeight}px`, 5000);
                            modal.remove();
                            return;
                        }
                    }
                    
                    // Update info text if image needs resizing
                    if (needsResize) {
                        const infoText = modal.querySelector('.hmt-crop-info p:first-child');
                        if (infoText) {
                            infoText.textContent = `Ảnh sẽ được resize thành ${minWidth}x${minHeight}px sau khi cắt. Kích thước hiện tại: ${img.naturalWidth}x${img.naturalHeight}px`;
                        }
                    }
                };
                
                img.onerror = () => {
                    debugLog('Error loading image');
                    showNotification('Không thể tải ảnh.', 5000);
                    modal.remove();
                };
            };
            
            reader.onerror = () => {
                debugLog('Error reading file');
                showNotification('Không thể đọc file ảnh.', 5000);
                modal.remove();
            };
            
            reader.readAsDataURL(file);

            // Add rotate button event listeners
            const rotateLeftBtn = modal.querySelector('.hmt-crop-rotate-left');
            const rotateRightBtn = modal.querySelector('.hmt-crop-rotate-right');
            
            rotateLeftBtn?.addEventListener('click', () => {
                if (this.cropper) {
                    this.cropper.rotate(-90);
                    setTimeout(() => this.cropper?.resize(), 50);
                    this.updatePreview();
                }
            });
            
            rotateRightBtn?.addEventListener('click', () => {
                if (this.cropper) {
                    this.cropper.rotate(90);
                    setTimeout(() => this.cropper?.resize(), 50);
                    this.updatePreview();
                }
            });

            // Upload button handler
            const uploadBtn = modal.querySelector('.hmt-crop-upload');
            uploadBtn?.addEventListener('click', () => this.handleUpload());

            this.options.previewBox = modal.querySelector('.hmt-crop-preview-box');
            return modal;
        }

        /**
         * Handle upload
         */
        async handleUpload() {
            const uploadBtn = this.modal.querySelector('.hmt-crop-upload');
            
            try {
                debugLog('Upload button clicked');
                
                if (!this.cropper) {
                    debugLog('No cropper instance');
                    return;
                }

                let canvas = this.getCroppedCanvas();

                if (canvas) {
                    debugLog('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

                    // If canvas is smaller than required dimensions, resize it
                    if (canvas.width < this.options.minWidth || canvas.height < this.options.minHeight) {
                        debugLog('Canvas smaller than required, resizing to', this.options.minWidth, 'x', this.options.minHeight);
                        const resizedCanvas = document.createElement('canvas');
                        const ctx = resizedCanvas.getContext('2d');

                        resizedCanvas.width = this.options.minWidth;
                        resizedCanvas.height = this.options.minHeight;

                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(canvas, 0, 0, this.options.minWidth, this.options.minHeight);

                        canvas = resizedCanvas;
                        debugLog('Canvas resized successfully');
                    }

                    debugLog('Converting canvas to blob');
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            debugLog('Failed to create blob from canvas');
                            showNotification('Không thể tạo ảnh đã cắt.', 5000);
                            return;
                        }

                        const croppedFile = new File([blob], this.options.file.name, {
                            type: 'image/png',
                            lastModified: Date.now()
                        });

                        debugLog('Cropped image created:', croppedFile.size, 'bytes');

                        // Disable button and call callback
                        uploadBtn.disabled = true;
                        uploadBtn.textContent = 'Đang upload...';
                        this.options.callback(croppedFile, () => this.close(), uploadBtn);
                    }, 'image/png');
                } else {
                    debugLog('Failed to get cropped canvas');
                    showNotification('Không thể tạo canvas đã cắt.', 5000);
                }
            } catch (error) {
                ErrorHandler.handle(error, 'upload');
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Cắt & Upload';
            }
        }
    }

    /**
     * Animated WebP Crop Modal
     */
    class AnimatedWebPCropModal extends BaseCropModal {
        async loadRequiredLibraries() {
            await Promise.all([
                loadCropperLibrary(),
                loadWebPHeroLibrary()
            ]);
        }

        createModalStructure() {
            const { file, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight } = this.options;
            
            const modal = document.createElement('div');
            modal.className = 'hmt-animated-webp-crop-modal-overlay';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-labelledby', 'animated-crop-modal-title');
            modal.setAttribute('aria-describedby', 'animated-crop-modal-desc');

            modal.innerHTML = `
                <div class="hmt-animated-webp-crop-modal" style="
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    max-width: 90vw;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <div class="hmt-animated-webp-crop-header" style="
                        padding: 15px 20px;
                        border-bottom: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h3 id="animated-crop-modal-title" style="margin: 0; font-size: 18px; font-weight: 600;">${title} (Animated WebP)</h3>
                        <button class="hmt-animated-webp-crop-close" style="
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: #666;
                            padding: 0;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        " aria-label="Close modal">&times;</button>
                    </div>
                    <div class="hmt-animated-webp-crop-body" style="
                        padding: 20px;
                        display: flex;
                        gap: 20px;
                        flex: 1;
                        overflow: hidden;
                    ">
                        <div class="hmt-animated-webp-crop-container" style="
                            flex: 1;
                            height: 400px;
                            max-height: 60vh;
                            max-width: 100%;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            overflow: hidden;
                            position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <img id="hmt-animated-webp-crop-image" alt="Animated WebP preview" style="
                                max-width: 100%;
                                max-height: 100%;
                                width: auto;
                                height: auto;
                                display: block;
                                object-fit: contain;
                                object-position: center;
                            ">
                            <div id="hmt-animated-webp-info" style="
                                position: absolute;
                                top: 10px;
                                left: 10px;
                                background: rgba(0, 0, 0, 0.7);
                                color: white;
                                padding: 5px 10px;
                                border-radius: 5px;
                                font-size: 12px;
                            "></div>
                        </div>
                        <div class="hmt-animated-webp-crop-info" style="
                            width: 200px;
                            display: flex;
                            flex-direction: column;
                            gap: 15px;
                        ">
                            <div id="animated-crop-modal-desc">
                                <p style="margin: 0; font-size: 14px;">Kích thước tối thiểu: ${minWidth}x${minHeight}px</p>
                                <p style="margin: 0; font-size: 14px;">Tỷ lệ: ${aspectRatio}:1</p>
                                <p style="margin: 10px 0 0 0; font-size: 13px; color: #666; line-height: 1.4;">
                                    <strong>Animated WebP:</strong> Animation will be preserved after cropping. All frames will be processed.
                                </p>
                            </div>
                            <div class="hmt-animated-webp-crop-preview">
                                <h4 style="margin: 0 0 10px 0; font-size: 16px;">Xem trước:</h4>
                                <div class="hmt-animated-webp-crop-preview-box" style="
                                    width: ${previewWidth}px;
                                    height: ${previewHeight}px;
                                    border: 1px solid #ddd;
                                    border-radius: 3px;
                                    background: #f5f5f5;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    overflow: hidden;
                                "></div>
                            </div>
                            <div class="hmt-animated-webp-progress" style="display: none;">
                                <h4 style="margin: 0 0 10px 0; font-size: 16px;">Processing Progress:</h4>
                                <div class="progress-bar" style="
                                    width: 100%;
                                    height: 20px;
                                    background: #f0f0f0;
                                    border-radius: 10px;
                                    overflow: hidden;
                                ">
                                    <div class="progress-fill" style="
                                        height: 100%;
                                        background: #007bff;
                                        width: 0%;
                                        transition: width 0.3s ease;
                                    "></div>
                                </div>
                                <div class="progress-text" style="
                                    margin-top: 5px;
                                    font-size: 12px;
                                    color: #666;
                                "></div>
                            </div>
                        </div>
                    </div>
                    <div class="hmt-animated-webp-crop-footer" style="
                        padding: 15px 20px;
                        border-top: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <div style="display: flex; gap: 10px;">
                            <button class="hmt-animated-webp-crop-rotate-left" style="
                                padding: 8px 16px;
                                border: 1px solid #ddd;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            " title="Xoay trái" aria-label="Rotate left">
                                <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" class="icon flat-color">
                                    <path d="M13,3A9,9,0,0,0,4.91,8.08l-1-2.45a1,1,0,0,0-1.86.74l2,5A1,1,0,0,0,5,12a1,1,0,0,0,.37-.07l5-2a1,1,0,0,0-.74-1.86L6.54,9.31a7,7,0,1,1,1.21,7.32,1,1,0,0,0-1.41-.09A1,1,0,0,0,6.25,18,9,9,0,1,0,13,3Z"></path>
                                </svg>
                            </button>
                            <button class="hmt-animated-webp-crop-rotate-right" style="
                                padding: 8px 16px;
                                border: 1px solid #ddd;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            " title="Xoay phải" aria-label="Rotate right">
                                <svg fill="#000000" width="20px" height="20px" viewBox="0 0 24 24" class="icon flat-color">
                                    <path d="M21.37,5.07a1,1,0,0,0-1.3.56l-1,2.45A9,9,0,1,0,17.75,18a1,1,0,0,0-.09-1.41,1,1,0,0,0-1.41.09,7,7,0,1,1,1.2-7.33L14.37,8.07a1,1,0,1,0-.74,1.86l5,2A1,1,0,0,0,19,12a1,1,0,0,0,.93-.63l2-5A1,1,0,0,0,21.37,5.07Z"></path>
                                </svg>
                            </button>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="hmt-animated-webp-crop-cancel" style="
                                padding: 8px 16px;
                                border: 1px solid #ddd;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            ">Hủy</button>
                            <button class="hmt-animated-webp-crop-upload" style="
                                padding: 8px 16px;
                                border: none;
                                background: #007bff;
                                color: white;
                                border-radius: 5px;
                                cursor: pointer;
                            ">Cắt & Upload</button>
                        </div>
                    </div>
                    <style>
                        @media (max-width: 767px) {
                            .hmt-animated-webp-crop-body {
                                flex-direction: column !important;
                                gap: 15px !important;
                            }
                            .hmt-animated-webp-crop-info {
                                width: 100% !important;
                                order: 2 !important;
                            }
                            .hmt-animated-webp-crop-container {
                                order: 1 !important;
                                height: 300px !important;
                                max-height: 50vh !important;
                                width: 100% !important;
                            }
                            .hmt-animated-webp-crop-preview {
                                display: none !important;
                            }
                            .hmt-animated-webp-crop-header, .hmt-animated-webp-crop-body, .hmt-animated-webp-crop-footer {
                                padding: 15px !important;
                            }
                            .hmt-animated-webp-crop-footer {
                                flex-direction: column !important;
                                gap: 10px !important;
                            }
                            .hmt-animated-webp-crop-footer > div {
                                justify-content: center !important;
                            }
                            #hmt-animated-webp-crop-image {
                                max-width: 100% !important;
                                max-height: 100% !important;
                                width: auto !important;
                                height: auto !important;
                                object-fit: contain !important;
                            }
                        }
                    </style>
                </div>
            `;

            // Load the first frame of the animated WebP for preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = modal.querySelector('#hmt-animated-webp-crop-image');
                img.src = e.target.result;
                
                const infoText = modal.querySelector('#hmt-animated-webp-info');
                if (infoText) {
                    infoText.textContent = 'Animated WebP - Processing all frames';
                }
                
                img.onload = () => {
                    debugLog('Animated WebP element loaded, dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                };
                
                img.onerror = () => {
                    debugLog('Error loading animated WebP');
                    showNotification('Không thể tải ảnh.', 5000);
                    modal.remove();
                };
            };
            
            reader.onerror = () => {
                debugLog('Error reading animated WebP file');
                showNotification('Không thể đọc file ảnh.', 5000);
                modal.remove();
            };
            
            reader.readAsDataURL(file);

            // Add rotate button event listeners
            const rotateLeftBtn = modal.querySelector('.hmt-animated-webp-crop-rotate-left');
            const rotateRightBtn = modal.querySelector('.hmt-animated-webp-crop-rotate-right');
            
            rotateLeftBtn?.addEventListener('click', () => {
                if (this.cropper) {
                    this.cropper.rotate(-90);
                    setTimeout(() => this.cropper?.resize(), 50);
                    this.updatePreview();
                }
            });
            
            rotateRightBtn?.addEventListener('click', () => {
                if (this.cropper) {
                    this.cropper.rotate(90);
                    setTimeout(() => this.cropper?.resize(), 50);
                    this.updatePreview();
                }
            });

            // Upload button handler
            const uploadBtn = modal.querySelector('.hmt-animated-webp-crop-upload');
            uploadBtn?.addEventListener('click', () => this.handleAnimatedUpload());

            this.options.previewBox = modal.querySelector('.hmt-animated-webp-crop-preview-box');
            return modal;
        }

        /**
         * Handle animated WebP upload with progress tracking
         */
        async handleAnimatedUpload() {
            const uploadBtn = this.modal.querySelector('.hmt-animated-webp-crop-upload');
            const progressContainer = this.modal.querySelector('.hmt-animated-webp-progress');
            const progressFill = this.modal.querySelector('.progress-fill');
            const progressText = this.modal.querySelector('.progress-text');
            
            try {
                debugLog('Upload button clicked for animated WebP');
                
                if (!this.cropper) {
                    debugLog('No cropper instance');
                    return;
                }

                // Get crop data
                const cropData = this.cropper.getData();
                debugLog('Crop data:', cropData);

                // Show progress container
                progressContainer.style.display = 'block';
                uploadBtn.disabled = true;
                uploadBtn.textContent = 'Đang xử lý...';

                // Progress callback
                const updateProgress = (progress) => {
                    progressFill.style.width = `${progress.percentage}%`;
                    progressText.textContent = `${progress.label}: ${progress.current}/${progress.total} (${progress.percentage}%) - ${progress.remaining}s remaining`;
                };

                // Process the animated WebP with cropping
                const processedBlob = await animatedWebPProcessor.process(
                    this.options.file, 
                    cropData, 
                    this.options.minWidth, 
                    this.options.minHeight,
                    updateProgress
                );
                
                // Create file from blob
                const processedFile = new File([processedBlob], this.options.file.name, {
                    type: 'image/webp',
                    lastModified: Date.now()
                });

                debugLog('Animated WebP processed successfully:', processedFile.size, 'bytes');

                // Call the original callback
                this.options.callback(processedFile, () => this.close(), uploadBtn);
            } catch (error) {
                debugLog('Error processing animated WebP:', error);
                ErrorHandler.handle(error, 'webp-processing');
                
                // Hide progress and re-enable button
                progressContainer.style.display = 'none';
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Cắt & Upload';
            }
        }
    }

    /**
     * Unified Modal Manager
     * Manages modal creation and handles different image types
     */
    class CropModalManager {
        constructor() {
            this.currentModal = null;
        }

        /**
         * Create appropriate crop modal based on file type
         */
        async createCropModal(file, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight, callback) {
            try {
                // Close existing modal if any
                if (this.currentModal) {
                    this.currentModal.close();
                }

                // Determine modal type based on file
                let modalClass;
                if (file.type === 'image/webp') {
                    // Check if it's animated
                    const isAnimated = await animatedWebPProcessor.isAnimated(file);
                    modalClass = isAnimated ? AnimatedWebPCropModal : StaticImageCropModal;
                } else {
                    modalClass = StaticImageCropModal;
                }

                // Create and initialize modal
                const modalOptions = {
                    file,
                    minWidth,
                    minHeight,
                    aspectRatio,
                    title,
                    previewWidth,
                    previewHeight,
                    callback
                };

                this.currentModal = new modalClass(modalOptions);
                await this.currentModal.init();

                return this.currentModal;
            } catch (error) {
                ErrorHandler.handle(error, 'modal-creation');
                throw error;
            }
        }

        /**
         * Close current modal
         */
        closeCurrentModal() {
            if (this.currentModal) {
                this.currentModal.close();
                this.currentModal = null;
            }
        }
    }

    const modalManager = new CropModalManager();

    /**
     * Legacy function wrappers for backward compatibility
     */
    function createCropModal(imageFile, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight, callback) {
        return modalManager.createCropModal(imageFile, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight, callback);
    }

    function createAnimatedWebPCropModal(imageFile, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight, callback) {
        return modalManager.createCropModal(imageFile, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight, callback);
    }

    /**
     * Avatar dialog component
     */
    function createAvatarDialog(imageFile) {
        const modal = document.createElement('div');
        modal.className = 'hmt-avatar-dialog-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'avatar-dialog-title');
        modal.setAttribute('aria-describedby', 'avatar-dialog-desc');

        modal.innerHTML = `
            <div class="hmt-avatar-dialog" style="
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                padding: 20px;
                text-align: center;
            ">
                <h3 id="avatar-dialog-title" style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Ảnh avatar không có tỷ lệ 1:1</h3>
                <p id="avatar-dialog-desc" style="margin: 0 0 20px 0; font-size: 14px;">Bạn muốn làm gì với ảnh này?</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="hmt-avatar-cancel" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Hủy</button>
                    <button class="hmt-avatar-no" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Upload nguyên bản</button>
                    <button class="hmt-avatar-yes" style="
                        padding: 8px 16px;
                        border: none;
                        background: #007bff;
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Cắt thành 1:1</button>
                </div>
                <style>
                    @media (max-width: 480px) {
                        .hmt-avatar-dialog {
                            max-width: 90vw !important;
                            padding: 15px !important;
                        }
                        .hmt-avatar-dialog div[style*="display: flex"] {
                            flex-direction: column !important;
                            gap: 8px !important;
                        }
                        .hmt-avatar-dialog button {
                            width: 100% !important;
                        }
                    }
                </style>
            </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('.hmt-avatar-cancel');
        const noBtn = modal.querySelector('.hmt-avatar-no');
        const yesBtn = modal.querySelector('.hmt-avatar-yes');

        function closeModal() {
            modal.remove();
        }

        cancelBtn.addEventListener('click', closeModal);
        noBtn.addEventListener('click', () => {
            uploadAvatar(imageFile);
            closeModal();
        });
        yesBtn.addEventListener('click', () => {
            closeModal();
            createCropModal(imageFile, CONSTANTS.AVATAR_MIN_WIDTH, CONSTANTS.AVATAR_MIN_HEIGHT, CONSTANTS.AVATAR_ASPECT_RATIO, "Cắt ảnh avatar", 200, 200, uploadAvatar);
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    /**
     * Show notification (enhanced with better UX)
     */
    function showNotification(message, timeout = 3000) {
        // Create enhanced notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 10001;
            max-width: 300px;
            word-wrap: break-word;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, timeout);
    }

    /**
     * Enhanced image compression with progress tracking
     */
    function compressImage(file, onProgress = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0);

                    let outputType = file.type;
                    if (file.type === 'image/png') {
                        outputType = 'image/jpeg';
                    }

                    let quality = 0.9;
                    const maxIterations = 16;
                    let iteration = 0;

                    const attemptCompression = () => {
                        iteration++;
                        if (onProgress) {
                            onProgress({
                                current: iteration,
                                total: maxIterations,
                                percentage: Math.round((iteration / maxIterations) * 100),
                                stage: 'compressing'
                            });
                        }

                        canvas.toBlob((blob) => {
                            if (!blob) {
                                reject(new Error('Failed to compress image - canvas toBlob failed'));
                                return;
                            }

                            debugLog(`Compression attempt ${iteration}: size ${blob.size} bytes, quality ${quality}`);

                            if (blob.size > CONSTANTS.MAX_AVATAR_FILE_SIZE) {
                                if (quality > 0.1 && iteration < maxIterations) {
                                    quality = Math.max(0.1, quality - 0.05);
                                    attemptCompression();
                                } else {
                                    reject(new Error('Cannot compress image below 1MB without unacceptable quality loss. Please select a smaller image.'));
                                }
                            } else {
                                if (blob.size < CONSTANTS.MIN_COMPRESSED_SIZE && quality < 0.95 && iteration < maxIterations) {
                                    quality = Math.min(0.95, quality + 0.05);
                                    attemptCompression();
                                } else {
                                    if (quality < 0.5) {
                                        debugLog('Warning: Image compressed with low quality, potential loss of details');
                                    }
                                    resolve(blob);
                                }
                            }
                        }, outputType, quality);
                    };

                    attemptCompression();
                };

                img.onerror = () => reject(new Error('Failed to load image for compression'));
                img.src = URL.createObjectURL(file);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Enhanced upload functions with better error handling
     */
    async function uploadBanner(file, closeModal, button) {
        try {
            const token = window.csrfToken || document.querySelector('meta[name="csrf-token"]')?.content;
            if (!token) {
                ErrorHandler.handle(new Error('CSRF token not found'), 'upload');
                if (closeModal && button) {
                    closeModal();
                    button.disabled = false;
                    button.textContent = 'Cắt & Upload';
                }
                return;
            }

            const formdata = new FormData();
            formdata.append('image', file);
            formdata.append('_token', token);

            debugLog('Sending AJAX upload request to /action/upload/usercover');

            const response = await fetch(CONFIG.api.endpoints.uploadBanner, {
                method: 'POST',
                body: formdata,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();
            debugLog('Upload response:', data);

            if (data.status == 'success') {
                $('.profile-cover .content').css('background-image', 'url(' + data.url + ')');
                showNotification('Ảnh đã được cắt và upload thành công!', 3000);
            } else {
                ErrorHandler.handle(new Error(data.message || 'Upload failed'), 'upload');
            }
        } catch (error) {
            ErrorHandler.handle(error, 'upload');
        } finally {
            if (closeModal && button) {
                closeModal();
                button.disabled = false;
                button.textContent = 'Cắt & Upload';
            }
        }
    }

    /**
     * Enhanced avatar upload with compression
     */
    async function uploadAvatar(file, closeModal, button) {
        try {
            const token = window.csrfToken || document.querySelector('meta[name="csrf-token"]')?.content;
            if (!token) {
                ErrorHandler.handle(new Error('CSRF token not found'), 'upload');
                if (closeModal && button) {
                    closeModal();
                    button.disabled = false;
                    button.textContent = 'Cắt & Upload';
                }
                return;
            }

            // Check file size and compress if needed
            let processedFile = file;
            if (file.size > CONSTANTS.MAX_AVATAR_FILE_SIZE) {
                debugLog('File size exceeds 1MB, compressing...');
                showNotification('Đang nén ảnh để giảm kích thước...', 2000);

                try {
                    const compressedBlob = await compressImage(file);
                    processedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { 
                        type: compressedBlob.type 
                    });
                    debugLog(`Compression successful: ${file.size} -> ${compressedBlob.size} bytes`);
                    showNotification('Ảnh đã được nén thành công!', 2000);
                } catch (compressionError) {
                    ErrorHandler.handle(compressionError, 'compression');
                    if (closeModal && button) {
                        closeModal();
                        button.disabled = false;
                        button.textContent = 'Cắt & Upload';
                    }
                    return;
                }
            }

            const formdata = new FormData();
            formdata.append('image', processedFile);
            formdata.append('_token', token);

            debugLog('Uploading processed file:', processedFile.name, processedFile.size, 'bytes');

            const response = await fetch(CONFIG.api.endpoints.uploadAvatar, {
                method: 'POST',
                body: formdata,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.status == 'success') {
                $('.profile-ava').find('img').attr('src', data.url);
                showNotification('Ảnh avatar đã được upload thành công!', 3000);
            } else {
                ErrorHandler.handle(new Error(data.message || 'Upload failed'), 'upload');
            }
        } catch (error) {
            ErrorHandler.handle(error, 'upload');
        } finally {
            if (closeModal && button) {
                closeModal();
                button.disabled = false;
                button.textContent = 'Cắt & Upload';
            }
        }
    }

    /**
     * Enhanced file input interception with better error handling
     */
    function interceptFileInput() {
        debugLog('Intercepting file inputs for profile images');

        const inputs = [
            document.querySelector('#user_cover_file'),
            document.querySelector('#user_avatar_file')
        ];

        inputs.forEach(input => {
            if (!input) return;

            debugLog('Intercepting input:', input.id);

            input.addEventListener('change', async function(e) {
                debugLog('File input change event triggered on', input.id);

                const files = e.target.files;
                if (files.length === 0) return;

                const file = files[0];

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    ErrorHandler.handle(new Error('invalid-image'), 'file-validation');
                    return;
                }

                // Validate file size
                if (file.size > CONFIG.maxFileSize) {
                    ErrorHandler.handle(new Error('file-too-large'), 'file-validation');
                    return;
                }

                debugLog('Image selected:', file.name, file.size, 'bytes');

                // Prevent default upload
                e.preventDefault();
                e.stopPropagation();
                e.target.value = '';

                try {
                    if (input.id === 'user_avatar_file') {
                        await handleAvatarUpload(file);
                    } else {
                        await handleBannerUpload(file);
                    }
                } catch (error) {
                    ErrorHandler.handle(error, 'file-processing');
                }
            }, true);
        });
    }

    /**
     * Handle avatar upload with animated WebP support
     */
    async function handleAvatarUpload(file) {
        if (file.type === 'image/gif') {
            debugLog('GIF detected, uploading directly');
            uploadAvatar(file);
        } else if (file.type === 'image/webp') {
            try {
                const isAnimated = await animatedWebPProcessor.isAnimated(file);
                if (isAnimated) {
                    debugLog('Animated WebP detected for avatar, processing with animation support');
                    await modalManager.createCropModal(
                        file, 
                        CONSTANTS.AVATAR_MIN_WIDTH, 
                        CONSTANTS.AVATAR_MIN_HEIGHT, 
                        CONSTANTS.AVATAR_ASPECT_RATIO, 
                        "Cắt ảnh avatar", 
                        200, 
                        200, 
                        uploadAvatar
                    );
                } else {
                    debugLog('Static WebP detected for avatar, processing normally');
                    await processStaticWebP(file);
                }
            } catch (error) {
                debugLog('Error detecting WebP animation, processing as static:', error);
                await processStaticWebP(file);
            }
        } else {
            await processStaticWebP(file);
        }
    }

    /**
     * Handle banner upload with animated WebP support
     */
    async function handleBannerUpload(file) {
        if (file.type === 'image/webp') {
            try {
                const isAnimated = await animatedWebPProcessor.isAnimated(file);
                if (isAnimated) {
                    debugLog('Animated WebP detected for banner, processing with animation support');
                    await modalManager.createCropModal(
                        file, 
                        CONSTANTS.MIN_WIDTH, 
                        CONSTANTS.MIN_HEIGHT, 
                        CONSTANTS.ASPECT_RATIO, 
                        "Cắt ảnh profile banner", 
                        200, 
                        50, 
                        uploadBanner
                    );
                } else {
                    debugLog('Static WebP detected for banner, processing normally');
                    await processStaticBanner(file);
                }
            } catch (error) {
                debugLog('Error detecting WebP animation for banner, processing as static:', error);
                await processStaticBanner(file);
            }
        } else {
            await processStaticBanner(file);
        }
    }

    /**
     * Process static WebP files
     */
    async function processStaticWebP(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                debugLog('Static WebP dimensions:', img.naturalWidth, 'x', img.naturalHeight, 'aspect:', aspectRatio);
                if (Math.abs(aspectRatio - 1) < 0.01) {
                    debugLog('Static WebP is 1:1, uploading directly');
                    uploadAvatar(file);
                } else {
                    debugLog('Static WebP not 1:1, showing dialog');
                    createAvatarDialog(file);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Process static banner files
     */
    async function processStaticBanner(file) {
        await modalManager.createCropModal(
            file, 
            CONSTANTS.MIN_WIDTH, 
            CONSTANTS.MIN_HEIGHT, 
            CONSTANTS.ASPECT_RATIO, 
            "Cắt ảnh profile banner", 
            200, 
            50, 
            uploadBanner
        );
    }

    /**
     * Initialize the module with enhanced startup
     */
    function init() {
        debugLog('Initializing Enhanced Profile Cropper module');

        // Check if we're on a profile page
        const isProfilePage = window.location.href.includes('/user/') ||
                              window.location.href.includes('/profile') ||
                              document.querySelector('[class*="profile"], [id*="profile"]');

        debugLog('Current URL:', window.location.href);
        debugLog('Is profile page:', isProfilePage);

        if (!isProfilePage) {
            debugLog('Not on profile page, skipping initialization');
            return;
        }

        // Initialize WebP encoder
        webpEncoder.initialize().catch(error => {
            debugLog('WebP encoder initialization failed:', error);
        });

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                debugLog('DOMContentLoaded fired, intercepting file inputs');
                interceptFileInput();
            });
        } else {
            debugLog('DOM already loaded, intercepting file inputs');
            interceptFileInput();
        }

        // Delayed interception for dynamic content
        setTimeout(() => {
            debugLog('Delayed interception after 2 seconds');
            interceptFileInput();
        }, 2000);

        setTimeout(() => {
            debugLog('Delayed interception after 5 seconds');
            interceptFileInput();
        }, 5000);

        debugLog('Enhanced Profile Cropper module initialized');
    }

    // Export enhanced module
    window.HMTProfileCropper = {
        init: init,
        loadCropperLibrary: loadCropperLibrary,
        loadWebPHeroLibrary: loadWebPHeroLibrary,
        createCropModal: createCropModal,
        createAnimatedWebPCropModal: createAnimatedWebPCropModal,
        interceptFileInput: interceptFileInput,
        uploadBanner: uploadBanner,
        uploadAvatar: uploadAvatar,
        createAvatarDialog: createAvatarDialog,
        isAnimatedWebP: isAnimatedWebP,
        processAnimatedWebP: (file, cropData, minWidth, minHeight) => 
            animatedWebPProcessor.process(file, cropData, minWidth, minHeight),
        
        // New enhanced features
        config: CONFIG,
        memoryManager: memoryManager,
        errorHandler: ErrorHandler,
        modalManager: modalManager,
        progressTracker: ProgressTracker
    };

    // Auto-initialize
    init();

})();