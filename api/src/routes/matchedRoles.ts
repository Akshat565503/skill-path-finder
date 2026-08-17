import { Router, Request, Response } from "express";
import { getDriver } from "../db.js";
import neo4j from "neo4j-driver";

const router = Router();

/**
 * POST /api/matched-roles
 *
 * Given a list of known skills, returns roles ranked by how many required
 * skills are already known or within 1-2 hops away.
 *
 * Request body: { skills: string[] }
 * Response: { roles: MatchedRole[] }
 */
router.post("/matched-roles", async (req: Request, res: Response) => {
  const { skills } = req.body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    res.status(400).json({
      error: "Missing required field: 'skills' (non-empty array of skill names)",
    });
    return;
  }

  const session = getDriver().session();

  try {
    const result = await session.run(
      `
      // Find all roles and their required skills
      MATCH (role:Role)-[:REQUIRES]->(reqSkill:Skill)
      WITH role, collect(reqSkill.name) AS requiredSkills

      // Calculate which required skills are directly known
      WITH role, requiredSkills,
           [s IN requiredSkills WHERE s IN $knownSkills] AS knownDirectly,
           [s IN requiredSkills WHERE NOT s IN $knownSkills] AS missingSkills

      // For each missing skill, check if it's reachable within 1-2 hops
      // from any known skill
      UNWIND
        CASE WHEN size(missingSkills) > 0 THEN missingSkills ELSE [null] END
        AS missingSkill

      // Use a single OPTIONAL MATCH but collect and take the minimum
      OPTIONAL MATCH p = shortestPath(
        (known:Skill)-[:PREREQUISITE_OF|RELATED_TO*1..2]-(target:Skill {name: missingSkill})
      )
      WHERE known.name IN $knownSkills AND missingSkill IS NOT NULL

      // Per missing skill: pick the shortest path found (min hops)
      WITH role, requiredSkills, knownDirectly, missingSkills, missingSkill,
           min(CASE WHEN p IS NOT NULL THEN length(p) ELSE null END) AS minHops

      WITH role, requiredSkills, knownDirectly, missingSkills,
           collect(
             CASE WHEN missingSkill IS NOT NULL THEN {
               skill: missingSkill,
               nearby: minHops IS NOT NULL,
               hops: minHops
             } ELSE null END
           ) AS missingDetails

      // Filter out nulls from missingDetails
      WITH role, requiredSkills, knownDirectly,
           [md IN missingDetails WHERE md IS NOT NULL] AS missingDetails

      WITH role, requiredSkills, knownDirectly,
           [md IN missingDetails WHERE md.nearby = true] AS nearbySkills,
           [md IN missingDetails WHERE md.nearby = false] AS farSkills

      // Calculate match score: known + nearby(weighted 0.5), capped at 1.0
      WITH role,
           requiredSkills,
           knownDirectly,
           nearbySkills,
           farSkills,
           size(requiredSkills) AS totalRequired,
           toFloat(size(knownDirectly)) / size(requiredSkills) AS directMatchRatio

      WITH role, requiredSkills, knownDirectly, nearbySkills, farSkills,
           totalRequired, directMatchRatio,
           CASE WHEN toFloat(size(knownDirectly) + size(nearbySkills) * 0.5) / totalRequired > 1.0
                THEN 1.0
                ELSE toFloat(size(knownDirectly) + size(nearbySkills) * 0.5) / totalRequired
           END AS overallScore

      // Also get companies hiring for this role
      OPTIONAL MATCH (company:Company)-[:HIRING_FOR]->(role)
      WITH role, requiredSkills, knownDirectly, nearbySkills, farSkills,
           totalRequired, directMatchRatio, overallScore,
           collect(DISTINCT company.name) AS hiringCompanies

      RETURN
        role.title AS title,
        requiredSkills,
        knownDirectly,
        [ns IN nearbySkills | ns.skill] AS nearbySkills,
        [ns IN nearbySkills | ns.hops] AS nearbyHops,
        [fs IN farSkills | fs.skill] AS missingSkills,
        totalRequired,
        directMatchRatio,
        overallScore,
        hiringCompanies

      ORDER BY overallScore DESC, directMatchRatio DESC
      `,
      { knownSkills: skills }
    );

    const roles = result.records.map((record) => {
      const totalRequired = (record.get("totalRequired") || 0) as number;
      const knownDirectly = record.get("knownDirectly") as string[];
      const nearbySkills = record.get("nearbySkills") as string[];
      const nearbyHops = record.get("nearbyHops") as (number | null)[];
      const missingSkills = record.get("missingSkills") as string[];
      const overallScoreRaw = (record.get("overallScore") || 0) as number;

      return {
        title: record.get("title") as string,
        totalRequired,
        knownCount: knownDirectly.length,
        knownSkills: knownDirectly,
        nearbySkills: nearbySkills.map((skill, i) => ({
          name: skill,
          hopsAway: nearbyHops[i] ?? null,
        })),
        missingSkills,
        directMatchPercent: Math.round((knownDirectly.length / totalRequired) * 100),
        overallScore: Math.round(overallScoreRaw * 100),
        hiringCompanies: record.get("hiringCompanies") as string[],
      };
    });

    res.json({
      knownSkills: skills,
      roles,
      totalRoles: roles.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error matching roles:", message);
    res.status(500).json({ error: "Failed to match roles", message });
  } finally {
    await session.close();
  }
});

export default router;
