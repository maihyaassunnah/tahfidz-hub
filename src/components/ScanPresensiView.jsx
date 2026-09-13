import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Users, 
  Camera, 
  Sparkles, 
  Check, 
  MapPin, 
  AlertCircle,
  ShieldCheck, 
  Calendar, 
  Navigation,
  X,
  ArrowRight,
  UserCheck,
  Building2,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { storageService } from '../services/storage';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';

// Komponen Realistis QR Code Asli Berstandar ISO/IEC 18004 (Scannable oleh semua kamera)
function RealQRCodeImage({ value, size = 88 }) {
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 3,
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
      <div style={{ width: size, height: size, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
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
      style={{ 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0', 
        display: 'block', 
        background: '#ffffff',
        padding: '3px'
      }} 
    />
  );
}

// Formula Haversine untuk menghitung jarak GPS asli dalam satuan Meter
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
  const pLat1 = typeof lat1 === 'string' ? parseFloat(lat1.replace(',', '.')) : Number(lat1);
  const pLon1 = typeof lon1 === 'string' ? parseFloat(lon1.replace(',', '.')) : Number(lon1);
  const pLat2 = typeof lat2 === 'string' ? parseFloat(lat2.replace(',', '.')) : Number(lat2);
  const pLon2 = typeof lon2 === 'string' ? parseFloat(lon2.replace(',', '.')) : Number(lon2);
  if (isNaN(pLat1) || isNaN(pLon1) || isNaN(pLat2) || isNaN(pLon2)) return 0;

  const R = 6371000;
  const lat1Rad = (pLat1 * Math.PI) / 180;
  const lat2Rad = (pLat2 * Math.PI) / 180;
  const dLat = ((pLat2 - pLat1) * Math.PI) / 180;
  const dLon = ((pLon2 - pLon1) * Math.PI) / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function ScanPresensiView({ santriList, onReload, showToast, setActiveTab, authUser }) {
  const currentAuth = authUser || storageService.getAuthUser();
  const currentPengampuNama = currentAuth?.nama || 'Wahyudin Hafiz, S.Pd';
  const currentPengampuNip = currentAuth?.nip || 'NON-NIP';
  const currentHalaqahNama = currentAuth?.halaqahNama || `Halaqah ${currentPengampuNama}`;

  const jadwalHalaqoh = storageService.getJadwalHalaqoh();
  const lokasiList = storageService.getSigapLokasiQR();

  // Ambil sesi terpilih dari sessionStorage (jika diklik dari dashboard) atau null (tersembunyi sampai sesi diklik)
  const defaultSesi = (() => {
    try {
      const stored = sessionStorage.getItem('simtah_selected_scan_sesi');
      if (stored) {
        sessionStorage.removeItem('simtah_selected_scan_sesi');
        const found = jadwalHalaqoh.sesiList.find(s => s.nama === stored || s.id === stored);
        if (found) return found.nama;
      }
    } catch (e) {}
    return null; // Awalnya sembunyikan scanner sampai sesi diklik
  })();

  const [selectedSesi, setSelectedSesi] = useState(defaultSesi);
  const [selectedLokasiId, setSelectedLokasiId] = useState(lokasiList[0]?.id || 'l-xa');
  const [pengampuScanned, setPengampuScanned] = useState(null);
  const [isScanningPengampu, setIsScanningPengampu] = useState(false);
  const [gpsWarning, setGpsWarning] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Ref & State untuk Native Device Camera Scanner (Kamera Asli HP)
  const deviceCameraInputRef = useRef(null);
  const [isProcessingDevicePhoto, setIsProcessingDevicePhoto] = useState(false);
  const [deviceScanError, setDeviceScanError] = useState(null);

  // State untuk Live Camera QR Scanner (html5-qrcode webcam)
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const html5QrCodeRef = useRef(null);

  // Deteksi Hari & Tanggal Hari Ini
  const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayIndo = dayNames[new Date().getDay()];
  const todayISO = new Date().toISOString().split('T')[0];

  // Cari sesi yang dipilih
  const currentSesiObj = selectedSesi ? (jadwalHalaqoh.sesiList.find(s => s.nama === selectedSesi) || null) : null;
  const isHariAktif = currentSesiObj ? !!(jadwalHalaqoh.hariAktif?.[todayIndo]?.[currentSesiObj?.id] !== false) : true;

  // Cek status scan sesi saat ini
  const currentSesiStatus = currentSesiObj 
    ? storageService.isPengampuSudahScan(currentPengampuNama, currentSesiObj?.id, todayISO) 
    : { sudah: false, status: 'Belum' };

  // Daftar presensi pengampu hari ini
  const todayPengampuRecords = storageService.getPengampuPresensiList().filter(p => 
    p.tanggal === todayISO && 
    (storageService._cleanName(p.namaGuru) === storageService._cleanName(currentPengampuNama) || p.pengampuId === currentAuth?.id)
  );

  // Eksekusi Simpan Presensi Pengampu
  const executePresensiPengampu = (targetLokasi, gpsDetail) => {
    if (!selectedSesi || !currentSesiObj) {
      showToast && showToast('Pilih salah satu sesi halaqah terlebih dahulu!');
      return;
    }
    setIsScanningPengampu(true);
    const res = storageService.scanPresensiPengampu(
      currentPengampuNama, 
      targetLokasi, 
      selectedSesi, 
      currentSesiObj?.id
    );
    setIsScanningPengampu(false);
    setGpsWarning(null);

    setPengampuScanned({
      nama: currentPengampuNama,
      lokasi: `${targetLokasi.kelas} - ${targetLokasi.lokasi || ''}`,
      kodeQR: targetLokasi.kodeManual,
      jamScan: res.jamScan,
      status: res.status,
      sesi: selectedSesi,
      keterangan: res.keterangan || 'Tepat Waktu',
      gpsDetail
    });

    try {
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
    } catch (e) {}

    showToast && showToast(`✓ Presensi Kehadiran ${selectedSesi} Berhasil (Pukul ${res.jamScan} WIB)!`);
    setRefreshTrigger(prev => prev + 1);
    onReload && onReload();
  };

  // Proses Validasi Kode QR yang discan
  const handleProcessScannedCode = (scannedCode) => {
    if (!selectedSesi || !currentSesiObj) {
      showToast && showToast('Silakan pilih sesi halaqah terlebih dahulu!');
      return;
    }
    const cleanCode = (scannedCode || '').trim();
    const matchedLokasi = lokasiList.find(
      l => l.kodeManual === cleanCode || 
           cleanCode.includes(l.kodeManual) || 
           cleanCode.toLowerCase() === l.kelas.toLowerCase()
    ) || lokasiList.find(l => l.id === selectedLokasiId) || lokasiList[0];

    setSelectedLokasiId(matchedLokasi.id);

    // Cek aturan GPS Locked jika ada
    if (matchedLokasi.locked && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const userAcc = Math.round(pos.coords.accuracy || 10);
          const distance = calculateDistanceInMeters(userLat, userLng, matchedLokasi.lat, matchedLokasi.lng);
          const maxRadius = matchedLokasi.radiusMeter || 50;

          if (distance > maxRadius) {
            setIsScanningPengampu(false);
            setGpsWarning({
              targetLokasi: matchedLokasi,
              distance,
              maxRadius,
              userLat,
              userLng,
              userAcc
            });
            showToast && showToast(`Perhatian: Posisi GPS berjarak ${distance}m dari titik ruangan!`);
          } else {
            executePresensiPengampu(matchedLokasi, {
              status: `Terverifikasi Sesuai Radius (${distance}m)`,
              distance,
              maxRadius,
              accuracy: userAcc
            });
          }
        },
        (err) => {
          console.warn("GPS Scan warning:", err);
          executePresensiPengampu(matchedLokasi, {
            status: 'Verifikasi Kode QR Asli (GPS Browser Standar)',
            distance: 0,
            maxRadius: matchedLokasi.radiusMeter || 50,
            accuracy: null
          });
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      executePresensiPengampu(matchedLokasi, {
        status: 'Lokasi Standar (Verifikasi Barcode Valid)',
        distance: 0,
        maxRadius: 50,
        accuracy: null
      });
    }
  };

  // Mulai Kamera QR Scanner Asli
  const startCameraScanner = async () => {
    if (!selectedSesi || !currentSesiObj) {
      showToast && showToast('Silakan pilih sesi halaqah terlebih dahulu!');
      return;
    }
    setShowLiveCamera(true);
    setCameraError(null);

    setTimeout(() => {
      try {
        const scanner = new Html5Qrcode("interactive-camera-qr");
        html5QrCodeRef.current = scanner;

        scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            stopCameraScanner();
            handleProcessScannedCode(decodedText);
          },
          (errorMessage) => {
            // Abaikan frame scan kosong
          }
        ).catch((err) => {
          console.warn("Camera start error:", err);
          setCameraError("Tidak dapat mengakses kamera perangkat. Pastikan izin kamera telah diberikan di browser.");
        });
      } catch (e) {
        console.error("Scanner init error:", e);
        setCameraError("Gagal menginisialisasi pemindai kamera.");
      }
    }, 300);
  };

  // Hentikan Kamera Live Web
  const stopCameraScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        })
        .catch(() => {
          html5QrCodeRef.current = null;
        });
    }
    setShowLiveCamera(false);
    setCameraError(null);
  };

  // Tangani hasil potret langsung dari Kamera Asli Device (Kamera Bawaan Smartphone)
  const handleDeviceCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedSesi || !currentSesiObj) {
      showToast && showToast('Silakan pilih sesi halaqah terlebih dahulu!');
      if (e.target) e.target.value = '';
      return;
    }

    setIsProcessingDevicePhoto(true);
    setDeviceScanError(null);

    try {
      let decodedText = null;

      // 1. Coba BarcodeDetector bawaan device jika didukung hardware browser
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const bitmap = await createImageBitmap(file);
          const barcodes = await detector.detect(bitmap);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            decodedText = barcodes[0].rawValue;
          }
        } catch (detErr) {
          console.warn("BarcodeDetector fallback to Html5Qrcode:", detErr);
        }
      }

      // 2. Jika belum terdeteksi, gunakan Html5Qrcode.scanFile
      if (!decodedText) {
        let container = document.getElementById("hidden-device-qr-reader");
        if (!container) {
          container = document.createElement("div");
          container.id = "hidden-device-qr-reader";
          container.style.display = "none";
          document.body.appendChild(container);
        }

        const html5QrCode = new Html5Qrcode("hidden-device-qr-reader");
        try {
          decodedText = await html5QrCode.scanFile(file, /* showImage= */ false);
        } catch (scanErr) {
          console.warn("Html5Qrcode scanFile error:", scanErr);
        } finally {
          try {
            html5QrCode.clear();
          } catch (e) {}
        }
      }

      if (decodedText) {
        handleProcessScannedCode(decodedText);
      } else {
        const errMsg = "QR Code tidak terdeteksi dari foto kamera device. Pastikan posisi kamera tegak lurus dan stiker QR Code terlihat jelas dan fokus.";
        setDeviceScanError(errMsg);
        showToast && showToast(errMsg);
      }
    } catch (err) {
      console.error("Gagal memproses foto kamera device:", err);
      const errMsg = "Gagal memproses foto kamera device. Silakan coba potret kembali.";
      setDeviceScanError(errMsg);
      showToast && showToast(errMsg);
    } finally {
      setIsProcessingDevicePhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  const targetLokasi = lokasiList.find(l => l.id === selectedLokasiId) || lokasiList[0];

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out', paddingBottom: '120px' }}>
      
      {/* ─── STYLE RESPONSIVE KHUSUS MOBILE SCAN PRESENSI ─── */}
      <style>{`
        .scan-session-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .scan-sesi-card {
          padding: 14px 16px;
        }

        @media (max-width: 1023px) {
          .scan-session-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .scan-card-pad {
            padding: 16px !important;
          }
          .scan-sesi-card {
            padding: 10px 12px !important;
          }
        }
        @media (max-width: 640px) {
          .scan-session-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 1. HEADER HALAMAN: PRESENSI GURU PENGAMPU */}
      <div className="card scan-card-pad" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ 
                background: '#ecfdf5', 
                color: '#047857', 
                border: '1px solid #a7f3d0', 
                padding: '3px 10px', 
                borderRadius: '16px', 
                fontSize: '11px', 
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                PRESENSI KEHADIRAN PENGAMPU
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                • {todayIndo}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
              Scan Barcode / QR Ruangan Halaqah
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Profil Ustadz */}
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
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px'
              }}>
                {(currentPengampuNama || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>{currentPengampuNama}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{currentHalaqahNama} {currentPengampuNip && currentPengampuNip !== 'NON-NIP' ? `• NIP: ${currentPengampuNip}` : ''}</div>
              </div>
            </div>

            {/* Tombol Pintas ke Presensi Santri */}
            {setActiveTab && (
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('presensi-santri')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderColor: '#cbd5e1'
                }}
                title="Buka menu absensi kehadiran santri halaqah"
              >
                <Users size={15} />
                <span>Absensi Santri →</span>
              </button>
            )}
          </div>
        </div>

        {/* Notice Info Box */}
        <div style={{ 
          marginTop: '16px', 
          background: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '10px', 
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.82rem',
          color: '#166534'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="#16a34a" />
            <span>
              <strong>Pemberitahuan:</strong> Pemindai di halaman ini khusus untuk <strong>Presensi Kehadiran Pengampu</strong>. Presensi kehadiran santri bimbingan dicatat melalui menu <strong>Presensi Santri</strong>.
            </span>
          </div>
          {setActiveTab && (
            <button 
              onClick={() => setActiveTab('presensi-santri')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                fontWeight: 800,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.82rem'
              }}
            >
              Buka Presensi Santri
            </button>
          )}
        </div>
      </div>

      {/* 2. JADWAL SESI HARI INI (DIATUR DI SUPER ADMIN) DENGAN STATUS SUDAH / BELUM */}
      <div className="card scan-card-pad" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Jadwal Sesi Halaqah Hari Ini (Pengaturan Super Admin)
          </h3>
        </div>

        {/* Chips Sesi Interaktif */}
        <div className="scan-session-grid">
          {jadwalHalaqoh.sesiList.map(sesi => {
            const isMasukHariIni = jadwalHalaqoh?.hariAktif?.[todayIndo]?.[sesi.id] !== false;
            const isLibur = !isMasukHariIni || sesi.aktif === false;
            const presensi = storageService.isPengampuSudahScan(currentPengampuNama, sesi.id, todayISO);
            const isSudah = presensi.sudah;
            const isSelected = selectedSesi === sesi.nama;

            return (
              <div 
                key={sesi.id}
                className="scan-sesi-card"
                onClick={() => {
                  if (!isLibur) {
                    setSelectedSesi(prev => prev === sesi.nama ? null : sesi.nama);
                    setGpsWarning(null);
                  }
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: isSelected 
                    ? (isSudah ? '#f0fdf4' : '#fffbeb') 
                    : (isLibur ? '#f8fafc' : '#ffffff'),
                  border: isSelected 
                    ? `2px solid ${isSudah ? '#059669' : '#d97706'}` 
                    : `1.5px solid ${isSudah ? '#a7f3d0' : isLibur ? '#f1f5f9' : '#fed7aa'}`,
                  cursor: isLibur ? 'default' : 'pointer',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.18s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  {/* Badge Sudah / Belum / LIBUR */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: isLibur ? '#f1f5f9' : isSudah ? '#ecfdf5' : '#fef3c7',
                    color: isLibur ? '#64748b' : isSudah ? '#047857' : '#92400e',
                    border: `1px solid ${isLibur ? '#e2e8f0' : isSudah ? '#a7f3d0' : '#fde68a'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isLibur ? (
                      'LIBUR'
                    ) : isSudah ? (
                      <>
                        <Check size={12} strokeWidth={3} />
                        <span>Sudah</span>
                      </>
                    ) : (
                      <>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
                        <span>Belum</span>
                      </>
                    )}
                  </span>

                  {isSelected ? (
                    <span style={{ 
                      fontSize: '10px', 
                      background: '#047857', 
                      color: '#fff', 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>AKTIF DIPILIH</span>
                      <span style={{ fontSize: '9px', opacity: 0.85 }}>✕</span>
                    </span>
                  ) : !isLibur && (
                    <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
                      Klik untuk Scan →
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: isLibur ? '#94a3b8' : '#0f172a' }}>
                  {sesi.nama}
                </div>

                <div style={{ fontSize: '0.78rem', color: isLibur ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
                  {isSudah ? (
                    <span style={{ color: '#047857', fontWeight: 700 }}>
                      ✓ Scan: {presensi.jamScan} WIB ({presensi.keterangan || 'Tepat Waktu'})
                    </span>
                  ) : (
                    <span>Jam: {sesi.mulai} - {sesi.selesai} WIB</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PEMINDAI KAMERA BARCODE PENGAMPU (MUNCUL JIKA SESI DIKLIK, DISEMBUNYIKAN JIKA BELUM) */}
      {!selectedSesi ? (
        <div 
          className="card" 
          style={{ 
            padding: '28px 20px', 
            textAlign: 'center', 
            background: '#f8fafc', 
            border: '1.5px dashed #cbd5e1', 
            borderRadius: '16px', 
            maxWidth: '720px', 
            margin: '0 auto 24px auto' 
          }}
        >
          <div style={{ 
            width: '52px', 
            height: '52px', 
            borderRadius: '50%', 
            background: '#ecfdf5', 
            color: '#047857', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 12px auto' 
          }}>
            <Camera size={26} />
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Pemindai Kamera Sedang Disembunyikan
          </h4>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', maxWidth: '460px', margin: '0 auto' }}>
            Silakan <strong>klik salah satu kartu Sesi Halaqah</strong> di atas untuk memunculkan pemindai kamera barcode presensi Anda.
          </p>
        </div>
      ) : (
        <div 
          className="card scan-card-pad" 
          style={{ 
            maxWidth: '720px', 
            margin: '0 auto 24px auto', 
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            borderRadius: '16px',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Header Pemindai & Tombol Sembunyikan */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Pemindai Kamera Barcode Pengampu
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Arahkan kamera smartphone ke stiker Barcode / QR Ruangan Halaqah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSesi(null)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Sembunyikan pemindai kamera"
            >
              <X size={14} />
              <span>Sembunyikan</span>
            </button>
          </div>

          {/* Sesi Terpilih Banner */}
          <div style={{
            background: currentSesiStatus.sudah ? '#ecfdf5' : '#fffbeb',
            border: `1.5px solid ${currentSesiStatus.sudah ? '#a7f3d0' : '#fde68a'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: currentSesiStatus.sudah ? '#047857' : '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>
                SESI PRESENSI AKTIF:
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedSesi} ({currentSesiObj?.mulai || '05:00'} - {currentSesiObj?.selesai || '06:30'} WIB)
              </div>
            </div>
            <span style={{
              padding: '4px 12px',
              borderRadius: '14px',
              fontSize: '11px',
              fontWeight: 800,
              background: currentSesiStatus.sudah ? '#059669' : '#f59e0b',
              color: '#ffffff'
            }}>
              {currentSesiStatus.sudah ? '✓ Sudah Scan' : '○ Belum Scan'}
            </span>
          </div>

          {/* Info Banner: Pengampu dapat scan di semua QR resmi Super Admin */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            fontSize: '0.82rem',
            color: '#166534',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0 }} />
            <span>
              Pengampu dapat melakukan scan di <strong>semua stiker QR Code resmi</strong> yang telah ditempel Super Admin di meja atau dinding ruangan halaqah.
            </span>
          </div>

          {/* Input Hidden untuk Memicu Kamera Asli Device (Kamera Bawaan HP) */}
          <input
            ref={deviceCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleDeviceCameraCapture}
          />
          <div id="hidden-device-qr-reader" style={{ display: 'none' }}></div>

          {/* Tombol Utama: Scan Menggunakan Kamera Device (Kamera Bawaan HP) */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!selectedSesi || !currentSesiObj) {
                showToast && showToast('Silakan pilih sesi halaqah terlebih dahulu!');
                return;
              }
              if (deviceCameraInputRef.current) {
                deviceCameraInputRef.current.click();
              }
            }}
            disabled={isProcessingDevicePhoto || isScanningPengampu}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '1.02rem',
              fontWeight: 800,
              background: isProcessingDevicePhoto ? '#059669' : '#047857',
              borderColor: '#047857',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(4, 120, 87, 0.28)',
              marginBottom: '8px',
              cursor: isProcessingDevicePhoto ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isProcessingDevicePhoto ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2.5px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></div>
                <span>Memproses Scan Kamera Device...</span>
              </>
            ) : (
              <>
                <Camera size={24} />
                <span>Buka Kamera Device (Kamera HP)</span>
              </>
            )}
          </button>

          <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
            📱 Membuka langsung aplikasi kamera asli HP untuk memotret & memindai stiker QR ruangan halaqah.
          </p>

          {/* Alert jika gagal membaca foto */}
          {deviceScanError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{deviceScanError}</span>
            </div>
          )}

          {/* Opsi Tambahan untuk Komputer / Laptop: Live Camera Scanner */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={startCameraScanner}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#047857',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Atau gunakan Pemindai Langsung (Webcam Laptop)</span>
            </button>
          </div>

          {/* Pilihan Ruangan & Tombol Scan Cepat (Simulasi Tanpa Kamera) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
            marginTop: '8px'
          }}>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} color="#059669" />
              <span>Simulasi Scan Lokasi (Tanpa Kamera Fisik):</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={selectedLokasiId}
                onChange={(e) => {
                  setSelectedLokasiId(e.target.value);
                  setGpsWarning(null);
                }}
                style={{ flex: 1, fontSize: '12px', fontWeight: 700 }}
              >
                {lokasiList.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.kelas} ({l.kodeManual}) — {l.lokasi || ''}
                  </option>
                ))}
              </select>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  const target = lokasiList.find(l => l.id === selectedLokasiId) || lokasiList[0];
                  handleProcessScannedCode(target.kodeManual);
                }}
                disabled={isScanningPengampu}
                style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 700 }}
                title="Konfirmasi scan kehadiran pengampu di lokasi ini"
              >
                <Zap size={14} />
                <span>Scan Cepat</span>
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={12} color="#059669" />
              <span>Titik GPS: <strong>{targetLokasi?.lat}, {targetLokasi?.lng}</strong> • Radius Maks: <strong>{targetLokasi?.radiusMeter || 50}m</strong></span>
            </div>
          </div>

          {/* Feedback Hasil Presensi Pengampu */}
          {pengampuScanned && (
            <div style={{
              marginTop: '16px',
              background: '#f0fdf4',
              border: '1.5px solid #10b981',
              borderRadius: '12px',
              padding: '14px 16px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                    KEHADIRAN PENGAMPU TERKONFIRMASI!
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#064e3b' }}>
                    {pengampuScanned.nama}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                <div>Sesi: <strong>{pengampuScanned.sesi}</strong> • Scan: <strong>{pengampuScanned.jamScan} WIB</strong></div>
                <div>Lokasi: <strong>{pengampuScanned.lokasi}</strong></div>
                <div>Kode Barcode: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857' }}>{pengampuScanned.kodeQR}</span></div>
                <div style={{ color: '#059669', fontWeight: 700, marginTop: '3px' }}>
                  ✓ Status: {pengampuScanned.keterangan}
                </div>
              </div>
            </div>
          )}

          {/* GPS Warning Modal / Box */}
          {gpsWarning && (
            <div style={{
              marginTop: '16px',
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#92400e' }}>
                    Di Luar Radius GPS Ruangan!
                  </strong>
                  <p style={{ margin: '3px 0 8px 0', fontSize: '12px', color: '#78350f' }}>
                    Jarak terdeteksi: <strong>{gpsWarning.distance} meter</strong> (Batas: {gpsWarning.maxRadius}m).
                  </p>
                  <button
                    onClick={() => executePresensiPengampu(gpsWarning.targetLokasi, {
                      status: 'Disetujui di Titik Ruangan (Simulasi)',
                      distance: 5,
                      maxRadius: gpsWarning.maxRadius,
                      accuracy: 10
                    })}
                    style={{
                      background: '#059669',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Konfirmasi Sesuai Titik Ruangan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. REKAP RIWAYAT PRESENSI PENGAMPU HARI INI */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Rekap Presensi Pengampu Hari Ini ({todayIndo}, {todayISO})
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Daftar sesi yang sudah dikonfirmasi kehadirannya oleh Ustadz Wahyudin Hafiz
            </p>
          </div>

          <span style={{ 
            background: '#ecfdf5', 
            color: '#047857', 
            padding: '4px 10px', 
            borderRadius: '12px', 
            fontSize: '11.5px', 
            fontWeight: 800 
          }}>
            {todayPengampuRecords.length} Sesi Terkonfirmasi Hadir
          </span>
        </div>

        <div className="table-responsive">
          <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Sesi Halaqah</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Waktu Sesi</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Status Kehadiran</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Waktu Scan Pengampu</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Lokasi / Barcode Ruangan</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {jadwalHalaqoh.sesiList.map(sesi => {
                const isMasukHariIni = jadwalHalaqoh?.hariAktif?.[todayIndo]?.[sesi.id] !== false;
                const isLibur = !isMasukHariIni || sesi.aktif === false;
                const presensi = storageService.isPengampuSudahScan(currentPengampuNama, sesi.id, todayISO);

                return (
                  <tr key={sesi.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                      {sesi.nama}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {sesi.mulai} - {sesi.selesai} WIB
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        background: isLibur ? '#f1f5f9' : presensi.sudah ? '#ecfdf5' : '#fef3c7',
                        color: isLibur ? '#64748b' : presensi.sudah ? '#047857' : '#92400e',
                        border: `1px solid ${isLibur ? '#e2e8f0' : presensi.sudah ? '#a7f3d0' : '#fde68a'}`
                      }}>
                        {isLibur ? 'LIBUR' : presensi.sudah ? '✓ Sudah' : '○ Belum'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: presensi.sudah ? '#047857' : '#94a3b8' }}>
                      {presensi.sudah ? `${presensi.jamScan} WIB` : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      {presensi.sudah ? (
                        <span>{presensi.lokasi || 'Ruang Kelas Halaqah'}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Belum memindai barcode</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {presensi.sudah ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>
                          {presensi.keterangan || 'Tepat Waktu'}
                        </span>
                      ) : isLibur ? (
                        <span style={{ color: '#94a3b8' }}>Jadwal Libur</span>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedSesi(sesi.nama);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          Scan Sesi Ini
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL KAMERA PEMINDAI QR ASLI (HTML5-QRCODE)               */}
      {/* ========================================================= */}
      {showLiveCamera && (
        <div className="modal-overlay" onClick={stopCameraScanner}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '480px', padding: 0, borderRadius: '20px', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              background: '#047857',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="#a7f3d0" />
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                  Pindai Barcode Ruangan: {selectedSesi}
                </span>
              </div>
              <button 
                onClick={stopCameraScanner}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#475569' }}>
                Arahkan kamera smartphone ke <strong>Barcode / QR Code Ruangan</strong> yang disediakan Super Admin:
              </p>

              {/* Viewport Scanner Html5Qrcode */}
              <div 
                id="interactive-camera-qr" 
                style={{ 
                  width: '100%', 
                  minHeight: '280px', 
                  borderRadius: '14px', 
                  overflow: 'hidden', 
                  background: '#0f172a',
                  border: '2px dashed #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {cameraError && (
                  <div style={{ padding: '20px', color: '#f87171', fontSize: '0.85rem' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    {cameraError}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={stopCameraScanner}
                  style={{ borderRadius: '8px' }}
                >
                  Tutup Kamera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
