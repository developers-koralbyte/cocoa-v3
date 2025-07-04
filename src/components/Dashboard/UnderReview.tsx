import React from 'react';
import { getAuth } from 'firebase/auth';
import { Clock } from 'lucide-react';

const UnderReview: React.FC = () => {
  const auth = getAuth();

  return (
    <div className="h-full min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-6">
        <Clock className="mx-auto text-[#7C77C1] w-12 h-12 animate-pulse" />
        <h1 className="text-2xl font-semibold text-gray-800">
          Profile Under Review
        </h1>
        <p className="text-gray-600">
          Thank you for submitting your documents. Your account is currently under review by our team.
          We’ll send you an email notification as soon as it’s approved.
        </p>
        <button
          onClick={() => auth.signOut()}
          className="mt-4 inline-block px-6 py-2 bg-[#7C77C1] text-white font-medium rounded-lg hover:bg-[#6661B0] transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UnderReview;
