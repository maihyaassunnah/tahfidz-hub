import React, { useState } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  MapPin, 
  ArrowRight, 
  Trophy, 
  BookOpen, 
  Crown, 
  Check, 
  Sparkles,
  Shield,
  HeartHandshake,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { storageService, SESI_HALAQAH } from '../services/storage';

export default function DashboardView({ 
  santriList, 
  halaqahList, 
  setoranList, 
  absensiList, 
  currentRole, 
  setActiveTab, 
  onSelectSantri 
}) {
  const [timeFilter, setTimeFilter] = useState('bulan-ini');
  const [sortOrder, setSortOrder] = useState('total-halaman');
  const [showSuperAdminAddSiswa, setShowSuperAdminAddSiswa] = useState(false);
  const [newSiswaData, setNewSiswaData] = useState({
    nama: '',
    nis: '',
    kelas: 'X Tahfidz 1',
    halaqahId: halaqahList[0]?.id || 'h-wahyudin',
    targetJuz: 10,
    namaWali: '',
    kontakWali: ''
  });

  // Ambil jadwal halaqoh secara dinamis dari Super Admin
  const jadwalHalaqoh = storageService.getJadwalHalaqoh();
  const rawSesiList = jadwalHalaqoh?.sesiList || [];

  // Deteksi Hari Ini & Status Presensi Pengampu
  const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayIndo = dayNames[new Date().getDay()];
  const todayISO = new Date().toISOString().split('T')[0];

  const dynamicSesiList = rawSesiList.map(sesi => {
    const isMasukHariIni = jadwalHalaqoh?.hariAktif?.[todayIndo]?.[sesi.id] !== false;
    const presensi = storageService.isPengampuSudahScan('Wahyudin Hafiz, S.Pd', sesi.id, todayISO);

    return {
      ...sesi,
      isMasukHariIni,
      isLibur: !isMasukHariIni || sesi.aktif === false,
      sudahScan: presensi.sudah,
      jamScan: presensi.jamScan,
      statusLabel: presensi.sudah ? 'Sudah' : (!isMasukHariIni ? 'LIBUR' : 'Belum')
    };
  });

  // Total santri di halaqah Wahyudin (10 santri sesuai screenshot)
  const halaqahSantri = santriList.filter(s => s.halaqahId === 'h-wahyudin');
  const totalDaftarSantri = halaqahSantri.length || 10;
  const totalRiwayatSetoran = storageService.getTotalSetoranCount();

  // 3 Santri Teratas untuk Podium (Jamiatul Akbar, Attalah Saum Alvano, M. Al Futra)
  const rank1 = halaqahSantri.find(s => s.id === 's-akbar') || halaqahSantri[0] || {};
  const rank2 = halaqahSantri.find(s => s.id === 's-attalah') || halaqahSantri[1] || {};
  const rank3 = halaqahSantri.find(s => s.id === 's-futra') || halaqahSantri[2] || {};

  // Tampilan Khusus Orang Tua / Wali Santri
  if (currentRole === 'orangtua') {
    const ananda = rank1; // Default memantau Jamiatul Akbar
    return (
      <div className="page-content-wrapper">
        {/* Banner Wali Santri */}
        <div className="halaqah-green-banner" style={{ background: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)' }}>
          <div className="banner-sub">PORTAL WALI SANTRI</div>
          <h1 className="banner-title">Ahlan Wa Sahlan, Ayah/Bunda</h1>
          <div className="banner-location">
            <HeartHandshake size={18} />
            <span>Memantau Perkembangan Tahfidz Ananda <strong>{ananda.nama}</strong></span>
          </div>
          <div className="banner-watermark-quran">
            <BookOpen size={170} />
          </div>
        </div>

        {/* Ringkasan Capaian Ananda */}
        <div className="kpi-row-screenshot">
          <div className="kpi-card-white" onClick={() => setActiveTab('santri')}>
            <div className="kpi-left">
              <div className="kpi-circle-icon green">
                <Crown size={22} />
              </div>
              <div className="kpi-number">Juara 1</div>
              <div className="kpi-label">Peringkat Halaqah Bulan Ini ({ananda.rincianHalaman})</div>
            </div>
            <ArrowRight size={18} className="kpi-arrow" />
          </div>

          <div className="kpi-card-white" onClick={() => setActiveTab('setoran')}>
            <div className="kpi-left">
              <div className="kpi-circle-icon purple">
                <ClipboardCheck size={22} />
              </div>
              <div className="kpi-number">{ananda.juzMutqin?.length || 8} Juz</div>
              <div className="kpi-label">Capaian Juz Mutqin Lulus Tasmi'</div>
            </div>
            <ArrowRight size={18} className="kpi-arrow" />
          </div>
        </div>

        {/* Status Presensi Hari Ini & Quick Permohonan Izin */}
        <div className="sesi-card-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="sesi-header-title">Status Presensi & Kehadiran Ananda</div>
              <div className="sesi-header-sub">Sesi Halaqah Ustadz Wahyudin Hafiz Hari Ini</div>
            </div>
            <button className="btn btn-primary" onClick={() => setActiveTab('izin')}>
              + Ajukan Permohonan Izin
            </button>
          </div>

          <div className="sesi-chips-row" style={{ marginTop: '12px' }}>
            <div className="sesi-chip active-green">
              <span className="sesi-badge-status green">✓ TEPAT WAKTU</span>
              <div className="sesi-name">Ba'da Subuh</div>
              <div className="sesi-sub-info">Hadir (05:18:22)</div>
            </div>
            <div className="sesi-chip libur-pink">
              <span className="sesi-badge-status pink">LIBUR</span>
              <div className="sesi-name">Ba'da Maghrib</div>
              <div className="sesi-sub-info">18:45 - 19:20</div>
            </div>
          </div>
        </div>

        {/* Podium Halaqah Preview */}
        <div className="podium-card-container">
          <div className="podium-header-row">
            <div className="podium-title-group">
              <div className="trophy-badge">
                <Trophy size={20} />
              </div>
              <div>
                <div className="podium-main-title">Peringkat Setoran Halaqah</div>
                <div className="podium-sub-title">Halaqah Ustadz Wahyudin Hafiz</div>
              </div>
            </div>
          </div>

          <div className="podium-grid-3">
            {/* Rank 2 */}
            <div className="podium-box">
              <div className="badge-rank-circle silver">2</div>
              <div className="podium-student-name">{rank2.nama}</div>
              <div className="podium-score-hlm">13.6 <span>Hlm</span></div>
              <div className="podium-sub-brs">13 Hlm 9 Brs</div>
            </div>

            {/* Rank 1 */}
            <div className="podium-box rank-1">
              <div className="badge-terbanyak-crown">
                <Crown size={12} /> TERBANYAK
              </div>
              <div className="podium-student-name">{rank1.nama} (Ananda)</div>
              <div className="podium-score-hlm">14.5 <span>Hlm</span></div>
              <div className="podium-sub-brs">14 Hlm 8 Brs</div>
            </div>

            {/* Rank 3 */}
            <div className="podium-box">
              <div className="badge-rank-circle bronze">3</div>
              <div className="podium-student-name">{rank3.nama}</div>
              <div className="podium-score-hlm">12.9 <span>Hlm</span></div>
              <div className="podium-sub-brs">12 Hlm 13 Brs</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Super Admin
  if (currentRole === 'superadmin') {
    const izinList = storageService.getIzin();
    const izinMenunggu = izinList.filter(i => i.status === 'Menunggu').length;

    return (
      <div className="page-content-wrapper">
        {/* Banner Super Admin */}
        <div className="halaqah-green-banner" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="banner-sub" style={{ color: '#a7f3d0' }}>PUSAT KENDALI ADMINISTRATOR</div>
            <h1 className="banner-title">Super Admin Pesantren (PPIAS)</h1>
            <div className="banner-location" style={{ marginBottom: '18px' }}>
              <Shield size={18} />
              <span>Manajemen Terpusat: <strong>{halaqahList.length} Halaqah</strong> • <strong>{santriList.length} Santri</strong> • <strong>{totalRiwayatSetoran} Setoran</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="btn" 
                style={{ background: '#ffffff', color: '#064e3b', fontWeight: 800 }}
                onClick={() => setActiveTab('pengaturan')}
              >
                ⚙️ Menu Pengaturan Admin
              </button>
              <button 
                className="btn" 
                style={{ background: '#f59e0b', color: '#ffffff', fontWeight: 800 }}
                onClick={() => setShowSuperAdminAddSiswa(true)}
              >
                + Masukkan Siswa Baru
              </button>
              <button 
                className="btn" 
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                onClick={() => setActiveTab('pengaturan')}
              >
                👤 Atur Akun Pengampu
              </button>
              <button 
                className="btn" 
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                onClick={() => setActiveTab('pengaturan')}
              >
                ⏰ Atur Jadwal Sesi
              </button>
            </div>
          </div>

          <div className="banner-watermark-quran">
            <BookOpen size={180} />
          </div>
        </div>

        {/* Global KPI 4 Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          <div className="kpi-card-white" onClick={() => setActiveTab('santri')}>
            <div className="kpi-left">
              <div className="kpi-circle-icon green">
                <Users size={22} />
              </div>
              <div className="kpi-number">{santriList.length}</div>
              <div className="kpi-label">Total Santri Terdaftar</div>
            </div>
            <ArrowRight size={18} className="kpi-arrow" />
          </div>

          <div className="kpi-card-white" onClick={() => setActiveTab('pengaturan')}>
            <div className="kpi-left">
              <div className="kpi-circle-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Shield size={22} />
              </div>
              <div className="kpi-number">{halaqahList.length}</div>
              <div className="kpi-label">Kelompok Halaqah Aktif</div>
            </div>
            <ArrowRight size={18} className="kpi-arrow" />
          </div>

          <div className="kpi-card-white" onClick={() => setActiveTab('setoran')}>
            <div className="kpi-left">
              <div className="kpi-circle-icon purple">
                <ClipboardCheck size={22} />
              </div>
              <div className="kpi-number">{totalRiwayatSetoran}</div>
              <div className="kpi-label">Riwayat Setoran Tercatat</div>
            </div>
            <ArrowRight size={18} className="kpi-arrow" />
          </div>

          <div className="kpi-card-white" onClick={() => setActiveTab('izin')}>
            <div className="kpi-left">
              <div className="kpi-circle-icon" style={{ background: '#fee2e2', color: '#e11d48' }}>
                <Clock size={22} />
              </div>
              <div className="kpi-number">{izinMenunggu}</div>
              <div className="kpi-label">Izin Menunggu Verifikasi</div>
            </div>
            <ArrowRight size={18} className="kpi-arrow" />
          </div>
        </div>

        {/* Quick Admin Navigation Shortcuts */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="sesi-header-title" style={{ marginBottom: '14px' }}>
            Menu Pintas Administrasi Pesantren
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveTab('pengaturan')}
            >
              🏛️ <div><strong>Identitas Lembaga</strong><div style={{ fontSize: '0.72rem', color: '#64748b' }}>Kop rapor, mudir, semester</div></div>
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveTab('pengaturan')}
            >
              👨‍🏫 <div><strong>Ustadz & Halaqah</strong><div style={{ fontSize: '0.72rem', color: '#64748b' }}>Tambah & edit musyrif</div></div>
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveTab('pengaturan')}
            >
              ⏰ <div><strong>Jadwal Sesi Scan</strong><div style={{ fontSize: '0.72rem', color: '#64748b' }}>Subuh & Maghrib</div></div>
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => setActiveTab('pengaturan')}
            >
              💾 <div><strong>Cadangan Database</strong><div style={{ fontSize: '0.72rem', color: '#64748b' }}>Backup & restore JSON</div></div>
            </button>
          </div>
        </div>

        {/* Daftar Seluruh Halaqah Bimbingan */}
        <div className="sesi-card-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div className="sesi-header-title">Daftar Halaqah Bimbingan PPIAS</div>
              <div className="sesi-header-sub">Pantau asatidzah pembimbing dan status sesi harian</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('pengaturan')}>
              + Kelola di Pengaturan Admin
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {halaqahList.map(h => {
              const count = santriList.filter(s => s.halaqahId === h.id).length;
              return (
                <div key={h.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.95rem' }}>{h.nama}</div>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                      {count || 10} Santri
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0' }}>Musyrif: <strong>{h.musyrif}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {h.lokasi || "Masjid Tahfiz Ikhwan PPIAS"}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Cepat Pendaftaran Siswa oleh Super Admin */}
        {showSuperAdminAddSiswa && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ margin: 0, fontWeight: 800 }}>Pendaftaran Siswa Baru (Super Admin)</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSuperAdminAddSiswa(false)}>✕</button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newSiswaData.nama || !newSiswaData.nis) {
                  alert("Nama dan NIS wajib diisi!");
                  return;
                }
                storageService.addSantri(newSiswaData);
                setShowSuperAdminAddSiswa(false);
                setNewSiswaData({
                  nama: '',
                  nis: '',
                  kelas: 'X Tahfidz 1',
                  halaqahId: halaqahList[0]?.id || 'h-wahyudin',
                  targetJuz: 10,
                  namaWali: '',
                  kontakWali: ''
                });
                alert("Siswa baru berhasil didaftarkan dan ditugaskan ke halaqah!");
                window.location.reload();
              }}>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nama Lengkap Siswa/Santri *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Contoh: Muhammad Raihan Pratama"
                        value={newSiswaData.nama}
                        onChange={(e) => setNewSiswaData({ ...newSiswaData, nama: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nomor Induk Santri (NIS) *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Contoh: 202611"
                        value={newSiswaData.nis}
                        onChange={(e) => setNewSiswaData({ ...newSiswaData, nis: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Kelas</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={newSiswaData.kelas}
                        onChange={(e) => setNewSiswaData({ ...newSiswaData, kelas: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tugaskan ke Halaqah Bimbingan *</label>
                      <select 
                        className="form-select"
                        value={newSiswaData.halaqahId}
                        onChange={(e) => setNewSiswaData({ ...newSiswaData, halaqahId: e.target.value })}
                      >
                        {halaqahList.map(h => (
                          <option key={h.id} value={h.id}>{h.nama} ({h.musyrif})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Hafalan Semester (Juz)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30" 
                      className="form-input" 
                      value={newSiswaData.targetJuz}
                      onChange={(e) => setNewSiswaData({ ...newSiswaData, targetJuz: parseInt(e.target.value) || 10 })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nama Orang Tua / Wali</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Nama Wali"
                        value={newSiswaData.namaWali}
                        onChange={(e) => setNewSiswaData({ ...newSiswaData, namaWali: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">No WhatsApp Wali</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="08xxxxxxxxxx"
                        value={newSiswaData.kontakWali}
                        onChange={(e) => setNewSiswaData({ ...newSiswaData, kontakWali: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowSuperAdminAddSiswa(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan & Daftarkan Siswa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: PENGAMPU (USTADZ WAHYUDIN HAFIZ)
  // PERSIS 100% SEPERTI SCREENSHOT USER!
  return (
    <div className="page-content-wrapper">
      {/* 1. GREEN BANNER HALAQAH */}
      <div className="halaqah-green-banner">
        <div className="banner-sub">HALAQAH USTADZ</div>
        <h1 className="banner-title">Wahyudin Hafiz</h1>
        <div className="banner-location">
          <MapPin size={18} />
          <span>Masjid Tahfiz Ikhwan PPIAS</span>
        </div>
        
        {/* Quran Book Watermark Illustration */}
        <div className="banner-watermark-quran">
          <BookOpen size={165} strokeWidth={1.2} />
        </div>
      </div>

      {/* 2. KPI SUMMARY CARDS (10 DAFTAR SANTRI & 386 RIWAYAT SETORAN) */}
      <div className="kpi-row-screenshot">
        {/* Card 1: 10 Daftar Santri */}
        <div className="kpi-card-white" onClick={() => setActiveTab('santri')}>
          <div className="kpi-left">
            <div className="kpi-circle-icon green">
              <Users size={22} />
            </div>
            <div className="kpi-number">{totalDaftarSantri}</div>
            <div className="kpi-label">Daftar Santri</div>
          </div>
          <ArrowRight size={18} className="kpi-arrow" />
        </div>

        {/* Card 2: 386 Riwayat Setoran */}
        <div className="kpi-card-white" onClick={() => setActiveTab('setoran')}>
          <div className="kpi-left">
            <div className="kpi-circle-icon purple">
              <ClipboardCheck size={22} />
            </div>
            <div className="kpi-number">{totalRiwayatSetoran}</div>
            <div className="kpi-label">Riwayat Setoran</div>
          </div>
          <ArrowRight size={18} className="kpi-arrow" />
        </div>
      </div>

      {/* 3. JADWAL SESI HARI INI (Dinamis dari Pengaturan Admin) */}
      <div className="sesi-card-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="sesi-header-title">Jadwal Sesi Hari Ini</div>
            <div className="sesi-header-sub">Alur sesi halaqah presensi ({dynamicSesiList.length} sesi terdaftar)</div>
          </div>
          {currentRole === 'superadmin' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('pengaturan')}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px' }}
            >
              ⚙️ Atur Jadwal
            </button>
          )}
        </div>

        <div className="sesi-chips-row" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', marginTop: '10px' }}>
          {dynamicSesiList && dynamicSesiList.length > 0 ? (
            dynamicSesiList.map((sesi) => {
              const isLibur = sesi.isLibur;
              const isSudah = sesi.sudahScan;

              return (
                <div 
                  key={sesi.id} 
                  className={`sesi-chip ${isLibur ? 'libur-pink' : isSudah ? 'active-green' : 'belum-amber'}`}
                  onClick={() => {
                    if (!isLibur) {
                      sessionStorage.setItem('simtah_selected_scan_sesi', sesi.nama);
                      setActiveTab('scan');
                    }
                  }}
                  style={{ cursor: isLibur ? 'default' : 'pointer', minWidth: '155px' }}
                  title={isLibur ? 'Sesi ini libur' : isSudah ? `Sudah presensi pukul ${sesi.jamScan} WIB` : 'Belum presensi. Klik untuk buka kamera scan QR!'}
                >
                  <span className={`sesi-badge-status ${isLibur ? 'pink' : isSudah ? 'green' : 'amber'}`}>
                    {isLibur ? 'LIBUR' : isSudah ? '✓ Sudah' : '○ Belum'}
                  </span>
                  <div className="sesi-name">{sesi.nama}</div>
                  <div className="sesi-sub-info">
                    {isLibur 
                      ? `${sesi.mulai} - ${sesi.selesai} • Libur` 
                      : isSudah 
                        ? `Scan: ${sesi.jamScan} WIB` 
                        : `${sesi.mulai} - ${sesi.selesai}`}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sesi-chip belum-amber" onClick={() => setActiveTab('scan')} style={{ cursor: 'pointer' }}>
              <span className="sesi-badge-status amber">○ Belum</span>
              <div className="sesi-name">Ba'da Subuh</div>
              <div className="sesi-sub-info">05:00 - 06:30</div>
            </div>
          )}
        </div>
      </div>

      {/* 4. PERINGKAT SETORAN HALAQAH (SEBARIS & RINGKAS) */}
      <div className="podium-card-container">
        {/* Header with Title and Filter controls */}
        <div className="podium-header-row">
          <div className="podium-title-group">
            <div className="trophy-badge">
              <Trophy size={18} />
            </div>
            <div>
              <div className="podium-main-title">Peringkat Setoran Halaqah</div>
              <div className="podium-sub-title">Halaqah Ustadz Wahyudin Hafiz</div>
            </div>
          </div>

          {/* Right Filter Pills and Sort Select */}
          <div className="podium-filters">
            <div className="time-filter-pill-group">
              <button 
                className={`time-filter-btn ${timeFilter === 'bulan-ini' ? 'active' : ''}`}
                onClick={() => setTimeFilter('bulan-ini')}
              >
                Bulan Ini
              </button>
              <button 
                className={`time-filter-btn ${timeFilter === 'pekan-ini' ? 'active' : ''}`}
                onClick={() => setTimeFilter('pekan-ini')}
              >
                Pekan Ini
              </button>
              <button 
                className={`time-filter-btn ${timeFilter === 'hari-ini' ? 'active' : ''}`}
                onClick={() => setTimeFilter('hari-ini')}
              >
                Hari Ini
              </button>
              <button 
                className={`time-filter-btn ${timeFilter === 'semua-waktu' ? 'active' : ''}`}
                onClick={() => setTimeFilter('semua-waktu')}
              >
                Semua
              </button>
            </div>

            <select 
              className="podium-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="total-halaman">Urut: Halaman</option>
              <option value="total-setoran">Urut: Frekuensi</option>
              <option value="juz-mutqin">Urut: Mutqin</option>
            </select>
          </div>
        </div>

        {/* 3 Podium Columns (SEBARIS SAJA: Juara 2 - Juara 1 - Juara 3) */}
        <div className="podium-grid-3">
          {/* JUARA 2: Attalah Saum Alvano (Left) */}
          <div 
            className="podium-box" 
            onClick={() => { onSelectSantri(rank2.id); setActiveTab('santri'); }}
            style={{ cursor: 'pointer' }}
            title="Klik untuk lihat detail santri"
          >
            <div className="badge-rank-circle silver">2</div>
            <div className="podium-student-name">{rank2.nama || "Attalah Saum Alvano"}</div>
            <div className="podium-score-hlm">
              {rank2.totalHalaman || 13.6} <span>Hlm</span>
            </div>
            <div className="podium-sub-brs">{rank2.rincianHalaman || "13 Hlm 9 Brs"}</div>
          </div>

          {/* JUARA 1: Jamiatul Akbar (Center - Golden Border & Crown) */}
          <div 
            className="podium-box rank-1"
            onClick={() => { onSelectSantri(rank1.id); setActiveTab('santri'); }}
            style={{ cursor: 'pointer' }}
            title="Klik untuk lihat detail santri"
          >
            <div className="badge-terbanyak-crown">
              <Crown size={11} /> TERBANYAK
            </div>
            <div className="podium-student-name">{rank1.nama || "Jamiatul Akbar"}</div>
            <div className="podium-score-hlm">
              {rank1.totalHalaman || 14.5} <span>Hlm</span>
            </div>
            <div className="podium-sub-brs">{rank1.rincianHalaman || "14 Hlm 8 Brs"}</div>
          </div>

          {/* JUARA 3: M. Al Futra (Right) */}
          <div 
            className="podium-box" 
            onClick={() => { onSelectSantri(rank3.id); setActiveTab('santri'); }}
            style={{ cursor: 'pointer' }}
            title="Klik untuk lihat detail santri"
          >
            <div className="badge-rank-circle bronze">3</div>
            <div className="podium-student-name">{rank3.nama || "M. Al Futra"}</div>
            <div className="podium-score-hlm">
              {rank3.totalHalaman || 12.9} <span>Hlm</span>
            </div>
            <div className="podium-sub-brs">{rank3.rincianHalaman || "12 Hlm 13 Brs"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
