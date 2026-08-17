<template>
  <div class="relative w-full h-[550px] sm:h-[650px] rounded-2xl transit-card overflow-hidden">
    <!-- Controls header -->
    <div class="absolute top-3 left-3 right-3 sm:right-auto z-10 flex flex-wrap items-center gap-1.5 sm:gap-2 bg-ink/90 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-surface-border shadow-lg font-mono text-[11px] sm:text-xs">
      <div class="font-semibold text-transit-text mr-1">Filter Lines:</div>
      <button
        class="px-2.5 py-1 rounded-lg transition-all font-mono font-semibold cursor-pointer border text-[11px]"
        :class="activeFilter === 'all' ? 'bg-transit-gold text-ink border-transit-gold shadow-gold' : 'bg-surface text-transit-muted border-surface-border hover:border-transit-gold/50 hover:text-transit-text'"
        @click="filterGraph('all')"
      >
        All
      </button>
      <button
        class="px-2.5 py-1 rounded-lg transition-all font-mono font-semibold cursor-pointer border text-[11px]"
        :class="activeFilter === 'Skill' ? 'bg-transit-gold text-ink border-transit-gold shadow-gold' : 'bg-surface text-transit-muted border-surface-border hover:border-transit-gold/50 hover:text-transit-text'"
        @click="filterGraph('Skill')"
      >
        Skills
      </button>
      <button
        class="px-2.5 py-1 rounded-lg transition-all font-mono font-semibold cursor-pointer border text-[11px]"
        :class="activeFilter === 'Role' ? 'bg-transit-gold text-ink border-transit-gold shadow-gold' : 'bg-surface text-transit-muted border-surface-border hover:border-transit-gold/50 hover:text-transit-text'"
        @click="filterGraph('Role')"
      >
        Roles & Skills
      </button>
      <button
        class="px-2.5 py-1 rounded-lg transition-all font-mono font-semibold cursor-pointer border text-[11px]"
        :class="activeFilter === 'Company' ? 'bg-transit-gold text-ink border-transit-gold shadow-gold' : 'bg-surface text-transit-muted border-surface-border hover:border-transit-gold/50 hover:text-transit-text'"
        @click="filterGraph('Company')"
      >
        Companies & Roles
      </button>
    </div>

    <!-- Legend box -->
    <div class="absolute bottom-3 left-3 z-10 bg-ink/90 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-surface-border text-[10px] sm:text-xs font-mono space-y-1 shadow-lg max-w-[180px] sm:max-w-none">
      <div class="font-semibold text-transit-gold mb-0.5">Network Legend</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-transit-gold border border-transit-gold shrink-0"></span>
          <span class="text-transit-text">Known Station</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#5AC8FA] shrink-0"></span>
          <span class="text-transit-muted">Skill Station</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rotate-45 bg-[#F472B6] inline-block shrink-0"></span>
          <span class="text-transit-muted">Role Terminal</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 bg-[#A78BFA] inline-block shrink-0"></span>
          <span class="text-transit-muted">Company Hub</span>
        </div>
      </div>
      <div class="text-[9px] text-transit-muted pt-1 border-t border-surface-border/50 hidden sm:block">
        Hover or click any node to view station label
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink/80 backdrop-blur-sm font-mono text-xs text-transit-muted">
      <div class="w-8 h-8 border-3 border-transit-gold border-t-transparent rounded-full animate-spin mb-3"></div>
      <span>Generating Transit Network Topology...</span>
    </div>

    <!-- Network container -->
    <div ref="container" class="w-full h-full touch-pan-x touch-pan-y"></div>
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
let nodesDataSetRef: any = null;

const categoryColors: Record<string, string> = {
  Frontend: "#5AC8FA",
  Backend: "#34D399",
  Cloud: "#A78BFA",
  Data: "#F472B6",
  DevOps: "#FB923C",
  "Data Science": "#60A5FA",
};

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

  const { Network } = await import("vis-network");
  const { DataSet } = await import("vis-data");

  const knownSet = new Set(props.knownSkills || []);

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
    let color = "#5AC8FA";
    let shape = "dot";
    let size = 16;
    let isKnown = false;

    if (n.type === "Skill") {
      const catColor = categoryColors[n.category || ""] || "#5AC8FA";
      if (knownSet.has(n.label)) {
        color = "#F2B84B";
        size = 22;
        isKnown = true;
      } else {
        color = catColor;
      }
    } else if (n.type === "Role") {
      color = "#F472B6";
      shape = "diamond";
      size = 20;
    } else if (n.type === "Company") {
      color = "#A78BFA";
      shape = "square";
      size = 22;
    }

    // REQUIREMENT 1: Hide labels by default unless it's a known station.
    // Hover/click will reveal labels dynamically.
    const showLabel = isKnown;

    return {
      id: n.id,
      label: n.label,
      title: n.label, // Tooltip fallback
      shape,
      size,
      color: {
        background: color,
        border: isKnown ? "#F2B84B" : "#EDEEF2",
        highlight: {
          background: color,
          border: "#EDEEF2",
        },
      },
      font: {
        color: "#EDEEF2",
        size: showLabel ? 12 : 0, // Size 0 hides label text to declutter canvas
        face: "IBM Plex Mono",
        background: "rgba(18, 20, 28, 0.8)",
        strokeWidth: 2,
        strokeColor: "#12141C",
      },
      borderWidth: isKnown ? 3 : 1,
      shadow: isKnown
        ? { enabled: true, color: "rgba(242, 184, 75, 0.6)", size: 12 }
        : false,
    };
  });

  const formattedEdges = filteredEdges.map((e) => {
    let color = "#2A2E3F";
    let dashes = false;
    if (e.type === "PREREQUISITE_OF") { color = "#5AC8FA"; dashes = false; }
    if (e.type === "RELATED_TO") { color = "#F2B84B"; dashes = true; }
    if (e.type === "REQUIRES") { color = "#F472B6"; dashes = false; }
    if (e.type === "HIRING_FOR") { color = "#A78BFA"; dashes = false; }

    return {
      from: e.from,
      to: e.to,
      font: { size: 0 }, // Hide edge labels by default to prevent clutter
      color: { color, highlight: "#EDEEF2" },
      dashes,
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      smooth: { type: "curvedCW", roundness: 0.2 },
    };
  });

  const nodesDataSet = new DataSet(formattedNodes);
  const edgesDataSet = new DataSet(formattedEdges);
  nodesDataSetRef = nodesDataSet;

  // REQUIREMENT 1: Increased spacing & physics tuning
  const options = {
    physics: {
      solver: "forceAtlas2Based",
      forceAtlas2Based: {
        gravitationalConstant: -120, // Increased repulsion to spread nodes out
        centralGravity: 0.005,
        springLength: 160,          // Increased node distance spacing
        springConstant: 0.08,
        avoidOverlap: 0.9,
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
      tooltipDelay: 100,
      zoomView: true,
      dragView: true,
    },
  };

  if (networkInstance) {
    networkInstance.destroy();
  }

  networkInstance = new Network(container.value, { nodes: nodesDataSet, edges: edgesDataSet }, options);

  // REQUIREMENT 1: Show label dynamically on node hover & click
  networkInstance.on("hoverNode", (params: any) => {
    if (nodesDataSetRef && params.node) {
      nodesDataSetRef.update({ id: params.node, font: { size: 12, color: "#F2B84B" } });
    }
  });

  networkInstance.on("blurNode", (params: any) => {
    if (nodesDataSetRef && params.node) {
      const isKnown = knownSet.has(rawNodes.find((n) => n.id === params.node)?.label || "");
      nodesDataSetRef.update({ id: params.node, font: { size: isKnown ? 12 : 0, color: "#EDEEF2" } });
    }
  });

  networkInstance.on("selectNode", (params: any) => {
    if (nodesDataSetRef && params.nodes && params.nodes[0]) {
      nodesDataSetRef.update({ id: params.nodes[0], font: { size: 13, color: "#F2B84B" } });
    }
  });

  // REQUIREMENT 1: Auto-fit viewport on stabilization with closer initial view
  networkInstance.once("stabilizationIterationsDone", () => {
    networkInstance.fit({
      animation: false,
    });
  });
}

onMounted(() => {
  initGraph();
});

watch(() => props.knownSkills, () => {
  renderNetwork();
}, { deep: true });
</script>
