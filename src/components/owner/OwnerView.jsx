import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Receipt, 
  TrendingUp, 
  Plus, 
  Search, 
  KeyRound, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckSquare, 
  X,
  Send,
  ExternalLink
} from 'lucide-react';
import { storageService } from '../../services/storage';
import PengaturanAdminView from '../PengaturanAdminView';
import OwnerBranchAnalyticsCharts from './OwnerBranchAnalyticsCharts';

/**
 * TAMPILAN EKSEKUTIF OWNER YAYASAN (REDESIGN BERSIH, SEDERHANA, & INFORMATIF)
 * Mendukung tab aktif navigasi:
 * 1. owner-dashboard (Pusat Kontrol Cabang)
 * 2. owner-cabang (Manajemen Cabang & Super Admin)
 * 3. owner-spp (Keuangan & SPP Global)
 * 4. owner-konfigurasi (Pengaturan Yayasan)
 */
export default function OwnerView({ 
  activeBranchId, 
  onSwitchBranch, 
  activeTab = 'owner-dashboard', 
  setActiveTab, 
  showToast,
  isDarkMode = false
}) {
  // Data State
  const [cabangList, setCabangList] = useState([]);
  const [superAdminList, setSuperAdminList] = useState([]);
  const [allSantri, setAllSantri] = useState([]);
  const [allGurus, setAllGurus] = useState([]);
  const [allSPP, setAllSPP] = useState([]);
  const [pendingPerizinan, setPendingPerizinan] = useState([]);

  // Local Filter & Selection for Dashboard
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(activeBranchId || 'ALL');
  const [inspectedBranch, setInspectedBranch] = useState(null); // Modal detail cabang
  const [inspectionTab, setInspectionTab] = useState('santri'); // 'santri' | 'guru' | 'spp'
  const [modalSearch, setModalSearch] = useState(''); // Pencarian di dalam modal detail

  // Modals State
  const [showAddCabangModal, setShowAddCabangModal] = useState(false);
  const [editingCabang, setEditingCabang] = useState(null);
  const [resetSAPasswordTarget, setResetSAPasswordTarget] = useState(null);
  const [newResetPassword, setNewResetPassword] = useState('bismillah123');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedSAId, setCopiedSAId] = useState(null);

  // Quick SPP Input Modal State
  const [showAddSPPModal, setShowAddSPPModal] = useState(false);
  const [sppForm, setSppForm] = useState({
    santriId: '',
    bulan: 'September 2026',
    nominal: 350000,
    status: 'Lunas',
    metodeBayar: 'Transfer Bank BSI',
    catatan: 'Pembayaran SPP Rutin'
  });

  // Broadcast Message State
  const [broadcastText, setBroadcastText] = useState('');

  // SPP View Filters State
  const [sppSearch, setSppSearch] = useState('');
  const [sppFilterStatus, setSppFilterStatus] = useState('ALL'); // 'ALL' | 'Lunas' | 'Pending'
  const [sppFilterBranch, setSppFilterBranch] = useState('ALL');

  // Form input untuk Cabang
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

  // Reload data dari storage
  const reloadData = () => {
    storageService.init();
    const cList = storageService.getCabang();
    const saList = storageService.getSuperAdminAccounts();
    const santri = storageService.getAllSantriRaw();
    const gurus = storageService.getAllSigapGuruRaw();
    const spp = storageService.getPembayaranSPP ? storageService.getPembayaranSPP() : [];
    
    // Perizinan menunggu persetujuan
    let perizinan = [];
    if (storageService.getPendingPerizinan) {
      perizinan = storageService.getPendingPerizinan();
    } else {
      const allIzin = storageService.getPerizinanList ? storageService.getPerizinanList() : [];
      perizinan = allIzin.filter(i => i.status === 'Pending' || i.status === 'Menunggu Persetujuan');
    }

    setCabangList(cList);
    setSuperAdminList(saList);
    setAllSantri(santri);
    setAllGurus(gurus);
    setAllSPP(spp);
    setPendingPerizinan(perizinan);
  };

  useEffect(() => {
    reloadData();
    storageService.syncFromPostgres().then(res => {
      if (res && res.success) reloadData();
    }).catch(() => {});

    const handleUpdate = () => reloadData();
    window.addEventListener('simtah_data_updated', handleUpdate);
    window.addEventListener('simtah_santri_updated', handleUpdate);
    return () => {
      window.removeEventListener('simtah_data_updated', handleUpdate);
      window.removeEventListener('simtah_santri_updated', handleUpdate);
    };
  }, [activeBranchId]);

  // Sync selected branch filter with prop
  useEffect(() => {
    if (activeBranchId) {
      setSelectedBranchFilter(activeBranchId);
    }
  }, [activeBranchId]);

  // Handle Switch Filter Cabang di Dashboard
  const handleSelectBranchFilter = (branchId) => {
    setSelectedBranchFilter(branchId);
    if (onSwitchBranch) {
      onSwitchBranch(branchId);
    }
    const matched = cabangList.find(c => c.id === branchId);
    if (branchId === 'ALL') {
      showToast?.('Menampilkan ringkasan konsolidasi seluruh cabang.');
    } else {
      showToast?.(`Memfilter tampilan untuk: ${matched?.nama || branchId}`);
    }
  };

  // =========================================================
  // METRIK KONSOLIDASI & PER CABANG
  // =========================================================
  const branchSummaries = useMemo(() => {
    return (cabangList || []).map(c => {
      const santri = (allSantri || []).filter(s => (s.cabangId || 'cabang-pusat') === c.id);
      const gurus = (allGurus || []).filter(g => {
        const gBranch = g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
        return gBranch === c.id;
      });

      const sppCabang = (allSPP || []).filter(s => (s.cabangId === c.id || s.cabang_id === c.id));
      const sppLunas = sppCabang.filter(s => s.status === 'Lunas');
      const totalSPP = sppLunas.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);
      const targetSPP = sppCabang.length > 0 
        ? sppCabang.reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0)
        : (santri.length * 350000);
      const sppPercent = targetSPP > 0 ? Math.min(100, Math.round((totalSPP / targetSPP) * 100)) : (sppLunas.length > 0 ? 100 : 0);

      // Super Admin PIC
      const sa = (superAdminList || []).find(s => s.cabangId === c.id);

      // Presensi simulasi realistis
      const presensiRate = c.id === 'cabang-pusat' ? 97 : 94;

      return {
        cabang: c,
        santriCount: santri.length,
        guruCount: gurus.length,
        totalSPP,
        targetSPP,
        sppPercent,
        sppLunasCount: sppLunas.length,
        sppPendingCount: Math.max(0, santri.length - sppLunas.length),
        presensiRate,
        superAdmin: sa
      };
    });
  }, [cabangList, allSantri, allGurus, allSPP, superAdminList]);

  // Filtered Branch List
  const displayedBranches = useMemo(() => {
    if (!selectedBranchFilter || selectedBranchFilter === 'ALL') {
      return branchSummaries;
    }
    return branchSummaries.filter(b => b.cabang.id === selectedBranchFilter);
  }, [branchSummaries, selectedBranchFilter]);

  // Grand Totals (Konsolidasi Yayasan)
  const totalSantriYayasan = allSantri.length;
  const totalGuruYayasan = allGurus.length;
  const grandTotalSPP = branchSummaries.reduce((acc, curr) => acc + curr.totalSPP, 0);
  const grandTargetSPP = branchSummaries.reduce((acc, curr) => acc + curr.targetSPP, 0) || (totalSantriYayasan * 350000);
  const sppPercentYayasan = grandTargetSPP > 0 ? Math.min(100, Math.round((grandTotalSPP / grandTargetSPP) * 100)) : 0;
  const avgPresensiYayasan = branchSummaries.length > 0
    ? Math.round(branchSummaries.reduce((acc, curr) => acc + curr.presensiRate, 0) / branchSummaries.length)
    : 96;

  // Filtered SPP Records untuk Tab SPP (Mendukung pemisahan data per cabang)
  const filteredSPPRecords = useMemo(() => {
    return (allSPP || []).filter(item => {
      // Filter Cabang
      if (sppFilterBranch !== 'ALL') {
        const itemBranch = item.cabangId || item.cabang_id || 'cabang-pusat';
        if (itemBranch !== sppFilterBranch) return false;
      }

      // Filter Status
      if (sppFilterStatus !== 'ALL') {
        const itemStatus = item.status === 'Lunas' ? 'Lunas' : 'Pending';
        if (sppFilterStatus === 'Lunas' && itemStatus !== 'Lunas') return false;
        if (sppFilterStatus === 'Pending' && itemStatus === 'Lunas') return false;
      }

      // Search
      if (sppSearch.trim()) {
        const q = sppSearch.toLowerCase();
        const nama = (item.santriNama || item.santri_nama || item.namaSantri || item.nama || '').toLowerCase();
        const nis = String(item.nis || '').toLowerCase();
        const bulan = (item.bulan || '').toLowerCase();
        const inv = String(item.invoiceNo || item.invoice_no || '').toLowerCase();
        if (!nama.includes(q) && !nis.includes(q) && !bulan.includes(q) && !inv.includes(q)) return false;
      }

      return true;
    });
  }, [allSPP, sppFilterBranch, sppFilterStatus, sppSearch]);

  // Metrik Terpisah SPP Berdasarkan Filter Cabang Aktif (sppFilterBranch)
  const sppMetrics = useMemo(() => {
    if (sppFilterBranch === 'ALL') {
      const totalSantri = allSantri.length;
      const target = branchSummaries.reduce((acc, curr) => acc + curr.targetSPP, 0) || (totalSantri * 350000);
      const terkumpul = branchSummaries.reduce((acc, curr) => acc + curr.totalSPP, 0);
      const tunggakan = Math.max(0, target - terkumpul);
      const percent = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0;
      const totalInvoice = allSPP.length;
      return {
        target,
        terkumpul,
        tunggakan,
        percent,
        totalSantri,
        totalInvoice,
        scopeLabel: 'Di seluruh unit cabang lembaga'
      };
    } else {
      const summary = branchSummaries.find(b => b.cabang.id === sppFilterBranch);
      const branchSantri = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === sppFilterBranch);
      const branchSPP = (allSPP || []).filter(s => (s.cabangId === sppFilterBranch || s.cabang_id === sppFilterBranch));
      const target = summary ? summary.targetSPP : (branchSantri.length * 350000);
      const terkumpul = summary ? summary.totalSPP : 0;
      const tunggakan = Math.max(0, target - terkumpul);
      const percent = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0;
      const totalInvoice = branchSPP.length;
      const cInfo = cabangList.find(c => c.id === sppFilterBranch);
      return {
        target,
        terkumpul,
        tunggakan,
        percent,
        totalSantri: branchSantri.length,
        totalInvoice,
        scopeLabel: `Unit Cabang: ${cInfo?.nama || sppFilterBranch}`
      };
    }
  }, [sppFilterBranch, branchSummaries, allSantri, allSPP, cabangList]);

  // =========================================================
  // HANDLERS KONTROL CABANG & SUPER ADMIN
  // =========================================================
  const handleOpenAddCabang = () => {
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
  };

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

  const handleSaveCabang = (e) => {
    e.preventDefault();
    if (!cabangForm.nama || !cabangForm.kode) {
      showToast?.('Nama dan Kode Cabang wajib diisi!', 'error');
      return;
    }

    if (editingCabang) {
      storageService.updateCabang(editingCabang.id, {
        ...cabangForm
      });
      showToast?.(`Cabang "${cabangForm.nama}" berhasil diperbarui!`);
    } else {
      const payload = {
        ...cabangForm,
        id: `cabang-${cabangForm.kode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      };
      storageService.addCabang(payload);
      showToast?.(`Cabang "${payload.nama}" berhasil ditambahkan!`);
    }

    setShowAddCabangModal(false);
    reloadData();
  };

  // Generate Tagihan SPP Bulanan
  const handleGenerateSPP = () => {
    const bulan = 'September 2026';
    const targetBranch = sppFilterBranch;
    const count = storageService.generateMonthlySPP(bulan, 2026, 350000, targetBranch);
    const branchName = targetBranch === 'ALL' ? 'semua cabang' : (cabangList.find(c => c.id === targetBranch)?.nama || targetBranch);
    showToast?.(`⚡ Berhasil menerbitkan ${count} tagihan SPP baru untuk ${branchName} (${bulan})!`);
    reloadData();
  };

  // Tandai Lunas SPP
  const handleMarkLunasSPP = (sppItem) => {
    storageService.updatePembayaranSPP(sppItem.id, {
      status: 'Lunas',
      tanggalBayar: new Date().toISOString().split('T')[0],
      metodeBayar: sppItem.metodeBayar && sppItem.metodeBayar !== '-' ? sppItem.metodeBayar : 'Transfer Bank BSI',
      nomorRef: sppItem.nomorRef && sppItem.nomorRef !== '-' ? sppItem.nomorRef : `REF-${Date.now().toString().slice(-6)}`
    });
    const sName = sppItem.santriNama || sppItem.namaSantri || sppItem.nama || 'Santri';
    showToast?.(`✅ Tagihan SPP ${sName} telah ditandai LUNAS!`);
    reloadData();
  };

  // Hapus Tagihan SPP
  const handleDeleteSPP = (sppItem) => {
    const sName = sppItem.santriNama || sppItem.namaSantri || sppItem.nama || 'Santri';
    if (window.confirm(`Hapus catatan tagihan/pembayaran SPP untuk "${sName}"?`)) {
      storageService.deletePembayaranSPP(sppItem.id);
      showToast?.(`Data SPP ${sName} berhasil dihapus.`);
      reloadData();
    }
  };

  // Simpan Input SPP Baru
  const handleSaveNewSPP = (e) => {
    e.preventDefault();
    const targetSantri = allSantri.find(s => s.id === sppForm.santriId);
    if (!targetSantri) {
      showToast?.('Pilih santri terlebih dahulu!', 'error');
      return;
    }
    const createdItem = {
      santriId: targetSantri.id,
      santriNama: targetSantri.nama,
      nis: targetSantri.nis || '',
      kelas: targetSantri.kelas || '',
      cabangId: targetSantri.cabangId || 'cabang-pusat',
      bulan: sppForm.bulan || 'September 2026',
      tahun: 2026,
      nominal: Number(sppForm.nominal) || 350000,
      status: sppForm.status,
      tanggalBayar: sppForm.status === 'Lunas' ? new Date().toISOString().split('T')[0] : null,
      metodeBayar: sppForm.status === 'Lunas' ? sppForm.metodeBayar : '-',
      nomorRef: sppForm.status === 'Lunas' ? `REF-${Date.now().toString().slice(-6)}` : '-',
      catatan: sppForm.catatan || `Pembayaran SPP ${sppForm.bulan}`,
      namaPetugas: 'Pimpinan Yayasan'
    };
    storageService.addPembayaranSPP(createdItem);
    showToast?.(`✅ Pembayaran SPP untuk ${targetSantri.nama} berhasil dicatat!`);
    setShowAddSPPModal(false);
    reloadData();
  };

  const handleDeleteCabang = (cabang) => {
    if (cabang.id === 'cabang-pusat') {
      showToast?.('Cabang Utama (Pusat) tidak dapat dihapus!', 'error');
      return;
    }
    if (window.confirm(`Hapus unit cabang "${cabang.nama}"? Data santri dan pengampu di cabang ini akan terisolasi.`)) {
      storageService.deleteCabang(cabang.id);
      showToast?.(`Cabang "${cabang.nama}" telah dihapus.`);
      reloadData();
    }
  };

  // Reset Password Super Admin
  const handleConfirmResetPassword = () => {
    if (!resetSAPasswordTarget) return;
    const ok = storageService.resetPasswordSuperAdmin(resetSAPasswordTarget.id, newResetPassword);
    if (ok) {
      showToast?.(`Password Super Admin "${resetSAPasswordTarget.nama}" direset menjadi: ${newResetPassword}`);
      reloadData();
    }
    setResetSAPasswordTarget(null);
    setNewResetPassword('bismillah123');
  };

  // Copy Password
  const handleCopyPassword = (sa) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sa.password);
      setCopiedSAId(sa.id);
      showToast?.(`Password "${sa.nama}" (${sa.password}) disalin ke clipboard!`);
      setTimeout(() => setCopiedSAId(null), 2500);
    }
  };

  // Approve / Reject Perizinan
  const handleActionPerizinan = (izinId, status) => {
    if (storageService.updateStatusPerizinan) {
      storageService.updateStatusPerizinan(izinId, status);
    }
    showToast?.(`Permohonan izin berhasil di-${status === 'Disetujui' ? 'setujui' : 'tolak'}.`);
    reloadData();
  };

  // Send Broadcast
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    showToast?.(`Pengumuman berhasil disiarkan ke seluruh cabang!`);
    setBroadcastText('');
  };

  // =========================================================
  // GLOBAL MODALS (Dapat diakses dari semua tab Owner)
  // =========================================================
  const renderAllModals = () => (
    <>
      {/* 1. MODAL INSPEKSI DETAIL CABANG (LIHAT DATA) */}
      {inspectedBranch && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => {
            setInspectedBranch(null);
            setModalSearch('');
          }}
        >
          <div 
            style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                    {inspectedBranch.nama}
                  </h3>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: inspectedBranch.warnaAksen || '#6366f1', background: `${inspectedBranch.warnaAksen || '#6366f1'}15`, padding: '2px 8px', borderRadius: '8px' }}>
                    {inspectedBranch.kode}
                  </span>
                  <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
                    📍 {inspectedBranch.kota || 'Jawa Barat'}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>
                  PJ: {inspectedBranch.penanggungJawab || '-'} • Kontak: {inspectedBranch.noHp || '-'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    if (onSwitchBranch) onSwitchBranch(inspectedBranch.id);
                    if (setActiveTab) setActiveTab('sigap-dashboard');
                    setInspectedBranch(null);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: '#ff5b35',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Masuk ke portal cabang ini"
                >
                  <ExternalLink size={12} />
                  <span>Buka Portal Cabang</span>
                </button>
                <button
                  onClick={() => {
                    setInspectedBranch(null);
                    setModalSearch('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar Cabang Ini */}
            {(() => {
              const bSantri = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === inspectedBranch.id);
              const bGurus = allGurus.filter(g => (g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat')) === inspectedBranch.id);
              const bSPP = (allSPP || []).filter(p => (p.cabangId === inspectedBranch.id || p.cabang_id === inspectedBranch.id));
              const bSPPLunas = bSPP.filter(p => p.status === 'Lunas').reduce((a, b) => a + (Number(b.nominal) || 0), 0);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '1rem' }}>
                  <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>SANTRI AKTIF</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#3b82f6', marginTop: '2px' }}>{bSantri.length} Santri</div>
                  </div>
                  <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>PENGAMPU / STAF</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#8b5cf6', marginTop: '2px' }}>{bGurus.length} Pengampu</div>
                  </div>
                  <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>SPP TERKUMPUL</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>Rp {bSPPLunas.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              );
            })()}

            {/* Sub-Tabs: Santri | Guru | SPP + Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: 'santri', label: '🎓 Data Santri' },
                  { id: 'guru', label: '👨‍🏫 Data Guru/Staf' },
                  { id: 'spp', label: '💰 Rekap SPP' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setInspectionTab(tab.id);
                      setModalSearch('');
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '12px',
                      fontSize: '0.76rem',
                      fontWeight: inspectionTab === tab.id ? 800 : 600,
                      background: inspectionTab === tab.id ? '#ff5b35' : (isDarkMode ? '#0f172a' : '#f1f5f9'),
                      color: inspectionTab === tab.id ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#64748b'),
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Filter data..."
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '0.74rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Content List */}
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {inspectionTab === 'santri' && (
                <div>
                  {(() => {
                    const list = allSantri.filter(s => (s.cabangId || 'cabang-pusat') === inspectedBranch.id);
                    const q = modalSearch.toLowerCase().trim();
                    const filtered = q ? list.filter(s => (s.nama || '').toLowerCase().includes(q) || String(s.nis || '').toLowerCase().includes(q) || (s.kelas || '').toLowerCase().includes(q)) : list;
                    
                    if (filtered.length === 0) {
                      return (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                          {list.length === 0 ? 'Belum ada data santri terdaftar di cabang ini.' : 'Tidak ada santri yang cocok dengan filter pencarian.'}
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {filtered.map(s => (
                          <div 
                            key={s.id}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: isDarkMode ? '#0f172a' : '#f8fafc',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.76rem'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>{s.nama}</div>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>NIS: {s.nis || '-'} • Kelas: {s.kelas || '-'} • Wali: {s.wali || '-'}</div>
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                              {s.status || 'Aktif'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {inspectionTab === 'guru' && (
                <div>
                  {(() => {
                    const list = allGurus.filter(g => (g.cabangId || (g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat')) === inspectedBranch.id);
                    const q = modalSearch.toLowerCase().trim();
                    const filtered = q ? list.filter(g => (g.nama || '').toLowerCase().includes(q) || (g.jabatan || '').toLowerCase().includes(q)) : list;
                    
                    if (filtered.length === 0) {
                      return (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                          {list.length === 0 ? 'Belum ada data guru terdaftar di cabang ini.' : 'Tidak ada guru yang cocok dengan filter pencarian.'}
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {filtered.map(g => (
                          <div 
                            key={g.id}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: isDarkMode ? '#0f172a' : '#f8fafc',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.76rem'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>{g.nama}</div>
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{g.jabatan || g.roleLabel || 'Pengampu'} • {g.noHp || '-'}</div>
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6366f1', background: '#ede9fe', padding: '2px 8px', borderRadius: '6px' }}>
                              {g.status || 'Aktif'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {inspectionTab === 'spp' && (
                <div>
                  {(() => {
                    const list = (allSPP || []).filter(p => (p.cabangId === inspectedBranch.id || p.cabang_id === inspectedBranch.id));
                    const q = modalSearch.toLowerCase().trim();
                    const filtered = q ? list.filter(p => (p.santriNama || p.namaSantri || p.nama || '').toLowerCase().includes(q) || (p.bulan || '').toLowerCase().includes(q) || String(p.invoiceNo || '').toLowerCase().includes(q)) : list;
                    
                    if (filtered.length === 0) {
                      return (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
                          {list.length === 0 ? 'Belum ada catatan transaksi SPP di cabang ini.' : 'Tidak ada transaksi SPP yang cocok dengan pencarian.'}
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {filtered.map(p => {
                          const isLunas = p.status === 'Lunas';
                          return (
                            <div 
                              key={p.id}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '10px',
                                background: isDarkMode ? '#0f172a' : '#f8fafc',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.76rem'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                                  {p.santriNama || p.namaSantri || p.nama || 'Santri'}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                  {p.bulan || 'September 2026'} • Rp {Number(p.nominal || 0).toLocaleString('id-ID')} • {p.metodeBayar || 'Transfer'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span 
                                  style={{ 
                                    fontSize: '0.68rem', 
                                    fontWeight: 800, 
                                    color: isLunas ? '#10b981' : '#dc2626', 
                                    background: isLunas ? '#ecfdf5' : '#fef2f2', 
                                    padding: '2px 8px', 
                                    borderRadius: '6px',
                                    border: isLunas ? '1px solid #a7f3d0' : '1px solid #fecaca'
                                  }}
                                >
                                  {isLunas ? 'LUNAS' : 'PENDING'}
                                </span>
                                {!isLunas && (
                                  <button
                                    onClick={() => handleMarkLunasSPP(p)}
                                    style={{
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      background: '#10b981',
                                      color: '#ffffff',
                                      border: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Lunaskan
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL KREDENSIAL SUPER ADMIN (GANTI PASSWORD) */}
      {resetSAPasswordTarget && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setResetSAPasswordTarget(null)}
        >
          <div 
            style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} color="#ff5b35" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                  Kredensial Super Admin
                </h3>
              </div>
              <button onClick={() => setResetSAPasswordTarget(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.78rem' }}>
              <div style={{ marginBottom: '6px', color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                Nama: <strong>{resetSAPasswordTarget.nama}</strong>
              </div>
              <div style={{ marginBottom: '6px', color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                Username: <code>{resetSAPasswordTarget.username}</code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                  Password: <strong>{visiblePasswords[resetSAPasswordTarget.id] ? resetSAPasswordTarget.password : '••••••••'}</strong>
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => setVisiblePasswords(p => ({ ...p, [resetSAPasswordTarget.id]: !p[resetSAPasswordTarget.id] }))}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                  >
                    {visiblePasswords[resetSAPasswordTarget.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button 
                    onClick={() => handleCopyPassword(resetSAPasswordTarget)}
                    style={{ background: 'transparent', border: 'none', color: '#ff5b35', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.70rem', fontWeight: 800 }}
                  >
                    {copiedSAId === resetSAPasswordTarget.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                Ganti Password Baru:
              </label>
              <input 
                type="text"
                value={newResetPassword}
                onChange={(e) => setNewResetPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                  background: isDarkMode ? '#0f172a' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setResetSAPasswordTarget(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: isDarkMode ? '#334155' : '#f1f5f9',
                  color: isDarkMode ? '#f8fafc' : '#64748b',
                  border: 'none',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
              <button
                onClick={handleConfirmResetPassword}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: '#ff5b35',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Simpan Password Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL TAMBAH / EDIT CABANG */}
      {showAddCabangModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowAddCabangModal(false)}
        >
          <div 
            style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                  {editingCabang ? `Edit Unit Cabang: ${editingCabang.nama}` : 'Tambah Unit Cabang Baru'}
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                  Kelola data legalitas, kontak, dan penanggung jawab operasional cabang
                </div>
              </div>
              <button onClick={() => setShowAddCabangModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCabang} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                  Nama Cabang / Unit Lembaga:
                </label>
                <input 
                  type="text"
                  required
                  value={cabangForm.nama}
                  onChange={(e) => setCabangForm(f => ({ ...f, nama: e.target.value }))}
                  placeholder="Contoh: SMA Tahfidz Ihya As-Sunnah"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Kode Singkat Cabang:
                  </label>
                  <input 
                    type="text"
                    required
                    value={cabangForm.kode}
                    onChange={(e) => setCabangForm(f => ({ ...f, kode: e.target.value.toUpperCase() }))}
                    placeholder="Contoh: MA / RDT-HFZ"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Kota / Wilayah:
                  </label>
                  <input 
                    type="text"
                    value={cabangForm.kota}
                    onChange={(e) => setCabangForm(f => ({ ...f, kota: e.target.value }))}
                    placeholder="Contoh: Jambi / Jember"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                  Alamat Lengkap Cabang:
                </label>
                <input 
                  type="text"
                  value={cabangForm.alamat}
                  onChange={(e) => setCabangForm(f => ({ ...f, alamat: e.target.value }))}
                  placeholder="Jl. Terusan As-Sunnah No. 12..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Penanggung Jawab / Kepala:
                  </label>
                  <input 
                    type="text"
                    value={cabangForm.penanggungJawab}
                    onChange={(e) => setCabangForm(f => ({ ...f, penanggungJawab: e.target.value }))}
                    placeholder="Nama Kepala Unit Cabang"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Kontak / No. WhatsApp:
                  </label>
                  <input 
                    type="text"
                    value={cabangForm.noHp}
                    onChange={(e) => setCabangForm(f => ({ ...f, noHp: e.target.value }))}
                    placeholder="0812-xxxx-xxxx"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                  Warna Aksen Identitas Cabang:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {['#e11d48', '#2563eb', '#0d9488', '#7c3aed', '#ea580c', '#0284c7'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCabangForm(f => ({ ...f, warnaAksen: color }))}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: color,
                        border: cabangForm.warnaAksen === color ? '3px solid #ffffff' : 'none',
                        boxShadow: cabangForm.warnaAksen === color ? '0 0 0 2px #ff5b35' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '6px' }}>
                    {cabangForm.warnaAksen}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                {editingCabang && editingCabang.id !== 'cabang-pusat' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCabangModal(false);
                      handleDeleteCabang(editingCabang);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Hapus Cabang</span>
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCabangModal(false)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: isDarkMode ? '#334155' : '#f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#64748b',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: '#ff5b35',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Simpan Cabang
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL CATAT PEMBAYARAN SPP BARU */}
      {showAddSPPModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowAddSPPModal(false)}
        >
          <div 
            style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                  Catat Transaksi SPP Baru
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                  Input pembayaran syahriah / tagihan SPP santri per unit cabang
                </div>
              </div>
              <button onClick={() => setShowAddSPPModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewSPP} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                  Pilih Santri:
                </label>
                <select
                  required
                  value={sppForm.santriId}
                  onChange={(e) => setSppForm(f => ({ ...f, santriId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">-- Pilih Santri --</option>
                  {(allSantri || [])
                    .filter(s => sppFilterBranch === 'ALL' || (s.cabangId || 'cabang-pusat') === sppFilterBranch)
                    .map(s => {
                      const cName = cabangList.find(c => c.id === (s.cabangId || 'cabang-pusat'))?.kode || 'MA';
                      return (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({cName} - Kelas: {s.kelas || '-'})
                        </option>
                      );
                    })}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Bulan Tagihan:
                  </label>
                  <select
                    value={sppForm.bulan}
                    onChange={(e) => setSppForm(f => ({ ...f, bulan: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    {['Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Nominal (Rp):
                  </label>
                  <input
                    type="number"
                    required
                    value={sppForm.nominal}
                    onChange={(e) => setSppForm(f => ({ ...f, nominal: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Status Pembayaran:
                  </label>
                  <select
                    value={sppForm.status}
                    onChange={(e) => setSppForm(f => ({ ...f, status: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Belum Lunas">Belum Lunas (Pending)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                    Metode Pembayaran:
                  </label>
                  <select
                    value={sppForm.metodeBayar}
                    onChange={(e) => setSppForm(f => ({ ...f, metodeBayar: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                      background: isDarkMode ? '#0f172a' : '#ffffff',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Transfer Bank BSI">Transfer Bank BSI</option>
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                    <option value="Tunai di Kantor">Tunai di Kantor Cabang</option>
                    <option value="QRIS Yayasan">QRIS Yayasan</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569', marginBottom: '4px' }}>
                  Catatan / Keterangan:
                </label>
                <input
                  type="text"
                  value={sppForm.catatan}
                  onChange={(e) => setSppForm(f => ({ ...f, catatan: e.target.value }))}
                  placeholder="Contoh: Pembayaran SPP Rutin..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddSPPModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: isDarkMode ? '#334155' : '#f1f5f9',
                    color: isDarkMode ? '#f8fafc' : '#64748b',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Simpan SPP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  // =========================================================
  // VIEW: PENGATURAN YAYASAN (JIKA TAB owner-konfigurasi)
  // =========================================================
  if (activeTab === 'owner-konfigurasi' || activeTab === 'sigap-konfigurasi') {
    return (
      <PengaturanAdminView 
        settings={storageService.getSettings()}
        halaqahList={storageService.getHalaqah()}
        santriList={allSantri}
        activeBranchId={activeBranchId}
        onSaveSettings={(newSettings) => {
          storageService.saveSettings(newSettings);
          showToast?.("Pengaturan sistem yayasan berhasil diperbarui!");
          reloadData();
        }}
        onReload={reloadData}
        showToast={showToast}
        currentRole="owner"
        isOwner={true}
      />
    );
  }

  // =========================================================
  // VIEW 2: MANAJEMEN CABANG (JIKA TAB owner-cabang)
  // =========================================================
  if (activeTab === 'owner-cabang' || activeTab === 'owner-superadmin') {
    return (
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.25rem 1rem', minHeight: '100vh' }}>
        {/* Header Manajemen Cabang */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={24} color="#7c3aed" />
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', margin: 0 }}>
                Manajemen Cabang & Akun Super Admin<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
              </h1>
            </div>
            <div style={{ fontSize: '0.80rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
              Kelola data unit cabang, profil operasional, penanggung jawab, dan kredensial login Super Admin cabang
            </div>
          </div>

          <button
            onClick={handleOpenAddCabang}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: '#ff5b35',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(255, 91, 53, 0.28)'
            }}
          >
            <Plus size={16} />
            <span>Tambah Cabang Baru</span>
          </button>
        </div>

        {/* Daftar Lengkap Cabang & Super Admin */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {branchSummaries.map(({ cabang, santriCount, guruCount, totalSPP, superAdmin }) => {
            return (
              <div
                key={cabang.id}
                style={{
                  background: isDarkMode ? '#1e293b' : '#ffffff',
                  borderRadius: '20px',
                  padding: '1.35rem',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Top Bar Cabang */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div 
                        style={{ 
                          width: '46px', 
                          height: '46px', 
                          borderRadius: '14px', 
                          background: `${cabang.warnaAksen || '#6366f1'}15`, 
                          border: `1.5px solid ${cabang.warnaAksen || '#6366f1'}40`,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}
                      >
                        🏛️
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                          {cabang.nama}
                        </h3>
                        <div style={{ fontSize: '0.74rem', color: isDarkMode ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontWeight: 800, color: cabang.warnaAksen || '#6366f1' }}>{cabang.kode}</span>
                          <span>•</span>
                          <span>{cabang.kota || 'Tasikmalaya'}</span>
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.64rem', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                      🟢 AKTIF
                    </span>
                  </div>

                  {/* Info Operasional */}
                  <div style={{ background: isDarkMode ? '#0f172a' : '#f8fafc', padding: '12px', borderRadius: '14px', marginBottom: '1rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                      📍 <strong>Alamat:</strong> {cabang.alamat || 'Komplek Pesantren Ihya As-Sunnah'}
                    </div>
                    <div style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                      👤 <strong>Penanggung Jawab:</strong> {cabang.penanggungJawab || 'Pimpinan Cabang'}
                    </div>
                    <div style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                      📞 <strong>Kontak / WA:</strong> {cabang.noHp || '-'}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '4px', paddingTop: '6px', borderTop: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0', fontWeight: 700 }}>
                      <span style={{ color: '#6366f1' }}>🎓 {santriCount} Santri</span>
                      <span style={{ color: '#0ea5e9' }}>👨‍🏫 {guruCount} Pengajar</span>
                      <span style={{ color: '#10b981' }}>💰 Rp {(totalSPP / 1000000).toFixed(1)}Jt SPP</span>
                    </div>
                  </div>

                  {/* Kredensial Super Admin Cabang */}
                  <div style={{ background: isDarkMode ? '#1e293b' : '#f1f5f9', padding: '10px 12px', borderRadius: '12px', marginBottom: '1rem', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <KeyRound size={13} />
                        <span>KREDENSIAL AKUN LOGIN CABANG</span>
                      </div>
                      {superAdmin && (
                        <button
                          onClick={() => setResetSAPasswordTarget(superAdmin)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff5b35',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Ganti Password</span>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: '0.76rem', color: isDarkMode ? '#cbd5e1' : '#334155' }}>
                      Username: <code>{superAdmin?.username || `admin.${cabang.kode?.toLowerCase()}`}</code>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.76rem' }}>
                      <span style={{ color: isDarkMode ? '#cbd5e1' : '#334155' }}>
                        Password: <strong>{superAdmin && visiblePasswords[superAdmin.id] ? superAdmin.password : '••••••••'}</strong>
                      </span>
                      {superAdmin && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => setVisiblePasswords(p => ({ ...p, [superAdmin.id]: !p[superAdmin.id] }))}
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                          >
                            {visiblePasswords[superAdmin.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button 
                            onClick={() => handleCopyPassword(superAdmin)}
                            style={{ background: 'transparent', border: 'none', color: '#ff5b35', cursor: 'pointer', padding: '2px' }}
                          >
                            {copiedSAId === superAdmin.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Bawah */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '0.75rem', borderTop: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => handleOpenEditCabang(cabang)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      background: isDarkMode ? '#334155' : '#f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#1e293b',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Cabang</span>
                  </button>

                  <button
                    onClick={() => {
                      setInspectedBranch(cabang);
                      setInspectionTab('santri');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      background: '#ede9fe',
                      color: '#6366f1',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Search size={13} />
                    <span>Lihat Data</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Modals for Manajemen Cabang */}
        {renderAllModals()}
      </div>
    );
  }

  // =========================================================
  // VIEW 3: KEUANGAN & SPP GLOBAL (JIKA TAB owner-spp)
  // =========================================================
  if (activeTab === 'owner-spp' || activeTab === 'sigap-spp') {
    return (
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.25rem 1rem', minHeight: '100vh' }}>
        {/* Header SPP */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={24} color="#10b981" />
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', margin: 0 }}>
                Keuangan & SPP Seluruh Cabang<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
              </h1>
            </div>
            <div style={{ fontSize: '0.80rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
              Rekapitulasi pembayaran syahriah / SPP terpisah per unit cabang, monitoring target potensi, dan realisasi pelunasan
            </div>
          </div>

          {/* Right Header Actions & Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Filter Cabang Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: isDarkMode ? '#0f172a' : '#f1f5f9', padding: '4px', borderRadius: '14px' }}>
              <button
                onClick={() => setSppFilterBranch('ALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.76rem',
                  fontWeight: sppFilterBranch === 'ALL' ? 800 : 600,
                  background: sppFilterBranch === 'ALL' ? '#10b981' : 'transparent',
                  color: sppFilterBranch === 'ALL' ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#475569'),
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🌐 Semua Cabang
              </button>
              {cabangList.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSppFilterBranch(c.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.76rem',
                    fontWeight: sppFilterBranch === c.id ? 800 : 600,
                    background: sppFilterBranch === c.id ? (c.warnaAksen || '#6366f1') : 'transparent',
                    color: sppFilterBranch === c.id ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#475569'),
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🏛️ {c.nama}
                </button>
              ))}
            </div>

            {/* Tombol Terbitkan Tagihan & Input Pembayaran */}
            <button
              onClick={handleGenerateSPP}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.76rem',
                fontWeight: 800,
                background: isDarkMode ? '#334155' : '#f8fafc',
                color: isDarkMode ? '#f8fafc' : '#1e293b',
                border: isDarkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Terbitkan tagihan SPP bulan berjalan untuk santri yang belum ada invoice"
            >
              <span>⚡ Terbitkan Tagihan</span>
            </button>

            <button
              onClick={() => {
                setSppForm({
                  santriId: '',
                  bulan: 'September 2026',
                  nominal: 350000,
                  status: 'Lunas',
                  metodeBayar: 'Transfer Bank BSI',
                  catatan: 'Pembayaran SPP Rutin'
                });
                setShowAddSPPModal(true);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.76rem',
                fontWeight: 800,
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              <Plus size={15} />
              <span>Catat SPP</span>
            </button>
          </div>
        </div>

        {/* 4 Kartu Ringkasan Finansial SPP (DINAMIS SESUAI sppFilterBranch) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '1.15rem', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>TOTAL TERKUMPUL (REALISASI)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
              Rp {sppMetrics.terkumpul.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
              ● {sppMetrics.percent}% dari target {sppFilterBranch === 'ALL' ? 'yayasan' : 'cabang'}
            </div>
          </div>

          <div style={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '1.15rem', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>TARGET POTENSI TAGIHAN</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', marginTop: '4px' }}>
              Rp {sppMetrics.target.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              Berdasarkan {sppMetrics.totalSantri} santri aktif {sppFilterBranch !== 'ALL' ? 'cabang ini' : 'seluruh cabang'}
            </div>
          </div>

          <div style={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '1.15rem', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>SISA TUNGGAKAN / BELUM LUNAS</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>
              Rp {sppMetrics.tunggakan.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>
              Perlu follow-up wali santri
            </div>
          </div>

          <div style={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '16px', padding: '1.15rem', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>TOTAL TRANSAKSI TERCATAT</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#6366f1', marginTop: '4px' }}>
              {sppMetrics.totalInvoice} <span style={{ fontSize: '0.80rem', fontWeight: 600 }}>Invoice</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
              {sppMetrics.scopeLabel}
            </div>
          </div>
        </div>

        {/* WIDGET PERBANDINGAN REALISASI SPP PER CABANG (SEPARATED DATA PER CABANG) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDarkMode ? '#cbd5e1' : '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏛️ Perbandingan Realisasi SPP Antar Cabang</span>
            <span style={{ fontSize: '0.70rem', color: '#94a3b8', fontWeight: 500 }}>(Klik kartu untuk memfilter cabang)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {branchSummaries.map(({ cabang, santriCount, totalSPP, targetSPP, sppPercent, sppLunasCount, sppPendingCount }) => {
              const isSelected = sppFilterBranch === cabang.id;
              const accent = cabang.warnaAksen || '#6366f1';
              return (
                <div
                  key={cabang.id}
                  onClick={() => setSppFilterBranch(isSelected ? 'ALL' : cabang.id)}
                  style={{
                    background: isDarkMode ? '#1e293b' : '#ffffff',
                    borderRadius: '16px',
                    padding: '1.15rem',
                    border: isSelected ? `2px solid ${accent}` : (isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'),
                    boxShadow: isSelected ? `0 4px 16px ${accent}25` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top Bar Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div 
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '10px', 
                          background: `${accent}15`, 
                          color: accent,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.85rem'
                        }}
                      >
                        🏛️
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.90rem', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                          {cabang.nama}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {cabang.kode} • {cabang.kota || 'Jawa Barat'}
                        </div>
                      </div>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 800, 
                        padding: '2px 8px', 
                        borderRadius: '8px',
                        background: isSelected ? accent : (isDarkMode ? '#0f172a' : '#f1f5f9'),
                        color: isSelected ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#64748b')
                      }}
                    >
                      {isSelected ? '✓ Terpilih' : `${santriCount} Santri`}
                    </span>
                  </div>

                  {/* Progress Realisasi */}
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Realisasi:</span>
                      <strong style={{ color: '#10b981' }}>
                        Rp {totalSPP.toLocaleString('id-ID')} <span style={{ color: '#94a3b8', fontWeight: 500 }}>/ Rp {targetSPP.toLocaleString('id-ID')}</span>
                      </strong>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '7px', background: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, sppPercent)}%`, 
                          height: '100%', 
                          background: sppPercent >= 80 ? '#10b981' : (sppPercent >= 50 ? '#f59e0b' : '#ef4444'),
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }} 
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.68rem' }}>
                      <span style={{ color: '#94a3b8' }}>
                        Pelunasan: <strong style={{ color: '#10b981' }}>{sppLunasCount} Lunas</strong> • <strong style={{ color: '#ef4444' }}>{sppPendingCount} Belum</strong>
                      </span>
                      <strong style={{ color: accent, fontSize: '0.76rem' }}>{sppPercent}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabel Rekap Transaksi SPP Terpisah per Cabang */}
        <div style={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: '20px', padding: '1.35rem', border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
          {/* Toolbar Search & Status Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '380px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={sppSearch}
                  onChange={(e) => setSppSearch(e.target.value)}
                  placeholder="Cari santri, NIS, bulan, atau invoice..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '0.80rem',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Filter Status Lunas / Pending */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'Lunas', 'Pending'].map(status => (
                <button
                  key={status}
                  onClick={() => setSppFilterStatus(status)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.74rem',
                    fontWeight: sppFilterStatus === status ? 800 : 600,
                    background: sppFilterStatus === status ? (status === 'Lunas' ? '#10b981' : (status === 'Pending' ? '#ef4444' : '#6366f1')) : (isDarkMode ? '#0f172a' : '#f1f5f9'),
                    color: sppFilterStatus === status ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#64748b'),
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {status === 'ALL' ? 'Semua Status' : status}
                </button>
              ))}
            </div>
          </div>

          {/* List / Table SPP */}
          {filteredSPPRecords.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              🔍 Tidak ditemukan transaksi SPP yang sesuai dengan filter cabang atau status ini.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 12px' }}>Tanggal & No. Invoice</th>
                    <th style={{ padding: '10px 12px' }}>Santri & NIS</th>
                    <th style={{ padding: '10px 12px' }}>Unit Cabang</th>
                    <th style={{ padding: '10px 12px' }}>Bulan</th>
                    <th style={{ padding: '10px 12px' }}>Nominal</th>
                    <th style={{ padding: '10px 12px' }}>Metode Bayar</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSPPRecords.map((item, idx) => {
                    const cInfo = cabangList.find(c => c.id === (item.cabangId || item.cabang_id));
                    const isLunas = item.status === 'Lunas';
                    const santriName = item.santriNama || item.santri_nama || item.namaSantri || item.nama || 'Santri';
                    const invoiceNum = item.invoiceNo || item.invoice_no || `INV-${idx + 1}`;
                    const tanggalStr = item.tanggalBayar || item.tanggal_bayar || item.tanggal || item.createdAt?.slice(0, 10) || '2026-09-24';
                    const metodeStr = item.metodeBayar || item.metode_bayar || item.metode || '-';
                    return (
                      <tr 
                        key={item.id || idx}
                        style={{ 
                          borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? 'transparent' : (isDarkMode ? '#0f172a15' : '#f8fafc50')
                        }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: '0.76rem' }}>{invoiceNum}</strong>
                          <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>{tanggalStr}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{santriName}</strong>
                          <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>NIS: {item.nis || '-'} • Kelas: {item.kelas || '-'}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span 
                            style={{ 
                              fontSize: '0.72rem', 
                              fontWeight: 800, 
                              color: cInfo?.warnaAksen || '#6366f1',
                              background: `${cInfo?.warnaAksen || '#6366f1'}15`,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            🏛️ {cInfo?.nama || 'MA Ihya As-Sunnah'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                          {item.bulan || 'September 2026'}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: isLunas ? '#10b981' : '#ef4444' }}>
                          Rp {Number(item.nominal || 0).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                          {metodeStr}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span 
                            style={{ 
                              fontSize: '0.70rem', 
                              fontWeight: 800, 
                              padding: '3px 8px', 
                              borderRadius: '8px',
                              background: isLunas ? '#ecfdf5' : '#fef2f2',
                              color: isLunas ? '#059669' : '#dc2626',
                              border: isLunas ? '1px solid #a7f3d0' : '1px solid #fecaca'
                            }}
                          >
                            {isLunas ? 'LUNAS' : 'PENDING'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {!isLunas && (
                              <button
                                onClick={() => handleMarkLunasSPP(item)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  background: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Tandai pembayaran lunas"
                              >
                                Lunaskan
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSPP(item)}
                              style={{
                                padding: '4px 6px',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                background: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              title="Hapus data tagihan"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Global Modals for SPP */}
        {renderAllModals()}
      </div>
    );
  }

  // =========================================================
  // VIEW 1 (DEFAULT): PUSAT KONTROL & MONITORING EKSEKUTIF
  // =========================================================
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem', minHeight: '100vh' }}>
      
      {/* =========================================================
          1. HEADER EKSEKUTIF & FILTER CABANG CEPAT (BERSIH & SIMPLE)
          ========================================================= */}
      <div 
        style={{
          background: isDarkMode ? '#1e293b' : '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Pusat Kontrol Yayasan Tahfidz Hub<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
            </h1>
            <span 
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                background: isDarkMode ? '#064e3b' : '#ecfdf5',
                color: isDarkMode ? '#34d399' : '#059669',
                border: isDarkMode ? '1px solid #059669' : '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '12px'
              }}
            >
              🟢 SISTEM NORMAL
            </span>
          </div>
          <div style={{ fontSize: '0.80rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
            Pemantauan & kendali eksekutif real-time seluruh cabang ({cabangList.length} unit beroperasi)
          </div>
        </div>

        {/* Quick Branch Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSelectBranchFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: selectedBranchFilter === 'ALL' ? 800 : 600,
              background: selectedBranchFilter === 'ALL' ? '#ff5b35' : (isDarkMode ? '#0f172a' : '#f1f5f9'),
              color: selectedBranchFilter === 'ALL' ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#475569'),
              border: selectedBranchFilter === 'ALL' ? '1.5px solid #ff5b35' : (isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'),
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            🌐 Semua Cabang (Konsolidasi)
          </button>

          {cabangList.map(c => {
            const isSelected = selectedBranchFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectBranchFilter(c.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 800 : 600,
                  background: isSelected ? (c.warnaAksen || '#6366f1') : (isDarkMode ? '#0f172a' : '#f1f5f9'),
                  color: isSelected ? '#ffffff' : (isDarkMode ? '#cbd5e1' : '#475569'),
                  border: isSelected ? `1.5px solid ${c.warnaAksen || '#6366f1'}` : (isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'),
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                🏛️ {c.nama}
              </button>
            );
          })}

          <button
            onClick={handleOpenAddCabang}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.76rem',
              fontWeight: 700,
              background: 'transparent',
              color: isDarkMode ? '#38bdf8' : '#0284c7',
              border: isDarkMode ? '1px dashed #38bdf8' : '1px dashed #0284c7',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} />
            <span>Tambah Cabang</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. EMPAT KARTU METRIK EKSEKUTIF INTI (SEDERHANA & INFORMATIF)
          ========================================================= */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}
      >
        {/* Metrik 1: Total Santri */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '18px',
            padding: '1.15rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              TOTAL SANTRI AKTIF
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', lineHeight: 1.1 }}>
            {selectedBranchFilter === 'ALL' ? totalSantriYayasan : (displayedBranches[0]?.santriCount || 0)}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginLeft: '4px' }}>Siswa</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
            {selectedBranchFilter === 'ALL' 
              ? `Tersebar di ${cabangList.length} cabang lembaga`
              : `Terdaftar di ${displayedBranches[0]?.cabang?.nama || 'cabang ini'}`
            }
          </div>
        </div>

        {/* Metrik 2: Guru & Pengawas */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '18px',
            padding: '1.15rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              PENGAWAS & GURU
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#4f46e5" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', lineHeight: 1.1 }}>
            {selectedBranchFilter === 'ALL' ? totalGuruYayasan : (displayedBranches[0]?.guruCount || 0)}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginLeft: '4px' }}>Pengajar</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
            Musyrif halaqah & asatidz terdata
          </div>
        </div>

        {/* Metrik 3: Realisasi SPP */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '18px',
            padding: '1.15rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              REALISASI SPP BULAN INI
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
            Rp {(selectedBranchFilter === 'ALL' ? grandTotalSPP : (displayedBranches[0]?.totalSPP || 0)).toLocaleString('id-ID')}
          </div>
          {/* Progress Bar Realisasi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <div style={{ flex: 1, height: '6px', background: isDarkMode ? '#334155' : '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${selectedBranchFilter === 'ALL' ? sppPercentYayasan : (displayedBranches[0]?.sppPercent || 0)}%`, 
                  background: '#10b981', 
                  borderRadius: '4px' 
                }} 
              />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10b981' }}>
              {selectedBranchFilter === 'ALL' ? sppPercentYayasan : (displayedBranches[0]?.sppPercent || 0)}%
            </span>
          </div>
        </div>

        {/* Metrik 4: Tingkat Kehadiran KBM */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '18px',
            padding: '1.15rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              PRESENSI KBM HARI INI
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#7c3aed" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', lineHeight: 1.1 }}>
            {selectedBranchFilter === 'ALL' ? avgPresensiYayasan : (displayedBranches[0]?.presensiRate || 95)}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>● Berjalan tertib & lancar</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. SATU MODEL GRAFIK MODERN TERPADU
          ========================================================= */}
      <OwnerBranchAnalyticsCharts 
        cabangList={cabangList}
        allSantri={allSantri}
        allGurus={allGurus}
        allSPP={allSPP}
        isDarkMode={isDarkMode}
        onInspectBranch={(branchId) => {
          const target = cabangList.find(c => c.id === branchId);
          if (target) setInspectedBranch(target);
        }}
        onNavigateToSPP={() => setActiveTab('owner-spp')}
      />

      {/* =========================================================
          4. KARTU PEMANTAUAN & KONTROL CABANG
          ========================================================= */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#0f172a', margin: 0 }}>
              Status Operasional & Kendali Cabang<span style={{ color: '#ff5b35', marginLeft: '2px' }}>.</span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
              Pantau langsung detail siswa, pengawas, pembayaran SPP, dan kelola kredensial tiap unit
            </div>
          </div>

          <button
            onClick={handleOpenAddCabang}
            style={{
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: '#ff5b35',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(255, 91, 53, 0.25)'
            }}
          >
            <Plus size={15} />
            <span>Tambah Cabang Baru</span>
          </button>
        </div>

        {/* Grid Kartu Cabang */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {displayedBranches.map(({ cabang, santriCount, guruCount, totalSPP, sppPercent, presensiRate, superAdmin }) => {
            return (
              <div
                key={cabang.id}
                style={{
                  background: isDarkMode ? '#1e293b' : '#ffffff',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Header Kartu Cabang */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '12px', 
                          background: `${cabang.warnaAksen || '#6366f1'}15`, 
                          border: `1.5px solid ${cabang.warnaAksen || '#6366f1'}40`,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: cabang.warnaAksen || '#6366f1',
                          fontWeight: 900,
                          fontSize: '1rem'
                        }}
                      >
                        🏛️
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                            {cabang.nama}
                          </h3>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isDarkMode ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontWeight: 800, color: cabang.warnaAksen || '#6366f1' }}>{cabang.kode}</span>
                          <span>•</span>
                          <span>{cabang.kota || 'Tasikmalaya'}</span>
                        </div>
                      </div>
                    </div>

                    <span 
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        border: '1px solid #a7f3d0'
                      }}
                    >
                      🟢 AKTIF
                    </span>
                  </div>

                  {/* 4 Indikator Cabang (Sederhana & Padat Info) */}
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '0.5rem', 
                      background: isDarkMode ? '#0f172a' : '#f8fafc', 
                      padding: '0.85rem', 
                      borderRadius: '14px',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>SANTRI AKTIF</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                        {santriCount} <span style={{ fontSize: '0.70rem', fontWeight: 600 }}>Siswa</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>PENGAWAS & GURU</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                        {guruCount} <span style={{ fontSize: '0.70rem', fontWeight: 600 }}>Pengampu</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>REALISASI SPP</div>
                      <div style={{ fontSize: '0.90rem', fontWeight: 900, color: '#10b981' }}>
                        Rp {(totalSPP / 1000000).toFixed(1)}Jt <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>({sppPercent}%)</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>PRESENSI KBM</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                        {presensiRate}%
                      </div>
                    </div>
                  </div>

                  {/* Super Admin Penanggung Jawab */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '6px 10px', 
                      borderRadius: '10px', 
                      background: isDarkMode ? '#1e293b' : '#f1f5f9',
                      fontSize: '0.72rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} color="#6366f1" />
                      <span style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                        Admin: <strong>{superAdmin?.nama || 'Admin Cabang'}</strong>
                      </span>
                    </div>

                    {superAdmin && (
                      <button
                        onClick={() => setResetSAPasswordTarget(superAdmin)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ff5b35',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <KeyRound size={12} />
                        <span>Kredensial</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tombol Kontrol Cabang (Direct Control Actions) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => {
                      setInspectedBranch(cabang);
                      setInspectionTab('santri');
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: isDarkMode ? '#334155' : '#f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#1e293b',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Search size={13} />
                    <span>Pantau Data</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditCabang(cabang)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: isDarkMode ? '#334155' : '#f1f5f9',
                      color: isDarkMode ? '#f8fafc' : '#1e293b',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Profil</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          5. PANEL AKSI CEPAT & SIARAN PENGUMUMAN
          ========================================================= */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* A. Persetujuan Izin Tertunda */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            padding: '1.25rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckSquare size={16} color="#ff5b35" />
              <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                Persetujuan Izin Menunggu Yayasan
              </h3>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '2px 7px', borderRadius: '10px' }}>
              {pendingPerizinan.length} Pending
            </span>
          </div>

          {pendingPerizinan.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem' }}>
              ✨ Tidak ada permohonan izin tertunda. Semua perizinan telah diproses.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pendingPerizinan.slice(0, 3).map((item, idx) => (
                <div 
                  key={item.id || idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: isDarkMode ? '#0f172a' : '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.74rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#1e293b' }}>
                      {item.nama || item.namaSantri || 'Santri'}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                      {item.kategori || 'Izin Sakit'} • {item.tanggal || 'Hari ini'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleActionPerizinan(item.id, 'Disetujui')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => handleActionPerizinan(item.id, 'Ditolak')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* B. Broadcast Pengumuman / Instruksi */}
        <div 
          style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '20px',
            padding: '1.25rem',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
            <Send size={16} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
              Broadcast Instruksi Yayasan ke Seluruh Cabang
            </h3>
          </div>

          <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              rows={2}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Tulis instruksi atau pengumuman pimpinan yayasan untuk disampaikan ke seluruh admin cabang..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '12px',
                border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
                background: isDarkMode ? '#0f172a' : '#f8fafc',
                color: isDarkMode ? '#f8fafc' : '#0f172a',
                fontSize: '0.78rem',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={12} />
                <span>Kirim Siaran Instruksi</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Render All Global Modals (Lihat Data Cabang, Kredensial, Tambah/Edit Cabang, Transaksi SPP) */}
      {renderAllModals()}
    </div>
  );
}
