# Hướng dẫn xử lý sự cố HakoMonetTheme

## Tổng quan

Tài liệu này hướng dẫn xử lý các vấn đề thường gặp khi sử dụng HakoMonetTheme. Nếu bạn gặp vấn đề không được liệt kê, hãy tạo issue trên GitHub.

## Vấn đề cài đặt

### Script không hoạt động sau khi cài đặt

**Triệu chứng**: Script được cài đặt nhưng không thấy thay đổi giao diện.

**Nguyên nhân có thể**:
- Chưa cấp quyền cross-origin
- Script bị tắt
- Trang web chưa được hỗ trợ

**Giải pháp**:
1. Kiểm tra script có được bật trong extension manager
2. Làm mới trang web (Ctrl+F5)
3. Cấp quyền cross-origin khi được yêu cầu
4. Kiểm tra console browser có lỗi nào không (F12 → Console)

### Không thể cài đặt script

**Lỗi**: "Script cannot be installed"

**Nguyên nhân**: Phiên bản Tampermonkey quá cũ hoặc xung đột với extension khác.

**Giải pháp**:
1. Cập nhật Tampermonkey/Violentmonkey lên phiên bản mới nhất
2. Tắt các extension khác có thể xung đột
3. Thử cài đặt trên trình duyệt khác

## Vấn đề màu sắc

### Màu không áp dụng

**Triệu chứng**: Script hoạt động nhưng màu sắc không thay đổi.

**Nguyên nhân có thể**:
- Chế độ màu được đặt là "Mặc định" nhưng chưa chọn màu
- Tắt áp dụng màu trên trang đọc truyện
- Lỗi trích xuất màu từ ảnh

**Giải pháp**:
1. Mở menu cài đặt (Menu chính → Cài đặt)
2. Kiểm tra chế độ màu phù hợp với trang hiện tại
3. Đảm bảo có màu mặc định nếu dùng chế độ "Mặc định"
4. Kiểm tra cài đặt "Tắt áp dụng chủ đề trên trang đọc truyện"

### Màu sắc bị nhầm

**Triệu chứng**: Màu được áp dụng nhưng không đúng ý muốn.

**Nguyên nhân**: Ảnh bìa truyện có màu sắc phức tạp hoặc tối.

**Giải pháp**:
1. Chuyển sang chế độ "Mặc định"
2. Chọn màu tùy chỉnh trong cài đặt
3. Sử dụng công cụ chọn màu từ màn hình

### Màu không đồng bộ giữa các trang

**Triệu chứng**: Màu khác nhau trên trang chủ và trang thông tin truyện.

**Nguyên nhân**: Cài đặt chế độ màu khác nhau cho các trang.

**Giải pháp**:
1. Kiểm tra chế độ màu cho từng loại trang
2. Đặt tất cả về "Mặc định" để dùng màu thống nhất

## Vấn đề hiệu suất

### Script làm chậm trình duyệt

**Triệu chứng**: Trang load chậm hoặc lag khi cuộn.

**Nguyên nhân**: Quá nhiều animation hoặc xử lý màu realtime.

**Giải pháp**:
1. Tắt một số animation trong cài đặt (nếu có)
2. Chuyển sang chế độ màu "Mặc định" thay vì "Thumbnail"
3. Tắt trích xuất màu từ avatar

### Script tiêu tốn nhiều CPU

**Nguyên nhân**: Xử lý canvas để trích xuất màu liên tục.

**Giải pháp**:
1. Giảm tần suất cập nhật màu
2. Sử dụng màu cố định thay vì động
3. Tắt debug mode nếu đang bật

## Vấn đề tương thích

### Không hoạt động trên mobile

**Triệu chứng**: Script hoạt động trên desktop nhưng không trên mobile.

**Nguyên nhân**: Extension userscript không được hỗ trợ đầy đủ trên mobile.

**Giải pháp**:
- Sử dụng Kiwi Browser hoặc Yandex Browser trên Android
- Sử dụng iCab Mobile hoặc Aloha Browser trên iOS
- Một số tính năng có thể không khả dụng trên mobile

### Xung đột với extension khác

**Triệu chứng**: Script hoạt động không ổn định hoặc bị lỗi.

