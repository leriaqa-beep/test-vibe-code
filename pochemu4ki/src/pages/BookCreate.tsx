import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, Download, Loader } from 'lucide-react';
import HeroImage from '../components/HeroImage';
import { useApp } from '../context/AppContext';
import DecorationLayer from '../components/Decorations';
import type { ChildProfile } from '../types';

// Resize an image to maxPx on its longest side and return a PNG data URL.
// Preserves transparency. Falls back to the original src on any error.
async function compressImage(src: string, maxPx: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.naturalWidth || maxPx, img.naturalHeight || maxPx));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

// Max display size in PDF (pt) × 2× for retina, rounded up to nearest 50px.
// Larger = better quality but heavier file. These are tuned for 150 DPI PDF output.
const MASCOT_MAX_PX: Record<string, number> = {
  'mascot-logo.png':     350,
  'mascot-surprise.png': 300,
  'mascot-calm.png':     300,
  'mascot-joy.png':      250,
  'mascot-hero.png':     100,
  'mascot-explain.png':  100,
  'mascot-think.png':    100,
};

export default function BookCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { stories, children, loadStories, loadChildren } = useApp();

  const defaultChildId = params.get('child') || '';
  const [activeChildId, setActiveChildId] = useState(defaultChildId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bookTitle, setBookTitle] = useState('Сборник сказок');
  const [titleEdited, setTitleEdited] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'title' | 'done'>('select');

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

  // Reset edited flag when child selection changes so new child name auto-fills
  useEffect(() => { setTitleEdited(false); }, [activeChildId]);

  // Auto-fill title when child selected — skip if user manually edited or data not loaded
  useEffect(() => {
    if (titleEdited) return;
    if (children.length === 0) return;
    const child = children.find(c => c.id === activeChildId);
    if (child) {
      setBookTitle(`${child.name}: Сборник сказок`);
      setTitleEdited(true); // lock after first fill so re-renders don't reset it
    } else if (!activeChildId) {
      setBookTitle('Сборник сказок');
      setTitleEdited(true);
    }
  }, [activeChildId, children, titleEdited]);

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
      const [{ pdf }, { BookDocument }, { HERO }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../components/BookPDF/BookPDF'),
        import('../components/BookPDF/constants'),
      ]);

      // Pre-compress all images to reduce PDF file size.
      // Canvas rescales PNGs to the max display size needed in the PDF.
      const origin = window.location.origin;
      const compressions = Object.entries(MASCOT_MAX_PX).map(([name, px]) => {
        const url = `${origin}/assets/mascot/${name}`;
        return compressImage(url, px).then(data => [url, data] as const);
      });
      const heroEmoji = child.hero?.emoji;
      const heroPath = heroEmoji && HERO[heroEmoji] ? HERO[heroEmoji] : null;
      if (heroPath) {
        compressions.push(
          compressImage(`${origin}${heroPath}`, 360).then(data => [`${origin}${heroPath}`, data] as const)
        );
      }

      // Pre-compress custom hero images used in individual stories
      const storyHeroUrls = new Set<string>();
      for (const story of selectedStories) {
        if (story.heroUsed?.imageUrl) storyHeroUrls.add(story.heroUsed.imageUrl);
      }
      for (const url of storyHeroUrls) {
        compressions.push(
          compressImage(url, 360).then(data => [url, data] as const)
        );
      }

      const imageMap = Object.fromEntries(await Promise.all(compressions));

      const instance = pdf(
        <BookDocument
          title={bookTitle}
          child={child}
          stories={selectedStories}
          baseUrl={origin}
          imageMap={imageMap}
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
      setStep('done');
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

        {/* Step tabs — only when not in done state */}
        {step !== 'done' && (
          <div className="flex rounded-xl bg-white border border-purple-100 p-1 gap-1 mb-5 shadow-sm">
            {(['select', 'title'] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => step === 'title' && s === 'select' ? setStep('select') : (selected.size > 0 && setStep(s))}
                className={`flex-1 rounded-lg text-sm font-semibold transition ${step === s ? 'bg-purple-600 text-white shadow-sm' : 'text-text-secondary hover:text-purple-600'}`}
                style={{ minHeight: 44 }}
              >
                {i + 1}. {s === 'select' ? 'Выбрать истории' : 'Оформление'}
              </button>
            ))}
          </div>
        )}

        {/* ── Step 1: Select stories ── */}
        {step === 'select' && (
          <>
            {/* Child filter chips */}
            {children.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveChildId('')}
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--radius-full)',
                    border: activeChildId === ''
                      ? '1.5px solid var(--accent-primary)'
                      : '1px solid var(--border-default)',
                    background: activeChildId === '' ? 'var(--accent-primary-50)' : 'var(--bg-surface)',
                    color: activeChildId === '' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: activeChildId === '' ? 600 : 400,
                    cursor: 'pointer', minHeight: 36, transition: 'all 0.15s',
                  }}
                >
                  Все дети
                </button>
                {children.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChildId(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '7px 12px', borderRadius: 'var(--radius-full)',
                      border: activeChildId === c.id
                        ? '1.5px solid var(--accent-primary)'
                        : '1px solid var(--border-default)',
                      background: activeChildId === c.id ? 'var(--accent-primary-50)' : 'var(--bg-surface)',
                      color: activeChildId === c.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: activeChildId === c.id ? 600 : 400,
                      cursor: 'pointer', minHeight: 36, transition: 'all 0.15s',
                    }}
                  >
                    <HeroImage emoji={c.hero.emoji} size="xs" /> {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Selection status + bulk actions */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {selected.size > 0 ? (
                  <>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: 15 }}>
                      {selected.size}
                    </span>
                    {' из '}{filteredStories.length}
                  </>
                ) : (
                  `${filteredStories.length} ${storiesWord(filteredStories.length)}`
                )}
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={selectAll}
                  style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--accent-primary)',
                    background: 'var(--accent-primary-50)', border: 'none',
                    padding: '5px 12px', borderRadius: 'var(--radius-full)',
                    cursor: 'pointer', minHeight: 30, transition: 'opacity 0.15s',
                  }}
                >
                  Все
                </button>
                <button
                  onClick={clearAll}
                  style={{
                    fontSize: 13, fontWeight: 500, color: 'var(--text-muted)',
                    background: 'var(--bg-subtle)', border: 'none',
                    padding: '5px 12px', borderRadius: 'var(--radius-full)',
                    cursor: 'pointer', minHeight: 30, transition: 'opacity 0.15s',
                  }}
                >
                  Снять
                </button>
              </div>
            </div>

            {/* Story list */}
            {filteredStories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📚</p>
                <p style={{ fontWeight: 500 }}>Нет историй для выбранного профиля</p>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 152px)',
              }}>
                {filteredStories.map(story => {
                  const storyChild = children.find(c => c.id === story.childId);
                  const isSelected = selected.has(story.id);
                  return (
                    <button
                      key={story.id}
                      onClick={() => toggleStory(story.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected
                          ? '2px solid var(--accent-primary)'
                          : '1px solid var(--border-default)',
                        background: isSelected ? 'var(--accent-primary-50)' : 'var(--bg-surface)',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                        textAlign: 'left', cursor: 'pointer',
                        transition: 'all 0.18s var(--ease-bounce)',
                      }}
                    >
                      {/* Circular checkbox */}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        border: isSelected
                          ? '2px solid var(--accent-primary)'
                          : '2px solid var(--border-default)',
                        background: isSelected ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.18s var(--ease-bounce)',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}>
                        {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                      </div>

                      {/* Title + question */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 2px',
                          fontSize: 14, fontWeight: 600,
                          color: isSelected ? 'var(--accent-primary-dark)' : 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'color 0.15s',
                          fontFamily: 'var(--font-display)',
                        }}>
                          {story.title}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 12, fontStyle: 'italic',
                          color: 'var(--text-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          «{story.question}»
                        </p>
                      </div>

                      {storyChild && (
                        <HeroImage
                          emoji={storyChild.hero.emoji}
                          size="xs"
                          style={{ opacity: isSelected ? 1 : 0.55, transition: 'opacity 0.15s', flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sticky summary + CTA — always visible above bottom nav */}
            <div style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
              left: 0, right: 0,
              zIndex: 50,
              display: 'flex', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                width: '100%', maxWidth: 512,
                padding: '10px 16px 8px',
                background: 'linear-gradient(to top, var(--bg-primary) 68%, transparent)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                pointerEvents: 'auto',
              } as React.CSSProperties}>
                <button
                  onClick={() => setStep('title')}
                  disabled={selected.size === 0}
                  style={{
                    width: '100%', height: 56,
                    borderRadius: 'var(--radius-xl)',
                    background: selected.size > 0 ? 'var(--gradient-button)' : 'var(--bg-subtle)',
                    color: selected.size > 0 ? '#fff' : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'var(--text-base)',
                    border: selected.size > 0 ? 'none' : '1px solid var(--border-default)',
                    cursor: selected.size > 0 ? 'pointer' : 'default',
                    boxShadow: selected.size > 0 ? 'var(--shadow-button)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.22s var(--ease-smooth)',
                  }}
                >
                  {selected.size > 0 ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                        <path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/>
                      </svg>
                      Далее → {selected.size} {storiesWord(selected.size)}
                    </>
                  ) : (
                    'Выберите истории для книги'
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Title & download ── */}
        {step === 'title' && (
          <>
            {/* Book cover preview */}
            <div style={{
              background: 'linear-gradient(150deg, var(--accent-primary) 0%, var(--accent-primary-light) 60%, #C4B5FD 100%)',
              borderRadius: 20,
              padding: '28px 20px 22px',
              marginBottom: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: '-4px 6px 24px rgba(124,107,196,0.30), 4px 4px 12px rgba(0,0,0,0.06)',
              position: 'relative', overflow: 'hidden',
            }}>
              <span style={{ position: 'absolute', top: 14, left: 16, fontSize: 14, opacity: 0.45, color: '#F9D56E' }}>✦</span>
              <span style={{ position: 'absolute', top: 14, right: 16, fontSize: 10, opacity: 0.35, color: '#F9D56E' }}>✦</span>
              <span style={{ position: 'absolute', bottom: 14, left: 22, fontSize: 10, opacity: 0.3, color: '#F9D56E' }}>✦</span>
              <span style={{ position: 'absolute', bottom: 14, right: 22, fontSize: 14, opacity: 0.4, color: '#F9D56E' }}>✦</span>
              <img
                src="/assets/mascot/mascot-joy.png"
                alt=""
                style={{ width: 88, height: 88, objectFit: 'contain', marginBottom: 14, filter: 'drop-shadow(0 3px 8px rgba(76,29,149,0.20))' }}
              />
              <p style={{
                margin: '0 0 6px', fontSize: 18, fontWeight: 700,
                textAlign: 'center', color: '#fff',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.3, maxWidth: 220,
              }}>
                {bookTitle || '—'}
              </p>
              {child && (
                <p style={{ margin: '0 0 10px', fontSize: 13, color: 'rgba(255,255,255,0.80)', textAlign: 'center' }}>
                  Для {child.name}, {child.age} {ageWord(child.age)}
                </p>
              )}
              <div style={{
                background: 'rgba(255,255,255,0.22)', borderRadius: 20,
                padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#fff',
                border: '1px solid rgba(255,255,255,0.32)',
              }}>
                {selectedStories.length} {storiesWord(selectedStories.length)}
              </div>
            </div>

            {/* Title input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Название книги
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={e => { setTitleEdited(true); setBookTitle(e.target.value); }}
                maxLength={80}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition bg-white"
                style={{ fontSize: 15 }}
                placeholder="Введите название книги..."
              />
            </div>

            {/* Contents list */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              padding: '14px 16px',
              marginBottom: 22,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ✦ Содержание книги
              </p>
              {selectedStories.slice(0, 6).map((story, i) => (
                <div key={story.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 0',
                  borderBottom: i < Math.min(selectedStories.length, 6) - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--accent-primary-50)',
                    color: 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {story.title}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      «{story.question}»
                    </p>
                  </div>
                </div>
              ))}
              {selectedStories.length > 6 && (
                <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  + ещё {selectedStories.length - 6} {storiesWord(selectedStories.length - 6)}
                </p>
              )}
            </div>

            {/* Create PDF CTA */}
            <button
              onClick={handleDownload}
              disabled={generating || selectedStories.length === 0 || !bookTitle.trim()}
              style={{
                width: '100%', height: 60, borderRadius: 'var(--radius-xl)',
                background: (generating || selectedStories.length === 0 || !bookTitle.trim())
                  ? 'var(--bg-subtle)' : 'var(--gradient-button)',
                color: (generating || selectedStories.length === 0 || !bookTitle.trim())
                  ? 'var(--text-muted)' : '#fff',
                border: 'none',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: generating ? 'wait' : 'pointer',
                boxShadow: (generating || selectedStories.length === 0 || !bookTitle.trim())
                  ? 'none' : 'var(--shadow-button)',
                transition: 'all 0.2s',
                marginBottom: 4,
              }}
            >
              {generating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Переплетаем страницы…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3L13.8 9.4L20 12L13.8 14.6L12 21L10.2 14.6L4 12L10.2 9.4Z" fill="currentColor"/>
                  </svg>
                  Создать PDF-книгу
                </>
              )}
            </button>

            {generating && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Загружаем шрифты и формируем PDF — несколько секунд
              </p>
            )}

            <button
              onClick={() => setStep('select')}
              style={{
                width: '100%', marginTop: 10, padding: '8px 0',
                background: 'none', border: 'none',
                fontSize: 13, color: 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              ← Изменить выбор историй
            </button>

            {pdfError && (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#ef4444', marginTop: 4, background: '#fef2f2', borderRadius: 12, padding: '8px 12px' }}>
                ⚠️ {pdfError}
              </p>
            )}
          </>
        )}

        {/* ── Done state ── */}
        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', textAlign: 'center' }}>
            <style>{`
              @keyframes bcStar { 0%,100% { opacity:0.55; transform:scale(1) rotate(0deg); } 50% { opacity:1; transform:scale(1.35) rotate(15deg); } }
              @keyframes bcFloat { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
            `}</style>

            {/* Mascot + floating stars */}
            <div style={{ position: 'relative', width: 128, height: 128, marginBottom: 6 }}>
              <img
                src="/assets/mascot/mascot-surprise.png"
                alt=""
                style={{ width: 128, height: 128, objectFit: 'contain', animation: 'bcFloat 3s ease-in-out infinite' }}
              />
              <span style={{ position: 'absolute', top: 2, right: -6, fontSize: 22, animation: 'bcStar 2s 0s infinite' }}>✨</span>
              <span style={{ position: 'absolute', top: 26, left: -10, fontSize: 16, animation: 'bcStar 2.5s 0.4s infinite' }}>⭐</span>
              <span style={{ position: 'absolute', bottom: 18, right: -4, fontSize: 14, color: '#F9D56E', animation: 'bcStar 2s 0.8s infinite' }}>✦</span>
            </div>

            <h2 style={{ margin: '4px 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Ваша книга готова!
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-secondary)' }}>
              Сохранили все сказки в одном месте
            </p>

            {/* Book info card */}
            <div style={{
              background: 'linear-gradient(135deg, #F3EEFF 0%, #FCE7F3 100%)',
              border: '1px solid #E9D5FF',
              borderRadius: 16, padding: '16px 20px',
              marginBottom: 22, width: '100%',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(124,107,196,0.10)',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                «{bookTitle}»
              </p>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--accent-primary)', fontWeight: 600 }}>
                {selectedStories.length} {storiesWord(selectedStories.length)}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                PDF скачивается в папку «Загрузки»
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <button
                onClick={handleDownload}
                disabled={generating}
                style={{
                  width: '100%', minHeight: 52, borderRadius: 'var(--radius-xl)',
                  background: 'var(--gradient-button)', color: '#fff', border: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: generating ? 'wait' : 'pointer',
                  boxShadow: 'var(--shadow-button)',
                  opacity: generating ? 0.6 : 1, transition: 'opacity 0.15s',
                }}
              >
                {generating ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {generating ? 'Создаём PDF…' : 'Скачать ещё раз'}
              </button>
              <button
                onClick={() => { setStep('select'); setSelected(new Set()); }}
                style={{
                  width: '100%', minHeight: 48, borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)', color: 'var(--accent-primary)',
                  border: '1.5px solid #E9D5FF',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
              >
                Создать другую книгу
              </button>
            </div>

            {pdfError && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 12, background: '#fef2f2', borderRadius: 12, padding: '8px 12px', width: '100%' }}>
                ⚠️ {pdfError}
              </p>
            )}

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.6 }}>
              💡 Распечатайте и сшейте страницы —<br/>получится настоящая книга для чтения
            </p>
          </div>
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
