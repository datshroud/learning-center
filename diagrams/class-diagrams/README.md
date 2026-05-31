# Class diagrams - Learning Center LMS

Thu muc nay chua cac class diagram PlantUML duoc ve lai theo app hien tai va noi dung nghiep vu trong file `PTTKHDT.docx`.

Nguon doi chieu:

- Prisma schema: `backend/prisma/schema.prisma`
- API module: `backend/src/modules/*`
- Man hinh React: `frontend/src/pages/*`
- Bao cao Word: cac phan quan ly hoc vien, giao vien, lop hoc, lich hoc, phong hoc, diem danh, hoc phi va thong ke.

Danh sach so do:

- `00-overview-domain.puml`: so do lop tong quan toan bo domain.
- `01-user-role-profile.puml`: nguoi dung, phan quyen va ho so theo vai tro.
- `02-academic-classroom-schedule-room.puml`: mon hoc, khoa hoc, lop hoc, phong hoc, lich hoc va phan cong giao vien.
- `03-enrollment-attendance-score.puml`: ghi danh, diem danh, bai kiem tra va diem so.
- `04-tuition-notification-report.puml`: hoc phi, thanh toan, hoa don, thong bao va bao cao.
- `05-backend-mvc-services.puml`: cau truc backend Express theo controller-service-repository.
- `06-word-process-to-domain-map.puml`: anh xa cac tien trinh trong bao cao Word sang cac lop/service trong app.

Render neu may da co `plantuml.jar`:

```powershell
java -jar plantuml.jar diagrams/class-diagrams/*.puml
```

