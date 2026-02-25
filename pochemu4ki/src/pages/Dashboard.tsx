import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { FREE_STORY_LIMIT } from '../types';
import DecorationLayer from '../components/Decorations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { children, stories, loadChildren, loadStories } = useApp();

  useEffect(() => {
    loadChildren();
    loadStories();
  }, []);

  const storiesLeft = user ? Math.max(0, FREE_STORY_LIMIT - (user.storiesUsed || 0)) : 0;

  return (
    <div
      className="min-h-screen relative overflow-hidden page-enter"
      style={{ background: 'var(--bg-primary)' }}
    >
      <DecorationLayer preset="dashboard" />
      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold text-purple-700">Почему-Ка!</span>
          </div>
          <div className="flex items-center gap-2">
            {user?.isPremium && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#F9D56E"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> Премиум
              </span>
            )}
            <button
              onClick={() => navigate('/app/settings')}
              className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-text-secondary hover:text-purple-600 transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Welcome */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl p-5 mb-5">
          <h1 className="text-xl font-bold mb-1">Добро пожаловать! 👋</h1>
          <p className="text-purple-200 text-sm truncate max-w-[90%]">
            {user?.email} · {children.length} {children.length === 1 ? 'ребёнок' : children.length < 5 ? 'детей' : 'детей'}
          </p>
          {!user?.isPremium && (
            <div className="mt-3 bg-white/20 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Бесплатные истории</span>
                <span className="text-sm font-bold">{storiesLeft} / {FREE_STORY_LIMIT}</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(storiesLeft / FREE_STORY_LIMIT) * 100}%` }}
                />
              </div>
              {storiesLeft === 0 && (
                <button
                  onClick={() => navigate('/app/pricing')}
                  className="mt-2 w-full bg-white text-purple-700 text-xs font-bold py-1.5 rounded-xl hover:bg-yellow-50 transition"
                >
                  Получить безлимит →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Children profiles */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-text-primary">Дети</h2>
            <button
              onClick={() => navigate('/app/children/new')}
              className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:text-purple-800 transition"
            >
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>

          {children.length === 0 ? (
            <button
              onClick={() => navigate('/app/children/new')}
              className="w-full border-2 border-dashed border-purple-300 rounded-3xl py-8 flex flex-col items-center gap-3 text-purple-500 hover:bg-purple-50 transition"
            >
              <span className="text-4xl">👶</span>
              <div className="text-center">
                <p className="font-semibold">Добавьте первого ребёнка</p>
                <p className="text-sm text-purple-400">Укажите имя, возраст и любимые игрушки</p>
              </div>
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {children.map(child => {
                const childStories = stories.filter(s => s.childId === child.id);
                return (
                  <div
                    key={child.id}
                    className="bg-white rounded-3xl p-4 shadow-sm border border-purple-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-2xl">
                          {child.hero.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-text-primary">{child.name}</h3>
                          <p className="text-sm text-text-secondary">{child.age} лет · {child.gender === 'girl' ? '👧' : '👦'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">{childStories.length} историй</p>
                        {child.toys.length > 0 && (
                          <p className="text-xs text-purple-500">{child.toys.length} игрушки 🧸</p>
                        )}
                      </div>
                    </div>

                    {child.toys.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {child.toys.map(t => (
                          <span key={t.id} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                            🧸 {t.nickname}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (!user?.isPremium && (user?.storiesUsed || 0) >= FREE_STORY_LIMIT) {
                            navigate('/app/pricing');
                          } else {
                            navigate(`/app/children/${child.id}/story`);
                          }
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:opacity-90 transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg> Сказку!
                      </button>
                      <button
                        onClick={() => navigate(`/app/library?child=${child.id}`)}
                        className="border border-purple-200 text-purple-600 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-purple-50 transition"
                      >
                        <BookOpen className="w-4 h-4" /> Библиотека
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent stories */}
        {stories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-text-primary">Последние истории</h2>
              <button
                onClick={() => navigate('/app/library')}
                className="text-purple-600 text-sm font-medium hover:text-purple-800 transition"
              >
                Все →
              </button>
            </div>
            <div className="space-y-2">
              {stories.slice(0, 3).map(story => {
                const storyChild = children.find(c => c.id === story.childId);
                return (
                  <button
                    key={story.id}
                    onClick={() => navigate(`/app/story/${story.id}`)}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm border border-purple-100 text-left flex items-center gap-3 hover:border-purple-300 transition"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary text-sm truncate">{story.title}</p>
                      <p className="text-xs text-text-secondary truncate">{story.question}</p>
                      {storyChild && <p className="text-xs text-purple-400">{storyChild.name}</p>}
                    </div>
                    {story.rating > 0 && (
                      <span className="text-xs text-yellow-500 flex-shrink-0">{'★'.repeat(story.rating)}</span>
                    )}
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
