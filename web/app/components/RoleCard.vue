<template>
  <div class="departure-row p-4 transition-all duration-200 hover:border-transit-gold">
    <!-- Top Row: Role Title, Category Line Dots, and Readiness Badge -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <!-- Role Title & Categories -->
      <div class="flex items-center gap-3">
        <!-- Metro Status Dot -->
        <span
          class="w-3 h-3 rounded-full flex-shrink-0 animate-pulse-subtle"
          :style="{ backgroundColor: scoreColor }"
        />
        <div>
          <h3 class="font-display font-bold text-transit-text text-base tracking-tight flex items-center gap-2">
            {{ role.title }}
          </h3>
          <!-- Category Dots Bar -->
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[10px] text-transit-muted font-mono uppercase tracking-wider">Lines:</span>
            <span
              v-for="cat in uniqueCategories"
              :key="cat"
              class="w-2.5 h-2.5 rounded-full inline-block"
              :style="{ backgroundColor: getCategoryLineColor(cat) }"
              :title="cat"
            />
          </div>
        </div>
      </div>

      <!-- Departure Board Readiness Display -->
      <div class="flex items-center gap-3 font-mono">
        <div class="text-right">
          <div class="text-xs font-semibold" :style="{ color: scoreColor }">
            {{ role.knownCount }} of {{ role.totalRequired }} SKILLS MATCHED
          </div>
          <div class="text-[10px] text-transit-muted">
            Direct: {{ role.directMatchPercent }}% · Score: {{ role.overallScore }}%
          </div>
        </div>
        <div
          class="px-3 py-1.5 rounded-lg text-sm font-bold text-ink"
          :style="{ backgroundColor: scoreColor }"
        >
          {{ role.overallScore }}%
        </div>
      </div>
    </div>

    <!-- Readiness Progress Bar -->
    <div class="relative h-2 rounded-full bg-ink overflow-hidden border border-surface-border mb-3">
      <!-- Direct match portion -->
      <div
        class="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
        :style="{ width: `${role.directMatchPercent}%`, backgroundColor: scoreColor }"
      />
      <!-- Overall match portion (includes nearby) -->
      <div
        class="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out opacity-30"
        :style="{ width: `${role.overallScore}%`, backgroundColor: scoreColor }"
      />
    </div>

    <!-- Station Skills Breakdown -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono pt-1">
      <!-- Known Skills -->
      <div v-if="role.knownSkills.length > 0">
        <span class="text-[10px] uppercase text-transit-muted tracking-wider block mb-1">✓ Known Stations</span>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="skill in role.knownSkills"
            :key="skill"
            class="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          >
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- Nearby Skills (1-2 hops) -->
      <div v-if="role.nearbySkills.length > 0">
        <span class="text-[10px] uppercase text-transit-muted tracking-wider block mb-1">⚡ Nearby Connections (1-2 Hops)</span>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="ns in role.nearbySkills"
            :key="ns.name"
            class="px-2 py-0.5 rounded text-[11px] bg-transit-gold/10 text-transit-gold border border-transit-gold/30"
          >
            {{ ns.name }}
          </span>
        </div>
      </div>

      <!-- Missing Skills -->
      <div v-if="role.missingSkills.length > 0">
        <span class="text-[10px] uppercase text-transit-muted tracking-wider block mb-1">✕ Missing Stations</span>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="skill in role.missingSkills"
            :key="skill"
            class="px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-400 border border-red-500/20"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer: Hiring Companies -->
    <div v-if="role.hiringCompanies.length > 0" class="mt-3 pt-2.5 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono text-transit-muted">
      <span class="flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-transit-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Hiring Terminal:
      </span>
      <span class="text-transit-text font-medium">{{ role.hiringCompanies.join(" · ") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MatchedRole } from "~/composables/useApi";

const props = defineProps<{
  role: MatchedRole;
}>();

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

// Estimate unique categories based on skill names (simple heuristic lookup)
const uniqueCategories = computed(() => {
  const categories = new Set<string>();
  const allSkills = [...props.role.knownSkills, ...props.role.missingSkills, ...props.role.nearbySkills.map(n => n.name)];

  allSkills.forEach(skill => {
    if (["HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue.js", "Next.js", "Tailwind CSS"].includes(skill)) categories.add("Frontend");
    else if (["Node.js", "Express.js", "Python", "Django", "FastAPI", "Go", "REST APIs", "GraphQL"].includes(skill)) categories.add("Backend");
    else if (["AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Terraform", "Serverless"].includes(skill)) categories.add("Cloud");
    else if (["SQL", "PostgreSQL", "MongoDB", "Redis", "Neo4j", "Apache Kafka", "Data Modeling"].includes(skill)) categories.add("Data");
    else if (["Git", "CI/CD", "Linux", "Nginx", "Monitoring"].includes(skill)) categories.add("DevOps");
    else if (["Machine Learning", "Deep Learning", "Pandas", "TensorFlow", "NLP"].includes(skill)) categories.add("Data Science");
  });

  return Array.from(categories);
});

const scoreColor = computed(() => {
  const score = props.role.overallScore;
  if (score >= 70) return "#34D399"; // Emerald
  if (score >= 40) return "#F2B84B"; // Gold
  return "#8B8FA3"; // Muted
});
</script>
