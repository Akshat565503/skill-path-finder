<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Hero / Ambient Transit Map Diagram -->
    <div class="transit-card p-6 md:p-8 relative overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <!-- Hero Text -->
        <div class="lg:col-span-7 space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-transit-gold/10 border border-transit-gold/30 text-transit-gold font-mono text-xs">
            <span class="w-2 h-2 rounded-full bg-transit-gold animate-pulse"></span>
            TRANSIT GRAPH ROUTER v2.0
          </div>
          <h1 class="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-transit-text tracking-tight leading-tight">
            Navigate Your Technical Career Path.
          </h1>
          <p class="text-transit-muted text-sm sm:text-base leading-relaxed max-w-xl">
            Select the skills you know on the station picker. Our graph algorithm calculates shortest learning routes and departure-board role readiness across the network.
          </p>
        </div>

        <!-- Ambient Animated Transit Line Diagram -->
        <div class="lg:col-span-5 relative h-48 sm:h-56 bg-ink/60 rounded-xl border border-surface-border p-4 flex items-center justify-center overflow-hidden">
          <!-- Background Grid Lines -->
          <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />

          <!-- Interactive Ambient Network Canvas SVG -->
          <svg class="w-full h-full" viewBox="0 0 320 180" fill="none">
            <!-- Animated Transit Lines -->
            <path d="M 40 140 L 100 80 L 220 80 L 280 40" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round" class="transit-line-path" />
            <path d="M 40 40 L 100 80 L 160 140 L 280 140" stroke="#34D399" stroke-width="4" stroke-linecap="round" class="transit-line-path" style="animation-delay: 0.3s" />
            <path d="M 160 140 L 220 80 L 280 140" stroke="#A78BFA" stroke-width="3" stroke-dasharray="5 4" stroke-linecap="round" class="animate-dash" />

            <!-- Ambient Stations -->
            <g class="animate-pulse-subtle">
              <circle cx="40" cy="140" r="7" fill="#12141C" stroke="#5AC8FA" stroke-width="3" />
              <text x="40" y="160" text-anchor="middle" fill="#8B8FA3" font-family="IBM Plex Mono" font-size="9">HTML</text>

              <circle cx="100" cy="80" r="9" fill="#12141C" stroke="#F2B84B" stroke-width="4" />
              <text x="100" y="65" text-anchor="middle" fill="#F2B84B" font-family="IBM Plex Mono" font-size="10" font-weight="bold">JS INTERCHANGE</text>

              <circle cx="220" cy="80" r="8" fill="#12141C" stroke="#34D399" stroke-width="3" />
              <text x="220" y="65" text-anchor="middle" fill="#8B8FA3" font-family="IBM Plex Mono" font-size="9">NODE</text>

              <circle cx="280" cy="40" r="8" fill="#12141C" stroke="#A78BFA" stroke-width="3" />
              <text x="280" y="25" text-anchor="middle" fill="#8B8FA3" font-family="IBM Plex Mono" font-size="9">K8S</text>

              <circle cx="160" cy="140" r="7" fill="#12141C" stroke="#F472B6" stroke-width="3" />
              <text x="160" y="160" text-anchor="middle" fill="#8B8FA3" font-family="IBM Plex Mono" font-size="9">DATA</text>
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid: Skill Station Picker & Departure Board -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left: Station Picker -->
      <div class="lg:col-span-4 space-y-4">
        <div class="transit-card p-5 sticky top-20 flex flex-col max-h-[calc(100vh-6rem)]">
          <!-- Station Picker Header -->
          <div class="flex items-center justify-between border-b border-surface-border pb-3 shrink-0">
            <div>
              <h2 class="font-display font-bold text-lg text-transit-text tracking-tight flex items-center gap-2">
                Station Picker
                <span class="text-xs font-mono font-semibold bg-transit-gold/20 text-transit-gold px-2 py-0.5 rounded border border-transit-gold/30">
                  {{ selectedSkills.length }} Selected
                </span>
              </h2>
              <p class="font-mono text-xs text-transit-muted mt-0.5">
                Toggle stations to compute role readiness
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="selectedSkills.length > 0"
                class="btn-transit-secondary text-xs px-2.5 py-1"
                @click="selectedSkills = []"
              >
                Clear
              </button>
              <!-- Mobile collapse toggle button -->
              <button
                class="lg:hidden p-1.5 rounded-lg text-transit-muted hover:text-transit-text hover:bg-surface-hover"
                @click="mobilePickerOpen = !mobilePickerOpen"
              >
                <svg
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': !mobilePickerOpen }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- PROMINENT TOP PRIMARY CTA BUTTON -->
          <div class="py-3 shrink-0 border-b border-surface-border/60">
            <button
              class="btn-transit w-full py-3"
              :disabled="selectedSkills.length === 0 || matchLoading"
              @click="findMatchedRoles"
            >
              <TransitLoader v-if="matchLoading" inline label="Calculating Routes..." />
              <template v-else>
                <svg class="w-4 h-4 text-ink shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Query Departure Board ({{ selectedSkills.length }}) →</span>
              </template>
            </button>
          </div>

          <!-- Scrollable Station Picker Body (Collapsible on mobile) -->
          <div v-show="mobilePickerOpen || isDesktop" class="overflow-y-auto scrollbar-thin pt-3 pr-1 flex-1">
            <!-- Loading state -->
            <div v-if="loading" class="space-y-3">
              <div v-for="i in 4" :key="i" class="h-10 bg-surface-hover rounded-xl animate-pulse" />
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
              <p class="font-mono text-xs text-red-400 mb-2">{{ error }}</p>
              <button class="btn-transit text-xs" @click="loadSkills">Retry</button>
            </div>

            <!-- SkillPicker component -->
            <div v-else>
              <SkillPicker
                v-model="selectedSkills"
                :grouped-skills="skillCategories"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Departure Board Matched Roles -->
      <div class="lg:col-span-8 space-y-4">
        <!-- Departure Board Header -->
        <div class="flex items-center justify-between border-b border-surface-border pb-3 font-mono">
          <div>
            <h2 class="font-display font-bold text-xl text-transit-text tracking-tight flex items-center gap-2">
              DEPARTURE BOARD
              <span class="text-xs bg-surface-border px-2 py-0.5 rounded text-transit-gold">Role Readiness</span>
            </h2>
            <p class="text-xs text-transit-muted mt-0.5">
              Ranked by graph distance from selected stations
            </p>
          </div>
          <span v-if="matchedRoles" class="text-xs text-transit-gold font-semibold">
            {{ matchedRoles.length }} ROLES LISTED
          </span>
        </div>

        <!-- Initial Empty State -->
        <div
          v-if="selectedSkills.length === 0 && !matchedRoles"
          class="transit-card p-10 text-center font-mono space-y-3"
        >
          <div class="w-12 h-12 rounded-xl bg-transit-gold/10 border border-transit-gold/30 flex items-center justify-center mx-auto text-transit-gold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 class="font-display font-bold text-transit-text text-base">NO STATIONS SELECTED</h3>
          <p class="text-xs text-transit-muted max-w-sm mx-auto">
            Select your known skill stations from the station picker on the left, then click "Query Departure Board".
          </p>
        </div>

        <!-- Loading State -->
        <div v-else-if="matchLoading" class="py-4">
          <TransitLoader label="CALCULATING ROLE READINESS DEPARTURES..." />
        </div>

        <!-- Error State -->
        <div v-else-if="matchError" class="p-6 transit-card border-red-500/40 text-center font-mono">
          <p class="text-sm text-red-400 mb-3">{{ matchError }}</p>
          <button class="btn-transit text-xs" @click="findMatchedRoles">Retry Query</button>
        </div>

        <!-- Matched Roles Departure Rows -->
        <div v-else-if="matchedRoles" class="space-y-3">
          <TransitionGroup
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
          >
            <RoleCard
              v-for="role in matchedRoles"
              :key="role.title"
              :role="role"
            />
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchedRole, Skill } from "~/composables/useApi";

