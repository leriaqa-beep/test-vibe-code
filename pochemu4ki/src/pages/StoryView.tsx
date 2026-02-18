import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Share2, Star } from 'lucide-react';
import { useApp } from '../context';

export default function StoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { stories, updateStory } = useApp();

  const story = stories.find(s => s.id === id);
  const [hoverRating, setHoverRating] = useState(0);

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-500">Сказка не найдена</p>
        <button onClick={() => navigate('/library')} className="mt-4 text-purple-600 font-medium">
          ← В библиотеку
        </button>
      </div>
    );
  }

  const handleRate = (rating: number) => {
    updateStory(story.id, { rating });
  };

  const handleToggleSave = () => {
    updateStory(story.id, { isSaved: !story.isSaved });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: story.title, text: story.question });
    } else {
      await navigator.clipboard.writeText(`${story.title}\n\n${story.question}`);
      alert('Скопировано!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад
        </button>
      </div>

      <div className="pb-8">
        {/* Cover image */}
        <div className="aspect-video bg-gradient-to-br from-purple-200 via-pink-200 to-indigo-200 flex items-center justify-center">
          <span className="text-8xl">📖</span>
        </div>

        <div className="px-4 py-5">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{story.title}</h1>
          <p className="text-sm text-gray-500 mb-5">Вопрос: {story.question}</p>

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            {story.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4">{para}</p>
            ))}
          </div>

          {/* Rating */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 mt-6 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Понравилась сказка?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  className="transition-transform hover:scale-125 active:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || story.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleToggleSave}
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
                story.isSaved
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${story.isSaved ? 'fill-red-500' : ''}`} />
              {story.isSaved ? 'В избранном' : 'Добавить в избранное'}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/app')}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            Создать ещё сказку ✨
          </button>
        </div>
      </div>
    </div>
  );
}
