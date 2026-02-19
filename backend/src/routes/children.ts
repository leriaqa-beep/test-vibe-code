import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store, ChildProfile, Toy } from '../db/store';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/children
router.get('/', (req: AuthRequest, res: Response) => {
  const children = store.getChildrenByUser(req.userId!);
  res.json(children);
});

// POST /api/children
router.post('/', (req: AuthRequest, res: Response) => {
  const { name, age, gender, hero, toys, interests } = req.body;
  if (!name || !age || !gender) {
    res.status(400).json({ error: 'Имя, возраст и пол обязательны' });
    return;
  }
  const child: ChildProfile = {
    id: uuidv4(),
    userId: req.userId!,
    name: name.trim(),
    age: Number(age),
    gender,
    hero: hero || { name: 'Волшебный дракон', emoji: '🐉' },
    toys: (toys || []).map((t: Partial<Toy>) => ({ ...t, id: t.id || uuidv4() })),
    interests: interests || [],
    createdAt: new Date().toISOString(),
  };
  store.saveChild(child);
  res.status(201).json(child);
});

// PUT /api/children/:id
router.put('/:id', (req: AuthRequest, res: Response) => {
  const child = store.getChildById(req.params.id);
  if (!child || child.userId !== req.userId) {
    res.status(404).json({ error: 'Профиль не найден' });
    return;
  }
  const { name, age, gender, hero, toys, interests } = req.body;
  const updated: ChildProfile = {
    ...child,
    ...(name && { name: name.trim() }),
    ...(age && { age: Number(age) }),
    ...(gender && { gender }),
    ...(hero && { hero }),
    ...(toys !== undefined && { toys: toys.map((t: Partial<Toy>) => ({ ...t, id: t.id || uuidv4() })) }),
    ...(interests !== undefined && { interests }),
  };
  store.saveChild(updated);
  res.json(updated);
});

// DELETE /api/children/:id
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const child = store.getChildById(req.params.id);
  if (!child || child.userId !== req.userId) {
    res.status(404).json({ error: 'Профиль не найден' });
    return;
  }
  store.deleteChild(req.params.id);
  res.json({ success: true });
});

export default router;
