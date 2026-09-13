// API Service Client untuk SIMTAH (Tahfidz Hub)
// Terkoneksi ke Backend Express + PostgreSQL di VPS

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) || '/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.isOnline = true;
  }

  // 1. Cek Koneksi Backend & Database
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.isOnline = data.status === 'ok' && data.database === 'connected';
      return data;
    } catch (err) {
      this.isOnline = false;
      console.warn('[API] Backend/DB offline, running in local cached mode:', err.message);
      return { status: 'offline', database: 'disconnected', error: err.message };
    }
  }

  // 2. Fetch Cabang
  async getCabang() {
    try {
      const res = await fetch(`${this.baseUrl}/cabang`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to fetch cabang from server, using local fallback:', err.message);
      return null;
    }
  }

  // 3. Fetch Santri
  async getSantri() {
    try {
      const res = await fetch(`${this.baseUrl}/santri`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to fetch santri from server:', err.message);
      return null;
    }
  }

  async saveSantri(data) {
    try {
      const res = await fetch(`${this.baseUrl}/santri`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to save santri to server:', err.message);
      return null;
    }
  }

  async deleteSantri(id) {
    try {
      const res = await fetch(`${this.baseUrl}/santri/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to delete santri from server:', err.message);
      return null;
    }
  }

  // 3b. Pengampu & Guru
  async getPengampu() {
    try {
      const res = await fetch(`${this.baseUrl}/pengampu`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to fetch pengampu from server:', err.message);
      return null;
    }
  }

  async savePengampu(data) {
    try {
      const res = await fetch(`${this.baseUrl}/pengampu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to save pengampu to server:', err.message);
      return null;
    }
  }

  async deletePengampu(id) {
    try {
      const res = await fetch(`${this.baseUrl}/pengampu/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to delete pengampu from server:', err.message);
      return null;
    }
  }

  // 3c. Halaqah
  async getHalaqah() {
    try {
      const res = await fetch(`${this.baseUrl}/halaqah`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to fetch halaqah from server:', err.message);
      return null;
    }
  }

  async saveHalaqah(data) {
    try {
      const res = await fetch(`${this.baseUrl}/halaqah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to save halaqah to server:', err.message);
      return null;
    }
  }

  // 4. Simpan / Update Presensi Realtime Pengampu (Monitoring Sigap)
  async saveMonitoringPresensi(data) {
    try {
      const res = await fetch(`${this.baseUrl}/monitoring-sigap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to save monitoring presensi to server:', err.message);
      return null;
    }
  }

  // 5. Simpan Absensi Santri (Batch)
  async saveAbsensiSantriBatch(records) {
    try {
      const res = await fetch(`${this.baseUrl}/absensi-santri/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to save absensi batch to server:', err.message);
      return null;
    }
  }

  // 6. 1-Click Sinkronisasi Semua Data Lokal ke PostgreSQL VPS
  async syncAllToDatabase(payload) {
    try {
      const res = await fetch(`${this.baseUrl}/sync-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Failed to sync data to server:', err);
      throw err;
    }
  }

  // 7. Tarik Seluruh Data Terbaru dari Database Cloud PostgreSQL
  async pullAllData() {
    try {
      const res = await fetch(`${this.baseUrl}/pull-all`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Failed to pull data from cloud server:', err);
      throw err;
    }
  }

  // 8. Pembayaran SPP
  async getSPP(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${this.baseUrl}/spp${qs ? '?' + qs : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[API] Failed to get SPP records from server:', err.message);
      return null;
    }
  }

  async saveSPP(data) {
    try {
      const res = await fetch(`${this.baseUrl}/spp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Failed to save SPP record:', err);
      throw err;
    }
  }

  async deleteSPP(id) {
    try {
      const res = await fetch(`${this.baseUrl}/spp/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('[API] Failed to delete SPP record:', err);
      throw err;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
