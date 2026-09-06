const express = require('express');
const router = express.Router();
const TestCategory = require('../models/TestCategory');
const TestParameter = require('../models/TestParameter');

// ==========================================
// KATEGORI PEMERIKSAAN
// ==========================================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await TestCategory.find().sort({ code: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Kode dan Nama Kategori wajib diisi' });
    }

    const existing = await TestCategory.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Kode kategori sudah digunakan' });
    }

    const category = await TestCategory.create({
      code: code.toUpperCase(),
      name,
      description: description || ''
    });

    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await TestCategory.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    res.json({ success: true, message: 'Kategori berhasil diperbarui', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const paramCount = await TestParameter.countDocuments({ categoryId: req.params.id });
    if (paramCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak dapat dihapus karena masih memiliki ${paramCount} parameter pelayanan aktif. Pindahkan atau hapus parameter terlebih dahulu.`
      });
    }

    await TestCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PARAMETER & TARIF LAYANAN
// ==========================================

// Get all test parameters
router.get('/parameters', async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    let filter = {};
    if (categoryId && categoryId !== 'ALL') {
      filter.categoryId = categoryId;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const parameters = await TestParameter.find(filter)
      .populate('categoryId', 'name code')
      .sort({ categoryId: 1, name: 1 });

    res.json({ success: true, data: parameters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new parameter / layanan & tarif
router.post('/parameters', async (req, res) => {
  try {
    const {
      categoryId,
      code,
      name,
      unit,
      refRangeMale,
      refRangeFemale,
      minNormal,
      maxNormal,
      criticalLow,
      criticalHigh,
      specimenType,
      containerType,
      price
    } = req.body;

    if (!categoryId || !code || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Kategori, Kode, Nama Layanan, dan Tarif wajib diisi' });
    }

    const existing = await TestParameter.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Kode pemeriksaan sudah digunakan' });
    }

    const parameter = await TestParameter.create({
      categoryId,
      code: code.toUpperCase(),
      name,
      unit: unit || '',
      refRangeMale: refRangeMale || '-',
      refRangeFemale: refRangeFemale || '-',
      minNormal: minNormal !== '' && minNormal !== null ? Number(minNormal) : null,
      maxNormal: maxNormal !== '' && maxNormal !== null ? Number(maxNormal) : null,
      criticalLow: criticalLow !== '' && criticalLow !== null ? Number(criticalLow) : null,
      criticalHigh: criticalHigh !== '' && criticalHigh !== null ? Number(criticalHigh) : null,
      specimenType: specimenType || 'Darah EDTA',
      containerType: containerType || 'Tabung Tutup Ungu (EDTA K3)',
      price: Number(price) || 0
    });

    res.status(201).json({ success: true, message: 'Layanan dan tarif berhasil ditambahkan', data: parameter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update parameter / layanan & tarif
router.put('/parameters/:id', async (req, res) => {
  try {
    const {
      categoryId,
      name,
      unit,
      refRangeMale,
      refRangeFemale,
      minNormal,
      maxNormal,
      criticalLow,
      criticalHigh,
      specimenType,
      containerType,
      price
    } = req.body;

    const parameter = await TestParameter.findByIdAndUpdate(
      req.params.id,
      {
        ...(categoryId && { categoryId }),
        ...(name && { name }),
        unit: unit !== undefined ? unit : '',
        refRangeMale: refRangeMale || '-',
        refRangeFemale: refRangeFemale || '-',
        minNormal: minNormal !== '' && minNormal !== null ? Number(minNormal) : null,
        maxNormal: maxNormal !== '' && maxNormal !== null ? Number(maxNormal) : null,
        criticalLow: criticalLow !== '' && criticalLow !== null ? Number(criticalLow) : null,
        criticalHigh: criticalHigh !== '' && criticalHigh !== null ? Number(criticalHigh) : null,
        specimenType: specimenType || 'Darah EDTA',
        containerType: containerType || 'Tabung Tutup Ungu (EDTA K3)',
        price: Number(price) || 0
      },
      { new: true }
    ).populate('categoryId', 'name code');

    if (!parameter) return res.status(404).json({ success: false, message: 'Layanan laboratorium tidak ditemukan' });

    res.json({ success: true, message: 'Layanan dan tarif berhasil diperbarui', data: parameter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete parameter / layanan
router.delete('/parameters/:id', async (req, res) => {
  try {
    const parameter = await TestParameter.findByIdAndDelete(req.params.id);
    if (!parameter) return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    res.json({ success: true, message: `Layanan "${parameter.name}" berhasil dihapus` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
