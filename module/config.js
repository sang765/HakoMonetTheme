(function() {
    'use strict';

    const DEBUG = true;

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Config]', ...args);
        }
    }

    function getDefaultColor() {
        return GM_getValue('default_color', '#00B591');
    }

    function setDefaultColor(color) {
        GM_setValue('default_color', color);
        debugLog('Đã lưu màu mặc định:', color);

        // Phát sự kiện màu sắc thay đổi để các module khác cập nhật real-time
        const colorChangeEvent = new CustomEvent('hmtColorChanged', {
            detail: {
                color: color,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(colorChangeEvent);
        debugLog('Đã phát sự kiện màu sắc thay đổi:', color);
    }

    function createConfigDialog() {
        // Kiểm tra xem dialog đã tồn tại chưa
        if (document.querySelector('.hmt-config-dialog')) {
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'hmt-config-dialog';

        // Lấy màu hiện tại từ storage
        const currentColor = getDefaultColor();

        // Hàm chuyển đổi HEX sang HSL để lấy giá trị mặc định cho sliders
        function hexToHsl(hex) {
            hex = hex.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }

        const currentHsl = hexToHsl(currentColor);

        dialog.innerHTML = `
            <div class="hmt-config-overlay">
                <div class="hmt-config-content">
                    <div class="hmt-config-header">
                        <div class="hmt-header-content">
                            <div class="hmt-logo-section">
                                <img src="https://github.com/sang765/HakoMonetTheme/blob/main/.github/assets/logo.png?raw=true"
                                     alt="HakoMonetTheme Logo"
                                     class="hmt-logo">
                                <div class="hmt-title-section">
                                    <h3>HakoMonetTheme</h3>
                                    <span class="hmt-subtitle">Cài đặt màu sắc</span>
                                </div>
                            </div>
                        </div>
                        <button class="hmt-config-close">&times;</button>
                    </div>
                    <div class="hmt-config-body">
                        <div class="hmt-config-section">
                            <h4>Màu mặc định</h4>
                            <p>Chọn màu sẽ được sử dụng khi không thể lấy màu từ ảnh bìa truyện. Sử dụng bộ chọn màu HSL để điều chỉnh màu sắc theo ý muốn.</p>

                            <div class="hmt-custom-color">
                                <label for="hmt-custom-color-input">Chọn màu tùy chỉnh:</label>
                                <div class="hmt-color-input-group">
                                    <div class="hmt-color-picker-wrapper">
                                        <div class="hmt-custom-color-picker" id="hmt-custom-color-input">
                                            <div class="hmt-color-picker-display">
                                                <div class="hmt-color-preview" id="hmt-color-preview"></div>
                                                <span class="hmt-color-value" id="hmt-color-value">${currentColor}</span>
                                            </div>
                                            <div class="hmt-color-controls">
                                                <div class="hmt-color-slider-group">
                                                    <label class="hmt-slider-label">Hue</label>
                                                    <input type="range" class="hmt-color-slider hmt-hue-slider" id="hmt-hue-slider" min="0" max="360" value="${currentHsl.h}">
                                                </div>
                                                <div class="hmt-color-slider-group">
                                                    <label class="hmt-slider-label">Saturation</label>
                                                    <input type="range" class="hmt-color-slider hmt-sat-slider" id="hmt-sat-slider" min="0" max="100" value="${currentHsl.s}">
                                                </div>
                                                <div class="hmt-color-slider-group">
                                                    <label class="hmt-slider-label">Lightness</label>
                                                    <input type="range" class="hmt-color-slider hmt-light-slider" id="hmt-light-slider" min="0" max="100" value="${currentHsl.l}">
                                                </div>
                                            </div>
                                            <div class="hmt-color-palette">
                                                <div class="hmt-color-palette-area" id="hmt-color-palette-area">
                                                    <div class="hmt-palette-cursor" id="hmt-palette-cursor"></div>
                                                </div>
                                                <div class="hmt-hue-bar">
                                                    <div class="hmt-hue-cursor" id="hmt-hue-cursor"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <span class="hmt-color-picker-label">Color Picker với thanh HSL</span>
                                    </div>
                                    <input type="text"
                                           id="hmt-custom-color-text"
                                           value="${currentColor}"
                                           class="hmt-color-text"
                                           placeholder="#17deb3">
                                </div>
                                <small class="hmt-color-help">Kéo thanh trượt HSL để chọn màu, hoặc nhập mã HEX trực tiếp</small>
                            </div>
                        </div>

                        <div class="hmt-config-preview">
                            <h4>Xem trước</h4>
                            <div class="hmt-preview-box" style="background-color: ${currentColor}">
                                <span>Màu chủ đạo</span>
                            </div>
                        </div>
                    </div>
                    <div class="hmt-config-footer">
                        <button class="hmt-config-reset">Khôi phục mặc định</button>
                        <button class="hmt-config-save">Lưu cài đặt</button>
                    </div>
                </div>
            </div>
        `;

        // Thêm CSS
        GM_addStyle(`
            .hmt-config-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .hmt-config-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow: hidden;
                animation: hmtConfigSlideIn 0.3s ease-out;
            }

            .hmt-config-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .hmt-header-content {
                display: flex;
                align-items: center;
            }

            .hmt-logo-section {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .hmt-logo {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                object-fit: cover;
                border: 2px solid rgba(255, 255, 255, 0.2);
                transition: transform 0.3s ease;
                background: rgba(255, 255, 255, 0.1);
            }

            .hmt-logo:hover {
                transform: scale(1.05);
            }

            .hmt-logo:not([src]),
            .hmt-logo[src=""] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                color: white;
            }

            .hmt-logo:not([src])::after,
            .hmt-logo[src=""]::after {
                content: "🎨";
                font-size: 20px;
            }

            .hmt-title-section h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }

            .hmt-subtitle {
                font-size: 14px;
                opacity: 0.9;
                font-weight: 400;
                margin-top: 2px;
                display: block;
            }

            .hmt-config-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }

            .hmt-config-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .hmt-config-body {
                padding: 24px;
                max-height: 60vh;
                overflow-y: auto;
            }

            .hmt-config-section {
                margin-bottom: 24px;
            }

            .hmt-config-section h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-config-section p {
                margin: 0 0 16px 0;
                color: #666;
                font-size: 14px;
                line-height: 1.5;
            }

            .hmt-custom-color {
                margin-top: 16px;
            }

            .hmt-custom-color label {
                display: block;
                margin-bottom: 8px;
                color: #333;
                font-size: 14px;
                font-weight: 500;
            }

            .hmt-color-input-group {
                display: flex;
                gap: 16px;
                align-items: center;
                margin-bottom: 8px;
            }

            .hmt-color-picker-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }

            .hmt-custom-color-picker {
                width: 280px;
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .hmt-color-picker-display {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
            }

            .hmt-color-preview {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                border: 2px solid #e9ecef;
                background: #6c5ce7;
            }

            .hmt-color-value {
                font-family: monospace;
                font-size: 14px;
                font-weight: 600;
                color: #495057;
                background: #f8f9fa;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #e9ecef;
                min-width: 80px;
                text-align: center;
            }

            .hmt-color-controls {
                margin-bottom: 16px;
            }

            .hmt-color-slider-group {
                margin-bottom: 12px;
            }

            .hmt-color-slider-group:last-child {
                margin-bottom: 0;
            }

            .hmt-slider-label {
                display: block;
                font-size: 12px;
                font-weight: 600;
                color: #495057;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .hmt-color-slider {
                width: 100%;
                height: 8px;
                border-radius: 4px;
                outline: none;
                cursor: pointer;
                background: #e9ecef;
                border: none;
                -webkit-appearance: none;
            }

            .hmt-color-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .hmt-color-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .hmt-color-palette {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }

            .hmt-color-palette-area {
                width: 180px;
                height: 120px;
                background: linear-gradient(to top, #000, transparent),
                           linear-gradient(to right, #fff, transparent);
                border-radius: 4px;
                position: relative;
                cursor: crosshair;
                border: 1px solid #dee2e6;
            }

            .hmt-palette-cursor {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: white;
                border: 2px solid #333;
                position: absolute;
                pointer-events: none;
                transform: translate(-50%, -50%);
            }

            .hmt-hue-bar {
                width: 20px;
                height: 120px;
                background: linear-gradient(to bottom,
                  #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%,
                  #0000ff 67%, #ff00ff 83%, #ff0000 100%);
                border-radius: 4px;
                position: relative;
                cursor: pointer;
                border: 1px solid #dee2e6;
            }

            .hmt-hue-cursor {
                width: 20px;
                height: 4px;
                background: white;
                border: 1px solid #333;
                position: absolute;
                left: -1px;
                pointer-events: none;
            }

            .hmt-color-picker-label {
                font-size: 12px;
                color: #667eea;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .hmt-color-text {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 14px;
                font-family: monospace;
                background: #f8f9fa;
                color: #495057;
                font-weight: 500;
            }

            .hmt-color-text:focus {
                outline: none;
                border-color: #667eea;
                background: white;
            }

            .hmt-color-help {
                color: #6c757d;
                font-size: 12px;
                margin-top: 4px;
                display: block;
                line-height: 1.4;
            }

            .hmt-config-preview {
                margin-top: 24px;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .hmt-config-preview h4 {
                margin: 0 0 12px 0;
                color: #333;
                font-size: 16px;
                font-weight: 600;
            }

            .hmt-preview-box {
                height: 80px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }

            .hmt-config-footer {
                padding: 20px 24px;
                background: #f8f9fa;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }

            .hmt-config-reset,
            .hmt-config-save {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .hmt-config-reset {
                background: #f8f9fa;
                color: #666;
                border: 1px solid #ddd;
            }

            .hmt-config-reset:hover {
                background: #e9ecef;
                color: #333;
            }

            .hmt-config-save {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .hmt-config-save:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            @keyframes hmtConfigSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* Dark mode support */
            body.dark .hmt-config-content {
                background: #2d3748;
                color: #e2e8f0;
            }

            body.dark .hmt-config-section h4 {
                color: #e2e8f0;
            }

            body.dark .hmt-config-section p {
                color: #a0aec0;
            }

            body.dark .hmt-color-text {
                background: #2d3748;
                border-color: #4a5568;
                color: #e2e8f0;
            }

            body.dark .hmt-color-text:focus {
                background: #1a202c;
                border-color: #667eea;
            }

            body.dark .hmt-color-help {
                color: #a0aec0;
            }

            body.dark .hmt-color-picker {
                border-color: #764ba2;
                box-shadow: 0 2px 8px rgba(118, 75, 162, 0.2);
            }

            body.dark .hmt-color-picker:hover {
                box-shadow: 0 4px 16px rgba(118, 75, 162, 0.3);
            }

            body.dark .hmt-color-picker-label {
                color: #764ba2;
            }

            /* Dark mode logo styling */
            body.dark .hmt-logo {
                border-color: rgba(255, 255, 255, 0.3);
            }

            body.dark .hmt-logo:not([src]),
            body.dark .hmt-logo[src=""] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
            }

            body.dark .hmt-config-preview {
                background: #1a202c;
            }

            body.dark .hmt-config-footer {
                background: #1a202c;
            }

            body.dark .hmt-config-reset {
                background: #1a202c;
                color: #a0aec0;
                border-color: #4a5568;
            }

            body.dark .hmt-config-reset:hover {
                background: #2d3748;
                color: #e2e8f0;
            }
        `);

        document.body.appendChild(dialog);

        // Đồng bộ màu hiện tại với tất cả các elements
         debugLog('Đồng bộ màu hiện tại với dialog:', currentColor);

         // Đồng bộ color text input
         const colorText = dialog.querySelector('.hmt-color-text');
         if (colorText) {
             colorText.value = currentColor;
         }

         // Đồng bộ preview box
         const previewBox = dialog.querySelector('.hmt-preview-box');
         if (previewBox) {
             previewBox.style.backgroundColor = currentColor;
         }

         // Đồng bộ color picker display
         const colorPreview = dialog.querySelector('#hmt-color-preview');
         const colorValue = dialog.querySelector('#hmt-color-value');
         if (colorPreview) colorPreview.style.backgroundColor = currentColor;
         if (colorValue) colorValue.textContent = currentColor;

         debugLog('Tạo config dialog hoàn thành');

         // Event listeners
         setupConfigEventListeners(dialog);

        // Xử lý lỗi load logo
        const logo = dialog.querySelector('.hmt-logo');
        if (logo) {
            logo.onerror = function() {
                this.src = '';
                this.onerror = null;
            };
        }

        debugLog('Đã tạo config dialog');
    }

    function setupConfigEventListeners(dialog) {
        const closeBtn = dialog.querySelector('.hmt-config-close');
        const overlay = dialog.querySelector('.hmt-config-overlay');
        const colorText = dialog.querySelector('.hmt-color-text');
        const previewBox = dialog.querySelector('.hmt-preview-box');
        const saveBtn = dialog.querySelector('.hmt-config-save');
        const resetBtn = dialog.querySelector('.hmt-config-reset');
        const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');

        // Lưu màu hiện tại để có thể khôi phục nếu không lưu
         const currentColor = dialog._currentColor || getDefaultColor();
         let previewColor = currentColor; // Màu đang preview

         // Throttle cho event dispatching để tránh quá tải
         let lastEventTime = 0;
         const EVENT_THROTTLE = 100; // ms

        // Hàm áp dụng màu preview (chưa lưu vào storage)
        function applyPreviewColor(color) {
            debugLog('Áp dụng màu preview:', color);

            // Sử dụng requestAnimationFrame để tránh blocking
            requestAnimationFrame(() => {
                const now = Date.now();
                if (now - lastEventTime >= EVENT_THROTTLE) {
                    // Phát sự kiện màu sắc thay đổi để các module khác cập nhật real-time
                    const colorChangeEvent = new CustomEvent('hmtColorChanged', {
                        detail: {
                            color: color,
                            timestamp: now,
                            isPreview: true // Đánh dấu là preview mode
                        }
                    });
                    document.dispatchEvent(colorChangeEvent);
                    lastEventTime = now;
                    debugLog('Đã phát sự kiện màu sắc thay đổi (preview):', color);
                }
            });
        }

        // Đóng dialog
         function closeDialog() {
             // Đóng color picker panel nếu đang mở
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Nếu màu preview khác với màu hiện tại và không phải là màu đã lưu
             if (previewColor !== currentColor) {
                 debugLog('Khôi phục màu cũ khi đóng dialog:', currentColor);
                 // Khôi phục màu cũ
                 applyPreviewColor(currentColor);
             }

             // Xóa currentColor khỏi dialog trước khi remove
             delete dialog._currentColor;
             dialog.remove();
         }

        closeBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                // Đóng color picker panel nếu đang mở (cho các phần tử cũ)
                if (colorPickerPanel && colorPickerPanel.classList.contains('open')) {
                    colorPickerPanel.classList.remove('open');
                } else {
                    closeDialog();
                }
            }
        });

        // Xử lý color picker tùy chỉnh
        const customColorPicker = dialog.querySelector('.hmt-custom-color-picker');
        const colorPreview = dialog.querySelector('#hmt-color-preview');
        const colorValue = dialog.querySelector('#hmt-color-value');
        const hueSlider = dialog.querySelector('#hmt-hue-slider');
        const satSlider = dialog.querySelector('#hmt-sat-slider');
        const lightSlider = dialog.querySelector('#hmt-light-slider');
        const paletteArea = dialog.querySelector('#hmt-color-palette-area');
        const paletteCursor = dialog.querySelector('#hmt-palette-cursor');
        const hueBar = dialog.querySelector('.hmt-hue-bar');
        const hueCursor = dialog.querySelector('#hmt-hue-cursor');

        // Hàm chuyển đổi HEX sang HSL
        function hexToHsl(hex) {
            // Loại bỏ dấu # nếu có
            hex = hex.replace('#', '');

            // Chuyển đổi hex sang RGB
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }

        // Khởi tạo giá trị HSL từ màu hiện tại
        const currentHsl = hexToHsl(currentColor);
        let currentHue = currentHsl.h;
        let currentSat = currentHsl.s;
        let currentLight = currentHsl.l;
        let currentX = currentSat / 100;
        let currentY = 1 - (currentLight / 100);

        // Hàm chuyển đổi HSL sang HEX
        function hslToHex(h, s, l) {
            h /= 360;
            s /= 100;
            l /= 100;

            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((h * 6) % 2 - 1));
            const m = l - c/2;
            let r = 0, g = 0, b = 0;

            if (0 <= h && h < 1/6) {
                r = c; g = x; b = 0;
            } else if (1/6 <= h && h < 2/6) {
                r = x; g = c; b = 0;
            } else if (2/6 <= h && h < 3/6) {
                r = 0; g = c; b = x;
            } else if (3/6 <= h && h < 4/6) {
                r = 0; g = x; b = c;
            } else if (4/6 <= h && h < 5/6) {
                r = x; g = 0; b = c;
            } else if (5/6 <= h && h < 1) {
                r = c; g = 0; b = x;
            }

            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);

            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        // Hàm đồng bộ UI với màu hiện tại (không gửi sự kiện preview)
        function syncUIWithColor(hex) {
            debugLog('Đồng bộ UI với màu:', hex);

            // Sử dụng requestAnimationFrame để tránh blocking
            requestAnimationFrame(() => {
                // Tạm thời disable transition cho các elements để tránh animation
                let originalTransitionPreview = '';
                let originalTransitionBox = '';
                if (colorPreview) {
                    originalTransitionPreview = colorPreview.style.transition || '';
                    colorPreview.style.transition = 'none';
                }
                if (previewBox) {
                    originalTransitionBox = previewBox.style.transition || '';
                    previewBox.style.transition = 'none';
                }

                // Cập nhật tất cả các elements UI
                if (colorPreview) colorPreview.style.backgroundColor = hex;
                if (colorValue) colorValue.textContent = hex;
                if (colorText) colorText.value = hex;
                if (previewBox) previewBox.style.backgroundColor = hex;

                // Restore transition sau khi update
                if (colorPreview) {
                    colorPreview.style.transition = originalTransitionPreview;
                }
                if (previewBox) {
                    previewBox.style.transition = originalTransitionBox;
                }

                debugLog('Đã đồng bộ UI với màu:', hex);
            });
        }

        // Hàm cập nhật màu từ HSL
         function updateColorFromHSL() {
             const hex = hslToHex(currentHue, currentSat, currentLight);
             debugLog('Cập nhật màu từ HSL:', hex);

             // Sử dụng requestAnimationFrame để tránh blocking main thread
             requestAnimationFrame(() => {
                 // Cập nhật tất cả các elements UI
                 syncUIWithColor(hex);

                 // Áp dụng màu preview ngay lập tức
                 previewColor = hex;
                 applyPreviewColor(hex);

                 debugLog('Đã cập nhật UI từ HSL picker:', hex);
             });
         }

        // Hàm cập nhật vị trí cursor
        function updateCursors() {
            if (paletteCursor) {
                paletteCursor.style.left = (currentX * 180) + 'px';
                paletteCursor.style.top = (120 - currentY * 120) + 'px';
            }
            if (hueCursor) {
                hueCursor.style.top = (currentHue / 360 * 120) + 'px';
            }
        }

        // Xử lý thanh hue
         if (hueSlider) {
             hueSlider.addEventListener('input', function() {
                 currentHue = parseInt(this.value);
                 debugLog('Hue thay đổi:', currentHue);
                 updateColorFromHSL();
                 updateCursors();
             });
         }

         // Xử lý thanh saturation
         if (satSlider) {
             satSlider.addEventListener('input', function() {
                 currentSat = parseInt(this.value);
                 debugLog('Saturation thay đổi:', currentSat);
                 updateColorFromHSL();
             });
         }

         // Xử lý thanh lightness
         if (lightSlider) {
             lightSlider.addEventListener('input', function() {
                 currentLight = parseInt(this.value);
                 debugLog('Lightness thay đổi:', currentLight);
                 updateColorFromHSL();
             });
         }

        // Xử lý bảng màu 2D
         if (paletteArea) {
             paletteArea.addEventListener('mousedown', function(e) {
                 debugLog('Palette area mousedown');
                 function updatePaletteColor(e) {
                     const rect = paletteArea.getBoundingClientRect();
                     const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                     const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

                     currentX = x;
                     currentY = y;

                     // Tính saturation và lightness từ vị trí
                     currentSat = x * 100;
                     currentLight = (1 - y) * 100;

                     if (satSlider) satSlider.value = currentSat;
                     if (lightSlider) lightSlider.value = currentLight;

                     debugLog('Palette color cập nhật:', {x, y, currentSat, currentLight});
                     updateColorFromHSL();
                     updateCursors();
                 }

                 updatePaletteColor(e);

                 function onMouseMove(e) {
                     updatePaletteColor(e);
                 }

                 function onMouseUp() {
                     document.removeEventListener('mousemove', onMouseMove);
                     document.removeEventListener('mouseup', onMouseUp);
                 }

                 document.addEventListener('mousemove', onMouseMove);
                 document.addEventListener('mouseup', onMouseUp);
             });
         }

        // Xử lý thanh hue màu sắc
         if (hueBar) {
             hueBar.addEventListener('mousedown', function(e) {
                 debugLog('Hue bar mousedown');
                 function updateHue(e) {
                     const rect = hueBar.getBoundingClientRect();
                     const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                     currentHue = y * 360;
                     if (hueSlider) hueSlider.value = currentHue;
                     debugLog('Hue cập nhật:', currentHue);
                     updateColorFromHSL();
                     updateCursors();
                 }

                 updateHue(e);

                 function onMouseMove(e) {
                     updateHue(e);
                 }

                 function onMouseUp() {
                     document.removeEventListener('mousemove', onMouseMove);
                     document.removeEventListener('mouseup', onMouseUp);
                 }

                 document.addEventListener('mousemove', onMouseMove);
                 document.addEventListener('mouseup', onMouseUp);
             });
         }

        // Khởi tạo màu ban đầu - đồng bộ với màu hiện tại
         debugLog('Khởi tạo color picker tùy chỉnh');
         debugLog('Color preview element:', !!colorPreview);
         debugLog('Color value element:', !!colorValue);
         debugLog('Hue slider element:', !!hueSlider);
         debugLog('Sat slider element:', !!satSlider);
         debugLog('Light slider element:', !!lightSlider);
         debugLog('Palette area element:', !!paletteArea);
         debugLog('Hue bar element:', !!hueBar);

         // Đồng bộ các elements với màu hiện tại (không gửi sự kiện preview)
         syncUIWithColor(currentColor);

         // Đặt vị trí cursor dựa trên giá trị HSL hiện tại
         updateCursors();

        // Xử lý text input
         colorText.addEventListener('input', function() {
             const color = this.value.trim();
             debugLog('Text input thay đổi:', color);

             if (isValidHexColor(color)) {
                 debugLog('Màu hợp lệ từ text input');
                 // Cập nhật tất cả các elements UI
                 syncUIWithColor(color);

                 // Áp dụng màu preview ngay lập tức
                 previewColor = color;
                 applyPreviewColor(color);

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             } else {
                 debugLog('Màu không hợp lệ từ text input');
             }
         });

        // Lưu cài đặt
         saveBtn.addEventListener('click', function() {
             const selectedColor = previewColor; // Lưu màu đang preview
             debugLog('Lưu cài đặt màu:', selectedColor);
             if (isValidHexColor(selectedColor)) {
                 // Thực sự lưu màu vào storage và phát sự kiện chính thức
                 setDefaultColor(selectedColor);

                 // Cập nhật tất cả các elements UI với màu đã lưu
                 syncUIWithColor(selectedColor);

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }

                 showNotification('Đã lưu cài đặt màu sắc!', 3000);
                 closeDialog();
             } else {
                 debugLog('Màu không hợp lệ khi lưu:', selectedColor);
                 showNotification('Màu không hợp lệ! Vui lòng nhập mã màu HEX đúng định dạng.', 5000);

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }

                 // Không cần gắn lại sự kiện vì đã loại bỏ preset
             }
         });

         // Đóng color picker panel nếu đang mở khi khởi tạo
         if (colorPickerPanel) {
             colorPickerPanel.classList.remove('open');
         }

         debugLog('Hoàn thành setup event listeners');

        // Khôi phục mặc định
         resetBtn.addEventListener('click', function() {
             const defaultColor = '#17deb3';
             debugLog('Reset màu về mặc định (preview):', defaultColor);

             // Cập nhật preview color
             previewColor = defaultColor;

             // Cập nhật tất cả các elements UI
             syncUIWithColor(defaultColor);

             // Áp dụng màu preview ngay lập tức
             applyPreviewColor(defaultColor);

             // Đóng color picker panel nếu đang mở
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             showNotification('Đã khôi phục màu mặc định!', 3000);

             debugLog('Đã cập nhật UI cho reset button:', defaultColor);
         });

        // Đóng khi nhấn ESC
         document.addEventListener('keydown', function(e) {
             if (e.key === 'Escape') {
                 // Đóng color picker panel nếu đang mở (cho các phần tử cũ)
                 if (colorPickerPanel && colorPickerPanel.classList.contains('open')) {
                     colorPickerPanel.classList.remove('open');
                 } else {
                     closeDialog();
                 }
             }
         });
    }

    function isValidHexColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    function showNotification(message, timeout = 3000) {
        if (typeof GM_notification === 'function') {
            GM_notification({
                title: 'HakoMonetTheme',
                text: message,
                timeout: timeout,
                silent: false
            });
        } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                z-index: 10002;
                max-width: 300px;
                animation: slideIn 0.5s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

            notification.innerHTML = `
                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">HakoMonetTheme</h4>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">${message}</p>
            `;

            // Thêm animation vào notification
            setTimeout(() => {
                notification.style.animation = 'hmtNotificationSlideIn 0.5s ease-out';
            }, 10);

            document.body.appendChild(notification);

            // Thêm keyframes cho notification animation nếu chưa có
            if (!document.querySelector('#hmt-notification-styles')) {
                const style = document.createElement('style');
                style.id = 'hmt-notification-styles';
                style.textContent = `
                    @keyframes hmtNotificationSlideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, timeout);
        }
    }

    function openConfigDialog() {
        debugLog('Mở config dialog');
        createConfigDialog();
    }

    debugLog('Config module đã được tải');

    // Xuất các hàm cần thiết
    window.HMTConfig = {
        getDefaultColor: getDefaultColor,
        setDefaultColor: setDefaultColor,
        openConfigDialog: openConfigDialog
    };

})();