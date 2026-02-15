import { AppDataSource } from '../ormconfig';
import { Street } from '../entities/Street';
import { v4 as uuidv4 } from 'uuid';

const streets = [
  { code: 'vespucci_blvd', name: 'Vespucci Blvd' },
  { code: 'del_perro_fwy', name: 'Del Perro Fwy' },
  { code: 'vinewood_blvd', name: 'Vinewood Blvd' },
  { code: 'mirror_park_blvd', name: 'Mirror Park Blvd' },
  { code: 'paleto_bay_rd', name: 'Paleto Bay Rd' },
];

export async function seed() {
  const repo = AppDataSource.getRepository(Street);
  for (const s of streets) {
    const exists = await repo.findOneBy({ code: s.code });
    if (!exists) {
      await repo.save({ id: uuidv4(), code: s.code, name: s.name });
    }
  }
  console.log('Streets seeded');
}
