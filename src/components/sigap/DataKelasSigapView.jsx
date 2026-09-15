import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  ShieldCheck, 
  FileText, 
  Edit3, 
  Trash2, 
  X, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function DataKelasSigapView({ showToast }) {
  const [kelasList, setKelasList] = useState(storageService.getSigapKelas());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    unitSekolah: "MA IHYA' AS-SUNNAH",
    waliKelas: '',
    aktif: true
  });

  const reloadData = () => {
    setKelasList(storageService.getSigapKelas());
  };

  const handleToggleAktif = (id) => {
    const item = kelasList.find(k => k.id === id);
    if (item) {
      storageService.updateSigapKelas(id, { aktif: !item.aktif });
      reloadData();
      showToast && showToast(`Status kelas ${item.nama} diubah menjadi ${!item.aktif ? 'Aktif' : 'Nonaktif'}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.waliKelas) {
      alert("Nama Kelas dan Wali Kelas wajib diisi!");
      return;
    }

    if (editingKelas) {
      storageService.updateSigapKelas(editingKelas.id, formData);
      showToast && showToast(`Data kelas ${formData.nama} berhasil diperbarui!`);
    } else {
      storageService.addSigapKelas(formData);
      showToast && showToast(`Kelas ${formData.nama} berhasil ditambahkan!`);
    }

    reloadData();
    setShowAddModal(false);
    setEditingKelas(null);
    setFormData({
      nama: '',
      unitSekolah: "MA IHYA' AS-SUNNAH",
      waliKelas: '',
      aktif: true
    });
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Hapus rombel kelas ${nama}?`)) {
      storageService.deleteSigapKelas(id);
      reloadData();
      showToast && showToast(`Kelas ${nama} berhasil dihapus.`);
    }
  };

  const handleUnduhMasal = () => {
    const headers = ["No", "Nama Kelas", "Unit Sekolah", "Wali Kelas", "Status"];
    const rows = kelasList.map((k, idx) => [
      idx + 1,
      `"${k.nama}"`,
      `"${k.unitSekolah}"`,
      `"${k.waliKelas}"`,
      `"${k.aktif ? 'Aktif' : 'Nonaktif'}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agenda_Kelas_MA_IHYA_AS_SUNNAH_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Agenda seluruh kelas berhasil diunduh!");
  };

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER PERSIS GAMBAR 1 */}
      <div className="sigap-page-header-row">
        <div className="sigap-page-title-group">
          <div className="sigap-page-icon-badge">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="sigap-page-title">Data Kelas & Wali</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
              <span>Unit Sekolah:</span>
              <span style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '11px',
                letterSpacing: '0.04em'
              }}>
                MA IHYA' AS-SUNNAH
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi Kanan (Mobile: Icon Saja, 1 Baris, Efek Hover) */}
        <div className="sigap-page-actions sigap-mobile-action-bar">
          <button 
            className="sigap-btn-green"
            onClick={handleUnduhMasal}
            title="Unduh Masal Agenda"
          >
            <Download size={17} />
            <span>Unduh Masal Agenda</span>
          </button>

          <button 
            className="sigap-btn-teal"
            onClick={() => {
              setEditingKelas(null);
              setFormData({
                nama: '',
                unitSekolah: "MA IHYA' AS-SUNNAH",
                waliKelas: '',
                aktif: true
              });
              setShowAddModal(true);
            }}
            title="Tambah Kelas Baru"
          >
            <Plus size={17} />
            <span>+ Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* 2. GRID 6 KARTU KELAS PERSIS GAMBAR 1 */}
      <div className="sigap-kelas-grid">
        {kelasList.map((item) => (
          <div key={item.id} className="sigap-kelas-card">
            {/* Top Row: Icon + Name + Unit Tag + Toggle Switch */}
            <div className="sigap-kelas-card-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="sigap-kelas-icon-box">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="sigap-kelas-name">{item.nama}</div>
                  <span className="sigap-kelas-unit-tag">{item.unitSekolah}</span>
                </div>
              </div>

              {/* Sakelar Toggle Aktif */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Aktif</span>
                <label className="sigap-switch">
                  <input 
                    type="checkbox" 
                    checked={item.aktif} 
                    onChange={() => handleToggleAktif(item.id)}
                  />
                  <span className="sigap-slider"></span>
                </label>
              </div>
            </div>

            {/* Middle Row: Wali Kelas */}
            <div className="sigap-kelas-wali-section">
              <div className="sigap-kelas-wali-label">
                <ShieldCheck size={13} color="#10b981" />
                <span>WALI KELAS</span>
              </div>
              <div className="sigap-kelas-wali-name">{item.waliKelas}</div>
            </div>

            {/* Bottom Row: 3 Action Buttons */}
            <div className="sigap-kelas-footer-actions">
              <button 
                className="sigap-btn-kelas-pill agenda"
                onClick={() => showToast && showToast(`Membuka agenda KBM kelas ${item.nama}`)}
              >
                <FileText size={13} />
                <span>Agenda</span>
              </button>

              <button 
                className="sigap-btn-kelas-pill edit"
                onClick={() => {
                  setEditingKelas(item);
                  setFormData({ ...item });
                  setShowAddModal(true);
                }}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>

              <button 
                className="sigap-btn-kelas-pill delete"
                onClick={() => handleDelete(item.id, item.nama)}
                title="Hapus Kelas"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH / EDIT KELAS */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>
                {editingKelas ? 'Ubah Rombel Kelas' : 'Tambah Rombel Kelas Baru'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nama Rombel / Kelas *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Contoh: X A, XI B, XII A"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Sekolah</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.unitSekolah}
                    onChange={(e) => setFormData({ ...formData, unitSekolah: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nama Wali Kelas *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Contoh: Wahyudin Hafiz, S.Pd"
                    value={formData.waliKelas}
                    onChange={(e) => setFormData({ ...formData, waliKelas: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <input 
                    type="checkbox" 
                    id="aktifCheckbox"
                    checked={formData.aktif}
                    onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                  />
                  <label htmlFor="aktifCheckbox" style={{ fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    Status Kelas Aktif
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} />
                  <span>{editingKelas ? 'Simpan Perubahan' : 'Buat Kelas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
