import React from 'react';
import BaseLayout from "../../components/AdminDashboard/layout/BaseLayout";

const AdminDashboard: React.FC = () => {
  return (
    <BaseLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the admin panel. Use the sidebar to navigate to different admin functions.</p>
      </div>
    </BaseLayout>
  );
};

export default AdminDashboard;