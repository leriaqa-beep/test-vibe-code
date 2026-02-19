import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Flame, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../context';
import VoiceInput from '../components/VoiceInput';
import BottomNav from '../components/BottomNav';

const POPULAR_QUESTIONS = [
  { emoji: '🌧️', text: 'Почему идёт дождь?', category: 'Природа' },
  { emoji: '⭐', text: 'Почему светят звёзды?', category: 'Космос' },
  { emoji: '🌿', text: 'Почему трава зелёная?', category: 'Природа' },
  { emoji: '😴', text: 'Почему нужно спать?', category: 'Наука' },
  { emoji: '🌈', text: 'Откуда берётся радуга?', category: 'Природа' },
  { emoji: '🦕', text: 'Где жили динозавры?', category: 'История' },
];

export default function AppHome() {
  const navigate = useNavigate();
  const { profile, stories, isPremium, freeStoriesLeft, storiesCreated, streak, generateStory, isGenerating } = useApp();
  const [question, setQuestion] = useState('');
  const [voiceContext, setVoiceContext] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceTranscript = (data: { question: string; context: string }) => {
    setQuestion(data.question);
    setVoiceContext(data.context);
    setIsRecording(false);
  };

  const handleGenerate = async () => {
    if (!question.trim()) return;
    if (!isPremium && storiesCreated >= 3) {
      navigate('/paywall');
      return;
    }
    const story = await generateStory(question.trim(), voiceContext);
    if (story) navigate(`/story/${story.id}`);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="relative flex justify-center mb-6">
            <Sparkles className="h-20 w-20 text-yellow-300 animate-pulse" />
            <Sparkles className="h-20 w-20 text-yellow-200 animate-ping absolute opacity-30" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Создаю волшебную сказку...</h2>
          <p className="text-purple-100 mb-8">Подбираю идеальные слова для {profile?.name}</p>
          <div className="flex justify-center gap-2">
            {[0, 150, 300].map(delay => (
              <div key={delay} className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentStories = stories.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-bold text-purple-700">Почемучки</span>
        {isPremium && (
          <span className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full">
            Premium ✨
          </span>
        )}
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Welcome card */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Привет, {profile?.name}! 👋</h2>
              <p className="text-purple-100 text-sm">Что сегодня узнаем?</p>
            </div>
            <div className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5">
              <Flame className="h-4 w-4 text-orange-300" />
              <span className="text-sm font-bold">{streak} дн.</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <StatBox label="Сказок" value={stories.length} />
            <StatBox label="Избранных" value={stories.filter(s => s.isSaved).length} />
            <StatBox label={isPremium ? 'Осталось' : 'Осталось'} value={isPremium ? '∞' : String(freeStoriesLeft)} />
          </div>
        </div>

        {/* Free stories counter */}
        {!isPremium && (
          <div className={`rounded-xl p-3 border flex items-start gap-2 ${
            freeStoriesLeft === 0
              ? 'bg-red-50 border-red-200'
              : freeStoriesLeft === 1
              ? 'bg-orange-50 border-orange-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              freeStoriesLeft === 0 ? 'text-red-500' : freeStoriesLeft === 1 ? 'text-orange-500' : 'text-blue-500'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                freeStoriesLeft === 0 ? 'text-red-700' : freeStoriesLeft === 1 ? 'text-orange-700' : 'text-blue-700'
              }`}>
                {freeStoriesLeft === 0
                  ? 'Бесплатные сказки закончились'
                  : `Осталось ${freeStoriesLeft} бесплатных ${getStoriesLabel(freeStoriesLeft)}`}
              </p>
              <button onClick={() => navigate('/pricing')} className="text-xs text-purple-600 underline mt-0.5">
                Получить безлимит →
              </button>
            </div>
          </div>
        )}

        {/* Question input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Sparkles className="h-4 w-4 text-purple-500" />
            О чём хочет узнать {profile?.name}?
          </label>
          <div className="relative mb-3">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Задайте любой вопрос..."
              rows={3}
              className="w-full px-4 py-3 pr-14 border-2 border-gray-200 rounded-xl resize-none focus:border-purple-400 transition-colors text-gray-700 text-sm"
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                className={isRecording ? '' : ''}
              />
            </div>
          </div>

          {voiceContext && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{voiceContext}</p>
            </div>
          )}

          {isRecording && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-sm text-red-600">🎤 Слушаю... Опишите вопрос и ситуацию</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!question.trim()}
            className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 ${
              question.trim()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Получить сказку {!isPremium && `(${freeStoriesLeft} осталось)`}
          </button>
        </div>

        {/* Popular questions */}
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-3">Популярные вопросы</h3>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_QUESTIONS.map(q => (
              <button
                key={q.text}
                onClick={() => setQuestion(q.text)}
                className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md active:scale-95 ${
                  question === q.text ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white hover:border-purple-200'
                }`}
              >
                <div className="text-2xl mb-1">{q.emoji}</div>
                <p className="text-xs font-medium text-gray-700 line-clamp-2">{q.text}</p>
                <p className="text-xs text-gray-400 mt-1">{q.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent stories */}
        {recentStories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-800">Недавние сказки</h3>
              <button onClick={() => navigate('/library')} className="text-sm text-purple-600 font-medium">
                Все сказки →
              </button>
            </div>
            <div className="space-y-2">
              {recentStories.map(story => (
                <button
                  key={story.id}
                  onClick={() => navigate(`/story/${story.id}`)}
                  className="w-full bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all text-left"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">📖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{story.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{story.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {story.rating > 0 && (
                        <span className="text-xs text-yellow-500">{'⭐'.repeat(story.rating)}</span>
                      )}
                      {story.isSaved && <span className="text-xs text-red-400">❤️</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/20 rounded-xl py-2 px-1">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-purple-100">{label}</div>
    </div>
  );
}

function getStoriesLabel(n: number): string {
  if (n === 1) return 'сказки';
  if (n >= 2 && n <= 4) return 'сказки';
  return 'сказок';
}
