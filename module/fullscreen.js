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
            <svg class="svg-inline--fa fa-expand" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="expand" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-fa-i2svg="" fill="none">
                <path d="M4 4V3H3v1zm7.293 8.707a1 1 0 0 0 1.414-1.414zM5 10V4H3v6zM4 5h6V3H4zm-.707-.293 8 8 1.414-1.414-8-8z" fill="currentColor"/><path d="M4 20v1H3v-1zm7.293-8.707a1 1 0 0 1 1.414 1.414zM5 14v6H3v-6zm-1 5h6v2H4zm-.707.293 8-8 1.414 1.414-8 8z" fill="currentColor"/><path d="M20 4V3h1v1zm-7.293 8.707a1 1 0 0 1-1.414-1.414zM19 10V4h2v6zm1-5h-6V3h6zm.707-.293-8 8-1.414-1.414 8-8z" fill="currentColor"/><path d="M20 20v1h1v-1zm-7.293-8.707a1 1 0 0 0-1.414 1.414zM19 14v6h2v-6zm1 5h-6v2h6zm.707.293-8-8-1.414 1.414 8 8z" fill="currentColor"/>
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
        // Notification functionality removed from modules
        // Permission still granted in main userscript
        return;
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