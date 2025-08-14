import { type DeleteTaskInput } from '../schema';

export const deleteTask = async (input: DeleteTaskInput): Promise<{ success: boolean; id: number }> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is deleting a task from the database by its ID.
    // Should throw an error if the task with the given ID doesn't exist.
    // Returns a success response with the deleted task ID.
    return Promise.resolve({
        success: true,
        id: input.id
    });
};