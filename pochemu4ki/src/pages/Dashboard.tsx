import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Settings, UserPlus, Crown } from 'lucide-react';
import HeroImage from '../components/HeroImage';
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

  const storiesUsed = user?.storiesUsed || 0;
  const storiesLeft = Math.max(0, FREE_STORY_LIMIT - storiesUsed);
  const limitReached = !user?.isPremium && storiesUsed >= FREE_STORY_LIMIT;

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
            <img src="/assets/mascot/mascot-logo.png" alt="Почему-Ка!" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-purple-700">Почему-Ка!</span>
          </div>
          <div className="flex items-center gap-2">
            {user?.isPremium && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> Премиум
              </span>
            )}
            <button
              onClick={() => navigate('/app/settings')}
              className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-purple-600 transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Beta banner */}
        <div
          className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg,#f3f0ff,#fce7f3)', border: '1px solid #e9d5ff' }}
        >
          <span style={{ fontSize: 20 }}>🚀</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
              Бета-версия · Premium бесплатно
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Вы среди первых! Все функции открыты — расскажите нам, что думаете
            </p>
          </div>
        </div>

        {/* Welcome card */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-4 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900 mb-0.5">Добро пожаловать!</h1>
          <p className="text-sm text-gray-600 truncate">
            {user?.email}
            {children.length > 0 && (
              <> · {children.length} {children.length === 1 ? 'ребёнок' : 'детей'}</>
            )}
          </p>
        </div>

        {/* Stories usage bar (non-premium only) */}
        {!user?.isPremium && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">Бесплатные истории</span>
              <span className={`text-sm font-bold ${limitReached ? 'text-red-600' : 'text-purple-600'}`}>
                {storiesUsed} / {FREE_STORY_LIMIT}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${limitReached ? 'bg-red-500' : 'bg-purple-600'}`}
                style={{ width: `${Math.min((storiesUsed / FREE_STORY_LIMIT) * 100, 100)}%` }}
              />
            </div>
            {limitReached ? (
              <button
                onClick={() => navigate('/app/pricing')}
                className="w-full bg-purple-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-1"
              >
                <Crown className="w-4 h-4" /> Подключить Premium
              </button>
            ) : (
              <p className="text-xs text-gray-500">
                Осталось {storiesLeft} {storiesLeft === 1 ? 'история' : 'истории'} — хватит на сегодня!
              </p>
            )}
          </div>
        )}

        {/* Children section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Дети</h2>
            <button
              onClick={() => navigate('/app/children/new')}
              className="flex items-center gap-1.5 bg-purple-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>

          {children.length === 0 ? (
            <button
              onClick={() => navigate('/app/children/new')}
              className="w-full bg-purple-50 border border-purple-200 rounded-xl py-10 flex flex-col items-center gap-3 text-purple-400 hover:bg-purple-100 transition"
            >
              <UserPlus className="w-10 h-10 text-purple-400" />
              <div className="text-center">
                <p className="font-semibold text-gray-700">Добавьте первого ребёнка</p>
                <p className="text-sm text-gray-500">Укажите имя, возраст и любимые игрушки</p>
              </div>
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {children.map(child => {
                const childStories = stories.filter(s => s.childId === child.id);
                return (
                  <div
                    key={child.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                          <HeroImage emoji={child.hero.emoji} size="md" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{child.name}</h3>
                          <p className="text-sm text-gray-600">{child.age} лет · {child.gender === 'girl' ? '👧' : '👦'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{childStories.length} историй</p>
                        {child.toys.length > 0 && (
                          <p className="text-xs text-purple-600">{child.toys.length} игрушки 🧸</p>
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
                          if (limitReached) {
                            navigate('/app/pricing');
                          } else {
                            navigate(`/app/children/${child.id}/story`);
                          }
                        }}
                        className="bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-purple-700 transition"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 3L14 10L21 12L14 14L12 21L10 14L3 12L10 10Z"/></svg>
                        Сказку!
                      </button>
                      <button
                        onClick={() => navigate(`/app/library?child=${child.id}`)}
                        className="border border-purple-600 text-purple-600 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-purple-50 transition"
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
              <h2 className="font-bold text-gray-900">Последние истории</h2>
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
                    className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-left flex items-center gap-3 hover:border-purple-300 transition"
                  >
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{story.title}</p>
                      <p className="text-xs text-gray-600 truncate">{story.question}</p>
                      {storyChild && <p className="text-xs text-purple-600">{storyChild.name}</p>}
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
