import React, { useState, useRef, useEffect } from 'react';

const CustomDateTimePicker = ({ value, onChange, label, minDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(value || new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
  const [hour, setHour] = useState(value ? new Date(value).getHours() : 12);
  const [minute, setMinute] = useState(value ? new Date(value).getMinutes() : 0);
  const [period, setPeriod] = useState(value ? (new Date(value).getHours() >= 12 ? 'PM' : 'AM') : 'AM');
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Check picker position
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      
      // If less than 400px space below, position above
      if (spaceBelow < 400 && spaceAbove > 400) {
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatDisplayDate = () => {
    const date = new Date(value);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${mins}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    updateDateTime(newDate);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setHour(12);
    setMinute(0);
    setPeriod('AM');
    updateDateTime(today);
  };

  const handleClear = () => {
    setSelectedDate(new Date());
    setCurrentMonth(new Date());
    setHour(12);
    setMinute(0);
    setPeriod('AM');
    onChange('');
    setIsOpen(false);
  };

  const updateDateTime = (date) => {
    const hourIn24 = period === 'AM' 
      ? (hour % 12) 
      : (hour % 12 === 0 ? 12 : hour % 12 + 12);
    
    const newDate = new Date(date);
    newDate.setHours(hourIn24, minute, 0, 0);
    onChange(newDate.toISOString().slice(0, 16));
  };

  const handleHourChange = (e) => {
    const newHour = parseInt(e.target.value) || 12;
    setHour(newHour);
    updateDateTime(selectedDate);
  };

  const handleMinuteChange = (e) => {
    const newMinute = parseInt(e.target.value) || 0;
    setMinute(newMinute);
    updateDateTime(selectedDate);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    updateDateTime(selectedDate);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} style={styles.emptyDay}>
          {new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -firstDay + i + 1).getDate()}
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();

      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = '#F0F9FF';
              e.currentTarget.style.borderColor = '#BFDBFE';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = 'transparent';
            }
          }}
          style={{
            ...styles.dayButton,
            ...(isSelected ? styles.selectedDay : {}),
            ...(isToday && !isSelected ? styles.todayDay : {}),
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div ref={pickerRef} style={styles.container}>
      <label style={styles.label}>{label}</label>

      {/* Input Display */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#1E40AF';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isOpen ? '#1E40AF' : '#E0E7FF';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 64, 175, 0.08)';
        }}
        style={{
          ...styles.trigger,
          borderColor: isOpen ? '#1E40AF' : '#E0E7FF',
        }}
      >
        <span style={styles.displayText}>{value ? formatDisplayDate() : 'Select date and time'}</span>
        <span style={styles.calendar}>📅</span>
      </button>

      {/* Date Time Picker */}
      {isOpen && (
        <div 
          style={{
            ...styles.picker,
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Calendar */}
          <div style={styles.calendar_section}>
            {/* Month Navigation */}
            <div style={styles.monthNav}>
              <button
                type="button"
                onClick={handlePrevMonth}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#EFF6FF';
                  e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={styles.navButton}
              >
                ‹
              </button>
              <div style={styles.monthYear}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#EFF6FF';
                  e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                style={styles.navButton}
              >
                ›
              </button>
            </div>

            {/* Day Headers */}
            <div style={styles.dayHeaders}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} style={styles.dayHeader}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div style={styles.daysGrid}>
              {renderCalendar()}
            </div>
          </div>

          {/* Time Section */}
          <div style={styles.timeSection}>
            <label style={styles.timeLabel}>⏰ TIME</label>
            <div style={styles.timeInputs}>
              <input
                type="number"
                min="1"
                max="12"
                value={hour}
                onChange={handleHourChange}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1E40AF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.15)';
                  e.currentTarget.style.background = '#DBEAFE';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#F0F9FF';
                }}
                style={styles.timeInput}
              />
              <span style={styles.timeSeparator}>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={String(minute).padStart(2, '0')}
                onChange={handleMinuteChange}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1E40AF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.15)';
                  e.currentTarget.style.background = '#DBEAFE';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#F0F9FF';
                }}
                style={styles.timeInput}
              />
            </div>

            <div style={styles.periodToggle}>
              <button
                type="button"
                onClick={() => handlePeriodChange('AM')}
                onMouseEnter={(e) => {
                  if (period !== 'AM') {
                    e.currentTarget.style.background = '#F0F9FF';
                    e.currentTarget.style.borderColor = '#BFDBFE';
                  }
                }}
                onMouseLeave={(e) => {
                  if (period !== 'AM') {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E0E7FF';
                  }
                }}
                style={{
                  ...styles.periodButton,
                  ...(period === 'AM' ? styles.periodActive : styles.periodInactive),
                }}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('PM')}
                onMouseEnter={(e) => {
                  if (period !== 'PM') {
                    e.currentTarget.style.background = '#F0F9FF';
                    e.currentTarget.style.borderColor = '#BFDBFE';
                  }
                }}
                onMouseLeave={(e) => {
                  if (period !== 'PM') {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E0E7FF';
                  }
                }}
                style={{
                  ...styles.periodButton,
                  ...(period === 'PM' ? styles.periodActive : styles.periodInactive),
                }}
              >
                PM
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actions}>
            <button 
              type="button" 
              onClick={handleToday} 
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EFF6FF';
                e.currentTarget.style.borderColor = '#1E40AF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E0E7FF';
              }}
              style={styles.actionButton}
            >
              Today
            </button>
            <button 
              type="button" 
              onClick={handleClear}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEE2E2';
                e.currentTarget.style.borderColor = '#FECACA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E0E7FF';
              }}
              style={styles.actionButton}
            >
              Clear
            </button>
            <button 
              type="button" 
              onClick={handleClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EFF6FF';
                e.currentTarget.style.borderColor = '#1E40AF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E0E7FF';
              }}
              style={styles.actionButton}
            >
              Close
            </button>
          </div>
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
    padding: '12px 14px',
    border: '2px solid #E0E7FF',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A2F4D',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 6px rgba(30, 64, 175, 0.08)',
  },

  displayText: {
    flex: 1,
    textAlign: 'left',
    fontSize: '13px',
  },

  calendar: {
    fontSize: '16px',
    marginLeft: '6px',
  },

  picker: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    top: 'auto',
    bottom: 'auto',
    background: '#FFFFFF',
    border: '2px solid #BFDBFE',
    borderRadius: '14px',
    padding: '12px',
    boxShadow: '0 20px 50px rgba(30, 64, 175, 0.25)',
    zIndex: '1100',
    width: 'calc(100% - 32px)',
    maxWidth: '360px',
    maxHeight: '70vh',
    overflowY: 'auto',
    animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  calendar_section: {
    marginBottom: '8px',
  },

  monthNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },

  monthYear: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1A2F4D',
    textAlign: 'center',
  },

  navButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#1E40AF',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    padding: '2px 4px',
    borderRadius: '4px',
  },

  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    marginBottom: '4px',
  },

  dayHeader: {
    textAlign: 'center',
    fontSize: '10px',
    fontWeight: '600',
    color: '#94A3B8',
    padding: '4px 0',
  },

  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
  },

  dayButton: {
    padding: '4px 1px',
    border: '2px solid transparent',
    borderRadius: '4px',
    background: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    color: '#1A2F4D',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    outline: 'none',
    minHeight: '24px',
  },

  selectedDay: {
    background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
    color: '#FFFFFF',
    fontWeight: '600',
    boxShadow: '0 2px 6px rgba(30, 64, 175, 0.2)',
  },

  todayDay: {
    border: '2px solid #1E40AF',
    color: '#1E40AF',
    fontWeight: '600',
    background: '#EFF6FF',
  },

  emptyDay: {
    padding: '4px 1px',
    color: '#D1D5DB',
    fontSize: '10px',
    fontWeight: '500',
    minHeight: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeSection: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    padding: '10px',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    borderRadius: '10px',
    border: '2px solid #DBEAFE',
  },

  timeLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    whiteSpace: 'nowrap',
  },

  timeInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#FFFFFF',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '2px solid #BFDBFE',
    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.1)',
  },

  timeInput: {
    width: '40px',
    padding: '4px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A2F4D',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#F0F9FF',
  },

  timeSeparator: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1E40AF',
    margin: '0 1px',
  },

  periodToggle: {
    display: 'flex',
    gap: '2px',
    background: '#FFFFFF',
    padding: '2px',
    borderRadius: '6px',
    border: '2px solid #BFDBFE',
    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.1)',
  },

  periodButton: {
    padding: '4px 10px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    outline: 'none',
    letterSpacing: '0.3px',
  },

  periodActive: {
    background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
    color: '#FFFFFF',
    border: 'none',
    boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)',
  },

  periodInactive: {
    background: '#F0F9FF',
    color: '#1A2F4D',
    border: 'none',
  },

  actions: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'space-between',
    paddingTop: '6px',
    borderTop: '1px solid #E0E7FF',
  },

  actionButton: {
    flex: 1,
    padding: '6px',
    border: '2px solid #E0E7FF',
    borderRadius: '6px',
    background: '#FFFFFF',
    color: '#1A2F4D',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    outline: 'none',
  },
};

export default CustomDateTimePicker;
