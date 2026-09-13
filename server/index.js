import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// 1. HEALTHCHECK
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await query('SELECT NOW() as time');
    res.json({
      status: 'ok',
      service: 'tahfidz-api',
      database: 'connected',
      dbTime: dbTest.rows[0].time,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      service: 'tahfidz-api',
      database: 'disconnected',
      error: err.message
    });
  }
});

// 2. CABANG ENDPOINTS
app.get('/api/cabang', async (req, res) => {
  try {
    const result = await query('SELECT * FROM cabang ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cabang', async (req, res) => {
  const { id, nama, kode, kota, alamat, no_hp, penanggung_jawab, email, status, warna_aksen, didirikan } = req.body;
  try {
    const sql = `
      INSERT INTO cabang (id, nama, kode, kota, alamat, no_hp, penanggung_jawab, email, status, warna_aksen, didirikan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        nama = EXCLUDED.nama, kode = EXCLUDED.kode, kota = EXCLUDED.kota,
        alamat = EXCLUDED.alamat, no_hp = EXCLUDED.no_hp, penanggung_jawab = EXCLUDED.penanggung_jawab,
        email = EXCLUDED.email, status = EXCLUDED.status, warna_aksen = EXCLUDED.warna_aksen
      RETURNING *;
    `;
    const result = await query(sql, [id, nama, kode, kota, alamat, no_hp, penanggung_jawab, email, status, warna_aksen, didirikan]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cabang/:id', async (req, res) => {
  try {
    await query('DELETE FROM cabang WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2b. SUPERADMIN ACCOUNTS ENDPOINTS
app.get('/api/superadmin', async (req, res) => {
  try {
    const result = await query('SELECT * FROM superadmin_accounts ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/superadmin', async (req, res) => {
  const { id, nama, username, password, role, cabang_id, cabangId, status } = req.body;
  try {
    const sql = `
      INSERT INTO superadmin_accounts (id, nama, username, password, role, cabang_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        nama = EXCLUDED.nama,
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        cabang_id = EXCLUDED.cabang_id,
        status = EXCLUDED.status
      RETURNING *;
    `;
    const result = await query(sql, [
      id, nama, username, password || 'bismillah123', role || 'Super Admin Cabang',
      cabang_id || cabangId || 'cabang-pusat', status || 'Aktif'
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/superadmin/:id', async (req, res) => {
  try {
    await query('DELETE FROM superadmin_accounts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PENGAMPU ENDPOINTS
app.get('/api/pengampu', async (req, res) => {
  try {
    const result = await query('SELECT * FROM pengampu ORDER BY nama ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pengampu', async (req, res) => {
  const { id, nip, nama, kontak, no_hp, role, halaqah_id, cabang_id } = req.body;
  try {
    const sql = `
      INSERT INTO pengampu (id, nip, nama, kontak, no_hp, role, halaqah_id, cabang_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        nama = EXCLUDED.nama,
        nip = EXCLUDED.nip,
        kontak = EXCLUDED.kontak,
        no_hp = EXCLUDED.no_hp,
        role = EXCLUDED.role,
        halaqah_id = EXCLUDED.halaqah_id,
        cabang_id = EXCLUDED.cabang_id
      RETURNING *;
    `;
    const result = await query(sql, [id, nip, nama, kontak, no_hp, role || 'Pengampu', halaqah_id, cabang_id || 'cabang-pusat']);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pengampu/:id', async (req, res) => {
  try {
    await query('DELETE FROM pengampu WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3b. HALAQAH ENDPOINTS
app.get('/api/halaqah', async (req, res) => {
  try {
    const result = await query('SELECT * FROM halaqah ORDER BY nama ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/halaqah', async (req, res) => {
  const { id, nama, pengampu_id, target, keterangan, cabang_id } = req.body;
  try {
    const sql = `
      INSERT INTO halaqah (id, nama, pengampu_id, target, keterangan, cabang_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        nama = EXCLUDED.nama,
        pengampu_id = EXCLUDED.pengampu_id,
        target = EXCLUDED.target,
        keterangan = EXCLUDED.keterangan,
        cabang_id = EXCLUDED.cabang_id
      RETURNING *;
    `;
    const result = await query(sql, [id, nama, pengampu_id, target, keterangan, cabang_id || 'cabang-pusat']);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/halaqah/:id', async (req, res) => {
  try {
    await query('DELETE FROM halaqah WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. SANTRI ENDPOINTS
app.get('/api/santri', async (req, res) => {
  try {
    const result = await query('SELECT * FROM santri ORDER BY nama ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/santri', async (req, res) => {
  const { id, nis, nama, kelas, halaqah_id, status, target, kontak, wali, no_hp_wali, cabang_id } = req.body;
  try {
    if (halaqah_id) {
      await query(`
        INSERT INTO halaqah (id, nama, cabang_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `, [halaqah_id, 'Halaqah Santri', cabang_id || 'cabang-pusat']);
    }
    const sql = `
      INSERT INTO santri (id, nis, nama, kelas, halaqah_id, status, target, kontak, wali, no_hp_wali, cabang_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        nis = EXCLUDED.nis, nama = EXCLUDED.nama, kelas = EXCLUDED.kelas,
        halaqah_id = EXCLUDED.halaqah_id, status = EXCLUDED.status, target = EXCLUDED.target,
        kontak = EXCLUDED.kontak, wali = EXCLUDED.wali, no_hp_wali = EXCLUDED.no_hp_wali,
        cabang_id = EXCLUDED.cabang_id
      RETURNING *;
    `;
    const result = await query(sql, [id, nis, nama, kelas, halaqah_id, status || 'Aktif', target, kontak, wali, no_hp_wali, cabang_id || 'cabang-pusat']);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/santri/:id', async (req, res) => {
  try {
    await query('DELETE FROM santri WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. SESI ENDPOINTS
app.get('/api/sesi', async (req, res) => {
  try {
    const result = await query('SELECT * FROM sesi ORDER BY jam_mulai ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sesi', async (req, res) => {
  const { id, nama, jam_mulai, jamMulai, jam_selesai, jamSelesai, toleransi_menit, toleransiMenit, hari, status, cabang_id, cabangId } = req.body;
  try {
    const sql = `
      INSERT INTO sesi (id, nama, jam_mulai, jam_selesai, toleransi_menit, hari, status, cabang_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        nama = EXCLUDED.nama,
        jam_mulai = EXCLUDED.jam_mulai,
        jam_selesai = EXCLUDED.jam_selesai,
        toleransi_menit = EXCLUDED.toleransi_menit,
        hari = EXCLUDED.hari,
        status = EXCLUDED.status,
        cabang_id = EXCLUDED.cabang_id
      RETURNING *;
    `;
    const result = await query(sql, [
      id, nama, jam_mulai || jamMulai || '05:00', jam_selesai || jamSelesai || '06:00',
      toleransi_menit || toleransiMenit || 15, hari || 'Setiap Hari', status || 'Aktif',
      cabang_id || cabangId || 'cabang-pusat'
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sesi/:id', async (req, res) => {
  try {
    await query('DELETE FROM sesi WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. ABSENSI SANTRI ENDPOINTS
app.get('/api/absensi-santri', async (req, res) => {
  const { tanggal, sesi_id } = req.query;
  try {
    let sql = 'SELECT * FROM absensi_santri';
    const params = [];
    if (tanggal) {
      params.push(tanggal);
      sql += ` WHERE tanggal = $${params.length}`;
    }
    if (sesi_id) {
      params.push(sesi_id);
      sql += params.length === 1 ? ` WHERE sesi_id = $${params.length}` : ` AND sesi_id = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/absensi-santri/batch', async (req, res) => {
  const { records } = req.body; // Array of { id, tanggal, sesi_id, santri_id, status, keterangan }
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Payload harus berupa array records' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of records) {
      const sql = `
        INSERT INTO absensi_santri (id, tanggal, sesi_id, santri_id, status, keterangan)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (tanggal, sesi_id, santri_id) DO UPDATE SET
          status = EXCLUDED.status,
          keterangan = EXCLUDED.keterangan;
      `;
      await client.query(sql, [item.id, item.tanggal, item.sesi_id || item.sesiId, item.santri_id || item.santriId, item.status, item.keterangan]);
    }
    await client.query('COMMIT');
    res.json({ success: true, count: records.length });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/absensi-santri', async (req, res) => {
  const { id, tanggal, sesi_id, sesiId, santri_id, santriId, status, keterangan } = req.body;
  try {
    const sql = `
      INSERT INTO absensi_santri (id, tanggal, sesi_id, santri_id, status, keterangan)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tanggal, sesi_id, santri_id) DO UPDATE SET
        status = EXCLUDED.status,
        keterangan = EXCLUDED.keterangan
      RETURNING *;
    `;
    const result = await query(sql, [
      id || ('abs-' + Date.now()), tanggal || new Date().toISOString().split('T')[0],
      sesi_id || sesiId || 'sesi-shubuh', santri_id || santriId, status || 'Hadir', keterangan || ''
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/absensi-santri/:id', async (req, res) => {
  try {
    await query('DELETE FROM absensi_santri WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. MONITORING SIGAP (PRESENSI PENGAMPU REALTIME)
app.get('/api/monitoring-sigap', async (req, res) => {
  try {
    const result = await query('SELECT * FROM monitoring_sigap ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/monitoring-sigap', async (req, res) => {
  const {
    id, tanggal, pengampu_id, nama, nip, role, halaqah, mapel, kelas, sesi, jadwal,
    jam, status, selisih_menit, lokasi_gps, metode, keterangan, alasan_izin, tugas_siswa, manual
  } = req.body;

  try {
    const sql = `
      INSERT INTO monitoring_sigap (
        id, tanggal, pengampu_id, nama, nip, role, halaqah, mapel, kelas, sesi, jadwal,
        jam, status, selisih_menit, lokasi_gps, metode, keterangan, alasan_izin, tugas_siswa, manual
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        jam = EXCLUDED.jam,
        selisih_menit = EXCLUDED.selisih_menit,
        keterangan = EXCLUDED.keterangan,
        alasan_izin = EXCLUDED.alasan_izin,
        tugas_siswa = EXCLUDED.tugas_siswa,
        manual = EXCLUDED.manual
      RETURNING *;
    `;
    const result = await query(sql, [
      id, tanggal || new Date().toISOString().split('T')[0], pengampu_id, nama, nip, role,
      halaqah, mapel, kelas, sesi, jadwal, jam || '-', status, selisih_menit || 0,
      lokasi_gps, metode || 'Scan QR GPS', keterangan, alasan_izin, tugas_siswa, !!manual
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/monitoring-sigap/:id', async (req, res) => {
  try {
    await query('DELETE FROM monitoring_sigap WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7b. SETORAN SANTRI ENDPOINTS
app.get('/api/setoran-santri', async (req, res) => {
  try {
    const result = await query('SELECT * FROM setoran_santri ORDER BY tanggal DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/setoran-santri', async (req, res) => {
  const { id, tanggal, santri_id, santriId, pengampu_id, pengampuId, jenis, surat, ayat_mulai, ayatMulai, ayat_selesai, ayatSelesai, nilai, catatan } = req.body;
  try {
    const sql = `
      INSERT INTO setoran_santri (id, tanggal, santri_id, pengampu_id, jenis, surat, ayat_mulai, ayat_selesai, nilai, catatan)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        tanggal = EXCLUDED.tanggal,
        santri_id = EXCLUDED.santri_id,
        pengampu_id = EXCLUDED.pengampu_id,
        jenis = EXCLUDED.jenis,
        surat = EXCLUDED.surat,
        ayat_mulai = EXCLUDED.ayat_mulai,
        ayat_selesai = EXCLUDED.ayat_selesai,
        nilai = EXCLUDED.nilai,
        catatan = EXCLUDED.catatan
      RETURNING *;
    `;
    const result = await query(sql, [
      id || ('set-' + Date.now()), tanggal || new Date().toISOString().split('T')[0],
      santri_id || santriId, pengampu_id || pengampuId || null, jenis || 'Ziyadah',
      surat || 'Al-Fatihah', ayat_mulai || ayatMulai || 1, ayat_selesai || ayatSelesai || 7,
      nilai || 'Mumtaz', catatan || ''
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/setoran-santri/:id', async (req, res) => {
  try {
    await query('DELETE FROM setoran_santri WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7c. IZIN ENDPOINTS
app.get('/api/izin', async (req, res) => {
  try {
    const result = await query('SELECT * FROM izin ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/izin', async (req, res) => {
  const { id, pemohon_id, pemohonId, tipe_pemohon, tipePemohon, jenis, tanggal_mulai, tanggalMulai, tanggal_selesai, tanggalSelesai, alasan, tugas_pengganti, tugasPengganti, status_approval, statusApproval, bukti_url, buktiUrl } = req.body;
  try {
    const sql = `
      INSERT INTO izin (id, pemohon_id, tipe_pemohon, jenis, tanggal_mulai, tanggal_selesai, alasan, tugas_pengganti, status_approval, bukti_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        pemohon_id = EXCLUDED.pemohon_id,
        tipe_pemohon = EXCLUDED.tipe_pemohon,
        jenis = EXCLUDED.jenis,
        tanggal_mulai = EXCLUDED.tanggal_mulai,
        tanggal_selesai = EXCLUDED.tanggal_selesai,
        alasan = EXCLUDED.alasan,
        tugas_pengganti = EXCLUDED.tugas_pengganti,
        status_approval = EXCLUDED.status_approval,
        bukti_url = EXCLUDED.bukti_url
      RETURNING *;
    `;
    const result = await query(sql, [
      id || ('izn-' + Date.now()), pemohon_id || pemohonId || 'p-umum',
      tipe_pemohon || tipePemohon || 'Pengampu', jenis || 'Izin',
      tanggal_mulai || tanggalMulai || new Date().toISOString().split('T')[0],
      tanggal_selesai || tanggalSelesai || new Date().toISOString().split('T')[0],
      alasan || 'Izin dinas/keperluan keluarga', tugas_pengganti || tugasPengganti || '-',
      status_approval || statusApproval || 'Menunggu', bukti_url || buktiUrl || null
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/izin/:id', async (req, res) => {
  try {
    await query('DELETE FROM izin WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. 1-CLICK SYNC-ALL: MENGIRIM DARI BROWSER LOCALSTORAGE KE POSTGRESQL
app.post('/api/sync-all', async (req, res) => {
  const { santri, pengampu, sesi, cabang, halaqah, spp, monitoring, superadmin, absensi, setoran, izin } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (Array.isArray(cabang)) {
      for (const c of cabang) {
        await client.query(`
          INSERT INTO cabang (id, nama, kode, kota, alamat, no_hp, penanggung_jawab, email, status, warna_aksen, didirikan)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama, kode = EXCLUDED.kode, kota = EXCLUDED.kota,
            alamat = EXCLUDED.alamat, no_hp = EXCLUDED.no_hp, penanggung_jawab = EXCLUDED.penanggung_jawab,
            email = EXCLUDED.email, status = EXCLUDED.status, warna_aksen = EXCLUDED.warna_aksen;
        `, [c.id, c.nama, c.kode, c.kota, c.alamat, c.noHp || c.no_hp, c.penanggungJawab || c.penanggung_jawab, c.email, c.status, c.warnaAksen || c.warna_aksen, c.didirikan]);
      }
    }

    if (Array.isArray(superadmin)) {
      for (const sa of superadmin) {
        await client.query(`
          INSERT INTO superadmin_accounts (id, nama, username, password, role, cabang_id, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama, username = EXCLUDED.username, password = EXCLUDED.password,
            role = EXCLUDED.role, cabang_id = EXCLUDED.cabang_id, status = EXCLUDED.status;
        `, [sa.id, sa.nama, sa.username, sa.password || 'bismillah123', sa.role || 'Super Admin Cabang', sa.cabangId || sa.cabang_id || 'cabang-pusat', sa.status || 'Aktif']);
      }
    }

    if (Array.isArray(pengampu)) {
      for (const p of pengampu) {
        await client.query(`
          INSERT INTO pengampu (id, nip, nama, kontak, no_hp, role, cabang_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET nama = EXCLUDED.nama, nip = EXCLUDED.nip, kontak = EXCLUDED.kontak;
        `, [p.id, p.nip, p.nama, p.kontak, p.noHp || p.no_hp, p.role || 'Pengampu', p.cabangId || p.cabang_id || 'cabang-pusat']);
      }
    }

    if (Array.isArray(halaqah)) {
      for (const h of halaqah) {
        await client.query(`
          INSERT INTO halaqah (id, nama, pengampu_id, target, keterangan, cabang_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET nama = EXCLUDED.nama, target = EXCLUDED.target;
        `, [h.id, h.nama, h.pengampuId || h.pengampu_id, h.target, h.keterangan, h.cabangId || h.cabang_id || 'cabang-pusat']);
      }
    }

    if (Array.isArray(santri)) {
      for (const s of santri) {
        await client.query(`
          INSERT INTO santri (id, nis, nama, kelas, halaqah_id, status, target, kontak, wali, no_hp_wali, cabang_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama, nis = EXCLUDED.nis, kelas = EXCLUDED.kelas,
            status = EXCLUDED.status, target = EXCLUDED.target;
        `, [s.id, s.nis, s.nama, s.kelas, s.halaqahId || s.halaqah_id, s.status || 'Aktif', s.target, s.kontak, s.wali, s.noHpWali || s.no_hp_wali, s.cabangId || s.cabang_id || 'cabang-pusat']);
      }
    }

    if (Array.isArray(sesi)) {
      for (const s of sesi) {
        await client.query(`
          INSERT INTO sesi (id, nama, jam_mulai, jam_selesai, toleransi_menit, hari, status, cabang_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET nama = EXCLUDED.nama, jam_mulai = EXCLUDED.jam_mulai, jam_selesai = EXCLUDED.jam_selesai;
        `, [s.id, s.nama, s.jamMulai || s.jam_mulai || s.mulai || '05:00', s.jamSelesai || s.jam_selesai || s.selesai || '06:00', s.toleransiMenit || 15, s.hari || 'Setiap Hari', s.status || 'Aktif', s.cabangId || s.cabang_id || 'cabang-pusat']);
      }
    }

    if (Array.isArray(absensi)) {
      for (const a of absensi) {
        if (!a.santriId && !a.santri_id) continue;
        await client.query(`
          INSERT INTO absensi_santri (id, tanggal, sesi_id, santri_id, status, keterangan)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (tanggal, sesi_id, santri_id) DO UPDATE SET
            status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;
        `, [a.id || ('abs-' + Date.now()), a.tanggal || new Date().toISOString().split('T')[0], a.sesiId || a.sesi_id || 'sesi-shubuh', a.santriId || a.santri_id, a.status || 'Hadir', a.keterangan || '']);
      }
    }

    if (Array.isArray(setoran)) {
      for (const st of setoran) {
        if (!st.santriId && !st.santri_id) continue;
        await client.query(`
          INSERT INTO setoran_santri (id, tanggal, santri_id, pengampu_id, jenis, surat, ayat_mulai, ayat_selesai, nilai, catatan)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            surat = EXCLUDED.surat, ayat_mulai = EXCLUDED.ayat_mulai, ayat_selesai = EXCLUDED.ayat_selesai, nilai = EXCLUDED.nilai;
        `, [st.id || ('set-' + Date.now()), st.tanggal || new Date().toISOString().split('T')[0], st.santriId || st.santri_id, st.pengampuId || st.pengampu_id || null, st.jenis || 'Ziyadah', st.surat || 'Al-Fatihah', st.ayatMulai || st.ayat_mulai || 1, st.ayatSelesai || st.ayat_selesai || 7, st.nilai || 'Mumtaz', st.catatan || '']);
      }
    }

    if (Array.isArray(izin)) {
      for (const iz of izin) {
        await client.query(`
          INSERT INTO izin (id, pemohon_id, tipe_pemohon, jenis, tanggal_mulai, tanggal_selesai, alasan, tugas_pengganti, status_approval, bukti_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            alasan = EXCLUDED.alasan, status_approval = EXCLUDED.status_approval;
        `, [iz.id || ('izn-' + Date.now()), iz.pemohonId || iz.pemohon_id || 'p-umum', iz.tipePemohon || iz.tipe_pemohon || 'Pengampu', iz.jenis || 'Izin', iz.tanggalMulai || iz.tanggal_mulai || new Date().toISOString().split('T')[0], iz.tanggalSelesai || iz.tanggal_selesai || new Date().toISOString().split('T')[0], iz.alasan || 'Izin', iz.tugasPengganti || iz.tugas_pengganti || '-', iz.statusApproval || iz.status_approval || 'Menunggu', iz.buktiUrl || iz.bukti_url || null]);
      }
    }

    if (Array.isArray(spp)) {
      for (const item of spp) {
        await client.query(`
          INSERT INTO pembayaran_spp (
            id, invoice_no, santri_id, santri_nama, nis, kelas, cabang_id,
            bulan, tahun, nominal, status, tanggal_bayar, metode_bayar, nomor_ref, catatan, nama_petugas
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status, nominal = EXCLUDED.nominal, tanggal_bayar = EXCLUDED.tanggal_bayar,
            metode_bayar = EXCLUDED.metode_bayar, nomor_ref = EXCLUDED.nomor_ref, catatan = EXCLUDED.catatan;
        `, [
          item.id, item.invoiceNo || item.invoice_no, item.santriId || item.santri_id, item.santriNama || item.santri_nama,
          item.nis, item.kelas, item.cabangId || item.cabang_id || 'cabang-pusat',
          item.bulan, item.tahun || 2026, item.nominal || 350000, item.status || 'Lunas',
          item.tanggalBayar || item.tanggal_bayar || new Date().toISOString().split('T')[0],
          item.metodeBayar || item.metode_bayar || 'Transfer Bank BSI',
          item.nomorRef || item.nomor_ref || '-', item.catatan || '', item.namaPetugas || item.nama_petugas || 'Bendahara Pesantren'
        ]);
      }
    }

    if (Array.isArray(monitoring)) {
      for (const m of monitoring) {
        await client.query(`
          INSERT INTO monitoring_sigap (
            id, tanggal, pengampu_id, nama, nip, role, halaqah, mapel, kelas, sesi, jadwal,
            jam, status, selisih_menit, lokasi_gps, metode, keterangan, alasan_izin, tugas_siswa, manual
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;
        `, [
          m.id, m.tanggal || new Date().toISOString().split('T')[0], m.pengampuId || m.pengampu_id, m.nama, m.nip, m.role,
          m.halaqah, m.mapel, m.kelas, m.sesi, m.jadwal, m.jam || '-', m.status, m.selisihMenit || m.selisih_menit || 0,
          m.lokasiGps || m.lokasi_gps, m.metode, m.keterangan, m.alasanIzin || m.alasan_izin, m.tugasSiswa || m.tugas_siswa, !!m.manual
        ]);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Seluruh data 11 model berhasil disinkronkan ke PostgreSQL' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 9. PULL-ALL: MENGAMBIL SELURUH DATA DARI POSTGRESQL UNTUK SYNC KE PERANGKAT/BROWSER
app.get('/api/pull-all', async (req, res) => {
  try {
    const [cabang, superadmin, pengampu, santri, halaqah, sesi, absensi, setoran, izin, spp, monitoring] = await Promise.all([
      query('SELECT * FROM cabang ORDER BY created_at ASC'),
      query('SELECT * FROM superadmin_accounts ORDER BY created_at ASC'),
      query('SELECT * FROM pengampu ORDER BY nama ASC'),
      query('SELECT * FROM santri ORDER BY nama ASC'),
      query('SELECT * FROM halaqah ORDER BY created_at ASC'),
      query('SELECT * FROM sesi ORDER BY jam_mulai ASC'),
      query('SELECT * FROM absensi_santri ORDER BY created_at DESC LIMIT 500'),
      query('SELECT * FROM setoran_santri ORDER BY created_at DESC LIMIT 500'),
      query('SELECT * FROM izin ORDER BY created_at DESC LIMIT 200'),
      query('SELECT * FROM pembayaran_spp ORDER BY created_at DESC LIMIT 500'),
      query('SELECT * FROM monitoring_sigap ORDER BY created_at DESC LIMIT 200')
    ]);

    res.json({
      success: true,
      data: {
        cabang: cabang.rows,
        superadmin: superadmin.rows,
        pengampu: pengampu.rows,
        santri: santri.rows,
        halaqah: halaqah.rows,
        sesi: sesi.rows,
        absensi: absensi.rows,
        setoran: setoran.rows,
        izin: izin.rows,
        spp: spp.rows,
        monitoring: monitoring.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. PEMBAYARAN SPP CRUD ENDPOINTS
app.get('/api/spp', async (req, res) => {
  const { cabang_id, bulan, status, santri_id } = req.query;
  try {
    let sql = 'SELECT * FROM pembayaran_spp WHERE 1=1';
    const params = [];
    if (cabang_id) {
      params.push(cabang_id);
      sql += ` AND cabang_id = $${params.length}`;
    }
    if (bulan) {
      params.push(bulan);
      sql += ` AND bulan = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }
    if (santri_id) {
      params.push(santri_id);
      sql += ` AND santri_id = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/spp', async (req, res) => {
  const {
    id, invoice_no, invoiceNo, santri_id, santriId, santri_nama, santriNama,
    nis, kelas, cabang_id, cabangId, bulan, tahun, nominal, status,
    tanggal_bayar, tanggalBayar, metode_bayar, metodeBayar, nomor_ref, nomorRef, catatan, nama_petugas, namaPetugas
  } = req.body;

  try {
    const invNo = invoice_no || invoiceNo || `INV-SPP-${Date.now()}`;
    const sId = santri_id || santriId;
    const sNama = santri_nama || santriNama || 'Santri';
    const cId = cabang_id || cabangId || 'cabang-pusat';
    const tgl = tanggal_bayar || tanggalBayar || new Date().toISOString().split('T')[0];
    const metode = metode_bayar || metodeBayar || 'Transfer Bank BSI';
    const ref = nomor_ref || nomorRef || '-';
    const petugas = nama_petugas || namaPetugas || 'Bendahara Pesantren';
    const recordId = id || `spp-${Date.now()}`;

    const sql = `
      INSERT INTO pembayaran_spp (
        id, invoice_no, santri_id, santri_nama, nis, kelas, cabang_id,
        bulan, tahun, nominal, status, tanggal_bayar, metode_bayar, nomor_ref, catatan, nama_petugas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        nominal = EXCLUDED.nominal,
        tanggal_bayar = EXCLUDED.tanggal_bayar,
        metode_bayar = EXCLUDED.metode_bayar,
        nomor_ref = EXCLUDED.nomor_ref,
        catatan = EXCLUDED.catatan
      RETURNING *;
    `;
    const result = await query(sql, [
      recordId, invNo, sId, sNama, nis, kelas, cId,
      bulan || 'September 2026', tahun || 2026, nominal || 350000, status || 'Lunas',
      tgl, metode, ref, catatan, petugas
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/spp/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM pembayaran_spp WHERE id = $1', [id]);
    res.json({ success: true, message: 'Transaksi SPP berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 Tahfidz Hub REST API is running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`===========================================`);
});
