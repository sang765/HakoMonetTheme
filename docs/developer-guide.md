# Hướng Dẫn Phát Triển HakoMonetTheme

## Tổng Quan

HakoMonetTheme là một userscript phức tạp với kiến trúc modular, hỗ trợ theme Material You cho trang web Hako/DocLN. Tài liệu này hướng dẫn các nhà phát triển đóng góp code, thêm tính năng mới, và duy trì dự án.

## Kiến Trúc Dự Án

### Cấu Trúc Thư Mục

```
HakoMonetTheme/
├── main.js                    # Entry point, load tất cả modules
├── HakoMonetTheme.user.js     # Userscript header với metadata
├── module/                    # Các module chức năng
│   ├── config.js             # Quản lý cài đặt
│   ├── ad-blocker.js         # Chặn quảng cáo
│   ├── update-manager.js     # Quản lý cập nhật
│   └── ...
├── class/                     # Các class utility
│   ├── animation.js          # Xử lý animation
│   ├── font-import.js        # Import font
│   └── ...
├── colors/                    # Color schemes
│   ├── page-general-dark.js  # Màu cho trang chính (dark)
│   ├── page-info-truyen-dark.js # Màu cho trang info (dark)
│   └── ...
├── styles/                    # SCSS styles
│   ├── animation/
│   ├── device/
│   ├── info-truyen/
│   └── ...
├── api/                       # API utilities
├── lib/                       # Third-party libraries
├── website/                   # Web interface
├── docs/                      # Documentation
└── package.json               # Node.js dependencies
```

### Luồng Thực Thi

1. **main.js** load và khởi tạo tất cả modules theo thứ tự
2. Mỗi module expose API qua `window.HMT*` objects
3. Modules giao tiếp qua custom events
4. Colors được áp dụng dựa trên theme detection
5. Styles được compile từ SCSS sang CSS

## Phát Triển Cơ Bản

### Thiết Lập Môi Trường

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Chạy local development server:**
   ```bash
   # Windows
   run_local_host.bat

   # Linux/Mac
   chmod +x run_local_host.sh
   ./run_local_host.sh
   ```

3. **Cấu hình userscript:**
   - Import `HakoMonetTheme.user.js` vào Tampermonkey/Violentmonkey
   - Sử dụng GM command "🔧 Set Custom Host URL" để trỏ đến localhost

### Quy Tắc Coding

- Sử dụng IIFE pattern cho tất cả modules
- Expose API qua `window.HMT*` objects
- Sử dụng `GM_getValue`/`GM_setValue` cho persistent storage
- Phát custom events cho inter-module communication
- Log debug qua `window.Logger` khi có sẵn
- Xử lý lỗi gracefully

## Thêm Module Mới

### 1. Tạo Module File

Tạo file trong `module/` với pattern:

```javascript
(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG && typeof window.Logger !== 'undefined') {
            window.Logger.log('moduleName', ...args);
        } else if (DEBUG) {
            console.log('[ModuleName]', ...args);
        }
    }

    // Core functionality
    function someFunction() {
        debugLog('Function called');
        // Implementation
    }

    // Public API
    window.HMTModuleName = {
        someFunction: someFunction,
        initialize: function() {
            debugLog('Module initialized');
            // Setup code
        }
    };

    // Auto-initialize if needed
    // window.HMTModuleName.initialize();
})();
```

### 2. Thêm Vào main.js

Trong `main.js`, thêm resource loading:

```javascript
// Thêm vào phần load scripts
const moduleNameJS = GM_getResourceText('moduleNameJS');
loadScript(moduleNameJS, 'module-name.js');
```

### 3. Cập Nhật Userscript Header

Trong `HakoMonetTheme.user.js`, thêm resource:

```javascript
// @resource    moduleNameJS     https://sang765.github.io/HakoMonetTheme/module/module-name.js
```

### 4. Thêm Vào Load Order

Trong `main.js`, thêm vào phần load theo thứ tự phù hợp:

```javascript
// Load module mới
loadScript(moduleNameJS, 'module-name.js');
```

## Sửa Đổi Module Hiện Tại

### Tìm Module Cần Sửa

1. Xem `main.js` để tìm module load order
2. Đọc code module trong `module/`
3. Hiểu API được expose qua `window.HMT*`

### Ví Dụ: Thêm Tính Năng Mới

```javascript
// Trong module/config.js, thêm function mới
function newFeature() {
    debugLog('New feature activated');
    // Implementation
}

// Expose trong public API
window.HMTConfig = {
    // ... existing methods
    newFeature: newFeature
};
```

### Phát Events

```javascript
// Phát event khi có thay đổi
const event = new CustomEvent('hmtNewFeatureChanged', {
    detail: { data: someData }
});
document.dispatchEvent(event);
```

## Quản Lý Màu Sắc

### Thêm Color Scheme Mới

