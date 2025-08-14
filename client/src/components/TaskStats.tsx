import { ListTodo, CheckCircle2, Circle } from 'lucide-react';
import type { Task } from '../../../server/src/schema';

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((task: Task) => task.status === 'completed').length;
  const pendingCount = tasks.filter((task: Task) => task.status === 'pending').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-wrap gap-4">
      {/* Total Tasks */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg">
            <ListTodo className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Completed</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-gray-500">({completionPercentage}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Circle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg min-w-[200px]">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-100 to-green-100 p-3 rounded-lg">
              <div className="h-5 w-5 bg-gradient-to-r from-orange-500 to-green-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-medium">Progress</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">{completionPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}