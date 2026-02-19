import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Star, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Story } from '../types';
import { api } from '../api/client';

export default function StoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stories, updateStory, children } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // Try local first, then fetch
    const local = stories.find(s => s.id === id);
    if (local) {
      setStory(local);
      setRating(local.rating);
      setLoading(false);
    } else {
      api.stories.get(id)
        .then(s => { setStory(s); setRating(s.rating); })
        .finally(() => setLoading(false));
    }
  }, [id, stories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">📖</div>
          <p className="text-purple-600">Загружаем историю...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">История не найдена</p>
          <button onClick={() => navigate('/app')} className="text-purple-600 font-medium">
            На главную
          </button>
        </div>
      </div>
    );
  }

  const child = children.find(c => c.id === story.childId);

  const handleSave = async () => {
    await updateStory(story.id, { isSaved: !story.isSaved });
    setStory(prev => prev ? { ...prev, isSaved: !prev.isSaved } : prev);
  };

  const handleRate = async (r: number) => {
    setRating(r);
    await updateStory(story.id, { rating: r });
    setStory(prev => prev ? { ...prev, rating: r } : prev);
  };

  const paragraphs = story.content.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={story.imageUrl}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition"
        >
          <Heart className={`w-5 h-5 ${story.isSaved ? 'fill-red-400 text-red-400' : ''}`} />
        </button>

        {/* Child badge */}
        {child && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-lg">{child.hero.emoji}</span>
            <span className="text-white text-sm font-medium">{child.name}</span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Question */}
        <div className="bg-purple-50 rounded-2xl px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-1">Вопрос</p>
          <p className="text-gray-700 font-medium">«{story.question}»</p>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{story.title}</h1>

        {/* Content */}
        <div className="prose prose-gray max-w-none mb-8">
          {paragraphs.map((para, i) => {
            // Render bold markers
            const isBold = para.startsWith('**') && para.includes('**', 2);
            if (isBold) {
              const cleaned = para.replace(/\*\*/g, '');
              return (
                <p key={i} className="font-bold text-purple-800 bg-purple-50 rounded-xl px-4 py-3 mb-4">
                  {cleaned}
                </p>
              );
            }
            return (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 text-base">
                {para}
              </p>
            );
          })}
        </div>

        {/* Rating */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Оцените историю</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(r => (
              <button
                key={r}
                onClick={() => handleRate(r)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <Star className={`w-8 h-8 ${r <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/app/children/${story.childId}/story`)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <BookOpen className="w-4 h-4" /> Ещё сказку
          </button>
          <button
            onClick={handleSave}
            className={`py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 border-2 transition ${story.isSaved ? 'border-red-300 text-red-500 bg-red-50' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
          >
            <Heart className={`w-4 h-4 ${story.isSaved ? 'fill-red-500' : ''}`} />
            {story.isSaved ? 'В избранном' : 'В избранное'}
          </button>
        </div>
      </div>
    </div>
  );
}
