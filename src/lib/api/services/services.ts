import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    location: string;
    organization: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateServiceData {
    name: string;
    price: number;
    description: string;
    features: string[];
}

export const serviceService = {
    getServices: async () => {
        const response = await api.get(API_ENDPOINTS.SERVICES.BASE);
        return response.data;
    },

    getService: async (id: string) => {
        const response = await api.get(API_ENDPOINTS.SERVICES.BY_ID(id));
        return response.data;
    },

    createService: async (data: CreateServiceData) => {
        const response = await api.post(API_ENDPOINTS.SERVICES.BASE, data);
        return response.data;
    },

    updateService: async (id: string, data: Partial<CreateServiceData>) => {
        const response = await api.put(API_ENDPOINTS.SERVICES.BY_ID(id), data);
        return response.data;
    },

    deleteService: async (id: string) => {
        const response = await api.delete(API_ENDPOINTS.SERVICES.BY_ID(id));
        return response.data;
    }
}; 