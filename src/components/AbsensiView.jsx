import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Sparkles,
  Clock,
  Check,
  X,
  HeartPulse,
  Info,
  AlertTriangle,
  ShieldCheck,
  Filter,
  RefreshCw,
  Edit3,
  Sunrise,
  Sun,
  CloudSun,
  Moon,
  UserCheck,
  BarChart3,
  TrendingUp,
  Eye,
  Award,
  ArrowRight
} from 'lucide-react';
import { storageService } from '../services/storage';
import RiwayatPresensiPengampuView from './RiwayatPresensiPengampuView';

export default function AbsensiView({ 
  santriList = [], 
  halaqahList = [], 
  absensiList = [], 
  onSaveAbsensi,
  showToast,
  currentRole = 'pengampu',
  activeCategory = 'santri',
  onCategoryChange,
  setActiveTab,
  authUser
}) {
  const isOrangTua = currentRole === 'orangtua';
  const [presensiCategory, setPresensiCategory] = useState(activeCategory || 'santri');

  useEffect(() => {
    if (activeCategory) {
      setPresensiCategory(activeCategory);
    }
  }, [activeCategory]);

  const handleCategorySwitch = (cat) => {
    setPresensiCategory(cat);
    if (onCategoryChange) onCategoryChange(cat);
  };
  // Filter santri & halaqah khusus role Pengampu (sudah disaring secara dinamis dari App.jsx)
  const effectiveHalaqahList = halaqahList;
  const effectiveSantriList = santriList;
  const defaultHalaqahId = effectiveHalaqahList[0]?.id || 'hq-1';
  const [selectedHalaqahId, setSelectedHalaqahId] = useState(defaultHalaqahId);

  const todayISO = new Date().toISOString().split('T')[0];
  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const [periodFilter, setPeriodFilter] = useState('hari-ini'); // 'hari-ini' | 'kemarin' | 'bulan-ini' | 'custom'
  const [selectedTanggal, setSelectedTanggal] = useState(todayISO);

  // ══════════════════════════════════════════════════════════
  // LOGIKA DETEKSI HARI & SESI HALAQAH AKTIF HARI INI
  // ══════════════════════════════════════════════════════════
  const daysMap = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dateObj = new Date(selectedTanggal + 'T00:00:00');
  const dayOfWeek = isNaN(dateObj.getDay()) ? 6 : dateObj.getDay();
  const hariName = daysMap[dayOfWeek] || 'Sabtu';

  // Ambil master jadwal halaqah dari storageService
  const jadwalHalaqoh = storageService.getJadwalHalaqoh() || {};
  const masterSesiList = jadwalHalaqoh.sesiList || [
    { id: 'subuh', nama: "Ba'da Subuh", labelWaktu: "Ziyadah & Tahsin — Ba'da Subuh", icon: 'Sunrise', mulai: '05:00', selesai: '06:30' },
    { id: 'pagi', nama: 'Pagi / Dhuha', labelWaktu: "Penguatan Hafalan — Dhuha", icon: 'Sun', mulai: '08:30', selesai: '10:00' },
    { id: 'ashar', nama: "Ba'da Ashar", labelWaktu: "Muroja'ah Sabqi & Manzil — Ba'da Ashar", icon: 'CloudSun', mulai: '16:00', selesai: '17:30' },
    { id: 'malam', nama: "Ba'da Maghrib", labelWaktu: "Tadarus Halaqoh — Ba'da Maghrib s/d Isya", icon: 'Moon', mulai: '18:45', selesai: '20:30' }
  ];

  // Filter sesi yang aktif untuk hari terpilih (misal: Senin-Kamis & Sabtu ada 4 sesi)
  const activeSesiList = masterSesiList.filter(sesi => {
    if (jadwalHalaqoh.matriks?.[sesi.id]?.[hariName]) {
      return jadwalHalaqoh.matriks[sesi.id][hariName].status === 'Masuk';
    }
    if (jadwalHalaqoh.hariAktif?.[hariName] && typeof jadwalHalaqoh.hariAktif[hariName][sesi.id] !== 'undefined') {
      return !!jadwalHalaqoh.hariAktif[hariName][sesi.id];
    }
    return true;
  });

  // Jika hari libur reguler (Ahad), sediakan semua sesi agar ustadz fleksibel jika ada kegiatan pengganti
  const effectiveSesiList = activeSesiList.length > 0 ? activeSesiList : masterSesiList;

  // State sesi halaqah yang dipilih untuk presensi
  const [selectedSesiId, setSelectedSesiId] = useState(effectiveSesiList[0]?.id || 'subuh');

  // Sinkronisasi selectedSesiId jika hari berubah
  useEffect(() => {
    if (effectiveSesiList.length > 0 && !effectiveSesiList.some(s => s.id === selectedSesiId)) {
      setSelectedSesiId(effectiveSesiList[0].id);
    }
  }, [selectedTanggal, effectiveSesiList]);

  const selectedSesiObj = masterSesiList.find(s => s.id === selectedSesiId) || masterSesiList[0];

  const [records, setRecords] = useState({});
  const [catatanHalaqah, setCatatanHalaqah] = useState("");
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'H', 'I', 'S', 'A'

  // Santri di halaqah yang dipilih
  const santriInHalaqah = effectiveSantriList.filter(s => s.halaqahId === selectedHalaqahId);

  // ══════════════════════════════════════════════════════════
  // DATA REKAPITULASI PRESENSI SANTRI BULAN INI
  // ══════════════════════════════════════════════════════════
  const currentYearMonth = (selectedTanggal || todayISO).substring(0, 7); // e.g. "2026-09"
  const monthlySessions = absensiList.filter(a => 
    a.halaqahId === selectedHalaqahId && 
    (a.tanggal || '').startsWith(currentYearMonth)
  ).sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));

  const monthlyStudentStats = santriInHalaqah.map(s => {
    let hadir = 0, izin = 0, sakit = 0, alpa = 0;
    monthlySessions.forEach(ses => {
      const rec = ses.records?.[s.id];
      const st = rec?.status || 'H';
      if (st === 'H') hadir++;
      else if (st === 'I') izin++;
      else if (st === 'S') sakit++;
      else if (st === 'A') alpa++;
    });
    const totalSesi = monthlySessions.length;
    const persen = totalSesi > 0 ? Math.round((hadir / totalSesi) * 100) : 100;
    return {
      santri: s,
      hadir,
      izin,
      sakit,
      alpa,
      totalSesi,
      persen
    };
  });

  const totalMonthlySessionsCount = monthlySessions.length;
  let totalHAll = 0, totalIAll = 0, totalSAll = 0, totalAAll = 0;
  monthlyStudentStats.forEach(st => {
    totalHAll += st.hadir;
    totalIAll += st.izin;
    totalSAll += st.sakit;
    totalAAll += st.alpa;
  });
  const avgMonthlyAttendance = monthlyStudentStats.length > 0 
    ? Math.round(monthlyStudentStats.reduce((acc, curr) => acc + curr.persen, 0) / monthlyStudentStats.length)
    : 100;

  // Load existing records if exists for this date, halaqah, and specific session
  useEffect(() => {
    const existing = absensiList.find(
      a => a.tanggal === selectedTanggal && 
           a.halaqahId === selectedHalaqahId &&
           (a.sesiId === selectedSesiId || (!a.sesiId && (selectedSesiId === 'subuh' || a.sesi === selectedSesiObj?.nama)))
    );

    if (existing && existing.records) {
      setRecords(existing.records);
      setCatatanHalaqah(existing.catatanHalaqah || "");
    } else {
      // Default initial status: Hadir untuk semua santri
      const initial = {};
      santriInHalaqah.forEach(s => {
        initial[s.id] = { status: 'H', catatan: 'Tepat Waktu' };
      });
      setRecords(initial);
      setCatatanHalaqah("");
    }
  }, [selectedTanggal, selectedHalaqahId, selectedSesiId, santriList, absensiList]);

  // Set status spesifik (dipakai oleh desktop pills dan mobile toggle)
  const handleStatusChange = (santriId, status) => {
    const defaultCatatanMap = {
      'H': 'Tepat Waktu',
      'I': 'Izin Kegiatan',
      'S': 'Sakit / Istirahat',
      'A': 'Tanpa Keterangan'
    };

    setRecords(prev => {
      const prevCatatan = prev[santriId]?.catatan || '';
      const newCatatan = (!prevCatatan || ['Tepat Waktu', 'Izin', 'Izin Kegiatan', 'Sakit', 'Sakit / Istirahat', 'Tanpa Keterangan', 'Alpa', 'Hadir'].includes(prevCatatan))
        ? defaultCatatanMap[status]
        : prevCatatan;

      return {
        ...prev,
        [santriId]: {
          ...(prev[santriId] || {}),
          status,
          catatan: newCatatan
        }
      };
    });
  };

  // 🌟 MODEL TEKAN AJA (KHUSUS MOBILE & TABLET): Hadir -> Izin -> Alpa -> Sakit -> Hadir 🌟
  const cycleStatusMap = {
    'H': 'I', // Hadir ditekan -> Izin
    'I': 'A', // Izin ditekan -> Alpa
    'A': 'S', // Alpa ditekan -> Sakit
    'S': 'H'  // Sakit ditekan -> Hadir kembali
  };

  const handleToggleNextStatus = (santriId) => {
    const currentStatus = records[santriId]?.status || 'H';
    const nextStatus = cycleStatusMap[currentStatus] || 'I';
    handleStatusChange(santriId, nextStatus);
  };

  const handleCatatanChange = (santriId, catatan) => {
    setRecords(prev => ({
      ...prev,
      [santriId]: {
        ...(prev[santriId] || { status: 'H' }),
        catatan
      }
    }));
  };

  // Quick Action: Tandai Semua Hadir
  const handleMarkAllPresent = () => {
    const updated = { ...records };
    santriInHalaqah.forEach(s => {
      updated[s.id] = {
        ...(updated[s.id] || {}),
        status: 'H',
        catatan: 'Tepat Waktu'
      };
    });
    setRecords(updated);
    showToast && showToast(`✓ Semua santri sesi ${selectedSesiObj?.nama || ''} berhasil ditandai Hadir (H)!`);
  };

  const handleSave = () => {
    onSaveAbsensi(
      selectedTanggal, 
      selectedHalaqahId, 
      records, 
      catatanHalaqah, 
      selectedSesiId, 
      selectedSesiObj?.nama || "Ba'da Subuh"
    );
    showToast && showToast(`✓ Presensi halaqah sesi ${selectedSesiObj?.nama || ''} (${selectedTanggal}) berhasil disimpan!`);
  };

  // Hitung persentase kehadiran sesi ini
  const total = santriInHalaqah.length;
  let countH = 0, countI = 0, countS = 0, countA = 0;

  santriInHalaqah.forEach(s => {
    const st = records[s.id]?.status || 'H';
    if (st === 'H') countH++;
    else if (st === 'I') countI++;
    else if (st === 'S') countS++;
    else if (st === 'A') countA++;
  });

  const persenHadir = total > 0 ? Math.round((countH / total) * 100) : 100;
  const selectedHalaqah = effectiveHalaqahList.find(h => h.id === selectedHalaqahId) || effectiveHalaqahList[0];

  // Quick preset pills untuk catatan alasan
  const quickPresets = {
    'H': ['Tepat Waktu', 'Scan QR', 'Muadzin'],
    'I': ['Izin Keluarga', 'Urusan Mendesak', 'Izin Pulang'],
    'S': ['Demam / Pusing', 'Flu / Batuk', 'Istirahat di Asrama'],
    'A': ['Tanpa Keterangan', 'Terlambat >30m']
  };

  // Filter santri berdasarkan kartu status jika dipilih
  const displayedSantri = santriInHalaqah.filter(s => {
    if (statusFilter === 'ALL') return true;
    const st = records[s.id]?.status || 'H';
    return st === statusFilter;
  });

  const btnBase = {
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease'
  };

  // Metadata styling status kehadiran
  const statusMeta = {
    'H': {
      label: 'Hadir',
      code: 'H',
      bg: '#ecfdf5',
      color: '#047857',
      border: '#10b981',
      icon: <Check size={14} strokeWidth={3} />
    },
    'I': {
      label: 'Izin',
      code: 'I',
      bg: '#f0f9ff',
      color: '#0284c7',
      border: '#0284c7',
      icon: <Info size={14} strokeWidth={2.5} />
    },
    'A': {
      label: 'Alpa',
      code: 'A',
      bg: '#fff1f2',
      color: '#e11d48',
      border: '#f43f5e',
      icon: <X size={14} strokeWidth={3} />
    },
    'S': {
      label: 'Sakit',
      code: 'S',
      bg: '#fffbeb',
      color: '#b45309',
      border: '#f59e0b',
      icon: <HeartPulse size={14} strokeWidth={2.5} />
    }
  };

  return (
    <div 
      className="page-content-wrapper" 
      style={{ 
        animation: 'fadeIn 0.25s ease-out',
        paddingBottom: '120px'
      }}
    >
      {/* ─── STYLE RESPONSIVE KHUSUS DESKTOP VS MOBILE/TABLET ─── */}
      <style>{`
        /* Layar Desktop (>= 1024px): Tampilan Desktop Penuh */
        @media (min-width: 1024px) {
          .attendance-desktop-table-view {
            display: block !important;
          }
          .attendance-mobile-card-view {
            display: none !important;
          }
          .session-desktop-view {
            display: block !important;
          }
          .session-mobile-view {
            display: none !important;
          }
          .recap-desktop-view {
            display: grid !important;
          }
          .recap-mobile-view {
            display: none !important;
          }
          .rekap-bulan-desktop-table {
            display: block !important;
          }
          .rekap-bulan-mobile-cards {
            display: none !important;
          }
          .mobile-save-bar {
            display: none !important;
          }
        }

        /* Layar Mobile & Tablet (< 1024px): Tampilan Ringkas Rapi */
        @media (max-width: 1023px) {
          .attendance-desktop-table-view {
            display: none !important;
          }
          .attendance-mobile-card-view {
            display: flex !important;
          }
          .session-desktop-view {
            display: none !important;
          }
          .session-mobile-view {
            display: block !important;
          }
          .recap-desktop-view {
            display: none !important;
          }
          .recap-mobile-view {
            display: grid !important;
          }
          .rekap-bulan-desktop-table {
            display: none !important;
          }
          .rekap-bulan-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .mobile-save-bar {
            display: flex !important;
          }
        }

        /* Grid Pilihan Sesi Halaqah Aktif Desktop */
        .session-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
        }
      `}</style>

      {/* ─── 0. SWITCHER: RIWAYAT PRESENSI VS RIWAYAT PRESENSI PENGAMPU ─── */}
      {currentRole !== 'orangtua' && (
        <div style={{
          display: 'inline-flex',
          gap: '6px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '18px',
          maxWidth: '100%',
          overflowX: 'auto',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <button
            type="button"
            onClick={() => handleCategorySwitch('santri')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '9px',
              fontWeight: presensiCategory === 'santri' ? 600 : 500,
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              background: presensiCategory === 'santri' ? '#ffffff' : 'transparent',
              color: presensiCategory === 'santri' ? '#0f766e' : '#64748b',
              boxShadow: presensiCategory === 'santri' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Users size={16} color={presensiCategory === 'santri' ? '#0d9488' : '#64748b'} />
            <span>Riwayat Presensi</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySwitch('pengampu')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '9px',
              fontWeight: presensiCategory === 'pengampu' ? 600 : 500,
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              background: presensiCategory === 'pengampu' ? '#ffffff' : 'transparent',
              color: presensiCategory === 'pengampu' ? '#0f766e' : '#64748b',
              boxShadow: presensiCategory === 'pengampu' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <UserCheck size={16} color={presensiCategory === 'pengampu' ? '#0d9488' : '#64748b'} />
            <span>Riwayat Presensi Pengampu</span>
          </button>
        </div>
      )}

      {presensiCategory === 'pengampu' ? (
        <RiwayatPresensiPengampuView 
          currentRole={currentRole}
          showToast={showToast}
          setActiveTab={setActiveTab}
          authUser={authUser}
        />
      ) : (
        <>
      
      {/* ══════════ 1. HEADER HALAMAN ══════════ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '3px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <CheckSquare size={13} />
              <span>PRESENSI HARIAN</span>
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Presensi Halaqah Santri
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Catat kehadiran halaqah harian santri untuk pelaporan terpusat
          </p>
        </div>

        {/* Action Buttons */}
        {currentRole !== 'orangtua' ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleMarkAllPresent}
              style={{
                ...btnBase,
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                color: '#15803d',
                borderRadius: '10px',
                padding: '9px 16px',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Tandai Semua Hadir</span>
            </button>
            
            <button 
              type="button"
              onClick={handleSave}
              style={{ 
                ...btnBase,
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '9px 20px',
                fontWeight: 800,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
              }}
            >
              <Save size={16} />
              <span>Simpan Presensi</span>
            </button>
          </div>
        ) : (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '0.80rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Eye size={16} color="#059669" />
            <span>Mode Pantau Wali Santri (Read-Only)</span>
          </div>
        )}
      </div>

      {/* ══════════ 2. SELECTOR HALAQAH & TANGGAL BAR ══════════ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Quick Period Selector: Hari Ini | Kemarin | Bulan Ini | Pilih Tanggal */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '14px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap', marginRight: '4px' }}>
            Periode Presensi:
          </span>
          {[
            { id: 'hari-ini', label: 'Hari Ini' },
            { id: 'kemarin', label: 'Kemarin' },
            { id: 'bulan-ini', label: 'Bulan Ini (Rekap)' },
            { id: 'custom', label: 'Pilih Tanggal' }
          ].map(p => {
            const isActive = periodFilter === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPeriodFilter(p.id);
                  if (p.id === 'hari-ini') setSelectedTanggal(todayISO);
                  if (p.id === 'kemarin') setSelectedTanggal(yesterdayISO);
                }}
                style={{
                  border: `1.5px solid ${isActive ? '#15803d' : '#cbd5e1'}`,
                  background: isActive ? '#15803d' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '0.80rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(21,128,61,0.2)' : 'none'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Halaqah Info */}
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.76rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Halaqah Bimbingan:
            </label>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#15803d',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                flexShrink: 0
              }}>
                W
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedHalaqah?.nama || "Halaqah Ustadz Wahyudin (X A - Ikhwan)"}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  {santriInHalaqah.length} Santri Bimbingan
                </div>
              </div>
            </div>
          </div>

          {/* Tanggal Presensi */}
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.76rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              {periodFilter === 'bulan-ini' ? 'Bulan Berjalan:' : 'Tanggal Presensi:'}
            </label>
            {periodFilter === 'bulan-ini' ? (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 800,
                fontSize: '0.84rem',
                color: '#15803d',
                height: '40px'
              }}>
                <Calendar size={15} />
                <span>September 2026 ({totalMonthlySessionsCount} Sesi)</span>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input 
                  type="date" 
                  className="form-input"
                  value={selectedTanggal}
                  onChange={(e) => {
                    setSelectedTanggal(e.target.value);
                    setPeriodFilter('custom');
                  }}
                  style={{
                    fontWeight: 700,
                    height: '40px',
                    borderRadius: '10px',
                    borderColor: '#e2e8f0',
                    background: '#ffffff',
                    fontSize: '0.84rem',
                    paddingLeft: '34px'
                  }}
                />
                <Calendar size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            )}
          </div>

          {/* Musyrif Info */}
          <div>
            <label style={{ fontWeight: 700, fontSize: '0.76rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Musyrif Pengampu:
            </label>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803d' }}>
              {selectedHalaqah?.musyrif || "Wahyudin Hafiz, S.Pd"}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
              {periodFilter === 'bulan-ini' 
                ? `${avgMonthlyAttendance}% Rata-rata Kehadiran Bulan Ini`
                : `${persenHadir}% Kehadiran Sesi ${selectedSesiObj?.nama || "Ini"}`}
            </div>
          </div>
        </div>
      </div>

      {periodFilter === 'bulan-ini' ? (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Monthly KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '18px'
          }}>
            <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #15803d' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '4px' }}>
                Total Sesi Bulan Ini
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{totalMonthlySessionsCount}</span>
                <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700 }}>Sesi Halaqah</span>
              </div>
            </div>

            <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #0d9488' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', marginBottom: '4px' }}>
                Rata-Rata Kehadiran
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f766e' }}>{avgMonthlyAttendance}%</span>
                <span style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 700 }}>Disiplin Santri</span>
              </div>
            </div>

            <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '4px' }}>
                Total Izin &amp; Sakit
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0369a1' }}>{totalIAll + totalSAll}</span>
                <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>{totalIAll} Izin • {totalSAll} Sakit</span>
              </div>
            </div>

            <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #f43f5e' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#be123c', textTransform: 'uppercase', marginBottom: '4px' }}>
                Total Alpa (A)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#be123c' }}>{totalAAll}</span>
                <span style={{ fontSize: '0.74rem', color: '#f43f5e', fontWeight: 600 }}>Tanpa Keterangan</span>
              </div>
            </div>
          </div>

          {/* Tabel Rekap Santri Bulanan (Desktop View) */}
          <div className="rekap-bulan-desktop-table card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  Rekapitulasi Kehadiran Santri Bulan Ini ({santriInHalaqah.length} Santri)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Akumulasi persentase dan frekuensi hadir santri halaqah selama bulan berjalan
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                    <th style={{ width: '45px', padding: '12px 14px', textAlign: 'center' }}>No</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left' }}>Santri</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left' }}>NIS Santri</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Hadir</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Izin</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Sakit</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Alpa</th>
                    <th style={{ width: '220px', padding: '12px 14px', textAlign: 'left' }}>Kehadiran (%)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStudentStats.map((st, idx) => {
                    const isExcellent = st.persen >= 90;
                    const isGood = st.persen >= 75 && st.persen < 90;
                    return (
                      <tr key={st.santri.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b', padding: '12px 10px' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: '#ecfdf5',
                              color: '#047857',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.86rem',
                              flexShrink: 0
                            }}>
                              {st.santri.nama.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{st.santri.nama}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Target: {st.santri.targetJuz || 10} Juz</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>NIS: {st.santri.nis}</div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                          <span style={{ background: '#ecfdf5', color: '#047857', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                            {st.hadir}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                          <span style={{ background: '#f0f9ff', color: '#0284c7', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                            {st.izin}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                          <span style={{ background: '#fffbeb', color: '#b45309', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                            {st.sakit}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 10px' }}>
                          <span style={{ background: '#fff1f2', color: '#e11d48', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                            {st.alpa}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${st.persen}%`,
                                height: '100%',
                                background: isExcellent ? '#10b981' : isGood ? '#f59e0b' : '#ef4444',
                                borderRadius: '4px'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', width: '38px', textAlign: 'right' }}>
                              {st.persen}%
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 14px' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: isExcellent ? '#dcfce7' : isGood ? '#fef3c7' : '#fee2e2',
                            color: isExcellent ? '#15803d' : isGood ? '#b45309' : '#b91c1c'
                          }}>
                            {isExcellent ? 'Sangat Rajin' : isGood ? 'Rajin' : 'Perlu Bimbingan'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kartu Rekap Santri Bulanan (Mobile View) */}
          <div className="rekap-bulan-mobile-cards" style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
              Rekap Kehadiran Santri ({santriInHalaqah.length})
            </div>
            {monthlyStudentStats.map((st, idx) => {
              const isExcellent = st.persen >= 90;
              const isGood = st.persen >= 75 && st.persen < 90;
              return (
                <div
                  key={`mob-month-${st.santri.id}`}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        color: '#047857',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.84rem',
                        flexShrink: 0
                      }}>
                        {st.santri.nama.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {st.santri.nama}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                          NIS: {st.santri.nis}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      background: isExcellent ? '#dcfce7' : isGood ? '#fef3c7' : '#fee2e2',
                      color: isExcellent ? '#15803d' : isGood ? '#b45309' : '#b91c1c'
                    }}>
                      {st.persen}%
                    </span>
                  </div>

                  {/* 4 Stat Pills */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                    <div style={{ background: '#ecfdf5', padding: '4px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#047857', fontWeight: 700 }}>Hadir</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#064e3b' }}>{st.hadir}</div>
                    </div>
                    <div style={{ background: '#f0f9ff', padding: '4px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#0284c7', fontWeight: 700 }}>Izin</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0369a1' }}>{st.izin}</div>
                    </div>
                    <div style={{ background: '#fffbeb', padding: '4px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#b45309', fontWeight: 700 }}>Sakit</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#92400e' }}>{st.sakit}</div>
                    </div>
                    <div style={{ background: '#fff1f2', padding: '4px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#e11d48', fontWeight: 700 }}>Alpa</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#be123c' }}>{st.alpa}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${st.persen}%`,
                      height: '100%',
                      background: isExcellent ? '#10b981' : isGood ? '#f59e0b' : '#ef4444'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daftar Sesi Halaqah Tersimpan Bulan Ini */}
          <div className="card" style={{ padding: '16px 18px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              Riwayat Sesi Halaqah Bulan Ini ({monthlySessions.length} Sesi Terlaksana)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {monthlySessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.82rem' }}>
                  Belum ada sesi presensi yang tersimpan di bulan ini.
                </div>
              ) : (
                monthlySessions.map((ses, idx) => {
                  let hadirCount = 0;
                  if (ses.records) {
                    hadirCount = Object.values(ses.records).filter(r => r.status === 'H').length;
                  }
                  const rate = santriInHalaqah.length > 0 ? Math.round((hadirCount / santriInHalaqah.length) * 100) : 100;
                  return (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          background: '#ecfdf5',
                          color: '#15803d',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.78rem'
                        }}>
                          {ses.tanggal}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                            {ses.sesi || "Ba'da Subuh"}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {hadirCount}/{santriInHalaqah.length} Santri Hadir ({rate}%)
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTanggal(ses.tanggal);
                          if (ses.sesiId) setSelectedSesiId(ses.sesiId);
                          setPeriodFilter('custom');
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #15803d',
                          color: '#15803d',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.76rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} />
                        <span>Lihat Detail Sesi</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* ══════════ 2.5. PILIHAN SESI HALAQAH AKTIF HARI INI ══════════ */}
      {/* ─── DESKTOP (>= 1024px): KARTU LENGKAP DENGAN IKON & DETAIL ─── */}
      <div className="session-desktop-view" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px 18px',
        marginBottom: '18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Title Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#ecfdf5',
              color: '#15803d',
              padding: '3px 9px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Clock size={13} />
              <span>SESI HALAQAH</span>
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
              Pilihan Sesi Aktif ({hariName}):
            </span>
            <span style={{
              background: '#f1f5f9',
              color: '#15803d',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {effectiveSesiList.length} Sesi Aktif
            </span>
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
            Sesi Terpilih: <strong style={{ color: '#15803d' }}>{selectedSesiObj?.nama}</strong> ({selectedSesiObj?.mulai} - {selectedSesiObj?.selesai} WIB)
          </div>
        </div>

        {/* Grid Cards of Active Sessions */}
        <div className="session-card-grid">
          {effectiveSesiList.map(sesi => {
            const isSelected = selectedSesiId === sesi.id;

            // Cek apakah data absensi sesi ini sudah pernah disimpan di absensiList
            const existingSessionRecord = absensiList.find(
              a => a.tanggal === selectedTanggal && 
                   a.halaqahId === selectedHalaqahId &&
                   (a.sesiId === sesi.id || (!a.sesiId && (sesi.id === 'subuh' || a.sesi === sesi.nama)))
            );
            const isSaved = !!(existingSessionRecord && existingSessionRecord.records);
            
            // Hitung statistik sesi jika sudah disimpan
            let sessionHadirCount = 0;
            if (isSaved && existingSessionRecord.records) {
              sessionHadirCount = santriInHalaqah.filter(
                s => existingSessionRecord.records[s.id]?.status === 'H'
              ).length;
            }

            // Ikon & warna khas per sesi
            const sesiTheme = {
              'subuh': {
                icon: <Sunrise size={18} strokeWidth={2.4} />,
                color: '#d97706',
                bgIcon: '#fef3c7'
              },
              'pagi': {
                icon: <Sun size={18} strokeWidth={2.4} />,
                color: '#ca8a04',
                bgIcon: '#fef9c3'
              },
              'ashar': {
                icon: <CloudSun size={18} strokeWidth={2.4} />,
                color: '#0284c7',
                bgIcon: '#e0f2fe'
              },
              'malam': {
                icon: <Moon size={18} strokeWidth={2.4} />,
                color: '#7c3aed',
                bgIcon: '#ede9fe'
              }
            }[sesi.id] || {
              icon: <Clock size={18} strokeWidth={2.4} />,
              color: '#15803d',
              bgIcon: '#dcfce7'
            };

            return (
              <div
                key={sesi.id}
                onClick={() => setSelectedSesiId(sesi.id)}
                style={{
                  background: isSelected ? '#f0fdf4' : '#ffffff',
                  border: `2px solid ${isSelected ? '#15803d' : '#e2e8f0'}`,
                  borderRadius: '14px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected 
                    ? '0 4px 14px rgba(21,128,61,0.18)' 
                    : '0 1px 3px rgba(0,0,0,0.02)',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                  position: 'relative'
                }}
              >
                {/* Header Card: Icon + Status Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9px',
                    background: isSelected ? '#dcfce7' : sesiTheme.bgIcon,
                    color: isSelected ? '#15803d' : sesiTheme.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {sesiTheme.icon}
                  </div>

                  {/* Badge Status Kehadiran / Terpilih */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {isSelected && (
                      <span style={{
                        background: '#15803d',
                        color: '#ffffff',
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '5px',
                        letterSpacing: '0.02em'
                      }}>
                        ✓ AKTIF
                      </span>
                    )}

                    {isSaved ? (
                      <span style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Check size={11} strokeWidth={3} />
                        <span>{sessionHadirCount}/{total} Hadir</span>
                      </span>
                    ) : (
                      <span style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        Belum Diabsen
                      </span>
                    )}
                  </div>
                </div>

                {/* Sesi Nama & Jam */}
                <div>
                  <div style={{
                    fontWeight: 800,
                    fontSize: '0.90rem',
                    color: isSelected ? '#14532d' : '#0f172a',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {sesi.nama}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: isSelected ? '#15803d' : '#64748b',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={11} />
                    <span>{sesi.mulai} – {sesi.selesai}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── MOBILE (< 1024px): TEPAT 2 BARIS SAJA (2x2 GRID, HANYA NAMA SESI) ─── */}
      <div className="session-mobile-view" style={{ marginBottom: '14px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          {effectiveSesiList.map(sesi => {
            const isSelected = selectedSesiId === sesi.id;
            return (
              <button
                key={sesi.id}
                type="button"
                onClick={() => setSelectedSesiId(sesi.id)}
                style={{
                  ...btnBase,
                  height: '42px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 10px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  background: isSelected ? '#15803d' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#1e293b',
                  border: `1.5px solid ${isSelected ? '#15803d' : '#cbd5e1'}`,
                  boxShadow: isSelected ? '0 3px 10px rgba(21,128,61,0.25)' : '0 1px 2px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {sesi.nama}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════ 3. RECAP STATS KARTU 4 STATUS (RESPONSIF) ══════════ */}
      {/* ─── DESKTOP (>= 1024px): 4 KARTU BESAR ─── */}
      <div className="recap-desktop-view" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '18px'
      }}>
        {/* HADIR */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'H' ? 'ALL' : 'H')}
          style={{
            background: '#ffffff',
            border: `1.8px solid ${statusFilter === 'H' ? '#10b981' : '#e2e8f0'}`,
            borderRadius: '14px',
            padding: '12px 14px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'H' ? '0 4px 12px rgba(16,185,129,0.18)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857' }}>HADIR (H)</span>
            <span style={{ fontSize: '10px', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '8px' }}>
              {persenHadir}%
            </span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#064e3b' }}>
            {countH} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>/ {total}</span>
          </div>
        </div>

        {/* IZIN */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'I' ? 'ALL' : 'I')}
          style={{
            background: '#ffffff',
            border: `1.8px solid ${statusFilter === 'I' ? '#0284c7' : '#e2e8f0'}`,
            borderRadius: '14px',
            padding: '12px 14px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'I' ? '0 4px 12px rgba(2,132,199,0.18)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1' }}>IZIN (I)</span>
            <Clock size={13} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#075985' }}>
            {countI} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Santri</span>
          </div>
        </div>

        {/* ALPA */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'A' ? 'ALL' : 'A')}
          style={{
            background: '#ffffff',
            border: `1.8px solid ${statusFilter === 'A' ? '#f43f5e' : '#e2e8f0'}`,
            borderRadius: '14px',
            padding: '12px 14px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'A' ? '0 4px 12px rgba(244,63,94,0.18)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be123c' }}>ALPA (A)</span>
            <X size={13} color="#e11d48" strokeWidth={3} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#881337' }}>
            {countA} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Santri</span>
          </div>
        </div>

        {/* SAKIT */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'S' ? 'ALL' : 'S')}
          style={{
            background: '#ffffff',
            border: `1.8px solid ${statusFilter === 'S' ? '#f59e0b' : '#e2e8f0'}`,
            borderRadius: '14px',
            padding: '12px 14px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'S' ? '0 4px 12px rgba(245,158,11,0.18)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309' }}>SAKIT (S)</span>
            <HeartPulse size={13} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#78350f' }}>
            {countS} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Santri</span>
          </div>
        </div>
      </div>

      {/* ─── MOBILE (< 1024px): TEPAT 1 BARIS (4 KOLOM RINGKAS SEIMBANG) ─── */}
      <div className="recap-mobile-view" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        marginBottom: '14px'
      }}>
        {/* HADIR */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'H' ? 'ALL' : 'H')}
          style={{
            background: '#ffffff',
            border: `1.5px solid ${statusFilter === 'H' ? '#10b981' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '7px 4px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: statusFilter === 'H' ? '0 2px 8px rgba(16,185,129,0.18)' : '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
            HADIR
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#064e3b', lineHeight: 1.1 }}>
            {countH}
          </div>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
            {persenHadir}%
          </div>
        </div>

        {/* IZIN */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'I' ? 'ALL' : 'I')}
          style={{
            background: '#ffffff',
            border: `1.5px solid ${statusFilter === 'I' ? '#0284c7' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '7px 4px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: statusFilter === 'I' ? '0 2px 8px rgba(2,132,199,0.18)' : '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0284c7', marginBottom: '2px' }}>
            IZIN
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0369a1', lineHeight: 1.1 }}>
            {countI}
          </div>
          <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>
            Santri
          </div>
        </div>

        {/* ALPA */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'A' ? 'ALL' : 'A')}
          style={{
            background: '#ffffff',
            border: `1.5px solid ${statusFilter === 'A' ? '#f43f5e' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '7px 4px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: statusFilter === 'A' ? '0 2px 8px rgba(244,63,94,0.18)' : '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#e11d48', marginBottom: '2px' }}>
            ALPA
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#be123c', lineHeight: 1.1 }}>
            {countA}
          </div>
          <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>
            Santri
          </div>
        </div>

        {/* SAKIT */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'S' ? 'ALL' : 'S')}
          style={{
            background: '#ffffff',
            border: `1.5px solid ${statusFilter === 'S' ? '#f59e0b' : '#e2e8f0'}`,
            borderRadius: '12px',
            padding: '7px 4px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: statusFilter === 'S' ? '0 2px 8px rgba(245,158,11,0.18)' : '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b45309', marginBottom: '2px' }}>
            SAKIT
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#92400e', lineHeight: 1.1 }}>
            {countS}
          </div>
          <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>
            Santri
          </div>
        </div>
      </div>

      {/* Filter Active Alert */}
      {statusFilter !== 'ALL' && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '8px 14px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.80rem'
        }}>
          <span>
            Menampilkan santri berstatus: <strong>{statusFilter === 'H' ? 'Hadir' : statusFilter === 'I' ? 'Izin' : statusFilter === 'A' ? 'Alpa' : 'Sakit'}</strong> ({displayedSantri.length} santri)
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            style={{ ...btnBase, background: 'none', color: '#15803d', fontWeight: 800, fontSize: '0.78rem' }}
          >
            Tampilkan Semua ✕
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4A. 🖥️ TAMPILAN MODE DESKTOP (LAYAR LEBAR >= 1024px)
          Kembali seperti model sebelumnya: Tabel 5 kolom lengkap
          (No, Santri + Target, Kelas & NIS, 4 Tombol Status Warna, Catatan)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="attendance-desktop-table-view card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ width: '50px', padding: '12px 14px', textAlign: 'center' }}>No</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Santri</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>NIS Santri</th>
                <th style={{ width: '280px', padding: '12px 14px', textAlign: 'center' }}>Status Kehadiran</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Keterangan / Alasan Khusus</th>
              </tr>
            </thead>
            <tbody>
              {displayedSantri.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    {santriInHalaqah.length === 0 
                      ? "Belum ada santri yang terdaftar di halaqah ini."
                      : "Tidak ada santri dengan status yang dipilih."}
                  </td>
                </tr>
              ) : (
                displayedSantri.map((s, idx) => {
                  const currentStatus = records[s.id]?.status || 'H';
                  const currentCatatan = records[s.id]?.catatan || '';

                  // Avatar background berdasar status terkini
                  const avatarBgMap = {
                    'H': { bg: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' },
                    'I': { bg: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' },
                    'S': { bg: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' },
                    'A': { bg: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }
                  };
                  const currentAvatarStyle = avatarBgMap[currentStatus] || avatarBgMap['H'];

                  return (
                    <tr 
                      key={`desktop-${s.id}`} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Nomor */}
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b', padding: '12px 10px' }}>
                        {idx + 1}
                      </td>

                      {/* Identitas Santri + Target Capaian (Sesuai Versi Desktop Sebelumnya) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: currentAvatarStyle.bg,
                            color: currentAvatarStyle.color,
                            border: currentAvatarStyle.border,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.88rem',
                            flexShrink: 0
                          }}>
                            {s.nama.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              {s.nama}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                              Target: <strong>{s.targetJuz || 10} Juz</strong> • Capaian: <span style={{ color: '#047857', fontWeight: 700 }}>{s.juzMutqin?.length || 0} Juz Mutqin</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NIS */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.84rem', color: '#334155', fontFamily: 'monospace', fontWeight: 700 }}>
                          NIS: {s.nis}
                        </div>
                      </td>

                      {/* PILIHAN 4 STATUS KEHADIRAN (READ-ONLY UNTUK ORANG TUA) */}
                      <td style={{ textAlign: 'center', padding: '12px 14px' }}>
                        {currentRole !== 'orangtua' ? (
                          <div className="attendance-status-container">
                            {/* HADIR (H) */}
                            <button
                              type="button"
                              className={`att-status-btn att-hadir ${currentStatus === 'H' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(s.id, 'H')}
                              title="Tandai Hadir"
                            >
                              <Check size={13} strokeWidth={3} />
                              <span>Hadir</span>
                            </button>

                            {/* IZIN (I) */}
                            <button
                              type="button"
                              className={`att-status-btn att-izin ${currentStatus === 'I' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(s.id, 'I')}
                              title="Tandai Izin"
                            >
                              <Info size={13} strokeWidth={2.5} />
                              <span>Izin</span>
                            </button>

                            {/* SAKIT (S) */}
                            <button
                              type="button"
                              className={`att-status-btn att-sakit ${currentStatus === 'S' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(s.id, 'S')}
                              title="Tandai Sakit"
                            >
                              <HeartPulse size={13} strokeWidth={2.5} />
                              <span>Sakit</span>
                            </button>

                            {/* ALPA (A) */}
                            <button
                              type="button"
                              className={`att-status-btn att-alpa ${currentStatus === 'A' ? 'active' : ''}`}
                              onClick={() => handleStatusChange(s.id, 'A')}
                              title="Tandai Alpa"
                            >
                              <X size={13} strokeWidth={3} />
                              <span>Alpa</span>
                            </button>
                          </div>
                        ) : (
                          <div>
                            {currentStatus === 'H' && (
                              <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Check size={14} strokeWidth={3} />
                                <span>HADIR (H)</span>
                              </span>
                            )}
                            {currentStatus === 'I' && (
                              <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Info size={14} />
                                <span>IZIN (I)</span>
                              </span>
                            )}
                            {currentStatus === 'S' && (
                              <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <HeartPulse size={14} />
                                <span>SAKIT (S)</span>
                              </span>
                            )}
                            {currentStatus === 'A' && (
                              <span style={{ background: '#ffe4e6', color: '#be123c', border: '1px solid #fecdd3', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <X size={14} strokeWidth={3} />
                                <span>ALPA (A)</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* INPUT KETERANGAN & QUICK PRESET CHIPS */}
                      <td style={{ padding: '12px 14px' }}>
                        {currentRole !== 'orangtua' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder={currentStatus === 'H' ? 'Catatan (misal "Tepat Waktu")' : 'Alasan ketidakhadiran santri...'}
                              value={currentCatatan}
                              onChange={(e) => handleCatatanChange(s.id, e.target.value)}
                              style={{ 
                                padding: '6px 10px', 
                                fontSize: '0.82rem',
                                borderColor: currentStatus === 'H' ? '#a7f3d0' : currentStatus === 'I' ? '#bae6fd' : currentStatus === 'S' ? '#fde68a' : '#fecdd3'
                              }}
                            />

                            {/* Quick Presets */}
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {(quickPresets[currentStatus] || []).map((tag, tagIdx) => (
                                <button
                                  key={tagIdx}
                                  type="button"
                                  onClick={() => handleCatatanChange(s.id, tag)}
                                  style={{
                                    background: currentCatatan === tag ? '#047857' : '#f1f5f9',
                                    color: currentCatatan === tag ? '#ffffff' : '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    padding: '1px 6px',
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s'
                                  }}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: '#475569', fontSize: '0.84rem', fontStyle: currentCatatan ? 'normal' : 'italic' }}>
                            {currentCatatan || 'Tepat Waktu'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4B. 📱 TAMPILAN MODE MOBILE & TABLET (LAYAR < 1024px)
          Sesuai yang disukai user: Model Tekan Aja & Dua Baris Saja!
          ══════════════════════════════════════════════════════════════════════ */}
      <div 
        className="attendance-mobile-card-view"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          flexDirection: 'column'
        }}
      >
        {/* Header Baris Mobile */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.74rem',
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          <span>Daftar Santri ({displayedSantri.length})</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d' }}>
            <RefreshCw size={12} />
            <span>Tekan Status untuk Ganti</span>
          </span>
        </div>

        {/* List Santri Responsif (Dua Baris Saja & Model Tekan Aja) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayedSantri.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
              Tidak ada data santri untuk ditampilkan.
            </div>
          ) : (
            displayedSantri.map((s, idx) => {
              const currentStatus = records[s.id]?.status || 'H';
              const currentCatatan = records[s.id]?.catatan || '';
              const meta = statusMeta[currentStatus] || statusMeta['H'];
              const isNotPresent = currentStatus !== 'H';

              return (
                <div
                  key={`mobile-${s.id}`}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: isNotPresent ? meta.bg : '#ffffff',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Baris Utama Santri */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    {/* Sisi Kiri: Nomor + Avatar + DUA BARIS SAJA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        width: '20px',
                        textAlign: 'center',
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>

                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: meta.bg,
                        color: meta.color,
                        border: `1.8px solid ${meta.border}`,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.90rem',
                        flexShrink: 0
                      }}>
                        {s.nama.charAt(0).toUpperCase()}
                      </div>

                      {/* 🌟 HANYA DUA BARIS SAJA 🌟 */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontWeight: 800,
                          fontSize: '0.90rem',
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {s.nama}
                        </div>

                        <div style={{
                          fontSize: '0.74rem',
                          color: '#64748b',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontFamily: 'monospace'
                        }}>
                          NIS: {s.nis}
                        </div>
                      </div>
                    </div>

                    {/* Sisi Kanan: 🌟 MODEL TEKAN AJA ATAU BADGE BACA SAJA 🌟 */}
                    {isOrangTua ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: meta.bg,
                          color: meta.color,
                          border: `2px solid ${meta.border}`,
                          borderRadius: '12px',
                          padding: '8px 14px',
                          fontSize: '0.84rem',
                          fontWeight: 900,
                          minWidth: '94px',
                          height: '38px',
                          flexShrink: 0,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
                        }}
                      >
                        {meta.icon}
                        <span>{meta.label}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleNextStatus(s.id)}
                        title="Tekan untuk berganti status: Hadir ➔ Izin ➔ Alpa ➔ Sakit"
                        style={{
                          ...btnBase,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: meta.bg,
                          color: meta.color,
                          border: `2px solid ${meta.border}`,
                          borderRadius: '12px',
                          padding: '8px 14px',
                          fontSize: '0.84rem',
                          fontWeight: 900,
                          minWidth: '94px',
                          height: '38px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                          userSelect: 'none',
                          flexShrink: 0
                        }}
                      >
                        {meta.icon}
                        <span>{meta.label}</span>
                      </button>
                    )}
                  </div>

                  {/* Input Catatan jika Izin / Alpa / Sakit */}
                  {isNotPresent && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '4px',
                      paddingLeft: '30px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ fontSize: '0.70rem', fontWeight: 700, color: meta.color }}>
                        Alasan {meta.label}:
                      </span>
                      {isOrangTua ? (
                        <span style={{ fontSize: '0.76rem', color: '#334155', fontStyle: currentCatatan ? 'normal' : 'italic' }}>
                          {currentCatatan || 'Tidak ada catatan'}
                        </span>
                      ) : (
                        <>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder={`Keterangan ${meta.label.toLowerCase()}...`}
                            value={currentCatatan}
                            onChange={(e) => handleCatatanChange(s.id, e.target.value)}
                            style={{ 
                              height: '28px',
                              padding: '2px 10px', 
                              fontSize: '0.76rem',
                              maxWidth: '220px',
                              borderRadius: '6px',
                              borderColor: meta.border,
                              background: '#ffffff'
                            }}
                          />

                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {(quickPresets[currentStatus] || []).map((tag, tagIdx) => (
                              <button
                                key={tagIdx}
                                type="button"
                                onClick={() => handleCatatanChange(s.id, tag)}
                                style={{
                                  ...btnBase,
                                  background: currentCatatan === tag ? meta.color : '#ffffff',
                                  color: currentCatatan === tag ? '#ffffff' : '#475569',
                                  border: `1px solid ${currentCatatan === tag ? meta.color : '#cbd5e1'}`,
                                  borderRadius: '6px',
                                  padding: '1px 7px',
                                  fontSize: '10px',
                                  fontWeight: 600
                                }}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══════════ 5. CATATAN SESI & TOMBOL SIMPAN ══════════ */}
      {isOrangTua ? (
        catatanHalaqah ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Catatan Musyrif untuk Sesi {selectedSesiObj?.nama || "Halaqah"}:
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
              {catatanHalaqah}
            </div>
          </div>
        ) : null
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
            Catatan Evaluasi Musyrif untuk Sesi {selectedSesiObj?.nama || "Halaqah"} Hari Ini:
          </label>
          <textarea 
            className="form-textarea" 
            rows="2"
            placeholder="Tuliskan catatan singkat jalannya halaqah, adab santri, evaluasi tajwid, dll..."
            value={catatanHalaqah}
            onChange={(e) => setCatatanHalaqah(e.target.value)}
            style={{
              marginBottom: '14px',
              fontSize: '0.82rem',
              borderRadius: '10px',
              borderColor: '#e2e8f0'
            }}
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              💡 <em>Data tersinkron otomatis ke laporan wali santri &amp; rekap Super Admin.</em>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                style={{
                  ...btnBase,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  color: '#334155'
                }}
              >
                Semua Hadir
              </button>
              <button 
                type="button"
                onClick={handleSave}
                style={{ 
                  ...btnBase,
                  background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '9px 22px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
                }}
              >
                <Save size={16} />
                <span>Simpan Presensi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating mobile save bar when editing daily attendance - HIDDEN for Orang Tua */}
      {!isOrangTua && (
        <div 
          className="mobile-save-bar"
          style={{
            position: 'fixed',
            bottom: '68px',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid #e2e8f0',
            padding: '10px 16px',
            display: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 90,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.08)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Kehadiran {selectedSesiObj?.nama}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#15803d' }}>
              {countH}/{total} Hadir ({persenHadir}%)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleMarkAllPresent}
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#15803d',
                padding: '8px 12px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.76rem',
                cursor: 'pointer'
              }}
            >
              Semua H
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                background: '#15803d',
                border: 'none',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.80rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(21,128,61,0.3)'
              }}
            >
              <Save size={14} />
              <span>Simpan</span>
            </button>
          </div>
        </div>
      )}
      </>
      )}
      </>
      )}

    </div>
  );
}
