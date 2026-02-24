import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

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
        <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4 opacity-80" />
        <p className="text-lg font-medium">Входим через Google...</p>
      </div>
    </div>
  );
}
