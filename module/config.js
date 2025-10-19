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
        loadCustomPresets(dialog);

        // Đóng color picker panel nếu đang mở
        const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
        if (colorPickerPanel) {
            colorPickerPanel.classList.remove('open');
        }
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
             return;
         }

        // Tạo dialog nhập tên
        const name = generateColorName(colorToSave);
        const customName = prompt('Nhập tên cho màu preset này:', name);

        if (customName !== null && customName.trim() !== '') {
             saveCustomPreset(colorToSave, customName.trim());
             refreshCustomPresets(dialog);

             // Đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             showNotification(`Đã lưu màu "${customName.trim()}" vào preset!`, 3000);
         } else if (customName !== null) {
             // Người dùng hủy nhập tên, đóng color picker panel nếu đang mở
             const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }
         }
    }

    function updateSavePresetButton(dialog) {
        const saveBtn = dialog.querySelector('#saveToPresetBtn');
        const currentColor = dialog.querySelector('.hmt-color-text').value.trim();

        if (saveBtn) {
            if (currentColor && isValidHexColor(currentColor)) {
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
            } else {
                saveBtn.disabled = true;
                saveBtn.style.opacity = '0.5';
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
 
                          // Đóng color picker panel nếu đang mở
                          const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
                          if (colorPickerPanel) {
                              colorPickerPanel.classList.remove('open');
                          }
                      }

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
         }
    }

    // Global function để xóa custom preset (được gọi từ onclick)
     window.deleteCustomPreset = function(presetId) {
         if (confirm('Bạn có chắc chắn muốn xóa preset này?')) {
             removeCustomPreset(presetId);

             // Refresh tất cả dialogs đang mở
             document.querySelectorAll('.hmt-config-dialog').forEach(dialog => {
                 refreshCustomPresets(dialog);

                 // Đóng color picker panel nếu đang mở
                 const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             });

             showNotification('Đã xóa preset!', 3000);
         } else {
             // Người dùng hủy xóa, đóng color picker panel nếu đang mở
             document.querySelectorAll('.hmt-config-dialog').forEach(dialog => {
                 const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             });
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
                                            <div class="hmt-color-picker-header">
                                                <span class="hmt-color-picker-label">Color Picker</span>
                                                <button class="hmt-picker-toggle" id="hmt-picker-toggle">▼</button>
                                            </div>
                                            <div class="hmt-color-picker-panel" id="hmt-color-picker-panel">
                                                <div class="hmt-color-basic-grid">
                                                    <div class="hmt-color-option" data-color="#FF0000" style="background-color: #FF0000;" title="Red"></div>
                                                    <div class="hmt-color-option" data-color="#00FF00" style="background-color: #00FF00;" title="Green"></div>
                                                    <div class="hmt-color-option" data-color="#0000FF" style="background-color: #0000FF;" title="Blue"></div>
                                                    <div class="hmt-color-option" data-color="#FFFF00" style="background-color: #FFFF00;" title="Yellow"></div>
                                                    <div class="hmt-color-option" data-color="#FF00FF" style="background-color: #FF00FF;" title="Magenta"></div>
                                                    <div class="hmt-color-option" data-color="#00FFFF" style="background-color: #00FFFF;" title="Cyan"></div>
                                                    <div class="hmt-color-option" data-color="#FFA500" style="background-color: #FFA500;" title="Orange"></div>
                                                    <div class="hmt-color-option" data-color="#800080" style="background-color: #800080;" title="Purple"></div>
                                                    <div class="hmt-color-option" data-color="#FFC0CB" style="background-color: #FFC0CB;" title="Pink"></div>
                                                    <div class="hmt-color-option" data-color="#A52A2A" style="background-color: #A52A2A;" title="Brown"></div>
                                                    <div class="hmt-color-option" data-color="#808080" style="background-color: #808080;" title="Gray"></div>
                                                    <div class="hmt-color-option" data-color="#000000" style="background-color: #000000;" title="Black"></div>
                                                    <div class="hmt-color-option" data-color="#FFFFFF" style="background-color: #FFFFFF; border: 1px solid #ccc;" title="White"></div>
                                                    <div class="hmt-color-option" data-color="#C0C0C0" style="background-color: #C0C0C0;" title="Silver"></div>
                                                    <div class="hmt-color-option" data-color="#800000" style="background-color: #800000;" title="Maroon"></div>
                                                    <div class="hmt-color-option" data-color="#808000" style="background-color: #808000;" title="Olive"></div>
                                                </div>
                                                <div class="hmt-color-shades">
                                                    <div class="hmt-shade-row">
                                                        <div class="hmt-color-option" data-color="#FFEBEE" style="background-color: #FFEBEE;" title="Light Red"></div>
                                                        <div class="hmt-color-option" data-color="#F3E5F5" style="background-color: #F3E5F5;" title="Light Purple"></div>
                                                        <div class="hmt-color-option" data-color="#E8EAF6" style="background-color: #E8EAF6;" title="Light Blue"></div>
                                                        <div class="hmt-color-option" data-color="#E0F2F1" style="background-color: #E0F2F1;" title="Light Green"></div>
                                                        <div class="hmt-color-option" data-color="#FFF3E0" style="background-color: #FFF3E0;" title="Light Orange"></div>
                                                    </div>
                                                    <div class="hmt-shade-row">
                                                        <div class="hmt-color-option" data-color="#FFCDD2" style="background-color: #FFCDD2;" title="Red Shade"></div>
                                                        <div class="hmt-color-option" data-color="#CE93D8" style="background-color: #CE93D8;" title="Purple Shade"></div>
                                                        <div class="hmt-color-option" data-color="#9FA8DA" style="background-color: #9FA8DA;" title="Blue Shade"></div>
                                                        <div class="hmt-color-option" data-color="#81C784" style="background-color: #81C784;" title="Green Shade"></div>
                                                        <div class="hmt-color-option" data-color="#FFB74D" style="background-color: #FFB74D;" title="Orange Shade"></div>
                                                    </div>
                                                    <div class="hmt-shade-row">
                                                        <div class="hmt-color-option" data-color="#EF5350" style="background-color: #EF5350;" title="Dark Red"></div>
                                                        <div class="hmt-color-option" data-color="#9C27B0" style="background-color: #9C27B0;" title="Dark Purple"></div>
                                                        <div class="hmt-color-option" data-color="#5C6BC0" style="background-color: #5C6BC0;" title="Dark Blue"></div>
                                                        <div class="hmt-color-option" data-color="#4CAF50" style="background-color: #4CAF50;" title="Dark Green"></div>
                                                        <div class="hmt-color-option" data-color="#FF9800" style="background-color: #FF9800;" title="Dark Orange"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <span class="hmt-color-picker-label">Chọn màu từ bảng</span>
                                    </div>
                                    <input type="text"
                                           id="hmt-custom-color-text"
                                           value="${getDefaultColor()}"
                                           class="hmt-color-text"
                                           placeholder="#6c5ce7">
                                </div>
                                <small class="hmt-color-help">Nhấn vào bảng màu để chọn, hoặc nhập mã HEX trực tiếp</small>
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
                width: 80px;
                border: 3px solid #667eea;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
                background: white;
                position: relative;
            }

            .hmt-custom-color-picker:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
            }

            .hmt-color-picker-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                background: #f8f9fa;
                border-radius: 8px 8px 0 0;
                border-bottom: 1px solid #e9ecef;
            }

            .hmt-color-picker-label {
                font-size: 12px;
                color: #667eea;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .hmt-picker-toggle {
                background: none;
                border: none;
                color: #667eea;
                font-size: 10px;
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 3px;
                transition: background-color 0.2s;
            }

            .hmt-picker-toggle:hover {
                background: rgba(102, 126, 234, 0.1);
            }

            .hmt-color-picker-panel {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                display: none;
            }

            .hmt-color-picker-panel.open {
                display: block;
            }

            .hmt-color-basic-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 2px;
                padding: 8px;
            }

            .hmt-color-shades {
                padding: 8px;
                border-top: 1px solid #e9ecef;
            }

            .hmt-shade-row {
                display: flex;
                gap: 2px;
                margin-bottom: 2px;
            }

            .hmt-shade-row:last-child {
                margin-bottom: 0;
            }

            .hmt-color-option {
                width: 20px;
                height: 20px;
                border-radius: 3px;
                cursor: pointer;
                transition: transform 0.2s;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }

            .hmt-color-option:hover {
                transform: scale(1.1);
                border: 2px solid #667eea;
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

        // Load custom presets
         loadCustomPresets(dialog);

         // Đóng color picker panel nếu đang mở khi khởi tạo
         const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
         if (colorPickerPanel) {
             colorPickerPanel.classList.remove('open');
         }

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
                // Đóng color picker panel nếu đang mở
                if (colorPickerPanel && colorPickerPanel.classList.contains('open')) {
                    colorPickerPanel.classList.remove('open');
                } else {
                    closeDialog();
                }
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
                 colorText.value = color;
                 previewBox.style.backgroundColor = color;

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }

                 debugLog('Đã chọn màu preset:', color);
             });
         });

        // Xử lý color picker tùy chỉnh
        const customColorPicker = dialog.querySelector('.hmt-custom-color-picker');
        const colorPickerPanel = dialog.querySelector('.hmt-color-picker-panel');
        const pickerToggle = dialog.querySelector('.hmt-picker-toggle');
        const colorOptions = dialog.querySelectorAll('.hmt-color-option');

        // Toggle color picker panel
        if (pickerToggle && colorPickerPanel) {
            pickerToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                colorPickerPanel.classList.toggle('open');
            });

            // Đóng panel khi click bên ngoài
            document.addEventListener('click', function(e) {
                if (!customColorPicker.contains(e.target)) {
                    colorPickerPanel.classList.remove('open');
                }
            });
        }

        // Xử lý chọn màu từ bảng màu
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                const color = this.dataset.color;
                colorText.value = color;
                previewBox.style.backgroundColor = color;

                // Bỏ active cho tất cả presets nếu đang chọn màu tùy chỉnh
                colorPresets.forEach(p => p.classList.remove('active'));

                // Đóng color picker panel
                if (colorPickerPanel) {
                    colorPickerPanel.classList.remove('open');
                }

                // Cập nhật trạng thái nút save
                updateSavePresetButton(dialog);

                debugLog('Đã chọn màu từ color picker:', color);
            });
        });

        // Xử lý text input
         colorText.addEventListener('input', function() {
             const color = this.value.trim();
             if (isValidHexColor(color)) {
                 previewBox.style.backgroundColor = color;
                 colorPresets.forEach(p => p.classList.remove('active'));

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             }

             // Cập nhật trạng thái nút save
             updateSavePresetButton(dialog);
         });

        // Lưu cài đặt
         saveBtn.addEventListener('click', function() {
             const selectedColor = colorText.value.trim();
             if (isValidHexColor(selectedColor)) {
                 setDefaultColor(selectedColor);

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }

                 showNotification('Đã lưu cài đặt màu sắc!', 3000);
                 closeDialog();
             } else {
                 showNotification('Màu không hợp lệ! Vui lòng nhập mã màu HEX đúng định dạng.', 5000);

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
             }
         });

        // Save to preset
         const saveToPresetBtn = dialog.querySelector('#saveToPresetBtn');
         if (saveToPresetBtn) {
             saveToPresetBtn.addEventListener('click', function() {
                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }
                 saveCurrentColorToPreset(dialog);
             });
         }

        // Update save button state
         updateSavePresetButton(dialog);

         // Đóng color picker panel nếu đang mở khi khởi tạo
         if (colorPickerPanel) {
             colorPickerPanel.classList.remove('open');
         }

         // Xử lý xóa custom presets
        const deleteBtns = dialog.querySelectorAll('.hmt-delete-preset');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const presetId = this.dataset.presetId;

                if (!presetId) {
                     showNotification('Lỗi: Không tìm thấy ID preset!', 5000);

                     // Đóng color picker panel nếu đang mở
                     if (colorPickerPanel) {
                         colorPickerPanel.classList.remove('open');
                     }
                     return;
                 }

                if (this.classList.contains('deleting')) {
                     return; // Đang xóa, bỏ qua click
                 }

                 // Đóng color picker panel nếu đang mở
                 if (colorPickerPanel) {
                     colorPickerPanel.classList.remove('open');
                 }

                const presetElement = this.closest('.hmt-color-preset');
                const presetName = presetElement ? presetElement.querySelector('.hmt-color-name').textContent : 'Unknown';

                if (confirm(`Bạn có chắc chắn muốn xóa preset "${presetName}"?`)) {
                     // Đóng color picker panel nếu đang mở
                     if (colorPickerPanel) {
                         colorPickerPanel.classList.remove('open');
                     }
                     deletePresetWithAnimation(this, presetId, dialog);
                 }
            });
        });

        // Khôi phục mặc định
         resetBtn.addEventListener('click', function() {
             const defaultColor = '#6c5ce7';
             setDefaultColor(defaultColor);

             // Cập nhật UI
             colorText.value = defaultColor;
             previewBox.style.backgroundColor = defaultColor;

             // Đóng color picker panel nếu đang mở
             if (colorPickerPanel) {
                 colorPickerPanel.classList.remove('open');
             }

             // Đặt active cho preset mặc định
             colorPresets.forEach(p => p.classList.remove('active'));
             const defaultPreset = dialog.querySelector(`[data-color="${defaultColor}"]`);
             if (defaultPreset) {
                 defaultPreset.classList.add('active');
             }

             showNotification('Đã khôi phục màu mặc định!', 3000);
         });

        // Đóng khi nhấn ESC
         document.addEventListener('keydown', function(e) {
             if (e.key === 'Escape') {
                 // Đóng color picker panel nếu đang mở
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
        openConfigDialog: openConfigDialog
    };

    debugLog('Config module đã được tải');

})();