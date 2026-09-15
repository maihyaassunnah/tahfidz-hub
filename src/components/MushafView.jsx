import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  Search
} from 'lucide-react';
import { getMadinahMushafPage } from '../services/quranService';
import { QURAN_SURAH } from '../data/quranData';
import { getSurahPageBounds } from '../data/quranSurahPages';
import CustomSelect from './common/CustomSelect';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicDigits(num) {
  if (num == null) return '';
  return String(num).replace(/[0-9]/g, d => ARABIC_DIGITS[d]);
}

// Halaman awal untuk setiap Juz 1 s/d 30 pada Mushaf Madinah Standar
const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

/**
 * Komponen Ornamen Nomor Ayat (Ayah End Marker) Standar Mushaf Madinah
 */
function AyahMarker({ verseNum, isSelected, onClick }) {
  const arabicNum = toArabicDigits(verseNum);
  return (
    <span
      className="ayah-marker"
      onClick={onClick}
      title={`Akhir Ayat ${verseNum} — Klik untuk memilih`}
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
        <circle
          cx="18"
          cy="18"
          r="15"
          fill={isSelected ? '#dcfce7' : '#fffbeb'}
          stroke={isSelected ? '#15803d' : '#ca8a04'}
          strokeWidth={isSelected ? '2.4' : '1.8'}
        />
        <circle
          cx="18"
          cy="18"
          r="12"
          fill="none"
          stroke={isSelected ? '#16a34a' : '#d97706'}
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
          color: isSelected ? '#15803d' : '#854d0e',
          fontFamily: 'var(--font-arabic), "Amiri", serif',
          lineHeight: 1
        }}
      >
        {arabicNum}
      </span>
    </span>
  );
}

