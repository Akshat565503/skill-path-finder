import { Router, Request, Response } from "express";
import { getDriver } from "../db.js";

const router = Router();

/**
 * GET /api/skills
 *
 * Returns all skills grouped by category.
 * Response: { categories: { [category: string]: { name: string, category: string }[] } }
 */
router.get("/skills", async (_req: Request, res: Response) => {
  const session = getDriver().session();

  try {
    const result = await session.run(`
      MATCH (s:Skill)
      RETURN s.name AS name, s.category AS category
      ORDER BY s.category, s.name
    `);

    // Group skills by category
    const categories: Record<string, { name: string; category: string }[]> = {};

    for (const record of result.records) {
      const name = record.get("name") as string;
      const category = record.get("category") as string;

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({ name, category });
    }

    res.json({
      categories,
      totalSkills: result.records.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error fetching skills:", message);
    res.status(500).json({ error: "Failed to fetch skills", message });
  } finally {
    await session.close();
  }
});

export default router;
