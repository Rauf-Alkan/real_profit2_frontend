"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Page, Grid, Text, BlockStack, InlineStack, Box, IndexTable,
  Badge, Icon, Button, SkeletonBodyText, Banner,
  Divider, LegacyCard, Tooltip, Layout
} from '@shopify/polaris';
import {
  CashDollarIcon, FinanceIcon, StoreIcon, ChartLineIcon,
  CalendarIcon, ChevronRightIcon, StoreManagedIcon, InfoIcon
} from '@shopify/polaris-icons';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format, subDays } from 'date-fns';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { GlobalSummary, StorePerformance, WaterfallStep } from '@/types'; 

// --- SENIOR HELPERS ---
const formatCurrency = (value: number | undefined) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);

const formatPercent = (value: number | undefined) => {
    if (value == null) return '0%';
    return `${value.toFixed(2)}%`;
}

const getMarginTone = (margin: number | undefined) => {
  const val = margin ?? 0;
  if (val >= 20) return 'success';
  if (val >= 10) return 'info';
  if (val > 0) return 'warning';
  return 'critical';
};

const getHealthScoreTone = (score: number | undefined) => {
    const val = score ?? 0;
    if (val >= 80) return 'success';
    if (val >= 50) return 'warning';
    return 'critical';
}

// Waterfall Chart İçin Özel Tooltip
const WaterfallTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isTotal = data.type === 'INCOME' || data.label === 'Net Profit';
    return (
      <div style={{ background: '#fff', padding: '12px', border: '1px solid #e1e3e5', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Text as="p" variant="bodyMd" fontWeight="bold">{data.label}</Text>
        <Text as="p" variant="bodyLg" tone={data.type === 'EXPENSE' ? 'critical' : 'success'}>
          {isTotal ? formatCurrency(data.value) : `-${formatCurrency(data.value)}`}
        </Text>
      </div>
    );
  }
  return null;
};

