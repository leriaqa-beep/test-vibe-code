import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20">⭐</div>
        <div className="absolute top-20 right-20 text-4xl opacity-20">🌙</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-20 hidden sm:block">🌈</div>
        <div className="absolute bottom-10 right-10 text-4xl opacity-20">✨</div>
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-6">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-white">
            <span className="text-3xl">✨</span>
            <span className="text-2xl font-bold">Почему-Ка!</span>
          </button>
          <p className="text-purple-200 text-sm mt-1">Магические сказки для вашего ребёнка</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-center text-lg font-bold text-gray-800 mb-5">
            {isRegister ? 'Создать аккаунт' : 'Войти в аккаунт'}
          </h2>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-150 mb-4"
          >
            <GoogleIcon />
            Войти через Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">или</span>
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition text-sm"
            />
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isRegister ? 'Пароль (мин. 6 символов)' : 'Пароль'}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <><Sparkles className="w-4 h-4 animate-spin" />{isRegister ? 'Создаём...' : 'Входим...'}</>
              ) : (
                isRegister ? 'Создать аккаунт' : 'Войти'
              )}
            </button>
          </form>

          {/* Переключатель режима */}
          <p className="text-center text-gray-500 text-xs mt-4">
            {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-purple-600 font-semibold"
            >
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>

        <p className="text-center text-purple-200 text-xs mt-4">
          3 истории бесплатно · Без карты
        </p>
      </div>
    </div>
  );
}
