# Checklist nghiệm thu đồ án

Tài liệu này dùng để tự kiểm tra trước khi nộp hoặc bảo vệ đồ án hệ thống quản lý trung tâm học thêm. Phạm vi hiện tại là mô hình một cơ sở; hướng mở rộng nhiều cơ sở được mô tả trong `docs/thiet-ke-van-hanh-mot-co-so-va-nhieu-co-so.md`.

## 1. Điều kiện chạy được

- [ ] Cài Node.js 20 trở lên.
- [ ] Có SQL Server local hoặc Docker Desktop.
- [ ] Tạo/cấu hình `backend/.env` và `frontend/.env` theo README.
- [ ] Chạy migration thành công: `npm run prisma:migrate --workspace backend`.
- [ ] Chạy seed thành công: `npm run prisma:seed --workspace backend`.
- [ ] Chạy backend: `npm run dev:backend`.
- [ ] Chạy frontend: `npm run dev:frontend`.
- [ ] Mở được frontend tại `http://localhost:5173`.
- [ ] Health check backend trả OK tại `http://localhost:4000/api/health`.

## 2. Tài khoản và phân quyền

- [ ] Admin đăng nhập được bằng `admin / 123456`.
- [ ] Staff đăng nhập được bằng `staff01 / 123456`.
- [ ] Teacher đăng nhập được bằng `teacher01 / 123456`.
- [ ] Student đăng nhập được bằng `student01 / 123456`.
- [ ] `student01` có lịch học, điểm, học phí thanh toán một phần và phiếu thu mẫu sau khi seed.
- [ ] Menu thay đổi đúng theo vai trò.
- [ ] Admin tạo được tài khoản mới theo role.
- [ ] Admin khóa/mở tài khoản bằng trạng thái `LOCKED`, `INACTIVE`, `ACTIVE`.
- [ ] Tài khoản bị khóa hoặc không hoạt động không đăng nhập được.

## 3. Luồng vận hành một cơ sở

- [ ] Staff xem và thao tác lead tư vấn.
- [ ] Staff dùng được thao tác gửi mail, hẹn test, chuyển tab chi tiết lead và ghi chú tư vấn.
- [ ] Staff tạo được hồ sơ học viên.
- [ ] Admin/Staff tạo được môn học, khóa học và lớp học.
- [ ] Admin/Staff phân công giáo viên cho lớp.
- [ ] Staff ghi danh học viên vào lớp đang tuyển sinh.
- [ ] Hệ thống tự sinh khoản học phí sau khi ghi danh.
- [ ] Staff cập nhật trạng thái ghi danh và sĩ số lớp được tính lại.
- [ ] Staff tạo được phòng học, lịch học và buổi học.
- [ ] Teacher xem được lớp được phân công.
- [ ] Teacher điểm danh được buổi học của lớp được phân công.
- [ ] Teacher tạo bài kiểm tra, nhập điểm và sửa điểm.
- [ ] Staff thu học phí toàn phần hoặc một phần.
- [ ] Hệ thống tạo phiếu thu sau mỗi lần thanh toán.
- [ ] Student xem được khóa học, lịch học, điểm, học phí, phiếu thu và thông báo cá nhân.
- [ ] Admin/Staff xem dashboard, báo cáo chi tiết và xuất CSV.

## 4. Rule nghiệp vụ cần demo

- [ ] Không ghi danh trùng một học viên vào cùng một lớp.
- [ ] Không ghi danh nếu lớp chưa mở tuyển sinh, đã kết thúc hoặc vượt sĩ số.
- [ ] Khi hủy/hoàn tất ghi danh, sĩ số lớp được tính lại.
- [ ] Không tạo lịch trùng phòng cùng thời gian.
- [ ] Không tạo lịch trùng giáo viên cùng thời gian.
- [ ] Teacher không xem/sửa dữ liệu lớp không được phân công.
- [ ] Student không xem được phiếu thu của học viên khác.
- [ ] Không thu học phí vượt số tiền còn lại.
- [ ] Thông báo có thể đánh dấu đã đọc từng mục hoặc tất cả.

## 5. Tài liệu và sơ đồ

- [ ] README mô tả cách cài đặt, chạy project, tài khoản demo và luồng demo nhanh.
- [ ] `docs/bao-cao-phan-tich-thiet-ke.md` khớp công nghệ Node/Express, Prisma, React.
- [ ] `docs/huong-dan-demo.md` đủ kịch bản bảo vệ theo vai trò.
- [ ] `docs/huong-dan-su-dung-tung-tinh-nang.md` hướng dẫn từng chức năng chính.
- [ ] `docs/api-endpoints.md` liệt kê API backend theo module, role, body và rule nghiệp vụ.
- [ ] `docs/ma-tran-chuc-nang-nghiem-thu.md` đối chiếu chức năng với màn hình, API, tài liệu và test.
- [ ] `docs/thiet-ke-van-hanh-mot-co-so-va-nhieu-co-so.md` giải thích thiết kế một cơ sở và hướng mở rộng nhiều cơ sở.
- [ ] `diagrams/use-case.puml` phản ánh đủ actor và use case chính.
- [ ] `diagrams/class-diagram.puml` phản ánh các lớp/thực thể chính.
- [ ] `diagrams/erd.puml` khớp với `backend/prisma/schema.prisma`.
- [ ] Các sequence/activity/state diagram thể hiện được các luồng ghi danh, điểm danh và thu học phí.

## 6. Lệnh kiểm tra trước khi nộp

```powershell
npm run build --workspace backend
npm run build --workspace frontend
npm run test --workspace backend
```

Kết quả mong đợi:

- Backend TypeScript build thành công, bao gồm kiểm tra type cho `backend/prisma/seed.ts`.
- Frontend TypeScript/Vite build thành công.
- Backend test pass toàn bộ.

Kết quả kiểm tra gần nhất trong workspace: backend build pass, frontend build pass, backend test pass với 7 test files và 11 tests.

## 7. Điểm nhấn khi bảo vệ

- Hệ thống có đủ bốn vai trò: Admin, Staff, Teacher, Student.
- Backend kiểm soát nghiệp vụ quan trọng ở service, không chỉ kiểm tra ở giao diện.
- Prisma schema là nguồn sự thật cho ERD và class diagram.
- App hiện triển khai một cơ sở để giữ phạm vi đồ án rõ ràng.
- Mở rộng nhiều cơ sở bằng cách thêm `Branch`, gán `branchId` cho dữ liệu vận hành và lọc mọi API theo quyền cơ sở.
