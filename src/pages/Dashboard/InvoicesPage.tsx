import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import BaseLayout from "../../components/Dashboard/BaseLayout";
import chatImage from "../../assets/img/Dashboard/chatImage.png";
import Header from "../../components/Dashboard/Invoices/HeaderProps";
import { useUserStore } from '../../utils/userStore';
import { auth } from '../../utils/firebase';

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { currentUser, fetchUserInfo } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await fetchUserInfo(user.uid);
        } catch (error) {
          console.error('Error fetching user info:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserInfo, navigate]);

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B85C1]"></div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      {/* Main Page Content */}
      <div className="p-4 md:p-6">
      {/* Top row: Title left, user info right */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-nunito">
          Invoices
        </h1>
        <Header
          userName={currentUser?.username || 'User'}
          userRole={currentUser?.role || 'Buyer'}
          userImage={currentUser?.avatar || '/path-to-default-avatar.jpg'}
        />
      </div>

        {/* Invoice History Section */}
        <div className="mt-4 md:mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl md:text-2xl font-nunito font-semibold text-[#8B85C1]">
              Invoices History
            </h2>
            <div className="mt-2 md:mt-0 flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Table or invoice content */}
          <div className="bg-gray-50 rounded-lg p-4">
            {/* Table component or other content */}
          </div>
        </div>
      </div>

      {/* Chat Image/Button */}
      <div
        className="fixed bottom-3 right-10 cursor-pointer z-50"
        onClick={() => navigate('/chat')}
      >
        <img
          src={chatImage}
          alt="Chat"
          className="hover:opacity-90 transition-opacity"
        />
      </div>
    </BaseLayout>
  );
};

export default InvoicesPage;