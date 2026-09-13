// Storage Service untuk SIMTAH (Sistem Informasi Manajemen Tahfidz)
// MA Ihya As Sunnah / PPIAS
import apiService from './api.js';

const STORAGE_KEYS = {
  SANTRI: 'simtah_santri_v3',
  HALAQAH: 'simtah_halaqah_v3',
  PENGAMPU: 'simtah_pengampu_v3',
  SESI: 'simtah_sesi_v3',
  SETORAN: 'simtah_setoran_v2',
  ABSENSI: 'simtah_absensi_v2',
  IZIN: 'simtah_izin_v2',
  SETTINGS: 'simtah_settings_v3',
  CURRENT_ROLE: 'simtah_role_v2',
  SELECTED_STUDENT_PARENT: 'simtah_parent_student_v2',
  SIGAP_SISWA: 'sigap_siswa_v2',
  SIGAP_GURU: 'sigap_guru_v2',
  SIGAP_ALUMNI: 'sigap_alumni_v2',
  SIGAP_KELAS: 'sigap_kelas_v2',
  SIGAP_JADWAL: 'sigap_jadwal_v2',
  SIGAP_JADWAL_HALAQOH: 'sigap_jadwal_halaqoh_v2',
  SIGAP_LOKASI_QR: 'sigap_lokasi_qr_v3',
  SIGAP_IZIN_GURU: 'sigap_izin_guru_v2',
  SIGAP_MONITORING: 'sigap_monitoring_v6',
  CABANG: 'simtah_cabang_v1',
  SUPERADMIN_ACCOUNTS: 'simtah_superadmin_accounts_v1',
  ACTIVE_BRANCH_ID: 'simtah_active_branch_v1',
  PENGAMPU_PRESENSI: 'simtah_pengampu_presensi_v3'
};

// Data Inisial Cabang Lembaga (Multi-Branch)
const INITIAL_CABANG = [
  {
    id: 'cabang-pusat',
    nama: "MA Ihya As-Sunnah (Pusat)",
    kode: "MA-PUSAT",
    kota: "Tasikmalaya",
    alamat: "Jl. Terusan As-Sunnah No. 12, Kel. Pasirhuni",
    noHp: "0812-7890-1122",
    penanggungJawab: "Ustadz Hamzah Fauzi, Lc.",
    email: "ma.pusat@ihya.sch.id",
    status: "Aktif",
    warnaAksen: "#0d9488",
    didirikan: "2015"
  },
  {
    id: 'cabang-smp',
    nama: "SMP IT Ihya As-Sunnah",
    kode: "SMP-IT",
    kota: "Tasikmalaya",
    alamat: "Jl. Terusan As-Sunnah No. 14, Kompleks Timur",
    noHp: "0812-7890-1133",
    penanggungJawab: "Aminudin, A.Md",
    email: "smpit@ihya.sch.id",
    status: "Aktif",
    warnaAksen: "#2563eb",
    didirikan: "2018"
  },
  {
    id: 'cabang-ponpes',
    nama: "Pondok Pesantren PPIAS",
    kode: "PPIAS",
    kota: "Tasikmalaya",
    alamat: "Kompleks Kampus Putra PPIAS",
    noHp: "0812-3456-7811",
    penanggungJawab: "Wahyudin Hafiz, S.Pd",
    email: "ponpes@ppias.sch.id",
    status: "Aktif",
    warnaAksen: "#10b981",
    didirikan: "2010"
  }
];

// Data Inisial Akun Super Admin per Cabang
const INITIAL_SUPERADMIN_ACCOUNTS = [
  {
    id: 'sa-pusat',
    nama: "Admin MA Ihya As-Sunnah",
    username: "admin.ma",
    email: "admin.ma@ihya.sch.id",
    password: "bismillah123",
    cabangId: "cabang-pusat",
    cabangNama: "MA Ihya As-Sunnah (Pusat)",
    noHp: "0812-7890-1122",
    status: "Aktif",
    role: "Super Admin Cabang",
    terakhirLogin: "Hari ini"
  },
  {
    id: 'sa-smp',
    nama: "Admin SMP IT Ihya As-Sunnah",
    username: "admin.smp",
    email: "admin.smp@ihya.sch.id",
    password: "bismillah123",
    cabangId: "cabang-smp",
    cabangNama: "SMP IT Ihya As-Sunnah",
    noHp: "0812-7890-1133",
    status: "Aktif",
    role: "Super Admin Cabang",
    terakhirLogin: "Kemarin"
  },
  {
    id: 'sa-ponpes',
    nama: "Admin Ponpes PPIAS",
    username: "admin.ponpes",
    email: "admin.ponpes@ihya.sch.id",
    password: "bismillah123",
    cabangId: "cabang-ponpes",
    cabangNama: "Pondok Pesantren PPIAS",
    noHp: "0812-3456-7811",
    status: "Aktif",
    role: "Super Admin Cabang",
    terakhirLogin: "2 hari lalu"
  }
];

// Data Akun Ustadz Pengampu Lengkap — Disesuaikan dengan Data Guru/Pegawai SIGAP
const INITIAL_PENGAMPU = [
  {
    id: "u-wahyudin",
    nama: "Wahyudin Hafiz, S.Pd",
    nip: "19880101201501",
    username: "wahyudin",
    email: "wahyudin@ppias.sch.id",
    noHp: "0812-3456-7811",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Koordinator Tahfidz & Wali Kelas X A",
    halaqahId: "h-wahyudin",
    halaqahNama: "Halaqah Ustadz Wahyudin (X A - Ikhwan)",
    lokasi: "Lokal Ikhwan Lantai 2 (X A)",
    status: "Aktif",
    role: "Pengampu Utama",
    password: "bismillah123",
    terakhirLogin: "Hari ini 05:15"
  },
  {
    id: "u-febrianti",
    nama: "Febrianti Dewi, S.Pd",
    nip: "200120232152",
    username: "febrianti",
    email: "febriantidewi043@gmail.com",
    noHp: "6282279304564",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Wali Kelas X B",
    halaqahId: "h-febrianti",
    halaqahNama: "Halaqah Ustadzah Febrianti (X B - Akhwat)",
    lokasi: "Lokal Akhwat Lantai 2 (X B)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 05:20"
  },
  {
    id: "u-agus",
    nama: "Agus Rinaldi",
    nip: "19982025007011180",
    username: "agus",
    email: "hastagcoretansantri@gmail.com",
    noHp: "6282279990521",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Staff TU Pondok & Wali Kelas XI A",
    halaqahId: "h-agus",
    halaqahNama: "Halaqah Ustadz Agus (XI A - Ikhwan)",
    lokasi: "Gedung B, Lt 1 (XI A)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 05:10"
  },
  {
    id: "u-ainun",
    nama: "Ainun Hamidah, S.Pd",
    nip: "200020182091",
    username: "ainun",
    email: "kholid.arfandani@gmail.com",
    noHp: "6285764038355",
    unit: "2 Unit",
    unitTag: "SMP IT IHYA' AS-SUNNAH",
    jabatan: "Wali Kelas XI B & Pengampu Tahfidz",
    halaqahId: "h-ainun",
    halaqahNama: "Halaqah Ustadzah Ainun (XI B - Akhwat)",
    lokasi: "Gedung Akhwat Lt 2 (XI B)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 05:05"
  },
  {
    id: "u-feri",
    nama: "Feri Hermawan, S.Pd",
    nip: "19900214201801",
    username: "feri",
    email: "feri.hermawan@ppias.sch.id",
    noHp: "0812-7891-2345",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Wali Kelas XII A",
    halaqahId: "h-feri",
    halaqahNama: "Halaqah Ustadz Feri (XII A - Ikhwan)",
    lokasi: "Gedung A Lantai 3 (XII A)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 05:00"
  },
  {
    id: "u-defit",
    nama: "Defit Purwaningsih, S.Pd",
    nip: "199620032140",
    username: "defit",
    email: "defitpurwaningsih22@gmail.com",
    noHp: "6282258613578",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Waka Kurikulum & Wali Kelas XII B",
    halaqahId: "h-defit",
    halaqahNama: "Halaqah Ustadzah Defit (XII B - Akhwat)",
    lokasi: "Gedung Akhwat, Lt 2 (XII B)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 04:55"
  },
  {
    id: "u-redi",
    nama: "Redi Iskandar, S.Pd., B.A.",
    nip: "19910515201901",
    username: "redi",
    email: "redi.iskandar@ppias.sch.id",
    noHp: "0812-3456-7814",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-redi",
    halaqahNama: "Halaqah Ustadz Redi (X B - Akhwat)",
    lokasi: "Lokal Akhwat Lantai 2 (X B)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 05:02"
  },
  {
    id: "u-hendri",
    nama: "Hendriyansa Putra",
    nip: "19930415201902",
    username: "hendri",
    email: "hendriyansa@ppias.sch.id",
    noHp: "0812-3456-7815",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-hendri",
    halaqahNama: "Halaqah Ust. Hendriyansa (XI A - Ikhwan)",
    lokasi: "Gedung A Lantai 2 (XI A)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 05:07"
  },
  {
    id: "u-hamzah",
    nama: "Ustadz Hamzah Fauzi, Lc.",
    nip: "19910408201704",
    username: "hamzah",
    email: "hamzah.fauzi@ppias.sch.id",
    noHp: "0812-3456-7816",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-hamzah",
    halaqahNama: "Halaqah Ustadz Hamzah (XI B - Akhwat)",
    lokasi: "Gedung Akhwat Lt 2 (XI B)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Kemarin 18:50"
  },
  {
    id: "u-fitria",
    nama: "Fitria Cahya Kamila, S.Pd",
    nip: "19950912202102",
    username: "fitria",
    email: "fitria.kamila@ppias.sch.id",
    noHp: "0812-3456-7817",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-fitria",
    halaqahNama: "Halaqah Ustadzah Fitria (XII B - Akhwat)",
    lokasi: "Gedung Akhwat, Lt 2 (XII B)",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 04:58"
  },
  {
    id: "u-aminudin",
    nama: "Aminudin, A.Md",
    nip: "199520231138",
    username: "aminudin",
    email: "aminudin13@gmail.com",
    noHp: "62895355691010",
    unit: "2 Unit",
    unitTag: "SMP IT IHYA' AS-SUNNAH",
    jabatan: "Staff KBM",
    halaqahId: "h-aminudin",
    halaqahNama: "Halaqah Ustadz Aminudin",
    lokasi: "Kantor KBM PPIAS",
    status: "Aktif",
    role: "Staff KBM",
    password: "bismillah123",
    terakhirLogin: "Hari ini 06:15"
  },
  {
    id: "u-ananda",
    nama: "Ananda Novita, S.Pd",
    nip: "200020222127",
    username: "ananda",
    email: "ndvita511@gmail.com",
    noHp: "6282282582331",
    unit: "2 Unit",
    unitTag: "SMP IT IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-ananda",
    halaqahNama: "Halaqah Ustadzah Ananda",
    lokasi: "Gedung SMP IT",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 06:10"
  },
  {
    id: "u-ajizah",
    nama: "Ajizah Ikhda Sulmi, S.Pd",
    nip: "199820222132",
    username: "ajizah",
    email: "ajizshikhda0389@gmail.com",
    noHp: "6285181428518",
    unit: "2 Unit",
    unitTag: "SMP IT IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-ajizah",
    halaqahNama: "Halaqah Ustadzah Ajizah",
    lokasi: "Gedung SMP IT",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Kemarin 14:20"
  },
  {
    id: "u-aaz",
    nama: "AAZ",
    nip: "NON-NIP",
    username: "aaz",
    email: "agus.rinaldi23@sttmadani.ac.id",
    noHp: "0812-7890-1122",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-aaz",
    halaqahNama: "Halaqah Ustadz AAZ",
    lokasi: "Pesantren PPIAS",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 07:00"
  },
  {
    id: "u-aazeed",
    nama: "aazeed",
    nip: "NON-NIP",
    username: "aazeed",
    email: "agus98rinaldi@gmail.com",
    noHp: "0812-7890-1133",
    unit: "MA IHYA' AS-SUNNAH",
    jabatan: "Pengampu Tahfidz",
    halaqahId: "h-aazeed",
    halaqahNama: "Halaqah Ustadz aazeed",
    lokasi: "Pesantren PPIAS",
    status: "Aktif",
    role: "Pengampu",
    password: "bismillah123",
    terakhirLogin: "Hari ini 07:05"
  }
];

// Data Sesi Presensi Halaqah — Disesuaikan dengan Jadwal Sesi SIGAP
// Data Sesi Presensi Halaqah — Disesuaikan dengan Jadwal Sesi SIGAP
const INITIAL_SESI = [
  {
    id: "subuh",
    nama: "Ba'da Subuh",
    status: "AKTIF",
    badgeType: "success",
    jamMulai: "05:00",
    jamSelesai: "06:30",
    mulai: "05:00",
    selesai: "06:30",
    bukaScan: "04:45",
    batasScan: "05:30",
    toleransiMenit: 15,
    jamScan: "04:45 - 05:30",
    keterangan: "Ziyadah & Tahsin — Ba'da Subuh",
    isActive: true,
    aktif: true
  },
  {
    id: "pagi",
    nama: "Pagi / Dhuha",
    status: "AKTIF",
    badgeType: "success",
    jamMulai: "08:30",
    jamSelesai: "10:00",
    mulai: "08:30",
    selesai: "10:00",
    bukaScan: "08:15",
    batasScan: "09:00",
    toleransiMenit: 15,
    jamScan: "08:15 - 09:00",
    keterangan: "Penguatan Hafalan & Tasmi' Berpasangan",
    isActive: true,
    aktif: true
  },
  {
    id: "ashar",
    nama: "Ba'da Ashar",
    status: "AKTIF",
    badgeType: "success",
    jamMulai: "16:00",
    jamSelesai: "17:30",
    mulai: "16:00",
    selesai: "17:30",
    bukaScan: "15:45",
    batasScan: "16:30",
    toleransiMenit: 15,
    jamScan: "15:45 - 16:30",
    keterangan: "Muroja'ah Sabqi & Manzil Rutin",
    isActive: true,
    aktif: true
  },
  {
    id: "malam",
    nama: "Ba'da Maghrib",
    status: "AKTIF",
    badgeType: "success",
    jamMulai: "18:45",
    jamSelesai: "20:30",
    mulai: "18:45",
    selesai: "20:30",
    bukaScan: "18:30",
    batasScan: "19:15",
    toleransiMenit: 15,
    jamScan: "18:30 - 19:15",
    keterangan: "Tadarus Halaqoh & Persiapan Setoran Esok",
    isActive: true,
    aktif: true
  }
];

// Data Halaqah — Disesuaikan dengan Pengampu SIGAP
const INITIAL_HALAQAH = [
  {
    id: "h-wahyudin",
    nama: "Halaqah Ustadz Wahyudin (X A - Ikhwan)",
    musyrif: "Wahyudin Hafiz, S.Pd",
    lokasi: "Lokal Ikhwan Lantai 2 (X A)",
    targetJuzPekan: 0.5
  },
  {
    id: "h-redi",
    nama: "Halaqah Ustadz Redi (X B - Akhwat)",
    musyrif: "Redi Iskandar, S.Pd., B.A.",
    lokasi: "Lokal Akhwat Lantai 2 (X B)",
    targetJuzPekan: 0.5
  },
  {
    id: "h-hendri",
    nama: "Halaqah Ust. Hendriyansa (XI A - Ikhwan)",
    musyrif: "Hendriyansa Putra",
    lokasi: "Gedung A Lantai 2 (XI A)",
    targetJuzPekan: 0.5
  },
  {
    id: "h-agus",
    nama: "Halaqah Ustadz Agus (XII A - Ikhwan)",
    musyrif: "Agus Rinaldi",
    lokasi: "Gedung B, Lt 1 (XII A)",
    targetJuzPekan: 0.5
  },
  {
    id: "h-hamzah",
    nama: "Halaqah Ustadz Hamzah (XI B - Akhwat)",
    musyrif: "Ustadz Hamzah Fauzi, Lc.",
    lokasi: "Gedung Akhwat Lt 2 (XI B)",
    targetJuzPekan: 0.5
  },
  {
    id: "h-fitria",
    nama: "Halaqah Ustadzah Fitria (XII B - Akhwat)",
    musyrif: "Fitria Cahya Kamila, S.Pd",
    lokasi: "Gedung Akhwat, Lt 2 (XII B)",
    targetJuzPekan: 0.5
  },
  {
    id: "h-smp-1",
    nama: "Halaqah SMP IT Putra (Aminudin)",
    musyrif: "Aminudin, A.Md",
    cabangId: "cabang-smp",
    lokasi: "Gedung SMP IT Lt 1",
    targetJuzPekan: 0.5
  },
  {
    id: "h-ponpes-1",
    nama: "Halaqah Tahfidz Intensif PPIAS",
    musyrif: "Wahyudin Hafiz, S.Pd",
    cabangId: "cabang-ponpes",
    lokasi: "Masjid Jami' PPIAS",
    targetJuzPekan: 1.0
  }
];

