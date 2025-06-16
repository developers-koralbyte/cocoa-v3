import React from 'react';
import addLogoIcon from '../../../../assets/icons/addLogo.svg';
import { BuyerInfo } from '../../../../pages/Dashboard/InvoicePage/CreateNewInvoice';
import { getProvinceOptions, validateGstNumber, formatGstNumber } from '../../../../utils/canadianTax';

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyEmail: string;
  companyAddress: string;
  companyLocation: string;
  
  // NEW CANADIAN FIELDS - Business
  businessCity: string;
  businessProvince: string;
  businessPostalCode: string;
  businessPhone: string;
  gstNumber: string;
  isGstRegistered: boolean;
  
  // Recipient info
  recipientPhone: string;
  recipientAddress: string;
  recipientLocation: string;
  recipientName: string;
  recipientEmail: string;
  
  // NEW CANADIAN FIELDS - Client
  clientCity: string;
  clientProvince: string;
  clientPostalCode: string;
  
  // Payment info
  paymentTerms: string;
  paymentMethods: string[];
  notes: string;
  
  // Bank info
  bankName: string;
  bankAddress: string;
  accountName: string;
  iban: string;
  bic: string;
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  unitPrice: number;
  tax: number;
}

interface Totals {
  subtotal: number;
  tax: number;
  gst: number;
  pst: number;
  hst: number;
  totalTax: number;
  total: number;
}

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'service';
}

interface Props {
  invoiceData: InvoiceData;
  items: InvoiceItem[];
  totals: Totals;
  catalogItems: CatalogItem[];
  companyLogo?: string | null;
  onLogoChange?: (logo: string | null) => void;
  onInvoiceDataChange: (name: string, value: string | boolean | string[]) => void;
  onItemChange?: (id: number, field: string, value: string | number) => void;
  onAddItem?: () => void;
  onRemoveItem?: (id: number) => void;
  chatBuyers?: BuyerInfo[];
  onBuyerSelect?: (buyer: BuyerInfo) => void;
}

