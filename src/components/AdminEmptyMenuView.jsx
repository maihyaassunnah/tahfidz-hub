import React from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  MapPin, 
  ClipboardCheck, 
  CheckSquare, 
  Settings, 
  LayoutDashboard,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';

export default function AdminEmptyMenuView({ activeTab, onOpenPasswordModal }) {
  // Mapping detail untuk setiap menu SIGAP
  const menuConfig = {
    'sigap-dashboard': {
      title: 'Dashboard Super Admin',
      kategori: 'RINGKASAN UTAMA',
      icon: LayoutDashboard,
      desc: 'Ringkasan analitik, statistik utama aktivitas madrasah, dan pemantauan harian sistem.'
    },
    'sigap-siswa': {
      title: 'Data Siswa',
      kategori: 'CIVITAS AKADEMIKA',
      icon: GraduationCap,
      desc: 'Manajemen basis data siswa, NIS, kelas, riwayat akademik, dan informasi wali santri.'
    },
    'sigap-guru': {
      title: 'Data Guru & Pegawai',
      kategori: 'CIVITAS AKADEMIKA',
      icon: Users,
      desc: 'Basis data direktori pendidik, ustadz/ustadzah, NIP, status kepegawaian, dan penugasan.'
    },
    'sigap-alumni': {
      title: 'Data Alumni',
      kategori: 'CIVITAS AKADEMIKA',
      icon: GraduationCap,
      desc: 'Pelacakan lulusan madrasah, tahun kelulusan, penelusuran karir/studi lanjut, dan jaringan alumni.'
    },
    'sigap-kelas': {
      title: 'Data Kelas',
      kategori: 'MANAJEMEN KBM',
      icon: Users,
      desc: 'Pengaturan rombongan belajar, wali kelas, kapasitas ruang, dan alokasi santri per kelas.'
    },
    'sigap-mapel': {
      title: 'Data Mapel',
      kategori: 'MANAJEMEN KBM',
      icon: BookOpen,
      desc: 'Daftar mata pelajaran, kurikulum tahfidz/diniyah/umum, alokasi jam, dan standar KKM.'
    },
    'sigap-jadwal': {
      title: 'Jadwal',
      kategori: 'MANAJEMEN KBM',
      icon: Calendar,
      desc: 'Pengaturan jadwal kegiatan belajar mengajar harian, sesi tahfidz, dan rotasi ruangan.'
    },
    'sigap-lokasi-qr': {
      title: 'Lokasi & QR Kelas',
      kategori: 'MANAJEMEN KBM',
      icon: MapPin,
      desc: 'Pemetaan titik lokasi halaqah/kelas, geofencing presensi, dan cetak kode QR ruang belajar.'
    },
    'sigap-monitoring': {
      title: 'Monitoring & Rekap',
      kategori: 'REKAP & PERIZINAN',
      icon: ClipboardCheck,
      desc: 'Rekapitulasi berkala kehadiran santri, ketuntasan setoran, evaluasi guru, dan log aktivitas.'
    },
    'sigap-izin': {
      title: 'Persetujuan Izin',
      kategori: 'REKAP & PERIZINAN',
      icon: CheckSquare,
      desc: 'Verifikasi pengajuan perizinan santri/pegawai, status dispensasi, dan rekap surat izin.'
    },
    'sigap-konfigurasi': {
      title: 'Konfigurasi Unit',
      kategori: 'SISTEM',
      icon: Settings,
      desc: 'Pengaturan parameter sistem, identitas madrasah, hak akses akun, dan preferensi server.'
    }
  };

  const current = menuConfig[activeTab] || {
    title: 'Menu Administrator',
    kategori: 'SUPER ADMIN',
    icon: Inbox,
    desc: 'Halaman panel administrator SIGAP.'
  };

  const IconComponent = current.icon;

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* Top Breadcrumb & Title Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Panel Super Admin</span>
          <span>/</span>
          <span style={{ color: '#0d9488' }}>{current.kategori}</span>
          <span>/</span>
          <span style={{ color: '#0f172a' }}>{current.title}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1.5px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488'
            }}>
              <IconComponent size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {current.title}
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                {current.desc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#fef3c7',
              color: '#92400e',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid #fde68a'
            }}>
              <Clock size={14} />
              Menunggu Referensi dari Admin
            </span>
          </div>
        </div>
      </div>

      {/* Main Empty State Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px dashed #cbd5e1',
        padding: '50px 30px',
        textAlign: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ccfbf1 100%)',
          border: '2px solid #99f6e4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          color: '#0d9488',
          boxShadow: '0 8px 16px -4px rgba(13, 148, 136, 0.15)'
        }}>
          <IconComponent size={36} />
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Halaman {current.title} Siap Diisi
        </h2>

        <p style={{ maxWidth: '520px', margin: '0 auto 24px auto', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
          Sesuai instruksi Anda, konten untuk menu <strong>{current.title}</strong> dikosongkan terlebih dahulu. Begitu Anda memberikan referensi desain atau data kolom yang diinginkan, kami akan langsung menerapkannya di sini.
        </p>

        {/* Clean Wireframe Placeholder Grid */}
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left'
          }}>
            <div style={{ width: '28px', height: '8px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '10px' }}></div>
            <div style={{ width: '80%', height: '14px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ width: '50%', height: '10px', background: '#f1f5f9', borderRadius: '4px' }}></div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left'
          }}>
            <div style={{ width: '28px', height: '8px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '10px' }}></div>
            <div style={{ width: '70%', height: '14px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ width: '60%', height: '10px', background: '#f1f5f9', borderRadius: '4px' }}></div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'left'
          }}>
            <div style={{ width: '28px', height: '8px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '10px' }}></div>
            <div style={{ width: '85%', height: '14px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ width: '40%', height: '10px', background: '#f1f5f9', borderRadius: '4px' }}></div>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#0d9488',
          fontWeight: 600,
          background: '#f0fdf4',
          padding: '8px 18px',
          borderRadius: '30px',
          border: '1px solid #bbf7d0'
        }}>
          <Sparkles size={16} />
          Silakan kirimkan referensi atau format tabel/formulir yang Anda inginkan untuk menu ini.
        </div>
      </div>
    </div>
  );
}
