"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Page, Layout, LegacyCard, BlockStack, TextField, Button, 
  Select, FormLayout, Banner, List, Text, DropZone, 
  InlineStack, Box, Badge, Divider, Icon, Spinner
} from '@shopify/polaris';
import {
  UploadIcon, NoteIcon, CashDollarIcon, 
  AlertBubbleIcon, CheckCircleIcon
} from '@shopify/polaris-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AdPlatform, AdSpendRequest, CsvProcessingResult } from '@/types';

export default function DataManagement() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop');

  // --- 🛡️ ZERO-CLICK AUTH GUARD ---
  const { data: statusResponse, isLoading: isStatusLoading } = useQuery({
    queryKey: ['installStatus', shop],
    queryFn: () => api.auth.checkStatus(),
    enabled: !!shop,
  });

  useEffect(() => {
    const hasAuthParams = searchParams.get('hmac') || searchParams.get('code');
    if (hasAuthParams) return;

    if (statusResponse && !statusResponse.data.installed && shop) {
      const apiBase = 'https://real.alkansystems.com/api'; 
      const authUrl = `${apiBase}/install?shop=${shop}`;
      if (typeof window !== 'undefined' && window.top) {
        window.top.location.href = authUrl;
      }
    }
  }, [statusResponse, shop, searchParams]);

  // --- 📊 COGS UPLOAD STATE & MUTATION ---
  const [file, setFile] = useState<File | null>(null);
  const [cogsResult, setCogsResult] = useState<CsvProcessingResult | null>(null);

  const uploadCogsMutation = useMutation({
    mutationFn: (file: File) => api.cogs.uploadCsv(file),
    onSuccess: (res) => {
      setCogsResult(res.data);
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['currentStore'] });
    }
  });

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) =>
      setFile(acceptedFiles[0]),
    [],
  );

  // --- 💸 AD SPEND FORM STATE & MUTATION ---
  const [adForm, setAdForm] = useState<AdSpendRequest>({
    platform: 'FACEBOOK',
    amount: 0,
    currency: 'USD',
    spendDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  const createAdSpendMutation = useMutation({
    mutationFn: (data: AdSpendRequest) => api.expenses.createAdSpend(data),
    onSuccess: () => {
      setAdForm(prev => ({ ...prev, amount: 0, note: '' }));
      queryClient.invalidateQueries({ queryKey: ['currentStore'] });
    }
  });

  const platformOptions = [
    { label: 'Facebook Ads', value: 'FACEBOOK' },
    { label: 'Google Ads', value: 'GOOGLE' },
    { label: 'TikTok Ads', value: 'TIKTOK' },
    { label: 'Snapchat', value: 'SNAPCHAT' },
    { label: 'Pinterest', value: 'PINTEREST' },
    { label: 'Other', value: 'OTHER' },
  ];

  if (isStatusLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Page
      title="Data Management"
      subtitle="Refine your profit analytics with manual costs and expenses"
      backAction={{ content: 'Dashboard', onAction: () => window.history.back() }}
    >
      <Layout>
        {/* 1. COGS SECTION */}
        <Layout.Section>
          <LegacyCard title="Cost of Goods Sold (COGS) Upload" sectioned>
            <BlockStack gap="400">
              <Text as="p" tone="subdued">
                Upload a CSV file with "SKU" and "Cost" columns to calculate net profit accurately.
              </Text>
              
              <DropZone onDrop={handleDropZoneDrop} label="Account CSV" allowMultiple={false}>
                {file ? (
                  <Box padding="400">
                    <InlineStack gap="400" align="center">
                      <Icon source={UploadIcon} />
                      <Text as="span" variant="bodyMd" fontWeight="bold">{file.name}</Text>
                      <Button variant="tertiary" tone="critical" onClick={() => setFile(null)}>Remove</Button>
                    </InlineStack>
                  </Box>
                ) : (
                  <DropZone.FileUpload actionHint="Accepts .csv files" />
                )}
              </DropZone>

              <Button 
                variant="primary" 
                disabled={!file} 
                loading={uploadCogsMutation.isPending}
                onClick={() => file && uploadCogsMutation.mutate(file)}
              >
                Upload Costs
              </Button>

              {cogsResult && (
                <Banner 
                  tone={cogsResult.errorCount > 0 ? 'warning' : 'success'}
                  title={cogsResult.errorCount > 0 ? 'Upload Completed with Issues' : 'Success'}
                >
                  <List>
                    <List.Item>Total Rows: {cogsResult.totalRows}</List.Item>
                    <List.Item>Successfully Imported: {cogsResult.successCount}</List.Item>
                    {cogsResult.errorDetails.map((err, i) => (
                      <List.Item key={i}><Text as="p" tone="critical">{err}</Text></List.Item>
                    ))}
                  </List>
                </Banner>
              )}
            </BlockStack>
          </LegacyCard>
        </Layout.Section>

        {/* 2. AD SPEND SECTION */}
        <Layout.Section variant="oneThird">
          <LegacyCard title="Add Marketing Expense" sectioned>
            <FormLayout>
              <Select
                label="Advertising Platform"
                options={platformOptions}
                value={adForm.platform}
                onChange={(val) => setAdForm({ ...adForm, platform: val as AdPlatform })}
              />
              <TextField
                label="Amount Spent"
                type="number"
                value={String(adForm.amount)}
                onChange={(val) => setAdForm({ ...adForm, amount: Number(val) })}
                prefix={<Icon source={CashDollarIcon} />}
                autoComplete="off"
              />
              <TextField
                label="Spending Date"
                type="date"
                value={adForm.spendDate}
                onChange={(val) => setAdForm({ ...adForm, spendDate: val })}
                autoComplete="off"
              />
              <TextField
                label="Notes (Optional)"
                value={adForm.note}
                onChange={(val) => setAdForm({ ...adForm, note: val })}
                multiline={2}
                autoComplete="off"
              />
              <Button 
                variant="primary" 
                fullWidth 
                loading={createAdSpendMutation.isPending}
                onClick={() => createAdSpendMutation.mutate(adForm)}
              >
                Add Expense
              </Button>
              {createAdSpendMutation.isSuccess && (
                <Banner tone="success">Expense added to profit analysis.</Banner>
              )}
            </FormLayout>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section>
          <Divider />
          <Box paddingBlock="400">
            <Text as="p" alignment="center" tone="subdued">RealProfit Data Engine v2.0</Text>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}