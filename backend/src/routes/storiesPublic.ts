import { Router, Request, Response } from 'express';
import { store } from '../db/store';

const router = Router();

// GET /api/stories/public/:id — no auth required, returns story + minimal child info
router.get('/:id', async (req: Request, res: Response) => {
  const story = await store.getStoryById(req.params.id);
  if (!story) {
    res.status(404).json({ error: 'История не найдена' });
    return;
  }

  const child = story.childId ? await store.getChildById(story.childId) : null;

  res.json({
    story: {
      id: story.id,
      title: story.title,
      question: story.question,
      content: story.content,
      imageUrl: story.imageUrl,
      createdAt: story.createdAt,
    },
    child: child
      ? { name: child.name, age: child.age, gender: child.gender, hero: child.hero }
      : null,
  });
});

export default router;
