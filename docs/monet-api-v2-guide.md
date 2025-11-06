# MonetAPI v2.0 - Advanced Color System Guide

## 🚀 Tổng Quan MonetAPI v2.0

MonetAPI v2.0 là phiên bản nâng cấp toàn diện của hệ thống màu sắc HakoMonetTheme, cung cấp các tính năng nâng cao cho color science, performance optimization, và developer experience.

### ✨ Tính Năng v2.0
- **🎨 Advanced Color Science**: HSL color models, color harmony analysis
- **⚡ Performance & Caching**: Intelligent caching system với 5min TTL
- **🎭 Smart Theme Integration**: Automatic system theme detection
- **🔧 Developer Tools**: Debug panel, color analysis, live preview
- **♿ Accessibility & Standards**: WCAG compliance checking, color blindness simulation
- **🔄 Backward Compatible**: 100% compatible với v1.0 methods

### 📁 Cấu Trúc File Hiện Tại
```
api/
├── monet.js              # MonetAPI v2.0-integrated (V1 + V2 combined)
├── monet-v2.js          # Original V2 standalone (preserved)
└── monet-test.js        # Comprehensive test suite
```

### 🌐 API Access Methods
```javascript
// Method 1: Direct v2 namespace access
const enhanced = MonetAPI.v2.generateMaterialPalette('#3F51B5');

// Method 2: v2 prefixed convenience methods
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const harmonies = MonetAPI.v2GetColorHarmonies('#3F51B5');

// Method 3: Unified utility methods
const formatted = MonetAPI.formatColor('#3F51B5', 'rgb');
```

---

## 🎯 Quick Start Guide

### Basic v2.0 Usage
```javascript
// Enhanced palette generation
const enhancedPalette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const color = enhancedPalette[500];

// Access multiple color formats
console.log(color.hex);      // "#3F51B5"
console.log(color.rgb);      // {r: 63, g: 81, b: 181}
console.log(color.hsl);      // {h: 239, s: 48, l: 48}
console.log(color.rgba(0.8)); // "rgba(63, 81, 181, 0.8)"

// Built-in color analysis
console.log(color.isLight());              // false
console.log(color.getOptimalTextColor());  // "#FFFFFF"
console.log(color.contrast('#FFFFFF'));   // 3.45
```

### Integration với v1.0
```javascript
// v1.0 methods vẫn hoạt động bình thường
const v1Palette = MonetAPI.generateMonetPalette('#3F51B5');
const v1Rgba = MonetAPI.paletteToRgba(v1Palette, 500, 0.8);

// v2.0 enhanced features
const v2Enhanced = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const v2Accessibility = MonetAPI.v2CheckAccessibility('#3F51B5');

// Kết hợp cả hai
function createCompleteTheme(baseColor) {
    const v1Palette = MonetAPI.generateMonetPalette(baseColor);
    const v2Enhanced = MonetAPI.v2CreateEnhancedPalette(baseColor);
    
    return {
        // v1.0 compatibility
        primary: v1Palette[500],
        overlay: MonetAPI.paletteToRgba(v1Palette, 500, 0.1),
        
        // v2.0 enhancements
        onPrimary: v2Enhanced[500].getOptimalTextColor(),
        harmonies: MonetAPI.v2GetColorHarmonies(baseColor),
        accessibility: v2Accessibility.violations.length === 0
    };
}
```

---

## 🎨 Advanced Color Science

### Color Harmony Analysis
```javascript
const baseColor = '#3F51B5';

// Get all harmony schemes
const harmonies = MonetAPI.v2GetColorHarmonies(baseColor);
console.log(harmonies);
// {
//   complementary: "#B5313F",
//   analogous: ["#3F51B5", "#513FB5", "#513FB5", "#B53F7A"],
//   triadic: ["#3F51B5", "#B53F3F", "#3FB553"],
//   splitComplementary: ["#3F51B5", "#B53F7A", "#B5813F"]
// }

// Generate harmony palette
const harmonyPalette = MonetAPI.v2GenerateHarmonyPalette(baseColor, 'triadic');
```

