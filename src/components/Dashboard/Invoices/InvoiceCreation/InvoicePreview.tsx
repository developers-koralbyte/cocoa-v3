import React from 'react';
import { Eye, Edit2 } from 'lucide-react';

interface InvoicePreviewProps {
    companyLogo?: string | null; //add the company logo
  invoiceData: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    companyName: string;
    companyEmail: string;
    companyAddress: string;
    companyLocation: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail: string;
    recipientAddress: string;
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
    price: number;
    tax: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData, items, totals,companyLogo }) => {
  return (
    <div className="w-full p-8 bg-white border rounded-[3.5rem] shadow-2xl">
    {/* Header Section */}
    <div className="flex justify-between items-start mb-12">
      <div>
        <h1 className="text-[35px] font-nunito font-bold text-[#5F4B8B] mb-4">Invoice</h1>
        <div className="font-sourceSans text-[16px] text-[#5F4B8B]">
          <p className="mb-1 font-bold">Invoice No : {invoiceData.invoiceNumber}</p>
          <p className="mb-1">Invoice Date : {invoiceData.invoiceDate}</p>
          <p>Due Date : {invoiceData.dueDate}</p>
        </div>
      </div>

      {/* Logo Display Section */}
      <div className="pr-10 pt-8">
        <div className="relative w-24 h-24 bg-[#F3F0FA] rounded-full overflow-hidden">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#5F4B8B] opacity-20" />
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Company and Client Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-bold text-[#5F4B8B] mb-2">{invoiceData.companyName}</h3>
          <p>{invoiceData.companyEmail}</p>
          <p>{invoiceData.companyAddress}</p>
          <p>{invoiceData.companyLocation}</p>
        </div>

        {/* Client Info - Right Aligned */}
        <div className="text-right">
          <h3 className="text-xl font-bold text-[#5F4B8B] mb-2">Invoice to</h3>
          <p>{invoiceData.recipientName}</p>
          <p>{invoiceData.recipientPhone}</p>
          <p>{invoiceData.recipientEmail}</p>
          <p>{invoiceData.recipientAddress}</p>
        </div>
      </div>

      {/* Amount Due Section */}
      <div className="mb-8">
        <p className="text-[#5F4B8B] font-bold text-lg">
          CAD {totals.total.toFixed(2)} due on {invoiceData.dueDate}
        </p>
      </div>

      {/* Items Table */}
      <div className="mb-5">
        <table className="w-full">
          <thead className="bg-[#F3F0FA] text-[#5F4B8B]">
            <tr>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-center">Price</th>
              <th className="py-3 px-4 text-center">Tax</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-[#F3F0FA]">
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 px-4">{item.description}</td>
                <td className="py-3 px-4 text-center">{item.quantity}</td>
                <td className="py-3 px-4 text-center">CAD {item.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">{item.tax}%</td>
                <td className="py-3 px-4 text-right">
                  CAD {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className=" bg-[#F3F0FA] text-[#5F4B8B]">
            <tr>
              <td colSpan={4} className="py-2 px-4 text-right">Total ex. Tax</td>
              <td className="py-2 px-4 text-right">CAD {totals.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="py-2 px-4 text-right">Tax, Smwhere ({items[0]?.tax || 0}%)</td>
              <td className="py-2 px-4 text-right">CAD {totals.tax.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={4} className="py-2 px-4 text-right">Total due</td>
              <td className="py-2 px-4 text-right">CAD {totals.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      
    </div>
  );
};

const InvoiceContainer: React.FC<InvoicePreviewProps & { isPreview: boolean; onTogglePreview: () => void }> = ({
  invoiceData,
  items,
  totals,
  isPreview,
  onTogglePreview,
  companyLogo,
}) => {
  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
  onClick={onTogglePreview}
  className="absolute left-1/2 transform -translate-x-1/2 top-8 z-10 flex items-center gap-2 bg-buttonBg text-white px-6 py-2 rounded-full hover:bg-[#4a3a6d] transition-colors"
>
  {isPreview ? (
    <>
      <Edit2 size={20} />
      <span>Edit</span>
    </>
  ) : (
    <>
      <Eye size={20} />
      <span>Preview</span>
    </>
  )}
</button>

      {isPreview ? (
        <InvoicePreview invoiceData={invoiceData} items={items} totals={totals}
        companyLogo={companyLogo} />
      ) : null}
    </div>
  );
};

export default InvoiceContainer;