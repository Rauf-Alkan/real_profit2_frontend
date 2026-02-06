'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppProvider as PolarisProvider, Card, Box, BlockStack, Text, TextField, Button, Spinner } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import enTranslations from '@shopify/polaris/locales/en.json';
import AppLayout from '@/components/AppLayout';
import GlobalFooter from '@/components/GlobalFooter';


export default function ShopifyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [shopInput, setShopInput] = useState('');

  // 1. ADIM: Component Mount Kontrolü
  useEffect(() => {
    setMounted(true);
    console.log("✅ [Step 1: Hydration] Provider tarayıcıda başarıyla canlandı (mounted: true)");
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

  // 2. ADIM: URL Parametre Analizi
  const params = useMemo(() => {
    if (typeof window === 'undefined') return { shop: null, host: '', hasParams: false };
    
    const searchParams = new URLSearchParams(window.location.search);
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    const hasParams = Boolean(host && apiKey);
    const shouldAutoRedirect = Boolean(shop && !host && apiKey);

    console.log("🔍 [Step 2: URL Analysis]", { 
      shop, 
      host: host ? "Mevcut" : "Eksik", 
      apiKey: apiKey ? "Mevcut" : "Eksik",
      hasParams,
      shouldAutoRedirect 
    });
    
    return { shop, host, hasParams, shouldAutoRedirect };
  }, [apiKey]);

  const [isRedirecting, setIsRedirecting] = useState(params.shouldAutoRedirect);

  // 3. ADIM: Yönlendirme Mantığı
  const handleRedirect = useCallback((domain: string) => {
    if (!domain) {
      console.warn("⚠️ [Step 3: Redirect] Domain boş olduğu için işlem durduruldu.");
      return;
    }
    
    setIsRedirecting(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://real.alkansystems.com/api';
    const cleanDomain = domain.includes('.') ? domain : `${domain}.myshopify.com`;
    const finalUrl = `${apiUrl}/install?shop=${cleanDomain}`;
    
    console.log("🔗 [Step 3: Redirect] OAuth Yönlendirmesi Hazırlanıyor:", {
      originalInput: domain,
      cleanDomain,
      finalUrl,
      source: "handleRedirect"
    });

    window.location.href = finalUrl;
  }, []);

  // 4. ADIM: Otomatik Yönlendirme Kontrolü
  useEffect(() => {
    if (params.shouldAutoRedirect && params.shop) {
      console.log("🚀 [Step 4: Auto-Redirect] Dükkan parametresi var ama host yok. Otomatik OAuth başlatılıyor...");
      handleRedirect(params.shop);
    }
  }, [params.shouldAutoRedirect, params.shop, handleRedirect]);

  // 5. ADIM: Render Branch Loglama
  useEffect(() => {
    if (!mounted) return;
    if (apiKey && params.hasParams) {
      console.log("💎 [Step 5: UI State] Shopify Iframe (Embedded) modu aktif.");
    } else if (isRedirecting) {
      console.log("⏳ [Step 5: UI State] Yönlendirme ekranı gösteriliyor.");
    } else {
      console.log("👨‍💻 [Step 5: UI State] Manuel giriş (Login) ekranı gösteriliyor.");
    }
  }, [mounted, apiKey, params.hasParams, isRedirecting]);

  return (
    <PolarisProvider i18n={enTranslations}>
      {!mounted ? (
        <div style={{ minHeight: '100vh', background: '#f6f6f7' }} />
      ) : apiKey && params.host ? (
        <AppLayout>
          {children}
          <GlobalFooter />
        </AppLayout>
      ) : isRedirecting ? (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <Spinner size="large" />
          <Text as="p" tone="subdued">Authenticating with Shopify...</Text>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f6f6f7' }}>
          <div style={{ maxWidth: '400px', width: '100%', padding: '0 20px' }}>
            <Card>
              <Box padding="500">
                <form onSubmit={(e) => { e.preventDefault(); if(shopInput) handleRedirect(shopInput); }}>
                  <BlockStack gap="400">
                    <div style={{ textAlign: 'center' }}>
                      <Text as="h2" variant="headingLg">RealProfit Giriş</Text>
                      <Text as="p" tone="subdued">Mağaza adresinizi girerek devam edin</Text>
                    </div>
                    <TextField
                      label="Mağaza"
                      labelHidden
                      value={shopInput}
                      onChange={setShopInput}
                      placeholder="magaza.myshopify.com"
                      autoComplete="off"
                    />
                    <Button variant="primary" submit fullWidth disabled={!shopInput}>
                      Yükle / Giriş Yap
                    </Button>
                    {!apiKey && (
                       <div style={{ color: 'red', fontSize: '12px' }}>⚠️ API Key eksik!</div>
                    )}
                  </BlockStack>
                </form>
              </Box>
            </Card>
          </div>
        </div>
      )}
    </PolarisProvider>
  );
}