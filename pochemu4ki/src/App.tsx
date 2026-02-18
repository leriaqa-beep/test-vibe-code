import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import StreakCelebration from './components/StreakCelebration';

import Onboarding from './pages/Onboarding';
import FirstStory from './pages/FirstStory';
import AppHome from './pages/AppHome';
import Library from './pages/Library';
import StoryView from './pages/StoryView';
import Profile from './pages/Profile';
import Paywall from './pages/Paywall';
import Pricing from './pages/Pricing';
import PremiumSuccess from './pages/PremiumSuccess';

function AppRoutes() {
  const { profile } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={profile ? '/app' : '/onboarding'} replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/first-story" element={<FirstStory />} />
        <Route path="/app" element={<AppHome />} />
        <Route path="/library" element={<Library />} />
        <Route path="/story/:id" element={<StoryView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/premium-success" element={<PremiumSuccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <StreakCelebration />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
