/**
 * Initializes and exports a Prisma client instance for database access.
 * Creates a global `db` variable that can be reused across requests in development.
 * In production, a new client will be created for each request.
 */
import { PrismaClient } from '@prisma/client';

interface CustomNodeJSGlobal extends NodeJS.Global {
  db: PrismaClient;
}
declare const global: CustomNodeJSGlobal;

const db = global.db || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.db = db;
export default db;
