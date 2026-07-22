import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getUser } from '../utils/auth';
import { toast } from 'react-toastify';
import doctorDashboardStyles from '../styles/doctorDashboardStyles';
import { API_URL } from '../config/api';
import DashboardLayout from '../components/DashboardLayout';
import { isActiveAppointment, filterAppointmentsForUser } from '../utils/appointmentUtils';

// Constants
const EMPTY_STATE_ICON = '📋';
const TOAST_DURATION = 2000;
const HEADER_FONT_SIZE = '28px';
const HEADER_FONT_WEIGHT = '800';
const HEADER_COLOR = '#0B1D3A';
const SUBTITLE_COLOR = '#64748B';

/**
 * Utility function to handle card hover effects
 */
const handleCardHoverOver = (e) => {
  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
  e.currentTarget.style.borderColor = '#CBD5E1';
};

const handleCardHoverOut = (e) => {
  e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.06)';
  e.currentTarget.style.borderColor = '#E2E8F0';
};

/**
 * DoctorDashboard - Main dashboard component for doctors
 * Displays active appointments, statistics, and appointment management tools
 */
const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    appointmentId: '',
    newTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });
  
  const user = getUser();

  /**
   * Fetch all active appointments for the current doctor
   */
  const fetchAppointments = useCallback(async () => {
    const currentUser = getUser();
    if (!currentUser?._id) return;
    
    try {
      const response = await axios.get(`${API_URL}/appointments/all`);
      const appointmentsData = response.data.appointments || response.data;
      
      const doctorAppointments = filterAppointmentsForUser(appointmentsData, currentUser)
        .filter(isActiveAppointment);
      
      setAppointments(doctorAppointments);
      
      // Calculate appointment statistics
      const total = doctorAppointments.length;
      const pending = doctorAppointments.filter(appt => appt.status === 'pending').length;
      const confirmed = doctorAppointments.filter(appt => appt.status === 'confirmed').length;
      const completed = doctorAppointments.filter(appt => appt.status === 'completed').length;
      
      setStats({ total, pending, confirmed, completed });
    } catch (error) {
      console.error('Failed to fetch appointments:', error.message);
      toast.error('Unable to load appointments. Please refresh the page.');
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /**
   * Toggle appointment details expansion
   */
  const toggleAppointmentDetails = (appointmentId) => {
    setExpandedAppointment(
      expandedAppointment === appointmentId ? null : appointmentId
    );
  };

  /**
   * Update appointment status
   */
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/appointments/status/${appointmentId}`, {
        status: newStatus,
        doctorId: user._id
      });
      
      fetchAppointments();
      toast.success(`Appointment marked as ${newStatus}`, {
        autoClose: TOAST_DURATION
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update appointment status';
      console.error(`Error updating appointment status:`, error.message);
      toast.error(errorMessage);
    }
  };

  /**
   * Open reschedule modal
   */
  const openRescheduleModal = (appointmentId) => {
    setRescheduleData({
      appointmentId,
      newTime: ''
    });
    setShowRescheduleModal(true);
  };

  /**
   * Close reschedule modal
   */
  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setRescheduleData({ appointmentId: '', newTime: '' });
  };

  /**
   * Submit reschedule form
   */
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.patch(`${API_URL}/appointments/status/${rescheduleData.appointmentId}`, {
        status: 'confirmed',
        doctorId: user._id
      });
      
      closeRescheduleModal();
      fetchAppointments();
      toast.success('Appointment rescheduled successfully', {
        autoClose: TOAST_DURATION
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error.message);
      toast.error('Failed to reschedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input changes in form fields
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRescheduleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Get style based on appointment status
   */
  const getStatusStyle = (status) => {
    const statusStyles = {
      'confirmed': doctorDashboardStyles.statusConfirmed,
      'pending': doctorDashboardStyles.statusPending,
      'completed': doctorDashboardStyles.statusCompleted,
      'cancelled': doctorDashboardStyles.statusCancelled
    };
    
    return statusStyles[status.toLowerCase()] || doctorDashboardStyles.statusPending;
  };
  return (
    <DashboardLayout>
      {/* Header Section */}
      <div style={{ marginBottom: '30px', animation: 'fadeUp 0.5s ease both' }}>
        <h2 style={{ 
          color: HEADER_COLOR, 
          fontSize: HEADER_FONT_SIZE, 
          fontWeight: HEADER_FONT_WEIGHT, 
          margin: '0 0 8px 0' 
        }}>
          Welcome, Dr. {user?.name || 'Doctor'}
        </h2>
        <p style={{ color: SUBTITLE_COLOR, margin: 0 }}>
          Review appointment requests, reschedule, or mark appointments as complete.
        </p>
      </div>

      {/* Statistics Section */}
      <div style={doctorDashboardStyles.statsContainer}>
        <StatCard 
          value={stats.total} 
          label="Total Appointments" 
        />
        <StatCard 
          value={stats.pending} 
          label="Pending Requests" 
        />
        <StatCard 
          value={stats.confirmed} 
          label="Confirmed" 
        />
        <StatCard 
          value={stats.completed} 
          label="Completed" 
        />
      </div>

      {/* Active Appointments Section */}
      <h3 style={{ ...doctorDashboardStyles.sectionTitle, color: HEADER_COLOR }}>
        Active Appointments
      </h3>
      
      {appointments.length === 0 ? (
        <div style={doctorDashboardStyles.emptyState}>
          <div style={doctorDashboardStyles.emptyStateIcon}>{EMPTY_STATE_ICON}</div>
          <div style={doctorDashboardStyles.emptyStateText}>No appointments scheduled</div>
          <div style={doctorDashboardStyles.emptyStateSubtext}>
            Your appointment requests will appear here
          </div>
        </div>
      ) : (
        <div style={doctorDashboardStyles.appointmentsList}>
          {appointments.map(appt => (
            <AppointmentItem
              key={appt._id}
              appointment={appt}
              isExpanded={expandedAppointment === appt._id}
              onToggleExpand={() => toggleAppointmentDetails(appt._id)}
              onStatusUpdate={handleUpdateStatus}
              onReschedule={() => openRescheduleModal(appt._id)}
              getStatusStyle={getStatusStyle}
            />
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={closeRescheduleModal}
          onSubmit={handleRescheduleSubmit}
          rescheduleData={rescheduleData}
          onInputChange={handleInputChange}
          isSubmitting={isSubmitting}
        />
      )}
    </DashboardLayout>
  );
};

/**
 * StatCard Component - Displays a single statistic
 */
const StatCard = ({ value, label }) => (
  <div 
    style={doctorDashboardStyles.statCard}
    onMouseOver={handleCardHoverOver}
    onMouseOut={handleCardHoverOut}
  >
    <div style={doctorDashboardStyles.statNumber}>{value}</div>
    <div style={doctorDashboardStyles.statLabel}>{label}</div>
  </div>
);

/**
 * AppointmentItem Component - Displays a single appointment with details
 */
const AppointmentItem = ({
  appointment,
  isExpanded,
  onToggleExpand,
  onStatusUpdate,
  onReschedule,
  getStatusStyle
}) => {
  const appt = appointment;
  
  return (
    <div 
      style={doctorDashboardStyles.appointmentListItem}
      onMouseOver={handleCardHoverOver}
      onMouseOut={handleCardHoverOut}
    >
      {/* Header - Always Visible */}
      <div 
        style={doctorDashboardStyles.appointmentHeader}
        onClick={onToggleExpand}
      >
        <div style={doctorDashboardStyles.appointmentMainInfo}>
          <div style={doctorDashboardStyles.appointmentDateBadge}>
            <div style={doctorDashboardStyles.dateDay}>
              {new Date(appt.time).getDate()}
            </div>
            <div style={doctorDashboardStyles.dateMonth}>
              {new Date(appt.time).toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
          
          <div style={doctorDashboardStyles.appointmentSummary}>
            <div style={doctorDashboardStyles.patientName}>{appt.patient.name}</div>
            <div style={doctorDashboardStyles.appointmentTime}>
              {new Date(appt.time).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div style={doctorDashboardStyles.appointmentYear}>
              {new Date(appt.time).getFullYear()}
            </div>
          </div>
        </div>
        
        <div style={doctorDashboardStyles.appointmentActions}>
          <span 
            style={{
              ...doctorDashboardStyles.statusBadge,
              ...getStatusStyle(appt.status)
            }}
          >
            {appt.status}
          </span>
          
          <div style={doctorDashboardStyles.expandButton}>
            <span style={{
              ...doctorDashboardStyles.expandIcon,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={doctorDashboardStyles.appointmentDetails}>
          <div style={doctorDashboardStyles.detailsGrid}>
            <div style={doctorDashboardStyles.detailItem}>
              <div style={doctorDashboardStyles.detailLabel}>Patient Information</div>
              <div style={doctorDashboardStyles.detailValue}>
                <div style={doctorDashboardStyles.patientInfo}>
                  <div style={doctorDashboardStyles.patientFullName}>{appt.patient.name}</div>
                  <div style={doctorDashboardStyles.patientEmail}>{appt.patient.email}</div>
                </div>
              </div>
            </div>

            <div style={doctorDashboardStyles.detailItem}>
              <div style={doctorDashboardStyles.detailLabel}>Full Date & Time</div>
              <div style={doctorDashboardStyles.detailValue}>
                {new Date(appt.time).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {appt.reason && (
              <div style={doctorDashboardStyles.detailItem}>
                <div style={doctorDashboardStyles.detailLabel}>Reason for Visit</div>
                <div style={doctorDashboardStyles.detailValue}>{appt.reason}</div>
              </div>
            )}

            <div style={doctorDashboardStyles.detailItem}>
              <div style={doctorDashboardStyles.detailLabel}>Appointment ID</div>
              <div style={doctorDashboardStyles.detailValue}>
                <code style={doctorDashboardStyles.appointmentId}>
                  {appt._id.slice(-8).toUpperCase()}
                </code>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={doctorDashboardStyles.actionButtonsSection}>
            <div style={doctorDashboardStyles.actionButtonsTitle}>Quick Actions</div>
            <div style={doctorDashboardStyles.buttonGroup}>
              {appt.status === 'pending' && (
                <>
                  <button
                    onClick={() => onStatusUpdate(appt._id, 'confirmed')}
                    style={doctorDashboardStyles.acceptButton}
                    onMouseOver={(e) => { e.target.style.background = '#047857'; }}
                    onMouseOut={(e) => { e.target.style.background = '#059669'; }}
                  >
                    Accept
                  </button>
                  
                  <button
                    onClick={onReschedule}
                    style={doctorDashboardStyles.rescheduleButton}
                    onMouseOver={(e) => { e.target.style.background = '#B45309'; }}
                    onMouseOut={(e) => { e.target.style.background = '#D97706'; }}
                  >
                    Reschedule
                  </button>
                  
                  <button
                    onClick={() => onStatusUpdate(appt._id, 'cancelled')}
                    style={doctorDashboardStyles.rejectButton}
                    onMouseOver={(e) => { e.target.style.background = '#FEF2F2'; }}
                    onMouseOut={(e) => { e.target.style.background = '#FFFFFF'; }}
                  >
                    Reject
                  </button>
                </>
              )}
              
              {appt.status === 'confirmed' && (
                <button
                  onClick={() => onStatusUpdate(appt._id, 'completed')}
                  style={doctorDashboardStyles.completeButton}
                  onMouseOver={(e) => { e.target.style.background = '#1D4ED8'; }}
                  onMouseOut={(e) => { e.target.style.background = '#2563EB'; }}
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Notifications */}
          {appt.notifications && appt.notifications.length > 0 && (
            <div style={doctorDashboardStyles.notificationSection}>
              <div style={doctorDashboardStyles.notificationTitle}>Notifications</div>
              <div style={doctorDashboardStyles.notificationList}>
                {appt.notifications.map((notification, idx) => (
                  <div key={idx} style={doctorDashboardStyles.notificationItem}>
                    <div style={doctorDashboardStyles.notificationContent}>
                      {notification.message}
                    </div>
                    <div style={doctorDashboardStyles.notificationMeta}>
                      {notification.seen ? (
                        <span style={doctorDashboardStyles.notificationSeen}>✓ Seen</span>
                      ) : (
                        <span style={doctorDashboardStyles.notificationNew}>● New</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * RescheduleModal Component - Modal for rescheduling appointments
 */
const RescheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  rescheduleData,
  onInputChange,
  isSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <div style={doctorDashboardStyles.modalOverlay} onClick={onClose}>
      <div 
        style={doctorDashboardStyles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={doctorDashboardStyles.modalTitle}>Reschedule Appointment</h2>
        
        <form onSubmit={onSubmit}>
          <input
            type="datetime-local"
            name="newTime"
            value={rescheduleData.newTime}
            onChange={onInputChange}
            style={doctorDashboardStyles.formInput}
            min={new Date().toISOString().slice(0, 16)}
            required
          />

          <div style={doctorDashboardStyles.modalButtonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={doctorDashboardStyles.cancelButton}
              onMouseOver={(e) => { e.target.style.background = '#F1F5F9'; }}
              onMouseOut={(e) => { e.target.style.background = '#FFFFFF'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...doctorDashboardStyles.submitButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) e.target.style.background = '#1D4ED8';
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) e.target.style.background = '#2563EB';
              }}
            >
              {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorDashboard;
