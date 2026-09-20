import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  PlusCircle, 
  User, 
  Phone, 
  Calendar,
  Check,
  RotateCcw,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Star,
  Users,
  GraduationCap,
  Trash2
} from 'lucide-react';
import { QURAN_SURAH, getSurahsByJuz } from '../data/quranData';
import { storageService } from '../services/storage';
import confetti from 'canvas-confetti';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
function toArabicDigits(num) {
  if (num == null) return '';
  return String(num).replace(/[0-9]/g, d => ARABIC_DIGITS[d]);
}

// Nama surah utama pada tiap Juz 1-30 untuk label rujukan cepat
const JUZ_SURAH_LABEL = [
  "Al-Fatihah - Al-Baqarah", // 1
  "Al-Baqarah (142)",         // 2
  "Al-Baqarah (253) - Ali 'Imran", // 3
  "Ali 'Imran (92) - An-Nisa'", // 4
  "An-Nisa' (24)",             // 5
  "An-Nisa' (148) - Al-Ma'idah", // 6
  "Al-Ma'idah (82) - Al-An'am", // 7
  "Al-An'am (111) - Al-A'raf",  // 8
  "Al-A'raf (88) - Al-Anfal",  // 9
  "Al-Anfal (41) - At-Taubah", // 10
  "Yunus - Hud",               // 11
  "Hud (6) - Yusuf",           // 12
  "Yusuf (53) - Ibrahim",      // 13
  "Al-Hijr - An-Nahl",         // 14
  "Al-Isra' - Al-Kahf",        // 15
  "Al-Kahf (75) - Ta Ha",      // 16
  "Al-Anbiya' - Al-Hajj",      // 17
  "Al-Mu'minun - Al-Furqan",   // 18
  "Al-Furqan (21) - An-Naml",  // 19
  "An-Naml (56) - Al-'Ankabut",// 20
  "Al-'Ankabut (46) - Al-Ahzab",// 21
  "Al-Ahzab (31) - Ya Sin",    // 22
  "Ya Sin (28) - Az-Zumar",    // 23
  "Az-Zumar (32) - Fussilat",  // 24
  "Fussilat (47) - Al-Jathiyah", // 25
  "Al-Ahqaf - Adz-Dzariyat",   // 26
  "Adz-Dzariyat (31) - Al-Hadid", // 27
  "Al-Mujadilah - At-Tahrim",      // 28
  "Al-Mulk - Al-Mursalat",         // 29
  "An-Naba' - An-Nas"              // 30
];

