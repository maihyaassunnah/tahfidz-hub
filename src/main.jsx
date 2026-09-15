import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Hilangkan penyimpanan storage local (semua data menggunakan database PostgreSQL)
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    window.localStorage.clear();
  } catch (e) {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
