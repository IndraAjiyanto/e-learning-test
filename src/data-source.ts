import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/entities/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  // Migration adalah satu-satunya jalur perubahan skema di project ini, sama
  // seperti DataSource runtime di database.providers.ts. Sebelumnya nilai ini
  // dibaca dari env SYNCHRONIZE, yang menyesatkan: perbandingannya === 'true'
  // sehingga SYNCHRONIZE=TRUE di .env justru menghasilkan false, dan kalaupun
  // cocok, CLI TypeORM akan mengubah skema diam-diam di luar migration.
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
