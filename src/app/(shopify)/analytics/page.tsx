'use client';

import React, { useState, useMemo } from 'react';
import {
  Page,
  Layout,
  LegacyCard,
  Grid,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Banner,
  SkeletonBodyText,
  SkeletonDisplayText,
  Badge,
  Icon,
} from '@shopify/polaris';
import {
  CalendarIcon,
  CashDollarIcon,
  ReceiptIcon,
  CreditCardIcon,
  CartIcon,
  AlertBubbleIcon,
  ChartVerticalIcon,
} from '@shopify/polaris-icons';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';
export const dynamic = 'force-dynamic';

// --- SENIOR HELPER: Para Birimi Formatlayıcı ---
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function StoreAnalytics() {
  // 1. State: Tarih Aralığı (Default: Son 30 Gün)
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: storeResponse } = useQuery({ 
    queryKey: ['currentStore'], 
    queryFn: () => api.analytics.getMe()  
  });

  // Örn: storeId URL'den veya global state'den alınır. Şimdilik 1 kabul ediyoruz.
  const storeId = storeResponse?.data.id;

  // 2. ADIM: Dükkan ID'si gelene kadar bekleyen (enabled) Query'ler ✅
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['summary', storeId, dateRange],
    queryFn: () => api.analytics.getSummary(storeId!, dateRange.start, dateRange.end),
    enabled: !!storeId, // ID yoksa istek atma, 500 hatasını önler.
  });


  const { data: trends, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['trends', storeId, dateRange],
    queryFn: () => api.analytics.getTrends(storeId!, dateRange.start, dateRange.end),
    enabled: !!storeId,
  });

  // --- UI COMPONENTS ---

  const KpiCard = ({ title, value, icon, color = 'base', subValue }: any) => (
    <LegacyCard sectioned>
      <BlockStack gap="200">
        <InlineStack align="space-between">
          <Text variant="bodyMd" as="p" tone="subdued">{title}</Text>
          <Icon source={icon} tone={color as any} />
        </InlineStack>
        <Text variant="headingLg" as="h2">{isSummaryLoading ? '---' : value}</Text>
        {subValue && (
          <Text variant="bodyXs" as="p" tone="subdued">{subValue}</Text>
        )}
      </BlockStack>
    </LegacyCard>
  );

  return (
    <Page
      title="Store Insights"
      subtitle="Detailed financial performance analysis"
      compactTitle
      primaryAction={{
        content: 'Last 30 Days',
        icon: CalendarIcon,
        onAction: () => console.log('Date Picker Trigger'),
      }}
    >
      <Layout>
        {/* 1. KRİTİK UYARI: hasMissingCogs Banner ✅ */}
        {summary?.data.hasMissingCogs && (
          <Layout.Section>
            <Banner
              title="Missing Product Costs Detected"
              tone="warning"
              action={{ content: 'Upload COGS', url: '/data' }}
              onDismiss={() => { }}
            >
              <p>Some orders are missing COGS data. Your profit margins may be higher than reality.</p>
            </Banner>
          </Layout.Section>
        )}

        {/* 2. KPI GRID (3x2 Yapısı) ✅ */}
        <Layout.Section>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard
                title="Total Revenue"
                value={formatCurrency(summary?.data.totalRevenue || 0)}
                icon={CashDollarIcon}
                subValue={`${summary?.data.orderCount || 0} Orders`}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard
                title="Net Profit"
                value={formatCurrency(summary?.data.netProfit || 0)}
                icon={ReceiptIcon}
                color={(summary?.data?.netProfit ?? 0) >= 0 ? 'success' : 'critical'}
                subValue={`ROI: ${summary?.data.roi || 0}%`}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard
                title="Net Margin"
                value={`${summary?.data.netMargin || 0}%`}
                icon={AlertBubbleIcon}
                subValue="Profit / Revenue"
              />
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard title="COGS" value={formatCurrency(summary?.data.totalCogs || 0)} icon={CartIcon} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard title="Gateway Fees" value={formatCurrency(summary?.data.totalFees || 0)} icon={CreditCardIcon} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard title="Ad Spend" value={formatCurrency(summary?.data.totalAdSpend || 0)} icon={ChartVerticalIcon} />
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        {/* 3. TREND CHART (Apple Quality Visualization) ✅ */}
        <Layout.Section>
          <LegacyCard title="Revenue vs. Profit Trend" sectioned>
            <div style={{ height: '400px', width: '100%' }}>
              {(isTrendsLoading || !storeId) ? (
                <SkeletonBodyText lines={10} />
              ) : (
                <ResponsiveContainer width="99%" height="100%">
                  <ComposedChart data={trends?.data}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3083ff" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3083ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888' }}
                      minTickGap={30}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area
                      name="Revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3083ff"
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      strokeWidth={2}
                    />
                    <Line
                      name="Net Profit"
                      type="monotone"
                      dataKey="profit"
                      stroke="#00a36d"
                      strokeWidth={3}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}