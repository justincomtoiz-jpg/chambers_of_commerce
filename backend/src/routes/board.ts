import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { PreApplication } from '../entities/PreApplication';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';
import { v4 as uuidv4 } from 'uuid';
import { Business } from '../entities/Business';

const router = Router();
router.use(authMiddleware);

// Get board review queue
router.get('/queue', requireGrade(2), async (req, res) => {
  const repo = AppDataSource.getRepository(PreApplication);
  const list = await repo.find({
    where: { status: 'BoardReview' },
    order: { createdAt: 'DESC' },
  });
  res.json(list);
});

// Board decision: send to Commissioner, or back to PreApp/Quarantine/Reject
router.post('/:id/decision', requireGrade(2), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const { decision } = req.body; // 'ToCommissioner' | 'PreApplication' | 'Quarantine' | 'Reject'
  const repo = AppDataSource.getRepository(PreApplication);
  const pre = await repo.findOneBy({ id });
  if (!pre) return res.status(404).json({ error: 'Not found' });

  if (decision === 'ToCommissioner') {
    pre.status = 'CommissionerReview';
  } else if (decision === 'PreApplication') {
    pre.status = 'PendingReview';
  } else if (decision === 'Quarantine') {
    pre.status = 'Quarantined';
  } else if (decision === 'Reject') {
    pre.status = 'Rejected';
  } else {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  await repo.save(pre);
  await createLog(
    'BoardReview',
    id,
    'Decision',
    req.user!.id,
    req.user!.grade,
    { decision }
  );

  res.json(pre);
});

export default router;
