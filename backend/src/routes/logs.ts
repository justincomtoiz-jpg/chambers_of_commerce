import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { Log } from '../entities/Log';
import { authMiddleware, requireGrade } from '../middlewares/auth';

const router = Router();
router.use(authMiddleware);

// Query logs with filters
router.get('/', requireGrade(0), async (req, res) => {
  const { entityType, action, from, to } = req.query;
  const repo = AppDataSource.getRepository(Log);
  const qb = repo.createQueryBuilder('l').orderBy('l.timestamp', 'DESC');

  if (entityType) qb.andWhere('l.entityType = :entityType', { entityType });
  if (action) qb.andWhere('l.action = :action', { action });
  if (from) qb.andWhere('l.timestamp >= :from', { from });
  if (to) qb.andWhere('l.timestamp <= :to', { to });

  const list = await qb.getMany();
  res.json(list);
});
export default router;
