import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context';

const PLANS = [
  {
    id: 'monthly',
    icon: '⭐',
    name: 'Базовая подписка',
    price: 299,
    period: 'месяц',
    popular: false,
    features: [
      'Безлимитные сказки',
      'Персонализация',
      'Все иллюстрации',
      'Библиотека историй',
      'До 3 профилей детей',
      'Email поддержка',
    ],
  },
  {
    id: 'annual',
    icon: '💎',
    name: 'Годовая подписка',
    price: 2990,
    period: 'год',
    originalPrice: 3588,
    savings: 598,
    popular: true,
    features: [
      'Всё из Базовой',
      'Озвучка сказок (скоро)',
      'Интерактивные истории',
      'Приоритетная генерация',
      'Приоритетная поддержка',
    ],
  },
  {
    id: 'book',
    icon: '📚',
    name: 'Подписка + Книга',
    price: 599,
    period: 'месяц',
    popular: false,
    features: [
      'Всё из Базовой',
      '1 печатная книга в месяц',
      'Твёрдая обложка А4',
      'До 5 любимых сказок',
      'Качественная печать',
      'Бесплатная доставка',
    ],
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧‍👦',
    name: 'Семейная подписка',
    price: 499,
    period: 'месяц',
    popular: false,
    features: [
      'Всё из Базовой',
      'До 5 профилей детей',
      'Семейная библиотека',
      'Статистика по детям',
      'Персональные рекомендации',
      'Контроль контента',
    ],
  },
];

const FAQ = [
  { q: 'Можно ли отменить подписку?', a: 'Да, вы можете отменить в любой момент без штрафов. Доступ сохраняется до конца оплаченного периода.' },
  { q: 'Как получить печатную книгу?', a: 'Мы отправляем книгу каждый месяц. Вы выбираете 5 любимых сказок, и мы красиво печатаем их для вас.' },
  { q: 'Что включает семейная подписка?', a: 'Вы можете создать до 5 профилей с разными именами, возрастами и интересами для каждого ребёнка.' },
  { q: 'Есть ли пробный период?', a: 'Да! При первой подписке вы получаете 7 дней бесплатно. Списание начнётся только на 8-й день.' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { activatePremium } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = () => {
    activatePremium();
    navigate('/premium-success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-purple-600 mb-6 font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          Вернуться назад
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Выберите свой тариф</h1>
          <p className="text-gray-500">Все планы включают безлимитные сказки</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-5 border-2 transition-all ${
                plan.popular
                  ? 'border-purple-500 ring-4 ring-purple-100 shadow-lg'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full inline-block mb-3">
                  ⭐ САМЫЙ ПОПУЛЯРНЫЙ
                </div>
              )}
              <div className="text-3xl mb-2">{plan.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-gray-900">{plan.price.toLocaleString('ru-RU')}₽</span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>
              {plan.originalPrice && (
                <p className="text-xs text-gray-400 mb-1">
                  <span className="line-through">{plan.originalPrice.toLocaleString('ru-RU')}₽</span>
                  {' '}
                  <span className="text-green-600 font-medium">Экономия {plan.savings?.toLocaleString('ru-RU')}₽</span>
                </p>
              )}
              <ul className="mt-3 space-y-1.5 mb-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleSubscribe}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Выбрать план
              </button>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-8">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">Сравнение планов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 text-gray-600 font-medium w-1/2">Функция</th>
                  <th className="p-3 text-center text-gray-600 font-medium">Бесплатно</th>
                  <th className="p-3 text-center text-purple-600 font-bold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Сказки в месяц', '3', '∞'],
                  ['Персонализация', '✓', '✓'],
                  ['Голосовой ввод', '✓', '✓'],
                  ['Иллюстрации', '✗', '✓'],
                  ['Библиотека', '✗', '✓'],
                  ['Несколько профилей', '✗', '✓'],
                  ['Поддержка', '✗', '✓'],
                ].map(([feat, free, premium], i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="p-3 text-gray-700">{feat}</td>
                    <td className="p-3 text-center text-gray-500">{free}</td>
                    <td className={`p-3 text-center font-medium ${premium === '✓' || premium === '∞' ? 'text-green-600' : 'text-red-400'}`}>
                      {premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">Часто задаваемые вопросы</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 text-sm">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-50">
                    <p className="pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
