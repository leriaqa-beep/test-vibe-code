import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/auth?error=google_failed', { replace: true });
      return;
    }

    // Update AuthContext state before navigating so ProtectedRoute sees the user
    loginWithToken(token)
      .then(() => navigate('/app', { replace: true }))
      .catch(() => navigate('/auth?error=google_failed', { replace: true }));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <img
          src="/assets/mascot/mascot-think.png"
          alt="Загрузка"
          style={{
            width: '80px',
            height: '80px',
            display: 'block',
            margin: '0 auto 16px',
            animation: 'mascot-pulse 2s ease-in-out infinite',
          }}
        />
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          color: 'var(--text-primary)',
          fontWeight: 600,
        }}>
          Входим через Google...
        </p>
      </div>
      <style>{`
        @keyframes mascot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
