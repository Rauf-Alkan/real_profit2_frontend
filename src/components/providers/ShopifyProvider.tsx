'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppProvider as PolarisProvider, Card, Box, BlockStack, Text, TextField, Button } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

import AppLayout from '@/components/AppLayout';
import GlobalFooter from '@/components/GlobalFooter';

export default function ShopifyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [shopInput, setShopInput] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

  const params = useMemo(() => {
    if (typeof window === 'undefined') return { shop: null, host: null };
    const searchParams = new URLSearchParams(window.location.search);
    return {
      shop: searchParams.get('shop'),
      host: searchParams.get('host'),
    };
  }, []);

  const handleRedirect = useCallback((domain: string) => {
    if (!domain) return;
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL;
    const cleanDomain = domain.includes('.') ? domain : `${domain}.myshopify.com`;
    window.location.href = `${apiUrl}/install?shop=${cleanDomain}`;
  }, []);

  // 🚨 DEFANSİF i18n: enTranslations objesinin varlığını garantiye alıyoruz
  const translations = useMemo(() => enTranslations || {}, []);

  // 1. ADIM: PolarisProvider'ı ASLA bir koşula (if) bağlama. 
  // O her zaman orada durmalı ki alt bileşenler hata vermesin.
  if (!mounted) return null;

  return (
    // ✅ i18n nesnesini doğrudan vererek "No i18n provided" hatasını bitiriyoruz
    <PolarisProvider i18n={enTranslations}>
      {apiKey && params.host ? (
        <AppLayout>
          {children}
          <GlobalFooter />
        </AppLayout>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f6f6f7' }}>
          <div style={{ width: '400px', padding: '0 20px' }}>
            <Card>
              <Box padding="500">
                <BlockStack gap="400">
                  <div style={{ textAlign: 'center' }}>
                    <Text as="h2" variant="headingLg">RealProfit Giriş 👨‍💻</Text>
                  </div>
                  <TextField
                    label="Mağaza"
                    labelHidden
                    value={shopInput}
                    onChange={setShopInput}
                    placeholder="magaza.myshopify.com"
                    autoComplete="off"
                  />
                  <Button variant="primary" onClick={() => handleRedirect(shopInput)} fullWidth>
                    Yükle / Giriş Yap
                  </Button>
                </BlockStack>
              </Box>
            </Card>
          </div>
        </div>
      )}
    </PolarisProvider>
  );
}