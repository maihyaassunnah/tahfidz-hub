import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Calendar, 
  Settings, 
  RotateCw,
  Sparkles,
  Search,
  Filter,
  Download,
  Share2,
  AlertTriangle,
  AlertCircle,
  X,
  Eye,
  Edit3,
  MapPin,
  ShieldCheck,
  FileText,
  Check,
  ChevronRight,
  Bell,
  Sun,
  Sunrise,
  CloudSun,
  Moon,
  Flame,
  Timer,
  CheckCheck
} from 'lucide-react';
import { storageService } from '../../services/storage';
import CustomSelect from '../common/CustomSelect';

export default function DashboardSigapView({ setActiveTab, showToast }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [monitoringData, setMonitoringData] = useState(() => storageService.getSigapMonitoring());
  const [izinList, setIzinList] = useState(() => storageService.getSigapIzinGuru());
  const [pengampuPresensiList, setPengampuPresensiList] = useState(() => storageService.getPengampuPresensiList());
  const [allPengampu, setAllPengampu] = useState(() => storageService.getAllUniquePengampu('ALL'));
  const [sesiList, setSesiList] = useState(() => storageService.getSesi());

  const [totalSetoran, setTotalSetoran] = useState(() => {
    return (storageService.getAllSetoranRaw ? storageService.getAllSetoranRaw().length : (storageService.getSetoran('ALL') || []).length) || 0;
  });

  const siswaList = storageService.getSigapSiswa();
  const guruList = storageService.getSigapGuru();

  // State Filter Presensi Pengampu (Filter Sesi: 'aktif' [default], 'subuh', 'pagi', 'ashar', 'malam', 'semua')
  const [sesiFilter, setSesiFilter] = useState('aktif');
  const [activeStatusFilter, setActiveStatusFilter] = useState('semua'); // 'semua', 'sudah', 'tepat-waktu', 'terlambat', 'belum', 'izin', 'alpa'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (default Monitor Presensi) | 'table'

  // State Modal Detail & Koreksi
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editStatusForm, setEditStatusForm] = useState({
    status: 'Tepat Waktu',
    keterangan: '',
    selisihMenit: 0
  });

  // Timer Real-Time Berjalan Setiap Detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const reloadData = () => {
    setMonitoringData(storageService.getSigapMonitoring());
    setIzinList(storageService.getSigapIzinGuru());
    setPengampuPresensiList(storageService.getPengampuPresensiList());
    setAllPengampu(storageService.getAllUniquePengampu('ALL'));
    setSesiList(storageService.getSesi());
    setTotalSetoran((storageService.getAllSetoranRaw ? storageService.getAllSetoranRaw().length : (storageService.getSetoran('ALL') || []).length) || 0);
  };

  // Real-time listener saat ada izin diajukan oleh pengampu atau presensi diupdate
  useEffect(() => {
    const handleUpdate = () => {
      reloadData();
    };
    window.addEventListener('sigap_izin_updated', handleUpdate);
    window.addEventListener('sigap_admin_notif_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sigap_izin_updated', handleUpdate);
      window.removeEventListener('sigap_admin_notif_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      reloadData();
      setIsRefreshing(false);
      showToast && showToast("Data Dashboard & Presensi Seluruh Pengampu diperbarui!");
    }, 400);
  };

  // Hitung jumlah izin yang pending (memerlukan persetujuan admin)
  const pendingIzinList = (izinList || []).filter(i => 
    i.status === 'Perlu Persetujuan' || 
    i.status === 'Menunggu' || 
    i.status === 'Menunggu Persetujuan'
  );
  const pendingIzinCount = pendingIzinList.length;

  // =========================================================================
  // DETEKSI SESI AKTIF SAAT INI (REAL-TIME DETECTION)
  // =========================================================================
  const detectActiveSession = () => {
    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    const list = sesiList || [];
    
    // 1. Cek apakah ada sesi yang sedang berlangsung saat ini
    for (const s of list) {
      const [bukaH, bukaM] = (s.bukaScan || s.jamMulai || s.mulai || '05:00').split(':').map(Number);
      const [endH, endM] = (s.jamSelesai || s.selesai || '06:30').split(':').map(Number);
      const bMin = bukaH * 60 + bukaM;
      const eMin = endH * 60 + endM;
      if (nowMin >= bMin && nowMin <= eMin) {
        return { ...s, isCurrentlyRunning: true };
      }
    }

    // 2. Jika di luar jam sesi, cari sesi berikutnya atau yang paling relevan hari ini
    if (nowMin < 7 * 60) return { ...(list.find(s => s.id === 'subuh') || list[0]), isCurrentlyRunning: false };
    if (nowMin < 12 * 60) return { ...(list.find(s => s.id === 'pagi') || list[1] || list[0]), isCurrentlyRunning: false };
    if (nowMin < 17 * 60 + 30) return { ...(list.find(s => s.id === 'ashar') || list[2] || list[0]), isCurrentlyRunning: false };
    return { ...(list.find(s => s.id === 'malam') || list[3] || list[0]), isCurrentlyRunning: false };
  };

  const activeDetectedSession = detectActiveSession();

  // =========================================================================
  // ATURAN STATUS PRESENSI PENGAMPU SESUAI SPESIFIKASI USER:
  // 1. SUDAH: Jika sudah absen -> Hadir (Tepat Waktu / Terlambat)
  // 2. IJIN: Jika ada pengajuan izin resmi yang disetujui / aktif
  // 3. BELUM: Jika belum absen dan waktu sekarang belum melewati batas absensi
  // 4. ALPA: JIKA SUDAH LEWAT BATAS ABSENSI NYA MAKA OTOMATIS ALPA
  // =========================================================================
  const evaluatePengampuAttendance = (p, sesi) => {
    const todayISO = currentTime.toISOString().split('T')[0];
    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();

    const [startH, startM] = (sesi.mulai || sesi.jamMulai || '05:00').split(':').map(Number);
    const [endH, endM] = (sesi.selesai || sesi.jamSelesai || '06:30').split(':').map(Number);
    const [batasH, batasM] = (sesi.batasScan || '05:30').split(':').map(Number);
    const [bukaH, bukaM] = (sesi.bukaScan || '04:45').split(':').map(Number);

    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const batasMin = batasH * 60 + batasM;
    const bukaMin = bukaH * 60 + bukaM;

    const isLewatBatas = nowMin > batasMin;
    const isSessionStarted = nowMin >= bukaMin;
    const cleanPName = storageService._cleanName(p.nama);

    // 1. Cek Kehadiran (SUDAH) di PENGAMPU_PRESENSI & liveFeed
    const pRecord = (pengampuPresensiList || []).find(r => 
      r.tanggal === todayISO &&
      (storageService._cleanName(r.namaGuru) === cleanPName || r.pengampuId === p.id) &&
      (r.sesiId === sesi.id || (r.sesiNama || '').toLowerCase().includes(sesi.id) || (r.sesiNama || '').toLowerCase().includes((sesi.nama || '').toLowerCase()))
    );

    const feedRecord = (monitoringData.liveFeed || []).find(f => 
      (storageService._cleanName(f.nama) === cleanPName || f.pengampuId === p.id) &&
      (f.tanggal === todayISO || !f.tanggal) &&
      ((f.sesi || '').toLowerCase().includes(sesi.id) || (f.sesi || '').toLowerCase().includes((sesi.nama || '').toLowerCase()))
    );

    const matchedScan = pRecord || feedRecord;
    const isExplicitAlpa = matchedScan && (matchedScan.status === 'Alpa' || matchedScan.status === 'Alfa');
    const hasValidScan = matchedScan && !isExplicitAlpa && (
      matchedScan.status === 'Sudah' || 
      matchedScan.status === 'Tepat Waktu' || 
      matchedScan.status === 'Terlambat' || 
      (matchedScan.jamScan && matchedScan.jamScan !== '-') || 
      (matchedScan.jam && matchedScan.jam !== '-')
    );

    if (hasValidScan) {
      const isLate = matchedScan.status === 'Terlambat' || 
                     (matchedScan.selisihMenit > 0) || 
                     (matchedScan.keterangan || '').toLowerCase().includes('telat');
      const selisih = matchedScan.selisihMenit || 0;
      const jamScan = matchedScan.jamScan || matchedScan.jam || '-';
      return {
        statusKey: 'SUDAH',
        type: 'sudah',
        subType: isLate ? 'terlambat' : 'tepat-waktu',
        badge: isLate ? `✓ SUDAH (Telat ${selisih}m)` : '✓ SUDAH (Tepat Waktu)',
        badgeMobile: isLate ? `✓ Telat ${selisih}m` : '✓ SUDAH',
        badgeClass: isLate ? 'badge-status-late' : 'badge-status-ontime',
        label: 'Sudah Absen',
        keterangan: matchedScan.keterangan || (isLate ? `Hadir Terlambat ${selisih} Menit` : 'Hadir Tepat Waktu'),
        jamScan: jamScan,
        selisihMenit: selisih,
        borderAccent: isLate ? '#f97316' : '#10b981',
        avatarBg: isLate ? '#ffedd5' : '#dcfce7',
        avatarColor: isLate ? '#c2410c' : '#15803d',
        metode: matchedScan.metode || 'QR Scan GPS',
        scheduleText: `Scan: ${jamScan} WIB `,
        scheduleSubText: `(Jadwal: ${sesi.jamMulai || sesi.mulai} - ${sesi.jamSelesai || sesi.selesai})`,
        scheduleColor: isLate ? '#c2410c' : '#047857'
      };
    }

    // 2. Cek Izin Resmi (IJIN)
    const activeIzin = (izinList || []).find(i => {
      const cleanIName = storageService._cleanName(i.nama);
      const nameMatch = cleanIName === cleanPName || i.guruId === p.id;
      if (!nameMatch) return false;
      const statusValid = i.status === 'Disetujui' || i.status === 'Perlu Persetujuan' || i.status === 'Menunggu' || !i.status;
      if (!statusValid) return false;
      const sesiMatch = !i.sesi || 
                        i.sesi.toLowerCase().includes('semua') || 
                        i.sesi.toLowerCase().includes('hari ini') || 
                        i.sesi.toLowerCase().includes(sesi.id) || 
                        i.sesi.toLowerCase().includes((sesi.nama || '').toLowerCase());
      return sesiMatch;
    });

    if (activeIzin || (matchedScan && matchedScan.status === 'Izin')) {
      const iSource = activeIzin || matchedScan;
      const ketIzin = iSource.keterangan || (iSource.alasan ? `Izin: ${iSource.alasan}` : (iSource.jenisIzin ? `Izin ${iSource.jenisIzin}` : 'Izin Resmi Disetujui'));
      const badalText = iSource.guruBadal ? ` (Badal: ${iSource.guruBadal})` : '';
      return {
        statusKey: 'IJIN',
        type: 'izin',
        subType: 'izin',
        badge: '📋 IJIN',
        badgeMobile: '📋 IJIN',
        badgeClass: 'badge-status-izin',
        label: 'Izin',
        keterangan: ketIzin + badalText,
        jamScan: '-',
        selisihMenit: 0,
        borderAccent: '#3b82f6',
        avatarBg: '#dbeafe',
        avatarColor: '#1d4ed8',
        metode: 'Surat Permohonan',
        scheduleText: `Jadwal: ${sesi.jamMulai || sesi.mulai} - ${sesi.jamSelesai || sesi.selesai} • `,
        scheduleHighlight: 'Izin Resmi',
        scheduleHighlightColor: '#2563eb'
      };
    }

    // 3 & 4. BELUM SCAN:
    // JIKA SUDAH LEWAT BATAS ABSENSI NYA MAKA OTOMATIS ALPA!
    if (isLewatBatas || isExplicitAlpa) {
      return {
        statusKey: 'ALPA',
        type: 'alpa',
        subType: 'alpa',
        badge: '✗ ALPA',
        badgeMobile: '✗ ALPA',
        badgeClass: 'badge-status-alpa',
        label: 'Otomatis Alpa',
        keterangan: (matchedScan && matchedScan.keterangan && isExplicitAlpa)
          ? matchedScan.keterangan
          : `Otomatis Alpa (Melewati Batas Waktu ${sesi.batasScan || '05:30'} WIB)`,
        jamScan: '-',
        selisihMenit: 0,
        borderAccent: '#ef4444',
        avatarBg: '#fee2e2',
        avatarColor: '#b91c1c',
        metode: 'Sistem Otomatis',
        scheduleText: `Batas: ${sesi.batasScan || '-'} WIB • `,
        scheduleHighlight: 'Otomatis Alpa (Lewat Batas)',
        scheduleHighlightColor: '#dc2626'
      };
    }

    // JIKA BELUM LEWAT BATAS ABSENSI NYA -> STATUS: BELUM
    return {
      statusKey: 'BELUM',
      type: 'belum',
      subType: 'belum',
      badge: '○ BELUM',
      badgeMobile: '○ BELUM',
      badgeClass: 'badge-status-pending',
      label: 'Belum Absen',
      keterangan: isSessionStarted 
        ? `Belum Absen (Batas Waktu: ${sesi.batasScan} WIB)`
        : `Menunggu Jadwal Sesi (${sesi.jamMulai || sesi.mulai} - ${sesi.jamSelesai || sesi.selesai} WIB)`,
      jamScan: '-',
      selisihMenit: 0,
      borderAccent: '#94a3b8',
      avatarBg: '#f1f5f9',
      avatarColor: '#475569',
      metode: 'Menunggu Scan QR',
      scheduleText: `Batas: ${sesi.batasScan} WIB • `,
      scheduleHighlight: isSessionStarted ? 'Belum Presensi' : 'Menunggu Sesi',
      scheduleHighlightColor: '#64748b'
    };
  };

  // Sesi yang akan dievaluasi dan ditampilkan
  const sessionsToDisplay = useMemo(() => {
    if (sesiFilter === 'semua') return sesiList || [];
    if (sesiFilter === 'aktif') return activeDetectedSession ? [activeDetectedSession] : (sesiList || []).slice(0, 1);
    const found = (sesiList || []).find(s => s.id === sesiFilter || (s.nama || '').toLowerCase().includes(sesiFilter.toLowerCase()));
    return found ? [found] : ((sesiList || []).slice(0, 1));
  }, [sesiFilter, sesiList, activeDetectedSession]);

  // Evaluasi SEMUA PENGAMPU untuk sesi yang ditampilkan
  const allEvaluatedItems = useMemo(() => {
    const list = [];
    sessionsToDisplay.forEach(sesi => {
      (allPengampu || []).forEach(p => {
        const evaluation = evaluatePengampuAttendance(p, sesi);
        list.push({
          id: `${p.id}-${sesi.id}`,
          pengampuId: p.id,
          nama: p.nama,
          nip: p.nip || 'NON-NIP',
          role: p.role || 'Pengampu Halaqoh',
          email: p.email,
          noHp: p.noHp,
          mapel: p.halaqah || ('Halaqah ' + p.nama),
          kelas: p.kelas || 'Masjid Pusat PPIAS',
          sesi: sesi.nama,
          sesiId: sesi.id,
          jadwal: `${sesi.jamMulai || sesi.mulai} - ${sesi.jamSelesai || sesi.selesai}`,
          bukaScan: sesi.bukaScan,
          batasScan: sesi.batasScan,
          toleransiMenit: sesi.toleransiMenit || 15,
          evaluation: evaluation
        });
      });
    });
    return list;
  }, [sessionsToDisplay, allPengampu, pengampuPresensiList, monitoringData, izinList, currentTime]);

  // Perhitungan KPI Presensi Keseluruhan untuk Sesi Terpilih
  const countTotal = allEvaluatedItems.length;
  const countSudah = allEvaluatedItems.filter(item => item.evaluation.statusKey === 'SUDAH').length;
  const countOntime = allEvaluatedItems.filter(item => item.evaluation.subType === 'tepat-waktu').length;
  const countLate = allEvaluatedItems.filter(item => item.evaluation.subType === 'terlambat').length;
  const countIjin = allEvaluatedItems.filter(item => item.evaluation.statusKey === 'IJIN').length;
  const countBelum = allEvaluatedItems.filter(item => item.evaluation.statusKey === 'BELUM').length;
  const countAlpa = allEvaluatedItems.filter(item => item.evaluation.statusKey === 'ALPA').length;

  // Filter Data (Filter Status Presensi & Search Term)
  const filteredFeed = useMemo(() => {
    return allEvaluatedItems.filter(item => {
      // 1. Filter Status Presensi
      if (activeStatusFilter === 'sudah' && item.evaluation.statusKey !== 'SUDAH') return false;
      if (activeStatusFilter === 'tepat-waktu' && item.evaluation.subType !== 'tepat-waktu') return false;
      if (activeStatusFilter === 'terlambat' && item.evaluation.subType !== 'terlambat') return false;
      if (activeStatusFilter === 'belum' && item.evaluation.statusKey !== 'BELUM') return false;
      if (activeStatusFilter === 'izin' && item.evaluation.statusKey !== 'IJIN') return false;
      if (activeStatusFilter === 'alpa' && item.evaluation.statusKey !== 'ALPA') return false;

      // 2. Filter Search Keyword
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchNama = (item.nama || '').toLowerCase().includes(q);
        const matchNip = (item.nip || '').toLowerCase().includes(q);
        const matchMapel = (item.mapel || '').toLowerCase().includes(q);
        const matchKelas = (item.kelas || '').toLowerCase().includes(q);
        const matchSesi = (item.sesi || '').toLowerCase().includes(q);
        const matchKet = (item.evaluation.keterangan || '').toLowerCase().includes(q);
        if (!matchNama && !matchNip && !matchMapel && !matchKelas && !matchSesi && !matchKet) {
          return false;
        }
      }

      return true;
    });
  }, [allEvaluatedItems, activeStatusFilter, searchTerm]);

  // Export CSV Detail Sesuai Data Lengkap Pengampu
  const handleExportCSV = () => {
    const headers = [
      "No", "Nama Pengampu", "NIP", "Peran", "Sesi Halaqah", 
      "Halaqah Bimbingan", "Kelas / Lokasi", "Jadwal", "Batas Akhir Scan", 
      "Jam Scan", "Status Absensi", "Keterangan", "Selisih Menit", "Metode"
    ];
    const rows = filteredFeed.map((item, i) => [
      i + 1,
      `"${item.nama || ''}"`,
      `"${item.nip || '-'}"`,
      `"${item.role || 'Pengampu'}"`,
      `"${item.sesi || '-'}"`,
      `"${item.mapel || '-'}"`,
      `"${item.kelas || '-'}"`,
      `"${item.jadwal || '-'}"`,
      `"${item.batasScan || '-'}"`,
      `"${item.evaluation.jamScan || '-'}"`,
      `"${item.evaluation.statusKey || '-'}"`,
      `"${item.evaluation.keterangan || '-'}"`,
      item.evaluation.selisihMenit || 0,
      `"${item.evaluation.metode || '-'}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Presensi_Pengampu_${sesiFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast && showToast("Data presensi seluruh pengampu berhasil diekspor ke CSV!");
  };

  // Kirim Rekap Kehadiran Pengampu via WhatsApp
  const handleShareWA = () => {
    const todayStr = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(':', '.') + ' WIB';
    
    let text = `*LAPORAN KEHADIRAN PENGAMPU HALAQAH TAHFIDZ*%0A`;
    text += `*MA IHYA AS-SUNNAH TASIKMALAYA*%0A`;
    text += `*Hari / Tanggal:* ${todayStr}%0A`;
    text += `*Waktu Pelaporan:* ${timeStr}%0A`;
    text += `*Sesi Halaqah:* ${sesiFilter === 'semua' ? 'Semua Sesi Terjadwal' : (sessionsToDisplay[0]?.nama || 'Sesi Terjadwal')}%0A`;
    if (sessionsToDisplay.length === 1) {
      text += `*Batas Akhir Scan:* ${sessionsToDisplay[0]?.batasScan || '-'} WIB%0A`;
    }
    text += `---------------------------------------%0A`;
    text += `*RINGKASAN KEHADIRAN PENGAMPU:*%0A`;
    text += `• Total Pengampu: ${countTotal} orang%0A`;
    text += `• Sudah Presensi: ${countSudah} orang (${countOntime} Tepat Waktu, ${countLate} Telat)%0A`;
    text += `• Izin / Sakit: ${countIjin} orang%0A`;
    text += `• Belum Absen: ${countBelum} orang%0A`;
    text += `• Otomatis ALPA: ${countAlpa} orang (Lewat batas)%0A`;
    text += `---------------------------------------%0A`;

    // Rincian Alpa
    const alpaItems = allEvaluatedItems.filter(i => i.evaluation.statusKey === 'ALPA');
    if (alpaItems.length > 0) {
      text += `*DAFTAR PENGAMPU ALPA (LEWAT BATAS):*%0A`;
      alpaItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.nama} - *ALPA* (${item.sesi})%0A`;
      });
      text += `---------------------------------------%0A`;
    }

    // Rincian Keterlambatan
    const lateItems = allEvaluatedItems.filter(i => i.evaluation.subType === 'terlambat');
    if (lateItems.length > 0) {
      text += `*DAFTAR TERLAMBAT:*%0A`;
      lateItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.nama} - Telat ${item.evaluation.selisihMenit}m (Scan ${item.evaluation.jamScan} WIB)%0A`;
      });
      text += `---------------------------------------%0A`;
    }

    // Rincian Izin
    const izinItems = allEvaluatedItems.filter(i => i.evaluation.statusKey === 'IJIN');
    if (izinItems.length > 0) {
      text += `*DAFTAR IZIN RESMI:*%0A`;
      izinItems.forEach((item, idx) => {
        text += `${idx + 1}. ${item.nama} - ${item.evaluation.keterangan}%0A`;
      });
      text += `---------------------------------------%0A`;
    }

    text += `_Diperbarui otomatis secara real-time oleh Sistem Tahfidz HUB MA Ihya As-Sunnah_`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Handle Edit / Koreksi Status Presensi Pengampu oleh Super Admin
  const handleOpenKoreksi = (item) => {
    setEditingItem(item);
    const ev = item.evaluation;
    let initialStatus = 'Tepat Waktu';
    if (ev.statusKey === 'SUDAH') {
      initialStatus = ev.subType === 'terlambat' ? 'Terlambat' : 'Tepat Waktu';
    } else if (ev.statusKey === 'IJIN') {
      initialStatus = 'Izin';
    } else if (ev.statusKey === 'ALPA') {
      initialStatus = 'Alpa';
    } else {
      initialStatus = 'Belum Absen';
    }

    setEditStatusForm({
      status: initialStatus,
      keterangan: ev.keterangan || '',
      selisihMenit: ev.selisihMenit || 0
    });
  };

  const handleSaveKoreksi = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    let ket = editStatusForm.keterangan;
    if (editStatusForm.status === 'Terlambat' && !ket) {
      ket = `Telat ${editStatusForm.selisihMenit || 5} Menit`;
    } else if (editStatusForm.status === 'Tepat Waktu' && !ket) {
      ket = 'Tepat Waktu (Koreksi Admin)';
    } else if (editStatusForm.status === 'Alpa' && !ket) {
      ket = `Alpa: Melewati batas waktu presensi (${editingItem.batasScan || '05:30'} WIB)`;
    } else if (editStatusForm.status === 'Izin' && !ket) {
      ket = 'Izin Resmi Disetujui';
    } else if (editStatusForm.status === 'Belum Absen' && !ket) {
      ket = `Belum Absen (Batas Waktu: ${editingItem.batasScan || '05:30'} WIB)`;
    }

    const todayISO = currentTime.toISOString().split('T')[0];

    storageService.updateStatusPresensiPengampu(
      editingItem.pengampuId || editingItem.id,
      editStatusForm.status,
      ket,
      parseInt(editStatusForm.selisihMenit, 10) || 0,
      {
        pengampuId: editingItem.pengampuId || editingItem.id,
        nama: editingItem.nama,
        nip: editingItem.nip,
        role: editingItem.role,
        sesi: editingItem.sesi,
        sesiId: editingItem.sesiId,
        mapel: editingItem.mapel,
        kelas: editingItem.kelas,
        jadwal: editingItem.jadwal,
        tanggal: todayISO
      }
    );

    reloadData();
    setEditingItem(null);
    showToast && showToast(`Status presensi ${editingItem.nama} berhasil diperbarui!`);
  };

  return (
    <div className="page-content-wrapper" style={{ animation: 'fadeIn 0.25s ease-out' }}>
      {/* 1. HEADER DASHBOARD PERSIS GAMBAR 1 */}
      <div className="sigap-dash-header-row">
        <div>
          <h1 className="sigap-dash-title">Dashboard MA IHYA' AS-SUNNAH</h1>
          <p className="sigap-dash-subtitle">Manajemen data dan monitoring KBM.</p>
        </div>

        <div className="sigap-dash-actions">
          {/* Tombol Refresh Biru */}
          <button 
            className="sigap-btn-icon-refresh" 
            onClick={handleRefresh}
            title="Muat Ulang Data"
          >
            <RotateCw size={16} className={isRefreshing ? 'spin-anim' : ''} />
          </button>

          {/* Tombol Konfigurasi */}
          <button 
            className="sigap-btn-konfigurasi"
            onClick={() => setActiveTab('sigap-konfigurasi')}
          >
            <Settings size={15} />
            <span>Konfigurasi</span>
          </button>
        </div>
      </div>

      {/* BANNER NOTIFIKASI IZIN PENGAMPU UNTUK SUPER ADMIN */}
      {pendingIzinCount > 0 && (
        <div 
          className="sigap-admin-alert-banner"
          onClick={() => setActiveTab('sigap-izin')}
          title="Klik untuk membuka persetujuan izin pengampu"
        >
          <div className="sigap-alert-banner-content">
            <div className="sigap-alert-bell-wrap">
              <Bell size={18} className="sigap-alert-bell-icon" />
              <span className="sigap-alert-bell-ping"></span>
            </div>
            <div className="sigap-alert-text">
              <span className="sigap-alert-highlight">Notifikasi Izin Pengampu ({pendingIzinCount}):</span>{' '}
              {pendingIzinList[0]?.nama || 'Pengampu'} mengajukan izin {pendingIzinList[0]?.jenisIzin ? `[${pendingIzinList[0].jenisIzin}]` : ''} ({pendingIzinList[0]?.sesi || 'Hari Ini'}).
            </div>
          </div>
          <button 
            className="sigap-alert-btn-tinjau"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('sigap-izin');
            }}
          >
            <span>Tinjau</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* 2. BARIS 1: 4 KARTU METRIK KPI UTAMA (SEBARIS, HANYA IKON & JUMLAH SESUAI DATA RIIL) */}
      <div className="sigap-kpi-grid">
        {/* Total Guru */}
        <div 
          className="sigap-kpi-card" 
          onClick={() => setActiveTab('sigap-guru')} 
          style={{ cursor: 'pointer' }}
          title={`Total Guru: ${guruList.length} orang`}
        >
          <div className="sigap-kpi-icon-box blue">
            <Users size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{guruList.length}</div>
            <div className="sigap-kpi-label">Total Guru</div>
          </div>
        </div>

        {/* Total Siswa */}
        <div 
          className="sigap-kpi-card" 
          onClick={() => setActiveTab('sigap-siswa')} 
          style={{ cursor: 'pointer' }}
          title={`Total Siswa: ${siswaList.length} santri`}
        >
          <div className="sigap-kpi-icon-box green">
            <BookOpen size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{siswaList.length}</div>
            <div className="sigap-kpi-label">Total Siswa</div>
          </div>
        </div>

        {/* Presensi Harian (Pengampu Hari Ini) */}
        <div 
          className="sigap-kpi-card" 
          style={{ cursor: 'pointer', border: '1.5px solid #fdba74' }}
          onClick={() => {
            const el = document.getElementById('panel-presensi-pengampu');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          title={`Presensi Pengampu: ${countSudah} dari ${countTotal} hadir`}
        >
          <div className="sigap-kpi-icon-box orange">
            <Clock size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{countSudah}</div>
            <div className="sigap-kpi-label">Presensi Harian</div>
          </div>
        </div>

        {/* Jumlah Setoran Santri (Menggantikan Jurnal Masuk Sesuai Permintaan) */}
        <div 
          className="sigap-kpi-card"
          onClick={() => setActiveTab('setoran')}
          style={{ cursor: 'pointer' }}
          title={`Jumlah Setoran Santri: ${totalSetoran} riwayat`}
        >
          <div className="sigap-kpi-icon-box purple">
            <Sparkles size={20} />
          </div>
          <div className="sigap-kpi-content">
            <div className="sigap-kpi-val">{totalSetoran}</div>
            <div className="sigap-kpi-label">Setoran Santri</div>
          </div>
        </div>
      </div>

      {/* 3. BARIS 2: 4 KARTU AKSI CEPAT / QUICK ACTIONS (SEBARIS) */}
      <div className="sigap-action-grid">
        {/* Card 1: Approval Izin (dengan lencana merah notifikasi dinamis) */}
        <div 
          className="sigap-action-card relative" 
          onClick={() => setActiveTab('sigap-izin')}
          title={pendingIzinCount > 0 ? `${pendingIzinCount} permohonan izin menunggu persetujuan` : 'Approval Izin Pengampu'}
        >
          {pendingIzinCount > 0 && (
            <div className="sigap-red-badge-corner pulse-badge">
              {pendingIzinCount}
            </div>
          )}
          <div className="sigap-action-circle-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="sigap-action-label">Approval Izin</div>
        </div>

        {/* Card 2: Kelola Guru (highlight border toska persis screenshot) */}
        <div 
          className="sigap-action-card active-border" 
          onClick={() => setActiveTab('sigap-guru')}
        >
          <div className="sigap-action-circle-icon blue">
            <Users size={22} />
          </div>
          <div className="sigap-action-label">Kelola Guru</div>
        </div>

        {/* Card 3: Lokasi & QR */}
        <div 
          className="sigap-action-card" 
          onClick={() => setActiveTab('sigap-lokasi-qr')}
        >
          <div className="sigap-action-circle-icon purple">
            <Clock size={22} />
          </div>
          <div className="sigap-action-label">Lokasi & QR</div>
        </div>

        {/* Card 4: Atur Jadwal */}
        <div 
          className="sigap-action-card" 
          onClick={() => setActiveTab('sigap-jadwal')}
        >
          <div className="sigap-action-circle-icon orange">
            <Calendar size={22} />
          </div>
          <div className="sigap-action-label">Atur Jadwal</div>
        </div>
      </div>

      {/* 4. BARIS 3: PANEL MONITORING PRESENSI PENGAMPU HARI INI */}
      <div className="sigap-presensi-panel" id="panel-presensi-pengampu">
        {/* Header Panel (Judul & Keterangan Gambar 4 & 5 Disembunyikan di Mobile) */}
        <div className="sigap-presensi-header">
          <div className="sigap-mobile-hide">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Monitoring Presensi Seluruh Pengampu Halaqah
              </h2>
              <span style={{
                background: '#ecfdf5',
                color: '#047857',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 9px',
                borderRadius: '6px',
                border: '1px solid #a7f3d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Real-Time
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Daftar seluruh ustadz pengampu halaqah tahfidz terjadwal beserta status absensi hari ini (Sudah, Belum, Izin). Jika waktu telah melewati batas absensi, pengampu yang belum absen otomatis tercatat <b>ALPA</b>.
            </p>
          </div>

          {/* Action Buttons: Kirim WA & Export CSV */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="sigap-btn-green"
              onClick={handleShareWA}
              title="Kirim ringkasan laporan presensi ke WhatsApp"
            >
              <Share2 size={13} style={{ marginRight: '4px' }} />
              <span>Rekap WA</span>
            </button>

            <button 
              className="sigap-btn-blue"
              onClick={handleExportCSV}
              title="Download rekapan kehadiran dalam format CSV"
            >
              <Download size={13} style={{ marginRight: '4px' }} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            NAVIGASI TAB SESI HALAQAH & JAM REAL-TIME WIB
            ========================================================================= */}
        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Baris 1: Tab Pilihan Sesi & Jam Digital */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            {/* Quick Session Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                <Clock size={14} color="#0d9488" />
                <span>Pilih Sesi:</span>
              </span>

              {/* Tab 1: Sesi Aktif Saat Ini */}
              <button
                type="button"
                className={`sigap-tab-pill ${sesiFilter === 'aktif' ? 'active' : ''}`}
                onClick={() => setSesiFilter('aktif')}
                style={{
                  fontSize: '11.5px',
                  padding: '5px 12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: sesiFilter === 'aktif' ? '#0d9488' : '#ffffff',
                  color: sesiFilter === 'aktif' ? '#ffffff' : '#0f766e',
                  borderColor: sesiFilter === 'aktif' ? '#0f766e' : '#ccfbf1'
                }}
                title="Menampilkan sesi yang sedang aktif atau terjadwal saat ini"
              >
                <Flame size={13} color={sesiFilter === 'aktif' ? '#fef08a' : '#ea580c'} />
                <span>Sesi Aktif: {activeDetectedSession?.nama || "Ba'da Subuh"}</span>
                {activeDetectedSession?.isCurrentlyRunning && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: sesiFilter === 'aktif' ? '#fef08a' : '#10b981',
                    boxShadow: '0 0 6px #10b981'
                  }}></span>
                )}
              </button>

              {/* Tab 2: Ba'da Subuh */}
              <button
                type="button"
                className={`sigap-tab-pill ${sesiFilter === 'subuh' ? 'active' : ''}`}
                onClick={() => setSesiFilter('subuh')}
                style={{ fontSize: '11.5px', padding: '5px 11px', fontWeight: 700 }}
              >
                <Sunrise size={13} style={{ marginRight: '4px', display: 'inline' }} />
                <span>Ba'da Subuh</span>
              </button>

              {/* Tab 3: Pagi / Dhuha */}
              <button
                type="button"
                className={`sigap-tab-pill ${sesiFilter === 'pagi' ? 'active' : ''}`}
                onClick={() => setSesiFilter('pagi')}
                style={{ fontSize: '11.5px', padding: '5px 11px', fontWeight: 700 }}
              >
                <Sun size={13} style={{ marginRight: '4px', display: 'inline' }} />
                <span>Pagi / Dhuha</span>
              </button>

              {/* Tab 4: Ba'da Ashar */}
              <button
                type="button"
                className={`sigap-tab-pill ${sesiFilter === 'ashar' ? 'active' : ''}`}
                onClick={() => setSesiFilter('ashar')}
                style={{ fontSize: '11.5px', padding: '5px 11px', fontWeight: 700 }}
              >
                <CloudSun size={13} style={{ marginRight: '4px', display: 'inline' }} />
                <span>Ba'da Ashar</span>
              </button>

              {/* Tab 5: Ba'da Maghrib */}
              <button
                type="button"
                className={`sigap-tab-pill ${sesiFilter === 'malam' ? 'active' : ''}`}
                onClick={() => setSesiFilter('malam')}
                style={{ fontSize: '11.5px', padding: '5px 11px', fontWeight: 700 }}
              >
                <Moon size={13} style={{ marginRight: '4px', display: 'inline' }} />
                <span>Ba'da Maghrib</span>
              </button>

              {/* Tab 6: Semua Sesi */}
              <button
                type="button"
                className={`sigap-tab-pill ${sesiFilter === 'semua' ? 'active' : ''}`}
                onClick={() => setSesiFilter('semua')}
                style={{ fontSize: '11.5px', padding: '5px 11px', fontWeight: 700 }}
              >
                <span>Semua Sesi</span>
              </button>
            </div>

            {/* Jam Digital Real-Time WIB */}
            <div style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '6px 14px',
              borderRadius: '10px',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Timer size={14} color="#38bdf8" />
              <span>
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.')} WIB
              </span>
              <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'sans-serif', fontWeight: 600 }}>
                ({currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })})
              </span>
            </div>
          </div>

          {/* Baris 2: Banner Informasi Sesi Terfokus & Peringatan Batas Absensi */}
          {sessionsToDisplay.length === 1 && (() => {
            const curSesi = sessionsToDisplay[0];
            const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
            const [startH, startM] = (curSesi.mulai || curSesi.jamMulai || '05:00').split(':').map(Number);
            const [endH, endM] = (curSesi.selesai || curSesi.jamSelesai || '06:30').split(':').map(Number);
            const [batasH, batasM] = (curSesi.batasScan || '05:30').split(':').map(Number);
            const [bukaH, bukaM] = (curSesi.bukaScan || '04:45').split(':').map(Number);

            const startMin = startH * 60 + startM;
            const endMin = endH * 60 + endM;
            const batasMin = batasH * 60 + batasM;
            const bukaMin = bukaH * 60 + bukaM;

            const isLewatBatas = nowMin > batasMin;
            const isCurrentlyRunning = nowMin >= bukaMin && nowMin <= endMin;
            const minutesLeft = batasMin - nowMin;

            return (
              <div style={{
                background: isLewatBatas ? '#fef2f2' : isCurrentlyRunning ? '#ecfdf5' : '#f0fdf4',
                border: `1.5px solid ${isLewatBatas ? '#fecaca' : isCurrentlyRunning ? '#a7f3d0' : '#bbf7d0'}`,
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: isLewatBatas ? '#fee2e2' : isCurrentlyRunning ? '#d1fae5' : '#e0f2fe',
                    color: isLewatBatas ? '#dc2626' : isCurrentlyRunning ? '#059669' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isLewatBatas ? <AlertTriangle size={18} /> : isCurrentlyRunning ? <Flame size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: isLewatBatas ? '#991b1b' : '#065f46' }}>
                      Sesi: {curSesi.nama} ({curSesi.jamMulai || curSesi.mulai} - {curSesi.jamSelesai || curSesi.selesai} WIB)
                    </div>
                    <div style={{ fontSize: '11.5px', color: isLewatBatas ? '#b91c1c' : '#047857', marginTop: '2px', fontWeight: 600 }}>
                      {isLewatBatas ? (
                        <span>
                          ⚠️ <b>Batas Waktu Absensi ({curSesi.batasScan || '05:30'} WIB) Telah Terlewati!</b> Seluruh pengampu yang belum presensi otomatis berstatus <b>ALPA</b>.
                        </span>
                      ) : isCurrentlyRunning ? (
                        <span>
                          🟢 <b>Sesi Sedang Berlangsung!</b> Batas akhir scan presensi pukul <b>{curSesi.batasScan || '05:30'} WIB</b> (Sisa waktu: <b>{minutesLeft > 0 ? `${minutesLeft} menit lagi` : 'Hampir habis'}</b>).
                        </span>
                      ) : (
                        <span>
                          ⚪ Sesi terjadwal pukul {curSesi.jamMulai || curSesi.mulai} - {curSesi.jamSelesai || curSesi.selesai} WIB. Batas scan: <b>{curSesi.batasScan} WIB</b>.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    background: isLewatBatas ? '#dc2626' : isCurrentlyRunning ? '#059669' : '#64748b',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {isLewatBatas ? 'Lewat Batas (Alpa)' : isCurrentlyRunning ? 'Sedang Berlangsung' : 'Terjadwal'}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Mini KPI Counters Bar (1 Baris Ringkas & Singkat Sesuai Permintaan User) */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          padding: '12px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {/* Total */}
          <div 
            onClick={() => setActiveStatusFilter('semua')}
            style={{
              background: activeStatusFilter === 'semua' ? '#f0fdfa' : '#ffffff',
              border: `1px solid ${activeStatusFilter === 'semua' ? '#0d9488' : '#e2e8f0'}`,
              borderLeft: '3px solid #0d9488',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Total Seluruh Pengampu"
          >
            <div style={{ fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f766e', marginTop: '1px' }}>{countTotal}</div>
          </div>

          {/* Sudah */}
          <div 
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'sudah' ? 'semua' : 'sudah')}
            style={{
              background: activeStatusFilter === 'sudah' ? '#ecfdf5' : '#ffffff',
              border: `1px solid ${activeStatusFilter === 'sudah' ? '#10b981' : '#e2e8f0'}`,
              borderLeft: '3px solid #10b981',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Sudah Absen"
          >
            <div style={{ fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Sudah</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#059669', marginTop: '1px' }}>{countSudah}</div>
          </div>

          {/* Belum */}
          <div 
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'belum' ? 'semua' : 'belum')}
            style={{
              background: activeStatusFilter === 'belum' ? '#f1f5f9' : '#ffffff',
              border: `1px solid ${activeStatusFilter === 'belum' ? '#64748b' : '#e2e8f0'}`,
              borderLeft: '3px solid #94a3b8',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Belum Absen"
          >
            <div style={{ fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Belum</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#475569', marginTop: '1px' }}>{countBelum}</div>
          </div>

          {/* Izin */}
          <div 
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'izin' ? 'semua' : 'izin')}
            style={{
              background: activeStatusFilter === 'izin' ? '#eff6ff' : '#ffffff',
              border: `1px solid ${activeStatusFilter === 'izin' ? '#3b82f6' : '#e2e8f0'}`,
              borderLeft: '3px solid #3b82f6',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Izin Resmi"
          >
            <div style={{ fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Izin</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2563eb', marginTop: '1px' }}>{countIjin}</div>
          </div>

          {/* Alpa */}
          <div 
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'alpa' ? 'semua' : 'alpa')}
            style={{
              background: activeStatusFilter === 'alpa' ? '#fef2f2' : '#ffffff',
              border: `1px solid ${activeStatusFilter === 'alpa' ? '#ef4444' : '#e2e8f0'}`,
              borderLeft: '3px solid #ef4444',
              borderRadius: '8px',
              padding: '6px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Alpa (Otomatis)"
          >
            <div style={{ fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Alpa</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#dc2626', marginTop: '1px' }}>{countAlpa}</div>
          </div>
        </div>

        {/* DAFTAR PRESENSI PENGAMPU (RINGKAS & PROFESIONAL: HANYA NAMA & STATUS, TIDAK BOLD) */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredFeed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8' }}>
              <div style={{ fontWeight: 500, fontSize: '13px' }}>Tidak ada data pengampu yang sesuai kriteria.</div>
            </div>
          ) : (
            filteredFeed.map((item) => {
              const ev = item.evaluation;
              const initial = (item.nama || 'G')
                .split(' ')
                .filter(Boolean)
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const getStatusBadge = () => {
                if (ev.statusKey === 'SUDAH') {
                  return {
                    label: ev.subType === 'terlambat' ? `✓ Telat ${ev.selisihMenit}m` : '✓ Hadir',
                    bg: '#ecfdf5',
                    color: '#059669',
                    border: '#a7f3d0'
                  };
                }
                if (ev.statusKey === 'IJIN') {
                  return {
                    label: 'Izin',
                    bg: '#eff6ff',
                    color: '#2563eb',
                    border: '#bfdbfe'
                  };
                }
                if (ev.statusKey === 'BELUM') {
                  return {
                    label: 'Belum Absen',
                    bg: '#f8fafc',
                    color: '#64748b',
                    border: '#e2e8f0'
                  };
                }
                return {
                  label: '✕ ALPA',
                  bg: '#fef2f2',
                  color: '#dc2626',
                  border: '#fecaca'
                };
              };

              const badge = getStatusBadge();

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDetail(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `4px solid ${ev.borderAccent || '#94a3b8'}`,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Klik untuk melihat detail atau koreksi presensi"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      position: 'relative',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: ev.avatarBg || '#f1f5f9',
                      color: ev.avatarColor || '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 500,
                      flexShrink: 0
                    }}>
                      {initial}
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: ev.borderAccent || '#94a3b8',
                        border: '1.5px solid #ffffff'
                      }}></span>
                    </div>

                    <span style={{
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.nama}
                    </span>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`
                    }}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info Panel */}
        <div style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            Menampilkan <b>{filteredFeed.length}</b> dari <b>{countTotal}</b> pengampu pada {sesiFilter === 'semua' ? 'Semua Sesi' : `Sesi ${sessionsToDisplay[0]?.nama || 'Terjadwal'}`} ({currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}).
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Sudah (Hadir): <b>{countSudah}</b>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }}></span>
              Belum Absen: <b>{countBelum}</b>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
              Izin & Sakit: <b>{countIjin}</b>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
              Otomatis Alpa: <b>{countAlpa}</b>
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL DETAIL PRESENSI PENGAMPU
          ========================================================= */}
      {selectedDetail && (
        <div className="sigap-modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="sigap-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="sheet-drag-handle"></div>
            <div className="sigap-modal-header">
              <div>
                <h3 className="sigap-modal-title">Detail Presensi Pengampu</h3>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Rincian catatan kehadiran KBM & Halaqoh</p>
              </div>
              <button className="sigap-modal-close-btn" onClick={() => setSelectedDetail(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Profil Pengampu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: selectedDetail.evaluation?.avatarBg || '#ccfbf1', color: selectedDetail.evaluation?.avatarColor || '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                  {(selectedDetail.nama || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{selectedDetail.nama}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedDetail.role} • NIP: {selectedDetail.nip || '-'}</div>
                </div>
              </div>

              {/* Grid Rincian */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>STATUS KEHADIRAN</div>
                  <div style={{ marginTop: '4px' }}>
                    <span className={selectedDetail.evaluation?.badgeClass} style={{ fontSize: '11px', padding: '3px 9px', fontWeight: 800 }}>
                      {selectedDetail.evaluation?.badge}
                    </span>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>WAKTU SCAN</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {selectedDetail.evaluation?.jamScan && selectedDetail.evaluation?.jamScan !== '-' ? `${selectedDetail.evaluation.jamScan} WIB` : '-'}
                  </div>
                </div>
              </div>

              {/* Rincian Tambahan */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Sesi / Jadwal:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.sesi} ({selectedDetail.jadwal || '-'})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Batas Akhir Scan:</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{selectedDetail.batasScan} WIB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Halaqah Bimbingan:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.mapel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Kelas & Lokasi:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.kelas}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Metode Absensi:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDetail.evaluation?.metode || 'QR Scan GPS'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Keterangan:</span>
                  <span style={{ 
                    fontWeight: 800, 
                    color: selectedDetail.evaluation?.statusKey === 'ALPA' ? '#dc2626' : 
                           selectedDetail.evaluation?.statusKey === 'IJIN' ? '#2563eb' : 
                           selectedDetail.evaluation?.subType === 'terlambat' ? '#c2410c' : '#059669' 
                  }}>
                    {selectedDetail.evaluation?.keterangan}
                  </span>
                </div>
              </div>
            </div>

            <div className="sigap-modal-footer">
              <button 
                type="button" 
                className="sigap-btn-cancel" 
                onClick={() => setSelectedDetail(null)}
              >
                Tutup
              </button>
              <button 
                type="button" 
                className="sigap-btn-submit"
                onClick={() => {
                  const target = selectedDetail;
                  setSelectedDetail(null);
                  handleOpenKoreksi(target);
                }}
              >
                <Edit3 size={14} />
                <span>Koreksi Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL KOREKSI / UBAH STATUS PRESENSI OLEH ADMIN
          ========================================================= */}
      {editingItem && (
        <div className="sigap-modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="sigap-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="sheet-drag-handle"></div>
            <div className="sigap-modal-header">
              <div>
                <h3 className="sigap-modal-title">Koreksi Status Presensi</h3>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Pengampu: {editingItem.nama}</p>
              </div>
              <button className="sigap-modal-close-btn" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveKoreksi}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '5px' }}>
                    STATUS KEHADIRAN
                  </label>
                  <CustomSelect 
                    triggerStyle={{ minHeight: '42px', borderRadius: '12px', fontSize: '13px' }}
                    value={editStatusForm.status}
                    onChange={(e) => {
                      const st = e.target.value;
                      setEditStatusForm(prev => ({
                        ...prev,
                        status: st,
                        keterangan: st === 'Tepat Waktu' ? 'Tepat Waktu (Koreksi Admin)' : 
                                    st === 'Terlambat' ? `Telat ${prev.selisihMenit || 10} Menit` : 
                                    st === 'Alpa' ? 'Alpa (Melewati Batas Waktu Presensi)' :
                                    st === 'Izin' ? 'Izin Resmi' :
                                    st === 'Belum Absen' ? 'Belum Absen (Menunggu Jadwal Sesi Presensi)' : prev.keterangan
                      }));
                    }}
                  >
                    <option value="Tepat Waktu">Hadir - Tepat Waktu</option>
                    <option value="Terlambat">Hadir - Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Belum Absen">Belum Absen</option>
                    <option value="Alpa">Alpa (Melewati Waktu Absen)</option>
                  </CustomSelect>
                </div>

                {editStatusForm.status === 'Terlambat' && (
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '5px' }}>
                      KETERLAMBATAN (MENIT)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="180"
                      className="form-input"
                      value={editStatusForm.selisihMenit}
                      onChange={(e) => {
                        const m = e.target.value;
                        setEditStatusForm(prev => ({
                          ...prev,
                          selisihMenit: m,
                          keterangan: `Telat ${m} Menit`
                        }));
                      }}
                      placeholder="Misal: 15"
                      style={{ fontSize: '13px', padding: '9px 12px' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '5px' }}>
                    KETERANGAN / CATATAN
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    value={editStatusForm.keterangan}
                    onChange={(e) => setEditStatusForm({ ...editStatusForm, keterangan: e.target.value })}
                    placeholder="Misal: Telat 10 Menit / Izin Dinas"
                    style={{ fontSize: '13px', padding: '9px 12px' }}
                  />
                </div>
              </div>

              <div className="sigap-modal-footer">
                <button 
                  type="button" 
                  className="sigap-btn-cancel" 
                  onClick={() => setEditingItem(null)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="sigap-btn-submit"
                >
                  <Check size={14} />
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
