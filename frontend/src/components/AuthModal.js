import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { setUser } from '../utils/auth';
import { toast } from 'react-toastify';
import { API_URL } from '../config/api';

const AuthModal = ({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setName('');
      setEmail('');
      setVerificationCode('');
      setVerificationStep(false);
      setPassword('');
      setRole('patient');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password, role });
        setUser(res.data.user, res.data.token);
        
        // Show success toast
        toast.success('Login Successful! 🎉', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
        });
        
        // Close modal immediately
        onClose();
        
        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (!verificationStep) {
        await axios.post(`${API_URL}/auth/signup`, {
          name, email, password, role
        });
        setVerificationStep(true);
        toast.success('Verification code sent to your email');
        setIsLoading(false);
      } else {
        const res = await axios.post(`${API_URL}/auth/verify-signup`, {
          email,
          code: verificationCode
        });
        setUser(res.data.user, res.data.token);
        toast.success('Account verified successfully! 🎉', { position: 'top-center', autoClose: 2000, hideProgressBar: false });
        onClose();
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = `${mode === 'login' ? 'Login' : 'Signup'} failed`;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors
          .map(e => `${e.field}: ${e.message}`)
          .join('; ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button 
          style={styles.closeBtn}
          onClick={onClose}
          disabled={isLoading}
        >&times;</button>
        
        <h2 style={styles.title}>{mode === 'login' ? 'Welcome Back' : (verificationStep ? 'Verify Your Account' : 'Create Account')}</h2>
        <p style={styles.subtitle}>
          {mode === 'login' ? 'Sign in to access your dashboard' : (verificationStep ? 'Enter the 6-digit code sent to your email' : 'Join US-Clinic for seamless healthcare')}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && !verificationStep && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isLoading}
                style={styles.input}
                placeholder="Enter your full name"
              />
            </div>
          )}

          {(mode === 'login' || (mode === 'signup' && !verificationStep)) && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} style={styles.input} placeholder="name@example.com" />
            </div>
          )}

          {mode === 'signup' && verificationStep && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Verification Code</label>
              <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" required value={verificationCode} onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))} disabled={isLoading} style={styles.input} placeholder="123456" />
            </div>
          )}
          {(mode === 'login' || (mode === 'signup' && !verificationStep)) && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} style={styles.input} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>I am a...</label>
                <select value={role} onChange={e => setRole(e.target.value)} disabled={isLoading} style={styles.select}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : (verificationStep ? 'Verify & Create Account' : 'Send Verification Code'))}
          </button>
        </form>

        <div style={styles.footer}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span
            style={styles.switchLink}
            onClick={() => !isLoading && setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(11, 29, 58, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  modal: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px',
    width: '90%',
    maxWidth: '420px',
    position: 'relative',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
    animation: 'fadeUp 0.3s ease-out',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '24px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#94A3B8',
    lineHeight: 1,
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0B1D3A',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748B',
    marginBottom: '24px',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    fontWeight: '500',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  submitBtn: {
    marginTop: '8px',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #2A7DE1 0%, #1A5CB8 100%)',
    color: '#FFF',
    fontSize: '16px',
    fontWeight: '600',
    boxShadow: '0 4px 14px rgba(42,125,225,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748B',
  },
  switchLink: {
    color: '#2A7DE1',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

export default AuthModal;
