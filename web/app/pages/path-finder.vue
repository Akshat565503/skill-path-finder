<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Hero -->
    <div class="text-center mb-10 animate-fade-in">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        <span class="text-gradient">Path Finder</span>
      </h1>
      <p class="text-surface-400 max-w-xl mx-auto">
        Discover the shortest learning path between any two skills in the graph.
      </p>
    </div>

    <!-- Loading skills -->
    <div v-if="loading" class="glass-card p-6">
      <div class="skeleton h-6 w-48 mb-4" />
      <div class="flex gap-4">
        <div class="skeleton h-10 flex-1 rounded-xl" />
        <div class="skeleton h-10 flex-1 rounded-xl" />
        <div class="skeleton h-10 w-32 rounded-xl" />
      </div>
    </div>

    <!-- Error loading skills -->
    <div v-else-if="error" class="glass-card p-8 text-center">
      <div class="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 class="font-semibold text-surface-200 mb-2">Unable to load skills</h3>
      <p class="text-sm text-surface-400 mb-4">{{ error }}</p>
      <button class="btn-primary" @click="loadSkills">Try Again</button>
    </div>

    <!-- Main content -->
    <div v-else class="space-y-8">
      <!-- Skill selector -->
      <div class="glass-card p-6">
        <h2 class="section-title mb-4">Select Skills</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- From skill -->
          <div>
            <label class="block text-xs text-surface-500 mb-2 uppercase tracking-wider font-medium">From (skill you know)</label>
            <div class="relative">
              <select
                v-model="fromSkill"
                class="w-full bg-surface-800/60 border border-surface-600/50 rounded-xl px-4 py-2.5 text-sm text-surface-200 appearance-none cursor-pointer hover:border-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
              >
                <option value="" disabled>Choose a skill...</option>
                <optgroup v-for="(skills, category) in allSkills" :key="category" :label="category">
                  <option
                    v-for="skill in skills"
                    :key="skill.name"
                    :value="skill.name"
                    :disabled="skill.name === toSkill"
                  >
                    {{ skill.name }}
                  </option>
                </optgroup>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- To skill -->
          <div>
            <label class="block text-xs text-surface-500 mb-2 uppercase tracking-wider font-medium">To (target skill)</label>
            <div class="relative">
              <select
                v-model="toSkill"
                class="w-full bg-surface-800/60 border border-surface-600/50 rounded-xl px-4 py-2.5 text-sm text-surface-200 appearance-none cursor-pointer hover:border-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
              >
                <option value="" disabled>Choose a skill...</option>
                <optgroup v-for="(skills, category) in allSkills" :key="category" :label="category">
                  <option
                    v-for="skill in skills"
                    :key="skill.name"
                    :value="skill.name"
                    :disabled="skill.name === fromSkill"
                  >
                    {{ skill.name }}
                  </option>
                </optgroup>
              </select>
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Find Path button -->
          <div class="flex items-end">
            <button
              class="btn-accent w-full"
              :disabled="!fromSkill || !toSkill || pathLoading"
              @click="findPathHandler"
            >
              <svg v-if="pathLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span v-if="pathLoading">Searching...</span>
              <span v-else>Find Path</span>
            </button>
          </div>
        </div>

        <!-- Quick presets -->
        <div class="mt-4 flex flex-wrap gap-2">
          <span class="text-xs text-surface-500 py-1">Try:</span>
          <button
            v-for="preset in presets"
            :key="`${preset.from}-${preset.to}`"
            class="text-xs px-3 py-1 rounded-full bg-surface-800/60 text-surface-400 border border-surface-700/50 hover:border-surface-500 hover:text-surface-200 transition-all cursor-pointer"
            @click="fromSkill = preset.from; toSkill = preset.to; findPathHandler()"
          >
            {{ preset.from }} → {{ preset.to }}
          </button>
        </div>
      </div>

      <!-- Path result -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="pathResult && !pathLoading" class="glass-card p-6">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="section-title">Learning Path</h2>
              <p class="section-subtitle mt-0.5">
                {{ formatHops(pathResult.hops) }} hops from
                <span class="text-primary-400">{{ pathResult.from }}</span>
                to
                <span class="text-accent-400">{{ pathResult.to }}</span>
              </p>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-accent-500/20 text-accent-300 text-sm font-bold">
              {{ formatHops(pathResult.hops) }} hops
            </div>
          </div>

          <!-- Path chain visualization -->
          <PathChain
            v-if="pathResult.path.length > 0"
            :path="pathResult.path"
            :relationships="pathResult.relationships"
          />

          <!-- No path found -->
          <div v-else class="text-center py-8">
            <div class="w-12 h-12 rounded-2xl bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <p class="text-sm text-surface-400">{{ pathResult.message || "No path found between these skills." }}</p>
          </div>
        </div>
      </Transition>

      <!-- Path loading -->
      <div v-if="pathLoading" class="glass-card p-6">
        <div class="skeleton h-5 w-32 mb-4" />
        <div class="flex items-center gap-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-2">
            <div class="skeleton h-16 w-24 rounded-xl" />
            <div v-if="i < 5" class="skeleton h-1 w-8" />
          </div>
        </div>
      </div>

      <!-- Path error -->
      <div v-if="pathError" class="glass-card p-6 border-red-500/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium text-surface-200 text-sm">Path search failed</h3>
            <p class="text-xs text-surface-400">{{ pathError }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Skill, PathResponse } from "~/composables/useApi";

const { fetchSkills, findPath } = useApi();

// Skills data
const loading = ref(true);
const error = ref<string | null>(null);
const allSkills = ref<Record<string, Skill[]>>({});

// Selection
const fromSkill = ref("");
const toSkill = ref("");

// Path result
const pathLoading = ref(false);
const pathError = ref<string | null>(null);
const pathResult = ref<PathResponse | null>(null);

const presets = [
  { from: "HTML", to: "Kubernetes" },
  { from: "Python", to: "React" },
  { from: "SQL", to: "Next.js" },
  { from: "CSS", to: "Docker" },
  { from: "Machine Learning", to: "React" },
];

async function loadSkills() {
  loading.value = true;
  error.value = null;
  try {
    const data = await fetchSkills();
    allSkills.value = data.categories;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to connect to API";
  } finally {
    loading.value = false;
  }
}

async function findPathHandler() {
  if (!fromSkill.value || !toSkill.value) return;

  pathLoading.value = true;
  pathError.value = null;
  pathResult.value = null;

  try {
    const data = await findPath(fromSkill.value, toSkill.value);
    pathResult.value = data;
  } catch (err) {
    pathError.value = err instanceof Error ? err.message : "Failed to find path";
  } finally {
    pathLoading.value = false;
  }
}

function formatHops(hops: number | { low: number; high: number }): number {
  if (typeof hops === "object" && hops !== null) return hops.low;
  return hops;
}

onMounted(loadSkills);
</script>
