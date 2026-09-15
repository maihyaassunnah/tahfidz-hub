import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Check, Flag, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { getMadinahMushafPage } from '../services/quranService';
import { QURAN_SURAH } from '../data/quranData';
import { calculateMushaf15Lines } from '../utils/mushafCalculator';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicDigits(num) {
  if (num == null) return '';
  return String(num).replace(/[0-9]/g, d => ARABIC_DIGITS[d]);
}

/**
 * Komponen Ornamen Nomor Ayat (Ayah End Marker) Standar Mushaf Madinah
 * Berbentuk lingkaran ganda emas berornamen dengan angka Arab di tengahnya
 */
function AyahMarker({ verseNum, isSelected, isTarget, isLastSetor, onClick }) {
  const arabicNum = toArabicDigits(verseNum);
  return (
    <span
      className="ayah-marker"
      onClick={onClick}
      title={`Akhir Ayat ${verseNum} — Klik untuk jadikan ayat terakhir yang disetor`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '32px',
        height: '32px',
        margin: '0 4px',
        verticalAlign: 'middle',
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        {/* Lingkaran luar emas atau hijau */}
        <circle
          cx="18"
          cy="18"
          r="15"
          fill={isLastSetor ? '#dcfce7' : isSelected ? '#bbf7d0' : isTarget ? '#fefce8' : '#fffbeb'}
          stroke={isLastSetor ? '#15803d' : isSelected ? '#16a34a' : '#ca8a04'}
          strokeWidth={isLastSetor || isSelected ? '2.4' : '1.8'}
        />
        {/* Lingkaran dalam ornamen titik-titik */}
        <circle
          cx="18"
          cy="18"
          r="12"
          fill="none"
          stroke={isLastSetor ? '#16a34a' : '#d97706'}
          strokeWidth="0.8"
          strokeDasharray="2, 1.5"
        />
      </svg>
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          fontSize: String(verseNum).length > 2 ? '11px' : '13px',
          fontWeight: 800,
          color: isLastSetor ? '#14532d' : isSelected ? '#15803d' : '#854d0e',
          fontFamily: 'var(--font-arabic), "Amiri", serif',
          lineHeight: 1
        }}
      >
        {arabicNum}
      </span>
    </span>
  );
}

