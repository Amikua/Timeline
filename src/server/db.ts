import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: env.NODE_ENV !== "development" ? ["error"]
      : env.DB_LOG === "verbose"
        ? [{ emit: "event", level: "query" }]
        : env.DB_LOG === "basic"
        ? ["query"]
        : undefined 
  });
  if (env.NODE_ENV === "development" && env.DB_LOG === "verbose") {
    // @ts-expect-error If DB_LOG is verbose then we will have query and duration
    client.$on("query", (e) => {
    // @ts-expect-error If DB_LOG is verbose then we will have query and duration
      console.log("Query: ", e.query);
    // @ts-expect-error If DB_LOG is verbose then we will have query and duration
      console.log("Duration: ", e.duration);
    })
  }
  return client
}
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
