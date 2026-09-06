const mongoose = require('mongoose');

const ValidationSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    unique: true
  },
  pathologistName: {
    type: String,
    required: true,
    default: 'dr. Bambang Irawan, Sp.PK'
  },
  doctorSip: {
    type: String,
    default: 'SIP: 503/449/SIP-DS/DPM-PTSP/2023'
  },
  validationTime: {
    type: Date,
    default: Date.now
  },
  clinicalNotes: {
    type: String,
    default: ''
  },
  hasCriticalValue: {
    type: Boolean,
    default: false
  },
  criticalActionNotes: {
    type: String,
    default: ''
  },
  digitalSignatureCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['APPROVED', 'REVISED'],
    default: 'APPROVED'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Validation', ValidationSchema);
