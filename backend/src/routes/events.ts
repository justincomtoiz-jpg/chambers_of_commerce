import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { Business } from '../entities/Business';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';

const router = Router();
router.use(authMiddleware);

// Get events (type === 'Event')
router.get('/', requireGrade(0), async (req, res) => {
  const repo = AppDataSource.getRepository(Business);
  const list = await repo.find({
    where: { type: 'Event' },
    order: { createdAt: 'DESC' },
  });
  res.json(list);
});

// Auto-delete expired one-off events: endpoint to run cleanup (cron or manual)
router.post(
  '/cleanup-expired',
  requireGrade(3),
  async (req: AuthRequest, res) => {
    const repo = AppDataSource.getRepository(Business);
    const now = new Date();
    const expired = await repo
      .createQueryBuilder('b')
      .where('b.type = :type', { type: 'Event' })
      .andWhere('b.expiry IS NOT NULL')
      .andWhere('b.expiry <= :now', { now })
      .getMany();

    for (const e of expired) {
      e.active = false;
      await repo.save(e);
      await createLog('Event', e.id, 'Expire', req.user!.id, req.user!.grade, {
        after: e,
      });
    }

    res.json({ expiredCount: expired.length });
  }
);

export default router;
