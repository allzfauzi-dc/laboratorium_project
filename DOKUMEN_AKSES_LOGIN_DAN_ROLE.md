# DOKUMEN HAK AKSES LOGIN & ROLE-BASED ACCESS CONTROL (RBAC)
# SISTEM INFORMASI MANAJEMEN LABORATORIUM RUMAH SAKIT (SIMRS-LAB / LIS)
**RSUD Lubuk Sikaping - Instalasi Laboratorium Patologi Klinik**

---

## 1. PENDAHULUAN
Sistem Informasi Laboratorium Rumah Sakit (LIS) ini telah dilengkapi dengan sistem keamanan **Role-Based Access Control (RBAC)** dan autentikasi login terstandar. Setiap petugas laboratorium memiliki akun dengan wewenang khusus sesuai tugas pokok dan fungsinya (Tupoksi) untuk memastikan keamanan rekam medis, integritas data diagnostik, dan pencegahan manipulasi data.

Contoh implementasi pembatasan:
> **Petugas Analis Medis (Bagian Input Hasil)** hanya memiliki izin untuk membuka dan menginput data pada **Tahap 4: Ruang Analitik & Input Hasil**. Analis **dilarang/diblokir** membuka formulir pendaftaran (Tahap 1), kasir (Tahap 2), bilik flebotomi (Tahap 3), otorisasi dokter (Tahap 5), maupun pengaturan tarif.

---

## 2. DAFTAR AKUN PENGGUNA & KREDENSIAL LOGIN BAWAAN

Berikut adalah kredensial akun bawaan (*default accounts*) yang langsung aktif dan siap digunakan untuk pengujian masing-masing peran:

| No | Peran / Role | Username | Password | Nama Petugas | Modul yang BISA Diakses | Modul yang DIBLOKIR / DILARANG |
|---|---|---|---|---|---|---|
| **1** | **ANALIS**<br>*(Bagian Input Hasil)* | `analis` | `analis123` | **Fitriani, S.Tr.Kes**<br>*(Pranata Lab Medis)* | &bull; Dashboard<br>&bull; **Tahap 4: Ruang Analitik &amp; Form Input Hasil Mesin** | &times; Tahap 1: Pendaftaran<br>&times; Tahap 2: Kasir / BPJS<br>&times; Tahap 3: Bilik Sampling<br>&times; Tahap 5: Validasi Sp.PK<br>&times; Pengaturan Tarif Lab |
| **2** | **DOKTER_SPPK**<br>*(Penanggung Jawab)* | `doktersppk` | `sppk123` | **dr. Bambang Irawan, Sp.PK**<br>*(Dokter Spesialis Patologi Klinik)* | &bull; Dashboard<br>&bull; **Tahap 5: Ruang Validasi &amp; Otorisasi Sp.PK**<br>&bull; **Cetak Dokumen Hasil Resmi (RM. 21)** | &times; Tahap 1: Pendaftaran<br>&times; Tahap 2: Kasir / BPJS<br>&times; Tahap 3: Bilik Sampling<br>&times; Pengaturan Tarif Lab |
| **3** | **FLEBOTOMIS**<br>*(Bilik Sampling)* | `flebotomis` | `sampling123` | **Ns. Rahmat Hidayat, A.Md.AK**<br>*(Petugas Flebotomi)* | &bull; Dashboard<br>&bull; **Tahap 3: Bilik Sampling Flebotomi &amp; Barcoding** | &times; Tahap 1: Pendaftaran<br>&times; Tahap 2: Kasir / BPJS<br>&times; Tahap 4: Input Hasil<br>&times; Tahap 5: Validasi Sp.PK<br>&times; Pengaturan Tarif Lab |
| **4** | **KASIR**<br>*(Administrasi / BPJS)* | `kasir` | `kasir123` | **Budi Santoso**<br>*(Petugas Kasir &amp; Verifikator)* | &bull; Dashboard<br>&bull; **Tahap 2: Loket Administrasi &amp; Kasir Penjaminan** | &times; Tahap 1: Pendaftaran<br>&times; Tahap 3: Bilik Sampling<br>&times; Tahap 4: Input Hasil<br>&times; Tahap 5: Validasi Sp.PK<br>&times; Pengaturan Tarif Lab |
| **5** | **RESEPSIONIS**<br>*(Pendaftaran)* | `resepsionis` | `pendaftaran123` | **Siti Rahma, A.Md**<br>*(Petugas Pendaftaran)* | &bull; Dashboard<br>&bull; **Tahap 1: Pendaftaran Pasien &amp; Formulir Rujukan** | &times; Tahap 2: Kasir / BPJS<br>&times; Tahap 3: Bilik Sampling<br>&times; Tahap 4: Input Hasil<br>&times; Tahap 5: Validasi Sp.PK<br>&times; Pengaturan Tarif Lab |
| **6** | **ADMIN**<br>*(Super Admin)* | `admin` | `admin123` | **dr. H. Kurniawan, Sp.PK, M.Kes**<br>*(Kepala Instalasi Lab)* | &bull; **Semua Tahapan (1 s/d 5)**<br>&bull; **Cetak Lembar Resmi RM. 21**<br>&bull; **⚙️ Pengaturan Tarif &amp; Layanan Lab** | *Tidak ada batasan (Akses Penuh)* |

