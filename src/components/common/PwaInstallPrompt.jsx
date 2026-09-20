import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle, Share2, PlusSquare } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Cek apakah sudah running dalam mode PWA Standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Cek perangkat iOS (Safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // Cek apakah prompt pernah ditutup dalam 24 jam terakhir
    const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until');
    const isDismissed = dismissedUntil && Date.now() < parseInt(dismissedUntil, 10);

    // 3. Listener beforeinstallprompt (Chrome, Android, Edge, Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPwaPrompt = e; // Simpan secara global jika tombol lain butuh
      if (!isDismissed) {
        // Tampilkan prompt setelah beberapa detik agar tidak mengganggu loading awal
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listener saat berhasil diinstall
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      window.deferredPwaPrompt = null;
      console.log('🎉 PWA TahfidzHub berhasil dipasang!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Listener untuk event trigger custom jika ada tombol lain yang ingin memunculkan prompt
    const handleManualTrigger = () => {
      if (window.deferredPwaPrompt) {
        window.deferredPwaPrompt.prompt();
        window.deferredPwaPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            setIsInstalled(true);
            setShowPrompt(false);
          }
          window.deferredPwaPrompt = null;
          setDeferredPrompt(null);
        });
      } else if (isAppleDevice) {
        setShowIOSGuide(true);
      } else {
        alert('Untuk menginstall aplikasi, gunakan menu browser (ikon titik tiga di kanan atas) dan pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama".');
      }
    };

    window.addEventListener('trigger-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-pwa-install', handleManualTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
        setShowPrompt(false);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    window.deferredPwaPrompt = null;
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    // Sembunyikan selama 3 hari ke depan
    localStorage.setItem('pwa_prompt_dismissed_until', (Date.now() + 3 * 24 * 60 * 60 * 1000).toString());
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Banner Floating Install (Android / Desktop / Chrome) */}
      {showPrompt && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src="/icons/icon-192x192.png" 
                alt="TahfidzHub Icon" 
                className="w-14 h-14 rounded-xl shadow-md border border-emerald-400/40 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5">
                <Download className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-emerald-300 leading-tight">
                Pasang Aplikasi TahfidzHub
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                Akses cepat dari layar utama HP / Desktop tanpa repot buka browser!
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all text-white font-semibold text-xs rounded-lg shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install Sekarang
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Nanti Saja
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-lg self-start"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Panduan Install untuk iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-800 shadow-2xl relative">
            <button 
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <img 
                src="/icons/icon-192x192.png" 
                alt="TahfidzHub" 
                className="w-16 h-16 rounded-2xl mx-auto mb-2 shadow-lg border border-emerald-100 object-cover"
              />
              <h3 className="font-bold text-lg text-slate-900">Pasang di iPhone / iPad</h3>
              <p className="text-xs text-slate-500 mt-1">Ikuti 2 langkah mudah berikut di Safari:</p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  Ketuk tombol <strong className="text-emerald-700 font-semibold inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5 inline" /> Bagikan (Share)</strong> pada bilah menu browser Safari di bagian bawah layar.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  Gulir ke bawah dan pilih opsi <strong className="text-emerald-700 font-semibold inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline" /> Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-md shadow-emerald-200"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
