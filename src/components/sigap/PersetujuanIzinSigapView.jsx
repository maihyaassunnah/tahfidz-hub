import React, { useState } from 'react';
import { 
  Clock, 
  UserCheck, 
  UserX, 
  History, 
  Calendar, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { storageService } from '../../services/storage';

export default function PersetujuanIzinSigapView({ showToast }) {
  const [izinList, setIzinList] = useState(storageService.getSigapIzinGuru());
  const [activeTab, setActiveTab] = useState('perlu'); // 'perlu' or 'riwayat'

  const reloadData = () => {
    setIzinList(storageService.getSigapIzinGuru());
  };

  const handleSetujui = (id, nama) => {
    const catatan = prompt(`Catatan persetujuan izin untuk ${nama} (opsional):`, 'Disetujui. Tugas didelegasikan ke guru badal.');
    storageService.updateStatusIzinGuru(id, 'Disetujui', catatan || 'Disetujui');
    reloadData();
    showToast && showToast(`✓ Permohonan izin ${nama} telah disetujui.`);
  };

  const handleTolak = (id, nama) => {
    const catatan = prompt(`Alasan penolakan izin untuk ${nama}:`, 'Jadwal halaqah krusial, mohon tetap hadir.');
    if (catatan !== null) {
      storageService.updateStatusIzinGuru(id, 'Ditolak', catatan || 'Ditolak');
      reloadData();
      showToast && showToast(`Permohonan izin ${nama} ditolak.`);
    }
  };

  const pendingList = izinList.filter(i => i.status === 'Perlu Persetujuan');
  const historyList = izinList.filter(i => i.status !== 'Perlu Persetujuan');

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER PERSIS GAMBAR 5 */}
      <div className="sigap-page-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={22} color="#059669" />
            <h1 className="sigap-page-title">Persetujuan Izin Guru</h1>
          </div>
          <p className="sigap-page-subtitle">Kelola pengajuan izin tidak mengajar.</p>
        </div>
      </div>

      {/* 2. SUB-TABS: PERLU PERSETUJUAN (2) & RIWAYAT IZIN */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'perlu' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            padding: '8px 4px 12px 4px',
            fontSize: '13px',
            fontWeight: activeTab === 'perlu' ? 800 : 600,
            color: activeTab === 'perlu' ? '#0f766e' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setActiveTab('perlu')}
        >
          <UserCheck size={16} />
          <span>Perlu Persetujuan</span>
          {pendingList.length > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 800
            }}>
              {pendingList.length}
            </span>
          )}
        </button>

        <button
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'riwayat' ? '2.5px solid #0d9488' : '2.5px solid transparent',
            padding: '8px 4px 12px 4px',
            fontSize: '13px',
            fontWeight: activeTab === 'riwayat' ? 800 : 600,
            color: activeTab === 'riwayat' ? '#0f766e' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={() => setActiveTab('riwayat')}
        >
          <History size={16} />
          <span>Riwayat Izin</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>({historyList.length})</span>
        </button>
      </div>

      {/* 3. LIST KARTU PERSETUJUAN IZIN PERSIS GAMBAR 5 */}
      {activeTab === 'perlu' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingList.length > 0 ? (
            pendingList.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}
              >
                {/* Info Sisi Kiri */}
                <div style={{ flex: 1, minWidth: '320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.nama}
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '8px'
                    }}>
                      <Clock size={12} />
                      <span>{item.tanggal}</span>
                    </span>
                  </div>

                  {/* Dua Kotak: ALASAN & TUGAS SISWA */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '12px' }}>
                    {/* Kotak ALASAN (Pink) */}
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '10px',
                      padding: '10px 14px'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        ALASAN
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                        {item.alasan}
                      </div>
                    </div>

                    {/* Kotak TUGAS SISWA (Blue) */}
                    <div style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '10px 14px'
                    }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        TUGAS SISWA
                      </div>
                      <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>
                        {item.tugasSiswa}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Kanan: Setujui & Tolak */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => handleSetujui(item.id, item.nama)}
                  >
                    <UserCheck size={16} />
                    <span>Setujui</span>
                  </button>

                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 18px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => handleTolak(item.id, item.nama)}
                  >
                    <UserX size={16} />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '40px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Semua Pengajuan Telah Diproses</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Tidak ada pengajuan izin guru yang menunggu persetujuan.</div>
            </div>
          )}
        </div>
      ) : (
        /* RIWAYAT IZIN */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historyList.length > 0 ? (
            historyList.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>{item.nama}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {item.tanggal} • <span style={{ fontStyle: 'italic' }}>{item.alasan}</span>
                  </div>
                </div>

                <div>
                  <span style={{
                    background: item.status === 'Disetujui' ? '#ecfdf5' : '#fef2f2',
                    color: item.status === 'Disetujui' ? '#059669' : '#dc2626',
                    border: `1px solid ${item.status === 'Disetujui' ? '#a7f3d0' : '#fecdd3'}`,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
              Belum ada riwayat izin yang diproses.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