// Santri — Disesuaikan dengan Data Siswa SIGAP (semua kelas X-XII)
const INITIAL_SANTRI = [
  {
    id: "s-azmi",
    nis: "202600",
    nama: "Muhammad Azmi Soleh",
    halaqahId: "h-wahyudin",
    cabangId: "cabang-pusat",
    kelas: "X Tahfidz 1",
    targetJuz: 30,
    totalHalaman: 18.2,
    rincianHalaman: "18 Hlm 8 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28, 27, 26, 1],
    juzZiyadah: [2],
    namaWali: "H. Solehudin",
    kontakWali: "081234567800",
    foto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "s-akbar",
    nis: "202601",
    nama: "Jamiatul Akbar",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 30,
    totalHalaman: 14.5,
    rincianHalaman: "14 Hlm 8 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28, 27, 26, 1, 2, 3],
    juzZiyadah: [4, 5],
    namaWali: "H. Akbar Sasmita",
    kontakWali: "081234567801",
    foto: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "s-attalah",
    nis: "202602",
    nama: "Attalah Saum Alvano",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 25,
    totalHalaman: 13.6,
    rincianHalaman: "13 Hlm 9 Brs",
    peringkat: 2,
    juzMutqin: [30, 29, 28, 27, 1, 2],
    juzZiyadah: [3],
    namaWali: "Drs. Bambang Alvano",
    kontakWali: "081234567802",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "s-futra",
    nis: "202603",
    nama: "M. Al Futra",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 20,
    totalHalaman: 12.9,
    rincianHalaman: "12 Hlm 13 Brs",
    peringkat: 3,
    juzMutqin: [30, 29, 28, 1],
    juzZiyadah: [2],
    namaWali: "Ir. Futra Pratama",
    kontakWali: "081234567803",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "s-4",
    nis: "202604",
    nama: "Muhammad Zaidan",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 15,
    totalHalaman: 11.2,
    rincianHalaman: "11 Hlm 5 Brs",
    peringkat: 4,
    juzMutqin: [30, 29, 1],
    juzZiyadah: [2],
    namaWali: "H. Hendra",
    kontakWali: "081234567804"
  },
  {
    id: "s-5",
    nis: "202605",
    nama: "Ahmad Farhan",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 15,
    totalHalaman: 10.8,
    rincianHalaman: "10 Hlm 12 Brs",
    peringkat: 5,
    juzMutqin: [30, 1],
    juzZiyadah: [29],
    namaWali: "Farid Abdullah",
    kontakWali: "081234567805"
  },
  {
    id: "s-6",
    nis: "202606",
    nama: "Rayhan Al-Ghifari",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 15,
    totalHalaman: 9.7,
    rincianHalaman: "9 Hlm 7 Brs",
    peringkat: 6,
    juzMutqin: [30, 29],
    juzZiyadah: [1],
    namaWali: "H. Gunawan",
    kontakWali: "081234567806"
  },
  {
    id: "s-7",
    nis: "202607",
    nama: "Bilal Fathurrahman",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 10,
    totalHalaman: 9.1,
    rincianHalaman: "9 Hlm 2 Brs",
    peringkat: 7,
    juzMutqin: [30],
    juzZiyadah: [1],
    namaWali: "Rahmat Hidayat",
    kontakWali: "081234567807"
  },
  {
    id: "s-8",
    nis: "202608",
    nama: "Ibrahim Khalilullah",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 15,
    totalHalaman: 8.5,
    rincianHalaman: "8 Hlm 10 Brs",
    peringkat: 8,
    juzMutqin: [30, 29],
    juzZiyadah: [28],
    namaWali: "H. Kholil",
    kontakWali: "081234567808"
  },
  {
    id: "s-9",
    nis: "202609",
    nama: "Usamah Rabbani",
    halaqahId: "h-wahyudin",
    kelas: "X Tahfidz 1",
    targetJuz: 10,
    totalHalaman: 7.8,
    rincianHalaman: "7 Hlm 14 Brs",
    peringkat: 9,
    juzMutqin: [30],
    juzZiyadah: [29],
    namaWali: "Umar Hamzah",
    kontakWali: "081234567809"
  },
  {
    id: "s-10",
    nis: "202610",
    nama: "Thariq Ziyad",
    halaqahId: "h-wahyudin",
    kelas: "X A",
    targetJuz: 10,
    totalHalaman: 7.2,
    rincianHalaman: "7 Hlm 4 Brs",
    peringkat: 10,
    juzMutqin: [30],
    juzZiyadah: [1],
    namaWali: "dr. Faisal",
    kontakWali: "081234567810"
  },
  // Santri X B (Halaqah Redi - Akhwat)
  {
    id: "s-xb-1",
    nis: "202621",
    nama: "Adila Syakira",
    halaqahId: "h-redi",
    kelas: "X B",
    targetJuz: 20,
    totalHalaman: 11.5,
    rincianHalaman: "11 Hlm 10 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28],
    juzZiyadah: [27, 1],
    namaWali: "Sulaiman",
    kontakWali: "081234567821"
  },
  {
    id: "s-xb-2",
    nis: "202622",
    nama: "Ancika Yona Shalihah",
    halaqahId: "h-redi",
    kelas: "X B",
    targetJuz: 15,
    totalHalaman: 10.8,
    rincianHalaman: "10 Hlm 13 Brs",
    peringkat: 2,
    juzMutqin: [30, 29],
    juzZiyadah: [28, 1],
    namaWali: "Yona Sasmita",
    kontakWali: "08531122334"
  },
  {
    id: "s-xb-3",
    nis: "202623",
    nama: "Asiyah Maryam",
    halaqahId: "h-redi",
    kelas: "X B",
    targetJuz: 15,
    totalHalaman: 9.4,
    rincianHalaman: "9 Hlm 8 Brs",
    peringkat: 3,
    juzMutqin: [30, 29],
    juzZiyadah: [1],
    namaWali: "Zulkarnain",
    kontakWali: "08226677889"
  },
  {
    id: "s-xb-4",
    nis: "202624",
    nama: "Asyipa Desma Wasita",
    halaqahId: "h-redi",
    kelas: "X B",
    targetJuz: 10,
    totalHalaman: 8.1,
    rincianHalaman: "8 Hlm 2 Brs",
    peringkat: 4,
    juzMutqin: [30],
    juzZiyadah: [29, 1],
    namaWali: "Desmawan",
    kontakWali: "08124455667"
  },
  // Santri XI A (Halaqah Hendriyansa - Ikhwan)
  {
    id: "s-xia-1",
    nis: "202531",
    nama: "Aljha Afriandi",
    halaqahId: "h-hendri",
    kelas: "XI A",
    targetJuz: 25,
    totalHalaman: 16.2,
    rincianHalaman: "16 Hlm 4 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28, 27, 26, 1, 2, 3, 4],
    juzZiyadah: [5, 6],
    namaWali: "Sulaiman",
    kontakWali: "08139012891"
  },
  {
    id: "s-xia-2",
    nis: "202532",
    nama: "Muhammad Hafidz Ilmi",
    halaqahId: "h-hendri",
    kelas: "XI A",
    targetJuz: 20,
    totalHalaman: 14.9,
    rincianHalaman: "14 Hlm 18 Brs",
    peringkat: 2,
    juzMutqin: [30, 29, 28, 1, 2, 3],
    juzZiyadah: [4, 5],
    namaWali: "H. Ilmi Saputra",
    kontakWali: "081234567832"
  },
  // Santri XI B (Halaqah Hamzah - Akhwat)
  {
    id: "s-xib-1",
    nis: "202541",
    nama: "AISYAH",
    halaqahId: "h-hamzah",
    kelas: "XI B",
    targetJuz: 20,
    totalHalaman: 13.5,
    rincianHalaman: "13 Hlm 10 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28, 27, 1],
    juzZiyadah: [2, 3],
    namaWali: "Witarso",
    kontakWali: "08527812901"
  },
  {
    id: "s-xib-2",
    nis: "202542",
    nama: "ALIYAH HUSNUL. ML",
    halaqahId: "h-hamzah",
    kelas: "XI B",
    targetJuz: 15,
    totalHalaman: 12.3,
    rincianHalaman: "12 Hlm 6 Brs",
    peringkat: 2,
    juzMutqin: [30, 29, 28, 1],
    juzZiyadah: [2],
    namaWali: "Mustaqim",
    kontakWali: "08218901234"
  },
  {
    id: "s-xib-3",
    nis: "202543",
    nama: "AMALIA KHOIRUNISA",
    halaqahId: "h-hamzah",
    kelas: "XI B",
    targetJuz: 15,
    totalHalaman: 11.7,
    rincianHalaman: "11 Hlm 14 Brs",
    peringkat: 3,
    juzMutqin: [30, 29, 1],
    juzZiyadah: [2],
    namaWali: "TOTOK HARIYONO",
    kontakWali: "08129988112"
  },
  // Santri XII A (Halaqah Agus - Ikhwan)
  {
    id: "s-xiia-1",
    nis: "202451",
    nama: "AHMAD DINEJAD",
    halaqahId: "h-agus",
    kelas: "XII A",
    targetJuz: 30,
    totalHalaman: 20.5,
    rincianHalaman: "20 Hlm 10 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28, 27, 26, 25, 1, 2, 3, 4, 5],
    juzZiyadah: [6, 7],
    namaWali: "HAULAF",
    kontakWali: "08127891234"
  },
  {
    id: "s-xiia-2",
    nis: "202452",
    nama: "M. NAFIDZ",
    halaqahId: "h-agus",
    kelas: "XII A",
    targetJuz: 30,
    totalHalaman: 19.8,
    rincianHalaman: "19 Hlm 16 Brs",
    peringkat: 2,
    juzMutqin: [30, 29, 28, 27, 26, 1, 2, 3, 4],
    juzZiyadah: [5, 6],
    namaWali: "Nafidz Senior",
    kontakWali: "081234567852"
  },
  // Santri XII B (Halaqah Fitria - Akhwat)
  {
    id: "s-xiib-1",
    nis: "202461",
    nama: "AINI JELINA",
    halaqahId: "h-fitria",
    kelas: "XII B",
    targetJuz: 30,
    totalHalaman: 21.3,
    rincianHalaman: "21 Hlm 6 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28, 27, 26, 25, 1, 2, 3, 4, 5, 6],
    juzZiyadah: [7],
    namaWali: "JHON EFENDI",
    kontakWali: "08136789123"
  },
  {
    id: "s-xiib-2",
    nis: "202462",
    nama: "MARYAM MUTHI'AH.B",
    halaqahId: "h-fitria",
    kelas: "XII B",
    targetJuz: 30,
    totalHalaman: 20.1,
    rincianHalaman: "20 Hlm 2 Brs",
    peringkat: 2,
    juzMutqin: [30, 29, 28, 27, 26, 1, 2, 3, 4, 5],
    juzZiyadah: [6],
    namaWali: "Bachtiar",
    kontakWali: "0819042945"
  },
  // Data Santri Cabang SMP IT Ihya As-Sunnah
  {
    id: "s-smp-1",
    nis: "202681",
    nama: "Fatih Rizqullah (SMP)",
    halaqahId: "h-smp-1",
    cabangId: "cabang-smp",
    kelas: "VII SMP IT",
    targetJuz: 10,
    totalHalaman: 8.5,
    rincianHalaman: "8 Hlm 5 Brs",
    peringkat: 1,
    juzMutqin: [30],
    juzZiyadah: [29],
    namaWali: "H. Abdullah",
    kontakWali: "08128899001"
  },
  {
    id: "s-smp-2",
    nis: "202682",
    nama: "Ziyad Al-Farisi (SMP)",
    halaqahId: "h-smp-1",
    cabangId: "cabang-smp",
    kelas: "VIII SMP IT",
    targetJuz: 15,
    totalHalaman: 10.2,
    rincianHalaman: "10 Hlm 2 Brs",
    peringkat: 2,
    juzMutqin: [30, 29],
    juzZiyadah: [1],
    namaWali: "Drs. Syarif",
    kontakWali: "08128899002"
  },
  // Data Santri Cabang Pondok Pesantren PPIAS
  {
    id: "s-ponpes-1",
    nis: "202691",
    nama: "Salman Al-Farisi (Ponpes)",
    halaqahId: "h-ponpes-1",
    cabangId: "cabang-ponpes",
    kelas: "I'dad Lughowi",
    targetJuz: 30,
    totalHalaman: 22.0,
    rincianHalaman: "22 Hlm 0 Brs",
    peringkat: 1,
    juzMutqin: [30, 29, 28, 27, 26, 1, 2, 3],
    juzZiyadah: [4],
    namaWali: "Ustadz Mahmud",
    kontakWali: "08123344556"
  }
];

// Data Sesi Halaqah Hari Ini (Sesuai Screenshot)
export const SESI_HALAQAH = [
  {
    id: "sesi-subuh",
    nama: "Ba'da Subuh",
    status: "TEPAT WAKTU",
    badgeType: "success", // Tepat Waktu
    jamScan: "05:21:00",
    keterangan: "Scan: 05:21:00"
  },
  {
    id: "sesi-maghrib",
    nama: "Ba'da Maghrib",
    status: "LIBUR",
    badgeType: "libur", // Libur
    jamScan: "18:45 - 19:20",
    keterangan: "18:45 - 19:20"
  }
];

// Riwayat Setoran & Presensi (seed tanggal berjalan & historis)
const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];
const fourDaysAgo = new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0];
const fiveDaysAgo = new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0];

const INITIAL_SETORAN = [
  {
    id: "set-azmi-1",
    santriId: "s-azmi",
    cabangId: "cabang-pusat",
    tanggal: "2026-09-04",
    hari: "JUMAT",
    tanggalFormat: "JUMAT, 04-09-2026",
    jenis: "SABAQ",
    surahId: 2,
    surahName: "Al-Baqarah",
    arabicSurah: "البقرة",
    ayatAwal: 114,
    ayatAkhir: 114,
    juz: 1,
    halaman: 18,
    posisiMushaf: "Hlm 18 • Baris 4–7",
    barisBadge: "4 Baris",
    nilai: "Jayyid",
    predikat: "JAYYID",
    skor: 75,
    statusLanjut: "LANJUT",
    salahHafalan: 0,
    salahTajwid: 0,
    musyrif: "Wahyudin Hafiz"
  },
  {
    id: "set-azmi-2",
    santriId: "s-azmi",
    cabangId: "cabang-pusat",
    tanggal: "2026-09-03",
    hari: "KAMIS",
    tanggalFormat: "KAMIS, 03-09-2026",
    jenis: "SABAQ",
    surahId: 2,
    surahName: "Al-Baqarah",
    arabicSurah: "البقرة",
    ayatAwal: 113,
    ayatAkhir: 113,
    juz: 1,
    halaman: 18,
    posisiMushaf: "Hlm 18 • Baris 1–4",
    barisBadge: "4 Baris",
    nilai: "Jayyid",
    predikat: "JAYYID",
    skor: 75,
    statusLanjut: "LANJUT",
    salahHafalan: 0,
    salahTajwid: 0,
    musyrif: "Wahyudin Hafiz"
  },
  {
    id: "set-azmi-3",
    santriId: "s-azmi",
    cabangId: "cabang-pusat",
    tanggal: "2026-09-02",
    hari: "RABU",
    tanggalFormat: "RABU, 02-09-2026",
    jenis: "SABAQ",
    surahId: 2,
    surahName: "Al-Baqarah",
    arabicSurah: "البقرة",
    ayatAwal: 106,
    ayatAkhir: 112,
    juz: 1,
    halaman: 17,
    posisiMushaf: "Hlm 17 • Baris 1–15",
    barisBadge: "1 Halaman",
    nilai: "Jayyid",
    predikat: "JAYYID",
    skor: 75,
    statusLanjut: "LANJUT",
    salahHafalan: 0,
    salahTajwid: 0,
    musyrif: "Wahyudin Hafiz"
  },
  {
    id: "set-1",
    santriId: "s-akbar",
    tanggal: today,
    jenis: "Ziyadah",
    surahId: 2,
    surahName: "Al-Baqarah",
    ayatAwal: 1,
    ayatAkhir: 25,
    halaman: 4,
    juz: 1,
    nilai: "Mumtaz",
    skor: 96,
    catatanTajwid: "Tartil sangat bagus, kelancaran mutqin.",
    statusLanjut: "Lanjut Ayat Baru",
    musyrif: "Wahyudin Hafiz"
  },
  {
    id: "set-2",
    santriId: "s-attalah",
    tanggal: today,
    jenis: "Muroja'ah",
    surahId: 78,
    surahName: "An-Naba'",
    ayatAwal: 1,
    ayatAkhir: 40,
    halaman: 2,
    juz: 30,
    nilai: "Mumtaz",
    skor: 94,
    catatanTajwid: "Ghunnah dan mad tepat waktu.",
    statusLanjut: "Lanjut Ayat Baru",
    musyrif: "Wahyudin Hafiz"
  },
  {
    id: "set-3",
    santriId: "s-futra",
    tanggal: today,
    jenis: "Ziyadah",
    surahId: 3,
    surahName: "Ali 'Imran",
    ayatAwal: 1,
    ayatAkhir: 20,
    halaman: 3,
    juz: 3,
    nilai: "Jayyid Jiddan",
    skor: 88,
    catatanTajwid: "Perhatikan makhraj 'ain.",
    statusLanjut: "Lanjut Ayat Baru",
    musyrif: "Wahyudin Hafiz"
  },
  {
    id: "set-4",
    santriId: "s-akbar",
    tanggal: yesterday,
    jenis: "Tasmi'",
    surahId: 1,
    surahName: "Juz 30 Sekali Duduk",
    ayatAwal: 1,
    ayatAkhir: 564,
    halaman: 23,
    juz: 30,
    nilai: "Mumtaz",
    skor: 98,
    catatanTajwid: "Tasmi' 1 Juz lancar sekali, mutqin.",
    statusLanjut: "Lanjut Juz Baru",
    musyrif: "Wahyudin Hafiz"
  },
  {
    id: "set-5",
    santriId: "s-attalah",
    tanggal: yesterday,
    jenis: "Ziyadah",
    surahId: 2,
    surahName: "Al-Baqarah",
    ayatAwal: 142,
    ayatAkhir: 153,
    halaman: 2,
    juz: 2,
    nilai: "Jayyid Jiddan",
    skor: 87,
    catatanTajwid: "Kelancaran terjaga.",
    statusLanjut: "Lanjut Ayat Baru",
    musyrif: "Wahyudin Hafiz"
  }
];

// Permohonan Izin Santri
const INITIAL_IZIN = [
  {
    id: "iz-1",
    santriId: "s-futra",
    pemohon: "Ir. Futra Pratama (Wali)",
    jenisIzin: "Sakit",
    tanggalMulai: today,
    tanggalSelesai: today,
    keterangan: "Demam dan flu, sedang istirahat di rumah.",
    status: "Disetujui",
    catatanUstadz: "Syafahullah, semoga lekas sembuh ananda.",
    dibuatPada: today + " 06:15"
  },
  {
    id: "iz-2",
    santriId: "s-5",
    pemohon: "Farid Abdullah (Wali)",
    jenisIzin: "Keperluan Keluarga",
    tanggalMulai: today,
    tanggalSelesai: today,
    keterangan: "Ada acara keluarga mendesak.",
    status: "Menunggu",
    catatanUstadz: "",
    dibuatPada: today + " 07:30"
  }
];

