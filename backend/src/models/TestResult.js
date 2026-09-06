const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    index: true
  },
  parameter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestParameter',
    required: true
  },
  resultValue: {
    type: String,
    default: ''
  },
  flag: {
    type: String,
    enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL'],
    default: 'NORMAL'
  },
  instrumentName: {
    type: String,
    default: 'Sysmex XN-550 / Cobas c311'
  },
  reagentLot: {
    type: String,
    default: 'LOT-2026-A'
  },
  analystName: {
    type: String,
    default: 'Fitriani, S.Tr.Kes'
  },
  analysisTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED'],
    default: 'DRAFT'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestResult', TestResultSchema);
