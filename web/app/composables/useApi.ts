/**
 * Composable for interacting with the Skill Path Finder API.
 */

interface Skill {
  name: string;
  category: string;
}

interface SkillsResponse {
  categories: Record<string, Skill[]>;
  totalSkills: number;
}

interface PathNode {
  name: string;
  category: string;
}

interface PathResponse {
  from: string;
  to: string;
  path: PathNode[];
  hops: number;
  relationships: string[];
  message?: string;
}

interface NearbySkill {
  name: string;
  hopsAway: number | null;
}

interface MatchedRole {
  title: string;
  totalRequired: number;
  knownCount: number;
  knownSkills: string[];
  nearbySkills: NearbySkill[];
  missingSkills: string[];
  directMatchPercent: number;
  overallScore: number;
  hiringCompanies: string[];
}

interface MatchedRolesResponse {
  knownSkills: string[];
  roles: MatchedRole[];
  totalRoles: number;
}

interface RoleDetail {
  title: string;
  totalSkills: number;
  skills: Skill[];
  skillsByCategory: Record<string, string[]>;
  hiringCompanies: string[];
}

interface GraphNode {
  id: string;
  label: string;
  group: string;
  type: "Skill" | "Role" | "Company";
  category: string | null;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  type: string;
}

interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function useApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase as string;

  /**
   * Fetch all skills grouped by category.
   */
  async function fetchSkills(): Promise<SkillsResponse> {
    return await $fetch<SkillsResponse>(`${baseUrl}/api/skills`);
  }

  /**
   * Find the shortest path between two skills.
   */
  async function findPath(from: string, to: string): Promise<PathResponse> {
    return await $fetch<PathResponse>(`${baseUrl}/api/path`, {
      method: "POST",
      body: { from, to },
    });
  }

  /**
   * Get matched roles for a set of known skills.
   */
  async function getMatchedRoles(skills: string[]): Promise<MatchedRolesResponse> {
    return await $fetch<MatchedRolesResponse>(`${baseUrl}/api/matched-roles`, {
      method: "POST",
      body: { skills },
    });
  }

  /**
   * Get full details for a specific role.
   */
  async function getRoleDetail(title: string): Promise<RoleDetail> {
    return await $fetch<RoleDetail>(
      `${baseUrl}/api/roles/${encodeURIComponent(title)}`
    );
  }

  /**
   * Fetch the full graph for visualization.
   */
  async function fetchGraph(): Promise<GraphResponse> {
    return await $fetch<GraphResponse>(`${baseUrl}/api/graph`);
  }

  return {
    fetchSkills,
    findPath,
    getMatchedRoles,
    getRoleDetail,
    fetchGraph,
  };
}

export type {
  Skill,
  SkillsResponse,
  PathNode,
  PathResponse,
  NearbySkill,
  MatchedRole,
  MatchedRolesResponse,
  RoleDetail,
  GraphNode,
  GraphEdge,
  GraphResponse,
};
