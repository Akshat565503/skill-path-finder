<template>
  <div class="glass-card glow-border overflow-hidden transition-all duration-300 hover:border-surface-600/70">
    <!-- Header with score bar -->
    <div class="p-5 pb-4">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-surface-100 truncate text-base">{{ role.title }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-surface-500">
              {{ role.knownCount }}/{{ role.totalRequired }} skills matched
            </span>
          </div>
        </div>
        <div
          class="flex-shrink-0 ml-3 px-3 py-1.5 rounded-xl text-sm font-bold"
          :class="scoreClass"
        >
          {{ role.overallScore }}%
        </div>
      </div>

      <!-- Progress bar -->
      <div class="relative h-2 rounded-full bg-surface-700/60 overflow-hidden">
        <!-- Direct match portion -->
        <div
          class="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
          :class="directBarClass"
          :style="{ width: `${role.directMatchPercent}%` }"
        />
        <!-- Overall score portion (includes nearby) -->
        <div
          class="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out opacity-40"
          :class="overallBarClass"
          :style="{ width: `${role.overallScore}%` }"
        />
      </div>
      <div class="flex items-center justify-between mt-1.5">
        <span class="text-[10px] text-surface-500">Direct: {{ role.directMatchPercent }}%</span>
        <span class="text-[10px] text-surface-500">With nearby: {{ role.overallScore }}%</span>
      </div>
    </div>

    <!-- Skills breakdown -->
    <div class="px-5 pb-4 space-y-3">
      <!-- Known skills -->
      <div v-if="role.knownSkills.length > 0">
        <span class="text-[10px] uppercase tracking-wider text-surface-500 font-medium">Known</span>
        <div class="flex flex-wrap gap-1.5 mt-1.5">
          <span
            v-for="skill in role.knownSkills"
            :key="skill"
            class="skill-badge skill-badge-known"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- Nearby skills (within 1-2 hops) -->
      <div v-if="role.nearbySkills.length > 0">
        <span class="text-[10px] uppercase tracking-wider text-surface-500 font-medium">Nearby (1-2 hops)</span>
        <div class="flex flex-wrap gap-1.5 mt-1.5">
          <span
            v-for="ns in role.nearbySkills"
            :key="ns.name"
            class="skill-badge bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {{ ns.name }}
          </span>
        </div>
      </div>

      <!-- Missing skills -->
      <div v-if="role.missingSkills.length > 0">
        <span class="text-[10px] uppercase tracking-wider text-surface-500 font-medium">Missing</span>
        <div class="flex flex-wrap gap-1.5 mt-1.5">
          <span
            v-for="skill in role.missingSkills"
            :key="skill"
            class="skill-badge skill-badge-missing"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer: companies -->
    <div
      v-if="role.hiringCompanies.length > 0"
      class="px-5 py-3 border-t border-surface-700/40 bg-surface-800/20"
    >
      <div class="flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-surface-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span class="text-xs text-surface-400 truncate">
          {{ role.hiringCompanies.join(" · ") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchedRole } from "~/composables/useApi";

const props = defineProps<{
  role: MatchedRole;
}>();

const scoreClass = computed(() => {
  const score = props.role.overallScore;
  if (score >= 70) return "bg-accent-500/20 text-accent-300";
  if (score >= 40) return "bg-yellow-500/20 text-yellow-300";
  return "bg-surface-700/60 text-surface-400";
});

const directBarClass = computed(() => {
  const score = props.role.overallScore;
  if (score >= 70) return "bg-accent-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-surface-500";
});

const overallBarClass = computed(() => {
  const score = props.role.overallScore;
  if (score >= 70) return "bg-accent-400";
  if (score >= 40) return "bg-yellow-400";
  return "bg-surface-400";
});
</script>
