import React, { useState, useEffect } from 'react';
import { 
  Home, 
  GraduationCap, 
  Calendar, 
  ClipboardCheck, 
  Settings, 
  BookOpen, 
  QrCode, 
  FileText, 
  Users, 
  FileCheck2, 
  LayoutGrid, 
  LogOut, 
  KeyRound, 
  Sun, 
  Moon, 
  X, 
  ChevronRight, 
  MapPin, 
  CheckSquare, 
  Clock,
  Shield,
  HelpCircle,
  User,
  Award,
  Building2,
  ShieldCheck,
  Layers,
  UserCheck,
  Database,
  Receipt,
  Download
} from 'lucide-react';
import { storageService } from '../services/storage';

export default function BottomNav({
  activeTab,
  setActiveTab,
  currentRole,
  onSignOut,
  onOpenPasswordModal,
  isDarkMode,
  onToggleDarkMode,
  showToast,
  onSwitchRole,
  activeBranchId,
  onSwitchBranch
}) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [photoTrigger, setPhotoTrigger] = useState(0);

  useEffect(() => {
    const handlePhotoUpdate = () => setPhotoTrigger(prev => prev + 1);
    window.addEventListener('tahfidz_foto_profil_updated', handlePhotoUpdate);
    return () => window.removeEventListener('tahfidz_foto_profil_updated', handlePhotoUpdate);
  }, []);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowDrawer(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (showDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDrawer]);

  // =========================================================================
  // 1. DEFINE 5 BOTTOM TABS FOR EACH ROLE (TAB KE-5: "Lainnya" / Menu Drawer)
  // =========================================================================
  const getBottomTabs = () => {
    if (currentRole === 'owner') {
      return [
        {
          id: 'dashboard',
          label: 'Yayasan',
          icon: Layers,
          targetTab: 'owner-dashboard',
          matches: ['owner-dashboard', 'dashboard']
        },
        {
          id: 'cabang',
          label: 'Cabang',
          icon: Building2,
          targetTab: 'owner-cabang',
          matches: ['owner-cabang']
        },
        {
          id: 'rekap',
          label: 'Konsolidasi',
          icon: FileText,
          targetTab: 'owner-rekap',
          matches: ['owner-rekap']
        },
        {
          id: 'konfigurasi',
          label: 'Pengaturan',
          icon: Settings,
          targetTab: 'sigap-konfigurasi',
          matches: ['sigap-konfigurasi', 'owner-konfigurasi']
        },
        {
          id: 'more',
          label: 'Lainnya',
          icon: LayoutGrid,
          targetTab: 'more',
          isMoreTrigger: true,
          matches: [
            'more',
            'sigap-siswa',
            'sigap-guru',
            'sigap-alumni',
            'sigap-jadwal',
            'sigap-lokasi-qr',
            'sigap-monitoring',
            'sigap-izin',
            'sigap-spp',
            'owner-superadmin',
            'sigap-prisma-studio'
          ]
        }
      ];
    } else if (currentRole === 'superadmin') {
      return [
        {
          id: 'dashboard',
          label: 'Home',
          icon: Home,
          targetTab: 'sigap-dashboard',
          matches: ['sigap-dashboard', 'dashboard']
        },
        {
          id: 'siswa',
          label: 'Siswa',
          icon: GraduationCap,
          targetTab: 'sigap-siswa',
          matches: ['sigap-siswa']
        },
        {
          id: 'jadwal',
          label: 'Jadwal',
          icon: Calendar,
          targetTab: 'sigap-jadwal',
          matches: ['sigap-jadwal']
        },
        {
          id: 'monitoring',
          label: 'Rekap',
          icon: ClipboardCheck,
          targetTab: 'sigap-monitoring',
          matches: ['sigap-monitoring']
        },
        {
          id: 'more',
          label: 'Lainnya',
          icon: LayoutGrid,
          targetTab: 'more',
          isMoreTrigger: true,
          matches: ['more', 'sigap-guru', 'sigap-alumni', 'sigap-lokasi-qr', 'sigap-izin', 'sigap-konfigurasi']
        }
      ];
    } else if (currentRole === 'pengampu') {
      return [
        {
          id: 'dashboard',
          label: 'Home',
          icon: Home,
          targetTab: 'dashboard',
          matches: ['dashboard']
        },
        {
          id: 'mushaf',
          label: 'Mushaf',
          icon: BookOpen,
          targetTab: 'mushaf',
          matches: ['mushaf']
        },
        {
          id: 'scan',
          label: 'Scan QR',
          icon: QrCode,
          targetTab: 'scan',
          matches: ['scan']
        },
        {
          id: 'setoran',
          label: 'Setoran',
          icon: FileText,
          targetTab: 'setoran',
          matches: ['setoran']
        },
        {
          id: 'more',
          label: 'Lainnya',
          icon: LayoutGrid,
          targetTab: 'more',
          isMoreTrigger: true,
          matches: ['more', 'santri', 'presensi-santri', 'riwayat-presensi', 'riwayat-presensi-santri', 'riwayat-presensi-pengampu', 'izin', 'rapor']
        }
      ];
    } else {
      // Orang Tua / Wali: 5 Menu Lengkap
      return [
        {
          id: 'dashboard',
          label: 'Home',
          icon: Home,
          targetTab: 'dashboard',
          matches: ['dashboard']
        },
        {
          id: 'hafalan-santri',
          label: 'Hafalan',
          icon: BookOpen,
          targetTab: 'hafalan-santri',
          matches: ['hafalan-santri']
        },
        {
          id: 'riwayat-presensi-santri',
          label: 'Presensi',
          icon: ClipboardCheck,
          targetTab: 'riwayat-presensi-santri',
          matches: ['riwayat-presensi', 'riwayat-presensi-santri']
        },
        {
          id: 'santri',
          label: 'Progress',
          icon: GraduationCap,
          targetTab: 'santri',
          matches: ['santri']
        },
        {
          id: 'rapor',
          label: 'Raport',
          icon: FileCheck2,
          targetTab: 'rapor',
          matches: ['rapor']
        }
      ];
    }
  };

  const tabs = getBottomTabs();

  // Find active index
  let activeIndex = tabs.findIndex(tab => {
    if (showDrawer && tab.isMoreTrigger) return true;
    return tab.matches.includes(activeTab);
  });
  if (activeIndex === -1) {
    activeIndex = tabs.length - 1; // Default to 'Lainnya' if current page is sub-page
  }

  const activeTabItem = tabs[activeIndex] || tabs[0];
  const ActiveIcon = activeTabItem.icon;

  const handleTabClick = (tab) => {
    if (tab.isMoreTrigger) {
      setShowDrawer(prev => !prev);
    } else {
      if (currentRole === 'owner') {
        if (onSwitchBranch && activeBranchId && activeBranchId !== 'ALL') {
          onSwitchBranch('ALL');
        }
      }
      setActiveTab(tab.targetTab);
      setShowDrawer(false);
    }
  };

  const handleNavigateFromDrawer = (targetTab) => {
    if (currentRole === 'owner' && (targetTab?.startsWith('owner-') || targetTab === 'dashboard')) {
      if (onSwitchBranch && activeBranchId && activeBranchId !== 'ALL') {
        onSwitchBranch('ALL');
      }
    }
    setActiveTab(targetTab);
    setShowDrawer(false);
  };

  // Color theme
  const bubbleThemeColor = currentRole === 'owner' ? '#d97706' : currentRole === 'superadmin' ? '#0d9488' : '#10b981';

  // Get user profile details with REAL data from database
  const getProfileData = () => {
    const auth = storageService.getAuthUser();
    const effectiveBranchId = auth?.cabangId || 'cabang-pusat';
    const currentBranch = (storageService.getCabang ? storageService.getCabang() : []).find(c => c.id === effectiveBranchId) || storageService.getActiveBranch() || {};

    if (currentRole === 'owner') {
      const cList = storageService.getCabang ? storageService.getCabang() : [];
      const allGurus = storageService.getAllSigapGuruRaw ? storageService.getAllSigapGuruRaw() : [];
      const allSiswa = storageService.getAllSigapSiswaRaw ? storageService.getAllSigapSiswaRaw() : [];
      return {
        name: 'Pimpinan Yayasan',
        role: 'EXECUTIVE OWNER',
        subRole: 'Pusat Yayasan & Multi-Cabang',
        avatarBg: '#d97706',
        avatarText: '👑',
        stats: [
          { value: String(cList.length || 3), label: 'Cabang' },
          { value: String(allGurus.length || 0), label: 'Guru & TU' },
          { value: String(allSiswa.length || 0), label: 'Total Siswa' }
        ]
      };
    } else if (currentRole === 'superadmin') {
      const realGurus = storageService.getSigapGuru ? storageService.getSigapGuru(effectiveBranchId) : [];
      const realSiswa = storageService.getSigapSiswa ? storageService.getSigapSiswa(effectiveBranchId) : [];
      const realKelas = storageService.getSigapKelas ? storageService.getSigapKelas(effectiveBranchId) : [];

      return {
        name: currentBranch.nama || auth?.nama || 'Admin MA',
        role: currentBranch.kode ? `CABANG ${currentBranch.kode}` : 'ADMIN JENJANG',
        subRole: 'Sistem Guru & Admin (SIGAP)',
        avatarBg: '#0284c7',
        avatarText: currentBranch.kode || 'MA',
        stats: [
          { value: String(realGurus.length), label: 'Guru & TU' },
          { value: String(realSiswa.length), label: currentBranch.kode ? `Siswa ${currentBranch.kode}` : 'Siswa' },
          { value: String(realKelas.length), label: 'Rombel' }
        ]
      };
    } else if (currentRole === 'pengampu') {
      const allSantri = storageService.getSantri ? storageService.getSantri(effectiveBranchId) : [];
      const mySantri = allSantri.filter(s => s.halaqahId === auth?.halaqahId || s.pengampuId === auth?.id);
      const setoranCount = (storageService.getSetoran ? storageService.getSetoran(effectiveBranchId) : []).length;
      return {
        name: auth?.nama || 'Wahyudin Hafiz, S.Pd',
        role: 'PENGAMPU TAHFIDZ',
        subRole: auth?.jabatan || 'Koordinator Tahfidz',
        avatarBg: '#10b981',
        avatarText: (auth?.nama || 'WH').slice(0, 2).toUpperCase(),
        stats: [
          { value: String(mySantri.length || allSantri.length), label: 'Santri' },
          { value: String(setoranCount), label: 'Setoran' },
          { value: '1', label: 'Halaqah' }
        ]
      };
    } else {
      const childName = auth?.namaSantri || auth?.username || 'Ananda';
      return {
        name: auth?.nama || ('Wali dari ' + childName),
        role: 'WALI SANTRI',
        subRole: auth?.nis ? `NIS: ${auth.nis}` : 'Orang Tua Santri',
        avatarBg: '#059669',
        avatarText: (childName || 'W').slice(0, 2).toUpperCase(),
        stats: [
          { value: 'Tahfidz', label: 'Program' },
          { value: childName, label: 'Santri' },
          { value: 'Aktif', label: 'Status' }
        ]
      };
    }
  };

  const profile = getProfileData();
  const currentAuth = storageService.getAuthUser();
  const effectiveBranchId = currentAuth?.cabangId || 'cabang-pusat';
  const currentBranch = (storageService.getCabang ? storageService.getCabang() : []).find(c => c.id === effectiveBranchId) || storageService.getActiveBranch() || {};
  const profilePhoto = storageService.getPhotoForUser({
    userId: currentAuth?.id || currentAuth?.nip || currentBranch.id || 'admin-ma',
    userType: currentRole,
    username: currentAuth?.username || (currentRole === 'superadmin' ? 'ma' : currentRole === 'owner' ? 'owner' : ''),
    nip: currentAuth?.nip,
    nama: currentAuth?.nama || currentBranch.nama,
    cabangId: effectiveBranchId
  });

  return (
    <>
      {/* =========================================================================
          FLOATING CURVED NOTCH BOTTOM NAVIGATION BAR (5 TABS: HOME, SISWA, JADWAL, REKAP, LAINNYA)
          ========================================================================= */}
      <nav className="bottom-nav-root no-print" aria-label="Mobile Navigation">
        <div className="bottom-nav-wrapper">
          {/* 1. SLIDING ELEVATED BUBBLE & SMOOTH SCOOP HILL */}
          <div 
            className="bottom-nav-sliding-bubble-track" 
            style={{ 
              width: `${100 / tabs.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
              '--active-theme-color': bubbleThemeColor
            }}
          >
            {/* Seamless SVG Scoop Hill that merges with the white navbar below */}
            <div className="bottom-nav-scoop-container">
              <svg 
                className="bottom-nav-scoop-svg" 
                viewBox="0 0 84 30" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M0 30C16 30 18 0 42 0C66 0 68 30 84 30H0Z" 
                  className="bottom-nav-scoop-fill"
                />
              </svg>
            </div>

            {/* Elevated Circular Bubble with Colored Ring & Icon */}
            <div className="bottom-nav-raised-bubble">
              <div className="bottom-nav-bubble-inner" key={activeTabItem.id + (showDrawer ? '-drawer' : '')}>
                <ActiveIcon size={24} strokeWidth={2.4} color={bubbleThemeColor} />
              </div>
            </div>
          </div>

          {/* 2. THE 5 NAVIGATION TAB BUTTONS */}
          <div className="bottom-nav-items-row">
            {tabs.map((tab, idx) => {
              const isActive = idx === activeIndex;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`bottom-nav-item-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                  aria-label={tab.label}
                >
                  {/* Flat icon slot: only visible when NOT active (when active, icon is inside the elevated bubble) */}
                  <div className="bottom-nav-icon-slot">
                    {!isActive && (
                      <TabIcon size={21} strokeWidth={1.9} className="bottom-nav-inactive-icon" />
                    )}
                  </div>

                  {/* Label text underneath */}
                  <span className="bottom-nav-label-text">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. SLEEK IOS-STYLE HOME INDICATOR BAR AT BOTTOM */}
          <div className="bottom-nav-home-indicator-bar" />
        </div>
      </nav>

      {/* =========================================================================
          SIDEBAR NAVIGATION DRAWER (PERSIS REFERENSI GAMBAR KEDUA: SLIDE DARI KIRI)
          ========================================================================= */}
      {showDrawer && (
        <div className="sidebar-drawer-overlay no-print" onClick={() => setShowDrawer(false)}>
          <div className="sidebar-drawer-panel" onClick={(e) => e.stopPropagation()}>
            {/* 1. TOP BAR DENGAN TOMBOL TUTUP (X), BADGE TENGAH, DAN TOMBOL BANTUAN (?) */}
            <div className="sidebar-drawer-top-bar">
              <button 
                type="button"
                className="sidebar-drawer-circle-btn" 
                onClick={() => setShowDrawer(false)}
                title="Tutup Menu"
              >
                <X size={17} />
              </button>

              <div className="sidebar-drawer-center-pill">
                <span className="pill-dot">●</span>
                <span>{currentRole === 'owner' ? 'TAHFIDZ HUB • OWNER' : currentRole === 'superadmin' ? 'TAHFIDZ HUB • ADMIN' : 'TAHFIDZ HUB'}</span>
              </div>

              <button 
                type="button"
                className="sidebar-drawer-circle-btn" 
                onClick={() => {
                  if (typeof showToast === 'function') showToast("Pusat Bantuan Sistem Tahfidz HUB");
                }}
                title="Bantuan"
              >
                <HelpCircle size={17} />
              </button>
            </div>

            {/* 2. USER PROFILE CARD (PERSIS REFERENSI GAMBAR KEDUA) */}
            <div className="sidebar-drawer-profile-section">
              <div className="sidebar-drawer-profile-header">
                <div 
                  className="sidebar-drawer-avatar"
                  style={{ background: profile.avatarBg, overflow: 'hidden', padding: 0 }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{profile.avatarText}</span>
                  )}
                </div>

                <div className="sidebar-drawer-user-info">
                  <h3 className="sidebar-drawer-user-name">{profile.name}</h3>
                  <div className="sidebar-drawer-user-role">{profile.subRole}</div>
                  <button 
                    type="button" 
                    className="sidebar-drawer-edit-link" 
                    onClick={() => {
                      setShowDrawer(false);
                      onOpenPasswordModal();
                    }}
                  >
                    Ubah Password
                  </button>
                  {onSwitchRole && currentRole === 'orangtua' && (
                    <button 
                      type="button" 
                      className="user-link-sub" 
                      onClick={() => {
                        setShowDrawer(false);
                        onSwitchRole('superadmin');
                      }}
                      style={{ color: '#059669', fontWeight: 800, marginTop: '4px' }}
                    >
                      🛡️ Kembali ke Admin
                    </button>
                  )}
                </div>
              </div>

              {/* 3-COLUMN STATS CARD (PERSIS SEPERTI GAMBAR 2: 23423 Connected | 231 Connecting | 32,434 Connections) */}
              <div className="sidebar-drawer-stats-card">
                {profile.stats.map((stat, sIdx) => (
                  <div key={sIdx} className="sidebar-drawer-stat-col">
                    <div className="stat-number">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MENU LIST (SEMUA MENU SIDEBAR NAVIGATION SESUAI APLIKASI & WARNA BRANDING) */}
            <div className="sidebar-drawer-menu-scroll">
              {/* QUICK MOBILE ROLE SWITCHER (TOUCH-FRIENDLY) */}
              {onSwitchRole && (
                <div style={{
                  background: isDarkMode ? '#1e293b' : '#f8fafc',
                  border: '1px solid ' + (isDarkMode ? '#334155' : '#e2e8f0'),
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Beralih Peran (Mobile)</span>
                    <span style={{ fontSize: '0.66rem', color: '#059669', fontWeight: 700 }}>Aktif: {currentRole}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: currentRole === 'owner' ? '1fr 1fr' : '1fr', gap: '6px' }}>
                    {currentRole === 'owner' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowDrawer(false);
                          onSwitchRole('owner');
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: currentRole === 'owner' ? '2px solid #d97706' : '1px solid #cbd5e1',
                          background: currentRole === 'owner' ? '#fef3c7' : (isDarkMode ? '#0f172a' : '#ffffff'),
                          color: currentRole === 'owner' ? '#92400e' : (isDarkMode ? '#f8fafc' : '#334155'),
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>👑</span>
                        <span>Owner</span>
                      </button>
                    )}

                    {(currentRole === 'owner' || currentRole === 'superadmin') && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDrawer(false);
                            onSwitchRole('superadmin:cabang-pusat');
                          }}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: (currentRole === 'superadmin' && effectiveBranchId === 'cabang-pusat') ? '2px solid #059669' : '1px solid #cbd5e1',
                            background: (currentRole === 'superadmin' && effectiveBranchId === 'cabang-pusat') ? '#ecfdf5' : (isDarkMode ? '#0f172a' : '#ffffff'),
                            color: (currentRole === 'superadmin' && effectiveBranchId === 'cabang-pusat') ? '#065f46' : (isDarkMode ? '#f8fafc' : '#334155'),
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span>🛡️</span>
                          <span>Admin MA</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDrawer(false);
                            onSwitchRole('superadmin:cabang-smp');
                          }}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: (currentRole === 'superadmin' && effectiveBranchId === 'cabang-smp') ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: (currentRole === 'superadmin' && effectiveBranchId === 'cabang-smp') ? '#eff6ff' : (isDarkMode ? '#0f172a' : '#ffffff'),
                            color: (currentRole === 'superadmin' && effectiveBranchId === 'cabang-smp') ? '#1d4ed8' : (isDarkMode ? '#f8fafc' : '#334155'),
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span>🛡️</span>
                          <span>Admin Raudhotul Huffaz</span>
                        </button>
                      </>
                    )}

                    {(currentRole === 'owner' || currentRole === 'pengampu') && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowDrawer(false);
                          onSwitchRole('pengampu');
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: currentRole === 'pengampu' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: currentRole === 'pengampu' ? '#eff6ff' : (isDarkMode ? '#0f172a' : '#ffffff'),
                          color: currentRole === 'pengampu' ? '#1e40af' : (isDarkMode ? '#f8fafc' : '#334155'),
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🏅</span>
                        <span>Pengampu</span>
                      </button>
                    )}

                    {currentRole === 'owner' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowDrawer(false);
                          onSwitchRole('orangtua');
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: currentRole === 'orangtua' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                          background: currentRole === 'orangtua' ? '#faf5ff' : (isDarkMode ? '#0f172a' : '#ffffff'),
                          color: currentRole === 'orangtua' ? '#5b21b6' : (isDarkMode ? '#f8fafc' : '#334155'),
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>👤</span>
                        <span>Wali Santri</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentRole === 'owner' ? (
                <>
                  {/* OWNER PORTAL */}
                  <div className="sidebar-drawer-category">MENU UTAMA YAYASAN</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-dashboard' || activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-dashboard')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Layers size={18} />
                    </div>
                    <span className="menu-text">Dashboard Yayasan</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-cabang' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-cabang')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#0d9488' }}>
                      <Building2 size={18} />
                    </div>
                    <span className="menu-text">Analisis & Kelola Cabang</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-superadmin' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-superadmin')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                      <ShieldCheck size={18} />
                    </div>
                    <span className="menu-text">Akun Super Admin</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-rekap' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-rekap')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <FileText size={18} />
                    </div>
                    <span className="menu-text">Konsolidasi Seluruh Cabang</span>
                  </div>

                  {/* CIVITAS AKADEMIKA */}
                  <div className="sidebar-drawer-category">CIVITAS AKADEMIKA</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-siswa' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-siswa')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <GraduationCap size={18} />
                    </div>
                    <span className="menu-text">Data Siswa (Semua Cabang)</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-guru' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-guru')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#0284c7' }}>
                      <Users size={18} />
                    </div>
                    <span className="menu-text">Data Guru & Pegawai</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-alumni' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-alumni')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <Award size={18} />
                    </div>
                    <span className="menu-text">Data Alumni</span>
                  </div>

                  {/* MANAJEMEN KBM */}
                  <div className="sidebar-drawer-category">MANAJEMEN KBM</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-jadwal' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-jadwal')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <Calendar size={18} />
                    </div>
                    <span className="menu-text">Jadwal</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-lokasi-qr' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-lokasi-qr')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <MapPin size={18} />
                    </div>
                    <span className="menu-text">Lokasi & QR Presensi</span>
                  </div>

                  {/* REKAP & PERIZINAN */}
                  <div className="sidebar-drawer-category">REKAP & PERIZINAN</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-monitoring' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-monitoring')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <ClipboardCheck size={18} />
                    </div>
                    <span className="menu-text">Monitoring & Rekap</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-izin' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-izin')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fff1f2', color: '#e11d48' }}>
                      <CheckSquare size={18} />
                    </div>
                    <span className="menu-text">Persetujuan Izin</span>
                  </div>

                  {/* KEUANGAN & SPP */}
                  <div className="sidebar-drawer-category">KEUANGAN & SPP</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-spp' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-spp')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Receipt size={18} />
                    </div>
                    <span className="menu-text">Pembayaran SPP</span>
                  </div>

                  {/* SISTEM & DATABASE */}
                  <div className="sidebar-drawer-category">SISTEM & DATABASE</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-prisma-studio' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-prisma-studio')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#0d9488' }}>
                      <Database size={18} />
                    </div>
                    <span className="menu-text">Prisma Studio (PostgreSQL)</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-konfigurasi' || activeTab === 'owner-konfigurasi' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-konfigurasi')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <Settings size={18} />
                    </div>
                    <span className="menu-text">Konfigurasi Unit & Akun</span>
                  </div>
                </>
              ) : currentRole === 'superadmin' ? (
                <>
                  {/* DASHBOARD */}
                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-dashboard' || activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-dashboard')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#0d9488' }}>
                      <Home size={18} />
                    </div>
                    <span className="menu-text">Dashboard</span>
                  </div>

                  {/* CIVITAS AKADEMIKA */}
                  <div className="sidebar-drawer-category">CIVITAS AKADEMIKA</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-siswa' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-siswa')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <GraduationCap size={18} />
                    </div>
                    <span className="menu-text">Data Siswa</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-guru' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-guru')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#0284c7' }}>
                      <Users size={18} />
                    </div>
                    <span className="menu-text">Data Guru & Pegawai</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-alumni' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-alumni')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <GraduationCap size={18} />
                    </div>
                    <span className="menu-text">Data Alumni</span>
                  </div>

                  {/* MANAJEMEN KBM */}
                  <div className="sidebar-drawer-category">MANAJEMEN KBM</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-jadwal' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-jadwal')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <Calendar size={18} />
                    </div>
                    <span className="menu-text">Jadwal</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-lokasi-qr' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-lokasi-qr')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fefce8', color: '#ca8a04' }}>
                      <MapPin size={18} />
                    </div>
                    <span className="menu-text">Lokasi & QR Presensi</span>
                  </div>

                  {/* REKAP & PERIZINAN */}
                  <div className="sidebar-drawer-category">REKAP & PERIZINAN</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-monitoring' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-monitoring')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <ClipboardCheck size={18} />
                    </div>
                    <span className="menu-text">Monitoring & Rekap</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-izin' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-izin')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfeff', color: '#0891b2' }}>
                      <CheckSquare size={18} />
                    </div>
                    <span className="menu-text">Persetujuan Izin</span>
                  </div>

                  {/* KEUANGAN & SPP */}
                  <div className="sidebar-drawer-category">KEUANGAN & SPP</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-spp' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-spp')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <Receipt size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="menu-text" style={{ fontWeight: 800 }}>Pembayaran SPP</span>
                      <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>
                        Kelola Tagihan & Kuitansi SPP
                      </small>
                    </div>
                  </div>

                  {/* SISTEM */}
                  <div className="sidebar-drawer-category">SISTEM & DATABASE</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-prisma-studio' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-prisma-studio')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#0d9488' }}>
                      <Database size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="menu-text" style={{ fontWeight: 800 }}>Prisma Studio</span>
                      <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>
                        Visual Database Editor PostgreSQL
                      </small>
                    </div>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-konfigurasi' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-konfigurasi')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                      <Settings size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="menu-text" style={{ fontWeight: 800 }}>Konfigurasi Unit</span>
                      <small style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>
                        Password Pengampu, Jadwal Sesi
                      </small>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ROLE PENGAMPU / ORTU */}
                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('dashboard')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                      <Home size={18} />
                    </div>
                    <span className="menu-text">Dashboard</span>
                  </div>

                  <div className="sidebar-drawer-category">AL-QUR'AN</div>

                  {currentRole !== 'orangtua' && (
                    <div 
                      className={`sidebar-drawer-menu-item ${activeTab === 'mushaf' ? 'active' : ''}`}
                      onClick={() => handleNavigateFromDrawer('mushaf')}
                    >
                      <div className="menu-active-indicator" />
                      <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#059669' }}>
                        <BookOpen size={18} />
                      </div>
                      <span className="menu-text">Mushaf Al-Qur'an</span>
                    </div>
                  )}

                  <div className="sidebar-drawer-category">PRESENSI & KEHADIRAN</div>

                  {currentRole !== 'orangtua' && (
                    <div 
                      className={`sidebar-drawer-menu-item ${activeTab === 'scan' ? 'active' : ''}`}
                      onClick={() => handleNavigateFromDrawer('scan')}
                    >
                      <div className="menu-active-indicator" />
                      <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <QrCode size={18} />
                      </div>
                      <span className="menu-text">Scan Presensi</span>
                    </div>
                  )}

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'riwayat-presensi' || activeTab === 'riwayat-presensi-santri' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('riwayat-presensi-santri')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <ClipboardCheck size={18} />
                    </div>
                    <span className="menu-text">Riwayat Presensi Santri</span>
                  </div>

                  {currentRole !== 'orangtua' && (
                    <>
                      <div 
                        className={`sidebar-drawer-menu-item ${activeTab === 'riwayat-presensi-pengampu' ? 'active' : ''}`}
                        onClick={() => handleNavigateFromDrawer('riwayat-presensi-pengampu')}
                      >
                        <div className="menu-active-indicator" />
                        <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#0d9488' }}>
                          <UserCheck size={18} />
                        </div>
                        <span className="menu-text">Riwayat Presensi Pengampu</span>
                      </div>

                      <div 
                        className={`sidebar-drawer-menu-item ${activeTab === 'izin' ? 'active' : ''}`}
                        onClick={() => handleNavigateFromDrawer('izin')}
                      >
                        <div className="menu-active-indicator" />
                        <div className="menu-icon-box" style={{ background: '#fefce8', color: '#ca8a04' }}>
                          <FileText size={18} />
                        </div>
                        <span className="menu-text">Permohonan Izin</span>
                      </div>
                    </>
                  )}

                  <div className="sidebar-drawer-category">AKADEMIK</div>

                  {currentRole === 'orangtua' && (
                    <div 
                      className={`sidebar-drawer-menu-item ${activeTab === 'hafalan-santri' ? 'active' : ''}`}
                      onClick={() => handleNavigateFromDrawer('hafalan-santri')}
                    >
                      <div className="menu-active-indicator" />
                      <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                        <BookOpen size={18} />
                      </div>
                      <span className="menu-text">Hafalan Santri</span>
                    </div>
                  )}

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'santri' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('santri')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <GraduationCap size={18} />
                    </div>
                    <span className="menu-text">{currentRole === 'orangtua' ? 'Progress Ananda' : 'Daftar Santri'}</span>
                  </div>

                  {currentRole !== 'orangtua' && (
                    <>
                      <div 
                        className={`sidebar-drawer-menu-item ${activeTab === 'presensi-santri' ? 'active' : ''}`}
                        onClick={() => handleNavigateFromDrawer('presensi-santri')}
                      >
                        <div className="menu-active-indicator" />
                        <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#0d9488' }}>
                          <ClipboardCheck size={18} />
                        </div>
                        <span className="menu-text">Presensi Santri</span>
                      </div>

                      <div 
                        className={`sidebar-drawer-menu-item ${activeTab === 'setoran' ? 'active' : ''}`}
                        onClick={() => handleNavigateFromDrawer('setoran')}
                      >
                        <div className="menu-active-indicator" />
                        <div className="menu-icon-box" style={{ background: '#ecfeff', color: '#0284c7' }}>
                          <BookOpen size={18} />
                        </div>
                        <span className="menu-text">Catatan Setoran</span>
                      </div>
                    </>
                  )}

                  <div className="sidebar-drawer-category">LAPORAN</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'rapor' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('rapor')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
                      <FileCheck2 size={18} />
                    </div>
                    <span className="menu-text">Laporan dan Raport</span>
                  </div>
                </>
              )}
            </div>

            {/* 4. DRAWER FOOTER: TEMA, LOGOUT & APP VERSION (PERSIS SEPERTI GAMBAR 2) */}
            <div className="sidebar-drawer-footer">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                <button 
                  type="button"
                  className="sidebar-drawer-action-btn"
                  onClick={onToggleDarkMode}
                  title="Ganti Tema"
                >
                  {isDarkMode ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
                  <span>{isDarkMode ? 'Terang' : 'Gelap'}</span>
                </button>

                <button 
                  type="button"
                  className="sidebar-drawer-action-btn"
                  onClick={() => {
                    setShowDrawer(false);
                    onOpenPasswordModal();
                  }}
                  title="Ubah Sandi"
                >
                  <KeyRound size={15} color="#0d9488" />
                  <span>Sandi</span>
                </button>

                <button 
                  type="button"
                  className="sidebar-drawer-action-btn"
                  onClick={() => {
                    setShowDrawer(false);
                    window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
                  }}
                  style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46', fontWeight: 700 }}
                  title="Install Aplikasi TahfidzHub"
                >
                  <Download size={15} color="#059669" />
                  <span>Install</span>
                </button>
              </div>

              {/* LOGOUT BUTTON (MIRIP ICON LOGOUT CYAN PADA GAMBAR 2) */}
              <button 
                type="button"
                className="sidebar-drawer-logout-btn"
                onClick={() => {
                  setShowDrawer(false);
                  onSignOut();
                }}
              >
                <div className="logout-icon-box">
                  <LogOut size={16} />
                </div>
                <span>Logout</span>
              </button>

              {/* APP VERSION TAG */}
              <div className="sidebar-drawer-version-tag">
                v2.4.0 • Tahfidz HUB Multi-Branch
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
