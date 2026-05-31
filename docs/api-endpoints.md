# Tài liệu API backend

Base URL khi chạy local: `http://localhost:4000/api`. Frontend đọc giá trị này từ biến `VITE_API_BASE_URL` trong `frontend/.env`.

Trừ `POST /auth/login`, mọi API nghiệp vụ yêu cầu header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Backend dùng Express middleware `authenticate` để xác thực JWT, `authorize(...)` để kiểm tra vai trò và Zod schema để validate body.

## 1. Auth

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/login` | Public | `username`, `password` | Đăng nhập, trả JWT và thông tin người dùng |
| `GET` | `/auth/me` | Đã đăng nhập | Không có | Lấy thông tin người dùng hiện tại |
| `POST` | `/auth/logout` | Đã đăng nhập | Không có | Đăng xuất phía client |

Rule chính:

- Tài khoản phải ở trạng thái `ACTIVE`.
- Tài khoản `LOCKED` hoặc `INACTIVE` không đăng nhập được.

## 2. Users

Prefix: `/users`. Chỉ `ADMIN` được truy cập.

| Method | Endpoint | Body chính | Mục đích |
| --- | --- | --- | --- |
| `GET` | `/users` | Không có | Danh sách tài khoản |
| `POST` | `/users` | `fullName`, `username`, `password`, `role`, profile theo role | Tạo tài khoản Admin/Staff/Teacher/Student |
| `PATCH` | `/users/:id` | Thông tin tài khoản cơ bản | Cập nhật hồ sơ tài khoản |
| `PATCH` | `/users/:id/status` | `status`: `ACTIVE`, `INACTIVE`, `LOCKED` | Khóa/mở tài khoản |

## 3. Students

Prefix: `/students`.

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/students` | `ADMIN`, `STAFF`, `TEACHER`, `STUDENT` | Query `classRoomId`, `search` nếu có | Danh sách học viên theo quyền |
| `GET` | `/students/:id` | `ADMIN`, `STAFF`, `TEACHER`, `STUDENT` | Không có | Chi tiết học viên |
| `POST` | `/students` | `ADMIN`, `STAFF` | Hồ sơ học viên và phụ huynh | Tạo học viên |
| `PATCH` | `/students/:id` | `ADMIN`, `STAFF` | Hồ sơ học viên cơ bản | Cập nhật học viên |

Rule chính:

- Teacher chỉ xem học viên thuộc lớp được phân công.
- Student chỉ xem hồ sơ của chính mình.

## 4. Teachers

Prefix: `/teachers`.

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/teachers` | `ADMIN`, `STAFF` | Không có | Danh sách giáo viên |
| `POST` | `/teachers` | `ADMIN` | `fullName`, `username`, `teacherCode`, chuyên môn | Tạo giáo viên |
| `PATCH` | `/teachers/:id` | `ADMIN` | Thông tin giáo viên | Cập nhật giáo viên |

## 5. Courses và Subjects

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/subjects` | Tất cả role | Không có | Danh sách môn học |
| `POST` | `/subjects` | `ADMIN` | `name`, `description` | Tạo môn học |
| `PATCH` | `/subjects/:id` | `ADMIN` | `name`, `description` | Cập nhật môn học |
| `GET` | `/courses` | Tất cả role | Không có | Danh sách khóa học |
| `POST` | `/courses` | `ADMIN` | `subjectId`, `name`, `grade`, `tuitionFee`, `numberOfSessions` | Tạo khóa học |
| `PATCH` | `/courses/:id` | `ADMIN` | Thông tin khóa học | Cập nhật khóa học |

## 6. Classes và phân công giáo viên

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/classes` | Tất cả role | Query `search` nếu có | Danh sách lớp theo quyền |
| `GET` | `/classes/:id` | Tất cả role | Không có | Chi tiết lớp |
| `POST` | `/classes` | `ADMIN`, `STAFF` | `courseId`, `name`, `maxStudents`, `status`, `roomIds` | Tạo lớp |
| `PATCH` | `/classes/:id` | `ADMIN`, `STAFF` | Thông tin lớp | Cập nhật lớp |
| `PATCH` | `/classes/:id/status` | `ADMIN`, `STAFF` | `status` | Cập nhật trạng thái lớp |
| `POST` | `/teaching-assignments` | `ADMIN`, `STAFF` | `teacherId`, `classRoomId`, `role` | Phân công giáo viên |

Rule chính:

- Teacher chỉ thấy lớp được phân công.
- Student chỉ thấy lớp đã ghi danh.

## 7. Enrollments

Prefix: `/enrollments`. Role: `ADMIN`, `STAFF`.

| Method | Endpoint | Body chính | Mục đích |
| --- | --- | --- | --- |
| `GET` | `/enrollments` | Query `studentId`, `classRoomId` nếu có | Danh sách ghi danh |
| `POST` | `/enrollments` | `studentId`, `classRoomId` | Ghi danh học viên vào lớp |
| `PATCH` | `/enrollments/:id/status` | `status`: `ACTIVE`, `CANCELLED`, `COMPLETED` | Cập nhật trạng thái ghi danh |

Rule chính:

- Không ghi danh trùng học viên vào cùng lớp.
- Chỉ ghi danh vào lớp `ENROLLING` hoặc `ACTIVE`.
- Không vượt sĩ số tối đa.
- Khi đổi trạng thái ghi danh, hệ thống tính lại `currentStudents`.
- Ghi danh thành công tự sinh `TuitionPayment`.

## 8. Rooms, Schedules và Study Sessions

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/rooms` | `ADMIN`, `STAFF` | Không có | Danh sách phòng |
| `POST` | `/rooms` | `ADMIN`, `STAFF` | `name`, `capacity`, `location` | Tạo phòng |
| `GET` | `/schedules` | Tất cả role | Query `classRoomId` nếu có | Danh sách lịch học theo quyền |
| `POST` | `/schedules` | `ADMIN`, `STAFF` | `classRoomId`, `roomId`, `dayOfWeek`, `startTime`, `endTime` | Tạo lịch học |
| `PATCH` | `/schedules/:id` | `ADMIN`, `STAFF` | Thông tin lịch học | Cập nhật lịch học |
| `GET` | `/study-sessions` | `ADMIN`, `STAFF`, `TEACHER` | Query `classRoomId` nếu có | Danh sách buổi học |
| `POST` | `/study-sessions` | `ADMIN`, `STAFF` | `classRoomId`, `sessionDate`, `topic`, `status` | Tạo buổi học |

