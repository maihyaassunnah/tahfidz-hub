// Storage Service untuk SIMTAH (Sistem Informasi Manajemen Tahfidz)
// MA Ihya As Sunnah / PPIAS
import apiService from './api.js';

const STORAGE_KEYS = {
  SANTRI: 'simtah_santri_v5_clean',
  HALAQAH: 'simtah_halaqah_v5_clean',
  PENGAMPU: 'simtah_pengampu_v5_clean',
  SESI: 'simtah_sesi_v3',
  SETORAN: 'simtah_setoran_v5_clean',
  ABSENSI: 'simtah_absensi_v5_clean',
  IZIN: 'simtah_izin_v5_clean',
  SETTINGS: 'simtah_settings_v3',
  CURRENT_ROLE: 'simtah_role_v2',
  SELECTED_STUDENT_PARENT: 'simtah_parent_student_v2',
  SIGAP_SISWA: 'sigap_siswa_v5_clean',
  SIGAP_GURU: 'sigap_guru_v5_clean',
  SIGAP_ALUMNI: 'sigap_alumni_v5_clean',
  SIGAP_KELAS: 'sigap_kelas_v5_clean',
  SIGAP_JADWAL: 'sigap_jadwal_v2',
  SIGAP_JADWAL_HALAQOH: 'sigap_jadwal_halaqoh_v2',
  SIGAP_LOKASI_QR: 'sigap_lokasi_qr_v3',
  SIGAP_IZIN_GURU: 'sigap_izin_guru_v5_clean',
  SIGAP_MONITORING: 'sigap_monitoring_v7_clean',
  CABANG: 'simtah_cabang_v1',
  SUPERADMIN_ACCOUNTS: 'simtah_superadmin_accounts_v1',
  ACTIVE_BRANCH_ID: 'simtah_active_branch_v1',
  PENGAMPU_PRESENSI: 'simtah_pengampu_presensi_v5_clean',
  AUTH_USER: 'simtah_auth_user_v2'
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
const INITIAL_PENGAMPU = [];

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
const INITIAL_HALAQAH = [];

// Santri — Disesuaikan dengan Data Siswa SIGAP (semua kelas X-XII)
const INITIAL_SANTRI = [];

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

const INITIAL_SETORAN = [];

// Permohonan Izin Santri
const INITIAL_IZIN = [];

const INITIAL_ABSENSI = [];

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
const INITIAL_SIGAP_SISWA = [];

// GAMBAR 3: DATA GURU & PEGAWAI (PENGAMPU)
const INITIAL_SIGAP_GURU = [];

// GAMBAR 4: DATA ALUMNI
const INITIAL_SIGAP_ALUMNI = [];

// GAMBAR 1 (LANJUTAN): DATA KELAS & WALI
const INITIAL_SIGAP_KELAS = [];

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
const INITIAL_SIGAP_IZIN_GURU = [];

// GAMBAR 4 (LANJUTAN): MONITORING & REKAPITULASI
// GAMBAR 4 (LANJUTAN): MONITORING & REKAPITULASI PRESENSI PENGAMPU HALAQAH
const INITIAL_SIGAP_MONITORING = {
  kpi: {
    totalPresensi: 0,
    tepatWaktu: 0,
    terlambat: 0,
    izinSakit: 0,
    alpaKosong: 0,
    belumAbsen: 0
  },
  rankings: {
    terlambat: [],
    tepatWaktu: [],
    alpa: []
  },
  liveFeed: []
};

// DATA AWAL PRESENSI KEHADIRAN PENGAMPU (HANYA AKUN WAHYUDIN HAFIZ, S.PD)
const INITIAL_PENGAMPU_PRESENSI = [];

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


  // ==========================================
  // AUTENTIKASI & USER SESSION
  // ==========================================
  getAuthUser() {
    this.init();
    try {
      const u = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setAuthUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      if (user.role) {
        this.setCurrentRole(user.role);
      }
      if (user.cabangId && user.cabangId !== 'ALL') {
        this.setActiveBranchId(user.cabangId);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  logout() {
    this.setAuthUser(null);
  },

  authenticate(usernameOrEmail, password) {
    const cleanUser = (usernameOrEmail || '').trim().toLowerCase();

    // 1. Cek Akun Super Admin
    const saList = this.getSuperAdminAccounts();
    const sa = saList.find(a => 
      (a.username?.toLowerCase() === cleanUser || a.email?.toLowerCase() === cleanUser) &&
      a.password === password
    );
    if (sa) {
      const user = {
        id: sa.id,
        nama: sa.nama,
        username: sa.username,
        email: sa.email,
        role: 'superadmin',
        roleLabel: 'Super Admin Cabang',
        cabangId: sa.cabangId || 'cabang-pusat',
        cabangNama: sa.cabangNama || 'MA Ihya As-Sunnah (Pusat)'
      };
      this.setAuthUser(user);
      return { success: true, user };
    }

    // 2. Cek Akun Owner
    if ((cleanUser === 'owner' || cleanUser === 'owner@ihya.sch.id') && password === 'bismillah123') {
      const user = {
        id: 'user-owner',
        nama: 'Pimpinan / Owner Yayasan',
        username: 'owner',
        email: 'owner@ihya.sch.id',
        role: 'owner',
        roleLabel: 'Owner Yayasan',
        cabangId: 'ALL',
        cabangNama: 'Semua Cabang'
      };
      this.setAuthUser(user);
      return { success: true, user };
    }

    // 3. Cek Akun Pengampu
    const pengampuList = this.getAllPengampuRaw();
    const p = pengampuList.find(u => 
      (u.username?.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser || u.nip === cleanUser) &&
      (u.password === password || password === 'bismillah123')
    );
    if (p) {
      const user = {
        id: p.id,
        nama: p.nama,
        username: p.username || 'pengampu',
        email: p.email,
        nip: p.nip,
        role: 'pengampu',
        roleLabel: 'Ustadz Pengampu',
        halaqahId: p.halaqahId,
        cabangId: p.cabangId || 'cabang-pusat'
      };
      this.setAuthUser(user);
      return { success: true, user };
    }

    // 4. Default pengampu fallback
    if ((cleanUser === 'pengampu' || cleanUser === 'ustadz' || cleanUser === 'ustadz.wahyudin' || cleanUser === 'wahyudin') && (password === 'bismillah123' || password === 'pengampu123')) {
      const user = {
        id: 'p-wahyudin',
        nama: 'Ustadz Wahyudin Hafiz, S.Pd',
        username: 'ustadz.wahyudin',
        email: 'wahyudin@ihya.sch.id',
        nip: '19890412201801',
        role: 'pengampu',
        roleLabel: 'Ustadz Pengampu',
        halaqahId: 'hq-1',
        cabangId: 'cabang-pusat'
      };
      this.setAuthUser(user);
      return { success: true, user };
    }

    // 5. Default orang tua fallback
    if ((cleanUser === 'orangtua' || cleanUser === 'wali' || cleanUser === 'wali.santri') && (password === 'bismillah123' || password === 'ortu123')) {
      const user = {
        id: 'user-ortu',
        nama: 'Wali Santri (Orang Tua)',
        username: 'orangtua',
        email: 'wali@ihya.sch.id',
        role: 'orangtua',
        roleLabel: 'Orang Tua / Wali Santri',
        cabangId: 'cabang-pusat'
      };
      this.setAuthUser(user);
      return { success: true, user };
    }

    // 6. Default admin fallback
    if ((cleanUser === 'admin.ma' || cleanUser === 'admin' || cleanUser === 'superadmin') && password === 'bismillah123') {
      const user = {
        id: 'sa-pusat',
        nama: 'Admin MA Ihya As-Sunnah',
        username: 'admin.ma',
        email: 'admin.ma@ihya.sch.id',
        role: 'superadmin',
        roleLabel: 'Super Admin Cabang',
        cabangId: 'cabang-pusat'
      };
      this.setAuthUser(user);
      return { success: true, user };
    }

    return { success: false, message: 'Username/Email atau Password salah!' };
  },

  getGoogleClientId() {
    return localStorage.getItem('simtah_google_client_id') || 
           (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GOOGLE_CLIENT_ID : '') || 
           '960493491749-5qdhgk3e3orfbcqqb1ctdtfvt5r145qi.apps.googleusercontent.com';
  },

  setGoogleClientId(clientId) {
    if (clientId) {
      localStorage.setItem('simtah_google_client_id', clientId.trim());
    } else {
      localStorage.removeItem('simtah_google_client_id');
    }
  },

  authenticateGoogle(googleProfile) {
    const user = {
      id: 'google-' + (googleProfile.sub || Date.now()),
      nama: googleProfile.name || googleProfile.email?.split('@')[0] || 'Pengguna Google',
      email: googleProfile.email,
      foto: googleProfile.picture,
      role: 'superadmin',
      roleLabel: 'Google Verified User',
      cabangId: 'cabang-pusat',
      authProvider: 'google'
    };
    this.setAuthUser(user);
    return { success: true, user };
  },

  // ROLE
  getCurrentRole() {
    this.init();
    const auth = this.getAuthUser();
    if (auth && auth.role) return auth.role;
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || 'superadmin';
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
      halaqah: this.getHalaqah(),
      santri: this.getSantri(),
      sesi: this.getSesi(),
      monitoring: (this.getSigapMonitoring() || {}).liveFeed || []
    };
    return await apiService.syncAllToDatabase(payload);
  },

  async syncFromPostgres() {
    try {
      const res = await apiService.pullAllData();
      if (res && res.success && res.data) {
        const { cabang, pengampu, santri, halaqah, sesi } = res.data;
        if (Array.isArray(cabang) && cabang.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CABANG, JSON.stringify(cabang));
        }
        if (Array.isArray(pengampu) && pengampu.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PENGAMPU, JSON.stringify(pengampu));
        }
        if (Array.isArray(santri) && santri.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SANTRI, JSON.stringify(santri));
        }
        if (Array.isArray(halaqah) && halaqah.length > 0) {
          localStorage.setItem(STORAGE_KEYS.HALAQAH, JSON.stringify(halaqah));
        }
        if (Array.isArray(sesi) && sesi.length > 0) {
          localStorage.setItem(STORAGE_KEYS.SESI, JSON.stringify(sesi));
        }
        return { success: true, message: 'Berhasil mengunduh data terbaru dari PostgreSQL Cloud!' };
      }
      return { success: false, message: 'Data tidak ditemukan di server.' };
    } catch (err) {
      console.error('[STORAGE] Error pulling from postgres:', err);
      return { success: false, message: err.message };
    }
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
