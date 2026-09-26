import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare } from 'lucide-react';

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
      window.deferredPwaPrompt = e;
      if (!isDismissed) {
        // Tampilkan pop up setelah beberapa detik
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
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Listener untuk event trigger custom dari tombol download di sidebar/header
    const handleManualTrigger = () => {
      if (window.deferredPwaPrompt) {
        setShowPrompt(true);
      } else if (isAppleDevice) {
        setShowIOSGuide(true);
      } else {
        setShowPrompt(true);
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
    if (!deferredPrompt && !window.deferredPwaPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
        setShowPrompt(false);
      } else {
        alert('Gunakan menu browser (titik tiga di kanan atas) lalu pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama".');
        setShowPrompt(false);
      }
      return;
    }

    const promptObj = deferredPrompt || window.deferredPwaPrompt;
    promptObj.prompt();
    const { outcome } = await promptObj.userChoice;
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
    // Sembunyikan pop up selama 3 hari ke depan
    localStorage.setItem('pwa_prompt_dismissed_until', (Date.now() + 3 * 24 * 60 * 60 * 1000).toString());
  };

  if (isInstalled) return null;

  return (
    <>
      {/* POP-UP MODAL INSTALL APLIKASI (BERSIH, DI TENGAH LAYAR & TIDAK MERUSAK LAYOUT) */}
      {showPrompt && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={handleDismiss}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '400px',
              width: '100%',
              padding: '1.75rem 1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              animation: 'pwaModalPop 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Tutup X */}
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer'
              }}
              aria-label="Tutup"
            >
              <X size={16} />
            </button>

            {/* Logo Ikon Aplikasi */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              <img 
                src="/logo.png" 
                alt="TahfidzHub Logo" 
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  objectFit: 'cover',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                  border: '2px solid #a7f3d0'
                }}
              />
              <span 
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}
              >
                <Download size={12} />
              </span>
            </div>

            {/* Judul & Deskripsi */}
            <h3 style={{ fontSize: '1.20rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Pasang Aplikasi TahfidzHub
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
              Akses cepat dan mudah langsung dari layar beranda HP atau Desktop Anda tanpa perlu membuka browser!
            </p>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleInstallClick}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Download size={16} />
                <span>Pasang Aplikasi Sekarang</span>
              </button>

              <button
                onClick={handleDismiss}
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: 'none',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP PANDUAN UNTUK IOS SAFARI */}
      {showIOSGuide && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '380px',
              width: '100%',
              padding: '1.75rem 1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowIOSGuide(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <img 
              src="/logo.png" 
              alt="TahfidzHub" 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                margin: '0 auto 12px auto',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.25)',
                display: 'block'
              }}
            />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
              Pasang di iPhone / iPad
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>
              Ikuti 2 langkah mudah berikut di Safari:
            </p>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  Ketuk tombol <strong>Bagikan (Share)</strong> <Share2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> pada menu Safari di bawah layar.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  Pilih opsi <strong>Tambah ke Layar Utama</strong> <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
