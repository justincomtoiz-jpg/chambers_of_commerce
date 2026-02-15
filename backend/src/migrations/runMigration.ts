import { AppDataSource } from '../ormconfig';
import * as migrations from './1680000000000-CreateInitialTables';

async function run() {
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  const migration = new (migrations as any).CreateInitialTables1680000000000();
  await migration.up(runner);
  await runner.release();
  console.log('Migrations run');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
