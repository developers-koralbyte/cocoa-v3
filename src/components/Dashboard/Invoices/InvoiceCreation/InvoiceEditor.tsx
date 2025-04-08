import React from 'react';
import addLogoIcon from '../../../../assets/icons/addLogo.svg';
import { BuyerInfo } from '../../../../pages/Dashboard/InvoicePage/CreateNewInvoice'; // adjust the path if needed

interface InvoiceData {
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
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface Totals {
  subtotal: number;
  tax: number;
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
  onInvoiceDataChange: (name: string, value: string) => void;
  onItemChange?: (id: number, field: string, value: string | number) => void;
  onAddItem?: () => void;
  onRemoveItem?: (id: number) => void;
  // New props for buyer selection:
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
  const [localItems, setLocalItems] = React.useState<InvoiceItem[]>(items);

  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleLocalItemChange = (
    id: number,
    field: string,
    value: string | number
  ) => {
    setLocalItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'description' ? value : Number(value),
            }
          : item
      )
    );
    if (onItemChange) onItemChange(id, field, value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onInvoiceDataChange(name, value);
  };

  const handleSelectCatalogItem = (itemId: number, selectedId: string) => {
    const chosen = catalogItems.find((c) => c.id === selectedId);
    if (chosen) {
      handleLocalItemChange(itemId, 'description', chosen.name);
      handleLocalItemChange(itemId, 'price', chosen.price);
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

  return (
    <div className="w-full p-6 border rounded-[3.5rem] shadow-2xl">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[35px] font-bold text-[#5F4B8B]">Invoice</h1>
          <div className="space-y-2">
            {/* Invoice Number (editable if you want, or read-only if needed) */}
            <input
              type="text"
              name="invoiceNumber"
              placeholder="Invoice Number"
              value={invoiceData.invoiceNumber}
              onChange={handleInputChange}
              className="bg-transparent border-b border-gray-300 focus:border-purple-600 outline-none w-full"
            />

            {/* Invoice Date, read-only */}
            <input
              type="date"
              name="invoiceDate"
              value={invoiceData.invoiceDate}
              readOnly
              className="bg-gray-100 border-b border-gray-300 text-gray-500 w-full cursor-not-allowed"
            />

            {/* Due Date, read-only */}
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

      {/* Company & Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Left Column: Vendor Info, set to read-only */}
        <div>
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={invoiceData.companyName}
            readOnly
            className="w-full bg-gray-100 border-b border-gray-300 text-gray-600 
                       cursor-not-allowed px-2 py-1 outline-none font-bold"
          />

          <input
            type="email"
            name="companyEmail"
            placeholder="Company Email"
            value={invoiceData.companyEmail}
            readOnly
            className="w-full bg-gray-100 border-b border-gray-300 text-gray-600 
                       cursor-not-allowed px-2 py-1 outline-none"
          />

          <textarea
            name="companyAddress"
            placeholder="Company Address"
            value={invoiceData.companyAddress}
            readOnly
            rows={2}
            className="w-full bg-gray-100 border-b border-gray-300 text-gray-600 
                       cursor-not-allowed px-2 py-1 outline-none font-bold"
          />
        </div>

        {/* Right Column: Buyer Info, read-only except for dropdown selection */}
        <div className="text-right space-y-2">
          <h3 className="text-[25px] font-bold text-[#5F4B8B]">Invoice to</h3>

          {/* Buyer dropdown if chatBuyers is available */}
          {chatBuyers && chatBuyers.length > 0 && (
            <select
              className="w-full bg-transparent border-b border-gray-300 
                         focus:border-purple-600 px-2 py-1 outline-none font-bold mb-2"
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
          )}

          {/* Once selected, these fields will update from Firestore, 
              but remain read-only so the vendor can't manually change them */}
          <input
            type="text"
            name="recipientName"
            placeholder="Recipient Name"
            value={invoiceData.recipientName}
            readOnly
            className="bg-gray-100 border-b border-gray-300 text-gray-600 
                       cursor-not-allowed w-full font-bold outline-none"
          />

          <input
            type="text"
            name="recipientPhone"
            placeholder="Phone Number"
            value={invoiceData.recipientPhone}
            readOnly
            className="bg-gray-100 border-b border-gray-300 text-gray-600 
                       cursor-not-allowed w-full font-bold outline-none"
          />

          <input
            type="text"
            name="recipientAddress"
            placeholder="Address"
            value={invoiceData.recipientAddress}
            readOnly
            className="bg-gray-100 border-b border-gray-300 text-gray-600 
                       cursor-not-allowed w-full font-bold outline-none"
          />

          <input
            type="text"
            name="recipientEmail"
            placeholder="Email"
            value={invoiceData.recipientEmail}
            readOnly
            className="bg-gray-100 border-b border-gray-300 text-gray-600 
                       cursor-not-allowed w-full font-bold outline-none"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#EDE9F5] text-[#5F4B8B] font-bold">
            <tr>
              <th className="p-2">Description</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-center">Price</th>
              <th className="p-2 text-center">Tax %</th>
              <th className="p-2 text-center">Amount</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {localItems.map((item) => (
              <tr key={item.id} className="bg-white hover:bg-gray-50">
                <td className="p-2">
                  {/* Catalog-based selection */}
                  <select
                    className="w-full bg-transparent border-b border-gray-300 focus:border-purple-600 px-2 py-1 outline-none"
                    value=""
                    onChange={(e) => handleSelectCatalogItem(item.id, e.target.value)}
                  >
                    <option value="">-- Select an item --</option>
                    <optgroup label="Services">
                      {catalogItems
                        .filter((cat) => cat.type === 'service')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Products">
                      {catalogItems
                        .filter((cat) => cat.type === 'product')
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
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
                    className="mt-2 w-full bg-transparent border-b border-gray-300 
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
                    value={item.price}
                    onChange={(e) =>
                      handleLocalItemChange(item.id, 'price', e.target.value)
                    }
                    className="w-20 bg-transparent border-b border-gray-300 
                               focus:border-purple-600 px-2 py-1 text-center outline-none"
                  />
                </td>

                <td className="p-2 text-center">
                  <input
                    type="number"
                    value={item.tax}
                    onChange={(e) =>
                      handleLocalItemChange(item.id, 'tax', e.target.value)
                    }
                    className="w-16 bg-transparent border-b border-gray-300 
                               focus:border-purple-600 px-2 py-1 text-center outline-none"
                  />
                </td>

                <td className="p-2 text-center">
                  CAD {(item.quantity * item.price * (1 + item.tax / 100)).toFixed(2)}
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
              <td colSpan={4} className="text-right p-2">
                Subtotal:
              </td>
              <td className="text-center p-2">CAD {totals.subtotal.toFixed(2)}</td>
              <td />
            </tr>
            <tr>
              <td colSpan={4} className="text-right p-2">
                Tax:
              </td>
              <td className="text-center p-2">CAD {totals.tax.toFixed(2)}</td>
              <td />
            </tr>
            <tr className="font-bold">
              <td colSpan={4} className="text-right p-2">
                Total:
              </td>
              <td className="text-center p-2">CAD {totals.total.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {/* "Add Item" button is still allowed */}
        <button
          onClick={onAddItem}
          className="mt-4 px-4 py-2 bg-buttonBg text-white rounded-full hover:bg-[#4a3a6d] transition-colors"
        >
          + Add Item
        </button>
      </div>
    </div>
  );
};

export default InvoiceEditor;
