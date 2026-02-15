import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { PreApplication } from '../entities/PreApplication';
import { Business } from '../entities/Business';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authMiddleware);

// Commissioner queue
router.get('/queue', requireGrade(3), async (req, res) => {
  const repo = AppDataSource.getRepository(PreApplication);
  const list = await repo.find({
    where: { status: 'CommissionerReview' },
    order: { createdAt: 'DESC' },
  });
  res.json(list);
});

// Commissioner decision: Approve -> create Business/Event/Freelancer; or send back
router.post('/:id/decision', requireGrade(3), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const { decision, taxRate, expiry } = req.body; // decision: 'Approve' | 'PreApplication' | 'Quarantine' | 'Reject'
  const repo = AppDataSource.getRepository(PreApplication);
  const pre = await repo.findOneBy({ id });
  if (!pre) return res.status(404).json({ error: 'Not found' });

  if (decision === 'Approve') {
    // create business/event
    const businessRepo = AppDataSource.getRepository(Business);
    const business = businessRepo.create({
      id: uuidv4(),
      sourcePreAppId: pre.id,
      name: pre.businessName,
      type: pre.type,
      data: pre,
      active: true,
      taxRate: taxRate ?? 0,
      expiry: expiry ? new Date(expiry) : null,
    });
    await businessRepo.save(business);

    pre.status = 'CommissionerReview';
    await repo.save(pre);

    await createLog(
      'Commissioner',
      id,
      'Approve',
      req.user!.id,
      req.user!.grade,
      { businessId: business.id }
    );
    return res.json({ pre, business });
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
    'Commissioner',
    id,
    'Decision',
    req.user!.id,
    req.user!.grade,
    { decision }
  );

  res.json(pre);
});

export default router;
