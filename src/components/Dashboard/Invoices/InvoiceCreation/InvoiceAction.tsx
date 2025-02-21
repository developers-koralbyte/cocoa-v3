import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../utils/firebase';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Buyer {
    id: string;
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
}

interface InvoiceActionsProps {
    invoiceData: {
        invoiceData: {  // Notice this extra nesting
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

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        try {
            const buyersRef = collection(db, 'users');
            const q = query(buyersRef, where('role', '==', 'buyer'));
            const querySnapshot = await getDocs(q);
            
            const buyersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Buyer[];
            
            setBuyers(buyersList);
        } catch (error) {
            console.error('Error fetching buyers:', error);
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
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft');
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
            await onSave(selectedBuyer.id, false);
        } catch (error) {
            console.error('Error sending invoice:', error);
            alert('Failed to send invoice');
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
                    
                    {showBuyerList && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                            {filteredBuyers.map((buyer) => (
                                <div
                                    key={buyer.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleBuyerSelect(buyer)}
                                >
                                    <div className="font-medium">{buyer.businessName}</div>
                                    <div className="text-sm text-gray-600">
                                        {buyer.firstName} {buyer.lastName} • {buyer.email}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedBuyer && (
                <div className="mb-4 p-2 bg-purple-50 rounded-lg">
                    <div className="font-medium">Selected Buyer:</div>
                    <div className="text-sm">
                        {selectedBuyer.businessName} ({selectedBuyer.firstName} {selectedBuyer.lastName})
                    </div>
                </div>
            )}

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
                    Send Invoice
                </button>
            </div>
        </div>
    );
};

export default InvoiceActions;