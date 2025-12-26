# Hướng Dẫn Migration HakoMonetTheme

## Tổng Quan

Tài liệu này hướng dẫn cách nâng cấp HakoMonetTheme từ phiên bản cũ lên phiên bản mới nhất, bao gồm breaking changes, new features, và migration steps.

## Phiên Bản Hiện Tại

**Current Version:** 2.0+ (Integrated MonetAPI)
**Previous Versions:** 1.x, 0.x

## Migration từ v1.x → v2.0

### Breaking Changes

#### 1. MonetAPI Restructuring

**Trước (v1.x):**
```javascript
// Direct API calls
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const rgba = MonetAPI.paletteToRgba(palette, 500, 0.8);
```

**Sau (v2.0):**
```javascript
// Enhanced API with backward compatibility
const palette = MonetAPI.generateMonetPalette('#3F51B5');
const rgba = MonetAPI.paletteToRgba(palette, 500, 0.8);

// New v2 features available
const enhanced = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
const harmonies = MonetAPI.v2GetColorHarmonies('#3F51B5');
```

#### 2. Configuration Changes

**Theme Detection:**
- Tự động phát hiện dark/light mode
- Không cần cấu hình thủ công

**Color Modes:**
- Thêm chế độ "thumbnail" cho trang đọc
- Chế độ "avatar" cho trang profile

#### 3. Module Loading

**Service Worker Integration:**
- Tự động cache resources
- Background sync cho updates
- Offline capabilities

### Migration Steps

#### Bước 1: Backup Settings

```javascript
// Export current settings (if available)
const settings = {
    defaultColor: GM_getValue('default_color'),
    hideDomainWarning: GM_getValue('hide_domain_warning'),
    colorMode: GM_getValue('color_mode'),
    // ... other settings
};

// Save to file or console
console.log('Current settings:', JSON.stringify(settings, null, 2));
```

#### Bước 2: Update Userscript

1. **Uninstall old version:**
   - Mở Tampermonkey/Violentmonkey dashboard
   - Tìm "Hako: Monet Theme"
   - Click "Delete" hoặc "Remove"

2. **Install new version:**
   - Truy cập: https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js
   - Click "Install"

3. **Verify installation:**
   - Check console cho version info
   - Test basic functionality

#### Bước 3: Restore Settings

Most settings will migrate automatically, but verify:

```javascript
// Check migrated settings
console.log('Default color:', GM_getValue('default_color'));
console.log('Color mode:', GM_getValue('color_mode'));
console.log('Avatar extraction:', GM_getValue('extract_color_from_avatar'));
```

#### Bước 4: Test New Features

```javascript
// Test v2.0 features
try {
    const enhanced = MonetAPI.v2CreateEnhancedPalette('#3F51B5');
    console.log('v2.0 API available:', !!enhanced);

    const harmonies = MonetAPI.v2GetColorHarmonies('#3F51B5');
    console.log('Color harmonies:', harmonies);
} catch (error) {
    console.log('v2.0 features not available:', error.message);
}
```

## Migration từ v0.x → v1.x/v2.0

### Major Changes

#### Configuration System Overhaul

**Old (v0.x):**
- Limited color options
- No theme detection
- Basic customization

**New (v1.x+):**
- Advanced color picker
- HSL color control
- Multiple color modes
- Avatar color extraction

#### Module Architecture

**Old:**
- Monolithic code structure
- Limited extensibility

**New:**
- Modular architecture
- Plugin system
- Service worker integration

### Migration Path

1. **Complete uninstall** của v0.x
2. **Fresh install** v2.0
3. **Reconfigure** settings từ đầu
4. **Test thoroughly** trên target sites

## New Features Guide

### Enhanced Color System

#### Color Picker Improvements

```javascript
// Screen color picker
window.HMTConfig.createScreenColorPicker(function(color) {
    console.log('Selected color:', color);
    // Color is automatically saved
});
```

