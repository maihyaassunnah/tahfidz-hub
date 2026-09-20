import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Home,
  QrCode, 
  Clock, 
  FileText, 
  GraduationCap, 
  ClipboardCheck, 
  ChevronRight, 
  LogOut, 
  KeyRound, 
  FileCheck2, 
  Shield, 
  UserCheck, 
  Settings,
  Users,
  Calendar,
  MapPin,
  CheckSquare,
  Sun,
  Moon,
  HelpCircle,
  Bell,
  Camera,
  Building2,
  ShieldCheck,
  Layers,
  Sparkles,
  Sliders,
  ChevronDown,
  Database,
  Receipt,
  Lock
} from 'lucide-react';
import { storageService } from '../services/storage';
import TahfidzHubLogo from './TahfidzHubLogo';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentRole, 
  onSignOut,
  onOpenPasswordModal,
  isDarkMode,
  onToggleDarkMode,
  showToast,
  activeBranchId,
  onSwitchBranch,
  cabangList = [],
  onSwitchRole
}) {
  const [pendingIzinCount, setPendingIzinCount] = useState(() => storageService.getPendingSigapIzinCount());
  const [photoUpdateTrigger, setPhotoUpdateTrigger] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setPendingIzinCount(storageService.getPendingSigapIzinCount());
    };
    const updatePhoto = () => setPhotoUpdateTrigger(prev => prev + 1);

    window.addEventListener('sigap_izin_updated', updateCount);
    window.addEventListener('sigap_admin_notif_updated', updateCount);
    window.addEventListener('tahfidz_foto_profil_updated', updatePhoto);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('sigap_izin_updated', updateCount);
      window.removeEventListener('sigap_admin_notif_updated', updateCount);
      window.removeEventListener('tahfidz_foto_profil_updated', updatePhoto);
      window.removeEventListener('storage', updateCount);
    };
  }, []);
  // =========================================================
  // =========================================================
  // 0. TAMPILAN KHUSUS OWNER (PORTAL YAYASAN & MULTI-CABANG)
  // JIKA MEMILIH "SEMUA CABANG" (KONSOLIDASI GLOBAL)
  // =========================================================
  if (currentRole === 'owner' && (!activeBranchId || activeBranchId === 'ALL')) {
    const activeBranch = storageService.getActiveBranch();
    const ownerPhoto = storageService.getPhotoForUser({ userId: 'owner', userType: 'superadmin', username: 'owner' });

    return (
      <aside className="sigap-sidebar sigap-sidebar-owner no-print">
        {/* BRAND LOGO HEADER: TAHFIDZ HUB OWNER (PERSIS GAYA "Lecture .") */}
        <div className="sigap-brand" style={{ padding: '22px 18px 14px 18px', borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              className="sigap-logo-box" 
              style={{ 
                background: 'linear-gradient(135deg, #ff5b35 0%, #ff7b59 100%)', 
                boxShadow: '0 4px 14px rgba(255, 91, 53, 0.28)',
                borderRadius: '12px'
              }}
            >
              <TahfidzHubLogo size={22} variant="white" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.22rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#1e293b', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Tahfidz Hub<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                Multi-Branch System
              </div>
            </div>
          </div>
        </div>

        {/* INSTITUTION / OWNER CARD (PERSIS GAYA "Institute of Sam") */}
        <div 
          className="sigap-profile-card"
          style={{
            background: isDarkMode ? '#1e293b' : '#f8f9fd',
            borderColor: isDarkMode ? '#334155' : '#eef2f6',
            borderRadius: '16px',
            position: 'relative',
            padding: '12px',
            margin: '0 14px 14px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          {/* Status Badge Aktif di Kanan Atas */}
          <div 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isDarkMode ? '#0f172a' : '#ecfdf5',
              border: '1px solid ' + (isDarkMode ? '#334155' : '#a7f3d0'),
              padding: '2px 6px',
              borderRadius: '10px'
            }}
            title="Status Akun: Aktif Online"
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.58rem', fontWeight: '800', color: isDarkMode ? '#34d399' : '#047857' }}>AKTIF</span>
          </div>
          
          <div className="sigap-profile-top" style={{ paddingRight: '50px', marginBottom: '8px' }}>
            <div className="sigap-avatar-wrapper">
              <div 
                className="sigap-avatar-img" 
                style={{ 
                  background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', 
                  borderColor: '#c4b5fd',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: '12px'
                }}
              >
                {ownerPhoto ? (
                  <img src={ownerPhoto} alt="Owner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                )}
              </div>
              <div 
                className="sigap-camera-badge" 
                style={{ background: '#ff5b35', borderColor: '#ffffff', cursor: 'pointer' }}
                title="Kelola Foto Profil Owner" 
                onClick={() => {
                  setActiveTab('sigap-konfigurasi');
                  window.dispatchEvent(new CustomEvent('sigap_open_foto_profil'));
                  showToast && showToast("Buka Pengaturan Foto Profil Akun");
                }}
              >
                <Camera size={9} />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div 
                className="sigap-admin-name" 
                style={{ 
                  fontSize: '0.88rem', 
                  fontWeight: '800',
                  color: isDarkMode ? '#f8fafc' : '#1e293b',
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}
                title="Pesantren PPIAS"
              >
                Pesantren PPIAS
              </div>
              <span 
                className="sigap-badge-jenjang" 
                style={{ 
                  background: '#fff0ec', 
                  color: '#ff5b35',
                  fontWeight: '800',
                  fontSize: '0.62rem',
                  border: '1px solid #ffdcd3'
                }}
              >
                EXECUTIVE OWNER
              </span>
            </div>
          </div>

          {/* Tombol Akses Kredensial Super Admin */}
          <button 
            className="sigap-btn-ubah-pass" 
            onClick={() => setActiveTab('owner-superadmin')}
            style={{ 
              borderColor: isDarkMode ? '#334155' : '#fed7aa',
              background: isDarkMode ? '#0f172a' : '#ffffff',
              color: isDarkMode ? '#fde047' : '#ea580c',
              borderRadius: '10px'
            }}
          >
            <KeyRound size={13} color="#ff5b35" />
            <span>Kredensial Super Admin</span>
          </button>

          {/* Active Branch Quick Selector Dropdown */}
          <div 
            style={{ 
              marginTop: '8px', 
              padding: '5px 8px', 
              background: isDarkMode ? '#0f172a' : '#ffffff', 
              borderRadius: '10px', 
              fontSize: '0.74rem', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: isDarkMode ? '1px solid #334155' : '1px solid #fde68a',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
              <MapPin size={12} color="#d97706" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap' }}>Cabang:</span>
            </div>
            
            {cabangList && cabangList.length > 0 ? (
              <select 
                value={activeBranchId || activeBranch?.id || 'ALL'} 
                onChange={(e) => onSwitchBranch && onSwitchBranch(e.target.value)}
                style={{
                  background: isDarkMode ? '#1e293b' : '#fffbeb',
                  border: '1px solid ' + (isDarkMode ? '#334155' : '#fde68a'),
                  borderRadius: '6px',
                  padding: '2px 4px',
                  fontSize: '0.70rem',
                  fontWeight: '800',
                  color: '#b45309',
                  cursor: 'pointer',
                  outline: 'none',
                  flex: 1,
                  maxWidth: '150px',
                  textOverflow: 'ellipsis'
                }}
                title="Pilih Cabang untuk Diinspeksi"
              >
                <option value="ALL">🌐 Semua Cabang</option>
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            ) : (
              <strong style={{ color: activeBranch?.warnaAksen || '#d97706', fontSize: '0.72rem' }}>
                {activeBranch?.kode || 'MA-PUSAT'}
              </strong>
            )}
          </div>
        </div>

        {/* DAFTAR MENU NAVIGASI SEMUA CABANG (LENGKAP SEPERTI CABANG & PRISMA STUDIO DI PALING BAWAH) */}
        <div className="sigap-menu-scroll">
          {/* 1. DASHBOARD */}
          <div 
            className={`sigap-nav-item ${activeTab === 'owner-dashboard' || activeTab === 'dashboard' || activeTab === 'sigap-dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner-dashboard')}
          >
            <Home size={18} className="sigap-nav-icon" />
            <span>Dashboard Yayasan</span>
          </div>

          {/* 2. CIVITAS AKADEMIKA */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">CIVITAS AKADEMIKA</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-siswa' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-siswa')}
          >
            <GraduationCap size={18} className="sigap-nav-icon" />
            <span>Data Siswa</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-guru' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-guru')}
          >
            <Users size={18} className="sigap-nav-icon" />
            <span>Data Guru & Pegawai</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-alumni' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-alumni')}
          >
            <GraduationCap size={18} className="sigap-nav-icon" />
            <span>Data Alumni</span>
          </div>

          {/* 3. MANAJEMEN KBM */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">MANAJEMEN KBM</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-jadwal' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-jadwal')}
          >
            <Calendar size={18} className="sigap-nav-icon" />
            <span>Jadwal</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-lokasi-qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-lokasi-qr')}
          >
            <MapPin size={18} className="sigap-nav-icon" />
            <span>Lokasi & QR Presensi</span>
          </div>

          {/* 4. REKAP & PERIZINAN */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">REKAP & PERIZINAN</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-monitoring')}
          >
            <ClipboardCheck size={18} className="sigap-nav-icon" />
            <span>Monitoring & Rekap</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-izin' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-izin')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} className="sigap-nav-icon" />
              <span>Persetujuan Izin</span>
            </div>
            {pendingIzinCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
              }}>
                {pendingIzinCount}
              </span>
            )}
          </div>

          {/* 5. KEUANGAN & SPP */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">KEUANGAN & SPP</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-spp' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-spp')}
          >
            <Receipt size={18} className="sigap-nav-icon" />
            <span>Pembayaran SPP</span>
          </div>

          {/* 6. MANAJEMEN CABANG */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">MANAJEMEN CABANG</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'owner-cabang' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner-cabang')}
          >
            <Building2 size={18} className="sigap-nav-icon" />
            <span>Analisis & Kelola Cabang</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'owner-superadmin' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner-superadmin')}
          >
            <ShieldCheck size={18} className="sigap-nav-icon" />
            <span>Akun Super Admin</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'owner-rekap' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner-rekap')}
          >
            <FileText size={18} className="sigap-nav-icon" />
            <span>Konsolidasi Seluruh Cabang</span>
          </div>

          {/* 7. DATABASE & SISTEM (PALING BAWAH SESUAI PERMINTAAN) */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">DATABASE & SISTEM</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-prisma-studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-prisma-studio')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} className="sigap-nav-icon" />
              <span>Prisma Studio</span>
            </div>
            <span style={{
              fontSize: '0.60rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '6px',
              background: isDarkMode ? '#064e3b' : '#ecfdf5',
              color: isDarkMode ? '#34d399' : '#047857',
              border: isDarkMode ? '1px solid #059669' : '1px solid #a7f3d0',
              whiteSpace: 'nowrap'
            }}>
              Semua Cabang
            </span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-konfigurasi' || activeTab === 'owner-konfigurasi' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-konfigurasi')}
          >
            <Settings size={18} className="sigap-nav-icon" />
            <span>Konfigurasi Unit & Akun</span>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (4 IKON SEIMBANG SEPERTI SIGAP) */}
        <div className="sigap-bottom-bar">
          <button 
            className="sigap-bottom-icon-btn" 
            onClick={onToggleDarkMode} 
            title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button 
            className="sigap-bottom-icon-btn" 
            onClick={() => showToast && showToast("Portal Owner: Manajemen Multi-Cabang & Yayasan")} 
            title="Bantuan & Panduan Owner"
          >
            <HelpCircle size={17} />
          </button>

          <button 
            className="sigap-bottom-icon-btn" 
            onClick={() => showToast && showToast("Notifikasi Sistem: Semua Cabang Terpantau Beroperasi Normal")} 
            title="Notifikasi Yayasan"
          >
            <Bell size={17} />
          </button>

          <button 
            className="sigap-bottom-logout" 
            onClick={onSignOut} 
            title="Keluar dari Sistem"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    );
  }

  // =========================================================
  // =========================================================
  // 1. TAMPILAN KHUSUS SUPER ADMIN / KETIKA OWNER MEMILIH SATU CABANG
  // =========================================================
  if (currentRole === 'superadmin' || (currentRole === 'owner' && activeBranchId && activeBranchId !== 'ALL')) {
    const authUser = storageService.getAuthUser();
    const effectiveBranchId = currentRole === 'superadmin' 
      ? (authUser?.cabangId || activeBranchId || 'cabang-pusat')
      : (activeBranchId || 'cabang-pusat');
    const currentBranch = (cabangList || []).find(c => c.id === effectiveBranchId) || storageService.getActiveBranch() || {};
    const superadminPhoto = storageService.getPhotoForUser({ 
      userId: authUser?.id || authUser?.userId || currentBranch.id || 'admin-ma', 
      userType: 'superadmin', 
      username: authUser?.username || 'ma', 
      nama: authUser?.nama || currentBranch.nama || 'MA Ihya As-Sunnah',
      cabangId: effectiveBranchId 
    });

    return (
      <aside className="sigap-sidebar no-print">
        {/* BRAND LOGO HEADER: TAHFIDZ HUB SUPER ADMIN */}
        <div className="sigap-brand">
          <div 
            className="sigap-logo-box"
            style={{ 
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.28)'
            }}
          >
            <TahfidzHubLogo size={24} variant="white" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="sigap-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <span style={{ whiteSpace: 'nowrap', fontWeight: 900 }}>Tahfidz HUB</span>
              <span 
                style={{ 
                  fontSize: '0.58rem', 
                  background: '#ccfbf1', 
                  color: '#0f766e', 
                  border: '1px solid #99f6e4', 
                  padding: '1px 5px', 
                  borderRadius: '4px', 
                  fontWeight: '800',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                ADMIN
              </span>
            </div>
            <div className="sigap-brand-subtitle" style={{ whiteSpace: 'nowrap' }}>Admin & Cabang Terpadu</div>
          </div>
        </div>

        {/* PROFIL CARD ADMIN CABANG */}
        <div className="sigap-profile-card">
          <div className="sigap-online-dot" title="Status: Online"></div>
          
          <div className="sigap-profile-top">
            <div className="sigap-avatar-wrapper">
              <div className="sigap-avatar-img" key={`avatar-${photoUpdateTrigger}`} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {superadminPhoto ? (
                  <img src={superadminPhoto} alt={currentBranch.nama || "Admin"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" fill="#0284c7" fillOpacity="0.2" stroke="#0284c7" strokeWidth="1.5"/>
                    <path d="M12 6.5L16 9.5V13.8C16 16.2 14.2 17.8 12 18.2C9.8 17.8 8 16.2 8 13.8V9.5L12 6.5Z" fill="#0284c7" fillOpacity="0.8"/>
                    <circle cx="12" cy="11.5" r="1.8" fill="#ffffff"/>
                  </svg>
                )}
              </div>
              <div 
                className="sigap-camera-badge" 
                title="Ganti Foto Profil" 
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setActiveTab('sigap-konfigurasi');
                  window.dispatchEvent(new CustomEvent('sigap_open_foto_profil'));
                  showToast && showToast("Buka Pengaturan Foto Profil Akun");
                }}
              >
                <Camera size={9} />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div 
                className="sigap-admin-name"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.90rem',
                  fontWeight: 800,
                  letterSpacing: '-0.01em'
                }}
                title={currentBranch.nama || ((cabangList || []).find(c => c.id === activeBranchId)?.nama) || 'Admin Cabang'}
              >
                {currentBranch.nama || ((cabangList || []).find(c => c.id === activeBranchId)?.nama) || 'Admin Cabang'}
              </div>
              <span className="sigap-badge-jenjang">
                {currentBranch.kode ? `CABANG ${currentBranch.kode}` : ((cabangList || []).find(c => c.id === activeBranchId)?.kode) ? `CABANG ${((cabangList || []).find(c => c.id === activeBranchId)?.kode)}` : 'ADMIN JENJANG'}
              </span>
            </div>
          </div>

          {/* Active Branch Quick Selector (Locked for Super Admin, Selectable for Owner) */}
          {currentRole === 'superadmin' ? (
            <div 
              style={{ 
                marginTop: '10px', 
                padding: '7px 10px', 
                background: isDarkMode ? '#0f172a' : '#f0fdf4', 
                borderRadius: '10px', 
                fontSize: '0.72rem', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: isDarkMode ? '1px solid #065f46' : '1px solid #a7f3d0',
                gap: '8px'
              }}
              title={`Cabang Terkunci: ${currentBranch.nama || 'MA Ihya As-Sunnah'} (Akun Super Admin terikat pada cabang ini)`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                <MapPin size={13} color="#059669" style={{ flexShrink: 0 }} />
                <span style={{ 
                  fontWeight: 700, 
                  color: isDarkMode ? '#34d399' : '#047857', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {currentBranch.nama || 'MA Ihya As-Sunnah'}
                </span>
              </div>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  background: isDarkMode ? '#064e3b' : '#dcfce7',
                  color: isDarkMode ? '#a7f3d0' : '#15803d',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                <Lock size={10} color={isDarkMode ? '#a7f3d0' : '#15803d'} /> TERKUNCI
              </span>
            </div>
          ) : (
            <div 
              style={{ 
                marginTop: '8px', 
                padding: '5px 8px', 
                background: isDarkMode ? '#0f172a' : '#ffffff', 
                borderRadius: '10px', 
                fontSize: '0.74rem', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                <MapPin size={12} color="#059669" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap' }}>Cabang:</span>
              </div>
              <select 
                value={activeBranchId || (cabangList[0]?.id || 'cabang-pusat')} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'ALL') {
                    if (onSwitchBranch) onSwitchBranch('ALL');
                    if (setActiveTab) setActiveTab('owner-dashboard');
                    showToast && showToast("Kembali ke Portal Yayasan (Semua Cabang)");
                  } else {
                    if (onSwitchBranch) onSwitchBranch(val);
                  }
                }}
                style={{
                  background: isDarkMode ? '#1e293b' : '#f0fdf4',
                  border: '1px solid ' + (isDarkMode ? '#334155' : '#86efac'),
                  borderRadius: '6px',
                  padding: '2px 4px',
                  fontSize: '0.70rem',
                  fontWeight: '800',
                  color: '#15803d',
                  cursor: 'pointer',
                  outline: 'none',
                  flex: 1,
                  maxWidth: '150px',
                  textOverflow: 'ellipsis'
                }}
                title="Pilih Cabang untuk Dikelola"
              >
                {currentRole === 'owner' && (
                  <option value="ALL">🌐 Semua Cabang (Portal Yayasan)</option>
                )}
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tombol Ubah Password */}
          <button className="sigap-btn-ubah-pass" onClick={onOpenPasswordModal} style={{ marginTop: '8px' }}>
            <KeyRound size={13} color="#0d9488" />
            <span>Ubah Password</span>
          </button>

          {/* Tombol Kembali ke Portal Yayasan (HANYA untuk akun Owner saat sedang inspeksi satu cabang) */}
          {currentRole === 'owner' && (
            <button 
              type="button"
              className="sigap-btn-ubah-pass" 
              onClick={() => {
                if (onSwitchBranch) onSwitchBranch('ALL');
                if (setActiveTab) setActiveTab('owner-dashboard');
                showToast && showToast("Kembali ke Portal Yayasan");
              }}
              style={{ 
                marginTop: '6px', 
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', 
                borderColor: '#f59e0b', 
                color: '#b45309',
                fontWeight: '700'
              }}
              title="Kembali ke Dashboard Multi-Cabang Yayasan"
            >
              <Building2 size={13} color="#d97706" />
              <span>👑 Kembali ke Portal Yayasan</span>
            </button>
          )}
        </div>

        {/* DAFTAR MENU NAVIGASI (DENGAN PEMBATAS KATEGORI) */}
        <div className="sigap-menu-scroll">
          {/* 1. DASHBOARD */}
          <div 
            className={`sigap-nav-item ${activeTab === 'dashboard' || activeTab === 'sigap-dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-dashboard')}
          >
            <Home size={18} className="sigap-nav-icon" />
            <span>Dashboard</span>
          </div>

          {/* 2. CIVITAS AKADEMIKA */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">CIVITAS AKADEMIKA</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-siswa' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-siswa')}
          >
            <GraduationCap size={18} className="sigap-nav-icon" />
            <span>Data Siswa</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-guru' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-guru')}
          >
            <Users size={18} className="sigap-nav-icon" />
            <span>Data Guru & Pegawai</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-alumni' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-alumni')}
          >
            <GraduationCap size={18} className="sigap-nav-icon" />
            <span>Data Alumni</span>
          </div>

          {/* 3. MANAJEMEN KBM */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">MANAJEMEN KBM</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-jadwal' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-jadwal')}
          >
            <Calendar size={18} className="sigap-nav-icon" />
            <span>Jadwal</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-lokasi-qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-lokasi-qr')}
          >
            <MapPin size={18} className="sigap-nav-icon" />
            <span>Lokasi & QR Presensi</span>
          </div>

          {/* 4. REKAP & PERIZINAN */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">REKAP & PERIZINAN</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-monitoring')}
          >
            <ClipboardCheck size={18} className="sigap-nav-icon" />
            <span>Monitoring & Rekap</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-izin' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-izin')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} className="sigap-nav-icon" />
              <span>Persetujuan Izin</span>
            </div>
            {pendingIzinCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '10px',
                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
              }}>
                {pendingIzinCount}
              </span>
            )}
          </div>

          {/* 5. KEUANGAN & PEMBAYARAN */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">KEUANGAN & SPP</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-spp' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-spp')}
          >
            <Receipt size={18} className="sigap-nav-icon" />
            <span>Pembayaran SPP</span>
          </div>

          {/* 6. SISTEM */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">SISTEM & DATABASE</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-prisma-studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-prisma-studio')}
          >
            <Database size={18} className="sigap-nav-icon" />
            <span>Prisma Studio</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-konfigurasi' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-konfigurasi')}
          >
            <Settings size={18} className="sigap-nav-icon" />
            <span>Konfigurasi Unit</span>
          </div>
        </div>

        {/* BILAH AKSI KAPSUL BAWAH (PERSIS SCREENSHOT) */}
        <div className="sigap-bottom-bar">
          <button 
            className="sigap-bottom-icon-btn" 
            onClick={onToggleDarkMode} 
            title="Ganti Tema (Terang / Gelap)"
          >
            <Sun size={17} />
          </button>

          <button 
            className="sigap-bottom-icon-btn" 
            onClick={() => showToast && showToast("Pusat Bantuan & Panduan Sistem SIGAP")} 
            title="Bantuan & Panduan"
          >
            <HelpCircle size={17} />
          </button>

          <button 
            className="sigap-bottom-icon-btn relative" 
            onClick={() => {
              if (pendingIzinCount > 0) {
                setActiveTab('sigap-izin');
                showToast && showToast(`🔔 Ada ${pendingIzinCount} permohonan izin pengampu menunggu persetujuan.`);
              } else {
                showToast && showToast("Semua permohonan izin telah ditinjau (tidak ada yang pending).");
              }
            }} 
            title={pendingIzinCount > 0 ? `Notifikasi: ${pendingIzinCount} izin menunggu persetujuan` : "Notifikasi"}
          >
            <Bell size={17} />
            {pendingIzinCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px #ffffff'
              }}></span>
            )}
          </button>

          <button 
            className="sigap-bottom-logout" 
            onClick={onSignOut} 
            title="Keluar dari Sistem"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    );
  }

  // =========================================================
  // 2. TAMPILAN SIDEBAR PENGAMPU & ORANG TUA (TAHFIDZ)
  // =========================================================
  const getUserProfile = () => {
    const auth = storageService.getAuthUser();
    if (currentRole === 'orangtua') {
      const childName = auth?.namaSantri || auth?.username || 'Ananda';
      return {
        initial: (childName || 'W').charAt(0).toUpperCase(),
        name: auth?.nama || ('Wali dari ' + childName),
        roleLabel: auth?.nis ? `NIS: ${auth.nis}` : 'Wali Santri'
      };
    } else {
      return {
        initial: (auth?.nama || 'W').charAt(0).toUpperCase(),
        name: auth?.nama || 'Wahyudin Hafiz',
        roleLabel: 'Ubah Password'
      };
    }
  };

  const profile = getUserProfile();
  const currentAuth = storageService.getAuthUser();
  const pengampuPhoto = currentRole === 'pengampu' 
    ? storageService.getPhotoForUser({ userId: currentAuth?.nip || currentAuth?.id, userType: 'pengampu', username: currentAuth?.username, nip: currentAuth?.nip, nama: currentAuth?.nama })
    : null;

  return (
    <aside className="simtah-sidebar no-print">
      {/* Brand Logo: Tahfidz HUB */}
      <div className="sidebar-brand">
        <div 
          className="brand-icon-geom"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
          }}
        >
          <TahfidzHubLogo size={22} variant="white" />
        </div>
        <div className="brand-name">
          Tahfidz HUB <span className="brand-dot"></span>
        </div>
      </div>

      {/* User Card */}
      <div className="sidebar-user-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="user-avatar-circle" style={{ overflow: 'hidden', padding: 0 }}>
            {pengampuPhoto ? (
              <img src={pengampuPhoto} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              profile.initial
            )}
          </div>
          <div>
            <div className="user-name">{profile.name}</div>
            <div className="user-link-sub" onClick={currentRole === 'pengampu' ? onOpenPasswordModal : undefined} style={{ cursor: currentRole === 'pengampu' ? 'pointer' : 'default' }}>
              <KeyRound size={12} />
              <span>{profile.roleLabel}</span>
            </div>
          </div>
        </div>

        {onSwitchRole && currentRole === 'orangtua' && (
          <button 
            type="button"
            className="sigap-btn-ubah-pass" 
            onClick={() => onSwitchRole('superadmin')}
            style={{ width: '100%', marginTop: '4px', background: '#f0fdf4', borderColor: '#86efac', color: '#15803d', padding: '5px 8px', fontSize: '0.74rem' }}
            title="Kembali ke Super Admin"
          >
            <Shield size={12} color="#15803d" />
            <span>Kembali ke Admin</span>
          </button>
        )}
      </div>

      {/* NAV GROUP: AL-QUR'AN (Khusus Pengampu / Super Admin) */}
      {currentRole !== 'orangtua' && (
        <div className="sidebar-nav-group">
          <div className="nav-group-title">AL-QUR'AN</div>
          <div 
            className={`nav-item ${activeTab === 'mushaf' ? 'active' : ''}`}
            onClick={() => setActiveTab('mushaf')}
          >
            <div className="nav-item-left">
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <BookOpen size={13} />
              </div>
              <span>Mushaf Al-Qur'an</span>
            </div>
            {activeTab === 'mushaf' && <ChevronRight size={16} className="nav-chevron" />}
          </div>
        </div>
      )}

      {/* NAV GROUP: DASHBOARD (MENU 1) */}
      <div className="sidebar-nav-group">
        <div className="nav-group-title">DASHBOARD</div>
        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="nav-item-left">
            <LayoutDashboard size={18} className="nav-icon" />
            <span>Dashboard</span>
          </div>
          {activeTab === 'dashboard' && <ChevronRight size={16} className="nav-chevron" />}
        </div>
      </div>

      {/* NAV GROUP: PRESENSI (MENU 2: RIWAYAT PRESENSI SANTRI) */}
      <div className="sidebar-nav-group">
        <div className="nav-group-title">PRESENSI</div>
        
        {currentRole !== 'orangtua' && (
          <div 
            className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <div className="nav-item-left">
              <QrCode size={18} className="nav-icon" />
              <span>Scan Presensi</span>
            </div>
            {activeTab === 'scan' && <ChevronRight size={16} className="nav-chevron" />}
          </div>
        )}

        <div 
          className={`nav-item ${activeTab === 'riwayat-presensi' || activeTab === 'riwayat-presensi-santri' ? 'active' : ''}`}
          onClick={() => setActiveTab('riwayat-presensi-santri')}
        >
          <div className="nav-item-left">
            <ClipboardCheck size={18} className="nav-icon" />
            <span>Riwayat Presensi Santri</span>
          </div>
          {(activeTab === 'riwayat-presensi' || activeTab === 'riwayat-presensi-santri') && <ChevronRight size={16} className="nav-chevron" />}
        </div>

        {currentRole !== 'orangtua' && (
          <>
            <div 
              className={`nav-item ${activeTab === 'riwayat-presensi-pengampu' ? 'active' : ''}`}
              onClick={() => setActiveTab('riwayat-presensi-pengampu')}
            >
              <div className="nav-item-left">
                <UserCheck size={18} className="nav-icon" />
                <span>Riwayat Presensi Pengampu</span>
              </div>
              {activeTab === 'riwayat-presensi-pengampu' && <ChevronRight size={16} className="nav-chevron" />}
            </div>

            <div 
              className={`nav-item ${activeTab === 'izin' ? 'active' : ''}`}
              onClick={() => setActiveTab('izin')}
            >
              <div className="nav-item-left">
                <FileText size={18} className="nav-icon" />
                <span>Permohonan Izin</span>
              </div>
              {activeTab === 'izin' && <ChevronRight size={16} className="nav-chevron" />}
            </div>
          </>
        )}
      </div>

      {/* NAV GROUP: AKADEMIK (MENU 3: HAFALAN & PROGRESS ANANDA) */}
      <div className="sidebar-nav-group">
        <div className="nav-group-title">AKADEMIK</div>

        {currentRole === 'orangtua' && (
          <div 
            className={`nav-item ${activeTab === 'hafalan-santri' ? 'active' : ''}`}
            onClick={() => setActiveTab('hafalan-santri')}
          >
            <div className="nav-item-left">
              <BookOpen size={18} className="nav-icon" />
              <span>Hafalan Santri</span>
            </div>
            {activeTab === 'hafalan-santri' && <ChevronRight size={16} className="nav-chevron" />}
          </div>
        )}

        <div 
          className={`nav-item ${activeTab === 'santri' ? 'active' : ''}`}
          onClick={() => setActiveTab('santri')}
        >
          <div className="nav-item-left">
            <GraduationCap size={18} className="nav-icon" />
            <span>{currentRole === 'orangtua' ? 'Progress Ananda' : 'Santri'}</span>
          </div>
          {activeTab === 'santri' && <ChevronRight size={16} className="nav-chevron" />}
        </div>

        {currentRole !== 'orangtua' && (
          <>
            <div 
              className={`nav-item ${activeTab === 'presensi-santri' ? 'active' : ''}`}
              onClick={() => setActiveTab('presensi-santri')}
            >
              <div className="nav-item-left">
                <ClipboardCheck size={18} className="nav-icon" />
                <span>Presensi Santri</span>
              </div>
              {activeTab === 'presensi-santri' && <ChevronRight size={16} className="nav-chevron" />}
            </div>

            <div 
              className={`nav-item ${activeTab === 'setoran' ? 'active' : ''}`}
              onClick={() => setActiveTab('setoran')}
            >
              <div className="nav-item-left">
                <BookOpen size={18} className="nav-icon" />
                <span>Setoran</span>
              </div>
              {activeTab === 'setoran' && <ChevronRight size={16} className="nav-chevron" />}
            </div>
          </>
        )}
      </div>

      {/* NAV GROUP: LAPORAN (MENU 4: LAPORAN DAN RAPORT) */}
      <div className="sidebar-nav-group">
        <div className="nav-group-title">LAPORAN</div>
        <div 
          className={`nav-item ${activeTab === 'rapor' ? 'active' : ''}`}
          onClick={() => setActiveTab('rapor')}
        >
          <div className="nav-item-left">
            <FileCheck2 size={18} className="nav-icon" />
            <span>Laporan dan Raport</span>
          </div>
          {activeTab === 'rapor' && <ChevronRight size={16} className="nav-chevron" />}
        </div>
      </div>

      {/* Bottom Sign Out */}
      <div className="sidebar-bottom">
        <button className="btn-signout" onClick={onSignOut}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
