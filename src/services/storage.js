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
  AUTH_USER: 'simtah_auth_user_v2',
  PEMBAYARAN_SPP: 'simtah_pembayaran_spp_v1',
  RAPOR_TEMPLATE: 'simtah_rapor_template_v1',
  NILAI_RAPOR: 'simtah_nilai_rapor_v1'
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
const INITIAL_SUPERADMIN_ACCOUNTS = [];

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

// Santri — Disinkronkan dengan Data Siswa Database PostgreSQL
const INITIAL_SANTRI = [
  {
    id: 'ss-1789300033909',
    nis: '39938383',
    nama: 'Adilla',
    kelas: 'X A',
    halaqahId: 'hq-1',
    status: 'Aktif',
    target: '3 Juz / Tahun',
    kontak: '8747474744',
    wali: 'Joko',
    noHpWali: '8747474744',
    cabangId: 'cabang-pusat',
    totalHalaman: 12,
    rincianHalaman: '12 Hlm 0 Brs',
    juzMutqin: [30],
    juzZiyadah: [29]
  },
  {
    id: 'ss-zaidan-01',
    nis: '20260901',
    nama: 'Zaidan Al-Farisi',
    kelas: 'VII B',
    halaqahId: 'hq-1',
    status: 'Aktif',
    target: '5 Juz',
    kontak: '0812999888',
    wali: 'Farhan',
    cabangId: 'cabang-pusat',
    totalHalaman: 8,
    rincianHalaman: '8 Hlm 0 Brs',
    juzMutqin: [30],
    juzZiyadah: [1]
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

const INITIAL_SETORAN = [];

// Permohonan Izin Santri
const INITIAL_IZIN = [];

const INITIAL_ABSENSI = [];

const INITIAL_SPP = [];

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
    Ahad:   { subuh: true, pagi: true, ashar: true, malam: true }
  },
  plottingPengampu: [],
  liburKhusus: []
};

// GAMBAR 3 (LANJUTAN): QR & LOKASI KELAS (DIMUAT DARI DATABASE)
const INITIAL_SIGAP_LOKASI_QR = [
  {
    id: 'l-1789434655796',
    kelas: 'Masjid Tahfidz',
    lokasi: 'kantor',
    kodeManual: 'KANTOR',
    cabangId: 'cabang-pusat',
    gpsStatus: 'GPS: Standar',
    locked: false,
    lat: -7.327415,
    lng: 108.215542,
    radiusMeter: 100
  },
  {
    id: 'l-xa',
    kelas: 'X A',
    lokasi: 'Ruang Kelas X A Putra',
    kodeManual: 'MAIAS-XA',
    cabangId: 'cabang-pusat',
    gpsStatus: 'GPS: Standar',
    locked: false,
    lat: -7.327415,
    lng: 108.215542,
    radiusMeter: 100
  }
];

// GAMBAR 5 (LANJUTAN): PERSETUJUAN IZIN GURU
const INITIAL_SIGAP_IZIN_GURU = [];

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

// DATA AWAL PRESENSI KEHADIRAN PENGAMPU (DIMUAT DARI DATABASE)
const INITIAL_PENGAMPU_PRESENSI = [];

// TEMPLATE RAPOR AWAL & NILAI RAPOR ASPEK KUALITAS TAHFIDZ
const DEFAULT_RAPOR_TEMPLATE = {
  id: 'tpl-pusat',
  cabangId: 'cabang-pusat',
  namaYayasan: 'YAYASAN IHYA AS SUNNAH TASIKMALAYA',
  namaMadrasah: 'MADRASAH ALIYAH IHYA AS SUNNAH',
  alamat: 'Kompleks Islamic Center PPIAS, Jl. Paseh No. 12, Tasikmalaya, Jawa Barat',
  website: 'www.ma-ihyaassunnah.sch.id',
  email: 'tahfidz@ma-ihyaassunnah.sch.id',
  judulRapor: "LEMBAR EVALUASI & RAPOR TAHFIDZ AL-QUR'AN",
  semester: 'Ganjil 2026/2027',
  namaMudir: "Ust. Hafizhul Qur'an, Al-Hafizh",
  nipMudir: '19850712 201001 1 004',
  tempatTanggal: 'Tasikmalaya',
  aspekPenilaian: [
    { no: 1, nama: 'Kelancaran & Daya Ingat (Al-Hifdz)', keterangan: 'Hafalan lancar, tartil, dan mutqin' },
    { no: 2, nama: 'Ahkamut Tajwid (Hukum Tajwid)', keterangan: "Ghunnah, ikhfa', dan mad diterapkan dengan baik" },
    { no: 3, nama: 'Makharijul Huruf & Shifat (Fashohah)', keterangan: 'Pengucapan huruf jelas dan fasih sesuai kaidah' },
    { no: 4, nama: 'Adab Halaqah & Tilawah', keterangan: 'Menghormati mushaf, ustadz, dan teman halaqah' }
  ]
};

const INITIAL_NILAI_RAPOR = [];

