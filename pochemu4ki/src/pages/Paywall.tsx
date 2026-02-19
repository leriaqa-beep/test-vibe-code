import { useNavigate } from 'react-router-dom';
import { Crown, Shield, RotateCcw, Users } from 'lucide-react';
import { useApp } from '../context';

const FEATURES = [
  '✨ Безлимитные сказки каждый день',
  '🎨 Красивые иллюстрации к каждой сказке',
  '🦄 Все волшебные помощники',
  '📚 Персональная библиотека',
  '🎤 Голосовой ввод вопросов',
  '❤️ Сохранение любимых сказок',
];

const AVATARS = ['👩', '👨', '👩‍🦱', '👱'];

export default function Paywall() {
  const navigate = useNavigate();
  const { profile, activatePremium } = useApp();

  const handleSubscribe = () => {
    // Phase 1 demo: activate immediately
    activatePremium();
    navigate('/premium-success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="text-7xl animate-bounce mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Вау! {profile?.name} обожает сказки!
          </h1>
          <p className="text-gray-600 mb-2">Вы использовали все 3 бесплатные истории</p>
          <button onClick={() => navigate('/pricing')} className="text-sm text-purple-600 underline">
            Смотреть все тарифы →
          </button>
        </div>

        {/* Social proof */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {AVATARS.map((av, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-lg">
                {av}
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">2,487+ счастливых семей</p>
            <p className="text-xs text-yellow-500">⭐⭐⭐⭐⭐ 4.9 из 5 звёзд</p>
          </div>
        </div>

        {/* Offer card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white mb-4 shadow-xl">
          <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
            🎁 СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Crown className="h-7 w-7 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm opacity-80">Premium подписка</p>
              <p className="font-bold text-lg">Безлимит волшебства</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">299₽</span>
              <span className="opacity-70">/месяц</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm line-through opacity-60">599₽</span>
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">-50%</span>
            </div>
            <p className="text-xs opacity-70 mt-1">Это всего 10₽ в день — дешевле кофе!</p>
          </div>

          <div className="space-y-2 mb-5">
            {FEATURES.map((f, i) => (
              <p key={i} className="text-sm flex items-center gap-2">
                <span className="text-green-300">✓</span>
                {f}
              </p>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full py-4 bg-white text-purple-700 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-colors shadow-lg active:scale-98"
          >
            Попробовать 7 дней бесплатно
          </button>
          <p className="text-center text-xs opacity-60 mt-2">Отменить можно в любой момент</p>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { icon: Shield, label: 'Безопасная оплата', emoji: '🔒' },
            { icon: RotateCcw, label: 'Возврат 14 дней', emoji: '✅' },
            { icon: Users, label: '2K+ семей', emoji: '👨‍👩‍👧' },
          ].map((badge, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <p className="text-xs text-gray-600 font-medium">{badge.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/app')}
          className="w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors py-2"
        >
          Продолжить с бесплатной версией
        </button>
      </div>
    </div>
  );
}
