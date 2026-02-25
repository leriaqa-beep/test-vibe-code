import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

// --- Mappers ---

function toUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: (row.password_hash as string) ?? '',
    googleId: (row.google_id as string | null) ?? undefined,
    createdAt: row.created_at as string,
    isPremium: row.is_premium as boolean,
    storiesUsed: row.stories_used as number,
  };
}

function fromUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    password_hash: user.passwordHash,
    google_id: user.googleId ?? null,
    created_at: user.createdAt,
    is_premium: user.isPremium,
    stories_used: user.storiesUsed,
  };
}

function toChild(row: Record<string, unknown>): ChildProfile {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    age: row.age as number,
    gender: row.gender as 'boy' | 'girl',
    hero: row.hero as { name: string; emoji: string },
    toys: (row.toys as Toy[]) ?? [],
    interests: (row.interests as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

function fromChild(child: ChildProfile) {
  return {
    id: child.id,
    user_id: child.userId,
    name: child.name,
    age: child.age,
    gender: child.gender,
    hero: child.hero,
    toys: child.toys,
    interests: child.interests,
    created_at: child.createdAt,
  };
}

function toStory(row: Record<string, unknown>): Story {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    childId: row.child_id as string,
    title: row.title as string,
    question: row.question as string,
    context: (row.context as string) ?? '',
    content: row.content as string,
    imageUrl: row.image_url as string,
    isSaved: row.is_saved as boolean,
    rating: row.rating as number,
    readCount: row.read_count as number,
    createdAt: row.created_at as string,
  };
}

function fromStory(story: Story) {
  return {
    id: story.id,
    user_id: story.userId,
    child_id: story.childId,
    title: story.title,
    question: story.question,
    context: story.context,
    content: story.content,
    image_url: story.imageUrl,
    is_saved: story.isSaved,
    rating: story.rating,
    read_count: story.readCount,
    created_at: story.createdAt,
  };
}

// --- Store ---

export const store = {
  // Users
  async getUserById(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    return data ? toUser(data) : undefined;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').ilike('email', email).maybeSingle();
    return data ? toUser(data) : undefined;
  },

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('google_id', googleId).maybeSingle();
    return data ? toUser(data) : undefined;
  },

  async saveUser(user: User): Promise<void> {
    await supabase.from('users').upsert(fromUser(user), { onConflict: 'id' });
  },

  // Children
  async getChildrenByUser(userId: string): Promise<ChildProfile[]> {
    const { data } = await supabase.from('children').select('*').eq('user_id', userId);
    return (data ?? []).map(toChild);
  },

  async getChildById(id: string): Promise<ChildProfile | undefined> {
    const { data } = await supabase.from('children').select('*').eq('id', id).maybeSingle();
    return data ? toChild(data) : undefined;
  },

  async saveChild(child: ChildProfile): Promise<void> {
    await supabase.from('children').upsert(fromChild(child), { onConflict: 'id' });
  },

  async deleteChild(id: string): Promise<void> {
    await supabase.from('children').delete().eq('id', id);
  },

  // Stories
  async getStoriesByUser(userId: string): Promise<Story[]> {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data ?? []).map(toStory);
  },

  async getStoryById(id: string): Promise<Story | undefined> {
    const { data } = await supabase.from('stories').select('*').eq('id', id).maybeSingle();
    return data ? toStory(data) : undefined;
  },

  async saveStory(story: Story): Promise<void> {
    await supabase.from('stories').upsert(fromStory(story), { onConflict: 'id' });
  },

  async deleteStory(id: string): Promise<void> {
    await supabase.from('stories').delete().eq('id', id);
  },
};
