import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { Business } from '../entities/Business';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';

const router = Router();
router.use(authMiddleware);

// For demo: return businesses with overdue flag in data or tax unpaid days > 7
router.get('/', requireGrade(1), async (req, res) => {
  const repo = AppDataSource.getRepository(Business);
  const list = await repo.find({ order: { createdAt: 'DESC' } });

  // Example logic: business.data.lastTaxPaidAt and business.data.overdueDays
  const delinquent = list.filter((b) => {
    const lastPaid = b.data?.lastTaxPaidAt
      ? new Date(b.data.lastTaxPaidAt)
      : null;
    if (!lastPaid) return true;
    const diff = (Date.now() - lastPaid.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7;
  });

  res.json(delinquent);
});

// Mark as resolved (Senior+)
router.post('/:id/resolve', requireGrade(1), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const repo = AppDataSource.getRepository(Business);
  const b = await repo.findOneBy({ id });
  if (!b) return res.status(404).json({ error: 'Not found' });

  // update lastTaxPaidAt
  b.data = { ...b.data, lastTaxPaidAt: new Date().toISOString() };
  await repo.save(b);

  await createLog('Delinquency', id, 'Resolve', req.user!.id, req.user!.grade, {
    after: b,
  });

  res.json(b);
});

export default router;
