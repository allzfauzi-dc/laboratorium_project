const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Search / List Patients
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { mrNumber: { $regex: search, $options: 'i' } },
          { nik: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single patient
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    const { name, nik, birthDate, gender, address, phone, bloodType } = req.body;

    if (!name || !birthDate || !gender) {
      return res.status(400).json({ success: false, message: 'Nama, Tanggal Lahir, dan Jenis Kelamin wajib diisi' });
    }

    // Auto-generate No RM if not provided
    const count = await Patient.countDocuments();
    const year = new Date().getFullYear();
    const mrNumber = `RM-${year}-${String(count + 1).padStart(4, '0')}`;

    const patient = await Patient.create({
      mrNumber,
      nik: nik || '',
      name,
      birthDate,
      gender,
      address: address || '',
      phone: phone || '',
      bloodType: bloodType || '-'
    });

    res.status(201).json({ success: true, data: patient, message: 'Pasien berhasil didaftarkan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
