# SIMRS Laboratorium (Hospital Laboratory Information System)
**RSUD Lubuk Sikaping - Instalasi Laboratorium Patologi Klinik**

Sistem Informasi Manajemen Laboratorium Rumah Sakit yang mengimplementasikan alur terstandar 5 tahap untuk memastikan akurasi sampel dan keselamatan pasien (Patient Safety).

---

## 🏥 5 Tahap Alur Pelayanan Laboratorium

1. **Pendaftaran & Penerimaan Rujukan (Resepsionis Lab)**
   - Penerimaan formulir rujukan pengantar dokter (Rawat Jalan / Poli, IGD, Rawat Inap, Dokter Luar).
   - Pengambilan nomor antrean pelayanan otomatis.
   - Perekaman data rekam medis pasien (No RM, NIK, Nama, Tgl Lahir, Jenis Kelamin).
   - Pemilihan parameter / paket uji laboratorium dan penghitungan tarif otomatis.

2. **Proses Administrasi & Penjaminan (Kasir / Loket BPJS)**
   - Verifikasi identitas pasien (KTP / kartu berobat) & pencocokan item tindakan lab.
   - Pelunasan pembayaran di kasir bagi Pasien Umum (Tunai, QRIS, Transfer, EDC).
   - Verifikasi eligibilitas penjaminan bagi pasien BPJS Kesehatan (No SEP) & Asuransi Swasta.

3. **Pengambilan Spesimen / Flebotomi (Sampling & Barcoding)**
   - Pemanggilan nomor antrean pasien ke bilik sampling flebotomi.
   - Penentuan jenis tabung/wadah secara otomatis:
     - Tabung Tutup Ungu (EDTA K3) untuk Hematologi
     - Tabung Tutup Kuning (Gel Separator) untuk Kimia Darah / Serum
     - Pot Bersih & Kering untuk Urinalisis
   - Pencetakan label barcode unik spesimen (`SMP-YYYYMMDD-XXX`) berisi identitas pasien dan jenis sampel guna mencegah sampel tertukar.
   - Pengecekan kondisi spesimen (Normal, Hemolisis, Ikterik, Lipemik) dan volume sampel.

4. **Pengolahan dan Analisis Sampel (Ruang Analitik Lab)**
   - Distribusi spesimen ke worklist instrumen otomatis medis (Sysmex, Cobas, mikroskop).
   - Input hasil parameter laboratorium oleh analis kesehatan.
   - Evaluasi nilai rujukan normal otomatis berdasarkan jenis kelamin/usia.
   - Deteksi otomatis Nilai Kritis (**Critical Value Alert**) berkedip untuk penanganan gawat darurat segera.

5. **Validasi & Otorisasi Dokter Spesialis Patologi Klinik (Sp.PK)**
   - Peninjauan hasil laboratorium secara berlapis.
   - Konfirmasi prosedur nilai kritis dan pencatatan komunikasi darurat ke dokter pengirim (DPJP).
   - Pemberian catatan ekspertise klinis, kesimpulan diagnosis, atau rekomendasi lanjutan.
   - Otorisasi digital (QR Code & Digital Signature Hash) untuk mengesahkan dokumen hasil.
   - Pencetakan Lembar Resmi Hasil Pemeriksaan Laboratorium Rumah Sakit (Formulir Standar RM. 21).

---

## 📁 Struktur Direktori Proyek

```text
D:\laboratorium\
├── run.bat                     # Script one-click untuk menjalankan sistem di Windows
├── README.md                   # Dokumentasi lengkap proyek
├── backend/                    # Server API Node.js + Express
│   ├── package.json
│   ├── .env                    # Konfigurasi PORT dan MONGODB_URI
│   └── src/
│       ├── config/
│       │   ├── db.js           # Koneksi Mongoose + Auto-seed + Fallback Memory Server
│       │   └── seedData.js     # Data awal master kategori, puluhan tes, & sampel demo
│       ├── models/             # Mongoose Schemas (Patient, Registration, Billing, Specimen, TestResult, Validation)
│       ├── routes/             # RESTful API Endpoints untuk 5 tahap alur
│       └── server.js           # Express App Server Entrypoint (Port 5000)
├── frontend/                   # Web User Interface Vue 3 + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.js          # Konfigurasi Vite & API Proxy
│   ├── tailwind.config.js      # Konfigurasi styling Tailwind CSS
│   └── src/
│       ├── components/         # Navbar, WorkflowStepper, BarcodeLabel
│       ├── views/              # DashboardView, Step 1 - 5 Views, LabReportPrintView
│       ├── services/api.js     # Client API connector
│       ├── router/index.js     # Vue Router
│       ├── App.vue
│       └── main.ts
└── database/                   # Skema & Dokumentasi Basis Data
    ├── schema-mongodb.md       # Spesifikasi struktur dokumen MongoDB & Mongoose
    ├── mongo-seed.json         # Raw JSON export data awal parameter & kategori
    └── schema.sql              # Skema SQL relasional (referensi DDL kompatibel RDBMS)
```

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan Script Otomatis (Direkomendasikan)
Cukup klik ganda (double click) file **`run.bat`** di folder `D:\laboratorium`. 
Script akan otomatis membuka dua jendela terminal untuk menjalankan Backend dan Frontend.

### Cara 2: Menjalankan Secara Manual via Terminal / PowerShell

1. **Jalankan Backend (Terminal 1)**:
   ```bash
   cd D:\laboratorium\backend
   npm start
   ```
   *Server berjalan di: `http://localhost:5000`*

2. **Jalankan Frontend (Terminal 2)**:
   ```bash
   cd D:\laboratorium\frontend
   npm run dev
   ```
   *Buka antarmuka aplikasi di browser: `http://localhost:5173`*

---

## 🗄️ Konfigurasi Database MongoDB

Konfigurasi database terdapat di file `D:\laboratorium\backend\.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/laboratorium
```

- **Jika Anda menggunakan MongoDB Lokal / MongoDB Compass / Docker**: Pastikan service MongoDB berjalan di port `27017`.
- **Jika menggunakan MongoDB Atlas (Cloud)**: Ganti nilai `MONGODB_URI` dengan connection string Atlas Anda.
- **Auto Fallback**: Jika service MongoDB belum dijalankan, backend secara cerdas memiliki fallback `mongodb-memory-server` bawaan agar aplikasi tetap dapat langsung diuji dan dijalankan tanpa kendala instalasi database awal.
