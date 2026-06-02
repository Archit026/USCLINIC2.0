#!/usr/bin/env node
/**
 * MongoDB Connection Diagnostic Script
 * Usage: node testMongo.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const dns = require('dns').promises;

// Use Google DNS for MongoDB Atlas SRV lookups
const dnsFallback = require('dns');
dnsFallback.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const testConnection = async () => {
  console.log('🔍 MongoDB Connection Diagnostic\n');
  
  const MONGO_URI = process.env.MONGO_URI;
  console.log('📝 Connection String:', MONGO_URI);
  console.log('');

  // Test 1: DNS Resolution
  console.log('1️⃣  Testing DNS Resolution...');
  try {
    const addresses = await dns.resolveSrv('_mongodb._tcp.usclinic.kdshts0.mongodb.net');
    console.log('✅ DNS resolution successful');
    console.log('   Found', addresses.length, 'SRV records');
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    console.log('   This means MongoDB Atlas cluster is unreachable');
  }
  console.log('');

  // Test 2: MongoDB Connection
  console.log('2️⃣  Testing MongoDB Connection...');
  try {
    // Remove deprecated options
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connection successful!');
    
    // Get database info
    const db = mongoose.connection.db;
    const admin = db.admin();
    const status = await admin.serverStatus();
    console.log('   Server uptime:', Math.floor(status.uptime / 60), 'minutes');
    
    process.exit(0);
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('');
    console.log('💡 Possible Solutions:');
    console.log('');
    console.log('1. Update IP Whitelist in MongoDB Atlas:');
    console.log('   - Go to https://cloud.mongodb.com');
    console.log('   - Click Security → Network Access');
    console.log('   - Add your IP or allow 0.0.0.0/0 (for testing)');
    console.log('');
    console.log('2. Check if cluster exists:');
    console.log('   - Go to https://cloud.mongodb.com');
    console.log('   - Verify cluster "usclinic" exists');
    console.log('');
    console.log('3. Verify credentials:');
    console.log('   - Username: kumararchit321_db_user');
    console.log('   - Check password in MongoDB Atlas');
    console.log('');
    console.log('4. Test network connectivity:');
    console.log('   - Try: ping 8.8.8.8');
    console.log('   - Try: nslookup usclinic.kdshts0.mongodb.net');
    
    process.exit(1);
  }
};

testConnection();
