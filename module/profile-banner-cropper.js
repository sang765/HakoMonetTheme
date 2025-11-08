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
        modal.innerHTML = `
            <div class="hmt-crop-modal">
                <div class="hmt-crop-header">
                    <h3>Cắt ảnh profile banner</h3>
                    <button class="hmt-crop-close">&times;</button>
                </div>
                <div class="hmt-crop-body">
                    <div class="hmt-crop-container">
                        <img id="hmt-crop-image" alt="Profile banner preview">
                    </div>
                    <div class="hmt-crop-info">
                        <p>Kích thước tối thiểu: ${MIN_WIDTH}x${MIN_HEIGHT}px</p>
                        <p>Tỷ lệ: ${ASPECT_RATIO}:1</p>
                        <div class="hmt-crop-preview">
                            <h4>Xem trước:</h4>
                            <div class="hmt-crop-preview-box"></div>
                        </div>
                    </div>
                </div>
                <div class="hmt-crop-footer">
                    <button class="hmt-crop-cancel">Hủy</button>
                    <button class="hmt-crop-upload">Cắt & Upload</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const img = modal.querySelector('#hmt-crop-image');
        const closeBtn = modal.querySelector('.hmt-crop-close');
        const cancelBtn = modal.querySelector('.hmt-crop-cancel');
        const uploadBtn = modal.querySelector('.hmt-crop-upload');
        const previewBox = modal.querySelector('.hmt-crop-preview-box');

        let cropper = null;

        // Load image
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;

            img.onload = function() {
                // Validate image dimensions
                if (img.naturalWidth < MIN_WIDTH || img.naturalHeight < MIN_HEIGHT) {
                    showNotification(`Ảnh quá nhỏ! Yêu cầu tối thiểu ${MIN_WIDTH}x${MIN_HEIGHT}px. Ảnh hiện tại: ${img.naturalWidth}x${img.naturalHeight}px`, 5000);
                    modal.remove();
                    return;
                }

                // Initialize Cropper
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
        };
        reader.readAsDataURL(imageFile);

        // Event handlers
        function closeModal() {
            if (cropper) {
                cropper.destroy();
            }
            modal.remove();
        }

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        uploadBtn.addEventListener('click', function() {
            if (!cropper) return;

            const canvas = cropper.getCroppedCanvas({
                width: MIN_WIDTH,
                height: MIN_HEIGHT,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });

            if (canvas) {
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
            }
        });

        // ESC key handler
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

        debugLog('Found profile banner input:', fileInput);

        // Intercept change event
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

                // Create new FileList with cropped file
                const dt = new DataTransfer();
                dt.items.add(croppedFile);
                fileInput.files = dt.files;

                // Trigger upload
                const form = fileInput.closest('form');
                if (form) {
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
                    // If no form, try to trigger change event to simulate upload
                    const changeEvent = new Event('change', { bubbles: true });
                    fileInput.dispatchEvent(changeEvent);
                }

                showNotification('Ảnh đã được cắt và đang upload!', 3000);
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
        debugLog('Is profile page:', isProfilePage);

        if (!isProfilePage) {
            debugLog('Not on profile page, skipping initialization');
            return;
        }
    
        // Handle profile changer element
        const profileChanger = document.querySelector('.profile-changer');
        debugLog('Profile changer element found:', !!profileChanger);
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
                            const actualFileInput = document.querySelector('input[type="file"]');
                            if (actualFileInput) {
                                // Create new FileList with cropped file
                                const dt = new DataTransfer();
                                dt.items.add(croppedFile);
                                actualFileInput.files = dt.files;

                                // Trigger upload
                                const form = actualFileInput.closest('form');
                                if (form) {
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
                                    // If no form, try to trigger change event to simulate upload
                                    const changeEvent = new Event('change', { bubbles: true });
                                    actualFileInput.dispatchEvent(changeEvent);
                                }

                                showNotification('Ảnh đã được cắt và đang upload!', 3000);
                            } else {
                                showNotification('Không tìm thấy input để upload ảnh.', 5000);
                            }

                            // Remove the temporary input
                            fileInput.remove();
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