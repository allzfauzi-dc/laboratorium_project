const TestCategory = require('../models/TestCategory');
const TestParameter = require('../models/TestParameter');
const Patient = require('../models/Patient');
const Registration = require('../models/Registration');
const Billing = require('../models/Billing');
const Specimen = require('../models/Specimen');
const TestResult = require('../models/TestResult');
const Validation = require('../models/Validation');
const User = require('../models/User');

const seedUsers = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding default role-based user accounts...');
    await User.insertMany([
      {
        username: 'admin',
        password: 'admin123',
        name: 'dr. H. Kurniawan, Sp.PK, M.Kes',
        role: 'ADMIN',
        roleTitle: 'Kepala Instalasi & Administrator LIS',
        sipOrNip: 'NIP: 19780512 200501 1 004',
        isActive: true
      },
      {
        username: 'resepsionis',
        password: 'pendaftaran123',
        name: 'Siti Rahma, A.Md',
        role: 'RESEPSIONIS',
        roleTitle: 'Petugas Resepsionis & Pendaftaran Rujukan',
        sipOrNip: 'NIP: 19940824 202012 2 011',
        isActive: true
      },
      {
        username: 'kasir',
        password: 'kasir123',
        name: 'Budi Santoso',
        role: 'KASIR',
        roleTitle: 'Petugas Kasir & Administrasi Penjaminan',
        sipOrNip: 'NIP: 19920315 201903 1 008',
        isActive: true
      },
      {
        username: 'flebotomis',
        password: 'sampling123',
        name: 'Ns. Rahmat Hidayat, A.Md.AK',
        role: 'FLEBOTOMIS',
        roleTitle: 'Petugas Bilik Sampling & Barcoding Spesimen',
        sipOrNip: 'STR: 130852119-2458921',
        isActive: true
      },
      {
        username: 'analis',
        password: 'analis123',
        name: 'Fitriani, S.Tr.Kes',
        role: 'ANALIS',
        roleTitle: 'Pranata Laboratorium Medis (Input Hasil Alat)',
        sipOrNip: 'STR: 130872220-3589104',
        isActive: true
      },
      {
        username: 'doktersppk',
        password: 'sppk123',
        name: 'dr. Bambang Irawan, Sp.PK',
        role: 'DOKTER_SPPK',
        roleTitle: 'Dokter Spesialis Patologi Klinik (Otorisasi Resmi)',
        sipOrNip: 'SIP: 503/449/SIP-DS/DPM-PTSP/2023',
        isActive: true
      }
    ]);
    console.log('Role-based user accounts created successfully!');
  }
};