export default function MushafMadinahSimakModal({
  isOpen,
  onClose,
  initialPage = 219,
  surah,
  ayatMulai = 1,
  ayatAkhir = 1,
  setAyatAkhir,
  onAyatAkhirChange,
  santriName = 'Santri',
  salahHafalan = 0,
  setSalahHafalan,
  salahTajwid = 0,
  setSalahTajwid,
  statusLanjut = 'Lanjut',
  setStatusLanjut,
  onFinish
}) {
  const modalContainerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVerseKey, setSelectedVerseKey] = useState(null);
  const [selectedVerseInfo, setSelectedVerseInfo] = useState(null);
  const [lastSetorVerse, setLastSetorVerse] = useState(parseInt(ayatAkhir) || parseInt(ayatMulai) || 1);
  const [lastSetorSurahId, setLastSetorSurahId] = useState(surah?.id || 1);
  const [fontSize, setFontSize] = useState(26);
  const [markedVerseKeys, setMarkedVerseKeys] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Inisialisasi saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const p = Math.min(604, Math.max(1, parseInt(initialPage) || 1));
      setCurrentPage(p);
      setSelectedVerseKey(null);
      setSelectedVerseInfo(null);
      setLastSetorVerse(parseInt(ayatAkhir) || parseInt(ayatMulai) || 1);
      setLastSetorSurahId(surah?.id || 1);
      setMarkedVerseKeys(new Set());
    }
  }, [isOpen, initialPage, ayatAkhir, ayatMulai, surah]);

  // Reset verse info saat berganti halaman
  useEffect(() => {
    setSelectedVerseKey(null);
    setSelectedVerseInfo(null);
  }, [currentPage]);

  // Load data halaman Uthmani dari API / Cache
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);
    getMadinahMushafPage(currentPage)
      .then(data => {
        if (isMounted) {
          setPageData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [currentPage, isOpen]);

  // Event listener fullscreen
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!isOpen) return null;

  const startAyatNum = parseInt(ayatMulai) || 1;
  const effectiveEndAyatNum = parseInt(lastSetorVerse) || parseInt(ayatAkhir) || startAyatNum;
  const startSurahId = parseInt(surah?.id || 1);
  const effectiveEndSurahId = parseInt(lastSetorSurahId || startSurahId);
  const startSurahObj = QURAN_SURAH.find(s => s.id === startSurahId) || surah || QURAN_SURAH[0];
  const endSurahObj = QURAN_SURAH.find(s => s.id === effectiveEndSurahId) || startSurahObj;

  const currentSurahOnPage = pageData?.surahs?.[0] || (QURAN_SURAH.find(s => s.id === effectiveEndSurahId)) || surah || QURAN_SURAH[0];
  const juzNumber = pageData?.juz || Math.ceil(currentPage / 20);

  // Cek apakah ayat berada dalam rentang setoran santri (mendukung beda halaman & beda surat)
  const isVerseInTarget = (segSurahId, segVerseNum) => {
    const sId = parseInt(segSurahId || startSurahId);
    const vNum = parseInt(segVerseNum);

    if (startSurahId === effectiveEndSurahId) {
      if (sId !== startSurahId) return false;
      return vNum >= startAyatNum && vNum <= effectiveEndAyatNum;
    } else if (startSurahId < effectiveEndSurahId) {
      if (sId < startSurahId || sId > effectiveEndSurahId) return false;
      if (sId === startSurahId) return vNum >= startAyatNum;
      if (sId === effectiveEndSurahId) return vNum <= effectiveEndAyatNum;
      return true; // Surah di antaranya otomatis penuh masuk rentang
    } else {
      if (sId === startSurahId) return vNum >= startAyatNum;
      if (sId === effectiveEndSurahId) return vNum <= effectiveEndAyatNum;
      return false;
    }
  };

  // Navigasi cepat ke surat apa pun
  const handleJumpToSurah = (sId) => {
    const numId = parseInt(sId);
    try {
      const pos = calculateMushaf15Lines(numId, 1, 1);
      if (pos && pos.startPage) {
        setCurrentPage(pos.startPage);
      }
    } catch {}
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (modalContainerRef.current?.requestFullscreen) {
        modalContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // KLIK AYAT: Otomatis tetapkan sebagai Ayat Terakhir yang Disetor (bisa beda surat dan beda halaman)
  const handleVerseClick = (verseKey, verseNum, surahId) => {
    const targetSurahId = parseInt(surahId || currentSurahOnPage?.id || startSurahId);
    setSelectedVerseKey(verseKey);
    setSelectedVerseInfo({ verseKey, verseNum, surahId: targetSurahId });

    // 1. Update state lokal untuk visual rentang setoran
    setLastSetorVerse(verseNum);
    setLastSetorSurahId(targetSurahId);

    // 2. Sinkronkan ke formulir parent SetoranView
    if (setAyatAkhir) {
      setAyatAkhir(verseNum);
    }
    if (onAyatAkhirChange) {
      onAyatAkhirChange(verseNum, targetSurahId, currentPage);
    }
  };

  // Tandai salah pada ayat yang dipilih
  const handleToggleMark = (verseKey) => {
    setMarkedVerseKeys(prev => {
      const next = new Set(prev);
      if (next.has(verseKey)) {
        next.delete(verseKey);
      } else {
        next.add(verseKey);
        if (setSalahHafalan) setSalahHafalan(s => s + 1);
      }
      return next;
    });
  };

  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(604, p + 1));

  const handleFinish = () => {
    if (setAyatAkhir) setAyatAkhir(effectiveEndAyatNum);
    if (onAyatAkhirChange) onAyatAkhirChange(effectiveEndAyatNum, effectiveEndSurahId, currentPage);
    if (onFinish) onFinish({
      ayatAkhir: effectiveEndAyatNum,
      surahAkhirId: effectiveEndSurahId,
      halaman: currentPage
    });
    onClose();
  };

  const btnBase = {
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease'
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.88)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isFullscreen ? 0 : '10px'
    }}>
      <div
        ref={modalContainerRef}
        style={{
          background: '#fafaf8',
          borderRadius: isFullscreen ? 0 : '20px',
          maxWidth: isFullscreen ? '100vw' : '980px',
          width: '100%',
          height: isFullscreen ? '100vh' : '96vh',
          maxHeight: isFullscreen ? '100vh' : '96vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isFullscreen ? 'none' : '0 30px 80px -10px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          border: isFullscreen ? 'none' : '1px solid #d1d5db'
        }}
      >

        {/* ══════════ TOP CONTROL BAR ══════════ */}
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Santri & Target Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
            }}>📖</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#111827' }}>
                  {santriName}
                </span>
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0'
                }}>
                  Sedang Menyimak
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '2px' }}>
                Mulai: <strong>{startSurahObj?.name} ({startAyatNum})</strong> → Batas: <strong style={{ color: '#15803d' }}>{endSurahObj?.name} ({effectiveEndAyatNum})</strong> · Hlm {currentPage}/604
              </div>
            </div>
          </div>

          {/* Quick Surah Jump + Quick Page Nav + Zoom + Fullscreen + Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Quick Surah Jump Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <select
                value={pageData?.surahs?.[0]?.id || lastSetorSurahId || startSurahId}
                onChange={(e) => handleJumpToSurah(e.target.value)}
                style={{
                  height: '28px',
                  borderRadius: '8px',
                  border: '1.5px solid #86efac',
                  background: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#15803d',
                  padding: '0 6px',
                  cursor: 'pointer',
                  maxWidth: '160px',
                  outline: 'none'
                }}
                title="Lompat langsung ke Surat pilihan"
              >
                {QURAN_SURAH.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id}. {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigasi Halaman Cepat */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9px',
              padding: '2px 6px'
            }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={goToPrevPage}
                title="Halaman Sebelumnya"
                style={{
                  ...btnBase,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'none',
                  color: currentPage <= 1 ? '#cbd5e1' : '#374151',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                ← Prev
              </button>
              <input
                type="number"
                min="1"
                max="604"
                value={currentPage}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (v >= 1 && v <= 604) setCurrentPage(v);
                }}
                style={{
                  width: '48px',
                  height: '26px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  background: '#ffffff',
                  outline: 'none',
                  color: '#15803d',
                  fontFamily: 'inherit'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginRight: '2px' }}>/604</span>
              <button
                type="button"
                disabled={currentPage >= 604}
                onClick={goToNextPage}
                title="Halaman Selanjutnya"
                style={{
                  ...btnBase,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'none',
                  color: currentPage >= 604 ? '#cbd5e1' : '#374151',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                Next →
              </button>
            </div>

            {/* Font Zoom */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '9px',
              padding: '2px 4px'
            }}>
              <button
                type="button"
                onClick={() => setFontSize(s => Math.max(18, s - 2))}
                title="Perkecil Tulisan"
                style={{ ...btnBase, padding: '4px 7px', color: '#4b5563', background: 'none', fontWeight: 800 }}
              >
                −A
              </button>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1f2937', minWidth: '24px', textAlign: 'center' }}>
                {fontSize}
              </span>
              <button
                type="button"
                onClick={() => setFontSize(s => Math.min(38, s + 2))}
                title="Perbesar Tulisan"
                style={{ ...btnBase, padding: '4px 7px', color: '#4b5563', background: 'none', fontWeight: 800 }}
              >
                +A
              </button>
            </div>

            {/* 🌟 TOMBOL TAMPILAN PENUH (FULLSCREEN) 🌟 */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Keluar dari Layar Penuh" : "Tampilan Layar Penuh"}
              style={{
                ...btnBase,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isFullscreen ? '#fef3c7' : '#f0fdf4',
                border: `1px solid ${isFullscreen ? '#fde047' : '#bbf7d0'}`,
                color: isFullscreen ? '#92400e' : '#15803d',
                borderRadius: '9px',
                padding: '5px 12px',
                fontSize: '0.76rem',
                fontWeight: 800,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={14} />
                  <span>Perkecil</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span>Layar Penuh</span>
                </>
              )}
            </button>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup Mushaf"
              style={{
                ...btnBase,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: '15px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ══════════ AYAT INFO & AUTO-SETOR BANNER ══════════ */}
        {selectedVerseInfo && (
          <div style={{
            background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)',
            borderBottom: '1.5px solid #86efac',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.1rem' }}>📌</span>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#14532d' }}>
                  Ayat {selectedVerseInfo.verseNum} ditetapkan sebagai Ayat Terakhir yang Disetor!
                </span>
                <span style={{
                  marginLeft: '10px',
                  background: '#15803d',
                  color: '#ffffff',
                  padding: '2px 9px',
                  borderRadius: '8px',
                  fontSize: '0.70rem',
                  fontWeight: 800
                }}>
                  Target: Ayat {startAyatNum} s/d {selectedVerseInfo.verseNum}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleToggleMark(selectedVerseInfo.verseKey)}
                style={{
                  ...btnBase,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: markedVerseKeys.has(selectedVerseInfo.verseKey) ? '#fee2e2' : '#ffffff',
                  border: `1.5px solid ${markedVerseKeys.has(selectedVerseInfo.verseKey) ? '#f87171' : '#cbd5e1'}`,
                  color: markedVerseKeys.has(selectedVerseInfo.verseKey) ? '#dc2626' : '#374151',
                  borderRadius: '7px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 800
                }}
              >
                <Flag size={12} />
                <span>{markedVerseKeys.has(selectedVerseInfo.verseKey) ? '✕ Batal Tandai' : '⚑ Tandai Salah'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedVerseKey(null);
                  setSelectedVerseInfo(null);
                }}
                style={{
                  ...btnBase,
                  background: 'none',
                  color: '#6b7280',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  padding: '4px 8px'
                }}
              >
                Tutup ✕
              </button>
            </div>
          </div>
        )}

        {/* ══════════ MAIN CONTENT: MUSHAF MADINAH TEKS INTERAKTIF ══════════ */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: isFullscreen ? '20px 24px' : '16px 20px',
          background: '#f1f5f9'
        }}>
          <div style={{
            maxWidth: isFullscreen ? '1040px' : '860px',
            width: '100%',
            margin: '0 auto'
          }}>

            {/* Header info bar dalam halaman */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#15803d' }}>
                  Halaman {currentPage} · Juz {juzNumber}
                </span>
                <span style={{ color: '#94a3b8' }}>•</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                  سُورَةُ {currentSurahOnPage?.arabic || surah?.arabic || ''} ({currentSurahOnPage?.name || surahName})
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                💡 <em>Klik ayat apa pun untuk menetapkannya sebagai batas akhir setoran</em>
              </div>
            </div>

            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '380px',
                gap: '14px',
                background: '#fffdf9',
                borderRadius: '16px',
                border: '2px solid #ca8a04'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  border: '3.5px solid #dcfce7',
                  borderTopColor: '#15803d',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#15803d' }}>
                  Memuat teks Mushaf Madinah Halaman {currentPage}...
                </span>
              </div>
            ) : (
              /* 📜 LEMBAR MUSHAF MADINAH OTENTIK 📜 */
              <div style={{
                background: '#fffdf9',
                border: '3.5px double #ca8a04',
                borderRadius: '18px',
                padding: isFullscreen ? '28px 36px' : '22px 28px',
                direction: 'rtl',
                boxShadow: '0 8px 30px rgba(0,0,0,0.07)',
                position: 'relative'
              }}>

                {/* Header Surah di atas jika ada surah baru di halaman ini */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid #ca8a04',
                  paddingBottom: '10px',
                  marginBottom: '18px'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-arabic), "Amiri", serif',
                    fontSize: '1.25rem',
                    color: '#15803d',
                    fontWeight: 700
                  }}>
                    سُورَةُ {currentSurahOnPage?.arabic || ''}
                  </div>
                  <div style={{
                    fontSize: '0.80rem',
                    fontWeight: 800,
                    color: '#854d0e',
                    fontFamily: 'var(--font-arabic), "Amiri", serif'
                  }}>
                    الجزء {toArabicDigits(juzNumber)}
                  </div>
                </div>

                {/* 📖 TEKS AYAT AL-QUR'AN STANDAR MADINAH 📖 */}
                <div style={{
                  textAlign: 'justify',
                  textAlignLast: 'right',
                  lineHeight: 2.7
                }}>
                  {pageData?.lines?.map((line) => {
                    // Kelompokkan kata-kata dalam baris ini per ayat
                    const segments = [];
                    let curSeg = null;

                    (line.words || []).forEach(w => {
                      if (!w.verseKey) return;
                      if (!curSeg || curSeg.verseKey !== w.verseKey) {
                        curSeg = {
                          verseKey: w.verseKey,
                          verseNum: w.verseNumber,
                          surahId: parseInt(w.verseKey?.split(':')[0] || 1),
                          words: [],
                          hasEnd: false
                        };
                        segments.push(curSeg);
                      }
                      if (w.charType === 'end') {
                        curSeg.hasEnd = true;
                      } else {
                        curSeg.words.push(w.text || '');
                      }
                    });

                    return segments.map((seg, si) => {
                      const isTarget = isVerseInTarget(seg.surahId, seg.verseNum);
                      const isMarked = markedVerseKeys.has(seg.verseKey);
                      const isSelected = selectedVerseKey === seg.verseKey;
                      const isLastSetor = (seg.surahId === effectiveEndSurahId && seg.verseNum === effectiveEndAyatNum);

                      return (
                        <span
                          key={`${seg.verseKey}-${line.lineNumber}-${si}`}
                          style={{ display: 'inline', position: 'relative' }}
                        >
                          {/* Kata-kata Lafadz Ayat (Clickable) */}
                          {seg.words.length > 0 && (
                            <span
                              onClick={() => handleVerseClick(seg.verseKey, seg.verseNum, seg.surahId)}
                              title={`Ayat ${seg.verseNum} — Klik untuk jadikan ayat terakhir yang disetor`}
                              style={{
                                fontFamily: 'var(--font-arabic), "Amiri", serif',
                                fontSize: `${fontSize}px`,
                                cursor: 'pointer',
                                padding: '3px 6px',
                                borderRadius: '6px',
                                display: 'inline',
                                background: isMarked
                                  ? 'rgba(239, 68, 68, 0.22)'
                                  : isLastSetor
                                    ? 'rgba(34, 197, 94, 0.28)'
                                    : isSelected
                                      ? 'rgba(34, 197, 94, 0.35)'
                                      : isTarget
                                        ? 'rgba(34, 197, 94, 0.12)'
                                        : 'transparent',
                                color: isMarked ? '#b91c1c' : '#1a1a1a',
                                borderBottom: isLastSetor
                                  ? '3px solid #15803d'
                                  : isSelected
                                    ? '2.5px solid #16a34a'
                                    : isTarget
                                      ? '2px solid #86efac'
                                      : 'none',
                                outline: isLastSetor
                                  ? '1.5px solid #15803d'
                                  : isSelected
                                    ? '1.5px solid #16a34a'
                                    : 'none',
                                transition: 'background 0.15s ease'
                              }}
                            >
                              {seg.words.join(' ')}
                            </span>
                          )}

                          {/* 🌟 ORNAMEN NOMOR AYAT (HANYA MUNCUL DI AKHIR AYAT) 🌟 */}
                          {seg.hasEnd && (
                            <AyahMarker
                              verseNum={seg.verseNum}
                              isSelected={isSelected}
                              isTarget={isTarget}
                              isLastSetor={isLastSetor}
                              onClick={() => handleVerseClick(seg.verseKey, seg.verseNum, seg.surahId)}
                            />
                          )}
                          {' '}
                        </span>
                      );
                    });
                  })}
                </div>

                {/* Footer Halaman Mushaf */}
                <div style={{
                  textAlign: 'center',
                  borderTop: '2px solid #ca8a04',
                  paddingTop: '12px',
                  marginTop: '22px',
                  fontFamily: 'var(--font-arabic), "Amiri", serif',
                  fontSize: '1.15rem',
                  color: '#15803d',
                  fontWeight: 700
                }}>
                  — {toArabicDigits(currentPage)} —
                </div>
              </div>
            )}

            {/* Legend Keterangan Warna */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '14px',
              padding: '10px 16px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '0.74rem'
            }}>
              {[
                { bg: 'rgba(34, 197, 94, 0.12)', border: '1.5px solid #86efac', label: `Rentang Setoran (Ayat ${startAyatNum}–${effectiveEndAyatNum})` },
                { bg: 'rgba(34, 197, 94, 0.28)', border: '2px solid #15803d', label: `📌 Batas Akhir Setoran (Ayat ${effectiveEndAyatNum})` },
                { bg: 'rgba(239, 68, 68, 0.22)', border: '1.5px solid #ef4444', label: 'Tandai Kesalahan (Hafalan/Tajwid)' }
              ].map(({ bg, border, label }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <span style={{ width: '13px', height: '13px', borderRadius: '4px', background: bg, border, display: 'inline-block' }} />
                  <strong>{label}</strong>
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* ══════════ BOTTOM EVALUATION BAR ══════════ */}
        <div style={{
          background: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          padding: '12px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Counter Salah Hafalan */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>SALAH HAFALAN:</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#f8fafc'
              }}>
                <button
                  type="button"
                  onClick={() => setSalahHafalan && setSalahHafalan(s => Math.max(0, s - 1))}
                  style={{ ...btnBase, width: '28px', height: '28px', background: '#f1f5f9', fontWeight: 800 }}
                >−</button>
                <span style={{ width: '32px', textAlign: 'center', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  {salahHafalan}
                </span>
                <button
                  type="button"
                  onClick={() => setSalahHafalan && setSalahHafalan(s => s + 1)}
                  style={{ ...btnBase, width: '28px', height: '28px', background: '#f1f5f9', fontWeight: 800 }}
                >+</button>
              </div>
            </div>

            {/* Counter Salah Tajwid */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>SALAH TAJWID:</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#f8fafc'
              }}>
                <button
                  type="button"
                  onClick={() => setSalahTajwid && setSalahTajwid(s => Math.max(0, s - 1))}
                  style={{ ...btnBase, width: '28px', height: '28px', background: '#f1f5f9', fontWeight: 800 }}
                >−</button>
                <span style={{ width: '32px', textAlign: 'center', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  {salahTajwid}
                </span>
                <button
                  type="button"
                  onClick={() => setSalahTajwid && setSalahTajwid(s => s + 1)}
                  style={{ ...btnBase, width: '28px', height: '28px', background: '#f1f5f9', fontWeight: 800 }}
                >+</button>
              </div>
            </div>

            {/* Status Lanjut / Ulang */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>STATUS:</span>
              <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <button
                  type="button"
                  onClick={() => setStatusLanjut && setStatusLanjut('Lanjut')}
                  style={{
                    ...btnBase,
                    padding: '5px 14px',
                    background: statusLanjut === 'Lanjut' ? '#16a34a' : '#ffffff',
                    color: statusLanjut === 'Lanjut' ? '#ffffff' : '#64748b',
                    fontSize: '0.76rem',
                    fontWeight: 800
                  }}
                >
                  Lanjut
                </button>
                <button
                  type="button"
                  onClick={() => setStatusLanjut && setStatusLanjut('Ulang')}
                  style={{
                    ...btnBase,
                    padding: '5px 14px',
                    background: statusLanjut === 'Ulang' ? '#dc2626' : '#ffffff',
                    color: statusLanjut === 'Ulang' ? '#ffffff' : '#64748b',
                    fontSize: '0.76rem',
                    fontWeight: 800
                  }}
                >
                  Ulang
                </button>
              </div>
            </div>
          </div>

          {/* Tombol Selesai Menyimak */}
          <button
            type="button"
            onClick={handleFinish}
            style={{
              ...btnBase,
              background: 'linear-gradient(135deg, #15803d, #16a34a)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 20px',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22,163,74,0.35)'
            }}
          >
            <Check size={16} />
            <span>Selesai Menyimak ({startSurahObj?.name}:{startAyatNum} – {endSurahObj?.name}:{effectiveEndAyatNum})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
