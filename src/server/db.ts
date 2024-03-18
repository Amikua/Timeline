import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    // log: env.NODE_ENV === "development" ? [{
    //   emit: 'event',
    //   level: 'query',
    // },] : ["error"],
  });
  // if (env.NODE_ENV === "development") {
  //   client.$on("query", (e) => {
  //     console.log("Query: ", e.query);
  //     console.log("Duration: ", e.duration);
  //   })
  // }
  return client
}
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
