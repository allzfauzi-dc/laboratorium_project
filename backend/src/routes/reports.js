const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Patient = require('../models/Patient');
const Specimen = require('../models/Specimen');
const TestResult = require('../models/TestResult');
const Validation = require('../models/Validation');
const Billing = require('../models/Billing');

// Dashboard Overview Statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};

    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateQuery.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQuery.createdAt.$lte = end;
      }
    }

    const totalPatients = await Patient.countDocuments();
    const totalRegistrations = await Registration.countDocuments(dateQuery);
    const countAdministrasi = await Registration.countDocuments({ ...dateQuery, status: 'ADMINISTRASI' });
    const countSampling = await Registration.countDocuments({ ...dateQuery, status: 'SAMPLING' });
    const countAnalisis = await Registration.countDocuments({ ...dateQuery, status: 'ANALISIS' });
    const countValidasi = await Registration.countDocuments({ ...dateQuery, status: 'VALIDASI' });
    const countSelesai = await Registration.countDocuments({ ...dateQuery, status: 'SELESAI' });

    res.json({
      success: true,
      data: {
        totalPatients,
        totalRegistrations,
        workflow: {
          administrasi: countAdministrasi,
          sampling: countSampling,
          analisis: countAnalisis,
          validasi: countValidasi,
          selesai: countSelesai
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Full Printable Official Laboratory Report Data
router.get('/lab-result/:regId', async (req, res) => {
  try {
    const { regId } = req.params;
    const reg = await Registration.findById(regId)
      .populate('patient')
      .populate('orderTests.parameter');

    if (!reg) return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan' });

    const specimen = await Specimen.findOne({ registration: regId });
    const results = await TestResult.find({ registration: regId }).populate({
      path: 'parameter',
      populate: { path: 'categoryId' }
    });
    const validation = await Validation.findOne({ registration: regId });
    const billing = await Billing.findOne({ registration: regId });

    // Group results by category
    const categorizedResults = {};
    results.forEach(r => {
      const catName = r.parameter?.categoryId?.name || 'Pemeriksaan Lainnya';
      if (!categorizedResults[catName]) {
        categorizedResults[catName] = [];
      }
      categorizedResults[catName].push({
        parameterName: r.parameter?.name,
        code: r.parameter?.code,
        resultValue: r.resultValue,
        unit: r.parameter?.unit || '-',
        refRange: reg.patient?.gender === 'L' ? r.parameter?.refRangeMale : r.parameter?.refRangeFemale,
        flag: r.flag,
        instrumentName: r.instrumentName,
        analystName: r.analystName,
        status: r.status
      });
    });

    res.json({
      success: true,
      data: {
        hospital: {
          name: 'RUMAH SAKIT UMUM DAERAH LUBUK SIKAPING',
          subName: 'INSTALASI LABORATORIUM PATOLOGI KLINIK',
          address: 'Jl. Jend. Sudirman No. 33 Telp. (0753) 20033 Lubuk Sikaping',
          formCode: 'RM. 21 / LAB'
        },
        registration: reg,
        patient: reg.patient,
        specimen,
        billing,
        validation,
        results: categorizedResults
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
