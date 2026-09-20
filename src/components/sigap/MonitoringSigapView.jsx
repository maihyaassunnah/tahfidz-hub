import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Share2, 
  FileText, 
  Calendar, 
  Check, 
  Sparkles,
  Users,
  Search,
  Filter,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function MonitoringSigapView({ showToast, activeBranchId = 'cabang-pusat' }) {
  const todayStr = storageService.getTodayISO ? storageService.getTodayISO() : new Date().toISOString().split('T')[0];
  const [monitoringData, setMonitoringData] = useState(storageService.getSigapMonitoring());
  const [activeSubTab, setActiveSubTab] = useState('kbm-guru'); // 'kbm-guru' or 'siswa-rekap'
  const [dariTanggal, setDariTanggal] = useState(todayStr);
  const [sampaiTanggal, setSampaiTanggal] = useState(todayStr);

  // Filter state for KBM Guru
  const [searchKbm, setSearchKbm] = useState('');
  const [statusFilterKbm, setStatusFilterKbm] = useState('Semua');

  // Filter state for Siswa Rekap
  const [santriList, setSantriList] = useState(storageService.getSantri ? storageService.getSantri(activeBranchId) : []);
  const [absensiList, setAbsensiList] = useState(storageService.getAbsensi ? storageService.getAbsensi(activeBranchId) : []);
  const [halaqahList, setHalaqahList] = useState(storageService.getHalaqah ? storageService.getHalaqah(activeBranchId) : []);
  const [searchSiswa, setSearchSiswa] = useState('');

  const reloadAllData = () => {
    setMonitoringData(storageService.getSigapMonitoring());
    if (storageService.getSantri) setSantriList(storageService.getSantri(activeBranchId));
    if (storageService.getAbsensi) setAbsensiList(storageService.getAbsensi(activeBranchId));
    if (storageService.getHalaqah) setHalaqahList(storageService.getHalaqah(activeBranchId));
  };

  useEffect(() => {
    const handleUpdate = () => {
      reloadAllData();
    };
    window.addEventListener('simtah_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('simtah_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activeBranchId]);

  // ==========================================
  // KBM GURU CALCULATIONS & FILTERING
  // ==========================================
  const filteredLiveFeed = useMemo(() => {
    const feed = monitoringData.liveFeed || [];
    return feed.filter(item => {
      // Filter tanggal jika ada
      if (dariTanggal && item.tanggal && item.tanggal < dariTanggal) return false;
      if (sampaiTanggal && item.tanggal && item.tanggal > sampaiTanggal) return false;

      // Filter status
      if (statusFilterKbm !== 'Semua') {
        if (statusFilterKbm === 'Hadir' && !(item.status === 'Tepat Waktu' || item.status === 'Sudah' || item.status === 'Terlambat')) return false;
        if (statusFilterKbm === 'Tepat Waktu' && item.status !== 'Tepat Waktu' && item.status !== 'Sudah') return false;
        if (statusFilterKbm === 'Terlambat' && item.status !== 'Terlambat') return false;
        if (statusFilterKbm === 'Izin' && !(item.status === 'Izin' || item.status === 'Sakit')) return false;
        if (statusFilterKbm === 'Alpa' && !(item.status === 'Alpa' || item.status === 'Alfa')) return false;
      }

      // Filter search
      if (searchKbm.trim()) {
        const q = searchKbm.toLowerCase();
        const nama = (item.nama || '').toLowerCase();
        const mapel = (item.mapel || '').toLowerCase();
        if (!nama.includes(q) && !mapel.includes(q)) return false;
      }

      return true;
    });
  }, [monitoringData.liveFeed, dariTanggal, sampaiTanggal, statusFilterKbm, searchKbm]);

  const kbmKpi = useMemo(() => {
    const feed = filteredLiveFeed;
    const total = feed.length;
    const tepatWaktu = feed.filter(f => f.status === 'Tepat Waktu' || f.status === 'Sudah').length;
    const terlambat = feed.filter(f => f.status === 'Terlambat').length;
    const izinSakit = feed.filter(f => f.status === 'Izin' || f.status === 'Sakit').length;
    const alpaKosong = feed.filter(f => f.status === 'Alpa' || f.status === 'Alfa').length;
    const persentaseHadir = total > 0 ? Math.round(((tepatWaktu + terlambat) / total) * 100) : 100;
    return { total, tepatWaktu, terlambat, izinSakit, alpaKosong, persentaseHadir };
  }, [filteredLiveFeed]);

  // Hitung rankings dinamis dari liveFeed
  const computedRankings = useMemo(() => {
    const feed = monitoringData.liveFeed || [];
    const alpaMap = {};
    const izinMap = {};
    const telatMap = {};

    feed.forEach(item => {
      const nama = item.nama || 'Pengampu';
      if (item.status === 'Alpa' || item.status === 'Alfa') {
        alpaMap[nama] = (alpaMap[nama] || 0) + 1;
      } else if (item.status === 'Izin' || item.status === 'Sakit') {
        izinMap[nama] = (izinMap[nama] || 0) + 1;
      } else if (item.status === 'Terlambat') {
        telatMap[nama] = (telatMap[nama] || 0) + 1;
      }
    });

    const toTopList = (map) => Object.entries(map)
      .map(([nama, jumlah]) => ({ nama, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);

    return {
      alpa: toTopList(alpaMap),
      izin: toTopList(izinMap),
      telat: toTopList(telatMap)
    };
  }, [monitoringData.liveFeed]);

  const handleLaporanWAKbm = () => {
    const text = `*Laporan KBM & Halaqoh MA Ihya As-Sunnah (%20${dariTanggal} s/d ${sampaiTanggal}):*%0A` +
      `- Total KBM: ${kbmKpi.total}%0A` +
      `- Tepat Waktu: ${kbmKpi.tepatWaktu}%0A` +
      `- Terlambat: ${kbmKpi.terlambat}%0A` +
      `- Izin / Sakit: ${kbmKpi.izinSakit}%0A` +
      `- Alpa: ${kbmKpi.alpaKosong}%0A` +
      `- Tingkat Kehadiran: ${kbmKpi.persentaseHadir}%%0A%0A` +
      `_Dibuat otomatis via SIMTAH / Tahfidz HUB._`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleExportDetailKbm = () => {
    const headers = ["Waktu", "Tanggal", "Nama Guru", "Mata Pelajaran", "Metode", "Status", "Keterangan"];
    const rows = filteredLiveFeed.map(f => [
      `"${f.jam || '-'}"`,
      `"${f.tanggal || '-'}"`,
      `"${f.nama || '-'}"`,
      `"${f.mapel || '-'}"`,
      `"${f.manual ? 'Manual' : 'QR Scan'}"`,
      `"${f.status || '-'}"`,
      `"${(f.keterangan || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Monitoring_KBM_MAIAS_${dariTanggal}_sd_${sampaiTanggal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Detail Monitoring KBM berhasil diekspor ke CSV!");
  };

  const handleModeDarurat = () => {
    if (window.confirm("Aktifkan Mode Darurat (Auto-Fill presensi KBM)? Seluruh pengampu yang belum tercatat akan terisi otomatis.")) {
      showToast && showToast("Mode Darurat aktif: Presensi terisi otomatis.");
    }
  };

  // ==========================================
  // SISWA REKAP CALCULATIONS & FILTERING
  // ==========================================

  const siswaRekapData = useMemo(() => {
    // Filter absensi by date range
    const filteredAbsensi = absensiList.filter(a => {
      if (!a.tanggal) return true;
      const tgl = typeof a.tanggal === 'string' ? a.tanggal.split('T')[0] : '';
      if (dariTanggal && tgl && tgl < dariTanggal) return false;
      if (sampaiTanggal && tgl && tgl > sampaiTanggal) return false;
      return true;
    });

    // Group absensi by santriId
    const santriAbsensiMap = {};
    filteredAbsensi.forEach(a => {
      const sId = a.santriId || a.santri_id;
      if (!sId) return;
      if (!santriAbsensiMap[sId]) {
        santriAbsensiMap[sId] = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
      }
      const st = (a.status || '').toLowerCase();
      if (st === 'hadir') santriAbsensiMap[sId].hadir += 1;
      else if (st === 'izin') santriAbsensiMap[sId].izin += 1;
      else if (st === 'sakit') santriAbsensiMap[sId].sakit += 1;
      else if (st === 'alpa' || st === 'alfa') santriAbsensiMap[sId].alpa += 1;
    });

    // Match with santri list
    return santriList
      .filter(s => {
        if (searchSiswa.trim()) {
          const q = searchSiswa.toLowerCase();
          const nama = (s.nama || '').toLowerCase();
          const nis = (s.nis || '').toLowerCase();
          if (!nama.includes(q) && !nis.includes(q)) return false;
        }
        return true;
      })
      .map(s => {
        const stats = santriAbsensiMap[s.id] || { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
        const total = stats.hadir + stats.izin + stats.sakit + stats.alpa;
        const persen = total > 0 ? Math.round((stats.hadir / total) * 100) : 100;
        const halaqahObj = halaqahList.find(h => h.id === s.halaqahId);
        return {
          ...s,
          stats,
          total,
          persen,
          halaqahNama: halaqahObj ? halaqahObj.nama : (s.halaqah || 'Halaqah Pusat')
        };
      });
  }, [santriList, absensiList, halaqahList, dariTanggal, sampaiTanggal, searchSiswa]);

  const siswaKpi = useMemo(() => {
    const totalSantri = siswaRekapData.length;
    let totalHadir = 0;
    let totalIzin = 0;
    let totalSakit = 0;
    let totalAlpa = 0;
    let sumPersen = 0;

    siswaRekapData.forEach(item => {
      totalHadir += item.stats.hadir;
      totalIzin += item.stats.izin;
      totalSakit += item.stats.sakit;
      totalAlpa += item.stats.alpa;
      sumPersen += item.persen;
    });

    const rataRata = totalSantri > 0 ? Math.round(sumPersen / totalSantri) : 100;
    return { totalSantri, totalHadir, totalIzin, totalSakit, totalAlpa, rataRata };
  }, [siswaRekapData]);

  const handleExportDetailSiswa = () => {
    const headers = ["No", "NIS", "Nama Santri", "Halaqah", "Hadir", "Izin", "Sakit", "Alpa", "% Kehadiran"];
    const rows = siswaRekapData.map((item, idx) => [
      idx + 1,
      `"${item.nis || '-'}"`,
      `"${item.nama || '-'}"`,
      `"${item.halaqahNama || '-'}"`,
      item.stats.hadir,
      item.stats.izin,
      item.stats.sakit,
      item.stats.alpa,
      `"${item.persen}%"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Presensi_Siswa_MAIAS_${dariTanggal}_sd_${sampaiTanggal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Rekap Kehadiran Santri berhasil diekspor ke CSV!");
  };

  const handleLaporanWASiswa = () => {
    const text = `*Laporan Rekap Presensi Santri MA Ihya As-Sunnah (${dariTanggal} s/d ${sampaiTanggal}):*%0A` +
      `- Total Santri Terdata: ${siswaKpi.totalSantri}%0A` +
      `- Total Kehadiran: ${siswaKpi.totalHadir}%0A` +
      `- Total Izin: ${siswaKpi.totalIzin}%0A` +
      `- Total Sakit: ${siswaKpi.totalSakit}%0A` +
      `- Total Alpa: ${siswaKpi.totalAlpa}%0A` +
      `- Rata-rata Kehadiran: ${siswaKpi.rataRata}%%0A%0A` +
      `_Dibuat otomatis via SIMTAH / Tahfidz HUB._`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER & SUB-TABS */}
      <div className="sigap-page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="#059669" />
            <h1 className="sigap-page-title">Monitoring & Rekapitulasi</h1>
          </div>
          <p className="sigap-page-subtitle">Pusat data kehadiran KBM (Guru/Ustadz) dan Santri/Siswa terpadu.</p>
        </div>
      </div>

      {/* Tabs: Monitoring KBM vs Presensi Siswa */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', gap: '20px' }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'kbm-guru' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            padding: '8px 4px 12px 4px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'kbm-guru' ? 800 : 600,
            color: activeSubTab === 'kbm-guru' ? '#0f766e' : '#64748b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={() => setActiveSubTab('kbm-guru')}
        >
          <Clock size={16} />
          <span>Monitoring KBM (Guru)</span>
        </button>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'siswa-rekap' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            padding: '8px 4px 12px 4px',
            fontSize: '13px',
            fontWeight: activeSubTab === 'siswa-rekap' ? 800 : 600,
            color: activeSubTab === 'siswa-rekap' ? '#0f766e' : '#64748b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={() => {
            setActiveSubTab('siswa-rekap');
            showToast && showToast("Beralih ke Rekapitulasi Presensi Siswa");
          }}
        >
          <GraduationCap size={16} />
          <span>Presensi Siswa (Rekap)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* KONTEN TAB 1: MONITORING KBM (GURU) */}
      {/* ========================================================================= */}
      {activeSubTab === 'kbm-guru' && (
        <>
          {/* 2. DATE FILTER & ACTION BUTTONS */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              alignItems: 'end'
            }}>
              {/* DARI TANGGAL & SAMPAI TANGGAL — SELALU 1 BARIS PAS LAYAR */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box'
              }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    DARI TANGGAL
                  </label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={dariTanggal}
                    onChange={(e) => setDariTanggal(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px 8px', width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: '10px' }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    SAMPAI TANGGAL
                  </label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={sampaiTanggal}
                    onChange={(e) => setSampaiTanggal(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px 8px', width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: '10px' }}
                  />
                </div>
              </div>

              {/* STATUS FILTER & CARI GURU / MAPEL */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                    STATUS FILTER
                  </label>
                  <select
                    className="form-select"
                    value={statusFilterKbm}
                    onChange={(e) => setStatusFilterKbm(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px 10px', width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: '10px', minHeight: '35px' }}
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Hadir">Semua Hadir</option>
                    <option value="Tepat Waktu">Tepat Waktu</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin / Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                    CARI GURU / MAPEL
                  </label>
                  <div style={{ position: 'relative', minWidth: 0 }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nama ustadz / mapel..."
                      value={searchKbm}
                      onChange={(e) => setSearchKbm(e.target.value)}
                      style={{ fontSize: '12px', padding: '6px 10px 6px 28px', width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: '10px', height: '35px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Tombol Aksi: Laporan WA, Export Detail, Rekap Guru */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <button 
                className="sigap-btn-green" 
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={handleLaporanWAKbm}
              >
                <Share2 size={15} />
                <span>Laporan WA</span>
              </button>

              <button 
                className="sigap-btn-blue" 
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={handleExportDetailKbm}
              >
                <Download size={15} />
                <span>Export Detail</span>
              </button>

              <button 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#9333ea',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  showToast && showToast(`Menampilkan ringkasan ${kbmKpi.total} data presensi guru.`);
                }}
              >
                <FileText size={15} />
                <span>Rekap ({kbmKpi.persentaseHadir}%)</span>
              </button>
            </div>
          </div>

          {/* 3. BARIS 5 KARTU KPI RINGKASAN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            {/* TOTAL KBM */}
            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">TOTAL LOG</div>
                <div className="sigap-kpi-val" style={{ color: '#2563eb' }}>{kbmKpi.total}</div>
              </div>
              <div className="sigap-kpi-icon-box blue" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
                <BookOpen size={18} />
              </div>
            </div>

            {/* HADIR TEPAT WAKTU */}
            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">HADIR (TEPAT WAKTU)</div>
                <div className="sigap-kpi-val" style={{ color: '#059669' }}>
                  {kbmKpi.tepatWaktu}
                </div>
              </div>
              <div className="sigap-kpi-icon-box green" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>

            {/* HADIR TERLAMBAT */}
            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">HADIR (TERLAMBAT)</div>
                <div className="sigap-kpi-val" style={{ color: '#c2410c' }}>
                  {kbmKpi.terlambat}
                </div>
              </div>
              <div className="sigap-kpi-icon-box orange" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c' }}>
                <Clock size={18} />
              </div>
            </div>

            {/* IZIN / SAKIT */}
            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">IZIN RESMI</div>
                <div className="sigap-kpi-val" style={{ color: '#2563eb' }}>
                  {kbmKpi.izinSakit}
                </div>
              </div>
              <div className="sigap-kpi-icon-box purple" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
                <FileText size={18} />
              </div>
            </div>

            {/* ALPA (LEWAT WAKTU) */}
            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">ALPA (LEWAT WAKTU)</div>
                <div className="sigap-kpi-val" style={{ color: '#dc2626' }}>
                  {kbmKpi.alpaKosong}
                </div>
              </div>
              <div className="sigap-kpi-icon-box red" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626' }}>
                <XCircle size={18} />
              </div>
            </div>
          </div>

          {/* 4. TIGA KOTAK PERINGKAT (ALPA, IZIN, TERLAMBAT) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {/* Kotak 1: Terbanyak Alpa */}
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#9f1239' }}>Terbanyak Alpa</span>
                <span style={{ fontSize: '10px', color: '#be123c', fontWeight: 700 }}>Top 5</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {computedRankings.alpa.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '18px 0', fontSize: '12px', color: '#fb7185', fontStyle: 'italic' }}>
                    Sangat Baik (Data Bersih)
                  </div>
                ) : (
                  computedRankings.alpa.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ fontWeight: 700, color: '#9f1239' }}>{idx + 1}. {item.nama}</span>
                      <span style={{
                        background: '#ffe4e6',
                        color: '#be123c',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {item.jumlah}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Kotak 2: Terbanyak Izin/Sakit */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e40af' }}>Terbanyak Izin/Sakit</span>
                <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Top 5</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {computedRankings.izin.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '18px 0', fontSize: '12px', color: '#60a5fa', fontStyle: 'italic' }}>
                    Tidak Ada Riwayat Izin
                  </div>
                ) : (
                  computedRankings.izin.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{idx + 1}. {item.nama}</span>
                      <span style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {item.jumlah}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Kotak 3: Sering Terlambat */}
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '14px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#9a3412' }}>Sering Terlambat</span>
                <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700 }}>Top 5</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {computedRankings.telat.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '18px 0', fontSize: '12px', color: '#fb923c', fontStyle: 'italic' }}>
                    Sangat Tepat Waktu
                  </div>
                ) : (
                  computedRankings.telat.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ fontWeight: 700, color: '#7c2d12' }}>{idx + 1}. {item.nama}</span>
                      <span style={{
                        background: '#ffedd5',
                        color: '#c2410c',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {item.jumlah}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 5. TABEL LIVE FEED KEHADIRAN GURU */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '14px 20px', 
              borderBottom: '1px solid #f1f5f9', 
              fontWeight: 800, 
              fontSize: '13px', 
              color: '#0f172a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <span>Log Kehadiran KBM & Halaqoh ({filteredLiveFeed.length} data)</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
                  Hadir: {kbmKpi.tepatWaktu + kbmKpi.terlambat}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6' }}></span>
                  Izin: {kbmKpi.izinSakit}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }}></span>
                  Alpa: {kbmKpi.alpaKosong}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredLiveFeed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '13px' }}>
                  Tidak ada catatan presensi pengampu untuk filter tanggal dan kriteria yang dipilih.
                </div>
              ) : (
                filteredLiveFeed.map((item, index) => (
                  <div 
                    key={item.id || index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      borderBottom: index < filteredLiveFeed.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'center', width: '75px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                          {item.jam && item.jam !== '-' ? `${item.jam} WIB` : '-'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.tanggal || '-'}</div>
                      </div>

                      <div>
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                          {item.nama}
                        </div>
                        <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                          {item.mapel || 'Tahfidz'} • <span style={{ color: '#64748b' }}>{item.sesi || 'Halaqah'}</span>
                        </div>
                        {item.keterangan && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: (item.status === 'Alpa' || item.status === 'Alfa') ? '#dc2626' : item.status === 'Terlambat' ? '#c2410c' : item.status === 'Tepat Waktu' ? '#059669' : '#1d4ed8', 
                            fontWeight: 600, 
                            marginTop: '2px' 
                          }}>
                            {item.keterangan}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.manual && (
                        <span style={{
                          border: '1px solid #fed7aa',
                          background: '#fff7ed',
                          color: '#ea580c',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          Manual
                        </span>
                      )}

                      {(item.status === 'Tepat Waktu' || item.status === 'Sudah') && (
                        <span className="badge-status-ontime">
                          ✓ Hadir
                        </span>
                      )}

                      {item.status === 'Terlambat' && (
                        <span className="badge-status-late">
                          ⚠️ Hadir (Telat {item.selisihMenit || 5}m)
                        </span>
                      )}

                      {item.status === 'Izin' && (
                        <span className="badge-status-izin">
                          📋 Izin
                        </span>
                      )}

                      {item.status === 'Sakit' && (
                        <span className="badge-status-sakit">
                          🏥 Izin (Sakit)
                        </span>
                      )}

                      {item.status === 'Belum Absen' && (
                        <span className="badge-status-pending">
                          ○ Belum Absen
                        </span>
                      )}

                      {(item.status === 'Alpa' || item.status === 'Alfa') && (
                        <span className="badge-status-alpa">
                          ✗ Alpa
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* KONTEN TAB 2: REKAPITULASI PRESENSI SISWA */}
      {/* ========================================================================= */}
      {activeSubTab === 'siswa-rekap' && (
        <>
          {/* 2. DATE & CLASS FILTER BARIS SISWA */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              alignItems: 'end'
            }}>
              {/* DARI TANGGAL & SAMPAI TANGGAL — SELALU 1 BARIS PAS LAYAR */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box'
              }}>
                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    DARI TANGGAL
                  </label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={dariTanggal}
                    onChange={(e) => setDariTanggal(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px 8px', width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: '10px' }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    SAMPAI TANGGAL
                  </label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={sampaiTanggal}
                    onChange={(e) => setSampaiTanggal(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px 8px', width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: '10px' }}
                  />
                </div>
              </div>

              {/* CARI SANTRI */}
              <div style={{ minWidth: 0 }}>
                <label style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                  CARI SANTRI (NAMA / NIS)
                </label>
                <div style={{ position: 'relative', minWidth: 0 }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nama santri atau NIS..."
                    value={searchSiswa}
                    onChange={(e) => setSearchSiswa(e.target.value)}
                    style={{ fontSize: '12px', padding: '6px 10px 6px 28px', width: '100%', minWidth: 0, boxSizing: 'border-box', borderRadius: '10px', height: '35px' }}
                  />
                </div>
              </div>
            </div>

            {/* Tombol Aksi Siswa */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <button 
                className="sigap-btn-green" 
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={handleLaporanWASiswa}
              >
                <Share2 size={15} />
                <span>Laporan WA Siswa</span>
              </button>

              <button 
                className="sigap-btn-blue" 
                style={{ justifyContent: 'center', padding: '10px' }}
                onClick={handleExportDetailSiswa}
              >
                <Download size={15} />
                <span>Export CSV Siswa</span>
              </button>
            </div>
          </div>

          {/* 3. BARIS 5 KARTU KPI SISWA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">TOTAL SANTRI</div>
                <div className="sigap-kpi-val" style={{ color: '#2563eb' }}>{siswaKpi.totalSantri}</div>
              </div>
              <div className="sigap-kpi-icon-box blue" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
                <Users size={18} />
              </div>
            </div>

            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">TOTAL HADIR</div>
                <div className="sigap-kpi-val" style={{ color: '#059669' }}>{siswaKpi.totalHadir}</div>
              </div>
              <div className="sigap-kpi-icon-box green" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>

            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">IZIN</div>
                <div className="sigap-kpi-val" style={{ color: '#2563eb' }}>{siswaKpi.totalIzin}</div>
              </div>
              <div className="sigap-kpi-icon-box purple" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
                <FileText size={18} />
              </div>
            </div>

            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">SAKIT</div>
                <div className="sigap-kpi-val" style={{ color: '#c2410c' }}>{siswaKpi.totalSakit}</div>
              </div>
              <div className="sigap-kpi-icon-box orange" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c' }}>
                <Clock size={18} />
              </div>
            </div>

            <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
              <div>
                <div className="sigap-kpi-label">ALPA</div>
                <div className="sigap-kpi-val" style={{ color: '#dc2626' }}>{siswaKpi.totalAlpa}</div>
              </div>
              <div className="sigap-kpi-icon-box red" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626' }}>
                <XCircle size={18} />
              </div>
            </div>
          </div>

          {/* 4. TABEL REKAPITULASI PRESENSI SANTRI */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '14px 20px', 
              borderBottom: '1px solid #f1f5f9', 
              fontWeight: 800, 
              fontSize: '13px', 
              color: '#0f172a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Rincian Rekap Presensi Santri ({siswaRekapData.length} siswa)</span>
              <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 800 }}>
                Rata-rata Kehadiran: {siswaKpi.rataRata}%
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', width: '40px' }}>No</th>
                    <th style={{ padding: '10px 14px', width: '100px' }}>NIS</th>
                    <th style={{ padding: '10px 14px' }}>Nama Santri</th>
                    <th style={{ padding: '10px 14px' }}>Halaqah</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '60px' }}>H</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '60px' }}>I</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '60px' }}>S</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '60px' }}>A</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '110px' }}>% Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaRekapData.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                        Tidak ada data santri yang cocok dengan filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    siswaRekapData.map((s, idx) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, fontFamily: 'monospace' }}>{s.nis || '-'}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{s.nama}</td>
                        <td style={{ padding: '10px 14px', color: '#0d9488', fontWeight: 600 }}>{s.halaqahNama}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>{s.stats.hadir}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>{s.stats.izin}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#ea580c' }}>{s.stats.sakit}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#dc2626' }}>{s.stats.alpa}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: s.persen >= 85 ? '#ecfdf5' : s.persen >= 70 ? '#fff7ed' : '#fee2e2',
                            color: s.persen >= 85 ? '#059669' : s.persen >= 70 ? '#ea580c' : '#dc2626'
                          }}>
                            {s.persen}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
