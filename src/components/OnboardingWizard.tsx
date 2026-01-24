'use client';

import React from 'react';
import {
    Card,
    BlockStack,
    InlineStack,
    Box,
    Text,
    ProgressBar,
    Button,
    Icon,
    Badge,
} from '@shopify/polaris';
import {
    CheckCircleIcon,
    PlusCircleIcon, // ✅ CircleIcon yerine en uygun alternatif
    ArrowRightIcon,
    MagicIcon
} from '@shopify/polaris-icons';
import { useRouter } from 'next/navigation';

interface OnboardingWizardProps {
    storeInfo: {
        hasUploadedCogs: boolean;
        hasAddedAdSpend: boolean;
        planName: string;
    };
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ storeInfo }) => {
    const router = useRouter();

    // Adımları Tanımla
    const steps = [
        {
            id: 'cogs',
            label: 'Upload Product Costs (CSV)',
            completed: storeInfo.hasUploadedCogs,
            url: '/data',
        },
        {
            id: 'adspend',
            label: 'Input Marketing Expenses',
            completed: storeInfo.hasAddedAdSpend,
            url: '/data',
        },
        {
            id: 'billing',
            label: 'Select a Subscription Plan',
            completed: storeInfo.planName !== 'FREE',
            url: '/billing',
        },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    // Tüm adımlar bittiyse bileşeni render etme (Mühürleme)
    if (progress === 100) return null;

    return (
        <Box paddingBlockEnd="500">
            <Card>
                <BlockStack gap="400">
                    {/* Header Bölümü */}
                    <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="200">
                            <Icon source={MagicIcon} tone="info" />
                            <Text variant="headingMd" as="h2">Getting Started with RealProfit</Text>
                        </InlineStack>
                        {/* Hata Fix: Template literal kullanarak içeriği tek bir string yaptık ✅ */}
                        <Badge tone="info">
                            {`${completedCount} of ${steps.length} completed`}
                        </Badge>
                    </InlineStack>

                    <Text variant="bodyMd" as="p" tone="subdued">
                        Quickly set up your financial data to unlock deep-dive portfolio insights.
                    </Text>

                    {/* Progress Bar ✅ */}
                    <ProgressBar progress={progress} size="small" tone="highlight" />

                    {/* Adımlar Listesi ✅ */}
                    <BlockStack gap="200">
                        {steps.map((step) => (
                            <Box
                                key={step.id}
                                padding="300"
                                background={step.completed ? 'bg-surface-secondary' : 'bg-surface'}
                                borderRadius="200"
                            >
                                <InlineStack align="space-between" blockAlign="center">
                                    <InlineStack gap="300" blockAlign="center">
                                        <Icon
                                            source={step.completed ? CheckCircleIcon : PlusCircleIcon}
                                            tone={step.completed ? 'success' : 'subdued'}
                                        />
                                        {/* Hata Fix: 'as' propu ve tip dönüşümü mühürlendi ✅ */}
                                        <Text
                                            variant="bodyMd"
                                            as="span"
                                            fontWeight={step.completed ? 'regular' : 'medium'}
                                            tone={step.completed ? 'subdued' : 'base'}
                                        >
                                            {step.label}
                                        </Text>
                                    </InlineStack>
                                    {!step.completed && (
                                        <Button
                                            variant="tertiary"
                                            icon={ArrowRightIcon}
                                            onClick={() => router.push(step.url)}
                                        >
                                            Complete
                                        </Button>
                                    )}
                                </InlineStack>
                            </Box>
                        ))}
                    </BlockStack>
                </BlockStack>
            </Card>
        </Box>
    );
};