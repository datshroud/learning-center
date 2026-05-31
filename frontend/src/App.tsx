import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { LoadingState } from './components/LoadingState';
import { useAuth } from './contexts/AuthContext';
import {
  AttendancePage,
  MyClassesPage,
  MyCoursesPage,
  MySchedulePage,
  MyScoresPage,
  MyTuitionPage,
  NotificationsPage,
  ProfilePage,
  ScoresPage
} from './pages/AcademicPages';
import { AnalyticsDetailPage } from './pages/AnalyticsDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvoicePage } from './pages/InvoicePage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { LoginPage } from './pages/LoginPage';
import {
  ClassesPage,
  CoursesPage,
  EnrollmentsPage,
  ReportsPage,
  SchedulesPage,
  StaffPage,
  StudentCreatePage,
  StudentsPage,
  TeachersPage,
  TuitionPage,
  UsersPage
} from './pages/ManagementPages';
import type { Role } from './types/domain';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingState />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/:metric"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <AnalyticsDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <LeadDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <StaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/add"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <StudentCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <TeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <CoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <ClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enrollments"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <EnrollmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <SchedulesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tuition"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <TuitionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF', 'STUDENT']}>
            <InvoicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:section"
        element={
          <ProtectedRoute roles={['ADMIN', 'STAFF']}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-classes"
        element={
          <ProtectedRoute roles={['TEACHER']}>
            <MyClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-classes/:id/students"
        element={
          <ProtectedRoute roles={['TEACHER']}>
            <MyClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute roles={['TEACHER']}>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scores"
        element={
          <ProtectedRoute roles={['TEACHER']}>
            <ScoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute roles={['STUDENT']}>
            <MyCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-schedule"
        element={
          <ProtectedRoute roles={['STUDENT']}>
            <MySchedulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-scores"
        element={
          <ProtectedRoute roles={['STUDENT']}>
            <MyScoresPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tuition"
        element={
          <ProtectedRoute roles={['STUDENT']}>
            <MyTuitionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
