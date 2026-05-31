import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Coins,
  FileCheck,
  FileText,
  GraduationCap,
  Home,
  Languages,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  PanelLeft,
  Plus,
  RefreshCcw,
  Search,
  Receipt,
  School,
  Sun,
  UserCog,
  UserRoundCheck,
  Users
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import type { Role } from '../types/domain';
import { StatusBadge } from './StatusBadge';

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  roles: Role[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Nhiệm vụ chính',
    items: [
      { label: 'Thống kê & báo cáo', href: '/dashboard', icon: <Home className="h-4 w-4" />, roles: ['ADMIN', 'STAFF', 'TEACHER', 'STUDENT'] },
      { label: 'Quản lý Leads', href: '/leads', icon: <UserRoundCheck className="h-4 w-4" />, roles: ['ADMIN', 'STAFF'] },
      { label: 'Theo dõi tư vấn', href: '/leads', icon: <RefreshCcw className="h-4 w-4" />, roles: ['ADMIN', 'STAFF'] },
      { label: 'Nhân viên', href: '/staff', icon: <Users className="h-4 w-4" />, roles: ['ADMIN'] },
      { label: 'Tài khoản', href: '/users', icon: <UserCog className="h-4 w-4" />, roles: ['ADMIN'] }
    ]
  },
  {
    title: 'Khách hàng',
    items: [
      { label: 'Đăng ký học', href: '/enrollments', icon: <FileCheck className="h-4 w-4" />, roles: ['STAFF', 'ADMIN'] },
      { label: 'Xếp lớp', href: '/classes', icon: <ClipboardCheck className="h-4 w-4" />, roles: ['STAFF', 'ADMIN'] },
      { label: 'Danh sách học viên', href: '/students', icon: <GraduationCap className="h-4 w-4" />, roles: ['STAFF', 'ADMIN'] },
      { label: 'Giáo viên', href: '/teachers', icon: <Users className="h-4 w-4" />, roles: ['ADMIN', 'STAFF'] }
    ]
  },
  {
    title: 'Học tập',
    items: [
      { label: 'Lớp học', href: '/classes', icon: <School className="h-4 w-4" />, roles: ['ADMIN', 'STAFF'] },
      { label: 'Khóa học', href: '/courses', icon: <BookOpen className="h-4 w-4" />, roles: ['ADMIN', 'STAFF'] },
      { label: 'Lịch học', href: '/schedules', icon: <CalendarDays className="h-4 w-4" />, roles: ['STAFF', 'ADMIN'] },
      { label: 'Lớp của tôi', href: '/my-classes', icon: <School className="h-4 w-4" />, roles: ['TEACHER'] },
      { label: 'Điểm danh', href: '/attendance', icon: <ClipboardCheck className="h-4 w-4" />, roles: ['TEACHER'] },
      { label: 'Nhập điểm', href: '/scores', icon: <BookOpen className="h-4 w-4" />, roles: ['TEACHER'] },
      { label: 'Khóa học của tôi', href: '/my-courses', icon: <BookOpen className="h-4 w-4" />, roles: ['STUDENT'] },
      { label: 'Lịch của tôi', href: '/my-schedule', icon: <CalendarDays className="h-4 w-4" />, roles: ['STUDENT'] },
      { label: 'Điểm của tôi', href: '/my-scores', icon: <BookOpen className="h-4 w-4" />, roles: ['STUDENT'] }
    ]
  },
  {
    title: 'Tài chính',
    items: [
      { label: 'Thanh toán', href: '/tuition', icon: <Coins className="h-4 w-4" />, roles: ['STAFF', 'ADMIN'] },
      { label: 'Phiếu thu', href: '/tuition', icon: <Receipt className="h-4 w-4" />, roles: ['STAFF', 'ADMIN'] },
      { label: 'Học phí của tôi', href: '/my-tuition', icon: <Receipt className="h-4 w-4" />, roles: ['STUDENT'] }
    ]
  },
  {
    title: 'Hỗ trợ',
    items: [
      { label: 'Thông báo', href: '/notifications', icon: <Bell className="h-4 w-4" />, roles: ['STUDENT', 'TEACHER', 'STAFF', 'ADMIN'] },
      { label: 'Tài liệu', href: '/my-courses', icon: <FileText className="h-4 w-4" />, roles: ['STUDENT'] },
      { label: 'Báo cáo', href: '/reports', icon: <BarChart3 className="h-4 w-4" />, roles: ['ADMIN', 'STAFF'] }
    ]
  }
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, language, toggleTheme, toggleLanguage, t } = usePreferences();
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => user && item.roles.includes(user.role))
    }))
    .filter((group) => group.items.length > 0);
  const visibleItems = visibleGroups.flatMap((group) => group.items);
  const quickCreateHref =
    user?.role === 'ADMIN' || user?.role === 'STAFF'
      ? '/students/add'
      : user?.role === 'TEACHER'
        ? '/scores'
        : '/my-schedule';
  const quickCreateLabel =
    user?.role === 'ADMIN' || user?.role === 'STAFF'
      ? 'Thêm học viên'
      : user?.role === 'TEACHER'
        ? 'Nhập điểm'
        : 'Xem lịch học';
  const searchResults = useMemo(() => {
    const keyword = quickSearch.trim().toLowerCase();
    if (!keyword) {
      return visibleItems.slice(0, 6);
    }

    return visibleItems
      .filter((item) => t(item.label).toLowerCase().includes(keyword) || item.href.toLowerCase().includes(keyword))
      .slice(0, 6);
  }, [quickSearch, t, visibleItems]);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">
            LC
          </div>
          <div>
            <h1 className="text-base font-black text-slate-950">CENTER<span className="text-sky-700">.LMS</span></h1>
            <p className="text-xs text-slate-500">Learning Management System</p>
          </div>
        </div>
        <nav className="space-y-5 p-4">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-2 text-xs font-semibold text-slate-400">{t(group.title)}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={`${group.title}-${item.label}-${item.href}`}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
                        isActive ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{t(item.label)}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 overflow-hidden border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <NavLink
                className="hidden rounded-md border border-slate-200 p-2 text-slate-500 lg:inline-flex"
                title={t('Thống kê & báo cáo')}
                to="/dashboard"
              >
                <PanelLeft className="h-4 w-4" />
              </NavLink>
              <div>
                <p className="text-xs text-slate-500">{t('Xin chào')}</p>
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-bold text-slate-950">{user?.fullName ? t(user.fullName) : ''}</h2>
                  <StatusBadge value={user?.role} />
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <div className="hidden rounded-md bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700 xl:block">
                {t('Hướng dẫn deal khách hàng')}
              </div>
              <div className="relative">
                <button
                  className="rounded-md border border-slate-200 p-2 text-slate-600"
                  title={t('Nhấn enter để tìm kiếm')}
                  type="button"
                  onClick={() => setQuickSearchOpen((value) => !value)}
                >
                  <Search className="h-4 w-4" />
                </button>
                {quickSearchOpen ? (
                  <div className="absolute right-0 top-12 z-50 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
                    <input
                      autoFocus
                      className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-500"
                      placeholder={t('Nhập tên, lớp, mã, trạng thái...')}
                      value={quickSearch}
                      onChange={(event) => setQuickSearch(event.target.value)}
                    />
                    <div className="mt-2 grid gap-1">
                      {searchResults.length ? (
                        searchResults.map((item) => (
                          <NavLink
                            key={`${item.href}-${item.label}-quick-search`}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                            to={item.href}
                            onClick={() => setQuickSearchOpen(false)}
                          >
                            {item.icon}
                            {t(item.label)}
                          </NavLink>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-slate-500">{t('Chưa có dữ liệu để hiển thị.')}</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <NavLink to="/notifications" title={t('Thông báo')} className="rounded-md border border-slate-200 p-2 text-slate-600">
                <Bell className="h-4 w-4" />
              </NavLink>
              <NavLink to="/notifications" title={t('Thông báo')} className="rounded-md border border-slate-200 p-2 text-slate-600">
                <MessageCircle className="h-4 w-4" />
              </NavLink>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-sm font-semibold text-slate-600"
                onClick={toggleTheme}
                title={theme === 'dark' ? t('Chế độ sáng') : t('Chế độ tối')}
                type="button"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden sm:inline">{theme === 'dark' ? t('Chế độ sáng') : t('Chế độ tối')}</span>
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-2 text-sm font-semibold text-slate-600"
                onClick={toggleLanguage}
                title={t('Đổi ngôn ngữ')}
                type="button"
              >
                <Languages className="h-4 w-4" />
                <span>{language.toUpperCase()}</span>
              </button>
              <NavLink className="rounded-md bg-sky-600 p-2 text-white" title={t(quickCreateLabel)} to={quickCreateHref}>
                <Plus className="h-4 w-4" />
              </NavLink>
              <NavLink to="/profile" className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 md:inline-flex">
                <Mail className="h-4 w-4" />
                {t('Hồ sơ')}
              </NavLink>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('Đăng xuất')}</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {visibleItems.map((item) => (
              <NavLink
                key={`${item.href}-${item.label}`}
                to={item.href}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`
                }
              >
                {t(item.label)}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
