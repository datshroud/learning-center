# Hệ thống quản lý trung tâm học thêm

Project full-stack phục vụ đề tài phân tích và thiết kế hướng đối tượng hệ thống quản lý trung tâm học thêm.

## Công nghệ

- Backend: Node.js, Express, TypeScript, Prisma, JWT, Zod.
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router.
- Database: SQL Server local.
- Tài liệu/UML: Markdown và PlantUML trong `docs/`, `diagrams/`.

## Cấu trúc

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    modules/
    middleware/
    lib/
frontend/
  src/
    components/
    contexts/
    pages/
    types/
docs/
diagrams/
```

## Yêu cầu môi trường

- Node.js 20 trở lên. Máy hiện đã có Node 24.
- SQL Server local hoặc Docker Desktop để chạy SQL Server container.
- Một database rỗng tên `learning_center`.

Trong workspace hiện tại, SQL Server có thể chạy bằng Docker container local:

```powershell
docker start learning-center-sqlserver
```

Hoặc dùng script:

```powershell
npm run db:start
npm run db:status
```

Thông tin kết nối đang dùng trong `backend/.env`:

```env
DATABASE_URL="sqlserver://localhost:11433;database=learning_center;user=sa;password=LearningCenter123_;encrypt=true;trustServerCertificate=true"
```

Thông tin mở bằng SSMS:

- Server name: `localhost,11433`
- Authentication: `SQL Server Authentication`
- Login: `sa`
- Password: `LearningCenter123_`
- Database: `learning_center`

Nếu muốn dừng DB:

```powershell
docker stop learning-center-sqlserver
```

Hoặc:

```powershell
npm run db:stop
```

Tạo database bằng SSMS nếu không dùng script Docker:

```sql
CREATE DATABASE learning_center;
```

## Cài đặt

```powershell
npm install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Sửa `backend/.env` cho đúng tài khoản SQL Server local:

```env
DATABASE_URL="sqlserver://localhost:11433;database=learning_center;user=sa;password=LearningCenter123_;encrypt=true;trustServerCertificate=true"
JWT_SECRET="change-this-secret"
JWT_EXPIRES_IN="1d"
PORT=4000
FRONTEND_ORIGIN="http://localhost:5173"
```

Frontend dùng `frontend/.env` để biết backend API:

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

## Khởi tạo database

```powershell
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

Tài khoản mẫu sau seed, mật khẩu đều là `123456`:

- `admin`
- `staff01`
- `teacher01`
- `student01` (có sẵn lịch học, điểm, học phí thanh toán một phần và phiếu thu mẫu)

## Chạy project

Mở 2 terminal:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Địa chỉ:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

## Kiểm tra

```powershell
npm run build
npm run test
```

Nếu chưa có SQL Server local hoặc chưa migrate database, backend vẫn build được nhưng các API truy cập dữ liệu sẽ lỗi kết nối database khi chạy runtime.

Backend build kiểm tra cả source API và file seed demo. Backend test hiện bao phủ các rule quan trọng cho bảo vệ: đăng nhập tài khoản khóa, phân quyền giáo viên/học viên, kiểm tra trùng lịch, không thu vượt học phí và cập nhật sĩ số khi đổi trạng thái ghi danh.

## Chức năng chính

- Đăng nhập JWT theo role `ADMIN`, `STAFF`, `TEACHER`, `STUDENT`.
- Quản trị viên: tạo tài khoản theo vai trò, khóa/mở tài khoản, quản lý giáo viên, khóa học, lớp học và báo cáo.
- Nhân viên: quản lý lead tư vấn, học viên, lớp học, phòng học, lịch học, buổi học, ghi danh, trạng thái ghi danh và thu học phí.
- Giáo viên: xem lớp phân công, điểm danh, tạo bài kiểm tra, nhập điểm và sửa điểm trong lớp được phân công.
- Học viên: xem khóa học, lịch học, điểm, học phí, phiếu thu cá nhân và thông báo.
- Báo cáo: dashboard, phân tích chi tiết, lọc dữ liệu và xuất CSV.

## Luồng demo nhanh

1. Admin đăng nhập, tạo tài khoản và kiểm tra phân quyền/trạng thái tài khoản.
2. Staff vào `Quản lý Leads`, gửi mail/hẹn test/cập nhật ghi chú tư vấn.
3. Staff tạo học viên, ghi danh vào lớp và kiểm tra khoản học phí tự sinh.
4. Staff tạo phòng, lịch học, buổi học và demo rule trùng phòng/trùng giáo viên.
5. Staff thu học phí, mở phiếu thu vừa tạo.
6. Teacher điểm danh, tạo bài kiểm tra, nhập điểm và sửa điểm.
7. Student xem khóa học, lịch học, điểm, học phí, phiếu thu và thông báo.
8. Admin/Staff xem báo cáo, lọc dữ liệu và xuất CSV.

## Tài liệu

- Báo cáo OOAD: `docs/bao-cao-phan-tich-thiet-ke.md`
- Hướng dẫn demo: `docs/huong-dan-demo.md`
- Hướng dẫn sử dụng từng tính năng: `docs/huong-dan-su-dung-tung-tinh-nang.md`
- Tài liệu API backend: `docs/api-endpoints.md`
- Checklist nghiệm thu đồ án: `docs/checklist-nghiem-thu-do-an.md`
- Ma trận chức năng nghiệm thu: `docs/ma-tran-chuc-nang-nghiem-thu.md`
- Thiết kế vận hành một cơ sở và hướng mở rộng nhiều cơ sở: `docs/thiet-ke-van-hanh-mot-co-so-va-nhieu-co-so.md`
- UML PlantUML: `diagrams/*.puml`

Render PlantUML nếu đã có `plantuml.jar`:

```powershell
java -jar plantuml.jar diagrams/*.puml
```
# learning-center