const InvoiceEditor: React.FC<Props> = ({
  invoiceData,
  items,
  totals,
  catalogItems,
  companyLogo,
  onLogoChange,
  onInvoiceDataChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  chatBuyers,
  onBuyerSelect,
}) => {
  // Remove the problematic local state sync - just use items prop directly
  const [activeTab, setActiveTab] = React.useState<'basic' | 'business' | 'payment'>('basic');

  const handleLocalItemChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    // Directly call parent's onItemChange instead of managing local state
    if (onItemChange) onItemChange(id, field, value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      onInvoiceDataChange(name, checked);
    } else {
      onInvoiceDataChange(name, value);
    }
  };

  const handleSelectCatalogItem = (itemId: number, selectedId: string) => {
    const chosen = catalogItems.find((c) => c.id === selectedId);
    if (chosen && onItemChange) {
      onItemChange(itemId, 'description', chosen.name);
      onItemChange(itemId, 'price', chosen.price);
      onItemChange(itemId, 'unitPrice', chosen.price);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoChange) {
      const reader = new FileReader();
      reader.onloadend = () => onLogoChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const currentMethods = invoiceData.paymentMethods || [];
    if (checked) {
      onInvoiceDataChange('paymentMethods', [...currentMethods, method]);
    } else {
      onInvoiceDataChange('paymentMethods', currentMethods.filter(m => m !== method));
    }
  };

  const provinceOptions = getProvinceOptions();

  return (
    <div className="w-full p-6 border rounded-[3.5rem] shadow-2xl">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[35px] font-bold text-[#5F4B8B]">Invoice</h1>
          <div className="space-y-2">
            <input
              type="text"
              name="invoiceNumber"
              placeholder="Invoice Number"
              value={invoiceData.invoiceNumber}
              onChange={handleInputChange}
              className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
            />
            <input
              type="date"
              name="invoiceDate"
              value={invoiceData.invoiceDate}
              readOnly
              className="bg-gray-100 border-b border-gray-300 text-gray-500 w-full cursor-not-allowed"
            />
            <input
              type="date"
              name="dueDate"
              value={invoiceData.dueDate}
              readOnly
              className="bg-gray-100 border-b border-gray-300 text-gray-500 w-full cursor-not-allowed"
            />
          </div>
        </div>

        {/* Logo upload */}
        <div className="pr-10 pt-8">
          <div className="relative w-24 h-24 bg-[#F3F0FA] rounded-full overflow-hidden">
            {companyLogo ? (
              <div className="relative w-full h-full group">
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
                <label
                  htmlFor="logo-upload"
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <img
                    src={addLogoIcon}
                    alt="Change Logo"
                    className="w-6 h-6 mb-1"
                  />
                </label>
              </div>
            ) : (
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#E9E5F5] transition-colors"
              >
                <img
                  src={addLogoIcon}
                  alt="Add Logo"
                  className="w-8 h-8 mb-2"
                />
                <span className="text-[#5F4B8B] text-sm">Add Logo</span>
              </label>
            )}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation - Simplified to 3 tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-gray-200">
          {[
            { key: 'basic', label: 'Basic Info' },
            { key: 'business', label: 'Tax & Province' },
            { key: 'payment', label: 'Payment & Notes' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#5F4B8B] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column: Basic Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-[#5F4B8B] mb-4">Company Information</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={invoiceData.companyName}
                onChange={handleInputChange}
                className="w-full border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none font-bold"
              />
              <input
                type="email"
                name="companyEmail"
                placeholder="Company Email"
                value={invoiceData.companyEmail}
                onChange={handleInputChange}
                className="w-full border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none"
              />
              <textarea
                name="companyAddress"
                placeholder="Company Address"
                value={invoiceData.companyAddress}
                onChange={handleInputChange}
                rows={2}
                className="w-full border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none"
              />
            </div>
          </div>

          {/* Right Column: Basic Client Info */}
          <div>
            <h3 className="text-lg font-semibold text-[#5F4B8B] mb-4">Client Information</h3>
            
            {/* Buyer dropdown if chatBuyers is available */}
            {chatBuyers && chatBuyers.length > 0 && (
              <div className="mb-4">
                <select
                  className="w-full border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none font-bold"
                  defaultValue=""
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const buyer = chatBuyers.find((b) => b.id === selectedId);
                    if (buyer && onBuyerSelect) {
                      onBuyerSelect(buyer);
                    }
                  }}
                >
                  <option value="">-- Select Buyer from Chat --</option>
                  {chatBuyers.map((buyer) => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.firstName} {buyer.businessName ? `(${buyer.businessName})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                name="recipientName"
                placeholder="Recipient Name"
                value={invoiceData.recipientName}
                readOnly
                className="w-full bg-gray-100 border-b border-gray-300 text-gray-600 
                           cursor-not-allowed px-2 py-1 outline-none font-bold"
              />
              <input
                type="text"
                name="recipientPhone"
                placeholder="Phone Number"
                value={invoiceData.recipientPhone}
                readOnly
                className="w-full bg-gray-100 border-b border-gray-300 text-gray-600 
                           cursor-not-allowed px-2 py-1 outline-none"
              />
              <input
                type="email"
                name="recipientEmail"
                placeholder="Email"
                value={invoiceData.recipientEmail}
                readOnly
                className="w-full bg-gray-100 border-b border-gray-300 text-gray-600 
                           cursor-not-allowed px-2 py-1 outline-none"
              />
              <textarea
                name="recipientAddress"
                placeholder="Address"
                value={invoiceData.recipientAddress}
                readOnly
                rows={2}
                className="w-full bg-gray-100 border-b border-gray-300 text-gray-600 
                           cursor-not-allowed px-2 py-1 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#5F4B8B] mb-4">Canadian Tax & Province Setup</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Province Selection */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Business Province (Required for Tax Calculation)</h4>
              <div className="space-y-3">
                <select
                  name="businessProvince"
                  value={invoiceData.businessProvince}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 outline-none"
                >
                  <option value="">Select Province/Territory</option>
                  {provinceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.taxInfo}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="businessPostalCode"
                  placeholder="Postal Code (e.g., M5V 3A8)"
                  value={invoiceData.businessPostalCode}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 outline-none"
                />
              </div>
            </div>

            {/* GST/HST Registration */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Tax Registration</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGstRegistered"
                    name="isGstRegistered"
                    checked={invoiceData.isGstRegistered}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600"
                  />
                  <label htmlFor="isGstRegistered" className="text-sm font-medium text-gray-700">
                    I am registered for GST/HST
                  </label>
                </div>
                
                {invoiceData.isGstRegistered && (
                  <div>
                    <input
                      type="text"
                      name="gstNumber"
                      placeholder="GST/HST Number (e.g., 123456789RT0001)"
                      value={invoiceData.gstNumber}
                      onChange={handleInputChange}
                      className={`w-full border border-gray-300 rounded px-3 py-2 outline-none ${
                        invoiceData.gstNumber && !validateGstNumber(invoiceData.gstNumber)
                          ? 'border-red-500 focus:border-red-500'
                          : 'focus:border-purple-600'
                      }`}
                    />
                    {invoiceData.gstNumber && !validateGstNumber(invoiceData.gstNumber) && (
                      <p className="text-red-500 text-xs mt-1">
                        Invalid format. Should be: 123456789RT0001
                      </p>
                    )}
                    {invoiceData.gstNumber && validateGstNumber(invoiceData.gstNumber) && (
                      <p className="text-green-500 text-xs mt-1">
                        ✓ Valid GST/HST number: {formatGstNumber(invoiceData.gstNumber)}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
                  <strong>Note:</strong> If you're not registered for GST/HST, no tax will be applied to your invoices. 
                  Businesses with annual revenue under $30,000 are not required to register.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#5F4B8B] mb-4">Payment Terms & Information</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Payment Terms */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Payment Terms</h4>
              <div className="space-y-3">
                <select
                  name="paymentTerms"
                  value={invoiceData.paymentTerms}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 outline-none"
                >
                  <option value="Due upon receipt">Due upon receipt</option>
                  <option value="Net 15">Net 15 (Pay within 15 days)</option>
                  <option value="Net 30">Net 30 (Pay within 30 days)</option>
                  <option value="Net 60">Net 60 (Pay within 60 days)</option>
                  <option value="Net 90">Net 90 (Pay within 90 days)</option>
                </select>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Accepted Payment Methods</h5>
                  <div className="space-y-2">
                    {['E-transfer', 'Bank transfer', 'PayPal', 'Cheque', 'Cash', 'Credit card'].map((method) => (
                      <label key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={invoiceData.paymentMethods.includes(method)}
                          onChange={(e) => handlePaymentMethodChange(method, e.target.checked)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Additional Notes</h4>
              <textarea
                name="notes"
                placeholder="Add any additional notes, terms, or instructions..."
                value={invoiceData.notes}
                onChange={handleInputChange}
                rows={6}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-purple-600 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will appear at the bottom of your invoice
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#5F4B8B] mb-4">Invoice Items</h3>
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#EDE9F5] text-[#5F4B8B] font-bold">
            <tr>
              <th className="p-2">Description</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-center">Unit Price</th>
              <th className="p-2 text-center">Line Total</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="bg-white hover:bg-gray-50">
                <td className="p-2">
                  {/* Catalog-based selection */}
                  <select
                    className="w-full bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none mb-2"
                    value=""
                    onChange={(e) => handleSelectCatalogItem(item.id, e.target.value)}
                  >
                    <option value="">-- Select an item --</option>
                    <optgroup label="Services">
                      {catalogItems
                        .filter((cat) => cat.type === 'service')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} - ${cat.price}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Products">
                      {catalogItems
                        .filter((cat) => cat.type === 'product')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} - ${cat.price}
                          </option>
                        ))}
                    </optgroup>
                  </select>

                  {/* Manually override description */}
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleLocalItemChange(item.id, 'description', e.target.value)
                    }
                    className="w-full bg-transparent border-b border-gray-300 
                               focus:border-purple-600 px-2 py-1 outline-none"
                    placeholder="Item description"
                  />
                </td>

                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLocalItemChange(item.id, 'quantity', e.target.value)
                    }
                    className="w-16 bg-transparent border-b border-gray-300 
                               focus:border-purple-600 px-2 py-1 text-center outline-none"
                  />
                </td>

                <td className="p-2 text-center">
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice || item.price}
                    onChange={(e) => {
                      handleLocalItemChange(item.id, 'unitPrice', e.target.value)
                      handleLocalItemChange(item.id, 'price', e.target.value)
                    }}
                    className="w-20 bg-transparent border-b border-gray-300 
                               focus:border-purple-600 px-2 py-1 text-center outline-none"
                  />
                </td>

                <td className="p-2 text-center">
                  CAD ${(item.quantity * (item.unitPrice || item.price || 0)).toFixed(2)}
                </td>
                
                <td className="p-2 text-center">
                  <button
                    onClick={() => onRemoveItem?.(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#F3F0FA]">
            <tr>
              <td colSpan={3} className="text-right p-2">
                Subtotal:
              </td>
              <td className="text-center p-2">CAD ${totals.subtotal.toFixed(2)}</td>
              <td />
            </tr>
            {invoiceData.isGstRegistered && (
              <>
                {totals.gst > 0 && (
                  <tr>
                    <td colSpan={3} className="text-right p-2">
                      GST (5%):
                    </td>
                    <td className="text-center p-2">CAD ${totals.gst.toFixed(2)}</td>
                    <td />
                  </tr>
                )}
                {totals.pst > 0 && (
                  <tr>
                    <td colSpan={3} className="text-right p-2">
                      PST:
                    </td>
                    <td className="text-center p-2">CAD ${totals.pst.toFixed(2)}</td>
                    <td />
                  </tr>
                )}
                {totals.hst > 0 && (
                  <tr>
                    <td colSpan={3} className="text-right p-2">
                      HST:
                    </td>
                    <td className="text-center p-2">CAD ${totals.hst.toFixed(2)}</td>
                    <td />
                  </tr>
                )}
              </>
            )}
            <tr className="font-bold">
              <td colSpan={3} className="text-right p-2">
                Total:
              </td>
              <td className="text-center p-2">CAD ${totals.total.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        <button
          onClick={onAddItem}
          className="mt-4 px-4 py-2 bg-buttonBg text-white rounded-full hover:bg-[#4a3a6d] transition-colors"
        >
          + Add Item
        </button>
      </div>

      {/* Tax Information Display */}
      {invoiceData.isGstRegistered && (
        <div className="bg-green-50 p-4 rounded mb-4">
          <h4 className="font-medium text-green-800 mb-2">Tax Calculation Summary</h4>
          <p className="text-sm text-green-700">
            Business Province: <strong>{invoiceData.businessProvince}</strong> 
            {totals.gst > 0 && ` • GST: $${totals.gst.toFixed(2)}`}
            {totals.pst > 0 && ` • PST: $${totals.pst.toFixed(2)}`}
            {totals.hst > 0 && ` • HST: $${totals.hst.toFixed(2)}`}
            {` • Total Tax: $${totals.totalTax.toFixed(2)}`}
          </p>
          {invoiceData.gstNumber && (
            <p className="text-sm text-green-700 mt-1">
              GST/HST Registration: <strong>{invoiceData.gstNumber}</strong>
            </p>
          )}
        </div>
      )}

      {!invoiceData.isGstRegistered && (
        <div className="bg-blue-50 p-4 rounded mb-4">
          <h4 className="font-medium text-blue-800 mb-2">No Tax Applied</h4>
          <p className="text-sm text-blue-700">
            Not registered for GST/HST. No tax will be applied to this invoice.
          </p>
        </div>
      )}

      {/* Compliance Notes */}
      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-medium text-gray-800 mb-2">CRA Compliance Checklist</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="space-y-1">
              <div className={`flex items-center ${invoiceData.companyName ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{invoiceData.companyName ? '✓' : '✗'}</span>
                Business name
              </div>
              <div className={`flex items-center ${invoiceData.companyAddress && invoiceData.businessProvince ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{invoiceData.companyAddress && invoiceData.businessProvince ? '✓' : '✗'}</span>
                Complete business address
              </div>
              <div className={`flex items-center ${invoiceData.invoiceNumber ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{invoiceData.invoiceNumber ? '✓' : '✗'}</span>
                Unique invoice number
              </div>
              <div className={`flex items-center ${invoiceData.invoiceDate ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{invoiceData.invoiceDate ? '✓' : '✗'}</span>
                Invoice date
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-1">
              <div className={`flex items-center ${items.length > 0 && items[0].description ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{items.length > 0 && items[0].description ? '✓' : '✗'}</span>
                Description of goods/services
              </div>
              <div className={`flex items-center ${totals.subtotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{totals.subtotal > 0 ? '✓' : '✗'}</span>
                Amount before tax
              </div>
              <div className={`flex items-center ${invoiceData.paymentTerms ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{invoiceData.paymentTerms ? '✓' : '✗'}</span>
                Payment terms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditor;