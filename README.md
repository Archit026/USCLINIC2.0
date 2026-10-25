# US-CLINIC

US-CLINIC is a modern, full-stack clinic management system designed for single-doctor clinics. It provides seamless appointment booking with integrated payments, user authentication, and role-based dashboards.

---

## Features

- **Single Doctor System**
  - Designed specifically for clinics with one primary doctor
  - Admin can register only one doctor in the system
  - All appointments are automatically routed to the primary doctor

- **User Authentication**
  - Secure signup and login for patients and admin
  - Role-based access control (Patient/Doctor/Admin)

- **Appointment Management**
  - Online appointment booking with integrated payment
  - Real-time availability checking
  - Appointment status tracking (pending/confirmed/cancelled/completed)
  - Real-time notifications for status changes

- **Payment Integration**
  - Secure payment processing using Razorpay
  - Instant payment confirmation
  - Payment status tracking
  - Configurable appointment fees

- **Role-Based Dashboards**
  - **Patient Dashboard:** Book appointments, make payments, view history
  - **Doctor Dashboard:** Manage appointments, update statuses
  - **Admin Dashboard:** Manage doctor profile and system settings

---

## Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Payment Gateway:** Razorpay
- **Email Service:** Resend for notifications
- **Other:** dotenv, cors

### Signup verification configuration

Signup now requires a six-digit OTP sent by email. For Render, configure Resend in the service environment:

```env
# Recommended for Render: HTTPS email delivery
RESEND_API_KEY=re_your_api_key
RESEND_FROM=US-CLINIC <onboarding@resend.dev>

# Local SMTP fallback
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=US-CLINIC <no-reply@example.com>
```

Resend's default `onboarding@resend.dev` sender can send only to the email address
associated with the Resend account. For other recipients, verify a domain in Resend
and set `RESEND_FROM` to an address on that domain.

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or cloud)
- Razorpay account and API keys
- Resend account for email notifications

### 1. Clone the Repository

```bash
git clone https://github.com/Anshul-18/US-CLINIC.git
cd US-CLINIC
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file in the `backend` directory:

```env
RESEND_API_KEY=your_resend_api_key_here
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
APPOINTMENT_FEE=100
```

#### Start MongoDB

Make sure MongoDB is running locally or update the connection string in `backend/config/db.js` for your setup.

#### Start Backend Server

```bash
npm run dev
```

The backend will run on [http://localhost:5000](http://localhost:5000).

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The frontend will run on [http://localhost:3000](http://localhost:3000).


---

## Payment Integration

### Razorpay Setup

1. Create or sign in to a Razorpay account at [razorpay.com](https://razorpay.com).
2. Open **Test mode** in the Razorpay Dashboard.
3. Go to **Account & Settings → API Keys → Generate Key**.
4. Copy the test Key ID and Key Secret into `backend/.env`. Never expose the secret in frontend code or commit `.env`.
5. Restart the backend after changing `.env`.
6. Use Razorpay's test payment details in the checkout popup; no real money is charged in Test mode.

### Payment Flow

1. Patient selects appointment time
2. A test-mode Razorpay payment order is created
3. Razorpay payment popup appears
4. Upon successful payment:
   - Payment is verified
   - Appointment is created
5. If payment is cancelled or fails, the appointment is not created.

---

## Project Structure

```
US-CLINIC/
  backend/
    config/
    controllers/
    helpers/
    models/
    routes/
    server.js
    .env
  frontend/
    src/
      pages/
      styles/
      utils/
      App.js
      index.js
    public/
  README.md
```

---

## API Endpoints

### Auth

- `POST /auth/signup` — Register new user (triggers email verification)
- `POST /auth/verify-signup` — Verify email OTP code
- `POST /auth/login` — Login (only after verification)
- `GET /auth/doctors` — List all doctors

### Appointments

- `POST /appointments/create` — Book appointment
- `GET /appointments/all` — Get all appointments (admin/doctor)
- `PATCH /appointments/status/:appointmentId` — Update appointment status
- ...and more (see `backend/routes/appointmentRoutes.js`)

### Payments

- `POST /api/payment/create-order` — Create an authenticated Razorpay order
- `POST /api/payment/verify` — Verify an authenticated Razorpay payment signature

---

## Customization

- **Email Templates:** Edit `backend/helpers/sendVerificationEmail.js` for custom email content.
- **Roles:** Extend user roles and permissions in `backend/models/User.js` and related controllers.
- **UI:** Update React components and styles in `frontend/src/pages` and `frontend/src/styles`.

---

## Security Notes

- Passwords are stored in plain text for demo purposes. **Use hashing (bcrypt) in production.**
- Add rate limiting and validation for production deployments.

---

## System Limitations

- **Single Doctor:** The system is designed for clinics with one doctor only
- **Payment Required:** All appointments require upfront payment
- **Fixed Fees:** Appointment fees are set globally in environment variables

---

## License

This project is for educational/demo purposes. For production use, please review and enhance security, validation, and error handling.

---

## Acknowledgements

- [Create React App](https://create-react-app.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [Razorpay] (https://razorpay.com/)

---

## Contact

For questions or contributions, please open an issue or contact the maintainer.
