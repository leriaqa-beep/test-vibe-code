import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DecorationLayer from '../components/Decorations';

const BACKEND_URL = 'http://localhost:3001';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Auth() {
  const [params] = useSearchParams();
  const [isRegister, setIsRegister] = useState(params.get('mode') === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const errorParam = params.get('error');
  const [error, setError] = useState(
    errorParam === 'google_failed' ? 'Не удалось войти через Google' :
    errorParam === 'google_not_configured' ? 'Google OAuth не настроен. Добавьте GOOGLE_CLIENT_ID в backend/.env' :
    ''
  );
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, registerWithEmail, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/app');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

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
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Магические сказки для вашего ребёнка</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-center text-lg font-bold text-text-primary mb-5">
            {isRegister ? 'Создать аккаунт' : 'Войти в аккаунт'}
          </h2>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-2 border-[var(--border-default)] rounded-xl py-3 text-text-primary font-semibold text-sm hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] active:bg-gray-100 transition-all duration-150 mb-4"
          >
            <GoogleIcon />
            Войти через Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-text-muted font-medium">или</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email/password форма */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border border-[var(--border-default)] rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-300 transition text-sm"
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isRegister ? 'Пароль (мин. 6 символов)' : 'Пароль'}
                required
                className="w-full border border-[var(--border-default)] rounded-xl px-4 py-3 pr-11 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-300 transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-xl font-semibold text-sm shadow-md disabled:opacity-60 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-100"
              style={{ background: 'var(--gradient-button)' }}
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="#fff"><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg>{isRegister ? 'Создаём...' : 'Входим...'}</>
              ) : (
                isRegister ? 'Создать аккаунт' : 'Войти'
              )}
            </button>
          </form>

          {/* Переключатель режима */}
          <p className="text-center text-text-secondary text-xs mt-4">
            {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-purple-600 font-semibold"
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          3 истории бесплатно · Без карты
        </p>
      </div>
    </div>
  );
}
