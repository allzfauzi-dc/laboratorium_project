const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Billing = require('../models/Billing');

// Get queue for Loket Administrasi & Kasir (Tahap 2)
router.get('/queue', async (req, res) => {
  try {
    const queue = await Registration.find({ status: 'ADMINISTRASI' })
      .populate('patient')
      .populate('orderTests.parameter')
      .sort({ createdAt: 1 });

    const queueWithBilling = await Promise.all(
      queue.map(async (reg) => {
        const billing = await Billing.findOne({ registration: reg._id });
        return {
          ...reg.toObject(),
          billing
        };
      })
    );

    res.json({ success: true, data: queueWithBilling });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process payment / verification and advance status to SAMPLING
router.put('/:regId/verify-pay', async (req, res) => {
  try {
    const { regId } = req.params;
    const { paymentMethod, cashierName, notes } = req.body;

    const reg = await Registration.findById(regId).populate('patient');
    if (!reg) return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan' });

    let billing = await Billing.findOne({ registration: regId });
    if (!billing) {
      billing = new Billing({ registration: regId, totalAmount: reg.totalAmount });
    }

    let newPaymentStatus = 'LUNAS';
    if (reg.patientType === 'BPJS') {
      newPaymentStatus = 'TERVERIFIKASI_BPJS';
    } else if (reg.patientType === 'ASURANSI') {
      newPaymentStatus = 'TERVERIFIKASI_ASURANSI';
    }

    billing.paymentStatus = newPaymentStatus;
    billing.paymentMethod = paymentMethod || billing.paymentMethod;
    billing.cashierName = cashierName || 'Petugas Administrasi';
    billing.notes = notes || billing.notes || '';
    billing.paidAt = new Date();
    await billing.save();

    // Advance status to SAMPLING (Tahap 3)
    reg.status = 'SAMPLING';
    await reg.save();

    res.json({
      success: true,
      message: `Administrasi berhasil diverifikasi (${newPaymentStatus})! Pasien diarahkan ke Bilik Sampling/Flebotomi.`,
      data: { registration: reg, billing }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
