import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  UserCheck, 
  ShieldCheck, 
  Edit3, 
  Save, 
  X, 
  Sparkles, 
  Award,
  FileCheck2
} from 'lucide-react';
import CustomSelect from './common/CustomSelect';
import { storageService } from '../services/storage';

export default function RaporView({ 
  santriList = [], 
  halaqahList = [], 
  setoranList = [], 
  absensiList = [], 
  settings = {},
  selectedSantriId = "",
  showToast,
  currentRole = 'pengampu',
  authUser
}) {
  const [activeSantriId, setActiveSantriId] = useState(selectedSantriId || santriList[0]?.id || "s-1");
  const [raporTemplate, setRaporTemplate] = useState(() => storageService.getRaporTemplate());
  const [showInputModal, setShowInputModal] = useState(false);
  const [isSavingNilai, setIsSavingNilai] = useState(false);
  const [nilaiVersion, setNilaiVersion] = useState(0);

  // Sinkronisasi template jika ada perubahan dari menu Super Admin
  useEffect(() => {
    const handleTemplateUpdate = (e) => {
      if (e.detail) setRaporTemplate(e.detail);
      else setRaporTemplate(storageService.getRaporTemplate());
    };
    const handleNilaiUpdate = () => {
      setNilaiVersion(v => v + 1);
    };

    window.addEventListener('simtah_rapor_template_updated', handleTemplateUpdate);
    window.addEventListener('simtah_nilai_rapor_updated', handleNilaiUpdate);
    return () => {
      window.removeEventListener('simtah_rapor_template_updated', handleTemplateUpdate);
      window.removeEventListener('simtah_nilai_rapor_updated', handleNilaiUpdate);
    };
  }, []);

  const currentSantri = santriList.find(s => s.id === activeSantriId) || santriList[0] || {};
  const halaqah = halaqahList.find(h => h.id === currentSantri.halaqahId) || {};

  // Setoran santri
  const santriSetoran = setoranList.filter(s => s.santriId === currentSantri.id);

  // Rekap Absensi
  let hadir = 0, izin = 0, sakit = 0, alpa = 0;
  absensiList.forEach(a => {
    if (a.records && a.records[currentSantri.id]) {
      const st = a.records[currentSantri.id].status;
      if (st === 'H') hadir++;
      else if (st === 'I') izin++;
      else if (st === 'S') sakit++;
      else if (st === 'A') alpa++;
    }
  });

  const totalPertemuan = hadir + izin + sakit + alpa || 1;
  const persenKehadiran = Math.round((hadir / totalPertemuan) * 100);

  // Ambil data nilai kualitas tahfidz dari database / storage
  const savedNilai = storageService.getNilaiRaporBySantri(currentSantri.id);

  // Default aspek dari template rapor
  const aspekList = raporTemplate.aspekPenilaian && raporTemplate.aspekPenilaian.length === 4
    ? raporTemplate.aspekPenilaian
    : [
        { no: 1, nama: 'Kelancaran & Daya Ingat (Al-Hifdz)', keterangan: 'Hafalan lancar, tartil, dan mutqin' },
        { no: 2, nama: 'Ahkamut Tajwid (Hukum Tajwid)', keterangan: "Ghunnah, ikhfa', dan mad diterapkan dengan baik" },
        { no: 3, nama: 'Makharijul Huruf & Shifat (Fashohah)', keterangan: 'Pengucapan huruf jelas dan fasih sesuai kaidah' },
        { no: 4, nama: 'Adab Halaqah & Tilawah', keterangan: 'Menghormati mushaf, ustadz, dan teman halaqah' }
      ];

  const getPredikat = (score) => {
    const num = Number(score) || 0;
    if (num >= 90) return "Mumtaz (Istimewa)";
    if (num >= 80) return "Jayyid Jiddan (Sangat Baik)";
    if (num >= 70) return "Jayyid (Baik)";
    if (num >= 60) return "Maqbul (Cukup)";
    return "Kurang";
  };

  // State Form Input Nilai (Gambar 2)
  const [inputForm, setInputForm] = useState({
    kelancaran: 90,
    kelancaranKet: 'Hafalan lancar, tartil, dan mutqin',
    tajwid: 91,
    tajwidKet: "Ghunnah, ikhfa', dan mad diterapkan dengan baik",
    fashohah: 89,
    fashohahKet: 'Pengucapan huruf jelas dan fasih sesuai kaidah',
    adab: 95,
    adabKet: 'Menghormati mushaf, ustadz, dan teman halaqah',
    catatanMusyrif: '',
    tempatRapor: 'Tasikmalaya',
    tanggalRapor: '2026-12-20'
  });

  // State edit inline tempat & tanggal rapor di lembar cetak
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editTempat, setEditTempat] = useState('Tasikmalaya');
  const [editTanggal, setEditTanggal] = useState('2026-12-20');

  // Saat santri berganti atau modal dibuka, populate form dengan data database
  const initInputForm = () => {
    const existing = storageService.getNilaiRaporBySantri(currentSantri.id);
    if (existing) {
      setInputForm({
        kelancaran: existing.kelancaran ?? 90,
        kelancaranKet: existing.kelancaranKet || existing.kelancaran_ket || aspekList[0]?.keterangan || 'Hafalan lancar, tartil, dan mutqin',
        tajwid: existing.tajwid ?? 91,
        tajwidKet: existing.tajwidKet || existing.tajwid_ket || aspekList[1]?.keterangan || "Ghunnah, ikhfa', dan mad diterapkan dengan baik",
        fashohah: existing.fashohah ?? 89,
        fashohahKet: existing.fashohahKet || existing.fashohah_ket || aspekList[2]?.keterangan || 'Pengucapan huruf jelas dan fasih sesuai kaidah',
        adab: existing.adab ?? 95,
        adabKet: existing.adabKet || existing.adab_ket || aspekList[3]?.keterangan || 'Menghormati mushaf, ustadz, dan teman halaqah',
        catatanMusyrif: existing.catatanMusyrif || existing.catatan_musyrif || `Alhamdulillah ananda ${currentSantri.nama || 'santri'} memiliki semangat tinggi dalam ziyadah dan muroja'ah. Disarankan untuk memperbanyak pengulangan mandiri di asrama menjelang waktu Maghrib dan Subuh agar hafalan semakin mutqin dan kokoh.`,
        tempatRapor: existing.tempatRapor || existing.tempat_rapor || 'Tasikmalaya',
        tanggalRapor: existing.tanggalRapor || existing.tanggal_rapor || '2026-12-20'
      });
    } else {
      setInputForm({
        kelancaran: 90,
        kelancaranKet: aspekList[0]?.keterangan || 'Hafalan lancar, tartil, dan mutqin',
        tajwid: 91,
        tajwidKet: aspekList[1]?.keterangan || "Ghunnah, ikhfa', dan mad diterapkan dengan baik",
        fashohah: 89,
        fashohahKet: aspekList[2]?.keterangan || 'Pengucapan huruf jelas dan fasih sesuai kaidah',
        adab: 95,
        adabKet: aspekList[3]?.keterangan || 'Menghormati mushaf, ustadz, dan teman halaqah',
        catatanMusyrif: `Alhamdulillah ananda ${currentSantri.nama || 'santri'} memiliki semangat tinggi dalam ziyadah dan muroja'ah. Disarankan untuk memperbanyak pengulangan mandiri di asrama menjelang waktu Maghrib dan Subuh agar hafalan semakin mutqin dan kokoh.`,
        tempatRapor: 'Tasikmalaya',
        tanggalRapor: '2026-12-20'
      });
    }
  };

  const handleOpenInputModal = () => {
    initInputForm();
    setShowInputModal(true);
  };

  const handleSaveNilaiSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSavingNilai(true);
    try {
      const payload = {
        santriId: currentSantri.id,
        santri_id: currentSantri.id,
        pengampuId: halaqah.pengampuId || null,
        semester: raporTemplate.semester || 'Ganjil 2026/2027',
        tahunAjaran: '2026/2027',
        kelancaran: Number(inputForm.kelancaran) || 0,
        kelancaranKet: inputForm.kelancaranKet,
        tajwid: Number(inputForm.tajwid) || 0,
        tajwidKet: inputForm.tajwidKet,
        fashohah: Number(inputForm.fashohah) || 0,
        fashohahKet: inputForm.fashohahKet,
        adab: Number(inputForm.adab) || 0,
        adabKet: inputForm.adabKet,
        catatanMusyrif: inputForm.catatanMusyrif,
        tempatRapor: inputForm.tempatRapor || 'Tasikmalaya',
        tanggalRapor: inputForm.tanggalRapor || '2026-12-20'
      };

      storageService.saveNilaiRapor(payload);
      setShowInputModal(false);
      if (showToast) showToast(`Nilai Rapor ananda ${currentSantri.nama} berhasil disimpan ke database!`);
      else alert(`Nilai Rapor ananda ${currentSantri.nama} berhasil disimpan ke database!`);
    } catch (err) {
      alert("Gagal menyimpan nilai: " + err.message);
    } finally {
      setIsSavingNilai(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const mutqinCount = currentSantri.juzMutqin ? currentSantri.juzMutqin.length : 0;
  const ziyadahCount = currentSantri.juzZiyadah ? currentSantri.juzZiyadah.length : 0;

  // Nilai aktif yang ditampilkan di lembar cetak
  const activeNilai = {
    kelancaran: savedNilai?.kelancaran ?? 90,
    kelancaranKet: savedNilai?.kelancaranKet || savedNilai?.kelancaran_ket || aspekList[0]?.keterangan || 'Hafalan lancar, tartil, dan mutqin',
    tajwid: savedNilai?.tajwid ?? 91,
    tajwidKet: savedNilai?.tajwidKet || savedNilai?.tajwid_ket || aspekList[1]?.keterangan || "Ghunnah, ikhfa', dan mad diterapkan dengan baik",
    fashohah: savedNilai?.fashohah ?? 89,
    fashohahKet: savedNilai?.fashohahKet || savedNilai?.fashohah_ket || aspekList[2]?.keterangan || 'Pengucapan huruf jelas dan fasih sesuai kaidah',
    adab: savedNilai?.adab ?? 95,
    adabKet: savedNilai?.adabKet || savedNilai?.adab_ket || aspekList[3]?.keterangan || 'Menghormati mushaf, ustadz, dan teman halaqah',
    catatanMusyrif: savedNilai?.catatanMusyrif || savedNilai?.catatan_musyrif || `"Alhamdulillah ananda ${currentSantri.nama} memiliki semangat tinggi dalam ziyadah dan muroja'ah. Disarankan untuk memperbanyak pengulangan mandiri di asrama menjelang waktu Maghrib dan Subuh agar hafalan semakin mutqin dan kokoh."`,
    tempatRapor: savedNilai?.tempatRapor || savedNilai?.tempat_rapor || 'Tasikmalaya',
    tanggalRapor: savedNilai?.tanggalRapor || savedNilai?.tanggal_rapor || '2026-12-20'
  };

  // Format tanggal Indonesia rapi
  const formatTanggalRapor = (tempat, dateStr) => {
    const t = tempat || "Tasikmalaya";
    if (!dateStr) return `${t}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      const dObj = new Date(Number(y), Number(m) - 1, Number(d));
      return `${t}, ${dObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    return `${t}, ${dateStr}`;
  };

  // Simpan edit tempat & tanggal rapor inline
  const handleSaveDateInline = async () => {
    try {
      const payload = {
        santriId: currentSantri.id,
        santri_id: currentSantri.id,
        pengampuId: halaqah.pengampuId || null,
        semester: raporTemplate.semester || 'Ganjil 2026/2027',
        tahunAjaran: '2026/2027',
        kelancaran: activeNilai.kelancaran,
        kelancaranKet: activeNilai.kelancaranKet,
        tajwid: activeNilai.tajwid,
        tajwidKet: activeNilai.tajwidKet,
        fashohah: activeNilai.fashohah,
        fashohahKet: activeNilai.fashohahKet,
        adab: activeNilai.adab,
        adabKet: activeNilai.adabKet,
        catatanMusyrif: activeNilai.catatanMusyrif,
        tempatRapor: editTempat || 'Tasikmalaya',
        tanggalRapor: editTanggal || '2026-12-20'
      };
      storageService.saveNilaiRapor(payload);
      setIsEditingDate(false);
      if (showToast) showToast('Tempat & tanggal cetak rapor berhasil diperbarui!');
      else alert('Tempat & tanggal cetak rapor berhasil diperbarui!');
    } catch (err) {
      alert('Gagal menyimpan tanggal: ' + err.message);
    }
  };

  const modalRataRata = (
    (Number(inputForm.kelancaran || 0) +
     Number(inputForm.tajwid || 0) +
     Number(inputForm.fashohah || 0) +
     Number(inputForm.adab || 0)) / 4
  ).toFixed(1);

  return (
    <div>
      {/* Control Toolbar (hidden on print) */}
      <div className="card rapor-toolbar-card no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Pilih Santri (Pas dengan layar HP & Desktop, tidak overflow) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px', minWidth: 0, width: '100%' }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.88rem', flexShrink: 0 }}>
              Pilih Santri:
            </label>
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <CustomSelect 
                style={{ width: '100%' }}
                triggerStyle={{ minHeight: '42px', borderRadius: '12px', padding: '0 12px' }}
                value={activeSantriId}
                onChange={(e) => setActiveSantriId(e.target.value)}
                searchable={true}
                searchPlaceholder="Cari nama santri atau NIS..."
              >
                {santriList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama} (NIS: {s.nis})
                  </option>
                ))}
              </CustomSelect>
            </div>
          </div>

          {/* Tombol Aksi: Input Nilai dan Cetak Rapor */}
          <div style={{ display: 'flex', gap: '10px', flex: '1 1 280px', width: '100%', minWidth: 0, justifyContent: 'flex-end' }}>
            {currentRole !== 'orangtua' ? (
              <>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleOpenInputModal}
                  style={{ 
                    background: '#ecfdf5', 
                    borderColor: '#10b981', 
                    color: '#064e3b', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    minWidth: 0,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Edit3 size={16} color="#059669" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Input Nilai Aspek</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handlePrint} 
                  style={{ 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    minWidth: 0,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Printer size={16} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Cetak Rapor (A4)</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.80rem', color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  👁️ Lembar Rapor Resmi Ananda (Read-Only)
                </span>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handlePrint} 
                  style={{ 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Printer size={16} style={{ flexShrink: 0 }} />
                  <span>Cetak / Unduh Rapor</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Printable Rapor Sheet (A4 format) */}
      <div 
        className="rapor-paper" 
        style={{ 
          background: 'var(--white)', 
          maxWidth: '820px', 
          margin: '0 auto', 
          padding: '40px 48px', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--slate-300)',
          boxShadow: 'var(--shadow-lg)',
          color: '#0f172a'
        }}
      >
        {/* Official Kop Surat (Disesuaikan dari Template Super Admin) */}
        <div style={{ textAlign: 'center', borderBottom: '3px double #064e3b', paddingBottom: '16px', marginBottom: '24px', position: 'relative' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', color: '#047857', textTransform: 'uppercase' }}>
            {raporTemplate.namaYayasan || "YAYASAN IHYA AS SUNNAH TASIKMALAYA"}
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0', color: '#064e3b', letterSpacing: '-0.01em' }}>
            {raporTemplate.namaMadrasah || "MADRASAH ALIYAH IHYA AS SUNNAH"}
          </h1>
          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
            {raporTemplate.alamat || settings.alamatMadrasah || "Kompleks Islamic Center PPIAS, Jl. Paseh No. 12, Tasikmalaya, Jawa Barat"}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
            Website: {raporTemplate.website || "www.ma-ihyaassunnah.sch.id"} • Email: {raporTemplate.email || "tahfidz@ma-ihyaassunnah.sch.id"}
          </div>

          <div style={{
            display: 'inline-block',
            marginTop: '12px',
            padding: '4px 18px',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '4px',
            fontWeight: 800,
            fontSize: '0.9rem',
            color: '#064e3b',
            letterSpacing: '0.05em'
          }}>
            {raporTemplate.judulRapor || "LEMBAR EVALUASI & RAPOR TAHFIDZ AL-QUR'AN"}
          </div>
        </div>

        {/* Identitas Santri Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px 24px', 
          fontSize: '0.875rem', 
          background: '#f8fafc', 
          padding: '14px 18px', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <div>
            <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Nama Santri</span>
            <strong style={{ color: '#0f172a' }}>: {currentSantri.nama}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Semester / TA</span>
            <strong>: {raporTemplate.semester || settings.semester || "Ganjil 2026/2027"}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Nomor Induk (NIS)</span>
            <strong>: {currentSantri.nis}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Halaqah</span>
            <strong>: {halaqah.nama || "-"}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Musyrif Pengampu</span>
            <strong>: {halaqah.musyrif || "-"}</strong>
          </div>
        </div>

        {/* Bagian A: Capaian & Rekapitulasi Hafalan */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b', borderBottom: '2px solid #059669', paddingBottom: '4px', marginBottom: '10px' }}>
            A. REKAPITULASI CAPAIAN HAFALAN
          </div>

          <table className="rapor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', width: '35%', fontWeight: 700 }}>
                  Target Hafalan Semester
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 800, color: '#047857' }}>
                  {currentSantri.targetJuz || 10} Juz Al-Qur'an
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 700 }}>
                  Juz yang Telah Mutqin (Lulus Tasmi')
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>
                  <strong>{mutqinCount} Juz</strong> ({currentSantri.juzMutqin?.map(j => `Juz ${j}`).join(', ') || 'Belum ada'})
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 700 }}>
                  Juz Selesai Ziyadah (Sedang Pemantapan)
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>
                  <strong>{ziyadahCount} Juz</strong> ({currentSantri.juzZiyadah?.map(j => `Juz ${j}`).join(', ') || 'Belum ada'})
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', background: '#f8fafc', fontWeight: 700 }}>
                  Total Capaian Terhadap 30 Juz
                </td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 800, color: '#b45309' }}>
                  {(((mutqinCount + (ziyadahCount * 0.5)) / 30) * 100).toFixed(1)}% dari 30 Juz
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bagian B: Nilai Aspek Kualitas Tahfidz (Persis Gambar 2 - Bisa di-scroll ke samping) */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #059669', paddingBottom: '4px', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b' }}>
              B. PENILAIAN ASPEK KUALITAS TAHFIDZ
            </div>
            <button 
              type="button" 
              className="btn btn-ghost btn-xs no-print"
              onClick={handleOpenInputModal}
              style={{ color: '#047857', fontWeight: 700, fontSize: '0.75rem', gap: '4px', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}
            >
              <Edit3 size={13} /> Edit Nilai
            </button>
          </div>

          {/* Hint Geser untuk Layar HP */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#059669', marginBottom: '6px', fontStyle: 'italic' }}>
            <span>👉 Geser tabel ke samping (scroll horizontal) untuk melihat seluruh kolom evaluasi</span>
          </div>

          {/* Container Scroll Horizontal agar tidak terpotong di HP */}
          <div className="rapor-table-scroll">
            <table className="rapor-table" style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#ecfdf5', color: '#064e3b' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', width: '40px', textAlign: 'center' }}>No</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', minWidth: '160px' }}>Aspek Penilaian</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', width: '80px', textAlign: 'center' }}>Nilai (0-100)</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', width: '150px' }}>Predikat</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', minWidth: '200px' }}>Keterangan / Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {/* Aspek 1: Kelancaran */}
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>1</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {aspekList[0]?.nama || 'Kelancaran & Daya Ingat (Al-Hifdz)'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>
                    {activeNilai.kelancaran}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {getPredikat(activeNilai.kelancaran)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>
                    {activeNilai.kelancaranKet}
                  </td>
                </tr>

                {/* Aspek 2: Tajwid */}
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>2</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {aspekList[1]?.nama || 'Ahkamut Tajwid (Hukum Tajwid)'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>
                    {activeNilai.tajwid}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {getPredikat(activeNilai.tajwid)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>
                    {activeNilai.tajwidKet}
                  </td>
                </tr>

                {/* Aspek 3: Fashohah */}
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>3</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {aspekList[2]?.nama || 'Makharijul Huruf & Shifat (Fashohah)'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>
                    {activeNilai.fashohah}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {getPredikat(activeNilai.fashohah)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>
                    {activeNilai.fashohahKet}
                  </td>
                </tr>

                {/* Aspek 4: Adab */}
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>4</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {aspekList[3]?.nama || 'Adab Halaqah & Tilawah'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>
                    {activeNilai.adab}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>
                    {getPredikat(activeNilai.adab)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>
                    {activeNilai.adabKet}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bagian C: Rekap Kehadiran Halaqah */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b', borderBottom: '2px solid #059669', paddingBottom: '4px', marginBottom: '10px' }}>
            C. REKAPITULASI PRESENSI HALAQAH
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>HADIR</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>{hadir} Hari</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>IZIN RESMI</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{izin} Hari</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>SAKIT</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309' }}>{sakit} Hari</div>
            </div>
            <div style={{ border: '1px solid #cbd5e1', padding: '8px', borderRadius: '6px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ALPA / TANPA KET</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#be123c' }}>{alpa} Hari</div>
            </div>
          </div>
        </div>

        {/* Catatan & Rekomendasi Musyrif */}
        <div style={{ marginBottom: '28px', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '6px', background: '#f8fafc' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>
            Catatan & Pesan Musyrif:
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: '#334155', lineHeight: 1.6 }}>
            {activeNilai.catatanMusyrif}
          </p>
        </div>

        {/* Kolom Tanda Tangan & Tanggal Rapor */}
        <div style={{ marginTop: '30px' }}>
          {/* Tanggal & Tempat Rapor (Bisa di-edit inline) */}
          <div style={{ marginBottom: '16px' }}>
            {!isEditingDate ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                  {formatTanggalRapor(activeNilai.tempatRapor, activeNilai.tanggalRapor)}
                </div>
                {currentRole !== 'orangtua' && (
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-xs no-print" 
                    onClick={() => {
                      setEditTempat(activeNilai.tempatRapor || 'Tasikmalaya');
                      setEditTanggal(activeNilai.tanggalRapor || '2026-12-20');
                      setIsEditingDate(true);
                    }}
                    style={{ color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '0.73rem', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    title="Ubah Tempat & Tanggal Rapor"
                  >
                    <Edit3 size={12} />
                    <span>Edit Tanggal</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="no-print" style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center', 
                gap: '8px', 
                flexWrap: 'wrap',
                background: '#f0fdf4',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1.5px solid #10b981'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#064e3b' }}>Tempat & Tanggal:</span>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Kota"
                  value={editTempat} 
                  onChange={(e) => setEditTempat(e.target.value)}
                  style={{ width: '130px', height: '34px', fontSize: '0.82rem', padding: '0 8px', borderRadius: '6px' }}
                />
                <input 
                  type="date" 
                  className="form-input" 
                  value={editTanggal} 
                  onChange={(e) => setEditTanggal(e.target.value)}
                  style={{ width: '145px', height: '34px', fontSize: '0.82rem', padding: '0 8px', borderRadius: '6px' }}
                />
                <button 
                  type="button" 
                  className="btn btn-primary btn-xs"
                  onClick={handleSaveDateInline}
                  style={{ background: '#059669', borderColor: '#047857', height: '34px', padding: '0 12px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px' }}
                >
                  <Save size={13} /> Simpan
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline btn-xs"
                  onClick={() => setIsEditingDate(false)}
                  style={{ height: '34px', padding: '0 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          {/* Tanda Tangan Grid (Responsif HP & Desktop) */}
          <div className="rapor-signatures-grid">
            <div>
              <div>Orang Tua / Wali Santri</div>
              <div style={{ height: '60px' }}></div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '2px', display: 'inline-block', width: '85%', maxWidth: '200px', wordBreak: 'break-word' }}>
                ( {currentSantri.namaWali || "........................................"} )
              </div>
            </div>

            <div>
              <div>Musyrif Pembimbing</div>
              <div style={{ height: '60px' }}></div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '2px', display: 'inline-block', width: '85%', maxWidth: '200px', wordBreak: 'break-word' }}>
                ( {halaqah.musyrif || "Ustadz Pembimbing"} )
              </div>
            </div>

            <div className="rapor-sig-koordinator">
              <div>Koordinator Tahfidz</div>
              <div style={{ height: '60px' }}></div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '2px', display: 'inline-block', width: '85%', maxWidth: '240px', wordBreak: 'break-word' }}>
                ( {raporTemplate.namaMudir || settings.koordinatorTahfidz || "Ust. Hafizhul Qur'an, Al-Hafizh"} )
              </div>
              {raporTemplate.nipMudir && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                  NIP. {raporTemplate.nipMudir}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL INPUT NILAI ASPEK SANTRI (PENGAMPU) - SESUAI GAMBAR 2 */}
      {/* ========================================================= */}
      {showInputModal && (
        <div className="modal-overlay no-print" style={{ zIndex: 99999 }}>
          <div className="modal-content" style={{ maxWidth: '680px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#064e3b', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} color="#059669" />
                  <span>Input Nilai Aspek Kualitas Tahfidz</span>
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#047857' }}>
                  Santri: <strong>{currentSantri.nama}</strong> (NIS: {currentSantri.nis})
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowInputModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNilaiSubmit}>
              <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Banner Rata-rata Skor Realtime */}
                <div style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px', 
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>RATA-RATA NILAI:</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857' }}>
                      {modalRataRata} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>PREDIKAT AKHIR:</span>
                    <div>
                      <span style={{ 
                        display: 'inline-block', 
                        padding: '4px 12px', 
                        background: Number(modalRataRata) >= 90 ? '#dcfce7' : (Number(modalRataRata) >= 80 ? '#dbeafe' : '#fef3c7'),
                        color: Number(modalRataRata) >= 90 ? '#15803d' : (Number(modalRataRata) >= 80 ? '#1d4ed8' : '#b45309'),
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        borderRadius: '6px'
                      }}>
                        {getPredikat(Number(modalRataRata))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1. Kelancaran & Daya Ingat (Al-Hifdz) */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      1. {aspekList[0]?.nama || 'Kelancaran & Daya Ingat (Al-Hifdz)'}
                    </label>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                      {getPredikat(inputForm.kelancaran)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Skor (0 - 100)</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        required
                        style={{ height: '38px', fontWeight: 800, textAlign: 'center', fontSize: '1.05rem', color: '#047857' }}
                        value={inputForm.kelancaran}
                        onChange={(e) => setInputForm({ ...inputForm, kelancaran: e.target.value })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Keterangan / Evaluasi</span>
                      <input 
                        type="text" 
                        className="form-input"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        value={inputForm.kelancaranKet}
                        onChange={(e) => setInputForm({ ...inputForm, kelancaranKet: e.target.value })}
                        placeholder="Contoh: Hafalan lancar, tartil, dan mutqin"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Ahkamut Tajwid (Hukum Tajwid) */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      2. {aspekList[1]?.nama || 'Ahkamut Tajwid (Hukum Tajwid)'}
                    </label>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                      {getPredikat(inputForm.tajwid)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Skor (0 - 100)</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        required
                        style={{ height: '38px', fontWeight: 800, textAlign: 'center', fontSize: '1.05rem', color: '#047857' }}
                        value={inputForm.tajwid}
                        onChange={(e) => setInputForm({ ...inputForm, tajwid: e.target.value })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Keterangan / Evaluasi</span>
                      <input 
                        type="text" 
                        className="form-input"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        value={inputForm.tajwidKet}
                        onChange={(e) => setInputForm({ ...inputForm, tajwidKet: e.target.value })}
                        placeholder="Contoh: Ghunnah, ikhfa', dan mad diterapkan dengan baik"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Makharijul Huruf & Shifat (Fashohah) */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      3. {aspekList[2]?.nama || 'Makharijul Huruf & Shifat (Fashohah)'}
                    </label>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                      {getPredikat(inputForm.fashohah)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Skor (0 - 100)</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        required
                        style={{ height: '38px', fontWeight: 800, textAlign: 'center', fontSize: '1.05rem', color: '#047857' }}
                        value={inputForm.fashohah}
                        onChange={(e) => setInputForm({ ...inputForm, fashohah: e.target.value })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Keterangan / Evaluasi</span>
                      <input 
                        type="text" 
                        className="form-input"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        value={inputForm.fashohahKet}
                        onChange={(e) => setInputForm({ ...inputForm, fashohahKet: e.target.value })}
                        placeholder="Contoh: Pengucapan huruf jelas dan fasih sesuai kaidah"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Adab Halaqah & Tilawah */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      4. {aspekList[3]?.nama || 'Adab Halaqah & Tilawah'}
                    </label>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                      {getPredikat(inputForm.adab)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Skor (0 - 100)</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        required
                        style={{ height: '38px', fontWeight: 800, textAlign: 'center', fontSize: '1.05rem', color: '#047857' }}
                        value={inputForm.adab}
                        onChange={(e) => setInputForm({ ...inputForm, adab: e.target.value })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Keterangan / Evaluasi</span>
                      <input 
                        type="text" 
                        className="form-input"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        value={inputForm.adabKet}
                        onChange={(e) => setInputForm({ ...inputForm, adabKet: e.target.value })}
                        placeholder="Contoh: Menghormati mushaf, ustadz, dan teman halaqah"
                      />
                    </div>
                  </div>
                </div>

                {/* Tempat & Tanggal Terbit Rapor (Dapat Diedit Pengampu) */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#f8fafc' }}>
                  <label style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: '0.88rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅 Tempat & Tanggal Terbit Rapor</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Kota / Tempat Terbit</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        value={inputForm.tempatRapor}
                        onChange={(e) => setInputForm({ ...inputForm, tempatRapor: e.target.value })}
                        placeholder="Contoh: Tasikmalaya"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Tanggal Rapor</span>
                      <input 
                        type="date" 
                        className="form-input" 
                        style={{ height: '38px', fontSize: '0.85rem' }}
                        value={inputForm.tanggalRapor}
                        onChange={(e) => setInputForm({ ...inputForm, tanggalRapor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Catatan & Pesan Musyrif */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    Catatan & Rekomendasi Musyrif Pembimbing
                  </label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    value={inputForm.catatanMusyrif}
                    onChange={(e) => setInputForm({ ...inputForm, catatanMusyrif: e.target.value })}
                    placeholder="Tulis pesan motivasi atau instruksi muroja'ah santri..."
                  />
                </div>

              </div>

              <div className="modal-footer" style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowInputModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSavingNilai}
                  style={{ background: '#059669', borderColor: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} />
                  <span>{isSavingNilai ? 'Menyimpan ke Database...' : 'Simpan Nilai ke Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
