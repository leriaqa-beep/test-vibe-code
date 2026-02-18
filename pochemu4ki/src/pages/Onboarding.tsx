import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context';
import type { CustomHero, Profile } from '../types';

const BASE_HEROES = [
  { name: 'Единорог Радуга', emoji: '🦄' },
  { name: 'Мудрая Сова', emoji: '🦉' },
  { name: 'Добрый Дракон', emoji: '🐉' },
  { name: 'Фея Звёздочка', emoji: '🧚' },
  { name: 'Храбрый Рыцарь', emoji: '⚔️' },
];

const INTERESTS = [
  { label: 'динозавры', emoji: '🦕' },
  { label: 'космос', emoji: '🚀' },
  { label: 'животные', emoji: '🐾' },
  { label: 'принцессы', emoji: '👸' },
  { label: 'машины', emoji: '🚗' },
  { label: 'роботы', emoji: '🤖' },
  { label: 'природа', emoji: '🌳' },
  { label: 'море', emoji: '🌊' },
];

const HERO_EMOJIS = ['🧸','🐻','🐰','🦁','🐶','🐱','🦄','🐉','🤖','🚀','👑','⚽'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile, addCustomHero, removeCustomHero, customHeroes } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('');
  const [selectedHero, setSelectedHero] = useState('');
  const [selectedHeroEmoji, setSelectedHeroEmoji] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // Custom hero modal
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [heroType, setHeroType] = useState('');
  const [heroName, setHeroName] = useState('');
  const [heroEmoji, setHeroEmoji] = useState('🧸');

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const canContinue = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return gender !== '';
    if (step === 4) return selectedHero !== '';
    if (step === 5) return interests.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      // Complete onboarding
      const profile: Profile = {
        name: name.trim(),
        age,
        gender: gender as 'boy' | 'girl',
        hero: selectedHero,
        heroEmoji: selectedHeroEmoji,
        interests,
        createdAt: new Date().toISOString(),
      };
      setProfile(profile);
      navigate('/first-story');
    }
  };

  const handleSkip = () => {
    const profile: Profile = {
      name: name.trim() || 'Малыш',
      age,
      gender: (gender as 'boy' | 'girl') || 'boy',
      hero: selectedHero || 'Единорог Радуга',
      heroEmoji: selectedHeroEmoji || '🦄',
      interests: interests.length > 0 ? interests : ['животные'],
      createdAt: new Date().toISOString(),
    };
    setProfile(profile);
    navigate('/app');
  };

  const handleAddCustomHero = () => {
    if (!heroType.trim() || !heroName.trim()) return;
    const hero: Omit<CustomHero, 'id' | 'isCustom'> = {
      name: `${heroType.trim()} ${heroName.trim()}`,
      emoji: heroEmoji,
      description: heroType.trim(),
    };
    addCustomHero(hero);
    setHeroType('');
    setHeroName('');
    setHeroEmoji('🧸');
    setShowHeroModal(false);
  };

  const toggleInterest = (label: string) => {
    setInterests(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-3xl font-bold text-purple-700">Почемучки</span>
            <p className="text-sm text-gray-500 mt-1">Шаг {step} из {totalSteps}</p>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Как зовут твоего ребёнка? 👋
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Все сказки будут персонализированы специально для него
              </p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Например: Маша"
                className="w-full px-4 py-4 text-xl border-2 border-purple-200 rounded-2xl focus:border-purple-500 bg-white transition-colors"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && canContinue() && handleNext()}
              />
            </div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Сколько лет {name}? 🎂
              </h2>
              <p className="text-gray-500 text-center mb-8">
                Сказки будут подобраны по возрасту
              </p>
              <div className="text-center mb-6">
                <span className="text-6xl font-bold text-purple-600">{age}</span>
                <span className="text-2xl text-gray-500 ml-2">лет</span>
              </div>
              <input
                type="range"
                min={3}
                max={8}
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>3 года</span>
                <span>8 лет</span>
              </div>
            </div>
          )}

          {/* Step 3: Gender */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Кто такой {name}? ✨
              </h2>
              <p className="text-gray-500 text-center mb-8">
                Это поможет сделать сказки ещё интереснее
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'girl', emoji: '👧', label: 'Девочка' },
                  { value: 'boy', emoji: '👦', label: 'Мальчик' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGender(opt.value as 'boy' | 'girl')}
                    className={`p-8 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      gender === opt.value
                        ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:scale-102'
                    }`}
                  >
                    <span className="text-5xl">{opt.emoji}</span>
                    <span className="text-lg font-semibold text-gray-700">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Hero */}
          {step === 4 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Волшебный помощник ✨
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Этот герой будет помогать {name} в сказках
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {BASE_HEROES.map(hero => (
                  <button
                    key={hero.name}
                    onClick={() => { setSelectedHero(hero.name); setSelectedHeroEmoji(hero.emoji); }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      selectedHero === hero.name
                        ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <span className="text-3xl">{hero.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 text-left">{hero.name}</span>
                  </button>
                ))}

                {customHeroes.map(hero => (
                  <button
                    key={hero.id}
                    onClick={() => { setSelectedHero(hero.name); setSelectedHeroEmoji(hero.emoji); }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 relative ${
                      selectedHero === hero.name
                        ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <span className="text-3xl">{hero.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 text-left">{hero.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); removeCustomHero(hero.id); if (selectedHero === hero.name) { setSelectedHero(''); setSelectedHeroEmoji(''); } }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <X className="h-3 w-3 text-red-500" />
                    </button>
                  </button>
                ))}

                <button
                  onClick={() => setShowHeroModal(true)}
                  className="p-4 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 transition-all flex items-center gap-3"
                >
                  <span className="text-3xl">➕</span>
                  <span className="text-sm font-medium text-purple-600">Своя игрушка</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Interests */}
          {step === 5 && (
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Что интересно {name}? 🌟
              </h2>
              <p className="text-gray-500 text-center mb-6">
                Выбери всё, что нравится (можно несколько)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map(item => (
                  <button
                    key={item.label}
                    onClick={() => toggleInterest(item.label)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      interests.includes(item.label)
                        ? 'border-purple-500 bg-purple-50 scale-105 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleNext}
              disabled={!canContinue()}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                canContinue()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-101 active:scale-99'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === totalSteps ? (
                <>
                  Начать волшебство!
                  <Sparkles className="h-5 w-5" />
                </>
              ) : (
                <>
                  Продолжить
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>

            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 py-3 px-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад
                </button>
              )}
              {step < totalSteps && (
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 rounded-2xl text-gray-400 font-medium hover:text-gray-600 transition-colors text-sm"
                >
                  Пропустить настройку
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Hero Modal */}
      {showHeroModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-bounce-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Своя игрушка</h3>
              <button onClick={() => setShowHeroModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Выбери эмодзи для игрушки:</p>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {HERO_EMOJIS.map(em => (
                <button
                  key={em}
                  onClick={() => setHeroEmoji(em)}
                  className={`p-2 rounded-xl text-2xl transition-all ${
                    heroEmoji === em ? 'bg-purple-100 scale-110 ring-2 ring-purple-400' : 'hover:bg-gray-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={heroType}
              onChange={e => setHeroType(e.target.value)}
              placeholder="Кто это? (например: Кошка)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-3 focus:border-purple-400 text-sm"
            />
            <input
              type="text"
              value={heroName}
              onChange={e => setHeroName(e.target.value)}
              placeholder="Как зовут? (например: Пушинка)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:border-purple-400 text-sm"
            />

            {heroType && heroName && (
              <p className="text-center text-sm text-purple-600 font-medium mb-3">
                {heroEmoji} {heroType} {heroName}
              </p>
            )}

            <button
              onClick={handleAddCustomHero}
              disabled={!heroType.trim() || !heroName.trim()}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                heroType.trim() && heroName.trim()
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Добавить героя
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
