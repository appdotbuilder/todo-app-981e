import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskStatusInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTaskStatus = async (input: UpdateTaskStatusInput): Promise<Task> => {
  try {
    // Update the task status and updated_at timestamp
    const result = await db.update(tasksTable)
      .set({
        status: input.status,
        updated_at: new Date() // Explicitly update the timestamp
      })
      .where(eq(tasksTable.id, input.id))
      .returning()
      .execute();

    // Check if task was found and updated
    if (result.length === 0) {
      throw new Error(`Task with id ${input.id} not found`);
    }

    // Return the updated task
    return result[0];
  } catch (error) {
    console.error('Task status update failed:', error);
    throw error;
  }
};