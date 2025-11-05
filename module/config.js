/**
 * File cấu hình của HakoMonetTheme
 *
 * File này quản lý tất cả các cài đặt và tùy chọn của theme. Nó giúp người dùng
 * tùy chỉnh giao diện và cách hoạt động của theme trên trang web một cách dễ dàng.
 *
 * Các tính năng chính:
 * - Chọn màu sắc mặc định: Cho phép chọn màu chủ đạo khi không thể lấy màu từ ảnh bìa truyện
 * - Ẩn cảnh báo tên miền: Ẩn các thông báo cảnh báo về tên miền không chính thức
 * - Tắt màu trên trang đọc truyện: Ngăn theme áp dụng màu sắc vào trang đọc truyện
 * - Chế độ màu: Chọn giữa sử dụng màu từ cấu hình hoặc từ ảnh bìa truyện
 *
 * Cách sử dụng:
 * File này tự động tải khi theme khởi động và cung cấp giao diện cài đặt
 * thông qua menu chính của HakoMonetTheme.
 */

(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

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

        debugLog('[ColorPicker] Đã tạo UI elements, thời gian:', performance.now() - startTime, 'ms');

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

            // Tối ưu hóa html2canvas options dựa trên device info và render images properly
            const html2canvasOptions = {
                useCORS: true,
                allowTaint: true,
                scale: typeof window.DeviceDetector !== 'undefined' && window.DeviceDetector.getPixelRatio() > 1 ? 0.6 : 0.8, // Giảm scale hơn cho retina displays
                width: window.innerWidth,
                height: window.innerHeight,
                x: 0,
                y: 0,
                backgroundColor: '#ffffff', // Đặt background trắng để đảm bảo render chính xác
                logging: false, // Tắt logging của html2canvas
                imageTimeout: 0, // Không timeout cho images
                removeContainer: false, // Giữ container để tránh lỗi render
                foreignObjectRendering: false, // Tắt foreign object rendering để tránh lỗi
                // Render images properly trong screenshot
                proxy: undefined, // Không sử dụng proxy
                ignoreElements: function(element) {
                    // Chỉ bỏ qua elements thực sự problematic
                    if (element.tagName === 'IFRAME') return true;
                    if (element.tagName === 'VIDEO') return true;
                    if (element.tagName === 'AUDIO') return true;
                    if (element.tagName === 'EMBED') return true;
                    if (element.tagName === 'OBJECT') return true;
                    return false;
                },
                // Cấu hình để render images tốt nhất có thể
                allowTaint: true, // Cho phép render cross-origin images
                useCORS: true, // Sử dụng CORS
                imageTimeout: 5000, // Timeout 5s cho images thay vì 0
                onclone: function(clonedDoc) {
                    // Pre-process cloned document để đảm bảo images load
                    const images = clonedDoc.querySelectorAll('img');
                    images.forEach(img => {
                        // Đảm bảo images có crossOrigin attribute
                        if (!img.crossOrigin) {
                            img.crossOrigin = 'anonymous';
                        }
                        // Force reload để tránh cache issues
                        const src = img.src;
                        img.src = '';
                        img.src = src;
                    });
                }
                // Tối ưu hóa cho mobile devices
                ...(typeof window.DeviceDetector !== 'undefined' && window.DeviceDetector.isMobile() && {
                    scale: 0.5, // Scale thấp hơn cho mobile
                    width: Math.min(window.innerWidth, 1024), // Giới hạn width cho mobile
                    height: Math.min(window.innerHeight, 768) // Giới hạn height cho mobile
                })
            };

            debugLog('[ColorPicker] html2canvas options:', html2canvasOptions);

            // Thêm error handling cho cross-origin issues
            html2canvas(document.body, html2canvasOptions).then(function(screenshot) {
                debugLog('[ColorPicker] html2canvas capture thành công');
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

            // Phát hiện thiết bị touch - sử dụng DeviceDetector nếu có
            const isTouchDevice = typeof window.DeviceDetector !== 'undefined'
                ? window.DeviceDetector.isTouchDevice()
                : ('ontouchstart' in window || navigator.maxTouchPoints > 0);

            // Thêm debug info về device detection
            debugLog('[ColorPicker] Device detection:', {
                isTouchDevice: isTouchDevice,
                deviceType: typeof window.DeviceDetector !== 'undefined' ? window.DeviceDetector.getCurrentDevice() : 'unknown',
                pixelRatio: typeof window.DeviceDetector !== 'undefined' ? window.DeviceDetector.getPixelRatio() : window.devicePixelRatio
            });

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

            // Kiểm tra loại lỗi để đưa ra thông báo phù hợp
            let errorMessage = 'Lỗi: Không thể capture màn hình - thử fallback';
            if (error.message && error.message.includes('cross-origin')) {
                errorMessage = 'Lỗi CORS: Không thể capture elements từ domain khác - thử fallback';
                debugLog('[ColorPicker] Cross-origin error detected, using fallback');
            } else if (error.message && error.message.includes('tainted')) {
                errorMessage = 'Lỗi taint: Canvas bị contaminated - thử fallback';
                debugLog('[ColorPicker] Canvas tainted error detected, using fallback');
            }

            infoPanel.textContent = errorMessage;

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

    function isInfoPage() {
        // Kiểm tra nếu đang ở trang thông tin truyện dựa trên element đặc trưng từ colors/page-info-truyen.js
        return document.querySelector('div.col-4.col-md.feature-item.width-auto-xl') !== null;
    }

    function getRandomHexColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    function createConfigDialog() {
        // Kiểm tra xem dialog đã tồn tại chưa (kiểm tra ở top window để tránh duplicate trong iframe)
        if ((window.top || window).document.querySelector('.hmt-config-dialog')) {
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
${!isInfoPage() ? `
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
                                                        <button class="hmt-slider-btn hmt-plus-btn" data-target="hmt-sat-slider" data-action="increase">+</button>
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
                                                   placeholder="#17deb3">
                                        </div>
                                        <span class="hmt-color-picker-label">Thanh trượt HSL</span>
                                    </div>
                                </div>
                                <small class="hmt-color-help">Kéo thanh trượt HSL để chọn màu, sử dụng nút +/- để điều chỉnh chi tiết, hoặc nhập mã HEX trực tiếp</small>
                            </div>
                        </div>
` : ''}

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

${!isInfoPage() ? `
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
` : ''}

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

        // Thêm CSS
        GM_addStyle(`
            :root {
                --random-bg-color: #ffffff; /* Mặc định, sẽ được ghi đè bởi JS */
            }

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
                background: linear-gradient(135deg, var(--random-bg-color) 0%, var(--random-bg-color) 100%);
                color: white;
            }

            .hmt-header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
            }

            .hmt-config-back {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.2s;
                margin-right: 16px;
            }

            .hmt-config-back:hover {
                background: rgba(255, 255, 255, 0.3);
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

            .hmt-screen-color-picker-btn {
                width: 32px;
                height: 32px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                background: #f8f9fa;
                color: #495057;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                user-select: none;
                margin-left: 8px;
            }

            .hmt-screen-color-picker-btn:hover {
                background: #e9ecef;
                border-color: #667eea;
                color: #667eea;
            }

            .hmt-screen-color-picker-btn:active {
                transform: scale(0.95);
            }

            .hmt-screen-color-picker-btn svg {
                width: 16px;
                height: 16px;
            }

            .hmt-color-picker-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10002;
                cursor: crosshair;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .hmt-color-picker-canvas {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                pointer-events: none;
            }

            .hmt-color-picker-zoom {
                position: absolute;
                width: 160px;
                height: 160px;
                border: 3px solid white;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.95);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                pointer-events: none;
                display: none;
                overflow: hidden;
                cursor: move;
                z-index: 10003;
                transition: transform 0.1s ease-out;
            }

            .hmt-color-picker-zoom::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 4px;
                height: 4px;
                background: red;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 0 2px white;
            }

            .hmt-color-picker-zoom.dragging {
                cursor: grabbing;
            }

            .hmt-color-picker-info {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 14px 18px;
                border-radius: 10px;
                font-family: monospace;
                font-size: 15px;
                font-weight: 600;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                pointer-events: none;
                transition: all 0.3s ease;
                backdrop-filter: blur(4px);
            }

            .hmt-color-picker-info.updating {
                background: rgba(0, 0, 0, 0.95);
                transform: scale(1.02);
            }

            .hmt-color-picker-instructions {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                pointer-events: none;
            }

            .hmt-color-picker-controls {
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                display: flex;
                gap: 12px;
                justify-content: center;
                pointer-events: none;
            }

            .hmt-color-picker-controls > * {
                pointer-events: auto;
            }

            .hmt-color-picker-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 100px;
            }

            .hmt-color-picker-btn.select {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .hmt-color-picker-btn.select:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            .hmt-color-picker-btn.cancel {
                background: #f8f9fa;
                color: #666;
                border: 1px solid #ddd;
            }

            .hmt-color-picker-btn.cancel:hover {
                background: #e9ecef;
                color: #333;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .hmt-color-picker-info {
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    font-size: 12px;
                    padding: 8px 12px;
                }

                .hmt-color-picker-instructions {
                    bottom: 80px;
                    font-size: 12px;
                    padding: 8px 16px;
                }

                .hmt-color-picker-controls {
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                }

                .hmt-color-picker-btn {
                    flex: 1;
                    padding: 14px 20px;
                    font-size: 14px;
                }
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

            .hmt-color-mode-dropdown label {
                color: #333;
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
        const backBtn = dialog.querySelector('.hmt-config-back');
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
                  debugLog('[Config] Màu không hợp lệ khi lưu:', selectedColor);
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
        if (!isInfoPage()) {
            const colorModeSelect = dialog.querySelector('#hmt-color-mode-select');
            if (colorModeSelect) {
                colorModeSelect.addEventListener('change', function() {
                    setColorMode(this.value);
                    showNotification('Đã cập nhật chế độ màu!', 3000);
                });
            }
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
        setDefaultColor: setDefaultColor,
        getLastPickedColor: getLastPickedColor,
        setLastPickedColor: setLastPickedColor,
        getHideDomainWarning: getHideDomainWarning,
        setHideDomainWarning: setHideDomainWarning,
        getDisableColorsOnReadingPage: getDisableColorsOnReadingPage,
        setDisableColorsOnReadingPage: setDisableColorsOnReadingPage,
        getRandomHexColor: getRandomHexColor,
        getColorMode: getColorMode,
        setColorMode: setColorMode,
        openConfigDialog: openConfigDialog,
        initialize: initializeConfig,
        ensureDomainWarningCookies: ensureDomainWarningCookies,
        createScreenColorPicker: createScreenColorPicker
    };

    // Khởi tạo config khi module load
    initializeConfig();

})();
