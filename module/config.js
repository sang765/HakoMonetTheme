(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const IS_LOCAL = GM_info.script.version === 'LocalDev';
    const FOLDER_URL = IS_LOCAL ? 'http://localhost:5500/styles/' : 'https://sang765.github.io/HakoMonetTheme/styles/';
    const CSS_FILE = 'userscript/configmenu/hmt-config-menu.css';
    const CSS_MAP_FILE = 'userscript/configmenu/hmt-config-menu.css.map';

    // Cached CSS blob URL to avoid repeated fetches
    let cachedCssBlobUrl = null;

    // Coloris library URLs (local versions for userscript compatibility)
    const COLORIS_CSS_URL = IS_LOCAL ? `${GM_getValue('custom_host_url', 'http://localhost:5500')}/api/coloris.min.css` : 'https://sang765.github.io/HakoMonetTheme/api/coloris.min.css';
    const COLORIS_JS_URL = IS_LOCAL ? `${GM_getValue('custom_host_url', 'http://localhost:5500')}/api/coloris.min.js` : 'https://sang765.github.io/HakoMonetTheme/api/coloris.min.js';
    const COLORIS_COLORS_URL = IS_LOCAL ? `${GM_getValue('custom_host_url', 'http://localhost:5500')}/api/coloris-colors.json` : 'https://sang765.github.io/HakoMonetTheme/api/coloris-colors.json';

    // Cached Coloris resources
    let cachedColorisCss = null;
    let cachedColorisJs = null;
    let cachedColorisColors = null;

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('config', ...args);
        } else if (DEBUG) {
            console.log('[Config]', ...args);
        }
    }

    function getDefaultColor() {
        return GM_getValue('default_color', '#063c30');
    }

    function getInfoPageDefaultColor() {
        return GM_getValue('info_page_default_color', '#063c30');
    }

    function getLastPickedColor() {
        return GM_getValue('last_picked_color', null);
    }

    function setLastPickedColor(color) {
        GM_setValue('last_picked_color', color);
        debugLog('[Config] Đã lưu màu đã pick cuối cùng:', color);
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

    function setInfoPageDefaultColor(color) {
        GM_setValue('info_page_default_color', color);
        debugLog('Đã lưu màu mặc định trang thông tin:', color);

        // Phát sự kiện màu sắc thay đổi để các module khác cập nhật real-time
        const colorChangeEvent = new CustomEvent('hmtInfoPageDefaultColorChanged', {
            detail: {
                color: color,
                timestamp: Date.now()
            }
        });
        (window.top || window).document.dispatchEvent(colorChangeEvent);
        debugLog('Đã phát sự kiện màu mặc định trang thông tin thay đổi:', color);
    }

    function getHideDomainWarning() {
        return GM_getValue('hide_domain_warning', false);
    }

    function setHideDomainWarning(hide) {
        GM_setValue('hide_domain_warning', hide);
        debugLog('Đã lưu cài đặt ẩn cảnh báo tên miền:', hide);

        if (hide) {
            const farFuture = new Date('9999-12-31T23:59:59Z');
            const cookieOptions = `path=/; SameSite=Lax; expires=${farFuture.toUTCString()}; max-age=2147483647`;
        
            (window.top || window).document.cookie = `globalwarning=false; ${cookieOptions}`;
            (window.top || window).document.cookie = `globalwarning2=false; ${cookieOptions}`;
            debugLog('Đã thêm cookie vĩnh viễn globalwarning=false và globalwarning2=false');
        } else {
            const pastDate = new Date(0);
            const deleteOptions = `expires=${pastDate.toUTCString()}; path=/; SameSite=Lax; max-age=-1`;
            
            (window.top || window).document.cookie = `globalwarning=; ${deleteOptions}`;
            (window.top || window).document.cookie = `globalwarning2=; ${deleteOptions}`;
            debugLog('Đã xóa cookie globalwarning và globalwarning2');
        }

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

    function getInfoPageColorMode() {
        return GM_getValue('info_page_color_mode', 'thumbnail');
    }

    function setInfoPageColorMode(mode) {
        GM_setValue('info_page_color_mode', mode);
        debugLog('Đã lưu chế độ màu trang thông tin:', mode);

        // Phát sự kiện chế độ màu trang thông tin thay đổi
        const modeChangeEvent = new CustomEvent('hmtInfoPageColorModeChanged', {
            detail: { mode: mode }
        });
        (window.top || window).document.dispatchEvent(modeChangeEvent);
        debugLog('Đã phát sự kiện chế độ màu trang thông tin thay đổi:', mode);
    }

    function getExtractColorFromAvatar() {
        const value = GM_getValue('extract_color_from_avatar', false);
        debugLog('getExtractColorFromAvatar() returning:', value);
        return value;
    }

    function setExtractColorFromAvatar(extract) {
        GM_setValue('extract_color_from_avatar', extract);
        debugLog('Đã lưu cài đặt trích xuất màu từ avatar:', extract);

        // Phát sự kiện để các module khác cập nhật
        const extractChangeEvent = new CustomEvent('hmtExtractAvatarColorChanged', {
            detail: { extract: extract }
        });
        (window.top || window).document.dispatchEvent(extractChangeEvent);
        debugLog('Đã phát sự kiện trích xuất màu từ avatar thay đổi:', extract);
    }

    function getUseProxy() {
        return GM_getValue('use_proxy', true);
    }

    function setUseProxy(use) {
        GM_setValue('use_proxy', use);
        debugLog('Đã lưu cài đặt sử dụng proxy:', use);

        // Phát sự kiện để các module khác cập nhật
        const proxyChangeEvent = new CustomEvent('hmtUseProxyChanged', {
            detail: { use: use }
        });
        (window.top || window).document.dispatchEvent(proxyChangeEvent);
        debugLog('Đã phát sự kiện sử dụng proxy thay đổi:', use);
    }

    function getPreferredProxy() {
        return GM_getValue('preferred_proxy', 'images.weserv.nl');
    }

    function setPreferredProxy(proxy) {
        GM_setValue('preferred_proxy', proxy);
        debugLog('Đã lưu cài đặt proxy ưu tiên:', proxy);

        // Phát sự kiện để các module khác cập nhật
        const proxyChangeEvent = new CustomEvent('hmtPreferredProxyChanged', {
            detail: { proxy: proxy }
        });
        (window.top || window).document.dispatchEvent(proxyChangeEvent);
        debugLog('Đã phát sự kiện proxy ưu tiên thay đổi:', proxy);
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

    function ensureDomainWarningCookies() {
        const shouldHide = getHideDomainWarning();
        if (shouldHide) {
            const farFuture = new Date('9999-12-31T23:59:59Z');
            const cookieOptions = `path=/; SameSite=Lax; expires=${farFuture.toUTCString()}; max-age=2147483647`;

            (window.top || window).document.cookie = `globalwarning=false; ${cookieOptions}`;
            (window.top || window).document.cookie = `globalwarning2=false; ${cookieOptions}`;
            debugLog('Đã thêm cookie vĩnh viễn globalwarning=false và globalwarning2=false');
        }
    }

    function createScreenColorPicker(callback) {
        debugLog('[ColorPicker] Bắt đầu tạo screen color picker');

        const startTime = performance.now();

        // Kiểm tra và sử dụng EyeDropper API nếu có (Chrome, Edge, etc.)
        if ('EyeDropper' in window) {
            debugLog('[ColorPicker] EyeDropper API khả dụng, sử dụng native color picker');

            const eyeDropper = new EyeDropper();

            // Hiển thị thông báo cho người dùng
            showNotification('Mở công cụ chọn màu màn hình. Nhấp vào bất kỳ điểm nào trên màn hình để chọn màu.', 5000);

            eyeDropper.open().then(result => {
                debugLog('[ColorPicker] Đã chọn màu từ EyeDropper:', result.sRGBHex);
                if (callback) {
                    callback(result.sRGBHex);
                }
            }).catch(err => {
                debugLog('[ColorPicker] EyeDropper bị hủy hoặc lỗi:', err);
                if (err.name !== 'AbortError') {
                    showNotification('Lỗi khi chọn màu từ màn hình. Sử dụng phương pháp dự phòng.', 3000);
                    // Fallback to html2canvas
                    createFallbackColorPicker(callback);
                }
            });

            return; // Exit early if EyeDropper is used
        }

        // Fallback to html2canvas or manual picker
        createFallbackColorPicker(callback);

        function createFallbackColorPicker(callback) {
            // Tạo overlay toàn màn hình
            const overlay = document.createElement('div');
            overlay.className = 'hmt-color-picker-overlay';

            // Tạo canvas để hiển thị screenshot
            const canvas = document.createElement('canvas');
            canvas.className = 'hmt-color-picker-canvas';

            // Tạo zoom lens lớn hơn
            const zoomLens = document.createElement('div');
            zoomLens.className = 'hmt-color-picker-zoom';

            // Tạo info panel với thông tin chi tiết hơn
            const infoPanel = document.createElement('div');
            infoPanel.className = 'hmt-color-picker-info';
            infoPanel.textContent = 'Đang chuẩn bị...';

            // Tạo instructions
            const instructions = document.createElement('div');
            instructions.className = 'hmt-color-picker-instructions';
            instructions.textContent = 'Kéo lens để di chuyển • ESC để hủy';

            // Tạo controls cho mobile
            const controls = document.createElement('div');
            controls.className = 'hmt-color-picker-controls';

            const selectBtn = document.createElement('button');
            selectBtn.className = 'hmt-color-picker-btn select';
            selectBtn.textContent = 'Chọn màu';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'hmt-color-picker-btn cancel';
            cancelBtn.textContent = 'Hủy';

            controls.appendChild(cancelBtn);
            controls.appendChild(selectBtn);

            overlay.appendChild(canvas);
            overlay.appendChild(zoomLens);
            overlay.appendChild(infoPanel);
            overlay.appendChild(instructions);
            overlay.appendChild(controls);

            debugLog('[ColorPicker] Đã tạo UI elements cho fallback, thời gian:', performance.now() - startTime, 'ms');

            // Lấy screenshot của trang
            // Sử dụng html2canvas nếu có, nếu không thì tạo canvas trắng
            if (typeof html2canvas !== 'undefined') {
            if (typeof window.Logger !== 'undefined') {
                window.Logger.info('colorPicker', 'html2canvas khả dụng, bắt đầu capture screenshot');
            } else {
                debugLog('[ColorPicker] html2canvas khả dụng, bắt đầu capture screenshot');
            }
            infoPanel.textContent = 'Đang chụp màn hình...';

            const captureStartTime = performance.now();

            html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                scale: 0.8, // Giảm scale để tối ưu hiệu suất
                width: window.innerWidth,
                height: window.innerHeight,
                x: 0,
                y: 0,
                backgroundColor: null, // Không có background để tránh artifacts
                logging: false // Tắt logging của html2canvas
            }).then(function(screenshot) {
                const captureTime = performance.now() - captureStartTime;
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.performance('colorPicker', 'Capture screenshot', captureStartTime, performance.now());
                } else {
                    debugLog('[ColorPicker] Capture screenshot thành công, thời gian:', captureTime.toFixed(2), 'ms');
                }

                const ctx = canvas.getContext('2d');
                canvas.width = screenshot.width;
                canvas.height = screenshot.height;

                const drawStartTime = performance.now();
                ctx.drawImage(screenshot, 0, 0);
                const drawTime = performance.now() - drawStartTime;

                if (typeof window.Logger !== 'undefined') {
                    window.Logger.debug('colorPicker', `Canvas size: ${canvas.width}x${canvas.height}`);
                } else {
                    debugLog('[ColorPicker] Vẽ canvas hoàn thành, thời gian:', drawTime.toFixed(2), 'ms');
                    debugLog('[ColorPicker] Canvas size:', canvas.width, 'x', canvas.height);
                }

                infoPanel.textContent = 'Sẵn sàng! Di chuột để xem màu';

            let isPicking = false;
            let isDragging = false;
            let currentX = canvas.width / 2;
            let currentY = canvas.height / 2;
            let selectedColor = { r: 255, g: 255, b: 255, hex: '#ffffff' };

            // Phát hiện thiết bị touch
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            // Cache màu để tối ưu hiệu suất
            const colorCache = {};

            // Hàm lấy màu từ vị trí với tối ưu hóa hiệu suất
            function getColorAtPosition(x, y) {
                if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
                    debugLog('[ColorPicker] Vị trí ngoài canvas:', x, y);
                    return null;
                }

                // Tối ưu hóa: sử dụng ImageData cache cho các vị trí gần nhau
                const cacheKey = `${Math.floor(x/10)}_${Math.floor(y/10)}`;
                if (!colorCache[cacheKey]) {
                    const pixelStartTime = performance.now();
                    const pixel = ctx.getImageData(x, y, 1, 1).data;
                    const pixelTime = performance.now() - pixelStartTime;

                    const r = pixel[0];
                    const g = pixel[1];
                    const b = pixel[2];
                    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

                    colorCache[cacheKey] = { r, g, b, hex };

                    if (DEBUG) {
                        debugLog('[ColorPicker] Pixel time:', pixelTime.toFixed(3), 'ms at', x, y, '->', hex);
                    }
                }

                return colorCache[cacheKey];
            }

            // Hàm cập nhật zoom lens với hiệu ứng mượt mà
            function updateZoomLens(x, y) {
                const color = getColorAtPosition(x, y);
                if (!color) {
                    zoomLens.style.display = 'none';
                    return;
                }

                selectedColor = color;

                // Cập nhật info panel với hiệu ứng
                infoPanel.classList.add('updating');
                infoPanel.textContent = `RGB(${color.r}, ${color.g}, ${color.b}) ${color.hex}`;
                setTimeout(() => infoPanel.classList.remove('updating'), 150);

                // Cập nhật vị trí zoom lens với transition mượt mà
                zoomLens.style.display = 'block';
                zoomLens.style.left = (x - 80) + 'px'; // Điều chỉnh cho lens lớn hơn
                zoomLens.style.top = (y - 80) + 'px';

                // Vẽ zoom area với hiệu ứng mượt mà
                const zoomSize = 60; // Zoom lớn hơn
                let zoomCanvas = zoomLens.querySelector('canvas');
                if (!zoomCanvas) {
                    zoomLens.innerHTML = '';
                    zoomCanvas = document.createElement('canvas');
                    zoomCanvas.width = 160;
                    zoomCanvas.height = 160;
                    zoomLens.appendChild(zoomCanvas);
                }
                const zoomCtx = zoomCanvas.getContext('2d');

                // Thêm hiệu ứng fade và scale
                zoomLens.style.opacity = '0.7';
                zoomLens.style.transform = 'scale(0.9)';

                requestAnimationFrame(() => {
                    zoomCtx.clearRect(0, 0, 160, 160);
                    zoomCtx.drawImage(
                        canvas,
                        x - zoomSize/2, y - zoomSize/2, zoomSize, zoomSize,
                        0, 0, 160, 160
                    );

                    zoomLens.style.opacity = '1';
                    zoomLens.style.transform = 'scale(1)';
                });
            }

            // Khởi tạo vị trí lens ở giữa màn hình
            updateZoomLens(currentX, currentY);

            // Xử lý di chuyển chuột (desktop)
            if (!isTouchDevice) {
                overlay.addEventListener('mousemove', function(e) {
                    if (isPicking || isDragging) return;

                    const rect = canvas.getBoundingClientRect();
                    currentX = e.clientX - rect.left;
                    currentY = e.clientY - rect.top;

                    debugLog('[ColorPicker] Mouse move to:', currentX, currentY);
                    updateZoomLens(currentX, currentY);
                });

                // Xử lý click để chọn màu (desktop)
                    overlay.addEventListener('click', function(e) {
                        if (isPicking) return;
                        e.preventDefault();
                        e.stopPropagation();
    
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
    
                        debugLog('[ColorPicker] Click event at:', x, y);
    
                        const color = getColorAtPosition(x, y);
                        if (color) {
                            debugLog('[ColorPicker] Đã chọn màu từ click:', color.hex);
                            if (callback) {
                                callback(color.hex);
                            }
                            overlay.remove();
                        } else {
                            debugLog('[ColorPicker] Click ngoài canvas, bỏ qua');
                        }
                    });
            } else {
                // Mobile: Touch events
                overlay.addEventListener('touchmove', function(e) {
                    if (isPicking || isDragging) return;
                    e.preventDefault();

                    const rect = canvas.getBoundingClientRect();
                    const touch = e.touches[0];
                    currentX = touch.clientX - rect.left;
                    currentY = touch.clientY - rect.top;

                    updateZoomLens(currentX, currentY);
                }, { passive: false });

                // Mobile: Tap để teleport lens
                overlay.addEventListener('touchstart', function(e) {
                    if (isPicking || isDragging) return;
                    e.preventDefault();

                    const rect = canvas.getBoundingClientRect();
                    const touch = e.touches[0];
                    currentX = touch.clientX - rect.left;
                    currentY = touch.clientY - rect.top;

                    updateZoomLens(currentX, currentY);
                }, { passive: false });
            }

            // Xử lý drag lens
            zoomLens.addEventListener('mousedown', function(e) {
                if (isTouchDevice) return;
                e.preventDefault();
                isDragging = true;
                zoomLens.classList.add('dragging');
                document.body.style.cursor = 'grabbing';
                debugLog('[ColorPicker] Bắt đầu drag lens');
            });

            zoomLens.addEventListener('touchstart', function(e) {
                if (!isTouchDevice) return;
                e.preventDefault();
                isDragging = true;
                zoomLens.classList.add('dragging');
            }, { passive: false });

            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;

                const rect = canvas.getBoundingClientRect();
                currentX = e.clientX - rect.left;
                currentY = e.clientY - rect.top;

                // Giới hạn trong canvas
                currentX = Math.max(0, Math.min(canvas.width, currentX));
                currentY = Math.max(0, Math.min(canvas.height, currentY));

                updateZoomLens(currentX, currentY);
            });

            document.addEventListener('touchmove', function(e) {
                if (!isDragging) return;
                e.preventDefault();

                const rect = canvas.getBoundingClientRect();
                const touch = e.touches[0];
                currentX = touch.clientX - rect.left;
                currentY = touch.clientY - rect.top;

                // Giới hạn trong canvas
                currentX = Math.max(0, Math.min(canvas.width, currentX));
                currentY = Math.max(0, Math.min(canvas.height, currentY));

                updateZoomLens(currentX, currentY);
            }, { passive: false });

            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    zoomLens.classList.remove('dragging');
                    document.body.style.cursor = '';
                    debugLog('[ColorPicker] Kết thúc drag lens');
                }
            });

            document.addEventListener('touchend', function() {
                if (isDragging) {
                    isDragging = false;
                    zoomLens.classList.remove('dragging');
                }
            });

            // Xử lý nút Select
            selectBtn.addEventListener('click', function() {
                if (isPicking) return;
                isPicking = true;

                debugLog('[ColorPicker] Đã chọn màu từ nút Select:', selectedColor.hex);
                debugLog('[ColorPicker] RGB:', selectedColor.r, selectedColor.g, selectedColor.b);

                if (callback) {
                    callback(selectedColor.hex);
                }
                overlay.remove();
            });

            // Xử lý nút Cancel
            cancelBtn.addEventListener('click', function() {
                debugLog('[ColorPicker] Người dùng hủy color picker');
                overlay.remove();
            });

        }).catch(function(error) {
            if (typeof window.Logger !== 'undefined') {
                window.Logger.error('colorPicker', 'Lỗi khi capture screenshot:', error);
            } else {
                debugLog('[ColorPicker] Lỗi khi capture screenshot:', error);
                debugLog('[ColorPicker] Chi tiết lỗi:', error.message, error.stack);
            }

            infoPanel.textContent = 'Lỗi: Không thể capture màn hình - thử fallback';

            // Thử fallback với canvas trắng
            setTimeout(() => {
                createFallbackCanvas(canvas, infoPanel, overlay);
            }, 1000);
        });
    } else {
        debugLog('[ColorPicker] html2canvas không khả dụng, sử dụng fallback canvas');
        createFallbackCanvas(canvas, infoPanel, overlay);
    }

    function createFallbackCanvas(canvas, infoPanel, overlay) {
        debugLog('[ColorPicker] Tạo fallback canvas trắng');

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Tô nền gradient để có màu đa dạng
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff0000');   // Đỏ
        gradient.addColorStop(0.16, '#ffff00'); // Vàng
        gradient.addColorStop(0.33, '#00ff00'); // Xanh lá
        gradient.addColorStop(0.5, '#00ffff');  // Xanh dương nhạt
        gradient.addColorStop(0.66, '#0000ff'); // Xanh dương
        gradient.addColorStop(0.83, '#ff00ff'); // Tím
        gradient.addColorStop(1, '#ff0000');   // Đỏ

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Vẽ text thông báo
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText('FALLBACK MODE', canvas.width / 2, canvas.height / 2 - 80);
        ctx.fillText('FALLBACK MODE', canvas.width / 2, canvas.height / 2 - 80);

        ctx.font = '16px Arial';
        ctx.strokeText('html2canvas không khả dụng', canvas.width / 2, canvas.height / 2 - 40);
        ctx.fillText('html2canvas không khả dụng', canvas.width / 2, canvas.height / 2 - 40);

        ctx.strokeText('Sử dụng gradient màu để chọn', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Sử dụng gradient màu để chọn', canvas.width / 2, canvas.height / 2);

        infoPanel.textContent = 'Fallback mode: Chọn màu từ gradient';
        debugLog('[ColorPicker] Fallback canvas đã được tạo');
    }

        // Ngăn navigation khi đang pick màu
        function preventNavigation(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Thêm event listeners để ngăn navigation
        document.addEventListener('click', preventNavigation, true);
        document.addEventListener('mousedown', preventNavigation, true);
        document.addEventListener('mouseup', preventNavigation, true);
        document.addEventListener('contextmenu', preventNavigation, true);

        // Xử lý ESC để hủy
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                debugLog('[ColorPicker] Người dùng nhấn ESC để hủy');
                overlay.remove();
                document.removeEventListener('keydown', handleKeydown);
                document.removeEventListener('click', preventNavigation, true);
                document.removeEventListener('mousedown', preventNavigation, true);
                document.removeEventListener('mouseup', preventNavigation, true);
                document.removeEventListener('contextmenu', preventNavigation, true);
            }
        }
        document.addEventListener('keydown', handleKeydown);

        // Thêm overlay vào document
        (window.top || window).document.body.appendChild(overlay);

        const totalTime = performance.now() - startTime;
        debugLog('[ColorPicker] Color picker đã được tạo hoàn thành, tổng thời gian:', totalTime.toFixed(2), 'ms');
        }
    }

    function isInfoPage() {
        // Kiểm tra nếu đang ở trang thông tin truyện dựa trên element đặc trưng từ colors/page-info-truyen.js
        return document.querySelector('div.col-4.col-md.feature-item.width-auto-xl') !== null;
    }

    function getRandomHexColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    /**
     * Loads and applies CSS styles with caching for performance
     */
    function loadAndApplyStyles() {
        if (cachedCssBlobUrl) {
            // Use cached styles
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cachedCssBlobUrl;
            document.head.appendChild(link);
            debugLog('Using cached CSS styles');
            return;
        }

        // Fetch CSS and source map simultaneously
        Promise.all([
            fetch(FOLDER_URL + CSS_FILE).then(r => r.text()),
            fetch(FOLDER_URL + CSS_MAP_FILE).then(r => r.text())
        ])
        .then(([css, mapContent]) => {
            // Convert source map to data URL
            const mapDataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(mapContent)));

            // Add source mapping as data URL
            css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

            // Create Blob URL for efficient resource management
            const blob = new Blob([css], { type: 'text/css' });
            cachedCssBlobUrl = URL.createObjectURL(blob);

            // Create link element and apply CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cachedCssBlobUrl;
            document.head.appendChild(link);

            debugLog('CSS styles loaded and cached successfully');
        })
        .catch(error => {
            debugLog('Error loading CSS or source map:', error);
            showNotification('Lỗi', 'Không thể tải giao diện cài đặt. Một số style có thể không hoạt động.', 3000);
        });
    }

    /**
     * Loads Coloris library resources locally for userscript compatibility
     */
    function loadColorisLibrary() {
        return new Promise((resolve, reject) => {
            // Check if Coloris is already loaded
            if (typeof Coloris !== 'undefined') {
                debugLog('Coloris already loaded');
                resolve();
                return;
            }

            // Load Coloris resources simultaneously
            Promise.all([
                fetch(COLORIS_CSS_URL).then(r => r.text()).catch(() => {
                    debugLog('Failed to load Coloris CSS, using fallback');
                    return cachedColorisCss || '';
                }),
                fetch(COLORIS_JS_URL).then(r => r.text()).catch(() => {
                    debugLog('Failed to load Coloris JS, using fallback');
                    return cachedColorisJs || '';
                }),
                fetch(COLORIS_COLORS_URL).then(r => r.json()).catch(() => {
                    debugLog('Failed to load Coloris colors, using fallback');
                    return cachedColorisColors || {};
                })
            ])
            .then(([css, js, colors]) => {
                // Cache the resources
                cachedColorisCss = css;
                cachedColorisJs = js;
                cachedColorisColors = colors;

                // Load CSS
                if (css) {
                    const style = document.createElement('style');
                    style.textContent = css;
                    style.id = 'coloris-styles';
                    document.head.appendChild(style);
                    debugLog('Coloris CSS loaded');
                }

                // Load JS
                if (js) {
                    try {
                        // Execute Coloris JS in global scope
                        (0, eval)(js);
                        debugLog('Coloris JS loaded');

                        // Configure Coloris with default settings
                        if (typeof Coloris !== 'undefined') {
                            Coloris({
                                theme: 'default',
                                themeMode: 'auto',
                                format: 'hex',
                                alpha: false,
                                swatches: colors.map(color => color.value).slice(0, 12) || [
                                    '#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51',
                                    '#d62828', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4'
                                ]
                            });
                            debugLog('Coloris configured');
                        }

                        resolve();
                    } catch (error) {
                        debugLog('Error executing Coloris JS:', error);
                        reject(error);
                    }
                } else {
                    reject(new Error('Coloris JS not available'));
                }
            })
            .catch(error => {
                debugLog('Error loading Coloris library:', error);
                reject(error);
            });
        });
    }

    function createConfigDialog() {
        // Kiểm tra xem dialog đã tồn tại chưa (kiểm tra ở top window để tránh duplicate trong iframe)
        if ((window.top || window).document.querySelector('.hmt-config-dialog')) {
            return;
        }

        // Load and apply CSS styles
        loadAndApplyStyles();

        // Load Coloris library for color picker functionality
        loadColorisLibrary().catch(error => {
            debugLog('Failed to load Coloris library:', error);
            showNotification('Cảnh báo', 'Không thể tải thư viện chọn màu. Một số tính năng có thể không hoạt động.', 5000);
        });

        const dialog = document.createElement('div');
        dialog.className = 'hmt-config-dialog';

        // Lấy màu hiện tại từ storage
        const currentColor = isInfoPage() ? getInfoPageDefaultColor() : getDefaultColor();

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

        const showDefaultColorSection = (isInfoPage() && getInfoPageColorMode() === 'default') || (!isInfoPage() && !getExtractColorFromAvatar());
        debugLog('Initial showDefaultColorSection:', showDefaultColorSection, 'isInfoPage:', isInfoPage(), 'infoPageMode:', getInfoPageColorMode(), 'avatarExtract:', getExtractColorFromAvatar());

        dialog.innerHTML = `
            <div class="hmt-config-overlay">
                <div class="hmt-config-content">
                    <div class="hmt-config-header">
                        <div class="hmt-header-content">
                            <button class="hmt-config-back">← Quay lại</button>
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
                        <div class="hmt-config-section" ${showDefaultColorSection ? '' : 'style="display: none;"'} id="hmt-default-color-section">
                            <h4>Màu mặc định</h4>
                            <p>Chọn màu sẽ được sử dụng khi không thể lấy màu từ ảnh bìa truyện. Sử dụng thanh trượt HSL để điều chỉnh màu sắc theo ý muốn.</p>

                            <div class="hmt-custom-color">
                                <label for="hmt-custom-color-input">Chọn màu tùy chỉnh:</label>
                                <div class="hmt-color-input-group">
                                    <div class="hmt-color-picker-wrapper">
                                        <div class="hmt-custom-color-picker" id="hmt-custom-color-input">
                                            <div class="hmt-color-picker-display">
                                                <div class="hmt-color-preview" id="hmt-color-preview" data-coloris></div>
                                                <span class="hmt-color-value" id="hmt-color-value">${currentColor}</span>
                                                <button class="hmt-screen-color-picker-btn" title="Chọn màu từ màn hình">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                                    </svg>
                                                </button>
                                            </div>
                                            <div class="hmt-hsl-controls">
                                                <div class="hmt-hsl-slider-group">
                                                    <label class="hmt-slider-label">Hue (Màu sắc)</label>
                                                    <div class="hmt-slider-with-buttons">
                                                        <button class="hmt-slider-btn hmt-minus-btn" data-target="hmt-hue-slider" data-action="decrease">-</button>
                                                        <input type="range" class="hmt-color-slider hmt-hue-slider" id="hmt-hue-slider" min="0" max="360" value="${currentHsl.h}">
                                                        <button class="hmt-slider-btn hmt-plus-btn" data-target="hmt-hue-slider" data-action="increase">+</button>
                                                    </div>
                                                </div>
                                                <div class="hmt-hsl-slider-group">
                                                    <label class="hmt-slider-label">Saturation (Độ bão hòa)</label>
                                                    <div class="hmt-slider-with-buttons">
                                                        <button class="hmt-slider-btn hmt-minus-btn" data-target="hmt-sat-slider" data-action="decrease">-</button>
                                                        <input type="range" class="hmt-color-slider hmt-sat-slider" id="hmt-sat-slider" min="0" max="100" value="${currentHsl.s}">
                                                        <button class="hmt-slider-btn hmt-plus-btn" data-target="hmt-sat-slider" data-action="decrease">+</button>
                                                    </div>
                                                </div>
                                                <div class="hmt-hsl-slider-group">
                                                    <label class="hmt-slider-label">Lightness (Độ sáng)</label>
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
                                                    placeholder="#206452">
                                        </div>
                                        <span class="hmt-color-picker-label">Thanh trượt HSL</span>
                                    </div>
                                </div>
                                <small class="hmt-color-help">Kéo thanh trượt HSL để chọn màu, sử dụng nút +/- để điều chỉnh chi tiết, hoặc nhập mã HEX trực tiếp</small>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Ẩn cảnh báo tên miền</h4>
                            <p>Ẩn các cảnh báo về tên miền và những thứ khác trên trang web.</p>

                            <div class="hmt-domain-warning-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${getHideDomainWarning() ? 'checked' : ''} class="hmt-domain-warning-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Ẩn cảnh báo tên miền
                                </label>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Tắt áp dụng chủ đề trên trang đọc truyện</h4>
                            <p>Tắt việc áp dụng màu sắc từ theme vào trang đọc truyện. Khi bật, các trang đọc truyện sẽ không bị ảnh hưởng bởi màu theme.</p>

                            <div class="hmt-reading-page-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${getDisableColorsOnReadingPage() ? 'checked' : ''} class="hmt-reading-page-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Tắt áp dụng chủ đề trên trang đọc truyện
                                </label>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Lấy avatar làm màu chủ đạo</h4>
                            <p>Lấy màu chủ đạo từ ảnh avatar của bạn để làm màu theme. Hỗ trợ JPG, PNG và GIF. Khi bật, cài đặt chọn màu tùy chỉnh sẽ bị ẩn sau khi lưu.</p>
                            <span style="color: #ffee00ff;">(chỉ áp dụng với giao diện chung, Không ảnh hưởng tới trang thông tin và trang đọc truyện)</span>
                            <small class="hmt-color-help" style="color: #fd7e14;">LƯU Ý: Với ảnh GIF chỉ trích xuất với frame đầu tiên để tập trung vào tối ưu hóa.</small>

                            <div class="hmt-avatar-color-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${getExtractColorFromAvatar() ? 'checked' : ''} class="hmt-avatar-color-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Trích xuất màu từ avatar
                                </label>
                            </div>
                        </div>

                        <div class="hmt-config-section">
                            <h4>Sử dụng proxy</h4>
                            <p>Sử dụng proxy để tránh bị lỗi CORS khiến không thể hiển thị thumbnail và load màu chủ đề.</p>

                            <div class="hmt-proxy-toggle">
                                <label class="hmt-toggle-label">
                                    <input type="checkbox" ${getUseProxy() ? 'checked' : ''} class="hmt-proxy-toggle-input">
                                    <span class="hmt-toggle-switch"></span>
                                    Sử dụng proxy
                                </label>
                            </div>

                            <div class="hmt-proxy-dropdown">
                                <label for="hmt-proxy-select">Proxy sử dụng:</label>
                                <select id="hmt-proxy-select" class="hmt-proxy-select">
                                    <option value="images.weserv.nl" ${getPreferredProxy() === 'images.weserv.nl' ? 'selected' : ''}>images.weserv.nl</option>
                                    <option value="allOrigins.nl" ${getPreferredProxy() === 'allOrigins.nl' ? 'selected' : ''}>allOrigins.nl</option>
                                    <option value="cors-anywhere.herokuapp.com" ${getPreferredProxy() === 'cors-anywhere.herokuapp.com' ? 'selected' : ''}>cors-anywhere.herokuapp.com</option>
                                    <option value="corsproxy.io" ${getPreferredProxy() === 'corsproxy.io' ? 'selected' : ''}>corsproxy.io (giới hạn request)</option>
                                </select>
                            </div>
                        </div>

<div class="hmt-config-section">
    <h4>Cài đặt màu</h4>
    <div class="hmt-color-settings-row">
        <div class="hmt-color-setting">
            <label for="hmt-color-mode-select">Trang đọc:</label>
            <select id="hmt-color-mode-select" class="hmt-color-mode-select">
                <option value="default" ${getColorMode() === 'default' ? 'selected' : ''}>Mặc định</option>
                <option value="thumbnail" ${getColorMode() === 'thumbnail' ? 'selected' : ''}>Thumbnail</option>
            </select>
        </div>
        <div class="hmt-color-setting">
            <label for="hmt-info-page-color-mode-select">Trang thông tin truyện:</label>
            <select id="hmt-info-page-color-mode-select" class="hmt-info-page-color-mode-select">
                <option value="default" ${getInfoPageColorMode() === 'default' ? 'selected' : ''}>Mặc định (Màu từ config)</option>
                <option value="avatar" ${getInfoPageColorMode() === 'avatar' ? 'selected' : ''}>Avatar</option>
                <option value="thumbnail" ${getInfoPageColorMode() === 'thumbnail' ? 'selected' : ''}>Thumbnail</option>
            </select>
        </div>
    </div>
</div>

${!isInfoPage() ? `
                         <div class="hmt-config-preview">
                             <h4>Xem trước</h4>
                             <div class="hmt-preview-box" style="background-color: ${currentColor}">
                                 <span>Màu chủ đạo</span>
                             </div>
                         </div>
` : ''}
                    </div>
                    <div class="hmt-config-footer">
                        <button class="hmt-config-reset">Khôi phục mặc định</button>
                        <button class="hmt-config-save">Lưu cài đặt</button>
                    </div>
                </div>
            </div>
        `;

        // CSS đã được load từ external file, không cần GM_addStyle nữa

        // Find the first html element within the first 5 lines of the document
        const htmlContent = document.documentElement.outerHTML;
        const lines = htmlContent.split('\n').slice(0, 5).join('\n');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = lines;
        const firstHtml = tempDiv.querySelector('html');

        let targetElement = document.documentElement; // Default to root html

        if (firstHtml) {
            // Use the html element found in first 5 lines
            targetElement = firstHtml;
        }

        // Remove any existing dialogs from the target element to prevent accumulation
        const existingDialog = targetElement.querySelector('.hmt-config-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }

        // Remove any existing styles to prevent accumulation
        const existingLinks = document.head.querySelectorAll(`link[href*="${CSS_FILE}"]`);
        existingLinks.forEach(link => link.remove());

        // Append dialog to the target html element (right after opening tag)
        targetElement.insertBefore(dialog, targetElement.firstChild);

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
        const backBtn = dialog.querySelector('.hmt-config-back');
        const overlay = dialog.querySelector('.hmt-config-overlay');
        const colorText = dialog.querySelector('.hmt-color-text');
        const previewBox = dialog.querySelector('.hmt-preview-box');
        const saveBtn = dialog.querySelector('.hmt-config-save');
        const resetBtn = dialog.querySelector('.hmt-config-reset');
        const domainWarningToggle = dialog.querySelector('.hmt-domain-warning-toggle-input');
        const readingPageToggle = dialog.querySelector('.hmt-reading-page-toggle-input');
        const avatarColorToggle = dialog.querySelector('.hmt-avatar-color-toggle-input');
        const proxyToggle = dialog.querySelector('.hmt-proxy-toggle-input');
        const proxySelect = dialog.querySelector('#hmt-proxy-select');

        // Lưu màu hiện tại để có thể khôi phục nếu không lưu
          const currentColor = dialog._currentColor || (isInfoPage() ? getInfoPageDefaultColor() : getDefaultColor());
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
        backBtn.addEventListener('click', function() {
            closeDialog();
            // Open main menu after closing config dialog
            if (typeof window.HMTMainMenu !== 'undefined' && typeof window.HMTMainMenu.openMainMenu === 'function') {
                window.HMTMainMenu.openMainMenu();
            }
        });
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
        const screenColorPickerBtn = dialog.querySelector('.hmt-screen-color-picker-btn');

        // Initialize Coloris on the color preview element
        if (colorPreview && typeof Coloris !== 'undefined') {
            debugLog('Initializing Coloris on color preview element');

            // Set initial value
            colorPreview.value = currentColor;

            // Listen for Coloris color changes
            document.addEventListener('coloris:pick', function(event) {
                const selectedColor = event.detail.color;
                debugLog('Coloris color selected:', selectedColor);

                if (isValidHexColor(selectedColor)) {
                    // Update preview color
                    previewColor = selectedColor;

                    // Update all UI elements
                    syncUIWithColor(selectedColor);

                    // Convert hex to HSL and update sliders
                    const hsl = hexToHsl(selectedColor);
                    currentHue = hsl.h;
                    currentSat = hsl.s;
                    currentLight = hsl.l;

                    // Update slider values
                    if (hueSlider) hueSlider.value = currentHue;
                    if (satSlider) satSlider.value = currentSat;
                    if (lightSlider) lightSlider.value = currentLight;

                    // Update saturation slider background
                    updateSaturationSliderBackground();

                    // Apply preview color
                    applyPreviewColor(selectedColor);
                }
            });
        }

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

        // Hàm cập nhật background của saturation slider dựa trên hue hiện tại
        function updateSaturationSliderBackground() {
            const hueColor = hslToHex(currentHue, 100, 50); // Màu với saturation 100%, lightness 50%
            const grayColor = hslToHex(currentHue, 0, 50); // Màu xám với cùng lightness
            const satSlider = dialog.querySelector('#hmt-sat-slider');
            if (satSlider) {
                satSlider.style.background = `linear-gradient(to right, ${grayColor} 0%, ${hueColor} 100%)`;
            }
        }

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
                updateSaturationSliderBackground();
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

        // Xử lý screen color picker button
        if (screenColorPickerBtn) {
            screenColorPickerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                debugLog('[ColorPicker] Người dùng click nút screen color picker');

                // Tạm ẩn config dialog
                dialog.style.display = 'none';

                // Mở screen color picker
                createScreenColorPicker(function(selectedColor) {
                    debugLog('[ColorPicker] Màu đã được chọn từ screen picker:', selectedColor);

                    // Lưu màu đã pick vào config
                    setLastPickedColor(selectedColor);

                    // Cập nhật preview color
                    previewColor = selectedColor;

                    // Cập nhật tất cả các elements UI
                    syncUIWithColor(selectedColor);

                    // Áp dụng màu preview ngay lập tức
                    applyPreviewColor(selectedColor);

                    // Chuyển đổi hex sang HSL và cập nhật sliders
                    const hsl = hexToHsl(selectedColor);
                    currentHue = hsl.h;
                    currentSat = hsl.s;
                    currentLight = hsl.l;

                    debugLog('[ColorPicker] HSL values:', hsl);

                    // Cập nhật giá trị sliders
                    if (hueSlider) hueSlider.value = currentHue;
                    if (satSlider) satSlider.value = currentSat;
                    if (lightSlider) lightSlider.value = currentLight;

                    // Cập nhật background của saturation slider
                    updateSaturationSliderBackground();

                    // Hiện lại config dialog
                    dialog.style.display = '';

                    showNotification('Đã chọn màu từ màn hình!', 2000);
                });
            });
        }

        // Khởi tạo màu ban đầu - đồng bộ với màu hiện tại
          debugLog('Khởi tạo color picker tùy chỉnh');
          debugLog('Color preview element:', !!colorPreview);
          debugLog('Color value element:', !!colorValue);
          debugLog('Hue slider element:', !!hueSlider);
          debugLog('Sat slider element:', !!satSlider);
          debugLog('Light slider element:', !!lightSlider);
          debugLog('Slider buttons count:', sliderButtons.length);
          debugLog('Screen color picker button:', !!screenColorPickerBtn);

          // Đồng bộ các elements với màu hiện tại (không gửi sự kiện preview)
          syncUIWithColor(currentColor);

          // Cập nhật background của saturation slider
          updateSaturationSliderBackground();

        // Xử lý text input
        if (colorText) {
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

                    // Cập nhật background của saturation slider
                    updateSaturationSliderBackground();

                    // Cập nhật tất cả các elements UI
                    syncUIWithColor(color);

                    // Áp dụng màu preview ngay lập tức
                    previewColor = color;
                    applyPreviewColor(color);
                } else {
                    debugLog('Màu không hợp lệ từ text input');
                }
            });
        }

        // Lưu cài đặt
          saveBtn.addEventListener('click', function() {
              const selectedColor = previewColor; // Lưu màu đang preview
              debugLog('[Config] Lưu cài đặt màu:', selectedColor);
              if (isValidHexColor(selectedColor)) {
                  // Lưu chế độ màu hiện tại
                  const infoPageColorModeSelect = dialog.querySelector('#hmt-info-page-color-mode-select');
                  if (infoPageColorModeSelect) {
                      setInfoPageColorMode(infoPageColorModeSelect.value);
                      debugLog('[Config] Lưu chế độ màu trang info:', infoPageColorModeSelect.value);
                  }

                  // Thực sự lưu màu vào storage và phát sự kiện chính thức
                  if (isInfoPage()) {
                      setInfoPageDefaultColor(selectedColor);
                  } else {
                      setDefaultColor(selectedColor);
                  }

                  // Cập nhật tất cả các elements UI với màu đã lưu
                  syncUIWithColor(selectedColor);

                  showNotification('Đã lưu cài đặt màu sắc!', 3000);

                  // Tự động reload trang sau khi lưu cài đặt
                  setTimeout(() => {
                      location.reload();
                  }, 1000); // Đợi 1 giây để notification hiển thị trước khi reload

                  closeDialog();
              } else {
                  debugLog('[Config] Màu không hợp lệ khi lưu:', selectedColor);
                  showNotification('Màu không hợp lệ! Vui lòng nhập mã màu HEX đúng định dạng.', 5000);

                  // Không cần gắn lại sự kiện vì đã loại bỏ preset
              }
          });

         debugLog('Hoàn thành setup event listeners');

        // Khôi phục mặc định
         resetBtn.addEventListener('click', function() {
             if (!confirm('Bạn có chắc chắn muốn khôi phục cài đặt về mặc định?')) {
                 return;
             }

             debugLog('Reset tất cả cài đặt về mặc định');

             // Reset tất cả cài đặt về giá trị mặc định
             const defaultColor = '#063c30'; // Sử dụng giá trị mặc định thực tế
             const resetColor = isInfoPage() ? getInfoPageDefaultColor() : getDefaultColor();
             const defaultSettings = {
                 default_color: defaultColor,
                 hide_domain_warning: false,
                 disable_colors_on_reading_page: false,
                 color_mode: 'default',
                 extract_color_from_avatar: false,
                 info_page_color_mode: 'thumbnail'
             };

             // Cập nhật preview color
             previewColor = defaultColor;

             // Chuyển đổi hex sang HSL và cập nhật sliders
             const hsl = hexToHsl(defaultColor);
             currentHue = hsl.h;
             currentSat = hsl.s;
             currentLight = hsl.l;

             debugLog('HSL values for reset:', hsl);

             // Cập nhật giá trị sliders
             if (hueSlider) hueSlider.value = currentHue;
             if (satSlider) satSlider.value = currentSat;
             if (lightSlider) lightSlider.value = currentLight;

             // Cập nhật background của saturation slider
             updateSaturationSliderBackground();

             // Cập nhật tất cả các elements UI
             syncUIWithColor(defaultColor);

             // Áp dụng màu preview ngay lập tức
             applyPreviewColor(defaultColor);

             // Reset các toggle switches về mặc định
             if (domainWarningToggle) {
                 domainWarningToggle.checked = defaultSettings.hide_domain_warning;
             }
             if (readingPageToggle) {
                 readingPageToggle.checked = defaultSettings.disable_colors_on_reading_page;
             }
             if (avatarColorToggle) {
                 avatarColorToggle.checked = defaultSettings.extract_color_from_avatar;
             }

             // Reset color mode dropdown
             const colorModeSelect = dialog.querySelector('#hmt-color-mode-select');
             if (colorModeSelect) {
                 colorModeSelect.value = defaultSettings.color_mode;
             }

             // Reset info page color mode dropdown
             const infoPageColorModeSelect = dialog.querySelector('#hmt-info-page-color-mode-select');
             if (infoPageColorModeSelect) {
                 infoPageColorModeSelect.value = defaultSettings.info_page_color_mode;
             }

             // Hiển thị lại custom color section
             const defaultColorSection = dialog.querySelector('#hmt-default-color-section');
             if (defaultColorSection) {
                 if ((isInfoPage() && defaultSettings.info_page_color_mode === 'default') || (!isInfoPage() && !defaultSettings.extract_color_from_avatar)) {
                     defaultColorSection.style.display = '';
                     debugLog('Reset: Showing default color section on info page default mode or general page without avatar extraction');
                 } else {
                     defaultColorSection.style.display = 'none';
                     debugLog('Reset: Hiding default color section');
                 }
             }

             showNotification('Đã khôi phục tất cả cài đặt về mặc định!', 3000);

             debugLog('Đã reset tất cả cài đặt về mặc định');
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

        // Avatar color extraction toggle
        if (avatarColorToggle) {
            avatarColorToggle.addEventListener('change', function() {
                setExtractColorFromAvatar(this.checked);
                showNotification('Đã cập nhật cài đặt trích xuất màu từ avatar!', 3000);

                // Show/hide default color section on general pages
                if (!isInfoPage()) {
                    const defaultColorSection = dialog.querySelector('#hmt-default-color-section');
                    if (defaultColorSection) {
                        if (this.checked) {
                            defaultColorSection.style.display = 'none';
                            debugLog('Hiding default color section on general page when avatar extraction enabled');
                        } else {
                            defaultColorSection.style.display = '';
                            debugLog('Showing default color section on general page when avatar extraction disabled');
                        }
                    }
                }
            });
        }

        // Proxy toggle
        if (proxyToggle) {
            proxyToggle.addEventListener('change', function() {
                setUseProxy(this.checked);
                showNotification('Đã cập nhật cài đặt sử dụng proxy!', 3000);
            });
        }

        // Proxy dropdown
        if (proxySelect) {
            proxySelect.addEventListener('change', function() {
                setPreferredProxy(this.value);
                showNotification('Đã cập nhật proxy ưu tiên!', 3000);
            });
        }


        // Color mode dropdown
        const colorModeSelect = dialog.querySelector('#hmt-color-mode-select');
        if (colorModeSelect) {
            colorModeSelect.addEventListener('change', function() {
                setColorMode(this.value);
                showNotification('Đã cập nhật chế độ màu trang đọc!', 3000);
            });
        }

        // Info page color mode dropdown
        const infoPageColorModeSelect = dialog.querySelector('#hmt-info-page-color-mode-select');
        if (infoPageColorModeSelect) {
            infoPageColorModeSelect.addEventListener('change', function() {
                setInfoPageColorMode(this.value);
                showNotification('Đã cập nhật chế độ màu trang thông tin truyện!', 3000);

                // Show/hide custom color section
                const defaultColorSection = dialog.querySelector('#hmt-default-color-section');
                if (defaultColorSection) {
                    if ((isInfoPage() && this.value === 'default') || (!isInfoPage() && !getExtractColorFromAvatar())) {
                        defaultColorSection.style.display = '';
                        debugLog('Showing default color section for info page default mode or general page without avatar extraction');
                    } else {
                        defaultColorSection.style.display = 'none';
                        debugLog('Hiding default color section for mode:', this.value);
                    }
                }
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
        // Notification functionality removed from modules
        // Permission still granted in main userscript
        return;
    }

    function openConfigDialog() {
        debugLog('Mở config dialog');
        createConfigDialog();
    }

    function initializeConfig() {
        // Áp dụng cài đặt domain warning khi khởi tạo
        applyDomainWarningVisibility();

        // Tự động thêm cookie ẩn cảnh báo tên miền nếu cài đặt được bật
        if (getHideDomainWarning()) {
            const farFuture = new Date('9999-12-31T23:59:59Z');
            const cookieOptions = `path=/; SameSite=Lax; expires=${farFuture.toUTCString()}; max-age=2147483647`;

            (window.top || window).document.cookie = `globalwarning=false; ${cookieOptions}`;
            (window.top || window).document.cookie = `globalwarning2=false; ${cookieOptions}`;
            debugLog('Đã tự động thêm cookie ẩn cảnh báo tên miền khi khởi tạo');
        }

        // Thiết lập biến CSS --random-bg-color với màu ngẫu nhiên
        const randomColor = getRandomHexColor();
        document.documentElement.style.setProperty('--random-bg-color', randomColor);
        debugLog('Đã thiết lập --random-bg-color:', randomColor);

        debugLog('Config module đã được khởi tạo');
    }

    debugLog('Config module đã được tải');

    // Xuất các hàm cần thiết
    window.HMTConfig = {
        getDefaultColor: getDefaultColor,
        getInfoPageDefaultColor: getInfoPageDefaultColor,
        setDefaultColor: setDefaultColor,
        setInfoPageDefaultColor: setInfoPageDefaultColor,
        getLastPickedColor: getLastPickedColor,
        setLastPickedColor: setLastPickedColor,
        getHideDomainWarning: getHideDomainWarning,
        setHideDomainWarning: setHideDomainWarning,
        getDisableColorsOnReadingPage: getDisableColorsOnReadingPage,
        setDisableColorsOnReadingPage: setDisableColorsOnReadingPage,
        getRandomHexColor: getRandomHexColor,
        getColorMode: getColorMode,
        setColorMode: setColorMode,
        getExtractColorFromAvatar: getExtractColorFromAvatar,
        setExtractColorFromAvatar: setExtractColorFromAvatar,
        getInfoPageColorMode: getInfoPageColorMode,
        setInfoPageColorMode: setInfoPageColorMode,
        getUseProxy: getUseProxy,
        setUseProxy: setUseProxy,
        getPreferredProxy: getPreferredProxy,
        setPreferredProxy: setPreferredProxy,
        openConfigDialog: openConfigDialog,
        initialize: initializeConfig,
        ensureDomainWarningCookies: ensureDomainWarningCookies,
        createScreenColorPicker: createScreenColorPicker
    };

    // Khởi tạo config khi module load
    initializeConfig();

})();

