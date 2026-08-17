<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Hero -->
    <div class="text-center mb-8 animate-fade-in">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        <span class="text-gradient">Graph Explorer</span>
      </h1>
      <p class="text-surface-400 max-w-xl mx-auto">
        Interactive visualization of all Skills, Roles, Companies, and relationships in CognoDB.
      </p>
    </div>

    <!-- Graph Container -->
    <ClientOnly>
      <GraphView />
      <template #fallback>
        <div class="h-[650px] rounded-2xl glass-card flex items-center justify-center">
          <div class="skeleton h-10 w-48 rounded-xl" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import GraphView from "~/components/GraphView.vue";
</script>
