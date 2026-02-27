import { supabase } from './supabase';

// --- Types ---

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  googleId?: string;
  createdAt: string;
  isPremium: boolean;
  storiesUsed: number;
}

export interface Toy {
  id: string;
  nickname: string;
  type: string;
  description: string;
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

// --- Mappers: snake_case (DB) → camelCase (TypeScript) ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash || '',
    googleId: row.google_id || undefined,
    createdAt: row.created_at,
    isPremium: row.is_premium,
    storiesUsed: row.stories_used,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChild(row: any): ChildProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    hero: row.hero,
    toys: row.toys || [],
    useToys: row.use_toys,
    interests: row.interests || [],
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStory(row: any): Story {
  return {
    id: row.id,
    userId: row.user_id,
    childId: row.child_id || '',
    title: row.title,
    question: row.question,
    context: row.context || '',
    content: row.content,
    imageUrl: row.image_url || '',
    isSaved: row.is_saved,
    rating: row.rating || 0,
    readCount: row.read_count || 0,
    createdAt: row.created_at,
  };
}

// --- Store ---

export const store = {
  // Users
  async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return mapUser(data);
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();
    if (error || !data) return undefined;
    return mapUser(data);
  },

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();
    if (error || !data) return undefined;
    return mapUser(data);
  },

  async saveUser(user: User): Promise<void> {
    const { error } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: user.email,
        password_hash: user.passwordHash,
        google_id: user.googleId || null,
        is_premium: user.isPremium,
        stories_used: user.storiesUsed,
        created_at: user.createdAt,
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
  },

  // Children
  async getChildrenByUser(userId: string): Promise<ChildProfile[]> {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', userId);
    if (error || !data) return [];
    return data.map(mapChild);
  },

  async getChildById(id: string): Promise<ChildProfile | undefined> {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return mapChild(data);
  },

  async saveChild(child: ChildProfile): Promise<void> {
    const { error } = await supabase.from('children').upsert(
      {
        id: child.id,
        user_id: child.userId,
        name: child.name,
        age: child.age,
        gender: child.gender,
        hero: child.hero,
        toys: child.toys,
        use_toys: child.useToys,
        interests: child.interests,
        created_at: child.createdAt,
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
  },

  async deleteChild(id: string): Promise<void> {
    const { error } = await supabase.from('children').delete().eq('id', id);
    if (error) throw error;
  },

  // Stories
  async getStoriesByUser(userId: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapStory);
  },

  async getStoryById(id: string): Promise<Story | undefined> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return undefined;
    return mapStory(data);
  },

  async saveStory(story: Story): Promise<void> {
    const { error } = await supabase.from('stories').upsert(
      {
        id: story.id,
        user_id: story.userId,
        child_id: story.childId || null,
        title: story.title,
        question: story.question,
        context: story.context,
        content: story.content,
        image_url: story.imageUrl,
        is_saved: story.isSaved,
        rating: story.rating,
        read_count: story.readCount,
        created_at: story.createdAt,
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
  },

  async deleteStory(id: string): Promise<void> {
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) throw error;
  },
};
