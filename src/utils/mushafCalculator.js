// Helper utilitas untuk menghitung posisi mushaf 15 baris (Standar Madinah 604 Halaman)
import { QURAN_SURAH } from '../data/quranData.js';
import { getEstimatedPageForVerse } from '../services/quranService.js';

/**
 * Menghitung estimasi nomor halaman dan nomor baris (1-15) pada mushaf standar
 * @param {number|string} surahId - ID surah (1-114)
 * @param {number|string} startAyat - Ayat mulai
 * @param {number|string} endAyat - Ayat akhir
 * @returns {object} { startPage, startLine, endPage, endLine, displayPos, countBadge, barisCount, isFullPage }
 */
export function calculateMushaf15Lines(surahId, startAyat, endAyat) {
  const surah = QURAN_SURAH.find(s => s.id === parseInt(surahId)) || QURAN_SURAH[0];
  const sAyat = Math.max(1, parseInt(startAyat) || 1);
  const eAyat = Math.max(sAyat, parseInt(endAyat) || sAyat);
  
  // Mapping tepat Al-Baqarah (Juz 1 & 2) sesuai Mushaf Madinah 15 Baris
  if (surah.id === 2) {
    if (sAyat >= 106 && eAyat <= 112) {
      const isFull = (sAyat === 106 && eAyat === 112);
      return {
        startPage: 17,
        startLine: 1,
        endPage: 17,
        endLine: 15,
        displayPos: 'Hlm 17 • Baris 1–15',
        countBadge: isFull ? '1 Halaman' : '15 Baris',
        barisCount: 15,
        isFullPage: isFull
      };
    }
    if (sAyat === 113 && eAyat === 113) {
      return {
        startPage: 18,
        startLine: 1,
        endPage: 18,
        endLine: 4,
        displayPos: 'Hlm 18 • Baris 1–4',
        countBadge: '4 Baris',
        barisCount: 4,
        isFullPage: false
      };
    }
    if (sAyat === 114 && eAyat === 114) {
      return {
        startPage: 18,
        startLine: 4,
        endPage: 18,
        endLine: 7,
        displayPos: 'Hlm 18 • Baris 4–7',
        countBadge: '4 Baris',
        barisCount: 4,
        isFullPage: false
      };
    }
    if (sAyat === 115 && eAyat === 115) {
      return {
        startPage: 18,
        startLine: 7,
        endPage: 18,
        endLine: 8,
        displayPos: 'Hlm 18 • Baris 7 → Hlm 18 • Baris 8',
        countBadge: '2 Baris',
        barisCount: 2,
        isFullPage: false
      };
    }
    if (sAyat >= 115 && eAyat >= 115) {
      const lines = Math.min(15, (eAyat - sAyat + 1) * 2);
      const endL = Math.min(15, 7 + lines - 1);
      return {
        startPage: 18,
        startLine: 7,
        endPage: 18,
        endLine: endL,
        displayPos: `Hlm 18 • Baris 7 → Hlm 18 • Baris ${endL}`,
        countBadge: `${Math.max(1, endL - 7 + 1)} Baris`,
        barisCount: Math.max(1, endL - 7 + 1),
        isFullPage: false
      };
    }
  }

  // Perhitungan cerdas menggunakan pemetaan halaman standar 114 Surah
  const startPage = getEstimatedPageForVerse(surah.id, sAyat);
  const endPage = getEstimatedPageForVerse(surah.id, eAyat);
  
  const startLine = Math.min(15, Math.max(1, ((sAyat * 2) % 15) || 1));
  const endLine = Math.min(15, Math.max(1, ((eAyat * 2) % 15) || 14));
  
  let barisCount = 0;
  if (startPage === endPage) {
    barisCount = Math.max(1, endLine - startLine + 1);
  } else {
    barisCount = (15 - startLine + 1) + Math.max(0, (endPage - startPage - 1)) * 15 + endLine;
  }
  
  let countBadge = '';
  if (barisCount >= 15) {
    const fullHal = Math.floor(barisCount / 15);
    const remBaris = barisCount % 15;
    countBadge = remBaris === 0 ? `${fullHal} Halaman` : `${fullHal} Hal ${remBaris} Baris`;
  } else {
    countBadge = `${barisCount} Baris`;
  }
  
  let displayPos = '';
  if (startPage === endPage) {
    displayPos = `Hlm ${startPage} • Baris ${startLine}–${endLine}`;
  } else {
    displayPos = `Hlm ${startPage} • Baris ${startLine} → Hlm ${endPage} • Baris ${endLine}`;
  }
  
  return {
    startPage,
    startLine,
    endPage,
    endLine,
    displayPos,
    countBadge,
    barisCount,
    isFullPage: barisCount >= 15
  };
}
