import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUser } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_URL } from '../config/api';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/doctors`);
      const doctorsData = res.data.doctors || res.data;
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const addDoctor = async () => {
    if (!name || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      // Check if doctor already exists
      if (doctors.length > 0) {
        toast.error('Only one doctor is allowed in the system');
        return;
      }

      await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
        role: 'doctor',
      });
      fetchDoctors();
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error adding doctor:', error);
      if (error.response?.data?.message === 'Doctor already exists') {
        toast.error('Only one doctor is allowed in the system');
      } else {
        toast.error('Failed to add doctor. Maybe email already exists.');
      }
    }
  };



  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    color: '#0B1D3A',
    fontFamily: "'Inter', sans-serif"
  };



  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    margin: '8px 0',
    borderRadius: '10px',
    border: '2px solid #E2E8F0',
    background: '#FFFFFF',
    color: '#0B1D3A',
    fontSize: '16px',
    outline: 'none',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #2A7DE1 0%, #1A5CB8 100%)',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
    boxShadow: '0 4px 14px rgba(42, 125, 225, 0.3)',
  };



  const listItemStyle = {
    background: '#F3F8FE',
    border: '2px solid #DBEAFE',
    padding: '12px 16px',
    margin: '8px 0',
    borderRadius: '10px',
    color: '#0B1D3A',
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#0B1D3A', fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>
          Admin Dashboard
        </h2>
        <p style={{ color: '#64748B', margin: 0 }}>Manage doctors and system configuration.</p>
      </div>

      <div style={containerStyle}>
        {doctors.length === 0 ? (
          <>
            <h3 style={{ color: '#0B1D3A', marginTop: '30px', fontWeight: '700' }}>Add Doctor</h3>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            /><br />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            /><br />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            /><br />
            <button onClick={addDoctor} style={buttonStyle}>Add Doctor</button>
          </>
        ) : (
          <p style={{ color: '#64748B', marginTop: '20px' }}>
            Maximum number of doctors (1) already registered
          </p>
        )}

        <h3 style={{ color: '#0B1D3A', marginTop: '30px', fontWeight: '700' }}>Registered Doctors</h3>
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {doctors.length === 0 ? (
            <p>No doctors found.</p>
          ) : (
            doctors.map((doc) => (
              <li key={doc._id} style={listItemStyle}>
                {doc.name} - {doc.email}
              </li>
            ))
          )}
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
