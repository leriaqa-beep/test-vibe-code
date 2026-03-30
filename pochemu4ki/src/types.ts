export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  storiesUsed: number;
  isAdmin?: boolean;
}

export interface AdminUserEntry {
  id: string;
  email: string;
  createdAt: string;
  storiesUsed: number;
  isPremium: boolean;
  childrenCount: number;
  planExpiresAt?: string;
}

export interface AdminFeedbackEntry {
  id: string;
  userId: string | null;
  userEmail: string | null;
  text: string;
  rating: number | null;
  page: string | null;
  createdAt: string;
}

export interface AdminFunnel {
  signups: number;
  firstStory: number;
  twoPlus: number;
  rated: number;
  premium: number;
}

export interface AdminStats {
  totalUsers: number;
  totalStories: number;
  totalChildren: number;
  newUsersWeek: number;
  newUsersMonth: number;
  newStoriesWeek: number;
  newStoriesMonth: number;
  newStoriesPeriod: number;
  usersWithStories: number;
  premiumCount: number;
  avgRating: number;
  storiesByDay: { date: string; count: number }[];
  userList: AdminUserEntry[];
  referralSources: { source: string; count: number }[];
  usersWithoutReferral: number;
  funnel: AdminFunnel;
  heatmap: number[][];
  days: number;
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
  heroUsed?: { name: string; emoji: string; imageUrl?: string };
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
