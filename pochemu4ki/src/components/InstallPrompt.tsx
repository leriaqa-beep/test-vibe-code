import { useState, useEffect } from 'react';
import { X, Share, Plus, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa_install_dismissed';
// Value stored: 'never' = permanent | numeric string = timestamp of "later" (24h cooldown)

function isIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(45,43,61,0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        animation: 'fade-in 0.25s ease',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 360 }}>
        {children}
      </div>
    </div>
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (!isMobile()) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed === 'never') return; // permanent opt-out
    if (dismissed && Date.now() - Number(dismissed) < 24 * 60 * 60 * 1000) return; // 24h cooldown

    if (isIOS()) {
      const t = setTimeout(() => setShowIOS(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (deferredPrompt) {
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, [deferredPrompt]);

  function dismiss() {
    // "Позже" — 24h cooldown, will show again next day
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
    setShowIOS(false);
    setDeferredPrompt(null);
  }

  function dismissForever() {
    // "Больше не спрашивать" — permanent
    localStorage.setItem(DISMISSED_KEY, 'never');
    setVisible(false);
    setShowIOS(false);
    setDeferredPrompt(null);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible && !showIOS) return null;

  const card: React.CSSProperties = {
    background: '#FFFBF5',
    borderRadius: 28,
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(45,43,61,0.35)',
    animation: 'bounce-in 0.4s cubic-bezier(0.34,1.56,0.64,1)',
  };

  const header: React.CSSProperties = {
    background: 'linear-gradient(135deg, #7C6BC4 0%, #9B8EC4 100%)',
    padding: '28px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  };

  const body: React.CSSProperties = {
    padding: '20px 24px 24px',
  };

  // ── iOS version ────────────────────────────────────────────
  if (showIOS) {
    return (
      <Overlay onClose={dismiss}>
        <div style={card}>
          {/* Header */}
          <div style={header}>
            <button onClick={dismiss} style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} color="white" />
            </button>
            <img
              src="/assets/mascot/mascot-joy.png"
              alt=""
              style={{ width: 80, height: 80, borderRadius: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
            />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: 20, letterSpacing: '-0.3px' }}>
                Почему-Ка!
              </p>
              <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                Добавь на главный экран
              </p>
            </div>
          </div>

          {/* Body */}
          <div style={body}>
            <p style={{ margin: '0 0 16px', color: '#7A7890', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>
              Запускай как приложение — быстро и без браузера
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#F3F0FB', borderRadius: 14, padding: '12px 14px',
              }}>
                <span style={{
                  width: 36, height: 36, background: '#7C6BC4', borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Share size={16} color="white" />
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#2D2B3D', fontSize: 13 }}>Шаг 1</p>
                  <p style={{ margin: 0, color: '#7A7890', fontSize: 12 }}>Нажми «Поделиться» в Safari</p>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#F3F0FB', borderRadius: 14, padding: '12px 14px',
              }}>
                <span style={{
                  width: 36, height: 36, background: '#7C6BC4', borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Plus size={16} color="white" />
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#2D2B3D', fontSize: 13 }}>Шаг 2</p>
                  <p style={{ margin: 0, color: '#7A7890', fontSize: 12 }}>Выбери «На экран "Домой"»</p>
                </div>
              </div>
            </div>

            <button onClick={dismiss} style={{
              width: '100%', marginTop: 16,
              background: 'none', border: '1.5px solid #E0DCF0',
              borderRadius: 14, padding: '11px', fontSize: 14,
              fontWeight: 600, color: '#7A7890', cursor: 'pointer',
            }}>
              Позже
            </button>
            <button onClick={dismissForever} style={{
              width: '100%', marginTop: 8,
              background: 'none', border: 'none', padding: '6px',
              fontSize: 12, color: '#ABA9C0', cursor: 'pointer', textDecoration: 'underline',
            }}>
              Больше не спрашивать
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── Android / Chrome version ───────────────────────────────
  return (
    <Overlay onClose={dismiss}>
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <button onClick={dismiss} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.2)', border: 'none',
            borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={16} color="white" />
          </button>
          <img
            src="/assets/mascot/mascot-joy.png"
            alt=""
            style={{ width: 80, height: 80, borderRadius: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: 20, letterSpacing: '-0.3px' }}>
              Почему-Ка!
            </p>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              Установи как приложение
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={body}>
          <p style={{ margin: '0 0 20px', color: '#7A7890', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>
            Запускай сказки быстро с главного экрана — работает без браузера
          </p>

          <button
            onClick={handleInstall}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7C6BC4, #9B8EC4)',
              color: 'white', border: 'none',
              borderRadius: 16, padding: '14px',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(124,107,196,0.4)',
            }}
          >
            <Download size={18} />
            Установить приложение
          </button>

          <button onClick={dismiss} style={{
            width: '100%', marginTop: 10,
            background: 'none', border: '1.5px solid #E0DCF0',
            borderRadius: 14, padding: '11px', fontSize: 14,
            fontWeight: 600, color: '#7A7890', cursor: 'pointer',
          }}>
            Позже
          </button>
          <button onClick={dismissForever} style={{
            width: '100%', marginTop: 8,
            background: 'none', border: 'none', padding: '6px',
            fontSize: 12, color: '#ABA9C0', cursor: 'pointer', textDecoration: 'underline',
          }}>
            Больше не спрашивать
          </button>
        </div>
      </div>
    </Overlay>
  );
}
