# Hướng dẫn demo hệ thống quản lý trung tâm học thêm

## 1. Chuẩn bị

1. Chạy SQL Server local bằng `npm run db:start` hoặc tạo database SQL Server `learning_center` bằng SSMS. Nếu dùng container của project, mở SSMS với server `localhost,11433`, login `sa`, password `LearningCenter123_`.
2. Cấu hình `backend/.env` và `frontend/.env` theo file `.env.example`.
3. Chạy migration và seed:

```powershell
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

4. Chạy backend và frontend:

```powershell
npm run dev:backend
npm run dev:frontend
```

## 2. Tài khoản demo

Mật khẩu chung: `123456`.

| Role | Tài khoản | Mục đích |
| --- | --- | --- |
| Admin | `admin` | Quản trị tài khoản, khóa học, báo cáo |
| Staff | `staff01` | Ghi danh, lớp học, lịch học, học phí |
| Teacher | `teacher01` | Lớp được phân công, điểm danh, nhập điểm |
| Student | `student01` | Xem lịch học, điểm, học phí, phiếu thu mẫu, thông báo |

## 3. Kịch bản demo đề xuất

### Kịch bản 1: Đăng nhập và phân quyền

1. Đăng nhập bằng `admin`.
2. Quan sát menu có tài khoản, nhân viên, quản lý leads, giáo viên, khóa học, báo cáo.
3. Vào `Nhân viên` để xem danh sách tài khoản Staff.
4. Vào `Tài khoản`, tạo thử một tài khoản Staff/Teacher/Student và đổi trạng thái tài khoản sang `LOCKED`, sau đó đổi lại `ACTIVE`.
5. Đăng xuất và đăng nhập `teacher01`.
6. Quan sát menu chỉ còn lớp của tôi, điểm danh, nhập điểm, thông báo.

### Kịch bản 1.1: Tư vấn tuyển sinh theo lead

1. Đăng nhập bằng `staff01`.
2. Vào `Quản lý Leads`.
3. Chọn một học viên ở danh sách lead.
4. Trình bày trạng thái lead, thông tin liên hệ, nguồn lead, timeline tư vấn, điểm đầu vào và ghi chú.
5. Dùng các nút `Gửi mail`, `Hẹn test`, `Chỉnh sửa` để demo thao tác CRM: mở email, thêm lịch hẹn kiểm tra đầu vào và cập nhật ghi chú tư vấn.

### Kịch bản 2: Ghi danh học viên

1. Đăng nhập bằng `staff01`.
2. Vào `Học viên`, thêm một học viên mới.
3. Vào `Ghi danh`.
4. Chọn học viên và lớp đang tuyển sinh.
5. Lưu ghi danh.
6. Vào `Học phí` để thấy khoản học phí tự động được tạo.
7. Quay lại `Ghi danh`, đổi trạng thái ghi danh sang `COMPLETED` hoặc `CANCELLED` để trình bày rule cập nhật sĩ số lớp.

### Kịch bản 3: Tạo lịch học và kiểm tra trùng lịch

1. Vào `Lịch học`.
2. Tạo phòng học nếu cần.
3. Tạo buổi học cụ thể cho lớp để giáo viên có dữ liệu điểm danh.
4. Tạo lịch học cho một lớp, phòng, thứ và giờ.
5. Tạo lại lịch trùng phòng cùng khung giờ.
6. Hệ thống báo lỗi trùng phòng.

### Kịch bản 4: Điểm danh

1. Đăng nhập bằng `teacher01`.
2. Vào `Điểm danh`.
3. Chọn lớp được phân công và buổi học.
4. Đánh dấu có mặt, vắng, đi muộn cho học viên.
5. Lưu điểm danh.

### Kịch bản 5: Thu học phí

1. Đăng nhập bằng `staff01`.
2. Vào `Học phí`.
3. Chọn khoản học phí chưa thanh toán.
4. Nhập số tiền và phương thức thanh toán.
5. Lưu thanh toán.
6. Quan sát trạng thái chuyển sang `Một phần` hoặc `Đã thanh toán`.
7. Bấm `Xem phiếu thu` để mở phiếu thu vừa tạo.

### Kịch bản 6: Nhập điểm và học viên xem kết quả

1. Đăng nhập bằng `teacher01`.
2. Vào `Nhập điểm`.
3. Chọn lớp, tạo bài kiểm tra.
4. Chọn học viên và nhập điểm.
5. Dùng nút `Sửa điểm` để sửa điểm hoặc nhận xét nếu nhập sai.
6. Đăng xuất, đăng nhập `student01`.
7. Vào `Điểm của tôi` để xem điểm.

### Kịch bản 7: Học viên xem không gian khóa học

1. Đăng nhập bằng `student01`.
2. Vào `Khóa học của tôi`.
3. Quan sát card khóa học gồm môn học, tiến độ, lịch học, điểm số và trạng thái học phí.
4. Bấm `Vào học` để mở lịch học, bấm `Tài liệu` để chuyển xuống bài tập tự chọn.
5. Xem khu `Bài tập tự chọn` để demo giao diện dạng card giống cổng học tập.
6. Vào `Học phí của tôi`, bấm `Xem phiếu thu` nếu khoản học phí đã có hóa đơn.
7. Xem `Lịch học tuần của tôi` để trình bày lịch theo dạng Google Calendar.

Ghi chú: dữ liệu seed đã tạo sẵn một khoản học phí thanh toán một phần và phiếu thu cho `student01`, nên có thể demo ngay chức năng xem phiếu thu cá nhân.

### Kịch bản 8: Lịch học dạng calendar

1. Đăng nhập bằng `admin` hoặc `staff01`.
2. Vào `Lịch học`.
3. Tạo một lịch học mới.
4. Quan sát lịch được vẽ theo cột thứ và hàng giờ học.
5. Tạo lịch trùng phòng hoặc trùng giáo viên để demo rule kiểm tra trùng lịch.

### Kịch bản 9: Báo cáo

1. Đăng nhập bằng `admin` hoặc `staff01`.
2. Vào `Dashboard` để xem tổng quan.
3. Bấm vào một thẻ phân tích để xem biểu đồ chi tiết, lọc dữ liệu và dùng `Xuất báo cáo` để tải CSV.
4. Vào `Báo cáo` để xem doanh thu, chuyên cần, kết quả học tập và xuất file `bao-cao-tong-hop-YYYY-MM-DD.csv`.

## 4. Ghi chú khi bảo vệ

- Hệ thống dùng kế thừa nghiệp vụ qua role `User`: admin, staff, teacher, student.
- Backend tách module theo nghiệp vụ: auth, students, teachers, courses, classes, schedules, enrollments, attendance, tuition, exams, reports.
- Prisma schema là hiện thực hóa ERD trong báo cáo.
- Các rule nghiệp vụ quan trọng đã đưa vào service backend: ghi danh không trùng, không vượt sĩ số, cập nhật sĩ số theo trạng thái ghi danh, kiểm tra trùng lịch, giáo viên chỉ điểm danh/nhập điểm/sửa điểm lớp được phân công, học viên chỉ xem phiếu thu của mình, thu học phí không vượt số tiền còn lại.
- Bộ test backend hiện kiểm tra các điểm dễ bị hỏi khi bảo vệ: health check, helper trùng giờ, tài khoản khóa không đăng nhập, giáo viên không xem/sửa dữ liệu ngoài lớp được phân công, học viên không xem phiếu thu người khác, không thu vượt học phí, lịch học không trùng phòng/giáo viên và cập nhật trạng thái ghi danh phải tính lại sĩ số.
