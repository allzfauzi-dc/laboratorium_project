const mongoose = require('mongoose');

const TestParameterSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCategory',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    trim: true,
    default: ''
  },
  refRangeMale: {
    type: String,
    trim: true,
    default: '-'
  },
  refRangeFemale: {
    type: String,
    trim: true,
    default: '-'
  },
  minNormal: {
    type: Number,
    default: null
  },
  maxNormal: {
    type: Number,
    default: null
  },
  criticalLow: {
    type: Number,
    default: null
  },
  criticalHigh: {
    type: Number,
    default: null
  },
  specimenType: {
    type: String,
    required: true,
    trim: true
  },
  containerType: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestParameter', TestParameterSchema);
