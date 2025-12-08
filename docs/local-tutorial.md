# Hướng Dẫn Phát Triển Local cho HakoMonetTheme

Hướng dẫn này sẽ giúp bạn thiết lập môi trường phát triển local để có thể chỉnh sửa và test userscript `HakoMonetTheme` với tính năng hot-reload.

## Tổng Quan

Phiên bản local của userscript cho phép:
- Phát triển mà không phụ thuộc vào GitHub
- Hot-reload: Thay đổi code và test ngay lập tức
- Debug dễ dàng với logging chi tiết
- Không ảnh hưởng đến phiên bản production

## Yêu Cầu Hệ Thống

Bạn cần cài đặt một trong hai:

### Tùy Chọn 1: Python (Khuyến nghị)
- **Windows**: Python 3.x từ [python.org](https://python.org)
- **Linux/Mac**: `python3` (thường có sẵn hoặc cài qua package manager)

### Tùy Chọn 2: Node.js
- **Tất cả hệ điều hành**: Node.js từ [nodejs.org](https://nodejs.org)
- npm sẽ được cài kèm theo

## Bước 1: Khởi Chạy Local Server

### Trên Windows
1. Mở Command Prompt hoặc PowerShell trong thư mục project
2. Chạy file batch:
   ```cmd
   run_local_host.bat
   ```
3. Chọn tùy chọn:
   - `1` cho Python (port 8000)
   - `2` cho Node.js (port 8080)

### Trên Linux/Mac
1. Mở Terminal trong thư mục project
2. Làm file executable (nếu chưa):
   ```bash
   chmod +x run_local_host.sh
   ```
3. Chạy script:
   ```bash
   ./run_local_host.sh
   ```
4. Chọn tùy chọn tương tự như Windows

### Kết Quả
Server sẽ start và hiển thị:
```
Access your files at: http://localhost:8000
```
hoặc
```
Access your files at: http://localhost:8080
```

## Phương Pháp Phát Triển Khác

Ngoài cách thiết lập server local với Python hoặc Node.js, bạn có thể sử dụng Github Codespace cho phát triển trên đám mây hoặc Live Server extension cho VS Code để có trải nghiệm tương tự.

### Github Codespace

Github Codespace cho phép phát triển trực tiếp trên đám mây mà không cần cài đặt gì trên máy local.

1. **Mở Repository**: Truy cập repository HakoMonetTheme trên GitHub.
2. **Tạo Codespace**: Nhấn nút "Code" > "Open with Codespaces" > "New codespace".
3. **Thiết Lập Môi Trường**: Codespace sẽ tự động clone repo và thiết lập VS Code trên đám mây với Node.js sẵn có.
4. **Cài Đặt Dependencies** (nếu cần): Chạy `npm install` trong terminal của Codespace.
5. **Chạy Server**: Sử dụng Live Server extension (xem bên dưới) hoặc chạy script `run_local_host.sh` với Node.js option.
6. **Phát Triển**: Chỉnh sửa code trực tiếp trong Codespace, thay đổi sẽ được sync tự động.

> **Lưu ý**: Codespace có giới hạn thời gian sử dụng miễn phí. Phù hợp cho test nhanh hoặc phát triển không thường xuyên.
> Bạn cần cấu hình `resourcePaths` trong `HakoMonetTheme.user.js` và **các module** để trỏ đến URL của Codespace (ví dụ: `https://<your-codespace-url>/main.js`).

### Live Server Extension (Recommended dành cho người dùng VS Code)

Live Server là extension VS Code cung cấp server HTTP đơn giản với tính năng live-reload, thay thế cho Python/Node.js server.

1. **Cài Đặt Extension**: Tìm "[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)" trong VS Code Extensions marketplace và cài đặt.
2. **Mở Project**: Mở thư mục HakoMonetTheme trong VS Code.
3. **Khởi Chạy Server**: Nhấn chuột phải trên file `index.html` (hoặc bất kỳ file nào) > "Open with Live Server", hoặc sử dụng command palette: "Live Server: Open with Live Server".
4. **Cấu Hình Port**: Mặc định port 5500. Có thể thay đổi trong settings của extension.
5. **Test**: Truy cập `http://localhost:5500` (hoặc port đã cấu hình) để xem files. Thay đổi code sẽ tự động reload browser.

> **Lưu ý**: Với userscript, bạn cần cấu hình `resourcePaths` trong `HakoMonetTheme.user.js` và **các module** để trỏ đến URL của Live Server (ví dụ: `http://localhost:5500/main.js`).

## Bước 2: Cấu Hình Userscript

### 1. Mở file `HakoMonetTheme.user.js`
Tìm phần `resourcePaths` (khoảng dòng 34-66)

### 2. Thay đổi paths từ relative sang localhost
**Trước (production):**
```javascript
const resourcePaths = {
    mainJS: './main.js',
    // ...
};
```

**Sau (local development):**
```javascript
const resourcePaths = {
    mainJS: 'http://localhost:8000/main.js',
    monetAPIJS: 'http://localhost:8000/api/monet.js',
    // ... thay tất cả paths
};
```

> **Lưu ý**: Nếu dùng Node.js server, đổi thành `http://localhost:5500/`

### 3. Import vào Userscript Manager
- **Tampermonkey/Violentmonkey**: Import file `HakoMonetTheme.user.js`
- **Greasemonkey**: Cần cấu hình thêm để cho phép localhost

## Bước 3: Test Hot-Reload

1. **Mở trang target**: Truy cập `ln.hako.vn`, `docln.net`, hoặc `docln.sbs`
2. **Thay đổi code**: Chỉnh sửa file trong `main.js`, `module/config.js`, v.v.
3. **Reload trang**: Userscript sẽ load code mới từ localhost
4. **Kiểm tra Console**: Bật debug mode trong menu userscript để xem logs

## Cấu Hình Userscript Manager

### Tampermonkey
1. Mở dashboard → Settings → General
2. Enable: "Allow communication with domains"
3. Add: `localhost`

### Violentmonkey
1. Settings → General → Trusted domains
2. Add: `localhost`

### Greasemonkey
1. `about:config` → `greasemonkey.fileIsGreaseable`
2. Set thành `true`

## Troubleshooting

### Lỗi "Failed to load resource"
- Kiểm tra server có đang chạy không
- Đúng port (8000 cho Python, 8080 cho Node.js)
- Paths trong `resourcePaths` đúng URL localhost

### Lỗi CORS
- Đảm bảo userscript manager cho phép localhost
- Node.js server có flag `--cors`

### Python server không start
```bash
# Thử manual
python3 -m http.server 8000
# hoặc
python -m http.server 8000
```

### Node.js server không start
```bash
# Cài http-server
npm install -g http-server
# Chạy
npx http-server -p 8080 -c-1 --cors
```

### Files không update
- Clear browser cache (Ctrl+F5)
- Restart userscript manager
- Kiểm tra file có được save không

### Cloudflare Rate Limit

Nếu bạn gặp lỗi từ Cloudflare về rate limit khi truy cập các trang target:

- Chờ một thời gian trước khi thử lại (thường 5-10 phút)
- Sử dụng VPN hoặc proxy để thay đổi IP
- Giảm tần suất reload trang trong quá trình phát triển
- Kiểm tra console để xem chi tiết lỗi

## Tips Phát Triển

### Debug Mode
- Trong userscript menu: Chọn "🐛 Báo cáo lỗi" để bật debug
- Xem console logs với prefix `[HakoMonetTheme]`

### Chỉnh sửa nhanh
- Thay đổi colors trong `colors/page-general-dark.js`
- Test config trong `module/config.js`
- Add features trong `main.js`

### Backup
- Giữ bản production riêng biệt
- Commit changes thường xuyên

## Chuyển Về Production

Khi muốn dùng bản production:
1. Thay đổi lại `resourcePaths` về relative paths (`'./main.js'`)
2. Import lại userscript từ GitHub

---

**Lưu ý**: Phiên bản local chỉ dành cho phát triển. Không share hoặc dùng trên production!