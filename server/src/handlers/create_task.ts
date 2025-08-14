import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput, type Task } from '../schema';

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  try {
    // Insert task record with default status 'pending' and auto-generated timestamps
    const result = await db.insert(tasksTable)
      .values({
        title: input.title,
        description: input.description,
        // status defaults to 'pending' as defined in schema
        // created_at and updated_at are auto-generated with defaultNow()
      })
      .returning()
      .execute();

    const task = result[0];
    return {
      ...task,
      // Convert timestamps to Date objects for consistency with Zod schema
      created_at: new Date(task.created_at),
      updated_at: new Date(task.updated_at)
    };
  } catch (error) {
    console.error('Task creation failed:', error);
    throw error;
  }
};