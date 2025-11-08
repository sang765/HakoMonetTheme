/**
 * Module cắt profile banner trước khi upload
 *
 * Module này cung cấp tính năng cắt ảnh profile banner trước khi upload,
 * giải quyết vấn đề trang web đích không có tính năng crop built-in.
 *
 * Tính năng chính:
 * - Chặn sự kiện chọn file ảnh
 * - Hiển thị modal crop với Cropper.js
 * - Upload ảnh đã cắt với CORS bypass
 * - Tích hợp với hệ thống config của theme
 */

(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);
    const MIN_WIDTH = 1200;
    const MIN_HEIGHT = 300;
    const ASPECT_RATIO = 4; // 1200/300 = 4:1
    const ALLOW_SMALL_IMAGES = true; // Allow images smaller than minimum size, will resize them

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('profileBannerCropper', ...args);
        } else if (DEBUG) {
            console.log('[ProfileBannerCropper]', ...args);
        }
        // Always log for debugging
        console.log('[ProfileBannerCropper]', ...args);
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
                        eval(js);
                        debugLog('Cropper.js loaded');
                        resolve();
                    } catch (error) {
                        debugLog('Error executing Cropper.js:', error);
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
    function createCropModal(imageFile, callback) {
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
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Cắt ảnh profile banner</h3>
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
                        <img id="hmt-crop-image" alt="Profile banner preview" style="max-width: 100%; display: block;">
                    </div>
                    <div class="hmt-crop-info" style="
                        width: 200px;
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    ">
                        <div>
                            <p style="margin: 0; font-size: 14px;">Kích thước tối thiểu: ${MIN_WIDTH}x${MIN_HEIGHT}px</p>
                            <p style="margin: 0; font-size: 14px;">Tỷ lệ: ${ASPECT_RATIO}:1</p>
                        </div>
                        <div class="hmt-crop-preview">
                            <h4 style="margin: 0 0 10px 0; font-size: 16px;">Xem trước:</h4>
                            <div class="hmt-crop-preview-box" style="
                                width: 200px;
                                height: 50px;
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
                if (img.naturalWidth < MIN_WIDTH || img.naturalHeight < MIN_HEIGHT) {
                    if (ALLOW_SMALL_IMAGES) {
                        debugLog('Image is smaller than minimum size, will resize after cropping');
                        needsResize = true;
                    } else {
                        showNotification(`Ảnh quá nhỏ! Yêu cầu tối thiểu ${MIN_WIDTH}x${MIN_HEIGHT}px. Ảnh hiện tại: ${img.naturalWidth}x${img.naturalHeight}px`, 5000);
                        modal.remove();
                        return;
                    }
                }

                // Initialize Cropper
                debugLog('Initializing Cropper.js');
                try {
                    cropper = new Cropper(img, {
                        aspectRatio: ASPECT_RATIO,
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
                        infoText.textContent = `Ảnh sẽ được resize thành ${MIN_WIDTH}x${MIN_HEIGHT}px sau khi cắt. Kích thước hiện tại: ${img.naturalWidth}x${img.naturalHeight}px`;
                    }
                }

                function updatePreview() {
                    if (!cropper) return;

                    const canvas = cropper.getCroppedCanvas({
                        width: MIN_WIDTH,
                        height: MIN_HEIGHT,
                        fillColor: '#fff',
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high'
                    });

                    if (canvas) {
                        previewBox.innerHTML = '';
                        canvas.style.maxWidth = '200px';
                        canvas.style.maxHeight = '50px';
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
                if (canvas.width < MIN_WIDTH || canvas.height < MIN_HEIGHT) {
                    debugLog('Canvas smaller than required, resizing to', MIN_WIDTH, 'x', MIN_HEIGHT);
                    const resizedCanvas = document.createElement('canvas');
                    const ctx = resizedCanvas.getContext('2d');

                    resizedCanvas.width = MIN_WIDTH;
                    resizedCanvas.height = MIN_HEIGHT;

                    // Enable high-quality image scaling
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Draw the original canvas onto the resized canvas
                    ctx.drawImage(canvas, 0, 0, MIN_WIDTH, MIN_HEIGHT);

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
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });

                    debugLog('Cropped image created:', croppedFile.size, 'bytes');

                    // Call callback with cropped file
                    if (callback) {
                        callback(croppedFile);
                    }

                    closeModal();
                }, 'image/jpeg', 0.9);
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
     * Show notification
     */
    function showNotification(message, timeout) {
        timeout = timeout || 3000;
        if (typeof GM_notification === 'function') {
            GM_notification({
                title: 'HakoMonetTheme - Profile Banner',
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

    /**
     * Check if an input element is likely for profile banner upload
     */
    function isProfileBannerInput(input) {
        // Check element attributes
        const name = input.name?.toLowerCase() || '';
        const id = input.id?.toLowerCase() || '';
        const className = input.className?.toLowerCase() || '';

        // Direct name/id matches
        if (name.includes('banner') || name.includes('cover') || name.includes('background') || name.includes('header')) {
            return true;
        }
        if (id.includes('banner') || id.includes('cover') || id.includes('background') || id.includes('header')) {
            return true;
        }
        if (className.includes('banner') || className.includes('cover') || className.includes('background') || className.includes('header')) {
            return true;
        }

        // Check parent container context
        const container = input.closest('[class*="profile"], [class*="banner"], [class*="cover"], [class*="header"], [id*="profile"], [id*="banner"], [id*="cover"], [id*="header"]');
        if (container) {
            return true;
        }

        // Check label text
        const labels = document.querySelectorAll(`label[for="${input.id}"]`);
        for (const label of labels) {
            const labelText = label.textContent?.toLowerCase() || '';
            if (labelText.includes('banner') || labelText.includes('cover') || labelText.includes('background') || labelText.includes('header')) {
                return true;
            }
        }

        // Check previous sibling elements (common pattern)
        let sibling = input.previousElementSibling;
        for (let i = 0; i < 5 && sibling; i++) { // Check up to 5 siblings
            const siblingText = sibling.textContent?.toLowerCase() || '';
            const siblingClass = sibling.className?.toLowerCase() || '';
            if (siblingText.includes('banner') || siblingText.includes('cover') ||
                siblingText.includes('background') || siblingText.includes('header') ||
                siblingClass.includes('banner') || siblingClass.includes('cover')) {
                return true;
            }
            sibling = sibling.previousElementSibling;
        }

        // Check parent text content
        const parentText = input.parentElement?.textContent?.toLowerCase() || '';
        if (parentText.includes('banner') || parentText.includes('cover') ||
            parentText.includes('background') || parentText.includes('header')) {
            return true;
        }

        // Check for specific Hako page patterns
        if (window.location.href.includes('/user/') || window.location.href.includes('/profile')) {
            // On profile pages, any image file input is likely for banner
            if (input.accept?.includes('image') || !input.accept) {
                // Additional check: look for form action or nearby text
                const form = input.closest('form');
                if (form) {
                    const formAction = form.action?.toLowerCase() || '';
                    const formText = form.textContent?.toLowerCase() || '';
                    if (formAction.includes('banner') || formAction.includes('cover') ||
                        formText.includes('banner') || formText.includes('cover')) {
                        return true;
                    }
                }

                // Check if this is the only file input on the page (common for banner uploads)
                const allFileInputs = document.querySelectorAll('input[type="file"]');
                if (allFileInputs.length === 1) {
                    return true;
                }

                // Check for specific CSS classes or data attributes that might indicate banner upload
                const dataAttrs = input.attributes;
                for (let attr of dataAttrs) {
                    if (attr.name.includes('banner') || attr.name.includes('cover') ||
                        attr.value.includes('banner') || attr.value.includes('cover')) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Intercept file input for profile banner
     */
    function interceptFileInput() {
        debugLog('Intercepting file inputs for profile banner');

        // Find profile banner file input with more specific detection
        const selectors = [
            'input[type="file"][name*="banner"]',
            'input[type="file"][name*="cover"]',
            'input[type="file"][name*="background"]',
            'input[type="file"][name*="header"]',
            'input[type="file"][accept*="image"]'
        ];

        let fileInput = null;

        // First, try specific selectors
        for (const selector of selectors) {
            const inputs = document.querySelectorAll(selector);
            for (const input of inputs) {
                if (isProfileBannerInput(input)) {
                    fileInput = input;
                    break;
                }
            }
            if (fileInput) break;
        }

        // If not found, try broader search with context analysis
        if (!fileInput) {
            const allFileInputs = document.querySelectorAll('input[type="file"]');
            for (const input of allFileInputs) {
                if (isProfileBannerInput(input)) {
                    fileInput = input;
                    break;
                }
            }
        }

        if (!fileInput) {
            debugLog('Profile banner file input not found');
            return;
        }

        debugLog('Found profile banner input:', fileInput, fileInput.id, fileInput.name);

        // Intercept change event
        let isProcessing = false;
        fileInput.addEventListener('change', function(e) {
            debugLog('File input change event triggered');

            // Prevent infinite loop
            if (isProcessing) {
                debugLog('Already processing, skipping');
                return;
            }

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

            isProcessing = true;

            // Load Cropper.js and show modal
            loadCropperLibrary().then(() => {
                createCropModal(file, function(croppedFile) {
                    debugLog('Uploading cropped image...');

                    // Create new FileList with cropped file
                    const dt = new DataTransfer();
                    dt.items.add(croppedFile);
                    fileInput.files = dt.files;

                    // Trigger upload
                    const form = fileInput.closest('form');
                    if (form) {
                        debugLog('Found form, submitting:', form);
                        // Try to submit the form
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                        if (!form.dispatchEvent(submitEvent)) {
                            debugLog('Form submission was cancelled');
                            isProcessing = false;
                            return;
                        }

                        // If form has onsubmit handler, it might handle the submission
                        if (form.onsubmit) {
                            form.onsubmit();
                        } else {
                            form.submit();
                        }
                    } else {
                        debugLog('No form found, triggering change event');
                        // If no form, try to trigger change event to simulate upload
                        const changeEvent = new Event('change', { bubbles: true });
                        fileInput.dispatchEvent(changeEvent);
                    }

                    showNotification('Ảnh đã được cắt và đang upload!', 3000);
                    isProcessing = false;
                });
            }).catch(error => {
                debugLog('Failed to load Cropper.js:', error);
                showNotification('Không thể tải thư viện cắt ảnh. Upload ảnh gốc.', 5000);

                // Fallback: upload original file
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                const changeEvent = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(changeEvent);
                isProcessing = false;
            });
        }, true); // Use capture phase to intercept before other handlers
    }

    /**
     * Initialize the module
     */
    function init() {
        debugLog('Initializing Profile Banner Cropper module');

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
    
        // Handle profile changer element
        const profileChanger = document.querySelector('.profile-changer');
        debugLog('Profile changer element found:', !!profileChanger, profileChanger);
        if (profileChanger) {
            debugLog('Showing profile changer element');
            profileChanger.classList.remove('none'); // Show the profile changer element
            profileChanger.addEventListener('click', () => {
                debugLog('Profile changer clicked');
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.position = 'absolute';
                fileInput.style.left = '-9999px';
                document.body.appendChild(fileInput);
    
                // Add the change event listener as in interceptFileInput
                fileInput.addEventListener('change', function(e) {
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
    
                    // Load Cropper.js and show modal
                    loadCropperLibrary().then(() => {
                        createCropModal(file, function(croppedFile) {
                            debugLog('Uploading cropped image...');

                            // Find the actual file input on the page to upload the cropped image
                            const actualFileInput = document.querySelector('input[type="file"][id="user_cover_file"]') || document.querySelector('input[type="file"]');
                            if (actualFileInput) {
                                debugLog('Found actual file input:', actualFileInput.id, actualFileInput.name);
                                // Create new FileList with cropped file
                                const dt = new DataTransfer();
                                dt.items.add(croppedFile);
                                actualFileInput.files = dt.files;
        
                                // Trigger upload
                                const form = actualFileInput.closest('form');
                                if (form) {
                                    debugLog('Found form, submitting:', form);
                                    // Try to submit the form
                                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                    if (!form.dispatchEvent(submitEvent)) {
                                        debugLog('Form submission was cancelled');
                                        return;
                                    }
        
                                    // If form has onsubmit handler, it might handle the submission
                                    if (form.onsubmit) {
                                        form.onsubmit();
                                    } else {
                                        form.submit();
                                    }
                                } else {
                                    debugLog('No form found, triggering change event');
                                    // If no form, try to trigger change event to simulate upload
                                    const changeEvent = new Event('change', { bubbles: true });
                                    actualFileInput.dispatchEvent(changeEvent);
                                }
        
                                showNotification('Ảnh đã được cắt và đang upload!', 3000);
                            } else {
                                debugLog('No file input found for upload');
                                showNotification('Không tìm thấy input để upload ảnh.', 5000);
                            }

                            // Remove the temporary input after a delay to allow processing
                            setTimeout(() => {
                                if (fileInput && fileInput.parentElement) {
                                    fileInput.remove();
                                }
                            }, 1000);
                        });
                    }).catch(error => {
                        debugLog('Failed to load Cropper.js:', error);
                        showNotification('Không thể tải thư viện cắt ảnh.', 5000);
                        fileInput.remove();
                    });
                });
    
                fileInput.click();
            });
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

        debugLog('Profile Banner Cropper module initialized');
    }

    // Export module
    window.HMTProfileBannerCropper = {
        init: init,
        loadCropperLibrary: loadCropperLibrary,
        createCropModal: createCropModal,
        interceptFileInput: interceptFileInput
    };

    // Auto-initialize
    init();

})();