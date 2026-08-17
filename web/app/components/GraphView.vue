<template>
  <div class="relative w-full h-[650px] rounded-2xl glass-card overflow-hidden border border-surface-700/50">
    <!-- Controls header -->
    <div class="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 bg-surface-900/90 backdrop-blur-md p-3 rounded-xl border border-surface-700/60 shadow-lg">
      <div class="text-xs font-semibold text-surface-200">Filter View:</div>
      <button
        class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
        :class="activeFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'"
        @click="filterGraph('all')"
      >
        All Nodes
      </button>
      <button
        class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
        :class="activeFilter === 'Skill' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'"
        @click="filterGraph('Skill')"
      >
        Skills Only
      </button>
      <button
        class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
        :class="activeFilter === 'Role' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'"
        @click="filterGraph('Role')"
      >
        Roles & Skills
      </button>
      <button
        class="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
        :class="activeFilter === 'Company' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'"
        @click="filterGraph('Company')"
      >
        Companies & Roles
      </button>
    </div>

    <!-- Legend box -->
    <div class="absolute bottom-4 left-4 z-10 bg-surface-900/90 backdrop-blur-md p-2.5 rounded-xl border border-surface-700/60 text-[11px] space-y-1 shadow-lg">
      <div class="font-semibold text-surface-200 mb-0.5">Graph Legend</div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-accent-400 border border-accent-300"></span>
        <span class="text-surface-300">Known Skill</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#818cf8]"></span>
        <span class="text-surface-300">Skill Node</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rotate-45 bg-[#ec4899] inline-block"></span>
        <span class="text-surface-300">Role Node</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 bg-[#3b82f6] inline-block"></span>
        <span class="text-surface-300">Company Node</span>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-950/80 backdrop-blur-sm">
      <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <span class="text-sm text-surface-300">Building graph visualization...</span>
    </div>

    <!-- Network container -->
    <div ref="container" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import type { GraphNode, GraphEdge } from "~/composables/useApi";

const props = defineProps<{
  knownSkills?: string[];
}>();

const { fetchGraph } = useApi();
const container = ref<HTMLElement | null>(null);
const loading = ref(true);
const activeFilter = ref<"all" | "Skill" | "Role" | "Company">("all");

let networkInstance: any = null;
let rawNodes: GraphNode[] = [];
let rawEdges: GraphEdge[] = [];

async function initGraph() {
  loading.value = true;
  try {
    const data = await fetchGraph();
    rawNodes = data.nodes;
    rawEdges = data.edges;

    renderNetwork();
  } catch (err) {
    console.error("Failed to load graph:", err);
  } finally {
    loading.value = false;
  }
}

function filterGraph(filter: "all" | "Skill" | "Role" | "Company") {
  activeFilter.value = filter;
  renderNetwork();
}

async function renderNetwork() {
  if (!container.value) return;

  // Import vis-network dynamically on client side
  const { Network } = await import("vis-network");
  const { DataSet } = await import("vis-data");

  const knownSet = new Set(props.knownSkills || []);

  // Filter nodes according to selected view
  let filteredNodes = rawNodes;
  if (activeFilter.value === "Skill") {
    filteredNodes = rawNodes.filter((n) => n.type === "Skill");
  } else if (activeFilter.value === "Role") {
    filteredNodes = rawNodes.filter((n) => n.type === "Skill" || n.type === "Role");
  } else if (activeFilter.value === "Company") {
    filteredNodes = rawNodes.filter((n) => n.type === "Company" || n.type === "Role");
  }

  const validNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = rawEdges.filter((e) => validNodeIds.has(e.from) && validNodeIds.has(e.to));

  const formattedNodes = filteredNodes.map((n) => {
    let color = "#6366f1"; // Skill default
    let shape = "dot";
    let size = 16;
    let isKnown = false;

    if (n.type === "Skill") {
      const skillName = n.label;
      if (knownSet.has(skillName)) {
        color = "#14b8a6"; // Highlight known skill in teal
        size = 22;
        isKnown = true;
      } else {
        color = "#818cf8";
      }
    } else if (n.type === "Role") {
      color = "#ec4899"; // Pink for roles
      shape = "diamond";
      size = 20;
    } else if (n.type === "Company") {
      color = "#3b82f6"; // Blue for companies
      shape = "square";
      size = 22;
    }

    return {
      id: n.id,
      label: n.label,
      shape,
      size,
      color: {
        background: color,
        border: isKnown ? "#2dd4bf" : "#ffffff",
        highlight: {
          background: color,
          border: "#ffffff",
        },
      },
      font: {
        color: "#f8fafc",
        size: 12,
        face: "Inter",
      },
      borderWidth: isKnown ? 3 : 1,
      shadow: isKnown
        ? { enabled: true, color: "rgba(20, 184, 166, 0.6)", size: 10 }
        : false,
    };
  });

  const formattedEdges = filteredEdges.map((e) => {
    let color = "#475569";
    if (e.type === "PREREQUISITE_OF") color = "#6366f1";
    if (e.type === "RELATED_TO") color = "#14b8a6";
    if (e.type === "REQUIRES") color = "#ec4899";
    if (e.type === "HIRING_FOR") color = "#3b82f6";

    return {
      from: e.from,
      to: e.to,
      label: e.label.toLowerCase(),
      font: { color: "#94a3b8", size: 9, align: "horizontal" },
      color: { color, highlight: "#f8fafc" },
      arrows: { to: { enabled: true, scaleFactor: 0.6 } },
      smooth: { type: "curvedCW", roundness: 0.2 },
    };
  });

  const nodesDataSet = new DataSet(formattedNodes);
  const edgesDataSet = new DataSet(formattedEdges);

  const options = {
    physics: {
      solver: "forceAtlas2Based",
      forceAtlas2Based: {
        gravitationalConstant: -35,
        centralGravity: 0.005,
        springLength: 90,
        springConstant: 0.18,
      },
      maxVelocity: 50,
      minVelocity: 0.1,
      stabilization: {
        enabled: true,
        iterations: 150,
      },
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
      zoomView: true,
    },
  };

  if (networkInstance) {
    networkInstance.destroy();
  }

  networkInstance = new Network(container.value, { nodes: nodesDataSet, edges: edgesDataSet }, options);
}

onMounted(() => {
  initGraph();
});

watch(() => props.knownSkills, () => {
  renderNetwork();
}, { deep: true });
</script>
