import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Plus, Trash2, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { children, loadChildren, deleteChild } = useApp();

  useEffect(() => { loadChildren(); }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteChild = async (id: string, name: string) => {
    if (!confirm(`Удалить профиль ${name} и все его истории?`)) return;
    await deleteChild(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/app')}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-purple-600 hover:bg-purple-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Настройки</h1>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Аккаунт</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {user?.isPremium ? (
                  <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Премиум
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Бесплатный тариф</span>
                )}
              </div>
            </div>
          </div>
          {!user?.isPremium && (
            <button
              onClick={() => navigate('/app/pricing')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" /> Перейти на Премиум
            </button>
          )}
        </div>

        {/* Children */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">Профили детей</h2>
            <button
              onClick={() => navigate('/app/children/new')}
              className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:text-purple-800 transition"
            >
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>
          {children.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Профилей пока нет</p>
          ) : (
            <div className="space-y-2">
              {children.map(child => (
                <div key={child.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-2xl">{child.hero.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{child.name}</p>
                    <p className="text-xs text-gray-500">{child.age} лет · {child.toys.length} игрушки</p>
                  </div>
                  <button
                    onClick={() => handleDeleteChild(child.id, child.name)}
                    className="text-red-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Подписка</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {user?.isPremium ? 'Премиум активен' : 'Бесплатный тариф'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.isPremium ? 'Безлимитные истории' : `Использовано: ${user?.storiesUsed || 0} из 3`}
              </p>
            </div>
            {!user?.isPremium && (
              <button
                onClick={() => navigate('/app/pricing')}
                className="text-purple-600 text-sm font-semibold hover:text-purple-800 transition"
              >
                Улучшить →
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-500 font-medium py-3 rounded-2xl border border-red-200 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
