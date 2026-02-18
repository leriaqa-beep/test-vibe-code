import { useApp } from '../context';

export default function StreakCelebration() {
  const { storiesCreated, streak, showStreak, setShowStreak } = useApp();

  if (!showStreak) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      onClick={() => setShowStreak(false)}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-7xl mb-4">🔥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Отличная работа!</h2>
        <p className="text-gray-600 mb-6">
          Ты создал уже <strong>{storiesCreated}</strong> сказок! Так держать!
        </p>
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-5 text-white">
          <div className="text-4xl font-bold mb-1">{streak} {getDaysLabel(streak)}</div>
          <div className="text-sm opacity-90">Продолжай учиться каждый день!</div>
        </div>
        <button
          onClick={() => setShowStreak(false)}
          className="mt-4 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          Продолжить →
        </button>
      </div>
    </div>
  );
}

function getDaysLabel(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return 'дней подряд';
  if (last === 1) return 'день подряд';
  if (last >= 2 && last <= 4) return 'дня подряд';
  return 'дней подряд';
}
