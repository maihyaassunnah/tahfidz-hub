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
import DataMasterView from './components/DataMasterView';
import PengaturanAdminView from './components/PengaturanAdminView';
import AdminEmptyMenuView from './components/AdminEmptyMenuView';
import DashboardSigapView from './components/sigap/DashboardSigapView';
import DataSiswaSigapView from './components/sigap/DataSiswaSigapView';
import DataGuruSigapView from './components/sigap/DataGuruSigapView';
import DataAlumniSigapView from './components/sigap/DataAlumniSigapView';
import DataKelasSigapView from './components/sigap/DataKelasSigapView';
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
  }, []);

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
    storageService.setActiveBranchId(branchId);
    setActiveBranchId(branchId);
    loadData();
    const matched = storageService.getCabang().find(c => c.id === branchId);
    showToast(`Cabang aktif: ${matched ? matched.nama : branchId}`);
  };

  const handleSwitchRole = (newRole) => {
    setCurrentRole(newRole);
    storageService.setCurrentRole(newRole);
    if (newRole === 'owner') {
      setActiveTab('owner-dashboard');
    } else if (newRole === 'superadmin') {
      setActiveTab('sigap-dashboard');
    } else {
      setActiveTab('dashboard');
    }
    const roleLabels = {
      owner: '👑 Owner (Yayasan & Multi-Cabang)',
      superadmin: 'Super Admin (SIGAP Cabang)',
      pengampu: 'Pengampu (Wahyudin Hafiz)',
      orangtua: 'Orang Tua (Wali Santri)'
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
        />

        {/* View Routing */}
        <main>
          {/* =========================================================
              VIEW ROUTING UNTUK ROLE OWNER (PORTAL YAYASAN & MULTI-CABANG)
              ========================================================= */}
          {currentRole === 'owner' && (
            <>
              {/* PORTAL OWNER TABS */}
              {(activeTab?.startsWith('owner-') || activeTab === 'dashboard' || activeTab === 'owner') && (
                <OwnerView 
                  activeBranchId={activeBranchId}
                  onSwitchBranch={handleSwitchBranch}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  showToast={showToast}
                  onSwitchRole={handleSwitchRole}
                />
              )}

              {/* INSPEKSI DATA CABANG LANGSUNG DARI OWNER */}
              {activeTab === 'sigap-siswa' && (
                <DataSiswaSigapView 
                  showToast={showToast} 
                />
              )}
              {activeTab === 'sigap-guru' && (
                <DataGuruSigapView 
                  showToast={showToast} 
                />
              )}
              {activeTab === 'sigap-alumni' && (
                <DataAlumniSigapView 
                  showToast={showToast} 
                />
              )}
              {activeTab === 'sigap-kelas' && (
                <DataKelasSigapView 
                  showToast={showToast} 
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'sigap-jadwal' && (
                <JadwalSigapView 
                  showToast={showToast} 
                />
              )}
              {activeTab === 'sigap-lokasi-qr' && (
                <LokasiQRSigapView 
                  showToast={showToast} 
                />
              )}
              {activeTab === 'sigap-monitoring' && (
                <MonitoringSigapView 
                  showToast={showToast} 
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
                />
              )}

              {/* GAMBAR 4: DATA ALUMNI */}
              {activeTab === 'sigap-alumni' && (
                <DataAlumniSigapView 
                  showToast={showToast} 
                />
              )}

              {/* GAMBAR 1: DATA KELAS & WALI */}
              {activeTab === 'sigap-kelas' && (
                <DataKelasSigapView 
                  showToast={showToast} 
                  setActiveTab={setActiveTab}
                />
              )}

              {/* GAMBAR 2: ATUR JADWAL PELAJARAN */}
              {activeTab === 'sigap-jadwal' && (
                <JadwalSigapView 
                  showToast={showToast} 
                />
              )}

              {/* GAMBAR 3: QR & LOKASI KELAS */}
              {activeTab === 'sigap-lokasi-qr' && (
                <LokasiQRSigapView 
                  showToast={showToast} 
                />
              )}

              {/* GAMBAR 4: MONITORING & REKAPITULASI */}
              {activeTab === 'sigap-monitoring' && (
                <MonitoringSigapView 
                  showToast={showToast} 
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
                />
              )}

              {/* MENU KBM LAINNYA YANG BELUM DIBUAT (MISAL DATA MAPEL) */}
              {![
                'sigap-dashboard', 
                'dashboard', 
                'sigap-siswa', 
                'sigap-guru', 
                'sigap-alumni',
                'sigap-kelas',
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

          {/* Saring Santri & Halaqah Khusus Role Pengampu: HANYA tampilkan santri di halaqah pengampu */}
          {(() => {
            const activePengampuHalaqahId = 'h-wahyudin';
            const effectiveSantriList = (currentRole === 'pengampu')
              ? santriList.filter(s => s.halaqahId === activePengampuHalaqahId)
              : santriList;
            const effectiveHalaqahList = (currentRole === 'pengampu')
              ? halaqahList.filter(h => h.id === activePengampuHalaqahId)
              : halaqahList;

            return (
              <>
                {/* DASHBOARD UNTUK ROLE PENGAMPU & ORANG TUA */}
                {currentRole !== 'superadmin' && currentRole !== 'owner' && activeTab === 'dashboard' && (
                  <DashboardView 
                    santriList={effectiveSantriList}
                    halaqahList={effectiveHalaqahList}
                    setoranList={setoranList}
                    absensiList={absensiList}
                    currentRole={currentRole}
                    setActiveTab={setActiveTab}
                    onSelectSantri={(id) => { setSelectedSantriId(id); setActiveTab('santri'); }}
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
                    />
                  </div>
                )}

                {activeTab === 'izin' && (
                  <PermohonanIzinView 
                    santriList={effectiveSantriList}
                    currentRole={currentRole}
                    onReload={loadData}
                    showToast={showToast}
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
                    />
                  </div>
                )}
              </>
            );
          })()}

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
        santriList={currentRole === 'pengampu' ? santriList.filter(s => s.halaqahId === 'h-wahyudin') : santriList}
        halaqahList={currentRole === 'pengampu' ? halaqahList.filter(h => h.id === 'h-wahyudin') : halaqahList}
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
      />
    </div>
  );
}
