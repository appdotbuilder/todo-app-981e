import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput, type CreateTaskInput } from '../schema';
import { updateTask } from '../handlers/update_task';
import { eq } from 'drizzle-orm';

// Helper function to create a test task
const createTestTask = async (taskData: Partial<CreateTaskInput> = {}) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'A task for testing'
  };

  const result = await db.insert(tasksTable)
    .values({ ...defaultTask, ...taskData })
    .returning()
    .execute();

  return result[0];
};

describe('updateTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task title only', async () => {
    // Create a test task
    const task = await createTestTask();
    const originalUpdatedAt = task.updated_at;

    // Update only the title
    const updateInput: UpdateTaskInput = {
      id: task.id,
      title: 'Updated Task Title'
    };

    const result = await updateTask(updateInput);

    // Verify the updated task
    expect(result.id).toEqual(task.id);
    expect(result.title).toEqual('Updated Task Title');
    expect(result.description).toEqual(task.description); // Should remain unchanged
    expect(result.status).toEqual(task.status); // Should remain unchanged
    expect(result.created_at).toEqual(task.created_at); // Should remain unchanged
    expect(result.updated_at).not.toEqual(originalUpdatedAt); // Should be updated
  });

  it('should update task description only', async () => {
    const task = await createTestTask();

    const updateInput: UpdateTaskInput = {
      id: task.id,
      description: 'Updated description'
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.title).toEqual(task.title); // Should remain unchanged
    expect(result.description).toEqual('Updated description');
    expect(result.status).toEqual(task.status); // Should remain unchanged
  });

  it('should update task status only', async () => {
    const task = await createTestTask();

    const updateInput: UpdateTaskInput = {
      id: task.id,
      status: 'completed'
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.title).toEqual(task.title); // Should remain unchanged
    expect(result.description).toEqual(task.description); // Should remain unchanged
    expect(result.status).toEqual('completed');
  });

  it('should update multiple fields at once', async () => {
    const task = await createTestTask();

    const updateInput: UpdateTaskInput = {
      id: task.id,
      title: 'New Title',
      description: 'New description',
      status: 'completed'
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.title).toEqual('New Title');
    expect(result.description).toEqual('New description');
    expect(result.status).toEqual('completed');
    expect(result.created_at).toEqual(task.created_at); // Should remain unchanged
  });

  it('should handle null description update', async () => {
    const task = await createTestTask();

    const updateInput: UpdateTaskInput = {
      id: task.id,
      description: null
    };

    const result = await updateTask(updateInput);

    expect(result.id).toEqual(task.id);
    expect(result.description).toBeNull();
  });

  it('should save updated task to database', async () => {
    const task = await createTestTask();

    const updateInput: UpdateTaskInput = {
      id: task.id,
      title: 'Database Test Title',
      status: 'completed'
    };

    await updateTask(updateInput);

    // Query the database to verify the update was persisted
    const updatedTasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task.id))
      .execute();

    expect(updatedTasks).toHaveLength(1);
    expect(updatedTasks[0].title).toEqual('Database Test Title');
    expect(updatedTasks[0].status).toEqual('completed');
  });

  it('should always update the updated_at timestamp', async () => {
    const task = await createTestTask();
    const originalUpdatedAt = task.updated_at;

    // Small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateTaskInput = {
      id: task.id,
      title: 'Time Update Test'
    };

    const result = await updateTask(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when task does not exist', async () => {
    const nonExistentId = 99999;

    const updateInput: UpdateTaskInput = {
      id: nonExistentId,
      title: 'This should fail'
    };

    await expect(updateTask(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle updating task with only id provided', async () => {
    const task = await createTestTask();
    const originalUpdatedAt = task.updated_at;

    // Small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateTaskInput = {
      id: task.id
      // No other fields provided - only updated_at should change
    };

    const result = await updateTask(updateInput);

    // All original fields should remain the same except updated_at
    expect(result.id).toEqual(task.id);
    expect(result.title).toEqual(task.title);
    expect(result.description).toEqual(task.description);
    expect(result.status).toEqual(task.status);
    expect(result.created_at).toEqual(task.created_at);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});