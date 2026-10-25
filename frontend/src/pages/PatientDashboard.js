import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getUser } from '../utils/auth';
import { toast } from 'react-toastify';
import patientDashboardStyles from '../styles/patientDashboardStyles';
import { API_URL } from '../config/api';
import DashboardLayout from '../components/DashboardLayout';
import { isActiveAppointment, filterAppointmentsForUser } from '../utils/appointmentUtils';
import CustomDropdown from '../components/CustomDropdown';
import CustomDateTimePicker from '../components/CustomDateTimePicker';

// Constants
const HEADER_FONT_SIZE = '28px';
const HEADER_FONT_WEIGHT = '800';
const HEADER_COLOR = '#0B1D3A';
const SUBTITLE_COLOR = '#64748B';
const TOAST_DURATION = 2000;

/**
 * Utility function to handle appointment card hover effects
 */
const handleAppointmentCardHoverOver = (e) => {
  e.currentTarget.style.transform = 'translateX(5px)';
  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
};

const handleAppointmentCardHoverOut = (e) => {
  e.currentTarget.style.transform = 'translateX(0)';
  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
};

/**
 * PatientDashboard - Main dashboard component for patients
 * Displays active appointments and appointment booking functionality
 */
const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: '',
    time: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = getUser();

  /**
   * Fetch active appointments for the current patient
   */
  const fetchAppointments = useCallback(async () => {
    const currentUser = getUser();
    if (!currentUser?._id) return;
    
    try {
      const response = await axios.get(`${API_URL}/appointments/all`);
      const appointmentsData = response.data.appointments || response.data;
      
      const patientAppointments = filterAppointmentsForUser(appointmentsData, currentUser)
        .filter(isActiveAppointment);
      
      setAppointments(patientAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
      toast.error('Unable to load appointments. Please refresh the page.');
    }
  }, []);

  /**
   * Fetch list of available doctors
   */
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/doctors`);
      const doctorsData = response.data.doctors || response.data;
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error.message);
      toast.error('Unable to load doctors. Please refresh the page.');
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);


  /**
   * Handle form field input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Submit appointment booking form
   */
  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.doctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (!formData.time) {
      toast.error('Please select appointment date and time');
      return;
    }
    if (!user || !user._id) {
      toast.error('User information not found. Please try logging in again.');
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      patientId: user._id,
      doctorId: formData.doctorId,
      time: formData.time,
      reason: formData.reason
    };
    
    try {
      const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`);
      const { order, keyId, fee } = orderResponse.data;

      if (!order || !keyId) {
        throw new Error('Payment order could not be created');
      }

      await loadRazorpayCheckout();
      const paymentResponse = await openRazorpayCheckout({
        key: keyId,
        order,
        amount: fee,
        user
      });

      await axios.post(`${API_URL}/api/payment/verify`, {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature
      });

      const appointmentResponse = await axios.post(
        `${API_URL}/appointments/create`,
        { ...payload, paymentId: paymentResponse.razorpay_payment_id }
      );

      if (appointmentResponse.data.success) {
        setFormData({ doctorId: '', time: '', reason: '' });
        setShowModal(false);
        fetchAppointments();
        toast.success('Appointment booked successfully', {
          autoClose: TOAST_DURATION
        });
      } else {
        throw new Error(appointmentResponse.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error creating appointment';
      console.error('Appointment booking error:', error.message);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout'));
    document.body.appendChild(script);
  });

  const openRazorpayCheckout = ({ key, order, amount, user }) => new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency,
      name: 'US-CLINIC',
      description: 'Appointment booking',
      order_id: order.id,
      prefill: {
        name: user.name,
        email: user.email
      },
      notes: {
        appointmentFee: String(amount)
      },
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled'))
      }
    });

    checkout.on('payment.failed', () => reject(new Error('Payment failed')));
    checkout.open();
  });

  /**
   * Open booking modal
   */
  const openModal = () => {
    setShowModal(true);
  };

  /**
   * Close booking modal
   */
  const closeModal = () => {
    setShowModal(false);
    setFormData({ doctorId: '', time: '', reason: '' });
  };

  /**
   * Toggle appointment details expansion
   */
  const toggleAppointmentDetails = (appointmentId) => {
    setExpandedAppointment(
      expandedAppointment === appointmentId ? null : appointmentId
    );
  };

  /**
   * Get style based on appointment status
   */
  const getStatusStyle = (status) => {
    const statusStyles = {
      'confirmed': patientDashboardStyles.statusConfirmed,
      'pending': patientDashboardStyles.statusPending,
      'cancelled': patientDashboardStyles.statusCancelled
    };
    
    return statusStyles[status.toLowerCase()] || patientDashboardStyles.statusPending;
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
          Welcome, {user?.name || 'Patient'}
        </h2>
        <p style={{ color: SUBTITLE_COLOR, margin: 0 }}>
          Manage your health appointments and medical profile.
        </p>
      </div>

      {/* Active Appointments Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ ...patientDashboardStyles.sectionTitle, color: HEADER_COLOR, margin: 0 }}>
          Active Appointments
        </h3>
      </div>
      
      {/* Book New Appointment Button */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={openModal}
          style={patientDashboardStyles.newAppointmentButton}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
          }}
        >
          📅 Book New Appointment
        </button>
      </div>

      {/* Appointments List or Empty State */}
      {appointments.length === 0 ? (
        <EmptyAppointmentsState />
      ) : (
        <div style={patientDashboardStyles.appointmentsList}>
          {appointments.map(appt => (
            <AppointmentCard
              key={appt._id}
              appointment={appt}
              isExpanded={expandedAppointment === appt._id}
              onToggleExpand={() => toggleAppointmentDetails(appt._id)}
              getStatusStyle={getStatusStyle}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <AppointmentBookingModal
          isOpen={showModal}
          onClose={closeModal}
          onSubmit={handleSubmitAppointment}
          doctors={doctors}
          formData={formData}
          onInputChange={handleInputChange}
          onDoctorChange={(value) => setFormData(prev => ({ ...prev, doctorId: value }))}
          onTimeChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
          isSubmitting={isSubmitting}
        />
      )}
    </DashboardLayout>
  );
};

/**
 * EmptyAppointmentsState Component - Shows when no appointments are scheduled
 */
const EmptyAppointmentsState = () => (
  <div style={patientDashboardStyles.emptyState}>
    <div style={patientDashboardStyles.emptyStateIcon}>📋</div>
    <div style={patientDashboardStyles.emptyStateText}>No appointments yet</div>
    <div style={patientDashboardStyles.emptyStateSubtext}>
      Book your first appointment to get started
    </div>
  </div>
);

/**
 * AppointmentCard Component - Displays a single appointment
 */
const AppointmentCard = ({
  appointment,
  isExpanded,
  onToggleExpand,
  getStatusStyle
}) => {
  const appt = appointment;
  
  return (
    <div 
      style={patientDashboardStyles.appointmentListItem}
      onMouseOver={handleAppointmentCardHoverOver}
      onMouseOut={handleAppointmentCardHoverOut}
    >
      {/* Header - Always Visible */}
      <div 
        style={patientDashboardStyles.appointmentHeader}
        onClick={onToggleExpand}
      >
        <div style={patientDashboardStyles.appointmentMainInfo}>
          <div style={patientDashboardStyles.appointmentDateBadge}>
            <div style={patientDashboardStyles.dateDay}>
              {new Date(appt.time).getDate()}
            </div>
            <div style={patientDashboardStyles.dateMonth}>
              {new Date(appt.time).toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
          
          <div style={patientDashboardStyles.appointmentSummary}>
            <div style={patientDashboardStyles.doctorName}>
              Dr. {appt.doctor.name}
            </div>
            <div style={patientDashboardStyles.appointmentTime}>
              {new Date(appt.time).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div style={patientDashboardStyles.appointmentYear}>
              {new Date(appt.time).getFullYear()}
            </div>
          </div>
        </div>
        
        <div style={patientDashboardStyles.appointmentActions}>
          <span 
            style={{
              ...patientDashboardStyles.statusBadge,
              ...getStatusStyle(appt.status)
            }}
          >
            {appt.status}
          </span>
          
          <div style={patientDashboardStyles.expandButton}>
            <span style={{
              ...patientDashboardStyles.expandIcon,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={patientDashboardStyles.appointmentDetails}>
          <div style={patientDashboardStyles.detailsGrid}>
            <div style={patientDashboardStyles.detailItem}>
              <div style={patientDashboardStyles.detailLabel}>Doctor Information</div>
              <div style={patientDashboardStyles.detailValue}>
                <div style={patientDashboardStyles.doctorInfo}>
                  <div style={patientDashboardStyles.doctorFullName}>
                    Dr. {appt.doctor.name}
                  </div>
                  <div style={patientDashboardStyles.doctorEmail}>
                    {appt.doctor.email}
                  </div>
                </div>
              </div>
            </div>

            <div style={patientDashboardStyles.detailItem}>
              <div style={patientDashboardStyles.detailLabel}>Full Date & Time</div>
              <div style={patientDashboardStyles.detailValue}>
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
              <div style={patientDashboardStyles.detailItem}>
                <div style={patientDashboardStyles.detailLabel}>Reason for Visit</div>
                <div style={patientDashboardStyles.detailValue}>{appt.reason}</div>
              </div>
            )}

            <div style={patientDashboardStyles.detailItem}>
              <div style={patientDashboardStyles.detailLabel}>Appointment ID</div>
              <div style={patientDashboardStyles.detailValue}>
                <code style={patientDashboardStyles.appointmentId}>
                  {appt._id.slice(-8).toUpperCase()}
                </code>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          {appt.notifications && appt.notifications.length > 0 && (
            <div style={patientDashboardStyles.notificationSection}>
              <div style={patientDashboardStyles.notificationTitle}>
                Notifications
              </div>
              <div style={patientDashboardStyles.notificationList}>
                {appt.notifications.map((notification, idx) => (
                  <div key={idx} style={patientDashboardStyles.notificationItem}>
                    <div style={patientDashboardStyles.notificationContent}>
                      {notification.message}
                    </div>
                    <div style={patientDashboardStyles.notificationMeta}>
                      {notification.seen ? (
                        <span style={patientDashboardStyles.notificationSeen}>✓ Seen</span>
                      ) : (
                        <span style={patientDashboardStyles.notificationNew}>● New</span>
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
 * AppointmentBookingModal Component - Modal for booking new appointments
 */
const AppointmentBookingModal = ({
  isOpen,
  onClose,
  onSubmit,
  doctors,
  formData,
  onInputChange,
  onDoctorChange,
  onTimeChange,
  isSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <div style={patientDashboardStyles.modalOverlay} onClick={onClose}>
      <div 
        style={patientDashboardStyles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={patientDashboardStyles.modalTitle}>Book New Appointment</h2>
        
        <form onSubmit={onSubmit}>
          <CustomDropdown
            label="Select Doctor"
            placeholder="Choose a doctor..."
            options={doctors.map(doctor => ({
              value: doctor._id,
              label: `${doctor.name} - ${doctor.email}`
            }))}
            value={formData.doctorId}
            onChange={onDoctorChange}
          />

          <CustomDateTimePicker
            label="Date & Time"
            value={formData.time}
            onChange={onTimeChange}
            minDate={new Date().toISOString().slice(0, 16)}
          />

          <div style={patientDashboardStyles.formGroup}>
            <label style={patientDashboardStyles.formLabel}>
              Reason for Visit (Optional)
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={onInputChange}
              style={{
                ...patientDashboardStyles.formInput,
                minHeight: '100px',
                resize: 'vertical',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                lineHeight: '1.5',
              }}
              placeholder="Describe your symptoms or reason for the appointment..."
            />
          </div>

          <div style={patientDashboardStyles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={patientDashboardStyles.cancelButton}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)';
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #F3F4F6 0%, #FFFBFE 100%)';
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...patientDashboardStyles.submitButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 28px rgba(30, 64, 175, 0.35)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(30, 64, 175, 0.3)';
                }
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default PatientDashboard;
