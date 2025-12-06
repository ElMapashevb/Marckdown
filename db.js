const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

let pool;

async function initDb() {
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8',
    ssl: { rejectUnauthorized: false }
  });
  console.log("✅ Conexión con la base de datos establecida");
}

function getPool() {
  if (!pool) throw new Error("DB no inicializada");
  return pool;
}

module.exports = { initDb, getPool };

