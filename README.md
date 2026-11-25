# Student-Attendance

Hướng dẫn chạy dự án trên máy local.

## 1. Yêu cầu

- Node.js 20 trở lên
- MongoDB (MongoDB Atlas hoặc MongoDB cài trên máy)
- Docker (chỉ cần nếu dùng điểm danh bằng khuôn mặt)

## 2. Cài đặt thư viện

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 3. Cấu hình backend

Tạo file `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/student-attendance
PORT=8000
JWT_SECRET=<chuỗi bí mật bất kỳ>
JWT_EXPIRES=7d
```

`PORT` phải là `8000` vì frontend gọi API tới `http://localhost:8000`.

### Điểm danh bằng khuôn mặt (tuỳ chọn)

Nhận diện khuôn mặt chạy trong service Python riêng (`face-service/`, dùng thư viện [deepface](https://github.com/serengil/deepface) với mô hình Facenet512 + RetinaFace). Service chỉ mở ở `127.0.0.1:5005` và yêu cầu khóa bí mật.

1. Tạo file `.env` ở thư mục gốc repo (dùng cho Docker Compose):
   ```env
   FACE_SERVICE_KEY=<chuỗi bí mật dài, ngẫu nhiên>
   ```
2. Thêm vào `backend/.env` cùng khóa đó:
   ```env
   FACE_SERVICE_KEY=<cùng chuỗi ở trên>
   # tuỳ chọn
   FACE_SERVICE_URL=http://127.0.0.1:5005
   FACE_UPLOAD_DIR=uploads/faces
   FACE_MATCH_THRESHOLD=0.30
   FACE_MATCH_MARGIN=0.05
   ```
3. Chạy service (lần build đầu sẽ tải thư viện và trọng số mô hình vào image, mất vài phút):
   ```bash
   docker compose up -d --build face-service
   curl http://127.0.0.1:5005/health
   ```

Ảnh khuôn mặt sinh viên lưu trong `backend/uploads/faces/` (đã được gitignore), chỉ xem được qua API có đăng nhập. Camera trên trình duyệt chỉ hoạt động ở `localhost` hoặc HTTPS.

## 4. Tạo dữ liệu mẫu

Chạy trong thư mục `backend/` theo đúng thứ tự:

```bash
cd backend
node seed/admin.js        # tạo tài khoản admin
node seed/teacher.js      # tạo 2 giảng viên
```

Tiếp theo, tạo một vài sinh viên bằng một trong hai cách:
- Đăng ký ở trang `http://localhost:3000/register` với email dạng `ten.ho21xxxx@sis.hust.edu.vn` (ví dụ `an.nguyen215555@sis.hust.edu.vn`).
- Đăng nhập admin, vào **Sinh viên → Thêm sinh viên** (mật khẩu mặc định `123456`).

Sau đó chạy:

```bash
node seed/class.js        # tạo 2 lớp học và thêm sinh viên vào lớp
node seed/attendance.js   # tạo một buổi điểm danh mẫu
```

Tài khoản mẫu (mật khẩu đều là `123456`):

| Vai trò | Email |
|---|---|
| Admin | `admin.ad000000@sis.hust.edu.vn` |
| Giảng viên | `huy.duc212121@sis.hust.edu.vn` |
| Giảng viên | `duc.tran151515@sis.hust.edu.vn` |

## 5. Chạy dự án

Mở 2 terminal:

```bash
# terminal 1: backend
cd backend
npm run dev
```

```bash
# terminal 2: frontend
cd frontend
npm start
```

Truy cập `http://localhost:3000`.
