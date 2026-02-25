import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


const TOKEN_KEY = 'auth_token';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/auth?error=google_failed', { replace: true });
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    // Redirect to /app — AuthContext will pick up the token from localStorage
    navigate('/app', { replace: true });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center text-white">
        <svg className="w-12 h-12 animate-spin mx-auto mb-4 opacity-80" viewBox="0 0 24 24" fill="#fff"><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg>
        <p className="text-lg font-medium">Входим через Google...</p>
      </div>
    </div>
  );
}