### Color Blending & Mixing
```javascript
// Direct color blending
const blended = MonetAPI.v2ColorUtils.blendColors('#3F51B5', '#FF5722', 0.3);
// 30% FF5722 + 70% 3F51B5

// Enhanced palette blending
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const mixedColor = palette[500].blend('#FF5722', 0.5);

// Advanced color formats
console.log(MonetAPI.v2FormatColor('#3F51B5', 'hsl'));     // "hsl(239, 48%, 48%)"
console.log(MonetAPI.v2FormatColor('#3F51B5', 'hsla'));    // "hsla(239, 48%, 48%, 1)"
```

---

## ⚡ Performance & Caching System

### Intelligent Caching
```javascript
// Automatic caching for performance
const palette1 = MonetAPI.v2CreateEnhancedPalette('#3F51B5');  // Cache miss - generate new
const palette2 = MonetAPI.v2CreateEnhancedPalette('#3F51B5');  // Cache hit - instant return

// Cache statistics
const stats = MonetAPI.v2GetCacheStats();
console.log(stats);
// {
//   size: 1,
//   maxSize: 100,
//   entries: [{"key": "material_#3F51B5_", "age": 1234, "ttl": 300000}]
// }

// Cache management
MonetAPI.v2ClearCache();
MonetAPI.v2PreloadColors(['#3F51B5', '#FF5722', '#4CAF50']);
```

### Custom Palette Options
```javascript
// Advanced palette generation options
const customPalette = MonetAPI.v2CreateEnhancedPalette('#3F51B5', {
    algorithm: 'material3',     // 'material3', 'material2', 'custom'
    chromaFactor: 1.2,         // 0.1 - 2.0 (saturation multiplier)
    temperature: 10,           // -100 to 100 (warm/cool adjustment)
    tones: [100, 300, 500, 700, 900]  // Custom tone selection
});
```

---

## 🎭 Smart Theme Management

### System Theme Detection
```javascript
// Automatic theme detection
const currentTheme = MonetAPI.v2GetCurrentTheme();  // 'auto', 'light', 'dark'
console.log('System theme:', MonetAPI.v2.systemTheme);  // 'light' or 'dark'

// Set theme preference
MonetAPI.v2SetThemePreference('dark');

// Listen for theme changes
document.addEventListener('monetThemeChanged', (event) => {
    console.log('Theme changed:', event.detail);
    // event.detail: { systemTheme, currentTheme, effectiveTheme }
});
```

### Time-based Color Adaptation
```javascript
// Automatic color temperature adjustment
const timeAdjusted = MonetAPI.v2AdaptToTime('#3F51B5');
// Morning (7-17): Cooler colors
// Evening/Night (18-6): Warmer colors

// Manual temperature control
const warmPalette = MonetAPI.v2CreateEnhancedPalette('#3F51B5', { temperature: 20 });
const coolPalette = MonetAPI.v2CreateEnhancedPalette('#3F51B5', { temperature: -20 });
```

---

## 🔧 Developer Experience

### Debug Panel & Analysis
```javascript
// Create interactive debug panel
const debugPanel = MonetAPI.v2CreateColorDebugger();

// Detailed color analysis
MonetAPI.v2LogColorAnalysis('#3F51B5', 'Primary Color Analysis');
// Console output includes:
// - Material palette breakdown
// - Color harmony relationships
// - Accessibility compliance
// - Theme adaptation status
```

