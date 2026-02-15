import { DataSource } from 'typeorm';
import { PreApplication } from './entities/PreApplication';
import { FormalReview } from './entities/FormalReview';
import { Business } from './entities/Business';
import { Inspection } from './entities/Inspection';
import { Log } from './entities/Log';
import { Street } from './entities/Street';

export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'coc_db',
  synchronize: false,
  logging: false,
  entities: [PreApplication, FormalReview, Business, Inspection, Log, Street],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});
