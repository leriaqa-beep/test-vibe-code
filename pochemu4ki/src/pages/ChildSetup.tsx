import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';
import DecorationLayer from '../components/Decorations';

const BASE_HEROES = [
  { name: 'Единорог Радуга', emoji: '🦄' },
  { name: 'Мудрая Сова', emoji: '🦉' },
  { name: 'Добрый Дракон', emoji: '🐉' },
  { name: 'Фея Звёздочка', emoji: '🧚' },
  { name: 'Храбрый Лев', emoji: '🦁' },
  { name: 'Волшебный Кот', emoji: '🐱' },
];

const INTERESTS = [
  { label: 'Динозавры', emoji: '🦕' },
  { label: 'Космос', emoji: '🚀' },
  { label: 'Животные', emoji: '🐘' },
  { label: 'Принцессы', emoji: '👸' },
  { label: 'Машины', emoji: '🚗' },
  { label: 'Роботы', emoji: '🤖' },
  { label: 'Природа', emoji: '🌿' },
  { label: 'Море', emoji: '🌊' },
  { label: 'Супергерои', emoji: '🦸' },
  { label: 'Музыка', emoji: '🎵' },
];

const TOY_TYPES = ['мишка', 'зайка', 'кукла', 'динозавр', 'котёнок', 'собачка', 'дракон', 'принцесса', 'машинка', 'другое'];

interface ToyForm {
  id: string;
  nickname: string;
  type: string;
  description: string;
}

