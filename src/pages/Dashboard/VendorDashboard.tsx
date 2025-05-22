import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Search, RotateCcw, Plus, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/Dashboard/BaseLayout';
import { db } from '../../utils/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { useAuth } from '../../utils/AuthContext';

import VendorServices from '../../components/Dashboard/Catalogue/VendorServices';
import VendorProducts from '../../components/Dashboard/Catalogue/VendorProducts';
import UserMenu from '../../components/Dashboard/UserMenu';
import moment from 'moment';


interface Buyer {
  name: string;
  company: string;
  match: number;
  image: string;
}

interface Appointment {
  id: string;
  name: string;
  company: string;
  date: string;
  time: string;
  image: string;
}



const staticBuyers: Buyer[] = [
  {
    name: 'Diana',
    company: 'TechNest',
    match: 93,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    name: 'Kevin',
    company: 'FlexSpace Studios',
    match: 87,
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    name: 'Margaret',
    company: 'OfficeOne Hub',
    match: 82,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    name: 'Yihao',
    company: 'Collaborative HQ',
    match: 78,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
  },
];

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();

  // 1) Pull user from AuthContext
  const { user, isLoading } = useAuth();

  const vendorId = user?.uid;
if (!vendorId) {
  navigate('/login');
  return null;
}

  // For checking if the user has completed their vendor doc
  const [showPopup, setShowPopup] = useState(false);
  const [loadingDocCheck, setLoadingDocCheck] = useState(true);
  
  // Store vendor details from Firestore
  const [vendorData, setVendorData] = useState<any>({});

  const [appointments, setAppointments] = useState<Appointment[]>([]);
const [upcomingIndex, setUpcomingIndex] = useState(0);

  // Basic vendor form data for the popup
  const [formData, setFormData] = useState({
    businessName: '',
    countryRegion: '',
    industry: '',
    categories: '',
    services: '',
  });

  // Suppose you fetch services & products here OR use child components that do it
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Potential buyers from Firestore (if you implement a real matching system)
  const [potentialBuyers, setPotentialBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    if (!vendorId) return;
  
    const fetchAppointments = async () => {
      try {
        console.log('Fetching appointments for vendor:', vendorId);
        // 1) Query all appointments for this vendor
        const apptQ = query(
          collection(db, 'appointments'),
          where('vendorId', '==', vendorId)
        );
        const apptSnap = await getDocs(apptQ);
        console.log('Appointment docs found:', apptSnap.size);
  
        // 2) Build Appointment[] with buyer info
        const items: Appointment[] = await Promise.all(
          apptSnap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            // Fetch buyer profile
            let name = 'Unknown', company = '', image = '';
            if (data.buyerId) {
              const buyerRef = doc(db, 'users', data.buyerId);
              const buyerSnap = await getDoc(buyerRef);
              if (buyerSnap.exists()) {
                const bd = buyerSnap.data();
                name = bd.firstName || 'Unknown';
                company = bd.businessName || '';
                image = bd.avatar || '';
              }
            }
            // Parse and format date/time
            const raw = data.selectedDate?.toDate
              ? data.selectedDate.toDate()
              : new Date(data.selectedDate);
            const start = moment(raw);
            if (data.selectedTime) {
              const tm = moment(data.selectedTime, 'h:mm A');
              start.hours(tm.hours()).minutes(tm.minutes());
            }
            const end = start.clone().add(30, 'minutes');
  
            return {
              id: docSnap.id,
              name,
              company,
              image,
              date: start.format('ddd D'),
              time: `${start.format('h:mm A')} - ${end.format('h:mm A')}`,
            };
          })
        );
  
        // 3) Sort by start time
        items.sort((a, b) => {
          const aM = moment(a.date + ' ' + a.time.split(' - ')[0], 'ddd D h:mm A');
          const bM = moment(b.date + ' ' + b.time.split(' - ')[0], 'ddd D h:mm A');
          return aM.valueOf() - bM.valueOf();
        });
  
        setAppointments(items);
        setUpcomingIndex(0);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };
  
    fetchAppointments();
  }, [vendorId]);
  const handlePrevUpcoming = () =>
  setUpcomingIndex(i => Math.max(i - 1, 0));

