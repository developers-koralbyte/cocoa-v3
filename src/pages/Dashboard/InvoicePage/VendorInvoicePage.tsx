import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../../../utils/firebase';
import { useUserStore } from '../../../utils/userStore';
import BaseLayout from '../../../components/Dashboard/BaseLayout';
import VendorInvoiceTable from '../../../components/Dashboard/Invoices/VendorInvoiceTable';
import StatsSection from '../../../components/Dashboard/Invoices/StatsSection';
import Header from '../../../components/Dashboard/Invoices/HeaderProps';
import CreateNewInvoice from '../../../assets/icons/VendorNewInvoice.svg';
// Import the download functionality
import { downloadInvoice, downloadMultipleInvoices } from '../../../utils/InvoiceDownloadService';

interface VendorInvoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: string;
  invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    recipientName: string;
    items: Array<{
      id: number;
      description: string;
      quantity: number;
      rate: number;
      tax: number;
    }>;
    totals: {
      subtotal: number;
      tax: number;
      total: number;
    };
  };
}

const VendorInvoicesPage = () => {
  const navigate = useNavigate();
  const { currentUser, fetchUserInfo } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  // Fetch invoices for this vendor
  const fetchVendorInvoices = async (vendorUid: string) => {
    try {
      const q = query(
        collection(db, 'vendorInvoices'),
        where('vendorId', '==', vendorUid)
      );
      const querySnapshot = await getDocs(q);
      const invoiceData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VendorInvoice[];
      setInvoices(invoiceData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Delete selected invoices from Firestore and update state
  const handleDeleteSelected = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected for deletion');
      return;
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedInvoices.length} invoice(s)?`
    );
    if (!confirmDelete) return;
    try {
      for (const invoiceId of selectedInvoices) {
        await deleteDoc(doc(db, 'vendorInvoices', invoiceId));
      }
      setInvoices((prev) =>
        prev.filter((invoice) => !selectedInvoices.includes(invoice.id))
      );
      setSelectedInvoices([]);
      alert('Invoice(s) deleted successfully');
    } catch (error) {
      console.error('Error deleting invoices:', error);
      alert('Error deleting invoice(s)');
    }
  };

  // Updated download function that actually downloads the PDFs
  const handleDownloadAll = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected for download');
      return;
    }
    
    setDownloadStatus('Preparing downloads...');
    
    try {
      // Get the full invoice objects for selected IDs
      const selectedInvoiceObjects = invoices.filter(invoice => 
        selectedInvoices.includes(invoice.id)
      );
      
      if (selectedInvoiceObjects.length === 0) {
        setDownloadStatus('Error: Could not find selected invoices');
        setTimeout(() => setDownloadStatus(null), 3000);
        return;
      }
      
      // Download all selected invoices
      const success = await downloadMultipleInvoices(selectedInvoiceObjects, 'vendor-invoice');
      
      if (success) {
        setDownloadStatus('Invoices downloaded successfully');
      } else {
        setDownloadStatus('Some invoices failed to download');
      }
    } catch (error) {
      console.error('Error downloading invoices:', error);
      setDownloadStatus(`Error: ${error}`);
    } finally {
      // Clear status after a delay
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  // Toggle search input visibility
  const handleToggleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Handle invoice selection from the table
  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  // Filter invoices based on searchTerm
  const filteredInvoices = invoices.filter((invoice) => {
    const { invoiceData } = invoice;
    if (!searchTerm.trim()) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return (
      invoiceData.invoiceNumber.toLowerCase().includes(lowerTerm) ||
      invoiceData.recipientName.toLowerCase().includes(lowerTerm)
    );
  });

  // Compute stats dynamically using useMemo (for performance)
  const today = new Date().toISOString().split('T')[0];

  const totalSalesToday = useMemo(() => {
    return invoices
      .filter(
        (invoice) =>
          invoice.invoiceData.invoiceDate === today
      )
      .reduce((sum, invoice) => sum + invoice.invoiceData.totals.total, 0);
  }, [invoices, today]);

  const todayRevenue = useMemo(() => {
    return invoices
      .filter(
        (invoice) =>
          invoice.invoiceData.invoiceDate === today &&
          invoice.status === 'Sent, Paid'
      )
      .reduce((sum, invoice) => sum + invoice.invoiceData.totals.total, 0);
  }, [invoices, today]);

  const inEscrow = useMemo(() => {
    return invoices
      .filter((invoice) => invoice.status === 'Sent, Unpaid')
      .reduce((sum, invoice) => sum + invoice.invoiceData.totals.total, 0);
  }, [invoices]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await fetchUserInfo(user.uid);
          await fetchVendorInvoices(user.uid);
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
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-3xl font-bold font-nunito">
            Invoices
          </h1>
          <Header
            userName={currentUser?.username || 'User'}
            userRole={currentUser?.role || 'Vendor'}
            userImage={currentUser?.avatar || '/path-to-default-avatar.jpg'}
          />
        </div>

        <div className="ml-5 flex items-start mt-4 mb-5">
          <img
            src={CreateNewInvoice}
            alt="Create New Invoice Button"
            className="hover:opacity-90 transition-opacity"
          />
          <div className="ml-5 mt-5 font-nunito text-[20px] text-buttonBg ">
            <button onClick={() => navigate('/create-new-invoice')}>
              Create New Invoice
            </button>
          </div>
        </div>

        {/* Stats Section: Passing computed values */}
        <StatsSection
          totalSales={totalSalesToday.toFixed(2)}
          todayRevenue={todayRevenue.toFixed(2)}
          inEscrow={inEscrow.toFixed(2)}
        />

        {/* Status message for downloads */}
        {downloadStatus && (
          <div className={`p-3 mb-4 rounded ${downloadStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {downloadStatus}
          </div>
        )}

        {/* Search Input Field */}
        {showSearch && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>
        )}

        {/* Invoice Table with functional actions */}
        <VendorInvoiceTable
          invoices={filteredInvoices}
          selectedInvoices={selectedInvoices}
          onSelect={handleInvoiceSelect}
          onDownloadAll={handleDownloadAll}
          onDeleteSelected={handleDeleteSelected}
          onSearch={handleToggleSearch}
        />
      </div>
    </BaseLayout>
  );
};

export default VendorInvoicesPage;