import { useNavigate } from 'react-router-dom';
import { BookOpen, Mic, Star, Heart, Sparkles, ChevronRight, Check, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: '🧒',
    title: 'Персонализированные истории',
    desc: 'Каждая сказка создана специально для вашего ребёнка: с его именем, любимыми игрушками и героями.',
  },
  {
    icon: '🎤',
    title: 'Голосовой ввод',
    desc: 'Ребёнок задаёт вопрос голосом — мы записываем и превращаем в сказку. Никаких сложностей!',
  },
  {
    icon: '🔮',
    title: 'Ответы через волшебство',
    desc: 'Сложные вопросы о мире объясняются через увлекательные сказки на понятном языке.',
  },
  {
    icon: '📚',
    title: 'Библиотека историй',
    desc: 'Все созданные сказки сохраняются. Можно перечитывать любимые и оценивать их.',
  },
];

const steps = [
  { num: '1', title: 'Расскажите о ребёнке', desc: 'Имя, возраст, любимые игрушки и герои — для максимальной персонализации.' },
  { num: '2', title: 'Задайте вопрос', desc: 'Голосом или текстом — что сегодня интересует ребёнка или какую ситуацию нужно разобрать.' },
  { num: '3', title: 'Получите сказку', desc: 'Через несколько секунд готова уникальная история с вашими персонажами и ответом на вопрос.' },
];

const plans = [
  {
    name: 'Бесплатно',
    price: '0',
    period: '',
    storiesLimit: '3 истории',
    features: ['3 истории в месяц', 'Голосовой ввод', 'Персонализация', 'Библиотека историй'],
    cta: 'Начать бесплатно',
    highlight: false,
  },
  {
    name: 'Премиум',
    price: '299',
    period: '/мес',
    storiesLimit: 'Безлимитно',
    features: ['Безлимитные истории', 'Голосовой ввод', 'Персонализация', 'Библиотека историй', 'Иллюстрации к сказкам*', 'Создание книг*'],
    cta: 'Попробовать 7 дней бесплатно',
    highlight: true,
  },
  {
    name: 'Семейный',
    price: '499',
    period: '/мес',
    storiesLimit: 'До 5 детей',
    features: ['До 5 профилей детей', 'Безлимитные истории', 'Все функции Премиум', 'Голосовая озвучка*', 'Общая библиотека'],
    cta: 'Выбрать',
    highlight: false,
  },
];

const testimonials = [
  { name: 'Мария, мама Сони (4 года)', text: 'Соня каждый вечер просит: «Мама, задай ещё вопрос!» Теперь мы объясняем всё через сказки с её любимой куклой Малинкой.', emoji: '👩' },
  { name: 'Алексей, папа Миши (6 лет)', text: 'Сын спросил «почему люди умирают» — я растерялся. Приложение создало мягкую, добрую сказку, которая помогла ему понять.', emoji: '👨' },
  { name: 'Екатерина, мама Лизы (5 лет)', text: 'Дочка боялась темноты. После трёх сказок с её зайкой Пушинкой она перестала бояться — теперь засыпает сама!', emoji: '👩‍🦰' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold text-purple-700">Почемучки</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-purple-600 font-medium hover:text-purple-800 transition-colors"
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              Попробовать бесплатно
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">⭐</div>
          <div className="absolute top-20 right-20 text-6xl">🌙</div>
          <div className="absolute bottom-20 left-1/4 text-7xl">🌈</div>
          <div className="absolute bottom-10 right-10 text-5xl">✨</div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Более 1000 историй создано родителями</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Магические сказки<br />
            <span className="text-yellow-300">для вашего почемучки</span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Персонализированные истории с любимыми игрушками вашего ребёнка,
            которые отвечают на его вопросы и помогают понять мир.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="bg-white text-purple-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-yellow-50 transition-colors flex items-center gap-2 shadow-lg"
            >
              Попробовать бесплатно
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-purple-200 text-sm">3 истории бесплатно, без карты</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-10">
          <div className="bg-white/20 backdrop-blur rounded-2xl p-6 flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-purple-200 text-sm">историй создано</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-purple-200 text-sm">довольных семей</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9 ★</div>
              <div className="text-purple-200 text-sm">средняя оценка</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Почему родители выбирают Почемучки?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Мы знаем, что дети от 3 до 8 лет задают сотни вопросов в день.
              Наше приложение помогает отвечать на них красиво и понятно.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 flex gap-4">
                <div className="text-4xl flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Как это работает?
            </h2>
            <p className="text-gray-600 text-lg">Три простых шага до волшебной сказки</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute translate-x-full translate-y-[-50%]" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="bg-purple-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Начать прямо сейчас
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-14">
            Что говорят родители
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-4 italic">«{t.text}»</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-sm font-medium text-gray-600">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Тарифы</h2>
            <p className="text-gray-600 text-lg">Начните бесплатно, развивайтесь вместе с нами</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 ${p.highlight
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl scale-105'
                  : 'bg-white border border-purple-100'
                }`}
              >
                {p.highlight && (
                  <div className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                    <Zap className="w-3 h-3" /> Популярный
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${p.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {p.price === '0' ? 'Бесплатно' : `${p.price}₽`}
                  </span>
                  {p.period && <span className={p.highlight ? 'text-purple-200' : 'text-gray-500'}>{p.period}</span>}
                </div>
                <div className={`text-sm font-medium mb-4 ${p.highlight ? 'text-purple-200' : 'text-purple-600'}`}>
                  {p.storiesLimit}
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${p.highlight ? 'text-green-300' : 'text-green-500'}`} />
                      <span className={p.highlight ? 'text-purple-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/auth?mode=register')}
                  className={`w-full py-3 rounded-full font-semibold transition-colors ${p.highlight
                    ? 'bg-white text-purple-700 hover:bg-yellow-50'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">* Функции в разработке, скоро появятся!</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">✨</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Начните сегодня бесплатно
          </h2>
          <p className="text-purple-200 text-lg mb-8">
            3 истории бесплатно. Никакой карты. Никакой регистрации с барьерами.
          </p>
          <button
            onClick={() => navigate('/auth?mode=register')}
            className="bg-white text-purple-700 px-10 py-4 rounded-full text-lg font-bold hover:bg-yellow-50 transition-colors"
          >
            Создать первую сказку
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">✨</span>
          <span className="font-semibold text-purple-700">Почемучки</span>
        </div>
        <p>© 2024 Почемучки. Магия историй для любопытных детей.</p>
      </footer>
    </div>
  );
}