1. **Tạo file color trong `colors/`:**
   ```javascript
   // colors/page-new-section-dark.js
   (function() {
       'use strict';

       const DEBUG = GM_getValue('debug_mode', false);

       function applyColors() {
           if (DEBUG) console.log('[NewSectionColors] Applying dark theme');

           GM_addStyle(`
               .new-section {
                   --primary-color: #your-color;
                   --secondary-color: #your-color;
               }
           `);
       }

       // Auto-apply khi load
       if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', applyColors);
       } else {
           applyColors();
       }
   })();
   ```

2. **Thêm vào main.js:**
   ```javascript
   const newSectionColorsJS = GM_getResourceText('newSectionColorsJS');
   loadScript(newSectionColorsJS, 'page-new-section-dark.js');
   ```

3. **Cập nhật userscript header:**
   ```javascript
   // @resource    newSectionColorsJS    https://sang765.github.io/HakoMonetTheme/colors/page-new-section-dark.js
   ```

### Sửa Đổi Color Scheme Hiện Tại

1. Đọc file color trong `colors/`
2. Tìm CSS variables cần sửa
3. Test trên các trang khác nhau

## Phát Triển Styles

### SCSS Structure

```
styles/
├── animation/          # Animation effects
├── device/            # Device-specific styles
├── info-truyen/       # Story info page styles
├── reading-page/      # Reading page styles
├── tag-color/         # Tag color styles
├── userscript/        # Userscript UI styles
└── font/             # Font imports
```

### Thêm Style Mới

1. **Tạo SCSS file:**
   ```scss
   // styles/new-feature/new-feature.scss
   .new-feature {
       .component {
           color: var(--primary-color);
           transition: all 0.3s ease;
       }
   }
   ```

2. **Compile sang CSS:**
   ```bash
   npm run build:styles
   ```

3. **Include trong main.js:**
   ```javascript
   const newFeatureCSS = GM_getResourceText('newFeatureCSS');
   GM_addStyle(newFeatureCSS);
   ```

### Sửa Đổi Style Hiện Tại

1. Tìm file SCSS tương ứng trong `styles/`
2. Sửa đổi SCSS variables hoặc rules
3. Rebuild: `npm run build:styles`
4. Test trên target pages

## Testing & Debugging

### Debug Mode

Bật debug mode để xem logs:

```javascript
GM_setValue('debug_mode', true);
```

### Console Logs

Modules log với prefix `[ModuleName]`. Tìm logs liên quan để debug.

### Local Testing

1. Chạy local server
2. Cấu hình userscript trỏ đến localhost
3. Test trên target domains
4. Check console cho errors

### Cross-Browser Testing

Test trên:
- Chrome + Tampermonkey
- Firefox + Tampermonkey
- Safari + Tampermonkey
- Mobile browsers

## Build Process

### Dependencies

```json
{
  "scripts": {
    "build:styles": "node build-styles.js",
    "watch:styles": "node build-styles.js --watch",
    "lint": "eslint module/ class/ --ext .js",
    "test": "node test-runner.js"
  }
}
```

### Build Scripts

- **build-styles.js**: Compile SCSS → CSS với sourcemaps
- **test-runner.js**: Chạy unit tests
- **lint**: Code quality checks

### Release Process

1. Test tất cả changes
2. Update version trong `HakoMonetTheme.user.js`
3. Build styles: `npm run build:styles`
4. Commit và push to GitHub
5. Users sẽ tự động update qua update manager

## Best Practices

### Performance

- Sử dụng `requestAnimationFrame` cho UI updates
- Cache expensive operations
- Debounce/throttle event handlers
- Lazy load non-critical modules

### Security

- Validate user inputs
- Sanitize DOM manipulation
- Use CSP-compliant code
- Avoid eval() except for necessary cases

### Compatibility

- Check feature support trước khi sử dụng
- Provide fallbacks cho older browsers
- Test trên multiple userscript managers

### Code Quality

- Consistent naming conventions
- Comprehensive error handling
- Clear documentation comments
- Modular, reusable code

## Troubleshooting

### Common Issues

1. **Module không load:**
   - Check load order trong main.js
   - Verify resource URLs trong userscript header
   - Check console cho load errors

2. **Styles không áp dụng:**
   - Verify SCSS compilation
   - Check CSS variable definitions
   - Test trên correct pages

3. **Colors không hoạt động:**
   - Check theme detection logic
   - Verify color mode settings
   - Test color extraction functions

### Debug Tools

- **Logger API**: `window.Logger.log('module', data)`
- **Performance monitoring**: `window.Logger.performance('module', 'operation', start, end)`
- **Error tracking**: `window.Logger.error('module', error)`

## Contributing

1. Fork repository
2. Tạo feature branch
3. Implement changes
4. Add tests nếu applicable
5. Update documentation
6. Submit pull request

### Code Review Checklist

- [ ] Code follows established patterns
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Cross-browser compatibility tested
- [ ] Documentation updated
- [ ] No breaking changes without migration path

## Resources

- [Userscript API Reference](modules-api.md)
- [Color API Guide](monet-api-guide.md)
- [Installation Guide](installation-guide.md)
- [Troubleshooting](troubleshooting.md)
- [Local Development](local-tutorial.md)