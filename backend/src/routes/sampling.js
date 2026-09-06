const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Specimen = require('../models/Specimen');
const TestResult = require('../models/TestResult');

// Get queue for Ruang Sampling / Flebotomi (Tahap 3)
router.get('/queue', async (req, res) => {
  try {
    const queue = await Registration.find({ status: 'SAMPLING' })
      .populate('patient')
      .populate('orderTests.parameter')
      .sort({ createdAt: 1 });

    const queueWithDetails = await Promise.all(
      queue.map(async (reg) => {
        const specimen = await Specimen.findOne({ registration: reg._id });
        return {
          ...reg.toObject(),
          specimen
        };
      })
    );

    res.json({ success: true, data: queueWithDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record Specimen Sampling and Print Barcode (Tahap 3 -> Tahap 4)
router.post('/:regId', async (req, res) => {
  try {
    const { regId } = req.params;
    const {
      specimenType,
      containerType,
      volumeMl,
      sampleCondition,
      phlebotomistName,
      notes
    } = req.body;

    const reg = await Registration.findById(regId)
      .populate('patient')
      .populate('orderTests.parameter');

    if (!reg) return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan' });

    // Deduce required containers from ordered tests if not manually given
    let derivedContainers = containerType;
    let derivedSpecimens = specimenType;
    if (!derivedContainers || !derivedSpecimens) {
      const cSet = new Set();
      const sSet = new Set();
      reg.orderTests.forEach(item => {
        if (item.parameter) {
          cSet.add(item.parameter.containerType);
          sSet.add(item.parameter.specimenType);
        }
      });
      derivedContainers = Array.from(cSet).join(' & ');
      derivedSpecimens = Array.from(sSet).join(' & ');
    }

    // Generate Barcode
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Specimen.countDocuments();
    const barcode = `SMP-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    let specimen = await Specimen.findOne({ registration: regId });
    if (!specimen) {
      specimen = new Specimen({
        registration: regId,
        barcode,
        specimenType: derivedSpecimens || 'Darah EDTA',
        containerType: derivedContainers || 'Tabung Tutup Ungu',
        volumeMl: volumeMl || 3.0,
        sampleCondition: sampleCondition || 'Baik',
        phlebotomistName: phlebotomistName || 'Ns. Rahmat Hidayat, A.Md.AK',
        samplingTime: new Date(),
        status: 'DITERIMA_LAB',
        notes: notes || ''
      });
    } else {
      specimen.specimenType = derivedSpecimens || specimen.specimenType;
      specimen.containerType = derivedContainers || specimen.containerType;
      specimen.volumeMl = volumeMl || specimen.volumeMl;
      specimen.sampleCondition = sampleCondition || specimen.sampleCondition;
      specimen.phlebotomistName = phlebotomistName || specimen.phlebotomistName;
      specimen.samplingTime = new Date();
      specimen.status = 'DITERIMA_LAB';
      specimen.notes = notes || specimen.notes;
    }
    await specimen.save();

    // Initialize blank TestResult records for each parameter ordered if not already created
    for (const item of reg.orderTests) {
      const existingResult = await TestResult.findOne({
        registration: regId,
        parameter: item.parameter._id
      });
      if (!existingResult) {
        await TestResult.create({
          registration: regId,
          parameter: item.parameter._id,
          resultValue: '',
          flag: 'NORMAL',
          instrumentName: 'Sysmex XN-550 / Cobas c311',
          analystName: 'Fitriani, S.Tr.Kes',
          status: 'DRAFT'
        });
      }
    }

    // Advance status to ANALISIS (Tahap 4)
    reg.status = 'ANALISIS';
    await reg.save();

    res.json({
      success: true,
      message: `Spesimen berhasil diambil dengan Barcode: ${specimen.barcode}. Sampel siap dianalisis di laboratorium!`,
      data: { registration: reg, specimen }
    });
  } catch (error) {
    console.error('Error saving specimen:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
