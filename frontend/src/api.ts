import axios from 'axios';

// Fallback to the live Render backend URL if the Vercel environment variable is missing
const API_URL = import.meta.env.VITE_API_URL || 'https://price-tracker-backend-es5t.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
});

export interface Product {
  id: number;
  store_product_id?: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
}

export interface ProductOption {
  id: string;
  label: string;
  store_option_id?: string;
}

export interface TrackedItem {
  id: string;
  created_at: string;
  product_options: {
    id: string;
    store_option_id: string;
    label: string;
    products: {
      id: string;
      store_product_id: number;
      name: string;
      slug: string;
    }
  }
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data } = await api.get('/api/search', { params: { q: query } });
  return data;
};

export const getProductOptions = async (id: number): Promise<ProductOption[]> => {
  const { data } = await api.get(`/api/products/${id}/options`);
  return data;
};

export const trackProduct = async (
  storeProductId: number, 
  name: string, 
  slug: string, 
  optionId: string, 
  optionLabel: string
) => {
  const { data } = await api.post('/api/track', {
    storeProductId,
    name,
    slug,
    optionId,
    optionLabel
  });
  return data;
};

export const getTrackedItems = async (): Promise<TrackedItem[]> => {
  const { data } = await api.get('/api/tracked');
  return data;
};

export interface ScrapeHistory {
  id: string;
  tracked_item_id: string;
  price: number | null;
  stock: string | null;
  outcome: 'success' | 'retried' | 'failed';
  created_at: string;
}

export const getScrapeHistory = async (trackedItemId: string): Promise<ScrapeHistory[]> => {
  const { data } = await api.get(`/api/tracked/${trackedItemId}/history`);
  return data;
};
