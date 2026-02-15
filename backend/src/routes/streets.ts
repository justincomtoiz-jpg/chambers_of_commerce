import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { Street } from '../entities/Street';

const router = Router();

router.get('/', async (req, res) => {
  const repo = AppDataSource.getRepository(Street);
  const list = await repo.find({ order: { name: 'ASC' } });
  res.json(list);
});

export default router;
