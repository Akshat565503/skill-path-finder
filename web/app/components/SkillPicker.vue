<template>
  <div class="space-y-3">
    <div v-for="(skills, category) in groupedSkills" :key="category" class="rounded-xl border border-surface-border bg-surface/40 overflow-hidden">
      <!-- Category Line Header -->
      <button
        class="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-surface-hover transition-colors group"
        @click="toggleCategory(category)"
      >
        <div class="flex items-center gap-2.5">
          <!-- Metro Line Color Indicator -->
          <div
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: getCategoryLineColor(category) }"
          />
          <span class="font-display font-semibold text-transit-text text-sm tracking-tight">{{ category }} Line</span>
          <span class="font-mono text-[11px] text-transit-muted">
            ({{ selectedCountForCategory(category, skills) }}/{{ skills.length }} stations)
          </span>
        </div>
        <svg
          class="w-4 h-4 text-transit-muted transition-transform duration-200"
          :class="{ 'rotate-180': expandedCategories.has(category) }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Stations List -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="expandedCategories.has(category)" class="overflow-hidden border-t border-surface-border/50 bg-ink/30">
          <div class="flex flex-wrap gap-1.5 p-3">
            <button
              v-for="skill in skills"
              :key="skill.name"
              class="font-mono text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none"
              :style="getSkillBadgeStyle(skill.name, category)"
              @click="toggleSkill(skill.name)"
            >
              <!-- Station Dot -->
              <span
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ backgroundColor: modelValue.includes(skill.name) ? '#12141C' : getCategoryLineColor(category) }"
              />
              <span>{{ skill.name }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Skill } from "~/composables/useApi";

const props = defineProps<{
  groupedSkills: Record<string, Skill[]>;
  modelValue: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [skills: string[]];
}>();

const expandedCategories = ref<Set<string>>(new Set());

onMounted(() => {
  Object.keys(props.groupedSkills).forEach((cat) => expandedCategories.value.add(cat));
});

watch(
  () => Object.keys(props.groupedSkills),
  (keys) => keys.forEach((cat) => expandedCategories.value.add(cat))
);

const lineColors: Record<string, string> = {
  Frontend: "#5AC8FA",
  Backend: "#34D399",
  Cloud: "#A78BFA",
  Data: "#F472B6",
  DevOps: "#FB923C",
  "Data Science": "#60A5FA",
};

function getCategoryLineColor(category: string): string {
  return lineColors[category] || "#F2B84B";
}

function getSkillBadgeStyle(skillName: string, category: string) {
  const isSelected = props.modelValue.includes(skillName);
  const color = getCategoryLineColor(category);

  if (isSelected) {
    return {
      backgroundColor: "#F2B84B",
      color: "#12141C",
      borderColor: "#F2B84B",
      fontWeight: "600",
      boxShadow: "0 0 10px rgba(242, 184, 75, 0.3)",
    };
  }

  return {
    backgroundColor: "rgba(27, 30, 42, 0.6)",
    color: "#EDEEF2",
    borderColor: "#2A2E3F",
  };
}

function toggleCategory(category: string) {
  const newSet = new Set(expandedCategories.value);
  if (newSet.has(category)) {
    newSet.delete(category);
  } else {
    newSet.add(category);
  }
  expandedCategories.value = newSet;
}

function toggleSkill(skillName: string) {
  const current = [...props.modelValue];
  const index = current.indexOf(skillName);
  if (index >= 0) {
    current.splice(index, 1);
  } else {
    current.push(skillName);
  }
  emit("update:modelValue", current);
}

function selectedCountForCategory(category: string, skills: Skill[]): number {
  return skills.filter((s) => props.modelValue.includes(s.name)).length;
}
</script>
