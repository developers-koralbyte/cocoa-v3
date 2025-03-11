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
import InvoiceTable from '../../../components/Dashboard/Invoices/BuyerInvoiceTable';
import Header from '../../../components/Dashboard/Invoices/HeaderProps';

interface BuyerInvoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: 'Paid' | 'Unpaid' | 'Cancelled';
  invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    senderName: string;
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

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { currentUser, fetchUserInfo } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<BuyerInvoice[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch invoices for this buyer
  const fetchBuyerInvoices = async (buyerUid: string) => {
    try {
      const q = query(
        collection(db, 'buyerInvoices'),
        where('buyerId', '==', buyerUid)
      );
      const querySnapshot = await getDocs(q);
      const invoiceData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BuyerInvoice[];
      setInvoices(invoiceData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  // Delete selected invoices from view (not from DB, just mark as deleted for buyer)
  const handleDeleteSelected = async () => {
    if (selectedInvoices.length === 0) {
      alert('No invoices selected');
      return;
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${selectedInvoices.length} invoice(s) from your view?`
    );
    if (!confirmDelete) return;
    try {
      // In a real implementation, you would update a "hiddenForBuyer" field in the database
      // For now, we'll just remove them from the state
      setInvoices((prev) =>
        prev.filter((invoice) => !selectedInvoices.includes(invoice.id))
      );
      setSelectedInvoices([]);
      alert('Invoice(s) removed successfully');
    } catch (error) {
      console.error('Error removing invoices:', error);
      alert('Error removing invoice(s)');
    }
  };

  const handleDownloadSelected = () => {
    // Future functionality to download invoices as PDFs
    console.log('Download PDF functionality here');
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
  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;
    
    const lowerTerm = searchTerm.toLowerCase();
    return invoices.filter(invoice => {
      const { invoiceData } = invoice;
      return (
        invoiceData.invoiceNumber?.toLowerCase().includes(lowerTerm) ||
        invoiceData.senderName?.toLowerCase().includes(lowerTerm) ||
        invoiceData.items?.[0]?.description?.toLowerCase().includes(lowerTerm)
      );
    });
  }, [invoices, searchTerm]);

  // No stats section needed

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          await fetchUserInfo(user.uid);
          await fetchBuyerInvoices(user.uid);
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
          <h1 className="text-2xl md:text-3xl font-bold font-nunito">
            Invoices
          </h1>
          <Header

          />
        </div>

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
        <InvoiceTable
          invoices={filteredInvoices}
          selectedInvoices={selectedInvoices}
          onSelect={handleInvoiceSelect}
          onDownloadAll={handleDownloadSelected}
          onDeleteSelected={handleDeleteSelected}
          onSearch={handleToggleSearch}
        />
      </div>
    </BaseLayout>
  );
};

export default InvoicesPage;