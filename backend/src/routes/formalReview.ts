import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { FormalReview } from '../entities/FormalReview';
import { PreApplication } from '../entities/PreApplication';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// Create or update formal review (Senior Clerk or higher)
const FormalSchema = z.object({
  preApplicationId: z.string().uuid(),
  meetsCityGoals: z.boolean().nullable(),
  locationValid: z.enum(['Yes', 'No', 'Possibly']).nullable(),
  mloLink: z.string().url().nullable().optional(),
  costEstimate: z.number().int().min(0).nullable(),
  timeframeDays: z.number().int().min(0).nullable(),
  passedBackgroundCheck: z.boolean().nullable(),
  status: z.enum(['Pending', 'Completed', 'SentBack']).optional(),
});

router.post('/', requireGrade(1), async (req: AuthRequest, res) => {
  const parse = FormalSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: parse.error.errors });

  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id: parse.data.preApplicationId });
  if (!pre) return res.status(404).json({ error: 'Pre-application not found' });

  const repo = AppDataSource.getRepository(FormalReview);
  // create or update existing
  let review = await repo.findOneBy({
    preApplicationId: parse.data.preApplicationId,
  });
  if (!review) {
    review = repo.create({
      id: uuidv4(),
      ...parse.data,
      reviewedBy: req.user!.id,
      status: parse.data.status || 'Pending',
    });
  } else {
    Object.assign(review, parse.data);
    review.reviewedBy = req.user!.id;
  }
  await repo.save(review);

  await createLog(
    'FormalReview',
    review.id,
    'Upsert',
    req.user!.id,
    req.user!.grade,
    { after: review }
  );

  res.json(review);
});

// Get formal reviews (Senior+)
router.get('/', requireGrade(1), async (req, res) => {
  const repo = AppDataSource.getRepository(FormalReview);
  const list = await repo.find({ order: { createdAt: 'DESC' } });
  res.json(list);
});

// Move to Board Review (Senior+ can mark ready)
router.post(
  '/:id/send-to-board',
  requireGrade(1),
  async (req: AuthRequest, res) => {
    const id = req.params.id;
    const repo = AppDataSource.getRepository(FormalReview);
    const review = await repo.findOneBy({ id });
    if (!review) return res.status(404).json({ error: 'Not found' });

    // Validate no "No" fields
    if (
      review.locationValid === 'No' ||
      review.meetsCityGoals === 0 ||
      review.passedBackgroundCheck === 0
    ) {
      return res
        .status(400)
        .json({ error: 'Cannot send to board: contains No values' });
    }

    // Update pre-application status
    const preRepo = AppDataSource.getRepository(PreApplication);
    const pre = await preRepo.findOneBy({ id: review.preApplicationId });
    if (!pre)
      return res.status(404).json({ error: 'Pre-application not found' });

    pre.status = 'BoardReview';
    await preRepo.save(pre);

    review.status = 'Completed';
    await repo.save(review);

    await createLog(
      'FormalReview',
      id,
      'SendToBoard',
      req.user!.id,
      req.user!.grade,
      { after: review, preId: pre.id }
    );

    res.json({ review, pre });
  }
);

// Send back to Pre-Application / Quarantine / Reject
router.post(
  '/:id/send-back',
  requireGrade(1),
  async (req: AuthRequest, res) => {
    const id = req.params.id;
    const { target } = req.body; // 'PreApplication' | 'Quarantine' | 'Reject'
    const repo = AppDataSource.getRepository(FormalReview);
    const review = await repo.findOneBy({ id });
    if (!review) return res.status(404).json({ error: 'Not found' });

    const preRepo = AppDataSource.getRepository(PreApplication);
    const pre = await preRepo.findOneBy({ id: review.preApplicationId });
    if (!pre)
      return res.status(404).json({ error: 'Pre-application not found' });

    if (target === 'PreApplication') pre.status = 'PendingReview';
    else if (target === 'Quarantine') pre.status = 'Quarantined';
    else if (target === 'Reject') pre.status = 'Rejected';
    else return res.status(400).json({ error: 'Invalid target' });

    await preRepo.save(pre);
    review.status = 'SentBack';
    await repo.save(review);

    await createLog(
      'FormalReview',
      id,
      'SendBack',
      req.user!.id,
      req.user!.grade,
      { target, preId: pre.id }
    );

    res.json({ review, pre });
  }
);

export default router;
