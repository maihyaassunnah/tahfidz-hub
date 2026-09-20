import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  UserCheck, 
  Shield, 
  Sliders, 
  KeyRound, 
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  Download,
  BarChart3,
  Receipt,
  Settings,
  Camera,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowUpRight,
  ChevronDown,
  CheckSquare,
  FileText,
  Filter
} from 'lucide-react';
import { storageService } from '../../services/storage';
import PengaturanAdminView from '../PengaturanAdminView';

export default function OwnerView({ 
  activeBranchId, 
  onSwitchBranch, 
  activeTab, 
  setActiveTab, 
  showToast,
  onSwitchRole
}) {
  const [currentSubTab, setCurrentSubTab] = useState(
    activeTab?.startsWith('owner-') ? (
      activeTab.replace('owner-', '') === 'superadmin' ? 'cabang' : activeTab.replace('owner-', '')
    ) : 'dashboard'
  );

  const [cabangList, setCabangList] = useState([]);
  const [superAdminList, setSuperAdminList] = useState([]);
  const [allSantri, setAllSantri] = useState([]);
  const [allGurus, setAllGurus] = useState([]);

  // Unified Branch Hub Inspector State ("All-in-One Branch Detail")
  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId || 'cabang-pusat');
  const [branchInspectorTab, setBranchInspectorTab] = useState(
    activeTab === 'owner-superadmin' ? 'pengaturan' : 'ringkasan'
  ); // 'ringkasan' | 'santri' | 'guru' | 'spp' | 'pengaturan'
  const [viewModeCabang, setViewModeCabang] = useState('detail'); // 'detail' | 'list'
  const [searchSantriBranch, setSearchSantriBranch] = useState('');
  const [searchGuruBranch, setSearchGuruBranch] = useState('');
  const [searchSPPBranch, setSearchSPPBranch] = useState('');
  const [filterSPPStatus, setFilterSPPStatus] = useState('all');

  // Theme reference state (Interactive Calendar & Today Tasks)
  const [taskFilter, setTaskFilter] = useState('semua');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(19);
  const [searchDashboard, setSearchDashboard] = useState('');
  const [calendarMonth, setCalendarMonth] = useState('September 2026');

  // Modals state
  const [showAddCabangModal, setShowAddCabangModal] = useState(false);
  const [editingCabang, setEditingCabang] = useState(null);
  const [showAddSAModal, setShowAddSAModal] = useState(false);
  const [editingSA, setEditingSA] = useState(null);
  const [resetSAPasswordTarget, setResetSAPasswordTarget] = useState(null);
  const [newResetPassword, setNewResetPassword] = useState('bismillah123');

  // Search filter
  const [searchCabang, setSearchCabang] = useState('');
  const [searchSA, setSearchSA] = useState('');
  const [filterSACabang, setFilterSACabang] = useState('ALL');

  // Password visibility map: { [saId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedSAId, setCopiedSAId] = useState(null);

  // Form inputs for Cabang
  const [cabangForm, setCabangForm] = useState({
    nama: '',
    kode: '',
    kota: 'Tasikmalaya',
    alamat: '',
    noHp: '',
    penanggungJawab: '',
    email: '',
    warnaAksen: '#0d9488'
  });

  // Form inputs for Super Admin
  const [saForm, setSaForm] = useState({
    nama: '',
    username: '',
    email: '',
    password: 'bismillah123',
    cabangId: 'cabang-pusat',
    noHp: '',
    status: 'Aktif'
  });

  // Color preset options for Branch
  const COLOR_PRESETS = [
    { label: 'Emerald / Hijau', value: '#0d9488' },
    { label: 'Navy / Biru', value: '#2563eb' },
    { label: 'Forest / Pinus', value: '#10b981' },
    { label: 'Violet / Ungu', value: '#7c3aed' },
    { label: 'Amber / Oranye', value: '#d97706' },
    { label: 'Crimson / Merah', value: '#e11d48' }
  ];

  const reloadData = () => {
    storageService.init();
    const cList = storageService.getCabang();
    const saList = storageService.getSuperAdminAccounts();
    const santri = storageService.getAllSantriRaw();
    const gurus = storageService.getAllSigapGuruRaw();

    setCabangList(cList);
    setSuperAdminList(saList);
    setAllSantri(santri);
    setAllGurus(gurus);
  };

  useEffect(() => {
    reloadData();

    // Auto-sync data terbaru dari PostgreSQL server saat OwnerView aktif
    storageService.syncFromPostgres().then(res => {
      if (res && res.success) {
        reloadData();
      }
    }).catch(() => {});

    const handleUpdate = () => {
      reloadData();
    };
    window.addEventListener('simtah_data_updated', handleUpdate);
    window.addEventListener('simtah_santri_updated', handleUpdate);
    return () => {
      window.removeEventListener('simtah_data_updated', handleUpdate);
      window.removeEventListener('simtah_santri_updated', handleUpdate);
    };
  }, [activeBranchId]);

  // Sync selected branch if activeBranchId changes externally
  useEffect(() => {
    if (activeBranchId) {
      setSelectedBranchId(activeBranchId);
    }
  }, [activeBranchId]);

  // Sync sub tab when activeTab changes externally
  useEffect(() => {
    if (activeTab?.startsWith('owner-')) {
      const sub = activeTab.replace('owner-', '');
      setCurrentSubTab(sub);
    } else if (activeTab === 'sigap-konfigurasi') {
      setCurrentSubTab('konfigurasi');
    }
  }, [activeTab]);

  const handleSelectSubTab = (tabId) => {
    setCurrentSubTab(tabId);
    if (setActiveTab) {
      if (tabId === 'konfigurasi') {
        setActiveTab('owner-konfigurasi');
      } else {
        setActiveTab(`owner-${tabId}`);
      }
    }
  };

  // Open & inspect specific branch with Super Admin menus and views
  const handleInspectBranch = (branchId) => {
    setSelectedBranchId(branchId);
    if (onSwitchBranch) {
      onSwitchBranch(branchId);
    }
    if (setActiveTab) {
      setActiveTab('sigap-dashboard');
    }
    const matched = (cabangList || []).find(c => c.id === branchId);
    showToast?.(`Membuka menu Super Admin cabang: ${matched?.nama || branchId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle show/hide password
  const toggleShowPassword = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy password to clipboard
  const handleCopyPassword = (sa) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sa.password);
      setCopiedSAId(sa.id);
      showToast?.(`Password untuk "${sa.nama}" (${sa.password}) disalin ke clipboard!`);
      setTimeout(() => setCopiedSAId(null), 2500);
    }
  };

  // Reset Super Admin password
  const handleConfirmResetPassword = () => {
    if (!resetSAPasswordTarget) return;
    const ok = storageService.resetPasswordSuperAdmin(resetSAPasswordTarget.id, newResetPassword);
    if (ok) {
      showToast?.(`Password akun "${resetSAPasswordTarget.nama}" berhasil direset menjadi: ${newResetPassword}`);
      reloadData();
    }
    setResetSAPasswordTarget(null);
    setNewResetPassword('bismillah123');
  };

  // Open edit Cabang modal
  const handleOpenEditCabang = (cabang) => {
    setEditingCabang(cabang);
    setCabangForm({
      nama: cabang.nama || '',
      kode: cabang.kode || '',
      kota: cabang.kota || 'Tasikmalaya',
      alamat: cabang.alamat || '',
      noHp: cabang.noHp || '',
      penanggungJawab: cabang.penanggungJawab || '',
      email: cabang.email || '',
      warnaAksen: cabang.warnaAksen || '#0d9488'
    });
    setShowAddCabangModal(true);
  };

  // Save (Add or Edit) Cabang
  const handleSaveCabang = (e) => {
    e.preventDefault();
    if (!cabangForm.nama.trim()) {
      alert('Nama Cabang Lembaga wajib diisi!');
      return;
    }

    if (editingCabang) {
      storageService.updateCabang(editingCabang.id, cabangForm);
      showToast?.(`Cabang "${cabangForm.nama}" berhasil diperbarui!`);
    } else {
      const created = storageService.addCabang(cabangForm);
      showToast?.(`Cabang baru "${created.nama}" berhasil ditambahkan!`);
    }

    setShowAddCabangModal(false);
    setEditingCabang(null);
    setCabangForm({
      nama: '',
      kode: '',
      kota: 'Tasikmalaya',
      alamat: '',
      noHp: '',
      penanggungJawab: '',
      email: '',
      warnaAksen: '#0d9488'
    });
    reloadData();
  };

  // Delete Cabang
  const handleDeleteCabang = (cabang) => {
    if (cabang.id === 'cabang-pusat') {
      alert('Cabang Utama (Pusat) adalah cabang default dan tidak dapat dihapus.');
      return;
    }
    if (window.confirm(`Hapus cabang "${cabang.nama}"? Data santri dan akun yang terhubung akan tetap tersimpan aman.`)) {
      const ok = storageService.deleteCabang(cabang.id);
      if (ok) {
        showToast?.(`Cabang "${cabang.nama}" berhasil dihapus.`);
        reloadData();
      }
    }
  };

  // Open edit Super Admin modal
  const handleOpenEditSA = (sa) => {
    setEditingSA(sa);
    setSaForm({
      nama: sa.nama || '',
      username: sa.username || '',
      email: sa.email || '',
      password: sa.password || 'bismillah123',
      cabangId: sa.cabangId || 'cabang-pusat',
      noHp: sa.noHp || '',
      status: sa.status || 'Aktif'
    });
    setShowAddSAModal(true);
  };

  // Save (Add or Edit) Super Admin
  const handleSaveSA = (e) => {
    e.preventDefault();
    if (!saForm.nama.trim() || !saForm.username.trim()) {
      alert('Nama Lengkap dan Username Super Admin wajib diisi!');
      return;
    }

    if (editingSA) {
      storageService.updateSuperAdminAccount(editingSA.id, saForm);
      showToast?.(`Akun Super Admin "${saForm.nama}" berhasil diperbarui!`);
    } else {
      const created = storageService.addSuperAdminAccount(saForm);
      showToast?.(`Akun Super Admin "${created.nama}" untuk cabang ${created.cabangNama} berhasil dibuat!`);
    }

    setShowAddSAModal(false);
    setEditingSA(null);
    setSaForm({
      nama: '',
      username: '',
      email: '',
      password: 'bismillah123',
      cabangId: cabangList[0]?.id || 'cabang-pusat',
      noHp: '',
      status: 'Aktif'
    });
    reloadData();
  };

  // Delete Super Admin
  const handleDeleteSA = (sa) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun Super Admin "${sa.nama}" (${sa.cabangNama})?`)) {
      storageService.deleteSuperAdminAccount(sa.id);
      showToast?.(`Akun Super Admin "${sa.nama}" telah dihapus.`);
      reloadData();
    }
  };

  // Switch to a branch and inspect as Super Admin
  const handleEnterBranchAsAdmin = (branchId) => {
    if (onSwitchBranch) {
      onSwitchBranch(branchId);
    }
    if (onSwitchRole) {
      onSwitchRole('superadmin');
    }
    const matched = cabangList.find(c => c.id === branchId);
    showToast?.(`Beralih mengelola "${matched?.nama || branchId}" sebagai Super Admin!`);
  };

  // Metrics calculation
  const isAllBranches = !activeBranchId || activeBranchId === 'ALL';
  const currentActiveBranch = isAllBranches 
    ? { id: 'ALL', nama: 'Semua Cabang (Pusat & Ranting)', kode: 'SEMUA', kota: 'Seluruh Wilayah' }
    : (cabangList.find(c => c.id === activeBranchId) || cabangList[0] || {});

  const displayedSantri = isAllBranches 
    ? allSantri 
    : allSantri.filter(s => (s.cabangId || 'cabang-pusat') === activeBranchId);

  const displayedGurus = isAllBranches 
    ? allGurus 
    : allGurus.filter(g => {
        const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
        return gBranch === activeBranchId;
      });

  const totalCabang = cabangList.length;
  const totalSA = superAdminList.length;
  const totalSantriGlobal = displayedSantri.length;
  const totalGuruGlobal = displayedGurus.length;

  return (
    <div className="owner-container" style={{ maxWidth: '1480px', margin: '0 auto', background: '#f8f9fc', minHeight: '100vh' }}>
      {/* =========================================================
          1. TOP EXECUTIVE OVERVIEW BAR (CLEAN & MINIMALIST)
          ========================================================= */}
      <div 
        className="owner-top-bar"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #eef2f6',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span 
              style={{ 
                background: '#fff0ec', 
                color: '#ff5b35', 
                fontSize: '0.72rem', 
                fontWeight: '800', 
                padding: '0.2rem 0.65rem', 
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: '1px solid #ffdcd3'
              }}
            >
              <Sparkles size={12} /> PORTAL OWNER YAYASAN
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              Pesantren Persatuan Islam As-Sunnah (PPIAS)
            </span>
          </div>

          <h1 className="owner-title-h1" style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 0.25rem 0', color: '#1e293b', letterSpacing: '-0.02em' }}>
            Tahfidz HUB — Pusat Kendali Yayasan<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b' }}>
            {isAllBranches 
              ? `Monitoring konsolidasi seluruh cabang pesantren (${totalCabang} cabang terdaftar, ${allSantri.length} santri, ${allGurus.length} pengampu).`
              : `Monitoring khusus cabang ${currentActiveBranch.nama} (${displayedSantri.length} santri, ${displayedGurus.length} pengampu terdaftar).`
            }
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.45rem' }}>
            {isAllBranches ? (
              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                🌐 Menampilkan Seluruh Cabang (Konsolidasi Global)
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ background: '#fff0ec', color: '#ff5b35', border: '1px solid #ffdcd3', padding: '2px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  📍 Filter Cabang: {currentActiveBranch.nama} ({currentActiveBranch.kode})
                </span>
                <button
                  onClick={() => onSwitchBranch && onSwitchBranch('ALL')}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                  title="Tampilkan seluruh cabang"
                >
                  ✕ Beralih ke Semua Cabang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Branch Quick Switcher & Action Capsule */}
        <div className="owner-quick-switcher" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div 
            className="owner-branch-select-capsule"
            style={{ 
              background: '#f8f9fd', 
              padding: '0.45rem 0.95rem', 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <MapPin size={15} color="#ff5b35" />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Pilihan Cabang:</span>
            <select
              value={activeBranchId || 'ALL'}
              onChange={(e) => {
                const val = e.target.value;
                if (onSwitchBranch) onSwitchBranch(val);
                if (val !== 'ALL') {
                  setSelectedBranchId(val);
                }
              }}
              style={{
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '16px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="ALL">🌐 Semua Cabang (Pusat & Ranting)</option>
              {cabangList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.kode})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingCabang(null);
              setCabangForm({
                nama: '',
                kode: '',
                kota: 'Tasikmalaya',
                alamat: '',
                noHp: '',
                penanggungJawab: '',
                email: '',
                warnaAksen: '#ff5b35'
              });
              setShowAddCabangModal(true);
            }}
            className="owner-theme-coral-btn"
          >
            <Plus size={15} />
            <span>Cabang Baru</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. SUB-NAVIGATION TABS (PILL STYLE WITH CORAL TRAILING DOT)
          ========================================================= */}
      <div className="owner-subtabs-scroll">
        {[
          { id: 'dashboard', label: 'Dashboard Yayasan .', icon: Layers },
          { id: 'cabang', label: `Analisis & Kelola Cabang . (${cabangList.length})`, icon: Building2 },
          { id: 'superadmin', label: `Akun Super Admin . (${superAdminList.length})`, icon: ShieldCheck },
          { id: 'rekap', label: 'Konsolidasi Seluruh Cabang .', icon: FileText },
          { id: 'konfigurasi', label: 'Konfigurasi Unit & Akun .', icon: Settings },
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = currentSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectSubTab(tab.id)}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '30px',
                fontWeight: isActive ? '800' : '600',
                color: isActive ? '#ff5b35' : '#64748b',
                background: isActive ? '#ffffff' : '#f1f3f9',
                border: isActive ? '1px solid #ffdcd3' : '1px solid transparent',
                boxShadow: isActive ? '0 4px 16px rgba(255, 91, 53, 0.12)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.86rem',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              <IconComponent size={17} color={isActive ? '#ff5b35' : '#94a3b8'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================
          3. TAB 1: DASHBOARD MULTI-CABANG (RESPONSIVE GRID THEME)
          ========================================================= */}
      {currentSubTab === 'dashboard' && (
        <div className="owner-dashboard-grid">
          {/* =========================================================
              LEFT COLUMN: CABANG LEMBAGA + AKTIVITAS HARI INI
              ========================================================= */}
          <div className="owner-left-column">
            {/* 1. TOP SECTION: CABANG LEMBAGA ("My Classes .") */}
            <div style={{ marginBottom: '2.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
                    Cabang Lembaga<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                    {isAllBranches 
                      ? `Menampilkan seluruh ${cabangList.length} cabang lembaga yang terdaftar`
                      : `Filter aktif: Menampilkan data khusus cabang ${currentActiveBranch.nama}`
                    }
                  </div>
                </div>
                <button
                  onClick={() => handleSelectSubTab('cabang')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff5b35',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Lihat Semua ({cabangList.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Dynamic Pastel Cards Grid from Real cabangList + Add Branch Card */}
              <div className="owner-branch-cards-grid">
                {(isAllBranches ? cabangList : cabangList.filter(c => c.id === activeBranchId)).map((cabang, idx) => {
                  // Palet warna pastel bergantian secara dinamis
                  const PALETTES = [
                    { bg: '#ebfaf6', iconBg: '#10b981', shadow: 'rgba(16, 185, 129, 0.28)', defaultIcon: Building2 },
                    { bg: '#fef8e7', iconBg: '#f59e0b', shadow: 'rgba(245, 158, 11, 0.28)', defaultIcon: GraduationCap },
                    { bg: '#f3effc', iconBg: '#8b5cf6', shadow: 'rgba(139, 92, 246, 0.28)', defaultIcon: Users },
                    { bg: '#e0f2fe', iconBg: '#0284c7', shadow: 'rgba(2, 132, 199, 0.28)', defaultIcon: BookOpen },
                    { bg: '#fdf2f8', iconBg: '#ec4899', shadow: 'rgba(236, 72, 153, 0.28)', defaultIcon: Award }
                  ];
                  const palette = PALETTES[idx % PALETTES.length];
                  const IconComp = palette.defaultIcon;
                  const branchSantri = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === cabang.id);
                  const branchGurus = allGurus.filter(g => {
                    const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
                    return gBranch === cabang.id;
                  });
                  const isCurrentActive = (cabang.id === activeBranchId);

                  return (
                    <div 
                      key={cabang.id}
                      className="owner-branch-card-item"
                      onClick={() => handleInspectBranch(cabang.id, 'ringkasan')}
                      style={{
                        background: palette.bg,
                        borderRadius: '24px',
                        padding: '1.4rem 1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: isCurrentActive ? '0 6px 20px rgba(0,0,0,0.08)' : '0 4px 18px rgba(0,0,0,0.02)',
                        border: isCurrentActive ? `2px solid ${palette.iconBg}` : '1px solid rgba(0,0,0,0.03)',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      title={`Klik untuk menganalisa & membuka seluruh informasi ${cabang.nama}`}
                    >
                      {isCurrentActive && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '12px',
                            background: '#ffffff',
                            color: palette.iconBg,
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}
                        >
                          ● AKTIF
                        </div>
                      )}

                      <div 
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '16px',
                          background: cabang.warnaAksen || palette.iconBg,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem',
                          boxShadow: `0 6px 14px ${palette.shadow}`
                        }}
                      >
                        <IconComp size={26} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                        {cabang.nama}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '1.25rem' }}>
                        {branchSantri.length} Santri Terdaftar {branchGurus.length > 0 ? `• ${branchGurus.length} Guru` : ''}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspectBranch(cabang.id, 'ringkasan');
                        }}
                        style={{
                          width: '100%',
                          background: '#ffffff',
                          color: '#1e293b',
                          border: 'none',
                          borderRadius: '24px',
                          padding: '0.65rem 1.25rem',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Buka & Analisis Cabang →
                      </button>
                    </div>
                  );
                })}

                {/* Companion card when filtered: Tampilkan Semua Cabang */}
                {!isAllBranches && (
                  <div 
                    onClick={() => onSwitchBranch && onSwitchBranch('ALL')}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '24px',
                      padding: '1.4rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.02)',
                      border: '1.5px dashed #cbd5e1',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    title="Klik untuk kembali menampilkan seluruh cabang"
                  >
                    <div 
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: '#e2e8f0',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Layers size={26} />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                      Semua Cabang
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '1.25rem' }}>
                      Konsolidasi {cabangList.length} Cabang Terdaftar
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSwitchBranch) onSwitchBranch('ALL');
                      }}
                      style={{
                        width: '100%',
                        background: '#ffffff',
                        color: '#ff5b35',
                        border: '1px solid #ffdcd3',
                        borderRadius: '24px',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🌐 Tampilkan Semua Cabang →
                    </button>
                  </div>
                )}

                {/* Always-present "+ Tambah Cabang" card */}
                <div 
                  style={{
                    background: '#fff0ec',
                    borderRadius: '24px',
                    padding: '1.4rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 4px 18px rgba(255, 91, 53, 0.06)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    border: '1px dashed #ffdcd3'
                  }}
                >
                  <div 
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      background: '#ff5b35',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      boxShadow: '0 6px 14px rgba(255, 91, 53, 0.28)'
                    }}
                  >
                    <Plus size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                    Tambah Cabang
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '1.25rem' }}>
                    Registrasi Unit Baru
                  </div>
                  <button
                    onClick={() => {
                      setEditingCabang(null);
                      setCabangForm({
                        nama: '',
                        kode: '',
                        kota: 'Tasikmalaya',
                        alamat: '',
                        noHp: '',
                        penanggungJawab: '',
                        email: '',
                        warnaAksen: '#ff5b35'
                      });
                      setShowAddCabangModal(true);
                    }}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      color: '#ff5b35',
                      border: 'none',
                      borderRadius: '24px',
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    + Daftarkan
                  </button>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE SECTION: TODAY TASKS ("Aktivitas & Monitoring Hari Ini .") */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
                  Aktivitas & Monitoring Hari Ini<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
                </h2>
              </div>

              {/* Filter Tabs matching reference: Forum | To - do | Members */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '1.75rem', 
                  borderBottom: '1.5px solid #eef2f6', 
                  marginBottom: '1.25rem',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}
              >
                {[
                  { id: 'semua', label: 'Semua Unit' },
                  { id: 'setoran', label: 'Setoran Tahfidz' },
                  { id: 'presensi', label: 'Presensi Santri' },
                  { id: 'izin', label: 'Izin Pengampu' },
                  { id: 'spp', label: 'SPP Keuangan' }
                ].map(t => {
                  const isActive = taskFilter === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTaskFilter(t.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '6px 2px 12px 2px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? '800' : '600',
                        color: isActive ? '#ff5b35' : '#94a3b8',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{t.label}</span>
                      {isActive && (
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: '-1.5px',
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: '#ff5b35',
                            borderRadius: '3px'
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Task Items List matching reference card format */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(() => {
                  const rawActivities = [
                    {
                      id: 'act-1',
                      cabangId: 'cabang-pusat',
                      cabangNama: 'MA Ihya As-Sunnah',
                      type: 'setoran',
                      title: "Setoran Surat Al-Mulk ayat 1-30 • Ananda Farhan",
                      subtitle: "MA Ihya As-Sunnah • Halaqah Ustadz Wahyudin",
                      tag: "Setoran",
                      icon: BookOpen,
                      iconBg: "#ebfaf6",
                      iconColor: "#10b981",
                      primaryBtn: { label: "+ Buka Unit", style: "coral", action: () => handleEnterBranchAsAdmin('cabang-pusat') },
                      secondaryBtn: null
                    },
                    {
                      id: 'act-2',
                      cabangId: 'cabang-pusat',
                      cabangNama: 'MA Ihya As-Sunnah',
                      type: 'presensi',
                      title: "Presensi Halaqoh Shubuh Terverifikasi (100% Hadir)",
                      subtitle: "MA Ihya As-Sunnah • Pengampu Bertugas",
                      tag: "Presensi",
                      icon: CheckCircle2,
                      iconBg: "#ebfaf6",
                      iconColor: "#10b981",
                      primaryBtn: { label: "Terverifikasi", style: "peach", action: () => showToast?.("Presensi halaqoh shubuh sudah terekam") },
                      secondaryBtn: null
                    },
                    {
                      id: 'act-3',
                      cabangId: 'cabang-pusat',
                      cabangNama: 'MA Ihya As-Sunnah',
                      type: 'izin',
                      title: "Pengajuan Izin Sakit • Ustadz Pengampu",
                      subtitle: "MA Ihya As-Sunnah • Durasi 2 Hari (Surat Terlampir)",
                      tag: "Izin",
                      icon: Clock,
                      iconBg: "#fef8e7",
                      iconColor: "#f59e0b",
                      primaryBtn: { label: "+ Setujui", style: "coral", action: () => showToast?.("Permohonan izin disetujui") },
                      secondaryBtn: { label: "Detail", style: "peach", action: () => showToast?.("Menampilkan detail izin") }
                    },
                    {
                      id: 'act-4',
                      cabangId: 'cabang-pusat',
                      cabangNama: 'MA Ihya As-Sunnah',
                      type: 'spp',
                      title: "Pembayaran Syahriah Lunas • Rp 350.000",
                      subtitle: "MA Ihya As-Sunnah • Santri: Rayhan Al-Fatih",
                      tag: "SPP",
                      icon: Receipt,
                      iconBg: "#fef8e7",
                      iconColor: "#f59e0b",
                      primaryBtn: { label: "Kuitansi", style: "peach", action: () => showToast?.("Mencetak kuitansi SPP santri") },
                      secondaryBtn: null
                    },
                    {
                      id: 'act-5',
                      cabangId: 'cabang-pusat',
                      cabangNama: 'MA Ihya As-Sunnah',
                      type: 'setoran',
                      title: "Tasmi' 5 Juz Sekaligus (Juz 1-5 Mumtaz) • Zaidan",
                      subtitle: "MA Ihya As-Sunnah • Simaan Bil Ghaib",
                      tag: "Tasmi'",
                      icon: Award,
                      iconBg: "#f3effc",
                      iconColor: "#8b5cf6",
                      primaryBtn: { label: "Selesai", style: "peach", action: () => showToast?.("Tasmi' telah diverifikasi Dewan Masyaikh") },
                      secondaryBtn: null
                    }
                  ];

                  // Combine with real setoran from database
                  const realSetoran = (storageService.getSetoran ? storageService.getSetoran(isAllBranches ? null : activeBranchId) : []).map(s => ({
                    id: 'real-set-' + s.id,
                    cabangId: s.cabangId || 'cabang-pusat',
                    cabangNama: (cabangList.find(c => c.id === (s.cabangId || 'cabang-pusat'))?.nama) || 'MA Ihya As-Sunnah',
                    type: 'setoran',
                    title: `Setoran Juz ${s.juz || '30'} (${s.surat || 'Al-Qur\'an'}) • ${s.santriNama || 'Santri'}`,
                    subtitle: `${(cabangList.find(c => c.id === (s.cabangId || 'cabang-pusat'))?.nama) || 'MA Ihya As-Sunnah'} • Nilai: ${s.nilai || 'Mumtaz'}`,
                    tag: s.jenis || 'Setoran',
                    icon: BookOpen,
                    iconBg: '#ebfaf6',
                    iconColor: '#10b981',
                    primaryBtn: { label: "+ Detail", style: "coral", action: () => showToast?.(`Membuka setoran ${s.santriNama}`) },
                    secondaryBtn: null
                  }));

                  const allCombined = [...realSetoran, ...rawActivities];

                  const visibleActivities = allCombined.filter(item => {
                    if (taskFilter !== 'semua' && item.type !== taskFilter) return false;
                    if (isAllBranches) return true;
                    return item.cabangId === activeBranchId;
                  });

                  if (visibleActivities.length === 0) {
                    return (
                      <div 
                        style={{
                          background: '#ffffff',
                          borderRadius: '20px',
                          padding: '2.5rem 1.5rem',
                          textAlign: 'center',
                          border: '1.5px dashed #e2e8f0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            background: '#fff0ec', 
                            color: '#ff5b35', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            marginBottom: '0.75rem' 
                          }}
                        >
                          <CheckCircle2 size={26} />
                        </div>
                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>
                          Belum Ada Aktivitas untuk Cabang {currentActiveBranch.nama}
                        </h4>
                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#64748b', maxWidth: '440px', marginInline: 'auto', lineHeight: '1.5' }}>
                          Cabang ini belum memiliki catatan setoran atau absensi aktif hari ini. Aktivitas akan tercatat otomatis saat santri atau pengampu beraktivitas di cabang ini.
                        </p>
                        <button
                          onClick={() => onSwitchBranch && onSwitchBranch('ALL')}
                          style={{
                            background: '#ff5b35',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '0.55rem 1.25rem',
                            fontSize: '0.82rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255, 91, 53, 0.28)'
                          }}
                        >
                          🌐 Tampilkan Aktivitas Seluruh Cabang
                        </button>
                      </div>
                    );
                  }

                  return visibleActivities.map(task => {
                    const IconComp = task.icon;
                    return (
                      <div 
                        key={task.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '18px',
                          padding: '0.95rem 1.25rem',
                          border: '1px solid #f1f3f9',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Left: Pastel Icon + Content */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                          <div 
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              background: task.iconBg,
                              color: task.iconColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <IconComp size={20} />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '800', color: '#1e293b' }}>
                                {task.title}
                              </h4>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>
                                • {task.tag}
                              </span>
                              {isAllBranches && task.cabangNama && (
                                <span style={{ fontSize: '0.68rem', background: '#fff0ec', color: '#ff5b35', padding: '1px 6px', borderRadius: '8px', fontWeight: '700' }}>
                                  {task.cabangNama}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                              {task.subtitle}
                            </div>
                          </div>
                        </div>

                        {/* Right: Pill Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          {task.secondaryBtn && (
                            <button
                              onClick={task.secondaryBtn.action}
                              className="owner-theme-peach-btn"
                              style={{ padding: '6px 14px', fontSize: '0.76rem' }}
                            >
                              {task.secondaryBtn.label}
                            </button>
                          )}
                          {task.primaryBtn && (
                            <button
                              onClick={task.primaryBtn.action}
                              className={task.primaryBtn.style === 'coral' ? 'owner-theme-coral-btn' : 'owner-theme-peach-btn'}
                              style={{ padding: '6px 16px', fontSize: '0.76rem' }}
                            >
                              {task.primaryBtn.label}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: SEARCH BAR + CALENDAR + UPCOMING AGENDA
              ========================================================= */}
          <div className="owner-right-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. SEARCH BAR + OWNER AVATAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  flex: 1, 
                  background: '#ffffff', 
                  borderRadius: '30px', 
                  padding: '8px 14px', 
                  border: '1px solid #eef2f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <Search size={15} color="#94a3b8" />
                <input 
                  type="text"
                  placeholder="Search for anythings ..."
                  value={searchDashboard}
                  onChange={(e) => setSearchDashboard(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    width: '100%',
                    color: '#1e293b'
                  }}
                />
              </div>

              {/* Owner Avatar Pill with Dropdown Arrow */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  background: '#ffffff', 
                  padding: '4px 8px 4px 4px', 
                  borderRadius: '30px', 
                  border: '1px solid #eef2f6',
                  cursor: 'pointer'
                }}
                title="Kelola Profil Owner"
                onClick={() => handleSelectSubTab('konfigurasi')}
              >
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', 
                    color: '#ff5b35', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.85rem'
                  }}
                >
                  👩‍💼
                </div>
                <ChevronDown size={14} color="#94a3b8" />
              </div>
            </div>

            {/* 2. INTERACTIVE CALENDAR WIDGET */}
            <div 
              style={{ 
                background: '#ffffff', 
                borderRadius: '24px', 
                padding: '1.35rem', 
                border: '1px solid #f1f3f9',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              {/* Month Header with Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#1e293b' }}>
                  {calendarMonth}
                </h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: '#94a3b8' }}
                    onClick={() => setCalendarMonth('Agustus 2026')}
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: '#94a3b8' }}
                    onClick={() => setCalendarMonth('Oktober 2026')}
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Days of Week Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.65rem' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
                  <div key={dayName} style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8' }}>
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Calendar Days Grid (Matching exact styling with Coral Circles on 19 and 22) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                {/* Previous month trailing days */}
                {[28, 29, 30, 31].map(d => (
                  <div key={`prev-${d}`} style={{ padding: '6px 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
                    {d}
                  </div>
                ))}

                {/* September 2026 Days (1 to 30) */}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  const isSpecialCoral = (day === 19 || day === 22);
                  const isSelected = selectedCalendarDate === day;

                  return (
                    <div 
                      key={`day-${day}`}
                      onClick={() => {
                        setSelectedCalendarDate(day);
                        showToast?.(`Memilih tanggal ${day} September 2026`);
                      }}
                      style={{
                        padding: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span 
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          fontSize: '0.78rem',
                          fontWeight: (isSpecialCoral || isSelected) ? '800' : '600',
                          background: isSpecialCoral 
                            ? '#ff5b35' 
                            : isSelected 
                              ? '#fff0ec' 
                              : 'transparent',
                          color: isSpecialCoral 
                            ? '#ffffff' 
                            : isSelected 
                              ? '#ff5b35' 
                              : '#334155',
                          boxShadow: isSpecialCoral ? '0 4px 10px rgba(255, 91, 53, 0.38)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. UPCOMING SECTION ("Agenda Mendatang .") */}
            <div 
              style={{ 
                background: '#ffffff', 
                borderRadius: '24px', 
                padding: '1.35rem', 
                border: '1px solid #f1f3f9',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: '900', color: '#1e293b' }}>
                Upcoming<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
              </h3>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Event 1 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ marginTop: '5px', width: '8px', height: '8px', borderRadius: '50%', background: '#ff5b35', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b' }}>
                      Tasmi' Akbar 5 Juz Santri
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Ujian simaan bil ghaib aula utama MA
                    </div>
                  </div>
                  <div 
                    style={{ 
                      background: '#f3effc', 
                      color: '#7c3aed', 
                      padding: '0.35rem 0.65rem', 
                      borderRadius: '12px', 
                      fontSize: '0.72rem', 
                      fontWeight: '800',
                      textAlign: 'right',
                      flexShrink: 0
                    }}
                  >
                    <div>19 Sep</div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: '600' }}>45 Menit</div>
                  </div>
                </div>

                {/* Event 2 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ marginTop: '5px', width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #f59e0b', background: '#fff', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b' }}>
                      Rapat Koordinasi Mudir
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Evaluasi kurikulum & standarisasi tahfidz
                    </div>
                  </div>
                  <div 
                    style={{ 
                      background: '#fef8e7', 
                      color: '#d97706', 
                      padding: '0.35rem 0.65rem', 
                      borderRadius: '12px', 
                      fontSize: '0.72rem', 
                      fontWeight: '800',
                      textAlign: 'right',
                      flexShrink: 0
                    }}
                  >
                    <div>20-21 Sep</div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: '600' }}>3 Jam</div>
                  </div>
                </div>

                {/* Event 3 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ marginTop: '5px', width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #8b5cf6', background: '#fff', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1e293b' }}>
                      Ujian Tahsin & Uji Publik
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Dihadiri dewan asatidz & orang tua santri
                    </div>
                  </div>
                  <div 
                    style={{ 
                      background: '#f3effc', 
                      color: '#7c3aed', 
                      padding: '0.35rem 0.65rem', 
                      borderRadius: '12px', 
                      fontSize: '0.72rem', 
                      fontWeight: '800',
                      textAlign: 'right',
                      flexShrink: 0
                    }}
                  >
                    <div>22 Sep</div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: '600' }}>50 Menit</div>
                  </div>
                </div>
              </div>

              {/* View all link */}
              <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f3f9' }}>
                <button
                  onClick={() => showToast?.("Membuka seluruh kalender agenda tahfidz yayasan")}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff5b35',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <span>View all upcoming</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: KELOLA CABANG LEMBAGA
          ========================================================= */}
      {/* =========================================================
          TAB 2: ANALISIS & KELOLA CABANG (ALL-IN-ONE BRANCH HUB)
          ========================================================= */}
      {currentSubTab === 'cabang' && (() => {
        const effectiveViewMode = (selectedBranchId === 'ALL') ? 'list' : viewModeCabang;
        const selectedBranch = cabangList.find(c => c.id === selectedBranchId) || cabangList[0] || {};
        const branchSantri = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === selectedBranch.id);
        const branchGurus = allGurus.filter(g => {
          const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
          return gBranch === selectedBranch.id;
        });
        const branchSPP = (storageService.getPembayaranSPP ? storageService.getPembayaranSPP({ cabangId: selectedBranch.id }) : []);
        const branchSA = superAdminList.filter(sa => sa.cabangId === selectedBranch.id);

        const sppLunasList = branchSPP.filter(s => s.status?.toLowerCase() === 'lunas');
        const sppTertundaList = branchSPP.filter(s => s.status?.toLowerCase() !== 'lunas');
        const totalSppLunas = sppLunasList.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
        const totalSppTertunda = sppTertundaList.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
        const totalSppSemua = branchSPP.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);

        const filteredBranchSantri = branchSantri.filter(s => {
          if (!searchSantriBranch) return true;
          const q = searchSantriBranch.toLowerCase();
          return (
            (s.nama && s.nama.toLowerCase().includes(q)) ||
            (s.nis && String(s.nis).toLowerCase().includes(q)) ||
            (s.nisn && String(s.nisn).toLowerCase().includes(q)) ||
            (s.halaqah && s.halaqah.toLowerCase().includes(q)) ||
            (s.kelas && String(s.kelas).toLowerCase().includes(q)) ||
            (s.namaWali && s.namaWali.toLowerCase().includes(q))
          );
        });

        const filteredBranchGurus = branchGurus.filter(g => {
          if (!searchGuruBranch) return true;
          const q = searchGuruBranch.toLowerCase();
          return (
            (g.nama && g.nama.toLowerCase().includes(q)) ||
            (g.nip && String(g.nip).toLowerCase().includes(q)) ||
            (g.noHp && String(g.noHp).toLowerCase().includes(q)) ||
            (g.email && g.email.toLowerCase().includes(q)) ||
            (g.halaqah && g.halaqah.toLowerCase().includes(q))
          );
        });

        const filteredBranchSPP = branchSPP.filter(item => {
          if (filterSPPStatus !== 'all') {
            if (filterSPPStatus === 'Lunas' && item.status?.toLowerCase() !== 'lunas') return false;
            if (filterSPPStatus === 'Belum Lunas' && item.status?.toLowerCase() === 'lunas') return false;
          }
          if (!searchSPPBranch) return true;
          const q = searchSPPBranch.toLowerCase();
          return (
            (item.santriNama && item.santriNama.toLowerCase().includes(q)) ||
            (item.invoiceNo && item.invoiceNo.toLowerCase().includes(q)) ||
            (item.bulan && item.bulan.toLowerCase().includes(q)) ||
            (item.nis && String(item.nis).toLowerCase().includes(q))
          );
        });

        return (
          <div>
            {/* Top Bar: Title & View Mode Toggle */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
                  Analisis & Manajemen Cabang Lembaga<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {effectiveViewMode === 'list'
                    ? `Menampilkan matriks komparasi seluruh ${cabangList.length} cabang lembaga yayasan.`
                    : `Menampilkan seluruh data terpadu cabang: ${selectedBranch.nama} (${selectedBranch.kode}).`
                  }
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '24px' }}>
                  <button
                    onClick={() => {
                      if (selectedBranchId === 'ALL') {
                        const fallbackId = (cabangList[0]?.id || 'cabang-pusat');
                        setSelectedBranchId(fallbackId);
                        if (onSwitchBranch) onSwitchBranch(fallbackId);
                      }
                      setViewModeCabang('detail');
                    }}
                    style={{
                      border: 'none',
                      background: effectiveViewMode === 'detail' ? '#ffffff' : 'transparent',
                      color: effectiveViewMode === 'detail' ? '#ff5b35' : '#64748b',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: effectiveViewMode === 'detail' ? '800' : '600',
                      cursor: 'pointer',
                      boxShadow: effectiveViewMode === 'detail' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🔍 Detail Cabang
                  </button>
                  <button
                    onClick={() => {
                      setViewModeCabang('list');
                      setSelectedBranchId('ALL');
                      if (onSwitchBranch) onSwitchBranch('ALL');
                    }}
                    style={{
                      border: 'none',
                      background: effectiveViewMode === 'list' ? '#ffffff' : 'transparent',
                      color: effectiveViewMode === 'list' ? '#ff5b35' : '#64748b',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: effectiveViewMode === 'list' ? '800' : '600',
                      cursor: 'pointer',
                      boxShadow: effectiveViewMode === 'list' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    📋 Matriks Semua Cabang ({cabangList.length})
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingCabang(null);
                    setCabangForm({
                      nama: '',
                      kode: '',
                      kota: 'Tasikmalaya',
                      alamat: '',
                      noHp: '',
                      penanggungJawab: '',
                      email: '',
                      warnaAksen: '#ff5b35'
                    });
                    setShowAddCabangModal(true);
                  }}
                  className="owner-theme-coral-btn"
                  style={{ padding: '0.5rem 1.15rem', fontSize: '0.8rem' }}
                >
                  <Plus size={15} />
                  <span>+ Tambah Cabang</span>
                </button>
              </div>
            </div>

            {/* Quick Branch Switcher Pill Bar */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '0.6rem', 
                marginBottom: '1.5rem', 
                overflowX: 'auto', 
                paddingBottom: '4px',
                whiteSpace: 'nowrap' 
              }}
            >
              {/* 🌐 Semua Cabang Pill Button */}
              <button
                onClick={() => {
                  setSelectedBranchId('ALL');
                  setViewModeCabang('list');
                  if (onSwitchBranch) onSwitchBranch('ALL');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '24px',
                  border: effectiveViewMode === 'list' ? '1.5px solid #ff5b35' : '1px solid #e2e8f0',
                  background: effectiveViewMode === 'list' ? '#fff0ec' : '#ffffff',
                  color: effectiveViewMode === 'list' ? '#ff5b35' : '#334155',
                  fontWeight: effectiveViewMode === 'list' ? '800' : '600',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: effectiveViewMode === 'list' ? '0 3px 10px rgba(255, 91, 53, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <span>🌐 Semua Cabang</span>
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    padding: '1px 7px', 
                    borderRadius: '12px', 
                    background: effectiveViewMode === 'list' ? '#ff5b35' : '#f1f5f9',
                    color: effectiveViewMode === 'list' ? '#ffffff' : '#64748b',
                    fontWeight: '700'
                  }}
                >
                  {cabangList.length} Cabang
                </span>
              </button>

              {cabangList.map(c => {
                const isSelected = (effectiveViewMode === 'detail' && c.id === selectedBranch.id);
                const cSantri = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedBranchId(c.id);
                      setViewModeCabang('detail');
                      if (onSwitchBranch) onSwitchBranch(c.id);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '24px',
                      border: isSelected ? '1.5px solid #ff5b35' : '1px solid #e2e8f0',
                      background: isSelected ? '#fff0ec' : '#ffffff',
                      color: isSelected ? '#ff5b35' : '#334155',
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 3px 10px rgba(255, 91, 53, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    <span 
                      style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: c.warnaAksen || '#ff5b35' 
                      }} 
                    />
                    <span>{c.nama}</span>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '1px 7px', 
                        borderRadius: '12px', 
                        background: isSelected ? '#ff5b35' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        fontWeight: '700'
                      }}
                    >
                      {cSantri.length} Santri
                    </span>
                  </button>
                );
              })}
            </div>

            {/* VIEW MODE 1: DETAIL CABANG LENGKAP */}
            {effectiveViewMode === 'detail' && (
              <div>
                {/* Branch Hero Banner */}
                <div 
                  style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    padding: '1.5rem 1.75rem',
                    border: '1px solid #eef2f6',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '280px', flex: 1 }}>
                    <div 
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: selectedBranch.warnaAksen || '#ff5b35',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 18px rgba(255, 91, 53, 0.28)',
                        flexShrink: 0
                      }}
                    >
                      <Building2 size={32} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <h1 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>
                          {selectedBranch.nama}<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
                        </h1>

                        {selectedBranch.id === 'cabang-pusat' ? (
                          <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                            ★ CABANG PUSAT / UTAMA
                          </span>
                        ) : (
                          <span style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                            ● CABANG RESMI
                          </span>
                        )}

                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                          Kode: {selectedBranch.kode || selectedBranch.id}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                        <div><strong>Mudir:</strong> {selectedBranch.penanggungJawab || 'Ustadz Pembina'}</div>
                        <div>•</div>
                        <div><strong>Kota:</strong> {selectedBranch.kota || 'Tasikmalaya'}</div>
                        {selectedBranch.noHp && (
                          <>
                            <div>•</div>
                            <div><strong>Kontak:</strong> {selectedBranch.noHp}</div>
                          </>
                        )}
                        {selectedBranch.email && (
                          <>
                            <div>•</div>
                            <div style={{ color: '#0284c7' }}>{selectedBranch.email}</div>
                          </>
                        )}
                      </div>

                      {selectedBranch.alamat && (
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          📍 {selectedBranch.alamat}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this Branch */}
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleEnterBranchAsAdmin(selectedBranch.id)}
                      className="owner-theme-coral-btn"
                      style={{ padding: '0.55rem 1.15rem', fontSize: '0.8rem' }}
                      title="Buka panel admin dan kelola operasional cabang ini secara langsung"
                    >
                      <Shield size={14} />
                      <span>Buka Sebagai Admin Cabang</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditCabang(selectedBranch)}
                      className="owner-theme-peach-btn"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}
                      title="Ubah profil atau penanggung jawab cabang ini"
                    >
                      <Edit2 size={14} />
                      <span>Edit Profil Cabang</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs Navigation for This Branch */}
                <div 
                  style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '1.25rem', 
                    overflowX: 'auto', 
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.75rem'
                  }}
                >
                  {[
                    { id: 'ringkasan', label: 'Ringkasan & Analisis .', icon: BarChart3 },
                    { id: 'santri', label: `Data Santri / Siswa (${branchSantri.length}) .`, icon: GraduationCap },
                    { id: 'guru', label: `Pengampu & Asatidz (${branchGurus.length}) .`, icon: Users },
                    { id: 'spp', label: `SPP & Keuangan (${branchSPP.length}) .`, icon: Receipt },
                    { id: 'pengaturan', label: `Akun Admin & Pengaturan .`, icon: ShieldCheck }
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = branchInspectorTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setBranchInspectorTab(tab.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 1.1rem',
                          borderRadius: '20px',
                          border: isActive ? '1px solid #ffdcd3' : '1px solid transparent',
                          background: isActive ? '#ffffff' : '#f8f9fd',
                          color: isActive ? '#ff5b35' : '#64748b',
                          fontWeight: isActive ? '800' : '600',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 3px 12px rgba(255, 91, 53, 0.12)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <TabIcon size={16} color={isActive ? '#ff5b35' : '#94a3b8'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* SUBTAB 1: RINGKASAN & ANALISIS CABANG */}
                {branchInspectorTab === 'ringkasan' && (
                  <div>
                    {/* 4 Stat Metric Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      {/* Santri Card */}
                      <div 
                        onClick={() => setBranchInspectorTab('santri')}
                        style={{
                          background: '#ebfaf6',
                          borderRadius: '20px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                        title="Klik untuk melihat seluruh santri cabang ini"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#047857' }}>SANTRI TERDAFTAR</span>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#064e3b' }}>
                          {branchSantri.length}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#047857', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Aktif dalam halaqoh tahfidz</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>

                      {/* Guru Card */}
                      <div 
                        onClick={() => setBranchInspectorTab('guru')}
                        style={{
                          background: '#fef8e7',
                          borderRadius: '20px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                        title="Klik untuk melihat asatidz & pengampu cabang ini"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b45309' }}>GURU & ASATIDZ</span>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#78350f' }}>
                          {branchGurus.length}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#b45309', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Pengampu & penguji tahfidz</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>

                      {/* SPP Card */}
                      <div 
                        onClick={() => setBranchInspectorTab('spp')}
                        style={{
                          background: '#fff0ec',
                          borderRadius: '20px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          border: '1px solid rgba(255, 91, 53, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                        title="Klik untuk melihat rincian pembayaran SPP cabang ini"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#c2410c' }}>SPP TERBAYAR</span>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#ff5b35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Receipt size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#7c2d12' }}>
                          Rp {totalSppLunas.toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#c2410c', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{sppLunasList.length} Lunas • {sppTertundaList.length} Tertunda</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>

                      {/* Super Admin Card */}
                      <div 
                        onClick={() => setBranchInspectorTab('pengaturan')}
                        style={{
                          background: '#f3effc',
                          borderRadius: '20px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                        title="Klik untuk mengatur akun Super Admin cabang ini"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6d28d9' }}>SUPER ADMIN</span>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={18} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#4c1d95', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {branchSA.length > 0 ? branchSA[0].nama : 'Belum Ada Admin'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#6d28d9', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{branchSA.length > 0 ? `User: ${branchSA[0].username}` : 'Klik untuk buat akun'}</span>
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>

                    {/* Operational Summary Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
                      {/* Legal & Profile Card */}
                      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #eef2f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <Building2 size={18} color="#ff5b35" />
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>
                            Profil & Legalitas Unit Cabang
                          </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                            <span style={{ color: '#64748b' }}>Nama Lembaga:</span>
                            <strong style={{ color: '#1e293b' }}>{selectedBranch.nama}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                            <span style={{ color: '#64748b' }}>Kode Unit:</span>
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', color: '#334155' }}>
                              {selectedBranch.kode || selectedBranch.id}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                            <span style={{ color: '#64748b' }}>Penanggung Jawab / Mudir:</span>
                            <strong style={{ color: '#1e293b' }}>{selectedBranch.penanggungJawab || '-'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                            <span style={{ color: '#64748b' }}>Kota / Wilayah:</span>
                            <strong style={{ color: '#1e293b' }}>{selectedBranch.kota || 'Tasikmalaya'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                            <span style={{ color: '#64748b' }}>Kontak Telepon:</span>
                            <strong style={{ color: '#1e293b' }}>{selectedBranch.noHp || '-'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                            <span style={{ color: '#64748b' }}>Email Resmi:</span>
                            <strong style={{ color: '#0284c7' }}>{selectedBranch.email || '-'}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                            <span style={{ color: '#64748b' }}>Alamat Lengkap:</span>
                            <span style={{ color: '#334155', maxWidth: '220px', textAlign: 'right' }}>
                              {selectedBranch.alamat || selectedBranch.kota || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Health & Sync Card */}
                      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #eef2f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <CheckCircle2 size={18} color="#10b981" />
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#1e293b' }}>
                            Status Operasional & Sinkronisasi
                          </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Database PostgreSQL</span>
                              <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>
                                ● TERHUBUNG LIVE
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              Data santri, guru, setoran, dan presensi cabang ini tersinkronisasi 100% secara real-time.
                            </div>
                          </div>

                          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Rasio Guru : Santri</span>
                              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>
                                1 : {branchGurus.length > 0 ? (branchSantri.length / branchGurus.length).toFixed(1) : '-'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              Rasio bimbingan halaqah ideal di pesantren PPIAS adalah 1 pengampu untuk 10–15 santri.
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button
                              onClick={() => setBranchInspectorTab('santri')}
                              className="owner-theme-peach-btn"
                              style={{ flex: 1, padding: '0.55rem', fontSize: '0.78rem' }}
                            >
                              Lihat Daftar Siswa →
                            </button>
                            <button
                              onClick={() => setBranchInspectorTab('pengaturan')}
                              className="owner-theme-coral-btn"
                              style={{ flex: 1, padding: '0.55rem', fontSize: '0.78rem' }}
                            >
                              Kelola Akun Admin →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: DATA SANTRI / SISWA CABANG */}
                {branchInspectorTab === 'santri' && (
                  <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #eef2f6', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <GraduationCap size={20} color="#ff5b35" />
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>
                            Daftar Santri & Siswa ({branchSantri.length})
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                            Seluruh santri yang terdaftar dan aktif belajar di {selectedBranch.nama}
                          </p>
                        </div>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '9px' }} />
                        <input
                          type="text"
                          placeholder="Cari santri, NIS, halaqah..."
                          value={searchSantriBranch}
                          onChange={(e) => setSearchSantriBranch(e.target.value)}
                          style={{
                            padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.8rem',
                            outline: 'none',
                            background: '#f8fafc',
                            width: '240px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.85rem 1rem' }}>No</th>
                            <th style={{ padding: '0.85rem 1rem' }}>NIS / NISN</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Nama Lengkap Santri</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Kelas / Tingkat</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Halaqah Tahfidz</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Wali Santri & Kontak</th>
                            <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBranchSantri.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                <GraduationCap size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                                <div>Tidak ada data santri yang cocok dengan filter pencarian.</div>
                              </td>
                            </tr>
                          ) : (
                            filteredBranchSantri.map((s, idx) => (
                              <tr key={s.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{idx + 1}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px', fontWeight: '700', color: '#334155', fontSize: '0.78rem' }}>
                                    {s.nis || s.nisn || '-'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <strong style={{ color: '#1e293b' }}>{s.nama}</strong>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                                  {s.kelas || 'Reguler'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem' }}>
                                    {s.halaqah || 'Halaqah Utama'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                  <div>{s.namaWali || s.wali || '-'}</div>
                                  {(s.noHpWali || s.kontak) && (
                                    <a 
                                      href={`https://wa.me/${String(s.noHpWali || s.kontak).replace(/[^0-9]/g, '')}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      style={{ color: '#10b981', textDecoration: 'none', fontWeight: '600', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                    >
                                      💬 {s.noHpWali || s.kontak}
                                    </a>
                                  )}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                  <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                                    ● AKTIF
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: DATA GURU & PENGAMPU CABANG */}
                {branchInspectorTab === 'guru' && (
                  <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #eef2f6', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Users size={20} color="#ff5b35" />
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>
                            Daftar Asatidz & Pengampu ({branchGurus.length})
                          </h3>
                          <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                            Ustadz dan ustadzah yang membina santri tahfidz di {selectedBranch.nama}
                          </p>
                        </div>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '9px' }} />
                        <input
                          type="text"
                          placeholder="Cari asatidz, NIP..."
                          value={searchGuruBranch}
                          onChange={(e) => setSearchGuruBranch(e.target.value)}
                          style={{
                            padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.8rem',
                            outline: 'none',
                            background: '#f8fafc',
                            width: '240px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.85rem 1rem' }}>No</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Nama Asatidz / Pengampu</th>
                            <th style={{ padding: '0.85rem 1rem' }}>NIP / ID</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Kontak WhatsApp</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Email</th>
                            <th style={{ padding: '0.85rem 1rem' }}>Tugas Binaan</th>
                            <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBranchGurus.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                <Users size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                                <div>Belum ada pengampu atau guru yang terdaftar di cabang ini.</div>
                              </td>
                            </tr>
                          ) : (
                            filteredBranchGurus.map((g, idx) => (
                              <tr key={g.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{idx + 1}</td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div 
                                      style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        borderRadius: '50%', 
                                        background: '#fff0ec', 
                                        color: '#ff5b35', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontWeight: '800',
                                        fontSize: '0.75rem' 
                                      }}
                                    >
                                      {g.nama ? g.nama.charAt(0) : 'U'}
                                    </div>
                                    <strong style={{ color: '#1e293b' }}>{g.nama}</strong>
                                  </div>
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{ background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px', fontWeight: '700', color: '#334155', fontSize: '0.78rem' }}>
                                    {g.nip || g.id || '-'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                                  {g.noHp ? (
                                    <a 
                                      href={`https://wa.me/${String(g.noHp).replace(/[^0-9]/g, '')}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      style={{ color: '#10b981', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      💬 {g.noHp}
                                    </a>
                                  ) : '-'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#0284c7' }}>
                                  {g.email || '-'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{ background: '#f3effc', color: '#7c3aed', padding: '2px 8px', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem' }}>
                                    {g.halaqah || g.role || 'Pengampu Halaqah'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                  <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                                    ● AKTIF
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: PEMBAYARAN SPP & KEUANGAN CABANG */}
                {branchInspectorTab === 'spp' && (
                  <div>
                    {/* Financial Summary Top Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.15rem', border: '1px solid #eef2f6' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TOTAL TERBAYAR (LUNAS)</div>
                        <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#16a34a', marginTop: '0.35rem' }}>
                          Rp {totalSppLunas.toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '0.2rem' }}>
                          {sppLunasList.length} transaksi berhasil
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.15rem', border: '1px solid #eef2f6' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TOTAL TERTUNDA</div>
                        <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#d97706', marginTop: '0.35rem' }}>
                          Rp {totalSppTertunda.toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#d97706', marginTop: '0.2rem' }}>
                          {sppTertundaList.length} tagihan belum dibayar
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', borderRadius: '18px', padding: '1.15rem', border: '1px solid #eef2f6' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>TOTAL TAGIHAN SPP</div>
                        <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#1e293b', marginTop: '0.35rem' }}>
                          Rp {totalSppSemua.toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {branchSPP.length} record keseluruhan
                        </div>
                      </div>
                    </div>

                    {/* SPP Table */}
                    <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #eef2f6', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <Receipt size={20} color="#ff5b35" />
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>
                              Rekapitulasi SPP & Syahriah Cabang
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                              Laporan pembayaran syahriah bulanan santri di {selectedBranch.nama}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <select
                            value={filterSPPStatus}
                            onChange={(e) => setFilterSPPStatus(e.target.value)}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: '20px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.8rem',
                              outline: 'none',
                              background: '#f8fafc',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="all">Semua Status</option>
                            <option value="Lunas">Lunas</option>
                            <option value="Belum Lunas">Belum Lunas</option>
                          </select>

                          <div style={{ position: 'relative' }}>
                            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '9px' }} />
                            <input
                              type="text"
                              placeholder="Cari siswa, invoice, bulan..."
                              value={searchSPPBranch}
                              onChange={(e) => setSearchSPPBranch(e.target.value)}
                              style={{
                                padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.8rem',
                                outline: 'none',
                                background: '#f8fafc',
                                width: '220px'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ padding: '0.85rem 1rem' }}>No. Invoice</th>
                              <th style={{ padding: '0.85rem 1rem' }}>Nama Santri & NIS</th>
                              <th style={{ padding: '0.85rem 1rem' }}>Kelas</th>
                              <th style={{ padding: '0.85rem 1rem' }}>Bulan Tagihan</th>
                              <th style={{ padding: '0.85rem 1rem' }}>Nominal</th>
                              <th style={{ padding: '0.85rem 1rem' }}>Tanggal Bayar</th>
                              <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBranchSPP.length === 0 ? (
                              <tr>
                                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                  <Receipt size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                                  <div>Belum ada data pembayaran SPP untuk cabang ini.</div>
                                </td>
                              </tr>
                            ) : (
                              filteredBranchSPP.map((item, idx) => {
                                const isLunas = item.status?.toLowerCase() === 'lunas';
                                return (
                                  <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0284c7', fontSize: '0.8rem' }}>
                                        {item.invoiceNo || `INV-${idx + 1}`}
                                      </span>
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem' }}>
                                      <strong style={{ color: '#1e293b' }}>{item.santriNama || item.santri_nama || '-'}</strong>
                                      {item.nis && <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>NIS: {item.nis}</div>}
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                                      {item.kelas || 'Reguler'}
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#334155' }}>
                                      {item.bulan} {item.tahun || '2026'}
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: '#1e293b' }}>
                                      Rp {(Number(item.nominal) || 0).toLocaleString('id-ID')}
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                      {item.tanggalBayar || item.tanggal || '-'}
                                    </td>
                                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                      <span 
                                        style={{ 
                                          background: isLunas ? '#ecfdf5' : '#fffbeb', 
                                          color: isLunas ? '#047857' : '#b45309', 
                                          border: isLunas ? '1px solid #a7f3d0' : '1px solid #fde68a',
                                          padding: '3px 10px', 
                                          borderRadius: '12px', 
                                          fontSize: '0.72rem', 
                                          fontWeight: '800' 
                                        }}
                                      >
                                        {isLunas ? '✓ LUNAS' : '⏳ BELUM LUNAS'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 5: AKUN ADMIN & PENGATURAN CABANG */}
                {branchInspectorTab === 'pengaturan' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                    {/* Super Admin Credential Box for this Branch */}
                    <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #eef2f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShieldCheck size={20} color="#ff5b35" />
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>
                            Akun Super Admin Cabang
                          </h3>
                        </div>

                        <button
                          onClick={() => {
                            setEditingSA(null);
                            setSaForm({
                              nama: '',
                              username: '',
                              email: '',
                              password: 'bismillah123',
                              cabangId: selectedBranch.id,
                              noHp: '',
                              status: 'Aktif'
                            });
                            setShowAddSAModal(true);
                          }}
                          className="owner-theme-coral-btn"
                          style={{ padding: '0.45rem 0.95rem', fontSize: '0.76rem' }}
                        >
                          <Plus size={13} />
                          <span>+ Buat Akun</span>
                        </button>
                      </div>

                      {branchSA.length === 0 ? (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '1.25rem', textAlign: 'center' }}>
                          <Shield size={32} color="#d97706" style={{ margin: '0 auto 0.5rem auto' }} />
                          <div style={{ fontWeight: '800', color: '#92400e', fontSize: '0.88rem' }}>
                            Belum Ada Akun Super Admin Khusus
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#b45309', margin: '0.35rem 0 0.85rem 0' }}>
                            Cabang ini saat ini diakses menggunakan akun Super Admin default yayasan.
                          </p>
                          <button
                            onClick={() => {
                              setEditingSA(null);
                              setSaForm({
                                nama: `Admin ${selectedBranch.nama}`,
                                username: `admin.${selectedBranch.kode?.toLowerCase() || selectedBranch.id}`,
                                email: selectedBranch.email || '',
                                password: 'bismillah123',
                                cabangId: selectedBranch.id,
                                noHp: selectedBranch.noHp || '',
                                status: 'Aktif'
                              });
                              setShowAddSAModal(true);
                            }}
                            className="owner-theme-coral-btn"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                          >
                            + Buat Akun Super Admin Cabang Ini
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {branchSA.map(sa => {
                            const isPwVisible = !!visiblePasswords[sa.id];
                            return (
                              <div 
                                key={sa.id}
                                style={{
                                  background: '#f8fafc',
                                  borderRadius: '16px',
                                  padding: '1.25rem',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>
                                      {sa.nama}
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                      Role: Super Admin • {sa.status || 'Aktif'}
                                    </span>
                                  </div>
                                  <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: '800' }}>
                                    ● AKTIF ONLINE
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b' }}>Username Login:</span>
                                    <strong style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                                      {sa.username}
                                    </strong>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b' }}>Kata Sandi (Password):</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span 
                                        style={{ 
                                          fontFamily: isPwVisible ? 'monospace' : 'inherit', 
                                          fontWeight: '800', 
                                          color: isPwVisible ? '#dc2626' : '#64748b',
                                          background: '#ffffff',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          border: '1px solid #e2e8f0',
                                          letterSpacing: isPwVisible ? '0' : '2px'
                                        }}
                                      >
                                        {isPwVisible ? sa.password : '••••••••'}
                                      </span>
                                      <button
                                        onClick={() => toggleShowPassword(sa.id)}
                                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px 6px', cursor: 'pointer', color: '#64748b' }}
                                        title={isPwVisible ? "Sembunyikan" : "Intip Password"}
                                      >
                                        {isPwVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                      </button>
                                      <button
                                        onClick={() => handleCopyPassword(sa)}
                                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '3px 6px', cursor: 'pointer', color: copiedSAId === sa.id ? '#16a34a' : '#64748b' }}
                                        title="Salin Password"
                                      >
                                        {copiedSAId === sa.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                                      </button>
                                    </div>
                                  </div>

                                  {sa.noHp && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ color: '#64748b' }}>No. HP Admin:</span>
                                      <span style={{ color: '#334155' }}>{sa.noHp}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons for SA */}
                                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => {
                                      setResetSAPasswordTarget(sa);
                                      setNewResetPassword('bismillah123');
                                    }}
                                    style={{
                                      flex: 1,
                                      background: '#fff0ec',
                                      color: '#ff5b35',
                                      border: '1px solid #ffdcd3',
                                      borderRadius: '16px',
                                      padding: '0.45rem',
                                      fontSize: '0.76rem',
                                      fontWeight: '800',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <RefreshCw size={13} />
                                    <span>Reset Sandi</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditSA(sa)}
                                    style={{
                                      background: '#ffffff',
                                      color: '#334155',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '16px',
                                      padding: '0.45rem 0.85rem',
                                      fontSize: '0.76rem',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit2 size={13} />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteSA(sa)}
                                    style={{
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: '16px',
                                      padding: '0.45rem 0.85rem',
                                      fontSize: '0.76rem',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Branch Profile Settings & Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Edit Profile Action Box */}
                      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #eef2f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <Edit2 size={18} color="#ff5b35" />
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>
                            Pengaturan Profil & Legalitas
                          </h3>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
                          Ubah identitas lembaga, nama mudir penanggung jawab, kontak darurat, atau alamat cabang resmi.
                        </p>

                        <button
                          onClick={() => handleOpenEditCabang(selectedBranch)}
                          className="owner-theme-coral-btn"
                          style={{ width: '100%', padding: '0.65rem', fontSize: '0.82rem' }}
                        >
                          <Edit2 size={14} />
                          <span>Ubah Data & Profil Cabang</span>
                        </button>
                      </div>

                      {/* Danger Zone */}
                      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #fee2e2', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: '800', color: '#dc2626' }}>
                          Zona Pengelolaan Cabang
                        </h4>

                        {selectedBranch.id === 'cabang-pusat' ? (
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                            Cabang Utama (Pusat) adalah cabang default sistem pesantren dan dilindungi dari penghapusan.
                          </p>
                        ) : (
                          <div>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                              Menghapus cabang ini akan melepaskan asosiasi data. Data historis santri dan akun tetap tersimpan aman.
                            </p>
                            <button
                              onClick={() => handleDeleteCabang(selectedBranch)}
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '20px',
                                padding: '0.5rem 1rem',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              Hapus Cabang Ini
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 2: TABEL MATRIKS SEMUA CABANG */}
            {effectiveViewMode === 'list' && (
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>
                      Data Induk Seluruh Cabang Lembaga PPIAS
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                      Klik tombol "Analisis Cabang" pada baris untuk membuka seluruh data terpadu cabang tersebut.
                    </p>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '9px' }} />
                    <input
                      type="text"
                      placeholder="Cari cabang lembaga..."
                      value={searchCabang}
                      onChange={(e) => setSearchCabang(e.target.value)}
                      style={{
                        padding: '0.45rem 0.85rem 0.45rem 2.2rem',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8rem',
                        outline: 'none',
                        background: '#f8fafc',
                        width: '240px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '0.85rem 1rem' }}>No</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Nama Cabang</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Kode Unit</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Penanggung Jawab</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Kontak & Email</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Santri / Guru</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cabangList
                        .filter(c => 
                          c.nama.toLowerCase().includes(searchCabang.toLowerCase()) || 
                          c.kode?.toLowerCase().includes(searchCabang.toLowerCase()) ||
                          c.penanggungJawab?.toLowerCase().includes(searchCabang.toLowerCase())
                        )
                        .map((c, idx) => {
                          const branchSantriCount = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === c.id).length;
                          const branchGuruCount = allGurus.filter(g => {
                            const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
                            return gBranch === c.id;
                          }).length;

                          return (
                            <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span 
                                    style={{ 
                                      width: '10px', 
                                      height: '10px', 
                                      borderRadius: '50%', 
                                      background: c.warnaAksen || '#ff5b35' 
                                    }} 
                                  />
                                  <div>
                                    <div 
                                      onClick={() => handleInspectBranch(c.id, 'ringkasan')}
                                      style={{ fontWeight: '800', color: '#1e293b', cursor: 'pointer' }}
                                      title="Klik untuk membuka detail cabang"
                                    >
                                      {c.nama}
                                    </div>
                                    {c.id === 'cabang-pusat' && (
                                      <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: '700' }}>★ Cabang Pusat</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>
                                  {c.kode || c.id}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>
                                {c.penanggungJawab || '-'}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#64748b' }}>
                                <div>{c.noHp || '-'}</div>
                                <div style={{ color: '#0284c7' }}>{c.email || '-'}</div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span style={{ fontWeight: '800', color: '#047857' }}>{branchSantriCount}</span> Santri • <span style={{ fontWeight: '800', color: '#2563eb' }}>{branchGuruCount}</span> Guru
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                                  <button
                                    onClick={() => handleInspectBranch(c.id, 'ringkasan')}
                                    className="owner-theme-coral-btn"
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                    title="Analisis & buka seluruh data cabang ini"
                                  >
                                    Buka Detail →
                                  </button>

                                  <button
                                    onClick={() => handleOpenEditCabang(c)}
                                    style={{
                                      background: '#f8fafc',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      padding: '0.35rem 0.55rem',
                                      cursor: 'pointer',
                                      color: '#334155'
                                    }}
                                    title="Edit Cabang"
                                  >
                                    <Edit2 size={13} />
                                  </button>

                                  {c.id !== 'cabang-pusat' && (
                                    <button
                                      onClick={() => handleDeleteCabang(c)}
                                      style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.55rem',
                                        cursor: 'pointer',
                                        color: '#dc2626'
                                      }}
                                      title="Hapus Cabang"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* =========================================================
          TAB 3: AKUN SUPER ADMIN PER CABANG
          ========================================================= */}
      {currentSubTab === 'superadmin' && (
        <div>
          {/* Info Banner */}
          <div 
            style={{ 
              background: '#fff0ec', 
              border: '1px solid #ffdcd3', 
              borderRadius: '16px', 
              padding: '1.1rem 1.35rem', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            <div style={{ background: '#ff5b35', color: '#ffffff', borderRadius: '50%', padding: '0.45rem', display: 'flex', boxShadow: '0 4px 12px rgba(255, 91, 53, 0.25)' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#9a2408', fontSize: '0.95rem' }}>
                Otoritas Super Admin Cabang & Manajemen Kredensial<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
              </div>
              <div style={{ color: '#c2410c', fontSize: '0.825rem', marginTop: '0.15rem' }}>
                Owner dapat membuat akun Super Admin baru untuk setiap cabang lembaga PPIAS, menginspeksi password login, dan mereset password secara langsung jika admin cabang lupa kredensial.
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Cari Super Admin..."
                  value={searchSA}
                  onChange={(e) => setSearchSA(e.target.value)}
                  style={{
                    padding: '0.5rem 0.85rem 0.5rem 2.2rem',
                    borderRadius: '24px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    minWidth: '220px',
                    background: '#ffffff'
                  }}
                />
              </div>

              {/* Filter by Cabang */}
              <select
                value={filterSACabang}
                onChange={(e) => setFilterSACabang(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '24px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: '#fff',
                  fontWeight: '600'
                }}
              >
                <option value="ALL">Semua Cabang Penugasan</option>
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    Cabang: {c.nama}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingSA(null);
                setSaForm({
                  nama: '',
                  username: '',
                  email: '',
                  password: 'bismillah123',
                  cabangId: cabangList[0]?.id || 'cabang-pusat',
                  noHp: '',
                  status: 'Aktif'
                });
                setShowAddSAModal(true);
              }}
              className="owner-theme-coral-btn"
            >
              <Plus size={16} />
              <span>+ Buat Super Admin Baru</span>
            </button>
          </div>

          {/* Table Super Admin */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>No</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Nama Super Admin</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Cabang Penugasan</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Username & Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Password Akun</th>
                    <th style={{ padding: '0.85rem 1rem' }}>No. HP / WhatsApp</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {superAdminList
                    .filter(sa => {
                      const matchSearch = sa.nama.toLowerCase().includes(searchSA.toLowerCase()) ||
                        sa.username.toLowerCase().includes(searchSA.toLowerCase()) ||
                        sa.email?.toLowerCase().includes(searchSA.toLowerCase()) ||
                        sa.cabangNama?.toLowerCase().includes(searchSA.toLowerCase());
                      const matchCabang = (filterSACabang === 'ALL' || sa.cabangId === filterSACabang);
                      return matchSearch && matchCabang;
                    })
                    .map((sa, idx) => {
                      const matchedCabang = cabangList.find(c => c.id === sa.cabangId);
                      const isPwdVisible = visiblePasswords[sa.id];

                      return (
                        <tr key={sa.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div 
                                style={{ 
                                  width: '34px', 
                                  height: '34px', 
                                  borderRadius: '50%', 
                                  background: '#e0f2fe', 
                                  color: '#0284c7', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  fontWeight: '700'
                                }}
                              >
                                {sa.nama ? sa.nama.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{sa.nama}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sa.role || 'Super Admin Cabang'}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span 
                              style={{ 
                                background: `${matchedCabang?.warnaAksen || '#0d9488'}15`, 
                                color: matchedCabang?.warnaAksen || '#0d9488', 
                                padding: '0.25rem 0.65rem', 
                                borderRadius: '6px', 
                                fontWeight: '700', 
                                fontSize: '0.775rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <Building2 size={12} />
                              {sa.cabangNama || matchedCabang?.nama || 'Cabang'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: '600', color: '#0369a1' }}>
                              @{sa.username}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {sa.email || '-'}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.5rem', 
                                background: '#f8fafc', 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '6px', 
                                border: '1px solid #e2e8f0' 
                              }}
                            >
                              <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.85rem', color: isPwdVisible ? '#0f172a' : '#94a3b8' }}>
                                {isPwdVisible ? sa.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleShowPassword(sa.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.1rem' }}
                                title={isPwdVisible ? "Sembunyikan Password" : "Lihat Password"}
                              >
                                {isPwdVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => handleCopyPassword(sa)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedSAId === sa.id ? '#10b981' : '#64748b', padding: '0.1rem' }}
                                title="Salin Password"
                              >
                                {copiedSAId === sa.id ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#475569' }}>
                            {sa.noHp || '-'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span 
                              style={{ 
                                background: sa.status === 'Aktif' ? '#dcfce7' : '#fee2e2', 
                                color: sa.status === 'Aktif' ? '#15803d' : '#b91c1c', 
                                padding: '0.2rem 0.55rem', 
                                borderRadius: '12px', 
                                fontWeight: '600', 
                                fontSize: '0.75rem' 
                              }}
                            >
                              {sa.status || 'Aktif'}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                              <button
                                onClick={() => {
                                  setResetSAPasswordTarget(sa);
                                  setNewResetPassword('bismillah123');
                                }}
                                style={{
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  padding: '0.35rem 0.6rem',
                                  cursor: 'pointer',
                                  color: '#166534',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                                title="Reset Password ke Default"
                              >
                                <KeyRound size={12} />
                                <span>Reset</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditSA(sa)}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  padding: '0.35rem 0.55rem',
                                  cursor: 'pointer',
                                  color: '#334155'
                                }}
                                title="Edit Akun"
                              >
                                <Edit2 size={14} />
                              </button>

                              <button
                                onClick={() => handleDeleteSA(sa)}
                                style={{
                                  background: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  padding: '0.35rem 0.55rem',
                                  cursor: 'pointer',
                                  color: '#dc2626'
                                }}
                                title="Hapus Akun Super Admin"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: KONSOLIDASI & KOMPARASI DATA LINTAS CABANG
          ========================================================= */}
      {currentSubTab === 'rekap' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>
              Matriks Komparasi & Konsolidasi Data Antar Cabang<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Perbandingan distribusi santri, ustadz pengampu, halaqah bimbingan, dan perolehan syahriah di setiap cabang lembaga PPIAS.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem' }}>Nama Cabang Lembaga</th>
                    <th style={{ padding: '0.85rem' }}>Kode Unit</th>
                    <th style={{ padding: '0.85rem', textAlign: 'center' }}>Jumlah Santri</th>
                    <th style={{ padding: '0.85rem', textAlign: 'center' }}>Jumlah Guru / Ust</th>
                    <th style={{ padding: '0.85rem', textAlign: 'center' }}>Super Admin</th>
                    <th style={{ padding: '0.85rem' }}>Penanggung Jawab</th>
                    <th style={{ padding: '0.85rem', textAlign: 'center' }}>Rasio Guru : Santri</th>
                    <th style={{ padding: '0.85rem', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {cabangList.map(c => {
                    const santriCabang = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === c.id);
                    const guruCabang = allGurus.filter(g => {
                      const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
                      return gBranch === c.id;
                    });
                    const saCabang = superAdminList.filter(sa => sa.cabangId === c.id);
                    const rasio = guruCabang.length > 0 ? (santriCabang.length / guruCabang.length).toFixed(1) : '-';

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.warnaAksen || '#0d9488' }} />
                            <strong style={{ color: '#1e293b' }}>{c.nama}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                            {c.kode}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: '700', color: '#0d9488' }}>
                          {santriCabang.length}
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                          {guruCabang.length}
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: '700', color: '#7c3aed' }}>
                          {saCabang.length}
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          {c.penanggungJawab || '-'}
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                          <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '600' }}>
                            1 : {rasio}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEnterBranchAsAdmin(c.id)}
                            style={{
                              background: '#0d9488',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <span>Buka Data</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visualisasi Finansial & Komparasi SPP Antar Cabang */}
          {(() => {
            const allSPP = storageService.getPembayaranSPP() || [];
            const financialData = cabangList.map(c => {
              const sppBranch = allSPP.filter(s => (s.cabangId === c.id || s.cabang_id === c.id));
              const lunas = sppBranch.filter(s => s.status === 'Lunas');
              const pending = sppBranch.filter(s => s.status !== 'Lunas');
              const totalNominal = lunas.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
              const targetNominal = sppBranch.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0) || (allSantri.filter(s => (s.cabangId || 'cabang-pusat') === c.id).length * 350000);
              const persen = targetNominal > 0 ? Math.min(100, Math.round((totalNominal / targetNominal) * 100)) : 0;
              return {
                cabang: c,
                totalNominal,
                targetNominal,
                lunasCount: lunas.length,
                pendingCount: pending.length,
                persen
              };
            });

            const maxNominal = Math.max(...financialData.map(f => f.totalNominal), 1000000);
            const grandTotalTerkumpul = financialData.reduce((acc, curr) => acc + curr.totalNominal, 0);

            return (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.4rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 800, color: '#1e293b' }}>
                        Komparasi Realisasi Penerimaan SPP & Syahriah Antar Cabang
                      </h3>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
                        Monitoring terpadu arus kas syahriah dari seluruh unit lembaga & cabang yayasan
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Total Terkumpul Yayasan
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#059669' }}>
                      Rp {grandTotalTerkumpul.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Comparative Horizontal Bar Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {financialData.map(({ cabang, totalNominal, lunasCount, pendingCount }) => {
                    const widthPercent = Math.min(100, Math.max(10, Math.round((totalNominal / maxNominal) * 100)));
                    return (
                      <div key={cabang.id} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cabang.warnaAksen || '#0d9488' }} />
                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{cabang.nama}</strong>
                            <span style={{ fontSize: '0.70rem', background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              {cabang.kode}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              Lunas: <strong style={{ color: '#059669' }}>{lunasCount}</strong> • Tertunda: <strong style={{ color: '#d97706' }}>{pendingCount}</strong>
                            </span>
                            <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                              Rp {totalNominal.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* Bar */}
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${widthPercent}%`,
                            height: '100%',
                            background: cabang.warnaAksen || '#0d9488',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================
          TAB 5: KONFIGURASI UNIT & DATABASE (ROLE OWNER)
          ========================================================= */}
      {currentSubTab === 'konfigurasi' && (
        <div style={{ marginTop: '0.5rem' }}>
          <PengaturanAdminView 
            settings={storageService.getSettings ? storageService.getSettings() : {}}
            halaqahList={storageService.getHalaqah ? storageService.getHalaqah() : []}
            santriList={storageService.getSantri ? storageService.getSantri() : []}
            onSaveSettings={(newSettings) => {
              storageService.saveSettings(newSettings);
              reloadData();
              showToast && showToast("Pengaturan sistem berhasil diperbarui!");
            }}
            onReload={reloadData}
            showToast={showToast}
            currentRole="owner"
            isOwner={true}
          />
        </div>
      )}

      {/* =========================================================
          MODAL: TAMBAH / EDIT CABANG LEMBAGA
          ========================================================= */}
      {showAddCabangModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="#0d9488" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1e293b' }}>
                  {editingCabang ? 'Edit Cabang Lembaga' : 'Tambah Cabang Lembaga Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddCabangModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCabang} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                  Nama Cabang Lembaga *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMP IT Ihya As-Sunnah"
                  value={cabangForm.nama}
                  onChange={(e) => setCabangForm({ ...cabangForm, nama: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    Kode Cabang *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP-IT"
                    value={cabangForm.kode}
                    onChange={(e) => setCabangForm({ ...cabangForm, kode: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    Kota / Wilayah
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tasikmalaya"
                    value={cabangForm.kota}
                    onChange={(e) => setCabangForm({ ...cabangForm, kota: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                  Mudir / Penanggung Jawab Cabang
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ustadz Ahmad Fauzi, M.Pd"
                  value={cabangForm.penanggungJawab}
                  onChange={(e) => setCabangForm({ ...cabangForm, penanggungJawab: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    No. HP / WhatsApp Kantor
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-7890-1122"
                    value={cabangForm.noHp}
                    onChange={(e) => setCabangForm({ ...cabangForm, noHp: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    Email Resmi Cabang
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: smpit@ihya.sch.id"
                    value={cabangForm.email}
                    onChange={(e) => setCabangForm({ ...cabangForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                  Alamat Lengkap Cabang
                </label>
                <textarea
                  rows="2"
                  placeholder="Alamat kampus cabang..."
                  value={cabangForm.alamat}
                  onChange={(e) => setCabangForm({ ...cabangForm, alamat: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                  Warna Identitas Aksen Cabang
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCabangForm({ ...cabangForm, warnaAksen: c.value })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: cabangForm.warnaAksen === c.value ? `${c.value}20` : '#f8fafc',
                        border: cabangForm.warnaAksen === c.value ? `2px solid ${c.value}` : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.value }} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCabangModal(false)}
                  style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editingCabang ? 'Simpan Perubahan' : 'Daftarkan Cabang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: BUAT / EDIT AKUN SUPER ADMIN
          ========================================================= */}
      {showAddSAModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#0d9488" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1e293b' }}>
                  {editingSA ? 'Edit Akun Super Admin' : 'Buat Akun Super Admin Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddSAModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSA} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                  Cabang Penugasan *
                </label>
                <select
                  required
                  value={saForm.cabangId}
                  onChange={(e) => setSaForm({ ...saForm, cabangId: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                >
                  {cabangList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nama} ({c.kode})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Akun Super Admin ini hanya dapat mengakses dan mengelola data di cabang ini.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                  Nama Lengkap Admin *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Admin SMP IT Ihya As-Sunnah"
                  value={saForm.nama}
                  onChange={(e) => setSaForm({ ...saForm, nama: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: admin.smp"
                    value={saForm.username}
                    onChange={(e) => setSaForm({ ...saForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    Password Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Password login..."
                    value={saForm.password}
                    onChange={(e) => setSaForm({ ...saForm, password: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    Email Admin
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: admin.smp@ihya.sch.id"
                    value={saForm.email}
                    onChange={(e) => setSaForm({ ...saForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-7890-1133"
                    value={saForm.noHp}
                    onChange={(e) => setSaForm({ ...saForm, noHp: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddSAModal(false)}
                  style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editingSA ? 'Simpan Perubahan' : 'Buat Akun Super Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: RESET PASSWORD SUPER ADMIN
          ========================================================= */}
      {resetSAPasswordTarget && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.5rem', borderRadius: '50%' }}>
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                  Reset Password Super Admin
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {resetSAPasswordTarget.nama} ({resetSAPasswordTarget.cabangNama})
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
              Masukkan password baru untuk akun <strong>{resetSAPasswordTarget.username}</strong>:
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  fontWeight: '700'
                }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setNewResetPassword('bismillah123')}
                  style={{ fontSize: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
                >
                  Gunakan default: bismillah123
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setResetSAPasswordTarget(null)}
                style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                Konfirmasi Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
