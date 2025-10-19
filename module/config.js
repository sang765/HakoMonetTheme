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
             debugLog('Load custom presets:', customColors.length);
             customSection.style.display = 'block';

             // Đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

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

             debugLog('Đã tạo HTML cho custom presets:', customColors.length);

             // Gắn lại sự kiện cho các preset mới tạo
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 0);
        } else {
             customSection.style.display = 'none';

             // Đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }
         }
     }

    function refreshCustomPresets(dialog) {
        debugLog('Refresh custom presets');
        loadCustomPresets(dialog);

        // Đóng color picker panel nếu đang mở
        const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
        if (colorPickerPanel) {
            colorPickerPanel.classList.remove('open');
        }

        // Gắn lại sự kiện sau khi refresh
        setTimeout(() => {
            attachPresetEvents();
            attachDeleteEvents();
        }, 0);
    }

    // Hàm gắn sự kiện cho các preset màu (global)
    function attachPresetEvents() {
        const dialogs = document.querySelectorAll('.hmt-config-dialog');
        dialogs.forEach(dialog => {
            const allPresets = dialog.querySelectorAll('.hmt-color-preset');
            debugLog('Gắn sự kiện preset cho dialog:', allPresets.length);

            allPresets.forEach(preset => {
                // Kiểm tra xem đã có sự kiện chưa
                if (preset.hasAttribute('data-preset-events-attached')) {
                    return;
                }

                preset.setAttribute('data-preset-events-attached', 'true');

                preset.addEventListener('click', function() {
                    // Bỏ active cho tất cả
                    allPresets.forEach(p => p.classList.remove('active'));
                    // Thêm active cho preset được chọn
                    this.classList.add('active');

                    const color = this.dataset.color;
                    const type = this.dataset.type;
                    debugLog('Chọn màu preset:', color, 'type:', type);

                    const colorText = dialog.querySelector('.hmt-color-text');
                    const previewBox = dialog.querySelector('.hmt-preview-box');
                    const colorPreview = dialog.querySelector('#hmt-color-preview');
                    const colorValue = dialog.querySelector('#hmt-color-value');

                    if (colorText) colorText.value = color;
                    if (previewBox) previewBox.style.backgroundColor = color;

                    // Cập nhật color picker nếu có
                    if (colorPreview) colorPreview.style.backgroundColor = color;
                    if (colorValue) colorValue.textContent = color;

                    // Cập nhật trạng thái nút save
                    updateSavePresetButton(dialog);
                });
            });
        });
    }

    // Hàm gắn sự kiện cho các nút xóa (global)
    function attachDeleteEvents() {
        const dialogs = document.querySelectorAll('.hmt-config-dialog');
        dialogs.forEach(dialog => {
            const deleteBtns = dialog.querySelectorAll('.hmt-delete-preset');
            debugLog('Gắn sự kiện xóa cho dialog:', deleteBtns.length);

            deleteBtns.forEach(btn => {
                // Kiểm tra xem đã có sự kiện chưa
                if (btn.hasAttribute('data-events-attached')) {
                    return;
                }

                btn.setAttribute('data-events-attached', 'true');

                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const presetId = this.dataset.presetId;
                    debugLog('Click nút xóa preset:', presetId);

                    if (!presetId) {
                        showNotification('Lỗi: Không tìm thấy ID preset!', 5000);

                        // Gắn lại sự kiện sau khi lỗi
                        setTimeout(() => {
                            attachPresetEvents();
                            attachDeleteEvents();
                        }, 100);
                        return;
                    }

                    if (this.classList.contains('deleting')) {
                        debugLog('Đang xóa, bỏ qua click');
                        return; // Đang xóa, bỏ qua click
                    }

                    const presetElement = this.closest('.hmt-color-preset');
                    const presetName = presetElement ? presetElement.querySelector('.hmt-color-name').textContent : 'Unknown';
                    debugLog('Tên preset cần xóa:', presetName);

                    if (confirm(`Bạn có chắc chắn muốn xóa preset "${presetName}"?`)) {
                         deletePresetWithAnimation(this, presetId, dialog);
                     } else {
                         // Người dùng hủy xóa, gắn lại sự kiện
                         setTimeout(() => {
                             attachPresetEvents();
                             attachDeleteEvents();
                         }, 100);
                     }
                });
            });
        });
    }

    function saveCurrentColorToPreset(dialog) {
        const currentColor = dialog.querySelector('.hmt-color-text').value.trim();

        // Lấy màu từ text input
        const colorToSave = currentColor;

        if (!isValidHexColor(colorToSave)) {
             showNotification('Màu không hợp lệ! Vui lòng chọn màu trước khi lưu.', 5000);

             // Đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Gắn lại sự kiện sau khi lỗi
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);
             return;
         }

        // Kiểm tra xem màu đã tồn tại trong default presets chưa
        const allColors = getAllColors();
        const existingColor = allColors.find(c => c.value.toLowerCase() === colorToSave.toLowerCase());

        if (existingColor && existingColor.type === 'default') {
             showNotification('Màu này đã có trong danh sách mặc định!', 3000);

             // Đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Gắn lại sự kiện sau khi thông báo
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);
             return;
         }

        // Tạo dialog nhập tên
         const name = generateColorName(colorToSave);
         debugLog('Tên mặc định được tạo:', name);
         const customName = prompt('Nhập tên cho màu preset này:', name);
         debugLog('Tên người dùng nhập:', customName);

        if (customName !== null && customName.trim() !== '') {
             debugLog('Lưu preset với tên:', customName.trim());
             saveCustomPreset(colorToSave, customName.trim());
             refreshCustomPresets(dialog);

             // Đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Gắn lại sự kiện sau khi lưu
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);

             showNotification(`Đã lưu màu "${customName.trim()}" vào preset!`, 3000);
         } else if (customName !== null) {
             debugLog('Người dùng hủy nhập tên preset');
             // Người dùng hủy nhập tên, đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Gắn lại sự kiện sau khi hủy
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);
         } else {
             debugLog('Prompt bị đóng hoặc không được hỗ trợ');
             showNotification('Không thể mở hộp thoại nhập tên. Vui lòng thử lại.', 3000);

             // Gắn lại sự kiện sau khi lỗi
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);
         }
    }

    function updateSavePresetButton(dialog) {
        const saveBtn = dialog.querySelector('#saveToPresetBtn');
        const currentColor = dialog.querySelector('.hmt-color-text').value.trim();

        debugLog('Cập nhật trạng thái nút Save to Preset');
        debugLog('Màu hiện tại:', currentColor);
        debugLog('Màu hợp lệ:', isValidHexColor(currentColor));
        debugLog('Nút save tồn tại:', !!saveBtn);

        if (saveBtn) {
            if (currentColor && isValidHexColor(currentColor)) {
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
                debugLog('Nút Save được kích hoạt');
            } else {
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.5';
                debugLog('Nút Save bị vô hiệu hóa');
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
                     debugLog('Hoàn thành xóa preset với animation');
                     refreshCustomPresets(dialog);

                     // Kiểm tra xem còn custom presets không
                     const customColors = getCustomColors();
                     const customSection = dialog.querySelector('#customPresetsSection');

                     if (customColors.length === 0 && customSection) {
                         customSection.style.display = 'none';

                         // Đóng color picker panel nếu đang mở
                         const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
                         if (colorPickerPanel) {
                             colorPickerPanel.classList.remove('open');
                         }
                     }

                     // Gắn lại sự kiện sau khi xóa
                     setTimeout(() => {
                         attachPresetEvents();
                         attachDeleteEvents();
                     }, 350);

                     showNotification('Đã xóa preset!', 3000);
                 }, 300);
            } else {
                refreshCustomPresets(dialog);

                // Đóng color picker panel nếu đang mở
                const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
                if (colorPickerPanel) {
                    colorPickerPanel.classList.remove('open');
                }

                showNotification('Đã xóa preset!', 3000);
            }

        } catch (error) {
             debugLog('Lỗi khi xóa preset:', error);
             showNotification('Lỗi khi xóa preset. Vui lòng thử lại.', 5000);

             // Reset button state
             deleteBtn.classList.remove('deleting');
             deleteBtn.textContent = '×';

             // Đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Gắn lại sự kiện sau khi lỗi
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);
         }
    }

    // Global function để xóa custom preset (được gọi từ onclick)
     window.deleteCustomPreset = function(presetId) {
         if (confirm('Bạn có chắc chắn muốn xóa preset này?')) {
             removeCustomPreset(presetId);
             debugLog('Đã xóa preset từ global function:', presetId);

             // Refresh tất cả dialogs đang mở
             document.querySelectorAll('.hmt-config-dialog').forEach(dialog => {
                 refreshCustomPresets(dialog);

                 // Đóng color picker panel nếu đang mở
                 const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             });

             // Gắn lại sự kiện sau khi xóa
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);

             showNotification('Đã xóa preset!', 3000);
         } else {
             debugLog('Người dùng hủy xóa preset từ global function');
             // Người dùng hủy xóa, đóng color picker panel nếu đang mở
             document.querySelectorAll('.hmt-config-dialog').forEach(dialog => {
                 const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             });

             // Gắn lại sự kiện sau khi hủy
             setTimeout(() => {
                 attachPresetEvents();
                 attachDeleteEvents();
             }, 100);
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
                                        <div class="hmt-custom-color-picker" id="hmt-custom-color-input">
                                            <div class="hmt-color-picker-display">
                                                <div class="hmt-color-preview" id="hmt-color-preview"></div>
                                                <span class="hmt-color-value" id="hmt-color-value">#6c5ce7</span>
                                            </div>
                                            <div class="hmt-color-controls">
                                                <div class="hmt-color-slider-group">
                                                    <label class="hmt-slider-label">Hue</label>
                                                    <input type="range" class="hmt-color-slider hmt-hue-slider" id="hmt-hue-slider" min="0" max="360" value="262">
                                                </div>
                                                <div class="hmt-color-slider-group">
                                                    <label class="hmt-slider-label">Saturation</label>
                                                    <input type="range" class="hmt-color-slider hmt-sat-slider" id="hmt-sat-slider" min="0" max="100" value="73">
                                                </div>
                                                <div class="hmt-color-slider-group">
                                                    <label class="hmt-slider-label">Lightness</label>
                                                    <input type="range" class="hmt-color-slider hmt-light-slider" id="hmt-light-slider" min="0" max="100" value="59">
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
                                        <span class="hmt-color-picker-label">Color Picker tùy chỉnh</span>
                                    </div>
                                    <input type="text"
                                           id="hmt-custom-color-text"
                                           value="${getDefaultColor()}"
                                           class="hmt-color-text"
                                           placeholder="#6c5ce7">
                                </div>
                                <small class="hmt-color-help">Kéo thanh trượt hoặc click vào bảng màu để chọn, hoặc nhập mã HEX trực tiếp</small>
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
                        <div class="hmt-config-buttons">
                            <button class="hmt-config-apply">Áp dụng ngay</button>
                            <button class="hmt-config-save">Lưu cài đặt</button>
                        </div>
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
                height: 60px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: flex-end;
                padding: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
                position: relative;
                border: 3px solid transparent;
            }

            .hmt-color-preset:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }

            .hmt-color-preset.active {
                border-color: #333;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
                animation: hmtPresetSelected 0.3s ease-out;
            }

            @keyframes hmtPresetSelected {
                0% {
                    transform: scale(0.95);
                }
                50% {
                    transform: scale(1.05);
                }
                100% {
                    transform: scale(1);
                }
            }

            .hmt-color-name {
                color: white;
                font-size: 11px;
                font-weight: 600;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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

            .hmt-preset-actions {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
            }

            .hmt-save-preset-btn {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
                margin-bottom: 8px;
            }

            .hmt-save-preset-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            }

            .hmt-save-preset-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
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

            .hmt-config-buttons {
                display: flex;
                gap: 8px;
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

            .hmt-config-apply {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .hmt-config-apply:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            }

            .hmt-config-apply:active {
                transform: translateY(0);
                animation: hmtApplyBtnClick 0.2s ease-out;
            }

            @keyframes hmtApplyBtnClick {
                0% {
                    transform: translateY(0) scale(0.98);
                }
                50% {
                    transform: translateY(-2px) scale(1.02);
                }
                100% {
                    transform: translateY(0) scale(1);
                }
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

        // Load custom presets
         loadCustomPresets(dialog);

         // Đóng color picker panel nếu đang mở khi khởi tạo
         const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
         if (colorPickerPanel) {
             colorPickerPanel.classList.remove('open');
         }

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
        const colorPresets = dialog.querySelectorAll('.hmt-color-preset');
        const colorPicker = dialog.querySelector('.hmt-color-picker');
        const colorText = dialog.querySelector('.hmt-color-text');
        const previewBox = dialog.querySelector('.hmt-preview-box');
        const saveBtn = dialog.querySelector('.hmt-config-save');
        const applyBtn = dialog.querySelector('.hmt-config-apply');
        const resetBtn = dialog.querySelector('.hmt-config-reset');
        const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');

        // Đóng dialog
         function closeDialog() {
             // Đóng color picker panel nếu đang mở
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }
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

        // Gọi hàm gắn sự kiện global
        attachPresetEvents();

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

        let currentHue = 262;
        let currentSat = 73;
        let currentLight = 59;
        let currentX = 0.73;
        let currentY = 0.41;

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

        // Hàm cập nhật màu từ HSL
         function updateColorFromHSL() {
             const hex = hslToHex(currentHue, currentSat, currentLight);
             debugLog('Cập nhật màu từ HSL:', hex);

             if (colorPreview) colorPreview.style.backgroundColor = hex;
             if (colorValue) colorValue.textContent = hex;
             if (colorText) colorText.value = hex;
             if (previewBox) previewBox.style.backgroundColor = hex;

             // Bỏ active cho tất cả presets nếu đang chọn màu tùy chỉnh
             colorPresets.forEach(p => p.classList.remove('active'));

             // Cập nhật trạng thái nút save
             updateSavePresetButton(dialog);
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

        // Khởi tạo màu ban đầu
         debugLog('Khởi tạo color picker tùy chỉnh');
         debugLog('Color preview element:', !!colorPreview);
         debugLog('Color value element:', !!colorValue);
         debugLog('Hue slider element:', !!hueSlider);
         debugLog('Sat slider element:', !!satSlider);
         debugLog('Light slider element:', !!lightSlider);
         debugLog('Palette area element:', !!paletteArea);
         debugLog('Hue bar element:', !!hueBar);

         updateColorFromHSL();
         updateCursors();

        // Xử lý text input
         colorText.addEventListener('input', function() {
             const color = this.value.trim();
             debugLog('Text input thay đổi:', color);

             if (isValidHexColor(color)) {
                 debugLog('Màu hợp lệ từ text input');
                 if (previewBox) previewBox.style.backgroundColor = color;
                 colorPresets.forEach(p => p.classList.remove('active'));

                 // Cập nhật color picker nếu có
                 if (colorPreview) colorPreview.style.backgroundColor = color;
                 if (colorValue) colorValue.textContent = color;

                 // Đóng color picker panel nếu đang mở (cho các phần tử cũ)
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             } else {
                 debugLog('Màu không hợp lệ từ text input');
             }

             // Cập nhật trạng thái nút save
             updateSavePresetButton(dialog);
         });

        // Lưu cài đặt
         saveBtn.addEventListener('click', function() {
             const selectedColor = colorText.value.trim();
             debugLog('Lưu cài đặt màu:', selectedColor);
             if (isValidHexColor(selectedColor)) {
                 setDefaultColor(selectedColor);

                 // Cập nhật color picker nếu có
                 if (colorPreview) colorPreview.style.backgroundColor = selectedColor;
                 if (colorValue) colorValue.textContent = selectedColor;

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

                 // Gắn lại sự kiện sau khi lỗi
                 setTimeout(() => {
                     attachPresetEvents();
                     attachDeleteEvents();
                 }, 100);
             }
         });

        // Áp dụng màu ngay lập tức (real-time update)
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                const selectedColor = colorText.value.trim();
                debugLog('Áp dụng màu ngay lập tức:', selectedColor);

                if (isValidHexColor(selectedColor)) {
                    // Lưu màu vào storage và phát sự kiện để các module khác cập nhật
                    setDefaultColor(selectedColor);

                    // Đóng color picker panel nếu đang mở
                    if (colorPickerPanel) {
                        colorPickerPanel.classList.remove('open');
                    }

                    showNotification('Đã áp dụng màu sắc mới! Bạn có thể thấy thay đổi ngay lập tức.', 3000);
                } else {
                    debugLog('Màu không hợp lệ khi áp dụng ngay:', selectedColor);
                    showNotification('Màu không hợp lệ! Vui lòng nhập mã màu HEX đúng định dạng.', 5000);

                    // Đóng color picker panel nếu đang mở
                    if (colorPickerPanel) {
                        colorPickerPanel.classList.remove('open');
                    }

                    // Gắn lại sự kiện sau khi lỗi
                    setTimeout(() => {
                        attachPresetEvents();
                        attachDeleteEvents();
                    }, 100);
                }
            });
        }

        // Save to preset
        const saveToPresetBtn = dialog.querySelector('#saveToPresetBtn');
        if (saveToPresetBtn) {
            saveToPresetBtn.addEventListener('click', function() {
                debugLog('Nút Lưu vào Preset được click');
                const currentColor = colorText.value.trim();
                debugLog('Màu hiện tại:', currentColor);
                debugLog('Màu hợp lệ:', isValidHexColor(currentColor));
                saveCurrentColorToPreset(dialog);
            });
        }

        // Update save button state
         updateSavePresetButton(dialog);

         // Đóng color picker panel nếu đang mở khi khởi tạo
         if (colorPickerPanel) {
             colorPickerPanel.classList.remove('open');
         }

         debugLog('Hoàn thành setup event listeners');

         // Gọi hàm gắn sự kiện global
         attachDeleteEvents();

        // Khôi phục mặc định
         resetBtn.addEventListener('click', function() {
             const defaultColor = '#6c5ce7';
             debugLog('Reset màu về mặc định:', defaultColor);
             setDefaultColor(defaultColor);

             // Cập nhật UI
             if (colorText) colorText.value = defaultColor;
             if (previewBox) previewBox.style.backgroundColor = defaultColor;

             // Cập nhật color picker nếu có
             if (colorPreview) colorPreview.style.backgroundColor = defaultColor;
             if (colorValue) colorValue.textContent = defaultColor;

             // Đóng color picker panel nếu đang mở (cho các phần tử cũ)
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Đặt active cho preset mặc định
             colorPresets.forEach(p => p.classList.remove('active'));
             const defaultPreset = dialog.querySelector(`[data-color="${defaultColor}"]`);
             if (defaultPreset) {
                 defaultPreset.classList.add('active');
             }

             // Cập nhật trạng thái nút save
             updateSavePresetButton(dialog);

             showNotification('Đã khôi phục màu mặc định!', 3000);
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
        getColorName: getColorName,
        getAllColors: getAllColors,
        getCustomColors: getCustomColors,
        saveCustomPreset: saveCustomPreset,
        removeCustomPreset: removeCustomPreset,
        openConfigDialog: openConfigDialog
    };

})();