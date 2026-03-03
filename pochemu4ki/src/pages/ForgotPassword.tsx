import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import DecorationLayer from '../components/Decorations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка сервера');
      }
      setSent(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
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
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          {/* Back */}
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-1 text-sm mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Вернуться ко входу
          </button>

          {sent ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--bg-mint)' }}>
                <Mail className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Письмо отправлено!
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Если аккаунт с адресом <strong>{email}</strong> существует,
                на него придёт ссылка для сброса пароля. Проверьте папку «Спам», если письмо не пришло.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full text-white py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--gradient-button)' }}
              >
                Вернуться ко входу
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h2 className="text-center text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Забыли пароль?
              </h2>
              <p className="text-center text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Введите email — пришлём ссылку для сброса пароля
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ваш email"
                  required
                  autoFocus
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
                  {loading ? 'Отправляем...' : 'Отправить ссылку'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
