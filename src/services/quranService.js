// Service untuk memuat dan mengelola halaman Mushaf Al-Qur'an Standar Madinah (15 Baris / Halaman)
import { QURAN_SURAH_PAGES, getSurahPageBounds } from '../data/quranSurahPages.js';
import { QURAN_SURAH } from '../data/quranData.js';

// Cache memori untuk akses instan antar pergantian halaman
const memoryPageCache = new Map();

/**
 * Menghitung nomor halaman Mushaf Madinah (1-604) untuk Surah dan Ayat tertentu
 */
export function getEstimatedPageForVerse(surahId, verseNumber) {
  const bounds = getSurahPageBounds(surahId);
  const vNum = Math.max(1, parseInt(verseNumber) || 1);
  const totalPages = Math.max(1, bounds.endPage - bounds.startPage + 1);
  const vCount = Math.max(1, bounds.count || 1);
  
  if (totalPages === 1) return bounds.startPage;
  
  // Specific known exact pages
  if (parseInt(surahId) === 10) {
    if (vNum <= 6) return 208;
    if (vNum <= 14) return 209;
    if (vNum <= 20) return 210;
    if (vNum <= 25) return 211;
    if (vNum <= 33) return 212;
    if (vNum <= 42) return 213;
    if (vNum <= 53) return 214;
    if (vNum <= 61) return 215;
    if (vNum <= 70) return 216;
    if (vNum <= 78) return 217;
    if (vNum <= 88) return 218;
    if (vNum <= 97) return 219;
    if (vNum <= 106) return 220;
    return 221;
  }
  
  if (parseInt(surahId) === 2) {
    if (vNum <= 5) return 2;
    if (vNum <= 16) return 3;
    if (vNum <= 24) return 4;
    if (vNum <= 112) return 17;
    if (vNum <= 126) return 18;
    return Math.min(49, 2 + Math.floor(((vNum - 1) / 286) * 48));
  }

  const offset = Math.floor(((vNum - 1) / vCount) * totalPages);
  return Math.min(bounds.endPage, bounds.startPage + offset);
}

/**
 * Memuat data halaman Mushaf 15 Baris dari Quran API atau Local Cache
 * @param {number} pageNumber - Nomor halaman (1-604)
 * @returns {Promise<object>} { pageNumber, lines: Array(15), surahs: Array, juz: number }
 */
export async function getMadinahMushafPage(pageNumber) {
  const pNum = Math.min(604, Math.max(1, parseInt(pageNumber) || 1));

  // 1. Cek Memory Cache
  if (memoryPageCache.has(pNum)) {
    return memoryPageCache.get(pNum);
  }

  // 3. Ambil dari API Resmi Quran.com (Uthmani Script + Line Number per kata)
  try {
    const url = `https://api.quran.com/api/v4/verses/by_page/${pNum}?words=true&word_fields=text_uthmani,line_number,page_number`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const json = await res.json();
      const verses = json.verses || [];

      // Kelompokkan kata-kata ke dalam baris 1 s/d 15
      const lineMap = {};
      for (let i = 1; i <= 15; i++) {
        lineMap[i] = [];
      }

      const surahIdsSet = new Set();
      let juzNumber = 1;

      verses.forEach(v => {
        if (v.juz_number) juzNumber = v.juz_number;
        const sId = parseInt(v.verse_key?.split(':')[0] || 1);
        surahIdsSet.add(sId);

        (v.words || []).forEach(w => {
          const lNum = Math.min(15, Math.max(1, w.line_number || 1));
          if (!lineMap[lNum]) lineMap[lNum] = [];
          const isEndMarker = w.char_type_name === 'end' || /^[\u0660-\u06690-9]+$/.test((w.text_uthmani || '').trim());
          lineMap[lNum].push({
            id: w.id,
            text: w.text_uthmani || w.text || '',
            verseNumber: v.verse_number,
            verseKey: v.verse_key,
            charType: isEndMarker ? 'end' : 'word'
          });
        });
      });

      const lines = [];
      for (let i = 1; i <= 15; i++) {
        const words = lineMap[i] || [];
        const verseKeys = [...new Set(words.map(w => w.verseKey).filter(Boolean))];
        const verseNumbers = [...new Set(words.map(w => w.verseNumber).filter(Boolean))];
        const text = words.map(w => w.text).join(' ');

        lines.push({
          lineNumber: i,
          words: words,
          text: text,
          verseKeys: verseKeys,
          verseNumbers: verseNumbers
        });
      }

      const surahList = [...surahIdsSet].map(id => QURAN_SURAH.find(s => s.id === id)).filter(Boolean);

      const pageResult = {
        pageNumber: pNum,
        juz: juzNumber,
        surahs: surahList,
        lines: lines
      };

      // Simpan ke Memory Cache
      memoryPageCache.set(pNum, pageResult);

      return pageResult;
    }
  } catch (err) {
    console.warn("Failed fetching live quran page from API, using offline fallback:", err);
  }

  // 4. Offline Fallback jika tanpa koneksi internet
  return generateOfflineFallbackPage(pNum);
}

/**
 * Fallback jika offline
 */
function generateOfflineFallbackPage(pNum) {
  const lines = [];
  for (let i = 1; i <= 15; i++) {
    lines.push({
      lineNumber: i,
      text: i === 1 ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' : `ءَايَاتُ ٱلْقُرْءَانِ ٱلْكَرِيمِ — صَفْحَة ${pNum} سَطْر ${i}`,
      verseKeys: [`10:${i}`],
      verseNumbers: [i],
      words: [{ text: `صَفْحَة ${pNum} سَطْر ${i}`, verseNumber: i }]
    });
  }

  return {
    pageNumber: pNum,
    juz: Math.ceil(pNum / 20),
    surahs: [QURAN_SURAH[9] || QURAN_SURAH[0]],
    lines: lines
  };
}
