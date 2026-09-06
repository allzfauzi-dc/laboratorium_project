# Dokumentasi Skema Database MongoDB - Sistem Informasi Laboratorium RS (LIS)

Aplikasi LIS ini menggunakan **MongoDB** dengan **Mongoose ODM** untuk menangani seluruh alur pengujian laboratorium rumah sakit secara cepat, fleksibel, dan terstruktur.

---

## 1. Koleksi Utama (Collections)

### A. `patients` (Master Data Rekam Medis Pasien)
Menyimpan identitas dasar pasien:
- `_id`: ObjectId
- `mrNumber`: String (Unique, e.g. `RM-2026-0012`)
- `nik`: String (16 digit KTP)
- `name`: String
- `birthDate`: String (`YYYY-MM-DD`)
- `gender`: String (`L` / `P`)
- `address`: String
- `phone`: String
- `bloodType`: String (`A+`, `B+`, `O+`, `AB+`, dsb.)
- `createdAt`, `updatedAt`: Timestamps

### B. `testcategories` (Kategori Uji Laboratorium)
Pengelompokan pemeriksaan:
- `code`: String (Unique, e.g. `HEMATOLOGI`, `KIMIA_KLINIK`, `PROFIL_LIPID`, `FUNGSI_GINJAL`, `FUNGSI_HATI`, `URINALISIS`, `IMUNOSEROLOGI`)
- `name`: String
- `description`: String

### C. `testparameters` (Master Parameter Pemeriksaan & Nilai Rujukan)
- `categoryId`: ObjectId (Ref ke `testcategories`)
- `code`: String (Unique, e.g. `HB`, `LEUKOSIT`, `GDS`, `CHOLESTEROL`)
- `name`: String
- `unit`: String (e.g. `g/dL`, `/uL`, `mg/dL`)
- `refRangeMale`: String (Nilai Rujukan Pria, e.g. `13.5 - 17.5`)
- `refRangeFemale`: String (Nilai Rujukan Wanita, e.g. `12.0 - 15.5`)
- `minNormal`: Number (Batas bawah deteksi otomatis)
- `maxNormal`: Number (Batas atas deteksi otomatis)
- `criticalLow`: Number (Ambang bawah nilai kritis membahayakan nyawa)
- `criticalHigh`: Number (Ambang atas nilai kritis membahayakan nyawa)
- `specimenType`: String (`Darah EDTA`, `Serum`, `Urine Sewaktu`)
- `containerType`: String (`Tabung Tutup Ungu (EDTA K3)`, `Tabung Tutup Kuning (Gel)`, `Pot Urine`)
- `price`: Number (Tarif pemeriksaan dalam Rupiah)

### D. `registrations` (Pendaftaran & Formulir Rujukan - Tahap 1)
Menyimpan data rujukan dan status perjalanan sampel:
- `regNumber`: String (Unique, e.g. `REG-LAB-20260906-001`)
- `queueNumber`: String (e.g. `LAB-001`)
- `patient`: ObjectId (Ref ke `patients`)
- `patientType`: String (`UMUM`, `BPJS`, `ASURANSI`)
- `guarantorCardNo`: String (No BPJS / No Polis)
- `referralSource`: String (`Poli Penyakit Dalam`, `IGD`, `Rawat Inap Ruang Melati`, dsb.)
- `referringDoctor`: String (Dokter Pengirim)
- `clinicalDiagnosis`: String (Diagnosa awal dokter)
- `status`: Lifecycle Status:
  - `PENDAFTARAN` (Pendaftaran baru)
  - `ADMINISTRASI` (Menunggu loket kasir / verifikasi BPJS)
  - `SAMPLING` (Menunggu pengambilan sampel di bilik flebotomi)
  - `ANALISIS` (Sampel sedang diuji oleh analis di mesin otomatis)
  - `VALIDASI` (Menunggu review & otorisasi Dokter Sp.PK)
  - `SELESAI` (Hasil telah divalidasi resmi & siap dicetak)
- `orderTests`: Array of `{ parameter: ObjectId, price: Number }`
- `totalAmount`: Number

### E. `billings` (Administrasi Kasir & Penjaminan - Tahap 2)
- `registration`: ObjectId (Ref ke `registrations`)
- `totalAmount`: Number
- `paymentStatus`: String (`PENDING`, `LUNAS`, `TERVERIFIKASI_BPJS`, `TERVERIFIKASI_ASURANSI`)
- `paymentMethod`: String (`TUNAI`, `QRIS`, `TRANSFER_BANK`, `BPJS_KESEHATAN`, `ASURANSI_SWASTA`)
- `cashierName`: String
- `receiptNo`: String
- `notes`: String
- `paidAt`: Date

### F. `specimens` (Spesimen & Barcode Flebotomi - Tahap 3)
- `registration`: ObjectId (Ref ke `registrations`)
- `barcode`: String (Unique, e.g. `SMP-20260906-001`)
- `specimenType`: String
- `containerType`: String
- `volumeMl`: Number
- `sampleCondition`: String (`Baik`, `Hemolisis`, `Ikterik`, `Lipemik`, `Beku`)
- `phlebotomistName`: String (Nama Analis / Flebotomis)
- `samplingTime`: Date
- `status`: String (`DIAMBIL`, `DITERIMA_LAB`, `DITOLAK`)
- `notes`: String

### G. `testresults` (Pengolahan & Analisis Hasil Mesin - Tahap 4)
- `registration`: ObjectId (Ref ke `registrations`)
- `parameter`: ObjectId (Ref ke `testparameters`)
- `resultValue`: String (Nilai pengukuran)
- `flag`: String (`NORMAL`, `LOW`, `HIGH`, `CRITICAL`)
- `instrumentName`: String (e.g. `Sysmex XN-550`, `Cobas c311`)
- `reagentLot`: String
- `analystName`: String
- `analysisTime`: Date
- `status`: String (`DRAFT`, `SUBMITTED`, `APPROVED`)

### H. `validations` (Validasi & Otorisasi Dokter Sp.PK - Tahap 5)
- `registration`: ObjectId (Ref ke `registrations`)
- `pathologistName`: String (e.g. `dr. Bambang Irawan, Sp.PK`)
- `doctorSip`: String
- `validationTime`: Date
- `clinicalNotes`: String (Catatan ekspertise & kesimpulan klinis)
- `hasCriticalValue`: Boolean (Flag nilai kritis)
- `criticalActionNotes`: String (Catatan pelaporan darurat ke DPJP)
- `digitalSignatureCode`: String (Hash verifikasi QR / tanda tangan digital)
- `status`: String (`APPROVED`, `REVISED`)

---

## 2. Inisialisasi Otomatis (Auto-Seed)
Ketika server backend Express dijalankan (`npm start`), script `backend/src/config/seedData.js` secara otomatis memverifikasi keberadaan data dan mengisi master kategori, puluhan parameter laboratorium standar, serta sampel pasien untuk ketiga skenario alur pelayanan.
