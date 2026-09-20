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

// Auto-migrate essential columns for santri table
query(`
  ALTER TABLE santri ADD COLUMN IF NOT EXISTS pengampu VARCHAR(150);
  ALTER TABLE santri ADD COLUMN IF NOT EXISTS pengampu_id VARCHAR(64);
  ALTER TABLE santri ADD COLUMN IF NOT EXISTS nik VARCHAR(64);
  ALTER TABLE santri ADD COLUMN IF NOT EXISTS nisn VARCHAR(64);
  ALTER TABLE santri ADD COLUMN IF NOT EXISTS lp VARCHAR(10);
  ALTER TABLE santri ADD COLUMN IF NOT EXISTS tgl_lahir VARCHAR(64);
  ALTER TABLE santri ADD COLUMN IF NOT EXISTS unit_sekolah VARCHAR(150);
`).then(() => {
  console.log('✔ [DB Auto-Migrate] Kolom santri (pengampu, nik, dll) terverifikasi');
}).catch(e => {
  console.warn('[DB Auto-Migrate] Warning check kolom santri:', e.message);
});

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
  const { id, nip, nama, kontak, no_hp, noHp, role, jabatan, halaqah_id, halaqahId, cabang_id, cabangId } = req.body;
  try {
    const targetNoHp = no_hp || noHp || kontak || '';
    const targetKontak = kontak || no_hp || noHp || '';
    const targetRole = role || jabatan || 'Pengampu';
    const targetCabangId = cabang_id || cabangId || 'cabang-pusat';
    const targetHalaqahId = halaqah_id || halaqahId || null;

    if (targetHalaqahId) {
      await query(`
        INSERT INTO halaqah (id, nama, cabang_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `, [targetHalaqahId, 'Halaqah Pengampu', targetCabangId]);
    }

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
    const result = await query(sql, [id, nip || '', nama, targetKontak, targetNoHp, targetRole, targetHalaqahId, targetCabangId]);
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
  const { 
    id, nis, nisn, nama, kelas, halaqah_id, halaqahId, status, target, 
    kontak, kontakWali, wali, no_hp_wali, noHpWali, cabang_id, cabangId,
    pengampu, pengampuNama, pengampu_id, pengampuId, nik, lp, tgl_lahir, tglLahir,
    unit_sekolah, unitSekolah
  } = req.body;
  try {
    const targetNis = nis || nisn || '';
    const targetNisn = nisn || nis || '';
    const targetCabangId = cabang_id || cabangId || 'cabang-pusat';
    const targetHalaqahId = halaqah_id || halaqahId || null;
    const targetKontak = kontak || kontakWali || '';
    const targetNoHpWali = no_hp_wali || noHpWali || kontakWali || kontak || '';
    const targetPengampu = pengampu || pengampuNama || '';
    const targetPengampuId = pengampu_id || pengampuId || null;
    const targetNik = nik || '';
    const targetLp = lp || 'L';
    const targetTglLahir = tgl_lahir || tglLahir || '';
    const targetUnitSekolah = unit_sekolah || unitSekolah || '';

    if (targetHalaqahId) {
      await query(`
        INSERT INTO halaqah (id, nama, cabang_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `, [targetHalaqahId, 'Halaqah Santri', targetCabangId]);
    }
    const sql = `
      INSERT INTO santri (id, nis, nama, kelas, halaqah_id, status, target, kontak, wali, no_hp_wali, cabang_id, pengampu, pengampu_id, nik, nisn, lp, tgl_lahir, unit_sekolah)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        nis = EXCLUDED.nis, nama = EXCLUDED.nama, kelas = EXCLUDED.kelas,
        halaqah_id = EXCLUDED.halaqah_id, status = EXCLUDED.status, target = EXCLUDED.target,
        kontak = EXCLUDED.kontak, wali = EXCLUDED.wali, no_hp_wali = EXCLUDED.no_hp_wali,
        cabang_id = EXCLUDED.cabang_id, pengampu = EXCLUDED.pengampu, pengampu_id = EXCLUDED.pengampu_id,
        nik = EXCLUDED.nik, nisn = EXCLUDED.nisn, lp = EXCLUDED.lp, tgl_lahir = EXCLUDED.tgl_lahir,
        unit_sekolah = EXCLUDED.unit_sekolah
      RETURNING *;
    `;
    const result = await query(sql, [
      id, targetNis, nama, kelas, targetHalaqahId, status || 'Aktif', 
      target || '3 Juz / Tahun', targetKontak, wali || '', targetNoHpWali, targetCabangId,
      targetPengampu, targetPengampuId, targetNik, targetNisn, targetLp, targetTglLahir, targetUnitSekolah
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/santri/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const altId1 = rawId.startsWith('ss-') ? rawId.replace('ss-', 's-') : (rawId.startsWith('s-') ? rawId.replace('s-', 'ss-') : rawId);
    const altId2 = rawId.replace(/^s{1,2}-/, '');

    // Cari ID santri yang sesuai terlebih dahulu
    const findRes = await query(`
      SELECT id FROM santri 
      WHERE id = $1 
         OR id = $2 
         OR id = $3 
         OR nis = $1 
         OR nis = $3
    `, [rawId, altId1, altId2]);

    const targetIds = findRes.rows.map(r => r.id);
    if (!targetIds.includes(rawId)) targetIds.push(rawId);
    if (!targetIds.includes(altId1)) targetIds.push(altId1);

    // Hapus data terkait terlebih dahulu untuk memastikan tidak ada foreign key violation
    for (const tid of targetIds) {
      await query('DELETE FROM absensi_santri WHERE santri_id = $1', [tid]).catch(() => {});
      await query('DELETE FROM setoran_santri WHERE santri_id = $1', [tid]).catch(() => {});
      await query('DELETE FROM pembayaran_spp WHERE santri_id = $1', [tid]).catch(() => {});
      await query('DELETE FROM nilai_rapor WHERE santri_id = $1', [tid]).catch(() => {});
    }

    // Hapus santri
    await query(`
      DELETE FROM santri 
      WHERE id = $1 
         OR id = $2 
         OR id = $3 
         OR nis = $1 
         OR nis = $3
    `, [rawId, altId1, altId2]);

    res.json({ success: true, deletedIds: targetIds });
  } catch (err) {
    console.error('[API Error] DELETE /api/santri/:id:', err.message);
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
    const result = await query("SELECT *, to_char(tanggal, 'YYYY-MM-DD') as tanggal_clean FROM monitoring_sigap ORDER BY created_at DESC");
    const rows = result.rows.map(r => ({
      ...r,
      tanggal: r.tanggal_clean || r.tanggal
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/monitoring-sigap', async (req, res) => {
  const body = req.body;
  const id = body.id || ('pres-' + Date.now());
  const tanggal = body.tanggal || new Date().toISOString().split('T')[0];
  let pengampu_id = body.pengampu_id || body.pengampuId || null;
  const nama = body.nama || 'Pengampu';
  const nip = body.nip || 'NON-NIP';
  const role = body.role || 'Pengampu Halaqoh';
  const halaqah = body.halaqah || '-';
  const mapel = body.mapel || 'Tahfidz';
  const kelas = body.kelas || 'Masjid Pusat PPIAS';
  const sesi = body.sesi || "Ba'da Subuh";
  const jadwal = body.jadwal || '-';
  const jam = body.jam || '-';
  const status = body.status || 'Belum';
  const selisih_menit = parseInt(body.selisih_menit ?? body.selisihMenit ?? 0);
  const lokasi_gps = body.lokasi_gps || body.lokasiGps || null;
  const metode = body.metode || 'Scan QR GPS';
  const keterangan = body.keterangan || status;
  const alasan_izin = body.alasan_izin || body.alasanIzin || null;
  const tugas_siswa = body.tugas_siswa || body.tugasSiswa || null;
  const manual = !!body.manual;

  try {
    if (pengampu_id) {
      const checkP = await query('SELECT id FROM pengampu WHERE id = $1', [pengampu_id]);
      if (checkP.rows.length === 0) {
        pengampu_id = null;
      }
    }

    const sql = `
      INSERT INTO monitoring_sigap (
        id, tanggal, pengampu_id, nama, nip, role, halaqah, mapel, kelas, sesi, jadwal,
        jam, status, selisih_menit, lokasi_gps, metode, keterangan, alasan_izin, tugas_siswa, manual
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        tanggal = EXCLUDED.tanggal,
        pengampu_id = EXCLUDED.pengampu_id,
        nama = EXCLUDED.nama,
        nip = EXCLUDED.nip,
        role = EXCLUDED.role,
        halaqah = EXCLUDED.halaqah,
        mapel = EXCLUDED.mapel,
        kelas = EXCLUDED.kelas,
        sesi = EXCLUDED.sesi,
        jadwal = EXCLUDED.jadwal,
        status = EXCLUDED.status,
        jam = EXCLUDED.jam,
        selisih_menit = EXCLUDED.selisih_menit,
        lokasi_gps = EXCLUDED.lokasi_gps,
        metode = EXCLUDED.metode,
        keterangan = EXCLUDED.keterangan,
        alasan_izin = EXCLUDED.alasan_izin,
        tugas_siswa = EXCLUDED.tugas_siswa,
        manual = EXCLUDED.manual
      RETURNING *;
    `;
    const result = await query(sql, [
      id, tanggal, pengampu_id, nama, nip, role,
      halaqah, mapel, kelas, sesi, jadwal, jam, status, selisih_menit,
      lokasi_gps, metode, keterangan, alasan_izin, tugas_siswa, manual
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
  const { 
    id, tanggal, santri_id, santriId, pengampu_id, pengampuId, 
    jenis, surat, surahName, ayat_mulai, ayatMulai, ayatAwal,
    ayat_selesai, ayatSelesai, ayatAkhir, nilai, predikat, catatan, catatanTajwid, santriNama 
  } = req.body;

  const targetSantriId = santri_id || santriId || 's-1';
  let targetPengampuId = pengampu_id || pengampuId || null;

  try {
    // 1. Pastikan santri ada di database agar tidak melanggar foreign key constraint
    const checkSantri = await query('SELECT id FROM santri WHERE id = $1', [targetSantriId]);
    if (checkSantri.rows.length === 0) {
      const defaultName = santriNama || (targetSantriId === 's-azmi' ? 'Muhammad Azmi Soleh' : ('Santri ' + targetSantriId));
      await query(
        `INSERT INTO santri (id, nama, nis, kelas, status, cabang_id)
         VALUES ($1, $2, $3, $4, 'Aktif', 'cabang-pusat')
         ON CONFLICT (id) DO NOTHING`,
        [targetSantriId, defaultName, '2026' + Math.floor(100 + Math.random()*899), 'X Tahfidz 1']
      );
    }

    // 2. Pastikan pengampu valid jika dikirim
    if (targetPengampuId) {
      const checkPengampu = await query('SELECT id FROM pengampu WHERE id = $1', [targetPengampuId]);
      if (checkPengampu.rows.length === 0) {
        targetPengampuId = null;
      }
    }

    const targetSurat = surat || surahName || 'Al-Baqarah';
    const targetAyatMulai = parseInt(ayat_mulai ?? ayatMulai ?? ayatAwal ?? 1);
    const targetAyatSelesai = parseInt(ayat_selesai ?? ayatSelesai ?? ayatAkhir ?? targetAyatMulai);
    const targetNilai = nilai || predikat || 'Jayyid';
    const targetCatatan = catatan || catatanTajwid || '';

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
      id || ('set-' + Date.now()), 
      tanggal || new Date().toISOString().split('T')[0],
      targetSantriId, 
      targetPengampuId, 
      jenis || 'SABAQ',
      targetSurat, 
      targetAyatMulai, 
      targetAyatSelesai,
      targetNilai, 
      targetCatatan
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[API] Save setoran error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Alias untuk /api/setoran
app.get('/api/setoran', async (req, res) => {
  try {
    const result = await query('SELECT * FROM setoran_santri ORDER BY tanggal DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/setoran', (req, res, next) => {
  req.url = '/api/setoran-santri';
  app.handle(req, res, next);
});

app.delete('/api/setoran-santri/:id', async (req, res) => {
  try {
    await query('DELETE FROM setoran_santri WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/setoran/:id', async (req, res) => {
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

// 7d. RAPOR TEMPLATE ENDPOINTS
app.get('/api/rapor-template', async (req, res) => {
  try {
    const result = await query('SELECT * FROM rapor_template ORDER BY updated_at DESC LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rapor-template', async (req, res) => {
  const {
    id = 'default-template',
    namaYayasan, nama_yayasan,
    namaMadrasah, nama_madrasah,
    alamatMadrasah, alamat_madrasah,
    website,
    email,
    judulRapor, judul_rapor,
    semester,
    namaMudir, nama_mudir,
    nipMudir, nip_mudir,
    tempatTanggal, tempat_tanggal,
    aspekPenilaian, aspek_penilaian
  } = req.body;

  try {
    const sql = `
      INSERT INTO rapor_template (
        id, nama_yayasan, nama_madrasah, alamat_madrasah, website, email,
        judul_rapor, semester, nama_mudir, nip_mudir, tempat_tanggal, aspek_penilaian, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      ON CONFLICT (id) DO UPDATE SET
        nama_yayasan = EXCLUDED.nama_yayasan,
        nama_madrasah = EXCLUDED.nama_madrasah,
        alamat_madrasah = EXCLUDED.alamat_madrasah,
        website = EXCLUDED.website,
        email = EXCLUDED.email,
        judul_rapor = EXCLUDED.judul_rapor,
        semester = EXCLUDED.semester,
        nama_mudir = EXCLUDED.nama_mudir,
        nip_mudir = EXCLUDED.nip_mudir,
        tempat_tanggal = EXCLUDED.tempat_tanggal,
        aspek_penilaian = EXCLUDED.aspek_penilaian,
        updated_at = NOW()
      RETURNING *;
    `;
    const result = await query(sql, [
      id,
      namaYayasan || nama_yayasan || 'YAYASAN IHYA AS SUNNAH TASIKMALAYA',
      namaMadrasah || nama_madrasah || 'MADRASAH ALIYAH IHYA AS SUNNAH',
      alamatMadrasah || alamat_madrasah || 'Kompleks Islamic Center PPIAS, Jl. Paseh No. 12, Tasikmalaya, Jawa Barat',
      website || 'www.ma-ihyaassunnah.sch.id',
      email || 'tahfidz@ma-ihyaassunnah.sch.id',
      judulRapor || judul_rapor || "LEMBAR EVALUASI & RAPOR TAHFIDZ AL-QUR'AN",
      semester || 'Ganjil 2026/2027',
      namaMudir || nama_mudir || 'Ustadz Dr. Abu Haidar, M.Pd.I',
      nipMudir || nip_mudir || '197501012000031001',
      tempatTanggal || tempat_tanggal || 'Tasikmalaya, 20 Desember 2026',
      aspekPenilaian || aspek_penilaian ? (typeof (aspekPenilaian || aspek_penilaian) === 'object' ? JSON.stringify(aspekPenilaian || aspek_penilaian) : (aspekPenilaian || aspek_penilaian)) : null
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7e. NILAI RAPOR ENDPOINTS
app.get('/api/nilai-rapor', async (req, res) => {
  try {
    const result = await query(`
      SELECT nr.*, s.nama as santri_nama, s.nis as santri_nis, s.kelas as santri_kelas
      FROM nilai_rapor nr
      LEFT JOIN santri s ON s.id = nr.santri_id
      ORDER BY nr.updated_at DESC
    `);
    const mapped = result.rows.map(r => ({
      ...r,
      santriId: r.santri_id,
      pengampuId: r.pengampu_id,
      tahunAjaran: r.tahun_ajaran,
      rataRata: r.rata_rata,
      catatanMusyrif: r.catatan_musyrif,
      kelancaranKet: r.eval_kelancaran,
      tajwidKet: r.eval_tajwid,
      fashohahKet: r.eval_fashohah,
      adabKet: r.eval_adab
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/nilai-rapor/santri/:santriId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM nilai_rapor WHERE santri_id = $1 ORDER BY updated_at DESC', [req.params.santriId]);
    const mapped = result.rows.map(r => ({
      ...r,
      santriId: r.santri_id,
      pengampuId: r.pengampu_id,
      tahunAjaran: r.tahun_ajaran,
      rataRata: r.rata_rata,
      catatanMusyrif: r.catatan_musyrif,
      kelancaranKet: r.eval_kelancaran,
      tajwidKet: r.eval_tajwid,
      fashohahKet: r.eval_fashohah,
      adabKet: r.eval_adab
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/nilai-rapor', async (req, res) => {
  const {
    id,
    santriId, santri_id,
    pengampuId, pengampu_id,
    semester,
    tahunAjaran, tahun_ajaran,
    kelancaran,
    tajwid,
    fashohah,
    adab,
    evalKelancaran, eval_kelancaran,
    evalTajwid, eval_tajwid,
    evalFashohah, eval_fashohah,
    evalAdab, eval_adab,
    rataRata, rata_rata,
    predikat,
    catatanMusyrif, catatan_musyrif,
    tempatRapor, tempat_rapor,
    tanggalRapor, tanggal_rapor,
    aspekDetail, aspek_detail
  } = req.body;

  let targetSantriId = santriId || santri_id;
  if (!targetSantriId) {
    return res.status(400).json({ error: 'santri_id is required' });
  }

  // Normalize santri ID: s1 -> s-1 if needed
  if (targetSantriId === 's1') targetSantriId = 's-1';
  else if (targetSantriId === 's2') targetSantriId = 's-2';
  else if (targetSantriId === 's3') targetSantriId = 's-3';
  else if (targetSantriId === 's4') targetSantriId = 's-4';
  else if (targetSantriId === 's5') targetSantriId = 's-5';

  // Ensure santri exists in DB to satisfy foreign key constraint
  try {
    const santriCheck = await query('SELECT id FROM santri WHERE id = $1', [targetSantriId]);
    if (santriCheck.rows.length === 0) {
      await query(`
        INSERT INTO santri (id, nama, nis, kelas, target_juz, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 10, 'Aktif', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        targetSantriId,
        req.body.santriNama || req.body.nama || `Santri ${targetSantriId}`,
        req.body.nis || '2026' + targetSantriId.replace(/\D/g, ''),
        req.body.kelas || 'X-A'
      ]);
    }
  } catch (errSantri) {
    console.warn('[API] Auto-stub santri warning:', errSantri.message);
  }

  // Validate pengampu_id to prevent FK violation
  let validPengampuId = pengampuId || pengampu_id || null;
  if (validPengampuId) {
    try {
      const pengampuCheck = await query('SELECT id FROM pengampu WHERE id = $1', [validPengampuId]);
      if (pengampuCheck.rows.length === 0) {
        validPengampuId = null;
      }
    } catch (e) {
      validPengampuId = null;
    }
  }

  const targetSemester = semester || 'Ganjil 2026/2027';
  const targetId = id || `nr-${targetSantriId}-${targetSemester.replace(/[^a-zA-Z0-9]/g, '')}`;
  const valKel = Number(kelancaran) || 90;
  const valTaj = Number(tajwid) || 90;
  const valFas = Number(fashohah) || 90;
  const valAdb = Number(adab) || 90;
  const avg = Number(rataRata || rata_rata) || parseFloat(((valKel + valTaj + valFas + valAdb) / 4).toFixed(2));
  const valTempat = tempatRapor || tempat_rapor || 'Tasikmalaya';
  const valTanggal = tanggalRapor || tanggal_rapor || new Date().toISOString().split('T')[0];

  let pred = predikat;
  if (!pred) {
    if (avg >= 90) pred = 'Mumtaz (Istimewa)';
    else if (avg >= 80) pred = 'Jayyid Jiddan (Sangat Baik)';
    else if (avg >= 70) pred = 'Jayyid (Baik)';
    else if (avg >= 60) pred = 'Maqbul (Cukup)';
    else pred = 'Kurang';
  }

  try {
    const sql = `
      INSERT INTO nilai_rapor (
        id, santri_id, pengampu_id, semester, tahun_ajaran,
        kelancaran, tajwid, fashohah, adab,
        eval_kelancaran, eval_tajwid, eval_fashohah, eval_adab,
        rata_rata, predikat, catatan_musyrif, tempat_rapor, tanggal_rapor, aspek_detail, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
      ON CONFLICT (id) DO UPDATE SET
        santri_id = EXCLUDED.santri_id,
        pengampu_id = EXCLUDED.pengampu_id,
        semester = EXCLUDED.semester,
        tahun_ajaran = EXCLUDED.tahun_ajaran,
        kelancaran = EXCLUDED.kelancaran,
        tajwid = EXCLUDED.tajwid,
        fashohah = EXCLUDED.fashohah,
        adab = EXCLUDED.adab,
        eval_kelancaran = EXCLUDED.eval_kelancaran,
        eval_tajwid = EXCLUDED.eval_tajwid,
        eval_fashohah = EXCLUDED.eval_fashohah,
        eval_adab = EXCLUDED.eval_adab,
        rata_rata = EXCLUDED.rata_rata,
        predikat = EXCLUDED.predikat,
        catatan_musyrif = EXCLUDED.catatan_musyrif,
        tempat_rapor = EXCLUDED.tempat_rapor,
        tanggal_rapor = EXCLUDED.tanggal_rapor,
        aspek_detail = EXCLUDED.aspek_detail,
        updated_at = NOW()
      RETURNING *;
    `;
    const result = await query(sql, [
      targetId,
      targetSantriId,
      validPengampuId,
      targetSemester,
      tahunAjaran || tahun_ajaran || '2026/2027',
      valKel, valTaj, valFas, valAdb,
      evalKelancaran || eval_kelancaran || req.body.kelancaranKet || req.body.kelancaran_ket || 'Hafalan lancar, tartil, dan mutqin',
      evalTajwid || eval_tajwid || req.body.tajwidKet || req.body.tajwid_ket || "Ghunnah, ikhfa', dan mad diterapkan dengan baik",
      evalFashohah || eval_fashohah || req.body.fashohahKet || req.body.fashohah_ket || 'Pengucapan huruf jelas dan fasih sesuai kaidah',
      evalAdab || eval_adab || req.body.adabKet || req.body.adab_ket || 'Menghormati mushaf, ustadz, dan teman halaqah',
      avg,
      pred,
      catatanMusyrif || catatan_musyrif || '',
      valTempat,
      valTanggal,
      aspekDetail || aspek_detail ? (typeof (aspekDetail || aspek_detail) === 'object' ? JSON.stringify(aspekDetail || aspek_detail) : (aspekDetail || aspek_detail)) : null
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/nilai-rapor/:id', async (req, res) => {
  try {
    await query('DELETE FROM nilai_rapor WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// 7b. FOTO PROFIL ENDPOINTS (SUPER ADMIN, ADMIN CABANG, PENGAMPU)
// =========================================================
app.get('/api/foto-profil', async (req, res) => {
  try {
    const { cabangId, userType, userId } = req.query;
    let sql = 'SELECT * FROM foto_profil';
    const params = [];
    const conditions = [];

    if (cabangId) {
      params.push(cabangId);
      conditions.push(`(cabang_id = $${params.length} OR cabang_id IS NULL)`);
    }
    if (userType) {
      params.push(userType);
      conditions.push(`user_type = $${params.length}`);
    }
    if (userId) {
      params.push(userId);
      conditions.push(`user_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY updated_at DESC';

    const result = await query(sql, params);
    const mapped = result.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userType: r.user_type,
      nama: r.nama,
      username: r.username,
      nip: r.nip,
      role: r.role,
      cabangId: r.cabang_id,
      fotoUrl: r.foto_url,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/foto-profil', async (req, res) => {
  const { id, userId, user_id, userType, user_type, nama, username, nip, role, cabangId, cabang_id, fotoUrl, foto_url } = req.body;
  const targetId = id || `fp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const targetUserId = String(userId || user_id || username || nip || targetId);
  const targetUserType = userType || user_type || 'superadmin';
  const targetFotoUrl = fotoUrl || foto_url || '';
  const targetCabangId = cabangId || cabang_id || null;

  try {
    const sql = `
      INSERT INTO foto_profil (id, user_id, user_type, nama, username, nip, role, cabang_id, foto_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, user_type) DO UPDATE SET
        nama = EXCLUDED.nama,
        username = EXCLUDED.username,
        nip = EXCLUDED.nip,
        role = EXCLUDED.role,
        cabang_id = EXCLUDED.cabang_id,
        foto_url = EXCLUDED.foto_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await query(sql, [
      targetId, targetUserId, targetUserType, nama || '', username || null,
      nip || null, role || null, targetCabangId, targetFotoUrl
    ]);

    // Also sync to superadmin_accounts if applicable
    if (targetUserType === 'superadmin' || targetUserType === 'admin_cabang') {
      try {
        await query(`
          UPDATE superadmin_accounts 
          SET foto = $1 
          WHERE id = $2 OR username = $3
        `, [targetFotoUrl, targetUserId, username || targetUserId]);
      } catch (e) {
        console.warn("[API] Sync superadmin foto warning:", e.message);
      }
    }

    // Also sync to pengampu if applicable
    if (targetUserType === 'pengampu') {
      try {
        await query(`
          UPDATE pengampu 
          SET foto = $1 
          WHERE id = $2 OR nip = $3 OR nama ILIKE $4
        `, [targetFotoUrl, targetUserId, nip || targetUserId, `%${nama}%`]);
      } catch (e) {
        console.warn("[API] Sync pengampu foto warning:", e.message);
      }
    }

    const r = result.rows[0];
    res.json({
      id: r.id,
      userId: r.user_id,
      userType: r.user_type,
      nama: r.nama,
      username: r.username,
      nip: r.nip,
      role: r.role,
      cabangId: r.cabang_id,
      fotoUrl: r.foto_url,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/foto-profil/:userId', async (req, res) => {
  const { userId } = req.params;
  const { userType } = req.query;
  try {
    let sql = 'DELETE FROM foto_profil WHERE user_id = $1 OR id = $1';
    const params = [userId];
    if (userType) {
      sql += ' AND user_type = $2';
      params.push(userType);
    }
    await query(sql, params);

    // Clear photo from accounts
    try {
      await query('UPDATE superadmin_accounts SET foto = NULL WHERE id = $1 OR username = $1', [userId]);
      await query('UPDATE pengampu SET foto = NULL WHERE id = $1 OR nip = $1', [userId]);
    } catch (e) {
      console.warn("[API] Clear account foto warning:", e.message);
    }

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
          INSERT INTO santri (id, nis, nama, kelas, halaqah_id, status, target, kontak, wali, no_hp_wali, cabang_id, pengampu, pengampu_id, nik, nisn, lp, tgl_lahir, unit_sekolah)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama, nis = EXCLUDED.nis, kelas = EXCLUDED.kelas,
            status = EXCLUDED.status, target = EXCLUDED.target, pengampu = EXCLUDED.pengampu,
            pengampu_id = EXCLUDED.pengampu_id, kontak = EXCLUDED.kontak, wali = EXCLUDED.wali,
            no_hp_wali = EXCLUDED.no_hp_wali, cabang_id = EXCLUDED.cabang_id, nik = EXCLUDED.nik,
            nisn = EXCLUDED.nisn, lp = EXCLUDED.lp, tgl_lahir = EXCLUDED.tgl_lahir,
            unit_sekolah = EXCLUDED.unit_sekolah;
        `, [
          s.id, s.nis || s.nisn || '', s.nama, s.kelas || '', s.halaqahId || s.halaqah_id || null, 
          s.status || 'Aktif', s.target || '3 Juz / Tahun', s.kontak || s.kontakWali || '', 
          s.wali || '', s.noHpWali || s.kontakWali || '', s.cabangId || s.cabang_id || 'cabang-pusat',
          s.pengampu || s.pengampuNama || '', s.pengampuId || null, s.nik || '', s.nisn || s.nis || '',
          s.lp || 'L', s.tglLahir || s.tgl_lahir || '', s.unitSekolah || s.unit_sekolah || ''
        ]);
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

    if (Array.isArray(kelas)) {
      for (const k of kelas) {
        await client.query(`
          INSERT INTO kelas (id, nama, unit_sekolah, wali_kelas, cabang_id, aktif)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama, unit_sekolah = EXCLUDED.unit_sekolah, wali_kelas = EXCLUDED.wali_kelas, aktif = EXCLUDED.aktif;
        `, [k.id, k.nama, k.unitSekolah || k.unit_sekolah || 'MA IHYA AS-SUNNAH', k.waliKelas || k.wali_kelas || '', k.cabangId || k.cabang_id || 'cabang-pusat', k.aktif !== false]);
      }
    }

    if (Array.isArray(alumni)) {
      for (const al of alumni) {
        await client.query(`
          INSERT INTO alumni (id, nama, nik, nisn, nism, lp, tahun_lulus, cabang_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama, nik = EXCLUDED.nik, nisn = EXCLUDED.nisn, nism = EXCLUDED.nism, lp = EXCLUDED.lp, tahun_lulus = EXCLUDED.tahun_lulus;
        `, [al.id, al.nama, al.nik || '', al.nisn || '', al.nism || '', al.lp || 'L', al.tahunLulus || al.tahun_lulus || '2026', al.cabangId || al.cabang_id || 'cabang-pusat']);
      }
    }

    if (Array.isArray(lokasi_qr)) {
      for (const l of lokasi_qr) {
        await client.query(`
          INSERT INTO lokasi_qr (id, kelas, lokasi, kode_manual, cabang_id, gps_status, locked, lat, lng, radius_meter)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            kelas = EXCLUDED.kelas, lokasi = EXCLUDED.lokasi, kode_manual = EXCLUDED.kode_manual, lat = EXCLUDED.lat, lng = EXCLUDED.lng, radius_meter = EXCLUDED.radius_meter;
        `, [l.id, l.kelas, l.lokasi, l.kodeManual || l.kode_manual || '', l.cabangId || l.cabang_id || 'cabang-pusat', l.gpsStatus || l.gps_status || 'GPS: Locked', l.locked !== false, l.lat || null, l.lng || null, l.radiusMeter || l.radius_meter || 50]);
      }
    }

    if (Array.isArray(settings)) {
      for (const s of settings) {
        await client.query(`
          INSERT INTO settings (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `, [s.key, typeof s.value === 'object' ? JSON.stringify(s.value) : s.value]);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Seluruh data 15 model berhasil disinkronkan ke PostgreSQL' });
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
    const [cabang, superadmin, pengampu, santri, halaqah, sesi, absensi, setoran, izin, spp, monitoring, kelas, alumni, lokasiQr, settings, fotoProfil] = await Promise.all([
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
      query("SELECT *, to_char(tanggal, 'YYYY-MM-DD') as tanggal_clean FROM monitoring_sigap ORDER BY created_at DESC LIMIT 200"),
      query('SELECT * FROM kelas ORDER BY nama ASC'),
      query('SELECT * FROM alumni ORDER BY created_at DESC LIMIT 200'),
      query('SELECT * FROM lokasi_qr ORDER BY created_at ASC'),
      query('SELECT * FROM settings'),
      query('SELECT * FROM foto_profil ORDER BY updated_at DESC')
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
        monitoring: monitoring.rows.map(r => ({ ...r, tanggal: r.tanggal_clean || r.tanggal })),
        kelas: kelas.rows,
        alumni: alumni.rows,
        lokasi_qr: lokasiQr.rows,
        settings: settings.rows,
        foto_profil: (fotoProfil?.rows || []).map(r => ({
          id: r.id,
          userId: r.user_id,
          userType: r.user_type,
          nama: r.nama,
          username: r.username,
          nip: r.nip,
          role: r.role,
          cabangId: r.cabang_id,
          fotoUrl: r.foto_url,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
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

// 11. KELAS CRUD ENDPOINTS
app.get('/api/kelas', async (req, res) => {
  try {
    const result = await query('SELECT * FROM kelas ORDER BY nama ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kelas', async (req, res) => {
  const { id, nama, unit_sekolah, unitSekolah, wali_kelas, waliKelas, cabang_id, cabangId, aktif } = req.body;
  try {
    const recordId = id || `k-${Date.now()}`;
    const result = await query(`
      INSERT INTO kelas (id, nama, unit_sekolah, wali_kelas, cabang_id, aktif)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        nama = EXCLUDED.nama, unit_sekolah = EXCLUDED.unit_sekolah, wali_kelas = EXCLUDED.wali_kelas, aktif = EXCLUDED.aktif
      RETURNING *;
    `, [recordId, nama, unit_sekolah || unitSekolah || 'MA IHYA AS-SUNNAH', wali_kelas || waliKelas || '', cabang_id || cabangId || 'cabang-pusat', aktif !== false]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/kelas/:id', async (req, res) => {
  try {
    await query('DELETE FROM kelas WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Kelas berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. ALUMNI CRUD ENDPOINTS
app.get('/api/alumni', async (req, res) => {
  try {
    const result = await query('SELECT * FROM alumni ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alumni', async (req, res) => {
  const { id, nama, nik, nisn, nism, lp, tahun_lulus, tahunLulus, cabang_id, cabangId } = req.body;
  try {
    const recordId = id || `alm-${Date.now()}`;
    const result = await query(`
      INSERT INTO alumni (id, nama, nik, nisn, nism, lp, tahun_lulus, cabang_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        nama = EXCLUDED.nama, nik = EXCLUDED.nik, nisn = EXCLUDED.nisn, nism = EXCLUDED.nism, lp = EXCLUDED.lp, tahun_lulus = EXCLUDED.tahun_lulus
      RETURNING *;
    `, [recordId, nama, nik || '', nisn || '', nism || '', lp || 'L', tahun_lulus || tahunLulus || '2026', cabang_id || cabangId || 'cabang-pusat']);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/alumni/:id', async (req, res) => {
  try {
    await query('DELETE FROM alumni WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Alumni berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. LOKASI QR CRUD ENDPOINTS
app.get('/api/lokasi-qr', async (req, res) => {
  try {
    const result = await query('SELECT * FROM lokasi_qr ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lokasi-qr', async (req, res) => {
  const { id, kelas, lokasi, kode_manual, kodeManual, cabang_id, cabangId, gps_status, gpsStatus, locked, lat, lng, radius_meter, radiusMeter } = req.body;
  try {
    const recordId = id || `l-${Date.now()}`;
    const result = await query(`
      INSERT INTO lokasi_qr (id, kelas, lokasi, kode_manual, cabang_id, gps_status, locked, lat, lng, radius_meter)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        kelas = EXCLUDED.kelas, lokasi = EXCLUDED.lokasi, kode_manual = EXCLUDED.kode_manual, lat = EXCLUDED.lat, lng = EXCLUDED.lng, radius_meter = EXCLUDED.radius_meter
      RETURNING *;
    `, [recordId, kelas, lokasi, kode_manual || kodeManual || '', cabang_id || cabangId || 'cabang-pusat', gps_status || gpsStatus || 'GPS: Locked', locked !== false, lat || null, lng || null, radius_meter || radiusMeter || 50]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/lokasi-qr/:id', async (req, res) => {
  try {
    await query('DELETE FROM lokasi_qr WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Lokasi QR berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. SETTINGS CRUD ENDPOINTS
app.get('/api/settings', async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { key, value } = req.body;
  try {
    const result = await query(`
      INSERT INTO settings (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      RETURNING *;
    `, [key, typeof value === 'object' ? JSON.stringify(value) : value]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. ALIAS ROUTES FOR CROSS-COMPATIBILITY
app.get('/api/superadmin-accounts', async (req, res) => {
  try {
    const result = await query('SELECT * FROM superadmin_accounts ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/absensi', async (req, res) => {
  try {
    const result = await query('SELECT * FROM absensi_santri ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/setoran', async (req, res) => {
  try {
    const result = await query('SELECT * FROM setoran_santri ORDER BY tanggal DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/pembayaran-spp', async (req, res) => {
  try {
    const result = await query('SELECT * FROM pembayaran_spp ORDER BY created_at DESC');
    res.json(result.rows);
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
