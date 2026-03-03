import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, BookOpen, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import DecorationLayer from '../components/Decorations';

const STEPS = [
  {
    icon: <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
    text: 'Создайте профиль ребёнка — имя, возраст, любимые игрушки и герой',
  },
  {
    icon: <span style={{ fontSize: 20 }}>🎤</span>,
    text: 'Ребёнок задаёт вопрос голосом или текстом — «Почему небо синее?»',
  },
  {
    icon: <BookOpen className="w-5 h-5" style={{ color: 'var(--text-warm)' }} />,
    text: 'Через секунды готова персональная сказка с его героями и игрушками',
  },
  {
    icon: <Heart className="w-5 h-5" style={{ color: 'var(--text-pink)' }} />,
    text: 'Все истории сохраняются в библиотеке — можно перечитывать вместе',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { children, loadChildren } = useApp();

  // If user already has children — skip onboarding
  useEffect(() => {
    loadChildren().then(() => {
      // check is done in the next effect
    });
  }, []);

  useEffect(() => {
    if (children.length > 0) {
      navigate('/app', { replace: true });
    }
  }, [children, navigate]);

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter flex flex-col"
      style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}
    >
      <DecorationLayer preset="auth" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative max-w-sm mx-auto w-full">

        {/* Mascot */}
        <img
          src="/assets/mascot/mascot-joy.png"
          alt="Маскот"
          className="w-36 h-36 object-contain mb-6 drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(124,107,196,0.25))' }}
        />

        {/* Headline */}
        <h1
          className="text-center mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 5vw, 1.9rem)',
            color: 'var(--text-primary)',
            lineHeight: 1.25,
          }}
        >
          Добро пожаловать{user?.email ? ',' : '!'}<br />
          {user?.email && (
            <span style={{ color: 'var(--accent-primary)', fontSize: '0.85em' }}>
              {user.email.split('@')[0]}!
            </span>
          )}
        </h1>

        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Вы в Почему-Ка! — месте, где любой вопрос ребёнка превращается в волшебную сказку
        </p>

        {/* Steps */}
        <div
          className="w-full rounded-2xl p-4 mb-8 space-y-3"
          style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-card)' }}
        >
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg-primary)' }}
              >
                {step.icon}
              </div>
              <p className="text-sm pt-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/app/children/new')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-100"
          style={{
            background: 'var(--gradient-button)',
            boxShadow: 'var(--shadow-button)',
            fontSize: 'var(--text-base)',
          }}
        >
          Создать профиль ребёнка
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Skip */}
        <button
          onClick={() => navigate('/app', { replace: true })}
          className="mt-4 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Пропустить — добавлю позже
        </button>
      </div>
    </div>
  );
}
