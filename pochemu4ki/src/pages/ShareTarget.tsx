import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SHARE_CACHE = 'pochemu4ki-share-v1';
const SHARE_KEY = '/shared-hero-image';
const SESSION_KEY = 'pendingHeroImageUrl';

export default function ShareTarget() {
  const navigate = useNavigate();
  const { children, loadChildren } = useApp();

  useEffect(() => {
    async function handle() {
      // Make sure children are loaded
      if (children.length === 0) await loadChildren();

      // Try to read the shared image from Cache API
      try {
        const cache = await caches.open(SHARE_CACHE);
        const response = await cache.match(SHARE_KEY);
        if (response) {
          const blob = await response.blob();
          if (blob.size > 0) {
            const objectUrl = URL.createObjectURL(blob);
            sessionStorage.setItem(SESSION_KEY, objectUrl);
          }
          await cache.delete(SHARE_KEY);
        }
      } catch (_) { /* cache not supported */ }

      // Navigate: if exactly one child — go straight to new story
      const updated = children.length > 0 ? children : [];
      if (updated.length === 1) {
        navigate(`/app/children/${updated[0].id}/story`, { replace: true });
      } else {
        // Dashboard shows the pending image hint via sessionStorage
        navigate('/app', { replace: true });
      }
    }

    handle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      fontFamily: 'var(--font-display)',
      color: 'var(--text-secondary)',
      fontSize: 16,
    }}>
      <div style={{ textAlign: 'center' }}>
        <img
          src="/assets/mascot/mascot-think.png"
          alt=""
          style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 16,
            animation: 'bookMascotFloat 3s ease-in-out infinite' }}
        />
        <p>Открываем приложение…</p>
      </div>
    </div>
  );
}
