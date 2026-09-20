import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Download, 
  UserCheck, 
  QrCode, 
  MapPin, 
  Filter, 
  RefreshCw, 
  FileText, 
  ChevronRight, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Users, 
  ArrowUpRight,
  Sunrise,
  Sun,
  CloudSun,
  Moon
} from 'lucide-react';
import { storageService } from '../services/storage';
import CustomSelect from './common/CustomSelect';

export default function RiwayatPresensiPengampuView({ 
  currentRole = 'pengampu', 
  showToast, 
  setActiveTab,
  authUser
}) {
  const todayISO = new Date().toISOString().split('T')[0];
  const yesterdayISO = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'hari-ini' | 'kemarin' | 'bulan-ini' | 'custom'
  const [selectedTanggal, setSelectedTanggal] = useState(todayISO);
  const [selectedSesiFilter, setSelectedSesiFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [pengampuPresensiList, setPengampuPresensiList] = useState(storageService.getPengampuPresensiList());
  const [monitoringData, setMonitoringData] = useState(storageService.getSigapMonitoring());
  const [guruList, setGuruList] = useState(storageService.getSigapGuru());
  const [jadwalHalaqoh, setJadwalHalaqoh] = useState(storageService.getJadwalHalaqoh());
  const [izinList, setIzinList] = useState(storageService.getSigapIzinGuru());

  // Reload data on sync events
  const reloadData = () => {
    setPengampuPresensiList(storageService.getPengampuPresensiList());
    setMonitoringData(storageService.getSigapMonitoring());
    setGuruList(storageService.getSigapGuru());
    setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    setIzinList(storageService.getSigapIzinGuru());
  };

  useEffect(() => {
    const handleSync = () => reloadData();
    window.addEventListener('sigap_jadwal_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sigap_jadwal_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const masterSesiList = jadwalHalaqoh?.sesiList || [
    { id: 'subuh', nama: "Ba'da Subuh", mulai: '05:00', selesai: '06:30' },
    { id: 'pagi', nama: 'Pagi / Dhuha', mulai: '08:30', selesai: '10:00' },
    { id: 'ashar', nama: "Ba'da Ashar", mulai: '16:00', selesai: '17:30' },
    { id: 'malam', nama: "Ba'da Maghrib", mulai: '18:45', selesai: '20:30' }
  ];

  // Logged in teacher details
  const currentAuth = authUser || storageService.getAuthUser();
  const myName = currentAuth?.nama || 'Wahyudin Hafiz, S.Pd';
  const cleanMyName = (myName || '').toLowerCase().replace(/^(ustadz\s+|ustadzah\s+)/i, '').trim();
  const myGuru = guruList.find(g => {
    const gn = (g.nama || '').toLowerCase().replace(/^(ustadz\s+|ustadzah\s+)/i, '').trim();
    return gn && (gn.includes(cleanMyName) || cleanMyName.includes(gn));
  }) || {
    nama: myName,
    nip: currentAuth?.nip || '19880101201501',
    jabatan: currentAuth?.halaqahNama || 'Koordinator Tahfidz & Musyrif Halaqah'
  };

  const isTeacherMatch = (targetNama) => {
    if (!targetNama) return false;
    const cleanTarget = (targetNama || '').toLowerCase().replace(/^(ustadz\s+|ustadzah\s+)/i, '').trim();
    return cleanTarget.includes(cleanMyName) || cleanMyName.includes(cleanTarget);
  };

  // Map session icon
  const getSesiIcon = (sesiNama = '') => {
    const s = sesiNama.toLowerCase();
    if (s.includes('subuh')) return <Sunrise size={16} color="#0d9488" />;
    if (s.includes('pagi') || s.includes('dhuha')) return <Sun size={16} color="#eab308" />;
    if (s.includes('ashar')) return <CloudSun size={16} color="#f97316" />;
    if (s.includes('maghrib') || s.includes('malam') || s.includes('isya')) return <Moon size={16} color="#6366f1" />;
    return <Clock size={16} color="#0d9488" />;
  };

  // Format date helper: "13 Sep 2026" or "Senin, 10-09-2026"
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    try {
      if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Compile combined attendance records STRICTLY for the logged-in teacher (myName)
  const buildRecords = () => {
    const records = [];

    // 1. From real-time scans in PENGAMPU_PRESENSI for this teacher
    pengampuPresensiList.forEach(p => {
      if (isTeacherMatch(p.namaGuru)) {
        const sesiObj = masterSesiList.find(s => s.id === p.sesiId) || {};
        const isLate = (p.keterangan || '').toLowerCase().includes('telat') || (p.status || '').toLowerCase().includes('telat');
        records.push({
          id: p.id || `pp-${p.tanggal}-${p.sesiId}`,
          nama: p.namaGuru || myName,
          nip: p.nip || myGuru.nip || '19880101201501',
          role: 'Pengampu Halaqoh',
          tanggal: p.tanggal,
          sesiId: p.sesiId,
          sesi: p.sesiNama || sesiObj.nama || "Ba'da Subuh",
          mapel: `Tahfidz (${p.sesiNama || sesiObj.nama || 'Halaqah'})`,
          lokasi: p.lokasiNama || p.lokasiKode || 'Lokal Ikhwan Lantai 2 (X A)',
          jadwal: sesiObj.mulai ? `${sesiObj.mulai} - ${sesiObj.selesai}` : '05:00 - 06:30',
          jam: p.jamScan || '05.18',
          status: isLate ? 'Terlambat' : 'Tepat Waktu',
          keterangan: p.keterangan || (isLate ? 'Terlambat' : 'Tepat Waktu'),
          metode: 'QR Scan (GPS Locked)',
          lokasiGps: 'Lokal Ikhwan Lt 2 (Akurat 12m)'
        });
      }
    });

    // 2. From liveFeed in SIGAP_MONITORING for this teacher (if not duplicate)
    const liveFeeds = monitoringData?.liveFeed || [];
    liveFeeds.forEach(feed => {
      if (isTeacherMatch(feed.nama)) {
        const feedDate = feed.tanggal || todayISO;
        const cleanDate = feedDate.includes('-') && feedDate.split('-')[0].length === 2 
          ? feedDate.split('-').reverse().join('-') 
          : feedDate;

        const isDuplicate = records.some(r => 
          r.tanggal === cleanDate && 
          r.sesi.toLowerCase().includes((feed.sesi || '').toLowerCase())
        );

        if (!isDuplicate) {
          records.push({
            id: feed.id || `feed-${cleanDate}-${feed.sesi}`,
            nama: feed.nama || myName,
            nip: feed.nip || myGuru.nip || '19880101201501',
            role: feed.role || 'Pengampu Halaqoh',
            tanggal: cleanDate,
            sesiId: (feed.sesi || '').toLowerCase().includes('subuh') ? 'subuh' : 'malam',
            sesi: feed.sesi || "Ba'da Subuh",
            mapel: feed.mapel || 'Halaqoh Tahfidz',
            lokasi: feed.kelas || 'Lokal Ikhwan Lantai 2 (X A)',
            jadwal: feed.jadwal || '05:00 - 06:30',
            jam: feed.jam || '-',
            status: feed.status || 'Tepat Waktu',
            keterangan: feed.keterangan || 'Tepat Waktu',
            metode: feed.metode || 'QR Scan (GPS Locked)',
            lokasiGps: feed.lokasiGps || 'Lokal Ikhwan Lt 2 (Akurat 12m)'
          });
        }
      }
    });

    // 3. From approved teacher leaves for this teacher
    izinList.forEach(iz => {
      if (isTeacherMatch(iz.nama)) {
        const tgl = iz.tanggalMulai || todayISO;
        const exists = records.some(r => r.tanggal === tgl && r.status === 'Izin');
        if (!exists) {
          records.push({
            id: iz.id || `iz-${tgl}`,
            nama: myName,
            nip: iz.nip || myGuru.nip || '19880101201501',
            role: 'Pengampu Halaqoh',
            tanggal: tgl,
            sesiId: 'all',
            sesi: iz.sesi || 'Semua Sesi',
            mapel: iz.halaqahNama || 'Halaqah Ustadz Wahyudin',
            lokasi: 'Izin Resmi Terverifikasi',
            jadwal: '-',
            jam: '-',
            status: 'Izin',
            keterangan: `Izin: ${iz.alasan || iz.jenisIzin || 'Disetujui'}`,
            metode: 'Surat Permohonan Izin',
            lokasiGps: '-'
          });
        }
      }
    });

    // Sort newest date and time first
    records.sort((a, b) => {
      if (a.tanggal !== b.tanggal) {
        return (b.tanggal || '').localeCompare(a.tanggal || '');
      }
      return (b.jam || '').localeCompare(a.jam || '');
    });

    return records;
  };

  const allMyRecords = buildRecords();

  // Filter records by Period, Session, Status, and Search Query
  const filteredRecords = allMyRecords.filter(item => {
    // Period Filter
    if (periodFilter === 'hari-ini') {
      if (item.tanggal !== todayISO) return false;
    } else if (periodFilter === 'kemarin') {
      if (item.tanggal !== yesterdayISO) return false;
    } else if (periodFilter === 'bulan-ini') {
      const currentMonth = todayISO.substring(0, 7); // "YYYY-MM"
      if (!item.tanggal.startsWith(currentMonth)) return false;
    } else if (periodFilter === 'custom') {
      if (item.tanggal !== selectedTanggal) return false;
    }

    // Session filter
    if (selectedSesiFilter !== 'ALL') {
      const cleanSesi = selectedSesiFilter.toLowerCase();
      const itemSesi = (item.sesi || '').toLowerCase();
      if (!itemSesi.includes(cleanSesi) && !cleanSesi.includes(itemSesi)) {
        return false;
      }
    }

    // Status filter
    if (selectedStatusFilter !== 'ALL') {
      if (selectedStatusFilter === 'TEPAT_WAKTU' && item.status !== 'Tepat Waktu') return false;
      if (selectedStatusFilter === 'TERLAMBAT' && item.status !== 'Terlambat') return false;
      if (selectedStatusFilter === 'IZIN' && item.status !== 'Izin') return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchLokasi = (item.lokasi || '').toLowerCase().includes(q);
      const matchSesi = (item.sesi || '').toLowerCase().includes(q);
      const matchKet = (item.keterangan || '').toLowerCase().includes(q);
      const matchTgl = (item.tanggal || '').toLowerCase().includes(q);
      if (!matchLokasi && !matchSesi && !matchKet && !matchTgl) return false;
    }

    return true;
  });

  // Calculate statistics strictly for this account
  const totalSesiHadir = allMyRecords.length;
  const countTepatWaktu = allMyRecords.filter(r => r.status === 'Tepat Waktu').length;
  const countTerlambat = allMyRecords.filter(r => r.status === 'Terlambat').length;
  const countIzin = allMyRecords.filter(r => r.status === 'Izin').length;
  const persenDisiplin = totalSesiHadir > 0 
    ? Math.round((countTepatWaktu / (totalSesiHadir - countIzin || 1)) * 100) 
    : 100;

  // Export to CSV for this account only
  const handleExportCSV = () => {
    const headers = ["No", "Tanggal", "Nama Pengampu", "NIP", "Sesi", "Jadwal", "Jam Scan", "Status", "Lokasi", "Keterangan"];
    const rows = filteredRecords.map((r, i) => [
      i + 1,
      `"${r.tanggal}"`,
      `"${r.nama}"`,
      `"${r.nip}"`,
      `"${r.sesi}"`,
      `"${r.jadwal}"`,
      `"${r.jam}"`,
      `"${r.status}"`,
      `"${r.lokasi}"`,
      `"${r.keterangan}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(row => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Riwayat_Presensi_${myName.replace(/[^a-zA-Z0-9]/g, '_')}_${periodFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Data riwayat presensi pengampu Anda berhasil diekspor ke CSV!");
  };

  // Status Badge Helper
  const renderStatusBadge = (status, keterangan) => {
    if (status === 'Tepat Waktu') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#ecfdf5',
          color: '#059669',
          border: '1px solid #a7f3d0',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.74rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={12} />
          <span>Tepat Waktu</span>
        </span>
      );
    }
    if (status === 'Terlambat') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#fffbeb',
          color: '#d97706',
          border: '1px solid #fde68a',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.74rem',
          fontWeight: 700
        }}>
          <AlertTriangle size={12} />
          <span>{keterangan?.includes('Telat') || keterangan?.includes('Terlambat') ? keterangan : 'Terlambat'}</span>
        </span>
      );
    }
    if (status === 'Izin') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#f0f9ff',
          color: '#0284c7',
          border: '1px solid #bae6fd',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.74rem',
          fontWeight: 700
        }}>
          <FileText size={12} />
          <span>Izin Resmi</span>
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: '#f8fafc',
        color: '#64748b',
        border: '1px solid #e2e8f0',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.74rem',
        fontWeight: 600
      }}>
        <Clock size={12} />
        <span>Belum Absen</span>
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* ─── STYLES RESPONSIVE KHUSUS DESKTOP VS MOBILE ─── */}
      <style>{`
        @media (min-width: 860px) {
          .pengampu-desktop-table-view {
            display: block !important;
          }
          .pengampu-mobile-card-view {
            display: none !important;
          }
        }
        @media (max-width: 859px) {
          .pengampu-desktop-table-view {
            display: none !important;
          }
          .pengampu-mobile-card-view {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
        }
      `}</style>

      {/* ─── 1. HEADER HALAMAN & ACTIONS ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '18px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              background: '#ccfbf1',
              color: '#0f766e',
              padding: '3px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <UserCheck size={13} />
              <span>PRESENSI PENGAMPU SAYA</span>
            </span>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Riwayat Presensi Pengampu
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
            Rekapitulasi log scan QR barcode, kepatuhan shift, dan riwayat kehadiran pribadi Anda
          </p>
        </div>

        {/* Action Buttons: Export & Refresh */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              padding: '7px 14px'
            }}
          >
            <Download size={15} />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              reloadData();
              showToast && showToast("Data presensi Anda telah dimutakhirkan.");
            }}
            className="btn btn-ghost btn-sm"
            title="Muat Ulang Data"
            style={{ padding: '7px 10px', color: '#64748b' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ─── 2. KARTU PRESENSI PRIBADI PENGAMPU (PERSONAL CARD) ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        borderRadius: '16px',
        padding: '18px 20px',
        color: '#ffffff',
        marginBottom: '20px',
        boxShadow: '0 6px 20px rgba(6, 95, 70, 0.20)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              border: '1.5px solid rgba(255,255,255,0.3)',
              flexShrink: 0
            }}>
              W
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  {myName}
                </h3>
                <span style={{
                  background: '#34d399',
                  color: '#064e3b',
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 800
                }}>
                  Pengampu Aktif
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#a7f3d0' }}>
                {currentAuth?.halaqahNama || `Halaqah ${myName}`} • Presensi Terverifikasi GPS & QR
              </p>
            </div>
          </div>

          {/* Quick Button to Scan */}
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('scan')}
            style={{
              background: '#ffffff',
              color: '#065f46',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(0,0,0,0.12)'
            }}
          >
            <QrCode size={16} />
            <span>Buka Kamera QR Scan</span>
          </button>
        </div>

        {/* Sesi Status Pills Hari Ini */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginTop: '16px',
          position: 'relative',
          zIndex: 1
        }}>
          {masterSesiList.map(sesi => {
            const checkScan = storageService.isPengampuSudahScan(myName, sesi.id, todayISO);
            const isDone = checkScan.sudah;
            return (
              <div 
                key={sesi.id}
                style={{
                  background: isDone ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)',
                  border: isDone ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  backdropFilter: 'blur(6px)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: 700 }}>
                    {getSesiIcon(sesi.nama)}
                    <span>{sesi.nama}</span>
                  </div>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: isDone ? '#dcfce7' : 'rgba(255,255,255,0.15)',
                    color: isDone ? '#15803d' : '#e2e8f0'
                  }}>
                    {isDone ? '✓ Hadir' : 'Belum'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{sesi.mulai} - {sesi.selesai}</span>
                  <span style={{ fontWeight: 700, color: isDone ? '#6ee7b7' : '#cbd5e1' }}>
                    {isDone ? `${checkScan.jamScan} WIB` : 'Menunggu'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. RINGKASAN KPI KEHADIRAN PENGAMPU (PERSONAL ACCOUNT ONLY) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #0d9488' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Total Presensi
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{totalSesiHadir}</span>
            <span style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 700 }}>Sesi Tercatat</span>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', marginBottom: '4px' }}>
            Tepat Waktu
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>{countTepatWaktu}</span>
            <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>{persenDisiplin}% Disiplin</span>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '4px' }}>
            Terlambat Masuk
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b45309' }}>{countTerlambat}</span>
            <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>Toleransi &gt; 15m</span>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '4px' }}>
            Izin / Dispensasi
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0369a1' }}>{countIzin}</span>
            <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>Surat Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* ─── 4. FILTER BAR & PERIOD SELECTOR ─── */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: '18px' }}>
        {/* Quick Period Buttons: Semua | Hari Ini | Kemarin | Bulan Ini | Pilih Tanggal */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '12px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap', marginRight: '4px' }}>
            Periode:
          </span>
          {[
            { id: 'ALL', label: 'Semua Riwayat' },
            { id: 'hari-ini', label: 'Hari Ini' },
            { id: 'kemarin', label: 'Kemarin' },
            { id: 'bulan-ini', label: 'Bulan Ini' },
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
                  border: `1.5px solid ${isActive ? '#0d9488' : '#cbd5e1'}`,
                  background: isActive ? '#0d9488' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters & Search */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'end'
        }}>
          {/* Tanggal Picker (muncul jika custom atau bisa diakses) */}
          {periodFilter === 'custom' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Pilih Tanggal Spesifik:
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="date" 
                  className="form-input" 
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '38px' }}
                />
                <Calendar size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              </div>
            </div>
          )}

          {/* Sesi Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Filter Sesi:
            </label>
            <CustomSelect 
              style={{ minWidth: '180px' }}
              triggerStyle={{ minHeight: '38px', borderRadius: '12px', fontSize: '0.82rem' }}
              value={selectedSesiFilter}
              onChange={(e) => setSelectedSesiFilter(e.target.value)}
            >
              <option value="ALL">Semua Sesi Halaqoh</option>
              {masterSesiList.map(s => (
                <option key={s.id} value={s.nama}>{s.nama} ({s.mulai} - {s.selesai})</option>
              ))}
            </CustomSelect>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Filter Status:
            </label>
            <CustomSelect 
              style={{ minWidth: '150px' }}
              triggerStyle={{ minHeight: '38px', borderRadius: '12px', fontSize: '0.82rem' }}
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="TEPAT_WAKTU">Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="IZIN">Izin Resmi</option>
            </CustomSelect>
          </div>

          {/* Search Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Cari Sesi / Lokasi:
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Cari sesi, lokasi, catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '38px' }}
              />
              <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5A. TABEL LOG RIWAYAT PRESENSI PENGAMPU (DESKTOP VIEW) ─── */}
      <div className="pengampu-desktop-table-view card" style={{ padding: '0', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
              Log Riwayat Presensi Saya ({filteredRecords.length} Sesi)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
              Catatan autentik presensi Ustadz {myName}
            </p>
          </div>
          {filteredRecords.length > 0 && (
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0d9488', background: '#ccfbf1', padding: '3px 9px', borderRadius: '12px' }}>
              {filteredRecords.filter(r => r.status === 'Tepat Waktu').length} Tepat Waktu
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', width: '45px', textAlign: 'center' }}>No</th>
                <th style={{ padding: '12px 14px', width: '110px' }}>Tanggal</th>
                <th style={{ padding: '12px 14px' }}>Sesi &amp; Jadwal</th>
                <th style={{ padding: '12px 14px' }}>Jam Scan Hadir</th>
                <th style={{ padding: '12px 14px' }}>Status Kehadiran</th>
                <th style={{ padding: '12px 14px' }}>Ruang / Lokasi QR</th>
                <th style={{ padding: '12px 14px' }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                    <Info size={26} style={{ margin: '0 auto 6px auto', display: 'block', opacity: 0.5 }} />
                    Tidak ada catatan presensi untuk filter periode ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <tr 
                    key={rec.id || idx}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '11px 14px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                      {idx + 1}
                    </td>

                    {/* Tanggal */}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: '#1e293b',
                        background: rec.tanggal === todayISO ? '#dcfce7' : '#f1f5f9',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontSize: '0.78rem'
                      }}>
                        {rec.tanggal === todayISO ? 'Hari Ini' : rec.tanggal === yesterdayISO ? 'Kemarin' : formatDateDisplay(rec.tanggal)}
                      </span>
                      <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '2px' }}>
                        {formatDateDisplay(rec.tanggal)}
                      </div>
                    </td>

                    {/* Sesi */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a' }}>
                        {getSesiIcon(rec.sesi)}
                        <span>{rec.sesi}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {rec.jadwal}
                      </div>
                    </td>

                    {/* Jam Scan */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: 800, color: rec.jam !== '-' ? '#0f172a' : '#94a3b8' }}>
                        {rec.jam !== '-' ? `${rec.jam} WIB` : '—'}
                      </div>
                      {rec.jam !== '-' && (
                        <div style={{ fontSize: '0.70rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ShieldCheck size={11} />
                          <span>GPS Verified</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '11px 14px' }}>
                      {renderStatusBadge(rec.status, rec.keterangan)}
                    </td>

                    {/* Lokasi */}
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#334155' }}>
                        <MapPin size={13} color="#0d9488" />
                        <span>{rec.lokasi}</span>
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                        {rec.metode}
                      </div>
                    </td>

                    {/* Keterangan */}
                    <td style={{ padding: '11px 14px', color: '#475569' }}>
                      <span style={{ fontSize: '0.78rem' }}>
                        {rec.keterangan}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5B. TAMPILAN MOBILE KARTU RESPONSIF (HP / LAYAR KECIL) ─── */}
      <div className="pengampu-mobile-card-view" style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 2px',
          fontSize: '0.80rem',
          fontWeight: 800,
          color: '#475569'
        }}>
          <span>Riwayat Kehadiran ({filteredRecords.length} Sesi)</span>
          <span style={{ color: '#0d9488', fontSize: '0.75rem' }}>Akun: {myName.split(',')[0]}</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="card" style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8' }}>
            <Info size={28} style={{ margin: '0 auto 6px auto', display: 'block', opacity: 0.5 }} />
            Tidak ada riwayat presensi yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          filteredRecords.map((rec, idx) => {
            const isToday = rec.tanggal === todayISO;
            const isYesterday = rec.tanggal === yesterdayISO;
            const dateBadgeLabel = isToday ? 'Hari Ini' : isYesterday ? 'Kemarin' : formatDateDisplay(rec.tanggal);

            return (
              <div 
                key={rec.id || idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '14px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {/* Baris 1: Sesi Icon & Judul + Badge Tanggal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getSesiIcon(rec.sesi)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        {rec.sesi}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                        {rec.jadwal}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    background: isToday ? '#dcfce7' : '#f1f5f9',
                    color: isToday ? '#15803d' : '#475569',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    {dateBadgeLabel}
                  </span>
                </div>

                {/* Baris 2: Jam Scan & Status Badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', fontWeight: 600 }}>
                      Jam Scan Hadir:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ fontSize: '0.86rem', color: rec.jam !== '-' ? '#0f172a' : '#94a3b8' }}>
                        {rec.jam !== '-' ? `${rec.jam} WIB` : '—'}
                      </strong>
                      {rec.jam !== '-' && (
                        <span style={{ fontSize: '0.68rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <ShieldCheck size={10} />
                          <span>GPS</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {renderStatusBadge(rec.status, rec.keterangan)}
                  </div>
                </div>

                {/* Baris 3: Lokasi & Keterangan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#475569', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                    <MapPin size={12} color="#0d9488" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.lokasi}
                    </span>
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>
                    {rec.keterangan}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
