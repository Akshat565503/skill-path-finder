import neo4j, { Driver, Session } from "neo4j-driver";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load .env from api root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "..", ".env") });

// ─── Connection ────────────────────────────────────────────

const BOLT_URI = process.env.BOLT_URI!;
const BOLT_USER = process.env.BOLT_USER!;
const BOLT_PASSWORD = process.env.BOLT_PASSWORD!;

if (!BOLT_URI || !BOLT_USER || !BOLT_PASSWORD) {
  console.error("❌ Missing BOLT_URI / BOLT_USER / BOLT_PASSWORD in .env");
  process.exit(1);
}

// ─── Data Definitions ──────────────────────────────────────

interface SkillDef {
  name: string;
  category: string;
}

interface RoleDef {
  title: string;
  requiredSkills: string[];
}

interface CompanyDef {
  name: string;
  hiringFor: string[];
}

interface RelDef {
  from: string;
  to: string;
}

// ─── Skills (~40 across 6 categories) ──────────────────────

const skills: SkillDef[] = [
  // Frontend (8)
  { name: "HTML", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },

  // Backend (8)
  { name: "Node.js", category: "Backend" },
  { name: "Express.js", category: "Backend" },
  { name: "Python", category: "Backend" },
  { name: "Django", category: "Backend" },
  { name: "FastAPI", category: "Backend" },
  { name: "Go", category: "Backend" },
  { name: "REST APIs", category: "Backend" },
  { name: "GraphQL", category: "Backend" },

  // Cloud & Infrastructure (7)
  { name: "AWS", category: "Cloud" },
  { name: "Google Cloud", category: "Cloud" },
  { name: "Azure", category: "Cloud" },
  { name: "Docker", category: "Cloud" },
  { name: "Kubernetes", category: "Cloud" },
  { name: "Terraform", category: "Cloud" },
  { name: "Serverless", category: "Cloud" },

  // Data & Databases (7)
  { name: "SQL", category: "Data" },
  { name: "PostgreSQL", category: "Data" },
  { name: "MongoDB", category: "Data" },
  { name: "Redis", category: "Data" },
  { name: "Neo4j", category: "Data" },
  { name: "Apache Kafka", category: "Data" },
  { name: "Data Modeling", category: "Data" },

  // DevOps & Tools (5)
  { name: "Git", category: "DevOps" },
  { name: "CI/CD", category: "DevOps" },
  { name: "Linux", category: "DevOps" },
  { name: "Nginx", category: "DevOps" },
  { name: "Monitoring", category: "DevOps" },

  // Data Science & ML (5)
  { name: "Machine Learning", category: "Data Science" },
  { name: "Deep Learning", category: "Data Science" },
  { name: "Pandas", category: "Data Science" },
  { name: "TensorFlow", category: "Data Science" },
  { name: "NLP", category: "Data Science" },
];

// ─── PREREQUISITE_OF (learning dependencies) ───────────────
// Read as: "from" is a prerequisite OF "to" (learn from before to)

const prerequisites: RelDef[] = [
  // Frontend chain
  { from: "HTML", to: "CSS" },
  { from: "CSS", to: "JavaScript" },
  { from: "JavaScript", to: "TypeScript" },
  { from: "JavaScript", to: "React" },
  { from: "JavaScript", to: "Vue.js" },
  { from: "TypeScript", to: "Next.js" },
  { from: "React", to: "Next.js" },
  { from: "CSS", to: "Tailwind CSS" },

  // Backend chain
  { from: "JavaScript", to: "Node.js" },
  { from: "Node.js", to: "Express.js" },
  { from: "Python", to: "Django" },
  { from: "Python", to: "FastAPI" },
  { from: "TypeScript", to: "Express.js" },

  // APIs
  { from: "Express.js", to: "REST APIs" },
  { from: "FastAPI", to: "REST APIs" },
  { from: "REST APIs", to: "GraphQL" },

  // Cloud chain
  { from: "Linux", to: "Docker" },
  { from: "Docker", to: "Kubernetes" },
  { from: "Docker", to: "AWS" },
  { from: "Docker", to: "Google Cloud" },
  { from: "Docker", to: "Azure" },
  { from: "Kubernetes", to: "Terraform" },
  { from: "AWS", to: "Serverless" },

  // Data chain
  { from: "SQL", to: "PostgreSQL" },
  { from: "SQL", to: "Data Modeling" },
  { from: "Data Modeling", to: "MongoDB" },
  { from: "Data Modeling", to: "Neo4j" },
  { from: "PostgreSQL", to: "Redis" },
  { from: "Data Modeling", to: "Apache Kafka" },

  // DevOps chain
  { from: "Git", to: "CI/CD" },
  { from: "Linux", to: "Nginx" },
  { from: "CI/CD", to: "Monitoring" },

  // ML chain
  { from: "Python", to: "Pandas" },
  { from: "Pandas", to: "Machine Learning" },
  { from: "Machine Learning", to: "Deep Learning" },
  { from: "Deep Learning", to: "TensorFlow" },
  { from: "Machine Learning", to: "NLP" },
];

