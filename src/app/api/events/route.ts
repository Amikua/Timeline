import { addEventToProjectSchema } from "~/components/custom/schemas";
import { z } from "zod";
import { db } from "~/server/db";

const schema = z.object({
  apiKey: z.string().min(1),
  username: z.string().min(1),
});

export async function POST(request: Request): Promise<Response> {
  try {
    const validatedBody = addEventToProjectSchema
      .merge(schema)
      .parse(await request.json());
    
    const project = await db.project.findFirst({
      select: {
        apiKey: true,
        isActive: true,
      },
      where: {
        id: validatedBody.projectId,
      },
    });

    if (!project) {
      return new Response(null, {
        status: 404,
        statusText: "Project Not Found",
      });
    }

    if (project.apiKey !== validatedBody.apiKey ) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    if (!project.isActive) {
      return new Response(null, {
        status: 403,
        statusText: "Forbidden",
      });
    }

    await db.projectEvent.create({
      data: {
        content: validatedBody.content,
        category: validatedBody.category,
        author: {
          connect: {
            username: validatedBody.username,
          }
        },
        Project: {
          connect: {
            id: validatedBody.projectId,
          }
        }
      }
    })
    return new Response(null, {
      statusText: "Created",
      status: 201,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
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
