import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import DashboardLayout from '../components/DashboardLayout';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/doctors`);
        const doctorsData = res.data.doctors || res.data;
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#0B1D3A', fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>
          Our Doctors
        </h2>
        <p style={{ color: '#64748B', margin: 0 }}>Browse and connect with our experienced medical professionals.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
          <p>Loading doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>👨‍⚕️</div>
          <div style={styles.emptyStateText}>No doctors found</div>
          <div style={styles.emptyStateSubtext}>Please check back later</div>
        </div>
      ) : (
        <div style={styles.doctorsGrid}>
          {doctors.map((doc) => (
            <div key={doc._id} style={styles.doctorCard}>
              <div style={styles.doctorAvatar}>
                {doc.name ? doc.name.charAt(0).toUpperCase() : 'D'}
              </div>
              <h3 style={styles.doctorName}>Dr. {doc.name}</h3>
              <p style={styles.doctorEmail}>{doc.email}</p>
              <button
                style={styles.contactButton}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(42, 125, 225, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 125, 225, 0.2)';
                }}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

const styles = {
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748B',
  },
  emptyStateIcon: {
    fontSize: '60px',
    marginBottom: '16px',
  },
  emptyStateText: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#0B1D3A',
  },
  emptyStateSubtext: {
    fontSize: '14px',
  },
  doctorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  doctorCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  },
  doctorAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2A7DE1 0%, #1A5CB8 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 auto 16px',
    boxShadow: '0 8px 20px rgba(42, 125, 225, 0.3)',
  },
  doctorName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0B1D3A',
    margin: '0 0 8px 0',
  },
  doctorEmail: {
    fontSize: '13px',
    color: '#64748B',
    margin: '0 0 16px 0',
  },
  contactButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #2A7DE1 0%, #1A5CB8 100%)',
    color: '#FFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(42, 125, 225, 0.2)',
    transition: 'all 0.2s ease',
  },
};

export default DoctorsPage;
