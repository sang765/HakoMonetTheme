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
        (window.top || window).document.dispatchEvent(colorChangeEvent);
        debugLog('Đã phát sự kiện màu sắc thay đổi:', color);
    }

    function getHideDomainWarning() {
        return GM_getValue('hide_domain_warning', false);
    }

    function setHideDomainWarning(hide) {
        GM_setValue('hide_domain_warning', hide);
        debugLog('Đã lưu cài đặt ẩn cảnh báo tên miền:', hide);
    
        // Cập nhật cookie storage
        if (hide) {
            (window.top || window).document.cookie = "globalwarning=false; path=/; SameSite=Lax;";
            debugLog('Đã thêm cookie globalwarning=false');
        } else {
            (window.top || window).document.cookie = "globalwarning=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";
            debugLog('Đã xóa cookie globalwarning');
        }
    
        // Áp dụng thay đổi ngay lập tức
        applyDomainWarningVisibility();
    }

    function getDisableColorsOnReadingPage() {
        return GM_getValue('disable_colors_on_reading_page', false);
    }

    function setDisableColorsOnReadingPage(disable) {
        GM_setValue('disable_colors_on_reading_page', disable);
        debugLog('Đã lưu cài đặt tắt màu trên trang đọc truyện:', disable);

        // Phát sự kiện để các module khác cập nhật
        const disableChangeEvent = new CustomEvent('hmtDisableColorsChanged', {
            detail: { disabled: disable }
        });
        (window.top || window).document.dispatchEvent(disableChangeEvent);
        debugLog('Đã phát sự kiện tắt màu thay đổi:', disable);
    }

    function getColorMode() {
        return GM_getValue('color_mode', 'default');
    }

    function setColorMode(mode) {
        GM_setValue('color_mode', mode);
        debugLog('Đã lưu chế độ màu:', mode);

        // Phát sự kiện chế độ màu thay đổi để các module khác cập nhật
        const modeChangeEvent = new CustomEvent('hmtModeChanged', {
            detail: { mode: mode }
        });
        (window.top || window).document.dispatchEvent(modeChangeEvent);
        debugLog('Đã phát sự kiện chế độ màu thay đổi:', mode);
    }

    function applyDomainWarningVisibility() {
        const shouldHide = getHideDomainWarning();
        const warningElements = document.querySelectorAll('.border-l-4.border-yellow-400.bg-yellow-50.p-4');

        warningElements.forEach(element => {
            if (shouldHide) {
                element.style.display = 'none';
                debugLog('Đã ẩn cảnh báo tên miền');
            } else {
                element.style.display = '';
                debugLog('Đã hiện cảnh báo tên miền');
            }
        });
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
                                    <span class="hmt-subtitle">Cài đặt</span>
                                </div>
                            </div>
                        </div>
                        <button class="hmt-config-close">&times;</button>
                    </div>
                    <div class="hmt-config-body">
                        <div class="hmt-config-section">
                            <h4>Màu mặc định</h4>
                            <p>Chọn màu sẽ được sử dụng khi không thể lấy màu từ ảnh bìa truyện. Sử dụng thanh trượt HSL để điều chỉnh màu sắc theo ý muốn.</p>

                            <div class="hmt-custom-color">
                                <label for="hmt-custom-color-input">Chọn màu tùy chỉnh:</label>
                                <div class="hmt-color-input-group">
                                    <div class="hmt-color-picker-wrapper">
                                        <div class="hmt-custom-color-picker" id="hmt-custom-color-input">
                                            <div class="hmt-color-picker-display">
                                                <div class="hmt-color-preview" id="hmt-color-preview"></div>
                                                <span class="hmt-color-value" id="hmt-color-value">${currentColor}</span>
                                            </div>
                                            <div class="hmt-hsl-controls">
                                                <div class="hmt-hsl-slider-group">
                                                    <label class="hmt-slider-label">Hue</label>
                                                    <div class="hmt-slider-with-buttons">
                                                        <button class="hmt-slider-btn hmt-minus-btn" data-target="hmt-hue-slider" data-action="decrease">-</button>
                                                        <input type="range" class="hmt-color-slider hmt-hue-slider" id="hmt-hue-slider" min="0" max="360" value="${currentHsl.h}">
                                                        <button class="hmt-slider-btn hmt-plus-btn" data-target="hmt-hue-slider" data-action="increase">+</button>
                                                    </div>
                                                </div>
                                                <div class="hmt-hsl-slider-group">
                                                    <label class="hmt-slider-label">Saturation</label>
                                                    <div class="hmt-slider-with-buttons">
                                                        <button class="hmt-slider-btn hmt-minus-btn" data-target="hmt-sat-slider" data-action="decrease">-</button>
                                                        <input type="range" class="hmt-color-slider hmt-sat-slider" id="hmt-sat-slider" min="0" max="100" value="${currentHsl.s}">
                                                        <button class="hmt-slider-btn hmt-plus-btn" data-target="hmt-sat-slider" data-action="increase">+</button>
                                                    </div>
                                                </div>
                                                <div class="hmt-hsl-slider-group">
                                                    <label class="hmt-slider-label">Lightness</label>
                                                    <div class="hmt-slider-with-buttons">
                                                        <button class="hmt-slider-btn hmt-minus-btn" data-target="hmt-light-slider" data-action="decrease">-</button>
                                                        <input type="range" class="hmt-color-slider hmt-light-slider" id="hmt-light-slider" min="0" max="100" value="${currentHsl.l}">
                                                        <button class="hmt-slider-btn hmt-plus-btn" data-target="hmt-light-slider" data-action="increase">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="text"
                                                   id="hmt-custom-color-text"
                                                   value="${currentColor}"
                                                   class="hmt-color-text"
                                                   placeholder="#17deb3">
                                        </div>
                                        <span class="hmt-color-picker-label">Thanh trượt HSL</span>
                                    </div>
                                </div>
                                <small class="hmt-color-help">Kéo thanh trượt HSL để chọn màu, sử dụng nút +/- để điều chỉnh chi tiết, hoặc nhập mã HEX trực tiếp</small>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Ẩn cảnh báo tên miền</h4>
                            <p>Ẩn các cảnh báo về tên miền không chính thức trên trang web. Tính năng này sẽ ẩn các thông báo cảnh báo màu vàng.</p>

                            <div class="hmt-domain-warning-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${getHideDomainWarning() ? 'checked' : ''} class="hmt-domain-warning-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Ẩn cảnh báo tên miền
                                </label>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Tắt màu trên trang đọc truyện</h4>
                            <p>Tắt việc áp dụng màu sắc từ theme vào trang đọc truyện (nhận biết bởi class ".rd-basic_icon.row"). Khi bật, các trang đọc truyện sẽ không bị ảnh hưởng bởi màu theme.</p>

                            <div class="hmt-reading-page-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${getDisableColorsOnReadingPage() ? 'checked' : ''} class="hmt-reading-page-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Tắt màu trên trang đọc truyện
                                </label>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Chế độ màu</h4>
                            <p>Chọn loại màu để áp dụng cho theme: Mặc định sử dụng màu từ config, Thumbnail sử dụng màu lấy từ ảnh bìa truyện.</p>

                            <div class="hmt-color-mode-dropdown">
                                <label for="hmt-color-mode-select">Chế độ màu:</label>
                                <select id="hmt-color-mode-select" class="hmt-color-mode-select">
                                    <option value="default" ${getColorMode() === 'default' ? 'selected' : ''}>Mặc định</option>
                                    <option value="thumbnail" ${getColorMode() === 'thumbnail' ? 'selected' : ''}>Thumbnail</option>
                                </select>
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
                max-width: 700px;
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
                width: 360px;
            }

            .hmt-custom-color-picker {
                width: 320px;
                background: white;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                gap: 12px;
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

            .hmt-hsl-controls {
                margin-bottom: 8px;
            }

            .hmt-hsl-slider-group {
                margin-bottom: 12px;
            }

            .hmt-hsl-slider-group:last-child {
                margin-bottom: 0;
            }

            .hmt-slider-with-buttons {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .hmt-slider-btn {
                width: 32px;
                height: 32px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                background: #f8f9fa;
                color: #495057;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                user-select: none;
            }

            .hmt-slider-btn:hover {
                background: #e9ecef;
                border-color: #667eea;
                color: #667eea;
            }

            .hmt-slider-btn:active {
                transform: scale(0.95);
            }

            .hmt-color-picker-label {
                font-size: 12px;
                color: #667eea;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .hmt-color-text {
                width: 100%;
                padding: 10px 12px;
                border: 2px solid #e1e5e9;
                border-radius: 6px;
                font-size: 14px;
                font-family: monospace;
                background: #f8f9fa;
                color: #495057;
                font-weight: 500;
                box-sizing: border-box;
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
                transition: background-color 0.3s ease;
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

            .hmt-domain-warning-toggle {
                margin-top: 16px;
            }

            .hmt-reading-page-toggle {
                margin-top: 16px;
            }

            .hmt-color-mode-dropdown {
                margin-top: 16px;
            }

            .hmt-color-mode-select {
                width: 100%;
                padding: 8px 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                background: #f8f9fa;
                color: #495057;
                font-size: 14px;
                font-family: inherit;
                box-sizing: border-box;
            }

            .hmt-color-mode-select:focus {
                outline: none;
                border-color: #667eea;
                background: white;
            }

            .hmt-toggle-label {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #333;
                user-select: none;
            }

            .hmt-toggle-label input[type="checkbox"] {
                display: none;
            }

            .hmt-toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
                background-color: #ccc;
                border-radius: 24px;
                margin-right: 12px;
                transition: background-color 0.3s;
            }

            .hmt-toggle-switch::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background-color: white;
                border-radius: 50%;
                transition: transform 0.3s;
            }

            .hmt-toggle-label input[type="checkbox"]:checked + .hmt-toggle-switch {
                background-color: #667eea;
            }

            .hmt-toggle-label input[type="checkbox"]:checked + .hmt-toggle-switch::after {
                transform: translateX(26px);
            }
        `);

        (window.top || window).document.body.appendChild(dialog);

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
        const domainWarningToggle = dialog.querySelector('.hmt-domain-warning-toggle-input');
        const readingPageToggle = dialog.querySelector('.hmt-reading-page-toggle-input');

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
                closeDialog();
            }
        });

        // Xử lý color picker tùy chỉnh
        const customColorPicker = dialog.querySelector('.hmt-custom-color-picker');
        const colorPreview = dialog.querySelector('#hmt-color-preview');
        const colorValue = dialog.querySelector('#hmt-color-value');
        const hueSlider = dialog.querySelector('#hmt-hue-slider');
        const satSlider = dialog.querySelector('#hmt-sat-slider');
        const lightSlider = dialog.querySelector('#hmt-light-slider');
        const sliderButtons = dialog.querySelectorAll('.hmt-slider-btn');

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
                // Cập nhật tất cả các elements UI
                if (colorPreview) colorPreview.style.backgroundColor = hex;
                if (colorValue) colorValue.textContent = hex;
                if (colorText) colorText.value = hex;
                if (previewBox) previewBox.style.backgroundColor = hex;

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

        // Xử lý thanh HSL sliders
        if (hueSlider) {
            hueSlider.addEventListener('input', function() {
                currentHue = parseInt(this.value);
                debugLog('Hue thay đổi:', currentHue);
                updateColorFromHSL();
            });
        }

        if (satSlider) {
            satSlider.addEventListener('input', function() {
                currentSat = parseInt(this.value);
                debugLog('Saturation thay đổi:', currentSat);
                updateColorFromHSL();
            });
        }

        if (lightSlider) {
            lightSlider.addEventListener('input', function() {
                currentLight = parseInt(this.value);
                debugLog('Lightness thay đổi:', currentLight);
                updateColorFromHSL();
            });
        }

        // Xử lý nút +/- cho sliders với khả năng ấn giữ
        sliderButtons.forEach(button => {
            let intervalId = null;
            let isHolding = false;

            // Hàm thực hiện tăng/giảm giá trị
            function performAction() {
                const targetId = button.getAttribute('data-target');
                const action = button.getAttribute('data-action');
                const targetSlider = dialog.querySelector(`#${targetId}`);

                if (targetSlider) {
                    const step = targetId.includes('hue') ? 5 : 2; // Hue có step lớn hơn
                    const currentValue = parseInt(targetSlider.value);
                    let newValue;

                    if (action === 'increase') {
                        newValue = Math.min(currentValue + step, parseInt(targetSlider.max));
                    } else {
                        newValue = Math.max(currentValue - step, parseInt(targetSlider.min));
                    }

                    targetSlider.value = newValue;
                    debugLog(`${targetId} ${action} (hold): ${currentValue} -> ${newValue}`);

                    // Trigger input event để cập nhật màu
                    targetSlider.dispatchEvent(new Event('input'));
                }
            }

            // Xử lý click thông thường
            button.addEventListener('click', function(e) {
                if (!isHolding) {
                    performAction();
                }
            });

            // Xử lý bắt đầu ấn giữ
            button.addEventListener('mousedown', function(e) {
                e.preventDefault();
                isHolding = true;

                // Thực hiện action ngay lập tức
                performAction();

                // Đợi 500ms rồi bắt đầu lặp liên tục
                setTimeout(() => {
                    if (isHolding) {
                        intervalId = setInterval(performAction, 100); // Lặp mỗi 100ms
                    }
                }, 500);
            });

            // Xử lý kết thúc ấn giữ
            function stopHolding() {
                isHolding = false;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }

            // Lắng nghe mouseup trên toàn bộ document để dừng khi thả chuột ở bất cứ đâu
            document.addEventListener('mouseup', function() {
                if (isHolding) {
                    stopHolding();
                }
            });

            // Lắng nghe mouseleave để dừng khi chuột rời khỏi nút
            button.addEventListener('mouseleave', function() {
                if (isHolding) {
                    stopHolding();
                }
            });

            // Lắng nghe contextmenu để ngăn menu chuột phải khi ấn giữ
            button.addEventListener('contextmenu', function(e) {
                if (isHolding) {
                    e.preventDefault();
                }
            });
        });

        // Khởi tạo màu ban đầu - đồng bộ với màu hiện tại
         debugLog('Khởi tạo color picker tùy chỉnh');
         debugLog('Color preview element:', !!colorPreview);
         debugLog('Color value element:', !!colorValue);
         debugLog('Hue slider element:', !!hueSlider);
         debugLog('Sat slider element:', !!satSlider);
         debugLog('Light slider element:', !!lightSlider);
         debugLog('Slider buttons count:', sliderButtons.length);

         // Đồng bộ các elements với màu hiện tại (không gửi sự kiện preview)
         syncUIWithColor(currentColor);

        // Xử lý text input
         colorText.addEventListener('input', function() {
             const color = this.value.trim();
             debugLog('Text input thay đổi:', color);

             if (isValidHexColor(color)) {
                 debugLog('Màu hợp lệ từ text input');
                 // Chuyển đổi hex sang HSL và cập nhật sliders
                 const hsl = hexToHsl(color);
                 currentHue = hsl.h;
                 currentSat = hsl.s;
                 currentLight = hsl.l;

                 // Cập nhật giá trị sliders
                 if (hueSlider) hueSlider.value = currentHue;
                 if (satSlider) satSlider.value = currentSat;
                 if (lightSlider) lightSlider.value = currentLight;

                 // Cập nhật tất cả các elements UI
                 syncUIWithColor(color);

                 // Áp dụng màu preview ngay lập tức
                 previewColor = color;
                 applyPreviewColor(color);
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

                 showNotification('Đã lưu cài đặt màu sắc!', 3000);

                 // Tự động reload trang sau khi lưu cài đặt
                 setTimeout(() => {
                     location.reload();
                 }, 1000); // Đợi 1 giây để notification hiển thị trước khi reload

                 closeDialog();
             } else {
                 debugLog('Màu không hợp lệ khi lưu:', selectedColor);
                 showNotification('Màu không hợp lệ! Vui lòng nhập mã màu HEX đúng định dạng.', 5000);

                 // Không cần gắn lại sự kiện vì đã loại bỏ preset
             }
         });

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

             showNotification('Đã khôi phục màu mặc định!', 3000);

             debugLog('Đã cập nhật UI cho reset button:', defaultColor);
         });

        // Domain warning toggle
        if (domainWarningToggle) {
            domainWarningToggle.addEventListener('change', function() {
                setHideDomainWarning(this.checked);
                showNotification('Đã cập nhật cài đặt ẩn cảnh báo tên miền!', 3000);
            });
        }

        // Reading page colors toggle
        if (readingPageToggle) {
            readingPageToggle.addEventListener('change', function() {
                setDisableColorsOnReadingPage(this.checked);
                showNotification('Đã cập nhật cài đặt tắt màu trên trang đọc truyện!', 3000);
            });
        }

        // Color mode dropdown
        const colorModeSelect = dialog.querySelector('#hmt-color-mode-select');
        if (colorModeSelect) {
            colorModeSelect.addEventListener('change', function() {
                setColorMode(this.value);
                showNotification('Đã cập nhật chế độ màu!', 3000);
            });
        }

        // Đóng khi nhấn ESC
        (window.top || window).document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDialog();
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

            (window.top || window).document.body.appendChild(notification);

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

    function initializeConfig() {
        // Áp dụng cài đặt domain warning khi khởi tạo
        applyDomainWarningVisibility();
        debugLog('Config module đã được khởi tạo');
    }

    debugLog('Config module đã được tải');

    // Xuất các hàm cần thiết
    window.HMTConfig = {
        getDefaultColor: getDefaultColor,
        setDefaultColor: setDefaultColor,
        getHideDomainWarning: getHideDomainWarning,
        setHideDomainWarning: setHideDomainWarning,
        getDisableColorsOnReadingPage: getDisableColorsOnReadingPage,
        setDisableColorsOnReadingPage: setDisableColorsOnReadingPage,
        getColorMode: getColorMode,
        setColorMode: setColorMode,
        openConfigDialog: openConfigDialog,
        initialize: initializeConfig
    };

    // Khởi tạo config khi module load
    initializeConfig();

})();