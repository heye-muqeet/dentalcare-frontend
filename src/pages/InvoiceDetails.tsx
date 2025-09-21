import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {  FiUser, FiFileText, FiDollarSign, FiPrinter, FiDownload, FiMail } from 'react-icons/fi';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const InvoiceDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state?.invoice;

  const [invoiceItems] = useState<InvoiceItem[]>([
    { description: 'Dental Consultation', quantity: 1, rate: 150.00, amount: 150.00 },
    { description: 'Teeth Cleaning', quantity: 1, rate: 120.00, amount: 120.00 },
    { description: 'X-Ray Examination', quantity: 2, rate: 75.00, amount: 150.00 },
    { description: 'Fluoride Treatment', quantity: 1, rate: 80.00, amount: 80.00 },
    { description: 'Dental Crown', quantity: 1, rate: 368.00, amount: 368.00 }
  ]);

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">
            No invoice data found. Please navigate from the invoice list.
          </p>
          <button
            onClick={() => navigate('/invoice')}
            className="bg-[#0A0F56] text-white px-6 py-2 rounded-lg hover:bg-[#232a7c] transition-colors"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Past Due':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Due':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6fb] to-[#e9eaf7] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/invoice')}
            className="flex items-center text-[#0A0F56] hover:text-[#232a7c] transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Invoices
          </button>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow">
              <FiPrinter className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow">
              <FiDownload className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button className="flex items-center space-x-2 bg-[#0A0F56] text-white px-4 py-2 rounded-lg hover:bg-[#232a7c] transition-colors shadow">
              <FiMail className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Main Invoice Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-[#0A0F56] to-[#232a7c] px-8 py-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold mb-2">Medic Clinic</div>
                <div className="text-blue-100 space-y-1 text-sm">
                  <p>123 Medical Street</p>
                  <p>Healthcare City, HC 12345</p>
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: billing@medicclinic.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Invoice Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Bill To */}
              <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <FiUser className="text-[#0A0F56] text-xl mr-3" />
                  <h3 className="text-lg font-semibold text-[#0A0F56]">Bill To</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">{invoice.client}</p>
                  <p>Email: {invoice.client.toLowerCase().replace(' ', '.')}@email.com</p>
                  <p>Phone: (704) 555-0127</p>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <FiFileText className="text-[#0A0F56] text-xl mr-3" />
                  <h3 className="text-lg font-semibold text-[#0A0F56]">Invoice Details</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created Date:</span>
                    <span className="font-semibold text-gray-900">{invoice.created}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold text-gray-900">06/15/2025</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <FiDollarSign className="text-[#0A0F56] text-xl mr-3" />
                  <h3 className="text-lg font-semibold text-[#0A0F56]">Payment Info</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Provider:</span>
                    <span className="font-semibold text-gray-900">{invoice.serviceProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-xl text-[#0A0F56]">${invoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#0A0F56] mb-4">Services & Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Rate</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-800">{item.description}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-600">${item.rate.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-800">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-br from-[#f8f9fd] to-white rounded-xl p-6 border border-gray-100 w-80">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%):</span>
                    <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-[#0A0F56]">Total:</span>
                      <span className="text-2xl font-bold text-[#0A0F56]">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#0A0F56] mb-3">Notes & Terms</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>• Payment is due within 30 days of invoice date.</p>
                <p>• Late payments may incur additional charges.</p>
                <p>• For any questions regarding this invoice, please contact our billing department.</p>
                <p>• Thank you for choosing Medic Clinic for your healthcare needs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails; 