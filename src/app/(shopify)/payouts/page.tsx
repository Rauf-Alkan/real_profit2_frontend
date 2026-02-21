'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Page, Layout, LegacyCard, BlockStack, InlineStack, Text,
  TextField, Button, Banner, SkeletonPage, SkeletonBodyText,
  Badge, Icon, Divider, Box, Grid, EmptyState
} from '@shopify/polaris';
import {
  SearchIcon, AlertCircleIcon, CheckCircleIcon, NoteIcon,
  CreditCardIcon, DeliveryIcon, AppsIcon, ShieldNoneIcon, LockIcon
} from '@shopify/polaris-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PayoutReport } from '@/types';

export const dynamic = 'force-dynamic';

// --- SENIOR HELPERS ---
const formatCurrency = (value: number | undefined | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);

export default function PayoutReconciliationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 1. STATE MANAGEMENT
  // URL'de payoutId varsa otomatik al, yoksa kullanıcının girmesini bekle
  const initialPayoutId = searchParams.get('payoutId') || '';
  const [searchInput, setSearchInput] = useState(initialPayoutId);
  const [activePayoutId, setActivePayoutId] = useState(initialPayoutId);

  // 2. DATA FETCHING (Sadece activePayoutId doluysa çalışır)
  const { 
    data: reportResponse, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['payoutDiscrepancy', activePayoutId],
    queryFn: () => api.reports.getPayoutDiscrepancy(activePayoutId),
    enabled: !!activePayoutId, // Edge Case: Boş ID ile API'yi yorma
    retry: 1, // Yanlış ID girilirse sonsuz döngüye girmesin
  });

  const report: PayoutReport | undefined = reportResponse?.data;

  // URL'i input ile senkronize et (Kullanıcı linki kopyalayıp paylaşabilsin diye)
  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setActivePayoutId(searchInput.trim());
    router.replace(`/payouts?payoutId=${searchInput.trim()}`);
  };

  // --- UI BİLEŞENLERİ (MERCHANT EMPATİSİ) ---
  
  const ReceiptLine = ({ icon, label, amount, description, tone = "critical" }: any) => {
    if (amount === 0) return null; // Sıfır olan kesintileri gösterip kalabalık yapma
    return (
      <Box paddingBlock="300">
        <InlineStack align="space-between" blockAlign="start">
          <InlineStack gap="300" blockAlign="start">
             <Box padding="100" background="bg-surface-secondary" borderRadius="200">
                <Icon source={icon} tone="subdued" />
             </Box>
             <BlockStack gap="100">
                <Text variant="bodyMd" fontWeight="bold" as="span">{label}</Text>
                <Text variant="bodySm" tone="subdued" as="span">{description}</Text>
             </BlockStack>
          </InlineStack>
          <Text variant="bodyLg" fontWeight="bold" tone={tone as any} as="span">
             -{formatCurrency(amount)}
          </Text>
        </InlineStack>
      </Box>
    );
  };

  // --- RENDERING STATES ---

  if (isLoading) {
    return (
      <SkeletonPage title="Reconciliation Report">
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned><SkeletonBodyText lines={2} /></LegacyCard>
            <LegacyCard sectioned><SkeletonBodyText lines={6} /></LegacyCard>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    );
  }

  return (
    <Page
      title="Payout Reconciliation"
      subtitle="Find out exactly where your money went before hitting your bank."
      fullWidth
    >
      <Layout>
        {/* ARAMA VE FİLTRELEME ÇUBUĞU */}
        <Layout.Section>
          <LegacyCard sectioned>
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <Box width="100%">
                <TextField
                  label="Payout ID"
                  labelHidden
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="e.g., po_123456789"
                  autoComplete="off"
                  clearButton
                  onClearButtonClick={() => setSearchInput('')}
                  prefix={<Icon source={SearchIcon} tone="subdued" />}
                />
              </Box>
              <Button variant="primary" onClick={handleSearch} disabled={!searchInput}>
                Audit Payout
              </Button>
            </InlineStack>
          </LegacyCard>
        </Layout.Section>

        {/* HATA DURUMU */}
        {isError && (
          <Layout.Section>
            <Banner tone="critical" title="Payout Not Found or Processing Error">
              <p>We couldn't find a record for this Payout ID, or the data is still being synced from Shopify. Please double-check the ID or try again later.</p>
            </Banner>
          </Layout.Section>
        )}

        {/* BAŞLANGIÇ (BOŞ) DURUMU */}
        {!activePayoutId && !isError && (
          <Layout.Section>
            <LegacyCard sectioned>
              <EmptyState
                heading="Audit a specific Shopify Payout"
                action={{ content: 'View Recent Payouts', onAction: () => console.log('Route to payouts list') }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Enter a Payout ID above to see a kuruş-by-kuruş breakdown of hidden fees, chargebacks, and actual bank deposits.</p>
              </EmptyState>
            </LegacyCard>
          </Layout.Section>
        )}

        {/* BAŞARILI RAPOR DURUMU */}
        {report && !isError && (
          <>
            {/* 1. KUSURSUZ MUTABAKAT BANNER'I (Edge Case) */}
            {report.totalDiscrepancy === 0 && (
              <Layout.Section>
                <Banner tone="success" title="Perfect Match!" icon={CheckCircleIcon}>
                  <p>Great news! Shopify deposited exactly what was expected. There are no hidden fees or discrepancies in this payout.</p>
                </Banner>
              </Layout.Section>
            )}

            <Layout.Section>
              <Grid>
                {/* SOL TARAF: ÖZET KARTLARI */}
                <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4 }}>
                  <BlockStack gap="400">
                    <LegacyCard sectioned>
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3" tone="subdued">Expected Revenue</Text>
                        <Text variant="headingXl" as="h2">{formatCurrency(report.expectedRevenue)}</Text>
                        <Text variant="bodySm" as="p" tone="subdued">Calculated from your verified orders.</Text>
                      </BlockStack>
                    </LegacyCard>

                    <LegacyCard sectioned>
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3" tone="subdued">Actual Bank Deposit</Text>
                        <Text variant="headingXl" as="h2" tone="success">{formatCurrency(report.actualPayout)}</Text>
                        <Text variant="bodySm" as="p" tone="subdued">What Shopify actually sent to your bank.</Text>
                      </BlockStack>
                    </LegacyCard>

                    <LegacyCard sectioned >
                      <BlockStack gap="200">
                        <InlineStack align="space-between">
                          <Text variant="headingSm" as="h3" tone="critical">Total Discrepancy (Missing)</Text>
                          {report.totalDiscrepancy > 0 && <Icon source={AlertCircleIcon} tone="critical" />}
                        </InlineStack>
                        <Text variant="headingXl" as="h2" tone="critical">-{formatCurrency(report.totalDiscrepancy)}</Text>
                        <Text variant="bodySm" as="p" tone="subdued">The money lost to hidden Shopify deductions.</Text>
                      </BlockStack>
                    </LegacyCard>
                  </BlockStack>
                </Grid.Cell>

                {/* SAĞ TARAF: DETAYLI FATURA / KAYIP LİSTESİ */}
                <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 8 }}>
                  <LegacyCard title="Discrepancy Breakdown (The Receipt)" sectioned>
                    {report.totalDiscrepancy === 0 ? (
                      <Box paddingBlock="400">
                        <BlockStack align="center" inlineAlign="center" gap="200">
                          <Icon source={CheckCircleIcon} tone="success" />
                          <Text variant="bodyMd" tone="subdued" as="p">No missing funds to display.</Text>
                        </BlockStack>
                      </Box>
                    ) : (
                      <BlockStack gap="0">
                        <ReceiptLine
                          icon={CreditCardIcon}
                          label="Hidden Gateway Fees"
                          amount={report.feeDifferences}
                          description="Shopify charged more credit card fees than initially estimated (often due to international or AMEX cards)."
                        />
                        {report.feeDifferences > 0 && <Divider />}

                        <ReceiptLine
                          icon={DeliveryIcon}
                          label="Shipping Label Deductions"
                          amount={report.shippingLabelCosts}
                          description="Shopify directly deducted the cost of shipping labels purchased through their platform."
                        />
                        {report.shippingLabelCosts > 0 && <Divider />}

                        <ReceiptLine
                          icon={AppsIcon}
                          label="App Subscription Costs"
                          amount={report.appSubscriptionCosts}
                          description="Monthly billing for third-party Shopify Apps deducted from your balance."
                        />
                        {report.appSubscriptionCosts > 0 && <Divider />}

                        <ReceiptLine
                          icon={ShieldNoneIcon}
                          label="Chargebacks & Disputes"
                          amount={report.chargebacks}
                          description="Money pulled back forcefully due to customer chargebacks or bank disputes."
                        />
                        {report.chargebacks > 0 && <Divider />}

                        <ReceiptLine
                          icon={LockIcon}
                          label="Shopify Reserve Holds"
                          amount={report.reserveHolds}
                          description="Shopify withheld this amount as a security reserve. It will be released in a future payout."
                        />
                      </BlockStack>
                    )}
                  </LegacyCard>
                  
                  {/* Satıcıya Tavsiye Alanı */}
                  {report.reserveHolds > 0 && (
                     <Box paddingBlockStart="400">
                       <Banner tone="info" title="Why is Shopify holding my money?">
                         <p>We noticed a <strong>Reserve Hold</strong>. Shopify sometimes holds a percentage of your payout (usually 5-10% for 30-90 days) if they notice unusual sales spikes or high chargeback rates. Keep an eye on your chargeback ratios!</p>
                       </Banner>
                     </Box>
                  )}
                </Grid.Cell>
              </Grid>
            </Layout.Section>
          </>
        )}
      </Layout>
    </Page>
  );
}