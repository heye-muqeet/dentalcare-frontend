import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import type { Patient } from './patients';
import type { Treatment } from './treatments';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  treatment: Treatment;
  created: string;
  total: number;
  status: 'due' | 'overdue' | 'paid';
  patient?: Patient;
  services?: Array<{
    name: string;
    price: number;
  }>;
  createdAt?: number;
  updatedAt?: number;
}

export const invoiceService = {
  getInvoices: async () => {
    const response = await api.get(API_ENDPOINTS.INVOICES.BASE);
    return response.data;
  },

  markAsPaid: async (id: string) => {
    const response = await api.put(API_ENDPOINTS.INVOICES.MARK_PAID(id));
    return response.data;
  }
}; 