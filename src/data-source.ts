import { DataSource } from 'typeorm';
import { dbConfig } from './config/db.config';

const db = dbConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.name,
  synchronize: true,
});