const handleNextUpcoming = () =>
  setUpcomingIndex(i => Math.min(i + 1, appointments.length - 1));
  
  

  useEffect(() => {
    console.log('VendorDashboard => user changed:', user);
  }, [user]);

  // 2) If AuthContext is still loading, show spinner
  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading user...</p>
        </div>
      </BaseLayout>
    );
  }

  // 3) If there's no user or user.role !== 'vendor', redirect
  if (!user || user.role !== 'vendor') {
    console.warn('VendorDashboard => user not vendor or no user => redirecting');
    navigate('/login');
    return null;
  }

  // 4) Check if vendor doc is missing or incomplete
  useEffect(() => {
    const checkVendorDoc = async () => {
      try {
        if (!user.id) {
          navigate('/login');
          return;
        }
        // Retrieve vendor doc
        const vendorRef = doc(db, 'Vendors', user.id);
        const snap = await getDoc(vendorRef);

        if (!snap.exists()) {
          console.log('No vendor doc found => show popup');
          setShowPopup(true);
          setLoadingDocCheck(false);
          return;
        }

        const data = snap.data() || {};
        setVendorData(data); // Store vendor data
        
        const { businessName, countryRegion, industry, categories, services } = data;
        if (!businessName || !countryRegion || !industry || !categories || !services) {
          setFormData({
            businessName: businessName || '',
            countryRegion: countryRegion || '',
            industry: industry || '',
            categories: categories || '',
            services: services || '',
          });
          setShowPopup(true);
        } else {
          setFormData({
            businessName: businessName || '',
            countryRegion: countryRegion || '',
            industry: industry || '',
            categories: categories || '',
            services: services || '',
          });
        }
      } catch (error) {
        console.error('Error checking vendor doc:', error);
        navigate('/login');
      } finally {
        setLoadingDocCheck(false);
      }
    };
    checkVendorDoc();
  }, [user.id, navigate]);

  // 5) Example: fetch services & products (or do it inside child components)
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        if (!user.id) return;

        // Fetch services
        const servicesRef = collection(db, 'services');
        const servicesQ = query(servicesRef, where('vendorId', '==', user.id));
        const servicesSnap = await getDocs(servicesQ);
        const servicesData: any[] = [];
        servicesSnap.forEach((doc) => {
          servicesData.push({ id: doc.id, ...doc.data() });
        });
        setServices(servicesData);

        // Fetch products
        const productsRef = collection(db, 'products');
        const productsQ = query(productsRef, where('vendorId', '==', user.id));
        const productsSnap = await getDocs(productsQ);
        const productsData: any[] = [];
        productsSnap.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching vendor data:', err);
      }
    };
    fetchVendorData();
  }, [user.id]);

  // 6) If categories exist, we can fetch potential buyers from Firestore (example)
  useEffect(() => {
    const fetchPotentialBuyers = async () => {
      if (user.categories) {
        const vendorInterests = user.categories
          .split(',')
          .map((s: string) => s.trim().toLowerCase());

        try {
          const buyersQ = query(
            collection(db, 'Buyers'),
            where('categories', 'array-contains-any', vendorInterests)
          );
          const snapshot = await getDocs(buyersQ);
          const fetchedBuyers: Buyer[] = snapshot.docs.map((docSnap) => {
            const docData = docSnap.data();
            // Adjust to your actual data structure
            return {
              name: docData.firstName || 'Unknown',
              company: docData.businessName || 'Unknown',
              match: 0, // placeholder
              image: docData.avatar || '',
            };
          });

          // Calculate match
          const matched = fetchedBuyers.map((b) => {
            // Suppose 'categories' is an array on each buyer
            // This is just a quick example:
            const buyerDoc = snapshot.docs.find(doc => 
              doc.data().firstName === b.name || 
              doc.data().businessName === b.company
            );
            
            if (!buyerDoc) return b;
            
            const buyerData = buyerDoc.data();
            const buyerCats = (buyerData.categories || []).map((c: string) => c.toLowerCase());
            const common = vendorInterests.filter((v: string) => buyerCats.includes(v));
            const match = vendorInterests.length
              ? Math.floor((common.length / vendorInterests.length) * 100)
              : 0;
            return { ...b, match };
          });

          setPotentialBuyers(matched);
        } catch (error) {
          console.error('Error fetching potential buyers:', error);
        }
      }
    };
    fetchPotentialBuyers();
  }, [user.categories]);

  // 7) Handle the "Complete Profile" popup changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save vendor doc (merging any new fields)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!user.id) {
        console.error('No user ID => cannot save vendor doc');
        return;
      }
      const vendorRef = doc(db, 'Vendors', user.id);
      await setDoc(
        vendorRef,
        {
          businessName: formData.businessName,
          countryRegion: formData.countryRegion,
          industry: formData.industry,
          categories: formData.categories,
          services: formData.services,
        },
        { merge: true }
      );
      alert('Vendor details updated!');
      setShowPopup(false);
      
      // Update our vendorData state with the new information
      setVendorData((prev: any) => ({
        ...prev,
        businessName: formData.businessName,
        countryRegion: formData.countryRegion,
        industry: formData.industry,
        categories: formData.categories,
        services: formData.services,
      }));
    } catch (err) {
      console.error('Error updating vendor doc:', err);
    }
  };

  // 8) Check if still loading vendor doc check
  if (loadingDocCheck) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading vendor data...</p>
        </div>
      </BaseLayout>
    );
  }

  // 9) Decide if we show a single "plus" if no services and no products
  const noServicesOrProducts = services.length === 0 && products.length === 0;
  
  // Create an enhanced user object that includes the business name
  const enhancedUser = {
    ...user,
    businessName: vendorData?.businessName || formData.businessName || '',
  };

  return (
    <BaseLayout>
      <div className="flex min-h-screen bg-transparent">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold font-nunito">
              Welcome {user.firstName || 'Vendor'},
            </h1>
            <div className="flex gap-4">
              <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* If no services/products => show a single "plus" to go to /catalogue */}
          {noServicesOrProducts ? (
            <div className="flex flex-col items-center justify-center border border-gray-200 rounded-md p-6 bg-gray-50">
              <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                <Plus size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-500 mb-2">No services or products added yet.</p>
              <button
                className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                onClick={() => navigate('/catalogue')}
              >
                <Plus size={16} />
                Add your first service or product
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-8 md:space-y-12">
                <VendorServices />
                <VendorProducts />
              </div>
            </>
          )}
        </div>

        {/* Right panel */}
        <div className="w-96 bg-purple-100 p-8 pt-32 rounded-l-[3.5rem] relative">
          {/* User menu */}
          <div className="absolute top-8 right-8">
            <UserMenu user={enhancedUser} />
          </div>

          {/* Upcoming Appointments */}
          <section className="bg-white rounded-2xl p-6 mb-8">
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-bold">Upcoming Appointment</h3>
    <div className="flex gap-2">
      <button
        onClick={handlePrevUpcoming}
        disabled={upcomingIndex === 0}
        className="text-purple-600 disabled:opacity-50"
      >
        &lt;
      </button>
      <button
        onClick={handleNextUpcoming}
        disabled={upcomingIndex === appointments.length - 1}
        className="text-purple-600 disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  </div>

  {appointments.length ? (
    (() => {
      const appt = appointments[upcomingIndex];
      return (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {appt.image ? (
              <img
                src={appt.image}
                alt={appt.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="text-gray-400 w-6 h-6 m-2" />
            )}
          </div>

          {/* UPDATED BLOCK START */}
          <div className="flex-1 space-y-1">
            <div className="font-medium">{appt.name}</div>
            <div className="text-purple-600">
              {appt.company || 'No company info'}
            </div>
            <div className="text-sm text-gray-500">
              {appt.date}, {appt.time}
            </div>
          </div>
          {/* UPDATED BLOCK END */}

          <Bell
            className="w-4 h-4 text-purple-600 cursor-pointer"
            onClick={() => alert(`Reminder set for ${appt.name}`)}
          />
        </div>
      );
    })()
  ) : (
    <p className="text-gray-500">No upcoming appointments.</p>
  )}
</section>

        </div>
      </div>

      {/* Popup for completing profile */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-md w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Country/Region</label>
                <input
                  type="text"
                  name="countryRegion"
                  value={formData.countryRegion}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Categories</label>
                <input
                  type="text"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Services</label>
                <input
                  type="text"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 w-full rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </BaseLayout>
  );
};

export default VendorDashboard;