import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Trash2, ChevronRight, ChevronLeft, Check,
  User,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';
import DecorationLayer from '../components/Decorations';
import { declineName, prepositionO } from '../utils/declineName';

const BASE_HEROES = [
  { name: 'Единорог Радуга', emoji: '🦄', image: '/heroes/unicorn.png', gradient: 'from-purple-100 to-pink-100'  },
  { name: 'Мудрая Сова',     emoji: '🦉', image: '/heroes/owl.png',     gradient: 'from-amber-100 to-yellow-100' },
  { name: 'Добрый Дракон',   emoji: '🐉', image: '/heroes/dragon.png',  gradient: 'from-red-100 to-orange-100'   },
  { name: 'Фея Звёздочка',   emoji: '🧚', image: '/heroes/fairy.png',   gradient: 'from-blue-100 to-cyan-100'    },
  { name: 'Храбрый Лев',     emoji: '🦁', image: '/heroes/lion.png',    gradient: 'from-amber-100 to-amber-200'  },
  { name: 'Волшебный Кот',   emoji: '🐱', image: '/heroes/cat.png',     gradient: 'from-indigo-100 to-purple-100'},
];

const INTERESTS = [
  { label: 'Динозавры', emoji: '🦕' },
  { label: 'Космос',    emoji: '🚀' },
  { label: 'Животные',  emoji: '🐘' },
  { label: 'Принцессы', emoji: '👸' },
  { label: 'Машины',    emoji: '🚗' },
  { label: 'Роботы',    emoji: '🤖' },
  { label: 'Природа',   emoji: '🌿' },
  { label: 'Море',      emoji: '🌊' },
  { label: 'Супергерои',emoji: '🦸' },
  { label: 'Музыка',    emoji: '🎵' },
];

const TOY_TYPES = ['мишка', 'зайка', 'кукла', 'динозавр', 'котёнок', 'собачка', 'дракон', 'принцесса', 'машинка', 'другое'];

interface ToyForm { id: string; nickname: string; type: string; description: string; }

