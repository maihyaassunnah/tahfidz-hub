import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  RotateCcw,
  Check,
  Save,
  BookOpen
} from 'lucide-react';
import { storageService } from '../services/storage';

export default function DataMasterView({ 
  santriList, 
  halaqahList, 
  settings, 
  onSaveSantriList,
  onSaveHalaqahList,
  onSaveSettings,
  onReloadAll,
  showToast 
}) {
  const [subTab, setSubTab] = useState('santri'); // 'santri', 'halaqah', 'settings', 'backup'

  // Form Santri Baru
  const [showAddSantri, setShowAddSantri] = useState(false);
  const [newSantri, setNewSantri] = useState({
    nama: '',
    nis: '',
    kelas: 'X MA Tahfidz',
    halaqahId: halaqahList[0]?.id || 'h1',
    targetJuz: 10,
    namaWali: '',
    kontakWali: ''
  });

  // Edit Santri
  const [editingSantri, setEditingSantri] = useState(null);

  // Form Settings State
  const [tempSettings, setTempSettings] = useState(settings);

  // Handle Tambah Santri
  const handleAddSantriSubmit = (e) => {
    e.preventDefault();
    if (!newSantri.nama || !newSantri.nis) {
      alert("Nama dan NIS wajib diisi!");
      return;
    }

    const created = storageService.addSantri(newSantri);
    onReloadAll();
    setShowAddSantri(false);
    setNewSantri({
      nama: '',
      nis: '',
      kelas: 'X MA Tahfidz',
      halaqahId: halaqahList[0]?.id || 'h1',
      targetJuz: 10,
      namaWali: '',
      kontakWali: ''
    });
    showToast(`Santri ${created.nama} berhasil ditambahkan!`);
  };

  // Handle Edit Santri
  const handleUpdateSantri = (e) => {
    e.preventDefault();
    storageService.updateSantri(editingSantri.id, editingSantri);
    onReloadAll();
    setEditingSantri(null);
    showToast(`Data santri ${editingSantri.nama} berhasil diperbarui!`);
  };

  // Handle Hapus Santri
  const handleDeleteSantri = (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus data santri: ${nama}?`)) {
      storageService.deleteSantri(id);
      onReloadAll();
      showToast(`Data santri ${nama} telah dihapus.`);
    }
  };

  // Handle Save Lembaga Settings
  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    storageService.saveSettings(tempSettings);
    onSaveSettings(tempSettings);
    showToast("Pengaturan lembaga berhasil disimpan!");
  };

  // Handle Restore File
  const handleFileRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = storageService.importBackupJSON(event.target.result);
      if (result.success) {
        onReloadAll();
        showToast("Data cadangan (backup) berhasil dipulihkan!");
      } else {
        alert("Gagal memulihkan file cadangan: " + result.error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0 0 4px 0' }}>
          Data Master & Cadangan Sistem
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', margin: 0 }}>
          Kelola master data santri, halaqah pembimbing, kop rapor lembaga, serta backup & restore database
        </p>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--slate-200)', marginBottom: '24px' }}>
        <button
          className={`btn ${subTab === 'santri' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSubTab('santri')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          <Users size={16} />
          <span>Data Santri ({santriList.length})</span>
        </button>

        <button
          className={`btn ${subTab === 'halaqah' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSubTab('halaqah')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          <BookOpen size={16} />
          <span>Data Halaqah ({halaqahList.length})</span>
        </button>

        <button
          className={`btn ${subTab === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSubTab('settings')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          <Settings size={16} />
          <span>Pengaturan Lembaga</span>
        </button>

        <button
          className={`btn ${subTab === 'backup' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSubTab('backup')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          <Database size={16} />
          <span>Backup & Restore Data</span>
        </button>
      </div>

      {/* TAB 1: DATA SANTRI */}
      {subTab === 'santri' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>Daftar Seluruh Santri</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddSantri(true)}>
              <Plus size={16} />
              <span>+ Tambah Santri Baru</span>
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>NIS</th>
                    <th>Nama Santri</th>
                    <th>Kelas</th>
                    <th>Halaqah</th>
                    <th>Target Hafalan</th>
                    <th>Capaian Mutqin</th>
                    <th>Kontak Wali</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {santriList.map(s => {
                    const h = halaqahList.find(item => item.id === s.halaqahId);
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700, color: 'var(--slate-700)' }}>{s.nis}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{s.nama}</div>
                        </td>
                        <td>{s.kelas}</td>
                        <td>{h ? h.nama.replace('Halaqah ', '') : '-'}</td>
                        <td>
                          <strong>{s.targetJuz} Juz</strong>
                        </td>
                        <td>
                          <span className="badge badge-mumtaz">
                            {s.juzMutqin?.length || 0} Juz Mutqin
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {s.namaWali ? `${s.namaWali} (${s.kontakWali})` : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button 
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingSantri(s)}
                              title="Edit Data Santri"
                            >
                              <Edit3 size={15} color="#2563eb" />
                            </button>
                            <button 
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDeleteSantri(s.id, s.nama)}
                              title="Hapus Santri"
                            >
                              <Trash2 size={15} color="#e11d48" />
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

      {/* TAB 2: DATA HALAQAH */}
      {subTab === 'halaqah' && (
        <div className="card">
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Kelompok Halaqah & Musyrif Pengampu</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {halaqahList.map(h => {
              const count = santriList.filter(s => s.halaqahId === h.id).length;
              return (
                <div 
                  key={h.id}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    background: 'var(--slate-50)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--primary-800)' }}>{h.nama}</h4>
                    <span className="badge badge-mumtaz">{count} Santri</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '4px' }}>
                    <strong>Musyrif:</strong> {h.musyrif}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Target Ziyadah: {h.targetJuzPekan} Juz / Pekan
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN LEMBAGA */}
      {subTab === 'settings' && (
        <div className="card" style={{ maxWidth: '720px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 700 }}>Identitas Lembaga & Kop Rapor</h3>
          <form onSubmit={handleSaveSettingsSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Madrasah / Lembaga</label>
              <input 
                type="text" 
                className="form-input" 
                value={tempSettings.namaMadrasah || ''} 
                onChange={(e) => setTempSettings({ ...tempSettings, namaMadrasah: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Lengkap</label>
              <input 
                type="text" 
                className="form-input" 
                value={tempSettings.alamatMadrasah || ''} 
                onChange={(e) => setTempSettings({ ...tempSettings, alamatMadrasah: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kepala Madrasah</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={tempSettings.kepalaMadrasah || ''} 
                  onChange={(e) => setTempSettings({ ...tempSettings, kepalaMadrasah: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Koordinator Tahfidz</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={tempSettings.koordinatorTahfidz || ''} 
                  onChange={(e) => setTempSettings({ ...tempSettings, koordinatorTahfidz: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Semester Aktif</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={tempSettings.semester || ''} 
                  onChange={(e) => setTempSettings({ ...tempSettings, semester: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tahun Ajaran</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={tempSettings.tahunAjaran || ''} 
                  onChange={(e) => setTempSettings({ ...tempSettings, tahunAjaran: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              <Save size={16} />
              <span>Simpan Pengaturan</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE */}
      {subTab === 'backup' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Card Backup */}
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: 'var(--primary-800)' }}>
              Cadangkan Data (Backup JSON)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '16px', lineHeight: 1.5 }}>
              Unduh seluruh berkas database (santri, halaqah, setoran, absensi, dan pengaturan) ke dalam satu file JSON lokal. Simpan file ini secara berkala untuk menjaga keamanan data.
            </p>
            <button className="btn btn-primary" onClick={() => storageService.exportBackupJSON()}>
              <Download size={18} />
              <span>Unduh File Cadangan (JSON)</span>
            </button>
          </div>

          {/* Card Restore */}
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#0284c7' }}>
              Pulihkan Data (Restore JSON)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '16px', lineHeight: 1.5 }}>
              Muat kembali data dari file backup JSON yang sebelumnya telah Anda unduh. Seluruh data saat ini akan diselaraskan dengan data cadangan tersebut.
            </p>
            <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <Upload size={18} />
              <span>Pilih File Backup JSON</span>
              <input 
                type="file" 
                accept=".json" 
                style={{ display: 'none' }} 
                onChange={handleFileRestore}
              />
            </label>
          </div>

          {/* Card Reset Data */}
          <div className="card" style={{ border: '1px solid #fecdd3' }}>
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#be123c' }}>
              Reset Data Contoh (Demo Awal)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '16px', lineHeight: 1.5 }}>
              Kembalikan seluruh isi aplikasi ke data contoh bawaan (santri MA Ihya As Sunnah, halaqah awal, dan contoh setoran).
            </p>
            <button 
              className="btn" 
              style={{ background: '#ffe4e6', color: '#be123c', border: '1px solid #fda4af' }}
              onClick={() => {
                if (window.confirm("PERINGATAN: Semua data setoran dan perubahan lokal akan direset ke setelan awal pabrik! Lanjutkan?")) {
                  storageService.resetAllData();
                  onReloadAll();
                  showToast("Data berhasil direset ke contoh default.");
                }
              }}
            >
              <RotateCcw size={16} />
              <span>Reset ke Pengaturan Default</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Tambah Santri Baru */}
      {showAddSantri && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Tambah Santri Baru</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddSantri(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSantriSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Santri *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={newSantri.nama} 
                      onChange={(e) => setNewSantri({ ...newSantri, nama: e.target.value })}
                      placeholder="Contoh: Muhammad Raihan"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor Induk Santri (NIS) *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={newSantri.nis} 
                      onChange={(e) => setNewSantri({ ...newSantri, nis: e.target.value })}
                      placeholder="Contoh: 2026109"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kelas</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newSantri.kelas} 
                      onChange={(e) => setNewSantri({ ...newSantri, kelas: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Halaqah Bimbingan</label>
                    <select 
                      className="form-select"
                      value={newSantri.halaqahId}
                      onChange={(e) => setNewSantri({ ...newSantri, halaqahId: e.target.value })}
                    >
                      {halaqahList.map(h => (
                        <option key={h.id} value={h.id}>{h.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Hafalan (Juz)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30" 
                    className="form-input" 
                    value={newSantri.targetJuz} 
                    onChange={(e) => setNewSantri({ ...newSantri, targetJuz: parseInt(e.target.value) || 10 })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Orang Tua / Wali</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newSantri.namaWali} 
                      onChange={(e) => setNewSantri({ ...newSantri, namaWali: e.target.value })}
                      placeholder="Nama Wali"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kontak / No WhatsApp Wali</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newSantri.kontakWali} 
                      onChange={(e) => setNewSantri({ ...newSantri, kontakWali: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddSantri(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Santri */}
      {editingSantri && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Edit Data Santri: {editingSantri.nama}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingSantri(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateSantri}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editingSantri.nama} 
                      onChange={(e) => setEditingSantri({ ...editingSantri, nama: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NIS</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editingSantri.nis} 
                      onChange={(e) => setEditingSantri({ ...editingSantri, nis: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kelas</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingSantri.kelas} 
                      onChange={(e) => setEditingSantri({ ...editingSantri, kelas: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Halaqah</label>
                    <select 
                      className="form-select"
                      value={editingSantri.halaqahId}
                      onChange={(e) => setEditingSantri({ ...editingSantri, halaqahId: e.target.value })}
                    >
                      {halaqahList.map(h => (
                        <option key={h.id} value={h.id}>{h.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Hafalan (Juz)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30" 
                    className="form-input" 
                    value={editingSantri.targetJuz} 
                    onChange={(e) => setEditingSantri({ ...editingSantri, targetJuz: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingSantri(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
