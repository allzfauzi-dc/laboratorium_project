# PANDUAN LENGKAP SETUP & UPLOAD DATABASE KE CLOUD (MONGODB ATLAS)
# SISTEM INFORMASI MANAJEMEN LABORATORIUM RUMAH SAKIT (SIMRS-LAB)

Dokumen ini menjelaskan panduan langkah demi langkah cara meng-hosting database MongoDB ke Cloud (MongoDB Atlas) dan meng-upload seluruh data master (akun pengguna, tarif, kategori lab, dan parameter uji) agar aplikasi yang telah di-deploy (Frontend di Vercel & Backend di Cloud) dapat berjalan secara online 24/7.

---

## 1. ARSITEKTUR CLOUD SETELAH DEPLOYMENT

Setelah di-deploy ke internet, struktur aplikasi terbagi menjadi 3 komponen:
1. **Frontend (Vercel)**:
   - Menghasilkan antarmuka web Vue 3 (`https://simrs-lab.vercel.app`).
   - Berkomunikasi ke backend melalui environment variable `VITE_API_URL`.
2. **Backend (Render / Railway / VPS Cloud)**:
   - Server Node.js/Express yang melayani REST API (`https://simrs-backend.up.railway.app/api`).
   - Terhubung ke database cloud melalui environment variable `MONGODB_URI`.
3. **Database (MongoDB Atlas Cloud)**:
   - Database serverless di cloud dengan paket **M0 Sandbox (Gratis Selamanya, Kapasitas 512 MB)**.
   - Menyimpan seluruh data rekam medis, billing, spesimen barcode, hasil lab, dan akun login.

---

## 2. LANGKAH 1: MEMBUAT DATABASE DI MONGODB ATLAS (GRATIS)

1. Kunjungi situs resmi: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) dan lakukan registrasi akun (bisa login dengan akun Google).
2. **Buat Cluster Baru**:
   - Pilih paket **M0 (Free / Shared)**.
   - Provider: Pilih **AWS** atau **Google Cloud**.
   - Region: Pilih region terdekat, misalnya **Singapore (ap-southeast-1)** atau **Jakarta**.
   - Name: Beri nama cluster (misal: `Cluster0`), lalu klik **Create Deployment**.
3. **Buat Kredensial Database User**:
   - Masukkan **Username** (contoh: `admin_lab`).
   - Masukkan **Password** yang aman (contoh: `SimrsLab2026!`).
   - Klik **Create Database User**. *(Simpan username dan password ini)*.
4. **Konfigurasi Network Access (IP Whitelist)**:
   - Pada bagian *Where would you like to connect from?*, pilih **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Penting*: Ini wajib diaktifkan agar server cloud (Vercel / Railway / Render) dapat mengakses database tanpa terblokir firewall.
   - Klik **Finish and Close**.
