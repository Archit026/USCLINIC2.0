import React from 'react';
import ReactDOM from 'react-dom/client';
import setupAxiosInterceptors from './config/axiosConfig';
import App from './App';
import './index.css';

// Setup axios interceptors BEFORE rendering the app
setupAxiosInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);