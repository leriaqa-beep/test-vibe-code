import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Check, Zap, ChevronRight, Mic, Menu, X } from 'lucide-react';
import DecorationLayer from '../components/Decorations';
import WaveDivider, { WaveCreamToLavender, WaveLavenderToCream } from '../components/WaveDivider';

/* ── Данные ─────────────────────────────────────────────────── */
const features = [
  {
    icon: <BookOpen size={22} />,
    iconBg: 'var(--accent-primary)',
    iconColor: '#fff',
    title: 'Персонализированные истории',
    desc: 'Каждая сказка создана специально для вашего ребёнка — с его именем, любимыми игрушками и героями.',
  },
  {
    icon: <Mic size={22} />,
    iconBg: 'var(--accent-secondary)',
    iconColor: '#fff',
    title: 'Голосовой ввод',
    desc: 'Ребёнок задаёт вопрос голосом — мы записываем и превращаем в сказку. Никаких сложностей!',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#9B8EC4"><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg>,
    iconBg: 'var(--accent-warm)',
    iconColor: '#fff',
    title: 'Ответы через волшебство',
    desc: 'Сложные вопросы о мире объясняются через увлекательные сказки на понятном языке.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#F9D56E"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
    iconBg: 'var(--accent-yellow)',
    iconColor: 'var(--text-primary)',
    title: 'Библиотека историй',
    desc: 'Все созданные сказки сохраняются. Можно перечитывать любимые и оценивать их.',
  },
];

const steps = [
  {
    num: '1',
    emoji: '👶',
    title: 'Расскажите о ребёнке',
    desc: 'Имя, возраст, любимые игрушки и герои — для максимальной персонализации.',
  },
  {
    num: '2',
    emoji: '🎤',
    title: 'Задайте вопрос',
    desc: 'Голосом или текстом — что сегодня интересует ребёнка.',
  },
  {
    num: '3',
    emoji: '✨',
    title: 'Получите сказку',
    desc: 'Через несколько секунд готова уникальная история с вашими персонажами.',
  },
];

const plans = [
  {
    name: 'Бесплатно',
    price: '0',
    period: '',
    storiesLimit: '3 истории',
    features: ['3 истории в месяц', 'Голосовой ввод', 'Персонализация', 'Библиотека историй'],
    cta: 'Начать бесплатно',
    highlight: false,
  },
  {
    name: 'Премиум',
    price: '299',
    period: '/мес',
    storiesLimit: 'Безлимитно',
    features: ['Безлимитные истории', 'Голосовой ввод', 'Персонализация', 'Библиотека историй', 'Иллюстрации к сказкам*', 'Создание книг*'],
    cta: 'Попробовать 7 дней бесплатно',
    highlight: true,
  },
  {
    name: 'Семейный',
    price: '499',
    period: '/мес',
    storiesLimit: 'До 5 детей',
    features: ['До 5 профилей детей', 'Безлимитные истории', 'Все функции Премиум', 'Голосовая озвучка*', 'Общая библиотека'],
    cta: 'Выбрать',
    highlight: false,
  },
];

const testimonials = [
  {
    name: 'Мария, мама Сони (4 года)',
    text: 'Соня каждый вечер просит: «Мама, задай ещё вопрос!» Теперь мы объясняем всё через сказки с её любимой куклой Малинкой.',
    emoji: '👩',
  },
  {
    name: 'Алексей, папа Миши (6 лет)',
    text: 'Сын спросил «почему люди умирают» — я растерялся. Приложение создало мягкую, добрую сказку, которая помогла ему понять.',
    emoji: '👨',
  },
  {
    name: 'Екатерина, мама Лизы (5 лет)',
    text: 'Дочка боялась темноты. После трёх сказок с её зайкой Пушинкой она перестала бояться — теперь засыпает сама!',
    emoji: '👩‍🦰',
  },
];

