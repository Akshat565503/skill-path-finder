<template>
  <div class="min-h-screen flex flex-col bg-surface-950 text-surface-100" style="background-color: #020617; color: #f1f5f9;">
    <!-- Navigation -->
    <header
      class="sticky top-0 z-50 border-b border-surface-700/50 bg-surface-950/80 backdrop-blur-xl"
    >
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow transition-shadow group-hover:shadow-glow-accent"
            >
              <svg
                class="w-5 h-5 text-white"
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
            <span class="text-lg font-bold text-gradient">Skill Path Finder</span>
          </NuxtLink>

          <!-- Nav Links -->
          <div class="hidden sm:flex items-center gap-1">
            <NuxtLink
              to="/"
              class="nav-link"
              active-class="nav-link-active"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/path-finder"
              class="nav-link"
              active-class="nav-link-active"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Path Finder
            </NuxtLink>
            <NuxtLink
              to="/graph"
              class="nav-link"
              active-class="nav-link-active"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              Graph View
            </NuxtLink>
          </div>

          <!-- Mobile Menu Button -->
          <button
            class="sm:hidden p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="mobileMenuOpen"
            class="sm:hidden pb-4 flex flex-col gap-1"
          >
            <NuxtLink
              to="/"
              class="nav-link"
              active-class="nav-link-active"
              @click="mobileMenuOpen = false"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/path-finder"
              class="nav-link"
              active-class="nav-link-active"
              @click="mobileMenuOpen = false"
            >
              Path Finder
            </NuxtLink>
            <NuxtLink
              to="/graph"
              class="nav-link"
              active-class="nav-link-active"
              @click="mobileMenuOpen = false"
            >
              Graph View
            </NuxtLink>
          </div>
        </Transition>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t border-surface-800/50 py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm text-surface-500">
          Skill Path Finder — Powered by CognoDB Graph Database
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false);
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
         text-surface-400 hover:text-surface-100 hover:bg-surface-800/60
         transition-all duration-200;
}

.nav-link-active {
  @apply text-primary-400 bg-primary-500/10;
}
</style>
