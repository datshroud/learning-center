# Báo cáo phân tích và thiết kế hướng đối tượng hệ thống quản lý trung tâm học thêm

## 1. Giới thiệu đề tài

Trung tâm học thêm cần một hệ thống hỗ trợ quản lý học viên, giáo viên, khóa học, lớp học, lịch học, điểm danh, học phí và kết quả học tập. Hệ thống phục vụ nhân viên trung tâm trong các nghiệp vụ hằng ngày, hỗ trợ giáo viên theo dõi lớp được phân công, đồng thời giúp quản trị viên nắm được tình hình hoạt động và doanh thu.

Đề tài phù hợp với hướng tiếp cận phân tích thiết kế hướng đối tượng vì có nhiều nhóm người dùng, nhiều thực thể nghiệp vụ và nhiều quan hệ giữa các lớp như kế thừa, kết hợp, liên kết một-nhiều và phụ thuộc xử lý.

## 2. Phạm vi hệ thống

Hệ thống tập trung vào các nghiệp vụ:

- Quản lý tài khoản người dùng.
- Quản lý lead tư vấn, học viên, phụ huynh, giáo viên và nhân viên.
- Quản lý môn học, khóa học, lớp học và phòng học.
- Ghi danh học viên vào lớp.
- Phân công giáo viên giảng dạy.
- Quản lý lịch học và buổi học.
- Điểm danh học viên.
- Quản lý bài kiểm tra và điểm số.
- Quản lý học phí, phiếu thu, hóa đơn và thanh toán.
- Xem báo cáo thống kê cơ bản và xuất dữ liệu CSV.

Giới hạn đề tài: hệ thống triển khai mô hình một cơ sở, chưa xử lý học trực tuyến, chưa tích hợp thanh toán ngân hàng thực tế và chưa hỗ trợ học viên đăng ký lớp trực tuyến. Hướng mở rộng nhiều cơ sở được trình bày trong tài liệu `docs/thiet-ke-van-hanh-mot-co-so-va-nhieu-co-so.md`.

## 3. Actor

### 3.1. Quản trị viên

Quản trị viên có quyền quản trị toàn hệ thống:

- Quản lý tài khoản người dùng.
- Quản lý giáo viên.
- Quản lý nhân viên.
- Quản lý khóa học.
- Quản lý lớp học, phòng học và lịch học.
- Quản lý học phí, phiếu thu.
- Xem báo cáo thống kê.

### 3.2. Nhân viên trung tâm

Nhân viên trung tâm thực hiện các nghiệp vụ vận hành:

- Quản lý học viên.
- Quản lý lead tư vấn.
- Ghi danh học viên vào lớp.
- Lập phiếu thu học phí.
- Quản lý lớp học, phòng học, lịch học và buổi học.
- Xem lịch học.

### 3.3. Giáo viên

Giáo viên thực hiện nghiệp vụ liên quan đến lớp được phân công:

- Xem lớp được phân công.
- Xem danh sách học viên.
- Điểm danh học viên.
- Nhập điểm kiểm tra.
- Nhận xét học viên.

### 3.4. Học viên

Học viên có quyền tra cứu thông tin cá nhân:

- Xem lịch học.
- Xem điểm.
- Xem tình trạng học phí.
- Xem thông báo.

## 4. Yêu cầu chức năng

### 4.1. Đăng nhập

Người dùng nhập tài khoản và mật khẩu. Hệ thống kiểm tra thông tin đăng nhập, xác định vai trò người dùng và chuyển đến màn hình chức năng tương ứng.

### 4.2. Quản lý học viên

Nhân viên có thể thêm học viên, sửa thông tin học viên, tìm kiếm học viên, xem lịch sử học tập và xem tình trạng học phí của học viên. Học viên có thể có thông tin phụ huynh để trung tâm liên hệ khi cần.

### 4.3. Quản lý lead tư vấn

Nhân viên tiếp nhận lead, xem thông tin liên hệ, ghi chú nhu cầu học, hẹn kiểm tra đầu vào và chuyển lead đủ điều kiện sang quy trình tạo hồ sơ học viên, ghi danh.

### 4.4. Quản lý giáo viên

Quản trị viên hoặc nhân viên được phân quyền có thể thêm giáo viên, cập nhật thông tin giáo viên, phân công giáo viên dạy lớp và xem lịch dạy của giáo viên.

