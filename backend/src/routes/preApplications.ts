import { Router, Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { PreApplication } from '../entities/PreApplication';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { differenceInYears } from 'date-fns';
import { authMiddleware, requireGrade, AuthRequest } from '../middlewares/auth';
import { createLog } from '../services/logService';

const router = Router();

const PreAppSchema = z.object({
  requestorName: z.string().min(2).regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/),
  dob: z.string().refine(d => differenceInYears(new Date(), new Date(d)) >= 18),
  businessName: z.string().min(2),
  type: z.enum(['Business','Event','Freelancer']),
  description: z.string().min(20),
  location: z.string().min(1),
  budget: z.number().int().min(1),
  category: z.enum(['Food','Alcohol','Entertainment','Services','Security','Transportation'])
});

router.use(authMiddleware);

// Create Pre-Application
router.post('/', async (req: AuthRequest, res: Response) => {
  const parse = PreAppSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const repo = AppDataSource.getRepository(PreApplication);
  const id = uuidv4();
  const pre = repo.create({
    id,
    ...parse.data,
    status: 'PendingReview',
    createdBy: req.user!.id,
    createdByGrade: req.user!.grade
  });
  await repo.save(pre);

  const log = await createLog('PreApplication', id, 'Create', req.user!.id, req.user!.grade, { after: pre });

  // emit real-time update
  const io = (req.app as any).get('io') as import('socket.io').Server;
  io?.emit('preApplications:created', { pre, log });

  res.json(pre);
});

// Get all pre-apps (filter by status optional and q search)
router.get('/', async (req: Request, res: Response) => {
  const status = String(req.query.status || '');
  const q = String(req.query.q || '').trim().toLowerCase();
  const repo = AppDataSource.getRepository(PreApplication);
  let list = await repo.find({ order: { createdAt: 'DESC' } });
  if (status) list = list.filter(l => l.status === status);
  if (q) {
    list = list.filter(l =>
      l.businessName.toLowerCase().includes(q) ||
      l.requestorName.toLowerCase().includes(q) ||
      (l.description || '').toLowerCase().includes(q)
    );
  }
  res.json(list);
});

// Send for Formal Review
router.post('/:id/send-for-formal', requireGrade(0), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id });
  if (!pre) return res.status(404).json({ error: 'Not found' });

  pre.status = 'FormalReview';
  await preRepo.save(pre);

  const log = await createLog('PreApplication', id, 'SendForFormal', req.user!.id, req.user!.grade, { after: pre });

  const io = (req.app as any).get('io') as import('socket.io').Server;
  io?.emit('preApplications:updated', { id: pre.id, status: pre.status, action: 'SendForFormal', log });

  res.json(pre);
});

// Quarantine
router.post('/:id/quarantine', requireGrade(0), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id });
  if (!pre) return res.status(404).json({ error: 'Not found' });

  pre.status = 'Quarantined';
  await preRepo.save(pre);

  const log = await createLog('PreApplication', id, 'Quarantine', req.user!.id, req.user!.grade, { after: pre });

  const io = (req.app as any).get('io') as import('socket.io').Server;
  io?.emit('preApplications:updated', { id: pre.id, status: pre.status, action: 'Quarantine', log });

  res.json(pre);
});

// Reject
router.post('/:id/reject', requireGrade(0), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id });
  if (!pre) return res.status(404).json({ error: 'Not found' });

  pre.status = 'Rejected';
  await preRepo.save(pre);

  const log = await createLog('PreApplication', id, 'Reject', req.user!.id, req.user!.grade, { after: pre });

  const io = (req.app as any).get('io') as import('socket.io').Server;
  io?.emit('preApplications:updated', { id: pre.id, status: pre.status, action: 'Reject', log });

  res.json(pre);
});

// Edit Pre-Application
router.put('/:id', requireGrade(0), async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const parse = PreAppSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });

  const preRepo = AppDataSource.getRepository(PreApplication);
  const pre = await preRepo.findOneBy({ id });
  if (!pre) return res.status(404).json({ error: 'Not found' });

  const before = { ...pre };
  Object.assign(pre, parse.data);
  await preRepo.save(pre);

  const log = await createLog('PreApplication', id, 'Edit', req.user!.id, req.user!.grade, { before, after: pre });

  const io = (req.app as any).get('io') as import('socket.io').Server;
  io?.emit('preApplications:updated', { id: pre.id, status: pre.status, action: 'Edit', log });

  res.json(pre);
});

export default router;
