<template>
  <div class="min-h-screen flex flex-col bg-ink text-transit-text selection:bg-transit-gold/30">
    <!-- Header / Transit Control Nav -->
    <header class="sticky top-0 z-50 border-b border-surface-border bg-ink/90 backdrop-blur-md">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo / Station Sign -->
          <NuxtLink to="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-lg bg-transit-gold/20 border border-transit-gold/40 flex items-center justify-center text-transit-gold shadow-gold group-hover:scale-105 transition-transform shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 4 17 L 10 7 L 20 7" stroke="#F2B84B" />
                <circle cx="4" cy="17" r="2" fill="#F2B84B" stroke="#12141C" stroke-width="1" />
                <circle cx="10" cy="7" r="2.5" fill="#F2B84B" stroke="#12141C" stroke-width="1" />
                <circle cx="20" cy="7" r="2" fill="#F2B84B" stroke="#12141C" stroke-width="1" />
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="font-display font-bold text-base tracking-tight text-transit-text flex items-center gap-2">
                SKILL TRANSIT
                <span class="text-[10px] font-mono uppercase bg-surface-border px-1.5 py-0.5 rounded text-transit-gold border border-transit-gold/30">Network</span>
              </span>
              <span class="text-[10px] font-mono text-transit-muted">CognoDB Line Map</span>
            </div>
          </NuxtLink>

          <!-- Desktop Nav Links -->
          <div class="hidden sm:flex items-center gap-1 bg-surface px-2 py-1 rounded-xl border border-surface-border">
            <NuxtLink to="/" class="nav-link" active-class="nav-link-active">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Departure Board
            </NuxtLink>
            <NuxtLink to="/path-finder" class="nav-link" active-class="nav-link-active">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Path Finder
            </NuxtLink>
            <NuxtLink to="/graph" class="nav-link" active-class="nav-link-active">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Network Map
            </NuxtLink>
          </div>

          <!-- Mobile Menu Button -->
          <button
            class="sm:hidden p-2 rounded-lg text-transit-muted hover:text-transit-text hover:bg-surface transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
          <div v-if="mobileMenuOpen" class="sm:hidden pb-4 flex flex-col gap-1">
            <NuxtLink to="/" class="nav-link" active-class="nav-link-active" @click="mobileMenuOpen = false">
              Departure Board
            </NuxtLink>
            <NuxtLink to="/path-finder" class="nav-link" active-class="nav-link-active" @click="mobileMenuOpen = false">
              Path Finder
            </NuxtLink>
            <NuxtLink to="/graph" class="nav-link" active-class="nav-link-active" @click="mobileMenuOpen = false">
              Network Map
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
    <footer class="border-t border-surface-border bg-ink py-6 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-transit-muted">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Skill Path Transit System · Bolt Connection Live</span>
        </div>
        <p>Powered by CognoDB Graph Engine</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false);
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-medium
         text-transit-muted hover:text-transit-text hover:bg-surface-hover
         transition-all duration-200;
}

.nav-link-active {
  @apply text-ink bg-transit-gold font-semibold shadow-gold;
}
</style>
