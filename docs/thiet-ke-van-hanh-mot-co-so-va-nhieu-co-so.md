# Thiết kế vận hành trung tâm dạy thêm từ một cơ sở đến nhiều cơ sở

Tài liệu này giải thích cách quản lý nghiệp vụ cho một cơ sở trước, sau đó mở rộng lên nhiều cơ sở. Bản app hiện tại tập trung triển khai đầy đủ mô hình một cơ sở để phù hợp phạm vi đồ án; phần nhiều cơ sở là hướng mở rộng có thể trình bày khi bảo vệ.

## 1. Mục tiêu quản lý một cơ sở

Một cơ sở cần quản lý đúng các luồng cốt lõi sau:

1. Tư vấn tuyển sinh: tiếp nhận lead, lưu thông tin liên hệ, ghi chú nhu cầu học, hẹn kiểm tra đầu vào.
2. Hồ sơ học viên: lưu thông tin học viên, phụ huynh, trường học, thông tin liên hệ.
3. Chương trình đào tạo: quản lý môn học, khóa học, học phí, số buổi học.
4. Lớp học: tạo lớp từ khóa học, quy định sĩ số tối đa, trạng thái lớp, giáo viên phụ trách.
5. Ghi danh: đưa học viên vào lớp, kiểm tra lớp còn tuyển sinh, không vượt sĩ số, không đăng ký trùng.
6. Lịch học và phòng học: tạo phòng, tạo lịch theo thứ/giờ, kiểm tra trùng phòng và trùng giáo viên.
7. Buổi học: tạo buổi học cụ thể theo ngày để giáo viên điểm danh.
8. Điểm danh: giáo viên chỉ điểm danh lớp được phân công.
9. Kiểm tra và điểm số: giáo viên tạo bài kiểm tra, nhập/sửa điểm trong lớp được phân công.
10. Học phí và phiếu thu: tự sinh khoản học phí khi ghi danh, thu tiền không vượt số còn lại, tạo phiếu thu.
11. Thông báo và tra cứu: học viên xem khóa học, lịch, điểm, học phí, phiếu thu và thông báo.
12. Báo cáo: ban quản lý xem dashboard, doanh thu, chuyên cần, kết quả học tập và xuất CSV.

## 2. Vai trò trong một cơ sở

| Vai trò | Trách nhiệm chính | Dữ liệu được thao tác |
| --- | --- | --- |
| Admin | Quản trị hệ thống, tài khoản, danh mục đào tạo, báo cáo | Toàn bộ dữ liệu một cơ sở |
| Staff | Tư vấn, hồ sơ học viên, ghi danh, lịch học, học phí | Lead, học viên, lớp, lịch, học phí |
| Teacher | Giảng dạy, điểm danh, nhập điểm | Lớp được phân công |
| Student | Tra cứu thông tin cá nhân | Dữ liệu học tập và tài chính của chính mình |

Nguyên tắc quan trọng: mỗi thao tác phải gắn với vai trò. Admin không làm thay toàn bộ nghiệp vụ hằng ngày; Staff vận hành; Teacher chỉ thao tác lớp được phân công; Student chỉ xem dữ liệu cá nhân.

## 3. Quy trình vận hành một cơ sở

### 3.1. Từ lead đến học viên

1. Staff tiếp nhận lead trong màn `Quản lý Leads`.
2. Staff cập nhật ghi chú, hẹn test hoặc gửi email tư vấn.
3. Khi lead đồng ý học, Staff tạo hồ sơ học viên.
4. Staff chọn lớp phù hợp và ghi danh học viên.
5. Hệ thống tạo khoản học phí tương ứng.

### 3.2. Từ khóa học đến lớp học

1. Admin tạo môn học.
2. Admin tạo khóa học, gồm học phí và số buổi.
3. Staff/Admin tạo lớp học từ khóa học.
4. Staff/Admin phân công giáo viên.
5. Staff/Admin tạo phòng học, lịch học và buổi học cụ thể.

### 3.3. Từ học tập đến đánh giá

1. Teacher xem lớp được phân công.
2. Teacher chọn buổi học và điểm danh.
3. Teacher tạo bài kiểm tra.
4. Teacher nhập hoặc sửa điểm.
5. Student xem điểm và lịch học trong cổng học viên.

### 3.4. Từ ghi danh đến học phí

1. Khi ghi danh thành công, hệ thống tự sinh khoản học phí.
2. Staff thu tiền toàn phần hoặc một phần.
3. Hệ thống cập nhật trạng thái `UNPAID`, `PARTIAL` hoặc `PAID`.
4. Mỗi lần thanh toán phát sinh một phiếu thu.
5. Student chỉ xem được phiếu thu của chính mình.

## 4. Dữ liệu chính cho một cơ sở

Các thực thể cần có trong mô hình một cơ sở:

- `User`: tài khoản đăng nhập và vai trò.
- `StudentProfile`, `Parent`, `TeacherProfile`, `StaffProfile`: hồ sơ nghiệp vụ.
- `Subject`, `Course`, `ClassRoom`: cấu trúc đào tạo.
- `Room`, `Schedule`, `StudySession`: phòng, lịch cố định và buổi học cụ thể.
- `Enrollment`: ghi danh học viên vào lớp.
- `TeachingAssignment`: phân công giáo viên.
- `Attendance`, `AttendanceDetail`: điểm danh.
- `Exam`, `Score`: kiểm tra và điểm số.
- `TuitionPayment`, `Payment`, `Invoice`: học phí, thanh toán và phiếu thu.
- `Notification`: thông báo.

