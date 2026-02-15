import { Router, Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { FormalReview } from '../entities/FormalReview';
import { PreApplication } from '../entities/PreApplication';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

// Schema: accepts booleans for frontend, map to DB representation (0/1/null)
const FormalSchema = z.object({
  preApplicationId: z.string().uuid(),
  meetsCityGoals: z.boolean().nullable(),
  locationValid: z.enum(['Yes', 'No', 'Possibly']).nullable(),
  mloLink: z.string().url().nullable().optional(),
  costEstimate: z.number().int().min(0).nullable(),
  timeframeDays: z.number().int().min(0).nullable(),
  passedBackgroundCheck: z.boolean().nullable(),
  status: z.enum(['Pending', 'Completed', 'SentBack']).optional()
});

type FormalInput = z.infer<typeof FormalSchema>;

// Helper to map boolean|null -> 0|1|null
function boolToTinyInt(b: boolean | null | undefined): 0 | 1 | null {
  if (b === null || b === undefined) return null;
  return b ? 1 : 0;
}

// Create or update formal review (Senior Clerk or higher)
router.post('/', requireGrade(1), async (req: AuthRequest, res: Response) => {
  const parse = FormalSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const data: FormalInput = parse.data;

  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id: data.preApplicationId });
  if (!pre) return res.status(404).json({ error: 'Pre-application not found' });

  const repo = AppDataSource.getRepository(FormalReview);

  // Find existing review
  let review = await repo.findOneBy({ preApplicationId: data.preApplicationId });

  if (!review) {
    // Create new review with mapped values
    const newReview = repo.create({
      id: uuidv4(),
      preApplicationId: data.preApplicationId,
      meetsCityGoals: boolToTinyInt(data.meetsCityGoals) as any,
      locationValid: data.locationValid ?? null,
      mloLink: data.mloLink ?? null,
      costEstimate: data.costEstimate ?? null,
      timeframeDays: data.timeframeDays ?? null,
      passedBackgroundCheck: boolToTinyInt(data.passedBackgroundCheck) as any,
      reviewedBy: req.user!.id,
      status: data.status ?? 'Pending'
    } as Partial<FormalReview>);

    const saved = await repo.save(newReview);
    const log = await createLog('FormalReview', saved.id, 'Create', req.user!.id, req.user!.grade, { after: saved });

    const io = (req.app as any).get('io') as import('socket.io').Server;
    io?.emit('formalReviews:created', { review: saved, log });

    return res.json(saved);
  } else {
    // Update existing review safely
    const before = { ...review };

    review.meetsCityGoals = boolToTinyInt(data.meetsCityGoals) as any;
    review.locationValid = data.locationValid ?? review.locationValid;
    review.mloLink = data.mloLink ?? review.mloLink;
    review.costEstimate = data.costEstimate ?? review.costEstimate;
    review.timeframeDays = data.timeframeDays ?? review.timeframeDays;
    review.passedBackgroundCheck = boolToTinyInt(data.passedBackgroundCheck) as any;
    review.status = data.status ?? review.status;
    review.reviewedBy = req.user!.id;

    const saved = await repo.save(review);

    const log = await createLog('FormalReview', saved.id, 'Edit', req.user!.id, req.user!.grade, { before, after: saved });

    const io = (req.app as any).get('io') as import('socket.io').Server;
    io?.emit('formalReviews:updated', { review: saved, log });

    return res.json(saved);
  }
});

// Get formal reviews (Senior+)
router.get('/', requireGrade(1), async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(FormalReview);
  const list = await repo.find({ order: { createdAt: 'DESC' } });
  res.json(list);
});

// Move to Board Review (Senior+ can mark ready)
router.post('/:id/send-to-board', requireGrade(1), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const repo = AppDataSource.getRepository(FormalReview);
  const review = await repo.findOneBy({ id });
  if (!review) return res.status(404).json({ error: 'Not found' });

  // Validate "No" conditions: locationValid === 'No' or meetsCityGoals === 0 or passedBackgroundCheck === 0
  if (review.locationValid === 'No' || review.meetsCityGoals === 0 || review.passedBackgroundCheck === 0) {
    return res.status(400).json({ error: 'Cannot send to board: contains No values' });
  }

  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id: review.preApplicationId });
  if (!pre) return res.status(404).json({ error: 'Pre-application not found' });

  pre.status = 'BoardReview';
  await preRepo.save(pre);

  review.status = 'Completed';
  await repo.save(review);

  const log = await createLog('FormalReview', id, 'SendToBoard', req.user!.id, req.user!.grade, { after: review, preId: pre.id });

  const io = (req.app as any).get('io') as import('socket.io').Server;
  io?.emit('formalReviews:updated', { review, action: 'SendToBoard', log });
  io?.emit('preApplications:updated', { id: pre.id, status: pre.status, action: 'BoardReview', log });

  res.json({ review, pre });
});

// Send back to Pre-Application / Quarantine / Reject
router.post('/:id/send-back', requireGrade(1), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const { target } = req.body as { target?: string };
  const repo = AppDataSource.getRepository(FormalReview);
  const review = await repo.findOneBy({ id });
  if (!review) return res.status(404).json({ error: 'Not found' });

  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id: review.preApplicationId });
  if (!pre) return res.status(404).json({ error: 'Pre-application not found' });

  if (target === 'PreApplication') pre.status = 'PendingReview';
  else if (target === 'Quarantine') pre.status = 'Quarantined';
  else if (target === 'Reject') pre.status = 'Rejected';
  else return res.status(400).json({ error: 'Invalid target' });

  await preRepo.save(pre);
  review.status = 'SentBack';
  await repo.save(review);

  const log = await createLog('FormalReview', id, 'SendBack', req.user!.id, req.user!.grade, { target, preId: pre.id });

  const io = (req.app as any).get('io') as import('socket.io').Server;
  io?.emit('formalReviews:updated', { review, action: 'SendBack', log });
  io?.emit('preApplications:updated', { id: pre.id, status: pre.status, action: 'SendBack', log });

  res.json({ review, pre });
});

export default router;