#### HSL Color Control

- **Hue:** 0-360° (Màu sắc)
- **Saturation:** 0-100% (Độ bão hòa)
- **Lightness:** 0-100% (Độ sáng)

#### Color Harmonies

```javascript
const harmonies = MonetAPI.v2GetColorHarmonies('#3F51B5');
console.log(harmonies);
// {
//   complementary: "#B5313F",
//   analogous: ["#3F51B5", "#513FB5", "#3FB551"],
//   triadic: ["#3F51B5", "#B53F51", "#51B53F"],
//   splitComplementary: ["#3F51B5", "#B53F88", "#88B53F"]
// }
```

### Advanced Configuration

#### Multiple Color Modes

```javascript
// Trang đọc truyện
window.HMTConfig.setColorMode('thumbnail'); // 'default' | 'thumbnail'

// Trang thông tin truyện
window.HMTConfig.setInfoPageColorMode('avatar'); // 'default' | 'avatar' | 'thumbnail'

// Trang profile
window.HMTConfig.setProfileColorMode('banner'); // 'default' | 'avatar' | 'banner'
```

#### Avatar Color Extraction

```javascript
// Enable avatar color extraction
window.HMTConfig.setExtractColorFromAvatar(true);

// Works on general pages, overrides default color
// Automatically detects avatar changes
```

#### Proxy System

```javascript
// Enable CORS proxy
window.HMTConfig.setUseProxy(true);

// Choose proxy server
window.HMTConfig.setPreferredProxy('images.weserv.nl');
```

### Performance Improvements

#### Caching System

- **Palette caching:** Avoids recomputation
- **Image caching:** Reduces network requests
- **Service worker:** Offline capabilities

#### Optimized Rendering

- **Debounced updates:** Prevents excessive re-renders
- **RequestAnimationFrame:** Smooth animations
- **Memory management:** Automatic cleanup

### Developer Features

#### Debug Mode

```javascript
// Enable detailed logging
GM_setValue('debug_mode', true);

// Check console for detailed logs
// Prefix: [HMTConfig], [InfoTruyen], [Animation], etc.
```

#### API Access

```javascript
// Access internal APIs
window.HMTConfig.getDefaultColor();
window.HMTUpdateManager.checkForUpdatesManual();
window.HMTServiceWorker.cacheStoryData(storyId, data);
```

## Troubleshooting Migration

### Common Issues

#### 1. Colors Not Applying

**Symptoms:**
- Theme colors not showing
- Default colors only

**Solutions:**
```javascript
// Check theme detection
console.log('Dark mode:', document.cookie.includes('night_mode=true'));

// Verify color settings
console.log('Default color:', window.HMTConfig.getDefaultColor());
console.log('Color mode:', window.HMTConfig.getColorMode());

// Reset to defaults
window.HMTConfig.setDefaultColor('#063c30');
window.HMTConfig.setColorMode('default');
```

#### 2. Scripts Not Loading

**Symptoms:**
- Console errors about missing modules
- Features not working

**Solutions:**
```javascript
// Clear browser cache
location.reload(true);

// Reinstall userscript
// Check network connectivity
// Verify userscript manager permissions
```

#### 3. Avatar Colors Not Working

**Symptoms:**
- Avatar extraction enabled but not working
- Fallback to default colors

**Solutions:**
```javascript
// Check avatar element exists
const avatar = document.querySelector('.nav-user_avatar img');
console.log('Avatar found:', !!avatar);

// Verify avatar URL
console.log('Avatar src:', avatar?.src);

// Test image loading
fetch(avatar.src).then(r => console.log('Avatar accessible:', r.ok));
```

#### 4. Performance Issues

**Symptoms:**
- Slow page loads
- High CPU usage
- Memory leaks

**Solutions:**
```javascript
// Disable heavy features
window.HMTConfig.setExtractColorFromAvatar(false);
window.HMTConfig.setColorMode('default');

// Clear caches
window.HMTServiceWorker.clearCache();

// Disable debug mode
GM_setValue('debug_mode', false);
```

