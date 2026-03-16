import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src="/assets/mascot/mascot-think.png"
            alt=""
            style={{ width: '64px', height: '64px', display: 'block', margin: '0 auto 12px', animation: 'mascot-pulse 2s ease-in-out infinite' }}
          />
          <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', fontWeight: 600 }}>Загрузка...</p>
        </div>
        <style>{`@keyframes mascot-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.8} }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}
