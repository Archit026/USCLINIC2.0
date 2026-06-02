# MongoDB & Database Setup Guide

## Quick Start: Add Doctor to Database

### Option 1: Using MongoDB Compass (Easiest)

1. **Download MongoDB Compass**
   - Visit: https://www.mongodb.com/products/compass
   - Install it

2. **Connect to Your Database**
   - Open MongoDB Compass
   - Paste your connection string in the "URI" field
   - Click Connect

3. **Add Doctor Record**
   - Go to Collections → US-CLINIC (or your db name) → users
   - Click "INSERT DOCUMENT"
   - Paste this JSON (update password with bcrypt hash):
   ```json
   {
     "name": "Dr. Utkarsh",
     "email": "utkarsh123@gmail.com",
     "password": "$2a$10$Dh4VVc.K2rRlvqTqBmUzx.A3f8lSmJvYFwu3XyQbJrJ5VCrN7jUg6",
     "role": "doctor",
     "phone": "+91-9876543210",
     "gender": "male",
     "address": "Medical Center",
     "createdAt": { "$date": "2026-06-01T00:00:00Z" },
     "updatedAt": { "$date": "2026-06-01T00:00:00Z" }
   }
   ```

---

### Option 2: Using the Node Script (When MongoDB is Connected)

1. **Verify your MONGO_URI in `backend/.env`:**
   ```
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.xyz.mongodb.net/dbname?retryWrites=true&w=majority
   ```

2. **Run the script:**
   ```bash
   cd backend
   node addDoctor.js
   ```

---

### Option 3: Create New MongoDB Atlas Cluster (If Existing is Down)

1. **Go to MongoDB Atlas:** https://account.mongodb.com/account/login

2. **Create a new cluster:**
   - Click "Create" → "Build a Database"
   - Choose the free tier
   - Create a user with username/password
   - Get the connection string

3. **Update `backend/.env` with new connection string:**
   ```
   MONGO_URI=mongodb+srv://username:password@newcluster.xyz.mongodb.net/us_clinic?retryWrites=true&w=majority
   ```

4. **Run the add doctor script:**
   ```bash
   cd backend
   node addDoctor.js
   ```

---

## Password Hash Reference

The bcrypt hash `$2a$10$Dh4VVc.K2rRlvqTqBmUzx.A3f8lSmJvYFwu3XyQbJrJ5VCrN7jUg6` = password: `123445678`

If you want to use a different password:
- Use an online bcrypt generator: https://bcryptencoder.com/
- Generate hash for your password

---

## Verify Doctor Was Added

**Using MongoDB Compass:**
- Navigate to: Collections → users → Filter by email: `utkarsh123@gmail.com`

**Using API:**
```bash
curl http://localhost:5000/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"utkarsh123@gmail.com","password":"123445678"}'
```