### 4.5. Quản lý khóa học và lớp học

Hệ thống cho phép tạo môn học, khóa học và lớp học. Mỗi khóa học có thể có nhiều lớp. Nhân viên có thể gán giáo viên cho lớp, ghi danh học viên vào lớp, theo dõi sĩ số và cập nhật trạng thái lớp học.

### 4.6. Quản lý lịch học

Nhân viên tạo phòng học, lịch học cố định cho lớp, buổi học cụ thể, cập nhật lịch học, kiểm tra trùng lịch giáo viên, kiểm tra trùng phòng học và xem lịch học theo lớp, giáo viên hoặc học viên.

### 4.7. Điểm danh

Giáo viên chọn lớp và buổi học, hệ thống hiển thị danh sách học viên trong lớp. Giáo viên đánh dấu trạng thái có mặt, vắng mặt hoặc đi muộn rồi lưu kết quả điểm danh.

### 4.8. Quản lý học phí

Nhân viên lập khoản học phí cho học viên, ghi nhận thanh toán, tạo hóa đơn và phiếu thu. Hệ thống hỗ trợ kiểm tra danh sách học viên chưa đóng học phí và xuất báo cáo doanh thu.

### 4.9. Quản lý điểm số

Giáo viên tạo bài kiểm tra, nhập điểm, sửa điểm, xem bảng điểm theo lớp và xem kết quả học tập của từng học viên.

### 4.10. Xem báo cáo thống kê

Quản trị viên và nhân viên xem thống kê về doanh thu, số lượng học viên, danh sách lớp, tình trạng đóng học phí, chuyên cần, kết quả học tập và xuất báo cáo CSV.

## 5. Danh sách use case

| STT | Use case | Actor chính | Mô tả ngắn |
| --- | --- | --- | --- |
| 1 | Đăng nhập | Tất cả người dùng | Xác thực người dùng và phân quyền truy cập |
| 2 | Quản lý lead tư vấn | Nhân viên | Theo dõi lead, gửi mail, hẹn test, ghi chú tư vấn |
| 3 | Quản lý học viên | Nhân viên | Thêm, sửa, tìm kiếm, xem thông tin học viên |
| 4 | Quản lý giáo viên | Quản trị viên | Thêm, cập nhật và theo dõi giáo viên |
| 5 | Quản lý khóa học | Quản trị viên | Tạo, cập nhật khóa học và môn học |
| 6 | Tạo lớp học | Nhân viên | Tạo lớp thuộc một khóa học cụ thể |
| 7 | Ghi danh học viên vào lớp | Nhân viên | Đăng ký học viên vào lớp còn chỗ |
| 8 | Phân công giáo viên | Nhân viên | Gán giáo viên phụ trách lớp |
| 9 | Quản lý phòng và lịch học | Nhân viên | Lập phòng học, lịch học, buổi học và kiểm tra trùng lịch |
| 10 | Điểm danh học viên | Giáo viên | Ghi nhận trạng thái tham gia buổi học |
| 11 | Nhập điểm kiểm tra | Giáo viên | Tạo bài kiểm tra, nhập và cập nhật điểm |
| 12 | Thu học phí | Nhân viên | Ghi nhận thanh toán và tạo phiếu thu |
| 13 | Xem báo cáo thống kê | Quản trị viên, Nhân viên | Xem doanh thu, học phí, lớp học, chuyên cần, kết quả học tập và xuất CSV |

## 6. Đặc tả một số use case chính

### 6.1. Use case: Ghi danh học viên vào lớp

Actor chính: Nhân viên trung tâm.

Tiền điều kiện:

- Nhân viên đã đăng nhập.
- Học viên đã có hồ sơ trong hệ thống.
- Lớp học đã được tạo và đang tuyển sinh.

Luồng chính:

1. Nhân viên tìm kiếm học viên.
2. Hệ thống hiển thị thông tin học viên.
3. Nhân viên chọn khóa học và lớp học cần ghi danh.
4. Hệ thống kiểm tra sĩ số lớp.
5. Hệ thống kiểm tra học viên đã đăng ký lớp này chưa.
6. Hệ thống tạo bản ghi ghi danh.
7. Hệ thống tạo khoản học phí cần thanh toán.
8. Hệ thống thông báo ghi danh thành công.

