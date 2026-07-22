import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ options, value, onChange, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={styles.container}>
      <label style={styles.label}>{label}</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.2)';
            e.currentTarget.style.borderColor = '#1E40AF';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(30, 64, 175, 0.18)';
          e.currentTarget.style.borderColor = isOpen ? '#1E40AF' : '#BFDBFE';
        }}
        style={{
          ...styles.trigger,
          borderColor: isOpen ? '#1E40AF' : '#BFDBFE',
        }}
      >
        <div style={styles.triggerContent}>
          {selectedOption ? (
            <>
              <div style={styles.avatar}>
                👨‍⚕️
              </div>
              <div style={styles.triggerText}>
                <div style={styles.triggerLabel}>Dr. {selectedOption.label.split(' - ')[0]}</div>
                <div style={styles.triggerSubtitle}>{selectedOption.label.split(' - ')[1]}</div>
              </div>
            </>
          ) : (
            <div style={styles.placeholder}>{placeholder}</div>
          )}
        </div>
        <div style={{
          ...styles.chevron,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </div>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div style={styles.dropdown}>
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={(e) => {
                if (selectedOption?.value !== option.value) {
                  e.currentTarget.style.backgroundColor = '#F0F9FF';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = selectedOption?.value === option.value ? '#EFF6FF' : '#FFFFFF';
              }}
              style={{
                ...styles.option,
                backgroundColor: selectedOption?.value === option.value ? '#EFF6FF' : '#FFFFFF',
                borderLeftColor: selectedOption?.value === option.value ? '#1E40AF' : 'transparent',
              }}
            >
              <div style={styles.optionAvatar}>
                👨‍⚕️
              </div>
              <div style={styles.optionContent}>
                <div style={styles.optionName}>Dr. {option.label.split(' - ')[0]}</div>
                <div style={styles.optionEmail}>{option.label.split(' - ')[1]}</div>
              </div>
              {selectedOption?.value === option.value && (
                <div style={styles.checkmark}>✓</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: '26px',
  },

  label: {
    display: 'block',
    color: '#1A2F4D',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  trigger: {
    width: '100%',
    padding: '14px 44px 14px 18px',
    border: '2px solid #BFDBFE',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#1A2F4D',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(30, 64, 175, 0.18)',
  },

  triggerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    textAlign: 'left',
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#FFFFFF',
    fontWeight: '600',
    flexShrink: 0,
  },

  triggerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  triggerLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A2F4D',
  },

  triggerSubtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '400',
  },

  placeholder: {
    color: '#94A3B8',
    fontSize: '15px',
    fontWeight: '500',
  },

  chevron: {
    color: '#1E40AF',
    transition: 'transform 0.3s ease',
    fontSize: '12px',
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    marginTop: '8px',
    background: '#FFFFFF',
    border: '2px solid #BFDBFE',
    borderRadius: '14px',
    boxShadow: '0 12px 32px rgba(30, 64, 175, 0.2), 0 0 1px rgba(30, 64, 175, 0.1)',
    zIndex: '1100',
    overflow: 'hidden',
    animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  option: {
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    borderLeft: '4px solid transparent',
    background: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    outline: 'none',
    textAlign: 'left',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    borderBottom: '1px solid #F0F4F8',
  },

  optionAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #DBEAFE 0%, #BFE7FC 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#1E40AF',
    fontWeight: '600',
    flexShrink: 0,
  },

  optionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },

  optionName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A2F4D',
  },

  optionEmail: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '400',
  },

  checkmark: {
    color: '#10B981',
    fontSize: '16px',
    fontWeight: '700',
  },
};

export default CustomDropdown;
