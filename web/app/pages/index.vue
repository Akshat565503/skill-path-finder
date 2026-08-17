<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Hero -->
    <div class="text-center mb-10 animate-fade-in">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        <span class="text-gradient">Skill Path Finder</span>
      </h1>
      <p class="text-surface-400 max-w-xl mx-auto">
        Select skills you know, then discover which roles you're closest to qualifying for.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="glass-card p-6">
        <div class="skeleton h-6 w-48 mb-4" />
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div v-for="i in 12" :key="i" class="skeleton h-8 rounded-full" />
        </div>
      </div>
    </div>

    <!-- Error state -->
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
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left: Skill Picker -->
      <div class="lg:col-span-4">
        <div class="glass-card p-5 sticky top-24">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="section-title">Your Skills</h2>
              <p class="section-subtitle mt-0.5">
                {{ selectedSkills.length }} selected
              </p>
            </div>
            <button
              v-if="selectedSkills.length > 0"
              class="text-xs text-surface-500 hover:text-surface-300 transition-colors"
              @click="selectedSkills = []"
            >
              Clear all
            </button>
          </div>

          <SkillPicker
            v-model="selectedSkills"
            :grouped-skills="skillCategories"
          />

          <!-- Find roles button -->
          <button
            class="btn-primary w-full mt-5"
            :disabled="selectedSkills.length === 0 || matchLoading"
            @click="findMatchedRoles"
          >
            <svg v-if="matchLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span v-if="matchLoading">Finding roles...</span>
            <span v-else>Find Matching Roles →</span>
          </button>
        </div>
      </div>

      <!-- Right: Matched Roles -->
      <div class="lg:col-span-8">
        <!-- Empty state: no skills selected -->
        <div
          v-if="selectedSkills.length === 0 && !matchedRoles"
          class="glass-card p-12 text-center"
        >
          <div class="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 class="font-semibold text-surface-200 text-lg mb-2">Select your skills</h3>
          <p class="text-sm text-surface-400 max-w-sm mx-auto">
            Pick the skills you already know from the panel on the left, then click "Find Matching Roles" to see which positions you're closest to.
          </p>
        </div>

        <!-- Loading matched roles -->
        <div v-else-if="matchLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="glass-card p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="skeleton h-5 w-48" />
              <div class="skeleton h-8 w-16 rounded-xl" />
            </div>
            <div class="skeleton h-2 w-full rounded-full mb-3" />
            <div class="flex gap-2">
              <div v-for="j in 4" :key="j" class="skeleton h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>

        <!-- Match error -->
        <div v-else-if="matchError" class="glass-card p-8 text-center">
          <div class="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="font-semibold text-surface-200 mb-2">Failed to find roles</h3>
          <p class="text-sm text-surface-400 mb-4">{{ matchError }}</p>
          <button class="btn-primary" @click="findMatchedRoles">Try Again</button>
        </div>

        <!-- Matched roles results -->
        <div v-else-if="matchedRoles" class="space-y-3">
          <div class="flex items-center justify-between mb-2">
            <h2 class="section-title">
              Matched Roles
              <span class="text-surface-500 font-normal text-sm ml-2">
                {{ matchedRoles.length }} roles
              </span>
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-xs text-surface-500">Based on {{ selectedSkills.length }} skills</span>
            </div>
          </div>

          <TransitionGroup
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-3"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
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

// Skills data
const loading = ref(true);
const error = ref<string | null>(null);
const skillCategories = ref<Record<string, Skill[]>>({});

// Selection state
const selectedSkills = ref<string[]>([]);

// Matched roles
const matchLoading = ref(false);
const matchError = ref<string | null>(null);
const matchedRoles = ref<MatchedRole[] | null>(null);

async function loadSkills() {
  loading.value = true;
  error.value = null;
  try {
    const data = await fetchSkills();
    skillCategories.value = data.categories;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to connect to API";
  } finally {
    loading.value = false;
  }
}

async function findMatchedRoles() {
  if (selectedSkills.value.length === 0) return;

  matchLoading.value = true;
  matchError.value = null;
  try {
    const data = await getMatchedRoles(selectedSkills.value);
    matchedRoles.value = data.roles;
  } catch (err) {
    matchError.value = err instanceof Error ? err.message : "Failed to find matching roles";
  } finally {
    matchLoading.value = false;
  }
}

onMounted(loadSkills);
</script>