5. **Salin Connection String (URI)**:
   - Pada halaman utama Dashboard Atlas, klik tombol **Connect** di samping nama cluster.
   - Pilih opsi **Drivers** (Node.js).
   - Salin connection string yang muncul. Formatnya seperti ini:
     ```text
     mongodb+srv://admin_lab:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Ganti `<password>` dengan password yang Anda buat di Langkah 3, dan tambahkan nama database `/laboratorium` sebelum tanda tanya `?`:
     ```text
     mongodb+srv://admin_lab:SimrsLab2026!@cluster0.xxxxx.mongodb.net/laboratorium?retryWrites=true&w=majority
     ```

---

## 3. LANGKAH 2: CARA MENGUPLOAD DATA KE MONGODB ATLAS

Terdapat 3 metode yang dapat Anda gunakan untuk meng-upload data awal ke MongoDB Atlas:

### METODE A: Menggunakan Script Seeder 1-Baris (Paling Cepat & Mudah) ⭐ *Direkomendasikan*
Pada backend proyek telah disediakan script khusus `npm run seed`. Anda cukup menjalankan perintah ini dari terminal komputer lokal Anda dengan menyertakan URI MongoDB Atlas Anda:

1. Buka terminal / PowerShell di laptop Anda.
2. Masuk ke folder backend:
   ```powershell
   cd D:\laboratorium\backend
   ```
3. Jalankan script seeding dengan menempelkan URI MongoDB Atlas Anda:
   ```powershell
   npm run seed -- "mongodb+srv://admin_lab:SimrsLab2026!@cluster0.xxxxx.mongodb.net/laboratorium?retryWrites=true&w=majority"
   ```
4. Sistem akan otomatis terhubung ke cloud MongoDB Atlas dan mengunggah:
   - ✅ **6 Akun Login & Role RBAC** (`admin`, `resepsionis`, `kasir`, `flebotomis`, `analis`, `doktersppk`).
   - ✅ **Master Kategori Pemeriksaan Lab** (Hematologi, Kimia Darah, Lipid, Faal Ginjal/Hati, Urinalisis, dll).
   - ✅ **Master Parameter Uji, Tarif (Rp), Rentang Normal & Batas Nilai Kritis**.
   - ✅ **Data Pasien & Registrasi Demo**.

*(Jika suatu saat Anda ingin mereset ulang seluruh data cloud dari nol, tambahkan opsi `--force`:*  
`npm run seed:force -- "mongodb+srv://admin_lab:SimrsLab2026!@cluster0.xxxxx.mongodb.net/laboratorium?retryWrites=true&w=majority"`*)*.

---

### METODE B: Otomatis oleh Server Backend Cloud (Auto-Seed saat Start)
Sistem backend SIMRS LIS telah dilengkapi fitur **Auto-Seeder** otomatis (`backend/src/config/seedData.js`).
1. Saat Anda men-deploy server backend ke layanan cloud seperti **Railway** atau **Render**:
2. Buka menu **Environment Variables** di dashboard hosting backend Anda.
3. Tambahkan variabel:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://admin_lab:SimrsLab2026!@cluster0.xxxxx.mongodb.net/laboratorium?retryWrites=true&w=majority`
4. Saat backend pertama kali dinyalakan di cloud, backend akan mendeteksi bahwa database di MongoDB Atlas masih kosong, dan backend akan **secara otomatis mengisi seluruh data master dan akun login tanpa perlu Anda upload manual**.

---

### METODE C: Menggunakan Aplikasi GUI MongoDB Compass
Jika Anda ingin melihat data secara visual melalui software desktop:
1. Unduh dan pasang [MongoDB Compass](https://www.mongodb.com/try/download/compass).
2. Buka MongoDB Compass, tempelkan URI MongoDB Atlas Anda pada kolom input, lalu klik **Connect**.
3. Di panel kiri, klik tombol **Create Database**:
   - Database Name: `laboratorium`
   - Collection Name: `testcategories`
4. Klik collection `testcategories` -> klik **Add Data** -> **Import JSON or CSV file** -> pilih file `D:\laboratorium\database\mongo-seed.json`.

---

## 4. LANGKAH 3: MENGHUBUNGKAN FRONTEND VERCEL KE BACKEND CLOUD

Setelah database MongoDB Atlas aktif dan backend Anda ter-deploy:
1. Buka dashboard Vercel Anda di [https://vercel.com](https://vercel.com).
2. Pilih project frontend laboratorium Anda.
3. Buka tab **Settings** -> **Environment Variables**.
4. Tambahkan variabel berikut:
   - **Key**: `VITE_API_URL`
   - **Value**: URL backend cloud Anda dengan akhiran `/api`  
     *(Contoh: `https://backend-simrs.up.railway.app/api` atau `https://backend-simrs.onrender.com/api`)*.
5. Klik **Save**, lalu buka tab **Deployments** dan klik **Redeploy**.
6. Sekarang aplikasi laboratorium Anda di Vercel telah terhubung penuh ke backend cloud dan database MongoDB Atlas!

---

## 5. REKAPITULASI VARIABEL LINGKUNGAN (ENVIRONMENT VARIABLES)

| Lokasi Komponen | Nama Variabel | Contoh Nilai (*Production*) | Fungsi |
|---|---|---|---|
| **Frontend (Vercel)** | `VITE_API_URL` | `https://simrs-api.up.railway.app/api` | Mengarahkan permintaan data fetch browser ke server backend cloud |
| **Backend (Railway/Render)**| `MONGODB_URI` | `mongodb+srv://admin_lab:pass@cluster0.../laboratorium` | String koneksi otentikasi ke database cloud MongoDB Atlas |
| **Backend (Railway/Render)**| `PORT` | `5000` | Port listen aplikasi web server Express |

---

*Panduan ini menjamin database laboratorium Anda aman, terisolasi, memiliki backup cloud otomatis, dan siap digunakan kapan saja dari perangkat mana pun.*
