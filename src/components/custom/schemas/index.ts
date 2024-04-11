import { z } from "zod";
import { Category } from "@prisma/client";

export const regenerateProjectApiKeySchema = z.object({
  projectId: z.string().min(1),
});

export const addProjectSchema = z.object({
  name: z.string().min(1),
});

export const changeProjectStatusSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  isActive: z.boolean(),
});

export const addUsernameToProjectSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

export const removeUserFromProjectSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

export const getAllEventsWithFilterSchema = z.object({
  projectId: z.string().min(1),
  filter: z.nativeEnum(Category),
});

export const addEventToProjectSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().min(1),
  happendAt: z.date().optional(),
  category: z.nativeEnum(Category),
});

export const removeEventFromProjectSchema = z.object({
  projectId: z.string().min(1),
  eventId: z.string().min(1),
});

export const getProjectEventsSchema = z.object({
  projectId: z.string().min(1),
  offset: z.number().int().optional().default(0),
});

export const addRandomEventToProjectSchema = z.object({
  projectId: z.string().min(1),
  howMany: z.number().int().min(1),
});

export const deleteProjectSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

export const getAllEventsSchema = z.object({
  projectId: z.string().min(1),
});
