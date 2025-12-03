(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const MIN_WIDTH = 1200;
    const MIN_HEIGHT = 300;
    const ASPECT_RATIO = 4; // 1200/300 = 4:1
    const ALLOW_SMALL_IMAGES = true; // Allow images smaller than minimum size, will resize them

    const AVATAR_MIN_WIDTH = 120;
    const AVATAR_MIN_HEIGHT = 120;
    const AVATAR_ASPECT_RATIO = 1; // 1:1
    
    const MAX_AVATAR_FILE_SIZE = 1024 * 1024; // 1MB strict limit for avatar uploads due to website constraints
    const MIN_COMPRESSED_SIZE = 900 * 1024; // Target minimum 900KB for compressed images to balance size and quality

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('profileCropper', ...args);
        } else if (DEBUG) {
            console.log('[ProfileCropper]', ...args);
        }
        // Always log for debugging
        console.log('[ProfileCropper]', ...args);
    }

    // Cached Cropper.js library
    let cachedCropperJs = null;
    let cachedCropperCss = null;

    /**
     * Load Cropper.js library
     */
    function loadCropperLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof Cropper !== 'undefined') {
                debugLog('Cropper.js already loaded');
                resolve();
                return;
            }

            // Load Cropper.js resources
            Promise.all([
                fetch('https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js').then(r => r.text()).catch(() => {
                    debugLog('Failed to load Cropper.js, using fallback');
                    return cachedCropperJs || '';
                }),
                fetch('https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css').then(r => r.text()).catch(() => {
                    debugLog('Failed to load Cropper.css, using fallback');
                    return cachedCropperCss || '';
                })
            ])
            .then(([js, css]) => {
                // Cache the resources
                cachedCropperJs = js;
                cachedCropperCss = css;

                // Load CSS
                if (css) {
                    const style = document.createElement('style');
                    style.textContent = css;
                    style.id = 'cropper-styles';
                    document.head.appendChild(style);
                    debugLog('Cropper.js CSS loaded');
                }

                // Load JS
                if (js) {
                    try {
                        const script = document.createElement('script');
                        script.textContent = js;
                        script.id = 'cropper-script';
                        document.head.appendChild(script);
                        debugLog('Cropper.js loaded via script tag');
                        resolve();
                    } catch (error) {
                        debugLog('Error loading Cropper.js via script:', error);
                        reject(error);
                    }
                } else {
                    reject(new Error('Cropper.js not available'));
                }
            })
            .catch(error => {
                debugLog('Error loading Cropper.js library:', error);
                reject(error);
            });
        });
    }

    /**
     * Create cropping modal
     */
    function createCropModal(imageFile, minWidth, minHeight, aspectRatio, title, previewWidth, previewHeight, callback) {
        debugLog('Creating crop modal for file:', imageFile.name);

        const modal = document.createElement('div');
        modal.className = 'hmt-crop-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        modal.innerHTML = `
            <div class="hmt-crop-modal" style="
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <div class="hmt-crop-header" style="
                    padding: 15px 20px;
                    border-bottom: 1px solid #ddd;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${title}</h3>
                    <button class="hmt-crop-close" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                <div class="hmt-crop-body" style="
                    padding: 20px;
                    display: flex;
                    gap: 20px;
                    flex: 1;
                    overflow: hidden;
                ">
                    <div class="hmt-crop-container" style="
                        flex: 1;
                        min-height: 300px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        overflow: hidden;
                    ">
                        <img id="hmt-crop-image" alt="Image preview" style="max-width: 100%; display: block;">
                    </div>
                    <div class="hmt-crop-info" style="
                        width: 200px;
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    ">
                        <div>
                            <p style="margin: 0; font-size: 14px;">Kích thước tối thiểu: ${minWidth}x${minHeight}px</p>
                            <p style="margin: 0; font-size: 14px;">Tỷ lệ: ${aspectRatio}:1</p>
                        </div>
                        <div class="hmt-crop-preview">
                            <h4 style="margin: 0 0 10px 0; font-size: 16px;">Xem trước:</h4>
                            <div class="hmt-crop-preview-box" style="
                                width: ${previewWidth}px;
                                height: ${previewHeight}px;
                                border: 1px solid #ddd;
                                border-radius: 3px;
                                background: #f5f5f5;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                overflow: hidden;
                            "></div>
                        </div>
                    </div>
                </div>
                <div class="hmt-crop-footer" style="
                    padding: 15px 20px;
                    border-top: 1px solid #ddd;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                ">
                    <button class="hmt-crop-cancel" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Hủy</button>
                    <button class="hmt-crop-upload" style="
                        padding: 8px 16px;
                        border: none;
                        background: #007bff;
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Cắt & Upload</button>
                </div>
                <style>
                    @media (max-width: 767px) {
                        .hmt-crop-body {
                            flex-direction: column !important;
                            gap: 15px !important;
                        }
                        .hmt-crop-info {
                            width: 100% !important;
                            order: 2 !important;
                        }
                        .hmt-crop-container {
                            order: 1 !important;
                            min-height: 250px !important;
                        }
                        .hmt-crop-preview {
                            display: none !important;
                        }
                        .hmt-crop-header, .hmt-crop-body, .hmt-crop-footer {
                            padding: 15px !important;
                        }
                    }
                </style>
            </div>
        `;

        document.body.appendChild(modal);
        debugLog('Modal appended to body');

        const img = modal.querySelector('#hmt-crop-image');
        const closeBtn = modal.querySelector('.hmt-crop-close');
        const cancelBtn = modal.querySelector('.hmt-crop-cancel');
        const uploadBtn = modal.querySelector('.hmt-crop-upload');
        const previewBox = modal.querySelector('.hmt-crop-preview-box');

        debugLog('Modal elements found:', !!img, !!closeBtn, !!cancelBtn, !!uploadBtn, !!previewBox);

        let cropper = null;

        // Load image
        const reader = new FileReader();
        reader.onload = function(e) {
            debugLog('Image loaded from FileReader');
            img.src = e.target.result;

            img.onload = function() {
                debugLog('Image element loaded, dimensions:', img.naturalWidth, 'x', img.naturalHeight);

                // Check if image needs resizing
                let needsResize = false;
                if (img.naturalWidth < minWidth || img.naturalHeight < minHeight) {
                    if (ALLOW_SMALL_IMAGES) {
                        debugLog('Image is smaller than minimum size, will resize after cropping');
                        needsResize = true;
                    } else {
                        showNotification(`Ảnh quá nhỏ! Yêu cầu tối thiểu ${minWidth}x${minHeight}px. Ảnh hiện tại: ${img.naturalWidth}x${img.naturalHeight}px`, 5000);
                        modal.remove();
                        return;
                    }
                }

                // Initialize Cropper
                debugLog('Initializing Cropper.js');
                try {
                    cropper = new Cropper(img, {
                        aspectRatio: aspectRatio,
                        viewMode: 1,
                        autoCropArea: 1.0,
                        responsive: true,
                        restore: false,
                        guides: true,
                        center: true,
                        highlight: false,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: false,
                        ready: function() {
                            debugLog('Cropper ready');
                            updatePreview();
                        },
                        crop: function(event) {
                            updatePreview();
                        }
                    });
                    debugLog('Cropper initialized successfully');
                } catch (error) {
                    debugLog('Error initializing Cropper:', error);
                    showNotification('Không thể khởi tạo công cụ cắt ảnh.', 5000);
                    modal.remove();
                    return;
                }

                // Update info text if image needs resizing
                if (needsResize) {
                    const infoText = modal.querySelector('.hmt-crop-info p:first-child');
                    if (infoText) {
                        infoText.textContent = `Ảnh sẽ được resize thành ${minWidth}x${minHeight}px sau khi cắt. Kích thước hiện tại: ${img.naturalWidth}x${img.naturalHeight}px`;
                    }
                }

                function updatePreview() {
                    if (!cropper) return;

                    const canvas = cropper.getCroppedCanvas({
                        fillColor: '#fff',
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high'
                    });

                    if (canvas) {
                        previewBox.innerHTML = '';
                        canvas.style.maxWidth = previewWidth + 'px';
                        canvas.style.maxHeight = previewHeight + 'px';
                        canvas.style.border = '1px solid #ddd';
                        canvas.style.objectFit = 'contain';
                        previewBox.appendChild(canvas);
                    }
                }
            };

            img.onerror = function() {
                debugLog('Error loading image');
                showNotification('Không thể tải ảnh.', 5000);
                modal.remove();
            };
        };

        reader.onerror = function() {
            debugLog('Error reading file');
            showNotification('Không thể đọc file ảnh.', 5000);
            modal.remove();
        };

        reader.readAsDataURL(imageFile);

        // Event handlers
        function closeModal() {
            debugLog('Closing modal');
            if (cropper) {
                cropper.destroy();
            }
            modal.remove();
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                debugLog('Clicked outside modal, closing');
                closeModal();
            }
        });

        uploadBtn.addEventListener('click', function() {
            debugLog('Upload button clicked');
            if (!cropper) {
                debugLog('No cropper instance');
                return;
            }

            let canvas = cropper.getCroppedCanvas({
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (canvas) {
                debugLog('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

                // If canvas is smaller than required dimensions, resize it
                if (canvas.width < minWidth || canvas.height < minHeight) {
                    debugLog('Canvas smaller than required, resizing to', minWidth, 'x', minHeight);
                    const resizedCanvas = document.createElement('canvas');
                    const ctx = resizedCanvas.getContext('2d');

                    resizedCanvas.width = minWidth;
                    resizedCanvas.height = minHeight;

                    // Enable high-quality image scaling
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Draw the original canvas onto the resized canvas
                    ctx.drawImage(canvas, 0, 0, minWidth, minHeight);

                    canvas = resizedCanvas;
                    debugLog('Canvas resized successfully');
                }

                debugLog('Converting canvas to blob');
                canvas.toBlob(function(blob) {
                    if (!blob) {
                        debugLog('Failed to create blob from canvas');
                        showNotification('Không thể tạo ảnh đã cắt.', 5000);
                        return;
                    }

                    const croppedFile = new File([blob], imageFile.name, {
                        type: 'image/png',
                        lastModified: Date.now()
                    });

                    debugLog('Cropped image created:', croppedFile.size, 'bytes');

                    // Call callback with cropped file
                    callback(croppedFile);

                    closeModal();
                }, 'image/png');
            } else {
                debugLog('Failed to get cropped canvas');
                showNotification('Không thể tạo canvas đã cắt.', 5000);
            }
        });

        // ESC key handler
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                debugLog('ESC key pressed, closing modal');
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // Prevent modal from disappearing immediately
        modal.style.display = 'flex';
        debugLog('Modal should now be visible');
    }

    /**
     * Create avatar crop dialog
     */
    function createAvatarDialog(imageFile) {
        const modal = document.createElement('div');
        modal.className = 'hmt-avatar-dialog-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        modal.innerHTML = `
            <div class="hmt-avatar-dialog" style="
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                padding: 20px;
                text-align: center;
            ">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Ảnh avatar không có tỷ lệ 1:1</h3>
                <p style="margin: 0 0 20px 0; font-size: 14px;">Bạn muốn làm gì với ảnh này?</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button class="hmt-avatar-cancel" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Hủy</button>
                    <button class="hmt-avatar-no" style="
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        background: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Upload nguyên bản</button>
                    <button class="hmt-avatar-yes" style="
                        padding: 8px 16px;
                        border: none;
                        background: #007bff;
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Cắt thành 1:1</button>
                </div>
                <style>
                    @media (max-width: 480px) {
                        .hmt-avatar-dialog {
                            max-width: 90vw !important;
                            padding: 15px !important;
                        }
                        .hmt-avatar-dialog div[style*="display: flex"] {
                            flex-direction: column !important;
                            gap: 8px !important;
                        }
                        .hmt-avatar-dialog button {
                            width: 100% !important;
                        }
                    }
                </style>
            </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('.hmt-avatar-cancel');
        const noBtn = modal.querySelector('.hmt-avatar-no');
        const yesBtn = modal.querySelector('.hmt-avatar-yes');

        function closeModal() {
            modal.remove();
        }

        cancelBtn.addEventListener('click', closeModal);
        noBtn.addEventListener('click', () => {
            uploadAvatar(imageFile);
            closeModal();
        });
        yesBtn.addEventListener('click', () => {
            closeModal();
            loadCropperLibrary().then(() => {
                createCropModal(imageFile, AVATAR_MIN_WIDTH, AVATAR_MIN_HEIGHT, AVATAR_ASPECT_RATIO, "Cắt ảnh avatar", 200, 200, uploadAvatar);
            }).catch(error => {
                debugLog('Failed to load Cropper.js:', error);
                showNotification('Không thể tải thư viện cắt ảnh.', 5000);
            });
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    /**
     * Show notification
     */
    function showNotification(message, timeout) {
        // Notification functionality removed from modules
        // Permission still granted in main userscript
        return;
    }

    /**
     * Compress image to meet file size requirements
     * Uses Canvas API for client-side compression with quality preservation
     * Iteratively reduces JPEG/WebP quality or converts PNG to JPEG
     * Ensures compressed size is <= 1MB and aims for >= 900KB
     */
    function compressImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Preserve original dimensions to maintain aspect ratio and avoid quality loss from resizing
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                // Enable high-quality rendering to preserve details, colors, and sharpness
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0);

                // Determine output format - convert PNG to JPEG for compression since PNG doesn't support quality parameter
                let outputType = file.type;
                if (file.type === 'image/png') {
                    outputType = 'image/jpeg'; // Convert PNG to JPEG for effective compression
                }

                let quality = 0.9; // Start with high quality (90%) to maintain visual fidelity
                const maxIterations = 16; // Prevent infinite loop, limit to 16 attempts
                let iteration = 0;

                const attemptCompression = () => {
                    iteration++;
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image - canvas toBlob failed'));
                            return;
                        }

                        debugLog(`Compression attempt ${iteration}: size ${blob.size} bytes, quality ${quality}`);

                        if (blob.size > MAX_AVATAR_FILE_SIZE) {
                            if (quality > 0.1 && iteration < maxIterations) {
                                quality = Math.max(0.1, quality - 0.05); // Reduce quality in 5% steps
                                attemptCompression(); // Retry with lower quality
                            } else {
                                reject(new Error('Cannot compress image below 1MB without unacceptable quality loss. Please select a smaller image.'));
                            }
                        } else {
                            // Check if size is too small (below 900KB), but accept if we can't increase
                            if (blob.size < MIN_COMPRESSED_SIZE && quality < 0.95 && iteration < maxIterations) {
                                quality = Math.min(0.95, quality + 0.05); // Try higher quality to reach minimum size
                                attemptCompression();
                            } else {
                                // Quality check: warn if quality dropped significantly (potential detail loss)
                                if (quality < 0.5) {
                                    debugLog('Warning: Image compressed with low quality, potential loss of details, colors, or sharpness');
                                }
                                resolve(blob);
                            }
                        }
                    }, outputType, quality);
                };

                attemptCompression();
            };

            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Upload banner image
     */
    function uploadBanner(file) {
        const token = window.csrfToken || document.querySelector('meta[name="csrf-token"]')?.content;
        if (!token) {
            debugLog('CSRF token not found');
            showNotification('Không thể upload ảnh - thiếu token bảo mật.', 5000);
            return;
        }

        const formdata = new FormData();
        formdata.append('image', file);
        formdata.append('_token', token);

        debugLog('Sending AJAX upload request to /action/upload/usercover');

        if (typeof $ !== 'undefined') {
            $.ajax({
                url: '/action/upload/usercover',
                type: 'POST',
                data: formdata,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function(data) {
                    debugLog('AJAX upload success:', data);
                    if (data.status == 'success') {
                        $('.profile-cover .content').css('background-image', 'url(' + data.url + ')');
                        showNotification('Ảnh đã được cắt và upload thành công!', 3000);
                    } else {
                        debugLog('Upload failed with message:', data.message);
                        showNotification(data.message || 'Upload thất bại.', 5000);
                    }
                },
                error: function(xhr, status, error) {
                    debugLog('AJAX upload error:', status, error);
                    showNotification('Không thể upload ảnh.', 5000);
                }
            });
        } else {
            fetch('/action/upload/usercover', {
                method: 'POST',
                body: formdata,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                debugLog('Fetch upload success:', data);
                if (data.status == 'success') {
                    $('.profile-cover .content').css('background-image', 'url(' + data.url + ')');
                    showNotification('Ảnh đã được cắt và upload thành công!', 3000);
                } else {
                    debugLog('Upload failed with message:', data.message);
                    showNotification(data.message || 'Upload thất bại.', 5000);
                }
            })
            .catch(error => {
                debugLog('Fetch upload error:', error);
                showNotification('Không thể upload ảnh.', 5000);
            });
        }
    }

    /**
     * Upload avatar image with size validation and compression
     */
    async function uploadAvatar(file) {
        try {
            const token = window.csrfToken || document.querySelector('meta[name="csrf-token"]')?.content;
            if (!token) {
                showNotification('Không thể upload ảnh - thiếu token bảo mật.', 5000);
                return;
            }

            // Check file size and compress if needed to enforce 1MB limit
            let processedFile = file;
            if (file.size > MAX_AVATAR_FILE_SIZE) {
                debugLog('File size exceeds 1MB, compressing...');
                showNotification('Đang nén ảnh để giảm kích thước...', 2000); // Progress indicator for user feedback

                try {
                    const compressedBlob = await compressImage(file);
                    processedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: compressedBlob.type });
                    debugLog(`Compression successful: ${file.size} -> ${compressedBlob.size} bytes`);
                    showNotification('Ảnh đã được nén thành công!', 2000);
                } catch (compressionError) {
                    debugLog('Compression failed:', compressionError);
                    showNotification(compressionError.message, 5000);
                    return; // Abort upload on compression failure
                }
            }

            const formdata = new FormData();
        formdata.append('image', processedFile);
        formdata.append('_token', token);

        debugLog('Uploading processed file:', processedFile.name, processedFile.size, 'bytes');

        if (typeof $ !== 'undefined') {
            $.ajax({
                url: '/action/upload/avatar',
                type: 'POST',
                data: formdata,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function(data) {
                    if (data.status == 'success') {
                        $('.profile-ava').find('img').attr('src', data.url);
                        showNotification('Ảnh avatar đã được upload thành công!', 3000);
                    } else {
                        showNotification(data.message || 'Upload thất bại.', 5000);
                    }
                },
                error: function(xhr, status, error) {
                    showNotification('Không thể upload ảnh.', 5000);
                }
            });
        } else {
            fetch('/action/upload/avatar', {
                method: 'POST',
                body: formdata,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status == 'success') {
                    $('.profile-ava').find('img').attr('src', data.url);
                    showNotification('Ảnh avatar đã được upload thành công!', 3000);
                } else {
                    showNotification(data.message || 'Upload thất bại.', 5000);
                }
            })
            .catch(error => {
                debugLog('Fetch upload error:', error);
                showNotification('Không thể upload ảnh.', 5000);
            });
        }
        } catch (error) {
            debugLog('Error in uploadAvatar:', error);
            showNotification('Lỗi không mong muốn khi upload ảnh.', 5000);
        }
    }

    /**
     * Intercept file input for profile images
     */
    function interceptFileInput() {
        debugLog('Intercepting file inputs for profile images');

        const inputs = [
            document.querySelector('#user_cover_file'),
            document.querySelector('#user_avatar_file')
        ];

        inputs.forEach(input => {
            if (!input) return;

            debugLog('Intercepting input:', input.id);

            // Intercept change event
            input.addEventListener('change', function(e) {
                debugLog('File input change event triggered on', input.id);

                const files = e.target.files;
                if (files.length === 0) return;

                const file = files[0];

                // Check if it's an image
                if (!file.type.startsWith('image/')) {
                    debugLog('Selected file is not an image');
                    return;
                }

                debugLog('Image selected:', file.name, file.size, 'bytes');

                // Prevent default upload
                e.preventDefault();
                e.stopPropagation();

                // Clear the input
                e.target.value = '';

                if (input.id === 'user_avatar_file') {
                    // Avatar logic
                    if (file.type === 'image/gif') {
                        debugLog('GIF detected, uploading directly');
                        uploadAvatar(file);
                    } else {
                        // Check aspect ratio
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const img = new Image();
                            img.onload = function() {
                                const aspectRatio = img.naturalWidth / img.naturalHeight;
                                debugLog('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight, 'aspect:', aspectRatio);
                                if (Math.abs(aspectRatio - 1) < 0.01) {
                                    debugLog('Image is 1:1, uploading directly');
                                    uploadAvatar(file);
                                } else {
                                    debugLog('Image not 1:1, showing dialog');
                                    createAvatarDialog(file);
                                }
                            };
                            img.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                } else {
                    // Banner logic
                    loadCropperLibrary().then(() => {
                        createCropModal(file, MIN_WIDTH, MIN_HEIGHT, ASPECT_RATIO, "Cắt ảnh profile banner", 200, 50, uploadBanner);
                    }).catch(error => {
                        debugLog('Failed to load Cropper.js:', error);
                        showNotification('Không thể tải thư viện cắt ảnh.', 5000);
                    });
                }
            }, true); // Use capture phase to intercept before other handlers
        });
    }

    /**
     * Initialize the module
     */
    function init() {
        debugLog('Initializing Profile Cropper module');

        // Check if we're on a profile page
        const isProfilePage = window.location.href.includes('/user/') ||
                              window.location.href.includes('/profile') ||
                              document.querySelector('[class*="profile"], [id*="profile"]');

        debugLog('Current URL:', window.location.href);
        debugLog('Is profile page:', isProfilePage, document.querySelector('[class*="profile"], [id*="profile"]'));

        if (!isProfilePage) {
            debugLog('Not on profile page, skipping initialization');
            return;
        }
    
    
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                debugLog('DOMContentLoaded fired, intercepting file inputs');
                interceptFileInput();
            });
        } else {
            debugLog('DOM already loaded, intercepting file inputs');
            interceptFileInput();
        }

        // Also try after a short delay in case elements are loaded dynamically
        setTimeout(function() {
            debugLog('Delayed interception after 2 seconds');
            interceptFileInput();
        }, 2000);

        // Also try after a longer delay for dynamic content
        setTimeout(function() {
            debugLog('Delayed interception after 5 seconds');
            interceptFileInput();
        }, 5000);

        debugLog('Profile Cropper module initialized');
    }

    // Export module
    window.HMTProfileCropper = {
        init: init,
        loadCropperLibrary: loadCropperLibrary,
        createCropModal: createCropModal,
        interceptFileInput: interceptFileInput,
        uploadBanner: uploadBanner,
        uploadAvatar: uploadAvatar,
        createAvatarDialog: createAvatarDialog
    };

    // Auto-initialize
    init();

})();