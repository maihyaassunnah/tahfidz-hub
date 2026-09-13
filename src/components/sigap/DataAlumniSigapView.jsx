import React, { useState } from 'react';
import { 
  GraduationCap, 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus,
  Eye, 
  Edit3, 
  Trash2,
  X,
  Save
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function DataAlumniSigapView({ showToast }) {
  const [alumniList, setAlumniList] = useState(storageService.getSigapAlumni());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('Semua Tahun');
  const [isAscending, setIsAscending] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingAlumni, setViewingAlumni] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    nisn: '',
    nism: '-',
    lp: 'P',
    tahunLulus: '2026'
  });

  const reloadData = () => {
    setAlumniList(storageService.getSigapAlumni());
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.nisn) {
      alert("Nama Alumni dan NISN wajib diisi!");
      return;
    }

    storageService.addSigapAlumni(formData);
    reloadData();
    setShowAddModal(false);
    setFormData({
      nama: '',
      nik: '',
      nisn: '',
      nism: '-',
      lp: 'P',
      tahunLulus: '2026'
    });
    showToast && showToast(`Alumni ${formData.nama} berhasil ditambahkan!`);
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Hapus data alumni ${nama}?`)) {
      storageService.deleteSigapAlumni(id);
      reloadData();
      showToast && showToast(`Alumni ${nama} berhasil dihapus.`);
    }
  };

  const handleDownloadExcel = () => {
    const headers = ["No", "Nama Lengkap", "NIK", "NISN", "NISM", "L/P", "Tahun Lulus"];
    const rows = alumniList.map((a, idx) => [
      idx + 1,
      `"${a.nama}"`,
      `"${a.nik || '-'}"`,
      `"${a.nisn}"`,
      `"${a.nism || '-'}"`,
      `"${a.lp}"`,
      `"${a.tahunLulus}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Alumni_MA_IHYA_AS_SUNNAH_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Data Alumni berhasil diunduh (Excel / CSV)!");
  };

  const filteredList = alumniList
    .filter(a => {
      const q = searchTerm.toLowerCase();
      const matchSearch = a.nama.toLowerCase().includes(q) || 
                          (a.nisn && a.nisn.includes(q)) || 
                          (a.nik && a.nik.includes(q));
      const matchTahun = selectedTahun === 'Semua Tahun' || a.tahunLulus === selectedTahun;
      return matchSearch && matchTahun;
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
      {/* 1. HEADER PERSIS GAMBAR 4 */}
      <div className="sigap-page-header-row">
        <div className="sigap-page-title-group">
          <div className="sigap-page-icon-badge">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="sigap-page-title">Data Alumni</h1>
            <p className="sigap-page-subtitle">Kelola data alumni MA IHYA' AS-SUNNAH</p>
          </div>
        </div>

        {/* Tombol Aksi Kanan: Download Excel + Tambah Alumni */}
        <div className="sigap-page-actions">
          <button 
            className="sigap-btn-teal"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} />
            <span>+ Tambah Alumni</span>
          </button>

          <button 
            className="sigap-btn-green"
            onClick={handleDownloadExcel}
          >
            <Download size={15} />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="sigap-filter-bar">
        <div className="sigap-search-input-box">
          <Search size={16} className="sigap-search-icon" />
          <input 
            type="text" 
            placeholder="Cari nama atau NISN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sigap-search-input"
          />
        </div>

        <div className="sigap-filter-controls">
          <div className="sigap-select-box">
            <Filter size={15} className="sigap-filter-icon" />
            <select 
              value={selectedTahun} 
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="sigap-select"
            >
              <option value="Semua Tahun">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <button 
            className="sigap-btn-sort"
            onClick={() => setIsAscending(!isAscending)}
            title="Urutkan Abjad"
          >
            <ArrowUpDown size={15} />
            <span>{isAscending ? 'A-Z' : 'Z-A'}</span>
          </button>
        </div>
      </div>

      {/* 3. TABEL DATA ALUMNI PERSIS GAMBAR 4 */}
      <div className="sigap-table-card">
        <table className="sigap-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>No</th>
              <th>Nama Lengkap</th>
              <th>NISN / NISM</th>
              <th style={{ width: '55px', textAlign: 'center' }}>L/P</th>
              <th>Tahun Lulus</th>
              <th style={{ width: '90px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                  <td>
                    <div className="sigap-student-name">{item.nama}</div>
                    {item.nik && <div className="sigap-student-nik">NIK: {item.nik}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.nisn}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>NISM: {item.nism || '-'}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                    {item.lp}
                  </td>
                  <td>
                    <span className="sigap-tahun-pill">{item.tahunLulus}</span>
                  </td>
                  <td>
                    <div className="sigap-actions-row">
                      <button 
                        className="sigap-btn-action view" 
                        title="Lihat Detail"
                        onClick={() => setViewingAlumni(item)}
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        className="sigap-btn-action delete" 
                        title="Hapus Alumni"
                        onClick={() => handleDelete(item.id, item.nama)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  Tidak ada data alumni yang cocok dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: TAMBAH ALUMNI */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Tambah Data Alumni</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Alumni *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Contoh: AFIFAH TURROSYIDAH"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">NIK</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="16 digit NIK"
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select 
                      className="form-input"
                      value={formData.lp}
                      onChange={(e) => setFormData({ ...formData, lp: e.target.value })}
                    >
                      <option value="P">P (Perempuan)</option>
                      <option value="L">L (Laki-laki)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">NISN *</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="Contoh: 0083805811"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tahun Lulus *</label>
                    <select 
                      className="form-input"
                      value={formData.tahunLulus}
                      onChange={(e) => setFormData({ ...formData, tahunLulus: e.target.value })}
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} />
                  <span>Simpan Data Alumni</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIHAT DETAIL ALUMNI */}
      {viewingAlumni && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Detail Alumni</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewingAlumni(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '16px 0 20px 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  border: '2px solid #bbf7d0',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  {viewingAlumni.nama.charAt(0).toUpperCase()}
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{viewingAlumni.nama}</h4>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>NISN: {viewingAlumni.nisn}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Tahun Kelulusan:</span>
                  <span className="sigap-tahun-pill">{viewingAlumni.tahunLulus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Jenis Kelamin:</span>
                  <span style={{ fontWeight: 700 }}>{viewingAlumni.lp === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>NIK:</span>
                  <span style={{ fontWeight: 600 }}>{viewingAlumni.nik || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>NISM:</span>
                  <span style={{ fontWeight: 600 }}>{viewingAlumni.nism || '-'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingAlumni(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
