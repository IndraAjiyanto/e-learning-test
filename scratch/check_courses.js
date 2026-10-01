const { DataSource } = require('typeorm');
require('dotenv').config();

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'e-learning-migrasi',
  synchronize: false,
});

ds.initialize().then(async () => {
  const courses = await ds.query(`
    SELECT c.id, c.name, c."checkPaid", c.price, c.promo, cat.type as cat_type 
    FROM course c 
    LEFT JOIN category cat ON c."categoryId" = cat.id 
    ORDER BY c."createdAt" DESC
  `);
  console.table(courses);
  await ds.destroy();
}).catch(console.error);
