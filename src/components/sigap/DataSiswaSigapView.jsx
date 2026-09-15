import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Download, 
  FileText, 
  Upload, 
  ArrowUpRight, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Phone, 
  Eye, 
  Edit3, 
  Trash2,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../../services/storage';
import CustomSelect from '../common/CustomSelect';

export default function DataSiswaSigapView({ showToast }) {
  const [siswaList, setSiswaList] = useState(storageService.getSigapSiswa());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('Semua Gender');
  const [selectedPengampu, setSelectedPengampu] = useState('Semua Pengampu');
  const [isAscending, setIsAscending] = useState(true);

  // Ambil data guru & pegawai yang sudah terdaftar di sistem
  const guruPegawaiList = storageService.getSigapGuru() || [];
  const ustadzPengampuList = storageService.getPengampu() || [];
  const daftarPengampu = Array.from(
    new Set([
      ...guruPegawaiList.map(g => g.nama),
      ...ustadzPengampuList.map(p => p.nama)
    ])
  ).filter(Boolean).sort((a, b) => a.localeCompare(b));

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [viewingSiswa, setViewingSiswa] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    lp: 'L',
    nisn: '',
    pengampu: '',
    tglLahir: '',
    wali: '',
    kontakWali: ''
  });

  const reloadData = () => {
    setSiswaList(storageService.getSigapSiswa());
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.nisn) {
      alert("Nama Siswa dan NISN wajib diisi!");
      return;
    }

    if (editingSiswa) {
      storageService.updateSigapSiswa(editingSiswa.id, formData);
      showToast && showToast(`Data siswa ${formData.nama} berhasil diperbarui!`);
    } else {
      storageService.addSigapSiswa(formData);
      showToast && showToast(`Siswa ${formData.nama} berhasil ditambahkan!`);
    }

    reloadData();
    setShowAddModal(false);
    setEditingSiswa(null);
    setFormData({
      nama: '',
      nik: '',
      lp: 'L',
      nisn: '',
      pengampu: '',
      tglLahir: '',
      wali: '',
      kontakWali: ''
    });
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Hapus data siswa ${nama}?`)) {
      storageService.deleteSigapSiswa(id);
      reloadData();
      showToast && showToast(`Siswa ${nama} berhasil dihapus.`);
    }
  };

  const handleDownloadData = () => {
    const headers = ["No", "Nama Siswa", "NIK", "L/P", "NISN/NISM", "Kelas", "Guru Pengampu", "Tanggal Lahir", "Wali Murid", "No Kontak"];
    const rows = siswaList.map((s, idx) => [
      idx + 1,
      `"${s.nama}"`,
      `"${s.nik || '-'}"`,
      `"${s.lp}"`,
      `"${s.nisn}"`,
      `"${s.kelas}"`,
      `"${s.pengampu || '-'}"`,
      `"${s.tglLahir || '-'}"`,
      `"${s.wali || '-'}"`,
      `"${s.kontakWali || '-'}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Siswa_MA_IHYA_AS_SUNNAH_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Data Siswa berhasil diunduh (CSV / Excel)!");
  };

  // Filter & Search
  const filteredList = siswaList
    .filter(s => {
      const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.nisn && s.nisn.includes(searchTerm)) ||
                          (s.nik && s.nik.includes(searchTerm)) ||
                          (s.pengampu && s.pengampu.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchPengampu = selectedPengampu === 'Semua Pengampu' || s.pengampu === selectedPengampu;
      const matchGender = selectedGender === 'Semua Gender' || 
        (selectedGender === 'Laki-laki' && (s.lp === 'L' || s.lp === 'Laki-laki')) ||
        (selectedGender === 'Perempuan' && (s.lp === 'P' || s.lp === 'Perempuan'));
      return matchSearch && matchPengampu && matchGender;
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
      {/* 1. HEADER HALAMAN PERSIS GAMBAR 2 */}
      <div className="sigap-page-header-row">
        <div className="sigap-page-title-group">
          <div className="sigap-page-icon-badge">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="sigap-page-title">Data Siswa</h1>
            <p className="sigap-page-subtitle">Kelola data siswa jenjang MA IHYA' AS-SUNNAH</p>
          </div>
        </div>

        {/* 5 Tombol Aksi Kanan (Pada Mobile Otomatis Icon Saja, 1 Baris & Efek Hover) */}
        <div className="sigap-page-actions sigap-mobile-action-bar">
          {/* Kenaikan Kelas (Orange) */}
          <button 
            className="sigap-btn-orange" 
            onClick={() => showToast && showToast("Modul Kenaikan Kelas Tahun Ajaran Aktif")}
            title="Kenaikan Kelas"
          >
            <ArrowUpRight size={17} />
            <span>Kenaikan Kelas</span>
          </button>

          {/* + Tambah Siswa (Teal) */}
          <button 
            className="sigap-btn-teal" 
            onClick={() => {
              setEditingSiswa(null);
              setFormData({
                nama: '',
                nik: '',
                lp: 'L',
                nisn: '',
                kelas: 'X A',
                pengampu: '',
                tglLahir: '',
                wali: '',
                kontakWali: ''
              });
              setShowAddModal(true);
            }}
            title="Tambah Siswa Baru"
          >
            <Plus size={17} />
            <span>+ Tambah Siswa</span>
          </button>

          {/* Download Data (Blue) */}
          <button 
            className="sigap-btn-blue"
            onClick={handleDownloadData}
            title="Download Data Siswa"
          >
            <Download size={17} />
            <span>Download Data</span>
          </button>

          {/* Template (Dark Slate) */}
          <button 
            className="sigap-btn-slate"
            onClick={() => showToast && showToast("Template Impor Siswa diunduh!")}
            title="Download Template Excel"
          >
            <FileText size={17} />
            <span>Template</span>
          </button>

          {/* Import Excel (Green) */}
          <button 
            className="sigap-btn-green"
            onClick={() => showToast && showToast("Buka jendela import data siswa Excel")}
            title="Import Excel"
          >
            <Upload size={17} />
            <span>Import Excel</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR DENGAN CUSTOM SELECT PERSIS GAMBAR */}
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

        <div className="sigap-filter-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filter Gender (Persis Gambar Referensi User) */}
          <div style={{ minWidth: '160px', flex: '1 1 160px' }}>
            <CustomSelect
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              options={['Semua Gender', 'Perempuan', 'Laki-laki']}
              triggerStyle={{ minHeight: '40px', padding: '0 14px', fontSize: '0.84rem' }}
            />
          </div>

          {/* Filter Pengampu */}
          <div style={{ minWidth: '190px', flex: '1 1 190px' }}>
            <CustomSelect
              value={selectedPengampu}
              onChange={(e) => setSelectedPengampu(e.target.value)}
              options={['Semua Pengampu', ...daftarPengampu]}
              icon={<Filter size={14} />}
              triggerStyle={{ minHeight: '40px', padding: '0 14px', fontSize: '0.84rem' }}
            />
          </div>

          <button 
            className="sigap-btn-sort"
            onClick={() => setIsAscending(!isAscending)}
            title="Urutkan Abjad"
            style={{ height: '40px' }}
          >
            <ArrowUpDown size={15} />
            <span>{isAscending ? 'A-Z' : 'Z-A'}</span>
          </button>
        </div>
      </div>

      {/* 3. TABEL DATA SISWA PERSIS GAMBAR 2 */}
      <div className="sigap-table-card">
        <table className="sigap-table">
          <thead>
            <tr>
              <th style={{ width: '45px' }}>No</th>
              <th>Nama Siswa</th>
              <th style={{ width: '55px', textAlign: 'center' }}>L/P</th>
              <th>NISN / NISM</th>
              <th>Guru Pengampu</th>
              <th>Tgl Lahir</th>
              <th>Wali Murid</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
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
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                    {item.lp}
                  </td>
                  <td>
                    <span className="sigap-nisn-text">{item.nisn}</span>
                  </td>
                  <td>
                    {item.pengampu ? (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        background: '#ecfdf5', 
                        color: '#065f46', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        fontWeight: 700,
                        border: '1px solid #a7f3d0'
                      }}>
                        {item.pengampu}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td style={{ color: '#475569', fontSize: '13px' }}>
                    {item.tglLahir || '-'}
                  </td>
                  <td>
                    <div className="sigap-wali-name">{item.wali || '-'}</div>
                    {item.kontakWali && item.kontakWali !== '-' && (
                      <div className="sigap-wali-phone">
                        <Phone size={11} />
                        <span>{item.kontakWali}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="sigap-actions-row">
                      <button 
                        className="sigap-btn-action view" 
                        title="Lihat Detail"
                        onClick={() => setViewingSiswa(item)}
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        className="sigap-btn-action edit" 
                        title="Ubah Data"
                        onClick={() => {
                          setEditingSiswa(item);
                          setFormData({ ...item });
                          setShowAddModal(true);
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        className="sigap-btn-action delete" 
                        title="Hapus Data"
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
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  Tidak ada data siswa yang cocok dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: TAMBAH / UBAH SISWA */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
                {editingSiswa ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Siswa *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Contoh: Adila Syakira"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">NIK (Nomor Induk Kependudukan)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="16 Digit NIK"
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin (L/P) *</label>
                    <CustomSelect 
                      value={formData.lp}
                      onChange={(e) => setFormData({ ...formData, lp: e.target.value })}
                      options={[
                        { value: 'L', label: 'Laki-laki (L)' },
                        { value: 'P', label: 'Perempuan (P)' }
                      ]}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">NISN / NISM *</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      placeholder="Contoh: 131215030022260008"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tanggal Lahir</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: 17 Juli 2009"
                      value={formData.tglLahir}
                      onChange={(e) => setFormData({ ...formData, tglLahir: e.target.value })}
                    />
                  </div>
                </div>

                {/* FORM NAMA PENGAMPU DARI GURU/PEGAWAI TERDAFTAR */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Nama Guru / Ustadz Pengampu *</span>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                      Terdaftar ({daftarPengampu.length} Guru/Pegawai)
                    </span>
                  </label>
                  <CustomSelect 
                    value={formData.pengampu}
                    onChange={(e) => setFormData({ ...formData, pengampu: e.target.value })}
                    placeholder="-- Pilih Guru / Ustadz Pengampu --"
                    options={[
                      { value: '', label: '-- Pilih Guru / Ustadz Pengampu --' },
                      ...daftarPengampu.map(nama => ({ value: nama, label: nama }))
                    ]}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Data pengampu diambil otomatis dari daftar Guru & Pegawai yang terdaftar di sistem.
                  </small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Wali Murid</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: HAULAF"
                      value={formData.wali}
                      onChange={(e) => setFormData({ ...formData, wali: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">No. Telepon / WhatsApp Wali</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="0812..."
                      value={formData.kontakWali}
                      onChange={(e) => setFormData({ ...formData, kontakWali: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} />
                  <span>{editingSiswa ? 'Simpan Perubahan' : 'Daftarkan Siswa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIHAT DETAIL SISWA */}
      {viewingSiswa && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Profil Detail Siswa</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewingSiswa(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '16px 0 20px 0' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  border: '2px solid #bfdbfe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  {viewingSiswa.nama.charAt(0).toUpperCase()}
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{viewingSiswa.nama}</h4>
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>NISN: {viewingSiswa.nisn}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Guru / Ustadz Pengampu:</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{viewingSiswa.pengampu || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Jenis Kelamin:</span>
                  <span style={{ fontWeight: 700 }}>{viewingSiswa.lp === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>NIK:</span>
                  <span style={{ fontWeight: 600 }}>{viewingSiswa.nik || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Tanggal Lahir:</span>
                  <span style={{ fontWeight: 600 }}>{viewingSiswa.tglLahir || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Wali Murid:</span>
                  <span style={{ fontWeight: 700 }}>{viewingSiswa.wali || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>Kontak Wali:</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>{viewingSiswa.kontakWali || '-'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingSiswa(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
