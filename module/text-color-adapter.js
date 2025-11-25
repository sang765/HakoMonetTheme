(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    // Hàm tính luminance từ RGB
    function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // Hàm tính độ tương phản
    function getContrastRatio(lum1, lum2) {
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    // Hàm lấy màu trung bình từ gradient sử dụng canvas
    function getAverageColorFromGradient(gradientCSS, width = 100, height = 100) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = gradientCSS;
            ctx.fillRect(0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }
            return [r / count, g / count, b / count];
        } catch (error) {
            if (DEBUG) console.warn('[TextColorAdapter] Error analyzing gradient:', error);
            return [128, 128, 128]; // Màu xám trung bình fallback
        }
    }

    // Hàm phân tích background-color và trả về RGB
    function parseBackgroundColor(element) {
        const bgColor = getComputedStyle(element).backgroundColor;

        // Xử lý rgba/rgb
        if (bgColor.startsWith('rgb')) {
            const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            if (match) {
                return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
            }
        }

        // Xử lý gradient
        if (bgColor.includes('gradient')) {
            return getAverageColorFromGradient(bgColor);
        }

        // Xử lý hex hoặc named colors (fallback)
        if (bgColor.startsWith('#')) {
            const hex = bgColor.slice(1);
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return [r, g, b];
        }

        // Fallback: kiểm tra parent element
        const parent = element.parentElement;
        if (parent && parent !== document.body) {
            return parseBackgroundColor(parent);
        }

        // Ultimate fallback
        return [255, 255, 255]; // Trắng
    }

    // Hàm chọn màu text dựa trên background
    function chooseTextColor(element) {
        const bgRGB = parseBackgroundColor(element);
        const bgLuminance = getLuminance(...bgRGB);

        // Màu tối và sáng chuẩn
        const darkColor = '#000000';
        const grayColor = '#808080';
        const lightColor = '#ffffff';

        // Tính độ tương phản
        const darkLum = getLuminance(0, 0, 0);
        const lightLum = getLuminance(255, 255, 255);

        const contrastDark = getContrastRatio(bgLuminance, darkLum);
        const contrastLight = getContrastRatio(bgLuminance, lightLum);

        // Chọn màu có độ tương phản cao hơn (tối thiểu 4.5:1 theo WCAG AA)
        const chosenColor = contrastDark > contrastLight ? darkColor : lightColor;
        const chosenContrast = Math.max(contrastDark, contrastLight);

        if (DEBUG) {
            console.log(`[TextColorAdapter] Element: ${element.tagName}.${element.className || ''}, BG: rgb(${bgRGB.join(',')}), Luminance: ${bgLuminance.toFixed(3)}, Contrast: ${chosenContrast.toFixed(2)}, Chosen: ${chosenColor}`);
        }

        // Chỉ áp dụng nếu độ tương phản đủ
        if (chosenContrast >= 4.5) {
            element.style.color = chosenColor;
            return true;
        } else {
            // Nếu không đủ, thử tinh chỉnh màu
            const adjustedColor = bgLuminance > 0.5 ?
                '#333333' : // Tối hơn cho background sáng
                '#f0f0f0'; // Sáng hơn cho background tối
            element.style.color = adjustedColor;
            if (DEBUG) console.warn('[TextColorAdapter] Adjusted color due to low contrast');
            return false;
        }
    }

    // Hàm áp dụng cho nhiều elements
    function applyToElements(selector = 'p, h1, h2, h3, h4, h5, h6, span, div, a') {
        const elements = document.querySelectorAll(selector);
        let applied = 0;
        elements.forEach(element => {
            if (chooseTextColor(element)) applied++;
        });
        if (DEBUG) console.log(`[TextColorAdapter] Applied to ${applied}/${elements.length} elements`);
        return applied;
    }

    // Theo dõi thay đổi CSS
    function setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    chooseTextColor(mutation.target);
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style']
        });

        if (DEBUG) console.log('[TextColorAdapter] MutationObserver setup for dynamic changes');
    }

    // API công khai
    window.HMTTextColorAdapter = {
        chooseTextColor,
        applyToElements,
        parseBackgroundColor,
        getLuminance,
        getContrastRatio,
        setupMutationObserver,

        // Hàm init để khởi tạo
        init: function(options = {}) {
            const { selector = 'p, h1, h2, h3, h4, h5, h6, span, div, a', watchChanges = true } = options;

            if (DEBUG) console.log('[TextColorAdapter] Initializing with selector:', selector);

            // Áp dụng ban đầu
            applyToElements(selector);

            // Theo dõi thay đổi nếu được bật
            if (watchChanges) {
                setupMutationObserver();
            }

            if (DEBUG) console.log('[TextColorAdapter] Initialized successfully');
        }
    };

    if (DEBUG) console.log('[TextColorAdapter] Module loaded');

})();