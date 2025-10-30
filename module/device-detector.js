(function() {
    'use strict';

    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[DeviceDetector]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    // Device detection methods
    const deviceDetectors = {
        // Check user agent for device type
        checkUserAgent: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            
            // Mobile detection
            const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
            if (mobileRegex.test(userAgent)) {
                return 'mobile';
            }
            
            // Tablet detection
            const tabletRegex = /ipad|tablet|playbook|silk/i;
            if (tabletRegex.test(userAgent)) {
                return 'tablet';
            }
            
            // Desktop detection
            return 'desktop';
        },
        
        // Check screen width for device type
        checkScreenWidth: function() {
            const screenWidth = window.screen.width || window.innerWidth;
            
            if (screenWidth <= 768) {
                return 'mobile';
            } else if (screenWidth <= 1024) {
                return 'tablet';
            } else {
                return 'desktop';
            }
        },
        
        // Check orientation
        checkOrientation: function() {
            return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        },
        
        // Check touch capability
        checkTouchCapability: function() {
            return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        },
        
        // Check pixel ratio for retina displays
        checkPixelRatio: function() {
            return window.devicePixelRatio || 1;
        }
    };

    class DeviceDetector {
        constructor() {
            this.currentDevice = null;
            this.currentOrientation = null;
            this.pixelRatio = null;
            this.isTouch = null;
            this.listeners = [];
            this.resizeTimeout = null;
            this.init();
        }

        init() {
            debugLog('Device Detector module initialized');

            // Initial detection
            this.detectDevice();

            // Listen for changes
            this.setupChangeListeners();

            // Mark as loaded
            window.__deviceDetectorLoaded = true;
            debugLog('Device detection complete. Current device:', this.currentDevice);
        }

        detectDevice() {
            // Try different detection methods in order of reliability
            const detectionMethods = [
                deviceDetectors.checkUserAgent,
                deviceDetectors.checkScreenWidth
            ];

            for (const method of detectionMethods) {
                const result = method.call(this);
                if (result) {
                    this.currentDevice = result;
                    debugLog('Device detected via', method.name, ':', result);
                    break;
                }
            }

            // Default to desktop if nothing detected
            if (!this.currentDevice) {
                this.currentDevice = 'desktop';
                debugLog('No device detected, defaulting to desktop');
            }

            // Get additional device info
            this.currentOrientation = deviceDetectors.checkOrientation.call(this);
            this.pixelRatio = deviceDetectors.checkPixelRatio.call(this);
            this.isTouch = deviceDetectors.checkTouchCapability.call(this);

            return this.currentDevice;
        }

        setupChangeListeners() {
            // Listen for window resize
            const handleResize = () => {
                // Debounce resize events
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.checkForDeviceChange();
                }, 250);
            };

            // Listen for orientation change
            const handleOrientationChange = () => {
                setTimeout(() => {
                    this.checkForDeviceChange();
                }, 100);
            };

            window.addEventListener('resize', handleResize);
            window.addEventListener('orientationchange', handleOrientationChange);

            debugLog('Device change listeners set up');
        }

        checkForDeviceChange() {
            const previousDevice = this.currentDevice;
            const newDevice = this.detectDevice();

            if (previousDevice !== newDevice) {
                debugLog('Device changed from', previousDevice, 'to', newDevice);
                this.notifyListeners(newDevice, previousDevice);
            }

            // Always update orientation and other properties
            const newOrientation = deviceDetectors.checkOrientation.call(this);
            if (this.currentOrientation !== newOrientation) {
                debugLog('Orientation changed from', this.currentOrientation, 'to', newOrientation);
                this.currentOrientation = newOrientation;
            }
        }

        notifyListeners(newDevice, oldDevice) {
            this.listeners.forEach(callback => {
                try {
                    callback(newDevice, oldDevice, {
                        orientation: this.currentOrientation,
                        pixelRatio: this.pixelRatio,
                        isTouch: this.isTouch
                    });
                } catch (error) {
                    debugLog('Error in device change listener:', error);
                }
            });
        }

        getCurrentDevice() {
            return this.currentDevice;
        }

        getCurrentOrientation() {
            return this.currentOrientation;
        }

        getPixelRatio() {
            return this.pixelRatio;
        }

        isTouchDevice() {
            return this.isTouch;
        }

        isMobile() {
            return this.currentDevice === 'mobile';
        }

        isTablet() {
            return this.currentDevice === 'tablet';
        }

        isDesktop() {
            return this.currentDevice === 'desktop';
        }

        isPortrait() {
            return this.currentOrientation === 'portrait';
        }

        isLandscape() {
            return this.currentOrientation === 'landscape';
        }

        onDeviceChange(callback) {
            if (typeof callback === 'function') {
                this.listeners.push(callback);
                debugLog('Device change listener added');
            }
        }

        offDeviceChange(callback) {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
                debugLog('Device change listener removed');
            }
        }

        // Force re-detection
        refresh() {
            debugLog('Forcing device re-detection');
            this.detectDevice();
        }

        // Get full device info
        getDeviceInfo() {
            return {
                device: this.currentDevice,
                orientation: this.currentOrientation,
                pixelRatio: this.pixelRatio,
                isTouch: this.isTouch,
                screenWidth: window.screen.width || window.innerWidth,
                screenHeight: window.screen.height || window.innerHeight,
                userAgent: navigator.userAgent
            };
        }
    }

    // Create global instance
    const deviceDetector = new DeviceDetector();

    // Expose to window for external access
    window.DeviceDetector = {
        getCurrentDevice: () => deviceDetector.getCurrentDevice(),
        getCurrentOrientation: () => deviceDetector.getCurrentOrientation(),
        getPixelRatio: () => deviceDetector.getPixelRatio(),
        isTouchDevice: () => deviceDetector.isTouchDevice(),
        isMobile: () => deviceDetector.isMobile(),
        isTablet: () => deviceDetector.isTablet(),
        isDesktop: () => deviceDetector.isDesktop(),
        isPortrait: () => deviceDetector.isPortrait(),
        isLandscape: () => deviceDetector.isLandscape(),
        onDeviceChange: (callback) => deviceDetector.onDeviceChange(callback),
        offDeviceChange: (callback) => deviceDetector.offDeviceChange(callback),
        refresh: () => deviceDetector.refresh(),
        getDeviceInfo: () => deviceDetector.getDeviceInfo(),
        instance: deviceDetector
    };

    debugLog('DeviceDetector module loaded and available as window.DeviceDetector');

})();