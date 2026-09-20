-- =========================================================
-- DATABASE SCHEMA SIMTAH (Sistem Informasi Manajemen Tahfidz)
-- PostgreSQL DDL Script
-- =========================================================

-- 1. TABEL CABANG LEMBAGA
CREATE TABLE IF NOT EXISTS cabang (
  id VARCHAR(64) PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kode VARCHAR(32) NOT NULL UNIQUE,
  kota VARCHAR(100),
  alamat TEXT,
  no_hp VARCHAR(32),
  penanggung_jawab VARCHAR(150),
  email VARCHAR(100),
  status VARCHAR(32) DEFAULT 'Aktif',
  warna_aksen VARCHAR(16) DEFAULT '#0d9488',
  didirikan VARCHAR(16),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL AKUN SUPER ADMIN
CREATE TABLE IF NOT EXISTS superadmin_accounts (
  id VARCHAR(64) PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(64) DEFAULT 'Super Admin Cabang',
  cabang_id VARCHAR(64) REFERENCES cabang(id) ON DELETE SET NULL,
  status VARCHAR(32) DEFAULT 'Aktif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL PENGAMPU / ASATIDZAH
CREATE TABLE IF NOT EXISTS pengampu (
  id VARCHAR(64) PRIMARY KEY,
  nip VARCHAR(64),
  nama VARCHAR(150) NOT NULL,
  kontak VARCHAR(50),
  no_hp VARCHAR(50),
  role VARCHAR(64) DEFAULT 'Pengampu Halaqoh',
  halaqah_id VARCHAR(64),
  foto TEXT,
  cabang_id VARCHAR(64) REFERENCES cabang(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL HALAQAH
CREATE TABLE IF NOT EXISTS halaqah (
  id VARCHAR(64) PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  pengampu_id VARCHAR(64) REFERENCES pengampu(id) ON DELETE SET NULL,
  target VARCHAR(100),
  keterangan TEXT,
  cabang_id VARCHAR(64) REFERENCES cabang(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL SANTRI
CREATE TABLE IF NOT EXISTS santri (
  id VARCHAR(64) PRIMARY KEY,
  nis VARCHAR(64),
  nisn VARCHAR(64),
  nik VARCHAR(64),
  nama VARCHAR(150) NOT NULL,
  lp VARCHAR(10) DEFAULT 'L',
  kelas VARCHAR(50),
  unit_sekolah VARCHAR(150),
  pengampu VARCHAR(150),
  pengampu_id VARCHAR(64),
  halaqah_id VARCHAR(64) REFERENCES halaqah(id) ON DELETE SET NULL,
  status VARCHAR(32) DEFAULT 'Aktif',
  target VARCHAR(100),
  kontak VARCHAR(50),
  wali VARCHAR(150),
  no_hp_wali VARCHAR(50),
  tgl_lahir VARCHAR(64),
  cabang_id VARCHAR(64) REFERENCES cabang(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL SESI HALAQAH / KBM
CREATE TABLE IF NOT EXISTS sesi (
  id VARCHAR(64) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  jam_mulai VARCHAR(16) NOT NULL,
  jam_selesai VARCHAR(16) NOT NULL,
  toleransi_menit INTEGER DEFAULT 15,
  hari VARCHAR(50) DEFAULT 'Setiap Hari',
  status VARCHAR(32) DEFAULT 'Aktif',
  cabang_id VARCHAR(64) REFERENCES cabang(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL ABSENSI SANTRI
CREATE TABLE IF NOT EXISTS absensi_santri (
  id VARCHAR(64) PRIMARY KEY,
  tanggal DATE NOT NULL,
  sesi_id VARCHAR(64),
  santri_id VARCHAR(64) REFERENCES santri(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL, -- 'Hadir', 'Izin', 'Sakit', 'Alpa'
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tanggal, sesi_id, santri_id)
);

-- 8. TABEL SETORAN TAHFIDZ SANTRI
CREATE TABLE IF NOT EXISTS setoran_santri (
  id VARCHAR(64) PRIMARY KEY,
  tanggal DATE NOT NULL,
  santri_id VARCHAR(64) REFERENCES santri(id) ON DELETE CASCADE,
  pengampu_id VARCHAR(64) REFERENCES pengampu(id) ON DELETE SET NULL,
  jenis VARCHAR(32) DEFAULT 'Ziyadah', -- 'Ziyadah', 'Muraja\'ah'
  surat VARCHAR(100) NOT NULL,
  ayat_mulai INTEGER NOT NULL,
  ayat_selesai INTEGER NOT NULL,
  nilai VARCHAR(16) DEFAULT 'A',
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL IZIN (PENGAMPU & SANTRI)
CREATE TABLE IF NOT EXISTS izin (
  id VARCHAR(64) PRIMARY KEY,
  pemohon_id VARCHAR(64) NOT NULL,
  tipe_pemohon VARCHAR(32) DEFAULT 'Pengampu', -- 'Pengampu', 'Santri'
  jenis VARCHAR(32) DEFAULT 'Izin', -- 'Izin', 'Sakit', 'Dinas'
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  alasan TEXT NOT NULL,
  tugas_pengganti TEXT,
  status_approval VARCHAR(32) DEFAULT 'Menunggu', -- 'Disetujui', 'Ditolak', 'Menunggu'
  bukti_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABEL MONITORING PRESENSI PENGAMPU REALTIME (SIGAP)
CREATE TABLE IF NOT EXISTS monitoring_sigap (
  id VARCHAR(64) PRIMARY KEY,
  tanggal DATE NOT NULL,
  pengampu_id VARCHAR(64) REFERENCES pengampu(id) ON DELETE SET NULL,
  nama VARCHAR(150) NOT NULL,
  nip VARCHAR(64),
  role VARCHAR(64),
  halaqah VARCHAR(150),
  mapel VARCHAR(150),
  kelas VARCHAR(100),
  sesi VARCHAR(64),
  jadwal VARCHAR(64),
  jam VARCHAR(16) DEFAULT '-',
  status VARCHAR(32) NOT NULL, -- 'Hadir', 'Tepat Waktu', 'Terlambat', 'Izin', 'Belum Absen', 'Alpa'
  selisih_menit INTEGER DEFAULT 0,
  lokasi_gps VARCHAR(150),
  metode VARCHAR(64) DEFAULT 'Scan QR GPS',
  keterangan TEXT,
  alasan_izin TEXT,
  tugas_siswa TEXT,
  manual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABEL PENGATURAN UMUM
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(64) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABEL FOTO PROFIL RESMI AKUN (POSTGRESQL PERMANENT STORAGE)
CREATE TABLE IF NOT EXISTS foto_profil (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_type VARCHAR(32) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  username VARCHAR(100),
  nip VARCHAR(64),
  role VARCHAR(64),
  cabang_id VARCHAR(64) REFERENCES cabang(id) ON DELETE SET NULL,
  foto_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_foto_profil_user UNIQUE (user_id, user_type)
);

-- INDEKS UNTUK OPTIMASI QUERY CEPAT
CREATE INDEX IF NOT EXISTS idx_absensi_tgl ON absensi_santri (tanggal);
CREATE INDEX IF NOT EXISTS idx_monitoring_tgl ON monitoring_sigap (tanggal);
CREATE INDEX IF NOT EXISTS idx_santri_cabang ON santri (cabang_id);
CREATE INDEX IF NOT EXISTS idx_pengampu_cabang ON pengampu (cabang_id);

-- =========================================================
-- SEED DATA DEFAULT (INISIALISASI)
-- =========================================================

-- Seed Cabang
INSERT INTO cabang (id, nama, kode, kota, alamat, no_hp, penanggung_jawab, email, status, warna_aksen, didirikan)
VALUES 
  ('cabang-pusat', 'MA Ihya As-Sunnah (Pusat)', 'MA-PUSAT', 'Tasikmalaya', 'Jl. Terusan As-Sunnah No. 12, Kel. Pasirhuni', '0812-7890-1122', 'Ustadz Hamzah Fauzi, Lc.', 'ma.pusat@ihya.sch.id', 'Aktif', '#0d9488', '2015'),
  ('cabang-smp', 'SMP IT Ihya As-Sunnah', 'SMP-IT', 'Tasikmalaya', 'Jl. Terusan As-Sunnah No. 14, Kompleks Timur', '0812-7890-1133', 'Aminudin, A.Md', 'smpit@ihya.sch.id', 'Aktif', '#2563eb', '2018'),
  ('cabang-ponpes', 'Pondok Pesantren PPIAS', 'PONPES-PPIAS', 'Tasikmalaya', 'Jl. As-Sunnah Atas No. 01, Kompleks Asrama', '0812-7890-1144', 'Ustadz Abu Qatadah', 'ponpes@ihya.sch.id', 'Aktif', '#7c3aed', '2010')
ON CONFLICT (id) DO NOTHING;

-- Seed Superadmin Accounts
INSERT INTO superadmin_accounts (id, nama, username, password, role, cabang_id, status)
VALUES 
  ('sa-ma-pusat', 'Admin MA Ihya As-Sunnah', 'admin_ma', 'bismillah123', 'Super Admin Cabang', 'cabang-pusat', 'Aktif'),
  ('sa-smp-it', 'Admin SMP IT Ihya As-Sunnah', 'admin_smp', 'bismillah123', 'Super Admin Cabang', 'cabang-smp', 'Aktif'),
  ('sa-ponpes', 'Admin Pondok Pesantren PPIAS', 'admin_ponpes', 'bismillah123', 'Super Admin Cabang', 'cabang-ponpes', 'Aktif')
ON CONFLICT (id) DO NOTHING;

-- Seed Pengampu
INSERT INTO pengampu (id, nip, nama, kontak, no_hp, role, cabang_id)
VALUES 
  ('g-1', '198801012015011001', 'Wahyudin Hafiz, S.Pd', '0812-3456-7890', '0812-3456-7890', 'Pengampu Utama', 'cabang-pusat'),
  ('g-2', '199105152019031002', 'Redi Iskandar, S.Pd., B.A.', '0813-2345-6789', '0813-2345-6789', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-3', '199509122021022003', 'Fitria Cahya Kamila, S.Pd', '0812-9876-5432', '0812-9876-5432', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-4', '199002142018011004', 'Feri Hermawan, S.Pd', '0857-1122-3344', '0857-1122-3344', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-5', '200020182091', 'Ainun Hamidah, S.Pd', '0878-9900-1122', '0878-9900-1122', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-6', '19982025007011', 'Agus Rinaldi', '0819-3344-5566', '0819-3344-5566', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-7', '19930415201902', 'Hendriyansa Putra', '0821-4455-6677', '0821-4455-6677', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-8', '199620032140', 'Defit Purwaningsih, S.Pd', '0852-6677-8899', '0852-6677-8899', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-9', '200120232152', 'Febrianti Dewi, S.Pd', '0813-8899-0011', '0813-8899-0011', 'Pengampu Halaqoh', 'cabang-pusat'),
  ('g-10', '19910408201', 'Ustadz Hamzah Fauzi, Lc.', '0811-2233-4455', '0811-2233-4455', 'Pengampu Halaqoh', 'cabang-pusat')
ON CONFLICT (id) DO NOTHING;

-- Seed Halaqah
INSERT INTO halaqah (id, nama, pengampu_id, target, cabang_id)
VALUES 
  ('h-1', 'Halaqah Abu Bakar Ash-Shiddiq', 'g-1', 'Juz 28, 29, 30', 'cabang-pusat'),
  ('h-2', 'Halaqah Umar bin Khattab', 'g-2', 'Juz 1, 2, 3', 'cabang-pusat'),
  ('h-3', 'Halaqah Utsman bin Affan', 'g-3', 'Juz 4, 5, 6', 'cabang-pusat'),
  ('h-4', 'Halaqah Ali bin Abi Thalib', 'g-4', 'Juz 7, 8, 9', 'cabang-pusat')
ON CONFLICT (id) DO NOTHING;

-- Seed Sesi
INSERT INTO sesi (id, nama, jam_mulai, jam_selesai, toleransi_menit, hari, status, cabang_id)
VALUES 
  ('sesi-1', 'Ba''da Subuh', '05:00', '06:30', 15, 'Setiap Hari', 'Aktif', 'cabang-pusat'),
  ('sesi-2', 'Pagi / Dhuha', '07:30', '09:00', 15, 'Senin - Kamis & Sabtu', 'Aktif', 'cabang-pusat'),
  ('sesi-3', 'Ba''da Ashar', '16:00', '17:30', 15, 'Setiap Hari', 'Aktif', 'cabang-pusat'),
  ('sesi-4', 'Ba''da Maghrib', '18:30', '19:45', 15, 'Setiap Hari', 'Aktif', 'cabang-pusat')
ON CONFLICT (id) DO NOTHING;