export default function SantriTrackerView({ 
  santriList = [], 
  halaqahList = [], 
  setoranList = [], 
  absensiList = [], 
  selectedSantriId, 
  onSelectSantri,
  onUpdateSantri,
  onDeleteSantri,
  onOpenQuickSetor,
  showToast,
  currentRole = 'pengampu'
}) {
  // Santri khusus halaqah pengampu (sudah disaring secara dinamis dari App.jsx)
  const effectiveSantriList = santriList;

  const defaultSantriId = (selectedSantriId && effectiveSantriList.some(s => s.id === selectedSantriId))
    ? selectedSantriId
    : (effectiveSantriList[0]?.id || null);

  const [activeSantriId, setActiveSantriId] = useState(defaultSantriId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJuzModal, setSelectedJuzModal] = useState(null);

  const handleDeleteCurrentSantri = (targetSantri) => {
    if (!targetSantri || !targetSantri.id) return;
    const confirmMsg = `Yakin ingin menghapus data santri "${targetSantri.nama || 'ini'}"?\n\nPERINGATAN: Semua riwayat setoran hafalan, mutaba'ah, dan presensi santri ini juga akan dihapus permanen dari sistem.`;
    if (window.confirm(confirmMsg)) {
      if (onDeleteSantri) {
        onDeleteSantri(targetSantri.id);
      } else {
        storageService.deleteSantri(targetSantri.id);
      }
      const remaining = effectiveSantriList.filter(s => s.id !== targetSantri.id);
      if (remaining.length > 0) {
        setActiveSantriId(remaining[0].id);
        if (onSelectSantri) onSelectSantri(remaining[0].id);
      } else {
        setActiveSantriId(null);
      }
      if (showToast) {
        showToast(`Data santri ${targetSantri.nama || ''} berhasil dihapus.`);
      }
    }
  };

  useEffect(() => {
    if (selectedSantriId && effectiveSantriList.some(s => s.id === selectedSantriId)) {
      setActiveSantriId(selectedSantriId);
    } else if (!effectiveSantriList.some(s => s.id === activeSantriId)) {
      setActiveSantriId(effectiveSantriList[0]?.id || "s-akbar");
    }
  }, [selectedSantriId, effectiveSantriList]);

  const currentSantri = effectiveSantriList.find(s => s.id === activeSantriId) || effectiveSantriList[0] || {};
  const halaqah = halaqahList.find(h => h.id === currentSantri.halaqahId);

  // Setoran untuk santri ini
  const santriSetoran = setoranList.filter(s => s.santriId === currentSantri.id);

  // Rekap Absensi santri ini
  let totalHadir = 0, totalIzin = 0, totalSakit = 0, totalAlpa = 0;
  absensiList.forEach(a => {
    if (a.records && a.records[currentSantri.id]) {
      const st = a.records[currentSantri.id].status;
      if (st === 'H') totalHadir++;
      else if (st === 'I') totalIzin++;
      else if (st === 'S') totalSakit++;
      else if (st === 'A') totalAlpa++;
    }
  });

  const totalPresensi = totalHadir + totalIzin + totalSakit + totalAlpa;
  const persenKehadiran = totalPresensi > 0 ? Math.round((totalHadir / totalPresensi) * 100) : 100;

  // 30 Juz Status calculation
  const juzMutqin = currentSantri.juzMutqin || [];
  const juzZiyadah = currentSantri.juzZiyadah || [];

  const getJuzStatus = (juzNumber) => {
    if (juzMutqin.includes(juzNumber)) return 'mutqin';
    if (juzZiyadah.includes(juzNumber)) return 'ziyadah';
    
    // Cek apakah ada catatan setoran di juz ini
    const hasSetoranInJuz = santriSetoran.some(s => parseInt(s.juz) === juzNumber);
    if (hasSetoranInJuz) return 'proses';

    return 'belum';
  };

  // Toggle Juz Status dari modal
  const handleSetJuzStatus = (juzNum, newStatus) => {
    let updatedMutqin = [...juzMutqin];
    let updatedZiyadah = [...juzZiyadah];

    if (newStatus === 'mutqin') {
      if (!updatedMutqin.includes(juzNum)) updatedMutqin.push(juzNum);
      updatedZiyadah = updatedZiyadah.filter(j => j !== juzNum);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } else if (newStatus === 'ziyadah') {
      if (!updatedZiyadah.includes(juzNum)) updatedZiyadah.push(juzNum);
      updatedMutqin = updatedMutqin.filter(j => j !== juzNum);
    } else {
      updatedMutqin = updatedMutqin.filter(j => j !== juzNum);
      updatedZiyadah = updatedZiyadah.filter(j => j !== juzNum);
    }

    updatedMutqin.sort((a, b) => a - b);
    updatedZiyadah.sort((a, b) => a - b);

    if (onUpdateSantri) {
      onUpdateSantri(currentSantri.id, {
        juzMutqin: updatedMutqin,
        juzZiyadah: updatedZiyadah
      });
    }

    if (showToast) {
      showToast(`Status Juz ${juzNum} santri ${currentSantri.nama} diperbarui menjadi: ${newStatus.toUpperCase()}`);
    }
    setSelectedJuzModal(null);
  };

  const filteredSantri = effectiveSantriList.filter(s => 
    (s.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nis || '').includes(searchTerm)
  );

  const totalMutqinCount = juzMutqin.length;
  const totalZiyadahCount = juzZiyadah.length;
  const targetJuzGoal = currentSantri.targetJuz || 30;
  const mutqinPercent = Math.min(100, Math.round((totalMutqinCount / targetJuzGoal) * 100));
  const ziyadahPercent = Math.min(100 - mutqinPercent, Math.round((totalZiyadahCount / targetJuzGoal) * 100));
  const totalPercent = Math.min(100, mutqinPercent + ziyadahPercent);

  const btnBase = {
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* ══════════ TOP HEADER BAR ══════════ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Peta Capaian 30 Juz &amp; Profil Santri
            </h1>
            {currentRole === 'pengampu' && (
              <span style={{
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                Halaqah Ustadz Wahyudin ({filteredSantri.length} Santri)
              </span>
            )}
          </div>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
            Visualisasi peta 30 juz Al-Qur'an, evaluasi mutqin/ziyadah, dan mutaba'ah setoran santri
          </p>
        </div>

        {currentRole === 'orangtua' ? (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '0.80rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={16} color="#059669" />
            <span>Mode Pantau Perkembangan Ananda (Read-Only)</span>
          </div>
        ) : (
          <button 
            type="button"
            onClick={onOpenQuickSetor}
            style={{
              ...btnBase,
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: 800,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
            }}
          >
            <PlusCircle size={18} />
            <span>+ Catat Setoran Santri Ini</span>
          </button>
        )}
      </div>

      {/* ══════════ MAIN 2-COLUMN LAYOUT ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '22px', alignItems: 'start' }}>

        {/* ─── KOLOM KIRI: DAFTAR SANTRI HALAQAH ─── */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          position: 'sticky',
          top: '20px'
        }}>
          {/* Header Card Kiri */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={17} color="#15803d" />
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                {currentRole === 'pengampu' ? 'Santri Halaqah Saya' : 'Daftar Santri'}
              </span>
            </div>
            <span style={{
              background: '#ecfdf5',
              color: '#15803d',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 9px',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              {filteredSantri.length} Santri
            </span>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Cari nama santri / NIS..."
              style={{
                paddingLeft: '36px',
                fontSize: '0.82rem',
                height: '38px',
                borderRadius: '10px',
                borderColor: '#e2e8f0',
                background: '#f8fafc'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List Santri */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '680px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {filteredSantri.map(s => {
              const isActive = s.id === activeSantriId;
              const sHalaqah = halaqahList.find(h => h.id === s.halaqahId);
              const mutqinCount = s.juzMutqin?.length || 0;
              const initial = (s.nama || 'S').charAt(0).toUpperCase();

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSantriId(s.id);
                    if (onSelectSantri) onSelectSantri(s.id);
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: isActive ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#ffffff',
                    border: `1.5px solid ${isActive ? '#16a34a' : '#e2e8f0'}`,
                    borderLeft: `4px solid ${isActive ? '#15803d' : '#cbd5e1'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(22,163,74,0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    {/* Avatar Inisial */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isActive 
                        ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' 
                        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      color: isActive ? '#ffffff' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      flexShrink: 0
                    }}>
                      {initial}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        color: isActive ? '#14532d' : '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {s.nama}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '1px' }}>
                        {sHalaqah ? sHalaqah.nama : 'Halaqah Bimbingan'} • NIS: {s.nis}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Badge Mutqin */}
                    <div style={{
                      padding: '3px 9px',
                      borderRadius: '20px',
                      background: isActive ? '#15803d' : '#f8fafc',
                      border: `1px solid ${isActive ? '#15803d' : '#e2e8f0'}`,
                      color: isActive ? '#ffffff' : '#15803d',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={11} fill={isActive ? '#fde047' : '#ca8a04'} color="none" />
                      <span>{mutqinCount} Juz</span>
                    </div>

                    {/* Tombol Hapus Santri */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCurrentSantri(s);
                      }}
                      title={`Hapus data santri ${s.nama}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '5px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#e11d48';
                        e.currentTarget.style.background = '#ffe4e6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredSantri.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.82rem' }}>
                {effectiveSantriList.length === 0 
                  ? 'Belum ada santri terdaftar.' 
                  : `Tidak ditemukan santri dengan nama "${searchTerm}"`}
              </div>
            )}
          </div>
        </div>

        {/* ─── KOLOM KANAN: DASHBOARD & DETAIL SANTRI TERPILIH ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {(!currentSantri || !currentSantri.id) ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#94a3b8'
              }}>
                <Users size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Belum Ada Santri Terpilih
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.86rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
                Silakan pilih nama santri di panel sebelah kiri untuk melihat peta capaian 30 juz dan riwayat mutaba'ah setoran santri.
              </p>
            </div>
          ) : (
            <>
              {/* 🌟 1. HERO PROFILE CARD SANTRI 🌟 */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Gold Accent Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #15803d 0%, #ca8a04 50%, #16a34a 100%)'
            }} />

            {/* Profile Info Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                {/* Avatar Besar Santri */}
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #ca8a04 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  boxShadow: '0 6px 16px rgba(22,163,74,0.25)',
                  flexShrink: 0
                }}>
                  {currentSantri.nama ? currentSantri.nama.charAt(0).toUpperCase() : 'S'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentSantri.nama}
                    </h2>
                    <span style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1'
                    }}>
                      NIS: {currentSantri.nis || '202600'}
                    </span>
                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      Santri Aktif
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '10px',
                    fontSize: '0.78rem'
                  }}>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#f8fafc',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#475569'
                    }}>
                      <Users size={13} color="#15803d" />
                      <span><strong>Halaqah:</strong> {halaqah?.nama || 'Halaqah Pengampu'}</span>
                    </span>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#f8fafc',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      color: '#475569'
                    }}>
                      <User size={13} color="#ca8a04" />
                      <span><strong>Musyrif:</strong> {halaqah?.musyrif || 'Ustadz Pengampu'}</span>
                    </span>

                    {currentSantri.namaWali && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#f0fdf4',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                        color: '#166534'
                      }}>
                        <Phone size={13} color="#16a34a" />
                        <span><strong>Wali:</strong> {currentSantri.namaWali} ({currentSantri.kontakWali})</span>
                        {currentSantri.kontakWali && (
                          <a
                            href={`https://wa.me/${currentSantri.kontakWali.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat WhatsApp Wali Santri"
                            style={{ color: '#15803d', marginLeft: '3px', display: 'inline-flex' }}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol Action Santri */}
              {currentRole !== 'orangtua' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={onOpenQuickSetor}
                    style={{
                      ...btnBase,
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      color: '#15803d',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontWeight: 800,
                      fontSize: '0.80rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <PlusCircle size={15} />
                    <span>Input Setoran Santri</span>
                  </button>

                  {currentSantri && currentSantri.id && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCurrentSantri(currentSantri)}
                      title={`Hapus data santri ${currentSantri.nama || ''}`}
                      style={{
                        ...btnBase,
                        background: '#fff1f2',
                        border: '1.5px solid #fecdd3',
                        color: '#e11d48',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontSize: '0.80rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ffe4e6';
                        e.currentTarget.style.borderColor = '#fda4af';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff1f2';
                        e.currentTarget.style.borderColor = '#fecdd3';
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Hapus Santri</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Sparkles size={14} color="#16a34a" />
                  <span>Pantauan Wali Santri</span>
                </div>
              )}
            </div>

            {/* ─── 4 STAT METRIC CARDS ─── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginTop: '22px'
            }}>
              {/* Card 1: Mutqin */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534' }}>MUTQIN (LULUS)</span>
                  <Award size={16} color="#15803d" />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#14532d', marginTop: '4px' }}>
                  {totalMutqinCount} <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Juz</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#15803d', marginTop: '2px' }}>
                  {mutqinPercent}% dari Target 30 Juz
                </div>
              </div>

              {/* Card 2: Ziyadah */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>SELESAI ZIYADAH</span>
                  <BookOpen size={16} color="#059669" />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {totalZiyadahCount} <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Juz</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Butuh pemantapan tasmi'
                </div>
              </div>

              {/* Card 3: Total Setoran */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>TOTAL SETORAN</span>
                  <CheckCircle2 size={16} color="#0284c7" />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {santriSetoran.length} <span style={{ fontSize: '0.80rem', fontWeight: 700 }}>Kali</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  Mutaba'ah tercatat
                </div>
              </div>

              {/* Card 4: Presensi */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>KEHADIRAN</span>
                  <Calendar size={16} color="#ca8a04" />
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: persenKehadiran >= 90 ? '#15803d' : '#d97706', marginTop: '4px' }}>
                  {persenKehadiran}%
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  {totalHadir} Hadir, {totalIzin} Izin, {totalSakit} Sakit
                </div>
              </div>
            </div>

            {/* ─── TARGET PROGRESS BAR (MULTI-SEGMENT) ─── */}
            <div style={{
              marginTop: '18px',
              background: '#f8fafc',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                  Progres Target Capaian Hafalan: {totalMutqinCount} Juz Mutqin / Target {targetJuzGoal} Juz
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803d' }}>
                  {totalPercent}% Tercapai
                </span>
              </div>

              {/* Bar Visual */}
              <div style={{
                height: '12px',
                background: '#e2e8f0',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex'
              }}>
                {/* Segmen Mutqin */}
                <div 
                  style={{
                    width: `${mutqinPercent}%`,
                    background: 'linear-gradient(90deg, #15803d, #16a34a)',
                    transition: 'width 0.4s ease'
                  }}
                  title={`Mutqin: ${totalMutqinCount} Juz (${mutqinPercent}%)`}
                />
                {/* Segmen Ziyadah */}
                <div 
                  style={{
                    width: `${ziyadahPercent}%`,
                    background: 'linear-gradient(90deg, #34d399, #86efac)',
                    transition: 'width 0.4s ease'
                  }}
                  title={`Ziyadah: ${totalZiyadahCount} Juz (${ziyadahPercent}%)`}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.74rem',
                color: '#64748b',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#15803d', display: 'inline-block' }} />
                    Mutqin: <strong>{totalMutqinCount} Juz</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                    Ziyadah: <strong>{totalZiyadahCount} Juz</strong>
                  </span>
                </div>
                <span>Tersisa <strong>{Math.max(0, targetJuzGoal - totalMutqinCount)} Juz</strong> menuju target 30 Juz</span>
              </div>
            </div>
          </div>

          {/* 🌟 2. PETA 30 JUZ MUSHAF AL-QUR'AN (THE HERO GRID) 🌟 */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            {/* Header Card Peta 30 Juz */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '14px',
              marginBottom: '18px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#ca8a04',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Award size={18} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Peta 30 Juz Mushaf Al-Qur'an
                  </h3>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Klik pada kotak juz untuk melihat rincian surah atau mengubah status capaian santri
                </p>
              </div>

              {/* Legend Panduan Warna */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '13px', height: '13px', background: '#15803d', borderRadius: '4px', display: 'inline-block' }} />
                  <span style={{ color: '#166534', fontWeight: 700 }}>Mutqin ({totalMutqinCount})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '13px', height: '13px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '4px', display: 'inline-block' }} />
                  <span style={{ color: '#15803d', fontWeight: 700 }}>Ziyadah ({totalZiyadahCount})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '13px', height: '13px', background: '#fef3c7', border: '1px solid #fde047', borderRadius: '4px', display: 'inline-block' }} />
                  <span style={{ color: '#b45309', fontWeight: 700 }}>Sedang Proses</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '13px', height: '13px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'inline-block' }} />
                  <span style={{ color: '#64748b' }}>Belum Disetor</span>
                </div>
              </div>
            </div>

            {/* 🌟 THE 30 JUZ GRID CONTAINER (10 Kolom x 3 Baris) 🌟 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: '10px'
            }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(juzNum => {
                const status = getJuzStatus(juzNum);
                const isMutqin = status === 'mutqin';
                const isZiyadah = status === 'ziyadah';
                const isProses = status === 'proses';

                let bg = '#ffffff';
                let borderColor = '#e2e8f0';
                let numColor = '#1e293b';
                let labelText = 'Belum';
                let labelBg = '#f1f5f9';
                let labelColor = '#64748b';
                let icon = null;

                if (isMutqin) {
                  bg = 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)';
                  borderColor = '#15803d';
                  numColor = '#ffffff';
                  labelText = '✓ Mutqin';
                  labelBg = 'rgba(255,255,255,0.22)';
                  labelColor = '#ffffff';
                  icon = <Star size={11} fill="#fde047" color="none" />;
                } else if (isZiyadah) {
                  bg = '#f0fdf4';
                  borderColor = '#86efac';
                  numColor = '#166534';
                  labelText = '✓ Ziyadah';
                  labelBg = '#dcfce7';
                  labelColor = '#15803d';
                  icon = <BookOpen size={10} color="#15803d" />;
                } else if (isProses) {
                  bg = '#fffbeb';
                  borderColor = '#fde047';
                  numColor = '#b45309';
                  labelText = '⏳ Proses';
                  labelBg = '#fef3c7';
                  labelColor = '#92400e';
                  icon = <Clock size={10} color="#b45309" />;
                }

                return (
                  <div
                    key={juzNum}
                    onClick={() => setSelectedJuzModal(juzNum)}
                    title={`Juz ${juzNum}: ${JUZ_SURAH_LABEL[juzNum - 1] || ''} — Status: ${status.toUpperCase()} (Klik untuk ubah)`}
                    style={{
                      background: bg,
                      border: `1.8px solid ${borderColor}`,
                      borderRadius: '12px',
                      padding: '10px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isMutqin ? '0 4px 10px rgba(22,163,74,0.25)' : '0 1px 2px rgba(0,0,0,0.03)',
                      userSelect: 'none',
                      minHeight: '74px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isMutqin ? '0 4px 10px rgba(22,163,74,0.25)' : '0 1px 2px rgba(0,0,0,0.03)';
                    }}
                  >
                    {/* Nomor Juz */}
                    <div style={{
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: numColor,
                      lineHeight: 1
                    }}>
                      Juz {juzNum}
                    </div>

                    {/* Angka Arab Kecil */}
                    <div style={{
                      fontFamily: 'var(--font-arabic), "Amiri", serif',
                      fontSize: '0.74rem',
                      color: isMutqin ? 'rgba(255,255,255,0.85)' : '#ca8a04',
                      marginTop: '2px',
                      lineHeight: 1
                    }}>
                      {toArabicDigits(juzNum)}
                    </div>

                    {/* Label Badge Status */}
                    <div style={{
                      marginTop: '6px',
                      background: labelBg,
                      color: labelColor,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap'
                    }}>
                      {icon}
                      <span>{labelText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🌟 3. RIWAYAT MUTABA'AH SETORAN SANTRI 🌟 */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="#15803d" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Riwayat Setoran {currentSantri.nama}
                </h3>
              </div>
              <span style={{
                background: '#ecfdf5',
                color: '#15803d',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '10px',
                border: '1px solid #bbf7d0'
              }}>
                {santriSetoran.length} Setoran Masuk
              </span>
            </div>

            {/* Tabel Setoran Modern */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 6px',
                fontSize: '0.82rem'
              }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800 }}>Tanggal</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800 }}>Jenis</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800 }}>Surah &amp; Rentang Ayat</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>Juz</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>Nilai</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800 }}>Catatan Evaluasi</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {santriSetoran.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📖</div>
                        <div style={{ fontWeight: 700 }}>Belum ada catatan setoran untuk {currentSantri.nama}.</div>
                        <button
                          type="button"
                          onClick={onOpenQuickSetor}
                          style={{
                            ...btnBase,
                            background: '#15803d',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            marginTop: '10px'
                          }}
                        >
                          + Catat Setoran Pertama Sekarang
                        </button>
                      </td>
                    </tr>
                  ) : (
                    santriSetoran.map((s, idx) => (
                      <tr 
                        key={s.id || idx}
                        style={{
                          background: '#f8fafc',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#334155', borderRadius: '8px 0 0 8px' }}>
                          {s.tanggal}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: s.jenis === 'SABAQ' ? '#f0fdf4' : s.jenis === 'SABQI' ? '#eff6ff' : '#faf5ff',
                            color: s.jenis === 'SABAQ' ? '#15803d' : s.jenis === 'SABQI' ? '#1d4ed8' : '#7e22ce',
                            border: `1px solid ${s.jenis === 'SABAQ' ? '#86efac' : s.jenis === 'SABQI' ? '#93c5fd' : '#d8b4fe'}`,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '0.70rem'
                          }}>
                            {s.jenis}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#0f172a' }}>
                          <strong>{s.surahName}</strong> (Ayat {s.ayatAwal || s.ayatMulai || 1}–{s.ayatAkhir || 1})
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          Juz {s.juz || '-'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            background: '#ecfdf5',
                            color: '#15803d',
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {s.nilai || 'JAYYID'} {s.skor ? `(${s.skor})` : ''}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569', fontSize: '0.78rem' }}>
                          {s.catatanTajwid || s.catatan || '-'}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>
                          <strong style={{
                            fontSize: '0.74rem',
                            color: s.statusLanjut === 'Ulangi Setoran' || s.statusLanjut === 'Ulang' ? '#dc2626' : '#15803d'
                          }}>
                            {s.statusLanjut || 'Lanjut'}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}

        </div>
      </div>

      {/* ══════════ MODAL QUICK EDIT STATUS JUZ ══════════ */}
      {selectedJuzModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
            border: '1px solid #cbd5e1'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={22} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    Kelola Capaian Juz {selectedJuzModal}
                  </h3>
                  <div style={{ fontSize: '0.76rem', opacity: 0.9 }}>
                    Santri: <strong>{currentSantri.nama}</strong> (NIS: {currentSantri.nis})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJuzModal(null)}
                style={{
                  ...btnBase,
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Surah List in this Juz */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  Daftar Surah di Juz {selectedJuzModal}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {getSurahsByJuz(selectedJuzModal).map(surah => (
                    <span 
                      key={surah.id} 
                      style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        background: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px',
                        color: '#0f172a',
                        fontWeight: 600
                      }}
                    >
                      {surah.name} ({surah.arabic}) • {surah.versesCount} Ayat
                    </span>
                  ))}
                  {getSurahsByJuz(selectedJuzModal).length === 0 && (
                    <span style={{ fontSize: '0.80rem', color: '#64748b' }}>
                      {JUZ_SURAH_LABEL[selectedJuzModal - 1]}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Action Buttons / Read-Only View */}
              {currentRole === 'orangtua' ? (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                    Status Capaian Juz {selectedJuzModal} Ananda Saat Ini:
                  </div>
                  {getJuzStatus(selectedJuzModal) === 'mutqin' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                      color: '#ffffff',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.90rem'
                    }}>
                      <Star size={18} fill="#fde047" color="none" />
                      <span>MUTQIN (Lulus Tasmi')</span>
                    </span>
                  )}
                  {getJuzStatus(selectedJuzModal) === 'ziyadah' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.90rem'
                    }}>
                      <BookOpen size={18} />
                      <span>ZIYADAH (Dalam Pemantapan Muroja'ah)</span>
                    </span>
                  )}
                  {getJuzStatus(selectedJuzModal) === 'proses' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#fefce8',
                      border: '1px solid #fde047',
                      color: '#854d0e',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.90rem'
                    }}>
                      <Clock size={18} />
                      <span>PROSES SETORAN AYAT</span>
                    </span>
                  )}
                  {getJuzStatus(selectedJuzModal) === 'belum' && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.90rem'
                    }}>
                      <span>BELUM TERHAFAL</span>
                    </span>
                  )}
                  <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '12px', marginBottom: 0 }}>
                    * Status capaian juz hanya dapat diubah oleh Ustadz Pengampu setelah pengujian tasmi' / evaluasi halaqah.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>
                    Ubah Status Capaian Santri:
                  </label>

                  {/* Tombol Mutqin */}
                  <button 
                    type="button" 
                    onClick={() => handleSetJuzStatus(selectedJuzModal, 'mutqin')}
                    style={{
                      ...btnBase,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 10px rgba(22,163,74,0.25)'
                    }}
                  >
                    <Star size={20} fill="#fde047" color="none" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Tandai Sebagai Mutqin (Lulus Tasmi')</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Hafalan lancar, tajwid mantap, sudah diuji musyrif</div>
                    </div>
                  </button>

                  {/* Tombol Ziyadah */}
                  <button 
                    type="button" 
                    onClick={() => handleSetJuzStatus(selectedJuzModal, 'ziyadah')}
                    style={{
                      ...btnBase,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      color: '#15803d',
                      borderRadius: '12px'
                    }}
                  >
                    <BookOpen size={20} color="#15803d" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Tandai Selesai Ziyadah</div>
                      <div style={{ fontSize: '0.72rem', color: '#166534' }}>Ayat selesai disetor, dalam proses pemantapan muroja'ah</div>
                    </div>
                  </button>

                  {/* Tombol Reset */}
                  <button 
                    type="button" 
                    onClick={() => handleSetJuzStatus(selectedJuzModal, 'belum')}
                    style={{
                      ...btnBase,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      borderRadius: '12px'
                    }}
                  >
                    <RotateCcw size={18} color="#64748b" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>Reset ke Belum Disetor</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Hapus tanda mutqin / ziyadah untuk juz ini</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                type="button"
                onClick={() => setSelectedJuzModal(null)}
                style={{
                  ...btnBase,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontWeight: 700,
                  fontSize: '0.80rem',
                  color: '#475569'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
