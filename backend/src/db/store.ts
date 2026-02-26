import * as fs from 'fs';
import * as path from 'path';

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

// --- Local JSON persistence ---

interface DbData {
  users: Record<string, User>;
  children: Record<string, ChildProfile>;
  stories: Record<string, Story>;
}

const DB_PATH = path.join(__dirname, '../../../data/db.json');

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadDb(): DbData {
  ensureDir();
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch {}
  return { users: {}, children: {}, stories: {} };
}

function saveDb(db: DbData) {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// --- Store ---

export const store = {
  // Users
  async getUserById(id: string): Promise<User | undefined> {
    return loadDb().users[id];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = loadDb();
    return Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const db = loadDb();
    return Object.values(db.users).find(u => u.googleId === googleId);
  },

  async saveUser(user: User): Promise<void> {
    const db = loadDb();
    db.users[user.id] = user;
    saveDb(db);
  },

  // Children
  async getChildrenByUser(userId: string): Promise<ChildProfile[]> {
    const db = loadDb();
    return Object.values(db.children)
      .filter(c => c.userId === userId);
  },

  async getChildById(id: string): Promise<ChildProfile | undefined> {
    return loadDb().children[id];
  },

  async saveChild(child: ChildProfile): Promise<void> {
    const db = loadDb();
    db.children[child.id] = child;
    saveDb(db);
  },

  async deleteChild(id: string): Promise<void> {
    const db = loadDb();
    delete db.children[id];
    saveDb(db);
  },

  // Stories
  async getStoriesByUser(userId: string): Promise<Story[]> {
    const db = loadDb();
    return Object.values(db.stories)
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getStoryById(id: string): Promise<Story | undefined> {
    return loadDb().stories[id];
  },

  async saveStory(story: Story): Promise<void> {
    const db = loadDb();
    db.stories[story.id] = story;
    saveDb(db);
  },

  async deleteStory(id: string): Promise<void> {
    const db = loadDb();
    delete db.stories[id];
    saveDb(db);
  },
};
