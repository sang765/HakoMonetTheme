(function() {
    'use strict';

    const DEBUG = true;
    const DEFAULT_COLORS = [
        { name: 'Purple (Mặc định)', value: '#6c5ce7', type: 'default' },
        { name: 'Blue', value: '#2196F3', type: 'default' },
        { name: 'Green', value: '#4CAF50', type: 'default' },
        { name: 'Orange', value: '#FF9800', type: 'default' },
        { name: 'Red', value: '#F44336', type: 'default' },
        { name: 'Pink', value: '#E91E63', type: 'default' },
        { name: 'Teal', value: '#009688', type: 'default' },
        { name: 'Indigo', value: '#3F51B5', type: 'default' }
    ];

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Config]', ...args);
        }
    }

    function getDefaultColor() {
        return GM_getValue('default_color', '#6c5ce7');
    }

    function getHideDomainWarning() {
        return GM_getValue('hide_domain_warning', false);
    }

    function setHideDomainWarning(hide) {
        GM_setValue('hide_domain_warning', hide);
        debugLog('Đã lưu thiết lập ẩn cảnh báo tên miền:', hide);
    }

    function setDefaultColor(color) {
        GM_setValue('default_color', color);
        debugLog('Đã lưu màu mặc định:', color);
    }

    function getColorName(colorValue) {
        const allColors = getAllColors();
        const color = allColors.find(c => c.value === colorValue);
        return color ? color.name : 'Custom';
    }

    function getAllColors() {
        const customColors = getCustomColors();
        return [...DEFAULT_COLORS, ...customColors];
    }

    function getCustomColors() {
        const custom = GM_getValue('custom_presets', []);
        return custom.map(preset => ({ ...preset, type: 'custom' }));
    }

    function saveCustomPreset(colorValue, name) {
        const customColors = getCustomColors();
        const newPreset = {
            id: Date.now().toString(),
            name: name || `Custom ${customColors.length + 1}`,
            value: colorValue,
            dateAdded: new Date().toISOString()
        };

        customColors.push(newPreset);
        GM_setValue('custom_presets', customColors);
        debugLog('Đã lưu custom preset:', newPreset);
        return newPreset;
    }

    function removeCustomPreset(presetId) {
        const customColors = getCustomColors();
        const filtered = customColors.filter(preset => preset.id !== presetId);
        GM_setValue('custom_presets', filtered);
        debugLog('Đã xóa custom preset:', presetId);
    }

    function generateColorName(colorValue) {
        const customColors = getCustomColors();
        const existingCount = customColors.filter(preset =>
            preset.name.startsWith('Custom')
        ).length;
        return `Custom ${existingCount + 1}`;
    }

    function loadCustomPresets(dialog) {
        const customSection = dialog.querySelector('#customPresetsSection');
        const customGrid = dialog.querySelector('#customPresetsGrid');
        const customColors = getCustomColors();

        if (customColors.length > 0) {
            customSection.style.display = 'block';
            customGrid.innerHTML = customColors.map(color => `
                <div class="hmt-color-preset ${getDefaultColor() === color.value ? 'active' : ''}"
                     data-color="${color.value}"
                     data-type="${color.type}"
                     data-preset-id="${color.id}"
                     style="background-color: ${color.value}; position: relative;">
                    <span class="hmt-color-name">${color.name}</span>
                    <button class="hmt-delete-preset" data-preset-id="${color.id}" title="Xóa preset này">×</button>
                </div>
            `).join('');
        } else {
            customSection.style.display = 'none';
        }
    }

    function refreshCustomPresets(dialog) {
        loadCustomPresets(dialog);
    }

    function saveCurrentColorToPreset(dialog) {
        const currentColor = dialog.querySelector('.hmt-color-text').value.trim();
        const colorPicker = dialog.querySelector('.hmt-color-picker').value;

        // Ưu tiên màu từ text input, fallback về color picker
        const colorToSave = currentColor || colorPicker;

        if (!isValidHexColor(colorToSave)) {
            showNotification('Màu không hợp lệ! Vui lòng chọn màu trước khi lưu.', 5000);
            return;
        }

        // Kiểm tra xem màu đã tồn tại trong default presets chưa
        const allColors = getAllColors();
        const existingColor = allColors.find(c => c.value.toLowerCase() === colorToSave.toLowerCase());

        if (existingColor && existingColor.type === 'default') {
            showNotification('Màu này đã có trong danh sách mặc định!', 3000);
            return;
        }

        // Tạo dialog nhập tên
        const name = generateColorName(colorToSave);
        const customName = prompt('Nhập tên cho màu preset này:', name);

        if (customName !== null && customName.trim() !== '') {
            saveCustomPreset(colorToSave, customName.trim());
            refreshCustomPresets(dialog);
            showNotification(`Đã lưu màu "${customName.trim()}" vào preset!`, 3000);
        }
    }

    function updateSavePresetButton(dialog) {
        const saveBtn = dialog.querySelector('#saveToPresetBtn');
        const currentColor = dialog.querySelector('.hmt-color-text').value.trim();

        if (saveBtn) {
            if (currentColor && isValidHexColor(currentColor)) {
                saveBtn.disabled = false;
            } else {
                saveBtn.disabled = true;
            }
        }
    }

    function deletePresetWithAnimation(deleteBtn, presetId, dialog) {
        const presetElement = deleteBtn.closest('.hmt-color-preset');

        // Thêm loading state
        deleteBtn.classList.add('deleting');
        deleteBtn.textContent = '⋯';

        // Thử xóa preset
        try {
            removeCustomPreset(presetId);

            // Animation fade out
            if (presetElement) {
                presetElement.style.transition = 'all 0.3s ease';
                presetElement.style.opacity = '0';
                presetElement.style.transform = 'scale(0.8)';

                setTimeout(() => {
                    refreshCustomPresets(dialog);

                    // Kiểm tra xem còn custom presets không
                    const customColors = getCustomColors();
                    const customSection = dialog.querySelector('#customPresetsSection');

                    if (customColors.length === 0 && customSection) {
                        customSection.style.display = 'none';
                    }

                    showNotification('Đã xóa preset!', 3000);
                }, 300);
            } else {
                refreshCustomPresets(dialog);
                showNotification('Đã xóa preset!', 3000);
            }

        } catch (error) {
            debugLog('Lỗi khi xóa preset:', error);
            showNotification('Lỗi khi xóa preset. Vui lòng thử lại.', 5000);

            // Reset button state
            deleteBtn.classList.remove('deleting');
            deleteBtn.textContent = '×';
        }
    }

    // Global function để xóa custom preset (được gọi từ onclick)
    window.deleteCustomPreset = function(presetId) {
        if (confirm('Bạn có chắc chắn muốn xóa preset này?')) {
            removeCustomPreset(presetId);

            // Refresh tất cả dialogs đang mở
            document.querySelectorAll('.hmt-config-dialog').forEach(dialog => {
                refreshCustomPresets(dialog);
            });

            showNotification('Đã xóa preset!', 3000);
        }
    };

    function createConfigDialog() {
        // Kiểm tra xem dialog đã tồn tại chưa
        if (document.querySelector('.hmt-config-dialog')) {
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'hmt-config-dialog';
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
                            <h4>Cài đặt chung</h4>
                            <div class="hmt-setting-item">
                                <label class="hmt-setting-label">
                                    <input type="checkbox" id="hideDomainWarning" ${getHideDomainWarning() ? 'checked' : ''}>
                                    <span class="hmt-checkbox-custom"></span>
                                    <span class="hmt-setting-text">Ẩn cảnh báo tên miền</span>
                                </label>
                                <p class="hmt-setting-description">Tự động xử lý quyền truy cập cross-origin mà không hiển thị cảnh báo. Có thể làm giảm chức năng phân tích màu sắc từ ảnh bìa.</p>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Màu mặc định</h4>
                            <p>Chọn màu sẽ được sử dụng khi không thể lấy màu từ ảnh bìa truyện. Bạn có thể chọn từ các màu preset hoặc sử dụng color picker để chọn màu tùy chỉnh.</p>

                            <div class="hmt-color-presets">
                                <div class="hmt-presets-section">
                                    <h5>Màu mặc định</h5>
                                    <div class="hmt-presets-grid">
                                        ${DEFAULT_COLORS.map(color => `
                                            <div class="hmt-color-preset ${getDefaultColor() === color.value ? 'active' : ''}"
                                                 data-color="${color.value}"
                                                 data-type="${color.type}"
                                                 style="background-color: ${color.value}">
                                                <span class="hmt-color-name">${color.name}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <div class="hmt-custom-presets-section" id="customPresetsSection" style="display: none;">
                                    <div class="hmt-section-header">
                                        <h5>Màu tùy chỉnh</h5>
                                        <button class="hmt-toggle-custom-btn" onclick="this.classList.toggle('collapsed')">
                                            <span class="hmt-toggle-icon">−</span>
                                        </button>
                                    </div>
                                    <div class="hmt-presets-grid hmt-custom-grid" id="customPresetsGrid">
                                        <!-- Custom presets will be loaded here -->
                                    </div>
                                </div>
                            </div>

                            <div class="hmt-preset-actions">
                                <button class="hmt-save-preset-btn" id="saveToPresetBtn">
                                    💾 Lưu vào Preset
                                </button>
                                <div class="hmt-preset-info">
                                    <small>Lưu màu hiện tại vào danh sách preset để sử dụng nhanh lần sau</small>
                                </div>
                            </div>

                            <div class="hmt-custom-color">
                                <label for="hmt-custom-color-input">Chọn màu tùy chỉnh:</label>
                                <div class="hmt-color-input-group">
                                    <div class="hmt-color-picker-wrapper">
                                        <input type="color"
                                               id="hmt-custom-color-input"
                                               value="${getDefaultColor()}"
                                               class="hmt-color-picker">
                                        <span class="hmt-color-picker-label">Color Picker</span>
                                    </div>
                                    <input type="text"
                                           id="hmt-custom-color-text"
                                           value="${getDefaultColor()}"
                                           class="hmt-color-text"
                                           placeholder="#6c5ce7">
                                </div>
                                <small class="hmt-color-help">Sử dụng color picker để chọn màu, hoặc nhập mã HEX trực tiếp</small>
                            </div>
                        </div>

                        <div class="hmt-config-preview">
                            <h4>Xem trước</h4>
                            <div class="hmt-preview-box" style="background-color: ${getDefaultColor()}">
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

        // Thêm CSS với Material You design
        GM_addStyle(`
            .hmt-config-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.32);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                backdrop-filter: blur(8px);
            }

            .hmt-config-content {
                background: #fef7ff;
                border-radius: 28px;
                box-shadow:
                    0 8px 32px rgba(0, 0, 0, 0.12),
                    0 2px 8px rgba(0, 0, 0, 0.08);
                width: 90%;
                max-width: 640px;
                max-height: 90vh;
                overflow: hidden;
                animation: hmtConfigSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                border: 1px solid rgba(255, 255, 255, 0.8);
            }

            .hmt-config-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px 32px;
                background: linear-gradient(135deg, #6750a4 0%, #7b2cbf 100%);
                color: white;
                position: relative;
                overflow: hidden;
            }

            .hmt-config-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.02)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.02)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
            }

            .hmt-header-content {
                display: flex;
                align-items: center;
                position: relative;
                z-index: 1;
            }

            .hmt-logo-section {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .hmt-logo {
                width: 56px;
                height: 56px;
                border-radius: 16px;
                object-fit: cover;
                border: 3px solid rgba(255, 255, 255, 0.15);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                background: rgba(255, 255, 255, 0.08);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .hmt-logo:hover {
                transform: scale(1.05) rotate(2deg);
                border-color: rgba(255, 255, 255, 0.25);
            }

            .hmt-logo:not([src]),
            .hmt-logo[src=""] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 20px;
                color: white;
            }

            .hmt-logo:not([src])::after,
            .hmt-logo[src=""]::after {
                content: "🎨";
                font-size: 24px;
            }

            .hmt-title-section h3 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                letter-spacing: -0.25px;
            }

            .hmt-subtitle {
                font-size: 15px;
                opacity: 0.85;
                font-weight: 400;
                margin-top: 4px;
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
                padding: 32px;
                max-height: 60vh;
                overflow-y: auto;
            }

            .hmt-config-section {
                margin-bottom: 32px;
                padding: 24px;
                background: rgba(103, 80, 164, 0.02);
                border-radius: 20px;
                border: 1px solid rgba(103, 80, 164, 0.08);
                position: relative;
            }

            .hmt-config-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(135deg, #6750a4 0%, #7b2cbf 100%);
                border-radius: 2px;
            }

            .hmt-config-section h4 {
                margin: 0 0 12px 0;
                color: #1c1b1f;
                font-size: 18px;
                font-weight: 600;
                letter-spacing: -0.25px;
            }

            .hmt-config-section p {
                margin: 0 0 20px 0;
                color: #49454f;
                font-size: 15px;
                line-height: 1.6;
            }

            .hmt-setting-item {
                margin-bottom: 20px;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }

            .hmt-setting-label {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                cursor: pointer;
                font-weight: 500;
                color: #333;
                font-size: 14px;
            }

            .hmt-setting-label input[type="checkbox"] {
                display: none;
            }

            .hmt-checkbox-custom {
                width: 20px;
                height: 20px;
                border: 2px solid #667eea;
                border-radius: 4px;
                position: relative;
                flex-shrink: 0;
                margin-top: 2px;
                transition: all 0.2s ease;
            }

            .hmt-setting-label input[type="checkbox"]:checked + .hmt-checkbox-custom {
                background: #667eea;
                border-color: #667eea;
            }

            .hmt-setting-label input[type="checkbox"]:checked + .hmt-checkbox-custom::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
            }

            .hmt-setting-text {
                flex: 1;
                line-height: 1.4;
            }

            .hmt-setting-description {
                margin: 8px 0 0 32px !important;
                color: #6c757d !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
                font-weight: 400 !important;
            }

            .hmt-color-presets {
                margin-bottom: 20px;
            }

            .hmt-presets-section {
                margin-bottom: 20px;
            }

            .hmt-presets-section h5 {
                margin: 0 0 12px 0;
                color: #495057;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .hmt-presets-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
            }

            .hmt-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .hmt-section-header h5 {
                margin: 0;
                color: #495057;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .hmt-toggle-custom-btn {
                background: none;
                border: none;
                color: #667eea;
                cursor: pointer;
                font-size: 18px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }

            .hmt-toggle-custom-btn:hover {
                background: rgba(102, 126, 234, 0.1);
            }

            .hmt-toggle-icon {
                transition: transform 0.3s ease;
            }

            .hmt-toggle-custom-btn.collapsed .hmt-toggle-icon {
                transform: rotate(45deg);
            }

            .hmt-custom-grid {
                transition: all 0.3s ease;
            }

            .hmt-toggle-custom-btn.collapsed + .hmt-custom-grid {
                display: none;
            }

            .hmt-color-preset {
                height: 64px;
                border-radius: 16px;
                cursor: pointer;
                display: flex;
                align-items: flex-end;
                padding: 12px;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                border: 2px solid transparent;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            .hmt-color-preset:hover {
                transform: translateY(-4px) scale(1.02);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                border-color: rgba(103, 80, 164, 0.2);
            }

            .hmt-color-preset.active {
                border-color: #6750a4;
                box-shadow:
                    0 0 0 3px rgba(103, 80, 164, 0.12),
                    0 4px 16px rgba(103, 80, 164, 0.15);
                transform: translateY(-2px) scale(1.01);
            }

            .hmt-color-name {
                color: white;
                font-size: 12px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                letter-spacing: 0.25px;
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

            .hmt-color-picker {
                width: 88px;
                height: 64px;
                border: 3px solid #6750a4;
                border-radius: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                box-shadow: 0 4px 12px rgba(103, 80, 164, 0.15);
                background: #fff;
            }

            .hmt-color-picker:hover {
                transform: scale(1.05) translateY(-2px);
                box-shadow: 0 8px 24px rgba(103, 80, 164, 0.25);
                border-color: #7b2cbf;
            }

            .hmt-color-picker-label {
                font-size: 13px;
                color: #6750a4;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 8px;
            }

            .hmt-color-text {
                flex: 1;
                padding: 16px 20px;
                border: 2px solid #e7e0ec;
                border-radius: 16px;
                font-size: 15px;
                font-family: 'Google Sans', monospace;
                background: #fef7ff;
                color: #1c1b1f;
                font-weight: 500;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .hmt-color-text:focus {
                outline: none;
                border-color: #6750a4;
                background: white;
                box-shadow: 0 0 0 4px rgba(103, 80, 164, 0.08);
                transform: translateY(-1px);
            }

            .hmt-color-text::placeholder {
                color: #79747e;
                opacity: 0.7;
            }

            .hmt-color-help {
                color: #6c757d;
                font-size: 12px;
                margin-top: 4px;
                display: block;
                line-height: 1.4;
            }

            .hmt-preset-actions {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
            }

            .hmt-save-preset-btn {
                background: linear-gradient(135deg, #146c2e 0%, #1d7e3f 100%);
                color: white;
                border: none;
                padding: 14px 24px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(20, 108, 46, 0.25);
                position: relative;
                overflow: hidden;
            }

            .hmt-save-preset-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
            }

            .hmt-save-preset-btn:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 8px 24px rgba(20, 108, 46, 0.35);
                background: linear-gradient(135deg, #1d7e3f 0%, #146c2e 100%);
            }

            .hmt-save-preset-btn:hover::before {
                left: 100%;
            }

            .hmt-save-preset-btn:disabled {
                background: #79747e;
                cursor: not-allowed;
                transform: none;
                box-shadow: 0 2px 8px rgba(121, 116, 126, 0.2);
                color: rgba(255, 255, 255, 0.7);
            }

            .hmt-preset-info {
                margin-top: 8px;
            }

            .hmt-preset-info small {
                color: #6c757d;
                font-size: 12px;
                line-height: 1.4;
            }

            .hmt-delete-preset {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #dc3545;
                color: white;
                border: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.2s ease;
                z-index: 10;
                box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
            }

            .hmt-delete-preset:hover {
                background: #c82333;
                transform: scale(1.1);
                box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
            }

            .hmt-delete-preset.deleting {
                opacity: 1 !important;
                background: #6c757d;
                cursor: not-allowed;
                animation: hmtDeletingPulse 1s infinite;
            }

            @keyframes hmtDeletingPulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }

            .hmt-color-preset:hover .hmt-delete-preset {
                opacity: 1;
            }

            .hmt-color-preset.custom .hmt-delete-preset {
                opacity: 0.7;
            }

            .hmt-color-preset.custom:hover .hmt-delete-preset {
                opacity: 1;
            }

            .hmt-config-preview {
                margin-top: 32px;
                padding: 24px;
                background: linear-gradient(135deg, #f7f2fa 0%, #fef7ff 100%);
                border-radius: 20px;
                border: 1px solid rgba(103, 80, 164, 0.08);
                position: relative;
            }

            .hmt-config-preview::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: linear-gradient(135deg, #6750a4 0%, #7b2cbf 100%);
                border-radius: 2px;
            }

            .hmt-config-preview h4 {
                margin: 0 0 16px 0;
                color: #1c1b1f;
                font-size: 18px;
                font-weight: 600;
                letter-spacing: -0.25px;
            }

            .hmt-preview-box {
                height: 88px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 16px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }

            .hmt-preview-box::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transform: rotate(45deg);
                opacity: 0;
                transition: opacity 0.3s;
            }

            .hmt-preview-box:hover::before {
                opacity: 1;
                animation: shimmer 1.5s infinite;
            }

            @keyframes shimmer {
                0% { transform: translateX(-100%) rotate(45deg); }
                100% { transform: translateX(200%) rotate(45deg); }
            }

            .hmt-config-footer {
                padding: 28px 32px;
                background: linear-gradient(135deg, #f7f2fa 0%, #fef7ff 100%);
                display: flex;
                justify-content: space-between;
                gap: 16px;
                border-top: 1px solid rgba(103, 80, 164, 0.08);
            }

            .hmt-config-reset,
            .hmt-config-save {
                padding: 14px 28px;
                border: none;
                border-radius: 20px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                overflow: hidden;
                min-width: 120px;
            }

            .hmt-config-reset {
                background: #fef7ff;
                color: #49454f;
                border: 2px solid #e7e0ec;
                box-shadow: 0 2px 8px rgba(73, 69, 79, 0.08);
            }

            .hmt-config-reset:hover {
                background: #f4eff7;
                color: #1c1b1f;
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(73, 69, 79, 0.15);
                border-color: #6750a4;
            }

            .hmt-config-save {
                background: linear-gradient(135deg, #6750a4 0%, #7b2cbf 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(103, 80, 164, 0.25);
            }

            .hmt-config-save:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 8px 24px rgba(103, 80, 164, 0.35);
                background: linear-gradient(135deg, #7b2cbf 0%, #6750a4 100%);
            }

            @keyframes hmtConfigSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.85) translateY(40px) rotate(-2deg);
                    filter: blur(8px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0) rotate(0deg);
                    filter: blur(0px);
                }
            }

            /* Enhanced animations for Material You */
            @keyframes hmtFadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes hmtScaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .hmt-config-section {
                animation: hmtFadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both;
            }

            .hmt-config-preview {
                animation: hmtFadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
            }

            /* Dark mode support với Material You */
            body.dark .hmt-config-overlay {
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(12px);
            }

            body.dark .hmt-config-content {
                background: #1c1b1f;
                color: #e6e1e5;
                border-color: rgba(255, 255, 255, 0.1);
            }

            body.dark .hmt-config-header {
                background: linear-gradient(135deg, #4a4458 0%, #5b5271 100%);
            }

            body.dark .hmt-config-section {
                background: rgba(74, 68, 88, 0.3);
                border-color: rgba(186, 180, 199, 0.12);
            }

            body.dark .hmt-config-section h4 {
                color: #e6e1e5;
            }

            body.dark .hmt-config-section p {
                color: #cac4d0;
            }

            body.dark .hmt-color-text {
                background: #2b2930;
                border-color: #938f99;
                color: #e6e1e5;
            }

            body.dark .hmt-color-text:focus {
                background: #1c1b1f;
                border-color: #d0bcff;
                box-shadow: 0 0 0 4px rgba(208, 188, 255, 0.12);
            }

            body.dark .hmt-color-text::placeholder {
                color: #938f99;
            }

            body.dark .hmt-color-help {
                color: #cac4d0;
            }

            body.dark .hmt-color-picker {
                border-color: #d0bcff;
                box-shadow: 0 4px 12px rgba(208, 188, 255, 0.15);
            }

            body.dark .hmt-color-picker:hover {
                box-shadow: 0 8px 24px rgba(208, 188, 255, 0.25);
                border-color: #e8def8;
            }

            body.dark .hmt-color-picker-label {
                color: #d0bcff;
            }

            /* Dark mode logo styling với Material You */
            body.dark .hmt-logo {
                border-color: rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.05);
            }

            body.dark .hmt-logo:not([src]),
            body.dark .hmt-logo[src=""] {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            }

            body.dark .hmt-config-preview {
                background: linear-gradient(135deg, #2b2930 0%, #1c1b1f 100%);
                border-color: rgba(186, 180, 199, 0.12);
            }

            body.dark .hmt-config-footer {
                background: linear-gradient(135deg, #2b2930 0%, #1c1b1f 100%);
                border-color: rgba(186, 180, 199, 0.08);
            }

            body.dark .hmt-config-reset {
                background: #2b2930;
                color: #cac4d0;
                border-color: #938f99;
                box-shadow: 0 2px 8px rgba(42, 41, 48, 0.5);
            }

            body.dark .hmt-config-reset:hover {
                background: #3a3741;
                color: #e6e1e5;
                border-color: #d0bcff;
                box-shadow: 0 4px 16px rgba(42, 41, 48, 0.7);
            }
        `);

        document.body.appendChild(dialog);

        // Load custom presets
        loadCustomPresets(dialog);

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
        const colorPresets = dialog.querySelectorAll('.hmt-color-preset');
        const colorPicker = dialog.querySelector('.hmt-color-picker');
        const colorText = dialog.querySelector('.hmt-color-text');
        const previewBox = dialog.querySelector('.hmt-preview-box');
        const saveBtn = dialog.querySelector('.hmt-config-save');
        const resetBtn = dialog.querySelector('.hmt-config-reset');
        const hideDomainWarningCheckbox = dialog.querySelector('#hideDomainWarning');

        // Đóng dialog
        function closeDialog() {
            dialog.remove();
        }

        closeBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeDialog();
            }
        });

        // Xử lý chọn màu preset
        colorPresets.forEach(preset => {
            preset.addEventListener('click', function() {
                // Bỏ active cho tất cả
                colorPresets.forEach(p => p.classList.remove('active'));
                // Thêm active cho preset được chọn
                this.classList.add('active');

                const color = this.dataset.color;
                colorPicker.value = color;
                colorText.value = color;
                previewBox.style.backgroundColor = color;

                debugLog('Đã chọn màu preset:', color);
            });
        });

        // Xử lý color picker
        colorPicker.addEventListener('input', function() {
            const color = this.value;
            colorText.value = color;
            previewBox.style.backgroundColor = color;

            // Bỏ active cho tất cả presets nếu đang chọn màu tùy chỉnh
            colorPresets.forEach(p => p.classList.remove('active'));

            // Cập nhật trạng thái nút save
            updateSavePresetButton(dialog);
        });

        // Xử lý text input
        colorText.addEventListener('input', function() {
            const color = this.value.trim();
            if (isValidHexColor(color)) {
                colorPicker.value = color;
                previewBox.style.backgroundColor = color;
                colorPresets.forEach(p => p.classList.remove('active'));
            }

            // Cập nhật trạng thái nút save
            updateSavePresetButton(dialog);
        });

        // Lưu cài đặt
        saveBtn.addEventListener('click', function() {
            const selectedColor = colorText.value.trim();
            if (isValidHexColor(selectedColor)) {
                setDefaultColor(selectedColor);
                showNotification('Đã lưu cài đặt màu sắc!', 3000);
                closeDialog();
            } else {
                showNotification('Màu không hợp lệ! Vui lòng nhập mã màu HEX đúng định dạng.', 5000);
            }
        });

        // Save to preset
        const saveToPresetBtn = dialog.querySelector('#saveToPresetBtn');
        if (saveToPresetBtn) {
            saveToPresetBtn.addEventListener('click', function() {
                saveCurrentColorToPreset(dialog);
            });
        }

        // Update save button state
        updateSavePresetButton(dialog);

        // Xử lý xóa custom presets
        const deleteBtns = dialog.querySelectorAll('.hmt-delete-preset');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const presetId = this.dataset.presetId;

                if (!presetId) {
                    showNotification('Lỗi: Không tìm thấy ID preset!', 5000);
                    return;
                }

                if (this.classList.contains('deleting')) {
                    return; // Đang xóa, bỏ qua click
                }

                const presetElement = this.closest('.hmt-color-preset');
                const presetName = presetElement ? presetElement.querySelector('.hmt-color-name').textContent : 'Unknown';

                if (confirm(`Bạn có chắc chắn muốn xóa preset "${presetName}"?`)) {
                    deletePresetWithAnimation(this, presetId, dialog);
                }
            });
        });

        // Khôi phục mặc định
        resetBtn.addEventListener('click', function() {
            const defaultColor = '#6c5ce7';
            setDefaultColor(defaultColor);

            // Cập nhật UI
            colorPicker.value = defaultColor;
            colorText.value = defaultColor;
            previewBox.style.backgroundColor = defaultColor;

            // Đặt active cho preset mặc định
            colorPresets.forEach(p => p.classList.remove('active'));
            const defaultPreset = dialog.querySelector(`[data-color="${defaultColor}"]`);
            if (defaultPreset) {
                defaultPreset.classList.add('active');
            }

            showNotification('Đã khôi phục màu mặc định!', 3000);
        });

        // Xử lý checkbox ẩn cảnh báo tên miền
        if (hideDomainWarningCheckbox) {
            hideDomainWarningCheckbox.addEventListener('change', function() {
                setHideDomainWarning(this.checked);
                showNotification(
                    'Cài đặt đã lưu',
                    this.checked ? 'Đã bật ẩn cảnh báo tên miền' : 'Đã tắt ẩn cảnh báo tên miền',
                    3000
                );
            });
        }

        // Đóng khi nhấn ESC
        document.addEventListener('keydown', function(e) {
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

            document.body.appendChild(notification);

            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, timeout);
        }
    }

    function openConfigDialog() {
        createConfigDialog();
    }

    // Xuất các hàm cần thiết
    window.HMTConfig = {
        getDefaultColor: getDefaultColor,
        setDefaultColor: setDefaultColor,
        getColorName: getColorName,
        getAllColors: getAllColors,
        getCustomColors: getCustomColors,
        saveCustomPreset: saveCustomPreset,
        removeCustomPreset: removeCustomPreset,
        getHideDomainWarning: getHideDomainWarning,
        setHideDomainWarning: setHideDomainWarning,
        openConfigDialog: openConfigDialog
    };

    debugLog('Config module đã được tải');

})();