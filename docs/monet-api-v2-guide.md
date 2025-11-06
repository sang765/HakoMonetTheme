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
└── monet-test.js        # Comprehensive test suite
```

---

## 🎯 Color Extraction Methods v2.0

### 1. Sử Dụng API v2 để Trích Xuất HEX

#### Từ Base Color
```javascript
// Tạo enhanced palette từ màu cơ sở
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');

// Trích xuất HEX color ở tone cụ thể
const primaryHex = palette[500].hex;      // "#3F51B5"
const lightHex = palette[300].hex;        // "#7986CB"
const darkHex = palette[700].hex;         // "#3949AB"

// Sử dụng unified formatColor method
const formattedHex = MonetAPI.formatColor('#3F51B5', 'hex');  // "#3F51B5"
```

#### Trích Xuất HEX từ RGB
```javascript
// Sử dụng v2 utility class
const rgb = { r: 63, g: 81, b: 181 };
const hex = MonetAPI.v2ColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
console.log(hex);  // "#3F51B5"

// Hoặc từ color object
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const colorHex = palette[500].hex;  // "#3F51B5"
```

### 2. Sử Dụng API v2 để Trích Xuất RGB

#### Từ HEX Color
```javascript
// Trích xuất RGB từ hex
const rgb = MonetAPI.v2ColorUtils.hexToRgb('#3F51B5');
console.log(rgb);  // { r: 63, g: 81, b: 181 }

// Sử dụng enhanced palette
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const rgbFromPalette = palette[500].rgb;  // { r: 63, g: 81, b: 181 }

// Sử dụng unified formatColor method
const formattedRgb = MonetAPI.formatColor('#3F51B5', 'rgb');  // "rgb(63, 81, 181)"
```

#### Từ HSL Color
```javascript
const hsl = { h: 239, s: 48, l: 48 };
const rgb = MonetAPI.v2ColorUtils.hslToRgb(hsl.h, hsl.s, hsl.l);
console.log(rgb);  // { r: 63, g: 81, b: 181 }
```

### 3. Sử Dụng API v2 để Trích Xuất RGBA

#### Từ Enhanced Palette
```javascript
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');

// Phương thức RGBA từ color object
const rgba50 = palette[500].rgba(0.5);    // "rgba(63, 81, 181, 0.5)"
const rgba80 = palette[500].rgba(0.8);    // "rgba(63, 81, 181, 0.8)"
const rgba100 = palette[500].rgba(1.0);   // "rgba(63, 81, 181, 1)"

// Sử dụng unified formatColor method
const formattedRgba = MonetAPI.formatColor('#3F51B5', 'rgba');  // "rgba(63, 81, 181, 1)"

// Với palette-level utilities
const quickRgba = palette.getRGBA(500, 0.7);  // "rgba(63, 81, 181, 0.7)"
```

#### Từ Base Color với Alpha
```javascript
// Direct extraction với alpha
const baseColor = '#3F51B5';
const palette = MonetAPI.v2CreateEnhancedPalette(baseColor);

// Different alpha values for different use cases
const overlay = palette[500].rgba(0.1);    // Very transparent
const surface = palette[500].rgba(0.8);    // Semi-transparent
const solid = palette[500].rgba(1.0);      // Fully opaque
```

### 4. Sử Dụng API v2 để Trích Xuất HSL

#### Từ HEX Color
```javascript
// Trích xuất HSL từ hex
const rgb = MonetAPI.v2ColorUtils.hexToRgb('#3F51B5');
const hsl = MonetAPI.v2ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
console.log(hsl);  // { h: 239, s: 48, l: 48 }

// Sử dụng enhanced palette
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const hslFromPalette = palette[500].hsl;  // { h: 239, s: 48, l: 48 }

// Sử dụng unified formatColor method
const formattedHsl = MonetAPI.formatColor('#3F51B5', 'hsl');  // "hsl(239, 48%, 48%)"
```

#### Từ RGB Color
```javascript
const rgb = { r: 63, g: 81, b: 181 };
const hsl = MonetAPI.v2ColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
console.log(hsl);  // { h: 239, s: 48, l: 48 }
```

#### HSL với Alpha (HSLA)
```javascript
const palette = MonetAPI.v2CreateEnhancedPalette('#3F51B5');

