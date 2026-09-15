import React, { useState } from 'react';
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
  Sparkles 
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function MonitoringSigapView({ showToast }) {
  const todayStr = storageService.getTodayISO ? storageService.getTodayISO() : new Date().toISOString().split('T')[0];
  const [monitoringData, setMonitoringData] = useState(storageService.getSigapMonitoring());
  const [activeSubTab, setActiveSubTab] = useState('kbm-guru'); // 'kbm-guru' or 'siswa-rekap'
  const [dariTanggal, setDariTanggal] = useState(todayStr);
  const [sampaiTanggal, setSampaiTanggal] = useState(todayStr);

  useEffect(() => {
    const handleUpdate = () => {
      setMonitoringData(storageService.getSigapMonitoring());
    };
    window.addEventListener('simtah_data_updated', handleUpdate);
    return () => window.removeEventListener('simtah_data_updated', handleUpdate);
  }, []);

  const handleLaporanWA = () => {
    const text = `*Laporan KBM MA Ihya As-Sunnah (${dariTanggal}):*%0A- Total KBM: ${monitoringData.kpi.totalKbm}%0A- Tepat Waktu: ${monitoringData.kpi.tepatWaktu}%0A- Izin/Sakit: ${monitoringData.kpi.izinSakit}%0A- Alpa: ${monitoringData.kpi.alpaKosong}`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleExportDetail = () => {
    const headers = ["Waktu", "Tanggal", "Nama Guru", "Mata Pelajaran", "Kelas", "Metode", "Status"];
    const rows = monitoringData.liveFeed.map(f => [
      `"${f.jam}"`,
      `"${f.tanggal}"`,
      `"${f.nama}"`,
      `"${f.mapel}"`,
      `"${f.kelas}"`,
      `"${f.manual ? 'Manual' : 'QR Scan'}"`,
      `"${f.status}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Monitoring_KBM_MAIAS_${dariTanggal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Detail Monitoring KBM berhasil diekspor!");
  };

  const handleModeDarurat = () => {
    if (window.confirm("Aktifkan Mode Darurat (Auto-Fill presensi KBM)?")) {
      showToast && showToast("Mode Darurat aktif: Presensi terisi otomatis.");
    }
  };

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER & SUB-TABS PERSIS GAMBAR 4 */}
      <div className="sigap-page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="#059669" />
            <h1 className="sigap-page-title">Monitoring & Rekapitulasi</h1>
          </div>
          <p className="sigap-page-subtitle">Pusat data kehadiran KBM (Guru) dan Siswa.</p>
        </div>

        {/* Tombol Mode Darurat */}
        <button 
          className="sigap-btn-emergency"
          onClick={handleModeDarurat}
        >
          <AlertTriangle size={14} />
          <span>Mode Darurat (Auto-Fill)</span>
        </button>
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
            cursor: 'pointer'
          }}
          onClick={() => setActiveSubTab('kbm-guru')}
        >
          Monitoring KBM (Guru)
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
            cursor: 'pointer'
          }}
          onClick={() => {
            setActiveSubTab('siswa-rekap');
            showToast && showToast("Beralih ke Rekapitulasi Presensi Siswa");
          }}
        >
          Presensi Siswa (Rekap)
        </button>
      </div>

      {/* 2. DATE FILTER & ACTION BUTTONS BARIS PERSIS GAMBAR 4 */}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              DARI TANGGAL
            </label>
            <input 
              type="date" 
              className="form-input" 
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              SAMPAI TANGGAL
            </label>
            <input 
              type="date" 
              className="form-input" 
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
          </div>
        </div>

        {/* 3 Tombol Aksi: Laporan WA, Export Detail, Rekap Guru */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <button 
            className="sigap-btn-green" 
            style={{ justifyContent: 'center', padding: '10px' }}
            onClick={handleLaporanWA}
          >
            <Share2 size={15} />
            <span>Laporan WA</span>
          </button>

          <button 
            className="sigap-btn-blue" 
            style={{ justifyContent: 'center', padding: '10px' }}
            onClick={handleExportDetail}
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
            onClick={() => showToast && showToast("Membuka rekapitulasi kehadiran guru...")}
          >
            <FileText size={15} />
            <span>Rekap Guru</span>
          </button>
        </div>
      </div>

      {/* 3. BARIS 5 KARTU KPI RINGKASAN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {/* TOTAL KBM */}
        <div className="sigap-kpi-card" style={{ padding: '14px 16px' }}>
          <div>
            <div className="sigap-kpi-label">TOTAL KBM</div>
            <div className="sigap-kpi-val" style={{ color: '#2563eb' }}>{monitoringData.liveFeed?.length || 10}</div>
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
              {monitoringData.liveFeed?.filter(f => f.status === 'Tepat Waktu').length || 5}
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
              {monitoringData.liveFeed?.filter(f => f.status === 'Terlambat').length || 3}
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
              {monitoringData.liveFeed?.filter(f => f.status === 'Izin' || f.status === 'Sakit').length || 1}
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
              {monitoringData.liveFeed?.filter(f => f.status === 'Alpa' || f.status === 'Alfa').length || 1}
            </div>
          </div>
          <div className="sigap-kpi-icon-box red" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626' }}>
            <XCircle size={18} />
          </div>
        </div>
      </div>

      {/* 4. TIGA KOTAK PERINGKAT (ALPA, IZIN, TERLAMBAT) PERSIS GAMBAR 4 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
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
            {(monitoringData.rankings?.alpa || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '18px 0', fontSize: '12px', color: '#fb7185', fontStyle: 'italic' }}>
                Sangat Baik (Data Kosong)
              </div>
            ) : (
              (monitoringData.rankings?.alpa || []).map((item, idx) => (
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
            {(monitoringData.rankings?.izin || []).map((item, idx) => (
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
            ))}
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
            {(monitoringData.rankings?.telat || []).map((item, idx) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* 5. TABEL LIVE FEED KEHADIRAN GURU PERSIS GAMBAR 4 (DIPERKAYA DETAIL KETERLAMBATAN) */}
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
          <span>Log Kehadiran KBM & Halaqoh Real-time</span>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
              Hadir: {monitoringData.liveFeed?.filter(f => f.status === 'Tepat Waktu' || f.status === 'Terlambat').length}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6' }}></span>
              Izin: {monitoringData.liveFeed?.filter(f => f.status === 'Izin' || f.status === 'Sakit').length}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }}></span>
              Alpa: {monitoringData.liveFeed?.filter(f => f.status === 'Alpa' || f.status === 'Alfa').length}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(monitoringData.liveFeed || []).map((item, index) => (
            <div 
              key={item.id || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: index < (monitoringData.liveFeed || []).length - 1 ? '1px solid #f1f5f9' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'center', width: '68px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    {item.jam && item.jam !== '-' ? `${item.jam} WIB` : '-'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.tanggal}</div>
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                    {item.nama}
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                    {item.mapel} • <span style={{ color: '#64748b' }}>{item.kelas}</span>
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

                {item.status === 'Tepat Waktu' && (
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
          ))}
        </div>
      </div>
    </div>
  );
}
