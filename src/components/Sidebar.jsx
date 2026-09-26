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
  ChevronUp,
  Database,
  Receipt,
  Lock,
  Download,
  TrendingUp,
  Award,
  X
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

  // Mobile Slide-over Drawer State
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleOpen = () => setIsMobileOpen(true);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('toggle_mobile_sidebar', handleToggle);
    window.addEventListener('open_mobile_sidebar', handleOpen);
    window.addEventListener('close_mobile_sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle_mobile_sidebar', handleToggle);
      window.removeEventListener('open_mobile_sidebar', handleOpen);
      window.removeEventListener('close_mobile_sidebar', handleClose);
    };
  }, []);

  const closeMobileIfOpen = () => {
    if (window.innerWidth <= 850) {
      setIsMobileOpen(false);
    }
  };

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    closeMobileIfOpen();
  };

  // Sub-menu Pengaturan State & Sync
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(true);
  const [activePengaturanSubTab, setActivePengaturanSubTab] = useState(() => {
    return localStorage.getItem('simtah_active_pengaturan_subtab') || 'pengampu-akun';
  });

  // STATE & SUB-MENU: PUSAT KONTROL CABANG & ANALITIK (OWNER)
  const [isKontrolCabangOpen, setIsKontrolCabangOpen] = useState(true);
  const [activeOwnerMetricTab, setActiveOwnerMetricTab] = useState(() => {
    return localStorage.getItem('simtah_active_owner_metric_tab') || 'spp';
  });

  const [metricBadges, setMetricBadges] = useState({
    spp: '63%',
    tahfidz: '1.0 Juz',
    kehadiran: '95%',
    sdm: '25 Santri',
    scorecard: 'Terpadu'
  });

  const isKontrolCabangActive = activeTab === 'owner-dashboard' || activeTab === 'dashboard' || activeTab === 'sigap-dashboard';

  useEffect(() => {
    if (isKontrolCabangActive) {
      setIsKontrolCabangOpen(true);
    }
  }, [isKontrolCabangActive]);

  useEffect(() => {
    const handleMetricTabUpdate = (e) => {
      if (e.detail) {
        setActiveOwnerMetricTab(e.detail);
        localStorage.setItem('simtah_active_owner_metric_tab', e.detail);
      }
    };
    const handleStatsUpdate = (e) => {
      if (e.detail) {
        setMetricBadges(prev => ({
          ...prev,
          spp: e.detail.sppBadge || prev.spp,
          tahfidz: e.detail.tahfidzBadge || prev.tahfidz,
          kehadiran: e.detail.kehadiranBadge || prev.kehadiran,
          sdm: e.detail.sdmBadge || prev.sdm,
          scorecard: e.detail.scorecardBadge || prev.scorecard
        }));
      }
    };
    window.addEventListener('owner_open_metric_tab', handleMetricTabUpdate);
    window.addEventListener('owner_analytics_stats_updated', handleStatsUpdate);
    return () => {
      window.removeEventListener('owner_open_metric_tab', handleMetricTabUpdate);
      window.removeEventListener('owner_analytics_stats_updated', handleStatsUpdate);
    };
  }, []);

  const OWNER_METRIC_SUB_MENUS = [
    { id: 'spp', label: 'Keuangan & SPP', icon: Receipt, badge: metricBadges.spp },
    { id: 'tahfidz', label: 'Progres Tahfidz', icon: BookOpen, badge: metricBadges.tahfidz },
    { id: 'kehadiran', label: 'Presensi KBM (7 Hari)', icon: TrendingUp, badge: metricBadges.kehadiran },
    { id: 'sdm', label: 'Populasi & Rasio SDM', icon: Users, badge: metricBadges.sdm },
    { id: 'scorecard', label: 'Matriks Skor Komparasi', icon: Award, badge: metricBadges.scorecard },
  ];

  const handleSelectOwnerMetricSubTab = (metricId) => {
    setActiveOwnerMetricTab(metricId);
    localStorage.setItem('simtah_active_owner_metric_tab', metricId);
    setActiveTab('owner-dashboard');
    setIsKontrolCabangOpen(true);
    window.dispatchEvent(new CustomEvent('owner_open_metric_tab', { detail: metricId }));
    closeMobileIfOpen();
  };

  const isPengaturanActive = activeTab === 'owner-konfigurasi' || activeTab === 'sigap-konfigurasi';

  useEffect(() => {
    if (isPengaturanActive) {
      setIsPengaturanOpen(true);
    }
  }, [isPengaturanActive]);

  useEffect(() => {
    const handleSubTabUpdate = (e) => {
      if (e.detail) {
        setActivePengaturanSubTab(e.detail);
        localStorage.setItem('simtah_active_pengaturan_subtab', e.detail);
      }
    };
    window.addEventListener('sigap_open_pengaturan_tab', handleSubTabUpdate);
    return () => window.removeEventListener('sigap_open_pengaturan_tab', handleSubTabUpdate);
  }, []);

  const PENGATURAN_SUB_MENUS = [
    { id: 'pengampu-akun', label: 'Akun Pegawai', icon: Users, badge: 'Pegawai' },
    { id: 'foto-profil', label: 'Foto Profil', icon: Camera },
    { id: 'jadwal-sesi', label: 'Jadwal Sesi', icon: Clock },
    { id: 'tambah-siswa', label: 'Data Siswa', icon: GraduationCap },
    { id: 'template-rapor', label: 'Format Rapor', icon: FileCheck2 },
    { id: 'lembaga', label: 'Lembaga', icon: Building2 },
    { id: 'backup', label: 'Backup Data', icon: Database },
  ];

  const handleSelectPengaturanSubTab = (subTabId, targetMainTab = 'owner-konfigurasi') => {
    setActivePengaturanSubTab(subTabId);
    localStorage.setItem('simtah_active_pengaturan_subtab', subTabId);
    setActiveTab(targetMainTab);
    setIsPengaturanOpen(true);
    window.dispatchEvent(new CustomEvent('sigap_open_pengaturan_tab', { detail: subTabId }));
    if (subTabId === 'foto-profil') {
      window.dispatchEvent(new CustomEvent('sigap_open_foto_profil'));
    }
    closeMobileIfOpen();
  };

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
  // 0. TAMPILAN KHUSUS OWNER (PORTAL YAYASAN & MULTI-CABANG)
  // SELALU TAMPIL BERSIH, SEDERHANA, DAN EKSEKUTIF
  // =========================================================
  if (currentRole === 'owner') {
    const activeBranch = storageService.getActiveBranch();
    const ownerPhoto = storageService.getPhotoForUser({ userId: 'owner', userType: 'superadmin', username: 'owner' });

    return (
      <>
        {isMobileOpen && (
          <div 
            className="sigap-sidebar-backdrop is-mobile-open"
            onClick={() => setIsMobileOpen(false)}
            title="Tutup Menu"
          />
        )}
        <aside className={`sigap-sidebar sigap-sidebar-owner no-print ${isMobileOpen ? 'is-mobile-open' : ''}`}>
          {/* Mobile Close Button */}
          <button 
            type="button" 
            className="sidebar-mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            title="Tutup Menu"
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        {/* BRAND LOGO HEADER: TAHFIDZ HUB OWNER (PERSIS GAYA "Lecture .") */}
        <div className="sigap-brand" style={{ padding: '22px 18px 14px 18px', borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              className="sigap-logo-box" 
              style={{ 
                background: 'transparent', 
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                overflow: 'hidden',
                width: '42px',
                height: '42px',
                flexShrink: 0
              }}
            >
              <img 
                src="/logo.png" 
                alt="Tahfidz HUB" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }} 
              />
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
              marginTop: '10px', 
              padding: '6px 10px', 
              background: isDarkMode ? '#0f172a' : '#fffbeb', 
              borderRadius: '12px', 
              border: isDarkMode ? '1.5px solid #d97706' : '1.5px solid #fde68a',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <MapPin size={13} color="#d97706" style={{ flexShrink: 0 }} />
            
            {cabangList && cabangList.length > 0 ? (
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', position: 'relative' }}>
                <select 
                  className="sigap-branch-select-clean"
                  value={activeBranchId || activeBranch?.id || 'ALL'} 
                  onChange={(e) => onSwitchBranch && onSwitchBranch(e.target.value)}
                  style={{ color: isDarkMode ? '#fbbf24' : '#b45309' }}
                  title="Pilih Cabang untuk Diinspeksi"
                >
                  <option value="ALL">🌐 Semua Cabang</option>
                  {cabangList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nama} ({c.kode})
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} color="#d97706" style={{ position: 'absolute', right: 0, pointerEvents: 'none', flexShrink: 0 }} />
              </div>
            ) : (
              <strong style={{ color: activeBranch?.warnaAksen || '#d97706', fontSize: '0.72rem' }}>
                {activeBranch?.kode || 'MA-PUSAT'}
              </strong>
            )}
          </div>
        </div>

        {/* DAFTAR MENU EKSEKUTIF OWNER (SEDERHANA, MINIMALIS & INFORMATIF) */}
        <div className="sigap-menu-scroll" style={{ padding: '8px 12px' }}>
          <div className="sigap-section-divider" style={{ marginTop: '4px' }}>
            <span className="sigap-section-title">PUSAT KENDALI YAYASAN</span>
            <div className="sigap-section-line"></div>
          </div>

          {/* 1. PUSAT KONTROL CABANG & SUB-MENU METRIK ANALITIK */}
          <div>
            <div 
              className={`sigap-nav-item ${isKontrolCabangActive ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('owner-dashboard');
                setIsKontrolCabangOpen(prev => !prev);
              }}
              style={{ 
                marginBottom: isKontrolCabangOpen ? '4px' : '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} className="sigap-nav-icon" />
                <span>Pusat Kontrol Cabang</span>
              </div>
              {isKontrolCabangOpen ? (
                <ChevronUp size={15} style={{ opacity: 0.7 }} />
              ) : (
                <ChevronDown size={15} style={{ opacity: 0.7 }} />
              )}
            </div>

            {/* SUB MENU ACCORDION: KEUANGAN, TAHFIDZ, PRESENSI, SDM, SCORECARD */}
            {isKontrolCabangOpen && (
              <div 
                style={{
                  margin: '0 14px 10px 28px',
                  paddingLeft: '12px',
                  borderLeft: isDarkMode ? '2px solid #334155' : '2px solid #ffdcd3',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                {OWNER_METRIC_SUB_MENUS.map(sub => {
                  const SubIcon = sub.icon;
                  const isSubActive = isKontrolCabangActive && activeOwnerMetricTab === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectOwnerMetricSubTab(sub.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: isSubActive ? 800 : 600,
                        color: isSubActive 
                          ? '#ff5b35' 
                          : (isDarkMode ? '#94a3b8' : '#475569'),
                        background: isSubActive 
                          ? (isDarkMode ? '#1e293b' : '#fff7f5') 
                          : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubActive) {
                          e.currentTarget.style.color = '#ff5b35';
                          e.currentTarget.style.background = isDarkMode ? 'rgba(255, 91, 53, 0.08)' : '#fff7f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubActive) {
                          e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SubIcon size={14} color={isSubActive ? '#ff5b35' : (isDarkMode ? '#64748b' : '#94a3b8')} />
                        <span>{sub.label}</span>
                      </div>
                      {sub.badge && (
                        <span 
                          style={{
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '6px',
                            background: isSubActive ? '#ff5b35' : (isDarkMode ? '#334155' : '#fed7aa'),
                            color: isSubActive ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#b45309')
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. KELOLA CABANG & SUPER ADMIN */}
          <div 
            className={`sigap-nav-item ${activeTab === 'owner-cabang' || activeTab === 'owner-superadmin' ? 'active' : ''}`}
            onClick={() => selectTab('owner-cabang')}
            style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} className="sigap-nav-icon" />
              <span>Manajemen Cabang</span>
            </div>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '10px',
              background: isDarkMode ? '#1e293b' : '#ede9fe',
              color: '#7c3aed'
            }}>
              {cabangList?.length || 2} Unit
            </span>
          </div>

          {/* 3. KEUANGAN & SPP GLOBAL */}
          <div 
            className={`sigap-nav-item ${activeTab === 'owner-spp' || activeTab === 'sigap-spp' ? 'active' : ''}`}
            onClick={() => selectTab('owner-spp')}
            style={{ marginBottom: '6px' }}
          >
            <Receipt size={18} className="sigap-nav-icon" />
            <span>Keuangan & SPP Global</span>
          </div>

          {/* 4. PENGATURAN YAYASAN & SUB-MENU AKUN PEGAWAI DLL */}
          <div>
            <div 
              className={`sigap-nav-item ${activeTab === 'sigap-konfigurasi' || activeTab === 'owner-konfigurasi' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('owner-konfigurasi');
                setIsPengaturanOpen(prev => !prev);
              }}
              style={{ 
                marginBottom: isPengaturanOpen ? '4px' : '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} className="sigap-nav-icon" />
                <span>Pengaturan Yayasan</span>
              </div>
              {isPengaturanOpen ? (
                <ChevronUp size={15} style={{ opacity: 0.7 }} />
              ) : (
                <ChevronDown size={15} style={{ opacity: 0.7 }} />
              )}
            </div>

            {/* SUB MENU ACCORDION: AKUN PEGAWAI DLL */}
            {isPengaturanOpen && (
              <div 
                style={{
                  margin: '0 14px 10px 28px',
                  paddingLeft: '12px',
                  borderLeft: isDarkMode ? '2px solid #334155' : '2px solid #ffdcd3',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                {PENGATURAN_SUB_MENUS.map(sub => {
                  const SubIcon = sub.icon;
                  const isSubActive = (activeTab === 'owner-konfigurasi' || activeTab === 'sigap-konfigurasi') && activePengaturanSubTab === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectPengaturanSubTab(sub.id, 'owner-konfigurasi')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: isSubActive ? 800 : 600,
                        color: isSubActive 
                          ? '#ff5b35' 
                          : (isDarkMode ? '#94a3b8' : '#475569'),
                        background: isSubActive 
                          ? (isDarkMode ? '#1e293b' : '#fff7f5') 
                          : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubActive) {
                          e.currentTarget.style.color = '#ff5b35';
                          e.currentTarget.style.background = isDarkMode ? 'rgba(255, 91, 53, 0.08)' : '#fff7f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubActive) {
                          e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <SubIcon size={14} color={isSubActive ? '#ff5b35' : (isDarkMode ? '#64748b' : '#94a3b8')} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.label}
                        </span>
                      </div>
                      {sub.badge && (
                        <span 
                          style={{
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '6px',
                            background: isSubActive ? '#ff5b35' : (isDarkMode ? '#334155' : '#fed7aa'),
                            color: isSubActive ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#b45309')
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
            onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))} 
            title="Install Aplikasi PWA (Desktop/HP)"
          >
            <Download size={17} />
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
    </>
    );
  }

  // =========================================================
  // =========================================================
  // 1. TAMPILAN KHUSUS SUPER ADMIN / KETIKA OWNER MEMILIH SATU CABANG
  // =========================================================
  if (currentRole === 'superadmin') {
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
      <>
        {isMobileOpen && (
          <div 
            className="sigap-sidebar-backdrop is-mobile-open"
            onClick={() => setIsMobileOpen(false)}
            title="Tutup Menu"
          />
        )}
        <aside className={`sigap-sidebar no-print ${isMobileOpen ? 'is-mobile-open' : ''}`}>
          {/* Mobile Close Button */}
          <button 
            type="button" 
            className="sidebar-mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
            title="Tutup Menu"
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        {/* BRAND LOGO HEADER: TAHFIDZ HUB SUPER ADMIN */}
        <div className="sigap-brand">
          <div 
            className="sigap-logo-box"
            style={{ 
              background: 'transparent',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.28)',
              borderRadius: '12px',
              overflow: 'hidden',
              width: '42px',
              height: '42px',
              flexShrink: 0
            }}
          >
            <img 
              src="/logo.png" 
              alt="Tahfidz HUB" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', display: 'block' }} 
            />
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
                marginTop: '10px', 
                padding: '6px 10px', 
                background: isDarkMode ? '#0f172a' : '#ffffff', 
                borderRadius: '12px', 
                border: isDarkMode ? '1.5px solid #10b981' : '1.5px solid #10b981',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              <MapPin size={13} color="#10b981" style={{ flexShrink: 0 }} />
              
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', position: 'relative' }}>
                <select 
                  className="sigap-branch-select-clean"
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
                  style={{ color: isDarkMode ? '#34d399' : '#047857' }}
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
                <ChevronDown size={13} color="#10b981" style={{ position: 'absolute', right: 0, pointerEvents: 'none', flexShrink: 0 }} />
              </div>
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
            onClick={() => selectTab('sigap-dashboard')}
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
            onClick={() => selectTab('sigap-siswa')}
          >
            <GraduationCap size={18} className="sigap-nav-icon" />
            <span>Data Siswa</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-guru' ? 'active' : ''}`}
            onClick={() => selectTab('sigap-guru')}
          >
            <Users size={18} className="sigap-nav-icon" />
            <span>Data Guru & Pegawai</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-alumni' ? 'active' : ''}`}
            onClick={() => selectTab('sigap-alumni')}
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
            onClick={() => selectTab('sigap-jadwal')}
          >
            <Calendar size={18} className="sigap-nav-icon" />
            <span>Jadwal</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-lokasi-qr' ? 'active' : ''}`}
            onClick={() => selectTab('sigap-lokasi-qr')}
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
            onClick={() => selectTab('sigap-monitoring')}
          >
            <ClipboardCheck size={18} className="sigap-nav-icon" />
            <span>Monitoring & Rekap</span>
          </div>

          <div 
            className={`sigap-nav-item ${activeTab === 'sigap-izin' ? 'active' : ''}`}
            onClick={() => selectTab('sigap-izin')}
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
            onClick={() => selectTab('sigap-spp')}
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
            onClick={() => selectTab('sigap-prisma-studio')}
          >
            <Database size={18} className="sigap-nav-icon" />
            <span>Prisma Studio</span>
          </div>

          <div>
            <div 
              className={`sigap-nav-item ${activeTab === 'sigap-konfigurasi' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('sigap-konfigurasi');
                setIsPengaturanOpen(prev => !prev);
              }}
              style={{ 
                marginBottom: isPengaturanOpen ? '4px' : '6px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                cursor: 'pointer' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} className="sigap-nav-icon" />
                <span>Konfigurasi Unit</span>
              </div>
              {isPengaturanOpen ? (
                <ChevronUp size={15} style={{ opacity: 0.7 }} />
              ) : (
                <ChevronDown size={15} style={{ opacity: 0.7 }} />
              )}
            </div>

            {isPengaturanOpen && (
              <div 
                style={{
                  margin: '0 14px 10px 28px',
                  paddingLeft: '12px',
                  borderLeft: isDarkMode ? '2px solid #334155' : '2px solid #a7f3d0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                {PENGATURAN_SUB_MENUS.map(sub => {
                  const SubIcon = sub.icon;
                  const isSubActive = activeTab === 'sigap-konfigurasi' && activePengaturanSubTab === sub.id;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectPengaturanSubTab(sub.id, 'sigap-konfigurasi')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: isSubActive ? 800 : 600,
                        color: isSubActive ? '#059669' : (isDarkMode ? '#94a3b8' : '#475569'),
                        background: isSubActive ? (isDarkMode ? '#1e293b' : '#ecfdf5') : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubActive) {
                          e.currentTarget.style.color = '#059669';
                          e.currentTarget.style.background = isDarkMode ? 'rgba(16, 185, 129, 0.08)' : '#ecfdf5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubActive) {
                          e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569';
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <SubIcon size={14} color={isSubActive ? '#059669' : (isDarkMode ? '#64748b' : '#94a3b8')} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.label}
                        </span>
                      </div>
                      {sub.badge && (
                        <span 
                          style={{
                            fontSize: '0.58rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '6px',
                            background: isSubActive ? '#059669' : (isDarkMode ? '#334155' : '#dcfce7'),
                            color: isSubActive ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#15803d')
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
            className="sigap-bottom-icon-btn" 
            onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))} 
            title="Install Aplikasi PWA (Desktop/HP)"
          >
            <Download size={17} />
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
    </>
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
    <>
      {isMobileOpen && (
        <div 
          className="sigap-sidebar-backdrop is-mobile-open"
          onClick={() => setIsMobileOpen(false)}
          title="Tutup Menu"
        />
      )}
      <aside className={`simtah-sidebar no-print ${isMobileOpen ? 'is-mobile-open' : ''}`}>
        {/* Mobile Close Button */}
        <button 
          type="button" 
          className="sidebar-mobile-close-btn"
          onClick={() => setIsMobileOpen(false)}
          title="Tutup Menu"
          aria-label="Tutup Menu"
        >
          <X size={18} />
        </button>
      {/* Brand Logo: Tahfidz HUB */}
      <div className="sidebar-brand">
        <div 
          className="brand-icon-geom"
          style={{
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            overflow: 'hidden',
            width: '38px',
            height: '38px',
            flexShrink: 0
          }}
        >
          <img 
            src="/logo.png" 
            alt="Tahfidz HUB" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', display: 'block' }} 
          />
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
            onClick={() => selectTab('mushaf')}
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
          onClick={() => selectTab('dashboard')}
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
            onClick={() => selectTab('scan')}
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
          onClick={() => selectTab('riwayat-presensi-santri')}
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
              onClick={() => selectTab('riwayat-presensi-pengampu')}
            >
              <div className="nav-item-left">
                <UserCheck size={18} className="nav-icon" />
                <span>Riwayat Presensi Pengampu</span>
              </div>
              {activeTab === 'riwayat-presensi-pengampu' && <ChevronRight size={16} className="nav-chevron" />}
            </div>

            <div 
              className={`nav-item ${activeTab === 'izin' ? 'active' : ''}`}
              onClick={() => selectTab('izin')}
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
            onClick={() => selectTab('hafalan-santri')}
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
          onClick={() => selectTab('santri')}
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
              onClick={() => selectTab('presensi-santri')}
            >
              <div className="nav-item-left">
                <ClipboardCheck size={18} className="nav-icon" />
                <span>Presensi Santri</span>
              </div>
              {activeTab === 'presensi-santri' && <ChevronRight size={16} className="nav-chevron" />}
            </div>

            <div 
              className={`nav-item ${activeTab === 'setoran' ? 'active' : ''}`}
              onClick={() => selectTab('setoran')}
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
          onClick={() => selectTab('rapor')}
        >
          <div className="nav-item-left">
            <FileCheck2 size={18} className="nav-icon" />
            <span>Laporan dan Raport</span>
          </div>
          {activeTab === 'rapor' && <ChevronRight size={16} className="nav-chevron" />}
        </div>
      </div>

      {/* Bottom Sign Out & Install */}
      <div className="sidebar-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          type="button" 
          className="btn-pwa-install" 
          onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid #10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            fontSize: '0.80rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Download size={15} />
          <span>Install Aplikasi</span>
        </button>

        <button className="btn-signout" onClick={onSignOut}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  </>
  );
}
