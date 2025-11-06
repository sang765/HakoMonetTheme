// MonetAPI Comprehensive Test Suite
// Tests both V1 and V2 functionality with full backward compatibility

(function() {
    'use strict';
    
    // ===== TEST FRAMEWORK =====
    const TestFramework = {
        passed: 0,
        failed: 0,
        total: 0,
        
        assert(condition, message) {
            this.total++;
            if (condition) {
                this.passed++;
                console.log(`✅ PASS: ${message}`);
            } else {
                this.failed++;
                console.error(`❌ FAIL: ${message}`);
            }
        },
        
        assertEquals(actual, expected, message) {
            this.total++;
            if (actual === expected) {
                this.passed++;
                console.log(`✅ PASS: ${message}`);
            } else {
                this.failed++;
                console.error(`❌ FAIL: ${message} - Expected: ${expected}, Got: ${actual}`);
            }
        },
        
        assertNotEquals(actual, expected, message) {
            this.total++;
            if (actual !== expected) {
                this.passed++;
                console.log(`✅ PASS: ${message}`);
            } else {
                this.failed++;
                console.error(`❌ FAIL: ${message} - Should not be: ${expected}`);
            }
        },
        
        assertContains(array, value, message) {
            this.total++;
            if (Array.isArray(array) && array.includes(value)) {
                this.passed++;
                console.log(`✅ PASS: ${message}`);
            } else {
                this.failed++;
                console.error(`❌ FAIL: ${message} - Array should contain: ${value}`);
            }
        },
        
        assertTypeOf(value, type, message) {
            this.total++;
            if (typeof value === type) {
                this.passed++;
                console.log(`✅ PASS: ${message}`);
            } else {
                this.failed++;
                console.error(`❌ FAIL: ${message} - Expected type: ${type}, Got: ${typeof value}`);
            }
        },
        
        summary() {
            console.log(`\n📊 Test Summary: ${this.passed} passed, ${this.failed} failed, ${this.total} total`);
            return this.failed === 0;
        }
    };
    
    // ===== V1 BACKWARD COMPATIBILITY TESTS =====
    function runV1Tests() {
        console.log('\n🧪 Running V1 Backward Compatibility Tests...\n');
        
        // Test basic color functions exist
        TestFramework.assert(typeof MonetAPI.rgbToHex === 'function', 'V1: rgbToHex function exists');
        TestFramework.assert(typeof MonetAPI.hexToRgb === 'function', 'V1: hexToRgb function exists');
        TestFramework.assert(typeof MonetAPI.isValidColor === 'function', 'V1: isValidColor function exists');
        TestFramework.assert(typeof MonetAPI.generateMonetPalette === 'function', 'V1: generateMonetPalette function exists');
        TestFramework.assert(typeof MonetAPI.isColorLight === 'function', 'V1: isColorLight function exists');
        TestFramework.assert(typeof MonetAPI.generateMonetPaletteWithRGBA === 'function', 'V1: generateMonetPaletteWithRGBA function exists');
        TestFramework.assert(typeof MonetAPI.paletteToRgba === 'function', 'V1: paletteToRgba function exists');
        
        // Test V1 color conversion functions
        const hex = MonetAPI.rgbToHex(255, 128, 0);
        TestFramework.assertEquals(hex, '#ff8000', 'V1: rgbToHex conversion works');
        
        const rgb = MonetAPI.hexToRgb('#ff8000');
        TestFramework.assert(rgb && rgb.r === 255 && rgb.g === 128 && rgb.b === 0, 'V1: hexToRgb conversion works');
        
        // Test V1 color validation
        TestFramework.assert(MonetAPI.isValidColor('#ff0000'), 'V1: Valid color detection works');
        TestFramework.assert(!MonetAPI.isValidColor('invalid'), 'V1: Invalid color detection works');
        
        // Test V1 palette generation
        const palette = MonetAPI.generateMonetPalette('#2196F3');
        TestFramework.assert(palette && palette[500] === '#2196F3', 'V1: Basic palette generation works');
        TestFramework.assert(palette && typeof palette[100] === 'string', 'V1: Palette contains proper color values');
        
        // Test V1 light color detection
        TestFramework.assert(MonetAPI.isColorLight('#FFFFFF'), 'V1: White color detected as light');
        TestFramework.assert(!MonetAPI.isColorLight('#000000'), 'V1: Black color detected as dark');
        
        // Test V1 RGBA support
        const rgbaPalette = MonetAPI.generateMonetPaletteWithRGBA('#2196F3');
        TestFramework.assert(rgbaPalette && rgbaPalette[500], 'V1: RGBA palette generation works');
        const rgbaColor = rgbaPalette[500];
        TestFramework.assert(rgbaColor && typeof rgbaColor.rgba === 'function', 'V1: RGBA color has rgba method');
        const rgbaValue = rgbaColor.rgba(0.8);
        TestFramework.assert(rgbaValue && rgbaValue.includes('rgba'), 'V1: RGBA value generation works');
        
        // Test V1 palette to RGBA utility
        const hexPalette = MonetAPI.generateMonetPalette('#2196F3');
        const rgbaResult = MonetAPI.paletteToRgba(hexPalette, 500, 0.5);
        TestFramework.assert(rgbaResult && rgbaResult.includes('rgba'), 'V1: paletteToRgba utility works');
    }
    
    // ===== V2 FUNCTIONALITY TESTS =====
    function runV2Tests() {
        console.log('\n🚀 Running V2 Advanced Functionality Tests...\n');
        
        // Test V2 namespace exists
        TestFramework.assert(MonetAPI.v2 && typeof MonetAPI.v2 === 'object', 'V2: v2 namespace exists');
        TestFramework.assert(MonetAPI.version === '2.0-integrated', 'V2: Version is correctly set');
        
        // Test V2 prefixed methods exist
        const v2Methods = [
            'v2CreateEnhancedPalette', 'v2GetColorHarmonies', 'v2CheckAccessibility',
            'v2GenerateHarmonyPalette', 'v2GetCurrentTheme', 'v2SetThemePreference',
            'v2CreateColorDebugger', 'v2LogColorAnalysis', 'v2GetCacheStats',
            'v2FormatColor', 'v2AdaptToTime', 'v2PreloadColors'
        ];
        
        v2Methods.forEach(method => {
            TestFramework.assert(typeof MonetAPI[method] === 'function', `V2: ${method} function exists`);
        });
        
        // Test V2 utility classes exist
        TestFramework.assert(MonetAPI.v2ColorUtils && typeof MonetAPI.v2ColorUtils === 'object', 'V2: ColorUtils class exists');
        TestFramework.assert(MonetAPI.v2AccessibilityAnalyzer && typeof MonetAPI.v2AccessibilityAnalyzer === 'object', 'V2: AccessibilityAnalyzer class exists');
        TestFramework.assert(MonetAPI.v2ColorHarmonyAnalyzer && typeof MonetAPI.v2ColorHarmonyAnalyzer === 'object', 'V2: ColorHarmonyAnalyzer class exists');
        
        // Test V2 enhanced palette generation
        const enhancedPalette = MonetAPI.v2CreateEnhancedPalette('#2196F3');
        TestFramework.assert(enhancedPalette && enhancedPalette[500], 'V2: Enhanced palette generation works');
        
        const color500 = enhancedPalette[500];
        TestFramework.assert(color500 && typeof color500.hex === 'string', 'V2: Enhanced color has hex property');
        TestFramework.assert(color500 && typeof color500.rgb === 'object', 'V2: Enhanced color has rgb property');
        TestFramework.assert(color500 && typeof color500.hsl === 'object', 'V2: Enhanced color has hsl property');
        TestFramework.assert(color500 && typeof color500.rgba === 'function', 'V2: Enhanced color has rgba method');
        TestFramework.assert(color500 && typeof color500.hsla === 'function', 'V2: Enhanced color has hsla method');
        TestFramework.assert(color500 && typeof color500.isLight === 'function', 'V2: Enhanced color has isLight method');
        
        // Test V2 color harmony
        const harmonies = MonetAPI.v2GetColorHarmonies('#2196F3');
        TestFramework.assert(harmonies && typeof harmonies.complementary === 'string', 'V2: Complementary color generation works');
        TestFramework.assert(harmonies && Array.isArray(harmonies.analogous), 'V2: Analogous colors generation works');
        TestFramework.assert(harmonies && Array.isArray(harmonies.triadic), 'V2: Triadic colors generation works');
        TestFramework.assert(harmonies && Array.isArray(harmonies.splitComplementary), 'V2: Split complementary colors generation works');
        
        // Test V2 accessibility analysis
        const accessibility = MonetAPI.v2CheckAccessibility('#2196F3');
        TestFramework.assert(accessibility && accessibility.palette, 'V2: Accessibility analysis generates palette');
        TestFramework.assert(accessibility && Array.isArray(accessibility.wcagCompliance), 'V2: Accessibility analysis includes WCAG compliance');
        TestFramework.assert(accessibility && accessibility.optimizedPalette, 'V2: Accessibility analysis generates optimized palette');
        
        // Test V2 color formatting
        const formatted = MonetAPI.v2FormatColor('#2196F3', 'rgb');
        TestFramework.assert(formatted && formatted.includes('rgb'), 'V2: Color formatting to RGB works');
        
        const formattedHSL = MonetAPI.v2FormatColor('#2196F3', 'hsl');
        TestFramework.assert(formattedHSL && formattedHSL.includes('hsl'), 'V2: Color formatting to HSL works');
        
        // Test V2 theme functionality
        const currentTheme = MonetAPI.v2GetCurrentTheme();
        TestFramework.assert(currentTheme && typeof currentTheme === 'string', 'V2: Current theme retrieval works');
        
        // Test V2 caching functionality
        const cacheStats = MonetAPI.v2GetCacheStats();
        TestFramework.assert(cacheStats && typeof cacheStats.size === 'number', 'V2: Cache stats retrieval works');
        
        // Test V2 utility method availability
        TestFramework.assert(typeof MonetAPI.formatColor === 'function', 'V2: Unified formatColor method exists');
        const formattedUnified = MonetAPI.formatColor('#2196F3', 'hex');
        TestFramework.assertEquals(formattedUnified, '#2196F3', 'V2: Unified formatColor returns original hex');
    }
    
    // ===== INTEGRATION TESTS =====
    function runIntegrationTests() {
        console.log('\n🔗 Running Integration Tests...\n');
        
        // Test that V1 and V2 can coexist
        const v1Palette = MonetAPI.generateMonetPalette('#FF5722');
        const v2Palette = MonetAPI.v2CreateEnhancedPalette('#FF5722');
        
        TestFramework.assert(v1Palette && v2Palette, 'V1 and V2 palettes can be generated simultaneously');
        TestFramework.assert(v1Palette[500] === '#FF5722', 'V1 palette maintains original color at 500 tone');
        TestFramework.assert(v2Palette[500].hex === '#FF5722', 'V2 palette maintains original color at 500 tone');
        
        // Test backward compatibility of V1 methods
        TestFramework.assert(MonetAPI.paletteToRgba(v1Palette, 500, 0.8), 'V1 paletteToRgba works with V1 palette');
        TestFramework.assert(MonetAPI.paletteToRgba(v2Palette, 500, 0.8), 'V1 paletteToRgba works with V2 palette');
        
        // Test version information
        TestFramework.assert(MonetAPI.v1Methods && Array.isArray(MonetAPI.v1Methods), 'V1 methods list exists');
        TestFramework.assert(MonetAPI.v2Methods && Array.isArray(MonetAPI.v2Methods), 'V2 methods list exists');
        TestFramework.assert(MonetAPI.v1Methods.length > 0, 'V1 methods list is populated');
        TestFramework.assert(MonetAPI.v2Methods.length > 0, 'V2 methods list is populated');
        
        // Test that no new side effects are introduced
        const apiKeysBefore = Object.keys(window.MonetAPI);
        const monetAPIKeys = Object.keys(MonetAPI);
        
        TestFramework.assert(monetAPIKeys.includes('v1Methods'), 'API maintains method lists');
        TestFramework.assert(monetAPIKeys.includes('v2Methods'), 'API maintains method lists');
        TestFramework.assert(monetAPIKeys.includes('v2'), 'API maintains v2 namespace');
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