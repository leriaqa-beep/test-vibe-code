import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    id: 'free',
    icon: '🎁',
    name: 'Бесплатно',
    price: 0,
    period: '',
    storiesLimit: '3 истории',
    features: [
      '3 истории в месяц',
      'Голосовой ввод',
      'Персонализация с именем',
      'Библиотека историй',
    ],
    highlight: false,
  },
  {
    id: 'premium',
    icon: '⭐',
    name: 'Премиум',
    price: 299,
    period: '/мес',
    storiesLimit: 'Безлимитно',
    features: [
      'Безлимитные истории',
      'Голосовой ввод',
      'Полная персонализация с игрушками',
      'Библиотека всех историй',
      'Иллюстрации к сказкам*',
      'Создание книг из историй*',
      'Приоритетная поддержка',
    ],
    highlight: true,
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧‍👦',
    name: 'Семейный',
    price: 499,
    period: '/мес',
    storiesLimit: 'До 5 детей',
    features: [
      'До 5 профилей детей',
      'Безлимитные истории',
      'Все функции Премиум',
      'Голосовая озвучка голосом близких*',
      'Общая семейная библиотека',
      'Печать книг со скидкой*',
    ],
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = (planId: string) => {
    if (planId === 'free') {
      navigate('/app');
      return;
    }
    // Demo: show coming soon
    alert('Оплата скоро появится! Пока вы можете использовать бесплатную версию.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Тарифы</h1>
            <p className="text-sm text-gray-500">Выберите подходящий план</p>
          </div>
        </div>

        {/* Limit warning */}
        {!user?.isPremium && (user?.storiesUsed || 0) >= 3 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5">
            <p className="text-orange-800 font-medium text-sm">
              🔒 Вы использовали все бесплатные истории. Оформите подписку для продолжения.
            </p>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-4 mb-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-6 border-2 transition ${plan.highlight ? 'border-purple-500 shadow-lg shadow-purple-100' : 'border-gray-100'}`}
            >
              {plan.highlight && (
                <div className="flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
                  <Zap className="w-3 h-3" /> Самый популярный
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{plan.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-purple-600 font-medium">{plan.storiesLimit}</p>
                  </div>
                </div>
                <div className="text-right">
                  {plan.price === 0 ? (
                    <span className="text-2xl font-bold text-gray-900">Бесплатно</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">{plan.price}₽</span>
                      <span className="text-gray-500">{plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan.id)}
                disabled={plan.id === 'free' && !user?.isPremium && false}
                className={`w-full py-3 rounded-2xl font-semibold transition ${plan.highlight
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                  : plan.id === 'free'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {plan.id === 'free'
                  ? (user?.isPremium ? 'Ваш план' : 'Продолжить бесплатно')
                  : plan.highlight
                    ? 'Попробовать 7 дней бесплатно'
                    : 'Выбрать план'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-xs">
          * Функции в разработке, скоро появятся! Оформив подписку сейчас, вы получите их первыми.
        </p>
      </div>
    </div>
  );
}
