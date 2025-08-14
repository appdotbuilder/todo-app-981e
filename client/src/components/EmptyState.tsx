import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { TaskStatus } from '../../../server/src/schema';

interface EmptyStateProps {
  filter: TaskStatus | 'all';
  onAddTask: () => void;
}

export function EmptyState({ filter, onAddTask }: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (filter) {
      case 'all':
        return {
          emoji: '📝',
          title: 'No tasks yet',
          description: 'Create your first task to get started on your journey to productivity!',
          showButton: true
        };
      case 'completed':
        return {
          emoji: '🎯',
          title: 'No completed tasks',
          description: 'Complete some tasks to see them here. You\'ve got this!',
          showButton: false
        };
      case 'pending':
        return {
          emoji: '⏰',
          title: 'No pending tasks',
          description: 'Great job! You\'ve completed all your pending tasks.',
          showButton: false
        };
      default:
        return {
          emoji: '📋',
          title: 'No tasks found',
          description: 'Try adjusting your filters or create a new task.',
          showButton: false
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="text-center py-16">
      <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 max-w-md mx-auto animate-fade-in">
        <div className="text-8xl mb-6 animate-bounce-gentle">{content.emoji}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {content.title}
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {content.description}
        </p>
        {content.showButton && (
          <Button
            onClick={onAddTask}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Task
          </Button>
        )}
        {filter !== 'all' && (
          <p className="text-sm text-gray-500 mt-6">
            💡 Tip: Switch to "All Tasks" to see your complete task list
          </p>
        )}
      </div>
    </div>
  );
}