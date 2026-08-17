import neo4j, { Driver } from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const BOLT_URI = process.env.BOLT_URI;
const BOLT_USER = process.env.BOLT_USER;
const BOLT_PASSWORD = process.env.BOLT_PASSWORD;

if (!BOLT_URI || !BOLT_USER || !BOLT_PASSWORD) {
  console.error(
    "❌ Missing required environment variables: BOLT_URI, BOLT_USER, BOLT_PASSWORD"
  );
  console.error("   Copy .env.example to .env and fill in your CognoDB credentials.");
  process.exit(1);
}

let driver: Driver;

try {
  driver = neo4j.driver(BOLT_URI, neo4j.auth.basic(BOLT_USER, BOLT_PASSWORD), {
    disableLosslessIntegers: true,
  });
} catch (error) {
  console.error("❌ Failed to create Neo4j driver:", error);
  process.exit(1);
}

/**
 * Verify database connectivity.
 * Returns { connected: true, latencyMs } on success,
 * or { connected: false, error } on failure.
 */
export async function verifyConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const serverInfo = await driver.getServerInfo();
    const latencyMs = Date.now() - start;
    console.log(
      `✅ Connected to CognoDB at ${serverInfo.address} (${latencyMs}ms)`
    );
    return { connected: true, latencyMs };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Database connection failed: ${message}`);
    return { connected: false, error: message };
  }
}

/**
 * Get the Neo4j driver instance.
 */
export function getDriver(): Driver {
  return driver;
}

/**
 * Gracefully close the driver connection.
 */
export async function closeDriver(): Promise<void> {
  try {
    await driver.close();
    console.log("🔌 Neo4j driver closed.");
  } catch (err) {
    console.error("Error closing Neo4j driver:", err);
  }
}
