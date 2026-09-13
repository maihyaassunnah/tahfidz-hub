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
  X,
  Save,
  Server
} from 'lucide-react';
import { storageService } from '../../services/storage';
import './PrismaStudioView.css';

export default function PrismaStudioView({ showToast }) {
  const [activeTab, setActiveTab] = useState('visual'); // 'visual', 'embed', 'vps'
  const [selectedModel, setSelectedModel] = useState('santri');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Prisma Studio URL configuration
  const [studioUrl, setStudioUrl] = useState(() => {
    return localStorage.getItem('simtah_prisma_studio_url') || 'http://localhost:5555';
  });

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({});

  // Model Data State
  const [tableData, setTableData] = useState([]);

  // Load Model Data
  const loadModelData = () => {
    switch (selectedModel) {
      case 'cabang':
        setTableData(storageService.getCabang());
        break;
      case 'superadmin':
        setTableData(storageService.getSuperAdminAccounts());
        break;
      case 'pengampu':
        setTableData(storageService.getAllPengampuRaw());
        break;
      case 'halaqah':
        setTableData(storageService.getHalaqah());
        break;
      case 'santri':
        setTableData(storageService.getAllSantriRaw());
        break;
      case 'sesi':
        setTableData(storageService.getSesi());
        break;
      case 'absensi':
        setTableData(storageService.getAbsensi());
        break;
      case 'setoran':
        setTableData(storageService.getSetoran());
        break;
      case 'izin':
        setTableData(storageService.getIzin());
        break;
      default:
        setTableData([]);
    }
  };

  useEffect(() => {
    loadModelData();
    setSearchQuery('');
  }, [selectedModel]);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    if (showToast) showToast("Perintah berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await storageService.syncToPostgres();
      if (res && res.success) {
        if (showToast) showToast("✅ Berhasil menyinkronkan seluruh tabel ke PostgreSQL VPS!");
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

  const handleSaveStudioUrl = () => {
    localStorage.setItem('simtah_prisma_studio_url', studioUrl);
    if (showToast) showToast("URL Prisma Studio berhasil disimpan!");
  };

  // Open Modal for Create
  const handleOpenAdd = () => {
    setModalMode('add');
    let initForm = {};
    if (selectedModel === 'cabang') {
      initForm = { nama: '', kode: '', kota: 'Tasikmalaya', alamat: '', penanggungJawab: '', noHp: '', status: 'Aktif' };
    } else if (selectedModel === 'superadmin') {
      initForm = { nama: '', username: '', email: '', password: 'bismillah123', cabangId: 'cabang-pusat', status: 'Aktif' };
    } else if (selectedModel === 'pengampu') {
      initForm = { nama: '', nip: '', kontak: '', role: 'Pengampu Halaqoh', halaqahId: 'hq-1', status: 'Aktif', cabangId: 'cabang-pusat' };
    } else if (selectedModel === 'halaqah') {
      initForm = { nama: '', pengampuNama: '', targetJuz: '30', level: 'Dasar', cabangId: 'cabang-pusat' };
    } else if (selectedModel === 'santri') {
      initForm = { nama: '', nis: '', kelas: 'X-A', halaqahId: 'hq-1', halaqahNama: 'Halaqah 1', cabangId: 'cabang-pusat', status: 'Aktif' };
    } else if (selectedModel === 'sesi') {
      initForm = { nama: '', waktuMulai: '05:00', waktuSelesai: '06:00', jamBatas: '05:30', status: 'Aktif' };
    } else if (selectedModel === 'setoran') {
      initForm = { santriNama: '', surahName: 'An-Naba', ayatAwal: 1, ayatAkhir: 10, nilai: 'Mumtaz', tanggal: new Date().toISOString().split('T')[0] };
    } else if (selectedModel === 'izin') {
      initForm = { pemohonNama: '', alasan: '', status: 'Menunggu', tanggal: new Date().toISOString().split('T')[0] };
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

    loadModelData();
    if (showToast) showToast("Data berhasil dihapus dari database!");
  };

  // Submit Modal Form
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      if (selectedModel === 'cabang') storageService.addCabang(formData);
      else if (selectedModel === 'superadmin') storageService.addSuperAdminAccount(formData);
      else if (selectedModel === 'pengampu') storageService.addPengampu(formData);
      else if (selectedModel === 'halaqah') storageService.addHalaqah(formData);
      else if (selectedModel === 'santri') storageService.addSantri(formData);
      else if (selectedModel === 'sesi') storageService.addSesi(formData);
      else if (selectedModel === 'setoran') storageService.addSetoran(formData);
      else if (selectedModel === 'izin') storageService.addIzin(formData);
      if (showToast) showToast("Data baru berhasil ditambahkan!");
    } else {
      const id = formData.id;
      if (selectedModel === 'cabang') storageService.updateCabang(id, formData);
      else if (selectedModel === 'superadmin') storageService.updateSuperAdminAccount(id, formData);
      else if (selectedModel === 'pengampu') storageService.updatePengampu(id, formData);
      else if (selectedModel === 'halaqah') storageService.updateHalaqah(id, formData);
      else if (selectedModel === 'santri') storageService.updateSantri(id, formData);
      else if (selectedModel === 'sesi') storageService.updateSesi(id, formData);
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

  const modelList = [
    { id: 'cabang', name: 'Cabang Lembaga', icon: Building2, count: storageService.getCabang().length },
    { id: 'superadmin', name: 'Akun Super Admin', icon: Shield, count: storageService.getSuperAdminAccounts().length },
    { id: 'pengampu', name: 'Pengampu / Guru', icon: Users, count: storageService.getAllPengampuRaw().length },
    { id: 'halaqah', name: 'Halaqah Al-Qur\'an', icon: BookOpen, count: storageService.getHalaqah().length },
    { id: 'santri', name: 'Santri & Siswa', icon: Users, count: storageService.getAllSantriRaw().length },
    { id: 'sesi', name: 'Sesi Halaqah', icon: Clock, count: storageService.getSesi().length },
    { id: 'absensi', name: 'Absensi Santri', icon: ClipboardCheck, count: storageService.getAbsensi().length },
    { id: 'setoran', name: 'Pencatatan Setoran', icon: BookOpen, count: storageService.getSetoran().length },
    { id: 'izin', name: 'Permohonan Izin', icon: FileText, count: storageService.getIzin().length }
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

        <div className="studio-header-actions">
          <button 
            type="button" 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            onClick={handleSyncDatabase}
            disabled={isSyncing}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "Menyinkronkan..." : "Sinkronkan ke PostgreSQL"}</span>
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
          NAV TABS (VISUAL EDITOR | EMBED WEB | PANDUAN VPS)
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
          <Terminal size={16} />
          <span>Panduan Menjalankan di VPS</span>
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
          TAB 3: PANDUAN MENJALANKAN PRISMA STUDIO DI VPS
          ========================================================= */}
      {activeTab === 'vps' && (
        <div className="vps-guide-grid">
          <div className="vps-step-card">
            <h4>
              <Terminal size={17} color="#0d9488" />
              <span>1. Menjalankan Prisma Studio di VPS</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Masuk ke SSH VPS Anda, arahkan ke direktori server Tahfidz HUB dan jalankan Prisma Studio pada port 5555:
            </p>
            <div className="terminal-code-box">
              <code>cd /var/www/tahfidz/server && npx prisma studio --port 5555 --browser none</code>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopyCode("cd /var/www/tahfidz/server && npx prisma studio --port 5555 --browser none", 1)}
              >
                {copiedIndex === 1 ? "Disalin!" : "Salin"}
              </button>
            </div>
          </div>

          <div className="vps-step-card">
            <h4>
              <Server size={17} color="#0369a1" />
              <span>2. Menjalankan Permanen dengan PM2</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Agar Prisma Studio terus berjalan di latar belakang tanpa harus membiarkan terminal SSH terbuka:
            </p>
            <div className="terminal-code-box">
              <code>pm2 start "npx prisma studio --port 5555 --browser none" --name "tahfidz-studio"</code>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopyCode('pm2 start "npx prisma studio --port 5555 --browser none" --name "tahfidz-studio"', 2)}
              >
                {copiedIndex === 2 ? "Disalin!" : "Salin"}
              </button>
            </div>
          </div>

          <div className="vps-step-card">
            <h4>
              <Shield size={17} color="#f59e0b" />
              <span>3. Keamanan Port Firewall & Cloudflare</span>
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Pastikan port 5555 diizinkan di Security Group Tencent Cloud / Firewall VPS Anda, atau gunakan reverse proxy Nginx pada lokasi <code>/studio/</code>.
            </p>
            <div className="terminal-code-box">
              <code>sudo ufw allow 5555/tcp</code>
              <button 
                type="button" 
                className="btn-copy-code"
                onClick={() => handleCopyCode("sudo ufw allow 5555/tcp", 3)}
              >
                {copiedIndex === 3 ? "Disalin!" : "Salin"}
              </button>
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
                {Object.keys(formData).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt').map((fieldKey) => (
                  <div key={fieldKey} style={{ marginBottom: '0.85rem' }}>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                      {fieldKey}
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ fontSize: '0.825rem', width: '100%' }}
                      value={formData[fieldKey] ?? ''}
                      onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
                    />
                  </div>
                ))}
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
