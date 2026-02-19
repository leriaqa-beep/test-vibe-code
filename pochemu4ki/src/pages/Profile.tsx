import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import { useApp } from '../context';
import type { Profile as ProfileType } from '../types';
import BottomNav from '../components/BottomNav';

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

export default function Profile() {
  const { profile, setProfile, customHeroes, isPremium } = useApp();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age || 5);
  const [hero, setHero] = useState(profile?.hero || '');
  const [heroEmoji, setHeroEmoji] = useState(profile?.heroEmoji || '');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAge(profile.age);
      setHero(profile.hero);
      setHeroEmoji(profile.heroEmoji);
      setInterests(profile.interests);
    }
  }, [profile]);

  const toggleInterest = (label: string) => {
    setInterests(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);
  };

  const handleSave = () => {
    if (!profile) return;
    const updated: ProfileType = {
      ...profile,
      name: name.trim() || profile.name,
      age,
      hero,
      heroEmoji,
      interests,
    };
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const allHeroes = [
    ...BASE_HEROES,
    ...customHeroes.map(h => ({ name: h.name, emoji: h.emoji })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-800">Профиль</h1>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Premium badge */}
        {isPremium && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-white flex items-center gap-3">
            <Crown className="h-8 w-8" />
            <div>
              <p className="font-bold">Premium активен ✨</p>
              <p className="text-sm opacity-90">Безлимитные сказки и все функции</p>
            </div>
          </div>
        )}

        {/* Name */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Имя ребёнка</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 transition-colors"
          />
        </div>

        {/* Age */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Возраст</label>
          <div className="text-center mb-3">
            <span className="text-4xl font-bold text-purple-600">{age}</span>
            <span className="text-lg text-gray-500 ml-2">лет</span>
          </div>
          <input
            type="range"
            min={3}
            max={8}
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3 года</span>
            <span>8 лет</span>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Волшебный помощник</label>
          <div className="grid grid-cols-2 gap-2">
            {allHeroes.map(h => (
              <button
                key={h.name}
                onClick={() => { setHero(h.name); setHeroEmoji(h.emoji); }}
                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                  hero === h.name ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="text-2xl">{h.emoji}</span>
                <span className="text-xs font-medium text-gray-700 text-left">{h.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Интересы</label>
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map(item => (
              <button
                key={item.label}
                onClick={() => toggleInterest(item.label)}
                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                  interests.includes(item.label)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.01]'
          }`}
        >
          {saved ? '✓ Сохранено!' : 'Сохранить изменения'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
