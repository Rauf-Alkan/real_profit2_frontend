// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import ShopifyProvider from '@/components/providers/ShopifyProvider';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'RealProfit - Profit Analytics',
  description: 'Real-time profit tracking for Shopify merchants.',
  other: {
    // App Bridge v4'ün uygulamayı tanıması için kritik ✅
    'shopify-api-key': process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

  return (
    <html lang="en">
      <head>
        {/* App Bridge v4 Script - Senkron yükleme en güvenlisidir ✅ */}
        {apiKey && (
          <script
            src={`https://cdn.shopify.com/shopifycloud/app-bridge.js?apiKey=${apiKey}`}
          ></script>
        )}
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        {/* DİKKAT: AppLayout ve GlobalFooter'ı ShopifyProvider'ın İÇİNE taşıdık.
          Böylece her zaman Polaris Context'i içinde kalıyorlar. 
        */}
        <ShopifyProvider>
          {children}
        </ShopifyProvider>
      </body>
    </html>
  );
}