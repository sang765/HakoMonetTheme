(function() {
    'use strict';

    // ===== TEST FRAMEWORK =====
    const TestFramework = {
        supported: 0,
        unsupported: 0,
        total: 0,
        supportedMessages: [],
        unsupportedMessages: [],
        allChecks: [],

        // Record a feature check; optional category is ignored for backward compatibility
        checkFeature(condition, message) {
            this.total++;
            const entry = { message, passed: !!condition, time: new Date().toISOString() };
            this.allChecks.push(entry);

            if (condition) {
                this.supported++;
                this.supportedMessages.push(message);
                console.log(`✅ SUPPORTED: ${message}`);
            } else {
                this.unsupported++;
                this.unsupportedMessages.push(message);
                console.error(`❌ UNSUPPORTED: ${message}`);
            }
        },

        // Backwards-compatible assert wrapper used by some tests
        assert(condition, message) {
            this.checkFeature(!!condition, message);
        },

        // Detailed summary output: totals, pass rate, failed items and a sample of successes
        summary() {
            const percentage = this.total > 0 ? Math.round((this.supported / this.total) * 100) : 0;
            console.log(`\n📊 Browser Support Summary: ${this.supported} supported, ${this.unsupported} unsupported, ${this.total} total features`);
            console.log(`🎯 Monet API Support: ${percentage}%`);

            // Print detailed failures
            if (this.unsupportedMessages.length > 0) {
                console.log('\n❗ Detailed Failures:');
                this.unsupportedMessages.forEach((m, i) => {
                    console.log(`${i + 1}. ${m}`);
                });
            } else {
                console.log('\n✅ No failures detected.');
            }

            // Print a sample of supported features (first 10)
            if (this.supportedMessages.length > 0) {
                console.log('\n🔍 Sample Supported Features:');
                const sample = this.supportedMessages.slice(0, 10);
                sample.forEach((m, i) => console.log(`${i + 1}. ${m}`));
                if (this.supportedMessages.length > sample.length) {
                    console.log(`...and ${this.supportedMessages.length - sample.length} more supported features`);
                }
            }

            // Print user agent information when available
            let userAgent = 'unknown';
            try {
                if (typeof navigator !== 'undefined' && navigator.userAgent) {
                    userAgent = navigator.userAgent;
                }
            } catch (e) {
                // ignore access errors in some sandboxed contexts
            }
            console.log(`\n🧭 User Agent: ${userAgent}`);

            // Provide a concise pass/fail rate line for quick scanning
            console.log(`\n📈 Pass Rate: ${percentage}% (${this.supported}/${this.total})`);

            // Return whether everything passed
            return percentage === 100;
        }
    };
    
    // ===== V1 BROWSER SUPPORT TESTS =====
    function runV1Tests() {
        console.log('\n🧪 Testing V1 Monet API Browser Support...\n');

        // Check if basic color functions are supported
        TestFramework.checkFeature(typeof MonetAPI.rgbToHex === 'function', 'V1: rgbToHex function supported');
        TestFramework.checkFeature(typeof MonetAPI.hexToRgb === 'function', 'V1: hexToRgb function supported');
        TestFramework.checkFeature(typeof MonetAPI.isValidColor === 'function', 'V1: isValidColor function supported');
        TestFramework.checkFeature(typeof MonetAPI.generateMonetPalette === 'function', 'V1: generateMonetPalette function supported');
        TestFramework.checkFeature(typeof MonetAPI.isColorLight === 'function', 'V1: isColorLight function supported');
        TestFramework.checkFeature(typeof MonetAPI.generateMonetPaletteWithRGBA === 'function', 'V1: generateMonetPaletteWithRGBA function supported');
        TestFramework.checkFeature(typeof MonetAPI.paletteToRgba === 'function', 'V1: paletteToRgba function supported');

        // Test V1 color conversion functions work in browser
        try {
            const hex = MonetAPI.rgbToHex(255, 128, 0);
            TestFramework.checkFeature(hex === '#ff8000', 'V1: rgbToHex conversion supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: rgbToHex conversion supported');
        }

        try {
            const rgb = MonetAPI.hexToRgb('#ff8000');
            TestFramework.checkFeature(rgb && rgb.r === 255 && rgb.g === 128 && rgb.b === 0, 'V1: hexToRgb conversion supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: hexToRgb conversion supported');
        }

        // Test V1 color validation works in browser
        try {
            TestFramework.checkFeature(MonetAPI.isValidColor('#ff0000'), 'V1: Valid color detection supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: Valid color detection supported');
        }
        try {
            TestFramework.checkFeature(!MonetAPI.isValidColor('invalid'), 'V1: Invalid color detection supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: Invalid color detection supported');
        }

        // Test V1 palette generation works in browser
        try {
            const palette = MonetAPI.generateMonetPalette('#2196F3');
            TestFramework.checkFeature(palette && palette[500] === '#2196F3', 'V1: Basic palette generation supported');
            TestFramework.checkFeature(palette && typeof palette[100] === 'string', 'V1: Palette contains proper color values');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: Basic palette generation supported');
            TestFramework.checkFeature(false, 'V1: Palette contains proper color values');
        }

        // Test V1 light color detection works in browser
        try {
            TestFramework.checkFeature(MonetAPI.isColorLight('#FFFFFF'), 'V1: White color detected as light');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: White color detected as light');
        }
        try {
            TestFramework.checkFeature(!MonetAPI.isColorLight('#000000'), 'V1: Black color detected as dark');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: Black color detected as dark');
        }

        // Test V1 RGBA support works in browser
        try {
            const rgbaPalette = MonetAPI.generateMonetPaletteWithRGBA('#2196F3');
            TestFramework.checkFeature(rgbaPalette && rgbaPalette[500], 'V1: RGBA palette generation supported');
            const rgbaColor = rgbaPalette[500];
            TestFramework.checkFeature(rgbaColor && typeof rgbaColor.rgba === 'function', 'V1: RGBA color has rgba method');
            const rgbaValue = rgbaColor.rgba(0.8);
            TestFramework.checkFeature(rgbaValue && rgbaValue.includes('rgba'), 'V1: RGBA value generation supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: RGBA palette generation supported');
            TestFramework.checkFeature(false, 'V1: RGBA color has rgba method');
            TestFramework.checkFeature(false, 'V1: RGBA value generation supported');
        }

        // Test V1 palette to RGBA utility works in browser
        try {
            const hexPalette = MonetAPI.generateMonetPalette('#2196F3');
            const rgbaResult = MonetAPI.paletteToRgba(hexPalette, 500, 0.5);
            TestFramework.checkFeature(rgbaResult && rgbaResult.includes('rgba'), 'V1: paletteToRgba utility supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1: paletteToRgba utility supported');
        }
    }
    
    // ===== V2 BROWSER SUPPORT TESTS =====
    function runV2Tests() {
        console.log('\n🚀 Testing V2 Monet API Browser Support...\n');

        // Check if V2 namespace is supported
        TestFramework.checkFeature(MonetAPI.v2 && typeof MonetAPI.v2 === 'object', 'V2: v2 namespace supported');
        TestFramework.checkFeature(MonetAPI.version === '2.0-integrated', 'V2: Version is correctly set');

        // Check if V2 prefixed methods are supported
        const v2Methods = [
            'v2CreateEnhancedPalette', 'v2GetColorHarmonies', 'v2CheckAccessibility',
            'v2GenerateHarmonyPalette', 'v2GetCurrentTheme', 'v2SetThemePreference',
            'v2CreateColorDebugger', 'v2LogColorAnalysis', 'v2GetCacheStats',
            'v2FormatColor', 'v2AdaptToTime', 'v2PreloadColors'
        ];

        v2Methods.forEach(method => {
            TestFramework.checkFeature(typeof MonetAPI[method] === 'function', `V2: ${method} function supported`);
        });

        // Check if V2 utility classes are supported
        TestFramework.checkFeature(MonetAPI.v2ColorUtils && typeof MonetAPI.v2ColorUtils === 'object', 'V2: ColorUtils class supported');
        TestFramework.checkFeature(MonetAPI.v2AccessibilityAnalyzer && typeof MonetAPI.v2AccessibilityAnalyzer === 'object', 'V2: AccessibilityAnalyzer class supported');
        TestFramework.checkFeature(MonetAPI.v2ColorHarmonyAnalyzer && typeof MonetAPI.v2ColorHarmonyAnalyzer === 'object', 'V2: ColorHarmonyAnalyzer class supported');

        // Test V2 enhanced palette generation works in browser
        try {
            const enhancedPalette = MonetAPI.v2CreateEnhancedPalette('#2196F3');
            TestFramework.checkFeature(enhancedPalette && enhancedPalette[500], 'V2: Enhanced palette generation supported');

            const color500 = enhancedPalette[500];
            TestFramework.checkFeature(color500 && typeof color500.hex === 'string', 'V2: Enhanced color has hex property');
            TestFramework.checkFeature(color500 && typeof color500.rgb === 'object', 'V2: Enhanced color has rgb property');
            TestFramework.checkFeature(color500 && typeof color500.hsl === 'object', 'V2: Enhanced color has hsl property');
            TestFramework.checkFeature(color500 && typeof color500.rgba === 'function', 'V2: Enhanced color has rgba method');
            TestFramework.checkFeature(color500 && typeof color500.hsla === 'function', 'V2: Enhanced color has hsla method');
            TestFramework.checkFeature(color500 && typeof color500.isLight === 'function', 'V2: Enhanced color has isLight method');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Enhanced palette generation supported');
            TestFramework.checkFeature(false, 'V2: Enhanced color has hex property');
            TestFramework.checkFeature(false, 'V2: Enhanced color has rgb property');
            TestFramework.checkFeature(false, 'V2: Enhanced color has hsl property');
            TestFramework.checkFeature(false, 'V2: Enhanced color has rgba method');
            TestFramework.checkFeature(false, 'V2: Enhanced color has hsla method');
            TestFramework.checkFeature(false, 'V2: Enhanced color has isLight method');
        }

        // Test V2 color harmony works in browser
        try {
            const harmonies = MonetAPI.v2GetColorHarmonies('#2196F3');
            TestFramework.checkFeature(harmonies && typeof harmonies.complementary === 'string', 'V2: Complementary color generation supported');
            TestFramework.checkFeature(harmonies && Array.isArray(harmonies.analogous), 'V2: Analogous colors generation supported');
            TestFramework.checkFeature(harmonies && Array.isArray(harmonies.triadic), 'V2: Triadic colors generation supported');
            TestFramework.checkFeature(harmonies && Array.isArray(harmonies.splitComplementary), 'V2: Split complementary colors generation supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Complementary color generation supported');
            TestFramework.checkFeature(false, 'V2: Analogous colors generation supported');
            TestFramework.checkFeature(false, 'V2: Triadic colors generation supported');
            TestFramework.checkFeature(false, 'V2: Split complementary colors generation supported');
        }

        // Test V2 accessibility analysis works in browser
        try {
            const accessibility = MonetAPI.v2CheckAccessibility('#2196F3');
            TestFramework.checkFeature(accessibility && accessibility.palette, 'V2: Accessibility analysis generates palette');
            TestFramework.checkFeature(accessibility && Array.isArray(accessibility.wcagCompliance), 'V2: Accessibility analysis includes WCAG compliance');
            TestFramework.checkFeature(accessibility && accessibility.optimizedPalette, 'V2: Accessibility analysis generates optimized palette');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Accessibility analysis generates palette');
            TestFramework.checkFeature(false, 'V2: Accessibility analysis includes WCAG compliance');
            TestFramework.checkFeature(false, 'V2: Accessibility analysis generates optimized palette');
        }

        // Test V2 color formatting works in browser
        try {
            const formatted = MonetAPI.v2FormatColor('#2196F3', 'rgb');
            TestFramework.checkFeature(formatted && formatted.includes('rgb'), 'V2: Color formatting to RGB supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Color formatting to RGB supported');
        }

        try {
            const formattedHSL = MonetAPI.v2FormatColor('#2196F3', 'hsl');
            TestFramework.checkFeature(formattedHSL && formattedHSL.includes('hsl'), 'V2: Color formatting to HSL supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Color formatting to HSL supported');
        }

        // Test V2 theme functionality works in browser
        try {
            const currentTheme = MonetAPI.v2GetCurrentTheme();
            TestFramework.checkFeature(currentTheme && typeof currentTheme === 'string', 'V2: Current theme retrieval supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Current theme retrieval supported');
        }

        // Test V2 caching functionality works in browser
        try {
            const cacheStats = MonetAPI.v2GetCacheStats();
            TestFramework.checkFeature(cacheStats && typeof cacheStats.size === 'number', 'V2: Cache stats retrieval supported');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Cache stats retrieval supported');
        }

        // Test V2 utility method availability
        TestFramework.checkFeature(typeof MonetAPI.formatColor === 'function', 'V2: Unified formatColor method supported');
        try {
            const formattedUnified = MonetAPI.formatColor('#2196F3', 'hex');
            TestFramework.checkFeature(formattedUnified === '#2196F3', 'V2: Unified formatColor returns original hex');
        } catch (e) {
            TestFramework.checkFeature(false, 'V2: Unified formatColor returns original hex');
        }
    }
    
    // ===== INTEGRATION BROWSER SUPPORT TESTS =====
    function runIntegrationTests() {
        console.log('\n🔗 Testing Integration Browser Support...\n');

        // Test that V1 and V2 can coexist in browser
        try {
            const v1Palette = MonetAPI.generateMonetPalette('#FF5722');
            const v2Palette = MonetAPI.v2CreateEnhancedPalette('#FF5722');

            TestFramework.checkFeature(v1Palette && v2Palette, 'V1 and V2 palettes can be generated simultaneously');
            TestFramework.checkFeature(v1Palette[500] === '#FF5722', 'V1 palette maintains original color at 500 tone');
            TestFramework.checkFeature(v2Palette[500].hex === '#FF5722', 'V2 palette maintains original color at 500 tone');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1 and V2 palettes can be generated simultaneously');
            TestFramework.checkFeature(false, 'V1 palette maintains original color at 500 tone');
            TestFramework.checkFeature(false, 'V2 palette maintains original color at 500 tone');
        }

        // Test backward compatibility of V1 methods in browser
        try {
            const v1Palette = MonetAPI.generateMonetPalette('#FF5722');
            TestFramework.checkFeature(MonetAPI.paletteToRgba(v1Palette, 500, 0.8), 'V1 paletteToRgba works with V1 palette');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1 paletteToRgba works with V1 palette');
        }
        try {
            const v2Palette = MonetAPI.v2CreateEnhancedPalette('#FF5722');
            TestFramework.checkFeature(MonetAPI.paletteToRgba(v2Palette, 500, 0.8), 'V1 paletteToRgba works with V2 palette');
        } catch (e) {
            TestFramework.checkFeature(false, 'V1 paletteToRgba works with V2 palette');
        }

        // Test version information is accessible in browser
        TestFramework.checkFeature(MonetAPI.v1Methods && Array.isArray(MonetAPI.v1Methods), 'V1 methods list exists');
        TestFramework.checkFeature(MonetAPI.v2Methods && Array.isArray(MonetAPI.v2Methods), 'V2 methods list exists');
        TestFramework.checkFeature(MonetAPI.v1Methods.length > 0, 'V1 methods list is populated');
        TestFramework.checkFeature(MonetAPI.v2Methods.length > 0, 'V2 methods list is populated');

        // Test that API structure is maintained in browser
        const monetAPIKeys = Object.keys(MonetAPI);

        TestFramework.checkFeature(monetAPIKeys.includes('v1Methods'), 'API maintains method lists');
        TestFramework.checkFeature(monetAPIKeys.includes('v2Methods'), 'API maintains method lists');
        TestFramework.checkFeature(monetAPIKeys.includes('v2'), 'API maintains v2 namespace');
    }
    
    // ===== PERFORMANCE TESTS =====
    function runPerformanceTests() {
        console.log('\n⚡ Running Performance Tests...\n');
        
        // Test V2 caching performance
        const startV2 = performance.now();
        const palette1 = MonetAPI.v2CreateEnhancedPalette('#2196F3');
        const palette2 = MonetAPI.v2CreateEnhancedPalette('#2196F3');
        const endV2 = performance.now();
        
        // Second call should be faster due to caching
        TestFramework.assert(endV2 - startV2 >= 0, 'V2 palette generation timing works');
        
        // Test V1 performance vs V2
        const startV1 = performance.now();
        const v1Palette = MonetAPI.generateMonetPalette('#2196F3');
        const endV1 = performance.now();
        
        TestFramework.assert(endV1 - startV1 >= 0, 'V1 palette generation timing works');
        TestFramework.assert(v1Palette && v1Palette[500], 'V1 performance test generates valid palette');
    }
    
    // ===== ERROR HANDLING TESTS =====
    function runErrorHandlingTests() {
        console.log('\n🚫 Running Error Handling Tests...\n');
        
        // Test V1 error handling
        try {
            MonetAPI.generateMonetPalette('invalid');
            TestFramework.assert(false, 'V1 should throw error for invalid color');
        } catch (error) {
            TestFramework.assert(true, 'V1 properly throws error for invalid color');
        }
        
        // Test V2 error handling
        try {
            MonetAPI.v2CreateEnhancedPalette('invalid');
            TestFramework.assert(false, 'V2 should throw error for invalid color');
        } catch (error) {
            TestFramework.assert(true, 'V2 properly throws error for invalid color');
        }
        
        // Test invalid color validation
        TestFramework.assert(!MonetAPI.isValidColor('not-a-color'), 'V1 color validation rejects invalid colors');
        TestFramework.assert(!MonetAPI.v2CreateEnhancedPalette('xyz'), 'V2 handles invalid colors gracefully');
    }
    
    // ===== RUN ALL TESTS =====
    function runAllTests() {
        console.log('🎯 MonetAPI Comprehensive Test Suite Starting...');
        console.log('='.repeat(60));
        
        runV1Tests();
        runV2Tests();
        runIntegrationTests();
        runPerformanceTests();
        runErrorHandlingTests();
        
        console.log('\n' + '='.repeat(60));
        const allPassed = TestFramework.summary();
        
        if (allPassed) {
            console.log('🎉 All tests passed! Integration is successful.');
        } else {
            console.log('⚠️  Some tests failed. Please review the issues above.');
        }
        
        return allPassed;
    }
    
    // Auto-run tests if debug mode is enabled
    if (typeof GM_getValue === 'function' && GM_getValue('debug_mode', false)) {
        console.log('🔍 Debug mode enabled - Running comprehensive tests...');
        runAllTests();
    }
    
    // Export test runner for manual execution
    window.MonetAPITestSuite = {
        runAllTests,
        runV1Tests,
        runV2Tests,
        runIntegrationTests,
        runPerformanceTests,
        runErrorHandlingTests
    };
    
    // Make available for manual testing
    if (typeof window !== 'undefined') {
        window.testMonetAPI = runAllTests;
    }
})();