## 5. Các ràng buộc nghiệp vụ nên trình bày khi bảo vệ

- Không ghi danh vào lớp chưa mở tuyển sinh hoặc đã kết thúc.
- Không ghi danh nếu lớp vượt sĩ số tối đa.
- Không ghi danh trùng một học viên vào cùng một lớp.
- Khi hủy hoặc hoàn tất ghi danh, sĩ số lớp phải được tính lại.
- Không tạo lịch trùng phòng cùng thời gian.
- Không tạo lịch trùng giáo viên cùng thời gian.
- Giáo viên chỉ điểm danh và nhập điểm lớp được phân công.
- Học viên chỉ xem lịch, điểm, học phí và phiếu thu của chính mình.
- Không thu học phí vượt số tiền còn lại.
- Tài khoản `LOCKED` hoặc `INACTIVE` không được đăng nhập.

## 6. Mở rộng lên nhiều cơ sở

Khi trung tâm có nhiều cơ sở, không nên nhân bản nhiều phần mềm riêng lẻ. Cách đúng là thêm lớp dữ liệu `Branch` để mọi nghiệp vụ được lọc theo cơ sở.

### 6.1. Thực thể cần bổ sung

| Thực thể | Mục đích |
| --- | --- |
| `Branch` | Lưu tên cơ sở, địa chỉ, số điện thoại, trạng thái |
| `UserBranch` | Gán người dùng vào một hoặc nhiều cơ sở |
| `BranchRole` hoặc mở rộng role | Phân biệt quyền toàn hệ thống và quyền trong từng cơ sở |
| `BranchTransfer` | Ghi nhận chuyển học viên từ cơ sở này sang cơ sở khác nếu cần |

Các bảng nên có `branchId`: `StudentProfile`, `TeacherProfile`, `StaffProfile`, `ClassRoom`, `Room`, `Schedule`, `StudySession`, `Enrollment`, `TuitionPayment`, `Notification`.

Các bảng danh mục có thể dùng chung toàn hệ thống: `Subject`, `Course`. Nếu mỗi cơ sở được tự định giá, có thể tách `CoursePrice` theo `branchId`.

### 6.2. Phân quyền nhiều cơ sở

Nên tách quyền như sau:

| Vai trò | Phạm vi |
| --- | --- |
| Super Admin | Xem và cấu hình toàn bộ hệ thống nhiều cơ sở |
| Branch Manager | Quản lý một cơ sở được phân quyền |
| Staff | Vận hành dữ liệu trong cơ sở được gán |
| Teacher | Xem lớp được phân công, có thể dạy nhiều cơ sở |
| Student | Xem dữ liệu cá nhân, có thể học ở nhiều cơ sở nếu được ghi danh |

Rule quan trọng: mọi API danh sách và báo cáo phải lọc theo `branchId` trong quyền của người dùng, không chỉ lọc ở giao diện.

### 6.3. Quy trình nhiều cơ sở

1. Super Admin tạo danh sách cơ sở.
2. Super Admin hoặc Branch Manager tạo phòng học cho từng cơ sở.
3. Staff của cơ sở A chỉ thấy lead, học viên, lớp, lịch và học phí thuộc cơ sở A.
4. Teacher có thể được phân công lớp ở cơ sở A và B, nhưng chỉ thấy các lớp đã được gán.
5. Báo cáo có hai cấp:
   - Báo cáo từng cơ sở: doanh thu, sĩ số, chuyên cần, kết quả học tập.
   - Báo cáo toàn hệ thống: so sánh doanh thu, số lượng học viên, hiệu suất lớp giữa các cơ sở.

### 6.4. Thay đổi màn hình khi mở rộng

- Thêm bộ lọc `Cơ sở` ở dashboard, học viên, lớp, lịch học, học phí và báo cáo.
- Khi tạo phòng học, bắt buộc chọn cơ sở.
- Khi tạo lớp, bắt buộc chọn cơ sở.
- Khi ghi danh, chỉ hiển thị lớp thuộc cơ sở đang chọn.
- Khi tạo lịch, chỉ hiển thị phòng của cơ sở đó.
- Khi xuất báo cáo, tên file nên chứa mã cơ sở và kỳ báo cáo.

### 6.5. Lộ trình nâng cấp từ app hiện tại

1. Thêm model `Branch` và dữ liệu seed cho cơ sở mặc định.
2. Thêm `branchId` vào các bảng vận hành chính.
3. Gán toàn bộ dữ liệu hiện tại vào cơ sở mặc định.
4. Thêm middleware xác định danh sách cơ sở người dùng được truy cập.
5. Cập nhật service backend để mọi truy vấn danh sách có điều kiện `branchId`.
6. Cập nhật frontend thêm bộ chọn cơ sở cho Admin/Branch Manager.
7. Cập nhật báo cáo để hỗ trợ lọc theo cơ sở và so sánh nhiều cơ sở.

Với phạm vi đồ án hiện tại, mô hình một cơ sở là lựa chọn hợp lý vì thể hiện đầy đủ nghiệp vụ lõi. Phần nhiều cơ sở nên trình bày là hướng mở rộng có thiết kế rõ ràng, tránh làm tăng độ phức tạp vượt thời gian triển khai.
