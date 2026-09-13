import React from 'react';

/**
 * Tahfidz HUB Brand Logo Component
 * Menggabungkan filosofi Mushaf Al-Qur'an (Tahfidz) dengan simpul jaringan multi-cabang (HUB).
 */
export default function TahfidzHubLogo({ 
  size = 28, 
  variant = 'white', // 'white', 'gradient', 'emerald', 'amber'
  className = '' 
}) {
  const getColors = () => {
    switch (variant) {
      case 'gradient':
        return {
          stroke: 'url(#thHubGrad)',
          nodeCenter: '#f59e0b',
          nodeSatellite: '#10b981',
          hasGrad: true
        };
      case 'emerald':
        return {
          stroke: '#059669',
          nodeCenter: '#047857',
          nodeSatellite: '#10b981',
          hasGrad: false
        };
      case 'amber':
        return {
          stroke: '#d97706',
          nodeCenter: '#f59e0b',
          nodeSatellite: '#fbbf24',
          hasGrad: false
        };
      case 'white':
      default:
        return {
          stroke: '#ffffff',
          nodeCenter: '#ffffff',
          nodeSatellite: '#ffffff',
          hasGrad: false
        };
    }
  };

  const colors = getColors();

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo Tahfidz HUB"
    >
      <defs>
        <linearGradient id="thHubGrad" x1="2" y1="4" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* 1. Central Mushaf / Open Holy Book contour */}
      <path 
        d="M16 12V24M16 12C13.2 10.2 8.5 10.4 4 12.2V24.5C8.5 22.8 13.2 22.6 16 24.2M16 12C18.8 10.2 23.5 10.4 28 12.2V24.5C23.5 22.8 18.8 22.6 16 24.2" 
        stroke={colors.stroke} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* 2. Central Arch of Light */}
      <path 
        d="M12 16.5C13.2 15.5 14.6 15 16 15C17.4 15 18.8 15.5 20 16.5" 
        stroke={colors.stroke} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeOpacity="0.85"
      />

      {/* 3. Central HUB Node (Top Beacon) */}
      <circle 
        cx="16" 
        cy="5.5" 
        r="2.5" 
        fill={colors.nodeCenter} 
      />
      <path 
        d="M16 8V11" 
        stroke={colors.stroke} 
        strokeWidth="1.8" 
        strokeLinecap="round" 
      />

      {/* 4. Branch HUB Satellite Node Left */}
      <circle 
        cx="4.5" 
        cy="6" 
        r="1.8" 
        fill={colors.nodeSatellite} 
        fillOpacity="0.9" 
      />
      <path 
        d="M6 7.5L9.5 10" 
        stroke={colors.stroke} 
        strokeWidth="1.3" 
        strokeLinecap="round" 
        strokeDasharray="1.2 1.8" 
        strokeOpacity="0.8"
      />

      {/* 5. Branch HUB Satellite Node Right */}
      <circle 
        cx="27.5" 
        cy="6" 
        r="1.8" 
        fill={colors.nodeSatellite} 
        fillOpacity="0.9" 
      />
      <path 
        d="M26 7.5L22.5 10" 
        stroke={colors.stroke} 
        strokeWidth="1.3" 
        strokeLinecap="round" 
        strokeDasharray="1.2 1.8" 
        strokeOpacity="0.8"
      />
    </svg>
  );
}
