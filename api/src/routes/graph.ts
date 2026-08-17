import { Router, Request, Response } from "express";
import { getDriver } from "../db.js";

const router = Router();

/**
 * GET /api/graph
 *
 * Returns all nodes (Skill, Role, Company) and relationships
 * for visual graph rendering (vis-network / cytoscape).
 */
router.get("/graph", async (_req: Request, res: Response) => {
  const session = getDriver().session();

  try {
    // Fetch nodes
    const nodesResult = await session.run(`
      MATCH (n)
      RETURN id(n) AS internalId, labels(n)[0] AS label, properties(n) AS props
    `);

    const nodes = nodesResult.records.map((rec) => {
      const label = rec.get("label") as string;
      const props = rec.get("props") as Record<string, string>;
      let id = "";
      let title = "";
      let group = label;

      if (label === "Skill") {
        id = `skill_${props.name}`;
        title = props.name;
        group = `Skill_${props.category}`;
      } else if (label === "Role") {
        id = `role_${props.title}`;
        title = props.title;
        group = "Role";
      } else if (label === "Company") {
        id = `company_${props.name}`;
        title = props.name;
        group = "Company";
      }

      return {
        id,
        label: title,
        group,
        type: label,
        category: props.category || null,
      };
    });

    // Fetch relationships
    const relsResult = await session.run(`
      MATCH (a)-[r]->(b)
      RETURN 
        labels(a)[0] AS aType, properties(a) AS aProps,
        type(r) AS relType,
        labels(b)[0] AS bType, properties(b) AS bProps
    `);

    const edges = relsResult.records.map((rec) => {
      const aType = rec.get("aType") as string;
      const aProps = rec.get("aProps") as Record<string, string>;
      const bType = rec.get("bType") as string;
      const bProps = rec.get("bProps") as Record<string, string>;
      const relType = rec.get("relType") as string;

      const fromId = aType === "Skill" ? `skill_${aProps.name}` : aType === "Role" ? `role_${aProps.title}` : `company_${aProps.name}`;
      const toId = bType === "Skill" ? `skill_${bProps.name}` : bType === "Role" ? `role_${bProps.title}` : `company_${bProps.name}`;

      return {
        from: fromId,
        to: toId,
        label: relType,
        type: relType,
      };
    });

    res.json({ nodes, edges });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching graph data:", message);
    res.status(500).json({ error: "Failed to fetch graph data", message });
  } finally {
    await session.close();
  }
});

export default router;
