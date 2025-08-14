import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput, type Task } from '../schema';
import { eq } from 'drizzle-orm';

export const updateTask = async (input: UpdateTaskInput): Promise<Task> => {
  try {
    // Build the update values dynamically based on provided fields
    const updateValues: { [key: string]: any } = {
      updated_at: new Date() // Always update the timestamp
    };

    // Only include fields that are explicitly provided
    if (input.title !== undefined) {
      updateValues['title'] = input.title;
    }
    
    if (input.description !== undefined) {
      updateValues['description'] = input.description;
    }
    
    if (input.status !== undefined) {
      updateValues['status'] = input.status;
    }

    // Update the task in the database
    const result = await db.update(tasksTable)
      .set(updateValues)
      .where(eq(tasksTable.id, input.id))
      .returning()
      .execute();

    // Check if the task was found and updated
    if (result.length === 0) {
      throw new Error(`Task with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Task update failed:', error);
    throw error;
  }
};