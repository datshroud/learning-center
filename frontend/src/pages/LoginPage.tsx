import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Languages, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { getErrorMessage } from '../lib/api';

export function LoginPage() {
  const { login, user } = useAuth();
  const { theme, language, toggleTheme, toggleLanguage, t } = usePreferences();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <div className="fixed right-4 top-4 flex gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
          onClick={toggleTheme}
          type="button"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? t('Chế độ sáng') : t('Chế độ tối')}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
          onClick={toggleLanguage}
          type="button"
          title={t('Đổi ngôn ngữ')}
        >
          <Languages className="h-4 w-4" />
          {language.toUpperCase()}
        </button>
      </div>
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-700 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">{t('Đăng nhập hệ thống')}</h1>
            <p className="text-sm text-slate-500">{t('Quản lý trung tâm học thêm')}</p>
          </div>
        </div>
        {error ? <div className="mb-4 rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{t(error)}</div> : null}
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            {t('Tên đăng nhập')}
            <input
              className="focus-ring h-10 rounded-md border border-slate-300 px-3"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            {t('Mật khẩu')}
            <input
              className="focus-ring h-10 rounded-md border border-slate-300 px-3"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button
            className="mt-2 h-10 rounded-md bg-sky-700 text-sm font-semibold text-white disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? t('Đang đăng nhập...') : t('Đăng nhập')}
          </button>
        </form>
        <div className="mt-5 rounded-md bg-slate-50 p-3 text-xs leading-6 text-slate-600">
          {t('Tài khoản mẫu:')} <b>admin</b>, <b>staff01</b>, <b>teacher01</b>, <b>student01</b>. {t('Mật khẩu:')} <b>123456</b>.
        </div>
      </div>
    </main>
  );
}
