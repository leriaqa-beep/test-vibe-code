export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  storiesUsed: number;
}

export interface Toy {
  id: string;
  nickname: string;    // Пушинка
  type: string;        // зайка
  description: string; // серый плюшевый
}

export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'boy' | 'girl';
  hero: { name: string; emoji: string };
  toys: Toy[];
  useToys: boolean;
  interests: string[];
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  childId: string;
  title: string;
  question: string;
  context: string;
  content: string;
  imageUrl: string;
  isSaved: boolean;
  rating: number;
  readCount: number;
  createdAt: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isPopular?: boolean;
  storiesLimit: number | null; // null = unlimited
}

export const FREE_STORY_LIMIT = 3;
