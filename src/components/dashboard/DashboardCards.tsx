import React from 'react';
import { CheckSquare, Clock, Users, FolderOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const DashboardCards: React.FC = () => {
  const { dashboardStats } = useApp();

  // Show loading if dashboardStats is null
  if (!dashboardStats) {
    return <div>Loading...</div>;
  }

  const cards = [
    {
      title: 'Total Tasks',
      value: dashboardStats.totalTasks,
      change: '+12%',
      changeType: 'increase',
      icon: CheckSquare,
      color: 'blue',
    },
    {
      title: 'Completed',
      value: dashboardStats.completedTasks,
      change: '+8%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'In Progress',
      value: dashboardStats.inProgressTasks,
      change: '2 urgent',
      changeType: 'warning',
      icon: AlertCircle,
      color: 'orange',
    },
    {
      title: 'Active Projects',
      value: dashboardStats.activeProjects,
      change: `${dashboardStats.totalProjects} total`,
      changeType: 'neutral',
      icon: FolderOpen,
      color: 'purple',
    },
    {
      title: 'Team Members',
      value: dashboardStats.teamMembers,
      change: '3 online',
      changeType: 'neutral',
      icon: Users,
      color: 'indigo',
    },
    {
      title: 'Hours Logged',
      value: dashboardStats.totalHours,
      change: '+24h this week',
      changeType: 'increase',
      icon: Clock,
      color: 'teal',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      purple: 'bg-purple-50 text-purple-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      teal: 'bg-teal-50 text-teal-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${getColorClasses(card.color)} rounded-lg flex items-center justify-center`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
            <p className={`text-sm ${getChangeColor(card.changeType)}`}>{card.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;