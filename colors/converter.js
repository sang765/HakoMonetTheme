// USAGE: node converter.js colors/page-general-dark.js colors/page-general-light.js && node converter.js colors/page-general-dark.js colors/page-general-light.js
// node converter.js <input-dark-file> <input-light-file>

const fs = require('fs');
const path = require('path');

// Function to reverse palette values (excluding CSS variables)
function reversePalette(content) {
    // First, temporarily replace CSS variables section to avoid reversing it
    const cssVariablesPattern = /:root \{[\s\S]*?\}/;
    const cssVariablesMatch = content.match(cssVariablesPattern);
    let cssVariablesBackup = '';
    if (cssVariablesMatch) {
        cssVariablesBackup = cssVariablesMatch[0];
        content = content.replace(cssVariablesPattern, '___CSS_VARIABLES_PLACEHOLDER___');
    }

    // Reverse palette indices in the rest of the content
    content = content.replace(/palette\[(\d+)\]/g, (match, num) => {
        const reversed = 1000 - parseInt(num);
        return `palette[${reversed}]`;
    });

    // Restore CSS variables section
    if (cssVariablesBackup) {
        content = content.replace('___CSS_VARIABLES_PLACEHOLDER___', cssVariablesBackup);
    }

    return content;
}

// Function to reverse defaultPalette values
function reverseDefaultPalette(content) {
    return content.replace(/defaultPalette\[(\d+)\]/g, (match, num) => {
        const reversed = 1000 - parseInt(num);
        return `defaultPalette[${reversed}]`;
    });
}

// Function to change theme check
function changeThemeCheck(content) {
    // Invert theme detection logic for light mode (breaking change fix)
    content = content.replace(
        /if \(!window\.__themeDetectorLoaded \|\| !window\.ThemeDetector \|\| !window\.ThemeDetector\.isDark\(\)\) \{[\s\S]*?debugLog\('Not in dark mode, skipping color application'\);[\s\S]*?return;[\s\S]*?\}/g,
        `if (!window.__themeDetectorLoaded || !window.ThemeDetector || !window.ThemeDetector.isDark()) {
            debugLog('Not in light mode, skipping light theme application');
            return;
        }`
    );
    return content;
}

// Function to add createTintedWhite function
function addCreateTintedWhite(content) {
    const tintedWhiteFunction = `
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
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
}`;

    // Add after isValidColor function
    content = content.replace(
        /(function isValidColor\(color\) \{\s*return MonetAPI\.isValidColor\(color\);\s*\})/,
        `$1${tintedWhiteFunction}`
    );
    return content;
}

// Function to modify applyConfigColor
function modifyApplyConfigColor(content) {
    // Replace the entire function
    const oldFunction = `        // Hàm áp dụng màu từ config (không bao gồm avatar)
        function applyConfigColor() {
            const defaultColor = window.HMTConfig && window.HMTConfig.getDefaultColor ?
                window.HMTConfig.getDefaultColor() : '#FCE4EC';

            debugLog('Áp dụng màu từ config:', defaultColor);

            if (!isValidColor(defaultColor)) {
                debugLog('Màu không hợp lệ, sử dụng màu mặc định');
                applyDefaultColorScheme();
                return;
            }

            // Tạo Monet palette từ màu config
            const monetPalette = MonetAPI.generateMonetPalette(defaultColor);
            debugLog('Monet Palette từ config:', monetPalette);

            const isLightColor = MonetAPI.isColorLight(defaultColor);
            debugLog('Màu sáng?', isLightColor);

            applyMonetColorScheme(monetPalette, isLightColor);
        }`;

    const newFunction = `        // Hàm áp dụng màu từ config (không bao gồm avatar)
        function applyConfigColor() {
            const defaultColor = window.HMTConfig ? window.HMTConfig.getDefaultColor() : '#FCE4EC'; // Get color from config or fallback

            debugLog('Applying light color scheme with config color:', defaultColor);

            if (!isValidColor(defaultColor)) {
                debugLog('Invalid color, using default');
                applyDefaultColorScheme();
                return;
            }

            // Create tinted white using config color for light mode
            const tintedWhite = createTintedWhite(defaultColor);
            debugLog('Tinted white for light mode:', tintedWhite);

            const monetPalette = MonetAPI.generateMonetPalette(tintedWhite);
            debugLog('Monet Palette:', monetPalette);

            const isLightColor = MonetAPI.isColorLight(tintedWhite);
            debugLog('Is light color?', isLightColor);

            applyMonetColorScheme(monetPalette, isLightColor);
        }`;

    content = content.replace(oldFunction, newFunction);
    return content;
}

