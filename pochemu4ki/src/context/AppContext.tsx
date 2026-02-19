import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ChildProfile, Story } from '../types';
import { api } from '../api/client';

interface AppContextValue {
  children: ChildProfile[];
  stories: Story[];
  isGenerating: boolean;
  loadChildren: () => Promise<void>;
  loadStories: (childId?: string) => Promise<void>;
  generateStory: (childId: string, question: string, context: string) => Promise<Story | null>;
  updateStory: (id: string, data: { isSaved?: boolean; rating?: number }) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  addChild: (data: Partial<ChildProfile>) => Promise<ChildProfile>;
  updateChild: (id: string, data: Partial<ChildProfile>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children: childrenProp }: { children: ReactNode }) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadChildren = useCallback(async () => {
    const data = await api.children.list();
    setChildren(data);
  }, []);

  const loadStories = useCallback(async (childId?: string) => {
    const data = await api.stories.list(childId);
    setStories(data);
  }, []);

  const generateStory = useCallback(async (childId: string, question: string, context: string): Promise<Story | null> => {
    setIsGenerating(true);
    try {
      const story = await api.stories.generate(childId, question, context);
      setStories(prev => [story, ...prev]);
      return story;
    } catch (err) {
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateStory = useCallback(async (id: string, data: { isSaved?: boolean; rating?: number }) => {
    const updated = await api.stories.update(id, data);
    setStories(prev => prev.map(s => s.id === id ? updated : s));
  }, []);

  const deleteStory = useCallback(async (id: string) => {
    await api.stories.delete(id);
    setStories(prev => prev.filter(s => s.id !== id));
  }, []);

  const addChild = useCallback(async (data: Partial<ChildProfile>): Promise<ChildProfile> => {
    const child = await api.children.create(data);
    setChildren(prev => [...prev, child]);
    return child;
  }, []);

  const updateChild = useCallback(async (id: string, data: Partial<ChildProfile>) => {
    const updated = await api.children.update(id, data);
    setChildren(prev => prev.map(c => c.id === id ? updated : c));
  }, []);

  const deleteChild = useCallback(async (id: string) => {
    await api.children.delete(id);
    setChildren(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      children, stories, isGenerating,
      loadChildren, loadStories, generateStory,
      updateStory, deleteStory,
      addChild, updateChild, deleteChild,
    }}>
      {childrenProp}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
