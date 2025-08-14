import { z } from 'zod';

// Task status enum
export const taskStatusSchema = z.enum(['pending', 'completed']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  status: taskStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Input schema for creating tasks
export const createTaskInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().nullable()
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

// Input schema for updating tasks
export const updateTaskInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().nullable().optional(),
  status: taskStatusSchema.optional()
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

// Input schema for deleting tasks
export const deleteTaskInputSchema = z.object({
  id: z.number()
});

export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;

// Input schema for getting tasks with filtering
export const getTasksInputSchema = z.object({
  status: taskStatusSchema.optional()
});

export type GetTasksInput = z.infer<typeof getTasksInputSchema>;

// Input schema for marking task status
export const updateTaskStatusInputSchema = z.object({
  id: z.number(),
  status: taskStatusSchema
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusInputSchema>;