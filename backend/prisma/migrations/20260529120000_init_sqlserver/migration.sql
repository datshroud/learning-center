BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(191) NOT NULL,
    [fullName] NVARCHAR(191) NOT NULL,
    [phone] NVARCHAR(191),
    [email] NVARCHAR(191),
    [username] NVARCHAR(191) NOT NULL,
    [password] NVARCHAR(191) NOT NULL,
    [role] NVARCHAR(20) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [User_status_df] DEFAULT 'ACTIVE',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[StudentProfile] (
    [id] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [studentCode] NVARCHAR(191) NOT NULL,
    [dateOfBirth] DATETIME2,
    [address] NVARCHAR(191),
    [school] NVARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [StudentProfile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [StudentProfile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [StudentProfile_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [StudentProfile_studentCode_key] UNIQUE NONCLUSTERED ([studentCode])
);

-- CreateTable
CREATE TABLE [dbo].[TeacherProfile] (
    [id] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [teacherCode] NVARCHAR(191) NOT NULL,
    [specialization] NVARCHAR(191),
    [qualification] NVARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TeacherProfile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TeacherProfile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TeacherProfile_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [TeacherProfile_teacherCode_key] UNIQUE NONCLUSTERED ([teacherCode])
);

-- CreateTable
CREATE TABLE [dbo].[StaffProfile] (
    [id] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [staffCode] NVARCHAR(191) NOT NULL,
    [position] NVARCHAR(191),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [StaffProfile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [StaffProfile_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [StaffProfile_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [StaffProfile_staffCode_key] UNIQUE NONCLUSTERED ([staffCode])
);

-- CreateTable
CREATE TABLE [dbo].[Parent] (
    [id] NVARCHAR(191) NOT NULL,
    [studentId] NVARCHAR(191) NOT NULL,
    [fullName] NVARCHAR(191) NOT NULL,
    [phone] NVARCHAR(191) NOT NULL,
    [email] NVARCHAR(191),
    [relationship] NVARCHAR(191) NOT NULL,
    CONSTRAINT [Parent_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Subject] (
    [id] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(191) NOT NULL,
    [description] NVARCHAR(191),
    CONSTRAINT [Subject_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Subject_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Course] (
    [id] NVARCHAR(191) NOT NULL,
    [subjectId] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(191) NOT NULL,
    [grade] INT NOT NULL,
    [tuitionFee] DECIMAL(12,2) NOT NULL,
    [numberOfSessions] INT NOT NULL,
    [startDate] DATETIME2,
    [endDate] DATETIME2,
    CONSTRAINT [Course_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ClassRoom] (
    [id] NVARCHAR(191) NOT NULL,
    [courseId] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(191) NOT NULL,
    [maxStudents] INT NOT NULL,
    [currentStudents] INT NOT NULL CONSTRAINT [ClassRoom_currentStudents_df] DEFAULT 0,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [ClassRoom_status_df] DEFAULT 'NOT_OPENED',
    [note] NVARCHAR(191),
    CONSTRAINT [ClassRoom_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Room] (
    [id] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(191) NOT NULL,
    [capacity] INT NOT NULL,
    [location] NVARCHAR(191),
    CONSTRAINT [Room_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Room_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[ClassRoomRoom] (
    [classRoomId] NVARCHAR(191) NOT NULL,
    [roomId] NVARCHAR(191) NOT NULL,
    [assignedAt] DATETIME2 NOT NULL CONSTRAINT [ClassRoomRoom_assignedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ClassRoomRoom_pkey] PRIMARY KEY CLUSTERED ([classRoomId],[roomId])
);

-- CreateTable
CREATE TABLE [dbo].[Schedule] (
    [id] NVARCHAR(191) NOT NULL,
    [classRoomId] NVARCHAR(191) NOT NULL,
    [roomId] NVARCHAR(191) NOT NULL,
    [dayOfWeek] INT NOT NULL,
    [startTime] NVARCHAR(191) NOT NULL,
    [endTime] NVARCHAR(191) NOT NULL,
    CONSTRAINT [Schedule_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[StudySession] (
    [id] NVARCHAR(191) NOT NULL,
    [classRoomId] NVARCHAR(191) NOT NULL,
    [sessionDate] DATETIME2 NOT NULL,
    [topic] NVARCHAR(191),
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [StudySession_status_df] DEFAULT 'SCHEDULED',
    CONSTRAINT [StudySession_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Enrollment] (
    [id] NVARCHAR(191) NOT NULL,
    [studentId] NVARCHAR(191) NOT NULL,
    [classRoomId] NVARCHAR(191) NOT NULL,
    [enrollDate] DATETIME2 NOT NULL CONSTRAINT [Enrollment_enrollDate_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [Enrollment_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [Enrollment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Enrollment_studentId_classRoomId_key] UNIQUE NONCLUSTERED ([studentId],[classRoomId])
);

-- CreateTable
CREATE TABLE [dbo].[TeachingAssignment] (
    [id] NVARCHAR(191) NOT NULL,
    [teacherId] NVARCHAR(191) NOT NULL,
    [classRoomId] NVARCHAR(191) NOT NULL,
    [assignedDate] DATETIME2 NOT NULL CONSTRAINT [TeachingAssignment_assignedDate_df] DEFAULT CURRENT_TIMESTAMP,
    [role] NVARCHAR(191),
    CONSTRAINT [TeachingAssignment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TeachingAssignment_teacherId_classRoomId_key] UNIQUE NONCLUSTERED ([teacherId],[classRoomId])
);

-- CreateTable
CREATE TABLE [dbo].[Attendance] (
    [id] NVARCHAR(191) NOT NULL,
    [studySessionId] NVARCHAR(191) NOT NULL,
    [teacherUserId] NVARCHAR(191) NOT NULL,
    [attendanceDate] DATETIME2 NOT NULL CONSTRAINT [Attendance_attendanceDate_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Attendance_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Attendance_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Attendance_studySessionId_key] UNIQUE NONCLUSTERED ([studySessionId])
);

-- CreateTable
CREATE TABLE [dbo].[AttendanceDetail] (
    [id] NVARCHAR(191) NOT NULL,
    [attendanceId] NVARCHAR(191) NOT NULL,
    [studentId] NVARCHAR(191) NOT NULL,
    [status] NVARCHAR(20) NOT NULL,
    [note] NVARCHAR(191),
    CONSTRAINT [AttendanceDetail_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AttendanceDetail_attendanceId_studentId_key] UNIQUE NONCLUSTERED ([attendanceId],[studentId])
);

-- CreateTable
CREATE TABLE [dbo].[Exam] (
    [id] NVARCHAR(191) NOT NULL,
    [classRoomId] NVARCHAR(191) NOT NULL,
    [name] NVARCHAR(191) NOT NULL,
    [examDate] DATETIME2 NOT NULL,
    [maxScore] DECIMAL(5,2) NOT NULL,
    CONSTRAINT [Exam_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Score] (
    [id] NVARCHAR(191) NOT NULL,
    [examId] NVARCHAR(191) NOT NULL,
    [studentId] NVARCHAR(191) NOT NULL,
    [value] DECIMAL(5,2) NOT NULL,
    [comment] NVARCHAR(191),
    CONSTRAINT [Score_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Score_examId_studentId_key] UNIQUE NONCLUSTERED ([examId],[studentId])
);

-- CreateTable
CREATE TABLE [dbo].[TuitionPayment] (
    [id] NVARCHAR(191) NOT NULL,
    [studentId] NVARCHAR(191) NOT NULL,
    [enrollmentId] NVARCHAR(191),
    [amountDue] DECIMAL(12,2) NOT NULL,
    [amountPaid] DECIMAL(12,2) NOT NULL CONSTRAINT [TuitionPayment_amountPaid_df] DEFAULT 0,
    [dueDate] DATETIME2 NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [TuitionPayment_status_df] DEFAULT 'UNPAID',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TuitionPayment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TuitionPayment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [TuitionPayment_enrollmentId_key] UNIQUE NONCLUSTERED ([enrollmentId])
);

-- CreateTable
CREATE TABLE [dbo].[Payment] (
    [id] NVARCHAR(191) NOT NULL,
    [tuitionPaymentId] NVARCHAR(191) NOT NULL,
    [paymentDate] DATETIME2 NOT NULL CONSTRAINT [Payment_paymentDate_df] DEFAULT CURRENT_TIMESTAMP,
    [amount] DECIMAL(12,2) NOT NULL,
    [method] NVARCHAR(20) NOT NULL,
    [note] NVARCHAR(191),
    CONSTRAINT [Payment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Invoice] (
    [id] NVARCHAR(191) NOT NULL,
    [tuitionPaymentId] NVARCHAR(191) NOT NULL,
    [paymentId] NVARCHAR(191) NOT NULL,
    [invoiceDate] DATETIME2 NOT NULL CONSTRAINT [Invoice_invoiceDate_df] DEFAULT CURRENT_TIMESTAMP,
    [totalAmount] DECIMAL(12,2) NOT NULL,
    CONSTRAINT [Invoice_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Invoice_paymentId_key] UNIQUE NONCLUSTERED ([paymentId])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] NVARCHAR(191) NOT NULL,
    [userId] NVARCHAR(191) NOT NULL,
    [title] NVARCHAR(191) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [isRead] BIT NOT NULL CONSTRAINT [Notification_isRead_df] DEFAULT 0,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ClassRoomRoom_roomId_idx] ON [dbo].[ClassRoomRoom]([roomId]);

-- AddForeignKey
ALTER TABLE [dbo].[StudentProfile] ADD CONSTRAINT [StudentProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TeacherProfile] ADD CONSTRAINT [TeacherProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[StaffProfile] ADD CONSTRAINT [StaffProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Parent] ADD CONSTRAINT [Parent_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[StudentProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Course] ADD CONSTRAINT [Course_subjectId_fkey] FOREIGN KEY ([subjectId]) REFERENCES [dbo].[Subject]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ClassRoom] ADD CONSTRAINT [ClassRoom_courseId_fkey] FOREIGN KEY ([courseId]) REFERENCES [dbo].[Course]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ClassRoomRoom] ADD CONSTRAINT [ClassRoomRoom_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ClassRoomRoom] ADD CONSTRAINT [ClassRoomRoom_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Schedule] ADD CONSTRAINT [Schedule_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Schedule] ADD CONSTRAINT [Schedule_roomId_fkey] FOREIGN KEY ([roomId]) REFERENCES [dbo].[Room]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[StudySession] ADD CONSTRAINT [StudySession_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[StudentProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Enrollment] ADD CONSTRAINT [Enrollment_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TeachingAssignment] ADD CONSTRAINT [TeachingAssignment_teacherId_fkey] FOREIGN KEY ([teacherId]) REFERENCES [dbo].[TeacherProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TeachingAssignment] ADD CONSTRAINT [TeachingAssignment_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Attendance] ADD CONSTRAINT [Attendance_studySessionId_fkey] FOREIGN KEY ([studySessionId]) REFERENCES [dbo].[StudySession]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Attendance] ADD CONSTRAINT [Attendance_teacherUserId_fkey] FOREIGN KEY ([teacherUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceDetail] ADD CONSTRAINT [AttendanceDetail_attendanceId_fkey] FOREIGN KEY ([attendanceId]) REFERENCES [dbo].[Attendance]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AttendanceDetail] ADD CONSTRAINT [AttendanceDetail_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[StudentProfile]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Exam] ADD CONSTRAINT [Exam_classRoomId_fkey] FOREIGN KEY ([classRoomId]) REFERENCES [dbo].[ClassRoom]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_examId_fkey] FOREIGN KEY ([examId]) REFERENCES [dbo].[Exam]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[StudentProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TuitionPayment] ADD CONSTRAINT [TuitionPayment_studentId_fkey] FOREIGN KEY ([studentId]) REFERENCES [dbo].[StudentProfile]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TuitionPayment] ADD CONSTRAINT [TuitionPayment_enrollmentId_fkey] FOREIGN KEY ([enrollmentId]) REFERENCES [dbo].[Enrollment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Payment] ADD CONSTRAINT [Payment_tuitionPaymentId_fkey] FOREIGN KEY ([tuitionPaymentId]) REFERENCES [dbo].[TuitionPayment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [Invoice_tuitionPaymentId_fkey] FOREIGN KEY ([tuitionPaymentId]) REFERENCES [dbo].[TuitionPayment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Invoice] ADD CONSTRAINT [Invoice_paymentId_fkey] FOREIGN KEY ([paymentId]) REFERENCES [dbo].[Payment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
