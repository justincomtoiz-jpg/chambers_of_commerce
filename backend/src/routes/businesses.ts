import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { Business } from '../entities/Business';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';

const router = Router();
router.use(authMiddleware);

// Get all businesses
router.get('/', requireGrade(0), async (req, res) => {
  const repo = AppDataSource.getRepository(Business);
  const list = await repo.find({ order: { createdAt: 'DESC' } });
  res.json(list);
});

// Update tax rate (Senior+)
router.post('/:id/tax', requireGrade(1), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const { taxRate } = req.body;
  if (typeof taxRate !== 'number')
    return res.status(400).json({ error: 'Invalid taxRate' });

  const repo = AppDataSource.getRepository(Business);
  const b = await repo.findOneBy({ id });
  if (!b) return res.status(404).json({ error: 'Not found' });

  const before = { ...b };
  b.taxRate = taxRate;
  await repo.save(b);

  await createLog('Business', id, 'TaxChange', req.user!.id, req.user!.grade, {
    before,
    after: b,
  });

  res.json(b);
});

// Deactivate business (Commissioner)
router.post(
  '/:id/deactivate',
  requireGrade(3),
  async (req: AuthRequest, res) => {
    const id = req.params.id;
    const repo = AppDataSource.getRepository(Business);
    const b = await repo.findOneBy({ id });
    if (!b) return res.status(404).json({ error: 'Not found' });

    b.active = false;
    await repo.save(b);

    await createLog(
      'Business',
      id,
      'Deactivate',
      req.user!.id,
      req.user!.grade,
      { after: b }
    );

    res.json(b);
  }
);

export default router;
