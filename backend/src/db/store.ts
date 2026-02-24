import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../../data/db.json');

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

interface DB {
  users: User[];
  children: ChildProfile[];
  stories: Story[];
}

function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readDB(): DB {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const empty: DB = { users: [], children: [], stories: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { users: [], children: [], stories: [] };
  }
}

function writeDB(db: DB): void {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const store = {
  // Users
  getUsers: (): User[] => readDB().users,
  getUserById: (id: string): User | undefined => readDB().users.find(u => u.id === id),
  getUserByEmail: (email: string): User | undefined =>
    readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  getUserByGoogleId: (googleId: string): User | undefined =>
    readDB().users.find(u => u.googleId === googleId),
  saveUser: (user: User): void => {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === user.id);
    if (idx >= 0) db.users[idx] = user;
    else db.users.push(user);
    writeDB(db);
  },

  // Children
  getChildrenByUser: (userId: string): ChildProfile[] =>
    readDB().children.filter(c => c.userId === userId),
  getChildById: (id: string): ChildProfile | undefined =>
    readDB().children.find(c => c.id === id),
  saveChild: (child: ChildProfile): void => {
    const db = readDB();
    const idx = db.children.findIndex(c => c.id === child.id);
    if (idx >= 0) db.children[idx] = child;
    else db.children.push(child);
    writeDB(db);
  },
  deleteChild: (id: string): void => {
    const db = readDB();
    db.children = db.children.filter(c => c.id !== id);
    writeDB(db);
  },

  // Stories
  getStoriesByUser: (userId: string): Story[] =>
    readDB().stories.filter(s => s.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  getStoryById: (id: string): Story | undefined =>
    readDB().stories.find(s => s.id === id),
  saveStory: (story: Story): void => {
    const db = readDB();
    const idx = db.stories.findIndex(s => s.id === story.id);
    if (idx >= 0) db.stories[idx] = story;
    else db.stories.push(story);
    writeDB(db);
  },
  deleteStory: (id: string): void => {
    const db = readDB();
    db.stories = db.stories.filter(s => s.id !== id);
    writeDB(db);
  },
};
