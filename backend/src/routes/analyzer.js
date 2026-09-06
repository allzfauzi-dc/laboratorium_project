const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const TestResult = require('../models/TestResult');
const TestParameter = require('../models/TestParameter');
const Specimen = require('../models/Specimen');

// Helper to calculate auto-flags (NORMAL, LOW, HIGH, CRITICAL)
const evaluateFlag = (valueStr, param, patientGender) => {
  if (!valueStr || valueStr.trim() === '') return 'NORMAL';
  const cleanVal = valueStr.replace(',', '.').trim();
  const numVal = parseFloat(cleanVal);

  if (!isNaN(numVal)) {
    // Check critical values first
    if (param.criticalLow !== null && numVal <= param.criticalLow) return 'CRITICAL';
    if (param.criticalHigh !== null && numVal >= param.criticalHigh) return 'CRITICAL';

    // Check normal limits
    let min = param.minNormal;
    let max = param.maxNormal;

    if (min !== null && numVal < min) return 'LOW';
    if (max !== null && numVal > max) return 'HIGH';
    return 'NORMAL';
  }

  // Non-numeric tests (e.g. Positif / Negatif / Reaktif)
  const lower = valueStr.toLowerCase();
  if (lower.includes('positif') || lower.includes('reaktif') || lower.includes('1/320') || lower.includes('1/160')) {
    return 'HIGH';
  }

  return 'NORMAL';
};

// Get worklist for Ruang Analitik Laboratorium (Tahap 4)
router.get('/worklist', async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'ANALISIS' })
      .populate('patient')
      .populate('orderTests.parameter')
      .sort({ createdAt: 1 });

    const worklist = await Promise.all(
      registrations.map(async (reg) => {
        const specimen = await Specimen.findOne({ registration: reg._id });
        const results = await TestResult.find({ registration: reg._id }).populate('parameter');
        return {
          ...reg.toObject(),
          specimen,
          results
        };
      })
    );

    res.json({ success: true, data: worklist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit results from Analyzer / Med Tech and advance to VALIDASI (Tahap 4 -> Tahap 5)
router.post('/:regId/results', async (req, res) => {
  try {
    const { regId } = req.params;
    const { results, instrumentName, reagentLot, analystName } = req.body;

    const reg = await Registration.findById(regId).populate('patient');
    if (!reg) return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan' });

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Data hasil pemeriksaan belum diisi' });
    }

    let hasAnyCritical = false;

    for (const item of results) {
      const param = await TestParameter.findById(item.parameterId || item.parameter?._id || item.parameter);
      if (!param) continue;

      const flag = evaluateFlag(item.resultValue, param, reg.patient?.gender);
      if (flag === 'CRITICAL') hasAnyCritical = true;

      await TestResult.findOneAndUpdate(
        { registration: regId, parameter: param._id },
        {
          resultValue: item.resultValue,
          flag,
          instrumentName: instrumentName || item.instrumentName || 'Sysmex XN-550 / Cobas c311',
          reagentLot: reagentLot || item.reagentLot || 'LOT-2026-A',
          analystName: analystName || item.analystName || 'Fitriani, S.Tr.Kes',
          analysisTime: new Date(),
          status: 'SUBMITTED'
        },
        { upsert: true, new: true }
      );
    }

    // Advance status to VALIDASI (Tahap 5)
    reg.status = 'VALIDASI';
    await reg.save();

    res.json({
      success: true,
      message: hasAnyCritical
        ? 'PERINGATAN: Hasil tes mengandung NILAI KRITIS! Data telah dikirim ke Dokter Sp.PK untuk validasi segera.'
        : 'Hasil analisis laboratorium berhasil disimpan dan dikirim ke Dokter Sp.PK untuk validasi.',
      hasCriticalValue: hasAnyCritical,
      data: reg
    });
  } catch (error) {
    console.error('Error saving test results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
