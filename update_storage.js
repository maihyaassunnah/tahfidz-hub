const fs = require('fs');
let code = fs.readFileSync('D:/Tahfidz (Nice)/src/services/storage.js', 'utf8');

const initialMatrix = \  matriks: {
    subuh: {
      Senin: { status: 'Masuk', guru: 'Wahyudin Hafiz, S.Pd' },
      Selasa: { status: 'Masuk', guru: 'Wahyudin Hafiz, S.Pd' },
      Rabu: { status: 'Masuk', guru: 'Wahyudin Hafiz, S.Pd' },
      Kamis: { status: 'Masuk', guru: 'Wahyudin Hafiz, S.Pd' },
      Jumat: { status: 'Masuk', guru: 'Wahyudin Hafiz, S.Pd' },
      Sabtu: { status: 'Masuk', guru: 'Wahyudin Hafiz, S.Pd' },
      Ahad: { status: 'Libur', guru: '' }
    },
    pagi: {
      Senin: { status: 'Masuk', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Selasa: { status: 'Masuk', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Rabu: { status: 'Masuk', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Kamis: { status: 'Masuk', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Jumat: { status: 'Libur', guru: '' },
      Sabtu: { status: 'Masuk', guru: 'Redi Iskandar, S.Pd., B.A.' },
      Ahad: { status: 'Libur', guru: '' }
    },
    siang: {
      Senin: { status: 'Masuk', guru: 'Hendriyansa Putra' },
      Selasa: { status: 'Masuk', guru: 'Hendriyansa Putra' },
      Rabu: { status: 'Masuk', guru: 'Hendriyansa Putra' },
      Kamis: { status: 'Masuk', guru: 'Hendriyansa Putra' },
      Jumat: { status: 'Libur', guru: '' },
      Sabtu: { status: 'Masuk', guru: 'Hendriyansa Putra' },
      Ahad: { status: 'Libur', guru: '' }
    },
    malam: {
      Senin: { status: 'Masuk', guru: 'Agus Rinaldi' },
      Selasa: { status: 'Masuk', guru: 'Agus Rinaldi' },
      Rabu: { status: 'Masuk', guru: 'Agus Rinaldi' },
      Kamis: { status: 'Masuk', guru: 'Agus Rinaldi' },
      Jumat: { status: 'Libur', guru: '' },
      Sabtu: { status: 'Masuk', guru: 'Agus Rinaldi' },
      Ahad: { status: 'Libur', guru: '' }
    }
  },
\;

if (!code.includes('matriks: {')) {
  code = code.replace('const INITIAL_JADWAL_HALAQOH = {\r\n  sesiList:', 'const INITIAL_JADWAL_HALAQOH = {\r\n' + initialMatrix + '  sesiList:');
  if (!code.includes('matriks: {')) {
    code = code.replace('const INITIAL_JADWAL_HALAQOH = {\n  sesiList:', 'const INITIAL_JADWAL_HALAQOH = {\n' + initialMatrix + '  sesiList:');
  }
}

const methods = \
  setHalaqohMatrixCell(sesiId, hari, { status, guru }) {
    const data = this.getJadwalHalaqoh();
    if (!data.matriks) data.matriks = {};
    if (!data.matriks[sesiId]) data.matriks[sesiId] = {};
    data.matriks[sesiId][hari] = { status, guru: guru || '' };
    if (!data.hariAktif) data.hariAktif = {};
    if (!data.hariAktif[hari]) data.hariAktif[hari] = {};
    data.hariAktif[hari][sesiId] = (status === 'Masuk');
    this.saveJadwalHalaqoh(data);
    return data.matriks[sesiId][hari];
  },

  clearHalaqohMatrixCell(sesiId, hari) {
    const data = this.getJadwalHalaqoh();
    if (data.matriks && data.matriks[sesiId]) {
      data.matriks[sesiId][hari] = null;
    }
    if (data.hariAktif && data.hariAktif[hari]) {
      data.hariAktif[hari][sesiId] = false;
    }
    this.saveJadwalHalaqoh(data);
  },

  addSesiHalaqoh(sesi) {
    const data = this.getJadwalHalaqoh();
    const id = sesi.id || 'sesi-' + Date.now();
    const newSesi = { ...sesi, id };
    data.sesiList.push(newSesi);
    if (!data.matriks) data.matriks = {};
    data.matriks[id] = {};
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'].forEach(h => {
      data.matriks[id][h] = { status: 'Masuk', guru: '' };
      if (data.hariAktif && data.hariAktif[h]) {
        data.hariAktif[h][id] = true;
      }
    });
    this.saveJadwalHalaqoh(data);
    return newSesi;
  },

  deleteSesiHalaqoh(sesiId) {
    const data = this.getJadwalHalaqoh();
    data.sesiList = data.sesiList.filter(s => s.id !== sesiId);
    if (data.matriks) delete data.matriks[sesiId];
    if (data.hariAktif) {
      Object.keys(data.hariAktif).forEach(h => {
        delete data.hariAktif[h][sesiId];
      });
    }
    this.saveJadwalHalaqoh(data);
  },
\;

if (!code.includes('setHalaqohMatrixCell')) {
  code = code.replace('saveJadwalHalaqoh(data) {', methods + '  saveJadwalHalaqoh(data) {');
}

fs.writeFileSync('D:/Tahfidz (Nice)/src/services/storage.js', code, 'utf8');
console.log('Done updating storage.js!');