import React, { useState, useEffect } from 'react';
import { X, Check, BookOpen, Award, Sparkles } from 'lucide-react';
import { QURAN_SURAH } from '../data/quranData';
import confetti from 'canvas-confetti';
import CustomSelect from './common/CustomSelect';

const TAJWID_TAGS = [
  "Tartil & Mutqin",
  "Makhraj 'Ain & Ha'",
  "Ghunnah Nun/Mim Tasydid",
  "Mad Wajib/Jaiz (4-5 Harakat)",
  "Qalqalah Kubra/Sughra",
  "Waqaf & Ibtida' Tepat",
  "Kelancaran Sangat Baik"
];

export default function SetoranModal({ isOpen, onClose, onSave, santriList, halaqahList, initialSantriId = "" }) {
  const [santriId, setSantriId] = useState(initialSantriId);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jenis, setJenis] = useState("Ziyadah");
  const [surahId, setSurahId] = useState(78); // default An-Naba'
  const [ayatAwal, setAyatAwal] = useState(1);
  const [ayatAkhir, setAyatAkhir] = useState(10);
  const [halaman, setHalaman] = useState(1);
  const [nilai, setNilai] = useState("Mumtaz");
  const [skor, setSkor] = useState(95);
  const [catatanTajwid, setCatatanTajwid] = useState("");
  const [statusLanjut, setStatusLanjut] = useState("Lanjut Ayat Baru");
  const [musyrif, setMusyrif] = useState("");

  const selectedSurah = QURAN_SURAH.find(s => s.id === parseInt(surahId)) || QURAN_SURAH[0];

  useEffect(() => {
    if (initialSantriId) {
      setSantriId(initialSantriId);
    } else if (santriList.length > 0 && !santriId) {
      setSantriId(santriList[0].id);
    }
  }, [initialSantriId, santriList]);

  // Update default musyrif based on santri's halaqah
  useEffect(() => {
    const s = santriList.find(item => item.id === santriId);
    if (s && halaqahList.length > 0) {
      const h = halaqahList.find(item => item.id === s.halaqahId);
      if (h) setMusyrif(h.musyrif);
    }
  }, [santriId, santriList, halaqahList]);

  // Quick helper: Set full surah
  const handleSetFullSurah = () => {
    setAyatAwal(1);
    setAyatAkhir(selectedSurah.versesCount);
  };

  const handleRatingChange = (ratingType) => {
    setNilai(ratingType);
    if (ratingType === "Mumtaz") setSkor(95);
    else if (ratingType === "Jayyid Jiddan") setSkor(85);
    else if (ratingType === "Jayyid") setSkor(75);
    else if (ratingType === "Maqbul") setSkor(65);
    else if (ratingType === "Rasib") setSkor(50);
  };

  const handleAddTag = (tag) => {
    if (!catatanTajwid) {
      setCatatanTajwid(tag);
    } else if (!catatanTajwid.includes(tag)) {
      setCatatanTajwid(prev => prev + ". " + tag);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!santriId) {
      alert("Silakan pilih santri terlebih dahulu!");
      return;
    }

    const payload = {
      santriId,
      tanggal,
      jenis,
      surahId: selectedSurah.id,
      surahName: selectedSurah.name,
      ayatAwal: parseInt(ayatAwal) || 1,
      ayatAkhir: parseInt(ayatAkhir) || selectedSurah.versesCount,
      halaman: parseFloat(halaman) || 1,
      juz: selectedSurah.juz,
      nilai,
      skor: parseInt(skor),
      catatanTajwid,
      statusLanjut,
      musyrif: musyrif || "Musyrif Halaqah"
    };

    onSave(payload);

    if (nilai === "Mumtaz" || jenis === "Tasmi'") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti fallback
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="stat-icon emerald" style={{ width: '40px', height: '40px' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Input Setoran Hafalan</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Catat evaluasi Ziyadah, Muraja'ah, atau Tasmi' santri
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Santri & Jenis Setoran */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pilih Santri *</label>
                <CustomSelect 
                  value={santriId} 
                  onChange={(e) => setSantriId(e.target.value)}
                  placeholder="-- Pilih Santri --"
                  searchable={true}
                  searchPlaceholder="Cari nama santri..."
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {santriList.map(s => {
                    const h = halaqahList.find(item => item.id === s.halaqahId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kelas} - {h ? h.nama.replace('Halaqah ', '') : ''})
                      </option>
                    );
                  })}
                </CustomSelect>
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Setoran *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {["Ziyadah", "Muroja'ah", "Tasmi'"].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setJenis(type)}
                      className={`btn btn-sm ${jenis === type ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '8px 4px', fontSize: '0.82rem' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tanggal & Surah */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tanggal Setoran *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={tanggal} 
                  onChange={(e) => setTanggal(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Surah Al-Qur'an *</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                    Juz {selectedSurah.juz} ({selectedSurah.revelation})
                  </span>
                </div>
                <CustomSelect 
                  value={surahId} 
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setSurahId(id);
                    const s = QURAN_SURAH.find(item => item.id === id);
                    if (s) {
                      setAyatAwal(1);
                      setAyatAkhir(Math.min(10, s.versesCount));
                    }
                  }}
                  searchable={true}
                  searchPlaceholder="Cari nama surah atau nomor..."
                  required
                >
                  {QURAN_SURAH.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id}. {s.name} ({s.arabic}) - {s.versesCount} Ayat
                    </option>
                  ))}
                </CustomSelect>
              </div>
            </div>

            {/* Ayat Awal, Ayat Akhir, Halaman */}
            <div style={{ background: 'var(--slate-50)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                  Rentang Ayat ({selectedSurah.name} : max {selectedSurah.versesCount} ayat)
                </span>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={handleSetFullSurah}
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  Setor 1 Surah Penuh
                </button>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ayat Awal</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedSurah.versesCount}
                    className="form-input" 
                    value={ayatAwal} 
                    onChange={(e) => setAyatAwal(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Ayat Akhir</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedSurah.versesCount}
                    className="form-input" 
                    value={ayatAkhir} 
                    onChange={(e) => setAyatAkhir(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Jumlah Halaman</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0.5" 
                    className="form-input" 
                    value={halaman} 
                    onChange={(e) => setHalaman(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Penilaian Kualitas */}
            <div className="form-group">
              <label className="form-label">Kualitas Bacaan & Kelancaran *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { name: "Mumtaz", label: "Mumtaz (90-100)", bg: "var(--primary-600)" },
                  { name: "Jayyid Jiddan", label: "Jayyid Jiddan (80-89)", bg: "#4f46e5" },
                  { name: "Jayyid", label: "Jayyid (70-79)", bg: "#0284c7" },
                  { name: "Maqbul", label: "Maqbul (60-69)", bg: "#d97706" }
                ].map(r => (
                  <button
                    type="button"
                    key={r.name}
                    onClick={() => handleRatingChange(r.name)}
                    className="btn btn-sm"
                    style={{
                      background: nilai === r.name ? r.bg : 'var(--white)',
                      color: nilai === r.name ? '#fff' : 'var(--slate-700)',
                      border: `1px solid ${nilai === r.name ? r.bg : 'var(--slate-300)'}`,
                      padding: '8px 4px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    {nilai === r.name && <Check size={14} />}
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tajwid Chips */}
            <div className="form-group">
              <label className="form-label">Pilihan Catatan Cepat (Klik untuk menambah):</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {TAJWID_TAGS.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--slate-300)',
                      background: 'var(--white)',
                      color: 'var(--slate-700)',
                      cursor: 'pointer'
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <textarea 
                className="form-textarea" 
                rows="2"
                placeholder="Catatan tajwid, fashohah, atau makharijul huruf..."
                value={catatanTajwid}
                onChange={(e) => setCatatanTajwid(e.target.value)}
              />
            </div>

            {/* Status Lanjut & Musyrif */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status Evaluasi</label>
                <CustomSelect 
                  value={statusLanjut}
                  onChange={(e) => setStatusLanjut(e.target.value)}
                >
                  <option value="Lanjut Ayat Baru">Lanjut Ayat Baru (Tuntas)</option>
                  <option value="Ulangi Setoran">Perlu Diulang (Belum Lancar)</option>
                  <option value="Lanjut Juz Baru">Lanjut Juz Baru (Naik Tingkat)</option>
                </CustomSelect>
              </div>

              <div className="form-group">
                <label className="form-label">Musyrif Penyimak</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={musyrif} 
                  onChange={(e) => setMusyrif(e.target.value)}
                  placeholder="Nama Ustadz / Musyrif"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              Simpan Setoran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
