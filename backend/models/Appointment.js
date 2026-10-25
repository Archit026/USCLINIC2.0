const mongoose = require('mongoose');
const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  time: Date,
  reason: String,
  paymentId: { type: String, unique: true, sparse: true },
  paymentStatus: { type: String, enum: ['paid'], default: 'paid' },
  status: { type: String, default: 'pending' },
  notifications: [{ message: String, seen: Boolean, createdAt: Date }]
});
module.exports = mongoose.model('Appointment', AppointmentSchema);