Luồng thay thế:

- Nếu lớp đã đủ sĩ số, hệ thống thông báo không thể ghi danh.
- Nếu học viên đã đăng ký lớp, hệ thống thông báo trùng ghi danh.

Hậu điều kiện:

- Học viên được thêm vào lớp.
- Một khoản học phí mới được tạo ở trạng thái chưa thanh toán.

### 6.2. Use case: Điểm danh học viên

Actor chính: Giáo viên.

Tiền điều kiện:

- Giáo viên đã đăng nhập.
- Giáo viên được phân công dạy lớp.
- Buổi học đã tồn tại trong lịch học.

Luồng chính:

1. Giáo viên chọn lớp được phân công.
2. Hệ thống hiển thị buổi học theo ngày.
3. Hệ thống tải danh sách học viên trong lớp.
4. Giáo viên đánh dấu trạng thái từng học viên.
5. Giáo viên xác nhận lưu điểm danh.
6. Hệ thống lưu phiếu điểm danh và chi tiết điểm danh.
7. Hệ thống thông báo lưu thành công.

Luồng thay thế:

- Nếu không có buổi học trong ngày, hệ thống thông báo không có lịch học.
- Nếu giáo viên không được phân công lớp, hệ thống từ chối thao tác.

Hậu điều kiện:

- Kết quả điểm danh của buổi học được lưu.

### 6.3. Use case: Thu học phí

Actor chính: Nhân viên trung tâm.

Tiền điều kiện:

- Nhân viên đã đăng nhập.
- Học viên có khoản học phí cần thanh toán.

Luồng chính:

1. Nhân viên tìm kiếm học viên.
2. Hệ thống hiển thị danh sách khoản học phí.
3. Nhân viên chọn khoản học phí cần thu.
4. Nhân viên nhập số tiền và chọn phương thức thanh toán.
5. Hệ thống kiểm tra số tiền hợp lệ.
6. Hệ thống ghi nhận thanh toán.
7. Hệ thống cập nhật trạng thái học phí.
8. Hệ thống tạo hóa đơn.
9. Hệ thống thông báo thu học phí thành công.

Luồng thay thế:

- Nếu số tiền không hợp lệ, hệ thống yêu cầu nhập lại.
- Nếu khoản học phí đã thanh toán đủ, hệ thống không cho thu thêm.

Hậu điều kiện:

- Thông tin thanh toán được lưu.
- Trạng thái học phí được cập nhật.
- Hóa đơn được tạo.

## 7. Phân tích lớp

### 7.1. Nhóm người dùng

`User` là lớp cha chứa các thuộc tính chung của người dùng trong hệ thống:

- `id`
- `fullName`
- `phone`
- `email`
- `username`
- `password`
- `status`

Các lớp kế thừa:

- `Admin`: quản lý người dùng, khóa học và xem báo cáo.
- `Staff`: quản lý học viên, lớp học, ghi danh và học phí.
- `Teacher`: xem lớp được phân công, điểm danh và nhập điểm.
- `Student`: xem lịch học, điểm số, học phí và thông báo.

### 7.2. Nhóm đào tạo

- `Subject`: lưu thông tin môn học.
- `Course`: lưu thông tin khóa học, học phí, số buổi, ngày bắt đầu và ngày kết thúc.
- `ClassRoom`: lưu thông tin lớp học, sĩ số tối đa, trạng thái lớp.
- `Room`: lưu thông tin phòng học.
- `Schedule`: lưu lịch học theo ngày trong tuần, giờ bắt đầu, giờ kết thúc và phòng học.
- `StudySession`: đại diện cho từng buổi học cụ thể của lớp.
- `TeachingAssignment`: lưu thông tin phân công giáo viên cho lớp.

### 7.3. Nhóm ghi danh và học phí

- `Enrollment`: lưu thông tin học viên đăng ký vào lớp.
- `TuitionPayment`: lưu khoản học phí cần thanh toán.
- `Invoice`: lưu hóa đơn hoặc phiếu thu.
- `Payment`: lưu chi tiết giao dịch thanh toán.

### 7.4. Nhóm điểm danh và kết quả học tập

