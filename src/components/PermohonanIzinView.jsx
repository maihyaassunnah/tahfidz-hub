import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  User, 
  Share2, 
  Copy, 
  MessageSquare, 
  AlertCircle, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Trash2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storage';

export default function PermohonanIzinView({ 
  santriList, 
  currentRole = 'pengampu', 
  onReload, 
  showToast,
  authUser
}) {
  const currentAuth = authUser || storageService.getAuthUser();
  const currentPengampuNama = currentAuth?.nama || 'Wahyudin Hafiz, S.Pd';
  const currentPengampuNip = currentAuth?.nip || '19880101201501';
  const currentHalaqahNama = currentAuth?.halaqahNama || `Halaqah ${currentPengampuNama}`;
  const cleanMyName = (currentPengampuNama || '').toLowerCase().replace(/^(ustadz\s+|ustadzah\s+)/i, '').trim();

  // Data Izin Pengampu ke Super Admin
  const [sigapIzinList, setSigapIzinList] = useState(storageService.getSigapIzinGuru());
  
  // Data Izin Santri (khusus untuk role orang tua)
  const [santriIzinList, setSantriIzinList] = useState(storageService.getIzin());

  const [showFormModal, setShowFormModal] = useState(false);
  const [justSubmittedIzin, setJustSubmittedIzin] = useState(null);

  // Form State untuk Pengampu Mengajukan Izin ke Super Admin
  const todayISO = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    nama: currentPengampuNama,
    nip: currentPengampuNip,
    role: 'Pengampu Halaqoh',
    unit: "MA IHYA' AS-SUNNAH",
    halaqahNama: currentHalaqahNama,
    jenisIzin: 'Sakit',
    tanggalMulai: todayISO,
    tanggalSelesai: todayISO,
    sesi: 'Semua Sesi Hari Ini',
    alasan: '',
    guruBadal: 'Ustadz Agus Rinaldi',
    tugasSiswa: "Muroja'ah mandiri Juz 30 didampingi Guru Badal"
  });

  // Filter izin khusus pengampu aktif
  const pengampuIzinList = sigapIzinList.filter(i => {
    const iName = (i.nama || '').toLowerCase().replace(/^(ustadz\s+|ustadzah\s+)/i, '').trim();
    return (iName && (cleanMyName.includes(iName) || iName.includes(cleanMyName))) || 
      i.role === 'Pengampu Halaqoh' || 
      !i.role;
  });

  const reloadData = () => {
    setSigapIzinList(storageService.getSigapIzinGuru());
    setSantriIzinList(storageService.getIzin());
    onReload && onReload();
  };

  // Format Pesan WhatsApp Resmi Izin Pengampu
  const generateWhatsAppMessage = (item) => {
    const tanggalTeks = item.tanggalMulai === item.tanggalSelesai 
      ? item.tanggalMulai 
      : `${item.tanggalMulai} s/d ${item.tanggalSelesai}`;

    return `*SURAT PERMOHONAN IZIN PENGAMPU HALAQAH*
_Tahfidz HUB — MA IHYA' AS-SUNNAH (PPIAS)_
--------------------------------------------------
Assalamu'alaikum Warahmatullahi Wabarakatuh,

Yth. *Super Admin & Mudir Pesantren*
di Tempat

Dengan ini saya yang bertanda tangan di bawah ini:
• *Nama*: ${item.nama || 'Wahyudin Hafiz, S.Pd'}
• *NIP*: ${item.nip || '19880101201501'}
• *Tugas*: Pengampu Halaqah Tahfidz (X A - Ikhwan)
• *Unit*: MA IHYA' AS-SUNNAH

Mengajukan permohonan izin tidak dapat mendampingi halaqah tahfidz:
• *Jenis Izin*: ${item.jenisIzin || 'Sakit'}
• *Tanggal*: ${tanggalTeks}
• *Sesi Halaqah*: ${item.sesi || 'Semua Sesi Hari Ini'}
• *Alasan*: ${item.alasan || '-'}
• *Pelimpahan Tugas*: ${item.tugasSiswa || '-'}
• *Musyrif Badal*: ${item.guruBadal || 'Ustadz Badal'}

Permohonan resmi telah dicatat ke sistem *Tahfidz HUB* dengan status: *${item.status || 'Perlu Persetujuan'}*.
Mohon kiranya Bapak/Ibu dapat meninjau dan memberikan persetujuan izin ini.

Jazakumullahu Khairan Katsiran.
Wassalamu'alaikum Warahmatullahi Wabarakatuh.
--------------------------------------------------
_Diajukan melalui Aplikasi Tahfidz HUB_`;
  };

  // Fungsi Share ke WhatsApp
  const handleShareToWhatsApp = (item) => {
    const message = generateWhatsAppMessage(item);
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
    showToast && showToast("Membuka WhatsApp untuk mengirim surat permohonan izin...");
  };

  // Fungsi Salin Teks Format Izin
  const handleCopyFormat = (item) => {
    const message = generateWhatsAppMessage(item);
    navigator.clipboard.writeText(message);
    showToast && showToast("✓ Format teks surat izin berhasil disalin ke clipboard!");
  };

  // Submit Pengajuan Izin Baru oleh Pengampu
  const handleSubmitPengampuIzin = (e) => {
    e.preventDefault();
    if (!formData.alasan.trim()) {
      alert("Mohon isi alasan / keterangan permohonan izin.");
      return;
    }

    const created = storageService.addSigapIzinGuru({
      ...formData,
      tanggal: `${formData.tanggalMulai === formData.tanggalSelesai ? formData.tanggalMulai : `${formData.tanggalMulai} s/d ${formData.tanggalSelesai}`}`
    });

    reloadData();
    setShowFormModal(false);
    setJustSubmittedIzin(created);
    showToast && showToast("✓ Permohonan izin berhasil dikirim ke Super Admin!");

    // Reset form alasan
    setFormData(prev => ({
      ...prev,
      alasan: ''
    }));
  };

  // Hapus Pengajuan Izin
  const handleDeleteIzin = (id) => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan dan menghapus pengajuan izin ini?")) {
      storageService.deleteSigapIzinGuru(id);
      reloadData();
      showToast && showToast("Pengajuan izin berhasil dibatalkan.");
    }
  };

  // Hitung KPI Izin Pengampu
  const totalIzin = pengampuIzinList.length;
  const countPending = pengampuIzinList.filter(i => i.status === 'Perlu Persetujuan' || i.status === 'Menunggu Persetujuan').length;
  const countApproved = pengampuIzinList.filter(i => i.status === 'Disetujui').length;
  const countRejected = pengampuIzinList.filter(i => i.status === 'Ditolak').length;

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* 1. HEADER HALAMAN */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                PERMOHONAN IZIN PENGAMPU
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                • Ditujukan kepada Super Admin & Mudir PPIAS
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Pengajuan Izin Guru Pengampu
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              Formulir pengajuan izin ketidakhadiran halaqah resmi kepada Super Admin dengan fitur share surat format WhatsApp.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Profil Pengampu */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#047857',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px'
              }}>
                W
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>Wahyudin Hafiz, S.Pd</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pengampu Halaqah X A (Ikhwan)</div>
              </div>
            </div>

            {/* Tombol Ajukan Izin */}
            <button 
              className="btn btn-primary" 
              onClick={() => setShowFormModal(true)}
              style={{
                background: '#047857',
                borderColor: '#047857',
                padding: '9px 18px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.2)'
              }}
            >
              <PlusCircle size={18} />
              <span>+ Ajukan Izin Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RECAP STATUS IZIN PENGAMPU */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #047857' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
            TOTAL PERMOHONAN
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
            {totalIzin} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Surat Izin</span>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #f59e0b', background: '#fffdf5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase' }}>
              MENUNGGU PERSETUJUAN
            </div>
            <Clock size={16} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b45309', marginTop: '2px' }}>
            {countPending}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#92400e' }}>Perlu tinjauan Super Admin</div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #10b981', background: '#f0fdf4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 800, textTransform: 'uppercase' }}>
              DISETUJUI SUPER ADMIN
            </div>
            <CheckCircle2 size={16} color="#059669" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#047857', marginTop: '2px' }}>
            {countApproved}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#166534' }}>Resmi tercatat di monitoring</div>
        </div>

        <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #f43f5e', background: '#fff1f2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 800, textTransform: 'uppercase' }}>
              DITOLAK
            </div>
            <XCircle size={16} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#be123c', marginTop: '2px' }}>
            {countRejected}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9f1239' }}>Tidak mendapat dispensasi</div>
        </div>
      </div>

      {/* 3. MODAL SUKSES AJUKAN IZIN & PROMINENT SHARE KE WA */}
      {justSubmittedIzin && (
        <div className="card" style={{
          marginBottom: '22px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1.5px solid #a7f3d0',
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                  PERMOHONAN IZIN BERHASIL DIKIRIM KE SUPER ADMIN!
                </div>
                <h3 style={{ margin: '2px 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>
                  Izin {justSubmittedIzin.jenisIzin}: {justSubmittedIzin.tanggal}
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155' }}>
                  Alasan: "{justSubmittedIzin.alasan}" • Sesi: <strong>{justSubmittedIzin.sesi}</strong>
                </p>
                <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 700 }}>
                  Pelimpahan Tugas: {justSubmittedIzin.tugasSiswa} (Badal: {justSubmittedIzin.guruBadal || '-'})
                </div>
              </div>
            </div>

            {/* Tombol Aksi Share WA & Copy Format */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleShareToWhatsApp(justSubmittedIzin)}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Share2 size={18} />
                <span>📲 Share Format Izin ke WhatsApp</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => handleCopyFormat(justSubmittedIzin)}
                style={{ padding: '9px 14px', fontSize: '0.84rem' }}
                title="Salin teks permohonan izin"
              >
                <Copy size={16} />
                <span>Salin Teks</span>
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => setJustSubmittedIzin(null)}
                style={{ fontSize: '12px', padding: '6px' }}
                title="Tutup banner"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TABEL RIWAYAT PERMOHONAN IZIN PENGAMPU KE SUPER ADMIN */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Daftar Permohonan Izin yang Diajukan Pengampu
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Persetujuan dikelola oleh Super Admin pada menu Persetujuan Izin Guru
          </span>
        </div>

        <div className="table-responsive">
          <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Waktu Diajukan</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Rentang Tanggal & Sesi</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Jenis Izin</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Alasan / Keterangan & Badal</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status Persetujuan</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Catatan Super Admin</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', width: '220px' }}>Tindakan & Share WA</th>
              </tr>
            </thead>
            <tbody>
              {pengampuIzinList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Belum ada riwayat permohonan izin yang diajukan ke Super Admin.
                  </td>
                </tr>
              ) : (
                pengampuIzinList.map(item => {
                  const isApproved = item.status === 'Disetujui';
                  const isPending = item.status === 'Perlu Persetujuan' || item.status === 'Menunggu Persetujuan';
                  const isRejected = item.status === 'Ditolak';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Waktu Pengajuan */}
                      <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {item.dibuatPada || item.tanggal || '-'}
                      </td>

                      {/* Tanggal & Sesi */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>
                          {item.tanggal || item.tanggalMulai}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                          {item.sesi || "Semua Sesi"}
                        </div>
                      </td>

                      {/* Jenis Izin */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: item.jenisIzin === 'Sakit' ? '#fff1f2' : item.jenisIzin === 'Tugas Dinas / Lembaga' ? '#f0fdf4' : '#f0f9ff',
                          color: item.jenisIzin === 'Sakit' ? '#e11d48' : item.jenisIzin === 'Tugas Dinas / Lembaga' ? '#047857' : '#0284c7',
                          border: `1px solid ${item.jenisIzin === 'Sakit' ? '#fecdd3' : item.jenisIzin === 'Tugas Dinas / Lembaga' ? '#a7f3d0' : '#bae6fd'}`
                        }}>
                          {item.jenisIzin || 'Izin'}
                        </span>
                      </td>

                      {/* Alasan & Badal */}
                      <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>
                          {item.alasan || '-'}
                        </div>
                        {item.tugasSiswa && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                            📋 <strong>Badal/Tugas:</strong> {item.tugasSiswa}
                          </div>
                        )}
                      </td>

                      {/* Status Persetujuan Super Admin */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : '#fff1f2',
                          color: isApproved ? '#047857' : isPending ? '#b45309' : '#e11d48',
                          border: `1px solid ${isApproved ? '#a7f3d0' : isPending ? '#fde68a' : '#fecdd3'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {isApproved ? (
                            <>
                              <CheckCircle2 size={13} color="#059669" />
                              <span>Disetujui</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock size={13} color="#d97706" />
                              <span>Menunggu Persetujuan</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} color="#e11d48" />
                              <span>Ditolak</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Catatan Super Admin */}
                      <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: isApproved ? '#047857' : isRejected ? '#be123c' : '#64748b' }}>
                        {item.catatanAdmin || (isPending ? "Belum ada catatan (menunggu persetujuan)" : "-")}
                      </td>

                      {/* Tindakan & Tombol Share WA */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          {/* Tombol Share ke WhatsApp */}
                          <button
                            onClick={() => handleShareToWhatsApp(item)}
                            style={{
                              background: '#25D366',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                            }}
                            title="Bagikan format izin ini ke WhatsApp Super Admin"
                          >
                            <Share2 size={13} />
                            <span>Share WA</span>
                          </button>

                          {/* Tombol Salin Format */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCopyFormat(item)}
                            style={{ padding: '5px 8px' }}
                            title="Salin teks format surat izin"
                          >
                            <Copy size={13} />
                          </button>

                          {/* Tombol Hapus (jika masih pending) */}
                          {isPending && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDeleteIzin(item.id)}
                              style={{ padding: '5px 8px', color: '#e11d48' }}
                              title="Batalkan pengajuan izin ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. MODAL FORMULIR PENGAJUAN IZIN PENGAMPU KE SUPER ADMIN   */}
      {/* ========================================================= */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '540px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ background: '#047857', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#a7f3d0" />
                <h3 style={{ margin: 0, fontWeight: 800, color: '#ffffff', fontSize: '1.1rem' }}>
                  Formulir Permohonan Izin Pengampu
                </h3>
              </div>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowFormModal(false)}
                style={{ color: '#ffffff' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPengampuIzin}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
                
                {/* Identitas Pengampu (Auto) */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PEMOHON IZIN:</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                      {formData.nama} (NIP: {formData.nip})
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600 }}>
                      {formData.halaqahNama}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                    Pengampu
                  </span>
                </div>

                {/* Jenis Izin */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Jenis Izin *
                  </label>
                  <select 
                    className="form-select"
                    value={formData.jenisIzin}
                    onChange={(e) => setFormData({ ...formData, jenisIzin: e.target.value })}
                    required
                    style={{ fontWeight: 700 }}
                  >
                    <option value="Sakit">Sakit (Surat Dokter / Perawatan)</option>
                    <option value="Keperluan Keluarga">Keperluan Keluarga Mendesak</option>
                    <option value="Tugas Dinas / Lembaga">Tugas Dinas / Lembaga Pondok</option>
                    <option value="Ibadah / Umroh">Ibadah / Umroh</option>
                    <option value="Udzur Syar'i Lainnya">Udzur Syar'i Lainnya</option>
                  </select>
                </div>

                {/* Rentang Tanggal Izin */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Tanggal Mulai *</label>
                    <input 
                      type="date"
                      className="form-input"
                      value={formData.tanggalMulai}
                      onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value, tanggalSelesai: e.target.value >= formData.tanggalSelesai ? e.target.value : formData.tanggalSelesai })}
                      required
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Tanggal Selesai *</label>
                    <input 
                      type="date"
                      className="form-input"
                      value={formData.tanggalSelesai}
                      min={formData.tanggalMulai}
                      onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                      required
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>

                {/* Sesi Halaqah yang Ditinggalkan */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Sesi Halaqah yang Ditinggalkan *
                  </label>
                  <select 
                    className="form-select"
                    value={formData.sesi}
                    onChange={(e) => setFormData({ ...formData, sesi: e.target.value })}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="Semua Sesi Hari Ini">Semua Sesi Hari Ini (Full Day)</option>
                    <option value="Ba'da Subuh (05:00 - 06:30)">Ba'da Subuh (05:00 - 06:30)</option>
                    <option value="Pagi / Dhuha (08:30 - 10:00)">Pagi / Dhuha (08:30 - 10:00)</option>
                    <option value="Ba'da Ashar (16:00 - 17:30)">Ba'da Ashar (16:00 - 17:30)</option>
                    <option value="Ba'da Maghrib (18:45 - 20:30)">Ba'da Maghrib (18:45 - 20:30)</option>
                  </select>
                </div>

                {/* Alasan / Keterangan */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Alasan / Keterangan Permohonan Izin *
                  </label>
                  <textarea 
                    className="form-textarea"
                    rows="3"
                    placeholder="Jelaskan alasan izin secara detail (misal: 'Demam tinggi sejak dini hari dan disarankan dokter istirahat di rumah')..."
                    value={formData.alasan}
                    onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                    required
                  />
                </div>

                {/* Guru Badal & Pelimpahan Tugas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Musyrif Badal (Pengganti)
                    </label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Ustadz Agus Rinaldi"
                      value={formData.guruBadal}
                      onChange={(e) => setFormData({ ...formData, guruBadal: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Pelimpahan Tugas Santri
                    </label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Muroja'ah mandiri Juz 30"
                      value={formData.tugasSiswa}
                      onChange={(e) => setFormData({ ...formData, tugasSiswa: e.target.value })}
                    />
                  </div>
                </div>

                {/* Info WhatsApp Share Notice */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Share2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <span>
                    Setelah menekan <strong>Kirim Permohonan</strong>, Anda dapat langsung membagikan format resmi surat izin ini ke <strong>WhatsApp Super Admin / Mudir</strong>.
                  </span>
                </div>

              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowFormModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{
                    background: '#047857',
                    borderColor: '#047857',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} />
                  <span>Kirim Permohonan ke Super Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
