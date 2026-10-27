const { Pool, types } = require('pg');
require('dotenv').config();

// Return DATE columns as 'YYYY-MM-DD' strings and NUMERIC as numbers
types.setTypeParser(1082, (v) => v);
types.setTypeParser(1700, (v) => parseFloat(v));

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/stayflow',
});

module.exports = { pool, query: (text, params) => pool.query(text, params) };
