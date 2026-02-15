import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { Inspection } from '../entities/Inspection';
import { Business } from '../entities/Business';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authMiddleware);

// Create inspection (anyone with grade 0+)
router.post('/', requireGrade(0), async (req: AuthRequest, res) => {
  const { targetId, targetType, justification, notes } = req.body;
  if (!targetId || !targetType || !justification || !notes)
    return res.status(400).json({ error: 'Missing fields' });

  // Validate target exists
  const businessRepo = AppDataSource.getRepository(Business);
  const target = await businessRepo.findOneBy({ id: targetId });
  if (!target) return res.status(404).json({ error: 'Target not found' });

  const repo = AppDataSource.getRepository(Inspection);
  const inspection = repo.create({
    id: uuidv4(),
    targetId,
    targetType,
    justification,
    notes,
    status: 'Pending',
    inspectorId: req.user!.id,
  });
  await repo.save(inspection);

  // Quarantine inspections go to Quarantined Inspections for review
  if (justification === 'PD Requested') {
    inspection.status = 'Quarantined';
    await repo.save(inspection);
  }

  await createLog(
    'Inspection',
    inspection.id,
    'Create',
    req.user!.id,
    req.user!.grade,
    { after: inspection }
  );

  res.json(inspection);
});

// Get inspections by status
router.get('/', requireGrade(0), async (req, res) => {
  const status = String(req.query.status || '');
  const repo = AppDataSource.getRepository(Inspection);
  const where = status ? { status } : {};
  const list = await repo.find({ where, order: { createdAt: 'DESC' } });
  res.json(list);
});

// Quarantined inspections review (Board Member or Commissioner)
router.post('/:id/release', requireGrade(2), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const repo = AppDataSource.getRepository(Inspection);
  const insp = await repo.findOneBy({ id });
  if (!insp) return res.status(404).json({ error: 'Not found' });

  insp.status = 'Completed';
  await repo.save(insp);

  await createLog(
    'Inspection',
    id,
    'ReleaseFromQuarantine',
    req.user!.id,
    req.user!.grade,
    { after: insp }
  );

  res.json(insp);
});

// Mark inspection completed (inspector)
router.post('/:id/complete', requireGrade(0), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const repo = AppDataSource.getRepository(Inspection);
  const insp = await repo.findOneBy({ id });
  if (!insp) return res.status(404).json({ error: 'Not found' });

  insp.status = 'Completed';
  await repo.save(insp);

  await createLog('Inspection', id, 'Complete', req.user!.id, req.user!.grade, {
    after: insp,
  });

  res.json(insp);
});

export default router;
