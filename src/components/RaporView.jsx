import React, { useState } from 'react';
import { Printer, Download, BookOpen, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

export default function RaporView({ 
  santriList, 
  halaqahList, 
  setoranList, 
  absensiList, 
  settings = {},
  selectedSantriId = "" 
}) {
  const [activeSantriId, setActiveSantriId] = useState(selectedSantriId || santriList[0]?.id || "s1");

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

  // Hitung rata-rata skor setoran
  const rataSkor = santriSetoran.length > 0 
    ? Math.round(santriSetoran.reduce((acc, s) => acc + (s.skor || 85), 0) / santriSetoran.length)
    : 90;

  const getPredikat = (score) => {
    if (score >= 90) return "Mumtaz (Istimewa)";
    if (score >= 80) return "Jayyid Jiddan (Sangat Baik)";
    if (score >= 70) return "Jayyid (Baik)";
    if (score >= 60) return "Maqbul (Cukup)";
    return "Kurang";
  };

  const handlePrint = () => {
    window.print();
  };

  const mutqinCount = currentSantri.juzMutqin ? currentSantri.juzMutqin.length : 0;
  const ziyadahCount = currentSantri.juzZiyadah ? currentSantri.juzZiyadah.length : 0;

  return (
    <div>
      {/* Control Toolbar (hidden on print) */}
      <div className="card no-print" style={{ marginBottom: '24px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>Pilih Santri:</label>
            <select 
              className="form-select"
              style={{ width: '280px' }}
              value={activeSantriId}
              onChange={(e) => setActiveSantriId(e.target.value)}
            >
              {santriList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kelas} - NIS: {s.nis})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={18} />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>
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
        {/* Official Kop Surat */}
        <div style={{ textAlign: 'center', borderBottom: '3px double #064e3b', paddingBottom: '16px', marginBottom: '24px', position: 'relative' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', color: '#047857', textTransform: 'uppercase' }}>
            YAYASAN IHYA AS SUNNAH TASIKMALAYA
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0', color: '#064e3b', letterSpacing: '-0.01em' }}>
            MADRASAH ALIYAH IHYA AS SUNNAH
          </h1>
          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
            {settings.alamatMadrasah || "Kompleks Islamic Center Ihya As Sunnah, Jl. Paseh No. 12, Tasikmalaya, Jawa Barat"}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
            Website: www.ma-ihyaassunnah.sch.id • Email: tahfidz@ma-ihyaassunnah.sch.id
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
            LEMBAR EVALUASI & RAPOR TAHFIDZ AL-QUR'AN
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
            <strong>: {settings.semester || "Ganjil 2026/2027"}</strong>
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
            <span style={{ color: '#64748b', display: 'inline-block', width: '130px' }}>Kelas</span>
            <strong>: {currentSantri.kelas}</strong>
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

        {/* Bagian B: Nilai Aspek Kualitas Bacaan */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b', borderBottom: '2px solid #059669', paddingBottom: '4px', marginBottom: '10px' }}>
            B. PENILAIAN ASPEK KUALITAS TAHFIDZ
          </div>

          <table className="rapor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#ecfdf5', color: '#064e3b' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', width: '40px', textAlign: 'center' }}>No</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Aspek Penilaian</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', width: '80px', textAlign: 'center' }}>Nilai (0-100)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px', width: '160px' }}>Predikat</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px 12px' }}>Keterangan / Evaluasi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>1</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>Kelancaran & Daya Ingat (Al-Hifdz)</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>{rataSkor}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>{getPredikat(rataSkor)}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>Hafalan lancar, tartil, dan mutqin</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>2</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>Ahkamut Tajwid (Hukum Tajwid)</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>{Math.min(98, rataSkor + 1)}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>{getPredikat(rataSkor + 1)}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>Ghunnah, ikhfa', dan mad diterapkan dengan baik</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>3</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>Makharijul Huruf & Shifat (Fashohah)</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>{rataSkor - 1}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>{getPredikat(rataSkor - 1)}</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>Pengucapan huruf jelas dan fasih sesuai kaidah</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>4</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>Adab Halaqah & Tilawah</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>95</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontWeight: 700 }}>Mumtaz (Istimewa)</td>
                <td style={{ border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: '0.8rem' }}>Menghormati mushaf, ustadz, dan teman halaqah</td>
              </tr>
            </tbody>
          </table>
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
            "Alhamdulillah ananda {currentSantri.nama} memiliki semangat tinggi dalam ziyadah dan muroja'ah. Disarankan untuk memperbanyak pengulangan mandiri di asrama menjelang waktu Maghrib dan Subuh agar hafalan semakin mutqin dan kokoh."
          </p>
        </div>

        {/* Kolom Tanda Tangan */}
        <div style={{ marginTop: '30px' }}>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', marginBottom: '16px', color: '#334155' }}>
            Tasikmalaya, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', fontSize: '0.85rem', gap: '20px' }}>
            <div>
              <div>Orang Tua / Wali Santri</div>
              <div style={{ height: '65px' }}></div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '2px', display: 'inline-block', minWidth: '160px' }}>
                ( {currentSantri.namaWali || "........................................"} )
              </div>
            </div>

            <div>
              <div>Musyrif Pembimbing</div>
              <div style={{ height: '65px' }}></div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '2px', display: 'inline-block', minWidth: '160px' }}>
                ( {halaqah.musyrif || "Ustadz Pembimbing"} )
              </div>
            </div>

            <div>
              <div>Koordinator Tahfidz</div>
              <div style={{ height: '65px' }}></div>
              <div style={{ fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '2px', display: 'inline-block', minWidth: '160px' }}>
                ( {settings.koordinatorTahfidz || "Ust. Hafizhul Qur'an, Al-Hafizh"} )
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