// Function to modify applyAvatarColorScheme
function modifyApplyAvatarColorScheme(content) {
    // Replace all occurrences of the pattern with tinted white logic
    content = content.replace(
        /const monetPalette = MonetAPI\.generateMonetPalette\(dominantColor\);\s*const isLightColor = MonetAPI\.isColorLight\(dominantColor\);\s*applyMonetColorScheme\(monetPalette, isLightColor\);/g,
        `// Create tinted white using color for light mode
                    const tintedWhite = createTintedWhite(dominantColor);
                    debugLog('Tinted white cho light mode:', tintedWhite);

                    const monetPalette = MonetAPI.generateMonetPalette(tintedWhite);
                    const isLightColor = MonetAPI.isColorLight(tintedWhite);
                    applyMonetColorScheme(monetPalette, isLightColor);`
    );

    return content;
}

// Function to change textColor in applyMonetColorScheme
function changeTextColor(content) {
    content = content.replace(
        /(const textColor = isLight \? '#000' : '#fff';)/,
        `const textColor = '#000000';`
    );
    return content;
}

// Function to change rgba values in CSS
function changeRgbaValues(content) {
    content = content.replace(/rgba\(31,31,31,0\)/g, 'rgba(255,255,255,0)');
    content = content.replace(/rgba\(42,42,42,0\)/g, 'rgba(248,249,250,0)');
    return content;
}

// Function to fix variable scope issues in applyDefaultColorScheme
function fixVariableScope(content) {
    // Replace ${palette[300]} with ${defaultPalette[300]} in applyDefaultColorScheme function only
    // Use a more specific pattern to target only within the applyDefaultColorScheme function
    const applyDefaultColorSchemePattern = /(function applyDefaultColorScheme\(\) \{[\s\S]*?function applyMonetColorScheme)/;
    content = content.replace(applyDefaultColorSchemePattern, (match) => {
        return match.replace(/\$\{palette\[300\]\}/g, '${defaultPalette[300]}');
    });
    return content;
}

// Function to change default color in applyDefaultColorScheme
function changeDefaultColor(content) {
    content = content.replace(/'#063c30'/g, "'#FCE4EC'");
    return content;
}

// Main conversion function
function convertDarkToLight(darkFilePath, lightFilePath) {
    let content = fs.readFileSync(darkFilePath, 'utf8');

    // Apply transformations in correct order
    content = changeThemeCheck(content);
    content = changeDefaultColor(content);
    content = addCreateTintedWhite(content);
    content = modifyApplyConfigColor(content);
    content = modifyApplyAvatarColorScheme(content);
    content = changeTextColor(content);
    content = changeRgbaValues(content);
    content = fixVariableScope(content);
    content = reversePalette(content);
    content = reverseDefaultPalette(content);

    // Write to light file
    fs.writeFileSync(lightFilePath, content, 'utf8');
    console.log(`Converted ${darkFilePath} to ${lightFilePath}`);
}

// Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const fs = require('fs');
    const path = require('path');

    if (args.length === 0) {
        // Convert all dark files to light files
        const colorsDir = path.dirname(__filename);
        const files = fs.readdirSync(colorsDir);

        const darkFiles = files.filter(file => file.endsWith('-dark.js'));
        if (darkFiles.length === 0) {
            console.log('No *-dark.js files found in colors directory');
            process.exit(1);
        }

        console.log(`Found ${darkFiles.length} dark mode file(s) to convert:`);
        darkFiles.forEach(file => console.log(`  - ${file}`));
        console.log('');

        let converted = 0;
        darkFiles.forEach(darkFile => {
            const baseName = darkFile.replace('-dark.js', '');
            const lightFile = `${baseName}-light.js`;
            const darkPath = path.join(colorsDir, darkFile);
            const lightPath = path.join(colorsDir, lightFile);

            try {
                convertDarkToLight(darkPath, lightPath);
                console.log(`✓ Converted ${darkFile} -> ${lightFile}`);
                converted++;
            } catch (error) {
                console.error(`✗ Failed to convert ${darkFile}: ${error.message}`);
            }
        });

        console.log(`\nConversion complete: ${converted}/${darkFiles.length} files converted successfully`);

    } else if (args.length === 1) {
        // If only one argument, use it as input and generate output name
        const darkFile = args[0];
        const lightFile = darkFile.replace('-dark.js', '-light.js');
        console.log(`Converting ${darkFile} -> ${lightFile}`);
        convertDarkToLight(darkFile, lightFile);

    } else if (args.length === 2) {
        // Both input and output specified
        const [darkFile, lightFile] = args;
        convertDarkToLight(darkFile, lightFile);

    } else {
        console.log('Usage: node converter.js [dark-file] [light-file]');
        console.log('  If no arguments: converts all *-dark.js files in colors directory to *-light.js');
        console.log('  If one argument: uses it as input, generates output by replacing -dark.js with -light.js');
        console.log('  If two arguments: converts first to second');
        process.exit(1);
    }
}

module.exports = { convertDarkToLight };