export default function ChildEdit() {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const { children, loadChildren, updateChild } = useApp();

  const [step, setStep]     = useState(1);
  const TOTAL_STEPS         = 5;
  const [ready, setReady]   = useState(false);

  const [name, setName]     = useState('');
  const [age, setAge]       = useState(5);
  const [gender, setGender] = useState<'boy' | 'girl' | null>(null);
  const [hero, setHero]     = useState<{ name: string; emoji: string } | null>(null);
  const [toys, setToys]     = useState<ToyForm[]>([]);
  const [useToys, setUseToys]   = useState(true);
  const [toyForm, setToyForm]   = useState<ToyForm>({ id: '', nickname: '', type: 'мишка', description: '' });
  const [addingToy, setAddingToy] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load child data and pre-fill form
  useEffect(() => {
    const init = async () => {
      let list = children;
      if (list.length === 0) {
        await loadChildren();
        return; // will re-run via dependency change
      }
      const child = list.find(c => c.id === childId);
      if (!child) { navigate('/app/settings'); return; }

      setName(child.name);
      setAge(child.age);
      setGender(child.gender);
      setHero(child.hero);
      setToys(child.toys.map(t => ({ id: t.id, nickname: t.nickname, type: t.type, description: t.description })));
      setUseToys(child.useToys);
      setInterests(child.interests || []);
      setReady(true);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, children]);

  const canNext = () => {
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return gender !== null;
    if (step === 3) return hero !== null;
    return true;
  };

  const addToy = () => {
    if (!toyForm.nickname.trim()) return;
    setToys(prev => [...prev, { ...toyForm, id: uuidv4() }]);
    setToyForm({ id: '', nickname: '', type: 'мишка', description: '' });
    setAddingToy(false);
  };

  const toggleInterest = (label: string) =>
    setInterests(prev => prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]);

  const handleSave = async () => {
    if (!hero || !gender || !childId) return;
    setSaving(true);
    try {
      const raw = name.trim();
      const normalizedName = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      await updateChild(childId, { name: normalizedName, age, gender, hero, toys, useToys, interests });
      navigate('/app/settings');
    } catch {
      setSaving(false);
    }
  };

  const nameGen  = declineName(name, gender, 'родительный');
  const namePrep = declineName(name, gender, 'предложный');
  const prep     = prepositionO(namePrep);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden page-enter">
      <DecorationLayer preset="minimal" />

      <div className="max-w-lg mx-auto px-4 py-8 relative">

        {/* Progress segments */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < step ? 'bg-purple-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Step label */}
        <p className="text-xs text-gray-400 font-medium mb-1">Шаг {step} из {TOTAL_STEPS}</p>

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Имя ребёнка</h2>
            <p className="text-sm text-gray-500 mb-6">Это имя станет главным героем всех сказок</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Соня, Миша, Лиза..."
              className="w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl px-5 py-4 text-lg text-gray-900 placeholder-gray-400 focus:outline-none transition bg-white"
              autoFocus
            />
          </div>
        )}

        {/* ── Step 2: Age & Gender ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Расскажите {prep} {namePrep}</h2>
            <p className="text-sm text-gray-500 mb-6">Это поможет создавать сказки по возрасту</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Возраст: <span className="text-purple-600">{age} лет</span>
              </label>
              <input
                type="range" min={3} max={8} value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3 года</span><span>8 лет</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Пол</label>
              <div className="grid grid-cols-2 gap-3">
                {(['girl', 'boy'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-5 rounded-xl border-2 transition flex flex-col items-center gap-2
                      ${gender === g
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-300'}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center
                      ${g === 'girl' ? 'bg-pink-100' : 'bg-blue-100'}`}>
                      <User className={`w-7 h-7 ${g === 'girl' ? 'text-pink-500' : 'text-blue-500'}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {g === 'girl' ? 'Девочка' : 'Мальчик'}
                    </span>
                    {gender === g && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Hero ── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Любимый герой {nameGen}</h2>
            <p className="text-sm text-gray-500 mb-6">Этот персонаж будет помогать в каждой сказке</p>
            <div className="grid grid-cols-3 gap-4">
              {BASE_HEROES.map(h => {
                const selected = hero?.name === h.name;
                return (
                  <div key={h.name} className="flex flex-col items-center gap-2">
                    <button onClick={() => setHero({ name: h.name, emoji: h.emoji })} className="w-full">
                      <img src={h.image} alt={h.name} className="w-full aspect-square object-contain" />
                    </button>
                    <button
                      onClick={() => setHero({ name: h.name, emoji: h.emoji })}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition
                        ${selected
                          ? 'bg-green-100 text-green-700 ring-2 ring-green-300 shadow-sm shadow-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                    >
                      {h.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Toys ── */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Любимые игрушки {nameGen}</h2>
            <p className="text-sm text-gray-500 mb-4">Они станут персонажами сказок. Можно пропустить</p>

            <div className="flex justify-center my-4">
              <img src="/assets/mascot/mascot-joy.png" alt="Маскот" className="w-28 h-28 object-contain" />
            </div>

            {toys.length > 0 && (
              <div className="space-y-2 mb-4">
                {toys.map(t => (
                  <div key={t.id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between border border-gray-200">
                    <div>
                      <span className="font-semibold text-gray-900">{t.nickname}</span>
                      <span className="text-gray-500 text-sm"> — {t.type}</span>
                      {t.description && <p className="text-xs text-gray-400">{t.description}</p>}
                    </div>
                    <button onClick={() => setToys(prev => prev.filter(x => x.id !== t.id))} className="text-red-400 hover:text-red-600 transition p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {addingToy ? (
              <div className="bg-white rounded-xl p-4 border-2 border-purple-300 space-y-3">
                <input
                  type="text"
                  placeholder="Кличка (Пушинка, Малинка...)"
                  value={toyForm.nickname}
                  onChange={e => setToyForm(f => ({ ...f, nickname: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  autoFocus
                />
                <select
                  value={toyForm.type}
                  onChange={e => setToyForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  {TOY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Описание (серый плюшевый, розовая...)"
                  value={toyForm.description}
                  onChange={e => setToyForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <div className="flex gap-2">
                  <button onClick={addToy} className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 transition">
                    Добавить
                  </button>
                  <button onClick={() => setAddingToy(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition">
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingToy(true)}
                className="w-full border-2 border-dashed border-purple-200 rounded-xl py-4 text-purple-600 font-medium flex items-center justify-center gap-2 hover:bg-purple-50 transition"
              >
                <Plus className="w-5 h-5" /> Добавить игрушку
              </button>
            )}

            <button
              onClick={() => setUseToys(v => !v)}
              className="mt-4 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between hover:border-purple-300 transition"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Включать игрушки как персонажей</p>
                <p className="text-xs text-gray-500 mt-0.5">Любимые игрушки будут появляться в историях</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${useToys ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${useToys ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
        )}

        {/* ── Step 5: Interests ── */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Интересы {nameGen}</h2>
            <p className="text-sm text-gray-500 mb-6">Выберите темы, которые нравятся ребёнку (можно несколько)</p>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map(item => (
                <button
                  key={item.label}
                  onClick={() => toggleInterest(item.label)}
                  className={`py-3 px-4 rounded-xl border-2 transition flex items-center gap-2
                    ${interests.includes(item.label)
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'}`}
                >
                  <span>{item.emoji}</span>
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                  {interests.includes(item.label) && <Check className="w-4 h-4 text-purple-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => step === 1 ? navigate('/app/settings') : setStep(s => s - 1)}
            className="text-purple-600 font-medium hover:text-purple-800 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Отмена' : 'Назад'}
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:bg-purple-700 disabled:opacity-40 transition flex items-center gap-2"
            >
              Далее <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-xl shadow-sm hover:bg-purple-700 disabled:opacity-40 transition flex items-center gap-2"
            >
              {saving ? 'Сохраняем...' : 'Сохранить'} <Check className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