- `Attendance`: phiếu điểm danh của một buổi học.
- `AttendanceDetail`: dòng điểm danh của từng học viên.
- `Exam`: bài kiểm tra trong một lớp học.
- `Score`: điểm của học viên trong một bài kiểm tra.

### 7.5. Nhóm hỗ trợ

- `Parent`: thông tin phụ huynh.
- `Notification`: thông báo gửi đến người dùng.
- `Report`: đối tượng báo cáo thống kê.

## 8. Quan hệ giữa các lớp

- `User` là lớp cha của `Admin`, `Staff`, `Teacher`, `Student`.
- Một `Student` có thể có một hoặc nhiều `Parent`.
- Một `Subject` có nhiều `Course`.
- Một `Course` có nhiều `ClassRoom`.
- Một `ClassRoom` có nhiều `Schedule`.
- Một `ClassRoom` có nhiều `StudySession`.
- Một `ClassRoom` có nhiều `Enrollment`.
- Một `Student` có nhiều `Enrollment`.
- Một `Teacher` có nhiều `TeachingAssignment`.
- Một `ClassRoom` có nhiều `TeachingAssignment`.
- Một `StudySession` có một `Attendance`.
- Một `Attendance` có nhiều `AttendanceDetail`.
- Một `Student` có nhiều `AttendanceDetail`.
- Một `ClassRoom` có nhiều `Exam`.
- Một `Exam` có nhiều `Score`.
- Một `Student` có nhiều `Score`.
- Một `Student` có nhiều `TuitionPayment`.
- Một `TuitionPayment` có một `Invoice`.
- Một `Invoice` có một `Payment`.

## 9. Thiết kế hướng đối tượng

### 9.1. Kế thừa

Hệ thống sử dụng khái quát hóa để mô hình hóa các loại người dùng. Trong triển khai TypeScript, vai trò được lưu ở `User.role`, còn quyền thao tác được kiểm soát bằng middleware và service:

```ts
type Role = 'ADMIN' | 'STAFF' | 'TEACHER' | 'STUDENT';

class User {
  constructor(
    protected id: string,
    protected fullName: string,
    protected username: string,
    protected role: Role
  ) {}

  getRole() {
    return this.role;
  }
}

class TeacherUser extends User {
  canTakeAttendance() {
    return this.role === 'TEACHER';
  }

  canEnterScore() {
    return this.role === 'TEACHER';
  }
}

class StudentUser extends User {
  canViewOwnData() {
    return this.role === 'STUDENT';
  }
}
```

### 9.2. Đóng gói

Các thuộc tính của lớp nên được khai báo `private` hoặc `protected`. Việc truy cập dữ liệu được thực hiện thông qua phương thức nghiệp vụ hoặc getter/setter có kiểm soát.

Ví dụ: `ClassRoom` không nên cho phép cập nhật sĩ số trực tiếp mà nên thông qua phương thức `canEnroll()` và `addEnrollment()`.

### 9.3. Đa hình

Các loại người dùng có thể có tập quyền khác nhau dựa trên vai trò:

```ts
type Permission = 'MANAGE_USERS' | 'MANAGE_COURSES' | 'VIEW_REPORTS' | 'TAKE_ATTENDANCE' | 'VIEW_OWN_DATA';

function getPermissions(role: Role): Permission[] {
  switch (role) {
    case 'ADMIN':
      return ['MANAGE_USERS', 'MANAGE_COURSES', 'VIEW_REPORTS'];
    case 'TEACHER':
      return ['TAKE_ATTENDANCE'];
    case 'STUDENT':
      return ['VIEW_OWN_DATA'];
    default:
      return [];
  }
}
```

### 9.4. Trừu tượng hóa

Các thao tác nghiệp vụ có thể được gom vào service hoặc controller:

- `EnrollmentController`: xử lý ghi danh.
- `AttendanceController`: xử lý điểm danh.
- `TuitionController`: xử lý thu học phí.
- `ScoreController`: xử lý nhập điểm.

## 10. Kiến trúc triển khai demo Node/React

Demo hiện tại được triển khai theo kiến trúc client-server. Backend chịu trách nhiệm xác thực, phân quyền và xử lý nghiệp vụ; frontend chịu trách nhiệm giao diện theo vai trò và gọi API.

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    modules/
      auth/
      students/
      teachers/
      classes/
      schedules/
      enrollments/
      attendance/
      exams/
      tuition/
      reports/
    middleware/
    lib/
