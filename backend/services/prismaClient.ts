import { PrismaClient } from "@prisma/client";

// Single shared instance — Prisma v6 reads DATABASE_URL from schema automatically
const prisma = new PrismaClient();

export default prisma;
