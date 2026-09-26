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
  Camera,
  X
} from 'lucide-react';
import { storageService } from '../services/storage';
import PengaturanFotoProfilView from './sigap/PengaturanFotoProfilView';

export default function PengaturanAdminView({ 
  settings, 
  halaqahList, 
  santriList, 
  onSaveSettings, 
  onReload, 
  showToast,
  activeBranchId,
  initialSubTab,
  currentRole,
  isOwner
}) {
  const [cabangList, setCabangList] = useState(() => {
    const all = storageService.getCabang ? storageService.getCabang() : [];
    return all.filter(c => (c.status || 'Aktif').toLowerCase() === 'aktif');
  });

  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    return activeBranchId || 'ALL';
  });

  useEffect(() => {
    const handleUpdate = () => {
      const all = storageService.getCabang ? storageService.getCabang() : [];
      setCabangList(all.filter(c => (c.status || 'Aktif').toLowerCase() === 'aktif'));
    };
    window.addEventListener('simtah_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('simtah_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const effectiveBranchId = selectedBranchId !== 'ALL' ? selectedBranchId : (activeBranchId || storageService.getActiveBranchId());
  const currentBranch = (storageService.getCabang() || []).find(c => c.id === effectiveBranchId) || storageService.getActiveBranch() || { nama: "MA Ihya As-Sunnah" };
  const isBranchSmp = effectiveBranchId === 'cabang-smp';
  const defaultUnitSekolah = isBranchSmp ? "SMP IT IHYA' AS-SUNNAH" : "MA IHYA' AS-SUNNAH";

  const [activeSubTab, setActiveSubTab] = useState(() => {
    return localStorage.getItem('simtah_active_pengaturan_subtab') || initialSubTab || 'pengampu-akun';
  });

  useEffect(() => {
    const handleOpenFoto = () => {
      setActiveSubTab('foto-profil');
      localStorage.setItem('simtah_active_pengaturan_subtab', 'foto-profil');
    };
    const handleOpenTab = (e) => {
      if (e.detail) {
        setActiveSubTab(e.detail);
        localStorage.setItem('simtah_active_pengaturan_subtab', e.detail);
      }
    };
    window.addEventListener('sigap_open_foto_profil', handleOpenFoto);
    window.addEventListener('sigap_open_pengaturan_tab', handleOpenTab);
    return () => {
      window.removeEventListener('sigap_open_foto_profil', handleOpenFoto);
      window.removeEventListener('sigap_open_pengaturan_tab', handleOpenTab);
    };
  }, []);

  const handleSubTabChange = (newTab) => {
    setActiveSubTab(newTab);
    localStorage.setItem('simtah_active_pengaturan_subtab', newTab);
    window.dispatchEvent(new CustomEvent('sigap_open_pengaturan_tab', { detail: newTab }));
  };

  const [formData, setFormData] = useState({ ...settings });

  const [guruList, setGuruList] = useState(() => storageService.getSigapGuru(selectedBranchId === 'ALL' ? 'ALL' : selectedBranchId));
  const [pengampuList, setPengampuList] = useState(() => storageService.getPengampu(selectedBranchId === 'ALL' ? 'ALL' : selectedBranchId));
  const [siswaList, setSiswaList] = useState(() => storageService.getSigapSiswa(selectedBranchId === 'ALL' ? 'ALL' : selectedBranchId));
  const [sesiList, setSesiList] = useState(() => storageService.getSesi(selectedBranchId === 'ALL' ? 'ALL' : selectedBranchId));

  const reloadData = (branchFilter = selectedBranchId) => {
    const targetBranch = branchFilter === 'ALL' ? 'ALL' : branchFilter;
    setGuruList(storageService.getSigapGuru(targetBranch));
    setPengampuList(storageService.getPengampu(targetBranch));
    setSiswaList(storageService.getSigapSiswa(targetBranch));
    setSesiList(storageService.getSesi(targetBranch));
    if (onReload) onReload();
  };

  useEffect(() => {
    reloadData(selectedBranchId);
  }, [selectedBranchId]);

  const handleBranchFilterChange = (newBranchId) => {
    setSelectedBranchId(newBranchId);
    reloadData(newBranchId);
  };

  const [searchTermGuru, setSearchTermGuru] = useState('');
  const [searchTermSiswa, setSearchTermSiswa] = useState('');
  const [selectedFilterUnit, setSelectedFilterUnit] = useState('Semua Unit');

  const [showAddPengampuModal, setShowAddPengampuModal] = useState(false);
  const [newPengampu, setNewPengampu] = useState({
    nama: '',
    nip: '',
    username: '',
    email: '',
    noHp: '',
    unitSekolah: defaultUnitSekolah,
    jabatan: 'Guru / Pengampu',
    halaqahNama: '',
    lokasi: isBranchSmp ? 'SMP IT Raudhotul Huffaz' : 'Pesantren Persatuan Islam As-Sunnah',
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
    kelas: isBranchSmp ? 'VII SMP IT' : 'X A',
    unitSekolah: defaultUnitSekolah,
    pengampu: isBranchSmp ? 'Aminudin, A.Md' : 'Wahyudin Hafiz, S.Pd',
    tglLahir: '',
    wali: '',
    kontakWali: '',
    targetJuz: 10
  });

  const [editingSiswa, setEditingSiswa] = useState(null);

  // State Template Rapor & Aspek Kualitas Tahfidz
  const [raporTemplate, setRaporTemplate] = useState(() => storageService.getRaporTemplate());
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  useEffect(() => {
    const handleTemplateUpdate = (e) => {
      if (e.detail) setRaporTemplate(e.detail);
      else setRaporTemplate(storageService.getRaporTemplate());
    };
    window.addEventListener('simtah_rapor_template_updated', handleTemplateUpdate);
    return () => window.removeEventListener('simtah_rapor_template_updated', handleTemplateUpdate);
  }, []);

  const handleSaveRaporTemplate = async (e) => {
    if (e) e.preventDefault();
    setIsSavingTemplate(true);
    try {
      storageService.saveRaporTemplate(raporTemplate);
      notify("Template Rapor & format penilaian aspek berhasil disimpan ke Database!");
    } catch (err) {
      alert("Gagal menyimpan template: " + err.message);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleUpdateAspect = (index, field, value) => {
    const currentAspects = [...(raporTemplate.aspekPenilaian || [
      { no: 1, nama: 'Kelancaran & Daya Ingat (Al-Hifdz)', keterangan: 'Hafalan lancar, tartil, dan mutqin' },
      { no: 2, nama: 'Ahkamut Tajwid (Hukum Tajwid)', keterangan: "Ghunnah, ikhfa', dan mad diterapkan dengan baik" },
      { no: 3, nama: 'Makharijul Huruf & Shifat (Fashohah)', keterangan: 'Pengucapan huruf jelas dan fasih sesuai kaidah' },
      { no: 4, nama: 'Adab Halaqah & Tilawah', keterangan: 'Menghormati mushaf, ustadz, dan teman halaqah' }
    ])];
    if (currentAspects[index]) {
      currentAspects[index] = { ...currentAspects[index], [field]: value };
      setRaporTemplate(prev => ({ ...prev, aspekPenilaian: currentAspects }));
    }
  };

  const notify = (msg) => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else {
      alert(msg);
    }
  };

  // Real-time synchronization when schedule/session is updated from Jadwal menu or other views
  useEffect(() => {
    const handleSync = () => {
      setSesiList(storageService.getSesi(selectedBranchId === 'ALL' ? 'ALL' : selectedBranchId));
    };
    window.addEventListener('sigap_jadwal_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sigap_jadwal_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [selectedBranchId]);

  const daftarNamaPengampu = Array.from(
    new Set([
      ...guruList.map(g => g.nama),
      ...pengampuList.map(p => p.nama)
    ])
  ).filter(Boolean).sort((a, b) => a.localeCompare(b));


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
    const unit = newPengampu.unitSekolah || defaultUnitSekolah;
    const jabatan = newPengampu.jabatan || 'Guru / Pengampu';

    const guruItem = {
      nama: newPengampu.nama,
      nip: newPengampu.nip || 'NON-NIP',
      cabangId: newPengampu.cabangId || (selectedBranchId !== 'ALL' ? selectedBranchId : effectiveBranchId),
      unit,
      unitSekolah: unit,
      unitTag: unit.includes('SMP') ? 'SMP' : (unit.includes('MA') ? 'MA' : 'PONPES'),
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
      lokasi: newPengampu.lokasi || (isBranchSmp ? 'SMP IT Raudhotul Huffaz' : 'Pesantren Persatuan Islam As-Sunnah'),
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
      unitSekolah: defaultUnitSekolah,
      jabatan: 'Guru / Pengampu',
      halaqahNama: '',
      lokasi: isBranchSmp ? 'SMP IT Raudhotul Huffaz' : 'Pesantren Persatuan Islam As-Sunnah',
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

  const handleDeletePengampu = (guruOrId, fallbackNama = '') => {
    const guruObj = (guruOrId && typeof guruOrId === 'object') ? guruOrId : { id: guruOrId, nama: fallbackNama };
    const displayName = guruObj.nama || guruObj.id || fallbackNama;
    if (window.confirm(`Yakin ingin menghapus guru/pengampu "${displayName}" dari sistem Unit dan Data Pegawai?`)) {
      storageService.deletePengampu(guruObj);
      storageService.deleteSigapGuru(guruObj);
      reloadData();
      notify(`Data guru/pengampu ${displayName} berhasil dihapus.`);
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
      cabangId: newSesi.cabangId || (selectedBranchId !== 'ALL' ? selectedBranchId : 'ALL'),
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

  const handleDeleteSesi = (sesiOrId, fallbackNama = '') => {
    const sObj = (sesiOrId && typeof sesiOrId === 'object') ? sesiOrId : { id: sesiOrId, nama: fallbackNama };
    const displayName = sObj.nama || sObj.id || fallbackNama;
    if (window.confirm(`Hapus sesi "${displayName}"? Perubahan ini akan otomatis tersinkron ke Menu Jadwal.`)) {
      storageService.deleteSesi(sObj);
      reloadData();
      notify(`Sesi ${displayName} berhasil dihapus.`);
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

    const targetBranch = newSiswa.cabangId || (selectedBranchId !== 'ALL' ? selectedBranchId : effectiveBranchId);
    const payload = {
      ...newSiswa,
      cabangId: targetBranch,
      nama: newSiswa.nama.trim(),
      nisn: newSiswa.nisn.trim(),
      nik: newSiswa.nik || '',
      lp: newSiswa.lp || 'L',
      kelas: newSiswa.kelas || (isBranchSmp ? 'VII SMP IT' : 'X A'),
      unitSekolah: newSiswa.unitSekolah || defaultUnitSekolah,
      pengampu: newSiswa.pengampu || daftarNamaPengampu[0] || (isBranchSmp ? 'Aminudin, A.Md' : 'Wahyudin Hafiz, S.Pd'),
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
      kelas: isBranchSmp ? 'VII SMP IT' : 'X A',
      unitSekolah: defaultUnitSekolah,
      pengampu: daftarNamaPengampu[0] || (isBranchSmp ? 'Aminudin, A.Md' : 'Wahyudin Hafiz, S.Pd'),
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
      pengampu: editingSiswa.pengampu || daftarNamaPengampu[0] || ''
    };

    storageService.updateSigapSiswa(editingSiswa.id, payload);
    reloadData();
    setEditingSiswa(null);
    notify(`Data siswa ${payload.nama} berhasil diperbarui di Unit & Data Siswa!`);
  };

  const handleDeleteSiswa = (siswaOrId, fallbackNama = '') => {
    const sObj = (siswaOrId && typeof siswaOrId === 'object') ? siswaOrId : { id: siswaOrId, nama: fallbackNama };
    const displayName = sObj.nama || sObj.id || fallbackNama;
    if (window.confirm(`Hapus data siswa "${displayName}" dari Unit dan Data Siswa?`)) {
      storageService.deleteSigapSiswa(sObj);
      storageService.deleteSantri(sObj);
      reloadData();
      notify(`Data siswa ${displayName} berhasil dihapus.`);
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
    const targetBranchId = selectedBranchId === 'ALL' ? (cabangList[0]?.id || 'cabang-pusat') : selectedBranchId;
    if (targetBranchId) {
      storageService.saveCabang({
        id: targetBranchId,
        nama: formData.namaMadrasah,
        alamat: formData.alamatMadrasah,
        noHp: formData.teleponMadrasah,
        email: formData.emailMadrasah,
        penanggungJawab: formData.namaKepalaMadrasah
      });
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
  // FILTERED LISTS (DENGAN DEDUPLIKASI KETAT & FILTER CABANG AKTIF)
  // ==========================================
  const rawFilteredGuruList = guruList.filter(g => {
    const term = searchTermGuru.toLowerCase().trim();
    const matchSearch = !term ||
      (g.nama && g.nama.toLowerCase().includes(term)) ||
      (g.nip && g.nip.toLowerCase().includes(term)) ||
      (g.email && g.email.toLowerCase().includes(term)) ||
      (g.username && g.username.toLowerCase().includes(term)) ||
      (g.jabatan && g.jabatan.toLowerCase().includes(term)) ||
      (g.halaqahNama && g.halaqahNama.toLowerCase().includes(term));

    const gBranch = g.cabangId || (g.unitSekolah?.includes('SMP') || g.unitTag?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
    const matchBranch = selectedBranchId === 'ALL' || gBranch === selectedBranchId;

    return matchSearch && matchBranch;
  });

  const filteredGuruList = [];
  const seenGuruKeys = new Set();
  for (const g of rawFilteredGuruList) {
    const key = (g.nip || g.username || g.id || g.nama || '').toLowerCase().trim();
    if (!seenGuruKeys.has(key)) {
      seenGuruKeys.add(key);
      filteredGuruList.push(g);
    }
  }

  const rawFilteredSiswaList = siswaList.filter(s => {
    const term = searchTermSiswa.toLowerCase().trim();
    const matchSearch = !term ||
      (s.nama && s.nama.toLowerCase().includes(term)) ||
      (s.nik && s.nik.toLowerCase().includes(term)) ||
      (s.nisn && s.nisn.toLowerCase().includes(term)) ||
      (s.pengampu && s.pengampu.toLowerCase().includes(term));

    const sBranch = s.cabangId || (s.unitSekolah?.includes('SMP') ? 'cabang-smp' : 'cabang-pusat');
    const matchBranch = selectedBranchId === 'ALL' || sBranch === selectedBranchId;

    return matchSearch && matchBranch;
  });

  const filteredSiswaList = [];
  const seenSiswaKeys = new Set();
  for (const s of rawFilteredSiswaList) {
    const key = (s.nis || s.nisn || s.nik || s.id || s.nama || '').toLowerCase().trim();
    if (!seenSiswaKeys.has(key)) {
      seenSiswaKeys.add(key);
      filteredSiswaList.push(s);
    }
  }

  const filteredSesiList = sesiList.filter(sesi => {
    if (selectedBranchId === 'ALL') return true;
    return !sesi.cabangId || sesi.cabangId === 'ALL' || sesi.cabangId === selectedBranchId;
  });

  const SUBTAB_META = {
    'pengampu-akun': {
      title: 'Akun Pegawai & Pengampu',
      desc: 'Kelola akun guru, musyrif halaqah, staf TU, kredensial login, dan penugasan halaqah.',
      icon: Users,
      color: '#059669',
      bg: '#ecfdf5'
    },
    'foto-profil': {
      title: 'Pengaturan Foto Profil',
      desc: 'Kelola foto profil akun pimpinan yayasan, super admin cabang, pengampu, dan santri.',
      icon: Camera,
      color: '#7c3aed',
      bg: '#ede9fe'
    },
    'jadwal-sesi': {
      title: 'Jadwal Sesi KBM & Halaqah',
      desc: 'Atur jadwal sesi waktu kegiatan belajar mengajar, halaqah Qur\'an, dan toleransi absensi.',
      icon: Clock,
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    'tambah-siswa': {
      title: 'Data Siswa & Pendaftaran',
      desc: 'Manajemen data santri aktif, nomor induk (NIS/NISN), kelas, dan status data siswa.',
      icon: GraduationCap,
      color: '#d97706',
      bg: '#fef3c7'
    },
    'template-rapor': {
      title: 'Format & Template Rapor',
      desc: 'Kustomisasi kriteria penilaian capaian tahfidz, predikat mutu, dan format cetak rapor.',
      icon: FileCheck,
      color: '#8b5cf6',
      bg: '#f3e8ff'
    },
    'lembaga': {
      title: 'Profil Lembaga & Unit Cabang',
      desc: 'Informasi identitas madrasah, alamat resmi, kontak pimpinan, dan legalitas unit.',
      icon: Building2,
      color: '#2563eb',
      bg: '#eff6ff'
    },
    'backup': {
      title: 'Backup & Database Sistem',
      desc: 'Cadangkan data database, unduh file backup JSON lokal, dan sinkronisasi server PostgreSQL.',
      icon: Database,
      color: '#0d9488',
      bg: '#ccfbf1'
    }
  };

  const currentTabInfo = SUBTAB_META[activeSubTab] || SUBTAB_META['pengampu-akun'];
  const HeaderIcon = currentTabInfo.icon || Settings;

  return (
    <div className="page-content-wrapper">
      {/* Header Banner - Sesuai Sub-Menu yang Dipilih di Sidebar */}
      <div className="card" style={{ marginBottom: '20px', borderLeft: `5px solid ${currentTabInfo.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: currentTabInfo.bg,
              color: currentTabInfo.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <HeaderIcon size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.20rem', fontWeight: 800, color: '#0f172a' }}>
                {currentTabInfo.title}
              </h2>
              <p className="owner-desc-text" style={{ margin: '2px 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
                {currentTabInfo.desc}
              </p>
            </div>
          </div>

          {/* Quick Active Branch Filter Selector in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Building2 size={16} color="#0d9488" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Cabang Aktif:</span>
            <select
              className="form-select"
              value={selectedBranchId}
              onChange={(e) => handleBranchFilterChange(e.target.value)}
              style={{
                height: '34px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0f172a',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">🌐 Semua Cabang Aktif ({cabangList.length})</option>
              {cabangList.map(c => (
                <option key={c.id} value={c.id}>
                  📍 {c.nama} ({c.kode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 0. PENGATURAN FOTO PROFIL (SUPER ADMIN, ADMIN CABANG, PENGAMPU) */}
      {/* ========================================================= */}
      {activeSubTab === 'foto-profil' && (
        <PengaturanFotoProfilView 
          showToast={showToast} 
          currentRole={currentRole} 
          isOwner={isOwner}
          selectedBranchId={selectedBranchId}
          onBranchChange={handleBranchFilterChange}
        />
      )}

      {/* ========================================================= */}
      {/* 1. ATUR AKUN PENGAMPU (USTADZ / MUSYRIF / PEGAWAI) */}
      {/* ========================================================= */}
      {activeSubTab === 'pengampu-akun' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '14px' }}>
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
              <Building2 size={16} color="#059669" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Filter Cabang:</span>
              <select
                className="form-select"
                value={selectedBranchId}
                onChange={(e) => handleBranchFilterChange(e.target.value)}
                style={{ height: '38px', fontSize: '0.84rem', minWidth: '220px', fontWeight: 700, borderColor: '#059669', background: '#ecfdf5', color: '#065f46' }}
              >
                <option value="ALL">🌐 Semua Cabang Aktif ({cabangList.length})</option>
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
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
                                onClick={() => handleDeletePengampu(guru)}
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
              <h3 style={{ margin: 0, fontWeight: 500, fontSize: '1.15rem' }}>Master Jadwal Sesi Presensi</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Atur rentang jam kerja dan shift presensi Ustadz Pembina. Sesi nonaktif tidak akan muncul di form absensi.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddSesiModal(true)}>
              <Plus size={16} />
              <span>+ Tambah Sesi Presensi</span>
            </button>
          </div>

          {/* Search & Branch Filter Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  Jadwal Sesi: <strong>{selectedBranchId === 'ALL' ? 'Semua Cabang Aktif' : (cabangList.find(c => c.id === selectedBranchId)?.nama || selectedBranchId)}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Menampilkan {filteredSesiList.length} sesi presensi terdaftar
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="#0284c7" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Filter Cabang:</span>
              <select
                className="form-select"
                value={selectedBranchId}
                onChange={(e) => handleBranchFilterChange(e.target.value)}
                style={{ height: '38px', fontSize: '0.84rem', minWidth: '220px', fontWeight: 700, borderColor: '#0284c7', background: '#f0f9ff', color: '#0369a1' }}
              >
                <option value="ALL">🌐 Semua Cabang Aktif ({cabangList.length})</option>
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {filteredSesiList.length === 0 ? (
              <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px', color: '#64748b' }}>
                Tidak ada sesi presensi yang terdaftar untuk cabang ini.
              </div>
            ) : (
              filteredSesiList.map(sesi => {
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
                      onClick={() => handleDeleteSesi(sesi)}
                      style={{ color: '#ef4444', padding: '4px 8px' }}
                      title="Hapus Sesi"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            }))}
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
              <h3 style={{ margin: 0, fontWeight: 500, fontSize: '1.15rem', color: '#0f172a' }}>
                Kelola Data Siswa Unit ({filteredSiswaList.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Tersinkronisasi langsung dengan Menu <strong>Data Siswa</strong>. Mengatur Unit Lembaga dan Guru Pengampu / Musyrif.
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
              <Building2 size={16} color="#d97706" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Filter Cabang:</span>
              <select
                className="form-select"
                value={selectedBranchId}
                onChange={(e) => handleBranchFilterChange(e.target.value)}
                style={{ height: '38px', fontSize: '0.84rem', minWidth: '220px', fontWeight: 700, borderColor: '#d97706', background: '#fffbeb', color: '#b45309' }}
              >
                <option value="ALL">🌐 Semua Cabang Aktif ({cabangList.length})</option>
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
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
                    <th>Unit Sekolah</th>
                    <th>Guru Pengampu</th>
                    <th>Wali & Kontak</th>
                    <th style={{ textAlign: 'center' }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiswaList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        Tidak ada data siswa yang cocok dengan filter atau pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSiswaList.map((siswa, idx) => {
                      const unitName = siswa.unitSekolah || "MA IHYA' AS-SUNNAH";
                      const pengampuName = siswa.pengampu || 'Ustadz Pengampu';

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
                                onClick={() => handleDeleteSiswa(siswa)}
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
      {/* ========================================================= */}
      {/* 4. IDENTITAS LEMBAGA */}
      {/* ========================================================= */}
      {activeSubTab === 'lembaga' && (
        <div>
          {/* Branch Switcher Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  Profil Identitas: <strong>{cabangList.find(c => c.id === (selectedBranchId === 'ALL' ? (cabangList[0]?.id || 'cabang-pusat') : selectedBranchId))?.nama || 'MA Ihya As-Sunnah'}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Pilih cabang aktif yang ingin diatur legalitas, alamat, kontak, dan pimpinannya
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="#2563eb" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Pilih Cabang:</span>
              <select
                className="form-select"
                value={selectedBranchId === 'ALL' ? (cabangList[0]?.id || 'cabang-pusat') : selectedBranchId}
                onChange={(e) => {
                  const bId = e.target.value;
                  handleBranchFilterChange(bId);
                  const matched = cabangList.find(c => c.id === bId);
                  if (matched) {
                    setFormData(prev => ({
                      ...prev,
                      namaMadrasah: matched.nama || prev.namaMadrasah,
                      subJudulLembaga: matched.kode ? `Unit ${matched.kode}` : prev.subJudulLembaga,
                      alamatMadrasah: matched.alamat || prev.alamatMadrasah,
                      teleponMadrasah: matched.noHp || prev.teleponMadrasah,
                      emailMadrasah: matched.email || prev.emailMadrasah,
                      namaKepalaMadrasah: matched.penanggungJawab || prev.namaKepalaMadrasah
                    }));
                  }
                }}
                style={{ height: '38px', fontSize: '0.84rem', minWidth: '220px', fontWeight: 700, borderColor: '#2563eb', background: '#eff6ff', color: '#1d4ed8' }}
              >
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                    Tingkat Aliyah / SMA • Jenjang Lanjutan • Muatan Kurikulum Tahfidz & Kepesantrenan
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
      </div>
      )}

      {/* ========================================================= */}
      {/* 5. BACKUP & RESTORE */}
      {/* ========================================================= */}
      {activeSubTab === 'backup' && (
        <div>
          {/* Branch Filter Selector Bar */}
          <div className="card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  Cakupan Backup Data: <strong>{selectedBranchId === 'ALL' ? 'Seluruh Cabang (Konsolidasi Yayasan)' : (cabangList.find(c => c.id === selectedBranchId)?.nama || selectedBranchId)}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Pilih cabang untuk mengunduh arsip JSON spesifik cabang atau seluruh yayasan
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="#0d9488" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Filter Cabang:</span>
              <select
                className="form-select"
                value={selectedBranchId}
                onChange={(e) => handleBranchFilterChange(e.target.value)}
                style={{ height: '38px', fontSize: '0.84rem', minWidth: '220px', fontWeight: 700, borderColor: '#0d9488', background: '#f0fdfa', color: '#0f766e' }}
              >
                <option value="ALL">🌐 Semua Cabang Aktif (Konsolidasi)</option>
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#166534' }}>Cadangkan Database (Backup JSON)</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                {selectedBranchId === 'ALL' 
                  ? 'Unduh seluruh database sistem konsolidasi (semua cabang) ke berkas JSON lokal.' 
                  : `Unduh database terisolasi untuk cabang ${cabangList.find(c => c.id === selectedBranchId)?.nama || selectedBranchId} ke berkas JSON lokal.`}
              </p>
              <button className="btn btn-primary" onClick={() => storageService.exportBackupJSON(selectedBranchId)}>
                <Download size={16} />
                <span>Unduh File Cadangan JSON {selectedBranchId === 'ALL' ? '(Semua Cabang)' : `(${cabangList.find(c => c.id === selectedBranchId)?.kode || 'Cabang'})`}</span>
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
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TEMPLATE & FORMAT RAPOR (SUPER ADMIN) */}
      {/* ========================================================= */}
      {activeSubTab === 'template-rapor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Branch Filter Selector Bar */}
          <div className="card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f3e8ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  Konfigurasi Rapor Cabang: <strong>{cabangList.find(c => c.id === (selectedBranchId === 'ALL' ? (cabangList[0]?.id || 'cabang-pusat') : selectedBranchId))?.nama || 'MA Ihya As-Sunnah'}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Pilih cabang aktif untuk mengatur kop surat, nama madrasah, dan format penilaian rapor
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} color="#8b5cf6" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Pilih Cabang:</span>
              <select
                className="form-select"
                value={selectedBranchId === 'ALL' ? (cabangList[0]?.id || 'cabang-pusat') : selectedBranchId}
                onChange={(e) => {
                  const bId = e.target.value;
                  handleBranchFilterChange(bId);
                  const matched = cabangList.find(c => c.id === bId);
                  if (matched) {
                    setRaporTemplate(prev => ({
                      ...prev,
                      namaMadrasah: matched.nama || prev.namaMadrasah,
                      alamat: matched.alamat || prev.alamat,
                      telepon: matched.noHp || prev.telepon,
                      email: matched.email || prev.email,
                      kepalaMadrasah: matched.penanggungJawab || prev.kepalaMadrasah
                    }));
                  }
                }}
                style={{ height: '38px', fontSize: '0.84rem', minWidth: '220px', fontWeight: 700, borderColor: '#8b5cf6', background: '#faf5ff', color: '#6d28d9' }}
              >
                {cabangList.map(c => (
                  <option key={c.id} value={c.id}>
                    📍 {c.nama} ({c.kode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#064e3b' }}>
                  Pengaturan Format & Template Rapor Tahfidz
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#047857' }}>
                  Atur format resmi Kop Rapor, nama madrasah, kontak, semester, serta 4 aspek penilaian kualitas tahfidz. Perubahan langsung tersimpan ke database PostgreSQL dan tersinkron ke cetak rapor serta penilaian musyrif pengampu.
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSaveRaporTemplate}
                disabled={isSavingTemplate}
                style={{ background: '#059669', borderColor: '#047857', padding: '10px 20px', fontWeight: 700 }}
              >
                <Save size={18} />
                <span>{isSavingTemplate ? 'Menyimpan ke Database...' : 'Simpan Perubahan ke Database'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px', alignItems: 'start' }}>
            {/* KOLOM KIRI: FORM PENGATURAN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Card 1: Kop Surat & Lembaga */}
              <div className="card" style={{ borderLeft: '4px solid #059669' }}>
                <h4 style={{ margin: '0 0 14px 0', fontWeight: 800, color: '#064e3b', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#059669" />
                  <span>Kop Surat & Identitas Lembaga</span>
                </h4>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Nama Yayasan *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={raporTemplate.namaYayasan || ''} 
                    onChange={(e) => setRaporTemplate(prev => ({ ...prev, namaYayasan: e.target.value }))}
                    placeholder="Contoh: YAYASAN IHYA AS SUNNAH TASIKMALAYA"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Nama Madrasah / Satuan Pendidikan *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={raporTemplate.namaMadrasah || ''} 
                    onChange={(e) => setRaporTemplate(prev => ({ ...prev, namaMadrasah: e.target.value }))}
                    placeholder="Contoh: MADRASAH ALIYAH IHYA AS SUNNAH"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Alamat Lengkap Lembaga *</label>
                  <textarea 
                    className="form-textarea" 
                    rows={2}
                    value={raporTemplate.alamat || ''} 
                    onChange={(e) => setRaporTemplate(prev => ({ ...prev, alamat: e.target.value }))}
                    placeholder="Alamat lengkap kampus/madrasah..."
                  />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Website</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={raporTemplate.website || ''} 
                      onChange={(e) => setRaporTemplate(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="www.ma-ihyaassunnah.sch.id"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={raporTemplate.email || ''} 
                      onChange={(e) => setRaporTemplate(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tahfidz@ma-ihyaassunnah.sch.id"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Judul Dokumen Rapor *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={raporTemplate.judulRapor || ''} 
                    onChange={(e) => setRaporTemplate(prev => ({ ...prev, judulRapor: e.target.value }))}
                    placeholder="LEMBAR EVALUASI & RAPOR TAHFIDZ AL-QUR'AN"
                  />
                </div>
              </div>

              {/* Card 2: Periode, Pejabat & Tanda Tangan */}
              <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
                <h4 style={{ margin: '0 0 14px 0', fontWeight: 800, color: '#0369a1', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#0284c7" />
                  <span>Periode, Tanda Tangan & Pejabat Rapor</span>
                </h4>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Semester & Tahun Ajaran</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={raporTemplate.semester || ''} 
                      onChange={(e) => setRaporTemplate(prev => ({ ...prev, semester: e.target.value }))}
                      placeholder="Ganjil 2026/2027"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Kota Penerbitan Rapor</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={raporTemplate.tempatTanggal || ''} 
                      onChange={(e) => setRaporTemplate(prev => ({ ...prev, tempatTanggal: e.target.value }))}
                      placeholder="Tasikmalaya"
                    />
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>Koordinator Tahfidz / Mudir</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={raporTemplate.namaMudir || ''} 
                      onChange={(e) => setRaporTemplate(prev => ({ ...prev, namaMudir: e.target.value }))}
                      placeholder="Ust. Hafizhul Qur'an, Al-Hafizh"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>NIP / NBM Koordinator</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={raporTemplate.nipMudir || ''} 
                      onChange={(e) => setRaporTemplate(prev => ({ ...prev, nipMudir: e.target.value }))}
                      placeholder="19850712 201001 1 004"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: 4 Aspek Penilaian Kualitas Tahfidz */}
              <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
                <h4 style={{ margin: '0 0 14px 0', fontWeight: 800, color: '#92400e', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#d97706" />
                  <span>Pengaturan 4 Aspek Kualitas Tahfidz (Gambar 2)</span>
                </h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Tentukan judul aspek dan template deskripsi evaluasi default untuk form penilaian musyrif:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(raporTemplate.aspekPenilaian || [
                    { no: 1, nama: 'Kelancaran & Daya Ingat (Al-Hifdz)', keterangan: 'Hafalan lancar, tartil, dan mutqin' },
                    { no: 2, nama: 'Ahkamut Tajwid (Hukum Tajwid)', keterangan: "Ghunnah, ikhfa', dan mad diterapkan dengan baik" },
                    { no: 3, nama: 'Makharijul Huruf & Shifat (Fashohah)', keterangan: 'Pengucapan huruf jelas dan fasih sesuai kaidah' },
                    { no: 4, nama: 'Adab Halaqah & Tilawah', keterangan: 'Menghormati mushaf, ustadz, dan teman halaqah' }
                  ]).map((aspek, idx) => (
                    <div key={idx} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#047857', color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {idx + 1}
                        </span>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Aspek #{idx + 1}</strong>
                      </div>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>Nama Aspek Penilaian</label>
                        <input 
                          type="text" 
                          className="form-input"
                          style={{ height: '36px', fontSize: '0.85rem', fontWeight: 600 }}
                          value={aspek.nama || ''}
                          onChange={(e) => handleUpdateAspect(idx, 'nama', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '4px' }}>Template Evaluasi / Keterangan Default</label>
                        <input 
                          type="text" 
                          className="form-input"
                          style={{ height: '36px', fontSize: '0.82rem' }}
                          value={aspek.keterangan || ''}
                          onChange={(e) => handleUpdateAspect(idx, 'keterangan', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol Simpan Footer */}
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSaveRaporTemplate}
                disabled={isSavingTemplate}
                style={{ background: '#059669', borderColor: '#047857', padding: '12px 24px', fontWeight: 800, fontSize: '0.95rem' }}
              >
                <Save size={18} />
                <span>{isSavingTemplate ? 'Sedang Menyimpan ke Database...' : '💾 Simpan Seluruh Perubahan Template ke Database'}</span>
              </button>
            </div>

            {/* KOLOM KANAN: LIVE PRATINJAU RAPOR (PERSIS GAMBAR 1 & 2) */}
            <div style={{ position: 'sticky', top: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck size={16} /> Pratinjau Langsung Rapor Cetak
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                  Realtime Preview
                </span>
              </div>

              <div 
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '12px', 
                  border: '1px solid #cbd5e1', 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)', 
                  padding: '24px 28px',
                  color: '#0f172a',
                  fontSize: '0.82rem'
                }}
              >
                {/* KOP RAPOR PERSIS GAMBAR 1 */}
                <div style={{ textAlign: 'center', borderBottom: '3px double #064e3b', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', color: '#047857', textTransform: 'uppercase' }}>
                    {raporTemplate.namaYayasan || "YAYASAN IHYA AS SUNNAH TASIKMALAYA"}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0', color: '#064e3b', letterSpacing: '-0.01em' }}>
                    {raporTemplate.namaMadrasah || "MADRASAH ALIYAH IHYA AS SUNNAH"}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4 }}>
                    {raporTemplate.alamat || "Kompleks Islamic Center PPIAS, Jl. Paseh No. 12, Tasikmalaya, Jawa Barat"}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                    Website: {raporTemplate.website || "www.ma-ihyaassunnah.sch.id"} • Email: {raporTemplate.email || "tahfidz@ma-ihyaassunnah.sch.id"}
                  </div>

                  <div style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '4px 16px',
                    background: '#ecfdf5',
                    border: '1px solid #10b981',
                    borderRadius: '4px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    color: '#064e3b',
                    letterSpacing: '0.03em'
                  }}>
                    {raporTemplate.judulRapor || "LEMBAR EVALUASI & RAPOR TAHFIDZ AL-QUR'AN"}
                  </div>
                </div>

                {/* Bagian B: Tabel Aspek Kualitas (Persis Gambar 2) */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#064e3b', borderBottom: '2px solid #059669', paddingBottom: '3px', marginBottom: '8px' }}>
                    B. PENILAIAN ASPEK KUALITAS TAHFIDZ
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#ecfdf5', color: '#064e3b' }}>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', width: '28px', textAlign: 'center' }}>No</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>Aspek Penilaian</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 6px', width: '55px', textAlign: 'center' }}>Nilai</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px', width: '110px' }}>Predikat</th>
                        <th style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }}>Keterangan / Evaluasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(raporTemplate.aspekPenilaian || [
                        { no: 1, nama: 'Kelancaran & Daya Ingat (Al-Hifdz)', keterangan: 'Hafalan lancar, tartil, dan mutqin' },
                        { no: 2, nama: 'Ahkamut Tajwid (Hukum Tajwid)', keterangan: "Ghunnah, ikhfa', dan mad diterapkan dengan baik" },
                        { no: 3, nama: 'Makharijul Huruf & Shifat (Fashohah)', keterangan: 'Pengucapan huruf jelas dan fasih sesuai kaidah' },
                        { no: 4, nama: 'Adab Halaqah & Tilawah', keterangan: 'Menghormati mushaf, ustadz, dan teman halaqah' }
                      ]).map((aspek, idx) => {
                        const contohNilai = [90, 91, 89, 95][idx] || 90;
                        const contohPredikat = ['Mumtaz (Istimewa)', 'Mumtaz (Istimewa)', 'Jayyid Jiddan (Sangat Baik)', 'Mumtaz (Istimewa)'][idx] || 'Mumtaz';
                        return (
                          <tr key={idx}>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', textAlign: 'center' }}>{idx + 1}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 700 }}>{aspek.nama}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 6px', textAlign: 'center', fontWeight: 800 }}>{contohNilai}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontWeight: 600 }}>{contohPredikat}</td>
                            <td style={{ border: '1px solid #cbd5e1', padding: '6px 8px', fontSize: '0.72rem', color: '#334155' }}>{aspek.keterangan}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Tanda Tangan */}
                <div style={{ marginTop: '20px', fontSize: '0.75rem' }}>
                  <div style={{ textAlign: 'right', marginBottom: '12px', color: '#475569' }}>
                    {raporTemplate.tempatTanggal || 'Tasikmalaya'}, 2026
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: '8px' }}>
                    <div>
                      <div style={{ color: '#64748b' }}>Wali Santri</div>
                      <div style={{ height: '40px' }}></div>
                      <div style={{ fontWeight: 700, borderBottom: '1px solid #000', display: 'inline-block', minWidth: '90px' }}>( ............... )</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b' }}>Musyrif</div>
                      <div style={{ height: '40px' }}></div>
                      <div style={{ fontWeight: 700, borderBottom: '1px solid #000', display: 'inline-block', minWidth: '90px' }}>( Musyrif )</div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b' }}>Koordinator</div>
                      <div style={{ height: '40px' }}></div>
                      <div style={{ fontWeight: 700, borderBottom: '1px solid #000', display: 'inline-block', minWidth: '90px' }}>
                        ( {raporTemplate.namaMudir ? raporTemplate.namaMudir.split(',')[0] : 'Ust. Hafizhul'} )
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    <label className="form-label">Cabang & Satuan Lembaga *</label>
                    <select
                      className="form-select"
                      value={newPengampu.cabangId || (selectedBranchId !== 'ALL' ? selectedBranchId : (cabangList[0]?.id || 'cabang-pusat'))}
                      onChange={(e) => {
                        const cId = e.target.value;
                        const cObj = cabangList.find(c => c.id === cId);
                        setNewPengampu({ 
                          ...newPengampu, 
                          cabangId: cId, 
                          unitSekolah: cObj ? cObj.nama : newPengampu.unitSekolah 
                        });
                      }}
                    >
                      {cabangList.map(c => (
                        <option key={c.id} value={c.id}>
                          📍 {c.nama} ({c.kode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jabatan / Penugasan</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: Musyrif Halaqah / Guru Tahfidz"
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
                  <label className="form-label">Cabang Operasional *</label>
                  <select 
                    className="form-select"
                    value={newSesi.cabangId || (selectedBranchId !== 'ALL' ? selectedBranchId : 'ALL')}
                    onChange={(e) => setNewSesi({ ...newSesi, cabangId: e.target.value })}
                  >
                    <option value="ALL">🌐 Semua Cabang (Umum / Global)</option>
                    {cabangList.map(c => (
                      <option key={c.id} value={c.id}>
                        📍 {c.nama} ({c.kode})
                      </option>
                    ))}
                  </select>
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

                <div className="form-group">
                  <label className="form-label">Cabang & Satuan Pendidikan *</label>
                  <select
                    className="form-select"
                    value={newSiswa.cabangId || (selectedBranchId !== 'ALL' ? selectedBranchId : (cabangList[0]?.id || 'cabang-pusat'))}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const cObj = cabangList.find(c => c.id === cId);
                      setNewSiswa({ 
                        ...newSiswa, 
                        cabangId: cId, 
                        unitSekolah: cObj ? cObj.nama : newSiswa.unitSekolah 
                      });
                    }}
                  >
                    {cabangList.map(c => (
                      <option key={c.id} value={c.id}>
                        📍 {c.nama} ({c.kode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Guru Pengampu / Musyrif Halaqah *</label>
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
                    *Otomatis disinkronkan dengan Data Pegawai dan pengampu tahfidz.
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

                <div className="form-group">
                  <label className="form-label">Guru Pengampu / Musyrif Halaqah *</label>
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
                    *Otomatis disinkronkan dengan Data Pegawai dan pengampu tahfidz.
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
