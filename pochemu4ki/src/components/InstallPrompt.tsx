import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa_install_dismissed';

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

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    if (isInStandaloneMode()) return;
    if (!isMobile()) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return; // 7 days

    if (isIOS()) {
      // Delay to not interrupt page load
      const t = setTimeout(() => setShowIOS(true), 3000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (deferredPrompt) setVisible(true);
  }, [deferredPrompt]);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
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

  // iOS banner
  if (showIOS) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          background: 'rgba(255,251,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(124,107,196,0.15)',
          boxShadow: '0 -4px 24px rgba(124,107,196,0.15)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        <button
          onClick={dismiss}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ABA9C0', padding: 4,
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <img
            src="/assets/mascot/mascot-joy.png"
            alt=""
            style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#2D2B3D', fontSize: 15 }}>
              Добавь на главный экран!
            </p>
            <p style={{ margin: '4px 0 10px', color: '#7A7890', fontSize: 13, lineHeight: 1.4 }}>
              Запускай Почему-Ка! как приложение — без браузера
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, background: '#7C6BC4', borderRadius: 6, flexShrink: 0,
                }}>
                  <Share size={13} color="white" />
                </span>
                <span style={{ fontSize: 13, color: '#2D2B3D' }}>
                  Нажми «Поделиться» в Safari
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, background: '#7C6BC4', borderRadius: 6, flexShrink: 0,
                }}>
                  <Plus size={13} color="white" />
                </span>
                <span style={{ fontSize: 13, color: '#2D2B3D' }}>
                  Выбери «На экран "Домой"»
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android / Chrome banner
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 9999,
        background: 'rgba(255,251,245,0.97)',
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        border: '1px solid rgba(124,107,196,0.2)',
        boxShadow: '0 8px 32px rgba(124,107,196,0.2)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slideUp 0.3s ease',
      }}
    >
      <img
        src="/assets/mascot/mascot-joy.png"
        alt=""
        style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#2D2B3D', fontSize: 14 }}>
          Установить приложение
        </p>
        <p style={{ margin: '2px 0 0', color: '#7A7890', fontSize: 12, lineHeight: 1.3 }}>
          Работает как приложение без браузера
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={dismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ABA9C0', padding: '6px 4px',
          }}
        >
          <X size={18} />
        </button>
        <button
          onClick={handleInstall}
          style={{
            background: '#7C6BC4', color: 'white', border: 'none',
            borderRadius: 12, padding: '8px 14px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Установить
        </button>
      </div>
    </div>
  );
}
