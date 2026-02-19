import type { Profile, Story, CustomHero } from './types';

const KEYS = {
  PROFILE: 'childProfile',
  STORIES: 'stories',
  IS_PREMIUM: 'isPremium',
  STORIES_CREATED: 'storiesCreated',
  CUSTOM_HEROES: 'customHeroes',
  STREAK: 'streak',
  LAST_VISIT: 'lastVisit',
} as const;

export const storage = {
  getProfile: (): Profile | null => {
    try {
      const raw = localStorage.getItem(KEYS.PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setProfile: (p: Profile) => localStorage.setItem(KEYS.PROFILE, JSON.stringify(p)),

  getStories: (): Story[] => {
    try {
      const raw = localStorage.getItem(KEYS.STORIES);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  setStories: (s: Story[]) => localStorage.setItem(KEYS.STORIES, JSON.stringify(s)),

  getIsPremium: (): boolean => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.IS_PREMIUM) || 'false');
    } catch { return false; }
  },
  setIsPremium: (v: boolean) => localStorage.setItem(KEYS.IS_PREMIUM, JSON.stringify(v)),

  getStoriesCreated: (): number => {
    return parseInt(localStorage.getItem(KEYS.STORIES_CREATED) || '0', 10);
  },
  setStoriesCreated: (n: number) => localStorage.setItem(KEYS.STORIES_CREATED, String(n)),

  getCustomHeroes: (): CustomHero[] => {
    try {
      const raw = localStorage.getItem(KEYS.CUSTOM_HEROES);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  setCustomHeroes: (h: CustomHero[]) => localStorage.setItem(KEYS.CUSTOM_HEROES, JSON.stringify(h)),

  getStreak: (): number => {
    return parseInt(localStorage.getItem(KEYS.STREAK) || '0', 10);
  },
  setStreak: (n: number) => localStorage.setItem(KEYS.STREAK, String(n)),

  getLastVisit: (): string => {
    return localStorage.getItem(KEYS.LAST_VISIT) || '';
  },
  setLastVisit: (d: string) => localStorage.setItem(KEYS.LAST_VISIT, d),
};