const INITIAL_ABSENSI = [
  {
    tanggal: today,
    halaqahId: "h-wahyudin",
    sesiId: "subuh",
    sesi: "Ba'da Subuh",
    records: {
      "s-azmi": { status: "H", jamScan: "05:15:10", catatan: "Tepat Waktu" },
      "s-akbar": { status: "H", jamScan: "05:18:22", catatan: "Tepat Waktu" },
      "s-attalah": { status: "H", jamScan: "05:21:00", catatan: "Tepat Waktu" },
      "s-futra": { status: "S", jamScan: "-", catatan: "Izin Sakit" },
      "s-4": { status: "H", jamScan: "05:24:10", catatan: "Tepat Waktu" },
      "s-5": { status: "I", jamScan: "-", catatan: "Izin Keluarga" },
      "s-6": { status: "H", jamScan: "05:20:15", catatan: "Tepat Waktu" },
      "s-7": { status: "H", jamScan: "05:26:00", catatan: "Hadir" },
      "s-8": { status: "H", jamScan: "05:21:45", catatan: "Tepat Waktu" },
      "s-9": { status: "H", jamScan: "05:22:30", catatan: "Tepat Waktu" },
      "s-10": { status: "H", jamScan: "05:25:12", catatan: "Hadir" }
    }
  },
  {
    tanggal: yesterday,
    halaqahId: "h-wahyudin",
    sesiId: "subuh",
    sesi: "Ba'da Subuh",
    records: {
      "s-azmi": { status: "H", jamScan: "05:12:00", catatan: "Tepat Waktu" },
      "s-akbar": { status: "H", jamScan: "05:16:30", catatan: "Tepat Waktu" },
      "s-attalah": { status: "H", jamScan: "05:19:10", catatan: "Tepat Waktu" },
      "s-futra": { status: "H", jamScan: "05:20:00", catatan: "Tepat Waktu" },
      "s-4": { status: "H", jamScan: "05:22:45", catatan: "Tepat Waktu" },
      "s-5": { status: "I", jamScan: "-", catatan: "Izin Pulang" },
      "s-6": { status: "H", jamScan: "05:21:10", catatan: "Tepat Waktu" },
      "s-7": { status: "H", jamScan: "05:25:00", catatan: "Hadir" },
      "s-8": { status: "H", jamScan: "05:22:15", catatan: "Tepat Waktu" },
      "s-9": { status: "H", jamScan: "05:23:00", catatan: "Tepat Waktu" },
      "s-10": { status: "H", jamScan: "05:24:20", catatan: "Hadir" }
    }
  },
  {
    tanggal: yesterday,
    halaqahId: "h-wahyudin",
    sesiId: "pagi",
    sesi: "Pagi / Dhuha",
    records: {
      "s-azmi": { status: "H", jamScan: "08:35:10", catatan: "Tepat Waktu" },
      "s-akbar": { status: "H", jamScan: "08:37:20", catatan: "Tepat Waktu" },
      "s-attalah": { status: "H", jamScan: "08:40:00", catatan: "Tepat Waktu" },
      "s-futra": { status: "H", jamScan: "08:36:00", catatan: "Tepat Waktu" },
      "s-4": { status: "H", jamScan: "08:42:00", catatan: "Tepat Waktu" },
      "s-5": { status: "I", jamScan: "-", catatan: "Izin Pulang" },
      "s-6": { status: "H", jamScan: "08:38:15", catatan: "Tepat Waktu" },
      "s-7": { status: "A", jamScan: "-", catatan: "Terlambat >30m" },
      "s-8": { status: "H", jamScan: "08:41:00", catatan: "Tepat Waktu" },
      "s-9": { status: "H", jamScan: "08:39:20", catatan: "Tepat Waktu" },
      "s-10": { status: "H", jamScan: "08:44:00", catatan: "Hadir" }
    }
  },
  {
    tanggal: yesterday,
    halaqahId: "h-wahyudin",
    sesiId: "malam",
    sesi: "Ba'da Maghrib",
    records: {
      "s-azmi": { status: "H", jamScan: "18:50:00", catatan: "Tepat Waktu" },
      "s-akbar": { status: "H", jamScan: "18:52:10", catatan: "Tepat Waktu" },
      "s-attalah": { status: "H", jamScan: "18:55:00", catatan: "Tepat Waktu" },
      "s-futra": { status: "H", jamScan: "18:51:30", catatan: "Tepat Waktu" },
      "s-4": { status: "H", jamScan: "18:54:00", catatan: "Tepat Waktu" },
      "s-5": { status: "H", jamScan: "18:56:00", catatan: "Tepat Waktu" },
      "s-6": { status: "H", jamScan: "18:53:20", catatan: "Tepat Waktu" },
      "s-7": { status: "H", jamScan: "18:58:00", catatan: "Hadir" },
      "s-8": { status: "H", jamScan: "18:55:10", catatan: "Tepat Waktu" },
      "s-9": { status: "H", jamScan: "18:52:45", catatan: "Tepat Waktu" },
      "s-10": { status: "H", jamScan: "18:57:30", catatan: "Hadir" }
    }
  },
  {
    tanggal: twoDaysAgo,
    halaqahId: "h-wahyudin",
    sesiId: "subuh",
    sesi: "Ba'da Subuh",
    records: {
      "s-azmi": { status: "H", jamScan: "05:14:00", catatan: "Tepat Waktu" },
      "s-akbar": { status: "H", jamScan: "05:17:00", catatan: "Tepat Waktu" },
      "s-attalah": { status: "H", jamScan: "05:19:00", catatan: "Tepat Waktu" },
      "s-futra": { status: "H", jamScan: "05:21:00", catatan: "Tepat Waktu" },
      "s-4": { status: "H", jamScan: "05:23:00", catatan: "Tepat Waktu" },
      "s-5": { status: "H", jamScan: "05:22:00", catatan: "Tepat Waktu" },
      "s-6": { status: "H", jamScan: "05:18:00", catatan: "Tepat Waktu" },
      "s-7": { status: "H", jamScan: "05:24:00", catatan: "Hadir" },
      "s-8": { status: "S", jamScan: "-", catatan: "Flu di Asrama" },
      "s-9": { status: "H", jamScan: "05:20:00", catatan: "Tepat Waktu" },
      "s-10": { status: "H", jamScan: "05:25:00", catatan: "Hadir" }
    }
  },
  {
    tanggal: threeDaysAgo,
    halaqahId: "h-wahyudin",
    sesiId: "subuh",
    sesi: "Ba'da Subuh",
    records: {
      "s-azmi": { status: "H", jamScan: "05:11:00", catatan: "Tepat Waktu" },
      "s-akbar": { status: "H", jamScan: "05:16:00", catatan: "Tepat Waktu" },
      "s-attalah": { status: "H", jamScan: "05:20:00", catatan: "Tepat Waktu" },
      "s-futra": { status: "H", jamScan: "05:21:30", catatan: "Tepat Waktu" },
      "s-4": { status: "H", jamScan: "05:22:00", catatan: "Tepat Waktu" },
      "s-5": { status: "H", jamScan: "05:24:00", catatan: "Tepat Waktu" },
      "s-6": { status: "H", jamScan: "05:19:00", catatan: "Tepat Waktu" },
      "s-7": { status: "H", jamScan: "05:25:00", catatan: "Hadir" },
      "s-8": { status: "H", jamScan: "05:23:00", catatan: "Tepat Waktu" },
      "s-9": { status: "H", jamScan: "05:21:00", catatan: "Tepat Waktu" },
      "s-10": { status: "H", jamScan: "05:24:00", catatan: "Hadir" }
    }
  },
  {
    tanggal: fourDaysAgo,
    halaqahId: "h-wahyudin",
    sesiId: "subuh",
    sesi: "Ba'da Subuh",
    records: {
      "s-azmi": { status: "H", jamScan: "05:12:00", catatan: "Tepat Waktu" },
      "s-akbar": { status: "H", jamScan: "05:15:00", catatan: "Tepat Waktu" },
      "s-attalah": { status: "H", jamScan: "05:18:00", catatan: "Tepat Waktu" },
      "s-futra": { status: "H", jamScan: "05:22:00", catatan: "Tepat Waktu" },
      "s-4": { status: "H", jamScan: "05:23:00", catatan: "Tepat Waktu" },
      "s-5": { status: "H", jamScan: "05:21:00", catatan: "Tepat Waktu" },
      "s-6": { status: "H", jamScan: "05:19:00", catatan: "Tepat Waktu" },
      "s-7": { status: "H", jamScan: "05:26:00", catatan: "Hadir" },
      "s-8": { status: "H", jamScan: "05:20:00", catatan: "Tepat Waktu" },
      "s-9": { status: "H", jamScan: "05:22:00", catatan: "Tepat Waktu" },
      "s-10": { status: "H", jamScan: "05:25:00", catatan: "Hadir" }
    }
  }
];

const INITIAL_SETTINGS = {
  namaMadrasah: "Pesantren Persatuan Islam As-Sunnah (PPIAS)",
  subJudulLembaga: "Madrasah Aliyah Tahfidzul Qur'an Ihya As Sunnah",
  alamatMadrasah: "Kompleks Islamic Center PPIAS, Jl. Paseh No. 12, Tasikmalaya, Jawa Barat",
  teleponMadrasah: "(0265) 334455 / 0812-3456-7890",
  emailMadrasah: "tahfidz@ppias.sch.id",
  websiteMadrasah: "www.ppias.sch.id",
  halaqahAktif: "Halaqah Ustadz Wahyudin (X A - Ikhwan)",
  lokasiAktif: "Lokal Ikhwan Lantai 2 (X A)",
  kepalaMadrasah: "K.H. Muhammad Ridwan, Lc., M.Pd.I",
  koordinatorTahfidz: "Wahyudin Hafiz, S.Q., Al-Hafizh",
  semester: "Ganjil 2026/2027",
  tahunAjaran: "2026/2027",
  toleransiKeterlambatan: 15, // menit
  targetJuzDefault: 10,
  kkmNilai: 75,
  sesiHalaqah: [
    { id: "subuh", nama: "Ba'da Subuh",     mulai: "05:00", selesai: "06:30", status: "Aktif", statusDisplay: "TEPAT WAKTU" },
    { id: "pagi",  nama: "Pagi / Dhuha",    mulai: "08:30", selesai: "10:00", status: "Aktif", statusDisplay: "TEPAT WAKTU" },
    { id: "ashar", nama: "Ba'da Ashar",      mulai: "16:00", selesai: "17:30", status: "Aktif", statusDisplay: "TEPAT WAKTU" },
    { id: "malam", nama: "Ba'da Maghrib",    mulai: "18:45", selesai: "20:30", status: "Aktif", statusDisplay: "TEPAT WAKTU" }
  ]
};

// =========================================================
// DATASET AWAL SIGAP DARI SCREENSHOT PENGGUNA
// =========================================================

