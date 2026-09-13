import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  FileText, 
  Database,
  PlusCircle,
  Download
} from 'lucide-react';
import { storageService } from '../services/storage';
import TahfidzHubLogo from './TahfidzHubLogo';

export default function Navbar({ activeTab, setActiveTab, onOpenQuickSetor, showToast }) {
  const handleExportCSV = () => {
    storageService.exportSetoranToCSV();
    showToast("Berhasil mengekspor rekap setoran ke file CSV (Excel)!");
  };

  return (
    <header className="navbar no-print">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand-area" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-logo-badge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TahfidzHubLogo size={22} variant="white" />
          </div>
          <div>
            <div className="brand-title">Tahfidz HUB</div>
            <div className="brand-subtitle">
              <span>Platform Manajemen Tahfidz</span>
              <span className="brand-tag">HUB PRO</span>
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'setoran' ? 'active' : ''}`}
            onClick={() => setActiveTab('setoran')}
          >
            <BookOpen size={17} />
            <span>Setoran</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'absensi' ? 'active' : ''}`}
            onClick={() => setActiveTab('absensi')}
          >
            <CheckSquare size={17} />
            <span>Presensi</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <Award size={17} />
            <span>Peta 30 Juz</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'rapor' ? 'active' : ''}`}
            onClick={() => setActiveTab('rapor')}
          >
            <FileText size={17} />
            <span>Rapor</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'master' ? 'active' : ''}`}
            onClick={() => setActiveTab('master')}
          >
            <Database size={17} />
            <span>Data Master</span>
          </button>
        </nav>

        {/* Quick Actions */}
        <div className="navbar-actions">
          <button 
            className="btn btn-gold btn-sm"
            onClick={onOpenQuickSetor}
            title="Catat Setoran Baru"
          >
            <PlusCircle size={16} />
            <span>Setor Hafalan</span>
          </button>

          <button 
            className="btn btn-outline btn-sm"
            onClick={handleExportCSV}
            title="Ekspor CSV Excel"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <Download size={15} />
            <span>Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
}
