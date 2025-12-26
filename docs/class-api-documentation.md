# Tài Liệu API Classes HakoMonetTheme

## Tổng Quan

HakoMonetTheme sử dụng kiến trúc class-based để tổ chức code. Các class được lưu trong thư mục `class/` và cung cấp các chức năng utility, style loading, và tính năng nâng cao.

## Kiến Trúc Class

### Pattern Chung

Tất cả classes đều sử dụng IIFE pattern:

```javascript
(function() {
    'use strict';

    const DEBUG = GM_getValue('debug_mode', false);

    function debugLog(...args) {
        if (DEBUG) {
            console.log('[ClassName]', ...args);
        }
    }

    function initClass() {
        debugLog('Class loaded');
        // Implementation
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initClass);
    } else {
        initClass();
    }
})();
```

### Loading Mechanism

Classes tự động load CSS từ `styles/` folder:

```javascript
function loadCSS(cssFile, mapFile) {
    Promise.all([
        fetch(FOLDER_URL + cssFile).then(r => r.text()),
        fetch(FOLDER_URL + mapFile).then(r => r.text())
    ])
    .then(([css, mapContent]) => {
        const mapDataUrl = 'data:application/json;base64,' +
            btoa(unescape(encodeURIComponent(mapContent)));
        css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

        const blob = new Blob([css], { type: 'text/css' });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = blobUrl;
        document.head.appendChild(link);
    });
}
```

## Class APIs

### Animation Class

**File:** `class/animation.js`

**Purpose:** Load animation CSS và quản lý hiệu ứng động.

#### API Methods

```javascript
// Auto-initialized - không có public API
// Chỉ load file: styles/animation/animation.css
```

#### Features

- Load animation styles với source maps
- Blob URL để tối ưu performance
- Auto-initialize khi DOM ready

### FontImport Class

**File:** `class/font-import.js`

**Purpose:** Import và quản lý fonts tùy chỉnh.

#### API Methods

```javascript
// Auto-initialized - không có public API
// Chỉ load file: styles/font/font-import.css
```

#### Features

- Load font definitions từ external CSS
- Support source maps
- Memory-efficient với Blob URLs

### InfoTruyen Class

**File:** `class/info-truyen.js`

**Purpose:** Cải thiện giao diện trang thông tin truyện với các tính năng nâng cao.

#### API Methods

```javascript
// Auto-initialized - không có public API
// Nhưng expose internal functions qua window object nếu cần
```

#### Core Features

##### 1. Device-Specific Styles

```javascript
// Tự động detect device và áp dụng CSS phù hợp
function addDeviceSpecificStyles() {
    // Load: device-base.css + device-{mobile|tablet|desktop}.css
}
```

##### 2. Thumbnail Effects

```javascript
// Hiệu ứng nền mờ từ ảnh bìa truyện
function setupThumbnailEffects() {
    // - Retry mechanism với exponential backoff
    // - CORS-safe image loading
    // - DOM observer cho dynamic content
    // - Orientation detection
}
```

##### 3. CORS-Safe Image Loading

```javascript
// Smart proxy system cho thumbnail loading
async function getCorsSafeThumbnail(originalUrl, options) {
    // - Test direct access first
    // - Fallback to proxy servers
    // - Time-based proxy usage
    // - Cache successful URLs
}
```

##### 4. Portrait Mode Support

```javascript
// Responsive design cho màn hình dọc
function setupPortraitCSSRedesign() {
    // - Orientation change detection
    // - Dynamic CSS loading/unloading
    // - Resize event handling
}
```

##### 5. Service Worker Integration

```javascript
// Offline caching và background sync
function preloadRelatedThumbnails(coverUrl) {
    // - Preload related images
    // - Background sync registration
    // - CORS-safe URL processing
}

function cacheCurrentStoryData() {
    // - Extract story metadata
    // - Cache for offline access
    // - Generate story IDs
}
```

#### Configuration Options

```javascript
const PROXY_SERVERS = [
    'https://images.weserv.nl/?url=',
    'https://api.allorigins.win/raw?url=',
    // ...
];

const DEBUG_LEVELS = {
    CORS_CHECK: 'cors_check',
    PROXY_ATTEMPT: 'proxy_attempt',
    FALLBACK_USED: 'fallback_used'
};
```

#### Event Listeners

- `orientationchange`: Handle device rotation
- `resize`: Backup for orientation changes
- DOM mutations: Monitor dynamic content loading

### ReadingPage Class

**File:** `class/reading-page.js`

**Purpose:** Tối ưu giao diện trang đọc truyện.

#### API Methods

```javascript
// Auto-initialized
// Load: styles/reading-page/reading-page.css
```

#### Features

- Reading-specific layout optimizations
- Touch-friendly controls
- Performance optimizations for long content

### TagColor Class

**File:** `class/tag-color.js`

**Purpose:** Áp dụng màu sắc cho tags và categories.

#### API Methods

```javascript
// Auto-initialized
// Load: styles/tag-color/tag-color.css
```

#### Features

- Dynamic tag color assignment
- Theme-aware color selection
- Accessibility-compliant contrast ratios