Rule chính:

- Không tạo lịch có `startTime >= endTime`.
- Không trùng phòng cùng thứ/giờ.
- Không trùng giáo viên cùng thứ/giờ.
- Teacher chỉ thấy lịch/buổi học lớp được phân công.
- Student chỉ thấy lịch lớp đã ghi danh.

## 9. Attendance

Prefix: `/attendance`.

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/attendance/session/:sessionId` | `ADMIN`, `STAFF`, `TEACHER` | Không có | Xem điểm danh theo buổi học |
| `POST` | `/attendance` | `TEACHER` | `studySessionId`, `details[]` gồm `studentId`, `status`, `note` | Lưu điểm danh |

Rule chính:

- Teacher chỉ được xem/lưu điểm danh lớp được phân công.
- Trạng thái điểm danh: `PRESENT`, `ABSENT`, `LATE`.

## 10. Exams và Scores

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/exams` | Tất cả role | Query `classRoomId` nếu có | Danh sách bài kiểm tra |
| `POST` | `/exams` | `ADMIN`, `TEACHER` | `classRoomId`, `name`, `examDate`, `maxScore` | Tạo bài kiểm tra |
| `GET` | `/scores` | Tất cả role | Query nếu có | Danh sách điểm theo quyền |
| `POST` | `/scores` | `ADMIN`, `TEACHER` | `examId`, `studentId`, `value`, `comment` | Nhập điểm |
| `PATCH` | `/scores/:id` | `ADMIN`, `TEACHER` | `value`, `comment` | Sửa điểm |

Rule chính:

- Teacher chỉ nhập/sửa điểm lớp được phân công.
- Student chỉ xem điểm của chính mình.

## 11. Tuition và Invoices

| Method | Endpoint | Role | Body chính | Mục đích |
| --- | --- | --- | --- | --- |
| `GET` | `/tuition` | `ADMIN`, `STAFF`, `STUDENT` | Query `studentId`, `status` nếu có | Danh sách khoản học phí |
| `POST` | `/tuition/:id/pay` | `ADMIN`, `STAFF` | `amount`, `method`, `note` | Thu học phí và tạo phiếu thu |
| `GET` | `/invoices/:id` | `ADMIN`, `STAFF`, `STUDENT` | Không có | Xem phiếu thu |

Rule chính:

- Không thu số tiền <= 0.
- Không thu vượt số tiền còn lại.
- Thu đủ chuyển `PAID`, thu một phần chuyển `PARTIAL`.
- Mỗi lần thu tạo `Payment` và `Invoice`.
- Student chỉ xem phiếu thu của chính mình.

## 12. Reports

Prefix: `/reports`.

| Method | Endpoint | Role | Mục đích |
| --- | --- | --- | --- |
| `GET` | `/reports/dashboard` | Tất cả role | Số liệu dashboard theo vai trò |
| `GET` | `/reports/analytics/:metric` | `ADMIN`, `STAFF` | Dữ liệu phân tích chi tiết theo metric |
| `GET` | `/reports/revenue` | `ADMIN`, `STAFF` | Báo cáo doanh thu/công nợ |
| `GET` | `/reports/attendance` | `ADMIN`, `STAFF` | Báo cáo chuyên cần |
| `GET` | `/reports/learning-results` | `ADMIN`, `STAFF`, `TEACHER` | Báo cáo kết quả học tập |

Frontend hỗ trợ xuất CSV ở `/analytics/:metric` và `/reports`.

## 13. Notifications

Prefix: `/notifications`. Tất cả role đã đăng nhập.

| Method | Endpoint | Body chính | Mục đích |
| --- | --- | --- | --- |
| `GET` | `/notifications` | Không có | Danh sách thông báo của người dùng hiện tại |
| `PATCH` | `/notifications/:id/read` | Không có | Đánh dấu một thông báo đã đọc |
| `PATCH` | `/notifications/read-all` | Không có | Đánh dấu toàn bộ thông báo đã đọc |

## 14. Kiểm thử liên quan API

Các test backend hiện có:

- `auth.service.test.ts`: tài khoản khóa không đăng nhập.
- `attendance.service.test.ts`: teacher không xem điểm danh ngoài lớp phân công.
- `exams.service.test.ts`: teacher không sửa điểm ngoài lớp phân công.
- `tuition.service.test.ts`: student không xem phiếu thu người khác, không thu vượt học phí.
- `schedules.service.test.ts`: không trùng phòng, không trùng lịch giáo viên.
- `enrollments.service.test.ts`: cập nhật trạng thái ghi danh và sĩ số.
- `health.test.ts`: health endpoint và helper trùng giờ.
