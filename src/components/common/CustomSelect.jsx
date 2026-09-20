import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Check, Search } from 'lucide-react';

/**
 * CustomSelect - Komponen dropdown presisi tinggi sesuai desain UI
 * Fitur:
 * - Border pill hijau emerald halus (#10b981)
 * - Chevron indicator dinamis (ChevronUp saat buka, ChevronDown saat tutup)
 * - Floating popup card dengan sudut bulat elegan (border-radius: 16px)
 * - Item terpilih berlatar mint (#ecfdf5), teks hijau (#047857), & icon Check hijau (#059669)
 * - Dukungan pencarian cepat (searchable) jika daftar panjang (> 8 opsi)
 * - Kompatibel dengan options array maupun <option> children
 * - Support event-based onChange: e.target.value
 */
export default function CustomSelect({
  value,
  defaultValue,
  onChange,
  options,
  children,
  placeholder = 'Pilih...',
  icon = null,
  disabled = false,
  searchable = undefined,
  searchPlaceholder = 'Cari...',
  className = '',
  style = {},
  triggerStyle = {},
  dropdownStyle = {},
  name = '',
  id = '',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalisasi opsi dari prop options ATAU children <option>
  const parsedOptions = React.useMemo(() => {
    let list = [];
    if (options && Array.isArray(options)) {
      list = options.map(opt => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            value: opt.value !== undefined ? opt.value : opt.id,
            label: opt.label !== undefined ? opt.label : (opt.nama || opt.name || opt.value),
            sublabel: opt.sublabel,
            disabled: !!opt.disabled
          };
        }
        return { value: opt, label: String(opt), disabled: false };
      });
    } else if (children) {
      React.Children.forEach(children, child => {
        if (React.isValidElement(child) && child.type === 'option') {
          const rawLabel = child.props.children;
          const labelText = Array.isArray(rawLabel)
            ? rawLabel.map(c => (typeof c === 'object' ? '' : c)).join('')
            : (typeof rawLabel === 'string' || typeof rawLabel === 'number' ? String(rawLabel) : '');
          list.push({
            value: child.props.value,
            label: labelText || rawLabel,
            disabled: child.props.disabled
          });
        }
      });
    }
    return list;
  }, [options, children]);

  // Tentukan nilai aktif (string / number)
  const currentValue = value !== undefined ? value : defaultValue;

  // Cari label dari opsi aktif
  const currentOption = parsedOptions.find(opt => String(opt.value) === String(currentValue));
  const currentLabel = currentOption ? currentOption.label : (currentValue !== undefined && currentValue !== '' ? currentValue : placeholder);

  // Auto aktifkan search jika opsi lebih dari 8 item
  const isSearchEnabled = searchable !== undefined ? searchable : parsedOptions.length > 8;

  // Filter opsi berdasarkan pencarian
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return parsedOptions;
    const q = searchTerm.toLowerCase();
    return parsedOptions.filter(opt => {
      const lbl = typeof opt.label === 'string' ? opt.label.toLowerCase() : String(opt.label).toLowerCase();
      const val = typeof opt.value === 'string' ? opt.value.toLowerCase() : String(opt.value).toLowerCase();
      const sub = opt.sublabel ? String(opt.sublabel).toLowerCase() : '';
      return lbl.includes(q) || val.includes(q) || sub.includes(q);
    });
  }, [parsedOptions, searchTerm]);

  // Deteksi posisi overflow vertikal (jika terlalu dekat ke bawah layar, buka ke atas)
  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > 280) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
      setSearchTerm('');
    }
    setIsOpen(prev => !prev);
  };

  // Fokuskan input search saat dropdown dibuka
  useEffect(() => {
    if (isOpen && isSearchEnabled && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchEnabled]);

  // Tutup dropdown jika klik di luar atau tekan Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handler saat opsi dipilih
  const handleSelect = (opt) => {
    if (opt.disabled) return;
    setIsOpen(false);

    // Kirim synthetic event yang kompatibel dengan e.target.value maupun nilai langsung
    const syntheticEvent = {
      target: { value: opt.value, name: name || id || '' },
      currentTarget: { value: opt.value, name: name || id || '' },
      value: opt.value,
      toString: () => String(opt.value),
      valueOf: () => opt.value
    };

    if (onChange) {
      onChange(syntheticEvent, opt.value);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`custom-select-container ${className} ${disabled ? 'is-disabled' : ''} ${isOpen ? 'is-open' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Hidden input untuk form submit native jika ada */}
      <input 
        type="hidden" 
        name={name} 
        id={id} 
        value={currentValue !== undefined ? currentValue : ''} 
        required={required} 
      />

      {/* Trigger Box (Pill Hijau Sesuai Gambar) */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        className="custom-select-trigger"
        style={{
          minHeight: '44px',
          width: '100%',
          background: disabled ? '#f8fafc' : '#ffffff',
          border: isOpen ? '1.5px solid #059669' : '1.5px solid #10b981',
          borderRadius: '14px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen 
            ? '0 0 0 3px rgba(16, 185, 129, 0.18)' 
            : '0 1px 2px rgba(16, 185, 129, 0.05)',
          transition: 'all 0.15s ease',
          outline: 'none',
          ...triggerStyle
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          {icon && (
            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {icon}
            </span>
          )}
          <span style={{
            fontSize: '0.88rem',
            fontWeight: 500,
            color: currentOption ? '#0f172a' : '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'left'
          }}>
            {currentLabel}
          </span>
        </div>

        {/* Chevron Icon (Up saat terbuka, Down saat tertutup) */}
        <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {isOpen ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
        </div>
      </div>

      {/* Floating Dropdown Menu Card (Persis Sesuai Gambar) */}
      {isOpen && (
        <div
          className="custom-select-menu"
          style={{
            position: 'absolute',
            [openUpward ? 'bottom' : 'top']: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: '100%',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.05)',
            padding: '8px',
            zIndex: 9999,
            maxHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            animation: 'customDropdownFade 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            ...dropdownStyle
          }}
        >
          {/* Search Box jika opsi banyak */}
          {isSearchEnabled && (
            <div style={{ padding: '2px 4px 8px 4px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '6px 10px'
              }}>
                <Search size={14} color="#94a3b8" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.82rem',
                    width: '100%',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>
          )}

          {/* List Item Opsi */}
          <div 
            className="custom-select-list"
            style={{
              overflowY: 'auto',
              maxHeight: isSearchEnabled ? '220px' : '260px',
              paddingRight: '2px'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px 14px', textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
                Tidak ada opsi yang cocok
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(currentValue);

                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    className={`custom-select-item ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      background: isSelected ? '#ecfdf5' : 'transparent',
                      color: isSelected ? '#047857' : '#334155',
                      fontWeight: isSelected ? 500 : 400,
                      fontSize: '0.86rem',
                      marginBottom: '2px',
                      opacity: opt.disabled ? 0.4 : 1,
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !opt.disabled) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !opt.disabled) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#334155';
                      }
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </div>
                      {opt.sublabel && (
                        <div style={{ fontSize: '0.72rem', color: isSelected ? '#059669' : '#64748b' }}>
                          {opt.sublabel}
                        </div>
                      )}
                    </div>

                    {/* Centang Hijau Emerald Persis Gambar */}
                    {isSelected && (
                      <div style={{ flexShrink: 0, color: '#059669', display: 'flex', alignItems: 'center' }}>
                        <Check size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
