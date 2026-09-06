const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  regNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  queueNumber: {
    type: String,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientType: {
    type: String,
    enum: ['UMUM', 'BPJS', 'ASURANSI'],
    default: 'UMUM'
  },
  guarantorCardNo: {
    type: String,
    trim: true,
    default: ''
  },
  referralSource: {
    type: String,
    required: true,
    trim: true
  },
  referringDoctor: {
    type: String,
    required: true,
    trim: true
  },
  clinicalDiagnosis: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDAFTARAN', 'ADMINISTRASI', 'SAMPLING', 'ANALISIS', 'VALIDASI', 'SELESAI'],
    default: 'PENDAFTARAN',
    index: true
  },
  orderTests: [{
    parameter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestParameter',
      required: true
    },
    price: {
      type: Number,
      default: 0
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registration', RegistrationSchema);
