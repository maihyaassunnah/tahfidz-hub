import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Download, 
  FileText, 
  Upload, 
  Search, 
  ArrowUpDown, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  Link2,
  Trash2,
  Edit3,
  X,
  Save,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function DataGuruSigapView({ showToast }) {
  const [guruList, setGuruList] = useState(storageService.getSigapGuru());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAscending, setIsAscending] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGuru, setEditingGuru] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    lp: 'L',
    status: 'GTY',
    unit: '',
    unitTag: '',
    jabatan: 'Pengampu Tahfidz',
    email: '',
    password: '',
    noHp: ''
  });

  const reloadData = () => {
    setGuruList(storageService.getSigapGuru());
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama) {
      alert("Nama Guru / Pegawai wajib diisi!");
      return;
    }
    if (!formData.email) {
      alert("Alamat Email wajib diisi sebagai Username akun login pengampu!");
      return;
    }
    if (!editingGuru && !formData.password) {
      alert("Password login akun pengampu wajib diisi!");
      return;
    }

    if (editingGuru) {
      storageService.updateSigapGuru(editingGuru.id, {
        ...formData,
        username: formData.email
      });
      showToast && showToast(`Data & akun login ${formData.nama} berhasil diperbarui!`);
    } else {
      storageService.addSigapGuru({
        ...formData,
        username: formData.email,
        nip: formData.nip || 'NON-NIP',
        initial: formData.nama.charAt(0).toUpperCase(),
        avatarBg: formData.lp === 'P' ? '#ccfbf1' : '#dcfce7'
      });
      showToast && showToast(`Guru/Pengampu ${formData.nama} berhasil didaftarkan (Username: ${formData.email})!`);
    }

    reloadData();
    setShowAddModal(false);
    setEditingGuru(null);
    setShowPassword(false);
    setFormData({
      nama: '',
      nip: '',
      lp: 'L',
      status: 'GTY',
      unit: '',
      unitTag: '',
      jabatan: 'Pengampu Tahfidz',
      email: '',
      password: '',
      noHp: ''
    });
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Hapus data ${nama}?`)) {
      storageService.deleteSigapGuru(id);
      reloadData();
      showToast && showToast(`${nama} berhasil dihapus.`);
    }
  };

  const handleDownload = () => {
    const headers = ["No", "Nama Guru/Pegawai", "NIP", "L/P", "Status", "Jabatan", "Email", "No HP/WA"];
    const rows = guruList.map((g, idx) => [
      idx + 1,
      `"${g.nama}"`,
      `"${g.nip}"`,
      `"${g.lp}"`,
      `"${g.status}"`,
      `"${g.jabatan}"`,
      `"${g.email || '-'}"`,
      `"${g.noHp || '-'}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Guru_Pegawai_MA_IHYA_AS_SUNNAH_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Data Guru & Pegawai berhasil diunduh (CSV)!");
  };

  const filteredList = guruList
    .filter(g => {
      const q = searchTerm.toLowerCase();
      return g.nama.toLowerCase().includes(q) || 
             (g.email && g.email.toLowerCase().includes(q)) ||
             (g.nip && g.nip.includes(q)) ||
             (g.jabatan && g.jabatan.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (isAscending) {
        return a.nama.localeCompare(b.nama);
      } else {
        return b.nama.localeCompare(a.nama);
      }
    });

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER PERSIS GAMBAR 3 */}
      <div className="sigap-page-header-row">
        <div className="sigap-page-title-group">
          <div className="sigap-page-icon-badge">
            <Users size={22} />
          </div>
          <div>
            <h1 className="sigap-page-title">Data Guru & Pegawai</h1>
            <p className="sigap-page-subtitle">Manajemen SDM jenjang MA IHYA' AS-SUNNAH</p>
          </div>
        </div>

        {/* 4 Tombol Aksi Kanan */}
        <div className="sigap-page-actions">
          {/* Template (Dark Slate) */}
          <button 
            className="sigap-btn-slate"
            onClick={() => showToast && showToast("Template Guru & Pegawai diunduh!")}
          >
            <FileText size={15} />
            <span>Template</span>
          </button>

          {/* Import (Green) */}
          <button 
            className="sigap-btn-green"
            onClick={() => showToast && showToast("Buka jendela import data guru Excel")}
          >
            <Upload size={15} />
            <span>Import</span>
          </button>

          {/* Download Data (Blue) */}
          <button 
            className="sigap-btn-blue"
            onClick={handleDownload}
          >
            <Download size={15} />
            <span>Download Data</span>
          </button>

          {/* + Tambah (Teal) */}
          <button 
            className="sigap-btn-teal"
            onClick={() => {
              setEditingGuru(null);
              setFormData({
                nama: '',
                nip: '',
                lp: 'L',
                status: 'GTY',
                unit: '',
                unitTag: '',
                jabatan: 'Pengampu Tahfidz',
                email: '',
                password: '',
                noHp: ''
              });
              setShowPassword(false);
              setShowAddModal(true);
            }}
          >
            <Plus size={15} />
            <span>+ Tambah</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & SORT BAR */}
      <div className="sigap-filter-bar">
        <div className="sigap-search-input-box" style={{ flex: 1 }}>
          <Search size={16} className="sigap-search-icon" />
          <input 
            type="text" 
            placeholder="Cari guru berdasarkan nama, email, atau NIP..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sigap-search-input"
          />
        </div>

        <button 
          className="sigap-btn-sort"
          onClick={() => setIsAscending(!isAscending)}
          title="Urutkan Abjad"
        >
          <ArrowUpDown size={15} />
        </button>
      </div>

      {/* 3. GRID KARTU GURU & PEGAWAI (3 KOLOM PERSIS GAMBAR 3) */}
      <div className="sigap-guru-grid">
        {filteredList.map((item) => (
          <div key={item.id} className="sigap-guru-card">
            {/* Top Row: Avatar + Name + NIP + Badges */}
            <div className="sigap-guru-card-top">
              <div className="sigap-guru-avatar" style={{ background: item.avatarBg || '#dcfce7' }}>
                <span>{item.initial || item.nama.charAt(0)}</span>
              </div>

              <div className="sigap-guru-identity">
                <div className="sigap-guru-name">{item.nama}</div>
                <div className="sigap-guru-nip">{item.nip}</div>
              </div>

              {/* Badges on Top Right */}
              <div className="sigap-guru-badges-col">
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  <span className="sigap-badge-gray">{item.lp}</span>
                  <span className="sigap-badge-gray">{item.status || 'GTY'}</span>
                </div>
                {item.unit && (
                  <span className="sigap-badge-purple">{item.unit}</span>
                )}
                {item.unitTag && (
                  <div className="sigap-badge-orange-tag">
                    <Link2 size={10} />
                    <span>{item.unitTag}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="sigap-guru-divider"></div>

            {/* Details: Jabatan, Email, No HP */}
            <div className="sigap-guru-details">
              <div className="sigap-guru-detail-item">
                <Building2 size={14} className="sigap-guru-icon" />
                <span>{item.jabatan || 'Pengampu Tahfidz'}</span>
              </div>

              {item.email && (
                <div className="sigap-guru-detail-item">
                  <Mail size={14} className="sigap-guru-icon" />
                  <span className="sigap-guru-truncate" title={`Username Login: ${item.email}`}>
                    <strong>User:</strong> {item.email}
                  </span>
                </div>
              )}

              <div className="sigap-guru-detail-item">
                <KeyRound size={14} className="sigap-guru-icon" />
                <span style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Password: {item.password ? '••••••••' : 'Aktif (123456)'}
                </span>
              </div>

              {item.noHp ? (
                <div className="sigap-guru-detail-item">
                  <Phone size={14} className="sigap-guru-icon" />
                  <span>{item.noHp}</span>
                </div>
              ) : (
                <div className="sigap-guru-detail-item" style={{ color: '#94a3b8' }}>
                  <Phone size={14} className="sigap-guru-icon" />
                  <span>-</span>
                </div>
              )}
            </div>

            {/* Action Bar inside Card */}
            <div className="sigap-guru-card-footer">
              <button 
                className="sigap-btn-card-action"
                title="Edit Data"
                onClick={() => {
                  setEditingGuru(item);
                  setFormData({ ...item, password: item.password || '' });
                  setShowPassword(false);
                  setShowAddModal(true);
                }}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
              <button 
                className="sigap-btn-card-action danger"
                title="Hapus Guru"
                onClick={() => handleDelete(item.id, item.nama)}
              >
                <Trash2 size={13} />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: TAMBAH / EDIT GURU */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                {editingGuru ? 'Ubah Data Guru & Pegawai' : 'Tambah Guru & Pegawai Baru'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap & Gelar *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Contoh: Ainun Hamidah, S.Pd"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">NIP (atau NON-NIP)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="NON-NIP atau 18 digit NIP"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select 
                      className="form-input"
                      value={formData.lp}
                      onChange={(e) => setFormData({ ...formData, lp: e.target.value })}
                    >
                      <option value="L">L (Laki-laki)</option>
                      <option value="P">P (Perempuan)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Status Kepegawaian</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="GTY / GTT / Staff"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jabatan / Penugasan *</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="Pengampu Tahfidz / Koordinator / Wali Kelas"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">No. HP / WhatsApp</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: 08123456789 atau 628..."
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  />
                </div>

                {/* FORM AKUN LOGIN PENGAMPU (EMAIL USERNAME & PASSWORD) */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyRound size={17} color="#059669" />
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#065f46' }}>
                      Akun Login Pengampu (Akses Portal Guru)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#065f46', fontWeight: 700 }}>
                        Alamat Email (Username Login) *
                      </label>
                      <input 
                        type="email" 
                        required 
                        className="form-input" 
                        placeholder="ustadz@ppias.sch.id"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      <small style={{ color: '#047857', fontSize: '0.72rem', marginTop: '3px', display: 'block' }}>
                        Email ini digunakan sebagai Username login.
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#065f46', fontWeight: 700 }}>
                        Password Akun Pengampu *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required={!editingGuru}
                          className="form-input" 
                          placeholder={editingGuru ? "(Kosongkan jika tak diubah)" : "Minimal 6 karakter"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={showPassword ? "Sembunyikan password" : "Lihat password"}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <small style={{ color: '#047857', fontSize: '0.72rem', marginTop: '3px', display: 'block' }}>
                        Password untuk masuk ke akun pengampu.
                      </small>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tag Multi-Unit (Opsional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: SMP IT IHYA' AS-SUNNAH"
                    value={formData.unitTag}
                    onChange={(e) => setFormData({ ...formData, unitTag: e.target.value, unit: e.target.value ? '2 Unit' : '' })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} />
                  <span>{editingGuru ? 'Simpan Perubahan' : 'Daftarkan Guru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
