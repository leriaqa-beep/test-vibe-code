export interface Profile {
  name: string;
  age: number; // 3-8
  gender: 'boy' | 'girl';
  hero: string;
  heroEmoji: string;
  interests: string[];
  createdAt: string;
}

export interface CustomHero {
  id: string;
  name: string; // "Кошка Пушинка"
  emoji: string;
  description: string;
  isCustom: true;
}

export interface Story {
  id: string;
  title: string;
  question: string;
  content: string;
  imageUrl: string;
  isSaved: boolean;
  rating: number; // 0-5
  readCount: number;
  createdAt: string;
}

export interface PricingPlan {
  id: 'monthly' | 'annual' | 'book' | 'family';
  name: string;
  price: number;
  period: string;
  originalPrice?: number;
  savings?: number;
  icon: string;
  popular: boolean;
  features: string[];
}

export interface AppState {
  profile: Profile | null;
  stories: Story[];
  isPremium: boolean;
  storiesCreated: number;
  customHeroes: CustomHero[];
  streak: number;
  lastVisit: string;
}
