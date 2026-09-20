import React, { useState, useEffect } from 'react';
import { 
  Eye,
  Calendar, 
  Clock, 
  Download, 
  Trash2, 
  RefreshCw, 
  Plus, 
  X, 
  Sparkles,
  Sunrise,
  Sun,
  CloudSun,
  Moon,
  MapPin,
  Users,
  QrCode,
  Edit3,
  Save,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  CalendarCheck,
  CalendarX,
  Compass,
  ArrowRight,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { storageService } from '../../services/storage';
import CustomSelect from '../common/CustomSelect';

const LIST_MAPEL = [
  'Aqidah',
  'Manhaj',
  'Hadits',
  'Ilmu Hadits',
  'TIK',
  'Fiqih',
  'Ilmu Tafsir',
  'Tajwid',
  'Nahwu',
  'Shorof',
  'Muhadatsah',
  'Bahasa Indonesia',
  'Imla\'',
  'Bahasa Inggris',
  'SKI',
  'PKN',
  'Sejarah Indonesia',
  'Prakarya dan Kewirausahaan',
  'Khat',
  'PJOK',
  'Matematika'
];

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];

export default function JadwalSigapView({ showToast }) {
  // Navigation Tabs: 'halaqoh' (Utama) atau 'kbm' (Kelas Formal)
  const [activeTab, setActiveTab] = useState('halaqoh');

  // Real-time Clock & Live Sesi Indicator
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state if schedule/sessions are updated in Konfigurasi Unit or elsewhere
  useEffect(() => {
    const handleSync = () => {
      setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    };
    window.addEventListener('sigap_jadwal_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sigap_jadwal_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Data Jadwal Halaqoh dari Storage
  const [jadwalHalaqoh, setJadwalHalaqoh] = useState(storageService.getJadwalHalaqoh());
  const guruList = storageService.getSigapGuru();
  const lokasiQRList = storageService.getSigapLokasiQR();

  // State Pilihan Status Halaqoh: HANYA DUA PILIHAN ('Masuk' atau 'Keluar')
  const [selectedHalaqohStatus, setSelectedHalaqohStatus] = useState('Masuk');
  const [scheduleModeHalaqoh, setScheduleModeHalaqoh] = useState('Normal');

  // Modals State untuk Halaqoh
  const [editingSesi, setEditingSesi] = useState(null);
  const [viewingDetailSesi, setViewingDetailSesi] = useState(null);
  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [newSesiForm, setNewSesiForm] = useState({
    nama: '',
    labelWaktu: '',
    mulai: '05:00',
    selesai: '06:30',
    bukaScan: '04:45',
    batasScan: '05:30',
    toleransiMenit: 15,
    deskripsi: ''
  });
  const [showAddPlottingModal, setShowAddPlottingModal] = useState(false);
  const [showAddLiburModal, setShowAddLiburModal] = useState(false);

  const [plottingForm, setPlottingForm] = useState({
    namaGuru: '',
    lokasiId: '',
    sesi: ['subuh', 'malam']
  });

  const [liburForm, setLiburForm] = useState({
    tanggal: '',
    keterangan: '',
    kategori: 'Kepulangan'
  });

  // State Jadwal KBM (Pelajaran Formal)
  const [jadwalKBM, setJadwalKBM] = useState(storageService.getSigapJadwal());
  const [selectedKelas, setSelectedKelas] = useState('X A');
  const [scheduleMode, setScheduleMode] = useState('Normal');
  const [selectedGuru, setSelectedGuru] = useState('-- Tanpa Guru --');
  const [selectedMapel, setSelectedMapel] = useState('Nahwu');

  const daysKBM = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Helper Hari Indonesia Sekarang
  const getHariIndo = (d) => {
    const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return dayNames[d.getDay()];
  };

  const hariIni = getHariIndo(currentTime);
  const timeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Deteksi Status Sesi Sekarang
  const getCurrentSesiStatus = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const curMinutes = hours * 60 + minutes;

    const timeToMin = (tStr) => {
      if (!tStr) return 0;
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + m;
    };

    const tglISO = currentTime.toISOString().split('T')[0];
    const isSpecialHoliday = jadwalHalaqoh.liburKhusus?.find(l => l.tanggal === tglISO);
    if (isSpecialHoliday) {
      return {
        statusText: `Libur Khusus: ${isSpecialHoliday.keterangan}`,
        badgeColor: '#dc2626',
        bg: '#fef2f2',
        sesiAktif: null,
        scanOpen: false
      };
    }

    let activeSesi = null;
    let scanOpen = false;

    for (const sesi of jadwalHalaqoh.sesiList || []) {
      const cellData = jadwalHalaqoh.matriks?.[sesi.id]?.[hariIni];
      const isMasuk = cellData ? cellData.status === 'Masuk' : !!(jadwalHalaqoh.hariAktif?.[hariIni]?.[sesi.id]);
      if (!isMasuk) continue;

      const mulaiMin = timeToMin(sesi.mulai);
      const selesaiMin = timeToMin(sesi.selesai);
      const bukaScanMin = timeToMin(sesi.bukaScan);
      const batasScanMin = timeToMin(sesi.batasScan);

      if (curMinutes >= bukaScanMin && curMinutes <= batasScanMin) {
        scanOpen = true;
      }

      if (curMinutes >= mulaiMin && curMinutes <= selesaiMin) {
        activeSesi = sesi;
        break;
      }
    }

    if (activeSesi) {
      return {
        statusText: `Sesi Berlangsung: ${activeSesi.nama} (${activeSesi.mulai} - ${activeSesi.selesai} WIB)`,
        badgeColor: '#059669',
        bg: '#ecfdf5',
        sesiAktif: activeSesi,
        scanOpen
      };
    }

    return {
      statusText: 'Tidak ada sesi halaqoh yang sedang berlangsung saat ini',
      badgeColor: '#64748b',
      bg: '#f8fafc',
      sesiAktif: null,
      scanOpen
    };
  };

  const sesiStatus = getCurrentSesiStatus();

  // ========================================================
  // HANDLERS UNTUK GRID MATRIX HALAQOH (HANYA MASUK / LIBUR)
  // ========================================================
  const handleHalaqohCellClick = (sesiId, hari) => {
    const current = jadwalHalaqoh.matriks?.[sesiId]?.[hari];
    const currentStatus = (current?.status === 'Keluar') ? 'Libur' : current?.status;
    // Jika sel sudah berisi status yang sama, toggle ke kebalikannya
    if (currentStatus === selectedHalaqohStatus) {
      const newStatus = selectedHalaqohStatus === 'Masuk' ? 'Libur' : 'Masuk';
      storageService.setHalaqohMatrixCell(sesiId, hari, { status: newStatus, guru: '' });
      setJadwalHalaqoh(storageService.getJadwalHalaqoh());
      showToast && showToast(`Slot ${hari} - ${sesiId.toUpperCase()}: diubah ke ${newStatus.toUpperCase()}`);
    } else {
      storageService.setHalaqohMatrixCell(sesiId, hari, { status: selectedHalaqohStatus, guru: '' });
      setJadwalHalaqoh(storageService.getJadwalHalaqoh());
      showToast && showToast(`Slot ${hari} - ${sesiId.toUpperCase()}: disetel ${selectedHalaqohStatus.toUpperCase()}`);
    }
  };

  const handleClearHalaqohCell = (e, sesiId, hari) => {
    e.stopPropagation();
    storageService.clearHalaqohMatrixCell(sesiId, hari);
    setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    showToast && showToast(`Slot ${hari} - ${sesiId.toUpperCase()} dikosongkan.`);
  };

  const handleApplyPresetHalaqoh = (type) => {
    const updated = { ...jadwalHalaqoh };
    if (!updated.matriks) updated.matriks = {};

    updated.sesiList.forEach(sesi => {
      if (!updated.matriks[sesi.id]) updated.matriks[sesi.id] = {};
      HARI_LIST.forEach(hari => {
        if (type === 'semua-masuk') {
          updated.matriks[sesi.id][hari] = { status: 'Masuk', guru: '' };
        } else if (type === 'jumat-subuh') {
          if (hari === 'Jumat') {
            updated.matriks[sesi.id][hari] = sesi.id === 'subuh' ? { status: 'Masuk', guru: '' } : { status: 'Libur', guru: '' };
          }
        } else if (type === 'ahad-libur' || type === 'ahad-keluar') {
          if (hari === 'Ahad') {
            updated.matriks[sesi.id][hari] = { status: 'Keluar', guru: '' };
          }
        }
      });
    });

    storageService.saveJadwalHalaqoh(updated);
    setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    showToast && showToast(`Preset diterapkan: ${type}`);
  };

  const handleResetHalaqohGrid = () => {
    if (window.confirm("Kosongkan seluruh tabel jadwal sesi halaqoh? Semua slot akan direset menjadi kosong.")) {
      const updated = {
        ...jadwalHalaqoh,
        matriks: {},
        hariAktif: {}
      };

      (jadwalHalaqoh.sesiList || []).forEach(sesi => {
        updated.matriks[sesi.id] = {};
        HARI_LIST.forEach(hari => {
          updated.matriks[sesi.id][hari] = { status: 'Kosong', guru: '' };
          if (!updated.hariAktif[hari]) updated.hariAktif[hari] = {};
          updated.hariAktif[hari][sesi.id] = false;
        });
      });

      storageService.saveJadwalHalaqoh(updated);
      setJadwalHalaqoh(updated);
      showToast && showToast("Seluruh tabel jadwal halaqoh berhasil dikosongkan.");
    }
  };

  const handleDownloadHalaqohCSV = () => {
    const headers = ["Sesi", "Jam Mulai", "Jam Selesai", "Buka Scan", "Batas Scan", "Toleransi", ...HARI_LIST];
    const rows = (jadwalHalaqoh.sesiList || []).map(sesi => {
      const dayCells = HARI_LIST.map(h => {
        const c = jadwalHalaqoh.matriks?.[sesi.id]?.[h];
        if (!c || c.status === 'Kosong') return '"-"';
        const st = c.status === 'Libur' ? 'Keluar' : c.status;
        return `"${st}"`;
      });
      return [
        `"${sesi.nama}"`,
        `"${sesi.mulai}"`,
        `"${sesi.selesai}"`,
        `"${sesi.bukaScan}"`,
        `"${sesi.batasScan}"`,
        `"${sesi.toleransiMenit}m"`,
        ...dayCells
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jadwal_Sesi_Halaqoh_MAIAS.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Jadwal Halaqoh berhasil diunduh (CSV / Excel)!");
  };

  const handleUpdateHalaqoh = () => {
    storageService.saveJadwalHalaqoh(jadwalHalaqoh);
    showToast && showToast("Jadwal Sesi Halaqoh berhasil disimpan!");
  };

  // Handlers untuk Edit Jam Sesi
  const handleOpenEditSesi = (sesi, e) => {
    if (e) e.stopPropagation();
    setEditingSesi({ ...sesi });
  };

  const handleSaveSesi = (e) => {
    if (e) e.preventDefault();
    if (!editingSesi) return;
    storageService.updateSesiHalaqoh(editingSesi.id, editingSesi);
    setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    setEditingSesi(null);
    showToast && showToast(`Jam masuk & pengaturan ${editingSesi.nama} berhasil disimpan!`);
  };

  const handleAddSesi = (e) => {
    e.preventDefault();
    if (!newSesiForm.nama || !newSesiForm.mulai || !newSesiForm.selesai) {
      showToast && showToast("Mohon lengkapi nama sesi dan jam masuk/selesai!");
      return;
    }
    const created = storageService.addSesiHalaqoh(newSesiForm);
    setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    setShowAddSesiModal(false);
    setNewSesiForm({
      nama: '',
      labelWaktu: '',
      mulai: '05:00',
      selesai: '06:30',
      bukaScan: '04:45',
      batasScan: '05:30',
      toleransiMenit: 15,
      deskripsi: ''
    });
    showToast && showToast(`Sesi baru "${created.nama}" berhasil ditambahkan!`);
  };

  const handleDeleteSesi = (sesiId, sesiNama) => {
    if (window.confirm(`Hapus sesi "${sesiNama}" dari daftar jadwal halaqoh?`)) {
      storageService.deleteSesiHalaqoh(sesiId);
      setJadwalHalaqoh(storageService.getJadwalHalaqoh());
      showToast && showToast(`Sesi "${sesiNama}" berhasil dihapus.`);
    }
  };

  // Handlers untuk Plotting & Libur
  const handleSavePlotting = (e) => {
    e.preventDefault();
    if (!plottingForm.namaGuru || !plottingForm.lokasiId) {
      showToast && showToast("Mohon pilih Guru Pengampu dan Lokasi Ruangan QR!");
      return;
    }
    const targetLokasi = lokasiQRList.find(l => l.id === plottingForm.lokasiId) || lokasiQRList[0];
    const item = {
      namaGuru: plottingForm.namaGuru,
      lokasiId: targetLokasi.id,
      namaLokasi: targetLokasi.lokasi || targetLokasi.nama || targetLokasi.kodeManual || 'Masjid Tahfidz',
      kodeQR: targetLokasi.kodeManual,
      sesi: plottingForm.sesi
    };
    storageService.addPlottingPengampu(item);
    setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    setShowAddPlottingModal(false);
    setPlottingForm({ namaGuru: '', lokasiId: '', sesi: ['subuh', 'malam'] });
    showToast && showToast(`Penugasan ${item.namaGuru} berhasil disimpan!`);
  };

  const handleDeletePlotting = (id) => {
    if (window.confirm("Hapus penugasan pengampu ini dari lokasi halaqoh?")) {
      storageService.deletePlottingPengampu(id);
      setJadwalHalaqoh(storageService.getJadwalHalaqoh());
      showToast && showToast("Penugasan pengampu berhasil dihapus.");
    }
  };

  const handleSaveLibur = (e) => {
    e.preventDefault();
    if (!liburForm.tanggal || !liburForm.keterangan) {
      showToast && showToast("Mohon isi tanggal dan keterangan agenda libur!");
      return;
    }
    storageService.addLiburKhusus(liburForm);
    setJadwalHalaqoh(storageService.getJadwalHalaqoh());
    setShowAddLiburModal(false);
    setLiburForm({ tanggal: '', keterangan: '', kategori: 'Kepulangan' });
    showToast && showToast("Agenda Libur Khusus berhasil ditambahkan!");
  };

  const handleDeleteLibur = (id) => {
    if (window.confirm("Hapus agenda libur khusus ini?")) {
      storageService.deleteLiburKhusus(id);
      setJadwalHalaqoh(storageService.getJadwalHalaqoh());
      showToast && showToast("Agenda libur khusus dihapus.");
    }
  };

  // ========================================================
  // HANDLERS UNTUK JADWAL KBM FORMAL (DIPERTAHANKAN)
  // ========================================================
  const handleCellClick = (jamKe, hari) => {
    const updated = { ...jadwalKBM };
    if (!updated.matriks[jamKe]) updated.matriks[jamKe] = {};
    const currentCell = updated.matriks[jamKe][hari];
    if (currentCell && currentCell.mapel === selectedMapel && (selectedGuru === '-- Tanpa Guru --' || currentCell.guru === selectedGuru)) {
      updated.matriks[jamKe][hari] = null;
      showToast && showToast(`Slot ${hari} Jam ke-${jamKe} dikosongkan.`);
    } else {
      updated.matriks[jamKe][hari] = {
        mapel: selectedMapel,
        guru: selectedGuru !== '-- Tanpa Guru --' ? selectedGuru : ''
      };
      showToast && showToast(`Slot ${hari} Jam ke-${jamKe}: ${selectedMapel}`);
    }
    setJadwalKBM(updated);
    storageService.saveSigapJadwal(updated);
  };

  const handleClearCell = (e, jamKe, hari) => {
    e.stopPropagation();
    const updated = { ...jadwalKBM };
    if (updated.matriks[jamKe]) {
      updated.matriks[jamKe][hari] = null;
      setJadwalKBM(updated);
      storageService.saveSigapJadwal(updated);
      showToast && showToast(`Pelajaran pada ${hari} Jam ke-${jamKe} dihapus.`);
    }
  };

  const handleResetSchedule = () => {
    if (window.confirm(`Kosongkan seluruh jadwal pelajaran untuk kelas ${selectedKelas}?`)) {
      const updated = { ...jadwalKBM, matriks: {} };
      setJadwalKBM(updated);
      storageService.saveSigapJadwal(updated);
      showToast && showToast(`Jadwal kelas ${selectedKelas} telah dikosongkan.`);
    }
  };

  const handleDownloadSchedule = () => {
    const headers = ["Jam Ke", "Waktu", ...daysKBM];
    const rows = jadwalKBM.jamPelajaran.map(j => {
      if (j.isIstirahat) {
        return [j.jamKe, `"${j.waktu}"`, `"${j.label}"`, `"${j.label}"`, `"${j.label}"`, `"${j.label}"`, `"${j.label}"`, `"${j.label}"`];
      }
      return [
        j.jamKe,
        `"${j.waktu}"`,
        ...daysKBM.map(d => {
          const c = jadwalKBM.matriks[j.jamKe]?.[d];
          return c ? `"${c.mapel} (${c.guru || '-'})"` : `"-"`;
        })
      ];
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jadwal_Pelajaran_MAIAS_${selectedKelas.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Jadwal Pelajaran berhasil diunduh (CSV / Excel)!");
  };

  const handleUpdateKBM = () => {
    storageService.saveSigapJadwal(jadwalKBM);
    showToast && showToast(`Jadwal Pelajaran kelas ${selectedKelas} berhasil diperbarui!`);
  };

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. TOP HEADER DENGAN TAB SWITCHER (DISEMBUNYIKAN DI TAMPILAN MOBILE) */}
      <div className="sigap-page-header-row sigap-mobile-hide" style={{ alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 className="sigap-page-title" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Atur Jadwal Sesi Halaqoh</h1>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Pengaturan sesi waktu fleksibel dan penentuan status masuk/libur mingguan seluruh pengampu
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAMPILAN 1: JADWAL SESI HALAQOH (BERLAKU UNTUK SEMUA PENGAMPU)            */}
      {/* ========================================================================= */}
      {activeTab === 'halaqoh' && (
        <div>
          {/* LIVE STATUS RIBBON */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '14px 20px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 14px rgba(6, 78, 59, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a7f3d0', fontWeight: 800 }}>
                  Waktu Sistem & Pantauan Sesi Real-Time
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  {dateString} • <span style={{ fontFamily: 'monospace', color: '#6ee7b7' }}>{timeString} WIB</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                background: sesiStatus.bg,
                color: sesiStatus.badgeColor,
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sesiStatus.badgeColor, display: 'inline-block' }}></span>
                <span>{sesiStatus.statusText}</span>
              </div>

              {sesiStatus.scanOpen ? (
                <div style={{
                  background: '#0f766e',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  Jendela Scan QR: Dibuka
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  Scan QR: Ditutup
                </div>
              )}
            </div>
          </div>

          {/* TOOLBAR HALAQOH */}
          <div className="sigap-page-header-row" style={{ alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="#059669" />
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Jadwal Sesi Halaqoh (Semua Pengampu)
              </h2>
            </div>

            <div className="sigap-page-actions" style={{ gap: '8px', flexWrap: 'wrap' }}>
              {/* Tambah Sesi Baru */}
              <button
                className="sigap-btn-slate"
                onClick={() => setShowAddSesiModal(true)}
                style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}
              >
                <Plus size={13} />
                <span>Tambah Sesi</span>
              </button>

              {/* Download CSV */}
              <button 
                className="sigap-btn-green"
                onClick={handleDownloadHalaqohCSV}
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                <Download size={13} />
                <span>Download</span>
              </button>

              {/* Simpan Jadwal */}
              <button 
                className="sigap-btn-teal"
                onClick={handleUpdateHalaqoh}
                style={{ padding: '6px 14px', fontSize: '11px' }}
              >
                <Save size={13} />
                <span>Simpan Jadwal</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TOOLBAR STATUS SESI & AKSI CEPAT (DI ATAS JADWAL)         */}
          {/* ======================================================== */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '14px 18px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            {/* PILIHAN STATUS: MASUK, LIBUR, DAN KOSONGKAN TABEL */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#0f766e" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status Sesi:
                </span>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* OPSI 1: MASUK */}
                <button
                  type="button"
                  onClick={() => setSelectedHalaqohStatus('Masuk')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    background: selectedHalaqohStatus === 'Masuk' ? '#059669' : '#ffffff',
                    color: selectedHalaqohStatus === 'Masuk' ? '#ffffff' : '#047857',
                    border: selectedHalaqohStatus === 'Masuk' ? '2px solid #059669' : '2px solid #a7f3d0',
                    boxShadow: selectedHalaqohStatus === 'Masuk' ? '0 4px 12px rgba(5,150,105,0.22)' : 'none'
                  }}
                >
                  <CheckCircle2 size={16} color={selectedHalaqohStatus === 'Masuk' ? '#ffffff' : '#059669'} />
                  <span>MASUK</span>
                </button>

                {/* OPSI 2: LIBUR */}
                <button
                  type="button"
                  onClick={() => setSelectedHalaqohStatus('Libur')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    background: selectedHalaqohStatus === 'Libur' ? '#dc2626' : '#ffffff',
                    color: selectedHalaqohStatus === 'Libur' ? '#ffffff' : '#b91c1c',
                    border: selectedHalaqohStatus === 'Libur' ? '2px solid #dc2626' : '2px solid #fecaca',
                    boxShadow: selectedHalaqohStatus === 'Libur' ? '0 4px 12px rgba(220,38,38,0.22)' : 'none'
                  }}
                >
                  <CheckCircle2 size={16} color={selectedHalaqohStatus === 'Libur' ? '#ffffff' : '#dc2626'} />
                  <span>LIBUR</span>
                </button>

                {/* TOMBOL KOSONGKAN TABEL (PERSIS DI SAMPING LIBUR) */}
                <button
                  type="button"
                  onClick={handleResetHalaqohGrid}
                  title="Kosongkan seluruh tabel jadwal sesi halaqoh"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '2px solid #fecaca'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                >
                  <Trash2 size={15} />
                  <span>Kosongkan Tabel</span>
                </button>
              </div>

              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                (Pilih <strong>MASUK</strong> atau <strong>LIBUR</strong>, lalu klik sel pada tabel jadwal di bawah)
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TABEL GRID JADWAL HALAQOH (RESPONSIF MOBILE & TABLET)    */}
          {/* ======================================================== */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>

            {/* CONTAINER OVERFLOW X UNTUK TABLET & MOBILE */}
            <div style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              width: '100%'
            }}>
              <table style={{
                width: '100%',
                minWidth: '860px',
                borderCollapse: 'separate',
                borderSpacing: 0,
                tableLayout: 'fixed'
              }}>
                <thead>
                  <tr>
                    {/* KOLOM 1 HEADER: STICKY ON MOBILE/TABLET */}
                    <th style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 10,
                      width: '160px',
                      minWidth: '160px',
                      padding: '12px 10px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#334155',
                      background: '#f1f5f9',
                      borderRight: '2px solid #cbd5e1',
                      borderBottom: '1.5px solid #cbd5e1',
                      textAlign: 'center',
                      boxShadow: '2px 0 5px rgba(0,0,0,0.04)'
                    }}>
                      WAKTU / SESI
                    </th>
                    {HARI_LIST.map(d => {
                      const isToday = d === hariIni;
                      return (
                        <th 
                          key={d} 
                          style={{
                            padding: '12px 8px',
                            fontSize: '12px',
                            fontWeight: 800,
                            color: isToday ? '#065f46' : '#334155',
                            background: isToday ? '#dcfce7' : '#f8fafc',
                            borderRight: '1px solid #e2e8f0',
                            borderBottom: '1.5px solid #cbd5e1',
                            textAlign: 'center',
                            width: 'calc((100% - 120px) / 7)'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <span>{d}</span>
                            {isToday && (
                              <span style={{
                                fontSize: '9px',
                                background: '#059669',
                                color: '#ffffff',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: 800,
                                letterSpacing: '0.04em'
                              }}>
                                HARI INI
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(jadwalHalaqoh.sesiList || []).map(sesi => (
                    <tr key={sesi.id}>
                      {/* KOLOM 1: INFO SESI (HANYA SESI & JAM + IKON MATA & PENSIL) */}
                      <td style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        width: '120px',
                        minWidth: '120px',
                        padding: '10px 8px',
                        background: '#f8fafc',
                        borderRight: '2px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        boxShadow: '2px 0 5px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a', lineHeight: 1.25 }}>
                            {sesi.nama}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#059669',
                            fontFamily: 'monospace',
                            letterSpacing: '0.02em'
                          }}>
                            {sesi.mulai} - {sesi.selesai}
                          </div>

                          {/* IKON MATA (DETAIL) DAN PENSIL (EDIT) BERDAMPINGAN */}
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            {/* Tombol Mata (Detail Sesi) */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setViewingDetailSesi(sesi); }}
                              title="Lihat Detail Aturan Presensi Sesi"
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                              }}
                            >
                              <Eye size={13} />
                            </button>

                            {/* Tombol Pensil (Edit Sesi) */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditSesi(sesi, e)}
                              title="Edit Nama & Jam Masuk Sesi"
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                              }}
                            >
                              <Edit3 size={13} />
                            </button>

                            {/* Tombol Tong Sampah (Hapus Sesi) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSesi(sesi.id, sesi.nama);
                              }}
                              title={`Hapus Sesi "${sesi.nama}"`}
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '6px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 7 KOLOM HARI: SENIN s/d AHAD (HANYA STATUS MASUK / KELUAR) */}
                      {HARI_LIST.map(hari => {
                        const cell = jadwalHalaqoh.matriks?.[sesi.id]?.[hari];
                        const isMasuk = cell ? cell.status === 'Masuk' : !!(jadwalHalaqoh.hariAktif?.[hari]?.[sesi.id]);
                        const isLibur = cell ? (cell.status === 'Libur' || cell.status === 'Keluar') : false;

                        return (
                          <td
                            key={hari}
                            onClick={() => handleHalaqohCellClick(sesi.id, hari)}
                            style={{
                              padding: '8px 6px',
                              borderRight: '1px solid #e2e8f0',
                              borderBottom: '1px solid #e2e8f0',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              cursor: 'pointer',
                              height: '76px',
                              background: isMasuk ? '#f0fdf4' : (isLibur ? '#fef2f2' : '#ffffff'),
                              transition: 'all 0.12s ease'
                            }}
                          >
                            {isMasuk && (
                              <div style={{
                                position: 'relative',
                                background: '#ffffff',
                                border: '1.5px solid #86efac',
                                borderRadius: '10px',
                                padding: '10px 6px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                              }}>
                                <button
                                  type="button"
                                  onClick={(e) => handleClearHalaqohCell(e, sesi.id, hari)}
                                  title="Kosongkan slot ini"
                                  style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '4px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    fontWeight: 800,
                                    fontSize: '13px',
                                    lineHeight: 1,
                                    cursor: 'pointer',
                                    padding: '0 2px'
                                  }}
                                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                >
                                  ×
                                </button>
                                <span style={{
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  letterSpacing: '0.04em'
                                }}>
                                  MASUK
                                </span>
                              </div>
                            )}

                            {isLibur && (
                              <div style={{
                                position: 'relative',
                                background: '#ffffff',
                                border: '1.5px solid #fca5a5',
                                borderRadius: '10px',
                                padding: '10px 6px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                              }}>
                                <button
                                  type="button"
                                  onClick={(e) => handleClearHalaqohCell(e, sesi.id, hari)}
                                  title="Kosongkan slot ini"
                                  style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '4px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    fontWeight: 800,
                                    fontSize: '13px',
                                    lineHeight: 1,
                                    cursor: 'pointer',
                                    padding: '0 2px'
                                  }}
                                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                >
                                  ×
                                </button>
                                <span style={{
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  letterSpacing: '0.04em'
                                }}>
                                  LIBUR
                                </span>
                              </div>
                            )}

                            {!isMasuk && !isLibur && (
                              <div style={{
                                height: '100%',
                                minHeight: '56px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#cbd5e1',
                                fontSize: '16px',
                                borderRadius: '8px',
                                border: '1.5px dashed #e2e8f0',
                                transition: 'all 0.12s ease'
                              }}>
                                +
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DUA KOLOM BAWAH: PLOTTING PENGAMPU KE QR & AGENDA LIBUR KHUSUS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            {/* KOLOM KIRI: PLOTTING PENGAMPU KE LOKASI QR */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    Penugasan Pengampu & Lokasi QR
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Tentukan lokasi ustadz melakukan scan QR halaqoh
                  </p>
                </div>

                <button
                  onClick={() => setShowAddPlottingModal(true)}
                  className="sigap-btn-teal"
                  style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700 }}
                >
                  + Plotting Baru
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(jadwalHalaqoh.plottingPengampu || []).map((plt) => (
                  <div
                    key={plt.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{plt.namaGuru}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>
                          {plt.namaLokasi}
                        </span>
                        <span style={{ fontSize: '9.5px', background: '#e2e8f0', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>
                          QR: {plt.kodeQR}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        {plt.sesi?.map(s => (
                          <span key={s} style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '6px', textTransform: 'uppercase' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePlotting(plt.id)}
                      className="sigap-btn-action delete"
                      title="Hapus Penugasan"
                      style={{ width: '28px', height: '28px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* KOLOM KANAN: AGENDA LIBUR KHUSUS / KALENDER SANTRI */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    Agenda Libur Khusus / Insidental
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Tanggal libur kepulangan santri atau event madrasah
                  </p>
                </div>

                <button
                  onClick={() => setShowAddLiburModal(true)}
                  className="sigap-btn-slate"
                  style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 700 }}
                >
                  + Libur Khusus
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(!jadwalHalaqoh.liburKhusus || jadwalHalaqoh.liburKhusus.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12px' }}>
                    Tidak ada agenda libur khusus aktif.
                  </div>
                ) : (
                  jadwalHalaqoh.liburKhusus.map((lb) => (
                    <div
                      key={lb.id}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>
                            {lb.tanggal}
                          </span>
                          <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '6px' }}>
                            {lb.kategori}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#7f1d1d', marginTop: '2px', fontWeight: 600 }}>
                          {lb.keterangan}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLibur(lb.id)}
                        className="sigap-btn-action delete"
                        title="Hapus Agenda Libur"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAMPILAN 2: JADWAL PELAJARAN KBM FORMAL (DIPERTAHANKAN RAPI)              */}
      {/* ========================================================================= */}
      {activeTab === 'kbm' && (
        <div>
          {/* TOOLBAR KBM */}
          <div className="sigap-page-header-row" style={{ alignItems: 'flex-start', marginTop: '6px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={20} color="#059669" />
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Jadwal Pelajaran Kelas Formal (KBM)
                </h2>
              </div>
            </div>

            <div className="sigap-page-actions" style={{ gap: '8px' }}>
              {/* Select Kelas */}
              <div style={{ minWidth: '160px' }}>
                <CustomSelect 
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  triggerStyle={{ minHeight: '38px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}
                >
                  <option value="X A">Kelas: X A</option>
                  <option value="X B">Kelas: X B</option>
                  <option value="XI A">Kelas: XI A</option>
                  <option value="XI B">Kelas: XI B</option>
                  <option value="XII A">Kelas: XII A</option>
                  <option value="XII B">Kelas: XII B</option>
                </CustomSelect>
              </div>

              {/* Download CSV */}
              <button 
                className="sigap-btn-green"
                onClick={handleDownloadSchedule}
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                <Download size={13} />
                <span>Download</span>
              </button>

              {/* Reset / Clear */}
              <button 
                className="sigap-btn-action delete"
                onClick={handleResetSchedule}
                title="Kosongkan Jadwal"
                style={{ width: '32px', height: '32px' }}
              >
                <Trash2 size={15} />
              </button>

              {/* Simpan Jadwal */}
              <button 
                className="sigap-btn-teal"
                onClick={handleUpdateKBM}
                style={{ padding: '6px 14px', fontSize: '11px' }}
              >
                <Save size={13} />
                <span>Simpan Jadwal</span>
              </button>
            </div>
          </div>

          {/* DUA KOLOM: SETUP PENGAMPU & MATRIKS JADWAL */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', alignItems: 'start' }}>
            {/* SETUP PENGAMPU */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', color: '#334155', textTransform: 'uppercase', marginBottom: '12px' }}>
                Setup Pengampu
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Pilih Guru:
                </label>
                <CustomSelect 
                  triggerStyle={{ minHeight: '38px', borderRadius: '12px', fontSize: '12px' }}
                  value={selectedGuru}
                  onChange={(e) => setSelectedGuru(e.target.value)}
                  searchable={true}
                  searchPlaceholder="Cari nama guru..."
                >
                  <option value="-- Tanpa Guru --">-- Tanpa Guru --</option>
                  {guruList.map(g => (
                    <option key={g.id} value={g.nama}>{g.nama}</option>
                  ))}
                </CustomSelect>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Pilih Mapel:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '420px', overflowY: 'auto' }}>
                  {LIST_MAPEL.map((mapel) => (
                    <button
                      key={mapel}
                      style={{
                        background: selectedMapel === mapel ? '#ecfdf5' : '#ffffff',
                        color: selectedMapel === mapel ? '#065f46' : '#334155',
                        border: selectedMapel === mapel ? '1.5px solid #059669' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: selectedMapel === mapel ? 800 : 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => setSelectedMapel(mapel)}
                    >
                      {mapel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TIMETABLE GRID */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              overflowX: 'auto',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 8px', fontSize: '11px', fontWeight: 800, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', width: '90px', textAlign: 'center' }}>
                      WAKTU
                    </th>
                    {daysKBM.map(d => (
                      <th key={d} style={{ padding: '10px 8px', fontSize: '11px', fontWeight: 800, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jadwalKBM.jamPelajaran.map((jam) => {
                    if (jam.isIstirahat) {
                      return (
                        <tr key={jam.jamKe}>
                          <td style={{ padding: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                            {jam.waktu}
                          </td>
                          <td 
                            colSpan={daysKBM.length} 
                            style={{ 
                              padding: '8px', 
                              background: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '11px', 
                              fontWeight: 800, 
                              letterSpacing: '0.1em',
                              color: '#64748b' 
                            }}
                          >
                            {jam.label} - ISTIRAHAT
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={jam.jamKe}>
                        <td style={{ padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '13px', color: '#1e293b' }}>{jam.jamKe}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{jam.waktu}</div>
                        </td>

                        {daysKBM.map((hari) => {
                          const cell = jadwalKBM.matriks[jam.jamKe]?.[hari];
                          return (
                            <td 
                              key={hari}
                              onClick={() => handleCellClick(jam.jamKe, hari)}
                              style={{
                                padding: '6px',
                                border: '1px solid #e2e8f0',
                                verticalAlign: 'top',
                                cursor: 'pointer',
                                height: '65px',
                                background: cell ? '#ecfdf5' : '#ffffff',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {cell ? (
                                <div style={{
                                  position: 'relative',
                                  background: '#ffffff',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: '8px',
                                  padding: '6px 8px',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                }}>
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065f46' }}>
                                        {cell.mapel}
                                      </span>
                                      <button
                                        onClick={(e) => handleClearCell(e, jam.jamKe, hari)}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: '#ef4444',
                                          fontWeight: 800,
                                          fontSize: '12px',
                                          lineHeight: 1,
                                          cursor: 'pointer',
                                          padding: '0 2px'
                                        }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {cell.guru || '-'}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#cbd5e1',
                                  fontSize: '12px'
                                }}>
                                  +
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      
      {/* ========================================================================= */}
      {/* MODAL DETAIL SESI (DIBUKA SAAT KLIK IKON MATA)                            */}
      {/* ========================================================================= */}
      {viewingDetailSesi && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setViewingDetailSesi(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#0f766e" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Detail {viewingDetailSesi.nama}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setViewingDetailSesi(null)}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #a7f3d0',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>Jam Masuk s/d Selesai</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#064e3b', fontFamily: 'monospace', marginTop: '2px' }}>
                    {viewingDetailSesi.mulai} - {viewingDetailSesi.selesai} WIB
                  </div>
                </div>
                <div style={{
                  background: '#059669',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {viewingDetailSesi.nama}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>Buka Scan QR</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', marginTop: '2px' }}>
                    {viewingDetailSesi.bukaScan || '-'} WIB
                  </div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>Batas Akhir Scan</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', marginTop: '2px' }}>
                    {viewingDetailSesi.batasScan || '-'} WIB
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>Toleransi Keterlambatan</div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {viewingDetailSesi.toleransiMenit || 15} Menit setelah jam {viewingDetailSesi.mulai}
                </div>
              </div>

              {viewingDetailSesi.labelWaktu && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>Keterangan Sesi</div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    {viewingDetailSesi.labelWaktu}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              <button
                type="button"
                onClick={() => setViewingDetailSesi(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = viewingDetailSesi;
                  setViewingDetailSesi(null);
                  handleDeleteSesi(s.id, s.nama);
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={13} />
                <span>Hapus Sesi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = viewingDetailSesi;
                  setViewingDetailSesi(null);
                  handleOpenEditSesi(s);
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f766e',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit3 size={13} />
                <span>Edit Sesi Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ATUR JAM MASUK SESI (PASTI MUNCUL DENGAN POSITION FIXED & Z-INDEX)*/}
      {/* ========================================================================= */}
      {editingSesi && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setEditingSesi(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Atur Nama Sesi & Jam Masuk Presensi
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Ubah nama sesi (Sesi Subuh, Pagi, dll), jam masuk/selesai, serta jendela scan QR
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setEditingSesi(null)}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Body Modal */}
            <form onSubmit={handleSaveSesi}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Nama Sesi *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 700 }}
                    value={editingSesi.nama || ''}
                    onChange={e => setEditingSesi({ ...editingSesi, nama: e.target.value })}
                    placeholder="Contoh: Sesi Subuh, Sesi Pagi, Sesi Sore..."
                    required
                  />
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                    Ubah nama sesi ini sesuai kebutuhan (misal: Sesi Subuh, Sesi Pagi / Dhuha, dll).
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Jam Masuk Sesi *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={editingSesi.mulai}
                      onChange={e => setEditingSesi({ ...editingSesi, mulai: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Jam Selesai Sesi *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={editingSesi.selesai}
                      onChange={e => setEditingSesi({ ...editingSesi, selesai: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Scan QR Dibuka Pukul *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={editingSesi.bukaScan}
                      onChange={e => setEditingSesi({ ...editingSesi, bukaScan: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Batas Akhir Scan *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={editingSesi.batasScan}
                      onChange={e => setEditingSesi({ ...editingSesi, batasScan: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Toleransi Terlambat (Menit) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    className="form-input"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    value={editingSesi.toleransiMenit}
                    onChange={e => setEditingSesi({ ...editingSesi, toleransiMenit: parseInt(e.target.value) || 0 })}
                  />
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                    Lewat dari {editingSesi.toleransiMenit || 15} menit setelah jam masuk ({editingSesi.mulai}) akan otomatis dicatat "Terlambat".
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Keterangan Sesi
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    value={editingSesi.labelWaktu || ''}
                    onChange={e => setEditingSesi({ ...editingSesi, labelWaktu: e.target.value })}
                    placeholder="Contoh: Ba'da Subuh (Ziyadah)"
                  />
                </div>
              </div>

              {/* Footer Modal */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <button 
                  type="button" 
                  onClick={() => {
                    const id = editingSesi.id;
                    const nama = editingSesi.nama;
                    setEditingSesi(null);
                    handleDeleteSesi(id, nama);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Hapus Sesi</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setEditingSesi(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Batal
                  </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    background: '#0f766e',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)'
                  }}
                >
                  <Save size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH SESI BARU                                                 */}
      {/* ========================================================================= */}
      {showAddSesiModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setShowAddSesiModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Tambah Baris Sesi Halaqoh Baru
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Tambah jam sesi baru untuk seluruh pengampu
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddSesiModal(false)}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSesi}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Nama Sesi *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Sesi Tahajud / Qiyamul Lail"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    value={newSesiForm.nama}
                    onChange={e => setNewSesiForm({ ...newSesiForm, nama: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Keterangan Sesi
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Qiyamul Lail & Ziyadah Mandiri"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    value={newSesiForm.labelWaktu}
                    onChange={e => setNewSesiForm({ ...newSesiForm, labelWaktu: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Jam Masuk Sesi *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={newSesiForm.mulai}
                      onChange={e => setNewSesiForm({ ...newSesiForm, mulai: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Jam Selesai Sesi *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={newSesiForm.selesai}
                      onChange={e => setNewSesiForm({ ...newSesiForm, selesai: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Buka Scan QR *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={newSesiForm.bukaScan}
                      onChange={e => setNewSesiForm({ ...newSesiForm, bukaScan: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Batas Akhir Scan *
                    </label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                      value={newSesiForm.batasScan}
                      onChange={e => setNewSesiForm({ ...newSesiForm, batasScan: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Toleransi Terlambat (Menit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    className="form-input"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    value={newSesiForm.toleransiMenit}
                    onChange={e => setNewSesiForm({ ...newSesiForm, toleransiMenit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddSesiModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    background: '#0f766e',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={14} />
                  <span>Tambahkan Sesi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH PENUGASAN PENGAMPU KE LOKASI QR                          */}
      {/* ========================================================================= */}
      {showAddPlottingModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setShowAddPlottingModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Tambah Penugasan Pengampu
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Petakan ustadz ke lokasi QR dan sesi tugasnya
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddPlottingModal(false)}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePlotting}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Pilih Guru / Ustadz Pengampu *
                  </label>
                  <CustomSelect
                    triggerStyle={{ minHeight: '42px', borderRadius: '12px', fontSize: '13px' }}
                    value={plottingForm.namaGuru}
                    onChange={e => setPlottingForm({ ...plottingForm, namaGuru: e.target.value })}
                    searchable={true}
                    searchPlaceholder="Cari ustadz / guru..."
                    placeholder="-- Pilih Guru Pengampu --"
                    required
                  >
                    <option value="">-- Pilih Guru Pengampu --</option>
                    {guruList.map(g => (
                      <option key={g.id} value={g.nama}>{g.nama} ({g.jabatan || 'Guru'})</option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Pilih Ruangan / Lokasi QR *
                  </label>
                  <CustomSelect
                    triggerStyle={{ minHeight: '42px', borderRadius: '12px', fontSize: '13px' }}
                    value={plottingForm.lokasiId}
                    onChange={e => setPlottingForm({ ...plottingForm, lokasiId: e.target.value })}
                    searchable={true}
                    searchPlaceholder="Cari nama lokasi QR..."
                    placeholder="-- Pilih Titik Lokasi Presensi --"
                    required
                  >
                    <option value="">-- Pilih Titik Lokasi Presensi --</option>
                    {lokasiQRList.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.lokasi || l.kelas} ({l.kodeManual})
                      </option>
                    ))}
                  </CustomSelect>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Sesi yang Ditugaskan *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    {(jadwalHalaqoh.sesiList || []).map(s => {
                      const checked = plottingForm.sesi.includes(s.id);
                      return (
                        <label 
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: checked ? '#ecfdf5' : '#f8fafc',
                            border: checked ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPlottingForm({ ...plottingForm, sesi: [...plottingForm.sesi, s.id] });
                              } else {
                                setPlottingForm({ ...plottingForm, sesi: plottingForm.sesi.filter(item => item !== s.id) });
                              }
                            }}
                          />
                          <span>{s.nama}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddPlottingModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    background: '#0f766e',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={14} />
                  <span>Simpan Penugasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TAMBAH AGENDA LIBUR KHUSUS                                       */}
      {/* ========================================================================= */}
      {showAddLiburModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setShowAddLiburModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Tambah Agenda Libur Khusus
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Libur kepulangan santri, tasmi', atau event madrasah
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddLiburModal(false)}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLibur}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Tanggal Libur *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    value={liburForm.tanggal}
                    onChange={e => setLiburForm({ ...liburForm, tanggal: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Kategori Libur *
                  </label>
                  <CustomSelect
                    triggerStyle={{ minHeight: '42px', borderRadius: '12px', fontSize: '13px' }}
                    value={liburForm.kategori}
                    onChange={e => setLiburForm({ ...liburForm, kategori: e.target.value })}
                  >
                    <option value="Kepulangan">Kepulangan Santri Bulanan</option>
                    <option value="Hari Raya">Hari Raya & Libur Nasional</option>
                    <option value="Event Khusus">Tasmi' Akbar / Wisuda Tahfidz</option>
                    <option value="Ujian">Ujian Semester / Syahadah</option>
                    <option value="Lainnya">Lainnya</option>
                  </CustomSelect>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Keterangan / Alasan Libur *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                    value={liburForm.keterangan}
                    onChange={e => setLiburForm({ ...liburForm, keterangan: e.target.value })}
                    placeholder="Contoh: Libur Kepulangan Triwulan I"
                    required
                  />
                </div>
              </div>

              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddLiburModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    background: '#0f766e',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={14} />
                  <span>Tambahkan Libur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
