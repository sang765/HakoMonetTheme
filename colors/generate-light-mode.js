// File này dùng để chuyển đổi và tạo file light mode từ dark mode sang light mode. KHÔNG sử dụng trong userscript trực tiếp.


const fs = require('fs');
const path = require('path');

// Function to reverse palette numbers (1000 - x)
function reversePaletteNumbers(content) {
    return content.replace(/(palette|defaultPalette)\[(\d+)\]/g, (match, prefix, num) => {
        const reversed = 1000 - parseInt(num);
        return `${prefix}[${reversed}]`;
    });
}

// Function to add createTintedWhite function
function addCreateTintedWhiteFunction(content) {
    const createTintedWhiteFunction = `
    // Function to create tinted white using config color for light mode
    function createTintedWhite(tintColor) {
        const BASE_WHITE = '#ffffff';    // Base white color
        const TINT_STRENGTH = 0.1;       // 10% tint strength for subtle effect

        // Convert hex to RGB
        const white = hexToRgb(BASE_WHITE);
        const tint = hexToRgb(tintColor);

        // Mix: 90% white + 10% tint color
        const result = {
            r: Math.round(white.r * (1 - TINT_STRENGTH) + tint.r * TINT_STRENGTH),
            g: Math.round(white.g * (1 - TINT_STRENGTH) + tint.g * TINT_STRENGTH),
            b: Math.round(white.b * (1 - TINT_STRENGTH) + tint.b * TINT_STRENGTH)
        };

        return rgbToHex(result.r, result.g, result.b);
    }

    // Helper functions for color conversion
    function hexToRgb(hex) {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x =>
            x.toString(16).padStart(2, '0')
        ).join('');
    }
`;

    // Insert after the isValidColor function
    const insertPoint = content.indexOf('    function isValidColor(color) {');
    if (insertPoint === -1) return content;

    const endOfIsValidColor = content.indexOf('    }', insertPoint) + 5;
    return content.slice(0, endOfIsValidColor) + createTintedWhiteFunction + content.slice(endOfIsValidColor);
}

// Function to modify color application functions to use tinted white
function modifyColorApplication(content) {
    // Modify applyCurrentColorScheme
    content = content.replace(
        /(function applyCurrentColorScheme\(\) \{[\s\S]*?const defaultColor = window\.HMTConfig \? window\.HMTConfig\.getDefaultColor\(\) : '[^']+';[\s\S]*?debugLog\('Áp dụng màu từ config:', defaultColor\);[\s\S]*?if \(!isValidColor\(defaultColor\)\) \{[\s\S]*?return;[\s\S]*?}\s*)(\/\/ Tạo Monet palette từ màu config[\s\S]*?const monetPalette = MonetAPI\.generateMonetPalette\(defaultColor\);)/,
        (match, before, paletteLine) => {
            return before +
`            // Create tinted white using config color for light mode
            const tintedWhite = createTintedWhite(defaultColor);
            debugLog('Tinted white for light mode:', tintedWhite);

            // Tạo Monet palette từ màu config
            const monetPalette = MonetAPI.generateMonetPalette(tintedWhite);`;
        }
    );

    // Modify applyAvatarColorScheme
    content = content.replace(
        /(if \(isValidColor\(dominantColor\)\) \{[\s\S]*?const monetPalette = MonetAPI\.generateMonetPalette\(dominantColor\);)/,
        (match) => {
            return match.replace(
                'const monetPalette = MonetAPI.generateMonetPalette(dominantColor);',
                `                // Create tinted white using avatar color for light mode
                const tintedWhite = createTintedWhite(dominantColor);
                debugLog('Tinted white từ avatar cho light mode:', tintedWhite);

                const monetPalette = MonetAPI.generateMonetPalette(tintedWhite);`
            );
        }
    );

    return content;
}

// Function to change theme detection from dark to light
function changeThemeDetection(content) {
    // Change window.ThemeDetector.isDark() to !window.ThemeDetector.isDark()
    content = content.replace(
        /if \(!window\.__themeDetectorLoaded \|\| !window\.ThemeDetector \|\| !window\.ThemeDetector\.isDark\(\)\) \{/g,
        'if (window.__themeDetectorLoaded && window.ThemeDetector && window.ThemeDetector.isDark()) {'
    );

    // Change the negation in event listeners
    content = content.replace(
        /if \(!window\.__themeDetectorLoaded \|\| !window\.ThemeDetector \|\| !window\.ThemeDetector\.isDark\(\)\) \{[\s\S]*?debugLog\('Not in dark mode, skipping color application'\);[\s\S]*?return;[\s\S]*?\}/g,
        (match) => {
            return match.replace(
                "debugLog('Not in dark mode, skipping color application');",
                "debugLog('In dark mode, skipping light theme application');"
            ).replace(
                'if (!window.__themeDetectorLoaded || !window.ThemeDetector || !window.ThemeDetector.isDark()) {',
                'if (window.__themeDetectorLoaded && window.ThemeDetector && window.ThemeDetector.isDark()) {'
            );
        }
    );

    return content;
}

// Main function to generate light mode file
function generateLightMode(darkFilePath, lightFilePath) {
    console.log(`Đang tạo file light mode từ ${darkFilePath} đến ${lightFilePath}`);

    let content = fs.readFileSync(darkFilePath, 'utf8');

    // Step 1: Change theme detection
    content = changeThemeDetection(content);

    // Step 2: Add createTintedWhite function
    content = addCreateTintedWhiteFunction(content);

    // Step 3: Modify color application functions
    content = modifyColorApplication(content);

    // Step 4: Reverse palette numbers
    content = reversePaletteNumbers(content);

    // Write the light mode file
    fs.writeFileSync(lightFilePath, content);
    console.log(`Generated ${lightFilePath}`);
}

// Generate both light mode files
generateLightMode('colors/general-dark.js', 'colors/general-light.js');
generateLightMode('colors/info-truyen-dark.js', 'colors/info-truyen-light.js');

console.log('Đã tạo file light mode thành công!');