// HSLA extraction
const hsla50 = palette[500].hsla(0.5);  // "hsla(239, 48%, 48%, 0.5)"
const hsla80 = palette[500].hsla(0.8);  // "hsla(239, 48%, 48%, 0.8)"

// Sử dụng unified formatColor method
const formattedHsla = MonetAPI.formatColor('#3F51B5', 'hsla');  // "hsla(239, 48%, 48%, 1)"
```

---

## 🎨 Canvas API Integration

### Phân Tích Màu từ Image

```javascript
function extractDominantColorFromImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = function() {
            // Tạo canvas để phân tích màu
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Vẽ image lên canvas
            ctx.drawImage(img, 0, 0);
            
            // Lấy pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Phân tích màu phổ biến nhất
            const colorMap = new Map();
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                // Bỏ qua pixel trong suốt
                if (a < 128) continue;
                
                // Quantize màu để giảm noise
                const quantizedR = Math.round(r / 32) * 32;
                const quantizedG = Math.round(g / 32) * 32;
                const quantizedB = Math.round(b / 32) * 32;
                
                const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
                colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
            }
            
            // Tìm màu xuất hiện nhiều nhất
            let dominantColor = null;
            let maxCount = 0;
            
            for (const [color, count] of colorMap.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    dominantColor = color;
                }
            }
            
            if (dominantColor) {
                const [r, g, b] = dominantColor.split(',').map(Number);
                const hex = MonetAPI.v2ColorUtils.rgbToHex(r, g, b);
                
                // Tạo palette từ màu được trích xuất
                const palette = MonetAPI.v2CreateEnhancedPalette(hex);
                
                resolve({
                    originalRGB: { r, g, b },
                    hex: hex,
                    palette: palette,
                    analysis: {
                        dominantColor: hex,
                        confidence: maxCount / (data.length / 4)
                    }
                });
            } else {
                reject(new Error('Could not extract dominant color'));
            }
        };
        
        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
    });
}

// Sử dụng
extractDominantColorFromImage('https://example.com/image.jpg')
    .then(result => {
        console.log('Extracted color:', result.hex);
        console.log('Generated palette:', result.palette);
        
        // Áp dụng vào theme
        const theme = createThemeFromPalette(result.palette);
        GM_addStyle(theme);
    })
    .catch(error => {
        console.error('Color extraction failed:', error);
    });
```

### Phân Tích Màu từ Canvas Pixel

```javascript
function analyzeCanvasColors(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const {
        sampleRate = 4,  // Phân tích mỗi pixel thứ n
        minAlpha = 128,  // Bỏ qua pixel có alpha thấp
        quantizeLevel = 32  // Mức độ quantization
    } = options;
    
    const colorFrequency = new Map();
    
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a < minAlpha) continue;
        
        // Quantize để giảm noise
        const qr = Math.round(r / quantizeLevel) * quantizeLevel;
        const qg = Math.round(g / quantizeLevel) * quantizeLevel;
        const qb = Math.round(b / quantizeLevel) * quantizeLevel;
        
        const colorKey = MonetAPI.v2ColorUtils.rgbToHex(qr, qg, qb);
        colorFrequency.set(colorKey, (colorFrequency.get(colorKey) || 0) + 1);
    }
    
    // Sắp xếp theo frequency
    const sortedColors = Array.from(colorFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);  // Top 10 màu phổ biến nhất
    
    return {
        dominantColors: sortedColors.map(([color, freq]) => ({
            color: color,
            frequency: freq,
            percentage: (freq / (data.length / 4 / sampleRate)) * 100
        })),
        
        // Tạo palette từ màu chủ đạo
        generatePalette: function() {
            if (sortedColors.length > 0) {
                const dominantColor = sortedColors[0][0];
                return MonetAPI.v2CreateEnhancedPalette(dominantColor);
            }
            return null;
        }
    };
}

