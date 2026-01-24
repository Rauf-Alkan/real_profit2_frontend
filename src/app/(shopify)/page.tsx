"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Page,
  Layout,
  LegacyCard,
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
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const getMarginTone = (margin: number) => {
  if (margin >= 25) return 'success';
  if (margin >= 15) return 'info';
  if (margin > 0) return 'warning';
  return 'critical';
};

export default function GlobalPortfolio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');

  const [dateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  // 1. DATA FETCHING: Store Context & Onboarding Status
  const {
    data: storeResponse,
    isLoading: isStoreLoading,
    isError: isStoreError
  } = useQuery({
    queryKey: ['currentStore'],
    queryFn: () => api.analytics.getMe(),
  });

  // 2. DATA FETCHING: Financial Analytics
  const {
    data: globalResponse,
    isLoading: isGlobalLoading,
    isError: isGlobalError,
    refetch: refetchGlobal
  } = useQuery({
    queryKey: ['globalSummary', dateRange],
    queryFn: () => api.analytics.getGlobalSummary(dateRange.start, dateRange.end),
    enabled: !!storeResponse,
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

  if (isStoreLoading) {
    return <SkeletonPage title="Loading Portfolio..." fullWidth />;
  }

  if (isGlobalError || isStoreError) {
    return (
      <Page title="Overview">
        <Banner tone="critical" title="Connection Issue" action={{ content: 'Retry', onAction: () => refetchGlobal() }}>
          <p>We couldn't securely connect to your store data. Please check your session.</p>
        </Banner>
      </Page>
    );
  }

  // Empty State
  if (!isGlobalLoading && portfolio.length === 0) {
    return (
      <Page title="Global Portfolio">
        <Box paddingBlockStart="2000">
          <EmptyState
            heading="No stores found"
            action={{ content: 'Sync Data', onAction: () => refetchGlobal() }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Ensure your Shopify stores are correctly linked to start analyzing profit.</p>
          </EmptyState>
        </Box>
      </Page>
    );
  }

  return (
    <Page
      fullWidth
      title="Global Portfolio"
      subtitle={`Performance data for your connected stores`}
      primaryAction={{
        content: 'Select Period',
        icon: CalendarIcon,
        onAction: () => { },
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        <BlockStack gap="500">

          {/* 🚀 ONBOARDING WIZARD */}
          {storeInfo && (
            <OnboardingWizard storeInfo={storeInfo} />
          )}

          {/* KPI GRID */}
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard
                title="Total Revenue"
                value={formatCurrency(globalData?.totalPortfolioRevenue ?? 0)}
                icon={CashDollarIcon}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard
                title="Total Net Profit"
                value={formatCurrency(globalData?.totalPortfolioProfit ?? 0)}
                icon={FinanceIcon}
                tone={(globalData?.totalPortfolioProfit ?? 0) >= 0 ? 'success' : 'critical'}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard
                title="Avg. Net Margin"
                value={`${globalData?.averageNetMargin ?? 0}%`}
                icon={ChartLineIcon}
                tone={getMarginTone(globalData?.averageNetMargin ?? 0)}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <KpiCard
                title="Active Stores"
                value={globalData?.activeStoreCount ?? 0}
                icon={StoreIcon}
              />
            </Grid.Cell>
          </Grid>

          {/* COMPARISON TABLE */}
          <LegacyCard title="Store Comparison" sectioned>
            {isPortfolioLoading ? (
              <SkeletonBodyText lines={6} />
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
                        <Box padding="100" background="bg-surface-secondary" borderRadius="200">
                          <Icon source={StoreManagedIcon} tone="subdued" />
                        </Box>
                        <Text variant="bodyMd" fontWeight="bold" as="span">{store.shopDomain}</Text>
                      </InlineStack>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text as="span" variant="bodyMd" alignment="end">{formatCurrency(store.revenue)}</Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text variant="bodyMd" tone={store.profit >= 0 ? 'success' : 'critical'} fontWeight="medium" alignment="end" as="span">
                        {formatCurrency(store.profit)}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Badge tone={getMarginTone(store.margin)}>
                        {`${store.margin}%`}
                      </Badge>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <InlineStack align="end">
                        <Button
                          icon={ChevronRightIcon}
                          variant="tertiary"
                          onClick={() => router.push(`/analytics?storeId=${store.storeId}`)}
                        >
                          View Details
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
            <Text variant="bodySm" tone="subdued" as="p" alignment="center">
              RealProfit Portfolio Engine • Production Build Optimized
            </Text>
          </Box>

        </BlockStack>
      </div>
    </Page>
  );
}