const seedDatabase = async () => {
  try {
    await seedUsers();
    const catCount = await TestCategory.countDocuments();
    if (catCount > 0) {
      console.log('Database already has master data. Skipping tests seeding.');
      return;
    }

    console.log('Seeding initial master data for Laboratorium RS...');

    // 1. Kategori Tes
    const categories = await TestCategory.insertMany([
      { code: 'HEMATOLOGI', name: 'Hematologi Lengkap', description: 'Pemeriksaan sel darah lengkap dan morfologi' },
      { code: 'KIMIA_KLINIK', name: 'Kimia Klinik & Metabolisme', description: 'Fungsi organ, glukosa darah, dan elektrolit' },
      { code: 'PROFIL_LIPID', name: 'Profil Lemak / Lipid', description: 'Kolesterol, trigliserida, HDL, LDL' },
      { code: 'FUNGSI_GINJAL', name: 'Fungsi Ginjal', description: 'Ureum, kreatinin, asam urat' },
      { code: 'FUNGSI_HATI', name: 'Fungsi Hati / Faal Hepar', description: 'SGOT, SGPT, bilirubin' },
      { code: 'URINALISIS', name: 'Urinalisis Rutin', description: 'Pemeriksaan makroskopik, kimia, dan mikroskopik urine' },
      { code: 'IMUNOSEROLOGI', name: 'Imunologi & Serologi', description: 'Pemeriksaan antibodi, antigen infeksi, Widal, HBsAg' }
    ]);

    const catMap = {};
    categories.forEach(c => { catMap[c.code] = c._id; });

    // 2. Parameter Tes
    const parameters = await TestParameter.insertMany([
      // Hematologi
      {
        categoryId: catMap['HEMATOLOGI'],
        code: 'HB',
        name: 'Hemoglobin (Hb)',
        unit: 'g/dL',
        refRangeMale: '13.5 - 17.5',
        refRangeFemale: '12.0 - 15.5',
        minNormal: 12.0,
        maxNormal: 17.5,
        criticalLow: 7.0,
        criticalHigh: 20.0,
        specimenType: 'Darah EDTA',
        containerType: 'Tabung Tutup Ungu (EDTA K3)',
        price: 35000
      },
      {
        categoryId: catMap['HEMATOLOGI'],
        code: 'LEUKOSIT',
        name: 'Leukosit (WBC)',
        unit: '/uL',
        refRangeMale: '4.500 - 11.000',
        refRangeFemale: '4.500 - 11.000',
        minNormal: 4500,
        maxNormal: 11000,
        criticalLow: 2000,
        criticalHigh: 30000,
        specimenType: 'Darah EDTA',
        containerType: 'Tabung Tutup Ungu (EDTA K3)',
        price: 35000
      },
      {
        categoryId: catMap['HEMATOLOGI'],
        code: 'TROMBOSIT',
        name: 'Trombosit (PLT)',
        unit: '/uL',
        refRangeMale: '150.000 - 450.000',
        refRangeFemale: '150.000 - 450.000',
        minNormal: 150000,
        maxNormal: 450000,
        criticalLow: 50000,
        criticalHigh: 1000000,
        specimenType: 'Darah EDTA',
        containerType: 'Tabung Tutup Ungu (EDTA K3)',
        price: 35000
      },
      {
        categoryId: catMap['HEMATOLOGI'],
        code: 'HEMATOKRIT',
        name: 'Hematokrit (Ht)',
        unit: '%',
        refRangeMale: '40 - 52',
        refRangeFemale: '36 - 48',
        minNormal: 36.0,
        maxNormal: 52.0,
        criticalLow: 20.0,
        criticalHigh: 60.0,
        specimenType: 'Darah EDTA',
        containerType: 'Tabung Tutup Ungu (EDTA K3)',
        price: 30000
      },
      {
        categoryId: catMap['HEMATOLOGI'],
        code: 'ERITROSIT',
        name: 'Eritrosit (RBC)',
        unit: '10^6/uL',
        refRangeMale: '4.5 - 5.9',
        refRangeFemale: '4.0 - 5.2',
        minNormal: 4.0,
        maxNormal: 5.9,
        criticalLow: 2.0,
        criticalHigh: 7.0,
        specimenType: 'Darah EDTA',
        containerType: 'Tabung Tutup Ungu (EDTA K3)',
        price: 30000
      },

      // Kimia Darah / Glukosa
      {
        categoryId: catMap['KIMIA_KLINIK'],
        code: 'GDS',
        name: 'Glukosa Darah Sewaktu (GDS)',
        unit: 'mg/dL',
        refRangeMale: '< 140',
        refRangeFemale: '< 140',
        minNormal: 70,
        maxNormal: 140,
        criticalLow: 45,
        criticalHigh: 450,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 30000
      },
      {
        categoryId: catMap['KIMIA_KLINIK'],
        code: 'GDP',
        name: 'Glukosa Darah Puasa (GDP)',
        unit: 'mg/dL',
        refRangeMale: '70 - 100',
        refRangeFemale: '70 - 100',
        minNormal: 70,
        maxNormal: 100,
        criticalLow: 45,
        criticalHigh: 400,
        specimenType: 'Serum / Plasma Fluoride',
        containerType: 'Tabung Abu-abu / Kuning',
        price: 30000
      },
      {
        categoryId: catMap['KIMIA_KLINIK'],
        code: 'HBA1C',
        name: 'HbA1c (Hemoglobin Terglikasi)',
        unit: '%',
        refRangeMale: '< 5.7',
        refRangeFemale: '< 5.7',
        minNormal: 4.0,
        maxNormal: 5.6,
        criticalLow: null,
        criticalHigh: 12.0,
        specimenType: 'Darah EDTA',
        containerType: 'Tabung Tutup Ungu (EDTA K3)',
        price: 150000
      },

      // Profil Lipid
      {
        categoryId: catMap['PROFIL_LIPID'],
        code: 'CHOLESTEROL',
        name: 'Kolesterol Total',
        unit: 'mg/dL',
        refRangeMale: '< 200',
        refRangeFemale: '< 200',
        minNormal: 120,
        maxNormal: 200,
        criticalLow: null,
        criticalHigh: 400,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 45000
      },
      {
        categoryId: catMap['PROFIL_LIPID'],
        code: 'TRIGLISERIDA',
        name: 'Trigliserida',
        unit: 'mg/dL',
        refRangeMale: '< 150',
        refRangeFemale: '< 150',
        minNormal: 50,
        maxNormal: 150,
        criticalLow: null,
        criticalHigh: 500,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 45000
      },
      {
        categoryId: catMap['PROFIL_LIPID'],
        code: 'HDL',
        name: 'Kolesterol HDL',
        unit: 'mg/dL',
        refRangeMale: '> 40',
        refRangeFemale: '> 50',
        minNormal: 40,
        maxNormal: 90,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 50000
      },
      {
        categoryId: catMap['PROFIL_LIPID'],
        code: 'LDL',
        name: 'Kolesterol LDL',
        unit: 'mg/dL',
        refRangeMale: '< 100',
        refRangeFemale: '< 100',
        minNormal: 50,
        maxNormal: 100,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 50000
      },

      // Fungsi Ginjal
      {
        categoryId: catMap['FUNGSI_GINJAL'],
        code: 'UREUM',
        name: 'Ureum Darah',
        unit: 'mg/dL',
        refRangeMale: '15 - 45',
        refRangeFemale: '15 - 45',
        minNormal: 15,
        maxNormal: 45,
        criticalLow: null,
        criticalHigh: 150,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 40000
      },
      {
        categoryId: catMap['FUNGSI_GINJAL'],
        code: 'KREATININ',
        name: 'Kreatinin Serum',
        unit: 'mg/dL',
        refRangeMale: '0.7 - 1.3',
        refRangeFemale: '0.6 - 1.1',
        minNormal: 0.6,
        maxNormal: 1.3,
        criticalLow: null,
        criticalHigh: 5.0,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 40000
      },
      {
        categoryId: catMap['FUNGSI_GINJAL'],
        code: 'ASAM_URAT',
        name: 'Asam Urat',
        unit: 'mg/dL',
        refRangeMale: '3.5 - 7.2',
        refRangeFemale: '2.6 - 6.0',
        minNormal: 2.6,
        maxNormal: 7.2,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 35000
      },

      // Fungsi Hati
      {
        categoryId: catMap['FUNGSI_HATI'],
        code: 'SGOT',
        name: 'SGOT / AST',
        unit: 'U/L',
        refRangeMale: '< 35',
        refRangeFemale: '< 31',
        minNormal: 5,
        maxNormal: 35,
        criticalLow: null,
        criticalHigh: 300,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 40000
      },
      {
        categoryId: catMap['FUNGSI_HATI'],
        code: 'SGPT',
        name: 'SGPT / ALT',
        unit: 'U/L',
        refRangeMale: '< 45',
        refRangeFemale: '< 34',
        minNormal: 5,
        maxNormal: 45,
        criticalLow: null,
        criticalHigh: 300,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning (Gel Separator)',
        price: 40000
      },

      // Urinalisis
      {
        categoryId: catMap['URINALISIS'],
        code: 'URINE_WARNA',
        name: 'Warna Urine',
        unit: '-',
        refRangeMale: 'Kuning Jernih',
        refRangeFemale: 'Kuning Jernih',
        minNormal: null,
        maxNormal: null,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Urine Sewaktu',
        containerType: 'Pot Urine Bersih & Kering',
        price: 15000
      },
      {
        categoryId: catMap['URINALISIS'],
        code: 'URINE_PROTEIN',
        name: 'Protein Urine (Albumin)',
        unit: '-',
        refRangeMale: 'Negatif',
        refRangeFemale: 'Negatif',
        minNormal: null,
        maxNormal: null,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Urine Sewaktu',
        containerType: 'Pot Urine Bersih & Kering',
        price: 15000
      },

      // Imunoserologi
      {
        categoryId: catMap['IMUNOSEROLOGI'],
        code: 'HBSAG',
        name: 'HBsAg Kualitatif (Rapid)',
        unit: '-',
        refRangeMale: 'Non Reaktif',
        refRangeFemale: 'Non Reaktif',
        minNormal: null,
        maxNormal: null,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning',
        price: 85000
      },
      {
        categoryId: catMap['IMUNOSEROLOGI'],
        code: 'WIDAL_O',
        name: 'Widal S. Typhi O',
        unit: 'Titer',
        refRangeMale: '< 1/80',
        refRangeFemale: '< 1/80',
        minNormal: null,
        maxNormal: null,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Serum',
        containerType: 'Tabung Tutup Kuning',
        price: 50000
      },
      {
        categoryId: catMap['IMUNOSEROLOGI'],
        code: 'DENGUE_NS1',
        name: 'Dengue NS1 Antigen',
        unit: '-',
        refRangeMale: 'Negatif',
        refRangeFemale: 'Negatif',
        minNormal: null,
        maxNormal: null,
        criticalLow: null,
        criticalHigh: null,
        specimenType: 'Serum / Darah EDTA',
        containerType: 'Tabung Kuning / Ungu',
        price: 175000
      }
    ]);

    const paramMap = {};
    parameters.forEach(p => { paramMap[p.code] = p; });

    // 3. Pasien Sampel
    const p1 = await Patient.create({
      mrNumber: 'RM-2026-0012',
      nik: '1308011205880001',
      name: 'Ahmad Fadillah',
      birthDate: '1988-05-12',
      gender: 'L',
      address: 'Jl. Ahmad Yani No. 45, Lubuk Sikaping',
      phone: '081267891234',
      bloodType: 'O+'
    });

    const p2 = await Patient.create({
      mrNumber: 'RM-2026-0034',
      nik: '1308026408920002',
      name: 'Siti Nurhaliza',
      birthDate: '1992-08-24',
      gender: 'P',
      address: 'Jl. Sudirman No. 12, Bonjol',
      phone: '085278901234',
      bloodType: 'A+'
    });

    const p3 = await Patient.create({
      mrNumber: 'RM-2026-0078',
      nik: '1308031502650003',
      name: 'Bambang Soeprapto',
      birthDate: '1965-02-15',
      gender: 'L',
      address: 'Komp. RSUD Indah Blok B-4',
      phone: '081399887766',
      bloodType: 'B+'
    });

    // 4. Registrasi Sampel untuk 3 tahapan alur demo:
    // Pasien 1: SELESAI divalidasi oleh dokter Sp.PK
    const reg1 = await Registration.create({
      regNumber: 'REG-LAB-20260906-001',
      queueNumber: 'LAB-001',
      patient: p1._id,
      patientType: 'BPJS',
      guarantorCardNo: '0001234567890',
      referralSource: 'Poli Penyakit Dalam',
      referringDoctor: 'dr. Hendra Sp.PD',
      clinicalDiagnosis: 'Febris h-4 e.c susp. Infeksi Bakterial / Tifoid',
      status: 'SELESAI',
      orderTests: [
        { parameter: paramMap['HB']._id, price: paramMap['HB'].price },
        { parameter: paramMap['LEUKOSIT']._id, price: paramMap['LEUKOSIT'].price },
        { parameter: paramMap['TROMBOSIT']._id, price: paramMap['TROMBOSIT'].price },
        { parameter: paramMap['WIDAL_O']._id, price: paramMap['WIDAL_O'].price }
      ],
      totalAmount: 155000
    });

    await Billing.create({
      registration: reg1._id,
      totalAmount: 155000,
      paymentStatus: 'TERVERIFIKASI_BPJS',
      paymentMethod: 'BPJS_KESEHATAN',
      cashierName: 'Dewi Lestari (Loket BPJS)',
      receiptNo: 'SEP-LAB-0906-001',
      paidAt: new Date(Date.now() - 3 * 3600 * 1000)
    });

    await Specimen.create({
      registration: reg1._id,
      barcode: 'SMP-20260906-001',
      specimenType: 'Darah EDTA & Serum',
      containerType: 'Tabung Ungu (EDTA) & Kuning (Gel)',
      volumeMl: 4.0,
      sampleCondition: 'Baik',
      phlebotomistName: 'Ns. Rahmat Hidayat, A.Md.AK',
      samplingTime: new Date(Date.now() - 2.5 * 3600 * 1000),
      status: 'DITERIMA_LAB'
    });

    await TestResult.insertMany([
      { registration: reg1._id, parameter: paramMap['HB']._id, resultValue: '14.2', flag: 'NORMAL', analystName: 'Fitriani, S.Tr.Kes', status: 'APPROVED' },
      { registration: reg1._id, parameter: paramMap['LEUKOSIT']._id, resultValue: '14800', flag: 'HIGH', analystName: 'Fitriani, S.Tr.Kes', status: 'APPROVED' },
      { registration: reg1._id, parameter: paramMap['TROMBOSIT']._id, resultValue: '185000', flag: 'NORMAL', analystName: 'Fitriani, S.Tr.Kes', status: 'APPROVED' },
      { registration: reg1._id, parameter: paramMap['WIDAL_O']._id, resultValue: '1/320', flag: 'HIGH', analystName: 'Fitriani, S.Tr.Kes', status: 'APPROVED' }
    ]);

    await Validation.create({
      registration: reg1._id,
      pathologistName: 'dr. Bambang Irawan, Sp.PK',
      doctorSip: 'SIP: 503/449/SIP-DS/DPM-PTSP/2023',
      clinicalNotes: 'Leukositosis dan peningkatan titer Widal O 1/320 menyokong diagnosis infeksi Salmonella / Sindrom Demam Tifoid. Saran konfirmasi kultur darah bila demam berlanjut.',
      hasCriticalValue: false,
      digitalSignatureCode: 'DS-SPPK-0906-88A92F',
      status: 'APPROVED'
    });

    // Pasien 2: Sedang di tahap VALIDASI (Menunggu Sp.PK, ada nilai kritis Hb 6.4!)
    const reg2 = await Registration.create({
      regNumber: 'REG-LAB-20260906-002',
      queueNumber: 'LAB-002',
      patient: p2._id,
      patientType: 'UMUM',
      referralSource: 'IGD (Gawat Darurat)',
      referringDoctor: 'dr. Maya Sartika',
      clinicalDiagnosis: 'Anemia Gravis + Lemas Akut',
      status: 'VALIDASI',
      orderTests: [
        { parameter: paramMap['HB']._id, price: paramMap['HB'].price },
        { parameter: paramMap['LEUKOSIT']._id, price: paramMap['LEUKOSIT'].price },
        { parameter: paramMap['TROMBOSIT']._id, price: paramMap['TROMBOSIT'].price },
        { parameter: paramMap['HEMATOKRIT']._id, price: paramMap['HEMATOKRIT'].price }
      ],
      totalAmount: 135000
    });

    await Billing.create({
      registration: reg2._id,
      totalAmount: 135000,
      paymentStatus: 'LUNAS',
      paymentMethod: 'QRIS',
      cashierName: 'Budi Santoso (Kasir)',
      receiptNo: 'KW-LAB-0906-002',
      paidAt: new Date(Date.now() - 1.5 * 3600 * 1000)
    });

    await Specimen.create({
      registration: reg2._id,
      barcode: 'SMP-20260906-002',
      specimenType: 'Darah EDTA',
      containerType: 'Tabung Tutup Ungu (EDTA K3)',
      volumeMl: 3.0,
      sampleCondition: 'Baik',
      phlebotomistName: 'Ns. Rahmat Hidayat, A.Md.AK',
      samplingTime: new Date(Date.now() - 1.2 * 3600 * 1000),
      status: 'DITERIMA_LAB'
    });

    await TestResult.insertMany([
      { registration: reg2._id, parameter: paramMap['HB']._id, resultValue: '6.4', flag: 'CRITICAL', analystName: 'Fitriani, S.Tr.Kes', status: 'SUBMITTED' },
      { registration: reg2._id, parameter: paramMap['LEUKOSIT']._id, resultValue: '7200', flag: 'NORMAL', analystName: 'Fitriani, S.Tr.Kes', status: 'SUBMITTED' },
      { registration: reg2._id, parameter: paramMap['TROMBOSIT']._id, resultValue: '210000', flag: 'NORMAL', analystName: 'Fitriani, S.Tr.Kes', status: 'SUBMITTED' },
      { registration: reg2._id, parameter: paramMap['HEMATOKRIT']._id, resultValue: '21.0', flag: 'LOW', analystName: 'Fitriani, S.Tr.Kes', status: 'SUBMITTED' }
    ]);

    // Pasien 3: Sedang di tahap SAMPLING (Siap diambil sampel di bilik flebotomi)
    const reg3 = await Registration.create({
      regNumber: 'REG-LAB-20260906-003',
      queueNumber: 'LAB-003',
      patient: p3._id,
      patientType: 'ASURANSI',
      guarantorCardNo: 'POLIS-PRU-99881',
      referralSource: 'Rawat Inap Ruang Melati',
      referringDoctor: 'dr. Rizki Pratama Sp.JP',
      clinicalDiagnosis: 'Dyslipidemia + PJK Evaluasi Rutin',
      status: 'SAMPLING',
      orderTests: [
        { parameter: paramMap['GDS']._id, price: paramMap['GDS'].price },
        { parameter: paramMap['CHOLESTEROL']._id, price: paramMap['CHOLESTEROL'].price },
        { parameter: paramMap['TRIGLISERIDA']._id, price: paramMap['TRIGLISERIDA'].price },
        { parameter: paramMap['HDL']._id, price: paramMap['HDL'].price },
        { parameter: paramMap['LDL']._id, price: paramMap['LDL'].price }
      ],
      totalAmount: 220000
    });

    await Billing.create({
      registration: reg3._id,
      totalAmount: 220000,
      paymentStatus: 'TERVERIFIKASI_ASURANSI',
      paymentMethod: 'ASURANSI_SWASTA',
      cashierName: 'Dewi Lestari (Loket Asuransi)',
      receiptNo: 'ASR-LAB-0906-003',
      paidAt: new Date(Date.now() - 30 * 60 * 1000)
    });

    console.log('Seed master data and sample registrations created successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
