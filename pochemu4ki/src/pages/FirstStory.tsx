import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText } from 'lucide-react';
import { useApp } from '../context';
import VoiceInput from '../components/VoiceInput';

const QUICK_QUESTIONS = [
  { emoji: '🌧️', text: 'Почему идёт дождь?' },
  { emoji: '⭐', text: 'Почему светят звёзды?' },
  { emoji: '🌿', text: 'Почему трава зелёная?' },
];

export default function FirstStory() {
  const navigate = useNavigate();
  const { profile, generateStory, isGenerating } = useApp();
  const [question, setQuestion] = useState('');
  const [voiceContext, setVoiceContext] = useState('');

  const handleVoiceTranscript = (data: { question: string; context: string }) => {
    setQuestion(data.question);
    setVoiceContext(data.context);
  };

  const handleGenerate = async () => {
    if (!question.trim()) return;
    const story = await generateStory(question.trim(), voiceContext);
    if (story) {
      navigate(`/story/${story.id}`);
    }
  };

  if (isGenerating) {
    return <GeneratingScreen name={profile?.name || 'друг'} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-16 w-16 text-yellow-300 animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Отлично, {profile?.name}! 🎉
          </h1>
          <p className="text-purple-100 text-lg">
            Теперь давай создадим твою первую волшебную сказку!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            О чём хочет узнать {profile?.name}?
          </label>

          <div className="relative mb-4">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Например: Почему небо голубое? Откуда берётся снег?"
              rows={3}
              className="w-full px-4 py-3 pr-14 border-2 border-gray-200 rounded-xl resize-none focus:border-purple-400 transition-colors text-gray-700"
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>
          </div>

          {/* Voice context */}
          {voiceContext && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{voiceContext}</p>
            </div>
          )}

          {/* Quick questions */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Или выбери готовый вопрос:</p>
            <div className="flex flex-col gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q.text}
                  onClick={() => setQuestion(q.text)}
                  className={`text-left px-3 py-2 rounded-xl border transition-all text-sm flex items-center gap-2 ${
                    question === q.text
                      ? 'border-purple-400 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 text-gray-600'
                  }`}
                >
                  <span>{q.emoji}</span>
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!question.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              question.trim()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Создать мою первую сказку!
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">⚡ Это займёт всего 30 секунд</p>
        </div>
      </div>
    </div>
  );
}

function GeneratingScreen({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="relative flex justify-center mb-6">
          <Sparkles className="h-20 w-20 text-yellow-300 animate-pulse" />
          <Sparkles className="h-20 w-20 text-yellow-200 animate-ping absolute opacity-30" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Создаю волшебную сказку...</h2>
        <p className="text-purple-100 mb-8">Подбираю идеальные слова для {name}</p>
        <div className="flex justify-center gap-2">
          {[0, 150, 300].map(delay => (
            <div
              key={delay}
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
