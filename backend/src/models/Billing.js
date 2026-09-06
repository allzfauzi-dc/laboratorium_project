const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true,
    unique: true
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'LUNAS', 'TERVERIFIKASI_BPJS', 'TERVERIFIKASI_ASURANSI'],
    default: 'PENDING',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['TUNAI', 'QRIS', 'TRANSFER_BANK', 'KARTU_DEBIT_KREDIT', 'BPJS_KESEHATAN', 'ASURANSI_SWASTA', 'GRATIS_SOSIAL'],
    default: 'TUNAI'
  },
  cashierName: {
    type: String,
    trim: true,
    default: ''
  },
  receiptNo: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Billing', BillingSchema);