// GAMBAR 2: DATA SISWA
const INITIAL_SIGAP_SISWA = [
  { id: 'ss-1', nama: 'Adila Syakira', nik: '1605035201090002', lp: 'P', nisn: '131215030022260008', kelas: 'X B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Febrianti Dewi, S.Pd', tglLahir: '12 Januari 2010', wali: 'Syakir Hamidi', kontakWali: '081234567801' },
  { id: 'ss-2', nama: 'AHMAD DINEJAD', nik: '1605071707090001', lp: 'L', nisn: '0097997681', kelas: 'XII A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Feri Hermawan, S.Pd', tglLahir: '17 Juli 2009', wali: 'HAULAF', kontakWali: '08127891234' },
  { id: 'ss-3', nama: 'AINI JELINA', nik: '1602096211080001', lp: 'P', nisn: '0081690952', kelas: 'XII B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Defit Purwaningsih, S.Pd', tglLahir: '12 November 2008', wali: 'JHON EFENDI', kontakWali: '08136789123' },
  { id: 'ss-4', nama: 'AISYAH', nik: '1671036806100021', lp: 'P', nisn: '0109325350', kelas: 'XI B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Ainun Hamidah, S.Pd', tglLahir: '29 Juni 2010', wali: 'Witarso', kontakWali: '08527812901' },
  { id: 'ss-5', nama: 'ALIYAH HUSNUL. ML', nik: '1608046311090003', lp: 'P', nisn: '0095898699', kelas: 'XI B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Ainun Hamidah, S.Pd', tglLahir: '23 November 2009', wali: 'Mustaqim', kontakWali: '08218901234' },
  { id: 'ss-6', nama: 'Aljha Afriandi', nik: '1613062807110001', lp: 'L', nisn: '131215030022260001', kelas: 'X A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Wahyudin Hafiz, S.Pd', tglLahir: '14 Agustus 2010', wali: 'Sulaiman', kontakWali: '08139012891' },
  { id: 'ss-7', nama: 'AMALIA KHOIRUNISA', nik: '1605167006100001', lp: 'P', nisn: '0103835331', kelas: 'XI B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Ainun Hamidah, S.Pd', tglLahir: '30 Juni 2010', wali: 'TOTOK HARIYONO', kontakWali: '08129988112' },
  { id: 'ss-8', nama: 'Ancika Yona Shalihah', nik: '1605035201090020', lp: 'P', nisn: '131215030022260020', kelas: 'X B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Febrianti Dewi, S.Pd', tglLahir: '10 Mei 2010', wali: 'Yona Sasmita', kontakWali: '08531122334' },
  { id: 'ss-9', nama: 'Asiyah Maryam', nik: '1605035201090009', lp: 'P', nisn: '131215030022260009', kelas: 'X B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Febrianti Dewi, S.Pd', tglLahir: '05 Januari 2010', wali: 'Zulkarnain', kontakWali: '08226677889' },
  { id: 'ss-10', nama: 'Asyipa Desma Wasita', nik: '1605035201090021', lp: 'P', nisn: '131215030022260021', kelas: 'X B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Febrianti Dewi, S.Pd', tglLahir: '18 Februari 2010', wali: 'Desmawan', kontakWali: '08124455667' },
  { id: 'ss-11', nama: 'Jamiatul Akbar', nik: '1605011202100001', lp: 'L', nisn: '0102345678', kelas: 'X A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Wahyudin Hafiz, S.Pd', tglLahir: '12 Februari 2010', wali: 'H. Akbar Sasmita', kontakWali: '081234567801' },
  { id: 'ss-12', nama: 'Attalah Saum Alvano', nik: '1605011508090002', lp: 'L', nisn: '0098765432', kelas: 'X A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Wahyudin Hafiz, S.Pd', tglLahir: '15 Agustus 2009', wali: 'Drs. Bambang Alvano', kontakWali: '081234567802' },
  { id: 'ss-13', nama: 'M. Al Futra', nik: '1605012204100003', lp: 'L', nisn: '0105678901', kelas: 'X A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Wahyudin Hafiz, S.Pd', tglLahir: '22 April 2010', wali: 'Ir. Futra Pratama', kontakWali: '081234567803' },
  { id: 'ss-14', nama: 'Muhammad Ziyad', nik: '1605021806090004', lp: 'L', nisn: '0093456789', kelas: 'XI A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Agus Rinaldi', tglLahir: '18 Juni 2009', wali: 'Ust. Ziyad Abdullah', kontakWali: '081234567804' },
  { id: 'ss-15', nama: 'Raihan Al-Ghifari', nik: '1605022009090005', lp: 'L', nisn: '0094567890', kelas: 'XI A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Agus Rinaldi', tglLahir: '20 September 2009', wali: 'Ghifari Pratama', kontakWali: '081234567805' },
  { id: 'ss-16', nama: 'Syakir Daulay', nik: '1605030501080006', lp: 'L', nisn: '0085678901', kelas: 'XII A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Feri Hermawan, S.Pd', tglLahir: '05 Januari 2008', wali: 'H. Daulay', kontakWali: '081234567806' },
  { id: 'ss-17', nama: 'Nabil Makarim', nik: '1605031103080007', lp: 'L', nisn: '0086789012', kelas: 'XII A', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Feri Hermawan, S.Pd', tglLahir: '11 Maret 2008', wali: 'Makarim Hasan', kontakWali: '081234567807' },
  { id: 'ss-18', nama: 'Fatimah Az-Zahra', nik: '1605041407100008', lp: 'P', nisn: '0107890123', kelas: 'X B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Febrianti Dewi, S.Pd', tglLahir: '14 Juli 2010', wali: 'Drs. Ali Fauzi', kontakWali: '081234567808' },
  { id: 'ss-19', nama: 'Zahra Nur Aini', nik: '1605051910090009', lp: 'P', nisn: '0098901234', kelas: 'XI B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Ainun Hamidah, S.Pd', tglLahir: '19 Oktober 2009', wali: 'Aini Sasmita', kontakWali: '081234567809' },
  { id: 'ss-20', nama: 'Maryam Khairunnisa', nik: '1605062512080010', lp: 'P', nisn: '0089012345', kelas: 'XII B', unitSekolah: "MA IHYA' AS-SUNNAH", pengampu: 'Defit Purwaningsih, S.Pd', tglLahir: '25 Desember 2008', wali: 'Khairul Anwar', kontakWali: '081234567810' },
  { id: 'ss-smp-1', nama: 'Fatih Rizqullah (SMP)', nik: '1605062512080081', lp: 'L', nisn: '0089012381', kelas: 'VII SMP IT', unitSekolah: "SMP IT IHYA' AS-SUNNAH", cabangId: 'cabang-smp', pengampu: 'Aminudin, A.Md', tglLahir: '10 Januari 2011', wali: 'H. Abdullah', kontakWali: '08128899001' },
  { id: 'ss-smp-2', nama: 'Ziyad Al-Farisi (SMP)', nik: '1605062512080082', lp: 'L', nisn: '0089012382', kelas: 'VIII SMP IT', unitSekolah: "SMP IT IHYA' AS-SUNNAH", cabangId: 'cabang-smp', pengampu: 'Aminudin, A.Md', tglLahir: '12 Maret 2010', wali: 'Drs. Syarif', kontakWali: '08128899002' },
  { id: 'ss-ponpes-1', nama: 'Salman Al-Farisi (Ponpes)', nik: '1605062512080091', lp: 'L', nisn: '0089012391', kelas: "I'dad Lughowi", unitSekolah: "Pondok Pesantren PPIAS", cabangId: 'cabang-ponpes', pengampu: 'Wahyudin Hafiz, S.Pd', tglLahir: '05 Mei 2009', wali: 'Ustadz Mahmud', kontakWali: '08123344556' }
];

// GAMBAR 3: DATA GURU & PEGAWAI (PENGAMPU)
const INITIAL_SIGAP_GURU = [
  { id: 'sg-1', nama: 'AAZ', nip: 'NON-NIP', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'agus.rinaldi23@sttmadani.ac.id', password: 'bismillah123', noHp: '0812-7890-1122', avatarBg: '#dcfce7', initial: 'A' },
  { id: 'sg-2', nama: 'aazeed', nip: 'NON-NIP', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'agus98rinaldi@gmail.com', password: 'bismillah123', noHp: '0812-7890-1133', avatarBg: '#ccfbf1', initial: 'a' },
  { id: 'sg-3', nama: 'Agus Rinaldi', nip: '19982025007011180', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Staff TU Pondok & Wali Kelas XI A', email: 'hastagcoretansantri@gmail.com', password: 'bismillah123', noHp: '6282279990521', avatarBg: '#fee2e2', initial: 'A' },
  { id: 'sg-4', nama: 'Ainun Hamidah, S.Pd', nip: '200020182091', lp: 'P', status: 'GTY', unit: '2 Unit', unitTag: "SMP IT IHYA' AS-SUNNAH", jabatan: 'Wali Kelas XI B & Pengampu Tahfidz', email: 'kholid.arfandani@gmail.com', password: 'bismillah123', noHp: '6285764038355', avatarBg: '#dcfce7', initial: 'A' },
  { id: 'sg-5', nama: "Ajizah Ikhda Sulmi, S.Pd", nip: '199820222132', lp: 'P', status: 'GTY', unit: '2 Unit', unitTag: "SMP IT IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'ajizshikhda0389@gmail.com', password: 'bismillah123', noHp: '6285181428518', avatarBg: '#ccfbf1', initial: 'A' },
  { id: 'sg-6', nama: 'Aminudin, A.Md', nip: '199520231138', lp: 'L', status: 'GTY', unit: '2 Unit', unitTag: "SMP IT IHYA' AS-SUNNAH", jabatan: 'Staff KBM', email: 'aminudin13@gmail.com', password: 'bismillah123', noHp: '62895355691010', avatarBg: '#ccfbf1', initial: 'A' },
  { id: 'sg-7', nama: 'Ananda Novita, S.Pd', nip: '200020222127', lp: 'P', status: 'GTY', unit: '2 Unit', unitTag: "SMP IT IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'ndvita511@gmail.com', password: 'bismillah123', noHp: '6282282582331', avatarBg: '#dcfce7', initial: 'A' },
  { id: 'sg-8', nama: 'Defit Purwaningsih, S.Pd', nip: '199620032140', lp: 'P', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Waka Kurikulum & Wali Kelas XII B', email: 'defitpurwaningsih22@gmail.com', password: 'bismillah123', noHp: '6282258613578', avatarBg: '#e0f2fe', initial: 'D' },
  { id: 'sg-9', nama: 'Febrianti Dewi, S.Pd', nip: '200120232152', lp: 'P', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Wali Kelas X B', email: 'febriantidewi043@gmail.com', password: 'bismillah123', noHp: '6282279304564', avatarBg: '#f0fdf4', initial: 'F' },
  { id: 'sg-10', nama: 'Wahyudin Hafiz, S.Pd', nip: '19880101201501', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Koordinator Tahfidz & Wali Kelas X A', email: 'wahyudin@ppias.sch.id', password: 'bismillah123', noHp: '0812-3456-7811', avatarBg: '#dcfce7', initial: 'W' },
  { id: 'sg-11', nama: 'Feri Hermawan, S.Pd', nip: '19900214201801', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Wali Kelas XII A', email: 'feri.hermawan@ppias.sch.id', password: 'bismillah123', noHp: '0812-7891-2345', avatarBg: '#e0f2fe', initial: 'F' },
  { id: 'sg-12', nama: 'Redi Iskandar, S.Pd., B.A.', nip: '19910515201901', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'redi.iskandar@ppias.sch.id', password: 'bismillah123', noHp: '0812-3456-7814', avatarBg: '#ccfbf1', initial: 'R' },
  { id: 'sg-13', nama: 'Hendriyansa Putra', nip: '19930415201902', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'hendriyansa@ppias.sch.id', password: 'bismillah123', noHp: '0812-3456-7815', avatarBg: '#dcfce7', initial: 'H' },
  { id: 'sg-14', nama: 'Ustadz Hamzah Fauzi, Lc.', nip: '19910408201704', lp: 'L', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'hamzah.fauzi@ppias.sch.id', password: 'bismillah123', noHp: '0812-3456-7816', avatarBg: '#fee2e2', initial: 'H' },
  { id: 'sg-15', nama: 'Fitria Cahya Kamila, S.Pd', nip: '19950912202102', lp: 'P', status: 'GTY', unit: "MA IHYA' AS-SUNNAH", jabatan: 'Pengampu Tahfidz', email: 'fitria.kamila@ppias.sch.id', password: 'bismillah123', noHp: '0812-3456-7817', avatarBg: '#fce7f3', initial: 'F' }
];

// GAMBAR 4: DATA ALUMNI
const INITIAL_SIGAP_ALUMNI = [
  { id: 'sa-1', nama: 'AFIFAH TURROSYIDAH', nik: '1605075203080002', nisn: '0083805811', nism: '-', lp: 'P', tahunLulus: '2026' },
  { id: 'sa-2', nama: 'AZZURA AZ ZAHRA', nik: '1673035201090001', nisn: '0085261478', nism: '-', lp: 'P', tahunLulus: '2026' },
  { id: 'sa-3', nama: 'BUNGA ANNISA', nik: '1501096203080001', nisn: '0081229700', nism: '-', lp: 'P', tahunLulus: '2026' },
  { id: 'sa-4', nama: 'ILVIA GISA', nik: '1605086312080002', nisn: '0088708559', nism: '-', lp: 'P', tahunLulus: '2026' },
  { id: 'sa-5', nama: 'IQLIMA HURUN JANNAH', nik: '1503036301080002', nisn: '0083709128', nism: '-', lp: 'P', tahunLulus: '2026' },
  { id: 'sa-6', nama: 'LIDIYA AGUSTIANA', nik: '1503037108090003', nisn: '0084394449', nism: '-', lp: 'P', tahunLulus: '2026' },
  { id: 'sa-7', nama: 'LUTHFIAN ALIN NUHA', nik: '1508084212080002', nisn: '0081837591', nism: '-', lp: 'P', tahunLulus: '2026' },
  { id: 'sa-8', nama: 'M. NAFIDZ', nik: '1571022110070101', nisn: '0074131839', nism: '-', lp: 'L', tahunLulus: '2026' },
  { id: 'sa-9', nama: 'MARYAM MUTHI\'AH.B', nik: '1707106701090001', nisn: '3219042945', nism: '-', lp: 'P', tahunLulus: '2026' }
];

// GAMBAR 1 (LANJUTAN): DATA KELAS & WALI
const INITIAL_SIGAP_KELAS = [
  { id: 'k-xa', nama: 'X A', unitSekolah: 'MA IHYA\' AS-SUNNAH', waliKelas: 'Wahyudin Hafiz, S.Pd', aktif: true },
  { id: 'k-xb', nama: 'X B', unitSekolah: 'MA IHYA\' AS-SUNNAH', waliKelas: 'Febrianti Dewi, S.Pd', aktif: true },
  { id: 'k-xia', nama: 'XI A', unitSekolah: 'MA IHYA\' AS-SUNNAH', waliKelas: 'Agus Rinaldi', aktif: true },
  { id: 'k-xib', nama: 'XI B', unitSekolah: 'MA IHYA\' AS-SUNNAH', waliKelas: 'Ainun Hamidah,S.Pd', aktif: true },
  { id: 'k-xiia', nama: 'XII A', unitSekolah: 'MA IHYA\' AS-SUNNAH', waliKelas: 'Feri Hermawan, S.Pd', aktif: true },
  { id: 'k-xiib', nama: 'XII B', unitSekolah: 'MA IHYA\' AS-SUNNAH', waliKelas: 'Defit Purwaningsih, S.Pd', aktif: true },
  { id: 'k-smp-7', nama: 'VII SMP IT', unitSekolah: "SMP IT IHYA' AS-SUNNAH", waliKelas: 'Aminudin, A.Md', cabangId: 'cabang-smp', aktif: true },
  { id: 'k-smp-8', nama: 'VIII SMP IT', unitSekolah: "SMP IT IHYA' AS-SUNNAH", waliKelas: 'Ajizah Ikhda Sulmi, S.Pd', cabangId: 'cabang-smp', aktif: true },
  { id: 'k-ponpes-idad', nama: 'I\'dad Lughowi', unitSekolah: "Pondok Pesantren PPIAS", waliKelas: 'Wahyudin Hafiz, S.Pd', cabangId: 'cabang-ponpes', aktif: true }
];

// GAMBAR 2 (LANJUTAN): DATA JADWAL PELAJARAN
const INITIAL_SIGAP_JADWAL = {
  kelasId: 'X A',
  mode: 'Normal',
  jamPelajaran: [
    { jamKe: 1, waktu: '07:40 - 08:10' },
    { jamKe: 2, waktu: '08:10 - 08:50' },
    { jamKe: 3, waktu: '08:50 - 09:30' },
    { jamKe: 4, waktu: '09:30 - 10:10' },
    { jamKe: 5, waktu: '10:10 - 10:30', isIstirahat: true, label: 'JAM KE-5' },
    { jamKe: 6, waktu: '10:30 - 11:10' },
    { jamKe: 7, waktu: '11:10 - 11:50' },
    { jamKe: 8, waktu: '11:50 - 12:30' }
  ],
  matriks: {
    1: {
      Senin: { mapel: 'Matematika', guru: 'Rima Dewi, S.Si' },
      Selasa: { mapel: 'Shorof', guru: 'Feri Hermawan, S.Pd' },
      Rabu: { mapel: 'Bahasa Inggris', guru: 'Linda Julianti, S.Pd.' },
      Kamis: { mapel: 'Fiqih', guru: 'Hendriyansa Putra' },
      Jumat: { mapel: 'Bahasa Indonesia', guru: 'Defit Purwaningsih, S.Pd' },
      Sabtu: { mapel: 'PJOK', guru: 'Muklis Arfandani, S.Pd.I' }
    },
    2: {
      Senin: { mapel: 'Matematika', guru: 'Rima Dewi, S.Si' },
      Selasa: { mapel: 'Shorof', guru: 'Feri Hermawan, S.Pd' },
      Rabu: { mapel: 'Bahasa Inggris', guru: 'Linda Julianti, S.Pd.' },
      Kamis: { mapel: 'Fiqih', guru: 'Hendriyansa Putra' },
      Jumat: { mapel: 'Bahasa Indonesia', guru: 'Defit Purwaningsih, S.Pd' },
      Sabtu: { mapel: 'PJOK', guru: 'Muklis Arfandani, S.Pd.I' }
    },
    3: {
      Senin: { mapel: 'Nahwu', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Selasa: { mapel: 'Fiqih', guru: 'Hendriyansa Putra' },
      Rabu: { mapel: 'TIK', guru: 'Agus Rinaldi' },
      Kamis: { mapel: 'Nahwu', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Jumat: { mapel: 'Manhaj', guru: 'Wahyudin Hafiz, S.Pd' },
      Sabtu: { mapel: 'Aqidah', guru: 'Ikhwan Khoirul Kholiq, BA' }
    },
    4: {
      Senin: { mapel: 'Nahwu', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Selasa: { mapel: 'Fiqih', guru: 'Hendriyansa Putra' },
      Rabu: { mapel: 'TIK', guru: 'Agus Rinaldi' },
      Kamis: { mapel: 'Nahwu', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Jumat: { mapel: 'Manhaj', guru: 'Wahyudin Hafiz, S.Pd' },
      Sabtu: { mapel: 'Aqidah', guru: 'Ikhwan Khoirul Kholiq, BA' }
    },
    6: {
      Senin: { mapel: 'Khat', guru: 'Aminudin, A.Md' },
      Selasa: { mapel: 'Aqidah', guru: 'Ikhwan Khoirul Kholiq, BA' },
      Rabu: { mapel: 'Muhadatsah', guru: 'Feri Hermawan, S.Pd' },
      Kamis: { mapel: 'Tajwid', guru: 'Rizal Abdilah, S.Pd' },
      Jumat: { mapel: 'SKI', guru: 'Muchammad Amir Hadi, S.Pd.I' },
      Sabtu: { mapel: 'Sejarah Indonesia', guru: 'Defit Purwaningsih, S.Pd' }
    },
    7: {
      Senin: { mapel: 'Khat', guru: 'Aminudin, A.Md' },
      Selasa: { mapel: 'Aqidah', guru: 'Ikhwan Khoirul Kholiq, BA' },
      Rabu: { mapel: 'Muhadatsah', guru: 'Feri Hermawan, S.Pd' },
      Kamis: { mapel: 'Tajwid', guru: 'Rizal Abdilah, S.Pd' },
      Jumat: null,
      Sabtu: { mapel: 'Sejarah Indonesia', guru: 'Defit Purwaningsih, S.Pd' }
    },
    8: {
      Senin: { mapel: 'Prakarya dan Kewirausahaan', guru: 'Defit Purwaningsih, S.Pd' },
      Selasa: { mapel: 'Hadits', guru: 'Agus Rinaldi' },
      Rabu: { mapel: 'Muhadatsah', guru: 'Feri Hermawan, S.Pd' },
      Kamis: { mapel: 'Muhadatsah', guru: 'Feri Hermawan, S.Pd' },
      Jumat: null,
      Sabtu: { mapel: 'PKN', guru: 'Muklis Arfandani, S.Pd.I' }
    }
  }
};

// ==========================================
// MASTER JADWAL SESI HALAQOH & ABSENSI QR
// ==========================================
const INITIAL_JADWAL_HALAQOH = {
  sesiList: [
    {
      id: 'subuh',
      nama: "Ba'da Subuh",
      labelWaktu: "Ziyadah & Tahsin — Ba'da Subuh",
      icon: 'Sunrise',
      mulai: '05:00',
      selesai: '06:30',
      bukaScan: '04:45',
      batasScan: '05:30',
      toleransiMenit: 15,
      aktif: true,
      deskripsi: "Fokus setoran hafalan baru (Ziyadah) & tahsin"
    },
    {
      id: 'pagi',
      nama: 'Pagi / Dhuha',
      labelWaktu: "Penguatan Hafalan — Dhuha",
      icon: 'Sun',
      mulai: '08:30',
      selesai: '10:00',
      bukaScan: '08:15',
      batasScan: '09:00',
      toleransiMenit: 15,
      aktif: true,
      deskripsi: "Penguatan hafalan & tasmi' berpasangan pagi"
    },
    {
      id: 'ashar',
      nama: "Ba'da Ashar",
      labelWaktu: "Muroja'ah Sabqi & Manzil — Ba'da Ashar",
      icon: 'CloudSun',
      mulai: '16:00',
      selesai: '17:30',
      bukaScan: '15:45',
      batasScan: '16:30',
      toleransiMenit: 15,
      aktif: true,
      deskripsi: "Muroja'ah sabqi dan manzil rutin harian"
    },
    {
      id: 'malam',
      nama: "Ba'da Maghrib",
      labelWaktu: "Tadarus Halaqoh — Ba'da Maghrib s/d Isya",
      icon: 'Moon',
      mulai: '18:45',
      selesai: '20:30',
      bukaScan: '18:30',
      batasScan: '19:15',
      toleransiMenit: 15,
      aktif: true,
      deskripsi: 'Tadarus halaqoh & persiapan setoran esok'
    }
  ],
  hariAktif: {
    Senin:  { subuh: true, pagi: true, ashar: true, malam: true },
    Selasa: { subuh: true, pagi: true, ashar: true, malam: true },
    Rabu:   { subuh: true, pagi: true, ashar: true, malam: true },
    Kamis:  { subuh: true, pagi: true, ashar: true, malam: true },
    Jumat:  { subuh: true, pagi: false, ashar: false, malam: false }, // Jumat hanya Subuh aktif
    Sabtu:  { subuh: true, pagi: true, ashar: true, malam: true },
    Ahad:   { subuh: false, pagi: false, ashar: false, malam: false } // Ahad Full Libur
  },
  plottingPengampu: [
    {
      id: 'plt-1',
      guruId: 'g-wahyudin',
      namaGuru: 'Wahyudin Hafiz, S.Pd',
      lokasiId: 'l-xa',
      namaLokasi: 'Lokal Ikhwan Lantai 2 (X A)',
      kodeQR: 'MAIAS-XA',
      sesi: ['subuh', 'malam']
    },
    {
      id: 'plt-2',
      guruId: 'g-redi',
      namaGuru: 'Redi Iskandar, S.Pd., B.A.',
      lokasiId: 'l-xb',
      namaLokasi: 'Lokal Akhwat Lantai 2 (X B)',
      kodeQR: 'MAIAS-XB',
      sesi: ['subuh', 'pagi', 'malam']
    },
    {
      id: 'plt-3',
      guruId: 'g-hendri',
      namaGuru: 'Hendriyansa Putra',
      lokasiId: 'l-xia',
      namaLokasi: 'Gedung A Lantai 2 (XI A)',
      kodeQR: 'MAIAS-XIA',
      sesi: ['subuh', 'ashar', 'malam']
    },
    {
      id: 'plt-4',
      guruId: 'g-agus',
      namaGuru: 'Agus Rinaldi',
      lokasiId: 'l-xiia',
      namaLokasi: 'Gedung B, Lt 1 (XII A)',
      kodeQR: 'MAIAS-XIIA',
      sesi: ['subuh', 'pagi', 'siang', 'malam']
    }
  ],
  liburKhusus: [
    {
      id: 'lb-1',
      tanggal: '2026-09-18',
      keterangan: 'Libur Bulanan Kepulangan Santri',
      kategori: 'Kepulangan'
    },
    {
      id: 'lb-2',
      tanggal: '2026-09-25',
      keterangan: 'Tasmi\' Akbar & Evaluasi Triwulan Santri',
      kategori: 'Event Khusus'
    }
  ]
};

// GAMBAR 3 (LANJUTAN): QR & LOKASI KELAS
const INITIAL_SIGAP_LOKASI_QR = [
  { id: 'l-xiia', kelas: 'XII A', lokasi: 'Gedung B, Lt 1', kodeManual: 'MAIAS-XIIA', cabangId: 'cabang-pusat', gpsStatus: 'GPS: Locked', locked: true, lat: -7.327415, lng: 108.215542, radiusMeter: 50 },
  { id: 'l-xb', kelas: 'X B', lokasi: 'Lokal Akhwat Lantai 2', kodeManual: 'MAIAS-XB', cabangId: 'cabang-pusat', gpsStatus: 'GPS: Locked', locked: true, lat: -7.327450, lng: 108.215580, radiusMeter: 50 },
  { id: 'l-xia', kelas: 'XI A', lokasi: 'Gedung A Lantai 2', kodeManual: 'MAIAS-XIA', cabangId: 'cabang-pusat', gpsStatus: 'GPS: Locked', locked: true, lat: -7.327380, lng: 108.215510, radiusMeter: 50 },
  { id: 'l-xa', kelas: 'X A', lokasi: 'Lokal Ikhwan Lantai 2', kodeManual: 'MAIAS-XA', cabangId: 'cabang-pusat', gpsStatus: 'GPS: Locked', locked: true, lat: -7.327400, lng: 108.215530, radiusMeter: 50 },
  { id: 'l-xib', kelas: 'XI B', lokasi: 'Gedung Akhwat Lt 2', kodeManual: 'MAIAS-XIB', cabangId: 'cabang-pusat', gpsStatus: 'GPS: Locked', locked: true, lat: -7.327430, lng: 108.215560, radiusMeter: 50 },
  { id: 'l-xiib', kelas: 'XII B', lokasi: 'Gedung Akhwat, Lt 2', kodeManual: 'MAIAS-XIIB', cabangId: 'cabang-pusat', gpsStatus: 'GPS: Locked', locked: true, lat: -7.327460, lng: 108.215590, radiusMeter: 50 },
  { id: 'l-smp-1', kelas: 'VII SMP IT', lokasi: 'Kampus SMP IT - Gedung Timur', kodeManual: 'SMPIT-01', cabangId: 'cabang-smp', gpsStatus: 'GPS: Locked', locked: true, lat: -7.328100, lng: 108.216200, radiusMeter: 60 },
  { id: 'l-ponpes-1', kelas: 'I\'dad Lughowi', lokasi: 'Masjid Jami\' Kampus PPIAS', kodeManual: 'PPIAS-01', cabangId: 'cabang-ponpes', gpsStatus: 'GPS: Locked', locked: true, lat: -7.326800, lng: 108.214900, radiusMeter: 80 }
];

// GAMBAR 5 (LANJUTAN): PERSETUJUAN IZIN GURU
const INITIAL_SIGAP_IZIN_GURU = [
  {
    id: 'iz-wahyudin-1',
    nama: 'Wahyudin Hafiz, S.Pd',
    nip: '19880101201501',
    role: 'Pengampu Halaqoh',
    unit: "MA IHYA' AS-SUNNAH",
    halaqahNama: 'Halaqah Ustadz Wahyudin (X A - Ikhwan)',
    jenisIzin: 'Sakit',
    tanggal: 'Sabtu, 12 September 2026',
    tanggalMulai: '2026-09-12',
    tanggalSelesai: '2026-09-12',
    sesi: "Ba'da Ashar (16:00 - 17:30)",
    alasan: 'Demam dan flu berat, istirahat dokter di rumah',
    tugasSiswa: "Muroja'ah mandiri Juz 30 didampingi Badal: Ustadz Agus Rinaldi",
    guruBadal: 'Ustadz Agus Rinaldi',
    status: 'Disetujui',
    catatanAdmin: 'Syafakallah Ustadz. Sesi Ashar resmi dibadalkan oleh Ust. Agus Rinaldi.',
    dibuatPada: '12/09/2026 06:15'
  },
  {
    id: 'iz-1',
    nama: 'Febrianti Dewi, S.Pd',
    tanggal: 'Kamis, 10 September 2026',
    alasan: 'Kontrol kehamilan',
    tugasSiswa: '[XI B - Nahwu]: Menerjemahkan bab أسماء السيئات',
    status: 'Perlu Persetujuan'
  },
  {
    id: 'iz-2',
    nama: 'Roismawati, S. Pd',
    tanggal: 'Kamis, 10 September 2026',
    alasan: 'Kontrol di Pustu',
    tugasSiswa: '[X B - Hadits]: Menulis Hadits ke-5 dan 6 beserta terjemahannya di buku tulis',
    status: 'Perlu Persetujuan'
  }
];

// GAMBAR 4 (LANJUTAN): MONITORING & REKAPITULASI
// GAMBAR 4 (LANJUTAN): MONITORING & REKAPITULASI PRESENSI PENGAMPU HALAQAH
const INITIAL_SIGAP_MONITORING = {
  kpi: {
    totalKbm: 10,
    totalPresensi: 8,
    tepatWaktu: 5,
    terlambat: 3,
    izinSakit: 1,
    alpaKosong: 1,
    belumAbsen: 0
  },
  rankings: {
    alpa: [
      { nama: 'Ustadz Hamzah Fauzi, Lc.', jumlah: '1 x Alpa (Sesi Subuh)' }
    ],
    izin: [
      { nama: 'Febrianti Dewi, S.Pd', jumlah: '1 x Izin (Kontrol Kehamilan)' }
    ],
    telat: [
      { nama: 'Defit Purwaningsih, S.Pd', jumlah: 'Telat 25 Menit' },
      { nama: 'Hendriyansa Putra', jumlah: 'Telat 17 Menit' },
      { nama: 'Agus Rinaldi', jumlah: 'Telat 8 Menit' }
    ]
  },
  liveFeed: [
    {
      id: 'pres-1',
      nama: 'Wahyudin Hafiz, S.Pd',
      nip: '19880101201501',
      role: 'Pengampu Utama',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Ziyadah (X A - Ikhwan)',
      kelas: 'Lokal Ikhwan Lantai 2 (X A)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '04.52',
      tanggal: '10-09-2026',
      status: 'Tepat Waktu',
      selisihMenit: 0,
      keterangan: 'Tepat Waktu (+23m lebih awal)',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Lokal Ikhwan Lt 2 (Akurat 12m)',
      manual: false
    },
    {
      id: 'pres-2',
      nama: 'Redi Iskandar, S.Pd., B.A.',
      nip: '19910515201901',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Ziyadah (X B - Akhwat)',
      kelas: 'Lokal Akhwat Lantai 2 (X B)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '05.02',
      tanggal: '10-09-2026',
      status: 'Tepat Waktu',
      selisihMenit: 0,
      keterangan: 'Tepat Waktu (+13m lebih awal)',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Lokal Akhwat Lt 2 (Akurat 15m)',
      manual: false
    },
    {
      id: 'pres-3',
      nama: 'Fitria Cahya Kamila, S.Pd',
      nip: '19950912202102',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Putri (XII B - Akhwat)',
      kelas: 'Gedung Akhwat, Lt 2 (XII B)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '04.58',
      tanggal: '10-09-2026',
      status: 'Tepat Waktu',
      selisihMenit: 0,
      keterangan: 'Tepat Waktu (+17m lebih awal)',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Ruang Khadijah (Akurat 16m)',
      manual: false
    },
    {
      id: 'pres-4',
      nama: 'Feri Hermawan, S.Pd',
      nip: '19900214201801',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Ikhwan (XII A - Ikhwan)',
      kelas: 'Gedung A Lantai 3 (XII A)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '05.05',
      tanggal: '10-09-2026',
      status: 'Tepat Waktu',
      selisihMenit: 0,
      keterangan: 'Tepat Waktu (+10m lebih awal)',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Gedung A Lt 3 (Akurat 10m)',
      manual: false
    },
    {
      id: 'pres-5',
      nama: 'Ainun Hamidah, S.Pd',
      nip: '200020182091',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Akhwat (XI B - Akhwat)',
      kelas: 'Gedung Akhwat Lt 2 (XI B)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '05.10',
      tanggal: '10-09-2026',
      status: 'Tepat Waktu',
      selisihMenit: 0,
      keterangan: 'Tepat Waktu (+5m lebih awal)',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Gedung Akhwat Lt 2 (Akurat 11m)',
      manual: false
    },
    {
      id: 'pres-6',
      nama: 'Agus Rinaldi',
      nip: '19982025007011180',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Ikhwan (XI A - Ikhwan)',
      kelas: 'Gedung B, Lt 1 (XI A)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '05.23',
      tanggal: '10-09-2026',
      status: 'Terlambat',
      selisihMenit: 8,
      keterangan: 'Telat 8 Menit',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Gedung B Lt 1 (Akurat 12m)',
      manual: false
    },
    {
      id: 'pres-7',
      nama: 'Hendriyansa Putra',
      nip: '19930415201902',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Ikhwan (XI A - Ikhwan)',
      kelas: 'Gedung A Lantai 2 (XI A)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '05.32',
      tanggal: '10-09-2026',
      status: 'Terlambat',
      selisihMenit: 17,
      keterangan: 'Telat 17 Menit',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Gedung A Lt 2 (Akurat 14m)',
      manual: false
    },
    {
      id: 'pres-8',
      nama: 'Defit Purwaningsih, S.Pd',
      nip: '199620032140',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Akhwat (XII B - Akhwat)',
      kelas: 'Gedung Akhwat, Lt 2 (XII B)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '05.40',
      tanggal: '10-09-2026',
      status: 'Terlambat',
      selisihMenit: 25,
      keterangan: 'Telat 25 Menit',
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: 'Gedung Akhwat Lt 2 (Akurat 16m)',
      manual: false
    },
    {
      id: 'pres-9',
      nama: 'Febrianti Dewi, S.Pd',
      nip: '200120232152',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Akhwat (X B - Akhwat)',
      kelas: 'Lokal Akhwat Lantai 2 (X B)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '-',
      tanggal: '10-09-2026',
      status: 'Izin',
      selisihMenit: 0,
      keterangan: 'Izin: Kontrol Kehamilan ke RSUD',
      metode: 'Surat Permohonan Izin (Disetujui)',
      lokasiGps: '-',
      manual: true
    },
    {
      id: 'pres-10',
      nama: 'Ustadz Hamzah Fauzi, Lc.',
      nip: '19910408201704',
      role: 'Pengampu Halaqoh',
      jenis: 'Halaqoh Tahfidz',
      sesi: 'Sesi Subuh',
      mapel: 'Tahfidz Muraja\'ah (XI B - Akhwat)',
      kelas: 'Gedung Akhwat Lt 2 (XI B)',
      jadwal: '05:00 - 06:30',
      toleransiBatas: '05:15',
      jam: '-',
      tanggal: '10-09-2026',
      status: 'Alpa',
      selisihMenit: 0,
      keterangan: 'Alpa (Melewati Batas Waktu Sesi Subuh)',
      metode: 'Belum Presensi (Lewat Batas Sesi)',
      lokasiGps: '-',
      manual: false
    }
  ]
};

// DATA AWAL PRESENSI KEHADIRAN PENGAMPU (HANYA AKUN WAHYUDIN HAFIZ, S.PD)
const INITIAL_PENGAMPU_PRESENSI = [
  {
    id: 'pp-init-subuh',
    tanggal: today,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'subuh',
    sesiNama: "Ba'da Subuh",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '05.18',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+12m)'
  },
  {
    id: 'pp-init-kemarin-subuh',
    tanggal: yesterday,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'subuh',
    sesiNama: "Ba'da Subuh",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '05.10',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+20m)'
  },
  {
    id: 'pp-init-kemarin-pagi',
    tanggal: yesterday,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'pagi',
    sesiNama: 'Pagi / Dhuha',
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '08.40',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+5m)'
  },
  {
    id: 'pp-init-kemarin-malam',
    tanggal: yesterday,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'malam',
    sesiNama: "Ba'da Maghrib",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '19.05',
    status: 'Sudah',
    keterangan: 'Terlambat 5 Menit'
  },
  {
    id: 'pp-init-past-1',
    tanggal: twoDaysAgo,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'subuh',
    sesiNama: "Ba'da Subuh",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '05.14',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+16m)'
  },
  {
    id: 'pp-init-past-2',
    tanggal: twoDaysAgo,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'ashar',
    sesiNama: "Ba'da Ashar",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '16.10',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+5m)'
  },
  {
    id: 'pp-init-past-3',
    tanggal: threeDaysAgo,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'subuh',
    sesiNama: "Ba'da Subuh",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '05.08',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+22m)'
  },
  {
    id: 'pp-init-past-4',
    tanggal: fourDaysAgo,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'subuh',
    sesiNama: "Ba'da Subuh",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '05.15',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+15m)'
  },
  {
    id: 'pp-init-past-5',
    tanggal: fourDaysAgo,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'malam',
    sesiNama: "Ba'da Maghrib",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '18.52',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+8m)'
  },
  {
    id: 'pp-init-past-6',
    tanggal: fiveDaysAgo,
    namaGuru: 'Wahyudin Hafiz, S.Pd',
    sesiId: 'subuh',
    sesiNama: "Ba'da Subuh",
    lokasiKode: 'MAIAS-XA',
    lokasiNama: 'Lokal Ikhwan Lantai 2 (X A)',
    jamScan: '05.11',
    status: 'Sudah',
    keterangan: 'Tepat Waktu (+19m)'
  }
];

export const storageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.HALAQAH)) {
      localStorage.setItem(STORAGE_KEYS.HALAQAH, JSON.stringify(INITIAL_HALAQAH));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SANTRI)) {
      localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(INITIAL_SANTRI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETORAN)) {
      localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(INITIAL_SETORAN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ABSENSI)) {
      localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(INITIAL_ABSENSI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.IZIN)) {
      localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(INITIAL_IZIN));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PENGAMPU)) {
      localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(INITIAL_PENGAMPU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESI)) {
      localStorage.setItem(STORAGE_KEYS.SESI, JSON.stringify(INITIAL_SESI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_SISWA)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_SISWA, JSON.stringify(INITIAL_SIGAP_SISWA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_GURU)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_GURU, JSON.stringify(INITIAL_SIGAP_GURU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_ALUMNI)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_ALUMNI, JSON.stringify(INITIAL_SIGAP_ALUMNI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_KELAS)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_KELAS, JSON.stringify(INITIAL_SIGAP_KELAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_JADWAL)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_JADWAL, JSON.stringify(INITIAL_SIGAP_JADWAL));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_LOKASI_QR)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_LOKASI_QR, JSON.stringify(INITIAL_SIGAP_LOKASI_QR));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_IZIN_GURU)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_IZIN_GURU, JSON.stringify(INITIAL_SIGAP_IZIN_GURU));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SIGAP_MONITORING)) {
      localStorage.setItem(STORAGE_KEYS.SIGAP_MONITORING, JSON.stringify(INITIAL_SIGAP_MONITORING));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CABANG)) {
      localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(INITIAL_CABANG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPERADMIN_ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.SUPERADMIN_ACCOUNTS, JSON.stringify(INITIAL_SUPERADMIN_ACCOUNTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH_ID, 'cabang-pusat');
    }
    if (!localStorage.getItem(STORAGE_KEYS.PENGAMPU_PRESENSI)) {
      localStorage.setItem(STORAGE_KEYS.PENGAMPU_PRESENSI, JSON.stringify(INITIAL_PENGAMPU_PRESENSI));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE)) {
      // Set default ke superadmin sesuai permintaan pengguna
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, 'superadmin');
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELECTED_STUDENT_PARENT)) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_STUDENT_PARENT, 's-akbar');
    }

    // AUTO-SYNC / MIGRATION UNTUK MEMASTIKAN DATA SIGAP GURU & SISWA SELARAS
    try {
      // 1. Sync Guru & Pengampu
      const storedGuruRaw = localStorage.getItem(STORAGE_KEYS.SIGAP_GURU);
      let currentGurus = storedGuruRaw ? JSON.parse(storedGuruRaw) : [];
      if (!Array.isArray(currentGurus) || currentGurus.length < INITIAL_SIGAP_GURU.length) {
        // Gabungkan / update dengan data lengkap terbaru
        const merged = [...INITIAL_SIGAP_GURU];
        currentGurus.forEach(cg => {
          if (!merged.find(m => m.id === cg.id || m.nama === cg.nama)) {
            merged.push(cg);
          }
        });
        localStorage.setItem(STORAGE_KEYS.SIGAP_GURU, JSON.stringify(merged));
      }

      // 2. Sync Siswa SIGAP & Pengampu
      const storedSiswaRaw = localStorage.getItem(STORAGE_KEYS.SIGAP_SISWA);
      let currentSiswa = storedSiswaRaw ? JSON.parse(storedSiswaRaw) : [];
      if (!Array.isArray(currentSiswa) || currentSiswa.length < 15 || !currentSiswa[0].unitSekolah) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_SISWA, JSON.stringify(INITIAL_SIGAP_SISWA));
      }

      // 3. Sync Pengampu list to match SIGAP Guru
      const activeGurus = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGAP_GURU) || '[]');
      const storedPengampuRaw = localStorage.getItem(STORAGE_KEYS.PENGAMPU);
      let currentPengampu = storedPengampuRaw ? JSON.parse(storedPengampuRaw) : [];
      if (!Array.isArray(currentPengampu) || currentPengampu.length < activeGurus.length) {
        localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(INITIAL_PENGAMPU));
      }

      // 4. Sync s-azmi (Muhammad Azmi Soleh) & setoran riwayat
      const storedSantriRaw = localStorage.getItem(STORAGE_KEYS.SANTRI);
      let currentSantri = storedSantriRaw ? JSON.parse(storedSantriRaw) : [];
      if (Array.isArray(currentSantri) && !currentSantri.some(s => s.id === 's-azmi')) {
        currentSantri.unshift(INITIAL_SANTRI[0]);
        localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(currentSantri));
      }

      const storedSetoranRaw = localStorage.getItem(STORAGE_KEYS.SETORAN);
      let currentSetoran = storedSetoranRaw ? JSON.parse(storedSetoranRaw) : [];
      if (Array.isArray(currentSetoran) && !currentSetoran.some(s => s.id === 'set-azmi-1')) {
        currentSetoran = [
          INITIAL_SETORAN[0],
          INITIAL_SETORAN[1],
          INITIAL_SETORAN[2],
          ...currentSetoran
        ];
        localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(currentSetoran));
      }

      // 5. Bersihkan cache SIGAP_MONITORING jika masih ada data guru mapel umum
      localStorage.removeItem('sigap_monitoring_v1');
      localStorage.removeItem('sigap_monitoring_v2');
      localStorage.removeItem('sigap_monitoring_v3');
      localStorage.removeItem('sigap_monitoring_v4');
      localStorage.removeItem('sigap_monitoring_v5');

      const storedMonitoringRaw = localStorage.getItem(STORAGE_KEYS.SIGAP_MONITORING);
      let currentMonitoring = storedMonitoringRaw ? JSON.parse(storedMonitoringRaw) : null;
      const isInvalidMonitoring = !currentMonitoring || 
        !currentMonitoring.liveFeed || 
        currentMonitoring.liveFeed.length !== 10 ||
        currentMonitoring.liveFeed.some(f => 
          f.role === 'Guru Mapel' || 
          f.jenis === 'KBM Formal' || 
          ['Muchammad Amir Hadi, S.Pd.I', 'Deden Ramdani, S.Pd', 'Ikhwan Khoirul Kholiq, BA', 'Linda Julianti, S.Pd.', 'Rima Dewi, S.Si', 'Eka Puspitasari, S.Pd'].includes(f.nama) ||
          ['SKI', 'Fiqih Ibadah', 'Aqidah', 'Bahasa Inggris', 'Matematika', 'Khat & Imla\'', 'Shorof', 'Bahasa Arab Dasar', 'Tajwid'].includes(f.mapel) ||
          (f.mapel && !f.mapel.toLowerCase().includes('tahfidz'))
        );
      if (isInvalidMonitoring) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_MONITORING, JSON.stringify(INITIAL_SIGAP_MONITORING));
      }

      // 6. Sync Sesi Presensi: Pastikan STORAGE_KEYS.SESI selalu mengikuti SIGAP_JADWAL_HALAQOH
      const halaqohRaw = localStorage.getItem(STORAGE_KEYS.SIGAP_JADWAL_HALAQOH);
      if (halaqohRaw) {
        try {
          const parsedH = JSON.parse(halaqohRaw);
          if (parsedH && Array.isArray(parsedH.sesiList)) {
            localStorage.setItem(STORAGE_KEYS.SESI, JSON.stringify(parsedH.sesiList));
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Storage auto-sync error:", e);
    }
  },

  // ==========================================
  // MULTI-BRANCH (CABANG) MANAGEMENT
  // ==========================================
  getActiveBranchId() {
    this.init();
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID) || 'cabang-pusat';
  },

  setActiveBranchId(branchId) {
    this.init();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH_ID, branchId);
  },

  getActiveBranch() {
    const list = this.getCabang();
    const activeId = this.getActiveBranchId();
    return list.find(c => c.id === activeId) || list[0] || INITIAL_CABANG[0];
  },

  getCabang() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CABANG)) || INITIAL_CABANG;
    } catch {
      return INITIAL_CABANG;
    }
  },

  saveCabang(list) {
    localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(list));
  },

  addCabang(item) {
    const list = this.getCabang();
    const created = {
      ...item,
      id: item.id || ('cabang-' + Date.now()),
      status: item.status || 'Aktif',
      warnaAksen: item.warnaAksen || '#0d9488',
      didirikan: item.didirikan || new Date().getFullYear().toString()
    };
    list.push(created);
    this.saveCabang(list);
    return created;
  },

  updateCabang(id, fields) {
    const list = this.getCabang();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this.saveCabang(list);

      // Sinkronkan nama cabang ke akun Super Admin jika nama cabang diubah
      if (fields.nama) {
        const saList = this.getSuperAdminAccounts();
        let changed = false;
        saList.forEach(sa => {
          if (sa.cabangId === id) {
            sa.cabangNama = fields.nama;
            changed = true;
          }
        });
        if (changed) this.saveSuperAdminAccounts(saList);
      }

      return list[idx];
    }
    return null;
  },

  deleteCabang(id) {
    if (id === 'cabang-pusat') {
      alert('Cabang Utama (Pusat) tidak dapat dihapus!');
      return false;
    }
    const list = this.getCabang().filter(c => c.id !== id);
    this.saveCabang(list);
    if (this.getActiveBranchId() === id) {
      this.setActiveBranchId('cabang-pusat');
    }
    return true;
  },

  // ==========================================
  // SUPER ADMIN ACCOUNTS PER CABANG
  // ==========================================
  getSuperAdminAccounts() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPERADMIN_ACCOUNTS)) || INITIAL_SUPERADMIN_ACCOUNTS;
    } catch {
      return INITIAL_SUPERADMIN_ACCOUNTS;
    }
  },

  saveSuperAdminAccounts(list) {
    localStorage.setItem(STORAGE_KEYS.SUPERADMIN_ACCOUNTS, JSON.stringify(list));
  },

  addSuperAdminAccount(item) {
    const list = this.getSuperAdminAccounts();
    const cabangList = this.getCabang();
    const matchedCabang = cabangList.find(c => c.id === item.cabangId);

    const created = {
      ...item,
      id: item.id || ('sa-' + Date.now()),
      cabangNama: matchedCabang ? matchedCabang.nama : 'Cabang Utama',
      password: item.password || 'bismillah123',
      status: item.status || 'Aktif',
      role: 'Super Admin Cabang',
      terakhirLogin: 'Baru Dibuat'
    };
    list.push(created);
    this.saveSuperAdminAccounts(list);
    return created;
  },

  updateSuperAdminAccount(id, fields) {
    const list = this.getSuperAdminAccounts();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      if (fields.cabangId && fields.cabangId !== list[idx].cabangId) {
        const cabangList = this.getCabang();
        const matchedCabang = cabangList.find(c => c.id === fields.cabangId);
        fields.cabangNama = matchedCabang ? matchedCabang.nama : list[idx].cabangNama;
      }
      list[idx] = { ...list[idx], ...fields };
      this.saveSuperAdminAccounts(list);
      return list[idx];
    }
    return null;
  },

  deleteSuperAdminAccount(id) {
    const list = this.getSuperAdminAccounts().filter(s => s.id !== id);
    this.saveSuperAdminAccounts(list);
  },

  resetPasswordSuperAdmin(id, newPassword = 'bismillah123') {
    const list = this.getSuperAdminAccounts();
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx].password = newPassword;
      this.saveSuperAdminAccounts(list);
      return true;
    }
    return false;
  },


  // ROLE
  getCurrentRole() {
    this.init();
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || 'pengampu';
  },

  setCurrentRole(role) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
  },

  getParentSelectedStudent() {
    this.init();
    return localStorage.getItem(STORAGE_KEYS.SELECTED_STUDENT_PARENT) || 's-akbar';
  },

  setParentSelectedStudent(id) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_STUDENT_PARENT, id);
  },

  // SANTRI (MULTI-BRANCH ISOLATED)
  getAllSantriRaw() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SANTRI)) || INITIAL_SANTRI;
    } catch {
      return INITIAL_SANTRI;
    }
  },

  getSantri(branchId = null) {
    const all = this.getAllSantriRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(s => (s.cabangId || 'cabang-pusat') === targetBranch);
  },

  saveSantri(branchList, branchId = null) {
    const targetBranch = branchId || this.getActiveBranchId();
    const all = this.getAllSantriRaw();
    const otherBranches = all.filter(s => (s.cabangId || 'cabang-pusat') !== targetBranch);
    const updatedBranchList = branchList.map(s => ({
      ...s,
      cabangId: s.cabangId || targetBranch
    }));
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify([...otherBranches, ...updatedBranchList]));
  },

  addSantri(newSantri) {
    const targetBranch = newSantri.cabangId || this.getActiveBranchId();
    const all = this.getAllSantriRaw();
    const created = {
      ...newSantri,
      id: newSantri.id || 's-' + Date.now(),
      cabangId: targetBranch,
      totalHalaman: 0,
      rincianHalaman: '0 Hlm 0 Brs',
      juzMutqin: newSantri.juzMutqin || [],
      juzZiyadah: newSantri.juzZiyadah || []
    };
    all.push(created);
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(all));
    return created;
  },

  updateSantri(id, updatedFields) {
    const all = this.getAllSantriRaw();
    const idx = all.findIndex(s => s.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(all));
      return all[idx];
    }
    return null;
  },

  deleteSantri(id) {
    const all = this.getAllSantriRaw().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(all));
  },

  // HALAQAH (MULTI-BRANCH ISOLATED)
  getAllHalaqahRaw() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HALAQAH)) || INITIAL_HALAQAH;
    } catch {
      return INITIAL_HALAQAH;
    }
  },

  getHalaqah(branchId = null) {
    const all = this.getAllHalaqahRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(h => (h.cabangId || 'cabang-pusat') === targetBranch);
  },

  // SETORAN (MULTI-BRANCH ISOLATED)
  getAllSetoranRaw() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETORAN)) || INITIAL_SETORAN;
    } catch {
      return INITIAL_SETORAN;
    }
  },

  getSetoran(branchId = null) {
    const all = this.getAllSetoranRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(s => (s.cabangId || 'cabang-pusat') === targetBranch);
  },

  // Mengembalikan total count riwayat setoran
  getTotalSetoranCount(branchId = null) {
    const list = this.getSetoran(branchId);
    return list.length;
  },

  addSetoran(entry) {
    const targetBranch = entry.cabangId || this.getActiveBranchId();
    const all = this.getAllSetoranRaw();
    const newEntry = {
      ...entry,
      id: 'set-' + Date.now(),
      cabangId: targetBranch,
      tanggal: entry.tanggal || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    all.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(all));

    // Update santri mutqin / ziyadah
    if (entry.juz && entry.santriId) {
      const allSantri = this.getAllSantriRaw();
      const sIndex = allSantri.findIndex(s => s.id === entry.santriId);
      if (sIndex !== -1) {
        const santri = allSantri[sIndex];
        const juzNum = parseInt(entry.juz);
        if (entry.nilai === "Mumtaz" && entry.jenis === "Tasmi'") {
          if (!santri.juzMutqin.includes(juzNum)) {
            santri.juzMutqin = [...santri.juzMutqin, juzNum].sort((a, b) => a - b);
          }
        } else if (!santri.juzZiyadah.includes(juzNum) && !santri.juzMutqin.includes(juzNum)) {
          santri.juzZiyadah = [...santri.juzZiyadah, juzNum].sort((a, b) => a - b);
        }
        santri.totalHalaman = (parseFloat(santri.totalHalaman) || 0) + (parseFloat(entry.halaman) || 1);
        localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(allSantri));
      }
    }

    return newEntry;
  },

  deleteSetoran(id) {
    const all = this.getAllSetoranRaw().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(all));
  },

  // ABSENSI (MULTI-BRANCH ISOLATED)
  getAllAbsensiRaw() {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ABSENSI);
      const stored = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(stored) || stored.length === 0) {
        localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(INITIAL_ABSENSI));
        return INITIAL_ABSENSI;
      }
      // Pastikan data historis (kemarin, 2 hari lalu dll) tersedia untuk filter periode
      let updated = [...stored];
      let hasNew = false;
      INITIAL_ABSENSI.forEach(seed => {
        const exists = updated.some(u => 
          u.tanggal === seed.tanggal && 
          u.halaqahId === seed.halaqahId && 
          (u.sesiId === seed.sesiId || u.sesi === seed.sesi)
        );
        if (!exists) {
          updated.push(seed);
          hasNew = true;
        }
      });
      if (hasNew) {
        localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(updated));
      }
      return updated;
    } catch {
      return INITIAL_ABSENSI;
    }
  },

  getAbsensi(branchId = null) {
    const all = this.getAllAbsensiRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(a => (a.cabangId || 'cabang-pusat') === targetBranch);
  },

  saveAbsensiRecord(tanggal, halaqahId, records, catatanHalaqah = "", sesiId = 'subuh', sesiNama = null) {
    const targetBranch = this.getActiveBranchId();
    const all = this.getAllAbsensiRaw();
    const existingIndex = all.findIndex(a => 
      a.tanggal === tanggal && 
      a.halaqahId === halaqahId && 
      (a.sesiId === sesiId || (!a.sesiId && (sesiId === 'subuh' || !sesiId)))
    );
    const newRecord = {
      tanggal,
      halaqahId,
      sesiId: sesiId || 'subuh',
      sesi: sesiNama || (sesiId === 'pagi' ? 'Pagi / Dhuha' : sesiId === 'ashar' ? "Ba'da Ashar" : sesiId === 'malam' ? "Ba'da Maghrib" : "Ba'da Subuh"),
      cabangId: targetBranch,
      records,
      catatanHalaqah,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      all[existingIndex] = newRecord;
    } else {
      all.unshift(newRecord);
    }

    localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(all));
    return newRecord;
  },

  // SCAN PRESENSI LOG
  scanPresensiSantri(santriId, tanggal = today, sesi = "Ba'da Subuh") {
    const list = this.getAbsensi();
    let entry = list.find(a => a.tanggal === tanggal && a.halaqahId === "h-wahyudin");
    const nowTime = new Date().toTimeString().split(' ')[0];

    if (!entry) {
      entry = {
        tanggal,
        halaqahId: "h-wahyudin",
        sesi,
        records: {}
      };
      list.unshift(entry);
    }

    entry.records[santriId] = {
      status: 'H',
      jamScan: nowTime,
      catatan: 'Scan QR Presensi'
    };

    localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(list));
    return { success: true, jamScan: nowTime };
  },

  // ==========================================
  // PRESENSI KEHADIRAN GURU PENGAMPU (SCAN QR DARI SUPER ADMIN)
  // ==========================================
  getPengampuPresensiList() {
    this.init();
    try {
      localStorage.removeItem('simtah_pengampu_presensi_v1');
      localStorage.removeItem('simtah_pengampu_presensi_v2');
      const raw = localStorage.getItem(STORAGE_KEYS.PENGAMPU_PRESENSI);
      let list = raw ? JSON.parse(raw) : null;
      // Bersihkan data uji coba abnormal
      if (Array.isArray(list)) {
        const initialCount = list.length;
        list = list.filter(item => {
          const isAbnormal = 
            ((item.sesiId === 'subuh' || item.sesiId === 'dhuha') && (item.jamScan || '').startsWith('20.')) ||
            (item.keterangan || '').includes('916') ||
            (item.keterangan || '').includes('726');
          return !isAbnormal;
        });
        if (list.length !== initialCount) {
          localStorage.setItem(STORAGE_KEYS.PENGAMPU_PRESENSI, JSON.stringify(list));
        }
      }
      if (!Array.isArray(list) || list.length === 0) {
        list = [...INITIAL_PENGAMPU_PRESENSI];
        localStorage.setItem(STORAGE_KEYS.PENGAMPU_PRESENSI, JSON.stringify(list));
      } else {
        // Pastikan seed riwayat akun Wahyudin tersimpan lengkap
        let hasNew = false;
        INITIAL_PENGAMPU_PRESENSI.forEach(seed => {
          const exists = list.some(item => 
            item.tanggal === seed.tanggal && 
            item.sesiId === seed.sesiId && 
            (item.namaGuru || '').includes('Wahyudin')
          );
          if (!exists) {
            list.push(seed);
            hasNew = true;
          }
        });
        if (hasNew) {
          localStorage.setItem(STORAGE_KEYS.PENGAMPU_PRESENSI, JSON.stringify(list));
        }
      }
      return list;
    } catch {
      return INITIAL_PENGAMPU_PRESENSI;
    }
  },

  isPengampuSudahScan(namaGuru = 'Wahyudin Hafiz, S.Pd', sesiIdOrNama = 'subuh', tanggal = null) {
    const list = this.getPengampuPresensiList();
    const todayISO = tanggal || new Date().toISOString().split('T')[0];
    const cleanTarget = String(sesiIdOrNama || '').toLowerCase().trim();

    const record = list.find(item => {
      if (item.tanggal !== todayISO) return false;
      const sId = (item.sesiId || '').toLowerCase();
      const sNama = (item.sesiNama || '').toLowerCase();
      return sId === cleanTarget || sNama.includes(cleanTarget) || cleanTarget.includes(sNama);
    });

    if (record) {
      return {
        sudah: true,
        status: 'Sudah',
        jamScan: record.jamScan || '-',
        lokasi: record.lokasiNama || record.lokasiKode || '',
        keterangan: record.keterangan || 'Tepat Waktu'
      };
    }

    return { sudah: false, status: 'Belum' };
  },

  scanPresensiPengampu(namaGuru, targetLokasi, sesiNama, sesiId = null) {
    const now = new Date();
    const nowTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    const todayISO = now.toISOString().split('T')[0];

    // Cek jadwal halaqoh untuk toleransi waktu & nama sesi
    const jadwal = this.getJadwalHalaqoh();
    const sesi = jadwal?.sesiList?.find(s => 
      (sesiId && s.id === sesiId) || 
      (s.nama || '').toLowerCase().includes((sesiNama || '').toLowerCase())
    ) || jadwal?.sesiList?.[0];

    const finalSesiId = sesi?.id || sesiId || 'subuh';
    const finalSesiNama = sesi?.nama || sesiNama || "Ba'da Subuh";

    let lokasiKode = typeof targetLokasi === 'string' ? targetLokasi : (targetLokasi?.kodeManual || targetLokasi?.kelas || 'MAIAS-XA');
    let lokasiNama = typeof targetLokasi === 'object' ? `${targetLokasi.kelas} (${targetLokasi.lokasi || ''})` : lokasiKode;

    let isLate = false;
    let lateMinutes = 0;
    let status = 'Tepat Waktu';
    let keterangan = 'Tepat Waktu';

    if (sesi && sesi.mulai) {
      const [startHour, startMin] = sesi.mulai.split(':').map(Number);
      const tolerance = sesi.toleransiMenit || 15;
      const scheduledTotal = startHour * 60 + startMin;
      const limitTotal = scheduledTotal + tolerance;
      const nowTotal = now.getHours() * 60 + now.getMinutes();

      if (nowTotal > limitTotal) {
        isLate = true;
        lateMinutes = nowTotal - limitTotal;
        status = 'Terlambat';
        keterangan = `Telat ${lateMinutes} Menit`;
      } else {
        const earlyMinutes = limitTotal - nowTotal;
        keterangan = earlyMinutes > 0 ? `Tepat Waktu (+${earlyMinutes}m sebelum batas)` : 'Tepat Waktu';
      }
    }

    // 1. Simpan ke PENGAMPU_PRESENSI (untuk status "Sudah" / "Belum" di Jadwal Sesi Hari Ini)
    const list = this.getPengampuPresensiList();
    const existingIndex = list.findIndex(p => 
      p.tanggal === todayISO && 
      (p.sesiId === finalSesiId || (p.sesiNama || '').toLowerCase() === finalSesiNama.toLowerCase())
    );

    const newRecord = {
      id: 'pp-' + Date.now(),
      tanggal: todayISO,
      namaGuru: namaGuru || 'Wahyudin Hafiz, S.Pd',
      sesiId: finalSesiId,
      sesiNama: finalSesiNama,
      lokasiKode,
      lokasiNama,
      jamScan: nowTime,
      status: 'Sudah',
      keterangan: keterangan
    };

    if (existingIndex !== -1) {
      list[existingIndex] = { ...list[existingIndex], ...newRecord };
    } else {
      list.unshift(newRecord);
    }
    localStorage.setItem(STORAGE_KEYS.PENGAMPU_PRESENSI, JSON.stringify(list));

    // 2. Simpan ke SIGAP_MONITORING (untuk rekap pantauan Super Admin)
    try {
      const mon = this.getSigapMonitoring();
      const newFeed = {
        id: 'pres-' + Date.now(),
        nama: namaGuru || 'Wahyudin Hafiz, S.Pd',
        role: 'Pengampu Halaqoh',
        jenis: 'Halaqoh Tahfidz',
        jam: nowTime,
        tanggal: todayISO,
        sesi: finalSesiNama,
        mapel: `Tahfidz (${finalSesiNama})`,
        kelas: lokasiKode || 'Masjid Tahfidz',
        status: status,
        selisihMenit: lateMinutes,
        keterangan: keterangan,
        metode: 'QR Scan (GPS Locked)',
        lokasiGps: `${lokasiKode || 'Lokasi Terverifikasi'} (Akurat)`,
        manual: false
      };

      const existingFeedIdx = mon.liveFeed.findIndex(
        f => f.nama.toLowerCase() === (namaGuru || '').toLowerCase() && f.sesi === newFeed.sesi
      );
      if (existingFeedIdx !== -1) {
        mon.liveFeed[existingFeedIdx] = { ...mon.liveFeed[existingFeedIdx], ...newFeed };
      } else {
        mon.liveFeed = [newFeed, ...(mon.liveFeed || [])];
      }

      if (isLate) {
        mon.kpi.terlambat = (mon.kpi.terlambat || 0) + 1;
      } else {
        mon.kpi.tepatWaktu = (mon.kpi.tepatWaktu || 0) + 1;
      }
      mon.kpi.totalPresensi = (mon.kpi.totalPresensi || 0) + 1;
      this.saveSigapMonitoring(mon);
    } catch (e) {
      console.warn("Error updating monitoring feed:", e);
    }

    return {
      success: true,
      jamScan: nowTime,
      lokasi: lokasiNama,
      kodeQR: lokasiKode,
      status: 'Sudah',
      keterangan: keterangan,
      sesi: finalSesiNama,
      sesiId: finalSesiId
    };
  },

  // PERMOHONAN IZIN
  getIzin() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.IZIN)) || INITIAL_IZIN;
    } catch {
      return INITIAL_IZIN;
    }
  },

  addIzin(data) {
    const list = this.getIzin();
    const created = {
      ...data,
      id: 'iz-' + Date.now(),
      status: 'Menunggu',
      dibuatPada: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    list.unshift(created);
    localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(list));
    return created;
  },

  updateStatusIzin(id, status, catatanUstadz = "") {
    const list = this.getIzin();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (catatanUstadz) list[idx].catatanUstadz = catatanUstadz;
      localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(list));

      // Jika disetujui, update status di absensi harian
      const item = list[idx];
      if (status === 'Disetujui') {
        const absensiList = this.getAbsensi();
        let absensiToday = absensiList.find(a => a.tanggal === item.tanggalMulai);
        if (absensiToday) {
          absensiToday.records[item.santriId] = {
            status: item.jenisIzin === 'Sakit' ? 'S' : 'I',
            jamScan: '-',
            catatan: `Izin: ${item.keterangan}`
          };
          localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(absensiList));
        }
      }

      return list[idx];
    }
    return null;
  },

  // SETTINGS
  getSettings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // BACKUP & EXPORT
  exportBackupJSON() {
    const data = {
      version: '2.0.0',
      system: 'Tahfidz HUB Multi-Branch',
      exportedAt: new Date().toISOString(),
      santri: this.getSantri(),
      halaqah: this.getHalaqah(),
      setoran: this.getSetoran(),
      absensi: this.getAbsensi(),
      izin: this.getIzin(),
      settings: this.getSettings()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Tahfidz_HUB_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackupJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.santri) this.saveSantri(data.santri);
      if (data.halaqah) localStorage.setItem(STORAGE_KEYS.HALAQAH, JSON.stringify(data.halaqah));
      if (data.setoran) localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(data.setoran));
      if (data.absensi) localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(data.absensi));
      if (data.izin) localStorage.setItem(STORAGE_KEYS.IZIN, JSON.stringify(data.izin));
      if (data.settings) this.saveSettings(data.settings);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  exportSetoranToCSV() {
    const setoran = this.getSetoran();
    const santriMap = Object.fromEntries(this.getSantri().map(s => [s.id, s]));
    
    const headers = ["Tanggal", "Nama Santri", "NIS", "Kelas", "Jenis Setoran", "Surah", "Ayat Awal", "Ayat Akhir", "Juz", "Nilai", "Skor", "Status Lanjut", "Catatan Tajwid", "Musyrif"];
    const rows = setoran.map(item => {
      const s = santriMap[item.santriId] || {};
      return [
        `"${item.tanggal}"`,
        `"${s.nama || '-'}"`,
        `"${s.nis || '-'}"`,
        `"${s.kelas || '-'}"`,
        `"${item.jenis}"`,
        `"${item.surahName}"`,
        item.ayatAwal || '-',
        item.ayatAkhir || '-',
        item.juz || '-',
        `"${item.nilai}"`,
        item.skor || '-',
        `"${item.statusLanjut}"`,
        `"${(item.catatanTajwid || '').replace(/"/g, '""')}"`,
        `"${item.musyrif || '-'}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Setoran_Tahfidz_HUB_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // PENGAMPU (AKUN USTADZ - MULTI-BRANCH ISOLATED)
  getAllPengampuRaw() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENGAMPU)) || INITIAL_PENGAMPU;
    } catch {
      return INITIAL_PENGAMPU;
    }
  },

  getPengampu(branchId = null) {
    const all = this.getAllPengampuRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(p => {
      const pBranch = p.cabangId || (p.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return pBranch === targetBranch;
    });
  },

  savePengampu(branchList, branchId = null) {
    const targetBranch = branchId || this.getActiveBranchId();
    const all = this.getAllPengampuRaw();
    const otherBranches = all.filter(p => {
      const pBranch = p.cabangId || (p.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return pBranch !== targetBranch;
    });
    const updatedBranchList = branchList.map(p => ({
      ...p,
      cabangId: p.cabangId || targetBranch
    }));
    localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify([...otherBranches, ...updatedBranchList]));
  },

  addPengampu(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const all = this.getAllPengampuRaw();
    const created = {
      ...item,
      id: item.id || 'u-' + Date.now(),
      cabangId: targetBranch,
      status: item.status || 'Aktif',
      role: item.role || 'Pengampu',
      terakhirLogin: 'Baru Didaftarkan'
    };
    all.push(created);
    localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(all));

    // Otomatis tambahkan juga ke daftar halaqah jika nama halaqah diisi
    if (item.halaqahNama) {
      const halaqahList = this.getAllHalaqahRaw();
      const existing = halaqahList.find(h => h.id === item.halaqahId);
      if (!existing) {
        halaqahList.push({
          id: item.halaqahId || ('h-' + Date.now()),
          nama: item.halaqahNama,
          musyrif: item.nama,
          cabangId: targetBranch,
          lokasi: item.lokasi || "Masjid Cabang Lembaga",
          targetJuzPekan: 0.5
        });
        localStorage.setItem(STORAGE_KEYS.HALAQAH, JSON.stringify(halaqahList));
      }
    }

    return created;
  },

  updatePengampu(id, fields) {
    const all = this.getAllPengampuRaw();
    const idx = all.findIndex(u => u.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...fields };
      localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(all));

      // Sinkronkan nama ustadz ke halaqah
      if (fields.nama || fields.halaqahNama) {
        const halaqahList = this.getAllHalaqahRaw();
        const hIdx = halaqahList.findIndex(h => h.id === all[idx].halaqahId);
        if (hIdx !== -1) {
          if (fields.nama) halaqahList[hIdx].musyrif = fields.nama;
          if (fields.halaqahNama) halaqahList[hIdx].nama = fields.halaqahNama;
          if (fields.lokasi) halaqahList[hIdx].lokasi = fields.lokasi;
          localStorage.setItem(STORAGE_KEYS.HALAQAH, JSON.stringify(halaqahList));
        }
      }

      return all[idx];
    }
    return null;
  },

  deletePengampu(id) {
    const all = this.getAllPengampuRaw().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(all));
  },

  resetPasswordPengampu(idOrName, newPassword = "bismillah123", email = null) {
    const all = this.getAllPengampuRaw();
    const idx = all.findIndex(u => 
      u.id === idOrName || 
      u.nama === idOrName || 
      (email && u.email === email) ||
      (u.email && u.email === idOrName)
    );
    if (idx !== -1) {
      all[idx].password = newPassword;
      all[idx].passwordTerakhirDireset = new Date().toLocaleDateString('id-ID');
      localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(all));
      return { success: true, passwordBaru: newPassword };
    }
    return { success: false };
  },

  // JADWAL SESI PRESENSI (Diselaraskan sepenuhnya dengan Jadwal Halaqoh SIGAP)
  getSesi() {
    this.init();
    try {
      const data = this.getJadwalHalaqoh();
      if (data && Array.isArray(data.sesiList) && data.sesiList.length > 0) {
        return data.sesiList.map(s => {
          const jamMulai = s.mulai || s.jamMulai || '05:00';
          const jamSelesai = s.selesai || s.jamSelesai || '06:30';
          const isAktif = s.aktif !== false && s.status !== 'NONAKTIF' && s.status !== 'LIBUR';
          return {
            ...s,
            id: s.id,
            nama: s.nama,
            mulai: jamMulai,
            selesai: jamSelesai,
            jamMulai: jamMulai,
            jamSelesai: jamSelesai,
            bukaScan: s.bukaScan || jamMulai,
            batasScan: s.batasScan || jamSelesai,
            toleransiMenit: s.toleransiMenit ?? 15,
            aktif: isAktif,
            status: !isAktif ? (s.status === 'LIBUR' ? 'LIBUR' : 'NONAKTIF') : 'AKTIF',
            isActive: isAktif,
            badgeType: !isAktif ? 'danger' : 'success',
            keterangan: s.labelWaktu || s.deskripsi || `Jam Operasional: ${jamMulai} - ${jamSelesai}`,
            labelWaktu: s.labelWaktu || `${s.nama} (${jamMulai} - ${jamSelesai})`
          };
        });
      }
      return INITIAL_SESI;
    } catch {
      return INITIAL_SESI;
    }
  },

  saveSesi(list) {
    const data = this.getJadwalHalaqoh();
    data.sesiList = list;
    this.saveJadwalHalaqoh(data);
  },

  addSesi(item) {
    const created = this.addSesiHalaqoh({
      ...item,
      mulai: item.jamMulai || item.mulai || '05:00',
      selesai: item.jamSelesai || item.selesai || '06:30',
      jamMulai: item.jamMulai || item.mulai || '05:00',
      jamSelesai: item.jamSelesai || item.selesai || '06:30',
      bukaScan: item.bukaScan || item.jamMulai || item.mulai || '05:00',
      batasScan: item.batasScan || item.jamSelesai || item.selesai || '06:30',
      aktif: item.status !== 'NONAKTIF' && item.aktif !== false
    });
    return created;
  },

  updateSesi(id, fields) {
    const updated = this.updateSesiHalaqoh(id, {
      ...fields,
      mulai: fields.jamMulai || fields.mulai,
      selesai: fields.jamSelesai || fields.selesai,
      jamMulai: fields.jamMulai || fields.mulai,
      jamSelesai: fields.jamSelesai || fields.selesai,
      aktif: fields.status ? fields.status === 'AKTIF' : fields.aktif
    });
    return updated;
  },

  deleteSesi(id) {
    this.deleteSesiHalaqoh(id);
  },

  // ==========================================
  // SIGAP: SISWA (MULTI-BRANCH ISOLATED)
  // ==========================================
  getAllSigapSiswaRaw() {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SIGAP_SISWA);
      if (!raw) return INITIAL_SIGAP_SISWA;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(s => {
          if (!s.pengampu) {
            const init = INITIAL_SIGAP_SISWA.find(i => i.id === s.id);
            return { ...s, pengampu: init?.pengampu || '' };
          }
          return s;
        });
      }
      return INITIAL_SIGAP_SISWA;
    } catch {
      return INITIAL_SIGAP_SISWA;
    }
  },

  getSigapSiswa(branchId = null) {
    const all = this.getAllSigapSiswaRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(s => {
      const sBranch = s.cabangId || (s.unitSekolah?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return sBranch === targetBranch;
    });
  },

  saveSigapSiswa(branchList, branchId = null) {
    const targetBranch = branchId || this.getActiveBranchId();
    const all = this.getAllSigapSiswaRaw();
    const otherBranches = all.filter(s => {
      const sBranch = s.cabangId || (s.unitSekolah?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return sBranch !== targetBranch;
    });
    const updatedBranchList = branchList.map(s => ({
      ...s,
      cabangId: s.cabangId || targetBranch
    }));
    localStorage.setItem(STORAGE_KEYS.SIGAP_SISWA, JSON.stringify([...otherBranches, ...updatedBranchList]));
  },

  addSigapSiswa(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const all = this.getAllSigapSiswaRaw();
    const created = {
      ...item,
      id: item.id || 'ss-' + Date.now(),
      cabangId: targetBranch
    };
    all.push(created);
    localStorage.setItem(STORAGE_KEYS.SIGAP_SISWA, JSON.stringify(all));
    return created;
  },

  updateSigapSiswa(id, fields) {
    const all = this.getAllSigapSiswaRaw();
    const idx = all.findIndex(s => s.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...fields };
      localStorage.setItem(STORAGE_KEYS.SIGAP_SISWA, JSON.stringify(all));
      return all[idx];
    }
    return null;
  },

  deleteSigapSiswa(id) {
    const all = this.getAllSigapSiswaRaw().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SIGAP_SISWA, JSON.stringify(all));
  },

  // ==========================================
  // SIGAP: GURU & PEGAWAI / PENGAMPU (MULTI-BRANCH ISOLATED)
  // ==========================================
  getAllSigapGuruRaw() {
    this.init();
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGAP_GURU)) || INITIAL_SIGAP_GURU;
      let hasChanges = false;
      const pengampuList = this.getAllPengampuRaw();
      const enriched = list.map(g => {
        if (!g.password) {
          hasChanges = true;
          const p = pengampuList.find(x => x.nama === g.nama || x.email === g.email || x.id === g.id);
          return { ...g, password: p ? p.password : 'bismillah123' };
        }
        return g;
      });
      if (hasChanges) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_GURU, JSON.stringify(enriched));
      }
      return enriched;
    } catch {
      return INITIAL_SIGAP_GURU;
    }
  },

  getSigapGuru(branchId = null) {
    const all = this.getAllSigapGuruRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(g => {
      const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return gBranch === targetBranch;
    });
  },

  saveSigapGuru(branchList, branchId = null) {
    const targetBranch = branchId || this.getActiveBranchId();
    const all = this.getAllSigapGuruRaw();
    const otherBranches = all.filter(g => {
      const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return gBranch !== targetBranch;
    });
    const updatedBranchList = branchList.map(g => ({
      ...g,
      cabangId: g.cabangId || targetBranch
    }));
    localStorage.setItem(STORAGE_KEYS.SIGAP_GURU, JSON.stringify([...otherBranches, ...updatedBranchList]));
  },

  addSigapGuru(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const all = this.getAllSigapGuruRaw();
    const created = {
      ...item,
      id: item.id || 'sg-' + Date.now(),
      cabangId: targetBranch,
      username: item.email || item.username || '',
      password: item.password || '123456',
      initial: item.initial || (item.nama ? item.nama.charAt(0).toUpperCase() : 'G'),
      status: item.status || 'GTY',
      avatarBg: item.avatarBg || '#dcfce7'
    };
    all.push(created);
    localStorage.setItem(STORAGE_KEYS.SIGAP_GURU, JSON.stringify(all));

    // Sinkronkan ke daftar akun pengampu agar bisa login langsung
    if (item.email) {
      const pengampuList = this.getAllPengampuRaw();
      const existing = pengampuList.find(p => p.email === item.email || p.nama === item.nama);
      if (!existing) {
        pengampuList.push({
          id: 'u-' + Date.now(),
          cabangId: targetBranch,
          nama: item.nama,
          nip: item.nip || 'NON-NIP',
          username: item.email,
          email: item.email,
          password: item.password || '123456',
          noHp: item.noHp || '',
          halaqahId: 'h-' + Date.now(),
          halaqahNama: 'Halaqah ' + item.nama,
          lokasi: 'Pesantren Persatuan Islam As-Sunnah',
          status: 'Aktif',
          role: 'Pengampu',
          terakhirLogin: 'Baru Didaftarkan'
        });
        localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(pengampuList));
      }
    }

    return created;
  },

  updateSigapGuru(id, fields) {
    const all = this.getAllSigapGuruRaw();
    const idx = all.findIndex(g => g.id === id);
    if (idx !== -1) {
      if (fields.email && !fields.username) {
        fields.username = fields.email;
      }
      all[idx] = { ...all[idx], ...fields };
      localStorage.setItem(STORAGE_KEYS.SIGAP_GURU, JSON.stringify(all));

      // Sinkronkan update akun pengampu
      if (fields.email || fields.password || fields.nama) {
        const pengampuList = this.getAllPengampuRaw();
        const pIdx = pengampuList.findIndex(p => p.email === all[idx].email || p.nama === all[idx].nama);
        if (pIdx !== -1) {
          pengampuList[pIdx] = {
            ...pengampuList[pIdx],
            nama: fields.nama || pengampuList[pIdx].nama,
            email: fields.email || pengampuList[pIdx].email,
            username: fields.email || pengampuList[pIdx].username,
            password: fields.password || pengampuList[pIdx].password,
            noHp: fields.noHp || pengampuList[pIdx].noHp
          };
          localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(pengampuList));
        }
      }

      return all[idx];
    }
    return null;
  },

  deleteSigapGuru(id) {
    const all = this.getAllSigapGuruRaw().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.SIGAP_GURU, JSON.stringify(all));
  },

  // ==========================================
  // SIGAP: ALUMNI (GAMBAR 4)
  // ==========================================
  getAllSigapAlumniRaw() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGAP_ALUMNI)) || INITIAL_SIGAP_ALUMNI;
    } catch {
      return INITIAL_SIGAP_ALUMNI;
    }
  },

  getSigapAlumni(branchId = null) {
    const all = this.getAllSigapAlumniRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(a => (a.cabangId || 'cabang-pusat') === targetBranch);
  },

  saveSigapAlumni(list) {
    localStorage.setItem(STORAGE_KEYS.SIGAP_ALUMNI, JSON.stringify(list));
  },

  addSigapAlumni(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const all = this.getAllSigapAlumniRaw();
    const created = {
      ...item,
      id: item.id || 'sa-' + Date.now(),
      cabangId: targetBranch,
      tahunLulus: item.tahunLulus || '2026'
    };
    all.push(created);
    localStorage.setItem(STORAGE_KEYS.SIGAP_ALUMNI, JSON.stringify(all));
    return created;
  },

  deleteSigapAlumni(id) {
    const all = this.getAllSigapAlumniRaw().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.SIGAP_ALUMNI, JSON.stringify(all));
  },

  // ==========================================
  // SIGAP: DATA KELAS & WALI (MULTI-BRANCH ISOLATED)
  // ==========================================
  getAllSigapKelasRaw() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGAP_KELAS)) || INITIAL_SIGAP_KELAS;
    } catch {
      return INITIAL_SIGAP_KELAS;
    }
  },

  getSigapKelas(branchId = null) {
    const all = this.getAllSigapKelasRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(k => {
      const kBranch = k.cabangId || (k.unitSekolah?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return kBranch === targetBranch;
    });
  },

  saveSigapKelas(branchList, branchId = null) {
    const targetBranch = branchId || this.getActiveBranchId();
    const all = this.getAllSigapKelasRaw();
    const otherBranches = all.filter(k => {
      const kBranch = k.cabangId || (k.unitSekolah?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
      return kBranch !== targetBranch;
    });
    const updatedBranchList = branchList.map(k => ({
      ...k,
      cabangId: k.cabangId || targetBranch
    }));
    localStorage.setItem(STORAGE_KEYS.SIGAP_KELAS, JSON.stringify([...otherBranches, ...updatedBranchList]));
  },

  addSigapKelas(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const all = this.getAllSigapKelasRaw();
    const created = {
      ...item,
      id: item.id || 'k-' + Date.now(),
      cabangId: targetBranch,
      unitSekolah: item.unitSekolah || "MA IHYA' AS-SUNNAH",
      aktif: item.aktif !== undefined ? item.aktif : true
    };
    all.push(created);
    localStorage.setItem(STORAGE_KEYS.SIGAP_KELAS, JSON.stringify(all));
    return created;
  },

  updateSigapKelas(id, fields) {
    const all = this.getAllSigapKelasRaw();
    const idx = all.findIndex(k => k.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...fields };
      localStorage.setItem(STORAGE_KEYS.SIGAP_KELAS, JSON.stringify(all));
      return all[idx];
    }
    return null;
  },

  deleteSigapKelas(id) {
    const all = this.getAllSigapKelasRaw().filter(k => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.SIGAP_KELAS, JSON.stringify(all));
  },

  // ==========================================
  // SIGAP: JADWAL PELAJARAN (GAMBAR 2)
  // ==========================================
  getSigapJadwal() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGAP_JADWAL)) || INITIAL_SIGAP_JADWAL;
    } catch {
      return INITIAL_SIGAP_JADWAL;
    }
  },

  saveSigapJadwal(jadwal) {
    localStorage.setItem(STORAGE_KEYS.SIGAP_JADWAL, JSON.stringify(jadwal));
  },

  // ==========================================
  // SIGAP: QR & LOKASI KELAS (MULTI-BRANCH ISOLATED)
  // ==========================================
  getAllSigapLokasiQRRaw() {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SIGAP_LOKASI_QR);
      if (!raw) return INITIAL_SIGAP_LOKASI_QR;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length < 6) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_LOKASI_QR, JSON.stringify(INITIAL_SIGAP_LOKASI_QR));
        return INITIAL_SIGAP_LOKASI_QR;
      }
      return parsed;
    } catch {
      return INITIAL_SIGAP_LOKASI_QR;
    }
  },

  getSigapLokasiQR(branchId = null) {
    const all = this.getAllSigapLokasiQRRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(l => (l.cabangId || 'cabang-pusat') === targetBranch);
  },

  saveSigapLokasiQR(branchList, branchId = null) {
    const targetBranch = branchId || this.getActiveBranchId();
    const all = this.getAllSigapLokasiQRRaw();
    const otherBranches = all.filter(l => (l.cabangId || 'cabang-pusat') !== targetBranch);
    const updated = branchList.map(l => ({
      ...l,
      cabangId: l.cabangId || targetBranch
    }));
    localStorage.setItem(STORAGE_KEYS.SIGAP_LOKASI_QR, JSON.stringify([...otherBranches, ...updated]));
  },

  addSigapLokasiQR(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const all = this.getAllSigapLokasiQRRaw();
    const created = {
      ...item,
      id: item.id || 'l-' + Date.now(),
      cabangId: targetBranch,
      kodeManual: item.kodeManual || `MAIAS-${(item.kelas || 'X').replace(/\s+/g, '')}`,
      lat: item.lat !== undefined ? Number(parseFloat(String(item.lat).replace(',', '.')).toFixed(6)) : -7.327415,
      lng: item.lng !== undefined ? Number(parseFloat(String(item.lng).replace(',', '.')).toFixed(6)) : 108.215542,
      radiusMeter: item.radiusMeter ? Number(item.radiusMeter) : 50,
      gpsStatus: item.locked ? 'GPS: Locked' : 'GPS: Tidak Wajib'
    };
    all.push(created);
    localStorage.setItem(STORAGE_KEYS.SIGAP_LOKASI_QR, JSON.stringify(all));
    return created;
  },

  updateSigapLokasiQR(id, fields) {
    const all = this.getAllSigapLokasiQRRaw();
    const idx = all.findIndex(l => l.id === id);
    if (idx !== -1) {
      all[idx] = { 
        ...all[idx], 
        ...fields,
        lat: fields.lat !== undefined ? Number(parseFloat(String(fields.lat).replace(',', '.')).toFixed(6)) : all[idx].lat,
        lng: fields.lng !== undefined ? Number(parseFloat(String(fields.lng).replace(',', '.')).toFixed(6)) : all[idx].lng,
        radiusMeter: fields.radiusMeter !== undefined ? Number(fields.radiusMeter) : (all[idx].radiusMeter || 50),
        gpsStatus: (fields.locked !== undefined ? fields.locked : all[idx].locked) ? 'GPS: Locked' : 'GPS: Tidak Wajib'
      };
      localStorage.setItem(STORAGE_KEYS.SIGAP_LOKASI_QR, JSON.stringify(all));
      return all[idx];
    }
    return null;
  },

  deleteSigapLokasiQR(id) {
    const all = this.getAllSigapLokasiQRRaw().filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.SIGAP_LOKASI_QR, JSON.stringify(all));
  },

  // ==========================================
  // SIGAP: PERSETUJUAN IZIN GURU (GAMBAR 5)
  // ==========================================
  getSigapIzinGuru() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SIGAP_IZIN_GURU)) || INITIAL_SIGAP_IZIN_GURU;
    } catch {
      return INITIAL_SIGAP_IZIN_GURU;
    }
  },

  getPendingSigapIzinCount() {
    const list = this.getSigapIzinGuru();
    return list.filter(i => i.status === 'Perlu Persetujuan' || i.status === 'Menunggu' || i.status === 'Menunggu Persetujuan').length;
  },

  // ==========================================
  // SIGAP: NOTIFIKASI AKUN ADMIN
  // ==========================================
  getAdminNotifications() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem('sigap_admin_notifications')) || [];
    } catch {
      return [];
    }
  },

  addAdminNotification(notif) {
    const list = this.getAdminNotifications();
    const entry = {
      id: 'notif-' + Date.now(),
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      dibaca: false,
      ...notif
    };
    list.unshift(entry);
    localStorage.setItem('sigap_admin_notifications', JSON.stringify(list.slice(0, 30)));
    try {
      window.dispatchEvent(new CustomEvent('sigap_admin_notif_updated', { detail: entry }));
    } catch (e) {}
    return entry;
  },

  markAdminNotificationsAsRead() {
    const list = this.getAdminNotifications().map(n => ({ ...n, dibaca: true }));
    localStorage.setItem('sigap_admin_notifications', JSON.stringify(list));
    try {
      window.dispatchEvent(new CustomEvent('sigap_admin_notif_updated'));
    } catch (e) {}
  },

  saveSigapIzinGuru(list) {
    localStorage.setItem(STORAGE_KEYS.SIGAP_IZIN_GURU, JSON.stringify(list));
  },

  addSigapIzinGuru(entry) {
    const list = this.getSigapIzinGuru();
    const newEntry = {
      id: 'iz-' + Date.now(),
      nama: entry.nama || 'Wahyudin Hafiz, S.Pd',
      nip: entry.nip || '19880101201501',
      role: entry.role || 'Pengampu Halaqoh',
      unit: entry.unit || "MA IHYA' AS-SUNNAH",
      halaqahNama: entry.halaqahNama || 'Halaqah Ustadz Wahyudin (X A - Ikhwan)',
      jenisIzin: entry.jenisIzin || 'Sakit',
      tanggal: entry.tanggal || new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      tanggalMulai: entry.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggalSelesai: entry.tanggalSelesai || new Date().toISOString().split('T')[0],
      sesi: entry.sesi || 'Semua Sesi Hari Ini',
      alasan: entry.alasan || '',
      tugasSiswa: entry.tugasSiswa || entry.pelimpahanTugas || "Muroja'ah mandiri dipimpin ketua halaqah",
      guruBadal: entry.guruBadal || 'Ustadz Agus Rinaldi',
      status: 'Perlu Persetujuan',
      catatanAdmin: '',
      dibuatPada: new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')
    };
    list.unshift(newEntry);
    this.saveSigapIzinGuru(list);

    // Kirim notifikasi otomatis ke akun Super Admin
    this.addAdminNotification({
      type: 'izin_pengampu',
      title: `Permohonan Izin: ${newEntry.nama}`,
      message: `${newEntry.nama} mengajukan izin (${newEntry.jenisIzin}) untuk ${newEntry.sesi || 'hari ini'}. Alasan: "${newEntry.alasan || '-'}"`,
      izinId: newEntry.id,
      pengampu: newEntry.nama,
      jenisIzin: newEntry.jenisIzin
    });

    try {
      window.dispatchEvent(new CustomEvent('sigap_izin_updated', { detail: newEntry }));
    } catch (e) {}

    return newEntry;
  },

  updateStatusIzinGuru(id, status, catatanAdmin = '') {
    const list = this.getSigapIzinGuru();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (catatanAdmin) list[idx].catatanAdmin = catatanAdmin;
      this.saveSigapIzinGuru(list);
      try {
        window.dispatchEvent(new CustomEvent('sigap_izin_updated', { detail: list[idx] }));
      } catch (e) {}
      return list[idx];
    }
    return null;
  },

  deleteSigapIzinGuru(id) {
    const list = this.getSigapIzinGuru().filter(i => i.id !== id);
    this.saveSigapIzinGuru(list);
    try {
      window.dispatchEvent(new CustomEvent('sigap_izin_updated'));
    } catch (e) {}
  },

  // ==========================================
  // SIGAP: MONITORING & REKAPITULASI (GAMBAR 4)
  // ==========================================
  getSigapMonitoring() {
    this.init();
    try {
      localStorage.removeItem('sigap_monitoring_v1');
      localStorage.removeItem('sigap_monitoring_v2');
      localStorage.removeItem('sigap_monitoring_v3');
      localStorage.removeItem('sigap_monitoring_v4');
      localStorage.removeItem('sigap_monitoring_v5');

      const raw = localStorage.getItem(STORAGE_KEYS.SIGAP_MONITORING);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_MONITORING, JSON.stringify(INITIAL_SIGAP_MONITORING));
        return INITIAL_SIGAP_MONITORING;
      }
      const data = JSON.parse(raw);
      // Validasi ketat: pastikan hanya data Guru Pengampu Tahfidz resmi (bukan guru mapel sekolah umum)
      const hasInvalidMapel = !data || 
        !data.liveFeed || 
        data.liveFeed.length !== 10 ||
        data.liveFeed.some(f => 
          f.role === 'Guru Mapel' || 
          f.jenis === 'KBM Formal' || 
          ['Muchammad Amir Hadi, S.Pd.I', 'Deden Ramdani, S.Pd', 'Ikhwan Khoirul Kholiq, BA', 'Linda Julianti, S.Pd.', 'Rima Dewi, S.Si', 'Eka Puspitasari, S.Pd'].includes(f.nama) ||
          ['SKI', 'Fiqih Ibadah', 'Aqidah', 'Bahasa Inggris', 'Matematika', 'Khat & Imla\'', 'Shorof', 'Bahasa Arab Dasar', 'Tajwid'].includes(f.mapel) ||
          (f.mapel && !f.mapel.toLowerCase().includes('tahfidz'))
        );

      if (hasInvalidMapel) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_MONITORING, JSON.stringify(INITIAL_SIGAP_MONITORING));
        return INITIAL_SIGAP_MONITORING;
      }

      // Pastikan status pres-10 adalah Alpa jika sesi Subuh sudah terlewati
      let needsSave = false;
      const pres10 = data.liveFeed.find(f => f.id === 'pres-10');
      if (pres10 && pres10.status === 'Belum Absen') {
        pres10.status = 'Alpa';
        pres10.keterangan = 'Alpa (Melewati Batas Waktu Sesi Subuh)';
        data.kpi.alpaKosong = 1;
        data.kpi.belumAbsen = 0;
        data.kpi.totalPresensi = 8;
        needsSave = true;
      }

      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_MONITORING, JSON.stringify(data));
      }

      return data;
    } catch {
      return INITIAL_SIGAP_MONITORING;
    }
  },

  saveSigapMonitoring(data) {
    localStorage.setItem(STORAGE_KEYS.SIGAP_MONITORING, JSON.stringify(data));
  },

  updateStatusPresensiPengampu(id, newStatus, newKeterangan, selisihMenit = 0) {
    const data = this.getSigapMonitoring();
    const idx = data.liveFeed.findIndex(item => item.id === id);
    if (idx !== -1) {
      data.liveFeed[idx].status = newStatus;
      data.liveFeed[idx].keterangan = newKeterangan || newStatus;
      data.liveFeed[idx].selisihMenit = selisihMenit;
      if (newStatus === 'Terlambat' && !data.liveFeed[idx].jam) {
        data.liveFeed[idx].jam = '07.45';
      } else if (newStatus === 'Tepat Waktu' && (!data.liveFeed[idx].jam || data.liveFeed[idx].jam === '-')) {
        data.liveFeed[idx].jam = '07.20';
      }
      this.saveSigapMonitoring(data);
      return data.liveFeed[idx];
    }
    return null;
  },

  resetSigapMonitoringDefault() {
    localStorage.setItem(STORAGE_KEYS.SIGAP_MONITORING, JSON.stringify(INITIAL_SIGAP_MONITORING));
    return INITIAL_SIGAP_MONITORING;
  },

  // ==========================================
  // SIGAP: JADWAL SESI HALAQOH & PRESENSI QR
  // ==========================================
  getJadwalHalaqoh() {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SIGAP_JADWAL_HALAQOH);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_JADWAL_HALAQOH, JSON.stringify(INITIAL_JADWAL_HALAQOH));
        return INITIAL_JADWAL_HALAQOH;
      }
      const parsed = JSON.parse(raw);
      // Ensure complete structure
      if (!parsed.matriks) { parsed.matriks = INITIAL_JADWAL_HALAQOH.matriks; }
      if (!parsed.sesiList || !parsed.hariAktif) {
        localStorage.setItem(STORAGE_KEYS.SIGAP_JADWAL_HALAQOH, JSON.stringify(INITIAL_JADWAL_HALAQOH));
        return INITIAL_JADWAL_HALAQOH;
      }
      return parsed;
    } catch {
      return INITIAL_JADWAL_HALAQOH;
    }
  },

    setHalaqohMatrixCell(sesiId, hari, { status, guru }) {
    const data = this.getJadwalHalaqoh();
    if (!data.matriks) data.matriks = {};
    if (!data.matriks[sesiId]) data.matriks[sesiId] = {};
    data.matriks[sesiId][hari] = { status, guru: guru || '' };
    if (!data.hariAktif) data.hariAktif = {};
    if (!data.hariAktif[hari]) data.hariAktif[hari] = {};
    data.hariAktif[hari][sesiId] = (status === 'Masuk');
    this.saveJadwalHalaqoh(data);
    return data.matriks[sesiId][hari];
  },

  clearHalaqohMatrixCell(sesiId, hari) {
    const data = this.getJadwalHalaqoh();
    if (data.matriks && data.matriks[sesiId]) {
      data.matriks[sesiId][hari] = null;
    }
    if (data.hariAktif && data.hariAktif[hari]) {
      data.hariAktif[hari][sesiId] = false;
    }
    this.saveJadwalHalaqoh(data);
  },

  addSesiHalaqoh(sesi) {
    const data = this.getJadwalHalaqoh();
    const id = sesi.id || 'sesi-' + Date.now();
    const mulai = sesi.mulai || sesi.jamMulai || '05:00';
    const selesai = sesi.selesai || sesi.jamSelesai || '06:30';
    const newSesi = {
      ...sesi,
      id,
      nama: sesi.nama || 'Sesi Baru',
      labelWaktu: sesi.labelWaktu || `${sesi.nama || 'Sesi'} (${mulai} - ${selesai})`,
      icon: sesi.icon || 'Clock',
      mulai,
      selesai,
      jamMulai: mulai,
      jamSelesai: selesai,
      bukaScan: sesi.bukaScan || mulai,
      batasScan: sesi.batasScan || selesai,
      toleransiMenit: sesi.toleransiMenit ?? 15,
      aktif: sesi.aktif !== false && sesi.status !== 'NONAKTIF',
      deskripsi: sesi.deskripsi || ''
    };
    data.sesiList.push(newSesi);
    if (!data.matriks) data.matriks = {};
    data.matriks[id] = {};
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'].forEach(h => {
      data.matriks[id][h] = { status: 'Masuk', guru: '' };
      if (data.hariAktif && data.hariAktif[h]) {
        data.hariAktif[h][id] = true;
      }
    });
    this.saveJadwalHalaqoh(data);
    return newSesi;
  },

  deleteSesiHalaqoh(sesiId) {
    const data = this.getJadwalHalaqoh();
    data.sesiList = data.sesiList.filter(s => s.id !== sesiId);
    if (data.matriks) delete data.matriks[sesiId];
    if (data.hariAktif) {
      Object.keys(data.hariAktif).forEach(h => {
        delete data.hariAktif[h][sesiId];
      });
    }
    if (Array.isArray(data.plottingPengampu)) {
      data.plottingPengampu.forEach(p => {
        if (Array.isArray(p.sesi)) {
          p.sesi = p.sesi.filter(sId => sId !== sesiId);
        }
      });
    }
    this.saveJadwalHalaqoh(data);
  },

  saveJadwalHalaqoh(data) {
    localStorage.setItem(STORAGE_KEYS.SIGAP_JADWAL_HALAQOH, JSON.stringify(data));
    if (data && Array.isArray(data.sesiList)) {
      try {
        localStorage.setItem(STORAGE_KEYS.SESI, JSON.stringify(data.sesiList));
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('sigap_jadwal_updated', { detail: data }));
    }
  },

  updateSesiHalaqoh(sesiId, fields) {
    const data = this.getJadwalHalaqoh();
    const idx = data.sesiList.findIndex(s => s.id === sesiId);
    if (idx !== -1) {
      const existing = data.sesiList[idx];
      const mulai = fields.mulai || fields.jamMulai || existing.mulai || existing.jamMulai || '05:00';
      const selesai = fields.selesai || fields.jamSelesai || existing.selesai || existing.jamSelesai || '06:30';
      const isAktif = fields.aktif !== undefined 
        ? fields.aktif 
        : (fields.status ? fields.status === 'AKTIF' : existing.aktif !== false);

      data.sesiList[idx] = {
        ...existing,
        ...fields,
        mulai,
        selesai,
        jamMulai: mulai,
        jamSelesai: selesai,
        bukaScan: fields.bukaScan || existing.bukaScan || mulai,
        batasScan: fields.batasScan || existing.batasScan || selesai,
        toleransiMenit: fields.toleransiMenit !== undefined ? fields.toleransiMenit : (existing.toleransiMenit ?? 15),
        aktif: isAktif,
        status: isAktif ? 'AKTIF' : 'NONAKTIF'
      };
      this.saveJadwalHalaqoh(data);
      return data.sesiList[idx];
    }
    return null;
  },

  toggleHariSesi(hari, sesiId, isActive) {
    const data = this.getJadwalHalaqoh();
    if (!data.hariAktif[hari]) data.hariAktif[hari] = {};
    data.hariAktif[hari][sesiId] = isActive;
    this.saveJadwalHalaqoh(data);
    return data.hariAktif;
  },

  setHariStatus(hari, isFullLibur) {
    const data = this.getJadwalHalaqoh();
    if (!data.hariAktif[hari]) data.hariAktif[hari] = {};
    data.sesiList.forEach(s => {
      data.hariAktif[hari][s.id] = !isFullLibur;
    });
    this.saveJadwalHalaqoh(data);
    return data.hariAktif;
  },

  addPlottingPengampu(item) {
    const data = this.getJadwalHalaqoh();
    const created = {
      ...item,
      id: item.id || 'plt-' + Date.now()
    };
    data.plottingPengampu = data.plottingPengampu || [];
    data.plottingPengampu.push(created);
    this.saveJadwalHalaqoh(data);
    return created;
  },

  deletePlottingPengampu(id) {
    const data = this.getJadwalHalaqoh();
    if (data.plottingPengampu) {
      data.plottingPengampu = data.plottingPengampu.filter(p => p.id !== id);
      this.saveJadwalHalaqoh(data);
    }
  },

  addLiburKhusus(item) {
    const data = this.getJadwalHalaqoh();
    const created = {
      ...item,
      id: item.id || 'lb-' + Date.now()
    };
    data.liburKhusus = data.liburKhusus || [];
    data.liburKhusus.push(created);
    this.saveJadwalHalaqoh(data);
    return created;
  },

  deleteLiburKhusus(id) {
    const data = this.getJadwalHalaqoh();
    if (data.liburKhusus) {
      data.liburKhusus = data.liburKhusus.filter(l => l.id !== id);
      this.saveJadwalHalaqoh(data);
    }
  },

  // INTEGRASI POSTGRESQL & VPS API
  async checkPostgresConnection() {
    return await apiService.checkHealth();
  },

  async syncToPostgres() {
    const payload = {
      cabang: this.getCabang(),
      pengampu: this.getPengampu(),
      santri: this.getSantri(),
      sesi: this.getSesi(),
      monitoring: (this.getSigapMonitoring() || {}).liveFeed || []
    };
    return await apiService.syncAllToDatabase(payload);
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.SANTRI);
    localStorage.removeItem(STORAGE_KEYS.HALAQAH);
    localStorage.removeItem(STORAGE_KEYS.PENGAMPU);
    localStorage.removeItem(STORAGE_KEYS.SESI);
    localStorage.removeItem(STORAGE_KEYS.SETORAN);
    localStorage.removeItem(STORAGE_KEYS.ABSENSI);
    localStorage.removeItem(STORAGE_KEYS.IZIN);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_SISWA);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_GURU);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_ALUMNI);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_KELAS);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_JADWAL);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_JADWAL_HALAQOH);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_LOKASI_QR);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_IZIN_GURU);
    localStorage.removeItem(STORAGE_KEYS.SIGAP_MONITORING);
    localStorage.removeItem(STORAGE_KEYS.CABANG);
    localStorage.removeItem(STORAGE_KEYS.SUPERADMIN_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_BRANCH_ID);
    this.init();
  }
};
