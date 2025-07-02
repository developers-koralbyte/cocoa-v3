import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import BaseLayout from '../../../components/AdminDashboard/layout/BaseLayout';

interface Review {
  id: string;
  name: string;
  product: string;
  date: string;
  status: string;
}

const ReviewsTab: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Reviews');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'reviews'));
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[];
        setReviews(reviewsData);
      } catch (err) {
        setError('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-300 text-black';
      case 'Rejected': return 'bg-red-300 text-black';
      case 'Review': return 'bg-purple-300 text-black';
      case 'Pending': return 'bg-yellow-300 text-black';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { label: 'Reviews', filter: 'all' },
    { label: 'Pending Items', filter: 'Pending' },
    { label: 'Approved', filter: 'Approved' },
    { label: 'Flagged Content', filter: 'Rejected' },
  ];

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'Reviews') return true; // Show all reviews
    return review.status === tabs.find(tab => tab.label === activeTab)?.filter;
  });

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!reviews.length && !loading) return <div className="text-center py-4">No reviews available.</div>;

  return (
    <BaseLayout>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 bg-[#D4CDF4] rounded-2xl font-medium">
          {tabs.map(tab => (
            <button
              key={tab.label}
              className={`px-4 py-2 rounded-2xl ${activeTab === tab.label ? 'bg-[#8B85C1] text-white rounded-2xl px-8' : 'bg-[#D4CDF4] text-white'}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-gray-100 p-4 pb-96 rounded-2xl mb-4">
          <div className="overflow-x-auto rounded-2xl">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-white">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Product</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="border-b">
                    <td className="py-2 px-4">{review.name}</td>
                    <td className="py-2 px-4">{review.product}</td>
                    <td className="py-2 px-4">{review.date}</td>
                    <td className="py-2 px-4">
                      <span className={`inline-block px-4 py-1 rounded-full ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default ReviewsTab;