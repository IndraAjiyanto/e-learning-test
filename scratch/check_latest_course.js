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
  const res = await client.query('SELECT id, name, "createdAt" FROM course ORDER BY "createdAt" DESC LIMIT 5');
  console.log('Latest courses:', res.rows);
  await client.end();
}
main().catch(console.error);
