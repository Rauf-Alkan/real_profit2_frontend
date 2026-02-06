'use client';

import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Page,
  Layout,
  Text,
  BlockStack,
  Card,
  TextField,
  Select,
  Button,
  InlineStack,
  Icon,
  Box,
  Divider,
  Toast,
  Banner,
  Collapsible,
} from '@shopify/polaris';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SendIcon,
  StoreIcon,
  ChatIcon
} from '@shopify/polaris-icons';
import { api } from '@/lib/api';
export const dynamic = 'force-dynamic';

// --- REALPROFIT DATA: Finansal Odaklı FAQ ---
const faqItems = [
  {
    question: "How is 'Net Profit' calculated?",
    answer: "We calculate Net Profit by taking your Gross Revenue and subtracting COGS (Cost of Goods Sold), Shipping, Transaction Fees, and Ad Spend. For accurate results, ensure your COGS are uploaded correctly."
  },
  {
    question: "What is the difference between 'Estimated' and 'Verified' fees?",
    answer: "Initially, we show 'Estimated' fees based on average gateway rates. Once a Shopify Payout is processed, we automatically reconcile the data and update it with the 'Verified' amount actually deducted by Shopify Payments."
  },
  {
    question: "How does the 'Reverse COGS' logic work for refunds?",
    answer: "Our system is smart: when an order is refunded and items are restocked, the cost of those products is automatically added back to your profit margin to ensure your accounting stays precise."
  },
  {
    question: "How often is my financial data synced?",
    answer: "Sales and refunds are synced in real-time via Webhooks. Payout data and bank reconciliations are updated as soon as Shopify notifies us of a payout transfer."
  },
  {
    question: "Why do I see a 'Missing COGS' warning?",
    answer: "This appears when you have sales for products that don't have a defined cost. To get an accurate profit report, please go to 'Data Management' and upload your product costs via CSV."
  },
  {
    question: "How are currency conversions handled?",
    answer: "If you sell in multiple currencies, we convert every transaction to your 'Base Currency' (e.g., USD) using the real-time exchange rate at the moment of sale. This allows you to see a unified portfolio value."
  },
  {
    question: "Do I keep paying if I uninstall the app?",
    answer: "No. As soon as you uninstall the app from your Shopify Admin, Shopify automatically cancels your subscription. You will not be charged for any future billing cycles."
  },
  {
    question: "Can I track marketing expenses from Facebook or Google?",
    answer: "Yes. You can manually enter your daily ad spend via the 'Expenses' page or use our CSV upload tool to bring in marketing costs from any platform."
  },
  {
    question: "How secure is my financial data?",
    answer: "Your data is encrypted and verified using Shopify's native Session Tokens (JWT). We only process the metadata required for profit analysis and never store sensitive customer payment info."
  },
  {
    question: "Is there a limit to how many stores I can add?",
    answer: "Limits depend on your plan. Our 'Unlimited' plan allows you to manage up to 100 stores under a single Global Portfolio dashboard."
  }
];

export default function SupportPage() {
  const searchParams = useSearchParams();
  const shopFromUrl = searchParams.get('shop') || '';

  const [topic, setTopic] = useState('technical_issue');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [toastActive, setToastActive] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleToast = useCallback(() => setToastActive((active) => !active), []);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setErrorBanner("Please fill in both the Subject and Message fields.");
      return;
    }

    setLoading(true);
    setErrorBanner(null);

    try {
      // ✅ RealProfit API Path
      await api.support.sendTicket({
        topic,
        subject,
        message,
        shop: shopFromUrl
      });

      setToastActive(true);
      setSubject('');
      setMessage('');
      setTopic('technical_issue');

    } catch (error: any) {
      console.error("Support ticket error:", error);
      if (error.response?.status === 400) {
        setErrorBanner("Validation error. Please check your subject and message.");
      } else {
        setErrorBanner("Failed to send your request. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const topicOptions = [
    { label: 'Technical Issue / Bug', value: 'technical_issue' },
    { label: 'Data / Profit Discrepancy', value: 'data_issue' },
    { label: 'Billing & Subscriptions', value: 'billing' },
    { label: 'Feature Request', value: 'feature_request' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <Page
      title="Help & Support"
      subtitle="Find quick answers to your financial questions or contact support."
    >
      <Layout>

        <Layout.Section>
          <BlockStack gap="500">
            {errorBanner && (
              <Banner tone="critical" onDismiss={() => setErrorBanner(null)}>
                <p>{errorBanner}</p>
              </Banner>
            )}

            <Box paddingBlockEnd="200">
              <Text variant="headingLg" as="h2">Frequently Asked Questions</Text>
            </Box>

            <Card>
              <div style={{ padding: '0' }}>
                {faqItems.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div key={index}>
                      <div
                        onClick={() => handleFaqToggle(index)}
                        style={{
                          cursor: 'pointer',
                          padding: '20px',
                          backgroundColor: isOpen ? 'var(--p-color-bg-surface-secondary)' : 'transparent',
                          transition: 'background-color 0.2s ease-in-out',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%'
                        }}
                      >
                        <Text variant="bodyMd" fontWeight="semibold" as="span">
                          {item.question}
                        </Text>

                        <div style={{ marginLeft: '16px', display: 'flex' }}>
                          <Icon source={isOpen ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
                        </div>
                      </div>

                      <Collapsible
                        open={isOpen}
                        id={`faq-${index}`}
                        transition={{ duration: '200ms', timingFunction: 'ease-in-out' }}
                      >
                        <div style={{ padding: '0 20px 20px 20px', backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                          <Text variant="bodyMd" as="p" tone="subdued">
                            {item.answer}
                          </Text>
                        </div>
                      </Collapsible>

                      {index < faqItems.length - 1 && <Divider />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <div style={{ position: 'sticky', top: '20px' }}>
            <BlockStack gap="400">

              <Box>
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Icon source={ChatIcon} tone="base" />
                  <Text variant="headingMd" as="h2">Need more help?</Text>
                </InlineStack>
                <Box paddingBlockStart="100">
                  <Text variant="bodySm" as="p" tone="subdued">
                    Our financial analysis team responds within 24 hours.
                  </Text>
                </Box>
              </Box>

              <Card>
                <BlockStack gap="400">
                  <TextField
                    label="Store"
                    value={shopFromUrl || 'Detected automatically'}
                    disabled
                    autoComplete="off"
                    prefix={<Icon source={StoreIcon} tone="subdued" />}
                  />

                  <Select
                    label="Topic"
                    options={topicOptions}
                    onChange={setTopic}
                    value={topic}
                  />

                  <TextField
                    label="Subject"
                    value={subject}
                    onChange={setSubject}
                    placeholder="e.g. Discrepancy in Ad Spend data"
                    autoComplete="off"
                  />

                  <TextField
                    label="Message"
                    value={message}
                    onChange={setMessage}
                    multiline={4}
                    placeholder="Provide as much detail as possible..."
                    autoComplete="off"
                  />

                  <Button
                    variant="primary"
                    icon={SendIcon}
                    fullWidth
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    Send Support Ticket
                  </Button>
                </BlockStack>
              </Card>

              <Box paddingBlockStart="200">
                <Text variant="bodyXs" as="p" tone="subdued" alignment="center">
                  Your financial data security and privacy are verified by Session Tokens.
                </Text>
              </Box>

            </BlockStack>
          </div>
        </Layout.Section>

      </Layout>

      {toastActive && (
        <Toast content="Support request sent successfully!" onDismiss={toggleToast} duration={4000} />
      )}
    </Page>
  );
}