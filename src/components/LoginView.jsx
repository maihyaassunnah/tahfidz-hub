import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Settings, 
  ExternalLink, 
  X, 
  KeyRound,
  Shield,
  Building2,
  Award,
  ChevronDown,
  ChevronUp,
  Globe,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import TahfidzHubLogo from './TahfidzHubLogo';
import { storageService } from '../services/storage';
import './LoginView.css';

export default function LoginView({ onLoginSuccess, isDarkMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickCreds, setShowQuickCreds] = useState(true);
  
  // Google Setup Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState(storageService.getGoogleClientId());
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [googleScriptReady, setGoogleScriptReady] = useState(false);

  // Auto-initialize Google Identity Services if client ID is set
  useEffect(() => {
    const clientId = storageService.getGoogleClientId();
    if (!clientId) return;

    const setupGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            auto_select: false
          });

          setGoogleScriptReady(true);

          const container = document.getElementById('google-btn-rendered');
          if (container) {
            container.innerHTML = '';
            window.google.accounts.id.renderButton(container, {
              theme: isDarkMode ? 'filled_black' : 'outline',
              size: 'large',
              type: 'standard',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 320
            });
          }
        } catch (err) {
          console.warn('Google GSI init notice:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          setupGoogle();
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [isDarkMode]);

  const handleGoogleResponse = (response) => {
    try {
      if (response && response.credential) {
        // Decode JWT payload
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const profile = JSON.parse(jsonPayload);
        const authResult = storageService.authenticateGoogle(profile);
        if (authResult.success) {
          onLoginSuccess(authResult.user);
        }
      }
    } catch (err) {
      console.error('Google Auth parse error:', err);
      setErrorMsg('Gagal memproses otentikasi Google. Silakan coba lagi.');
    }
  };

  const handleStandardLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Harap masukkan Username/Email dan Kata Sandi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = storageService.authenticate(username, password);
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message || 'Kredensial tidak valid!');
      }
    }, 450);
  };

  const handleQuickLogin = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      const result = storageService.authenticate(userVal, passVal);
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message || 'Kredensial tidak valid!');
      }
    }, 300);
  };

  const handleGoogleClick = () => {
    const clientId = storageService.getGoogleClientId();
    if (clientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        setShowGoogleModal(true);
      }
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleSimulateGoogleLogin = () => {
    const demoProfile = {
      sub: 'google-demo-12345678',
      name: 'Wahyudin Hafiz (Google)',
      email: 'wahyudinhafiz@gmail.com',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };
    const authResult = storageService.authenticateGoogle(demoProfile);
    setShowGoogleModal(false);
    if (authResult.success) {
      onLoginSuccess(authResult.user);
    }
  };

  const handleSaveGoogleClientId = () => {
    storageService.setGoogleClientId(googleClientIdInput);
    setShowGoogleModal(false);
    alert('Google Client ID berhasil disimpan ke browser! Ketika Anda deploy ke domain https://tahfidz.wahyudinhafiz.my.id, pastikan domain tersebut sudah didaftarkan di Google Cloud Console.');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* =========================================================
            PANEL KIRI: BRANDING HERO DENGAN GELOMBANG (SESUAI GAMBAR 2)
            ========================================================= */}
        <div className="login-hero-panel">
          <div className="login-hero-glow"></div>

          {/* Top Welcome Title */}
          <div className="login-hero-header">
            <span className="login-welcome-tag">Welcome to</span>
          </div>

          {/* Center Emblem & Description */}
          <div className="login-hero-body">
            <div className="login-emblem-circle" style={{ padding: 0, overflow: 'hidden', background: '#ffffff', border: '3px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
              <img 
                src="/icons/icon-192x192.png" 
                alt="TahfidzHub Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
              />
            </div>

            <h1 className="login-brand-name">Tahfidz HUB</h1>

            <p className="login-brand-tagline">
              Platform Terpadu Manajemen Tahfidz Qur'an, Halaqah, & Presensi Real-Time MA Ihya As-Sunnah.
            </p>
          </div>

          {/* Bottom Footer Info */}
          <div className="login-hero-footer">
            <span>MA IHYA AS-SUNNAH</span>
            <span>SIMTAH v2.5 ENTERPRISE</span>
          </div>

          {/* Desktop Layered Waves SVG (Tepian bergelombang transisi ke sisi form) */}
          <svg 
            className="login-wave-desktop" 
            viewBox="0 0 100 800" 
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Lapisan gelombang 1 (transparan halus) */}
            <path 
              d="M0,0 C35,160 80,320 35,460 C-5,590 70,710 30,800 L100,800 L100,0 Z" 
              fill="rgba(255, 255, 255, 0.18)" 
            />
            {/* Lapisan gelombang 2 (opacity medium) */}
            <path 
              d="M18,0 C60,170 85,350 48,490 C12,630 78,740 45,800 L100,800 L100,0 Z" 
              fill="rgba(255, 255, 255, 0.38)" 
            />
            {/* Lapisan gelombang 3 (putih solid menyatu dengan form) */}
            <path 
              d="M42,0 C88,180 72,380 58,520 C38,660 92,760 62,800 L100,800 L100,0 Z" 
              fill={isDarkMode ? '#1e293b' : '#ffffff'} 
            />
          </svg>

          {/* Mobile Bottom Wave SVG (Transisi melengkung untuk tampilan HP) */}
          <svg 
            className="login-wave-mobile" 
            viewBox="0 0 1440 320" 
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path 
              fill="rgba(255,255,255,0.25)" 
              d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,186.7C672,181,768,139,864,133.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L0,320Z"
            />
            <path 
              fill={isDarkMode ? '#1e293b' : '#ffffff'} 
              d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L0,320Z"
            />
          </svg>
        </div>

        {/* =========================================================
            PANEL KANAN: FORM LOGIN & SOCIAL AUTH (SESUAI GAMBAR 2)
            ========================================================= */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h2 className="login-form-title">Masuk ke Akun Anda</h2>
            <p className="login-form-subtitle">
              Silakan masukkan kredensial akun untuk mengakses sistem.
            </p>
          </div>

          {/* Alert Error Message */}
          {errorMsg && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Banner Petunjuk Khusus Wali Santri */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            background: isDarkMode ? 'rgba(16, 185, 129, 0.12)' : '#f0fdf4',
            border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #bbf7d0',
            color: isDarkMode ? '#6ee7b7' : '#166534',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.80rem',
            marginBottom: '18px',
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
              <HeartHandshake size={18} color={isDarkMode ? '#34d399' : '#16a34a'} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontWeight: 700 }}>Akses Orang Tua / Wali:</strong>
                <span>Gunakan <strong>Nama Santri</strong> (Username) &amp; <strong>NIS</strong> (Kata Sandi).</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickLogin('Adilla', '39938383')}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
              }}
              title="1-Klik Buka Portal Wali Santri (Adilla)"
            >
              <span>Buka Portal Ortu</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <form onSubmit={handleStandardLogin}>
            {/* Input Username / Email */}
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="login-username">
                Nama Lengkap Santri / Username / Email
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <User size={18} />
                </div>
                <input
                  id="login-username"
                  type="text"
                  className="login-input"
                  placeholder="Contoh: Adilla atau admin.ma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="login-password">
                NIS Santri / Kata Sandi
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Lock size={18} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Masukkan NIS Santri (Contoh: 39938383)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox Ingat Saya & Link Lupa Password */}
            <div className="login-options-row">
              <label className="login-remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ingat Saya</span>
              </label>

              <button
                type="button"
                className="login-forgot-link"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                Lupa Password?
              </button>
            </div>

            {/* Tombol Masuk Utama */}
            <button
              type="submit"
              className="btn-login-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner-inline" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Pembatas: atau masuk dengan */}
          <div className="login-divider">
            <span>atau masuk dengan</span>
          </div>

          {/* Social Login: Google Sign In */}
          <div className="login-social-grid">
            {/* Official Google GSI Rendered Button */}
            <div 
              id="google-btn-rendered" 
              style={{ display: 'flex', justifyContent: 'center', width: '100%', minHeight: googleScriptReady ? '40px' : '0' }}
            ></div>

            {/* Custom Google Button (Matching Design / Fallback) */}
            <button
              type="button"
              className="btn-google-sign-in"
              onClick={handleGoogleClick}
              title="Masuk menggunakan akun Google"
              style={{ display: googleScriptReady ? 'none' : 'flex' }}
            >
              {/* Official Google G 4-color SVG Icon */}
              <svg className="google-icon-svg" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Tooltip Petunjuk Integrasi Google Console & Cloudflare */}
            <button
              type="button"
              className="google-setup-tip"
              onClick={() => setShowGoogleModal(true)}
            >
              <Settings size={12} />
              <span>Status Google Client ID & Panduan Konsol</span>
            </button>
          </div>

          {/* Quick Demo Credentials Box for Testing */}
          <div className="quick-creds-box">
            <button
              type="button"
              className="quick-creds-header"
              onClick={() => setShowQuickCreds(!showQuickCreds)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} color="#0d9488" />
                ⚡ Kredensial Cepat Pengujian (1-Klik Masuk)
              </span>
              {showQuickCreds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showQuickCreds && (
              <div className="quick-creds-chips">
                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickLogin('admin.ma', 'bismillah123')}
                  title="Masuk sebagai Super Admin (Pusat)"
                >
                  <Shield size={13} color="#0d9488" />
                  <span>Super Admin</span>
                </button>

                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickLogin('owner', 'bismillah123')}
                  title="Masuk sebagai Owner Yayasan"
                >
                  <Building2 size={13} color="#d97706" />
                  <span>Owner Yayasan</span>
                </button>

                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickLogin('ustadz.wahyudin', 'bismillah123')}
                  title="Masuk sebagai Pengampu (Ustadz Wahyudin)"
                >
                  <Award size={13} color="#2563eb" />
                  <span>Pengampu</span>
                </button>

                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickLogin('Adilla', '39938383')}
                  title="Masuk sebagai Wali Santri (Ananda Adilla - NIS 39938383)"
                  style={{ borderColor: '#d8b4fe', background: '#faf5ff' }}
                >
                  <HeartHandshake size={13} color="#7c3aed" />
                  <span>Wali Adilla (39938383)</span>
                </button>

                <button
                  type="button"
                  className="quick-chip"
                  onClick={() => handleQuickLogin('Zaidan Al-Farisi', '20260901')}
                  title="Masuk sebagai Wali Santri (Ananda Zaidan - NIS 20260901)"
                  style={{ borderColor: '#d8b4fe', background: '#faf5ff' }}
                >
                  <HeartHandshake size={13} color="#7c3aed" />
                  <span>Wali Zaidan (20260901)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL PANDUAN GOOGLE CONSOLE & CLOUDFLARE
          ========================================================= */}
      {showGoogleModal && (
        <div className="login-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <h3>
                <Globe size={18} color="#0d9488" />
                <span>Pengaturan Google Console & Cloudflare</span>
              </h3>
              <button
                type="button"
                className="login-modal-close"
                onClick={() => setShowGoogleModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="login-modal-body">
              <p style={{ marginTop: 0, fontSize: '0.85rem' }}>
                Untuk mengaktifkan login Google di domain <strong>tahfidz.wahyudinhafiz.my.id</strong> dan <strong>localhost</strong>:
              </p>

              <div className="login-modal-step">
                <h4>1. Daftarkan di Google Cloud Console</h4>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>
                  Buka <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#0d9488', fontWeight: 600 }}>Google Cloud Console Credentials</a> &gt; Buat OAuth 2.0 Client ID (Web Application).
                </p>
              </div>

              <div className="login-modal-step">
                <h4>2. Masukkan Authorized JavaScript Origins</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <span className="login-code-badge">https://tahfidz.wahyudinhafiz.my.id</span>
                  <span className="login-code-badge">http://localhost:5173</span>
                </div>
              </div>

              <div className="login-modal-step">
                <h4>3. Catatan Cloudflare (SSL & Proxy)</h4>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>
                  Pastikan di Dashboard Cloudflare, status DNS Record untuk <code>tahfidz</code> adalah <strong>Proxied (Orange Cloud)</strong> dan SSL/TLS Encryption mode diatur ke <strong>Full</strong> atau <strong>Full (strict)</strong>.
                </p>
              </div>

              <div className="login-modal-step" style={{ borderLeftColor: '#f59e0b' }}>
                <h4>4. Input Google Client ID (Opsional jika sudah punya)</h4>
                <input
                  type="text"
                  className="login-input"
                  style={{ marginTop: '6px', fontSize: '0.8rem' }}
                  placeholder="Contoh: 1234567890-abcdef.apps.googleusercontent.com"
                  value={googleClientIdInput}
                  onChange={(e) => setGoogleClientIdInput(e.target.value)}
                />
              </div>
            </div>

            <div className="login-modal-footer">
              <button
                type="button"
                className="btn-login-primary"
                style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '0.6rem 1rem', fontSize: '0.825rem' }}
                onClick={handleSimulateGoogleLogin}
                title="Coba simulasi login akun Google terverifikasi"
              >
                <span>🧪 Uji Coba Demo Akun Google</span>
              </button>

              <button
                type="button"
                className="btn-login-primary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.825rem' }}
                onClick={handleSaveGoogleClientId}
              >
                <span>Simpan Client ID</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL LUPA PASSWORD
          ========================================================= */}
      {showForgotPasswordModal && (
        <div className="login-modal-overlay" onClick={() => setShowForgotPasswordModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="login-modal-header">
              <h3>
                <KeyRound size={18} color="#0d9488" />
                <span>Bantuan Pemulihan Kata Sandi</span>
              </h3>
              <button
                type="button"
                className="login-modal-close"
                onClick={() => setShowForgotPasswordModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="login-modal-body">
              <p style={{ marginTop: 0 }}>
                Untuk keamanan data madrasah dan santri, reset kata sandi dikelola secara tersentralisasi:
              </p>
              <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0', fontSize: '0.825rem' }}>
                <li><strong>Super Admin Cabang:</strong> Hubungi Owner / Pimpinan Yayasan via menu Kelola Akun Cabang.</li>
                <li><strong>Ustadz Pengampu & Guru:</strong> Hubungi Super Admin Cabang MA Ihya As-Sunnah.</li>
                <li><strong>Default Akun Uji Coba:</strong> Kata sandi default adalah <code>bismillah123</code>.</li>
              </ul>
            </div>

            <div className="login-modal-footer">
              <button
                type="button"
                className="btn-login-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
                onClick={() => setShowForgotPasswordModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
