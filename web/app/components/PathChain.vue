<template>
  <div class="relative">
    <!-- Chain visualization -->
    <div class="flex items-center gap-0 overflow-x-auto scrollbar-thin pb-4 pt-2 px-1">
      <div
        v-for="(node, index) in path"
        :key="node.name"
        class="flex items-center flex-shrink-0"
      >
        <!-- Node -->
        <div
          class="relative group"
          :class="{ 'animate-scale-in': true }"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <div
            class="px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-default whitespace-nowrap"
            :class="nodeClass(node, index)"
          >
            <div class="flex items-center gap-2">
              <span class="text-[10px] opacity-60">{{ node.category }}</span>
            </div>
            <div class="mt-0.5 font-semibold">{{ node.name }}</div>
          </div>

          <!-- Step number badge -->
          <div
            class="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            :class="stepBadgeClass(index)"
          >
            {{ index + 1 }}
          </div>
        </div>

        <!-- Connector arrow -->
        <div
          v-if="index < path.length - 1"
          class="flex items-center mx-1 flex-shrink-0"
          :class="{ 'animate-fade-in': true }"
          :style="{ animationDelay: `${index * 80 + 40}ms` }"
        >
          <div class="flex flex-col items-center">
            <span class="text-[9px] text-surface-500 mb-1 whitespace-nowrap">
              {{ formatRelType(relationships[index]) }}
            </span>
            <div class="flex items-center">
              <div class="w-6 h-px" :class="connectorColor(relationships[index])" />
              <svg
                class="w-3 h-3 -ml-1"
                :class="arrowColor(relationships[index])"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 17l5-5-5-5v10z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="path.length > 0" class="flex items-center gap-4 mt-2 px-1">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-1 rounded-full bg-primary-500" />
        <span class="text-[10px] text-surface-500">Prerequisite</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-1 rounded-full bg-accent-500" />
        <span class="text-[10px] text-surface-500">Related</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PathNode } from "~/composables/useApi";

const props = defineProps<{
  path: PathNode[];
  relationships: string[];
}>();

function nodeClass(node: PathNode, index: number): string {
  if (index === 0) {
    return "bg-primary-500/20 border-primary-500/50 text-primary-200";
  }
  if (index === props.path.length - 1) {
    return "bg-accent-500/20 border-accent-500/50 text-accent-200";
  }
  return "bg-surface-800/60 border-surface-600/50 text-surface-200";
}

function stepBadgeClass(index: number): string {
  if (index === 0) return "bg-primary-500 text-white";
  if (index === props.path.length - 1) return "bg-accent-500 text-white";
  return "bg-surface-600 text-surface-200";
}

function formatRelType(rel: string): string {
  if (rel === "PREREQUISITE_OF") return "prereq";
  if (rel === "RELATED_TO") return "related";
  return rel?.toLowerCase() || "";
}

function connectorColor(rel: string): string {
  if (rel === "PREREQUISITE_OF") return "bg-primary-500/60";
  if (rel === "RELATED_TO") return "bg-accent-500/60";
  return "bg-surface-600";
}

function arrowColor(rel: string): string {
  if (rel === "PREREQUISITE_OF") return "text-primary-500/60";
  if (rel === "RELATED_TO") return "text-accent-500/60";
  return "text-surface-600";
}
</script>
