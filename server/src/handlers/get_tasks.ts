import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type GetTasksInput, type Task } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getTasks = async (input?: GetTasksInput): Promise<Task[]> => {
  try {
    // Build query with conditional where clause
    const baseQuery = db.select().from(tasksTable);
    
    const query = input?.status
      ? baseQuery.where(eq(tasksTable.status, input.status))
      : baseQuery;

    // Apply ordering and execute
    const results = await query
      .orderBy(desc(tasksTable.created_at))
      .execute();

    // Return results directly - no numeric conversion needed for this schema
    return results;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
};