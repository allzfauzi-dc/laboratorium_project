const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Patient = require('../models/Patient');
const TestParameter = require('../models/TestParameter');
const Billing = require('../models/Billing');
const Specimen = require('../models/Specimen');
const TestResult = require('../models/TestResult');
const Validation = require('../models/Validation');

// List registrations
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    let registrations = await Registration.find(query)
      .populate('patient')
      .populate('orderTests.parameter')
      .sort({ createdAt: -1 })
      .limit(100);

    if (search) {
      const s = search.toLowerCase();
      registrations = registrations.filter(r => {
        return (
          r.regNumber?.toLowerCase().includes(s) ||
          r.queueNumber?.toLowerCase().includes(s) ||
          r.patient?.name?.toLowerCase().includes(s) ||
          r.patient?.mrNumber?.toLowerCase().includes(s)
        );
      });
    }

    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single registration with all related data (patient, billing, specimen, results, validation)
router.get('/:id', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id)
      .populate('patient')
      .populate('orderTests.parameter');

    if (!reg) return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan' });

    const billing = await Billing.findOne({ registration: reg._id });
    const specimen = await Specimen.findOne({ registration: reg._id });
    const results = await TestResult.find({ registration: reg._id }).populate('parameter');
    const validation = await Validation.findOne({ registration: reg._id });

    res.json({
      success: true,
      data: {
        registration: reg,
        billing,
        specimen,
        results,
        validation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new Registration & Referral (Tahap 1)
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      newPatient,
      patientType,
      guarantorCardNo,
      referralSource,
      referringDoctor,
      clinicalDiagnosis,
      parameterIds
    } = req.body;

    let targetPatientId = patientId;

    // If new patient needs to be registered simultaneously
    if (!targetPatientId && newPatient) {
      const count = await Patient.countDocuments();
      const year = new Date().getFullYear();
      const mrNumber = `RM-${year}-${String(count + 1).padStart(4, '0')}`;

      const createdPatient = await Patient.create({
        mrNumber,
        nik: newPatient.nik || '',
        name: newPatient.name,
        birthDate: newPatient.birthDate,
        gender: newPatient.gender,
        address: newPatient.address || '',
        phone: newPatient.phone || '',
        bloodType: newPatient.bloodType || '-'
      });
      targetPatientId = createdPatient._id;
    }

    if (!targetPatientId) {
      return res.status(400).json({ success: false, message: 'Data pasien belum dipilih atau diisi' });
    }

    if (!parameterIds || parameterIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Pilih minimal satu pemeriksaan laboratorium' });
    }

    // Fetch parameter prices
    const parameters = await TestParameter.find({ _id: { $in: parameterIds } });
    const orderTests = parameters.map(p => ({
      parameter: p._id,
      price: p.price
    }));

    const totalAmount = orderTests.reduce((sum, item) => sum + item.price, 0);

    // Generate Reg & Queue number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayCount = await Registration.countDocuments({ createdAt: { $gte: todayStart } });

    const queueSeq = String(todayCount + 1).padStart(3, '0');
    const regNumber = `REG-LAB-${dateStr}-${queueSeq}`;
    const queueNumber = `LAB-${queueSeq}`;

    // Create Registration - directly moves to ADMINISTRASI (Tahap 2)
    const registration = await Registration.create({
      regNumber,
      queueNumber,
      patient: targetPatientId,
      patientType: patientType || 'UMUM',
      guarantorCardNo: guarantorCardNo || '',
      referralSource: referralSource || 'Poli Rawat Jalan',
      referringDoctor: referringDoctor || 'dr. Umum',
      clinicalDiagnosis: clinicalDiagnosis || '',
      status: 'ADMINISTRASI',
      orderTests,
      totalAmount
    });

    // Create linked Billing record
    const isAutoVerified = patientType === 'BPJS' || patientType === 'ASURANSI';
    await Billing.create({
      registration: registration._id,
      totalAmount,
      paymentStatus: isAutoVerified ? (patientType === 'BPJS' ? 'TERVERIFIKASI_BPJS' : 'TERVERIFIKASI_ASURANSI') : 'PENDING',
      paymentMethod: patientType === 'BPJS' ? 'BPJS_KESEHATAN' : (patientType === 'ASURANSI' ? 'ASURANSI_SWASTA' : 'TUNAI'),
      receiptNo: `BILL-${dateStr}-${queueSeq}`,
      notes: isAutoVerified ? `Penjaminan ${patientType} No: ${guarantorCardNo || '-'}` : ''
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran dan rujukan laboratorium berhasil disimpan! Lanjut ke proses Administrasi/Penjaminan.',
      data: registration
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
