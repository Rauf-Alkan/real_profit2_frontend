import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  DashboardSummary,
  DailyTrend,
  GlobalSummary,
  StorePerformance,
  AdSpendRequest,
  CsvProcessingResult,
  SupportTicketRequest,
  PlanType,
  StoreInfo
} from '@/types';

type ShopifyWindow = Window & {
  shopify?: {
    idToken?: () => Promise<string>;
  };
};

const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

/**
 * Shopify App Bridge v4 Token Helper
 */
async function getSessionToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const shopify = (window as ShopifyWindow).shopify;
  if (!shopify || !shopify.idToken) return null;

  try {
    return await shopify.idToken();
  } catch (error) {
    console.error('Session Token alınamadı:', error);
    return null;
  }
}

/**
 * URL'den shop domain bilgisini çeker (Header'lar için yardımcı)
 */
const getShopFromUrl = () => {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('shop') || '';
};

// =========================================================
// 1. REQUEST INTERCEPTOR: Auth & Custom Headers
// =========================================================
axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    // A. JWT Bearer Token ekle
    const token = await getSessionToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // B. Backend Controller'ların beklediği özel header'ı ekle ✅
    const shop = getShopFromUrl();
    if (shop) {
      config.headers.set('X-Shopify-Shop-Domain', shop);
    }

  } catch (error) {
    console.error('Request interceptor hatası:', error);
  }
  return config;
});

// =========================================================
// 2. RESPONSE INTERCEPTOR: Global Hata & Iframe Breakout
// =========================================================
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Null kontrolü: error.response var mı?
    if (error.response && typeof window !== 'undefined') {
      const status = error.response.status;
      const shop = getShopFromUrl();

      // 401 Unauthorized: Yetki bittiyse iframe'i kırıp yeniden kurdur
      if (status === 401 && shop) {
       console.warn("401 Hatası alındı, sayfa bazlı yönlendirme bekleniyor."); 
     }
    }
    return Promise.reject(error);
  }
);

// 3. API METODLARI (RealProfit Servis Katmanı)
// =========================================================
export const api = {

  // --- ANALYTICS (DashboardController) ---
  analytics: {
    // Tek mağaza özeti
    getSummary: (storeId: number, startDate: string, endDate: string) =>
      axiosInstance.get<DashboardSummary>(`/analytics/summary/${storeId}`, {
        params: { startDate, endDate }
      }),

    // Günlük grafik verisi
    getTrends: (storeId: number, startDate: string, endDate: string) =>
      axiosInstance.get<DailyTrend[]>(`/analytics/trends/${storeId}`, {
        params: { startDate, endDate }
      }),

    // Tüm portföy özeti (Global Dashboard)
    getGlobalSummary: (startDate: string, endDate: string) =>
      axiosInstance.get<GlobalSummary>('/analytics/global', {
        params: { startDate, endDate }
      }),

    // Mağaza karşılaştırma listesi
    getGlobalPortfolio: (startDate: string, endDate: string) =>
      axiosInstance.get<StorePerformance[]>('/analytics/portfolio', {
        params: { startDate, endDate }
      }),

    getMe: () =>
      axiosInstance.get<StoreInfo>('/analytics/me'),
  },

  // --- COGS MANAGEMENT (CogsController) ---
  cogs: {
    uploadCsv: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return axiosInstance.post<CsvProcessingResult>('/cogs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  },

  // --- EXPENSES (ExpenseController) ---
  expenses: {
    createAdSpend: (data: AdSpendRequest) =>
      axiosInstance.post('/expenses/adspend', data),
  },

  // --- BILLING (BillingController) ---
  billing: {
    subscribe: (storeId: number, plan: PlanType) =>
      axiosInstance.post<string>('/billing/subscribe', null, {
        params: { storeId, plan }
      }),
  },

  // --- SUPPORT (SupportController) ---
  support: {
    sendTicket: (data: SupportTicketRequest) =>
      axiosInstance.post('/support/ticket', data),
  },
  auth: {
    checkStatus: () => axiosInstance.get<{ installed: boolean }>('/auth/status'),
  }
};

export default api;