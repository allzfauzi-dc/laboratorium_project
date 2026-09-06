const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  mrNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  nik: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  gender: {
    type: String,
    enum: ['L', 'P'],
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'A', 'B', 'AB', 'O', '-'],
    default: '-'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', PatientSchema);