export default function ChildSetup() {
  const navigate = useNavigate();
  const { addChild } = useApp();

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Step 1 — Name
  const [name, setName] = useState('');

  // Step 2 — Age & Gender
  const [age, setAge] = useState(5);
  const [gender, setGender] = useState<'boy' | 'girl' | null>(null);

  // Step 3 — Hero
  const [hero, setHero] = useState<{ name: string; emoji: string } | null>(null);

  // Step 4 — Toys
  const [toys, setToys] = useState<ToyForm[]>([]);
  const [toyForm, setToyForm] = useState<ToyForm>({ id: '', nickname: '', type: 'мишка', description: '' });
  const [addingToy, setAddingToy] = useState(false);

  // Step 5 — Interests
  const [interests, setInterests] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  const canNext = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return gender !== null;
    if (step === 3) return hero !== null;
    if (step === 4) return true; // toys optional
    if (step === 5) return true;
    return false;
  };

  const addToy = () => {
    if (!toyForm.nickname.trim()) return;
    setToys(prev => [...prev, { ...toyForm, id: uuidv4() }]);
    setToyForm({ id: '', nickname: '', type: 'мишка', description: '' });
    setAddingToy(false);
  };

  const removeToy = (id: string) => setToys(prev => prev.filter(t => t.id !== id));

  const toggleInterest = (label: string) => {
    setInterests(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const handleFinish = async () => {
    if (!hero || !gender) return;
    setSaving(true);
    try {
      const child = await addChild({
        name: name.trim(),
        age,
        gender,
        hero,
        toys,
        interests,
      });
      navigate(`/app/children/${child.id}/story`);
    } catch {
      setSaving(false);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)' }}
    >
      <DecorationLayer preset="minimal" />
      {/* Progress bar */}
      <div className="h-1" style={{ background: 'var(--accent-primary-100)' }}>
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <p className="text-xs text-purple-400 font-medium">Шаг {step} из {TOTAL_STEPS}</p>
            <p className="text-sm text-purple-700 font-semibold">Профиль ребёнка</p>
          </div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Как зовут вашего ребёнка? 👶</h2>
            <p className="text-text-secondary mb-6">Это имя будет главным героем всех сказок</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Соня, Миша, Лиза..."
              className="w-full border-2 border-purple-200 rounded-2xl px-5 py-4 text-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-purple-500 transition bg-white"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Age & Gender */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Расскажите о {name} 📝</h2>
            <p className="text-text-secondary mb-6">Это поможет создавать сказки по возрасту</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-text-primary mb-3">Возраст: {age} лет</label>
              <input
                type="range"
                min={3} max={8} value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>3 года</span><span>8 лет</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-3">Пол</label>
              <div className="grid grid-cols-2 gap-3">
                {(['girl', 'boy'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-4 rounded-2xl text-2xl border-2 transition flex flex-col items-center gap-1 ${gender === g ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}
                  >
                    <span>{g === 'girl' ? '👧' : '👦'}</span>
                    <span className="text-sm font-medium text-text-primary">{g === 'girl' ? 'Девочка' : 'Мальчик'}</span>
                    {gender === g && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Hero */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Любимый герой {name} ✨</h2>
            <p className="text-text-secondary mb-6">Этот персонаж будет помогать в каждой сказке</p>
            <div className="grid grid-cols-2 gap-3">
              {BASE_HEROES.map(h => (
                <button
                  key={h.name}
                  onClick={() => setHero(h)}
                  className={`py-4 px-3 rounded-2xl border-2 transition flex flex-col items-center gap-1 ${hero?.name === h.name ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}
                >
                  <span className="text-3xl">{h.emoji}</span>
                  <span className="text-xs font-medium text-text-primary text-center">{h.name}</span>
                  {hero?.name === h.name && <Check className="w-4 h-4 text-purple-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Toys */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Любимые игрушки {name} 🧸</h2>
            <p className="text-text-secondary mb-6">Они станут персонажами сказок! Можно пропустить</p>

            {/* Toys list */}
            {toys.length > 0 && (
              <div className="space-y-2 mb-4">
                {toys.map(t => (
                  <div key={t.id} className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between border border-purple-100">
                    <div>
                      <span className="font-semibold text-text-primary">{t.nickname}</span>
                      <span className="text-text-secondary text-sm"> — {t.type}</span>
                      {t.description && <p className="text-xs text-text-muted">{t.description}</p>}
                    </div>
                    <button onClick={() => removeToy(t.id)} className="text-red-400 hover:text-red-600 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add toy form */}
            {addingToy ? (
              <div className="bg-white rounded-2xl p-4 border-2 border-purple-300 space-y-3">
                <input
                  type="text"
                  placeholder="Кличка (Пушинка, Малинка...)"
                  value={toyForm.nickname}
                  onChange={e => setToyForm(f => ({ ...f, nickname: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  autoFocus
                />
                <select
                  value={toyForm.type}
                  onChange={e => setToyForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {TOY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Описание (серый плюшевый, розовая...)"
                  value={toyForm.description}
                  onChange={e => setToyForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addToy}
                    className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 transition"
                  >
                    Добавить
                  </button>
                  <button
                    onClick={() => setAddingToy(false)}
                    className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingToy(true)}
                className="w-full border-2 border-dashed border-purple-300 rounded-2xl py-4 text-purple-600 font-medium flex items-center justify-center gap-2 hover:bg-purple-50 transition"
              >
                <Plus className="w-5 h-5" />
                Добавить игрушку
              </button>
            )}
          </div>
        )}

        {/* Step 5: Interests */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Интересы {name} 🎯</h2>
            <p className="text-text-secondary mb-6">Выберите темы, которые нравятся ребёнку (можно несколько)</p>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map(item => (
                <button
                  key={item.label}
                  onClick={() => toggleInterest(item.label)}
                  className={`py-3 px-4 rounded-2xl border-2 transition flex items-center gap-2 ${interests.includes(item.label) ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}
                >
                  <span>{item.emoji}</span>
                  <span className="text-sm font-medium text-text-primary">{item.label}</span>
                  {interests.includes(item.label) && <Check className="w-4 h-4 text-purple-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Next / Finish button */}
        <div className="mt-8">
          {step === 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/app')}
                className="py-4 rounded-2xl font-semibold text-lg border-2 border-purple-200 text-purple-600 hover:bg-purple-50 transition flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Назад
              </button>
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 flex items-center justify-center gap-2 transition-all duration-200"
              >
                Далее <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          ) : step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 flex items-center justify-center gap-2 transition-all duration-200"
            >
              Далее <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 flex items-center justify-center gap-2 transition-all duration-200"
            >
              {saving ? '✨ Создаём профиль...' : '🎉 Готово! Создать первую сказку'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