export const storageService = {
  _cache: {
    cabang: [],
    superadmin: [],
    pengampu: [],
    santri: [...INITIAL_SANTRI],
    halaqah: [],
    sesi: [],
    absensi: [],
    setoran: [],
    izin: [],
    spp: [],
    monitoring: [],
    kelas: [],
    alumni: [],
    lokasi_qr: [],
    settings: INITIAL_SETTINGS,
    raporTemplate: DEFAULT_RAPOR_TEMPLATE,
    nilaiRapor: [],
    jadwal: INITIAL_SIGAP_JADWAL,
    jadwalHalaqoh: INITIAL_JADWAL_HALAQOH,
    adminNotifications: [],
    activeBranchId: 'cabang-pusat',
    currentRole: 'superadmin',
    selectedStudentParent: null,
    authUser: null,
    googleClientId: null
  },
  _isInitialized: false,

  emitUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('simtah_data_updated'));
      window.dispatchEvent(new CustomEvent('simtah_santri_updated'));
    }
  },

  init() {
    // Hilangkan seluruh penyimpanan di browser localStorage (Penyimpanan 100% Menggunakan Database PostgreSQL)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.clear();
      } catch (e) {}
    }
  },

  async initFromDatabase() {
    this.init();
    try {
      const res = await apiService.pullAllData();
      if (res && res.success && res.data) {
        const { cabang, superadmin, pengampu, santri, halaqah, sesi, absensi, setoran, izin, spp, monitoring, kelas, alumni, lokasi_qr, settings } = res.data;

        this._cache.cabang = (cabang || []).map(c => ({
          ...c,
          id: c.id,
          nama: c.nama,
          kode: c.kode,
          kota: c.kota,
          alamat: c.alamat,
          noHp: c.no_hp || c.noHp || '',
          penanggungJawab: c.penanggung_jawab || c.penanggungJawab || '',
          email: c.email || '',
          status: c.status || 'Aktif',
          warnaAksen: c.warna_aksen || c.warnaAksen || '#0d9488',
          didirikan: c.didirikan || '2020'
        }));

        this._cache.superadmin = (superadmin || []).map(sa => ({
          ...sa,
          id: sa.id,
          nama: sa.nama,
          username: sa.username,
          password: sa.password,
          role: sa.role || 'Super Admin Cabang',
          cabangId: sa.cabang_id || sa.cabangId || 'cabang-pusat',
          status: sa.status || 'Aktif'
        }));

        this._cache.pengampu = (pengampu || []).map(p => ({
          ...p,
          id: p.id,
          nip: p.nip || '',
          nama: p.nama,
          kontak: p.kontak || p.no_hp || '',
          noHp: p.no_hp || p.noHp || p.kontak || '',
          role: p.role || 'Pengampu Halaqoh',
          halaqahId: p.halaqah_id || p.halaqahId || 'hq-1',
          cabangId: p.cabang_id || p.cabangId || 'cabang-pusat'
        }));

        this._cache.halaqah = (halaqah || []).map(h => ({
          ...h,
          id: h.id,
          nama: h.nama,
          pengampuId: h.pengampu_id || h.pengampuId || '',
          target: h.target || '',
          keterangan: h.keterangan || '',
          cabangId: h.cabang_id || h.cabangId || 'cabang-pusat'
        }));

        this._cache.santri = (santri || []).map(s => ({
          ...s,
          id: s.id,
          nis: s.nis,
          nama: s.nama,
          kelas: s.kelas,
          halaqahId: s.halaqah_id || s.halaqahId || 'hq-1',
          status: s.status || 'Aktif',
          target: s.target || '3 Juz / Tahun',
          kontak: s.kontak || s.no_hp_wali || '',
          wali: s.wali || '',
          noHpWali: s.no_hp_wali || s.noHpWali || s.kontak || '',
          cabangId: s.cabang_id || s.cabangId || 'cabang-pusat',
          totalHalaman: s.totalHalaman || 0,
          rincianHalaman: s.rincianHalaman || '0 Hlm 0 Brs',
          juzMutqin: s.juzMutqin || [],
          juzZiyadah: s.juzZiyadah || []
        }));

        this._cache.sesi = (sesi || []).map(s => ({
          ...s,
          id: s.id,
          nama: s.nama,
          jamMulai: s.jam_mulai || s.jamMulai || '',
          jamSelesai: s.jam_selesai || s.jamSelesai || '',
          toleransiMenit: s.toleransi_menit || s.toleransiMenit || 15,
          hari: s.hari || 'Setiap Hari',
          status: s.status || 'Aktif',
          cabangId: s.cabang_id || s.cabangId || 'cabang-pusat'
        }));

        this._cache.absensi = (absensi || []).map(a => ({
          ...a,
          id: a.id,
          tanggal: a.tanggal ? (typeof a.tanggal === 'string' ? a.tanggal.split('T')[0] : new Date(a.tanggal).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
          sesiId: a.sesi_id || a.sesiId,
          santriId: a.santri_id || a.santriId,
          status: a.status || 'Hadir',
          keterangan: a.keterangan || ''
        }));

        this._cache.setoran = (setoran || []).map(st => ({
          ...st,
          id: st.id,
          tanggal: st.tanggal ? (typeof st.tanggal === 'string' ? st.tanggal.split('T')[0] : new Date(st.tanggal).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
          santriId: st.santri_id || st.santriId,
          pengampuId: st.pengampu_id || st.pengampuId,
          jenis: (st.jenis || 'SABAQ').toUpperCase(),
          surat: st.surat || 'Al-Baqarah',
          surahName: st.surat || st.surahName || 'Al-Baqarah',
          ayatMulai: parseInt(st.ayat_mulai ?? st.ayatMulai ?? 1),
          ayatAwal: parseInt(st.ayat_mulai ?? st.ayatMulai ?? 1),
          ayatSelesai: parseInt(st.ayat_selesai ?? st.ayatSelesai ?? 7),
          ayatAkhir: parseInt(st.ayat_selesai ?? st.ayatSelesai ?? 7),
          nilai: st.nilai || 'Jayyid',
          predikat: (st.nilai || 'JAYYID').toUpperCase(),
          catatan: st.catatan || ''
        }));

        this._cache.izin = (izin || []).map(iz => ({
          ...iz,
          id: iz.id,
          pemohonId: iz.pemohon_id || iz.pemohonId,
          tipePemohon: iz.tipe_pemohon || iz.tipePemohon || 'Pengampu',
          jenis: iz.jenis || 'Izin',
          tanggalMulai: iz.tanggal_mulai ? (typeof iz.tanggal_mulai === 'string' ? iz.tanggal_mulai.split('T')[0] : new Date(iz.tanggal_mulai).toISOString().split('T')[0]) : '',
          tanggalSelesai: iz.tanggal_selesai ? (typeof iz.tanggal_selesai === 'string' ? iz.tanggal_selesai.split('T')[0] : new Date(iz.tanggal_selesai).toISOString().split('T')[0]) : '',
          alasan: iz.alasan || '',
          tugasPengganti: iz.tugas_pengganti || iz.tugasPengganti || '',
          statusApproval: iz.status_approval || iz.statusApproval || 'Menunggu',
          buktiUrl: iz.bukti_url || iz.buktiUrl || null
        }));

        this._cache.spp = (spp || []).map(item => ({
          ...item,
          id: item.id,
          invoiceNo: item.invoice_no || item.invoiceNo,
          santriId: item.santri_id || item.santriId,
          santriNama: item.santri_nama || item.santriNama,
          nis: item.nis,
          kelas: item.kelas,
          cabangId: item.cabang_id || item.cabangId || 'cabang-pusat',
          bulan: item.bulan,
          tahun: item.tahun,
          nominal: item.nominal,
          status: item.status,
          tanggalBayar: item.tanggal_bayar || item.tanggalBayar,
          metodeBayar: item.metode_bayar || item.metodeBayar,
          nomorRef: item.nomor_ref || item.nomorRef,
          catatan: item.catatan,
          namaPetugas: item.nama_petugas || item.namaPetugas
        }));

        this._cache.monitoring = (monitoring || []).map(m => {
          let tglStr = '';
          if (m.tanggal_clean) {
            tglStr = m.tanggal_clean;
          } else if (m.tanggal) {
            if (typeof m.tanggal === 'string' && m.tanggal.length === 10) {
              tglStr = m.tanggal;
            } else {
              try {
                tglStr = new Date(m.tanggal).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
              } catch {
                tglStr = String(m.tanggal).split('T')[0];
              }
            }
          }
          const guruNama = m.namaGuru || m.nama || 'Ustadz Wahyudin Hafiz, S.Pd';
          const pId = m.pengampu_id || m.pengampuId || 'p-1';
          const sNama = m.sesiNama || m.sesi || "Ba'da Subuh";
          const sId = m.sesiId || m.sesi_id || '';
          return {
            ...m,
            id: m.id,
            tanggal: tglStr,
            pengampuId: pId,
            pengampu_id: pId,
            nama: guruNama,
            namaGuru: guruNama,
            nip: m.nip || 'NON-NIP',
            role: m.role || 'Pengampu Halaqoh',
            halaqah: m.halaqah || 'Halaqah Tahfidz',
            mapel: m.mapel || `Tahfidz (${sNama})`,
            kelas: m.kelas || 'Masjid Tahfidz',
            sesi: sNama,
            sesiNama: sNama,
            sesiId: sId,
            sesi_id: sId,
            jadwal: m.jadwal || sNama,
            jam: m.jam || m.jamScan || '-',
            jamScan: m.jamScan || m.jam || '-',
            status: m.status || 'Sudah',
            selisihMenit: m.selisih_menit || m.selisihMenit || 0,
            selisih_menit: m.selisih_menit || m.selisihMenit || 0,
            lokasiGps: m.lokasi_gps || m.lokasiGps,
            lokasi_gps: m.lokasi_gps || m.lokasiGps,
            metode: m.metode || 'QR Scan GPS',
            keterangan: m.keterangan || 'Tepat Waktu',
            alasanIzin: m.alasan_izin || m.alasanIzin,
            tugasSiswa: m.tugas_siswa || m.tugasSiswa,
            manual: !!m.manual
          };
        });

        this._cache.kelas = (kelas || []).map(k => ({
          ...k,
          id: k.id,
          nama: k.nama,
          unitSekolah: k.unit_sekolah || k.unitSekolah || "MA IHYA' AS-SUNNAH",
          waliKelas: k.wali_kelas || k.waliKelas || '',
          cabangId: k.cabang_id || k.cabangId || 'cabang-pusat',
          aktif: k.aktif !== false
        }));

        this._cache.alumni = (alumni || []).map(a => ({
          ...a,
          id: a.id,
          nama: a.nama,
          nik: a.nik || '',
          nisn: a.nisn || '',
          nism: a.nism || '',
          lp: a.lp || 'L',
          tahunLulus: a.tahun_lulus || a.tahunLulus || '2026',
          cabangId: a.cabang_id || a.cabangId || 'cabang-pusat'
        }));

        this._cache.lokasi_qr = (lokasi_qr || []).map(l => ({
          ...l,
          id: l.id,
          kelas: l.kelas,
          lokasi: l.lokasi,
          kodeManual: l.kode_manual || l.kodeManual || '',
          cabangId: l.cabang_id || l.cabangId || 'cabang-pusat',
          gpsStatus: l.gps_status || l.gpsStatus || 'GPS: Locked',
          locked: l.locked !== false,
          lat: l.lat || null,
          lng: l.lng || null,
          radiusMeter: l.radius_meter || l.radiusMeter || 50
        }));

        // 1. Muat Jadwal Halaqoh dari PostgreSQL Settings
        const jadwalSetting = (settings || []).find(st => st.key === 'sigap_jadwal_halaqoh');
        if (jadwalSetting && jadwalSetting.value) {
          try {
            const val = typeof jadwalSetting.value === 'string' ? JSON.parse(jadwalSetting.value) : jadwalSetting.value;
            if (val && typeof val === 'object') {
              this._cache.jadwalHalaqoh = val;
            }
          } catch (e) {
            console.warn('[STORAGE] Parse jadwalHalaqoh error:', e.message);
          }
        }

        // 2. Muat Sesi Absensi dari PostgreSQL Settings
        const absensiSessionsSetting = (settings || []).find(st => st.key === 'simtah_absensi_sessions');
        if (absensiSessionsSetting && absensiSessionsSetting.value) {
          try {
            const val = typeof absensiSessionsSetting.value === 'string' ? JSON.parse(absensiSessionsSetting.value) : absensiSessionsSetting.value;
            if (Array.isArray(val) && val.length > 0) {
              this._cache.absensi = val;
            }
          } catch (e) {
            console.warn('[STORAGE] Parse absensi sessions error:', e.message);
          }
        }

        try {
          const tplRes = await apiService.getRaporTemplate();
          const tplData = tplRes?.data || tplRes;
          if (tplData && (tplData.id || tplData.judul_rapor || tplData.judulRapor)) {
            this._cache.raporTemplate = tplData;
          }
          const nrRes = await apiService.getNilaiRapor();
          const nrData = Array.isArray(nrRes) ? nrRes : (nrRes?.data || []);
          if (Array.isArray(nrData)) {
            this._cache.nilaiRapor = nrData;
          }
        } catch (e) {}

        this._isInitialized = true;
        this.emitUpdate();
        return { success: true, data: this._cache };
      }
    } catch (err) {
      console.warn('[STORAGE] initFromDatabase error:', err.message);
    }
    return { success: false };
  },

  async syncFromPostgres() {
    return this.initFromDatabase();
  },

  async syncWithPostgres() {
    return this.initFromDatabase();
  },

  _cleanName(str) {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/^(ustadz|ustadzah|ust\.|dr\.|drh\.|ir\.|prof\.|kh\.|k\.h\.)\s*/gi, '')
      .replace(/,\s*(s\.pd|lc\.|m\.pd|b\.a\.|m\.ag|s\.th\.i|s\.sos|s\.ag|m\.si|a\.md).*$/gi, '')
      .trim();
  },

  _harmonizeGuruAndPengampu() {
    // Dinonaktifkan: Data pengampu dan guru berasal langsung 100% dari PostgreSQL
  },

  _harmonizeSiswaAndSantri() {
    // Dinonaktifkan: Santri dan Siswa adalah entitas tunggal yang sama langsung dari PostgreSQL
  },

  // ==========================================
  // MULTI-BRANCH (CABANG) MANAGEMENT
  // ==========================================
  getActiveBranchId() {
    this.init();
    if (this._cache.activeBranchId) return this._cache.activeBranchId;
    try {
      const b = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID);
      if (b) {
        this._cache.activeBranchId = b;
        return b;
      }
    } catch (e) {}
    return 'cabang-pusat';
  },

  setActiveBranchId(branchId) {
    this.init();
    this._cache.activeBranchId = branchId;
    try {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH_ID, branchId);
    } catch (e) {}
  },

  getActiveBranch() {
    const list = this.getCabang();
    const activeId = this.getActiveBranchId();
    return list.find(c => c.id === activeId) || list[0] || INITIAL_CABANG[0];
  },

  getCabang() {
    this.init();
    if (this._cache.cabang && this._cache.cabang.length > 0) {
      return this._cache.cabang;
    }
    return INITIAL_CABANG;
  },

  saveCabang(list) {
    this._cache.cabang = list;
    this.emitUpdate();
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
    apiService.saveCabang({
      id: created.id,
      nama: created.nama,
      kode: created.kode || created.id,
      kota: created.kota || 'Tasikmalaya',
      alamat: created.alamat || '',
      no_hp: created.noHp || '',
      penanggung_jawab: created.penanggungJawab || '',
      email: created.email || '',
      status: created.status,
      warna_aksen: created.warnaAksen,
      didirikan: created.didirikan
    }).catch(e => console.warn('[API] saveCabang error:', e.message));
    return created;
  },

  updateCabang(id, fields) {
    const list = this._cache.cabang || [];
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

      apiService.saveCabang({
        id: list[idx].id,
        nama: list[idx].nama,
        kode: list[idx].kode || list[idx].id,
        kota: list[idx].kota || 'Tasikmalaya',
        alamat: list[idx].alamat || '',
        no_hp: list[idx].noHp || '',
        penanggung_jawab: list[idx].penanggungJawab || '',
        email: list[idx].email || '',
        status: list[idx].status,
        warna_aksen: list[idx].warnaAksen,
        didirikan: list[idx].didirikan
      }).catch(e => console.warn('[API] updateCabang error:', e.message));

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
    apiService.deleteCabang(id).catch(e => console.warn('[API] deleteCabang error:', e.message));
    return true;
  },

  // ==========================================
  // SUPER ADMIN ACCOUNTS PER CABANG
  // ==========================================
  getSuperAdminAccounts() {
    this.init();
    return this._cache.superadmin || [];
  },

  saveSuperAdminAccounts(list) {
    this._cache.superadmin = list;
    this.emitUpdate();
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
    apiService.saveSuperadmin({
      id: created.id,
      nama: created.nama,
      username: created.username,
      password: created.password,
      role: created.role,
      cabang_id: created.cabangId || 'cabang-pusat',
      status: created.status
    }).catch(e => console.warn('[API] saveSuperadmin error:', e.message));
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
      apiService.saveSuperadmin({
        id: list[idx].id,
        nama: list[idx].nama,
        username: list[idx].username,
        password: list[idx].password,
        role: list[idx].role,
        cabang_id: list[idx].cabangId || 'cabang-pusat',
        status: list[idx].status
      }).catch(e => console.warn('[API] updateSuperadmin error:', e.message));
      return list[idx];
    }
    return null;
  },

  deleteSuperAdminAccount(id) {
    const list = this.getSuperAdminAccounts().filter(s => s.id !== id);
    this.saveSuperAdminAccounts(list);
    apiService.deleteSuperadmin(id).catch(e => console.warn('[API] deleteSuperadmin error:', e.message));
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
    if (this._cache.authUser) return this._cache.authUser;
    try {
      const u = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (u) {
        const parsed = JSON.parse(u);
        this._cache.authUser = parsed;
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  },

  setAuthUser(user) {
    this._cache.authUser = user;
    if (user) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      } catch (e) {}
      if (user.role) {
        this.setCurrentRole(user.role);
      }
      if (user.cabangId && user.cabangId !== 'ALL') {
        this.setActiveBranchId(user.cabangId);
      }
    } else {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      } catch (e) {}
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

    // 5. Cek Akun Orang Tua / Wali Santri (Username: Nama Lengkap Anak & Password: NIS Anak)
    let santriList = this.getAllSantriRaw();
    if (!santriList || santriList.length === 0) {
      santriList = INITIAL_SANTRI;
    }
    const cleanPass = String(password || '').trim();
    const cleanPassLower = cleanPass.toLowerCase();

    // 5a. Deteksi cepat jika input username adalah keyword peran Orang Tua (contoh: 'orangtua', 'orang tua', 'wali', 'wali santri', 'ortu')
    const isOrangTuaKeyword = ['orangtua', 'orang tua', 'wali', 'wali santri', 'walisantri', 'wali.santri', 'ortu', 'wali-santri'].includes(cleanUser);
    if (isOrangTuaKeyword) {
      const defaultSantri = santriList.find(s => (s.nama || '').toLowerCase() === 'adilla') || santriList[0] || INITIAL_SANTRI[0];
      const user = {
        id: 'ortu-' + defaultSantri.id,
        santriId: defaultSantri.id,
        nis: defaultSantri.nis || defaultSantri.nisn || '39938383',
        namaSantri: defaultSantri.nama,
        nama: 'Wali dari ' + defaultSantri.nama,
        username: defaultSantri.nama,
        email: defaultSantri.kontak || defaultSantri.noHpWali || 'wali@ihya.sch.id',
        role: 'orangtua',
        roleLabel: 'Wali Santri - ' + defaultSantri.nama,
        cabangId: defaultSantri.cabangId || 'cabang-pusat',
        halaqahId: defaultSantri.halaqahId || defaultSantri.halaqah_id || 'hq-1'
      };
      this.setParentSelectedStudent(defaultSantri.id);
      this.setAuthUser(user);
      return { success: true, user };
    }

    // 5b. Deteksi berdasarkan Nama Lengkap dan NIS Anak
    const matchedSantri = santriList.find(s => {
      const sNama = (s.nama || '').trim().toLowerCase();
      const sNis = String(s.nis || '').trim();
      const sNisn = String(s.nisn || '').trim();

      if (!sNama) return false;

      // Kasus 1: Input username = Nama Lengkap Anak, password = NIS / NISN
      const nameMatchesUser = sNama === cleanUser || sNama.includes(cleanUser) || cleanUser.includes(sNama);
      const nisMatchesPass = (sNis && sNis === cleanPass) || (sNisn && sNisn === cleanPass);
      if (nameMatchesUser && nisMatchesPass) return true;

      // Kasus 2: Input username = NIS, password = Nama Lengkap Anak (toleran jika ortu menukar field)
      const nisMatchesUser = (sNis && sNis === cleanUser) || (sNisn && sNisn === cleanUser);
      const nameMatchesPass = sNama === cleanPassLower || sNama.includes(cleanPassLower) || cleanPassLower.includes(sNama);
      if (nisMatchesUser && nameMatchesPass) return true;

      // Kasus 3: Password master key bismillah123 / ortu123
      if (nameMatchesUser && (cleanPass === 'bismillah123' || cleanPass === 'ortu123' || !cleanPass)) return true;
      if (nisMatchesUser && (cleanPass === 'bismillah123' || cleanPass === 'ortu123' || !cleanPass)) return true;

      return false;
    });

    if (matchedSantri) {
      const user = {
        id: 'ortu-' + matchedSantri.id,
        santriId: matchedSantri.id,
        nis: matchedSantri.nis || matchedSantri.nisn || '39938383',
        namaSantri: matchedSantri.nama,
        nama: 'Wali dari ' + matchedSantri.nama,
        username: matchedSantri.nama,
        email: matchedSantri.kontak || matchedSantri.noHpWali || 'wali@ihya.sch.id',
        role: 'orangtua',
        roleLabel: 'Wali Santri - ' + matchedSantri.nama,
        cabangId: matchedSantri.cabangId || 'cabang-pusat',
        halaqahId: matchedSantri.halaqahId || matchedSantri.halaqah_id || 'hq-1'
      };
      this.setParentSelectedStudent(matchedSantri.id);
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
    if (this._cache.googleClientId) return this._cache.googleClientId;
    try {
      const id = sessionStorage.getItem('simtah_google_client_id');
      if (id) {
        this._cache.googleClientId = id;
        return id;
      }
    } catch (e) {}
    return (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GOOGLE_CLIENT_ID : '') || 
           '960493491749-5qdhgk3e3orfbcqqb1ctdtfvt5r145qi.apps.googleusercontent.com';
  },

  setGoogleClientId(clientId) {
    this._cache.googleClientId = clientId ? clientId.trim() : null;
    try {
      if (clientId) {
        sessionStorage.setItem('simtah_google_client_id', clientId.trim());
      } else {
        sessionStorage.removeItem('simtah_google_client_id');
      }
    } catch (e) {}
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
    if (this._cache.currentRole) return this._cache.currentRole;
    try {
      const r = sessionStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
      if (r) {
        this._cache.currentRole = r;
        return r;
      }
    } catch (e) {}
    return 'superadmin';
  },

  setCurrentRole(role) {
    this._cache.currentRole = role;
    try {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
    } catch (e) {}
  },

  getParentSelectedStudent() {
    this.init();
    if (this._cache.selectedStudentParent) return this._cache.selectedStudentParent;
    try {
      const s = sessionStorage.getItem(STORAGE_KEYS.SELECTED_STUDENT_PARENT);
      if (s) {
        this._cache.selectedStudentParent = s;
        return s;
      }
    } catch (e) {}
    const firstSantri = this._cache.santri?.[0]?.id;
    return firstSantri || 'ss-1789300033909';
  },

  setParentSelectedStudent(id) {
    this._cache.selectedStudentParent = id;
    try {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_STUDENT_PARENT, id);
    } catch (e) {}
  },

  // SANTRI (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getAllSantriRaw() {
    return this._cache.santri || [];
  },

  getSantri(branchId = null) {
    const all = this.getAllSantriRaw();
    if (!branchId || branchId === 'ALL') return all;
    return all.filter(s => (s.cabangId || 'cabang-pusat') === branchId);
  },

  saveSantri(santriData) {
    const item = { ...santriData };
    item.nis = item.nis || item.nisn || '';
    item.nisn = item.nisn || item.nis || '';
    item.kontak = item.kontak || item.kontakWali || '';
    item.noHpWali = item.noHpWali || item.kontakWali || item.no_hp_wali || item.kontak || '';
    item.kontakWali = item.kontakWali || item.noHpWali || item.kontak || '';
    item.target = item.target || '3 Juz / Tahun';
    item.status = item.status || 'Aktif';
    item.cabangId = item.cabangId || item.cabang_id || this.getActiveBranchId();

    const list = this._cache.santri || [];
    const idx = list.findIndex(s => s.id === item.id || (s.nis && item.nis && String(s.nis) === String(item.nis)));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.push(item);
    }
    this._cache.santri = list;
    this.emitUpdate();

    // Persist ke database PostgreSQL
    apiService.saveSantri({
      id: item.id,
      nis: item.nis,
      nama: item.nama,
      kelas: item.kelas,
      halaqah_id: item.halaqahId || item.halaqah_id || null,
      status: item.status || 'Aktif',
      target: item.target,
      kontak: item.kontak,
      wali: item.wali || '',
      no_hp_wali: item.noHpWali,
      cabang_id: item.cabangId
    }).catch(e => console.warn('[API] saveSantri error:', e.message));

    return item;
  },

  addSantri(newSantri) {
    const targetBranch = newSantri.cabangId || this.getActiveBranchId();
    const created = {
      ...newSantri,
      id: newSantri.id || ('ss-' + Date.now()),
      cabangId: targetBranch,
      totalHalaman: 0,
      rincianHalaman: '0 Hlm 0 Brs',
      juzMutqin: newSantri.juzMutqin || [],
      juzZiyadah: newSantri.juzZiyadah || []
    };
    return this.saveSantri(created);
  },

  updateSantri(id, updatedFields) {
    const list = this._cache.santri || [];
    const idx = list.findIndex(s => s.id === id || (s.nis && String(s.nis) === String(id)));
    if (idx !== -1) {
      const merged = { ...list[idx], ...updatedFields };
      merged.nis = merged.nis || merged.nisn || '';
      merged.nisn = merged.nisn || merged.nis || '';
      merged.kontak = merged.kontak || merged.kontakWali || '';
      merged.noHpWali = merged.noHpWali || merged.kontakWali || merged.kontak || '';
      merged.kontakWali = merged.kontakWali || merged.noHpWali || merged.kontak || '';
      list[idx] = merged;
      this._cache.santri = list;
      this.emitUpdate();

      apiService.saveSantri({
        id: list[idx].id,
        nis: list[idx].nis,
        nama: list[idx].nama,
        kelas: list[idx].kelas,
        halaqah_id: list[idx].halaqahId || list[idx].halaqah_id || null,
        status: list[idx].status || 'Aktif',
        target: list[idx].target,
        kontak: list[idx].kontak,
        wali: list[idx].wali || '',
        no_hp_wali: list[idx].noHpWali,
        cabang_id: list[idx].cabangId
      }).catch(e => console.warn('[API] updateSantri error:', e.message));

      return list[idx];
    }
    return null;
  },

  deleteSantri(id) {
    if (!id) return;
    const strId = String(id).trim();
    const rawAllSantri = this._cache.santri || [];

    const targetSantri = rawAllSantri.find(s => s.id === strId || (s.nis && String(s.nis) === strId));
    const targetNis = targetSantri ? String(targetSantri.nis || '') : '';
    const altId1 = strId.startsWith('ss-') ? strId.replace('ss-', 's-') : (strId.startsWith('s-') ? strId.replace('s-', 'ss-') : strId);
    const altId2 = strId.replace(/^s{1,2}-/, '');

    const isMatch = (item) => {
      if (!item) return false;
      const itemId = String(item.id || '');
      if (itemId === strId || itemId === altId1 || itemId === altId2) return true;
      if (targetSantri && itemId === String(targetSantri.id || '')) return true;
      if (targetNis && String(item.nis || '') === targetNis) return true;
      if (targetSantri?.nama && item.nama && item.nama.trim().toLowerCase() === targetSantri.nama.trim().toLowerCase()) return true;
      return false;
    };

    // 1. Hapus dari in-memory cache santri
    this._cache.santri = rawAllSantri.filter(s => !isMatch(s));

    // 2. Bersihkan riwayat setoran & absensi & spp santri ini dari cache
    this._cache.setoran = (this._cache.setoran || []).filter(st => {
      const sId = String(st.santriId || st.santri_id || '');
      return sId !== strId && sId !== altId1 && sId !== altId2 && (!targetSantri || sId !== String(targetSantri.id));
    });
    this._cache.absensi = (this._cache.absensi || []).filter(ab => {
      const sId = String(ab.santriId || ab.santri_id || '');
      return sId !== strId && sId !== altId1 && sId !== altId2 && (!targetSantri || sId !== String(targetSantri.id));
    });
    this._cache.spp = (this._cache.spp || []).filter(sp => {
      const sId = String(sp.santriId || sp.santri_id || '');
      return sId !== strId && sId !== altId1 && sId !== altId2 && (!targetSantri || sId !== String(targetSantri.id));
    });

    // 3. Hapus langsung dari database PostgreSQL via API
    apiService.deleteSantri(id).catch(e => console.warn('[API] deleteSantri error:', e.message));
    if (altId1 && altId1 !== id) {
      apiService.deleteSantri(altId1).catch(() => {});
    }
    if (targetSantri && targetSantri.id && targetSantri.id !== id && targetSantri.id !== altId1) {
      apiService.deleteSantri(targetSantri.id).catch(() => {});
    }

    // 4. Trigger emit update
    this.emitUpdate();
    return true;
  },

  // HALAQAH (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getAllHalaqahRaw() {
    return this._cache.halaqah || [];
  },

  getHalaqah(branchId = null) {
    const all = this.getAllHalaqahRaw();
    if (!branchId || branchId === 'ALL') return all;
    return all.filter(h => (h.cabangId || 'cabang-pusat') === branchId);
  },

  saveHalaqah(list) {
    this._cache.halaqah = list;
    this.emitUpdate();
  },

  addHalaqah(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const list = this._cache.halaqah || [];
    const created = {
      ...item,
      id: item.id || ('hq-' + Date.now()),
      nama: item.nama || 'Halaqah Baru',
      pengampuId: item.pengampuId || '',
      target: item.target || item.targetJuz || '30',
      keterangan: item.keterangan || item.level || 'Dasar',
      cabangId: targetBranch
    };
    list.push(created);
    this._cache.halaqah = list;
    this.emitUpdate();
    apiService.saveHalaqah({
      id: created.id,
      nama: created.nama,
      pengampu_id: created.pengampuId,
      target: created.target,
      keterangan: created.keterangan,
      cabang_id: created.cabangId
    }).catch(e => console.warn('[API] saveHalaqah error:', e.message));
    return created;
  },

  updateHalaqah(id, fields) {
    const list = this._cache.halaqah || [];
    const idx = list.findIndex(h => h.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this._cache.halaqah = list;
      this.emitUpdate();
      apiService.saveHalaqah({
        id: list[idx].id,
        nama: list[idx].nama,
        pengampu_id: list[idx].pengampuId,
        target: list[idx].target,
        keterangan: list[idx].keterangan,
        cabang_id: list[idx].cabangId
      }).catch(e => console.warn('[API] updateHalaqah error:', e.message));
      return list[idx];
    }
    return null;
  },

  deleteHalaqah(id) {
    this._cache.halaqah = (this._cache.halaqah || []).filter(h => h.id !== id);
    this.emitUpdate();
    apiService.deleteHalaqah(id).catch(e => console.warn('[API] deleteHalaqah error:', e.message));
    return true;
  },

  // SETORAN (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getAllSetoranRaw() {
    return this._cache.setoran || [];
  },

  getSetoran(branchId = null) {
    const all = this.getAllSetoranRaw();
    if (!branchId || branchId === 'ALL') return all;
    return all.filter(s => (s.cabangId || 'cabang-pusat') === branchId);
  },

  getTotalSetoranCount(branchId = null) {
    const list = this.getSetoran(branchId);
    return list.length;
  },

  addSetoran(entry) {
    const targetBranch = entry.cabangId || this.getActiveBranchId();
    const list = this._cache.setoran || [];
    const newEntry = {
      ...entry,
      id: entry.id || ('set-' + Date.now()),
      cabangId: targetBranch,
      tanggal: entry.tanggal || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    list.unshift(newEntry);
    this._cache.setoran = list;

    // Update santri mutqin / ziyadah
    if (entry.juz && entry.santriId) {
      const allSantri = this._cache.santri || [];
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
      }
    }

    this.emitUpdate();

    apiService.saveSetoran({
      id: newEntry.id,
      tanggal: newEntry.tanggal,
      santri_id: newEntry.santriId || newEntry.santri_id || 's-1',
      santriNama: newEntry.santriNama || (this.getAllSantriRaw().find(s => s.id === (newEntry.santriId || newEntry.santri_id))?.nama) || '',
      pengampu_id: newEntry.pengampuId || newEntry.pengampu_id || null,
      jenis: newEntry.jenis || 'SABAQ',
      surat: newEntry.surahName || newEntry.surat || 'Al-Baqarah',
      ayat_mulai: newEntry.ayatAwal || newEntry.ayat_mulai || 1,
      ayat_selesai: newEntry.ayatAkhir || newEntry.ayat_selesai || 7,
      nilai: newEntry.nilai || newEntry.predikat || 'Jayyid',
      catatan: newEntry.catatan || newEntry.catatanTajwid || ''
    }).catch(e => console.warn('[API] saveSetoran error:', e.message));

    return newEntry;
  },

  updateSetoran(id, fields) {
    const list = this._cache.setoran || [];
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this._cache.setoran = list;
      this.emitUpdate();

      apiService.saveSetoran({
        id: list[idx].id,
        tanggal: list[idx].tanggal,
        santri_id: list[idx].santriId || list[idx].santri_id || 's-1',
        pengampu_id: list[idx].pengampuId || list[idx].pengampu_id || null,
        jenis: list[idx].jenis || 'Ziyadah',
        surat: list[idx].surahName || list[idx].surat || 'Al-Fatihah',
        ayat_mulai: list[idx].ayatAwal || list[idx].ayat_mulai || 1,
        ayat_selesai: list[idx].ayatAkhir || list[idx].ayat_selesai || 7,
        nilai: list[idx].nilai || 'Mumtaz',
        catatan: list[idx].catatan || ''
      }).catch(e => console.warn('[API] updateSetoran error:', e.message));

      return list[idx];
    }
    return null;
  },

  deleteSetoran(id) {
    this._cache.setoran = (this._cache.setoran || []).filter(item => item.id !== id);
    this.emitUpdate();
    apiService.deleteSetoran(id).catch(e => console.warn('[API] deleteSetoran error:', e.message));
  },

  // ABSENSI (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getAllAbsensiRaw() {
    return this._cache.absensi || [];
  },

  getAbsensi(branchId = null) {
    const all = this.getAllAbsensiRaw();
    if (!branchId || branchId === 'ALL') return all;
    return all.filter(a => (a.cabangId || 'cabang-pusat') === branchId);
  },

  saveAbsensiRecord(tanggal, halaqahId, records, catatanHalaqah = "", sesiId = 'subuh', sesiNama = null) {
    const targetBranch = this.getActiveBranchId();
    const list = this._cache.absensi || [];
    const existingIndex = list.findIndex(a => 
      a.tanggal === tanggal && 
      a.halaqahId === halaqahId && 
      (a.sesiId === sesiId || (!a.sesiId && (sesiId === 'subuh' || !sesiId)))
    );
    const newRecord = {
      id: (existingIndex !== -1 && list[existingIndex].id) ? list[existingIndex].id : ('abs-' + Date.now()),
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
      list[existingIndex] = newRecord;
    } else {
      list.unshift(newRecord);
    }
    this._cache.absensi = list;
    this.emitUpdate();

    // 1. Simpan setiap kehadiran santri ke tabel absensi_santri di database PostgreSQL
    const batchRecords = [];
    if (records && typeof records === 'object') {
      Object.entries(records).forEach(([santriId, rec]) => {
        const st = typeof rec === 'string' ? rec : (rec?.status || 'H');
        const ket = typeof rec === 'object' ? (rec?.catatan || rec?.keterangan || '') : '';
        const fullStatus = st === 'H' ? 'Hadir' : st === 'I' ? 'Izin' : st === 'S' ? 'Sakit' : (st === 'A' ? 'Alpa' : st);
        batchRecords.push({
          id: `abs-${tanggal}-${sesiId || 'subuh'}-${santriId}`,
          tanggal,
          sesi_id: sesiId || 'sesi-1',
          santri_id: santriId,
          status: fullStatus,
          keterangan: ket
        });
      });
    }

    if (batchRecords.length > 0) {
      apiService.saveAbsensiSantriBatch(batchRecords).catch(e => console.warn('[API] saveAbsensiSantriBatch error:', e.message));
    }

    // 2. Simpan juga struktur sesi ke PostgreSQL settings agar tidak hilang saat reload
    apiService.saveSettings({
      key: 'simtah_absensi_sessions',
      value: list
    }).catch(e => console.warn('[API] saveSettings absensi error:', e.message));

    return newRecord;
  },

  addAbsensiRecord(entry) {
    const list = this._cache.absensi || [];
    const created = {
      ...entry,
      id: entry.id || ('abs-' + Date.now()),
      tanggal: entry.tanggal || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    list.unshift(created);
    this._cache.absensi = list;
    this.emitUpdate();

    apiService.saveAbsensi({
      id: created.id,
      tanggal: created.tanggal,
      sesi_id: created.sesiId || 'sesi-shubuh',
      santri_id: created.santriId || 's-1',
      status: created.status || 'Hadir',
      keterangan: created.keterangan || ''
    }).catch(e => console.warn('[API] saveAbsensi error:', e.message));
    return created;
  },

  updateAbsensiRecord(id, fields) {
    const list = this._cache.absensi || [];
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this._cache.absensi = list;
      this.emitUpdate();

      apiService.saveAbsensi({
        id: list[idx].id,
        tanggal: list[idx].tanggal,
        sesi_id: list[idx].sesiId || 'sesi-shubuh',
        santri_id: list[idx].santriId || 's-1',
        status: list[idx].status || 'Hadir',
        keterangan: list[idx].keterangan || ''
      }).catch(e => console.warn('[API] updateAbsensi error:', e.message));
      return list[idx];
    }
    return null;
  },

  deleteAbsensiRecord(id) {
    this._cache.absensi = (this._cache.absensi || []).filter(item => item.id !== id);
    this.emitUpdate();
    apiService.deleteAbsensi(id).catch(e => console.warn('[API] deleteAbsensi error:', e.message));
    apiService.saveSettings({
      key: 'simtah_absensi_sessions',
      value: this._cache.absensi
    }).catch(() => {});
  },

  scanPresensiSantri(santriId, tanggal = today, sesi = "Ba'da Subuh") {
    const list = this._cache.absensi || [];
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

    this._cache.absensi = list;
    this.emitUpdate();
    return { success: true, jamScan: nowTime };
  },

  // ==========================================
  // PRESENSI KEHADIRAN GURU PENGAMPU (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getPengampuPresensiList() {
    return this._cache.monitoring || [];
  },

  // Helper mendapatkan tanggal hari ini dalam format YYYY-MM-DD (Zona Waktu Indonesia/Jakarta)
  getTodayISO() {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  },

  isPengampuSudahScan(namaGuru = 'Wahyudin Hafiz, S.Pd', sesiIdOrNama = 'subuh', tanggal = null) {
    const list = this._cache.monitoring || [];
    const todayISO = tanggal || this.getTodayISO();
    const cleanTarget = String(sesiIdOrNama || '').toLowerCase().trim();
    const cleanGuru = this._cleanName(namaGuru);

    const record = list.find(item => {
      // 1. Bandingkan tanggal hari ini
      const itemTgl = item.tanggal ? (typeof item.tanggal === 'string' && item.tanggal.length === 10 ? item.tanggal : String(item.tanggal).split('T')[0]) : '';
      if (itemTgl && itemTgl !== todayISO) return false;

      // 2. Bandingkan nama guru
      if (cleanGuru) {
        const itemGuru = this._cleanName(item.namaGuru || item.nama);
        if (itemGuru && itemGuru !== cleanGuru && !itemGuru.includes(cleanGuru) && !cleanGuru.includes(itemGuru)) {
          return false;
        }
      }

      // 3. Bandingkan sesi (fleksibel: id, nama, atau substring)
      if (cleanTarget === 'semua') return true;
      const sId = String(item.sesiId || item.sesi_id || '').toLowerCase().trim();
      const sNama = String(item.sesiNama || item.sesi || '').toLowerCase().trim();

      return sId === cleanTarget || 
             sNama === cleanTarget || 
             (cleanTarget && sId.includes(cleanTarget)) || 
             (cleanTarget && cleanTarget.includes(sId)) || 
             (cleanTarget && sNama.includes(cleanTarget)) || 
             (cleanTarget && cleanTarget.includes(sNama));
    });

    if (record) {
      return {
        sudah: true,
        status: record.status || 'Sudah',
        jamScan: record.jamScan || record.jam || '-',
        lokasi: record.kelas || record.lokasi || '',
        keterangan: record.keterangan || 'Tepat Waktu'
      };
    }

    return { sudah: false, status: 'Belum' };
  },

  scanPresensiPengampu(namaGuru, targetLokasi, sesiNama, sesiId = null) {
    const now = new Date();
    const nowTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(':', '.');
    const todayISO = this.getTodayISO();

    const pengampuList = this.getAllPengampuRaw();
    const cleanG = this._cleanName(namaGuru);
    const matchedP = pengampuList.find(p => p.nama === namaGuru || this._cleanName(p.nama) === cleanG) || {
      id: 'p-1',
      nama: namaGuru || 'Ustadz Wahyudin Hafiz, S.Pd',
      nip: 'NON-NIP',
      role: 'Pengampu Halaqoh',
      halaqahNama: 'Halaqah Tahfidz'
    };

    const actualGuruNama = namaGuru || matchedP.nama || 'Ustadz Wahyudin Hafiz, S.Pd';
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

    const newFeed = {
      id: 'pres-' + Date.now(),
      nama: actualGuruNama,
      namaGuru: actualGuruNama,
      pengampuId: matchedP.id || 'p-1',
      pengampu_id: matchedP.id || 'p-1',
      nip: matchedP.nip || 'NON-NIP',
      role: matchedP.role || 'Pengampu Halaqoh',
      jenis: 'Halaqah Tahfidz',
      jam: nowTime,
      jamScan: nowTime,
      tanggal: todayISO,
      sesi: finalSesiNama,
      sesiNama: finalSesiNama,
      sesiId: finalSesiId,
      sesi_id: finalSesiId,
      jadwal: finalSesiNama,
      mapel: `Tahfidz (${finalSesiNama})`,
      kelas: lokasiKode || 'Masjid Tahfidz',
      status: status,
      selisihMenit: lateMinutes,
      selisih_menit: lateMinutes,
      keterangan: keterangan,
      metode: 'QR Scan (GPS Locked)',
      lokasiGps: `${lokasiKode || 'Lokasi Terverifikasi'} (Akurat)`,
      lokasi_gps: `${lokasiKode || 'Lokasi Terverifikasi'} (Akurat)`,
      manual: false
    };

    const monList = this._cache.monitoring || [];
    const existingIdx = monList.findIndex(
      f => (this._cleanName(f.namaGuru || f.nama) === cleanG || f.pengampuId === matchedP.id) &&
           (f.sesiId === finalSesiId || f.sesi === finalSesiNama || (f.sesi || '').toLowerCase().includes((finalSesiNama || '').toLowerCase())) &&
           f.tanggal === todayISO
    );
    if (existingIdx !== -1) {
      monList[existingIdx] = { ...monList[existingIdx], ...newFeed };
    } else {
      monList.unshift(newFeed);
    }
    this._cache.monitoring = monList;
    this.emitUpdate();

    if (typeof apiService.saveMonitoringPresensi === 'function') {
      apiService.saveMonitoringPresensi(newFeed).catch(err => console.warn('[API] sync monitoring error:', err.message));
    } else if (typeof apiService.saveMonitoring === 'function') {
      apiService.saveMonitoring(newFeed).catch(err => console.warn('[API] sync monitoring error:', err.message));
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

  // PERMOHONAN IZIN (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getIzin() {
    return this._cache.izin || [];
  },

  getAllIzinRaw() {
    return this._cache.izin || [];
  },

  getAllSigapIzinRaw() {
    return this._cache.izin || [];
  },

  addIzin(data) {
    const list = this._cache.izin || [];
    const created = {
      ...data,
      id: data.id || ('iz-' + Date.now()),
      status: data.status || 'Menunggu',
      dibuatPada: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    list.unshift(created);
    this._cache.izin = list;
    this.emitUpdate();

    apiService.saveIzin({
      id: created.id,
      pemohon_id: created.pemohonId || created.pemohon_id || 'p-umum',
      tipe_pemohon: created.tipePemohon || 'Pengampu',
      jenis: created.jenis || 'Izin',
      tanggal_mulai: created.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggal_selesai: created.tanggalSelesai || new Date().toISOString().split('T')[0],
      alasan: created.alasan || '',
      tugas_pengganti: created.tugasPengganti || '-',
      status_approval: created.status || 'Menunggu',
      bukti_url: created.buktiUrl || null
    }).catch(e => console.warn('[API] saveIzin error:', e.message));
    return created;
  },

  updateIzin(id, fields) {
    const list = this._cache.izin || [];
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this._cache.izin = list;
      this.emitUpdate();

      apiService.saveIzin({
        id: list[idx].id,
        pemohon_id: list[idx].pemohonId || list[idx].pemohon_id || 'p-umum',
        tipe_pemohon: list[idx].tipePemohon || 'Pengampu',
        jenis: list[idx].jenis || 'Izin',
        tanggal_mulai: list[idx].tanggalMulai,
        tanggal_selesai: list[idx].tanggalSelesai,
        alasan: list[idx].alasan || '',
        tugas_pengganti: list[idx].tugasPengganti || '-',
        status_approval: list[idx].status || list[idx].statusApproval || 'Menunggu',
        bukti_url: list[idx].buktiUrl || null
      }).catch(e => console.warn('[API] updateIzin error:', e.message));
      return list[idx];
    }
    return null;
  },

  deleteIzin(id) {
    this._cache.izin = (this._cache.izin || []).filter(item => item.id !== id);
    this.emitUpdate();
    apiService.deleteIzin(id).catch(e => console.warn('[API] deleteIzin error:', e.message));
  },

  updateStatusIzin(id, status, catatanUstadz = "") {
    const list = this._cache.izin || [];
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (catatanUstadz) list[idx].catatanUstadz = catatanUstadz;
      this._cache.izin = list;
      this.emitUpdate();

      apiService.saveIzin({
        id: list[idx].id,
        pemohon_id: list[idx].pemohonId || list[idx].pemohon_id || 'p-umum',
        tipe_pemohon: list[idx].tipePemohon || 'Pengampu',
        jenis: list[idx].jenis || 'Izin',
        tanggal_mulai: list[idx].tanggalMulai,
        tanggal_selesai: list[idx].tanggalSelesai,
        alasan: list[idx].alasan || '',
        tugas_pengganti: list[idx].tugasPengganti || '-',
        status_approval: status,
        bukti_url: list[idx].buktiUrl || null
      }).catch(e => console.warn('[API] updateStatusIzin error:', e.message));

      return list[idx];
    }
    return null;
  },

  // SETTINGS (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getSettings() {
    return this._cache.settings || INITIAL_SETTINGS;
  },

  saveSettings(settings) {
    this._cache.settings = settings;
    this.emitUpdate();
    apiService.saveSettings([{ key: 'app_settings', value: settings }]).catch(e => console.warn('[API] saveSettings error:', e.message));
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
      if (data.halaqah) { this._cache.halaqah = data.halaqah; }
      if (data.setoran) { this._cache.setoran = data.setoran; }
      if (data.absensi) { this._cache.absensi = data.absensi; }
      if (data.izin) { this._cache.izin = data.izin; }
      if (data.settings) this.saveSettings(data.settings);
      this.emitUpdate();
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

  // PENGAMPU (AKUN USTADZ - 100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getAllPengampuRaw() {
    this.init();
    return this._cache.pengampu || [];
  },

  getPengampu(branchId = null) {
    const all = this.getAllPengampuRaw();
    if (!branchId || branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(p => (p.cabangId || 'cabang-pusat') === targetBranch);
  },

  getAllUniquePengampu(branchId = null) {
    return this.getPengampu(branchId);
  },

  savePengampu(branchList, branchId = null) {
    const targetBranch = branchId || this.getActiveBranchId();
    const all = this.getAllPengampuRaw();
    const otherBranches = all.filter(p => (p.cabangId || 'cabang-pusat') !== targetBranch);
    this._cache.pengampu = [...otherBranches, ...branchList];
    this.emitUpdate();
  },

  addPengampu(item) {
    const targetBranch = item.cabangId || this.getActiveBranchId();
    const list = this._cache.pengampu || [];
    const created = {
      ...item,
      id: item.id || ('p-' + Date.now()),
      cabangId: targetBranch,
      status: item.status || 'Aktif',
      role: item.role || 'Pengampu',
      terakhirLogin: 'Baru Didaftarkan'
    };
    list.push(created);
    this._cache.pengampu = list;
    this.emitUpdate();

    apiService.savePengampu({
      id: created.id,
      nip: created.nip || '',
      nama: created.nama,
      kontak: created.kontak || created.noHp || '',
      no_hp: created.noHp || created.kontak || '',
      role: created.role || 'Pengampu',
      halaqah_id: created.halaqahId || 'hq-1',
      cabang_id: targetBranch
    }).catch(e => console.warn('[API] savePengampu error:', e.message));

    return created;
  },

  updatePengampu(id, fields) {
    const list = this._cache.pengampu || [];
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this._cache.pengampu = list;
      this.emitUpdate();

      apiService.savePengampu({
        id: list[idx].id,
        nip: list[idx].nip || '',
        nama: list[idx].nama,
        kontak: list[idx].kontak || list[idx].noHp || '',
        no_hp: list[idx].noHp || list[idx].kontak || '',
        role: list[idx].role || 'Pengampu',
        halaqah_id: list[idx].halaqahId || 'hq-1',
        cabang_id: list[idx].cabangId || 'cabang-pusat'
      }).catch(e => console.warn('[API] updatePengampu error:', e.message));

      return list[idx];
    }
    return null;
  },

  deletePengampu(id) {
    this._cache.pengampu = (this._cache.pengampu || []).filter(u => u.id !== id);
    this.emitUpdate();
    apiService.deletePengampu(id).catch(e => console.warn('[API] deletePengampu error:', e.message));
  },

  resetPasswordPengampu(idOrName, newPassword = "bismillah123", email = null) {
    const list = this._cache.pengampu || [];
    const idx = list.findIndex(u => 
      u.id === idOrName || 
      u.nama === idOrName || 
      (email && u.email === email) ||
      (u.email && u.email === idOrName)
    );
    if (idx !== -1) {
      list[idx].password = newPassword;
      list[idx].passwordTerakhirDireset = new Date().toLocaleDateString('id-ID');
      this.emitUpdate();
      return { success: true, passwordBaru: newPassword };
    }
    return { success: false };
  },

  // JADWAL SESI PRESENSI (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  getSesi() {
    this.init();
    if (this._cache.sesi && this._cache.sesi.length > 0) {
      return this._cache.sesi.map(s => {
        const jamMulai = s.jamMulai || s.mulai || '05:00';
        const jamSelesai = s.jamSelesai || s.selesai || '06:30';
        const isAktif = s.status === 'Aktif' || s.status === 'AKTIF' || s.aktif !== false;
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
          status: isAktif ? 'AKTIF' : 'NONAKTIF',
          isActive: isAktif,
          badgeType: isAktif ? 'success' : 'danger',
          keterangan: `Jam Operasional: ${jamMulai} - ${jamSelesai}`,
          labelWaktu: `${s.nama} (${jamMulai} - ${jamSelesai})`
        };
      });
    }
    return INITIAL_SESI;
  },

  saveSesi(list) {
    this._cache.sesi = list;
    this.emitUpdate();
  },

  addSesi(item) {
    const list = this._cache.sesi || [];
    const created = {
      ...item,
      id: item.id || ('sesi-' + Date.now()),
      nama: item.nama || 'Sesi Baru',
      jamMulai: item.jamMulai || item.mulai || '05:00',
      jamSelesai: item.jamSelesai || item.selesai || '06:30',
      toleransiMenit: item.toleransiMenit || 15,
      hari: item.hari || 'Setiap Hari',
      status: item.status || 'Aktif',
      cabangId: item.cabangId || 'cabang-pusat'
    };
    list.push(created);
    this._cache.sesi = list;
    this.emitUpdate();

    apiService.saveSesi({
      id: created.id,
      nama: created.nama,
      jam_mulai: created.jamMulai,
      jam_selesai: created.jamSelesai,
      toleransi_menit: created.toleransiMenit,
      hari: created.hari,
      status: created.status,
      cabang_id: created.cabangId
    }).catch(e => console.warn('[API] saveSesi error:', e.message));
    return created;
  },

  updateSesi(id, fields) {
    const list = this._cache.sesi || [];
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this._cache.sesi = list;
      this.emitUpdate();

      apiService.saveSesi({
        id: list[idx].id,
        nama: list[idx].nama,
        jam_mulai: list[idx].jamMulai || list[idx].mulai || '05:00',
        jam_selesai: list[idx].jamSelesai || list[idx].selesai || '06:30',
        toleransi_menit: list[idx].toleransiMenit || 15,
        hari: list[idx].hari || 'Setiap Hari',
        status: list[idx].status || 'Aktif',
        cabang_id: list[idx].cabangId || 'cabang-pusat'
      }).catch(e => console.warn('[API] updateSesi error:', e.message));
      return list[idx];
    }
    return null;
  },

  deleteSesi(id) {
    this._cache.sesi = (this._cache.sesi || []).filter(s => s.id !== id);
    this.emitUpdate();
    apiService.deleteSesi(id).catch(e => console.warn('[API] deleteSesi error:', e.message));
  },

  // ==========================================
  // SIGAP: SISWA (100% DIRECT FROM POSTGRESQL VIA _cache.santri)
  // ==========================================
  getAllSigapSiswaRaw() {
    return (this._cache.santri || []).map(s => ({
      ...s,
      id: s.id,
      nis: s.nis,
      nisn: s.nis,
      nama: s.nama,
      kelas: s.kelas,
      wali: s.wali || '',
      kontakWali: s.kontak || s.noHpWali || '',
      cabangId: s.cabangId || 'cabang-pusat',
      unitSekolah: "MA IHYA' AS-SUNNAH",
      pengampu: s.pengampuNama || s.pengampu || ''
    }));
  },

  getSigapSiswa(branchId = null) {
    const all = this.getAllSigapSiswaRaw();
    if (!branchId || branchId === 'ALL') return all;
    return all.filter(s => (s.cabangId || 'cabang-pusat') === branchId);
  },

  saveSigapSiswa(branchList, branchId = null) {
    this.emitUpdate();
  },

  addSigapSiswa(item) {
    return this.addSantri(item);
  },

  updateSigapSiswa(id, fields) {
    return this.updateSantri(id, fields);
  },

  deleteSigapSiswa(id) {
    return this.deleteSantri(id);
  },

  // ==========================================
  // SIGAP: GURU & PEGAWAI (100% DIRECT FROM POSTGRESQL VIA _cache.pengampu)
  // ==========================================
  getAllSigapGuruRaw() {
    return (this._cache.pengampu || []).map(p => ({
      ...p,
      id: p.id,
      nama: p.nama,
      nip: p.nip || 'NON-NIP',
      jabatan: p.role || 'Pengampu Halaqoh',
      email: p.email || '',
      noHp: p.noHp || p.kontak || '',
      cabangId: p.cabangId || 'cabang-pusat',
      status: p.status || 'GTY',
      avatarBg: '#dcfce7'
    }));
  },

  getSigapGuru(branchId = null) {
    const all = this.getAllSigapGuruRaw();
    if (!branchId || branchId === 'ALL') return all;
    return all.filter(g => (g.cabangId || 'cabang-pusat') === branchId);
  },

  saveSigapGuru(branchList, branchId = null) {
    this.savePengampu(branchList, branchId);
  },

  addSigapGuru(item) {
    return this.addPengampu(item);
  },

  updateSigapGuru(id, fields) {
    return this.updatePengampu(id, fields);
  },

  deleteSigapGuru(id) {
    return this.deletePengampu(id);
  },

  // ==========================================
  // SIGAP: ALUMNI (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getAllSigapAlumniRaw() {
    return this._cache.alumni || [];
  },

  getSigapAlumni(branchId = null) {
    const all = this.getAllSigapAlumniRaw();
    if (branchId === 'ALL') return all;
    const targetBranch = branchId || this.getActiveBranchId();
    return all.filter(a => (a.cabangId || 'cabang-pusat') === targetBranch);
  },

  saveSigapAlumni(list) {
    this._cache.alumni = list;
    this.emitUpdate();
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
    this._cache.alumni = all;
    this.emitUpdate();
    apiService.saveAlumni({
      id: created.id,
      nama: created.nama,
      nik: created.nik || '',
      nisn: created.nisn || '',
      nism: created.nism || '',
      lp: created.lp || 'L',
      tahun_lulus: created.tahunLulus,
      cabang_id: targetBranch
    }).catch(e => console.warn('[API] saveAlumni error:', e.message));
    return created;
  },

  deleteSigapAlumni(id) {
    this._cache.alumni = (this._cache.alumni || []).filter(a => a.id !== id);
    this.emitUpdate();
    apiService.deleteAlumni(id).catch(e => console.warn('[API] deleteAlumni error:', e.message));
  },

  // ==========================================
  // SIGAP: DATA KELAS & WALI (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getAllSigapKelasRaw() {
    return this._cache.kelas || [];
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
    this._cache.kelas = [...otherBranches, ...updatedBranchList];
    this.emitUpdate();
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
    this._cache.kelas = all;
    this.emitUpdate();
    apiService.saveKelas({
      id: created.id,
      nama: created.nama,
      unit_sekolah: created.unitSekolah,
      wali_kelas: created.waliKelas || '',
      cabang_id: targetBranch,
      aktif: created.aktif !== false
    }).catch(e => console.warn('[API] saveKelas error:', e.message));
    return created;
  },

  updateSigapKelas(id, fields) {
    const all = this.getAllSigapKelasRaw();
    const idx = all.findIndex(k => k.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...fields };
      this._cache.kelas = all;
      this.emitUpdate();
      apiService.saveKelas({
        id: all[idx].id,
        nama: all[idx].nama,
        unit_sekolah: all[idx].unitSekolah,
        wali_kelas: all[idx].waliKelas || '',
        cabang_id: all[idx].cabangId || 'cabang-pusat',
        aktif: all[idx].aktif !== false
      }).catch(e => console.warn('[API] updateKelas error:', e.message));
      return all[idx];
    }
    return null;
  },

  deleteSigapKelas(id) {
    this._cache.kelas = (this._cache.kelas || []).filter(k => k.id !== id);
    this.emitUpdate();
    apiService.deleteKelas(id).catch(e => console.warn('[API] deleteKelas error:', e.message));
  },

  // ==========================================
  // SIGAP: JADWAL PELAJARAN (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getSigapJadwal() {
    return this._cache.jadwal || INITIAL_SIGAP_JADWAL;
  },

  saveSigapJadwal(jadwal) {
    this._cache.jadwal = jadwal;
    this.emitUpdate();
  },

  // ==========================================
  // SIGAP: QR & LOKASI KELAS (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getAllSigapLokasiQRRaw() {
    return this._cache.lokasi_qr || [];
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
    this._cache.lokasi_qr = [...otherBranches, ...updated];
    this.emitUpdate();
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
    this._cache.lokasi_qr = all;
    this.emitUpdate();
    apiService.saveLokasiQR({
      id: created.id,
      kelas: created.kelas,
      lokasi: created.lokasi,
      kode_manual: created.kodeManual,
      cabang_id: targetBranch,
      gps_status: created.gpsStatus,
      locked: created.locked !== false,
      lat: created.lat,
      lng: created.lng,
      radius_meter: created.radiusMeter
    }).catch(e => console.warn('[API] saveLokasiQR error:', e.message));
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
      this._cache.lokasi_qr = all;
      this.emitUpdate();
      apiService.saveLokasiQR({
        id: all[idx].id,
        kelas: all[idx].kelas,
        lokasi: all[idx].lokasi,
        kode_manual: all[idx].kodeManual,
        cabang_id: all[idx].cabangId || 'cabang-pusat',
        gps_status: all[idx].gpsStatus,
        locked: all[idx].locked !== false,
        lat: all[idx].lat,
        lng: all[idx].lng,
        radius_meter: all[idx].radiusMeter
      }).catch(e => console.warn('[API] updateLokasiQR error:', e.message));
      return all[idx];
    }
    return null;
  },

  deleteSigapLokasiQR(id) {
    this._cache.lokasi_qr = (this._cache.lokasi_qr || []).filter(l => l.id !== id);
    this.emitUpdate();
    apiService.deleteLokasiQR(id).catch(e => console.warn('[API] deleteLokasiQR error:', e.message));
  },

  // ==========================================
  // SIGAP: PERSETUJUAN IZIN GURU (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getSigapIzinGuru() {
    return (this._cache.izin || []).filter(i => (i.tipePemohon === 'Pengampu' || i.tipe_pemohon === 'Pengampu' || !i.tipePemohon));
  },

  getPendingSigapIzinCount() {
    const list = this.getSigapIzinGuru();
    return list.filter(i => i.status === 'Perlu Persetujuan' || i.status === 'Menunggu' || i.status === 'Menunggu Persetujuan' || i.statusApproval === 'Menunggu').length;
  },

  // ==========================================
  // SIGAP: NOTIFIKASI AKUN ADMIN (IN-MEMORY CACHE)
  // ==========================================
  getAdminNotifications() {
    return this._cache.adminNotifications || [];
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
    this._cache.adminNotifications = list.slice(0, 30);
    try {
      window.dispatchEvent(new CustomEvent('sigap_admin_notif_updated', { detail: entry }));
    } catch (e) {}
    return entry;
  },

  markAdminNotificationsAsRead() {
    this._cache.adminNotifications = (this.getAdminNotifications()).map(n => ({ ...n, dibaca: true }));
    try {
      window.dispatchEvent(new CustomEvent('sigap_admin_notif_updated'));
    } catch (e) {}
  },

  saveSigapIzinGuru(list) {
    this._cache.izin = list;
    this.emitUpdate();
  },

  addSigapIzinGuru(entry) {
    const newEntry = {
      id: entry.id || ('iz-' + Date.now()),
      pemohonId: entry.pemohonId || entry.pemohon_id || 'p-1',
      pemohon_id: entry.pemohonId || entry.pemohon_id || 'p-1',
      tipePemohon: 'Pengampu',
      nama: entry.nama || 'Wahyudin Hafiz, S.Pd',
      nip: entry.nip || '19880101201501',
      role: entry.role || 'Pengampu Halaqoh',
      unit: entry.unit || "MA IHYA' AS-SUNNAH",
      halaqahNama: entry.halaqahNama || 'Halaqah Ustadz Wahyudin (X A - Ikhwan)',
      jenisIzin: entry.jenisIzin || entry.jenis || 'Sakit',
      jenis: entry.jenisIzin || entry.jenis || 'Sakit',
      tanggal: entry.tanggal || new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      tanggalMulai: entry.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggalSelesai: entry.tanggalSelesai || new Date().toISOString().split('T')[0],
      sesi: entry.sesi || 'Semua Sesi Hari Ini',
      alasan: entry.alasan || '',
      tugasSiswa: entry.tugasSiswa || entry.pelimpahanTugas || "Muroja'ah mandiri dipimpin ketua halaqah",
      tugasPengganti: entry.tugasSiswa || entry.pelimpahanTugas || "Muroja'ah mandiri",
      guruBadal: entry.guruBadal || 'Ustadz Agus Rinaldi',
      status: 'Perlu Persetujuan',
      statusApproval: 'Menunggu',
      catatanAdmin: '',
      dibuatPada: new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')
    };

    const currentIzin = this._cache.izin || [];
    currentIzin.unshift(newEntry);
    this._cache.izin = currentIzin;
    this.emitUpdate();

    // Kirim notifikasi otomatis ke akun Super Admin
    this.addAdminNotification({
      type: 'izin_pengampu',
      title: `Permohonan Izin: ${newEntry.nama}`,
      message: `${newEntry.nama} mengajukan izin (${newEntry.jenisIzin}) untuk ${newEntry.sesi || 'hari ini'}. Alasan: "${newEntry.alasan || '-'}"`,
      izinId: newEntry.id,
      pengampu: newEntry.nama,
      jenisIzin: newEntry.jenisIzin
    });

    apiService.saveIzin({
      id: newEntry.id,
      pemohon_id: newEntry.pemohonId,
      tipe_pemohon: 'Pengampu',
      jenis: newEntry.jenisIzin,
      tanggal_mulai: newEntry.tanggalMulai,
      tanggal_selesai: newEntry.tanggalSelesai,
      alasan: newEntry.alasan,
      tugas_pengganti: newEntry.tugasPengganti,
      status_approval: 'Menunggu',
      bukti_url: null
    }).catch(e => console.warn('[API] saveIzin error:', e.message));

    try {
      window.dispatchEvent(new CustomEvent('sigap_izin_updated', { detail: newEntry }));
    } catch (e) {}

    return newEntry;
  },

  updateStatusIzinGuru(id, status, catatanAdmin = '') {
    const list = this._cache.izin || [];
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].statusApproval = status === 'Disetujui' ? 'Disetujui' : (status === 'Ditolak' ? 'Ditolak' : 'Menunggu');
      if (catatanAdmin) list[idx].catatanAdmin = catatanAdmin;
      this._cache.izin = list;
      this.emitUpdate();

      apiService.saveIzin({
        id: list[idx].id,
        pemohon_id: list[idx].pemohonId || list[idx].pemohon_id || 'p-1',
        tipe_pemohon: list[idx].tipePemohon || 'Pengampu',
        jenis: list[idx].jenisIzin || list[idx].jenis || 'Izin',
        tanggal_mulai: list[idx].tanggalMulai,
        tanggal_selesai: list[idx].tanggalSelesai,
        alasan: list[idx].alasan || '',
        tugas_pengganti: list[idx].tugasPengganti || list[idx].tugasSiswa || '-',
        status_approval: list[idx].statusApproval
      }).catch(e => console.warn('[API] updateStatusIzin error:', e.message));

      try {
        window.dispatchEvent(new CustomEvent('sigap_izin_updated', { detail: list[idx] }));
      } catch (e) {}
      return list[idx];
    }
    return null;
  },

  deleteSigapIzinGuru(id) {
    this._cache.izin = (this._cache.izin || []).filter(i => i.id !== id);
    this.emitUpdate();
    apiService.deleteIzin(id).catch(e => console.warn('[API] deleteIzin error:', e.message));
    try {
      window.dispatchEvent(new CustomEvent('sigap_izin_updated'));
    } catch (e) {}
  },

  // ==========================================
  // SIGAP: MONITORING & REKAPITULASI (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getSigapMonitoring() {
    return {
      kpi: INITIAL_SIGAP_MONITORING.kpi,
      rankings: INITIAL_SIGAP_MONITORING.rankings,
      liveFeed: this._cache.monitoring || []
    };
  },

  saveSigapMonitoring(data) {
    this._cache.monitoring = data?.liveFeed || [];
    this.emitUpdate();
  },

  updateStatusPresensiPengampu(id, newStatus, newKeterangan, selisihMenit = 0, additionalData = {}) {
    const list = this._cache.monitoring || [];
    let idx = list.findIndex(item => item.id === id || (item.pengampuId && item.pengampuId === id));
    
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    const todayISO = new Date().toISOString().split('T')[0];

    if (idx !== -1) {
      list[idx].status = newStatus;
      list[idx].keterangan = newKeterangan || newStatus;
      list[idx].selisihMenit = selisihMenit;
      if ((newStatus === 'Sudah' || newStatus === 'Tepat Waktu' || newStatus === 'Terlambat') && (!list[idx].jam || list[idx].jam === '-')) {
        list[idx].jam = nowTime;
      }
      list[idx] = { ...list[idx], ...additionalData };
    } else {
      const newEntry = {
        id: id || ('pres-' + Date.now()),
        pengampuId: additionalData.pengampuId || id,
        nama: additionalData.nama || 'Pengampu',
        nip: additionalData.nip || 'NON-NIP',
        role: additionalData.role || 'Pengampu Halaqoh',
        sesi: additionalData.sesi || "Ba'da Subuh",
        mapel: additionalData.mapel || "Tahfidz",
        kelas: additionalData.kelas || "Masjid Pusat PPIAS",
        jadwal: additionalData.jadwal || "-",
        tanggal: todayISO,
        jam: (newStatus === 'Sudah' || newStatus === 'Tepat Waktu' || newStatus === 'Terlambat') ? nowTime : '-',
        status: newStatus,
        keterangan: newKeterangan || newStatus,
        selisihMenit: selisihMenit,
        metode: 'Manual Super Admin',
        ...additionalData
      };
      list.unshift(newEntry);
      idx = 0;
    }

    this._cache.monitoring = list;
    this.emitUpdate();
    apiService.saveMonitoringPresensi(list[idx]).catch(e => console.warn('[API] updateStatusPresensiPengampu error:', e.message));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sigap_admin_notif_updated'));
      window.dispatchEvent(new CustomEvent('storage'));
    }

    return list[idx];
  },

  addMonitoring(item) {
    const list = this._cache.monitoring || [];
    const created = {
      ...item,
      id: item.id || ('mon-' + Date.now()),
      tanggal: item.tanggal || new Date().toISOString().split('T')[0],
      status: item.status || 'Tepat Waktu',
      jam: item.jam || '07.00',
      keterangan: item.keterangan || item.status || 'Tepat Waktu'
    };
    list.unshift(created);
    this._cache.monitoring = list;
    this.emitUpdate();
    apiService.saveMonitoringPresensi(created).catch(e => console.warn('[API] addMonitoring error:', e.message));
    return created;
  },

  updateMonitoring(id, fields) {
    const list = this._cache.monitoring || [];
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      this._cache.monitoring = list;
      this.emitUpdate();
      apiService.saveMonitoringPresensi(list[idx]).catch(e => console.warn('[API] updateMonitoring error:', e.message));
      return list[idx];
    }
    return null;
  },

  deleteMonitoring(id) {
    this._cache.monitoring = (this._cache.monitoring || []).filter(item => item.id !== id);
    this.emitUpdate();
    apiService.deleteMonitoring(id).catch(e => console.warn('[API] deleteMonitoring error:', e.message));
  },

  resetSigapMonitoringDefault() {
    this._cache.monitoring = [];
    this.emitUpdate();
    return INITIAL_SIGAP_MONITORING;
  },

  // ==========================================
  // SIGAP: JADWAL SESI HALAQOH & PRESENSI QR (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // ==========================================
  getJadwalHalaqoh() {
    if (!this._cache.jadwalHalaqoh) {
      this._cache.jadwalHalaqoh = JSON.parse(JSON.stringify(INITIAL_JADWAL_HALAQOH));
    }
    if (this._cache.sesi && this._cache.sesi.length > 0) {
      this._cache.jadwalHalaqoh.sesiList = this._cache.sesi.map(s => ({
        id: s.id,
        nama: s.nama,
        labelWaktu: `${s.nama} (${s.jamMulai || '05:00'} - ${s.jamSelesai || '06:30'})`,
        icon: s.id === 'subuh' ? 'Sunrise' : (s.id === 'pagi' ? 'Sun' : (s.id === 'ashar' ? 'CloudSun' : 'Moon')),
        mulai: s.jamMulai || '05:00',
        selesai: s.jamSelesai || '06:30',
        jamMulai: s.jamMulai || '05:00',
        jamSelesai: s.jamSelesai || '06:30',
        bukaScan: s.jamMulai || '04:45',
        batasScan: s.jamSelesai || '05:30',
        toleransiMenit: s.toleransiMenit || 15,
        aktif: s.status !== 'Nonaktif',
        deskripsi: s.deskripsi || ''
      }));
    }
    return this._cache.jadwalHalaqoh;
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
    this._cache.jadwalHalaqoh = data;
    if (data && Array.isArray(data.sesiList)) {
      this._cache.sesi = data.sesiList.map(s => ({
        id: s.id,
        nama: s.nama,
        jamMulai: s.mulai || s.jamMulai,
        jamSelesai: s.selesai || s.jamSelesai,
        toleransiMenit: s.toleransiMenit || 15,
        hari: 'Setiap Hari',
        status: s.aktif !== false ? 'Aktif' : 'Nonaktif',
        cabangId: this.getActiveBranchId()
      }));

      // Simpan setiap sesi ke tabel sesi di PostgreSQL
      data.sesiList.forEach(s => {
        apiService.saveSesi({
          id: s.id,
          nama: s.nama,
          jam_mulai: s.mulai || s.jamMulai,
          jam_selesai: s.selesai || s.jamSelesai,
          toleransi_menit: s.toleransiMenit || 15,
          hari: 'Setiap Hari',
          status: s.aktif !== false ? 'Aktif' : 'Nonaktif',
          cabang_id: this.getActiveBranchId()
        }).catch(e => console.warn('[API] saveSesi error:', e.message));
      });
    }
    this.emitUpdate();
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('sigap_jadwal_updated', { detail: data }));
    }

    // Persist ke database PostgreSQL settings agar jadwal tidak pernah hilang
    apiService.saveSettings({
      key: 'sigap_jadwal_halaqoh',
      value: data
    }).catch(e => console.warn('[API] saveSettings jadwalHalaqoh error:', e.message));
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
    this._harmonizeGuruAndPengampu();
    this._harmonizeSiswaAndSantri();
    const payload = {
      cabang: this.getCabang('ALL'),
      superadmin: this.getSuperAdminAccounts(),
      pengampu: this.getAllPengampuRaw(),
      halaqah: this.getAllHalaqahRaw(),
      santri: this.getAllSantriRaw(),
      sesi: this.getSesi('ALL'),
      absensi: this.getAbsensi('ALL'),
      setoran: this.getAllSetoranRaw(),
      izin: this.getIzin(),
      spp: this.getPembayaranSPP(),
      monitoring: (this.getSigapMonitoring() || {}).liveFeed || [],
      kelas: this.getAllSigapKelasRaw(),
      alumni: this.getAllSigapAlumniRaw(),
      lokasi_qr: this.getAllSigapLokasiQRRaw(),
      settings: [
        { key: 'app_settings', value: this.getSettings() }
      ]
    };
    return await apiService.syncAllToDatabase(payload);
  },

  async syncFromPostgres() {
    return await this.initFromDatabase();
  },

  // =========================================================
  // PEMBAYARAN SPP & MANAJEMEN KEUANGAN (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // =========================================================
  getPembayaranSPP(filter = {}) {
    let list = this._cache.spp || [];

    if (filter.cabangId && filter.cabangId !== 'all') {
      list = list.filter(item => (item.cabangId || item.cabang_id) === filter.cabangId);
    }
    if (filter.bulan && filter.bulan !== 'all') {
      list = list.filter(item => item.bulan === filter.bulan);
    }
    if (filter.status && filter.status !== 'all') {
      list = list.filter(item => item.status === filter.status);
    }
    if (filter.kelas && filter.kelas !== 'all') {
      list = list.filter(item => item.kelas === filter.kelas);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(item => 
        (item.santriNama && item.santriNama.toLowerCase().includes(q)) ||
        (item.santri_nama && item.santri_nama.toLowerCase().includes(q)) ||
        (item.nis && String(item.nis).toLowerCase().includes(q)) ||
        (item.invoiceNo && item.invoiceNo.toLowerCase().includes(q)) ||
        (item.invoice_no && item.invoice_no.toLowerCase().includes(q))
      );
    }
    return list;
  },

  addPembayaranSPP(item) {
    const list = this._cache.spp || [];
    const newItem = {
      ...item,
      id: item.id || `spp-${Date.now()}`,
      invoiceNo: item.invoiceNo || this.generateInvoiceNo(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newItem);
    this._cache.spp = list;
    this.emitUpdate();
    apiService.saveSPP(newItem).catch(err => console.warn('Sync SPP error:', err.message));
    return newItem;
  },

  updatePembayaranSPP(id, updatedData) {
    const list = this._cache.spp || [];
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData, updatedAt: new Date().toISOString() };
      this._cache.spp = list;
      this.emitUpdate();
      apiService.saveSPP(list[index]).catch(err => console.warn('Sync SPP error:', err.message));
      return list[index];
    }
    return null;
  },

  deletePembayaranSPP(id) {
    this._cache.spp = (this._cache.spp || []).filter(item => item.id !== id);
    this.emitUpdate();
    apiService.deleteSPP(id).catch(err => console.warn('Delete SPP error:', err.message));
    return true;
  },

  generateInvoiceNo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    return `INV-SPP/${year}${month}/${randomSeq}`;
  },

  generateMonthlySPP(bulan, tahun = 2026, nominalDefault = 350000) {
    const existing = this._cache.spp || [];
    const santriList = this.getSantri();
    const newItems = [];

    santriList.forEach(s => {
      const alreadyHas = existing.some(item => (item.santriId || item.santri_id) === s.id && item.bulan === bulan);
      if (!alreadyHas) {
        const item = {
          id: `spp-${Date.now()}-${s.id}`,
          invoiceNo: this.generateInvoiceNo(),
          santriId: s.id,
          santriNama: s.nama,
          nis: s.nis,
          kelas: s.kelas,
          cabangId: s.cabangId || 'cabang-pusat',
          bulan: bulan,
          tahun: Number(tahun),
          nominal: nominalDefault,
          status: 'Belum Lunas',
          tanggalBayar: null,
          metodeBayar: '-',
          nomorRef: '-',
          catatan: `Tagihan SPP Bulan ${bulan}`,
          namaPetugas: 'Bendahara Pesantren',
          createdAt: new Date().toISOString()
        };
        newItems.push(item);
        apiService.saveSPP(item).catch(e => console.warn('generate SPP error:', e.message));
      }
    });

    if (newItems.length > 0) {
      this._cache.spp = [...newItems, ...existing];
      this.emitUpdate();
    }
    return newItems.length;
  },

  // =========================================================
  // TEMPLATE RAPOR & ASPEK KUALITAS TAHFIDZ (100% DIRECT FROM POSTGRESQL DATABASE VIA _cache)
  // =========================================================
  getRaporTemplate() {
    return this._cache.raporTemplate || DEFAULT_RAPOR_TEMPLATE;
  },

  saveRaporTemplate(templateData) {
    try {
      const current = this.getRaporTemplate();
      const updated = {
        ...current,
        ...templateData,
        updatedAt: new Date().toISOString()
      };
      this._cache.raporTemplate = updated;
      this.emitUpdate();
      window.dispatchEvent(new CustomEvent('simtah_rapor_template_updated', { detail: updated }));
      apiService.saveRaporTemplate(updated).catch(err => console.warn('[STORAGE] Sync template rapor to backend failed:', err.message));
      return updated;
    } catch (e) {
      console.error('[STORAGE] Failed to save template rapor:', e);
      throw e;
    }
  },

  getAllNilaiRapor() {
    return this._cache.nilaiRapor || [];
  },

  getNilaiRaporBySantri(santriId, semester = null) {
    const list = this.getAllNilaiRapor();
    if (!santriId) return null;
    const cleanId = String(santriId).trim();
    return list.find(item => {
      const iSantriId = String(item.santriId || item.santri_id || '');
      const matchId = iSantriId === cleanId || 
        (cleanId.startsWith('s-') && iSantriId === cleanId.replace('s-', 's')) ||
        (!cleanId.startsWith('s-') && iSantriId === cleanId.replace('s', 's-')) ||
        (cleanId === 's-1' && (iSantriId === 's1' || iSantriId === 's-1')) ||
        (cleanId === 's1' && (iSantriId === 's-1' || iSantriId === 's1'));
      if (semester) {
        return matchId && (item.semester === semester);
      }
      return matchId;
    }) || null;
  },

  saveNilaiRapor(data) {
    try {
      const list = this.getAllNilaiRapor();
      const santriId = data.santriId || data.santri_id;
      const kelancaran = Number(data.kelancaran) || 0;
      const tajwid = Number(data.tajwid) || 0;
      const fashohah = Number(data.fashohah) || 0;
      const adab = Number(data.adab) || 0;
      const rataRata = Number(((kelancaran + tajwid + fashohah + adab) / 4).toFixed(2));
      
      const getPredikat = (score) => {
        if (score >= 90) return "Mumtaz (Istimewa)";
        if (score >= 80) return "Jayyid Jiddan (Sangat Baik)";
        if (score >= 70) return "Jayyid (Baik)";
        if (score >= 60) return "Maqbul (Cukup)";
        return "Kurang";
      };

      const predikat = data.predikat || getPredikat(rataRata);

      const recordId = data.id || `nr-${santriId || Date.now()}`;
      const record = {
        id: recordId,
        santriId: santriId,
        santri_id: santriId,
        pengampuId: data.pengampuId || data.pengampu_id || null,
        pengampu_id: data.pengampuId || data.pengampu_id || null,
        semester: data.semester || 'Ganjil 2026/2027',
        tahunAjaran: data.tahunAjaran || data.tahun_ajaran || '2026/2027',
        tahun_ajaran: data.tahunAjaran || data.tahun_ajaran || '2026/2027',
        kelancaran,
        kelancaranKet: data.kelancaranKet || data.kelancaran_ket || 'Hafalan lancar, tartil, dan mutqin',
        kelancaran_ket: data.kelancaranKet || data.kelancaran_ket || 'Hafalan lancar, tartil, dan mutqin',
        tajwid,
        tajwidKet: data.tajwidKet || data.tajwid_ket || "Ghunnah, ikhfa', dan mad diterapkan dengan baik",
        tajwid_ket: data.tajwidKet || data.tajwid_ket || "Ghunnah, ikhfa', dan mad diterapkan dengan baik",
        fashohah,
        fashohahKet: data.fashohahKet || data.fashohah_ket || 'Pengucapan huruf jelas dan fasih sesuai kaidah',
        fashohah_ket: data.fashohahKet || data.fashohah_ket || 'Pengucapan huruf jelas dan fasih sesuai kaidah',
        adab,
        adabKet: data.adabKet || data.adab_ket || 'Menghormati mushaf, ustadz, dan teman halaqah',
        adab_ket: data.adabKet || data.adab_ket || 'Menghormati mushaf, ustadz, dan teman halaqah',
        rataRata,
        rata_rata: rataRata,
        predikat,
        catatanMusyrif: data.catatanMusyrif || data.catatan_musyrif || '',
        catatan_musyrif: data.catatanMusyrif || data.catatan_musyrif || '',
        tempatRapor: data.tempatRapor || data.tempat_rapor || 'Tasikmalaya',
        tempat_rapor: data.tempatRapor || data.tempat_rapor || 'Tasikmalaya',
        tanggalRapor: data.tanggalRapor || data.tanggal_rapor || new Date().toISOString().split('T')[0],
        tanggal_rapor: data.tanggalRapor || data.tanggal_rapor || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      };

      const existingIndex = list.findIndex(item => item.id === recordId || ((item.santriId === santriId || item.santri_id === santriId) && item.semester === record.semester));
      let updatedList;
      if (existingIndex >= 0) {
        updatedList = [...list];
        updatedList[existingIndex] = { ...updatedList[existingIndex], ...record };
      } else {
        updatedList = [record, ...list];
      }

      this._cache.nilaiRapor = updatedList;
      this.emitUpdate();
      window.dispatchEvent(new CustomEvent('simtah_nilai_rapor_updated', { detail: record }));

      // Asynchronously send to PostgreSQL database via API
      apiService.saveNilaiRapor(record).catch(err => console.warn('[STORAGE] Sync nilai rapor to backend failed:', err.message));

      return record;
    } catch (e) {
      console.error('[STORAGE] Failed to save nilai rapor:', e);
      throw e;
    }
  },

  deleteNilaiRapor(id) {
    try {
      const list = this.getAllNilaiRapor();
      const updatedList = list.filter(item => item.id !== id);
      this._cache.nilaiRapor = updatedList;
      this.emitUpdate();
      window.dispatchEvent(new CustomEvent('simtah_nilai_rapor_updated', { detail: { id, deleted: true } }));
      apiService.deleteNilaiRapor(id).catch(err => console.warn('[STORAGE] Delete nilai rapor on backend failed:', err.message));
      return true;
    } catch (e) {
      console.error('[STORAGE] Failed to delete nilai rapor:', e);
      return false;
    }
  },

  resetAllData() {
    if (typeof window !== 'undefined') {
      try { localStorage.clear(); } catch (e) {}
      try { sessionStorage.clear(); } catch (e) {}
    }
    this._cache = {
      cabang: [],
      superadmin: [],
      pengampu: [],
      santri: [],
      halaqah: [],
      sesi: [],
      absensi: [],
      setoran: [],
      izin: [],
      spp: [],
      monitoring: [],
      kelas: [],
      alumni: [],
      lokasi_qr: [...INITIAL_SIGAP_LOKASI_QR],
      settings: INITIAL_SETTINGS,
      raporTemplate: DEFAULT_RAPOR_TEMPLATE,
      nilaiRapor: [],
      jadwal: INITIAL_SIGAP_JADWAL,
      jadwalHalaqoh: INITIAL_JADWAL_HALAQOH,
      adminNotifications: [],
      activeBranchId: 'cabang-pusat',
      currentRole: 'superadmin',
      selectedStudentParent: null,
      authUser: null,
      googleClientId: null
    };
    this.init();
    this.emitUpdate();
  }
};

export default storageService;