// ─── RELATED_TO (skills that are similar / complementary) ──

const relatedTo: RelDef[] = [
  // Frontend related
  { from: "React", to: "Vue.js" },
  { from: "React", to: "Next.js" },
  { from: "CSS", to: "Tailwind CSS" },
  { from: "TypeScript", to: "JavaScript" },

  // Backend related
  { from: "Express.js", to: "FastAPI" },
  { from: "Django", to: "FastAPI" },
  { from: "Node.js", to: "Go" },
  { from: "REST APIs", to: "GraphQL" },

  // Cloud related
  { from: "AWS", to: "Google Cloud" },
  { from: "AWS", to: "Azure" },
  { from: "Google Cloud", to: "Azure" },
  { from: "Docker", to: "Kubernetes" },
  { from: "Terraform", to: "Serverless" },

  // Data related
  { from: "PostgreSQL", to: "MongoDB" },
  { from: "PostgreSQL", to: "Neo4j" },
  { from: "MongoDB", to: "Redis" },
  { from: "Redis", to: "Apache Kafka" },

  // Cross-domain bridges (key for realistic multi-hop paths)
  { from: "Python", to: "Node.js" },
  { from: "Pandas", to: "SQL" },
  { from: "Machine Learning", to: "Data Modeling" },
  { from: "TensorFlow", to: "Deep Learning" },
  { from: "NLP", to: "Deep Learning" },
  { from: "Node.js", to: "Docker" },
  { from: "TypeScript", to: "Go" },
  { from: "Express.js", to: "Docker" },
  { from: "CI/CD", to: "Docker" },
  { from: "Nginx", to: "Docker" },
  { from: "PostgreSQL", to: "Docker" },
  { from: "Go", to: "Kubernetes" },
  { from: "Linux", to: "AWS" },
];

// ─── Roles (15) ────────────────────────────────────────────

const roles: RoleDef[] = [
  {
    title: "Junior Frontend Developer",
    requiredSkills: ["HTML", "CSS", "JavaScript", "Git"],
  },
  {
    title: "Senior Frontend Engineer",
    requiredSkills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "REST APIs"],
  },
  {
    title: "Full Stack Developer",
    requiredSkills: ["JavaScript", "TypeScript", "React", "Node.js", "Express.js", "PostgreSQL", "Git"],
  },
  {
    title: "Backend Engineer",
    requiredSkills: ["Node.js", "TypeScript", "Express.js", "PostgreSQL", "REST APIs", "Docker", "Git"],
  },
  {
    title: "Python Backend Developer",
    requiredSkills: ["Python", "FastAPI", "PostgreSQL", "REST APIs", "Docker", "Git"],
  },
  {
    title: "DevOps Engineer",
    requiredSkills: ["Linux", "Docker", "Kubernetes", "Terraform", "CI/CD", "AWS", "Monitoring", "Git"],
  },
  {
    title: "Cloud Architect",
    requiredSkills: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Serverless", "Linux"],
  },
  {
    title: "Data Engineer",
    requiredSkills: ["Python", "SQL", "PostgreSQL", "Apache Kafka", "Docker", "Data Modeling", "AWS"],
  },
  {
    title: "ML Engineer",
    requiredSkills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "Docker", "Pandas"],
  },
  {
    title: "NLP Specialist",
    requiredSkills: ["Python", "NLP", "Deep Learning", "TensorFlow", "Machine Learning", "Pandas"],
  },
  {
    title: "Site Reliability Engineer",
    requiredSkills: ["Linux", "Docker", "Kubernetes", "Monitoring", "CI/CD", "Go", "Nginx"],
  },
  {
    title: "API Developer",
    requiredSkills: ["Node.js", "TypeScript", "REST APIs", "GraphQL", "PostgreSQL", "Redis"],
  },
  {
    title: "Vue.js Developer",
    requiredSkills: ["Vue.js", "TypeScript", "JavaScript", "Tailwind CSS", "REST APIs", "Git"],
  },
  {
    title: "Platform Engineer",
    requiredSkills: ["Kubernetes", "Terraform", "Docker", "CI/CD", "AWS", "Linux", "Go"],
  },
  {
    title: "Data Analyst",
    requiredSkills: ["SQL", "Python", "Pandas", "PostgreSQL", "Data Modeling"],
  },
];

