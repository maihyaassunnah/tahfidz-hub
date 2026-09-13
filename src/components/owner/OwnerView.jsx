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
  Download
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function OwnerView({ 
  activeBranchId, 
  onSwitchBranch, 
  activeTab, 
  setActiveTab, 
  showToast,
  onSwitchRole
}) {
  const [currentSubTab, setCurrentSubTab] = useState(
    activeTab?.startsWith('owner-') ? activeTab.replace('owner-', '') : 'dashboard'
  );

  const [cabangList, setCabangList] = useState([]);
  const [superAdminList, setSuperAdminList] = useState([]);
  const [allSantri, setAllSantri] = useState([]);
  const [allGurus, setAllGurus] = useState([]);

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
  }, [activeBranchId]);

  // Sync sub tab when activeTab changes externally
  useEffect(() => {
    if (activeTab?.startsWith('owner-')) {
      setCurrentSubTab(activeTab.replace('owner-', ''));
    }
  }, [activeTab]);

  const handleSelectSubTab = (tabId) => {
    setCurrentSubTab(tabId);
    if (setActiveTab) {
      setActiveTab(`owner-${tabId}`);
    }
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
  const totalCabang = cabangList.length;
  const totalSA = superAdminList.length;
  const totalSantriGlobal = allSantri.length;
  const totalGuruGlobal = allGurus.length;

  const currentActiveBranch = cabangList.find(c => c.id === activeBranchId) || cabangList[0] || {};

  return (
    <div className="owner-container" style={{ padding: '1.25rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* =========================================================
          1. HEADER EXECUTIVE BANNER
          ========================================================= */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.08 }}>
          <Building2 size={240} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span 
                style={{ 
                  background: 'rgba(234, 179, 8, 0.2)', 
                  color: '#fde047', 
                  fontSize: '0.75rem', 
                  fontWeight: '700', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: '1px solid rgba(234, 179, 8, 0.4)'
                }}
              >
                <Sparkles size={12} /> TAHFIDZ HUB • PORTAL OWNER
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Multi-Branch Enterprise Architecture</span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              Tahfidz HUB — Pusat Manajemen Multi-Cabang & Otoritas Super Admin
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', maxWidth: '720px', lineHeight: '1.5' }}>
              Kelola seluruh entitas cabang lembaga (Madrasah Aliyah, SMP IT, Pondok Pesantren), otorisasi akun Super Admin per cabang, serta isolasi data santri dan pengampu antar cabang.
            </p>
          </div>

          {/* Quick Active Branch Switcher in Banner */}
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)', 
              backdropFilter: 'blur(12px)',
              padding: '0.85rem 1.15rem', 
              borderRadius: '12px', 
              border: '1px solid rgba(255, 255, 255, 0.15)',
              minWidth: '260px'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Cabang Aktif Saat Ini:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: currentActiveBranch.warnaAksen || '#10b981',
                  boxShadow: `0 0 10px ${currentActiveBranch.warnaAksen || '#10b981'}`
                }} 
              />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                {currentActiveBranch.nama || 'MA Ihya As-Sunnah (Pusat)'}
              </span>
            </div>

            <select
              value={activeBranchId}
              onChange={(e) => onSwitchBranch && onSwitchBranch(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '0.45rem 0.65rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {cabangList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.kode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Key Metrics Pills */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '0.85rem', 
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(13, 148, 136, 0.25)', padding: '0.6rem', borderRadius: '10px', color: '#2dd4bf' }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>{totalCabang}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Cabang Lembaga</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(37, 99, 235, 0.25)', padding: '0.6rem', borderRadius: '10px', color: '#60a5fa' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>{totalSA}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Akun Super Admin</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.25)', padding: '0.6rem', borderRadius: '10px', color: '#34d399' }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>{totalSantriGlobal}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Santri (Lintas Cabang)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(124, 58, 237, 0.25)', padding: '0.6rem', borderRadius: '10px', color: '#c084fc' }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: '800' }}>{totalGuruGlobal}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Guru & Ustadz Pengampu</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. SUB-NAVIGATION TABS FOR OWNER
          ========================================================= */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          borderBottom: '2px solid #e2e8f0', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => handleSelectSubTab('dashboard')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: currentSubTab === 'dashboard' ? '700' : '500',
            color: currentSubTab === 'dashboard' ? '#0d9488' : '#64748b',
            borderBottom: currentSubTab === 'dashboard' ? '3px solid #0d9488' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.925rem'
          }}
        >
          <Layers size={18} />
          <span>Dashboard Multi-Cabang</span>
        </button>

        <button
          onClick={() => handleSelectSubTab('cabang')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: currentSubTab === 'cabang' ? '700' : '500',
            color: currentSubTab === 'cabang' ? '#0d9488' : '#64748b',
            borderBottom: currentSubTab === 'cabang' ? '3px solid #0d9488' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.925rem'
          }}
        >
          <Building2 size={18} />
          <span>Kelola Cabang Lembaga ({cabangList.length})</span>
        </button>

        <button
          onClick={() => handleSelectSubTab('superadmin')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: currentSubTab === 'superadmin' ? '700' : '500',
            color: currentSubTab === 'superadmin' ? '#0d9488' : '#64748b',
            borderBottom: currentSubTab === 'superadmin' ? '3px solid #0d9488' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.925rem'
          }}
        >
          <ShieldCheck size={18} />
          <span>Akun Super Admin ({superAdminList.length})</span>
        </button>

        <button
          onClick={() => handleSelectSubTab('rekap')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: currentSubTab === 'rekap' ? '700' : '500',
            color: currentSubTab === 'rekap' ? '#0d9488' : '#64748b',
            borderBottom: currentSubTab === 'rekap' ? '3px solid #0d9488' : '3px solid transparent',
            marginBottom: '-2px',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.925rem'
          }}
        >
          <Sliders size={18} />
          <span>Konsolidasi & Komparasi Data</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: DASHBOARD MULTI-CABANG
          ========================================================= */}
      {currentSubTab === 'dashboard' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Daftar Cabang Lembaga & Unit Pendidikan
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Klik pada cabang untuk mengaktifkan scope cabang atau beralih mengelola sebagai Super Admin cabang tersebut.
              </p>
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
                  warnaAksen: '#0d9488'
                });
                setShowAddCabangModal(true);
              }}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#0d9488',
                color: '#fff',
                padding: '0.6rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Tambah Cabang Baru</span>
            </button>
          </div>

          {/* Grid Cards of Branches */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
              gap: '1.25rem',
              marginBottom: '2rem'
            }}
          >
            {cabangList.map(cabang => {
              const isActive = (cabang.id === activeBranchId);
              const branchSantri = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === cabang.id);
              const branchGurus = allGurus.filter(g => {
                const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
                return gBranch === cabang.id;
              });
              const branchSAs = superAdminList.filter(sa => sa.cabangId === cabang.id);

              return (
                <div 
                  key={cabang.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: isActive ? `2px solid ${cabang.warnaAksen || '#0d9488'}` : '1px solid #e2e8f0',
                    boxShadow: isActive ? '0 8px 20px -4px rgba(13, 148, 136, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                    padding: '1.25rem',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* Active Ribbon */}
                  {isActive && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Check size={12} /> AKTIF DIBUKA
                    </div>
                  )}

                  <div>
                    {/* Header: Name & Code */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '10px', 
                          background: `${cabang.warnaAksen || '#0d9488'}15`, 
                          color: cabang.warnaAksen || '#0d9488',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '1.1rem'
                        }}
                      >
                        <Building2 size={22} />
                      </div>

                      <div style={{ flex: 1, paddingRight: isActive ? '80px' : '0' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>
                          {cabang.nama}
                        </div>
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            background: '#f1f5f9', 
                            color: '#475569', 
                            padding: '0.1rem 0.5rem', 
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}
                        >
                          KODE: {cabang.kode || cabang.id}
                        </span>
                      </div>
                    </div>

                    {/* Metadata lines */}
                    <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#94a3b8" />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {cabang.alamat || cabang.kota || 'Tasikmalaya'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <UserCheck size={14} color="#94a3b8" />
                        <span>Mudir / PJ: <strong>{cabang.penanggungJawab || '-'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color="#94a3b8" />
                        <span>{cabang.noHp || '-'}</span>
                      </div>
                    </div>

                    {/* Branch Metrics Counter */}
                    <div 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr 1fr', 
                        gap: '0.5rem', 
                        background: '#f8fafc', 
                        padding: '0.65rem', 
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        textAlign: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0d9488' }}>
                          {branchSantri.length}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Santri</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#2563eb' }}>
                          {branchGurus.length}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Guru/Ust.</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#7c3aed' }}>
                          {branchSAs.length}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Super Admin</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => onSwitchBranch && onSwitchBranch(cabang.id)}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: isActive ? '#f0fdf4' : '#ffffff',
                          color: isActive ? '#166534' : '#334155',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <MapPin size={14} />
                        <span>{isActive ? 'Cabang Terpilih' : 'Pilih Cabang Ini'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditCabang(cabang)}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                        title="Edit Info Cabang"
                      >
                        <Edit2 size={14} />
                      </button>

                      {cabang.id !== 'cabang-pusat' && (
                        <button
                          onClick={() => handleDeleteCabang(cabang)}
                          style={{
                            padding: '0.5rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            background: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                          title="Hapus Cabang"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleEnterBranchAsAdmin(cabang.id)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Shield size={14} />
                      <span>Buka & Kelola Cabang Sebagai Admin</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Super Admin Overview */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  Ringkasan Akun Super Admin yang Bertugas
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Akun Super Admin yang telah didelegasikan untuk mengelola cabang masing-masing.
                </p>
              </div>

              <button
                onClick={() => handleSelectSubTab('superadmin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0d9488',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>Kelola Semua Akun</span>
                <ArrowRight size={15} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem' }}>Super Admin</th>
                    <th style={{ padding: '0.75rem' }}>Cabang Penugasan</th>
                    <th style={{ padding: '0.75rem' }}>Username</th>
                    <th style={{ padding: '0.75rem' }}>Password Login</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  {superAdminList.map(sa => (
                    <tr key={sa.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '600', color: '#1e293b' }}>
                        {sa.nama}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span 
                          style={{ 
                            background: '#ecfdf5', 
                            color: '#065f46', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '6px', 
                            fontWeight: '600', 
                            fontSize: '0.75rem' 
                          }}
                        >
                          {sa.cabangNama || 'Cabang'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#0369a1' }}>
                        {sa.username}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                            {visiblePasswords[sa.id] ? sa.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => toggleShowPassword(sa.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem' }}
                            title={visiblePasswords[sa.id] ? "Sembunyikan" : "Tampilkan"}
                          >
                            {visiblePasswords[sa.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleCopyPassword(sa)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedSAId === sa.id ? '#10b981' : '#64748b', padding: '0.2rem' }}
                            title="Salin Password"
                          >
                            {copiedSAId === sa.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ color: '#15803d', fontWeight: '600', fontSize: '0.75rem' }}>
                          ● {sa.status || 'Aktif'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setResetSAPasswordTarget(sa);
                            setNewResetPassword('bismillah123');
                          }}
                          style={{
                            background: '#f0fdf4',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <KeyRound size={12} />
                          <span>Reset Pass</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: KELOLA CABANG LEMBAGA
          ========================================================= */}
      {currentSubTab === 'cabang' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Data Induk Seluruh Cabang Lembaga
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Tambah, modifikasi, dan atur penanggung jawab setiap cabang lembaga.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Cari cabang..."
                  value={searchCabang}
                  onChange={(e) => setSearchCabang(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
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
                    warnaAksen: '#0d9488'
                  });
                  setShowAddCabangModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#0d9488',
                  color: '#fff',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                <span>Tambah Cabang Baru</span>
              </button>
            </div>
          </div>

          {/* Cabang Table */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>No</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Nama Cabang Lembaga</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Kode Unit</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Penanggung Jawab / Mudir</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Kontak & Email</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Alamat</th>
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
                      const branchSantri = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === c.id);
                      const branchGurus = allGurus.filter(g => {
                        const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
                        return gBranch === c.id;
                      });

                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span 
                                style={{ 
                                  width: '12px', 
                                  height: '12px', 
                                  borderRadius: '50%', 
                                  background: c.warnaAksen || '#0d9488' 
                                }} 
                              />
                              <div>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{c.nama}</div>
                                {c.id === 'cabang-pusat' && (
                                  <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: '600' }}>★ Cabang Utama (Pusat)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>
                              {c.kode || c.id}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>
                            {c.penanggungJawab || '-'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                            <div>{c.noHp || '-'}</div>
                            <div style={{ color: '#0284c7' }}>{c.email || '-'}</div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b', maxWidth: '200px' }}>
                            {c.alamat || c.kota || '-'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: '700', color: '#0d9488' }}>{branchSantri.length}</span> Santri
                            </div>
                            <div style={{ fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: '700', color: '#2563eb' }}>{branchGurus.length}</span> Guru
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
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
                                <Edit2 size={14} />
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
                                  <Trash2 size={14} />
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
        </div>
      )}

      {/* =========================================================
          TAB 3: AKUN SUPER ADMIN PER CABANG
          ========================================================= */}
      {currentSubTab === 'superadmin' && (
        <div>
          {/* Info Banner */}
          <div 
            style={{ 
              background: '#eff6ff', 
              border: '1px solid #bfdbfe', 
              borderRadius: '12px', 
              padding: '1rem 1.25rem', 
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            <div style={{ background: '#3b82f6', color: '#ffffff', borderRadius: '50%', padding: '0.4rem', display: 'flex' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '0.925rem' }}>
                Otoritas Super Admin Cabang & Manajemen Kredensial
              </div>
              <div style={{ color: '#1e40af', fontSize: '0.825rem', marginTop: '0.15rem' }}>
                Owner dapat membuat akun Super Admin baru untuk setiap cabang, melihat password yang tersimpan, menyalin password, atau mereset password secara langsung jika admin cabang lupa password.
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Cari Super Admin..."
                  value={searchSA}
                  onChange={(e) => setSearchSA(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    minWidth: '220px'
                  }}
                />
              </div>

              {/* Filter by Cabang */}
              <select
                value={filterSACabang}
                onChange={(e) => setFilterSACabang(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: '#fff'
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#0d9488',
                color: '#fff',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Buat Akun Super Admin Baru</span>
            </button>
          </div>

          {/* Table Super Admin */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
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
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Matriks Komparasi & Konsolidasi Data Antar Cabang
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Perbandingan distribusi santri, ustadz pengampu, kelas, dan lokasi presensi di setiap cabang lembaga.
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
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
