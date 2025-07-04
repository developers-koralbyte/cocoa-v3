import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RejectedNoticeProps {
  reason?: string;
}

const RejectedNotice: React.FC<RejectedNoticeProps> = ({ reason }) => {
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <AlertTriangle size={48} className="text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Account Rejected</h1>
      <p className="text-gray-700 mb-6">
        {reason ??
          "Unfortunately your submitted documents didn't meet our requirements.Please Contact Support for more details"}
      </p>
      <button
        onClick={() => navigate('/support')}
        className="px-6 py-2 bg-accent text-white rounded-full hover:bg-accent-dark transition"
      >
        Contact Support
      </button>
    </div>
  );
};

export default RejectedNotice;
