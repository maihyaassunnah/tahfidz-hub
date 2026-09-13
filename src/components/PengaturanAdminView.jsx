import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Users, 
  Clock, 
  BookOpen, 
  Database, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  KeyRound, 
  FileCheck, 
  UserPlus, 
  GraduationCap, 
  Check, 
  Power, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  School,
  Eye,
  EyeOff,
  Copy,
  X
} from 'lucide-react';
import { storageService } from '../services/storage';

export default function PengaturanAdminView({ 
  settings, 
  halaqahList, 
  santriList, 
  onSaveSettings, 
  onReload, 
  showToast 
}) {
  const [activeSubTab, setActiveSubTab] = useState('pengampu-akun');
  const [formData, setFormData] = useState({ ...settings });

  const [guruList, setGuruList] = useState(storageService.getSigapGuru());
  const [pengampuList, setPengampuList] = useState(storageService.getPengampu());
  const [siswaList, setSiswaList] = useState(storageService.getSigapSiswa());
  const [sesiList, setSesiList] = useState(storageService.getSesi());

  const [searchTermGuru, setSearchTermGuru] = useState('');
  const [searchTermSiswa, setSearchTermSiswa] = useState('');
  const [selectedFilterKelas, setSelectedFilterKelas] = useState('Semua Kelas');
  const [selectedFilterUnit, setSelectedFilterUnit] = useState('Semua Unit');

  const [showAddPengampuModal, setShowAddPengampuModal] = useState(false);
  const [newPengampu, setNewPengampu] = useState({
    nama: '',
    nip: '',
    username: '',
    email: '',
    noHp: '',
    unitSekolah: "MA IHYA' AS-SUNNAH",
    jabatan: 'Guru / Pengampu',
    halaqahNama: '',
    lokasi: 'Pesantren Persatuan Islam As-Sunnah',
    role: 'Pengampu',
    password: 'bismillah123'
  });

  const [editingPengampu, setEditingPengampu] = useState(null);
  const [resetPassModal, setResetPassModal] = useState(null);
  const [customPassword, setCustomPassword] = useState('bismillah123');

  const [showAllPasswords, setShowAllPasswords] = useState(true);
  const [hiddenPasswordMap, setHiddenPasswordMap] = useState({});
  const [showEditPassword, setShowEditPassword] = useState(false);

  const togglePasswordVisibility = (id) => {
    setHiddenPasswordMap(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !showAllPasswords
    }));
  };

  const isPasswordVisible = (id) => {
    if (hiddenPasswordMap[id] !== undefined) {
      return hiddenPasswordMap[id];
    }
    return showAllPasswords;
  };

  const handleToggleAllPasswords = () => {
    const nextState = !showAllPasswords;
    setShowAllPasswords(nextState);
    setHiddenPasswordMap({});
  };

  const handleCopyPassword = (pwd, nama) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pwd);
      notify(`Kata sandi ${nama} (${pwd}) berhasil disalin!`);
    } else {
      notify(`Kata sandi ${nama}: ${pwd}`);
    }
  };

  const [showAddSesiModal, setShowAddSesiModal] = useState(false);
  const [editingSesi, setEditingSesi] = useState(null);
  const [newSesi, setNewSesi] = useState({
    nama: '',
    jamMulai: '15:45',
    jamSelesai: '17:00',
    status: 'AKTIF'
  });

  const [showAddSiswaModal, setShowAddSiswaModal] = useState(false);
  const [newSiswa, setNewSiswa] = useState({
    nama: '',
    nik: '',
    lp: 'L',
    nisn: '',
    kelas: 'X A',
    unitSekolah: "MA IHYA' AS-SUNNAH",
    pengampu: 'Wahyudin Hafiz, S.Pd',
    tglLahir: '',
    wali: '',
    kontakWali: '',
    targetJuz: 10
  });

  const [editingSiswa, setEditingSiswa] = useState(null);

  const notify = (msg) => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else {
      alert(msg);
    }
  };

  const reloadData = () => {
    setGuruList(storageService.getSigapGuru());
    setPengampuList(storageService.getPengampu());
    setSiswaList(storageService.getSigapSiswa());
    setSesiList(storageService.getSesi());
    if (onReload) onReload();
  };

  // Real-time synchronization when schedule/session is updated from Jadwal menu or other views
  useEffect(() => {
    const handleSync = () => {
      setSesiList(storageService.getSesi());
    };
    window.addEventListener('sigap_jadwal_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sigap_jadwal_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const daftarNamaPengampu = Array.from(
    new Set([
      ...guruList.map(g => g.nama),
      ...pengampuList.map(p => p.nama)
    ])
  ).filter(Boolean).sort((a, b) => a.localeCompare(b));

  const getWaliForKelas = (kelasName) => {
    switch (kelasName) {
      case 'X A': return 'Wahyudin Hafiz, S.Pd';
      case 'X B': return 'Febrianti Dewi, S.Pd';
      case 'XI A': return 'Agus Rinaldi';
      case 'XI B': return 'Ainun Hamidah, S.Pd';
      case 'XII A': return 'Feri Hermawan, S.Pd';
      case 'XII B': return 'Defit Purwaningsih, S.Pd';
      default: return daftarNamaPengampu[0] || 'Wahyudin Hafiz, S.Pd';
    }
  };

  // ==========================================
  // HANDLERS: AKUN PENGAMPU & PEGAWAI
  // ==========================================
  const handleAddPengampuSubmit = (e) => {
    e.preventDefault();
    if (!newPengampu.nama) {
      alert('Nama Guru / Pegawai wajib diisi!');
      return;
    }

    const email = newPengampu.email || (newPengampu.username ? `${newPengampu.username.toLowerCase()}@ihya.sch.id` : `${newPengampu.nama.toLowerCase().replace(/\s+/g, '')}@ihya.sch.id`);
    const username = newPengampu.username || email.split('@')[0];
    const unit = newPengampu.unitSekolah || "MA IHYA' AS-SUNNAH";
    const jabatan = newPengampu.jabatan || 'Guru / Pengampu';

    const guruItem = {
      nama: newPengampu.nama,
      nip: newPengampu.nip || 'NON-NIP',
      unit,
      unitSekolah: unit,
      unitTag: unit === "MA IHYA' AS-SUNNAH" ? 'MA' : (unit === "SMP IT IHYA' AS-SUNNAH" ? 'SMP' : 'PONPES'),
      jabatan,
      role: jabatan,
      statusPegawai: 'GTY',
      status: 'Aktif',
      email,
      username,
      password: newPengampu.password || '123456',
      noHp: newPengampu.noHp || '',
      kontak: newPengampu.noHp || '',
      halaqahNama: newPengampu.halaqahNama || `Halaqah ${newPengampu.nama}`,
      lokasi: newPengampu.lokasi || 'Pesantren Persatuan Islam As-Sunnah',
      avatarBg: '#dcfce7',
      initial: newPengampu.nama.charAt(0).toUpperCase()
    };

    storageService.addSigapGuru(guruItem);
    reloadData();
    setShowAddPengampuModal(false);
    setNewPengampu({
      nama: '',
      nip: '',
      username: '',
      email: '',
      noHp: '',
      unitSekolah: "MA IHYA' AS-SUNNAH",
      jabatan: 'Guru / Pengampu',
      halaqahNama: '',
      lokasi: 'Pesantren Persatuan Islam As-Sunnah',
      role: 'Pengampu',
      password: 'bismillah123'
    });
    notify(`Akun ${guruItem.nama} berhasil didaftarkan di Unit & Data Pegawai!`);
  };

  const handleUpdatePengampuSubmit = (e) => {
    e.preventDefault();
    if (!editingPengampu) return;
    const updatedUnit = editingPengampu.unitSekolah || editingPengampu.unit || "MA IHYA' AS-SUNNAH";
    const updatedJabatan = editingPengampu.jabatan || editingPengampu.role || 'Pengampu Tahfidz';

    const fields = {
      nama: editingPengampu.nama,
      nip: editingPengampu.nip || 'NON-NIP',
      jabatan: updatedJabatan,
      role: updatedJabatan,
      unit: updatedUnit,
      unitSekolah: updatedUnit,
      unitTag: updatedUnit === "MA IHYA' AS-SUNNAH" ? 'MA' : (updatedUnit === "SMP IT IHYA' AS-SUNNAH" ? 'SMP' : 'PONPES'),
      email: editingPengampu.email,
      username: editingPengampu.username || (editingPengampu.email ? editingPengampu.email.split('@')[0] : editingPengampu.nama.toLowerCase().replace(/\s+/g, '')),
      password: editingPengampu.password,
      noHp: editingPengampu.noHp,
      kontak: editingPengampu.noHp,
      halaqahNama: editingPengampu.halaqahNama,
      lokasi: editingPengampu.lokasi,
      status: editingPengampu.status || 'Aktif'
    };

    storageService.updateSigapGuru(editingPengampu.id, fields);
    storageService.updatePengampu(editingPengampu.id, fields);
    reloadData();
    setEditingPengampu(null);
    notify(`Data akun ${editingPengampu.nama} berhasil diperbarui!`);
  };

  const handleToggleStatusPengampu = (item) => {
    const isAktif = item.status === 'Aktif';
    const newStatus = isAktif ? 'Nonaktif' : 'Aktif';
    storageService.updateSigapGuru(item.id, { status: newStatus });
    storageService.updatePengampu(item.id, { status: newStatus });
    reloadData();
    notify(`Status akun ${item.nama} diubah menjadi: ${newStatus}`);
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetPassModal) return;
    storageService.resetPasswordPengampu(resetPassModal.id, customPassword);
    storageService.resetPasswordPengampu(resetPassModal.nama, customPassword, resetPassModal.email);
    storageService.updateSigapGuru(resetPassModal.id, { password: customPassword });
    reloadData();
    notify(`Password akun ${resetPassModal.nama} berhasil direset menjadi: ${customPassword}`);
    setResetPassModal(null);
    setCustomPassword('bismillah123');
  };

  const handleDeletePengampu = (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus guru/pengampu "${nama}" dari sistem Unit dan Data Pegawai?`)) {
      storageService.deleteSigapGuru(id);
      storageService.deletePengampu(id);
      reloadData();
      notify(`Data guru/pengampu ${nama} berhasil dihapus.`);
    }
  };

  // ==========================================
  // HANDLERS: JADWAL SESI PRESENSI
  // ==========================================
  const handleToggleStatusSesi = (sesi) => {
    const isCurrentlyAktif = sesi.status === 'AKTIF' || (sesi.aktif !== false && sesi.status !== 'NONAKTIF');
    const newStatus = isCurrentlyAktif ? 'NONAKTIF' : 'AKTIF';
    storageService.updateSesi(sesi.id, { status: newStatus, aktif: !isCurrentlyAktif });
    reloadData();
    notify(`Status sesi ${sesi.nama} diubah menjadi: ${newStatus}`);
  };

  const handleEditSesi = (sesi) => {
    setEditingSesi({
      id: sesi.id,
      nama: sesi.nama,
      jamMulai: sesi.mulai || sesi.jamMulai || '05:00',
      jamSelesai: sesi.selesai || sesi.jamSelesai || '06:30',
      status: (sesi.aktif === false || sesi.status === 'NONAKTIF') ? 'NONAKTIF' : 'AKTIF'
    });
  };

  const handleUpdateSesiSubmit = (e) => {
    e.preventDefault();
    if (!editingSesi || !editingSesi.nama) return;
    storageService.updateSesi(editingSesi.id, {
      nama: editingSesi.nama,
      jamMulai: editingSesi.jamMulai,
      jamSelesai: editingSesi.jamSelesai,
      mulai: editingSesi.jamMulai,
      selesai: editingSesi.jamSelesai,
      status: editingSesi.status,
      aktif: editingSesi.status === 'AKTIF'
    });
    reloadData();
    setEditingSesi(null);
    notify(`Perubahan sesi "${editingSesi.nama}" berhasil disimpan!`);
  };

  const handleAddSesiSubmit = (e) => {
    e.preventDefault();
    if (!newSesi.nama) {
      alert('Nama sesi wajib diisi!');
      return;
    }
    storageService.addSesi({
      ...newSesi,
      mulai: newSesi.jamMulai,
      selesai: newSesi.jamSelesai,
      bukaScan: newSesi.jamMulai,
      batasScan: newSesi.jamSelesai,
      toleransiMenit: formData.toleransiKeterlambatan || 15
    });
    reloadData();
    setShowAddSesiModal(false);
    setNewSesi({
      nama: '',
      jamMulai: '15:45',
      jamSelesai: '17:00',
      status: 'AKTIF'
    });
    notify(`Sesi ${newSesi.nama} berhasil ditambahkan!`);
  };

  const handleDeleteSesi = (id, nama) => {
    if (window.confirm(`Hapus sesi "${nama}"? Perubahan ini akan otomatis tersinkron ke Menu Jadwal.`)) {
      storageService.deleteSesi(id);
      reloadData();
      notify(`Sesi ${nama} berhasil dihapus.`);
    }
  };

  // ==========================================
  // HANDLERS: DATA SISWA UNIT
  // ==========================================
  const handleAddSiswaSubmit = (e) => {
    e.preventDefault();
    if (!newSiswa.nama || !newSiswa.nisn) {
      alert('Nama Siswa dan NISN wajib diisi!');
      return;
    }

    const payload = {
      ...newSiswa,
      nama: newSiswa.nama.trim(),
      nisn: newSiswa.nisn.trim(),
      nik: newSiswa.nik || '',
      lp: newSiswa.lp || 'L',
      kelas: newSiswa.kelas || 'X A',
      unitSekolah: newSiswa.unitSekolah || "MA IHYA' AS-SUNNAH",
      pengampu: newSiswa.pengampu || getWaliForKelas(newSiswa.kelas || 'X A'),
      status: 'Aktif'
    };

    storageService.addSigapSiswa(payload);
    reloadData();
    setShowAddSiswaModal(false);
    setNewSiswa({
      nama: '',
      nik: '',
      lp: 'L',
      nisn: '',
      kelas: 'X A',
      unitSekolah: "MA IHYA' AS-SUNNAH",
      pengampu: 'Wahyudin Hafiz, S.Pd',
      tglLahir: '',
      wali: '',
      kontakWali: '',
      targetJuz: 10
    });
    notify(`Siswa ${payload.nama} berhasil didaftarkan ke Unit ${payload.unitSekolah} dan disinkronkan ke Data Siswa!`);
  };

  const handleUpdateSiswaSubmit = (e) => {
    e.preventDefault();
    if (!editingSiswa) return;
    if (!editingSiswa.nama || !editingSiswa.nisn) {
      alert('Nama Siswa dan NISN wajib diisi!');
      return;
    }

    const payload = {
      ...editingSiswa,
      nama: editingSiswa.nama.trim(),
      nisn: editingSiswa.nisn.trim(),
      unitSekolah: editingSiswa.unitSekolah || "MA IHYA' AS-SUNNAH",
      pengampu: editingSiswa.pengampu || getWaliForKelas(editingSiswa.kelas)
    };

    storageService.updateSigapSiswa(editingSiswa.id, payload);
    reloadData();
    setEditingSiswa(null);
    notify(`Data siswa ${payload.nama} berhasil diperbarui di Unit & Data Siswa!`);
  };

  const handleDeleteSiswa = (id, nama) => {
    if (window.confirm(`Hapus data siswa "${nama}" dari Unit dan Data Siswa?`)) {
      storageService.deleteSigapSiswa(id);
      reloadData();
      notify(`Data siswa ${nama} berhasil dihapus.`);
    }
  };

  // ==========================================
  // HANDLERS: LEMBAGA & BACKUP
  // ==========================================
  const handleSaveLembaga = (e) => {
    e.preventDefault();
    if (onSaveSettings) {
      onSaveSettings(formData);
    } else {
      storageService.saveSettings(formData);
    }
    notify('Identitas Lembaga & Satuan Pendidikan berhasil diperbarui!');
  };

  const handleFileRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = storageService.importBackupJSON(event.target.result);
        if (result && result.success) {
          notify('Database berhasil dipulihkan dari file backup!');
          reloadData();
        } else {
          alert('Gagal memulihkan database: Format file tidak valid.');
        }
      } catch (err) {
        alert('Error memproses file cadangan: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // FILTERED LISTS
  // ==========================================
  const filteredGuruList = guruList.filter(g => {
    const term = searchTermGuru.toLowerCase().trim();
    const matchSearch = !term ||
      (g.nama && g.nama.toLowerCase().includes(term)) ||
      (g.nip && g.nip.toLowerCase().includes(term)) ||
      (g.email && g.email.toLowerCase().includes(term)) ||
      (g.username && g.username.toLowerCase().includes(term)) ||
      (g.jabatan && g.jabatan.toLowerCase().includes(term)) ||
      (g.halaqahNama && g.halaqahNama.toLowerCase().includes(term));

    const unitVal = g.unitSekolah || g.unit || '';
    const matchUnit = selectedFilterUnit === 'Semua Unit' || unitVal === selectedFilterUnit;

    return matchSearch && matchUnit;
  });

  const filteredSiswaList = siswaList.filter(s => {
    const term = searchTermSiswa.toLowerCase().trim();
    const matchSearch = !term ||
      (s.nama && s.nama.toLowerCase().includes(term)) ||
      (s.nik && s.nik.toLowerCase().includes(term)) ||
      (s.nisn && s.nisn.toLowerCase().includes(term)) ||
      (s.pengampu && s.pengampu.toLowerCase().includes(term));

    const matchKelas = selectedFilterKelas === 'Semua Kelas' || s.kelas === selectedFilterKelas;
    const unitVal = s.unitSekolah || '';
    const matchUnit = selectedFilterUnit === 'Semua Unit' || unitVal === selectedFilterUnit;

    return matchSearch && matchKelas && matchUnit;
  });

  return (
    <div className="page-content-wrapper">
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '5px solid #047857' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Settings size={26} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Konfigurasi Unit & Database Lembaga
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Atur akun pengampu unit, jadwal sesi, data siswa, identitas madrasah, dan cadangan data.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setShowAddSiswaModal(true)}>
              <UserPlus size={16} />
              <span>+ Siswa Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0px', overflowX: 'auto' }}>
        <button
          className={`btn ${activeSubTab === 'pengampu-akun' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('pengampu-akun')}
          style={{ borderRadius: '10px 10px 0 0', borderBottom: 'none' }}
        >
          <Users size={16} />
          <span>Atur Akun Pengampu & Pegawai</span>
        </button>

        <button
          className={`btn ${activeSubTab === 'jadwal-sesi' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('jadwal-sesi')}
          style={{ borderRadius: '10px 10px 0 0', borderBottom: 'none' }}
        >
          <Clock size={16} />
          <span>Jadwal Sesi Presensi</span>
        </button>

        <button
          className={`btn ${activeSubTab === 'tambah-siswa' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('tambah-siswa')}
          style={{ borderRadius: '10px 10px 0 0', borderBottom: 'none' }}
        >
          <GraduationCap size={16} />
          <span>Kelola Data Siswa Unit</span>
        </button>

        <button
          className={`btn ${activeSubTab === 'lembaga' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('lembaga')}
          style={{ borderRadius: '10px 10px 0 0', borderBottom: 'none' }}
        >
          <Building2 size={16} />
          <span>Identitas Lembaga</span>
        </button>

        <button
          className={`btn ${activeSubTab === 'backup' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('backup')}
          style={{ borderRadius: '10px 10px 0 0', borderBottom: 'none' }}
        >
          <Database size={16} />
          <span>Cadangan Database</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. ATUR AKUN PENGAMPU (USTADZ / MUSYRIF / PEGAWAI) */}
      {/* ========================================================= */}
      {activeSubTab === 'pengampu-akun' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                Daftar Akun Pengampu & Pegawai ({filteredGuruList.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Tersinkronisasi langsung dengan Menu <strong>Data Pegawai</strong>. Admin dapat mengelola penugasan unit, NIP, status akun, dan kata sandi.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddPengampuModal(true)}>
              <Plus size={16} />
              <span>+ Tambah Akun Pengampu Baru</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Cari nama guru, NIP, email, atau jabatan..."
                value={searchTermGuru}
                onChange={(e) => setSearchTermGuru(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} color="#64748b" />
              <select
                className="form-select"
                value={selectedFilterUnit}
                onChange={(e) => setSelectedFilterUnit(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem', minWidth: '180px' }}
              >
                <option value="Semua Unit">Semua Unit ({guruList.length})</option>
                <option value="MA IHYA' AS-SUNNAH">MA IHYA' AS-SUNNAH</option>
                <option value="SMP IT IHYA' AS-SUNNAH">SMP IT IHYA' AS-SUNNAH</option>
                <option value="Pondok Pesantren PPIAS">Pondok Pesantren PPIAS</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Ustadz / Pegawai</th>
                    <th>NIP & Username</th>
                    <th>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Kata Sandi</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={handleToggleAllPasswords}
                          title={showAllPasswords ? "Sembunyikan semua kata sandi" : "Tampilkan semua kata sandi"}
                          style={{ padding: '2px 4px', color: '#64748b' }}
                        >
                          {showAllPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </th>
                    <th>Unit Satuan Lembaga</th>
                    <th>Jabatan & Tugas</th>
                    <th>Kontak WhatsApp</th>
                    <th>Status Akun</th>
                    <th style={{ textAlign: 'center' }}>Tindakan Super Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuruList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        Tidak ada akun guru/pengampu yang sesuai dengan pencarian atau filter unit.
                      </td>
                    </tr>
                  ) : (
                    filteredGuruList.map((guru) => {
                      const isAktif = guru.status !== 'Nonaktif';
                      const unitName = guru.unitSekolah || guru.unit || "MA IHYA' AS-SUNNAH";
                      const pMatch = pengampuList.find(p => p.nama === guru.nama || p.email === guru.email);
                      const halaqahName = guru.halaqahNama || (pMatch ? pMatch.halaqahNama : null);
                      const pwd = guru.password || (pMatch ? pMatch.password : 'bismillah123');
                      const visible = isPasswordVisible(guru.id);

                      return (
                        <tr key={guru.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: guru.avatarBg || (guru.lp === 'P' ? '#ccfbf1' : '#dcfce7'),
                                color: guru.lp === 'P' ? '#0f766e' : '#15803d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                flexShrink: 0
                              }}>
                                {guru.initial || (guru.nama ? guru.nama.charAt(0).toUpperCase() : 'G')}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>{guru.nama}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{guru.email || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>NIP: {guru.nip || 'NON-NIP'}</span>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>User: @{guru.username || (guru.email ? guru.email.split('@')[0] : '-')}</div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <code style={{
                                background: '#f8fafc',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#0f172a',
                                border: '1px solid #e2e8f0',
                                letterSpacing: visible ? 'normal' : '2px',
                                minWidth: '95px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <KeyRound size={12} color="#0284c7" />
                                <span>{visible ? pwd : '••••••••'}</span>
                              </code>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => togglePasswordVisibility(guru.id)}
                                title={visible ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                                style={{ padding: '4px', color: '#64748b' }}
                              >
                                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleCopyPassword(pwd, guru.nama)}
                                title="Salin kata sandi"
                                style={{ padding: '4px', color: '#0284c7' }}
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: unitName.includes('SMP') ? '#f0fdf4' : '#eff6ff',
                              color: unitName.includes('SMP') ? '#166534' : '#1e40af',
                              border: `1px solid ${unitName.includes('SMP') ? '#bbf7d0' : '#bfdbfe'}`
                            }}>
                              <School size={13} />
                              {unitName}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{guru.jabatan || 'Pengampu Tahfidz'}</span>
                              {halaqahName && (
                                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                                  ?? {halaqahName}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {guru.noHp || guru.kontak ? (
                              <a
                                href={`https://wa.me/${(guru.noHp || guru.kontak).replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#16a34a', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}
                              >
                                <Phone size={13} />
                                {guru.noHp || guru.kontak}
                              </a>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                            )}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isAktif ? '#dcfce7' : '#fee2e2',
                              color: isAktif ? '#15803d' : '#b91c1c'
                            }}>
                              {isAktif ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                title={isAktif ? "Nonaktifkan Akun" : "Aktifkan Akun"}
                                onClick={() => handleToggleStatusPengampu(guru)}
                                style={{ color: isAktif ? '#eab308' : '#16a34a', padding: '6px' }}
                              >
                                <Power size={15} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                title="Reset Password"
                                onClick={() => {
                                  setResetPassModal({ ...guru, currentPass: pwd });
                                  setCustomPassword(pwd);
                                }}
                                style={{ color: '#0284c7', padding: '6px' }}
                              >
                                <KeyRound size={15} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                title="Edit Akun Guru"
                                onClick={() => {
                                  setEditingPengampu({ ...guru, password: pwd });
                                  setShowEditPassword(false);
                                }}
                                style={{ color: '#6366f1', padding: '6px' }}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                title="Hapus Guru"
                                onClick={() => handleDeletePengampu(guru.id, guru.nama)}
                                style={{ color: '#ef4444', padding: '6px' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ATUR JADWAL ABSENSI PENGAMPU */}
      {/* ========================================================= */}
      {activeSubTab === 'jadwal-sesi' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>Master Jadwal Sesi Presensi</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Atur rentang jam kerja dan shift presensi Ustadz Pembina. Sesi nonaktif tidak akan muncul di form absensi.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddSesiModal(true)}>
              <Plus size={16} />
              <span>+ Tambah Sesi Presensi</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {sesiList.map(sesi => {
              const isAktif = sesi.status === 'AKTIF' || (sesi.aktif !== false && sesi.status !== 'NONAKTIF');
              const jamMulai = sesi.mulai || sesi.jamMulai || '05:00';
              const jamSelesai = sesi.selesai || sesi.jamSelesai || '06:30';
              return (
                <div 
                  key={sesi.id} 
                  className="card" 
                  style={{ 
                    borderLeft: `4px solid ${isAktif ? '#10b981' : '#94a3b8'}`,
                    opacity: isAktif ? 1 : 0.65,
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color={isAktif ? '#10b981' : '#94a3b8'} />
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{sesi.nama}</h4>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        background: isAktif ? '#ecfdf5' : '#f1f5f9',
                        color: isAktif ? '#059669' : '#64748b'
                      }}
                    >
                      {isAktif ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b' }}>
                      <Clock size={13} color="#64748b" />
                      <span>Jam Operasional: <strong>{jamMulai} - {jamSelesai}</strong></span>
                    </div>
                    {(sesi.labelWaktu || sesi.deskripsi) && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        {sesi.deskripsi || sesi.labelWaktu}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleEditSesi(sesi)}
                      style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#0d9488' }}
                      title="Edit Sesi Presensi"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggleStatusSesi(sesi)}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      <Power size={12} />
                      <span>{isAktif ? 'Nonaktifkan' : 'Aktifkan'}</span>
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDeleteSesi(sesi.id, sesi.nama)}
                      style={{ color: '#ef4444', padding: '4px 8px' }}
                      title="Hapus Sesi"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h4 style={{ margin: '0 0 6px 0', color: '#166534', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Aturan Toleransi Keterlambatan
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#14532d' }}>
              Sistem menghitung status presensi secara otomatis: Absensi tepat waktu jika dilakukan dalam rentang jam sesi atau maksimal toleransi batas dispensasi yang diatur di bawah.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Toleransi Keterlambatan:</label>
              <input 
                type="number" 
                className="form-input" 
                style={{ width: '80px', padding: '4px 8px' }} 
                value={formData.toleransiKeterlambatan || 15}
                onChange={(e) => setFormData({ ...formData, toleransiKeterlambatan: parseInt(e.target.value) || 15 })}
              />
              <span style={{ fontSize: '0.85rem' }}>menit</span>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (onSaveSettings) onSaveSettings(formData);
                  notify('Pengaturan toleransi keterlambatan disimpan!');
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. KELOLA DATA SISWA UNIT (SINKRON DENGAN DATA SISWA) */}
      {/* ========================================================= */}
      {activeSubTab === 'tambah-siswa' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                Kelola Data Siswa Unit ({filteredSiswaList.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Tersinkronisasi langsung dengan Menu <strong>Data Siswa</strong>. Mengatur pembagian kelas ('X A' s/d 'XII B'), Unit Lembaga, dan Guru Pengampu / Wali Kelas.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddSiswaModal(true)}>
              <UserPlus size={16} />
              <span>+ Daftarkan Siswa Baru</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Cari nama siswa, NISN, NIK, atau nama guru pengampu..."
                value={searchTermSiswa}
                onChange={(e) => setSearchTermSiswa(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} color="#64748b" />
              <select
                className="form-select"
                value={selectedFilterKelas}
                onChange={(e) => setSelectedFilterKelas(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem', minWidth: '150px' }}
              >
                <option value="Semua Kelas">Semua Kelas</option>
                <option value="X A">Kelas X A</option>
                <option value="X B">Kelas X B</option>
                <option value="XI A">Kelas XI A</option>
                <option value="XI B">Kelas XI B</option>
                <option value="XII A">Kelas XII A</option>
                <option value="XII B">Kelas XII B</option>
              </select>

              <select
                className="form-select"
                value={selectedFilterUnit}
                onChange={(e) => setSelectedFilterUnit(e.target.value)}
                style={{ height: '38px', fontSize: '0.85rem', minWidth: '180px' }}
              >
                <option value="Semua Unit">Semua Unit</option>
                <option value="MA IHYA' AS-SUNNAH">MA IHYA' AS-SUNNAH</option>
                <option value="SMP IT IHYA' AS-SUNNAH">SMP IT IHYA' AS-SUNNAH</option>
                <option value="Pondok Pesantren PPIAS">Pondok Pesantren PPIAS</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                    <th>Nama Siswa & NIK</th>
                    <th style={{ width: '55px', textAlign: 'center' }}>L/P</th>
                    <th>NISN</th>
                    <th>Kelas</th>
                    <th>Unit Sekolah</th>
                    <th>Guru Pengampu (Wali Kelas)</th>
                    <th>Wali & Kontak</th>
                    <th style={{ textAlign: 'center' }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswaList.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        Tidak ada data siswa yang cocok dengan filter atau pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSiswaList.map((siswa, idx) => {
                      const unitName = siswa.unitSekolah || "MA IHYA' AS-SUNNAH";
                      const pengampuName = siswa.pengampu || getWaliForKelas(siswa.kelas);

                      return (
                        <tr key={siswa.id || idx}>
                          <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div>
                              <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.9rem' }}>{siswa.nama}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>NIK: {siswa.nik || '-'}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: siswa.lp === 'P' ? '#fce7f3' : '#e0f2fe',
                              color: siswa.lp === 'P' ? '#be185d' : '#0369a1'
                            }}>
                              {siswa.lp || 'L'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155' }}>
                              {siswa.nisn || '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1'
                            }}>
                              {siswa.kelas || '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: unitName.includes('SMP') ? '#f0fdf4' : '#eff6ff',
                              color: unitName.includes('SMP') ? '#166534' : '#1e40af',
                              border: `1px solid ${unitName.includes('SMP') ? '#bbf7d0' : '#bfdbfe'}`
                            }}>
                              <School size={12} />
                              {unitName}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#ecfdf5',
                                color: '#047857',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                ??
                              </div>
                              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                                {pengampuName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem' }}>
                              <div style={{ color: '#334155', fontWeight: 600 }}>{siswa.wali || siswa.namaWali || '-'}</div>
                              {siswa.kontakWali ? (
                                <a
                                  href={`https://wa.me/${siswa.kontakWali.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: '#16a34a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                                >
                                  <Phone size={11} /> {siswa.kontakWali}
                                </a>
                              ) : null}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                title="Edit Data Siswa"
                                onClick={() => setEditingSiswa(siswa)}
                                style={{ color: '#6366f1', padding: '6px' }}
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                title="Hapus Siswa"
                                onClick={() => handleDeleteSiswa(siswa.id, siswa.nama)}
                                style={{ color: '#ef4444', padding: '6px' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. IDENTITAS LEMBAGA */}
      {/* ========================================================= */}
      {activeSubTab === 'lembaga' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Identitas Pesantren / Madrasah</h3>
            <form onSubmit={handleSaveLembaga}>
              <div className="form-group">
                <label className="form-label">Nama Lembaga Utama *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={formData.namaMadrasah || ''} 
                  onChange={(e) => setFormData({ ...formData, namaMadrasah: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sub-Judul / Nama Satuan Pendidikan</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.subJudulLembaga || ''} 
                  onChange={(e) => setFormData({ ...formData, subJudulLembaga: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Lengkap</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.alamatMadrasah || ''} 
                  onChange={(e) => setFormData({ ...formData, alamatMadrasah: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telepon / WhatsApp</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.teleponMadrasah || ''} 
                    onChange={(e) => setFormData({ ...formData, teleponMadrasah: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Lembaga</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={formData.emailMadrasah || ''} 
                    onChange={(e) => setFormData({ ...formData, emailMadrasah: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Kepala Madrasah / Mudir</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.kepalaMadrasah || ''} 
                    onChange={(e) => setFormData({ ...formData, kepalaMadrasah: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Koordinator Tahfidz</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.koordinatorTahfidz || ''} 
                    onChange={(e) => setFormData({ ...formData, koordinatorTahfidz: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                <Save size={16} />
                <span>Simpan Perubahan Identitas</span>
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Kartu Daftar Unit Satuan Pendidikan Resmi */}
            <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Building2 size={22} color="#0284c7" />
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  Unit Satuan Lembaga (PPIAS)
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                Daftar unit resmi yang terdaftar dan terintegrasi di Tahfidz HUB:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Unit 1: MA */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#1e3a8a', fontSize: '0.9rem' }}>1. MA IHYA' AS-SUNNAH</strong>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      KEMENAG
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Tingkat Aliyah / SMA ? Kelas X, XI, XII (A/B) ? Muatan Kurikulum Tahfidz & Kepesantrenan
                  </div>
                </div>

                {/* Unit 2: SMP IT */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#065f46', fontSize: '0.9rem' }}>2. SMP IT IHYA' AS-SUNNAH</strong>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      KEMENDIKBUD
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Tingkat Tsanawiyah / SMP ? Terpadu Islam & Tahsin Al-Qur'an
                  </div>
                </div>

                {/* Unit 3: Pondok Pesantren */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#9a3412', fontSize: '0.9rem' }}>3. Pondok Pesantren PPIAS</strong>
                    <span style={{ background: '#ffedd5', color: '#c2410c', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      SALAF/MUADALAH
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Pondok Pesantren Persatuan Islam As-Sunnah ? Asrama & Halaqah Al-Qur'an
                  </div>
                </div>
              </div>
            </div>

            {/* Preview KOP Rapor */}
            <div className="card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FileCheck size={18} color="#047857" />
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#047857', fontWeight: 800 }}>Pratinjau KOP Surat & Rapor</h4>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>
                Tampilan header yang tercetak di dokumen Rapor Tahfiz dan rekap mutabaah siswa:
              </p>
              <div style={{
                background: '#ffffff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  letterSpacing: '1px',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  {formData.subJudulLembaga || "MA IHYA' AS-SUNNAH TASIKMALAYA"}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  color: '#047857',
                  margin: '4px 0 2px 0'
                }}>
                  {formData.namaMadrasah || "PESANTREN PERSATUAN ISLAM AS-SUNNAH"}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {formData.alamatMadrasah || "Jl. Terusan Paseh No. 11B, Tasikmalaya"}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  Telp: {formData.teleponMadrasah || "-"} | Email: {formData.emailMadrasah || "-"}
                </div>
                <div style={{ borderBottom: '3px double #047857', marginTop: '12px', marginBottom: '8px' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. BACKUP & RESTORE */}
      {/* ========================================================= */}
      {activeSubTab === 'backup' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#166534' }}>Cadangkan Database (Backup JSON)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Unduh seluruh database sistem (santri, akun pengampu, jadwal sesi, setoran, absensi) ke berkas JSON lokal.
            </p>
            <button className="btn btn-primary" onClick={() => storageService.exportBackupJSON()}>
              <Download size={16} />
              <span>Unduh File Cadangan (JSON)</span>
            </button>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#0284c7' }}>Pulihkan Database (Restore JSON)</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Pulihkan database dari file backup JSON sebelumnya.
            </p>
            <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <Upload size={16} />
              <span>Pilih File Cadangan JSON</span>
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileRestore} />
            </label>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* MODAL 1: TAMBAH AKUN PENGAMPU */}
      {showAddPengampuModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Tambah Akun Pengampu Baru</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddPengampuModal(false)}>?</button>
            </div>
            <form onSubmit={handleAddPengampuSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Ustadz *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      placeholder="Contoh: Ustadz Fulan, Lc"
                      value={newPengampu.nama}
                      onChange={(e) => setNewPengampu({ ...newPengampu, nama: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NIP (Nomor Induk Pegawai)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: 19880101201501"
                      value={newPengampu.nip}
                      onChange={(e) => setNewPengampu({ ...newPengampu, nip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Unit Satuan Lembaga *</label>
                    <select
                      className="form-select"
                      value={newPengampu.unitSekolah}
                      onChange={(e) => setNewPengampu({ ...newPengampu, unitSekolah: e.target.value })}
                    >
                      <option value="MA IHYA' AS-SUNNAH">MA IHYA' AS-SUNNAH</option>
                      <option value="SMP IT IHYA' AS-SUNNAH">SMP IT IHYA' AS-SUNNAH</option>
                      <option value="Pondok Pesantren PPIAS">Pondok Pesantren PPIAS</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jabatan / Penugasan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: Wali Kelas X A / Guru Tahfidz"
                      value={newPengampu.jabatan}
                      onChange={(e) => setNewPengampu({ ...newPengampu, jabatan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username Login (Email) *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="contoh: ustadz.fulan@ihya.sch.id"
                      value={newPengampu.email || newPengampu.username}
                      onChange={(e) => setNewPengampu({ ...newPengampu, username: e.target.value, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password Awal *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={newPengampu.password}
                      onChange={(e) => setNewPengampu({ ...newPengampu, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="08xxxxxxxxx"
                      value={newPengampu.noHp}
                      onChange={(e) => setNewPengampu({ ...newPengampu, noHp: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Kelompok Halaqah</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Halaqah Ustadz Fulan"
                      value={newPengampu.halaqahNama}
                      onChange={(e) => setNewPengampu({ ...newPengampu, halaqahNama: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lokasi Mengajar / Presensi</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newPengampu.lokasi}
                    onChange={(e) => setNewPengampu({ ...newPengampu, lokasi: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddPengampuModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT AKUN PENGAMPU */}
      {editingPengampu && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Edit Data Guru / Pengampu: {editingPengampu.nama}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingPengampu(null)}>?</button>
            </div>
            <form onSubmit={handleUpdatePengampuSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Ustadz *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editingPengampu.nama}
                      onChange={(e) => setEditingPengampu({ ...editingPengampu, nama: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NIP</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingPengampu.nip || ''}
                      onChange={(e) => setEditingPengampu({ ...editingPengampu, nip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Unit Satuan Lembaga *</label>
                    <select
                      className="form-select"
                      value={editingPengampu.unitSekolah || editingPengampu.unit || "MA IHYA' AS-SUNNAH"}
                      onChange={(e) => setEditingPengampu({ ...editingPengampu, unitSekolah: e.target.value, unit: e.target.value })}
                    >
                      <option value="MA IHYA' AS-SUNNAH">MA IHYA' AS-SUNNAH</option>
                      <option value="SMP IT IHYA' AS-SUNNAH">SMP IT IHYA' AS-SUNNAH</option>
                      <option value="Pondok Pesantren PPIAS">Pondok Pesantren PPIAS</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jabatan / Penugasan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingPengampu.jabatan || editingPengampu.role || ''}
                      onChange={(e) => setEditingPengampu({ ...editingPengampu, jabatan: e.target.value, role: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email / Username Login</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingPengampu.email || editingPengampu.username || ''}
                      onChange={(e) => setEditingPengampu({ ...editingPengampu, email: e.target.value, username: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password / Kata Sandi</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showEditPassword ? "text" : "password"} 
                        className="form-input" 
                        value={editingPengampu.password || ''}
                        onChange={(e) => setEditingPengampu({ ...editingPengampu, password: e.target.value })}
                        placeholder="Kata sandi akun"
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                        title={showEditPassword ? "Sembunyikan password" : "Lihat password"}
                      >
                        {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingPengampu.noHp || editingPengampu.kontak || ''}
                      onChange={(e) => setEditingPengampu({ ...editingPengampu, noHp: e.target.value, kontak: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Kelompok Halaqah</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingPengampu.halaqahNama || ''}
                      onChange={(e) => setEditingPengampu({ ...editingPengampu, halaqahNama: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingPengampu(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD PENGAMPU */}
      {resetPassModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Reset Password Akun</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setResetPassModal(null)}>?</button>
            </div>
            <form onSubmit={handleResetPasswordSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
                  Atur ulang kata sandi login untuk Ustadz <strong>{resetPassModal.nama}</strong>.
                </p>

                <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Password Saat Ini:</span>
                  <code style={{ fontWeight: 700, color: '#0f172a', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    {resetPassModal.currentPass || 'bismillah123'}
                  </code>
                </div>

                <div className="form-group">
                  <label className="form-label">Kata Sandi Baru</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      *Default: bismillah123
                    </small>
                    <button 
                      type="button" 
                      className="btn btn-ghost btn-xs"
                      onClick={() => setCustomPassword('bismillah123')}
                      style={{ fontSize: '0.72rem', color: '#0284c7' }}
                    >
                      Gunakan Default
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setResetPassModal(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TAMBAH SESI PRESENSI */}
      {showAddSesiModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Tambah Sesi Presensi Baru</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddSesiModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSesiSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Sesi Presensi *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Contoh: Sholat Ashar & Setoran Sore"
                    value={newSesi.nama}
                    onChange={(e) => setNewSesi({ ...newSesi, nama: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Jam Mulai *</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      required 
                      value={newSesi.jamMulai}
                      onChange={(e) => setNewSesi({ ...newSesi, jamMulai: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jam Selesai *</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      required 
                      value={newSesi.jamSelesai}
                      onChange={(e) => setNewSesi({ ...newSesi, jamSelesai: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Awal</label>
                  <select 
                    className="form-select"
                    value={newSesi.status}
                    onChange={(e) => setNewSesi({ ...newSesi, status: e.target.value })}
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddSesiModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Sesi Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SESI PRESENSI */}
      {editingSesi && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Edit Sesi: {editingSesi.nama}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingSesi(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateSesiSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nama Sesi Presensi *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={editingSesi.nama}
                    onChange={(e) => setEditingSesi({ ...editingSesi, nama: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Jam Mulai *</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      required 
                      value={editingSesi.jamMulai}
                      onChange={(e) => setEditingSesi({ ...editingSesi, jamMulai: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jam Selesai *</label>
                    <input 
                      type="time" 
                      className="form-input" 
                      required 
                      value={editingSesi.jamSelesai}
                      onChange={(e) => setEditingSesi({ ...editingSesi, jamSelesai: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Sesi</label>
                  <select 
                    className="form-select"
                    value={editingSesi.status}
                    onChange={(e) => setEditingSesi({ ...editingSesi, status: e.target.value })}
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingSesi(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DAFTARKAN SISWA UNIT BARU */}
      {showAddSiswaModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Pendaftaran Siswa Baru Unit</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddSiswaModal(false)}>?</button>
            </div>
            <form onSubmit={handleAddSiswaSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Siswa *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      placeholder="Contoh: Muhammad Raihan Pratama"
                      value={newSiswa.nama}
                      onChange={(e) => setNewSiswa({ ...newSiswa, nama: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NISN / Nomor Induk Siswa *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      placeholder="Contoh: 0089234123"
                      value={newSiswa.nisn || newSiswa.nis || ''}
                      onChange={(e) => setNewSiswa({ ...newSiswa, nisn: e.target.value, nis: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">NIK (Nomor Induk Kependudukan)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: 3204xxxxxxxxxxxx"
                      value={newSiswa.nik}
                      onChange={(e) => setNewSiswa({ ...newSiswa, nik: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select
                      className="form-select"
                      value={newSiswa.lp}
                      onChange={(e) => setNewSiswa({ ...newSiswa, lp: e.target.value })}
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kelas *</label>
                    <select
                      className="form-select"
                      value={newSiswa.kelas}
                      onChange={(e) => {
                        const k = e.target.value;
                        setNewSiswa({ ...newSiswa, kelas: k, pengampu: getWaliForKelas(k) });
                      }}
                    >
                      <option value="X A">Kelas X A (Wali: Wahyudin Hafiz, S.Pd)</option>
                      <option value="X B">Kelas X B (Wali: Febrianti Dewi, S.Pd)</option>
                      <option value="XI A">Kelas XI A (Wali: Agus Rinaldi)</option>
                      <option value="XI B">Kelas XI B (Wali: Ainun Hamidah, S.Pd)</option>
                      <option value="XII A">Kelas XII A (Wali: Feri Hermawan, S.Pd)</option>
                      <option value="XII B">Kelas XII B (Wali: Defit Purwaningsih, S.Pd)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Satuan Pendidikan *</label>
                    <select
                      className="form-select"
                      value={newSiswa.unitSekolah}
                      onChange={(e) => setNewSiswa({ ...newSiswa, unitSekolah: e.target.value })}
                    >
                      <option value="MA IHYA' AS-SUNNAH">MA IHYA' AS-SUNNAH</option>
                      <option value="SMP IT IHYA' AS-SUNNAH">SMP IT IHYA' AS-SUNNAH</option>
                      <option value="Pondok Pesantren PPIAS">Pondok Pesantren PPIAS</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Guru Pengampu (Wali Kelas / Asatidzah) *</label>
                  <select
                    className="form-select"
                    value={newSiswa.pengampu}
                    onChange={(e) => setNewSiswa({ ...newSiswa, pengampu: e.target.value })}
                  >
                    {daftarNamaPengampu.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    *Otomatis disinkronkan dengan Data Pegawai dan wali kelas yang bersangkutan.
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Orang Tua / Wali</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: H. Pratama"
                      value={newSiswa.wali || newSiswa.namaWali || ''}
                      onChange={(e) => setNewSiswa({ ...newSiswa, wali: e.target.value, namaWali: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp Wali Siswa</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="08xxxxxxxxx"
                      value={newSiswa.kontakWali}
                      onChange={(e) => setNewSiswa({ ...newSiswa, kontakWali: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddSiswaModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Daftarkan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDIT DATA SISWA */}
      {editingSiswa && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontWeight: 800 }}>Edit Siswa: {editingSiswa.nama}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingSiswa(null)}>?</button>
            </div>
            <form onSubmit={handleUpdateSiswaSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap Siswa *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editingSiswa.nama}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, nama: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NISN / NIS *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={editingSiswa.nisn || editingSiswa.nis || ''}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, nisn: e.target.value, nis: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">NIK (Nomor Induk Kependudukan)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingSiswa.nik || ''}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, nik: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select
                      className="form-select"
                      value={editingSiswa.lp || editingSiswa.jenisKelamin || 'L'}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, lp: e.target.value, jenisKelamin: e.target.value })}
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kelas *</label>
                    <select
                      className="form-select"
                      value={editingSiswa.kelas}
                      onChange={(e) => {
                        const k = e.target.value;
                        setEditingSiswa({ ...editingSiswa, kelas: k, pengampu: getWaliForKelas(k) });
                      }}
                    >
                      <option value="X A">Kelas X A (Wali: Wahyudin Hafiz, S.Pd)</option>
                      <option value="X B">Kelas X B (Wali: Febrianti Dewi, S.Pd)</option>
                      <option value="XI A">Kelas XI A (Wali: Agus Rinaldi)</option>
                      <option value="XI B">Kelas XI B (Wali: Ainun Hamidah, S.Pd)</option>
                      <option value="XII A">Kelas XII A (Wali: Feri Hermawan, S.Pd)</option>
                      <option value="XII B">Kelas XII B (Wali: Defit Purwaningsih, S.Pd)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit Satuan Pendidikan *</label>
                    <select
                      className="form-select"
                      value={editingSiswa.unitSekolah || "MA IHYA' AS-SUNNAH"}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, unitSekolah: e.target.value })}
                    >
                      <option value="MA IHYA' AS-SUNNAH">MA IHYA' AS-SUNNAH</option>
                      <option value="SMP IT IHYA' AS-SUNNAH">SMP IT IHYA' AS-SUNNAH</option>
                      <option value="Pondok Pesantren PPIAS">Pondok Pesantren PPIAS</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Guru Pengampu (Wali Kelas / Asatidzah) *</label>
                  <select
                    className="form-select"
                    value={editingSiswa.pengampu || ''}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, pengampu: e.target.value })}
                  >
                    {daftarNamaPengampu.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    *Pilih guru pengampu yang membimbing siswa ini. Perubahan akan langsung tersinkron ke Data Siswa.
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Orang Tua / Wali</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingSiswa.namaWali || editingSiswa.wali || ''}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, namaWali: e.target.value, wali: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp Wali</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editingSiswa.kontakWali || ''}
                      onChange={(e) => setEditingSiswa({ ...editingSiswa, kontakWali: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingSiswa(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
