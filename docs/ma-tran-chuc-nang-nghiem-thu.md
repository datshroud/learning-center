# Ma trận chức năng nghiệm thu

Tài liệu này đối chiếu các chức năng chính của app với màn hình, API/backend service, tài liệu hướng dẫn và bằng chứng kiểm thử. Dùng khi tự kiểm tra trước khi nộp hoặc khi cần trả lời nhanh trong buổi bảo vệ.

## 1. Ma trận theo vai trò

| Nhóm chức năng | Vai trò | Màn hình frontend | API/backend chính | Tài liệu hướng dẫn | Bằng chứng kiểm tra |
| --- | --- | --- | --- | --- | --- |
| Đăng nhập, phân quyền | Tất cả | `/login`, layout menu theo role | `authService`, `authenticate`, `authorize` | `docs/huong-dan-su-dung-tung-tinh-nang.md` mục 1 | `auth.service.test.ts`, route protection trong `App.tsx` |
| Quản lý tài khoản | Admin | `/users` | `usersService`, `users.routes.ts` | Mục 3 | Build backend/frontend, test tài khoản khóa |
| Quản lý nhân viên | Admin | `/staff` | `usersService` lọc role `STAFF` | Mục 3 | Menu Admin có mục `Nhân viên` |
| Quản lý lead tư vấn | Admin, Staff | `/leads` | Dữ liệu học viên/ghi danh phục vụ CRM | Mục 4 | Nút gửi mail, hẹn test, chi tiết lead có phản hồi |
| Quản lý học viên | Admin, Staff | `/students`, `/students/add` | `studentsService` | Mục 5 | Build frontend, rule teacher/student chỉ xem dữ liệu hợp lệ |
| Quản lý giáo viên | Admin, Staff | `/teachers` | `teachersService` | Mục 6 | Staff chỉ xem, Admin tạo/sửa theo phân quyền |
| Quản lý khóa học | Admin, Staff | `/courses` | `coursesService` | Mục 7 | Staff chỉ xem, Admin tạo môn/khóa |
| Quản lý lớp học | Admin, Staff | `/classes` | `classesService` | Mục 8 | Rule sĩ số và phân công giáo viên |
| Ghi danh | Admin, Staff | `/enrollments` | `enrollmentsService` | Mục 9 | `enrollments.service.test.ts` |
| Phòng, lịch, buổi học | Admin, Staff | `/schedules` | `schedulesService` | Mục 10 | `schedules.service.test.ts` |
| Điểm danh | Teacher | `/attendance` | `attendanceService` | Mục 11 | `attendance.service.test.ts` |
| Bài kiểm tra, điểm số | Teacher, Student | `/scores`, `/my-scores` | `examsService` | Mục 12, 18 | `exams.service.test.ts` |
| Học phí, thanh toán | Admin, Staff | `/tuition` | `tuitionService` | Mục 13 | `tuition.service.test.ts` |
| Phiếu thu | Admin, Staff, Student | `/invoices/:id`, `/my-tuition` | `tuitionService.getInvoice` | Mục 14, 17 | `tuition.service.test.ts` |
| Báo cáo, xuất CSV | Admin, Staff | `/dashboard`, `/analytics/:metric`, `/reports` | `reportsService` | Mục 2, 16 | Build frontend, nút `Xuất báo cáo` ở analytics và reports |
| Thông báo | Tất cả | `/notifications` | `notificationsService` | Mục 17, 18 | Đánh dấu từng mục hoặc tất cả đã đọc |
| Hồ sơ cá nhân | Tất cả | `/profile` | Auth context/user hiện tại | Mục 1 | Route bảo vệ trong `App.tsx` |
| Giao diện/ngôn ngữ | Tất cả | Nút theme, nút `VI/EN` ở header | `PreferencesContext` | Mục 19 | Build frontend |

## 2. Rule nghiệp vụ và nơi chứng minh

| Rule | Nơi xử lý chính | Test/bằng chứng |
| --- | --- | --- |
| Tài khoản `LOCKED` hoặc `INACTIVE` không đăng nhập được | `backend/src/modules/auth/auth.service.ts` | `backend/src/tests/auth.service.test.ts` |
| Chỉ Admin quản lý tài khoản | `backend/src/modules/users/users.routes.ts` | Route dùng `authorize(Role.ADMIN)` |
| Không ghi danh vào lớp chưa mở hoặc đã kết thúc | `backend/src/modules/enrollments/enrollments.service.ts` | Service rule, checklist nghiệm thu |
| Không ghi danh vượt sĩ số | `enrollmentsService.create`, `updateStatus` | `enrollments.service.test.ts` |
| Không ghi danh trùng học viên/lớp | `enrollmentsService.create` | Unique constraint và service rule |
| Cập nhật trạng thái ghi danh phải tính lại sĩ số | `enrollmentsService.updateStatus` | `enrollments.service.test.ts` |
| Không tạo lịch trùng phòng | `schedulesService.createSchedule`, `updateSchedule` | `schedules.service.test.ts` |
| Không tạo lịch trùng giáo viên | `schedulesService.createSchedule`, `updateSchedule` | `schedules.service.test.ts` |
| Teacher chỉ điểm danh/xem buổi học lớp được phân công | `attendanceService`, `schedulesService` | `attendance.service.test.ts` |
| Teacher chỉ sửa điểm lớp được phân công | `examsService.updateScore` | `exams.service.test.ts` |
| Student chỉ xem học phí/phiếu thu cá nhân | `tuitionService.list`, `getInvoice` | `tuition.service.test.ts` |
| Không thu học phí vượt số tiền còn lại | `tuitionService.pay` | `tuition.service.test.ts` |
| Mỗi lần thanh toán tạo phiếu thu | `tuitionService.pay` | Luồng demo học phí |
| Báo cáo có xuất CSV | `AnalyticsDetailPage`, `ReportsPage` | Build frontend, hướng dẫn mục 16 |

## 3. Lệnh nghiệm thu nhanh

Chạy trước khi nộp hoặc demo:

```powershell
npm run build --workspace backend
npm run build --workspace frontend
npm run test --workspace backend
```

Kết quả kiểm tra gần nhất trong workspace:

- Backend build: pass.
- Frontend build: pass.
- Backend test: pass, 7 test files và 11 tests.

## 4. Cách trình bày khi bị hỏi phạm vi nhiều cơ sở

App hiện triển khai mô hình một cơ sở để hoàn chỉnh nghiệp vụ lõi. Khi mở rộng nhiều cơ sở, thêm `Branch`, `UserBranch`, gán `branchId` cho dữ liệu vận hành và lọc mọi API theo quyền cơ sở. Chi tiết nằm trong `docs/thiet-ke-van-hanh-mot-co-so-va-nhieu-co-so.md`.

Tài liệu API chi tiết theo endpoint nằm trong `docs/api-endpoints.md`.
