import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput } from '../schema';
import { createTask } from '../handlers/create_task';
import { eq } from 'drizzle-orm';

// Simple test input with required fields
const testInput: CreateTaskInput = {
  title: 'Test Task',
  description: 'A task for testing'
};

// Test input with null description
const testInputNullDescription: CreateTaskInput = {
  title: 'Task without description',
  description: null
};

describe('createTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a task with description', async () => {
    const result = await createTask(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Task');
    expect(result.description).toEqual('A task for testing');
    expect(result.status).toEqual('pending'); // Default status
    expect(result.id).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a task with null description', async () => {
    const result = await createTask(testInputNullDescription);

    expect(result.title).toEqual('Task without description');
    expect(result.description).toBeNull();
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save task to database correctly', async () => {
    const result = await createTask(testInput);

    // Query using proper drizzle syntax
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks).toHaveLength(1);
    const savedTask = tasks[0];
    expect(savedTask.title).toEqual('Test Task');
    expect(savedTask.description).toEqual('A task for testing');
    expect(savedTask.status).toEqual('pending');
    expect(savedTask.created_at).toBeInstanceOf(Date);
    expect(savedTask.updated_at).toBeInstanceOf(Date);
  });

  it('should auto-generate timestamps correctly', async () => {
    const beforeCreation = new Date();
    const result = await createTask(testInput);
    const afterCreation = new Date();

    // Verify timestamps are within reasonable range
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000); // Allow 1s margin
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);
  });

  it('should set default status to pending', async () => {
    const result = await createTask(testInput);

    expect(result.status).toEqual('pending');

    // Verify in database as well
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks[0].status).toEqual('pending');
  });

  it('should generate unique sequential IDs', async () => {
    const task1 = await createTask({ title: 'Task 1', description: null });
    const task2 = await createTask({ title: 'Task 2', description: 'Second task' });

    expect(task1.id).toBeDefined();
    expect(task2.id).toBeDefined();
    expect(task1.id).not.toEqual(task2.id);
    expect(task2.id).toBeGreaterThan(task1.id); // Serial IDs should be sequential
  });

  it('should handle special characters in title and description', async () => {
    const specialInput: CreateTaskInput = {
      title: 'Task with "quotes" & special chars: <>',
      description: 'Description with\nnewlines and\ttabs'
    };

    const result = await createTask(specialInput);

    expect(result.title).toEqual('Task with "quotes" & special chars: <>');
    expect(result.description).toEqual('Description with\nnewlines and\ttabs');

    // Verify in database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, result.id))
      .execute();

    expect(tasks[0].title).toEqual(specialInput.title);
    expect(tasks[0].description).toEqual(specialInput.description);
  });
});