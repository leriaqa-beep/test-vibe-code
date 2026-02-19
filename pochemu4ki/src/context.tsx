import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Profile, Story, CustomHero } from './types';
import { storage } from './storage';

interface AppContextType {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  stories: Story[];
  addStory: (s: Story) => void;
  updateStory: (id: string, changes: Partial<Story>) => void;
  isPremium: boolean;
  activatePremium: () => void;
  storiesCreated: number;
  freeStoriesLeft: number;
  customHeroes: CustomHero[];
  addCustomHero: (h: Omit<CustomHero, 'id' | 'isCustom'>) => void;
  removeCustomHero: (id: string) => void;
  streak: number;
  showStreak: boolean;
  setShowStreak: (v: boolean) => void;
  generateStory: (question: string, voiceContext?: string) => Promise<Story | null>;
  isGenerating: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const FREE_STORY_LIMIT = 3;

// Template stories for demo mode
const STORY_TEMPLATES = [
  {
    title: 'Почему идёт дождь?',
    content: `Жил-был маленький облачный паучок по имени Капелька. Он жил высоко-высоко в небе и каждый день собирал водяные капельки из воздуха.

Однажды паучок Капелька собрал так много капелек, что его домик стал очень-очень тяжёлым. "Ой-ой-ой!" — воскликнул он. "Мне нужно освободить место!"

И тогда Капелька открыл все свои кармашки, и капельки полетели вниз на землю. Вот почему идёт дождь — это облачный паучок Капелька освобождает место в своём домике!

А когда выглядывает солнышко после дождя, оно нагревает воду на земле, и она снова поднимается вверх, чтобы паучок Капелька мог снова её собрать. Вот такой круговорот воды в природе!`,
    imageUrl: '/story-placeholder.svg',
  },
  {
    title: 'Почему светят звёзды?',
    content: `В далёкой-далёкой галактике жил маленький звёздный котёнок по имени Блеск. Каждую ночь он выходил на небо и зажигал фонарики для всех детей на земле.

"Чтобы детки не боялись темноты!" — говорил котёнок Блеск, зажигая очередную звёздочку своим пушистым хвостиком.

Вот почему звёзд так много — это котёнок Блеск очень старается, чтобы у каждого ребёнка на земле была своя звёздочка-защитница!

А самая яркая звезда на небе — это его мама, которая смотрит за ним и улыбается. Найди её сегодня ночью!`,
    imageUrl: '/story-placeholder.svg',
  },
  {
    title: 'Почему трава зелёная?',
    content: `В подземном королевстве жила маленькая художница по имени Хлорофилла. Каждую весну она выходила на поверхность и раскрашивала каждую травинку своей волшебной зелёной кисточкой.

"Зелёный цвет — самый волшебный!" — говорила она. "Он помогает травинкам есть солнечный свет и расти большими!"

Хлорофилла работала так быстро, что справлялась с целыми лугами за одну весеннюю ночь. А осенью она уходила отдыхать в своё подземное королевство, и трава становилась жёлтой.

Вот почему весной всё снова зеленеет — Хлорофилла возвращается из отпуска и снова берётся за кисточку!`,
    imageUrl: '/story-placeholder.svg',
  },
  {
    title: 'Почему нужно спать?',
    content: `В голове у каждого ребёнка живут маленькие помощники — Память, Рост и Здоровье. Днём они работают изо всех сил: запоминают новые слова, помогают расти, борются с микробами.

Но к вечеру они очень-очень устают. "Нам нужен отдых!" — говорит Память. "Нам нужно разложить по полочкам всё, что мы узнали сегодня!"

И тогда приходит волшебный Сон. Он накрывает тебя тёплым одеялом из звёздного света, и пока ты спишь, помощники работают: раскладывают воспоминания, чинят царапины и ссадины, помогают вырасти чуточку выше.

Вот почему утром ты просыпаешься таким бодрым и счастливым — помощники хорошо потрудились ночью!`,
    imageUrl: '/story-placeholder.svg',
  },
  {
    title: 'Откуда берётся радуга?',
    content: `В небесном замке жила принцесса Радуга и её семь сестёр: Красная Роза, Оранжевый Апельсин, Жёлтый Лимончик, Зелёная Лягушка, Голубое Небо, Синяя Черника и Фиолетовая Слива.

После каждого дождика сёстры высыпали на небо поиграть. Они брались за руки и тянулись от одного конца неба до другого, создавая яркую дугу.

"Смотрите, мы радуга!" — кричали они, смеясь. Дети на земле видели их и улыбались.

Вот почему радуга появляется только после дождя — сёстры ждут, когда тучки уйдут, чтобы выйти поиграть. И ты теперь знаешь имена всех семи сестёр!`,
    imageUrl: '/story-placeholder.svg',
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [storiesCreated, setStoriesCreated] = useState(0);
  const [customHeroes, setCustomHeroes] = useState<CustomHero[]>([]);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setProfileState(storage.getProfile());
    setStories(storage.getStories());
    setIsPremium(storage.getIsPremium());
    setStoriesCreated(storage.getStoriesCreated());
    setCustomHeroes(storage.getCustomHeroes());

    // Streak logic
    const savedStreak = storage.getStreak();
    const lastVisit = storage.getLastVisit();
    const today = new Date().toDateString();

    if (lastVisit) {
      const last = new Date(lastVisit).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (last === yesterday) {
        setStreak(savedStreak + 1);
        storage.setStreak(savedStreak + 1);
      } else if (last === today) {
        setStreak(savedStreak);
      } else {
        setStreak(1);
        storage.setStreak(1);
      }
    } else {
      setStreak(1);
      storage.setStreak(1);
    }
    storage.setLastVisit(new Date().toISOString());
  }, []);

