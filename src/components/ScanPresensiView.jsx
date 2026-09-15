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
  Info,
  Smartphone
} from 'lucide-react';
import { storageService } from '../services/storage';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import CustomSelect from './common/CustomSelect';

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
  const selectedSesiRef = useRef(defaultSesi);
  useEffect(() => {
    selectedSesiRef.current = selectedSesi;
  }, [selectedSesi]);

  // Deteksi Perangkat Mobile Smartphone / Tablet
  const isMobileDevice = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
    (navigator.maxTouchPoints > 0 && window.innerWidth <= 768)
  );

  // Preferensi Mode Pemindai Kamera ('device': Kamera Asli HP, 'live': Kamera Langsung Web)
  const [cameraMode, setCameraMode] = useState(() => {
    try {
      const saved = sessionStorage.getItem('simtah_scan_camera_mode');
      if (saved === 'live' || saved === 'device') return saved;
    } catch (e) {}
    // Default: di smartphone gunakan kamera bawaan HP agar langsung terbuka tanpa hambatan
    return isMobileDevice ? 'device' : 'live';
  });

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
  const executePresensiPengampu = (targetLokasi, gpsDetail, customSesi) => {
    const sesiNamaToUse = customSesi || selectedSesiRef.current || selectedSesi;
    const sesiObjToUse = jadwalHalaqoh.sesiList.find(s => s.nama === sesiNamaToUse) || currentSesiObj;

    if (!sesiNamaToUse || !sesiObjToUse) {
      showToast && showToast('Pilih salah satu sesi halaqah terlebih dahulu!');
      return;
    }
    setIsScanningPengampu(true);
    const res = storageService.scanPresensiPengampu(
      currentPengampuNama, 
      targetLokasi, 
      sesiNamaToUse, 
      sesiObjToUse?.id
    );
    setIsScanningPengampu(false);
    setGpsWarning(null);

    setPengampuScanned({
      nama: currentPengampuNama,
      lokasi: `${targetLokasi.kelas} - ${targetLokasi.lokasi || ''}`,
      kodeQR: targetLokasi.kodeManual,
      jamScan: res.jamScan,
      status: res.status,
      sesi: sesiNamaToUse,
      keterangan: res.keterangan || 'Tepat Waktu',
      gpsDetail
    });

    try {
      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
    } catch (e) {}

    showToast && showToast(`✓ Presensi Kehadiran ${sesiNamaToUse} Berhasil (Pukul ${res.jamScan} WIB)!`);
    setRefreshTrigger(prev => prev + 1);
    onReload && onReload();
  };

  // Proses Validasi Kode QR yang discan
  const handleProcessScannedCode = (scannedCode, customSesi) => {
    const sesiNamaToUse = customSesi || selectedSesiRef.current || selectedSesi;
    const sesiObjToUse = jadwalHalaqoh.sesiList.find(s => s.nama === sesiNamaToUse) || currentSesiObj;

    if (!sesiNamaToUse || !sesiObjToUse) {
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
              userAcc,
              sesiNama: sesiNamaToUse
            });
            showToast && showToast(`Perhatian: Posisi GPS berjarak ${distance}m dari titik ruangan!`);
          } else {
            executePresensiPengampu(matchedLokasi, {
              status: `Terverifikasi Sesuai Radius (${distance}m)`,
              distance,
              maxRadius,
              accuracy: userAcc
            }, sesiNamaToUse);
          }
        },
        (err) => {
          console.warn("GPS Scan warning:", err);
          executePresensiPengampu(matchedLokasi, {
            status: 'Verifikasi Kode QR Asli (GPS Browser Standar)',
            distance: 0,
            maxRadius: matchedLokasi.radiusMeter || 50,
            accuracy: null
          }, sesiNamaToUse);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      executePresensiPengampu(matchedLokasi, {
        status: 'Lokasi Standar (Verifikasi Barcode Valid)',
        distance: 0,
        maxRadius: 50,
        accuracy: null
      }, sesiNamaToUse);
    }
  };

  // Pemicu Buka Kamera Bawaan HP / Perangkat Langsung
  const openDeviceCamera = (targetSesiNama) => {
    const sesiNamaToUse = targetSesiNama || selectedSesiRef.current || selectedSesi;
    if (sesiNamaToUse) {
      setSelectedSesi(sesiNamaToUse);
      selectedSesiRef.current = sesiNamaToUse;
    }
    setDeviceScanError(null);
    if (deviceCameraInputRef.current) {
      deviceCameraInputRef.current.value = '';
      deviceCameraInputRef.current.click();
    }
  };

  // Mulai Kamera QR Scanner Asli (Live)
  const startCameraScanner = async (targetSesiNama) => {
    const sesiNamaToUse = targetSesiNama || selectedSesiRef.current || selectedSesi;
    const sesiObjToUse = jadwalHalaqoh.sesiList.find(s => s.nama === sesiNamaToUse);
    if (!sesiNamaToUse || !sesiObjToUse) {
      showToast && showToast('Silakan pilih sesi halaqah terlebih dahulu!');
      return;
    }
    setSelectedSesi(sesiNamaToUse);
    selectedSesiRef.current = sesiNamaToUse;
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
            handleProcessScannedCode(decodedText, sesiNamaToUse);
          },
          (errorMessage) => {
            // Abaikan frame scan kosong
          }
        ).catch((err) => {
          console.warn("Camera start error:", err);
          setCameraError("Tidak dapat mengakses kamera live. Pastikan izin kamera telah diberikan di browser, atau gunakan Kamera HP Bawaan.");
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

  // Tangani saat sesi presensi ditekan -> Langsung buka kamera perangkat
  const handleSessionClick = (sesi) => {
    const sesiNama = sesi.nama;
    setSelectedSesi(sesiNama);
    selectedSesiRef.current = sesiNama;
    setGpsWarning(null);
    setDeviceScanError(null);

    // Langsung buka kamera perangkat sesuai preferensi aktif
    if (cameraMode === 'device') {
      openDeviceCamera(sesiNama);
    } else {
      startCameraScanner(sesiNama);
    }
  };

  // Tangani hasil potret langsung dari Kamera Asli Device (Kamera Bawaan Smartphone)
  const handleDeviceCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sesiNamaToUse = selectedSesiRef.current || selectedSesi;
    const sesiObjToUse = jadwalHalaqoh.sesiList.find(s => s.nama === sesiNamaToUse) || currentSesiObj;

    if (!sesiNamaToUse || !sesiObjToUse) {
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
        handleProcessScannedCode(decodedText, sesiNamaToUse);
      } else {
        const errMsg = "QR Code tidak terdeteksi dari foto kamera perangkat. Pastikan posisi kamera tegak lurus dan stiker QR Code terlihat jelas dan fokus.";
        setDeviceScanError(errMsg);
        showToast && showToast(errMsg);
      }
    } catch (err) {
      console.error("Gagal memproses foto kamera perangkat:", err);
      const errMsg = "Gagal memproses foto kamera perangkat. Silakan coba potret kembali.";
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
      
      {/* Input Hidden untuk Memicu Kamera Asli Device (Kamera Bawaan HP) - Selalu ter-mount agar siap dipicu langsung saat klik sesi */}
      <input
        ref={deviceCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleDeviceCameraCapture}
      />
      <div id="hidden-device-qr-reader" style={{ display: 'none' }}></div>

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

      {/* 1. JADWAL SESI HARI INI (SATU BARIS PERSIS SEPERTI DASHBOARD/HOME) */}
      <div className="sesi-card-container" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div className="sesi-header-title">Jadwal Sesi Hari Ini</div>
            <div className="sesi-header-sub">Tekan sesi untuk <strong>langsung membuka kamera</strong> presensi QR</div>
          </div>

          {/* Pengalih Cepat Mode Kamera Perangkat */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            borderRadius: '20px',
            padding: '3px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => {
                setCameraMode('device');
                try { sessionStorage.setItem('simtah_scan_camera_mode', 'device'); } catch (e) {}
                showToast && showToast('Mode aktif: Kamera Bawaan HP (Membuka Kamera Perangkat Saat Sesi Ditekan)');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '11px',
                fontWeight: cameraMode === 'device' ? 800 : 600,
                background: cameraMode === 'device' ? '#059669' : 'transparent',
                color: cameraMode === 'device' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              title="Saat sesi ditekan, langsung membuka aplikasi kamera perangkat HP"
            >
              <Smartphone size={13} />
              <span>Kamera HP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCameraMode('live');
                try { sessionStorage.setItem('simtah_scan_camera_mode', 'live'); } catch (e) {}
                showToast && showToast('Mode aktif: Pemindai Langsung (Live Auto-Scan Di Layar)');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '11px',
                fontWeight: cameraMode === 'live' ? 800 : 600,
                background: cameraMode === 'live' ? '#059669' : 'transparent',
                color: cameraMode === 'live' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              title="Saat sesi ditekan, langsung membuka pemindai kamera live di layar"
            >
              <Camera size={13} />
              <span>Live Scan</span>
            </button>
          </div>
        </div>

        <div className="sesi-chips-row">
          {jadwalHalaqoh.sesiList.map(sesi => {
            const presensi = storageService.isPengampuSudahScan(currentPengampuNama, sesi.id, todayISO);
            const isSudah = presensi.sudah;
            const isMasukHariIni = jadwalHalaqoh?.hariAktif?.[todayIndo]?.[sesi.id] !== false;
            const isLibur = !isSudah && (!isMasukHariIni || sesi.aktif === false);
            const isSelected = selectedSesi === sesi.nama;

            return (
              <div 
                key={sesi.id} 
                className={`sesi-chip ${isLibur ? 'libur-pink' : isSudah ? 'active-green' : 'belum-amber'} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSessionClick(sesi)}
                style={{ 
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #059669' : undefined,
                  boxShadow: isSelected ? '0 0 0 3px rgba(5, 150, 105, 0.2)' : undefined
                }}
                title={isSudah ? `Sudah scan: ${presensi.jamScan} WIB (${presensi.keterangan || 'Tepat Waktu'}). Tekan untuk buka kamera scan ulang.` : isLibur ? 'Jadwal Libur. Tekan untuk buka kamera presensi.' : 'Tekan untuk langsung membuka kamera presensi QR!'}
              >
                <span className={`sesi-badge-status ${isLibur ? 'pink' : isSudah ? 'green' : 'amber'}`}>
                  {isLibur ? 'LIBUR' : isSudah ? '✓ Sudah' : '○ Belum'}
                </span>
                <div className="sesi-name">{sesi.nama}</div>
                <div className="sesi-sub-info">
                  {isSudah 
                    ? `${presensi.jamScan} WIB` 
                    : `${sesi.mulai} - ${sesi.selesai}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PEMINDAI KAMERA BARCODE PENGAMPU (HANYA MUNCUL KETIKA SESI DIKLIK) */}
      {selectedSesi && (
        <div 
          className="card scan-card-pad" 
          style={{ 
            maxWidth: '720px', 
            margin: '0 auto 20px auto', 
            padding: '20px',
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

          {/* Tombol Utama Pemindai Kamera */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openDeviceCamera(selectedSesi)}
              disabled={isProcessingDevicePhoto || isScanningPengampu}
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '0.96rem',
                fontWeight: 800,
                background: isProcessingDevicePhoto ? '#059669' : '#047857',
                borderColor: '#047857',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 16px rgba(4, 120, 87, 0.28)',
                cursor: isProcessingDevicePhoto ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessingDevicePhoto ? (
                <>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  <span>Memproses Foto HP...</span>
                </>
              ) : (
                <>
                  <Smartphone size={22} />
                  <span>Buka Kamera Device (HP)</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => startCameraScanner(selectedSesi)}
              disabled={isProcessingDevicePhoto || isScanningPengampu}
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '0.96rem',
                fontWeight: 800,
                background: '#ecfdf5',
                color: '#065f46',
                border: '1.5px solid #a7f3d0',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Camera size={22} color="#059669" />
              <span>Buka Kamera Langsung (Live)</span>
            </button>
          </div>

          <p style={{ margin: '0 0 14px 0', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
            📱 Tekan tombol di atas untuk membuka aplikasi kamera perangkat atau pemindai langsung QR halaqah.
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
              <CustomSelect
                value={selectedLokasiId}
                onChange={(e) => {
                  setSelectedLokasiId(e.target.value);
                  setGpsWarning(null);
                }}
                style={{ flex: 1, minWidth: '220px' }}
                triggerStyle={{ minHeight: '38px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}
              >
                {lokasiList.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.kelas} ({l.kodeManual}) — {l.lokasi || ''}
                  </option>
                ))}
              </CustomSelect>

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

      {/* 3. REKAP STATUS PRESENSI REAL HARI INI (SEDERHANA & RESPONSIF) */}
      <div className="card scan-card-pad" style={{ padding: '16px 18px', borderRadius: '16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Status Presensi Pengampu Hari Ini
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
              {todayIndo}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <span style={{ 
            background: '#ecfdf5', 
            color: '#047857', 
            padding: '3px 10px', 
            borderRadius: '12px', 
            fontSize: '0.74rem', 
            fontWeight: 800 
          }}>
            {todayPengampuRecords.length} Sesi Hadir
          </span>
        </div>

        {/* List Presensi Sederhana & Responsif (Gambar 4) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jadwalHalaqoh.sesiList.map(sesi => {
            const presensi = storageService.isPengampuSudahScan(currentPengampuNama, sesi.id, todayISO);
            const isSudah = presensi.sudah;
            const isMasukHariIni = jadwalHalaqoh?.hariAktif?.[todayIndo]?.[sesi.id] !== false;
            const isLibur = !isSudah && (!isMasukHariIni || sesi.aktif === false);

            // Tentukan status real (contoh: Hadir Tepat Waktu, Telat 10 Menit, Belum Absen, Libur)
            let badgeBg = '#fef3c7';
            let badgeColor = '#92400e';
            let badgeBorder = '#fde68a';
            let badgeText = 'Belum Absen';
            let subText = `Jadwal: ${sesi.mulai} - ${sesi.selesai} WIB`;
            let iconType = 'belum';

            if (isLibur) {
              badgeBg = '#f1f5f9';
              badgeColor = '#64748b';
              badgeBorder = '#e2e8f0';
              badgeText = 'Libur';
              subText = `${sesi.mulai} - ${sesi.selesai} • Jadwal Libur`;
              iconType = 'libur';
            } else if (isSudah) {
              const ket = presensi.keterangan || 'Tepat Waktu';
              const isLate = ket.toLowerCase().includes('telat');
              if (isLate) {
                badgeBg = '#fff7ed';
                badgeColor = '#c2410c';
                badgeBorder = '#fed7aa';
                badgeText = ket; // Contoh: "Telat 10 Menit"
                iconType = 'telat';
              } else {
                badgeBg = '#ecfdf5';
                badgeColor = '#047857';
                badgeBorder = '#a7f3d0';
                badgeText = 'Hadir Tepat Waktu';
                iconType = 'hadir';
              }
              subText = `Scan: ${presensi.jamScan} WIB • ${presensi.lokasi || 'Lokal Ikhwan (X A)'}`;
            }

            return (
              <div 
                key={sesi.id}
                className="scan-presensi-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isSudah ? (iconType === 'telat' ? '#fffdfa' : '#f0fdf4') : isLibur ? '#f8fafc' : '#ffffff',
                  border: `1px solid ${isSudah ? (iconType === 'telat' ? '#fed7aa' : '#bbf7d0') : '#e2e8f0'}`,
                  gap: '10px'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      {sesi.nama}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      ({sesi.mulai} - {sesi.selesai})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isSudah ? (iconType === 'telat' ? '#c2410c' : '#047857') : '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {subText}
                  </div>
                </div>

                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: badgeBg,
                    color: badgeColor,
                    border: `1px solid ${badgeBorder}`,
                    whiteSpace: 'nowrap'
                  }}>
                    {iconType === 'hadir' && <Check size={11} strokeWidth={3} />}
                    {iconType === 'telat' && <Clock size={11} />}
                    <span>{badgeText}</span>
                  </span>

                  {!isSudah && (
                    <button
                      type="button"
                      onClick={() => handleSessionClick(sesi)}
                      style={{
                        display: 'block',
                        background: 'transparent',
                        border: 'none',
                        color: '#059669',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '2px',
                        padding: 0,
                        marginLeft: 'auto'
                      }}
                    >
                      Scan Sesi Ini →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
                    <p style={{ margin: '0 0 12px 0' }}>{cameraError}</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        stopCameraScanner();
                        openDeviceCamera(selectedSesi);
                      }}
                      style={{ background: '#059669', borderColor: '#059669', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Smartphone size={15} />
                      <span>Buka Kamera Bawaan HP Sekarang</span>
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm" 
                  onClick={() => {
                    stopCameraScanner();
                    openDeviceCamera(selectedSesi);
                  }}
                  style={{ borderRadius: '8px', background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Smartphone size={15} />
                  <span>Gunakan Kamera Bawaan HP</span>
                </button>
                <button 
                  type="button"
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
