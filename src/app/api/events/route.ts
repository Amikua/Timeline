import { z } from "zod";
import { db } from "~/server/db";
import { Category } from "@prisma/client";
import Bugsnag from "@bugsnag/js";
import { initBugsnag } from "~/lib/bugsnag";

const schema = z.object({
  apiKey: z.string().min(1),
  content: z.string().min(1),
  happenedAt: z.date().optional(),
  category: z.nativeEnum(Category),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const validatedBody = schema.parse(await request.json());

    const query = await db.apiKey.findUnique({
      select: {
        project: {
          select: {
            isActive: true,
          },
        },
        userId: true,
        projectId: true,
        apiKey: true,
      },
      where: {
        apiKey: validatedBody.apiKey,
      },
    });

    if (!query) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    if (!query?.project?.isActive) {
      return new Response(null, {
        status: 403,
        statusText: "Forbidden: Project is not active",
      });
    }

    await db.projectEvent.create({
      data: {
        content: validatedBody.content,
        category: validatedBody.category,
        happendAt: validatedBody.happenedAt,
        author: {
          connect: {
            id: query.userId,
          },
        },
        Project: {
          connect: {
            id: query.projectId,
          },
        },
      },
    });
    return new Response(null, {
      statusText: "Created",
      status: 201,
    });
  } catch (error) {
    if (error instanceof Error) {
      initBugsnag();
      Bugsnag.notify(error);
      return new Response(null, {
        status: 400,
        statusText: `Bad Request: ${JSON.stringify(error.message)}`,
      });
    }
    return new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }
}
