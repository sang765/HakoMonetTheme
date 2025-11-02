(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[Fullscreen]', ...args);
        }
    }

    function createFullscreenButton() {
        const fullscreenButton = document.createElement('a');
        fullscreenButton.id = 'rd-fullscreen_icon';
        fullscreenButton.className = 'rd_sd-button_item';
        fullscreenButton.setAttribute('data-affect', '#');
        fullscreenButton.innerHTML = `
            <svg class="svg-inline--fa fa-expand" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="expand" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg="">
                <path fill="currentColor" d="M352 0c-12.9 0-23.1 10.2-23.1 23.1v46.3H23.1C10.2 69.4 0 79.6 0 92.5s10.2 23.1 23.1 23.1h305.8v46.3c0 12.9 10.2 23.1 23.1 23.1s23.1-10.2 23.1-23.1V23.1C375.1 10.2 364.9 0 352 0zM464 167.1H158.2c-12.9 0-23.1 10.2-23.1 23.1s10.2 23.1 23.1 23.1H464c12.9 0 23.1-10.2 23.1-23.1S476.9 167.1 464 167.1zM464 256H158.2c-12.9 0-23.1 10.2-23.1 23.1s10.2 23.1 23.1 23.1H464c12.9 0 23.1-10.2 23.1-23.1S476.9 256 464 256zM464 344.9H158.2c-12.9 0-23.1 10.2-23.1 23.1s10.2 23.1 23.1 23.1H464c12.9 0 23.1-10.2 23.1-23.1S476.9 344.9 464 344.9z"></path>
            </svg>
        `;

        return fullscreenButton;
    }

    function isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    }

    function enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else {
            throw new Error('Fullscreen API not supported');
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            throw new Error('Fullscreen API not supported');
        }
    }

    function toggleFullscreen() {
        try {
            if (isFullscreen()) {
                exitFullscreen();
                debugLog('Exited fullscreen mode');
            } else {
                enterFullscreen();
                debugLog('Entered fullscreen mode');
            }
        } catch (error) {
            debugLog('Fullscreen toggle failed:', error);
            showNotification('Lỗi', 'Trình duyệt không hỗ trợ chế độ toàn màn hình hoặc có lỗi xảy ra.', 5000);
        }
    }

    function showNotification(title, message, timeout = 3000) {
        if (typeof GM_notification === 'function') {
            GM_notification({
                title: title,
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
                <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${title}</h4>
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

    function initializeFullscreen() {
        debugLog('Initializing fullscreen module...');

        // Wait for the page to be ready
        const checkForSideIcon = () => {
            const sideIconSection = document.getElementById('rd-side_icon');
            const settingIcon = document.getElementById('rd-setting_icon');

            if (sideIconSection && settingIcon) {
                // Check if fullscreen button already exists
                if (document.getElementById('rd-fullscreen_icon')) {
                    debugLog('Fullscreen button already exists');
                    return;
                }

                // Create and insert the fullscreen button
                const fullscreenButton = createFullscreenButton();
                settingIcon.insertAdjacentElement('afterend', fullscreenButton);

                // Add click event listener
                fullscreenButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    toggleFullscreen();
                });

                debugLog('Fullscreen button added successfully');

                // Listen for fullscreen changes to update button state if needed
                document.addEventListener('fullscreenchange', updateButtonState);
                document.addEventListener('webkitfullscreenchange', updateButtonState);
                document.addEventListener('mozfullscreenchange', updateButtonState);
                document.addEventListener('MSFullscreenChange', updateButtonState);

            } else {
                // Retry after a short delay
                setTimeout(checkForSideIcon, 100);
            }
        };

        function updateButtonState() {
            // Optional: Update button appearance based on fullscreen state
            const button = document.getElementById('rd-fullscreen_icon');
            if (button) {
                if (isFullscreen()) {
                    button.style.opacity = '0.7';
                } else {
                    button.style.opacity = '1';
                }
            }
        }

        // Start checking
        checkForSideIcon();
    }

    // Export functions
    window.HMTFullscreen = {
        initialize: initializeFullscreen,
        toggleFullscreen: toggleFullscreen,
        isFullscreen: isFullscreen
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFullscreen);
    } else {
        initializeFullscreen();
    }

    debugLog('Fullscreen module loaded');

})();