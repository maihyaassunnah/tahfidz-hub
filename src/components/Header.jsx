import React, { useState, useEffect } from 'react';
import { Moon, Sun, Shield, Award, User, BookOpen, Building2, MapPin, LogOut, Lock } from 'lucide-react';
import { storageService } from '../services/storage';
import TahfidzHubLogo from './TahfidzHubLogo';

export default function Header({ 
  activeTab, 
  currentRole, 
  authUser,
  onSignOut,
  isDarkMode, 
  onToggleDarkMode,
  activeBranchId,
  onSwitchBranch,
  cabangList = [],
  onSwitchRole
}) {
  const [photoUpdateTrigger, setPhotoUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setPhotoUpdateTrigger(prev => prev + 1);
    window.addEventListener('tahfidz_foto_profil_updated', handleUpdate);
    return () => window.removeEventListener('tahfidz_foto_profil_updated', handleUpdate);
  }, []);

  const dynamicPhoto = storageService.getPhotoForUser({
    userId: authUser?.id || authUser?.nip || (currentRole === 'superadmin' ? 'admin-ma' : currentRole === 'owner' ? 'owner' : ''),
    userType: currentRole,
    username: authUser?.username,
    nip: authUser?.nip,
    nama: authUser?.nama
  });

  const getTabTitle = () => {
    const activeBranch = cabangList?.find(c => c.id === activeBranchId);
    const branchSuffix = (activeBranch && activeBranchId !== 'ALL') ? ` (${activeBranch.nama})` : '';

    if (currentRole === 'owner') {
      if (!activeBranchId || activeBranchId === 'ALL') {
        switch (activeTab) {
          case 'owner-dashboard':
          case 'dashboard': return '👑 Tahfidz HUB • Dashboard Yayasan .';
          case 'owner-cabang': return '👑 Tahfidz HUB • Analisis & Kelola Cabang .';
          case 'owner-rekap': return '👑 Tahfidz HUB • Konsolidasi Seluruh Cabang .';
          case 'sigap-siswa': return '👑 Tahfidz HUB • Data Siswa (Semua Cabang) .';
          case 'sigap-guru': return '👑 Tahfidz HUB • Data Guru & Pegawai (Semua Cabang) .';
          case 'sigap-alumni': return '👑 Tahfidz HUB • Data Alumni (Semua Cabang) .';
          case 'sigap-jadwal': return '👑 Tahfidz HUB • Jadwal KBM (Semua Cabang) .';
          case 'sigap-lokasi-qr': return '👑 Tahfidz HUB • Lokasi & QR Presensi (Semua Cabang) .';
          case 'sigap-monitoring': return '👑 Tahfidz HUB • Monitoring & Rekap (Semua Cabang) .';
          case 'sigap-izin': return '👑 Tahfidz HUB • Persetujuan Izin (Semua Cabang) .';
          case 'sigap-spp': return '👑 Tahfidz HUB • Pembayaran SPP (Semua Cabang) .';
          case 'sigap-prisma-studio': return '👑 Tahfidz HUB • Prisma Studio (Database Semua Cabang) .';
          case 'owner-konfigurasi':
          case 'sigap-konfigurasi': return '👑 Tahfidz HUB • Konfigurasi Unit & Akun .';
          default: return '👑 Tahfidz HUB • Dashboard Yayasan .';
        }
      }
    }

    switch (activeTab) {
      case 'dashboard': return (currentRole === 'superadmin' || currentRole === 'owner') ? `Tahfidz HUB • Dashboard Admin${branchSuffix}` : 'Tahfidz HUB • Dashboard';
      case 'sigap-dashboard': return `Tahfidz HUB • Dashboard Admin${branchSuffix}`;
      case 'sigap-siswa': return `Tahfidz HUB • Data Siswa${branchSuffix}`;
      case 'sigap-guru': return `Tahfidz HUB • Data Guru & Pegawai${branchSuffix}`;
      case 'sigap-alumni': return `Tahfidz HUB • Data Alumni${branchSuffix}`;
      case 'sigap-mapel': return `Tahfidz HUB • Data Mapel${branchSuffix}`;
      case 'sigap-jadwal': return `Tahfidz HUB • Jadwal KBM${branchSuffix}`;
      case 'sigap-lokasi-qr': return `Tahfidz HUB • Lokasi & QR Presensi${branchSuffix}`;
      case 'sigap-monitoring': return `Tahfidz HUB • Monitoring & Rekap${branchSuffix}`;
      case 'sigap-izin': return `Tahfidz HUB • Persetujuan Izin${branchSuffix}`;
      case 'sigap-spp': return `Tahfidz HUB • Pembayaran SPP & Keuangan${branchSuffix}`;
      case 'sigap-prisma-studio': return `Tahfidz HUB • Prisma Studio (Database PostgreSQL)${branchSuffix}`;
      case 'sigap-konfigurasi': return `Tahfidz HUB • Konfigurasi Unit${branchSuffix}`;
      case 'mushaf': return 'Tahfidz HUB • Mushaf Al-Qur\'an';
      case 'scan': return 'Tahfidz HUB • Scan Presensi Pengampu';
      case 'riwayat-presensi': return 'Tahfidz HUB • Riwayat Presensi Halaqah';
      case 'riwayat-presensi-santri': return 'Tahfidz HUB • Riwayat Presensi Santri';
      case 'riwayat-presensi-pengampu': return 'Tahfidz HUB • Riwayat Presensi Pengampu';
      case 'izin': return currentRole === 'pengampu' ? 'Tahfidz HUB • Permohonan Izin Pengampu' : 'Tahfidz HUB • Permohonan Izin';
      case 'santri': return currentRole === 'orangtua' ? 'Progres Ananda' : 'Tahfidz HUB • Daftar Santri';
      case 'hafalan-santri': return currentRole === 'orangtua' ? 'Tahfidz HUB • Riwayat Hafalan Ananda' : 'Tahfidz HUB • Hafalan Santri';
      case 'presensi-santri': return 'Tahfidz HUB • Presensi Santri';
      case 'setoran': return 'Tahfidz HUB • Pencatatan Setoran';
      case 'rapor': return 'Tahfidz HUB • Laporan & Rapor Tahfidz';
      case 'pengaturan': return 'Tahfidz HUB • Pengaturan Sistem';
      default: return 'Tahfidz HUB';
    }
  };

  const roleIndicatorGradient = {
    owner: 'linear-gradient(90deg, #ff5b35 0%, #ff8359 100%)',
    superadmin: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    pengampu: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
    orangtua: 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)'
  }[currentRole] || 'linear-gradient(90deg, #ff5b35, #ff8359)';

  return (
    <header className="simtah-header no-print" style={{ position: 'relative' }}>
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '3px', 
          background: roleIndicatorGradient,
          zIndex: 10
        }} 
      />
      <div className="page-title header-desktop-title">
        {getTabTitle()}
      </div>

      <div className="header-mobile-brand">
        Tahfidz Hub
      </div>

      <div className="header-right-actions">
        {/* Role Quick Switcher */}
        {onSwitchRole && (
          <div 
            className="header-role-pill header-desktop-only"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: isDarkMode ? '#1e293b' : '#faf5ff',
              border: '1px solid #d8b4fe',
              borderRadius: '20px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.775rem',
              fontWeight: '600'
            }}
          >
            <User size={13} color="#7c3aed" />
            <select
              value={currentRole === 'superadmin' ? `superadmin:${activeBranchId || 'cabang-pusat'}` : currentRole}
              onChange={(e) => onSwitchRole(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.775rem',
                fontWeight: '700',
                color: isDarkMode ? '#f8fafc' : '#6b21a8',
                cursor: 'pointer',
                maxWidth: '240px'
              }}
              title="Ganti Peran / Role Akses Cabang"
            >
              <option value="orangtua" style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                👤 Wali Santri (Adilla)
              </option>
              <option value="pengampu" style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                🏅 Pengampu (Ustadz Wahyudin)
              </option>
              <option value="superadmin:cabang-pusat" style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                🛡️ Super Admin (MA Ihya As-Sunnah)
              </option>
              <option value="superadmin:cabang-smp" style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                🛡️ Super Admin (Raudhotul Huffaz)
              </option>
              {cabangList && cabangList.filter(c => c.id !== 'cabang-pusat' && c.id !== 'cabang-smp').map(c => (
                <option key={c.id} value={`superadmin:${c.id}`} style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                  🛡️ Super Admin ({c.nama})
                </option>
              ))}
              <option value="owner" style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                👑 Owner Yayasan
              </option>
            </select>
          </div>
        )}

        {/* Branch Selector Dropdown - Locked for Super Admin, Selectable for Owner */}
        {cabangList && cabangList.length > 0 && (
          <div 
            className="header-branch-pill header-desktop-only"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isDarkMode ? '#1e293b' : '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '20px',
              padding: '0.25rem 0.65rem',
              fontSize: '0.775rem',
              fontWeight: '600'
            }}
          >
            <MapPin size={13} color="#16a34a" />
            {currentRole === 'superadmin' ? (
              <span 
                style={{
                  fontSize: '0.775rem',
                  fontWeight: '700',
                  color: isDarkMode ? '#f8fafc' : '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title={`Cabang Terkunci: ${((cabangList || []).find(c => c.id === activeBranchId)?.nama) || 'MA Ihya As-Sunnah'} (Role: Super Admin)`}
              >
                {((cabangList || []).find(c => c.id === activeBranchId)?.nama) || 'MA Ihya As-Sunnah'}
                <Lock size={11} color="#16a34a" />
              </span>
            ) : (
              <select
                value={activeBranchId || 'ALL'}
                onChange={(e) => onSwitchBranch && onSwitchBranch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.775rem',
                  fontWeight: '700',
                  color: isDarkMode ? '#f8fafc' : '#15803d',
                  cursor: 'pointer',
                  maxWidth: '220px'
                }}
                title="Pilih Cabang Lembaga yang Aktif"
              >
                <option value="ALL" style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                  🌐 Semua Cabang
                </option>
                {cabangList.map(c => (
                  <option key={c.id} value={c.id} style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                    {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Authenticated User Profile Pill */}
        {authUser && (
          <div 
            className="header-user-profile header-desktop-only" 
            title={`Login sebagai: ${authUser.nama} (${authUser.roleLabel || currentRole})`}
          >
            <div className="header-user-avatar">
              {(dynamicPhoto || authUser.foto) ? (
                <img 
                  src={dynamicPhoto || authUser.foto} 
                  alt={authUser.nama} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : currentRole === 'owner' ? (
                <Building2 size={14} color="#d97706" />
              ) : currentRole === 'superadmin' ? (
                <Shield size={14} color="#059669" />
              ) : currentRole === 'pengampu' ? (
                <Award size={14} color="#2563eb" />
              ) : (
                <User size={14} color="#7c3aed" />
              )}
            </div>

            <div className="header-user-details">
              <span className="header-user-name">{authUser.nama || 'Pengguna'}</span>
              <span 
                className="header-user-role-badge"
                style={{
                  color: currentRole === 'owner' ? '#d97706' :
                         currentRole === 'superadmin' ? '#059669' :
                         currentRole === 'pengampu' ? '#2563eb' : '#7c3aed'
                }}
              >
                {currentRole === 'owner' ? '👑 Owner' :
                 currentRole === 'superadmin' ? '🛡️ Super Admin' :
                 currentRole === 'pengampu' ? '🏅 Pengampu' : '👤 Orang Tua'}
              </span>
            </div>

            {onSignOut && (
              <button 
                type="button" 
                className="btn-header-signout" 
                onClick={onSignOut}
                title="Keluar / Logout dari Sistem"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        )}

        {/* Tahfidz HUB Brand Emblem */}
        <div 
          className="header-icon-btn header-desktop-only" 
          title="Tahfidz HUB - Platform Manajemen Terpadu"
          style={{ background: '#ecfdf5', color: '#166534', borderColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <TahfidzHubLogo size={18} variant="emerald" />
        </div>

        {/* Dark Mode Toggle */}
        <button 
          className="header-icon-btn header-darkmode-toggle" 
          onClick={onToggleDarkMode}
          title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
          aria-label={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
