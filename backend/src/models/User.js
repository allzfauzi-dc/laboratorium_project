const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'RESEPSIONIS', 'KASIR', 'FLEBOTOMIS', 'ANALIS', 'DOKTER_SPPK'],
    required: true,
    default: 'RESEPSIONIS'
  },
  roleTitle: {
    type: String,
    default: ''
  },
  sipOrNip: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
