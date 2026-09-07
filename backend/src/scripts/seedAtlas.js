require('dotenv').config();
const mongoose = require('mongoose');
const seedDatabase = require('../config/seedData');
const User = require('../models/User');
const TestCategory = require('../models/TestCategory');
const TestParameter = require('../models/TestParameter');
const Patient = require('../models/Patient');
const Registration = require('../models/Registration');
const Billing = require('../models/Billing');
const Specimen = require('../models/Specimen');
const TestResult = require('../models/TestResult');
const Validation = require('../models/Validation');

// Ambil URI dari argumen CLI jika ada, atau dari .env
const customUri = process.argv.find(arg => arg.startsWith('mongodb://') || arg.startsWith('mongodb+srv://'));
const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/laboratorium';

async function main() {
  console.log('========================================================');
  console.log('🚀 MENGHUBUNGKAN KE DATABASE TARGET...');
  console.log(`📌 URI: ${uri.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`);
  console.log('========================================================');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
    console.log('✅ Berhasil terhubung ke MongoDB!\n');

    const isForce = process.argv.includes('--force');

    if (isForce) {
      console.log('⚠️ Mode --force terdeteksi. Mengosongkan data lama...');
      await Promise.all([
        User.deleteMany({}),
        TestCategory.deleteMany({}),
        TestParameter.deleteMany({}),
        Patient.deleteMany({}),
        Registration.deleteMany({}),
        Billing.deleteMany({}),
        Specimen.deleteMany({}),
        TestResult.deleteMany({}),
        Validation.deleteMany({})
      ]);
      console.log('🧹 Data lama berhasil dibersihkan.\n');
    }

    console.log('📦 Menjalankan proses seeding data master & demo...');
    await seedDatabase();

    // Tampilkan statistik data terupload
    const [uCount, cCount, pCount, patCount, rCount] = await Promise.all([
      User.countDocuments(),
      TestCategory.countDocuments(),
      TestParameter.countDocuments(),
      Patient.countDocuments(),
      Registration.countDocuments()
    ]);

    console.log('\n========================================================');
    console.log('🎉 SEEDING / UPLOAD DATABASE BERHASIL!');
    console.log('========================================================');
    console.log(`👤 Akun Pengguna & Role     : ${uCount} akun`);
    console.log(`📁 Kategori Pemeriksaan     : ${cCount} kategori`);
    console.log(`🧪 Parameter Uji & Tarif     : ${pCount} parameter`);
    console.log(`🏥 Pasien Demo Rekam Medis  : ${patCount} pasien`);
    console.log(`📋 Order Registrasi Alur    : ${rCount} transaksi`);
    console.log('========================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal melakukan upload database:', err.message);
    process.exit(1);
  }
}

main();