### Enhanced Color Objects
```javascript
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');

// Rich color object with multiple representations
const color = palette[500];

// Direct format access
console.log(color.hex);              // "#3F51B5"
console.log(color.rgb);              // {r: 63, g: 81, b: 181}
console.log(color.hsl);              // {h: 239, s: 48, l: 48}
console.log(color.luminance);        // 0.134

// Color manipulation methods
console.log(color.isLight());                    // false
console.log(color.getOptimalTextColor());        // "#FFFFFF"
console.log(color.contrast('#FFFFFF'));         // 3.45
console.log(color.blend('#FF5722', 0.5));       // Blended color

// Quick format conversion
console.log(color.rgba(0.8));      // "rgba(63, 81, 181, 0.8)"
console.log(color.hsla(0.9));      // "hsla(239, 48%, 48%, 0.9)"

// Palette-level utilities
console.log(palette.getRGBA(500, 0.8));      // Quick rgba access
console.log(palette.getHSLA(700, 0.9));      // Quick hsla access
console.log(palette.getContrast(500, 900));  // Inter-color contrast
```

---

## ♿ Accessibility & Standards

### WCAG Compliance Analysis
```javascript
const accessibility = MonetAPI.v2CheckAccessibility('#3F51B5');
console.log(accessibility);
// {
//   palette: enhancedPalette,
//   recommendations: [...],
//   violations: [...],
//   wcagCompliance: [
//     {
//       ratio: 4.32,
//       passes: { normal: false, large: true },
//       level: "AA",
//       recommendation: "Increase contrast ratio",
//       context: "Light background, dark text",
//       background: "#F3F4F6",
//       foreground: "#1F2937"
//     }
//   ],
//   optimizedPalette: enhancedPalette
// }

// Use accessibility-optimized palette
const accessiblePalette = accessibility.optimizedPalette;
```

### Color Blindness Support
```javascript
// Simulate different types of color blindness
const simulations = {
    deuteranopia: MonetAPI.v2AccessibilityAnalyzer.simulateColorBlindness('#3F51B5', 'deuteranopia'),
    protanopia: MonetAPI.v2AccessibilityAnalyzer.simulateColorBlindness('#3F51B5', 'protanopia'),
    tritanopia: MonetAPI.v2AccessibilityAnalyzer.simulateColorBlindness('#3F51B5', 'tritanopia')
};

// Automatic optimal text color selection
const optimalText = MonetAPI.v2AccessibilityAnalyzer.getOptimalTextColor('#3F51B5');
console.log(optimalText);  // "#000000" or "#FFFFFF" based on best contrast
```

---

## 🛠 Advanced Usage Patterns

### Complete Theme System
```javascript
class AdvancedThemeManager {
    constructor(baseColor) {
        this.baseColor = baseColor;
        this.setupThemeListeners();
    }
    
    setupThemeListeners() {
        document.addEventListener('monetThemeChanged', (event) => {
            this.updateTheme(event.detail.effectiveTheme);
        });
    }
    
    updateTheme(effectiveTheme) {
        const palette = MonetAPI.v2CreateEnhancedPalette(this.baseColor);
        const accessibility = MonetAPI.v2CheckAccessibility(this.baseColor);
        const harmonies = MonetAPI.v2GetColorHarmonies(this.baseColor);
        const isDark = effectiveTheme === 'dark';
        
        const css = `
            :root {
                --primary: ${palette[500].hex};
                --primary-light: ${palette[300].hex};
                --primary-dark: ${palette[700].hex};
                
                /* Surface colors */
                --surface: ${isDark ? palette[800].hex : palette[100].hex};
                --surface-variant: ${isDark ? palette[700].hex : palette[200].hex};
                --background: ${isDark ? palette[900].hex : palette[50].hex};
                
                /* Text colors */
                --on-primary: ${palette[500].getOptimalTextColor()};
                --on-surface: ${isDark ? palette[100].hex : palette[900].hex};
                
                /* RGBA versions */
                --primary-overlay: ${palette[500].rgba(0.1)};
                --scrim: ${palette[900].rgba(0.6)};
                
                /* Harmony colors */
                --complementary: ${harmonies.complementary};
                --analogous: ${harmonies.analogous[1]};
                
                /* Accessibility status */
                --accessibility-compliant: ${accessibility.violations.length === 0};
            }
            
            /* Auto-adjust for accessibility issues */
            ${accessibility.violations.length > 0 ? `
            .accessibility-fix {
                color: ${isDark ? '#FFFFFF' : '#000000'} !important;
            }
            ` : ''}
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                --primary-overlay: ${palette[500].rgba(0.6)};
            }
        `;
        
        GM_addStyle(css);
    }
    
    changeBaseColor(newColor) {
        this.baseColor = newColor;
        MonetAPI.v2LogColorAnalysis(newColor, 'Color Changed');
        this.updateTheme(MonetAPI.v2GetCurrentTheme());
    }
}
```

