'use client';

import React, { useState, useCallback } from 'react';
import { Frame, Navigation } from '@shopify/polaris';
import {
  HomeIcon,
  CollectionIcon,
  ChartVerticalIcon,
  ReceiptIcon,
  CreditCardIcon
} from '@shopify/polaris-icons';
import { usePathname, useRouter } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  const toggleMobileNavigation = useCallback(
    () => setMobileNavigationActive((active) => !active),
    [],
  );

  // --- RealProfit Güncellenmiş Navigasyon ---
  const navigationMarkup = (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          {
            label: 'Global Portfolio',
            icon: HomeIcon,
            onClick: () => router.push('/'),
            selected: pathname === '/',
          },
          {
            label: 'Store Insights',
            icon: ChartVerticalIcon,
            onClick: () => router.push('/analytics'),
            selected: pathname.startsWith('/analytics'),
          },
          {
            // 🚀 Yeni Mutabakat Sekmesi Eklendi
            label: 'Payouts & Reconcile',
            icon: ReceiptIcon,
            onClick: () => router.push('/payouts'),
            selected: pathname.startsWith('/payouts'),
          },
          {
            label: 'Data Management',
            icon: CollectionIcon,
            onClick: () => router.push('/data'),
            selected: pathname.startsWith('/data'),
          },
          {
            label: 'Billing',
            icon: CreditCardIcon,
            onClick: () => router.push('/billing'),
            selected: pathname.startsWith('/billing'),
          },
        ]}
      />
    </Navigation>
  );

  return (
    <Frame
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigation}
    >
      <div style={{ paddingBottom: '30px' }}>
        {children}
      </div>
    </Frame>
  );
}