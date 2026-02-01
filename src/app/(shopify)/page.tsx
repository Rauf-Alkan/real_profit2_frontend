"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Page,
  Grid,
  Text,
  BlockStack,
  InlineStack,
  Box,
  IndexTable,
  Badge,
  Icon,
  Button,
  SkeletonBodyText,
  EmptyState,
  Banner,
  Divider,
  SkeletonPage,
  LegacyCard
} from '@shopify/polaris';
import {
  CashDollarIcon,
  FinanceIcon,
  StoreIcon,
  ChartLineIcon,
  CalendarIcon,
  ChevronRightIcon,
  StoreManagedIcon
} from '@shopify/polaris-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format, subDays } from 'date-fns';
import { OnboardingWizard } from '@/components/OnboardingWizard';

// --- SENIOR HELPERS ---
const formatCurrency = (value: number | undefined) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);

const getMarginTone = (margin: number | undefined) => {
  const val = margin ?? 0;
  if (val >= 25) return 'success';
  if (val >= 15) return 'info';
  if (val > 0) return 'warning';
  return 'critical';
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

  // 1. KRİTİK: Auth Kontrolü ve Yönlendirme Freni
  useEffect(() => {
    if (!shop) {
      setIsAuthChecking(false);
      return;
    }

    // Undefined hatasını önlemek için backend adresini mühürle
    const backendBase = 'https://real.api.alkansystems.com';
    const targetUrl = `${backendBase}/install?shop=${shop}`;
    setInstallUrl(targetUrl);

    // 🛑 SİGORTA: 5 saniye kuralı (Redirect takılırsa manuel buton açılır)
    const timeoutId = setTimeout(() => {
      console.warn("Auth check timed out. Showing manual install button.");
      setAuthError(true);
      setIsAuthChecking(false);
    }, 5000);

    const verifyConnection = async () => {
      try {
        const res = await api.analytics.getMe();
        if (res.data) {
          clearTimeout(timeoutId);
          setIsAuthChecking(false);
        }
      } catch (err: any) {
        // 401: Dükkan kurulu değilse yönlendir
        if (err.response?.status === 401) {
          // 🛡️ DÖNGÜ KESİCİ: Zaten install sayfasındaysak veya kod geldiyse yönlendirme!
          const isProcessing = window.top?.location.href.includes('/install') || 
                               window.location.search.includes('code=');

          if (!isProcessing && window.top) {
            console.log("🚀 Redirecting to install...");
            window.top.location.href = targetUrl;
          }
        }
      }
    };

    verifyConnection();
    return () => clearTimeout(timeoutId);
  }, [shop]);

  // 2. DATA FETCHING (Sadece Auth tamamsa çalışır)
  const {
    data: globalResponse,
    isLoading: isGlobalLoading,
    isError: isGlobalError,
    refetch: refetchGlobal
  } = useQuery({
    queryKey: ['globalSummary', dateRange],
    queryFn: () => api.analytics.getGlobalSummary(dateRange.start, dateRange.end),
    enabled: !isAuthChecking && !authError, // Yetki yoksa istek atma
  });

  const {
    data: portfolioResponse,
    isLoading: isPortfolioLoading
  } = useQuery({
    queryKey: ['portfolio', dateRange],
    queryFn: () => api.analytics.getGlobalPortfolio(dateRange.start, dateRange.end),
    enabled: !!globalResponse,
  });

  const storeInfo = (api.analytics.getMe as any).data; // Cache'den al
  const globalData = globalResponse?.data;
  const portfolio = portfolioResponse?.data || [];

  // --- UI COMPONENTS ---
  const KpiCard = ({ title, value, icon, tone = 'base' }: any) => (
    <LegacyCard sectioned>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="start">
          <Text variant="bodySm" as="p" tone="subdued" fontWeight="medium">{title}</Text>
          <Box background={tone === 'base' ? 'bg-surface-secondary' : (`bg-fill-${tone}-secondary` as any)} borderRadius="200" padding="100">
            <Icon source={icon} tone={tone === 'base' ? 'subdued' : (tone as any)} />
          </Box>
        </InlineStack>
        <Text variant="headingXl" as="h2" fontWeight="semibold">
          {isGlobalLoading ? '—' : value}
        </Text>
      </BlockStack>
    </LegacyCard>
  );

  // --- 🔄 RENDERING STATES ---

  // A. İlk Yükleme (Spinner)
  if (isAuthChecking) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <BlockStack gap="400" align="center">
          <div className="spinner_style"></div> {/* CSS'te tanımlı spinner */}
          <Text as="p" variant="bodyMd" tone="subdued">Connecting to RealProfit...</Text>
        </BlockStack>
        <style>{`.spinner_style { width: 30px; height: 30px; border: 3px solid #eee; border-top-color: #000; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // B. Manuel Bağlantı Gerekli (Redirect başarısız olursa)
  if (authError) {
    return (
      <Page title="Connection Issue">
        <Box paddingBlockStart="2000">
          <BlockStack align="center" inlineAlign="center" gap="400">
            <Banner tone="warning" title="Installation Required">
              <p>Please click the button below to securely link your Shopify store.</p>
            </Banner>
            <Button variant="primary" size="large" onClick={() => { if(window.top) window.top.location.href = installUrl; }}>
              Connect Store
            </Button>
          </BlockStack>
        </Box>
      </Page>
    );
  }

  // C. Data Loading (Skeleton)
  if (isGlobalLoading || isGlobalError) {
    return <SkeletonPage title="Loading Dashboard..." fullWidth />;
  }

  // D. Empty State
  if (portfolio.length === 0) {
    return (
      <Page title="Global Portfolio">
        <EmptyState
          heading="No store data found"
          action={{ content: 'Refresh Data', onAction: () => refetchGlobal() }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>Sync your Shopify data to start tracking profit margins across your stores.</p>
        </EmptyState>
      </Page>
    );
  }

  return (
    <Page
      fullWidth
      title="Global Portfolio"
      subtitle="Performance overview of your connected stores"
      primaryAction={{ content: 'Last 30 Days', icon: CalendarIcon, onAction: () => {} }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        <BlockStack gap="500">
          {storeInfo && <OnboardingWizard storeInfo={storeInfo} />}

          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Total Revenue" value={formatCurrency(globalData?.totalPortfolioRevenue)} icon={CashDollarIcon} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Total Profit" value={formatCurrency(globalData?.totalPortfolioProfit)} icon={FinanceIcon} tone={(globalData?.totalPortfolioProfit ?? 0) >= 0 ? 'success' : 'critical'} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Avg. Margin" value={`${globalData?.averageNetMargin ?? 0}%`} icon={ChartLineIcon} tone={getMarginTone(globalData?.averageNetMargin)} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard title="Active Stores" value={globalData?.activeStoreCount ?? 0} icon={StoreIcon} />
            </Grid.Cell>
          </Grid>

          <LegacyCard title="Store Comparison" sectioned>
            {isPortfolioLoading ? (
              <SkeletonBodyText lines={5} />
            ) : (
              <IndexTable
                resourceName={{ singular: 'store', plural: 'stores' }}
                itemCount={portfolio.length}
                selectable={false}
                headings={[
                  { title: 'Store Domain' },
                  { title: 'Revenue', alignment: 'end' },
                  { title: 'Net Profit', alignment: 'end' },
                  { title: 'Margin' },
                  { title: '', alignment: 'end' },
                ]}
              >
                {portfolio.map((store: any, index: number) => (
                  <IndexTable.Row id={String(store.storeId)} key={store.storeId} position={index}>
                    <IndexTable.Cell>
                      <InlineStack gap="300" blockAlign="center">
                        <Box padding="100" background="bg-surface-secondary" borderRadius="200"><Icon source={StoreManagedIcon} tone="subdued" /></Box>
                        <Text variant="bodyMd" fontWeight="bold" as="span">{store.shopDomain}</Text>
                      </InlineStack>
                    </IndexTable.Cell>
                    <IndexTable.Cell><Text as="span" variant="bodyMd" alignment="end">{formatCurrency(store.revenue)}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Text variant="bodyMd" tone={store.profit >= 0 ? 'success' : 'critical'} fontWeight="medium" alignment="end" as="span">{formatCurrency(store.profit)}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Badge tone={getMarginTone(store.margin)}>{`${store.margin}%`}</Badge></IndexTable.Cell>
                    <IndexTable.Cell>
                      <InlineStack align="end">
                        <Button icon={ChevronRightIcon} variant="tertiary" onClick={() => router.push(`/analytics?storeId=${store.storeId}`)}>Details</Button>
                      </InlineStack>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                ))}
              </IndexTable>
            )}
          </LegacyCard>
          <Divider />
          <Box padding="400"><Text variant="bodySm" tone="subdued" as="p" alignment="center">RealProfit Engine • Optimized Build</Text></Box>
        </BlockStack>
      </div>
    </Page>
  );
}