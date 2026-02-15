import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { PDRequest } from '../entities/PDRequest';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authMiddleware);

// Create PD Request (PD)
router.post('/', requireGrade(0), async (req: AuthRequest, res) => {
  const { targetId, targetType, reason } = req.body;
  if (!targetId || !targetType)
    return res.status(400).json({ error: 'Missing fields' });

  const repo = AppDataSource.getRepository(PDRequest);
  const pr = repo.create({
    id: uuidv4(),
    requestedBy: req.user!.id,
    targetId,
    targetType,
    reason,
    status: 'Pending',
  });
  await repo.save(pr);

  await createLog('PDRequest', pr.id, 'Create', req.user!.id, req.user!.grade, {
    after: pr,
  });

  res.json(pr);
});

// Approve / Deny (Board+)
router.post('/:id/decision', requireGrade(2), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const { decision } = req.body; // 'Approve' | 'Deny' | 'Quarantine'
  const repo = AppDataSource.getRepository(PDRequest);
  const pr = await repo.findOneBy({ id });
  if (!pr) return res.status(404).json({ error: 'Not found' });

  if (decision === 'Approve') pr.status = 'Approved';
  else if (decision === 'Deny') pr.status = 'Denied';
  else if (decision === 'Quarantine') pr.status = 'Quarantined';
  else return res.status(400).json({ error: 'Invalid decision' });

  await repo.save(pr);
  await createLog('PDRequest', id, 'Decision', req.user!.id, req.user!.grade, {
    decision,
  });

  res.json(pr);
});

export default router;
