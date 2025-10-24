(function() {
    'use strict';

    const DEBUG = true;
    const TARGET_DOMAINS = ['docln', 'hako', 'i2.hako.vip', 'docln.sbs', 'docln.net', 'ln.hako.vn'];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Phát Hiện Chủ Đề]', ...args);
        }
    }

    function isTargetDomain(url) {
        if (!url) return false;
        return TARGET_DOMAINS.some(domain => url.includes(domain));
    }

    // Các phương thức phát hiện chủ đề
    const themeDetectors = {
        // Kiểm tra night_mode trong localStorage
        checkStorageCookie: function() {
            const nightMode = localStorage.getItem('night_mode');
            if (nightMode === 'true') {
                return 'dark';
            }
            return null;
        }
    };

    class ThemeDetector {
        constructor() {
            this.currentTheme = null;
            this.listeners = [];
            this.init();
        }

        init() {
            debugLog('Mô-đun Phát Hiện Chủ Đề đã được khởi tạo thành công');

            // Phát hiện ban đầu
            this.detectTheme();

            // Thiết lập trình lắng nghe thay đổi
            this.setupChangeListeners();

            // Đánh dấu đã tải xong
            window.__themeDetectorLoaded = true;
            debugLog('Phát hiện chủ đề hoàn tất. Chủ đề hiện tại là:', this.currentTheme);
        }

        detectTheme() {
            const result = themeDetectors.checkStorageCookie.call(this);
            if (result) {
                this.currentTheme = result;
                debugLog('Chủ đề tối được phát hiện dựa trên localStorage night_mode: true');
            } else {
                this.currentTheme = 'light';
                debugLog('Không tìm thấy night_mode trong localStorage, mặc định là chủ đề sáng');
            }

            return this.currentTheme;
        }

        setupChangeListeners() {
            // Lắng nghe các thay đổi localStorage
            const handleStorageChange = (e) => {
                if (e.key === 'night_mode') {
                    this.checkForThemeChange();
                }
            };

            window.addEventListener('storage', handleStorageChange);

            debugLog('Trình lắng nghe thay đổi chủ đề đã được thiết lập để theo dõi localStorage');
        }

        checkForThemeChange() {
            const previousTheme = this.currentTheme;
            const newTheme = this.detectTheme();

            if (previousTheme !== newTheme) {
                debugLog('Chủ đề đã thay đổi từ "' + previousTheme + '" thành "' + newTheme + '" do thay đổi trong localStorage');
                this.notifyListeners(newTheme, previousTheme);
            }
        }

        notifyListeners(newTheme, oldTheme) {
            this.listeners.forEach(callback => {
                try {
                    callback(newTheme, oldTheme);
                } catch (error) {
                    debugLog('Có lỗi xảy ra trong trình lắng nghe thay đổi chủ đề: ' + error.message);
                }
            });
        }

        getCurrentTheme() {
            return this.currentTheme;
        }

        isDark() {
            return this.currentTheme === 'dark';
        }

        isLight() {
            return this.currentTheme === 'light';
        }

        onThemeChange(callback) {
            if (typeof callback === 'function') {
                this.listeners.push(callback);
                debugLog('Đã thêm trình lắng nghe thay đổi chủ đề thành công');
            }
        }

        offThemeChange(callback) {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
                debugLog('Đã xóa trình lắng nghe thay đổi chủ đề thành công');
            }
        }

        // Buộc phát hiện lại
        refresh() {
            debugLog('Đang buộc phát hiện lại chủ đề...');
            this.detectTheme();
        }
    }

    // Tạo instance toàn cục
    const themeDetector = new ThemeDetector();

    // Phơi bày ra window để truy cập bên ngoài
    window.ThemeDetector = {
        getCurrentTheme: () => themeDetector.getCurrentTheme(),
        isDark: () => themeDetector.isDark(),
        isLight: () => themeDetector.isLight(),
        onThemeChange: (callback) => themeDetector.onThemeChange(callback),
        offThemeChange: (callback) => themeDetector.offThemeChange(callback),
        refresh: () => themeDetector.refresh(),
        instance: themeDetector
    };

    debugLog('Mô-đun ThemeDetector đã tải thành công và có sẵn dưới dạng window.ThemeDetector');

})();