'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppProvider as PolarisProvider, Page, Card, Layout, Text, TextField, Button, BlockStack, Box, Spinner } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
// ✅ Senin projenin i18n import şekli (Daha güvenli)
import AppLayout from '@/components/AppLayout';
import GlobalFooter from '@/components/GlobalFooter';
import enTranslations from '@shopify/polaris/locales/en.json';

const fallbackTranslations = {
  Polaris: {
    ResourceList: {
      sortingLabel: 'Sort by',
      defaultItemTagName: 'item',
      showing: 'Showing {itemsCount} {resource}',
      item: 'item',
      items: 'items',
    },
    Common: {
      checkbox: 'checkbox',
      ContextualSaveBar: { save: 'Save', discard: 'Discard' },
      TextField: { characterCount: '{count} characters' }
    },
  },
};

export default function ShopifyProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [shopInput, setShopInput] = useState('');
  
  useEffect(() => {
    setMounted(true);
    console.log("✅ ShopifyProvider mounted");
  }, []);

  const safeI18n = useMemo(() => {
    // Next.js import uyuşmazlığına karşı çift kontrol
    const rawData = (enTranslations as any).default || enTranslations;
    
    // Eğer hala boşsa veya Polaris'in beklediği anahtarlar yoksa hata fırlatmadan önce logla
    if (!rawData || Object.keys(rawData).length === 0) {
      console.error("🚨 Polaris i18n yüklenemedi! en.json içeriği boş.");
    }
    return rawData;
  }, []);

  const initialParams = useMemo(() => {
    if (typeof window === 'undefined') return { shop: null, host: '', hasParams: false, shouldRedirect: false };
    const searchParams = new URLSearchParams(window.location.search);
    const shop = searchParams.get('shop');
    const host = searchParams.get('host');
    const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

    return {
      shop,
      host,
      hasParams: Boolean(host && apiKey),
      shouldRedirect: Boolean(shop && !host && apiKey), 
    };
  }, []);

  const [isRedirecting, setIsRedirecting] = useState(initialParams.shouldRedirect);
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

  const handleRedirect = useCallback((domain: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://real.alkansystems.com/api';
    // 🛡️ KRİTİK DEĞİŞİKLİK: Senin mappings çıktına göre doğrudan /api/install'a gidiyoruz
    // İlk koddaki replace kısmını sildik çünkü senin /install yolun zaten /api altında.
    const finalUrl = `${apiUrl}/install?shop=${domain}`;
    console.log("🚀 Redirecting to:", finalUrl);
    window.location.href = finalUrl;
  }, []);

  useEffect(() => {
    if (initialParams.shouldRedirect && initialParams.shop) {
      handleRedirect(initialParams.shop);
    }
  }, [initialParams.shop, initialParams.shouldRedirect, handleRedirect]);

  // ✅ HATA ÖNLEYİCİ: PolarisProvider her zaman en dışta olmalı
  return (
    <PolarisProvider i18n={fallbackTranslations}>
      {!mounted ? null : apiKey && initialParams.hasParams ? (
        /* DURUM A: Shopify İçindeyiz - AppLayout senin projene özel eklendi ✅ */
        <AppLayout>
          {children}
          <GlobalFooter />
        </AppLayout>
      ) : isRedirecting ? (
        /* DURUM B: Yönlendirme */
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <Spinner accessibilityLabel="Yükleniyor" size="large" />
          <Text as="p" variant="bodyMd" tone="subdued">Mağazaya bağlanılıyor...</Text>
        </div>
      ) : (
        /* DURUM C: Giriş Ekranı */
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f6f6f7' }}>
           <div style={{ maxWidth: '400px', width: '100%', padding: '0 20px' }}>
            <Card>
              <Box padding="500">
                <form onSubmit={(e) => { e.preventDefault(); if(shopInput) handleRedirect(shopInput); }}>
                  <BlockStack gap="400">
                    <div style={{ textAlign: 'center' }}>
                      <Text as="h2" variant="headingLg">RealProfit Giriş 👨‍💻</Text>
                      <Text as="p" tone="subdued">Başlamak için mağaza adınızı girin</Text>
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