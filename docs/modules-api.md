# Tài liệu API các Module HakoMonetTheme

## Tổng quan

HakoMonetTheme được xây dựng theo kiến trúc modular, với các module độc lập giao tiếp qua global objects. Tài liệu này mô tả API của các module chính.

## HMTMainMenu

Module quản lý menu chính của userscript.

### API Methods

#### `openMainMenu()`
Mở dialog menu chính với các tùy chọn cài đặt.

```javascript
window.HMTMainMenu.openMainMenu();
```

#### `updateVersionDisplay()`
Cập nhật hiển thị phiên bản trong menu.

```javascript
window.HMTMainMenu.updateVersionDisplay();
```

#### `initialize()`
Khởi tạo module (tự động gọi khi load).

## HMTConfig

Module quản lý cấu hình và cài đặt của userscript.

### API Methods

#### Getters
```javascript
// Lấy màu mặc định
const color = window.HMTConfig.getDefaultColor();

// Lấy màu mặc định trang thông tin
const infoColor = window.HMTConfig.getInfoPageDefaultColor();

// Lấy màu cuối cùng được chọn từ screen picker
const lastColor = window.HMTConfig.getLastPickedColor();

// Kiểm tra trạng thái ẩn cảnh báo tên miền
const hideWarning = window.HMTConfig.getHideDomainWarning();

// Kiểm tra trạng thái tắt màu trên trang đọc
const disableReading = window.HMTConfig.getDisableColorsOnReadingPage();

// Lấy chế độ màu
const colorMode = window.HMTConfig.getColorMode();

// Lấy chế độ màu trang thông tin
const infoColorMode = window.HMTConfig.getInfoPageColorMode();

// Lấy chế độ màu trang profile
const profileColorMode = window.HMTConfig.getProfileColorMode();

// Kiểm tra trích xuất màu từ avatar
const extractAvatar = window.HMTConfig.getExtractColorFromAvatar();

// Kiểm tra sử dụng proxy
const useProxy = window.HMTConfig.getUseProxy();

// Lấy proxy ưu tiên
const proxy = window.HMTConfig.getPreferredProxy();
```

#### Setters
```javascript
// Lưu màu mặc định
window.HMTConfig.setDefaultColor('#206452');

// Lưu màu mặc định trang thông tin
window.HMTConfig.setInfoPageDefaultColor('#206452');

// Lưu màu cuối cùng được pick
window.HMTConfig.setLastPickedColor('#206452');

// Cài đặt ẩn cảnh báo tên miền
window.HMTConfig.setHideDomainWarning(true);

// Cài đặt tắt màu trên trang đọc
window.HMTConfig.setDisableColorsOnReadingPage(false);

// Cài đặt chế độ màu
window.HMTConfig.setColorMode('thumbnail'); // 'default' | 'thumbnail'

// Cài đặt chế độ màu trang thông tin
window.HMTConfig.setInfoPageColorMode('avatar'); // 'default' | 'avatar' | 'thumbnail'

// Cài đặt chế độ màu trang profile
window.HMTConfig.setProfileColorMode('banner'); // 'default' | 'avatar' | 'banner'

// Cài đặt trích xuất màu từ avatar
window.HMTConfig.setExtractColorFromAvatar(true);

// Cài đặt sử dụng proxy
window.HMTConfig.setUseProxy(true);

// Cài đặt proxy ưu tiên
window.HMTConfig.setPreferredProxy('images.weserv.nl');
```

#### Dialog & Tools
```javascript
// Mở dialog cài đặt
window.HMTConfig.openConfigDialog();

// Tạo screen color picker
window.HMTConfig.createScreenColorPicker(function(selectedColor) {
    console.log('Màu đã chọn:', selectedColor);
});

// Khởi tạo module
window.HMTConfig.initialize();

// Đảm bảo cookie ẩn cảnh báo tên miền
window.HMTConfig.ensureDomainWarningCookies();
```

### Events

Module phát ra các custom events để các module khác cập nhật real-time:

- `hmtColorChanged`: Khi màu sắc thay đổi
- `hmtInfoPageDefaultColorChanged`: Khi màu trang thông tin thay đổi
- `hmtDisableColorsChanged`: Khi cài đặt tắt màu thay đổi
- `hmtModeChanged`: Khi chế độ màu thay đổi
- `hmtInfoPageColorModeChanged`: Khi chế độ màu trang thông tin thay đổi
- `hmtProfileColorModeChanged`: Khi chế độ màu trang profile thay đổi
- `hmtExtractAvatarColorChanged`: Khi cài đặt trích xuất avatar thay đổi
- `hmtUseProxyChanged`: Khi cài đặt proxy thay đổi
- `hmtPreferredProxyChanged`: Khi proxy ưu tiên thay đổi

## HMTAdBlocker

Module chặn banner quảng cáo.

### API Methods

#### `isEnabled()`
Kiểm tra trạng thái ad blocker.

```javascript
const enabled = window.HMTAdBlocker.isEnabled();
```

#### `setEnabled(enabled)`
Bật/tắt ad blocker.

```javascript
window.HMTAdBlocker.setEnabled(true);
```

