import { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiLoader, FiChevronDown } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { fetchInvoices, markInvoiceAsPaid } from '../lib/store/slices/invoicesSlice';
import type { Invoice } from '../lib/api/services/invoices';
import toast from 'react-hot-toast';

export default function Invoice() {
  const dispatch = useAppDispatch();
  const { invoices, isLoading, error } = useAppSelector((state: RootState) => state.invoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

    // Calculate stats from real data
  const calculateStats = () => {
    const totalCount = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    const dueInvoices = invoices.filter(inv => inv.status === 'due');
    const dueCount = dueInvoices.length;
    const dueAmount = dueInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const paidCount = paidInvoices.length;
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

    return [
      { label: 'Total Invoices', count: totalCount, amount: `$${totalAmount.toFixed(2)}`, bgColor: 'bg-blue-50' },
      { label: 'Due', count: dueCount, amount: `$${dueAmount.toFixed(2)}`, bgColor: 'bg-orange-50' },
      { label: 'Paid', count: paidCount, amount: `$${paidAmount.toFixed(2)}`, bgColor: 'bg-green-50' }
    ];
  };

  const stats = calculateStats();

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      setProcessingInvoiceId(invoiceId);
      await dispatch(markInvoiceAsPaid(invoiceId)).unwrap();
      toast.success('Invoice marked as paid successfully!');
    } catch (err) {
      toast.error(err as string || 'Failed to mark invoice as paid');
    } finally {
      setProcessingInvoiceId(null);
    }
  };

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice?.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && invoice.status === 'paid') ||
      (statusFilter === 'due' && (invoice.status === 'due' || invoice.status === 'overdue'));
    
    return matchesSearch && matchesStatus;
  });

  const getFilterButtonText = () => {
    switch (statusFilter) {
      case 'paid': return 'Paid';
      case 'due': return 'Due';
      default: return 'All';
    }
  };

  const getFilterCount = (filter: 'all' | 'paid' | 'due') => {
    if (filter === 'all') return invoices.length;
    if (filter === 'paid') return invoices.filter(inv => inv.status === 'paid').length;
    if (filter === 'due') return invoices.filter(inv => inv.status === 'due' || inv.status === 'overdue').length;
    return 0;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'due':
        return 'bg-orange-100 text-orange-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unsent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number | undefined) => {
    try {
      if (!timestamp) return 'N/A';
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br min-h-screen from-[#f4f6fb] to-[#e9eaf7] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Invoices</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchInvoices())}
            className="bg-[#0A0F56] text-white px-4 py-2 rounded-lg hover:bg-[#090D45]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br min-h-screen from-[#f4f6fb] to-[#e9eaf7] flex flex-col items-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 ">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-6 shadow border border-gray-100 flex flex-col justify-center items-start min-w-[170px] max-w-[240px] w-full`}
            >
              <div className="flex items-center justify-between w-full mb-">
                <span className="text-[#0A0F56] text-xs font-semibold truncate">{stat.label}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                  {stat.count}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900 truncate">{stat.amount}</span>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-4">
          <button
            onClick={() => dispatch(fetchInvoices())}
            disabled={isLoading}
            className="flex items-center bg-gray-100 text-gray-700 text-sm rounded-lg px-4 py-2 hover:bg-gray-200 shadow disabled:opacity-50 w-full sm:w-auto"
          >
            {isLoading ? (
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
          
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="relative w-full sm:flex-initial">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-white shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full sm:w-auto filter-dropdown">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center justify-center bg-[#0A0F56] text-white text-sm rounded-lg px-4 py-2 hover:bg-[#090D45] shadow w-full sm:w-auto"
              >
                <span>{getFilterButtonText()}</span>
                <FiChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                        statusFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span>All Invoices</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {getFilterCount('all')}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('paid');
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                        statusFilter === 'paid' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span>Paid</span>
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        {getFilterCount('paid')}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter('due');
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                        statusFilter === 'due' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span>Due</span>
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                        {getFilterCount('due')}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin w-8 h-8 text-[#0A0F56] mr-3" />
              <span className="text-gray-600">Loading invoices...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== 'all' ? 'No invoices found' : 'No invoices found'}
              </p>
              {searchTerm && (
                <p className="text-gray-400 text-sm">Try adjusting your search term.</p>
              )}
              {statusFilter !== 'all' && !searchTerm && (
                <p className="text-gray-400 text-sm">
                  No {statusFilter} invoices found. Try changing the filter.
                </p>
              )}
              {searchTerm && statusFilter !== 'all' && (
                <p className="text-gray-400 text-sm">
                  Try adjusting your search term or changing the filter.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div className="bg-gray-50 grid grid-cols-[minmax(120px,1.5fr)_minmax(120px,1.5fr)_minmax(180px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(80px,0.75fr)_minmax(80px,0.75fr)] gap-x-4 px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <div className="text-left">Invoice #</div>
                  <div className="text-left">Patient</div>
                  <div className="text-left">Services</div>
                  <div className="text-left">Created</div>
                  <div className="text-left">Amount</div>
                  <div className="text-left">Status</div>
                  <div className="text-center">Actions</div>
                </div>
                
                {/* Body */}
                <div className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="grid grid-cols-[minmax(120px,1.5fr)_minmax(120px,1.5fr)_minmax(180px,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_minmax(80px,0.75fr)_minmax(80px,0.75fr)] gap-x-4 px-5 py-4 hover:bg-gray-50 items-center text-sm">
                      <div className="text-blue-600 truncate">{invoice.invoiceNumber}</div>
                      <div className="text-gray-900 truncate">{invoice?.patient?.name || 'N/A'}</div>
                      <div className="text-gray-600">
                        <div 
                          className="truncate" 
                          title={invoice?.services?.map(service => service.name).join(', ') || 'No services'}
                        >
                          {(() => {
                            const services = invoice?.services || [];
                            if (services.length === 0) return 'No services';
                            
                            // Show max 2 services, then "+" indicator
                            if (services.length <= 2) {
                              return services.map(service => service.name).join(', ');
                            } else {
                              const firstTwo = services.slice(0, 2).map(service => service.name).join(', ');
                              const remaining = services.length - 2;
                              return `${firstTwo} +${remaining} more`;
                            }
                          })()}
                        </div>
                      </div>
                      <div className="text-gray-600 truncate">{formatDate(invoice?.createdAt)}</div>
                      <div className="font-medium text-gray-900 truncate">${invoice.total.toFixed(2)}</div>
                      <div className="text-left">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex justify-center items-center space-x-1">
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            disabled={processingInvoiceId === invoice.id}
                            className="text-green-500 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                            title="Mark as Paid"
                          >
                            {processingInvoiceId === invoice.id ? (
                              <FiLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiCheck className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {/* <button className="text-blue-500 hover:text-blue-700 p-1" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 p-1" title="Download">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 8l-5-5-5 5M12 4.2v10.3" />
                          </svg>
                        </button> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 