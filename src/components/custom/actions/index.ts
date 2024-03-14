"use server";
import { lucia, validateRequest } from "~/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { action } from "~/lib/safe-action";

const addProjectValidation = z.object({
  name: z.string().min(1),
});

const addUsernameToProjectValidation = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

const removeUserFromProjectValidation = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

export const addUserToProject = action(
  addUsernameToProjectValidation,
  async ({ id, projectId }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }
    await db.project.update({
      where: { id: projectId },
      data: { users: { connect: { id } } },
    });

    revalidatePath(`/dashboard`);
  },
);

export const removeUserFromProject = action(
  removeUserFromProjectValidation,
  async ({ id, projectId }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }
    const project = await db.project.findFirst({
      where: { id: projectId },
      include: { _count: { select: { users: true } } },
    });
    if (!project || project?._count.users < 2) {
      return { error: "To few users" };
    }
    await db.project.update({
      where: { id: projectId },
      data: { users: { disconnect: { id } } },
    });

    revalidatePath(`/dashboard`);
  },
);

export async function addProjectAction(formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      error: "Unauthorized",
    };
  }
  const validatedFields = addProjectValidation.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const { id } = await db.project.create({
    data: {
      name: validatedFields.data.name,
      events: {
        create: {
          authorId: user.id,
          content: `Created project ${validatedFields.data.name}`,
        },
      },
      author: {
        connect: {
          id: user.id,
        },
      },
      users: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  revalidatePath("/");
  redirect(`/dashboard/${id}`);
}

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

interface ActionResult {
  error: string | null;
}