---

## 3. MATRIKS HAK AKSES PERAN (PERMISSION MATRIX)

| Modul / Halaman Aplikasi | Path URL | RESEPSIONIS | KASIR | FLEBOTOMIS | ANALIS | DOKTER_SPPK | ADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard Monitoring** | `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tahap 1: Pendaftaran &amp; Rujukan** | `/tahap-1` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Tahap 2: Administrasi &amp; Kasir** | `/tahap-2` | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Tahap 3: Bilik Flebotomi &amp; Barcode** | `/tahap-3` | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Tahap 4: Ruang Analitik (Input Hasil)**| `/tahap-4` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Tahap 5: Validasi &amp; Otorisasi Sp.PK**| `/tahap-5` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Cetak Lembar Hasil Lab (RM. 21)** | `/cetak-hasil/:id` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Pengaturan Tarif &amp; Layanan Lab** | `/pengaturan-tarif`| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Master Manajemen Pengguna &amp; Role**| `/manajemen-pengguna`| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*Keterangan: ✅ = Memiliki Hak Akses &amp; Menu Tampil, ❌ = Akses Dilarang &amp; Menu Disembunyikan.*

---

## 4. MEKANISME PENGAMANAN PADA APLIKASI

Sistem menerapkan proteksi berlapis ganda (*Two-Tier Protection*):

### 1. Filtrasi Tampilan Navigasi (*UI-Level Security*)
Pada bilah navigasi atas (`Navbar.vue`), menu yang ditampilkan disesuaikan secara otomatis dengan role pengguna yang sedang login. 
- Jika pengguna login sebagai **`analis`**, menu Pendaftaran, Kasir, Sampling, Validasi Sp.PK, dan Pengaturan Tarif **otomatis disembunyikan**. Yang tampil hanyalah menu **Dashboard** dan **4. Ruang Analitik (Input Hasil)**.

### 2. Guard Rute Navigasi (*Router Navigation Guard*)
Jika pengguna yang tidak berwenang mencoba membuka URL secara manual melalui address bar browser (misalnya akun `analis` mengetik `http://localhost:5173/pengaturan-tarif` atau `/tahap-1`):
1. Router guard Vue Router (`router.beforeEach`) mencegat permintaan tersebut.
2. Muncul kotak dialog peringatan:  
   *`⚠️ Akses Dibatasi: Akun Anda (Pranata Laboratorium Medis) hanya memiliki izin akses untuk alurnya sendiri. Anda dialihkan ke halaman yang diizinkan.`*
3. Pengguna secara otomatis ditolak dan dialihkan kembali ke halaman tugasnya (misal `/tahap-4`).

---

