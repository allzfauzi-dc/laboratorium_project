<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header Banner -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="inline-flex items-center gap-2 bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">
          Master Data LIS
        </div>
        <h1 class="text-xl font-black text-slate-900">Pengaturan Pelayanan &amp; Tarif Laboratorium</h1>
        <p class="text-xs text-slate-500 mt-0.5">
          Kelola nama pemeriksaan, tarif/harga tindakan (Rp), rentang nilai rujukan normal, batas nilai kritis, dan jenis tabung spesimen.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="openCategoryModal" 
          class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl border border-slate-300 text-xs flex items-center gap-1.5 transition"
        >
          <span>📁</span> Kelola Kategori ({{ categories.length }})
        </button>
        <button 
          @click="openCreateModal" 
          class="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl shadow text-xs flex items-center gap-1.5 transition"
        >
          <span>➕</span> Tambah Layanan &amp; Tarif
        </button>
      </div>
    </div>

    <!-- Alert Notifications -->
    <div v-if="successMsg" class="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-lg">✅</span>
        <span>{{ successMsg }}</span>
      </div>
      <button @click="successMsg = ''" class="text-emerald-900 font-bold hover:text-emerald-700">✕</button>
    </div>

    <div v-if="errorMsg" class="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-lg">⚠️</span>
        <span>{{ errorMsg }}</span>
      </div>
      <button @click="errorMsg = ''" class="text-rose-900 font-bold hover:text-rose-700">✕</button>
    </div>

    <!-- Filter & Search Controls -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
      <div class="flex items-center gap-2 flex-1">
        <!-- Category Filter -->
        <select 
          v-model="selectedCategory" 
          @change="loadParameters"
          class="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-semibold outline-none focus:border-teal-500"
        >
          <option value="ALL">Semua Kategori ({{ parameters.length }})</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>

        <!-- Search input -->
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="loadParameters"
          placeholder="Cari nama pemeriksaan atau kode..." 
          class="text-xs border border-slate-300 rounded-lg px-3 py-2 flex-1 outline-none focus:border-teal-500"
        />
      </div>

      <div class="text-xs text-slate-500 font-medium text-right">
        Menampilkan <strong>{{ filteredParameters.length }}</strong> parameter pelayanan
      </div>
    </div>

    <!-- Table of Services & Tariffs -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <th class="py-3 px-4 w-20">Kode</th>
              <th class="py-3 px-4">Nama Pelayanan / Pemeriksaan</th>
              <th class="py-3 px-4">Kategori</th>
              <th class="py-3 px-4">Wadah / Tabung</th>
              <th class="py-3 px-4">Nilai Rujukan Pria</th>
              <th class="py-3 px-4">Nilai Rujukan Wanita</th>
              <th class="py-3 px-4 text-right">Tarif (Rp)</th>
              <th class="py-3 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="text-center">
              <td colspan="8" class="py-8 text-slate-400">Memuat data layanan &amp; tarif...</td>
            </tr>
            <tr v-else-if="filteredParameters.length === 0" class="text-center">
              <td colspan="8" class="py-8 text-slate-400">Tidak ada data pelayanan ditemukan.</td>
            </tr>
            <tr 
              v-for="param in filteredParameters" 
              :key="param._id"
              class="hover:bg-slate-50 transition"
            >
              <td class="py-3 px-4 font-mono font-bold text-teal-800">
                <span class="bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-[11px]">
                  {{ param.code }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-900 text-[13px]">{{ param.name }}</div>
                <div class="text-[11px] text-slate-500">Satuan: {{ param.unit || '-' }} | Spesimen: {{ param.specimenType }}</div>
              </td>
              <td class="py-3 px-4">
                <span class="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                  {{ param.categoryId?.name || '-' }}
                </span>
              </td>
              <td class="py-3 px-4 text-[11px] text-slate-600 font-medium">
                {{ param.containerType }}
              </td>
              <td class="py-3 px-4 text-slate-700 text-[11px] font-mono">
                {{ param.refRangeMale || '-' }}
              </td>
              <td class="py-3 px-4 text-slate-700 text-[11px] font-mono">
                {{ param.refRangeFemale || '-' }}
              </td>
              <td class="py-3 px-4 text-right">
                <span class="font-mono font-black text-sm text-teal-700 bg-teal-50/70 border border-teal-200 px-2.5 py-1 rounded-lg inline-block">
                  Rp {{ (param.price || 0).toLocaleString('id-ID') }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex justify-center items-center gap-1">
                  <button 
                    @click="openEditModal(param)"
                    class="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    title="Edit Layanan & Tarif"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    @click="handleDeleteParameter(param)"
                    class="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                    title="Hapus Layanan"
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

    <!-- MODAL 1: Tambah / Edit Parameter & Tarif -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 class="font-black text-sm text-slate-900">
            {{ isEditing ? 'Edit Layanan & Tarif Laboratorium' : 'Tambah Layanan & Tarif Baru' }}
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <form @submit.prevent="handleSaveParameter" class="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <!-- Row 1: Kategori & Kode -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Kategori Pemeriksaan <span class="text-rose-500">*</span></label>
              <select v-model="formParam.categoryId" required class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 bg-white">
                <option value="" disabled>Pilih Kategori</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Kode Tes <span class="text-rose-500">*</span></label>
              <input 
                type="text" 
                v-model="formParam.code" 
                :disabled="isEditing" 
                required 
                placeholder="Contoh: HB, GDS, SGOT" 
                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 uppercase font-mono disabled:bg-slate-100" 
              />
            </div>
          </div>

          <!-- Row 2: Nama Layanan & Tarif -->
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block font-semibold text-slate-700 mb-1">Nama Layanan / Pemeriksaan <span class="text-rose-500">*</span></label>
              <input 
                type="text" 
                v-model="formParam.name" 
                required 
                placeholder="Contoh: Hemoglobin (Hb)" 
                class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 font-semibold" 
              />
            </div>
            <div>
              <label class="block font-bold text-teal-800 mb-1">Tarif Layanan (Rp) <span class="text-rose-500">*</span></label>
              <input 
                type="number" 
                v-model="formParam.price" 
                required 
                placeholder="35000" 
                class="w-full border-2 border-teal-500 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-teal-500 font-mono font-black text-teal-900 bg-teal-50/40" 
              />
            </div>
          </div>

          <!-- Row 3: Satuan, Spesimen, Wadah -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Satuan</label>
              <input type="text" v-model="formParam.unit" placeholder="g/dL, mg/dL, /uL" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500 font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Jenis Spesimen</label>
              <input type="text" v-model="formParam.specimenType" placeholder="Darah EDTA / Serum / Urine" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Jenis Wadah / Tabung</label>
              <input type="text" v-model="formParam.containerType" placeholder="Tabung Ungu / Kuning / Pot" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-500" />
            </div>
          </div>

          <!-- Row 4: Nilai Rujukan Teks -->
          <div class="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nilai Rujukan Pria (Teks)</label>
              <input type="text" v-model="formParam.refRangeMale" placeholder="13.5 - 17.5" class="w-full border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-teal-500 font-mono bg-white" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Nilai Rujukan Wanita (Teks)</label>
              <input type="text" v-model="formParam.refRangeFemale" placeholder="12.0 - 15.5" class="w-full border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-teal-500 font-mono bg-white" />
            </div>
          </div>

          <!-- Row 5: Ambang Batas Numerik Normal & Kritis (Untuk Auto-Flagging) -->
          <div class="bg-amber-50/50 p-3 rounded-xl border border-amber-200">
            <div class="font-bold text-amber-900 mb-1">Batas Numerik untuk Auto-Flagging Sistem:</div>
            <div class="grid grid-cols-4 gap-2 text-[11px]">
              <div>
                <label class="block text-slate-600 mb-0.5">Batas Bawah Normal</label>
                <input type="number" step="any" v-model="formParam.minNormal" placeholder="e.g. 12" class="w-full border border-slate-300 rounded px-2 py-1 outline-none bg-white font-mono" />
              </div>
              <div>
                <label class="block text-slate-600 mb-0.5">Batas Atas Normal</label>
                <input type="number" step="any" v-model="formParam.maxNormal" placeholder="e.g. 17.5" class="w-full border border-slate-300 rounded px-2 py-1 outline-none bg-white font-mono" />
              </div>
              <div>
                <label class="block text-rose-700 font-bold mb-0.5">Kritis Bawah (&le;)</label>
                <input type="number" step="any" v-model="formParam.criticalLow" placeholder="e.g. 7" class="w-full border border-rose-300 rounded px-2 py-1 outline-none bg-white font-mono text-rose-700 font-bold" />
              </div>
              <div>
                <label class="block text-rose-700 font-bold mb-0.5">Kritis Atas (&ge;)</label>
                <input type="number" step="any" v-model="formParam.criticalHigh" placeholder="e.g. 20" class="w-full border border-rose-300 rounded px-2 py-1 outline-none bg-white font-mono text-rose-700 font-bold" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100">
              Batal
            </button>
            <button type="submit" :disabled="saving" class="bg-teal-600 hover:bg-teal-500 text-white font-bold px-5 py-2 rounded-xl shadow">
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: Kelola Kategori -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div class="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 class="font-black text-sm text-slate-900">Kelola Kategori Pemeriksaan Laboratorium</h2>
          <button @click="showCategoryModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
        </div>

        <div class="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <!-- Form Tambah Kategori Baru -->
          <form @submit.prevent="handleCreateCategory" class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div class="font-bold text-slate-800">Tambah Kategori Baru</div>
            <div class="grid grid-cols-2 gap-2">
              <input type="text" v-model="newCat.code" required placeholder="KODE (e.g. MIKRO)" class="border border-slate-300 rounded-lg px-2.5 py-1.5 uppercase font-mono bg-white" />
              <input type="text" v-model="newCat.name" required placeholder="Nama Kategori (e.g. Mikrobiologi)" class="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white" />
            </div>
            <input type="text" v-model="newCat.description" placeholder="Deskripsi Kategori (opsional)" class="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white" />
            <div class="flex justify-end">
              <button type="submit" class="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1 rounded-lg text-xs">
                + Tambah Kategori
              </button>
            </div>
          </form>

          <!-- List Kategori Eksisting -->
          <div class="space-y-2">
            <div class="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Daftar Kategori Aktif:</div>
            <div v-for="cat in categories" :key="cat._id" class="p-2.5 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
              <div>
                <span class="font-bold text-slate-900">{{ cat.name }}</span>
                <span class="font-mono text-[10px] text-teal-800 bg-teal-50 px-1 rounded ml-1 border border-teal-200">{{ cat.code }}</span>
                <div class="text-[10px] text-slate-500">{{ cat.description }}</div>
              </div>
              <button 
                @click="handleDeleteCategory(cat)"
                class="text-rose-600 hover:text-rose-800 font-bold text-xs p-1"
                title="Hapus Kategori"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div class="p-3 border-t border-slate-200 bg-slate-50 text-right">
          <button @click="showCategoryModal = false" class="px-4 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-700 text-xs hover:bg-slate-100">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '../services/api';

const loading = ref(false);
const saving = ref(false);
const categories = ref([]);
const parameters = ref([]);
const selectedCategory = ref('ALL');
const searchQuery = ref('');

const successMsg = ref('');
const errorMsg = ref('');

// Modal Layanan & Tarif
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const formParam = ref({
  categoryId: '',
  code: '',
  name: '',
  unit: '',
  refRangeMale: '',
  refRangeFemale: '',
  minNormal: null,
  maxNormal: null,
  criticalLow: null,
  criticalHigh: null,
  specimenType: 'Darah EDTA',
  containerType: 'Tabung Tutup Ungu (EDTA K3)',
  price: 35000
});

// Modal Kategori
const showCategoryModal = ref(false);
const newCat = ref({ code: '', name: '', description: '' });

const loadCategories = async () => {
  try {
    const res = await api.getCategories();
    categories.value = res.data;
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
};

const loadParameters = async () => {
  loading.value = true;
  try {
    const catId = selectedCategory.value === 'ALL' ? '' : selectedCategory.value;
    const res = await api.getParameters(catId, searchQuery.value);
    parameters.value = res.data;
  } catch (err) {
    console.error('Failed to load parameters:', err);
  } finally {
    loading.value = false;
  }
};

const filteredParameters = computed(() => {
  return parameters.value;
});

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formParam.value = {
    categoryId: categories.value[0]?._id || '',
    code: '',
    name: '',
    unit: '',
    refRangeMale: '',
    refRangeFemale: '',
    minNormal: null,
    maxNormal: null,
    criticalLow: null,
    criticalHigh: null,
    specimenType: 'Darah EDTA',
    containerType: 'Tabung Tutup Ungu (EDTA K3)',
    price: 35000
  };
  showModal.value = true;
};

const openEditModal = (param) => {
  isEditing.value = true;
  editingId.value = param._id;
  formParam.value = {
    categoryId: typeof param.categoryId === 'object' ? param.categoryId?._id : param.categoryId,
    code: param.code,
    name: param.name,
    unit: param.unit || '',
    refRangeMale: param.refRangeMale || '',
    refRangeFemale: param.refRangeFemale || '',
    minNormal: param.minNormal,
    maxNormal: param.maxNormal,
    criticalLow: param.criticalLow,
    criticalHigh: param.criticalHigh,
    specimenType: param.specimenType || 'Darah EDTA',
    containerType: param.containerType || 'Tabung Tutup Ungu (EDTA K3)',
    price: param.price || 0
  };
  showModal.value = true;
};

const handleSaveParameter = async () => {
  saving.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    if (isEditing.value) {
      const res = await api.updateParameter(editingId.value, formParam.value);
      successMsg.value = res.message;
    } else {
      const res = await api.createParameter(formParam.value);
      successMsg.value = res.message;
    }
    showModal.value = false;
    await loadParameters();
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan data layanan & tarif';
  } finally {
    saving.value = false;
  }
};

const handleDeleteParameter = async (param) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${param.name}" (Tarif: Rp ${param.price.toLocaleString('id-ID')})?`)) {
    return;
  }
  try {
    const res = await api.deleteParameter(param._id);
    successMsg.value = res.message;
    await loadParameters();
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menghapus layanan';
  }
};

const openCategoryModal = () => {
  newCat.value = { code: '', name: '', description: '' };
  showCategoryModal.value = true;
};

const handleCreateCategory = async () => {
  try {
    const res = await api.createCategory(newCat.value);
    successMsg.value = res.message;
    newCat.value = { code: '', name: '', description: '' };
    await loadCategories();
    await loadParameters();
  } catch (err) {
    alert(err.message || 'Gagal menambah kategori');
  }
};

const handleDeleteCategory = async (cat) => {
  if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
  try {
    const res = await api.deleteCategory(cat._id);
    successMsg.value = res.message;
    await loadCategories();
    await loadParameters();
  } catch (err) {
    alert(err.message || 'Gagal menghapus kategori');
  }
};

onMounted(async () => {
  await loadCategories();
  await loadParameters();
});
</script>
