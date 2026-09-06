const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Role Permissions Matrix Configuration
const ROLE_PERMISSIONS = {
  ADMIN: {
    name: 'Administrator Sistem LIS',
    allowedRoutes: ['/', '/tahap-1', '/tahap-2', '/tahap-3', '/tahap-4', '/tahap-5', '/cetak-hasil', '/pengaturan-tarif', '/manajemen-pengguna'],
    description: 'Akses penuh seluruh modul, konfigurasi tarif, dan validasi.'
  },
  RESEPSIONIS: {
    name: 'Petugas Resepsionis / Pendaftaran',
    allowedRoutes: ['/', '/tahap-1'],
    description: 'Khusus loket pendaftaran pasien, pencarian rekam medis, dan input rujukan.'
  },
  KASIR: {
    name: 'Petugas Kasir & Administrasi BPJS',
    allowedRoutes: ['/', '/tahap-2'],
    description: 'Khusus loket administrasi, verifikasi klaim BPJS/Asuransi, dan kasir pembayaran umum.'
  },
  FLEBOTOMIS: {
    name: 'Petugas Flebotomi / Sampling',
    allowedRoutes: ['/', '/tahap-3'],
    description: 'Khusus bilik sampling, rekomendasi tabung spesimen, dan cetak label barcode.'
  },
  ANALIS: {
    name: 'Pranata Laboratorium Medis / Input Hasil',
    allowedRoutes: ['/', '/tahap-4'],
    description: 'Khusus ruang analitik mesin medis dan form penginputan hasil uji laboratorium.'
  },
  DOKTER_SPPK: {
    name: 'Dokter Spesialis Patologi Klinik (Sp.PK)',
    allowedRoutes: ['/', '/tahap-5', '/cetak-hasil'],
    description: 'Khusus ruang review klinis, evaluasi nilai kritis, ekspertise, dan otorisasi digital resmi.'
  }
};

// Login API
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    const user = await User.findOne({ username: username.toLowerCase(), isActive: true });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Username tidak ditemukan atau akun dinonaktifkan' });
    }

    // Direct password match (or hash comparison)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    const roleInfo = ROLE_PERMISSIONS[user.role] || {
      name: user.role,
      allowedRoutes: ['/']
    };

    // Return user payload
    const token = `token-${user._id}-${Date.now()}`;

    res.json({
      success: true,
      message: `Login berhasil sebagai ${roleInfo.name}`,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          roleTitle: roleInfo.name,
          sipOrNip: user.sipOrNip,
          allowedRoutes: roleInfo.allowedRoutes
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Role Permissions Info
router.get('/roles', (req, res) => {
  res.json({ success: true, data: ROLE_PERMISSIONS });
});

// List Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ role: 1, name: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create User (Admin Only)
router.post('/users', async (req, res) => {
  try {
    const { username, password, name, role, sipOrNip } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      password,
      name,
      role,
      sipOrNip: sipOrNip || '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Pengguna baru berhasil didaftarkan',
      data: { id: user._id, username: user.username, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update User (Admin Only)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, role, sipOrNip, password, isActive } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (role) updateFields.role = role;
    if (sipOrNip !== undefined) updateFields.sipOrNip = sipOrNip;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (password && password.trim() !== '') {
      updateFields.password = password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, select: '-password' }
    );

    if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

    res.json({
      success: true,
      message: `Akun pengguna "${user.name}" berhasil diperbarui`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete User (Admin Only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

    if (user.username === 'admin') {
      return res.status(400).json({ success: false, message: 'Akun Super Admin utama tidak boleh dihapus' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Akun "${user.username}" (${user.name}) berhasil dihapus` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
