import { AppDataSource } from '../ormconfig';
import { Log } from '../entities/Log';
import { v4 as uuidv4 } from 'uuid';

export async function createLog(
  entityType: string,
  entityId: string,
  action: string,
  performedBy: string,
  performedByGrade: number,
  details?: any
) {
  const repo = AppDataSource.getRepository(Log);
  const log = repo.create({
    id: uuidv4(),
    entityType,
    entityId,
    action,
    performedBy,
    performedByGrade,
    details,
  });
  await repo.save(log);
  return log;
}
