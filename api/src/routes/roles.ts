import { Router, Request, Response } from "express";
import { getDriver } from "../db.js";

const router = Router();

/**
 * GET /api/roles/:title
 *
 * Returns a role's full details including required skills (with categories)
 * and which companies are hiring for it.
 *
 * Note: Uses role title as the identifier (URL-encoded).
 */
router.get("/roles/:title", async (req: Request, res: Response) => {
  const { title } = req.params;
  if (typeof title !== "string") {
    res.status(400).json({
      error: "Invalid role title",
    });
    return;
  }
  const decodedTitle = decodeURIComponent(title);

  const session = getDriver().session();

  try {
    const result = await session.run(
      `
      MATCH (role:Role {title: $title})

      // Get required skills with categories
      OPTIONAL MATCH (role)-[:REQUIRES]->(skill:Skill)
      WITH role, collect({name: skill.name, category: skill.category}) AS skills

      // Get hiring companies
      OPTIONAL MATCH (company:Company)-[:HIRING_FOR]->(role)
      WITH role, skills, collect(DISTINCT company.name) AS companies

      // Group skills by category
      RETURN
        role.title AS title,
        skills,
        companies,
        size(skills) AS totalSkills
      `,
      { title: decodedTitle }
    );

    if (result.records.length === 0) {
      res.status(404).json({
        error: `Role not found: "${decodedTitle}"`,
      });
      return;
    }

    const record = result.records[0];
    const skills = record.get("skills") as { name: string; category: string }[];

    // Group skills by category
    const skillsByCategory: Record<string, string[]> = {};
    for (const skill of skills) {
      if (!skill.name) continue;
      if (!skillsByCategory[skill.category]) {
        skillsByCategory[skill.category] = [];
      }
      skillsByCategory[skill.category].push(skill.name);
    }

    res.json({
      title: record.get("title") as string,
      totalSkills: skills.filter((s) => s.name).length,
      skills: skills.filter((s) => s.name),
      skillsByCategory,
      hiringCompanies: record.get("companies") as string[],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching role:", message);
    res.status(500).json({ error: "Failed to fetch role", message });
  } finally {
    await session.close();
  }
});

export default router;
