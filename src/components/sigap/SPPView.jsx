import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Filter, 
  Printer, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Users, 
  Calendar, 
  Building2, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Save, 
  FileText,
  TrendingUp,
  Receipt,
  QrCode,
  Share2
} from 'lucide-react';
import { storageService } from '../../services/storage';
import TahfidzHubLogo from '../TahfidzHubLogo';
import CustomSelect from '../common/CustomSelect';
import './SPPView.css';

export default function SPPView({ showToast, activeBranchId }) {
  const [sppList, setSppList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBulan, setSelectedBulan] = useState('September 2026');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCabang, setSelectedCabang] = useState(activeBranchId || 'all');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({});

  // Invoice Modal State
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  // Load Data
  const loadData = () => {
    const list = storageService.getPembayaranSPP({
      cabangId: selectedCabang,
      bulan: selectedBulan,
      status: selectedStatus,
      search: searchQuery
    });
    setSppList(list);
  };

  useEffect(() => {
    if (activeBranchId) {
      setSelectedCabang(activeBranchId === 'ALL' ? 'all' : activeBranchId);
    }
  }, [activeBranchId]);

  useEffect(() => {
    loadData();
  }, [selectedBulan, selectedStatus, selectedCabang, searchQuery]);

  const allSantri = storageService.getSantri();
  const allCabang = storageService.getCabang();

  // Metrics Calculation
  const totalNominalBulanIni = sppList
    .filter(item => item.status === 'Lunas')
    .reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);

  const totalTagihanBulanIni = sppList
    .reduce((acc, curr) => acc + (Number(curr.nominal) || 0), 0);

  const countLunas = sppList.filter(item => item.status === 'Lunas').length;
  const countBelum = sppList.filter(item => item.status !== 'Lunas').length;
  const persentaseLunas = sppList.length > 0 ? Math.round((countLunas / sppList.length) * 100) : 0;

  // Format Currency
  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  // Open Form Modal for Create
  const handleOpenAdd = () => {
    setFormMode('add');
    const firstSantri = allSantri[0] || {};
    setFormData({
      santriId: firstSantri.id || '',
      santriNama: firstSantri.nama || '',
      nis: firstSantri.nis || '',
      kelas: '',
      cabangId: firstSantri.cabangId || 'cabang-pusat',
      wali: firstSantri.wali || 'Wali Santri',
      noHpWali: firstSantri.noHpWali || '',
      bulan: selectedBulan !== 'all' ? selectedBulan : 'September 2026',
      tahun: 2026,
      nominal: 350000,
      status: 'Lunas',
      tanggalBayar: new Date().toISOString().split('T')[0],
      metodeBayar: 'Transfer Bank BSI',
      nomorRef: `BSI-${Math.floor(100000 + Math.random() * 900000)}`,
      catatan: 'Pembayaran SPP Rutin',
      namaPetugas: 'Ustadz Wahyudin (Bendahara)'
    });
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEdit = (item) => {
    setFormMode('edit');
    setFormData({ ...item });
    setIsFormModalOpen(true);
  };

  // Handle Santri Selection in Form Modal
  const handleSelectSantriChange = (santriId) => {
    const s = allSantri.find(item => item.id === santriId);
    if (s) {
      setFormData(prev => ({
        ...prev,
        santriId: s.id,
        santriNama: s.nama,
        nis: s.nis,
        kelas: '',
        cabangId: s.cabangId || 'cabang-pusat',
        wali: s.wali || '',
        noHpWali: s.noHpWali || ''
      }));
    }
  };

  // Save Form Modal
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (formMode === 'add') {
      storageService.addPembayaranSPP(formData);
      if (showToast) showToast(`✅ Pembayaran SPP untuk ${formData.santriNama} berhasil dicatat!`);
    } else {
      storageService.updatePembayaranSPP(formData.id, formData);
      if (showToast) showToast(`✅ Data pembayaran SPP berhasil diperbarui!`);
    }
    setIsFormModalOpen(false);
    loadData();
  };

  // Delete Transaction
  const handleDelete = (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data tagihan/pembayaran SPP ini?")) return;
    storageService.deletePembayaranSPP(id);
    if (showToast) showToast("Data pembayaran SPP telah dihapus.");
    loadData();
  };

  // Generate Monthly Bills for All Students
  const handleGenerateMonthly = () => {
    const count = storageService.generateMonthlySPP(selectedBulan !== 'all' ? selectedBulan : 'September 2026', 2026, 350000);
    if (showToast) {
      showToast(count > 0 
        ? `⚡ Berhasil menerbitkan ${count} tagihan SPP baru untuk ${selectedBulan}!`
        : `ℹ️ Semua santri sudah memiliki tagihan untuk ${selectedBulan}.`
      );
    }
    loadData();
  };

  // Open Invoice Modal
  const handleOpenInvoice = (item) => {
    setSelectedInvoice(item);
    setIsInvoiceOpen(true);
  };

  // Print Invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Send WhatsApp to Parent
  const handleSendWhatsApp = (item) => {
    const santriObj = allSantri.find(s => s.id === (item.santriId || item.santri_id)) || {};
    const noHp = item.noHpWali || santriObj.noHpWali || santriObj.kontak || '';
    const cleanNoHp = noHp.replace(/\D/g, '');
    const phoneWithCountry = cleanNoHp.startsWith('0') ? '62' + cleanNoHp.slice(1) : cleanNoHp;

    const message = `*KUITANSI & BUKTI PEMBAYARAN SPP*\n` +
      `*MA IHYA AS-SUNNAH / PPIAS*\n` +
      `----------------------------------------\n` +
      `No. Invoice: *${item.invoiceNo || item.invoice_no}*\n` +
      `Nama Santri: *${item.santriNama || item.santri_nama}* (${item.nis || '-'})\n` +
      `Bulan Tagihan: *${item.bulan}*\n` +
      `Nominal: *${formatRupiah(item.nominal)}*\n` +
      `Status: *${item.status === 'Lunas' ? '✅ LUNAS' : '⚠️ BELUM LUNAS'}*\n` +
      `Tanggal Bayar: ${item.tanggalBayar || item.tanggal_bayar || '-'}\n` +
      `Metode: ${item.metodeBayar || item.metode_bayar || '-'}\n` +
      `Petugas: ${item.namaPetugas || item.nama_petugas || 'Bendahara'}\n` +
      `----------------------------------------\n` +
      `_Jazakumullahu khairan katsiran atas kerja samanya dalam mendukung pendidikan Al-Qur'an putra/putri kita._`;

    if (!phoneWithCountry) {
      if (showToast) showToast("Nomor WhatsApp wali santri belum terdaftar di data santri.");
      navigator.clipboard.writeText(message);
      alert("Nomor WA belum ada. Teks kuitansi telah disalin ke clipboard:\n\n" + message);
      return;
    }

    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Sync with Cloud Database
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      const res = await storageService.syncToPostgres();
      if (res && res.success) {
        if (showToast) showToast("✅ Seluruh data SPP berhasil disinkronkan ke PostgreSQL Cloud!");
      } else {
        if (showToast) showToast(res?.message || "Sinkronisasi SPP selesai.");
      }
    } catch (err) {
      if (showToast) showToast("Gagal menyinkronkan data ke PostgreSQL.");
    } finally {
      setIsSyncing(false);
      loadData();
    }
  };

  const bulanList = [
    'Semua Bulan',
    'Juli 2026',
    'Agustus 2026',
    'September 2026',
    'Oktober 2026',
    'November 2026',
    'Desember 2026',
    'Januari 2027',
    'Februari 2027'
  ];

  return (
    <div className="spp-container">
      {/* =========================================================
          1. HEADER CARD: JUDUL, STATUS, & AKSI CEPAT
          ========================================================= */}
      <div className="spp-header-card no-print">
        <div className="spp-header-left">
          <div className="spp-header-icon">
            <Receipt size={26} />
          </div>
          <div className="spp-header-title">
            <h2>
              <span>Manajemen Pembayaran SPP Santri</span>
              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
                {sppList.length} Transaksi
              </span>
            </h2>
            <p>
              Pencatatan uang syahriah / SPP bulanan, penerbitan invoice resmi, dan pengiriman kuitansi via WhatsApp.
            </p>
          </div>
        </div>

        <div className="spp-header-actions">
          <button 
            type="button" 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            onClick={handleSyncCloud}
            disabled={isSyncing}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "Menyinkronkan..." : "Sinkronkan Cloud"}</span>
          </button>

          <button 
            type="button" 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#0369a1', borderColor: '#bae6fd' }}
            onClick={handleGenerateMonthly}
            title="Terbitkan tagihan baru untuk santri yang belum memiliki tagihan pada bulan ini"
          >
            <Calendar size={14} />
            <span>Generate Tagihan Bulan Ini</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: '#0d9488', borderColor: '#0d9488' }}
            onClick={handleOpenAdd}
          >
            <Plus size={15} />
            <span>Catat Pembayaran Baru</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. METRIC SUMMARY CARDS
          ========================================================= */}
      <div className="spp-stats-grid no-print">
        <div className="spp-stat-card">
          <div className="spp-stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <DollarSign size={24} />
          </div>
          <div className="spp-stat-info">
            <span className="spp-stat-label">Penerimaan SPP (Lunas)</span>
            <span className="spp-stat-value" style={{ color: '#16a34a' }}>
              {formatRupiah(totalNominalBulanIni)}
            </span>
            <span className="spp-stat-sub">Dari total tagihan {formatRupiah(totalTagihanBulanIni)}</span>
          </div>
        </div>

        <div className="spp-stat-card">
          <div className="spp-stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="spp-stat-info">
            <span className="spp-stat-label">Santri Lunas</span>
            <span className="spp-stat-value" style={{ color: '#059669' }}>
              {countLunas} <small style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Santri</small>
            </span>
            <span className="spp-stat-sub">Telah menyelesaikan pembayaran</span>
          </div>
        </div>

        <div className="spp-stat-card">
          <div className="spp-stat-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <Clock size={24} />
          </div>
          <div className="spp-stat-info">
            <span className="spp-stat-label">Menunggak / Belum</span>
            <span className="spp-stat-value" style={{ color: '#dc2626' }}>
              {countBelum} <small style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Santri</small>
            </span>
            <span className="spp-stat-sub">Memerlukan follow-up / reminder</span>
          </div>
        </div>

        <div className="spp-stat-card">
          <div className="spp-stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <TrendingUp size={24} />
          </div>
          <div className="spp-stat-info">
            <span className="spp-stat-label">Tingkat Kepatuhan</span>
            <span className="spp-stat-value" style={{ color: '#2563eb' }}>
              {persentaseLunas}%
            </span>
            <span className="spp-stat-sub">Kelancaran pembayaran bulan ini</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. TOOLBAR: FILTER & PENCARIAN
          ========================================================= */}
      <div className="spp-toolbar-card no-print">
        <div className="spp-filter-group">
          {/* Filter Bulan */}
          <CustomSelect 
            style={{ width: '160px' }}
            triggerStyle={{ minHeight: '38px', borderRadius: '12px' }}
            value={selectedBulan} 
            onChange={(e) => setSelectedBulan(e.target.value === 'Semua Bulan' ? 'all' : e.target.value)}
          >
            {bulanList.map(b => (
              <option key={b} value={b === 'Semua Bulan' ? 'all' : b}>{b}</option>
            ))}
          </CustomSelect>

          {/* Filter Status */}
          <CustomSelect 
            style={{ width: '160px' }}
            triggerStyle={{ minHeight: '38px', borderRadius: '12px' }}
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas</option>
          </CustomSelect>

          {/* Filter Cabang */}
          <CustomSelect 
            style={{ width: '210px' }}
            triggerStyle={{ minHeight: '38px', borderRadius: '12px' }}
            value={selectedCabang} 
            onChange={(e) => setSelectedCabang(e.target.value)}
          >
            <option value="all">Semua Cabang Lembaga</option>
            {allCabang.map(c => (
              <option key={c.id} value={c.id}>{c.nama}</option>
            ))}
          </CustomSelect>

        </div>

        <div className="spp-search-box">
          <Search size={15} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Cari santri, NIS, atau No. Invoice..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* =========================================================
          4. TABEL DAFTAR TAGIHAN & PEMBAYARAN SPP
          ========================================================= */}
      <div className="spp-table-card no-print">
        <div className="spp-table-wrapper">
          {sppList.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Receipt size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontWeight: 700 }}>Tidak ada data tagihan atau pembayaran SPP.</p>
              <small>Klik tombol "+ Catat Pembayaran Baru" atau "Generate Tagihan Bulan Ini".</small>
            </div>
          ) : (
            <table className="spp-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th>No. Invoice</th>
                  <th>Nama Santri</th>
                  <th>Cabang Lembaga</th>
                  <th>Bulan Tagihan</th>
                  <th>Nominal</th>
                  <th>Metode & Tgl</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', width: '130px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sppList.map((item, idx) => {
                  const isLunas = item.status === 'Lunas';
                  return (
                    <tr key={item.id || idx}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                      <td>
                        <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>
                          {item.invoiceNo || item.invoice_no}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {item.santriNama || item.santri_nama}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          NIS: {item.nis || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {item.cabangId === 'cabang-pusat' ? 'MA Pusat' : (item.cabangId || 'Pusat')}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {item.bulan}
                      </td>
                      <td style={{ fontWeight: 800, color: isLunas ? '#16a34a' : 'var(--text-main)' }}>
                        {formatRupiah(item.nominal)}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem' }}>{item.metodeBayar || item.metode_bayar || '-'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {item.tanggalBayar || item.tanggal_bayar || '-'}
                        </div>
                      </td>
                      <td>
                        <span className={`spp-badge ${isLunas ? 'lunas' : 'belum'}`}>
                          {isLunas ? <CheckCircle size={11} /> : <Clock size={11} />}
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td>
                        <div className="spp-action-buttons" style={{ justifyContent: 'center' }}>
                          <button 
                            type="button" 
                            className="spp-btn-icon invoice" 
                            title="Lihat & Cetak Invoice Resmi"
                            onClick={() => handleOpenInvoice(item)}
                          >
                            <Printer size={13} />
                          </button>

                          <button 
                            type="button" 
                            className="spp-btn-icon wa" 
                            title="Kirim Kuitansi ke WhatsApp Wali Santri"
                            onClick={() => handleSendWhatsApp(item)}
                          >
                            <Send size={13} />
                          </button>

                          <button 
                            type="button" 
                            className="spp-btn-icon" 
                            title="Edit Data Transaksi"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit3 size={13} />
                          </button>

                          <button 
                            type="button" 
                            className="spp-btn-icon" 
                            title="Hapus Transaksi"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={13} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================================
          5. MODAL FORM: CATAT / EDIT PEMBAYARAN SPP
          ========================================================= */}
      {isFormModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsFormModalOpen(false)}>
          <div 
            className="login-modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '580px' }}
          >
            <div className="login-modal-header">
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Receipt size={17} color="#0d9488" />
                <span>{formMode === 'add' ? 'Catat Pembayaran SPP Baru' : 'Edit Transaksi SPP'}</span>
              </h3>
              <button 
                type="button" 
                className="login-modal-close" 
                onClick={() => setIsFormModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm}>
              <div className="login-modal-body" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {/* Pilih Santri */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Pilih Santri *
                  </label>
                  <CustomSelect 
                    triggerStyle={{ minHeight: '42px', borderRadius: '12px' }}
                    value={formData.santriId}
                    onChange={(e) => handleSelectSantriChange(e.target.value)}
                    searchable={true}
                    searchPlaceholder="Ketik nama atau NIS santri..."
                    required
                  >
                    {allSantri.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.nis})
                      </option>
                    ))}
                  </CustomSelect>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Bulan Tagihan *
                    </label>
                    <CustomSelect 
                      triggerStyle={{ minHeight: '42px', borderRadius: '12px' }}
                      value={formData.bulan}
                      onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                    >
                      {bulanList.filter(b => b !== 'Semua Bulan').map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </CustomSelect>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Nominal (Rp) *
                    </label>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ width: '100%' }}
                      value={formData.nominal}
                      onChange={(e) => setFormData({ ...formData, nominal: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Status Pembayaran *
                    </label>
                    <CustomSelect 
                      triggerStyle={{ minHeight: '42px', borderRadius: '12px' }}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Belum Lunas">Belum Lunas</option>
                      <option value="Cicilan">Cicilan Sebagian</option>
                    </CustomSelect>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Metode Pembayaran
                    </label>
                    <CustomSelect 
                      triggerStyle={{ minHeight: '42px', borderRadius: '12px' }}
                      value={formData.metodeBayar}
                      onChange={(e) => setFormData({ ...formData, metodeBayar: e.target.value })}
                    >
                      <option value="Transfer Bank BSI">Transfer Bank BSI</option>
                      <option value="Tunai / Kas Loket">Tunai / Kas Loket</option>
                      <option value="QRIS Pesantren">QRIS Pesantren</option>
                      <option value="-">-</option>
                    </CustomSelect>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Tanggal Pembayaran
                    </label>
                    <input 
                      type="date" 
                      className="form-input" 
                      style={{ width: '100%' }}
                      value={formData.tanggalBayar || ''}
                      onChange={(e) => setFormData({ ...formData, tanggalBayar: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      No. Referensi / Struk
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ width: '100%' }}
                      value={formData.nomorRef || ''}
                      onChange={(e) => setFormData({ ...formData, nomorRef: e.target.value })}
                      placeholder="Contoh: BSI-123456"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    Catatan Transaksi
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ width: '100%' }}
                    value={formData.catatan || ''}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Contoh: Titipan melalui musyrif / transfer"
                  />
                </div>
              </div>

              <div className="login-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Save size={14} />
                  <span>Simpan Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          6. MODAL INVOICE RESMI (PRINTABLE & SHAREABLE)
          ========================================================= */}
      {isInvoiceOpen && selectedInvoice && (
        <div className="invoice-modal-overlay" onClick={() => setIsInvoiceOpen(false)}>
          <div 
            className="invoice-modal-card" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Dialog Bar (Hidden during print) */}
            <div className="invoice-modal-header-bar no-print">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={16} color="#0d9488" />
                <strong style={{ fontSize: '0.9rem' }}>Invoice Resmi Pembayaran SPP</strong>
              </div>
              <button 
                type="button" 
                className="login-modal-close"
                onClick={() => setIsInvoiceOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Paper Container */}
            <div className="invoice-modal-body-scroll">
              <div className="invoice-paper">
                {/* Watermark Status */}
                {selectedInvoice.status === 'Lunas' ? (
                  <div className="invoice-watermark-lunas">LUNAS</div>
                ) : (
                  <div className="invoice-watermark-pending">BELUM LUNAS</div>
                )}

                {/* Kop Surat */}
                <div className="invoice-kop">
                  <div className="invoice-kop-logo">
                    <TahfidzHubLogo size={28} variant="white" />
                  </div>
                  <div className="invoice-kop-text">
                    <h3>MA TAHFIDZUL QUR'AN IHYA AS-SUNNAH</h3>
                    <p>
                      Pesantren Persatuan Islam As-Sunnah (PPIAS) Tasikmalaya<br />
                      Jl. Terusan As-Sunnah No. 12, Paseh, Kota Tasikmalaya • Telp: (0265) 334455
                    </p>
                  </div>
                </div>

                {/* Title Row */}
                <div className="invoice-title-row">
                  <div>
                    <h2>KUITANSI PEMBAYARAN SPP</h2>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Official Electronic Payment Receipt
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      NO. INVOICE:
                    </div>
                    <code style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488' }}>
                      {selectedInvoice.invoiceNo || selectedInvoice.invoice_no}
                    </code>
                  </div>
                </div>

                {/* Metadata Santri & Tagihan */}
                <table className="invoice-meta-table">
                  <tbody>
                    <tr>
                      <td style={{ width: '130px', color: '#64748b' }}>Nama Santri</td>
                      <td style={{ width: '10px' }}>:</td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        {selectedInvoice.santriNama || selectedInvoice.santri_nama}
                      </td>
                      <td style={{ width: '110px', color: '#64748b' }}>Tanggal Bayar</td>
                      <td style={{ width: '10px' }}>:</td>
                      <td style={{ fontWeight: 600 }}>
                        {selectedInvoice.tanggalBayar || selectedInvoice.tanggal_bayar || '-'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b' }}>NIS / No. Induk</td>
                      <td>:</td>
                      <td style={{ fontWeight: 600 }}>{selectedInvoice.nis || '-'}</td>
                      <td style={{ color: '#64748b' }}>Metode Bayar</td>
                      <td>:</td>
                      <td style={{ fontWeight: 600 }}>
                        {selectedInvoice.metodeBayar || selectedInvoice.metode_bayar || 'Transfer Bank'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b' }}>Status Santri</td>
                      <td>:</td>
                      <td style={{ fontWeight: 600 }}>Aktif</td>
                      <td style={{ color: '#64748b' }}>No. Referensi</td>
                      <td>:</td>
                      <td style={{ fontWeight: 600 }}>{selectedInvoice.nomorRef || selectedInvoice.nomor_ref || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b' }}>Unit / Cabang</td>
                      <td>:</td>
                      <td style={{ fontWeight: 600 }}>MA Ihya As-Sunnah (Pusat)</td>
                      <td style={{ color: '#64748b' }}>Bulan Tagihan</td>
                      <td>:</td>
                      <td style={{ fontWeight: 700, color: '#0d9488' }}>{selectedInvoice.bulan}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Line Items Table */}
                <table className="invoice-line-items">
                  <thead>
                    <tr>
                      <th style={{ width: '35px' }}>No</th>
                      <th>Uraian Pembayaran</th>
                      <th>Bulan</th>
                      <th style={{ textAlign: 'right' }}>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>
                        <strong>Uang Pembinaan & SPP Syahriah Santri</strong>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {selectedInvoice.catatan || 'Kewajiban SPP Bulanan Program Tahfidz Al-Qur\'an'}
                        </div>
                      </td>
                      <td>{selectedInvoice.bulan}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatRupiah(selectedInvoice.nominal)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Total Row */}
                <div className="invoice-total-row">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span style={{ color: '#0d9488', fontSize: '1.1rem' }}>
                    {formatRupiah(selectedInvoice.nominal)}
                  </span>
                </div>

                {/* Signatures & Verification */}
                <div className="invoice-footer-signatures">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ border: '1px solid #cbd5e1', padding: '4px', borderRadius: '6px' }}>
                      <QrCode size={40} color="#0d9488" />
                    </div>
                    <div style={{ fontSize: '0.675rem', color: '#64748b', lineHeight: '1.3' }}>
                      Kuitansi sah yang diterbitkan<br />
                      oleh Sistem SIMTAH Cloud.<br />
                      Terverifikasi secara digital.
                    </div>
                  </div>

                  <div className="invoice-sign-box">
                    <div>Tasikmalaya, {selectedInvoice.tanggalBayar || selectedInvoice.tanggal_bayar || new Date().toISOString().split('T')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Petugas Bendahara,</div>
                    <div className="invoice-sign-space"></div>
                    <div className="invoice-sign-name">
                      {selectedInvoice.namaPetugas || selectedInvoice.nama_petugas || 'Ustadz Wahyudin, S.Pd'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions (Hidden on print) */}
            <div className="invoice-actions-footer no-print">
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => setIsInvoiceOpen(false)}
              >
                Tutup
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', borderColor: '#86efac' }}
                  onClick={() => handleSendWhatsApp(selectedInvoice)}
                >
                  <Send size={14} />
                  <span>Kirim WhatsApp</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#0d9488', borderColor: '#0d9488' }}
                  onClick={handlePrintInvoice}
                >
                  <Printer size={14} />
                  <span>🖨️ Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
