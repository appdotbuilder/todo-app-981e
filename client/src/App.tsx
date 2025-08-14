import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Edit3, Plus, Filter, ListTodo } from 'lucide-react';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '../../server/src/schema';
import { TaskCard } from '@/components/TaskCard';
import { TaskStats } from '@/components/TaskStats';
import { EmptyState } from '@/components/EmptyState';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  
  // New task form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<CreateTaskInput>({
    title: '',
    description: null
  });

  // Edit task form state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskData, setEditTaskData] = useState<UpdateTaskInput>({
    id: 0,
    title: '',
    description: null,
    status: 'pending'
  });

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const filterInput = filter === 'all' ? {} : { status: filter };
      const result = await trpc.getTasks.query(filterInput);
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) return;

    try {
      setIsLoading(true);
      const response = await trpc.createTask.mutate(newTaskData);
      setTasks((prev: Task[]) => [response, ...prev]);
      setNewTaskData({ title: '', description: null });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      setIsLoading(true);
      const response = await trpc.updateTask.mutate(editTaskData);
      setTasks((prev: Task[]) => 
        prev.map((task: Task) => task.id === response.id ? response : task)
      );
      setEditingTask(null);
      setEditTaskData({ id: 0, title: '', description: null, status: 'pending' });
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      setIsLoading(true);
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      const response = await trpc.updateTaskStatus.mutate({ 
        id: task.id, 
        status: newStatus 
      });
      setTasks((prev: Task[]) => 
        prev.map((t: Task) => t.id === response.id ? response : t)
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      await trpc.deleteTask.mutate({ id: taskId });
      setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskData({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status
    });
  };

  const filteredTasks = tasks.filter((task: Task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <ListTodo className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📋 My Tasks
                </h1>
                <p className="text-gray-600">Stay organized and productive</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    <span>Create New Task</span>
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title *
                      </label>
                      <Input
                        id="title"
                        placeholder="Enter task title..."
                        value={newTaskData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewTaskData((prev: CreateTaskInput) => ({ 
                            ...prev, 
                            title: e.target.value 
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        placeholder="Enter task description... (optional)"
                        value={newTaskData.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNewTaskData((prev: CreateTaskInput) => ({ 
                            ...prev, 
                            description: e.target.value || null 
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !newTaskData.title.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? 'Creating...' : 'Create Task'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Stats */}
            <TaskStats tasks={tasks} />

            {/* Filter */}
            <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-md border border-gray-100">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select value={filter} onValueChange={(value) => setFilter(value as TaskStatus | 'all')}>
                <SelectTrigger className="w-[180px] border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🔍 All Tasks</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {isLoading && tasks.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-6 text-lg">Loading your tasks...</p>
              <p className="text-gray-500 mt-2 text-sm">Please wait a moment</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState 
            filter={filter} 
            onAddTask={() => setIsAddDialogOpen(true)} 
          />
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task: Task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onEdit={openEditDialog}
                onDelete={handleDeleteTask}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}

        {/* Edit Task Dialog */}
        {editingTask && (
          <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  <span>Edit Task</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateTask}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="edit-title" className="text-sm font-medium">
                      Title *
                    </label>
                    <Input
                      id="edit-title"
                      placeholder="Enter task title..."
                      value={editTaskData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditTaskData((prev: UpdateTaskInput) => ({ 
                          ...prev, 
                          title: e.target.value 
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="edit-description"
                      placeholder="Enter task description... (optional)"
                      value={editTaskData.description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditTaskData((prev: UpdateTaskInput) => ({ 
                          ...prev, 
                          description: e.target.value || null 
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-status" className="text-sm font-medium">
                      Status
                    </label>
                    <Select 
                      value={editTaskData.status} 
                      onValueChange={(value) => 
                        setEditTaskData((prev: UpdateTaskInput) => ({ 
                          ...prev, 
                          status: value as TaskStatus 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingTask(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !editTaskData.title?.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isLoading ? 'Updating...' : 'Update Task'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}

export default App;