frontend/
  src/
    components/
    contexts/
    pages/
    types/
```

Mô hình này tách rõ:

- `Prisma schema`: mô hình dữ liệu và quan hệ giữa các thực thể.
- `Controller`: nhận request, kiểm tra input và chuyển cho service.
- `Service`: xử lý nghiệp vụ như ghi danh, kiểm tra trùng lịch, thu học phí, phân quyền giáo viên/học viên.
- `Middleware`: xác thực JWT và kiểm tra vai trò.
- `React pages`: giao diện theo role cho Admin, Staff, Teacher và Student.
- `Contexts`: lưu trạng thái đăng nhập, giao diện sáng/tối và ngôn ngữ.

## 11. Cơ sở dữ liệu triển khai

Cơ sở dữ liệu hiện được định nghĩa trong `backend/prisma/schema.prisma` và triển khai trên SQL Server thông qua Prisma. Các model chính:

- `User`: tài khoản đăng nhập, vai trò và trạng thái.
- `StudentProfile`, `Parent`: hồ sơ học viên và phụ huynh.
- `TeacherProfile`, `StaffProfile`: hồ sơ giáo viên và nhân viên.
- `Subject`, `Course`, `ClassRoom`: môn học, khóa học và lớp học.
- `Room`, `ClassRoomRoom`, `Schedule`, `StudySession`: phòng học, gán phòng cho lớp, lịch học cố định và buổi học cụ thể.
- `Enrollment`, `TeachingAssignment`: ghi danh học viên và phân công giáo viên.
- `Attendance`, `AttendanceDetail`: phiếu điểm danh và chi tiết điểm danh.
- `Exam`, `Score`: bài kiểm tra và điểm số.
- `TuitionPayment`, `Payment`, `Invoice`: khoản học phí, giao dịch thanh toán và phiếu thu.
- `Notification`: thông báo cho người dùng.

## 12. Danh sách sơ đồ

Các sơ đồ PlantUML được đặt trong thư mục `diagrams`:

- `use-case.puml`: sơ đồ use case tổng quan.
- `class-diagram.puml`: sơ đồ lớp.
- `seq-enrollment.puml`: sequence ghi danh học viên vào lớp.
- `seq-attendance.puml`: sequence điểm danh học viên.
- `seq-tuition-payment.puml`: sequence thu học phí.
- `activity-enrollment.puml`: activity ghi danh học viên.
- `activity-attendance.puml`: activity điểm danh.
- `activity-tuition-payment.puml`: activity thu học phí.
- `state-classroom.puml`: state lớp học.
- `state-tuition-payment.puml`: state học phí.
- `erd.puml`: ERD gợi ý.

Các tài liệu hỗ trợ demo và nghiệm thu:

- `docs/huong-dan-demo.md`: kịch bản demo theo vai trò.
- `docs/huong-dan-su-dung-tung-tinh-nang.md`: hướng dẫn sử dụng từng chức năng.
- `docs/api-endpoints.md`: bảng API backend theo module, role, body và rule nghiệp vụ.
- `docs/checklist-nghiem-thu-do-an.md`: checklist tự kiểm tra trước khi nộp/bảo vệ.
- `docs/ma-tran-chuc-nang-nghiem-thu.md`: ma trận đối chiếu chức năng với màn hình, API, tài liệu và test.
- `docs/thiet-ke-van-hanh-mot-co-so-va-nhieu-co-so.md`: thiết kế vận hành một cơ sở và hướng mở rộng nhiều cơ sở.

## 13. Kết luận

Hệ thống quản lý trung tâm học thêm có phạm vi nghiệp vụ rõ ràng, nhiều actor và nhiều thực thể liên kết với nhau. Việc áp dụng phân tích thiết kế hướng đối tượng giúp hệ thống dễ mở rộng, dễ bảo trì và phù hợp để triển khai demo bằng Node/Express, Prisma và React. Các lớp/thực thể như `User`, `StudentProfile`, `TeacherProfile`, `ClassRoom`, `Enrollment`, `Attendance`, `TuitionPayment` và `Score` thể hiện tốt các quan hệ khái quát hóa, liên kết và trách nhiệm nghiệp vụ trong hệ thống.
