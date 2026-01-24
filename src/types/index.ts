export type AdPlatform = 'FACEBOOK' | 'GOOGLE' | 'TIKTOK' | 'SNAPCHAT' | 'PINTEREST' | 'OTHER';

export type BillingStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';

export type FinancialEventType =
  | 'REVENUE' | 'COGS' | 'SHIPPING' | 'GATEWAY_FEE'
  | 'AD_SPEND' | 'REFUND' | 'FX_ADJUSTMENT' | 'SHOPIFY_BILLING' | 'ADJUSTMENT';

export type LedgerStatus = 'ESTIMATED' | 'VERIFIED_BY_PAYOUT' | 'VERIFIED';

export type SubscriptionStatus =
  | 'NONE' | 'ACTIVE' | 'DECLINED' | 'EXPIRED' | 'FROZEN' | 'CANCELLED' | 'REDACTED';

export type PlanType = 'BASIC' | 'PROFESSIONAL' | 'UNLIMITED';

export type PlanName = PlanType;

export interface AdSpendRequest {
  platform: AdPlatform;
  amount: number;
  currency: string; // örn: 'USD'
  spendDate: string; // ISO Date String
  note?: string;
}

export interface CsvProcessingResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errorDetails: string[]; // "Satır 45: Geçersiz fiyat formatı"
}

export interface SupportTicketRequest {
  topic: string;
  subject: string;
  message: string;
  shop?: string;
}

export interface DailyTrend {
  date: string; // ISO Date String
  revenue: number;
  profit: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  netProfit: number;
  totalCogs: number;
  totalFees: number;
  totalAdSpend: number;
  netMargin: number; // Yüzde
  roi: number;       // Yüzde
  orderCount: number;
  hasMissingCogs: boolean; // Kullanıcı uyarısı için kritik ✅
}

export interface StorePerformance {
  storeId: number;
  shopDomain: string;
  revenue: number;
  profit: number;
  margin: number;
}

export interface StoreInfo {
  id: number;
  shopDomain: string;
  planName: string;
  billingStatus: SubscriptionStatus;
  hasUploadedCogs: boolean;
  hasAddedAdSpend: boolean;
  hasUsedTrial: boolean;
}

export interface GlobalSummary {
  totalPortfolioRevenue: number;
  totalPortfolioProfit: number;
  averageNetMargin: number;
  activeStoreCount: number;
  storePerformances: StorePerformance[];
}