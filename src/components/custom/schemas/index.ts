import { z } from "zod"
import { Category } from "@prisma/client";

export const addProjectValidation = z.object({
  name: z.string().min(1),
});

export const changeProjectStatusValidation = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  isActive: z.boolean(),
});

export const addUsernameToProjectValidation = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

export const removeUserFromProjectValidation = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
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

export const deleteProjectValidation = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
});

export const getAllEventsValidation = z.object({
  projectId: z.string().min(1),
});

