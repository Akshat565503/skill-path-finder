<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Hero Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-transit-gold/10 border border-transit-gold/30 text-transit-gold font-mono text-xs">
        <span>TOPOLOGY EXPLORER</span>
      </div>
      <h1 class="font-display font-extrabold text-3xl sm:text-4xl text-transit-text tracking-tight">
        Transit Network Map
      </h1>
      <p class="text-transit-muted text-sm max-w-xl mx-auto font-sans">
        Full interactive graph visualization of all skill lines, role terminals, company hubs, and inter-station tracks in CognoDB.
      </p>
    </div>

    <!-- Graph Container -->
    <ClientOnly>
      <GraphView />
      <template #fallback>
        <div class="h-[650px] rounded-2xl transit-card flex items-center justify-center font-mono text-xs text-transit-muted">
          <span>Loading Transit Network Map...</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import GraphView from "~/components/GraphView.vue";
</script>
