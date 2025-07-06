import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckSquare, Clock, MessageSquare, UserPlus } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: '1',
      type: 'task_completed',
      user: 'Lisa Developer',
      action: 'completed task',
      target: 'Setup database schema',
      timestamp: new Date('2024-02-15T10:30:00'),
      icon: CheckSquare,
      color: 'green'
    },
    {
      id: '2',
      type: 'time_logged',
      user: 'Mike Lead',
      action: 'logged 4 hours on',
      target: 'Design user authentication flow',
      timestamp: new Date('2024-02-15T09:15:00'),
      icon: Clock,
      color: 'blue'
    },
    {
      id: '3',
      type: 'comment_added',
      user: 'Sarah Manager',
      action: 'commented on',
      target: 'Implement user API endpoints',
      timestamp: new Date('2024-02-14T16:45:00'),
      icon: MessageSquare,
      color: 'purple'
    },
    {
      id: '4',
      type: 'user_assigned',
      user: 'John Admin',
      action: 'assigned',
      target: 'Lisa Developer to Mobile App Development',
      timestamp: new Date('2024-02-14T14:20:00'),
      icon: UserPlus,
      color: 'indigo'
    }
  ];

  const getIconColor = (color: string) => {
    const colors = {
      green: 'bg-green-50 text-green-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      indigo: 'bg-indigo-50 text-indigo-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-8 h-8 ${getIconColor(activity.color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>
                {' '}
                <span className="text-gray-600">{activity.action}</span>
                {' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;