# Hướng dẫn cài đặt HakoMonetTheme

## Tổng quan

HakoMonetTheme là một userscript mang lại giao diện Material You cho trang web Hako/DocLN. Để sử dụng, bạn cần cài đặt một extension quản lý userscript như Tampermonkey hoặc Violentmonkey.

## Bước 1: Cài đặt extension userscript

### Tùy chọn 1: Tampermonkey (Khuyến nghị)
- Truy cập [Tampermonkey](https://www.tampermonkey.net/)
- Cài đặt extension cho trình duyệt của bạn
- Khởi động lại trình duyệt

### Tùy chọn 2: Violentmonkey (Ưu tiên cho Chromium 138+)
- Truy cập [Violentmonkey](https://violentmonkey.github.io/get-it/)
- Cài đặt extension cho trình duyệt của bạn
- Khởi động lại trình duyệt

> **Lưu ý cho Tampermonkey trên Chromium 138+**: Nếu bạn sử dụng Manifest V3, bạn cần bật Developer Mode và cấp quyền "Cho phép sử dụng các tập tin thực thi". Chi tiết tại [Tampermonkey FAQ #209](https://www.tampermonkey.net/faq.php?locale=en#Q209).

## Bước 2: Cài đặt script HakoMonetTheme

1. Nhấp vào liên kết [raw userscript](https://sang765.github.io/HakoMonetTheme/HakoMonetTheme.user.js)
2. Trang cài đặt sẽ mở ra trong extension
3. Nhấn nút "Install" để cài đặt script

## Bước 3: Cấp quyền cross-origin

Khi bạn truy cập trang web Hako/DocLN lần đầu:
- Một thông báo sẽ xuất hiện yêu cầu cấp quyền cross-origin
- Nhấn "Always allow domain" để script hoạt động đầy đủ

## Bước 4: Kiểm tra cài đặt

- Truy cập bất kỳ trang nào trên Hako/DocLN
- Giao diện Material You sẽ được áp dụng tự động
- Bạn có thể truy cập menu cài đặt của script thông qua icon extension

## Hỗ trợ trình duyệt

- Chrome/Chromium (với Tampermonkey hoặc Violentmonkey)
- Firefox (với Tampermonkey)
- Safari (với Tampermonkey)
- Edge (với Tampermonkey)
- Opera (với Tampermonkey)

## Gỡ bỏ script

Nếu bạn muốn gỡ bỏ script:
1. Mở dashboard của Tampermonkey/Violentmonkey
2. Tìm "Hako: Monet Theme"
3. Nhấn "Delete" hoặc "Remove"