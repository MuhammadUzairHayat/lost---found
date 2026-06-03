import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/** True when the cached client matches the current generated schema. */
function isPrismaClientCurrent(client: PrismaClient | undefined): boolean {
  if (!client?.comment || !client.handMessage) return false;
  return "important" in Prisma.PostScalarFieldEnum;
}

/** Returns a Prisma client, recreating the singleton after schema/client changes. */
export function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (isPrismaClientCurrent(existing)) {
    return existing!;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

/** Lazy proxy so imports always resolve the current singleton (survives HMR). */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
