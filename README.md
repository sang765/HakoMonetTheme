<div align="center">

# Hako: Monet Theme

Material You theme dành cho Hako/DocLN.

![Hako Monet Theme](https://img.shields.io/badge/Version-2.9.6-blue.svg)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Supported-green.svg)
![Violentmonkey](https://img.shields.io/badge/Violentmonkey-Supported-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 Tính năng 🌟

<div align="left">

- 🎨 Tự động phân tích màu sắc từ ảnh bìa truyện
- 🎯 Áp dụng Material You color scheme động
- 📱 Giao diện responsive và hiện đại
- 🌙 Hỗ trợ dark mode (hoạt động tối ưu)
- ⚡ Tối ưu hóa trải nghiệm đọc truyện
- 🔔 Tự động kiểm tra cập nhật
- 🏷️ Tag màu sắc theo thể loại
- ✨ Hiệu ứng animation mượt mà

</div>

## 📦 Cài đặt 📦

<div align="left">

### Bước 1: Cài đặt extension userscript
- [Tampermonkey](https://www.tampermonkey.net/) (Khuyến nghị)
- Hoặc [Violentmonkey](https://violentmonkey.github.io/get-it/)

### Bước 2: Cài đặt extension CORS (Quan trọng)
- **Allow CORS: Access-Control-Allow-Origin**: [Chromium](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf) hoặc [Firefox](https://addons.mozilla.org/firefox/addon/access-control-allow-origin/)

### Bước 3: Cài đặt script
Chọn bản [Stable](https://github.com/sang765/HakoMonetTheme/raw/main/HakoMonetTheme.user.js) hoặc bản [Nightly](https://github.com/sang765/HakoMonetTheme/raw/nightly/HakoMonetTheme.user.js) và nhấn "Install"  
![Install Userscript](/.github/assets/Install_us.jpg)

### Bước 4: Thiết lập CORS extension
Sau khi cài đặt extension Allow CORS: Access-Control-Allow-Origin, hãy bật nó lên để kích hoạt  
![CORS Disable](/.github/assets/cors_disable.jpg)![CORS Enable](/.github/assets/cors_enable.jpg)

### Bước 5: Cấp quyền cross-origin cho userscript
Khi vào bất kỳ trang web nào của Hako thì sẽ thông báo như ở dưới hình hiện lên. Hãy ấn "Always allow domain" và tận hưởng thành quả.  
![Userscript Ask](/.github/assets/userscript_asking.jpg)

</div>

## ❓ Tại sao cần có Allow CORS? ❓

<div align="left">

Script này cần phân tích màu sắc từ ảnh bìa truyện để tạo palette màu phù hợp. Tuy nhiên, các trình duyệt hiện đại chặn truy cập tài nguyên cross-origin do chính sách CORS (Cross-Origin Resource Sharing). 

Extension Allow CORS giúp:
- 🛡️ Bỏ qua chính sách CORS cho các domain được chỉ định
- 🖼️ Cho phép script truy cập và phân tích ảnh bìa
- 🎨 Kích hoạt tính năng tự động tạo màu chủ đề

**Lưu ý quan trọng**: Extension CORS chỉ nên được bật khi truy cập các trang web đáng tin cậy. Tắt extension khi không sử dụng các trang web cần thiết để đảm bảo bảo mật.

</div>

## 🔄 Cập nhật 🔄

<div align="left">

Script sẽ tự động kiểm tra cập nhật mỗi 30 phút. Bạn cũng có thể kiểm tra thủ công:

1. Mở Tampermonkey/Violentmonkey dashboard
2. Tìm script "Hako: Monet Theme"
3. Nhấn "Check for updates"

</div>

## 🐛 Báo cáo lỗi & Đề xuất 🐛

<div align="left">

Nếu bạn gặp vấn đề hoặc có đề xuất cải tiến, vui lòng:
1. [Tạo issue mới](https://github.com/sang765/HakoMonetTheme/issues)
2. Mô tả chi tiết vấn đề hoặc ý tưởng của bạn
3. Kèm theo screenshot nếu có thể

</div>

## 📖 Hướng dẫn sử dụng 📖

<div align="left">

Sau khi cài đặt, script sẽ tự động kích hoạt khi bạn truy cập:
- Trang chi tiết truyện (`/truyen/*`)
- Trang sáng tác (`/sang-tac/*`)
- Trang AI dịch (`/ai-dich/*`)

Màu sắc chủ đề sẽ được tự động điều chỉnh dựa trên ảnh bìa của truyện bạn đang xem.

</div>

## 🖼️ Hình ảnh 🖼️

![Novel 1](/.github/assets/Novel-1.png)![Novel 2](/.github/assets/Novel-2.png)![Novel 3](/.github/assets/Novel-3.png)  
![Novel 3-1](/.github/assets/3-1.png)![Novel 3-2](/.github/assets/3-2.png)![Novel 3-3](/.github/assets/3-3.png)  
![Menu](/.github/assets/menu.png)![Notification](/.github/assets/notification.png)![Account](/.github/assets/account.png)

## 🔧 Technical Details 🔧

<div align="left">

- Sử dụng Canvas API để phân tích màu sắc ảnh
- Ưu tiên màu tóc nhân vật để tạo palette
- Material You color scheme algorithm
- Modular architecture dễ bảo trì và mở rộng

</div>

## 📜 License 📜

<div align="center">

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

</div>

## 🙏 Ghi nhận 🙏

<div align="center">

Cảm ơn các contributors và cộng đồng đã đóng góp ý tưởng và báo cáo lỗi để cải thiện script này.  

</div>

---

**Lưu ý**: Script này không chính thức liên kết với Hako/DocLN và được phát triển độc lập bởi cộng đồng.

</div>
