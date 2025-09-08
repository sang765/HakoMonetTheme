// Test file for validating palette generation improvements
(function() {
    'use strict';

    console.log('Testing improved Monet palette generation...');

    // Test colors
    const testColors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#96CEB4', // Green
        '#FFEAA7', // Yellow
        '#DDA0DD', // Plum
        '#98D8C8', // Mint
        '#F7DC6F', // Light Yellow
        '#BB8FCE', // Light Purple
        '#85C1E9'  // Light Blue
    ];

    // Test both light and dark themes
    const themes = ['light', 'dark'];

    testColors.forEach(baseColor => {
        themes.forEach(theme => {
            console.log(`\n=== Testing ${baseColor} in ${theme} mode ===`);

            // Generate palette using the improved algorithm
            const palette = window.MonetAPI.generateMonetPalette(baseColor, theme);

            if (palette) {
                console.log('Generated palette:');
                Object.keys(palette).sort((a, b) => parseInt(a) - parseInt(b)).forEach(tone => {
                    console.log(`  ${tone}: ${palette[tone]}`);
                });

                // Validate key tones
                const keyTones = [0, 50, 100, 500, 900, 1000];
                console.log('\nKey tone validation:');
                keyTones.forEach(tone => {
                    if (palette[tone]) {
                        const rgb = window.MonetAPI.hexToRgb(palette[tone]);
                        if (rgb) {
                            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                            const isLight = brightness > 128;
                            console.log(`  Tone ${tone}: brightness=${brightness.toFixed(1)}, ${isLight ? 'light' : 'dark'}`);
                        }
                    }
                });
            } else {
                console.error(`Failed to generate palette for ${baseColor} in ${theme} mode`);
            }
        });
    });

    console.log('\n=== Palette generation test completed ===');
})();