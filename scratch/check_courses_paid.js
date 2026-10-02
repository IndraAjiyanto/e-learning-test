const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT c.id, c.name, c."checkPaid", c.price, c.promo, cat.name as cat_name, cat.type as cat_type
    FROM course c
    LEFT JOIN category cat ON c."categoryId" = cat.id
    ORDER BY c."createdAt" DESC
    LIMIT 10
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
