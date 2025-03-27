import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { toast } from 'react-toastify';
import BaseLayout from '../../../components/Dashboard/BaseLayout';
import InvoiceEditor from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceEditor';
import InvoicePreview from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoicePreview';
import InvoiceSummary from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceSummary';
import InvoiceActions from '../../../components/Dashboard/Invoices/InvoiceCreation/InvoiceAction';
import HeaderProps from '../../../components/Dashboard/Invoices/HeaderProps';
import { useUserStore } from '../../../utils/userStore';

const CreateNewInvoice = () => {
    const navigate = useNavigate();
    const { currentUser, fetchUserInfo } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [isPreview, setIsPreview] = useState(false);
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize invoice data with default values
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        companyName: '',
        companyEmail: '',
        companyAddress: '',
        companyLocation: '',
        recipientPhone: '',
        recipientAddress: '',
        recipientLocation: '',
        recipientName: '',
        recipientEmail: '',
        bankName: '',
        bankAddress: '',
        accountName: '',
        iban: '',
        bic: '',
    });

    const [items, setItems] = useState([
        {
            id: Date.now(),
            description: '',
            quantity: 1,
            rate: 0,
            tax: 10,
        },
    ]);

    const [totals, setTotals] = useState({
        subtotal: 0,
        tax: 0,
        total: 0,
    });

    // Check authentication and user role
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (!userData) {
                    navigate('/login');
                    return;
                }
    
                const user = JSON.parse(userData);
                
                if (!currentUser) {
                    await fetchUserInfo(user.uid);
                }
    
                // Optionally wait here for currentUser to be populated (depending on how fetchUserInfo works)
                if (!currentUser && !user.uid) {
                    throw new Error('User not authenticated');
                }
    
                if (user.role !== 'vendor') {
                    navigate('/buyer-dashboard');
                    return;
                }
    
                setInvoiceData(prev => ({
                    ...prev,
                    companyName: currentUser?.businessName || '',
                    companyEmail: currentUser?.email || '',
                    companyLocation: currentUser?.countryRegion || '',
                }));
    
                setLoading(false);
            } catch (err) {
                console.error('Error in auth check:', err);
                setError('Failed to load user data');
                setLoading(false);
            }
        };
    
        checkAuth();
    }, [navigate, currentUser, fetchUserInfo]);
    
    // Calculate totals when items change
    useEffect(() => {
        const newTotals = items.reduce(
            (acc, item) => {
                const itemTotal = item.quantity * item.rate;
                const itemTax = (itemTotal * item.tax) / 100;
                return {
                    subtotal: acc.subtotal + itemTotal,
                    tax: acc.tax + itemTax,
                    total: acc.total + itemTotal + itemTax,
                };
            },
            { subtotal: 0, tax: 0, total: 0 }
        );
        setTotals(newTotals);
    }, [items]);

    const handleSaveInvoice = async (buyerId: string, isDraft: boolean) => {
        try {
            // Fallback to user in localStorage if currentUser is undefined
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const uid = currentUser?.uid || storedUser?.uid;
            if (!uid) {
                throw new Error('User not authenticated');
            }
    
            const invoiceDoc = {
                vendorId: uid, // Use the fallback uid
                buyerId,
                status: isDraft ? 'Draft' : 'Sent, Unpaid',
                invoiceData: {
                    ...invoiceData,
                    items,
                    totals,
                    companyLogo,
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
    
            const docRef = await addDoc(collection(db, 'vendorInvoices'), invoiceDoc);
    
            if (!isDraft) {
                const buyerInvoiceDoc = {
                    ...invoiceDoc,
                    status: 'Unpaid',
                    vendorInvoiceId: docRef.id,
                    receivedAt: serverTimestamp(),
                };
                await addDoc(collection(db, 'buyerInvoices'), buyerInvoiceDoc);
            }
    
            toast.success(isDraft ? 'Invoice saved as draft' : 'Invoice sent successfully');
            navigate('/invoices');
        } catch (error) {
            console.error('Error saving invoice:', error);
            toast.error(isDraft ? 'Failed to save draft' : 'Failed to send invoice');
        }
    };
    
    if (loading) {
        return (
            <BaseLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B85C1]"></div>
                </div>
            </BaseLayout>
        );
    }

    if (error) {
        return (
            <BaseLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-xl text-red-500">Error: {error}</div>
                </div>
            </BaseLayout>
        );
    }

    return (
        <BaseLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">New Invoice</h1>
                    <HeaderProps
                        userName={currentUser?.firstName || 'User'} // Use firstName instead of username
                        userRole={currentUser?.role || 'Vendor'}
                        userImage={currentUser?.avatar || '/path-to-default-avatar.jpg'}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <InvoiceSummary
                            invoiceData={invoiceData}
                            totals={totals}
                        />
                        <InvoiceActions
                            invoiceData={{ invoiceData, items, totals }}
                            onSave={handleSaveInvoice}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <InvoicePreview
                            invoiceData={invoiceData}
                            items={items}
                            totals={totals}
                            isPreview={isPreview}
                            onTogglePreview={() => setIsPreview(!isPreview)}
                            companyLogo={companyLogo}
                        />

                        {!isPreview && (
                            <InvoiceEditor
                                invoiceData={invoiceData}
                                items={items}
                                totals={totals}
                                companyLogo={companyLogo}
                                onLogoChange={setCompanyLogo}
                                onInvoiceDataChange={(name, value) =>
                                    setInvoiceData(prev => ({
                                        ...prev,
                                        [name]: value,
                                    }))
                                }
                                onItemChange={(id, field, value) =>
                                    setItems(prev =>
                                      prev.map(item =>
                                        item.id === id
                                          ? {
                                              ...item,
                                              [field]:
                                                field === 'description'
                                                  ? value  // keep as string
                                                  : typeof value === 'string'
                                                  ? parseFloat(value) || 0
                                                  : value,
                                            }
                                          : item
                                      )
                                    )
                                  }
                                  
                                onAddItem={() =>
                                    setItems(prev => [
                                        ...prev,
                                        {
                                            id: Date.now(),
                                            description: '',
                                            quantity: 1,
                                            rate: 0,
                                            tax: 10,
                                        },
                                    ])
                                }
                                onRemoveItem={id =>
                                    setItems(prev =>
                                        prev.filter(item => item.id !== id)
                                    )
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default CreateNewInvoice;