import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  AttendanceStatus,
  ClassStatus,
  EnrollmentStatus,
  PaymentMethod,
  Role,
  SessionStatus,
  TuitionStatus
} from '../src/lib/enums.js';

const prisma = new PrismaClient();
const money = (value: string) => new Prisma.Decimal(value);
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function resetDatabase() {
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.tuitionPayment.deleteMany();
  await prisma.score.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendanceDetail.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.classRoomRoom.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.classRoom.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.room.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(input: {
  fullName: string;
  username: string;
  role: Role;
  phone?: string;
  email?: string;
}) {
  const password = await bcrypt.hash('123456', 10);
  return prisma.user.create({
    data: {
      ...input,
      password
    }
  });
}

async function main() {
  await resetDatabase();

  const admin = await createUser({
    fullName: 'Quản trị viên',
    username: 'admin',
    role: Role.ADMIN,
    phone: '0900000001',
    email: 'admin@trungtam.test'
  });

  const staffUsers = await Promise.all([
    createUser({
      fullName: 'Nguyễn Thị Mai',
      username: 'staff01',
      role: Role.STAFF,
      phone: '0900000002',
      email: 'mai@trungtam.test'
    }),
    createUser({
      fullName: 'Trần Quốc Huy',
      username: 'staff02',
      role: Role.STAFF,
      phone: '0900000003',
      email: 'huy@trungtam.test'
    })
  ]);

  const staffProfiles = await Promise.all(
    staffUsers.map((user, index) =>
      prisma.staffProfile.create({
        data: {
          userId: user.id,
          staffCode: `NV00${index + 1}`,
          position: index === 0 ? 'Tư vấn tuyển sinh' : 'Kế toán học phí'
        }
      })
    )
  );

  const teacherUsers = await Promise.all([
    createUser({
      fullName: 'Nguyễn Văn An',
      username: 'teacher01',
      role: Role.TEACHER,
      phone: '0900000004',
      email: 'an@trungtam.test'
    }),
    createUser({
      fullName: 'Lê Thị Bình',
      username: 'teacher02',
      role: Role.TEACHER,
      phone: '0900000005',
      email: 'binh@trungtam.test'
    }),
    createUser({
      fullName: 'Phạm Minh Châu',
      username: 'teacher03',
      role: Role.TEACHER,
      phone: '0900000006',
      email: 'chau@trungtam.test'
    })
  ]);

  const teacherProfiles = await Promise.all([
    prisma.teacherProfile.create({
      data: {
        userId: teacherUsers[0].id,
        teacherCode: 'GV001',
        specialization: 'Toán THPT',
        qualification: 'Thạc sĩ Toán học'
      }
    }),
    prisma.teacherProfile.create({
      data: {
        userId: teacherUsers[1].id,
        teacherCode: 'GV002',
        specialization: 'Vật lý THPT',
        qualification: 'Cử nhân Sư phạm Vật lý'
      }
    }),
    prisma.teacherProfile.create({
      data: {
        userId: teacherUsers[2].id,
        teacherCode: 'GV003',
        specialization: 'Tiếng Anh',
        qualification: 'IELTS 8.0'
      }
    })
  ]);

  const studentNames = [
    'Trần Văn Bảo',
    'Lê Minh Cường',
    'Hoàng Thu Dung',
    'Phạm Gia Hân',
    'Đỗ Nhật Khang',
    'Vũ Ngọc Linh'
  ];

  const studentProfiles = [];
  for (let index = 0; index < studentNames.length; index += 1) {
    const birthYear = 2007 + index;
    const user = await createUser({
      fullName: studentNames[index],
      username: `student0${index + 1}`,
      role: Role.STUDENT,
      phone: `091000000${index + 1}`,
      email: `student0${index + 1}@trungtam.test`
    });
    const profile = await prisma.studentProfile.create({
      data: {
          userId: user.id,
          studentCode: `HV00${index + 1}`,
        dateOfBirth: date(`${birthYear}-09-0${(index % 6) + 1}`),
        address: `${index + 10} Nguyễn Trãi, Quận ${index + 1}`,
        school: index < 4 ? 'THPT Nguyễn Huệ' : 'THCS Lê Quý Đôn',
        parents: {
          create: {
            fullName: `Phụ huynh ${studentNames[index]}`,
            phone: `098000000${index + 1}`,
            relationship: index % 2 === 0 ? 'Cha' : 'Mẹ'
          }
        }
      }
    });
    studentProfiles.push(profile);
  }

  const [math, physics, english] = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Toán',
        description: 'Các khóa học toán từ cơ bản đến luyện thi.'
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Vật lý',
        description: 'Ôn tập, củng cố và luyện đề vật lý.'
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Tiếng Anh',
        description: 'Ngữ pháp, giao tiếp và luyện thi chứng chỉ.'
      }
    })
  ]);

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        subjectId: math.id,
        name: 'Toán lớp 10',
        grade: 10,
        tuitionFee: money('2500000'),
        numberOfSessions: 24,
        startDate: date('2026-06-01'),
        endDate: date('2026-08-31')
      }
    }),
    prisma.course.create({
      data: {
        subjectId: math.id,
        name: 'Luyện thi Toán 12',
        grade: 12,
        tuitionFee: money('3200000'),
        numberOfSessions: 30,
        startDate: date('2026-06-10'),
        endDate: date('2026-09-20')
      }
    }),
    prisma.course.create({
      data: {
        subjectId: physics.id,
        name: 'Vật lý lớp 11',
        grade: 11,
        tuitionFee: money('2600000'),
        numberOfSessions: 24,
        startDate: date('2026-06-05'),
        endDate: date('2026-08-30')
      }
    }),
    prisma.course.create({
      data: {
        subjectId: english.id,
        name: 'Tiếng Anh lớp 8',
        grade: 8,
        tuitionFee: money('2200000'),
        numberOfSessions: 20,
        startDate: date('2026-06-03'),
        endDate: date('2026-08-10')
      }
    })
  ]);

  const rooms = await Promise.all([
    prisma.room.create({ data: { name: 'Phòng A101', capacity: 25, location: 'Tầng 1' } }),
    prisma.room.create({ data: { name: 'Phòng A102', capacity: 20, location: 'Tầng 1' } }),
    prisma.room.create({ data: { name: 'Phòng B201', capacity: 30, location: 'Tầng 2' } })
  ]);

  const classRooms = await Promise.all([
    prisma.classRoom.create({
      data: {
        courseId: courses[0].id,
        name: 'Toán 10A - Ca tối 2,4,6',
        maxStudents: 20,
        status: ClassStatus.ENROLLING
      }
    }),
    prisma.classRoom.create({
      data: {
        courseId: courses[0].id,
        name: 'Toán 10B - Ca chiều 3,5',
        maxStudents: 18,
        status: ClassStatus.ACTIVE
      }
    }),
    prisma.classRoom.create({
      data: {
        courseId: courses[2].id,
        name: 'Vật lý 11A - Ca tối 3,5',
        maxStudents: 22,
        status: ClassStatus.ACTIVE
      }
    }),
    prisma.classRoom.create({
      data: {
        courseId: courses[3].id,
        name: 'Tiếng Anh 8A - Cuối tuần',
        maxStudents: 16,
        status: ClassStatus.ENROLLING
      }
    }),
    prisma.classRoom.create({
      data: {
        courseId: courses[1].id,
        name: 'Luyện thi Toán 12 - Nâng cao',
        maxStudents: 24,
        status: ClassStatus.NOT_OPENED
      }
    })
  ]);

  await prisma.classRoomRoom.createMany({
    data: [
      { classRoomId: classRooms[0].id, roomId: rooms[0].id },
      { classRoomId: classRooms[0].id, roomId: rooms[1].id },
      { classRoomId: classRooms[1].id, roomId: rooms[1].id },
      { classRoomId: classRooms[2].id, roomId: rooms[2].id },
      { classRoomId: classRooms[3].id, roomId: rooms[1].id },
      { classRoomId: classRooms[3].id, roomId: rooms[2].id },
      { classRoomId: classRooms[4].id, roomId: rooms[0].id },
      { classRoomId: classRooms[4].id, roomId: rooms[2].id }
    ]
  });

  await Promise.all([
    prisma.teachingAssignment.create({
      data: {
        teacherId: teacherProfiles[0].id,
        classRoomId: classRooms[0].id,
        role: 'Giáo viên chính'
      }
    }),
    prisma.teachingAssignment.create({
      data: {
        teacherId: teacherProfiles[0].id,
        classRoomId: classRooms[1].id,
        role: 'Giáo viên chính'
      }
    }),
    prisma.teachingAssignment.create({
      data: {
        teacherId: teacherProfiles[1].id,
        classRoomId: classRooms[2].id,
        role: 'Giáo viên chính'
      }
    }),
    prisma.teachingAssignment.create({
      data: {
        teacherId: teacherProfiles[2].id,
        classRoomId: classRooms[3].id,
        role: 'Giáo viên chính'
      }
    })
  ]);

  await Promise.all([
    prisma.schedule.create({ data: { classRoomId: classRooms[0].id, roomId: rooms[0].id, dayOfWeek: 1, startTime: '18:00', endTime: '20:00' } }),
    prisma.schedule.create({ data: { classRoomId: classRooms[0].id, roomId: rooms[0].id, dayOfWeek: 3, startTime: '18:00', endTime: '20:00' } }),
    prisma.schedule.create({ data: { classRoomId: classRooms[0].id, roomId: rooms[0].id, dayOfWeek: 5, startTime: '18:00', endTime: '20:00' } }),
    prisma.schedule.create({ data: { classRoomId: classRooms[1].id, roomId: rooms[1].id, dayOfWeek: 2, startTime: '15:00', endTime: '17:00' } }),
    prisma.schedule.create({ data: { classRoomId: classRooms[1].id, roomId: rooms[1].id, dayOfWeek: 4, startTime: '15:00', endTime: '17:00' } }),
    prisma.schedule.create({ data: { classRoomId: classRooms[2].id, roomId: rooms[2].id, dayOfWeek: 2, startTime: '18:00', endTime: '20:00' } }),
    prisma.schedule.create({ data: { classRoomId: classRooms[2].id, roomId: rooms[2].id, dayOfWeek: 4, startTime: '18:00', endTime: '20:00' } }),
    prisma.schedule.create({ data: { classRoomId: classRooms[3].id, roomId: rooms[1].id, dayOfWeek: 6, startTime: '08:00', endTime: '10:00' } })
  ]);

  const sessions = await Promise.all([
    prisma.studySession.create({ data: { classRoomId: classRooms[0].id, sessionDate: date('2026-06-01'), topic: 'Ôn tập hàm số bậc nhất', status: SessionStatus.COMPLETED } }),
    prisma.studySession.create({ data: { classRoomId: classRooms[0].id, sessionDate: date('2026-06-03'), topic: 'Hàm số bậc hai', status: SessionStatus.SCHEDULED } }),
    prisma.studySession.create({ data: { classRoomId: classRooms[1].id, sessionDate: date('2026-06-02'), topic: 'Phương trình lượng giác', status: SessionStatus.COMPLETED } }),
    prisma.studySession.create({ data: { classRoomId: classRooms[2].id, sessionDate: date('2026-06-02'), topic: 'Điện tích điện trường', status: SessionStatus.COMPLETED } }),
    prisma.studySession.create({ data: { classRoomId: classRooms[3].id, sessionDate: date('2026-06-06'), topic: 'Present perfect', status: SessionStatus.SCHEDULED } })
  ]);

  const enrollmentInputs = [
    [studentProfiles[0], classRooms[0], TuitionStatus.PARTIAL, '1000000'],
    [studentProfiles[1], classRooms[0], TuitionStatus.UNPAID, '0'],
    [studentProfiles[2], classRooms[0], TuitionStatus.PAID, '2500000'],
    [studentProfiles[3], classRooms[1], TuitionStatus.OVERDUE, '0'],
    [studentProfiles[4], classRooms[2], TuitionStatus.PAID, '2600000'],
    [studentProfiles[5], classRooms[3], TuitionStatus.UNPAID, '0']
  ] as const;

  for (const [student, classRoom, status, paid] of enrollmentInputs) {
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classRoomId: classRoom.id,
        status: EnrollmentStatus.ACTIVE
      }
    });
    const course = courses.find((item) => item.id === classRoom.courseId);
    if (!course) {
      throw new Error('Course not found for seed class');
    }
    const tuition = await prisma.tuitionPayment.create({
      data: {
        studentId: student.id,
        enrollmentId: enrollment.id,
        amountDue: course.tuitionFee,
        amountPaid: money(paid),
        dueDate: status === TuitionStatus.OVERDUE ? date('2026-05-20') : date('2026-06-20'),
        status
      }
    });
    if (status === TuitionStatus.PAID || status === TuitionStatus.PARTIAL) {
      const payment = await prisma.payment.create({
        data: {
          tuitionPaymentId: tuition.id,
          amount: money(paid),
          method: status === TuitionStatus.PAID ? PaymentMethod.BANK_TRANSFER : PaymentMethod.CASH,
          note: 'Dữ liệu mẫu'
        }
      });
      await prisma.invoice.create({
        data: {
          tuitionPaymentId: tuition.id,
          paymentId: payment.id,
          totalAmount: money(paid)
        }
      });
    }
  }

  for (const classRoom of classRooms) {
    const currentStudents = await prisma.enrollment.count({
      where: {
        classRoomId: classRoom.id,
        status: EnrollmentStatus.ACTIVE
      }
    });
    await prisma.classRoom.update({
      where: { id: classRoom.id },
      data: { currentStudents }
    });
  }

  const exam = await prisma.exam.create({
    data: {
      classRoomId: classRooms[0].id,
      name: 'Kiểm tra 15 phút chương 1',
      examDate: date('2026-06-15'),
      maxScore: money('10')
    }
  });

  await Promise.all([
    prisma.score.create({ data: { examId: exam.id, studentId: studentProfiles[0].id, value: money('8.25'), comment: 'Nắm bài tốt' } }),
    prisma.score.create({ data: { examId: exam.id, studentId: studentProfiles[1].id, value: money('7.50'), comment: 'Cần cẩn thận hơn' } }),
    prisma.score.create({ data: { examId: exam.id, studentId: studentProfiles[2].id, value: money('9.00'), comment: 'Bài làm tốt' } })
  ]);

  const attendance = await prisma.attendance.create({
    data: {
      studySessionId: sessions[0].id,
      teacherUserId: teacherUsers[0].id,
      details: {
        create: [
          { studentId: studentProfiles[0].id, status: AttendanceStatus.PRESENT },
          { studentId: studentProfiles[1].id, status: AttendanceStatus.LATE, note: 'Đi muộn 10 phút' },
          { studentId: studentProfiles[2].id, status: AttendanceStatus.ABSENT, note: 'Phụ huynh xin phép' }
        ]
      }
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'Báo cáo doanh thu đã sẵn sàng',
        content: 'Có thể xem báo cáo doanh thu tháng trong màn báo cáo.'
      },
      {
        userId: staffUsers[0].id,
        title: 'Có lớp mới đang tuyển sinh',
        content: 'Lớp Toán 10A vẫn còn chỗ, có thể tiếp tục ghi danh.'
      },
      {
        userId: teacherUsers[0].id,
        title: 'Đã lưu điểm danh',
        content: `Phiếu điểm danh ${attendance.id} đã được tạo.`
      },
      {
        userId: studentProfiles[0].userId,
        title: 'Nhắc học phí',
        content: 'Bạn còn một phần học phí cần thanh toán.'
      }
    ]
  });

  console.log('Seed completed.');
  console.log('Demo accounts: admin/staff01/teacher01/student01 with password 123456');
  console.log(`Created staff profiles: ${staffProfiles.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
