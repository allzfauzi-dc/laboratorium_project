-- =======================================================
-- SISTEM INFORMASI LABORATORIUM RUMAH SAKIT (SIMRS-LAB)
-- Database Schema (SQLite / RDBMS Compatible)
-- =======================================================

PRAGMA foreign_keys = ON;

-- 1. Tabel Pasien (Master Data Pasien)
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mr_number VARCHAR(50) UNIQUE NOT NULL,      -- Nomor Rekam Medis (No RM)
    nik VARCHAR(20),                            -- Nomor Induk Kependudukan
    name VARCHAR(150) NOT NULL,                 -- Nama Lengkap Pasien
    birth_date DATE NOT NULL,                   -- Tanggal Lahir (YYYY-MM-DD)
    gender VARCHAR(10) NOT NULL,                -- L (Laki-laki) / P (Perempuan)
    address TEXT,                               -- Alamat Tempat Tinggal
    phone VARCHAR(25),                          -- No Telepon / WA
    blood_type VARCHAR(5),                      -- Golongan Darah (A, B, AB, O, +/-)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Registrasi & Rujukan Laboratorium (Tahap 1)
CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reg_number VARCHAR(50) UNIQUE NOT NULL,     -- No Registrasi Lab (e.g. REG-LAB-20260906-001)
    queue_number VARCHAR(20) NOT NULL,          -- No Antrean (e.g. A-001)
    patient_id INTEGER NOT NULL,                -- Relasi ke tabel patients
    patient_type VARCHAR(20) NOT NULL,          -- UMUM, BPJS, ASURANSI
    guarantor_card_no VARCHAR(50),              -- No Kartu BPJS / Polis Asuransi
    referral_source VARCHAR(100) NOT NULL,      -- Poli Rawat Jalan, IGD, Rawat Inap, Rujukan Luar
    referring_doctor VARCHAR(150) NOT NULL,     -- Nama Dokter Pengirim
    clinical_diagnosis TEXT,                    -- Indikasi / Diagnosa Klinis Awal
    status VARCHAR(30) NOT NULL DEFAULT 'PENDAFTARAN', 
    -- Status Alur: 'PENDAFTARAN', 'ADMINISTRASI', 'SAMPLING', 'ANALISIS', 'VALIDASI', 'SELESAI'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT
);

-- 3. Tabel Kategori Pemeriksaan Laboratorium
CREATE TABLE IF NOT EXISTS test_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(30) UNIQUE NOT NULL,           -- e.g. HEMATOLOGI, KIMIA_KLINIK, URINALISIS
    name VARCHAR(100) NOT NULL,                 -- Nama Kategori
    description TEXT
);

-- 4. Tabel Parameter Uji Laboratorium (Master Data Tes)
CREATE TABLE IF NOT EXISTS test_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,           -- Kode Pemeriksaan (e.g. HB, WBC, GLU_FASTING)
    name VARCHAR(150) NOT NULL,                 -- Nama Parameter (e.g. Hemoglobin, Glukosa Puasa)
    unit VARCHAR(30),                           -- Satuan (g/dL, /uL, mg/dL)
    ref_range_male VARCHAR(100),                -- Nilai Rujukan Laki-Laki (e.g. 13.5 - 17.5)
    ref_range_female VARCHAR(100),              -- Nilai Rujukan Perempuan (e.g. 12.0 - 15.5)
    min_normal REAL,                            -- Nilai batas bawah untuk deteksi otomatis
    max_normal REAL,                            -- Nilai batas atas untuk deteksi otomatis
    critical_low REAL,                          -- Batas Bawah Nilai Kritis
    critical_high REAL,                         -- Batas Atas Nilai Kritis
    specimen_type VARCHAR(50) NOT NULL,         -- Darah EDTA, Serum, Urine Sewaktu, dll.
    container_type VARCHAR(100) NOT NULL,       -- Tabung Ungu (EDTA), Tabung Merah/Kuning, Pot Urine
    price REAL NOT NULL DEFAULT 0,              -- Tarif Pemeriksaan (Rp)
    FOREIGN KEY (category_id) REFERENCES test_categories(id) ON DELETE CASCADE
);

