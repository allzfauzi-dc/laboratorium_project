<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 no-print">
    <div class="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
      <span class="uppercase tracking-wider text-slate-400 font-bold">Alur Pelayanan Laboratorium Terstandar RS</span>
      <span class="text-teal-700 font-bold">Tahap Aktif: {{ currentStepName }}</span>
    </div>

    <div class="grid grid-cols-5 gap-2 relative">
      <div 
        v-for="(step, index) in steps" 
        :key="step.id"
        class="relative flex flex-col items-center text-center p-2 rounded-lg transition"
        :class="{
          'bg-teal-50 border border-teal-300 text-teal-900 font-bold shadow-sm': activeStep === step.id,
          'bg-slate-50 text-slate-400': activeStep !== step.id && step.id > activeStep,
          'bg-emerald-50 text-emerald-800': activeStep !== step.id && step.id < activeStep
        }"
      >
        <div 
          class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition"
          :class="{
            'bg-teal-600 text-white shadow ring-2 ring-teal-300': activeStep === step.id,
            'bg-slate-200 text-slate-500': activeStep !== step.id && step.id > activeStep,
            'bg-emerald-600 text-white': activeStep !== step.id && step.id < activeStep
          }"
        >
          <span v-if="step.id < activeStep">✓</span>
          <span v-else>{{ step.id }}</span>
        </div>
        <div class="text-[11px] leading-tight font-semibold line-clamp-2">
          {{ step.title }}
        </div>
        <div class="text-[10px] text-slate-400 mt-0.5">
          {{ step.subtitle }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  activeStep: {
    type: Number,
    default: 1
  }
});

const steps = [
  { id: 1, title: '1. Pendaftaran & Rujukan', subtitle: 'Resepsionis' },
  { id: 2, title: '2. Administrasi & Kasir', subtitle: 'Verifikasi / BPJS' },
  { id: 3, title: '3. Sampling / Flebotomi', subtitle: 'Barcode Spesimen' },
  { id: 4, title: '4. Pengolahan & Analisis', subtitle: 'Worklist Analis' },
  { id: 5, title: '5. Validasi dr. Sp.PK', subtitle: 'Otorisasi Resmi' },
];

const currentStepName = computed(() => {
  const s = steps.find(item => item.id === props.activeStep);
  return s ? s.title : '';
});
</script>
