const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');

(async () => {
  const dir = path.join(__dirname, '..', 'db');
  await pool.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
  await pool.query(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
  console.log('Database migrated and seeded.');
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
