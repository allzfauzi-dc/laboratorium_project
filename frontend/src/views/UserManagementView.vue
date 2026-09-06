<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Header Banner -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
          🔐 Keamanan &amp; Hak Akses
        </div>
        <h1 class="text-xl font-black text-slate-900">Master Manajemen Pengguna &amp; Role Akses</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Kelola kredensial login petugas, penetapan role wewenang alur kerja, nomor SIP/NIP, serta reset password akun SIMRS LIS.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="showMatrixModal = true" 
          class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl border border-slate-300 text-xs flex items-center gap-1.5 transition"
        >
          <span>📋</span> Matriks Hak Akses
        </button>
        <button 
          @click="openCreateModal" 
          class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow text-xs flex items-center gap-1.5 transition"
        >
          <span>➕</span> Tambah Pengguna Baru
        </button>
      </div>
    </div>

    <!-- Alert Notifications -->
    <div v-if="successMsg" class="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-base">✅</span>
        <span class="font-medium">{{ successMsg }}</span>
      </div>
      <button @click="successMsg = ''" class="text-emerald-900 font-bold hover:text-emerald-700">✕</button>
    </div>

    <div v-if="errorMsg" class="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-base">⚠️</span>
        <span class="font-medium">{{ errorMsg }}</span>
      </div>
      <button @click="errorMsg = ''" class="text-rose-900 font-bold hover:text-rose-700">✕</button>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-slate-500 uppercase">Total Petugas</div>
        <div class="text-2xl font-black text-slate-900 mt-1">{{ users.length }}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">Akun terdaftar di sistem</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-emerald-600 uppercase">Akun Aktif</div>
        <div class="text-2xl font-black text-emerald-600 mt-1">{{ users.filter(u => u.isActive).length }}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">Dapat login portal LIS</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-indigo-600 uppercase">Peran / Role</div>
        <div class="text-2xl font-black text-indigo-600 mt-1">6</div>
        <div class="text-[10px] text-slate-400 mt-0.5">Struktur kewenangan kerja</div>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div class="text-[11px] font-semibold text-amber-600 uppercase">Sp.PK &amp; Analis</div>
        <div class="text-2xl font-black text-amber-600 mt-1">
          {{ users.filter(u => u.role === 'DOKTER_SPPK' || u.role === 'ANALIS').length }}
        </div>
        <div class="text-[10px] text-slate-400 mt-0.5">Petugas hasil uji &amp; validasi</div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
      <div class="flex flex-wrap items-center gap-2 flex-1">
        <!-- Role Filter -->
        <select 
          v-model="selectedRoleFilter" 
          class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-semibold outline-none focus:border-indigo-500"
        >
          <option value="ALL">Semua Role ({{ users.length }})</option>
          <option value="ADMIN">ADMIN - Administrator LIS</option>
          <option value="RESEPSIONIS">RESEPSIONIS - Loket Pendaftaran</option>
          <option value="KASIR">KASIR - Administrasi &amp; Kasir</option>
          <option value="FLEBOTOMIS">FLEBOTOMIS - Bilik Sampling</option>
          <option value="ANALIS">ANALIS - Ruang Analitik / Input Hasil</option>
          <option value="DOKTER_SPPK">DOKTER_SPPK - Dokter Sp.PK Validasi</option>
        </select>

        <!-- Status Filter -->
        <select 
          v-model="selectedStatusFilter" 
          class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-semibold outline-none focus:border-indigo-500"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">Hanya Aktif</option>
          <option value="INACTIVE">Hanya Nonaktif</option>
        </select>

        <!-- Search input -->
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Cari nama petugas, username, atau NIP/SIP..." 
          class="text-xs border border-slate-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] outline-none focus:border-indigo-500"
        />
      </div>

      <div class="text-xs text-slate-500 font-medium text-right whitespace-nowrap">
        Menampilkan <strong>{{ filteredUsers.length }}</strong> dari <strong>{{ users.length }}</strong> pengguna
      </div>
    </div>

    <!-- Table of Users -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4 w-12 text-center">#</th>
              <th class="py-3 px-4">Nama Petugas &amp; Kredensial</th>
              <th class="py-3 px-4">Role &amp; Wewenang</th>
              <th class="py-3 px-4">SIP / NIP</th>
              <th class="py-3 px-4">Hak Akses Alur</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="text-center">
              <td colspan="7" class="py-8 text-slate-400">Memuat data pengguna &amp; role...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0" class="text-center">
              <td colspan="7" class="py-8 text-slate-400">Tidak ada data pengguna ditemukan.</td>
            </tr>
            <tr 
              v-for="(user, index) in filteredUsers" 
              :key="user._id"
              class="hover:bg-slate-50 transition"
            >
              <td class="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                {{ index + 1 }}
              </td>

              <!-- Nama & Username -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm"
                    :class="getRoleColor(user.role).badge"
                  >
                    {{ getInitials(user.name) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 text-[13px] flex items-center gap-1.5">
                      {{ user.name }}
                      <span v-if="user.username === 'admin'" class="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                        SUPERADMIN
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-500 font-mono">
                      @{{ user.username }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Role & Wewenang -->
              <td class="py-3 px-4">
                <span 
                  class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                  :class="getRoleColor(user.role).tag"
                >
                  {{ getRoleTitle(user.role) }}
                </span>
                <div class="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                  {{ getRoleDescription(user.role) }}
                </div>
              </td>

              <!-- SIP / NIP -->
              <td class="py-3 px-4 font-mono text-[11px] text-slate-600">
                <span v-if="user.sipOrNip" class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {{ user.sipOrNip }}
                </span>
                <span v-else class="text-slate-400 italic">-</span>
              </td>

              <!-- Hak Akses Alur -->
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-1 max-w-[240px]">
                  <span 
                    v-for="route in getRoleRoutes(user.role)" 
                    :key="route"
                    class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-slate-200"
                  >
                    {{ routeLabel(route) }}
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="py-3 px-4 text-center">
                <span 
                  v-if="user.isActive" 
                  class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                </span>
                <span 
                  v-else 
                  class="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Nonaktif
                </span>
              </td>

              <!-- Aksi -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button 
                    @click="openEditModal(user)"
                    class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200 transition text-xs font-semibold flex items-center gap-1"
                    title="Edit Data &amp; Role"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    v-if="user.username !== 'admin'"
                    @click="confirmDeleteUser(user)"
                    class="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition text-xs font-semibold"
                    title="Hapus Akun Pengguna"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit Pengguna -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ isEditMode ? '✏️' : '➕' }}</span>
            <h3 class="font-bold text-sm">{{ isEditMode ? 'Edit Pengguna &amp; Role' : 'Tambah Pengguna Portal LIS' }}</h3>
          </div>
          <button @click="closeModal" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="saveUser" class="p-6 space-y-4">
          <!-- Nama Lengkap -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Petugas *</label>
            <input 
              v-model="formData.name" 
              type="text" 
              required 
              placeholder="Contoh: dr. Handoko, Sp.PK / Rina Analis, A.Md.AK"
              class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <!-- Username -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Username * 
              <span class="text-[10px] text-slate-400 font-normal">(Digunakan untuk login)</span>
            </label>
            <input 
              v-model="formData.username" 
              type="text" 
              required 
              :disabled="isEditMode"
              placeholder="Contoh: rina.lab"
              class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              :class="{'bg-slate-100 cursor-not-allowed': isEditMode}"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Password {{ isEditMode ? '(Kosongkan jika tidak ingin diubah)' : '*' }}
            </label>
            <input 
              v-model="formData.password" 
              type="password" 
              :required="!isEditMode"
              placeholder="Minimal 6 karakter"
              class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <!-- Role / Wewenang Selection -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Pilih Role &amp; Wewenang Kerja *</label>
            <select 
              v-model="formData.role" 
              required
              class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold bg-slate-50"
            >
              <option value="ADMIN">ADMIN - Administrator Sistem (Semua Akses)</option>
              <option value="RESEPSIONIS">RESEPSIONIS - Loket Pendaftaran &amp; Rujukan (Tahap 1)</option>
              <option value="KASIR">KASIR - Administrasi &amp; Kasir BPJS/Umum (Tahap 2)</option>
              <option value="FLEBOTOMIS">FLEBOTOMIS - Bilik Pengambilan Spesimen &amp; Barcode (Tahap 3)</option>
              <option value="ANALIS">ANALIS - Pranata Lab Medis / Form Input Hasil (Tahap 4)</option>
              <option value="DOKTER_SPPK">DOKTER_SPPK - Dokter Spesialis PK / Validasi Hasil (Tahap 5)</option>
            </select>
            
            <!-- Description of selected role -->
            <div class="mt-1.5 p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-900">
              <span class="font-bold">Izin Akses: </span>
              {{ getRoleDescription(formData.role) }}
            </div>
          </div>

          <!-- SIP / NIP -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Nomor NIP / SIP 
              <span class="text-[10px] text-slate-400 font-normal">(Surat Izin Praktik / NIP Rumah Sakit)</span>
            </label>
            <input 
              v-model="formData.sipOrNip" 
              type="text" 
              placeholder="Contoh: SIP. 446/102/DINKES/2023"
              class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <!-- Status Keaktifan (hanya pada mode edit) -->
          <div v-if="isEditMode && formData.username !== 'admin'" class="flex items-center gap-2 pt-1">
            <input 
              type="checkbox" 
              id="isActiveCheck" 
              v-model="formData.isActive"
              class="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label for="isActiveCheck" class="text-xs font-semibold text-slate-700 cursor-pointer">
              Akun Aktif (Dapat digunakan untuk login ke portal)
            </label>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
            >
              <span v-if="saving">Menyimpan...</span>
              <span v-else>{{ isEditMode ? 'Simpan Perubahan' : 'Daftarkan Akun' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Matriks Hak Akses (Role Permission Matrix Modal) -->
    <div v-if="showMatrixModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="text-lg">📋</span>
            <div>
              <h3 class="font-bold text-sm">Matriks Hak Akses Role (Role-Based Access Control)</h3>
              <p class="text-[11px] text-slate-400">Aturan isolasi halaman untuk mencegah tumpang-tindih wewenang antar petugas</p>
            </div>
          </div>
          <button @click="showMatrixModal = false" class="text-slate-400 hover:text-white text-lg font-bold">✕</button>
        </div>

        <!-- Modal Body: Table -->
        <div class="p-6 overflow-y-auto space-y-4">
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th class="py-2.5 px-3">Role Petugas</th>
                  <th class="py-2.5 px-2 text-center">Dashboard</th>
                  <th class="py-2.5 px-2 text-center">Tahap 1<br><span class="text-[8px] font-normal text-slate-400">Daftar</span></th>
                  <th class="py-2.5 px-2 text-center">Tahap 2<br><span class="text-[8px] font-normal text-slate-400">Kasir</span></th>
                  <th class="py-2.5 px-2 text-center">Tahap 3<br><span class="text-[8px] font-normal text-slate-400">Sampling</span></th>
                  <th class="py-2.5 px-2 text-center">Tahap 4<br><span class="text-[8px] font-normal text-slate-400">Hasil Lab</span></th>
                  <th class="py-2.5 px-2 text-center">Tahap 5<br><span class="text-[8px] font-normal text-slate-400">Validasi</span></th>
                  <th class="py-2.5 px-2 text-center">Cetak<br><span class="text-[8px] font-normal text-slate-400">Hasil</span></th>
                  <th class="py-2.5 px-2 text-center">Tarif<br><span class="text-[8px] font-normal text-slate-400">Master</span></th>
                  <th class="py-2.5 px-2 text-center">User<br><span class="text-[8px] font-normal text-slate-400">Master</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="hover:bg-slate-50 font-medium">
                  <td class="py-2.5 px-3 font-bold text-purple-700">👑 ADMIN</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                </tr>
                <tr class="hover:bg-slate-50 font-medium">
                  <td class="py-2.5 px-3 font-bold text-sky-700">📝 RESEPSIONIS</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                </tr>
                <tr class="hover:bg-slate-50 font-medium">
                  <td class="py-2.5 px-3 font-bold text-emerald-700">💳 KASIR</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                </tr>
                <tr class="hover:bg-slate-50 font-medium">
                  <td class="py-2.5 px-3 font-bold text-amber-700">🩸 FLEBOTOMIS</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                </tr>
                <tr class="hover:bg-slate-50 font-medium bg-teal-50/50">
                  <td class="py-2.5 px-3 font-bold text-teal-800">🔬 ANALIS</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                </tr>
                <tr class="hover:bg-slate-50 font-medium bg-rose-50/50">
                  <td class="py-2.5 px-3 font-bold text-rose-800">🩺 DOKTER_SPPK</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-emerald-600 font-bold">✅</td>
                  <td class="text-center text-slate-300">❌</td>
                  <td class="text-center text-slate-300">❌</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
            <strong>Catatan Keamanan:</strong> Pengalihan rute otomatis (Route Guard) aktif di sisi router Vue dan backend API. Jika petugas dengan role <code>ANALIS</code> mencoba mengakses URL <code>/tahap-1</code> atau <code>/pengaturan-tarif</code>, sistem secara otomatis akan memblokir dan mengarahkan kembali ke halaman alurnya.
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button 
            @click="showMatrixModal = false" 
            class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../services/api';

const users = ref([]);
const loading = ref(true);
const saving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const searchQuery = ref('');
const selectedRoleFilter = ref('ALL');
const selectedStatusFilter = ref('ALL');

const showModal = ref(false);
const isEditMode = ref(false);
const selectedUserId = ref(null);
const showMatrixModal = ref(false);

const formData = ref({
  username: '',
  name: '',
  password: '',
  role: 'ANALIS',
  sipOrNip: '',
  isActive: true
});

const ROLE_DEFINITIONS = {
  ADMIN: {
    title: 'Administrator Sistem',
    description: 'Akses penuh seluruh modul, konfigurasi tarif, dan manajemen akun.',
    routes: ['/', '/tahap-1', '/tahap-2', '/tahap-3', '/tahap-4', '/tahap-5', '/cetak-hasil', '/pengaturan-tarif', '/manajemen-pengguna']
  },
  RESEPSIONIS: {
    title: 'Resepsionis / Pendaftaran',
    description: 'Pendaftaran pasien, pencarian rekam medis, dan input rujukan dokter.',
    routes: ['/', '/tahap-1']
  },
  KASIR: {
    title: 'Kasir & Administrasi BPJS',
    description: 'Verifikasi penjaminan klaim BPJS/Asuransi dan pembayaran kasir umum.',
    routes: ['/', '/tahap-2']
  },
  FLEBOTOMIS: {
    title: 'Petugas Flebotomi / Sampling',
    description: 'Bilik sampling spesimen dan pencetakan label barcode tabung.',
    routes: ['/', '/tahap-3']
  },
  ANALIS: {
    title: 'Pranata Laboratorium Medis',
    description: 'Pengoperasian mesin analitik dan form penginputan hasil uji lab.',
    routes: ['/', '/tahap-4']
  },
  DOKTER_SPPK: {
    title: 'Dokter Spesialis Patologi Klinik',
    description: 'Evaluasi nilai kritis, validasi ekspertise klinis, dan cetak lembar hasil.',
    routes: ['/', '/tahap-5', '/cetak-hasil']
  }
};

const routeLabel = (route) => {
  const map = {
    '/': 'Dashboard',
    '/tahap-1': 'Tahap 1: Registrasi',
    '/tahap-2': 'Tahap 2: Kasir',
    '/tahap-3': 'Tahap 3: Sampling',
    '/tahap-4': 'Tahap 4: Hasil Lab',
    '/tahap-5': 'Tahap 5: Validasi Sp.PK',
    '/cetak-hasil': 'Cetak Laporan',
    '/pengaturan-tarif': 'Master Tarif',
    '/manajemen-pengguna': 'Master Akun'
  };
  return map[route] || route;
};

const getRoleTitle = (role) => ROLE_DEFINITIONS[role]?.title || role;
const getRoleDescription = (role) => ROLE_DEFINITIONS[role]?.description || '';
const getRoleRoutes = (role) => ROLE_DEFINITIONS[role]?.routes || ['/'];

const getRoleColor = (role) => {
  switch (role) {
    case 'ADMIN':
      return { badge: 'bg-purple-600', tag: 'bg-purple-100 text-purple-800' };
    case 'RESEPSIONIS':
      return { badge: 'bg-sky-600', tag: 'bg-sky-100 text-sky-800' };
    case 'KASIR':
      return { badge: 'bg-emerald-600', tag: 'bg-emerald-100 text-emerald-800' };
    case 'FLEBOTOMIS':
      return { badge: 'bg-amber-600', tag: 'bg-amber-100 text-amber-800' };
    case 'ANALIS':
      return { badge: 'bg-teal-600', tag: 'bg-teal-100 text-teal-800' };
    case 'DOKTER_SPPK':
      return { badge: 'bg-rose-600', tag: 'bg-rose-100 text-rose-800' };
    default:
      return { badge: 'bg-slate-600', tag: 'bg-slate-100 text-slate-800' };
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.replace(/^(dr\.|drg\.|Prof\.)\s*/i, '').trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const loadUsers = async () => {
  try {
    loading.value = true;
    const res = await api.getUsers();
    if (res.success) {
      users.value = res.data;
    }
  } catch (err) {
    errorMsg.value = 'Gagal memuat daftar pengguna: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    // Role filter
    if (selectedRoleFilter.value !== 'ALL' && u.role !== selectedRoleFilter.value) {
      return false;
    }
    // Status filter
    if (selectedStatusFilter.value === 'ACTIVE' && !u.isActive) return false;
    if (selectedStatusFilter.value === 'INACTIVE' && u.isActive) return false;
    // Search query
    if (searchQuery.value.trim() !== '') {
      const q = searchQuery.value.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchUsername = u.username?.toLowerCase().includes(q);
      const matchSip = u.sipOrNip?.toLowerCase().includes(q);
      return matchName || matchUsername || matchSip;
    }
    return true;
  });
});

const openCreateModal = () => {
  isEditMode.value = false;
  selectedUserId.value = null;
  formData.value = {
    username: '',
    name: '',
    password: '',
    role: 'ANALIS',
    sipOrNip: '',
    isActive: true
  };
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditMode.value = true;
  selectedUserId.value = user._id;
  formData.value = {
    username: user.username,
    name: user.name,
    password: '',
    role: user.role,
    sipOrNip: user.sipOrNip || '',
    isActive: user.isActive !== false
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {
    username: '',
    name: '',
    password: '',
    role: 'ANALIS',
    sipOrNip: '',
    isActive: true
  };
};

const saveUser = async () => {
  try {
    saving.value = true;
    successMsg.value = '';
    errorMsg.value = '';

    if (isEditMode.value) {
      const payload = {
        name: formData.value.name,
        role: formData.value.role,
        sipOrNip: formData.value.sipOrNip,
        isActive: formData.value.isActive
      };
      if (formData.value.password && formData.value.password.trim() !== '') {
        payload.password = formData.value.password;
      }
      const res = await api.updateUser(selectedUserId.value, payload);
      successMsg.value = res.message || 'Pengguna berhasil diperbarui';
    } else {
      const payload = {
        username: formData.value.username.toLowerCase().trim(),
        name: formData.value.name,
        password: formData.value.password,
        role: formData.value.role,
        sipOrNip: formData.value.sipOrNip
      };
      const res = await api.createUser(payload);
      successMsg.value = res.message || 'Pengguna baru berhasil dibuat';
    }

    closeModal();
    await loadUsers();
  } catch (err) {
    errorMsg.value = err.message || 'Terjadi kesalahan saat menyimpan data pengguna';
  } finally {
    saving.value = false;
  }
};

const confirmDeleteUser = async (user) => {
  if (confirm(`Apakah Anda yakin ingin menghapus akun "${user.name}" (@${user.username})?`)) {
    try {
      const res = await api.deleteUser(user._id);
      successMsg.value = res.message || 'Akun pengguna berhasil dihapus';
      await loadUsers();
    } catch (err) {
      errorMsg.value = 'Gagal menghapus pengguna: ' + err.message;
    }
  }
};

onMounted(() => {
  loadUsers();
});
</script>
