import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Search, RotateCcw, Plus, Bell, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/Dashboard/BaseLayout';
import { db } from '../../utils/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { useAuth } from '../../utils/AuthContext';

import VendorServices from '../../components/Dashboard/Catalogue/VendorServices';
import VendorProducts from '../../components/Dashboard/Catalogue/VendorProducts';
import UserMenu from '../../components/Dashboard/UserMenu';
import moment from 'moment';

interface Appointment {
  id: string;
  name: string;
  company: string;
  date: string;
  time: string;
  image: string;
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect if not a valid vendor
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'vendor')) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const vendorId = user?.uid;

  // “Complete your profile” popup state
  const [showPopup, setShowPopup] = useState(false);
  const [loadingDocCheck, setLoadingDocCheck] = useState(true);
  const [vendorData, setVendorData] = useState<any>({});
  const [formData, setFormData] = useState({
    businessName: '',
    countryRegion: '',
    industry: '',
    categories: '',
    services: '',
  });

  // Services & Products
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingIndex, setUpcomingIndex] = useState(0);

  // ─── 1) Check / create vendor document ───
  useEffect(() => {
    const checkVendorDoc = async () => {
      if (!user?.id) return;
      try {
        const vendorRef = doc(db, 'Vendors', user.id);
        const snap = await getDoc(vendorRef);

        if (!snap.exists()) {
          // No vendor doc → show popup
          setShowPopup(true);
          setLoadingDocCheck(false);
          return;
        }

        const data = snap.data() || {};
        setVendorData(data);

        const {
          businessName,
          countryRegion,
          industry,
          categories,
          services,
        } = data;
        if (
          !businessName ||
          !countryRegion ||
          !industry ||
          !categories ||
          !services
        ) {
          // Incomplete → show popup & prefill
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

    if (vendorId) {
      checkVendorDoc();
    }
  }, [vendorId, user, navigate]);

  // ─── 2) Fetch services & products ───
  useEffect(() => {
    const fetchVendorItems = async () => {
      if (!user?.id) return;
      try {
        // Services
        const sRef = collection(db, 'services');
        const sQ = query(sRef, where('vendorId', '==', user.id));
        const sSnap = await getDocs(sQ);
        const sArr: any[] = [];
        sSnap.forEach((d) => sArr.push({ id: d.id, ...d.data() }));
        setServices(sArr);

        // Products
        const pRef = collection(db, 'products');
        const pQ = query(pRef, where('vendorId', '==', user.id));
        const pSnap = await getDocs(pQ);
        const pArr: any[] = [];
        pSnap.forEach((d) => pArr.push({ id: d.id, ...d.data() }));
        setProducts(pArr);
      } catch (err) {
        console.error('Error fetching vendor items:', err);
      }
    };

    if (user?.id) {
      fetchVendorItems();
    }
  }, [user]);

  // ─── 3) Fetch appointments ───
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!vendorId) return;
      try {
        const apptQ = query(
          collection(db, 'appointments'),
          where('vendorId', '==', vendorId)
        );
        const apptSnap = await getDocs(apptQ);

        const items: Appointment[] = await Promise.all(
          apptSnap.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let name = 'Unknown',
              company = '',
              image = '';
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

        items.sort((a, b) => {
          const aM = moment(
            a.date + ' ' + a.time.split(' - ')[0],
            'ddd D h:mm A'
          );
          const bM = moment(
            b.date + ' ' + b.time.split(' - ')[0],
            'ddd D h:mm A'
          );
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

  // Handlers for “Complete your profile” popup
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
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
      setVendorData((prev: any) => ({
        ...prev,
        businessName: formData.businessName,
        countryRegion: formData.countryRegion,
        industry: formData.industry,
        categories: formData.categories,
        services: formData.services,
      }));
      setShowPopup(false);
    } catch (err) {
      console.error('Error updating vendor doc:', err);
    }
  };

  // Show loading screen while verifying vendor doc
  if (loadingDocCheck) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading vendor data…</p>
        </div>
      </BaseLayout>
    );
  }

  // If not a valid user or not a vendor, render nothing
  if (!user || user.role !== 'vendor') {
    return null;
  }

  // Decide if we show “Add your first item” card
  const noServicesOrProducts = services.length === 0 && products.length === 0;

  // Build enhanced user object for UserMenu
  const enhancedUser = {
    ...user,
    businessName: vendorData.businessName || formData.businessName || '',
  };

  return (
    <BaseLayout>
      {/*
        1) We removed `min-h-screen` so the right panel will only be as tall as its contents.
        2) We use `flex flex-col lg:flex-row` so the right panel stacks below on mobile, and sits to the right on ≥lg.
      */}
      <div className="flex flex-col lg:flex-row bg-transparent">
        {/* ─── LEFT PANEL / MAIN CONTENT ─── */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <h1 className="text-3xl md:text-4xl font-bold font-nunito">
                Welcome, {user.firstName || 'Vendor'}
              </h1>
              <div className="flex space-x-3">
                <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {noServicesOrProducts ? (
              <div className="flex flex-col items-center justify-center border border-gray-200 rounded-md p-6 bg-gray-50">
                <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                  <Plus size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-500 mb-2">
                  No services or products added yet.
                </p>
                <button
                  className="flex items-center gap-2 bg-buttonBg text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  onClick={() => navigate('/catalogue')}
                >
                  <Plus size={16} />
                  Add your first service or product
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <VendorServices />
                <VendorProducts />
              </div>
            )}
          </div>
        </main>

        {/* ─── RIGHT PANEL ─── */}
        <aside className="w-full lg:w-96 bg-purple-100 p-6 lg:p-8 rounded-l-[3.5rem]">
          {/*
            • We removed `pt-32` and `relative` so the header no longer overflows.
            • We render UserMenu at the very top, followed immediately by the appointment card.
          */}
          <UserMenu user={enhancedUser} />

          {/* Upcoming Appointments (with some top margin) */}
          <section className="mt-6 bg-white rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upcoming Appointment</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setUpcomingIndex((i) => Math.max(i - 1, 0))}
                  disabled={upcomingIndex === 0}
                  className="text-purple-600 disabled:opacity-50"
                >
                  &lt;
                </button>
                <button
                  onClick={() =>
                    setUpcomingIndex((i) =>
                      Math.min(i + 1, appointments.length - 1)
                    )
                  }
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {appt.image ? (
                        <img
                          src={appt.image}
                          alt={appt.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <UserIcon className="text-gray-400 w-6 h-6 m-2" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="font-medium truncate">{appt.name}</p>
                      <p className="text-purple-600 text-sm truncate">
                        {appt.company || 'No company info'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {appt.date}, {appt.time}
                      </p>
                    </div>
                    <Bell
                      className="w-5 h-5 text-purple-600 cursor-pointer flex-shrink-0"
                      onClick={() => alert(`Reminder set for ${appt.name}`)}
                    />
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-500 text-sm">
                No upcoming appointments.
              </p>
            )}
          </section>
        </aside>

        {/* ─── COMPLETE YOUR PROFILE POPUP ─── */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">
                Complete Your Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">
                    Business Name
                  </label>
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
                  <label className="block font-medium mb-1">
                    Country/Region
                  </label>
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
      </div>
    </BaseLayout>
  );
};

export default VendorDashboard;
