import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskStatusInput, type CreateTaskInput } from '../schema';
import { updateTaskStatus } from '../handlers/update_task_status';
import { eq } from 'drizzle-orm';

// Helper function to create a test task
const createTestTask = async (): Promise<number> => {
  const result = await db.insert(tasksTable)
    .values({
      title: 'Test Task',
      description: 'A task for testing',
      status: 'pending'
    })
    .returning()
    .execute();
  
  return result[0].id;
};

describe('updateTaskStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task status from pending to completed', async () => {
    // Create a test task
    const taskId = await createTestTask();
    
    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    const result = await updateTaskStatus(input);

    // Verify the returned task
    expect(result.id).toEqual(taskId);
    expect(result.status).toEqual('completed');
    expect(result.title).toEqual('Test Task');
    expect(result.description).toEqual('A task for testing');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Verify updated_at is recent (within the last second)
    const timeDiff = Date.now() - result.updated_at.getTime();
    expect(timeDiff).toBeLessThan(1000);
  });

  it('should update task status from completed to pending', async () => {
    // Create a completed task
    const result = await db.insert(tasksTable)
      .values({
        title: 'Completed Task',
        description: null,
        status: 'completed'
      })
      .returning()
      .execute();
    
    const taskId = result[0].id;
    const originalUpdatedAt = result[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'pending'
    };

    const updatedTask = await updateTaskStatus(input);

    // Verify the status change
    expect(updatedTask.id).toEqual(taskId);
    expect(updatedTask.status).toEqual('pending');
    expect(updatedTask.title).toEqual('Completed Task');
    expect(updatedTask.description).toBeNull();
    
    // Verify updated_at timestamp was actually updated
    expect(updatedTask.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should persist changes to database', async () => {
    // Create a test task
    const taskId = await createTestTask();
    
    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    await updateTaskStatus(input);

    // Query the database directly to verify persistence
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toEqual('completed');
    expect(tasks[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when task does not exist', async () => {
    const input: UpdateTaskStatusInput = {
      id: 9999, // Non-existent task ID
      status: 'completed'
    };

    await expect(updateTaskStatus(input)).rejects.toThrow(/Task with id 9999 not found/i);
  });

  it('should handle task with null description', async () => {
    // Create task with null description
    const result = await db.insert(tasksTable)
      .values({
        title: 'Task with null description',
        description: null,
        status: 'pending'
      })
      .returning()
      .execute();
    
    const taskId = result[0].id;

    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    const updatedTask = await updateTaskStatus(input);

    expect(updatedTask.id).toEqual(taskId);
    expect(updatedTask.status).toEqual('completed');
    expect(updatedTask.description).toBeNull();
    expect(updatedTask.title).toEqual('Task with null description');
  });

  it('should not modify other task fields', async () => {
    // Create a test task
    const originalResult = await db.insert(tasksTable)
      .values({
        title: 'Original Title',
        description: 'Original Description',
        status: 'pending'
      })
      .returning()
      .execute();
    
    const taskId = originalResult[0].id;
    const originalCreatedAt = originalResult[0].created_at;

    const input: UpdateTaskStatusInput = {
      id: taskId,
      status: 'completed'
    };

    const updatedTask = await updateTaskStatus(input);

    // Verify only status and updated_at changed
    expect(updatedTask.title).toEqual('Original Title');
    expect(updatedTask.description).toEqual('Original Description');
    expect(updatedTask.created_at.getTime()).toEqual(originalCreatedAt.getTime());
    expect(updatedTask.status).toEqual('completed');
    expect(updatedTask.updated_at.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
  });
});