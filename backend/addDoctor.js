#!/usr/bin/env node
/**
 * Admin Setup Script - Add Doctor to Database
 * Usage: node addDoctor.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Fix DNS for MongoDB Atlas SRV record lookup
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const User = require('./models/User');

const addDoctor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email: 'utkarsh123@gmail.com' });
    if (existingDoctor) {
      console.log('⚠️  Doctor already exists with this email');
      console.log('Doctor:', existingDoctor);
      process.exit(0);
    }

    // Create new doctor
    const doctorData = {
      name: 'Dr. Utkarsh',
      email: 'utkarsh123@gmail.com',
      password: '123445678', // Minimum 8 characters required
      role: 'doctor',
      phone: '+919876543210', // Valid phone format
      gender: 'male',
      address: 'Medical Center',
    };

    const doctor = new User(doctorData);
    await doctor.save();

    console.log('✅ Doctor added successfully!');
    console.log('Email:', doctor.email);
    console.log('Role:', doctor.role);
    console.log('ID:', doctor._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding doctor:', error.message);
    process.exit(1);
  }
};

addDoctor();
