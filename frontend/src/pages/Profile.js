import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUser, setUser } from '../utils/auth';
import { API_URL } from '../config/api';
import DashboardLayout from '../components/DashboardLayout';

const Profile = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userId = user?._id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    phone: '',
    gender: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${API_URL}/auth/profile/${userId}`);
      const data = res.data.user || res.data;
      setFormData({
        name: data.name || '',
        email: data.email || '',
        age: data.age || '',
        phone: data.phone || '',
        gender: data.gender || '',
        address: data.address || ''
      });
      setMessage({ text: '', type: '' });
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load profile data.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchProfile();
  }, [userId, fetchProfile, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = { ...formData };
      if (payload.age === '') delete payload.age;
      if (payload.gender === '') delete payload.gender;
      if (payload.phone === '') delete payload.phone;
      if (payload.address === '') delete payload.address;

      const res = await axios.put(`${API_URL}/auth/profile/${user._id}`, payload);
      // Update local storage user just in case
      const updatedUser = res.data.user;
      setUser(updatedUser);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Error updating profile';
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Format validation errors
        errorMessage = errorData.errors
          .map(e => `${e.field}: ${e.message}`)
          .join('; ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.loader}>Loading profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 style={styles.title}>My Profile</h2>
          <p style={styles.subtitle}>Update your personal information</p>
        </div>

        {message.text && (
          <div style={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                style={styles.input}
                min="0"
                max="120"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              placeholder="Enter your full address"
            />
          </div>

          <button type="submit" disabled={saving} style={styles.submitBtn}>
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

const styles = {
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '500px',
    fontSize: '20px',
    color: '#64748B',
    fontWeight: '500'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '40px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    maxWidth: '700px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2A7DE1 0%, #1A5CB8 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 auto 16px',
    boxShadow: '0 8px 20px rgba(42, 125, 225, 0.3)',
    border: '3px solid #FFFFFF'
  },
  title: {
    fontSize: '28px',
    color: '#0B1D3A',
    margin: '0 0 8px 0',
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    margin: 0,
  },
  successMsg: {
    background: 'rgba(34,197,94,0.15)',
    color: '#15803D',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center',
    fontWeight: '500',
    border: '2px solid #4ADE80',
  },
  errorMsg: {
    background: 'rgba(239,68,68,0.15)',
    color: '#991B1B',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center',
    fontWeight: '500',
    border: '2px solid #F87171',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'flex',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0B1D3A',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #E2E8F0',
    background: '#FFFFFF',
    color: '#0B1D3A',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #E2E8F0',
    background: '#FFFFFF',
    color: '#0B1D3A',
    fontSize: '15px',
    outline: 'none',
  },
  submitBtn: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #2A7DE1 0%, #1A5CB8 100%)',
    color: '#FFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(42, 125, 225, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
  },
};


export default Profile;
