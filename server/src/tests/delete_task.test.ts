import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a task first
    const taskData = {
      title: 'Task to Delete',
      description: 'This task will be deleted'
    };

    const createResult = await db.insert(tasksTable)
      .values(taskData)
      .returning()
      .execute();

    const createdTask = createResult[0];

    // Delete the task
    const deleteInput: DeleteTaskInput = {
      id: createdTask.id
    };

    const result = await deleteTask(deleteInput);

    // Verify the response
    expect(result.success).toBe(true);
    expect(result.id).toBe(createdTask.id);

    // Verify the task is deleted from database
    const deletedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(deletedTask).toHaveLength(0);
  });

  it('should throw error when task does not exist', async () => {
    const nonExistentId = 99999;
    const deleteInput: DeleteTaskInput = {
      id: nonExistentId
    };

    await expect(deleteTask(deleteInput)).rejects.toThrow(/not found/i);
  });

  it('should delete task with null description', async () => {
    // Create a task with null description
    const taskData = {
      title: 'Task with Null Description',
      description: null
    };

    const createResult = await db.insert(tasksTable)
      .values(taskData)
      .returning()
      .execute();

    const createdTask = createResult[0];

    // Delete the task
    const deleteInput: DeleteTaskInput = {
      id: createdTask.id
    };

    const result = await deleteTask(deleteInput);

    // Verify the response
    expect(result.success).toBe(true);
    expect(result.id).toBe(createdTask.id);

    // Verify the task is deleted from database
    const deletedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(deletedTask).toHaveLength(0);
  });

  it('should delete task with completed status', async () => {
    // Create a completed task
    const taskData = {
      title: 'Completed Task',
      description: 'This completed task will be deleted',
      status: 'completed' as const
    };

    const createResult = await db.insert(tasksTable)
      .values(taskData)
      .returning()
      .execute();

    const createdTask = createResult[0];

    // Delete the task
    const deleteInput: DeleteTaskInput = {
      id: createdTask.id
    };

    const result = await deleteTask(deleteInput);

    // Verify the response
    expect(result.success).toBe(true);
    expect(result.id).toBe(createdTask.id);

    // Verify the task is deleted from database
    const deletedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(deletedTask).toHaveLength(0);
  });

  it('should not affect other tasks when deleting one task', async () => {
    // Create multiple tasks
    const task1Data = {
      title: 'Task 1',
      description: 'First task'
    };

    const task2Data = {
      title: 'Task 2',
      description: 'Second task'
    };

    const createResult1 = await db.insert(tasksTable)
      .values(task1Data)
      .returning()
      .execute();

    const createResult2 = await db.insert(tasksTable)
      .values(task2Data)
      .returning()
      .execute();

    const task1 = createResult1[0];
    const task2 = createResult2[0];

    // Delete only the first task
    const deleteInput: DeleteTaskInput = {
      id: task1.id
    };

    const result = await deleteTask(deleteInput);

    // Verify the first task is deleted
    expect(result.success).toBe(true);
    expect(result.id).toBe(task1.id);

    const deletedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task1.id))
      .execute();

    expect(deletedTask).toHaveLength(0);

    // Verify the second task still exists
    const remainingTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, task2.id))
      .execute();

    expect(remainingTask).toHaveLength(1);
    expect(remainingTask[0].title).toBe('Task 2');
  });
});