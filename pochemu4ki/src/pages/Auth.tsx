import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [params] = useSearchParams();
  const [isRegister, setIsRegister] = useState(params.get('mode') === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(email, password);
      else await login(email, password);
      navigate('/app');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20">⭐</div>
        <div className="absolute top-20 right-20 text-4xl opacity-20">🌙</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-20">🌈</div>
        <div className="absolute bottom-10 right-10 text-4xl opacity-20">✨</div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-white">
            <span className="text-3xl">✨</span>
            <span className="text-2xl font-bold">Почемучки</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isRegister ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}
              onClick={() => { setIsRegister(false); setError(''); }}
            >
              Войти
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isRegister ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}
              onClick={() => { setIsRegister(true); setError(''); }}
            >
              Зарегистрироваться
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {isRegister ? 'Создать аккаунт' : 'Добро пожаловать!'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {isRegister
              ? '3 истории бесплатно, без карты'
              : 'Войдите, чтобы продолжить магию'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mama@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Минимум 6 символов' : 'Ваш пароль'}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  {isRegister ? 'Создаём...' : 'Входим...'}
                </>
              ) : (
                isRegister ? 'Создать аккаунт' : 'Войти'
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">
            {isRegister
              ? 'Регистрируясь, вы соглашаетесь с условиями использования'
              : 'Нет аккаунта? '}
            {!isRegister && (
              <button onClick={() => setIsRegister(true)} className="text-purple-600 font-semibold">
                Зарегистрируйтесь
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
