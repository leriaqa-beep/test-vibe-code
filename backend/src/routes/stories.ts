import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store, Story } from '../db/store';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateStory } from '../services/storyGenerator';

const router = Router();
router.use(authMiddleware);

const FREE_STORY_LIMIT = 3;

// POST /api/stories/generate
router.post('/generate', async (req: AuthRequest, res: Response) => {
  const { childId, question, context } = req.body;
  if (!childId || !question) {
    res.status(400).json({ error: 'childId и вопрос обязательны' });
    return;
  }
  const child = await store.getChildById(childId);
  if (!child || child.userId !== req.userId) {
    res.status(404).json({ error: 'Профиль ребёнка не найден' });
    return;
  }
  const user = await store.getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }
  if (!user.isPremium && user.storiesUsed >= FREE_STORY_LIMIT) {
    res.status(403).json({ error: 'Исчерпан лимит бесплатных историй', code: 'LIMIT_REACHED' });
    return;
  }

  const storyId = uuidv4();
  const generated = await generateStory({ storyId, question: question.trim(), context: context?.trim() || '', child });

  const story: Story = {
    id: storyId,
    userId: req.userId!,
    childId,
    title: generated.title,
    question: question.trim(),
    context: context?.trim() || '',
    content: generated.content,
    imageUrl: generated.imageUrl,
    isSaved: false,
    rating: 0,
    readCount: 0,
    createdAt: new Date().toISOString(),
  };

  await store.saveStory(story);
  user.storiesUsed = (user.storiesUsed || 0) + 1;
  await store.saveUser(user);

  res.status(201).json(story);
});

// GET /api/stories
router.get('/', async (req: AuthRequest, res: Response) => {
  const { childId } = req.query;
  let stories = await store.getStoriesByUser(req.userId!);
  if (childId) stories = stories.filter(s => s.childId === childId);
  res.json(stories);
});

// GET /api/stories/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const story = await store.getStoryById(req.params.id);
  if (!story || story.userId !== req.userId) {
    res.status(404).json({ error: 'История не найдена' });
    return;
  }
  // Increment readCount
  story.readCount = (story.readCount || 0) + 1;
  await store.saveStory(story);
  res.json(story);
});

// PUT /api/stories/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const story = await store.getStoryById(req.params.id);
  if (!story || story.userId !== req.userId) {
    res.status(404).json({ error: 'История не найдена' });
    return;
  }
  const { isSaved, rating } = req.body;
  if (isSaved !== undefined) story.isSaved = Boolean(isSaved);
  if (rating !== undefined) story.rating = Number(rating);
  await store.saveStory(story);
  res.json(story);
});

// DELETE /api/stories/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const story = await store.getStoryById(req.params.id);
  if (!story || story.userId !== req.userId) {
    res.status(404).json({ error: 'История не найдена' });
    return;
  }
  await store.deleteStory(req.params.id);
  res.json({ success: true });
});

export default router;
