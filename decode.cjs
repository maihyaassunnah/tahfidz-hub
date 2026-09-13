const fs = require('fs');
const b64 = fs.readFileSync('full.b64', 'utf8');
fs.writeFileSync("src/components/PengaturanAdminView.jsx", Buffer.from(b64, 'base64').toString('utf8'));
console.log('File successfully written!');
