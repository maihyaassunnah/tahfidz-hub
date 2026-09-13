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
  Database
} from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  currentRole,
  onSignOut,
  onOpenPasswordModal,
  isDarkMode,
  onToggleDarkMode,
  showToast
}) {
  const [showDrawer, setShowDrawer] = useState(false);

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
          label: 'Home',
          icon: Home,
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
          id: 'superadmin',
          label: 'Admin',
          icon: Shield,
          targetTab: 'owner-superadmin',
          matches: ['owner-superadmin']
        },
        {
          id: 'rekap',
          label: 'Rekap',
          icon: ClipboardCheck,
          targetTab: 'owner-rekap',
          matches: ['owner-rekap']
        },
        {
          id: 'more',
          label: 'Lainnya',
          icon: LayoutGrid,
          targetTab: 'more',
          isMoreTrigger: true,
          matches: ['more', 'sigap-siswa', 'sigap-guru', 'sigap-kelas', 'sigap-lokasi-qr', 'sigap-monitoring']
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
      // Orang Tua / Wali
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
          id: 'progres',
          label: 'Progres',
          icon: GraduationCap,
          targetTab: 'santri',
          matches: ['santri']
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
          matches: ['more', 'rapor', 'izin', 'riwayat-presensi', 'riwayat-presensi-santri', 'riwayat-presensi-pengampu']
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
      setActiveTab(tab.targetTab);
      setShowDrawer(false);
    }
  };

  const handleNavigateFromDrawer = (targetTab) => {
    setActiveTab(targetTab);
    setShowDrawer(false);
  };

  // Color theme
  const bubbleThemeColor = currentRole === 'owner' ? '#d97706' : currentRole === 'superadmin' ? '#0d9488' : '#10b981';

  // Get user profile details
  const getProfileData = () => {
    if (currentRole === 'owner') {
      return {
        name: 'Pimpinan Yayasan',
        role: 'EXECUTIVE OWNER',
        subRole: 'Pusat Yayasan & Multi-Cabang',
        avatarBg: '#d97706',
        avatarText: '👑',
        stats: [
          { value: '3', label: 'Cabang' },
          { value: '3', label: 'Super Admin' },
          { value: 'Multi', label: 'Tenant' }
        ]
      };
    } else if (currentRole === 'superadmin') {
      return {
        name: 'Admin MA',
        role: 'ADMIN JENJANG',
        subRole: 'Sistem Guru & Admin (SIGAP)',
        avatarBg: '#0284c7',
        avatarText: 'MA',
        stats: [
          { value: '15', label: 'Guru & TU' },
          { value: '20', label: 'Siswa MA' },
          { value: '6', label: 'Rombel' }
        ]
      };
    } else if (currentRole === 'pengampu') {
      return {
        name: 'Wahyudin Hafiz, S.Pd',
        role: 'PENGAMPU TAHFIDZ',
        subRole: 'Koordinator & Musyrif X A',
        avatarBg: '#10b981',
        avatarText: 'WH',
        stats: [
          { value: '10', label: 'Santri' },
          { value: '386', label: 'Setoran' },
          { value: '1', label: 'Halaqah' }
        ]
      };
    } else {
      return {
        name: 'H. Akbar Sasmita',
        role: 'WALI SANTRI',
        subRole: 'Orang Tua Jamiatul Akbar',
        avatarBg: '#059669',
        avatarText: 'AS',
        stats: [
          { value: 'Juz 30', label: 'Hafalan' },
          { value: '98%', label: 'Presensi' },
          { value: 'Mumtaz', label: 'Predikat' }
        ]
      };
    }
  };

  const profile = getProfileData();

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
                  style={{ background: profile.avatarBg }}
                >
                  <span>{profile.avatarText}</span>
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
              {currentRole === 'owner' ? (
                <>
                  {/* OWNER PORTAL */}
                  <div className="sidebar-drawer-category">PORTAL UTAMA OWNER</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-dashboard' || activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-dashboard')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Layers size={18} />
                    </div>
                    <span className="menu-text">Dashboard Multi-Cabang</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-cabang' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-cabang')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#0d9488' }}>
                      <Building2 size={18} />
                    </div>
                    <span className="menu-text">Kelola Cabang Lembaga</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-superadmin' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-superadmin')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <ShieldCheck size={18} />
                    </div>
                    <span className="menu-text">Akun Super Admin Cabang</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'owner-rekap' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('owner-rekap')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <FileText size={18} />
                    </div>
                    <span className="menu-text">Konsolidasi Data</span>
                  </div>

                  <div className="sidebar-drawer-category">INSPEKSI DATA CABANG</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-siswa' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-siswa')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <GraduationCap size={18} />
                    </div>
                    <span className="menu-text">Data Siswa Cabang</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-guru' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-guru')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#eff6ff', color: '#0284c7' }}>
                      <Users size={18} />
                    </div>
                    <span className="menu-text">Data Guru Cabang</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-kelas' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-kelas')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fefce8', color: '#ca8a04' }}>
                      <Building2 size={18} />
                    </div>
                    <span className="menu-text">Data Kelas Cabang</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-lokasi-qr' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-lokasi-qr')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fef2f2', color: '#e11d48' }}>
                      <MapPin size={18} />
                    </div>
                    <span className="menu-text">Lokasi & QR Presensi</span>
                  </div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'sigap-monitoring' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('sigap-monitoring')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#ecfdf5', color: '#047857' }}>
                      <ClipboardCheck size={18} />
                    </div>
                    <span className="menu-text">Rekap Monitoring</span>
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
                    <span className="menu-text">Lokasi & QR Kelas</span>
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

                  <div className="sidebar-drawer-category">AKADEMIK</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'santri' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('santri')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <GraduationCap size={18} />
                    </div>
                    <span className="menu-text">{currentRole === 'orangtua' ? 'Progres Ananda' : 'Daftar Santri'}</span>
                  </div>

                  {currentRole !== 'orangtua' && (
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
                  )}

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

                  <div className="sidebar-drawer-category">LAPORAN</div>

                  <div 
                    className={`sidebar-drawer-menu-item ${activeTab === 'rapor' ? 'active' : ''}`}
                    onClick={() => handleNavigateFromDrawer('rapor')}
                  >
                    <div className="menu-active-indicator" />
                    <div className="menu-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
                      <FileCheck2 size={18} />
                    </div>
                    <span className="menu-text">Laporan & Rapor</span>
                  </div>
                </>
              )}
            </div>

            {/* 4. DRAWER FOOTER: TEMA, LOGOUT & APP VERSION (PERSIS SEPERTI GAMBAR 2) */}
            <div className="sidebar-drawer-footer">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button 
                  type="button"
                  className="sidebar-drawer-action-btn"
                  onClick={onToggleDarkMode}
                  title="Ganti Tema"
                >
                  {isDarkMode ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#6366f1" />}
                  <span>{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
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
