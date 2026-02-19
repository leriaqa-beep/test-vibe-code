import { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
}

// Type augmentation for Web Speech API (not yet in all TS lib definitions)
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
}

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interim, setInterim] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const startRecording = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setInterim(interimTranscript);
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
        setInterim('');
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setInterim('');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterim('');
  };

  if (!isSupported) return null;

  return (
    <div className={className}>
      {interim && (
        <div className="text-xs text-purple-500 italic mb-1 px-1">{interim}...</div>
      )}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          isRecording
            ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
        }`}
        title={isRecording ? 'Остановить запись' : 'Говорите...'}
      >
        {isRecording ? (
          <>
            <Square className="w-4 h-4" />
            <span>Стоп</span>
            <span className="flex gap-0.5">
              {[1,2,3].map(i => (
                <span key={i} className="w-1 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span>Голос</span>
          </>
        )}
      </button>
    </div>
  );
}
