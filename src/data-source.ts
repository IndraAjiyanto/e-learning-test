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
  // Dibaca dari env supaya bisa dinyalakan/dimatikan tanpa mengubah kode
  // (SQL_MIGRATIONS tetap memakai default false — lihat .env.example).
  // Bandingannya case-insensitive supaya SYNCHRONIZE=TRUE di .env ikut terbaca,
  // bug lama yang membuat env ini kelihatan menyala padahal nilainya false.
  // Peringatan: menyala = TypeORM menyejajarkan seluruh skema dengan entity
  // (menambah sekaligus menghapus kolom/tabel yang tidak ada di entity).
  synchronize: process.env.SYNCHRONIZE?.toLowerCase() === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
