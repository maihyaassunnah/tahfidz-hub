import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Sparkles, 
  Check, 
  MapPin, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Building2, 
  Zap, 
  RefreshCw,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { storageService } from '../services/storage';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import CustomSelect from './common/CustomSelect';

// Audio feedback beeps menggunakan Web Audio API
function playScanBeep(isSuccess = true) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (isSuccess) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
      osc.frequency.exponentialRampToValueAtTime(1174, ctx.currentTime + 0.12); // D6
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn('Audio chime unsupported:', e);
  }
}

// Formula Haversine untuk menghitung jarak GPS dalam satuan Meter
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

  // Ambil sesi terpilih dari sessionStorage (jika diklik dari dashboard)
  const defaultSesi = (() => {
    try {
      const stored = sessionStorage.getItem('simtah_selected_scan_sesi');
      if (stored) {
        sessionStorage.removeItem('simtah_selected_scan_sesi');
        const found = jadwalHalaqoh.sesiList.find(s => s.nama === stored || s.id === stored);
        if (found) return found.nama;
      }
    } catch (e) {}
    return null;
  })();

  const [selectedSesi, setSelectedSesi] = useState(defaultSesi);
  const selectedSesiRef = useRef(defaultSesi);
  useEffect(() => {
    selectedSesiRef.current = selectedSesi;
  }, [selectedSesi]);

  const [selectedLokasiId, setSelectedLokasiId] = useState(lokasiList[0]?.id || 'l-1789434655796');
  const [isScanningPengampu, setIsScanningPengampu] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State untuk Live Camera QR Scanner (html5-qrcode webcam)
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const html5QrCodeRef = useRef(null);

  // State Pop-up Hasil Presensi (Sukses, Gagal, Peringatan)
  const [scanPopup, setScanPopup] = useState({
    isOpen: false,
    status: 'success', // 'success' | 'error' | 'warning'
    title: '',
    subtitle: '',
    rawCode: '',
    details: null
  });

  // Deteksi Hari & Tanggal Hari Ini
  const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayIndo = dayNames[new Date().getDay()];
  const todayISO = storageService.getTodayISO ? storageService.getTodayISO() : new Date().toISOString().split('T')[0];

  // Cari sesi yang dipilih
  const currentSesiObj = selectedSesi ? (jadwalHalaqoh.sesiList.find(s => s.nama === selectedSesi) || null) : null;

  // Daftar presensi pengampu hari ini
  const todayPengampuRecords = storageService.getPengampuPresensiList().filter(p => {
    const pTgl = p.tanggal ? String(p.tanggal).split('T')[0] : '';
    if (pTgl && pTgl !== todayISO) return false;
    const cleanPGuru = storageService._cleanName(p.namaGuru || p.nama);
    const cleanMy = storageService._cleanName(currentPengampuNama);
    return (cleanPGuru && cleanMy && (cleanPGuru === cleanMy || cleanPGuru.includes(cleanMy) || cleanMy.includes(cleanPGuru))) || 
           (p.pengampuId && currentAuth?.id && p.pengampuId === currentAuth.id);
  });

  // Otomatis buka kamera live jika sesi dikirimkan dari Dashboard
  useEffect(() => {
    if (defaultSesi) {
      startCameraScanner(defaultSesi);
    }
  }, []);

  // Bersihkan pemindai kamera saat komponen unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop();
          }
          html5QrCodeRef.current.clear();
        } catch (e) {}
      }
    };
  }, []);

  // Hentikan Kamera Live Web
  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
      html5QrCodeRef.current = null;
    }
    setShowLiveCamera(false);
    setCameraLoading(false);
    setCameraError(null);
  };

  // Mulai Kamera QR Scanner Asli (Live Streaming)
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
    setCameraLoading(true);
    setCameraError(null);

    // Hentikan pemindai aktif sebelumnya jika ada
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }

    // Berikan jeda sejenak agar modal & elemen DOM ter-render
    setTimeout(async () => {
      try {
        const domElement = document.getElementById("reader-live-camera");
        if (!domElement) {
          setCameraLoading(false);
          setCameraError("Wadah kamera belum siap. Coba buka kembali.");
          return;
        }

        const scanner = new Html5Qrcode("reader-live-camera");
        html5QrCodeRef.current = scanner;

        // 1. Ambil daftar kamera perangkat secara langsung
        let cameras = [];
        try {
          cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            setAvailableCameras(cameras);
          }
        } catch (camErr) {
          console.warn("Could not enumerate cameras via getCameras, will fallback:", camErr);
        }

        const qrConfig = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(160, Math.min(Math.floor(minEdge * 0.75), 260));
            return { width: size, height: size };
          }
          // Tidak menggunakan aspectRatio kaku agar tidak OverconstrainedError di laptop / smartphone!
        };

        const onScanSuccessCallback = async (decodedText) => {
          await stopCameraScanner();
          handleProcessScannedCode(decodedText, sesiNamaToUse);
        };

        let started = false;

        // STRATEGI 1: Gunakan Device ID Kamera Terdaftar (Paling stabil & cocok untuk laptop & HP)
        if (cameras && cameras.length > 0) {
          // Cari kamera belakang di smartphone jika ada kata 'back', 'rear', 'environment'
          const backCam = cameras.find(c => {
            const lbl = (c.label || '').toLowerCase();
            return lbl.includes('back') || lbl.includes('rear') || lbl.includes('belakang') || lbl.includes('environment');
          });
          const candidates = backCam
            ? [backCam, ...cameras.filter(c => c.id !== backCam.id)]
            : cameras;

          for (const cam of candidates) {
            try {
              await scanner.start(
                cam.id,
                qrConfig,
                onScanSuccessCallback,
                () => {}
              );
              started = true;
              setCameraLoading(false);
              break;
            } catch (eDevice) {
              console.warn("Start dengan target camera ID gagal:", cam.id, eDevice);
            }
          }
        }

        // STRATEGI 2: Fallback ke string "environment" (Kamera Belakang Smartphone)
        if (!started) {
          try {
            await scanner.start(
              { facingMode: "environment" },
              qrConfig,
              onScanSuccessCallback,
              () => {}
            );
            started = true;
            setCameraLoading(false);
          } catch (errEnv) {
            console.warn("Kamera environment gagal, mencoba kamera user/depan:", errEnv);
          }
        }

        // STRATEGI 3: Fallback ke string "user" (Kamera Depan / Webcam Laptop)
        if (!started) {
          try {
            await scanner.start(
              { facingMode: "user" },
              qrConfig,
              onScanSuccessCallback,
              () => {}
            );
            started = true;
            setCameraLoading(false);
          } catch (errUser) {
            console.warn("Semua opsi kamera gagal:", errUser);
          }
        }

        // JIKA SEMUA STRATEGI GAGAL -> TAMPILKAN POPUP GAGAL
        if (!started) {
          setCameraLoading(false);
          setCameraError("Kamera tidak dapat diakses.");
          setScanPopup({
            isOpen: true,
            status: 'error',
            title: 'Kamera Tidak Dapat Dibuka',
            subtitle: 'Kamera sedang dipakai aplikasi lain atau belum terhubung.',
            rawCode: '',
            details: {
              alasan: 'Browser tidak dapat mengambil gambar langsung dari perangkat kamera Anda.',
              panduan: 'Pastikan izin kamera di browser sudah disetujui (klik ikon gembok/setelan di URL). Jika di PC/Laptop tanpa webcam, gunakan opsi Konfirmasi Presensi Ruangan di bawah.'
            }
          });
        }
      } catch (errInit) {
        console.error("Scanner init error:", errInit);
        setCameraLoading(false);
        setCameraError("Gagal menginisialisasi kamera.");
      }
    }, 200);
  };

  // Ganti kamera depan / belakang jika tersedia
  const handleSwitchCamera = async () => {
    if (availableCameras.length <= 1 || !html5QrCodeRef.current) return;
    const nextIdx = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIdx);
    const nextCam = availableCameras[nextIdx];

    try {
      setCameraLoading(true);
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      const qrConfig = {
        fps: 15,
        qrbox: (w, h) => ({ width: Math.min(w * 0.75, 250), height: Math.min(w * 0.75, 250) })
      };
      await html5QrCodeRef.current.start(
        nextCam.id,
        qrConfig,
        async (decodedText) => {
          await stopCameraScanner();
          handleProcessScannedCode(decodedText, selectedSesiRef.current || selectedSesi);
        },
        () => {}
      );
      setCameraLoading(false);
    } catch (e) {
      console.warn("Gagal switch kamera:", e);
      setCameraLoading(false);
    }
  };

  // Tangani saat sesi presensi ditekan -> LANGSUNG BUKA KAMERA LIVE
  const handleSessionClick = (sesi) => {
    const sesiNama = typeof sesi === 'string' ? sesi : sesi.nama;
    setSelectedSesi(sesiNama);
    selectedSesiRef.current = sesiNama;
    startCameraScanner(sesiNama);
  };

  // Eksekusi Simpan Presensi Pengampu & Buka Pop-up Sukses
  const executePresensiPengampu = (targetLokasi, gpsDetail, customSesi) => {
    const sesiNamaToUse = customSesi || selectedSesiRef.current || selectedSesi;
    const sesiObjToUse = jadwalHalaqoh.sesiList.find(s => s.nama === sesiNamaToUse) || currentSesiObj;

    setIsScanningPengampu(true);
    const res = storageService.scanPresensiPengampu(
      currentPengampuNama, 
      targetLokasi, 
      sesiNamaToUse, 
      sesiObjToUse?.id
    );
    setIsScanningPengampu(false);

    try {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      playScanBeep(true);
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    // BUKA POP-UP SUKSES DENGAN KETERANGAN LENGKAP
    setScanPopup({
      isOpen: true,
      status: 'success',
      title: 'Alhamdulillah, Presensi Berhasil!',
      subtitle: `Kehadiran Sesi ${sesiNamaToUse} Telah Terkonfirmasi Resmi`,
      rawCode: targetLokasi.kodeManual,
      details: {
        nama: currentPengampuNama,
        sesi: sesiNamaToUse,
        jamScan: res.jamScan,
        status: res.status, // 'Tepat Waktu' | 'Terlambat'
        keterangan: res.keterangan || 'Tepat Waktu',
        lokasi: `${targetLokasi.kelas} - ${targetLokasi.lokasi || ''}`,
        kodeQR: targetLokasi.kodeManual,
        gpsDetail: gpsDetail?.status || 'Lokasi Valid'
      }
    });

    showToast && showToast(`✓ Presensi Kehadiran ${sesiNamaToUse} Berhasil (${res.jamScan} WIB)!`);
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
    const allLocations = storageService.getSigapLokasiQR();

    // 1. Cari kecocokan lokasi berdasarkan kode manual, kelas, atau id
    let matchedLokasi = allLocations.find(l => 
      (l.kodeManual && l.kodeManual.toLowerCase() === cleanCode.toLowerCase()) ||
      (l.kelas && l.kelas.toLowerCase() === cleanCode.toLowerCase()) ||
      (l.kodeManual && cleanCode.toLowerCase().includes(l.kodeManual.toLowerCase())) ||
      (l.kelas && cleanCode.toLowerCase().includes(l.kelas.toLowerCase())) ||
      (l.id && l.id === cleanCode)
    );

    // Jika kode QR berupa teks deskripsi ruangan
    if (!matchedLokasi && cleanCode) {
      const lower = cleanCode.toLowerCase();
      matchedLokasi = allLocations.find(l => 
        (l.lokasi && lower.includes(l.lokasi.toLowerCase())) ||
        (l.kelas && lower.includes(l.kelas.toLowerCase()))
      );
    }

    // JIKA KODE QR TIDAK COCOK DENGAN LOKASI RESMI -> TAMPILKAN POP-UP GAGAL
    if (!matchedLokasi) {
      playScanBeep(false);
      setScanPopup({
        isOpen: true,
        status: 'error',
        title: 'Pemindaian Gagal!',
        subtitle: 'Barcode / QR Code Tidak Dikenali',
        rawCode: cleanCode,
        details: {
          alasan: `Kode yang dipindai "${cleanCode.slice(0, 45)}" bukan merupakan QR Code Ruangan Resmi SIMTAH.`,
          panduan: 'Silakan arahkan kamera tepat pada stiker Barcode / QR Code ruangan halaqah yang ditempel Super Admin (contoh: KANTOR atau MAIAS-XA).'
        }
      });
      return;
    }

    setSelectedLokasiId(matchedLokasi.id);

    // 2. Cek aturan GPS Locked jika lokasi mewajibkan koordinat
    if (matchedLokasi.locked && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const userAcc = Math.round(pos.coords.accuracy || 10);
          const distance = calculateDistanceInMeters(userLat, userLng, matchedLokasi.lat, matchedLokasi.lng);
          const maxRadius = matchedLokasi.radiusMeter || 50;

          if (distance > maxRadius) {
            playScanBeep(false);
            setScanPopup({
              isOpen: true,
              status: 'warning',
              title: 'Peringatan: Di Luar Radius GPS!',
              subtitle: `Posisi GPS berjarak ${distance}m dari titik ruangan (Batas: ${maxRadius}m)`,
              rawCode: matchedLokasi.kodeManual,
              details: {
                targetLokasi: matchedLokasi,
                distance,
                maxRadius,
                userLat,
                userLng,
                accuracy: userAcc,
                sesiNama: sesiNamaToUse,
                alasan: `Perangkat Anda terdeteksi berjarak ${distance} meter dari titik koordinat resmi ${matchedLokasi.kelas}.`,
                panduan: 'Jika Anda sudah berada di lokasi namun akurasi GPS indoor sedang lemah, Anda dapat menekan Konfirmasi di bawah untuk tetap mencatat kehadiran.'
              }
            });
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
          console.warn("GPS warning, proceed with valid code:", err);
          executePresensiPengampu(matchedLokasi, {
            status: 'Verifikasi Barcode Ruangan Valid',
            distance: 0,
            maxRadius: matchedLokasi.radiusMeter || 50,
            accuracy: null
          }, sesiNamaToUse);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      executePresensiPengampu(matchedLokasi, {
        status: 'Lokasi Terverifikasi (Barcode Valid)',
        distance: 0,
        maxRadius: 50,
        accuracy: null
      }, sesiNamaToUse);
    }
  };

  const targetLokasi = lokasiList.find(l => l.id === selectedLokasiId) || lokasiList[0];

  return (
    <div className="page-content-wrapper">
      <style>{`
        /* Styling Animasi & Viewfinder Kamera Live */
        .live-camera-viewport {
          position: relative;
          width: 100%;
          min-height: 290px;
          max-height: 380px;
          background: #0f172a;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #059669;
          box-shadow: 0 8px 30px rgba(5, 150, 105, 0.2);
        }
        #reader-live-camera {
          width: 100% !important;
          height: 100% !important;
        }
        #reader-live-camera video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 14px;
        }
        /* Reticle Laser Scanner */
        .scanner-laser-line {
          position: absolute;
          left: 10%;
          right: 10%;
          height: 2.5px;
          background: linear-gradient(90deg, transparent 0%, #10b981 50%, transparent 100%);
          box-shadow: 0 0 14px #10b981, 0 0 24px #34d399;
          border-radius: 4px;
          animation: scanLaser 2s ease-in-out infinite alternate;
          z-index: 10;
          pointer-events: none;
        }
        @keyframes scanLaser {
          0% { top: 18%; opacity: 0.4; }
          50% { opacity: 1; }
          100% { top: 82%; opacity: 0.4; }
        }
        /* Corner Reticles */
        .reticle-corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border-color: #34d399;
          border-style: solid;
          pointer-events: none;
          z-index: 9;
        }
        .reticle-tl { top: 22px; left: 22px; border-width: 3.5px 0 0 3.5px; border-top-left-radius: 8px; }
        .reticle-tr { top: 22px; right: 22px; border-width: 3.5px 3.5px 0 0; border-top-right-radius: 8px; }
        .reticle-bl { bottom: 22px; left: 22px; border-width: 0 0 3.5px 3.5px; border-bottom-left-radius: 8px; }
        .reticle-br { bottom: 22px; right: 22px; border-width: 0 3.5px 3.5px 0; border-bottom-right-radius: 8px; }

        @keyframes pulseSuccess {
          0% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pulse-badge {
          animation: pulseSuccess 0.4s ease-out;
        }
      `}</style>

      {/* 1. JADWAL SESI HARI INI (TEKAN SESI LANGSUNG BUKA KAMERA LIVE) */}
      <div className="sesi-card-container" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div className="sesi-header-title">Jadwal Sesi Hari Ini</div>
            <div className="sesi-header-sub">
              Tekan sesi untuk <strong>langsung membuka kamera live</strong> presensi QR
            </div>
          </div>

          {/* Indikator Status Auto Live Camera */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#047857'
          }}>
            <Camera size={14} color="#059669" />
            <span>Kamera Live Otomatis</span>
          </div>
        </div>

        {/* Row Chips Sesi Hari Ini */}
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
                  border: isSelected ? '2.5px solid #059669' : undefined,
                  boxShadow: isSelected ? '0 0 0 3px rgba(5, 150, 105, 0.25)' : undefined,
                  transition: 'all 0.18s ease'
                }}
                title={isSudah ? `Sudah presensi: ${presensi.jamScan} WIB (${presensi.keterangan || 'Tepat Waktu'}). Tekan untuk buka kamera scan ulang.` : isLibur ? 'Jadwal Libur. Tekan untuk buka kamera presensi.' : 'Tekan untuk langsung membuka kamera live scan QR!'}
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

      {/* 2. REKAP STATUS PRESENSI REAL HARI INI */}
      <div className="card scan-card-pad" style={{ padding: '16px 18px', borderRadius: '16px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
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

        {/* List Presensi Pengampu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jadwalHalaqoh.sesiList.map(sesi => {
            const presensi = storageService.isPengampuSudahScan(currentPengampuNama, sesi.id, todayISO);
            const isSudah = presensi.sudah;
            const isMasukHariIni = jadwalHalaqoh?.hariAktif?.[todayIndo]?.[sesi.id] !== false;
            const isLibur = !isSudah && (!isMasukHariIni || sesi.aktif === false);

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
                badgeText = ket;
                iconType = 'telat';
              } else {
                badgeBg = '#ecfdf5';
                badgeColor = '#047857';
                badgeBorder = '#a7f3d0';
                badgeText = 'Hadir Tepat Waktu';
                iconType = 'hadir';
              }
              subText = `Scan: ${presensi.jamScan} WIB • ${presensi.lokasi || 'Masjid Tahfidz'}`;
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

                  <button
                    type="button"
                    onClick={() => handleSessionClick(sesi)}
                    style={{
                      display: 'block',
                      background: 'transparent',
                      border: 'none',
                      color: '#059669',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '4px',
                      padding: 0,
                      marginLeft: 'auto'
                    }}
                  >
                    {isSudah ? 'Scan Ulang →' : 'Scan Sesi Ini →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL KAMERA PEMINDAI QR LIVE (HTML5-QRCODE STREAMING) */}
      {/* ========================================================= */}
      {showLiveCamera && (
        <div className="modal-overlay" onClick={stopCameraScanner}>
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '500px', 
              padding: 0, 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal Kamera */}
            <div style={{
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={18} color="#a7f3d0" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.96rem', lineHeight: 1.2 }}>
                    Pindai Barcode Ruangan
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#a7f3d0', fontWeight: 600 }}>
                    Sesi: {selectedSesi || "Halaqah"}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={stopCameraScanner}
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  border: 'none', 
                  color: '#ffffff', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Tutup Kamera"
              >
                <X size={18} />
              </button>
            </div>

            {/* Area Viewfinder Kamera */}
            <div style={{ padding: '20px', background: '#ffffff', textAlign: 'center' }}>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: '#475569' }}>
                Arahkan kamera smartphone ke <strong>Stiker QR Code Ruangan Halaqah</strong>:
              </p>

              <div className="live-camera-viewport">
                {/* Scanner Laser & Corners */}
                {!cameraLoading && !cameraError && (
                  <>
                    <div className="scanner-laser-line"></div>
                    <div className="reticle-corner reticle-tl"></div>
                    <div className="reticle-corner reticle-tr"></div>
                    <div className="reticle-corner reticle-bl"></div>
                    <div className="reticle-corner reticle-br"></div>
                  </>
                )}

                {/* Loading State */}
                {cameraLoading && (
                  <div style={{ padding: '30px', color: '#ffffff', textAlign: 'center' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      border: '3px solid rgba(255,255,255,0.2)',
                      borderTopColor: '#34d399',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 12px auto'
                    }}></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a7f3d0' }}>
                      Menghubungkan Kamera Live...
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                      Pastikan izin kamera disetujui
                    </div>
                  </div>
                )}

                {/* Error State */}
                {cameraError && (
                  <div style={{ padding: '24px', color: '#fca5a5', textAlign: 'center' }}>
                    <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
                    <div style={{ fontWeight: 800, fontSize: '0.90rem', color: '#ffffff', marginBottom: '6px' }}>
                      Kamera Tidak Terbuka
                    </div>
                    <p style={{ margin: '0 0 14px 0', fontSize: '0.76rem', color: '#cbd5e1' }}>
                      {cameraError}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => startCameraScanner(selectedSesi)}
                      style={{ borderRadius: '10px', fontSize: '12px' }}
                    >
                      <RefreshCw size={13} />
                      <span>Coba Buka Ulang</span>
                    </button>
                  </div>
                )}

                {/* Html5Qrcode Mount Point */}
                <div id="reader-live-camera"></div>
              </div>

              {/* Status Info Di Bawah Kamera */}
              <div style={{ 
                marginTop: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>Pemindai Aktif</span>
                </div>

                {availableCameras.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#334155',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={12} />
                    <span>Putar Kamera</span>
                  </button>
                )}
              </div>

              {/* Simulasi Cepat Barcode (Opsi Bantu untuk Pengampu/Admin tanpa cetak fisik) */}
              <div style={{
                marginTop: '14px',
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Building2 size={13} color="#059669" />
                  <span>Scan Cepat Lokasi Terdaftar:</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <CustomSelect
                    value={selectedLokasiId}
                    onChange={(e) => setSelectedLokasiId(e.target.value)}
                    style={{ flex: 1 }}
                    triggerStyle={{ minHeight: '34px', fontSize: '11.5px', borderRadius: '8px', fontWeight: 700 }}
                  >
                    {lokasiList.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.kelas} ({l.kodeManual}) — {l.lokasi || ''}
                      </option>
                    ))}
                  </CustomSelect>

                  <button
                    type="button"
                    onClick={async () => {
                      const target = lokasiList.find(l => l.id === selectedLokasiId) || lokasiList[0];
                      await stopCameraScanner();
                      handleProcessScannedCode(target.kodeManual, selectedSesi);
                    }}
                    style={{
                      background: '#059669',
                      border: 'none',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Zap size={13} />
                    <span>Scan Ini</span>
                  </button>
                </div>
              </div>

              {/* Tombol Tutup Bawah */}
              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Tutup Kamera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. POP-UP MODAL HASIL PRESENSI (SUKSES / GAGAL / WARNING) */}
      {/* ========================================================= */}
      {scanPopup.isOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 1100 }}
          onClick={() => setScanPopup(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="modal-content pulse-badge"
            style={{ 
              maxWidth: '460px', 
              padding: '0', 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: scanPopup.status === 'success' 
                ? '2px solid #34d399' 
                : scanPopup.status === 'warning' 
                  ? '2px solid #fcd34d' 
                  : '2px solid #f87171'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Pop-up Sesuai Status */}
            <div style={{
              background: scanPopup.status === 'success' 
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                : scanPopup.status === 'warning'
                  ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              padding: '24px 20px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <button 
                type="button"
                onClick={() => setScanPopup(prev => ({ ...prev, isOpen: false }))}
                style={{ 
                  position: 'absolute', 
                  top: '16px', 
                  right: '16px', 
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  color: '#ffffff', 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>

              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }}>
                {scanPopup.status === 'success' && <CheckCircle2 size={36} color="#ffffff" />}
                {scanPopup.status === 'warning' && <AlertCircle size={36} color="#ffffff" />}
                {scanPopup.status === 'error' && <X size={36} color="#ffffff" />}
              </div>

              <h3 style={{ margin: 0, fontSize: '1.24rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                {scanPopup.title}
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.92)' }}>
                {scanPopup.subtitle}
              </p>
            </div>

            {/* Isi Detail Pop-up */}
            <div style={{ padding: '20px 24px', background: '#ffffff' }}>
              {/* KASUS 1: POP-UP SUKSES */}
              {scanPopup.status === 'success' && scanPopup.details && (
                <div>
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.80rem' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Pengampu
                        </div>
                        <div style={{ fontWeight: 800, color: '#064e3b' }}>
                          {scanPopup.details.nama}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Sesi & Jam
                        </div>
                        <div style={{ fontWeight: 800, color: '#064e3b' }}>
                          {scanPopup.details.sesi} ({scanPopup.details.jamScan} WIB)
                        </div>
                      </div>

                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Status Kehadiran
                        </div>
                        <div style={{
                          display: 'inline-block',
                          fontWeight: 800,
                          color: scanPopup.details.status === 'Terlambat' ? '#c2410c' : '#047857',
                          background: scanPopup.details.status === 'Terlambat' ? '#ffedd5' : '#dcfce7',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          marginTop: '2px'
                        }}>
                          {scanPopup.details.status}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          Ruangan / Lokasi
                        </div>
                        <div style={{ fontWeight: 800, color: '#064e3b' }}>
                          {scanPopup.details.lokasi}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #a7f3d0', fontSize: '0.76rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={14} color="#059669" strokeWidth={3} />
                      <span>{scanPopup.details.keterangan}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setScanPopup(prev => ({ ...prev, isOpen: false }))}
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    Alhamdulillah, Selesai
                  </button>
                </div>
              )}

              {/* KASUS 2: POP-UP GAGAL (KODE TIDAK SESUAI / KAMERA ERROR) */}
              {scanPopup.status === 'error' && (
                <div>
                  <div style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}>
                    {scanPopup.rawCode && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.70rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                          Kode yang Terbaca:
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.84rem',
                          color: '#dc2626',
                          background: '#ffffff',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #fca5a5',
                          marginTop: '3px',
                          wordBreak: 'break-all'
                        }}>
                          {scanPopup.rawCode}
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: '0.80rem', color: '#7f1d1d', lineHeight: 1.5, marginBottom: '8px' }}>
                      <strong>Alasan Gagal:</strong> {scanPopup.details?.alasan}
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#991b1b', lineHeight: 1.4, background: '#fff5f5', padding: '8px 10px', borderRadius: '8px', marginBottom: '14px' }}>
                      💡 <strong>Panduan:</strong> {scanPopup.details?.panduan}
                    </div>

                    {/* Opsi Bantu: Konfirmasi Ruangan jika perangkat tidak memiliki webcam aktif */}
                    <div style={{
                      marginBottom: '14px',
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={13} color="#059669" />
                        <span>Alternatif: Konfirmasi Ruangan Tanpa Kamera</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <CustomSelect
                          value={selectedLokasiId}
                          onChange={(e) => setSelectedLokasiId(e.target.value)}
                          style={{ flex: 1 }}
                          triggerStyle={{ minHeight: '34px', fontSize: '11.5px', borderRadius: '8px', fontWeight: 700 }}
                        >
                          {lokasiList.map(l => (
                            <option key={l.id} value={l.id}>
                              {l.kelas} ({l.kodeManual}) — {l.lokasi || ''}
                            </option>
                          ))}
                        </CustomSelect>
                        <button
                          type="button"
                          onClick={async () => {
                            const target = lokasiList.find(l => l.id === selectedLokasiId) || lokasiList[0];
                            setScanPopup(prev => ({ ...prev, isOpen: false }));
                            await stopCameraScanner();
                            if (target) {
                              handleProcessScannedCode(target.kodeManual, selectedSesi);
                            }
                          }}
                          style={{
                            background: '#059669',
                            border: 'none',
                            color: '#ffffff',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Zap size={13} />
                          <span>Presensi</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setScanPopup(prev => ({ ...prev, isOpen: false }));
                        startCameraScanner(selectedSesi);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#dc2626',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Camera size={15} />
                      <span>Pindai Ulang</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScanPopup(prev => ({ ...prev, isOpen: false }))}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}

              {/* KASUS 3: POP-UP PERINGATAN GPS */}
              {scanPopup.status === 'warning' && scanPopup.details && (
                <div>
                  <div style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '0.82rem', color: '#92400e', marginBottom: '8px', lineHeight: 1.5 }}>
                      <strong>Keterangan Radius:</strong> {scanPopup.details.alasan}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#78350f', background: '#fef3c7', padding: '8px 10px', borderRadius: '8px' }}>
                      ℹ️ {scanPopup.details.panduan}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const target = scanPopup.details.targetLokasi;
                        setScanPopup(prev => ({ ...prev, isOpen: false }));
                        executePresensiPengampu(target, {
                          status: 'Disetujui di Ruangan (Toleransi GPS Indoor)',
                          distance: scanPopup.details.distance,
                          maxRadius: scanPopup.details.maxRadius,
                          accuracy: scanPopup.details.accuracy
                        }, scanPopup.details.sesiNama);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#059669',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Tetap Konfirmasi
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScanPopup(prev => ({ ...prev, isOpen: false }));
                        startCameraScanner(selectedSesi);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Pindai Ulang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
