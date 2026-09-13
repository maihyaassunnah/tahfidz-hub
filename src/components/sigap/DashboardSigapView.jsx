import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Calendar, 
  Settings, 
  RotateCw,
  Sparkles,
  Search,
  Filter,
  Download,
  Share2,
  AlertTriangle,
  AlertCircle,
  X,
  Eye,
  Edit3,
  MapPin,
  ShieldCheck,
  FileText,
  Check,
  ChevronRight,
  Bell
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function DashboardSigapView({ setActiveTab, showToast }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [monitoringData, setMonitoringData] = useState(storageService.getSigapMonitoring());
  const [izinList, setIzinList] = useState(storageService.getSigapIzinGuru());
  const [totalSetoran, setTotalSetoran] = useState(() => {
    return (storageService.getAllSetoranRaw ? storageService.getAllSetoranRaw().length : (storageService.getSetoran('ALL') || []).length) || 0;
  });

  const siswaList = storageService.getSigapSiswa();
  const guruList = storageService.getSigapGuru();

  // State Filter Presensi Pengampu (Hanya 1. Filter Sesi & 2. Filter Terlambat/Izin/Alpa)
  const [sesiFilter, setSesiFilter] = useState('semua'); // 'semua', 'subuh', 'dhuha', 'ashar', 'maghrib'
  const [activeStatusFilter, setActiveStatusFilter] = useState('semua'); // 'semua', 'terlambat', 'izin', 'alpa', 'tepat-waktu'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (default Monitor Presensi) | 'table'

  // State Modal Detail & Koreksi
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editStatusForm, setEditStatusForm] = useState({
    status: 'Tepat Waktu',
    keterangan: '',
    selisihMenit: 0
  });

  const reloadData = () => {
    setMonitoringData(storageService.getSigapMonitoring());
    setIzinList(storageService.getSigapIzinGuru());
    setTotalSetoran((storageService.getAllSetoranRaw ? storageService.getAllSetoranRaw().length : (storageService.getSetoran('ALL') || []).length) || 0);
  };

  // Real-time listener saat ada izin diajukan oleh pengampu atau data diupdate
  useEffect(() => {
    const handleUpdate = () => {
      reloadData();
    };
    window.addEventListener('sigap_izin_updated', handleUpdate);
    window.addEventListener('sigap_admin_notif_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sigap_izin_updated', handleUpdate);
      window.removeEventListener('sigap_admin_notif_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      reloadData();
      setIsRefreshing(false);
      showToast && showToast("Data Dashboard & Presensi Pengampu diperbarui!");
    }, 400);
  };

  // Hitung jumlah izin yang pending (memerlukan persetujuan admin)
  const pendingIzinList = (izinList || []).filter(i => 
    i.status === 'Perlu Persetujuan' || 
    i.status === 'Menunggu' || 
    i.status === 'Menunggu Persetujuan'
  );
  const pendingIzinCount = pendingIzinList.length;

  // =========================================================================
  // ATURAN STATUS PRESENSI PENGAMPU SESUAI SPESIFIKASI:
  // 1. Izin: Jika ada yang izin -> Keterangan & Status: Izin
  // 2. Hadir: Jika sudah absen -> Keterangan & Status: Hadir (Tepat Waktu / Terlambat)
  // 3. Belum Absen: Jika belum absen dan waktu sesi belum lewat -> Belum Absen
  // 4. Alpa: Jika belum absen dan sudah lewat waktu absennya -> Alpa
  // =========================================================================
  const checkIfSesiLewat = (item) => {
    if (item.status === 'Alpa' || item.status === 'Alfa') return true;
    if (item.jadwal && item.jadwal.includes('-')) {
      const parts = item.jadwal.split('-');
      const endTimeStr = parts[1]?.trim();
      if (endTimeStr && endTimeStr.includes(':')) {
        const [endH, endM] = endTimeStr.split(':').map(Number);
        const now = new Date();
        const currentTotalMin = now.getHours() * 60 + now.getMinutes();
        const endTotalMin = endH * 60 + endM;
        if (currentTotalMin > endTotalMin) {
          return true;
        } else {
          return false;
        }
      }
    }
    const sesiLower = (item.sesi || '').toLowerCase();
    const now = new Date();
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();
    if (sesiLower.includes('subuh')) return currentTotalMin > (6 * 60 + 30);
    if (sesiLower.includes('pagi') || sesiLower.includes('dhuha')) return currentTotalMin > (10 * 60);
    if (sesiLower.includes('ashar')) return currentTotalMin > (17 * 60 + 30);
    if (sesiLower.includes('maghrib') || sesiLower.includes('malam')) return currentTotalMin > (20 * 60 + 30);
    return false;
  };

  const evaluateItemStatus = (item) => {
    // 1. IZIN: jika ada yang ijin maka keterangan nya izin
    const isIzin = item.status === 'Izin' || 
                   item.status === 'Sakit' || 
                   (item.keterangan && item.keterangan.toLowerCase().includes('izin')) ||
                   (item.alasanIzin && item.alasanIzin.trim() !== '');

    if (isIzin) {
      const ketText = item.keterangan && item.keterangan.toLowerCase().includes('izin')
        ? item.keterangan
        : (item.alasanIzin ? `Izin: ${item.alasanIzin}` : 'Izin Resmi Disetujui');
      return {
        type: 'izin',
        badge: '📋 Izin',
        badgeMobile: '📋 Izin',
        badgeClass: 'badge-status-izin',
        label: 'Izin',
        keterangan: ketText,
        borderAccent: '#3b82f6',
        avatarBg: '#dbeafe',
        avatarColor: '#1d4ed8',
        scheduleText: `Jadwal: ${item.jadwal || '-'} • `,
        scheduleHighlight: 'Izin Resmi',
        scheduleHighlightColor: '#2563eb'
      };
    }

    // 2. HADIR: jika sudah absen maka hadir
    const hasScan = item.jam && item.jam !== '-' && item.jam.trim() !== '';
    if (hasScan || item.status === 'Tepat Waktu' || item.status === 'Terlambat') {
      const isLate = item.status === 'Terlambat' || 
                     item.selisihMenit > 0 || 
                     (item.keterangan && item.keterangan.toLowerCase().includes('telat'));
      return {
        type: 'hadir',
        subType: isLate ? 'terlambat' : 'tepat-waktu',
        badge: isLate ? `⚠️ Hadir (Telat ${item.selisihMenit || 5}m)` : '✓ Hadir (Tepat Waktu)',
        badgeMobile: isLate ? `⚠️ Telat ${item.selisihMenit || 5}m` : '✓ Hadir',
        badgeClass: isLate ? 'badge-status-late' : 'badge-status-ontime',
        label: 'Hadir',
        keterangan: item.keterangan || (isLate ? `Telat ${item.selisihMenit || 5} Menit` : 'Tepat Waktu'),
        borderAccent: isLate ? '#f97316' : '#10b981',
        avatarBg: isLate ? '#ffedd5' : '#dcfce7',
        avatarColor: isLate ? '#c2410c' : '#15803d',
        scheduleText: `Scan: ${item.jam} WIB `,
        scheduleSubText: `(${item.jadwal || '-'})`,
        scheduleColor: isLate ? '#c2410c' : '#047857'
      };
    }

    // 3 & 4. BELUM SCAN: Cek apakah sudah lewat waktu absennya (Alpa) atau belum lewat (Belum Absen)
    const isLewat = checkIfSesiLewat(item);

    if (isLewat || item.status === 'Alpa' || item.status === 'Alfa') {
      // 4. ALPA: jika sudah lewat waktu absen nya maka alpa
      return {
        type: 'alpa',
        badge: '✗ Alpa',
        badgeMobile: '✗ Alpa',
        badgeClass: 'badge-status-alpa',
        label: 'Alpa',
        keterangan: item.keterangan && !item.keterangan.toLowerCase().includes('menunggu') 
          ? item.keterangan 
          : 'Alpa: Melewati batas waktu presensi halaqah',
        borderAccent: '#ef4444',
        avatarBg: '#fee2e2',
        avatarColor: '#b91c1c',
        scheduleText: `Jadwal: ${item.jadwal || '-'} • `,
        scheduleHighlight: 'Alpa (Lewat Waktu Sesi)',
        scheduleHighlightColor: '#dc2626'
      };
    }

    // 3. BELUM ABSEN: jika belum absen maka belum absen
    return {
      type: 'belum-absen',
      badge: '○ Belum Absen',
      badgeMobile: '○ Belum Absen',
      badgeClass: 'badge-status-pending',
      label: 'Belum Absen',
      keterangan: item.keterangan && !item.keterangan.toLowerCase().includes('alpa')
        ? item.keterangan
        : 'Belum Absen (Menunggu Jadwal Sesi Presensi)',
      borderAccent: '#94a3b8',
      avatarBg: '#f1f5f9',
      avatarColor: '#475569',
      scheduleText: `Jadwal: ${item.jadwal || '-'} • `,
      scheduleHighlight: 'Belum Absen',
      scheduleHighlightColor: '#64748b'
    };
  };

  // Perhitungan KPI Presensi Keseluruhan
  const feedList = monitoringData.liveFeed || [];
  const countOntime = feedList.filter(f => evaluateItemStatus(f).subType === 'tepat-waktu').length;
  const countLate = feedList.filter(f => evaluateItemStatus(f).subType === 'terlambat').length;
  const countHadir = countOntime + countLate;
  const countIzin = feedList.filter(f => evaluateItemStatus(f).type === 'izin').length;
  const countBelumAbsen = feedList.filter(f => evaluateItemStatus(f).type === 'belum-absen').length;
  const countAlpa = feedList.filter(f => evaluateItemStatus(f).type === 'alpa').length;
  const totalSudahAbsen = countHadir;

  // Hitung jumlah status sesuai sesi terpilih
  const feedForSesi = feedList.filter(item => {
    if (sesiFilter === 'semua') return true;
    const itemSesi = (item.sesi || '').toLowerCase();
    if (sesiFilter === 'subuh') return itemSesi.includes('subuh');
    if (sesiFilter === 'dhuha') return itemSesi.includes('dhuha') || itemSesi.includes('pagi');
    if (sesiFilter === 'ashar') return itemSesi.includes('ashar');
    if (sesiFilter === 'maghrib') return itemSesi.includes('maghrib');
    return itemSesi.includes(sesiFilter.toLowerCase());
  });

  const countHadirForSesi = feedForSesi.filter(f => evaluateItemStatus(f).type === 'hadir').length;
  const countOntimeForSesi = feedForSesi.filter(f => evaluateItemStatus(f).subType === 'tepat-waktu').length;
  const countLateForSesi = feedForSesi.filter(f => evaluateItemStatus(f).subType === 'terlambat').length;
  const countIzinForSesi = feedForSesi.filter(f => evaluateItemStatus(f).type === 'izin').length;
  const countBelumAbsenForSesi = feedForSesi.filter(f => evaluateItemStatus(f).type === 'belum-absen').length;
  const countAlpaForSesi = feedForSesi.filter(f => evaluateItemStatus(f).type === 'alpa').length;

  // Filter Data (Filter Sesi & Filter Status Presensi)
  const filteredFeed = feedForSesi.filter(item => {
    const ev = evaluateItemStatus(item);
    if (activeStatusFilter === 'hadir') return ev.type === 'hadir';
    if (activeStatusFilter === 'tepat-waktu') return ev.subType === 'tepat-waktu';
    if (activeStatusFilter === 'terlambat') return ev.subType === 'terlambat';
    if (activeStatusFilter === 'izin') return ev.type === 'izin';
    if (activeStatusFilter === 'belum-absen') return ev.type === 'belum-absen';
    if (activeStatusFilter === 'alpa') return ev.type === 'alpa';
    return true;
  });

  // Export CSV Detail
  const handleExportCSV = () => {
    const headers = ["No", "Nama Pengampu", "NIP", "Peran", "Sesi", "Halaqah Bimbingan", "Kelas / Lokasi", "Jadwal", "Jam Scan", "Status", "Keterangan", "Selisih Telat (Menit)", "Metode"];
    const rows = filteredFeed.map((f, i) => [
      i + 1,
      `"${f.nama || ''}"`,
      `"${f.nip || '-'}"`,
      `"${f.role || 'Pengampu'}"`,
      `"${f.sesi || '-'}"`,
      `"${f.mapel || '-'}"`,
      `"${f.kelas || '-'}"`,
      `"${f.jadwal || '-'}"`,
      `"${f.jam || '-'}"`,
      `"${f.status || '-'}"`,
      `"${f.keterangan || '-'}"`,
      f.selisihMenit || 0,
      `"${f.metode || '-'}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Presensi_Pengampu_Tahfidz_MAIAS_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Data presensi pengampu berhasil diekspor ke CSV!");
  };

  // Kirim Rekap Kehadiran via WhatsApp
  const handleShareWA = () => {
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    let text = `*LAPORAN KEHADIRAN PENGAMPU HALAQAH TAHFIDZ MA IHYA AS-SUNNAH*%0A`;
    text += `*Hari / Tanggal:* ${today}%0A`;
    text += `---------------------------------------%0A`;
    text += `*Ringkasan Kehadiran:*%0A`;
    text += `• Total Terjadwal: ${feedList.length}%0A`;
    text += `• Sudah Presensi: ${totalSudahAbsen}%0A`;
    text += `• Tepat Waktu: ${countOntime} orang%0A`;
    text += `• Terlambat: ${countLate} orang%0A`;
    text += `• Izin / Sakit: ${countIzin} orang%0A`;
    text += `• Belum Absen: ${countPending} orang%0A`;
    text += `---------------------------------------%0A`;
    
    // Rincian Keterlambatan
    const lateItems = feedList.filter(f => f.status === 'Terlambat');
    if (lateItems.length > 0) {
      text += `*Rincian Pengampu Terlambat:*%0A`;
      lateItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.nama} - *${item.keterangan}* (Scan ${item.jam} WIB)%0A`;
      });
      text += `---------------------------------------%0A`;
    }

    // Rincian Izin / Sakit
    const izinItems = feedList.filter(f => f.status === 'Izin' || f.status === 'Sakit');
    if (izinItems.length > 0) {
      text += `*Rincian Izin & Sakit:*%0A`;
      izinItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.nama} - *${item.status}* (${item.alasanIzin || item.keterangan})%0A`;
      });
      text += `---------------------------------------%0A`;
    }

    text += `_Diperbarui otomatis oleh Sistem Tahfidz HUB MA Ihya As-Sunnah_`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Handle Edit / Koreksi Status
  const handleOpenKoreksi = (item) => {
    setEditingItem(item);
    setEditStatusForm({
      status: item.status || 'Tepat Waktu',
      keterangan: item.keterangan || '',
      selisihMenit: item.selisihMenit || 0
    });
  };

  const handleSaveKoreksi = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    let ket = editStatusForm.keterangan;
    if (editStatusForm.status === 'Terlambat' && !ket) {
      ket = `Telat ${editStatusForm.selisihMenit || 5} Menit`;
    } else if (editStatusForm.status === 'Tepat Waktu' && !ket) {
      ket = 'Tepat Waktu (Koreksi Admin)';
    } else if (editStatusForm.status === 'Alpa' && !ket) {
      ket = 'Alpa: Melewati batas waktu presensi halaqah';
    } else if (editStatusForm.status === 'Izin' && !ket) {
      ket = 'Izin Resmi Disetujui';
    } else if (editStatusForm.status === 'Belum Absen' && !ket) {
      ket = 'Belum Absen (Menunggu Jadwal Sesi Presensi)';
    }

    storageService.updateStatusPresensiPengampu(
      editingItem.id,
      editStatusForm.status,
      ket,
      parseInt(editStatusForm.selisihMenit, 10) || 0
    );

    reloadData();
    setEditingItem(null);
    showToast && showToast(`Status presensi ${editingItem.nama} berhasil diperbarui!`);
  };

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER DASHBOARD PERSIS GAMBAR 1 */}
      <div className="sigap-dash-header-row">
        <div>
          <h1 className="sigap-dash-title">Dashboard MA IHYA' AS-SUNNAH</h1>
          <p className="sigap-dash-subtitle">Manajemen data dan monitoring KBM.</p>
        </div>

        <div className="sigap-dash-actions">
          {/* Tombol Refresh Biru */}
          <button 
            className="sigap-btn-icon-refresh" 
            onClick={handleRefresh}
            title="Muat Ulang Data"
          >
            <RotateCw size={16} className={isRefreshing ? 'spin-anim' : ''} />
          </button>

          {/* Tombol Konfigurasi */}
          <button 
            className="sigap-btn-konfigurasi"
            onClick={() => setActiveTab('sigap-konfigurasi')}
          >
            <Settings size={15} />
            <span>Konfigurasi</span>
          </button>
        </div>
      </div>

      {/* BANNER NOTIFIKASI IZIN PENGAMPU UNTUK SUPER ADMIN */}
      {pendingIzinCount > 0 && (
        <div 
          className="sigap-admin-alert-banner"
          onClick={() => setActiveTab('sigap-izin')}
          title="Klik untuk membuka persetujuan izin pengampu"
        >
          <div className="sigap-alert-banner-content">
            <div className="sigap-alert-bell-wrap">
              <Bell size={18} className="sigap-alert-bell-icon" />
              <span className="sigap-alert-bell-ping"></span>
            </div>
            <div className="sigap-alert-text">
              <span className="sigap-alert-highlight">Notifikasi Izin Pengampu ({pendingIzinCount}):</span>{' '}
              {pendingIzinList[0]?.nama || 'Pengampu'} mengajukan izin {pendingIzinList[0]?.jenisIzin ? `[${pendingIzinList[0].jenisIzin}]` : ''} ({pendingIzinList[0]?.sesi || 'Hari Ini'}).
            </div>
          </div>
          <button 
            className="sigap-alert-btn-tinjau"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('sigap-izin');
            }}
          >
            <span>Tinjau</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* 2. BARIS 1: 4 KARTU METRIK KPI UTAMA (SEBARIS, HANYA IKON & JUMLAH SESUAI DATA RIIL) */}
      <div className="sigap-kpi-grid">
        {/* Total Guru */}
        <div 
          className="sigap-kpi-card" 
          onClick={() => setActiveTab('sigap-guru')} 
          style={{ cursor: 'pointer' }}
          title={`Total Guru: ${guruList.length} orang`}
        >
          <div className="sigap-kpi-icon-box blue">
            <Users size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{guruList.length}</div>
            <div className="sigap-kpi-label">Total Guru</div>
          </div>
        </div>

        {/* Total Siswa */}
        <div 
          className="sigap-kpi-card" 
          onClick={() => setActiveTab('sigap-siswa')} 
          style={{ cursor: 'pointer' }}
          title={`Total Siswa: ${siswaList.length} santri`}
        >
          <div className="sigap-kpi-icon-box green">
            <BookOpen size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{siswaList.length}</div>
            <div className="sigap-kpi-label">Total Siswa</div>
          </div>
        </div>

        {/* Presensi Harian (Pengampu Hari Ini) */}
        <div 
          className="sigap-kpi-card" 
          style={{ cursor: 'pointer', border: '1.5px solid #fdba74' }}
          onClick={() => {
            const el = document.getElementById('panel-presensi-pengampu');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          title={`Presensi Harian Pengampu: ${totalSudahAbsen} hadir`}
        >
          <div className="sigap-kpi-icon-box orange">
            <Clock size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{totalSudahAbsen}</div>
            <div className="sigap-kpi-label">Presensi Harian</div>
          </div>
        </div>

        {/* Jumlah Setoran Santri (Menggantikan Jurnal Masuk Sesuai Permintaan) */}
        <div 
          className="sigap-kpi-card"
          onClick={() => setActiveTab('setoran')}
          style={{ cursor: 'pointer' }}
          title={`Jumlah Setoran Santri: ${totalSetoran} riwayat`}
        >
          <div className="sigap-kpi-icon-box purple">
            <Sparkles size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{totalSetoran}</div>
            <div className="sigap-kpi-label">Setoran Santri</div>
          </div>
        </div>
      </div>

      {/* 3. BARIS 2: 4 KARTU AKSI CEPAT / QUICK ACTIONS (SEBARIS) */}
      <div className="sigap-action-grid">
        {/* Card 1: Approval Izin (dengan lencana merah notifikasi dinamis) */}
        <div 
          className="sigap-action-card relative" 
          onClick={() => setActiveTab('sigap-izin')}
          title={pendingIzinCount > 0 ? `${pendingIzinCount} permohonan izin menunggu persetujuan` : 'Approval Izin Pengampu'}
        >
          {pendingIzinCount > 0 && (
            <div className="sigap-red-badge-corner pulse-badge">
              {pendingIzinCount}
            </div>
          )}
          <div className="sigap-action-circle-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="sigap-action-label">Approval Izin</div>
        </div>

        {/* Card 2: Kelola Guru (highlight border toska persis screenshot) */}
        <div 
          className="sigap-action-card active-border" 
          onClick={() => setActiveTab('sigap-guru')}
        >
          <div className="sigap-action-circle-icon blue">
            <Users size={22} />
          </div>
          <div className="sigap-action-label">Kelola Guru</div>
        </div>

        {/* Card 3: Lokasi & QR */}
        <div 
          className="sigap-action-card" 
          onClick={() => setActiveTab('sigap-lokasi-qr')}
        >
          <div className="sigap-action-circle-icon purple">
            <Clock size={22} />
          </div>
          <div className="sigap-action-label">Lokasi & QR</div>
        </div>

        {/* Card 4: Atur Jadwal */}
        <div 
          className="sigap-action-card" 
          onClick={() => setActiveTab('sigap-jadwal')}
        >
          <div className="sigap-action-circle-icon orange">
            <Calendar size={22} />
          </div>
          <div className="sigap-action-label">Atur Jadwal</div>
        </div>
      </div>

      {/* 4. BARIS 3: PANEL MONITORING PRESENSI PENGAMPU HARI INI */}
      <div className="sigap-presensi-panel" id="panel-presensi-pengampu">
        {/* Header Panel */}
        <div className="sigap-presensi-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Monitoring Presensi Pengampu Hari Ini
              </h2>
              <span style={{
                background: '#f1f5f9',
                color: '#0f766e',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Real-Time
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Daftar seluruh ustadz pengampu halaqah tahfidz yang terdata beserta status absensi hari ini, rincian tepat waktu, keterlambatan, dan izin.
            </p>
          </div>

          {/* Action Buttons: Kirim WA & Export CSV */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="sigap-btn-green"
              onClick={handleShareWA}
              title="Kirim ringkasan laporan ke WhatsApp"
            >
              <span>Rekap WA</span>
            </button>

            <button 
              className="sigap-btn-blue"
              onClick={handleExportCSV}
              title="Download rekapan kehadiran dalam format CSV"
            >
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mini KPI Counters Bar (5 Metrik Kehadiran Lengkap) */}
        <div className="sigap-mini-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          {/* Hadir Tepat Waktu */}
          <div 
            className="sigap-mini-kpi-card" 
            style={{ borderLeft: '4px solid #10b981', cursor: 'pointer' }}
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'tepat-waktu' ? 'semua' : 'tepat-waktu')}
            title="Klik untuk filter: Hadir Tepat Waktu"
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>HADIR (TEPAT WAKTU)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                {countOntime} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pengampu</span>
              </div>
            </div>
          </div>

          {/* Hadir Terlambat */}
          <div 
            className="sigap-mini-kpi-card" 
            style={{ borderLeft: '4px solid #f97316', cursor: 'pointer' }}
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'terlambat' ? 'semua' : 'terlambat')}
            title="Klik untuk filter: Hadir Terlambat"
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>HADIR (TERLAMBAT)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c2410c', marginTop: '2px' }}>
                {countLate} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pengampu</span>
              </div>
            </div>
          </div>

          {/* Izin Resmi */}
          <div 
            className="sigap-mini-kpi-card" 
            style={{ borderLeft: '4px solid #3b82f6', cursor: 'pointer' }}
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'izin' ? 'semua' : 'izin')}
            title="Klik untuk filter: Izin"
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>IZIN RESMI</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
                {countIzin} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pengampu</span>
              </div>
            </div>
          </div>

          {/* Belum Absen */}
          <div 
            className="sigap-mini-kpi-card" 
            style={{ borderLeft: '4px solid #94a3b8', cursor: 'pointer' }}
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'belum-absen' ? 'semua' : 'belum-absen')}
            title="Klik untuk filter: Belum Absen (Menunggu Sesi)"
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>BELUM ABSEN</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569', marginTop: '2px' }}>
                {countBelumAbsen} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pengampu</span>
              </div>
            </div>
          </div>

          {/* Alpa (Lewat Waktu Sesi) */}
          <div 
            className="sigap-mini-kpi-card" 
            style={{ borderLeft: '4px solid #ef4444', cursor: 'pointer' }}
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'alpa' ? 'semua' : 'alpa')}
            title="Klik untuk filter: Alpa (Lewat Batas Waktu Sesi)"
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>ALPA (LEWAT WAKTU)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                {countAlpa} <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pengampu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: 1. Filter Sesi & 2. Filter Status Kehadiran (Semua, Hadir, Tepat Waktu, Terlambat, Izin, Belum Absen, Alpa) */}
        <div className="sigap-filter-tabs-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* 1. FILTER SESI */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#0d9488" />
                <span>Sesi:</span>
              </span>
              <select
                value={sesiFilter}
                onChange={(e) => setSesiFilter(e.target.value)}
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="semua">Semua Sesi ({feedList.length})</option>
                <option value="subuh">Ba'da Subuh</option>
                <option value="dhuha">Pagi / Dhuha</option>
                <option value="ashar">Ba'da Ashar</option>
                <option value="maghrib">Ba'da Maghrib</option>
              </select>
            </div>

            {/* 2. FILTER STATUS SESUAI ATURAN USER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className={`sigap-tab-pill ${activeStatusFilter === 'semua' ? 'active' : ''}`}
                onClick={() => setActiveStatusFilter('semua')}
                style={{ fontSize: '11.5px', padding: '5px 11px' }}
              >
                Semua
                <span className="sigap-badge-count">{feedForSesi.length}</span>
              </button>

              <button 
                type="button"
                className={`sigap-tab-pill ${activeStatusFilter === 'hadir' ? 'active' : ''}`}
                onClick={() => setActiveStatusFilter('hadir')}
                style={{ 
                  fontSize: '11.5px', 
                  padding: '5px 11px',
                  background: activeStatusFilter === 'hadir' ? '#059669' : undefined,
                  color: activeStatusFilter === 'hadir' ? '#ffffff' : undefined,
                  borderColor: activeStatusFilter === 'hadir' ? '#047857' : undefined
                }}
                title="Menampilkan seluruh pengampu yang sudah absen (Tepat Waktu & Terlambat)"
              >
                Hadir
                <span className="sigap-badge-count">{countHadirForSesi}</span>
              </button>

              <button 
                type="button"
                className={`sigap-tab-pill ${activeStatusFilter === 'terlambat' ? 'active' : ''}`}
                onClick={() => setActiveStatusFilter('terlambat')}
                style={{ 
                  fontSize: '11.5px', 
                  padding: '5px 11px',
                  background: activeStatusFilter === 'terlambat' ? '#ea580c' : undefined,
                  color: activeStatusFilter === 'terlambat' ? '#ffffff' : undefined,
                  borderColor: activeStatusFilter === 'terlambat' ? '#c2410c' : undefined
                }}
              >
                Terlambat
                <span className="sigap-badge-count">{countLateForSesi}</span>
              </button>

              <button 
                type="button"
                className={`sigap-tab-pill ${activeStatusFilter === 'izin' ? 'active' : ''}`}
                onClick={() => setActiveStatusFilter('izin')}
                style={{ 
                  fontSize: '11.5px', 
                  padding: '5px 11px',
                  background: activeStatusFilter === 'izin' ? '#2563eb' : undefined,
                  color: activeStatusFilter === 'izin' ? '#ffffff' : undefined,
                  borderColor: activeStatusFilter === 'izin' ? '#1d4ed8' : undefined
                }}
              >
                Izin
                <span className="sigap-badge-count">{countIzinForSesi}</span>
              </button>

              <button 
                type="button"
                className={`sigap-tab-pill ${activeStatusFilter === 'belum-absen' ? 'active' : ''}`}
                onClick={() => setActiveStatusFilter('belum-absen')}
                style={{ 
                  fontSize: '11.5px', 
                  padding: '5px 11px',
                  background: activeStatusFilter === 'belum-absen' ? '#475569' : undefined,
                  color: activeStatusFilter === 'belum-absen' ? '#ffffff' : undefined,
                  borderColor: activeStatusFilter === 'belum-absen' ? '#334155' : undefined
                }}
              >
                Belum Absen
                <span className="sigap-badge-count">{countBelumAbsenForSesi}</span>
              </button>

              <button 
                type="button"
                className={`sigap-tab-pill ${activeStatusFilter === 'alpa' ? 'active' : ''}`}
                onClick={() => setActiveStatusFilter('alpa')}
                style={{ 
                  fontSize: '11.5px', 
                  padding: '5px 11px',
                  background: activeStatusFilter === 'alpa' ? '#dc2626' : undefined,
                  color: activeStatusFilter === 'alpa' ? '#ffffff' : undefined,
                  borderColor: activeStatusFilter === 'alpa' ? '#b91c1c' : undefined
                }}
              >
                Alpa
                <span className="sigap-badge-count">{countAlpaForSesi}</span>
              </button>

              <button 
                type="button"
                className={`sigap-tab-pill ${activeStatusFilter === 'tepat-waktu' ? 'active' : ''}`}
                onClick={() => setActiveStatusFilter('tepat-waktu')}
                style={{ fontSize: '11.5px', padding: '5px 11px' }}
              >
                Tepat Waktu
                <span className="sigap-badge-count">{countOntimeForSesi}</span>
              </button>
            </div>
          </div>

          {/* Toggle Tampilan: Kartu Monitor vs Tabel */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                border: 'none',
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#0f766e' : '#64748b',
                padding: '5px 11px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Tampilan Kartu Monitor Presensi"
            >
              <span>🪪 Kartu Monitor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#0f766e' : '#64748b',
                padding: '5px 11px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Tampilan Tabel Data"
            >
              <span>📋 Tabel Data</span>
            </button>
          </div>
        </div>

        {/* MONITOR PRESENSI PENGAMPU HARI INI (Menggantikan Tabel Gambar 2) */}
        {viewMode === 'cards' ? (
          filteredFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>Tidak ada data presensi yang sesuai kriteria filter.</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>Coba ganti filter sesi atau filter status presensi.</div>
            </div>
          ) : (
            <div className="sigap-monitor-grid">
              {filteredFeed.map((item, idx) => {
                const ev = evaluateItemStatus(item);

                const initial = (item.nama || 'G')
                  .split(' ')
                  .filter(Boolean)
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <React.Fragment key={item.id || idx}>
                    {/* 1. TAMPILAN MOBILE (HP): HANYA NAMA PENGAMPU, SESI, DAN STATUS */}
                    <div 
                      className="sigap-monitor-card-mobile"
                      onClick={() => setSelectedDetail(item)}
                      style={{
                        borderLeft: `4px solid ${ev.borderAccent}`
                      }}
                      title="Ketuk untuk melihat detail atau koreksi presensi"
                    >
                      <div className="sigap-monitor-mobile-left">
                        <div 
                          className="sigap-monitor-mobile-avatar" 
                          style={{ background: ev.avatarBg, color: ev.avatarColor }}
                        >
                          {initial}
                          <span className="sigap-mobile-avatar-dot" style={{ background: ev.borderAccent }}></span>
                        </div>
                        <div className="sigap-monitor-mobile-info">
                          <div className="sigap-monitor-mobile-name">{item.nama}</div>
                          <div className="sigap-monitor-mobile-sesi">{item.sesi || 'Sesi Subuh'}</div>
                        </div>
                      </div>

                      <div className="sigap-monitor-mobile-right">
                        {ev.type === 'hadir' && (
                          <span className={`${ev.subType === 'terlambat' ? 'badge-status-late' : 'badge-status-ontime'} sigap-mobile-pill`}>
                            {ev.badgeMobile}
                          </span>
                        )}
                        {ev.type === 'izin' && (
                          <span className="badge-status-izin sigap-mobile-pill">
                            📋 Izin
                          </span>
                        )}
                        {ev.type === 'belum-absen' && (
                          <span className="badge-status-pending sigap-mobile-pill">
                            ○ Belum Absen
                          </span>
                        )}
                        {ev.type === 'alpa' && (
                          <span className="badge-status-alpa sigap-mobile-pill">
                            ✗ Alpa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. TAMPILAN DESKTOP (> 640px): LENGKAP DENGAN MAPEL, LOKASI & AKSI */}
                    <div 
                      className="sigap-monitor-card-desktop sigap-monitor-card"
                      style={{
                        borderLeft: `5px solid ${ev.borderAccent}`
                      }}
                    >
                      {/* Header Kartu: Avatar, Nama, Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                          <div style={{
                            position: 'relative',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: ev.avatarBg,
                            color: ev.avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            flexShrink: 0,
                            border: `1.5px solid ${ev.borderAccent}33`
                          }}>
                            {initial}
                            <span style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '11px',
                              height: '11px',
                              borderRadius: '50%',
                              background: ev.borderAccent,
                              border: '2px solid #ffffff'
                            }}></span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div 
                              style={{ 
                                fontWeight: 800, 
                                color: '#0f172a', 
                                fontSize: '13.5px', 
                                lineHeight: 1.25, 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }} 
                              title={item.nama}
                            >
                              {item.nama}
                            </div>
                            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span>{item.role || 'Pengampu'}</span> • <span style={{ color: '#64748b' }}>NIP: {item.nip || 'NON-NIP'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge Kehadiran */}
                        <div style={{ flexShrink: 0 }}>
                          <span className={ev.badgeClass} style={{ fontSize: '11px', padding: '3px 9px', fontWeight: 800 }}>
                            {ev.badge}
                          </span>
                        </div>
                      </div>

                      {/* Middle Info: Halaqah Bimbingan, Sesi, Lokasi */}
                      <div style={{ 
                        background: '#f8fafc', 
                        padding: '9px 12px', 
                        borderRadius: '10px', 
                        fontSize: '12px', 
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                            <BookOpen size={13} style={{ color: '#0d9488', flexShrink: 0 }} />
                            <span style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.mapel}
                            </span>
                          </div>
                          <span style={{ 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            fontWeight: 800, 
                            fontSize: '10.5px', 
                            padding: '2px 7px', 
                            borderRadius: '6px',
                            border: '1px solid #a7f3d0',
                            flexShrink: 0 
                          }}>
                            {item.sesi}
                          </span>
                        </div>
                        <div style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 500 }}>
                          <MapPin size={12} style={{ color: '#64748b', flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.kelas}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Scan Time, Keterangan & Aksi */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                        <div style={{ fontSize: '11px', minWidth: 0 }}>
                          {ev.type === 'hadir' ? (
                            <div style={{ color: ev.scheduleColor, fontWeight: 800, fontSize: '11.5px' }}>
                              {ev.scheduleText}
                              <span style={{ fontWeight: 600, color: '#64748b', marginLeft: '5px', fontSize: '10.5px' }}>
                                {ev.scheduleSubText}
                              </span>
                            </div>
                          ) : (
                            <div style={{ color: '#475569', fontWeight: 600 }}>
                              {ev.scheduleText}
                              <span style={{ color: ev.scheduleHighlightColor, fontWeight: 800 }}>
                                {ev.scheduleHighlight}
                              </span>
                            </div>
                          )}
                          <div style={{ 
                            fontSize: '11px', 
                            color: ev.type === 'alpa' ? '#b91c1c' : ev.type === 'izin' ? '#1d4ed8' : '#334155', 
                            fontWeight: ev.type === 'alpa' ? 700 : 600, 
                            marginTop: '2px', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {ev.keterangan}
                          </div>
                        </div>

                        {/* Tombol Aksi Detail & Koreksi */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <button 
                            className="sigap-btn-detail"
                            onClick={() => setSelectedDetail(item)}
                            title="Lihat Detail Presensi"
                          >
                            <Eye size={12} />
                            <span>Detail</span>
                          </button>
                          <button 
                            className="sigap-btn-koreksi"
                            onClick={() => handleOpenKoreksi(item)}
                            title="Koreksi / Ubah Status"
                          >
                            <Edit3 size={11} />
                            <span>Koreksi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )
        ) : (
          /* Tabel Data Presensi Pengampu (Alternatif Mode Tabel) */
          <div className="sigap-table-wrap">
            <table className="sigap-table">
              <thead>
                <tr>
                  <th>PENGAMPU / USTADZ</th>
                  <th>SESI & HALAQAH TAHFIDZ</th>
                  <th>KELAS / LOKASI</th>
                  <th>JAM SCAN & JADWAL</th>
                  <th>STATUS & KETERANGAN</th>
                  <th>METODE</th>
                  <th style={{ textAlign: 'center' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeed.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>Tidak ada data presensi yang sesuai kriteria filter.</div>
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>Coba ganti filter sesi atau filter status presensi.</div>
                    </td>
                  </tr>
                ) : (
                  filteredFeed.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                            {item.nama}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {item.role || 'Pengampu'} • <span style={{ color: '#94a3b8' }}>{item.nip || 'NON-NIP'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '12.5px' }}>
                          {item.mapel}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0d9488', fontWeight: 700 }}>
                          {item.sesi}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#334155', fontWeight: 600, fontSize: '12px' }}>
                          {item.kelas}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                          {item.jam && item.jam !== '-' ? `${item.jam} WIB` : <span style={{ color: '#94a3b8' }}>-</span>}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Jadwal: {item.jadwal || '-'}
                        </div>
                      </td>
                      <td>
                        {(() => {
                          const ev = evaluateItemStatus(item);
                          return (
                            <div>
                              <span className={ev.badgeClass}>{ev.badge}</span>
                              <div style={{ 
                                fontSize: '11px', 
                                color: ev.type === 'alpa' ? '#b91c1c' : ev.type === 'izin' ? '#1d4ed8' : ev.subType === 'terlambat' ? '#c2410c' : '#059669', 
                                fontWeight: 600, 
                                marginTop: '3px' 
                              }}>
                                {ev.keterangan}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>
                          {item.metode || 'QR Scan'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button 
                            className="sigap-btn-detail"
                            onClick={() => setSelectedDetail(item)}
                            title="Lihat Detail Presensi"
                          >
                            <span>Detail</span>
                          </button>
                          <button 
                            className="sigap-btn-koreksi"
                            onClick={() => handleOpenKoreksi(item)}
                            title="Koreksi / Ubah Status"
                          >
                            <span>Koreksi</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            Menampilkan <b>{filteredFeed.length}</b> dari <b>{feedList.length}</b> pengampu terjadwal hari ini (Tanggal 10 September 2026).
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Tepat Waktu: <b>{countOntime}</b>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span>
              Terlambat: <b>{countLate}</b>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
              Izin & Sakit: <b>{countIzin}</b>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL DETAIL PRESENSI PENGAMPU
          ========================================================= */}
      {selectedDetail && (
        <div className="sigap-modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="sigap-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="sheet-drag-handle"></div>
            <div className="sigap-modal-header">
              <div>
                <h3 className="sigap-modal-title">Detail Presensi Pengampu</h3>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Rincian catatan kehadiran KBM & Halaqoh</p>
              </div>
              <button className="sigap-modal-close-btn" onClick={() => setSelectedDetail(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Profil Pengampu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                  {(selectedDetail.nama || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{selectedDetail.nama}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedDetail.role} • NIP: {selectedDetail.nip || '-'}</div>
                </div>
              </div>

              {/* Grid Rincian */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>STATUS KEHADIRAN</div>
                  <div style={{ marginTop: '4px' }}>
                    {(() => {
                      const ev = evaluateItemStatus(selectedDetail);
                      return (
                        <span className={ev.badgeClass} style={{ fontSize: '11px', padding: '3px 9px', fontWeight: 800 }}>
                          {ev.badge}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>WAKTU SCAN</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {selectedDetail.jam && selectedDetail.jam !== '-' ? `${selectedDetail.jam} WIB` : '-'}
                  </div>
                </div>
              </div>

              {/* Rincian Tambahan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Sesi / Jadwal:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.sesi} ({selectedDetail.jadwal || '-'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Halaqah Bimbingan:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.mapel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Kelas & Lokasi:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.kelas}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Metode Absensi:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.metode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Lokasi GPS / Akurasi:</span>
                  <span style={{ fontWeight: 700, color: '#0d9488' }}>{selectedDetail.lokasiGps || 'Terverifikasi Sesuai Radius'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Keterangan:</span>
                  <span style={{ 
                    fontWeight: 800, 
                    color: evaluateItemStatus(selectedDetail).type === 'alpa' ? '#dc2626' : 
                           evaluateItemStatus(selectedDetail).type === 'izin' ? '#2563eb' : 
                           selectedDetail.status === 'Terlambat' ? '#c2410c' : '#059669' 
                  }}>
                    {evaluateItemStatus(selectedDetail).keterangan}
                  </span>
                </div>
              </div>

              {/* Tugas atau Alasan Izin jika ada */}
              {selectedDetail.alasanIzin && (
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', border: '1px solid #bfdbfe', fontSize: '12px' }}>
                  <div style={{ fontWeight: 800, color: '#1e40af', marginBottom: '4px' }}>Alasan Izin:</div>
                  <div style={{ color: '#1e3a8a' }}>{selectedDetail.alasanIzin}</div>
                  {selectedDetail.tugasSiswa && (
                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #dbeafe', color: '#1e40af' }}>
                      <b>Tugas Pengganti Siswa:</b> {selectedDetail.tugasSiswa}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sigap-modal-footer">
              <button 
                type="button" 
                className="sigap-btn-cancel" 
                onClick={() => setSelectedDetail(null)}
              >
                Tutup
              </button>
              <button 
                type="button" 
                className="sigap-btn-submit"
                onClick={() => {
                  const target = selectedDetail;
                  setSelectedDetail(null);
                  handleOpenKoreksi(target);
                }}
              >
                <Edit3 size={14} />
                <span>Koreksi Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL KOREKSI / UBAH STATUS PRESENSI OLEH ADMIN
          ========================================================= */}
      {editingItem && (
        <div className="sigap-modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="sigap-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="sheet-drag-handle"></div>
            <div className="sigap-modal-header">
              <div>
                <h3 className="sigap-modal-title">Koreksi Status Presensi</h3>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Pengampu: {editingItem.nama}</p>
              </div>
              <button className="sigap-modal-close-btn" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveKoreksi}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '5px' }}>
                    STATUS KEHADIRAN
                  </label>
                  <select 
                    className="form-input"
                    value={editStatusForm.status}
                    onChange={(e) => {
                      const st = e.target.value;
                      setEditStatusForm(prev => ({
                        ...prev,
                        status: st,
                        keterangan: st === 'Tepat Waktu' ? 'Tepat Waktu (Koreksi Admin)' : 
                                    st === 'Terlambat' ? `Telat ${prev.selisihMenit || 10} Menit` : 
                                    st === 'Alpa' ? 'Alpa (Melewati Batas Waktu Presensi)' :
                                    st === 'Izin' ? 'Izin Resmi' :
                                    st === 'Belum Absen' ? 'Belum Absen (Menunggu Jadwal Sesi Presensi)' : prev.keterangan
                      }));
                    }}
                    style={{ fontSize: '13px', padding: '9px 12px' }}
                  >
                    <option value="Tepat Waktu">Hadir - Tepat Waktu</option>
                    <option value="Terlambat">Hadir - Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Belum Absen">Belum Absen</option>
                    <option value="Alpa">Alpa (Melewati Waktu Absen)</option>
                  </select>
                </div>

                {editStatusForm.status === 'Terlambat' && (
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '5px' }}>
                      KETERLAMBATAN (MENIT)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="180"
                      className="form-input"
                      value={editStatusForm.selisihMenit}
                      onChange={(e) => {
                        const m = e.target.value;
                        setEditStatusForm(prev => ({
                          ...prev,
                          selisihMenit: m,
                          keterangan: `Telat ${m} Menit`
                        }));
                      }}
                      placeholder="Misal: 15"
                      style={{ fontSize: '13px', padding: '9px 12px' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '5px' }}>
                    KETERANGAN / CATATAN
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    value={editStatusForm.keterangan}
                    onChange={(e) => setEditStatusForm({ ...editStatusForm, keterangan: e.target.value })}
                    placeholder="Misal: Telat 10 Menit / Izin Dinas"
                    style={{ fontSize: '13px', padding: '9px 12px' }}
                  />
                </div>
              </div>

              <div className="sigap-modal-footer">
                <button 
                  type="button" 
                  className="sigap-btn-cancel" 
                  onClick={() => setEditingItem(null)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="sigap-btn-submit"
                >
                  <Check size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
