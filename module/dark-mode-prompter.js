(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[DarkModePrompter]', ...args);
        }
    }

    class DarkModePrompter {
        constructor() {
            this.init();
        }

        init() {
            debugLog('Dark Mode Prompter module initialized');

            // Wait for ThemeDetector to be loaded
            if (typeof window.ThemeDetector !== 'undefined') {
                this.checkAndPrompt();
            } else {
                // Wait for it to load
                const checkInterval = setInterval(() => {
                    if (typeof window.ThemeDetector !== 'undefined') {
                        clearInterval(checkInterval);
                        this.checkAndPrompt();
                    }
                }, 100);
            }
        }

        checkAndPrompt() {
            const currentTheme = window.ThemeDetector.getCurrentTheme();
            const dismissed = GM_getValue('dark_mode_prompt_dismissed', false);

            if (currentTheme === 'light' && !dismissed) {
                this.showPromptDialog();
            }
        }

        showPromptDialog() {
            // Create dialog container
            const dialog = document.createElement('div');
            dialog.id = 'hmt-dark-mode-prompt';
            dialog.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                max-width: 400px;
                font-family: Arial, sans-serif;
                color: #333;
                transition: background-color 0.3s ease, color 0.3s ease;
            `;

            // Header with icon and large text
            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            `;

            const icon = document.createElement('span');
            icon.textContent = '⚠️';
            icon.style.cssText = `
                font-size: 24px;
                margin-right: 10px;
            `;
            header.appendChild(icon);

            const largeText = document.createElement('span');
            largeText.textContent = 'Này bạn gì đó ơi!!!';
            largeText.style.cssText = `
                font-size: 18px;
                font-weight: bold;
                color: #063c30;
                transition: color 0.3s ease;
            `;
            header.appendChild(largeText);

            dialog.appendChild(header);

            // Message
            const message = document.createElement('p');
            message.textContent = 'Hako Monet Theme sẽ nhìn đẹp hơn nếu trang web chạy với giao diện dark mode. Bạn có muốn đổi sang dark mode không?';
            message.style.cssText = `
                margin: 0 0 15px 0;
                transition: color 0.3s ease;
            `;
            dialog.appendChild(message);

            // Bottom container
            const bottomContainer = document.createElement('div');
            bottomContainer.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            // Checkbox container (bottom left)
            const checkboxContainer = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'hmt-dont-show-again';
            const label = document.createElement('label');
            label.htmlFor = 'hmt-dont-show-again';
            label.textContent = 'Không hiển thị lại';
            label.style.cssText = `
                font-size: 12px;
                margin-left: 5px;
                cursor: pointer;
                transition: color 0.3s ease;
            `;
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            bottomContainer.appendChild(checkboxContainer);

            // Buttons container (bottom right)
            const buttonsContainer = document.createElement('div');
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Hủy';
            cancelBtn.style.cssText = `
                margin-right: 10px;
                padding: 5px 15px;
                background: #f0f0f0;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
            `;
            cancelBtn.onclick = () => {
                if (checkbox.checked) {
                    GM_setValue('dark_mode_prompt_dismissed', true);
                }
                dialog.remove();
            };

            const switchBtn = document.createElement('button');
            switchBtn.textContent = 'Đổi sang dark mode';
            switchBtn.style.cssText = `
                padding: 5px 15px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            switchBtn.onmouseover = () => {
                dialog.style.background = '#000';
                dialog.style.color = '#fff';
                largeText.style.color = '#fff';
                message.style.color = '#fff';
                label.style.color = '#fff';
            };
            switchBtn.onmouseout = () => {
                dialog.style.background = '#fff';
                dialog.style.color = '#333';
                largeText.style.color = '#d9534f';
                message.style.color = '#333';
                label.style.color = '#333';
            };
            switchBtn.onclick = () => {
                // Set cookie
                document.cookie = 'night_mode=true; path=/; max-age=31536000'; // 1 year
                // Also set localStorage if needed
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('night_mode', 'true');
                }
                // Reload page
                window.location.reload();
            };

            buttonsContainer.appendChild(cancelBtn);
            buttonsContainer.appendChild(switchBtn);
            bottomContainer.appendChild(buttonsContainer);

            dialog.appendChild(bottomContainer);

            // Append to body
            document.body.appendChild(dialog);
        }
    }

    // Create instance
    const darkModePrompter = new DarkModePrompter();

    // Expose to window if needed
    window.HMTDarkModePrompter = darkModePrompter;

    debugLog('DarkModePrompter module loaded');

})();