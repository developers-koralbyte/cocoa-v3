import React, { useEffect, useState } from 'react';
import generateInvoicePdf from './InvoicePdfGenerator'; 
// ^ Update this import path to wherever InvoicePdfGenerator is located in your project

// Updated interfaces to match your buyer invoice data structure
interface BuyerInvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number; // This is the key difference - buyer invoices use 'rate' not 'price'
  tax: number;
}

interface BuyerInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyLocation: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientLocation: string;
  bankName: string;
  bankAddress: string;
  accountName: string;
  iban: string;
  bic: string;
  companyLogo?: string;
  items: BuyerInvoiceItem[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

interface BuyerInvoice {
  id: string;
  vendorId: string;
  buyerId: string;
  status: string;
  invoiceData: BuyerInvoiceData;
}

interface BuyerInvoicePreviewProps {
  // The invoice object to preview
  invoice: BuyerInvoice;

  // Optional: a callback if you want to handle "close" events in a modal, etc.
  onClose?: () => void;
}

const BuyerInvoicePreview: React.FC<BuyerInvoicePreviewProps> = ({ invoice, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPdfPreview = async () => {
      try {
        // Transform buyer invoice data to match what the PDF generator expects
        const transformedInvoice = {
          ...invoice,
          invoiceData: {
            ...invoice.invoiceData,
            items: invoice.invoiceData.items.map(item => ({
              ...item,
              price: item.rate // Map 'rate' to 'price' for PDF generator
            }))
          }
        };

        // Generate a PDF blob from the transformed invoice data
        const pdfBlob = await generateInvoicePdf(transformedInvoice);

        // Convert the blob to a URL for display in an iframe
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
      } catch (err) {
        console.error('Error generating buyer invoice PDF:', err);
        setError('Failed to generate PDF preview.');
      } finally {
        setIsLoading(false);
      }
    };

    createPdfPreview();

    // Cleanup: Revoke the object URL when unmounting
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Generating PDF preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!pdfUrl) {
    return null; // or display a fallback
  }

  return (
    <div className="relative">
      {/* Optional close button if you're using a modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 px-4 py-1 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      )}

      <iframe
        title="Buyer Invoice PDF Preview"
        src={pdfUrl}
        style={{ width: '100%', height: '80vh', border: 'none' }}
      />
    </div>
  );
};

export default BuyerInvoicePreview;