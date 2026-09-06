const mongoose = require('mongoose');

const SpecimenSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  specimenType: {
    type: String,
    required: true
  },
  containerType: {
    type: String,
    required: true
  },
  volumeMl: {
    type: Number,
    default: 3.0
  },
  sampleCondition: {
    type: String,
    enum: ['Baik', 'Hemolisis', 'Ikterik', 'Lipemik', 'Lisis', 'Beku'],
    default: 'Baik'
  },
  phlebotomistName: {
    type: String,
    trim: true,
    default: 'Ns. Rahmat Hidayat, A.Md.AK'
  },
  samplingTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['BELUM_SAMPLING', 'DIAMBIL', 'DITERIMA_LAB', 'DITOLAK'],
    default: 'BELUM_SAMPLING'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Specimen', SpecimenSchema);
