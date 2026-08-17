<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Hero Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-transit-gold/10 border border-transit-gold/30 text-transit-gold font-mono text-xs">
        <span>ROUTE FINDER ENGINE</span>
      </div>
      <h1 class="font-display font-extrabold text-3xl sm:text-4xl text-transit-text tracking-tight">
        Shortest Path Transit Router
      </h1>
      <p class="text-transit-muted text-sm max-w-xl mx-auto font-sans">
        Select an origin station and a destination station to compute the shortest multi-hop transit line across prerequisite tracks and interchange connections.
      </p>
    </div>

    <!-- Station Route Selection Box -->
    <div class="transit-card p-6 space-y-4">
      <h2 class="font-display font-bold text-lg text-transit-text tracking-tight flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-transit-gold"></span>
        Select Origin & Destination Stations
      </h2>

      <!-- Form Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <!-- Origin Station -->
        <div>
          <label class="block text-transit-muted uppercase tracking-wider mb-2 font-semibold">Origin Station (From)</label>
          <div class="relative">
            <select
              v-model="fromSkill"
              class="w-full bg-ink border border-surface-border rounded-xl px-4 py-2.5 text-transit-text appearance-none cursor-pointer hover:border-transit-gold/50 focus:border-transit-gold transition-all"
            >
              <option value="" disabled>Select origin station...</option>
              <optgroup v-for="(skills, category) in allSkills" :key="category" :label="`${category} Line`">
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
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-transit-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Destination Station -->
        <div>
          <label class="block text-transit-muted uppercase tracking-wider mb-2 font-semibold">Destination Station (To)</label>
          <div class="relative">
            <select
              v-model="toSkill"
              class="w-full bg-ink border border-surface-border rounded-xl px-4 py-2.5 text-transit-text appearance-none cursor-pointer hover:border-transit-gold/50 focus:border-transit-gold transition-all"
            >
              <option value="" disabled>Select target station...</option>
              <optgroup v-for="(skills, category) in allSkills" :key="category" :label="`${category} Line`">
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
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-transit-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex items-end gap-2">
          <!-- Swap Stations Button -->
          <button
            class="btn-transit-secondary p-2.5 shrink-0"
            title="Swap Origin & Destination"
            :disabled="!fromSkill && !toSkill"
            @click="const tmp = fromSkill; fromSkill = toSkill; toSkill = tmp;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          
          <button
            class="btn-transit w-full py-2.5"
            :disabled="!fromSkill || !toSkill || pathLoading"
            @click="findPathHandler"
          >
            <TransitLoader v-if="pathLoading" inline label="Calculating Route..." />
            <template v-else>
              <svg class="w-4 h-4 text-ink shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Compute Transit Route →</span>
            </template>
          </button>
        </div>
      </div>

      <!-- Quick Preset Routes -->
      <div class="pt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
        <span class="text-transit-muted font-semibold">Popular Express Routes:</span>
        <button
          v-for="preset in presets"
          :key="`${preset.from}-${preset.to}`"
          class="btn-preset"
          @click="fromSkill = preset.from; toSkill = preset.to; findPathHandler()"
        >
          <span>{{ preset.from }}</span>
          <span class="text-transit-gold">→</span>
          <span>{{ preset.to }}</span>
        </button>
      </div>
    </div>

    <!-- Shortest Path Route Results -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="pathResult && !pathLoading" class="transit-card p-6 space-y-4">
        <!-- Result Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border pb-4 font-mono">
          <div>
            <span class="text-xs text-transit-gold font-semibold uppercase tracking-wider block">Route Computed</span>
            <h2 class="font-display font-bold text-xl text-transit-text">
              {{ pathResult.from }} <span class="text-transit-gold">→</span> {{ pathResult.to }}
            </h2>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-transit-gold text-ink font-bold text-sm shadow-gold flex items-center gap-2 self-start sm:self-auto">
            <span>{{ pathResult.hops }} Hops</span>
            <span class="text-xs font-normal">({{ pathResult.path.length }} Stations)</span>
          </div>
        </div>

        <!-- Metro Transit Line Diagram -->
        <PathChain
          v-if="pathResult.path.length > 0"
          :path="pathResult.path"
          :relationships="pathResult.relationships"
        />

        <!-- No Path Found -->
        <div v-else class="text-center py-10 font-mono text-xs text-transit-muted">
          <p>{{ pathResult.message || "No transit route connects these two stations." }}</p>
        </div>
      </div>
    </Transition>

    <!-- Path Loading Loader -->
    <div v-if="pathLoading" class="py-4">
      <TransitLoader label="COMPUTING MULTI-HOP SHORTEST TRANSIT LINE..." />
    </div>

    <!-- Path Error -->
    <div v-if="pathError" class="p-6 transit-card border-red-500/40 text-center font-mono text-xs text-red-400">
      {{ pathError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Skill, PathResponse } from "~/composables/useApi";

const { fetchSkills, findPath } = useApi();

const loading = ref(true);
const error = ref<string | null>(null);
const allSkills = ref<Record<string, Skill[]>>({});

const fromSkill = ref("");
const toSkill = ref("");

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
    error.value = err instanceof Error ? err.message : "Failed to load skills";
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
    pathError.value = err instanceof Error ? err.message : "Failed to compute path";
  } finally {
    pathLoading.value = false;
  }
}

onMounted(loadSkills);
</script>
