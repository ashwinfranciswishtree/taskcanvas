const { Pool } = require('pg');

let pool;

async function getDbConnection() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://designfeedback_user:kfuMnnOVyKfmAgFwIa0NcG5fgIvSxjTV@dpg-d7eqr49f9bms739pid6g-a/designfeedback';
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

module.exports = getDbConnection;
