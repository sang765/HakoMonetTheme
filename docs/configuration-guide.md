# Hướng dẫn cấu hình HakoMonetTheme

## Tổng quan

HakoMonetTheme cung cấp nhiều tùy chọn cấu hình để tùy chỉnh trải nghiệm người dùng theo ý muốn. Bạn có thể truy cập menu cài đặt thông qua extension userscript manager hoặc menu chính của script.

## Cách truy cập cài đặt

### Phương pháp 1: Qua extension manager
1. Mở dashboard của Tampermonkey/Violentmonkey
2. Tìm script "Hako: Monet Theme"
3. Nhấn nút "Menu chính" hoặc "Settings"

### Phương pháp 2: Qua menu chính của script
1. Truy cập bất kỳ trang nào của Hako/DocLN
2. Nhấn vào icon userscript trên thanh công cụ trình duyệt
3. Chọn "Menu chính > Cài đặt"

## Các tùy chọn cấu hình

### 🎨 Màu mặc định

**Mô tả**: Chọn màu sẽ được sử dụng khi không thể tự động trích xuất màu từ ảnh bìa truyện.

**Cách sử dụng**:
- Sử dụng thanh trượt HSL để điều chỉnh màu sắc theo ý muốn
- Nhập trực tiếp mã màu HEX (ví dụ: #063c30)
- Sử dụng công cụ chọn màu từ màn hình để lấy màu từ bất kỳ điểm nào trên trang web

**Lưu ý**: Cài đặt này chỉ có hiệu lực khi chế độ màu được đặt là "Mặc định" và không bật trích xuất màu từ avatar.

### 🚫 Ẩn cảnh báo tên miền

**Mô tả**: Tự động ẩn các cảnh báo về tên miền và thông báo hệ thống trên trang web.

**Tác dụng**: Giúp giao diện sạch sẽ hơn bằng cách loại bỏ các thông báo không mong muốn.

### 📖 Tắt áp dụng chủ đề trên trang đọc truyện

**Mô tả**: Vô hiệu hóa việc áp dụng màu sắc theme trên các trang đọc truyện.

**Khi nào sử dụng**: Nếu bạn muốn trang đọc truyện giữ giao diện gốc mà không bị ảnh hưởng bởi màu theme.

### 🎯 Chế độ màu

#### Trang đọc
- **Mặc định**: Sử dụng màu được cấu hình trong phần "Màu mặc định"
- **Thumbnail**: Tự động trích xuất màu từ ảnh bìa truyện

#### Trang thông tin truyện
- **Mặc định**: Sử dụng màu được cấu hình trong phần "Màu mặc định"
- **Avatar**: Trích xuất màu từ ảnh avatar của truyện (nếu có)
- **Thumbnail**: Trích xuất màu từ ảnh bìa truyện

#### Trang profile
- **Mặc định**: Sử dụng màu được cấu hình trong phần "Màu mặc định"
- **Avatar**: Trích xuất màu từ ảnh avatar người dùng
- **Banner**: Trích xuất màu từ ảnh banner profile (nếu có)

### 👤 Trích xuất màu từ avatar

**Mô tả**: Tự động lấy màu chủ đạo từ ảnh avatar của bạn để làm màu theme.

**Hỗ trợ**: JPG, PNG và GIF (chỉ frame đầu tiên để tối ưu hiệu suất)

**Lưu ý**: Chỉ áp dụng cho giao diện chung, không ảnh hưởng đến trang thông tin truyện và trang đọc truyện.

### 🌐 Sử dụng proxy

**Mô tả**: Sử dụng proxy để tránh lỗi CORS khi tải ảnh thumbnail và trích xuất màu.

**Proxy có sẵn**:
- **images.weserv.nl**: Proxy mặc định, ổn định
- **allOrigins.nl**: Proxy thay thế
- **cors-anywhere.herokuapp.com**: Proxy miễn phí (có giới hạn)
- **corsproxy.io**: Proxy nhanh (có giới hạn request)

**Khuyến nghị**: Giữ bật proxy để đảm bảo script hoạt động đầy đủ.

## Lưu và áp dụng cài đặt

1. Thực hiện các thay đổi mong muốn trong menu cài đặt
2. Nhấn nút "Lưu cài đặt" để áp dụng
3. Trang sẽ tự động tải lại để áp dụng các thay đổi

## Khôi phục cài đặt mặc định

Nếu muốn quay về cài đặt gốc:
1. Trong menu cài đặt, nhấn nút "Khôi phục mặc định"
2. Xác nhận hành động
3. Tất cả cài đặt sẽ được reset về giá trị ban đầu

## Mẹo và lưu ý

- **Màu sắc**: Thay đổi màu sắc sẽ được áp dụng ngay lập tức trong chế độ xem trước
- **Hiệu suất**: Việc trích xuất màu từ ảnh có thể ảnh hưởng nhẹ đến hiệu suất tải trang
- **Tương thích**: Một số tính năng có thể không khả dụng trên tất cả trình duyệt
- **Cookie**: Cài đặt ẩn cảnh báo tên miền sử dụng cookie vĩnh viễn

## Xử lý sự cố

Nếu cài đặt không được lưu hoặc không có hiệu lực:
1. Kiểm tra quyền của userscript (GM_setValue, GM_getValue)
2. Thử tắt và bật lại script
3. Xóa dữ liệu script trong extension manager và cài đặt lại