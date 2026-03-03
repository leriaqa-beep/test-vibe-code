import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Heart, ArrowLeft, LayoutGrid, List, BookMarked } from 'lucide-react';
import HeroImage from '../components/HeroImage';
import { useApp } from '../context/AppContext';
import DecorationLayer from '../components/Decorations';

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'rating';
type ViewMode = 'cards' | 'list';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Новые сначала' },
  { value: 'oldest', label: 'Старые сначала' },
  { value: 'az', label: 'А → Я' },
  { value: 'za', label: 'Я → А' },
  { value: 'rating', label: 'По рейтингу' },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function Library() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialChildId = params.get('child') || '';
  const { stories, children, loadStories, loadChildren } = useApp();

  const [search, setSearch] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [activeChildId, setActiveChildId] = useState(initialChildId);
  const [sort, setSort] = useState<SortKey>('newest');
  const [view, setView] = useState<ViewMode>('cards');

  useEffect(() => {
    loadChildren();
    loadStories();
  }, []);

  const filtered = useMemo(() => {
    let result = stories.filter(s => {
      if (activeChildId && s.childId !== activeChildId) return false;
      if (showSaved && !s.isSaved) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.question.toLowerCase().includes(q);
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'az') return a.title.localeCompare(b.title, 'ru');
      if (sort === 'za') return b.title.localeCompare(a.title, 'ru');
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [stories, activeChildId, showSaved, search, sort]);

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)' }}
    >
      <DecorationLayer preset="dashboard" />
      <div className="max-w-lg mx-auto px-4 py-6 relative">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-primary">Библиотека историй</h1>
            <p className="text-sm text-text-secondary">
              {filtered.length} из {stories.length} {stories.length === 1 ? 'история' : 'историй'}
            </p>
          </div>
          {/* Book create button */}
          <button
            onClick={() => navigate(`/app/book/create${activeChildId ? `?child=${activeChildId}` : ''}`)}
            className="w-9 h-9 bg-white rounded-xl shadow-sm border border-purple-100 flex items-center justify-center text-purple-500 hover:bg-purple-50 hover:text-purple-700 transition"
            title="Создать книгу"
          >
            <BookMarked className="w-4 h-4" />
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-white rounded-xl shadow-sm border border-purple-100 p-1 gap-1">
            <button
              onClick={() => setView('cards')}
              className={`p-1.5 rounded-lg transition ${view === 'cards' ? 'bg-purple-100 text-purple-600' : 'text-text-muted hover:text-text-secondary'}`}
              title="Карточки"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition ${view === 'list' ? 'bg-purple-100 text-purple-600' : 'text-text-muted hover:text-text-secondary'}`}
              title="Содержание"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-3 mb-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по историям..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="flex-1 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${showSaved ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-text-secondary hover:border-purple-300'}`}
            >
              <Heart className={`w-3 h-3 ${showSaved ? 'fill-red-500 text-red-500' : ''}`} />
              Избранное
            </button>
          </div>
        </div>

        {/* Child filter chips */}
        {children.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setActiveChildId('')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${activeChildId === '' ? 'border-purple-500 bg-purple-100 text-purple-700' : 'border-gray-200 text-text-secondary hover:border-purple-300'}`}
            >
              Все дети
            </button>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveChildId(activeChildId === c.id ? '' : c.id)}
                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition ${activeChildId === c.id ? 'border-purple-500 bg-purple-100 text-purple-700' : 'border-gray-200 text-text-secondary hover:border-purple-300'}`}
              >
                <HeroImage emoji={c.hero.emoji} size="xs" /> {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Stories */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-text-secondary font-medium mb-2">
              {search || showSaved || activeChildId ? 'Ничего не найдено' : 'Историй пока нет'}
            </p>
            {!search && !showSaved && !activeChildId && (
              <button
                onClick={() => navigate('/app')}
                className="text-purple-600 font-semibold text-sm hover:text-purple-800 transition"
              >
                Создать первую сказку →
              </button>
            )}
          </div>
        ) : view === 'cards' ? (
          /* Card view */
          <div className="space-y-3">
            {filtered.map(story => {
              const child = children.find(c => c.id === story.childId);
              return (
                <button
                  key={story.id}
                  onClick={() => navigate(`/app/story/${story.id}`)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden flex hover:border-purple-300 transition text-left"
                >
                  {story.imageUrl && (
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                      <img src={story.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-text-primary text-sm leading-tight line-clamp-2">{story.title}</p>
                      {story.isSaved && <Heart className="w-4 h-4 fill-red-400 text-red-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1 mb-2">«{story.question}»</p>
                    <div className="flex items-center justify-between">
                      {child && (
                        <span className="text-xs text-purple-500 flex items-center gap-1">
                          <HeroImage emoji={child.hero.emoji} size="xs" /> {child.name}
                        </span>
                      )}
                      {story.rating > 0 && (
                        <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F9D56E"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> {story.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* List / Table-of-contents view */
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-purple-50 flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-500 uppercase tracking-wide">📋 Содержание</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map((story, idx) => {
                const child = children.find(c => c.id === story.childId);
                return (
                  <button
                    key={story.id}
                    onClick={() => navigate(`/app/story/${story.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition text-left"
                  >
                    <span className="text-xs text-text-muted font-mono w-5 flex-shrink-0 text-right">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{story.title}</p>
                      <p className="text-xs text-text-muted truncate">«{story.question}»</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {child && (
                        <HeroImage emoji={child.hero.emoji} size="xs" className="opacity-80" />
                      )}
                      {story.rating > 0 ? (
                        <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#F9D56E"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>{story.rating}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                      {story.isSaved && <Heart className="w-3 h-3 fill-red-400 text-red-400" />}
                      <span className="text-xs text-text-muted hidden sm:block">{formatDate(story.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
