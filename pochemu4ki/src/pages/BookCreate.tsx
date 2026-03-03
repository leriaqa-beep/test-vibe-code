import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, Download, Loader } from 'lucide-react';
import HeroImage from '../components/HeroImage';
import { useApp } from '../context/AppContext';
import DecorationLayer from '../components/Decorations';
import type { ChildProfile } from '../types';

export default function BookCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { stories, children, loadStories, loadChildren } = useApp();

  const defaultChildId = params.get('child') || '';
  const [activeChildId, setActiveChildId] = useState(defaultChildId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bookTitle, setBookTitle] = useState('Сборник сказок');
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'title'>('select');

  useEffect(() => {
    Promise.all([loadChildren(), loadStories()]);
  }, []);

  // Auto-select stories for active child when child changes
  useEffect(() => {
    const childStories = activeChildId
      ? stories.filter(s => s.childId === activeChildId)
      : stories;
    setSelected(new Set(childStories.map(s => s.id)));
  }, [activeChildId, stories]);

  // Auto-fill title when child selected
  useEffect(() => {
    const child = children.find(c => c.id === activeChildId);
    if (child) {
      setBookTitle(`${child.name}: Сборник сказок`);
    } else {
      setBookTitle('Сборник сказок');
    }
  }, [activeChildId, children]);

  const filteredStories = activeChildId
    ? stories.filter(s => s.childId === activeChildId)
    : stories;

  const selectedStories = stories.filter(s => selected.has(s.id));

  const toggleStory = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(filteredStories.map(s => s.id)));
  const clearAll  = () => setSelected(new Set());

  const handleDownload = useCallback(async () => {
    if (selectedStories.length === 0) return;
    setGenerating(true);
    setPdfError(null);
    try {
      const child = (children.find(c => c.id === activeChildId) || children[0]) as ChildProfile;
      if (!child) throw new Error('Профиль ребёнка не найден');

      // Dynamic import — loads @react-pdf/renderer only when needed
      const [{ pdf }, { BookDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../components/BookPDF/BookPDF'),
      ]);

      const mascotUrl = `${window.location.origin}/assets/mascot/mascot-joy.png`;

      const instance = pdf(
        <BookDocument
          title={bookTitle}
          child={child}
          stories={selectedStories}
          mascotUrl={mascotUrl}
        />
      );

      const blob = await instance.toBlob();
      const filename = `${bookTitle.replace(/[^а-яёА-ЯЁa-zA-Z0-9 ]/g, '').trim() || 'книга'}.pdf`;

      // Use anchor with object URL — works in all modern browsers
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        download: filename,
        style: 'display:none',
      });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
    } catch (e) {
      console.error('PDF generation error:', e);
      setPdfError(e instanceof Error ? e.message : 'Не удалось создать PDF. Попробуйте ещё раз.');
    } finally {
      setGenerating(false);
    }
  }, [selectedStories, bookTitle, children, activeChildId]);

  const child = children.find(c => c.id === activeChildId);

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-body)' }}
    >
      <DecorationLayer preset="minimal" />
      <div className="max-w-lg mx-auto px-4 py-6 relative">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" /> Создать книгу
            </h1>
            <p className="text-xs text-text-secondary">Выберите истории — скачайте PDF</p>
          </div>
        </div>

        {/* Step tabs */}
        <div className="flex rounded-xl bg-white border border-purple-100 p-1 gap-1 mb-5 shadow-sm">
          {(['select', 'title'] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => step === 'title' && s === 'select' ? setStep('select') : (selected.size > 0 && setStep(s))}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${step === s ? 'bg-purple-600 text-white shadow-sm' : 'text-text-secondary hover:text-purple-600'}`}
            >
              {i + 1}. {s === 'select' ? 'Выбрать истории' : 'Оформление'}
            </button>
          ))}
        </div>

        {/* ── Step 1: Select stories ── */}
        {step === 'select' && (
          <>
            {/* Child filter */}
            {children.length > 1 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setActiveChildId('')}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${activeChildId === '' ? 'border-purple-500 bg-purple-100 text-purple-700' : 'border-gray-200 text-text-secondary hover:border-purple-300'}`}
                >
                  Все дети
                </button>
                {children.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChildId(c.id)}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition ${activeChildId === c.id ? 'border-purple-500 bg-purple-100 text-purple-700' : 'border-gray-200 text-text-secondary hover:border-purple-300'}`}
                  >
                    <HeroImage emoji={c.hero.emoji} size="xs" /> {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Select all / clear */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text-secondary">
                Выбрано: <strong className="text-purple-600">{selected.size}</strong> из {filteredStories.length}
              </p>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-purple-600 font-medium hover:text-purple-800">Все</button>
                <span className="text-text-muted text-xs">·</span>
                <button onClick={clearAll} className="text-xs text-text-muted font-medium hover:text-red-500">Снять</button>
              </div>
            </div>

            {/* Story list */}
            {filteredStories.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="text-4xl mb-3">📚</p>
                <p className="font-medium">Нет историй для выбранного профиля</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {filteredStories.map(story => {
                  const storyChild = children.find(c => c.id === story.childId);
                  const isSelected = selected.has(story.id);
                  return (
                    <button
                      key={story.id}
                      onClick={() => toggleStory(story.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-300'}`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{story.title}</p>
                        <p className="text-xs text-text-muted truncate">«{story.question}»</p>
                      </div>
                      {storyChild && <HeroImage emoji={storyChild.hero.emoji} size="xs" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Next */}
            <button
              onClick={() => setStep('title')}
              disabled={selected.size === 0}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-40 transition hover:scale-[1.02] active:scale-100"
              style={{ background: 'var(--gradient-button)', boxShadow: 'var(--shadow-button)' }}
            >
              Далее — оформление ({selected.size} {storiesWord(selected.size)}) →
            </button>
          </>
        )}

        {/* ── Step 2: Title & download ── */}
        {step === 'title' && (
          <>
            {/* Cover preview card */}
            <div
              className="rounded-2xl p-6 mb-5 flex flex-col items-center"
              style={{ background: 'linear-gradient(135deg,#f3f0ff,#fce7f3)', border: '1px solid #e9d5ff' }}
            >
              <img
                src="/assets/mascot/mascot-joy.png"
                alt="Маскот"
                className="w-20 h-20 object-contain mb-3 drop-shadow"
              />
              <p className="text-center text-base font-bold text-text-primary mb-1">{bookTitle || '—'}</p>
              {child && (
                <p className="text-center text-xs text-purple-600">
                  Для {child.name}, {child.age} {ageWord(child.age)}
                </p>
              )}
              <p className="text-center text-xs text-text-muted mt-1">{selectedStories.length} {storiesWord(selectedStories.length)}</p>
            </div>

            {/* Title input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Название книги</label>
              <input
                type="text"
                value={bookTitle}
                onChange={e => setBookTitle(e.target.value)}
                maxLength={80}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-300 transition bg-white"
                placeholder="Введите название книги..."
              />
            </div>

            {/* Story list summary */}
            <div className="bg-white rounded-2xl border border-purple-100 p-4 mb-5 shadow-sm">
              <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Содержание</p>
              <div className="space-y-1.5">
                {selectedStories.map((story, i) => (
                  <div key={story.id} className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-mono w-4 text-right">{i + 1}.</span>
                    <p className="text-xs text-text-primary flex-1 truncate">{story.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={generating || selectedStories.length === 0 || !bookTitle.trim()}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-100"
              style={{ background: 'var(--gradient-button)', boxShadow: 'var(--shadow-button)' }}
            >
              {generating ? (
                <><Loader className="w-5 h-5 animate-spin" /> Создаём PDF...</>
              ) : (
                <><Download className="w-5 h-5" /> Скачать PDF</>
              )}
            </button>

            {generating && (
              <p className="text-center text-xs text-text-muted mt-3">
                Загружаем шрифты и формируем PDF — это займёт несколько секунд
              </p>
            )}
            {pdfError && (
              <p className="text-center text-xs text-red-500 mt-3 bg-red-50 rounded-xl px-3 py-2">
                ⚠️ {pdfError}
              </p>
            )}

            <button
              onClick={() => setStep('select')}
              className="w-full mt-3 text-xs text-text-muted py-2 hover:text-purple-600 transition"
            >
              ← Изменить выбор историй
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function storiesWord(n: number) {
  if (n >= 11 && n <= 19) return 'историй';
  const last = n % 10;
  if (last === 1) return 'история';
  if (last >= 2 && last <= 4) return 'истории';
  return 'историй';
}

function ageWord(n: number) {
  if (n >= 11 && n <= 19) return 'лет';
  const last = n % 10;
  if (last === 1) return 'год';
  if (last >= 2 && last <= 4) return 'года';
  return 'лет';
}
