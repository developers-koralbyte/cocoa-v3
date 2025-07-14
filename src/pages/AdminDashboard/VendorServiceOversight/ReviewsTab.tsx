import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import BaseLayout from '../../../components/AdminDashboard/layout/BaseLayout';

interface Item {
  id: string;
  name: string;
  price: number;
  date: string;
  status: string;
  type: 'service' | 'product'; // To differentiate between services and products
}

const ReviewsTab: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Reviews');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch services
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'service' as const,
        })) as Item[];

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'product' as const,
        })) as Item[];

        // Combine services and products
        setItems([...servicesData, ...productsData]);
      } catch (err) {
        setError('Failed to fetch items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
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

  const filteredItems = items.filter(item => {
    if (activeTab === 'Reviews') return true;
    return item.status === tabs.find(tab => tab.label === activeTab)?.filter;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Determine the collection based on the item type
      const item = items.find(i => i.id === id);
      if (!item) throw new Error('Item not found');
      const collectionName = item.type === 'service' ? 'services' : 'products';
      const itemRef = doc(db, collectionName, id); // Reference to the specific document
      await updateDoc(itemRef, { status: newStatus }); // Update the status in Firestore
      setItems(items.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      )); // Update local state
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!items.length && !loading) return <div className="text-center py-4">No items available.</div>;

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
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4">${item.price}</td>
                    <td className="py-2 px-4">{item.date}</td>
                    <td className="py-2 px-4">
                      {activeTab === 'Reviews' && (
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`inline-block px-4 py-1 rounded-full ${getStatusColor(item.status)}`}
                        >
                          <option value="Review">Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pending">Pending</option>
                        </select>
                      )}
                      {activeTab !== 'Reviews' && (
                        <span className={`inline-block px-4 py-1 rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      )}
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