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
  Database
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
  cabangList = []
}) {
  const [pendingIzinCount, setPendingIzinCount] = useState(() => storageService.getPendingSigapIzinCount());

  useEffect(() => {
    const updateCount = () => {
      setPendingIzinCount(storageService.getPendingSigapIzinCount());
    };
    window.addEventListener('sigap_izin_updated', updateCount);
    window.addEventListener('sigap_admin_notif_updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('sigap_izin_updated', updateCount);
      window.removeEventListener('sigap_admin_notif_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);
  // =========================================================
  // 0. TAMPILAN KHUSUS OWNER (PORTAL YAYASAN & MULTI-CABANG)
  // =========================================================
  if (currentRole === 'owner') {
    const activeBranch = storageService.getActiveBranch();

    return (
      <aside className="sigap-sidebar sigap-sidebar-owner no-print">
        {/* BRAND LOGO HEADER: TAHFIDZ HUB OWNER PORTAL */}
        <div className="sigap-brand">
          <div 
            className="sigap-logo-box" 
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.28)' 
            }}
          >
            <TahfidzHubLogo size={24} variant="white" />
          </div>
          <div>
            <div className="sigap-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Tahfidz HUB</span>
              <span 
                style={{ 
                  fontSize: '0.62rem', 
                  background: '#fef3c7', 
                  color: '#92400e', 
                  border: '1px solid #fde68a', 
                  padding: '1px 6px', 
                  borderRadius: '4px', 
                  fontWeight: '800',
                  letterSpacing: '0.04em'
                }}
              >
                OWNER
              </span>
            </div>
            <div className="sigap-brand-subtitle">Multi-Branch System</div>
          </div>
        </div>

        {/* PROFIL CARD OWNER */}
        <div 
          className="sigap-profile-card"
          style={{
            background: isDarkMode ? '#1e293b' : '#fffbeb',
            borderColor: isDarkMode ? '#334155' : '#fde68a',
            position: 'relative'
          }}
        >
          {/* Status Badge Aktif di Kanan Atas - Tanpa overlap */}
          <div 
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isDarkMode ? '#0f172a' : '#ecfdf5',
              border: '1px solid ' + (isDarkMode ? '#334155' : '#a7f3d0'),
              padding: '2px 7px',
              borderRadius: '10px'
            }}
            title="Status Akun: Aktif Online"
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.62rem', fontWeight: '800', color: isDarkMode ? '#34d399' : '#047857' }}>AKTIF</span>
          </div>
          
          <div className="sigap-profile-top" style={{ paddingRight: '55px', marginBottom: '10px' }}>
            <div className="sigap-avatar-wrapper">
              <div 
                className="sigap-avatar-img" 
                style={{ 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                  borderColor: '#f59e0b',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>👑</span>
              </div>
              <div 
                className="sigap-camera-badge" 
                style={{ background: '#d97706', borderColor: '#ffffff' }}
                title="Profil Eksekutif Yayasan" 
                onClick={() => showToast && showToast("Pimpinan Yayasan PPIAS")}
              >
                <Camera size={9} />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div 
                className="sigap-admin-name" 
                style={{ 
                  fontSize: '0.90rem', 
                  fontWeight: '800',
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}
                title="Pimpinan Yayasan"
              >
                Pimpinan Yayasan
              </div>
              <span 
                className="sigap-badge-jenjang" 
                style={{ 
                  background: '#fef3c7', 
                  color: '#92400e',
                  fontWeight: '800',
                  fontSize: '0.62rem'
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
              borderColor: isDarkMode ? '#334155' : '#fde68a',
              background: isDarkMode ? '#0f172a' : '#ffffff',
              color: isDarkMode ? '#fde68a' : '#92400e'
            }}
          >
            <KeyRound size={13} color="#d97706" />
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
                value={activeBranchId || activeBranch?.id || ''} 
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
                  maxWidth: '120px',
                  textOverflow: 'ellipsis'
                }}
                title="Pilih Cabang untuk Diinspeksi"
              >
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

        {/* DAFTAR MENU OWNER */}
        <div className="sigap-menu-scroll">
          {/* 1. OTORITAS UTAMA */}
          <div className="sigap-section-divider">
            <span className="sigap-section-title">OTORITAS UTAMA</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'owner-dashboard' || activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner-dashboard')}
          >
            <Layers size={18} className="sigap-nav-icon" />
            <span>Dashboard Cabang</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'owner-cabang' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner-cabang')}
          >
            <Building2 size={18} className="sigap-nav-icon" />
            <span>Kelola Cabang</span>
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
            <span>Konsolidasi Data</span>
          </div>

          {/* 2. INSPEKSI DATA CABANG */}
          <div className="sigap-section-divider" style={{ marginTop: '16px' }}>
            <span className="sigap-section-title">INSPEKSI DATA CABANG</span>
            <div className="sigap-section-line"></div>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-siswa' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-siswa')}
          >
            <GraduationCap size={18} className="sigap-nav-icon" />
            <span>Data Siswa Cabang</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-guru' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-guru')}
          >
            <Users size={18} className="sigap-nav-icon" />
            <span>Data Guru Cabang</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-kelas' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-kelas')}
          >
            <Building2 size={18} className="sigap-nav-icon" />
            <span>Data Kelas Cabang</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-lokasi-qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-lokasi-qr')}
          >
            <MapPin size={18} className="sigap-nav-icon" />
            <span>Lokasi & QR Presensi</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-monitoring')}
          >
            <ClipboardCheck size={18} className="sigap-nav-icon" />
            <span>Rekap Monitoring</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-prisma-studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('sigap-prisma-studio')}
            style={{ marginTop: '4px' }}
          >
            <Database size={18} className="sigap-nav-icon" />
            <span>Prisma Studio (DB)</span>
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
  // 1. TAMPILAN KHUSUS SUPER ADMIN: PERSIS PANEL "SIGAP"
  // =========================================================
  if (currentRole === 'superadmin') {
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
          <div>
            <div className="sigap-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Tahfidz HUB</span>
              <span 
                style={{ 
                  fontSize: '0.60rem', 
                  background: '#ccfbf1', 
                  color: '#0f766e', 
                  border: '1px solid #99f6e4', 
                  padding: '1px 5px', 
                  borderRadius: '4px', 
                  fontWeight: '800'
                }}
              >
                ADMIN
              </span>
            </div>
            <div className="sigap-brand-subtitle">Admin & Cabang Terpadu</div>
          </div>
        </div>

        {/* PROFIL CARD ADMIN MA */}
        <div className="sigap-profile-card">
          <div className="sigap-online-dot" title="Status: Online"></div>
          
          <div className="sigap-profile-top">
            <div className="sigap-avatar-wrapper">
              <div className="sigap-avatar-img">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" fill="#0284c7" fillOpacity="0.2" stroke="#0284c7" strokeWidth="1.5"/>
                  <path d="M12 6.5L16 9.5V13.8C16 16.2 14.2 17.8 12 18.2C9.8 17.8 8 16.2 8 13.8V9.5L12 6.5Z" fill="#0284c7" fillOpacity="0.8"/>
                  <circle cx="12" cy="11.5" r="1.8" fill="#ffffff"/>
                </svg>
              </div>
              <div className="sigap-camera-badge" title="Ganti Foto Profil" onClick={() => showToast && showToast("Fitur ubah foto profil Admin MA")}>
                <Camera size={9} />
              </div>
            </div>

            <div>
              <div className="sigap-admin-name">Admin MA</div>
              <span className="sigap-badge-jenjang">ADMIN JENJANG</span>
            </div>
          </div>

          {/* Tombol Ubah Password */}
          <button className="sigap-btn-ubah-pass" onClick={onOpenPasswordModal}>
            <KeyRound size={13} color="#0d9488" />
            <span>Ubah Password</span>
          </button>
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
            <span>Lokasi & QR Kelas</span>
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

          {/* 5. SISTEM */}
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
    if (currentRole === 'orangtua') {
      return {
        initial: 'W',
        name: 'H. Akbar Sasmita',
        roleLabel: 'Wali Jamiatul Akbar'
      };
    } else {
      return {
        initial: 'W',
        name: 'Wahyudin Hafiz',
        roleLabel: 'Ubah Password'
      };
    }
  };

  const profile = getUserProfile();

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
      <div className="sidebar-user-card">
        <div className="user-avatar-circle">
          {profile.initial}
        </div>
        <div>
          <div className="user-name">{profile.name}</div>
          <div className="user-link-sub" onClick={onOpenPasswordModal}>
            <KeyRound size={12} />
            <span>{currentRole === 'pengampu' ? 'Ubah Password' : profile.roleLabel}</span>
          </div>
        </div>
      </div>

      {/* NAV GROUP: AL-QUR'AN */}
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

      {/* NAV GROUP: DASHBOARD */}
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

      {/* NAV GROUP: PRESENSI */}
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
      </div>

      {/* NAV GROUP: AKADEMIK */}
      <div className="sidebar-nav-group">
        <div className="nav-group-title">AKADEMIK</div>

        <div 
          className={`nav-item ${activeTab === 'santri' ? 'active' : ''}`}
          onClick={() => setActiveTab('santri')}
        >
          <div className="nav-item-left">
            <GraduationCap size={18} className="nav-icon" />
            <span>{currentRole === 'orangtua' ? 'Progres Ananda' : 'Santri'}</span>
          </div>
          {activeTab === 'santri' && <ChevronRight size={16} className="nav-chevron" />}
        </div>

        {currentRole !== 'orangtua' && (
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
        )}

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
      </div>

      {/* NAV GROUP: LAPORAN */}
      <div className="sidebar-nav-group">
        <div className="nav-group-title">LAPORAN</div>
        <div 
          className={`nav-item ${activeTab === 'rapor' ? 'active' : ''}`}
          onClick={() => setActiveTab('rapor')}
        >
          <div className="nav-item-left">
            <FileCheck2 size={18} className="nav-icon" />
            <span>Laporan & Rapor</span>
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
