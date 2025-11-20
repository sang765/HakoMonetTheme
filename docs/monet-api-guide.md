# Hướng Dẫn Sử Dụng MonetAPI - Hệ Thống Màu Sắc HakoMonetTheme

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Các Định Dạng Màu](#các-định-dạng-màu)
3. [V1 MonetAPI Methods (Legacy)](#v1-monetapi-methods-legacy)
4. [V2 MonetAPI Methods (Advanced)](#v2-monetapi-methods-advanced)
5. [Ví Dụ Sử Dụng](#ví-dụ-sử-dụng)
6. [Tích Hợp Vào Theme](#tích-hợp-vào-theme)
7. [Performance & Best Practices](#performance--best-practices)

---

## Tổng Quan

MonetAPI là hệ thống quản lý màu sắc được phát triển cho HakoMonetTheme, hỗ trợ tạo palette màu từ một màu cơ sở và chuyển đổi giữa các định dạng màu khác nhau.

### Tính năng chính:
- **V1 (Legacy)**: Tạo Material You color palette cơ bản từ màu cơ sở
- **V2 (Advanced)**: Hệ thống màu sắc nâng cao với caching, accessibility, color harmony
- **Backward Compatibility**: Hoàn toàn tương thích với code V1 cũ
- **Caching System**: Cache để tối ưu performance
- **Accessibility Analysis**: Phân tích và đảm bảo tuân thủ WCAG
- **Color Harmony**: Tạo các scheme màu tương hợp
- **Theme Detection**: Tự động phát hiện dark/light mode

### Phiên bản:
- **V1**: Legacy methods với basic palette generation
- **V2**: Advanced methods với enhanced features

---

## V1 MonetAPI Methods (Legacy)

### Core Methods

#### `generateMonetPalette(baseColor)`
Tạo Material You palette từ màu cơ sở (V1 method)

```javascript
const palette = MonetAPI.generateMonetPalette('#3F51B5');
console.log(palette);
// Output: {
//   0: "#000000",
//   10: "#101010", 
//   50: "#1A1A1A",
//   100: "#212121",
//   ...
//   500: "#3F51B5",  // Màu cơ sở
//   600: "#354A94",
//   700: "#2A4172",
//   ...
//   1000: "#FFFFFF"
// }
```

#### `generateMonetPaletteWithRGBA(baseColor)`
Tạo enhanced palette với hỗ trợ rgba (V1 method)

#### `paletteToRgba(palette, tone, alpha)`
Chuyển đổi palette color thành rgba (V1 method)

#### Utility Methods (V1)
`hexToRgb(hex)`, `rgbToHex(r, g, b)`, `isValidColor(color)`, `isColorLight(color)`

---

## V2 MonetAPI Methods (Advanced)

### V2 Core Methods

#### `v2CreateEnhancedPalette(baseColor, options)`
Tạo enhanced palette với tùy chọn nâng cao (V2 method)

```javascript
const enhancedPalette = MonetAPI.v2CreateEnhancedPalette('#3F51B5', {
    algorithm: 'material3',
    chromaFactor: 1.0,
    temperature: 0
});

const color = enhancedPalette[500];
console.log(color.hex);     // "#3F51B5"
console.log(color.rgb);     // {r: 63, g: 81, b: 181}
console.log(color.hsl);     // {h: 231, s: 49, l: 48}
console.log(color.rgba(0.8)); // "rgba(63, 81, 181, 0.8)"
console.log(color.isLight()); // false
console.log(color.luminance); // 0.134
```

#### `v2GetColorHarmonies(baseColor)`
Tạo các màu tương hợp (V2 method)

```javascript
const harmonies = MonetAPI.v2GetColorHarmonies('#3F51B5');
console.log(harmonies);
// {
//   complementary: "#B5313F",
//   analogous: ["#3F51B5", "#513FB5", "#513FB5", "#B53F7A"],
//   triadic: ["#3F51B5", "#B53F3F", "#3FB553"],
//   splitComplementary: ["#3F51B5", "#B53F7A", "#B5813F"]
// }
```

#### `v2CheckAccessibility(baseColor)`
Phân tích accessibility của palette (V2 method)

```javascript
const accessibility = MonetAPI.v2CheckAccessibility('#3F51B5');
console.log(accessibility);
// {
//   palette: {...},
//   recommendations: [...],
//   violations: [...],
//   wcagCompliance: [...],
//   optimizedPalette: {...}
// }
```

#### `v2GetCurrentTheme()`, `v2SetThemePreference(preference)`
Quản lý theme (V2 method)

### V2 Performance & Debugging

#### `v2GetCacheStats()`, `v2ClearCache()`
Quản lý cache (V2 method)

#### `v2CreateColorDebugger()`
Tạo debug panel (V2 method)

#### `v2LogColorAnalysis(color, context)`
Log phân tích color chi tiết (V2 method)

---

## Ví Dụ Sử Dụng

### 1. Sử dụng V1 Legacy (Backward Compatible)

```javascript
// Code cũ vẫn hoạt động bình thường
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const css = `
    .button {
        background: ${palette[500]};
        color: ${MonetAPI.isColorLight(palette[500]) ? '#000' : '#fff'};
    }
`;
```

### 2. Sử dụng V2 Enhanced Features

```javascript
// Sử dụng V2 để tạo accessibility-compliant palette
const baseColor = '#3F51B5';
const accessibility = MonetAPI.v2CheckAccessibility(baseColor);
const optimized = accessibility.optimizedPalette;

// Tạo color harmonies
const harmonies = MonetAPI.v2GetColorHarmonies(baseColor);
const triadicColors = harmonies.triadic;

// Sử dụng theme detection
const currentTheme = MonetAPI.v2GetCurrentTheme();
const isDark = currentTheme === 'dark' || (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
```

### 3. Kết hợp V1 và V2

```javascript
function createTheme(baseColor, isDark) {
    // Sử dụng V1 cho basic palette
    const basicPalette = MonetAPI.generateMonetPalette(baseColor);
    
    // Sử dụng V2 cho enhanced features
    const enhanced = MonetAPI.v2CreateEnhancedPalette(baseColor);
    const accessibility = MonetAPI.v2CheckAccessibility(baseColor);
    
    return {
        primary: enhanced[500].hex,
        onPrimary: enhanced[500].getOptimalTextColor(),
        surface: isDark ? enhanced[900].hex : enhanced[100].hex,
        // Vẫn có thể sử dụng V1 methods
        overlay: MonetAPI.paletteToRgba(basicPalette, 500, 0.1),
        // Sử dụng V2 utility methods
        contrast: enhanced[500].contrast('#FFFFFF'),
        harmony: MonetAPI.v2GetColorHarmonies(baseColor)
    };
}
```

---

## Migration Guide: V1 to V2

### Existing V1 Code
```javascript
// V1 code (vẫn hoạt động)
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const rgba = MonetAPI.paletteToRgba(palette, 500, 0.8);
const isLight = MonetAPI.isColorLight('#3F51B5');
```

### Enhanced V2 Code
```javascript
// V2 enhanced (khuyến nghị cho dự án mới)
const enhanced = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const color = enhanced[500];
const rgba = color.rgba(0.8);
const isLight = color.isLight();

// Thêm features mới
const accessibility = MonetAPI.v2CheckAccessibility('#3F51B5');
const harmonies = MonetAPI.v2GetColorHarmonies('#3F51B5');
```

---

## Performance & Best Practices

### V2 Caching Strategy
- V2 tự động cache palettes
- Sử dụng `MonetAPI.v2GetCacheStats()` để monitor
- Clear cache với `MonetAPI.v2ClearCache()` khi cần

### Debug Mode
```javascript
// Bật debug mode để monitor performance
GM_setValue('debug_mode', true);

// Manual testing
if (typeof window.testMonetAPI === 'function') {
    window.testMonetAPI(); // Chạy test suite
}
```

---