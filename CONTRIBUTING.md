# Contributing to HakoMonetTheme

Cảm ơn bạn đã quan tâm đến việc đóng góp cho **HakoMonetTheme**! Mình rất trân trọng mọi đóng góp — từ báo lỗi, đề xuất cải tiến, đến gửi pull request.

## 1. Làm thế nào để góp ý báo lỗi hoặc đề xuất tính năng
- Nếu bạn gặp lỗi hoặc có ý tưởng cải tiến, vui lòng **tạo một Issue mới**.
- Hãy mô tả rõ:
  - **Môi trường bạn đang dùng** (trình duyệt, phiên bản userscript extension…).
  - **Ảnh chụp màn hình** hoặc video nếu có thể.
  - **Các bước để tái hiện lỗi** (nếu báo lỗi).
  - **Đề xuất cách giải quyết hoặc cải tiến** (nếu có ý tưởng).

## 2. Làm sao để bắt đầu đóng góp mã
1. **Fork** repository này.
2. Clone bản fork vào máy:
   ```bash
   git clone https://github.com/sang765/HakoMonetTheme.git
   cd HakoMonetTheme
   ```
3. Tạo **branch mới** cho tính năng hoặc sửa lỗi:

   ```bash
   git checkout -b feature/ten-tinh-nang-hoac-fix/ten-loi
   ```
4. Viết code, commit nội dung rõ ràng:

   ```bash
   git commit -m "Mô tả ngắn: sửa X / thêm Y"
   ```
5. **Push** branch của bạn:

   ```bash
   git push origin feature/…
   ```
6. Mở **Pull Request** từ branch của bạn vào nhánh `main` của repo gốc.

## 3. Quy định về coding style

* Giữ cho các tệp mã được **modular** và dễ bảo trì.
* Khi cần thêm **function** hay **module**, hãy đẩy logic vào các file riêng và import từ `main.js` hoặc file thích hợp.
* Viết **comment rõ ràng** nếu logic phức tạp.

## 4. Kiểm tra chất lượng mã (Review)

* Reviewer sẽ xem xét PR về:  
  * Tính rõ ràng của commit message.
  * Tính phù hợp và sạch sẽ của code (logic, tên biến, lựa chọn cấu trúc…).
  * Ảnh hưởng đến các tính năng hiện có, test trên trình duyệt nếu cần.
* Có thể bạn sẽ được yêu cầu bổ sung hoặc chỉnh sửa trước khi PR được merge.

## 5. Phát hành phiên bản mới (Release)

Không đóng góp thường xuyên? Nếu bạn muốn release:

* Bump phiên bản (ví dụ trong tên file hoặc comment header — nếu có).
* Ghi chú rõ các thay đổi chính (có thể tạo nhãn **changelog** trong PR).

## 6. Quyền tác giả & Giấy phép

* Mọi đóng góp sẽ được trao tặng theo **MIT License** — bạn vẫn giữ bản quyền tác giả.
* Khi commit, bạn xác nhận rằng bạn có quyền chia sẻ bản đóng góp này trên MIT License.

---

Cảm ơn bạn rất nhiều! Mọi sự đóng góp — dù nhỏ hay lớn — đều giúp cải thiện trải nghiệm đọc truyện cho hàng ngàn người.