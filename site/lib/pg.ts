import { Pool } from "pg";

const globalForPg = globalThis as unknown as { _pgPoolPartage?: Pool };

export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!globalForPg._pgPoolPartage) {
    const local =
      connectionString.includes("localhost") ||
      connectionString.includes("127.0.0.1");
    globalForPg._pgPoolPartage = new Pool({
      connectionString,
      ssl: local ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return globalForPg._pgPoolPartage;
}
