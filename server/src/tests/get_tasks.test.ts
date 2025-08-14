import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type GetTasksInput, type CreateTaskInput } from '../schema';
import { getTasks } from '../handlers/get_tasks';

// Helper function to create a task directly in database
const createTaskInDB = async (title: string, description?: string | null, status: 'pending' | 'completed' = 'pending') => {
  const result = await db.insert(tasksTable)
    .values({
      title,
      description,
      status
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all tasks when no filter is provided', async () => {
    // Create test tasks
    await createTaskInDB('Task 1', 'First task', 'pending');
    await createTaskInDB('Task 2', 'Second task', 'completed');
    await createTaskInDB('Task 3', null, 'pending');

    const result = await getTasks();

    expect(result).toHaveLength(3);
    expect(result.map(t => t.title)).toContain('Task 1');
    expect(result.map(t => t.title)).toContain('Task 2');
    expect(result.map(t => t.title)).toContain('Task 3');
  });

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should filter tasks by pending status', async () => {
    // Create test tasks with different statuses
    await createTaskInDB('Pending Task 1', 'First pending', 'pending');
    await createTaskInDB('Completed Task', 'Completed task', 'completed');
    await createTaskInDB('Pending Task 2', 'Second pending', 'pending');

    const input: GetTasksInput = { status: 'pending' };
    const result = await getTasks(input);

    expect(result).toHaveLength(2);
    result.forEach(task => {
      expect(task.status).toEqual('pending');
    });
    expect(result.map(t => t.title)).toContain('Pending Task 1');
    expect(result.map(t => t.title)).toContain('Pending Task 2');
  });

  it('should filter tasks by completed status', async () => {
    // Create test tasks with different statuses
    await createTaskInDB('Pending Task', 'Pending task', 'pending');
    await createTaskInDB('Completed Task 1', 'First completed', 'completed');
    await createTaskInDB('Completed Task 2', 'Second completed', 'completed');

    const input: GetTasksInput = { status: 'completed' };
    const result = await getTasks(input);

    expect(result).toHaveLength(2);
    result.forEach(task => {
      expect(task.status).toEqual('completed');
    });
    expect(result.map(t => t.title)).toContain('Completed Task 1');
    expect(result.map(t => t.title)).toContain('Completed Task 2');
  });

  it('should return empty array when filtering by status with no matches', async () => {
    // Create only pending tasks
    await createTaskInDB('Pending Task', 'Only pending', 'pending');

    const input: GetTasksInput = { status: 'completed' };
    const result = await getTasks(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return tasks ordered by created_at descending (newest first)', async () => {
    // Create tasks with slight delays to ensure different timestamps
    const task1 = await createTaskInDB('First Task', 'Created first', 'pending');
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const task2 = await createTaskInDB('Second Task', 'Created second', 'pending');
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const task3 = await createTaskInDB('Third Task', 'Created third', 'completed');

    const result = await getTasks();

    expect(result).toHaveLength(3);
    
    // Should be ordered newest first
    expect(result[0].title).toEqual('Third Task');
    expect(result[1].title).toEqual('Second Task');
    expect(result[2].title).toEqual('First Task');
    
    // Verify the ordering by comparing timestamps
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should return correct task structure with all fields', async () => {
    const task = await createTaskInDB('Test Task', 'Test description', 'pending');

    const result = await getTasks();

    expect(result).toHaveLength(1);
    
    const returnedTask = result[0];
    expect(returnedTask.id).toBeDefined();
    expect(typeof returnedTask.id).toBe('number');
    expect(returnedTask.title).toEqual('Test Task');
    expect(returnedTask.description).toEqual('Test description');
    expect(returnedTask.status).toEqual('pending');
    expect(returnedTask.created_at).toBeInstanceOf(Date);
    expect(returnedTask.updated_at).toBeInstanceOf(Date);
  });

  it('should handle tasks with null description', async () => {
    await createTaskInDB('Task with null desc', null, 'completed');

    const result = await getTasks();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Task with null desc');
    expect(result[0].description).toBeNull();
    expect(result[0].status).toEqual('completed');
  });

  it('should work with undefined input parameter', async () => {
    await createTaskInDB('Test Task', 'Test description', 'pending');

    // Call without any input parameter
    const result = await getTasks(undefined);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Test Task');
  });
});