import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../context';
import BottomNav from '../components/BottomNav';

export default function Library() {
  const navigate = useNavigate();
  const { stories } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  const displayed = activeTab === 'all' ? stories : stories.filter(s => s.isSaved);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-800">Библиотека</h1>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-4">
        {[
          { id: 'all' as const, label: `Все истории (${stories.length})` },
          { id: 'saved' as const, label: `Избранные (${stories.filter(s => s.isSaved).length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-7xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {activeTab === 'all' ? 'Пока нет сказок' : 'Нет избранных сказок'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {activeTab === 'all'
                ? 'Создайте свою первую волшебную сказку!'
                : 'Добавляйте понравившиеся сказки в избранное'}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/app')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
              >
                Создать сказку
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {displayed.map(story => (
              <button
                key={story.id}
                onClick={() => navigate(`/story/${story.id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all text-left group"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-5xl group-hover:scale-110 transition-transform">📖</span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1">{story.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{story.question}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(story.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                    {story.isSaved && <Heart className="h-4 w-4 text-red-400 fill-red-400" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