#### `toggle()`
Chuyển đổi trạng thái ad blocker.

```javascript
window.HMTAdBlocker.toggle();
```

#### `openDialog()`
Mở dialog cài đặt ad blocker.

```javascript
window.HMTAdBlocker.openDialog();
```

#### `initialize()`
Khởi tạo module (tự động gọi khi load).

## HMTUpdateManager

Module quản lý cập nhật userscript với tính năng nâng cao.

### API Methods

#### Core Functions
```javascript
// Kiểm tra cập nhật thủ công
window.HMTUpdateManager.checkForUpdatesManual();

// Hiển thị dialog cập nhật
window.HMTUpdateManager.showUpdateDialog(currentVersion, newVersion);

// Mở cài đặt cập nhật nâng cao
window.HMTUpdateManager.openUpdateSettings();

// Lấy changelog
window.HMTUpdateManager.fetchChangelog(currentVersion, newVersion).then(changelog => {
    console.log('Changelog:', changelog);
});

// Tạo changelog từ commits
const changelog = window.HMTUpdateManager.generateChangelog(commits, currentVersion, newVersion);

// So sánh phiên bản
const isNewer = window.HMTUpdateManager.isNewerVersion('2.1.0', '2.0.0');
```

#### Enhanced Features
```javascript
// Hiển thị thông báo thông minh
window.HMTUpdateManager.showSmartNotification(
    'Tiêu đề',
    'Nội dung thông báo',
    {
        style: 'toast', // 'toast' | 'modal' | 'badge' | 'banner'
        timeout: 5000,
        priority: 'normal', // 'low' | 'normal' | 'high'
        actions: [
            {
                id: 'action1',
                label: 'Hành động',
                callback: () => console.log('Action clicked')
            }
        ]
    }
);

// Lấy dữ liệu analytics
const analytics = window.HMTUpdateManager.getAnalyticsData();

// Lấy nhóm A/B testing
const abGroups = window.HMTUpdateManager.getABTestGroup();

// Xóa dữ liệu analytics
window.HMTUpdateManager.clearAnalyticsData();
```

#### System Info
```javascript
// Lấy thông tin hệ thống
const info = window.HMTUpdateManager.getSystemInfo();
// Returns: { version, notificationStyles, activeNotifications, queuedNotifications, abTestGroups, analyticsEnabled }
```

#### Manual Controls
```javascript
// Xóa tất cả cài đặt
window.HMTUpdateManager.clearAllSettings();

// Khởi tạo module
window.HMTUpdateManager.initialize();
```

### Notification Styles

Module hỗ trợ 4 kiểu thông báo:

- `NOTIFICATION_STYLES.TOAST`: Thông báo góc màn hình, không gây phiền
- `NOTIFICATION_STYLES.MODAL`: Hộp thoại toàn màn hình
- `NOTIFICATION_STYLES.BADGE`: Huy hiệu góc màn hình
- `NOTIFICATION_STYLES.BANNER`: Banner đầu trang

## HMTUpdateChecker

Module kiểm tra cập nhật (deprecated, tích hợp vào HMTUpdateManager).

## Các Module Khác

### HMTAntiPopup
Module chặn popup quảng cáo.

```javascript
// Mở dialog cài đặt
window.HMTAntiPopup.openDialog();
```

### Các Module Cơ Sở
- `HMTThemeDetector`: Phát hiện theme sáng/tối
- `HMTDeviceDetector`: Phát hiện thiết bị
- `HMTCors`: Xử lý CORS
- `HMTFullscreen`: Quản lý fullscreen
- `HMTKeyboardShortcuts`: Phím tắt
- `HMTNavbarLogo`: Logo navbar
- `HMTProfileCropper`: Crop ảnh profile

## Sự kiện Global

Các module giao tiếp qua custom events:

```javascript
// Lắng nghe sự kiện màu sắc thay đổi
document.addEventListener('hmtColorChanged', function(event) {
    const { color, timestamp, isPreview } = event.detail;
    console.log('Màu mới:', color, 'Preview:', isPreview);
});

// Lắng nghe sự kiện chế độ thay đổi
document.addEventListener('hmtModeChanged', function(event) {
    const { mode } = event.detail;
    console.log('Chế độ mới:', mode);
});
```

## Khởi tạo

Tất cả module tự động khởi tạo khi userscript load. Không cần gọi `initialize()` thủ công.

## Debug Mode

Khi bật debug mode (`GM_setValue('debug_mode', true)`), các module sẽ log chi tiết ra console để debug.

## Best Practices

1. **Sử dụng getters/setters**: Luôn dùng API methods thay vì truy cập GM_getValue trực tiếp
2. **Lắng nghe events**: Subscribe vào events để cập nhật UI real-time
3. **Error handling**: Wrap API calls trong try-catch
4. **Performance**: Tránh gọi API trong vòng lặp, cache kết quả khi cần

## Migration Guide

### Từ v1.x sang v2.x
- `HMTUpdateChecker` → `HMTUpdateManager`
- Thêm support cho notification styles mới
- Enhanced analytics và A/B testing
- Multi-CDN update system