// Sử dụng với canvas có sẵn
const canvas = document.getElementById('imageCanvas');
const analysis = analyzeCanvasColors(canvas, {
    sampleRate: 2,      // Phân tích chi tiết hơn
    minAlpha: 64,       // Bao gồm cả pixel semi-transparent
    quantizeLevel: 16   // Quantization mịn hơn
});

console.log('Top colors:', analysis.dominantColors);
const palette = analysis.generatePalette();
```

---

## 🔗 Integration v1.0 và v2.0

### Migration Strategy

#### Progressive Enhancement Pattern
```javascript
class HybridColorManager {
    constructor() {
        this.v1Palette = null;
        this.v2Enhanced = null;
        this.currentColor = '#3F51B5';
    }
    
    // Tạo palette với cả v1 và v2
    generatePalette(baseColor) {
        this.currentColor = baseColor;
        
        // v1.0 - luôn hoạt động
        this.v1Palette = MonetAPI.generateMonetPalette(baseColor);
        
        // v2.0 - enhanced features (optional)
        try {
            this.v2Enhanced = MonetAPI.v2CreateEnhancedPalette(baseColor);
        } catch (error) {
            console.warn('v2.0 not available, using v1.0 only');
            this.v2Enhanced = null;
        }
        
        return this.getPalette();
    }
    
    // Unified API
    getPalette() {
        const base = {
            // v1.0 methods
            primary: this.v1Palette[500],
            light: this.v1Palette[300],
            dark: this.v1Palette[700],
            
            // v1.0 RGBA method
            overlay: MonetAPI.paletteToRgba(this.v1Palette, 500, 0.1)
        };
        
        // Thêm v2.0 enhancements nếu có
        if (this.v2Enhanced) {
            base.v2Enhanced = this.v2Enhanced;
            base.onPrimary = this.v2Enhanced[500].getOptimalTextColor();
            base.harmonies = MonetAPI.v2GetColorHarmonies(this.currentColor);
            base.accessibility = MonetAPI.v2CheckAccessibility(this.currentColor);
            
            // Enhanced color methods
            base.getRGBA = (tone, alpha) => this.v2Enhanced[tone].rgba(alpha);
            base.getHSLA = (tone, alpha) => this.v2Enhanced[tone].hsla(alpha);
            base.getContrast = (tone1, tone2) => this.v2Enhanced.getContrast(tone1, tone2);
        }
        
        return base;
    }
    
    // Fallback method khi v2 không khả dụng
    getRGBAFallback(tone, alpha) {
        if (this.v2Enhanced && this.v2Enhanced[tone]) {
            return this.v2Enhanced[tone].rgba(alpha);
        }
        return MonetAPI.paletteToRgba(this.v1Palette, tone, alpha);
    }
}

// Sử dụng
const colorManager = new HybridColorManager();
const theme = colorManager.generatePalette('#3F51B5');

// v1.0 methods
console.log(theme.primary);           // "#3F51B5"
console.log(theme.overlay);           // "rgba(63, 81, 181, 0.1)"

// v2.0 enhancements (nếu có)
console.log(theme.onPrimary);         // "#FFFFFF"
console.log(theme.getRGBA(500, 0.8)); // "rgba(63, 81, 181, 0.8)"
```

#### Compatibility Wrapper
```javascript
// Wrapper để đảm bảo compatibility
class MonetAPIWrapper {
    static getPalette(color, options = {}) {
        // Ưu tiên v2.0 nếu có sẵn
        if (MonetAPI.v2CreateEnhancedPalette) {
            return MonetAPI.v2CreateEnhancedPalette(color, options);
        }
        
        // Fallback to v1.0
        return MonetAPI.generateMonetPalette(color);
    }
    
    static getRGBA(palette, tone, alpha) {
        // Thử v2.0 method trước
        if (palette && palette[tone] && typeof palette[tone].rgba === 'function') {
            return palette[tone].rgba(alpha);
        }
        
        // Fallback to v1.0
        return MonetAPI.paletteToRgba(palette, tone, alpha);
    }
    