export default function MushafView() {
  const containerRef = useRef(null);

  // Inisialisasi halaman dari bookmark tersimpan atau halaman 1
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = sessionStorage.getItem('mushaf_last_read_page');
      const p = parseInt(saved);
      if (p >= 1 && p <= 604) return p;
    } catch {
      // ignore
    }
    return 1;
  });

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(26);
  const [selectedVerseKey, setSelectedVerseKey] = useState(null);
  const [selectedVerseInfo, setSelectedVerseInfo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarkedPage, setBookmarkedPage] = useState(() => {
    try {
      return parseInt(sessionStorage.getItem('mushaf_last_read_page')) || null;
    } catch {
      return null;
    }
  });
  const [copied, setCopied] = useState(false);

  // Load Data Halaman Mushaf
  useEffect(() => {
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
  }, [currentPage]);

  // Event Listener Fullscreen
  useEffect(() => {
    const handleFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // Keyboard navigation (Panah Kiri/Kanan)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight') {
        // Dalam Mushaf Arab RTL, panah kanan = halaman sebelumnya
        setCurrentPage(p => Math.max(1, p - 1));
      } else if (e.key === 'ArrowLeft') {
        // Panah kiri = halaman berikutnya
        setCurrentPage(p => Math.min(604, p + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigasi
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage(p => Math.min(604, p + 1));

  const handleSelectSurah = (surahId) => {
    const sId = parseInt(surahId);
    if (!sId) return;
    const bounds = getSurahPageBounds(sId);
    if (bounds && bounds.startPage) {
      setCurrentPage(bounds.startPage);
    }
  };

  const handleSelectJuz = (juzNum) => {
    const j = parseInt(juzNum);
    if (j >= 1 && j <= 30) {
      setCurrentPage(JUZ_START_PAGES[j - 1]);
    }
  };

  const handleToggleBookmark = () => {
    try {
      sessionStorage.setItem('mushaf_last_read_page', String(currentPage));
      setBookmarkedPage(currentPage);
    } catch {
      // ignore
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
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

  const handleVerseClick = (verseKey, verseNum, wordsText, surahId) => {
    if (selectedVerseKey === verseKey) {
      setSelectedVerseKey(null);
      setSelectedVerseInfo(null);
    } else {
      setSelectedVerseKey(verseKey);
      setSelectedVerseInfo({
        verseKey,
        verseNum,
        wordsText,
        surahId: surahId || parseInt(verseKey.split(':')[0] || 1)
      });
    }
  };

  const handleCopyVerse = () => {
    if (!selectedVerseInfo) return;
    const s = QURAN_SURAH.find(item => item.id === selectedVerseInfo.surahId);
    const textToCopy = `"${selectedVerseInfo.wordsText}" (QS. ${s?.name || 'Surah'} [${selectedVerseInfo.surahId}]: ${selectedVerseInfo.verseNum})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentSurah = pageData?.surahs?.[0] || QURAN_SURAH[0];
  const juzNumber = pageData?.juz || Math.ceil(currentPage / 20);

  const btnBase = {
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease'
  };

  return (
    <div
      ref={containerRef}
      className={`page-content-wrapper ${isFullscreen ? 'mushaf-fullscreen-mode' : ''}`}
      style={{
        background: isFullscreen ? '#0f172a' : 'transparent',
        padding: isFullscreen ? '0' : '0 10px 40px 10px',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        overflowY: isFullscreen ? 'auto' : 'visible',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ══════════ TOOLBAR NAVIGASI MUSHAF ATAS ══════════ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: isFullscreen ? 0 : '16px',
        padding: '12px 20px',
        marginBottom: isFullscreen ? 0 : '18px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Judul & Surah Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(22,163,74,0.3)'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Mushaf Al-Qur'an Standar Madinah
                </h2>
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0'
                }}>
                  15 Baris / Hlm
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                {currentSurah?.name} ({currentSurah?.translation}) · Juz {juzNumber} · Halaman {currentPage} dari 604
              </div>
            </div>
          </div>

          {/* Quick Controls: Surah, Juz, Halaman, Zoom, Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Dropdown Surah */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CustomSelect
                value={currentSurah?.id || 1}
                onChange={(e) => handleSelectSurah(e.target.value)}
                style={{ width: '190px' }}
                triggerStyle={{ minHeight: '36px', borderRadius: '12px', fontSize: '0.80rem', fontWeight: 700 }}
                searchable={true}
                searchPlaceholder="Cari surat..."
              >
                {QURAN_SURAH.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id}. {s.name} ({s.arabic})
                  </option>
                ))}
              </CustomSelect>
            </div>

            {/* Dropdown Juz */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CustomSelect
                value={juzNumber}
                onChange={(e) => handleSelectJuz(e.target.value)}
                style={{ width: '115px' }}
                triggerStyle={{ minHeight: '36px', borderRadius: '12px', fontSize: '0.80rem', fontWeight: 700 }}
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                  <option key={j} value={j}>Juz {j}</option>
                ))}
              </CustomSelect>
            </div>

            {/* Navigasi Halaman Cepat */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9px',
              padding: '2px 6px'
            }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={goToPrevPage}
                title="Halaman Sebelumnya (Panah Kanan)"
                style={{
                  ...btnBase,
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: 'none',
                  color: currentPage <= 1 ? '#cbd5e1' : '#334155',
                  fontSize: '0.78rem',
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
                  width: '52px',
                  height: '28px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  border: '1px solid #86efac',
                  borderRadius: '6px',
                  background: '#ffffff',
                  outline: 'none',
                  color: '#15803d',
                  fontFamily: 'inherit'
                }}
              />
              <span style={{ fontSize: '0.74rem', color: '#94a3af', marginRight: '2px' }}>/604</span>
              <button
                type="button"
                disabled={currentPage >= 604}
                onClick={goToNextPage}
                title="Halaman Selanjutnya (Panah Kiri)"
                style={{
                  ...btnBase,
                  padding: '5px 9px',
                  borderRadius: '6px',
                  background: 'none',
                  color: currentPage >= 604 ? '#cbd5e1' : '#334155',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                Next →
              </button>
            </div>

            {/* Zoom Font */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9px',
              padding: '2px 4px'
            }}>
              <button
                type="button"
                onClick={() => setFontSize(s => Math.max(18, s - 2))}
                title="Perkecil Font"
                style={{ ...btnBase, padding: '5px 8px', color: '#475569', background: 'none', fontWeight: 800 }}
              >
                −A
              </button>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1e293b', minWidth: '24px', textAlign: 'center' }}>
                {fontSize}
              </span>
              <button
                type="button"
                onClick={() => setFontSize(s => Math.min(42, s + 2))}
                title="Perbesar Font"
                style={{ ...btnBase, padding: '5px 8px', color: '#475569', background: 'none', fontWeight: 800 }}
              >
                +A
              </button>
            </div>

            {/* Bookmark Halaman Ini */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              title={bookmarkedPage === currentPage ? "Halaman ini tersimpan sebagai penanda terakhir" : "Tandai Halaman Ini (Bookmark)"}
              style={{
                ...btnBase,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: bookmarkedPage === currentPage ? '#fef3c7' : '#f8fafc',
                border: `1px solid ${bookmarkedPage === currentPage ? '#fde047' : '#e2e8f0'}`,
                color: bookmarkedPage === currentPage ? '#92400e' : '#475569',
                borderRadius: '9px',
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 700
              }}
            >
              <Bookmark size={14} fill={bookmarkedPage === currentPage ? '#ca8a04' : 'none'} />
              <span>{bookmarkedPage === currentPage ? 'Tersimpan' : 'Tandai'}</span>
            </button>

            {/* Tombol Tampilan Penuh (Fullscreen) */}
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
                padding: '6px 14px',
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
          </div>
        </div>

        {/* Quick Surah Shortcuts */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '10px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pintasan:
          </span>
          {[
            { label: 'Al-Fatihah', page: 1 },
            { label: 'Al-Baqarah', page: 2 },
            { label: 'Al-Kahf', page: 293 },
            { label: 'Yasin', page: 440 },
            { label: 'Al-Waqi\'ah', page: 534 },
            { label: 'Al-Mulk', page: 562 },
            { label: 'Juz \'Amma (Juz 30)', page: 582 }
          ].map(shortcut => (
            <button
              key={shortcut.label}
              type="button"
              onClick={() => setCurrentPage(shortcut.page)}
              style={{
                ...btnBase,
                background: currentPage === shortcut.page ? '#15803d' : '#f1f5f9',
                color: currentPage === shortcut.page ? '#ffffff' : '#475569',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '0.70rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              {shortcut.label}
            </button>
          ))}
          {bookmarkedPage && (
            <button
              type="button"
              onClick={() => setCurrentPage(bookmarkedPage)}
              style={{
                ...btnBase,
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde047',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '0.70rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <Bookmark size={11} fill="#ca8a04" />
              <span>Kembali ke Hlm {bookmarkedPage}</span>
            </button>
          )}
        </div>
      </div>

      {/* ══════════ BANNER DETAIL AYAT TERPILIH ══════════ */}
      {selectedVerseInfo && (
        <div style={{
          background: 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1.5px solid #86efac',
          borderRadius: '12px',
          padding: '10px 18px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>📖</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#14532d' }}>
                Ayat Terpilih: {currentSurah?.name || 'Surah'} — Ayat {selectedVerseInfo.verseNum} (Kunci: {selectedVerseInfo.verseKey})
              </div>
              <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '2px' }}>
                Posisi: Juz {juzNumber} · Halaman {currentPage}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyVerse}
              style={{
                ...btnBase,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: copied ? '#15803d' : '#ffffff',
                border: `1px solid ${copied ? '#15803d' : '#cbd5e1'}`,
                color: copied ? '#ffffff' : '#334155',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.76rem',
                fontWeight: 700
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Tersalin!' : 'Salin Ayat'}</span>
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
                color: '#64748b',
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

      {/* ══════════ KANVAS LEMBAR MUSHAF MADINAH ══════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: isFullscreen ? '20px 24px 60px 24px' : '0'
      }}>
        <div style={{
          maxWidth: isFullscreen ? '1060px' : '860px',
          width: '100%',
          margin: '0 auto'
        }}>

          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '420px',
              gap: '16px',
              background: '#fffdf9',
              borderRadius: '20px',
              border: '3px double #ca8a04',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                border: '4px solid #dcfce7',
                borderTopColor: '#15803d',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#15803d' }}>
                Memuat Teks Mushaf Madinah Halaman {currentPage}...
              </span>
            </div>
          ) : (
            /* 📜 LEMBAR MUSHAF MADINAH OTENTIK 📜 */
            <div style={{
              background: '#fffdf9',
              border: '3.5px double #ca8a04',
              borderRadius: '20px',
              padding: isFullscreen ? '32px 42px' : '26px 32px',
              direction: 'rtl',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              position: 'relative'
            }}>

              {/* Header Halaman (Nama Surah Kanan - Juz Kiri) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #ca8a04',
                paddingBottom: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontFamily: 'var(--font-arabic), "Amiri", serif',
                  fontSize: '1.3rem',
                  color: '#15803d',
                  fontWeight: 700
                }}>
                  سُورَةُ {currentSurah?.arabic || ''}
                </div>

                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#854d0e',
                  fontFamily: 'var(--font-arabic), "Amiri", serif'
                }}>
                  الجزء {toArabicDigits(juzNumber)}
                </div>
              </div>

              {/* 📖 15 BARIS TEKS AL-QUR'AN STANDAR MADINAH 📖 */}
              <div style={{
                textAlign: 'justify',
                textAlignLast: 'right',
                lineHeight: 2.75
              }}>
                {pageData?.lines?.map((line) => {
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
                    const isSelected = selectedVerseKey === seg.verseKey;
                    const wordsJoined = seg.words.join(' ');

                    return (
                      <span
                        key={`${seg.verseKey}-${line.lineNumber}-${si}`}
                        style={{ display: 'inline', position: 'relative' }}
                      >
                        {/* Kata-kata Lafadz Ayat */}
                        {seg.words.length > 0 && (
                          <span
                            onClick={() => handleVerseClick(seg.verseKey, seg.verseNum, wordsJoined, seg.surahId)}
                            title={`Ayat ${seg.verseNum} — Klik untuk memilih & salin`}
                            style={{
                              fontFamily: 'var(--font-arabic), "Amiri", serif',
                              fontSize: `${fontSize}px`,
                              cursor: 'pointer',
                              padding: '3px 6px',
                              borderRadius: '6px',
                              display: 'inline',
                              background: isSelected ? 'rgba(34, 197, 94, 0.32)' : 'transparent',
                              color: '#1a1a1a',
                              borderBottom: isSelected ? '2.5px solid #15803d' : 'none',
                              outline: isSelected ? '1.5px solid #15803d' : 'none',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            {wordsJoined}
                          </span>
                        )}

                        {/* Ornamen Nomor Ayat (Hanya di akhir ayat) */}
                        {seg.hasEnd && (
                          <AyahMarker
                            verseNum={seg.verseNum}
                            isSelected={isSelected}
                            onClick={() => handleVerseClick(seg.verseKey, seg.verseNum, wordsJoined, seg.surahId)}
                          />
                        )}
                        {' '}
                      </span>
                    );
                  });
                })}
              </div>

              {/* Footer Halaman */}
              <div style={{
                textAlign: 'center',
                borderTop: '2px solid #ca8a04',
                paddingTop: '12px',
                marginTop: '24px',
                fontFamily: 'var(--font-arabic), "Amiri", serif',
                fontSize: '1.2rem',
                color: '#15803d',
                fontWeight: 700
              }}>
                — {toArabicDigits(currentPage)} —
              </div>
            </div>
          )}

          {/* Navigasi Bawah Halaman */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            padding: '10px 16px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={goToPrevPage}
              style={{
                ...btnBase,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.80rem',
                fontWeight: 700,
                color: currentPage <= 1 ? '#cbd5e1' : '#1e293b',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={16} />
              <span>Halaman {currentPage - 1}</span>
            </button>

            <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#15803d' }}>
              Halaman {currentPage} dari 604
            </span>

            <button
              type="button"
              disabled={currentPage >= 604}
              onClick={goToNextPage}
              style={{
                ...btnBase,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: currentPage >= 604 ? '#f1f5f9' : '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.80rem',
                fontWeight: 700,
                color: currentPage >= 604 ? '#cbd5e1' : '#1e293b',
                cursor: currentPage >= 604 ? 'not-allowed' : 'pointer'
              }}
            >
              <span>Halaman {currentPage + 1}</span>
              <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
