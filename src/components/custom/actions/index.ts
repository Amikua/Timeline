"use server";
import { lucia, validateRequest } from "~/lib/auth";
import { revalidatePath, unstable_cache } from "next/cache";
import { db } from "~/server/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { action } from "~/lib/safe-action";
import { readEmails } from "~/lib/mail";
import { env } from "~/env";
import { EVENTS_PER_REQUEST } from "~/constants";
import {
  getAllEventsSchema,
  addRandomEventToProjectSchema,
  getProjectEventsSchema,
  removeEventFromProjectSchema,
  changeProjectStatusSchema,
  deleteProjectSchema,
  addUsernameToProjectSchema,
  removeUserFromProjectSchema,
  addEventToProjectSchema,
  addProjectSchema,
  getAllEventsWithFilterSchema,
} from "../schemas";

export const checkForEventFromEmailCached = unstable_cache(
  checkForEventFromEmail,
  ["checkForEventFromEmail"],
  {
    revalidate: env.READ_EMAILS_EVERY_N_SECONDS,
  },
);

export async function checkForEventFromEmail() {
  if (!env.GMAIL_USERNAME || !env.GMAIL_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_PASSWORD not found in env");
    return;
  }

  try {
    await readEmails(env.GMAIL_USERNAME, env.GMAIL_PASSWORD);
    revalidatePath("/");
  } catch (err) {
    // console.error(err);
  }
  return {};
}

export const getAllEvents = action(
  getAllEventsSchema,
  async ({ projectId }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unathorized",
      };
    }
    const events = await db.projectEvent.findMany({
      where: { id: projectId },
      orderBy: { happendAt: "desc" },
      include: { author: true },
    });
    return events;
  },
);

export const addRandomEventsToProject = action(
  addRandomEventToProjectSchema,
  async ({ projectId, howMany }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }
    try {
      await db.projectEvent.createMany({
        data: Array.from({ length: howMany }, () => ({
          content: `Random event`,
          happendAt: new Date(
            Math.floor(Math.random() * (Date.now() - 946684800000)) +
              946684800000,
          ),
          projectId,
          authorId: user.id,
          category: "WIP",
        })),
      });
    } catch (err) {
      console.error(err);
      revalidatePath(`/dashboard/${projectId}`);
      return {
        error: "Error creating event",
      };
    }
  },
);

export const getProjectEvents = action(
  getProjectEventsSchema,
  async ({ projectId, offset }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }

    const events = await db.projectEvent.findMany({
      where: {
        projectId,
      },
      orderBy: { happendAt: "desc" },
      skip: offset,
      take: EVENTS_PER_REQUEST,
      include: { author: true },
    });

    return {
      events,
      hasMore: events.length === EVENTS_PER_REQUEST,
    };
  },
);

export const getAllProjectEventsWithFilter = action(
  getAllEventsWithFilterSchema,
  async ({ projectId, filter }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }

    const events = await db.projectEvent.findMany({
      where: {
        projectId,
        category: filter,
      },
      orderBy: { happendAt: "desc" },
      include: { author: true },
    });

    return {
      events,
      hasMore: false,
    };
  },
);

export const removeEventFromProject = action(
  removeEventFromProjectSchema,
  async ({ projectId, eventId }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }
    try {
      await db.projectEvent.delete({
        where: { id: eventId, authorId: user.id },
      });

      revalidatePath(`/dashboard/${projectId}`);
    } catch (err) {
      console.error(err);
      revalidatePath(`/dashboard/${projectId}`);
      return {
        error: "Error deleting event",
      };
    }
  },
);

export const changeProjectStatus = action(
  changeProjectStatusSchema,
  async ({ projectId, isActive }) => {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }

    await db.project.update({
      where: {
        id: projectId,
      },
      data: {
        isActive,
      },
    });
    revalidatePath(`/dashboard`);
  },
);

export const deleteProject = action(
  deleteProjectSchema,
  async ({ projectId }) => {
    const { user } = await validateRequest();
    if (!user) {
      return { error: "Unauthorized" };
    }
    await db.project.delete({
      where: { id: projectId },
    });
    revalidatePath(`/dashboard`);
  },
);

export const addUserToProject = action(
  addUsernameToProjectSchema,
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
  removeUserFromProjectSchema,
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

export const addEventToProject = action(
  addEventToProjectSchema,
  async ({ projectId, content, happendAt, category }) => {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }
    try {
      const project = await db.project.findFirst({
        where: { id: projectId },
        select: { isActive: true },
      });
      if (!project?.isActive) {
        return {
          error: "Project is not active",
        };
      }
      const event = await db.projectEvent.create({
        data: {
          content,
          happendAt,
          category,
          author: {
            connect: {
              id: user.id,
            },
          },
          Project: {
            connect: {
              id: projectId,
            },
          },
        },
        include: { author: true },
      });
      revalidatePath(`/dashboard/${projectId}`);
      return { event };
    } catch (err) {
      console.error(err);
      revalidatePath(`/dashboard/${projectId}`);
      return {
        error: "Error creating event",
      };
    }
  },
);

export async function addProjectAction(formData: FormData) {
  const { user } = await validateRequest();
  if (!user) {
    return {
      error: "Unauthorized",
    };
  }
  const validatedFields = addProjectSchema.safeParse({
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
          category: "TADA",
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
