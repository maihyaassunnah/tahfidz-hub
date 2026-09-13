import React from 'react';
import { Moon, Sun, Shield, Award, User, BookOpen, Building2, MapPin, LogOut } from 'lucide-react';

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
  cabangList = []
}) {
  const getTabTitle = () => {
    if (currentRole === 'owner') {
      switch (activeTab) {
        case 'owner-cabang': return '👑 Tahfidz HUB • Kelola Cabang Lembaga';
        case 'owner-superadmin': return '👑 Tahfidz HUB • Akun Super Admin Cabang';
        case 'owner-rekap': return '👑 Tahfidz HUB • Konsolidasi Multi-Cabang';
        default: return '👑 Tahfidz HUB • Dashboard Multi-Cabang';
      }
    }

    switch (activeTab) {
      case 'dashboard': return currentRole === 'superadmin' ? 'Tahfidz HUB • Dashboard Admin' : 'Tahfidz HUB • Dashboard';
      case 'sigap-dashboard': return 'Tahfidz HUB • Dashboard Admin';
      case 'sigap-siswa': return 'Tahfidz HUB • Data Siswa';
      case 'sigap-guru': return 'Tahfidz HUB • Data Guru & Pegawai';
      case 'sigap-alumni': return 'Tahfidz HUB • Data Alumni';
      case 'sigap-kelas': return 'Tahfidz HUB • Data Kelas';
      case 'sigap-mapel': return 'Tahfidz HUB • Data Mapel';
      case 'sigap-jadwal': return 'Tahfidz HUB • Jadwal KBM';
      case 'sigap-lokasi-qr': return 'Tahfidz HUB • Lokasi & QR Kelas';
      case 'sigap-monitoring': return 'Tahfidz HUB • Monitoring & Rekap';
      case 'sigap-izin': return 'Tahfidz HUB • Persetujuan Izin';
      case 'sigap-konfigurasi': return 'Tahfidz HUB • Konfigurasi Unit';
      case 'mushaf': return 'Tahfidz HUB • Mushaf Al-Qur\'an';
      case 'scan': return 'Tahfidz HUB • Scan Presensi Pengampu';
      case 'riwayat-presensi': return 'Tahfidz HUB • Riwayat Presensi Halaqah';
      case 'riwayat-presensi-santri': return 'Tahfidz HUB • Riwayat Presensi Santri';
      case 'riwayat-presensi-pengampu': return 'Tahfidz HUB • Riwayat Presensi Pengampu';
      case 'izin': return currentRole === 'pengampu' ? 'Tahfidz HUB • Permohonan Izin Pengampu' : 'Tahfidz HUB • Permohonan Izin';
      case 'santri': return currentRole === 'orangtua' ? 'Progres Ananda' : 'Tahfidz HUB • Daftar Santri';
      case 'presensi-santri': return 'Tahfidz HUB • Presensi Santri';
      case 'setoran': return 'Tahfidz HUB • Pencatatan Setoran';
      case 'rapor': return 'Tahfidz HUB • Laporan & Rapor Tahfidz';
      case 'pengaturan': return 'Tahfidz HUB • Pengaturan Sistem';
      default: return 'Tahfidz HUB';
    }
  };

  return (
    <header className="simtah-header no-print">
      <div className="page-title">
        {getTabTitle()}
      </div>

      <div className="header-right-actions">
        {/* Branch Selector Dropdown */}
        {cabangList && cabangList.length > 0 && (
          <div 
            className="header-branch-pill"
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
            <select
              value={activeBranchId}
              onChange={(e) => onSwitchBranch && onSwitchBranch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.775rem',
                fontWeight: '700',
                color: isDarkMode ? '#f8fafc' : '#15803d',
                cursor: 'pointer',
                maxWidth: '160px'
              }}
              title="Pilih Cabang Lembaga yang Aktif"
            >
              {cabangList.map(c => (
                <option key={c.id} value={c.id} style={{ background: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000' }}>
                  {c.kode || c.nama}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Authenticated User Profile Pill */}
        {authUser && (
          <div 
            className="header-user-profile" 
            title={`Login sebagai: ${authUser.nama} (${authUser.roleLabel || currentRole})`}
          >
            <div className="header-user-avatar">
              {authUser.foto ? (
                <img 
                  src={authUser.foto} 
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
          className="header-icon-btn" 
          title="Tahfidz HUB - Platform Manajemen Terpadu"
          style={{ background: '#ecfdf5', color: '#166534', borderColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <TahfidzHubLogo size={18} variant="emerald" />
        </div>

        {/* Dark Mode Toggle */}
        <button 
          className="header-icon-btn" 
          onClick={onToggleDarkMode}
          title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
