(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[KeyboardShortcuts]', ...args);
        }
    }

    // Keyboard shortcuts mapping
    const shortcuts = {
        'h': () => clickElement('[class="rd_sd-button_item"]'), // Home - Go to story info page
        's': () => clickElement('#rd-setting_icon'), // Settings
        'f': () => clickElement('#rd-fullscreen_icon'), // Fullscreen
        'c': () => clickElement('#rd-info_icon'), // Chapter List
        'b': () => clickElement('#rd-bookmark_icon'), // Bookmark
        'e': () => clickElement('a[href*="editchapter"]') // Edit Chapter
    };

    function clickElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.click();
            debugLog(`Clicked element: ${selector}`);
        } else {
            debugLog(`Element not found: ${selector}`);
        }
    }

    function isTypingInInput() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'INPUT' ||
            activeElement.contentEditable === 'true' ||
            activeElement.closest('.tox-tinymce') !== null // TinyMCE editor
        );
    }

    function handleKeydown(event) {
        // Only handle single key presses without modifiers
        if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
            return;
        }

        // Check if user is typing in an input field
        if (isTypingInInput()) {
            debugLog('Ignoring key press - user is typing');
            return;
        }

        const key = event.key.toLowerCase();
        const action = shortcuts[key];

        if (action) {
            event.preventDefault();
            action();
        }
    }

    function initializeKeyboardShortcuts() {
        // Check if we're on the reading page
        if (!document.querySelector('.rd-basic_icon.row')) {
            debugLog('Not on reading page, skipping keyboard shortcuts initialization');
            return;
        }

        debugLog('Initializing keyboard shortcuts for reading page...');

        // Add keydown event listener
        document.addEventListener('keydown', handleKeydown);

        debugLog('Keyboard shortcuts initialized');
    }

    // Export functions
    window.HMTKeyboardShortcuts = {
        initialize: initializeKeyboardShortcuts
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeKeyboardShortcuts);
    } else {
        initializeKeyboardShortcuts();
    }

    debugLog('Keyboard shortcuts module loaded');

})();