import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Use process.env (not env()) so `prisma generate` works when DATABASE_URL
    // is unset at build time (e.g. Vercel postinstall before env vars are wired).
    url: process.env.DATABASE_URL ?? "",
  },
});
