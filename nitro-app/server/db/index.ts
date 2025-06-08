// import { drizzle } from 'drizzle-orm/pglite';

// export const db = drizzle(process.env.DATABASE_URL as string);

import { createDatabase } from "db0";
import sqlite from "db0/connectors/better-sqlite3";
import { drizzle } from "db0/integrations/drizzle";

// Initialize DB instance
// You can use any other available connector
const initDB = createDatabase(sqlite({}));

// And then leverage drizzle typed API to make more advanced ones
export const db = drizzle(initDB);
