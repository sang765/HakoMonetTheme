document.addEventListener('DOMContentLoaded', function() {
    // Step list counter
    const stepList = document.querySelector('.step-list');
    if (stepList) {
        stepList.style.counterReset = 'step';
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Color picker functionality
    const colorPicker = document.getElementById('color-picker');
    const colorPickerButton = document.querySelector('.color-picker-button');
    if (colorPicker && colorPickerButton) {
        colorPickerButton.addEventListener('click', function() {
            colorPicker.click();
        });
        colorPicker.addEventListener('input', function() {
            const selectedColor = this.value;
            document.documentElement.style.setProperty('--primary-color', selectedColor);
            // Update secondary color to a complementary shade
            const secondaryColor = adjustColor(selectedColor, -20);
            document.documentElement.style.setProperty('--secondary-color', secondaryColor);
            // Auto switch light/dark mode based on color brightness
            const isLight = isColorLight(selectedColor);
            if (isLight && document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
            } else if (!isLight && !document.body.classList.contains('dark-mode')) {
                document.body.classList.add('dark-mode');
            }
        });
    }

    // Function to adjust color brightness
    function adjustColor(color, amount) {
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;
        return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
    }

    // Function to determine if color is light
    function isColorLight(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    }
});