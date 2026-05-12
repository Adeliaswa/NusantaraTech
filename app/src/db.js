const mysql = require("mysql2/promise");

let pool;

async function initDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || "academic_db",
    user: process.env.DB_USER || "academic_user",
    password: process.env.DB_PASSWORD || "academic_password",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mahasiswa (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      nim VARCHAR(30) NOT NULL UNIQUE,
      jurusan VARCHAR(100) NOT NULL,
      file_name TEXT,
      file_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Database MySQL dan tabel mahasiswa siap digunakan");
}

function getPool() {
  if (!pool) {
    throw new Error("Database belum diinisialisasi");
  }

  return pool;
}

module.exports = {
  initDatabase,
  getPool
};
