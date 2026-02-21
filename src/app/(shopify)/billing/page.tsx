'use client';

import React, { useState } from 'react';
import {
  Page, Layout, LegacyCard, Text, BlockStack, InlineStack,
  Box, Button, Badge, Grid, Divider, Icon, Banner,
  SkeletonBodyText, Spinner
} from '@shopify/polaris';
import { CheckIcon, StarIcon, DiscountIcon, ShieldNoneIcon } from '@shopify/polaris-icons';
import { api } from '@/lib/api';
import { PlanType } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const dynamic = 'force-dynamic';

// 1. PLAN HİYERARŞİSİ (Upgrade/Downgrade Mantığı İçin)
const PLAN_LEVELS: Record<PlanType, number> = {
  'BASIC': 1,
  'PROFESSIONAL': 2,
  'UNLIMITED': 3,
};

const PLANS = [
  {
    type: 'BASIC' as PlanType,
    name: 'RealProfit Basic',
    price: '19.00',
    limit: '1 Store',
    features: ['Real-time Profit Tracking', 'CSV COGS Upload', 'Daily Ad Spend Sync', 'Email Support'],
    recommended: false,
  },
  {
    type: 'PROFESSIONAL' as PlanType,
    name: 'RealProfit Professional',
    price: '49.00',
    limit: '3 Stores',
    features: ['Everything in Basic', 'Global Portfolio View', 'Advanced ROI Analytics', 'Priority Support'],
    recommended: true,
  },
  {
    type: 'UNLIMITED' as PlanType,
    name: 'RealProfit Unlimited',
    price: '99.00',
    limit: 'Up to 100 Stores',
    features: ['Everything in Pro', 'Custom Financial Reports', 'Dedicated Account Manager', 'Early Access Features'],
    recommended: false,
  },
];

export default function BillingPage() {
  const [upgradingPlan, setUpgradingPlan] = useState<PlanType | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mevcut dükkan ve plan bilgisini çekiyoruz
  const { data: storeResponse, isLoading: isStoreLoading, error: storeError } = useQuery({
    queryKey: ['currentStore'],
    queryFn: () => api.analytics.getMe(),
  });

  const storeInfo = storeResponse?.data;
  const currentPlanLevel = storeInfo?.planName ? PLAN_LEVELS[storeInfo.planName as PlanType] : 0;

  // --- API İSTEĞİ VE YÖNLENDİRME MOTORU ---
  const handleUpgrade = async (plan: PlanType) => {
    if (!storeInfo?.id) return;
    setError(null);
    setUpgradingPlan(plan);

    try {
      const response = await api.billing.subscribe(storeInfo.id, plan);
      const confirmationUrl = response.data;

      // 🚀 BAŞARILI: Shopify Ödeme Onay Ekranına Güvenli Yönlendirme (iFrame Breakout)
      if (confirmationUrl) {
        setIsRedirecting(true); // Kullanıcıya yönlendirildiğini söyle
        if (typeof window !== 'undefined' && window.top) {
           window.top.location.href = confirmationUrl; 
        } else {
           window.location.href = confirmationUrl;
        }
      }
    } catch (err: any) {
      console.error('Subscription redirect failed:', err);
      // Backend'den gelen spesifik hata mesajını yakala
      const message = err.response?.data?.message || err.response?.data?.detail || "An unexpected error occurred while contacting Shopify Billing.";
      setError(message);
      setUpgradingPlan(null);
    }
  };

  // --- SENIOR HELPER: Buton Metni Belirleyici ---
  const getButtonProps = (planType: PlanType, isCurrentPlan: boolean) => {
    if (isCurrentPlan) return { label: 'Active Plan', variant: 'secondary', disabled: true };
    
    const thisPlanLevel = PLAN_LEVELS[planType];
    if (thisPlanLevel > currentPlanLevel) {
        return { label: `Upgrade to ${planType}`, variant: 'primary', disabled: false };
    } else {
        return { label: `Downgrade to ${planType}`, variant: 'secondary', disabled: false };
    }
  };

  return (
    <Page
      title="Plans & Pricing"
      subtitle="Flexible pricing for e-commerce empires of all sizes."
      fullWidth
    >
      <Layout>
        {/* HATA BANNER'I */}
        {(storeError || error) && (
          <Layout.Section>
            <Banner tone="critical" title="Subscription Error" onDismiss={() => setError(null)}>
              <p>{error || "Could not verify store information. Please refresh the page."}</p>
            </Banner>
          </Layout.Section>
        )}

        {/* YÖNLENDİRME BAŞARILI BANNER'I */}
        {isRedirecting && (
          <Layout.Section>
            <Banner tone="success" title="Redirecting to Secure Shopify Billing..." icon={ShieldNoneIcon}>
              <BlockStack gap="200">
                <p>Please wait while we transfer you to Shopify's secure approval page. You won't be charged until you approve the transaction.</p>
                <Spinner size="small" />
              </BlockStack>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Grid>
            {PLANS.map((plan) => {
              const isCurrentPlan = storeInfo?.planName === plan.type;
              const buttonProps = getButtonProps(plan.type, isCurrentPlan);

              return (
                <Grid.Cell key={plan.type} columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4 }}>
                  {/* SENIOR DOKUNUŞU: Aktif olan planı yeşil border ile öne çıkarır */}
                  <div style={{ 
                      height: '100%', 
                      border: isCurrentPlan ? '2px solid #00a36d' : '2px solid transparent',
                      borderRadius: 'var(--p-border-radius-200)',
                      transition: 'all 0.3s ease',
                      boxShadow: isCurrentPlan ? '0 0 0 2px rgba(0, 163, 109, 0.2)' : 'none'
                  }}>
                    <LegacyCard sectioned>
                      <BlockStack gap="400">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingMd" as="h3">{plan.name}</Text>
                          {isCurrentPlan ? (
                            <Badge tone="success">Current Plan</Badge> // Aktif plan yeşil badge
                          ) : plan.recommended ? (
                            <Badge tone="info" icon={StarIcon}>Popular</Badge>
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
                              <InlineStack key={idx} gap="200" align="start" wrap={false}>
                                <Box width="20px"><Icon source={CheckIcon} tone="success" /></Box>
                                <Text variant="bodyMd" as="span">{feature}</Text>
                              </InlineStack>
                            ))}
                          </BlockStack>
                        )}

                        <Box paddingBlockStart="400">
                          {/* SENIOR DOKUNUŞU: Aktif planda buton sadece bilgi verir, tıklanamaz */}
                          <Button
                            variant={buttonProps.variant as any}
                            fullWidth
                            size="large"
                            loading={upgradingPlan === plan.type}
                            disabled={isStoreLoading || buttonProps.disabled || isRedirecting || !!storeError}
                            onClick={() => handleUpgrade(plan.type)}
                          >
                            {buttonProps.label}
                          </Button>
                        </Box>
                      </BlockStack>
                    </LegacyCard>
                  </div>
                </Grid.Cell>
              );
            })}
          </Grid>
        </Layout.Section>

        {/* GÜVEN UYANDIRICI ALT BİLGİ */}
        <Layout.Section>
          <Box paddingBlockStart="400">
            <InlineStack align="center" gap="200">
              <Text variant="bodyMd" as="p" tone="subdued">
                All plans are billed in USD and securely processed by Shopify Billing. Include a 7-day free trial.
              </Text>
              <Icon source={DiscountIcon} tone="subdued" />
            </InlineStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}