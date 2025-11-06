# Hướng Dẫn Sử Dụng MonetAPI v1.0 (Legacy) - Hệ Thống Màu Sắc HakoMonetTheme

## Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Các Định Dạng Màu](#các-định-dạng-màu)
3. [MonetAPI v1.0 Methods](#monetapi-v10-methods)
4. [Ví Dụ Sử Dụng](#ví-dụ-sử-dụng)
5. [Tích Hợp Vào Theme](#tích-hợp-vào-theme)
6. [Migration to v2.0](#migration-to-v20)

---

## Tổng Quan

MonetAPI v1.0 là phiên bản gốc của hệ thống quản lý màu sắc cho HakoMonetTheme. Hiện tại, v1.0 đã được tích hợp vào MonetAPI v2.0-integrated nhưng **vẫn hoạt động hoàn toàn tương thích ngược**.

### Tính năng v1.0:
- ✅ Tạo Material You color palette từ màu cơ sở
- ✅ Chuyển đổi giữa Hex, RGB, RGBA
- ✅ Hỗ trợ alpha channel cho transparency
- ✅ **100% backward compatible** trong v2.0-integrated
- ✅ Không có breaking changes

### Vị trí hiện tại:
```javascript
// V1 methods vẫn có sẵn trong MonetAPI v2.0-integrated
window.MonetAPI = {
    // V1 Legacy Methods (unchanged)
    generateMonetPalette: (color) => { /* v1 logic */ },
    isValidColor: (color) => { /* v1 logic */ },
    paletteToRgba: (palette, tone, alpha) => { /* v1 logic */ },
    
    // V2 Advanced Methods (new)
    v2: { /* v2 functionality */ },
    v2CreateEnhancedPalette: (color, options) => { /* v2 logic */ }
}
```

---

## Các Định Dạng Màu

### 1. HEX (Hexadecimal)
**Định dạng**: `#RRGGBB` hoặc `#RGB`

```javascript
// Ví dụ:
const blue = "#0000FF";     // Xanh dương đậm
const green = "#00FF00";    // Xanh lá đậm  
const red = "#FF0000";      // Đỏ đậm
const gray = "#808080";     // Xám giữa
```

### 2. RGB (Red, Green, Blue)
**Định dạng**: `rgb(r, g, b)`

```javascript
// Ví dụ:
const blue = "rgb(0, 0, 255)";
const green = "rgb(0, 255, 0)";
const red = "rgb(255, 0, 0)";
const white = "rgb(255, 255, 255)";
```

### 3. RGBA (Red, Green, Blue, Alpha)
**Định dạng**: `rgba(r, g, b, a)`

```javascript
// Ví dụ:
const translucentBlue = "rgba(0, 0, 255, 0.5)";  // Xanh dương trong suốt 50%
const semiGreen = "rgba(0, 255, 0, 0.8)";       // Xanh lá trong suốt 80%
const transparentRed = "rgba(255, 0, 0, 0)";    // Đỏ hoàn toàn trong suốt
```

---

## MonetAPI v1.0 Methods

### Core Methods

#### `generateMonetPalette(baseColor)`
Tạo Material You palette từ màu cơ sở

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

**Tham số**:
- `baseColor` (string): Màu cơ sở dạng hex (#RRGGBB)

**Trả về**: Object với các key từ 0-1000 đại diện cho tone màu

#### `generateMonetPaletteWithRGBA(baseColor)`
Tạo enhanced palette với hỗ trợ rgba

```javascript
const rgbaPalette = MonetAPI.generateMonetPaletteWithRGBA('#3F51B5');
const primary = rgbaPalette[500];     // Trả về object
const primaryHex = primary.hex;       // "#3F51B5"
const primaryRgba = primary.rgba(0.8); // "rgba(63, 81, 181, 0.8)"
```

**Trả về**: Enhanced palette object với properties:
- `hex`: Màu hex
- `rgb`: Object {r, g, b}
- `rgba(alpha)`: Function trả về rgba string

#### `paletteToRgba(palette, tone, alpha)`
Chuyển đổi palette color thành rgba

```javascript
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const rgba = MonetAPI.paletteToRgba(palette, 500, 0.8);
// Output: "rgba(63, 81, 181, 0.8)"
```

**Tham số**:
- `palette` (Object): Palette từ generateMonetPalette
- `tone` (number): Tone cần chuyển đổi (0-1000)
- `alpha` (number): Độ trong suốt (0-1)

### Utility Methods

#### `hexToRgb(hex)`, `rgbToHex(r, g, b)`, `isValidColor(color)`, `isColorLight(color)`
Các method cơ bản để xử lý màu sắc

---

## Ví Dụ Sử Dụng

### 1. Sử dụng cơ bản - Hex Colors

```javascript
// Code v1.0 vẫn hoạt động trong v2.0-integrated
const baseColor = '#3F51B5'; // Indigo
const palette = MonetAPI.generateMonetPalette(baseColor);

// Sử dụng các tone màu
const primary = palette[500];     // Màu chính
const primaryLight = palette[300]; // Màu chính nhạt
const primaryDark = palette[700];  // Màu chính tối

// Áp dụng vào CSS
const css = `
    .primary-button {
        background-color: ${primary};
        border-color: ${primaryDark};
    }
    
    .primary-button:hover {
        background-color: ${primaryLight};
    }
`;
```

### 2. Sử dụng nâng cao - RGBA Support

```javascript
const baseColor = '#3F51B5';
const palette = MonetAPI.generateMonetPalette(baseColor);

// Cách 1: Sử dụng paletteToRgba (v1 method)
const overlayRgba = MonetAPI.paletteToRgba(palette, 500, 0.8);
const borderRgba = MonetAPI.paletteToRgba(palette, 700, 0.5);

const css = `
    .overlay {
        background: ${overlayRgba};
        border: 1px solid ${borderRgba};
    }
`;

// Cách 2: Sử dụng enhanced palette (v1 method)
const rgbaPalette = MonetAPI.generateMonetPaletteWithRGBA(baseColor);
const css2 = `
    .element {
        background: ${rgbaPalette[500].rgba(0.8)};
        border: 1px solid ${rgbaPalette[700].rgba(0.5)};
    }
`;
```

---

## Migration to v2.0

### Tại sao nên migration?
V2.0-integrated cung cấp tất cả tính năng v1.0 **PLUS**:
- 🚀 **Performance**: Caching system
- 🎨 **Color Harmony**: Complementary, analogous, triadic colors
- ♿ **Accessibility**: WCAG compliance checking
- 🛠️ **Developer Tools**: Debug panel, color analysis
- 🎭 **Theme Detection**: Smart dark/light mode

### Cách Migration Đơn Giản

**Trước (v1.0 code - vẫn hoạt động)**:
```javascript
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const rgba = MonetAPI.paletteToRgba(palette, 500, 0.8);
const isLight = MonetAPI.isColorLight('#3F51B5');
```

**Sau (v2.0 enhanced - khuyến nghị)**:
```javascript
// Tất cả v1 methods vẫn hoạt động
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const rgba = MonetAPI.paletteToRgba(palette, 500, 0.8);
const isLight = MonetAPI.isColorLight('#3F51B5');

// Thêm v2 features khi cần
const enhanced = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const accessibility = MonetAPI.v2CheckAccessibility('#3F51B5');
const harmonies = MonetAPI.v2GetColorHarmonies('#3F51B5');
```

### Kết Hợp v1 và v2

```javascript
function createTheme(baseColor, isDark) {
    // v1: Basic palette generation
    const basicPalette = MonetAPI.generateMonetPalette(baseColor);
    
    // v2: Enhanced features
    const enhanced = MonetAPI.v2CreateEnhancedPalette(baseColor);
    const accessibility = MonetAPI.v2CheckAccessibility(baseColor);
    
    return {
        // v1 methods still work
        primary: basicPalette[500],
        overlay: MonetAPI.paletteToRgba(basicPalette, 500, 0.1),
        
        // v2 enhanced features
        onPrimary: enhanced[500].getOptimalTextColor(),
        harmonies: MonetAPI.v2GetColorHarmonies(baseColor),
        accessibility: accessibility.violations.length === 0
    };
}
```

---

## Troubleshooting v1.0

### Lỗi thường gặp:

1. **"Màu cơ sở không hợp lệ"**
   - Kiểm tra format hex: `#RRGGBB`
   - Sử dụng `MonetAPI.isValidColor()` để verify

2. **RGBA trả về null**
   - Kiểm tra tone có tồn tại trong palette không
   - Đảm bảo alpha là số từ 0-1

3. **CSS không áp dụng**
   - Kiểm tra cú pháp rgba: `rgba(r, g, b, a)`
   - Verify palette object structure

### Kiểm tra Version
```javascript
// Kiểm tra API version
console.log(MonetAPI.version); // "2.0-integrated"

// Kiểm tra v1 methods có sẵn
console.log(MonetAPI.v1Methods);
// ["generateMonetPalette", "isValidColor", "isColorLight", "rgbToHex", "hexToRgb", "generateMonetPaletteWithRGBA", "paletteToRgba"]
```

---

## Kết Luận

MonetAPI v1.0 đã được tích hợp thành công vào v2.0-integrated với **100% backward compatibility**. Tất cả code v1.0 hiện có sẽ tiếp tục hoạt động mà không cần thay đổi, đồng thời có thể tận dụng các tính năng mạnh mẽ của v2.0 khi sẵn sàng.

**Lợi ích của việc migration**:
- ✅ Không breaking changes
- ✅ Performance improvements
- ✅ Advanced color science
- ✅ Developer experience enhancement
- ✅ Future-proof architecture