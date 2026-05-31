# Hướng dẫn sử dụng từng tính năng

Tài liệu này dùng cho demo đồ án hệ thống quản lý trung tâm học thêm một cơ sở. Dữ liệu mẫu được tạo bằng lệnh seed, mật khẩu của các tài khoản demo đều là `123456`.

## 1. Đăng nhập và phân quyền

Đường dẫn: `http://localhost:5173/login`

Tài khoản demo:

| Vai trò | Tài khoản | Quyền chính |
| --- | --- | --- |
| Admin | `admin` | Quản trị tài khoản, giáo viên, khóa học, lớp học, báo cáo |
| Nhân viên | `staff01` | Tư vấn, học viên, ghi danh, lịch học, học phí |
| Giáo viên | `teacher01` | Xem lớp được phân công, điểm danh, nhập điểm |
| Học viên | `student01` | Xem khóa học, lịch học, điểm, học phí, phiếu thu mẫu, thông báo |

Cách dùng:

1. Nhập tài khoản và mật khẩu.
2. Bấm `Đăng nhập`.
3. Hệ thống chuyển vào `Dashboard`.
4. Menu bên trái thay đổi theo vai trò đăng nhập.

Kết quả cần kiểm tra khi demo:

- Admin và nhân viên thấy các nhóm quản lý vận hành.
- Giáo viên chỉ thấy chức năng dạy học.
- Học viên chỉ thấy thông tin học tập cá nhân.

Thanh thao tác chung sau khi đăng nhập:

- Icon menu ở góc trái đưa về `Dashboard`.
- Icon kính lúp mở tìm nhanh các màn hình được phép truy cập theo vai trò.
- Icon chuông/tin nhắn mở `Thông báo`.
- Icon dấu cộng là thao tác nhanh: Admin/Nhân viên vào thêm học viên, Giáo viên vào nhập điểm, Học viên vào lịch học.
- Nút trăng/mặt trời đổi giao diện sáng/tối; nút `VI/EN` đổi ngôn ngữ.

## 2. Dashboard và báo cáo nhanh

Vai trò: Admin, Nhân viên, Giáo viên, Học viên.

Cách dùng:

1. Vào `Thống kê & báo cáo`.
2. Quan sát các chỉ số tổng quan như học viên, giáo viên, lớp học, học phí cần xử lý và doanh thu.
3. Với Admin hoặc Nhân viên, bấm vào các thẻ phân tích để xem chi tiết theo ngày, tháng hoặc năm.

Ý nghĩa nghiệp vụ:

- Ban quản lý nắm nhanh tình hình vận hành.
- Nhân viên theo dõi hồ sơ mới và công nợ.
- Giáo viên/học viên thấy phần tổng quan phù hợp với vai trò.

## 3. Quản lý tài khoản

Vai trò: Admin.

Cách dùng:

1. Vào `Tài khoản`.
2. Xem danh sách người dùng trong hệ thống.
3. Ở khối `Tạo tài khoản`, nhập họ tên, tài khoản, mật khẩu, vai trò, điện thoại và email.
4. Nếu chọn `STAFF`, nhập thêm mã nhân viên và vị trí.
5. Nếu chọn `TEACHER`, nhập thêm mã giáo viên, chuyên môn và bằng cấp.
6. Nếu chọn `STUDENT`, nhập thêm mã học viên và trường học.
7. Bấm `Tạo tài khoản`.
8. Ở cột `Cập nhật`, đổi trạng thái tài khoản sang `ACTIVE`, `INACTIVE` hoặc `LOCKED`.

Lưu ý:

- Mỗi tài khoản có trạng thái hoạt động.
- Tài khoản bị khóa hoặc không hoạt động sẽ không đăng nhập được.
- Chỉ Admin được phép cập nhật trạng thái tài khoản.
- Vào `Nhân viên` để xem nhanh danh sách tài khoản nhân viên trung tâm. Tài khoản Staff mới vẫn được tạo ở màn `Tài khoản`.