// ─── Companies (8) ─────────────────────────────────────────

const companies: CompanyDef[] = [
  {
    name: "Nexora Technologies",
    hiringFor: ["Senior Frontend Engineer", "Full Stack Developer", "DevOps Engineer"],
  },
  {
    name: "Verdant AI Labs",
    hiringFor: ["ML Engineer", "NLP Specialist", "Data Engineer"],
  },
  {
    name: "CloudScale Systems",
    hiringFor: ["Cloud Architect", "DevOps Engineer", "Platform Engineer"],
  },
  {
    name: "Dataflow Inc.",
    hiringFor: ["Data Engineer", "Backend Engineer", "Data Analyst"],
  },
  {
    name: "Webcraft Studios",
    hiringFor: ["Junior Frontend Developer", "Vue.js Developer", "Full Stack Developer"],
  },
  {
    name: "Infra Prime",
    hiringFor: ["Site Reliability Engineer", "Platform Engineer"],
  },
  {
    name: "APIFirst Co.",
    hiringFor: ["API Developer", "Backend Engineer", "Python Backend Developer"],
  },
  {
    name: "Quantum Leap Digital",
    hiringFor: ["Senior Frontend Engineer", "ML Engineer", "Cloud Architect"],
  },
];

// ─── Seed Functions ────────────────────────────────────────

async function clearDatabase(session: Session): Promise<void> {
  console.log("🗑️  Clearing all existing data...");
  await session.run("MATCH (n) DETACH DELETE n");
  console.log("   Done.");
}

async function createSkills(session: Session): Promise<void> {
  console.log(`📦 Creating ${skills.length} skills...`);

  // Create all skills in a single UNWIND query
  await session.run(
    `
    UNWIND $skills AS skill
    CREATE (s:Skill {name: skill.name, category: skill.category})
    `,
    { skills }
  );

  console.log(`   ✅ ${skills.length} skills created.`);
}

async function createRoles(session: Session): Promise<void> {
  console.log(`👔 Creating ${roles.length} roles...`);

  const roleTitles = roles.map((r) => ({ title: r.title }));
  await session.run(
    `
    UNWIND $roles AS role
    CREATE (r:Role {title: role.title})
    `,
    { roles: roleTitles }
  );

  console.log(`   ✅ ${roles.length} roles created.`);
}

async function createCompanies(session: Session): Promise<void> {
  console.log(`🏢 Creating ${companies.length} companies...`);

  const companyNames = companies.map((c) => ({ name: c.name }));
  await session.run(
    `
    UNWIND $companies AS company
    CREATE (c:Company {name: company.name})
    `,
    { companies: companyNames }
  );

  console.log(`   ✅ ${companies.length} companies created.`);
}

async function createPrerequisites(session: Session): Promise<void> {
  console.log(`🔗 Creating ${prerequisites.length} PREREQUISITE_OF relationships...`);

  await session.run(
    `
    UNWIND $rels AS rel
    MATCH (from:Skill {name: rel.from})
    MATCH (to:Skill {name: rel.to})
    CREATE (from)-[:PREREQUISITE_OF]->(to)
    `,
    { rels: prerequisites }
  );

  console.log(`   ✅ ${prerequisites.length} prerequisite relationships created.`);
}

async function createRelatedTo(session: Session): Promise<void> {
  console.log(`🔗 Creating ${relatedTo.length} RELATED_TO relationships...`);

  await session.run(
    `
    UNWIND $rels AS rel
    MATCH (from:Skill {name: rel.from})
    MATCH (to:Skill {name: rel.to})
    CREATE (from)-[:RELATED_TO]->(to)
    `,
    { rels: relatedTo }
  );

  console.log(`   ✅ ${relatedTo.length} related relationships created.`);
}

