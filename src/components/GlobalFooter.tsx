'use client';

import React, { useEffect, useState } from 'react';
import { FooterHelp, Link, Box, InlineStack, Text } from '@shopify/polaris';
import { useSearchParams, useRouter } from 'next/navigation';

export default function GlobalFooter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shop, setShop] = useState<string | null>(searchParams.get('shop'));

  useEffect(() => {
    let currentShop = searchParams.get('shop');
    if (!currentShop && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      currentShop = urlParams.get('shop');
    }
    if (currentShop) {
      setShop(currentShop);
    }
  }, [searchParams]);

  // Gideceğimiz adresi hesaplıyoruz
  const supportUrl = shop ? `/support?shop=${shop}` : '/support';
  const privacyUrl = shop ? `/privacy?shop=${shop}` : '/privacy';
  const termsUrl = '/terms';

  // ✅ DÜZELTME 1: Parametre (e) kaldırıldı.
  const handlePush = (targetUrl: string) => {
    router.push(targetUrl);
  };

  const handlePrivacyClick = () => {
    // '_blank' parametresi yeni sekme açar
    window.open(privacyUrl, '_blank');
  };
  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Box paddingBlockStart="1600" paddingBlockEnd="800">
      <FooterHelp>
        {/* Linkleri yan yana ve ortalı dizmek için InlineStack kullanıyoruz */}
        {/* Gap="200" -> 8px boşluk bırakır */}
        <InlineStack gap="200" align="center" blockAlign="center">

          <Text as="span" tone="subdued">Need help?</Text>

          {/* SUPPORT LINK - url prop'u YOK (Reload yapmasın diye) */}
          <Link onClick={() => handlePush(supportUrl)}>
            Contact Support
          </Link>

          {/* AYIRAÇ (|) */}
          <Text as="span" tone="subdued">|</Text>

          {/* PRIVACY LINK - url prop'u YOK */}
          <Link onClick={handlePrivacyClick}>
            Privacy Policy
          </Link>

          <Text as="span" tone="subdued">|</Text>

          {/* 3. TERMS (Yeni Sekme - EKLENDİ) */}
          <Link onClick={() => openInNewTab(termsUrl)}>
            Terms of Service
          </Link>

        </InlineStack>
      </FooterHelp>
    </Box>
  );
}