-- 5. Tabel Relasi Pemeriksaan yang Dipesan (Order Test Items)
CREATE TABLE IF NOT EXISTS order_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER NOT NULL,
    parameter_id INTEGER NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (parameter_id) REFERENCES test_parameters(id) ON DELETE RESTRICT
);

-- 6. Tabel Administrasi & Kasir / Penjaminan (Tahap 2)
CREATE TABLE IF NOT EXISTS billings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER UNIQUE NOT NULL,
    total_amount REAL NOT NULL,                 -- Total Tagihan Biaya Tes
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', 
    -- PENDING, LUNAS, TERVERIFIKASI_BPJS, TERVERIFIKASI_ASURANSI
    payment_method VARCHAR(50),                 -- TUNAI, QRIS, TRANSFER, BPJS, ASURANSI
    cashier_name VARCHAR(100),                  -- Petugas Administrasi / Kasir
    payment_time DATETIME,                      -- Waktu pelunasan / verifikasi
    receipt_no VARCHAR(50),                     -- Nomor Kuitansi / Bukti Administrasi
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- 7. Tabel Pengambilan Spesimen / Flebotomi (Tahap 3)
CREATE TABLE IF NOT EXISTS specimens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,       -- No Barcode Unik (e.g. SMP-20260906-001)
    specimen_type VARCHAR(100) NOT NULL,        -- Jenis Spesimen
    container_type VARCHAR(100) NOT NULL,       -- Jenis Tabung / Wadah
    sampling_time DATETIME,                     -- Waktu Pengambilan
    phlebotomist_name VARCHAR(150),             -- Nama Flebotomis / Analis Pengambil Sampel
    volume_ml REAL,                             -- Volume sampel yang didapat
    sample_condition VARCHAR(50) DEFAULT 'Baik',-- Kondisi: Baik, Hemolisis, Ikterik, Lipemik, Beku
    notes TEXT,                                 -- Catatan bilik sampling
    status VARCHAR(30) NOT NULL DEFAULT 'BELUM_SAMPLING',
    -- Status: 'BELUM_SAMPLING', 'DIAMBIL', 'DITERIMA_LAB', 'DITOLAK'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- 8. Tabel Pengolahan & Analisis Hasil Tes (Tahap 4)
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER NOT NULL,
    parameter_id INTEGER NOT NULL,
    result_value VARCHAR(100),                  -- Nilai Hasil Pengukuran
    flag VARCHAR(20) DEFAULT 'NORMAL',          -- NORMAL, LOW, HIGH, CRITICAL
    instrument_name VARCHAR(150),               -- Nama Alat/Mesin (e.g. Sysmex XN-550, Cobas c311)
    reagent_lot VARCHAR(50),                    -- Nomor Lot Reagen
    analyst_name VARCHAR(150),                  -- Nama Analis Kesehatan
    analysis_time DATETIME,                     -- Waktu Input & Analisis
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (parameter_id) REFERENCES test_parameters(id) ON DELETE RESTRICT
);

-- 9. Tabel Validasi & Otorisasi Dokter Sp.PK (Tahap 5)
CREATE TABLE IF NOT EXISTS validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER UNIQUE NOT NULL,
    pathologist_name VARCHAR(150) NOT NULL,     -- Dokter Spesialis Patologi Klinik (Sp.PK)
    doctor_sip VARCHAR(100),                    -- Nomor SIP Dokter Sp.PK
    validation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    clinical_notes TEXT,                        -- Catatan Ekspertise / Interpretasi Klinis
    has_critical_value INTEGER DEFAULT 0,       -- 1 = Ada Nilai Kritis, 0 = Normal/Non-kritis
    critical_action_notes TEXT,                 -- Catatan tindak lanjut nilai kritis (lapor DPJP/ruangan)
    digital_signature_code VARCHAR(255),        -- Kode Hash Verifikasi Tanda Tangan Digital / QR
    status VARCHAR(30) DEFAULT 'APPROVED',      -- APPROVED, REVISION_REQUESTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- Indeks untuk mempercepat pencarian data
CREATE INDEX IF NOT EXISTS idx_patients_mr ON patients(mr_number);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_queue ON registrations(queue_number);
CREATE INDEX IF NOT EXISTS idx_specimens_barcode ON specimens(barcode);
CREATE INDEX IF NOT EXISTS idx_test_results_reg ON test_results(registration_id);
