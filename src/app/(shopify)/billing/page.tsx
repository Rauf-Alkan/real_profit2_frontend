'use client';

import React, { useState } from 'react';
import {
  Page,
  Layout,
  LegacyCard,
  Text,
  BlockStack,
  InlineStack,
  Box,
  Button,
  Badge,
  Grid,
  Divider,
  Icon,
  Banner,
  SkeletonBodyText,
} from '@shopify/polaris';
import { CheckIcon, StarIcon, DiscountIcon } from '@shopify/polaris-icons';
import { api } from '@/lib/api';
import { PlanType } from '@/types';
import { useQuery } from '@tanstack/react-query';

const PLANS = [
  {
    type: 'BASIC' as PlanType,
    name: 'Multily Basic',
    price: '19.00',
    limit: '1 Store',
    features: ['Real-time Profit Tracking', 'CSV COGS Upload', 'Daily Ad Spend Sync', 'Email Support'],
    recommended: false,
  },
  {
    type: 'PROFESSIONAL' as PlanType,
    name: 'Multily Professional',
    price: '49.00',
    limit: '3 Stores',
    features: ['Everything in Basic', 'Global Portfolio View', 'Advanced ROI Analytics', 'Priority Support'],
    recommended: true,
  },
  {
    type: 'UNLIMITED' as PlanType,
    name: 'Multily Unlimited',
    price: '99.00',
    limit: 'Up to 100 Stores',
    features: ['Everything in Pro', 'Custom Financial Reports', 'Dedicated Account Manager', 'Early Access Features'],
    recommended: false,
  },
];

export default function BillingPage() {
  const [upgradingPlan, setUpgradingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Dinamik Context: Mevcut dükkan bilgisini çekiyoruz ✅
  const { data: storeResponse, isLoading: isStoreLoading, error: storeError } = useQuery({
    queryKey: ['currentStore'],
    queryFn: () => api.analytics.getMe(),
  });

  const storeInfo = storeResponse?.data;

  const handleUpgrade = async (plan: PlanType) => {
    if (!storeInfo?.id) return; // Güvenlik kilidi
    setError(null);

    setUpgradingPlan(plan);
    try {
      // 2. Dinamik storeId kullanımı ✅
      const response = await api.billing.subscribe(storeInfo.id, plan);
      const confirmationUrl = response.data;

      if (confirmationUrl) {
        window.open(confirmationUrl, '_top');
      }
    } catch (err: any) {
      console.error('Subscription redirect failed:', err);
      const message = err.response?.data?.detail || err.message || "An unexpected error occurred.";
      setError(message);
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <Page
      title="Plans & Pricing"
      subtitle="Flexible pricing for stores of all sizes."
    >
      <Layout>
        {(storeError || error) && (
  <Layout.Section>
    <Banner 
      tone="critical" 
      title="Subscription Error" 
      onDismiss={() => setError(null)}
    >
      <Text as="p">
        {error || "Could not verify store information. Please refresh the page."}
      </Text>
    </Banner>
  </Layout.Section>
)}

        <Layout.Section>
          <Grid>
            {PLANS.map((plan) => {
              const isCurrentPlan = storeInfo?.planName === plan.type;

              return (
                <Grid.Cell key={plan.type} columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4 }}>
                  <LegacyCard sectioned>
                    <BlockStack gap="400">
                      <InlineStack align="space-between">
                        <Text variant="headingMd" as="h3">{plan.name}</Text>
                        {isCurrentPlan ? (
                          <Badge tone="info">Current Plan</Badge>
                        ) : plan.recommended ? (
                          <Badge tone="success" icon={StarIcon}>Popular</Badge>
                        ) : null}
                      </InlineStack>

                      <Box paddingBlockStart="200" paddingBlockEnd="200">
                        <InlineStack align="start" blockAlign="baseline" gap="100">
                          <Text variant="heading2xl" as="p">${plan.price}</Text>
                          <Text variant="bodyMd" as="span" tone="subdued">/ month</Text>
                        </InlineStack>
                      </Box>

                      <Divider />

                      {isStoreLoading ? (
                        <SkeletonBodyText lines={4} />
                      ) : (
                        <BlockStack gap="200">
                          {plan.features.map((feature, idx) => (
                            <InlineStack key={idx} gap="200" align="start">
                              <Box width="20px"><Icon source={CheckIcon} tone="success" /></Box>
                              <Text variant="bodyMd" as="span">{feature}</Text>
                            </InlineStack>
                          ))}
                        </BlockStack>
                      )}

                      <Box paddingBlockStart="400">
                        <Button
                          variant={plan.recommended ? 'primary' : 'secondary'}
                          fullWidth
                          size="large"
                          loading={upgradingPlan === plan.type}
                          disabled={isStoreLoading || isCurrentPlan || !!storeError}
                          onClick={() => handleUpgrade(plan.type)}
                        >
                          {isCurrentPlan ? 'Active' : `Get ${plan.type.toLowerCase()}`}
                        </Button>
                      </Box>
                    </BlockStack>
                  </LegacyCard>
                </Grid.Cell>
              );
            })}
          </Grid>
        </Layout.Section>

        <Layout.Section>
          <Box paddingBlockStart="400">
            <InlineStack align="center" gap="200">
              <Text variant="bodyMd" as="p" tone="subdued">
                All plans include a 7-day free trial for new users.
              </Text>
              <Icon source={DiscountIcon} tone="subdued" />
            </InlineStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}