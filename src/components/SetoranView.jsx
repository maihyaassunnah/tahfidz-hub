import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Layers, 
  Clock, 
  ExternalLink, 
  Search, 
  Trash2, 
  Download, 
  Edit3, 
  Volume2, 
  Play, 
  Pause, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Filter,
  Sparkles,
  ChevronDown,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QURAN_SURAH, getSurahById } from '../data/quranData';
import { calculateMushaf15Lines } from '../utils/mushafCalculator';
import { storageService } from '../services/storage';
import MushafMadinahSimakModal from './MushafMadinahSimakModal';

// Authentic Quran Verse texts for interactive Mushaf preview & Simak
const MUSHAF_SAMPLE_VERSES = {
  2: {
    106: { num: 106, ar: "مَا نَنسَخْ مِنْ آيَةٍ أَوْ نُنسِهَا نَأْتِ بِخَيْرٍ مِّنْهَا أَوْ مِثْلِهَا ۗ أَلَمْ تَعْلَمْ أَنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", tr: "Ayat yang Kami batalkan atau Kami hilangkan dari ingatan, pasti Kami gantikan dengan yang lebih baik atau yang sebanding dengannya. Tidakkah engkau tahu bahwa Allah Mahakuasa atas segala sesuatu?" },
    107: { num: 107, ar: "أَلَمْ تَعْلَمْ أَنَّ اللَّهَ لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ ۗ وَمَا لَكُم مِّن دُونِ اللَّهِ مِن وَلِيٍّ وَلَا نَصِيرٍ", tr: "Tidakkah engkau tahu bahwa Allah memiliki kerajaan langit dan bumi? Dan tidak ada bagimu pelindung dan penolong selain Allah." },
    108: { num: 108, ar: "أَمْ تُرِيدُونَ أَن تَسْأَلُوا رَسُولَكُمْ كَمَا سُئِلَ مُوسَىٰ مِن قَبْلُ ۗ وَمَن يَتَبَدَّلِ الْكُفْرَ بِالْإِيمَانِ فَقَدْ ضَلَّ سَوَاءَ السَّبِيلِ", tr: "Ataukah kamu hendak meminta kepada Rasulmu seperti halnya Musa pernah diminta dahulu? Dan barang siapa memilih kekafiran setelah beriman, maka sungguh dia telah tersesat dari jalan yang lurus." },
    109: { num: 109, ar: "وَدَّ كَثِيرٌ مِّنْ أَهْلِ الْكِتَابِ لَوْ يَرُدُّونَكُم مِّن بَعْدِ إِيمَانِكُمْ كُفَّارًا حَسَدًا مِّنْ عِندِ أَنفُسِهِم", tr: "Banyak di antara Ahli Kitab menginginkan sekiranya mereka dapat mengembalikan kamu setelah kamu beriman menjadi kafir kembali, karena rasa dengki dalam diri mereka." },
    110: { num: 110, ar: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ۚ وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ ۗ إِنَّ اللَّهَ بِمَا تَعْمَلُونَ بَصِيرٌ", tr: "Dan laksanakanlah salat dan tunaikanlah zakat. Dan segala kebaikan yang kamu kerjakan untuk dirimu, kamu akan mendapatkannya di sisi Allah. Sungguh, Allah Maha Melihat apa yang kamu kerjakan." },
    111: { num: 111, ar: "وَقَالُوا لَن يَدْخُلَ الْجَنَّةَ إِلَّا مَن كَانَ هُودًا أَوْ نَصَارَىٰ ۗ تِلْكَ أَمَانِيُّهُمْ ۗ قُلْ هَاتُوا بُرْهَانَكُمْ إِن كُنتُمْ صَادِقِينَ", tr: "Dan mereka berkata, 'Tidak akan masuk surga kecuali orang Yahudi atau Nasrani.' Itu hanyalah angan-angan mereka belaka. Katakanlah, 'Tunjukkanlah bukti kebenaranmu jika kamu orang yang benar.'" },
    112: { num: 112, ar: "بَلَىٰ مَنْ أَسْلَمَ وَجْهَهُ لِلَّهِ وَهُوَ مُحْسِنٌ فَلَهُ أَجْرُهُ عِندَ رَبِّهِ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ", tr: "Tidak! Barang siapa menyerahkan diri sepenuhnya kepada Allah, dan dia berbuat baik, dia mendapat pahala di sisi Tuhannya dan tidak ada rasa takut pada mereka dan mereka tidak bersedih hati." },
    113: { num: 113, ar: "وَقَالَتِ الْيَهُودُ لَيْسَتِ النَّصَارَىٰ عَلَىٰ شَيْءٍ وَقَالَتِ النَّصَارَىٰ لَيْسَتِ الْيَهُودُ عَلَىٰ شَيْءٍ وَهُمْ يَتْلُونَ الْكِتَابَ ۗ كَذَٰلِكَ قَالَ الَّذِينَ لَا يَعْلَمُونَ مِثْلَ قَوْلِهِمْ ۚ فَاللَّهُ يَحْكُمُ بَيْنَهُمْ يَوْمَ الْقِيَامَةِ فِيمَا كَانُوا فِيهِ يَخْتَلِفُونَ", tr: "Dan orang Yahudi berkata, 'Orang Nasrani itu tidak memiliki suatu pegangan', dan orang-orang Nasrani berkata, 'Orang-orang Yahudi tidak memiliki suatu pegangan', padahal mereka membaca Kitab. Demikian pula orang-orang yang tidak berilmu berkata seperti ucapan mereka itu. Maka Allah akan mengadili mereka pada hari Kiamat tentang apa yang mereka perselisihkan." },
    114: { num: 114, ar: "وَمَنْ أَظْلَمُ مِمَّن مَّنَعَ مَسَاجِدَ اللَّهِ أَن يُذْكَرَ فِيهَا اسْمُهُ وَسَعَىٰ فِي خَرَابِهَا ۚ أُولَٰئِكَ مَا كَانَ لَهُمْ أَن يَدْخُلُوهَا إِلَّا خَائِفِينَ ۚ لَهُمْ فِي الدُّنْيَا خِزْيٌ وَلَهُمْ فِي الْآخِرَةِ عَذَابٌ عَظِيمٌ", tr: "Dan siapakah yang lebih zalim daripada orang yang melarang masjid-masjid Allah digunakan untuk menyebut nama-Nya, dan berusaha merobohkannya? Mereka itu tidak pantas memasukinya kecuali dengan rasa takut. Mereka mendapat kehinaan di dunia dan di akhirat mendapat azab yang berat." },
    115: { num: 115, ar: "وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ ۚ فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ ۚ إِنَّ اللَّهَ وَاسِعٌ عَلِيمٌ", tr: "Dan milik Allah timur dan barat. Ke mana pun kamu menghadap di sanalah wajah Allah. Sungguh, Allah Mahaluas, Maha Mengetahui." },
    116: { num: 116, ar: "وَقَالُوا اتَّخَذَ اللَّهُ وَلَدًا ۗ سُبْحَانَهُ ۖ بَل لَّهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ كُلٌّ لَّهُ قَانِتُونَ", tr: "Dan mereka berkata, 'Allah mempunyai anak.' Mahasuci Dia! Bahkan milik-Nyalah apa yang ada di langit dan di bumi; semua tunduk kepada-Nya." }
  }
};

export default function SetoranView({
  setoranList = [],
  santriList = [],
  halaqahList = [],
  onSaveSetoran,
  onDeleteSetoran,
  onOpenQuickSetor,
  onReload,
  showToast,
  currentRole = 'pengampu'
}) {
  // 1. Santri Selection State: Prioritas Muhammad Azmi Soleh jika ada, atau santri pertama
  const [selectedSantriId, setSelectedSantriId] = useState(() => {
    const azmi = santriList.find(s => s.nama.toLowerCase().includes('azmi'));
    return azmi ? azmi.id : (santriList[0]?.id || 's-azmi');
  });

  // Update jika santriList berubah
  useEffect(() => {
    if (santriList.length > 0 && !santriList.some(s => s.id === selectedSantriId)) {
      const azmi = santriList.find(s => s.nama.toLowerCase().includes('azmi'));
      setSelectedSantriId(azmi ? azmi.id : santriList[0].id);
    }
  }, [santriList, selectedSantriId]);

  const selectedSantri = santriList.find(s => s.id === selectedSantriId) || {
    id: 's-azmi',
    nama: 'Muhammad Azmi Soleh',
    kelas: 'X Tahfidz 1'
  };

  // 2. Date state (Default: 2026-09-12 sesuai screenshot "Sabtu, 12-09-2026")
  const [tanggal, setTanggal] = useState('2026-09-12');

  const formattedDateHeader = useMemo(() => {
    try {
      const d = new Date(tanggal);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = days[d.getDay()] || 'Sabtu';
      const [y, m, day] = tanggal.split('-');
      return `${dayName}, ${day}-${m}-${y}`;
    } catch {
      return `Sabtu, 12-09-2026`;
    }
  }, [tanggal]);

  // 3. Jenis Setoran (SABAQ / SABQI / MANZIL)
  const [jenisSetoran, setJenisSetoran] = useState('SABAQ');

  // 4. Mode Setoran Ganda
  const [isModeGanda, setIsModeGanda] = useState(false);

  // 5. Quran Verse Selection (Mulai dari: Juz 1, Al-Baqarah, Ayat 115)
  const [selectedJuz, setSelectedJuz] = useState(1);
  const [selectedSurahId, setSelectedSurahId] = useState(2); // Al-Baqarah
  const [ayatMulai, setAyatMulai] = useState(115);

  // Sampai Juz/Surat Berbeda?
  const [isSampaiBedaSurah, setIsSampaiBedaSurah] = useState(false);
  const [selectedJuzAkhir, setSelectedJuzAkhir] = useState(1);
  const [selectedSurahAkhirId, setSelectedSurahAkhirId] = useState(2);
  const [ayatAkhir, setAyatAkhir] = useState(115);

  // Current active Surah object
  const activeSurah = useMemo(() => {
    return QURAN_SURAH.find(s => s.id === parseInt(selectedSurahId)) || QURAN_SURAH[1];
  }, [selectedSurahId]);

  const activeSurahAkhir = useMemo(() => {
    if (!isSampaiBedaSurah) return activeSurah;
    return QURAN_SURAH.find(s => s.id === parseInt(selectedSurahAkhirId)) || activeSurah;
  }, [isSampaiBedaSurah, selectedSurahAkhirId, activeSurah]);

  // Auto-sync Juz when Surah changes
  const handleSurahChange = (sId) => {
    const s = QURAN_SURAH.find(item => item.id === parseInt(sId));
    setSelectedSurahId(parseInt(sId));
    if (s && s.juz) {
      setSelectedJuz(s.juz);
    }
    setAyatMulai(1);
    setAyatAkhir(1);
  };

  // 6. Dynamic Mushaf 15-Baris Calculation
  const mushafPos = useMemo(() => {
    return calculateMushaf15Lines(
      selectedSurahId,
      ayatMulai,
      ayatAkhir || ayatMulai
    );
  }, [selectedSurahId, ayatMulai, ayatAkhir]);

  // 7. Counters: Salah Hafalan, Salah Tajwid, Status Lanjut
  const [salahHafalan, setSalahHafalan] = useState(0);
  const [salahTajwid, setSalahTajwid] = useState(0);
  const [statusLanjut, setStatusLanjut] = useState('Lanjut'); // 'Lanjut' | 'Ulang'

  // 8. Penilaian (Predikat): MUMTAZ, JAYYID JIDDAN, JAYYID (active cyan), MAQBUL, RASIB
  const [predikat, setPredikat] = useState('JAYYID');
  const [catatan, setCatatan] = useState('');

  // 9. Right Column History State & Filter
  const [historyFilter, setHistoryFilter] = useState('SABAQ'); // SABAQ | SABQI | MANZIL | ALL
  const [historyLimit, setHistoryLimit] = useState(3); // 3 | 5 | 10 | 999

  // Filter history for selected student
  const studentHistory = useMemo(() => {
    return setoranList.filter(item => {
      const matchSantri = item.santriId === selectedSantriId;
      const itemJenis = (item.jenis || '').toUpperCase();
      const matchJenis = historyFilter === 'ALL' || itemJenis === historyFilter || 
                         (historyFilter === 'SABAQ' && itemJenis === 'ZIYADAH') ||
                         (historyFilter === 'MANZIL' && itemJenis.includes('MUROJA'));
      return matchSantri && matchJenis;
    });
  }, [setoranList, selectedSantriId, historyFilter]);

  const displayedHistory = useMemo(() => {
    return studentHistory.slice(0, historyLimit);
  }, [studentHistory, historyLimit]);

  // Modals
  const [showMushafModal, setShowMushafModal] = useState(false);
  const [showSimakModal, setShowSimakModal] = useState(false);
  const [showFullHistoryModal, setShowFullHistoryModal] = useState(false);
  const [editingSetoran, setEditingSetoran] = useState(null);

  // Audio simulation state for Simak
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 10. Handle Form Submission
  const handleSubmitSetoran = (e) => {
    e.preventDefault();

    if (!selectedSantriId) {
      alert("Silakan pilih santri terlebih dahulu.");
      return;
    }

    const skorMap = {
      'MUMTAZ': 95,
      'JAYYID JIDDAN': 85,
      'JAYYID': 75,
      'MAQBUL': 65,
      'RASIB': 50
    };

    const finalAyatAkhir = ayatAkhir || ayatMulai;

    const newRecord = {
      santriId: selectedSantriId,
      tanggal: tanggal,
      jenis: jenisSetoran,
      surahId: activeSurah.id,
      surahName: activeSurah.name,
      arabicSurah: activeSurah.arabic,
      ayatAwal: parseInt(ayatMulai),
      ayatAkhir: parseInt(finalAyatAkhir),
      juz: selectedJuz,
      halaman: mushafPos.startPage,
      posisiMushaf: mushafPos.displayPos,
      barisBadge: mushafPos.countBadge,
      nilai: predikat.charAt(0).toUpperCase() + predikat.slice(1).toLowerCase(),
      predikat: predikat,
      skor: skorMap[predikat] || 75,
      statusLanjut: statusLanjut.toUpperCase(),
      salahHafalan: salahHafalan,
      salahTajwid: salahTajwid,
      catatanTajwid: catatan,
      musyrif: currentRole === 'pengampu' ? 'Wahyudin Hafiz' : 'Musyrif Halaqah'
    };

    if (onSaveSetoran) {
      onSaveSetoran(newRecord);
    } else {
      storageService.addSetoran(newRecord);
      if (onReload) onReload();
    }

    // Confetti effect
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    if (showToast) {
      showToast(`Setoran ${activeSurah.name} (Ayat ${ayatMulai}-${finalAyatAkhir}) berhasil disimpan!`);
    }

    // Advance to next verse for faster workflow
    const nextStart = parseInt(finalAyatAkhir) + 1;
    if (nextStart <= activeSurah.versesCount) {
      setAyatMulai(nextStart);
      setAyatAkhir(nextStart);
    }
  };

  // Helper untuk format tanggal card riwayat
  const formatHistoryDate = (item) => {
    if (item.tanggalFormat) return item.tanggalFormat;
    try {
      const d = new Date(item.tanggal);
      const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      const dayName = days[d.getDay()] || 'HARI INI';
      const [y, m, day] = (item.tanggal || '').split('-');
      return `${dayName}, ${day}-${m}-${y}`;
    } catch {
      return item.tanggal || 'HARI INI';
    }
  };

  return (
    <div style={{ padding: '4px 0 40px 0' }}>
      {/* Top Page Title */}
      <div className="setoran-page-header">
        <div>
          <h1 className="setoran-page-title">Setoran</h1>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="setoran-grid-container">
        
        {/* =========================================================================
            LEFT COLUMN: INPUT HAFALAN CARD
            ========================================================================= */}
        <div className="setoran-card-main">
          {/* Card Header: Input Hafalan & Tanggal Pill */}
          <div className="setoran-card-header">
            <div className="setoran-card-title-box">
              <div className="setoran-icon-square">
                <BookOpen size={20} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Input Hafalan
              </h2>
            </div>

            {/* Date Pill Picker */}
            <div className="setoran-date-pill">
              <Calendar size={16} style={{ color: '#16a34a' }} />
              <span>Tanggal: <strong>{formattedDateHeader}</strong></span>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <input 
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  title="Ganti Tanggal Setoran"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitSetoran}>
            {/* Field: PILIH SANTRI */}
            <div style={{ marginBottom: '20px' }}>
              <label className="setoran-label">PILIH SANTRI</label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="setoran-santri-select"
                  value={selectedSantriId}
                  onChange={(e) => setSelectedSantriId(e.target.value)}
                >
                  {santriList.map(santri => (
                    <option key={santri.id} value={santri.id}>
                      {santri.nama} {santri.kelas ? `(${santri.kelas})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    right: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    pointerEvents: 'none',
                    color: '#64748b'
                  }} 
                />
              </div>
            </div>

            {/* Field: JENIS SETORAN (Segmented 3 Buttons) */}
            <div style={{ marginBottom: '20px' }}>
              <label className="setoran-label">JENIS SETORAN</label>
              <div className="setoran-jenis-segmented">
                <button 
                  type="button"
                  className={`setoran-jenis-btn ${jenisSetoran === 'SABAQ' ? 'active-sabaq' : ''}`}
                  onClick={() => setJenisSetoran('SABAQ')}
                >
                  SABAQ
                </button>
                <button 
                  type="button"
                  className={`setoran-jenis-btn ${jenisSetoran === 'SABQI' ? 'active-sabqi' : ''}`}
                  onClick={() => setJenisSetoran('SABQI')}
                >
                  SABQI
                </button>
                <button 
                  type="button"
                  className={`setoran-jenis-btn ${jenisSetoran === 'MANZIL' ? 'active-manzil' : ''}`}
                  onClick={() => setJenisSetoran('MANZIL')}
                >
                  MANZIL
                </button>
              </div>
            </div>

            {/* Card: Mode Setoran Ganda */}
            <div className="setoran-ganda-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b'
                }}>
                  <Layers size={19} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Mode Setoran Ganda
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Input Sabqi & Sabaq sekaligus
                  </div>
                </div>
              </div>

              {/* iOS Switch Toggle */}
              <div 
                onClick={() => setIsModeGanda(!isModeGanda)}
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  background: isModeGanda ? '#16a34a' : '#cbd5e1',
                  padding: '3px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transform: isModeGanda ? 'translateX(20px)' : 'translateX(0)',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>
            </div>

            {/* Inner Card: Hafalan Sabaq (Baru) */}
            <div className="setoran-inner-card">
              {/* Badge & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{
                  background: '#f3e8ff',
                  color: '#6d28d9',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.04em'
                }}>
                  {jenisSetoran}
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {jenisSetoran === 'SABAQ' ? 'Hafalan Sabaq (Baru)' : jenisSetoran === 'SABQI' ? 'Hafalan Sabqi (Kemarin)' : 'Muroja\'ah Manzil'}
                </span>
              </div>

              {/* SECTION: MULAI DARI */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                      MULAI DARI
                    </span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setShowMushafModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#15803d',
                      cursor: 'pointer'
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Buka Mushaf di Ayat Ini</span>
                  </button>
                </div>

                {/* 3 Dropdowns: JUZ, SURAT, AYAT */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      JUZ
                    </label>
                    <select 
                      className="form-select"
                      style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                      value={selectedJuz}
                      onChange={(e) => setSelectedJuz(parseInt(e.target.value))}
                    >
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                        <option key={juz} value={juz}>Juz {juz}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      SURAT
                    </label>
                    <select 
                      className="form-select"
                      style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                      value={selectedSurahId}
                      onChange={(e) => handleSurahChange(e.target.value)}
                    >
                      {QURAN_SURAH.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.id}. {s.arabic} ({s.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      AYAT
                    </label>
                    <select 
                      className="form-select"
                      style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                      value={ayatMulai}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setAyatMulai(val);
                        if (!ayatAkhir || ayatAkhir < val) setAyatAkhir(val);
                      }}
                    >
                      {Array.from({ length: activeSurah.versesCount }, (_, i) => i + 1).map(a => (
                        <option key={a} value={a}>Ayat {a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Middle Pill Switch: Sampai Juz/Surat Berbeda? */}
              <div style={{ textAlign: 'center', margin: '14px 0' }}>
                <button
                  type="button"
                  onClick={() => setIsSampaiBedaSurah(!isSampaiBedaSurah)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '6px 18px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: isSampaiBedaSurah ? '#6d28d9' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: `2px solid ${isSampaiBedaSurah ? '#6d28d9' : '#94a3b8'}`,
                    display: 'inline-block',
                    background: isSampaiBedaSurah ? '#6d28d9' : 'transparent'
                  }}></span>
                  <span>Sampai Juz/Surat Berbeda?</span>
                </button>
              </div>

              {/* SECTION: SAMPAI DENGAN */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }}></div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6d28d9', letterSpacing: '0.04em' }}>
                    SAMPAI DENGAN
                  </span>
                </div>

                {!isSampaiBedaSurah ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.85rem' }}>
                      Sama dengan lokasi mulai (Satu Surat)
                    </div>

                    <div style={{ minWidth: '180px' }}>
                      <label style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        AYAT AKHIR
                      </label>
                      <select 
                        className="form-select"
                        style={{ 
                          height: '42px', 
                          borderRadius: '10px', 
                          fontSize: '0.88rem', 
                          fontWeight: 700,
                          borderColor: '#f59e0b',
                          background: '#ffffff'
                        }}
                        value={ayatAkhir}
                        onChange={(e) => setAyatAkhir(parseInt(e.target.value))}
                      >
                        <option value="">-- Pilih Ayat --</option>
                        {Array.from({ length: activeSurah.versesCount }, (_, i) => i + 1)
                          .filter(a => a >= ayatMulai)
                          .map(a => (
                            <option key={a} value={a}>Ayat {a}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        JUZ AKHIR
                      </label>
                      <select 
                        className="form-select"
                        style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                        value={selectedJuzAkhir}
                        onChange={(e) => setSelectedJuzAkhir(parseInt(e.target.value))}
                      >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                          <option key={juz} value={juz}>Juz {juz}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        SURAT AKHIR
                      </label>
                      <select 
                        className="form-select"
                        style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700 }}
                        value={selectedSurahAkhirId}
                        onChange={(e) => setSelectedSurahAkhirId(parseInt(e.target.value))}
                      >
                        {QURAN_SURAH.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.id}. {s.arabic} ({s.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        AYAT AKHIR
                      </label>
                      <select 
                        className="form-select"
                        style={{ height: '42px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, borderColor: '#f59e0b' }}
                        value={ayatAkhir}
                        onChange={(e) => setAyatAkhir(parseInt(e.target.value))}
                      >
                        {Array.from({ length: activeSurahAkhir.versesCount }, (_, i) => i + 1).map(a => (
                          <option key={a} value={a}>Ayat {a}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* POSISI MUSHAF (15 BARIS) BANNER */}
              <div className="posisi-mushaf-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#166534', letterSpacing: '0.04em' }}>
                      POSISI MUSHAF (15 BARIS)
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#14532d' }}>
                      {mushafPos.displayPos}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: '#ffffff',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#15803d'
                  }}>
                    {mushafPos.countBadge}
                  </span>

                  <button 
                    type="button"
                    onClick={() => setShowSimakModal(true)}
                    style={{
                      background: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Simak
                  </button>
                </div>
              </div>

              {/* Counters: SALAH HAFALAN, SALAH TAJWID, STATUS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label className="setoran-label">SALAH HAFALAN</label>
                  <div className="setoran-stepper">
                    <button 
                      type="button" 
                      className="setoran-stepper-btn"
                      onClick={() => setSalahHafalan(prev => Math.max(0, prev - 1))}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {salahHafalan}
                    </span>
                    <button 
                      type="button" 
                      className="setoran-stepper-btn"
                      onClick={() => setSalahHafalan(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="setoran-label">SALAH TAJWID</label>
                  <div className="setoran-stepper">
                    <button 
                      type="button" 
                      className="setoran-stepper-btn"
                      onClick={() => setSalahTajwid(prev => Math.max(0, prev - 1))}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {salahTajwid}
                    </span>
                    <button 
                      type="button" 
                      className="setoran-stepper-btn"
                      onClick={() => setSalahTajwid(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="setoran-label">STATUS</label>
                  <div style={{ display: 'flex', height: '42px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <button
                      type="button"
                      onClick={() => setStatusLanjut('Lanjut')}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: statusLanjut === 'Lanjut' ? '#16a34a' : '#ffffff',
                        color: statusLanjut === 'Lanjut' ? '#ffffff' : '#64748b',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Lanjut
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusLanjut('Ulang')}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: statusLanjut === 'Ulang' ? '#e11d48' : '#ffffff',
                        color: statusLanjut === 'Ulang' ? '#ffffff' : '#64748b',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      Ulang
                    </button>
                  </div>
                </div>
              </div>

              {/* Assessment & Notes Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6d28d9', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                    PENILAIAN (PREDIKAT)
                  </label>
                  <div className="predikat-pills-grid">
                    {['MUMTAZ', 'JAYYID JIDDAN', 'JAYYID', 'MAQBUL', 'RASIB'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`predikat-pill-btn ${predikat === p ? 'active' : ''}`}
                        onClick={() => setPredikat(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="setoran-label">CATATAN (OPSIONAL)</label>
                  <textarea 
                    rows="3"
                    className="form-input"
                    placeholder="Catatan tambahan..."
                    style={{ resize: 'none', fontSize: '0.82rem', height: '76px', borderRadius: '12px' }}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* Bottom Submit Button */}
            <button type="submit" className="btn-simpan-setoran">
              <BookOpen size={19} />
              <span>Simpan Setoran</span>
            </button>
          </form>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: RIWAYAT TERBARU
            ========================================================================= */}
        <div className="setoran-card-main">
          {/* Header Riwayat Terbaru */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a'
              }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Riwayat Terbaru
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {displayedHistory.length} setoran {historyFilter} terakhir
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowFullHistoryModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#15803d',
                cursor: 'pointer'
              }}
            >
              <span>Lihat Semua</span>
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Filter Pills & Limit Dropdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['SABAQ', 'SABQI', 'MANZIL'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setHistoryFilter(f)}
                  style={{
                    background: historyFilter === f ? '#ecfdf5' : '#ffffff',
                    border: `1px solid ${historyFilter === f ? '#86efac' : '#e2e8f0'}`,
                    color: historyFilter === f ? '#15803d' : '#64748b',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <select 
              className="form-select"
              style={{ height: '32px', width: '90px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
              value={historyLimit}
              onChange={(e) => setHistoryLimit(parseInt(e.target.value))}
            >
              <option value="3">3 Data</option>
              <option value="5">5 Data</option>
              <option value="10">10 Data</option>
              <option value="999">Semua</option>
            </select>
          </div>

          {/* Timeline Cards */}
          <div className="setoran-timeline-container">
            {displayedHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Belum ada riwayat {historyFilter}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>Setoran baru yang Anda simpan akan muncul di sini.</p>
              </div>
            ) : (
              displayedHistory.map((item) => {
                const surahData = QURAN_SURAH.find(s => s.id === item.surahId) || { arabic: item.arabicSurah || 'البقرة' };
                const arabicName = item.arabicSurah || surahData.arabic;
                const posMushaf = item.posisiMushaf || `Hlm ${item.halaman || 18} • Baris 4–7`;
                const barisText = item.barisBadge || '4 Baris';
                const statusTag = item.statusLanjut || 'LANJUT';
                const predBadge = (item.predikat || item.nilai || 'JAYYID').toUpperCase();

                return (
                  <div key={item.id} className="setoran-timeline-item">
                    {/* Green Bullet Node */}
                    <div className="setoran-timeline-dot"></div>

                    {/* Timeline Card */}
                    <div className="setoran-timeline-card">
                      {/* Top Row: Date, Edit, Predikat */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>
                          {formatHistoryDate(item)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            type="button"
                            onClick={() => {
                              // Load into editor or open modal
                              setSelectedSurahId(item.surahId || 2);
                              setAyatMulai(item.ayatAwal || 1);
                              setAyatAkhir(item.ayatAkhir || 1);
                              setPredikat(predBadge);
                              setStatusLanjut(statusTag === 'LANJUT' ? 'Lanjut' : 'Ulang');
                              if (showToast) showToast("Memuat setoran ke formulir untuk diedit.");
                            }}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.70rem',
                              fontWeight: 700,
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={11} />
                            <span>Edit</span>
                          </button>

                          <span style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.03em'
                          }}>
                            {predBadge}
                          </span>
                        </div>
                      </div>

                      {/* Surah Name in Arabic */}
                      <div style={{
                        fontFamily: 'var(--font-arabic)',
                        fontSize: '1.55rem',
                        fontWeight: 'bold',
                        color: 'var(--text-main)',
                        lineHeight: 1.2,
                        marginBottom: '4px'
                      }}>
                        {arabicName}
                      </div>

                      {/* Ayat & Juz info */}
                      <div style={{ fontSize: '0.80rem', color: '#64748b', marginBottom: '10px', fontWeight: 600 }}>
                        Ayat {item.ayatAwal}-{item.ayatAkhir} • Juz {item.juz || 1}
                      </div>

                      {/* Mushaf Position Box */}
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.80rem', fontWeight: 700 }}>
                          <BookOpen size={14} />
                          <span>{posMushaf}</span>
                        </div>
                        <span style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {barisText}
                        </span>
                      </div>

                      {/* Bottom Tags: SABAQ & LANJUT */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          letterSpacing: '0.03em'
                        }}>
                          {item.jenis || 'SABAQ'}
                        </span>
                        <span style={{
                          background: statusTag === 'LANJUT' ? '#dcfce7' : '#ffe4e6',
                          color: statusTag === 'LANJUT' ? '#16a34a' : '#e11d48',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          letterSpacing: '0.03em'
                        }}>
                          {statusTag}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer Info */}
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '16px', 
            borderTop: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.80rem',
            color: '#64748b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} style={{ color: '#16a34a' }} />
              <span>Ingin edit atau hapus setoran?</span>
            </div>

            <button 
              type="button"
              onClick={() => setShowFullHistoryModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#15803d',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Menu Riwayat</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          MUSHAF MADINAH SIMAK MODAL (STANDAR 15 BARIS, 1 HALAMAN & PER-BARIS)
          TANPA AUDIO, TANPA TERJEMAH / LATIN SESUAI PERMINTAAN USER
          ========================================================================= */}
      <MushafMadinahSimakModal 
        isOpen={showSimakModal || showMushafModal}
        onClose={() => {
          setShowSimakModal(false);
          setShowMushafModal(false);
        }}
        initialPage={mushafPos.startPage}
        surah={activeSurah}
        ayatMulai={ayatMulai}
        ayatAkhir={ayatAkhir || ayatMulai}
        setAyatAkhir={setAyatAkhir}
        onAyatAkhirChange={(newAyat, surahId) => {
          setAyatAkhir(newAyat);
          if (surahId && parseInt(surahId) !== parseInt(selectedSurahId)) {
            setIsSampaiBedaSurah(true);
            setSelectedSurahAkhirId(parseInt(surahId));
          }
        }}
        santriName={selectedSantri?.nama || selectedSantri?.name || 'Santri'}
        salahHafalan={salahHafalan}
        setSalahHafalan={setSalahHafalan}
        salahTajwid={salahTajwid}
        setSalahTajwid={setSalahTajwid}
        statusLanjut={statusLanjut}
        setStatusLanjut={setStatusLanjut}
        onFinish={() => {
          if (showToast) showToast("Hasil simak & batas akhir ayat setoran tersinkronisasi ke formulir.");
        }}
      />

      {/* =========================================================================
          MODAL 3: FULL SETORAN HISTORY (MENU RIWAYAT / LIHAT SEMUA)
          ========================================================================= */}
      {showFullHistoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={22} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    Seluruh Riwayat Setoran Santri
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Total {setoranList.length} rekaman setoran tersimpan dalam database
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    storageService.exportSetoranToCSV();
                    if (showToast) showToast("Berhasil mengekspor setoran ke file Excel CSV!");
                  }}
                >
                  <Download size={15} />
                  <span>Ekspor CSV</span>
                </button>

                <button 
                  onClick={() => setShowFullHistoryModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Table of all setoran */}
            <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Santri</th>
                    <th>Jenis</th>
                    <th>Surah & Rentang Ayat</th>
                    <th>Mushaf 15 Baris</th>
                    <th>Predikat</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {setoranList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        Belum ada rekaman setoran.
                      </td>
                    </tr>
                  ) : (
                    setoranList.map(item => {
                      const santri = santriList.find(s => s.id === item.santriId) || { nama: 'Santri' };
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            {item.tanggal}
                          </td>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>
                            {santri.nama}
                          </td>
                          <td>
                            <span className={`badge badge-${(item.jenis || 'sabaq').toLowerCase()}`}>
                              {item.jenis || 'SABAQ'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 800 }}>{item.surahName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Ayat {item.ayatAwal}-{item.ayatAkhir} • Juz {item.juz || 1}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#166534' }}>
                              {item.posisiMushaf || `Hlm ${item.halaman || 18}`}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 800
                            }}>
                              {item.predikat || item.nilai || 'JAYYID'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              color: (item.statusLanjut === 'LANJUT' || item.statusLanjut === 'Lanjut Ayat Baru') ? '#16a34a' : '#e11d48',
                              fontWeight: 800,
                              fontSize: '0.78rem'
                            }}>
                              {item.statusLanjut || 'LANJUT'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#e11d48' }}
                              onClick={() => {
                                if (window.confirm(`Hapus catatan setoran Surah ${item.surahName} (${santri.nama})?`)) {
                                  if (onDeleteSetoran) {
                                    onDeleteSetoran(item.id);
                                  } else {
                                    storageService.deleteSetoran(item.id);
                                    if (onReload) onReload();
                                  }
                                  if (showToast) showToast("Setoran berhasil dihapus.");
                                }
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={() => setShowFullHistoryModal(false)}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '10px 24px' }}
              >
                Tutup Riwayat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