## 4. Quản lý Leads và tư vấn

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Quản lý Leads`.
2. Chọn một lead/học viên mẫu ở danh sách bên trái.
3. Bấm `Gửi mail` để mở ứng dụng email với địa chỉ của lead nếu đã có email.
4. Bấm `Hẹn test` để thêm một dòng lịch sử hẹn kiểm tra đầu vào.
5. Bấm `Chỉnh sửa` để chuyển tới vùng ghi chú tư vấn.
6. Bấm các tab `Tổng quan`, `Hồ sơ chi tiết`, `Lịch sử tư vấn`, `Kiểm tra đầu vào` để đổi vùng đang theo dõi.
7. Trong lịch sử tư vấn, bấm `Chi tiết` để mở đúng ngữ cảnh của hoạt động.
8. Bấm `Trở lại danh sách` để mở danh sách học viên.

Ý nghĩa nghiệp vụ:

- Nhân viên tư vấn theo dõi trạng thái lead, lịch sử tư vấn, nhu cầu học và kết quả kiểm tra đầu vào.
- Lead đủ điều kiện sẽ được chuyển sang luồng ghi danh học viên.

## 5. Quản lý học viên

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Danh sách học viên`.
2. Bấm `Thêm học viên`.
3. Nhập thông tin học viên: họ tên, tài khoản, mã học viên, điện thoại, email, ngày sinh, trường, địa chỉ.
4. Nhập thông tin phụ huynh: họ tên, số điện thoại, quan hệ.
5. Lưu hồ sơ.
6. Quay lại danh sách để tìm kiếm và mở hồ sơ chi tiết.

Trong hồ sơ học viên có các tab:

- `Tổng quan`: thông tin cá nhân, phụ huynh, lớp đang học.
- `Lịch hẹn`: các buổi học liên quan.
- `Hóa đơn`: phiếu thu đã phát sinh.
- `Giao dịch`: lịch sử thanh toán.
- `Điểm danh`: lịch sử chuyên cần.
- `Thống kê`: tổng hợp học tập và tài chính.
- `Điểm và đánh giá`: kết quả kiểm tra.

## 6. Quản lý giáo viên

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Giáo viên`.
2. Admin có thể thêm giáo viên mới.
3. Nhân viên được xem danh sách giáo viên hiện có nhưng không thêm/sửa hồ sơ giáo viên.
4. Khi thêm giáo viên, nhập mã giáo viên, chuyên môn, bằng cấp và thông tin liên hệ.
5. Khi tạo lớp, phân công giáo viên vào lớp tương ứng.

Ý nghĩa nghiệp vụ:

- Dữ liệu giáo viên dùng để xếp lớp.
- Hệ thống kiểm tra trùng lịch dạy của giáo viên khi tạo lịch học.

## 7. Quản lý khóa học

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Khóa học`.
2. Admin có thể tạo môn học và khóa học mới.
3. Nhân viên được xem danh mục khóa học để tư vấn và ghi danh, nhưng không tạo/sửa khóa học.
4. Khi tạo khóa học, nhập môn học, tên khóa, khối lớp, học phí và số buổi.
5. Dùng khóa học làm dữ liệu nền để tạo lớp học.

Ví dụ:

- Môn: Toán
- Khóa: Toán lớp 10
- Học phí: 2.500.000
- Số buổi: 24

## 8. Quản lý lớp học và xếp lớp

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Lớp học` hoặc `Xếp lớp`.
2. Tạo lớp từ một khóa học.
3. Nhập tên lớp, sĩ số tối đa, trạng thái và phòng học dự kiến.
4. Phân công giáo viên phụ trách.
5. Theo dõi sĩ số hiện tại và danh sách học viên đã ghi danh.

Các trạng thái lớp:

- `NOT_OPENED`: chưa mở.
- `ENROLLING`: đang tuyển sinh.
- `ACTIVE`: đang học.
- `POSTPONED`: tạm hoãn.
- `FINISHED`: đã kết thúc.
- `CANCELLED`: đã hủy.

## 9. Ghi danh học viên

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Đăng ký học`.
2. Chọn học viên.
3. Chọn lớp đang tuyển sinh hoặc đang học.
4. Bấm lưu ghi danh.
5. Hệ thống tự tạo khoản học phí cho học viên theo học phí của khóa học.
6. Khi học viên nghỉ hoặc hoàn thành lớp, đổi trạng thái ghi danh ở cột `Cập nhật`.
7. Nếu chuyển trạng thái sang `CANCELLED` hoặc `COMPLETED`, hệ thống cập nhật lại sĩ số hiện tại của lớp.

Ràng buộc nghiệp vụ:

- Không ghi danh trùng một học viên vào cùng một lớp.
- Không ghi danh vào lớp đã đủ sĩ số.
- Không ghi danh vào lớp chưa mở đăng ký hoặc đã kết thúc.
- Khi kích hoạt lại ghi danh, lớp vẫn phải đang tuyển sinh/đang học và chưa vượt sĩ số.

