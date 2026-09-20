import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Building2, 
  RefreshCw, 
  X, 
  ExternalLink, 
  Image as ImageIcon,
  User,
  Shield,
  Check
} from 'lucide-react';
import { storageService } from '../../services/storage';

// 8 Preset Avatar Islami & Profesional (Kualitas Tinggi)
const AVATAR_PRESETS = [
  {
    id: 'preset-ustadz-1',
    nama: 'Ustadz Peci Hitam (Formal)',
    kategori: 'pengampu',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-ustadz-2',
    nama: 'Ustadz Sorban Putih',
    kategori: 'pengampu',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-ustadz-3',
    nama: 'Ustadz Koko Modern',
    kategori: 'pengampu',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-ustadzah-1',
    nama: 'Ustadzah Hijab Syar\'i',
    kategori: 'pengampu',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-ustadzah-2',
    nama: 'Ustadzah Pashmina',
    kategori: 'pengampu',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-admin-1',
    nama: 'Mudir / Administrator Resmi',
    kategori: 'superadmin',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-owner-1',
    nama: 'Pimpinan Yayasan PPIAS',
    kategori: 'superadmin',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-staff-1',
    nama: 'Staff Lembaga',
    kategori: 'admin_cabang',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
  }
];

export default function PengaturanFotoProfilView({ showToast, currentRole, isOwner }) {
  const authUser = storageService.getAuthUser ? storageService.getAuthUser() : null;
  const effectiveRole = currentRole || authUser?.role || (isOwner ? 'owner' : 'superadmin');
  const isRoleOwner = effectiveRole === 'owner' || isOwner === true;

  const [fotoProfilList, setFotoProfilList] = useState(() => (storageService.getFotoProfilList ? storageService.getFotoProfilList() : []));
  const [guruList, setGuruList] = useState(() => (storageService.getSigapGuru ? storageService.getSigapGuru() : []));
  const [superadminList, setSuperadminList] = useState(() => (storageService.getSuperAdminAccounts ? storageService.getSuperAdminAccounts() : []));
  const [cabangList, setCabangList] = useState(() => (storageService.getCabang ? storageService.getCabang() : []));
  const activeBranch = storageService.getActiveBranch ? storageService.getActiveBranch() : null;

  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'superadmin' | 'admin_cabang' | 'pengampu'
  const [searchTerm, setSearchTerm] = useState('');
  const [cabangFilter, setCabangFilter] = useState('all');

  // Pastikan jika bukan Owner, filter kategori 'superadmin' (Owner) otomatis reset ke 'all'
  useEffect(() => {
    if (!isRoleOwner && categoryFilter === 'superadmin') {
      setCategoryFilter('all');
    }
  }, [isRoleOwner, categoryFilter]);

  // Modal State
  const [activeModalUser, setActiveModalUser] = useState(null);
  const [modalMode, setModalMode] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const reloadData = () => {
    setFotoProfilList(storageService.getFotoProfilList ? storageService.getFotoProfilList() : []);
    const gurus = storageService.getSigapGuru ? storageService.getSigapGuru() : [];
    const rawGurus = storageService.getAllPengampuRaw ? storageService.getAllPengampuRaw() : [];
    const finalGurus = (gurus && gurus.length > 0) ? gurus : rawGurus;
    setGuruList(finalGurus);
    setSuperadminList(storageService.getSuperAdminAccounts ? storageService.getSuperAdminAccounts() : []);
    setCabangList(storageService.getCabang ? storageService.getCabang() : []);
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener('simtah_data_updated', handleUpdate);
    window.addEventListener('simtah_santri_updated', handleUpdate);
    window.addEventListener('tahfidz_foto_profil_updated', handleUpdate);
    window.addEventListener('sigap_admin_sync', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('simtah_data_updated', handleUpdate);
      window.removeEventListener('simtah_santri_updated', handleUpdate);
      window.removeEventListener('tahfidz_foto_profil_updated', handleUpdate);
      window.removeEventListener('sigap_admin_sync', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Cabang Aktif untuk isolasi data
  const currentBranchId = authUser?.cabangId || activeBranch?.id || storageService.getActiveBranchId() || 'cabang-pusat';
  const currentBranchObj = (cabangList || []).find(c => c.id === currentBranchId) || activeBranch || { id: 'cabang-pusat', nama: 'MA Ihya As-Sunnah', kode: 'MA-PUSAT' };

  // 1. Bangun Daftar Akun Lengkap yang Dapat Diatur Fotonya
  const allAccounts = [];

  // a. Pimpinan Yayasan (Executive Owner / Pusat Yayasan)
  // HANYA MUNCUL DI ROLE OWNER (Super Admin tidak boleh mengatur foto Owner)
  if (isRoleOwner) {
    allAccounts.push({
      id: 'owner-pimpinan',
      userId: 'owner',
      username: 'owner',
      nama: 'Pimpinan Yayasan PPIAS',
      role: 'Pimpinan Yayasan (Executive Owner)',
      userType: 'superadmin',
      cabangId: 'all',
      cabangNama: 'Seluruh Cabang Yayasan',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      badgeText: 'EXECUTIVE OWNER'
    });
  }

  // b. Akun Admin Cabang dari Database (Super Admin Cabang Lembaga)
  // Bersihkan dari akun azka dan isolasi sesuai cabang bila bukan Owner
  if (superadminList && superadminList.length > 0) {
    superadminList.forEach(sa => {
      if (sa.username === 'owner') return; // Owner sudah di kategori Pimpinan
      const u = (sa.username || '').toLowerCase();
      const n = (sa.nama || '').toLowerCase();
      const i = (sa.id || '').toLowerCase();
      if (u.includes('azka') || n.includes('azka') || i.includes('azka')) return; // Bersihkan akun azka basier

      const saCabangId = sa.cabangId || sa.cabang_id || 'cabang-pusat';
      // Jika Super Admin (Bukan Owner), hanya masukkan akun admin cabang yang sesuai dengan cabang aktifnya
      if (!isRoleOwner && saCabangId !== currentBranchId) return;

      const c = cabangList.find(cb => cb.id === saCabangId);
      const cleanNama = (sa.nama || 'Admin Cabang').replace(/\s+/g, ' ').trim();
      allAccounts.push({
        id: sa.id || `sa-${sa.username}`,
        userId: sa.id || sa.username || 'admin-ma',
        username: sa.username,
        nama: cleanNama,
        role: sa.role || 'Super Admin Cabang',
        userType: 'admin_cabang',
        cabangId: saCabangId,
        cabangNama: c ? `${c.nama} (${c.kode})` : (saCabangId === 'cabang-pusat' ? 'MA Ihya As-Sunnah (MA-PUSAT)' : saCabangId),
        badgeColor: '#0284c7',
        badgeBg: '#f0f9ff',
        badgeText: 'ADMIN CABANG'
      });
    });
  } else {
    // Fallback jika belum tersinkronisasi
    allAccounts.push({
      id: 'sa-pusat',
      userId: 'sa-pusat',
      username: 'ma',
      nama: 'MA Ihya As-Sunnah',
      role: 'Super Admin Cabang',
      userType: 'admin_cabang',
      cabangId: 'cabang-pusat',
      cabangNama: 'MA Ihya As-Sunnah (MA-PUSAT)',
      badgeColor: '#0284c7',
      badgeBg: '#f0f9ff',
      badgeText: 'ADMIN CABANG'
    });
  }

  // c. Akun Ustadz / Ustadzah Pengampu
  const activeGurus = (guruList && guruList.length > 0) 
    ? guruList 
    : ((storageService.getSigapGuru && storageService.getSigapGuru().length > 0) 
        ? storageService.getSigapGuru() 
        : (storageService.getAllPengampuRaw ? storageService.getAllPengampuRaw() : []));

  if (activeGurus && activeGurus.length > 0) {
    activeGurus.forEach((g, idx) => {
      const u = (g.username || '').toLowerCase();
      const n = (g.nama || '').toLowerCase();
      if (u.includes('azka') || n.includes('azka')) return;

      const gCabangId = g.cabangId || g.cabang_id || 'cabang-pusat';
      // Jika Super Admin (Bukan Owner), hanya masukkan pengampu cabang aktifnya agar data tidak tercampur
      if (!isRoleOwner && gCabangId !== currentBranchId) return;

      const c = cabangList.find(cb => cb.id === gCabangId);
      allAccounts.push({
        id: g.id || `guru-${idx}`,
        userId: g.id || g.nip || `guru-${idx}`,
        nip: g.nip || 'NIP-101',
        username: g.username || g.nip || `guru_${idx}`,
        nama: g.nama || 'Ustadz Wahyudin Hafiz, S.Pd',
        role: g.jabatan || g.role || 'Pengampu Halaqoh',
        userType: 'pengampu',
        cabangId: gCabangId,
        cabangNama: g.unitSekolah || (c ? `${c.nama} (${c.kode})` : "MA Ihya As-Sunnah (MA-PUSAT)"),
        badgeColor: '#7c3aed',
        badgeBg: '#faf5ff',
        badgeText: 'PENGAMPU'
      });
    });
  } else {
    // Default fallback agar akun pengampu selalu tampil
    allAccounts.push({
      id: 'p-1',
      userId: 'p-1',
      nip: 'NIP-101',
      username: 'ustadz.wahyudin',
      nama: 'Ustadz Wahyudin Hafiz, S.Pd',
      role: 'Pengampu Halaqoh',
      userType: 'pengampu',
      cabangId: 'cabang-pusat',
      cabangNama: 'MA Ihya As-Sunnah (MA-PUSAT)',
      badgeColor: '#7c3aed',
      badgeBg: '#faf5ff',
      badgeText: 'PENGAMPU'
    });
  }

  // Saring berdasarkan Filter Kategori, Pencarian, dan Cabang (untuk Owner)
  const filteredAccounts = allAccounts.filter(acc => {
    if (categoryFilter !== 'all' && acc.userType !== categoryFilter) {
      return false;
    }
    if (isRoleOwner && cabangFilter !== 'all' && acc.cabangId !== 'all' && acc.cabangId !== cabangFilter) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (acc.nama || '').toLowerCase().includes(q);
      const matchRole = (acc.role || '').toLowerCase().includes(q);
      const matchUser = (acc.username || '').toLowerCase().includes(q);
      const matchNip = (acc.nip || '').toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchUser && !matchNip) return false;
    }
    return true;
  });

  // Hitung Statistik
  const totalAkun = allAccounts.length;
  const akunBerfoto = allAccounts.filter(a => !!storageService.getPhotoForUser({ 
    userId: a.userId, 
    userType: a.userType, 
    username: a.username, 
    nip: a.nip, 
    nama: a.nama,
    cabangId: a.cabangId
  })).length;
  const akunTanpaFoto = totalAkun - akunBerfoto;

  // Buka Modal Unggah Foto untuk Pengguna
  const handleOpenPhotoModal = (account) => {
    const currentPhoto = storageService.getPhotoForUser({ 
      userId: account.userId, 
      userType: account.userType, 
      username: account.username, 
      nip: account.nip, 
      nama: account.nama,
      cabangId: account.cabangId
    }) || '';
    setActiveModalUser(account);
    setPreviewPhotoUrl(currentPhoto);
    setInputUrl(currentPhoto.startsWith('http') ? currentPhoto : '');
    setModalMode('upload');
  };

  // Kompresi Gambar Menggunakan HTML5 Canvas (max 280x280px, ringan ~35KB)
  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, atau WebP)!');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewPhotoUrl(compressedDataUrl);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('Gagal memuat file gambar.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Simpan Foto Profil ke Database & Storage
  const handleSavePhoto = async () => {
    if (!activeModalUser) return;
    if (!previewPhotoUrl) {
      alert('Silakan pilih atau unggah foto terlebih dahulu!');
      return;
    }

    setIsProcessing(true);
    try {
      await storageService.saveFotoProfil({
        userId: activeModalUser.userId,
        userType: activeModalUser.userType,
        nama: activeModalUser.nama,
        username: activeModalUser.username,
        nip: activeModalUser.nip,
        role: activeModalUser.role,
        cabangId: activeModalUser.cabangId,
        fotoUrl: previewPhotoUrl
      });

      showToast && showToast(`Foto profil ${activeModalUser.nama} berhasil disimpan ke database!`);
      setActiveModalUser(null);
      setPreviewPhotoUrl('');
    } catch (err) {
      console.error('Error saving photo:', err);
      alert('Gagal menyimpan foto profil ke server: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Hapus Foto Profil (Kembalikan ke Inisial Default)
  const handleDeletePhoto = async (account) => {
    if (!window.confirm(`Hapus foto profil akun ${account.nama}? Tampilan akan kembali ke avatar inisial standar.`)) {
      return;
    }

    try {
      await storageService.deleteFotoProfil(account.userId, account.userType);
      showToast && showToast(`Foto profil ${account.nama} berhasil dihapus.`);
    } catch (err) {
      alert('Gagal menghapus foto profil: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. KARTU HEADER PENGATURAN FOTO PROFIL */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
          color: '#ffffff', 
          borderColor: '#047857',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.16)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={18} color="#ffffff" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
                Pengaturan Foto Profil Akun
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#d1fae5', maxWidth: '720px', lineHeight: 1.5 }}>
              {isRoleOwner ? (
                <>Kelola foto profil resmi untuk <strong>Pimpinan Yayasan (Owner)</strong>, <strong>Super Admin Cabang Lembaga</strong>, dan <strong>Ustadz / Ustadzah Pengampu</strong>. Foto yang diatur akan langsung tersimpan di database PostgreSQL dan tampil otomatis pada Navbar Header, Sidebar, dan kartu profil.</>
              ) : (
                <>Kelola foto profil resmi untuk <strong>Super Admin Cabang Lembaga</strong> dan <strong>Ustadz / Ustadzah Pengampu</strong>. Foto yang diatur akan langsung tersimpan di database PostgreSQL dan tampil otomatis pada Navbar Header, Sidebar, dan kartu profil.</>
              )}
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.70rem', color: '#d1fae5', fontWeight: 600 }}>Total Akun</div>
              <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#ffffff' }}>{totalAkun}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.70rem', color: '#a7f3d0', fontWeight: 600 }}>Ada Foto</div>
              <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#34d399' }}>{akunBerfoto}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.25)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.70rem', color: '#fef08a', fontWeight: 600 }}>Default</div>
              <div style={{ fontSize: '1.20rem', fontWeight: 800, color: '#fde047' }}>{akunTanpaFoto}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER KATEGORI & PENCARIAN */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px', 
          background: '#ffffff', 
          padding: '14px 18px', 
          borderRadius: '14px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        {/* Pills Kategori Akun */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${categoryFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategoryFilter('all')}
            style={{ borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            Semua Akun ({allAccounts.length})
          </button>
          {isRoleOwner && (
            <button
              type="button"
              className={`btn btn-sm ${categoryFilter === 'superadmin' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategoryFilter('superadmin')}
              style={{ borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}
            >
              👑 Pimpinan Yayasan ({allAccounts.filter(a => a.userType === 'superadmin').length})
            </button>
          )}
          <button
            type="button"
            className={`btn btn-sm ${categoryFilter === 'admin_cabang' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategoryFilter('admin_cabang')}
            style={{ borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            🏢 Admin Cabang ({allAccounts.filter(a => a.userType === 'admin_cabang').length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${categoryFilter === 'pengampu' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategoryFilter('pengampu')}
            style={{ borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}
          >
            📖 Ustadz & Pengampu ({allAccounts.filter(a => a.userType === 'pengampu').length})
          </button>
        </div>

        {/* Branch Indicator / Selector */}
        {!isRoleOwner ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#15803d',
            fontSize: '0.74rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={14} color="#15803d" />
            <span>Cabang: <strong>{currentBranchObj.nama}</strong> (Data Terisolasi)</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Cabang:</span>
            <select
              value={cabangFilter}
              onChange={(e) => setCabangFilter(e.target.value)}
              style={{
                padding: '5px 8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.76rem',
                fontWeight: 700,
                outline: 'none',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value="all">🌐 Semua Cabang ({cabangList.length})</option>
              {cabangList.map(cb => (
                <option key={cb.id} value={cb.id}>
                  📍 {cb.nama} ({cb.kode})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Cari nama atau NIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={reloadData}
            title="Refresh Data"
            style={{ borderRadius: '10px', padding: '6px 10px' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 3. DAFTAR KARTU PENGATURAN FOTO PROFIL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
        {filteredAccounts.map((account) => {
          const photoUrl = storageService.getPhotoForUser({ 
            userId: account.userId, 
            userType: account.userType, 
            username: account.username, 
            nip: account.nip, 
            nama: account.nama,
            cabangId: account.cabangId
          });
          const hasCustomPhoto = !!photoUrl;
          const initials = (account.nama || 'A').charAt(0).toUpperCase();

          return (
            <div 
              key={account.id}
              className="card"
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: hasCustomPhoto ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                background: '#ffffff',
                boxShadow: hasCustomPhoto ? '0 4px 14px rgba(5, 150, 105, 0.06)' : '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {/* Avatar Preview dengan Badge Kamera */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div 
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `2.5px solid ${account.badgeColor}`,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleOpenPhotoModal(account)}
                    title="Klik untuk ubah foto profil"
                  >
                    {hasCustomPhoto ? (
                      <img 
                        src={photoUrl} 
                        alt={account.nama} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: `linear-gradient(135deg, ${account.badgeBg} 0%, #e2e8f0 100%)`, 
                          color: account.badgeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.4rem',
                          fontWeight: 800
                        }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Tombol Kamera Kecil di Sudut Avatar */}
                  <div 
                    onClick={() => handleOpenPhotoModal(account)}
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: account.badgeColor,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
                      cursor: 'pointer'
                    }}
                    title="Ubah Foto"
                  >
                    <Camera size={12} />
                  </div>
                </div>

                {/* Detail Akun */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span 
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        color: account.badgeColor,
                        background: account.badgeBg,
                        border: `1px solid ${account.badgeColor}33`,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {account.badgeText}
                    </span>
                    {hasCustomPhoto && (
                      <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <CheckCircle2 size={11} /> Aktif
                      </span>
                    )}
                  </div>

                  <div 
                    style={{ 
                      fontWeight: 800, 
                      fontSize: '0.94rem', 
                      color: '#0f172a', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}
                    title={account.nama}
                  >
                    {account.nama}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                    {account.role}
                  </div>

                  <div style={{ fontSize: '0.70rem', color: '#94a3b8', marginTop: '2px' }}>
                    {account.nip ? `NIP: ${account.nip}` : `User: ${account.username}`} • {account.cabangNama}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => handleOpenPhotoModal(account)}
                  style={{
                    flex: 1,
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#16a34a',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <Camera size={13} />
                  <span>{hasCustomPhoto ? 'Ganti Foto' : 'Pasang Foto'}</span>
                </button>

                {hasCustomPhoto && (
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(account)}
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    title="Hapus foto dan kembalikan ke avatar standar"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <Camera size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
          <div style={{ fontWeight: 800, color: '#334155', fontSize: '1rem' }}>Tidak ada akun yang sesuai</div>
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
            Coba ganti kata kunci pencarian atau pilih filter kategori lain.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL UNGGAH & PILIH FOTO PROFIL */}
      {/* ========================================================= */}
      {activeModalUser && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 1200 }} 
          onClick={() => setActiveModalUser(null)}
        >
          <div 
            className="modal-content" 
            style={{ maxWidth: '520px', borderRadius: '20px', padding: '0', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                color: '#ffffff', 
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', lineHeight: 1.2 }}>
                  Ubah Foto Profil Akun
                </div>
                <div style={{ fontSize: '0.76rem', color: '#a7f3d0', marginTop: '2px' }}>
                  {activeModalUser.nama} ({activeModalUser.role})
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setActiveModalUser(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Preview Avatar Lingkaran */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div 
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #059669',
                    boxShadow: '0 6px 16px rgba(5, 150, 105, 0.2)',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {previewPhotoUrl ? (
                    <img 
                      src={previewPhotoUrl} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
                      {(activeModalUser.nama || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>Pratinjau Avatar:</div>
                  <div style={{ fontWeight: 800, fontSize: '0.90rem', color: '#0f172a' }}>{activeModalUser.nama}</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                    {previewPhotoUrl ? '✓ Siap disimpan ke database' : '○ Belum ada foto yang dipilih'}
                  </div>
                  {previewPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewPhotoUrl('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '0',
                        marginTop: '4px',
                        textDecoration: 'underline'
                      }}
                    >
                      Batal pilih foto
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-tabs Sumber Foto (Unggah File / Preset / Tautan URL) */}
              <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${modalMode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setModalMode('upload')}
                  style={{ borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  <Upload size={13} />
                  <span>Unggah File</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${modalMode === 'preset' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setModalMode('preset')}
                  style={{ borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  <Sparkles size={13} />
                  <span>Preset Islami</span>
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${modalMode === 'url' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setModalMode('url')}
                  style={{ borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  <ImageIcon size={13} />
                  <span>Tautan URL</span>
                </button>
              </div>

              {/* TAB 1: UNGGAH FILE LOKAL */}
              {modalMode === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />

                  <div 
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    style={{
                      border: '2px dashed #059669',
                      borderRadius: '14px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#f0fdf4',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <Upload size={28} color="#059669" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065f46' }}>
                      Klik untuk Pilih Gambar dari Komputer / HP
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                      Mendukung format JPG, PNG, WebP. Gambar akan otomatis dikompresi (~35KB) agar cepat dan ringan.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: PILIHAN PRESET AVATAR ISLAMI & RESMI */}
              {modalMode === 'preset' && (
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                    Pilih avatar preset siap pakai (1-klik terapkan):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {AVATAR_PRESETS.filter(p => isRoleOwner || p.id !== 'preset-owner-1').map((preset) => {
                      const isSelected = previewPhotoUrl === preset.url;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => setPreviewPhotoUrl(preset.url)}
                          style={{
                            border: isSelected ? '2.5px solid #059669' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '6px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: isSelected ? '#ecfdf5' : '#ffffff',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 4px auto' }}>
                            <img src={preset.url} alt={preset.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#334155', lineHeight: 1.2, height: '24px', overflow: 'hidden' }}>
                            {preset.nama}
                          </div>
                          {isSelected && (
                            <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={10} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: INPUT TAUTAN URL GAMBAR LANGSUNG */}
              {modalMode === 'url' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                    Masukkan Tautan URL Gambar Langsung:
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="url"
                      placeholder="https://contoh.com/foto.jpg"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (!inputUrl) {
                          alert('Masukkan URL gambar terlebih dahulu!');
                          return;
                        }
                        setPreviewPhotoUrl(inputUrl);
                      }}
                      style={{ borderRadius: '10px', fontWeight: 700 }}
                    >
                      Terapkan
                    </button>
                  </div>
                  <small style={{ color: '#64748b', fontSize: '0.72rem' }}>
                    Pastikan tautan dapat diakses secara publik (direct image link).
                  </small>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveModalUser(null)}
                style={{ borderRadius: '10px', padding: '8px 16px', fontSize: '0.84rem', fontWeight: 700 }}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSavePhoto}
                disabled={isProcessing || !previewPhotoUrl}
                style={{
                  background: '#059669',
                  borderColor: '#059669',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={15} />
                <span>{isProcessing ? 'Menyimpan...' : 'Simpan Foto Profil'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
