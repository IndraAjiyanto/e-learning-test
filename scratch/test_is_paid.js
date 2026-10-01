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

const path = require('path');
const { logicHelpers } = require(path.resolve('./dist/common/helpers/logic.helpers'));
const isPaidProgram = logicHelpers.isPaidProgram;

ds.initialize().then(async () => {
  const courses = await ds.query(`
    SELECT c.id, c.name, c."checkPaid", c.price, c.promo, cat.type as cat_type 
    FROM course c 
    LEFT JOIN category cat ON c."categoryId" = cat.id 
    ORDER BY c."createdAt" DESC
  `);
  const results = courses.map(c => ({
    name: c.name,
    checkPaid: c.checkPaid,
    price: c.price,
    cat_type: c.cat_type,
    isPaid: isPaidProgram(c)
  }));
  console.table(results);
  await ds.destroy();
}).catch(console.error);
