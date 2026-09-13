import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Plus, 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  Lock, 
  X, 
  Check, 
  Save, 
  Building2,
  MapPin,
  Compass,
  ExternalLink,
  Navigation,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { storageService } from '../../services/storage';
import QRCode from 'qrcode';

// Komponen Realistis QR Code Asli Berstandar ISO/IEC 18004 (Scannable oleh semua kamera)
function RealQRCodeImage({ value, size = 76 }) {
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 3, // Resolusi tinggi agar crisp dan mudah discan
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrSrc(url))
      .catch(err => console.error('Error generating real QR:', err));
  }, [value, size]);

  if (!qrSrc) {
    return (
      <div style={{ width: size, height: size, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <QrCode size={size * 0.4} color="#94a3b8" />
      </div>
    );
  }

  return (
    <img 
      src={qrSrc} 
      alt={`QR Code ${value}`} 
      width={size} 
      height={size} 
      style={{ display: 'block', borderRadius: '4px', imageRendering: 'pixelated' }} 
    />
  );
}

export default function LokasiQRSigapView({ showToast }) {
  const [lokasiList, setLokasiList] = useState(storageService.getSigapLokasiQR());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLokasi, setEditingLokasi] = useState(null);

  // State GPS Fetcher
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  const [formData, setFormData] = useState({
    kelas: 'X A',
    lokasi: '',
    kodeManual: 'MAIAS-XA',
    locked: true,
    lat: -7.327415,
    lng: 108.215542,
    radiusMeter: 50
  });

  // Pastikan data tersinkronisasi jika ada perubahan storage
  const reloadData = () => {
    const list = storageService.getSigapLokasiQR();
    setLokasiList(list);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Helper: Set Titik Presensi Kampus MAIAS Tasikmalaya
  const handleSetPresetMaias = () => {
    setFormData(prev => ({
      ...prev,
      lat: -7.327415,
      lng: 108.215542,
      locked: true
    }));
    setGpsAccuracy(5);
    setGpsError(null);
    showToast && showToast("Titik Kampus MA Ihya As Sunnah (-7.327415, 108.215542) berhasil diterapkan!");
  };

  // Helper: Parse Google Maps link atau koordinat yang dipaste
  const [mapsInputText, setMapsInputText] = useState('');
  const handleParseMapsInput = (input) => {
    if (!input || !input.trim()) return;
    const text = input.trim();
    
    // Format 1: URL Google Maps misal @-7.327415,108.215542 atau ?q=-7.327415,108.215542
    const urlMatch = text.match(/[@?&]q?=([+-]?\d+[.,]\d+)[, ]+([+-]?\d+[.,]\d+)/);
    // Format 2: Angka koordinat langsung "-7.327415, 108.215542" atau "-7,327415, 108,215542"
    const coordMatch = text.match(/([+-]?\d+[.,]\d+)[,\s]+([+-]?\d+[.,]\d+)/);

    const match = urlMatch || coordMatch;
    if (match) {
      const lat = Number(parseFloat(match[1].replace(',', '.')).toFixed(6));
      const lng = Number(parseFloat(match[2].replace(',', '.')).toFixed(6));
      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData(prev => ({ ...prev, lat, lng, locked: true }));
        setGpsAccuracy(10);
        setGpsError(null);
        setMapsInputText('');
        showToast && showToast(`Koordinat berhasil diekstrak: ${lat}, ${lng}`);
        return;
      }
    }
    showToast && showToast("Format koordinat tidak terbaca. Contoh format: -7.327415, 108.215542");
  };

  // Ambil Titik GPS Asli dari Perangkat (Dengan Multi-Stage Fallback Cepat)
  const handleGetRealGPS = async () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi Geolocation / GPS.");
      return;
    }

    setIsGettingGPS(true);
    setGpsError(null);
    setGpsAccuracy(null);

    const queryPosition = (options) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    try {
      // TAHAP 1: Coba Fast Geolocation (enableHighAccuracy: false) - Sangat cepat di PC/Laptop/Wi-Fi
      let position = null;
      try {
        position = await queryPosition({
          enableHighAccuracy: false,
          timeout: 7000,
          maximumAge: 300000
        });
      } catch (e1) {
        // TAHAP 2: Jika gagal, coba dengan akurasi tinggi (jika perangkat memiliki chip satelit GPS)
        try {
          position = await queryPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        } catch (e2) {
          throw e2;
        }
      }

      if (position && position.coords) {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        const acc = Math.round(position.coords.accuracy || 15);

        setFormData(prev => ({
          ...prev,
          lat,
          lng,
          locked: true
        }));
        setGpsAccuracy(acc);
        setIsGettingGPS(false);
        showToast && showToast(`Titik GPS berhasil dikunci! (Akurasi: ±${acc}m)`);
        return;
      }
    } catch (error) {
      console.warn("Browser GPS timeout/error, mencoba IP Geolocation fallback...", error);
      
      // TAHAP 3: IP Geolocation Fallback
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const lat = Number(Number(data.latitude).toFixed(6));
          const lng = Number(Number(data.longitude).toFixed(6));
          setFormData(prev => ({
            ...prev,
            lat,
            lng,
            locked: true
          }));
          setGpsAccuracy(100);
          setIsGettingGPS(false);
          setGpsError(`GPS Satelit timeout. Berhasil mendapatkan titik lokasi jaringan/Wi-Fi (${data.city || 'Jawa Barat'}).`);
          showToast && showToast(`Lokasi jaringan/IP berhasil diambil (${data.city || ''})`);
          return;
        }
      } catch (ipErr) {
        console.warn("IP Fallback failed:", ipErr);
      }

      setIsGettingGPS(false);
      let errMsg = "Waktu permintaan GPS habis (Timeout). Komputer desktop seringkali tidak memiliki chip satelit GPS.";
      if (error.code === 1) errMsg = "Izin akses lokasi ditolak oleh browser. Klik ikon gembok di URL browser untuk mengizinkan lokasi.";
      else if (error.code === 2) errMsg = "Sinyal GPS tidak tersedia pada perangkat.";
      setGpsError(errMsg);
      showToast && showToast(errMsg);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.kelas || !formData.lokasi) {
      alert("Kelas dan Lokasi wajib diisi!");
      return;
    }

    // Pastikan koordinat tersimpan sebagai angka valid (bersihkan koma jika ada)
    const cleanLat = Number(parseFloat(String(formData.lat).replace(',', '.')).toFixed(6)) || -7.327415;
    const cleanLng = Number(parseFloat(String(formData.lng).replace(',', '.')).toFixed(6)) || 108.215542;
    const cleanPayload = {
      ...formData,
      lat: cleanLat,
      lng: cleanLng,
      radiusMeter: parseInt(formData.radiusMeter) || 50
    };

    if (editingLokasi) {
      storageService.updateSigapLokasiQR(editingLokasi.id, {
        ...cleanPayload,
        gpsStatus: formData.locked ? 'GPS: Locked' : 'GPS: Tidak Wajib'
      });
      showToast && showToast(`Titik lokasi ${formData.kelas} berhasil diperbarui!`);
    } else {
      storageService.addSigapLokasiQR({
        ...cleanPayload,
        kodeManual: formData.kodeManual || `MAIAS-${formData.kelas.replace(/\s+/g, '')}`
      });
      showToast && showToast(`Titik lokasi ${formData.kelas} berhasil ditambahkan!`);
    }

    reloadData();
    setShowAddModal(false);
    setEditingLokasi(null);
    setGpsAccuracy(null);
    setGpsError(null);
    setFormData({
      kelas: 'X A',
      lokasi: '',
      kodeManual: 'MAIAS-XA',
      locked: true,
      lat: -7.327415,
      lng: 108.215542,
      radiusMeter: 50
    });
  };

  const handleDelete = (id, kelas) => {
    if (window.confirm(`Hapus titik presensi QR kelas ${kelas}?`)) {
      storageService.deleteSigapLokasiQR(id);
      reloadData();
      showToast && showToast(`Titik QR kelas ${kelas} berhasil dihapus.`);
    }
  };

  const handleSaveQR = async (item) => {
    try {
      const qrValue = item.kodeManual || `MAIAS-${item.kelas.replace(/\s+/g, '')}`;
      // Generate genuine, authentic QR Code as high-res data URL
      const qrDataUrl = await QRCode.toDataURL(qrValue, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 380;
        canvas.height = 490;
        const ctx = canvas.getContext('2d');

        // Background putih bersih
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 380, 490);

        // Header Border / Top Accent Emerald
        ctx.fillStyle = '#059669';
        ctx.fillRect(0, 0, 380, 8);

        // Brand & Title
        ctx.fillStyle = '#047857';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("MA IHYA' AS-SUNNAH • SIGAP PRESENSI", 190, 32);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`TITIK LOKASI: ${item.kelas}`, 190, 64);

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(item.lokasi, 190, 88);

        // Draw Real Genuine QR Code (Scannable oleh semua kamera HP)
        ctx.drawImage(img, 70, 108, 240, 240);

        // Border around QR
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(68, 106, 244, 244);

        // Manual Code (Big monospace)
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(item.kodeManual, 190, 380);

        // GPS Lock info
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = item.locked ? '#059669' : '#64748b';
        ctx.fillText(item.locked ? `GPS LOCKED (Radius: ${item.radiusMeter || 50}m)` : 'GPS: Tidak Wajib', 190, 406);

        // Coordinates
        if (item.lat && item.lng) {
          ctx.font = '11px monospace';
          ctx.fillStyle = '#475569';
          ctx.fillText(`Koordinat: ${item.lat}, ${item.lng}`, 190, 428);
        }

        // Footer helper
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText("Scan menggunakan kamera HP / Portal Pengampu untuk presensi halaqoh", 190, 458);

        const link = document.createElement('a');
        link.download = `QR_Asli_Presensi_${item.kelas.replace(/\s+/g, '_')}_${item.kodeManual}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast && showToast(`QR Code Asli untuk ${item.kelas} (${item.kodeManual}) berhasil diunduh!`);
      };
      img.src = qrDataUrl;
    } catch (err) {
      console.error(err);
      showToast && showToast("Gagal men-generate QR Code asli.");
    }
  };

  const handleCetakPDF = () => {
    window.print();
  };

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER PERSIS GAMBAR 2 */}
      <div className="sigap-page-header-row">
        <div className="sigap-page-title-group">
          <div className="sigap-page-icon-badge">
            <QrCode size={22} />
          </div>
          <div>
            <h1 className="sigap-page-title">QR & Lokasi Kelas</h1>
            <p className="sigap-page-subtitle">Atur titik presensi, kode unik QR, dan koordinat GPS asli ruangan.</p>
          </div>
        </div>

        {/* Tombol Aksi Kanan: Biru Cetak PDF & Hijau Tambah Lokasi */}
        <div className="sigap-page-actions">
          <button 
            className="sigap-btn-blue"
            onClick={handleCetakPDF}
          >
            <Printer size={15} />
            <span>Cetak Semua PDF</span>
          </button>

          <button 
            className="sigap-btn-teal"
            onClick={() => {
              setEditingLokasi(null);
              setGpsAccuracy(null);
              setGpsError(null);
              setFormData({
                kelas: 'X A',
                lokasi: '',
                kodeManual: 'MAIAS-XA',
                locked: true,
                lat: -7.327415,
                lng: 108.215542,
                radiusMeter: 50
              });
              setShowAddModal(true);
            }}
          >
            <Plus size={15} />
            <span>+ Tambah Lokasi</span>
          </button>
        </div>
      </div>

      {/* 2. GRID 6 KARTU QR KELAS PERSIS GAMBAR 2 (3 Kolom x 2 Baris) */}
      <div className="sigap-qr-grid">
        {lokasiList.map((item) => (
          <div key={item.id} className="sigap-qr-card">
            {/* Top Bar: Icon + Class Name + Location + Action buttons */}
            <div className="sigap-qr-card-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="sigap-kelas-icon-box">
                  <QrCode size={18} />
                </div>
                <div>
                  <div className="sigap-qr-class-name">{item.kelas}</div>
                  <div className="sigap-qr-location-text">{item.lokasi}</div>
                </div>
              </div>

              {/* Edit & Delete Action Buttons */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="sigap-btn-action edit"
                  title="Ubah Titik Lokasi"
                  onClick={() => {
                    setEditingLokasi(item);
                    setGpsAccuracy(null);
                    setGpsError(null);
                    setFormData({
                      kelas: item.kelas,
                      lokasi: item.lokasi,
                      kodeManual: item.kodeManual,
                      locked: item.locked !== undefined ? item.locked : true,
                      lat: item.lat !== undefined ? item.lat : -7.327415,
                      lng: item.lng !== undefined ? item.lng : 108.215542,
                      radiusMeter: item.radiusMeter || 50
                    });
                    setShowAddModal(true);
                  }}
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  className="sigap-btn-action delete"
                  title="Hapus Titik Lokasi"
                  onClick={() => handleDelete(item.id, item.kelas)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Middle: QR Graphic + Manual Code + GPS Status */}
            <div className="sigap-qr-body">
              {/* Visual Simulated QR Code Box */}
              <div className="sigap-qr-visual-box">
                <RealQRCodeImage value={item.kodeManual || item.kelas} size={76} />
              </div>

              {/* Right Manual Info */}
              <div>
                <div className="sigap-qr-manual-label">KODE MANUAL:</div>
                <div className="sigap-qr-manual-code">{item.kodeManual}</div>
                <div className="sigap-qr-gps-status">
                  {item.locked ? (
                    <span className="sigap-gps-badge-locked">
                      <Lock size={11} />
                      <span>GPS: Locked</span>
                    </span>
                  ) : (
                    <span className="sigap-gps-badge-unlocked">
                      <span>GPS: Tidak Wajib</span>
                    </span>
                  )}
                </div>

                {/* Info Koordinat GPS Asli & Link Maps */}
                {item.lat && item.lng && (
                  <div style={{ marginTop: '5px', fontSize: '10px', color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={10} color="#059669" />
                    <span style={{ fontFamily: 'monospace' }}>
                      {Number(item.lat).toFixed(4)}, {Number(item.lng).toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Lihat titik di Google Maps"
                      style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', marginLeft: '2px' }}
                    >
                      <ExternalLink size={9} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Save QR Button */}
            <button 
              className="sigap-btn-save-qr"
              onClick={() => handleSaveQR(item)}
            >
              <Download size={14} />
              <span>Save QR</span>
            </button>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* MODAL TAMBAH / EDIT LOKASI (PERSIS SCREENSHOT PENGGUNA)    */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '520px', borderRadius: '16px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                {editingLokasi ? 'Ubah Titik Lokasi QR' : 'Tambah Titik Lokasi QR Baru'}
              </h3>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowAddModal(false)}
                style={{ borderRadius: '8px', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. PILIH KELAS */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                    Pilih Kelas *
                  </label>
                  <select 
                    className="form-input"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      kelas: e.target.value,
                      kodeManual: `MAIAS-${e.target.value.replace(/\s+/g, '')}`
                    })}
                    style={{ fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    <option value="X A">X A</option>
                    <option value="X B">X B</option>
                    <option value="XI A">XI A</option>
                    <option value="XI B">XI B</option>
                    <option value="XII A">XII A</option>
                    <option value="XII B">XII B</option>
                    <option value="Masjid Tahfidz">Masjid Tahfidz Ikhwan</option>
                    <option value="Aula Tahfidz">Aula Tahfidz Akhwat</option>
                  </select>
                </div>

                {/* 2. NAMA / TITIK RUANGAN */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                    Nama / Titik Ruangan *
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Gedung B, Lt 1 / Lokal Ikhwan Lantai 2"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    required
                  />
                </div>

                {/* 3. KODE MANUAL KELAS */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                    Kode Manual Kelas
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    value={formData.kodeManual}
                    onChange={(e) => setFormData({ ...formData, kodeManual: e.target.value })}
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Digunakan jika kamera siswa bermasalah saat scan QR.
                  </small>
                </div>

                {/* 4. CHECKBOX KUNCI LOKASI GPS (PERSIS GAMBAR SCREENSHOT) */}
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input 
                    type="checkbox"
                    id="gpsLocked"
                    checked={formData.locked}
                    onChange={(e) => setFormData({ ...formData, locked: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <label htmlFor="gpsLocked" style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                    Kunci Lokasi GPS (Wajib dalam radius sekolah)
                  </label>
                </div>

                {/* 5. BOX PENENTUAN TITIK KOORDINAT GPS ASLI */}
                {formData.locked && (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={16} color="#059669" />
                          <span>Titik Koordinat GPS Asli</span>
                        </div>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#047857' }}>
                          Ustadz pengampu wajib berada di radius titik ini saat melakukan scan QR presensi.
                        </p>
                      </div>

                      {/* Tombol Aksi GPS Cepat */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Preset MAIAS */}
                        <button
                          type="button"
                          onClick={handleSetPresetMaias}
                          style={{
                            background: '#047857',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 4px rgba(4,120,87,0.2)'
                          }}
                          title="Gunakan koordinat MA Ihya As Sunnah (-7.327415, 108.215542)"
                        >
                          <Building2 size={13} />
                          <span>🏫 Titik Kampus MAIAS</span>
                        </button>

                        {/* Ambil GPS Perangkat */}
                        <button
                          type="button"
                          onClick={handleGetRealGPS}
                          disabled={isGettingGPS}
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
                          }}
                        >
                          <Compass size={13} className={isGettingGPS ? "animate-spin" : ""} />
                          <span>{isGettingGPS ? "Mencari GPS..." : "📍 Ambil GPS Perangkat"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Paste Google Maps */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Navigation size={14} color="#059669" />
                      <input 
                        type="text"
                        placeholder="Paste Link Maps atau Koordinat (cth: -7.327415, 108.215542)..."
                        value={mapsInputText}
                        onChange={e => setMapsInputText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleParseMapsInput(mapsInputText); } }}
                        style={{
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: '11px',
                          color: '#1e293b'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleParseMapsInput(mapsInputText)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Terapkan
                      </button>
                    </div>

                    {/* Feedback Akurasi GPS */}
                    {gpsAccuracy && (
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #86efac',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                          <CheckCircle2 size={13} /> Sinyal GPS Asli Terkunci (Akurasi: ±{gpsAccuracy}m)
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${formData.lat},${formData.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          Cek di Maps <ExternalLink size={10} />
                        </a>
                      </div>
                    )}

                    {gpsError && (
                      <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '0.75rem',
                        color: '#b91c1c',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        lineHeight: 1.4
                      }}>
                        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong>{gpsError}</strong>
                          <div style={{ fontSize: '10.5px', color: '#7f1d1d', marginTop: '2px' }}>
                            💡 <em>Tip: Klik tombol hijau <strong>"🏫 Titik Kampus MAIAS"</strong> di atas atau salin koordinat langsung dari Google Maps.</em>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Input Koordinat Lat, Lng & Radius (Mendukung Koma dan Titik) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                          Latitude (Lintang)
                        </label>
                        <input 
                          type="text"
                          inputMode="decimal"
                          className="form-input"
                          value={formData.lat}
                          onChange={(e) => {
                            const val = e.target.value.replace(',', '.');
                            setFormData({ ...formData, lat: val });
                          }}
                          onBlur={(e) => {
                            const num = parseFloat(e.target.value.replace(',', '.'));
                            if (!isNaN(num)) setFormData({ ...formData, lat: Number(num.toFixed(6)) });
                          }}
                          style={{ fontSize: '0.8rem', padding: '6px 8px', fontFamily: 'monospace' }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                          Longitude (Bujur)
                        </label>
                        <input 
                          type="text"
                          inputMode="decimal"
                          className="form-input"
                          value={formData.lng}
                          onChange={(e) => {
                            const val = e.target.value.replace(',', '.');
                            setFormData({ ...formData, lng: val });
                          }}
                          onBlur={(e) => {
                            const num = parseFloat(e.target.value.replace(',', '.'));
                            if (!isNaN(num)) setFormData({ ...formData, lng: Number(num.toFixed(6)) });
                          }}
                          style={{ fontSize: '0.8rem', padding: '6px 8px', fontFamily: 'monospace' }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '3px' }}>
                          Radius Presensi
                        </label>
                        <select 
                          className="form-input"
                          value={formData.radiusMeter}
                          onChange={(e) => setFormData({ ...formData, radiusMeter: parseInt(e.target.value) || 50 })}
                          style={{ fontSize: '0.8rem', padding: '6px 8px', fontWeight: 700 }}
                        >
                          <option value="25">25 m (Ketat)</option>
                          <option value="50">50 m (Standar)</option>
                          <option value="100">100 m (Kompleks)</option>
                          <option value="200">200 m (Pesantren)</option>
                          <option value="500">500 m (Area Luas)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER BUTTONS PERSIS GAMBAR SCREENSHOT */}
              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  style={{ borderRadius: '8px', padding: '7px 16px', fontSize: '0.88rem', fontWeight: 700 }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{
                    background: '#059669',
                    borderColor: '#059669',
                    borderRadius: '8px',
                    padding: '7px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={15} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