## 5. FITUR AKSES CEPAT (QUICK DEMO SWITCHER) PADA HALAMAN LOGIN

Untuk mempermudah pengujian alur dan demonstrasi sistem, pada halaman login (`http://localhost:5173/login`) telah disediakan tombol **"Akses Cepat Akun Demo Sesuai Role"**:

1. Cukup klik tombol:
   - 🔬 **Analis Medis**: Langsung login sebagai `analis` dan diarahkan ke Ruang Analitik (Tahap 4).
   - 🩺 **Dokter Sp.PK**: Langsung login sebagai `doktersppk` dan diarahkan ke Ruang Validasi (Tahap 5).
   - 🩸 **Flebotomis**: Langsung login sebagai `flebotomis` dan diarahkan ke Bilik Sampling (Tahap 3).
   - 💰 **Kasir & BPJS**: Langsung login sebagai `kasir` dan diarahkan ke Loket Administrasi (Tahap 2).
   - 📋 **Resepsionis**: Langsung login sebagai `resepsionis` dan diarahkan ke Pendaftaran (Tahap 1).
   - 👑 **Administrator**: Langsung login sebagai `admin` dengan hak akses penuh ke seluruh alur dan tarif.
2. Setelah selesai menguji, klik tombol merah **`🚪 Keluar`** di pojok kanan atas navbar untuk kembali ke halaman login.

---

## 6. MODUL MASTER MANAJEMEN PENGGUNA & ROLE AKSES (ADMINISTRATOR)

Untuk mengelola akun login petugas baru, memperbarui peran, mereset kata sandi, maupun menonaktifkan petugas yang mutasi atau berhenti, Administrator Sistem memiliki akses ke halaman **`Master Manajemen Pengguna & Role`** di URL `/manajemen-pengguna`:

### 6.1 Fitur Utama Modul Manajemen Pengguna:
1. **Pendaftaran Pengguna Baru (Create User)**:
   - Form input: Nama Lengkap Petugas, Username unik, Password awal, Pilihan Role/Wewenang, dan Nomor SIP / NIP.
   - Pilihan Role interaktif: `ADMIN`, `RESEPSIONIS`, `KASIR`, `FLEBOTOMIS`, `ANALIS`, atau `DOKTER_SPPK`.
2. **Pembaruan Data & Pengalihan Role (Update User)**:
   - Mengubah nama petugas, memindahkan role petugas ke alur lain jika terdapat rotasi tugas.
   - Mengubah nomor SIP/NIP.
3. **Reset Password Mandiri**:
   - Administrator dapat mereset kata sandi petugas jika petugas lupa kata sandi tanpa perlu menghapus akun.
4. **Aktivasi & Deaktivasi Akun (Soft Lock)**:
   - Administrator dapat menonaktifkan akun petugas (misal sedang cuti atau mutasi) tanpa menghapus data riwayat transaksi/audit trail yang pernah dikerjakan petugas tersebut.
5. **Penghapusan Akun (Delete User)**:
   - Menghapus akun petugas yang tidak lagi aktif dengan proteksi keamanan (akun Superadmin bawaan dilindungi dari penghapusan tidak sengaja).
6. **Modal Interaktif Matriks Hak Akses**:
   - Tombol **"📋 Matriks Hak Akses"** di sudut kanan atas untuk melihat tabel komparasi hak akses semua role secara visual langsung di aplikasi.

### 6.2 Spesifikasi API Backend Manajemen Pengguna (`/api/auth`):
- `POST /api/auth/login` : Autentikasi kredensial login dan penerbitan sesi peran
- `GET /api/auth/roles` : Mengambil kamus wewenang dan batasan alur per role
- `GET /api/auth/users` : Mendapatkan seluruh daftar akun petugas laboratorium
- `POST /api/auth/users` : Mendaftarkan akun petugas baru (Admin Only)
- `PUT /api/auth/users/:id` : Memperbarui identitas, role wewenang, status aktif, atau reset password (Admin Only)
- `DELETE /api/auth/users/:id` : Menghapus akun pengguna (Admin Only)

