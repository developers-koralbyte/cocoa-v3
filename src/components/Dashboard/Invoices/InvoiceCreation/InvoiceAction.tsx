import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../utils/firebase';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { sendInvoiceToChat } from '../../../chat/InvoiceChatService';

// Define the Invoice interface (adjust properties as needed)
interface Invoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: string;
  invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    companyName: string;
    companyEmail: string;
    companyAddress: string;
    companyLocation: string;
    recipientPhone: string;
    recipientAddress: string;
    recipientLocation: string;
    recipientName: string;
    recipientEmail: string;
    bankName: string;
    bankAddress: string;
    accountName: string;
    iban: string;
    bic: string;
  };
  items?: Array<{
    id: number;
    description: string;
    quantity: number;
    rate: number;
    tax: number;
  }>;
  totals?: {
    subtotal: number;
    tax: number;
    total: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

interface Buyer {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
}

interface InvoiceActionsProps {
  invoiceData: {
    invoiceData: { // Notice this extra nesting
      invoiceNumber: string;
      invoiceDate: string;
      dueDate: string;
      companyName: string;
      companyEmail: string;
      companyAddress: string;
      companyLocation: string;
      recipientPhone: string;
      recipientAddress: string;
      recipientLocation: string;
      recipientName: string;
      recipientEmail: string;
      bankName: string;
      bankAddress: string;
      accountName: string;
      iban: string;
      bic: string;
    };
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
  onSave: (buyerId: string, isDraft: boolean) => Promise<void>;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ invoiceData, onSave }) => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBuyerList, setShowBuyerList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendToChat, setSendToChat] = useState(true); // Default to true
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      console.log('Starting to fetch buyers from Firestore...');
      const buyersRef = collection(db, 'users');
      console.log('Collection reference created for "users"');
      const q = query(buyersRef, where('role', '==', 'buyer'));
      console.log('Query created for role == "buyer"');
      const querySnapshot = await getDocs(q);
      console.log(`Query executed. Results: ${querySnapshot.docs.length} documents`);

      if (querySnapshot.empty) {
        console.log('No buyers found in the database');
        setError('No buyers found in the database. Make sure there are users with the role "buyer".');
      } else {
        const buyersList = querySnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          console.log(`Buyer found: ${docSnapshot.id} - Name: ${data.firstName} ${data.lastName}, Role: ${data.role}`);
          return { id: docSnapshot.id, ...data } as Buyer;
        });
        console.log(`Processed ${buyersList.length} buyers`);
        setBuyers(buyersList);
      }
    } catch (err: any) {
      console.error('Error fetching buyers:', err);
      setError(`Error fetching buyers: ${err.message}`);
    }
  };

  const filteredBuyers = buyers.filter(buyer =>
    (buyer.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (`${buyer.firstName || ''} ${buyer.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBuyerSelect = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setShowBuyerList(false);
  };

  const handleSaveAsDraft = async () => {
    if (!selectedBuyer) {
      alert('Please select a buyer first');
      return;
    }
    setLoading(true);
    try {
      await onSave(selectedBuyer.id, true);
    } catch (err: any) {
      console.error('Error saving draft:', err);
      alert(`Failed to save draft: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedBuyer) {
      alert('Please select a buyer first');
      return;
    }
    setLoading(true);
    try {
      // First save the invoice to the database
      await onSave(selectedBuyer.id, false).then(async () => {
        if (sendToChat) {
          try {
            // Get the newly created invoice (for now, fetch it from Firestore)
            const vendorInvoicesRef = collection(db, 'vendorInvoices');
            const q = query(
              vendorInvoicesRef,
              where('buyerId', '==', selectedBuyer.id),
              where('invoiceData.invoiceNumber', '==', invoiceData.invoiceData.invoiceNumber)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const newInvoice = {
                id: querySnapshot.docs[0].id,
                ...querySnapshot.docs[0].data()
              } as Invoice;

              // Send to chat
              const chatId = await sendInvoiceToChat(newInvoice);
              console.log(`Invoice sent to chat: ${chatId}`);
            }
          } catch (chatError: any) {
            console.error('Error sending invoice to chat:', chatError);
            // Don't block the main flow if chat sending fails
            alert(`Invoice saved, but failed to send to chat: ${chatError.message}`);
          }
        }
        alert('Invoice sent successfully');
        navigate('/invoices');
      });
    } catch (err: any) {
      console.error('Error sending invoice:', err);
      alert(`Failed to send invoice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Buyer
        </label>
        <div className="relative">
          <div className="flex items-center border rounded-lg">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowBuyerList(true);
              }}
              onClick={() => setShowBuyerList(true)}
              placeholder="Search buyers..."
              className="w-full p-2 outline-none"
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 mt-1">
              Error: {error}
            </div>
          )}

          {showBuyerList && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredBuyers.length > 0 ? (
                filteredBuyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleBuyerSelect(buyer)}
                  >
                    <div className="font-medium">
                      {buyer.businessName || `${buyer.firstName} ${buyer.lastName}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {buyer.firstName} {buyer.lastName} • {buyer.email}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">
                  No buyers found. {buyers.length > 0 ? 'Try a different search term.' : 'Make sure there are users with role "buyer" in the database.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedBuyer && (
        <div className="mb-4 p-2 bg-purple-50 rounded-lg">
          <div className="font-medium">Selected Buyer:</div>
          <div className="text-sm">
            {selectedBuyer.businessName || ''} ({selectedBuyer.firstName || ''} {selectedBuyer.lastName || ''})
          </div>
        </div>
      )}

      {/* Option to send to chat */}
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="sendToChat"
            checked={sendToChat}
            onChange={() => setSendToChat(!sendToChat)}
            className="w-4 h-4 text-purple-600"
          />
          <label htmlFor="sendToChat" className="ml-2 text-sm text-gray-700">
            Send invoice to buyer's chat with PDF attachment
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSaveAsDraft}
          disabled={loading || !selectedBuyer}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Save as Draft
        </button>
        <button
          onClick={handleSendInvoice}
          disabled={loading || !selectedBuyer}
          className="px-4 py-2 bg-[#7C77C1] text-white rounded-lg hover:bg-[#6661B0] disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Invoice'}
        </button>
      </div>
    </div>
  );
};

export default InvoiceActions;
