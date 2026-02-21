'use client';

import React, { useState } from 'react';
import {
  Page,
  Layout,
  LegacyCard,
  Grid,
  Text,
  BlockStack,
  InlineStack,
  Banner,
  SkeletonBodyText,
  Badge,
  Icon,
} from '@shopify/polaris';
import {
  CalendarIcon,
  CashDollarIcon,
  ReceiptIcon,
  CartIcon,
  AlertBubbleIcon,
  ChartVerticalIcon,
  MoneyIcon,
  DiscountIcon
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
  Legend,
  BarChart, // Waterfall için
  Bar,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

// --- SENIOR HELPERS ---
const formatCurrency = (value: number | undefined | null) => {
  if (value == null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatPercent = (value: number | undefined | null) => {
    if (value == null) return '0%';
    return `${value.toFixed(2)}%`;
}

// Waterfall Chart için özel Tooltip (Recharts)
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

export default function StoreAnalytics() {
  // 1. STATE: Tarih Aralığı
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  // 2. DATA FETCHING
  const { data: storeResponse } = useQuery({ 
    queryKey: ['currentStore'], 
    queryFn: () => api.analytics.getMe()  
  });

  const storeId = storeResponse?.data?.id;

  const { data: summaryResponse, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['summary', storeId, dateRange],
    queryFn: () => api.analytics.getSummary(storeId!, dateRange.start, dateRange.end),
    enabled: !!storeId,
  });

  const { data: trendsResponse, isLoading: isTrendsLoading } = useQuery({
    queryKey: ['trends', storeId, dateRange],
    queryFn: () => api.analytics.getTrends(storeId!, dateRange.start, dateRange.end),
    enabled: !!storeId,
  });

  const summary = summaryResponse?.data;
  const trends = trendsResponse?.data;

  // --- UI COMPONENTS ---

  const KpiCard = ({ title, value, icon, color = 'base', subValue, badge }: any) => (
    <LegacyCard sectioned>
      <BlockStack gap="200">
        <InlineStack align="space-between">
          <Text variant="bodyMd" as="p" tone="subdued">{title}</Text>
          <Icon source={icon} tone={color as any} />
        </InlineStack>
        
        {isSummaryLoading ? (
            <SkeletonBodyText lines={1} />
        ) : (
            <InlineStack align="start" gap="200" blockAlign="center">
                <Text variant="headingLg" as="h2">{value}</Text>
                {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
            </InlineStack>
        )}

        {subValue && !isSummaryLoading && (
          <Text variant="bodyXs" as="p" tone="subdued">{subValue}</Text>
        )}
      </BlockStack>
    </LegacyCard>
  );

  return (
    <Page
      title="Store Economics"
      subtitle="Deep dive into your actual profitability"
      compactTitle
      primaryAction={{
        content: 'Last 30 Days',
        icon: CalendarIcon,
        onAction: () => console.log('Date Picker Trigger (To be implemented)'),
      }}
    >
      <Layout>
        {/* 1. KRİTİK UYARI: hasMissingCogs Banner */}
        {summary?.hasMissingCogs && (
          <Layout.Section>
            <Banner
              title="Action Required: Missing Product Costs (COGS)"
              tone="critical"
              action={{ content: 'Upload COGS CSV', url: '/data/cogs' }}
            >
              <p>We detected orders in this period without cost data. Your reported profit is currently inflated. Please upload your product costs to see your true margins.</p>
            </Banner>
          </Layout.Section>
        )}

        {/* 2. THE BIG 3 (Ana Metrikler) */}
        <Layout.Section>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard
                title="Gross Sales"
                value={formatCurrency(summary?.grossSales)}
                icon={CashDollarIcon}
                subValue={`${summary?.orderCount || 0} Total Orders`}
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard
                title="Net Profit"
                value={formatCurrency(summary?.netProfit)}
                icon={MoneyIcon}
                color={(summary?.netProfit ?? 0) >= 0 ? 'success' : 'critical'}
                badge={{ 
                  text: formatPercent(summary?.netMargin), 
                  tone: (summary?.netMargin ?? 0) >= 15 ? 'success' : 'critical' 
                }}
                subValue="After ALL expenses & refunds"
              />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4 }}>
              <KpiCard
                title="Marketing Efficiency"
                value={`${summary?.poas?.toFixed(2) || '0.00'}x POAS`}
                icon={ChartVerticalIcon}
                color="magic"
                subValue={`ROAS: ${summary?.roas?.toFixed(2) || '0.00'}x`}
                badge={{ text: 'Profit on Ad Spend', tone: 'info' }}
              />
            </Grid.Cell>
          </Grid>
        </Layout.Section>

        {/* 3. EXPENSE BREAKDOWN (Gider Kırılımları) */}
        <Layout.Section>
            <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 3, lg: 3 }}>
                    <KpiCard title="Total Discounts" value={formatCurrency(summary?.totalDiscounts)} icon={DiscountIcon} />
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 3, lg: 3 }}>
                    <KpiCard title="COGS (Product Cost)" value={formatCurrency(summary?.totalCogs)} icon={CartIcon} />
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 3, lg: 3 }}>
                    <KpiCard title="Ad Spend" value={formatCurrency(summary?.totalAdSpend)} icon={AlertBubbleIcon} />
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 3, lg: 3 }}>
                    <KpiCard title="Shopify & Gateway Fees" value={formatCurrency(summary?.totalFees)} icon={ReceiptIcon} />
                </Grid.Cell>
            </Grid>
        </Layout.Section>

        {/* 4. WATERFALL CHART (Nereye Gitti Bu Para?) */}
        {summary?.waterfallSteps && summary.waterfallSteps.length > 0 && (
          <Layout.Section>
            <LegacyCard title="Profit Waterfall (Where did the money go?)" sectioned>
              <div style={{ height: '350px', width: '100%' }}>
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={summary.waterfallSteps} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} />
                      <Tooltip content={<WaterfallTooltip />} cursor={{fill: 'transparent'}}/>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {summary.waterfallSteps.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            // Gelir ve Net kâr yeşil, aradaki giderler kırmızı
                            fill={entry.type === 'INCOME' || entry.label === 'Net Profit' ? '#00a36d' : '#d82c0d'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </LegacyCard>
          </Layout.Section>
        )}

        {/* 5. TREND CHART (Zaman İçindeki Değişim) */}
        <Layout.Section>
          <LegacyCard title="Revenue vs. Profit Trend" sectioned>
            <div style={{ height: '350px', width: '100%' }}>
              {(isTrendsLoading || !storeId) ? (
                <SkeletonBodyText lines={10} />
              ) : (
                <ResponsiveContainer width="99%" height="100%">
                  <ComposedChart data={trends}>
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
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Area
                      name="Net Revenue"
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