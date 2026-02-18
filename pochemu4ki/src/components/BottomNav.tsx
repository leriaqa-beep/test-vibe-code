import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, User } from 'lucide-react';

const TABS = [
  { path: '/app', label: 'Главная', Icon: Home },
  { path: '/library', label: 'Библиотека', Icon: BookOpen },
  { path: '/profile', label: 'Профиль', Icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-inset-bottom">
      <div className="flex">
        {TABS.map(({ path, label, Icon }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                active ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
              {active && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-purple-600 rounded-t-full" style={{ marginBottom: '-1px' }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
