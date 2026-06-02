// src/pages/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { getUser } from '../utils/auth';
import authPageStyles from '../styles/authPageStyles';
import { API_URL } from '../config/api';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = getUser();
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    }
  }, [navigate]);

  const handleSignup = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        name, email, password, role
      });
      navigate('/login');
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Signup failed';
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Format validation errors
        errorMessage = errorData.errors
          .map(e => `${e.field}: ${e.message}`)
          .join('; ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div style={authPageStyles.page}>
      <div style={authPageStyles.container}>
        {/* Form Section */}
        <div style={authPageStyles.formSection}>
          <div style={authPageStyles.formCard}>
            <h2 style={authPageStyles.heading}>Create Account</h2>
            <p style={authPageStyles.subtitle}>
              Join our healthcare community today
            </p>
            
            {error && (
              <div style={authPageStyles.errorMessage}>
                {error}
              </div>
            )}

            <div style={authPageStyles.formGroup}>
              <label style={authPageStyles.label}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                onKeyPress={handleKeyPress}
                style={{
                  ...authPageStyles.input,
                  ...(focusedField === 'name' ? authPageStyles.inputFocus : {})
                }}
              />
            </div>

            <div style={authPageStyles.formGroup}>
              <label style={authPageStyles.label}>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                onKeyPress={handleKeyPress}
                style={{
                  ...authPageStyles.input,
                  ...(focusedField === 'email' ? authPageStyles.inputFocus : {})
                }}
              />
            </div>

            <div style={authPageStyles.formGroup}>
              <label style={authPageStyles.label}>Password</label>
              <input
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                onKeyPress={handleKeyPress}
                style={{
                  ...authPageStyles.input,
                  ...(focusedField === 'password' ? authPageStyles.inputFocus : {})
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '8px',
                lineHeight: '1.4'
              }}>
                Password must have: 8+ characters, uppercase, lowercase, and a number
              </p>
            </div>

            <div style={authPageStyles.formGroup}>
              <label style={authPageStyles.label}>Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                onFocus={() => setFocusedField('role')}
                onBlur={() => setFocusedField('')}
                style={{
                  ...authPageStyles.select,
                  ...(focusedField === 'role' ? authPageStyles.selectFocus : {})
                }}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>            <button 
              onClick={handleSignup}
              disabled={isLoading}
              style={{
                ...authPageStyles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  Object.assign(e.target.style, {
                    transform: authPageStyles.buttonHover.transform,
                    boxShadow: authPageStyles.buttonHover.boxShadow,
                    background: authPageStyles.buttonHover.background
                  });
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  Object.assign(e.target.style, {
                    transform: 'translateY(0)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                    background: 'linear-gradient(45deg, #3b82f6, #2563eb)'
                  });
                }
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(1px)';
                }
              }}
              onMouseUp={(e) => {
                if (!isLoading) {
                  e.target.style.transform = authPageStyles.buttonHover.transform;
                }
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div style={authPageStyles.linkContainer}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={authPageStyles.link}
                onMouseOver={(e) => {
                  e.target.style.color = authPageStyles.linkHover.color;
                  e.target.style.textDecoration = authPageStyles.linkHover.textDecoration;
                }}
                onMouseOut={(e) => {
                  e.target.style.color = authPageStyles.link.color;
                  e.target.style.textDecoration = authPageStyles.link.textDecoration;
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>        {/* Image Section */}
        <div style={authPageStyles.imageSection}>
          <div 
            style={authPageStyles.imageContainer}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={authPageStyles.welcomeText}>Welcome to US-Clinic</h3>
            <p style={authPageStyles.welcomeSubtext}>
              Start your healthcare journey with us. Access quality medical care and modern facilities.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2907/2907237.png" 
                alt="Dental Icon" 
                style={authPageStyles.image}
                onMouseOver={(e) => {
                  e.target.style.transform = authPageStyles.imageHover.transform;
                  e.target.style.filter = authPageStyles.imageHover.filter;
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.filter = authPageStyles.image.filter;
                }}
              />
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3050/3050525.png" 
                alt="Dental Icon 2" 
                style={authPageStyles.image}
                onMouseOver={(e) => {
                  e.target.style.transform = authPageStyles.imageHover.transform;
                  e.target.style.filter = authPageStyles.imageHover.filter;
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.filter = authPageStyles.image.filter;
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>  );
}

export default Signup;