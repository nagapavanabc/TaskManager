import React, { useState } from 'react';
import Header from '../components/layout/Header';
import DepartmentModal from '../components/departments/DepartmentModal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Users, Edit, Trash2, UserPlus } from 'lucide-react';

const Departments: React.FC = () => {
  const { user } = useAuth();
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const canManageDepartments = user?.role === 'super_admin';

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: any) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async (departmentData: any) => {
    try {
      if (selectedDepartment) {
        await updateDepartment(selectedDepartment._id, departmentData);
      } else {
        await addDepartment(departmentData);
      }
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(departmentId);
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <Header 
        title="Departments" 
        subtitle="Manage organizational departments and team structure"
        actions={
          canManageDepartments && (
            <button 
              onClick={handleCreateDepartment}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Department
            </button>
          )
        }
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div key={department._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {department.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {department.description}
                  </p>
                </div>
                
                {canManageDepartments && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditDepartment(department)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Manager</span>
                  <span className="font-medium text-gray-900">
                    {department.manager.name}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Members</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {department.memberCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {department.members.slice(0, 3).map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg text-xs"
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-gray-700">{member.name}</span>
                    </div>
                  ))}
                  
                  {department.memberCount > 3 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                      +{department.memberCount - 3} more
                    </div>
                  )}
                </div>
                
                {canManageDepartments && (
                  <button className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Manage Members
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
            <p className="text-gray-600 mb-4">Create your first department to organize your team</p>
            {canManageDepartments && (
              <button 
                onClick={handleCreateDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Department
              </button>
            )}
          </div>
        )}
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDepartment}
        onSave={handleSaveDepartment}
      />
    </div>
  );
};

export default Departments;