### Compatibility Issues

#### Browser Compatibility

- **Chrome:** Full support
- **Firefox:** Full support
- **Safari:** Limited support for some features
- **Edge:** Full support

#### Userscript Manager

- **Tampermonkey:** Recommended
- **Violentmonkey:** Full support
- **Greasemonkey:** Limited support

## Rollback Procedures

### Emergency Rollback

If v2.0 causes issues:

1. **Disable new features:**
   ```javascript
   // Revert to basic mode
   window.HMTConfig.setColorMode('default');
   window.HMTConfig.setExtractColorFromAvatar(false);
   window.HMTConfig.setUseProxy(false);
   ```

2. **Downgrade if necessary:**
   - Uninstall v2.0
   - Install previous version from GitHub releases
   - Restore settings backup

### Settings Backup/Restore

```javascript
// Backup all settings
function backupSettings() {
    const settings = {};
    const keys = GM_listValues();

    for (const key of keys) {
        settings[key] = GM_getValue(key);
    }

    // Download as JSON file
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'hmt-settings-backup.json';
    link.click();
}

// Restore settings
function restoreSettings(settings) {
    for (const [key, value] of Object.entries(settings)) {
        GM_setValue(key, value);
    }
    location.reload();
}
```

## Version Compatibility Matrix

| Feature | v0.x | v1.x | v2.0 |
|---------|------|------|------|
| Basic colors | ✅ | ✅ | ✅ |
| HSL picker | ❌ | ✅ | ✅ |
| Avatar extraction | ❌ | ✅ | ✅ |
| Thumbnail colors | ❌ | ✅ | ✅ |
| Proxy system | ❌ | ✅ | ✅ |
| Service worker | ❌ | ❌ | ✅ |
| Color harmonies | ❌ | ❌ | ✅ |
| Enhanced caching | ❌ | ❌ | ✅ |
| Debug tools | ❌ | ✅ | ✅ |

## Future Migration Planning

### Upcoming Changes

- **v3.0:** Complete rewrite with modern architecture
- **Modular loading:** On-demand module loading
- **Theme presets:** Predefined color schemes
- **User sync:** Cross-device settings sync

### Preparing for Future Updates

```javascript
// Feature detection
const features = {
    v2API: typeof MonetAPI.v2CreateEnhancedPalette === 'function',
    serviceWorker: 'serviceWorker' in navigator,
    proxySupport: typeof window.HMTConfig?.setUseProxy === 'function'
};

console.log('Available features:', features);
```

## Support Resources

### Getting Help

1. **GitHub Issues:** Report bugs and request features
2. **Discord Community:** Real-time support
3. **Documentation:** Check docs/ folder for detailed guides

### Debug Information

When reporting issues, include:

```javascript
// System information
const debugInfo = {
    version: GM_info.script.version,
    browser: navigator.userAgent,
    url: window.location.href,
    theme: document.cookie.includes('night_mode=true') ? 'dark' : 'light',
    settings: {
        colorMode: window.HMTConfig?.getColorMode(),
        avatarExtraction: window.HMTConfig?.getExtractColorFromAvatar(),
        proxyEnabled: window.HMTConfig?.getUseProxy()
    },
    features: {
        v2API: typeof MonetAPI.v2CreateEnhancedPalette === 'function',
        serviceWorker: !!navigator.serviceWorker
    }
};

console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
```

## Conclusion

Migration to v2.0 brings significant improvements in performance, features, and user experience. While there are some breaking changes, the migration process is designed to be smooth with backward compatibility maintained where possible.

For most users, simply updating the userscript will work seamlessly. Advanced users may want to explore the new features and configuration options available in v2.0.

Remember to backup your settings before major updates, and don't hesitate to reach out for support if you encounter any issues during migration.