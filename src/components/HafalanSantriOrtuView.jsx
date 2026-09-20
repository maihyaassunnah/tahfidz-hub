import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Search, 
  Filter, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ChevronRight,
  User,
  Star,
  Info,
  Share2
} from 'lucide-react';
import { storageService } from '../services/storage';

export default function HafalanSantriOrtuView({
  santriList = [],
  setoranList = [],
  halaqahList = [],
  authUser,
  showToast
}) {
  const currentAuth = authUser || storageService.getAuthUser();

  // 1. Dapatkan data ananda sendiri (100% terisolasi)
  const ananda = santriList.find(s => 
    s.id === currentAuth?.santriId || 
    s.nis === currentAuth?.nis || 
    (currentAuth?.namaSantri && (s.nama || '').toLowerCase() === currentAuth.namaSantri.toLowerCase())
  ) || santriList[0] || {
    nama: 'Ananda Santri',
    nis: '39938383',
    target: '3 Juz / Tahun'
  };

  const halaqahAnanda = halaqahList.find(h => h.id === ananda.halaqahId) || {};

  // 2. Filter Setoran Khusus Ananda
  const allAnandaSetoran = useMemo(() => {
    return setoranList.filter(s => 
      s.santriId === ananda.id || 
      s.santri_id === ananda.id || 
      (ananda.nama && (s.santriNama || s.santri_nama || '').toLowerCase() === ananda.nama.toLowerCase())
    );
  }, [setoranList, ananda]);

  // 3. State Filter
  const [datePreset, setDatePreset] = useState('semua'); // 'semua', 'hari-ini', '7-hari', 'bulan-ini', 'kustom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState('ALL');
  const [nilaiFilter, setNilaiFilter] = useState('ALL');

  // Handle Preset Button Click
  const applyPreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const toYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'hari-ini') {
      const todayStr = toYMD(today);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7-hari') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      setStartDate(toYMD(past7));
      setEndDate(toYMD(today));
    } else if (preset === 'bulan-ini') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(toYMD(startOfMonth));
      setEndDate(toYMD(today));
    } else if (preset === 'semua') {
      setStartDate('');
      setEndDate('');
    }
  };

  const resetAllFilters = () => {
    setDatePreset('semua');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setJenisFilter('ALL');
    setNilaiFilter('ALL');
  };

  // 4. Data Terfilter Berdasarkan Tanggal, Pencarian, & Kategori
  const filteredSetoran = useMemo(() => {
    return allAnandaSetoran.filter(item => {
      // Filter Tanggal
      if (startDate || endDate) {
        if (!item.tanggal) return false;
        const itemDate = item.tanggal.slice(0, 10);
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
      }

      // Filter Pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const surah = (item.surat || item.surahName || item.surah || '').toLowerCase();
        const catatan = (item.catatan || item.keterangan || '').toLowerCase();
        const pengampu = (item.pengampu || item.musyrif || item.pengampuNama || '').toLowerCase();
        const match = surah.includes(q) || catatan.includes(q) || pengampu.includes(q);
        if (!match) return false;
      }

      // Filter Jenis
      if (jenisFilter !== 'ALL') {
        const itemJenis = (item.jenis || 'ZIYADAH').toUpperCase();
        if (itemJenis !== jenisFilter) return false;
      }

      // Filter Nilai
      if (nilaiFilter !== 'ALL') {
        const itemNilai = (item.nilai || item.predikat || 'MUMTAZ').toUpperCase();
        if (!itemNilai.includes(nilaiFilter)) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
  }, [allAnandaSetoran, startDate, endDate, searchQuery, jenisFilter, nilaiFilter]);

  // 5. Kalkulasi Statistik dalam Periode Terpilih
  const stats = useMemo(() => {
    const totalSetoran = filteredSetoran.length;
    let totalHalaman = 0;
    let mumtazCount = 0;

    filteredSetoran.forEach(s => {
      const ayatCount = Math.max(1, ((s.ayatAkhir || s.ayatSelesai || 1) - (s.ayatAwal || s.ayatMulai || 1) + 1));
      const hlm = Number(s.halaman) || (ayatCount / 15);
      totalHalaman += hlm;

      const pred = (s.nilai || s.predikat || '').toUpperCase();
      if (pred.includes('MUMTAZ') || pred.includes('A') || pred.includes('ISTIMEWA') || pred.includes('LANCAR')) {
        mumtazCount++;
      }
    });

    const persenMumtaz = totalSetoran > 0 ? Math.round((mumtazCount / totalSetoran) * 100) : 100;
    const latestSurah = filteredSetoran[0]?.surat || filteredSetoran[0]?.surahName || '-';

    return {
      totalSetoran,
      totalHalaman: totalHalaman.toFixed(1),
      persenMumtaz,
      latestSurah
    };
  }, [filteredSetoran]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const anandaName = ananda.nama || 'Ananda';
    const totalHlm = stats.totalHalaman;
    const latest = stats.latestSurah;
    const halaqah = halaqahAnanda.nama || 'Tahfidz';
    const target = ananda.target || '3 Juz / Tahun';
    const msg = `*Assalamu'alaikum Warahmatullahi Wabarakatuh*\n\nAlhamdulillah, berikut rangkuman capaian hafalan Al-Qur'an ananda kami:\n\n👤 *Nama Santri:* ${anandaName} (NIS: ${ananda.nis || '-'})\n📖 *Halaqah:* ${halaqah}\n🎯 *Target:* ${target}\n✨ *Capaian Setoran Terakhir:* ${latest}\n📄 *Total Disetor (Periode Ini):* ${totalHlm} Halaman (${stats.totalSetoran} kali setor)\n🌟 *Kualitas Kelancaran:* ${stats.persenMumtaz}% Kategori Mumtaz / Sangat Lancar\n\n_Semoga ananda senantiasa istiqomah dalam memelihara Kalamullah dan menjadi kebanggaan orang tua di dunia & akhirat. Aamiin._\n\n*(Dipantau via SIMTAH Tahfidz HUB)*`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="page-content-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* ══════════ 1. HEADER BANNER ANANDA ══════════ */}
      <div 
        className="halaqah-green-banner" 
        style={{ 
          background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #064e3b 100%)', 
          borderRadius: '20px', 
          padding: '26px 28px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, color: '#a7f3d0', letterSpacing: '0.5px' }}>
            <Sparkles size={14} />
            RIWAYAT LENGKAP HAFALAN SANTRI
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '8px', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Hafalan Ananda: {ananda.nama || 'Santri'}
          </h1>
          <p style={{ fontSize: '0.90rem', color: '#d1fae5', margin: 0, maxWidth: '680px' }}>
            Pantau seluruh catatan setoran hafalan baru (Ziyadah) dan pengulangan (Muroja'ah) ananda beserta evaluasi ustadz pengampu dengan filter rentang tanggal.
          </p>

          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
              NIS: {ananda.nis || '-'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
              Halaqah: {halaqahAnanda.nama || 'Tahfidz'}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
              Pengampu: {halaqahAnanda.musyrif || 'Ustadz Pengampu'}
            </span>
            <span style={{ background: 'rgba(251, 191, 36, 0.25)', border: '1px solid rgba(251, 191, 36, 0.5)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', color: '#fef3c7', fontWeight: 700 }}>
              Target: {ananda.target || '3 Juz / Tahun'}
            </span>
          </div>

          {/* Action Buttons: Bagikan ke WhatsApp & Cetak */}
          <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 18px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.15s ease'
              }}
              title="Bagikan ringkasan hafalan ananda ke keluarga lewat WhatsApp"
            >
              <Share2 size={16} />
              <span>📲 Bagikan Capaian ke WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.12, pointerEvents: 'none' }}>
          <BookOpen size={190} />
        </div>
      </div>

      {/* ══════════ 2. KARTU STATISTIK RINGKASAN PERIODE TERPILIH ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px' }}>
        
        {/* Total Setoran */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Frekuensi Setoran
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f766e', marginTop: '4px' }}>
              {stats.totalSetoran} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Kali</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
              {datePreset === 'semua' ? 'Semua Riwayat' : 'Periode Terfilter'}
            </div>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <Clock size={24} />
          </div>
        </div>

        {/* Volume Halaman */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Volume Halaman
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>
              {stats.totalHalaman} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Hlm</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
              Estimasi Total Mushaf
            </div>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <BookOpen size={24} />
          </div>
        </div>

        {/* Kualitas Hafalan (Mumtaz) */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Kualitas Mumtaz
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>
              {stats.persenMumtaz}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
              Predikat Terbaik
            </div>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Award size={24} />
          </div>
        </div>

        {/* Surah Terakhir */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Setoran Terakhir
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {stats.latestSurah}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
              {filteredSetoran[0]?.tanggal || 'Belum ada'}
            </div>
          </div>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
            <TrendingUp size={24} />
          </div>
        </div>

      </div>

      {/* ══════════ 3. PANEL FILTER TANGGAL & PENCARIAN ══════════ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '18px',
        padding: '22px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        
        {/* Baris Atas: Label & Tombol Aksi */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="#059669" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Filter Riwayat Hafalan
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {(startDate || endDate || searchQuery || jenisFilter !== 'ALL' || nilaiFilter !== 'ALL') && (
              <button
                type="button"
                onClick={resetAllFilters}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={13} />
                Reset Filter
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#059669',
                border: 'none',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '0.80rem',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
              }}
            >
              <Printer size={14} />
              Cetak Laporan
            </button>
          </div>
        </div>

        {/* Baris Tombol Preset Tanggal */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'semua', label: 'Semua Waktu' },
            { id: 'hari-ini', label: 'Hari Ini' },
            { id: '7-hari', label: '7 Hari Terakhir' },
            { id: 'bulan-ini', label: 'Bulan Ini' }
          ].map(p => {
            const isSelected = datePreset === p.id && (!startDate || p.id !== 'semua');
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                style={{
                  background: isSelected ? '#059669' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? '1px solid #059669' : '1px solid #e2e8f0',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '0.80rem',
                  fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Baris Input Filter: Tanggal Mulai, Selesai, Pencarian, & Kategori */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: '12px',
          background: '#f8fafc',
          padding: '14px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0'
        }}>
          
          {/* Input Tanggal Mulai */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              📅 Tanggal Mulai
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset('kustom');
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                background: '#ffffff',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Input Tanggal Selesai */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              📅 Tanggal Selesai
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset('kustom');
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                background: '#ffffff',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Cari Surah / Catatan */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              🔍 Cari Surah / Catatan
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Misal: Al-Baqarah, Tajwid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.84rem',
                  background: '#ffffff',
                  color: '#0f172a'
                }}
              />
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Filter Jenis Setoran */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              🏷️ Jenis Setoran
            </label>
            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">Semua Jenis (Ziyadah & Muroja'ah)</option>
              <option value="ZIYADAH">Ziyadah (Hafalan Baru)</option>
              <option value="MUROJAAH">Muroja'ah (Pengulangan)</option>
              <option value="SABAQ">Sabaq (Hafalan Baru Hari Ini)</option>
              <option value="SABQI">Sabqi (Pengulangan Hafalan Baru)</option>
              <option value="MANZIL">Manzil (Muroja'ah Rutin)</option>
            </select>
          </div>

          {/* Filter Predikat Nilai */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
              ⭐ Predikat Nilai
            </label>
            <select
              value={nilaiFilter}
              onChange={(e) => setNilaiFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">Semua Nilai</option>
              <option value="MUMTAZ">Mumtaz (Istimewa / A+)</option>
              <option value="JAYYID">Jayyid (Baik / Sangat Baik)</option>
              <option value="MAQBUL">Maqbul (Cukup)</option>
            </select>
          </div>

        </div>

      </div>

      {/* ══════════ 4. TABEL / DAFTAR RIWAYAT HAFALAN ══════════ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.10rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Daftar Catatan Setoran Hafalan
            </h3>
            <div style={{ fontSize: '0.80rem', color: '#64748b', marginTop: '3px' }}>
              Menampilkan {filteredSetoran.length} catatan setoran {startDate || endDate ? `antara ${startDate || 'awal'} s/d ${endDate || 'hari ini'}` : ''}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Ziyadah
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
              Muroja'ah
            </span>
          </div>
        </div>

        {filteredSetoran.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '14px',
            border: '1px dashed #cbd5e1'
          }}>
            <BookOpen size={42} color="#94a3b8" style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>
              Tidak Ada Catatan Hafalan pada Filter Ini
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '440px', margin: '6px auto 14px' }}>
              Tidak ditemukan riwayat setoran ananda pada rentang tanggal atau kata kunci yang dipilih. Silakan coba atur ulang filter tanggal.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Tampilkan Semua Setoran
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="ortu-desktop-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Tanggal</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Surah & Rentang Ayat</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Juz / Halaman</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Jenis Setoran</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Predikat Nilai</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Ustadz Pengampu</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Catatan & Tajwid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSetoran.map((st, idx) => {
                    const isZiyadah = (st.jenis === 'ZIYADAH' || st.jenis === 'SABAQ');
                    const ayatCount = Math.max(1, ((st.ayatAkhir || st.ayatSelesai || 1) - (st.ayatAwal || st.ayatMulai || 1) + 1));
                    const hlm = st.halaman || (ayatCount / 15).toFixed(1);
                    const predikat = st.nilai || st.predikat || 'Mumtaz';

                    return (
                      <tr 
                        key={st.id || idx}
                        style={{ 
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Tanggal */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#475569', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#059669" />
                            <span>{st.tanggal || '-'}</span>
                          </div>
                        </td>

                        {/* Surah & Ayat */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                            QS. {st.surat || st.surahName || st.surah || 'Al-Qur\'an'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                            Ayat {st.ayatAwal || st.ayatMulai || 1} - {st.ayatAkhir || st.ayatSelesai || 7} ({ayatCount} Ayat)
                          </div>
                        </td>

                        {/* Juz / Hlm */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700, color: '#047857' }}>
                            Juz {st.juz || 1}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            ± {hlm} Halaman
                          </div>
                        </td>

                        {/* Jenis Setoran */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            background: isZiyadah ? '#ecfdf5' : '#eff6ff',
                            color: isZiyadah ? '#065f46' : '#1e40af',
                            border: isZiyadah ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            display: 'inline-block'
                          }}>
                            {st.jenis || 'ZIYADAH'}
                          </span>
                        </td>

                        {/* Predikat Nilai */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Star size={13} color="#f59e0b" fill="#f59e0b" />
                            <span style={{ fontWeight: 800, color: '#b45309', fontSize: '0.82rem' }}>
                              {predikat}
                            </span>
                          </div>
                        </td>

                        {/* Pengampu */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#334155', fontWeight: 600 }}>
                          {st.pengampu || st.musyrif || st.pengampuNama || halaqahAnanda.musyrif || 'Ustadz Pengampu'}
                        </td>

                        {/* Catatan Tajwid */}
                        <td style={{ padding: '12px 14px', color: '#475569', minWidth: '180px', maxWidth: '300px' }}>
                          <div style={{ fontSize: '0.80rem', fontStyle: st.catatan ? 'normal' : 'italic', color: st.catatan ? '#334155' : '#94a3b8' }}>
                            {st.catatan || st.keterangan || 'Tajwid lancar, makhraj fasih.'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 768px) */}
            <div className="ortu-mobile-cards">
              {filteredSetoran.map((st, idx) => {
                const isZiyadah = (st.jenis === 'ZIYADAH' || st.jenis === 'SABAQ');
                const ayatCount = Math.max(1, ((st.ayatAkhir || st.ayatSelesai || 1) - (st.ayatAwal || st.ayatMulai || 1) + 1));
                const hlm = st.halaman || (ayatCount / 15).toFixed(1);
                const predikat = st.nilai || st.predikat || 'Mumtaz';

                return (
                  <div key={st.id || `m-${idx}`} className="ortu-setoran-card">
                    {/* Header: Date + Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
                        <Calendar size={13} color="#059669" />
                        <span>{st.tanggal || '-'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          background: isZiyadah ? '#ecfdf5' : '#eff6ff',
                          color: isZiyadah ? '#065f46' : '#1e40af',
                          border: isZiyadah ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '0.70rem'
                        }}>
                          {st.jenis || 'ZIYADAH'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px' }}>
                          <Star size={11} color="#f59e0b" fill="#f59e0b" />
                          <span style={{ fontWeight: 800, color: '#b45309', fontSize: '0.72rem' }}>
                            {predikat}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Surah & Ayat */}
                    <div style={{ marginTop: '2px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                        QS. {st.surat || st.surahName || st.surah || 'Al-Qur\'an'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                        Ayat {st.ayatAwal || st.ayatMulai || 1} - {st.ayatAkhir || st.ayatSelesai || 7} ({ayatCount} Ayat) • Juz {st.juz || 1} (± {hlm} Hlm)
                      </div>
                    </div>

                    {/* Pengampu & Catatan */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        Pengampu: <span style={{ color: '#334155', fontWeight: 700 }}>{st.pengampu || st.musyrif || st.pengampuNama || halaqahAnanda.musyrif || 'Ustadz Pengampu'}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', fontStyle: st.catatan ? 'normal' : 'italic', color: st.catatan ? '#334155' : '#94a3b8' }}>
                        💬 {st.catatan || st.keterangan || 'Tajwid lancar, makhraj fasih.'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer info */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} color="#059669" />
            <span>Data riwayat setoran otomatis sinkron dengan rekap hafalan ustadz pengampu di halaqah.</span>
          </div>
          <div style={{ fontWeight: 600 }}>
            Total {filteredSetoran.length} Catatan
          </div>
        </div>

      </div>

    </div>
  );
}