**Nguyên nhân**: Xung đột với ad blocker hoặc theme extension khác.

**Giải pháp**:
1. Tắt các extension tương tự
2. Thêm exception cho trang Hako trong ad blocker
3. Kiểm tra console có lỗi nào từ extension khác

## Vấn đề cập nhật

### Script không tự động cập nhật

**Triệu chứng**: Script không kiểm tra cập nhật hoặc cập nhật thất bại.

**Nguyên nhân**: Tắt tự động cập nhật hoặc lỗi mạng.

**Giải pháp**:
1. Kiểm tra cài đặt tự động cập nhật có bật
2. Kiểm tra cập nhật thủ công qua menu
3. Kiểm tra kết nối mạng và firewall

### Lỗi khi cập nhật

**Lỗi**: "Update failed" hoặc "Cannot download update"

**Nguyên nhân**: Lỗi mạng hoặc CDN bị chặn.

**Giải pháp**:
1. Thử lại sau vài phút
2. Kiểm tra proxy settings
3. Tải script trực tiếp từ GitHub và cài đặt lại

## Vấn đề bảo mật

### Cảnh báo bảo mật từ trình duyệt

**Triệu chứng**: Trình duyệt cảnh báo script không an toàn.

**Nguyên nhân**: Script yêu cầu quyền truy cập cross-origin.

**Giải pháp**:
- Đây là bình thường cho userscript
- Script chỉ chạy trong trình duyệt và không gửi dữ liệu ra ngoài
- Xem phần "Quyền riêng tư" trong README

### Cookie và dữ liệu

**Vấn đề**: Script lưu trữ cài đặt cục bộ.

**Giải pháp**:
- Cài đặt được lưu trong GM_getValue (của extension)
- Xóa dữ liệu script trong extension manager để reset
- Không có dữ liệu cá nhân được gửi ra ngoài

## Debug và chẩn đoán

### Bật debug mode

Để chẩn đoán vấn đề:

1. Mở menu chính script
2. Chọn "Debug Mode" → Bật
3. Mở Developer Tools (F12)
4. Xem tab Console để tìm lỗi

### Thông tin hệ thống

Khi báo cáo lỗi, hãy cung cấp:

- Phiên bản script
- Trình duyệt và phiên bản
- Extension userscript sử dụng
- Hệ điều hành
- Mô tả chi tiết vấn đề và cách tái tạo

### Logs quan trọng

Tìm các log sau trong console:

- `[HMTConfig]`: Lỗi cài đặt
- `[AdBlocker]`: Lỗi chặn quảng cáo
- `[UpdateManager]`: Lỗi cập nhật
- `[MainMenu]`: Lỗi menu

## Reset và khôi phục

### Reset cài đặt về mặc định

1. Mở menu cài đặt
2. Nhấn "Khôi phục mặc định"
3. Xác nhận reset

### Gỡ bỏ và cài đặt lại script

1. Mở extension manager
2. Tìm "Hako: Monet Theme"
3. Nhấn "Delete" hoặc "Remove"
4. Tải lại script từ GitHub và cài đặt lại

### Xóa dữ liệu script

1. Mở extension manager
2. Tìm script → click vào tên
3. Tìm phần "Storage" hoặc "Data"
4. Xóa tất cả dữ liệu lưu trữ

## Liên hệ hỗ trợ

Nếu các giải pháp trên không hiệu quả:

1. Tạo issue trên [GitHub repository](https://github.com/sang765/HakoMonetTheme/issues)
2. Tham gia [Discord server](https://discord.gg/uvQ6A3CDPq)
3. Cung cấp đầy đủ thông tin debug và mô tả vấn đề

## Phòng ngừa

### Bảo trì định kỳ

- Kiểm tra cập nhật script thường xuyên
- Dọn dẹp dữ liệu extension định kỳ
- Cập nhật trình duyệt và extension

### Sao lưu cài đặt

- Script không có tính năng sao lưu tự động
- Ghi nhớ cài đặt quan trọng để thiết lập lại nếu cần

### Giám sát hiệu suất

- Theo dõi CPU và memory usage
- Tắt tính năng không cần thiết
- Sử dụng chế độ "Mặc định" thay vì "Thumbnail" nếu cần tối ưu