# DOKUMEN IMPLEMENTASI PROYEK
# SISTEM INFORMASI MANAJEMEN LABORATORIUM RUMAH SAKIT (SIMRS-LAB / LIS)
**Standar Pelayanan 5 Tahap Terintegrasi & Keselamatan Pasien (Patient Safety)**  
*Lokasi Proyek: `D:\laboratorium` | Versi: 1.0.0 | Standar Formulir: RM. 21 / LAB*

---

## DAFTAR ISI
1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Flowchart Sistem & Alur Pelayanan (Diagram Alur)](#2-flowchart-sistem--alur-pelayanan)
   - 2.1 [Flowchart End-to-End Alur 5 Tahap](#21-flowchart-end-to-end-alur-5-tahap)
   - 2.2 [Swimlane Flowchart Berdasarkan Aktor / Petugas](#22-swimlane-flowchart-berdasarkan-aktor--petugas)
3. [Arsitektur Sistem & Komponen Teknologi](#3-arsitektur-sistem--komponen-teknologi)
   - 3.1 [Diagram Arsitektur Multi-Tier](#31-diagram-arsitektur-multi-tier)
   - 3.2 [Daftar Stack Teknologi yang Digunakan](#32-daftar-stack-teknologi-yang-digunakan)
   - 3.3 [Struktur Direktori Proyek](#33-struktur-direktori-proyek)
4. [Arsitektur Basis Data (MongoDB Document Model)](#4-arsitektur-basis-data-mongodb-document-model)
   - 4.1 [Diagram Relasi Data (ERD / Document Reference)](#41-diagram-relasi-data-erd--document-reference)
   - 4.2 [Kamus Data & Struktur Koleksi (Data Dictionary)](#42-kamus-data--struktur-koleksi)
5. [Panduan Operasional & Cara Penggunaan Aplikasi (User Manual)](#5-panduan-operasional--cara-penggunaan-aplikasi)
   - 5.1 [Persiapan & Menjalankan Aplikasi](#51-persiapan--menjalankan-aplikasi)
   - 5.2 [Panduan Tahap 1: Resepsionis & Pendaftaran Rujukan](#52-panduan-tahap-1-resepsionis--pendaftaran-rujukan)
   - 5.3 [Panduan Tahap 2: Loket Administrasi & Kasir Penjaminan](#53-panduan-tahap-2-loket-administrasi--kasir-penjaminan)
   - 5.4 [Panduan Tahap 3: Bilik Pengambilan Spesimen (Flebotomi & Barcode)](#54-panduan-tahap-3-bilik-pengambilan-spesimen-flebotomi--barcode)
   - 5.5 [Panduan Tahap 4: Ruang Analitik (Pengolahan & Analisis Hasil Mesin)](#55-panduan-tahap-4-ruang-analitik-pengolahan--analisis-hasil-mesin)
   - 5.6 [Panduan Tahap 5: Ruang Dokter Spesialis Patologi Klinik (Validasi Sp.PK)](#56-panduan-tahap-5-ruang-dokter-spesialis-patologi-klinik-validasi-sppk)
   - 5.7 [Panduan Cetak Dokumen Hasil Laboratorium Resmi (RM. 21 / LAB)](#57-panduan-cetak-dokumen-hasil-laboratorium-resmi-rm-21--lab)
   - 5.8 [Panduan Pengaturan Master Pelayanan & Tarif Laboratorium](#58-panduan-pengaturan-master-pelayanan--tarif-laboratorium)
   - 5.9 [Panduan Autentikasi Login & Hak Akses Peran (RBAC)](#59-panduan-autentikasi-login--hak-akses-peran-rbac)
   - 5.10 [Panduan Master Manajemen Pengguna & Role Akses](#510-panduan-master-manajemen-pengguna--role-akses)
6. [Fitur Keamanan & Penanganan Nilai Kritis (Critical Value Alert)](#6-fitur-keamanan--penanganan-nilai-kritis)
7. [Troubleshooting & Solusi Masalah Teknis](#7-troubleshooting--solusi-masalah-teknis)

---

## 1. GAMBARAN UMUM PROYEK

Sistem Informasi Manajemen Laboratorium Rumah Sakit (**SIMRS-LAB / Laboratory Information System - LIS**) adalah aplikasi perangkat lunak komprehensif yang dirancang untuk mengelola seluruh siklus hidup pemeriksaan laboratorium medik di rumah sakit, mulai dari saat pasien datang membawa surat rujukan dokter hingga dokumen hasil resmi terbit dengan otorisasi digital.

Aplikasi ini dibangun untuk memenuhi standar keselamatan pasien (*patient safety*), akreditasi rumah sakit (STARKES/KARS), dan tata kelola laboratorium klinik yang baik (*Good Laboratory Practice - GLP*), khususnya dalam:
1. **Mencegah Tertukarnya Sampel**: Otomasi pembuatan label barcode unik pada setiap tabung spesimen.
2. **Kesesuaian Indikasi**: Verifikasi berlapis antara diagnosa klinis pengantar dokter dan parameter lab yang diminta.
3. **Peringatan Dini Nilai Kritis (*Critical Value Alert*)**: Sistem secara otomatis mendeteksi jika ada parameter analitik yang melampaui batas kritis yang mengancam keselamatan pasien, serta mewajibkan pencatatan waktu pelaporan darurat ke dokter pengirim (DPJP).
4. **Validasi Multi-Tier**: Pengujian oleh analis medis dilanjutkan dengan peninjauan ekspertise dan otorisasi oleh Dokter Spesialis Patologi Klinik (Sp.PK).

---

## 2. FLOWCHART SISTEM & ALUR PELAYANAN

### 2.1 Flowchart End-to-End Alur 5 Tahap

Diagram alur berikut menggambarkan urutan logika sistem dari pendaftaran awal hingga hasil akhir dicetak:

```mermaid
flowchart TD
    Start([Pasien Datang Membawa Formulir Rujukan]) --> Step1[1. Resepsionis: Pendaftaran & Input Rujukan]
    Step1 --> S1_Sub1[Cari / Daftarkan Pasien: No RM, NIK, Nama]
    S1_Sub1 --> S1_Sub2[Pilih Asal Rujukan, Dokter Pengirim & Diagnosa]
    S1_Sub2 --> S1_Sub3[Pilih Parameter Uji Lab & Hitung Tarif]
    S1_Sub3 --> S1_Sub4[Generate Nomor Antrean LAB-xxx & No Registrasi]
    
    S1_Sub4 --> Step2[2. Loket Administrasi & Kasir]
    Step2 --> S2_Check{Status Penjaminan?}
    S2_Check -- UMUM --> S2_Pay[Pembayaran Kasir: Tunai / QRIS / EDC]
    S2_Check -- BPJS / Asuransi --> S2_Verify[Verifikasi No. SEP BPJS / Polis Asuransi]
    S2_Pay --> S2_Lunas[Status: LUNAS / TERVERIFIKASI]
    S2_Verify --> S2_Lunas
    
    S2_Lunas --> Step3[3. Bilik Sampling / Flebotomi]
    Step3 --> S3_Call[Panggil Pasien Sesuai No Antrean]
    S3_Call --> S3_Identify[Cek Wadah: Tabung EDTA Ungu / Serum Kuning / Pot Urine]
    S3_Identify --> S3_Take[Pengambilan Sampel Darah / Urine / Swab]
    S3_Take --> S3_Barcode[Cetak & Tempel Label Barcode SMP-xxx pada Tabung]
    S3_Barcode --> S3_Quality[Pemeriksaan Kualitas: Baik / Hemolisis / Ikterik]
    
    S3_Quality --> Step4[4. Ruang Analitik / Pengolahan Sampel]
    Step4 --> S4_Run[Running Spesimen di Mesin Analyzer Sysmex / Cobas]
    S4_Run --> S4_Input[Analis Input Nilai Hasil Parameter]
    S4_Input --> S4_Eval{Evaluasi Nilai Otomatis}
    S4_Eval -- Dalam Rentang --> S4_Normal[Flag: NORMAL]
    S4_Eval -- Di Bawah Normal --> S4_Low[Flag: LOW]
    S4_Eval -- Di Atas Normal --> S4_High[Flag: HIGH]
    S4_Eval -- Melampaui Batas Kritis --> S4_Critical[Flag: CRITICAL ALERT Merah Berkedip]
    S4_Normal --> S4_Submit[Kirim Worklist ke Dokter Sp.PK]
    S4_Low --> S4_Submit
    S4_High --> S4_Submit
    S4_Critical --> S4_Submit
    
    S4_Submit --> Step5[5. Ruang Dokter Sp.PK: Validasi & Otorisasi]
    Step5 --> S5_Review[Dokter Sp.PK Meninjau Hasil & Diagnosa Pasien]
    S5_Review --> S5_Decision{Apakah Hasil Sahih & Sesuai Klinis?}
    S5_Decision -- Butuh Uji Ulang / Dilusi --> S5_Revise[Action: REVISE -> Kembali ke Tahap 4]
    S5_Revise --> Step4
    S5_Decision -- Sahih & Terverifikasi --> S5_Notes[Dokter Tulis Ekspertise Klinis]
    S5_Notes --> S5_Sign[Otorisasi Digital Hash & QR Code Sp.PK]
    
    S5_Sign --> StepFinish[Selesai: Dokumen Hasil Lab Resmi RM. 21 Terbit]
    StepFinish --> Print[Cetak Lembar Resmi / Download PDF Pasien]
    Print --> End([Selesai])
```

---

### 2.2 Swimlane Flowchart Berdasarkan Aktor / Petugas

Diagram berikut memisahkan tanggung jawab operasional masing-masing peran petugas rumah sakit:

```mermaid
sequenceDiagram
    autonumber
    actor Pasien
    actor Resepsionis
    actor Kasir
    actor Flebotomis
    actor Analis
    actor Dokter_SpPK as Dokter Sp.PK
    participant LIS as Sistem LIS (Database & API)

    Pasien->>Resepsionis: Menyerahkan Formulir Rujukan Dokter
    Resepsionis->>LIS: Input Identitas, Rujukan, & Pilihan Tes
    LIS-->>Resepsionis: Nomor Antrean (LAB-xxx) & Tagihan
    Resepsionis->>Pasien: Memberikan Tiket Antrean & Lembar Tagihan
    
    Pasien->>Kasir: Menuju Loket Kasir / Penjaminan
    Kasir->>LIS: Verifikasi Identitas, Pelunasan Tunai/QRIS / Cek SEP BPJS
    LIS-->>Kasir: Status LUNAS / TERVERIFIKASI
    Kasir->>Pasien: Bukti Pembayaran, diarahkan ke Bilik Sampling
    
    Flebotomis->>LIS: Panggil Antrean Sampling Berikutnya
    Flebotomis->>Pasien: Verifikasi Nama & Tanggal Lahir di Bilik
    Flebotomis->>Pasien: Pengambilan Spesimen (Vena / Urine)
    Flebotomis->>LIS: Konfirmasi Sampel Diambil & Cetak Barcode (SMP-xxx)
    Flebotomis->>LIS: Tempel Barcode & Serahkan Spesimen ke Ruang Analitik
    
    Analis->>LIS: Buka Worklist Sampel Masuk
    Analis->>Analis: Proses Sampel pada Mesin Analyzer (Sysmex / Cobas)
    Analis->>LIS: Input Hasil Parameter Uji
    LIS-->>Analis: Auto-Flagging (Normal / Low / High / Critical Alert)
    Analis->>LIS: Submit Hasil ke Dokter Sp.PK
    
    Dokter_SpPK->>LIS: Review Hasil Analisis & Indikasi Klinis
    alt Ada Nilai Kritis
        Dokter_SpPK->>Dokter_SpPK: Hubungi DPJP Pengirim via Telepon Darurat
        Dokter_SpPK->>LIS: Input Catatan Waktu Pelaporan Kritis
    end
    Dokter_SpPK->>LIS: Input Catatan Ekspertise & Otorisasi Tanda Tangan Digital
    LIS-->>Dokter_SpPK: Terbit Dokumen Resmi RM. 21 / LAB
    
    LIS->>Pasien: Lembar Hasil Laboratorium Resmi Dapat Dicetak / Diambil
```

---

## 3. ARSITEKTUR SISTEM & KOMPONEN TEKNOLOGI

### 3.1 Diagram Arsitektur Multi-Tier

Sistem mengadopsi arsitektur **Three-Tier (Frontend - Backend - Database)** yang decoupled dan berkomunikasi melalui protokol HTTP RESTful API:

```text
+-----------------------------------------------------------------------------------+
|                            TIER 1: PRESENTATION LAYER                             |
|                           (Frontend Single Page App)                              |
|                                                                                   |
|  [Vue 3 Composition API] + [Vite 5] + [Tailwind CSS] + [Vue Router 4]             |
|                                                                                   |
|  +-------------------+  +--------------------+  +-------------------------------+ |
|  | DashboardView.vue |  | Step1Registration  |  | Step2BillingView.vue          | |
|  +-------------------+  +--------------------+  +-------------------------------+ |
|  | Step3SamplingView |  | Step4AnalyzerView  |  | Step5ValidationView.vue       | |
|  +-------------------+  +--------------------+  +-------------------------------+ |
|  | BarcodeLabel.vue  |  | WorkflowStepper.vue|  | LabReportPrintView.vue (RM.21)| |
|  +-------------------+  +--------------------+  +-------------------------------+ |
|                          |                                                        |
|                          | HTTP Fetch (JSON) / Proxy /api                         |
+--------------------------|--------------------------------------------------------+
                           v
+-----------------------------------------------------------------------------------+
|                             TIER 2: APPLICATION LAYER                             |
|                               (Node.js & Express REST API)                        |
|                                                                                   |
|  [server.js] -> Express App (Port 5000)                                           |
|  [Middlewares] -> CORS, JSON Body Parser, URL-Encoded                             |
|                                                                                   |
|  API Modular Routers:                                                             |
|  - /api/auth           : Autentikasi Login, RBAC, & Master Manajemen Pengguna     |
|  - /api/patients       : Pencarian & Perekaman Rekam Medis                        |
|  - /api/tests          : Master Data Kategori, Parameter & Tarif Laboratorium     |
|  - /api/registrations  : Alur Tahap 1 - Order Pemeriksaan & Antrean               |
|  - /api/billing        : Alur Tahap 2 - Kasir, BPJS, & Asuransi                   |
|  - /api/sampling       : Alur Tahap 3 - Bilik Flebotomi & Barcoding               |
|  - /api/analyzer       : Alur Tahap 4 - Worklist & Evaluasi Auto-Flag Nilai Normal|
|  - /api/validation     : Alur Tahap 5 - Ekspertise & Otorisasi Sp.PK              |
|  - /api/reports        : Statistik Dashboard & Format Cetak Laporan RM. 21        |
|                          |                                                        |
|                          | Mongoose ODM (Object Document Mapping)                 |
+--------------------------|--------------------------------------------------------+
                           v
+-----------------------------------------------------------------------------------+
|                               TIER 3: DATA LAYER                                  |
|                                (MongoDB Database)                                 |
|                                                                                   |
|  Primary: MongoDB Server (mongodb://127.0.0.1:27017/laboratorium)                 |
|  Fallback: Embedded MongoDB Memory Server (Zero-Configuration Out-of-the-box)     |
|  Data Seeder: Auto-seed puluhan parameter lab standar & akun bawaan 6 peran       |
|                                                                                   |
|  Collections:                                                                     |
|  - users           - patients          - registrations    - billings              |
|  - specimens       - testcategories    - testparameters   - testresults           |
|  - validations                                                                    |
+-----------------------------------------------------------------------------------+
```

---

### 3.2 Daftar Stack Teknologi yang Digunakan

| Komponen | Teknologi | Versi | Alasan Pemilihan & Fungsi |
|---|---|---|---|
| **Frontend Framework** | Vue.js | 3.4.x | Reaktivitas tinggi, arsitektur modular `<script setup>`, performa cepat untuk dashboard medis. |
| **Build Tool** | Vite | 5.4.11 | Fast HMR (Hot Module Replacement) dan proses bundling produksi yang sangat ringkas (< 2 detik). |
| **Styling Framework** | Tailwind CSS | 3.4.x | Utility-first CSS untuk mendesain antarmuka medis profesional, responsif, dan layout cetak presisi (*print media query*). |
| **Client Routing** | Vue Router | 4.x | Navigasi SPA (Single Page Application) antar 5 alur pelayanan tanpa refresh halaman. |
| **Backend Runtime** | Node.js | v22.x | Lingkungan eksekusi server yang asinkron dan efisien menangani throughput transaksi data laboratorium. |
| **Web Server Framework**| Express.js | 5.x | Routing REST API yang modular, ringan, dan mudah dihubungkan dengan middleware. |
| **Database ODM** | Mongoose | 9.x | Skema dokumen data terstruktur, validasi tipe data ketat, dan relasi dokumen MongoDB. |
| **Database Engine** | MongoDB | 6.x / 7.x | Basis data NoSQL berorientasi dokumen, sangat fleksibel menampung variasi hasil parameter medis yang dinamis. |
| **Embedded DB Fallback**| mongodb-memory-server| 11.x | Server memori MongoDB otomatis agar aplikasi langsung dapat dijalankan tanpa perlu instalasi rumit. |

---

### 3.3 Struktur Direktori Proyek

```text
D:\laboratorium\
├── run.bat                             # Script satu-klik untuk meluncurkan backend & frontend
├── README.md                           # Dokumentasi ringkas proyek
├── DOKUMENTASI_IMPLEMENTASI.md         # Dokumen arsitektur, flowchart, dan user manual lengkap
│
├── backend/                            # Folder Server API Backend
│   ├── .env                            # Konfigurasi PORT (5000) & MONGODB_URI
│   ├── package.json                    # Dependensi Express, Mongoose, CORS, Dotenv
│   └── src/
│       ├── server.js                   # Server entrypoint & routing loader
│       ├── config/
│       │   ├── db.js                   # Koneksi Mongoose dengan fail-safe memory server
│       │   └── seedData.js             # Data master otomatis: kategori, parameter lab, & sample
│       ├── models/                     # Mongoose Schema Definitions:
│       │   ├── User.js                 # Schema Akun Pengguna, Password, Role, & Status
│       │   ├── Patient.js              # Schema Pasien Rekam Medis
│       │   ├── TestCategory.js         # Schema Kategori Pemeriksaan
│       │   ├── TestParameter.js        # Schema Parameter & Nilai Rujukan Normal/Kritis
│       │   ├── Registration.js         # Schema Pendaftaran, Rujukan, & Lifecycle Alur
│       │   ├── Billing.js              # Schema Tagihan, Kasir, & Verifikasi Penjaminan
│       │   ├── Specimen.js             # Schema Wadah, Barcode, & Kondisi Spesimen
│       │   ├── TestResult.js           # Schema Nilai Hasil Pengukuran & Flag
│       │   └── Validation.js           # Schema Otorisasi Dokter Sp.PK & Kode Hash QR
│       └── routes/                     # Controller RESTful API Endpoints:
│           ├── auth.js                 # Endpoint Autentikasi Login & Master User CRUD
│           ├── patients.js             # CRUD & Pencarian Pasien
│           ├── tests.js                # Pengambilan & Pengaturan Tarif Parameter
│           ├── registrations.js        # Endpoint Tahap 1: Registrasi & Order
│           ├── billing.js              # Endpoint Tahap 2: Pembayaran & Penjaminan
│           ├── sampling.js             # Endpoint Tahap 3: Bilik Flebotomi & Barcode
│           ├── analyzer.js             # Endpoint Tahap 4: Pengolahan Hasil & Auto-flag
│           ├── validation.js           # Endpoint Tahap 5: Otorisasi & Ekspertise Sp.PK
│           └── reports.js              # Endpoint Statistik & Dokumen Cetak RM. 21
│
├── frontend/                           # Folder Web Interface Frontend (Vue 3)
│   ├── index.html                      # HTML root template
│   ├── package.json                    # Dependensi Vue, Vue Router, Tailwind, Vite
│   ├── vite.config.js                  # Konfigurasi dev server & API proxy
│   ├── tailwind.config.js              # Konfigurasi palet warna & typography medis
│   ├── postcss.config.js               # PostCSS plugin loader
│   └── src/
│       ├── main.ts                     # Inisialisasi Vue app & plugin router
│       ├── style.css                   # Direktif Tailwind CSS & styling media cetak (@media print)
│       ├── router/
│       │   └── index.js                # Definisi route URL, RBAC, & Navigation Guard
│       ├── services/
│       │   ├── api.js                  # Client fetch API ke seluruh endpoint backend Express
│       │   └── auth.js                 # State session login, token, & route guard helper
│       ├── components/                 # Komponen Reusable:
│       │   ├── Navbar.vue              # Navigasi utama dengan auto-filter role & logout
│       │   ├── WorkflowStepper.vue     # Indikator visual progres 5 tahap pelayanan
│       │   └── BarcodeLabel.vue        # Visualisasi label barcode fisik tabung spesimen
│       └── views/                      # Tampilan Halaman Utama:
│           ├── LoginView.vue           # Portal Login Petugas & Quick Demo Role Switcher
│           ├── DashboardView.vue       # Dashboard monitoring antrean & metrik operasional
│           ├── Step1RegistrationView   # Antarmuka Tahap 1: Pendaftaran & Rujukan
│           ├── Step2BillingView.vue    # Antarmuka Tahap 2: Administrasi & Kasir
│           ├── Step3SamplingView.vue   # Antarmuka Tahap 3: Bilik Flebotomi & Barcode
│           ├── Step4AnalyzerView.vue   # Antarmuka Tahap 4: Ruang Analitik & Input Hasil
│           ├── Step5ValidationView.vue # Antarmuka Tahap 5: Validasi & Otorisasi Sp.PK
│           ├── LabReportPrintView.vue  # Formulir Cetak Lembar Hasil Resmi (RM. 21 / LAB)
│           ├── MasterSettingsView.vue  # Master Pengaturan Pelayanan & Tarif Tindakan (Admin)
│           └── UserManagementView.vue  # Master Manajemen Pengguna, Role, & Password (Admin)
│
└── database/                           # Skema & Referensi Basis Data
    ├── schema-mongodb.md               # Spesifikasi detail skema dokumen Mongoose
    ├── mongo-seed.json                 # Backup JSON data awal untuk import manual
    └── schema.sql                      # Referensi skema SQL DDL relasional
```

---

## 4. ARSITEKTUR BASIS DATA (MONGODB DOCUMENT MODEL)

### 4.1 Diagram Relasi Data (ERD / Document Reference)

```mermaid
erDiagram
    PATIENT ||--o{ REGISTRATION : "memiliki riwayat"
    REGISTRATION ||--|| BILLING : "memiliki rincian biaya"
    REGISTRATION ||--|| SPECIMEN : "diterbitkan spesimen"
    REGISTRATION ||--o{ TEST_RESULT : "memiliki hasil pengukuran"
    REGISTRATION ||--o| VALIDATION : "divalidasi oleh"
    
    TEST_CATEGORY ||--o{ TEST_PARAMETER : "mengelompokkan"
    TEST_PARAMETER ||--o{ TEST_RESULT : "menjadi acuan parameter"
    
    PATIENT {
        ObjectId _id
        string mrNumber "No RM Unik"
        string nik "NIK KTP"
        string name "Nama Lengkap"
        string birthDate "Tgl Lahir"
        string gender "L / P"
        string phone "No WhatsApp"
    }

    REGISTRATION {
        ObjectId _id
        string regNumber "No Registrasi Lab"
        string queueNumber "No Antrean (LAB-xxx)"
        ObjectId patient "Ref: Patient"
        string patientType "UMUM / BPJS / ASURANSI"
        string referralSource "Poli / IGD / Ranap"
        string referringDoctor "Dokter Pengirim"
        string clinicalDiagnosis "Diagnosa Awal"
        string status "PENDAFTARAN/ADMINISTRASI/SAMPLING/ANALISIS/VALIDASI/SELESAI"
        array orderTests "Daftar Item Tes & Harga"
        number totalAmount "Total Tarif"
    }

    BILLING {
        ObjectId _id
        ObjectId registration "Ref: Registration"
        number totalAmount "Total Tagihan"
        string paymentStatus "PENDING / LUNAS / TERVERIFIKASI"
        string paymentMethod "TUNAI / QRIS / BPJS / ASURANSI"
        string cashierName "Nama Petugas Kasir"
        string receiptNo "Nomor Kuitansi"
    }

    SPECIMEN {
        ObjectId _id
        ObjectId registration "Ref: Registration"
        string barcode "Barcode Unik (SMP-xxx)"
        string specimenType "Darah EDTA / Serum / Urine"
        string containerType "Wadah / Warna Tabung"
        number volumeMl "Volume Sampel"
        string sampleCondition "Baik / Hemolisis / Ikterik"
        string phlebotomistName "Nama Flebotomis"
        string status "DIAMBIL / DITERIMA_LAB"
    }

    TEST_PARAMETER {
        ObjectId _id
        ObjectId categoryId "Ref: TestCategory"
        string code "Kode Tes (HB, WBC, GDS)"
        string name "Nama Parameter"
        string unit "Satuan (g/dL, mg/dL)"
        string refRangeMale "Nilai Rujukan Pria"
        string refRangeFemale "Nilai Rujukan Wanita"
        number minNormal "Batas Bawah Normal"
        number maxNormal "Batas Atas Normal"
        number criticalLow "Ambang Kritis Bawah"
        number criticalHigh "Ambang Kritis Atas"
    }

    TEST_RESULT {
        ObjectId _id
        ObjectId registration "Ref: Registration"
        ObjectId parameter "Ref: TestParameter"
        string resultValue "Nilai Pengukuran"
        string flag "NORMAL / LOW / HIGH / CRITICAL"
        string instrumentName "Nama Mesin Analyzer"
        string analystName "Nama Analis Medis"
        string status "SUBMITTED / APPROVED"
    }

    VALIDATION {
        ObjectId _id
        ObjectId registration "Ref: Registration"
        string pathologistName "Dokter Sp.PK"
        string doctorSip "Nomor SIP Dokter"
        string clinicalNotes "Catatan Ekspertise"
        boolean hasCriticalValue "Flag Nilai Kritis"
        string digitalSignatureCode "Kode Hash Otorisasi QR"
        string status "APPROVED"
    }
```

---

### 4.2 Kamus Data & Struktur Koleksi

#### A. Koleksi `patients`
| Field | Tipe Data | Keterangan | Validasi / Aturan |
|---|---|---|---|
| `mrNumber` | String | Nomor Rekam Medis Pasien | Wajib, Unique, Index, Contoh: `RM-2026-0012` |
| `nik` | String | Nomor Induk Kependudukan | 16 Digit numerik KTP |
| `name` | String | Nama lengkap pasien | Wajib, Minimal 2 karakter |
| `birthDate` | String | Tanggal lahir format ISO | Wajib, Format `YYYY-MM-DD` |
| `gender` | String | Jenis kelamin biologis | Wajib, Enum: `['L', 'P']` |
| `address` | String | Alamat domisili | Teks alamat lengkap |
| `phone` | String | Nomor kontak / telepon | Nomor aktif untuk darurat/WA |
| `bloodType`| String | Golongan darah | Enum: `['A+', 'B+', 'AB+', 'O+', '-']` |

#### B. Koleksi `registrations`
| Field | Tipe Data | Keterangan | Validasi / Aturan |
|---|---|---|---|
| `regNumber`| String | Nomor registrasi laboratorium | Wajib, Unique, Contoh: `REG-LAB-20260906-001` |
| `queueNumber`| String | Nomor antrean harian | Format `LAB-001`, di-reset setiap hari |
| `patient` | ObjectId | Referensi ke dokumen Pasien | Wajib, Foreign key ke `patients._id` |
| `patientType`| String | Penjamin biaya pelayanan | Enum: `['UMUM', 'BPJS', 'ASURANSI']` |
| `guarantorCardNo`| String| Nomor identitas penjamin | Nomor Kartu BPJS / Nomor Polis Asuransi |
| `referralSource`| String| Asal rujukan internal/eksternal | Contoh: `Poli Penyakit Dalam`, `IGD`, `Rawat Inap` |
| `referringDoctor`| String| Dokter yang meminta tes | Contoh: `dr. Hendra Sp.PD` |
| `clinicalDiagnosis`| String| Indikasi/diagnosa klinis rujukan| Contoh: `Febris h-4 e.c susp. Tifoid` |
| `status` | String | Status alur pelayanan sampel | Enum: `['PENDAFTARAN', 'ADMINISTRASI', 'SAMPLING', 'ANALISIS', 'VALIDASI', 'SELESAI']` |
| `orderTests` | Array | Rincian parameter uji & tarif | Array of `{ parameter: ObjectId, price: Number }` |
| `totalAmount`| Number | Total akumulasi tarif | Hasil penjumlahan tarif tes |

#### C. Koleksi `specimens`
| Field | Tipe Data | Keterangan | Validasi / Aturan |
|---|---|---|---|
| `barcode` | String | Nomor barcode fisik spesimen | Wajib, Unique, Contoh: `SMP-20260906-001` |
| `containerType`| String | Warna/jenis tabung penampung | Contoh: `Tabung Tutup Ungu (EDTA K3)` |
| `volumeMl` | Number | Volume sampel yang didapat | Contoh: `3.0` mL |
| `sampleCondition`| String| Kondisi fisik sampel saat sampling | Enum: `['Baik', 'Hemolisis', 'Ikterik', 'Lipemik', 'Beku']` |
| `phlebotomistName`| String| Petugas pengambil sampel | Nama analis/perawat flebotomis |
| `samplingTime` | Date | Timestamp pengambilan sampel | Waktu penusukan vena / penerimaan spesimen |

#### D. Koleksi `testresults`
| Field | Tipe Data | Keterangan | Validasi / Aturan |
|---|---|---|---|
| `resultValue`| String | Nilai hasil uji laboratorium | Nilai numerik atau kualitatif (e.g. `14.2`, `Negatif`) |
| `flag` | String | Evaluasi abnormalitas otomatis | Enum: `['NORMAL', 'LOW', 'HIGH', 'CRITICAL']` |
| `instrumentName`| String| Nama mesin otomatis yang menguji| Contoh: `Sysmex XN-550`, `Cobas c311` |
| `reagentLot` | String | Nomor lot reagen kimia | Contoh: `LOT-HEM-991` |
| `analystName` | String | Analis kesehatan pemeriksa | Nama pranata laboratorium |

#### E. Koleksi `validations`
| Field | Tipe Data | Keterangan | Validasi / Aturan |
|---|---|---|---|
| `pathologistName`| String| Dokter Penanggung Jawab Lab | Spesialis Patologi Klinik (Sp.PK) |
| `doctorSip` | String | Nomor Surat Izin Praktik | Format izin operasional dinkes |
| `clinicalNotes` | String | Ekspertise / interpretasi klinis | Kesimpulan medis & saran lanjutan |
| `hasCriticalValue`| Boolean| Penanda adanya nilai kritis | `true` jika terdapat parameter `CRITICAL` |
| `criticalActionNotes`| String| Catatan pelaporan darurat | Waktu telepon dan nama perawat/dokter penerima |
| `digitalSignatureCode`| String| Kode hash tanda tangan digital | Format `DS-SPPK-YYYYMMDD-HEX` |

#### F. Koleksi `users` (Manajemen Akun Login & Role RBAC)
| Field | Tipe Data | Keterangan | Validasi / Aturan |
|---|---|---|---|
| `username` | String | ID Akun untuk login portal | Wajib, Unique, Index, Lowercase (e.g. `analis`, `admin`) |
| `password` | String | Kata sandi akun | Wajib, Minimal 6 karakter |
| `name` | String | Nama lengkap petugas & gelar | Wajib, Contoh: `Fitriani, S.Tr.Kes`, `dr. Bambang, Sp.PK` |
| `role` | String | Wewenang & pembatasan alur | Enum: `['ADMIN', 'RESEPSIONIS', 'KASIR', 'FLEBOTOMIS', 'ANALIS', 'DOKTER_SPPK']` |
| `roleTitle` | String | Deskripsi gelar jabatan resmi | Contoh: `Pranata Laboratorium Medis (Input Hasil Alat)` |
| `sipOrNip` | String | Nomor SIP atau NIP Petugas | Nomor identitas resmi Rumah Sakit / STR Dinkes |
| `isActive` | Boolean | Status keaktifan akun | Default: `true` (Dapat dinonaktifkan tanpa hapus riwayat audit) |

---

## 5. PANDUAN OPERASIONAL & CARA PENGGUNAAN APLIKASI

### 5.1 Persiapan & Menjalankan Aplikasi

Aplikasi telah disiapkan dengan skrip otomatis sehingga sangat mudah dijalankan di lingkungan Windows.

#### Metode 1: Menggunakan Script Satu-Klik (`run.bat`)
1. Buka File Explorer di Windows.
2. Masuk ke folder **`D:\laboratorium`**.
3. **Klik ganda (double click)** pada file **`run.bat`**.
4. Script akan otomatis membuka 2 jendela konsol:
   - Jendela 1: Server Backend API (Port 5000)
   - Jendela 2: Web Frontend Vue 3 (Port 5173)
5. Buka browser web (Google Chrome, Microsoft Edge, atau Mozilla Firefox) dan akses:  
   👉 **`http://localhost:5173`**

#### Metode 2: Melalui Terminal / Command Prompt Secara Manual
Jika ingin menjalankan secara terpisah:
- **Terminal 1 (Backend API)**:
  ```powershell
  cd D:\laboratorium\backend
  npm start
  ```
  *(Server berjalan di `http://localhost:5000`)*

- **Terminal 2 (Frontend Vue 3)**:
  ```powershell
  cd D:\laboratorium\frontend
  npm run dev
  ```
  *(Antarmuka berjalan di `http://localhost:5173`)*

---

### 5.2 Panduan Tahap 1: Resepsionis & Pendaftaran Rujukan

**Tujuan**: Menerima pasien rujukan, mencatat keluhan/diagnosa klinis, memilih pemeriksaan laboratorium, dan menerbitkan nomor antrean.

1. Pada navigasi atas, klik menu **`1. Pendaftaran & Rujukan`** (atau akses URL `http://localhost:5173/tahap-1`).
2. **Pilih Identitas Pasien**:
   - Jika pasien sudah pernah berobat: pilih opsi **"Pilih Pasien Terdaftar"**, ketikkan Nama atau No RM pada kolom pencarian, lalu klik nama pasien yang muncul pada dropdown.
   - Jika pasien baru: pilih opsi **"Pasien Baru"**, isi form Nama Pasien, NIK, Tanggal Lahir, Jenis Kelamin, Nomor HP, Golongan Darah, dan Alamat Domisili.
3. **Isi Data Pengantar Rujukan**:
   - **Asal Rujukan**: Pilih Poli Rawat Jalan, IGD, Rawat Inap Ruang Melati/Mawar, atau Rujukan Luar.
   - **Dokter Pengirim**: Masukkan nama dokter yang merujuk (e.g., `dr. Hendra Sp.PD`).
   - **Status Penjaminan**: Pilih `UMUM` (bayar mandiri), `BPJS` (JKN-KIS), atau `ASURANSI`.
   - Masukkan Nomor Kartu BPJS / Nomor Polis jika memilih non-umum.
   - **Diagnosa Klinis**: Masukkan indikasi sakit pasien (e.g., *Febris hari ke-4 susp. Infeksi Bakterial*).
4. **Pilih Daftar Pemeriksaan Laboratorium**:
   - Centang pemeriksaan yang diminta pada formulir rujukan dokter.
   - Tarif estimasi akan terhitung secara otomatis di pojok kanan atas.
5. Klik tombol **`Simpan Pendaftaran & Lanjut ke Administrasi →`**.
6. Sistem akan otomatis menerbitkan Nomor Registrasi (`REG-LAB-...`) dan Nomor Antrean (`LAB-001`), lalu secara otomatis mengarahkan ke Tahap 2.

---

### 5.3 Panduan Tahap 2: Loket Administrasi & Kasir Penjaminan

**Tujuan**: Memverifikasi kesesuaian tindakan, memproses pembayaran bagi pasien umum, atau memvalidasi kelayakan penjaminan BPJS/Asuransi.

1. Klik menu **`2. Administrasi & Kasir`** (URL: `http://localhost:5173/tahap-2`).
2. Pada panel sebelah kiri (**Antrean Loket Administrasi**), klik pasien yang ingin diproses.
3. Pada panel sebelah kanan, periksa kembali:
   - Data identitas pasien (No RM, NIK, Tanggal Lahir).
   - Rujukan dokter dan diagnosa klinis awal.
   - Rincian item pemeriksaan beserta total biaya tagihan.
4. **Penyelesaian Transaksi**:
   - **Untuk Pasien UMUM**: Pilih metode pembayaran (*Tunai, QRIS, Transfer Bank, atau EDC*), masukkan nama kasir, lalu klik **`💰 Selesaikan Pembayaran Kasir & Masuk Sampling →`**.
   - **Untuk Pasien BPJS / ASURANSI**: Pastikan nomor penjaminan telah terverifikasi, lalu klik **`🛡️ Verifikasi Penjaminan & Masuk Sampling →`**.
5. Status pasien akan otomatis berubah menjadi `SAMPLING` dan berpindah ke antrean Bilik Flebotomi (Tahap 3).

---

### 5.4 Panduan Tahap 3: Bilik Pengambilan Spesimen (Flebotomi & Barcode)

**Tujuan**: Memanggil pasien ke bilik sampling, mengambil sampel biologis dengan wadah yang sesuai SOP, mencetak label barcode unik, dan memeriksa mutu fisik sampel.

1. Klik menu **`3. Bilik Sampling`** (URL: `http://localhost:5173/tahap-3`).
2. Pada daftar antrean bilik, klik kartu pasien yang akan dipanggil.
3. Perhatikan box petunjuk **"Jenis Wadah & Spesimen yang Wajib Disiapkan"**:
   - Sistem secara cerdas menampilkan warna tabung yang dibutuhkan berdasarkan item tes pasien:
     - 🟣 **Tabung Tutup Ungu (EDTA K3)**: untuk Hematologi / Sel Darah.
     - 🟡 **Tabung Tutup Kuning (Gel Separator)**: untuk Kimia Darah / Serum.
     - 🟤 **Pot Bersih & Kering**: untuk spesimen Urine / Feses.
4. **Cetak Label Barcode**:
   - Kotak preview menampilkan label barcode fisik (`SMP-YYYYMMDD-XXX`) lengkap dengan identitas pasien.
   - Klik tombol **`🖨️ Cetak Label Barcode`** untuk mencetak ke printer barcode stiker.
   - Tempelkan label barcode tersebut secara langsung melingkar pada tabung sampel pasien sebelum penusukan vena untuk menghindari risiko sampel tertukar.
5. Lakukan pengambilan spesimen sesuai standar operasional flebotomi.
6. **Pencatatan Kondisi Sampel**:
   - Masukkan nama flebotomis/analis pengambil.
   - Pilih kondisi fisik sampel: *Baik (Normal), Hemolisis, Ikterik, Lipemik, atau Beku*.
   - Masukkan volume darah/spesimen yang didapat (misal: `3.0` mL).
7. Klik tombol **`🧪 Konfirmasi Sampel Diambil & Kirim ke Ruang Analitik →`**.
8. Sampel kini siap diuji di ruang mesin laboratorium (Tahap 4).

---

### 5.5 Panduan Tahap 4: Ruang Analitik (Pengolahan & Analisis Hasil Mesin)

**Tujuan**: Menganalisis spesimen pada instrumen otomatis medis, menginput hasil pengukuran, dan mengevaluasi status nilai normal atau nilai kritis secara otomatis.

1. Klik menu **`4. Ruang Analitik`** (URL: `http://localhost:5173/tahap-4`).
2. Pada panel **Daftar Sampel Siap Analisis**, klik sampel pasien yang sedang diproses.
3. Pasang spesimen pada rak instrumen analyzer (e.g. Sysmex XN-550 / Cobas c311) dan lakukan pengujian.
4. Setelah hasil keluar dari alat, ketikkan nilai hasil pada kolom **"Hasil Pengukuran"**:
   - **Auto-Flagging Otomatis Berjalan Real-Time**:
     - Jika hasil dalam rentang normal: Badge warna **`NORMAL` (Hijau)**.
     - Jika hasil di bawah batas normal: Badge warna **`LOW` (Biru)**.
     - Jika hasil di atas batas normal: Badge warna **`HIGH` (Oranye)**.
     - Jika hasil melampaui batas kritis keselamatan pasien: Badge berkedip **`CRITICAL` (Merah Pekat)** disertai banner peringatan bahaya `🚨 PERINGATAN NILAI KRITIS`.
5. Periksa dan lengkapi data instrumen:
   - Nama Instrumen/Alat (e.g., *Sysmex XN-550*).
   - Nomor Lot Reagen (e.g., *LOT-2026-A*).
   - Nama Analis Kesehatan Pemeriksa (e.g., *Fitriani, S.Tr.Kes*).
6. Klik tombol **`🔬 Simpan Hasil & Kirim ke Dokter Sp.PK untuk Validasi →`**.
7. Data hasil uji kini terkunci dan dikirim ke meja peninjauan Dokter Spesialis Patologi Klinik (Tahap 5).

---

### 5.6 Panduan Tahap 5: Ruang Dokter Spesialis Patologi Klinik (Validasi Sp.PK)

**Tujuan**: Dokter Sp.PK meninjau kesesuaian klinis hasil laboratorium secara komprehensif, mengonfirmasi nilai kritis, menuliskan ekspertise medis, dan memberikan otorisasi tanda tangan digital.

1. Klik menu **`5. Validasi dr. Sp.PK`** (URL: `http://localhost:5173/tahap-5`).
2. Pada daftar antrean, pasien yang memiliki nilai kritis akan ditandai dengan badge khusus berkedip **`CRITICAL VALUE!`**.
3. Klik nama pasien untuk membuka lembar peninjauan klinis.
4. Tinjau kesesuaian antara diagnosa pengirim dengan tabel hasil analisis laboratorium.
5. **Jika Ada Nilai Kritis**:
   - Dokter Sp.PK atau analis wajib segera menghubungi dokter pengirim (DPJP) atau perawat ruangan pasien via telepon darurat.
   - Tuliskan bukti pelaporan pada kolom catatan nilai kritis (Contoh: *"Telah dilaporkan via telepon ke dr. Maya Sp.PD pukul 14:15 WIB, diterima Ns. Dina"*).
6. **Pilihan Keputusan Dokter Sp.PK**:
   - **Opsi A: Butuh Pengujian Ulang (Revisi)**: Jika dokter melihat adanya diskrepansi atau dugaan interferensi alat, klik tombol **`↩️ Kembalikan ke Analis (Uji Ulang / Dilusi)`**. Sampel akan dikembalikan ke Tahap 4 untuk diuji ulang.
   - **Opsi B: Validasi & Otorisasi Sah**:
     - Tuliskan interpretasi patologi klinik pada kolom **"Catatan Ekspertise / Interpretasi Klinis Dokter Sp.PK"**.
     - Pastikan Nama Dokter Sp.PK dan Nomor SIP telah sesuai.
     - Klik tombol **`✍️ Validasi & Otorisasi Digital Resmi (Selesai) →`**.
7. Sistem akan men-generate kode unik tanda tangan digital (`DS-SPPK-YYYYMMDD-HEX`) dan mengunci status pelayanan menjadi **`SELESAI`**.
8. Tombol hijau **`🖨️ Cetak Lembar Hasil Lab Resmi →`** akan langsung muncul.

---

### 5.7 Panduan Cetak Dokumen Hasil Laboratorium Resmi (RM. 21 / LAB)

**Tujuan**: Mencetak dokumen rekam medis resmi hasil pemeriksaan laboratorium rumah sakit yang sah untuk diserahkan kepada pasien atau dilampirkan pada berkas rekam medis.

1. Buka halaman cetak melalui tombol dari Tahap 5 atau melalui Dashboard pada baris pasien berstatus `Selesai` (URL: `http://localhost:5173/cetak-hasil/:id`).
2. Lembar cetak secara otomatis menampilkan:
   - **Kop Resmi**: Pemerintah Kabupaten Pasaman, RSUD Lubuk Sikaping, Instalasi Laboratorium Patologi Klinik.
   - **Nomor Dokumen Rekam Medis**: Kode Standar `RM. 21 / LAB`.
   - **Identitas Pasien & Sampel**: No RM, Nama, Tanggal Lahir, Usia, Jenis Kelamin, Dokter Perujuk, Asal Ruangan, Diagnosa, dan Barcode Spesimen.
   - **Tabel Hasil per Kategori**: Nama parameter, nilai hasil, flag kelainan (`*HIGH*`, `*LOW*`, `*CRITICAL*`), satuan, nilai rujukan spesifik gender, dan instrumen yang digunakan.
   - **Catatan Ekspertise Patologi Klinik**: Interpretasi resmi dokter Sp.PK.
   - **Tanda Tangan & QR Digital**: Verifikasi tanda tangan digital resmi Sp.PK lengkap dengan cap digital dan nomor SIP.
3. Klik tombol **`🖨️ Cetak Lembar Hasil Resmi / Simpan PDF`** di pojok kanan atas.
4. Jendela cetak browser akan terbuka:
   - Pilih printer fisik untuk mencetak ke kertas fisik.
   - Atau pilih *"Save as PDF"* pada opsi printer untuk menyimpan sebagai file PDF ukuran A4.
   - Seluruh elemen navigasi web secara otomatis disembunyikan (*print stylesheet* aktif) sehingga hasil cetak bersih dan presisi.

---

### 5.8 Panduan Pengaturan Master Pelayanan & Tarif Laboratorium

**Tujuan**: Memberikan kewenangan kepada Administrator untuk mengelola struktur kategori tes, item pemeriksaan medis, nilai rujukan normal, nilai kritis, serta tarif/biaya tindakan (Rp).

- **Hak Akses**: Khusus role `ADMIN` (URL: `http://localhost:5173/pengaturan-tarif`).
- **Fitur Utama**:
  1. **Pengelolaan Kategori Pemeriksaan**: Menambah kategori baru (Hematologi, Kimia Klinik, Imunologi, Urinalisis, Mikrobiologi, dll).
  2. **Pengelolaan Parameter & Tarif**:
     - Kode & Nama Pemeriksaan (e.g., `HEM001 - Darah Lengkap Otomatis`).
     - Jenis Wadah/Tabung Spesimen (e.g., *Tabung EDTA Ungu*).
     - Satuan Hasil (e.g., `g/dL`, `10^3/uL`, `mg/dL`).
     - Rentang Nilai Rujukan Normal spesifik gender Pria dan Wanita.
     - Ambang Batas Nilai Kritis Minimum & Maksimum (pemicu *Critical Alert*).
     - **Nominal Tarif (Rp)**: Penyesuaian harga tindakan yang langsung berdampak otomatis ke formulir pendaftaran (Tahap 1) dan rincian kasir (Tahap 2).
  3. **Pencarian & Filter Cepat**: Filter berdasarkan kategori dan pencarian nama tes secara instan.

---

### 5.9 Panduan Autentikasi Login & Hak Akses Peran (RBAC)

**Tujuan**: Menjamin keamanan data pasien (*Patient Safety & Data Privacy*) dengan membatasi ruang lingkup kerja setiap petugas sesuai peran profesinya (Tupoksi).

- **Portal Login Petugas**: URL `http://localhost:5173/login`.
- **Fitur Quick Demo Role Switcher**: Tombol satu-klik pada layar login untuk berpindah peran saat pengujian sistem.
- **Tabel Akun Pengguna Bawaan (Default Accounts)**:

| Peran / Role | Username | Password | Petugas & Gelar | Ruang Lingkup Wewenang |
|---|---|---|---|---|
| **ANALIS** | `analis` | `analis123` | Fitriani, S.Tr.Kes | **Khusus Tahap 4: Ruang Analitik & Form Input Hasil** (Dilarang buka pendaftaran, kasir, sampling, validasi Sp.PK, atau tarif) |
| **DOKTER_SPPK** | `doktersppk` | `sppk123` | dr. Bambang Irawan, Sp.PK | **Khusus Tahap 5: Validasi, Otorisasi Digital & Cetak Hasil RM. 21** |
| **FLEBOTOMIS** | `flebotomis` | `sampling123` | Ns. Rahmat Hidayat, A.Md.AK | **Khusus Tahap 3: Bilik Sampling Flebotomi & Cetak Label Barcode** |
| **KASIR** | `kasir` | `kasir123` | Budi Santoso | **Khusus Tahap 2: Loket Administrasi, Kasir Umum & Verifikasi BPJS** |
| **RESEPSIONIS**| `resepsionis`| `pendaftaran123`| Siti Rahma, A.Md | **Khusus Tahap 1: Pendaftaran Pasien, Input Rujukan & Antrean** |
| **ADMIN** | `admin` | `admin123` | dr. H. Kurniawan, Sp.PK | **Seluruh Tahap (1 s/d 5), Pengaturan Tarif, & Manajemen Pengguna** |

- **Mekanisme Proteksi Berlapis**:
  1. *UI Filtering*: Menu navbar yang tidak berhak otomatis disembunyikan.
  2. *Router Navigation Guard*: Upaya membuka URL terlarang via address bar akan dicegat, memunculkan kotak dialog larangan akses, dan mengalihkan petugas kembali ke alur kerjanya yang sah.

---

### 5.10 Panduan Master Manajemen Pengguna & Role Akses

**Tujuan**: Memberikan kendali penuh kepada Administrator untuk mendaftarkan akun staf baru, mengatur wewenang kerja, mereset password, serta mengelola status keaktifan akun.

- **Hak Akses**: Khusus role `ADMIN` (URL: `http://localhost:5173/manajemen-pengguna`).
- **Fitur Utama Modul**:
  1. **Pendaftaran Akun Baru (`+ Tambah Pengguna Baru`)**:
     - Nama Lengkap Petugas & Gelar Profesi.
     - Username unik (huruf kecil tanpa spasi).
     - Password awal (minimal 6 karakter).
     - Pemilihan Role Wewenang (`ADMIN`, `RESEPSIONIS`, `KASIR`, `FLEBOTOMIS`, `ANALIS`, `DOKTER_SPPK`) dengan penjelasan izin akses interaktif.
     - Nomor SIP / NIP resmi.
  2. **Pembaruan Data & Rotasi Peran (`✏️ Edit`)**:
     - Mengubah identitas petugas dan memindahkan wewenang role alur saat rotasi penugasan.
  3. **Reset Password Mandiri**:
     - Admin dapat langsung mengganti password akun staf yang bersangkutan pada jendela modal edit.
  4. **Aktivasi & Deaktivasi Akun (Soft-Lock)**:
     - Checkbox status keaktifan untuk menonaktifkan petugas yang cuti/mutasi tanpa menghapus histori pemeriksaan yang pernah dikerjakan.
  5. **Penghapusan Akun (`🗑️`)**:
     - Menghapus akun yang tidak lagi diperlukan, dengan proteksi keamanan sistem (akun superadmin `admin` dilindungi dari penghapusan).
  6. **Matriks Hak Akses Interaktif (`📋 Matriks Hak Akses`)**:
     - Menampilkan tabel komparasi visual hak akses seluruh alur pelayanan langsung di layar monitor.

---

## 6. FITUR KEAMANAN & PENANGANAN NILAI KRITIS

Aplikasi ini dilengkapi logika keselamatan pasien otomatis (*Patient Safety Algorithm*):

1. **Threshold Nilai Kritis Terpasang**:
   - **Hemoglobin (Hb)**: Kritis jika $\le 7.0\text{ g/dL}$ atau $\ge 20.0\text{ g/dL}$
   - **Leukosit (WBC)**: Kritis jika $\le 2.000\text{ /\mu L}$ atau $\ge 30.000\text{ /\mu L}$
   - **Trombosit (PLT)**: Kritis jika $\le 50.000\text{ /\mu L}$ atau $\ge 1.000.000\text{ /\mu L}$
   - **Glukosa Darah (GDS/GDP)**: Kritis jika $\le 45\text{ mg/dL}$ (Hipoglikemia berat) atau $\ge 450\text{ mg/dL}$ (Ketoasidosis/HHS)
   - **Kreatinin**: Kritis jika $\ge 5.0\text{ mg/dL}$ (Gagal ginjal akut)

2. **Prosedur Pelaporan Nilai Kritis**:
   - Sistem secara otomatis mendeteksi saat analis menginput nilai di Tahap 4.
   - Saat status `CRITICAL` terpicu, baris hasil langsung disorot merah dan banner bahaya muncul.
   - Dokter Sp.PK di Tahap 5 tidak dapat menyelesaikan validasi tanpa mencatat bukti konfirmasi pelaporan darurat (*Read Back Protocol*).

---

## 7. TROUBLESHOOTING & SOLUSI MASALAH TEKNIS

| Gejala Masalah | Penyebab Umum | Solusi / Tindakan Perbaikan |
|---|---|---|
| **Frontend tidak dapat memuat data ("Failed to fetch")** | Server backend belum berjalan di port 5000. | Jalankan `run.bat` atau buka terminal, masuk ke `D:\laboratorium\backend` lalu ketik `npm start`. Pastikan pesan *"Server is running on port 5000"* muncul. |
| **Port 5000 sudah terpakai oleh aplikasi lain** | Aplikasi lain (misal service web lain) sedang memakai port 5000. | Buka file `D:\laboratorium\backend\.env`, ubah `PORT=5001`. Kemudian pada `D:\laboratorium\frontend\vite.config.js`, ubah target proxy ke `http://localhost:5001`. |
| **Ingin menghubungkan ke database MongoDB lokal/Compass** | Konfigurasi default mengarah ke localhost. | Pastikan service MongoDB berjalan di Windows (`net start MongoDB`). URL default di `backend/.env` adalah `mongodb://127.0.0.1:27017/laboratorium`. |
| **Ingin menghubungkan ke Cloud MongoDB Atlas** | Ingin data tersimpan di server cloud. | Buka `D:\laboratorium\backend\.env`, ganti `MONGODB_URI` dengan connection string Atlas Anda, contoh: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/laboratorium?retryWrites=true&w=majority`. |
| **Ingin mengulang / mereset data demo ke kondisi awal** | Data sampel sudah banyak diubah saat uji coba. | Hapus database `laboratorium` di MongoDB, lalu restart backend (`npm start`). Sistem akan otomatis menjalankan ulang *auto-seeding* master data. |
| **Tampilan cetak hasil lab terpotong saat diprint** | Pengaturan kertas di browser belum diatur ke A4. | Pada dialog print browser, pilih ukuran kertas **A4**, orientasi **Portrait**, dan aktifkan opsi **"Background graphics"** agar warna kop dan tabel tampil sempurna. |

---

*Dokumen implementasi ini disusun sebagai panduan teknis arsitektur, basis data, dan manual operasional resmi untuk Sistem Informasi Manajemen Laboratorium Rumah Sakit (SIMRS-LAB).*