### Performance Optimization Pattern
```javascript
class OptimizedColorManager {
    constructor() {
        this.paletteCache = new Map();
        this.usageStats = new Map();
    }
    
    getPalette(baseColor) {
        const normalizedColor = baseColor.toLowerCase();
        
        // Track usage for optimization
        this.usageStats.set(normalizedColor, 
            (this.usageStats.get(normalizedColor) || 0) + 1);
        
        // Use v2 caching system
        const palette = MonetAPI.v2CreateEnhancedPalette(normalizedColor);
        
        return palette;
    }
    
    preloadPopularColors(colors) {
        // Use v2 preloading system
        MonetAPI.v2PreloadColors(colors);
        
        // Additional custom caching
        colors.forEach(color => {
            if (!this.paletteCache.has(color)) {
                this.paletteCache.set(color, 
                    MonetAPI.v2CreateEnhancedPalette(color));
            }
        });
    }
    
    getCacheInfo() {
        return {
            v2Cache: MonetAPI.v2GetCacheStats(),
            customCache: {
                size: this.paletteCache.size,
                usageStats: Object.fromEntries(this.usageStats)
            }
        };
    }
}
```

---

## 📊 API Reference v2.0

### Core v2.0 Methods
```javascript
// Enhanced palette generation
MonetAPI.v2CreateEnhancedPalette(baseColor, options)
MonetAPI.v2GenerateHarmonyPalette(baseColor, scheme)

// Color harmony analysis
MonetAPI.v2GetColorHarmonies(baseColor)

// Accessibility features
MonetAPI.v2CheckAccessibility(baseColor)

// Theme management
MonetAPI.v2GetCurrentTheme()
MonetAPI.v2SetThemePreference(preference)

// Performance utilities
MonetAPI.v2GetCacheStats()
MonetAPI.v2ClearCache()
MonetAPI.v2PreloadColors(colorArray)

// Color utilities
MonetAPI.v2FormatColor(color, format)
MonetAPI.v2AdaptToTime(color)

// Developer tools
MonetAPI.v2CreateColorDebugger()
MonetAPI.v2LogColorAnalysis(color, context)
```

### Utility Classes
```javascript
// Access to utility classes
MonetAPI.v2ColorUtils              // Static color utilities
MonetAPI.v2AccessibilityAnalyzer   // Accessibility analysis
MonetAPI.v2ColorHarmonyAnalyzer    // Color harmony analysis
MonetAPI.v2Cache                   // Cache management
```

### v2 Namespace
```javascript
// Direct access to v2 core class
MonetAPI.v2.generateMaterialPalette(baseColor, options)
MonetAPI.v2.getColorHarmonies(baseColor)
MonetAPI.v2.checkAccessibility(baseColor)
// ... all v2 methods available
```

---

## 🚀 Migration Guide v1.0 → v2.0

### Simple Migration
```javascript
// v1.0 code (still works)
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const rgba = MonetAPI.paletteToRgba(palette, 500, 0.8);

// Enhanced v2.0 equivalent
const enhanced = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const color = enhanced[500];
const rgba_v2 = color.rgba(0.8);

// Backward compatibility check
console.log(MonetAPI.version);  // "2.0-integrated"
console.log(rgba === rgba_v2);  // true - same output
```

