"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Page, Grid, Text, BlockStack, InlineStack, Box, IndexTable,
  Badge, Icon, Button, SkeletonBodyText, EmptyState, Banner,
  Divider, SkeletonPage, LegacyCard
} from '@shopify/polaris';
import {
  CashDollarIcon, FinanceIcon, StoreIcon, ChartLineIcon,
  CalendarIcon, ChevronRightIcon, StoreManagedIcon
} from '@shopify/polaris-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format, subDays } from 'date-fns';
import { OnboardingWizard } from '@/components/OnboardingWizard';

// --- SENIOR HELPERS (Null-Safe) ---
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
  const [redirectTriggered, setRedirectTriggered] = useState(false);

  const [dateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  // 1. DATA FETCHING: Store Context (İlk Kapı)
  const {
    data: storeResponse,
    isLoading: isStoreLoading,
    isError: isStoreError
  } = useQuery({
    queryKey: ['currentStore'],
    queryFn: () => api.analytics.getMe(),
    retry: false, // 401 durumunda sonsuz döngüyü engellemek için şart ✅
  });

  // 2. 🚀 KRİTİK: IFRAME BREAKOUT & REDIRECT LOOP FRENİ
  useEffect(() => {
    if (!shop) {
      setIsAuthChecking(false);
      return;
    }

    // Undefined link hatasını önlemek için adresi mühürle
    const backendBase = 'https://real.api.alkansystems.com';
    const targetUrl = `${backendBase}/install?shop=${shop}`;
    setInstallUrl(targetUrl);

    // 🛡️ FREN 1: Eğer URL'de hmac/code varsa Shopify bir süreç işletiyordur, redirect yapma!
    const isInstalling = searchParams.get('hmac') || searchParams.get('code');
    if (isInstalling) {
      console.log("⏳ Shopify is processing auth params. Halting redirects.");
      setIsAuthChecking(false);
      return;
    }

    // 🛑 SİGORTA: 5 saniye içinde dükkan verisi gelmezse manuel butonu göster
    const timeoutId = setTimeout(() => {
      if (!storeResponse) {
        setAuthError(true);
        setIsAuthChecking(false);
      }
    }, 5000);

    // 🛡️ FREN 2: Eğer hata varsa ve henüz yönlendirme yapmadıysak
    if (isStoreError && !isInstalling && !redirectTriggered) {
      if (typeof window !== 'undefined' && window.top) {
        try {
          // Eğer zaten en üst pencere o adresteyse tekrar yönlendirme!
          const topUrl = window.top.location.href;
          if (topUrl.includes('/install')) {
            setIsAuthChecking(false);
            return;
          }

          console.log("🚀 Breaking out of iframe to install...");
          setRedirectTriggered(true);
          window.top.location.href = targetUrl;
        } catch (e) {
          // Cross-origin hatasında bile yönlendirmeyi dene
          setRedirectTriggered(true);
          window.top.location.href = targetUrl;
        }
      }
    } else if (storeResponse) {
      clearTimeout(timeoutId);
      setIsAuthChecking(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isStoreError, shop, searchParams, storeResponse, redirectTriggered]);

  // 3. DATA FETCHING: Analytics (Sadece dükkan doğrulanınca çalışır)
  const {
    data: globalResponse,
    isLoading: isGlobalLoading,
    isError: isGlobalError,
    refetch: refetchGlobal
  } = useQuery({
    queryKey: ['globalSummary', dateRange],
    queryFn: () => api.analytics.getGlobalSummary(dateRange.start, dateRange.end),
    enabled: !!storeResponse && !isStoreError, // Yetki yoksa API'yi yorma ✅
  });

  const {
    data: portfolioResponse,
    isLoading: isPortfolioLoading
  } = useQuery({
    queryKey: ['portfolio', dateRange],
    queryFn: () => api.analytics.getGlobalPortfolio(dateRange.start, dateRange.end),
    enabled: !!globalResponse,
  });

  const storeInfo = storeResponse?.data;
  const globalData = globalResponse?.data;
  const portfolio = portfolioResponse?.data || [];

  // --- 🔄 RENDERING STATES ---

  // A. Yükleniyor / Bağlanıyor (Spinner)
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

  // B. Manuel Bağlantı Gerekli (Hata durumunda butonu sabit tutar)
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

  // C. Dashboard Ana Render
  return (
    <Page
      fullWidth
      title="Global Portfolio"
      subtitle="Performance overview of your connected stores"
      primaryAction={{ content: 'Select Period', icon: CalendarIcon, onAction: () => {} }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        <BlockStack gap="500">
          {storeInfo && <OnboardingWizard storeInfo={storeInfo} />}

          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <LegacyCard sectioned>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodySm" as="p" tone="subdued">Total Revenue</Text>
                    <Icon source={CashDollarIcon} tone="subdued" />
                  </InlineStack>
                  <Text variant="headingXl" as="h2">{isGlobalLoading ? '—' : formatCurrency(globalData?.totalPortfolioRevenue)}</Text>
                </BlockStack>
              </LegacyCard>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <LegacyCard sectioned>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodySm" as="p" tone="subdued">Total Profit</Text>
                    <Icon source={FinanceIcon} tone={(globalData?.totalPortfolioProfit ?? 0) >= 0 ? 'success' : 'critical'} />
                  </InlineStack>
                  <Text variant="headingXl" as="h2" tone={(globalData?.totalPortfolioProfit ?? 0) >= 0 ? 'success' : 'critical'}>
                    {isGlobalLoading ? '—' : formatCurrency(globalData?.totalPortfolioProfit)}
                  </Text>
                </BlockStack>
              </LegacyCard>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <LegacyCard sectioned>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodySm" as="p" tone="subdued">Avg. Net Margin</Text>
                    <Icon source={ChartLineIcon} tone={getMarginTone(globalData?.averageNetMargin)} />
                  </InlineStack>
                  <Text variant="headingXl" as="h2">{isGlobalLoading ? '—' : `${globalData?.averageNetMargin ?? 0}%`}</Text>
                </BlockStack>
              </LegacyCard>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <LegacyCard sectioned>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodySm" as="p" tone="subdued">Active Stores</Text>
                    <Icon source={StoreIcon} tone="subdued" />
                  </InlineStack>
                  <Text variant="headingXl" as="h2">{globalData?.activeStoreCount ?? 0}</Text>
                </BlockStack>
              </LegacyCard>
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
                    <IndexTable.Cell><Text as="span" alignment="end">{formatCurrency(store.revenue)}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Text tone={store.profit >= 0 ? 'success' : 'critical'} alignment="end" as="span">{formatCurrency(store.profit)}</Text></IndexTable.Cell>
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
          <Box padding="400"><Text variant="bodySm" tone="subdued" as="p" alignment="center">RealProfit Engine • Optimized Production Build</Text></Box>
        </BlockStack>
      </div>
    </Page>
  );
}