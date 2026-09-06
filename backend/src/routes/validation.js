const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Registration = require('../models/Registration');
const TestResult = require('../models/TestResult');
const Validation = require('../models/Validation');
const Specimen = require('../models/Specimen');

// Get queue for Ruang Validasi Dokter Sp.PK (Tahap 5)
router.get('/pending', async (req, res) => {
  try {
    const queue = await Registration.find({ status: 'VALIDASI' })
      .populate('patient')
      .populate('orderTests.parameter')
      .sort({ createdAt: 1 });

    const queueWithDetails = await Promise.all(
      queue.map(async (reg) => {
        const specimen = await Specimen.findOne({ registration: reg._id });
        const results = await TestResult.find({ registration: reg._id }).populate('parameter');
        const hasCritical = results.some(r => r.flag === 'CRITICAL');
        return {
          ...reg.toObject(),
          specimen,
          results,
          hasCritical
        };
      })
    );

    res.json({ success: true, data: queueWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Doctor Sp.PK Validation & Authorization (Tahap 5 -> Selesai)
router.post('/:regId', async (req, res) => {
  try {
    const { regId } = req.params;
    const {
      pathologistName,
      doctorSip,
      clinicalNotes,
      hasCriticalValue,
      criticalActionNotes,
      action
    } = req.body;

    const reg = await Registration.findById(regId).populate('patient');
    if (!reg) return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan' });

    if (action === 'REVISE') {
      // Sent back to analyzer for repeat or re-draw
      reg.status = 'ANALISIS';
      await reg.save();

      return res.json({
        success: true,
        message: 'Hasil pemeriksaan dikembalikan ke Ruang Analitik untuk pengujian ulang/konfirmasi.',
        data: reg
      });
    }

    // Generate Digital Signature Code / QR Hash
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHash = crypto.randomBytes(4).toString('hex').toUpperCase();
    const digitalSignatureCode = `DS-SPPK-${dateStr}-${randomHash}`;

    let validation = await Validation.findOne({ registration: regId });
    if (!validation) {
      validation = new Validation({
        registration: regId,
        pathologistName: pathologistName || 'dr. Bambang Irawan, Sp.PK',
        doctorSip: doctorSip || 'SIP: 503/449/SIP-DS/DPM-PTSP/2023',
        validationTime: new Date(),
        clinicalNotes: clinicalNotes || 'Hasil pemeriksaan dalam batas terkendali sesuai indikasi klinis.',
        hasCriticalValue: Boolean(hasCriticalValue),
        criticalActionNotes: criticalActionNotes || '',
        digitalSignatureCode,
        status: 'APPROVED'
      });
    } else {
      validation.pathologistName = pathologistName || validation.pathologistName;
      validation.doctorSip = doctorSip || validation.doctorSip;
      validation.validationTime = new Date();
      validation.clinicalNotes = clinicalNotes || validation.clinicalNotes;
      validation.hasCriticalValue = Boolean(hasCriticalValue);
      validation.criticalActionNotes = criticalActionNotes || validation.criticalActionNotes;
      validation.digitalSignatureCode = digitalSignatureCode;
      validation.status = 'APPROVED';
    }
    await validation.save();

    // Mark all results as APPROVED
    await TestResult.updateMany(
      { registration: regId },
      { status: 'APPROVED' }
    );

    // Finalize registration status to SELESAI
    reg.status = 'SELESAI';
    await reg.save();

    res.json({
      success: true,
      message: 'Hasil pemeriksaan laboratorium telah berhasil divalidasi dan diotorisasi oleh Dokter Sp.PK. Dokumen resmi siap dicetak!',
      data: { registration: reg, validation }
    });
  } catch (error) {
    console.error('Error validating test results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
