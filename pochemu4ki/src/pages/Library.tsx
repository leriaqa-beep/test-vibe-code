import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Heart, Star, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Library() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const filterChildId = params.get('child');
  const { stories, children, loadStories, loadChildren } = useApp();
  const [search, setSearch] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadChildren();
    loadStories(filterChildId || undefined);
  }, [filterChildId]);

  const filtered = stories.filter(s => {
    if (filterChildId && s.childId !== filterChildId) return false;
    if (showSaved && !s.isSaved) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.question.toLowerCase().includes(q);
    }
    return true;
  });

  const filterChild = filterChildId ? children.find(c => c.id === filterChildId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {filterChild ? `Истории ${filterChild.name}` : 'Библиотека историй'}
            </h1>
            <p className="text-sm text-gray-500">{filtered.length} {filtered.length === 1 ? 'история' : 'историй'}</p>
          </div>
        </div>

        {/* Search & filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-3 mb-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по историям..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition ${showSaved ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}
            >
              <Heart className={`w-3 h-3 ${showSaved ? 'fill-red-500 text-red-500' : ''}`} />
              Избранное
            </button>
            {filterChild && (
              <button
                onClick={() => navigate('/app/library')}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-purple-300 transition"
              >
                Все дети
              </button>
            )}
          </div>
        </div>

        {/* Stories */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 font-medium mb-2">
              {search || showSaved ? 'Ничего не найдено' : 'Историй пока нет'}
            </p>
            {!search && !showSaved && (
              <button
                onClick={() => navigate('/app')}
                className="text-purple-600 font-semibold text-sm hover:text-purple-800 transition"
              >
                Создать первую сказку →
              </button>
            )}
          </div>
        ) : (
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
                      <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{story.title}</p>
                      {story.isSaved && <Heart className="w-4 h-4 fill-red-400 text-red-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">«{story.question}»</p>
                    <div className="flex items-center justify-between">
                      {child && (
                        <span className="text-xs text-purple-500 flex items-center gap-1">
                          {child.hero.emoji} {child.name}
                        </span>
                      )}
                      {story.rating > 0 && (
                        <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-400" /> {story.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