### Progressive Enhancement Pattern
```javascript
function createModernTheme(baseColor) {
    // v1.0 methods - guaranteed to work
    const v1Palette = MonetAPI.generateMonetPalette(baseColor);
    const v1Overlay = MonetAPI.paletteToRgba(v1Palette, 500, 0.1);
    
    // v2.0 enhancements - when available
    const enhancements = {
        enhanced: null,
        accessibility: null,
        harmonies: null
    };
    
    try {
        enhancements.enhanced = MonetAPI.v2CreateEnhancedPalette(baseColor);
        enhancements.accessibility = MonetAPI.v2CheckAccessibility(baseColor);
        enhancements.harmonies = MonetAPI.v2GetColorHarmonies(baseColor);
    } catch (error) {
        console.warn('v2.0 features not available:', error);
    }
    
    return {
        // v1.0 base functionality
        primary: v1Palette[500],
        overlay: v1Overlay,
        
        // v2.0 enhancements (optional)
        ...enhancements,
        
        // Unified API
        getPrimaryRGBA: (alpha = 1) => 
            enhancements.enhanced ? 
                enhancements.enhanced[500].rgba(alpha) : 
                MonetAPI.paletteToRgba(v1Palette, 500, alpha)
    };
}
```

---

## 🐛 Debugging v2.0

### Enable Debug Mode
```javascript
// Enable debug logging
if (typeof GM_setValue === 'function') {
    GM_setValue('debug_mode', true);
}

// Manual debug commands
MonetAPI.v2LogColorAnalysis('#3F51B5', 'Debug Session');

// Create debug panel
const panel = MonetAPI.v2CreateColorDebugger();
```

### Performance Monitoring
```javascript
// Cache monitoring
setInterval(() => {
    const stats = MonetAPI.v2GetCacheStats();
    console.log(`Cache: ${stats.size}/${stats.maxSize} entries`);
    
    if (stats.size > stats.maxSize * 0.8) {
        console.warn('Cache nearing capacity, consider cleanup');
        MonetAPI.v2ClearCache();
    }
}, 60000); // Check every minute
```

---

## 🔮 Best Practices

### 1. Performance Optimization
```javascript
// Preload frequently used colors
MonetAPI.v2PreloadColors(['#3F51B5', '#FF5722', '#4CAF50']);

// Use specific tones when possible
const minimalPalette = MonetAPI.v2CreateEnhancedPalette('#3F51B5', {
    tones: [100, 300, 500, 700, 900]
});

// Monitor cache usage
const stats = MonetAPI.v2GetCacheStats();
```

### 2. Accessibility First
```javascript
// Always check accessibility
const accessibility = MonetAPI.v2CheckAccessibility(baseColor);
if (accessibility.violations.length > 0) {
    console.warn('Accessibility violations detected:', accessibility.violations);
    // Use optimized palette
    baseColor = accessibility.optimizedPalette[500].hex;
}
```

### 3. Error Handling
```javascript
try {
    const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
    const accessibility = MonetAPI.v2CheckAccessibility('#3F51B5');
} catch (error) {
    // Fallback to v1.0
    const palette = MonetAPI.generateMonetPalette('#3F51B5');
    console.error('v2.0 features unavailable, using v1.0 fallback:', error);
}
```

---

## 🏁 Kết Luận

MonetAPI v2.0 cung cấp một hệ thống màu sắc toàn diện với:

### ✨ Core Benefits
- **🚀 Performance**: Intelligent caching system
- **🎨 Advanced Color Science**: HSL models, color harmony
- **♿ Accessibility**: WCAG compliance, color blindness support
- **🛠 Developer Experience**: Debug tools, comprehensive analysis
- **🔄 Backward Compatibility**: 100% compatible với v1.0

### 🎯 Use Cases
- **Design Systems**: Comprehensive color management
- **Accessibility Compliance**: Automatic WCAG checking
- **Performance Optimization**: Intelligent caching
- **Developer Productivity**: Debug tools and analysis

MonetAPI v2.0 sẵn sàng để nâng cao trải nghiệm màu sắc trong mọi project!