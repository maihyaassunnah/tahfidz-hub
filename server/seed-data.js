import pg from 'pg';

const { Client } = pg;

async function seedData() {
  const client = new Client({
    connectionString: 'postgresql://postgres:31122000Hfz@43.173.12.46:5432/tahfidz_db'
  });

  try {
    await client.connect();
    console.log('Connected to tahfidz_db on 43.173.12.46:5432');

    // 1. Seed Cabang
    await client.query(`
      INSERT INTO cabang (id, nama, kode, kota, alamat, no_hp, penanggung_jawab, email, status, warna_aksen, didirikan)
      VALUES 
        ('cabang-pusat', 'MA Ihya As-Sunnah (Pusat)', 'MA-PUSAT', 'Tasikmalaya', 'Jl. Terusan As-Sunnah No. 12', '0812-7890-1122', 'Ustadz Hamzah Fauzi, Lc.', 'ma.pusat@ihya.sch.id', 'Aktif', '#0d9488', '2015'),
        ('cabang-smp', 'SMP IT Ihya As-Sunnah', 'SMP-IT', 'Tasikmalaya', 'Jl. Terusan As-Sunnah No. 14', '0812-7890-1133', 'Aminudin, A.Md', 'smpit@ihya.sch.id', 'Aktif', '#2563eb', '2018'),
        ('cabang-ponpes', 'Pondok Pesantren PPIAS', 'PPIAS', 'Tasikmalaya', 'Kompleks Kampus Putra PPIAS', '0812-3456-7811', 'Wahyudin Hafiz, S.Pd', 'ponpes@ppias.sch.id', 'Aktif', '#10b981', '2012')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Cabang seeded');

    // 2. Seed Pengampu
    await client.query(`
      INSERT INTO pengampu (id, nip, nama, kontak, no_hp, role, halaqah_id, cabang_id)
      VALUES
        ('p-1', 'NIP-101', 'Ustadz Wahyudin Hafiz, S.Pd', '081234567890', '081234567890', 'Pengampu Halaqoh', 'hq-1', 'cabang-pusat'),
        ('p-2', 'NIP-102', 'Ustadz Hamzah Fauzi, Lc', '081234567891', '081234567891', 'Pengampu Halaqoh', 'hq-2', 'cabang-pusat'),
        ('p-3', 'NIP-103', 'Ustadz Abu Rayyan, M.Ag', '081234567892', '081234567892', 'Pengampu Halaqoh', 'hq-3', 'cabang-pusat')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Pengampu seeded');

    // 3. Seed Halaqah
    await client.query(`
      INSERT INTO halaqah (id, nama, pengampu_id, target, keterangan, cabang_id)
      VALUES
        ('hq-1', 'Halaqah Ustadz Wahyudin (X A - Ikhwan)', 'p-1', '10 Juz', 'Halaqah Ikhwan Kelas X', 'cabang-pusat'),
        ('hq-2', 'Halaqah Ustadz Hamzah (XI A - Ikhwan)', 'p-2', '15 Juz', 'Halaqah Ikhwan Kelas XI', 'cabang-pusat'),
        ('hq-3', 'Halaqah Ustadz Abu Rayyan (XII A - Ikhwan)', 'p-3', '30 Juz Mutqin', 'Halaqah Ikhwan Kelas XII', 'cabang-pusat')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Halaqah seeded');

    // 4. Seed Sesi
    await client.query(`
      INSERT INTO sesi (id, nama, jam_mulai, jam_selesai, toleransi_menit, hari, status, cabang_id)
      VALUES
        ('sesi-shubuh', 'Ba''da Shubuh', '05:00', '06:15', 15, 'Setiap Hari', 'Aktif', 'cabang-pusat'),
        ('sesi-ashar', 'Ba''da Ashar', '15:45', '17:00', 15, 'Setiap Hari', 'Aktif', 'cabang-pusat'),
        ('sesi-maghrib', 'Ba''da Maghrib', '18:30', '19:45', 15, 'Setiap Hari', 'Aktif', 'cabang-pusat')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Sesi seeded');

    // 5. Seed Santri
    await client.query(`
      INSERT INTO santri (id, nis, nama, kelas, halaqah_id, status, target, kontak, wali, no_hp_wali, cabang_id)
      VALUES
        ('s-1', '2026101', 'Ahmad Farhan Al-Fatih', 'X-A', 'hq-1', 'Aktif', 'Juz 30', '081299881111', 'Bpk. Hendra Gunawan', '081299881111', 'cabang-pusat'),
        ('s-2', '2026102', 'Muhammad Ziyad Rabbani', 'X-A', 'hq-1', 'Aktif', 'Juz 29', '081299881112', 'Bpk. Dr. Irfan Hakim', '081299881112', 'cabang-pusat'),
        ('s-3', '2026103', 'Hafizh Al-Ghifari', 'X-A', 'hq-1', 'Aktif', 'Juz 28', '081299881113', 'Bpk. Slamet Riyadi', '081299881113', 'cabang-pusat'),
        ('s-4', '2026104', 'Bilal Ibnu Rabah', 'XI-A', 'hq-2', 'Aktif', 'Juz 15', '081299881114', 'Bpk. Ahmad Sobari', '081299881114', 'cabang-pusat'),
        ('s-5', '2026105', 'Umar Al-Faruq', 'XII-A', 'hq-3', 'Aktif', 'Juz 30 Mutqin', '081299881115', 'Bpk. H. Mansur', '081299881115', 'cabang-pusat')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Santri seeded');

    const check = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM cabang) as total_cabang,
        (SELECT COUNT(*) FROM pengampu) as total_pengampu,
        (SELECT COUNT(*) FROM halaqah) as total_halaqah,
        (SELECT COUNT(*) FROM sesi) as total_sesi,
        (SELECT COUNT(*) FROM santri) as total_santri;
    `);
    console.log('Database summary:', check.rows[0]);

    await client.end();
  } catch (err) {
    console.error('Error seeding data:', err.message);
  }
}

seedData();