## 10. Quản lý phòng và lịch học

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Lịch học`.
2. Ở khối `Quản lý phòng học`, nhập tên phòng, sức chứa và vị trí rồi bấm `Thêm phòng` nếu cần thêm phòng mới.
3. Bấm `Thêm mới`.
4. Chọn lớp, phòng, thứ trong tuần, giờ bắt đầu và giờ kết thúc.
5. Lưu lịch học.
6. Xem lịch theo dạng tháng, tuần hoặc danh sách ngày.

Ràng buộc nghiệp vụ:

- Giờ bắt đầu phải nhỏ hơn giờ kết thúc.
- Một phòng không được có hai lớp trùng giờ.
- Một giáo viên không được dạy hai lớp trùng giờ.

## 11. Quản lý buổi học

Vai trò: Admin, Nhân viên, Giáo viên.

Cách dùng:

1. Vào `Lịch học`.
2. Ở khối `Tạo buổi học`, chọn lớp học.
3. Nhập ngày học và nội dung buổi học.
4. Chọn trạng thái ban đầu, thường là `SCHEDULED`.
5. Bấm `Tạo buổi học`.
6. Giáo viên chọn buổi học này khi điểm danh.

Trạng thái buổi học:

- `SCHEDULED`: đã lên lịch.
- `COMPLETED`: đã hoàn thành.
- `CANCELLED`: đã hủy.

## 12. Điểm danh

Vai trò: Giáo viên.

Cách dùng:

1. Đăng nhập bằng `teacher01`.
2. Vào `Điểm danh`.
3. Chọn lớp được phân công.
4. Chọn buổi học.
5. Với từng học viên, chọn `Có mặt`, `Vắng` hoặc `Đi muộn`.
6. Bấm `Lưu điểm danh`.

Ràng buộc nghiệp vụ:

- Giáo viên chỉ điểm danh lớp mình được phân công.
- Phiếu điểm danh phải có đủ học viên đang học trong lớp.
- Nếu điểm danh lại cùng buổi, hệ thống cập nhật phiếu cũ.

## 13. Nhập điểm kiểm tra

Vai trò: Giáo viên, Admin.

Cách dùng:

1. Đăng nhập bằng giáo viên.
2. Vào `Nhập điểm`.
3. Chọn lớp.
4. Tạo bài kiểm tra: tên bài, ngày kiểm tra, điểm tối đa.
5. Chọn bài kiểm tra, chọn học viên và nhập điểm.
6. Lưu điểm.
7. Nếu nhập sai, ở bảng điểm bấm `Sửa điểm`, cập nhật điểm hoặc nhận xét rồi bấm `Lưu`.

Ràng buộc nghiệp vụ:

- Điểm không được vượt quá điểm tối đa.
- Một học viên chỉ có một điểm cho cùng một bài kiểm tra.
- Giáo viên chỉ tạo bài kiểm tra, nhập điểm và sửa điểm cho lớp mình phụ trách.

## 14. Thu học phí

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Thanh toán` hoặc `Học phí`.
2. Chọn khoản học phí chưa thanh toán.
3. Nhập số tiền thu.
4. Chọn phương thức: tiền mặt, chuyển khoản hoặc thẻ.
5. Nhập ghi chú nếu có.
6. Bấm `Ghi nhận thanh toán`.
7. Sau khi hệ thống tạo phiếu thu, bấm `Xem phiếu thu` để mở chi tiết hóa đơn.
8. Ở bảng học phí, có thể bấm `Xem phiếu thu` để mở lại phiếu thu gần nhất của từng khoản.

Kết quả:

- Nếu thu đủ, trạng thái chuyển thành `PAID`.
- Nếu thu một phần, trạng thái chuyển thành `PARTIAL`.
- Hệ thống tạo phiếu thu/hóa đơn cho giao dịch.

Ràng buộc nghiệp vụ:

- Số tiền thanh toán phải lớn hơn 0.
- Không được thu vượt số tiền còn lại.

## 15. Xem hóa đơn

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Sau khi thu học phí, mở khoản học phí hoặc danh sách hóa đơn.
2. Chọn phiếu thu cần xem.
3. Kiểm tra thông tin học viên, lớp học, ngày thu, số tiền và phương thức thanh toán.

Ứng dụng khi demo:

- Dùng để chứng minh luồng từ ghi danh đến phát sinh học phí, thanh toán và hóa đơn.

## 16. Báo cáo thống kê

Vai trò: Admin, Nhân viên.

Cách dùng:

