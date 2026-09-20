import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  ExternalLink, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  Copy, 
  Globe, 
  Shield, 
  Users, 
  BookOpen, 
  Calendar, 
  Building2, 
  ClipboardCheck, 
  Clock, 
  FileText,
  Activity,
  GraduationCap,
  MapPin,
  Layers,
  Sliders,
  Award,
  X,
  Save,
  Server,
  Download,
  Upload,
  Smartphone,
  Laptop,
  Camera,
  Key
} from 'lucide-react';
import { storageService } from '../../services/storage';
import './PrismaStudioView.css';

export default function PrismaStudioView({ showToast, activeBranchId }) {
  const [activeTab, setActiveTab] = useState('visual'); // 'visual', 'embed', 'vps'
  const [selectedModel, setSelectedModel] = useState('santri');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // User & Cabang Session (Multi-Tenant Isolation)
  const currentUser = storageService.getAuthUser();
  const isOwner = currentUser?.role === 'owner' || currentUser?.cabangId === 'ALL';
  const cabangList = storageService.getCabang();

  // Cabang ID Akun Super Admin (misal 'cabang-pusat' untuk MA)
  const userCabangId = currentUser?.cabangId && currentUser?.cabangId !== 'ALL'
    ? currentUser.cabangId
    : (activeBranchId || storageService.getActiveBranchId() || 'cabang-pusat');

  const [selectedCabangId, setSelectedCabangId] = useState(isOwner ? (activeBranchId || 'ALL') : userCabangId);

  // Pastikan Super Admin terkunci pada cabang miliknya, atau Owner tersinkron dengan activeBranchId
  useEffect(() => {
    if (!isOwner) {
      setSelectedCabangId(userCabangId);
    } else if (activeBranchId) {
      setSelectedCabangId(activeBranchId);
    }
  }, [userCabangId, isOwner, activeBranchId]);

  const currentCabangObj = cabangList.find(c => c.id === (selectedCabangId === 'ALL' ? 'cabang-pusat' : selectedCabangId)) || cabangList[0];

  // Prisma Studio URL configuration
  const [studioUrl, setStudioUrl] = useState(() => {
    try {
      const saved = sessionStorage.getItem('simtah_prisma_studio_url');
      if (saved) return saved;
    } catch (e) {}
    return (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? `${window.location.origin}/studio/` 
      : 'http://localhost:5555');
  });

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({});

  // Model Data State
  const [tableData, setTableData] = useState([]);

  // =========================================================
  // HELPER ISOLASI DATABASE PER CABANG (TIDAK BERCAMPUR DENGAN CABANG LAIN)
  // =========================================================
  const getFilteredModelData = (modelKey, targetBranchId) => {
    const isAll = targetBranchId === 'ALL';

    // 1. Santri dalam cabang ini
    const allSantri = storageService.getAllSantriRaw();
    const branchSantri = isAll 
      ? allSantri 
      : allSantri.filter(s => (s.cabangId || s.cabang_id || 'cabang-pusat') === targetBranchId);
    const branchSantriIdSet = new Set(branchSantri.map(s => String(s.id)));
    const branchSantriNisSet = new Set(branchSantri.map(s => String(s.nis || '')).filter(Boolean));

    // 2. Pengampu / Guru dalam cabang ini
    const allPengampu = storageService.getAllPengampuRaw();
    const branchPengampu = isAll
      ? allPengampu
      : allPengampu.filter(p => (p.cabangId || p.cabang_id || 'cabang-pusat') === targetBranchId);
    const branchPengampuIdSet = new Set(branchPengampu.map(p => String(p.id)));

    // 3. Kelas dalam cabang ini
    const allKelas = storageService.getAllSigapKelasRaw();
    const branchKelas = isAll
      ? allKelas
      : allKelas.filter(k => (k.cabangId || k.cabang_id || 'cabang-pusat') === targetBranchId);
    const branchKelasNameSet = new Set(branchKelas.map(k => String(k.nama || '').toLowerCase().trim()));

    switch (modelKey) {
      case 'cabang': {
        const list = storageService.getCabang();
        return isAll ? list : list.filter(c => c.id === targetBranchId);
      }
      case 'superadmin': {
        const list = storageService.getSuperAdminAccounts();
        return isAll ? list : list.filter(sa => (sa.cabangId || sa.cabang_id || 'cabang-pusat') === targetBranchId);
      }
      case 'pengampu':
        return branchPengampu;
      case 'halaqah': {
        const list = storageService.getHalaqah();
        return isAll ? list : list.filter(h => (h.cabangId || h.cabang_id || 'cabang-pusat') === targetBranchId);
      }
      case 'santri':
        return branchSantri;
      case 'sesi': {
        const list = storageService.getSesi();
        return isAll ? list : list.filter(s => !s.cabangId || s.cabangId === 'ALL' || s.cabangId === targetBranchId);
      }
      case 'absensi': {
        const list = storageService.getAbsensi();
        if (isAll) return list;
        return list.filter(a =>
          (a.cabangId && a.cabangId === targetBranchId) ||
          (a.cabang_id && a.cabang_id === targetBranchId) ||
          (a.santriId && branchSantriIdSet.has(String(a.santriId))) ||
          (a.santri_id && branchSantriIdSet.has(String(a.santri_id)))
        );
      }
      case 'setoran': {
        const list = storageService.getSetoran();
        if (isAll) return list;
        return list.filter(s =>
          (s.cabangId && s.cabangId === targetBranchId) ||
          (s.cabang_id && s.cabang_id === targetBranchId) ||
          (s.santriId && branchSantriIdSet.has(String(s.santriId))) ||
          (s.santri_id && branchSantriIdSet.has(String(s.santri_id))) ||
          (s.nis && branchSantriNisSet.has(String(s.nis)))
        );
      }
      case 'izin': {
        const list = storageService.getIzin();
        if (isAll) return list;
        return list.filter(i =>
          (i.cabangId && i.cabangId === targetBranchId) ||
          (i.cabang_id && i.cabang_id === targetBranchId) ||
          (i.santriId && branchSantriIdSet.has(String(i.santriId))) ||
          (i.santri_id && branchSantriIdSet.has(String(i.santri_id)))
        );
      }
      case 'monitoring': {
        const feed = (storageService.getSigapMonitoring() || {}).liveFeed || [];
        if (isAll) return feed;
        return feed.filter(m =>
          (m.cabangId && m.cabangId === targetBranchId) ||
          (m.cabang_id && m.cabang_id === targetBranchId) ||
          (m.pengampuId && branchPengampuIdSet.has(String(m.pengampuId))) ||
          (m.pengampu_id && branchPengampuIdSet.has(String(m.pengampu_id))) ||
          (m.kelas && branchKelasNameSet.has(String(m.kelas).toLowerCase().trim()))
        );
      }
      case 'spp': {
        const list = storageService.getPembayaranSPP();
        if (isAll) return list;
        return list.filter(p =>
          (p.cabangId && p.cabangId === targetBranchId) ||
          (p.cabang_id && p.cabang_id === targetBranchId) ||
          (p.santriId && branchSantriIdSet.has(String(p.santriId))) ||
          (p.santri_id && branchSantriIdSet.has(String(p.santri_id)))
        );
      }
      case 'alumni': {
        const list = storageService.getAllSigapAlumniRaw();
        return isAll ? list : list.filter(a => (a.cabangId || a.cabang_id || 'cabang-pusat') === targetBranchId);
      }
      case 'lokasi_qr': {
        const list = storageService.getAllSigapLokasiQRRaw();
        return isAll ? list : list.filter(l => (l.cabangId || l.cabang_id || 'cabang-pusat') === targetBranchId);
      }
      case 'rapor_template': {
        const tpl = storageService.getRaporTemplate();
        return tpl ? [tpl] : [];
      }
      case 'nilai_rapor': {
        const list = storageService.getAllNilaiRapor();
        if (isAll) return list;
        return list.filter(nr =>
          (nr.santriId && branchSantriIdSet.has(String(nr.santriId))) ||
          (nr.santri_id && branchSantriIdSet.has(String(nr.santri_id)))
        );
      }
      case 'settings': {
        const s = storageService.getSettings() || {};
        return Object.entries(s).map(([key, value]) => ({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value)
        }));
      }
      case 'foto_profil': {
        const list = storageService.getFotoProfilList();
        return isAll ? list : list.filter(f => !f.cabangId || f.cabangId === targetBranchId);
      }
      default:
        return [];
    }
  };

  // Load Model Data Khusus Cabang Ini
  const loadModelData = () => {
    const data = getFilteredModelData(selectedModel, selectedCabangId);
    setTableData(data);
  };

  useEffect(() => {
    // Sinkronisasi data terbaru langsung dari database PostgreSQL saat menu dibuka
    storageService.syncFromPostgres().then(res => {
      if (res && res.success) {
        loadModelData();
      }
    }).catch(err => console.warn('[STUDIO] Initial sync error:', err));
  }, []);

  useEffect(() => {
    loadModelData();
    setSearchQuery('');
  }, [selectedModel, selectedCabangId]);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    if (showToast) showToast("Kredensial/perintah berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Push local to PostgreSQL
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await storageService.syncToPostgres();
      if (res && res.success) {
        if (showToast) showToast("✅ Berhasil mengunggah (Push) data ke PostgreSQL Cloud VPS!");
      } else {
        if (showToast) showToast(res?.message || "ℹ️ Sinkronisasi lokal selesai. Pastikan backend aktif.");
      }
    } catch (err) {
      if (showToast) showToast("Sinkronisasi database lokal berhasil diperbarui!");
    } finally {
      setIsSyncing(false);
      loadModelData();
    }
  };

  // Pull PostgreSQL to local
  const handlePullDatabase = async () => {
    setIsPulling(true);
    try {
      const res = await storageService.syncFromPostgres();
      if (res && res.success) {
        if (showToast) showToast("✅ Berhasil mengunduh (Pull) data terbaru dari PostgreSQL Cloud!");
        loadModelData();
      } else {
        if (showToast) showToast(res?.message || "Gagal mengunduh data dari cloud.");
      }
    } catch (err) {
      if (showToast) showToast("Gagal mengambil data dari database cloud.");
    } finally {
      setIsPulling(false);
    }
  };

  const handleSaveStudioUrl = () => {
    try {
      sessionStorage.setItem('simtah_prisma_studio_url', studioUrl);
    } catch (e) {}
    if (showToast) showToast("URL Prisma Studio berhasil disimpan!");
  };

  // Open Modal for Create (Terikat ke Cabang Terpilih)
  const handleOpenAdd = () => {
    setModalMode('add');
    const branchForNew = (selectedCabangId && selectedCabangId !== 'ALL') ? selectedCabangId : 'cabang-pusat';
    let initForm = {};
    if (selectedModel === 'cabang') {
      initForm = { nama: '', kode: '', kota: 'Tasikmalaya', alamat: '', penanggungJawab: '', noHp: '', status: 'Aktif' };
    } else if (selectedModel === 'superadmin') {
      initForm = { nama: '', username: '', email: '', password: 'bismillah123', cabangId: branchForNew, status: 'Aktif' };
    } else if (selectedModel === 'pengampu') {
      initForm = { nama: '', nip: '', kontak: '', role: 'Pengampu Halaqoh', halaqahId: 'hq-1', status: 'Aktif', cabangId: branchForNew };
    } else if (selectedModel === 'halaqah') {
      initForm = { nama: '', pengampuNama: '', targetJuz: '30', level: 'Dasar', cabangId: branchForNew };
    } else if (selectedModel === 'santri') {
      initForm = { nama: '', nis: '', halaqahId: 'hq-1', halaqahNama: 'Halaqah 1', cabangId: branchForNew, status: 'Aktif' };
    } else if (selectedModel === 'sesi') {
      initForm = { nama: '', waktuMulai: '05:00', waktuSelesai: '06:00', jamBatas: '05:30', status: 'Aktif', cabangId: branchForNew };
    } else if (selectedModel === 'absensi') {
      initForm = { tanggal: new Date().toISOString().split('T')[0], sesiId: 'sesi-shubuh', santriId: 's-1', status: 'Hadir', keterangan: '', cabangId: branchForNew };
    } else if (selectedModel === 'setoran') {
      initForm = { santriNama: '', surahName: 'An-Naba', ayatAwal: 1, ayatAkhir: 10, nilai: 'Mumtaz', tanggal: new Date().toISOString().split('T')[0], cabangId: branchForNew };
    } else if (selectedModel === 'izin') {
      initForm = { pemohonNama: '', alasan: '', status: 'Menunggu', tanggal: new Date().toISOString().split('T')[0], cabangId: branchForNew };
    } else if (selectedModel === 'monitoring') {
      initForm = { nama: '', nip: '', role: 'Pengampu', halaqah: 'Halaqah 1', sesi: 'Subuh', jadwal: '05:00 - 06:30', jam: '05:00', status: 'Tepat Waktu', keterangan: 'Hadir', cabangId: branchForNew };
    } else if (selectedModel === 'spp') {
      initForm = { invoiceNo: storageService.generateInvoiceNo(), santriNama: '', nis: '', bulan: 'September 2026', nominal: 350000, status: 'Lunas', metodeBayar: 'Transfer Bank BSI', cabangId: branchForNew };
    } else if (selectedModel === 'alumni') {
      initForm = { nama: '', nik: '', nisn: '', nism: '-', lp: 'L', tahunLulus: '2026', cabangId: branchForNew };
    } else if (selectedModel === 'lokasi_qr') {
      initForm = { lokasi: 'Masjid Tahfidz Ikhwan', kodeManual: 'MSJ-IKH', cabangId: branchForNew, gpsStatus: 'GPS: Locked', locked: true, lat: -7.327415, lng: 108.215542, radiusMeter: 50 };
    } else if (selectedModel === 'settings') {
      initForm = { key: '', value: '' };
    }
    setFormData(initForm);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Delete Item
  const handleDeleteItem = (id) => {
    if (!window.confirm(`Hapus data terpilih dari tabel ${selectedModel}?`)) return;

    if (selectedModel === 'cabang') storageService.deleteCabang(id);
    else if (selectedModel === 'superadmin') storageService.deleteSuperAdminAccount(id);
    else if (selectedModel === 'pengampu') storageService.deletePengampu(id);
    else if (selectedModel === 'halaqah') storageService.deleteHalaqah(id);
    else if (selectedModel === 'santri') storageService.deleteSantri(id);
    else if (selectedModel === 'sesi') storageService.deleteSesi(id);
    else if (selectedModel === 'absensi') storageService.deleteAbsensiRecord(id);
    else if (selectedModel === 'setoran') storageService.deleteSetoran(id);
    else if (selectedModel === 'izin') storageService.deleteIzin(id);
    else if (selectedModel === 'monitoring') storageService.deleteMonitoring(id);
    else if (selectedModel === 'spp') storageService.deletePembayaranSPP(id);
    else if (selectedModel === 'alumni') storageService.deleteSigapAlumni(id);
    else if (selectedModel === 'lokasi_qr') storageService.deleteSigapLokasiQR(id);
    else if (selectedModel === 'nilai_rapor') storageService.deleteNilaiRapor(id);

    loadModelData();
    if (showToast) showToast("Data berhasil dihapus dari database!");
  };

  // Submit Modal Form (Kunci Otomatis Cabang untuk Super Admin)
  const handleSaveForm = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    
    // Kunci cabang jika bukan owner
    if (!isOwner && selectedCabangId && selectedCabangId !== 'ALL') {
      if (selectedModel !== 'cabang' && selectedModel !== 'settings' && selectedModel !== 'rapor_template') {
        dataToSave.cabangId = selectedCabangId;
        dataToSave.cabang_id = selectedCabangId;
      }
    }

    if (modalMode === 'add') {
      if (selectedModel === 'cabang') storageService.addCabang(dataToSave);
      else if (selectedModel === 'superadmin') storageService.addSuperAdminAccount(dataToSave);
      else if (selectedModel === 'pengampu') storageService.addPengampu(dataToSave);
      else if (selectedModel === 'halaqah') storageService.addHalaqah(dataToSave);
      else if (selectedModel === 'santri') storageService.addSantri(dataToSave);
      else if (selectedModel === 'sesi') storageService.addSesi(dataToSave);
      else if (selectedModel === 'absensi') storageService.addAbsensiRecord(dataToSave);
      else if (selectedModel === 'setoran') storageService.addSetoran(dataToSave);
      else if (selectedModel === 'izin') storageService.addIzin(dataToSave);
      else if (selectedModel === 'monitoring') storageService.addMonitoring(dataToSave);
      else if (selectedModel === 'spp') storageService.addPembayaranSPP(dataToSave);
      else if (selectedModel === 'alumni') storageService.addSigapAlumni(dataToSave);
      else if (selectedModel === 'lokasi_qr') storageService.addSigapLokasiQR(dataToSave);
      else if (selectedModel === 'rapor_template') storageService.saveRaporTemplate(dataToSave);
      else if (selectedModel === 'nilai_rapor') storageService.saveNilaiRapor(dataToSave);
      if (showToast) showToast("Data baru berhasil ditambahkan!");
    } else {
      const id = dataToSave.id;
      if (selectedModel === 'cabang') storageService.updateCabang(id, dataToSave);
      else if (selectedModel === 'superadmin') storageService.updateSuperAdminAccount(id, dataToSave);
      else if (selectedModel === 'pengampu') storageService.updatePengampu(id, dataToSave);
      else if (selectedModel === 'halaqah') storageService.updateHalaqah(id, dataToSave);
      else if (selectedModel === 'santri') storageService.updateSantri(id, dataToSave);
      else if (selectedModel === 'sesi') storageService.updateSesi(id, dataToSave);
      else if (selectedModel === 'absensi') storageService.updateAbsensiRecord(id, dataToSave);
      else if (selectedModel === 'setoran') storageService.updateSetoran(id, dataToSave);
      else if (selectedModel === 'izin') storageService.updateIzin(id, dataToSave);
      else if (selectedModel === 'monitoring') storageService.updateMonitoring(id, dataToSave);
      else if (selectedModel === 'spp') storageService.updatePembayaranSPP(id, dataToSave);
      else if (selectedModel === 'alumni') storageService.addSigapAlumni(dataToSave);
      else if (selectedModel === 'lokasi_qr') storageService.updateSigapLokasiQR(id, dataToSave);
      else if (selectedModel === 'rapor_template') storageService.saveRaporTemplate(dataToSave);
      else if (selectedModel === 'nilai_rapor') storageService.saveNilaiRapor(dataToSave);
      if (showToast) showToast("Perubahan data berhasil disimpan!");
    }
    setIsModalOpen(false);
    loadModelData();
  };

  // Filtered Table Data
  const filteredData = tableData.filter(row => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(q)
    );
  });

  // Model List dengan Count Real-Time Sesuai Cabang Ini Saja
  const modelList = [
    { id: 'cabang', name: 'Cabang Lembaga', icon: Building2, count: getFilteredModelData('cabang', selectedCabangId).length },
    { id: 'superadmin', name: 'Akun Super Admin', icon: Shield, count: getFilteredModelData('superadmin', selectedCabangId).length },
    { id: 'pengampu', name: 'Pengampu / Guru', icon: Users, count: getFilteredModelData('pengampu', selectedCabangId).length },
    { id: 'halaqah', name: 'Halaqah Al-Qur\'an', icon: BookOpen, count: getFilteredModelData('halaqah', selectedCabangId).length },
    { id: 'santri', name: 'Santri & Siswa', icon: Users, count: getFilteredModelData('santri', selectedCabangId).length },
    { id: 'sesi', name: 'Sesi Halaqah', icon: Clock, count: getFilteredModelData('sesi', selectedCabangId).length },
    { id: 'absensi', name: 'Absensi Santri', icon: ClipboardCheck, count: getFilteredModelData('absensi', selectedCabangId).length },
    { id: 'setoran', name: 'Pencatatan Setoran', icon: BookOpen, count: getFilteredModelData('setoran', selectedCabangId).length },
    { id: 'izin', name: 'Permohonan Izin', icon: FileText, count: getFilteredModelData('izin', selectedCabangId).length },
    { id: 'monitoring', name: 'Monitoring Sigap', icon: Activity, count: getFilteredModelData('monitoring', selectedCabangId).length },
    { id: 'spp', name: 'Pembayaran SPP', icon: FileText, count: getFilteredModelData('spp', selectedCabangId).length },
    { id: 'rapor_template', name: 'Template Rapor', icon: FileText, count: 1 },
    { id: 'nilai_rapor', name: 'Nilai Rapor Aspek', icon: Award, count: getFilteredModelData('nilai_rapor', selectedCabangId).length },
    { id: 'alumni', name: 'Data Alumni', icon: GraduationCap, count: getFilteredModelData('alumni', selectedCabangId).length },
    { id: 'lokasi_qr', name: 'Lokasi Presensi QR', icon: MapPin, count: getFilteredModelData('lokasi_qr', selectedCabangId).length },
    { id: 'foto_profil', name: 'Foto Profil Akun', icon: Camera, count: getFilteredModelData('foto_profil', selectedCabangId).length },
    { id: 'settings', name: 'Pengaturan Sistem', icon: Sliders, count: Object.keys(storageService.getSettings() || {}).length }
  ];

  return (
    <div className="prisma-studio-container">
      {/* =========================================================
          HEADER CARD: PRISMA STUDIO & DATABASE STATUS
          ========================================================= */}
      <div className="studio-header-card">
        <div className="studio-header-left">
          <div className="studio-icon-emblem">
            <Database size={26} />
          </div>
          <div className="studio-title-box">
            <h2>
              <span>Prisma Studio • Manajemen Database</span>
              <span className="db-status-chip">
                <div className="status-pulse-dot" />
                <span>PostgreSQL 16: tahfidz_db</span>
              </span>
            </h2>
            <p>
              Editor visual untuk melihat, menambah, mengubah, dan mengelola record database secara real-time.
            </p>
          </div>
        </div>

        <div className="studio-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#0369a1', borderColor: '#bae6fd' }}
            onClick={handlePullDatabase}
            disabled={isPulling}
            title="Tarik data terbaru dari database PostgreSQL di VPS ke perangkat ini"
          >
            <Download size={14} className={isPulling ? "animate-bounce" : ""} />
            <span>{isPulling ? "Mengunduh..." : "Tarik dari Cloud (Pull)"}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#0d9488', borderColor: '#99f6e4' }}
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            title="Unggah perubahan data dari perangkat ini ke database PostgreSQL di VPS"
          >
            <Upload size={14} className={isSyncing ? "animate-bounce" : ""} />
            <span>{isSyncing ? "Mengunggah..." : "Kirim ke Cloud (Push)"}</span>
          </button>

          <a 
            href={studioUrl} 
            target="_blank" 
            rel="noreferrer"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: '#0d9488', borderColor: '#0d9488' }}
          >
            <ExternalLink size={14} />
            <span>Buka Studio di Tab Baru</span>
          </a>
        </div>
      </div>

      {/* =========================================================
          BANNER ISOLASI MULTI-CABANG (KHUSUS SUPER ADMIN CABANG)
          ========================================================= */}
      <div style={{
        background: '#f8fafc',
        border: '1.5px solid #e2e8f0',
        borderLeft: '5px solid #059669',
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #a7f3d0',
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                Database Terfilter: {selectedCabangId === 'ALL' ? 'Semua Cabang (Pusat & Ranting - Konsolidasi Global)' : (currentCabangObj?.nama || 'MA Ihya As-Sunnah (Pusat)')}
              </span>
              <span style={{
                background: selectedCabangId === 'ALL' ? '#2563eb' : '#047857',
                color: '#ffffff',
                fontSize: '0.70rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {selectedCabangId === 'ALL' ? 'SEMUA CABANG (GLOBAL)' : (currentCabangObj?.kode || 'MA-PUSAT')}
              </span>
              {!isOwner && (
                <span style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Shield size={10} color="#059669" /> Terkunci Khusus Cabang Ini
                </span>
              )}
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
              {!isOwner ? (
                <span>
                  Mode Super Admin Aktif: Seluruh tabel santri, pengampu, alumni, SPP, dan absensi <strong>hanya menampilkan data cabang {currentCabangObj?.nama}</strong> dan tidak bercampur dengan cabang lain.
                </span>
              ) : (
                <span>
                  Mode Pimpinan (Owner): Menampilkan seluruh record database {selectedCabangId === 'ALL' ? 'dari semua cabang lembaga (Konsolidasi Global Seluruh Cabang)' : `cabang ${currentCabangObj?.nama}`} secara real-time.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Dropdown Filter untuk Owner / Pimpinan */}
        {isOwner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Filter Cabang:</span>
            <select
              value={selectedCabangId}
              onChange={(e) => setSelectedCabangId(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">🌐 Semua Cabang (Terpadu)</option>
              {cabangList.map(c => (
                <option key={c.id} value={c.id}>{c.nama} ({c.kode})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* =========================================================
          NAV TABS (VISUAL EDITOR | EMBED WEB | PANDUAN MULTI-PERANGKAT)
          ========================================================= */}
      <div className="studio-nav-tabs">
        <button 
          type="button"
          className={`studio-tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
          onClick={() => setActiveTab('visual')}
        >
          <Table size={16} />
          <span>Editor Visual Tabel Database</span>
        </button>

        <button 
          type="button"
          className={`studio-tab-btn ${activeTab === 'embed' ? 'active' : ''}`}
          onClick={() => setActiveTab('embed')}
        >
          <Globe size={16} />
          <span>Prisma Studio Web Viewer</span>
        </button>

        <button 
          type="button"
          className={`studio-tab-btn ${activeTab === 'vps' ? 'active' : ''}`}
          onClick={() => setActiveTab('vps')}
        >
          <Smartphone size={16} />
          <span>Akses Multi-Perangkat (HP, Laptop, DBeaver)</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: VISUAL TABLE EDITOR (BUILT-IN DATABASE CRUD)
          ========================================================= */}
      {activeTab === 'visual' && (
        <div>
          {/* Model Selector Bar */}
          <div className="model-selector-bar">
            {modelList.map((m) => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`model-pill-btn ${selectedModel === m.id ? 'active' : ''}`}
                  onClick={() => setSelectedModel(m.id)}
                >
                  <IconComp size={15} />
                  <span>{m.name}</span>
                  <span className="model-count-badge">{m.count}</span>
                </button>
              );
            })}
          </div>

          {/* Table Data Card */}
          <div className="studio-data-card">
            <div className="data-card-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Model: <code style={{ color: '#0d9488' }}>{selectedModel}</code>
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({filteredData.length} baris data ditemukan)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="data-search-box">
                  <Search size={14} color="#94a3b8" />
                  <input 
                    type="text" 
                    placeholder="Cari kata kunci di tabel ini..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#059669', borderColor: '#059669' }}
                  onClick={handleOpenAdd}
                >
                  <Plus size={14} />
                  <span>Tambah Baris</span>
                </button>
              </div>
            </div>

            {/* Data Grid Table */}
            <div className="data-table-wrapper">
              {filteredData.length === 0 ? (
                <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Database size={38} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p style={{ margin: 0, fontWeight: 700 }}>Tabel ini belum memiliki record data.</p>
                  <small style={{ color: 'var(--text-muted)' }}>Klik tombol "+ Tambah Baris" di kanan atas untuk membuat data baru.</small>
                </div>
              ) : (
                <table className="studio-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>No</th>
                      {Object.keys(filteredData[0]).slice(0, 7).map((colKey) => (
                        <th key={colKey}>{colKey}</th>
                      ))}
                      <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                        {Object.keys(filteredData[0]).slice(0, 7).map((colKey) => {
                          const val = row[colKey];
                          const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '-');
                          return (
                            <td key={colKey} title={displayVal}>
                              {colKey === 'status' ? (
                                <span style={{
                                  background: val === 'Aktif' || val === 'Disetujui' ? '#dcfce7' : '#fee2e2',
                                  color: val === 'Aktif' || val === 'Disetujui' ? '#166534' : '#991b1b',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}>
                                  {displayVal}
                                </span>
                              ) : displayVal.length > 35 ? (
                                displayVal.substring(0, 35) + '...'
                              ) : (
                                displayVal
                              )}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            type="button" 
                            className="btn-row-action"
                            onClick={() => handleOpenEdit(row)}
                            title="Edit baris ini"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button 
                            type="button" 
                            className="btn-row-action btn-row-delete"
                            onClick={() => handleDeleteItem(row.id)}
                            title="Hapus baris ini"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: EMBEDDED PRISMA STUDIO WEB VIEWER
          ========================================================= */}
      {activeTab === 'embed' && (
        <div className="studio-iframe-card">
          {!isOwner && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '10px 14px',
              margin: '12px 14px 0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.80rem',
              color: '#065f46'
            }}>
              <Shield size={16} color="#059669" style={{ flexShrink: 0 }} />
              <div>
                <strong>Akses Terisolasi:</strong> Gunakan <strong>Tab 1 (Editor Visual Tabel Database)</strong> untuk mengelola data khusus cabang <strong>{currentCabangObj?.nama}</strong>. Jika membuka Prisma Studio eksternal mentah, seluruh tabel server terhubung langsung ke database PostgreSQL.
              </div>
            </div>
          )}
          <div className="studio-iframe-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '600px' }}>
              <Globe size={16} color="#0d9488" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                URL Studio:
              </span>
              <input 
                type="text" 
                className="form-input" 
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                value={studioUrl}
                onChange={(e) => setStudioUrl(e.target.value)}
                placeholder="http://localhost:5555 atau http://43.173.12.46:5555"
              />
              <button 
                type="button" 
                className="btn btn-sm btn-outline" 
                onClick={handleSaveStudioUrl}
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                Simpan URL
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => {
                  const frame = document.getElementById('prisma-studio-frame');
                  if (frame) frame.src = frame.src;
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
              >
                <RefreshCw size={13} />
                <span>Reload Frame</span>
              </button>

              <a 
                href={studioUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-sm btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
              >
                <ExternalLink size={13} />
                <span>Buka di Tab Baru</span>
              </a>
            </div>
          </div>

          {/* Iframe View */}
          <iframe 
            id="prisma-studio-frame"
            src={studioUrl}
            title="Prisma Studio Web Interface"
            className="studio-iframe-frame"
          />
        </div>
      )}

      {/* =========================================================
          TAB 3: PANDUAN AKSES DATABASE DARI BERBAGAI PERANGKAT (HP, LAPTOP, DBEAVER)
          ========================================================= */}
      {activeTab === 'vps' && (
        <div className="vps-guide-grid">
          {/* Card 1: Browser HP & Laptop */}
          <div className="vps-step-card">
            <h4>
              <Smartphone size={18} color="#0d9488" />
              <span>1. Akses Browser Langsung (HP, Tablet, Laptop)</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              <strong>Cara paling mudah & praktis:</strong> Buka tautan Prisma Studio Cloud langsung di Google Chrome, Safari, atau Edge dari HP Android, iPhone, iPad, atau PC mana saja:
            </p>
            <div className="terminal-code-box">
              <code>https://tahfidz.wahyudinhafiz.my.id/studio/</code>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopyCode("https://tahfidz.wahyudinhafiz.my.id/studio/", 1)}
              >
                {copiedIndex === 1 ? "Disalin!" : "Salin URL"}
              </button>
            </div>
            <div style={{ marginTop: '0.6rem' }}>
              <a 
                href="https://tahfidz.wahyudinhafiz.my.id/studio/" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', background: '#0d9488', borderColor: '#0d9488' }}
              >
                <ExternalLink size={13} />
                <span>Buka Studio di HP / Tab Ini</span>
              </a>
            </div>
          </div>

          {/* Card 2: Software Database Laptop / PC */}
          <div className="vps-step-card">
            <h4>
              <Laptop size={18} color="#2563eb" />
              <span>2. Software Database PC (DBeaver, TablePlus, pgAdmin)</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Gunakan software database manager favorit Anda untuk akses query SQL, export/import data, dan backup:
            </p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem', fontSize: '0.8rem', lineHeight: '1.6' }}>
              <div><strong>Host / Server:</strong> <code>43.173.12.46</code></div>
              <div><strong>Port:</strong> <code>5432</code></div>
              <div><strong>Database:</strong> <code>tahfidz_db</code></div>
              <div><strong>Username:</strong> <code>postgres</code></div>
              <div><strong>Password:</strong> <code>31122000Hfz</code></div>
            </div>
            <div className="terminal-code-box" style={{ marginTop: '0.5rem' }}>
              <code>postgresql://postgres:31122000Hfz@43.173.12.46:5432/tahfidz_db</code>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopyCode("postgresql://postgres:31122000Hfz@43.173.12.46:5432/tahfidz_db", 2)}
              >
                {copiedIndex === 2 ? "Disalin!" : "Salin URI"}
              </button>
            </div>
          </div>

          {/* Card 3: Aplikasi Mobile Android & iOS */}
          <div className="vps-step-card">
            <h4>
              <Server size={18} color="#059669" />
              <span>3. Aplikasi Mobile Database (Android & iOS)</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Jika ingin aplikasi khusus di smartphone (Play Store / App Store):
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              <li><strong>iOS / iPadOS:</strong> Unduh aplikasi <strong>TablePlus</strong> atau <strong>Postgres Client</strong>.</li>
              <li><strong>Android:</strong> Unduh aplikasi <strong>SQLTool Mobile Client</strong> atau <strong>PostgreSQL Database Manager</strong>.</li>
              <li>Pilih koneksi baru (Type: PostgreSQL), masukkan Host: <code>43.173.12.46</code>, Port: <code>5432</code>, User: <code>postgres</code>, DB: <code>tahfidz_db</code>.</li>
            </ul>
          </div>

          {/* Card 4: Sinkronisasi Cloud Dua Arah */}
          <div className="vps-step-card">
            <h4>
              <RefreshCw size={18} color="#d97706" />
              <span>4. Sinkronisasi Data Cloud Antar Perangkat</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Aplikasi Tahfidz HUB mendukung sinkronisasi data cloud secara instan:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-main)' }}>
              <div>
                <strong style={{ color: '#0369a1' }}>⬇️ Tarik dari Cloud (Pull):</strong> Ambil update data terbaru dari PostgreSQL VPS ke perangkat ini (berguna saat baru membuka di HP/laptop baru).
              </div>
              <div>
                <strong style={{ color: '#0d9488' }}>⬆️ Kirim ke Cloud (Push):</strong> Unggah data lokal ke PostgreSQL VPS agar dapat dilihat oleh pengguna di perangkat lain.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL TAMBAH / EDIT RECORD
          ========================================================= */}
      {isModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div 
            className="login-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px' }}
          >
            <div className="login-modal-header">
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={16} color="#0d9488" />
                <span>{modalMode === 'add' ? 'Tambah Record Baru' : 'Edit Record'} ({selectedModel})</span>
              </h3>
              <button 
                type="button" 
                className="login-modal-close" 
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm}>
              <div className="login-modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {Object.keys(formData).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt').map((fieldKey) => {
                  const isCabangField = fieldKey === 'cabangId' || fieldKey === 'cabang_id';
                  const isLocked = !isOwner && isCabangField;
                  return (
                    <div key={fieldKey} style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {fieldKey}
                        </label>
                        {isLocked && (
                          <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>
                            🔒 Terkunci (Cabang Anda)
                          </span>
                        )}
                      </div>
                      <input 
                        type="text" 
                        className="form-input" 
                        disabled={isLocked}
                        style={{ 
                          fontSize: '0.825rem', 
                          width: '100%',
                          background: isLocked ? '#f1f5f9' : undefined,
                          cursor: isLocked ? 'not-allowed' : undefined,
                          fontWeight: isLocked ? 700 : undefined,
                          color: isLocked ? '#0f172a' : undefined
                        }}
                        value={typeof formData[fieldKey] === 'object' && formData[fieldKey] !== null ? JSON.stringify(formData[fieldKey]) : (formData[fieldKey] ?? '')}
                        onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="login-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Save size={14} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
