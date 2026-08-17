<template>
  <div class="space-y-4">
    <div v-for="(skills, category) in groupedSkills" :key="category">
      <button
        class="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-colors group"
        @click="toggleCategory(category)"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            :class="categoryColors[category] || 'bg-surface-700 text-surface-300'"
          >
            {{ categoryIcons[category] || '⚡' }}
          </div>
          <span class="font-medium text-surface-200 text-sm">{{ category }}</span>
          <span class="text-xs text-surface-500">
            {{ selectedCountForCategory(category, skills) }}/{{ skills.length }}
          </span>
        </div>
        <svg
          class="w-4 h-4 text-surface-500 transition-transform duration-200"
          :class="{ 'rotate-180': expandedCategories.has(category) }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="expandedCategories.has(category)" class="overflow-hidden">
          <div class="flex flex-wrap gap-2 px-2 pt-3 pb-1">
            <button
              v-for="skill in skills"
              :key="skill.name"
              class="skill-badge cursor-pointer select-none"
              :class="{
                'skill-badge-active': modelValue.includes(skill.name),
              }"
              @click="toggleSkill(skill.name)"
            >
              <svg
                v-if="modelValue.includes(skill.name)"
                class="w-3.5 h-3.5 text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
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

// Expand all categories by default on mount
onMounted(() => {
  Object.keys(props.groupedSkills).forEach((cat) => {
    expandedCategories.value.add(cat);
  });
});

// Watch for new categories
watch(
  () => Object.keys(props.groupedSkills),
  (keys) => {
    keys.forEach((cat) => expandedCategories.value.add(cat));
  }
);

const categoryColors: Record<string, string> = {
  Frontend: "bg-blue-500/20 text-blue-400",
  Backend: "bg-green-500/20 text-green-400",
  Cloud: "bg-orange-500/20 text-orange-400",
  Data: "bg-purple-500/20 text-purple-400",
  "Data Science": "bg-pink-500/20 text-pink-400",
  DevOps: "bg-cyan-500/20 text-cyan-400",
};

const categoryIcons: Record<string, string> = {
  Frontend: "🎨",
  Backend: "⚙️",
  Cloud: "☁️",
  Data: "🗄️",
  "Data Science": "🧠",
  DevOps: "🔧",
};

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
