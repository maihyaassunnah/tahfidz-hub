import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import MushafView from './components/MushafView';
import ScanPresensiView from './components/ScanPresensiView';
import PermohonanIzinView from './components/PermohonanIzinView';
import SetoranView from './components/SetoranView';
import AbsensiView from './components/AbsensiView';
import SantriTrackerView from './components/SantriTrackerView';
import RaporView from './components/RaporView';
import HafalanSantriOrtuView from './components/HafalanSantriOrtuView';
import DataMasterView from './components/DataMasterView';
import PengaturanAdminView from './components/PengaturanAdminView';
import AdminEmptyMenuView from './components/AdminEmptyMenuView';
import DashboardSigapView from './components/sigap/DashboardSigapView';
import DataSiswaSigapView from './components/sigap/DataSiswaSigapView';
import DataGuruSigapView from './components/sigap/DataGuruSigapView';
import DataAlumniSigapView from './components/sigap/DataAlumniSigapView';
import JadwalSigapView from './components/sigap/JadwalSigapView';
import LokasiQRSigapView from './components/sigap/LokasiQRSigapView';
import MonitoringSigapView from './components/sigap/MonitoringSigapView';
import PersetujuanIzinSigapView from './components/sigap/PersetujuanIzinSigapView';
import PrismaStudioView from './components/sigap/PrismaStudioView';
import OwnerView from './components/owner/OwnerView';
import SPPView from './components/sigap/SPPView';
import SetoranModal from './components/SetoranModal';
import BottomNav from './components/BottomNav';
import LoginView from './components/LoginView';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';
import { storageService } from './services/storage';
import { CheckCircle, KeyRound } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(() => storageService.getAuthUser());
  const [currentRole, setCurrentRole] = useState(() => {
    const u = storageService.getAuthUser();
    return u?.role || storageService.getCurrentRole();
  });
  const [activeTab, setActiveTab] = useState(() => {
    const u = storageService.getAuthUser();
    const role = u?.role || storageService.getCurrentRole();
    return role === 'owner' ? 'owner-dashboard' :
           role === 'superadmin' ? 'sigap-dashboard' : 'dashboard';
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Multi-Branch State
  const [activeBranchId, setActiveBranchId] = useState(storageService.getActiveBranchId());
  const [cabangList, setCabangList] = useState(storageService.getCabang());

  const [santriList, setSantriList] = useState([]);
  const [halaqahList, setHalaqahList] = useState([]);
  const [setoranList, setSetoranList] = useState([]);
  const [absensiList, setAbsensiList] = useState([]);
  const [settings, setSettings] = useState({});

  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [isQuickSetorOpen, setIsQuickSetorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Initial load
  const loadData = () => {
    storageService.init();
    setActiveBranchId(storageService.getActiveBranchId());
    setCabangList(storageService.getCabang());
    setSantriList(storageService.getSantri());
    setHalaqahList(storageService.getHalaqah());
    setSetoranList(storageService.getSetoran());
    setAbsensiList(storageService.getAbsensi());
    setSettings(storageService.getSettings());
  };

  useEffect(() => {
    loadData();
    // Auto-sync non-blocking dengan PostgreSQL backend saat aplikasi dimuat
    storageService.syncFromPostgres().then(res => {
      if (res && res.success) {
        loadData();
      }
    }).catch(err => {
      console.warn('[App] Auto-sync PostgreSQL notice:', err);
    });

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('simtah_data_updated', handleUpdate);
    window.addEventListener('simtah_santri_updated', handleUpdate);
    return () => {
      window.removeEventListener('simtah_data_updated', handleUpdate);
      window.removeEventListener('simtah_santri_updated', handleUpdate);
    };
  }, []);

  // Pastikan cabang akun Super Admin selalu terkunci pada cabangnya sendiri
  useEffect(() => {
    if (currentRole === 'superadmin') {
      const u = authUser || storageService.getAuthUser();
      const lockedBranch = u?.cabangId || 'cabang-pusat';
      if (activeBranchId !== lockedBranch) {
        storageService.setActiveBranchId(lockedBranch);
        setActiveBranchId(lockedBranch);
      }
    }
  }, [currentRole, authUser, activeBranchId]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    const role = user.role || 'superadmin';
    setCurrentRole(role);
    if (user.cabangId && user.cabangId !== 'ALL') {
      storageService.setActiveBranchId(user.cabangId);
      setActiveBranchId(user.cabangId);
    }
    if (role === 'owner') {
      setActiveTab('owner-dashboard');
    } else if (role === 'superadmin') {
      setActiveTab('sigap-dashboard');
    } else {
      setActiveTab('dashboard');
    }
    loadData();
    showToast(`Ahlan wa Sahlan, ${user.nama}!`);
  };

  const handleSwitchBranch = (branchId) => {
    if (currentRole === 'superadmin') {
      showToast('Akses dibatasi: Akun Super Admin terkunci pada cabang ini dan tidak dapat beralih.');
      return;
    }
    storageService.setActiveBranchId(branchId);
    setActiveBranchId(branchId);
    loadData();
    if (branchId === 'ALL') {
      if (currentRole === 'owner') {
        setActiveTab('owner-dashboard');
      }
      showToast(`Menampilkan seluruh cabang yayasan (Semua Cabang)`);
    } else {
      if (currentRole === 'owner') {
        if (
          activeTab === 'owner-dashboard' || 
          activeTab === 'owner-cabang' || 
          activeTab === 'owner-rekap' || 
          activeTab === 'dashboard' || 
          activeTab === 'owner'
        ) {
          setActiveTab('sigap-dashboard');
        }
      }
      const matched = storageService.getCabang().find(c => c.id === branchId);
      showToast(`Membuka panel manajemen cabang: ${matched ? matched.nama : branchId}`);
    }
  };

  const handleSwitchRole = (newRoleInput, targetBranchId) => {
    let newRole = newRoleInput;
    let chosenBranchId = targetBranchId;

    if (typeof newRoleInput === 'string' && newRoleInput.startsWith('superadmin:')) {
      newRole = 'superadmin';
      chosenBranchId = newRoleInput.replace('superadmin:', '');
    }

    setCurrentRole(newRole);
    storageService.setCurrentRole(newRole);

    if (newRole === 'orangtua') {
      const allSantri = storageService.getAllSantriRaw();
      const s = allSantri[0] || { id: 's-1', nama: 'Muhammad Rayhan Al-Fatih', nis: '2026001', cabangId: 'cabang-pusat' };
      const ortuUser = {
        id: 'wali-' + s.id,
        nama: 'Wali Santri (' + (s.nama ? s.nama.split(' ')[0] : 'Adilla') + ')',
        namaSantri: s.nama,
        nis: s.nis,
        username: 'ortu.' + (s.nis || '2026001'),
        email: 'ortu@ihya.sch.id',
        role: 'orangtua',
        roleLabel: 'Wali Santri',
        cabangId: s.cabangId || 'cabang-pusat',
        halaqahId: s.halaqahId || s.halaqah_id || 'hq-1'
      };
      setAuthUser(ortuUser);
      storageService.setAuthUser(ortuUser);
      storageService.setParentSelectedStudent(s.id);
      setActiveTab('dashboard');
    } else if (newRole === 'pengampu') {
      const pengampuUser = {
        id: 'p-wahyudin',
        nama: 'Ustadz Wahyudin Hafiz, S.Pd',
        username: 'ustadz.wahyudin',
        email: 'wahyudin@ihya.sch.id',
        nip: '19890412201801',
        role: 'pengampu',
        roleLabel: 'Ustadz Pengampu',
        halaqahId: 'hq-1',
        cabangId: 'cabang-pusat'
      };
      setAuthUser(pengampuUser);
      storageService.setAuthUser(pengampuUser);
      setActiveTab('dashboard');
    } else if (newRole === 'owner') {
      const ownerUser = {
        id: 'user-owner',
        nama: 'Pimpinan / Owner Yayasan',
        username: 'owner',
        role: 'owner',
        roleLabel: 'Owner Yayasan',
        cabangId: 'ALL'
      };
      setAuthUser(ownerUser);
      storageService.setAuthUser(ownerUser);
      storageService.setActiveBranchId('ALL');
      setActiveBranchId('ALL');
      setActiveTab('owner-dashboard');
    } else if (newRole === 'superadmin') {
      const branches = storageService.getCabang();
      const branchId = chosenBranchId || (activeBranchId && activeBranchId !== 'ALL' ? activeBranchId : 'cabang-pusat');
      const matchedBranch = branches.find(c => c.id === branchId) || branches[0] || {};
      const saAccounts = storageService.getSuperAdminAccounts();
      const matchedSA = saAccounts.find(s => s.cabangId === branchId);

      const isSmp = branchId === 'cabang-smp';
      const saUser = {
        id: matchedSA?.id || `sa-${branchId}`,
        nama: matchedSA?.nama || (isSmp ? 'Admin Raudhotul Huffaz' : 'Admin MA Ihya As-Sunnah'),
        username: matchedSA?.username || (isSmp ? 'admin_rdthfz' : 'admin.ma'),
        role: 'superadmin',
        roleLabel: 'Super Admin Cabang',
        cabangId: branchId,
        cabangNama: matchedBranch.nama || (isSmp ? 'Raudhotul Huffaz' : 'MA Ihya As-Sunnah')
      };
      setAuthUser(saUser);
      storageService.setAuthUser(saUser);
      storageService.setActiveBranchId(branchId);
      setActiveBranchId(branchId);
      setActiveTab('sigap-dashboard');
    } else {
      setActiveTab('dashboard');
    }
    loadData();
    const branchLabel = (chosenBranchId === 'cabang-smp' || (!chosenBranchId && activeBranchId === 'cabang-smp')) ? 'Raudhotul Huffaz' : 'MA Ihya As-Sunnah';
    const roleLabels = {
      owner: '👑 Owner (Yayasan & Multi-Cabang)',
      superadmin: `🛡️ Super Admin (${branchLabel})`,
      pengampu: '🏅 Pengampu (Wahyudin Hafiz)',
      orangtua: '👤 Orang Tua (Wali Santri Adilla)'
    };
    showToast(`Beralih ke peran: ${roleLabels[newRole] || newRole}`);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      return next;
    });
  };

  // Saring santri & halaqah khusus role pengampu secara dinamis
  const cleanAuthName = (authUser?.nama || '')
    .toLowerCase()
    .replace(/^(ustadz|ustadzah|ust\.|dr\.|drh\.|ir\.|prof\.|kh\.|k\.h\.)\s*/gi, '')
    .replace(/,\s*(s\.pd|lc\.|m\.pd|b\.a\.|m\.ag|s\.th\.i|s\.sos|s\.ag|m\.si|a\.md).*$/gi, '')
    .trim();

  let effectiveHalaqahList = halaqahList;
  let effectiveSantriList = santriList;

  if (currentRole === 'pengampu' && authUser) {
    effectiveHalaqahList = halaqahList.filter(h => {
      if (authUser.halaqahId && h.id === authUser.halaqahId) return true;
      if (authUser.id && (h.pengampuId === authUser.id || h.musyrifId === authUser.id)) return true;
      if (cleanAuthName && h.musyrif) {
        const cleanMusyrif = h.musyrif.toLowerCase();
        if (cleanMusyrif.includes(cleanAuthName) || cleanAuthName.includes(cleanMusyrif)) return true;
      }
      return false;
    });

    const validHalaqahIds = new Set(effectiveHalaqahList.map(h => h.id));
    if (authUser.halaqahId) validHalaqahIds.add(authUser.halaqahId);

    effectiveSantriList = santriList.filter(s => {
      if (s.halaqahId && validHalaqahIds.has(s.halaqahId)) return true;
      if (s.halaqah_id && validHalaqahIds.has(s.halaqah_id)) return true;
      if (authUser.id && (s.pengampuId === authUser.id || s.pengampu_id === authUser.id)) return true;
      const sPengampu = (s.pengampu || s.pengampuNama || '').toLowerCase();
      if (cleanAuthName && sPengampu) {
        if (sPengampu.includes(cleanAuthName) || cleanAuthName.includes(sPengampu)) return true;
      }
      const sHalaqah = (s.halaqahNama || '').toLowerCase();
      if (cleanAuthName && sHalaqah && sHalaqah.includes(cleanAuthName)) return true;
      return false;
    });

    if (effectiveHalaqahList.length === 0) {
      effectiveHalaqahList = [{
        id: authUser.halaqahId || ('hq-' + (authUser.id || 'current')),
        nama: authUser.halaqahNama || (`Halaqah ${authUser.nama || 'Tahfidz'}`),
        pengampuId: authUser.id || 'p-current',
        musyrif: authUser.nama || 'Ustadz Pengampu',
        cabangId: authUser.cabangId || 'cabang-pusat',
        targetJuzPekan: 0.5
      }];
    }
  }

  // Saring santri khusus role Orang Tua / Wali Santri: HANYA ANAKNYA SENDIRI
  if (currentRole === 'orangtua') {
    const parentChildId = authUser?.santriId || storageService.getParentSelectedStudent();
    const parentChildNis = authUser?.nis;
    const parentChildName = (authUser?.namaSantri || authUser?.username || '').trim().toLowerCase();

    effectiveSantriList = santriList.filter(s => {
      if (parentChildId && s.id === parentChildId) return true;
      if (parentChildNis && (String(s.nis) === String(parentChildNis) || String(s.nisn) === String(parentChildNis))) return true;
      if (parentChildName && (s.nama || '').trim().toLowerCase() === parentChildName) return true;
      return false;
    });

    // Fallback jika belum terfilter, gunakan anak pertama
    if (effectiveSantriList.length === 0 && santriList.length > 0) {
      effectiveSantriList = [santriList[0]];
    }
  }

  // Proteksi Menu Khusus Orang Tua / Wali
  useEffect(() => {
    if (currentRole === 'orangtua') {
      const allowedOrtuTabs = ['dashboard', 'hafalan-santri', 'riwayat-presensi-santri', 'riwayat-presensi', 'santri', 'rapor'];
      if (!allowedOrtuTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [currentRole, activeTab]);

  const handleSaveSetoran = (entry) => {
    const saved = storageService.addSetoran(entry);
    loadData();
    showToast(`Setoran Surah ${saved.surahName} (Ayat ${saved.ayatAwal}-${saved.ayatAkhir}) berhasil dicatat!`);
  };

  const handleDeleteSetoran = (id) => {
    storageService.deleteSetoran(id);
    loadData();
  };

  const handleSaveAbsensi = (tanggal, halaqahId, records, catatanHalaqah, sesiId, sesiNama) => {
    storageService.saveAbsensiRecord(tanggal, halaqahId, records, catatanHalaqah, sesiId, sesiNama);
    loadData();
  };

  const handleUpdateSantri = (id, fields) => {
    storageService.updateSantri(id, fields);
    loadData();
  };

  const handleDeleteSantri = (id) => {
    storageService.deleteSantri(id);
    loadData();
    showToast("Data santri dan seluruh riwayat terkait berhasil dihapus.");
  };

  const handleSignOut = () => {
    if (window.confirm("Keluar dari sistem Tahfidz HUB?")) {
      storageService.logout();
      setAuthUser(null);
      showToast("Anda telah keluar dari sistem Tahfidz HUB.");
    }
  };

  // JIKA BELUM LOGIN: TAMPILKAN HALAMAN LOGIN (SESUAI GAMBAR 2)
  if (!authUser) {
    return (
      <>
        <LoginView 
          onLoginSuccess={handleLoginSuccess}
          isDarkMode={isDarkMode}
        />
        {toastMessage && (
          <div className="toast-container no-print">
            <div className="toast">
              <CheckCircle size={18} color="#34d399" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="simtah-layout">
      {/* Sidebar Nav (SIGAP untuk Super Admin, Halaqah untuk Pengampu/Ortu) */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        onSignOut={handleSignOut}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        showToast={showToast}
        activeBranchId={activeBranchId}
        onSwitchBranch={handleSwitchBranch}
        cabangList={cabangList}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main Content Area */}
      <div className="simtah-main">
        {/* Top Header Bar */}
        <Header 
          activeTab={activeTab}
          currentRole={currentRole}
          authUser={authUser}
          onSignOut={handleSignOut}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          activeBranchId={activeBranchId}
          onSwitchBranch={handleSwitchBranch}
          cabangList={cabangList}
          onSwitchRole={handleSwitchRole}
        />

        {/* View Routing */}
        <main>
          {/* =========================================================
              VIEW ROUTING UNTUK ROLE OWNER (PORTAL YAYASAN & MULTI-CABANG)
              ========================================================= */}
          {currentRole === 'owner' && (
            <>
              {/* PORTAL OWNER TABS (Selalu render OwnerView jika tab diawali owner- atau dashboard konsolidasi global) */}
              {(activeTab?.startsWith('owner-') || activeTab === 'owner' || (activeTab === 'dashboard' && (!activeBranchId || activeBranchId === 'ALL'))) && (
                <OwnerView 
                  activeBranchId={activeBranchId}
                  onSwitchBranch={handleSwitchBranch}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  showToast={showToast}
                  onSwitchRole={handleSwitchRole}
                />
              )}

              {/* DASHBOARD CABANG KETIKA MEMILIH SATU CABANG */}
              {(activeTab === 'sigap-dashboard' || (activeTab === 'dashboard' && activeBranchId && activeBranchId !== 'ALL')) && (
                <DashboardSigapView 
                  setActiveTab={setActiveTab} 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}

              {/* MENU-MENU SUPER ADMIN UNTUK CABANG TERPILIH */}
              {activeTab === 'sigap-siswa' && (
                <DataSiswaSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}
              {activeTab === 'sigap-guru' && (
                <DataGuruSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}
              {activeTab === 'sigap-alumni' && (
                <DataAlumniSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}
              {activeTab === 'sigap-jadwal' && (
                <JadwalSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}
              {activeTab === 'sigap-lokasi-qr' && (
                <LokasiQRSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}
              {activeTab === 'sigap-monitoring' && (
                <MonitoringSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}
              {activeTab === 'sigap-izin' && (
                <PersetujuanIzinSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}
              {activeTab === 'sigap-spp' && (
                <SPPView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId} 
                />
              )}
              {activeTab === 'sigap-prisma-studio' && (
                <PrismaStudioView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId} 
                />
              )}

              {/* KONFIGURASI UNIT UNTUK ROLE OWNER */}
              {(activeTab === 'sigap-konfigurasi' || activeTab === 'owner-konfigurasi') && (
                <PengaturanAdminView 
                  settings={settings}
                  halaqahList={halaqahList}
                  santriList={santriList}
                  onSaveSettings={(newSettings) => {
                    storageService.saveSettings(newSettings);
                    loadData();
                    showToast("Pengaturan sistem berhasil diperbarui!");
                  }}
                  onReload={loadData}
                  showToast={showToast}
                  currentRole="owner"
                  isOwner={true}
                />
              )}
            </>
          )}

          {/* =========================================================
              VIEW ROUTING UNTUK ROLE SUPER ADMIN (SIGAP)
              ========================================================= */}
          {currentRole === 'superadmin' && (
            <>
              {/* GAMBAR 1: DASHBOARD SIGAP */}
              {(activeTab === 'sigap-dashboard' || activeTab === 'dashboard') && (
                <DashboardSigapView 
                  setActiveTab={setActiveTab} 
                  showToast={showToast} 
                />
              )}

              {/* GAMBAR 2: DATA SISWA */}
              {activeTab === 'sigap-siswa' && (
                <DataSiswaSigapView 
                  showToast={showToast} 
                />
              )}

              {/* GAMBAR 3: DATA GURU & PEGAWAI (PENGAMPU) */}
              {activeTab === 'sigap-guru' && (
                <DataGuruSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}

              {/* GAMBAR 4: DATA ALUMNI */}
              {activeTab === 'sigap-alumni' && (
                <DataAlumniSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}


              {/* GAMBAR 2: ATUR JADWAL PELAJARAN */}
              {activeTab === 'sigap-jadwal' && (
                <JadwalSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}

              {/* GAMBAR 3: QR & LOKASI KELAS */}
              {activeTab === 'sigap-lokasi-qr' && (
                <LokasiQRSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}

              {/* GAMBAR 4: MONITORING & REKAPITULASI */}
              {activeTab === 'sigap-monitoring' && (
                <MonitoringSigapView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId}
                />
              )}

              {/* GAMBAR 5: PERSETUJUAN IZIN GURU */}
              {activeTab === 'sigap-izin' && (
                <PersetujuanIzinSigapView 
                  showToast={showToast} 
                />
              )}

              {/* PEMBAYARAN SPP & KEUANGAN */}
              {activeTab === 'sigap-spp' && (
                <SPPView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId} 
                />
              )}

              {/* PRISMA STUDIO (DATABASE MANAGEMENT) */}
              {activeTab === 'sigap-prisma-studio' && (
                <PrismaStudioView 
                  showToast={showToast} 
                  activeBranchId={activeBranchId} 
                />
              )}

              {/* PENGATURAN ADMIN / KONFIGURASI */}
              {activeTab === 'sigap-konfigurasi' && (
                <PengaturanAdminView 
                  settings={settings}
                  halaqahList={halaqahList}
                  santriList={santriList}
                  onSaveSettings={(newSettings) => {
                    storageService.saveSettings(newSettings);
                    loadData();
                    showToast("Pengaturan sistem berhasil diperbarui!");
                  }}
                  onReload={loadData}
                  showToast={showToast}
                  currentRole="superadmin"
                  isOwner={false}
                />
              )}

              {/* MENU KBM LAINNYA YANG BELUM DIBUAT (MISAL DATA MAPEL) */}
              {![
                'sigap-dashboard', 
                'dashboard', 
                'sigap-siswa', 
                'sigap-guru', 
                'sigap-alumni',
                'sigap-jadwal',
                'sigap-lokasi-qr',
                'sigap-monitoring',
                'sigap-izin',
                'sigap-spp',
                'sigap-prisma-studio',
                'sigap-konfigurasi'
              ].includes(activeTab) && activeTab.startsWith('sigap-') && (
                <AdminEmptyMenuView 
                  activeTab={activeTab}
                  onOpenPasswordModal={() => setShowPasswordModal(true)}
                />
              )}
            </>
          )}

          {/* TAMPILAN DASHBOARD, PRESENSI, & SETORAN PENGAMPU / WALI SANTRI */}
          {currentRole !== 'superadmin' && currentRole !== 'owner' && activeTab === 'dashboard' && (
                  <DashboardView 
                    santriList={effectiveSantriList}
                    halaqahList={effectiveHalaqahList}
                    setoranList={setoranList}
                    absensiList={absensiList}
                    currentRole={currentRole}
                    setActiveTab={setActiveTab}
                    onSelectSantri={(id) => { setSelectedSantriId(id); setActiveTab('santri'); }}
                    authUser={authUser}
                    onReload={loadData}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'mushaf' && (
                  <MushafView />
                )}

                {activeTab === 'scan' && (
                  <ScanPresensiView 
                    santriList={effectiveSantriList}
                    onReload={loadData}
                    showToast={showToast}
                    setActiveTab={setActiveTab}
                    authUser={authUser}
                  />
                )}

                {(activeTab === 'riwayat-presensi' || activeTab === 'riwayat-presensi-santri' || activeTab === 'riwayat-presensi-pengampu') && (
                  <div className="page-content-wrapper">
                    <AbsensiView 
                      santriList={effectiveSantriList}
                      halaqahList={effectiveHalaqahList}
                      absensiList={absensiList}
                      onSaveAbsensi={handleSaveAbsensi}
                      showToast={showToast}
                      currentRole={currentRole}
                      activeCategory={activeTab === 'riwayat-presensi-pengampu' ? 'pengampu' : 'santri'}
                      onCategoryChange={(cat) => {
                        setActiveTab(cat === 'pengampu' ? 'riwayat-presensi-pengampu' : 'riwayat-presensi-santri');
                      }}
                      setActiveTab={setActiveTab}
                      authUser={authUser}
                    />
                  </div>
                )}

                {activeTab === 'izin' && (
                  <PermohonanIzinView 
                    santriList={effectiveSantriList}
                    currentRole={currentRole}
                    onReload={loadData}
                    showToast={showToast}
                    authUser={authUser}
                  />
                )}

                {activeTab === 'santri' && (
                  <div className="page-content-wrapper">
                    <SantriTrackerView 
                      santriList={effectiveSantriList}
                      halaqahList={effectiveHalaqahList}
                      setoranList={setoranList}
                      absensiList={absensiList}
                      selectedSantriId={selectedSantriId}
                      onSelectSantri={(id) => setSelectedSantriId(id)}
                      onUpdateSantri={handleUpdateSantri}
                      onOpenQuickSetor={() => setIsQuickSetorOpen(true)}
                      showToast={showToast}
                      currentRole={currentRole}
                      onDeleteSantri={handleDeleteSantri}
                    />
                  </div>
                )}

                {activeTab === 'presensi-santri' && (
                  <div className="page-content-wrapper">
                    <AbsensiView 
                      santriList={effectiveSantriList}
                      halaqahList={effectiveHalaqahList}
                      absensiList={absensiList}
                      onSaveAbsensi={handleSaveAbsensi}
                      showToast={showToast}
                      currentRole={currentRole}
                    />
                  </div>
                )}

                {activeTab === 'hafalan-santri' && (
                  <HafalanSantriOrtuView 
                    santriList={effectiveSantriList}
                    setoranList={setoranList}
                    halaqahList={effectiveHalaqahList}
                    authUser={authUser}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'setoran' && (
                  <div className="page-content-wrapper">
                    <SetoranView 
                      setoranList={setoranList}
                      santriList={effectiveSantriList}
                      halaqahList={effectiveHalaqahList}
                      onSaveSetoran={handleSaveSetoran}
                      onDeleteSetoran={handleDeleteSetoran}
                      onOpenQuickSetor={() => setIsQuickSetorOpen(true)}
                      onReload={loadData}
                      showToast={showToast}
                      currentRole={currentRole}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                )}

                 {activeTab === 'rapor' && (
                  <div className="page-content-wrapper">
                    <RaporView 
                      santriList={effectiveSantriList}
                      halaqahList={effectiveHalaqahList}
                      setoranList={setoranList}
                      absensiList={absensiList}
                      settings={settings}
                      selectedSantriId={selectedSantriId}
                      showToast={showToast}
                      currentRole={currentRole}
                      authUser={authUser}
                    />
                  </div>
                )}

          {activeTab === 'pengaturan' && (
            <PengaturanAdminView 
              settings={settings}
              halaqahList={halaqahList}
              santriList={santriList}
              onSaveSettings={(newSettings) => {
                setSettings(newSettings);
                loadData();
              }}
              onReload={loadData}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modal Quick Setoran */}
      <SetoranModal 
        isOpen={isQuickSetorOpen}
        onClose={() => setIsQuickSetorOpen(false)}
        onSave={handleSaveSetoran}
        santriList={effectiveSantriList}
        halaqahList={effectiveHalaqahList}
        initialSantriId={selectedSantriId}
      />

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} color="#16a34a" />
                <span>Ubah Password Akun</span>
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowPasswordModal(false);
              showToast("Password akun berhasil diperbarui!");
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Password Saat Ini</label>
                  <input type="password" required className="form-input" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password Baru</label>
                  <input type="password" required className="form-input" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Konfirmasi Password Baru</label>
                  <input type="password" required className="form-input" placeholder="••••••••" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container no-print">
          <div className="toast">
            <CheckCircle size={18} color="#34d399" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Curved Notch Bottom Navigation for Mobile Mode */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        onSignOut={handleSignOut}
        onOpenPasswordModal={() => setShowPasswordModal(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        showToast={showToast}
        onSwitchRole={handleSwitchRole}
        activeBranchId={activeBranchId}
        onSwitchBranch={handleSwitchBranch}
      />

      {/* PWA Smart Install Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}
