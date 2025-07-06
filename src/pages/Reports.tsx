import React from 'react';
import Header from '../components/layout/Header';
import ReportsView from '../components/reports/ReportsView';

const Reports: React.FC = () => {
  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Reports" 
        subtitle="Analyze team performance and project progress"
      />
      
      <div className="p-6">
        <ReportsView />
      </div>
    </div>
  );
};

export default Reports;