const { fetchSkills, getMatchedRoles } = useApi();

const mobilePickerOpen = ref(true);
const isDesktop = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const skillCategories = ref<Record<string, Skill[]>>({});

const selectedSkills = ref<string[]>([]);
const matchLoading = ref(false);
const matchError = ref<string | null>(null);
const matchedRoles = ref<MatchedRole[] | null>(null);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function loadSkills() {
  loading.value = true;
  error.value = null;
  try {
    const data = await fetchSkills();
    skillCategories.value = data.categories;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load skills";
  } finally {
    loading.value = false;
  }
}

async function findMatchedRoles() {
  if (selectedSkills.value.length === 0) {
    matchedRoles.value = null;
    return;
  }

  matchLoading.value = true;
  matchError.value = null;
  try {
    const data = await getMatchedRoles(selectedSkills.value);
    matchedRoles.value = data.roles;
  } catch (err) {
    matchError.value = err instanceof Error ? err.message : "Failed to calculate role routes";
  } finally {
    matchLoading.value = false;
  }
}

// Auto-trigger route query on station selection changes (debounced 400ms)
watch(selectedSkills, (newSkills) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  if (newSkills.length === 0) {
    matchedRoles.value = null;
    return;
  }

  debounceTimer = setTimeout(() => {
    findMatchedRoles();
  }, 400);
});

onMounted(() => {
  if (typeof window !== "undefined") {
    isDesktop.value = window.innerWidth >= 1024;
  }
  loadSkills();
});
</script>
