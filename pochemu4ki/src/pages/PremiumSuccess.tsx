import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useApp } from '../context';

export default function PremiumSuccess() {
  const navigate = useNavigate();
  const { profile } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/app');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="flex justify-center mb-6">
          <Crown className="h-24 w-24 animate-bounce text-yellow-200" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Поздравляем! 🎉</h1>
        <h2 className="text-2xl font-semibold mb-4">Premium подписка активирована</h2>
        <p className="text-lg opacity-90 mb-8">
          Теперь безлимит волшебных сказок для {profile?.name}!
        </p>
        <div className="flex justify-center">
          <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
        <p className="text-sm opacity-70 mt-4">Перенаправляем на главную...</p>
      </div>
    </div>
  );
}