    static formatColor(color, format) {
        // Thử v2.0 method trước
        if (MonetAPI.v2FormatColor) {
            return MonetAPI.v2FormatColor(color, format);
        }
        
        // Manual conversion for v1.0
        switch (format) {
            case 'hex':
                return color;
            case 'rgb':
            case 'rgba':
                const rgb = MonetAPI.hexToRgb(color);
                return format === 'rgba' ? 
                    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` :
                    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            default:
                return color;
        }
    }
}

// Sử dụng wrapper
const palette = MonetAPIWrapper.getPalette('#3F51B5');
const rgba = MonetAPIWrapper.getRGBA(palette, 500, 0.8);
const formatted = MonetAPIWrapper.formatColor('#3F51B5', 'rgb');
```

---

## ⚡ Performance Optimization v2.0

### 1. Caching Strategy

#### Intelligent Caching
```javascript
class OptimizedColorService {
    constructor() {
        this.customCache = new Map();
        this.usageStats = new Map();
        this.maxCustomCacheSize = 50;
    }
    
    // Preload colors để optimize performance
    preloadColors(colorArray) {
        // Sử dụng v2 preloading system
        MonetAPI.v2PreloadColors(colorArray);
        
        // Custom caching cho frequently used colors
        colorArray.forEach(color => {
            if (!this.customCache.has(color)) {
                const palette = MonetAPI.v2CreateEnhancedPalette(color);
                this.customCache.set(color, {
                    palette: palette,
                    timestamp: Date.now(),
                    accessCount: 0
                });
            }
        });
    }
    
    // Get palette với caching
    getPalette(baseColor) {
        const normalizedColor = baseColor.toLowerCase();
        
        // Track usage
        this.usageStats.set(normalizedColor, 
            (this.usageStats.get(normalizedColor) || 0) + 1);
        
        // Check custom cache first
        if (this.customCache.has(normalizedColor)) {
            const cached = this.customCache.get(normalizedColor);
            cached.accessCount++;
            return cached.palette;
        }
        
        // Use v2 caching system
        const palette = MonetAPI.v2CreateEnhancedPalette(normalizedColor);
        
        // Add to custom cache if frequently used
        if (this.usageStats.get(normalizedColor) > 3) {
            this.addToCustomCache(normalizedColor, palette);
        }
        
        return palette;
    }
    
    addToCustomCache(color, palette) {
        if (this.customCache.size >= this.maxCustomCacheSize) {
            // Remove least used entry
            let leastUsed = null;
            let minAccess = Infinity;
            
            for (const [key, value] of this.customCache.entries()) {
                if (value.accessCount < minAccess) {
                    minAccess = value.accessCount;
                    leastUsed = key;
                }
            }
            
            if (leastUsed) {
                this.customCache.delete(leastUsed);
            }
        }
        
        this.customCache.set(color, {
            palette: palette,
            timestamp: Date.now(),
            accessCount: 0
        });
    }
    
    // Cleanup unused entries
    cleanupCache() {
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes
        
        for (const [color, cached] of this.customCache.entries()) {
            if (now - cached.timestamp > maxAge && cached.accessCount < 2) {
                this.customCache.delete(color);
            }
        }
        
        // Also cleanup v2 cache
        MonetAPI.v2ClearCache();
    }
    
    // Get cache statistics
    getStats() {
        return {
            customCache: {
                size: this.customCache.size,
                maxSize: this.maxCustomCacheSize,
                entries: Array.from(this.customCache.entries()).map(([color, cached]) => ({
                    color,
                    age: Date.now() - cached.timestamp,
                    accessCount: cached.accessCount
                }))
            },
            v2Cache: MonetAPI.v2GetCacheStats(),
            usageStats: Object.fromEntries(this.usageStats)
        };
    }
}
```

### 2. Memory Management

```javascript
class MemoryOptimizedColorManager {
    constructor() {
        this.paletteCache = new Map();
        this.colorReferences = new WeakMap();
        this.maxCacheSize = 30;
    }
    
    // LRU Cache với WeakMap cho memory efficiency
    getPalette(baseColor) {
        const cacheKey = this.normalizeColor(baseColor);
        
        if (this.paletteCache.has(cacheKey)) {
            // Move to end (most recently used)
            const palette = this.paletteCache.get(cacheKey);
            this.paletteCache.delete(cacheKey);
            this.paletteCache.set(cacheKey, palette);
            return palette;
        }
        
        // Generate new palette
        const palette = MonetAPI.v2CreateEnhancedPalette(baseColor);
        
        // Implement LRU eviction
        if (this.paletteCache.size >= this.maxCacheSize) {
            const firstKey = this.paletteCache.keys().next().value;
            this.paletteCache.delete(firstKey);
        }
        
        this.paletteCache.set(cacheKey, palette);
        return palette;
    }
    
    // Clear cache periodically
    scheduleCleanup() {
        setInterval(() => {
            // Clear v2 cache
            MonetAPI.v2ClearCache();
            
            // Clear custom cache if memory pressure
            if (performance.memory) {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit > 0.8) {
                    this.paletteCache.clear();
                    console.log('Memory pressure detected, cleared color cache');
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    normalizeColor(color) {
        return color.toLowerCase().trim();
    }
}
```

### 3. Batch Operations

```javascript
class BatchColorProcessor {
    constructor() {
        this.batchQueue = [];
        this.processing = false;
    }
    
    // Queue multiple color operations
    queuePaletteGeneration(baseColor, callback) {
        this.batchQueue.push({ baseColor, callback });
        
        if (!this.processing) {
            this.processBatch();
        }
    }
    
    async processBatch() {
        this.processing = true;
        const batch = [...this.batchQueue];
        this.batchQueue = [];
        
        try {
            // Process in smaller chunks to avoid blocking
            const chunkSize = 5;
            for (let i = 0; i < batch.length; i += chunkSize) {
                const chunk = batch.slice(i, i + chunkSize);
                await Promise.all(chunk.map(async ({ baseColor, callback }) => {
                    try {
                        const palette = MonetAPI.v2CreateEnhancedPalette(baseColor);
                        callback(null, palette);
                    } catch (error) {
                        callback(error, null);
                    }
                }));
                
                // Yield to main thread
                await new Promise(resolve => setTimeout(resolve, 16));
            }
        } catch (error) {
            console.error('Batch processing error:', error);
        } finally {
            this.processing = false;
        }
    }
    
    // Process multiple colors at once
    async generateMultiplePalettes(colors) {
        // Use v2 preloading for better performance
        MonetAPI.v2PreloadColors(colors);
        
        const palettes = new Map();
        
        for (const color of colors) {
            try {
                const palette = MonetAPI.v2CreateEnhancedPalette(color);
                palettes.set(color, palette);
            } catch (error) {
                console.warn(`Failed to generate palette for ${color}:`, error);
                // Fallback to v1.0
                try {
                    const fallbackPalette = MonetAPI.generateMonetPalette(color);
                    palettes.set(color, fallbackPalette);
                } catch (fallbackError) {
                    console.error(`Fallback also failed for ${color}:`, fallbackError);
                }
            }
        }
        
        return palettes;
    }
}
```

### 4. Performance Monitoring

```javascript
class ColorPerformanceMonitor {
    constructor() {
        this.metrics = {
            paletteGeneration: [],
            cacheHits: 0,
            cacheMisses: 0,
            errors: []
        };
    }
    
    // Monitor v2.0 performance
    monitorV2Performance() {
        const originalCreateEnhancedPalette = MonetAPI.v2CreateEnhancedPalette;
        
        MonetAPI.v2CreateEnhancedPalette = (baseColor, options) => {
            const startTime = performance.now();
            
            try {
                const result = originalCreateEnhancedPalette(baseColor, options);
                const endTime = performance.now();
                
                this.recordMetric('paletteGeneration', {
                    duration: endTime - startTime,
                    color: baseColor,
                    cacheHit: result._fromCache || false,
                    timestamp: Date.now()
                });
                
                return result;
            } catch (error) {
                const endTime = performance.now();
                this.recordMetric('errors', {
                    duration: endTime - startTime,
                    color: baseColor,
                    error: error.message,
                    timestamp: Date.now()
                });
                throw error;
            }
        };
    }
    
    recordMetric(type, data) {
        this.metrics[type].push(data);
        
        // Keep only recent data
        const maxEntries = 100;
        if (this.metrics[type].length > maxEntries) {
            this.metrics[type] = this.metrics[type].slice(-maxEntries);
        }
    }
    
    getPerformanceReport() {
        const generationMetrics = this.metrics.paletteGeneration;
        
        if (generationMetrics.length === 0) {
            return { message: 'No performance data available' };
        }
        
        const avgDuration = generationMetrics.reduce((sum, m) => sum + m.duration, 0) / generationMetrics.length;
        const cacheHitRate = generationMetrics.filter(m => m.cacheHit).length / generationMetrics.length;
        
        return {
            averageGenerationTime: `${avgDuration.toFixed(2)}ms`,
            cacheHitRate: `${(cacheHitRate * 100).toFixed(1)}%`,
            totalGenerations: generationMetrics.length,
            recentMetrics: generationMetrics.slice(-5),
            errors: this.metrics.errors.slice(-5)
        };
    }
    
    // Setup monitoring
    setup() {
        this.monitorV2Performance();
        
        // Periodic reporting
        setInterval(() => {
            const report = this.getPerformanceReport();
            console.log('Color Performance Report:', report);
        }, 60000); // Every minute
    }
}
```

---

## 📊 API Reference v2.0

### Core Color Extraction Methods
```javascript
// HEX extraction
MonetAPI.v2CreateEnhancedPalette(color).tone.hex
MonetAPI.v2ColorUtils.rgbToHex(r, g, b)
MonetAPI.formatColor(color, 'hex')

// RGB extraction  
MonetAPI.v2CreateEnhancedPalette(color).tone.rgb
MonetAPI.v2ColorUtils.hexToRgb(hex)
MonetAPI.formatColor(color, 'rgb')

// RGBA extraction
MonetAPI.v2CreateEnhancedPalette(color).tone.rgba(alpha)
MonetAPI.v2CreateEnhancedPalette(color).getRGBA(tone, alpha)
MonetAPI.formatColor(color, 'rgba')

// HSL extraction
MonetAPI.v2CreateEnhancedPalette(color).tone.hsl
MonetAPI.v2ColorUtils.rgbToHsl(r, g, b)
MonetAPI.v2ColorUtils.hslToRgb(h, s, l)
MonetAPI.formatColor(color, 'hsl')

// HSLA extraction
MonetAPI.v2CreateEnhancedPalette(color).tone.hsla(alpha)
MonetAPI.formatColor(color, 'hsla')
```

### Canvas Integration Methods
```javascript
// Canvas color analysis
analyzeCanvasColors(canvas, options)
extractDominantColorFromImage(imageUrl)
```

### Performance & Caching
```javascript
MonetAPI.v2GetCacheStats()
MonetAPI.v2ClearCache()
MonetAPI.v2PreloadColors(colorArray)
```

---

## 🏁 Kết Luận

MonetAPI v2.0 cung cấp hệ thống trích xuất màu toàn diện với:

### ✨ Color Extraction Features
- **🎨 Multiple Formats**: HEX, RGB, RGBA, HSL, HSLA extraction
- **⚡ Canvas Integration**: Direct analysis from images and canvas
- **🔄 v1.0 Compatibility**: Seamless integration with legacy methods
- **🚀 Performance Optimized**: Intelligent caching and batch processing
- **♿ Developer Friendly**: Comprehensive error handling and monitoring

### 🎯 Use Cases
- **Image Processing**: Extract dominant colors from images
- **Theme Generation**: Create cohesive color schemes
- **Design Systems**: Consistent color management across components
- **Performance**: Optimized for high-frequency color operations

MonetAPI v2.0 sẵn sàng để xử lý mọi nhu cầu về màu sắc trong các ứng dụng hiện đại!