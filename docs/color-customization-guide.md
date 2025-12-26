# Hướng Dẫn Tùy Chỉnh Màu Sắc HakoMonetTheme

## Tổng Quan

HakoMonetTheme sử dụng hệ thống màu sắc Material You với khả năng trích xuất màu tự động từ ảnh bìa truyện hoặc avatar người dùng. Tài liệu này hướng dẫn cách tùy chỉnh và mở rộng hệ thống màu sắc.

## Kiến Trúc Màu Sắc

### Cấu Trúc File Màu

```
colors/
├── page-general-dark.js      # Màu trang chính (dark theme)
├── page-general-light.js     # Màu trang chính (light theme)
├── page-info-truyen-dark.js  # Màu trang thông tin truyện (dark)
├── page-info-truyen-light.js # Màu trang thông tin truyện (light)
├── page-profile-dark.js      # Màu trang profile (dark)
├── page-profile-light.js     # Màu trang profile (light)
└── monetv2/                  # Phiên bản v2 (beta)
    ├── page-general-dark.js
    ├── page-info-truyen-dark.js
    └── ...
```

### Các Chế Độ Màu

#### 1. Mặc Định (Default)
- Sử dụng màu được cấu hình trong cài đặt
- Áp dụng cho toàn bộ giao diện
- Không phụ thuộc vào nội dung trang

#### 2. Thumbnail
- Tự động trích xuất màu từ ảnh bìa truyện
- Ưu tiên màu accent truyền thống (đỏ, cam, vàng, xanh dương, tím)
- Chỉ áp dụng trên trang đọc truyện

#### 3. Avatar
- Trích xuất màu từ ảnh avatar người dùng
- Áp dụng cho trang profile và trang chính
- Hỗ trợ GIF (chỉ frame đầu tiên)

## Tùy Chỉnh Màu Cơ Bản

### Thay Đổi Màu Mặc Định

1. **Thông Qua Giao Diện:**
   - Mở menu cài đặt HakoMonetTheme
   - Chọn "Màu mặc định"
   - Sử dụng thanh trượt HSL hoặc nhập mã HEX
   - Sử dụng công cụ chọn màu từ màn hình

2. **Thông Qua Code (Cho Developer):**
   ```javascript
   // Lưu màu mới
   window.HMTConfig.setDefaultColor('#your-color');

   // Lấy màu hiện tại
   const currentColor = window.HMTConfig.getDefaultColor();
   ```

### Thay Đổi Chế Độ Màu

```javascript
// Chế độ cho trang đọc
window.HMTConfig.setColorMode('default'); // 'default' | 'thumbnail'

// Chế độ cho trang thông tin truyện
window.HMTConfig.setInfoPageColorMode('thumbnail'); // 'default' | 'avatar' | 'thumbnail'

// Chế độ cho trang profile
window.HMTConfig.setProfileColorMode('avatar'); // 'default' | 'avatar' | 'banner'
```

## Phát Triển Color Scheme Mới

### Tạo File Màu Mới

1. **Copy từ template:**
   ```bash
   cp colors/page-general-dark.js colors/page-custom-dark.js
   ```

2. **Cập nhật logic:**
   ```javascript
   (function() {
       'use strict';

       const DEBUG = GM_getValue('debug_mode', false);

       function applyCustomColors() {
           // Logic tùy chỉnh của bạn
           GM_addStyle(`
               .custom-element {
                   background-color: #your-color;
               }
           `);
       }

       // Khởi tạo
       if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', applyCustomColors);
       } else {
           applyCustomColors();
       }
   })();
   ```

3. **Thêm vào main.js:**
   ```javascript
   const customColorsJS = GM_getResourceText('customColorsJS');
   loadScript(customColorsJS, 'page-custom-dark.js');
   ```

4. **Cập nhật userscript header:**
   ```javascript
   // @resource    customColorsJS    https://sang765.github.io/HakoMonetTheme/colors/page-custom-dark.js
   ```

### Hiểu Cấu Trúc Color File

#### Biến Quan Trọng

```javascript
const DEBUG = GM_getValue('debug_mode', false); // Debug mode
const TARGET_DOMAINS = ['docln', 'hako', ...]; // Domain áp dụng
```

#### Hàm Cơ Bản

```javascript
function isTargetDomain(url) // Kiểm tra domain hợp lệ
function debugLog(...args)   // Log debug
function isValidColor(color) // Validate màu
```

#### Logic Áp Dung Màu

1. **Kiểm tra theme:** Chỉ áp dụng khi ở dark mode
2. **Kiểm tra page type:** Xác định loại trang
3. **Chọn nguồn màu:** Config, thumbnail, hoặc avatar
4. **Tạo palette:** Sử dụng MonetAPI
5. **Áp dụng CSS:** Inject styles vào trang

### Thuật Toán Trích Xuất Màu

#### Từ Thumbnail

```javascript
function analyzeImageColorTraditionalAccent(imageUrl) {
    // 1. Load ảnh với CORS handling
    // 2. Vẽ lên canvas
    // 3. Phân tích pixel data
    // 4. Ưu tiên màu accent truyền thống
    // 5. Trả về màu chủ đạo
}
```

**Màu Accent Ưu Tiên:**
- Đỏ: `#DC143C` - `#FF6347`
- Cam: `#FF8C00` - `#FFA500`
- Vàng: `#FFD700` - `#FFFF00`
- Xanh lá: `#32CD32` - `#00FF00`
- Xanh dương: `#1E90FF` - `#0000FF`
- Tím: `#8A2BE2` - `#9932CC`

