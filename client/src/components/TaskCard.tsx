import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle2, Circle, Edit3, Trash2 } from 'lucide-react';
import type { Task } from '../../../server/src/schema';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  isLoading: boolean;
}

export function TaskCard({ task, onToggleStatus, onEdit, onDelete, isLoading }: TaskCardProps) {
  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg border-l-4 task-card-hover animate-fade-in ${
        task.status === 'completed'
          ? 'border-l-green-500 bg-green-50/50'
          : 'border-l-orange-500 bg-white hover:bg-gray-50'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(task)}
              disabled={isLoading}
              className={`p-1 h-8 w-8 status-indicator ${
                task.status === 'completed'
                  ? 'text-green-600 hover:bg-green-100'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold transition-all duration-200 ${
                task.status === 'completed'
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 transition-all duration-200 ${
                  task.status === 'completed'
                    ? 'line-through text-gray-400'
                    : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <Badge 
                  variant={task.status === 'completed' ? 'secondary' : 'default'}
                  className="transition-all duration-200"
                >
                  {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                </Badge>
                <span className="text-xs text-gray-400">
                  Created {task.created_at.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              disabled={isLoading}
              className="text-blue-600 hover:bg-blue-100 transition-colors duration-200"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="text-red-600 hover:bg-red-100 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span>Delete Task</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "<strong>{task.title}</strong>"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(task.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Task
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}