async function createRequires(session: Session): Promise<void> {
  const totalRels = roles.reduce((sum, r) => sum + r.requiredSkills.length, 0);
  console.log(`🔗 Creating ${totalRels} REQUIRES relationships...`);

  // Build flat list of { roleTitle, skillName } pairs
  const pairs = roles.flatMap((r) =>
    r.requiredSkills.map((s) => ({ roleTitle: r.title, skillName: s }))
  );

  await session.run(
    `
    UNWIND $pairs AS pair
    MATCH (r:Role {title: pair.roleTitle})
    MATCH (s:Skill {name: pair.skillName})
    CREATE (r)-[:REQUIRES]->(s)
    `,
    { pairs }
  );

  console.log(`   ✅ ${totalRels} requires relationships created.`);
}

async function createHiringFor(session: Session): Promise<void> {
  const totalRels = companies.reduce((sum, c) => sum + c.hiringFor.length, 0);
  console.log(`🔗 Creating ${totalRels} HIRING_FOR relationships...`);

  const pairs = companies.flatMap((c) =>
    c.hiringFor.map((r) => ({ companyName: c.name, roleTitle: r }))
  );

  await session.run(
    `
    UNWIND $pairs AS pair
    MATCH (c:Company {name: pair.companyName})
    MATCH (r:Role {title: pair.roleTitle})
    CREATE (c)-[:HIRING_FOR]->(r)
    `,
    { pairs }
  );

  console.log(`   ✅ ${totalRels} hiring relationships created.`);
}

async function createIndexes(session: Session): Promise<void> {
  console.log("📇 Creating indexes...");

  // Create indexes for faster lookups
  const indexes = [
    "CREATE INDEX skill_name IF NOT EXISTS FOR (s:Skill) ON (s.name)",
    "CREATE INDEX skill_category IF NOT EXISTS FOR (s:Skill) ON (s.category)",
    "CREATE INDEX role_title IF NOT EXISTS FOR (r:Role) ON (r.title)",
    "CREATE INDEX company_name IF NOT EXISTS FOR (c:Company) ON (c.name)",
  ];

  for (const idx of indexes) {
    try {
      await session.run(idx);
    } catch (err) {
      // Some databases may not support IF NOT EXISTS — that's fine
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("already exists")) {
        console.warn(`   ⚠️  Index skipped: ${msg}`);
      }
    }
  }

  console.log("   ✅ Indexes created.");
}

async function verifyCounts(session: Session): Promise<void> {
  console.log("\n📊 Verifying data...");

  const result = await session.run(`
    MATCH (s:Skill) WITH count(s) AS skills
    MATCH (r:Role) WITH skills, count(r) AS roles
    MATCH (c:Company) WITH skills, roles, count(c) AS companies
    RETURN skills, roles, companies
  `);

  const record = result.records[0];
  console.log(`   Skills:    ${record.get("skills")}`);
  console.log(`   Roles:     ${record.get("roles")}`);
  console.log(`   Companies: ${record.get("companies")}`);

  // Count relationships
  const relResult = await session.run(`
    MATCH ()-[r:PREREQUISITE_OF]->() WITH count(r) AS prereqs
    MATCH ()-[r2:RELATED_TO]->() WITH prereqs, count(r2) AS related
    MATCH ()-[r3:REQUIRES]->() WITH prereqs, related, count(r3) AS requires
    MATCH ()-[r4:HIRING_FOR]->() WITH prereqs, related, requires, count(r4) AS hiring
    RETURN prereqs, related, requires, hiring
  `);

  const relRecord = relResult.records[0];
  console.log(`   PREREQUISITE_OF: ${relRecord.get("prereqs")}`);
  console.log(`   RELATED_TO:      ${relRecord.get("related")}`);
  console.log(`   REQUIRES:        ${relRecord.get("requires")}`);
  console.log(`   HIRING_FOR:      ${relRecord.get("hiring")}`);
}

// ─── Main ──────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("");
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║       Skill Path Finder — Seed Script        ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("");

  const driver: Driver = neo4j.driver(
    BOLT_URI,
    neo4j.auth.basic(BOLT_USER, BOLT_PASSWORD)
  );

  const session: Session = driver.session();

  try {
    // Verify connection
    const info = await driver.getServerInfo();
    console.log(`✅ Connected to ${info.address}\n`);

    // Run seed steps
    await clearDatabase(session);
    await createIndexes(session);
    await createSkills(session);
    await createRoles(session);
    await createCompanies(session);
    await createPrerequisites(session);
    await createRelatedTo(session);
    await createRequires(session);
    await createHiringFor(session);
    await verifyCounts(session);

    console.log("\n🎉 Seed complete! Database is ready.\n");
  } catch (err) {
    console.error("\n❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