  const setProfile = useCallback((p: Profile) => {
    setProfileState(p);
    storage.setProfile(p);
  }, []);

  const addStory = useCallback((s: Story) => {
    setStories(prev => {
      const updated = [s, ...prev];
      storage.setStories(updated);
      return updated;
    });
  }, []);

  const updateStory = useCallback((id: string, changes: Partial<Story>) => {
    setStories(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...changes } : s);
      storage.setStories(updated);
      return updated;
    });
  }, []);

  const activatePremium = useCallback(() => {
    setIsPremium(true);
    storage.setIsPremium(true);
  }, []);

  const addCustomHero = useCallback((h: Omit<CustomHero, 'id' | 'isCustom'>) => {
    const hero: CustomHero = { ...h, id: uuidv4(), isCustom: true };
    setCustomHeroes(prev => {
      const updated = [...prev, hero];
      storage.setCustomHeroes(updated);
      return updated;
    });
  }, []);

  const removeCustomHero = useCallback((id: string) => {
    setCustomHeroes(prev => {
      const updated = prev.filter(h => h.id !== id);
      storage.setCustomHeroes(updated);
      return updated;
    });
  }, []);

  const generateStory = useCallback(async (question: string, voiceContext?: string): Promise<Story | null> => {
    if (!isPremium && storiesCreated >= FREE_STORY_LIMIT) {
      return null; // caller should redirect to paywall
    }

    setIsGenerating(true);

    try {
      // Phase 1 (Demo): use templates
      await new Promise(resolve => setTimeout(resolve, 2500));

      const template = STORY_TEMPLATES[storiesCreated % STORY_TEMPLATES.length];
      const heroName = profile?.hero || 'Единорог Радуга';
      const childName = profile?.name || 'друг';

      const newStory: Story = {
        id: uuidv4(),
        title: template.title,
        question: question || template.title,
        content: template.content.replace(/ты/g, childName === 'друг' ? 'ты' : childName),
        imageUrl: template.imageUrl,
        isSaved: false,
        rating: 0,
        readCount: 0,
        createdAt: new Date().toISOString(),
      };

      // suppress unused var warning
      void voiceContext;
      void heroName;

      addStory(newStory);

      const newCount = storiesCreated + 1;
      setStoriesCreated(newCount);
      storage.setStoriesCreated(newCount);

      // Streak celebration every 3 stories
      if (newCount > 0 && newCount % 3 === 0) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 3000);
      }

      return newStory;
    } catch (error) {
      console.error('Generation error:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isPremium, storiesCreated, profile, addStory]);

  const freeStoriesLeft = Math.max(0, FREE_STORY_LIMIT - storiesCreated);

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      stories, addStory, updateStory,
      isPremium, activatePremium,
      storiesCreated, freeStoriesLeft,
      customHeroes, addCustomHero, removeCustomHero,
      streak, showStreak, setShowStreak,
      generateStory, isGenerating,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
