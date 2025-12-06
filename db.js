require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

async function initDb() {
  if (!pool) {
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
  }
  return pool;
}


function getPool() {
  return pool;
}
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);

module.exports = { initDb, getPool };


