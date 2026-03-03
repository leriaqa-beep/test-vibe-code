import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import DecorationLayer from '../components/Decorations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
      setDone(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm w-full text-center">
          <p className="text-red-600 text-sm mb-4">Ссылка недействительна. Запросите сброс пароля заново.</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-purple-600 font-semibold text-sm"
          >
            Запросить снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 page-enter"
      style={{ background: 'var(--bg-primary)' }}
    >
      <DecorationLayer preset="auth" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <img src="/assets/mascot/mascot-logo.png" alt="Почему-Ка" style={{ width: '60px', height: '60px' }} />
            <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Почему-Ка!</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          {done ? (
            /* ── Success ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--bg-mint)' }}>
                <CheckCircle className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Пароль изменён!
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Теперь можно войти с новым паролем.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full text-white py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--gradient-button)' }}
              >
                Войти в аккаунт
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <h2 className="text-center text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Новый пароль
              </h2>
              <p className="text-center text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Придумайте надёжный пароль (минимум 6 символов)
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Новый пароль"
                    required
                    autoFocus
                    className="w-full border border-[var(--border-default)] rounded-xl px-4 py-3 pr-11 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-300 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <input
                  type={showPass ? 'text' : 'password'}
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  className="w-full border border-[var(--border-default)] rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-300 transition text-sm"
                />

                {error && (
                  <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-xl font-semibold text-sm shadow-md disabled:opacity-60 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-100"
                  style={{ background: 'var(--gradient-button)' }}
                >
                  {loading ? 'Сохраняем...' : 'Сохранить пароль'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
