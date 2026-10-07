# Thiệp cưới Mai Anh và Quốc Huy

## Đăng website lên GitHub Pages

1. Tạo repository trên GitHub và tải toàn bộ thư mục này lên.
2. Mở **Settings > Pages**, chọn **GitHub Actions** làm nguồn deploy.
3. Push lên nhánh `main`. Workflow sẽ tự động xuất bản website.

## Kết nối lời chúc và xác nhận tham dự với Google Sheets

1. Tạo một Google Sheet mới.
2. Trong Sheet, chọn **Extensions > Apps Script**.
3. Thay nội dung `Code.gs` bằng mã trong thư mục `google-apps-script`.
4. Chọn **Deploy > New deployment > Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Deploy, cấp quyền cho Apps Script truy cập bảng tính, rồi sao chép URL Web App kết thúc bằng `/exec`.
6. Mở `scripts/guestbook-config.js`, gán URL vừa sao chép vào `window.WEDDING_GUESTBOOK_ENDPOINT`, ví dụ:

   ```js
   window.WEDDING_GUESTBOOK_ENDPOINT =
     "https://script.google.com/macros/s/ID_CUA_BAN/exec";
   ```

7. Push thay đổi lên GitHub. Lời chúc sẽ được lưu trong tab **Lời chúc**. Xác nhận tham dự được lưu riêng trong tab **Xác nhận tham dự**; Apps Script tự tạo hai tab khi có dữ liệu đầu tiên.

Không cần điền lời chúc mẫu vào Sheet. Hãy hạn chế quyền chỉnh sửa Sheet chỉ cho chủ sở hữu; khách gửi lời chúc và xác nhận qua website không cần quyền truy cập Sheet. Vì Web App cho phép gửi công khai, hãy kiểm tra Sheet định kỳ để xóa nội dung rác.

## Đổi link Google Maps

Mở `scripts/guestbook-config.js` và dán link chia sẻ Google Maps vào `WEDDING_MAP_URL`:

```js
window.WEDDING_MAP_URL = "https://maps.app.goo.gl/link-cua-ban";
```

Có thể dùng link **Chia sẻ** từ Google Maps. Nếu để trống, nút **Xem đường đi** sẽ mở chỉ đường tới địa chỉ đang ghi trên thiệp.

## Thay nhạc nền

Tải file nhạc MP3 vào thư mục `music` bên trong `thi-p-c-i` (tạo thư mục nếu chưa có). Mở `scripts/guestbook-config.js` và thay `WEDDING_MUSIC_URL` bằng đường dẫn tương đối từ thư mục `thi-p-c-i`, gồm cả tên file:

```js
window.WEDDING_MUSIC_URL = "music/chuynn.mp3";
```

Ví dụ, nếu file được đặt tại `thi-p-c-i/music/chuynn.mp3`, dùng đúng đường dẫn ở trên. Bạn cũng có thể dùng URL trực tiếp bắt đầu bằng `https://`. Lưu file cấu hình rồi tải lại trang để nghe nhạc mới.

## Thay ảnh cô dâu chú rể

Trong thư mục `images`, thay ảnh bằng ảnh mới nhưng giữ nguyên tên file và phần mở rộng để thiệp tự cập nhật:

| Tên file | Ảnh hiện tại |
| --- | --- |
| `anh1.jpg` | Ảnh cô dâu chú rể ngồi cạnh nhau |
| `anh2.png` | Ảnh cô dâu đứng một mình |
| `anh3.jpg` | Ảnh chú rể đứng một mình |
| `anh4.jpg` | Ảnh chân dung cô dâu |
| `anh5.jpg` | Ảnh cô dâu chú rể ngồi cạnh nhau |
| `anh6.jpg` | Ảnh cô dâu chú rể |
| `anh7.jpg` | Ảnh cô dâu chú rể |
| `anh8.jpg` | Ảnh cô dâu chú rể |
| `anh9.jpg` | Ảnh cô dâu chú rể |
| `anh10.jpg` | Ảnh chân dung cô dâu chú rể |
| `anh11.png` | Ảnh cô dâu chú rể đứng cạnh nhau |

Giữ nguyên đúng đuôi `.jpg` hoặc `.png`. Thay xong, tải lại website hoặc push thay đổi lên GitHub Pages.

## Ghi chú

- Các nút chỉnh sửa/lưu mẫu, thêm vào yêu thích, nhãn Made with CineLove và các nút gửi quà/bắn tim đã bị gỡ khỏi trang.
- Bản đồ được thay bằng nút **Xem đường đi** màu hồng; nút mở chỉ đường Google Maps trong tab mới.
- RSVP lưu họ tên, lựa chọn tham dự/từ chối, số lượng người và thời gian gửi vào tab **Xác nhận tham dự**.
- Nhạc và bản đồ cần kết nối Internet.
- GitHub Pages chỉ lưu website tĩnh; dữ liệu lời chúc được lưu riêng trong Google Sheets qua Apps Script.