1. Vào `Báo cáo`.
2. Xem báo cáo doanh thu: phải thu, đã thu, công nợ.
3. Xem báo cáo chuyên cần: có mặt, vắng, đi muộn.
4. Xem báo cáo kết quả học tập: điểm trung bình và tổng số điểm.
5. Bấm `Xuất báo cáo` để tải file CSV tổng hợp doanh thu, chuyên cần, điểm số và chi tiết công nợ học phí.

Ý nghĩa nghiệp vụ:

- Quản lý biết lớp nào vận hành tốt.
- Kế toán biết công nợ cần xử lý.
- Trung tâm có số liệu để đánh giá chất lượng đào tạo.

## 17. Chức năng dành cho học viên

Vai trò: Học viên.

Cách dùng:

1. Đăng nhập bằng `student01`.
2. Vào `Khóa học của tôi` để xem các lớp đang học, tiến độ, lịch học, điểm và trạng thái học phí.
3. Trong từng thẻ khóa học, bấm `Vào học` để mở lịch học hoặc bấm `Tài liệu` để chuyển xuống khu bài tập tự chọn.
4. Ở khu `Bài tập tự chọn`, bấm `Xem bài làm` để xem kết quả/điểm liên quan.
5. Vào `Lịch của tôi` để xem lịch học theo tuần.
6. Vào `Điểm của tôi` để xem điểm kiểm tra và nhận xét.
7. Vào `Học phí của tôi` để xem khoản phải đóng, đã đóng, hạn đóng và trạng thái.
8. Nếu khoản học phí đã có phiếu thu, bấm `Xem phiếu thu` để mở chi tiết hóa đơn của chính học viên.
9. Vào `Thông báo` để xem nhắc học phí hoặc thông báo từ trung tâm.
10. Với thông báo mới, bấm `Đánh dấu đã đọc` để xử lý từng thông báo hoặc bấm `Đánh dấu tất cả đã đọc`.

## 18. Chức năng dành cho giáo viên

Vai trò: Giáo viên.

Cách dùng:

1. Đăng nhập bằng `teacher01`.
2. Vào `Lớp của tôi` để xem các lớp được phân công.
3. Vào `Điểm danh` để điểm danh từng buổi học.
4. Vào `Nhập điểm` để tạo bài kiểm tra và nhập điểm.
5. Vào `Thông báo` để xem thông báo liên quan.
6. Đánh dấu thông báo đã đọc sau khi xử lý để số thông báo mới giảm về đúng trạng thái.

## 19. Đổi giao diện và ngôn ngữ

Vai trò: Tất cả người dùng.

Cách dùng:

1. Bấm nút chế độ sáng/tối trên thanh trên cùng để đổi theme.
2. Bấm nút `VI` hoặc `EN` để đổi ngôn ngữ.
3. Hệ thống lưu tùy chọn trong trình duyệt.

## 20. Kịch bản demo đầy đủ nên trình bày

1. Admin đăng nhập, xem dashboard và tài khoản.
2. Nhân viên tạo học viên mới.
3. Nhân viên tạo hoặc chọn lớp đang tuyển sinh.
4. Nhân viên ghi danh học viên vào lớp.
5. Hệ thống tự sinh khoản học phí.
6. Nhân viên thu học phí và tạo hóa đơn.
7. Nhân viên tạo lịch học, demo kiểm tra trùng phòng hoặc trùng giáo viên.
8. Giáo viên đăng nhập, xem lớp được phân công.
9. Giáo viên điểm danh buổi học.
10. Giáo viên tạo bài kiểm tra và nhập điểm.
11. Học viên đăng nhập, xem lịch học, điểm, học phí và thông báo.
12. Admin vào báo cáo để tổng hợp doanh thu, chuyên cần và kết quả học tập.

## 21. Các điểm nên nhấn mạnh khi bảo vệ

- Hệ thống có phân quyền theo vai trò.
- Dữ liệu được thiết kế theo nghiệp vụ thật: học viên, phụ huynh, giáo viên, khóa học, lớp, lịch, buổi học, ghi danh, điểm danh, điểm, học phí, hóa đơn.
- Backend có kiểm tra rule nghiệp vụ quan trọng: trùng lịch, trùng ghi danh, vượt sĩ số, vượt số tiền thanh toán, giáo viên truy cập đúng lớp.
- Frontend có đầy đủ luồng demo cho admin, nhân viên, giáo viên và học viên.
- Prisma schema và các sơ đồ UML là cơ sở để trình bày phân tích thiết kế hướng đối tượng.
