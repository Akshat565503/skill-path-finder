<template>
  <!-- Inline Button Loader -->
  <div v-if="inline" class="inline-flex items-center gap-2 font-mono text-xs">
    <svg class="w-4 h-4 animate-spin text-ink shrink-0" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <span>{{ label || "Processing..." }}</span>
  </div>

  <!-- Full Section Transit Route Loader -->
  <div v-else class="transit-card p-8 flex flex-col items-center justify-center text-center font-mono space-y-4">
    <!-- Animated Metro Line Track Loader -->
    <div class="relative w-48 h-10 flex items-center justify-between">
      <!-- Background Line -->
      <div class="absolute inset-x-0 h-1 bg-surface-border rounded-full" />
      <!-- Animated Line Fill -->
      <div class="absolute left-0 h-1 bg-transit-gold rounded-full animate-pulse-subtle transition-all duration-300 w-full" />

      <!-- Animated Station Dots -->
      <span class="relative w-4 h-4 rounded-full bg-ink border-2 border-transit-gold animate-bounce z-10" style="animation-delay: 0s"></span>
      <span class="relative w-4 h-4 rounded-full bg-ink border-2 border-[#5AC8FA] animate-bounce z-10" style="animation-delay: 0.15s"></span>
      <span class="relative w-4 h-4 rounded-full bg-ink border-2 border-[#34D399] animate-bounce z-10" style="animation-delay: 0.3s"></span>
      <span class="relative w-4 h-4 rounded-full bg-ink border-2 border-[#A78BFA] animate-bounce z-10" style="animation-delay: 0.45s"></span>
    </div>

    <!-- Departure Board Text -->
    <div class="space-y-1">
      <div class="text-xs font-bold text-transit-gold uppercase tracking-wider animate-pulse">
        {{ label || "CALCULATING GRAPH TRAJECTORY..." }}
      </div>
      <p class="text-[11px] text-transit-muted">
        Querying CognoDB bolt connection across skill tracks
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  inline?: boolean;
  label?: string;
}>();
</script>
