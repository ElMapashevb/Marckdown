// db.js
const mysql = require('mysql2/promise');

let pool;

async function initDb() {
  pool = mysql.createPool({
    host: 'yamanote.proxy.rlwy.net',
    port: 51438,
    user: 'root',
    password: 'nUgYseHcgmmAlxlqVfIdJchgtzSbhIIL',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    ssl: {
      rejectUnauthorized: false
    }
  });

  await pool.query('SELECT 1');
  console.log('✅ Conectado a MySQL Railway');
}

function getPool() {
  if (!pool) throw new Error('❌ DB no inicializada');
  return pool;
}

module.exports = { initDb, getPool };
