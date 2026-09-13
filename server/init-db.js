import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  console.log('[DB Init] Memulai inisialisasi database PostgreSQL...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[DB Init] Menjalankan skrip schema.sql...');
    await pool.query(sql);

    console.log('✔ [DB Init] Skrip schema.sql berhasil dieksekusi!');
    console.log('✔ [DB Init] Tabel dan data awal berhasil dibuat di PostgreSQL.');
    process.exit(0);
  } catch (err) {
    console.error('❌ [DB Init] Gagal menginisialisasi database:', err);
    process.exit(1);
  }
}

initDb();
