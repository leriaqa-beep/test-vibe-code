import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, ChevronRight, Menu, X } from 'lucide-react';
import DecorationLayer from '../components/Decorations';
import WaveDivider, { WaveCreamToLavender, WaveLavenderToCream } from '../components/WaveDivider';

/* ── Данные ─────────────────────────────────────────────────── */
const features = [
  {
    mascotSrc: '/assets/mascot/mascot-joy.png',
    title: 'Персонализированные истории',
    desc: 'Каждая сказка создана специально для вашего ребёнка — с его именем, любимыми игрушками и героями.',
  },
  {
    mascotSrc: '/assets/mascot/mascot-explain.png',
    title: 'Голосовой ввод',
    desc: 'Ребёнок задаёт вопрос голосом — мы записываем и превращаем в сказку. Никаких сложностей!',
  },
  {
    mascotSrc: '/assets/mascot/mascot-surprise.png',
    title: 'Ответы через волшебство',
    desc: 'Сложные вопросы о мире объясняются через увлекательные сказки на понятном языке.',
  },
  {
    mascotSrc: '/assets/mascot/mascot-calm.png',
    title: 'Библиотека историй',
    desc: 'Все созданные сказки сохраняются. Можно перечитывать любимые и оценивать их.',
  },
];

const steps = [
  {
    num: '1',
    mascotSrc: '/assets/mascot/mascot-think.png',
    title: 'Расскажите о ребёнке',
    desc: 'Имя, возраст, любимые игрушки и герои — для максимальной персонализации.',
  },
  {
    num: '2',
    mascotSrc: '/assets/mascot/mascot-explain.png',
    title: 'Задайте вопрос',
    desc: 'Голосом или текстом — что сегодня интересует ребёнка.',
  },
  {
    num: '3',
    mascotSrc: '/assets/mascot/mascot-joy.png',
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
    features: ['3 истории бесплатно', 'Голосовой ввод', 'Персонализация', 'Библиотека историй'],
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

const betaCards = [
  {
    emoji: '🎁',
    title: 'Premium бесплатно',
    text: 'Все первые пользователи получают полный Premium доступ на время бета-теста. Без карты.',
    mascotSrc: '/assets/mascot/mascot-joy.png',
  },
  {
    emoji: '💬',
    title: 'Ваш отзыв важен',
    text: 'Мы в самом начале пути. Каждый комментарий помогает нам сделать приложение лучше для ваших детей.',
    mascotSrc: '/assets/mascot/mascot-explain.png',
  },
  {
    emoji: '🚀',
    title: 'Ранний доступ',
    text: 'Станьте частью сообщества с самого старта. Первые пользователи формируют продукт вместе с нами.',
    mascotSrc: '/assets/mascot/mascot-calm.png',
  },
];

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/assets/mascot/mascot-logo.png" alt="" style={{ width: '28px', height: '28px' }} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/assets/mascot/mascot-logo.png" alt="" style={{ width: '48px', height: '48px' }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '28px',
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
            gap: 'var(--space-8)',
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
                  <img src="/assets/mascot/mascot-joy.png" alt="" style={{ width: '18px', height: '18px', objectFit: 'contain', flexShrink: 0 }} />
                  🚀 Бета-версия — Premium бесплатно для первых
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

              {/* Бета-баннер */}
              <div style={{
                marginTop: 'var(--space-2)',
                background: 'linear-gradient(135deg, #F5F0FF 0%, #FFF0F5 100%)',
                border: '1.5px solid rgba(124,107,196,0.2)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4) var(--space-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
              }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>🚀</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--accent-primary)', margin: 0 }}>
                    Бета-запуск — Premium бесплатно
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Первые пользователи получают полный доступ. Ваш отзыв помогает нам стать лучше.
                  </p>
                </div>
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
              <div className="animate-float" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, display: 'flex', justifyContent: 'center' }}>
                <img
                  src="/assets/mascot/mascot-hero.png"
                  alt="Почему-Ка"
                  style={{
                    maxWidth: '560px',
                    width: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0 20px 40px rgba(124, 107, 196, 0.2))',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Волновой переход к следующей секции */}
        <WaveCreamToLavender />
      </section>

      {/* ── Features ── */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4) 0 0' }}>
        <div className="content-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
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
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  {/* Маскот */}
                  <img
                    src={f.mascotSrc}
                    alt=""
                    style={{ width: 80, height: 80, objectFit: 'contain', flexShrink: 0 }}
                  />
                  {/* Текст */}
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 'var(--text-lg)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)',
                      letterSpacing: '-0.01em',
                      marginTop: 0,
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
                </div>
              </div>
            ))}
          </div>
        </div>
        <WaveLavenderToCream />
      </section>

      {/* ── How it works ── */}
      <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-8) 0' }}>
        <div className="content-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Как это работает?</h2>
            <p className="section-subtitle">Три простых шага до волшебной сказки</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-8)' }} className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <img
                  src={s.mascotSrc}
                  alt=""
                  style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto var(--space-5)' }}
                />
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
          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
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

      {/* ── Beta section ── */}
      <WaveDivider from="var(--bg-primary)" to="var(--bg-warm)" variant="cloud" height={40} />
      <section style={{ background: 'var(--bg-warm)', padding: 'var(--space-8) 0' }}>
        <div className="content-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #7C6BC4, #E8A0BF)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              padding: '6px 20px',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--space-3)',
            }}>
              🚀 Бета-версия
            </span>
            <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>
              Станьте первыми
            </h2>
            <p className="section-subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
              Почему-Ка! только начинает свой путь. Мы приглашаем первых пользователей помочь нам создать лучшее приложение для детей.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }} className="reviews-grid">
            {betaCards.map((c, i) => (
              <div key={i} className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>{c.emoji}</div>
                <img src={c.mascotSrc} alt="" style={{ width: 64, height: 64, objectFit: 'contain', display: 'block', margin: '0 auto var(--space-3)' }} />
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)',
                }}>
                  {c.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', fontSize: 'var(--text-sm)', margin: 0 }}>
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider from="var(--bg-warm)" to="var(--bg-secondary)" variant="gentle" height={40} flip />

      {/* ── Pricing ── */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-8) 0' }}>
        <div className="content-container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
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
      <WaveDivider from="var(--bg-secondary)" to="var(--bg-primary)" variant="tilt" height={40} />
      <section style={{ background: 'var(--bg-primary)', padding: 'var(--space-8) 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <DecorationLayer preset="minimal" />
        <div className="content-container-sm" style={{ position: 'relative', zIndex: 1 }}>
          <img src="/assets/mascot/mascot-joy.png" alt="Почему-Ка" style={{ width: '280px', height: '280px', display: 'block', margin: '0 auto var(--space-6)' }} />
          <h2 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
            Начните сегодня бесплатно
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 'var(--space-4)' }}>
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
          <img src="/assets/mascot/mascot-logo.png" alt="Почему-Ка" style={{ width: '80px', height: '80px' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-primary)' }}>Почему-Ка!</span>
        </div>
        <p>© 2026 Почему-Ка!. Магия историй для любопытных детей.</p>
        <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
          <button
            onClick={() => navigate('/privacy')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Политика конфиденциальности
          </button>
        </div>
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
