<template>
  <div class="relative py-4 overflow-x-auto scrollbar-thin">
    <!-- Transit Line Legend -->
    <div class="flex items-center gap-6 mb-6 font-mono text-xs text-transit-muted bg-surface/60 p-3 rounded-xl border border-surface-border">
      <div class="flex items-center gap-2">
        <span class="w-5 h-1 rounded-full bg-transit-gold"></span>
        <span>Solid Line = Prerequisite Track</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-5 h-0 border-t-2 border-dashed border-transit-gold"></span>
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3 text-transit-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Dashed Line = Interchange Transfer (Related)
        </span>
      </div>
    </div>

    <!-- Metro Line Diagram Container -->
    <div class="flex items-center gap-0 min-w-max px-4 py-6">
      <div
        v-for="(node, index) in path"
        :key="node.name"
        class="flex items-center flex-shrink-0"
      >
        <!-- Station Node -->
        <div class="relative flex flex-col items-center group">
          <!-- Station Code / Index Badge -->
          <span class="font-mono text-[10px] font-bold text-transit-muted mb-2">
            STN-0{{ index + 1 }}
          </span>

          <!-- Metro Station Circle Icon -->
          <div
            class="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 bg-ink z-10 shadow-transit"
            :style="getStationCircleStyle(node, index)"
          >
            <!-- You Are Here / Target Station Pulse -->
            <div
              v-if="index === 0 || index === path.length - 1"
              class="absolute -inset-1.5 rounded-full border-2 border-dashed animate-spin"
              :style="{ borderColor: index === 0 ? '#F2B84B' : '#34D399', animationDuration: '10s' }"
            />
            
            <!-- Category Line Dot -->
            <span
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: getCategoryColor(node.category) }"
            />
          </div>

          <!-- Station Label Box -->
          <div class="mt-3 text-center max-w-[120px]">
            <span
              class="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase mb-1 font-semibold"
              :style="getCategoryBadgeStyle(node.category)"
            >
              {{ node.category }}
            </span>
            <div class="font-display font-bold text-transit-text text-sm leading-tight group-hover:text-transit-gold transition-colors">
              {{ node.name }}
            </div>
            <div v-if="index === 0" class="text-[10px] font-mono text-transit-gold mt-0.5">
              ● Origin
            </div>
            <div v-else-if="index === path.length - 1" class="text-[10px] font-mono text-emerald-400 mt-0.5">
              ★ Destination
            </div>
          </div>
        </div>

        <!-- Connecting Transit Line Segment -->
        <div v-if="index < path.length - 1" class="relative flex flex-col items-center px-2 -mt-10 flex-shrink-0">
          <!-- Interchange / Transfer Badge above line -->
          <div class="h-6 flex items-center justify-center mb-1">
            <div
              v-if="relationships[index] === 'RELATED_TO'"
              class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-hover border border-transit-gold/50 text-[10px] font-mono text-transit-gold shadow-sm"
              title="Interchange Transfer Point"
            >
              <svg class="w-3 h-3 text-transit-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Transfer</span>
            </div>
            <span v-else class="text-[10px] font-mono text-transit-muted">
              Prereq
            </span>
          </div>

          <!-- Animated Transit Track Segment -->
          <div class="relative flex items-center w-24 sm:w-32">
            <svg class="w-full h-4" overflow="visible">
              <!-- Base Track Line -->
              <line
                x1="0"
                y1="8"
                x2="100%"
                y2="8"
                :stroke="getCategoryColor(node.category)"
                stroke-width="5"
                :stroke-dasharray="relationships[index] === 'RELATED_TO' ? '6 4' : 'none'"
                stroke-linecap="round"
                :class="{ 'transit-line-path': !isReducedMotion }"
              />
            </svg>
            <div
              class="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              :style="{ backgroundColor: getCategoryColor(path[index + 1].category) }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { PathNode } from "~/composables/useApi";

const props = defineProps<{
  path: PathNode[];
  relationships: string[];
}>();

const isReducedMotion = ref(false);

onMounted(() => {
  if (typeof window !== "undefined") {
    isReducedMotion.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
});

const lineColors: Record<string, string> = {
  Frontend: "#5AC8FA",
  Backend: "#34D399",
  Cloud: "#A78BFA",
  Data: "#F472B6",
  DevOps: "#FB923C",
  "Data Science": "#60A5FA",
};

function getCategoryColor(category: string): string {
  return lineColors[category] || "#F2B84B";
}

function getStationCircleStyle(node: PathNode, index: number) {
  const catColor = getCategoryColor(node.category);
  if (index === 0) {
    return {
      borderColor: "#F2B84B",
      boxShadow: "0 0 16px rgba(242, 184, 75, 0.4)",
    };
  }
  if (index === props.path.length - 1) {
    return {
      borderColor: "#34D399",
      boxShadow: "0 0 16px rgba(52, 211, 153, 0.4)",
    };
  }
  return {
    borderColor: catColor,
  };
}

function getCategoryBadgeStyle(category: string) {
  const color = getCategoryColor(category);
  return {
    backgroundColor: `${color}20`,
    color: color,
    border: `1px solid ${color}40`,
  };
}
</script>
