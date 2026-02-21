// ==========================================
// ENUMS & UNIONS
// ==========================================
export type AdPlatform = 'FACEBOOK' | 'GOOGLE' | 'TIKTOK' | 'SNAPCHAT' | 'PINTEREST' | 'OTHER';

export type BillingStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED';

export type LedgerStatus = 'ESTIMATED' | 'VERIFIED_BY_PAYOUT' | 'VERIFIED';

export type SubscriptionStatus =
  | 'NONE' | 'ACTIVE' | 'DECLINED' | 'EXPIRED' | 'FROZEN' | 'CANCELLED' | 'REDACTED';

export type PlanType = 'BASIC' | 'PROFESSIONAL' | 'UNLIMITED';
export type PlanName = PlanType;

export type FinancialDirection = 'IN' | 'OUT';

// Backend Enum: FinancialEventType ile %100 eşleşti ✅
export type FinancialEventType =
  | 'REVENUE' | 'COGS' | 'SHIPPING' | 'GATEWAY_FEE' | 'AD_SPEND' | 'REFUND'
  | 'SHOPIFY_BILLING' | 'ADJUSTMENT' | 'GENERAL_REFUND' | 'DISCOUNT'
  | 'CANCELLATION_ADJUSTMENT' | 'SHIPPING_REFUND' | 'TAX' | 'ADJUSTMENT_GENERAL'
  | 'SHIPPING_LABEL' | 'APP_SUBSCRIPTION' | 'CHARGEBACK' | 'RESERVE_HOLD';

export type SyncStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type WaterfallStepType = 'INCOME' | 'EXPENSE' | 'TOTAL';

// ==========================================
// REQUEST INTERFACES
// ==========================================
export interface AdSpendRequest {
  platform: AdPlatform;
  amount: number;
  currency: string;
  spendDate: string; // ISO Date String
  note?: string;
}

export interface SupportTicketRequest {
  topic: string;
  subject: string;
  message: string;
  shop?: string;
}

// ==========================================
// RESPONSE INTERFACES (DTO MAPPINGS)
// ==========================================

export interface CsvProcessingResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errorDetails: string[];
}

// Backend DTO: WaterfallStepDto ✅
export interface WaterfallStep {
  label: string;
  value: number;
  type: WaterfallStepType;
}

// Backend DTO: DashboardSummaryDto ✅
export interface DashboardSummary {
  grossSales: number;
  netRevenue: number;
  netProfit: number;
  totalCogs: number;
  totalFees: number;
  totalAdSpend: number;
  totalTaxes: number;
  totalDiscounts: number;
  netMargin: number; // %
  roas: number;
  poas: number;
  orderCount: number;
  hasMissingCogs: boolean;
  waterfallSteps: WaterfallStep[];
}

export interface DailyTrend {
  date: string; // ISO Date String
  revenue: number;
  profit: number;
}

// Backend DTO: StorePerformanceDto ✅
export interface StorePerformance {
  storeId: number;
  shopDomain: string;
  revenue: number;
  profit: number;
  margin: number;
  orderCount: number;
}

// Backend DTO: GlobalSummaryDto ✅
export interface GlobalSummary {
  totalPortfolioRevenue: number;
  totalPortfolioProfit: number;
  portfolioHealthScore: number;
  blendedPoas: number;
  activeStoreCount: number;
  storePerformances: StorePerformance[];
}

// Backend DTO: ShopInfoDto ✅
export interface StoreInfo {
  id: number;
  email?: string;
  currency?: string;
  shopName?: string;
  shopDomain: string;
  planName: string;
  billingStatus: SubscriptionStatus;
  hasUsedTrial: boolean;
  hasUploadedCogs: boolean;
  hasAddedAdSpend: boolean;
}

// Backend DTO: PayoutReportDto (Yeni Eklendi) ✅
export interface PayoutReport {
  payoutId: string;
  expectedRevenue: number;
  actualPayout: number;
  totalDiscrepancy: number;
  feeDifferences: number;
  shippingLabelCosts: number;
  reserveHolds: number;
  appSubscriptionCosts: number;
  chargebacks: number;
}