/* ── SVG-иллюстрация: ребёнок с книгой ─────────────────────── */
function BookIllustration() {
  return (
    <div className="relative w-full select-none" style={{ maxWidth: 460 }}>
      {/* Фоновое свечение */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, #E4DFFE 0%, transparent 70%)',
          transform: 'scale(1.1)',
        }}
      />

      <svg viewBox="0 0 460 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Тень под книгой ── */}
        <ellipse cx="230" cy="360" rx="120" ry="18" fill="#C9BCFD" opacity="0.25" />

        {/* ── Открытая книга ── */}
        {/* Левая страница */}
        <path
          d="M100 220 Q105 200 230 195 L230 330 Q230 338 222 340 L102 340 Q92 340 90 330 L90 232 Q90 222 100 220Z"
          fill="#FFFBF5"
          stroke="#C9BCFD"
          strokeWidth="2"
        />
        {/* Правая страница */}
        <path
          d="M360 220 Q355 200 230 195 L230 330 Q230 338 238 340 L358 340 Q368 340 370 330 L370 232 Q370 222 360 220Z"
          fill="#F5F0FF"
          stroke="#C9BCFD"
          strokeWidth="2"
        />
        {/* Корешок книги */}
        <path d="M230 195 L230 340" stroke="#9B8EC4" strokeWidth="3" strokeLinecap="round" />
        {/* Нижняя обложка */}
        <rect x="88" y="338" width="284" height="14" rx="7" fill="#9B8EC4" opacity="0.35" />

        {/* Строки на левой странице */}
        {[245, 260, 275, 290, 305, 320].map((y, i) => (
          <rect key={i} x="110" y={y} width={i % 3 === 2 ? 70 : 95} height="5" rx="2.5" fill="#C9BCFD" opacity="0.5" />
        ))}
        {/* Картинка-иллюстрация на левой странице */}
        <rect x="110" y="222" width="95" height="55" rx="8" fill="#EDE9FE" />
        <circle cx="147" cy="244" r="12" fill="#C9BCFD" opacity="0.6" />
        <path d="M125 262 Q147 250 175 262" stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Текст на правой странице */}
        {[240, 255, 270, 285, 300, 315, 328].map((y, i) => (
          <rect key={i} x="255" y={y} width={i === 2 ? 60 : i === 5 ? 75 : 90} height="5" rx="2.5" fill="#9B8EC4" opacity="0.4" />
        ))}

        {/* ── Ребёнок ── */}
        {/* Тело */}
        <ellipse cx="230" cy="290" rx="28" ry="22" fill="#F4A261" opacity="0.9" />
        {/* Голова */}
        <circle cx="230" cy="258" r="26" fill="#FDDCB5" />
        {/* Волосы */}
        <path d="M205 252 Q212 230 230 228 Q248 230 255 252" fill="#7C6BC4" opacity="0.8" />
        {/* Глаза */}
        <circle cx="221" cy="256" r="3.5" fill="#2D2B3D" />
        <circle cx="239" cy="256" r="3.5" fill="#2D2B3D" />
        {/* Блик в глазах */}
        <circle cx="222.5" cy="254.5" r="1.2" fill="white" />
        <circle cx="240.5" cy="254.5" r="1.2" fill="white" />
        {/* Щёки */}
        <circle cx="213" cy="263" r="5" fill="#F4A261" opacity="0.35" />
        <circle cx="247" cy="263" r="5" fill="#F4A261" opacity="0.35" />
        {/* Улыбка */}
        <path d="M222 268 Q230 274 238 268" stroke="#E08040" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Руки */}
        <path d="M202 285 Q180 300 175 320" stroke="#FDDCB5" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M258 285 Q280 300 285 320" stroke="#FDDCB5" strokeWidth="14" strokeLinecap="round" fill="none" />
        {/* Кисти */}
        <ellipse cx="174" cy="323" rx="10" ry="7" fill="#FDDCB5" />
        <ellipse cx="286" cy="323" rx="10" ry="7" fill="#FDDCB5" />

        {/* ── Летящие элементы из книги ── */}

        {/* Звезда 1 — большая, левый верх */}
        <g transform="translate(118, 88) rotate(12)">
          <path d="M0-18 L4.5-5.5 L18-5.5 L7 3 L11 16 L0 8.5 L-11 16 L-7 3 L-18-5.5 L-4.5-5.5Z"
            fill="#F9D56E" />
        </g>

        {/* Звезда 2 — маленькая */}
        <g transform="translate(310, 60) rotate(-8)">
          <path d="M0-12 L3-3.5 L12-3.5 L4.5 2 L7.5 11 L0 5.5 L-7.5 11 L-4.5 2 L-12-3.5 L-3-3.5Z"
            fill="#F9D56E" opacity="0.8" />
        </g>

        {/* Звезда 3 — крошечная */}
        <g transform="translate(168, 48) rotate(20)">
          <path d="M0-8 L2-2.5 L8-2.5 L3 1.5 L5 7.5 L0 3.5 L-5 7.5 L-3 1.5 L-8-2.5 L-2-2.5Z"
            fill="#F9D56E" opacity="0.6" />
        </g>

        {/* Сердечко */}
        <g transform="translate(342, 130)">
          <path d="M0-14 C0-22 -14-22 -14-10 C-14 0 0 12 0 14 C0 12 14 0 14-10 C14-22 0-22 0-14Z"
            fill="#E8A0BF" stroke="#D07FA0" strokeWidth="1.5" opacity="0.9" />
        </g>

        {/* Планета */}
        <g transform="translate(96, 155)">
          <circle cx="0" cy="0" r="18" fill="#7BBCD8" fillOpacity="0.25" stroke="#7BBCD8" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="26" ry="8" stroke="#7BBCD8" strokeWidth="1.8" fill="none"
            transform="rotate(-25)" opacity="0.7" />
          <circle cx="-5" cy="-6" r="4" fill="white" opacity="0.3" />
        </g>

        {/* Дракончик */}
        <g transform="translate(358, 190)">
          {/* Тело */}
          <ellipse cx="0" cy="0" rx="18" ry="13" fill="#6BB89C" opacity="0.85" />
          {/* Голова */}
          <circle cx="15" cy="-6" r="10" fill="#6BB89C" opacity="0.85" />
          {/* Глаз */}
          <circle cx="18" cy="-8" r="3" fill="#2D2B3D" />
          <circle cx="19" cy="-9" r="1" fill="white" />
          {/* Крыло */}
          <path d="M-5-8 Q-20-25 -15-10" stroke="#4E9A81" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Хвост */}
          <path d="M-16 5 Q-28 15 -22 22" stroke="#4E9A81" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>

        {/* Маленькое облачко */}
        <g transform="translate(138, 138)">
          <path d="M-28 8 Q-28-4 -16-4 Q-14-14 -4-14 Q4-14 6-8 Q14-12 20-6 Q26-4 24 4 Q28 6 28 12 Q28 18 22 18 L-22 18 Q-28 18 -28 12 Z"
            fill="white" stroke="#C9BCFD" strokeWidth="1.5" opacity="0.9" />
        </g>

        {/* Книжка-малышка */}
        <g transform="translate(82, 110)">
          <rect x="-14" y="-18" width="28" height="36" rx="3" fill="#F5F0FF" stroke="#9B8EC4" strokeWidth="1.5" />
          <line x1="-2" y1="-18" x2="-2" y2="18" stroke="#9B8EC4" strokeWidth="1" />
          {[-8, -1, 6, 12].map((y, i) => (
            <rect key={i} x="2" y={y} width="8" height="2.5" rx="1" fill="#C9BCFD" opacity="0.7" />
          ))}
        </g>

        {/* Блёстки-sparkles */}
        {[
          { x: 185, y: 72, s: 0.7 },
          { x: 270, y: 82, s: 0.5 },
          { x: 380, y: 100, s: 0.6 },
          { x: 72,  y: 200, s: 0.5 },
          { x: 400, y: 245, s: 0.55 },
        ].map(({ x, y, s }, i) => (
          <g key={i} transform={`translate(${x},${y}) scale(${s})`} opacity="0.65">
            <path d="M0-10 L2-2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2-2Z" fill="#C9BCFD" />
          </g>
        ))}

      </svg>
    </div>
  );
}

