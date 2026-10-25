const mongoose = require('mongoose');
const dns = require('dns');

// Fix DNS for MongoDB Atlas SRV record lookup
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

/**
 * SECURITY FIX #1: Move credentials to environment variables
 * DO NOT commit the actual .env file to version control
 * Copy .env.example to .env and fill in your actual credentials
 */
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ CRITICAL: MONGO_URI environment variable is not set');
  console.error('Please create a .env file in the backend directory');
  console.error('Copy from .env.example and fill in your actual MongoDB credentials');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Check your MongoDB Atlas IP whitelist and network access.');
    process.exit(1);
  }
};

module.exports = connectDB;
