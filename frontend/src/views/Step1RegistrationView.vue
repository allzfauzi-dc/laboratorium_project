<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <WorkflowStepper :activeStep="1" />

    <!-- Header Section -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
          Tahap 1 dari 5
        </div>
        <h1 class="text-xl font-black text-slate-900">Pendaftaran & Penerimaan Formulir Rujukan</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Penerimaan pasien rujukan dokter, verifikasi awal identitas, pencatatan indikasi klinis, dan pemilihan paket uji laboratorium.
        </p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400 block">Estimasi No Antrean Berikutnya:</span>
        <span class="text-xl font-mono font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200 inline-block">
          LAB-AUTO
        </span>
      </div>
    </div>

    <!-- Alert / Status Notification -->
    <div v-if="successMsg" class="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-lg">✅</span>
        <span>{{ successMsg }}</span>
      </div>
      <router-link to="/tahap-2" class="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-emerald-700 transition">
        Buka Tahap 2: Administrasi & Kasir →
      </router-link>
    </div>

    <div v-if="errorMsg" class="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
      <span class="text-lg">⚠️</span>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Main Registration Form -->
    <form @submit.prevent="handleSubmitRegistration" class="space-y-6">
      <!-- Section 1: Data Identitas Pasien -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h2 class="font-bold text-sm text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">1</span>
            Identitas Pasien
          </h2>

          <div class="flex items-center gap-2 text-xs">
            <label class="cursor-pointer flex items-center gap-1.5 font-semibold text-slate-600">
              <input type="radio" v-model="patientMode" value="EXISTING" class="text-teal-600 focus:ring-teal-500">
              Pilih Pasien Terdaftar
            </label>
            <label class="cursor-pointer flex items-center gap-1.5 font-semibold text-slate-600 ml-3">
              <input type="radio" v-model="patientMode" value="NEW" class="text-teal-600 focus:ring-teal-500">
              Pasien Baru
            </label>
          </div>
        </div>

        <!-- Mode Pasien Lama: Search Box -->
        <div v-if="patientMode === 'EXISTING'" class="mb-4">
          <label class="block text-xs font-semibold text-slate-600 mb-1">Cari Pasien (No RM / NIK / Nama):</label>
          <div class="relative">
            <input 
              type="text" 
              v-model="patientSearch" 
              @input="searchPatients"
              placeholder="Ketik minimal 2 karakter..." 
              class="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
            />
            <!-- Dropdown Hasil Pencarian -->
            <div v-if="searchResults.length > 0" class="absolute z-20 w-full bg-white border border-slate-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100">
              <div 
                v-for="p in searchResults" 
                :key="p._id" 
                @click="selectPatient(p)"
                class="p-2.5 text-xs hover:bg-teal-50 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span class="font-bold text-slate-900">{{ p.name }}</span>
                  <span class="text-slate-500 ml-2 font-mono">({{ p.mrNumber }})</span>
                </div>
                <div class="text-slate-500 text-[11px]">
                  {{ p.gender === 'L' ? 'L' : 'P' }} | Lahir: {{ p.birthDate }} | Gol: {{ p.bloodType }}
                </div>
              </div>
            </div>
          </div>

          <!-- Pasien Terpilih Card -->
          <div v-if="selectedPatient" class="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl flex justify-between items-center text-xs">
            <div>
              <span class="font-bold text-teal-950 text-sm">{{ selectedPatient.name }}</span>
              <span class="bg-teal-600 text-white font-mono px-2 py-0.5 rounded text-[10px] ml-2 font-bold">{{ selectedPatient.mrNumber }}</span>
              <div class="text-slate-600 mt-1">
                NIK: {{ selectedPatient.nik || '-' }} | Tgl Lahir: {{ selectedPatient.birthDate }} | Jenis Kelamin: {{ selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan' }} | Telp: {{ selectedPatient.phone || '-' }}
              </div>
            </div>
            <button type="button" @click="selectedPatient = null" class="text-rose-600 hover:text-rose-800 font-bold text-xs">
              Ganti Pasien ✕
            </button>
          </div>
        </div>

        <!-- Mode Pasien Baru: Form Input -->
        <div v-if="patientMode === 'NEW'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nama Lengkap Pasien <span class="text-rose-500">*</span></label>
            <input type="text" v-model="newPatient.name" required placeholder="Contoh: Rian Pratama" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
            <input type="text" v-model="newPatient.nik" maxlength="16" placeholder="16 digit NIK KTP" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tanggal Lahir <span class="text-rose-500">*</span></label>
            <input type="date" v-model="newPatient.birthDate" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Jenis Kelamin <span class="text-rose-500">*</span></label>
            <select v-model="newPatient.gender" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 bg-white">
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">No. Handphone / WhatsApp</label>
            <input type="text" v-model="newPatient.phone" placeholder="08xxxxxxxxxx" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Golongan Darah</label>
            <select v-model="newPatient.bloodType" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 bg-white">
              <option value="-">Belum Diketahui (-)</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O+">O+</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <label class="block font-semibold text-slate-700 mb-1">Alamat Domisili</label>
            <input type="text" v-model="newPatient.address" placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>
        </div>
      </div>

      <!-- Section 2: Data Rujukan Dokter & Penjamin -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 class="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">2</span>
          Data Pengantar Rujukan & Penjaminan
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Asal Rujukan Pasien <span class="text-rose-500">*</span></label>
            <select v-model="form.referralSource" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 bg-white">
              <option value="Poli Penyakit Dalam">Poli Penyakit Dalam (Rawat Jalan)</option>
              <option value="Poli Anak">Poli Anak (Rawat Jalan)</option>
              <option value="Poli Bedah">Poli Bedah (Rawat Jalan)</option>
              <option value="Poli Kebidanan & Kandungan">Poli Kebidanan & Kandungan (Obgyn)</option>
              <option value="IGD (Gawat Darurat)">Instalasi Gawat Darurat (IGD)</option>
              <option value="Rawat Inap Ruang Melati">Rawat Inap Ruang Melati</option>
              <option value="Rawat Inap Ruang Mawar">Rawat Inap Ruang Mawar</option>
              <option value="ICU / HCU">ICU / Intensive Care Unit</option>
              <option value="Rujukan Faskes Luar / Dokter Luar">Rujukan Faskes Luar / Mandiri</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Dokter Pengirim <span class="text-rose-500">*</span></label>
            <input type="text" v-model="form.referringDoctor" required placeholder="Contoh: dr. Hendra Sp.PD" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Status Penjaminan <span class="text-rose-500">*</span></label>
            <select v-model="form.patientType" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 bg-white font-bold">
              <option value="UMUM">UMUM (Bayar Mandiri / Kasir)</option>
              <option value="BPJS">BPJS Kesehatan (JKN-KIS)</option>
              <option value="ASURANSI">Asuransi Swasta / Perusahaan</option>
            </select>
          </div>

          <div v-if="form.patientType !== 'UMUM'" class="sm:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">
              Nomor Kartu / Polis / No. SEP <span class="text-rose-500">*</span>
            </label>
            <input type="text" v-model="form.guarantorCardNo" placeholder="Contoh: 0001234567890 / SEP-2026-..." class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>

          <div class="sm:col-span-3">
            <label class="block font-semibold text-slate-700 mb-1">Indikasi Klinis / Diagnosa Awal Rujukan</label>
            <input type="text" v-model="form.clinicalDiagnosis" placeholder="Contoh: Febris h-4 e.c susp. Infeksi Bakterial / Tifoid" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
          </div>
        </div>
      </div>

      <!-- Section 3: Pilihan Pemeriksaan Laboratorium -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div>
            <h2 class="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">3</span>
              Daftar Permintaan Uji Laboratorium
            </h2>
            <p class="text-[11px] text-slate-500 mt-0.5">Centang parameter yang diminta pada formulir rujukan dokter</p>
          </div>

          <div class="text-right">
            <span class="text-xs text-slate-500">Total Tarif Estimasi:</span>
            <span class="text-base font-black text-teal-700 ml-2 font-mono">Rp {{ totalEstimatedPrice.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <!-- Category Tabs or Grouped Checkboxes -->
        <div class="space-y-6">
          <div v-for="cat in categories" :key="cat._id" class="border border-slate-100 rounded-xl p-4 bg-slate-50">
            <div class="font-bold text-xs text-slate-800 uppercase tracking-wide mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
              <span>{{ cat.name }}</span>
              <span class="text-[10px] text-slate-500 font-normal">{{ cat.description }}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <label 
                v-for="param in getParamsByCategory(cat._id)" 
                :key="param._id"
                class="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-slate-200 hover:border-teal-400 cursor-pointer transition select-none text-xs"
                :class="{'border-teal-500 bg-teal-50/50 ring-1 ring-teal-400': selectedParams.includes(param._id)}"
              >
                <input 
                  type="checkbox" 
                  :value="param._id" 
                  v-model="selectedParams"
                  class="mt-0.5 text-teal-600 rounded focus:ring-teal-500"
                />
                <div class="flex-1">
                  <div class="font-semibold text-slate-900 leading-tight">{{ param.name }}</div>
                  <div class="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                    <span>{{ param.specimenType }}</span>
                    <span class="font-mono font-bold text-teal-700">Rp {{ param.price.toLocaleString('id-ID') }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-end gap-3 pt-2">
        <router-link to="/" class="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100 transition">
          Batal
        </router-link>
        <button 
          type="submit" 
          :disabled="submitting || selectedParams.length === 0"
          class="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 transition"
        >
          <span v-if="submitting">Menyimpan...</span>
          <span v-else>Simpan Pendaftaran & Lanjut ke Administrasi →</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import WorkflowStepper from '../components/WorkflowStepper.vue';

const router = useRouter();

const categories = ref([]);
const parameters = ref([]);
const selectedParams = ref([]);

const patientMode = ref('EXISTING');
const patientSearch = ref('');
const searchResults = ref([]);
const selectedPatient = ref(null);

const newPatient = ref({
  name: '',
  nik: '',
  birthDate: '',
  gender: 'L',
  address: '',
  phone: '',
  bloodType: '-'
});

const form = ref({
  referralSource: 'Poli Penyakit Dalam',
  referringDoctor: 'dr. Hendra Sp.PD',
  patientType: 'UMUM',
  guarantorCardNo: '',
  clinicalDiagnosis: ''
});

const submitting = ref(false);
const successMsg = ref('');
const errorMsg = ref('');

const loadMasterData = async () => {
  try {
    const [catRes, paramRes] = await Promise.all([
      api.getCategories(),
      api.getParameters()
    ]);
    categories.value = catRes.data;
    parameters.value = paramRes.data;
  } catch (err) {
    console.error('Failed to load master tests:', err);
  }
};

const getParamsByCategory = (catId) => {
  return parameters.value.filter(p => {
    const pCatId = typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId;
    return pCatId === catId;
  });
};

const totalEstimatedPrice = computed(() => {
  return selectedParams.value.reduce((sum, id) => {
    const p = parameters.value.find(item => item._id === id);
    return sum + (p ? p.price : 0);
  }, 0);
});

const searchPatients = async () => {
  if (patientSearch.value.trim().length < 2) {
    searchResults.value = [];
    return;
  }
  try {
    const res = await api.getPatients(patientSearch.value);
    searchResults.value = res.data;
  } catch (err) {
    console.error('Patient search error:', err);
  }
};

const selectPatient = (patient) => {
  selectedPatient.value = patient;
  searchResults.value = [];
  patientSearch.value = '';
};

const handleSubmitRegistration = async () => {
  errorMsg.value = '';
  successMsg.value = '';

  if (patientMode.value === 'EXISTING' && !selectedPatient.value) {
    errorMsg.value = 'Silakan pilih pasien terdaftar atau ganti ke tab Pasien Baru';
    return;
  }

  if (selectedParams.value.length === 0) {
    errorMsg.value = 'Pilih minimal satu pemeriksaan laboratorium';
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      patientId: patientMode.value === 'EXISTING' ? selectedPatient.value?._id : undefined,
      newPatient: patientMode.value === 'NEW' ? newPatient.value : undefined,
      patientType: form.value.patientType,
      guarantorCardNo: form.value.guarantorCardNo,
      referralSource: form.value.referralSource,
      referringDoctor: form.value.referringDoctor,
      clinicalDiagnosis: form.value.clinicalDiagnosis,
      parameterIds: selectedParams.value
    };

    const res = await api.createRegistration(payload);
    successMsg.value = `Pendaftaran ${res.data.regNumber} (Antrean: ${res.data.queueNumber}) berhasil disimpan!`;
    
    // Auto redirect after 1.5s
    setTimeout(() => {
      router.push('/tahap-2');
    }, 1500);
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan pendaftaran';
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadMasterData();
});
</script>