/* ── Карточка статистики ────────────────────────────────────── */
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div
      className="card flex flex-col items-center gap-2 py-4 px-3 text-center"
      style={{ borderColor: 'var(--border-muted)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--bg-secondary)', color: 'var(--accent-primary)' }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-2xl)', color: 'var(--accent-primary)' }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

/* ── Главный компонент ───────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page-container" style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── Mobile Drawer Backdrop ── */}
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(45,43,61,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 500,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* ── Mobile Drawer ── */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0,
          height: '100%', width: 280,
          background: 'var(--bg-surface)',
          boxShadow: '-4px 0 32px rgba(45,43,61,0.15)',
          zIndex: 501,
          padding: 'var(--space-6)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span>✨</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-primary)', fontSize: 'var(--text-lg)' }}>Почему-Ка!</span>
          </div>
          <button onClick={() => setMenuOpen(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', border: 'none', background: 'none', padding: 8, display: 'flex' }}>
            <X size={22} />
          </button>
        </div>
        <button
          onClick={() => { navigate('/auth'); setMenuOpen(false); }}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Войти
        </button>
        <button
          onClick={() => { navigate('/auth?mode=register'); setMenuOpen(false); }}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Попробовать бесплатно
        </button>
      </div>

      {/* ── Header ── */}
      <header className="nav-bar">
        <div className="content-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0' }}>
            {/* Лого */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <path d="M16 4 C16 4 20 10 24 13 C28 16 16 22 16 22 C16 22 4 16 8 13 C12 10 16 4 16 4Z"
                  fill="var(--accent-primary)" opacity="0.85" />
                <circle cx="16" cy="22" r="5" fill="var(--accent-warm)" opacity="0.8" />
                <circle cx="9" cy="13" r="2.5" fill="var(--accent-yellow)" />
                <circle cx="23" cy="13" r="2.5" fill="var(--accent-pink)" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.75rem',
                letterSpacing: '-0.01em',
                color: 'var(--accent-primary)',
              }}>
                Почему-Ка!
              </span>
            </div>

            {/* Desktop nav */}
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--accent-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-2) var(--space-3)',
                }}
              >
                Войти
              </button>
              <button
                onClick={() => navigate('/auth?mode=register')}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #7C6BC4 0%, #6B5AB8 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  padding: '10px 22px',
                  borderRadius: '50px',
                  boxShadow: '0 4px 16px rgba(124, 107, 196, 0.35)',
                  minHeight: 40,
                }}
              >
                Попробовать бесплатно
              </button>
            </div>

            {/* Mobile burger */}
            <button
              className="mobile-burger"
              onClick={() => setMenuOpen(true)}
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40, height: 40,
                background: 'none', border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
              }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="page-container"
        style={{
          background: 'linear-gradient(140deg, #FFFBF5 0%, #F5F0FF 55%, #FFF0F5 100%)',
          paddingTop: 'var(--space-10)',
          paddingBottom: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <DecorationLayer preset="hero" />

        <div className="content-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-16)',
            alignItems: 'flex-start',
          }}
            className="hero-grid"
          >
            {/* ── Левая колонка: текст ── */}
            <div className="animate-fade-in-up hero-text" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

              {/* Бейдж */}
              <div style={{ display: 'flex' }}>
                <span
                  className="badge badge-primary"
                  style={{ fontSize: 'var(--text-sm)', textTransform: 'none', letterSpacing: 0, padding: '6px 16px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#9B8EC4" style={{flexShrink:0}}><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg>
                  Более 1000 историй создано родителями
                </span>
              </div>

              {/* Заголовок */}
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 2.65rem)',
                  fontWeight: 700,
                  lineHeight: 1.18,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}>
                  Магические сказки<br />
                  для вашего{' '}
                  {/* Акцентное слово с волнистым подчёркиванием */}
                  <span style={{ position: 'relative', display: 'inline-block', color: 'var(--accent-primary)' }}>
                    почемучки
                    <svg
                      viewBox="0 0 180 10"
                      style={{ position: 'absolute', bottom: -6, left: 0, width: '100%', height: 10 }}
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 6 Q22 1 45 6 Q67 11 90 6 Q112 1 135 6 Q157 11 180 6"
                        stroke="var(--accent-warm)"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* Подзаголовок */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                margin: 0,
                maxWidth: '460px',
              }}>
                Персонализированные истории с любимыми игрушками вашего ребёнка,
                которые отвечают на его вопросы и помогают понять мир.
              </p>

              {/* CTA */}
              <div className="hero-cta" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <button
                  onClick={() => navigate('/auth?mode=register')}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #7C6BC4 0%, #6B5AB8 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '18px',
                    padding: '16px 40px',
                    borderRadius: '50px',
                    boxShadow: '0 4px 20px rgba(124, 107, 196, 0.4)',
                    gap: 'var(--space-2)',
                    minHeight: 56,
                  }}
                >
                  Попробовать бесплатно
                  <ChevronRight size={20} />
                </button>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  3 истории бесплатно · без банковской карты
                </span>
              </div>

              {/* Статистика — три отдельные карточки */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <StatCard icon={<BookOpen size={18} />} value="1000+" label="историй создано" />
                <StatCard icon={<Users size={18} />}   value="500+"  label="довольных семей" />
                <StatCard
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="#F9D56E"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>}
                  value="4.9"
                  label="средняя оценка"
                />
              </div>
            </div>

            {/* ── Правая колонка: иллюстрация ── */}
            <div className="animate-fade-in delay-200 hero-illustration" style={{ display: 'flex', justifyContent: 'center', position: 'relative', paddingTop: 'var(--space-4)' }}>
              {/* Декоративный круг-фон */}
              <div
                style={{
                  position: 'absolute',
                  width: '80%',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, #EDE9FE 0%, transparent 70%)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -48%)',
                  zIndex: 0,
                }}
              />
              <div className="animate-float" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
                <BookIllustration />
              </div>
            </div>
          </div>
        </div>

        {/* Волновой переход к следующей секции */}
        <WaveCreamToLavender />
      </section>

      {/* ── Features ── */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-12) 0 0' }}>
        <div className="content-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>
              Почему родители выбирают Почему-Ка!?
            </h2>
            <p className="section-subtitle" style={{ maxWidth: 560, margin: '0 auto' }}>
              Мы знаем, что дети от 3 до 7 лет задают сотни вопросов в день.
              Наше приложение помогает отвечать на них красиво и понятно.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-5)' }} className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="card card-hover"
                style={{
                  padding: 28,
                  opacity: 0,
                  animation: `fade-in-up 0.5s cubic-bezier(0.4,0,0.2,1) ${i * 100}ms forwards`,
                }}
              >
                {/* Круглая иконка */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: f.iconBg,
                    color: f.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                  letterSpacing: '-0.01em',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  fontSize: 'var(--text-base)',
                  margin: 0,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <WaveLavenderToCream />
      </section>

      {/* ── How it works ── */}
      <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-12) 0' }}>
        <div className="content-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Как это работает?</h2>
            <p className="section-subtitle">Три простых шага до волшебной сказки</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-8)' }} className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72,
                  background: 'var(--gradient-button)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-5)',
                  boxShadow: 'var(--shadow-button)',
                  fontSize: 28,
                }}>
                  {s.emoji}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                }}>
                  {s.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', fontSize: 'var(--text-base)' }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #7C6BC4 0%, #6B5AB8 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '18px',
                padding: '16px 40px',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(124, 107, 196, 0.4)',
                minHeight: 56,
              }}
            >
              Начать прямо сейчас
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <WaveDivider from="var(--bg-primary)" to="var(--bg-warm)" variant="cloud" height={64} />
      <section style={{ background: 'var(--bg-warm)', padding: 'var(--space-12) 0' }}>
        <div className="content-container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            Что говорят родители
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }} className="reviews-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-3)' }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24">
                      <path d="M12 2L14.9 9.4L23 10.3L17 16L18.9 24L12 20.1L5.1 24L7 16L1 10.3L9.1 9.4Z"
                        fill="var(--accent-yellow)" />
                    </svg>
                  ))}
                </div>
                <p style={{
                  color: 'var(--text-primary)',
                  fontStyle: 'italic',
                  lineHeight: 'var(--leading-relaxed)',
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-base)',
                }}>
                  «{t.text}»
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 28 }}>{t.emoji}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {t.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider from="var(--bg-warm)" to="var(--bg-secondary)" variant="gentle" height={64} flip />

      {/* ── Pricing ── */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-12) 0' }}>
        <div className="content-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Тарифы</h2>
            <p className="section-subtitle">Начните бесплатно, развивайтесь вместе с нами</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }} className="plans-grid">
            {plans.map((p, i) => (
              <div
                key={i}
                className={p.highlight ? 'highlight-plan' : 'card'}
                style={p.highlight ? {
                  background: 'var(--gradient-button)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                  boxShadow: 'var(--shadow-lg)',
                  transform: 'scale(1.04)',
                } : {
                  padding: 'var(--space-6)',
                }}
              >
                {p.highlight && (
                  <div style={{ display: 'flex', marginBottom: 'var(--space-4)' }}>
                    <span className="badge badge-yellow" style={{ textTransform: 'none', letterSpacing: 0 }}>
                      <Zap size={11} /> Популярный
                    </span>
                  </div>
                )}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'var(--text-xl)',
                  color: p.highlight ? '#fff' : 'var(--text-primary)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {p.name}
                </h3>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'var(--text-h2)',
                    color: p.highlight ? '#fff' : 'var(--text-primary)',
                  }}>
                    {p.price === '0' ? 'Бесплатно' : `${p.price}₽`}
                  </span>
                  {p.period && (
                    <span style={{ color: p.highlight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
                      {p.period}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: p.highlight ? 'rgba(255,255,255,0.85)' : 'var(--accent-primary)',
                  marginBottom: 'var(--space-4)',
                }}>
                  {p.storiesLimit}
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                  {p.features.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                      <Check size={15} style={{ color: p.highlight ? '#A8F0D8' : 'var(--accent-secondary)', flexShrink: 0 }} />
                      <span style={{ color: p.highlight ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?mode=register')}
                  className={p.highlight ? 'btn btn-sm' : 'btn btn-secondary btn-sm'}
                  style={p.highlight ? {
                    width: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    justifyContent: 'center',
                  } : { width: '100%', justifyContent: 'center' }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-6)' }}>
            * Функции в разработке, скоро появятся!
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <WaveDivider from="var(--bg-secondary)" to="var(--bg-primary)" variant="tilt" height={60} />
      <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-12) 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <DecorationLayer preset="minimal" />
        <div className="content-container-sm" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>✨</div>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
            Начните сегодня бесплатно
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
            3 истории бесплатно. Никакой карты. Никакой регистрации с барьерами.
          </p>
          <button
            onClick={() => navigate('/auth?mode=register')}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #7C6BC4 0%, #6B5AB8 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '18px',
              padding: '16px 40px',
              borderRadius: '50px',
              boxShadow: '0 4px 20px rgba(124, 107, 196, 0.4)',
              minHeight: 56,
            }}
          >
            Создать первую сказку
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border-muted)',
        padding: 'var(--space-8) 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--text-sm)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <span>✨</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-primary)' }}>Почему-Ка!</span>
        </div>
        <p>© 2024 Почему-Ка!. Магия историй для любопытных детей.</p>
      </footer>

      {/* ── Адаптивность ── */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid     { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid    { grid-template-columns: 1fr !important; }
          .reviews-grid  { grid-template-columns: 1fr !important; }
          .plans-grid    { grid-template-columns: 1fr !important; }
          .hero-text     { text-align: center; }
          .hero-cta      { align-items: center !important; }
          .hero-illustration { max-width: 300px; margin: 0 auto; }
          .highlight-plan { transform: none !important; }
          .desktop-nav   { display: none !important; }
          .mobile-burger { display: flex !important; }
        }
        @media (max-width: 480px) {
          .content-container { padding: 0 var(--space-4) !important; }
        }
      `}</style>
    </div>
  );
}
