import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import ChildSetup from './pages/ChildSetup';
import NewStory from './pages/NewStory';
import StoryView from './pages/StoryView';
import Library from './pages/Library';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected app */}
            <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/app/children/new" element={<ProtectedRoute><ChildSetup /></ProtectedRoute>} />
            <Route path="/app/children/:childId/story" element={<ProtectedRoute><NewStory /></ProtectedRoute>} />
            <Route path="/app/story/:id" element={<ProtectedRoute><StoryView /></ProtectedRoute>} />
            <Route path="/app/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/app/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />

            {/* Public static */}
            <Route path="/privacy" element={<Privacy />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
