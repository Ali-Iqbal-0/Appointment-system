const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Made phone not strictly required
  role: { type: String, default: 'Staff' }, // e.g., Staff, Admin, Recruiter
  gender: { type: String },
  designation: { type: String },
  dateOfBirth: { type: Date },
  status: { type: String, default: 'Pending' }, // e.g., Active, Inactive, PendingInvitation
  additionalInformation: { type: String },
  // You might want to add timestamps
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);