export default function GlobalPortfolio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');

  // --- 🛡️ AUTH & CONNECTION LIFECYCLE ---
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [installUrl, setInstallUrl] = useState('');

  const [dateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: statusResponse } = useQuery({
    queryKey: ['installStatus', shop],
    queryFn: () => api.auth.checkStatus(),
    enabled: !!shop,
  });

  const { data: storeResponse, isLoading: isStoreLoading, isError: isStoreError } = useQuery({
    queryKey: ['currentStore'],
    queryFn: () => api.analytics.getMe(),
    retry: false,
  });

  useEffect(() => {
    if (!isStoreLoading) {
      setIsAuthChecking(false);
      if (isStoreError) {
        setAuthError(true);
        if (shop) setInstallUrl(`https://real.alkansystems.com/api/install?shop=${shop}`);
      }
    }
  }, [isStoreLoading, isStoreError, shop]);

  useEffect(() => {
    const hasAuthParams = searchParams.get('hmac') || searchParams.get('code');
    if (hasAuthParams) return;

    if (statusResponse && !statusResponse.data.installed && shop) {
      const authUrl = `https://real.alkansystems.com/api/install?shop=${shop}`;
      if (typeof window !== 'undefined' && window.top) {
        try {
          if (!window.top.location.href.includes('/install')) {
            window.top.location.href = authUrl;
          }
        } catch (e) {
          window.top.location.href = authUrl;
        }
      }
    }
  }, [statusResponse, shop, searchParams]);

  // --- DATA FETCHING ---
  const { data: globalResponse, isLoading: isGlobalLoading } = useQuery({
    queryKey: ['globalSummary', dateRange],
    queryFn: () => api.analytics.getGlobalSummary(dateRange.start, dateRange.end),
    enabled: !!storeResponse && !isStoreError, 
  });

  const storeInfo = storeResponse?.data;
  const globalData = globalResponse?.data as GlobalSummary & { globalWaterfallSteps?: WaterfallStep[] }; // Tip genişletildi ✅
  const portfolio = globalData?.storePerformances || []; 

  // --- RENDERING STATES ---
  if (isAuthChecking || isStoreLoading) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <BlockStack gap="400" align="center">
          <div className="custom-spinner"></div>
          <Text as="p" variant="bodyMd" tone="subdued">Authenticating with Shopify...</Text>
        </BlockStack>
        <style>{`.custom-spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #000; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (authError && !storeInfo) {
    return (
      <Page title="Connection Required">
        <Box paddingBlockStart="2000">
          <BlockStack align="center" inlineAlign="center" gap="400">
            <Banner tone="warning" title="Secure Link Required">
              <p>Please click the button below to authorize RealProfit to access your store data.</p>
            </Banner>
            <Button variant="primary" size="large" onClick={() => { if(window.top) window.top.location.href = installUrl; }}>
              Connect Store
            </Button>
          </BlockStack>
        </Box>
      </Page>
    );
  }

  const KpiCard = ({ title, value, icon, color = 'base', tooltip, badge }: any) => (
    <LegacyCard sectioned>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="100" blockAlign="center">
            <Text variant="bodySm" as="p" tone="subdued">{title}</Text>
            {tooltip && (
                <Tooltip content={tooltip}>
                    <Icon source={InfoIcon} tone="subdued" />
                </Tooltip>
            )}
          </InlineStack>
          <Icon source={icon} tone={color as any} />
        </InlineStack>
        <InlineStack align="start" gap="200" blockAlign="center">
             <Text variant="headingXl" as="h2" tone={color as any}>{isGlobalLoading ? '—' : value}</Text>
             {badge && !isGlobalLoading && <Badge tone={badge.tone}>{badge.text}</Badge>}
        </InlineStack>
      </BlockStack>
    </LegacyCard>
  );

  return (
    <Page
      fullWidth
      title="Global Portfolio Headquarters"
      subtitle="Bird's-eye view of your entire e-commerce empire"
      primaryAction={{ content: 'Select Period', icon: CalendarIcon, onAction: () => console.log('Date Picker') }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        <BlockStack gap="500">
          {storeInfo && <OnboardingWizard storeInfo={storeInfo} />}

          {/* 🚀 THE BIG 4 (Global Metrikler) */}
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Total Portfolio Revenue" value={formatCurrency(globalData?.totalPortfolioRevenue)} icon={CashDollarIcon} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Total Portfolio Profit" value={formatCurrency(globalData?.totalPortfolioProfit)} icon={FinanceIcon} color={(globalData?.totalPortfolioProfit ?? 0) >= 0 ? 'success' : 'critical'} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Portfolio Health" value={formatPercent(globalData?.portfolioHealthScore)} icon={StoreIcon} tooltip="Percentage of your stores that are currently profitable." badge={{ text: (globalData?.portfolioHealthScore ?? 0) >= 80 ? 'Healthy' : 'Needs Attention', tone: getHealthScoreTone(globalData?.portfolioHealthScore) }} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Blended POAS" value={`${globalData?.blendedPoas?.toFixed(2) || '0.00'}x`} icon={ChartLineIcon} color="magic" tooltip="Profit on Ad Spend aggregated across all your stores." badge={{ text: 'Overall Efficiency', tone: 'info' }} />
            </Grid.Cell>
          </Grid>

          {/* 🌊 GLOBAL WATERFALL CHART (Tüm Mağazaların Toplamı) */}
          {globalData?.globalWaterfallSteps && globalData.globalWaterfallSteps.length > 0 && (
            <LegacyCard title="Aggregated Profit Waterfall (All Stores)" sectioned>
              <div style={{ height: '350px', width: '100%' }}>
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={globalData.globalWaterfallSteps} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<WaterfallTooltip />} cursor={{fill: 'transparent'}}/>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {globalData.globalWaterfallSteps.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.type === 'INCOME' || entry.label === 'Net Profit' ? '#00a36d' : '#d82c0d'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </LegacyCard>
          )}

          {/* 🏪 MAĞAZA LİDERLİK TABLOSU (Multi-Store Özelliği) */}
          <LegacyCard title="Store Performance Rankings" sectioned>
            {isGlobalLoading ? (
              <SkeletonBodyText lines={5} />
            ) : (
              <IndexTable
                resourceName={{ singular: 'store', plural: 'stores' }}
                itemCount={portfolio.length}
                selectable={false}
                headings={[
                  { title: 'Store Domain' },
                  { title: 'Orders', alignment: 'end' },
                  { title: 'Revenue', alignment: 'end' },
                  { title: 'Net Profit', alignment: 'end' },
                  { title: 'Margin' },
                  { title: 'Action', alignment: 'end' },
                ]}
              >
                {portfolio.map((store: StorePerformance, index: number) => (
                  <IndexTable.Row id={String(store.storeId)} key={store.storeId} position={index}>
                    <IndexTable.Cell>
                      <InlineStack gap="300" blockAlign="center">
                        <Box padding="100" background="bg-surface-secondary" borderRadius="200">
                            <Icon source={StoreManagedIcon} tone="subdued" />
                        </Box>
                        <Text variant="bodyMd" fontWeight="bold" as="span">{store.shopDomain}</Text>
                      </InlineStack>
                    </IndexTable.Cell>
                    <IndexTable.Cell><Text as="span" alignment="end" tone="subdued">{store.orderCount} ords</Text></IndexTable.Cell>
                    <IndexTable.Cell><Text as="span" alignment="end">{formatCurrency(store.revenue)}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Text tone={store.profit >= 0 ? 'success' : 'critical'} alignment="end" as="span" fontWeight="bold">{formatCurrency(store.profit)}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Badge tone={getMarginTone(store.margin)}>{`${store.margin}%`}</Badge></IndexTable.Cell>
                    <IndexTable.Cell>
                      <InlineStack align="end">
                        {/* İşte Multi-Store Yönlendirme Butonu ✅ */}
                        <Button icon={ChevronRightIcon} variant="tertiary" onClick={() => router.push(`/analytics?storeId=${store.storeId}`)}>
                            Dive Deep
                        </Button>
                      </InlineStack>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            )}
          </LegacyCard>

          <Divider />
          <Box padding="400">
              <Text variant="bodySm" tone="subdued" as="p" alignment="center">RealProfit Enterprise Engine • Consolidated View</Text>
          </Box>
        </BlockStack>
      </div>
    </Page>
  );
}