#### Từ Avatar

```javascript
function applyAvatarColorScheme() {
    // 1. Tìm avatar element
    // 2. Load ảnh với fallback
    // 3. Trích xuất màu chủ đạo
    // 4. Tạo palette và áp dụng
}
```

## Mở Rộng Hệ Thống Màu

### Thêm Chế Độ Màu Mới

1. **Cập nhật config.js:**
   ```javascript
   // Thêm option mới
   function getCustomColorMode() {
       return GM_getValue('custom_color_mode', 'default');
   }

   function setCustomColorMode(mode) {
       GM_setValue('custom_color_mode', mode);
       // Phát event
       const event = new CustomEvent('hmtCustomColorModeChanged', {
           detail: { mode: mode }
       });
       document.dispatchEvent(event);
   }
   ```

2. **Cập nhật color files:**
   ```javascript
   // Lắng nghe event mới
   document.addEventListener('hmtCustomColorModeChanged', function(event) {
       const newMode = event.detail.mode;
       // Logic xử lý chế độ mới
   });
   ```

3. **Cập nhật UI:**
   - Thêm option vào config dialog
   - Update settings display

### Tạo Color Palette Tùy Chỉnh

```javascript
function createCustomPalette(baseColor, options = {}) {
    const {
        algorithm = 'monet', // 'monet' | 'material' | 'custom'
        accentWeight = 1.0,
        neutralWeight = 0.8
    } = options;

    // Tạo palette theo thuật toán tùy chỉnh
    const palette = {};

    for (let i = 0; i <= 1000; i += 50) {
        // Logic tạo màu tùy chỉnh
        palette[i] = calculateTone(baseColor, i, algorithm);
    }

    return palette;
}
```

### Hỗ Trợ Theme Mới

1. **Thêm theme detection:**
   ```javascript
   function detectTheme() {
       // Kiểm tra cookie, localStorage, system preference
       return 'dark' | 'light' | 'auto';
   }
   ```

2. **Tạo color file cho theme mới:**
   ```javascript
   // colors/page-general-custom.js
   function applyCustomThemeColors() {
       // Logic cho theme tùy chỉnh
   }
   ```

## Tối Ưu Hiệu Suất

### Caching

```javascript
// Cache palette đã tạo
const paletteCache = new Map();

function getCachedPalette(color) {
    if (paletteCache.has(color)) {
        return paletteCache.get(color);
    }

    const palette = MonetAPI.generateMonetPalette(color);
    paletteCache.set(color, palette);
    return palette;
}
```

### Debouncing

```javascript
// Tránh áp dụng màu quá thường xuyên
let colorApplyTimeout;
function debouncedApplyColors(color) {
    clearTimeout(colorApplyTimeout);
    colorApplyTimeout = setTimeout(() => {
        applyMonetColorScheme(color);
    }, 100);
}
```

### Selective Updates

```javascript
// Chỉ update elements cần thiết
function updateSelectiveColors(palette, changedElements) {
    const css = changedElements.map(selector => `
        ${selector} {
            background-color: ${palette[500]};
        }
    `).join('');

    GM_addStyle(css);
}
```

## Troubleshooting

### Màu Không Áp Dụng

1. **Kiểm tra theme:** Đảm bảo đang ở dark mode
2. **Kiểm tra domain:** Xác nhận domain được hỗ trợ
3. **Kiểm tra config:** Verify chế độ màu phù hợp
4. **Check console:** Xem có lỗi load script không

### Màu Từ Ảnh Không Chính Xác

1. **Kiểm tra chất lượng ảnh:** Ảnh quá nhỏ hoặc tối
2. **Fallback logic:** Sử dụng màu mặc định khi trích xuất thất bại
3. **Color validation:** Đảm bảo màu hợp lệ trước khi áp dụng

### Performance Issues

1. **Giảm sample rate:** Khi phân tích ảnh
2. **Cache palettes:** Tránh tạo lại palette giống nhau
3. **Debounce updates:** Tránh update liên tục

## Best Practices

### Cho User

- Sử dụng chế độ phù hợp với sở thích
- Thử nghiệm với màu khác nhau
- Backup settings quan trọng

### Cho Developer

- Validate input colors
- Provide fallbacks
- Document color logic
- Test trên multiple scenarios
- Monitor performance impact

### Cho Color Design

- Follow Material Design guidelines
- Ensure accessibility (WCAG compliance)
- Test contrast ratios
- Consider color blindness
- Support both light and dark themes

## Migration Guide

### Từ v1 Color System

```javascript
// Old way
const palette = generateBasicPalette(color);

// New way
const palette = MonetAPI.generateMonetPalette(color);
const enhanced = MonetAPI.v2CreateEnhancedPalette(color);
```

### Backward Compatibility

- Tất cả color files v1 vẫn hoạt động
- API methods được preserve
- Fallback to basic colors khi cần

## Resources

- [Material Design Color](https://material.io/design/color/)
- [WCAG Color Guidelines](https://www.w3.org/TR/WCAG21/#contrast-minimum)
- [Color Theory Basics](https://www.interaction-design.org/literature/topics/color-theory)
- [MonetAPI Documentation](monet-api-guide.md)