import searchIcon from '../../../assets/icons/search.svg';
import downloadIcon from '../../../assets/icons/download.svg';
import deleteIcon from '../../../assets/icons/trash.svg';

interface VendorInvoice {
  id: string;
  date: string;
  invoiceNumber: string;
  productName: string;
  recipient: string;
  service: string;
  status: 'Sent, Paid' | 'Sent, Unpaid' | 'Cancelled';
  amount: string;
}

interface InvoiceTableProps {
  invoices: VendorInvoice[];
  selectedInvoices: string[];
  onSelect: (id: string) => void;
}

const VendorInvoiceTable = ({ invoices, selectedInvoices, onSelect }: InvoiceTableProps) => {
  return (
    <div>
      {/* Header with title and action buttons */}
      <div className="flex items-center mb-6 mt-4">
        <h2 className="text-[#8685C1] font-semibold text-2xl font-nunito pr-10 ">Invoices History</h2>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow">
            <img src={downloadIcon} alt="Download" className="w-[17.99px] h-[17.99px]" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow">
            <img src={deleteIcon} alt="Delete" className="w-[17.99px] h-[17.99px]" />
          </button>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(124,119,193,0.3)] hover:shadow-[0_2px_10px_rgba(124,119,193,0.5)] transition-shadow">
            <img src={searchIcon} alt="Search" className="w-[17.99px] h-[17.99px]" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-t-[1.5rem] overflow-hidden shadow-[0_2px_10px_rgba(124,119,193,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D9D9D9]">
                <th className="p-1 py-6 text-left font-nunito text-black w-14">&nbsp;</th>
                <th className="p-2 text-left font-nunito text-black w-32">Date</th>
                <th className="p-2 text-left font-nunito text-black w-32">Invoice #</th>
                <th className="p-2 text-left font-nunito text-black w-[200px]">Invoice Product Name</th>
                <th className="p-2 pl-20 text-left font-nunito text-black w-48">Recipient</th>
                <th className="p-2 text-left font-nunito text-black w-48">Service</th>
                <th className="p-2 text-left font-nunito text-black w-32">Status</th>
                <th className="p-2 text-left font-nunito text-black w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-[#E5E7EB]">
                  <td className="p-4">
                    <div className="w-5 h-5 border border-[#D1D5DB] rounded flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => onSelect(invoice.id)}
                        className="opacity-0 absolute"
                      />
                      {selectedInvoices.includes(invoice.id) && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#7C77C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{invoice.date}</td>
                  <td className="p-4">{invoice.invoiceNumber}</td>
                  <td className="p-4">{invoice.productName}</td>
                  <td className="p-4">{invoice.recipient}</td>
                  <td className="p-4">{invoice.service}</td>
                  <td className="p-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium
                      ${invoice.status === 'Sent, Paid' ? 'bg-[#ECFDF3] text-[#027A48]' : 
                        invoice.status === 'Sent, Unpaid' ? 'bg-[#EFF8FF] text-[#175CD3]' :
                        'bg-[#FEE4E2] text-[#B42318]'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">{invoice.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoiceTable;
