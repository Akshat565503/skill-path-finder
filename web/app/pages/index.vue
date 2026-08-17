<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-16 animate-fade-in">
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
        <span class="text-gradient">Skill Path Finder</span>
      </h1>
      <p class="text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
        Discover the shortest learning path between skills and find which job
        roles you're closest to qualifying for.
      </p>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <!-- API Status -->
      <div class="glass-card glow-border p-6 animate-slide-up">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            :class="
              apiStatus === 'connected'
                ? 'bg-accent-500/20'
                : apiStatus === 'error'
                ? 'bg-red-500/20'
                : 'bg-surface-700'
            "
          >
            <svg
              v-if="apiStatus === 'connected'"
              class="w-5 h-5 text-accent-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else-if="apiStatus === 'error'"
              class="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <div v-else class="w-5 h-5 skeleton rounded-full" />
          </div>
          <div>
            <h3 class="font-semibold text-surface-200">API Server</h3>
            <p class="text-xs text-surface-500">Express Backend</p>
          </div>
        </div>
        <div
          class="text-sm font-mono px-3 py-2 rounded-lg"
          :class="
            apiStatus === 'connected'
              ? 'bg-accent-500/10 text-accent-300'
              : apiStatus === 'error'
              ? 'bg-red-500/10 text-red-300'
              : 'bg-surface-800 text-surface-400'
          "
        >
          {{
            apiStatus === "connected"
              ? `✓ Connected (${healthData?.latency || "—"})`
              : apiStatus === "error"
              ? "✗ Unreachable"
              : "Checking..."
          }}
        </div>
      </div>

      <!-- Database Status -->
      <div
        class="glass-card glow-border p-6 animate-slide-up"
        style="animation-delay: 0.1s"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            :class="
              dbStatus === 'connected'
                ? 'bg-accent-500/20'
                : dbStatus === 'error'
                ? 'bg-red-500/20'
                : 'bg-surface-700'
            "
          >
            <svg
              class="w-5 h-5"
              :class="
                dbStatus === 'connected'
                  ? 'text-accent-400'
                  : dbStatus === 'error'
                  ? 'text-red-400'
                  : 'text-surface-500'
              "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-surface-200">CognoDB</h3>
            <p class="text-xs text-surface-500">Graph Database</p>
          </div>
        </div>
        <div
          class="text-sm font-mono px-3 py-2 rounded-lg"
          :class="
            dbStatus === 'connected'
              ? 'bg-accent-500/10 text-accent-300'
              : dbStatus === 'error'
              ? 'bg-red-500/10 text-red-300'
              : 'bg-surface-800 text-surface-400'
          "
        >
          {{
            dbStatus === "connected"
              ? "✓ Connected"
              : dbStatus === "error"
              ? `✗ ${healthData?.message || "Unreachable"}`
              : "Checking..."
          }}
        </div>
      </div>

      <!-- Quick Stats -->
      <div
        class="glass-card glow-border-accent p-6 animate-slide-up"
        style="animation-delay: 0.2s"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-surface-200">Get Started</h3>
            <p class="text-xs text-surface-500">Select your skills</p>
          </div>
        </div>
        <NuxtLink
          v-if="dbStatus === 'connected'"
          to="/path-finder"
          class="btn-primary w-full text-center"
        >
          Open Path Finder →
        </NuxtLink>
        <div
          v-else
          class="text-sm text-surface-500 bg-surface-800 px-3 py-2 rounded-lg"
        >
          Waiting for database connection...
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="glass-card p-8 animate-slide-up" style="animation-delay: 0.3s">
      <h2 class="section-title mb-6">How it works</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="flex gap-4">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm"
          >
            1
          </div>
          <div>
            <h3 class="font-medium text-surface-200 mb-1">Select Your Skills</h3>
            <p class="text-sm text-surface-400 leading-relaxed">
              Choose the skills you already know from our curated list, grouped
              by category.
            </p>
          </div>
        </div>
        <div class="flex gap-4">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold text-sm"
          >
            2
          </div>
          <div>
            <h3 class="font-medium text-surface-200 mb-1">Find Matching Roles</h3>
            <p class="text-sm text-surface-400 leading-relaxed">
              See which roles you're closest to qualifying for, ranked by skill
              overlap.
            </p>
          </div>
        </div>
        <div class="flex gap-4">
          <div
            class="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm"
          >
            3
          </div>
          <div>
            <h3 class="font-medium text-surface-200 mb-1">Discover Paths</h3>
            <p class="text-sm text-surface-400 leading-relaxed">
              Explore the shortest learning path from any skill you know to any
              target skill.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HealthResponse {
  status: string;
  database: string;
  latency?: string;
  message?: string;
  timestamp: string;
}

const config = useRuntimeConfig();
const apiStatus = ref<"loading" | "connected" | "error">("loading");
const dbStatus = ref<"loading" | "connected" | "error">("loading");
const healthData = ref<HealthResponse | null>(null);

async function checkHealth() {
  try {
    const data = await $fetch<HealthResponse>(
      `${config.public.apiBase}/api/health`
    );
    healthData.value = data;
    apiStatus.value = "connected";
    dbStatus.value = data.database === "connected" ? "connected" : "error";
  } catch (err) {
    apiStatus.value = "error";
    dbStatus.value = "error";
    healthData.value = null;
  }
}

onMounted(() => {
  checkHealth();
});
</script>
