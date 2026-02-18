import { useState } from 'react';
import { Mic } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (data: { question: string; context: string }) => void;
  className?: string;
}

export default function VoiceInput({ onTranscript, className = '' }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    if (isRecording) return;
    setIsRecording(true);

    // Phase 1 Demo: mock recognition
    setTimeout(() => {
      const mockData = {
        question: 'Почему идёт дождь?',
        context: 'Смотрим в окно на дождь, ребёнок интересуется откуда вода',
      };
      onTranscript(mockData);
      setIsRecording(false);
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={isRecording}
      className={`p-3 rounded-full transition-all duration-200 text-white ${
        isRecording
          ? 'bg-red-500 animate-pulse cursor-not-allowed'
          : 'bg-purple-500 hover:bg-purple-600 active:scale-95'
      } ${className}`}
      title={isRecording ? 'Слушаю...' : 'Голосовой ввод'}
    >
      {isRecording ? (
        <div className="flex gap-1 items-center px-0.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
}
