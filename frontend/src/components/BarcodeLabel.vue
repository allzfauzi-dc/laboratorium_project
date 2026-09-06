<template>
  <div class="border-2 border-dashed border-slate-300 rounded-lg p-3 bg-white max-w-xs shadow-sm font-mono text-[11px] text-slate-800">
    <div class="border-b border-black pb-1 mb-1 flex justify-between items-center text-[10px] font-sans font-bold">
      <span>RSUD LUBUK SIKAPING</span>
      <span class="bg-slate-900 text-white px-1 rounded text-[9px]">LAB SPECIMEN</span>
    </div>

    <!-- Patient Info -->
    <div class="font-sans leading-tight mb-1">
      <div class="font-bold text-xs truncate">{{ patientName || 'Nama Pasien' }}</div>
      <div class="flex justify-between text-[10px] text-slate-600 font-semibold">
        <span>RM: {{ mrNumber || '-' }}</span>
        <span>{{ gender || '-' }} / {{ birthDate || '-' }}</span>
      </div>
    </div>

    <!-- Visual Barcode (Simulated Code128) -->
    <div class="my-1.5 flex flex-col items-center bg-white py-1">
      <div class="flex items-center h-9 justify-center gap-0.5 overflow-hidden w-full px-2">
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[3px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[4px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[3px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[4px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[3px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[3px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[4px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[3px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[2px] h-full bg-black"></span>
        <span class="w-[1px] h-full bg-black"></span>
        <span class="w-[3px] h-full bg-black"></span>
      </div>
      <div class="text-[10px] font-bold tracking-widest mt-0.5">{{ barcode || 'SMP-00000000-000' }}</div>
    </div>

    <!-- Specimen Details -->
    <div class="border-t border-slate-200 pt-1 text-[10px] font-sans text-slate-600 flex justify-between items-center">
      <span class="font-semibold text-slate-800">{{ containerType || 'Tabung Spesimen' }}</span>
      <span>{{ samplingTime || 'Waktu Sampling' }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  patientName: String,
  mrNumber: String,
  gender: String,
  birthDate: String,
  barcode: String,
  containerType: String,
  samplingTime: String
});
</script>