### Monet Class

**File:** `class/monet.js`

**Purpose:** Core Monet color system implementation.

#### API Methods

```javascript
// Expose MonetAPI globally
window.MonetAPI = {
    generateMonetPalette: function(color) {
        // Generate Material You color palette
    },

    v2CreateEnhancedPalette: function(color, options) {
        // Enhanced palette with accessibility
    },

    // ... more methods
};
```

#### Features

- Material You color palette generation
- Accessibility analysis
- Color harmony detection
- Performance caching

### Service Worker Integration

**File:** `api/service-worker.js`

**Purpose:** Background processing và offline capabilities.

#### API Methods

```javascript
window.HMTServiceWorker = {
    preloadThumbnails: function(urls, priority) {
        // Preload images for better performance
    },

    cacheStoryData: function(storyId, data) {
        // Cache story metadata
    },

    clearCache: function(cacheType) {
        // Clear specific caches
    },

    getCacheStatus: function() {
        // Return cache statistics
    }
};
```

## Development Guide

### Adding New Class

1. **Create class file:**
   ```javascript
   // class/new-feature.js
   (function() {
       'use strict';

       function initNewFeature() {
           // Implementation
       }

       // Auto-init
       if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', initNewFeature);
       } else {
           initNewFeature();
       }
   })();
   ```

2. **Add to main.js:**
   ```javascript
   const newFeatureJS = GM_getResourceText('newFeatureJS');
   loadScript(newFeatureJS, 'new-feature.js');
   ```

3. **Update userscript header:**
   ```javascript
   // @resource    newFeatureJS    https://sang765.github.io/HakoMonetTheme/class/new-feature.js
   ```

### Modifying Existing Class

1. **Understand current API**
2. **Add backward compatibility**
3. **Test thoroughly**
4. **Update documentation**

### CSS Loading Pattern

```javascript
function loadStylesWithSourceMap(cssFile, mapFile) {
    return Promise.all([
        fetch(FOLDER_URL + cssFile).then(r => r.text()),
        fetch(FOLDER_URL + mapFile).then(r => r.text())
    ])
    .then(([css, mapContent]) => {
        const mapDataUrl = 'data:application/json;base64,' +
            btoa(unescape(encodeURIComponent(mapContent)));
        css += '\n/*# sourceMappingURL=' + mapDataUrl + ' */';

        const blob = new Blob([css], { type: 'text/css' });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = blobUrl;
        document.head.appendChild(link);

        return blobUrl; // Return for cleanup if needed
    });
}
```

## Performance Considerations

### Memory Management

- Classes tự cleanup khi không cần thiết
- Blob URLs được quản lý để tránh memory leaks
- Event listeners được remove properly

### Loading Optimization

- CSS loaded asynchronously
- Source maps chỉ trong development
- Critical CSS loaded first

### Error Handling

```javascript
function safeLoadCSS(cssFile, mapFile) {
    return loadStylesWithSourceMap(cssFile, mapFile)
        .catch(error => {
            debugLog('Failed to load CSS:', error);
            // Fallback to basic styles or skip
        });
}
```

## Debugging

### Debug Mode

Enable debug logging:

```javascript
GM_setValue('debug_mode', true);
```

### Console Output

Each class logs with prefix:
- `[Animation]`
- `[FontImport]`
- `[InfoTruyen]`
- etc.

### Performance Monitoring

```javascript
// Monitor class initialization time
const startTime = performance.now();
initClass();
const loadTime = performance.now() - startTime;
debugLog(`Class loaded in ${loadTime.toFixed(2)}ms`);
```

## Testing

### Unit Testing

```javascript
// Example test for InfoTruyen class
function testCorsSafeThumbnail() {
    const testUrl = 'https://example.com/image.jpg';

    getCorsSafeThumbnail(testUrl)
        .then(result => {
            console.assert(typeof result === 'string', 'Should return string URL');
            console.assert(result.includes('http'), 'Should be valid URL');
        })
        .catch(error => {
            console.error('Test failed:', error);
        });
}
```

### Integration Testing

- Test trên multiple domains
- Verify CORS handling
- Check responsive behavior
- Validate accessibility

## Migration Guide

### From Function-Based to Class-Based

**Old approach:**
```javascript
function initFeature() {
    // Code
}
initFeature();
```

**New approach:**
```javascript
(function() {
    'use strict';

    function initFeature() {
        // Code
    }

    // Auto-init with DOM ready check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFeature);
    } else {
        initFeature();
    }
})();
```

### Adding API Methods

```javascript
// Expose public API
window.HMTNewClass = {
    publicMethod: function() {
        // Implementation
    },

    getStatus: function() {
        return internalState;
    }
};
```

## Best Practices

### Code Organization

- One responsibility per class
- Consistent naming conventions
- Comprehensive error handling
- Performance-conscious code

### Documentation

- Comment complex logic
- Document public APIs
- Update docs when modifying
- Include usage examples

### Maintenance

- Regular code cleanup
- Remove deprecated features
- Keep dependencies updated
- Monitor performance impact

## Resources

- [IIFE Pattern](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
- [Blob URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)