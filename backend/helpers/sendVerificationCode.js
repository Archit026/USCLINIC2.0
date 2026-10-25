require('dotenv').config();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const createVerificationCode = () => String(crypto.randomInt(100000, 1000000));
const hashVerificationCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

async function sendVerificationCode({ email, code }) {
  const message = `Your US-CLINIC verification code is ${code}. It expires in 10 minutes.`;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email delivery is not configured');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Your US-CLINIC verification code',
    text: message,
  });
  return 'email';
}

module.exports = { createVerificationCode, hashVerificationCode, sendVerificationCode };
